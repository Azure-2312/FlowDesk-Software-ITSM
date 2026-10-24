const fs = require('fs');
const { Pool } = require('pg');

const envContent = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^"/, '').replace(/"$/, '');
    break;
  }
}

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function migrate() {
  console.log('Iniciando alineacion de URLs de Mi trabajo y submodulos...');

  const updates = [
    // 1. Paneles en Mi trabajo
    {
      id: 21007,
      nombre: 'Panel de activos',
      url: '/plataforma/operacion/paneles/gestor-activos',
      note: 'Panel de activos (separado de CMDB, unificado en operacion/paneles)'
    },
    {
      id: 21013,
      nombre: 'Panel de gestión de problemas',
      url: '/plataforma/operacion/paneles/gestor-problemas',
      note: 'Panel de problemas (unificado en operacion/paneles)'
    },
    {
      id: 21019,
      url: '/plataforma/operacion/desempeno',
      note: 'Mi desempeno en Mi trabajo'
    },

    // 2. Aprobaciones en Mi trabajo
    {
      id: 21003,
      url: '/plataforma/operacion/aprobaciones/delegacion',
      note: 'Delegacion de aprobaciones en Mi trabajo'
    },
    {
      id: 21004,
      url: '/plataforma/operacion/aprobaciones/delegaciones',
      note: 'Delegaciones en Mi trabajo'
    },
    {
      id: 21005,
      url: '/plataforma/operacion/aprobaciones/historial-area',
      note: 'Aprobaciones de mi area en Mi trabajo'
    },
    {
      id: 21006,
      url: '/plataforma/operacion/aprobaciones/historial',
      note: 'Historial de aprobaciones en Mi trabajo'
    },

    // 3. Equipo en Mi trabajo
    {
      id: 21009,
      url: '/plataforma/operacion/equipo/ausencias',
      note: 'Ausencias y guardias en Mi trabajo'
    },
    {
      id: 21010,
      url: '/plataforma/operacion/equipo/vistas',
      note: 'Vistas compartidas en Mi trabajo'
    },

    // 4. Activos -> Proveedores
    {
      id: 21146,
      url: '/plataforma/activos/proveedores',
      note: 'Proveedores en Activos'
    },

    // 5. Mesa de Servicio -> Avisos
    {
      id: 21259,
      url: '/plataforma/tickets/gestion/avisos',
      note: 'Avisos de servicio en Mesa de Servicio'
    }
  ];

  for (const u of updates) {
    if (u.nombre) {
      await pool.query(
        'UPDATE opciones_menu SET url_menu = $1, nombre = $2 WHERE id_opcion_menu = $3',
        [u.url, u.nombre, u.id]
      );
    } else {
      await pool.query(
        'UPDATE opciones_menu SET url_menu = $1 WHERE id_opcion_menu = $2',
        [u.url, u.id]
      );
    }
    console.log(`[OK] Opcion ${u.id}: URL -> ${u.url} (${u.note})`);
  }

  await pool.end();
  console.log('\nMigracion de base de datos finalizada.');
}

migrate().catch(console.error);
