const { pool } = require('./db.js');
const fs = require('fs');

async function testFase12() {
  console.log('--- TEST FASE 12: ORGANIZACIÓN ---');
  let failures = 0;

  // 1. E12.1: Exactamente 2 hijos bajo #21264 en orden
  const resHijos = await pool.query(`
    SELECT id_opcion_menu, nombre, orden, url_menu
    FROM opciones_menu
    WHERE id_padre = 21264
    ORDER BY orden, id_opcion_menu
  `);

  const esperados = [
    { id: 21204, orden: 1, url: '/plataforma/organizacion/departamentos-empresa' },
    { id: 21205, orden: 2, url: '/plataforma/organizacion/grupos-ti' },
  ];

  if (resHijos.rows.length === 2) {
    console.log('✅ E12.1: Exactamente 2 hijos bajo #21264 «Organización»');
  } else {
    console.error(`❌ E12.1: Se esperaban 2 hijos, se encontraron ${resHijos.rows.length}`);
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

  // 2. E12.2: 2 filas eliminadas (#21206, #21207)
  const idsEliminados = [21206, 21207];
  const resBorrados = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu = ANY($1)
  `, [idsEliminados]);

  if (resBorrados.rows.length === 0) {
    console.log('✅ E12.2: Las 2 filas eliminadas (#21206, #21207) no existen en BD');
  } else {
    console.error(`❌ E12.2: Todavía existen opciones eliminadas en BD: ${JSON.stringify(resBorrados.rows)}`);
    failures++;
  }

  // 3. E12.3: Rutas viejas eliminadas de disco (404)
  const rutasBorradas = [
    'src/app/plataforma/organizacion/departamentos/page.tsx',
    'src/app/plataforma/organizacion/departamentos/supervisores/page.tsx',
    'src/app/plataforma/organizacion/tecnicos/page.tsx',
  ];
  let rutasBorradasOk = true;
  for (const r of rutasBorradas) {
    if (fs.existsSync(r)) {
      console.error(`❌ E12.3: Ruta obsoleta todavía existe en disco: ${r}`);
      rutasBorradasOk = false;
      failures++;
    }
  }
  if (rutasBorradasOk) {
    console.log('✅ E12.3: Todas las 3 rutas viejas eliminadas físicamente de disco (404)');
  }

  // 4. E12.4: Rutas canónicas existen
  const rutasCanonicas = [
    'src/app/plataforma/organizacion/departamentos-empresa/page.tsx',
    'src/app/plataforma/organizacion/grupos-ti/page.tsx',
  ];
  let rutasCanonicasOk = true;
  for (const r of rutasCanonicas) {
    if (!fs.existsSync(r)) {
      console.error(`❌ E12.4: Falta ruta canónica en disco: ${r}`);
      rutasCanonicasOk = false;
      failures++;
    }
  }
  if (rutasCanonicasOk) {
    console.log('✅ E12.4: Todas las 2 rutas canónicas existen en disco');
  }

  // 5. Permisos por vista para #21205
  const resVistas = await pool.query(`
    SELECT id_opcion_menu, vista, id_perfil
    FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu = 21205
    ORDER BY vista
  `);
  const vistas = resVistas.rows.map(r => r.vista);
  if (vistas.includes('grupos') && vistas.includes('tecnicos') && vistas.includes('supervisores')) {
    console.log('✅ R5: #21205 tiene vistas "grupos", "tecnicos" y "supervisores"');
  } else {
    console.error(`❌ R5: Faltan vistas en #21205: ${JSON.stringify(vistas)}`);
    failures++;
  }

  await pool.end();

  if (failures === 0) {
    console.log('\n🎉 TODOS LOS TESTS DE FASE 12 PASARON AL 100%');
  } else {
    console.error(`\n❌ ${failures} FALLOS DETECTADOS EN FASE 12`);
    process.exit(1);
  }
}

testFase12().catch(err => {
  console.error(err);
  process.exit(1);
});
