import { Response, NextFunction } from "express";
import { db } from "../config/db.js";
import { ApiError } from "../middleware/error.middleware.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

/**
 * Agregar o remover un anuncio de favoritos (Alternar / Toggle)
 */
export const toggleFavorite = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  const { listingId } = req.body;

  try {
    if (!userId) {
      throw new ApiError(401, "No autorizado.");
    }

    if (!listingId) {
      throw new ApiError(400, "El ID del anuncio (listingId) es requerido.");
    }

    // Verificar si el anuncio existe
    const listingCheck = await db.query("SELECT id FROM listings WHERE id = $1", [listingId]);
    if (listingCheck.rows.length === 0) {
      throw new ApiError(404, "El anuncio no existe.");
    }

    // Verificar si ya está marcado como favorito
    const favoriteCheck = await db.query(
      "SELECT 1 FROM favorites WHERE user_id = $1 AND listing_id = $2",
      [userId, listingId]
    );

    if (favoriteCheck.rows.length > 0) {
      // Si ya es favorito, lo removemos (unfavorite)
      await db.query(
        "DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2",
        [userId, listingId]
      );
      res.status(200).json({
        success: true,
        favorited: false,
        message: "Anuncio removido de favoritos.",
      });
    } else {
      // Si no es favorito, lo agregamos (favorite)
      await db.query(
        "INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)",
        [userId, listingId]
      );
      res.status(200).json({
        success: true,
        favorited: true,
        message: "Anuncio agregado a favoritos.",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los anuncios guardados en favoritos por el usuario autenticado
 */
export const getFavorites = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId) {
      throw new ApiError(401, "No autorizado.");
    }

    const result = await db.query(
      `SELECT l.*, u.name as "sellerName", u.is_pro as "isPro"
       FROM favorites f
       JOIN listings l ON f.listing_id = l.id
       JOIN users u ON l.seller_id = u.id
       WHERE f.user_id = $1 AND l.status = 'Activo'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
