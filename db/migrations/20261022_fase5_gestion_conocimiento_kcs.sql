-- db/migrations/20261022_fase5_gestion_conocimiento_kcs.sql
-- Fase 5: Gestion del Conocimiento KCS v6, Versionado, Feedback, Desvio de Tickets y Plantillas

ALTER TABLE articulo_conocimiento
  ADD COLUMN IF NOT EXISTS tipo_plantilla VARCHAR(30) NOT NULL DEFAULT 'HOWTO',
  ADD COLUMN IF NOT EXISTS clasificacion_seguridad VARCHAR(30) NOT NULL DEFAULT 'PUBLICO',
  ADD COLUMN IF NOT EXISTS fecha_proxima_revision DATE,
  ADD COLUMN IF NOT EXISTS es_workaround_kedb BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS veces_utilizado_en_tickets INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS etiquetas TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS resumen_sintoma TEXT,
  ADD COLUMN IF NOT EXISTS resumen_solucion TEXT,
  ADD COLUMN IF NOT EXISTS aqi_puntuacion INT NOT NULL DEFAULT 100;

-- 1. Tabla de Plantillas KCS Estandarizadas
CREATE TABLE IF NOT EXISTS articulo_plantilla (
  id_plantilla SERIAL PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50) DEFAULT 'FileText',
  estructura_markdown TEXT NOT NULL,
  campos_obligatorios JSONB NOT NULL DEFAULT '[]'::jsonb,
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla de Versionado Historico Inmutable
CREATE TABLE IF NOT EXISTS articulo_conocimiento_version (
  id_version SERIAL PRIMARY KEY,
  id_articulo INT NOT NULL REFERENCES articulo_conocimiento(id_articulo) ON DELETE CASCADE,
  numero_version VARCHAR(10) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  contenido_markdown TEXT NOT NULL,
  motivo_cambio TEXT,
  id_autor INT NOT NULL REFERENCES usuario(id_usuario),
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla de Feedback Detallado y Evaluacion KCS
CREATE TABLE IF NOT EXISTS articulo_conocimiento_feedback (
  id_feedback SERIAL PRIMARY KEY,
  id_articulo INT NOT NULL REFERENCES articulo_conocimiento(id_articulo) ON DELETE CASCADE,
  id_usuario INT REFERENCES usuario(id_usuario),
  es_positivo BOOLEAN NOT NULL,
  motivo_negativo VARCHAR(50),
  comentario TEXT,
  ip VARCHAR(45),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Vinculacion de Articulos Usados en Resolucion de Tickets (Solve Loop)
CREATE TABLE IF NOT EXISTS articulo_conocimiento_vinculo_ticket (
  id_vinculo SERIAL PRIMARY KEY,
  id_articulo INT NOT NULL REFERENCES articulo_conocimiento(id_articulo) ON DELETE CASCADE,
  id_ticket INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE,
  id_tecnico INT NOT NULL REFERENCES usuario(id_usuario),
  resolvio_ticket BOOLEAN NOT NULL DEFAULT true,
  fecha_vinculo TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_articulo_ticket UNIQUE (id_articulo, id_ticket)
);

-- 5. Registro de Busquedas y Deteccion de Brechas (Ticket Deflection / Gap Analysis)
CREATE TABLE IF NOT EXISTS busqueda_conocimiento_log (
  id_log SERIAL PRIMARY KEY,
  termino_busqueda VARCHAR(255) NOT NULL,
  resultados_encontrados INT NOT NULL DEFAULT 0,
  id_articulo_clicado INT REFERENCES articulo_conocimiento(id_articulo) ON DELETE SET NULL,
  deflexion_exitosa BOOLEAN NOT NULL DEFAULT false,
  id_usuario INT REFERENCES usuario(id_usuario),
  id_perfil INT REFERENCES perfil(id_perfil),
  origen VARCHAR(30) NOT NULL DEFAULT 'PORTAL',
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_art_conocimiento_plantilla ON articulo_conocimiento(tipo_plantilla);
CREATE INDEX IF NOT EXISTS idx_art_conocimiento_seguridad ON articulo_conocimiento(clasificacion_seguridad);
CREATE INDEX IF NOT EXISTS idx_art_conocimiento_kedb ON articulo_conocimiento(es_workaround_kedb);
CREATE INDEX IF NOT EXISTS idx_art_version_articulo ON articulo_conocimiento_version(id_articulo);
CREATE INDEX IF NOT EXISTS idx_art_feedback_articulo ON articulo_conocimiento_feedback(id_articulo);
CREATE INDEX IF NOT EXISTS idx_art_vinculo_ticket ON articulo_conocimiento_vinculo_ticket(id_ticket);
CREATE INDEX IF NOT EXISTS idx_busqueda_log_termino ON busqueda_conocimiento_log(termino_busqueda);

-- Insercion de Plantillas KCS Base (Semilla)
INSERT INTO articulo_plantilla (codigo, nombre, descripcion, icono, estructura_markdown, campos_obligatorios)
VALUES
  ('HOWTO', 'Guía Paso a Paso / Instructivo', 'Estructura orientada a tareas procedimentales claras para autoservicio o técnicos.', 'BookOpen', 
   '## Resumen del Procedimiento\nBreve descripción del objetivo que se logrará con esta guía.\n\n## Requisitos Previos\n- Requisito 1\n- Requisito 2\n\n## Pasos a Seguir\n1. Primer paso con instrucción clara.\n2. Segundo paso.\n3. Tercer paso de verificación.\n\n## Verificación y Resultados\nCómo confirmar que el procedimiento funcionó correctamente.', '["Resumen", "Pasos"]')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO articulo_plantilla (codigo, nombre, descripcion, icono, estructura_markdown, campos_obligatorios)
VALUES
  ('FALLA', 'Resolución de Incidente / Falla Técnica', 'Plantilla estandarizada KCS para documentar síntomas, causa raíz y solución.', 'AlertTriangle', 
   '## Síntoma / Error Observado\nDescripción exacta del mensaje de error o comportamiento anómalo que reporta el usuario.\n\n## Entorno Afectado\n- Sistema Operativo / Aplicación:\n- Versión:\n- Componente de Infraestructura (CI):\n\n## Causa Raíz Identificada\nExplicación técnica de por qué ocurre este fallo.\n\n## Solución Definitiva\nInstrucciones paso a paso para corregir el incidente de forma permanente.', '["Síntoma", "Entorno", "Solución"]')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO articulo_plantilla (codigo, nombre, descripcion, icono, estructura_markdown, campos_obligatorios)
VALUES
  ('KEDB_WORKAROUND', 'Solución Temporal KEDB (Workaround)', 'Plantilla vinculada a Problemas y KEDB para mitigar incidentes sin resolver la causa.', 'ShieldAlert', 
   '## Problema Relacionado\nIdentificador del Problema origen (ej. PRB-2026-001).\n\n## Condición de Disparo\nEn qué circunstancias se manifiesta esta falla recurrente.\n\n## Solución Temporal (Workaround)\nProcedimiento inmediato para restaurar el servicio al usuario mientras se implementa la solución definitiva vía Cambio (RFC).\n\n## Riesgos o Limitaciones del Workaround\nEfectos secundarios o consideraciones de seguridad al aplicar esta mitigación.', '["Problema Relacionado", "Solución Temporal"]')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO articulo_plantilla (codigo, nombre, descripcion, icono, estructura_markdown, campos_obligatorios)
VALUES
  ('FAQ', 'Preguntas Frecuentes (FAQ)', 'Pregunta y respuesta directa orientada a resolver dudas comunes del solicitante.', 'HelpCircle', 
   '## Pregunta Frecuente\n¿Cuál es la duda o inquietud planteada en el vocabulario del usuario?\n\n## Respuesta Directa\nExplicación concisa y clara sin tecnicismos innecesarios.\n\n## Enlaces Relacionados\n- [Solicitar servicio en catálogo](#)\n- [Guía complementaria](#)', '["Pregunta", "Respuesta"]')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO articulo_plantilla (codigo, nombre, descripcion, icono, estructura_markdown, campos_obligatorios)
VALUES
  ('SOP', 'Procedimiento Operativo Estándar (SOP)', 'Protocolo técnico formal para administradores y soporte de infraestructura.', 'FileCheck', 
   '## Objetivo y Alcance\nPropósito del procedimiento operativo y a qué entornos aplica.\n\n## Roles y Responsabilidades\nQuién ejecuta y quién supervisa.\n\n## Protocolo de Ejecución\nInstrucciones detalladas de comandos, configuración y validaciones de seguridad.\n\n## Plan de Contingencia / Rollback\nAcciones en caso de falla durante la ejecución.', '["Objetivo", "Protocolo"]')
ON CONFLICT (codigo) DO NOTHING;
