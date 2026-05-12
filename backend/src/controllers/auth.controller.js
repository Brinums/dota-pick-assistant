import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { findUserCredentialConflict } from "../utils/user-uniqueness.js";
import { signAccessToken } from "../utils/jwt.js";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long")
    .regex(
      /^[A-Za-z0-9_.-]+$/,
      "Username can only contain letters, numbers, underscore, dot, and dash",
    ),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

function getZodIssues(error) {
  return Array.isArray(error.issues) ? error.issues : error.errors || [];
}

function getUniqueConstraintError(target) {
  const field = target === "email" || target === "username" ? target : undefined;
  const messageByField = {
    email: "E-pasts jau tiek izmantots.",
    username: "Lietotājvārds jau tiek izmantots.",
  };
  const message = field ? messageByField[field] : "E-pasts vai lietotājvārds jau tiek izmantots.";

  return {
    message,
    field,
    errors: field ? [{ field, path: [field], message }] : [],
  };
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    const normalizedUsername = username.trim();
    const normalizedEmail = email.toLowerCase();

    const conflict = await findUserCredentialConflict({
      username: normalizedUsername,
      email: normalizedEmail,
    });

    if (conflict) {
      return res.status(409).json(conflict);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usersCount = await prisma.user.count();
    const nextRole = usersCount === 0 ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        role: nextRole,
      },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });

    const token = signAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      message: "Registration successful",
      user,
      token,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: getZodIssues(error) });
    }

    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target[0] : undefined;
      return res.status(409).json(getUniqueConstraintError(target));
    }

    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, username: true, email: true, role: true, passwordHash: true, createdAt: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid login or password" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid login or password" });
    }

    const token = signAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: getZodIssues(error) });
    }

    return next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ data: user });
  } catch (error) {
    return next(error);
  }
}
