const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function runTests() {
  console.log("================================================================================");
  console.log("TEST SUITE: FASE 4 - MESA DE SERVICIO (N5)");
  console.log("================================================================================");

  let passed = true;

  // 1. Verificar árbol de «Mesa de Servicio» (#21023)
  const rMesa = await pool.query(
    "SELECT id_opcion_menu, nombre, url_menu, orden FROM opciones_menu WHERE id_padre = 21023 ORDER BY orden"
  );
  console.log("\n[TEST 1.1] Hijos de «Mesa de Servicio» (#21023):", rMesa.rows.length);
  const expMesa = [
    { orden: 1, id: 21228, nombre: "Incidentes" },
    { orden: 2, id: 21229, nombre: "Solicitudes" },
    { orden: 3, id: 21251, nombre: "Centro de asignacion" },
    { orden: 4, id: 21045, nombre: "Monitor de SLA" },
  ];
  if (rMesa.rows.length !== 4) {
    console.error("FAIL: Se esperaban 4 hijos en #21023, obtenidos:", rMesa.rows.length);
    passed = false;
  } else {
    for (let i = 0; i < 4; i++) {
      if (rMesa.rows[i].id_opcion_menu !== expMesa[i].id || rMesa.rows[i].orden !== expMesa[i].orden) {
        console.error(`FAIL en pos ${i + 1}: esperado ${JSON.stringify(expMesa[i])}, obtenido ${JSON.stringify(rMesa.rows[i])}`);
        passed = false;
      }
    }
    if (passed) console.log("OK: 4 hijos directos en orden exacto");
  }

  // 1.2 Hijos de Incidentes (#21228)
  const rInc = await pool.query(
    "SELECT id_opcion_menu, nombre, url_menu, orden FROM opciones_menu WHERE id_padre = 21228 ORDER BY orden"
  );
  console.log("\n[TEST 1.2] Hijos de «Incidentes» (#21228):", rInc.rows.length);
  const expInc = [21236, 21231, 21233, 21237, 21238, 21240];
  if (rInc.rows.length !== 6) {
    console.error("FAIL: Se esperaban 6 hijos en #21228, obtenidos:", rInc.rows.length);
    passed = false;
  } else {
    for (let i = 0; i < 6; i++) {
      if (rInc.rows[i].id_opcion_menu !== expInc[i] || rInc.rows[i].orden !== i + 1) {
        console.error(`FAIL en pos ${i + 1}: esperado id ${expInc[i]}, obtenido ${JSON.stringify(rInc.rows[i])}`);
        passed = false;
      }
    }
    if (passed) console.log("OK: 6 hijos de Incidentes en orden exacto");
  }

  // 1.3 Hijos de Solicitudes (#21229)
  const rSol = await pool.query(
    "SELECT id_opcion_menu, nombre, url_menu, orden FROM opciones_menu WHERE id_padre = 21229 ORDER BY orden"
  );
  console.log("\n[TEST 1.3] Hijos de «Solicitudes» (#21229):", rSol.rows.length);
  const expSol = [21247, 21242, 21244, 21248, 21250];
  if (rSol.rows.length !== 5) {
    console.error("FAIL: Se esperaban 5 hijos en #21229, obtenidos:", rSol.rows.length);
    passed = false;
  } else {
    for (let i = 0; i < 5; i++) {
      if (rSol.rows[i].id_opcion_menu !== expSol[i] || rSol.rows[i].orden !== i + 1) {
        console.error(`FAIL en pos ${i + 1}: esperado id ${expSol[i]}, obtenido ${JSON.stringify(rSol.rows[i])}`);
        passed = false;
      }
    }
    if (passed) console.log("OK: 5 hijos de Solicitudes en orden exacto");
  }

  // 2. Verificar las 27 filas eliminadas
  const eliminadas = [
    21024, 21044, 21046, 21047, 21048, 21049,
    21230, 21232, 21234, 21235,
    21241, 21243, 21245, 21246,
    21239,
    21186, 21187,
    21252, 21253, 21254, 21255, 21256, 21257, 21258, 21259, 21260, 21261
  ];
  const rElim = await pool.query(
    `SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu IN (${eliminadas.join(",")})`
  );
  console.log("\n[TEST 2] 27 IDs eliminados en opciones_menu:", rElim.rows.length);
  if (rElim.rows.length !== 0) {
    console.error("FAIL: Aún existen opciones eliminadas en BD:", rElim.rows);
    passed = false;
  } else {
    console.log("OK: Las 27 opciones fueron retiradas de BD");
  }

  // 3. Verificar eliminación física de rutas obsoletas
  const rutasArchivosEliminados = [
    'src/app/plataforma/incidentes/page.tsx',
    'src/app/plataforma/incidentes/asignados',
    'src/app/plataforma/incidentes/resueltos',
    'src/app/plataforma/incidentes/departamento',
    'src/app/plataforma/tickets/gestion/auditoria',
    'src/app/plataforma/solicitudes/page.tsx',
    'src/app/plataforma/solicitudes/asignados',
    'src/app/plataforma/solicitudes/resueltos',
    'src/app/plataforma/solicitudes/departamento',
    'src/app/plataforma/tickets/gestion/crear',
    'src/app/plataforma/incidentes/sala-crisis',
    'src/app/plataforma/incidentes/configuracion/flujo',
    'src/app/plataforma/solicitudes/configuracion/flujo',
    'src/app/plataforma/tickets/gestion/colaboradores',
    'src/app/plataforma/tickets/gestion/bandeja',
    'src/app/plataforma/tickets/gestion/resueltos',
    'src/app/plataforma/tickets/gestion/departamento',
    'src/app/plataforma/tickets/gestion/todos',
    'src/app/plataforma/avisos',
    'src/app/plataforma/tickets/mesa/buscar',
    'src/app/plataforma/tickets/mesa/registrar',
    'src/app/plataforma/tickets/gestion/mios',
    'src/app/plataforma/servicios/sla/escalamientos',
    'src/app/plataforma/servicios/sla/incumplimientos',
    'src/app/plataforma/servicios/sla/objetivos',
    'src/app/plataforma/servicios/sla/semaforo-cola',
    'src/app/plataforma/servicios/sla/semaforo-grupo'
  ];
  let algunArchivoExiste = false;
  for (const r of rutasArchivosEliminados) {
    if (fs.existsSync(r)) {
      console.error("FAIL: Archivo/directorio no eliminado:", r);
      algunArchivoExiste = true;
    }
  }
  console.log("\n[TEST 3] Eliminación física de rutas obsoletas:");
  if (algunArchivoExiste) {
    passed = false;
  } else {
    console.log("OK: Todas las rutas obsoletas eliminadas físicamente");
  }

  // 4. Cero referencias a rutas eliminadas
  const searchTargets = [
    '/plataforma/incidentes/asignados',
    '/plataforma/incidentes/resueltos',
    '/plataforma/incidentes/departamento',
    '/plataforma/solicitudes/asignados',
    '/plataforma/solicitudes/resueltos',
    '/plataforma/solicitudes/departamento',
    '/plataforma/tickets/gestion/crear',
    '/plataforma/incidentes/sala-crisis',
    '/plataforma/incidentes/configuracion/flujo',
    '/plataforma/solicitudes/configuracion/flujo',
    '/plataforma/tickets/gestion/colaboradores',
    '/plataforma/tickets/gestion/bandeja',
    '/plataforma/tickets/gestion/resueltos',
    '/plataforma/tickets/gestion/departamento',
    '/plataforma/tickets/gestion/todos',
    '/plataforma/tickets/gestion/auditoria',
    '/plataforma/tickets/gestion/mios',
    '/plataforma/tickets/mesa/buscar',
    '/plataforma/servicios/sla/escalamientos',
    '/plataforma/servicios/sla/incumplimientos',
    '/plataforma/servicios/sla/objetivos',
    '/plataforma/servicios/sla/semaforo-cola',
    '/plataforma/servicios/sla/semaforo-grupo'
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
  console.log("\n[TEST 4] Cero referencias en src:", refHits);
  if (refHits > 0) {
    passed = false;
  } else {
    console.log("OK: 0 referencias residuales en código fuente");
  }

  // 5. Permisos de vistas N1 en BD
  const vistasCheck = [21233, 21244, 21238, 21240, 21250, 21045];
  const rVistas = await pool.query(
    `SELECT id_opcion_menu, count(DISTINCT vista) as vistas_total, count(*) as asignaciones_total
     FROM opciones_menu_vistas_perfiles
     WHERE id_opcion_menu IN (${vistasCheck.join(",")}) AND estado_registro = true
     GROUP BY id_opcion_menu
     ORDER BY id_opcion_menu`
  );
  console.log("\n[TEST 5] Permisos de vistas N1 en BD:");
  console.log(rVistas.rows);
  if (rVistas.rows.length !== 6) {
    console.error("FAIL: Se esperaban 6 pantallas con vistas configuradas, obtenidas:", rVistas.rows.length);
    passed = false;
  } else {
    console.log("OK: 6 pantallas con vistas debidamente configuradas");
  }

  await pool.end();

  console.log("\n================================================================================");
  if (passed) {
    console.log("RESULTADO: TODOS LOS TESTS PASARON EXITOSAMENTE (FASE 4 VERIFICADA)");
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
