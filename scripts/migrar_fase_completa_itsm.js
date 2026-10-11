const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Iniciando migracion estructural completa ITSM (ITIL v4 / ISO 20000 / ISO 27001)...");

  // 1. Modificaciones en tablas existentes
  console.log("1. Modificando tablas existentes (columnas y relaciones)...");
  
  await pool.query(`
    -- Subcategorias jerarquicas
    ALTER TABLE categoria_ticket ADD COLUMN IF NOT EXISTS id_padre INT REFERENCES categoria_ticket(id_categoria);

    -- Pertenencia departamental en usuario (SoD para Gestores de Area)
    ALTER TABLE usuario ADD COLUMN IF NOT EXISTS id_departamento INT REFERENCES departamento_ti(id_departamento);

    -- Asignar departamento por defecto a usuarios existentes si no tienen
    UPDATE usuario SET id_departamento = 1 WHERE id_departamento IS NULL;
  `);

  // 2. Tablas de Gestion de Activos y CMDB (Requeridas por Problemas y Cambios)
  console.log("2. Creando tablas de Activos y CMDB...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activo (
        id_activo SERIAL PRIMARY KEY,
        codigo_patrimonial VARCHAR(50) UNIQUE NOT NULL,
        numero_serie VARCHAR(100),
        tipo_activo VARCHAR(50) NOT NULL, -- LAPTOP, DESKTOP, SERVIDOR, SWITCH, IMPRESORA, ROUTER
        marca VARCHAR(100) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        id_departamento INT REFERENCES departamento_ti(id_departamento),
        id_usuario_custodio INT REFERENCES usuario(id_usuario),
        estado_activo VARCHAR(30) NOT NULL DEFAULT 'EN_OPERACION', -- EN_OPERACION, EN_STOCK, MANTENIMIENTO, BAJA
        fecha_adquisicion DATE,
        fecha_fin_garantia DATE,
        costo_compra NUMERIC(12,2),
        usuario_creacion INT REFERENCES usuario(id_usuario),
        fecha_creacion TIMESTAMPTZ DEFAULT now(),
        usuario_modificacion INT REFERENCES usuario(id_usuario),
        fecha_modificacion TIMESTAMPTZ,
        estado_registro BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS elemento_configuracion (
        id_ci SERIAL PRIMARY KEY,
        id_activo INT REFERENCES activo(id_activo),
        codigo_ci VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        tipo_ci VARCHAR(50) NOT NULL, -- SERVICIO_TI, SERVIDOR_LOGICO, APLICACION, BASE_DATOS, NODO_RED
        ambiente VARCHAR(20) NOT NULL CHECK (ambiente IN ('PRODUCCION', 'QA', 'DESARROLLO')),
        ip_principal VARCHAR(45),
        version_software VARCHAR(50),
        criticidad VARCHAR(20) NOT NULL CHECK (criticidad IN ('CRITICA', 'ALTA', 'MEDIA', 'BAJA')),
        id_departamento_soporte INT REFERENCES departamento_ti(id_departamento),
        usuario_creacion INT REFERENCES usuario(id_usuario),
        fecha_creacion TIMESTAMPTZ DEFAULT now(),
        estado_registro BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS ci_relacion (
        id_ci_padre INT NOT NULL REFERENCES elemento_configuracion(id_ci),
        id_ci_hijo INT NOT NULL REFERENCES elemento_configuracion(id_ci),
        tipo_relacion VARCHAR(50) NOT NULL, -- DEPENDE_DE, ALBERGA_A, CONECTADO_CON
        fecha_creacion TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (id_ci_padre, id_ci_hijo)
    );

    CREATE TABLE IF NOT EXISTS licencia_software (
        id_licencia SERIAL PRIMARY KEY,
        nombre_software VARCHAR(150) NOT NULL,
        fabricante VARCHAR(100) NOT NULL,
        clave_licencia VARCHAR(255),
        tipo_licencia VARCHAR(50) NOT NULL, -- PERPETUA, SUSCRIPCION_ANUAL, POR_VOLUMEN, OEM
        cantidad_adquirida INT NOT NULL,
        cantidad_en_uso INT NOT NULL DEFAULT 0,
        fecha_vencimiento DATE,
        costo_anual NUMERIC(12,2),
        usuario_creacion INT REFERENCES usuario(id_usuario),
        fecha_creacion TIMESTAMPTZ DEFAULT now(),
        estado_registro BOOLEAN NOT NULL DEFAULT true
    );
  `);

  // 3. Tablas de Gestion de Problemas (Problem Management)
  console.log("3. Creando tablas de Gestion de Problemas...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS problema (
        id_problema SERIAL PRIMARY KEY,
        codigo_problema VARCHAR(30) UNIQUE NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        id_impacto INT REFERENCES impacto_ticket(id_impacto),
        id_urgencia INT REFERENCES urgencia_ticket(id_urgencia),
        id_prioridad INT REFERENCES prioridad_ticket(id_prioridad),
        id_estado INT NOT NULL DEFAULT 1, -- 1: Registrado, 2: En Investigacion, 3: Causa Raiz Identificada, 4: Error Conocido, 5: Resuelto, 6: Cerrado
        causa_raiz TEXT,
        metodo_analisis VARCHAR(50) DEFAULT '5_WHYS', -- 5_WHYS, ISHIKAWA, ARBOL_FALLAS, PRUEBAS_AISLAMIENTO
        workaround TEXT,
        es_error_conocido BOOLEAN NOT NULL DEFAULT false,
        id_ci_afectado INT REFERENCES elemento_configuracion(id_ci),
        id_usuario_asignado INT REFERENCES usuario(id_usuario),
        id_departamento INT REFERENCES departamento_ti(id_departamento),
        solucion_definitiva TEXT,
        usuario_creacion INT REFERENCES usuario(id_usuario),
        fecha_creacion TIMESTAMPTZ DEFAULT now(),
        usuario_modificacion INT REFERENCES usuario(id_usuario),
        fecha_modificacion TIMESTAMPTZ,
        estado_registro BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS problema_incidente (
        id_problema INT NOT NULL REFERENCES problema(id_problema),
        id_ticket INT NOT NULL REFERENCES ticket(id_ticket),
        fecha_asociacion TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (id_problema, id_ticket)
    );

    CREATE TABLE IF NOT EXISTS error_conocido (
        id_error_conocido SERIAL PRIMARY KEY,
        id_problema INT NOT NULL REFERENCES problema(id_problema),
        codigo_kedb VARCHAR(30) UNIQUE NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        sintomas TEXT NOT NULL,
        workaround TEXT NOT NULL,
        solucion_definitiva TEXT,
        fecha_publicacion TIMESTAMPTZ DEFAULT now(),
        estado_registro BOOLEAN NOT NULL DEFAULT true
    );
  `);

  // 4. Tablas de Gestion de Cambios (Change Enablement)
  console.log("4. Creando tablas de Gestion de Cambios...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cambio (
        id_cambio SERIAL PRIMARY KEY,
        codigo_cambio VARCHAR(30) UNIQUE NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        tipo_cambio VARCHAR(20) NOT NULL CHECK (tipo_cambio IN ('ESTANDAR', 'NORMAL', 'EMERGENCIA')),
        id_impacto INT REFERENCES impacto_ticket(id_impacto),
        id_urgencia INT REFERENCES urgencia_ticket(id_urgencia),
        id_prioridad INT REFERENCES prioridad_ticket(id_prioridad),
        id_estado INT NOT NULL DEFAULT 1, -- 1: Solicitado, 2: En Evaluacion CAB, 3: Aprobado, 4: En Ejecucion, 5: Exitoso, 6: Fallido, 7: Revertido, 8: Cancelado
        justificacion TEXT NOT NULL,
        plan_implementacion TEXT NOT NULL,
        plan_rollback TEXT NOT NULL,
        plan_pruebas TEXT,
        ventana_inicio TIMESTAMPTZ NOT NULL,
        ventana_fin TIMESTAMPTZ NOT NULL,
        id_ci_afectado INT REFERENCES elemento_configuracion(id_ci),
        id_problema_origen INT REFERENCES problema(id_problema),
        id_incidente_origen INT REFERENCES ticket(id_ticket),
        id_usuario_solicitante INT NOT NULL REFERENCES usuario(id_usuario),
        id_usuario_responsable INT REFERENCES usuario(id_usuario),
        resultado_pir TEXT,
        incidentes_inducidos INT DEFAULT 0,
        usuario_creacion INT REFERENCES usuario(id_usuario),
        fecha_creacion TIMESTAMPTZ DEFAULT now(),
        usuario_modificacion INT REFERENCES usuario(id_usuario),
        fecha_modificacion TIMESTAMPTZ,
        estado_registro BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS cambio_aprobacion (
        id_cambio_aprobacion SERIAL PRIMARY KEY,
        id_cambio INT NOT NULL REFERENCES cambio(id_cambio),
        id_usuario_aprobador INT NOT NULL REFERENCES usuario(id_usuario),
        decision VARCHAR(20) NOT NULL CHECK (decision IN ('APROBADO', 'RECHAZADO', 'OBSERVADO')),
        comentario TEXT NOT NULL,
        fecha_decision TIMESTAMPTZ DEFAULT now(),
        estado_registro BOOLEAN NOT NULL DEFAULT true
    );
  `);

  // 5. Tablas de Gestion del Conocimiento
  console.log("5. Creando tablas de Gestion del Conocimiento...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articulo_conocimiento (
        id_articulo SERIAL PRIMARY KEY,
        codigo_articulo VARCHAR(30) UNIQUE NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        contenido_markdown TEXT NOT NULL,
        id_categoria INT REFERENCES categoria_ticket(id_categoria),
        id_problema_origen INT REFERENCES problema(id_problema),
        estado_editorial VARCHAR(20) NOT NULL DEFAULT 'PUBLICADO' CHECK (estado_editorial IN ('BORRADOR', 'EN_REVISION', 'PUBLICADO', 'ARCHIVADO')),
        id_autor INT NOT NULL REFERENCES usuario(id_usuario),
        id_revisor INT REFERENCES usuario(id_usuario),
        visitas INT NOT NULL DEFAULT 0,
        utilidad_positiva INT NOT NULL DEFAULT 0,
        utilidad_negativa INT NOT NULL DEFAULT 0,
        fecha_publicacion TIMESTAMPTZ DEFAULT now(),
        usuario_creacion INT REFERENCES usuario(id_usuario),
        fecha_creacion TIMESTAMPTZ DEFAULT now(),
        estado_registro BOOLEAN NOT NULL DEFAULT true
    );
  `);

  // 6. Columnas complementarias en Ticket
  console.log("6. Vinculando Ticket con Problema, CI y Reapertura...");
  await pool.query(`
    ALTER TABLE ticket ADD COLUMN IF NOT EXISTS id_problema INT REFERENCES problema(id_problema);
    ALTER TABLE ticket ADD COLUMN IF NOT EXISTS id_ci INT REFERENCES elemento_configuracion(id_ci);
    ALTER TABLE ticket ADD COLUMN IF NOT EXISTS fecha_reapertura TIMESTAMPTZ;
    ALTER TABLE ticket ADD COLUMN IF NOT EXISTS motivo_reapertura TEXT;
    ALTER TABLE ticket ADD COLUMN IF NOT EXISTS conteo_reaperturas INT DEFAULT 0;
  `);

  // 7. Seed de datos iniciales en las nuevas tablas
  console.log("7. Sembrando datos realistas ITIL v4...");

  // Activos
  const checkActivos = await pool.query("SELECT COUNT(*) as c FROM activo");
  if (parseInt(checkActivos.rows[0].c, 10) === 0) {
    await pool.query(`
      INSERT INTO activo (id_activo, codigo_patrimonial, numero_serie, tipo_activo, marca, modelo, id_departamento, id_usuario_custodio, estado_activo, fecha_adquisicion, fecha_fin_garantia, costo_compra, usuario_creacion)
      VALUES 
      (1, 'ACT-SRV-001', 'SRV-DL380-9921', 'SERVIDOR', 'HPE', 'ProLiant DL380 Gen10', 4, 1, 'EN_OPERACION', '2024-01-15', '2027-01-15', 8500.00, 1),
      (2, 'ACT-SRV-002', 'SRV-R740-4412', 'SERVIDOR', 'Dell', 'PowerEdge R740', 4, 1, 'EN_OPERACION', '2024-03-10', '2027-03-10', 7900.00, 1),
      (3, 'ACT-SW-001', 'SW-CISCO-3850', 'SWITCH', 'Cisco', 'Catalyst 3850 48P', 3, 1, 'EN_OPERACION', '2023-06-20', '2026-06-20', 3200.00, 1),
      (4, 'ACT-LAP-101', 'LAP-LENOVO-X1', 'LAPTOP', 'Lenovo', 'ThinkPad X1 Carbon Gen 11', 2, 1, 'EN_OPERACION', '2024-05-02', '2027-05-02', 1850.00, 1),
      (5, 'ACT-LAP-102', 'LAP-DELL-5430', 'LAPTOP', 'Dell', 'Latitude 5430', 2, 1, 'EN_STOCK', '2024-08-11', '2027-08-11', 1400.00, 1);
    `);
  }

  // CIs
  const checkCIs = await pool.query("SELECT COUNT(*) as c FROM elemento_configuracion");
  if (parseInt(checkCIs.rows[0].c, 10) === 0) {
    await pool.query(`
      INSERT INTO elemento_configuracion (id_ci, id_activo, codigo_ci, nombre, tipo_ci, ambiente, ip_principal, version_software, criticidad, id_departamento_soporte, usuario_creacion)
      VALUES
      (1, 1, 'CI-SRV-APP-01', 'Servidor de Aplicaciones Core Node.js', 'SERVIDOR_LOGICO', 'PRODUCCION', '10.0.1.15', 'Ubuntu 22.04 LTS / Node 20', 'CRITICA', 4, 1),
      (2, 2, 'CI-SRV-DB-01', 'Cluster Base de Datos PostgreSQL Produccion', 'BASE_DATOS', 'PRODUCCION', '10.0.1.20', 'PostgreSQL 16.2', 'CRITICA', 4, 1),
      (3, 3, 'CI-NET-SW-CORE', 'Switch de Core y Distribucion Principal Piso 2', 'NODO_RED', 'PRODUCCION', '10.0.0.1', 'Cisco IOS-XE 16.9', 'ALTA', 3, 1),
      (4, NULL, 'CI-APP-PORTAL', 'Portal Corporativo del Sistema de Tickets', 'APLICACION', 'PRODUCCION', '10.0.1.50', 'v2.4.0-itil', 'CRITICA', 4, 1);
    `);

    await pool.query(`
      INSERT INTO ci_relacion (id_ci_padre, id_ci_hijo, tipo_relacion)
      VALUES
      (4, 1, 'DEPENDE_DE'),
      (1, 2, 'DEPENDE_DE'),
      (1, 3, 'CONECTADO_CON');
    `);
  }

  // Licencias
  const checkLic = await pool.query("SELECT COUNT(*) as c FROM licencia_software");
  if (parseInt(checkLic.rows[0].c, 10) === 0) {
    await pool.query(`
      INSERT INTO licencia_software (id_licencia, nombre_software, fabricante, clave_licencia, tipo_licencia, cantidad_adquirida, cantidad_en_uso, fecha_vencimiento, costo_anual, usuario_creacion)
      VALUES
      (1, 'Microsoft 365 E5 Corporativo', 'Microsoft Corporation', 'M365-E5-8841-CORP', 'SUSCRIPCION_ANUAL', 250, 185, '2026-12-31', 45000.00, 1),
      (2, 'Oracle Database Enterprise Edition', 'Oracle Corporation', 'ORA-EE-9912-LIC', 'PERPETUA', 4, 4, '2028-06-30', 28000.00, 1),
      (3, 'CrowdStrike Falcon Endpoint Security', 'CrowdStrike Inc.', 'CS-FLC-7712-ENT', 'SUSCRIPCION_ANUAL', 300, 240, '2026-11-15', 18500.00, 1),
      (4, 'AutoCAD 2026 Enterprise', 'Autodesk', 'ACAD-2026-3312', 'SUSCRIPCION_ANUAL', 20, 19, '2026-10-31', 9200.00, 1);
    `);
  }

  // Problemas y KEDB
  const checkProblemas = await pool.query("SELECT COUNT(*) as c FROM problema");
  if (parseInt(checkProblemas.rows[0].c, 10) === 0) {
    await pool.query(`
      INSERT INTO problema (id_problema, codigo_problema, titulo, descripcion, id_impacto, id_urgencia, id_prioridad, id_estado, causa_raiz, metodo_analisis, workaround, es_error_conocido, id_ci_afectado, id_usuario_asignado, id_departamento, usuario_creacion)
      VALUES 
      (1, 'PRB-2026-0001', 'Microcortes aleatorios y desconexion en VPN corporativa SSL', 'Multiples colaboradores de diversas sedes reportan desconexiones de la VPN cada 45 minutos durante llamadas y transferencias.', 3, 3, 1, 3, 'Saturacion de conexiones simultaneas por asignacion insuficiente de pool de memoria en el Gateway perimetral.', '5_WHYS', 'Reiniciar el servicio openvpn-daemon en el nodo secundario y derivar usuarios al Gateway B.', true, 3, 1, 3, 1),
      (2, 'PRB-2026-0002', 'Lentitud y cuelgues recurrentes en reportes financieros del ERP', 'El módulo de consolidación contable se congela al emitir balances mensuales afectando a Gerencia de Finanzas.', 2, 2, 2, 4, 'Consultas de indices secuenciales sin cache en tablas de auditoria con mas de 5 millones de registros.', 'ISHIKAWA', 'Ejecutar VACUUM ANALYZE manual y restringir el rango de fechas de consulta a 6 meses.', true, 2, 1, 4, 1);

      INSERT INTO error_conocido (id_error_conocido, id_problema, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva)
      VALUES
      (1, 1, 'KEDB-001', 'Fallo por Keepalive Timeout en VPN SSL Corporativa', 'El cliente VPN muestra "Connection Reset by Peer" y se desconecta de las carpetas de red.', 'Conectarse temporalmente mediante la URL de contingencia vpn-backup.empresa.com.', 'Actualizar el firmware del Firewall perimetral a la version 7.4.2 con ampliacion de buffer.'),
      (2, 2, 'KEDB-002', 'Saturacion de memoria compartida en reportes ERP', 'El navegador responde con error HTTP 504 Gateway Timeout al generar reportes de mas de 1000 paginas.', 'Descargar el reporte en formato CSV plano en lugar de PDF previsualizado.', 'Crear indices cubrientes en PostgreSQL sobre fecha_movimiento y id_cuenta_contable.');
    `);
  }

  // Cambios (RFC)
  const checkCambios = await pool.query("SELECT COUNT(*) as c FROM cambio");
  if (parseInt(checkCambios.rows[0].c, 10) === 0) {
    await pool.query(`
      INSERT INTO cambio (id_cambio, codigo_cambio, titulo, descripcion, tipo_cambio, id_impacto, id_urgencia, id_prioridad, id_estado, justificacion, plan_implementacion, plan_rollback, plan_pruebas, ventana_inicio, ventana_fin, id_ci_afectado, id_problema_origen, id_usuario_solicitante, id_usuario_responsable, usuario_creacion)
      VALUES
      (1, 'RFC-2026-0001', 'Actualizacion de firmware en Firewall perimetral Fortinet v7.4.2', 'Aplicacion de parche de seguridad critico para solucionar vulnerabilidad CVE-2026 y corregir microcortes de VPN.', 'NORMAL', 2, 2, 2, 3, 'Mitigar vulnerabilidades y solucionar el Problema PRB-2026-0001.', '1. Generar backup completo de configuracion. 2. Instalar imagen firmware v7.4.2. 3. Reiniciar nodo pasivo primero y verificar failover.', 'Restaurar imagen anterior v7.2.8 desde el slot de recuperacion secundaria en caso de falla de trafico.', 'Validar tuneles IPsec activos y pruebas de conexion remota con 5 usuarios de prueba.', '2026-10-04 23:00:00-05', '2026-10-05 03:00:00-05', 3, 1, 1, 1, 1),
      (2, 'RFC-2026-0002', 'Optimizacion de indices e incremento de memoria en PostgreSQL', 'Creacion de indices concurrentes sobre tablas financieras y ajuste de shared_buffers a 16GB.', 'NORMAL', 2, 1, 3, 2, 'Solucion definitiva para el Problema PRB-2026-0002 de lentitud en reportes.', '1. Tomar snapshot de volumen EBS. 2. Ejecutar script CREATE INDEX CONCURRENTLY. 3. Reiniciar servicio postgresql en ventana.', 'DROP INDEX CONCURRENTLY y restaurar postgresql.conf a configuracion previa.', 'Ejecucion de consulta de prueba y verificacion de tiempo de respuesta < 2 segundos.', '2026-10-11 22:00:00-05', '2026-10-12 01:00:00-05', 2, 2, 1, 1, 1);

      INSERT INTO cambio_aprobacion (id_cambio_aprobacion, id_cambio, id_usuario_aprobador, decision, comentario)
      VALUES
      (1, 1, 1, 'APROBADO', 'Aprobado formalmente por comite CAB tras revision del plan de contingencia.');
    `);
  }

  // Articulos de Conocimiento
  const checkArticulos = await pool.query("SELECT COUNT(*) as c FROM articulo_conocimiento");
  if (parseInt(checkArticulos.rows[0].c, 10) === 0) {
    await pool.query(
      `INSERT INTO articulo_conocimiento (id_articulo, codigo_articulo, titulo, contenido_markdown, id_categoria, estado_editorial, id_autor, id_revisor, visitas, utilidad_positiva)
       VALUES 
       (1, $1, $2, $3, $4, 'PUBLICADO', 1, 1, 342, 48),
       (2, $5, $6, $7, $8, 'PUBLICADO', 1, 1, 198, 27),
       (3, $9, $10, $11, $12, 'PUBLICADO', 1, 1, 510, 89)`,
      [
        'ART-2026-001',
        'Guia de Conexion y Solucion de Problemas con la VPN Corporativa',
        '1. Abre la aplicacion VPN en tu estacion de trabajo. 2. Ingresa credenciales institucionales y confirma 2FA. En caso de microcortes, conectarse a vpn-backup.empresa.com.',
        2,
        'ART-2026-002',
        'Procedimiento para Solicitud y Reemplazo de Baterias o Cargadores',
        'Registra el requerimiento en el Catalogo de Servicios bajo SRV-HW-02 especificando el codigo patrimonial y acude al Area de Soporte en Sitio Piso 2.',
        1,
        'ART-2026-003',
        'Configuracion de Impresoras Multifuncionales de Red por Departamento',
        'Rutas de impresion de red: Piso 2 Finanzas, Piso 3 Operaciones, Piso 4 TI. Presiona Win + R, escribe la ruta del servidor de impresion y presiona Enter.',
        1
      ]
    );
  }

  // Sincronizar secuencias seriales en PostgreSQL
  console.log("8. Sincronizando secuencias primarias...");
  await pool.query(`
    SELECT setval(pg_get_serial_sequence('activo', 'id_activo'), coalesce((SELECT max(id_activo) FROM activo), 1));
    SELECT setval(pg_get_serial_sequence('elemento_configuracion', 'id_ci'), coalesce((SELECT max(id_ci) FROM elemento_configuracion), 1));
    SELECT setval(pg_get_serial_sequence('licencia_software', 'id_licencia'), coalesce((SELECT max(id_licencia) FROM licencia_software), 1));
    SELECT setval(pg_get_serial_sequence('problema', 'id_problema'), coalesce((SELECT max(id_problema) FROM problema), 1));
    SELECT setval(pg_get_serial_sequence('error_conocido', 'id_error_conocido'), coalesce((SELECT max(id_error_conocido) FROM error_conocido), 1));
    SELECT setval(pg_get_serial_sequence('cambio', 'id_cambio'), coalesce((SELECT max(id_cambio) FROM cambio), 1));
    SELECT setval(pg_get_serial_sequence('cambio_aprobacion', 'id_cambio_aprobacion'), coalesce((SELECT max(id_cambio_aprobacion) FROM cambio_aprobacion), 1));
    SELECT setval(pg_get_serial_sequence('articulo_conocimiento', 'id_articulo'), coalesce((SELECT max(id_articulo) FROM articulo_conocimiento), 1));
  `);

  console.log("Migracion y sembrado completados exitosamente con codigo de salida 0.");
  await pool.end();
}

main().catch(err => {
  console.error("Error en migracion:", err);
  process.exit(1);
});
