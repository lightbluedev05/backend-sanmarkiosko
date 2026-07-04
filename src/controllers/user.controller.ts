import { Response, NextFunction } from "express";
import { db } from "../config/db.js";
import { ApiError } from "../middleware/error.middleware.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

/**
 * Obtener perfil público de cualquier estudiante e incluye sus anuncios
 */
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    // Obtener datos del usuario
    const userResult = await db.query(
      `SELECT id, name, email, faculty, career, year, bio, avatar_url, is_pro, rating, created_at 
       FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError(404, "Estudiante no encontrado.");
    }

    // Obtener los anuncios activos del usuario
    const listingsResult = await db.query(
      `SELECT * FROM listings 
       WHERE seller_id = $1 AND status = 'Activo' 
       ORDER BY created_at DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        profile: userResult.rows[0],
        listings: listingsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

import bcrypt from "bcryptjs";

/**
 * Actualizar perfil de usuario (Autenticado)
 */
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  const { name, faculty, career, year, bio, avatarUrl, phone } = req.body;

  try {
    if (!userId) {
      throw new ApiError(401, "No autorizado.");
    }

    const result = await db.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           faculty = COALESCE($2, faculty),
           career = COALESCE($3, career),
           year = COALESCE($4, year),
           bio = COALESCE($5, bio),
           avatar_url = COALESCE($6, avatar_url),
           phone = COALESCE($7, phone)
       WHERE id = $8
       RETURNING id, name, email, faculty, career, year, bio, avatar_url, phone, is_pro, rating, created_at`,
      [name, faculty, career, year, bio, avatarUrl, phone, userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    res.status(200).json({
      success: true,
      message: "Perfil actualizado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cambiar contraseña del usuario autenticado
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  try {
    if (!userId) {
      throw new ApiError(401, "No autorizado.");
    }

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "La contraseña actual y la nueva son campos obligatorios.");
    }

    // Obtener hash actual
    const userRes = await db.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    const user = userRes.rows[0];

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new ApiError(400, "La contraseña actual es incorrecta.");
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Guardar en la base de datos
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada exitosamente.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas del usuario (Autenticado)
 * Retorna número de anuncios activos, promedio de calificación e ingresos por ventas.
 */
export const getUserStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId) {
      throw new ApiError(401, "No autorizado.");
    }

    // Contar anuncios activos
    const listingsCountRes = await db.query(
      "SELECT COUNT(*) as count FROM listings WHERE seller_id = $1 AND status = 'Activo'",
      [userId]
    );

    // Sumar ventas completadas desde la tabla de transacciones
    const salesSumRes = await db.query(
      "SELECT COALESCE(SUM(price), 0) as total_sales FROM transactions WHERE seller_id = $1 AND status = 'Completado'",
      [userId]
    );

    // Obtener rating de usuario
    const userRes = await db.query(
      "SELECT rating FROM users WHERE id = $1",
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        activeListings: parseInt(listingsCountRes.rows[0].count, 10),
        totalSales: parseFloat(salesSumRes.rows[0].total_sales),
        rating: userRes.rows[0] ? parseFloat(userRes.rows[0].rating) : 5.0,
      },
    });
  } catch (error) {
    next(error);
  }
};
