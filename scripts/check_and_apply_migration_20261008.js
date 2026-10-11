const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const check = await pool.query(`
    SELECT to_regclass('public.tipo_activo_catalogo') as existe
  `);
  console.log('tipo_activo_catalogo existe?', check.rows[0].existe);
  if (!check.rows[0].existe) {
    console.log('Aplicando migracion 20261008...');
    const sql = fs.readFileSync('db/migrations/20261008_configuracion_itam_formularios_notificaciones.sql', 'utf8');
    await pool.query(sql);
    console.log('Migracion 20261008 aplicada con exito.');
  }
  await pool.end();
}
run().catch(console.error);
