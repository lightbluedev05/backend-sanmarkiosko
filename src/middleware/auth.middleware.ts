import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { environment } from "../config/environment.js";
import { ApiError } from "./error.middleware.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Middleware para requerir autenticación mediante JWT.
 */
export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "No autorizado. Token no proporcionado o formato inválido."));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, environment.jwtSecret) as {
      id: string;
      email: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return next(new ApiError(401, "No autorizado. Token expirado o inválido."));
  }
};
