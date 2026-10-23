const fs = require('fs');
const { Pool } = require('pg');

const envContent = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim();
    if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) dbUrl = dbUrl.slice(1, -1);
    break;
  }
}

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('================================================================');
  console.log('INICIANDO SANEAMIENTO Y ALINEACION DE PERMISOS DE MENU (ITSM / ITIL 4)');
  console.log('================================================================');

  // 1. Eliminar "Mis incidentes" (21231) y "Mis solicitudes" (21242) de TODOS los perfiles
  // excepto el perfil 3 (Solicitante).
  const perfilesNoSolicitante = [1, 2, 4, 5, 6, 7, 8, 9, 10];
  const opcionesMisTickets = [21231, 21242];

  console.log('\n1. Removiendo "Mis incidentes" y "Mis solicitudes" de perfiles no solicitantes...');
  const resMisTickets = await pool.query(`
    DELETE FROM opciones_menu_perfiles
    WHERE id_perfil = ANY($1) AND id_opcion_menu = ANY($2)
    RETURNING id_perfil, id_opcion_menu;
  `, [perfilesNoSolicitante, opcionesMisTickets]);
  console.log(`-> Registros removidos: ${resMisTickets.rowCount}`);
  resMisTickets.rows.forEach(r => {
    console.log(`   Perfil ${r.id_perfil}: Opcion ${r.id_opcion_menu} eliminada`);
  });

  // 2. Blindaje de Auditor (Perfil 6): Eliminar "Retencion y depuracion" (21223)
  console.log('\n2. Removiendo herramienta de depuracion de datos del perfil Auditor (Violacion SoD)...');
  const resAuditor = await pool.query(`
    DELETE FROM opciones_menu_perfiles
    WHERE id_perfil = 6 AND id_opcion_menu = 21223
    RETURNING id_perfil, id_opcion_menu;
  `);
  console.log(`-> Registros removidos: ${resAuditor.rowCount}`);

  // 3. Desvincular carpeta "Mesa de Servicio" (21023, 21228, 21229) de roles especializados
  // (Aprobador 7, Gestor de Cambios 8, Gestor de Activos 9, Gestor de Problemas 10)
  // que no operan mesas de tickets de soporte y fueron asociadas accidentalmente.
  console.log('\n3. Limpiando carpetas de Mesa de Servicio en perfiles especializados (7, 8, 9, 10)...');
  const perfilesEspecializados = [7, 8, 9, 10];
  const opcionesMesaServicio = [21023, 21228, 21229];

  const resMesaEsp = await pool.query(`
    DELETE FROM opciones_menu_perfiles
    WHERE id_perfil = ANY($1) AND id_opcion_menu = ANY($2)
    RETURNING id_perfil, id_opcion_menu;
  `, [perfilesEspecializados, opcionesMesaServicio]);
  console.log(`-> Registros removidos: ${resMesaEsp.rowCount}`);
  resMesaEsp.rows.forEach(r => {
    console.log(`   Perfil ${r.id_perfil}: Opcion ${r.id_opcion_menu} eliminada`);
  });

  console.log('\nSaneamiento completado con exito.');
  await pool.end();
}

main().catch(err => {
  console.error('Error en saneamiento:', err);
  process.exit(1);
});
