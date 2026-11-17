const { pool } = require('./db.js');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('--- TEST SUITE FASE 8: CMDB ---\n');
  let failures = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
    } else {
      console.error(`  [FAIL] ${message}`);
      failures++;
    }
  }

  // 1. Estructura de menú en DB (#21133 tiene exactamente 4 hijos en orden)
  const menuRes = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden, id_padre
    FROM opciones_menu
    WHERE id_padre = 21133
    ORDER BY orden
  `);
  assert(menuRes.rows.length === 4, `CMDB (#21133) tiene exactamente 4 hijos (actual: ${menuRes.rows.length})`);

  const expectedChildren = [
    { id: 21266, nombre: 'CIs', url: '/plataforma/cmdb/cis', orden: 1 },
    { id: 21139, nombre: 'Topología y relaciones', url: '/plataforma/cmdb/topologia', orden: 2 },
    { id: 21135, nombre: 'Análisis de impacto', url: '/plataforma/cmdb/analisis', orden: 3 },
    { id: 21141, nombre: 'Configuración de CMDB', url: '/plataforma/cmdb/configuracion', orden: 4 },
  ];

  expectedChildren.forEach((exp, idx) => {
    const act = menuRes.rows[idx];
    if (act) {
      assert(
        act.id_opcion_menu === exp.id &&
        act.url_menu === exp.url &&
        act.orden === exp.orden,
        `Hijo #${idx + 1}: esperado ID ${exp.id} (${exp.nombre}, ${exp.url}, orden ${exp.orden}), obtenido ID ${act.id_opcion_menu} (${act.nombre}, ${act.url_menu}, orden ${act.orden})`
      );
    }
  });

  // 2. 7 IDs eliminados no existen en opciones_menu
  const eliminatedIds = [21134, 21136, 21137, 21138, 21140, 21142, 21153];
  const elimRes = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu = ANY($1::int[])
  `, [eliminatedIds]);
  assert(elimRes.rows.length === 0, `7 IDs eliminados no existen en opciones_menu (encontrados: ${elimRes.rows.length})`);

  // 3. Vistas N1 en opciones_menu_vistas_perfiles (#21141)
  const v21141Res = await pool.query(`SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21141`);
  const v21141Views = v21141Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21141Views) === JSON.stringify(['clases', 'relaciones']),
    `#21141 tiene vistas [clases, relaciones] (obtenido: ${v21141Views.join(', ')})`
  );

  // 4. R5 No-escalación de privilegios
  // Gestor de Activos (9): tiene 'clases' pero NO 'relaciones'
  const gActViewsRes = await pool.query(`
    SELECT id_opcion_menu, vista FROM opciones_menu_vistas_perfiles WHERE id_perfil = 9 AND id_opcion_menu = 21141
  `);
  const gActViews = gActViewsRes.rows.map(r => r.vista);
  assert(gActViews.includes('clases'), `Gestor de Activos tiene 21141:clases`);
  assert(!gActViews.includes('relaciones'), `Gestor de Activos NO escala a 21141:relaciones`);

  // Admin (1): tiene 'clases' y 'relaciones'
  const adminViewsRes = await pool.query(`
    SELECT id_opcion_menu, vista FROM opciones_menu_vistas_perfiles WHERE id_perfil = 1 AND id_opcion_menu = 21141
  `);
  const adminViews = adminViewsRes.rows.map(r => r.vista);
  assert(adminViews.includes('clases'), `Admin tiene 21141:clases`);
  assert(adminViews.includes('relaciones'), `Admin tiene 21141:relaciones`);

  // 5. Verificación física de archivos de rutas eliminadas en disco
  const eliminatedRoutes = [
    'src/app/plataforma/cmdb/actualizaciones',
    'src/app/plataforma/cmdb/auditoria',
    'src/app/plataforma/cmdb/inexactitudes',
    'src/app/plataforma/cmdb/lineas-base',
    'src/app/plataforma/cmdb/mapa',
    'src/app/plataforma/cmdb/tipos',
    'src/app/plataforma/cmdb/configuracion/relaciones',
    'src/app/plataforma/activos/configuracion/cmdb-relaciones',
  ];
  let existingEliminatedFiles = 0;
  for (const r of eliminatedRoutes) {
    if (fs.existsSync(path.resolve(r))) {
      existingEliminatedFiles++;
      console.error(`  Ruta eliminada aún existe en disco: ${r}`);
    }
  }
  assert(existingEliminatedFiles === 0, `0 archivos/directorios de rutas eliminadas existen en disco`);

  // 6. Verificación de archivos supervivientes
  const survivingRoutes = [
    'src/app/plataforma/cmdb/cis/page.tsx',
    'src/app/plataforma/cmdb/topologia/page.tsx',
    'src/app/plataforma/cmdb/analisis/page.tsx',
    'src/app/plataforma/cmdb/configuracion/page.tsx',
  ];
  let missingSurvivingFiles = 0;
  for (const r of survivingRoutes) {
    if (!fs.existsSync(path.resolve(r))) {
      missingSurvivingFiles++;
      console.error(`  Ruta sobreviviente falta en disco: ${r}`);
    }
  }
  assert(missingSurvivingFiles === 0, `Todas las 4 rutas sobrevivientes existen en disco`);

  await pool.end();

  if (failures > 0) {
    console.error(`\nSuite FASE 8 falló con ${failures} error(es).`);
    process.exit(1);
  } else {
    console.log(`\nSuite FASE 8 completada con ÉXITO.`);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
