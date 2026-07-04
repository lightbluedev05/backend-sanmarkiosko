import { Router } from "express";
import authRoutes from "./auth.routes.js";
import listingRoutes from "./listing.routes.js";
import userRoutes from "./user.routes.js";
import activityRoutes from "./activity.routes.js";
import favoriteRoutes from "./favorite.routes.js";

const router = Router();

// Endpoint de verificación de estado del backend
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Servidor API de Sanmarkiosko en funcionamiento.",
    timestamp: new Date().toISOString(),
  });
});

// Registrar módulos de rutas
router.use("/auth", authRoutes);
router.use("/listings", listingRoutes);
router.use("/users", userRoutes);
router.use("/activity", activityRoutes);
router.use("/favorites", favoriteRoutes);

export default router;
