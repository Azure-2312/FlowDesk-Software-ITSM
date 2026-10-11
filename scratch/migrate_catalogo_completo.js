const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrateCatalogoCompleto() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Preparando insercion de los 23 servicios corporativos...');

    const servicios = [
      // Familia 1: Identidad, Accesos y Cuentas (Gobernanza SOX / ISO 27001)
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
        codigo_servicio: 'SRV-ACC-02',
        id_tipo_ticket: 2,
        id_categoria: 4,
        nombre: 'Desactivación Inmediata de Accesos por Cese Laboral (Offboarding TI)',
        descripcion_comercial: 'Bloqueo urgente e integral de cuentas en Directorio Activo, correo y accesos corporativos ante la desvinculación formal de un colaborador.',
        entregable: 'Cuentas bloqueadas, tokens OAuth revocados, buzón reasignado y certificado formal de revocación emitido para auditoría SOX/ISO 27001.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 2,
        sla_horas_respuesta: 1,
        costo_referencial: 0.00,
        icono: 'seguridad'
      },
      {
        id_servicio: 3,
        codigo_servicio: 'SRV-ACC-03',
        id_tipo_ticket: 2,
        id_categoria: 4,
        nombre: 'Accesos Temporales para Terceros, Contratistas o Consultores',
        descripcion_comercial: 'Creación de credenciales con caducidad automática y acceso VPN restringido para proveedores de servicios o consultores externos.',
        entregable: 'Credencial temporal con fecha de expiración fijada en Active Directory y regla de firewall hacia el servidor autorizado.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 4,
        sla_horas_respuesta: 2,
        costo_referencial: 0.00,
        icono: 'llave'
      },
      {
        id_servicio: 4,
        codigo_servicio: 'SRV-ACC-04',
        id_tipo_ticket: 2,
        id_categoria: 4,
        nombre: 'Creación de Buzones Compartidos y Listas de Distribución',
        descripcion_comercial: 'Aprovisionamiento de buzones departamentales (ej. facturacion@empresa.com) y grupos de correo con permisos delegados.',
        entregable: 'Buzón compartido activo en Exchange Online con delegación Send-As y sincronización en clientes Outlook.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 12,
        sla_horas_respuesta: 4,
        costo_referencial: 0.00,
        icono: 'correo'
      },

      // Familia 2: Equipamiento de Cómputo y Hardware (ITAM / CMDB)
      {
        id_servicio: 5,
        codigo_servicio: 'SRV-HW-01',
        id_tipo_ticket: 2,
        id_categoria: 5, // Equipamiento Nuevo
        nombre: 'Asignación de Laptop o Estación de Trabajo Nueva',
        descripcion_comercial: 'Entrega de laptop corporativa o estación de trabajo para puestos nuevos o requerimientos operativos con cargo a centro de costos.',
        entregable: 'Equipo configurado con imagen corporativa (SOE), antivirus, cifrado BitLocker y acta formal de entrega patrimonial en CMDB.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 48,
        sla_horas_respuesta: 4,
        costo_referencial: 1200.00,
        icono: 'laptop'
      },
      {
        id_servicio: 6,
        codigo_servicio: 'SRV-HW-02',
        id_tipo_ticket: 2,
        id_categoria: 5,
        nombre: 'Renovación Tecnológica por Obsolescencia de Equipo (3-4 años)',
        descripcion_comercial: 'Sustitución planificada de computadora portátil o de escritorio que ha alcanzado el límite de su ciclo de vida útil.',
        entregable: 'Laptop moderna de línea corporativa con perfil de usuario migrado íntegramente y equipo antiguo retirado en CMDB.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 72,
        sla_horas_respuesta: 8,
        costo_referencial: 1200.00,
        icono: 'laptop'
      },
      {
        id_servicio: 7,
        codigo_servicio: 'SRV-HW-03',
        id_tipo_ticket: 2,
        id_categoria: 5,
        nombre: 'Préstamo de Equipo de Cómputo de Contingencia (Pool de Resguardo)',
        descripcion_comercial: 'Asignación temporal y urgente de laptop del pool de contingencia mientras el equipo titular se encuentra en garantía o reparación.',
        entregable: 'Laptop operativa entregada en menos de 4 horas hábiles bajo acta de préstamo temporal con fecha pactada de retorno.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 4,
        sla_horas_respuesta: 1,
        costo_referencial: 0.00,
        icono: 'laptop'
      },
      {
        id_servicio: 8,
        codigo_servicio: 'SRV-HW-04',
        id_tipo_ticket: 2,
        id_categoria: 5,
        nombre: 'Asignación de Accesorios Periféricos y Ergonomía',
        descripcion_comercial: 'Dotación de monitores secundarios de 24 pulgadas, docking stations, teclados, mouse o diademas telefónicas para teletrabajo.',
        entregable: 'Periférico instalado y probado en el puesto de trabajo del colaborador registrado en el inventario menor de TI.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 24,
        sla_horas_respuesta: 4,
        costo_referencial: 150.00,
        icono: 'monitor'
      },

      // Familia 3: Software, Productividad y Licencias (SAM)
      {
        id_servicio: 9,
        codigo_servicio: 'SRV-SW-01',
        id_tipo_ticket: 2,
        id_categoria: 6, // Instalación de Software
        nombre: 'Instalación y Licenciamiento de Software Especializado',
        descripcion_comercial: 'Aprovisionamiento de licencias nominales de herramientas profesionales de pago (Power BI Pro, AutoCAD, Adobe Creative Cloud).',
        entregable: 'Software instalado desatendidamente y activado con licencia oficial de la empresa registrada en el portal del fabricante.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 24,
        sla_horas_respuesta: 2,
        costo_referencial: 350.00,
        icono: 'software'
      },
      {
        id_servicio: 10,
        codigo_servicio: 'SRV-SW-02',
        id_tipo_ticket: 2,
        id_categoria: 6,
        nombre: 'Aprovisionamiento de Licencias de Colaboración Cloud (M365 / Zoom)',
        descripcion_comercial: 'Asignación de planes corporativos cloud para reuniones masivas, telefonía IP integrada o buzones de alta capacidad.',
        entregable: 'Suscripción asignada en Azure AD / Tenant empresarial con manual de uso para el usuario.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 12,
        sla_horas_respuesta: 2,
        costo_referencial: 0.00,
        icono: 'nube'
      },
      {
        id_servicio: 11,
        codigo_servicio: 'SRV-SW-03',
        id_tipo_ticket: 2,
        id_categoria: 3, // Software y Aplicaciones
        nombre: 'Restauración de Archivos y Copias de Seguridad (Restore Backup)',
        descripcion_comercial: 'Recuperación de documentos, carpetas compartidas o bases de datos dañadas desde el sistema corporativo de copias de respaldo.',
        entregable: 'Archivos recuperados íntegramente desde la fecha requerida y validados en el repositorio seguro.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 8,
        sla_horas_respuesta: 2,
        costo_referencial: 0.00,
        icono: 'backup'
      },

      // Familia 4: Conectividad, Redes y Comunicaciones
      {
        id_servicio: 12,
        codigo_servicio: 'SRV-RED-01',
        id_tipo_ticket: 1, // Incidente
        id_categoria: 2,   // Redes y Conectividad
        nombre: 'Incidente de Conectividad de Red y Telefonía IP en Sede',
        descripcion_comercial: 'Diagnóstico y resolución ante cortes de internet en sedes, lentitud de enlace o fallas de extensiones telefónicas IP.',
        entregable: 'Conectividad de red restablecida a velocidades nominales, puerto de switch reparado o teléfono IP funcional.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 4,
        sla_horas_respuesta: 1,
        costo_referencial: 0.00,
        icono: 'red'
      },
      {
        id_servicio: 13,
        codigo_servicio: 'SRV-RED-02',
        id_tipo_ticket: 2,
        id_categoria: 2,
        nombre: 'Habilitación de Punto de Red Físico o Ampliación Wi-Fi',
        descripcion_comercial: 'Tendido de cableado estructurado Cat 6A certificado o instalación de Access Point para cobertura inalámbrica corporativa.',
        entregable: 'Toma de red ponchada y certificada conectada al switch de borde con asignación de VLAN corporativa.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 24,
        sla_horas_respuesta: 4,
        costo_referencial: 200.00,
        icono: 'cable'
      },
      {
        id_servicio: 14,
        codigo_servicio: 'SRV-RED-03',
        id_tipo_ticket: 2,
        id_categoria: 2,
        nombre: 'Asignación y Configuración de Telefonía Móvil Corporativa',
        descripcion_comercial: 'Entrega de smartphone corporativo con enrolamiento en plataforma MDM para cargos con constante movilidad de negocio.',
        entregable: 'Teléfono móvil configurado con directivas de seguridad corporativa, chip de datos y firma de custodia.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 48,
        sla_horas_respuesta: 4,
        costo_referencial: 800.00,
        icono: 'telefono'
      },

      // Familia 5: Ciberseguridad y Gestión de Riesgos (ISO 27001)
      {
        id_servicio: 15,
        codigo_servicio: 'SRV-SEC-01',
        id_tipo_ticket: 2,
        id_categoria: 4,
        nombre: 'Restablecimiento de Credenciales y Doble Factor (MFA)',
        descripcion_comercial: 'Desbloqueo de cuentas bloqueadas por intentos fallidos o reinicialización de token de autenticación multifactor.',
        entregable: 'Cuenta reactivada y contraseña temporal segura forzando cambio obligatorio en el siguiente inicio de sesión.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 1,
        sla_horas_respuesta: 1,
        costo_referencial: 0.00,
        icono: 'seguridad'
      },
      {
        id_servicio: 16,
        codigo_servicio: 'SRV-SEC-02',
        id_tipo_ticket: 1, // Incidente
        id_categoria: 4,
        nombre: 'Reporte de Incidente de Seguridad / Correo Malicioso (Phishing)',
        descripcion_comercial: 'Notificación urgente ante recepción de correos con enlaces maliciosos, suplantación de identidad o sospecha de ransomware.',
        entregable: 'Remoción del correo de todos los buzones, bloqueo de IP/dominio atacante en firewall y análisis forense del equipo.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 1,
        sla_horas_respuesta: 1,
        costo_referencial: 0.00,
        icono: 'escudo'
      },
      {
        id_servicio: 17,
        codigo_servicio: 'SRV-SEC-03',
        id_tipo_ticket: 2,
        id_categoria: 2,
        nombre: 'Solicitud de Excepción de Navegación o Desbloqueo en Firewall Web',
        descripcion_comercial: 'Petición formal para habilitar el acceso a un dominio web específico retenido por las políticas del proxy perimetral.',
        entregable: 'Excepción configurada en el firewall con análisis previo de reputación y autorización del Oficial de Seguridad.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 8,
        sla_horas_respuesta: 2,
        costo_referencial: 0.00,
        icono: 'candado'
      },

      // Familia 6: Procesos Integrados de Personas
      {
        id_servicio: 18,
        codigo_servicio: 'SRV-ONB-01',
        id_tipo_ticket: 2,
        id_categoria: 5,
        nombre: 'Habilitación Integral de Puesto Digital para Nuevos Ingresos (Onboarding)',
        descripcion_comercial: 'Preparación integral de todo el entorno tecnológico necesario para que un nuevo colaborador trabaje desde su primer día.',
        entregable: 'Kit tecnológico de bienvenida completo: cuenta de dominio, correo, laptop configurada, anexo e inducción.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 48,
        sla_horas_respuesta: 2,
        costo_referencial: 0.00,
        icono: 'onboarding'
      },

      // Familia 7: Gestión Estratégica Service Desk (ITIL v4: Cambios, Problemas, Activos y Proveedores)
      {
        id_servicio: 19,
        codigo_servicio: 'SRV-CHG-01',
        id_tipo_ticket: 2,
        id_categoria: 3,
        nombre: 'Solicitud de Cambio Estándar de Infraestructura (Change Enablement)',
        descripcion_comercial: 'Programación de ventana de mantenimiento para tareas pre-aprobadas y de bajo riesgo en servidores y plataformas de TI.',
        entregable: 'Cambio ejecutado en horario no hábil con plan de rollback disponible y validación de salud de los servicios de negocio.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 24,
        sla_horas_respuesta: 4,
        costo_referencial: 0.00,
        icono: 'cambio'
      },
      {
        id_servicio: 20,
        codigo_servicio: 'SRV-CHG-02',
        id_tipo_ticket: 2,
        id_categoria: 3,
        nombre: 'Solicitud de Cambio Normal Mayor con Aprobación del Comité CAB',
        descripcion_comercial: 'Petición de modificación significativa en sistemas productivos que requiere análisis colegiado de riesgos y autorización del CAB.',
        entregable: 'Pase a producción evaluado y autorizado formalmente por el Change Advisory Board (CAB) con monitoreo post-implementación.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 72,
        sla_horas_respuesta: 8,
        costo_referencial: 0.00,
        icono: 'cab'
      },
      {
        id_servicio: 21,
        codigo_servicio: 'SRV-PRB-01',
        id_tipo_ticket: 1,
        id_categoria: 3,
        nombre: 'Apertura de Investigación de Problema de Causa Raíz (Problem Management)',
        descripcion_comercial: 'Diagnóstico técnico profundo ante fallas o caídas recurrentes para erradicar la causa raíz y publicar soluciones temporales.',
        entregable: 'Causa raíz identificada, solución temporal registrada en la base de errores conocidos (KEDB) y tickets hijos resueltos.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 96,
        sla_horas_respuesta: 8,
        costo_referencial: 0.00,
        icono: 'problema'
      },
      {
        id_servicio: 22,
        codigo_servicio: 'SRV-CNT-01',
        id_tipo_ticket: 2,
        id_categoria: 1, // Hardware y Equipos
        nombre: 'Gestión de Garantía de Hardware y Reemplazo con Fabricante',
        descripcion_comercial: 'Escalamiento de falla física hacia el fabricante oficial (Lenovo, Dell, Cisco) bajo contrato de soporte y garantía vigente.',
        entregable: 'Componente dañado reemplazado en sede por el técnico certificado del fabricante y serie actualizada en CMDB.',
        requiere_aprobacion: false,
        sla_horas_resolucion: 72,
        sla_horas_respuesta: 4,
        costo_referencial: 0.00,
        icono: 'contrato'
      },
      {
        id_servicio: 23,
        codigo_servicio: 'SRV-AST-01',
        id_tipo_ticket: 2,
        id_categoria: 5,
        nombre: 'Baja Patrimonial y Disposición Segura de Activos de TI (Disposal NIST)',
        descripcion_comercial: 'Desincorporación contable de computadoras o servidores obsoletos y destrucción criptográfica segura de datos confidenciales.',
        entregable: 'Certificado de borrado seguro de datos bajo estándar NIST 800-88, baja en CMDB y entrega a operador RAEE certificado.',
        requiere_aprobacion: true,
        sla_horas_resolucion: 48,
        sla_horas_respuesta: 8,
        costo_referencial: 0.00,
        icono: 'reciclaje'
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

    console.log('2. Limpiando y reinsertando pasos de workflow para los 23 servicios...');
    await client.query('DELETE FROM servicio_workflow_paso');

    const workflows = [
      // 1: SRV-ACC-01
      { id: 1, o: 1, c: 'SOLICITADO', n: 'Solicitud con justificación de negocio', r: 'SOLICITANTE', comp: false, p: false },
      { id: 1, o: 2, c: 'PENDIENTE_APROBACION', n: 'Visto bueno de Jefatura de Área', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 1, o: 3, c: 'VALIDACION_SEGURIDAD', n: 'Verificación de no conflicto SoD', r: 'SEGURIDAD_TI', comp: false, p: false },
      { id: 1, o: 4, c: 'APROVISIONAMIENTO', n: 'Creación y asignación de rol en el sistema', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 1, o: 5, c: 'VERIFICACION_ENTREGA', n: 'Confirmación de acceso conforme por usuario', r: 'SOLICITANTE', comp: false, p: false },

      // 2: SRV-ACC-02
      { id: 2, o: 1, c: 'NOTIFICACION_RRHH', n: 'Recepción de expediente formal de cese', r: 'RECURSOS_HUMANOS', comp: false, p: false },
      { id: 2, o: 2, c: 'BLOQUEO_INMEDIATO', n: 'Desactivación de AD y revocación de tokens', r: 'MESA_N1', comp: false, p: false },
      { id: 2, o: 3, c: 'CONVERSION_BUZON', n: 'Conversión de correo y delegación a jefatura', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 2, o: 4, c: 'AUDITORIA_REVOCACION', n: 'Certificación de revocación en ERP y VPN', r: 'SEGURIDAD_TI', comp: false, p: false },

      // 3: SRV-ACC-03
      { id: 3, o: 1, c: 'SOLICITADO', n: 'Ficha de consultor con fecha de fin de servicio', r: 'SOLICITANTE', comp: false, p: false },
      { id: 3, o: 2, c: 'APROBACION_SPONSOR', n: 'Autorización de Gerencia responsable', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 3, o: 3, c: 'POLITICA_CADUCIDAD', n: 'Configuración de fecha de expiración en AD', r: 'SEGURIDAD_TI', comp: false, p: false },
      { id: 3, o: 4, c: 'ENTREGA_CREDENCIAL', n: 'Envío seguro de credencial temporal cifrada', r: 'MESA_N1', comp: false, p: false },

      // 4: SRV-ACC-04
      { id: 4, o: 1, c: 'SOLICITADO', n: 'Petición de buzón y miembros con acceso', r: 'SOLICITANTE', comp: false, p: false },
      { id: 4, o: 2, c: 'APROBACION_JEFATURA', n: 'Visto bueno de jefatura de área', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 4, o: 3, c: 'CREACION_EXCHANGE', n: 'Creación de buzón compartido en Exchange', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 4, o: 4, c: 'VERIFICACION', n: 'Validación de sincronización en Outlook', r: 'SOLICITANTE', comp: false, p: false },

      // 5: SRV-HW-01
      { id: 5, o: 1, c: 'SOLICITADO', n: 'Solicitud de hardware con centro de costos', r: 'SOLICITANTE', comp: false, p: false },
      { id: 5, o: 2, c: 'APROBACION_PRESUPUESTO', n: 'Aprobación presupuestal de Jefatura', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 5, o: 3, c: 'PREPARACION_STAGING', n: 'Clonación de SOE, antivirus y BitLocker', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 5, o: 4, c: 'REGISTRO_CMDB', n: 'Asociación de serie y placa patrimonial en CMDB', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 5, o: 5, c: 'ENTREGA_CONFORMIDAD', n: 'Firma de acta y entrega física del equipo', r: 'SOLICITANTE', comp: false, p: false },

      // 6: SRV-HW-02
      { id: 6, o: 1, c: 'SOLICITUD_RENOVACION', n: 'Petición indicando placa de equipo actual', r: 'SOLICITANTE', comp: false, p: false },
      { id: 6, o: 2, c: 'VALIDACION_OBSOLESCENCIA', n: 'Verificación en CMDB de antigüedad > 36 meses', r: 'GESTOR_ACTIVOS_TI', comp: false, p: false },
      { id: 6, o: 3, c: 'APROBACION_GERENCIA', n: 'Aprobación de renovación en presupuesto', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 6, o: 4, c: 'BACKUP_Y_MIGRACION', n: 'Migración transparente de perfil y datos', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 6, o: 5, c: 'CANJE_Y_ACTA', n: 'Entrega de nuevo portátil y retiro de antiguo', r: 'SOLICITANTE', comp: false, p: false },

      // 7: SRV-HW-03
      { id: 7, o: 1, c: 'SOLICITUD_CONTINGENCIA', n: 'Reporte de equipo titular averiado', r: 'SOLICITANTE', comp: false, p: false },
      { id: 7, o: 2, c: 'ASIGNACION_POOL', n: 'Reserva de portátil en stock de contingencia', r: 'MESA_N1', comp: false, p: false },
      { id: 7, o: 3, c: 'CONFIGURACION_EXPRESS', n: 'Carga de perfil básico y VPN', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 7, o: 4, c: 'FIRMA_PRESTAMO', n: 'Firma de cargo de préstamo temporal', r: 'SOLICITANTE', comp: false, p: false },

      // 8: SRV-HW-04
      { id: 8, o: 1, c: 'SOLICITUD_PERIFERICO', n: 'Petición de accesorio estándar de catálogo', r: 'SOLICITANTE', comp: false, p: false },
      { id: 8, o: 2, c: 'DESPACHO_ALMACEN', n: 'Extracción de almacén y registro de salida', r: 'GESTOR_ACTIVOS_TI', comp: false, p: false },
      { id: 8, o: 3, c: 'INSTALACION_SEDE', n: 'Conexión y prueba en escritorio del usuario', r: 'SOPORTE_N2', comp: false, p: false },

      // 9: SRV-SW-01
      { id: 9, o: 1, c: 'SOLICITADO', n: 'Petición de software con justificación', r: 'SOLICITANTE', comp: false, p: false },
      { id: 9, o: 2, c: 'APROBACION_COSTO', n: 'Aprobación de costo por Gerencia de Área', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 9, o: 3, c: 'ASIGNACION_TENANT', n: 'Reserva de licencia en portal de fabricante', r: 'GESTOR_ACTIVOS_TI', comp: false, p: false },
      { id: 9, o: 4, c: 'DESPLIEGUE_REMOTO', n: 'Instalación desatendida vía Endpoint Manager', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 9, o: 5, c: 'VERIFICACION', n: 'Comprobación de ejecución por el usuario', r: 'SOLICITANTE', comp: false, p: false },

      // 10: SRV-SW-02
      { id: 10, o: 1, c: 'SOLICITUD_PLAN', n: 'Petición de licencia cloud corporativa', r: 'SOLICITANTE', comp: false, p: false },
      { id: 10, o: 2, c: 'APROVISIONAMIENTO_CLOUD', n: 'Asignación de SKU en consola de administración', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 10, o: 3, c: 'NOTIFICACION_INSTRUCCION', n: 'Envío de credenciales y guía rápida de uso', r: 'MESA_N1', comp: false, p: false },

      // 11: SRV-SW-03
      { id: 11, o: 1, c: 'SOLICITUD_RESTORE', n: 'Petición de restauración con ruta y fecha', r: 'SOLICITANTE', comp: false, p: false },
      { id: 11, o: 2, c: 'APROBACION_SEGURIDAD', n: 'Autorización del custodio o dueño de datos', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 11, o: 3, c: 'EJECUCION_JOB_BACKUP', n: 'Extracción desde el software de backup', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 11, o: 4, c: 'VALIDACION_INTEGRIDAD', n: 'Comprobación de lectura conforme del archivo', r: 'SOLICITANTE', comp: false, p: false },

      // 12: SRV-RED-01
      { id: 12, o: 1, c: 'REPORTADO', n: 'Reporte de falla indicando sede y puesto', r: 'SOLICITANTE', comp: false, p: false },
      { id: 12, o: 2, c: 'TRIAJE_N1', n: 'Diagnóstico remoto de enlace y switch de acceso', r: 'MESA_N1', comp: false, p: false },
      { id: 12, o: 3, c: 'INTERVENCION_SEDE', n: 'Reemplazo de patch cord o reconfiguración de puerto', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 12, o: 4, c: 'CERTIFICACION_ENLACE', n: 'Prueba de ping y latencia nominal', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 12, o: 5, c: 'RESOLUCION_CIERRE', n: 'Confirmación de navegación normal por usuario', r: 'SOLICITANTE', comp: false, p: false },

      // 13: SRV-RED-02
      { id: 13, o: 1, c: 'SOLICITUD_CABLEADO', n: 'Petición con plano o ubicación del punto', r: 'SOLICITANTE', comp: false, p: false },
      { id: 13, o: 2, c: 'APROBACION_INFRAESTRUCTURA', n: 'Evaluación de capacidad y puertos en rack', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 13, o: 3, c: 'TENDIDO_Y_CERTIFICACION', n: 'Tiraje de cable Cat 6A y certificación Fluke', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 13, o: 4, c: 'HABILITACION_SWITCH', n: 'Asignación de VLAN en switch administrable', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 13, o: 5, c: 'ENTREGA_CONFORME', n: 'Prueba de velocidad a 1 Gbps y cierre', r: 'SOLICITANTE', comp: false, p: false },

      // 14: SRV-RED-03
      { id: 14, o: 1, c: 'SOLICITUD_MOVIL', n: 'Justificación por rol comercial o gerencial', r: 'SOLICITANTE', comp: false, p: false },
      { id: 14, o: 2, c: 'APROBACION_GERENCIA', n: 'Aprobación del canon mensual de telefonía', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 14, o: 3, c: 'ENROLAMIENTO_MDM', n: 'Cifrado y contenedor seguro de datos en MDM', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 14, o: 4, c: 'ENTREGA_TERMINAL', n: 'Firma de acta de custodia y entrega de equipo', r: 'SOPORTE_N2', comp: false, p: false },

      // 15: SRV-SEC-01
      { id: 15, o: 1, c: 'SOLICITADO', n: 'Petición con canal secundario de identidad', r: 'SOLICITANTE', comp: false, p: false },
      { id: 15, o: 2, c: 'DESAFIO_IDENTIDAD', n: 'Validación de identidad anti-suplantación', r: 'MESA_N1', comp: false, p: false },
      { id: 15, o: 3, c: 'EJECUCION_RESET', n: 'Desbloqueo en AD con cambio forzado al login', r: 'MESA_N1', comp: false, p: false },
      { id: 15, o: 4, c: 'CONFIRMACION_CIERRE', n: 'Inicio de sesión exitoso por el usuario', r: 'SOLICITANTE', comp: false, p: false },

      // 16: SRV-SEC-02
      { id: 16, o: 1, c: 'REPORTE_AMENAZA', n: 'Reenvío de correo sospechoso o alerta EDR', r: 'SOLICITANTE', comp: false, p: false },
      { id: 16, o: 2, c: 'TRIAJE_INMEDIATO', n: 'Análisis de cabeceras y sandbox de seguridad', r: 'SEGURIDAD_TI', comp: false, p: false },
      { id: 16, o: 3, c: 'CONTENCION_Y_PURGA', n: 'Aislamiento de endpoint y purga en buzones', r: 'SEGURIDAD_TI', comp: false, p: false },
      { id: 16, o: 4, c: 'BLOQUEO_INDICADORES', n: 'Bloqueo de IP y dominio atacante en firewall', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 16, o: 5, c: 'INFORME_CIERRE', n: 'Emisión de reporte de incidente de seguridad', r: 'SEGURIDAD_TI', comp: false, p: false },

      // 17: SRV-SEC-03
      { id: 17, o: 1, c: 'SOLICITUD_DESBLOQUEO', n: 'URL requerida y justificación operativa', r: 'SOLICITANTE', comp: false, p: false },
      { id: 17, o: 2, c: 'ANALISIS_REPUTACION', n: 'Inspección de reputación del sitio web', r: 'SEGURIDAD_TI', comp: false, p: false },
      { id: 17, o: 3, c: 'APROBACION_CISO', n: 'Evaluación de riesgo por Oficial de Seguridad', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 17, o: 4, c: 'REGLA_FIREWALL', n: 'Aplicación de regla en proxy perimetral', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 17, o: 5, c: 'VERIFICACION_ACCESO', n: 'Comprobación de acceso conforme al sitio', r: 'SOLICITANTE', comp: false, p: false },

      // 18: SRV-ONB-01
      { id: 18, o: 1, c: 'SOLICITUD_RRHH', n: 'Ficha de alta con fecha de ingreso', r: 'RECURSOS_HUMANOS', comp: false, p: false },
      { id: 18, o: 2, c: 'TAREA_IDENTIDAD', n: 'Creación de cuenta de dominio y correo', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 18, o: 3, c: 'TAREA_HARDWARE', n: 'Configuración física de laptop y accesorios', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 18, o: 4, c: 'TAREA_COMUNICACIONES', n: 'Habilitación de anexo IP y acceso a VPN', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 18, o: 5, c: 'CONTROL_CALIDAD', n: 'Consolidación por Supervisor de Service Desk', r: 'SUPERVISOR_TI', comp: false, p: false },
      { id: 18, o: 6, c: 'ENTREGA_DIA1', n: 'Entrega física de equipo e inducción', r: 'SOPORTE_N2', comp: false, p: false },

      // 19: SRV-CHG-01
      { id: 19, o: 1, c: 'REGISTRO_RFC_ESTANDAR', n: 'Registro de cambio estándar pre-aprobado', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 19, o: 2, c: 'NOTIFICACION_USUARIOS', n: 'Aviso de ventana de mantenimiento planificada', r: 'MESA_N1', comp: false, p: false },
      { id: 19, o: 3, c: 'EJECUCION_VENTANA', n: 'Aplicación de cambio en horario nocturno', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 19, o: 4, c: 'PRUEBAS_POST_CAMBIO', n: 'Verificación de operatividad de servicios', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 19, o: 5, c: 'CIERRE_RFC', n: 'Registro de resultados en bitácora de cambios', r: 'SUPERVISOR_TI', comp: false, p: false },

      // 20: SRV-CHG-02
      { id: 20, o: 1, c: 'SOLICITUD_RFC_MAYOR', n: 'Documento de cambio con plan de rollback', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 20, o: 2, c: 'SESION_EVALUACION_CAB', n: 'Revisión colegiada del Comité Asesor (CAB)', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 20, o: 3, c: 'AUTORIZACION_CAMBIO', n: 'Firma formal de autorización de pase a producción', r: 'SUPERVISOR_TI', comp: false, p: false },
      { id: 20, o: 4, c: 'DESPLIEGUE_PRODUCCION', n: 'Ejecución coordinada del pase a producción', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 20, o: 5, c: 'REVISION_PIR', n: 'Revisión post-implementación de incidentes', r: 'AUDITOR', comp: false, p: false },

      // 21: SRV-PRB-01
      { id: 21, o: 1, c: 'APERTURA_PROBLEMA', n: 'Identificación de incidentes repetitivos', r: 'SUPERVISOR_TI', comp: false, p: false },
      { id: 21, o: 2, c: 'ANALISIS_CAUSA_RAIZ', n: 'Investigación con técnica 5 Porqués / Ishikawa', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 21, o: 3, c: 'PUBLICACION_WORKAROUND', n: 'Documentación de solución temporal en KEDB', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 21, o: 4, c: 'PROPUESTA_CAMBIO', n: 'Generación de RFC para solución definitiva', r: 'SISTEMAS_N3', comp: false, p: false },
      { id: 21, o: 5, c: 'CIERRE_MASIVO', n: 'Cierre masivo de incidentes vinculados', r: 'SUPERVISOR_TI', comp: false, p: false },

      // 22: SRV-CNT-01
      { id: 22, o: 1, c: 'DIAGNOSTICO_FALLA', n: 'Comprobación de daño físico de hardware', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 22, o: 2, c: 'APERTURA_CASO_PROVEEDOR', n: 'Registro de caso en portal del fabricante', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 22, o: 3, c: 'ESPERA_REPUESTO', n: 'Ticket en espera de proveedor externo', r: 'SOPORTE_N2', comp: false, p: true },
      { id: 22, o: 4, c: 'INTERVENCION_TECNICO', n: 'Reemplazo físico de componente en sede', r: 'SOPORTE_N2', comp: false, p: false },
      { id: 22, o: 5, c: 'PRUEBA_Y_CIERRE', n: 'Diagnóstico satisfactorio y actualización CMDB', r: 'SOPORTE_N2', comp: false, p: false },

      // 23: SRV-AST-01
      { id: 23, o: 1, c: 'SOLICITUD_BAJA', n: 'Ficha técnica de equipo dañado u obsoleto', r: 'GESTOR_ACTIVOS_TI', comp: false, p: false },
      { id: 23, o: 2, c: 'APROBACION_CONTABLE', n: 'Autorización de desincorporación patrimonial', r: 'JEFE_APROBADOR', comp: true, p: true },
      { id: 23, o: 3, c: 'BORRADO_SEGURO_NIST', n: 'Destrucción criptográfica de datos NIST 800-88', r: 'SEGURIDAD_TI', comp: false, p: false },
      { id: 23, o: 4, c: 'CERTIFICADO_Y_CMDB', n: 'Emisión de certificado y baja de activo en CMDB', r: 'GESTOR_ACTIVOS_TI', comp: false, p: false },
      { id: 23, o: 5, c: 'DISPOSICION_RAEE', n: 'Entrega a operador de reciclaje ambiental', r: 'SOPORTE_N2', comp: false, p: false },
    ];

    for (const w of workflows) {
      await client.query(`
        INSERT INTO servicio_workflow_paso (
          id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      `, [w.id, w.o, w.c, w.n, w.r, w.comp, w.p]);
    }

    await client.query('COMMIT');
    console.log(`MIGRACION EXITOSA: ${servicios.length} servicios y ${workflows.length} pasos de workflow registrados.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR EN MIGRACION:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateCatalogoCompleto();
