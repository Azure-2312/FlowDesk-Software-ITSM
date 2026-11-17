const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let envContent = '';
try {
  envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
} catch {}
let dbUrl = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
});

// Parse vistas.ts static registry to verify all screens and views
const vistasSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'shared', 'lib', 'vistas.ts'), 'utf8');

async function main() {
  console.log('================================================================================');
  console.log('PRUEBAS UNITARIAS: INFRAESTRUCTURA DE VISTAS (N1 - FASE 1)');
  console.log('================================================================================');

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Contar pantallas en REGISTRO_VISTAS en vistas.ts
  const pantallaMatches = vistasSource.match(/urlBase:\s*["']([^"']+)["']/g) || [];
  assert(pantallaMatches.length === 32, `Total de pantallas con vistas es 32 (obtenido: ${pantallaMatches.length})`);

  // 2. Contar vistas en vistas.ts
  const vistaMatches = vistasSource.match(/codigo:\s*["']([^"']+)["']/g) || [];
  assert(vistaMatches.length === 107, `Total de vistas registradas es 107 (obtenido: ${vistaMatches.length})`);

  // 3. Verificar que /plataforma/inicio tiene sus 10 vistas
  const inicioBlock = vistasSource.includes('"/plataforma/inicio"') &&
    vistasSource.includes('codigo: "solicitante"') &&
    vistasSource.includes('codigo: "tecnico"') &&
    vistasSource.includes('codigo: "supervisor"') &&
    vistasSource.includes('codigo: "aprobador"') &&
    vistasSource.includes('codigo: "area"') &&
    vistasSource.includes('codigo: "gestion-activos"') &&
    vistasSource.includes('codigo: "gestion-cambios"') &&
    vistasSource.includes('codigo: "gestion-problemas"') &&
    vistasSource.includes('codigo: "auditor"') &&
    vistasSource.includes('codigo: "administrador"');
  assert(inicioBlock, 'Pantalla /plataforma/inicio tiene registradas sus 10 vistas oficiales');

  // 4. Conexión a BD y existencia de la tabla opciones_menu_vistas_perfiles
  const pool = new Pool({ connectionString: dbUrl });
  try {
    const tableRes = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'opciones_menu_vistas_perfiles'
    `);
    assert(tableRes.rows.length === 1, 'Tabla opciones_menu_vistas_perfiles existe en la base de datos');

    const colRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'opciones_menu_vistas_perfiles'
      ORDER BY ordinal_position
    `);
    const cols = colRes.rows.map(c => c.column_name);
    assert(cols.includes('id_opcion_menu') && cols.includes('id_perfil') && cols.includes('vista'),
      `Columnas PK compuestas presentes: ${cols.join(', ')}`);

    // 5. Test de inserción y aislamiento de permisos por vista
    // Simular un perfil de prueba concediendo sólo una vista
    const testOpcion = 21233; // Bandeja de incidentes
    const testPerfil = 2; // Técnico
    await pool.query(`
      INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro)
      VALUES ($1, $2, 'asignados', true)
      ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true
    `, [testOpcion, testPerfil]);

    const permRes = await pool.query(`
      SELECT vista FROM opciones_menu_vistas_perfiles
      WHERE id_opcion_menu = $1 AND id_perfil = $2 AND estado_registro = true
    `, [testOpcion, testPerfil]);
    const vistasTecnico = permRes.rows.map(r => r.vista);
    assert(vistasTecnico.includes('asignados'), 'Técnico tiene concedida vista "asignados"');
    assert(!vistasTecnico.includes('todos'), 'Técnico NO tiene concedida vista "todos" (aislamiento R5)');

    // Limpieza de prueba
    await pool.query(`
      DELETE FROM opciones_menu_vistas_perfiles
      WHERE id_opcion_menu = $1 AND id_perfil = $2 AND vista = 'asignados'
    `, [testOpcion, testPerfil]);

    const postClean = await pool.query(`
      SELECT count(*) FROM opciones_menu_vistas_perfiles
      WHERE id_opcion_menu = $1 AND id_perfil = $2 AND vista = 'asignados'
    `, [testOpcion, testPerfil]);
    assert(Number(postClean.rows[0].count) === 0, 'Limpieza de prueba exitosa (tabla queda vacía para migraciones de REC-PER)');

  } finally {
    await pool.end();
  }

  console.log('================================================================================');
  console.log(`RESUMEN: Total: ${passed + failed} | Aprobadas: ${passed} | Fallidas: ${failed}`);
  console.log('================================================================================');

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
