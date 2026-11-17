const { pool } = require('./db.js');
const fs = require('fs');

async function testFase11() {
  console.log('--- TEST FASE 11: REPORTES ---');
  let failures = 0;

  // 1. E11.1: Exactamente 4 hijos bajo #21174 en orden
  const resHijos = await pool.query(`
    SELECT id_opcion_menu, nombre, orden, url_menu
    FROM opciones_menu
    WHERE id_padre = 21174
    ORDER BY orden, id_opcion_menu
  `);

  const esperados = [
    { id: 21175, orden: 1, url: '/plataforma/reportes/operativos' },
    { id: 21179, orden: 2, url: '/plataforma/reportes/cambios' },
    { id: 21178, orden: 3, url: '/plataforma/reportes/activos' },
    { id: 21177, orden: 4, url: '/plataforma/reportes/productividad' },
  ];

  if (resHijos.rows.length === 4) {
    console.log('✅ E11.1: Exactamente 4 hijos bajo #21174 «Reportes»');
  } else {
    console.error(`❌ E11.1: Se esperaban 4 hijos, se encontraron ${resHijos.rows.length}`);
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

  // 2. E11.2: 4 filas eliminadas (#21176, #21180, #21181, #21182)
  const idsEliminados = [21176, 21180, 21181, 21182];
  const resBorrados = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu = ANY($1)
  `, [idsEliminados]);

  if (resBorrados.rows.length === 0) {
    console.log('✅ E11.2: Las 4 filas eliminadas (#21176, #21180, #21181, #21182) no existen en BD');
  } else {
    console.error(`❌ E11.2: Todavía existen opciones eliminadas en BD: ${JSON.stringify(resBorrados.rows)}`);
    failures++;
  }

  // 3. E11.3: Rutas viejas eliminadas de disco (404)
  const rutasBorradas = [
    'src/app/plataforma/reportes/auditoria/page.tsx',
    'src/app/plataforma/reportes/decisiones/page.tsx',
    'src/app/plataforma/reportes/problemas/page.tsx',
    'src/app/plataforma/reportes/area/page.tsx',
  ];
  let rutasBorradasOk = true;
  for (const r of rutasBorradas) {
    if (fs.existsSync(r)) {
      console.error(`❌ E11.3: Ruta obsoleta todavía existe en disco: ${r}`);
      rutasBorradasOk = false;
      failures++;
    }
  }
  if (rutasBorradasOk) {
    console.log('✅ E11.3: Todas las 4 rutas viejas eliminadas físicamente de disco (404)');
  }

  // 4. E11.4: Rutas canónicas existen
  const rutasCanonicas = [
    'src/app/plataforma/reportes/operativos/page.tsx',
    'src/app/plataforma/reportes/cambios/page.tsx',
    'src/app/plataforma/reportes/activos/page.tsx',
    'src/app/plataforma/reportes/productividad/page.tsx',
  ];
  let rutasCanonicasOk = true;
  for (const r of rutasCanonicas) {
    if (!fs.existsSync(r)) {
      console.error(`❌ E11.4: Falta ruta canónica en disco: ${r}`);
      rutasCanonicasOk = false;
      failures++;
    }
  }
  if (rutasCanonicasOk) {
    console.log('✅ E11.4: Todas las 4 rutas canónicas existen en disco');
  }

  // 5. R5: No escalación de privilegios
  const resVistas = await pool.query(`
    SELECT id_opcion_menu, vista, id_perfil
    FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu IN (21175, 21179)
    ORDER BY id_opcion_menu, id_perfil, vista
  `);

  const vistas21175GestorArea = resVistas.rows.filter(r => r.id_opcion_menu === 21175 && r.id_perfil === 5).map(r => r.vista);
  const vistas21175Auditor = resVistas.rows.filter(r => r.id_opcion_menu === 21175 && r.id_perfil === 6).map(r => r.vista);
  const vistas21175Supervisor = resVistas.rows.filter(r => r.id_opcion_menu === 21175 && r.id_perfil === 4).map(r => r.vista);

  if (vistas21175GestorArea.length === 1 && vistas21175GestorArea[0] === 'area') {
    console.log('✅ R5: Gestor de Área (5) en #21175 SOLO tiene vista "area" (sin acceso a operativos institucionales)');
  } else {
    console.error(`❌ R5: Gestor de Área tiene vistas inesperadas: ${JSON.stringify(vistas21175GestorArea)}`);
    failures++;
  }

  if (vistas21175Auditor.length === 1 && vistas21175Auditor[0] === 'operativo') {
    console.log('✅ R5: Auditor (6) en #21175 SOLO tiene vista "operativo"');
  } else {
    console.error(`❌ R5: Auditor tiene vistas inesperadas: ${JSON.stringify(vistas21175Auditor)}`);
    failures++;
  }

  if (vistas21175Supervisor.includes('operativo') && vistas21175Supervisor.includes('area')) {
    console.log('✅ R5: Supervisor (4) en #21175 tiene ambas vistas: "operativo" y "area"');
  } else {
    console.error(`❌ R5: Supervisor carece de vistas: ${JSON.stringify(vistas21175Supervisor)}`);
    failures++;
  }

  const vistas21179Cambios = resVistas.rows.filter(r => r.id_opcion_menu === 21179 && r.id_perfil === 8).map(r => r.vista);
  const vistas21179Problemas = resVistas.rows.filter(r => r.id_opcion_menu === 21179 && r.id_perfil === 10).map(r => r.vista);
  const vistas21179Admin = resVistas.rows.filter(r => r.id_opcion_menu === 21179 && r.id_perfil === 1).map(r => r.vista);

  if (vistas21179Cambios.length === 1 && vistas21179Cambios[0] === 'cambios') {
    console.log('✅ R5: Gestor de Cambios (8) en #21179 SOLO tiene vista "cambios" (sin acceso a problemas)');
  } else {
    console.error(`❌ R5: Gestor de Cambios tiene vistas inesperadas: ${JSON.stringify(vistas21179Cambios)}`);
    failures++;
  }

  if (vistas21179Problemas.length === 1 && vistas21179Problemas[0] === 'problemas') {
    console.log('✅ R5: Gestor de Problemas (10) en #21179 SOLO tiene vista "problemas" (sin acceso a cambios)');
  } else {
    console.error(`❌ R5: Gestor de Problemas tiene vistas inesperadas: ${JSON.stringify(vistas21179Problemas)}`);
    failures++;
  }

  if (vistas21179Admin.includes('cambios') && vistas21179Admin.includes('problemas')) {
    console.log('✅ R5: Administrador (1) en #21179 tiene ambas vistas: "cambios" y "problemas"');
  } else {
    console.error(`❌ R5: Admin carece de vistas completas en #21179: ${JSON.stringify(vistas21179Admin)}`);
    failures++;
  }

  await pool.end();

  if (failures === 0) {
    console.log('\n🎉 TODOS LOS TESTS DE FASE 11 PASARON AL 100%');
  } else {
    console.error(`\n❌ ${failures} FALLOS DETECTADOS EN FASE 11`);
    process.exit(1);
  }
}

testFase11().catch(err => {
  console.error(err);
  process.exit(1);
});
