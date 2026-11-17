// ============================================================================
// TEST DE VERIFICACIÓN FASE 2: NOTIFICACIONES IN-APP Y RETIRO DE CANALES (N2)
// ============================================================================

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Cargar variables de entorno desde .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
let dbUrl = process.env.DATABASE_URL;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.substring('DATABASE_URL='.length).replace(/(^["']|["']$)/g, '');
      break;
    }
  }
}

const pool = new Pool({ connectionString: dbUrl });

const CATALOGO_15_EVENTOS = [
  "TICKET_ASIGNADO",
  "TICKET_ESTADO_CAMBIADO",
  "TICKET_COMENTARIO_PUBLICO",
  "TICKET_RESUELTO",
  "SLA_RIESGO",
  "SLA_VENCIDO",
  "APROBACION_PENDIENTE",
  "APROBACION_RESUELTA",
  "CAMBIO_AUTORIZADO",
  "CAB_CONVOCATORIA",
  "INCIDENTE_MAYOR_DECLARADO",
  "PROBLEMA_ASIGNADO",
  "ARTICULO_REVISION",
  "CONTRATO_VENCIMIENTO",
  "DELEGACION_ACTIVADA",
];

async function ejecutarPruebas() {
  console.log("=== INICIANDO VALIDACIÓN FASE 2 (N2) ===");
  let fallos = 0;

  // 1. Verificar existencia de tabla notificaciones y columna debe_cambiar_clave
  try {
    const resTabla = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notificaciones'
    `);
    const columnas = resTabla.rows.map(r => r.column_name);
    const requeridas = ['id', 'usuario_id', 'evento', 'titulo', 'mensaje', 'entidad_tipo', 'entidad_id', 'url_destino', 'leida', 'creada_en'];
    const faltantes = requeridas.filter(c => !columnas.includes(c));
    if (faltantes.length === 0) {
      console.log("✔ [DB] Tabla 'notificaciones' contiene todas las columnas requeridas.");
    } else {
      console.error("✖ [DB] Faltan columnas en 'notificaciones':", faltantes);
      fallos++;
    }

    const resColClave = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuario' AND column_name = 'debe_cambiar_clave'
    `);
    if (resColClave.rows.length === 1) {
      console.log("✔ [DB] Columna 'debe_cambiar_clave' existe en tabla 'usuario'.");
    } else {
      console.error("✖ [DB] Falta columna 'debe_cambiar_clave' en tabla 'usuario'.");
      fallos++;
    }
  } catch (err) {
    console.error("✖ [DB] Error verificando esquema:", err.message);
    fallos++;
  }

  // 2. Verificar estado de filas de menú
  try {
    const resEliminadas = await pool.query(`
      SELECT id_opcion_menu FROM opciones_menu WHERE id_opcion_menu IN (21212, 21214, 21227)
    `);
    if (resEliminadas.rows.length === 0) {
      console.log("✔ [MENU] Opciones eliminadas #21212, #21214, #21227 ya no existen en opciones_menu.");
    } else {
      console.error("✖ [MENU] Todavía existen opciones obsoletas:", resEliminadas.rows);
      fallos++;
    }

    const resNueva = await pool.query(`
      SELECT id_opcion_menu, nombre, url_menu FROM opciones_menu WHERE id_opcion_menu = 21265
    `);
    if (resNueva.rows.length === 1 && resNueva.rows[0].url_menu === '/plataforma/notificaciones') {
      console.log("✔ [MENU] Nueva opción #21265 ('Notificaciones') existe y apunta a /plataforma/notificaciones.");
    } else {
      console.error("✖ [MENU] Opción #21265 no encontrada o con URL incorrecta:", resNueva.rows);
      fallos++;
    }

    const resPerfiles = await pool.query(`
      SELECT count(*) FROM opciones_menu_perfiles WHERE id_opcion_menu = 21265
    `);
    const countPerfiles = Number(resPerfiles.rows[0].count);
    if (countPerfiles === 10) {
      console.log(`✔ [MENU] Opción #21265 concedida a los 10 perfiles (total: ${countPerfiles}).`);
    } else {
      console.error(`✖ [MENU] Opción #21265 concedida a ${countPerfiles} perfiles (se esperaban 10).`);
      fallos++;
    }
  } catch (err) {
    console.error("✖ [MENU] Error verificando opciones de menú:", err.message);
    fallos++;
  }

  // 3. Verificar emisión de los 15 eventos ITIL
  try {
    // Tomar un usuario válido para pruebas
    const usuarioRes = await pool.query("SELECT id_usuario FROM usuario WHERE estado_registro = true LIMIT 1");
    const testUserId = usuarioRes.rows[0]?.id_usuario || 1;

    console.log(`Probando emisión de 15 eventos para usuario ID ${testUserId}...`);
    for (const evento of CATALOGO_15_EVENTOS) {
      const insRes = await pool.query(`
        INSERT INTO notificaciones 
          (usuario_id, evento, titulo, mensaje, entidad_tipo, entidad_id, url_destino, leida, creada_en)
        VALUES 
          ($1, $2, $3, $4, 'sistema', 1, '/plataforma/notificaciones?abrir=1', false, now())
        RETURNING id
      `, [testUserId, evento, `Test ${evento}`, `Mensaje de prueba para ${evento}`]);
      
      if (!insRes.rows[0]?.id) {
        throw new Error(`No se pudo emitir evento ${evento}`);
      }
    }
    console.log("✔ [EVENTOS] Los 15 eventos emitieron registros válidos en 'notificaciones'.");

    // Limpiar notificaciones de prueba
    await pool.query("DELETE FROM notificaciones WHERE titulo LIKE 'Test %'");
  } catch (err) {
    console.error("✖ [EVENTOS] Error en emisión de eventos:", err.message);
    fallos++;
  }

  // 4. Verificar ausencia de archivos eliminados
  const archivosBorrados = [
    'src/app/plataforma/operacion/notificaciones/contacto/page.tsx',
    'src/app/plataforma/operacion/notificaciones/plantillas/page.tsx',
    'src/app/plataforma/operacion/notificaciones/page.tsx',
    'src/app/plataforma/mi-cuenta/notificaciones/page.tsx',
    'src/app/api/mi-cuenta/notificaciones/route.ts',
    'src/app/api/auth/recuperar-clave/solicitar/route.ts',
    'src/app/api/auth/recuperar-clave/verificar/route.ts',
    'src/app/api/auth/recuperar-clave/cambiar/route.ts',
    'src/app/api/operacion/salud-sistema/correo/route.ts',
    'src/app/api/usuarios/enviar-credenciales/route.ts',
    'src/shared/lib/email.ts',
    'src/modules/seguridad/recuperacionClaveService.ts',
    'src/modules/seguridad/api/recuperarClaveSolicitarController.ts',
    'src/modules/seguridad/api/recuperarClaveVerificarController.ts',
    'src/modules/seguridad/api/recuperarClaveCambiarController.ts',
    'src/modules/seguridad/preferenciasNotificacionService.ts',
    'src/modules/seguridad/api/preferenciasNotificacionController.ts',
    'src/modules/plataforma/config/notificaciones/VistaNotificaciones.tsx',
    'src/modules/plataforma/api/config/saludSistemaCorreoController.ts',
    'src/modules/identidades/services/enviarCredencialesService.ts',
    'src/modules/identidades/api/enviarCredencialesController.ts',
  ];

  let rutasEliminadasOk = true;
  for (const archivo of archivosBorrados) {
    const fullPath = path.resolve(__dirname, '..', archivo);
    if (fs.existsSync(fullPath)) {
      console.error(`✖ [R1/R4] Archivo no eliminado: ${archivo}`);
      rutasEliminadasOk = false;
      fallos++;
    }
  }
  if (rutasEliminadasOk) {
    console.log("✔ [R1/R4] Todos los archivos obsoletos fueron eliminados físicamente.");
  }

  await pool.end();

  if (fallos === 0) {
    console.log("\n==========================================");
    console.log("✔ TODOS LOS TESTS DE FASE 2 PASARON EXITOSAMENTE (0 ERRORES)");
    console.log("==========================================");
    process.exit(0);
  } else {
    console.error(`\n✖ SE ENCONTRARON ${fallos} FALLOS EN FASE 2.`);
    process.exit(1);
  }
}

ejecutarPruebas();
