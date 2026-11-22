const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envPath = path.resolve(__dirname, '../.env.local');
let dbUrl = process.env.DATABASE_URL;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    const val = v.join('=').replace(/^["']|["']$/g, '');
    if (k === 'DATABASE_URL' && !dbUrl) dbUrl = val;
  }
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔒 Creando trigger de inmutabilidad estricta para api_log_auditoria en Supabase...');
    await client.query('BEGIN');

    // 1. Función que bloquea cualquier UPDATE o DELETE (a nivel sentencia y a nivel fila)
    await client.query(`
      CREATE OR REPLACE FUNCTION prevenir_modificacion_log_auditoria()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'VIOLACION_DE_INTEGRIDAD: La bitácora de auditoría es estrictamente inmutable. Las operaciones UPDATE y DELETE están prohibidas por política de seguridad.';
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 2. Aplicar el trigger tanto FOR EACH ROW como FOR EACH STATEMENT
    await client.query(`
      DROP TRIGGER IF EXISTS trg_proteger_log_auditoria ON api_log_auditoria;
      CREATE TRIGGER trg_proteger_log_auditoria
      BEFORE UPDATE OR DELETE ON api_log_auditoria
      FOR EACH STATEMENT EXECUTE FUNCTION prevenir_modificacion_log_auditoria();
    `);

    await client.query('COMMIT');
    console.log('✅ Trigger aplicado exitosamente. La tabla [api_log_auditoria] ahora es estrictamente Append-Only (bloqueo por sentencia).');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al aplicar trigger:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
