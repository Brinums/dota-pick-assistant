import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { findUserCredentialConflict } from "../utils/user-uniqueness.js";

const listUsersSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().min(1).max(120).optional(),
  sortBy: z.enum(["createdAt", "email", "username", "role"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const roleUpdateSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

const PROTECTED_ADMIN_ID = 1;

function isProtectedAdmin(userId) {
  return Number(userId) === PROTECTED_ADMIN_ID;
}

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

const profileUpdateSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must be at most 30 characters long")
      .regex(
        /^[A-Za-z0-9_.-]+$/,
        "Username can only contain letters, numbers, underscore, dot, and dash",
      )
      .optional(),
    email: z.string().email().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided",
  });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export async function listUsers(req, res, next) {
  try {
    const query = listUsersSchema.parse(req.query);

    const where = query.search
      ? {
          OR: [
            {
              email: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: query.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        orderBy: { [query.sortBy]: query.order },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              recommendations: true,
              matches: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      data: users,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: getZodIssues(error) });
    }

    return next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { role } = roleUpdateSchema.parse(req.body);

    if (isProtectedAdmin(userId)) {
      return res.status(400).json({ message: "The main administrator account cannot be changed" });
    }

    if (Number(req.user.userId) === userId && role !== "ADMIN") {
      return res.status(400).json({ message: "You cannot remove your own ADMIN role" });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, email: true, role: true, updatedAt: true },
    });

    return res.json({
      message: "User role updated",
      data: updated,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: getZodIssues(error) });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }

    return next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const { username, email } = profileUpdateSchema.parse(req.body);
    const userId = req.user.userId;
    const normalizedUsername = username !== undefined ? username.trim() : undefined;
    const normalizedEmail = email !== undefined ? email.toLowerCase() : undefined;

    const conflict = await findUserCredentialConflict({
      username: normalizedUsername,
      email: normalizedEmail,
      excludeUserId: userId,
    });

    if (conflict) {
      return res.status(409).json(conflict);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(normalizedUsername !== undefined ? { username: normalizedUsername } : {}),
        ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: "Profile updated",
      data: updated,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: getZodIssues(error) });
    }

    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target[0] : undefined;
      return res.status(409).json(getUniqueConstraintError(target));
    }

    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }

    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (Number(req.user.userId) === userId) {
      return res.status(400).json({ message: "You cannot delete your own account from admin panel" });
    }

    if (isProtectedAdmin(userId)) {
      return res.status(400).json({ message: "The main administrator account cannot be deleted" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.$transaction([
      prisma.recommendation.deleteMany({ where: { userId } }),
      prisma.match.updateMany({
        where: { userId },
        data: { userId: null },
      }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return res.json({ message: "User deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }

    return next(error);
  }
}

export async function changeMyPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user.userId;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return res.json({ message: "Password updated" });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: getZodIssues(error) });
    }

    return next(error);
  }
}
