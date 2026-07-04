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

// Endpoint de bienvenida en la raíz para evitar errores 404 en las pruebas de Render
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Servidor API de Sanmarkiosko activo y en funcionamiento. Los endpoints están disponibles bajo la ruta /api",
  });
});

// Capturar endpoints no encontrados (404)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `No se encontró la ruta solicitada: ${req.method} ${req.originalUrl}`));
});

// Middleware de manejo de errores global
app.use(errorHandler);

export default app;
