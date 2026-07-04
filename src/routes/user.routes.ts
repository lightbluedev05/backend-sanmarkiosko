import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  changePassword,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Ruta protegida para estadísticas del panel de perfil
router.get("/stats", requireAuth, getUserStats);

// Ruta protegida para cambiar contraseña
router.put("/change-password", requireAuth, changePassword);

// Ruta pública para ver el perfil de cualquier estudiante
router.get("/:id", getUserProfile);

// Ruta protegida para actualizar el perfil propio
router.put("/profile", requireAuth, updateUserProfile);

export default router;
