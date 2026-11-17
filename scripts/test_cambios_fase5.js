const { pool } = require('./db.js');
const fs = require('fs');
const path = require('path');

async function testPhase5() {
  console.log('=== INICIANDO VALIDACIÓN FASE 5 (CAMBIOS) ===\n');
  let errores = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  [OK] ${msg}`);
    } else {
      console.error(`  [FAIL] ${msg}`);
      errores++;
    }
  }

  // 1. Validar las 8 pantallas bajo #21059
  console.log('1. Verificando opciones bajo raíz Cambios (#21059)...');
  const resOpciones = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden
    FROM opciones_menu
    WHERE id_padre = 21059
    ORDER BY orden, id_opcion_menu
  `);

  assert(resOpciones.rows.length === 8, `Debe haber exactamente 8 hijos bajo 21059 (encontrados: ${resOpciones.rows.length})`);

  const esperado = [
    { id: 21070, nombre: 'Solicitar cambio', url: '/plataforma/cambios/nuevo', orden: 1 },
    { id: 21068, nombre: 'Mis cambios', url: '/plataforma/cambios/mis-cambios', orden: 2 },
    { id: 21073, nombre: 'Gestión de cambios', url: '/plataforma/cambios/gestion', orden: 3 },
    { id: 21082, nombre: 'CAB y ECAB', url: '/plataforma/cambios/cab', orden: 4 },
    { id: 21071, nombre: 'Calendario de cambios', url: '/plataforma/cambios/gestion/calendario', orden: 5 },
    { id: 21090, nombre: 'Modelos de cambio estándar', url: '/plataforma/cambios/modelos', orden: 6 },
    { id: 21077, nombre: 'Revisión post-implementación', url: '/plataforma/cambios/gestion/pir', orden: 7 },
    { id: 21191, nombre: 'Configuración de cambios', url: '/plataforma/cambios/configuracion', orden: 8 },
  ];

  esperado.forEach((esp, idx) => {
    const act = resOpciones.rows[idx];
    if (act) {
      assert(
        act.id_opcion_menu === esp.id && act.orden === esp.orden && act.url_menu === esp.url,
        `Hijo #${idx + 1}: ID ${act.id_opcion_menu} (esp ${esp.id}), Orden ${act.orden} (esp ${esp.orden}), URL ${act.url_menu} (esp ${esp.url})`
      );
    } else {
      assert(false, `Falta hijo en posición ${idx + 1}: ${esp.nombre}`);
    }
  });

  // 2. Validar que las 27 opciones eliminadas no existan
  console.log('\n2. Verificando eliminación de las 27 filas obsoletas...');
  const eliminadas = [
    21060, 21062, 21063, 21064, 21065, 21066, 21067, 21069, 21072, 21074, 
    21075, 21076, 21078, 21079, 21080, 21081, 21083, 21084, 21085, 21086, 
    21087, 21192, 21193, 21194, 21195, 21196, 21197
  ];

  const resEliminadas = await pool.query(`
    SELECT id_opcion_menu, nombre
    FROM opciones_menu
    WHERE id_opcion_menu = ANY($1::int[])
  `, [eliminadas]);

  assert(resEliminadas.rows.length === 0, `No debe existir ninguna de las 27 opciones eliminadas (encontradas: ${resEliminadas.rows.length})`);

  // 3. Validar permisos de vistas en opciones_menu_vistas_perfiles
  console.log('\n3. Verificando opciones_menu_vistas_perfiles...');
  const resVistas = await pool.query(`
    SELECT id_opcion_menu, vista, ARRAY_AGG(id_perfil ORDER BY id_perfil) as perfiles
    FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu IN (21068, 21073, 21082, 21071, 21090, 21191)
    GROUP BY id_opcion_menu, vista
    ORDER BY id_opcion_menu, vista
  `);

  console.log(`  Total combinaciones opcion-vista registradas: ${resVistas.rows.length}`);
  assert(resVistas.rows.length === 23, `Deben existir exactamente 23 combinaciones opcion-vista (6+4+4+2+2+5)`);

  // 4. Validar preservación de privilegios (R5 - No escalación de privilegios)
  console.log('\n4. Verificando no-escalación de privilegios (R5)...');
  // Perfil 5 (Gestor de Área) en 21068 solo debe tener 'afectan-area'
  const p5_21068 = await pool.query(`
    SELECT vista FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu = 21068 AND id_perfil = 5
  `);
  assert(
    p5_21068.rows.length === 1 && p5_21068.rows[0].vista === 'afectan-area',
    `Perfil 5 (Gestor de Área) en #21068 solo debe tener 'afectan-area' (tiene: ${p5_21068.rows.map(r => r.vista).join(', ')})`
  );

  // Perfil 4 (Supervisor) en 21068 solo debe tener 'afectan-equipo'
  const p4_21068 = await pool.query(`
    SELECT vista FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu = 21068 AND id_perfil = 4
  `);
  assert(
    p4_21068.rows.length === 1 && p4_21068.rows[0].vista === 'afectan-equipo',
    `Perfil 4 (Supervisor) en #21068 solo debe tener 'afectan-equipo' (tiene: ${p4_21068.rows.map(r => r.vista).join(', ')})`
  );

  // Perfil 6 (Auditor) en 21073 solo debe tener 'historial'
  const p6_21073 = await pool.query(`
    SELECT vista FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu = 21073 AND id_perfil = 6
  `);
  assert(
    p6_21073.rows.length === 1 && p6_21073.rows[0].vista === 'historial',
    `Perfil 6 (Auditor) en #21073 solo debe tener 'historial' (tiene: ${p6_21073.rows.map(r => r.vista).join(', ')})`
  );

  // Perfil 7 (Aprobador) en 21082 NO debe tener 'miembros'
  const p7_21082 = await pool.query(`
    SELECT vista FROM opciones_menu_vistas_perfiles
    WHERE id_opcion_menu = 21082 AND id_perfil = 7 AND vista = 'miembros'
  `);
  assert(
    p7_21082.rows.length === 0,
    `Perfil 7 (Aprobador) en #21082 NO debe tener 'miembros'`
  );

  // 5. Validar que no haya archivos de rutas viejas eliminadas en src/app/plataforma/cambios
  console.log('\n5. Verificando que no existan carpetas/páginas de rutas eliminadas...');
  const rutasEliminadasArchivos = [
    'src/app/plataforma/cambios/gestion/crear/page.tsx',
    'src/app/plataforma/cambios/gestion/evaluacion/page.tsx',
    'src/app/plataforma/cambios/gestion/autorizaciones/page.tsx',
    'src/app/plataforma/cambios/gestion/ejecucion/page.tsx',
    'src/app/plataforma/cambios/gestion/todos/page.tsx',
    'src/app/plataforma/cambios/gestion/conflictos/page.tsx',
    'src/app/plataforma/cambios/gestion/modelos/page.tsx',
    'src/app/plataforma/cambios/gestion/cab/page.tsx',
    'src/app/plataforma/cambios/gestion/cab-agenda/page.tsx',
    'src/app/plataforma/cambios/cab/agenda/page.tsx',
    'src/app/plataforma/cambios/cab/emergencia/page.tsx',
    'src/app/plataforma/cambios/configuracion/formulario/page.tsx',
    'src/app/plataforma/cambios/configuracion/flujo-evaluacion/page.tsx',
    'src/app/plataforma/cambios/configuracion/tipos-requisitos/page.tsx',
    'src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx',
    'src/app/plataforma/cambios/implementacion/page.tsx',
    'src/app/plataforma/cambios/impacto/interrupciones/page.tsx',
    'src/app/plataforma/cambios/impacto/equipo/page.tsx',
    'src/app/plataforma/cambios/impacto/servicios/page.tsx',
    'src/app/plataforma/cambios/historial/page.tsx',
    'src/app/plataforma/cambios/calendario/page.tsx',
    'src/app/plataforma/cambios/programacion/page.tsx',
    'src/app/plataforma/cambios/gestion/programacion/page.tsx',
  ];

  rutasEliminadasArchivos.forEach((ruta) => {
    assert(!fs.existsSync(ruta), `Archivo eliminado no debe existir: ${ruta}`);
  });

  // 6. Validar que no haya redirect() en páginas de cambios
  console.log('\n6. Verificando R2 (zero obsolescence redirects en /cambios)...');
  const paginasCambios = [
    'src/app/plataforma/cambios/nuevo/page.tsx',
    'src/app/plataforma/cambios/mis-cambios/page.tsx',
    'src/app/plataforma/cambios/gestion/page.tsx',
    'src/app/plataforma/cambios/cab/page.tsx',
    'src/app/plataforma/cambios/gestion/calendario/page.tsx',
    'src/app/plataforma/cambios/modelos/page.tsx',
    'src/app/plataforma/cambios/gestion/pir/page.tsx',
    'src/app/plataforma/cambios/configuracion/page.tsx',
  ];

  paginasCambios.forEach((p) => {
    if (fs.existsSync(p)) {
      const contenido = fs.readFileSync(p, 'utf8');
      assert(!contenido.includes('redirect('), `Página ${p} no debe usar redirect()`);
    }
  });

  await pool.end();

  console.log(`\n=== RESULTADO: ${errores === 0 ? 'TODAS LAS PRUEBAS PASARON' : `${errores} PRUEBAS FALLARON`} ===`);
  if (errores > 0) process.exit(1);
}

testPhase5().catch((err) => {
  console.error(err);
  process.exit(1);
});
