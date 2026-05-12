import { prisma } from "../lib/prisma.js";

export async function findUserCredentialConflict({ email, username, excludeUserId } = {}) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedUsername = typeof username === "string" ? username.trim() : "";

  const checks = [];
  if (normalizedEmail) {
    checks.push({ email: normalizedEmail });
  }
  if (normalizedUsername) {
    checks.push({ username: { equals: normalizedUsername, mode: "insensitive" } });
  }

  if (!checks.length) {
    return null;
  }

  const where = {
    OR: checks,
    ...(excludeUserId ? { id: { not: Number(excludeUserId) } } : {}),
  };

  const conflict = await prisma.user.findFirst({
    where,
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  if (!conflict) {
    return null;
  }

  if (normalizedEmail && conflict.email.toLowerCase() === normalizedEmail) {
    return {
      field: "email",
      message: "Email is already in use",
    };
  }

  if (
    normalizedUsername &&
    conflict.username &&
    conflict.username.toLowerCase() === normalizedUsername.toLowerCase()
  ) {
    return {
      field: "username",
      message: "Username is already in use",
    };
  }

  return {
    field: "username",
    message: "Email or username is already in use",
  };
}
