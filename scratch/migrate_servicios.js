const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrateServicios() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Creando tablas servicio_catalogo y servicio_workflow_paso...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS servicio_catalogo (
        id_servicio           SERIAL PRIMARY KEY,
        codigo_servicio       VARCHAR(30) UNIQUE NOT NULL,
        id_tipo_ticket        INT NOT NULL REFERENCES tipo_ticket(id_tipo_ticket),
        id_categoria          INT NOT NULL REFERENCES categoria_ticket(id_categoria),
        nombre                VARCHAR(100) NOT NULL,
        descripcion_comercial TEXT NOT NULL,
        entregable            TEXT NOT NULL,
        requiere_aprobacion   BOOLEAN NOT NULL DEFAULT false,
        sla_horas_resolucion  INT NOT NULL,
        sla_horas_respuesta   INT NOT NULL,
        costo_referencial     NUMERIC(10,2) DEFAULT 0.00,
        icono                 VARCHAR(50) DEFAULT 'servicio',
        estado_registro       BOOLEAN NOT NULL DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS servicio_workflow_paso (
        id_paso                SERIAL PRIMARY KEY,
        id_servicio            INT NOT NULL REFERENCES servicio_catalogo(id_servicio) ON DELETE CASCADE,
        orden                  SMALLINT NOT NULL,
        codigo_paso            VARCHAR(30) NOT NULL,
        nombre_paso            VARCHAR(60) NOT NULL,
        rol_ejecutor           VARCHAR(30) NOT NULL,
        es_compuerta_aprobacion BOOLEAN NOT NULL DEFAULT false,
        pausa_sla              BOOLEAN NOT NULL DEFAULT false,
        estado_registro        BOOLEAN NOT NULL DEFAULT true
      );
    `);

    console.log('2. Insertando los 6 servicios corporativos en servicio_catalogo...');
    const servicios = [
      {
        id_servicio: 1,
        codigo_servicio: 'SRV-ACC-01',
        id_tipo_ticket: 2, // Solicitud
        id_categoria: 4,   // Cuentas y Accesos
        nombre: 'Accesos y Privilegios en Sistemas Corporativos',
        descripcion_comercial: 'Habilitación, modificación de roles o asignación de permisos especiales en plataformas core de negocio (SAP, Oracle ERP, Salesforce o VPN corporativa).',
        entregable: 'Usuario y perfil de permisos habilitado en el sistema solicitado bajo políticas SOX y principio de menor privilegio.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 8,
        sla_horas_respuesta: 2,
        costo_referencial: 0.00,
        icono: 'llave'
      },
      {
        id_servicio: 2,
        codigo_servicio: 'SRV-HW-02',
        id_tipo_ticket: 2, // Solicitud
        id_categoria: 5,   // Equipamiento Nuevo
        nombre: 'Asignación de Equipamiento de Cómputo',
        descripcion_comercial: 'Entrega de laptop corporativa, estación de trabajo, monitor adicional o accesorios de escritorio para puestos nuevos o renovación tecnológica.',
        entregable: 'Equipo de cómputo configurado con imagen corporativa, antivirus, cifrado BitLocker y acta formal de entrega patrimonial (CMDB).',
        requiere_aprobacion: true,
        sla_horas_resolucion: 48,
        sla_horas_respuesta: 4,
        costo_referencial: 1200.00,
        icono: 'laptop'
      },
      {
        id_servicio: 3,
        codigo_servicio: 'SRV-SEC-03',
        id_tipo_ticket: 2, // Solicitud
        id_categoria: 4,   // Cuentas y Accesos
        nombre: 'Restablecimiento de Credenciales y Doble Factor',
        descripcion_comercial: 'Desbloqueo de cuentas de dominio corporativo bloqueadas por intentos fallidos o reseteo de token de autenticación multifactor (MFA).',
        entregable: 'Cuenta corporativa reactivada y contraseña temporal segura forzando cambio al siguiente inicio de sesión.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 1,
        sla_horas_respuesta: 1,
        costo_referencial: 0.00,
        icono: 'seguridad'
      },
      {
        id_servicio: 4,
        codigo_servicio: 'SRV-RED-04',
        id_tipo_ticket: 1, // Incidente
        id_categoria: 2,   // Redes y Conectividad
        nombre: 'Soporte de Conectividad de Red y Telefonía IP',
        descripcion_comercial: 'Diagnóstico y resolución ante cortes de internet en sedes, lentitud de Wi-Fi corporativa o fallas de extensiones telefónicas IP.',
        entregable: 'Conectividad de red restablecida a velocidades nominales, puerto de switch reparado o teléfono IP funcional.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 4,
        sla_horas_respuesta: 1,
        costo_referencial: 0.00,
        icono: 'red'
      },
      {
        id_servicio: 5,
        codigo_servicio: 'SRV-SW-05',
        id_tipo_ticket: 2, // Solicitud
        id_categoria: 6,   // Instalación de Software
        nombre: 'Instalación y Licenciamiento de Software de Puesto',
        descripcion_comercial: 'Aprovisionamiento de herramientas especializadas que requieren pago de licencia individual o suscripción (Power BI Pro, AutoCAD, Adobe CC).',
        entregable: 'Software instalado y activado con licencia oficial de la empresa, registrado en el inventario de software corporativo.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 24,
        sla_horas_respuesta: 2,
        costo_referencial: 350.00,
        icono: 'software'
      },
      {
        id_servicio: 6,
        codigo_servicio: 'SRV-ONB-06',
        id_tipo_ticket: 2, // Solicitud
        id_categoria: 5,   // Equipamiento Nuevo
        nombre: 'Habilitación de Puesto Digital para Nuevos Ingresos',
        descripcion_comercial: 'Preparación integral de todo el entorno tecnológico necesario para que un nuevo colaborador pueda trabajar desde su primer día laboral.',
        entregable: 'Kit tecnológico de bienvenida completo: cuenta de dominio, correo corporativo, laptop configurada y accesos básicos.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 48,
        sla_horas_respuesta: 2,
        costo_referencial: 0.00,
        icono: 'onboarding'
      }
    ];

    for (const s of servicios) {
      await client.query(`
        INSERT INTO servicio_catalogo (
          id_servicio, codigo_servicio, id_tipo_ticket, id_categoria, nombre,
          descripcion_comercial, entregable, requiere_aprobacion, sla_horas_resolucion,
          sla_horas_respuesta, costo_referencial, icono, estado_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
        ON CONFLICT (id_servicio) DO UPDATE SET
          codigo_servicio = EXCLUDED.codigo_servicio,
          id_tipo_ticket = EXCLUDED.id_tipo_ticket,
          id_categoria = EXCLUDED.id_categoria,
          nombre = EXCLUDED.nombre,
          descripcion_comercial = EXCLUDED.descripcion_comercial,
          entregable = EXCLUDED.entregable,
          requiere_aprobacion = EXCLUDED.requiere_aprobacion,
          sla_horas_resolucion = EXCLUDED.sla_horas_resolucion,
          sla_horas_respuesta = EXCLUDED.sla_horas_respuesta,
          costo_referencial = EXCLUDED.costo_referencial,
          icono = EXCLUDED.icono,
          estado_registro = true;
      `, [
        s.id_servicio, s.codigo_servicio, s.id_tipo_ticket, s.id_categoria, s.nombre,
        s.descripcion_comercial, s.entregable, s.requiere_aprobacion, s.sla_horas_resolucion,
        s.sla_horas_respuesta, s.costo_referencial, s.icono
      ]);
    }
    await client.query(`SELECT setval('servicio_catalogo_id_servicio_seq', (SELECT MAX(id_servicio) FROM servicio_catalogo));`);

    console.log('3. Insertando pasos de workflow para cada servicio...');
    // Limpiar pasos anteriores para reinsertar ordenadamente
    await client.query('DELETE FROM servicio_workflow_paso');

    const workflows = [
      // Servicio 1: Accesos ERP
      { id_servicio: 1, orden: 1, codigo_paso: 'SOLICITADO', nombre_paso: 'Solicitud con justificación de negocio', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },
      { id_servicio: 1, orden: 2, codigo_paso: 'PENDIENTE_APROBACION', nombre_paso: 'Visto bueno de Jefatura de Área', rol_ejecutor: 'JEFE_APROBADOR', es_compuerta: true, pausa_sla: true },
      { id_servicio: 1, orden: 3, codigo_paso: 'VALIDACION_SEGURIDAD', nombre_paso: 'Verificación de no conflicto SoD', rol_ejecutor: 'SEGURIDAD_TI', es_compuerta: false, pausa_sla: false },
      { id_servicio: 1, orden: 4, codigo_paso: 'APROVISIONAMIENTO', nombre_paso: 'Creación y asignación de rol en el sistema', rol_ejecutor: 'SISTEMAS_N3', es_compuerta: false, pausa_sla: false },
      { id_servicio: 1, orden: 5, codigo_paso: 'VERIFICACION_ENTREGA', nombre_paso: 'Confirmación de acceso conforme por usuario', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },

      // Servicio 2: Equipamiento Cómputo
      { id_servicio: 2, orden: 1, codigo_paso: 'SOLICITADO', nombre_paso: 'Solicitud de hardware e imputación contable', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },
      { id_servicio: 2, orden: 2, codigo_paso: 'PENDIENTE_APROBACION', nombre_paso: 'Aprobación presupuestal de Jefatura', rol_ejecutor: 'JEFE_APROBADOR', es_compuerta: true, pausa_sla: true },
      { id_servicio: 2, orden: 3, codigo_paso: 'PREPARACION_STAGING', nombre_paso: 'Clonación de imagen corporativa y BitLocker', rol_ejecutor: 'SOPORTE_N2', es_compuerta: false, pausa_sla: false },
      { id_servicio: 2, orden: 4, codigo_paso: 'REGISTRO_PATRIMONIAL', nombre_paso: 'Asociación de serie en inventario CMDB', rol_ejecutor: 'SOPORTE_N2', es_compuerta: false, pausa_sla: false },
      { id_servicio: 2, orden: 5, codigo_paso: 'ENTREGA_CONFORMIDAD', nombre_paso: 'Firma de acta y recepción física', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },

      // Servicio 3: Restablecimiento MFA
      { id_servicio: 3, orden: 1, codigo_paso: 'SOLICITADO', nombre_paso: 'Solicitud con validación de identidad', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },
      { id_servicio: 3, orden: 2, codigo_paso: 'DESAFIO_IDENTIDAD', nombre_paso: 'Validación de código OTP alternativo', rol_ejecutor: 'SISTEMA_MFA', es_compuerta: false, pausa_sla: false },
      { id_servicio: 3, orden: 3, codigo_paso: 'EJECUCION_RESET', nombre_paso: 'Desbloqueo y cambio forzado de clave', rol_ejecutor: 'MESA_N1', es_compuerta: false, pausa_sla: false },
      { id_servicio: 3, orden: 4, codigo_paso: 'CONFIRMACION_CIERRE', nombre_paso: 'Inicio de sesión exitoso por el usuario', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },

      // Servicio 4: Conectividad Red
      { id_servicio: 4, orden: 1, codigo_paso: 'REPORTADO', nombre_paso: 'Reporte de falla indicando sede y puesto', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },
      { id_servicio: 4, orden: 2, codigo_paso: 'TRIAJE_N1', nombre_paso: 'Diagnóstico remoto y prueba de enlace/VLAN', rol_ejecutor: 'MESA_N1', es_compuerta: false, pausa_sla: false },
      { id_servicio: 4, orden: 3, codigo_paso: 'INTERVENCION_SEDE', nombre_paso: 'Reemplazo de cableado o configuración de switch', rol_ejecutor: 'SOPORTE_N2', es_compuerta: false, pausa_sla: false },
      { id_servicio: 4, orden: 4, codigo_paso: 'PRUEBA_RENDIMIENTO', nombre_paso: 'Verificación de velocidad y latencia nominal', rol_ejecutor: 'SOPORTE_N2', es_compuerta: false, pausa_sla: false },
      { id_servicio: 4, orden: 5, codigo_paso: 'RESOLUCION_CIERRE', nombre_paso: 'Confirmación de navegación operativa', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },

      // Servicio 5: Software de Puesto
      { id_servicio: 5, orden: 1, codigo_paso: 'SOLICITADO', nombre_paso: 'Petición de software con justificación', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },
      { id_servicio: 5, orden: 2, codigo_paso: 'PENDIENTE_APROBACION', nombre_paso: 'Aprobación de costo por Gerencia de Área', rol_ejecutor: 'JEFE_APROBADOR', es_compuerta: true, pausa_sla: true },
      { id_servicio: 5, orden: 3, codigo_paso: 'ASIGNACION_LICENCIA', nombre_paso: 'Reserva de licencia en pool corporativo', rol_ejecutor: 'GESTOR_ACTIVOS_TI', es_compuerta: false, pausa_sla: false },
      { id_servicio: 5, orden: 4, codigo_paso: 'DESPLIEGUE_REMOTO', nombre_paso: 'Instalación desatendida vía Endpoint Manager', rol_ejecutor: 'SISTEMAS_N3', es_compuerta: false, pausa_sla: false },
      { id_servicio: 5, orden: 5, codigo_paso: 'VERIFICACION', nombre_paso: 'Comprobación de ejecución por el usuario', rol_ejecutor: 'SOLICITANTE', es_compuerta: false, pausa_sla: false },

      // Servicio 6: Onboarding TI
      { id_servicio: 6, orden: 1, codigo_paso: 'SOLICITUD_RRHH', nombre_paso: 'Ficha de alta con fecha de ingreso', rol_ejecutor: 'RECURSOS_HUMANOS', es_compuerta: false, pausa_sla: false },
      { id_servicio: 6, orden: 2, codigo_paso: 'TAREA_IDENTIDAD', nombre_paso: 'Creación de cuenta de dominio y correo', rol_ejecutor: 'SISTEMAS_N3', es_compuerta: false, pausa_sla: false },
      { id_servicio: 6, orden: 3, codigo_paso: 'TAREA_HARDWARE', nombre_paso: 'Configuración física de laptop y accesorios', rol_ejecutor: 'SOPORTE_N2', es_compuerta: false, pausa_sla: false },
      { id_servicio: 6, orden: 4, codigo_paso: 'TAREA_COMUNICACIONES', nombre_paso: 'Habilitación de anexo IP y acceso a VPN', rol_ejecutor: 'SOPORTE_N2', es_compuerta: false, pausa_sla: false },
      { id_servicio: 6, orden: 5, codigo_paso: 'CONTROL_CALIDAD', nombre_paso: 'Consolidación por Supervisor de Service Desk', rol_ejecutor: 'SUPERVISOR_TI', es_compuerta: false, pausa_sla: false },
      { id_servicio: 6, orden: 6, codigo_paso: 'ENTREGA_DIA1', nombre_paso: 'Entrega física de equipo e inducción', rol_ejecutor: 'SOPORTE_N2', es_compuerta: false, pausa_sla: false },
    ];

    for (const w of workflows) {
      await client.query(`
        INSERT INTO servicio_workflow_paso (
          id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      `, [w.id_servicio, w.orden, w.codigo_paso, w.nombre_paso, w.rol_ejecutor, w.es_compuerta, w.pausa_sla]);
    }

    console.log('4. Configurando opciones de menú para el Catálogo...');
    const parentGestion = (await client.query(`SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/tickets/gestion'`)).rows[0]?.id_opcion_menu;
    const parentAdmin = (await client.query(`SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/admin'`)).rows[0]?.id_opcion_menu;

    // Catálogo de servicios para usuarios
    let opcCatalogo = (await client.query(`SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/tickets/catalogo'`)).rows[0];
    if (!opcCatalogo) {
      const ins = await client.query(`
        INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
        VALUES ('Catálogo de servicios', '/tickets/catalogo', 'Portal corporativo para solicitar servicios de TI', $1, 3, 1, true)
        RETURNING id_opcion_menu;
      `, [parentGestion]);
      opcCatalogo = ins.rows[0];
    }

    // Catálogo de servicios para Administrador
    let opcAdminServicios = (await client.query(`SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/admin/servicios'`)).rows[0];
    if (!opcAdminServicios) {
      const ins = await client.query(`
        INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
        VALUES ('Catálogo de servicios', '/admin/servicios', 'Configuración de servicios corporativos y SLAs', $1, 2, 5, true)
        RETURNING id_opcion_menu;
      `, [parentAdmin]);
      opcAdminServicios = ins.rows[0];
    }

    // Asignar permisos en opciones_menu_perfiles
    // Solicitante (3) y Gestor de Área (5) pueden ver /tickets/catalogo
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      VALUES ($1, 3, 1, true), ($1, 5, 1, true)
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
    `, [opcCatalogo.id_opcion_menu]);

    // Administrador (1) y Auditor (6) pueden ver /admin/servicios
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      VALUES ($1, 1, 5, true), ($1, 6, 5, true)
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
    `, [opcAdminServicios.id_opcion_menu]);

    await client.query('COMMIT');
    console.log('MIGRACION DE CATALOGO EXITOSA.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR EN MIGRACION DE CATALOGO:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateServicios();
