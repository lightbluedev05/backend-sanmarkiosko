import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler, ApiError } from "./middleware/error.middleware.js";
import { environment } from "./config/environment.js";

const app = express();

// Configuración de CORS para permitir solicitudes del Frontend
app.use(
  cors({
    origin: environment.frontendUrl,
    credentials: true,
  })
);

// Middleware para parsear solicitudes con formato JSON
app.use(express.json());

// Montar todas las rutas API
app.use("/api", routes);

// Capturar endpoints no encontrados (404)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `No se encontró la ruta solicitada: ${req.method} ${req.originalUrl}`));
});

// Middleware de manejo de errores global
app.use(errorHandler);

export default app;
