const fs = require('fs');
const { Pool } = require('pg');

const envContent = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^"/, '').replace(/"$/, '');
    break;
  }
}

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function check() {
  const { rows } = await pool.query(`
    SELECT 
      om.id_opcion_menu,
      om.nombre,
      om.url_menu,
      om.nivel,
      om.id_padre,
      p.nombre as padre_nombre,
      gp.nombre as abuelo_nombre
    FROM opciones_menu om
    LEFT JOIN opciones_menu p ON om.id_padre = p.id_opcion_menu
    LEFT JOIN opciones_menu gp ON p.id_padre = gp.id_opcion_menu
    WHERE om.estado_registro = true
    ORDER BY om.id_padre NULLS FIRST, om.orden, om.id_opcion_menu
  `);

  console.log(`Auditing ${rows.length} menu options for cross-module inconsistencies...\n`);

  const results = [];

  rows.forEach(r => {
    if (!r.url_menu) return; // folder
    const topParent = (r.abuelo_nombre || r.padre_nombre || r.nombre).trim();
    const immediateParent = (r.padre_nombre || 'RAIZ').trim();
    
    results.push({
      id: r.id_opcion_menu,
      top: topParent,
      parent: immediateParent,
      name: r.nombre,
      url: r.url_menu
    });
  });

  // Group by top-level section
  const byTop = {};
  results.forEach(r => {
    if (!byTop[r.top]) byTop[r.top] = [];
    byTop[r.top].push(r);
  });

  for (const [top, items] of Object.entries(byTop)) {
    console.log(`================================================================`);
    console.log(`DOMINIO RAIZ: ${top.toUpperCase()}`);
    console.log(`================================================================`);
    items.forEach(it => {
      console.log(`[${it.id}] (${it.parent}) "${it.name}" -> ${it.url}`);
    });
  }

  await pool.end();
}

check().catch(console.error);
