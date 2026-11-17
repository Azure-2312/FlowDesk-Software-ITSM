const { pool } = require('./db.js');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('--- TEST SUITE FASE 7: ACTIVOS ---\n');
  let failures = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
    } else {
      console.error(`  [FAIL] ${message}`);
      failures++;
    }
  }

  // 1. Estructura de menú en DB (#21110 tiene exactamente 8 hijos en orden)
  const menuRes = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden, id_padre
    FROM opciones_menu
    WHERE id_padre = 21110
    ORDER BY orden
  `);
  assert(menuRes.rows.length === 8, `Activos (#21110) tiene exactamente 8 hijos (actual: ${menuRes.rows.length})`);

  const expectedChildren = [
    { id: 21114, nombre: 'Inventario de activos', url: '/plataforma/activos/inventario', orden: 1 },
    { id: 21118, nombre: 'Mis activos', url: '/plataforma/activos/mis-activos', orden: 2 },
    { id: 21112, nombre: 'Asignación, custodia y actas', url: '/plataforma/activos/asignaciones', orden: 3 },
    { id: 21126, nombre: 'Mantenimiento y garantías', url: '/plataforma/activos/mantenimiento', orden: 4 },
    { id: 21132, nombre: 'Licencias de software', url: '/plataforma/activos/licencias', orden: 5 },
    { id: 21144, nombre: 'Contratos y proveedores', url: '/plataforma/activos/contratos', orden: 6 },
    { id: 21123, nombre: 'Bajas de activos', url: '/plataforma/activos/bajas', orden: 7 },
    { id: 21154, nombre: 'Configuración de activos', url: '/plataforma/activos/configuracion', orden: 8 },
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

  // 2. 25 IDs eliminados no existen en opciones_menu
  const eliminatedIds = [
    21111, 21113, 21115, 21116, 21117, 21119, 21120, 21122, 21124, 21125,
    21127, 21128, 21129, 21130, 21131, 21143, 21145, 21146, 21147, 21148,
    21149, 21150, 21151, 21152, 21155
  ];
  const elimRes = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu = ANY($1::int[])
  `, [eliminatedIds]);
  assert(elimRes.rows.length === 0, `25 IDs eliminados no existen en opciones_menu (encontrados: ${elimRes.rows.length})`);

  // 3. Vistas N1 en opciones_menu_vistas_perfiles
  // #21114: todos, mi-area, operativo, importar
  const v21114Res = await pool.query(`SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21114`);
  const v21114Views = v21114Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21114Views) === JSON.stringify(['importar', 'mi-area', 'operativo', 'todos']),
    `#21114 tiene vistas [importar, mi-area, operativo, todos] (obtenido: ${v21114Views.join(', ')})`
  );

  // #21126: garantias, reparaciones
  const v21126Res = await pool.query(`SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21126`);
  const v21126Views = v21126Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21126Views) === JSON.stringify(['garantias', 'reparaciones']),
    `#21126 tiene vistas [garantias, reparaciones] (obtenido: ${v21126Views.join(', ')})`
  );

  // #21132: catalogo-software, consulta, licencias
  const v21132Res = await pool.query(`SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21132`);
  const v21132Views = v21132Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21132Views) === JSON.stringify(['catalogo-software', 'consulta', 'licencias']),
    `#21132 tiene vistas [catalogo-software, consulta, licencias] (obtenido: ${v21132Views.join(', ')})`
  );

  // #21144: contratos, mi-area, proveedores, renovaciones
  const v21144Res = await pool.query(`SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21144`);
  const v21144Views = v21144Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21144Views) === JSON.stringify(['contratos', 'mi-area', 'proveedores', 'renovaciones']),
    `#21144 tiene vistas [contratos, mi-area, proveedores, renovaciones] (obtenido: ${v21144Views.join(', ')})`
  );

  // #21123: consulta, gestion
  const v21123Res = await pool.query(`SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21123`);
  const v21123Views = v21123Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21123Views) === JSON.stringify(['consulta', 'gestion']),
    `#21123 tiene vistas [consulta, gestion] (obtenido: ${v21123Views.join(', ')})`
  );

  // #21154: fabricantes-modelos, listas, tipos-atributos, ubicaciones
  const v21154Res = await pool.query(`SELECT DISTINCT vista FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21154`);
  const v21154Views = v21154Res.rows.map(r => r.vista).sort();
  assert(
    JSON.stringify(v21154Views) === JSON.stringify(['fabricantes-modelos', 'listas', 'tipos-atributos', 'ubicaciones']),
    `#21154 tiene vistas [fabricantes-modelos, listas, tipos-atributos, ubicaciones] (obtenido: ${v21154Views.join(', ')})`
  );

  // 4. R5 No-escalación de privilegios (E7.4)
  // Gestor de Área (5):
  const gAreaViewsRes = await pool.query(`
    SELECT id_opcion_menu, vista FROM opciones_menu_vistas_perfiles WHERE id_perfil = 5 AND id_opcion_menu IN (21114, 21144)
  `);
  const gAreaViews = gAreaViewsRes.rows.map(r => `${r.id_opcion_menu}:${r.vista}`);
  assert(gAreaViews.includes('21114:mi-area'), `Gestor de Área tiene 21114:mi-area`);
  assert(!gAreaViews.includes('21114:todos'), `Gestor de Área NO escala a 21114:todos (E7.4 verificado)`);
  assert(!gAreaViews.includes('21114:operativo'), `Gestor de Área NO escala a 21114:operativo`);
  assert(!gAreaViews.includes('21114:importar'), `Gestor de Área NO escala a 21114:importar`);
  assert(gAreaViews.includes('21144:mi-area'), `Gestor de Área tiene 21144:mi-area`);
  assert(!gAreaViews.includes('21144:contratos'), `Gestor de Área NO escala a 21144:contratos`);

  // Técnico (2):
  const tecViewsRes = await pool.query(`
    SELECT id_opcion_menu, vista FROM opciones_menu_vistas_perfiles WHERE id_perfil = 2 AND id_opcion_menu IN (21114, 21126, 21132)
  `);
  const tecViews = tecViewsRes.rows.map(r => `${r.id_opcion_menu}:${r.vista}`);
  assert(tecViews.includes('21114:operativo'), `Técnico tiene 21114:operativo`);
  assert(!tecViews.includes('21114:todos'), `Técnico NO escala a 21114:todos`);
  assert(tecViews.includes('21126:reparaciones'), `Técnico tiene 21126:reparaciones`);
  assert(!tecViews.includes('21126:garantias'), `Técnico NO escala a 21126:garantias`);
  assert(tecViews.includes('21132:consulta'), `Técnico tiene 21132:consulta`);
  assert(!tecViews.includes('21132:licencias'), `Técnico NO escala a 21132:licencias`);

  // Auditor (6):
  const audViewsRes = await pool.query(`
    SELECT id_opcion_menu, vista FROM opciones_menu_vistas_perfiles WHERE id_perfil = 6 AND id_opcion_menu IN (21123)
  `);
  const audViews = audViewsRes.rows.map(r => `${r.id_opcion_menu}:${r.vista}`);
  assert(audViews.includes('21123:consulta'), `Auditor tiene 21123:consulta`);
  assert(!audViews.includes('21123:gestion'), `Auditor NO escala a 21123:gestion`);

  // Gestor de Activos (9):
  const gActViewsRes = await pool.query(`
    SELECT id_opcion_menu, vista FROM opciones_menu_vistas_perfiles WHERE id_perfil = 9 AND id_opcion_menu = 21154
  `);
  const gActViews = gActViewsRes.rows.map(r => `${r.id_opcion_menu}:${r.vista}`);
  assert(gActViews.includes('21154:fabricantes-modelos'), `Gestor de Activos tiene 21154:fabricantes-modelos`);
  assert(gActViews.includes('21154:ubicaciones'), `Gestor de Activos tiene 21154:ubicaciones`);
  assert(gActViews.includes('21154:listas'), `Gestor de Activos tiene 21154:listas`);
  assert(!gActViews.includes('21154:tipos-atributos'), `Gestor de Activos NO escala a 21154:tipos-atributos`);

  // 5. Verificación física de archivos de rutas eliminadas en disco
  const eliminatedRoutes = [
    'src/app/plataforma/activos/area',
    'src/app/plataforma/activos/bajas/consulta',
    'src/app/plataforma/activos/bajas/renovaciones',
    'src/app/plataforma/activos/cmdb',
    'src/app/plataforma/activos/configuracion/ciclos-vida-transiciones',
    'src/app/plataforma/activos/configuracion/licencias-contratos',
    'src/app/plataforma/activos/configuracion/tipos-modelos-atributos',
    'src/app/plataforma/activos/conteos',
    'src/app/plataforma/activos/contratos-area',
    'src/app/plataforma/activos/importacion',
    'src/app/plataforma/activos/inventario-fisico',
    'src/app/plataforma/activos/inventario-operativo',
    'src/app/plataforma/activos/licencias/catalogo-software',
    'src/app/plataforma/activos/licencias/consulta',
    'src/app/plataforma/activos/licencias/cumplimiento',
    'src/app/plataforma/activos/proveedores',
    'src/app/plataforma/activos/recepcion',
    'src/app/plataforma/activos/renovaciones',
    'src/app/plataforma/activos/reparaciones',
    'src/app/plataforma/activos/reportes',
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
    'src/app/plataforma/activos/inventario/page.tsx',
    'src/app/plataforma/activos/mis-activos/page.tsx',
    'src/app/plataforma/activos/asignaciones/page.tsx',
    'src/app/plataforma/activos/mantenimiento/page.tsx',
    'src/app/plataforma/activos/licencias/page.tsx',
    'src/app/plataforma/activos/contratos/page.tsx',
    'src/app/plataforma/activos/bajas/page.tsx',
    'src/app/plataforma/activos/configuracion/page.tsx',
  ];
  let missingSurvivingFiles = 0;
  for (const r of survivingRoutes) {
    if (!fs.existsSync(path.resolve(r))) {
      missingSurvivingFiles++;
      console.error(`  Ruta sobreviviente falta en disco: ${r}`);
    }
  }
  assert(missingSurvivingFiles === 0, `Todas las 8 rutas sobrevivientes existen en disco`);

  await pool.end();

  if (failures > 0) {
    console.error(`\nSuite FASE 7 falló con ${failures} error(es).`);
    process.exit(1);
  } else {
    console.log(`\nSuite FASE 7 completada con ÉXITO.`);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
