import { Router } from "express";
import {
  changeMyPassword,
  listUsers,
  updateMyProfile,
  updateUserRole,
} from "../controllers/users.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.patch("/me/profile", requireAuth, updateMyProfile);
router.patch("/me/password", requireAuth, changeMyPassword);

router.use(requireAuth, requireRole("ADMIN"));
router.get("/", listUsers);
router.patch("/:id/role", updateUserRole);

export default router;
