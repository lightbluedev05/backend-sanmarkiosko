import { Request, Response, NextFunction } from "express";
import { environment } from "../config/environment.js";

/**
 * Clase para representar errores de API controlados con código de estado HTTP.
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Middleware global de manejo de errores.
 * Captura todos los errores de la aplicación y devuelve una respuesta estructurada.
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Error interno del servidor";

  console.error(`[Error] ${req.method} ${req.url} - Status ${statusCode} - ${err.stack || message}`);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    // Solo mostrar el stack trace en desarrollo
    stack: environment.nodeEnv === "development" && !(err instanceof ApiError) ? err.stack : undefined,
  });
};
