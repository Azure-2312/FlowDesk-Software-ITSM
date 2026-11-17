const { pool } = require('./db.js');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('--- TEST SUITE FASE 6: PROBLEMAS ---\n');
  let failures = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
    } else {
      console.error(`  [FAIL] ${message}`);
      failures++;
    }
  }

  // 1. Estructura de menú en DB (#21091 tiene exactamente 5 hijos en orden)
  const menuRes = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden, id_padre
    FROM opciones_menu
    WHERE id_padre = 21091
    ORDER BY orden
  `);
  assert(menuRes.rows.length === 5, `Problemas tiene exactamente 5 hijos (actual: ${menuRes.rows.length})`);
  
  const expectedChildren = [
    { id: 21105, nombre: 'Registrar problema', url: '/plataforma/problemas/crear', orden: 1 },
    { id: 21093, nombre: 'Bandeja de problemas', url: '/plataforma/problemas/bandeja', orden: 2 },
    { id: 21095, nombre: 'Candidatos a problema', url: '/plataforma/problemas/candidatos', orden: 3 },
    { id: 21098, nombre: 'Errores conocidos', url: '/plataforma/problemas/kedb', orden: 4 },
    { id: 21199, nombre: 'Configuración de problemas', url: '/plataforma/problemas/configuracion', orden: 5 },
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

  // 2. 15 IDs eliminados no existen en opciones_menu
  const eliminatedIds = [
    21092, 21094, 21096, 21097, 21099, 21100, 21101, 21102, 21103, 21104,
    21106, 21107, 21108, 21200, 21201
  ];
  const elimRes = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu = ANY($1::int[])
  `, [eliminatedIds]);
  assert(elimRes.rows.length === 0, `15 IDs eliminados no existen en opciones_menu (encontrados: ${elimRes.rows.length})`);

  // 3. Vistas N1 en opciones_menu_vistas_perfiles
  // #21093: sin-asignar, asignados, grupo, historial
  const v21093Res = await pool.query(`
    SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21093
  `);
  const v21093Views = v21093Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21093Views) === JSON.stringify(['asignados', 'grupo', 'historial', 'sin-asignar']),
    `#21093 tiene vistas [asignados, grupo, historial, sin-asignar] en opciones_menu_vistas_perfiles (obtenido: ${v21093Views.join(', ')})`
  );

  // #21095: propuestos, recurrentes
  const v21095Res = await pool.query(`
    SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21095
  `);
  const v21095Views = v21095Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21095Views) === JSON.stringify(['propuestos', 'recurrentes']),
    `#21095 tiene vistas [propuestos, recurrentes] en opciones_menu_vistas_perfiles (obtenido: ${v21095Views.join(', ')})`
  );

  // #21199: campos, listas
  const v21199Res = await pool.query(`
    SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21199
  `);
  const v21199Views = v21199Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21199Views) === JSON.stringify(['campos', 'listas']),
    `#21199 tiene vistas [campos, listas] en opciones_menu_vistas_perfiles (obtenido: ${v21199Views.join(', ')})`
  );

  // #21045 (Monitor de SLA): tiene vista problemas
  const v21045Res = await pool.query(`
    SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21045 AND vista = 'problemas'
  `);
  assert(v21045Res.rows.length > 0, `#21045 (Monitor de SLA) contiene vista 'problemas'`);

  // 4. R5 No-escalación de privilegios
  // Perfil Técnico (2): debe tener 'asignados', 'grupo', 'propuestos', pero NO 'recurrentes', 'campos', 'listas'
  const tecViewsRes = await pool.query(`
    SELECT id_opcion_menu, vista FROM opciones_menu_vistas_perfiles WHERE id_perfil = 2 AND id_opcion_menu IN (21093, 21095, 21199)
  `);
  const tecViews = tecViewsRes.rows.map(r => `${r.id_opcion_menu}:${r.vista}`);
  assert(tecViews.includes('21093:asignados'), `Técnico tiene 21093:asignados`);
  assert(tecViews.includes('21093:grupo'), `Técnico tiene 21093:grupo`);
  assert(tecViews.includes('21095:propuestos'), `Técnico tiene 21095:propuestos`);
  assert(!tecViews.includes('21095:recurrentes'), `Técnico NO escala a 21095:recurrentes`);
  assert(!tecViews.includes('21199:campos'), `Técnico NO escala a 21199:campos`);
  assert(!tecViews.includes('21199:listas'), `Técnico NO escala a 21199:listas`);

  // 5. Verificación física de archivos de rutas eliminadas (deben ser 0)
  const eliminatedRoutes = [
    'src/app/plataforma/problemas/analisis',
    'src/app/plataforma/problemas/aprobaciones',
    'src/app/plataforma/problemas/asignacion',
    'src/app/plataforma/problemas/asignados',
    'src/app/plataforma/problemas/cambios',
    'src/app/plataforma/problemas/conocimiento',
    'src/app/plataforma/problemas/grupo',
    'src/app/plataforma/problemas/historial',
    'src/app/plataforma/problemas/mayores',
    'src/app/plataforma/problemas/objetivos',
    'src/app/plataforma/problemas/recurrentes',
    'src/app/plataforma/problemas/configuracion/flujo',
    'src/app/plataforma/problemas/configuracion/formulario',
    'src/app/plataforma/problemas/configuracion/relaciones',
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
    'src/app/plataforma/problemas/crear/page.tsx',
    'src/app/plataforma/problemas/bandeja/page.tsx',
    'src/app/plataforma/problemas/candidatos/page.tsx',
    'src/app/plataforma/problemas/kedb/page.tsx',
    'src/app/plataforma/problemas/configuracion/page.tsx',
    'src/app/plataforma/problemas/[id]/page.tsx',
  ];
  let missingSurvivingFiles = 0;
  for (const r of survivingRoutes) {
    if (!fs.existsSync(path.resolve(r))) {
      missingSurvivingFiles++;
      console.error(`  Ruta sobreviviente falta en disco: ${r}`);
    }
  }
  assert(missingSurvivingFiles === 0, `Todas las 6 rutas sobrevivientes existen en disco`);

  await pool.end();

  if (failures > 0) {
    console.error(`\nSuite FASE 6 falló con ${failures} error(es).`);
    process.exit(1);
  } else {
    console.log(`\nSuite FASE 6 completada con ÉXITO.`);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
