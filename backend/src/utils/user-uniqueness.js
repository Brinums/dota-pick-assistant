import { prisma } from "../lib/prisma.js";

function toConflictIssue(field, message) {
  return {
    field,
    path: [field],
    message,
  };
}

export async function findUserCredentialConflicts({ email, username, excludeUserId } = {}) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedUsername = typeof username === "string" ? username.trim() : "";
  const normalizedExcludeUserId = Number(excludeUserId || 0);
  const conflicts = [];

  if (normalizedEmail) {
    const emailConflict = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
        ...(normalizedExcludeUserId ? { id: { not: normalizedExcludeUserId } } : {}),
      },
      select: { id: true },
    });

    if (emailConflict) {
      conflicts.push(toConflictIssue("email", "E-pasts jau tiek izmantots."));
    }
  }

  if (normalizedUsername) {
    const usernameConflict = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: "insensitive",
        },
        ...(normalizedExcludeUserId ? { id: { not: normalizedExcludeUserId } } : {}),
      },
      select: { id: true },
    });

    if (usernameConflict) {
      conflicts.push(toConflictIssue("username", "Lietotājvārds jau tiek izmantots."));
    }
  }

  return conflicts;
}

export async function findUserCredentialConflict({ email, username, excludeUserId } = {}) {
  const conflicts = await findUserCredentialConflicts({ email, username, excludeUserId });

  if (!conflicts.length) {
    return null;
  }

  return {
    field: conflicts[0]?.path?.[0],
    message: conflicts.map((issue) => issue.message).join(" "),
    errors: conflicts,
  };
}
