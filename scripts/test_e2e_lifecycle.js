const path = require('path');
const http = require('http');
const fs = require('fs');

const projectDir = path.resolve(__dirname, '..');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Read env
const envContent = fs.readFileSync(path.join(projectDir, '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2 && !line.trim().startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const pool = new Pool({ connectionString: env.DATABASE_URL });
const JWT_SECRET = env.JWT_SECRET;
const COOKIE_NAME = 'sesion';

// Map personas
const PERSONAS = {
  ADMIN: { id_usuario: 15, correo: 'admin.e2e@empresa.com', nombres: 'Carlos Admin', id_perfil: 1, perfil: 'Administrador' },
  TECNICO: { id_usuario: 16, correo: 'tecnico.e2e@empresa.com', nombres: 'Roberto Tecnico', id_perfil: 2, perfil: 'Tecnico' },
  SOLICITANTE: { id_usuario: 17, correo: 'solicitante.e2e@empresa.com', nombres: 'Laura Solicitante', id_perfil: 3, perfil: 'Solicitante' },
  SUPERVISOR: { id_usuario: 18, correo: 'supervisor.e2e@empresa.com', nombres: 'Sofia Supervisor', id_perfil: 4, perfil: 'Supervisor' },
  GESTOR_AREA: { id_usuario: 19, correo: 'gestor.area.e2e@empresa.com', nombres: 'Guillermo GestorArea', id_perfil: 5, perfil: 'Gestor de Area' },
  AUDITOR: { id_usuario: 20, correo: 'auditor.e2e@empresa.com', nombres: 'Andrea Auditor', id_perfil: 6, perfil: 'Auditor' },
  APROBADOR: { id_usuario: 21, correo: 'aprobador.e2e@empresa.com', nombres: 'Alejandro AprobadorCAB', id_perfil: 7, perfil: 'Aprobador' },
  GESTOR_CAMBIOS: { id_usuario: 22, correo: 'gestor.cambios.e2e@empresa.com', nombres: 'Gabriela GestorCambios', id_perfil: 8, perfil: 'Gestor de Cambios' },
  GESTOR_ACTIVOS: { id_usuario: 23, correo: 'gestor.activos.e2e@empresa.com', nombres: 'Gonzalo GestorActivos', id_perfil: 9, perfil: 'Gestor de Activos y Configuracion' },
  GESTOR_PROBLEMAS: { id_usuario: 24, correo: 'gestor.problemas.e2e@empresa.com', nombres: 'Gustavo GestorProblemas', id_perfil: 10, perfil: 'Gestor de Problemas' },
};

function generarToken(persona) {
  const payload = {
    id_usuario: persona.id_usuario,
    nombres: persona.nombres,
    correo_electronico: persona.correo,
    perfiles: [{ id_perfil: persona.id_perfil, nombre: persona.perfil }],
    perfilActivo: { id_perfil: persona.id_perfil, nombre: persona.perfil },
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

function apiRequest(method, endpoint, persona, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://127.0.0.1:3000${endpoint}`);
    const token = persona ? generarToken(persona) : null;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Cookie'] = `${COOKIE_NAME}=${token}`;
    }

    const payloadStr = body ? JSON.stringify(body) : null;
    if (payloadStr) {
      headers['Content-Length'] = Buffer.byteLength(payloadStr);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: url.pathname + url.search,
        method: method,
        headers: headers,
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', err => reject(err));
    if (payloadStr) req.write(payloadStr);
    req.end();
  });
}

const auditResults = {
  testsRun: 0,
  testsPassed: 0,
  testsFailed: 0,
  details: [],
};

function recordTest(name, passed, info, expected = '', actual = '') {
  auditResults.testsRun++;
  if (passed) {
    auditResults.testsPassed++;
    console.log(`[PASS] ${name}`);
  } else {
    auditResults.testsFailed++;
    console.error(`[FAIL] ${name} -> Expected: ${expected}, Got: ${actual}`);
  }
  auditResults.details.push({ name, passed, info, expected, actual });
}

async function runE2E() {
  console.log("================================================================================");
  console.log("SUITE OFICIAL DE PRUEBAS END-TO-END ITSM / ITIL 4");
  console.log("================================================================================\n");

  try {
    // FASE 1: Administrador
    console.log("--- FASE 1: GOBERNANZA Y CONFIGURACION (ADMINISTRADOR) ---");
    const confRes = await apiRequest('GET', '/api/operacion/configuracion', PERSONAS.ADMIN);
    recordTest(
      "Admin consulta configuracion global de operaciones y plataforma",
      confRes.status === 200,
      "Endpoint /api/operacion/configuracion",
      "200 OK",
      `${confRes.status}`
    );

    const srvRes = await apiRequest('GET', '/api/servicios', PERSONAS.ADMIN);
    const srvArray = srvRes.body?.servicios || srvRes.body;
    recordTest(
      "Admin consulta catalogo corporativo de servicios",
      srvRes.status === 200 && Array.isArray(srvArray),
      `Catalogo devolvio ${Array.isArray(srvArray) ? srvArray.length : 0} servicios`,
      "200 OK y Array de servicios",
      `${srvRes.status}`
    );

    const menuAdminRes = await apiRequest('GET', '/api/menu/admin', PERSONAS.ADMIN);
    recordTest(
      "Admin gestiona el arbol de navegacion institucional y modulos",
      menuAdminRes.status === 200,
      "Endpoint /api/menu/admin",
      "200 OK",
      `${menuAdminRes.status}`
    );

    // FASE 2: Solicitante
    console.log("\n--- FASE 2: SOLICITUD DE SERVICIO (SOLICITANTE) ---");
    const solPayload = {
      titulo: "Solicitud de Accesos y Privilegios en Sistemas Corporativos",
      descripcion: "Se requiere formalmente la provision de credenciales con privilegios elevados en ERP para actividades de auditoria y gestion de cierres contables.",
      id_tipo_ticket: 2,
      id_categoria: 4,
      id_servicio: 1,
      id_impacto: 2,
      id_urgencia: 2,
      canal_comunicacion: "PORTAL_WEB"
    };
    const ticketSolRes = await apiRequest('POST', '/api/tickets', PERSONAS.SOLICITANTE, solPayload);
    const solCreated = ticketSolRes.status === 201 && ticketSolRes.body?.ticket;
    const idTicketSol = solCreated ? ticketSolRes.body.ticket.id_ticket : null;
    const codTicketSol = solCreated ? ticketSolRes.body.ticket.codigo_ticket : null;

    recordTest(
      "Solicitante registra requerimiento de servicio",
      solCreated,
      `Ticket creado: ID ${idTicketSol}, Codigo ${codTicketSol}`,
      "201 Created",
      `${ticketSolRes.status}: ${JSON.stringify(ticketSolRes.body)}`
    );

    const dbSolState = await pool.query(
      `SELECT ts.estado_aprobacion, t.id_estado, et.nombre as estado_nombre 
       FROM ticket t 
       JOIN ticket_solicitud ts ON t.id_ticket = ts.id_ticket 
       JOIN estado_ticket et ON t.id_estado = et.id_estado 
       WHERE t.id_ticket = $1`,
      [idTicketSol]
    );
    const solEnPendiente = dbSolState.rows[0]?.estado_aprobacion === 'PENDIENTE_APROBACION';
    recordTest(
      "Solicitud de servicio queda en estado PENDIENTE_APROBACION",
      solEnPendiente,
      `Estado aprobacion en DB: ${dbSolState.rows[0]?.estado_aprobacion}`,
      "PENDIENTE_APROBACION",
      dbSolState.rows[0]?.estado_aprobacion
    );

    // FASE 3: Gestor de Area
    console.log("\n--- FASE 3: CONTROL DE APROBACION DE AREA Y BLINDAJE SOD (GESTOR DE AREA) ---");
    const autoAprobRes = await apiRequest('POST', '/api/aprobaciones', PERSONAS.SOLICITANTE, {
      id_ticket: idTicketSol,
      decision: 'APROBADO',
      comentario: 'Autoaprobacion ilicita'
    });
    recordTest(
      "Blindaje SoD (RN-32): Solicitante no puede autoaprobar su propia solicitud",
      autoAprobRes.status === 403,
      `Respuesta del sistema: ${JSON.stringify(autoAprobRes.body)}`,
      "403 Forbidden",
      `${autoAprobRes.status}`
    );

    const bandejaAprobRes = await apiRequest('GET', '/api/aprobaciones', PERSONAS.GESTOR_AREA);
    const ticketsBandeja = Array.isArray(bandejaAprobRes.body) ? bandejaAprobRes.body : (bandejaAprobRes.body?.tickets || []);
    const encontradaEnBandeja = ticketsBandeja.some(t => t.id_ticket === idTicketSol);
    recordTest(
      "Gestor de Area visualiza requerimiento en bandeja jurisdiccional",
      bandejaAprobRes.status === 200 && encontradaEnBandeja,
      `Total pendientes en bandeja: ${ticketsBandeja.length}`,
      "200 OK y presencia del ticket",
      `Status: ${bandejaAprobRes.status}, encontrado: ${encontradaEnBandeja}`
    );

    const dictamenRes = await apiRequest('POST', '/api/aprobaciones', PERSONAS.GESTOR_AREA, {
      id_ticket: idTicketSol,
      decision: 'APROBADO',
      comentario: 'Dictamen favorable. Se valida la justificacion del area y necesidad operativa.'
    });
    recordTest(
      "Gestor de Area dictamina y aprueba formalmente el requerimiento",
      dictamenRes.status === 200,
      `Resultado dictamen: ${JSON.stringify(dictamenRes.body)}`,
      "200 OK",
      `${dictamenRes.status}`
    );

    const dbSolPostAprob = await pool.query(
      `SELECT ts.estado_aprobacion, t.id_estado, et.nombre as estado_nombre 
       FROM ticket t 
       JOIN ticket_solicitud ts ON t.id_ticket = ts.id_ticket 
       JOIN estado_ticket et ON t.id_estado = et.id_estado 
       WHERE t.id_ticket = $1`,
      [idTicketSol]
    );
    recordTest(
      "Estado de aprobacion de la solicitud pasa a APROBADO",
      dbSolPostAprob.rows[0]?.estado_aprobacion === 'APROBADO',
      `Estado post-dictamen: ${dbSolPostAprob.rows[0]?.estado_aprobacion}, Estado ticket: ${dbSolPostAprob.rows[0]?.estado_nombre}`,
      "APROBADO",
      dbSolPostAprob.rows[0]?.estado_aprobacion
    );

    // FASE 4: Solicitante - Incidente P1
    console.log("\n--- FASE 4: GESTION DE INCIDENTES CRITICOS (SOLICITANTE Y TECNICO) ---");
    const incPayload = {
      titulo: "Falla critica por saturacion de conexiones en Cluster de Base de Datos Principal",
      descripcion: "El cluster de base de datos de produccion presenta agotamiento severo de conexiones disponibles, causando time-outs masivos en el portal y afectando a todos los departamentos de la institucion.",
      id_tipo_ticket: 1,
      id_categoria: 3,
      id_impacto: 3,
      id_urgencia: 3,
      canal_comunicacion: "PORTAL_WEB"
    };
    const incRes = await apiRequest('POST', '/api/tickets', PERSONAS.SOLICITANTE, incPayload);
    const incCreated = incRes.status === 201 && incRes.body?.ticket;
    const idIncidente = incCreated ? incRes.body.ticket.id_ticket : null;
    const codIncidente = incCreated ? incRes.body.ticket.codigo_ticket : null;

    recordTest(
      "Solicitante reporta incidente critico P1",
      incCreated,
      `Incidente creado: ID ${idIncidente}, Codigo ${codIncidente}`,
      "201 Created",
      `${incRes.status}: ${JSON.stringify(incRes.body)}`
    );

    const dbIncState = await pool.query(
      `SELECT t.id_prioridad, pt.codigo as prioridad_codigo, pt.nombre as prioridad_nombre, t.fecha_limite_sla 
       FROM ticket t 
       JOIN prioridad_ticket pt ON t.id_prioridad = pt.id_prioridad 
       WHERE t.id_ticket = $1`,
      [idIncidente]
    );
    recordTest(
      "Matriz de Prioridad ITIL 4 clasifica correctamente como P1 Critica",
      dbIncState.rows[0]?.prioridad_codigo === 'P1',
      `Prioridad asignada: ${dbIncState.rows[0]?.prioridad_nombre} (${dbIncState.rows[0]?.prioridad_codigo}), SLA: ${dbIncState.rows[0]?.fecha_limite_sla}`,
      "P1",
      dbIncState.rows[0]?.prioridad_codigo
    );

    // FASE 5: Tecnico
    console.log("\n--- FASE 5: ATENCION DE MESA DE SERVICIO (TECNICO) ---");
    const bandejaTecRes = await apiRequest('GET', '/api/tickets?vista=bandeja', PERSONAS.TECNICO);
    const incEnBandeja = Array.isArray(bandejaTecRes.body?.tickets) && 
      bandejaTecRes.body.tickets.some(t => t.id_ticket === idIncidente);
    recordTest(
      "Tecnico visualiza incidente critico en su bandeja de entrada",
      bandejaTecRes.status === 200 && incEnBandeja,
      `Incidente visible en cola resolutora de mesa`,
      "200 OK y presencia del incidente",
      `Status: ${bandejaTecRes.status}, en cola: ${incEnBandeja}`
    );

    const tomarRes = await apiRequest('POST', '/api/tickets/mesa/tomar', PERSONAS.TECNICO, {
      id_ticket: idIncidente
    });
    recordTest(
      "Tecnico toma posesion operativa del incidente (Autoasignacion)",
      tomarRes.status === 200,
      `Resultado: ${tomarRes.body?.mensaje}`,
      "200 OK",
      `${tomarRes.status}`
    );

    const commentRes = await apiRequest('POST', `/api/tickets/${idIncidente}/comentarios`, PERSONAS.TECNICO, {
      comentario: "Diagnostico inicial confirmado: el motor de persistencia acumula conexiones en estado IDLE in transaction debido a desconexiones intempestivas. Se requiere escalamiento a Gestion de Problemas para analisis de causa raiz.",
      es_interno: true
    });
    recordTest(
      "Tecnico documenta diagnostico tecnico en la bitacora del ticket",
      commentRes.status === 200 || commentRes.status === 201,
      `Nota interna registrada con exito`,
      "200/201 OK",
      `${commentRes.status}`
    );

    const updateRes = await apiRequest('PATCH', `/api/tickets/${idIncidente}`, PERSONAS.TECNICO, {
      id_estado: 3
    });
    recordTest(
      "Tecnico transiciona estado a EN_PROCESO",
      updateRes.status === 200,
      `Estado actualizado a En Proceso`,
      "200 OK",
      `${updateRes.status}`
    );

    // FASE 6: Supervisor
    console.log("\n--- FASE 6: SUPERVISION Y MONITOREO DE COMPROMISOS SLA (SUPERVISOR) ---");
    const slaRes = await apiRequest('GET', '/api/servicios/sla/escalamientos', PERSONAS.SUPERVISOR);
    recordTest(
      "Supervisor consulta panel de escalamientos y seguimiento SLA",
      slaRes.status === 200,
      `Monitoreo SLA operativo activo`,
      "200 OK",
      `${slaRes.status}`
    );

    const supervisorTodosRes = await apiRequest('GET', '/api/tickets?vista=todos', PERSONAS.SUPERVISOR);
    const visibilidadSupervisor = Array.isArray(supervisorTodosRes.body?.tickets) && 
      supervisorTodosRes.body.tickets.some(t => t.id_ticket === idIncidente) &&
      supervisorTodosRes.body.tickets.some(t => t.id_ticket === idTicketSol);
    recordTest(
      "Supervisor cuenta con visibilidad integral transversal de todos los tickets",
      supervisorTodosRes.status === 200 && visibilidadSupervisor,
      `Ambos tickets (Solicitud e Incidente) visibles en la supervision`,
      "200 OK y visibilidad completa",
      `Status: ${supervisorTodosRes.status}, visible: ${visibilidadSupervisor}`
    );

    // FASE 7: Gestor de Problemas
    console.log("\n--- FASE 7: GESTION DE PROBLEMAS Y BASE DE ERRORES CONOCIDOS (KEDB) ---");
    const probPayload = {
      titulo: "Fuga de conexiones y degradacion de memoria en PostgreSQL Core",
      descripcion: "Analisis de causa raiz por incidentes recurrentes de agotamiento de conexiones en la base de datos de produccion.",
      id_impacto: 3,
      id_urgencia: 3,
      id_prioridad: 1,
      metodo_analisis: "5_PORQUES",
      id_ci_afectado: 2,
      id_departamento: 1,
      id_ticket_origen: idIncidente
    };
    const probRes = await apiRequest('POST', '/api/problemas', PERSONAS.GESTOR_PROBLEMAS, probPayload);
    const probCreated = probRes.status === 201 && (probRes.body?.id_problema || probRes.body?.codigo_problema);
    const idProblema = probCreated ? (probRes.body.id_problema || probRes.body?.data?.id_problema) : null;
    const codProblema = probCreated ? (probRes.body.codigo_problema || probRes.body?.data?.codigo_problema) : null;

    recordTest(
      "Gestor de Problemas formaliza registro de Problema asociado al Incidente",
      probCreated,
      `Problema registrado: ID ${idProblema}, Codigo ${codProblema}`,
      "201 Created",
      `${probRes.status}: ${JSON.stringify(probRes.body)}`
    );

    await pool.query(
      `UPDATE problema 
       SET causa_raiz = $1, 
           workaround = $2, 
           es_error_conocido = true, 
           id_estado = 4 
       WHERE id_problema = $3`,
      [
        "El pooler de conexiones acumula sesiones en estado IDLE por falta de un reap timeout agresivo en aplicaciones heredadas.",
        "Limpieza periodica de conexiones inactivas mayores a 15 minutos mediante un cron job automatizado de mantenimiento.",
        idProblema
      ]
    );

    const kedbRes = await apiRequest('GET', '/api/problemas?kedb=true', PERSONAS.TECNICO);
    const visibleEnKedb = Array.isArray(kedbRes.body) && kedbRes.body.some(p => p.id_problema === idProblema);
    recordTest(
      "El problema se publica exitosamente en la KEDB (Base de Errores Conocidos) y es visible para Tecnicos",
      kedbRes.status === 200 && visibleEnKedb,
      `Problema ${codProblema} catalogado en la KEDB con workaround disponible`,
      "200 OK y presencia en KEDB",
      `Status: ${kedbRes.status}, KEDB visible: ${visibleEnKedb}`
    );

    // FASE 8: Gestor de Cambios
    console.log("\n--- FASE 8: GESTION DE CAMBIOS (GESTOR DE CAMBIOS) ---");
    const rfcPayload = {
      titulo: "Actualizacion de Arquitectura de Conexiones y Despliegue de PgBouncer en Cluster DB",
      descripcion: "Implementacion definitiva de PgBouncer como proxy transaccional de alta concurrencia para resolver permanentemente la causa raiz del Problema PRB.",
      tipo_cambio: "NORMAL",
      id_impacto: 3,
      id_urgencia: 2,
      id_prioridad: 2,
      justificacion: "Solucion de ingenieria definitiva ante el problema de fuga de conexiones identificado en KEDB.",
      plan_implementacion: "1. Despliegue de nodo PgBouncer v1.22. 2. Cambio de puerto en cadena de conexion. 3. Monitoreo de 2 horas. 4. Cierre.",
      plan_rollback: "Revertir trafico al puerto nativo 5432 y deshabilitar servicio PgBouncer.",
      plan_pruebas: "Inyeccion de 800 conexiones simultaneas simuladas validando tiempos de respuesta menores a 50ms.",
      ventana_inicio: new Date(Date.now() + 86400000).toISOString(),
      ventana_fin: new Date(Date.now() + 93600000).toISOString(),
      id_ci_afectado: 2,
      id_problema_origen: idProblema,
      id_incidente_origen: idIncidente
    };

    const rfcRes = await apiRequest('POST', '/api/cambios', PERSONAS.GESTOR_CAMBIOS, rfcPayload);
    const rfcCreated = rfcRes.status === 201 && rfcRes.body?.id_cambio;
    const idCambio = rfcCreated ? rfcRes.body.id_cambio : null;
    const codCambio = rfcCreated ? rfcRes.body.codigo_cambio : null;

    recordTest(
      "Gestor de Cambios registra Solicitud de Cambio (RFC) vinculada al Problema e Incidente",
      rfcCreated,
      `RFC creada: ID ${idCambio}, Codigo ${codCambio}`,
      "201 Created",
      `${rfcRes.status}: ${JSON.stringify(rfcRes.body)}`
    );

    const dbRfcState = await pool.query(`SELECT id_estado FROM cambio WHERE id_cambio = $1`, [idCambio]);
    recordTest(
      "La RFC queda en estado 'En Evaluacion CAB' (id_estado = 2)",
      dbRfcState.rows[0]?.id_estado === 2,
      `Estado RFC en DB: ${dbRfcState.rows[0]?.id_estado}`,
      "2 (En Evaluacion CAB)",
      `${dbRfcState.rows[0]?.id_estado}`
    );

    // FASE 9: Aprobador (CAB)
    console.log("\n--- FASE 9: COMITE DE CAMBIOS (CAB) Y APROBACION FORMAL (APROBADOR) ---");
    const cabListRes = await apiRequest('GET', '/api/cambios/aprobaciones', PERSONAS.APROBADOR);
    const rfcEnCab = Array.isArray(cabListRes.body) && cabListRes.body.some(c => c.id_cambio === idCambio);
    recordTest(
      "Aprobador (CAB) visualiza la RFC en su bandeja de evaluacion",
      cabListRes.status === 200 && rfcEnCab,
      `RFC ${codCambio} disponible para deliberacion en el CAB`,
      "200 OK y presencia en CAB",
      `Status: ${cabListRes.status}, en CAB: ${rfcEnCab}`
    );

    const votoRes = await apiRequest('POST', '/api/cambios/aprobaciones', PERSONAS.APROBADOR, {
      id_cambio: idCambio,
      decision: 'APROBADO',
      comentario: 'Aprobado unanimemente en sesion ordinaria del CAB.'
    });
    recordTest(
      "Aprobador (CAB) registra dictamen formal de APROBADO",
      votoRes.status === 200,
      `Respuesta CAB: ${JSON.stringify(votoRes.body)}`,
      "200 OK",
      `${votoRes.status}`
    );

    const dbRfcPostCab = await pool.query(`SELECT id_estado FROM cambio WHERE id_cambio = $1`, [idCambio]);
    recordTest(
      "La RFC avanza automaticamente a estado 'Aprobado' (id_estado = 3)",
      dbRfcPostCab.rows[0]?.id_estado === 3,
      `Estado post-CAB: ${dbRfcPostCab.rows[0]?.id_estado}`,
      "3 (Aprobado)",
      `${dbRfcPostCab.rows[0]?.id_estado}`
    );

    // FASE 10: Ejecucion y KCS
    console.log("\n--- FASE 10: EJECUCION DEL CAMBIO, RESOLUCION Y CAPITALIZACION KCS ---");
    await pool.query(
      `UPDATE cambio SET id_estado = 6, resultado_pir = $1 WHERE id_cambio = $2`,
      ["Implementacion completada con exito sin incidentes inducidos. PIR satisfactorio.", idCambio]
    );

    await pool.query(
      `UPDATE problema SET id_estado = 5, solucion_definitiva = $1 WHERE id_problema = $2`,
      ["Despliegue operativo de PgBouncer. Fugas de conexion erradicadas al 100%.", idProblema]
    );

    await pool.query(
      `UPDATE ticket SET id_estado = 5, solucion_aplicada = $1, fecha_resolucion = NOW() WHERE id_ticket = $2`,
      ["Incidente resuelto definitivamente mediante RFC y despliegue de PgBouncer.", idIncidente]
    );

    const artPayload = {
      titulo: "KCS-KB-001: Guia de Arquitectura y Manejo de Conexiones PostgreSQL con PgBouncer",
      contenido_markdown: `# Gestion de Alta Disponibilidad y Conexiones\n\n## Causa Raiz Identificada\nSaturacion por acumulacion de transacciones IDLE en PostgreSQL.\n\n## Solucion de Ingenieria Aplicada\nImplementacion de PgBouncer en modo 'transaction' con un pool de 1000 clientes.\n\n## Verificacion Operativa\nMonitorear logs y metricas de saturacion en Grafana.`,
      id_categoria: 3,
      id_problema_origen: idProblema,
      audiencia_perfiles: [1, 2, 4, 8, 10]
    };
    const artRes = await apiRequest('POST', '/api/conocimiento', PERSONAS.TECNICO, artPayload);
    const artCreated = artRes.status === 201 && (artRes.body?.id_articulo || artRes.body?.articulo?.id_articulo || artRes.body?.data?.id_articulo);
    const idArticulo = artCreated ? (artRes.body.id_articulo || artRes.body.articulo?.id_articulo || artRes.body?.data?.id_articulo) : null;
    const codArticulo = artCreated ? (artRes.body.codigo_articulo || artRes.body.articulo?.codigo_articulo || artRes.body?.data?.codigo_articulo) : null;

    recordTest(
      "Se capitaliza el aprendizaje operacional mediante publicacion de Articulo KCS",
      artCreated,
      `Articulo KCS creado: ID ${idArticulo}, Codigo ${codArticulo}`,
      "201 Created",
      `${artRes.status}: ${JSON.stringify(artRes.body)}`
    );

    // FASE 11: Auditoria
    console.log("\n--- FASE 11: AUDITORIA INTEGRAL, INSPECCION Y CUMPLIMIENTO (AUDITOR) ---");
    const logsRes = await apiRequest('GET', '/api/seguridad/logs', PERSONAS.AUDITOR);
    recordTest(
      "Auditor inspecciona bitacora forense de logs de auditoria",
      logsRes.status === 200,
      `Trazabilidad de auditoria disponible para el perfil Auditor`,
      "200 OK",
      `${logsRes.status}`
    );

    const sodRes = await apiRequest('GET', '/api/seguridad/cumplimiento/sod', PERSONAS.AUDITOR);
    recordTest(
      "Auditor ejecuta analisis automatizado de Segregacion de Funciones (SoD)",
      sodRes.status === 200 && typeof sodRes.body === 'object',
      `Diagnostico de incompatibilidades y autoaprobaciones ejecutado`,
      "200 OK",
      `${sodRes.status}`
    );

    const cumpCambiosRes = await apiRequest('GET', '/api/seguridad/cumplimiento/cambios', PERSONAS.AUDITOR);
    recordTest(
      "Auditor evalua cumplimiento de gobernanza de Cambios (RFCs no autorizadas o irregulares)",
      cumpCambiosRes.status === 200,
      `Control de cambios no autorizados analizado correctamente`,
      "200 OK",
      `${cumpCambiosRes.status}`
    );

    const muestreoRes = await apiRequest('GET', '/api/seguridad/muestreo', PERSONAS.AUDITOR);
    recordTest(
      "Auditor genera muestra aleatoria representativa de tickets para inspeccion",
      muestreoRes.status === 200,
      `Muestreo de conformidad ejecutado`,
      "200 OK",
      `${muestreoRes.status}`
    );

    const auditWriteRes = await apiRequest('POST', '/api/tickets', PERSONAS.AUDITOR, solPayload);
    recordTest(
      "Blindaje de Auditor: Perfil Auditor tiene denegada la creacion o mutacion de tickets",
      auditWriteRes.status === 403,
      `Respuesta ante intento de escritura: ${JSON.stringify(auditWriteRes.body)}`,
      "403 Forbidden",
      `${auditWriteRes.status}`
    );

    console.log("\n================================================================================");
    console.log(`RESUMEN DE PRUEBAS END-TO-END DINAMICAS:`);
    console.log(`Total Pruebas: ${auditResults.testsRun}`);
    console.log(`Aprobadas:    ${auditResults.testsPassed}`);
    console.log(`Fallidas:     ${auditResults.testsFailed}`);
    console.log("================================================================================\n");

    if (auditResults.testsFailed > 0) {
      process.exit(1);
    }

  } catch (err) {
    console.error("FATAL ERROR IN E2E EXECUTION:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runE2E();
