import app from "./app.js";
import { environment } from "./config/environment.js";
import { db } from "./config/db.js";

const startServer = async () => {
  try {
    // Probar conexión a la base de datos antes de levantar el servidor
    console.log("🔄 Verificando conexión con Supabase PostgreSQL...");
    await db.query("SELECT NOW()");
    console.log("✅ Conexión verificada exitosamente.");

    const server = app.listen(environment.port, () => {
      console.log(`🚀 Servidor backend escuchando en: http://localhost:${environment.port}`);
      console.log(`📡 Endpoints API disponibles en: http://localhost:${environment.port}/api`);
    });

    // Manejo de apagado gradual (Graceful Shutdown)
    const gracefulShutdown = () => {
      console.log("🔌 Cerrando servidor HTTP...");
      server.close(async () => {
        console.log("🛑 Servidor HTTP cerrado.");
        try {
          console.log("🔋 Cerrando pool de conexiones a la base de datos...");
          await db.pool.end();
          console.log("✅ Conexiones a base de datos cerradas. Salida exitosa.");
          process.exit(0);
        } catch (err) {
          console.error("❌ Error al cerrar pool de base de datos:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

  } catch (error) {
    console.error("❌ No se pudo iniciar el servidor debido a una falla en la base de datos:");
    console.error(error);
    process.exit(1);
  }
};

startServer();
