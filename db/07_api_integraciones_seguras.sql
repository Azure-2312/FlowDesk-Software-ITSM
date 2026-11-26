-- ============================================================================
-- 07 · INTEGRACIONES API SEGURAS (intercambio de datos con otros equipos)
-- ----------------------------------------------------------------------------
-- 1) API ENTRANTE (otros equipos consultan a FlowDesk):
--    · Solo expone Solicitantes activos (perfil 3), en modo lectura.
--    · Acceso con credencial de cliente (client_id + client_secret) que se canjea
--      por un TOKEN TEMPORAL (15 min). Nunca hay enlace directo ni clave fija en la URL.
--    · El secreto se guarda con HMAC-SHA256 + pepper del servidor (no recuperable).
--    · Vigencia (expiración), revocación, rotación y lista de IPs permitidas.
--    · Bloqueo por fuerza bruta y límite por minuto calculados en la BD
--      (funciona en hosting serverless como Vercel).
-- 2) API SALIENTE (FlowDesk consulta a otros equipos): cada extracción queda en la
--    misma bitácora inmutable con el usuario que la hizo y el formato exportado.
-- Idempotente: se puede ejecutar más de una vez.
-- ============================================================================

-- 1. Credenciales de cliente ---------------------------------------------------
ALTER TABLE api_credenciales_externas ADD COLUMN IF NOT EXISTS client_id VARCHAR(40);
ALTER TABLE api_credenciales_externas ADD COLUMN IF NOT EXISTS fecha_expiracion TIMESTAMPTZ;
ALTER TABLE api_credenciales_externas ADD COLUMN IF NOT EXISTS ips_permitidas TEXT[];
ALTER TABLE api_credenciales_externas ADD COLUMN IF NOT EXISTS id_usuario_creacion INTEGER REFERENCES usuario(id_usuario);
ALTER TABLE api_credenciales_externas ADD COLUMN IF NOT EXISTS fecha_rotacion TIMESTAMPTZ;
ALTER TABLE api_credenciales_externas ADD COLUMN IF NOT EXISTS fecha_revocacion TIMESTAMPTZ;
ALTER TABLE api_credenciales_externas ADD COLUMN IF NOT EXISTS id_usuario_revocacion INTEGER REFERENCES usuario(id_usuario);
ALTER TABLE api_credenciales_externas ALTER COLUMN permisos SET DEFAULT '["solicitantes:leer"]'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS ux_api_credenciales_client_id
  ON api_credenciales_externas (client_id) WHERE client_id IS NOT NULL;

-- Las claves del esquema anterior (sin client_id, sin vencimiento y con permisos de
-- escritura) quedan revocadas: deben reemplazarse por credenciales nuevas.
UPDATE api_credenciales_externas
   SET estado = false, fecha_revocacion = COALESCE(fecha_revocacion, now())
 WHERE client_id IS NULL AND estado = true;

-- 2. Tokens temporales (solo se guarda su hash) --------------------------------
CREATE TABLE IF NOT EXISTS api_token_acceso (
  id_token          BIGSERIAL PRIMARY KEY,
  id_credencial     INTEGER NOT NULL REFERENCES api_credenciales_externas(id_credencial),
  token_hash        VARCHAR(64) NOT NULL UNIQUE,
  ip_origen         VARCHAR(50),
  fecha_emision     TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_expiracion  TIMESTAMPTZ NOT NULL,
  revocado          BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS ix_api_token_credencial ON api_token_acceso (id_credencial, fecha_expiracion);

-- 3. Bitácora: dirección (entrante/saliente) y usuario interno ------------------
ALTER TABLE api_log_auditoria ADD COLUMN IF NOT EXISTS direccion VARCHAR(10) NOT NULL DEFAULT 'ENTRANTE';
ALTER TABLE api_log_auditoria ADD COLUMN IF NOT EXISTS id_usuario INTEGER REFERENCES usuario(id_usuario);
ALTER TABLE api_log_auditoria ADD COLUMN IF NOT EXISTS detalle VARCHAR(255);
CREATE INDEX IF NOT EXISTS ix_api_log_credencial_fecha ON api_log_auditoria (id_credencial, fecha_registro);
CREATE INDEX IF NOT EXISTS ix_api_log_ip_fecha ON api_log_auditoria (ip_origen, fecha_registro);
CREATE INDEX IF NOT EXISTS ix_api_log_fecha ON api_log_auditoria (fecha_registro DESC);

-- La bitácora es de solo inserción (también definido en 02_stored_procedures.sql).
CREATE OR REPLACE FUNCTION fn_bloquear_modificacion_api_log()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'La bitácora api_log_auditoria es inmutable: no se permite UPDATE ni DELETE.';
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_proteger_log_auditoria'
                   AND tgrelid = 'api_log_auditoria'::regclass) THEN
    CREATE TRIGGER trg_proteger_log_auditoria
      BEFORE UPDATE OR DELETE ON api_log_auditoria
      FOR EACH STATEMENT EXECUTE FUNCTION fn_bloquear_modificacion_api_log();
  END IF;
END $$;

-- 4. Configuración de la API externa del Equipo 10 (sin secretos: la clave va en .env)
INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, usuario_modificacion, fecha_modificacion)
SELECT 'integracion_equipo10_clientes', 'INTEGRACIONES',
       'API de clientes de la empresa externa (Equipo 10)',
       '{"url_base": "https://carrito-equipo10.onrender.com", "ruta": "/api/clientes", "por_pagina": 100, "tiempo_espera_ms": 90000}'::jsonb,
       1, now()
 WHERE NOT EXISTS (SELECT 1 FROM configuracion_sistema WHERE clave = 'integracion_equipo10_clientes');

-- 5. Menú: Plataforma → "Integraciones API" (solo Administrador) ---------------
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
SELECT 21277, 'Integraciones API', '/plataforma/seguridad/integraciones-api',
       'Credenciales de acceso para otros equipos, bitácora de la API y clientes de empresas externas',
       (SELECT id_padre FROM opciones_menu WHERE url_menu = '/plataforma/seguridad/auditoria-sistema' LIMIT 1), 2, 4, true
 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/plataforma/seguridad/integraciones-api');

SELECT setval('opciones_menu_id_opcion_menu_seq', GREATEST((SELECT MAX(id_opcion_menu) FROM opciones_menu), 1));

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT 21277, 1, 4, true
 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles x WHERE x.id_opcion_menu = 21277 AND x.id_perfil = 1);
