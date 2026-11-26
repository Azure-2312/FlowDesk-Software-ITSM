const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Cargar .env.local manualmente si existe
const envPath = path.resolve(__dirname, '../.env.local');
let dbUrl = process.env.DATABASE_URL;
let salt = process.env.API_KEY_SALT || 'flowdesk_salt_seguridad_api_clientes_2026_super_secreto_itsm';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    const val = v.join('=').replace(/^["']|["']$/g, '');
    if (k === 'DATABASE_URL' && !dbUrl) dbUrl = val;
    if (k === 'API_KEY_SALT') salt = val;
  }
}

if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL no encontrada en entorno ni en .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: /localhost|127.0.0.1|sslmode=disable/.test(String(dbUrl)) ? false : { rejectUnauthorized: false }
});

function hashApiKey(apiKey) {
  return crypto.createHmac('sha256', salt).update(apiKey.trim()).digest('hex');
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('🚀 Inicializando credencial y tablas de API Clientes en Supabase...');

    // 1. Asegurar tabla api_credenciales_externas
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_credenciales_externas (
        id_credencial SERIAL PRIMARY KEY,
        nombre_grupo VARCHAR(100) NOT NULL,
        contacto VARCHAR(100),
        api_key_prefijo VARCHAR(20) NOT NULL,
        api_key_hash VARCHAR(128) NOT NULL UNIQUE,
        permisos JSONB DEFAULT '["clientes:read", "clientes:write"]'::jsonb,
        limite_rpm INT DEFAULT 60,
        estado BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ultimo_acceso TIMESTAMP WITH TIME ZONE,
        total_peticiones INT DEFAULT 0
      );
    `);

    // 2. Asegurar tabla api_log_auditoria
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_log_auditoria (
        id_log BIGSERIAL PRIMARY KEY,
        id_credencial INT REFERENCES api_credenciales_externas(id_credencial) ON DELETE SET NULL,
        grupo_identificado VARCHAR(100),
        metodo VARCHAR(10) NOT NULL,
        ruta VARCHAR(255) NOT NULL,
        codigo_estado INT NOT NULL,
        ip_origen VARCHAR(50),
        tiempo_respuesta_ms INT,
        mensaje_error TEXT,
        fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Insertar/Actualizar credencial del Grupo Aliado
    const rawApiKey = 'fdk_live_grupo_aliado_2026_acceso_seguro_token';
    const hash = hashApiKey(rawApiKey);
    const prefijo = 'fdk_live_aliado';

    const res = await client.query(`
      INSERT INTO api_credenciales_externas (
        nombre_grupo, contacto, api_key_prefijo, api_key_hash, permisos, limite_rpm, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT (api_key_hash) DO UPDATE SET
        estado = true,
        permisos = EXCLUDED.permisos,
        limite_rpm = EXCLUDED.limite_rpm
      RETURNING *;
    `, [
      'Grupo 2 - Sistema Aliado Externo',
      'representante.grupo2@universidad.edu.pe',
      prefijo,
      hash,
      JSON.stringify(['clientes:read', 'clientes:write']),
      120
    ]);

    console.log('✅ Credencial del Grupo Aliado configurada correctamente:');
    console.log('   - ID:', res.rows[0].id_credencial);
    console.log('   - Grupo:', res.rows[0].nombre_grupo);
    console.log('   - Token en claro:', rawApiKey);
    console.log('   - Hash SHA-256 en BD:', hash.substring(0, 24) + '...');
    console.log('   - Permisos:', res.rows[0].permisos);

  } catch (err) {
    console.error('❌ Error al inicializar:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
