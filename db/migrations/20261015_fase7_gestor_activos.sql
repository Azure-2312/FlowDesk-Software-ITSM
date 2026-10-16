-- Fase 7 (Gestor de Activos y Configuración): contratos, campañas de inventario
-- físico, software autorizado, CMDB (líneas base, inexactitudes, actualizaciones
-- desde cambios), mantenimiento, importación y recepción. Idempotente.

CREATE TABLE IF NOT EXISTS contrato_ti (
    id_contrato           SERIAL PRIMARY KEY,
    codigo                VARCHAR(40) NOT NULL UNIQUE,
    nombre                VARCHAR(200) NOT NULL,
    id_proveedor          INT REFERENCES proveedor_ti(id_proveedor),
    tipo                  VARCHAR(40),
    descripcion           TEXT,
    fecha_inicio          DATE,
    fecha_fin             DATE,
    monto                 NUMERIC(14, 2),
    moneda                VARCHAR(10) DEFAULT 'PEN',
    cobertura             TEXT,
    renovacion_automatica BOOLEAN NOT NULL DEFAULT false,
    dias_aviso            INT NOT NULL DEFAULT 30,
    estado                VARCHAR(20) NOT NULL DEFAULT 'VIGENTE',
    usuario_creacion      INT REFERENCES usuario(id_usuario),
    fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro       BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS campana_inventario (
    id_campana       SERIAL PRIMARY KEY,
    codigo           VARCHAR(40) NOT NULL UNIQUE,
    nombre           VARCHAR(200) NOT NULL,
    descripcion      TEXT,
    alcance          VARCHAR(200),
    fecha_inicio     DATE,
    fecha_fin        DATE,
    estado           VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
    id_responsable   INT REFERENCES usuario(id_usuario),
    usuario_creacion INT REFERENCES usuario(id_usuario),
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro  BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS campana_inventario_item (
    id_item             SERIAL PRIMARY KEY,
    id_campana          INT NOT NULL REFERENCES campana_inventario(id_campana),
    id_activo           INT NOT NULL REFERENCES activo(id_activo),
    estado_verificacion VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    id_usuario_verifica INT REFERENCES usuario(id_usuario),
    fecha_verificacion  TIMESTAMPTZ,
    observacion         TEXT,
    estado_registro     BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS software_autorizado (
    id_software       SERIAL PRIMARY KEY,
    nombre            VARCHAR(200) NOT NULL,
    fabricante        VARCHAR(150),
    version           VARCHAR(60),
    categoria         VARCHAR(80),
    licencia_requerida BOOLEAN NOT NULL DEFAULT false,
    estado            VARCHAR(20) NOT NULL DEFAULT 'AUTORIZADO',
    id_usuario_aprueba INT REFERENCES usuario(id_usuario),
    fecha_aprobacion  TIMESTAMPTZ,
    usuario_creacion  INT REFERENCES usuario(id_usuario),
    fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS cmdb_linea_base (
    id_linea_base     SERIAL PRIMARY KEY,
    nombre            VARCHAR(200) NOT NULL,
    descripcion       TEXT,
    id_ci             INT REFERENCES elemento_configuracion(id_ci),
    snapshot          JSONB,
    total_elementos   INT NOT NULL DEFAULT 0,
    id_usuario_creacion INT REFERENCES usuario(id_usuario),
    fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS cmdb_inexactitud (
    id_inexactitud    SERIAL PRIMARY KEY,
    id_ci             INT REFERENCES elemento_configuracion(id_ci),
    descripcion       TEXT NOT NULL,
    id_usuario_reporta INT REFERENCES usuario(id_usuario),
    estado            VARCHAR(20) NOT NULL DEFAULT 'REPORTADA',
    id_usuario_asigna INT REFERENCES usuario(id_usuario),
    fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_resolucion  TIMESTAMPTZ,
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS cmdb_actualizacion (
    id_actualizacion  SERIAL PRIMARY KEY,
    id_cambio         INT REFERENCES cambio(id_cambio),
    id_ci             INT REFERENCES elemento_configuracion(id_ci),
    tipo_operacion    VARCHAR(30) NOT NULL,
    detalle           TEXT,
    estado            VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    id_usuario_aplica INT REFERENCES usuario(id_usuario),
    fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_aplicacion  TIMESTAMPTZ,
    estado_registro   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS mantenimiento_activo (
    id_mantenimiento     SERIAL PRIMARY KEY,
    id_activo            INT NOT NULL REFERENCES activo(id_activo),
    tipo                 VARCHAR(20) NOT NULL DEFAULT 'PREVENTIVO',
    descripcion          TEXT,
    proveedor            VARCHAR(200),
    fecha_programada     DATE,
    fecha_ejecucion      DATE,
    costo                NUMERIC(12, 2),
    estado               VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADO',
    id_usuario_responsable INT REFERENCES usuario(id_usuario),
    usuario_creacion     INT REFERENCES usuario(id_usuario),
    fecha_creacion       TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro      BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS importacion_activos (
    id_importacion   SERIAL PRIMARY KEY,
    nombre_archivo   VARCHAR(300),
    total_filas      INT NOT NULL DEFAULT 0,
    filas_validas    INT NOT NULL DEFAULT 0,
    filas_invalidas  INT NOT NULL DEFAULT 0,
    estado           VARCHAR(20) NOT NULL DEFAULT 'VALIDADO',
    detalle          JSONB,
    id_usuario       INT REFERENCES usuario(id_usuario),
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_aplicacion TIMESTAMPTZ,
    estado_registro  BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS recepcion_activo (
    id_recepcion     SERIAL PRIMARY KEY,
    codigo           VARCHAR(40) NOT NULL UNIQUE,
    id_proveedor     INT REFERENCES proveedor_ti(id_proveedor),
    documento        VARCHAR(120),
    id_solicitud_origen INT,
    fecha_recepcion  DATE,
    total_items      INT NOT NULL DEFAULT 0,
    estado           VARCHAR(20) NOT NULL DEFAULT 'RECIBIDO',
    id_usuario       INT REFERENCES usuario(id_usuario),
    detalle          JSONB,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro  BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS renovacion_contrato (
    id_renovacion    SERIAL PRIMARY KEY,
    id_contrato      INT NOT NULL REFERENCES contrato_ti(id_contrato),
    fecha_solicitud  TIMESTAMPTZ NOT NULL DEFAULT now(),
    monto_propuesto  NUMERIC(14, 2),
    estado           VARCHAR(20) NOT NULL DEFAULT 'SOLICITADA',
    id_usuario_solicita INT REFERENCES usuario(id_usuario),
    comentario       TEXT,
    estado_registro  BOOLEAN NOT NULL DEFAULT true
);

-- Disposición final de bajas de activos (Fase 7).
ALTER TABLE solicitud_baja_activo ADD COLUMN IF NOT EXISTS destino_final VARCHAR(60);
ALTER TABLE solicitud_baja_activo ADD COLUMN IF NOT EXISTS borrado_seguro BOOLEAN;
ALTER TABLE solicitud_baja_activo ADD COLUMN IF NOT EXISTS acta TEXT;
ALTER TABLE solicitud_baja_activo ADD COLUMN IF NOT EXISTS fecha_disposicion TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_campana_item_campana ON campana_inventario_item(id_campana);
CREATE INDEX IF NOT EXISTS idx_cmdb_inexactitud_ci ON cmdb_inexactitud(id_ci);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_activo ON mantenimiento_activo(id_activo);
