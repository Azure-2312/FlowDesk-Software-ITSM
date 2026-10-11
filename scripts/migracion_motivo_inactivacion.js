const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL es obligatoria para ejecutar esta migración.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrar() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Agregando columnas de auditoria e inactivacion a servicio_catalogo...");
    await client.query(`
      ALTER TABLE servicio_catalogo 
      ADD COLUMN IF NOT EXISTS motivo_inactivacion TEXT,
      ADD COLUMN IF NOT EXISTS fecha_inactivacion TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS usuario_inactivacion INT REFERENCES usuario(id_usuario);
    `);

    console.log("Agregando columnas de auditoria e inactivacion a elemento_configuracion...");
    await client.query(`
      ALTER TABLE elemento_configuracion 
      ADD COLUMN IF NOT EXISTS motivo_inactivacion TEXT,
      ADD COLUMN IF NOT EXISTS fecha_inactivacion TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS usuario_inactivacion INT REFERENCES usuario(id_usuario);
    `);

    console.log("Agregando columnas de auditoria e inactivacion a activo...");
    await client.query(`
      ALTER TABLE activo 
      ADD COLUMN IF NOT EXISTS motivo_inactivacion TEXT,
      ADD COLUMN IF NOT EXISTS fecha_inactivacion TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS usuario_inactivacion INT REFERENCES usuario(id_usuario);
    `);

    await client.query("COMMIT");
    console.log("Migracion completada exitosamente.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error en migracion:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrar();
