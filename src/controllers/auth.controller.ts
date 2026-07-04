import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { environment } from "../config/environment.js";
import { ApiError } from "../middleware/error.middleware.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

/**
 * Genera un token JWT para un usuario.
 */
const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, environment.jwtSecret, {
    expiresIn: environment.jwtExpiresIn as any,
  });
};

/**
 * Registro de un nuevo estudiante (Usuario)
 */
export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, email, password, faculty, career, year, bio } = req.body;

  try {
    // Validar campos obligatorios
    if (!name || !email || !password) {
      throw new ApiError(400, "Nombre, correo y contraseña son campos obligatorios.");
    }

    // Validar que el correo sea de San Marcos (@unmsm.edu.pe)
    const isSanMarcosEmail = email.endsWith("@unmsm.edu.pe");
    if (!isSanMarcosEmail) {
      throw new ApiError(400, "Solo se permiten correos institucionales de San Marcos (@unmsm.edu.pe).");
    }

    // Verificar si el correo ya está registrado
    const userCheck = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      throw new ApiError(400, "El correo electrónico ya está registrado.");
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar nuevo usuario
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, faculty, career, year, bio, avatar_url, is_pro, rating, created_at`,
      [name, email, passwordHash, faculty || null, career || null, year || null, bio || null]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      success: true,
      message: "Registro exitoso.",
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Inicio de sesión
 */
export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new ApiError(400, "Correo y contraseña son obligatorios.");
    }

    // Buscar el usuario por correo
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      throw new ApiError(401, "Credenciales incorrectas. Correo no encontrado.");
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new ApiError(401, "Credenciales incorrectas. Contraseña inválida.");
    }

    // Generar token JWT
    const token = generateToken(user.id, user.email);

    // Remover hash de contraseña para no retornarlo
    const { password_hash, ...userResponse } = user;

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso.",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener la información del usuario autenticado actual
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "No autenticado.");
    }

    const result = await db.query(
      `SELECT id, name, email, faculty, career, year, bio, avatar_url, is_pro, rating, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Usuario no encontrado.");
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};
