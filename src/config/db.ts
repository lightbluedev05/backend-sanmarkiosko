import pg from "pg";
import { environment } from "./environment.js";

// Configurar node-postgres para parsear DECIMAL/NUMERIC (OID 1700) como float de JS
pg.types.setTypeParser(1700, (val: string) => parseFloat(val));

const { Pool } = pg;

const pool = new Pool({
  connectionString: environment.databaseUrl,
  // En producción (como Supabase), a veces se requiere SSL
  ssl: environment.nodeEnv === "production" ? { rejectUnauthorized: false } : undefined,
});

pool.on("connect", () => {
  console.log("🔋 Conexión establecida con la base de datos PostgreSQL en Supabase.");
});

pool.on("error", (err: Error) => {
  console.error("❌ Error inesperado en el cliente del pool de base de datos:", err);
});

export const db = {
  /**
   * Ejecuta una consulta SQL en la base de datos.
   * @param text Sentencia SQL con marcadores de posición ($1, $2, etc.)
   * @param params Parámetros correspondientes a los marcadores
   */
  query: async <T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> => {
    const start = Date.now();
    try {
      const res = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      if (environment.nodeEnv === "development") {
        console.log(`[Query] ejecutada en ${duration}ms | Filas: ${res.rowCount}`);
      }
      return res;
    } catch (error) {
      console.error(`[Query Error] falló al ejecutar la consulta: ${text}`);
      throw error;
    }
  },
  pool,
};
