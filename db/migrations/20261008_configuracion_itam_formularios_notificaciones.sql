-- Configuración administrable por servicio, RFC, activos, conocimiento y eventos.
ALTER TABLE servicio_catalogo
  ADD COLUMN IF NOT EXISTS esquema_formulario JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS id_departamento_resolutor INT REFERENCES departamento_ti(id_departamento),
  ADD COLUMN IF NOT EXISTS reglas_escalamiento JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE configuracion_rfc
  ADD COLUMN IF NOT EXISTS campos_personalizados JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exige_rollback BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS duracion_maxima_horas SMALLINT NOT NULL DEFAULT 24;
ALTER TABLE cambio
  ADD COLUMN IF NOT EXISTS campos_adicionales JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE articulo_conocimiento
  ADD COLUMN IF NOT EXISTS audiencia_perfiles SMALLINT[] NOT NULL DEFAULT ARRAY[2,3,4,5,6,7,8,9]::SMALLINT[],
  ADD COLUMN IF NOT EXISTS fecha_revision DATE,
  ADD COLUMN IF NOT EXISTS motivo_retiro TEXT,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS articulo_conocimiento_historial (
  id_historial SERIAL PRIMARY KEY,
  id_articulo INT NOT NULL REFERENCES articulo_conocimiento(id_articulo),
  estado_anterior VARCHAR(20),
  estado_nuevo VARCHAR(20) NOT NULL,
  comentario TEXT,
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tipo_activo_catalogo (
  id_tipo_activo SERIAL PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  clase VARCHAR(16) NOT NULL CHECK (clase IN ('HARDWARE','SOFTWARE')),
  atributos JSONB NOT NULL DEFAULT '[]'::jsonb,
  estado_registro BOOLEAN NOT NULL DEFAULT true,
  usuario_modificacion INT REFERENCES usuario(id_usuario),
  fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modelo_activo (
  id_modelo SERIAL PRIMARY KEY,
  id_tipo_activo INT NOT NULL REFERENCES tipo_activo_catalogo(id_tipo_activo),
  fabricante VARCHAR(120) NOT NULL,
  nombre_modelo VARCHAR(160) NOT NULL,
  atributos JSONB NOT NULL DEFAULT '[]'::jsonb,
  vida_util_meses SMALLINT CHECK (vida_util_meses > 0),
  metodo_depreciacion VARCHAR(20) NOT NULL DEFAULT 'LINEAL' CHECK (metodo_depreciacion IN ('LINEAL','NINGUNA')),
  valor_residual_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (valor_residual_pct BETWEEN 0 AND 100),
  estado_registro BOOLEAN NOT NULL DEFAULT true,
  usuario_modificacion INT REFERENCES usuario(id_usuario),
  fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id_tipo_activo, fabricante, nombre_modelo)
);

ALTER TABLE activo
  ADD COLUMN IF NOT EXISTS id_modelo INT REFERENCES modelo_activo(id_modelo),
  ADD COLUMN IF NOT EXISTS atributos JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS valor_residual NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vida_util_meses SMALLINT;

CREATE TABLE IF NOT EXISTS transicion_activo (
  estado_origen VARCHAR(30) NOT NULL,
  estado_destino VARCHAR(30) NOT NULL,
  requiere_motivo BOOLEAN NOT NULL DEFAULT false,
  estado_registro BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY(estado_origen, estado_destino)
);
INSERT INTO transicion_activo(estado_origen,estado_destino,requiere_motivo) VALUES
 ('EN_STOCK','EN_OPERACION',false),('EN_OPERACION','EN_REPARACION',true),
 ('EN_REPARACION','EN_OPERACION',false),('EN_REPARACION','EN_STOCK',false),
 ('EN_OPERACION','EN_STOCK',true),('EN_STOCK','BAJA',true),
 ('EN_OPERACION','BAJA',true),('EN_REPARACION','BAJA',true)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS activo_historial (
  id_historial SERIAL PRIMARY KEY,
  id_activo INT NOT NULL REFERENCES activo(id_activo),
  estado_anterior VARCHAR(30),
  estado_nuevo VARCHAR(30) NOT NULL,
  custodio_anterior INT REFERENCES usuario(id_usuario),
  custodio_nuevo INT REFERENCES usuario(id_usuario),
  motivo TEXT,
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS licencia_asignacion (
  id_asignacion SERIAL PRIMARY KEY,
  id_licencia INT NOT NULL REFERENCES licencia_software(id_licencia),
  id_usuario INT REFERENCES usuario(id_usuario),
  id_activo INT REFERENCES activo(id_activo),
  fecha_asignacion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_devolucion DATE,
  motivo_devolucion TEXT,
  id_usuario_registro INT NOT NULL REFERENCES usuario(id_usuario),
  CHECK (id_usuario IS NOT NULL OR id_activo IS NOT NULL),
  CHECK (fecha_devolucion IS NULL OR fecha_devolucion >= fecha_asignacion)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_licencia_asignacion_usuario_activa
  ON licencia_asignacion(id_licencia,id_usuario) WHERE fecha_devolucion IS NULL AND id_usuario IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_licencia_asignacion_activo_activa
  ON licencia_asignacion(id_licencia,id_activo) WHERE fecha_devolucion IS NULL AND id_activo IS NOT NULL;

CREATE TABLE IF NOT EXISTS regla_notificacion (
  id_regla SERIAL PRIMARY KEY,
  codigo_evento VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(140) NOT NULL,
  descripcion TEXT,
  canal VARCHAR(20) NOT NULL DEFAULT 'EMAIL' CHECK (canal IN ('EMAIL')),
  plantilla JSONB NOT NULL DEFAULT '{}'::jsonb,
  destinatarios TEXT[] NOT NULL DEFAULT ARRAY['SOLICITANTE']::TEXT[],
  activa BOOLEAN NOT NULL DEFAULT true,
  usuario_modificacion INT REFERENCES usuario(id_usuario),
  fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO tipo_activo_catalogo(codigo,nombre,clase) VALUES
 ('COMPUTADOR','Computador','HARDWARE'),('SERVIDOR','Servidor','HARDWARE'),
 ('PERIFERICO','Periférico','HARDWARE'),('LICENCIA','Licencia de software','SOFTWARE')
ON CONFLICT(codigo) DO NOTHING;

INSERT INTO regla_notificacion(codigo_evento,nombre,descripcion,plantilla,destinatarios) VALUES
 ('TICKET_CREADO','Ticket creado','Confirmación de recepción','{"asunto":"Solicitud recibida: {{codigo_ticket}}","cuerpo":"Hemos recibido {{titulo}}."}'::jsonb,ARRAY['SOLICITANTE']),
 ('TICKET_RESUELTO','Ticket resuelto','Aviso de resolución','{"asunto":"Solicitud resuelta: {{codigo_ticket}}","cuerpo":"La solicitud {{titulo}} fue resuelta."}'::jsonb,ARRAY['SOLICITANTE']),
 ('RFC_ENVIADA_CAB','RFC enviada a evaluación','Aviso al comité de cambios','{"asunto":"RFC pendiente de evaluación: {{codigo_cambio}}","cuerpo":"La RFC {{titulo}} requiere evaluación."}'::jsonb,ARRAY['CAB'])
ON CONFLICT(codigo_evento) DO NOTHING;
