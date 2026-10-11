const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n\r]+)"?/);
const connectionString = match ? match[1] : '';

const pool = new Pool({ connectionString });

async function check() {
  const res = await pool.query('SELECT id_opcion_menu, nombre, url_menu, id_padre FROM opciones_menu ORDER BY id_opcion_menu');
  console.table(res.rows);
  await pool.end();
}

check().catch(console.error);
