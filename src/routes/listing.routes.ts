import { Router } from "express";
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  boostListing,
} from "../controllers/listing.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Rutas públicas de consulta
router.get("/", getAllListings);
router.get("/:id", getListingById);

// Rutas protegidas (requieren inicio de sesión)
router.post("/", requireAuth, createListing);
router.put("/:id", requireAuth, updateListing);
router.delete("/:id", requireAuth, deleteListing);
router.post("/:id/boost", requireAuth, boostListing);

export default router;
