import { query, transaccion } from "c:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/lib/db";

async function migrar() {
  console.log("Iniciando migración para Prompt 4 - Menú Técnico...");

  await transaccion(async (client) => {
    // 1. Columnas adicionales en opciones_menu
    console.log("1. Extendiendo opciones_menu...");
    await client.query(`
      ALTER TABLE opciones_menu 
        ADD COLUMN IF NOT EXISTS permiso_requerido VARCHAR(100),
        ADD COLUMN IF NOT EXISTS modulo_requerido VARCHAR(50),
        ADD COLUMN IF NOT EXISTS condicion_nivel JSONB,
        ADD COLUMN IF NOT EXISTS contador_clave VARCHAR(50),
        ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS abierto_por_defecto BOOLEAN DEFAULT false;
    `);

    // 2. Tablas auxiliares para el Técnico
    console.log("2. Creando tablas auxiliares...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS tecnico_disponibilidad (
        id_disponibilidad SERIAL PRIMARY KEY,
        id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE', -- DISPONIBLE, OCUPADO, NO_DISPONIBLE
        desde TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        hasta TIMESTAMPTZ,
        motivo TEXT,
        fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_tecnico_disponibilidad_usuario UNIQUE (id_usuario)
      );

      CREATE TABLE IF NOT EXISTS tecnico_recordatorios (
        id_recordatorio SERIAL PRIMARY KEY,
        id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        fecha_hora TIMESTAMPTZ NOT NULL,
        repeticion VARCHAR(20) DEFAULT 'NINGUNA', -- NINGUNA, DIARIA, SEMANAL
        objeto_tipo VARCHAR(50),
        objeto_id VARCHAR(50),
        completado BOOLEAN DEFAULT false,
        fecha_creacion TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cambio_enterado (
        id_enterado SERIAL PRIMARY KEY,
        id_cambio INT NOT NULL,
        id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        fecha_enterado TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        observacion TEXT,
        CONSTRAINT uq_cambio_enterado_usuario UNIQUE (id_cambio, id_usuario)
      );

      CREATE TABLE IF NOT EXISTS ticket_lecturas (
        id_lectura SERIAL PRIMARY KEY,
        id_ticket INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE,
        id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        fecha_lectura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_ticket_lectura UNIQUE (id_ticket, id_usuario)
      );

      CREATE TABLE IF NOT EXISTS respuestas_predefinidas (
        id_respuesta SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        atajo VARCHAR(50) NOT NULL,
        contenido TEXT NOT NULL,
        modo_defecto VARCHAR(20) DEFAULT 'PUBLICA', -- PUBLICA, INTERNA
        ambito VARCHAR(20) DEFAULT 'PERSONAL', -- PERSONAL, GRUPO
        id_usuario INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
        id_departamento INT REFERENCES departamento_ti(id_departamento) ON DELETE SET NULL,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Limpiar asignaciones previas del perfil Técnico (id_perfil = 2)
    console.log("3. Limpiando asignaciones obsoletas de Técnico (perfil 2)...");
    await client.query(`
      DELETE FROM opciones_menu_perfiles WHERE id_perfil = 2;
    `);

    // 4. Registrar opciones del árbol M1..M8
    console.log("4. Insertando árbol M1..M8 en opciones_menu...");
    const opcionesTecnico = [
      // M1 Mi trabajo
      { id: 2000, padre: null, orden: 1, nivel: 1, nombre: "Mi trabajo", url: "/tecnico/panel", desc: "Panel personal, tareas, agenda y desempeño", bloqueado: true, abierto: true },
      { id: 2001, padre: 2000, orden: 1, nivel: 2, nombre: "Panel del técnico", url: "/tecnico/panel", desc: "Página de inicio y resumen operativo de turno", bloqueado: true, contador: null },
      { id: 2002, padre: 2000, orden: 2, nivel: 2, nombre: "Mis tareas", url: "/tecnico/tareas", desc: "Tareas pendientes de tickets, cambios y activos", bloqueado: false, contador: "mis_tareas" },
      { id: 2003, padre: 2000, orden: 3, nivel: 2, nombre: "Mi agenda y disponibilidad", url: "/tecnico/agenda", desc: "Calendario de actividades y gestión de disponibilidad", bloqueado: false, contador: null },
      { id: 2004, padre: 2000, orden: 4, nivel: 2, nombre: "Mi desempeño", url: "/tecnico/desempeno", desc: "Indicadores personales y del grupo", bloqueado: false, contador: null },

      // M2 Mesa de Servicio
      { id: 2100, padre: null, orden: 2, nivel: 1, nombre: "Mesa de Servicio", url: "/tecnico/mesa/asignados", desc: "Gestión de incidentes y solicitudes de servicio", bloqueado: true, abierto: true },
      { id: 2101, padre: 2100, orden: 1, nivel: 2, nombre: "Mis tickets asignados", url: "/tecnico/mesa/asignados", desc: "Tickets abiertos asignados a mí", bloqueado: true, contador: "mis_asignados" },
      { id: 2102, padre: 2100, orden: 2, nivel: 2, nombre: "Bandeja de pendientes", url: "/tecnico/mesa/pendientes", desc: "Cola de tickets sin asignar de mis grupos", bloqueado: true, contador: "pendientes_grupo" },
      { id: 2103, padre: 2100, orden: 3, nivel: 2, nombre: "Tickets de mi área técnica", url: "/tecnico/mesa/area", desc: "Visibilidad integral de tickets del área", bloqueado: false, contador: null },
      { id: 2104, padre: 2100, orden: 4, nivel: 2, nombre: "Registrar ticket para un usuario", url: "/tecnico/mesa/registrar", desc: "Creación de ticket en nombre del solicitante", bloqueado: false, contador: null },
      { id: 2105, padre: 2100, orden: 5, nivel: 2, nombre: "Búsqueda avanzada", url: "/tecnico/mesa/buscar", desc: "Búsqueda combinada multifiltro", bloqueado: false, contador: null },
      { id: 2106, padre: 2100, orden: 6, nivel: 2, nombre: "Historial de resueltos", url: "/tecnico/mesa/historial", desc: "Tickets resueltos y cerrados", bloqueado: false, contador: null },

      // M3 Seguimiento de SLA
      { id: 2200, padre: null, orden: 3, nivel: 1, nombre: "Seguimiento de SLA", url: "/tecnico/sla/semaforo", desc: "Control de compromisos de tiempo y semáforos", bloqueado: false, abierto: false },
      { id: 2201, padre: 2200, orden: 1, nivel: 2, nombre: "Semáforo de SLA de mi cola", url: "/tecnico/sla/semaforo", desc: "Tablero de riesgo y vencimientos en tiempo real", bloqueado: false, contador: "sla_riesgo" },
      { id: 2202, padre: 2200, orden: 2, nivel: 2, nombre: "Objetivos de tiempo vigentes", url: "/tecnico/sla/objetivos", desc: "Matriz de tiempos institucionales y calculadora", bloqueado: false, contador: null },

      // M4 Gestión de Problemas
      { id: 2300, padre: null, orden: 4, nivel: 1, nombre: "Gestión de Problemas", url: "/tecnico/problemas/asignados", desc: "Investigación de causa raíz y errores conocidos", bloqueado: false, abierto: false },
      { id: 2301, padre: 2300, orden: 1, nivel: 2, nombre: "Problemas asignados a mí", url: "/tecnico/problemas/asignados", desc: "Problemas bajo mi investigación", bloqueado: false, contador: "mis_problemas" },
      { id: 2302, padre: 2300, orden: 2, nivel: 2, nombre: "Problemas de mi grupo", url: "/tecnico/problemas/grupo", desc: "Problemas asignados a mi grupo de soporte", bloqueado: false, contador: null },
      { id: 2303, padre: 2300, orden: 3, nivel: 2, nombre: "Registrar problema", url: "/tecnico/problemas/nuevo", desc: "Formulario de nuevo problema", bloqueado: false, contador: null },
      { id: 2304, padre: 2300, orden: 4, nivel: 2, nombre: "Candidatos a problema", url: "/tecnico/problemas/candidatos", desc: "Incidentes recurrentes sugeridos para análisis", bloqueado: false, contador: "candidatos_problema" },
      { id: 2305, padre: 2300, orden: 5, nivel: 2, nombre: "Errores conocidos (KEDB)", url: "/tecnico/problemas/errores-conocidos", desc: "Base de soluciones temporales documentadas", bloqueado: false, contador: null },

      // M5 Gestión de Cambios
      { id: 2400, padre: null, orden: 5, nivel: 1, nombre: "Gestión de Cambios", url: "/tecnico/cambios/mis-cambios", desc: "RFC, calendario y consola de implementación", bloqueado: false, abierto: false },
      { id: 2401, padre: 2400, orden: 1, nivel: 2, nombre: "Mis cambios", url: "/tecnico/cambios/mis-cambios", desc: "RFC solicitadas o donde participo", bloqueado: false, contador: "mis_cambios" },
      { id: 2402, padre: 2400, orden: 2, nivel: 2, nombre: "Registrar solicitud RFC", url: "/tecnico/cambios/nuevo", desc: "Formulario para nueva solicitud de cambio", bloqueado: false, contador: null },
      { id: 2403, padre: 2400, orden: 3, nivel: 2, nombre: "Cambios por implementar", url: "/tecnico/cambios/implementacion", desc: "Consola de ejecución de RFC y rollback", bloqueado: false, contador: "cambios_implementar" },
      { id: 2404, padre: 2400, orden: 4, nivel: 2, nombre: "Calendario de cambios", url: "/tecnico/cambios/calendario", desc: "Ventanas de mantenimiento y congelamientos", bloqueado: false, contador: null },
      { id: 2405, padre: 2400, orden: 5, nivel: 2, nombre: "Cambios que afectan mis servicios", url: "/tecnico/cambios/impacto", desc: "RFC programadas con posible impacto operativo", bloqueado: false, contador: "cambios_afectan" },
      { id: 2406, padre: 2400, orden: 6, nivel: 2, nombre: "Historial de cambios", url: "/tecnico/cambios/historial", desc: "Auditoría de cambios ejecutados en servicios y CI", bloqueado: false, contador: null },

      // M6 Activos y CMDB
      { id: 2500, padre: null, orden: 6, nivel: 1, nombre: "Activos y CMDB", url: "/tecnico/activos/inventario", desc: "Inventario técnico, topología y mantenimiento", bloqueado: false, abierto: false },
      { id: 2501, padre: 2500, orden: 1, nivel: 2, nombre: "Inventario de activos", url: "/tecnico/activos/inventario", desc: "Consulta y edición técnica de ítems", bloqueado: false, contador: null },
      { id: 2502, padre: 2500, orden: 2, nivel: 2, nombre: "Mapa de topología CMDB", url: "/tecnico/activos/mapa", desc: "Visualización de dependencias e impacto", bloqueado: false, contador: null },
      { id: 2503, padre: 2500, orden: 3, nivel: 2, nombre: "Mantenimiento y reparaciones", url: "/tecnico/activos/mantenimiento", desc: "Planes preventivos y equipos en taller", bloqueado: false, contador: "mantenimientos" },
      { id: 2504, padre: 2500, orden: 4, nivel: 2, nombre: "Inventario físico en campo", url: "/tecnico/activos/conteos", desc: "Módulo mobile-first para auditoría y escaneo", bloqueado: false, contador: "conteos" },
      { id: 2505, padre: 2500, orden: 5, nivel: 2, nombre: "Licencias de software (consulta)", url: "/tecnico/activos/licencias", desc: "Consulta de disponibilidad de licencias", bloqueado: false, contador: null },

      // M7 Gestión del Conocimiento
      { id: 2600, padre: null, orden: 7, nivel: 1, nombre: "Gestión del Conocimiento", url: "/tecnico/conocimiento/base", desc: "Base de conocimiento, artículos y revisiones", bloqueado: false, abierto: false },
      { id: 2601, padre: 2600, orden: 1, nivel: 2, nombre: "Base de conocimiento", url: "/tecnico/conocimiento/base", desc: "Búsqueda y consulta de artículos técnicos", bloqueado: true, contador: null },
      { id: 2602, padre: 2600, orden: 2, nivel: 2, nombre: "Mis artículos", url: "/tecnico/conocimiento/mis-articulos", desc: "Artículos redactados por el técnico", bloqueado: false, contador: "mis_articulos" },
      { id: 2603, padre: 2600, orden: 3, nivel: 2, nombre: "Crear artículo", url: "/tecnico/conocimiento/nuevo", desc: "Redactor de nuevo artículo de conocimiento", bloqueado: false, contador: null },
      { id: 2604, padre: 2600, orden: 4, nivel: 2, nombre: "Revisiones pendientes", url: "/tecnico/conocimiento/revisiones", desc: "Artículos asignados para aprobación técnica", bloqueado: false, contador: "revisiones_articulos" },

      // M8 Catálogo de servicios (consulta)
      { id: 2700, padre: null, orden: 8, nivel: 1, nombre: "Catálogo de servicios (consulta)", url: "/tecnico/catalogo", desc: "Consulta de servicios y SLAs comprometidos", bloqueado: false, abierto: false },
    ];

    for (const op of opcionesTecnico) {
      await client.query(`
        INSERT INTO opciones_menu (
          id_opcion_menu, id_padre, orden, nivel, nombre, url_menu, descripcion,
          bloqueado, abierto_por_defecto, contador_clave, estado_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
        ON CONFLICT (id_opcion_menu) DO UPDATE SET
          id_padre = EXCLUDED.id_padre,
          orden = EXCLUDED.orden,
          nivel = EXCLUDED.nivel,
          nombre = EXCLUDED.nombre,
          url_menu = EXCLUDED.url_menu,
          descripcion = EXCLUDED.descripcion,
          bloqueado = EXCLUDED.bloqueado,
          abierto_por_defecto = EXCLUDED.abierto_por_defecto,
          contador_clave = EXCLUDED.contador_clave,
          estado_registro = true;
      `, [
        op.id, op.padre, op.orden, op.nivel, op.nombre, op.url, op.desc,
        op.bloqueado ?? false, op.abierto ?? false, op.contador ?? null
      ]);

      // Asociar al perfil Técnico (id_perfil = 2)
      await client.query(`
        INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
        VALUES ($1, 2, true)
        ON CONFLICT DO NOTHING;
      `, [op.id]);
    }

    console.log("Migración de menú técnico completada con éxito.");
  });

  process.exit(0);
}

migrar().catch((err) => {
  console.error("Error en migración:", err);
  process.exit(1);
});
