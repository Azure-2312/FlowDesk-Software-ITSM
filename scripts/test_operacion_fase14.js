const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function test() {
  console.log('=== TEST FASE 14: RETIRO DE LA RAÍZ OPERACIÓN ===\n');
  let failures = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  [PASS] ${msg}`);
    } else {
      console.error(`  [FAIL] ${msg}`);
      failures++;
    }
  }

  // 1. Verificar conteo de raíces = exactamente 11 (E14.1)
  const resRoots = await pool.query(`
    SELECT id_opcion_menu, nombre, orden
    FROM opciones_menu
    WHERE id_padre IS NULL
    ORDER BY orden, id_opcion_menu
  `);
  assert(resRoots.rows.length === 11, `E14.1: Menú tiene exactamente 11 raíces (obtenido: ${resRoots.rows.length})`);
  
  const raicesEsperadas = [
    21001, // Mi trabajo
    21023, // Mesa de Servicio
    21059, // Cambios
    21091, // Problemas
    21109, // Activos y CMDB
    21156, // Conocimiento
    21163, // Catálogo de Servicios
    21174, // Reportes
    21264, // Organización
    21215, // Plataforma
    21225  // Mi cuenta
  ];

  const raicesObtenidas = resRoots.rows.map(r => r.id_opcion_menu);
  const todasPresentes = raicesEsperadas.every(id => raicesObtenidas.includes(id));
  assert(todasPresentes, `E14.1: Todas las 11 raíces esperadas están presentes en la BD`);

  // 2. Verificar eliminación de las 4 filas (E14.2)
  const eliminadas = [21170, 21171, 21172, 21173];
  const resElimMenu = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu = ANY($1)
  `, [eliminadas]);
  assert(resElimMenu.rows.length === 0, `E14.2: 4 opciones eliminadas de opciones_menu (quedan: ${resElimMenu.rows.length})`);

  const resElimPerfiles = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu_perfiles WHERE id_opcion_menu = ANY($1)
  `, [eliminadas]);
  assert(resElimPerfiles.rows.length === 0, `E14.2: 4 opciones eliminadas de opciones_menu_perfiles (quedan: ${resElimPerfiles.rows.length})`);

  // 3. Verificar rutas físicas borradas (E14.3)
  const rutasBorradas = [
    'src/app/plataforma/operacion/page.tsx',
    'src/app/plataforma/operacion/eventos/page.tsx',
    'src/app/plataforma/operacion/eventos-resiliencia/page.tsx',
    'src/app/plataforma/operacion/resiliencia/page.tsx'
  ];

  for (const r of rutasBorradas) {
    const fullPath = path.join(__dirname, '..', r);
    assert(!fs.existsSync(fullPath), `E14.3: Ruta física no existe: ${r}`);
  }

  // 4. Verificar que Mis tareas (#21020) sigue existiendo y activa
  const resTareas = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, id_padre
    FROM opciones_menu
    WHERE id_opcion_menu = 21020
  `);
  assert(resTareas.rows.length === 1, `Mis tareas (#21020) existe en opciones_menu`);
  assert(resTareas.rows[0].url_menu === '/plataforma/operacion/tareas', `Mis tareas conserva URL /plataforma/operacion/tareas`);
  assert(fs.existsSync(path.join(__dirname, '../src/app/plataforma/operacion/tareas/page.tsx')), `Mis tareas tiene page.tsx en disco`);

  await pool.end();

  if (failures === 0) {
    console.log('\n>>> TODOS LOS TESTS DE FASE 14 PASARON EXITOSAMENTE (100% PASS) <<<');
  } else {
    console.error(`\n>>> ${failures} TESTS FALLARON EN FASE 14 <<<`);
    process.exit(1);
  }
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});
