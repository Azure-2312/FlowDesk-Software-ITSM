const path = require('path');
const http = require('http');
const fs = require('fs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const projectDir = path.resolve(__dirname, '..');
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

const results = {
  testsRun: 0,
  testsPassed: 0,
  testsFailed: 0,
  details: [],
};

function recordTest(name, passed, info, expected = '', actual = '') {
  results.testsRun++;
  if (passed) {
    results.testsPassed++;
    console.log(`[PASS] ${name}`);
  } else {
    results.testsFailed++;
    console.error(`[FAIL] ${name} -> Expected: ${expected}, Got: ${actual}`);
  }
  results.details.push({ name, passed, info, expected, actual });
}

async function runExceptionsSuite() {
  console.log("================================================================================");
  console.log("SUITE E2E FASE 2: FLUJOS DE EXCEPCION, CONTINGENCIAS Y RESILIENCIA ITSM");
  console.log("================================================================================\n");

  try {
    // -------------------------------------------------------------------------
    // BLOQUE 1: EXCEPCIONES EN SOLICITUDES DE SERVICIO
    // -------------------------------------------------------------------------
    console.log("--- BLOQUE 1: EXCEPCIONES EN SOLICITUDES DE SERVICIO ---");

    // S-1: Crear solicitud y rechazarla formalmente
    const solPayload = {
      titulo: "Solicitud de Licencia Adicional de Software Especializado CAD",
      descripcion: "Se requiere licencia de software de diseno para practicante de ingenieria civil.",
      id_tipo_ticket: 2,
      id_categoria: 4,
      id_servicio: 1,
      id_impacto: 2,
      id_urgencia: 2,
      canal_comunicacion: "PORTAL_WEB"
    };

    const solRes = await apiRequest('POST', '/api/tickets', PERSONAS.SOLICITANTE, solPayload);
    const idTicketRechazo = solRes.body?.ticket?.id_ticket;
    recordTest(
      "Solicitante registra requerimiento para flujo de denegacion",
      solRes.status === 201 && !!idTicketRechazo,
      `Ticket ID: ${idTicketRechazo}`,
      "201 Created",
      `${solRes.status}`
    );

    // S-1b: Regla de Negocio RN-21 (Rechazo sin motivo suficiente debe fallar)
    const rechazoInvalidoRes = await apiRequest('POST', '/api/aprobaciones', PERSONAS.GESTOR_AREA, {
      id_ticket: idTicketRechazo,
      decision: 'RECHAZADO',
      comentario: 'No' // Menor a 5 caracteres
    });
    recordTest(
      "RN-21: Gestor de Area no puede rechazar sin sustento formal suficiente (min. 5 chars)",
      rechazoInvalidoRes.status === 400,
      `Respuesta del sistema: ${JSON.stringify(rechazoInvalidoRes.body)}`,
      "400 Bad Request",
      `${rechazoInvalidoRes.status}`
    );

    // S-1c: Rechazo formal exitoso por Gestor de Área
    const rechazoValidoRes = await apiRequest('POST', '/api/aprobaciones', PERSONAS.GESTOR_AREA, {
      id_ticket: idTicketRechazo,
      decision: 'RECHAZADO',
      comentario: 'Requerimiento desestimado por restricciones presupuestales del ejercicio fiscal.'
    });
    recordTest(
      "Gestor de Area emite dictamen formal de RECHAZADO",
      rechazoValidoRes.status === 200,
      `Respuesta: ${JSON.stringify(rechazoValidoRes.body)}`,
      "200 OK",
      `${rechazoValidoRes.status}`
    );

    // S-1d: Validar que el ticket transicionó a Cancelado (id_estado = 7) y estado_aprobacion = 'RECHAZADO'
    const dbSolRechazada = await pool.query(
      `SELECT t.id_estado, ts.estado_aprobacion 
       FROM ticket t 
       JOIN ticket_solicitud ts ON t.id_ticket = ts.id_ticket 
       WHERE t.id_ticket = $1`,
      [idTicketRechazo]
    );
    const estadoTicketRechazado = dbSolRechazada.rows[0]?.id_estado === 7;
    const estadoAprobRechazado = dbSolRechazada.rows[0]?.estado_aprobacion === 'RECHAZADO';
    recordTest(
      "Solicitud rechazada queda en estado CANCELADO (id_estado = 7) y aprobacion RECHAZADO",
      estadoTicketRechazado && estadoAprobRechazado,
      `DB: id_estado=${dbSolRechazada.rows[0]?.id_estado}, estado_aprobacion=${dbSolRechazada.rows[0]?.estado_aprobacion}`,
      "id_estado=7, estado_aprobacion=RECHAZADO",
      `id_estado=${dbSolRechazada.rows[0]?.id_estado}, estado_aprobacion=${dbSolRechazada.rows[0]?.estado_aprobacion}`
    );

    // S-2: Cancelación de requerimiento por Supervisor
    const solCancelPayload = {
      titulo: "Solicitud duplicada para eliminacion en triaje",
      descripcion: "El usuario creo este requerimiento por error dos veces.",
      id_tipo_ticket: 2,
      id_categoria: 4,
      id_servicio: 1,
      id_impacto: 2,
      id_urgencia: 2,
      canal_comunicacion: "PORTAL_WEB"
    };
    const solCancelRes = await apiRequest('POST', '/api/tickets', PERSONAS.SOLICITANTE, solCancelPayload);
    const idTicketCancel = solCancelRes.body?.ticket?.id_ticket;
    const cancelRes = await apiRequest('PATCH', `/api/tickets/${idTicketCancel}`, PERSONAS.SUPERVISOR, {
      id_estado: 7,
      motivo_cancelacion: "Requerimiento descartado en triaje por solicitud duplicada previa."
    });
    recordTest(
      "Supervisor cancela ticket justificando duplicidad en triaje",
      cancelRes.status === 200,
      `Ticket ID: ${idTicketCancel}`,
      "200 OK",
      `${cancelRes.status}`
    );

    // -------------------------------------------------------------------------
    // BLOQUE 2: EXCEPCIONES EN GESTION DE INCIDENTES (PAUSAS SLA Y REAPERTURA)
    // -------------------------------------------------------------------------
    console.log("\n--- BLOQUE 2: EXCEPCIONES EN INCIDENTES (PAUSAS SLA Y REAPERTURAS) ---");

    const incExcPayload = {
      titulo: "Intermitencia en canal VPN corporativo sede secundaria",
      descripcion: "Los usuarios de la sucursal norte reportan microcortes en la sesion de escritorio remoto.",
      id_tipo_ticket: 1,
      id_categoria: 3,
      id_impacto: 2,
      id_urgencia: 2,
      canal_comunicacion: "PORTAL_WEB"
    };
    const incExcRes = await apiRequest('POST', '/api/tickets', PERSONAS.SOLICITANTE, incExcPayload);
    const idIncExc = incExcRes.body?.ticket?.id_ticket;

    // Técnico toma el ticket y lo pasa a EN_PROCESO (3)
    await apiRequest('POST', '/api/tickets/mesa/tomar', PERSONAS.TECNICO, { id_ticket: idIncExc });
    await apiRequest('PATCH', `/api/tickets/${idIncExc}`, PERSONAS.TECNICO, { id_estado: 3 });

    // I-1: Pausa de SLA por Espera de Usuario (estado 4: EN_ESPERA)
    const pausaRes = await apiRequest('PATCH', `/api/tickets/${idIncExc}`, PERSONAS.TECNICO, {
      id_estado: 4,
      id_motivo_espera: 1 // Espera de usuario
    });
    recordTest(
      "Tecnico transiciona incidente a EN_ESPERA (id_estado = 4) pausando reloj SLA",
      pausaRes.status === 200,
      `Ticket ID: ${idIncExc}`,
      "200 OK",
      `${pausaRes.status}`
    );

    const dbPausa = await pool.query(
      `SELECT id_estado, fecha_ultima_pausa FROM ticket WHERE id_ticket = $1`,
      [idIncExc]
    );
    recordTest(
      "El sistema registra la marca temporal de inicio de pausa SLA en base de datos",
      dbPausa.rows[0]?.id_estado === 4 && !!dbPausa.rows[0]?.fecha_ultima_pausa,
      `fecha_ultima_pausa: ${dbPausa.rows[0]?.fecha_ultima_pausa}`,
      "fecha_ultima_pausa NOT NULL",
      `${dbPausa.rows[0]?.fecha_ultima_pausa}`
    );

    // I-2: Reanudación de SLA tras respuesta (regresa a EN_PROCESO = 3)
    const reanudarRes = await apiRequest('PATCH', `/api/tickets/${idIncExc}`, PERSONAS.TECNICO, {
      id_estado: 3
    });
    recordTest(
      "Tecnico reanuda la atencion: ticket retorna a EN_PROCESO (id_estado = 3)",
      reanudarRes.status === 200,
      `Estado actualizado`,
      "200 OK",
      `${reanudarRes.status}`
    );

    // I-3: Técnico marca ticket como RESUELTO (5)
    const resolverRes = await apiRequest('PATCH', `/api/tickets/${idIncExc}`, PERSONAS.TECNICO, {
      id_estado: 5,
      solucion_aplicada: "Reinicio de tunel IPSec y purga de tablas ARP en gateway perimetral.",
      categoria_resolucion: "REDES_CONECTIVIDAD"
    });
    recordTest(
      "Tecnico documenta solucion y transiciona incidente a RESUELTO (id_estado = 5)",
      resolverRes.status === 200,
      `Resolucion guardada`,
      "200 OK",
      `${resolverRes.status}`
    );

    // I-4b: Blindaje de Reapertura (Solicitante envía motivo inválido menor a 8 caracteres)
    const reaperturaInvalidaRes = await apiRequest('PATCH', `/api/tickets/${idIncExc}`, PERSONAS.SOLICITANTE, {
      es_reapertura: true,
      motivo_reapertura: "Falla" // Menor a 8 caracteres
    });
    recordTest(
      "Regla ITIL v4: Rechazo de reapertura si no se registra un motivo fundado (min. 8 chars)",
      reaperturaInvalidaRes.status === 400,
      `Respuesta: ${JSON.stringify(reaperturaInvalidaRes.body)}`,
      "400 Bad Request",
      `${reaperturaInvalidaRes.status}`
    );

    // I-4: Solicitante reabre el ticket formalmente dentro de la ventana de 48h
    const reaperturaValidaRes = await apiRequest('PATCH', `/api/tickets/${idIncExc}`, PERSONAS.SOLICITANTE, {
      es_reapertura: true,
      motivo_reapertura: "El problema persiste: la conexion se cayo nuevamente a los 10 minutos de reconectar."
    });
    recordTest(
      "Solicitante reabre formalmente el incidente dentro de la ventana de gracia",
      reaperturaValidaRes.status === 200,
      `Resultado reapertura: ${JSON.stringify(reaperturaValidaRes.body?.ticket?.id_estado)}`,
      "200 OK",
      `${reaperturaValidaRes.status}`
    );

    const dbReabierto = await pool.query(
      `SELECT id_estado, conteo_reaperturas, motivo_reapertura, fecha_reapertura FROM ticket WHERE id_ticket = $1`,
      [idIncExc]
    );
    recordTest(
      "Incidente reabierto retorna a EN_PROCESO (3) con contador de reaperturas incrementado a 1",
      dbReabierto.rows[0]?.id_estado === 3 && dbReabierto.rows[0]?.conteo_reaperturas === 1,
      `id_estado: ${dbReabierto.rows[0]?.id_estado}, conteo_reaperturas: ${dbReabierto.rows[0]?.conteo_reaperturas}`,
      "id_estado=3, conteo_reaperturas=1",
      `id_estado=${dbReabierto.rows[0]?.id_estado}, conteo_reaperturas=${dbReabierto.rows[0]?.conteo_reaperturas}`
    );

    // Resolver nuevamente y calificar CSAT
    await apiRequest('PATCH', `/api/tickets/${idIncExc}`, PERSONAS.TECNICO, {
      id_estado: 5,
      solucion_aplicada: "Reemplazo de interfaz fisica defectuosa en switch principal.",
      categoria_resolucion: "HARDWARE_RED"
    });

    const csatRes = await apiRequest('PATCH', `/api/tickets/${idIncExc}`, PERSONAS.SOLICITANTE, {
      calificacion_csat: 5,
      comentario_csat: "Excelente atencion y seguimiento final del especialista."
    });
    recordTest(
      "Solicitante califica conformidad y experiencia de servicio (Encuesta CSAT 5 Estrellas)",
      csatRes.status === 200,
      `CSAT registrado`,
      "200 OK",
      `${csatRes.status}`
    );

    // -------------------------------------------------------------------------
    // BLOQUE 3: EXCEPCIONES EN GESTION DE CAMBIOS (RECHAZO CAB, ROLLBACK Y ECAB)
    // -------------------------------------------------------------------------
    console.log("\n--- BLOQUE 3: EXCEPCIONES EN CAMBIOS (RECHAZO CAB, ROLLBACK, PIR Y ECAB) ---");

    // C-1: Rechazo formal de RFC por el Comité CAB
    const rfcRechazoPayload = {
      titulo: "Actualizacion de kernel experimental en servidor de base de datos prod",
      descripcion: "Compilacion personalizada de kernel Linux 6.8 con parches no oficiales.",
      tipo_cambio: "NORMAL",
      id_impacto: 3,
      id_urgencia: 2,
      id_prioridad: 2,
      justificacion: "Optimizar latencias de disco en un 3%.",
      plan_implementacion: "Compilar e instalar kernel en caliente.",
      plan_rollback: "Reiniciar con grub anterior.",
      plan_pruebas: "Pruebas directas en produccion.",
      ventana_inicio: new Date(Date.now() + 86400000).toISOString(),
      ventana_fin: new Date(Date.now() + 93600000).toISOString(),
    };

    const rfcRechazoRes = await apiRequest('POST', '/api/cambios', PERSONAS.GESTOR_CAMBIOS, rfcRechazoPayload);
    const idRfcRechazo = rfcRechazoRes.body?.id_cambio;

    const votoRechazoRes = await apiRequest('POST', '/api/cambios/aprobaciones', PERSONAS.APROBADOR, {
      id_cambio: idRfcRechazo,
      decision: 'RECHAZADO',
      comentario: 'Riesgo inaceptable: kernel no certificado por soporte de fabricante en ambiente productivo.'
    });
    recordTest(
      "Aprobador (CAB) emite dictamen de RECHAZADO para la RFC por riesgo excesivo",
      votoRechazoRes.status === 200,
      `Respuesta: ${JSON.stringify(votoRechazoRes.body)}`,
      "200 OK",
      `${votoRechazoRes.status}`
    );

    const dbRfcRechazada = await pool.query(`SELECT id_estado FROM cambio WHERE id_cambio = $1`, [idRfcRechazo]);
    recordTest(
      "La RFC transiciona inmediatamente a estado RECHAZADO (id_estado = 8)",
      dbRfcRechazada.rows[0]?.id_estado === 8,
      `id_estado en DB: ${dbRfcRechazada.rows[0]?.id_estado}`,
      "8 (Rechazado)",
      `${dbRfcRechazada.rows[0]?.id_estado}`
    );

    // C-3: Fallo de Implementación y Activación de Rollback
    const rfcRollbackPayload = {
      titulo: "Migracion de esquema relacional v3.4 en microservicio de facturacion",
      descripcion: "Reestructuracion de indices y particionamiento de tablas maestras.",
      tipo_cambio: "NORMAL",
      id_impacto: 2,
      id_urgencia: 2,
      id_prioridad: 2,
      justificacion: "Preparacion para auditoria anual de facturacion.",
      plan_implementacion: "Ejecutar DDL de migracion paso a paso.",
      plan_rollback: "Ejecutar script de marcha atras drop partition y restore de backup.",
      plan_pruebas: "Validar emision de 10 facturas testigo.",
      ventana_inicio: new Date(Date.now() + 86400000).toISOString(),
      ventana_fin: new Date(Date.now() + 93600000).toISOString(),
    };
    const rfcRollbackRes = await apiRequest('POST', '/api/cambios', PERSONAS.GESTOR_CAMBIOS, rfcRollbackPayload);
    const idRfcRollback = rfcRollbackRes.body?.id_cambio;

    // Aprobar la RFC
    await apiRequest('POST', '/api/cambios/aprobaciones', PERSONAS.APROBADOR, {
      id_cambio: idRfcRollback,
      decision: 'APROBADO',
      comentario: 'Aprobado con plan de rollback validado.'
    });

    // Pasar la RFC a En Ejecución (id_estado = 5)
    await pool.query(`UPDATE cambio SET id_estado = 5 WHERE id_cambio = $1`, [idRfcRollback]);

    // Ejecutar Rollback formal vía endpoint de ejecución
    const rollbackRes = await apiRequest('POST', '/api/cambios/gestion/ejecucion', PERSONAS.GESTOR_CAMBIOS, {
      id_cambio: idRfcRollback,
      accion: 'resultado',
      resultado: 'ROLLBACK',
      motivo: 'Bloqueo exclusivo (deadlock) de tablas criticas durante la ejecucion del DDL. Se activo plan de reversa.'
    });
    recordTest(
      "Gestor de Cambios reporta fallo de ejecucion y activa procedimiento formal de ROLLBACK",
      rollbackRes.status === 200,
      `Respuesta: ${JSON.stringify(rollbackRes.body)}`,
      "200 OK",
      `${rollbackRes.status}`
    );

    const dbRfcRollback = await pool.query(`SELECT id_estado FROM cambio WHERE id_cambio = $1`, [idRfcRollback]);
    recordTest(
      "La RFC pasa a estado FALLIDO / REVERTIDO (id_estado = 7)",
      dbRfcRollback.rows[0]?.id_estado === 7,
      `id_estado en DB: ${dbRfcRollback.rows[0]?.id_estado}`,
      "7 (Fallido/Rollback)",
      `${dbRfcRollback.rows[0]?.id_estado}`
    );

    // C-3b: Registro formal de PIR (Revisión Post-Implementación)
    const pirRes = await apiRequest('POST', '/api/cambios/gestion/pir', PERSONAS.GESTOR_CAMBIOS, {
      id_cambio: idRfcRollback,
      resultado: "Revision Post-Implementacion (PIR): El script de rollback restauro la operacion normal en 7 minutos. Se indujo un incidente menor resuelto.",
      incidentes_inducidos: 1
    });
    recordTest(
      "Gestor de Cambios formaliza la auditoria PIR registrando resultado e incidente inducido",
      pirRes.status === 200,
      `Respuesta: ${JSON.stringify(pirRes.body)}`,
      "200 OK",
      `${pirRes.status}`
    );

    // C-4: Cambio de Emergencia (ECAB)
    const rfcEmergenciaPayload = {
      titulo: "Hotfix de emergencia: Aplicacion de parche de seguridad CVE-2026-4412",
      descripcion: "Vulnerabilidad Zero-Day detectada en gateway perimetral con exploit activo en Internet.",
      tipo_cambio: "EMERGENCIA",
      id_impacto: 3,
      id_urgencia: 3,
      id_prioridad: 1,
      justificacion: "Neutralizacion inmediata de vector de ataque activo segun alerta del CERT.",
      plan_implementacion: "Inyeccion de regla WAF y reinicio de demonio de inspeccion profunda.",
      plan_rollback: "Retirar regla WAF y levantar respaldo de politicas.",
      plan_pruebas: "Verificar paso de trafico legitimo en portal web.",
      ventana_inicio: new Date().toISOString(),
      ventana_fin: new Date(Date.now() + 3600000).toISOString(),
    };
    const rfcEmergRes = await apiRequest('POST', '/api/cambios', PERSONAS.GESTOR_CAMBIOS, rfcEmergenciaPayload);
    const idRfcEmerg = rfcEmergRes.body?.id_cambio;
    const dbEmerg = idRfcEmerg ? await pool.query(`SELECT tipo_cambio FROM cambio WHERE id_cambio = $1`, [idRfcEmerg]) : null;
    const esEmergencia = dbEmerg?.rows[0]?.tipo_cambio === 'EMERGENCIA';
    recordTest(
      "Gestor de Cambios registra Cambio de Emergencia (ECAB) para atencion inmediata",
      rfcEmergRes.status === 201 && esEmergencia,
      `RFC Emergencia ID: ${idRfcEmerg}, Tipo: ${dbEmerg?.rows[0]?.tipo_cambio}`,
      "201 Created y tipo EMERGENCIA",
      `${rfcEmergRes.status}`
    );

    // -------------------------------------------------------------------------
    // BLOQUE 4: GESTION DE ACTIVOS Y CMDB (CONFIGURATION MANAGEMENT)
    // -------------------------------------------------------------------------
    console.log("\n--- BLOQUE 4: GESTION DE ACTIVOS Y CMDB ---");

    // A-1b: Blindaje SoD en Activos (Técnico no puede dar de alta activos)
    const activoTecnicoRes = await apiRequest('POST', '/api/activos', PERSONAS.TECNICO, {
      codigo_patrimonial: "ACT-ILICITO-001",
      tipo_activo: "COMPUTO",
      marca: "Dell",
      modelo: "PowerEdge R750"
    });
    recordTest(
      "Blindaje SoD: Perfil Tecnico tiene denegada el alta de activos en el inventario institucional",
      activoTecnicoRes.status === 403,
      `Respuesta: ${JSON.stringify(activoTecnicoRes.body)}`,
      "403 Forbidden",
      `${activoTecnicoRes.status}`
    );

    // A-1: Alta de Activo Físico por Gestor de Activos (Perfil 9)
    const codPatrimonial = `ACT-SRV-${Date.now().toString().slice(-6)}`;
    const activoValidoPayload = {
      codigo_patrimonial: codPatrimonial,
      numero_serie: `SN-${Date.now()}`,
      tipo_activo: "COMPUTO",
      marca: "HPE",
      modelo: "ProLiant DL380 Gen10",
      costo_compra: 8500.00,
      valor_residual: 1200.00,
      vida_util_meses: 60,
      estado_activo: "EN_ALMACEN",
      id_departamento: 1
    };
    const activoValidoRes = await apiRequest('POST', '/api/activos', PERSONAS.GESTOR_ACTIVOS, activoValidoPayload);
    const idActivoCreado = activoValidoRes.body?.activo?.id_activo || activoValidoRes.body?.id_activo;
    recordTest(
      "Gestor de Activos formaliza el alta de un nuevo activo fisico en el inventario",
      activoValidoRes.status === 201 && !!idActivoCreado,
      `Activo ID: ${idActivoCreado}, Codigo: ${codPatrimonial}`,
      "201 Created",
      `${activoValidoRes.status}`
    );

    // A-2: Alta de Elemento de Configuración (CI) en la CMDB
    const codCi = `CI-SRV-${Date.now().toString().slice(-6)}`;
    const ciPayload = {
      codigo_ci: codCi,
      nombre: "SRV-CLUSTER-APP-03",
      tipo_ci: "SERVIDOR_FISICO",
      ambiente: "PRODUCCION",
      ip_principal: "10.0.12.45",
      version_software: "Ubuntu Server 24.04 LTS / Docker Engine 26.1",
      criticidad: "ALTA",
      id_activo: idActivoCreado,
      id_departamento_soporte: 1
    };
    const ciRes = await apiRequest('POST', '/api/activos/cmdb', PERSONAS.GESTOR_ACTIVOS, ciPayload);
    const idCiCreado = ciRes.body?.ci?.id_ci || ciRes.body?.id_ci;
    recordTest(
      "Gestor de Activos registra nuevo Elemento de Configuracion (CI) vinculado en la CMDB",
      ciRes.status === 201 && !!idCiCreado,
      `CI ID: ${idCiCreado}, Codigo: ${codCi}`,
      "201 Created",
      `${ciRes.status}`
    );

    // A-3: Registro de Relación Topológica de Dependencia en la CMDB
    const ciPadreRow = await pool.query(`SELECT id_ci FROM elemento_configuracion WHERE id_ci != $1 LIMIT 1`, [idCiCreado || 0]);
    const idCiPadre = ciPadreRow.rows[0]?.id_ci || 1;
    const relacionRes = await apiRequest('POST', '/api/activos/cmdb/relaciones', PERSONAS.GESTOR_ACTIVOS, {
      id_ci_padre: idCiPadre,
      id_ci_hijo: idCiCreado,
      tipo_relacion: "ALOJA_A",
    });
    recordTest(
      "Gestor de Activos formaliza la relacion de dependencia jerarquica entre CIs en la CMDB",
      (relacionRes.status === 200 || relacionRes.status === 201) && !relacionRes.body?.error,
      `Relacion topologica registrada: CI ${idCiPadre} -> CI ${idCiCreado}`,
      "200/201 OK",
      `${relacionRes.status}`
    );

    // -------------------------------------------------------------------------
    // BLOQUE 5: BLINDAJES ADICIONALES Y CONFIDENCIALIDAD
    // -------------------------------------------------------------------------
    console.log("\n--- BLOQUE 5: BLINDAJES DE AUTORIDAD Y CONFIDENCIALIDAD ---");

    // B-1: Blindaje de Rol CAB (Técnico intentando dictaminar una RFC sin atribuciones)
    const votoIlicitoRes = await apiRequest('POST', '/api/cambios/aprobaciones', PERSONAS.TECNICO, {
      id_cambio: idRfcRechazo,
      decision: 'APROBADO',
      comentario: 'Voto no autorizado'
    });
    recordTest(
      "Blindaje de Autoridad: Perfil Tecnico no tiene atribuciones para emitir votos en el CAB",
      votoIlicitoRes.status === 403,
      `Respuesta del sistema: ${JSON.stringify(votoIlicitoRes.body)}`,
      "403 Forbidden",
      `${votoIlicitoRes.status}`
    );

    // B-2: Confidencialidad de Notas Técnicas Internas
    // Crear nota interna como técnico
    await apiRequest('POST', `/api/tickets/${idIncExc}/comentarios`, PERSONAS.TECNICO, {
      comentario: "NOTA_CONFIDENCIAL_CLAVE_MAESTRA: Puerto IPMI configurado en vlan aislada con credenciales rotativas.",
      es_interno: true
    });

    // Consultar detalle como Solicitante
    const detalleSolRes = await apiRequest('GET', `/api/tickets/${idIncExc}`, PERSONAS.SOLICITANTE);
    const comentariosVisibles = detalleSolRes.body?.comentarios || [];
    const contieneNotaConfidencial = comentariosVisibles.some(c => 
      c.comentario && c.comentario.includes("NOTA_CONFIDENCIAL_CLAVE_MAESTRA")
    );
    recordTest(
      "Confidencialidad Operativa: Notas tecnicas internas son estrictamente filtradas al Solicitante",
      detalleSolRes.status === 200 && !contieneNotaConfidencial,
      `Total comentarios expuestos al usuario: ${comentariosVisibles.length}, filtro seguro activo`,
      "Nota interna invisible para el solicitante",
      `Expuesta: ${contieneNotaConfidencial}`
    );

    // -------------------------------------------------------------------------
    // RESUMEN FINAL
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log("RESUMEN DE PRUEBAS DE EXCEPCION Y RESILIENCIA (FASE 2):");
    console.log(`Total Pruebas: ${results.testsRun}`);
    console.log(`Aprobadas:    ${results.testsPassed}`);
    console.log(`Fallidas:     ${results.testsFailed}`);
    console.log("================================================================================\n");

    if (results.testsFailed > 0) {
      process.exit(1);
    }

  } catch (err) {
    console.error("FATAL ERROR IN EXCEPTIONS SUITE EXECUTION:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runExceptionsSuite();
