import dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];

for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    console.error(`❌ ERROR CRÍTICO: Falta la variable de entorno obligatoria '${envVar}' en el archivo .env.`);
    process.exit(1);
  }
}

export const environment = {
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
