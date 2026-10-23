const fs = require('fs');
const { Pool } = require('pg');

const envContent = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim();
    if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) dbUrl = dbUrl.slice(1, -1);
    break;
  }
}

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function checkCurrentUrls() {
  const { rows } = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, id_padre, nivel
    FROM opciones_menu
    WHERE estado_registro = true AND url_menu IS NOT NULL AND url_menu != ''
    ORDER BY id_opcion_menu
  `);

  console.log(`Found ${rows.length} leaf/url menu options.`);
  rows.forEach(r => {
    if (r.url_menu.includes('tecnico') || 
        r.url_menu.includes('supervisor') || 
        r.url_menu.includes('aprobador') || 
        r.url_menu.includes('gestor') || 
        r.url_menu.includes('auditor') ||
        r.url_menu.includes('tickets/mesa') ||
        r.url_menu.includes('tickets/configuracion/vistas') ||
        r.url_menu === '/plataforma/problemas') {
      console.log(`[${r.id_opcion_menu}] ${r.nombre} -> "${r.url_menu}"`);
    }
  });

  await pool.end();
}

checkCurrentUrls().catch(err => {
  console.error(err);
  process.exit(1);
});
