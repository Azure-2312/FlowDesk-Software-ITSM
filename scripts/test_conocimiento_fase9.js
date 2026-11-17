const { pool } = require('./db.js');
const fs = require('fs');
const path = require('path');

async function testFase9() {
  console.log('--- TEST FASE 9: GESTIÓN DEL CONOCIMIENTO ---');
  let failures = 0;

  // 1. E9.1: 5 hijos bajo #21156 en orden
  const resHijos = await pool.query(`
    SELECT id_opcion_menu, nombre, orden, url_menu
    FROM opciones_menu
    WHERE id_padre = 21156
    ORDER BY orden, id_opcion_menu
  `);

  const esperados = [
    { id: 21157, orden: 1, url: '/plataforma/conocimiento/base' },
    { id: 21159, orden: 2, url: '/plataforma/conocimiento/crear' },
    { id: 21160, orden: 3, url: '/plataforma/conocimiento/mis-articulos' },
    { id: 21161, orden: 4, url: '/plataforma/conocimiento/publicacion' },
    { id: 21202, orden: 5, url: '/plataforma/conocimiento/configuracion' },
  ];

  if (resHijos.rows.length === 5) {
    console.log('✅ E9.1: Exactamente 5 hijos bajo #21156 «Conocimiento»');
  } else {
    console.error(`❌ E9.1: Se esperaban 5 hijos, se encontraron ${resHijos.rows.length}`);
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

  // 2. E9.2: 2 filas eliminadas (#21158, #21162)
  const resBorrados = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu IN (21158, 21162)
  `);
  if (resBorrados.rows.length === 0) {
    console.log('✅ E9.2: #21158 y #21162 eliminados de la BD');
  } else {
    console.error(`❌ E9.2: Todavía existen opciones eliminadas en BD: ${JSON.stringify(resBorrados.rows)}`);
    failures++;
  }

  // 3. E9.3: Rutas viejas eliminadas de disco
  const rutasEliminadas = [
    'src/app/plataforma/conocimiento/nuevo/page.tsx',
    'src/app/plataforma/conocimiento/revisiones/page.tsx',
    'src/app/plataforma/conocimiento/configuracion/articulos/page.tsx',
    'src/app/plataforma/conocimiento/configuracion/categorias/page.tsx',
  ];
  let rutasEliminadasOk = true;
  for (const r of rutasEliminadas) {
    if (fs.existsSync(r)) {
      console.error(`❌ E9.3: Archivo obsoleto todavía existe en disco: ${r}`);
      rutasEliminadasOk = false;
      failures++;
    }
  }
  if (rutasEliminadasOk) {
    console.log('✅ E9.3: Todas las rutas obsoletas eliminadas físicamente de disco (404)');
  }

  // 4. E9.4: Rutas canónicas existen en disco
  const rutasCanonicas = [
    'src/app/plataforma/conocimiento/base/page.tsx',
    'src/app/plataforma/conocimiento/crear/page.tsx',
    'src/app/plataforma/conocimiento/mis-articulos/page.tsx',
    'src/app/plataforma/conocimiento/publicacion/page.tsx',
    'src/app/plataforma/conocimiento/configuracion/page.tsx',
  ];
  let rutasCanonicasOk = true;
  for (const r of rutasCanonicas) {
    if (!fs.existsSync(r)) {
      console.error(`❌ E9.4: Falta ruta canónica en disco: ${r}`);
      rutasCanonicasOk = false;
      failures++;
    }
  }
  if (rutasCanonicasOk) {
    console.log('✅ E9.4: Todas las 5 pantallas canónicas existen en disco');
  }

  // 5. E9.5: 0 referencias a portal_preview
  function walk(dir) {
    let hits = [];
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) {
        hits = hits.concat(walk(p));
      } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        const c = fs.readFileSync(p, 'utf8');
        if (c.includes('portal_preview') || c.includes('/conocimiento/nuevo') || c.includes('/conocimiento/revisiones')) {
          hits.push(p);
        }
      }
    }
    return hits;
  }
  const hits = walk('src');
  if (hits.length === 0) {
    console.log('✅ E9.5: 0 referencias a portal_preview, /conocimiento/nuevo o /conocimiento/revisiones');
  } else {
    console.error(`❌ E9.5: Referencias residuales encontradas: ${JSON.stringify(hits)}`);
    failures++;
  }

  // 6. R5: No escalación de privilegios en vistas N1
  const resVistas = await pool.query(`
    SELECT id_opcion_menu, vista, id_perfil
    FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu IN (21161, 21202)
    ORDER BY id_opcion_menu, id_perfil, vista
  `);

  const vistas21161Tecnico = resVistas.rows.filter(r => r.id_opcion_menu === 21161 && r.id_perfil === 2).map(r => r.vista);
  const vistas21161Supervisor = resVistas.rows.filter(r => r.id_opcion_menu === 21161 && r.id_perfil === 4).map(r => r.vista);
  const vistas21161Admin = resVistas.rows.filter(r => r.id_opcion_menu === 21161 && r.id_perfil === 1).map(r => r.vista);

  if (vistas21161Tecnico.length === 1 && vistas21161Tecnico[0] === 'pendientes') {
    console.log('✅ R5: Perfil Técnico (2) en #21161 SOLO tiene vista "pendientes" (sin escalación a publicacion)');
  } else {
    console.error(`❌ R5: Técnico tiene vistas inesperadas en #21161: ${JSON.stringify(vistas21161Tecnico)}`);
    failures++;
  }

  if (vistas21161Supervisor.includes('publicacion') && vistas21161Supervisor.includes('pendientes')) {
    console.log('✅ R5: Perfil Supervisor (4) en #21161 tiene vistas "publicacion" y "pendientes"');
  } else {
    console.error(`❌ R5: Supervisor carece de vistas completas en #21161: ${JSON.stringify(vistas21161Supervisor)}`);
    failures++;
  }

  if (vistas21161Admin.includes('publicacion') && vistas21161Admin.includes('pendientes')) {
    console.log('✅ R5: Perfil Admin (1) en #21161 tiene vistas "publicacion" y "pendientes"');
  } else {
    console.error(`❌ R5: Admin carece de vistas completas en #21161: ${JSON.stringify(vistas21161Admin)}`);
    failures++;
  }

  const vistas21202Admin = resVistas.rows.filter(r => r.id_opcion_menu === 21202 && r.id_perfil === 1).map(r => r.vista);
  if (vistas21202Admin.includes('articulos') && vistas21202Admin.includes('politicas')) {
    console.log('✅ R5: Perfil Admin (1) en #21202 tiene vistas "articulos" y "politicas"');
  } else {
    console.error(`❌ R5: Admin carece de vistas completas en #21202: ${JSON.stringify(vistas21202Admin)}`);
    failures++;
  }

  await pool.end();

  if (failures === 0) {
    console.log('\n🎉 TODOS LOS TESTS DE FASE 9 PASARON AL 100%');
  } else {
    console.error(`\n❌ ${failures} FALLOS DETECTADOS EN FASE 9`);
    process.exit(1);
  }
}

testFase9().catch(err => {
  console.error(err);
  process.exit(1);
});
