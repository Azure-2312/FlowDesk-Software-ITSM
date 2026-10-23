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

async function main() {
  const { rows } = await pool.query(`
    SELECT 
      om.id_opcion_menu, 
      om.nombre, 
      om.url_menu, 
      om.nivel, 
      om.orden,
      om.id_padre,
      p.nombre as padre_nombre
    FROM opciones_menu om
    LEFT JOIN opciones_menu p ON om.id_padre = p.id_opcion_menu
    WHERE om.estado_registro = true
    ORDER BY om.id_padre NULLS FIRST, om.orden, om.id_opcion_menu
  `);

  console.log(`Total opciones_menu: ${rows.length}`);
  
  // Save all to a file for complete analysis
  let out = 'ID | NIVEL | PADRE | NOMBRE | URL\n';
  out += '---|---|---|---|---\n';
  rows.forEach(r => {
    out += `${r.id_opcion_menu} | ${r.nivel} | [${r.id_padre || 0}] ${r.padre_nombre || 'RAIZ'} | ${r.nombre} | ${r.url_menu || '(carpeta)'}\n`;
  });

  fs.writeFileSync('scripts/opciones_menu_dump.txt', out);
  console.log('Saved to scripts/opciones_menu_dump.txt');

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
