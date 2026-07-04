import { Response, NextFunction } from "express";
import { db } from "../config/db.js";
import { ApiError } from "../middleware/error.middleware.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

/**
 * Obtener todos los anuncios con filtros opcionales (búsqueda, categoría, vendedor)
 */
export const getAllListings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { q, category, sellerId } = req.query;

  try {
    let sql = `
      SELECT l.*, u.name as "sellerName", u.is_pro as "isPro"
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      WHERE l.status = 'Activo'
    `;
    const params: any[] = [];
    let paramCounter = 1;

    // Filtro por categoría
    if (category) {
      sql += ` AND l.category = $${paramCounter}`;
      params.push(category);
      paramCounter++;
    }

    // Filtro por vendedor
    if (sellerId) {
      sql += ` AND l.seller_id = $${paramCounter}`;
      params.push(sellerId);
      paramCounter++;
    }

    // Filtro por término de búsqueda (search query)
    if (q) {
      sql += ` AND (l.title ILIKE $${paramCounter} OR l.description ILIKE $${paramCounter} OR l.category ILIKE $${paramCounter})`;
      params.push(`%${q}%`);
      paramCounter++;
    }

    // Ordenar: Los anuncios patrocinados (is_boosted) primero, luego los más recientes
    sql += ` ORDER BY l.is_boosted DESC, l.created_at DESC`;

    const result = await db.query(sql, params);

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
 * Obtener un anuncio específico por su ID
 */
export const getListingById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT l.*, u.name as "sellerName", u.email as "sellerEmail", u.faculty as "sellerFaculty", u.is_pro as "isPro", u.rating as "sellerRating"
       FROM listings l
       JOIN users u ON l.seller_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "El anuncio solicitado no existe.");
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo anuncio (Requiere autenticación)
 */
export const createListing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { title, description, price, category, imageUrl, type, stock } = req.body;
  const sellerId = req.user?.id;

  const CATEGORY_IMAGES: Record<string, string> = {
    "Académico": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
    "Comida": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
    "Tecnología": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop",
    "Vida Diaria": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80",
    "Otros Servicios": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    "Otros Productos": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"
  };

  try {
    if (!title || !description || price === undefined || !category) {
      throw new ApiError(400, "Título, descripción, precio y categoría son campos obligatorios.");
    }

    if (!sellerId) {
      throw new ApiError(401, "No autorizado. Sesión inválida.");
    }

    const defaultImg = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Otros Productos"];

    // Insertar anuncio con tipo y stock
    const result = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description,
        parseFloat(price),
        category,
        imageUrl || defaultImg,
        sellerId,
        type || "Producto",
        type === "Servicio" ? 0 : (stock !== undefined ? parseInt(stock, 10) : 1),
      ]
    );

    res.status(201).json({
      success: true,
      message: "Anuncio creado exitosamente.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un anuncio existente (Requiere ser el propietario)
 */
export const updateListing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { title, description, price, category, imageUrl, status, type, stock } = req.body;
  const userId = req.user?.id;

  try {
    // Verificar que el anuncio exista y pertenezca al usuario
    const checkResult = await db.query("SELECT seller_id FROM listings WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) {
      throw new ApiError(404, "El anuncio no existe.");
    }

    if (checkResult.rows[0].seller_id !== userId) {
      throw new ApiError(403, "No tienes permiso para editar este anuncio.");
    }

    // Actualizar campos
    const result = await db.query(
      `UPDATE listings
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           image_url = COALESCE($5, image_url),
           status = COALESCE($6, status),
           type = COALESCE($7, type),
           stock = COALESCE($8, stock)
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description,
        price !== undefined ? parseFloat(price) : null,
        category,
        imageUrl,
        status,
        type,
        stock !== undefined ? parseInt(stock, 10) : null,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Anuncio actualizado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un anuncio (Requiere ser el propietario)
 */
export const deleteListing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Verificar propiedad
    const checkResult = await db.query("SELECT seller_id FROM listings WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) {
      throw new ApiError(404, "El anuncio no existe.");
    }

    if (checkResult.rows[0].seller_id !== userId) {
      throw new ApiError(403, "No tienes permiso para eliminar este anuncio.");
    }

    await db.query("DELETE FROM listings WHERE id = $1", [id]);

    res.status(200).json({
      success: true,
      message: "Anuncio eliminado correctamente.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Destacar / Promover un anuncio ("Boost")
 */
export const boostListing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const checkResult = await db.query("SELECT seller_id FROM listings WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) {
      throw new ApiError(404, "El anuncio no existe.");
    }

    if (checkResult.rows[0].seller_id !== userId) {
      throw new ApiError(403, "No tienes permiso para promover este anuncio.");
    }

    const result = await db.query(
      `UPDATE listings
       SET is_boosted = TRUE
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "¡Anuncio destacado exitosamente!",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
