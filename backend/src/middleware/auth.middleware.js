import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  try {
    const payload = verifyAccessToken(token);
    if (!payload?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    return next();
  };
}
