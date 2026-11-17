const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function runTests() {
  console.log("================================================================================");
  console.log("TEST SUITE: FASE 3 - MI TRABAJO Y MI CUENTA (N3 & N4)");
  console.log("================================================================================");

  let passed = true;

  // 1. Verificar hijos de «Mi trabajo» (#21001)
  const rTrabajo = await pool.query(
    "SELECT id_opcion_menu, nombre, url_menu, orden FROM opciones_menu WHERE id_padre = 21001 ORDER BY orden"
  );
  console.log("\n[TEST 1] Hijos de «Mi trabajo» (#21001):", rTrabajo.rows.length);
  const expectedTrabajo = [
    { orden: 1, id: 21022, nombre: "Inicio", url: "/plataforma/inicio" },
    { orden: 2, id: 21020, nombre: "Mis tareas", url: "/plataforma/operacion/tareas" },
    { orden: 3, id: 21249, nombre: "Mis aprobaciones", url: "/plataforma/aprobaciones" },
    { orden: 4, id: 21004, nombre: "Delegaciones", url: "/plataforma/seguridad/delegaciones" },
    { orden: 5, id: 21265, nombre: "Notificaciones", url: "/plataforma/notificaciones" },
  ];

  if (rTrabajo.rows.length !== 5) {
    console.error("FAIL: Se esperaban exactamente 5 hijos en «Mi trabajo», se obtuvieron:", rTrabajo.rows.length);
    passed = false;
  } else {
    for (let i = 0; i < 5; i++) {
      const row = rTrabajo.rows[i];
      const exp = expectedTrabajo[i];
      if (row.id_opcion_menu !== exp.id || row.orden !== exp.orden || row.url_menu !== exp.url) {
        console.error(`FAIL en pos ${i + 1}: esperado ${JSON.stringify(exp)}, obtenido ${JSON.stringify(row)}`);
        passed = false;
      }
    }
    if (passed) console.log("OK: 5 hijos en orden exacto (1..5)");
  }

  // 2. Verificar hijos de «Mi cuenta» (#21225)
  const rCuenta = await pool.query(
    "SELECT id_opcion_menu, nombre, url_menu, orden FROM opciones_menu WHERE id_padre = 21225 ORDER BY orden"
  );
  console.log("\n[TEST 2] Hijos de «Mi cuenta» (#21225):", rCuenta.rows.length);
  if (rCuenta.rows.length !== 1 || rCuenta.rows[0].id_opcion_menu !== 21226) {
    console.error("FAIL: Se esperaba únicamente #21226 «Mi perfil y seguridad»");
    passed = false;
  } else {
    console.log("OK: Solo #21226 presente");
  }

  // 3. Verificar las 23 opciones eliminadas
  const eliminadas = [
    21002, 21003, 21005, 21006, 21007, 21008, 21009, 21010,
    21011, 21012, 21013, 21014, 21015, 21016, 21017, 21018,
    21019, 21021, 21061, 21088, 21089, 21121, 21183
  ];
  const rElim = await pool.query(
    `SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu IN (${eliminadas.join(",")})`
  );
  console.log("\n[TEST 3] 23 IDs eliminados en opciones_menu:", rElim.rows.length);
  if (rElim.rows.length !== 0) {
    console.error("FAIL: Aún existen opciones eliminadas en BD:", rElim.rows);
    passed = false;
  } else {
    console.log("OK: Las 23 opciones fueron retiradas de BD");
  }

  // 4. Verificar archivos de páginas eliminadas
  const rutasArchivosEliminados = [
    'src/app/plataforma/operacion/paneles',
    'src/app/plataforma/reportes/tableros',
    'src/app/plataforma/reportes/disenador',
    'src/app/plataforma/dashboard',
    'src/modules/reportes/views/VistaDashboard.tsx',
    'src/app/plataforma/cambios/aprobaciones',
    'src/app/plataforma/activos/bajas/aprobacion',
    'src/app/plataforma/solicitudes/aprobaciones',
    'src/app/plataforma/solicitudes/area',
    'src/app/plataforma/seguridad/historial-aprobaciones',
    'src/app/plataforma/tickets/gestion/aprobaciones',
    'src/modules/solicitudes/views/VistaDelegacionAprobaciones.tsx',
    'src/app/plataforma/operacion/equipo',
    'src/app/plataforma/operacion/agenda',
    'src/app/plataforma/operacion/desempeno',
    'src/app/plataforma/tickets/desempeno'
  ];
  let algunArchivoExiste = false;
  for (const r of rutasArchivosEliminados) {
    if (fs.existsSync(r)) {
      console.error("FAIL: Archivo/directorio no eliminado:", r);
      algunArchivoExiste = true;
    }
  }
  console.log("\n[TEST 4] Eliminación física de rutas obsoletas:");
  if (algunArchivoExiste) {
    passed = false;
  } else {
    console.log("OK: Todas las rutas obsoletas eliminadas físicamente");
  }

  // 5. Cero referencias a rutas eliminadas
  const searchTargets = [
    '/plataforma/operacion/paneles',
    '/solicitudes/area/',
    '/seguridad/historial-aprobaciones'
  ];
  let refHits = 0;
  function searchDir(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name === 'node_modules' || ent.name === '.next' || ent.name === '.git') continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) searchDir(full);
      else if (ent.name.endsWith('.ts') || ent.name.endsWith('.tsx') || ent.name.endsWith('.js')) {
        const c = fs.readFileSync(full, 'utf8');
        searchTargets.forEach(t => {
          if (c.includes(t)) {
            console.error("FAIL: Referencia encontrada a", t, "en", full);
            refHits++;
          }
        });
      }
    }
  }
  searchDir('src');
  console.log("\n[TEST 5] Verificación E3.3 (Cero referencias en src):", refHits);
  if (refHits > 0) {
    passed = false;
  } else {
    console.log("OK: 0 referencias residuales en código fuente");
  }

  // 6. Verificación V-17: Totales de pendientes en BD
  const tRes = await pool.query(`
    SELECT count(*) as total
    FROM ticket t
    JOIN ticket_solicitud ts ON t.id_ticket = ts.id_ticket
    WHERE t.estado_registro = true AND ts.estado_aprobacion = 'PENDIENTE_APROBACION'
  `);
  const cRes = await pool.query(`
    SELECT count(*) as total
    FROM cambio c
    WHERE c.estado_registro = true AND c.id_estado = 2
  `);
  const bRes = await pool.query(`
    SELECT count(*) as total
    FROM solicitud_baja_activo
    WHERE estado_registro = true AND estado = 'PENDIENTE'
  `);

  console.log("\n[TEST 6] V-17 Totales de pendientes:");
  console.log(`- Solicitudes pendientes: ${tRes.rows[0].total} (línea base: 21)`);
  console.log(`- Cambios pendientes: ${cRes.rows[0].total} (línea base: 21)`);
  console.log(`- Bajas pendientes: ${bRes.rows[0].total} (línea base: 0)`);

  if (parseInt(tRes.rows[0].total, 10) !== 21 || parseInt(cRes.rows[0].total, 10) !== 21) {
    console.error("FAIL: Los totales de aprobación no coinciden con la línea base!");
    passed = false;
  } else {
    console.log("OK: Totales de aprobación coinciden 100% con la línea base");
  }

  await pool.end();

  console.log("\n================================================================================");
  if (passed) {
    console.log("RESULTADO: TODOS LOS TESTS PASARON EXITOSAMENTE (FASE 3 VERIFICADA)");
  } else {
    console.error("RESULTADO: ALGUNOS TESTS FALLARON");
    process.exit(1);
  }
  console.log("================================================================================");
}

runTests().catch(err => {
  console.error("Error fatal:", err);
  process.exit(1);
});
