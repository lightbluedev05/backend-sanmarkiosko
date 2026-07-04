import { Router } from "express";
import { toggleFavorite, getFavorites } from "../controllers/favorite.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Requerir inicio de sesión para administrar favoritos
router.use(requireAuth);

// Obtener mis anuncios guardados como favoritos
router.get("/", getFavorites);

// Alternar favorito (guardar o remover)
router.post("/toggle", toggleFavorite);

export default router;
