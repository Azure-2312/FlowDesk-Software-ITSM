-- ============================================================
-- ESQUEMA DE BASE DE DATOS - SISTEMA DE TICKETS
-- PostgreSQL (Supabase)
-- ============================================================
-- Este script traduce las tablas base que dio el profesor
-- (Usuario, Perfiles, OpcionesMenu, Usuario_Perfiles,
-- OpcionesMenu_Perfiles) de sintaxis SQL Server a PostgreSQL,
-- y agrega las tablas propias del sistema de tickets.
-- ============================================================


-- ============================================================
-- BLOQUE 1: SEGURIDAD Y ACCESO (base del profesor, traducida)
-- ============================================================

-- Tabla de usuarios del sistema
CREATE TABLE usuario (
    id_usuario           SERIAL PRIMARY KEY,
    dni                  VARCHAR(15) NOT NULL UNIQUE,
    nombres              VARCHAR(40) NOT NULL,
    apellido_paterno     VARCHAR(40) NOT NULL,
    apellido_materno     VARCHAR(40),
    celular              VARCHAR(15),
    correo_personal      VARCHAR(100),
    correo_electronico   VARCHAR(40) NOT NULL UNIQUE,
    clave                VARCHAR(255) NOT NULL,        -- se guarda HASHEADA (bcrypt), nunca en texto plano
    intentos_fallidos    SMALLINT NOT NULL DEFAULT 0,   -- para bloqueo por intentos fallidos
    bloqueado_hasta      TIMESTAMP,                     -- null = no bloqueado
    cuenta_bloqueada     BOOLEAN NOT NULL DEFAULT false, -- bloqueo definitivo por fuerza bruta (3 intentos)
    usuario_creacion     INT,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT now(),
    usuario_modificacion INT,
    fecha_modificacion   TIMESTAMP,
    estado_registro      BOOLEAN NOT NULL DEFAULT true  -- soft delete: activo/inactivo
);

-- Catálogo de perfiles (roles): Administrador, Técnico, Solicitante, etc.
CREATE TABLE perfiles (
    id_perfil        SERIAL PRIMARY KEY,
    nombre           VARCHAR(50) NOT NULL,
    descripcion      VARCHAR(500),
    estado_registro  BOOLEAN NOT NULL DEFAULT true
);

-- Opciones del menú lateral. Jerárquica: id_padre apunta a otra opción.
-- El curso pide máximo 3 niveles de profundidad, por eso la columna "nivel"
-- tiene un CHECK que no deja insertar un 4to nivel por error.
CREATE TABLE opciones_menu (
    id_opcion_menu   SERIAL PRIMARY KEY,
    nombre           VARCHAR(120) NOT NULL,
    url_menu         VARCHAR(120) NOT NULL,
    descripcion      VARCHAR(150),
    id_padre         INT REFERENCES opciones_menu(id_opcion_menu),
    nivel            SMALLINT NOT NULL DEFAULT 1 CHECK (nivel BETWEEN 1 AND 5),
    orden            SMALLINT NOT NULL DEFAULT 1,
    estado_registro  BOOLEAN NOT NULL DEFAULT true,
    permiso_requerido   VARCHAR(100),
    modulo_requerido    VARCHAR(50),
    condicion_nivel     JSONB,
    contador_clave      VARCHAR(50),
    bloqueado           BOOLEAN DEFAULT false,
    abierto_por_defecto BOOLEAN DEFAULT false
);

-- Relación muchos-a-muchos: un usuario puede tener varios perfiles a la vez
CREATE TABLE usuario_perfiles (
    id_usuario       INT NOT NULL REFERENCES usuario(id_usuario),
    id_perfil        INT NOT NULL REFERENCES perfiles(id_perfil),
    estado_registro  BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (id_usuario, id_perfil)
);

-- Relación muchos-a-muchos: qué opciones de menú ve cada perfil
CREATE TABLE opciones_menu_perfiles (
    id_opcion_menu   INT NOT NULL REFERENCES opciones_menu(id_opcion_menu),
    id_perfil        INT NOT NULL REFERENCES perfiles(id_perfil),
    orden            SMALLINT NOT NULL DEFAULT 1,
    estado_registro  BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (id_opcion_menu, id_perfil)
);

-- Auditoría de accesos (quién intentó entrar, cuándo, si le funcionó)
CREATE TABLE log_acceso (
    id_log           SERIAL PRIMARY KEY,
    id_usuario       INT REFERENCES usuario(id_usuario),
    correo_intento   VARCHAR(40),
    exitoso          BOOLEAN NOT NULL,
    ip               VARCHAR(45),
    fecha            TIMESTAMP NOT NULL DEFAULT now()
);


-- ============================================================
-- BLOQUE 2: SISTEMA DE TICKETS (ALINEADO A ITIL 4)
-- ============================================================

-- Catálogo de Tipos de Ticket (ITIL 4: Distinción entre Incidente y Solicitud de Servicio)
CREATE TABLE tipo_ticket (
    id_tipo_ticket    SERIAL PRIMARY KEY,
    codigo            VARCHAR(20) UNIQUE NOT NULL,
    nombre            VARCHAR(50) NOT NULL,
    descripcion       VARCHAR(250) NOT NULL,
    prefijo_codigo    VARCHAR(5) NOT NULL, -- INC o REQ
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

-- Catálogo de Impacto (ITIL 4: Alcance del daño en la organización)
CREATE TABLE impacto_ticket (
    id_impacto        SERIAL PRIMARY KEY,
    nivel             SMALLINT UNIQUE NOT NULL, -- 1=Bajo, 2=Medio, 3=Alto
    nombre            VARCHAR(30) NOT NULL,
    descripcion       VARCHAR(200) NOT NULL,
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

-- Catálogo de Urgencia (ITIL 4: Velocidad con la que el negocio requiere solución)
CREATE TABLE urgencia_ticket (
    id_urgencia       SERIAL PRIMARY KEY,
    nivel             SMALLINT UNIQUE NOT NULL, -- 1=Baja, 2=Media, 3=Alta
    nombre            VARCHAR(30) NOT NULL,
    descripcion       VARCHAR(200) NOT NULL,
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

-- Catálogo de Prioridades con métricas de SLA (Matriz Impacto x Urgencia)
CREATE TABLE prioridad_ticket (
    id_prioridad                  SERIAL PRIMARY KEY,
    codigo                        VARCHAR(10) UNIQUE NOT NULL, -- P1, P2, P3, P4
    nombre                        VARCHAR(30) NOT NULL,
    nivel                         SMALLINT UNIQUE NOT NULL, -- 1=Crítica .. 4=Baja
    tiempo_resolucion_horas       INT NOT NULL,
    tiempo_primera_respuesta_hrs  INT NOT NULL,
    color                         VARCHAR(20) NOT NULL,
    estado_registro               BOOLEAN NOT NULL DEFAULT true
);

-- Catálogo de Estados del Ticket (Ciclo de vida ITIL 4)
CREATE TABLE estado_ticket (
    id_estado         SERIAL PRIMARY KEY,
    codigo            VARCHAR(20) UNIQUE NOT NULL,
    nombre            VARCHAR(30) NOT NULL,
    orden             SMALLINT NOT NULL,
    es_terminal       BOOLEAN NOT NULL DEFAULT false,
    pausa_sla         BOOLEAN NOT NULL DEFAULT false,
    color             VARCHAR(20) NOT NULL,
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

-- Catálogo de Motivos de Espera (Pending Reasons para pausar SLA en ITIL 4)
CREATE TABLE motivo_espera_ticket (
    id_motivo_espera  SERIAL PRIMARY KEY,
    nombre            VARCHAR(80) NOT NULL,
    descripcion       VARCHAR(200) NOT NULL,
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

-- Catálogo de categorías de ticket vinculadas a tipo
CREATE TABLE categoria_ticket (
    id_categoria      SERIAL PRIMARY KEY,
    id_tipo_ticket    INT NOT NULL REFERENCES tipo_ticket(id_tipo_ticket),
    nombre            VARCHAR(60) NOT NULL,
    descripcion       VARCHAR(200),
    codigo_corto      VARCHAR(10) NOT NULL,
    sla_default_respuesta INT NOT NULL DEFAULT 4,
    sla_default_resolucion INT NOT NULL DEFAULT 24,
    UNIQUE (id_categoria, id_tipo_ticket),
    UNIQUE (id_tipo_ticket, codigo_corto),
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

-- Catálogo de Servicios Corporativos (ITIL 4: Service Catalogue Management)
CREATE TABLE servicio_catalogo (
    id_servicio           SERIAL PRIMARY KEY,
    codigo_servicio       VARCHAR(30) UNIQUE NOT NULL,
    id_tipo_ticket        INT NOT NULL REFERENCES tipo_ticket(id_tipo_ticket),
    id_categoria          INT NOT NULL,
    nombre                VARCHAR(100) NOT NULL,
    descripcion_comercial TEXT NOT NULL,
    entregable            TEXT NOT NULL,
    requiere_aprobacion   BOOLEAN NOT NULL DEFAULT false,
    sla_horas_resolucion  INT NOT NULL,
    sla_horas_respuesta   INT NOT NULL,
    costo_referencial     NUMERIC(10,2) DEFAULT 0.00,
    icono                 VARCHAR(50) DEFAULT 'servicio',
    motivo_inactivacion   TEXT,
    fecha_inactivacion    TIMESTAMPTZ,
    usuario_inactivacion  INT REFERENCES usuario(id_usuario),
    estado_registro       BOOLEAN NOT NULL DEFAULT true,
    FOREIGN KEY (id_categoria, id_tipo_ticket) REFERENCES categoria_ticket(id_categoria, id_tipo_ticket)
);

-- Audiencia de publicación: qué perfiles pueden solicitar cada servicio.
CREATE TABLE servicio_catalogo_perfiles (
    id_servicio INT NOT NULL REFERENCES servicio_catalogo(id_servicio) ON DELETE CASCADE,
    id_perfil INT NOT NULL REFERENCES perfiles(id_perfil),
    PRIMARY KEY (id_servicio, id_perfil)
);

-- Pasos de Workflow específicos por Servicio (ITIL 4: Service Request Workflows)
CREATE TABLE servicio_workflow_paso (
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

-- Departamentos y Especialidades de TI (ITIL 4: Tiered Support Organizations)
CREATE TABLE departamento_ti (
    id_departamento         SERIAL PRIMARY KEY,
    codigo                  VARCHAR(20) UNIQUE NOT NULL,
    nombre                  VARCHAR(80) NOT NULL,
    descripcion             TEXT,
    id_supervisor           INT REFERENCES usuario(id_usuario),
    tiempo_ola_horas        INT NOT NULL DEFAULT 8,
    tiempo_ola_critico_hrs  INT NOT NULL DEFAULT 2,
    estado_registro         BOOLEAN NOT NULL DEFAULT true
);

-- Unidades organizativas del cliente. Son distintas de los equipos resolutores de TI.
CREATE TABLE departamento_empresa (
    id_departamento_empresa SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    descripcion TEXT,
    estado_registro BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Acuerdos de Nivel Operativo entre Equipos Internos de TI (ITIL 4: OLA)
CREATE TABLE acuerdo_nivel_operativo (
    id_ola                  SERIAL PRIMARY KEY,
    id_departamento         INT NOT NULL REFERENCES departamento_ti(id_departamento),
    codigo_acuerdo          VARCHAR(30) UNIQUE NOT NULL,
    nombre_acuerdo          VARCHAR(100) NOT NULL,
    tipo_compromiso         VARCHAR(40) NOT NULL,
    tiempo_maximo_horas     INT NOT NULL,
    tiempo_alerta_horas     INT NOT NULL,
    descripcion             TEXT,
    estado_registro         BOOLEAN NOT NULL DEFAULT true
);

-- Detalle, Nivel y Capacidad Operativa del Técnico (ITIL 4 / ISO 20000)
CREATE TABLE tecnico_detalle (
    id_tecnico_detalle      SERIAL PRIMARY KEY,
    id_usuario              INT UNIQUE NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_departamento         INT NOT NULL REFERENCES departamento_ti(id_departamento),
    nivel_soporte           SMALLINT NOT NULL DEFAULT 1 CHECK (nivel_soporte IN (1, 2, 3)),
    capacidad_maxima_tickets INT NOT NULL DEFAULT 8,
    estado_operativo        VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    especialidad_principal  VARCHAR(100),
    estado_registro         BOOLEAN NOT NULL DEFAULT true
);

-- Tabla principal de tickets (Modelo ITIL 4)
CREATE TABLE ticket (
    id_ticket                     SERIAL PRIMARY KEY,
    codigo_ticket                 VARCHAR(30) UNIQUE NOT NULL,
    titulo                        VARCHAR(150) NOT NULL,
    descripcion                   TEXT NOT NULL,
    id_tipo_ticket                INT NOT NULL REFERENCES tipo_ticket(id_tipo_ticket),
    id_categoria                  INT NOT NULL,
    id_servicio                   INT REFERENCES servicio_catalogo(id_servicio),
    id_departamento               INT REFERENCES departamento_ti(id_departamento),
    id_departamento_empresa       INT REFERENCES departamento_empresa(id_departamento_empresa),
    canal_comunicacion            VARCHAR(30) NOT NULL DEFAULT 'PORTAL_WEB',
    estado_aprobacion             VARCHAR(30) NOT NULL DEFAULT 'NO_APLICA',
    id_paso_actual                INT REFERENCES servicio_workflow_paso(id_paso),
    id_impacto                    INT NOT NULL REFERENCES impacto_ticket(id_impacto),
    id_urgencia                   INT NOT NULL REFERENCES urgencia_ticket(id_urgencia),
    id_prioridad                  INT NOT NULL REFERENCES prioridad_ticket(id_prioridad),
    id_estado                     INT NOT NULL REFERENCES estado_ticket(id_estado),
    id_motivo_espera              INT REFERENCES motivo_espera_ticket(id_motivo_espera),
    id_usuario_solicitante        INT NOT NULL REFERENCES usuario(id_usuario),
    id_usuario_asignado           INT REFERENCES usuario(id_usuario),
    categoria_resolucion          VARCHAR(60),
    solucion_aplicada             TEXT,
    motivo_cancelacion            TEXT,
    calificacion_csat             SMALLINT CHECK (calificacion_csat BETWEEN 1 AND 5),
    comentario_csat               TEXT,
    fecha_csat                    TIMESTAMPTZ,
    tiempo_pausado_minutos        INT NOT NULL DEFAULT 0,
    fecha_ultima_pausa            TIMESTAMPTZ,
    fecha_limite_sla              TIMESTAMPTZ NOT NULL,
    fecha_limite_respuesta_sla    TIMESTAMPTZ,
    fecha_primera_respuesta       TIMESTAMPTZ,
    fecha_resolucion              TIMESTAMPTZ,
    fecha_cierre                  TIMESTAMPTZ,
    sla_cumplido                  BOOLEAN,
    campos_adicionales            JSONB DEFAULT '{}'::jsonb,
    usuario_creacion              INT,
    fecha_creacion                TIMESTAMPTZ NOT NULL DEFAULT now(),
    usuario_modificacion          INT,
    fecha_modificacion            TIMESTAMPTZ,
    estado_registro               BOOLEAN NOT NULL DEFAULT true,
    FOREIGN KEY (id_categoria, id_tipo_ticket) REFERENCES categoria_ticket(id_categoria, id_tipo_ticket)
);

-- Auditoría de compuertas y aprobaciones jerárquicas (SOX / ISO 27001 / ITIL 4)
CREATE TABLE ticket_aprobacion (
    id_ticket_aprobacion SERIAL PRIMARY KEY,
    id_ticket             INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE,
    id_usuario_aprobador  INT NOT NULL REFERENCES usuario(id_usuario),
    id_paso_workflow      INT REFERENCES servicio_workflow_paso(id_paso),
    estado_decision       VARCHAR(20) NOT NULL, -- APROBADO, RECHAZADO, OBSERVADO
    comentario            TEXT,
    fecha_decision        TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro       BOOLEAN NOT NULL DEFAULT true
);

-- Archivos adjuntos y evidencias técnicas documentales (ISO 27001 / ITIL 4)
CREATE TABLE adjunto_ticket (
    id_adjunto          SERIAL PRIMARY KEY,
    id_ticket           INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE,
    nombre_archivo      VARCHAR(255) NOT NULL,
    tipo_mime           VARCHAR(100) NOT NULL,
    tamano_bytes        INT NOT NULL,
    datos_base64        TEXT NOT NULL,
    id_usuario_subio    INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro     BOOLEAN NOT NULL DEFAULT true
);

-- Historial de comentarios/seguimiento con distinción de notas técnicas internas
CREATE TABLE comentario_ticket (
    id_comentario     SERIAL PRIMARY KEY,
    id_ticket         INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE,
    id_usuario        INT NOT NULL REFERENCES usuario(id_usuario),
    comentario        TEXT NOT NULL,
    es_interno        BOOLEAN NOT NULL DEFAULT false, -- true = nota técnica privada para TI
    id_estado_cambiado INT REFERENCES estado_ticket(id_estado),
    fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

-- Códigos temporales para recuperación de contraseñas olvidadas por correo
CREATE TABLE codigo_recuperacion (
    id_recuperacion    SERIAL PRIMARY KEY,
    id_usuario         INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    correo             VARCHAR(60) NOT NULL,
    codigo             VARCHAR(6) NOT NULL,
    token_sesion       VARCHAR(255) NOT NULL,
    fecha_envio        TIMESTAMPTZ NOT NULL DEFAULT now(),
    expira_codigo      TIMESTAMPTZ NOT NULL,  -- Validez de 1 minuto
    expira_sesion      TIMESTAMPTZ NOT NULL,  -- Validez máxima del proceso de 3 minutos
    utilizado          BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- ÍNDICES recomendados (aceleran las búsquedas más comunes)
-- ============================================================
CREATE INDEX idx_ticket_codigo ON ticket(codigo_ticket);
CREATE INDEX idx_ticket_estado ON ticket(id_estado);
CREATE INDEX idx_ticket_tipo ON ticket(id_tipo_ticket);
CREATE INDEX idx_ticket_prioridad ON ticket(id_prioridad);
CREATE INDEX idx_ticket_solicitante ON ticket(id_usuario_solicitante);
CREATE INDEX idx_ticket_asignado ON ticket(id_usuario_asignado);
CREATE INDEX idx_comentario_ticket ON comentario_ticket(id_ticket);
CREATE INDEX idx_opciones_menu_padre ON opciones_menu(id_padre);
CREATE INDEX idx_recuperacion_token ON codigo_recuperacion(token_sesion);
CREATE INDEX idx_recuperacion_correo ON codigo_recuperacion(correo);

-- ============================================================
-- BLOQUE 9: EXTENSIONES ITIL v4 / ISO 20000 / ISO 27001
-- ============================================================

-- Modificaciones a tablas existentes
ALTER TABLE categoria_ticket ADD COLUMN IF NOT EXISTS id_padre INT REFERENCES categoria_ticket(id_categoria);
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS id_departamento INT REFERENCES departamento_ti(id_departamento);
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS id_departamento_empresa INT REFERENCES departamento_empresa(id_departamento_empresa);

-- Gestión de Activos y CMDB (Configuration Management Database)
CREATE TABLE activo (
    id_activo SERIAL PRIMARY KEY,
    codigo_patrimonial VARCHAR(50) UNIQUE NOT NULL,
    numero_serie VARCHAR(100),
    tipo_activo VARCHAR(50) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    id_departamento INT REFERENCES departamento_ti(id_departamento),
    id_usuario_custodio INT REFERENCES usuario(id_usuario),
    estado_activo VARCHAR(30) NOT NULL DEFAULT 'EN_OPERACION',
    fecha_adquisicion DATE,
    fecha_fin_garantia DATE,
    costo_compra NUMERIC(12,2),
    motivo_inactivacion TEXT,
    fecha_inactivacion TIMESTAMPTZ,
    usuario_inactivacion INT REFERENCES usuario(id_usuario),
    usuario_creacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    usuario_modificacion INT REFERENCES usuario(id_usuario),
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE elemento_configuracion (
    id_ci SERIAL PRIMARY KEY,
    id_activo INT REFERENCES activo(id_activo),
    codigo_ci VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo_ci VARCHAR(50) NOT NULL,
    ambiente VARCHAR(20) NOT NULL CHECK (ambiente IN ('PRODUCCION', 'QA', 'DESARROLLO')),
    ip_principal VARCHAR(45),
    version_software VARCHAR(50),
    criticidad VARCHAR(20) NOT NULL CHECK (criticidad IN ('CRITICA', 'ALTA', 'MEDIA', 'BAJA')),
    id_departamento_soporte INT REFERENCES departamento_ti(id_departamento),
    motivo_inactivacion TEXT,
    fecha_inactivacion TIMESTAMPTZ,
    usuario_inactivacion INT REFERENCES usuario(id_usuario),
    usuario_creacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE ci_relacion (
    id_ci_padre INT NOT NULL REFERENCES elemento_configuracion(id_ci),
    id_ci_hijo INT NOT NULL REFERENCES elemento_configuracion(id_ci),
    tipo_relacion VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id_ci_padre, id_ci_hijo)
);

CREATE TABLE licencia_software (
    id_licencia SERIAL PRIMARY KEY,
    nombre_software VARCHAR(150) NOT NULL,
    fabricante VARCHAR(100) NOT NULL,
    clave_licencia VARCHAR(255),
    tipo_licencia VARCHAR(50) NOT NULL,
    cantidad_adquirida INT NOT NULL,
    cantidad_en_uso INT NOT NULL DEFAULT 0,
    fecha_vencimiento DATE,
    costo_anual NUMERIC(12,2),
    usuario_creacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

-- Gestión de Problemas (Problem Management)
CREATE TABLE problema (
    id_problema SERIAL PRIMARY KEY,
    codigo_problema VARCHAR(30) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    id_impacto INT REFERENCES impacto_ticket(id_impacto),
    id_urgencia INT REFERENCES urgencia_ticket(id_urgencia),
    id_prioridad INT REFERENCES prioridad_ticket(id_prioridad),
    id_estado INT NOT NULL DEFAULT 1,
    causa_raiz TEXT,
    metodo_analisis VARCHAR(50) DEFAULT '5_WHYS',
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

CREATE TABLE problema_incidente (
    id_problema INT NOT NULL REFERENCES problema(id_problema),
    id_ticket INT NOT NULL REFERENCES ticket(id_ticket),
    fecha_asociacion TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id_problema, id_ticket)
);

CREATE TABLE error_conocido (
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

-- Gestión de Cambios (Change Enablement)
CREATE TABLE cambio (
    id_cambio SERIAL PRIMARY KEY,
    codigo_cambio VARCHAR(30) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo_cambio VARCHAR(20) NOT NULL CHECK (tipo_cambio IN ('ESTANDAR', 'NORMAL', 'EMERGENCIA')),
    id_impacto INT REFERENCES impacto_ticket(id_impacto),
    id_urgencia INT REFERENCES urgencia_ticket(id_urgencia),
    id_prioridad INT REFERENCES prioridad_ticket(id_prioridad),
    id_estado INT NOT NULL DEFAULT 1,
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

CREATE TABLE cambio_aprobacion (
    id_cambio_aprobacion SERIAL PRIMARY KEY,
    id_cambio INT NOT NULL REFERENCES cambio(id_cambio),
    id_usuario_aprobador INT NOT NULL REFERENCES usuario(id_usuario),
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('APROBADO', 'RECHAZADO', 'OBSERVADO')),
    comentario TEXT NOT NULL,
    fecha_decision TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cambio_aprobador_voto_activo
    ON cambio_aprobacion (id_cambio, id_usuario_aprobador)
    WHERE estado_registro = true;

-- Gestión del Conocimiento (Knowledge Management)
CREATE TABLE articulo_conocimiento (
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

-- Modificaciones complementarias en Ticket
ALTER TABLE ticket ADD COLUMN IF NOT EXISTS id_problema INT REFERENCES problema(id_problema);
ALTER TABLE ticket ADD COLUMN IF NOT EXISTS id_ci INT REFERENCES elemento_configuracion(id_ci);
ALTER TABLE ticket ADD COLUMN IF NOT EXISTS fecha_reapertura TIMESTAMPTZ;
ALTER TABLE ticket ADD COLUMN IF NOT EXISTS motivo_reapertura TEXT;
ALTER TABLE ticket ADD COLUMN IF NOT EXISTS conteo_reaperturas INT DEFAULT 0;

CREATE INDEX idx_ticket_problema ON ticket(id_problema);
CREATE INDEX idx_ticket_ci ON ticket(id_ci);
CREATE INDEX idx_problema_ci ON problema(id_ci_afectado);
CREATE INDEX idx_cambio_ci ON cambio(id_ci_afectado);
CREATE INDEX idx_cambio_estado ON cambio(id_estado);
CREATE INDEX idx_conocimiento_categoria ON articulo_conocimiento(id_categoria);

-- Operación de servicios ITSM: eventos, resiliencia y proveedores.
CREATE TABLE evento_servicio (
    id_evento SERIAL PRIMARY KEY,
    codigo_evento VARCHAR(30) NOT NULL UNIQUE,
    fuente VARCHAR(120) NOT NULL,
    titulo VARCHAR(180) NOT NULL,
    descripcion TEXT,
    severidad VARCHAR(12) NOT NULL DEFAULT 'MEDIA' CHECK (severidad IN ('BAJA','MEDIA','ALTA','CRITICA')),
    estado VARCHAR(16) NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO','RECONOCIDO','VINCULADO','CERRADO')),
    id_ci INT REFERENCES elemento_configuracion(id_ci),
    id_ticket INT REFERENCES ticket(id_ticket),
    detectado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    reconocido_por INT REFERENCES usuario(id_usuario),
    reconocido_en TIMESTAMPTZ,
    cerrado_por INT REFERENCES usuario(id_usuario),
    cerrado_en TIMESTAMPTZ,
    usuario_creacion INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX idx_evento_servicio_estado_fecha ON evento_servicio(estado, detectado_en DESC) WHERE estado_registro=true;

CREATE TABLE resiliencia_servicio (
    id_resiliencia SERIAL PRIMARY KEY,
    id_servicio INT NOT NULL UNIQUE REFERENCES servicio_catalogo(id_servicio),
    objetivo_disponibilidad NUMERIC(5,2) NOT NULL DEFAULT 99.00 CHECK (objetivo_disponibilidad BETWEEN 0 AND 100),
    disponibilidad_observada NUMERIC(5,2) CHECK (disponibilidad_observada BETWEEN 0 AND 100),
    rto_horas NUMERIC(8,2) CHECK (rto_horas >= 0),
    rpo_horas NUMERIC(8,2) CHECK (rpo_horas >= 0),
    umbral_capacidad_pct SMALLINT CHECK (umbral_capacidad_pct BETWEEN 1 AND 100),
    consumo_capacidad_pct SMALLINT CHECK (consumo_capacidad_pct BETWEEN 0 AND 100),
    plan_continuidad TEXT NOT NULL,
    ultima_prueba TIMESTAMPTZ,
    proxima_prueba TIMESTAMPTZ,
    resultado_ultima_prueba TEXT,
    id_responsable INT REFERENCES usuario(id_usuario),
    usuario_creacion INT NOT NULL REFERENCES usuario(id_usuario),
    usuario_modificacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE proveedor_ti (
    id_proveedor SERIAL PRIMARY KEY,
    codigo_proveedor VARCHAR(30) NOT NULL UNIQUE,
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
    evaluacion_desempeno SMALLINT CHECK (evaluacion_desempeno BETWEEN 1 AND 5),
    estado VARCHAR(16) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO','EN_REVISION','VENCIDO','INACTIVO')),
    observaciones TEXT,
    usuario_creacion INT NOT NULL REFERENCES usuario(id_usuario),
    usuario_modificacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN NOT NULL DEFAULT true,
    CHECK (fecha_vencimiento IS NULL OR fecha_inicio IS NULL OR fecha_vencimiento >= fecha_inicio)
);
CREATE INDEX idx_proveedor_ti_vencimiento ON proveedor_ti(fecha_vencimiento) WHERE estado_registro=true;

CREATE TABLE configuracion_rfc (
    id_configuracion SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id_configuracion=1),
    perfiles_solicitantes SMALLINT[] NOT NULL DEFAULT ARRAY[2,8]::SMALLINT[],
    tipos_rfc TEXT[] NOT NULL DEFAULT ARRAY['ESTANDAR','NORMAL','EMERGENCIA']::TEXT[],
    exige_ci BOOLEAN NOT NULL DEFAULT false,
    exige_plan_pruebas BOOLEAN NOT NULL DEFAULT false,
    permite_emergencia BOOLEAN NOT NULL DEFAULT true,
    usuario_modificacion INT REFERENCES usuario(id_usuario),
    fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO configuracion_rfc(id_configuracion) VALUES(1) ON CONFLICT(id_configuracion) DO NOTHING;

