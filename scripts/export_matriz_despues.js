const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function run() {
  const query = `
    SELECT 
      om.id_opcion_menu,
      om.nombre AS opcion_menu,
      om.url_menu,
      om.orden,
      om.id_padre,
      p.id_perfil,
      p.nombre AS perfil,
      vp.vista
    FROM opciones_menu om
    LEFT JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu
    LEFT JOIN perfiles p ON p.id_perfil = omp.id_perfil
    LEFT JOIN opciones_menu_vistas_perfiles vp ON vp.id_opcion_menu = om.id_opcion_menu AND vp.id_perfil = p.id_perfil
    WHERE om.estado_registro = true
    ORDER BY om.id_padre NULLS FIRST, om.orden, om.id_opcion_menu, p.id_perfil, vp.vista NULLS FIRST
  `;

  const res = await pool.query(query);
  let csv = 'id_opcion_menu,opcion_menu,url_menu,orden,id_padre,id_perfil,perfil,vista\n';
  for (const r of res.rows) {
    const fields = [
      r.id_opcion_menu,
      `"${(r.opcion_menu || '').replace(/"/g, '""')}"`,
      r.url_menu || '',
      r.orden || '',
      r.id_padre || '',
      r.id_perfil || '',
      `"${(r.perfil || '').replace(/"/g, '""')}"`,
      r.vista || ''
    ];
    csv += fields.join(',') + '\n';
  }

  const outPath = path.join(__dirname, '../docs/reestructuracion/matriz-acceso-despues.csv');
  fs.writeFileSync(outPath, csv, 'utf8');
  console.log(`Exportado matriz-acceso-despues.csv: ${res.rows.length} registros.`);

  await pool.end();
}

run().catch(console.error);
