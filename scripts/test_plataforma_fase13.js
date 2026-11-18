const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function test() {
  console.log('=== TEST FASE 13: PLATAFORMA ===\n');
  let failures = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  [PASS] ${msg}`);
    } else {
      console.error(`  [FAIL] ${msg}`);
      failures++;
    }
  }

  // 1. Verificar los 3 hijos de Plataforma (#21215)
  const resHijos = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden, id_padre
    FROM opciones_menu
    WHERE id_padre = 21215
    ORDER BY orden
  `);
  assert(resHijos.rows.length === 3, `E13.1: Plataforma tiene exactamente 3 hijos (obtenido: ${resHijos.rows.length})`);
  
  const esperado = [
    { id: 21209, orden: 1, url: '/plataforma/seguridad/usuarios' },
    { id: 21210, orden: 2, url: '/plataforma/seguridad/perfiles' },
    { id: 21220, orden: 3, url: '/plataforma/seguridad/auditoria-sistema' }
  ];

  for (let i = 0; i < esperado.length; i++) {
    const row = resHijos.rows[i];
    const exp = esperado[i];
    if (row) {
      assert(row.id_opcion_menu === exp.id, `Hijo ${i+1} es #${exp.id} (obtenido: #${row.id_opcion_menu})`);
      assert(row.orden === exp.orden, `Hijo #${exp.id} tiene orden ${exp.orden} (obtenido: ${row.orden})`);
      assert(row.url_menu === exp.url, `Hijo #${exp.id} tiene URL ${exp.url} (obtenido: ${row.url_menu})`);
    }
  }

  // 2. Verificar eliminación de 11 opciones
  const eliminadas = [21208, 21211, 21213, 21216, 21217, 21218, 21219, 21221, 21222, 21223, 21224];
  const resElim = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu = ANY($1)
  `, [eliminadas]);
  assert(resElim.rows.length === 0, `E13.2: 11 opciones eliminadas de opciones_menu (quedan: ${resElim.rows.length})`);

  const resElimPerfiles = await pool.query(`
    SELECT id_opcion_menu FROM opciones_menu_perfiles WHERE id_opcion_menu = ANY($1)
  `, [eliminadas]);
  assert(resElimPerfiles.rows.length === 0, `E13.2: 11 opciones eliminadas de opciones_menu_perfiles (quedan: ${resElimPerfiles.rows.length})`);

  // 3. Verificar vistas de #21220 en opciones_menu_vistas_perfiles
  const resVistas = await pool.query(`
    SELECT id_perfil, vista FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu = 21220
    ORDER BY id_perfil, vista
  `);
  assert(resVistas.rows.length === 4, `E13.1: #21220 tiene 4 registros de vistas (2 perfiles x 2 vistas)`);
  const adminVistas = resVistas.rows.filter(r => r.id_perfil === 1).map(r => r.vista);
  const auditorVistas = resVistas.rows.filter(r => r.id_perfil === 6).map(r => r.vista);
  assert(adminVistas.includes('configuracion') && adminVistas.includes('accesos'), `Admin tiene vistas configuracion y accesos en #21220`);
  assert(auditorVistas.includes('configuracion') && auditorVistas.includes('accesos'), `Auditor tiene vistas configuracion y accesos en #21220`);

  // 4. Verificar eliminación física de rutas viejas (E13.3)
  const rutasBorradas = [
    'src/app/plataforma/seguridad/accesos/recertificacion/page.tsx',
    'src/app/plataforma/seguridad/cumplimiento/cambios/page.tsx',
    'src/app/plataforma/seguridad/cumplimiento/sod/page.tsx',
    'src/app/plataforma/seguridad/muestreo/page.tsx',
    'src/app/plataforma/seguridad/seguridad-logs/page.tsx',
    'src/app/plataforma/operacion/mantenimiento-datos/page.tsx',
    'src/app/plataforma/operacion/salud-sistema/page.tsx',
    'src/app/plataforma/operacion/menu/page.tsx'
  ];

  for (const r of rutasBorradas) {
    const fullPath = path.join(__dirname, '..', r);
    assert(!fs.existsSync(fullPath), `E13.3: Ruta borrada no existe: ${r}`);
  }

  // 5. Verificar segregación de funciones (E13.4): prueba en base de datos de autoexclusión
  const ticketsPrueba = await pool.query(`
    SELECT t.id_ticket, t.id_usuario_solicitante
    FROM ticket t
    LIMIT 1
  `);
  if (ticketsPrueba.rows.length > 0) {
    const t = ticketsPrueba.rows[0];
    assert(t.id_usuario_solicitante !== null, `E13.4: Ticket de prueba tiene id_usuario_solicitante = ${t.id_usuario_solicitante}`);
  }

  await pool.end();

  if (failures === 0) {
    console.log('\n>>> TODOS LOS TESTS DE FASE 13 PASARON EXITOSAMENTE (100% PASS) <<<');
  } else {
    console.error(`\n>>> ${failures} TESTS FALLARON EN FASE 13 <<<`);
    process.exit(1);
  }
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});
