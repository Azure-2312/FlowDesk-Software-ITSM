import { Pool, PoolClient } from "pg";

// Un "Pool" mantiene varias conexiones abiertas y las reutiliza,
// en vez de abrir/cerrar una conexión nueva en cada consulta (muy lento).
//
// En desarrollo, Next.js recarga el código muy seguido (hot reload), y si
// creáramos un Pool nuevo cada vez, se nos acabarían las conexiones
// permitidas por Supabase. Por eso lo guardamos en una variable global.

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

export const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Supabase requiere conexión SSL
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

/**
 * Helper para ejecutar una consulta SQL con parámetros.
 * Usar siempre placeholders ($1, $2, ...) y nunca concatenar texto del
 * usuario directo en el SQL, para evitar inyección SQL.
 *
 * Ejemplo:
 *   const { rows } = await query("SELECT * FROM usuario WHERE id_usuario = $1", [5]);
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const resultado = await pool.query(text, params);
  return resultado.rows as T[];
}

/**
 * Helper para obtener una sola fila o null.
 */
export async function queryRow<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Ejecuta varias consultas como una sola operación "todo o nada".
 * Ejemplo de uso: crear un usuario Y asignarle sus perfiles — si falla
 * cualquiera de los dos pasos, ninguno queda guardado (ROLLBACK).
 */
export async function transaccion<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const resultado = await fn(client);
    await client.query("COMMIT");
    return resultado;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
