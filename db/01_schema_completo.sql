-- ============================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS - FLOWDESK ITSM v2.0
-- Motor: PostgreSQL (Supabase / Local)
-- Generado para respaldo y recuperación ante desastres (Disaster Recovery)
-- Total de tablas: 129
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Tabla: acta_entrega
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acta_entrega (
    id_acta INTEGER DEFAULT nextval('acta_entrega_id_acta_seq'::regclass) NOT NULL,
    id_activo INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    tipo TEXT DEFAULT 'ENTREGA'::text NOT NULL,
    estado TEXT DEFAULT 'PENDIENTE'::text NOT NULL,
    observaciones TEXT,
    creado_en TIMESTAMPTZ DEFAULT now() NOT NULL,
    aceptado_en TIMESTAMPTZ,
    CONSTRAINT acta_entrega_pkey PRIMARY KEY (id_acta)
);

-- ------------------------------------------------------------
-- Tabla: activo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activo (
    id_activo INTEGER DEFAULT nextval('activo_id_activo_seq'::regclass) NOT NULL,
    codigo_patrimonial VARCHAR(50) NOT NULL,
    numero_serie VARCHAR(100),
    tipo_activo VARCHAR(50) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    id_departamento INTEGER,
    id_usuario_custodio INTEGER,
    estado_activo VARCHAR(30) DEFAULT 'EN_OPERACION'::character varying NOT NULL,
    fecha_adquisicion DATE,
    fecha_fin_garantia DATE,
    costo_compra NUMERIC(12, 2),
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    motivo_inactivacion TEXT,
    fecha_inactivacion TIMESTAMPTZ,
    usuario_inactivacion INTEGER,
    id_modelo INTEGER,
    atributos JSONB DEFAULT '{}'::jsonb NOT NULL,
    valor_residual NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    vida_util_meses SMALLINT,
    CONSTRAINT activo_pkey PRIMARY KEY (id_activo),
    CONSTRAINT activo_codigo_patrimonial_key UNIQUE (codigo_patrimonial)
);

-- ------------------------------------------------------------
-- Tabla: activo_historial
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activo_historial (
    id_historial INTEGER DEFAULT nextval('activo_historial_id_historial_seq'::regclass) NOT NULL,
    id_activo INTEGER NOT NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    custodio_anterior INTEGER,
    custodio_nuevo INTEGER,
    motivo TEXT,
    id_usuario INTEGER NOT NULL,
    fecha TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT activo_historial_pkey PRIMARY KEY (id_historial)
);

-- ------------------------------------------------------------
-- Tabla: acuerdo_nivel_operativo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acuerdo_nivel_operativo (
    id_ola INTEGER DEFAULT nextval('acuerdo_nivel_operativo_id_ola_seq'::regclass) NOT NULL,
    id_departamento INTEGER NOT NULL,
    codigo_acuerdo VARCHAR(30) NOT NULL,
    nombre_acuerdo VARCHAR(100) NOT NULL,
    tipo_compromiso VARCHAR(40) NOT NULL,
    tiempo_maximo_horas INTEGER NOT NULL,
    tiempo_alerta_horas INTEGER NOT NULL,
    descripcion TEXT,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT acuerdo_nivel_operativo_pkey PRIMARY KEY (id_ola),
    CONSTRAINT acuerdo_nivel_operativo_codigo_acuerdo_key UNIQUE (codigo_acuerdo)
);

-- ------------------------------------------------------------
-- Tabla: adjunto_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS adjunto_ticket (
    id_adjunto INTEGER DEFAULT nextval('adjunto_ticket_id_adjunto_seq'::regclass) NOT NULL,
    id_ticket INTEGER NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamano_bytes INTEGER NOT NULL,
    datos_base64 TEXT NOT NULL,
    id_usuario_subio INTEGER NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT adjunto_ticket_pkey PRIMARY KEY (id_adjunto)
);

-- ------------------------------------------------------------
-- Tabla: api_credenciales_externas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_credenciales_externas (
    id_credencial INTEGER DEFAULT nextval('api_credenciales_externas_id_credencial_seq'::regclass) NOT NULL,
    nombre_grupo VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    api_key_prefijo VARCHAR(20) NOT NULL,
    api_key_hash VARCHAR(128) NOT NULL,
    permisos JSONB DEFAULT '["clientes:read", "clientes:write"]'::jsonb,
    limite_rpm INTEGER DEFAULT 60,
    estado BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    ultimo_acceso TIMESTAMPTZ,
    total_peticiones INTEGER DEFAULT 0,
    CONSTRAINT api_credenciales_externas_pkey PRIMARY KEY (id_credencial),
    CONSTRAINT api_credenciales_externas_api_key_hash_key UNIQUE (api_key_hash)
);

-- ------------------------------------------------------------
-- Tabla: api_log_auditoria
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_log_auditoria (
    id_log BIGINT DEFAULT nextval('api_log_auditoria_id_log_seq'::regclass) NOT NULL,
    id_credencial INTEGER,
    grupo_identificado VARCHAR(100),
    metodo VARCHAR(10) NOT NULL,
    ruta VARCHAR(255) NOT NULL,
    codigo_estado INTEGER NOT NULL,
    ip_origen VARCHAR(50),
    tiempo_respuesta_ms INTEGER,
    mensaje_error TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT api_log_auditoria_pkey PRIMARY KEY (id_log)
);

-- ------------------------------------------------------------
-- Tabla: aprobacion_monto
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aprobacion_monto (
    id_aprobacion_monto INTEGER DEFAULT nextval('aprobacion_monto_id_aprobacion_monto_seq'::regclass) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    id_referencia INTEGER NOT NULL,
    monto NUMERIC(12, 2),
    decision VARCHAR(20) NOT NULL,
    comentario TEXT,
    id_aprobador INTEGER NOT NULL,
    fecha_decision TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT aprobacion_monto_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['BAJA'::character varying, 'RENOVACION'::character varying])::text[]))),
    CONSTRAINT aprobacion_monto_decision_check CHECK (((decision)::text = ANY ((ARRAY['APROBADO'::character varying, 'RECHAZADO'::character varying])::text[]))),
    CONSTRAINT aprobacion_monto_pkey PRIMARY KEY (id_aprobacion_monto)
);

-- ------------------------------------------------------------
-- Tabla: articulo_conocimiento
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articulo_conocimiento (
    id_articulo INTEGER DEFAULT nextval('articulo_conocimiento_id_articulo_seq'::regclass) NOT NULL,
    codigo_articulo VARCHAR(30) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido_markdown TEXT NOT NULL,
    id_categoria INTEGER,
    id_problema_origen INTEGER,
    estado_editorial VARCHAR(20) DEFAULT 'PUBLICADO'::character varying NOT NULL,
    id_autor INTEGER NOT NULL,
    id_revisor INTEGER,
    visitas INTEGER DEFAULT 0 NOT NULL,
    utilidad_positiva INTEGER DEFAULT 0 NOT NULL,
    utilidad_negativa INTEGER DEFAULT 0 NOT NULL,
    fecha_publicacion TIMESTAMPTZ DEFAULT now(),
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    audiencia_perfiles INT2[] DEFAULT ARRAY[(2)::smallint, (3)::smallint, (4)::smallint, (5)::smallint, (6)::smallint, (7)::smallint, (8)::smallint, (9)::smallint] NOT NULL,
    fecha_revision DATE,
    motivo_retiro TEXT,
    version INTEGER DEFAULT 1 NOT NULL,
    veces_utilizado_en_tickets INTEGER DEFAULT 0,
    tipo_plantilla VARCHAR(50) DEFAULT 'SOLUCION'::character varying,
    clasificacion_seguridad VARCHAR(50) DEFAULT 'INTERNO'::character varying,
    CONSTRAINT articulo_conocimiento_estado_editorial_check CHECK (((estado_editorial)::text = ANY ((ARRAY['BORRADOR'::character varying, 'EN_REVISION'::character varying, 'APROBADO'::character varying, 'PUBLICADO'::character varying, 'ARCHIVADO'::character varying])::text[]))),
    CONSTRAINT articulo_conocimiento_pkey PRIMARY KEY (id_articulo),
    CONSTRAINT articulo_conocimiento_codigo_articulo_key UNIQUE (codigo_articulo)
);

-- ------------------------------------------------------------
-- Tabla: articulo_conocimiento_feedback
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articulo_conocimiento_feedback (
    id_feedback INTEGER DEFAULT nextval('articulo_conocimiento_feedback_id_feedback_seq'::regclass) NOT NULL,
    id_articulo INTEGER NOT NULL,
    id_usuario INTEGER,
    es_positivo BOOLEAN NOT NULL,
    motivo_negativo TEXT,
    comentario TEXT,
    ip VARCHAR(45),
    fecha TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT articulo_conocimiento_feedback_pkey PRIMARY KEY (id_feedback)
);

-- ------------------------------------------------------------
-- Tabla: articulo_conocimiento_historial
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articulo_conocimiento_historial (
    id_historial INTEGER DEFAULT nextval('articulo_conocimiento_historial_id_historial_seq'::regclass) NOT NULL,
    id_articulo INTEGER NOT NULL,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    comentario TEXT,
    id_usuario INTEGER NOT NULL,
    fecha TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT articulo_conocimiento_historial_pkey PRIMARY KEY (id_historial)
);

-- ------------------------------------------------------------
-- Tabla: articulo_conocimiento_version
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articulo_conocimiento_version (
    id_version INTEGER DEFAULT nextval('articulo_conocimiento_version_id_version_seq'::regclass) NOT NULL,
    id_articulo INTEGER NOT NULL,
    numero_version VARCHAR(20) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido_markdown TEXT NOT NULL,
    motivo_cambio TEXT,
    id_autor INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT articulo_conocimiento_version_pkey PRIMARY KEY (id_version)
);

-- ------------------------------------------------------------
-- Tabla: articulo_conocimiento_vinculo_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articulo_conocimiento_vinculo_ticket (
    id_vinculo INTEGER DEFAULT nextval('articulo_conocimiento_vinculo_ticket_id_vinculo_seq'::regclass) NOT NULL,
    id_articulo INTEGER NOT NULL,
    id_ticket INTEGER NOT NULL,
    id_tecnico INTEGER,
    resolvio_ticket BOOLEAN DEFAULT false,
    fecha_vinculo TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT articulo_conocimiento_vinculo_ticket_pkey PRIMARY KEY (id_vinculo),
    CONSTRAINT uq_articulo_ticket UNIQUE (id_articulo, id_ticket)
);

-- ------------------------------------------------------------
-- Tabla: bloqueo_edicion_concurrente
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bloqueo_edicion_concurrente (
    id_bloqueo INTEGER DEFAULT nextval('bloqueo_edicion_concurrente_id_bloqueo_seq'::regclass) NOT NULL,
    recurso VARCHAR(120) NOT NULL,
    id_usuario INTEGER NOT NULL,
    fecha_bloqueo TIMESTAMPTZ DEFAULT now(),
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    CONSTRAINT bloqueo_edicion_concurrente_pkey PRIMARY KEY (id_bloqueo),
    CONSTRAINT bloqueo_edicion_concurrente_recurso_key UNIQUE (recurso)
);

-- ------------------------------------------------------------
-- Tabla: cab_reunion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cab_reunion (
    id_reunion INTEGER DEFAULT nextval('cab_reunion_id_reunion_seq'::regclass) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    fecha_reunion TIMESTAMPTZ NOT NULL,
    tipo VARCHAR(20) DEFAULT 'ORDINARIA'::character varying NOT NULL,
    estado VARCHAR(20) DEFAULT 'PROGRAMADA'::character varying NOT NULL,
    agenda JSONB DEFAULT '[]'::jsonb NOT NULL,
    acta TEXT,
    id_convocante INTEGER NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT cab_reunion_estado_check CHECK (((estado)::text = ANY ((ARRAY['PROGRAMADA'::character varying, 'REALIZADA'::character varying, 'CANCELADA'::character varying])::text[]))),
    CONSTRAINT cab_reunion_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['ORDINARIA'::character varying, 'EXTRAORDINARIA'::character varying, 'EMERGENCIA'::character varying])::text[]))),
    CONSTRAINT cab_reunion_pkey PRIMARY KEY (id_reunion)
);

-- ------------------------------------------------------------
-- Tabla: calendario_feriados
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendario_feriados (
    id INTEGER DEFAULT nextval('calendario_feriados_id_seq'::regclass) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'nacional'::character varying NOT NULL,
    alcance VARCHAR(50) DEFAULT 'toda_la_organizacion'::character varying NOT NULL,
    sede_id INTEGER,
    recurrente_anual BOOLEAN DEFAULT true NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_modificacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT calendario_feriados_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabla: cambio
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cambio (
    id_cambio INTEGER DEFAULT nextval('cambio_id_cambio_seq'::regclass) NOT NULL,
    codigo_cambio VARCHAR(30) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo_cambio VARCHAR(20) NOT NULL,
    id_impacto INTEGER,
    id_urgencia INTEGER,
    id_prioridad INTEGER,
    id_estado INTEGER DEFAULT 1 NOT NULL,
    justificacion TEXT NOT NULL,
    plan_implementacion TEXT NOT NULL,
    plan_rollback TEXT NOT NULL,
    plan_pruebas TEXT,
    ventana_inicio TIMESTAMPTZ NOT NULL,
    ventana_fin TIMESTAMPTZ NOT NULL,
    id_ci_afectado INTEGER,
    id_problema_origen INTEGER,
    id_incidente_origen INTEGER,
    id_usuario_solicitante INTEGER NOT NULL,
    id_usuario_responsable INTEGER,
    resultado_pir TEXT,
    incidentes_inducidos INTEGER DEFAULT 0,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    campos_adicionales JSONB DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT cambio_tipo_cambio_check CHECK (((tipo_cambio)::text = ANY ((ARRAY['ESTANDAR'::character varying, 'NORMAL'::character varying, 'EMERGENCIA'::character varying])::text[]))),
    CONSTRAINT cambio_pkey PRIMARY KEY (id_cambio),
    CONSTRAINT cambio_codigo_cambio_key UNIQUE (codigo_cambio)
);

-- ------------------------------------------------------------
-- Tabla: cambio_aprobacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cambio_aprobacion (
    id_cambio_aprobacion INTEGER DEFAULT nextval('cambio_aprobacion_id_cambio_aprobacion_seq'::regclass) NOT NULL,
    id_cambio INTEGER NOT NULL,
    id_usuario_aprobador INTEGER NOT NULL,
    decision VARCHAR(20) NOT NULL,
    comentario TEXT NOT NULL,
    fecha_decision TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT cambio_aprobacion_decision_check CHECK (((decision)::text = ANY ((ARRAY['APROBADO'::character varying, 'RECHAZADO'::character varying, 'OBSERVADO'::character varying])::text[]))),
    CONSTRAINT cambio_aprobacion_pkey PRIMARY KEY (id_cambio_aprobacion)
);

-- ------------------------------------------------------------
-- Tabla: cambio_catalogo_item
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cambio_catalogo_item (
    id_item INTEGER DEFAULT nextval('cambio_catalogo_item_id_item_seq'::regclass) NOT NULL,
    catalogo VARCHAR(60) NOT NULL,
    id_padre INTEGER,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    color VARCHAR(30) DEFAULT '#475569'::character varying,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    es_sistema BOOLEAN DEFAULT false,
    atributos JSONB DEFAULT '{}'::jsonb,
    usos_count INTEGER DEFAULT 0,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT cambio_catalogo_item_pkey PRIMARY KEY (id_item),
    CONSTRAINT uq_cambio_catalogo_codigo UNIQUE (catalogo, codigo)
);

-- ------------------------------------------------------------
-- Tabla: cambio_enterado
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cambio_enterado (
    id_enterado INTEGER DEFAULT nextval('cambio_enterado_id_enterado_seq'::regclass) NOT NULL,
    id_cambio INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    fecha_enterado TIMESTAMPTZ DEFAULT now() NOT NULL,
    observacion TEXT,
    CONSTRAINT cambio_enterado_pkey PRIMARY KEY (id_enterado),
    CONSTRAINT uq_cambio_enterado_usuario UNIQUE (id_cambio, id_usuario)
);

-- ------------------------------------------------------------
-- Tabla: cambio_excepcion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cambio_excepcion (
    id_excepcion INTEGER DEFAULT nextval('cambio_excepcion_id_excepcion_seq'::regclass) NOT NULL,
    id_cambio INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    motivo TEXT NOT NULL,
    id_usuario_autoriza INTEGER NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT cambio_excepcion_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['CONFLICTO'::character varying, 'CONGELAMIENTO'::character varying, 'RECLASIFICACION'::character varying])::text[]))),
    CONSTRAINT cambio_excepcion_pkey PRIMARY KEY (id_excepcion)
);

-- ------------------------------------------------------------
-- Tabla: cambio_modelo_estandar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cambio_modelo_estandar (
    id_modelo INTEGER DEFAULT nextval('cambio_modelo_estandar_id_modelo_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER,
    estado VARCHAR(30) DEFAULT 'BORRADOR'::character varying,
    version_modelo INTEGER DEFAULT 1,
    propietario_id INTEGER,
    vigencia_desde DATE,
    vigencia_hasta DATE,
    servicios_aplicables JSONB DEFAULT '[]'::jsonb,
    clases_ci_aplicables JSONB DEFAULT '[]'::jsonb,
    entornos_permitidos JSONB DEFAULT '["produccion", "preproduccion", "pruebas", "desarrollo"]'::jsonb,
    riesgo_fijo VARCHAR(20) DEFAULT 'bajo'::character varying,
    autorizacion_automatica BOOLEAN DEFAULT true,
    etapa_minima_id VARCHAR(50),
    lista_elegibilidad JSONB DEFAULT '[]'::jsonb,
    contenido_prellenado JSONB DEFAULT '{}'::jsonb,
    campos_bloqueados JSONB DEFAULT '[]'::jsonb,
    ventanas_permitidas JSONB DEFAULT '[]'::jsonb,
    anticipacion_horas INTEGER DEFAULT 24,
    limite_frecuencia_ci INTEGER DEFAULT 5,
    paquete_tareas JSONB DEFAULT '[]'::jsonb,
    checklist_items JSONB DEFAULT '[]'::jsonb,
    control_calidad_activo BOOLEAN DEFAULT true,
    umbral_tasa_fallo_pct NUMERIC DEFAULT 10.0,
    umbral_fallos_consecutivos INTEGER DEFAULT 2,
    dias_observacion_calidad INTEGER DEFAULT 90,
    revision_periodica_meses INTEGER DEFAULT 6,
    fecha_ultima_revision TIMESTAMPTZ,
    veces_usado INTEGER DEFAULT 0,
    veces_exitoso INTEGER DEFAULT 0,
    veces_fallido INTEGER DEFAULT 0,
    incidentes_asociados INTEGER DEFAULT 0,
    ultimo_uso TIMESTAMPTZ,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT cambio_modelo_estandar_pkey PRIMARY KEY (id_modelo),
    CONSTRAINT cambio_modelo_estandar_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: campana_inventario
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campana_inventario (
    id_campana INTEGER DEFAULT nextval('campana_inventario_id_campana_seq'::regclass) NOT NULL,
    codigo VARCHAR(40) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    alcance VARCHAR(200),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'ABIERTA'::character varying NOT NULL,
    id_responsable INTEGER,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT campana_inventario_pkey PRIMARY KEY (id_campana),
    CONSTRAINT campana_inventario_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: campana_inventario_item
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campana_inventario_item (
    id_item INTEGER DEFAULT nextval('campana_inventario_item_id_item_seq'::regclass) NOT NULL,
    id_campana INTEGER NOT NULL,
    id_activo INTEGER NOT NULL,
    estado_verificacion VARCHAR(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    id_usuario_verifica INTEGER,
    fecha_verificacion TIMESTAMPTZ,
    observacion TEXT,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT campana_inventario_item_pkey PRIMARY KEY (id_item)
);

-- ------------------------------------------------------------
-- Tabla: campo_personalizado
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campo_personalizado (
    id_campo INTEGER DEFAULT nextval('campo_personalizado_id_campo_seq'::regclass) NOT NULL,
    entidad VARCHAR(50) DEFAULT 'problema'::character varying NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    etiqueta VARCHAR(80) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(40) NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    propiedades JSONB DEFAULT '{}'::jsonb NOT NULL,
    formularios_visibles JSONB DEFAULT '["registro", "edicion"]'::jsonb NOT NULL,
    pestana_vista VARCHAR(50) DEFAULT 'detalle'::character varying,
    seccion VARCHAR(50) DEFAULT 'A. Identificación'::character varying,
    obligatorio VARCHAR(20) DEFAULT 'no'::character varying,
    reglas_condicionales JSONB DEFAULT '[]'::jsonb,
    orden INTEGER DEFAULT 1,
    veces_usado INTEGER DEFAULT 0,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT campo_personalizado_pkey PRIMARY KEY (id_campo),
    CONSTRAINT uq_campo_entidad_codigo UNIQUE (entidad, codigo)
);

-- ------------------------------------------------------------
-- Tabla: categoria_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categoria_ticket (
    id_categoria INTEGER DEFAULT nextval('categoria_ticket_id_categoria_seq'::regclass) NOT NULL,
    id_tipo_ticket INTEGER,
    nombre VARCHAR(60) NOT NULL,
    descripcion VARCHAR(200),
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    id_padre INTEGER,
    codigo_corto VARCHAR(10),
    sla_default_respuesta INTEGER DEFAULT 4 NOT NULL,
    sla_default_resolucion INTEGER DEFAULT 24 NOT NULL,
    CONSTRAINT categoria_ticket_pkey PRIMARY KEY (id_categoria)
);

-- ------------------------------------------------------------
-- Tabla: ci_relacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ci_relacion (
    id_ci_padre INTEGER NOT NULL,
    id_ci_hijo INTEGER NOT NULL,
    tipo_relacion VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT ci_relacion_pkey PRIMARY KEY (id_ci_padre, id_ci_hijo)
);

-- ------------------------------------------------------------
-- Tabla: cliente
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INTEGER DEFAULT nextval('cliente_id_cliente_seq'::regclass) NOT NULL,
    codigo_cliente VARCHAR(30) NOT NULL,
    tipo_documento VARCHAR(10) NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    razon_social VARCHAR(150),
    correo_electronico VARCHAR(100) NOT NULL,
    telefono VARCHAR(25),
    direccion VARCHAR(250),
    departamento_ciudad VARCHAR(50) DEFAULT 'Lima'::character varying,
    tipo_cliente VARCHAR(30) DEFAULT 'NATURAL'::character varying,
    estado_cliente VARCHAR(20) DEFAULT 'ACTIVO'::character varying,
    origen_registro VARCHAR(50) DEFAULT 'API_EXTERNA'::character varying,
    creado_por_grupo VARCHAR(100) DEFAULT 'GRUPO_FLOWDESK'::character varying,
    notas TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    fecha_modificacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT cliente_estado_cliente_check CHECK (((estado_cliente)::text = ANY ((ARRAY['ACTIVO'::character varying, 'INACTIVO'::character varying, 'SUSPENDIDO'::character varying])::text[]))),
    CONSTRAINT cliente_tipo_documento_check CHECK (((tipo_documento)::text = ANY ((ARRAY['DNI'::character varying, 'RUC'::character varying, 'CE'::character varying, 'PASAPORTE'::character varying])::text[]))),
    CONSTRAINT cliente_tipo_cliente_check CHECK (((tipo_cliente)::text = ANY ((ARRAY['NATURAL'::character varying, 'JURIDICO'::character varying, 'CORPORATIVO'::character varying])::text[]))),
    CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente),
    CONSTRAINT cliente_numero_documento_key UNIQUE (numero_documento),
    CONSTRAINT cliente_codigo_cliente_key UNIQUE (codigo_cliente)
);

-- ------------------------------------------------------------
-- Tabla: cmdb_actualizacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cmdb_actualizacion (
    id_actualizacion INTEGER DEFAULT nextval('cmdb_actualizacion_id_actualizacion_seq'::regclass) NOT NULL,
    id_cambio INTEGER,
    id_ci INTEGER,
    tipo_operacion VARCHAR(30) NOT NULL,
    detalle TEXT,
    estado VARCHAR(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    id_usuario_aplica INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_aplicacion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT cmdb_actualizacion_pkey PRIMARY KEY (id_actualizacion)
);

-- ------------------------------------------------------------
-- Tabla: cmdb_inexactitud
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cmdb_inexactitud (
    id_inexactitud INTEGER DEFAULT nextval('cmdb_inexactitud_id_inexactitud_seq'::regclass) NOT NULL,
    id_ci INTEGER,
    descripcion TEXT NOT NULL,
    id_usuario_reporta INTEGER,
    estado VARCHAR(20) DEFAULT 'REPORTADA'::character varying NOT NULL,
    id_usuario_asigna INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_resolucion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT cmdb_inexactitud_pkey PRIMARY KEY (id_inexactitud)
);

-- ------------------------------------------------------------
-- Tabla: cmdb_linea_base
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cmdb_linea_base (
    id_linea_base INTEGER DEFAULT nextval('cmdb_linea_base_id_linea_base_seq'::regclass) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    id_ci INTEGER,
    snapshot JSONB,
    total_elementos INTEGER DEFAULT 0 NOT NULL,
    id_usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT cmdb_linea_base_pkey PRIMARY KEY (id_linea_base)
);

-- ------------------------------------------------------------
-- Tabla: codigo_recuperacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS codigo_recuperacion (
    id_recuperacion INTEGER DEFAULT nextval('codigo_recuperacion_id_recuperacion_seq'::regclass) NOT NULL,
    id_usuario INTEGER NOT NULL,
    correo VARCHAR(60) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    token_sesion VARCHAR(255) NOT NULL,
    fecha_envio TIMESTAMPTZ DEFAULT now() NOT NULL,
    expira_codigo TIMESTAMPTZ NOT NULL,
    expira_sesion TIMESTAMPTZ NOT NULL,
    utilizado BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT codigo_recuperacion_pkey PRIMARY KEY (id_recuperacion)
);

-- ------------------------------------------------------------
-- Tabla: cola_correo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cola_correo (
    id_correo INTEGER DEFAULT nextval('cola_correo_id_correo_seq'::regclass) NOT NULL,
    destinatario TEXT NOT NULL,
    asunto TEXT NOT NULL,
    plantilla TEXT,
    estado TEXT DEFAULT 'pendiente'::text NOT NULL,
    intentos INTEGER DEFAULT 0 NOT NULL,
    ultimo_error TEXT,
    creado_en TIMESTAMPTZ DEFAULT now() NOT NULL,
    enviado_en TIMESTAMPTZ,
    CONSTRAINT cola_correo_pkey PRIMARY KEY (id_correo)
);

-- ------------------------------------------------------------
-- Tabla: colaborador_autorizacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS colaborador_autorizacion (
    id_autorizacion INTEGER DEFAULT nextval('colaborador_autorizacion_id_autorizacion_seq'::regclass) NOT NULL,
    id_usuario INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    otorgado_por INTEGER,
    activo BOOLEAN DEFAULT true NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT colaborador_autorizacion_pkey PRIMARY KEY (id_autorizacion),
    CONSTRAINT colaborador_autorizacion_usuario_tipo_key UNIQUE (id_usuario, tipo)
);

-- ------------------------------------------------------------
-- Tabla: comentario_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comentario_ticket (
    id_comentario INTEGER DEFAULT nextval('comentario_ticket_id_comentario_seq'::regclass) NOT NULL,
    id_ticket INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    comentario TEXT NOT NULL,
    es_interno BOOLEAN DEFAULT false NOT NULL,
    id_estado_cambiado INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT comentario_ticket_pkey PRIMARY KEY (id_comentario)
);

-- ------------------------------------------------------------
-- Tabla: configuracion_modulo_versiones
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion_modulo_versiones (
    id_version INTEGER DEFAULT nextval('configuracion_modulo_versiones_id_version_seq'::regclass) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    pantalla VARCHAR(50) NOT NULL,
    pestana VARCHAR(50) NOT NULL,
    numero_version INTEGER DEFAULT 1 NOT NULL,
    es_publicada BOOLEAN DEFAULT false NOT NULL,
    es_borrador BOOLEAN DEFAULT true NOT NULL,
    snapshot JSONB NOT NULL,
    diff JSONB,
    motivo TEXT,
    impacto_resumen TEXT,
    id_usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT configuracion_modulo_versiones_pkey PRIMARY KEY (id_version)
);

-- ------------------------------------------------------------
-- Tabla: configuracion_rfc
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion_rfc (
    id_configuracion SMALLINT DEFAULT 1 NOT NULL,
    perfiles_solicitantes INT2[] DEFAULT ARRAY[(2)::smallint, (8)::smallint] NOT NULL,
    exige_ci BOOLEAN DEFAULT false NOT NULL,
    exige_plan_pruebas BOOLEAN DEFAULT false NOT NULL,
    permite_emergencia BOOLEAN DEFAULT true NOT NULL,
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    tipos_rfc TEXT[] DEFAULT ARRAY['ESTANDAR'::text, 'NORMAL'::text, 'EMERGENCIA'::text] NOT NULL,
    campos_personalizados JSONB DEFAULT '[]'::jsonb NOT NULL,
    exige_rollback BOOLEAN DEFAULT true NOT NULL,
    duracion_maxima_horas SMALLINT DEFAULT 24 NOT NULL,
    CONSTRAINT configuracion_rfc_id_configuracion_check CHECK ((id_configuracion = 1)),
    CONSTRAINT configuracion_rfc_pkey PRIMARY KEY (id_configuracion)
);

-- ------------------------------------------------------------
-- Tabla: configuracion_sistema
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    clave VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    valor JSONB NOT NULL,
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (clave)
);

-- ------------------------------------------------------------
-- Tabla: contrato_ti
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contrato_ti (
    id_contrato INTEGER DEFAULT nextval('contrato_ti_id_contrato_seq'::regclass) NOT NULL,
    codigo VARCHAR(40) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    id_proveedor INTEGER,
    tipo VARCHAR(40),
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    monto NUMERIC(14, 2),
    moneda VARCHAR(10) DEFAULT 'PEN'::character varying,
    cobertura TEXT,
    renovacion_automatica BOOLEAN DEFAULT false NOT NULL,
    dias_aviso INTEGER DEFAULT 30 NOT NULL,
    estado VARCHAR(20) DEFAULT 'VIGENTE'::character varying NOT NULL,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT contrato_ti_pkey PRIMARY KEY (id_contrato),
    CONSTRAINT contrato_ti_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: departamento_empresa
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departamento_empresa (
    id_departamento_empresa INTEGER DEFAULT nextval('departamento_empresa_id_departamento_empresa_seq'::regclass) NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT departamento_empresa_pkey PRIMARY KEY (id_departamento_empresa),
    CONSTRAINT departamento_empresa_codigo_key UNIQUE (codigo),
    CONSTRAINT departamento_empresa_nombre_key UNIQUE (nombre)
);

-- ------------------------------------------------------------
-- Tabla: departamento_ti
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departamento_ti (
    id_departamento INTEGER DEFAULT nextval('departamento_ti_id_departamento_seq'::regclass) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    id_supervisor INTEGER,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    tiempo_ola_horas INTEGER DEFAULT 8 NOT NULL,
    tiempo_ola_critico_hrs INTEGER DEFAULT 2 NOT NULL,
    CONSTRAINT departamento_ti_pkey PRIMARY KEY (id_departamento),
    CONSTRAINT departamento_ti_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: ecab_decision
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ecab_decision (
    id_ecab INTEGER DEFAULT nextval('ecab_decision_id_ecab_seq'::regclass) NOT NULL,
    id_cambio INTEGER NOT NULL,
    decision VARCHAR(20) NOT NULL,
    condiciones TEXT,
    plazo_horas INTEGER,
    revision_retroactiva BOOLEAN DEFAULT true NOT NULL,
    id_aprobador INTEGER NOT NULL,
    fecha_decision TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT ecab_decision_decision_check CHECK (((decision)::text = ANY ((ARRAY['APROBADO'::character varying, 'RECHAZADO'::character varying])::text[]))),
    CONSTRAINT ecab_decision_pkey PRIMARY KEY (id_ecab)
);

-- ------------------------------------------------------------
-- Tabla: elemento_configuracion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS elemento_configuracion (
    id_ci INTEGER DEFAULT nextval('elemento_configuracion_id_ci_seq'::regclass) NOT NULL,
    id_activo INTEGER,
    codigo_ci VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo_ci VARCHAR(50) NOT NULL,
    ambiente VARCHAR(20) NOT NULL,
    ip_principal VARCHAR(45),
    version_software VARCHAR(50),
    criticidad VARCHAR(20) NOT NULL,
    id_departamento_soporte INTEGER,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    motivo_inactivacion TEXT,
    fecha_inactivacion TIMESTAMPTZ,
    usuario_inactivacion INTEGER,
    CONSTRAINT elemento_configuracion_ambiente_check CHECK (((ambiente)::text = ANY ((ARRAY['PRODUCCION'::character varying, 'QA'::character varying, 'DESARROLLO'::character varying])::text[]))),
    CONSTRAINT elemento_configuracion_criticidad_check CHECK (((criticidad)::text = ANY ((ARRAY['CRITICA'::character varying, 'ALTA'::character varying, 'MEDIA'::character varying, 'BAJA'::character varying])::text[]))),
    CONSTRAINT elemento_configuracion_pkey PRIMARY KEY (id_ci),
    CONSTRAINT elemento_configuracion_codigo_ci_key UNIQUE (codigo_ci)
);

-- ------------------------------------------------------------
-- Tabla: equipo_recurso_compartido
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipo_recurso_compartido (
    id_recurso INTEGER DEFAULT nextval('equipo_recurso_compartido_id_recurso_seq'::regclass) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    contenido JSONB DEFAULT '{}'::jsonb NOT NULL,
    id_departamento INTEGER,
    id_usuario_creacion INTEGER NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT equipo_recurso_compartido_pkey PRIMARY KEY (id_recurso)
);

-- ------------------------------------------------------------
-- Tabla: error_conocido
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS error_conocido (
    id_error_conocido INTEGER DEFAULT nextval('error_conocido_id_error_conocido_seq'::regclass) NOT NULL,
    id_problema INTEGER NOT NULL,
    codigo_kedb VARCHAR(30) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    sintomas TEXT NOT NULL,
    workaround TEXT NOT NULL,
    solucion_definitiva TEXT,
    fecha_publicacion TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT error_conocido_pkey PRIMARY KEY (id_error_conocido),
    CONSTRAINT error_conocido_codigo_kedb_key UNIQUE (codigo_kedb)
);

-- ------------------------------------------------------------
-- Tabla: estado_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estado_ticket (
    id_estado INTEGER DEFAULT nextval('estado_ticket_id_estado_seq'::regclass) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(30) NOT NULL,
    orden SMALLINT NOT NULL,
    es_terminal BOOLEAN DEFAULT false NOT NULL,
    pausa_sla BOOLEAN DEFAULT false NOT NULL,
    color VARCHAR(20) NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT estado_ticket_pkey PRIMARY KEY (id_estado),
    CONSTRAINT estado_ticket_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: evento_servicio
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evento_servicio (
    id_evento INTEGER DEFAULT nextval('evento_servicio_id_evento_seq'::regclass) NOT NULL,
    codigo_evento VARCHAR(30) NOT NULL,
    fuente VARCHAR(120) NOT NULL,
    titulo VARCHAR(180) NOT NULL,
    descripcion TEXT,
    severidad VARCHAR(12) DEFAULT 'MEDIA'::character varying NOT NULL,
    estado VARCHAR(16) DEFAULT 'ABIERTO'::character varying NOT NULL,
    id_ci INTEGER,
    id_ticket INTEGER,
    detectado_en TIMESTAMPTZ DEFAULT now() NOT NULL,
    reconocido_por INTEGER,
    reconocido_en TIMESTAMPTZ,
    cerrado_por INTEGER,
    cerrado_en TIMESTAMPTZ,
    usuario_creacion INTEGER NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT evento_servicio_estado_check CHECK (((estado)::text = ANY ((ARRAY['ABIERTO'::character varying, 'RECONOCIDO'::character varying, 'VINCULADO'::character varying, 'CERRADO'::character varying])::text[]))),
    CONSTRAINT evento_servicio_severidad_check CHECK (((severidad)::text = ANY ((ARRAY['BAJA'::character varying, 'MEDIA'::character varying, 'ALTA'::character varying, 'CRITICA'::character varying])::text[]))),
    CONSTRAINT evento_servicio_pkey PRIMARY KEY (id_evento),
    CONSTRAINT evento_servicio_codigo_evento_key UNIQUE (codigo_evento)
);

-- ------------------------------------------------------------
-- Tabla: impacto_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS impacto_ticket (
    id_impacto INTEGER DEFAULT nextval('impacto_ticket_id_impacto_seq'::regclass) NOT NULL,
    nivel SMALLINT NOT NULL,
    nombre VARCHAR(30) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT impacto_ticket_pkey PRIMARY KEY (id_impacto),
    CONSTRAINT impacto_ticket_nivel_key UNIQUE (nivel)
);

-- ------------------------------------------------------------
-- Tabla: importacion_activos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS importacion_activos (
    id_importacion INTEGER DEFAULT nextval('importacion_activos_id_importacion_seq'::regclass) NOT NULL,
    nombre_archivo VARCHAR(300),
    total_filas INTEGER DEFAULT 0 NOT NULL,
    filas_validas INTEGER DEFAULT 0 NOT NULL,
    filas_invalidas INTEGER DEFAULT 0 NOT NULL,
    estado VARCHAR(20) DEFAULT 'VALIDADO'::character varying NOT NULL,
    detalle JSONB,
    id_usuario INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_aplicacion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT importacion_activos_pkey PRIMARY KEY (id_importacion)
);

-- ------------------------------------------------------------
-- Tabla: incidente_mayor
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidente_mayor (
    id_incidente_mayor INTEGER DEFAULT nextval('incidente_mayor_id_incidente_mayor_seq'::regclass) NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    severidad VARCHAR(10) DEFAULT 'P1'::character varying NOT NULL,
    id_ticket INTEGER,
    id_departamento INTEGER,
    estado VARCHAR(20) DEFAULT 'ABIERTO'::character varying NOT NULL,
    sala_virtual TEXT,
    comunicados JSONB DEFAULT '[]'::jsonb NOT NULL,
    id_usuario_declara INTEGER NOT NULL,
    id_usuario_cierra INTEGER,
    fecha_declaracion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_cierre TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    id_problema INTEGER,
    involucrados JSONB DEFAULT '[]'::jsonb,
    CONSTRAINT incidente_mayor_pkey PRIMARY KEY (id_incidente_mayor),
    CONSTRAINT incidente_mayor_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: informe_auditoria
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS informe_auditoria (
    id_informe INTEGER DEFAULT nextval('informe_auditoria_id_informe_seq'::regclass) NOT NULL,
    codigo_informe VARCHAR(30) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    periodo VARCHAR(60) NOT NULL,
    hallazgos TEXT NOT NULL,
    recomendaciones TEXT,
    estado VARCHAR(20) DEFAULT 'BORRADOR'::character varying NOT NULL,
    id_auditor INTEGER NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_cierre TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT informe_auditoria_estado_check CHECK (((estado)::text = ANY ((ARRAY['BORRADOR'::character varying, 'EMITIDO'::character varying, 'CERRADO'::character varying])::text[]))),
    CONSTRAINT informe_auditoria_pkey PRIMARY KEY (id_informe),
    CONSTRAINT informe_auditoria_codigo_informe_key UNIQUE (codigo_informe)
);

-- ------------------------------------------------------------
-- Tabla: informe_evidencia
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS informe_evidencia (
    id_evidencia INTEGER DEFAULT nextval('informe_evidencia_id_evidencia_seq'::regclass) NOT NULL,
    id_informe INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    contenido TEXT,
    creado_por INTEGER,
    creado_en TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT informe_evidencia_pkey PRIMARY KEY (id_evidencia)
);

-- ------------------------------------------------------------
-- Tabla: licencia_asignacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS licencia_asignacion (
    id_asignacion INTEGER DEFAULT nextval('licencia_asignacion_id_asignacion_seq'::regclass) NOT NULL,
    id_licencia INTEGER NOT NULL,
    id_usuario INTEGER,
    id_activo INTEGER,
    fecha_asignacion DATE DEFAULT CURRENT_DATE NOT NULL,
    fecha_devolucion DATE,
    motivo_devolucion TEXT,
    id_usuario_registro INTEGER NOT NULL,
    CONSTRAINT licencia_asignacion_check1 CHECK (((fecha_devolucion IS NULL) OR (fecha_devolucion >= fecha_asignacion))),
    CONSTRAINT licencia_asignacion_check CHECK (((id_usuario IS NOT NULL) OR (id_activo IS NOT NULL))),
    CONSTRAINT licencia_asignacion_pkey PRIMARY KEY (id_asignacion)
);

-- ------------------------------------------------------------
-- Tabla: licencia_software
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS licencia_software (
    id_licencia INTEGER DEFAULT nextval('licencia_software_id_licencia_seq'::regclass) NOT NULL,
    nombre_software VARCHAR(150) NOT NULL,
    fabricante VARCHAR(100) NOT NULL,
    clave_licencia VARCHAR(255),
    tipo_licencia VARCHAR(50) NOT NULL,
    cantidad_adquirida INTEGER NOT NULL,
    cantidad_en_uso INTEGER DEFAULT 0 NOT NULL,
    fecha_vencimiento DATE,
    costo_anual NUMERIC(12, 2),
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT licencia_software_pkey PRIMARY KEY (id_licencia)
);

-- ------------------------------------------------------------
-- Tabla: log_acceso
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_acceso (
    id_log INTEGER DEFAULT nextval('log_acceso_id_log_seq'::regclass) NOT NULL,
    id_usuario INTEGER,
    correo_intento VARCHAR(40),
    exitoso BOOLEAN NOT NULL,
    ip VARCHAR(45),
    fecha TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT log_acceso_pkey PRIMARY KEY (id_log)
);

-- ------------------------------------------------------------
-- Tabla: log_auditoria_sistema
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_auditoria_sistema (
    id_log INTEGER DEFAULT nextval('log_auditoria_sistema_id_log_seq'::regclass) NOT NULL,
    id_usuario INTEGER,
    modulo VARCHAR(60) NOT NULL,
    accion VARCHAR(30) NOT NULL,
    descripcion TEXT NOT NULL,
    detalles JSONB,
    direccion_ip VARCHAR(45),
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT log_auditoria_sistema_pkey PRIMARY KEY (id_log)
);

-- ------------------------------------------------------------
-- Tabla: mantenimiento_activo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mantenimiento_activo (
    id_mantenimiento INTEGER DEFAULT nextval('mantenimiento_activo_id_mantenimiento_seq'::regclass) NOT NULL,
    id_activo INTEGER NOT NULL,
    tipo VARCHAR(20) DEFAULT 'PREVENTIVO'::character varying NOT NULL,
    descripcion TEXT,
    proveedor VARCHAR(200),
    fecha_programada DATE,
    fecha_ejecucion DATE,
    costo NUMERIC(12, 2),
    estado VARCHAR(20) DEFAULT 'PROGRAMADO'::character varying NOT NULL,
    id_usuario_responsable INTEGER,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT mantenimiento_activo_pkey PRIMARY KEY (id_mantenimiento)
);

-- ------------------------------------------------------------
-- Tabla: matriz_prioridad_institucional
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matriz_prioridad_institucional (
    id_celda INTEGER DEFAULT nextval('matriz_prioridad_institucional_id_celda_seq'::regclass) NOT NULL,
    entidad VARCHAR(50) DEFAULT 'compartida'::character varying NOT NULL,
    nivel_impacto INTEGER NOT NULL,
    nivel_urgencia INTEGER NOT NULL,
    id_prioridad INTEGER NOT NULL,
    fecha_modificacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT matriz_prioridad_institucional_nivel_impacto_check CHECK (((nivel_impacto >= 1) AND (nivel_impacto <= 3))),
    CONSTRAINT matriz_prioridad_institucional_nivel_urgencia_check CHECK (((nivel_urgencia >= 1) AND (nivel_urgencia <= 3))),
    CONSTRAINT matriz_prioridad_institucional_pkey PRIMARY KEY (id_celda),
    CONSTRAINT uq_matriz_entidad_celda UNIQUE (entidad, nivel_impacto, nivel_urgencia)
);

-- ------------------------------------------------------------
-- Tabla: modelo_activo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modelo_activo (
    id_modelo INTEGER DEFAULT nextval('modelo_activo_id_modelo_seq'::regclass) NOT NULL,
    id_tipo_activo INTEGER NOT NULL,
    fabricante VARCHAR(120) NOT NULL,
    nombre_modelo VARCHAR(160) NOT NULL,
    atributos JSONB DEFAULT '[]'::jsonb NOT NULL,
    vida_util_meses SMALLINT,
    metodo_depreciacion VARCHAR(20) DEFAULT 'LINEAL'::character varying NOT NULL,
    valor_residual_pct NUMERIC(5, 2) DEFAULT 0 NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT modelo_activo_valor_residual_pct_check CHECK (((valor_residual_pct >= (0)::numeric) AND (valor_residual_pct <= (100)::numeric))),
    CONSTRAINT modelo_activo_vida_util_meses_check CHECK ((vida_util_meses > 0)),
    CONSTRAINT modelo_activo_metodo_depreciacion_check CHECK (((metodo_depreciacion)::text = ANY ((ARRAY['LINEAL'::character varying, 'NINGUNA'::character varying])::text[]))),
    CONSTRAINT modelo_activo_pkey PRIMARY KEY (id_modelo),
    CONSTRAINT modelo_activo_id_tipo_activo_fabricante_nombre_modelo_key UNIQUE (id_tipo_activo, fabricante, nombre_modelo)
);

-- ------------------------------------------------------------
-- Tabla: motivo_espera_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS motivo_espera_ticket (
    id_motivo_espera INTEGER DEFAULT nextval('motivo_espera_ticket_id_motivo_espera_seq'::regclass) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT motivo_espera_ticket_pkey PRIMARY KEY (id_motivo_espera)
);

-- ------------------------------------------------------------
-- Tabla: notificaciones
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER DEFAULT nextval('notificaciones_id_seq'::regclass) NOT NULL,
    usuario_id INTEGER NOT NULL,
    evento VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    entidad_tipo VARCHAR(50) NOT NULL,
    entidad_id INTEGER,
    url_destino VARCHAR(255) NOT NULL,
    leida BOOLEAN DEFAULT false NOT NULL,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    leida_en TIMESTAMP,
    CONSTRAINT notificaciones_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabla: opciones_menu
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opciones_menu (
    id_opcion_menu INTEGER DEFAULT nextval('opciones_menu_id_opcion_menu_seq'::regclass) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    url_menu VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    id_padre INTEGER,
    nivel SMALLINT DEFAULT 1 NOT NULL,
    orden SMALLINT DEFAULT 1 NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    permiso_requerido VARCHAR(100),
    modulo_requerido VARCHAR(50),
    condicion_nivel JSONB,
    contador_clave VARCHAR(50),
    bloqueado BOOLEAN DEFAULT false,
    abierto_por_defecto BOOLEAN DEFAULT false,
    CONSTRAINT opciones_menu_nivel_check CHECK (((nivel >= 1) AND (nivel <= 5))),
    CONSTRAINT opciones_menu_pkey PRIMARY KEY (id_opcion_menu)
);

-- ------------------------------------------------------------
-- Tabla: opciones_menu_perfiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opciones_menu_perfiles (
    id_opcion_menu INTEGER NOT NULL,
    id_perfil INTEGER NOT NULL,
    orden SMALLINT DEFAULT 1 NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT opciones_menu_perfiles_pkey PRIMARY KEY (id_opcion_menu, id_perfil)
);

-- ------------------------------------------------------------
-- Tabla: opciones_menu_vistas_perfiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opciones_menu_vistas_perfiles (
    id_opcion_menu INTEGER NOT NULL,
    id_perfil INTEGER NOT NULL,
    vista VARCHAR(100) NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT opciones_menu_vistas_perfiles_pkey PRIMARY KEY (id_opcion_menu, id_perfil, vista)
);

-- ------------------------------------------------------------
-- Tabla: perfiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfiles (
    id_perfil INTEGER DEFAULT nextval('perfiles_id_perfil_seq'::regclass) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(500),
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT perfiles_pkey PRIMARY KEY (id_perfil)
);

-- ------------------------------------------------------------
-- Tabla: periodos_congelamiento
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS periodos_congelamiento (
    id INTEGER DEFAULT nextval('periodos_congelamiento_id_seq'::regclass) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    motivo VARCHAR(100) DEFAULT 'cierre_contable'::character varying NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    recurrente_anual BOOLEAN DEFAULT false NOT NULL,
    mes_dia_inicio VARCHAR(10),
    mes_dia_fin VARCHAR(10),
    alcance_tipo VARCHAR(50) DEFAULT 'toda_la_organizacion'::character varying NOT NULL,
    id_servicios JSONB DEFAULT '[]'::jsonb,
    id_ci JSONB DEFAULT '[]'::jsonb,
    id_departamentos JSONB DEFAULT '[]'::jsonb,
    severidad VARCHAR(50) DEFAULT 'bloqueo_total'::character varying NOT NULL,
    tipos_exentos JSONB DEFAULT '["emergencia"]'::jsonb,
    dias_aviso_anticipado INTEGER DEFAULT 7 NOT NULL,
    color VARCHAR(30) DEFAULT '#dc2626'::character varying NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_modificacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT periodos_congelamiento_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabla: plantilla_problema
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plantilla_problema (
    id_plantilla INTEGER DEFAULT nextval('plantilla_problema_id_plantilla_seq'::regclass) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true NOT NULL,
    id_categoria INTEGER,
    perfiles_visibles JSONB DEFAULT '[]'::jsonb,
    valores_prellenados JSONB DEFAULT '{}'::jsonb NOT NULL,
    campos_bloqueados JSONB DEFAULT '{}'::jsonb NOT NULL,
    tareas_incluidas JSONB DEFAULT '[]'::jsonb NOT NULL,
    veces_usada INTEGER DEFAULT 0 NOT NULL,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    fecha_modificacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT plantilla_problema_pkey PRIMARY KEY (id_plantilla),
    CONSTRAINT plantilla_problema_nombre_key UNIQUE (nombre)
);

-- ------------------------------------------------------------
-- Tabla: preferencia_notificacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preferencia_notificacion (
    id_usuario INTEGER NOT NULL,
    correo_tickets BOOLEAN DEFAULT true NOT NULL,
    correo_cambios BOOLEAN DEFAULT true NOT NULL,
    correo_problemas BOOLEAN DEFAULT true NOT NULL,
    correo_conocimiento BOOLEAN DEFAULT false NOT NULL,
    resumen_diario BOOLEAN DEFAULT false NOT NULL,
    canal_preferido VARCHAR(20) DEFAULT 'CORREO'::character varying NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT preferencia_notificacion_pkey PRIMARY KEY (id_usuario)
);

-- ------------------------------------------------------------
-- Tabla: prioridad_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prioridad_ticket (
    id_prioridad INTEGER DEFAULT nextval('prioridad_ticket_id_prioridad_seq'::regclass) NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    nombre VARCHAR(30) NOT NULL,
    nivel SMALLINT NOT NULL,
    tiempo_resolucion_horas INTEGER NOT NULL,
    tiempo_primera_respuesta_hrs INTEGER NOT NULL,
    color VARCHAR(20) NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT prioridad_ticket_pkey PRIMARY KEY (id_prioridad),
    CONSTRAINT prioridad_ticket_nivel_key UNIQUE (nivel),
    CONSTRAINT prioridad_ticket_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema (
    id_problema INTEGER DEFAULT nextval('problema_id_problema_seq'::regclass) NOT NULL,
    codigo_problema VARCHAR(30) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    id_impacto INTEGER,
    id_urgencia INTEGER,
    id_prioridad INTEGER,
    id_estado INTEGER DEFAULT 1 NOT NULL,
    causa_raiz TEXT,
    metodo_analisis VARCHAR(50) DEFAULT '5_WHYS'::character varying,
    workaround TEXT,
    es_error_conocido BOOLEAN DEFAULT false NOT NULL,
    id_ci_afectado INTEGER,
    id_usuario_asignado INTEGER,
    id_departamento INTEGER,
    solucion_definitiva TEXT,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT problema_pkey PRIMARY KEY (id_problema),
    CONSTRAINT problema_codigo_problema_key UNIQUE (codigo_problema)
);

-- ------------------------------------------------------------
-- Tabla: problema_analisis
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_analisis (
    id_analisis INTEGER DEFAULT nextval('problema_analisis_id_analisis_seq'::regclass) NOT NULL,
    id_problema INTEGER NOT NULL,
    metodo VARCHAR(40) DEFAULT '5_WHYS'::character varying NOT NULL,
    cinco_porques JSONB,
    ishikawa JSONB,
    linea_tiempo JSONB,
    conclusion TEXT,
    id_usuario INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT problema_analisis_pkey PRIMARY KEY (id_analisis)
);

-- ------------------------------------------------------------
-- Tabla: problema_categoria
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_categoria (
    id_categoria INTEGER DEFAULT nextval('problema_categoria_id_categoria_seq'::regclass) NOT NULL,
    id_padre INTEGER,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#2563eb'::character varying,
    orden INTEGER DEFAULT 1 NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    es_sistema BOOLEAN DEFAULT false NOT NULL,
    id_departamento_defecto INTEGER,
    id_usuario_defecto INTEGER,
    id_servicio_defecto INTEGER,
    id_plantilla_defecto INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_categoria_pkey PRIMARY KEY (id_categoria),
    CONSTRAINT problema_categoria_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_causa_raiz_categoria
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_causa_raiz_categoria (
    id_causa_categoria INTEGER DEFAULT nextval('problema_causa_raiz_categoria_id_causa_categoria_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#d97706'::character varying,
    orden INTEGER DEFAULT 1 NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    es_sistema BOOLEAN DEFAULT false NOT NULL,
    sugiere_rfc BOOLEAN DEFAULT false NOT NULL,
    descripcion_ejemplo TEXT,
    CONSTRAINT problema_causa_raiz_categoria_pkey PRIMARY KEY (id_causa_categoria),
    CONSTRAINT problema_causa_raiz_categoria_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_cierre_aprobacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_cierre_aprobacion (
    id_cierre INTEGER DEFAULT nextval('problema_cierre_aprobacion_id_cierre_seq'::regclass) NOT NULL,
    id_problema INTEGER NOT NULL,
    decision VARCHAR(20) NOT NULL,
    riesgo_aceptado TEXT,
    comentario TEXT,
    id_aprobador INTEGER NOT NULL,
    fecha_decision TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT problema_cierre_aprobacion_decision_check CHECK (((decision)::text = ANY ((ARRAY['APROBADO'::character varying, 'RECHAZADO'::character varying])::text[]))),
    CONSTRAINT problema_cierre_aprobacion_pkey PRIMARY KEY (id_cierre)
);

-- ------------------------------------------------------------
-- Tabla: problema_codigo_cierre
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_codigo_cierre (
    id_codigo_cierre INTEGER DEFAULT nextval('problema_codigo_cierre_id_codigo_cierre_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#059669'::character varying,
    orden INTEGER DEFAULT 1 NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    es_sistema BOOLEAN DEFAULT false NOT NULL,
    requiere_solucion_permanente BOOLEAN DEFAULT false NOT NULL,
    requiere_rfc_cerrada BOOLEAN DEFAULT false NOT NULL,
    requiere_error_conocido BOOLEAN DEFAULT false NOT NULL,
    cuenta_como_exito BOOLEAN DEFAULT true NOT NULL,
    requiere_aprobacion_supervisor BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT problema_codigo_cierre_pkey PRIMARY KEY (id_codigo_cierre),
    CONSTRAINT problema_codigo_cierre_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_config_cmdb
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_config_cmdb (
    id_config INTEGER DEFAULT 1 NOT NULL,
    herencia_ci_desde_incidentes BOOLEAN DEFAULT true NOT NULL,
    validar_relacion_ci_servicio VARCHAR(30) DEFAULT 'avisar'::character varying NOT NULL,
    clases_ci_permitidas JSONB DEFAULT '[]'::jsonb NOT NULL,
    maximo_ci_por_problema INTEGER DEFAULT 100 NOT NULL,
    mostrar_marca_problema_abierto BOOLEAN DEFAULT true NOT NULL,
    mostrar_marca_ke_vigente BOOLEAN DEFAULT true NOT NULL,
    sugerir_impacto_alto_si_criticidad_mayor VARCHAR(30) DEFAULT 'CRITICO'::character varying,
    servicio_critico_activa_problema_mayor BOOLEAN DEFAULT true NOT NULL,
    accion_baja_ci_con_problemas VARCHAR(30) DEFAULT 'avisar_responsable'::character varying NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT problema_config_cmdb_pkey PRIMARY KEY (id_config)
);

-- ------------------------------------------------------------
-- Tabla: problema_config_conocimiento
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_config_conocimiento (
    id_config INTEGER DEFAULT 1 NOT NULL,
    generar_al_publicar_ke BOOLEAN DEFAULT true NOT NULL,
    generar_al_resolver BOOLEAN DEFAULT true NOT NULL,
    generar_al_cerrar BOOLEAN DEFAULT false NOT NULL,
    solo_manual BOOLEAN DEFAULT false NOT NULL,
    tipo_articulo_por_evento JSONB DEFAULT '{"cerrar": "Guía de resolución y lecciones aprendidas", "resolver": "Solución definitiva", "publicar_ke": "Error conocido (workaround)"}'::jsonb NOT NULL,
    plantilla_mapeo JSONB DEFAULT '{"causa": "causa_raiz", "sintomas": "descripcion", "solucion": "solucion_permanente", "referencia": "enlace_problema", "workaround": "workaround", "servicios_ci": "lista_afectados", "palabras_clave": "categoria_mas_servicio"}'::jsonb NOT NULL,
    audiencia_defecto VARCHAR(50) DEFAULT 'segun_error_conocido'::character varying,
    id_categoria_defecto INTEGER DEFAULT 1,
    responsable_revision VARCHAR(50) DEFAULT 'responsable_categoria'::character varying NOT NULL,
    articulo_obligatorio_para_cerrar BOOLEAN DEFAULT false NOT NULL,
    excepciones_codigos_cierre JSONB DEFAULT '["Cerrado – no reproducible", "Cerrado – duplicado"]'::jsonb NOT NULL,
    estado_inicial_borrador VARCHAR(30) DEFAULT 'Borrador'::character varying NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT problema_config_conocimiento_pkey PRIMARY KEY (id_config)
);

-- ------------------------------------------------------------
-- Tabla: problema_config_incidentes_vinculados
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_config_incidentes_vinculados (
    id_config INTEGER DEFAULT 1 NOT NULL,
    tipos_vinculo JSONB DEFAULT '["Causado por el problema", "Relacionado", "Posible causa"]'::jsonb NOT NULL,
    estados_incidente_permitidos JSONB DEFAULT '["NUEVO", "ASIGNADO", "EN_PROCESO", "PENDIENTE_TERCERO", "PENDIENTE_USUARIO"]'::jsonb NOT NULL,
    max_incidentes_por_problema INTEGER DEFAULT 500 NOT NULL,
    permitir_vinculo_multiple_abierto BOOLEAN DEFAULT false NOT NULL,
    heredar_servicio BOOLEAN DEFAULT true NOT NULL,
    heredar_ci BOOLEAN DEFAULT true NOT NULL,
    heredar_categoria BOOLEAN DEFAULT true NOT NULL,
    perfiles_desvincular JSONB DEFAULT '[1, 10]'::jsonb NOT NULL,
    motivo_desvincular_obligatorio BOOLEAN DEFAULT true NOT NULL,
    mostrar_banner_incidente BOOLEAN DEFAULT true NOT NULL,
    mostrar_workaround_incidente BOOLEAN DEFAULT true NOT NULL,
    audiencia_workaround_mesa BOOLEAN DEFAULT true NOT NULL,
    audiencia_workaround_tecnicos BOOLEAN DEFAULT true NOT NULL,
    audiencia_workaround_solicitante BOOLEAN DEFAULT false NOT NULL,
    sugerir_problema_registro_incidente BOOLEAN DEFAULT true NOT NULL,
    accion_error_conocido VARCHAR(50) DEFAULT 'agregar_nota_workaround'::character varying NOT NULL,
    politica_cierre VARCHAR(50) DEFAULT 'C_resolucion_asistida'::character varying NOT NULL,
    codigo_resolucion_masiva VARCHAR(80) DEFAULT 'Solventado por resolución de problema'::character varying,
    plantilla_nota_masiva TEXT DEFAULT 'Incidente resuelto automáticamente mediante la solución permanente del problema {problema_id}: {solucion}'::text,
    notificar_solicitantes_masiva BOOLEAN DEFAULT true NOT NULL,
    exigir_sin_incidentes_abiertos BOOLEAN DEFAULT true NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT problema_config_incidentes_vinculados_pkey PRIMARY KEY (id_config)
);

-- ------------------------------------------------------------
-- Tabla: problema_config_kedb
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_config_kedb (
    id_config INTEGER DEFAULT 1 NOT NULL,
    req_workaround BOOLEAN DEFAULT true NOT NULL,
    req_sintomas BOOLEAN DEFAULT true NOT NULL,
    req_servicio_ci BOOLEAN DEFAULT true NOT NULL,
    req_causa_raiz BOOLEAN DEFAULT false NOT NULL,
    req_instrucciones_paso_paso BOOLEAN DEFAULT true NOT NULL,
    req_aprobacion_gestor BOOLEAN DEFAULT true NOT NULL,
    perfil_aprobador INTEGER DEFAULT 10,
    estados_ciclo JSONB DEFAULT '["Borrador", "En revisión", "Publicado", "Retirado"]'::jsonb NOT NULL,
    publicacion_directa_perfiles JSONB DEFAULT '[1, 10]'::jsonb NOT NULL,
    revision_periodica_meses INTEGER DEFAULT 6 NOT NULL,
    recordatorio_dias_antes INTEGER DEFAULT 15 NOT NULL,
    pasar_a_revision_si_vence BOOLEAN DEFAULT true NOT NULL,
    retiro_automatico_solucion_permanente BOOLEAN DEFAULT true NOT NULL,
    audiencia_mesa_servicio BOOLEAN DEFAULT true NOT NULL,
    audiencia_tecnicos_todos BOOLEAN DEFAULT true NOT NULL,
    audiencia_tecnicos_grupo BOOLEAN DEFAULT true NOT NULL,
    audiencia_autoservicio_portal BOOLEAN DEFAULT false NOT NULL,
    sugerir_ke_en_incidente BOOLEAN DEFAULT true NOT NULL,
    peso_servicio INTEGER DEFAULT 4 NOT NULL,
    peso_categoria INTEGER DEFAULT 3 NOT NULL,
    peso_ci INTEGER DEFAULT 5 NOT NULL,
    peso_clase_ci INTEGER DEFAULT 2 NOT NULL,
    peso_palabras_titulo INTEGER DEFAULT 4 NOT NULL,
    peso_palabras_descripcion INTEGER DEFAULT 3 NOT NULL,
    umbral_minimo_coincidencia INTEGER DEFAULT 60 NOT NULL,
    maximo_sugerencias INTEGER DEFAULT 5 NOT NULL,
    campos_ke JSONB DEFAULT '[{"tipo": "sistema", "codigo": "id_ke", "nombre": "ID de Error Conocido", "obligatorio": true}, {"tipo": "texto", "codigo": "titulo", "nombre": "Título del Error Conocido", "obligatorio": true}, {"tipo": "textarea", "codigo": "sintomas", "nombre": "Síntomas y Detección", "obligatorio": true}, {"tipo": "textarea", "codigo": "causa", "nombre": "Causa Raíz", "obligatorio": false}, {"tipo": "textarea", "codigo": "workaround", "nombre": "Solución Temporal (Workaround)", "obligatorio": true}, {"tipo": "textarea", "codigo": "solucion_definitiva", "nombre": "Solución Permanente Planificada", "obligatorio": false}, {"tipo": "relacion", "codigo": "servicios_ci", "nombre": "Servicios y Elementos de Configuración", "obligatorio": true}, {"tipo": "lista", "codigo": "audiencia", "nombre": "Audiencia Destino", "obligatorio": true}, {"tipo": "estado", "codigo": "estado", "nombre": "Estado de Ciclo KEDB", "obligatorio": true}, {"tipo": "usuario", "codigo": "responsable", "nombre": "Especialista Responsable", "obligatorio": true}, {"tipo": "fecha", "codigo": "proxima_revision", "nombre": "Fecha de Próxima Revisión", "obligatorio": true}, {"tipo": "relacion", "codigo": "problema_origen", "nombre": "Problema de Origen", "obligatorio": true}]'::jsonb NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT problema_config_kedb_pkey PRIMARY KEY (id_config)
);

-- ------------------------------------------------------------
-- Tabla: problema_config_mayor
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_config_mayor (
    id INTEGER DEFAULT nextval('problema_config_mayor_id_seq'::regclass) NOT NULL,
    aplicar_paquete_tareas BOOLEAN DEFAULT true NOT NULL,
    exigir_revision_cierre BOOLEAN DEFAULT true NOT NULL,
    plazo_revision_dias INTEGER DEFAULT 10 NOT NULL,
    participantes_roles JSONB DEFAULT '["gestor_problemas", "supervisor", "responsable"]'::jsonb NOT NULL,
    aprobacion_cierre_perfil INTEGER,
    notificar_direccion_al_detectar BOOLEAN DEFAULT true NOT NULL,
    notificar_direccion_al_cerrar BOOLEAN DEFAULT true NOT NULL,
    generar_informe_pdf BOOLEAN DEFAULT true NOT NULL,
    plantilla_preguntas JSONB DEFAULT '[{"id": "q1", "tipo": "texto_largo", "pregunta": "¿Qué ocurrió y cuál fue el impacto en el negocio?", "obligatoria": true}, {"id": "q2", "tipo": "cronologia", "pregunta": "Cronología detallada de la ocurrencia e investigación", "obligatoria": true}, {"id": "q3", "tipo": "texto_largo", "pregunta": "Causa raíz confirmada", "obligatoria": true}, {"id": "q4", "tipo": "texto_largo", "pregunta": "¿Qué funcionó bien durante la atención?", "obligatoria": true}, {"id": "q5", "tipo": "texto_largo", "pregunta": "¿Qué aspectos deben mejorar para evitar recurrencias?", "obligatoria": true}, {"id": "q6", "tipo": "tabla_acciones", "pregunta": "Acciones preventivas acordadas", "obligatoria": true}, {"id": "q7", "tipo": "si_no", "pregunta": "¿Se actualizó la CMDB?", "obligatoria": true}, {"id": "q8", "tipo": "si_no", "pregunta": "¿Se publicó conocimiento o lecciones aprendidas?", "obligatoria": true}]'::jsonb NOT NULL,
    fecha_modificacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_config_mayor_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabla: problema_config_reapertura
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_config_reapertura (
    id INTEGER DEFAULT nextval('problema_config_reapertura_id_seq'::regclass) NOT NULL,
    permitir_reapertura BOOLEAN DEFAULT true NOT NULL,
    ventana_dias_resuelto INTEGER DEFAULT 30 NOT NULL,
    ventana_dias_cerrado INTEGER DEFAULT 15 NOT NULL,
    perfiles_autorizados JSONB DEFAULT '[1, 10, 4]'::jsonb NOT NULL,
    estado_destino_id INTEGER,
    motivo_obligatorio BOOLEAN DEFAULT true NOT NULL,
    max_reaperturas INTEGER DEFAULT 2 NOT NULL,
    reinicio_relojes VARCHAR(20) DEFAULT 'continuar'::character varying NOT NULL,
    estrategia_asignacion VARCHAR(20) DEFAULT 'mantener'::character varying NOT NULL,
    motivos_catalogo JSONB DEFAULT '["El incidente reaparece", "La solución no funcionó", "Cambio revertido", "Otro"]'::jsonb NOT NULL,
    fecha_modificacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_config_reapertura_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabla: problema_config_rfc
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_config_rfc (
    id_config INTEGER DEFAULT 1 NOT NULL,
    exigir_rfc_para_pendiente_cambio BOOLEAN DEFAULT true NOT NULL,
    permitir_varias_rfc BOOLEAN DEFAULT true NOT NULL,
    maximo_rfc INTEGER DEFAULT 5 NOT NULL,
    tipo_cambio_sugerido VARCHAR(30) DEFAULT 'Normal'::character varying NOT NULL,
    regla_p1_riesgo_recurrencia BOOLEAN DEFAULT true NOT NULL,
    mapeo_campos JSONB DEFAULT '[{"origen": "titulo", "destino": "titulo", "campo_rfc": "Título del cambio", "campo_problema": "Título"}, {"origen": "descripcion", "destino": "justificacion", "campo_rfc": "Motivo y Justificación", "campo_problema": "Descripción"}, {"origen": "solucion_permanente", "destino": "descripcion", "campo_rfc": "Descripción detallada del cambio", "campo_problema": "Solución permanente"}, {"origen": "servicio", "destino": "servicio", "campo_rfc": "Servicio de TI afectado", "campo_problema": "Servicio afectado"}, {"origen": "ci_afectados", "destino": "activos_ci", "campo_rfc": "Activos y Elementos de Configuración", "campo_problema": "CI afectados"}, {"origen": "prioridad", "destino": "urgencia", "campo_rfc": "Urgencia sugerida del cambio", "campo_problema": "Prioridad del problema"}, {"origen": "codigo_problema", "destino": "origen_cambio", "campo_rfc": "Origen = Problema (vínculo trazable)", "campo_problema": "Código de problema"}]'::jsonb NOT NULL,
    exigir_todas_rfc_implementadas_exito BOOLEAN DEFAULT true NOT NULL,
    accion_rfc_fallida VARCHAR(50) DEFAULT 'volver_causa_raiz'::character varying NOT NULL,
    crear_tarea_rfc_fallida BOOLEAN DEFAULT true NOT NULL,
    plantilla_tarea_rfc_fallida VARCHAR(255) DEFAULT 'Evaluar alternativa técnica tras rechazo/falla de cambio RFC-{rfc_id}'::character varying,
    notificar_roles_rfc_fallida JSONB DEFAULT '["gestor_problemas", "responsable_problema"]'::jsonb NOT NULL,
    pasar_automatico_a_resuelto BOOLEAN DEFAULT true NOT NULL,
    verificacion_post_cambio_dias INTEGER DEFAULT 7 NOT NULL,
    sincronizacion_tiempo_real BOOLEAN DEFAULT true NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT problema_config_rfc_pkey PRIMARY KEY (id_config)
);

-- ------------------------------------------------------------
-- Tabla: problema_criterio_mayor
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_criterio_mayor (
    id_criterio INTEGER DEFAULT nextval('problema_criterio_mayor_id_criterio_seq'::regclass) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    parametros JSONB DEFAULT '{}'::jsonb NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_criterio_mayor_pkey PRIMARY KEY (id_criterio)
);

-- ------------------------------------------------------------
-- Tabla: problema_estado
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_estado (
    id_estado INTEGER DEFAULT nextval('problema_estado_id_estado_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    color VARCHAR(20) DEFAULT '#3b82f6'::character varying NOT NULL,
    reloj_diagnostico VARCHAR(20) DEFAULT 'corre'::character varying NOT NULL,
    reloj_resolucion VARCHAR(20) DEFAULT 'corre'::character varying NOT NULL,
    cuenta_como_abierto BOOLEAN DEFAULT true NOT NULL,
    permite_edicion VARCHAR(30) DEFAULT 'si'::character varying NOT NULL,
    descripcion TEXT,
    orden INTEGER DEFAULT 1 NOT NULL,
    es_sistema BOOLEAN DEFAULT false NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_estado_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['inicial'::character varying, 'en_curso'::character varying, 'en_pausa'::character varying, 'resuelto'::character varying, 'final'::character varying])::text[]))),
    CONSTRAINT problema_estado_permite_edicion_check CHECK (((permite_edicion)::text = ANY ((ARRAY['si'::character varying, 'solo_comentarios'::character varying, 'no'::character varying])::text[]))),
    CONSTRAINT problema_estado_reloj_diagnostico_check CHECK (((reloj_diagnostico)::text = ANY ((ARRAY['corre'::character varying, 'pausado'::character varying, 'detenido'::character varying])::text[]))),
    CONSTRAINT problema_estado_reloj_resolucion_check CHECK (((reloj_resolucion)::text = ANY ((ARRAY['corre'::character varying, 'pausado'::character varying, 'detenido'::character varying])::text[]))),
    CONSTRAINT problema_estado_pkey PRIMARY KEY (id_estado),
    CONSTRAINT problema_estado_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_incidente
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_incidente (
    id_problema INTEGER NOT NULL,
    id_ticket INTEGER NOT NULL,
    fecha_asociacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_incidente_pkey PRIMARY KEY (id_problema, id_ticket)
);

-- ------------------------------------------------------------
-- Tabla: problema_metodo_analisis
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_metodo_analisis (
    id_metodo INTEGER DEFAULT nextval('problema_metodo_analisis_id_metodo_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#6366f1'::character varying,
    orden INTEGER DEFAULT 1 NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    es_sistema BOOLEAN DEFAULT false NOT NULL,
    plantilla_ayuda TEXT,
    CONSTRAINT problema_metodo_analisis_pkey PRIMARY KEY (id_metodo),
    CONSTRAINT problema_metodo_analisis_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_motivo_cancelacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_motivo_cancelacion (
    id_motivo_cancelacion INTEGER DEFAULT nextval('problema_motivo_cancelacion_id_motivo_cancelacion_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#dc2626'::character varying,
    orden INTEGER DEFAULT 1 NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    es_sistema BOOLEAN DEFAULT false NOT NULL,
    requiere_aprobacion BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT problema_motivo_cancelacion_pkey PRIMARY KEY (id_motivo_cancelacion),
    CONSTRAINT problema_motivo_cancelacion_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_motivo_espera
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_motivo_espera (
    id_motivo_espera INTEGER DEFAULT nextval('problema_motivo_espera_id_motivo_espera_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#f97316'::character varying,
    orden INTEGER DEFAULT 1 NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    es_sistema BOOLEAN DEFAULT false NOT NULL,
    pausa_reloj_resolucion BOOLEAN DEFAULT true NOT NULL,
    requiere_fecha_reanudacion BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT problema_motivo_espera_pkey PRIMARY KEY (id_motivo_espera),
    CONSTRAINT problema_motivo_espera_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_objetivo_tiempo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_objetivo_tiempo (
    id_objetivo INTEGER DEFAULT nextval('problema_objetivo_tiempo_id_objetivo_seq'::regclass) NOT NULL,
    id_prioridad INTEGER NOT NULL,
    primera_respuesta_horas INTEGER DEFAULT 4 NOT NULL,
    diagnostico_horas INTEGER DEFAULT 72 NOT NULL,
    resolucion_total_horas INTEGER DEFAULT 240 NOT NULL,
    descripcion_operativa TEXT,
    umbrales_alerta JSONB DEFAULT '[50, 75, 90]'::jsonb NOT NULL,
    fecha_modificacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_objetivo_tiempo_pkey PRIMARY KEY (id_objetivo),
    CONSTRAINT problema_objetivo_tiempo_id_prioridad_key UNIQUE (id_prioridad)
);

-- ------------------------------------------------------------
-- Tabla: problema_origen
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_origen (
    id_origen INTEGER DEFAULT nextval('problema_origen_id_origen_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#475569'::character varying,
    orden INTEGER DEFAULT 1 NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    es_sistema BOOLEAN DEFAULT false NOT NULL,
    requiere_incidentes BOOLEAN DEFAULT false NOT NULL,
    es_proactivo BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT problema_origen_pkey PRIMARY KEY (id_origen),
    CONSTRAINT problema_origen_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_regla_asignacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_regla_asignacion (
    id_regla INTEGER DEFAULT nextval('problema_regla_asignacion_id_regla_seq'::regclass) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    orden INTEGER DEFAULT 1 NOT NULL,
    activa BOOLEAN DEFAULT true NOT NULL,
    evento_evaluacion VARCHAR(40) DEFAULT 'al_registrar'::character varying NOT NULL,
    condiciones JSONB DEFAULT '[]'::jsonb NOT NULL,
    id_departamento_destino INTEGER,
    estrategia VARCHAR(40) DEFAULT 'sin_responsable'::character varying NOT NULL,
    id_tecnico_fijo INTEGER,
    considerar_disponibilidad BOOLEAN DEFAULT true NOT NULL,
    notificar_asignacion BOOLEAN DEFAULT true NOT NULL,
    veces_aplicada INTEGER DEFAULT 0 NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_regla_asignacion_pkey PRIMARY KEY (id_regla)
);

-- ------------------------------------------------------------
-- Tabla: problema_regla_escalamiento
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_regla_escalamiento (
    id_escalamiento INTEGER DEFAULT nextval('problema_regla_escalamiento_id_escalamiento_seq'::regclass) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    objetivo VARCHAR(40) DEFAULT 'diagnostico'::character varying NOT NULL,
    prioridades JSONB DEFAULT '["P1", "P2", "P3", "P4"]'::jsonb NOT NULL,
    tipo_umbral VARCHAR(30) DEFAULT 'porcentaje'::character varying NOT NULL,
    umbral_valor INTEGER DEFAULT 75 NOT NULL,
    acciones JSONB DEFAULT '[]'::jsonb NOT NULL,
    repetir_cada_horas INTEGER,
    max_repeticiones INTEGER DEFAULT 1,
    activa BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_regla_escalamiento_pkey PRIMARY KEY (id_escalamiento)
);

-- ------------------------------------------------------------
-- Tabla: problema_regla_umbral
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_regla_umbral (
    id_regla INTEGER DEFAULT nextval('problema_regla_umbral_id_regla_seq'::regclass) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    orden INTEGER DEFAULT 1 NOT NULL,
    activa BOOLEAN DEFAULT false NOT NULL,
    estados_incluidos JSONB DEFAULT '["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"]'::jsonb NOT NULL,
    prioridad_minima VARCHAR(10) DEFAULT 'P4'::character varying NOT NULL,
    servicios_incluidos JSONB DEFAULT '[]'::jsonb NOT NULL,
    categorias_incluidas JSONB DEFAULT '[]'::jsonb NOT NULL,
    agrupar_por VARCHAR(50) DEFAULT 'servicio'::character varying NOT NULL,
    sensibilidad_texto VARCHAR(20) DEFAULT 'media'::character varying,
    umbral_incidentes INTEGER DEFAULT 3 NOT NULL,
    ventana_horas INTEGER DEFAULT 24 NOT NULL,
    accion VARCHAR(50) DEFAULT 'crear_automatico'::character varying NOT NULL,
    id_plantilla INTEGER,
    prioridad_problema VARCHAR(30) DEFAULT 'maxima_incidentes'::character varying NOT NULL,
    id_departamento_destino INTEGER,
    vincular_incidentes BOOLEAN DEFAULT true NOT NULL,
    evitar_duplicados BOOLEAN DEFAULT true NOT NULL,
    enfriamiento_horas INTEGER DEFAULT 24 NOT NULL,
    notificar_destinatarios JSONB DEFAULT '["gestor_problemas"]'::jsonb NOT NULL,
    notificar_plantilla VARCHAR(100) DEFAULT 'alerta_umbral_problema'::character varying,
    ultima_ejecucion TIMESTAMPTZ,
    problemas_generados INTEGER DEFAULT 0 NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT problema_regla_umbral_pkey PRIMARY KEY (id_regla)
);

-- ------------------------------------------------------------
-- Tabla: problema_regla_umbral_ejecucion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_regla_umbral_ejecucion (
    id_ejecucion INTEGER DEFAULT nextval('problema_regla_umbral_ejecucion_id_ejecucion_seq'::regclass) NOT NULL,
    id_regla INTEGER,
    fecha_ejecucion TIMESTAMPTZ DEFAULT now() NOT NULL,
    incidentes_analizados INTEGER DEFAULT 0 NOT NULL,
    grupos_detectados INTEGER DEFAULT 0 NOT NULL,
    problemas_creados INTEGER DEFAULT 0 NOT NULL,
    detalle JSONB DEFAULT '[]'::jsonb NOT NULL,
    CONSTRAINT problema_regla_umbral_ejecucion_pkey PRIMARY KEY (id_ejecucion)
);

-- ------------------------------------------------------------
-- Tabla: problema_relaciones_version
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_relaciones_version (
    id_version INTEGER DEFAULT nextval('problema_relaciones_version_id_version_seq'::regclass) NOT NULL,
    numero_version INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'publicado'::character varying NOT NULL,
    datos JSONB NOT NULL,
    motivo_cambio VARCHAR(255) NOT NULL,
    creado_por INTEGER,
    publicado_por INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_publicacion TIMESTAMPTZ,
    CONSTRAINT problema_relaciones_version_pkey PRIMARY KEY (id_version)
);

-- ------------------------------------------------------------
-- Tabla: problema_tarea_catalogo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_tarea_catalogo (
    id_tarea INTEGER DEFAULT nextval('problema_tarea_catalogo_id_tarea_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(40) DEFAULT 'investigacion'::character varying NOT NULL,
    id_departamento_destino INTEGER,
    duracion_estimada_horas INTEGER DEFAULT 4,
    offset_dias_vencimiento INTEGER DEFAULT 2,
    obligatoria BOOLEAN DEFAULT false NOT NULL,
    checklist JSONB DEFAULT '[]'::jsonb NOT NULL,
    activa BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_tarea_catalogo_pkey PRIMARY KEY (id_tarea),
    CONSTRAINT problema_tarea_catalogo_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_tarea_paquete
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_tarea_paquete (
    id_paquete INTEGER DEFAULT nextval('problema_tarea_paquete_id_paquete_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    tareas JSONB DEFAULT '[]'::jsonb NOT NULL,
    regla_aplicacion JSONB DEFAULT '{"evento": "al_iniciar_analisis"}'::jsonb NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_tarea_paquete_pkey PRIMARY KEY (id_paquete),
    CONSTRAINT problema_tarea_paquete_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: problema_transicion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problema_transicion (
    id_transicion INTEGER DEFAULT nextval('problema_transicion_id_transicion_seq'::regclass) NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    estado_origen_id INTEGER NOT NULL,
    estado_destino_id INTEGER NOT NULL,
    perfiles_autorizados JSONB DEFAULT '[]'::jsonb NOT NULL,
    roles_contextuales JSONB DEFAULT '{"grupo": true, "supervisor": true, "responsable": true}'::jsonb NOT NULL,
    condiciones_previas JSONB DEFAULT '[]'::jsonb NOT NULL,
    campos_requeridos JSONB DEFAULT '[]'::jsonb NOT NULL,
    politica_comentario VARCHAR(30) DEFAULT 'opcional'::character varying NOT NULL,
    requiere_confirmacion BOOLEAN DEFAULT false NOT NULL,
    mensaje_confirmacion TEXT,
    requiere_aprobacion BOOLEAN DEFAULT false NOT NULL,
    aprobador_tipo VARCHAR(40) DEFAULT 'supervisor_grupo'::character varying,
    color_boton VARCHAR(20) DEFAULT '#2563eb'::character varying,
    automatizaciones JSONB DEFAULT '[]'::jsonb NOT NULL,
    activa BOOLEAN DEFAULT true NOT NULL,
    orden INTEGER DEFAULT 1 NOT NULL,
    es_sistema BOOLEAN DEFAULT false NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT problema_transicion_politica_comentario_check CHECK (((politica_comentario)::text = ANY ((ARRAY['ninguno'::character varying, 'opcional'::character varying, 'obligatorio'::character varying])::text[]))),
    CONSTRAINT problema_transicion_pkey PRIMARY KEY (id_transicion),
    CONSTRAINT problema_transicion_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: proveedor_ti
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proveedor_ti (
    id_proveedor INTEGER DEFAULT nextval('proveedor_ti_id_proveedor_seq'::regclass) NOT NULL,
    codigo_proveedor VARCHAR(30) NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    tipo_servicio VARCHAR(100) NOT NULL,
    contacto_nombre VARCHAR(120),
    contacto_correo VARCHAR(160),
    contacto_telefono VARCHAR(40),
    numero_contrato VARCHAR(80),
    fecha_inicio DATE,
    fecha_vencimiento DATE,
    servicio_soportado VARCHAR(180),
    compromiso_sla TEXT,
    evaluacion_desempeno SMALLINT,
    estado VARCHAR(16) DEFAULT 'ACTIVO'::character varying NOT NULL,
    observaciones TEXT,
    usuario_creacion INTEGER NOT NULL,
    usuario_modificacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT proveedor_ti_check CHECK (((fecha_vencimiento IS NULL) OR (fecha_inicio IS NULL) OR (fecha_vencimiento >= fecha_inicio))),
    CONSTRAINT proveedor_ti_estado_check CHECK (((estado)::text = ANY ((ARRAY['ACTIVO'::character varying, 'EN_REVISION'::character varying, 'VENCIDO'::character varying, 'INACTIVO'::character varying])::text[]))),
    CONSTRAINT proveedor_ti_evaluacion_desempeno_check CHECK (((evaluacion_desempeno >= 1) AND (evaluacion_desempeno <= 5))),
    CONSTRAINT proveedor_ti_pkey PRIMARY KEY (id_proveedor),
    CONSTRAINT proveedor_ti_codigo_proveedor_key UNIQUE (codigo_proveedor)
);

-- ------------------------------------------------------------
-- Tabla: recepcion_activo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recepcion_activo (
    id_recepcion INTEGER DEFAULT nextval('recepcion_activo_id_recepcion_seq'::regclass) NOT NULL,
    codigo VARCHAR(40) NOT NULL,
    id_proveedor INTEGER,
    documento VARCHAR(120),
    id_solicitud_origen INTEGER,
    fecha_recepcion DATE,
    total_items INTEGER DEFAULT 0 NOT NULL,
    estado VARCHAR(20) DEFAULT 'RECIBIDO'::character varying NOT NULL,
    id_usuario INTEGER,
    detalle JSONB,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT recepcion_activo_pkey PRIMARY KEY (id_recepcion),
    CONSTRAINT recepcion_activo_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: recertificacion_acceso
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recertificacion_acceso (
    id_recertificacion INTEGER DEFAULT nextval('recertificacion_acceso_id_recertificacion_seq'::regclass) NOT NULL,
    id_usuario INTEGER NOT NULL,
    id_perfil INTEGER NOT NULL,
    decision VARCHAR(20) NOT NULL,
    comentario TEXT,
    id_auditor INTEGER NOT NULL,
    fecha_decision TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT recertificacion_acceso_decision_check CHECK (((decision)::text = ANY ((ARRAY['CONFIRMADO'::character varying, 'RETIRADO'::character varying])::text[]))),
    CONSTRAINT recertificacion_acceso_pkey PRIMARY KEY (id_recertificacion)
);

-- ------------------------------------------------------------
-- Tabla: regla_notificacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS regla_notificacion (
    id_regla INTEGER DEFAULT nextval('regla_notificacion_id_regla_seq'::regclass) NOT NULL,
    codigo_evento VARCHAR(60) NOT NULL,
    nombre VARCHAR(140) NOT NULL,
    descripcion TEXT,
    canal VARCHAR(20) DEFAULT 'EMAIL'::character varying NOT NULL,
    plantilla JSONB DEFAULT '{}'::jsonb NOT NULL,
    destinatarios TEXT[] DEFAULT ARRAY['SOLICITANTE'::text] NOT NULL,
    activa BOOLEAN DEFAULT true NOT NULL,
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT regla_notificacion_canal_check CHECK (((canal)::text = 'EMAIL'::text)),
    CONSTRAINT regla_notificacion_pkey PRIMARY KEY (id_regla),
    CONSTRAINT regla_notificacion_codigo_evento_key UNIQUE (codigo_evento)
);

-- ------------------------------------------------------------
-- Tabla: renovacion_contrato
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS renovacion_contrato (
    id_renovacion INTEGER DEFAULT nextval('renovacion_contrato_id_renovacion_seq'::regclass) NOT NULL,
    id_contrato INTEGER NOT NULL,
    fecha_solicitud TIMESTAMPTZ DEFAULT now() NOT NULL,
    monto_propuesto NUMERIC(14, 2),
    estado VARCHAR(20) DEFAULT 'SOLICITADA'::character varying NOT NULL,
    id_usuario_solicita INTEGER,
    comentario TEXT,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT renovacion_contrato_pkey PRIMARY KEY (id_renovacion)
);

-- ------------------------------------------------------------
-- Tabla: resiliencia_servicio
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resiliencia_servicio (
    id_resiliencia INTEGER DEFAULT nextval('resiliencia_servicio_id_resiliencia_seq'::regclass) NOT NULL,
    id_servicio INTEGER NOT NULL,
    objetivo_disponibilidad NUMERIC(5, 2) DEFAULT 99.00 NOT NULL,
    disponibilidad_observada NUMERIC(5, 2),
    rto_horas NUMERIC(8, 2),
    rpo_horas NUMERIC(8, 2),
    umbral_capacidad_pct SMALLINT,
    consumo_capacidad_pct SMALLINT,
    plan_continuidad TEXT NOT NULL,
    ultima_prueba TIMESTAMPTZ,
    proxima_prueba TIMESTAMPTZ,
    resultado_ultima_prueba TEXT,
    id_responsable INTEGER,
    usuario_creacion INTEGER NOT NULL,
    usuario_modificacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT resiliencia_servicio_objetivo_disponibilidad_check CHECK (((objetivo_disponibilidad >= (0)::numeric) AND (objetivo_disponibilidad <= (100)::numeric))),
    CONSTRAINT resiliencia_servicio_consumo_capacidad_pct_check CHECK (((consumo_capacidad_pct >= 0) AND (consumo_capacidad_pct <= 100))),
    CONSTRAINT resiliencia_servicio_disponibilidad_observada_check CHECK (((disponibilidad_observada >= (0)::numeric) AND (disponibilidad_observada <= (100)::numeric))),
    CONSTRAINT resiliencia_servicio_umbral_capacidad_pct_check CHECK (((umbral_capacidad_pct >= 1) AND (umbral_capacidad_pct <= 100))),
    CONSTRAINT resiliencia_servicio_rto_horas_check CHECK ((rto_horas >= (0)::numeric)),
    CONSTRAINT resiliencia_servicio_rpo_horas_check CHECK ((rpo_horas >= (0)::numeric)),
    CONSTRAINT resiliencia_servicio_pkey PRIMARY KEY (id_resiliencia),
    CONSTRAINT resiliencia_servicio_id_servicio_key UNIQUE (id_servicio)
);

-- ------------------------------------------------------------
-- Tabla: respuestas_predefinidas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS respuestas_predefinidas (
    id_respuesta INTEGER DEFAULT nextval('respuestas_predefinidas_id_respuesta_seq'::regclass) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    atajo VARCHAR(50) NOT NULL,
    contenido TEXT NOT NULL,
    modo_defecto VARCHAR(20) DEFAULT 'PUBLICA'::character varying,
    ambito VARCHAR(20) DEFAULT 'PERSONAL'::character varying,
    id_usuario INTEGER,
    id_departamento INTEGER,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT respuestas_predefinidas_pkey PRIMARY KEY (id_respuesta)
);

-- ------------------------------------------------------------
-- Tabla: servicio_catalogo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicio_catalogo (
    id_servicio INTEGER DEFAULT nextval('servicio_catalogo_id_servicio_seq'::regclass) NOT NULL,
    codigo_servicio VARCHAR(30) NOT NULL,
    id_tipo_ticket INTEGER NOT NULL,
    id_categoria INTEGER,
    nombre VARCHAR(100) NOT NULL,
    descripcion_comercial TEXT NOT NULL,
    entregable TEXT NOT NULL,
    requiere_aprobacion BOOLEAN DEFAULT false NOT NULL,
    sla_horas_resolucion INTEGER NOT NULL,
    sla_horas_respuesta INTEGER NOT NULL,
    costo_referencial NUMERIC(10, 2) DEFAULT 0.00,
    icono VARCHAR(50) DEFAULT 'servicio'::character varying,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    motivo_inactivacion TEXT,
    fecha_inactivacion TIMESTAMPTZ,
    usuario_inactivacion INTEGER,
    esquema_formulario JSONB DEFAULT '[]'::jsonb NOT NULL,
    id_departamento_resolutor INTEGER,
    reglas_escalamiento JSONB DEFAULT '[]'::jsonb NOT NULL,
    es_critico BOOLEAN DEFAULT false NOT NULL,
    responsable_servicio_id INTEGER,
    CONSTRAINT servicio_catalogo_pkey PRIMARY KEY (id_servicio),
    CONSTRAINT servicio_catalogo_codigo_servicio_key UNIQUE (codigo_servicio)
);

-- ------------------------------------------------------------
-- Tabla: servicio_catalogo_perfiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicio_catalogo_perfiles (
    id_servicio INTEGER NOT NULL,
    id_perfil INTEGER NOT NULL,
    CONSTRAINT servicio_catalogo_perfiles_pkey PRIMARY KEY (id_servicio, id_perfil)
);

-- ------------------------------------------------------------
-- Tabla: servicio_workflow_paso
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicio_workflow_paso (
    id_paso INTEGER DEFAULT nextval('servicio_workflow_paso_id_paso_seq'::regclass) NOT NULL,
    id_servicio INTEGER NOT NULL,
    orden SMALLINT NOT NULL,
    codigo_paso VARCHAR(30) NOT NULL,
    nombre_paso VARCHAR(60) NOT NULL,
    rol_ejecutor VARCHAR(30) NOT NULL,
    es_compuerta_aprobacion BOOLEAN DEFAULT false NOT NULL,
    pausa_sla BOOLEAN DEFAULT false NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT servicio_workflow_paso_pkey PRIMARY KEY (id_paso)
);

-- ------------------------------------------------------------
-- Tabla: software_autorizado
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS software_autorizado (
    id_software INTEGER DEFAULT nextval('software_autorizado_id_software_seq'::regclass) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    fabricante VARCHAR(150),
    version VARCHAR(60),
    categoria VARCHAR(80),
    licencia_requerida BOOLEAN DEFAULT false NOT NULL,
    estado VARCHAR(20) DEFAULT 'AUTORIZADO'::character varying NOT NULL,
    id_usuario_aprueba INTEGER,
    fecha_aprobacion TIMESTAMPTZ,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT software_autorizado_pkey PRIMARY KEY (id_software)
);

-- ------------------------------------------------------------
-- Tabla: solicitud_baja_activo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS solicitud_baja_activo (
    id_solicitud INTEGER DEFAULT nextval('solicitud_baja_activo_id_solicitud_seq'::regclass) NOT NULL,
    id_activo INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    id_usuario_solicita INTEGER NOT NULL,
    id_usuario_resuelve INTEGER,
    comentario_resolucion TEXT,
    fecha_solicitud TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_resolucion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    destino_final VARCHAR(60),
    borrado_seguro BOOLEAN,
    acta TEXT,
    fecha_disposicion TIMESTAMPTZ,
    CONSTRAINT solicitud_baja_activo_pkey PRIMARY KEY (id_solicitud)
);

-- ------------------------------------------------------------
-- Tabla: tarea_programada
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarea_programada (
    id_tarea INTEGER DEFAULT nextval('tarea_programada_id_tarea_seq'::regclass) NOT NULL,
    codigo TEXT NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    frecuencia TEXT,
    ultima_ejecucion TIMESTAMPTZ,
    proxima_ejecucion TIMESTAMPTZ,
    estado TEXT,
    duracion_ms INTEGER,
    ultimo_resultado TEXT,
    activo BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT tarea_programada_pkey PRIMARY KEY (id_tarea),
    CONSTRAINT tarea_programada_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: tecnico_ausencias
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tecnico_ausencias (
    id_ausencia INTEGER DEFAULT nextval('tecnico_ausencias_id_ausencia_seq'::regclass) NOT NULL,
    id_usuario_tecnico INTEGER NOT NULL,
    fecha_desde TIMESTAMPTZ NOT NULL,
    fecha_hasta TIMESTAMPTZ NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    registrado_por INTEGER,
    fecha_registro TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    id_usuario_reemplazo INTEGER,
    CONSTRAINT tecnico_ausencias_pkey PRIMARY KEY (id_ausencia)
);

-- ------------------------------------------------------------
-- Tabla: tecnico_detalle
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tecnico_detalle (
    id_tecnico_detalle INTEGER DEFAULT nextval('tecnico_detalle_id_tecnico_detalle_seq'::regclass) NOT NULL,
    id_usuario INTEGER NOT NULL,
    id_departamento INTEGER NOT NULL,
    nivel_soporte SMALLINT DEFAULT 1 NOT NULL,
    capacidad_maxima_tickets INTEGER DEFAULT 8 NOT NULL,
    estado_operativo VARCHAR(20) DEFAULT 'DISPONIBLE'::character varying NOT NULL,
    especialidad_principal VARCHAR(100),
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT tecnico_detalle_nivel_soporte_check CHECK ((nivel_soporte = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT tecnico_detalle_pkey PRIMARY KEY (id_tecnico_detalle),
    CONSTRAINT tecnico_detalle_id_usuario_key UNIQUE (id_usuario)
);

-- ------------------------------------------------------------
-- Tabla: tecnico_recordatorios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tecnico_recordatorios (
    id_recordatorio INTEGER DEFAULT nextval('tecnico_recordatorios_id_recordatorio_seq'::regclass) NOT NULL,
    id_usuario INTEGER NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    fecha_hora TIMESTAMPTZ NOT NULL,
    repeticion VARCHAR(20) DEFAULT 'NINGUNA'::character varying,
    objeto_tipo VARCHAR(50),
    objeto_id VARCHAR(50),
    completado BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT tecnico_recordatorios_pkey PRIMARY KEY (id_recordatorio)
);

-- ------------------------------------------------------------
-- Tabla: tecnico_turnos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tecnico_turnos (
    id_turno INTEGER DEFAULT nextval('tecnico_turnos_id_turno_seq'::regclass) NOT NULL,
    id_usuario_tecnico INTEGER NOT NULL,
    fecha DATE NOT NULL,
    turno VARCHAR(20) NOT NULL,
    notas VARCHAR(255),
    registrado_por INTEGER,
    fecha_registro TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT chk_tecnico_turnos_turno CHECK (((turno)::text = ANY ((ARRAY['MANANA'::character varying, 'TARDE'::character varying, 'NOCHE'::character varying, 'GUARDIA_24X7'::character varying])::text[]))),
    CONSTRAINT tecnico_turnos_pkey PRIMARY KEY (id_turno),
    CONSTRAINT uq_tecnico_turnos_tecnico_fecha_turno UNIQUE (id_usuario_tecnico, fecha, turno)
);

-- ------------------------------------------------------------
-- Tabla: ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket (
    id_ticket INTEGER DEFAULT nextval('ticket_id_ticket_seq'::regclass) NOT NULL,
    codigo_ticket VARCHAR(30) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    id_tipo_ticket INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    id_impacto INTEGER NOT NULL,
    id_urgencia INTEGER NOT NULL,
    id_prioridad INTEGER NOT NULL,
    id_estado INTEGER NOT NULL,
    id_motivo_espera INTEGER,
    id_usuario_solicitante INTEGER NOT NULL,
    id_usuario_asignado INTEGER,
    solucion_aplicada TEXT,
    motivo_cancelacion TEXT,
    fecha_limite_sla TIMESTAMPTZ NOT NULL,
    fecha_primera_respuesta TIMESTAMPTZ,
    fecha_resolucion TIMESTAMPTZ,
    fecha_cierre TIMESTAMPTZ,
    sla_cumplido BOOLEAN,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    id_servicio INTEGER,
    id_departamento INTEGER,
    canal_comunicacion VARCHAR(30) DEFAULT 'PORTAL_WEB'::character varying NOT NULL,
    categoria_resolucion VARCHAR(60),
    calificacion_csat SMALLINT,
    comentario_csat TEXT,
    fecha_csat TIMESTAMPTZ,
    tiempo_pausado_minutos INTEGER DEFAULT 0 NOT NULL,
    fecha_ultima_pausa TIMESTAMPTZ,
    campos_adicionales JSONB DEFAULT '{}'::jsonb,
    id_ci INTEGER,
    fecha_reapertura TIMESTAMPTZ,
    motivo_reapertura TEXT,
    conteo_reaperturas INTEGER DEFAULT 0,
    id_departamento_empresa INTEGER,
    fecha_limite_respuesta_sla TIMESTAMPTZ,
    CONSTRAINT ticket_calificacion_csat_check CHECK (((calificacion_csat >= 1) AND (calificacion_csat <= 5))),
    CONSTRAINT ticket_pkey PRIMARY KEY (id_ticket),
    CONSTRAINT ticket_codigo_ticket_key UNIQUE (codigo_ticket)
);

-- ------------------------------------------------------------
-- Tabla: ticket_aprobacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_aprobacion (
    id_ticket_aprobacion INTEGER DEFAULT nextval('ticket_aprobacion_id_ticket_aprobacion_seq'::regclass) NOT NULL,
    id_ticket INTEGER NOT NULL,
    id_usuario_aprobador INTEGER NOT NULL,
    id_paso_workflow INTEGER,
    estado_decision VARCHAR(20) NOT NULL,
    comentario TEXT,
    fecha_decision TIMESTAMPTZ DEFAULT now() NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT ticket_aprobacion_pkey PRIMARY KEY (id_ticket_aprobacion)
);

-- ------------------------------------------------------------
-- Tabla: ticket_incidente
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_incidente (
    id_ticket INTEGER NOT NULL,
    id_problema INTEGER,
    es_incidente_mayor BOOLEAN DEFAULT false NOT NULL,
    causado_por_cambio_id INTEGER,
    CONSTRAINT ticket_incidente_pkey PRIMARY KEY (id_ticket)
);

-- ------------------------------------------------------------
-- Tabla: ticket_lecturas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_lecturas (
    id_lectura INTEGER DEFAULT nextval('ticket_lecturas_id_lectura_seq'::regclass) NOT NULL,
    id_ticket INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    fecha_lectura TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT ticket_lecturas_pkey PRIMARY KEY (id_lectura),
    CONSTRAINT uq_ticket_lectura UNIQUE (id_ticket, id_usuario)
);

-- ------------------------------------------------------------
-- Tabla: ticket_solicitud
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_solicitud (
    id_ticket INTEGER NOT NULL,
    estado_aprobacion VARCHAR(30) DEFAULT 'NO_APLICA'::character varying NOT NULL,
    id_paso_actual INTEGER,
    CONSTRAINT ticket_solicitud_pkey PRIMARY KEY (id_ticket)
);

-- ------------------------------------------------------------
-- Tabla: tipo_activo_catalogo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipo_activo_catalogo (
    id_tipo_activo INTEGER DEFAULT nextval('tipo_activo_catalogo_id_tipo_activo_seq'::regclass) NOT NULL,
    codigo VARCHAR(40) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    clase VARCHAR(16) NOT NULL,
    atributos JSONB DEFAULT '[]'::jsonb NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT tipo_activo_catalogo_clase_check CHECK (((clase)::text = ANY ((ARRAY['HARDWARE'::character varying, 'SOFTWARE'::character varying])::text[]))),
    CONSTRAINT tipo_activo_catalogo_pkey PRIMARY KEY (id_tipo_activo),
    CONSTRAINT tipo_activo_catalogo_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: tipo_ci
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipo_ci (
    id_tipo_ci INTEGER DEFAULT nextval('tipo_ci_id_tipo_ci_seq'::regclass) NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
    icono VARCHAR(50) DEFAULT 'server'::character varying,
    atributos_requeridos JSONB DEFAULT '[]'::jsonb,
    reglas_impacto JSONB DEFAULT '[]'::jsonb,
    estado_registro BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT tipo_ci_pkey PRIMARY KEY (id_tipo_ci),
    CONSTRAINT tipo_ci_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: tipo_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipo_ticket (
    id_tipo_ticket INTEGER DEFAULT nextval('tipo_ticket_id_tipo_ticket_seq'::regclass) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(250) NOT NULL,
    prefijo_codigo VARCHAR(5) NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT tipo_ticket_pkey PRIMARY KEY (id_tipo_ticket),
    CONSTRAINT tipo_ticket_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: transicion_activo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transicion_activo (
    estado_origen VARCHAR(30) NOT NULL,
    estado_destino VARCHAR(30) NOT NULL,
    requiere_motivo BOOLEAN DEFAULT false NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT transicion_activo_pkey PRIMARY KEY (estado_origen, estado_destino)
);

-- ------------------------------------------------------------
-- Tabla: ubicacion
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ubicacion (
    id_ubicacion INTEGER DEFAULT nextval('ubicacion_id_ubicacion_seq'::regclass) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    id_padre INTEGER,
    tipo_nivel VARCHAR(50) DEFAULT 'SEDE'::character varying NOT NULL,
    direccion TEXT,
    id_responsable INTEGER,
    id_departamento INTEGER,
    capacidad_u INTEGER,
    coordenadas TEXT,
    notas TEXT,
    ruta_completa TEXT,
    activo BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT ubicacion_pkey PRIMARY KEY (id_ubicacion),
    CONSTRAINT ubicacion_codigo_key UNIQUE (codigo)
);

-- ------------------------------------------------------------
-- Tabla: urgencia_ticket
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS urgencia_ticket (
    id_urgencia INTEGER DEFAULT nextval('urgencia_ticket_id_urgencia_seq'::regclass) NOT NULL,
    nivel SMALLINT NOT NULL,
    nombre VARCHAR(30) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT urgencia_ticket_pkey PRIMARY KEY (id_urgencia),
    CONSTRAINT urgencia_ticket_nivel_key UNIQUE (nivel)
);

-- ------------------------------------------------------------
-- Tabla: usuario
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER DEFAULT nextval('usuario_id_usuario_seq'::regclass) NOT NULL,
    dni VARCHAR(15) NOT NULL,
    nombres VARCHAR(40) NOT NULL,
    apellido_paterno VARCHAR(40) NOT NULL,
    apellido_materno VARCHAR(40),
    celular VARCHAR(15),
    correo_electronico VARCHAR(40) NOT NULL,
    clave VARCHAR(255) NOT NULL,
    intentos_fallidos SMALLINT DEFAULT 0 NOT NULL,
    bloqueado_hasta TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMP DEFAULT now() NOT NULL,
    usuario_modificacion INTEGER,
    fecha_modificacion TIMESTAMP,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    cuenta_bloqueada BOOLEAN DEFAULT false NOT NULL,
    correo_personal VARCHAR(100),
    id_departamento INTEGER,
    id_departamento_empresa INTEGER,
    nivel_prioridad INTEGER DEFAULT 5,
    debe_cambiar_clave BOOLEAN DEFAULT false NOT NULL,
    foto_perfil TEXT,
    creado_por_grupo VARCHAR(100) DEFAULT 'SISTEMA_LOCAL'::character varying,
    CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario),
    CONSTRAINT usuario_correo_electronico_key UNIQUE (correo_electronico),
    CONSTRAINT usuario_dni_key UNIQUE (dni)
);

-- ------------------------------------------------------------
-- Tabla: usuario_perfiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario_perfiles (
    id_usuario INTEGER NOT NULL,
    id_perfil INTEGER NOT NULL,
    estado_registro BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT usuario_perfiles_pkey PRIMARY KEY (id_usuario, id_perfil)
);

-- ------------------------------------------------------------
-- Tabla: ventanas_mantenimiento
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ventanas_mantenimiento (
    id INTEGER DEFAULT nextval('ventanas_mantenimiento_id_seq'::regclass) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    recurrencia VARCHAR(50) DEFAULT 'semanal'::character varying NOT NULL,
    dias_semana JSONB DEFAULT '[]'::jsonb,
    regla_mensual JSONB DEFAULT '{}'::jsonb,
    hora_inicio TIME WITHOUT TIME ZONE NOT NULL,
    hora_fin TIME WITHOUT TIME ZONE NOT NULL,
    cruce_medianoche BOOLEAN DEFAULT false NOT NULL,
    fecha_vigencia_desde DATE,
    fecha_vigencia_hasta DATE,
    excepciones_fechas JSONB DEFAULT '[]'::jsonb,
    alcance_tipo VARCHAR(50) DEFAULT 'toda_la_organizacion'::character varying NOT NULL,
    id_servicios JSONB DEFAULT '[]'::jsonb,
    clases_ci JSONB DEFAULT '[]'::jsonb,
    entornos JSONB DEFAULT '[]'::jsonb,
    id_departamentos JSONB DEFAULT '[]'::jsonb,
    tipos_cambio_permitidos JSONB DEFAULT '["estandar", "normal"]'::jsonb NOT NULL,
    capacidad_simultanea INTEGER DEFAULT 5 NOT NULL,
    capacidad_acumulada INTEGER DEFAULT 20 NOT NULL,
    permite_interrupcion BOOLEAN DEFAULT false NOT NULL,
    permite_en_feriados BOOLEAN DEFAULT false NOT NULL,
    color VARCHAR(30) DEFAULT '#2563eb'::character varying NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    fecha_modificacion TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT ventanas_mantenimiento_pkey PRIMARY KEY (id),
    CONSTRAINT ventanas_mantenimiento_codigo_key UNIQUE (codigo)
);

-- ============================================================================
-- CLAVES FORÁNEAS (RELACIONES ENTRE TABLAS)
-- ============================================================================

ALTER TABLE acta_entrega DROP CONSTRAINT IF EXISTS acta_entrega_id_usuario_fkey;
ALTER TABLE acta_entrega ADD CONSTRAINT acta_entrega_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE acta_entrega DROP CONSTRAINT IF EXISTS acta_entrega_id_activo_fkey;
ALTER TABLE acta_entrega ADD CONSTRAINT acta_entrega_id_activo_fkey FOREIGN KEY (id_activo) REFERENCES activo(id_activo);

ALTER TABLE activo DROP CONSTRAINT IF EXISTS activo_usuario_inactivacion_fkey;
ALTER TABLE activo ADD CONSTRAINT activo_usuario_inactivacion_fkey FOREIGN KEY (usuario_inactivacion) REFERENCES usuario(id_usuario);

ALTER TABLE activo DROP CONSTRAINT IF EXISTS activo_usuario_creacion_fkey;
ALTER TABLE activo ADD CONSTRAINT activo_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE activo DROP CONSTRAINT IF EXISTS activo_usuario_modificacion_fkey;
ALTER TABLE activo ADD CONSTRAINT activo_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE activo DROP CONSTRAINT IF EXISTS activo_id_departamento_fkey;
ALTER TABLE activo ADD CONSTRAINT activo_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_ti(id_departamento);

ALTER TABLE activo DROP CONSTRAINT IF EXISTS activo_id_modelo_fkey;
ALTER TABLE activo ADD CONSTRAINT activo_id_modelo_fkey FOREIGN KEY (id_modelo) REFERENCES modelo_activo(id_modelo);

ALTER TABLE activo DROP CONSTRAINT IF EXISTS activo_id_usuario_custodio_fkey;
ALTER TABLE activo ADD CONSTRAINT activo_id_usuario_custodio_fkey FOREIGN KEY (id_usuario_custodio) REFERENCES usuario(id_usuario);

ALTER TABLE activo_historial DROP CONSTRAINT IF EXISTS activo_historial_id_usuario_fkey;
ALTER TABLE activo_historial ADD CONSTRAINT activo_historial_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE activo_historial DROP CONSTRAINT IF EXISTS activo_historial_custodio_anterior_fkey;
ALTER TABLE activo_historial ADD CONSTRAINT activo_historial_custodio_anterior_fkey FOREIGN KEY (custodio_anterior) REFERENCES usuario(id_usuario);

ALTER TABLE activo_historial DROP CONSTRAINT IF EXISTS activo_historial_custodio_nuevo_fkey;
ALTER TABLE activo_historial ADD CONSTRAINT activo_historial_custodio_nuevo_fkey FOREIGN KEY (custodio_nuevo) REFERENCES usuario(id_usuario);

ALTER TABLE activo_historial DROP CONSTRAINT IF EXISTS activo_historial_id_activo_fkey;
ALTER TABLE activo_historial ADD CONSTRAINT activo_historial_id_activo_fkey FOREIGN KEY (id_activo) REFERENCES activo(id_activo);

ALTER TABLE acuerdo_nivel_operativo DROP CONSTRAINT IF EXISTS acuerdo_nivel_operativo_id_departamento_fkey;
ALTER TABLE acuerdo_nivel_operativo ADD CONSTRAINT acuerdo_nivel_operativo_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_ti(id_departamento);

ALTER TABLE adjunto_ticket DROP CONSTRAINT IF EXISTS adjunto_ticket_id_ticket_fkey;
ALTER TABLE adjunto_ticket ADD CONSTRAINT adjunto_ticket_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket) ON DELETE CASCADE;

ALTER TABLE adjunto_ticket DROP CONSTRAINT IF EXISTS adjunto_ticket_id_usuario_subio_fkey;
ALTER TABLE adjunto_ticket ADD CONSTRAINT adjunto_ticket_id_usuario_subio_fkey FOREIGN KEY (id_usuario_subio) REFERENCES usuario(id_usuario);

ALTER TABLE api_log_auditoria DROP CONSTRAINT IF EXISTS api_log_auditoria_id_credencial_fkey;
ALTER TABLE api_log_auditoria ADD CONSTRAINT api_log_auditoria_id_credencial_fkey FOREIGN KEY (id_credencial) REFERENCES api_credenciales_externas(id_credencial) ON DELETE SET NULL;

ALTER TABLE aprobacion_monto DROP CONSTRAINT IF EXISTS aprobacion_monto_id_aprobador_fkey;
ALTER TABLE aprobacion_monto ADD CONSTRAINT aprobacion_monto_id_aprobador_fkey FOREIGN KEY (id_aprobador) REFERENCES usuario(id_usuario);

ALTER TABLE articulo_conocimiento DROP CONSTRAINT IF EXISTS articulo_conocimiento_usuario_creacion_fkey;
ALTER TABLE articulo_conocimiento ADD CONSTRAINT articulo_conocimiento_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE articulo_conocimiento DROP CONSTRAINT IF EXISTS articulo_conocimiento_id_revisor_fkey;
ALTER TABLE articulo_conocimiento ADD CONSTRAINT articulo_conocimiento_id_revisor_fkey FOREIGN KEY (id_revisor) REFERENCES usuario(id_usuario);

ALTER TABLE articulo_conocimiento DROP CONSTRAINT IF EXISTS articulo_conocimiento_id_problema_origen_fkey;
ALTER TABLE articulo_conocimiento ADD CONSTRAINT articulo_conocimiento_id_problema_origen_fkey FOREIGN KEY (id_problema_origen) REFERENCES problema(id_problema);

ALTER TABLE articulo_conocimiento DROP CONSTRAINT IF EXISTS articulo_conocimiento_id_categoria_fkey;
ALTER TABLE articulo_conocimiento ADD CONSTRAINT articulo_conocimiento_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES categoria_ticket(id_categoria);

ALTER TABLE articulo_conocimiento DROP CONSTRAINT IF EXISTS articulo_conocimiento_id_autor_fkey;
ALTER TABLE articulo_conocimiento ADD CONSTRAINT articulo_conocimiento_id_autor_fkey FOREIGN KEY (id_autor) REFERENCES usuario(id_usuario);

ALTER TABLE articulo_conocimiento_feedback DROP CONSTRAINT IF EXISTS articulo_conocimiento_feedback_id_articulo_fkey;
ALTER TABLE articulo_conocimiento_feedback ADD CONSTRAINT articulo_conocimiento_feedback_id_articulo_fkey FOREIGN KEY (id_articulo) REFERENCES articulo_conocimiento(id_articulo) ON DELETE CASCADE;

ALTER TABLE articulo_conocimiento_feedback DROP CONSTRAINT IF EXISTS articulo_conocimiento_feedback_id_usuario_fkey;
ALTER TABLE articulo_conocimiento_feedback ADD CONSTRAINT articulo_conocimiento_feedback_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE articulo_conocimiento_historial DROP CONSTRAINT IF EXISTS articulo_conocimiento_historial_id_articulo_fkey;
ALTER TABLE articulo_conocimiento_historial ADD CONSTRAINT articulo_conocimiento_historial_id_articulo_fkey FOREIGN KEY (id_articulo) REFERENCES articulo_conocimiento(id_articulo);

ALTER TABLE articulo_conocimiento_historial DROP CONSTRAINT IF EXISTS articulo_conocimiento_historial_id_usuario_fkey;
ALTER TABLE articulo_conocimiento_historial ADD CONSTRAINT articulo_conocimiento_historial_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE articulo_conocimiento_version DROP CONSTRAINT IF EXISTS articulo_conocimiento_version_id_autor_fkey;
ALTER TABLE articulo_conocimiento_version ADD CONSTRAINT articulo_conocimiento_version_id_autor_fkey FOREIGN KEY (id_autor) REFERENCES usuario(id_usuario);

ALTER TABLE articulo_conocimiento_version DROP CONSTRAINT IF EXISTS articulo_conocimiento_version_id_articulo_fkey;
ALTER TABLE articulo_conocimiento_version ADD CONSTRAINT articulo_conocimiento_version_id_articulo_fkey FOREIGN KEY (id_articulo) REFERENCES articulo_conocimiento(id_articulo) ON DELETE CASCADE;

ALTER TABLE articulo_conocimiento_vinculo_ticket DROP CONSTRAINT IF EXISTS articulo_conocimiento_vinculo_ticket_id_ticket_fkey;
ALTER TABLE articulo_conocimiento_vinculo_ticket ADD CONSTRAINT articulo_conocimiento_vinculo_ticket_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket) ON DELETE CASCADE;

ALTER TABLE articulo_conocimiento_vinculo_ticket DROP CONSTRAINT IF EXISTS articulo_conocimiento_vinculo_ticket_id_tecnico_fkey;
ALTER TABLE articulo_conocimiento_vinculo_ticket ADD CONSTRAINT articulo_conocimiento_vinculo_ticket_id_tecnico_fkey FOREIGN KEY (id_tecnico) REFERENCES usuario(id_usuario);

ALTER TABLE articulo_conocimiento_vinculo_ticket DROP CONSTRAINT IF EXISTS articulo_conocimiento_vinculo_ticket_id_articulo_fkey;
ALTER TABLE articulo_conocimiento_vinculo_ticket ADD CONSTRAINT articulo_conocimiento_vinculo_ticket_id_articulo_fkey FOREIGN KEY (id_articulo) REFERENCES articulo_conocimiento(id_articulo) ON DELETE CASCADE;

ALTER TABLE bloqueo_edicion_concurrente DROP CONSTRAINT IF EXISTS bloqueo_edicion_concurrente_id_usuario_fkey;
ALTER TABLE bloqueo_edicion_concurrente ADD CONSTRAINT bloqueo_edicion_concurrente_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE cab_reunion DROP CONSTRAINT IF EXISTS cab_reunion_id_convocante_fkey;
ALTER TABLE cab_reunion ADD CONSTRAINT cab_reunion_id_convocante_fkey FOREIGN KEY (id_convocante) REFERENCES usuario(id_usuario);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_id_usuario_solicitante_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_id_usuario_solicitante_fkey FOREIGN KEY (id_usuario_solicitante) REFERENCES usuario(id_usuario);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_id_usuario_responsable_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_id_usuario_responsable_fkey FOREIGN KEY (id_usuario_responsable) REFERENCES usuario(id_usuario);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_id_urgencia_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_id_urgencia_fkey FOREIGN KEY (id_urgencia) REFERENCES urgencia_ticket(id_urgencia);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_id_problema_origen_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_id_problema_origen_fkey FOREIGN KEY (id_problema_origen) REFERENCES problema(id_problema);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_id_prioridad_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_id_prioridad_fkey FOREIGN KEY (id_prioridad) REFERENCES prioridad_ticket(id_prioridad);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_id_incidente_origen_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_id_incidente_origen_fkey FOREIGN KEY (id_incidente_origen) REFERENCES ticket(id_ticket);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_id_impacto_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_id_impacto_fkey FOREIGN KEY (id_impacto) REFERENCES impacto_ticket(id_impacto);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_id_ci_afectado_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_id_ci_afectado_fkey FOREIGN KEY (id_ci_afectado) REFERENCES elemento_configuracion(id_ci);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_usuario_modificacion_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_usuario_creacion_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE cambio_aprobacion DROP CONSTRAINT IF EXISTS cambio_aprobacion_id_cambio_fkey;
ALTER TABLE cambio_aprobacion ADD CONSTRAINT cambio_aprobacion_id_cambio_fkey FOREIGN KEY (id_cambio) REFERENCES cambio(id_cambio);

ALTER TABLE cambio_aprobacion DROP CONSTRAINT IF EXISTS cambio_aprobacion_id_usuario_aprobador_fkey;
ALTER TABLE cambio_aprobacion ADD CONSTRAINT cambio_aprobacion_id_usuario_aprobador_fkey FOREIGN KEY (id_usuario_aprobador) REFERENCES usuario(id_usuario);

ALTER TABLE cambio_catalogo_item DROP CONSTRAINT IF EXISTS cambio_catalogo_item_usuario_creacion_fkey;
ALTER TABLE cambio_catalogo_item ADD CONSTRAINT cambio_catalogo_item_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE cambio_catalogo_item DROP CONSTRAINT IF EXISTS cambio_catalogo_item_usuario_modificacion_fkey;
ALTER TABLE cambio_catalogo_item ADD CONSTRAINT cambio_catalogo_item_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE cambio_catalogo_item DROP CONSTRAINT IF EXISTS cambio_catalogo_item_id_padre_fkey;
ALTER TABLE cambio_catalogo_item ADD CONSTRAINT cambio_catalogo_item_id_padre_fkey FOREIGN KEY (id_padre) REFERENCES cambio_catalogo_item(id_item) ON DELETE SET NULL;

ALTER TABLE cambio_enterado DROP CONSTRAINT IF EXISTS cambio_enterado_id_usuario_fkey;
ALTER TABLE cambio_enterado ADD CONSTRAINT cambio_enterado_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE cambio_excepcion DROP CONSTRAINT IF EXISTS cambio_excepcion_id_cambio_fkey;
ALTER TABLE cambio_excepcion ADD CONSTRAINT cambio_excepcion_id_cambio_fkey FOREIGN KEY (id_cambio) REFERENCES cambio(id_cambio);

ALTER TABLE cambio_excepcion DROP CONSTRAINT IF EXISTS cambio_excepcion_id_usuario_autoriza_fkey;
ALTER TABLE cambio_excepcion ADD CONSTRAINT cambio_excepcion_id_usuario_autoriza_fkey FOREIGN KEY (id_usuario_autoriza) REFERENCES usuario(id_usuario);

ALTER TABLE cambio_modelo_estandar DROP CONSTRAINT IF EXISTS cambio_modelo_estandar_usuario_creacion_fkey;
ALTER TABLE cambio_modelo_estandar ADD CONSTRAINT cambio_modelo_estandar_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE cambio_modelo_estandar DROP CONSTRAINT IF EXISTS cambio_modelo_estandar_categoria_id_fkey;
ALTER TABLE cambio_modelo_estandar ADD CONSTRAINT cambio_modelo_estandar_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES cambio_catalogo_item(id_item) ON DELETE SET NULL;

ALTER TABLE cambio_modelo_estandar DROP CONSTRAINT IF EXISTS cambio_modelo_estandar_usuario_modificacion_fkey;
ALTER TABLE cambio_modelo_estandar ADD CONSTRAINT cambio_modelo_estandar_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE cambio_modelo_estandar DROP CONSTRAINT IF EXISTS cambio_modelo_estandar_propietario_id_fkey;
ALTER TABLE cambio_modelo_estandar ADD CONSTRAINT cambio_modelo_estandar_propietario_id_fkey FOREIGN KEY (propietario_id) REFERENCES usuario(id_usuario);

ALTER TABLE campana_inventario DROP CONSTRAINT IF EXISTS campana_inventario_usuario_creacion_fkey;
ALTER TABLE campana_inventario ADD CONSTRAINT campana_inventario_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE campana_inventario DROP CONSTRAINT IF EXISTS campana_inventario_id_responsable_fkey;
ALTER TABLE campana_inventario ADD CONSTRAINT campana_inventario_id_responsable_fkey FOREIGN KEY (id_responsable) REFERENCES usuario(id_usuario);

ALTER TABLE campana_inventario_item DROP CONSTRAINT IF EXISTS campana_inventario_item_id_campana_fkey;
ALTER TABLE campana_inventario_item ADD CONSTRAINT campana_inventario_item_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES campana_inventario(id_campana);

ALTER TABLE campana_inventario_item DROP CONSTRAINT IF EXISTS campana_inventario_item_id_activo_fkey;
ALTER TABLE campana_inventario_item ADD CONSTRAINT campana_inventario_item_id_activo_fkey FOREIGN KEY (id_activo) REFERENCES activo(id_activo);

ALTER TABLE campana_inventario_item DROP CONSTRAINT IF EXISTS campana_inventario_item_id_usuario_verifica_fkey;
ALTER TABLE campana_inventario_item ADD CONSTRAINT campana_inventario_item_id_usuario_verifica_fkey FOREIGN KEY (id_usuario_verifica) REFERENCES usuario(id_usuario);

ALTER TABLE campo_personalizado DROP CONSTRAINT IF EXISTS campo_personalizado_usuario_creacion_fkey;
ALTER TABLE campo_personalizado ADD CONSTRAINT campo_personalizado_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE categoria_ticket DROP CONSTRAINT IF EXISTS categoria_ticket_id_padre_fkey;
ALTER TABLE categoria_ticket ADD CONSTRAINT categoria_ticket_id_padre_fkey FOREIGN KEY (id_padre) REFERENCES categoria_ticket(id_categoria);

ALTER TABLE categoria_ticket DROP CONSTRAINT IF EXISTS categoria_ticket_id_tipo_ticket_fkey;
ALTER TABLE categoria_ticket ADD CONSTRAINT categoria_ticket_id_tipo_ticket_fkey FOREIGN KEY (id_tipo_ticket) REFERENCES tipo_ticket(id_tipo_ticket);

ALTER TABLE ci_relacion DROP CONSTRAINT IF EXISTS ci_relacion_id_ci_padre_fkey;
ALTER TABLE ci_relacion ADD CONSTRAINT ci_relacion_id_ci_padre_fkey FOREIGN KEY (id_ci_padre) REFERENCES elemento_configuracion(id_ci);

ALTER TABLE ci_relacion DROP CONSTRAINT IF EXISTS ci_relacion_id_ci_hijo_fkey;
ALTER TABLE ci_relacion ADD CONSTRAINT ci_relacion_id_ci_hijo_fkey FOREIGN KEY (id_ci_hijo) REFERENCES elemento_configuracion(id_ci);

ALTER TABLE cmdb_actualizacion DROP CONSTRAINT IF EXISTS cmdb_actualizacion_id_cambio_fkey;
ALTER TABLE cmdb_actualizacion ADD CONSTRAINT cmdb_actualizacion_id_cambio_fkey FOREIGN KEY (id_cambio) REFERENCES cambio(id_cambio);

ALTER TABLE cmdb_actualizacion DROP CONSTRAINT IF EXISTS cmdb_actualizacion_id_usuario_aplica_fkey;
ALTER TABLE cmdb_actualizacion ADD CONSTRAINT cmdb_actualizacion_id_usuario_aplica_fkey FOREIGN KEY (id_usuario_aplica) REFERENCES usuario(id_usuario);

ALTER TABLE cmdb_actualizacion DROP CONSTRAINT IF EXISTS cmdb_actualizacion_id_ci_fkey;
ALTER TABLE cmdb_actualizacion ADD CONSTRAINT cmdb_actualizacion_id_ci_fkey FOREIGN KEY (id_ci) REFERENCES elemento_configuracion(id_ci);

ALTER TABLE cmdb_inexactitud DROP CONSTRAINT IF EXISTS cmdb_inexactitud_id_usuario_reporta_fkey;
ALTER TABLE cmdb_inexactitud ADD CONSTRAINT cmdb_inexactitud_id_usuario_reporta_fkey FOREIGN KEY (id_usuario_reporta) REFERENCES usuario(id_usuario);

ALTER TABLE cmdb_inexactitud DROP CONSTRAINT IF EXISTS cmdb_inexactitud_id_ci_fkey;
ALTER TABLE cmdb_inexactitud ADD CONSTRAINT cmdb_inexactitud_id_ci_fkey FOREIGN KEY (id_ci) REFERENCES elemento_configuracion(id_ci);

ALTER TABLE cmdb_inexactitud DROP CONSTRAINT IF EXISTS cmdb_inexactitud_id_usuario_asigna_fkey;
ALTER TABLE cmdb_inexactitud ADD CONSTRAINT cmdb_inexactitud_id_usuario_asigna_fkey FOREIGN KEY (id_usuario_asigna) REFERENCES usuario(id_usuario);

ALTER TABLE cmdb_linea_base DROP CONSTRAINT IF EXISTS cmdb_linea_base_id_usuario_creacion_fkey;
ALTER TABLE cmdb_linea_base ADD CONSTRAINT cmdb_linea_base_id_usuario_creacion_fkey FOREIGN KEY (id_usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE cmdb_linea_base DROP CONSTRAINT IF EXISTS cmdb_linea_base_id_ci_fkey;
ALTER TABLE cmdb_linea_base ADD CONSTRAINT cmdb_linea_base_id_ci_fkey FOREIGN KEY (id_ci) REFERENCES elemento_configuracion(id_ci);

ALTER TABLE codigo_recuperacion DROP CONSTRAINT IF EXISTS codigo_recuperacion_id_usuario_fkey;
ALTER TABLE codigo_recuperacion ADD CONSTRAINT codigo_recuperacion_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE colaborador_autorizacion DROP CONSTRAINT IF EXISTS colaborador_autorizacion_id_usuario_fkey;
ALTER TABLE colaborador_autorizacion ADD CONSTRAINT colaborador_autorizacion_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE colaborador_autorizacion DROP CONSTRAINT IF EXISTS colaborador_autorizacion_otorgado_por_fkey;
ALTER TABLE colaborador_autorizacion ADD CONSTRAINT colaborador_autorizacion_otorgado_por_fkey FOREIGN KEY (otorgado_por) REFERENCES usuario(id_usuario);

ALTER TABLE comentario_ticket DROP CONSTRAINT IF EXISTS comentario_ticket_id_estado_cambiado_fkey;
ALTER TABLE comentario_ticket ADD CONSTRAINT comentario_ticket_id_estado_cambiado_fkey FOREIGN KEY (id_estado_cambiado) REFERENCES estado_ticket(id_estado);

ALTER TABLE comentario_ticket DROP CONSTRAINT IF EXISTS comentario_ticket_id_ticket_fkey;
ALTER TABLE comentario_ticket ADD CONSTRAINT comentario_ticket_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket) ON DELETE CASCADE;

ALTER TABLE comentario_ticket DROP CONSTRAINT IF EXISTS comentario_ticket_id_usuario_fkey;
ALTER TABLE comentario_ticket ADD CONSTRAINT comentario_ticket_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE configuracion_modulo_versiones DROP CONSTRAINT IF EXISTS configuracion_modulo_versiones_id_usuario_creacion_fkey;
ALTER TABLE configuracion_modulo_versiones ADD CONSTRAINT configuracion_modulo_versiones_id_usuario_creacion_fkey FOREIGN KEY (id_usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE configuracion_rfc DROP CONSTRAINT IF EXISTS configuracion_rfc_usuario_modificacion_fkey;
ALTER TABLE configuracion_rfc ADD CONSTRAINT configuracion_rfc_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE configuracion_sistema DROP CONSTRAINT IF EXISTS configuracion_sistema_usuario_modificacion_fkey;
ALTER TABLE configuracion_sistema ADD CONSTRAINT configuracion_sistema_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE contrato_ti DROP CONSTRAINT IF EXISTS contrato_ti_usuario_creacion_fkey;
ALTER TABLE contrato_ti ADD CONSTRAINT contrato_ti_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE contrato_ti DROP CONSTRAINT IF EXISTS contrato_ti_id_proveedor_fkey;
ALTER TABLE contrato_ti ADD CONSTRAINT contrato_ti_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES proveedor_ti(id_proveedor);

ALTER TABLE departamento_ti DROP CONSTRAINT IF EXISTS departamento_ti_id_supervisor_fkey;
ALTER TABLE departamento_ti ADD CONSTRAINT departamento_ti_id_supervisor_fkey FOREIGN KEY (id_supervisor) REFERENCES usuario(id_usuario);

ALTER TABLE ecab_decision DROP CONSTRAINT IF EXISTS ecab_decision_id_aprobador_fkey;
ALTER TABLE ecab_decision ADD CONSTRAINT ecab_decision_id_aprobador_fkey FOREIGN KEY (id_aprobador) REFERENCES usuario(id_usuario);

ALTER TABLE ecab_decision DROP CONSTRAINT IF EXISTS ecab_decision_id_cambio_fkey;
ALTER TABLE ecab_decision ADD CONSTRAINT ecab_decision_id_cambio_fkey FOREIGN KEY (id_cambio) REFERENCES cambio(id_cambio);

ALTER TABLE elemento_configuracion DROP CONSTRAINT IF EXISTS elemento_configuracion_id_activo_fkey;
ALTER TABLE elemento_configuracion ADD CONSTRAINT elemento_configuracion_id_activo_fkey FOREIGN KEY (id_activo) REFERENCES activo(id_activo);

ALTER TABLE elemento_configuracion DROP CONSTRAINT IF EXISTS elemento_configuracion_usuario_creacion_fkey;
ALTER TABLE elemento_configuracion ADD CONSTRAINT elemento_configuracion_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE elemento_configuracion DROP CONSTRAINT IF EXISTS elemento_configuracion_usuario_inactivacion_fkey;
ALTER TABLE elemento_configuracion ADD CONSTRAINT elemento_configuracion_usuario_inactivacion_fkey FOREIGN KEY (usuario_inactivacion) REFERENCES usuario(id_usuario);

ALTER TABLE elemento_configuracion DROP CONSTRAINT IF EXISTS elemento_configuracion_id_departamento_soporte_fkey;
ALTER TABLE elemento_configuracion ADD CONSTRAINT elemento_configuracion_id_departamento_soporte_fkey FOREIGN KEY (id_departamento_soporte) REFERENCES departamento_ti(id_departamento);

ALTER TABLE equipo_recurso_compartido DROP CONSTRAINT IF EXISTS equipo_recurso_compartido_id_departamento_fkey;
ALTER TABLE equipo_recurso_compartido ADD CONSTRAINT equipo_recurso_compartido_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_ti(id_departamento);

ALTER TABLE equipo_recurso_compartido DROP CONSTRAINT IF EXISTS equipo_recurso_compartido_id_usuario_creacion_fkey;
ALTER TABLE equipo_recurso_compartido ADD CONSTRAINT equipo_recurso_compartido_id_usuario_creacion_fkey FOREIGN KEY (id_usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE error_conocido DROP CONSTRAINT IF EXISTS error_conocido_id_problema_fkey;
ALTER TABLE error_conocido ADD CONSTRAINT error_conocido_id_problema_fkey FOREIGN KEY (id_problema) REFERENCES problema(id_problema);

ALTER TABLE evento_servicio DROP CONSTRAINT IF EXISTS evento_servicio_usuario_creacion_fkey;
ALTER TABLE evento_servicio ADD CONSTRAINT evento_servicio_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE evento_servicio DROP CONSTRAINT IF EXISTS evento_servicio_id_ticket_fkey;
ALTER TABLE evento_servicio ADD CONSTRAINT evento_servicio_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket);

ALTER TABLE evento_servicio DROP CONSTRAINT IF EXISTS evento_servicio_id_ci_fkey;
ALTER TABLE evento_servicio ADD CONSTRAINT evento_servicio_id_ci_fkey FOREIGN KEY (id_ci) REFERENCES elemento_configuracion(id_ci);

ALTER TABLE evento_servicio DROP CONSTRAINT IF EXISTS evento_servicio_cerrado_por_fkey;
ALTER TABLE evento_servicio ADD CONSTRAINT evento_servicio_cerrado_por_fkey FOREIGN KEY (cerrado_por) REFERENCES usuario(id_usuario);

ALTER TABLE evento_servicio DROP CONSTRAINT IF EXISTS evento_servicio_reconocido_por_fkey;
ALTER TABLE evento_servicio ADD CONSTRAINT evento_servicio_reconocido_por_fkey FOREIGN KEY (reconocido_por) REFERENCES usuario(id_usuario);

ALTER TABLE importacion_activos DROP CONSTRAINT IF EXISTS importacion_activos_id_usuario_fkey;
ALTER TABLE importacion_activos ADD CONSTRAINT importacion_activos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE incidente_mayor DROP CONSTRAINT IF EXISTS incidente_mayor_id_problema_fkey;
ALTER TABLE incidente_mayor ADD CONSTRAINT incidente_mayor_id_problema_fkey FOREIGN KEY (id_problema) REFERENCES problema(id_problema);

ALTER TABLE incidente_mayor DROP CONSTRAINT IF EXISTS incidente_mayor_id_usuario_declara_fkey;
ALTER TABLE incidente_mayor ADD CONSTRAINT incidente_mayor_id_usuario_declara_fkey FOREIGN KEY (id_usuario_declara) REFERENCES usuario(id_usuario);

ALTER TABLE incidente_mayor DROP CONSTRAINT IF EXISTS incidente_mayor_id_departamento_fkey;
ALTER TABLE incidente_mayor ADD CONSTRAINT incidente_mayor_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_ti(id_departamento);

ALTER TABLE incidente_mayor DROP CONSTRAINT IF EXISTS incidente_mayor_id_usuario_cierra_fkey;
ALTER TABLE incidente_mayor ADD CONSTRAINT incidente_mayor_id_usuario_cierra_fkey FOREIGN KEY (id_usuario_cierra) REFERENCES usuario(id_usuario);

ALTER TABLE incidente_mayor DROP CONSTRAINT IF EXISTS incidente_mayor_id_ticket_fkey;
ALTER TABLE incidente_mayor ADD CONSTRAINT incidente_mayor_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket);

ALTER TABLE informe_auditoria DROP CONSTRAINT IF EXISTS informe_auditoria_id_auditor_fkey;
ALTER TABLE informe_auditoria ADD CONSTRAINT informe_auditoria_id_auditor_fkey FOREIGN KEY (id_auditor) REFERENCES usuario(id_usuario);

ALTER TABLE informe_evidencia DROP CONSTRAINT IF EXISTS informe_evidencia_id_informe_fkey;
ALTER TABLE informe_evidencia ADD CONSTRAINT informe_evidencia_id_informe_fkey FOREIGN KEY (id_informe) REFERENCES informe_auditoria(id_informe);

ALTER TABLE informe_evidencia DROP CONSTRAINT IF EXISTS informe_evidencia_creado_por_fkey;
ALTER TABLE informe_evidencia ADD CONSTRAINT informe_evidencia_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES usuario(id_usuario);

ALTER TABLE licencia_asignacion DROP CONSTRAINT IF EXISTS licencia_asignacion_id_usuario_fkey;
ALTER TABLE licencia_asignacion ADD CONSTRAINT licencia_asignacion_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE licencia_asignacion DROP CONSTRAINT IF EXISTS licencia_asignacion_id_licencia_fkey;
ALTER TABLE licencia_asignacion ADD CONSTRAINT licencia_asignacion_id_licencia_fkey FOREIGN KEY (id_licencia) REFERENCES licencia_software(id_licencia);

ALTER TABLE licencia_asignacion DROP CONSTRAINT IF EXISTS licencia_asignacion_id_activo_fkey;
ALTER TABLE licencia_asignacion ADD CONSTRAINT licencia_asignacion_id_activo_fkey FOREIGN KEY (id_activo) REFERENCES activo(id_activo);

ALTER TABLE licencia_asignacion DROP CONSTRAINT IF EXISTS licencia_asignacion_id_usuario_registro_fkey;
ALTER TABLE licencia_asignacion ADD CONSTRAINT licencia_asignacion_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuario(id_usuario);

ALTER TABLE licencia_software DROP CONSTRAINT IF EXISTS licencia_software_usuario_creacion_fkey;
ALTER TABLE licencia_software ADD CONSTRAINT licencia_software_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE log_acceso DROP CONSTRAINT IF EXISTS log_acceso_id_usuario_fkey;
ALTER TABLE log_acceso ADD CONSTRAINT log_acceso_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE log_auditoria_sistema DROP CONSTRAINT IF EXISTS log_auditoria_sistema_id_usuario_fkey;
ALTER TABLE log_auditoria_sistema ADD CONSTRAINT log_auditoria_sistema_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE mantenimiento_activo DROP CONSTRAINT IF EXISTS mantenimiento_activo_id_usuario_responsable_fkey;
ALTER TABLE mantenimiento_activo ADD CONSTRAINT mantenimiento_activo_id_usuario_responsable_fkey FOREIGN KEY (id_usuario_responsable) REFERENCES usuario(id_usuario);

ALTER TABLE mantenimiento_activo DROP CONSTRAINT IF EXISTS mantenimiento_activo_usuario_creacion_fkey;
ALTER TABLE mantenimiento_activo ADD CONSTRAINT mantenimiento_activo_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE mantenimiento_activo DROP CONSTRAINT IF EXISTS mantenimiento_activo_id_activo_fkey;
ALTER TABLE mantenimiento_activo ADD CONSTRAINT mantenimiento_activo_id_activo_fkey FOREIGN KEY (id_activo) REFERENCES activo(id_activo);

ALTER TABLE matriz_prioridad_institucional DROP CONSTRAINT IF EXISTS matriz_prioridad_institucional_id_prioridad_fkey;
ALTER TABLE matriz_prioridad_institucional ADD CONSTRAINT matriz_prioridad_institucional_id_prioridad_fkey FOREIGN KEY (id_prioridad) REFERENCES prioridad_ticket(id_prioridad);

ALTER TABLE modelo_activo DROP CONSTRAINT IF EXISTS modelo_activo_usuario_modificacion_fkey;
ALTER TABLE modelo_activo ADD CONSTRAINT modelo_activo_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE modelo_activo DROP CONSTRAINT IF EXISTS modelo_activo_id_tipo_activo_fkey;
ALTER TABLE modelo_activo ADD CONSTRAINT modelo_activo_id_tipo_activo_fkey FOREIGN KEY (id_tipo_activo) REFERENCES tipo_activo_catalogo(id_tipo_activo);

ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_usuario_id_fkey;
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE opciones_menu DROP CONSTRAINT IF EXISTS opciones_menu_id_padre_fkey;
ALTER TABLE opciones_menu ADD CONSTRAINT opciones_menu_id_padre_fkey FOREIGN KEY (id_padre) REFERENCES opciones_menu(id_opcion_menu);

ALTER TABLE opciones_menu_perfiles DROP CONSTRAINT IF EXISTS opciones_menu_perfiles_id_perfil_fkey;
ALTER TABLE opciones_menu_perfiles ADD CONSTRAINT opciones_menu_perfiles_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil);

ALTER TABLE opciones_menu_perfiles DROP CONSTRAINT IF EXISTS opciones_menu_perfiles_id_opcion_menu_fkey;
ALTER TABLE opciones_menu_perfiles ADD CONSTRAINT opciones_menu_perfiles_id_opcion_menu_fkey FOREIGN KEY (id_opcion_menu) REFERENCES opciones_menu(id_opcion_menu);

ALTER TABLE opciones_menu_vistas_perfiles DROP CONSTRAINT IF EXISTS opciones_menu_vistas_perfiles_id_opcion_menu_fkey;
ALTER TABLE opciones_menu_vistas_perfiles ADD CONSTRAINT opciones_menu_vistas_perfiles_id_opcion_menu_fkey FOREIGN KEY (id_opcion_menu) REFERENCES opciones_menu(id_opcion_menu) ON DELETE CASCADE;

ALTER TABLE opciones_menu_vistas_perfiles DROP CONSTRAINT IF EXISTS opciones_menu_vistas_perfiles_id_perfil_fkey;
ALTER TABLE opciones_menu_vistas_perfiles ADD CONSTRAINT opciones_menu_vistas_perfiles_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE;

ALTER TABLE plantilla_problema DROP CONSTRAINT IF EXISTS plantilla_problema_id_categoria_fkey;
ALTER TABLE plantilla_problema ADD CONSTRAINT plantilla_problema_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES problema_categoria(id_categoria);

ALTER TABLE plantilla_problema DROP CONSTRAINT IF EXISTS plantilla_problema_usuario_creacion_fkey;
ALTER TABLE plantilla_problema ADD CONSTRAINT plantilla_problema_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE preferencia_notificacion DROP CONSTRAINT IF EXISTS preferencia_notificacion_id_usuario_fkey;
ALTER TABLE preferencia_notificacion ADD CONSTRAINT preferencia_notificacion_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE problema DROP CONSTRAINT IF EXISTS problema_id_departamento_fkey;
ALTER TABLE problema ADD CONSTRAINT problema_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_ti(id_departamento);

ALTER TABLE problema DROP CONSTRAINT IF EXISTS problema_id_impacto_fkey;
ALTER TABLE problema ADD CONSTRAINT problema_id_impacto_fkey FOREIGN KEY (id_impacto) REFERENCES impacto_ticket(id_impacto);

ALTER TABLE problema DROP CONSTRAINT IF EXISTS problema_id_prioridad_fkey;
ALTER TABLE problema ADD CONSTRAINT problema_id_prioridad_fkey FOREIGN KEY (id_prioridad) REFERENCES prioridad_ticket(id_prioridad);

ALTER TABLE problema DROP CONSTRAINT IF EXISTS problema_id_urgencia_fkey;
ALTER TABLE problema ADD CONSTRAINT problema_id_urgencia_fkey FOREIGN KEY (id_urgencia) REFERENCES urgencia_ticket(id_urgencia);

ALTER TABLE problema DROP CONSTRAINT IF EXISTS problema_id_usuario_asignado_fkey;
ALTER TABLE problema ADD CONSTRAINT problema_id_usuario_asignado_fkey FOREIGN KEY (id_usuario_asignado) REFERENCES usuario(id_usuario);

ALTER TABLE problema DROP CONSTRAINT IF EXISTS problema_usuario_creacion_fkey;
ALTER TABLE problema ADD CONSTRAINT problema_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE problema DROP CONSTRAINT IF EXISTS problema_usuario_modificacion_fkey;
ALTER TABLE problema ADD CONSTRAINT problema_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE problema DROP CONSTRAINT IF EXISTS problema_id_ci_afectado_fkey;
ALTER TABLE problema ADD CONSTRAINT problema_id_ci_afectado_fkey FOREIGN KEY (id_ci_afectado) REFERENCES elemento_configuracion(id_ci);

ALTER TABLE problema_analisis DROP CONSTRAINT IF EXISTS problema_analisis_id_usuario_fkey;
ALTER TABLE problema_analisis ADD CONSTRAINT problema_analisis_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE problema_analisis DROP CONSTRAINT IF EXISTS problema_analisis_id_problema_fkey;
ALTER TABLE problema_analisis ADD CONSTRAINT problema_analisis_id_problema_fkey FOREIGN KEY (id_problema) REFERENCES problema(id_problema);

ALTER TABLE problema_categoria DROP CONSTRAINT IF EXISTS problema_categoria_id_usuario_defecto_fkey;
ALTER TABLE problema_categoria ADD CONSTRAINT problema_categoria_id_usuario_defecto_fkey FOREIGN KEY (id_usuario_defecto) REFERENCES usuario(id_usuario);

ALTER TABLE problema_categoria DROP CONSTRAINT IF EXISTS problema_categoria_id_servicio_defecto_fkey;
ALTER TABLE problema_categoria ADD CONSTRAINT problema_categoria_id_servicio_defecto_fkey FOREIGN KEY (id_servicio_defecto) REFERENCES servicio_catalogo(id_servicio);

ALTER TABLE problema_categoria DROP CONSTRAINT IF EXISTS problema_categoria_id_departamento_defecto_fkey;
ALTER TABLE problema_categoria ADD CONSTRAINT problema_categoria_id_departamento_defecto_fkey FOREIGN KEY (id_departamento_defecto) REFERENCES departamento_ti(id_departamento);

ALTER TABLE problema_categoria DROP CONSTRAINT IF EXISTS problema_categoria_id_padre_fkey;
ALTER TABLE problema_categoria ADD CONSTRAINT problema_categoria_id_padre_fkey FOREIGN KEY (id_padre) REFERENCES problema_categoria(id_categoria);

ALTER TABLE problema_cierre_aprobacion DROP CONSTRAINT IF EXISTS problema_cierre_aprobacion_id_aprobador_fkey;
ALTER TABLE problema_cierre_aprobacion ADD CONSTRAINT problema_cierre_aprobacion_id_aprobador_fkey FOREIGN KEY (id_aprobador) REFERENCES usuario(id_usuario);

ALTER TABLE problema_cierre_aprobacion DROP CONSTRAINT IF EXISTS problema_cierre_aprobacion_id_problema_fkey;
ALTER TABLE problema_cierre_aprobacion ADD CONSTRAINT problema_cierre_aprobacion_id_problema_fkey FOREIGN KEY (id_problema) REFERENCES problema(id_problema);

ALTER TABLE problema_config_mayor DROP CONSTRAINT IF EXISTS problema_config_mayor_aprobacion_cierre_perfil_fkey;
ALTER TABLE problema_config_mayor ADD CONSTRAINT problema_config_mayor_aprobacion_cierre_perfil_fkey FOREIGN KEY (aprobacion_cierre_perfil) REFERENCES perfiles(id_perfil);

ALTER TABLE problema_config_reapertura DROP CONSTRAINT IF EXISTS problema_config_reapertura_estado_destino_id_fkey;
ALTER TABLE problema_config_reapertura ADD CONSTRAINT problema_config_reapertura_estado_destino_id_fkey FOREIGN KEY (estado_destino_id) REFERENCES problema_estado(id_estado);

ALTER TABLE problema_incidente DROP CONSTRAINT IF EXISTS problema_incidente_id_problema_fkey;
ALTER TABLE problema_incidente ADD CONSTRAINT problema_incidente_id_problema_fkey FOREIGN KEY (id_problema) REFERENCES problema(id_problema);

ALTER TABLE problema_incidente DROP CONSTRAINT IF EXISTS problema_incidente_id_ticket_fkey;
ALTER TABLE problema_incidente ADD CONSTRAINT problema_incidente_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket);

ALTER TABLE problema_objetivo_tiempo DROP CONSTRAINT IF EXISTS problema_objetivo_tiempo_id_prioridad_fkey;
ALTER TABLE problema_objetivo_tiempo ADD CONSTRAINT problema_objetivo_tiempo_id_prioridad_fkey FOREIGN KEY (id_prioridad) REFERENCES prioridad_ticket(id_prioridad);

ALTER TABLE problema_regla_asignacion DROP CONSTRAINT IF EXISTS problema_regla_asignacion_id_departamento_destino_fkey;
ALTER TABLE problema_regla_asignacion ADD CONSTRAINT problema_regla_asignacion_id_departamento_destino_fkey FOREIGN KEY (id_departamento_destino) REFERENCES departamento_ti(id_departamento);

ALTER TABLE problema_regla_asignacion DROP CONSTRAINT IF EXISTS problema_regla_asignacion_id_tecnico_fijo_fkey;
ALTER TABLE problema_regla_asignacion ADD CONSTRAINT problema_regla_asignacion_id_tecnico_fijo_fkey FOREIGN KEY (id_tecnico_fijo) REFERENCES usuario(id_usuario);

ALTER TABLE problema_regla_umbral_ejecucion DROP CONSTRAINT IF EXISTS problema_regla_umbral_ejecucion_id_regla_fkey;
ALTER TABLE problema_regla_umbral_ejecucion ADD CONSTRAINT problema_regla_umbral_ejecucion_id_regla_fkey FOREIGN KEY (id_regla) REFERENCES problema_regla_umbral(id_regla) ON DELETE CASCADE;

ALTER TABLE problema_relaciones_version DROP CONSTRAINT IF EXISTS problema_relaciones_version_creado_por_fkey;
ALTER TABLE problema_relaciones_version ADD CONSTRAINT problema_relaciones_version_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES usuario(id_usuario);

ALTER TABLE problema_relaciones_version DROP CONSTRAINT IF EXISTS problema_relaciones_version_publicado_por_fkey;
ALTER TABLE problema_relaciones_version ADD CONSTRAINT problema_relaciones_version_publicado_por_fkey FOREIGN KEY (publicado_por) REFERENCES usuario(id_usuario);

ALTER TABLE problema_tarea_catalogo DROP CONSTRAINT IF EXISTS problema_tarea_catalogo_id_departamento_destino_fkey;
ALTER TABLE problema_tarea_catalogo ADD CONSTRAINT problema_tarea_catalogo_id_departamento_destino_fkey FOREIGN KEY (id_departamento_destino) REFERENCES departamento_ti(id_departamento);

ALTER TABLE problema_transicion DROP CONSTRAINT IF EXISTS problema_transicion_estado_destino_id_fkey;
ALTER TABLE problema_transicion ADD CONSTRAINT problema_transicion_estado_destino_id_fkey FOREIGN KEY (estado_destino_id) REFERENCES problema_estado(id_estado);

ALTER TABLE problema_transicion DROP CONSTRAINT IF EXISTS problema_transicion_estado_origen_id_fkey;
ALTER TABLE problema_transicion ADD CONSTRAINT problema_transicion_estado_origen_id_fkey FOREIGN KEY (estado_origen_id) REFERENCES problema_estado(id_estado);

ALTER TABLE proveedor_ti DROP CONSTRAINT IF EXISTS proveedor_ti_usuario_modificacion_fkey;
ALTER TABLE proveedor_ti ADD CONSTRAINT proveedor_ti_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE proveedor_ti DROP CONSTRAINT IF EXISTS proveedor_ti_usuario_creacion_fkey;
ALTER TABLE proveedor_ti ADD CONSTRAINT proveedor_ti_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE recepcion_activo DROP CONSTRAINT IF EXISTS recepcion_activo_id_proveedor_fkey;
ALTER TABLE recepcion_activo ADD CONSTRAINT recepcion_activo_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES proveedor_ti(id_proveedor);

ALTER TABLE recepcion_activo DROP CONSTRAINT IF EXISTS recepcion_activo_id_usuario_fkey;
ALTER TABLE recepcion_activo ADD CONSTRAINT recepcion_activo_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE recertificacion_acceso DROP CONSTRAINT IF EXISTS recertificacion_acceso_id_auditor_fkey;
ALTER TABLE recertificacion_acceso ADD CONSTRAINT recertificacion_acceso_id_auditor_fkey FOREIGN KEY (id_auditor) REFERENCES usuario(id_usuario);

ALTER TABLE recertificacion_acceso DROP CONSTRAINT IF EXISTS recertificacion_acceso_id_usuario_fkey;
ALTER TABLE recertificacion_acceso ADD CONSTRAINT recertificacion_acceso_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE recertificacion_acceso DROP CONSTRAINT IF EXISTS recertificacion_acceso_id_perfil_fkey;
ALTER TABLE recertificacion_acceso ADD CONSTRAINT recertificacion_acceso_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil);

ALTER TABLE regla_notificacion DROP CONSTRAINT IF EXISTS regla_notificacion_usuario_modificacion_fkey;
ALTER TABLE regla_notificacion ADD CONSTRAINT regla_notificacion_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE renovacion_contrato DROP CONSTRAINT IF EXISTS renovacion_contrato_id_usuario_solicita_fkey;
ALTER TABLE renovacion_contrato ADD CONSTRAINT renovacion_contrato_id_usuario_solicita_fkey FOREIGN KEY (id_usuario_solicita) REFERENCES usuario(id_usuario);

ALTER TABLE renovacion_contrato DROP CONSTRAINT IF EXISTS renovacion_contrato_id_contrato_fkey;
ALTER TABLE renovacion_contrato ADD CONSTRAINT renovacion_contrato_id_contrato_fkey FOREIGN KEY (id_contrato) REFERENCES contrato_ti(id_contrato);

ALTER TABLE resiliencia_servicio DROP CONSTRAINT IF EXISTS resiliencia_servicio_id_responsable_fkey;
ALTER TABLE resiliencia_servicio ADD CONSTRAINT resiliencia_servicio_id_responsable_fkey FOREIGN KEY (id_responsable) REFERENCES usuario(id_usuario);

ALTER TABLE resiliencia_servicio DROP CONSTRAINT IF EXISTS resiliencia_servicio_id_servicio_fkey;
ALTER TABLE resiliencia_servicio ADD CONSTRAINT resiliencia_servicio_id_servicio_fkey FOREIGN KEY (id_servicio) REFERENCES servicio_catalogo(id_servicio);

ALTER TABLE resiliencia_servicio DROP CONSTRAINT IF EXISTS resiliencia_servicio_usuario_modificacion_fkey;
ALTER TABLE resiliencia_servicio ADD CONSTRAINT resiliencia_servicio_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE resiliencia_servicio DROP CONSTRAINT IF EXISTS resiliencia_servicio_usuario_creacion_fkey;
ALTER TABLE resiliencia_servicio ADD CONSTRAINT resiliencia_servicio_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE respuestas_predefinidas DROP CONSTRAINT IF EXISTS respuestas_predefinidas_id_departamento_fkey;
ALTER TABLE respuestas_predefinidas ADD CONSTRAINT respuestas_predefinidas_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_ti(id_departamento) ON DELETE SET NULL;

ALTER TABLE respuestas_predefinidas DROP CONSTRAINT IF EXISTS respuestas_predefinidas_id_usuario_fkey;
ALTER TABLE respuestas_predefinidas ADD CONSTRAINT respuestas_predefinidas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE SET NULL;

ALTER TABLE servicio_catalogo DROP CONSTRAINT IF EXISTS servicio_catalogo_responsable_servicio_id_fkey;
ALTER TABLE servicio_catalogo ADD CONSTRAINT servicio_catalogo_responsable_servicio_id_fkey FOREIGN KEY (responsable_servicio_id) REFERENCES usuario(id_usuario);

ALTER TABLE servicio_catalogo DROP CONSTRAINT IF EXISTS servicio_catalogo_usuario_inactivacion_fkey;
ALTER TABLE servicio_catalogo ADD CONSTRAINT servicio_catalogo_usuario_inactivacion_fkey FOREIGN KEY (usuario_inactivacion) REFERENCES usuario(id_usuario);

ALTER TABLE servicio_catalogo DROP CONSTRAINT IF EXISTS servicio_catalogo_id_tipo_ticket_fkey;
ALTER TABLE servicio_catalogo ADD CONSTRAINT servicio_catalogo_id_tipo_ticket_fkey FOREIGN KEY (id_tipo_ticket) REFERENCES tipo_ticket(id_tipo_ticket);

ALTER TABLE servicio_catalogo DROP CONSTRAINT IF EXISTS servicio_catalogo_id_departamento_resolutor_fkey;
ALTER TABLE servicio_catalogo ADD CONSTRAINT servicio_catalogo_id_departamento_resolutor_fkey FOREIGN KEY (id_departamento_resolutor) REFERENCES departamento_ti(id_departamento);

ALTER TABLE servicio_catalogo DROP CONSTRAINT IF EXISTS fk_servicio_categoria_tipo;
ALTER TABLE servicio_catalogo ADD CONSTRAINT fk_servicio_categoria_tipo FOREIGN KEY (id_categoria, id_tipo_ticket) REFERENCES categoria_ticket(id_categoria, id_tipo_ticket);

ALTER TABLE servicio_catalogo_perfiles DROP CONSTRAINT IF EXISTS servicio_catalogo_perfiles_id_servicio_fkey;
ALTER TABLE servicio_catalogo_perfiles ADD CONSTRAINT servicio_catalogo_perfiles_id_servicio_fkey FOREIGN KEY (id_servicio) REFERENCES servicio_catalogo(id_servicio) ON DELETE CASCADE;

ALTER TABLE servicio_catalogo_perfiles DROP CONSTRAINT IF EXISTS servicio_catalogo_perfiles_id_perfil_fkey;
ALTER TABLE servicio_catalogo_perfiles ADD CONSTRAINT servicio_catalogo_perfiles_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil);

ALTER TABLE servicio_workflow_paso DROP CONSTRAINT IF EXISTS servicio_workflow_paso_id_servicio_fkey;
ALTER TABLE servicio_workflow_paso ADD CONSTRAINT servicio_workflow_paso_id_servicio_fkey FOREIGN KEY (id_servicio) REFERENCES servicio_catalogo(id_servicio) ON DELETE CASCADE;

ALTER TABLE software_autorizado DROP CONSTRAINT IF EXISTS software_autorizado_id_usuario_aprueba_fkey;
ALTER TABLE software_autorizado ADD CONSTRAINT software_autorizado_id_usuario_aprueba_fkey FOREIGN KEY (id_usuario_aprueba) REFERENCES usuario(id_usuario);

ALTER TABLE software_autorizado DROP CONSTRAINT IF EXISTS software_autorizado_usuario_creacion_fkey;
ALTER TABLE software_autorizado ADD CONSTRAINT software_autorizado_usuario_creacion_fkey FOREIGN KEY (usuario_creacion) REFERENCES usuario(id_usuario);

ALTER TABLE solicitud_baja_activo DROP CONSTRAINT IF EXISTS solicitud_baja_activo_id_activo_fkey;
ALTER TABLE solicitud_baja_activo ADD CONSTRAINT solicitud_baja_activo_id_activo_fkey FOREIGN KEY (id_activo) REFERENCES activo(id_activo);

ALTER TABLE solicitud_baja_activo DROP CONSTRAINT IF EXISTS solicitud_baja_activo_id_usuario_solicita_fkey;
ALTER TABLE solicitud_baja_activo ADD CONSTRAINT solicitud_baja_activo_id_usuario_solicita_fkey FOREIGN KEY (id_usuario_solicita) REFERENCES usuario(id_usuario);

ALTER TABLE solicitud_baja_activo DROP CONSTRAINT IF EXISTS solicitud_baja_activo_id_usuario_resuelve_fkey;
ALTER TABLE solicitud_baja_activo ADD CONSTRAINT solicitud_baja_activo_id_usuario_resuelve_fkey FOREIGN KEY (id_usuario_resuelve) REFERENCES usuario(id_usuario);

ALTER TABLE tecnico_ausencias DROP CONSTRAINT IF EXISTS tecnico_ausencias_id_usuario_reemplazo_fkey;
ALTER TABLE tecnico_ausencias ADD CONSTRAINT tecnico_ausencias_id_usuario_reemplazo_fkey FOREIGN KEY (id_usuario_reemplazo) REFERENCES usuario(id_usuario);

ALTER TABLE tecnico_ausencias DROP CONSTRAINT IF EXISTS tecnico_ausencias_creado_por_fkey;
ALTER TABLE tecnico_ausencias ADD CONSTRAINT tecnico_ausencias_creado_por_fkey FOREIGN KEY (registrado_por) REFERENCES usuario(id_usuario);

ALTER TABLE tecnico_ausencias DROP CONSTRAINT IF EXISTS tecnico_ausencias_id_tecnico_fkey;
ALTER TABLE tecnico_ausencias ADD CONSTRAINT tecnico_ausencias_id_tecnico_fkey FOREIGN KEY (id_usuario_tecnico) REFERENCES usuario(id_usuario);

ALTER TABLE tecnico_detalle DROP CONSTRAINT IF EXISTS tecnico_detalle_id_usuario_fkey;
ALTER TABLE tecnico_detalle ADD CONSTRAINT tecnico_detalle_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE tecnico_detalle DROP CONSTRAINT IF EXISTS tecnico_detalle_id_departamento_fkey;
ALTER TABLE tecnico_detalle ADD CONSTRAINT tecnico_detalle_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_ti(id_departamento);

ALTER TABLE tecnico_recordatorios DROP CONSTRAINT IF EXISTS tecnico_recordatorios_id_usuario_fkey;
ALTER TABLE tecnico_recordatorios ADD CONSTRAINT tecnico_recordatorios_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE tecnico_turnos DROP CONSTRAINT IF EXISTS tecnico_turnos_registrado_por_fkey;
ALTER TABLE tecnico_turnos ADD CONSTRAINT tecnico_turnos_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES usuario(id_usuario);

ALTER TABLE tecnico_turnos DROP CONSTRAINT IF EXISTS tecnico_turnos_id_usuario_tecnico_fkey;
ALTER TABLE tecnico_turnos ADD CONSTRAINT tecnico_turnos_id_usuario_tecnico_fkey FOREIGN KEY (id_usuario_tecnico) REFERENCES usuario(id_usuario);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_motivo_espera_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_motivo_espera_fkey FOREIGN KEY (id_motivo_espera) REFERENCES motivo_espera_ticket(id_motivo_espera);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS fk_ticket_categoria_tipo;
ALTER TABLE ticket ADD CONSTRAINT fk_ticket_categoria_tipo FOREIGN KEY (id_categoria, id_tipo_ticket) REFERENCES categoria_ticket(id_categoria, id_tipo_ticket);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_categoria_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES categoria_ticket(id_categoria);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_ci_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_ci_fkey FOREIGN KEY (id_ci) REFERENCES elemento_configuracion(id_ci);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_departamento_empresa_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_departamento_empresa_fkey FOREIGN KEY (id_departamento_empresa) REFERENCES departamento_empresa(id_departamento_empresa);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_usuario_solicitante_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_usuario_solicitante_fkey FOREIGN KEY (id_usuario_solicitante) REFERENCES usuario(id_usuario);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_usuario_asignado_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_usuario_asignado_fkey FOREIGN KEY (id_usuario_asignado) REFERENCES usuario(id_usuario);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_urgencia_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_urgencia_fkey FOREIGN KEY (id_urgencia) REFERENCES urgencia_ticket(id_urgencia);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_tipo_ticket_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_tipo_ticket_fkey FOREIGN KEY (id_tipo_ticket) REFERENCES tipo_ticket(id_tipo_ticket);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_servicio_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_servicio_fkey FOREIGN KEY (id_servicio) REFERENCES servicio_catalogo(id_servicio);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_prioridad_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_prioridad_fkey FOREIGN KEY (id_prioridad) REFERENCES prioridad_ticket(id_prioridad);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_departamento_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_ti(id_departamento);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_impacto_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_impacto_fkey FOREIGN KEY (id_impacto) REFERENCES impacto_ticket(id_impacto);

ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_estado_fkey;
ALTER TABLE ticket ADD CONSTRAINT ticket_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES estado_ticket(id_estado);

ALTER TABLE ticket_aprobacion DROP CONSTRAINT IF EXISTS ticket_aprobacion_id_paso_workflow_fkey;
ALTER TABLE ticket_aprobacion ADD CONSTRAINT ticket_aprobacion_id_paso_workflow_fkey FOREIGN KEY (id_paso_workflow) REFERENCES servicio_workflow_paso(id_paso);

ALTER TABLE ticket_aprobacion DROP CONSTRAINT IF EXISTS ticket_aprobacion_id_usuario_aprobador_fkey;
ALTER TABLE ticket_aprobacion ADD CONSTRAINT ticket_aprobacion_id_usuario_aprobador_fkey FOREIGN KEY (id_usuario_aprobador) REFERENCES usuario(id_usuario);

ALTER TABLE ticket_aprobacion DROP CONSTRAINT IF EXISTS ticket_aprobacion_id_ticket_fkey;
ALTER TABLE ticket_aprobacion ADD CONSTRAINT ticket_aprobacion_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket) ON DELETE CASCADE;

ALTER TABLE ticket_incidente DROP CONSTRAINT IF EXISTS ticket_incidente_causado_por_cambio_id_fkey;
ALTER TABLE ticket_incidente ADD CONSTRAINT ticket_incidente_causado_por_cambio_id_fkey FOREIGN KEY (causado_por_cambio_id) REFERENCES cambio(id_cambio);

ALTER TABLE ticket_incidente DROP CONSTRAINT IF EXISTS ticket_incidente_id_problema_fkey;
ALTER TABLE ticket_incidente ADD CONSTRAINT ticket_incidente_id_problema_fkey FOREIGN KEY (id_problema) REFERENCES problema(id_problema);

ALTER TABLE ticket_incidente DROP CONSTRAINT IF EXISTS ticket_incidente_id_ticket_fkey;
ALTER TABLE ticket_incidente ADD CONSTRAINT ticket_incidente_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket) ON DELETE CASCADE;

ALTER TABLE ticket_lecturas DROP CONSTRAINT IF EXISTS ticket_lecturas_id_usuario_fkey;
ALTER TABLE ticket_lecturas ADD CONSTRAINT ticket_lecturas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE ticket_lecturas DROP CONSTRAINT IF EXISTS ticket_lecturas_id_ticket_fkey;
ALTER TABLE ticket_lecturas ADD CONSTRAINT ticket_lecturas_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket) ON DELETE CASCADE;

ALTER TABLE ticket_solicitud DROP CONSTRAINT IF EXISTS ticket_solicitud_id_paso_actual_fkey;
ALTER TABLE ticket_solicitud ADD CONSTRAINT ticket_solicitud_id_paso_actual_fkey FOREIGN KEY (id_paso_actual) REFERENCES servicio_workflow_paso(id_paso);

ALTER TABLE ticket_solicitud DROP CONSTRAINT IF EXISTS ticket_solicitud_id_ticket_fkey;
ALTER TABLE ticket_solicitud ADD CONSTRAINT ticket_solicitud_id_ticket_fkey FOREIGN KEY (id_ticket) REFERENCES ticket(id_ticket) ON DELETE CASCADE;

ALTER TABLE tipo_activo_catalogo DROP CONSTRAINT IF EXISTS tipo_activo_catalogo_usuario_modificacion_fkey;
ALTER TABLE tipo_activo_catalogo ADD CONSTRAINT tipo_activo_catalogo_usuario_modificacion_fkey FOREIGN KEY (usuario_modificacion) REFERENCES usuario(id_usuario);

ALTER TABLE ubicacion DROP CONSTRAINT IF EXISTS ubicacion_id_padre_fkey;
ALTER TABLE ubicacion ADD CONSTRAINT ubicacion_id_padre_fkey FOREIGN KEY (id_padre) REFERENCES ubicacion(id_ubicacion) ON DELETE RESTRICT;

ALTER TABLE ubicacion DROP CONSTRAINT IF EXISTS ubicacion_id_responsable_fkey;
ALTER TABLE ubicacion ADD CONSTRAINT ubicacion_id_responsable_fkey FOREIGN KEY (id_responsable) REFERENCES usuario(id_usuario);

ALTER TABLE ubicacion DROP CONSTRAINT IF EXISTS ubicacion_id_departamento_fkey;
ALTER TABLE ubicacion ADD CONSTRAINT ubicacion_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_empresa(id_departamento_empresa);

ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_id_departamento_fkey;
ALTER TABLE usuario ADD CONSTRAINT usuario_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES departamento_ti(id_departamento);

ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_id_departamento_empresa_fkey;
ALTER TABLE usuario ADD CONSTRAINT usuario_id_departamento_empresa_fkey FOREIGN KEY (id_departamento_empresa) REFERENCES departamento_empresa(id_departamento_empresa);

ALTER TABLE usuario_perfiles DROP CONSTRAINT IF EXISTS usuario_perfiles_id_perfil_fkey;
ALTER TABLE usuario_perfiles ADD CONSTRAINT usuario_perfiles_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil);

ALTER TABLE usuario_perfiles DROP CONSTRAINT IF EXISTS usuario_perfiles_id_usuario_fkey;
ALTER TABLE usuario_perfiles ADD CONSTRAINT usuario_perfiles_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- ============================================================================
-- VISTAS DEL SISTEMA
-- ============================================================================

CREATE OR REPLACE VIEW vista_ticket AS
SELECT t.id_ticket,
    t.codigo_ticket,
    t.titulo,
    t.descripcion,
    t.id_tipo_ticket,
    t.id_categoria,
    t.id_impacto,
    t.id_urgencia,
    t.id_prioridad,
    t.id_estado,
    t.id_motivo_espera,
    t.id_usuario_solicitante,
    t.id_usuario_asignado,
    t.solucion_aplicada,
    t.motivo_cancelacion,
    t.fecha_limite_sla,
    t.fecha_primera_respuesta,
    t.fecha_resolucion,
    t.fecha_cierre,
    t.sla_cumplido,
    t.usuario_creacion,
    t.fecha_creacion,
    t.usuario_modificacion,
    t.fecha_modificacion,
    t.estado_registro,
    t.id_servicio,
    t.id_departamento,
    t.canal_comunicacion,
    t.categoria_resolucion,
    t.calificacion_csat,
    t.comentario_csat,
    t.fecha_csat,
    t.tiempo_pausado_minutos,
    t.fecha_ultima_pausa,
    t.campos_adicionales,
    t.id_ci,
    t.fecha_reapertura,
    t.motivo_reapertura,
    t.conteo_reaperturas,
    t.id_departamento_empresa,
    t.fecha_limite_respuesta_sla,
    ti.id_problema,
    COALESCE(ti.es_incidente_mayor, false) AS es_incidente_mayor,
    ti.causado_por_cambio_id,
    COALESCE(ts.estado_aprobacion, 'NO_APLICA'::character varying) AS estado_aprobacion,
    ts.id_paso_actual
   FROM ((ticket t
     LEFT JOIN ticket_incidente ti ON ((ti.id_ticket = t.id_ticket)))
     LEFT JOIN ticket_solicitud ts ON ((ts.id_ticket = t.id_ticket)));;

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO Y BÚSQUEDA
-- ============================================================================

CREATE INDEX idx_acta_entrega_activo ON public.acta_entrega USING btree (id_activo);
CREATE INDEX idx_acta_entrega_estado ON public.acta_entrega USING btree (estado);
CREATE INDEX idx_acta_entrega_usuario ON public.acta_entrega USING btree (id_usuario);
CREATE INDEX idx_adjunto_ticket ON public.adjunto_ticket USING btree (id_ticket);
CREATE INDEX idx_aprobacion_monto_ref ON public.aprobacion_monto USING btree (tipo, id_referencia);
CREATE INDEX idx_cab_reunion_fecha ON public.cab_reunion USING btree (fecha_reunion) WHERE (estado_registro = true);
CREATE INDEX idx_cambio_cat_item ON public.cambio_catalogo_item USING btree (catalogo, activo, orden);
CREATE INDEX idx_cambio_excepcion_cambio ON public.cambio_excepcion USING btree (id_cambio) WHERE (estado_registro = true);
CREATE INDEX idx_campana_item_campana ON public.campana_inventario_item USING btree (id_campana);
CREATE UNIQUE INDEX uq_categoria_id_tipo ON public.categoria_ticket USING btree (id_categoria, id_tipo_ticket);
CREATE UNIQUE INDEX uq_categoria_tipo_codigo ON public.categoria_ticket USING btree (id_tipo_ticket, codigo_corto);
CREATE INDEX idx_cmdb_inexactitud_ci ON public.cmdb_inexactitud USING btree (id_ci);
CREATE INDEX idx_recuperacion_correo ON public.codigo_recuperacion USING btree (correo);
CREATE INDEX idx_recuperacion_token ON public.codigo_recuperacion USING btree (token_sesion);
CREATE INDEX idx_colaborador_autorizacion_usuario ON public.colaborador_autorizacion USING btree (id_usuario) WHERE (activo = true);
CREATE INDEX idx_comentario_ticket ON public.comentario_ticket USING btree (id_ticket);
CREATE INDEX idx_config_mod_versiones_lookup ON public.configuracion_modulo_versiones USING btree (modulo, pantalla, pestana, es_publicada, es_borrador);
CREATE INDEX idx_evento_servicio_estado_fecha ON public.evento_servicio USING btree (estado, detectado_en DESC) WHERE (estado_registro = true);
CREATE INDEX idx_incidente_mayor_problema ON public.incidente_mayor USING btree (id_problema);
CREATE INDEX idx_informe_auditoria_auditor ON public.informe_auditoria USING btree (id_auditor) WHERE (estado_registro = true);
CREATE INDEX idx_informe_evidencia_informe ON public.informe_evidencia USING btree (id_informe);
CREATE UNIQUE INDEX uq_licencia_asignacion_activo_activa ON public.licencia_asignacion USING btree (id_licencia, id_activo) WHERE ((fecha_devolucion IS NULL) AND (id_activo IS NOT NULL));
CREATE UNIQUE INDEX uq_licencia_asignacion_usuario_activa ON public.licencia_asignacion USING btree (id_licencia, id_usuario) WHERE ((fecha_devolucion IS NULL) AND (id_usuario IS NOT NULL));
CREATE INDEX idx_mantenimiento_activo ON public.mantenimiento_activo USING btree (id_activo);
CREATE INDEX idx_notificaciones_usuario_leida ON public.notificaciones USING btree (usuario_id, leida, creada_en DESC);
CREATE INDEX idx_opciones_menu_padre ON public.opciones_menu USING btree (id_padre);
CREATE INDEX idx_omvp_perfil_opcion ON public.opciones_menu_vistas_perfiles USING btree (id_perfil, id_opcion_menu, estado_registro);
CREATE INDEX idx_problema_analisis_problema ON public.problema_analisis USING btree (id_problema);
CREATE INDEX idx_problema_cierre_problema ON public.problema_cierre_aprobacion USING btree (id_problema);
CREATE INDEX idx_proveedor_ti_vencimiento ON public.proveedor_ti USING btree (fecha_vencimiento) WHERE (estado_registro = true);
CREATE INDEX idx_recertificacion_usuario ON public.recertificacion_acceso USING btree (id_usuario, id_perfil);
CREATE INDEX idx_tecnico_ausencias_tecnico_fechas ON public.tecnico_ausencias USING btree (id_usuario_tecnico, fecha_desde, fecha_hasta) WHERE (estado_registro = true);
CREATE INDEX idx_tecnico_turnos_fecha ON public.tecnico_turnos USING btree (fecha, turno) WHERE (estado_registro = true);
CREATE INDEX idx_tecnico_turnos_tecnico ON public.tecnico_turnos USING btree (id_usuario_tecnico, fecha) WHERE (estado_registro = true);
CREATE INDEX idx_ticket_asignado ON public.ticket USING btree (id_usuario_asignado);
CREATE INDEX idx_ticket_codigo ON public.ticket USING btree (codigo_ticket);
CREATE INDEX idx_ticket_departamento ON public.ticket USING btree (id_departamento);
CREATE INDEX idx_ticket_estado ON public.ticket USING btree (id_estado);
CREATE INDEX idx_ticket_prioridad ON public.ticket USING btree (id_prioridad);
CREATE INDEX idx_ticket_servicio ON public.ticket USING btree (id_servicio);
CREATE INDEX idx_ticket_solicitante ON public.ticket USING btree (id_usuario_solicitante);
CREATE INDEX idx_ticket_tipo ON public.ticket USING btree (id_tipo_ticket);
CREATE INDEX idx_ticket_aprobacion_ticket ON public.ticket_aprobacion USING btree (id_ticket);
