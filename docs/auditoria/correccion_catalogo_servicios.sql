-- ============================================================================
-- CORRECCIÓN Y AMPLIACIÓN DEL CATÁLOGO DE SERVICIOS · producción
-- ----------------------------------------------------------------------------
-- Basado en catalogo.csv (49 servicios). Deja el catálogo alineado con lo que
-- FlowDesk realmente tiene (activos, CI y licencias de la carga del ecosistema):
--
--   1. Área resolutora para TODOS los servicios (antes ninguno tenía y todo
--      ticket del catálogo caía en Mesa de Ayuda) y marca de servicio crítico.
--   2. Textos corregidos: sin SAP/Oracle/Salesforce, Zoom, Power BI, AutoCAD,
--      telefonía IP, anexos, ni "registro en la CMDB" para laptops (van al
--      inventario de activos); dominio @flowdesk.com.
--   3. Baja (desactivación, no borrado) de servicios sin activos que los
--      respalden: telefonía IP y móvil, pipelines CI/CD, nube genérica, token
--      de firma digital, tarjetas de impresión y "Revision de impresoras"
--      (registro de prueba duplicado).
--   4. Servicios nuevos que nuestros activos sí necesitan: carpetas
--      compartidas, antivirus, instalación de impresora y software estándar.
--   5. Categorías que quedan sin servicios activos se desactivan.
--
-- Puede ejecutarse más de una vez: actualiza por código y no duplica.
-- Todo va en UN bloque: si algo falla, no se cambia nada.
-- ============================================================================
DO $$
DECLARE
  v_admin     INTEGER;
  v_n         INTEGER;
  v_problemas TEXT := '';
BEGIN
  SELECT up.id_usuario INTO v_admin FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil = 1 AND u.estado_registro ORDER BY 1 LIMIT 1;

  -- ------------------------------------------------------------------------
  -- 1 y 2. Área resolutora, criticidad y textos de los servicios que siguen
  --        (nombre/descripcion/entregable NULL = se conserva el texto actual)
  -- ------------------------------------------------------------------------
  CREATE TEMP TABLE _svc (
    codigo TEXT PRIMARY KEY, dep TEXT, critico BOOLEAN,
    nombre TEXT, descripcion TEXT, entregable TEXT, categoria TEXT
  ) ON COMMIT DROP;

  INSERT INTO _svc VALUES
  -- Incidentes
  ('SRV-INC-DB-001',   'DEP-N3-SIST',  true,  NULL, NULL, NULL, NULL),
  ('SRV-INC-DB-002',   'DEP-N3-SIST',  false, NULL, NULL, NULL, NULL),
  ('SRV-INC-HW-001',   'DEP-N2-CAMPO', false, NULL, NULL, NULL, NULL),
  ('SRV-INC-HW-002',   'DEP-N2-CAMPO', false, NULL, NULL, NULL, NULL),
  ('SRV-INC-INF-001',  'DEP-N3-SIST',  true,  NULL, NULL, NULL, NULL),
  ('SRV-INC-INF-002',  'DEP-N3-SIST',  false, NULL, NULL, NULL, NULL),
  ('SRV-INC-MAIL-001', 'DEP-N1-MESA',  true,  NULL, NULL, NULL, NULL),
  ('SRV-INC-MAIL-002', 'DEP-N1-MESA',  false, NULL, NULL, NULL, NULL),
  ('SRV-INC-PEND-001', 'DEP-N1-MESA',  false, NULL, NULL, NULL, NULL),
  ('SRV-INC-PRN-001',  'DEP-N2-CAMPO', false, NULL, NULL, NULL, NULL),
  ('SRV-INC-PRN-002',  'DEP-N2-CAMPO', false, NULL, NULL, NULL, NULL),
  ('SRV-INC-RED-001',  'DEP-REDES',    true,
   'Falla de conectividad de red cableada o Wi-Fi en la sede',
   'Reporte de cortes o lentitud de internet, sin conexión por cable o sin Wi-Fi (FLOWDESK-CORP) en un puesto, un piso o toda la sede. Indique el piso, si afecta a uno o varios usuarios y desde cuándo ocurre. Incluye diagnóstico del punto de red, del switch de acceso y del punto de acceso Wi-Fi. No incluye: cableado nuevo (se solicita aparte).',
   'Conectividad restablecida y confirmada por el usuario, con la causa y la solución registradas en el ticket.', NULL),
  ('SRV-INC-SEC-001',  'DEP-SEC',      true,  NULL, NULL, NULL, NULL),
  ('SRV-INC-SW-001',   'DEP-N3-SIST',  true,
   'Aplicación de negocio (ERP o intranet) lenta, con errores o sin respuesta',
   'Reporte de fallas del ERP financiero o del portal de intranet: lentitud, errores al ingresar o registrar, o servicio sin respuesta. Indique la pantalla, la hora y el mensaje de error. Incluye diagnóstico de la aplicación, su base de datos y el servidor que la aloja. No incluye: cambios funcionales ni nuevos reportes.',
   'Aplicación operativa y confirmada por el usuario, con la causa y la solución registradas en el ticket.', NULL),
  ('SRV-INC-SW-002',   'DEP-N2-CAMPO', false, NULL, NULL, NULL, NULL),
  ('SRV-INC-TEL-002',  'DEP-N1-MESA',  false,
   'Teams: fallas de audio, video o conexión en reuniones',
   'Reporte de cortes de audio o video, cámara o micrófono no detectados o imposibilidad de ingresar a reuniones de Microsoft Teams. Indique la hora y si ocurre en un solo equipo o en varios. Incluye diagnóstico y corrección de configuración. No incluye: organización técnica de eventos.',
   NULL, 'Correo y Colaboración Cloud'),
  -- Solicitudes
  ('SRV-SOL-ACC-001',  'DEP-N3-SIST',  false,
   'Accesos y privilegios en sistemas corporativos',
   'Habilitación, modificación de roles o retiro de permisos en el ERP financiero, la intranet, las carpetas compartidas o la VPN corporativa. Requiere la aprobación del jefe del área.',
   'Usuario con el rol mínimo necesario habilitado en el sistema solicitado, bajo el principio de menor privilegio.', NULL),
  ('SRV-SOL-ACC-002',  'DEP-SEC',      true,  NULL, NULL, NULL, NULL),
  ('SRV-SOL-ACC-003',  'DEP-SEC',      false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-ACC-004',  'DEP-N1-MESA',  false,
   'Creación de buzones compartidos y listas de distribución',
   'Aprovisionamiento de buzones del área (por ejemplo, facturacion@flowdesk.com) y grupos de correo con permisos delegados en Microsoft 365.',
   'Buzón compartido activo en Microsoft 365 con permisos delegados y visible en Outlook para los miembros indicados.', NULL),
  ('SRV-SOL-ACC-005',  'DEP-N1-MESA',  false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-BKP-001',  'DEP-N3-SIST',  false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-BKP-002',  'DEP-N3-SIST',  false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-CAP-001',  'DEP-N1-MESA',  false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-CAP-002',  'DEP-N1-MESA',  false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-CLD-001',  'DEP-N3-SIST',  false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-CLD-002',  'DEP-N3-SIST',  false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-HW-001',   'DEP-N2-CAMPO', false, NULL, NULL,
   'Equipo configurado con la imagen corporativa, Windows 11 Pro activado, antivirus ESET y Microsoft 365, registrado a nombre del custodio en el inventario de activos y entregado con acta.', NULL),
  ('SRV-SOL-HW-002',   'DEP-N2-CAMPO', false, NULL, NULL,
   'Equipo nuevo entregado con el perfil del usuario migrado; el equipo anterior vuelve al stock o pasa a baja en el inventario de activos.', NULL),
  ('SRV-SOL-HW-003',   'DEP-N2-CAMPO', false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-HW-004',   'DEP-N2-CAMPO', false, NULL,
   'Dotación de monitores secundarios, bases para laptop, teclados, mouse, adaptadores USB-C a HDMI o audífonos con micrófono para el puesto de trabajo o el teletrabajo.', NULL, NULL),
  ('SRV-SOL-HW-005',   'DEP-N2-CAMPO', false, NULL, NULL,
   'Puesto digital completo desde el primer día: cuenta de dominio, correo y licencia de Microsoft 365, laptop configurada y registrada en el inventario, e inducción en herramientas.', NULL),
  ('SRV-SOL-HW-006',   'DEP-N2-CAMPO', false, NULL,
   'Escalamiento de una falla física al fabricante (Lenovo, Dell, HP, HPE, Cisco o Fortinet) mediante el contrato de garantía vigente con el distribuidor.',
   'Componente o equipo reemplazado por garantía y número de serie actualizado en el inventario de activos.', NULL),
  ('SRV-SOL-HW-007',   'DEP-N2-CAMPO', false, NULL, NULL,
   'Certificado de borrado seguro de datos (NIST 800-88), baja registrada en el inventario de activos y entrega a un operador RAEE certificado.', NULL),
  ('SRV-SOL-MAIL-001', 'DEP-N1-MESA',  false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-PEND-001', 'DEP-N1-MESA',  false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-PRN-002',  'DEP-N2-CAMPO', false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-RED-001',  'DEP-REDES',    false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-RED-003',  'DEP-SEC',      false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-SEC-001',  'DEP-SEC',      false, NULL, NULL, NULL, NULL),
  ('SRV-SOL-SW-001',   'DEP-N3-SIST',  false,
   'Instalación y licenciamiento de software con costo',
   'Asignación de una licencia de pago (por ejemplo, Adobe Acrobat Pro) e instalación en el equipo del usuario. Requiere la aprobación del jefe del área porque la licencia tiene costo anual.',
   'Software instalado y activado con una licencia de la empresa asignada al usuario en el registro de licencias.', NULL),
  ('SRV-SOL-SW-002',   'DEP-N1-MESA',  false,
   'Asignación o cambio de licencia de Microsoft 365',
   'Asignación de la licencia de Microsoft 365 a un usuario que no la tiene, o cambio de plan por nuevas funciones del puesto.',
   'Licencia de Microsoft 365 asignada al usuario y verificada en Outlook, Teams y OneDrive.', NULL);

  UPDATE servicio_catalogo s SET
    id_departamento_resolutor = d.id_departamento,
    es_critico   = x.critico,
    nombre       = COALESCE(x.nombre, s.nombre),
    descripcion_comercial = COALESCE(x.descripcion, s.descripcion_comercial),
    entregable   = COALESCE(x.entregable, s.entregable),
    id_categoria = COALESCE((SELECT c.id_categoria FROM categoria_ticket c
                              WHERE c.nombre = x.categoria AND c.id_tipo_ticket = s.id_tipo_ticket
                              ORDER BY c.estado_registro DESC, 1 LIMIT 1), s.id_categoria)
    FROM _svc x JOIN departamento_ti d ON d.codigo = x.dep
   WHERE s.codigo_servicio = x.codigo;

  -- ------------------------------------------------------------------------
  -- 3. Bajas: servicios sin activos que los respalden (se desactivan; los
  --    tickets históricos que los usen se conservan intactos)
  -- ------------------------------------------------------------------------
  UPDATE servicio_catalogo SET
    estado_registro = false, fecha_inactivacion = now(), usuario_inactivacion = v_admin,
    motivo_inactivacion = x.motivo
    FROM (VALUES
      ('SRV-INC-TEL-001', 'FlowDesk no tiene central telefónica IP en su inventario.'),
      ('SRV-SOL-TEL-001', 'FlowDesk no tiene telefonía IP ni anexos en su inventario.'),
      ('SRV-SOL-RED-002', 'FlowDesk no tiene celulares corporativos ni plataforma MDM.'),
      ('SRV-INC-CLD-001', 'El único servicio en la nube es Microsoft 365; sus fallas se reportan en Correo y Colaboración.'),
      ('SRV-INC-CLD-002', 'FlowDesk no tiene repositorios ni pipelines de despliegue registrados.'),
      ('SRV-SOL-SEC-002', 'No hay tokens criptográficos de firma digital en el inventario.'),
      ('SRV-SOL-PRN-001', 'Las impresoras no usan tarjetas de acceso ni servidor de impresión con tarjetas.'),
      ('SRV-SOL-HW-008',  'Registro de prueba duplicado de SRV-INC-PRN-001 (falla de impresora).')
    ) AS x(codigo, motivo)
   WHERE servicio_catalogo.codigo_servicio = x.codigo AND servicio_catalogo.estado_registro;

  -- ------------------------------------------------------------------------
  -- 4. Servicios nuevos
  -- ------------------------------------------------------------------------
  CREATE TEMP TABLE _nuevo (
    codigo TEXT, tipo TEXT, categoria TEXT, nombre TEXT, descripcion TEXT, entregable TEXT,
    aprobacion BOOLEAN, sla_resp INTEGER, sla_res INTEGER, dep TEXT, critico BOOLEAN, icono TEXT
  ) ON COMMIT DROP;

  INSERT INTO _nuevo VALUES
  ('SRV-INC-SW-003', 'INCIDENTE', 'Software y Aplicaciones',
   'Sin acceso a carpetas compartidas o unidad de red',
   'Reporte de la unidad S: desconectada, carpetas compartidas que no abren o mensajes de "sin permiso" en carpetas a las que antes se accedía. Indique la ruta y el mensaje. Incluye reconexión de la unidad y revisión de permisos existentes. No incluye: permisos nuevos (se solicitan aparte).',
   'Acceso restablecido a las carpetas del área y confirmado por el usuario.',
   false, 2, 8, 'DEP-N3-SIST', false, 'carpeta'),
  ('SRV-INC-SEC-002', 'INCIDENTE', 'Seguridad de la Información',
   'Alerta del antivirus o sospecha de malware en el equipo',
   'Reporte de alertas de ESET, programas bloqueados, ventanas emergentes extrañas o comportamiento sospechoso del equipo. No apague el equipo; desconéctelo de la red si el antivirus lo indica. Incluye análisis del equipo y, si corresponde, limpieza o exclusión validada por Seguridad.',
   'Equipo analizado y limpio, o aplicación legítima autorizada, con el análisis registrado en el ticket.',
   false, 1, 8, 'DEP-SEC', false, 'escudo'),
  ('SRV-SOL-ACC-006', 'SOLICITUD', 'Usuarios y Accesos',
   'Acceso a una carpeta compartida del área',
   'Permiso de lectura o de edición sobre una carpeta compartida de otra área o de un proyecto. Indique la ruta y el tipo de acceso. Requiere la aprobación del jefe dueño de la información.',
   'Permiso habilitado mediante el grupo del directorio activo de la carpeta y verificado por el usuario.',
   true, 2, 8, 'DEP-N3-SIST', false, 'carpeta'),
  ('SRV-SOL-SEC-003', 'SOLICITUD', 'Instalación de Software',
   'Excepción en el antivirus para una aplicación de trabajo',
   'Autorización para que ESET permita una aplicación legítima que bloquea. Indique la aplicación, su fabricante y para qué la usa. Seguridad valida la aplicación antes de crear la excepción.',
   'Excepción por hash creada en la política del antivirus del área y aplicación funcionando en el equipo.',
   true, 2, 8, 'DEP-SEC', false, 'escudo'),
  ('SRV-SOL-PRN-003', 'SOLICITUD', 'Impresión y Consumibles',
   'Instalación de impresora de red en el equipo',
   'Configuración de la impresora multifuncional de su piso (u otro piso autorizado) en su laptop o PC, incluido el escaneo a correo.',
   'Impresora instalada con el controlador corporativo y página de prueba impresa.',
   false, 4, 8, 'DEP-N2-CAMPO', false, 'impresora'),
  ('SRV-SOL-SW-003', 'SOLICITUD', 'Instalación de Software',
   'Instalación de software estándar sin costo',
   'Instalación de programas gratuitos aprobados por TI (lector de PDF, compresor de archivos, navegador alternativo, cliente VPN corporativo). El software de pago se solicita en "Instalación y licenciamiento de software con costo".',
   'Programa instalado desde la fuente oficial y verificado por el usuario.',
   false, 4, 24, 'DEP-N2-CAMPO', false, 'software');

  INSERT INTO servicio_catalogo (codigo_servicio, id_tipo_ticket, id_categoria, nombre, descripcion_comercial, entregable,
                                 requiere_aprobacion, sla_horas_respuesta, sla_horas_resolucion, icono,
                                 id_departamento_resolutor, es_critico)
  SELECT n.codigo, tt.id_tipo_ticket,
         (SELECT c.id_categoria FROM categoria_ticket c WHERE c.nombre = n.categoria AND c.id_tipo_ticket = tt.id_tipo_ticket
           ORDER BY c.estado_registro DESC, 1 LIMIT 1),
         n.nombre, n.descripcion, n.entregable, n.aprobacion, n.sla_resp, n.sla_res, n.icono,
         d.id_departamento, n.critico
    FROM _nuevo n
    JOIN tipo_ticket tt ON tt.codigo = n.tipo
    JOIN departamento_ti d ON d.codigo = n.dep
  ON CONFLICT (codigo_servicio) DO NOTHING;

  -- Flujo de aprobación: toda solicitud que requiere aprobación y no tiene
  -- pasos recibe el flujo estándar (sin él, la app no puede pedir la decisión
  -- del jefe). El ejecutor sale del área resolutora del servicio.
  INSERT INTO servicio_workflow_paso (id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla)
  SELECT s.id_servicio, p.orden, p.codigo, p.nombre,
         COALESCE(p.rol, CASE d.codigo WHEN 'DEP-N1-MESA' THEN 'MESA_N1' WHEN 'DEP-N2-CAMPO' THEN 'SOPORTE_N2'
                                       WHEN 'DEP-SEC' THEN 'SEGURIDAD_TI' WHEN 'DEP-REDES' THEN 'SOPORTE_N2'
                                       ELSE 'SISTEMAS_N3' END),
         p.compuerta, p.compuerta
    FROM servicio_catalogo s
    JOIN tipo_ticket tt ON tt.id_tipo_ticket = s.id_tipo_ticket AND tt.codigo = 'SOLICITUD'
    LEFT JOIN departamento_ti d ON d.id_departamento = s.id_departamento_resolutor
    CROSS JOIN (VALUES
      (1, 'SOLICITADO',  'Solicitud registrada con justificación', 'SOLICITANTE',    false),
      (2, 'APROBACION',  'Aprobación del jefe del área',            'JEFE_APROBADOR', true),
      (3, 'EJECUCION',   'Ejecución por el área resolutora',        NULL,             false),
      (4, 'VERIFICACION','Verificación por el usuario',             'SOLICITANTE',    false)
    ) AS p(orden, codigo, nombre, rol, compuerta)
   WHERE s.estado_registro AND s.requiere_aprobacion
     AND NOT EXISTS (SELECT 1 FROM servicio_workflow_paso w WHERE w.id_servicio = s.id_servicio AND w.estado_registro);

  -- ------------------------------------------------------------------------
  -- 5. Categorías que se quedaron sin servicios activos
  -- ------------------------------------------------------------------------
  UPDATE categoria_ticket c SET estado_registro = false
   WHERE c.estado_registro
     AND c.nombre IN ('Telefonía y Comunicaciones Unificadas', 'Telefonía IP y Dispositivos Móviles', 'Servicios Cloud y DevOps')
     AND NOT EXISTS (SELECT 1 FROM servicio_catalogo s WHERE s.id_categoria = c.id_categoria AND s.estado_registro);

  -- ------------------------------------------------------------------------
  -- Validación
  -- ------------------------------------------------------------------------
  SELECT COUNT(*) INTO v_n FROM servicio_catalogo WHERE estado_registro AND id_departamento_resolutor IS NULL;
  IF v_n > 0 THEN
    v_problemas := v_problemas || ' · ' || v_n || ' servicios activos sin área resolutora ('
      || (SELECT string_agg(codigo_servicio, ', ') FROM servicio_catalogo WHERE estado_registro AND id_departamento_resolutor IS NULL) || ')';
  END IF;
  IF EXISTS (SELECT 1 FROM servicio_catalogo WHERE estado_registro
               AND (descripcion_comercial || ' ' || entregable || ' ' || nombre)
                   ~* '(SAP|Oracle|Salesforce|Zoom|Power BI|AutoCAD|Creative Cloud|@empresa\.com|anexo telef|telefon[ií]a IP)') THEN
    v_problemas := v_problemas || ' · servicios activos que aún mencionan productos o equipos que no tenemos';
  END IF;
  IF EXISTS (SELECT 1 FROM servicio_catalogo s WHERE s.estado_registro AND s.requiere_aprobacion AND s.id_tipo_ticket =
               (SELECT id_tipo_ticket FROM tipo_ticket WHERE codigo = 'SOLICITUD')
               AND NOT EXISTS (SELECT 1 FROM servicio_workflow_paso w WHERE w.id_servicio = s.id_servicio AND w.es_compuerta_aprobacion AND w.estado_registro)) THEN
    v_problemas := v_problemas || ' · solicitudes con aprobación sin paso de aprobación ('
      || (SELECT string_agg(s.codigo_servicio, ', ') FROM servicio_catalogo s WHERE s.estado_registro AND s.requiere_aprobacion
            AND NOT EXISTS (SELECT 1 FROM servicio_workflow_paso w WHERE w.id_servicio = s.id_servicio AND w.es_compuerta_aprobacion AND w.estado_registro)) || ')';
  END IF;
  IF v_problemas <> '' THEN
    RAISE EXCEPTION 'El catálogo no quedó consistente y no se cambió nada:%', v_problemas;
  END IF;

  RAISE NOTICE 'Catálogo corregido: % servicios activos (% incidentes, % solicitudes), % desactivados.',
    (SELECT COUNT(*) FROM servicio_catalogo WHERE estado_registro),
    (SELECT COUNT(*) FROM servicio_catalogo s JOIN tipo_ticket t USING (id_tipo_ticket) WHERE s.estado_registro AND t.codigo = 'INCIDENTE'),
    (SELECT COUNT(*) FROM servicio_catalogo s JOIN tipo_ticket t USING (id_tipo_ticket) WHERE s.estado_registro AND t.codigo = 'SOLICITUD'),
    (SELECT COUNT(*) FROM servicio_catalogo WHERE NOT estado_registro);
END $$;

-- Verificación: catálogo activo con su área resolutora
SELECT s.codigo_servicio, t.codigo AS tipo, c.nombre AS categoria, s.nombre, d.nombre AS area_resolutora,
       s.requiere_aprobacion, s.es_critico, s.sla_horas_respuesta || '/' || s.sla_horas_resolucion AS sla_h
  FROM servicio_catalogo s
  JOIN tipo_ticket t USING (id_tipo_ticket)
  LEFT JOIN categoria_ticket c ON c.id_categoria = s.id_categoria
  LEFT JOIN departamento_ti d ON d.id_departamento = s.id_departamento_resolutor
 WHERE s.estado_registro
 ORDER BY t.codigo, s.codigo_servicio;
