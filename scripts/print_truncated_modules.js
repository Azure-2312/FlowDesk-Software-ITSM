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

async function run() {
  const { rows } = await pool.query(`
    SELECT 
      om.id_opcion_menu, 
      om.nombre, 
      om.url_menu, 
      om.nivel, 
      om.orden,
      om.id_padre,
      p.nombre as padre_nombre,
      gp.nombre as abuelo_nombre
    FROM opciones_menu om
    LEFT JOIN opciones_menu p ON om.id_padre = p.id_opcion_menu
    LEFT JOIN opciones_menu gp ON p.id_padre = gp.id_opcion_menu
    WHERE om.estado_registro = true
    ORDER BY COALESCE(gp.orden, p.orden, om.orden), COALESCE(p.orden, om.orden), om.orden, om.id_opcion_menu
  `);

  const modules = {};
  rows.forEach(r => {
    let topName = r.abuelo_nombre || r.padre_nombre || r.nombre;
    if (!modules[topName]) modules[topName] = [];
    modules[topName].push(r);
  });

  const targetModules = ['Cambios', 'Problemas', 'Activos', 'CMDB', 'Aprobaciones', 'SLA', 'Operacion de la mesa'];
  for (const [modName, items] of Object.entries(modules)) {
    if (targetModules.some(t => modName.toLowerCase().includes(t.toLowerCase()))) {
      console.log(`\n======================================================`);
      console.log(`MODULO / SECCION: ${modName.toUpperCase()}`);
      console.log(`======================================================`);
      items.forEach(item => {
        const indent = '  '.repeat(item.nivel - 1);
        const url = item.url_menu || '(carpeta)';
        console.log(`${indent}[${item.id_opcion_menu}] ${item.nombre} -> ${url}`);
      });
    }
  }

  await pool.end();
}

run().catch(console.error);
