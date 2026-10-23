const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2 && !line.trim().startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const pool = new Pool({ connectionString: env.DATABASE_URL });

async function run() {
  const perfiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const opciones = [
    21023, // Mesa de Servicio (raíz)
    21228, // Incidentes
    21229, // Solicitudes
    21231, // Mis incidentes
    21242, // Mis solicitudes
  ];

  console.log('Asignando opciones de Mis Tickets a perfiles institucionales...');

  for (const idPerfil of perfiles) {
    for (const idOpcion of opciones) {
      await pool.query(`
        INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
        VALUES ($1, $2, true)
        ON CONFLICT (id_opcion_menu, id_perfil)
        DO UPDATE SET estado_registro = true;
      `, [idOpcion, idPerfil]);
    }
  }

  console.log('Asignación completada exitosamente.');
  await pool.end();
}

run().catch(err => {
  console.error('Error al asignar opciones:', err);
  process.exit(1);
});
