const { pool } = require('./db.js');
const fs = require('fs');

async function testFase10() {
  console.log('--- TEST FASE 10: CATÁLOGO DE SERVICIOS Y MATRIZ ÚNICA ---');
  let failures = 0;

  // 1. E10.1: Exactamente 2 hijos bajo #21163 en orden
  const resHijos = await pool.query(`
    SELECT id_opcion_menu, nombre, orden, url_menu
    FROM opciones_menu
    WHERE id_padre = 21163
    ORDER BY orden, id_opcion_menu
  `);

  const esperados = [
    { id: 21164, orden: 1, url: '/plataforma/servicios/catalogo' },
    { id: 21167, orden: 2, url: '/plataforma/servicios/configuracion/sla' },
  ];

  if (resHijos.rows.length === 2) {
    console.log('✅ E10.1: Exactamente 2 hijos bajo #21163 «Catálogo de Servicios»');
  } else {
    console.error(`❌ E10.1: Se esperaban 2 hijos, se encontraron ${resHijos.rows.length}`);
    failures++;
  }

  for (let i = 0; i < esperados.length; i++) {
    const exp = esperados[i];
    const actual = resHijos.rows[i];
    if (actual && actual.id_opcion_menu === exp.id && actual.orden === exp.orden && actual.url_menu === exp.url) {
      console.log(`✅ Hijo #${exp.id} (${exp.url}) en orden ${exp.orden} correcto`);
    } else {
      console.error(`❌ Discrepancia en hijo orden ${exp.orden}: esperado ${JSON.stringify(exp)}, obtenido ${JSON.stringify(actual)}`);
      failures++;
    }
  }

  // 2. E10.2: 6 filas eliminadas (#21165, #21166, #21168, #21169, #21237, #21248)
  const idsEliminados = [21165, 21166, 21168, 21169, 21237, 21248];
  const resBorrados = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu = ANY($1)
  `, [idsEliminados]);

  if (resBorrados.rows.length === 0) {
    console.log('✅ E10.2: Las 6 filas eliminadas (#21165, #21166, #21168, #21169, #21237, #21248) no existen en BD');
  } else {
    console.error(`❌ E10.2: Todavía existen opciones eliminadas en BD: ${JSON.stringify(resBorrados.rows)}`);
    failures++;
  }

  // 3. E10.3: 6 rutas viejas devuelven 404 (físicamente borradas de disco)
  const rutasBorradas = [
    'src/app/plataforma/servicios/configuracion/categorias/page.tsx',
    'src/app/plataforma/servicios/configuracion/crear/page.tsx',
    'src/app/plataforma/servicios/configuracion/incidentes/page.tsx',
    'src/app/plataforma/servicios/configuracion/solicitudes/page.tsx',
    'src/app/plataforma/incidentes/catalogo/page.tsx',
    'src/app/plataforma/solicitudes/catalogo/page.tsx',
  ];
  let rutasBorradasOk = true;
  for (const r of rutasBorradas) {
    if (fs.existsSync(r)) {
      console.error(`❌ E10.3: Ruta obsoleta todavía existe en disco: ${r}`);
      rutasBorradasOk = false;
      failures++;
    }
  }
  if (rutasBorradasOk) {
    console.log('✅ E10.3: Todas las 6 rutas viejas eliminadas físicamente de disco (404)');
  }

  // 4. E10.4: Matriz de prioridad única institucional
  const resMatriz = await pool.query(`
    SELECT DISTINCT entidad FROM matriz_prioridad_institucional
  `);
  const entidades = resMatriz.rows.map(r => r.entidad);
  if (entidades.includes('compartida')) {
    console.log('✅ E10.4: Matriz de prioridad institucional única operativa (fuente: matriz_prioridad_institucional)');
  } else {
    console.error('❌ E10.4: No se encontró la entidad compartida en matriz_prioridad_institucional');
    failures++;
  }

  // 5. R5: No escalación de privilegios en vistas N1
  const resVistas = await pool.query(`
    SELECT id_opcion_menu, vista, id_perfil
    FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu IN (21164, 21167)
    ORDER BY id_opcion_menu, id_perfil, vista
  `);

  const vistas21164Solicitante = resVistas.rows.filter(r => r.id_opcion_menu === 21164 && r.id_perfil === 3).map(r => r.vista);
  const vistas21164GestorArea = resVistas.rows.filter(r => r.id_opcion_menu === 21164 && r.id_perfil === 5).map(r => r.vista);
  const vistas21164Tecnico = resVistas.rows.filter(r => r.id_opcion_menu === 21164 && r.id_perfil === 2).map(r => r.vista);
  const vistas21164Admin = resVistas.rows.filter(r => r.id_opcion_menu === 21164 && r.id_perfil === 1).map(r => r.vista);

  if (vistas21164Solicitante.length === 1 && vistas21164Solicitante[0] === 'explorar') {
    console.log('✅ R5: Solicitante (3) en #21164 SOLO tiene vista "explorar" (sin escalación)');
  } else {
    console.error(`❌ R5: Solicitante tiene vistas inesperadas: ${JSON.stringify(vistas21164Solicitante)}`);
    failures++;
  }

  if (vistas21164GestorArea.length === 1 && vistas21164GestorArea[0] === 'explorar') {
    console.log('✅ R5: Gestor de Área (5) en #21164 SOLO tiene vista "explorar" (sin escalación)');
  } else {
    console.error(`❌ R5: Gestor de Área tiene vistas inesperadas: ${JSON.stringify(vistas21164GestorArea)}`);
    failures++;
  }

  if (vistas21164Tecnico.length === 1 && vistas21164Tecnico[0] === 'explorar') {
    console.log('✅ R5: Técnico (2) en #21164 SOLO tiene vista "explorar" (sin escalación)');
  } else {
    console.error(`❌ R5: Técnico tiene vistas inesperadas: ${JSON.stringify(vistas21164Tecnico)}`);
    failures++;
  }

  if (vistas21164Admin.length === 5) {
    console.log('✅ R5: Administrador (1) en #21164 tiene las 5 vistas de catálogo y administración');
  } else {
    console.error(`❌ R5: Admin carece de vistas completas en #21164: ${JSON.stringify(vistas21164Admin)}`);
    failures++;
  }

  const vistas21167Admin = resVistas.rows.filter(r => r.id_opcion_menu === 21167 && r.id_perfil === 1).map(r => r.vista);
  if (vistas21167Admin.includes('tiempos') && vistas21167Admin.includes('matriz')) {
    console.log('✅ R5: Administrador (1) en #21167 tiene vistas "tiempos" y "matriz"');
  } else {
    console.error(`❌ R5: Admin carece de vistas en #21167: ${JSON.stringify(vistas21167Admin)}`);
    failures++;
  }

  await pool.end();

  if (failures === 0) {
    console.log('\n🎉 TODOS LOS TESTS DE FASE 10 PASARON AL 100%');
  } else {
    console.error(`\n❌ ${failures} FALLOS DETECTADOS EN FASE 10`);
    process.exit(1);
  }
}

testFase10().catch(err => {
  console.error(err);
  process.exit(1);
});
