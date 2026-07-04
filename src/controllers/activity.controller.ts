import { Response, NextFunction } from "express";
import { db } from "../config/db.js";
import { ApiError } from "../middleware/error.middleware.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

/**
 * Obtener todos los anuncios publicados por el usuario (Ventas)
 */
export const getUserSales = async (
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
      `SELECT * FROM listings 
       WHERE seller_id = $1 
       ORDER BY created_at DESC`,
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

/**
 * Obtener el historial de compras del usuario autenticado
 */
export const getUserPurchases = async (
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
      `SELECT t.id as "transactionId", t.price, t.status, t.created_at as "date",
              l.id as "listingId", l.title, l.category, l.image_url,
              u.name as "sellerName"
       FROM transactions t
       JOIN listings l ON t.listing_id = l.id
       JOIN users u ON t.seller_id = u.id
       WHERE t.buyer_id = $1
       ORDER BY t.created_at DESC`,
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

/**
 * Simular compra / reserva de un anuncio (Crea transacción y marca anuncio como Vendido)
 */
export const buyListing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const buyerId = req.user?.id;
  const { listingId } = req.body;

  try {
    if (!buyerId) {
      throw new ApiError(401, "No autorizado.");
    }

    if (!listingId) {
      throw new ApiError(400, "El ID de anuncio (listingId) es requerido.");
    }

    // Obtener detalles del anuncio
    const listingRes = await db.query(
      "SELECT id, price, seller_id, status, type, stock FROM listings WHERE id = $1",
      [listingId]
    );

    if (listingRes.rows.length === 0) {
      throw new ApiError(404, "El anuncio no existe.");
    }

    const listing = listingRes.rows[0];

    if (listing.status !== "Activo") {
      throw new ApiError(400, "El anuncio ya no está activo o ya fue vendido.");
    }

    if (listing.seller_id === buyerId) {
      throw new ApiError(400, "No puedes comprar tu propio anuncio.");
    }

    // Iniciar transacción en la base de datos
    await db.query("BEGIN");

    // 1. Crear registro de transacción
    const txResult = await db.query(
      `INSERT INTO transactions (listing_id, buyer_id, seller_id, price, status)
       VALUES ($1, $2, $3, $4, 'Completado')
       RETURNING *`,
      [listing.id, buyerId, listing.seller_id, listing.price]
    );

    // 2. Gestionar Stock y Estado según tipo
    if (listing.type === "Producto") {
      if (listing.stock <= 0) {
        throw new ApiError(400, "El producto está agotado (stock 0).");
      }

      // Decrementar stock por 1
      const updateStockRes = await db.query(
        `UPDATE listings 
         SET stock = stock - 1 
         WHERE id = $1 
         RETURNING stock`,
        [listing.id]
      );

      const newStock = updateStockRes.rows[0].stock;

      // Si el stock llega a 0, marcar el anuncio como Vendido
      if (newStock === 0) {
        await db.query(
          `UPDATE listings 
           SET status = 'Vendido' 
           WHERE id = $1`,
          [listing.id]
        );
      }
    } else {
      // Si es un Servicio, no se decrementa stock y no cambia a Vendido.
      // Queda activo de forma indefinida hasta que el vendedor lo desactive manualmente.
    }

    await db.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Reserva / Compra registrada con éxito.",
      data: txResult.rows[0],
    });
  } catch (error) {
    await db.query("ROLLBACK");
    next(error);
  }
};

/**
 * Obtener reservaciones de un anuncio específico (Solo el vendedor propietario)
 */
export const getListingReservations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { listingId } = req.params;
  const sellerId = req.user?.id;

  try {
    if (!sellerId) {
      throw new ApiError(401, "No autorizado.");
    }

    // Verificar que el anuncio pertenezca al usuario autenticado
    const listingCheck = await db.query(
      "SELECT id, seller_id FROM listings WHERE id = $1",
      [listingId]
    );

    if (listingCheck.rows.length === 0) {
      throw new ApiError(404, "El anuncio no existe.");
    }

    if (listingCheck.rows[0].seller_id !== sellerId) {
      throw new ApiError(403, "No tienes permiso para ver las reservas de este anuncio.");
    }

    // Obtener los datos de transacciones de compra con datos del estudiante comprador
    const result = await db.query(
      `SELECT t.id as "transactionId", t.price, t.status, t.created_at as "date",
              u.id as "buyerId", u.name as "buyerName", u.email as "buyerEmail",
              u.faculty as "buyerFaculty", u.career as "buyerCareer", u.year as "buyerYear"
       FROM transactions t
       JOIN users u ON t.buyer_id = u.id
       WHERE t.listing_id = $1
       ORDER BY t.created_at DESC`,
      [listingId]
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
