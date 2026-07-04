import { Router } from "express";
import {
  getUserSales,
  getUserPurchases,
  buyListing,
  getListingReservations,
} from "../controllers/activity.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Todas las rutas de actividad requieren estar autenticado
router.use(requireAuth);

// Obtener mis ventas (anuncios publicados por mí)
router.get("/sales", getUserSales);

// Obtener reservas de un anuncio específico publicado por mí
router.get("/sales/:listingId/reservations", getListingReservations);

// Obtener mis compras (transacciones realizadas por mí)
router.get("/purchases", getUserPurchases);

// Registrar compra / reserva de un producto
router.post("/buy", buyListing);

export default router;
