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
  console.log('Iniciando actualizacion de URLs canonicas en opciones_menu...');

  const updates = [
    // 1. Parent Module Roots (para navegacion con doble clic)
    { id: 21228, url: '/plataforma/incidentes', note: 'Carpeta Incidentes -> Root' },
    { id: 21229, url: '/plataforma/solicitudes', note: 'Carpeta Solicitudes -> Root' },
    { id: 21059, url: '/plataforma/cambios', note: 'Carpeta Cambios -> Root' },
    { id: 21091, url: '/plataforma/problemas', note: 'Carpeta Problemas -> Root' },
    { id: 21109, url: '/plataforma/activos', note: 'Carpeta Activos -> Root' },
    { id: 21133, url: '/plataforma/cmdb', note: 'Carpeta CMDB -> Root' },
    { id: 21156, url: '/plataforma/conocimiento', note: 'Carpeta Conocimiento -> Root' },
    { id: 21163, url: '/plataforma/servicios/catalogo', note: 'Carpeta Catalogo de Servicios -> Root' },
    { id: 21170, url: '/plataforma/operacion', note: 'Carpeta Operacion -> Root' },
    { id: 21174, url: '/plataforma/reportes', note: 'Carpeta Reportes -> Root' },
    { id: 21264, url: '/plataforma/organizacion', note: 'Carpeta Organizacion -> Root' },
    { id: 21215, url: '/plataforma/seguridad', note: 'Carpeta Plataforma -> Root' },

    // 2. Incidentes
    { id: 21230, url: '/plataforma/incidentes/todos', note: 'Todos los incidentes' },
    { id: 21239, url: '/plataforma/incidentes/sala-crisis', note: 'Sala de crisis (Mayor)' },
    { id: 21187, url: '/plataforma/incidentes/configuracion/flujo', note: 'Flujo de estados y acciones' },

    // 3. Solicitudes
    { id: 21241, url: '/plataforma/solicitudes/todos', note: 'Todas las solicitudes' },
    { id: 21186, url: '/plataforma/solicitudes/configuracion/flujo', note: 'Flujo y aprobaciones' },
    { id: 21003, url: '/plataforma/solicitudes/delegaciones', note: 'Delegacion de aprobaciones' },
    { id: 21005, url: '/plataforma/solicitudes/historial-area', note: 'Aprobaciones de mi area' },

    // 4. Problemas
    { id: 21105, url: '/plataforma/problemas/nuevo', note: 'Registrar problema' },
    { id: 21106, url: '/plataforma/problemas/todos', nombre: 'Todos los problemas', note: 'Todos los problemas' },
    { id: 21093, url: '/plataforma/problemas/asignacion', note: 'Asignacion de problemas' },
    { id: 21096, url: '/plataforma/problemas/candidatos', note: 'Candidatos de mi grupo' },
    { id: 21098, url: '/plataforma/problemas/kedb', note: 'Consultar KEDB' },
    { id: 21102, url: '/plataforma/problemas/asignados', note: 'Problemas asignados a mi' },
    { id: 21103, url: '/plataforma/problemas/grupo', note: 'Problemas de mi grupo' },
    { id: 21107, url: '/plataforma/problemas/mayores', note: 'Riesgo y problemas mayores' },

    // 5. Cambios
    { id: 21070, url: '/plataforma/cambios/nuevo', note: 'Registrar solicitud RFC' },
    { id: 21062, url: '/plataforma/cambios/calendario', note: 'Calendario de mis cambios' },
    { id: 21064, url: '/plataforma/cambios/implementacion', note: 'Cambios por implementar' },
    { id: 21067, url: '/plataforma/cambios/historial', note: 'Historial de mis cambios' },
    { id: 21068, url: '/plataforma/cambios/mis-cambios', note: 'Mis cambios' },
    { id: 21061, url: '/plataforma/cambios/aprobaciones/tecnicas', note: 'Aprobaciones tecnicas de RFC' },
    { id: 21069, url: '/plataforma/cambios/programacion', note: 'Implementaciones del equipo' },
    { id: 21065, url: '/plataforma/cambios/impacto/equipo', note: 'Cambios que afectan al equipo' },
    { id: 21066, url: '/plataforma/cambios/impacto/servicios', note: 'Cambios en mis servicios' },
    { id: 21063, url: '/plataforma/cambios/impacto/interrupciones', note: 'Cambios con interrupcion' },
    { id: 21088, url: '/plataforma/cambios/aprobaciones/negocio', note: 'Aprobacion de negocio' },
    { id: 21089, url: '/plataforma/cambios/aprobaciones', note: 'Aprobaciones de cambios' },
    { id: 21090, url: '/plataforma/cambios/modelos', note: 'Modelos de cambio estandar' },

    // 6. Activos
    { id: 21111, url: '/plataforma/activos/area', note: 'Activos de mi area' },
    { id: 21116, url: '/plataforma/activos/conteos', note: 'Inventario fisico en campo' },
    { id: 21117, url: '/plataforma/activos/inventario-tecnico', note: 'Inventario tecnico' },
    { id: 21121, url: '/plataforma/activos/bajas/aprobacion', note: 'Aprobacion de bajas' },
    { id: 21122, url: '/plataforma/activos/bajas/consulta', note: 'Consulta de bajas' },
    { id: 21124, url: '/plataforma/activos/bajas/renovaciones', note: 'Bajas y renovaciones' },
    { id: 21127, url: '/plataforma/activos/reparaciones', note: 'Mantenimiento y reparaciones' },
    { id: 21130, url: '/plataforma/activos/licencias/consulta', note: 'Consultar licencias' },

    // 7. CMDB
    { id: 21135, url: '/plataforma/cmdb/analisis', note: 'Analisis e impacto' },
    { id: 21139, url: '/plataforma/cmdb/topologia', note: 'Mapa de topologia' },
    { id: 21141, url: '/plataforma/cmdb/tipos', note: 'Modelado de clases CI' },
    { id: 21142, url: '/plataforma/cmdb/auditoria/resultados', note: 'Auditorias de CMDB' },

    // 8. Conocimiento
    { id: 21157, url: '/plataforma/conocimiento/base', note: 'Base de conocimiento' },
    { id: 21158, url: '/plataforma/conocimiento/base', note: 'Base de conocimiento (tecnico)' },
    { id: 21159, url: '/plataforma/conocimiento/nuevo', note: 'Crear articulo' },
    { id: 21160, url: '/plataforma/conocimiento/mis-articulos', note: 'Mis articulos' },
    { id: 21161, url: '/plataforma/conocimiento/publicacion', note: 'Publicacion de articulos' },
    { id: 21162, url: '/plataforma/conocimiento/revisiones', note: 'Revisiones pendientes' },

    // 9. SLA
    { id: 21045, url: '/plataforma/servicios/sla/escalamientos', note: 'Riesgos de SLA' },
    { id: 21046, url: '/plataforma/servicios/sla/incumplimientos', note: 'Incumplimientos y causas' },
    { id: 21047, url: '/plataforma/servicios/sla/objetivos', note: 'Objetivos de tiempo vigentes' },
    { id: 21048, url: '/plataforma/servicios/sla/semaforo-cola', note: 'Semaforo de SLA de mi cola' },
    { id: 21049, url: '/plataforma/servicios/sla/semaforo-grupo', note: 'Semaforo de SLA del grupo' },

    // 10. Seguridad
    { id: 21004, url: '/plataforma/seguridad/delegaciones', note: 'Delegaciones' },
    { id: 21006, url: '/plataforma/seguridad/historial-aprobaciones', note: 'Historial de aprobaciones' },

    // 11. Operacion
    { id: 21173, url: '/plataforma/operacion/eventos-resiliencia', note: 'Eventos y resiliencia' }
  ];

  for (const u of updates) {
    if (u.nombre) {
      await pool.query('UPDATE opciones_menu SET url_menu = $1, nombre = $2 WHERE id_opcion_menu = $3', [u.url, u.nombre, u.id]);
    } else {
      await pool.query('UPDATE opciones_menu SET url_menu = $1 WHERE id_opcion_menu = $2', [u.url, u.id]);
    }
    console.log(`[OK] Opcion ${u.id}: URL -> ${u.url} (${u.note})`);
  }

  // Asignar [21105] ("Registrar problema") a los perfiles correspondientes (1: Admin, 4: Supervisor, 10: Gestor de Problemas)
  console.log('\nAsignando "Registrar problema" [21105] a Admin (1), Supervisor (4) y Gestor de Problemas (10)...');
  const perfilesProblemaCrear = [1, 4, 10];
  for (const idPerfil of perfilesProblemaCrear) {
    await pool.query(`
      INSERT INTO opciones_menu_perfiles (id_perfil, id_opcion_menu, estado_registro)
      VALUES ($1, 21105, true)
      ON CONFLICT (id_perfil, id_opcion_menu) DO UPDATE SET estado_registro = true
    `, [idPerfil]);
    console.log(`[OK] Opcion 21105 asignada a Perfil ${idPerfil}`);
  }

  await pool.end();
  console.log('\nMigracion de URLs completada con exito.');
}

migrate().catch(console.error);
