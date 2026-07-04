import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Ruta para registrar un nuevo usuario
router.post("/register", register);

// Ruta para iniciar sesión
router.post("/login", login);

// Ruta para obtener perfil del usuario autenticado (requiere token JWT)
router.get("/me", requireAuth, getMe);

export default router;
