const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Conectando a la base de datos...");
  
  // 1. Agregar columna campos_adicionales a ticket si no existe
  await pool.query(`
    ALTER TABLE ticket 
    ADD COLUMN IF NOT EXISTS campos_adicionales JSONB DEFAULT '{}'::jsonb;
  `);
  console.log("Columna campos_adicionales agregada/verificada en tabla ticket.");

  // 2. Crear tabla adjunto_ticket si no existe
  await pool.query(`
    CREATE TABLE IF NOT EXISTS adjunto_ticket (
      id_adjunto          SERIAL PRIMARY KEY,
      id_ticket           INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE,
      nombre_archivo      VARCHAR(255) NOT NULL,
      tipo_mime           VARCHAR(100) NOT NULL,
      tamano_bytes        INT NOT NULL,
      datos_base64        TEXT NOT NULL,
      id_usuario_subio    INT NOT NULL REFERENCES usuario(id_usuario),
      fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now(),
      estado_registro     BOOLEAN NOT NULL DEFAULT true
    );

    CREATE INDEX IF NOT EXISTS idx_adjunto_ticket ON adjunto_ticket(id_ticket);
  `);
  console.log("Tabla adjunto_ticket e indice creados/verificados con exito.");

  await pool.end();
  console.log("Migracion completada exitosamente.");
}

main().catch((err) => {
  console.error("Error en migracion:", err);
  pool.end();
  process.exit(1);
});
