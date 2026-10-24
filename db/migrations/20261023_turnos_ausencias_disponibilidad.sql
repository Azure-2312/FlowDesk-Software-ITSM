-- ============================================================================
-- TURNOS, AUSENCIAS Y DISPONIBILIDAD EFECTIVA DE TÉCNICOS
-- Archivo: db/migrations/20261023_turnos_ausencias_disponibilidad.sql
--
-- 1) Normaliza tecnico_ausencias al contrato usado por organizacion.
-- 2) Agrega el técnico de reemplazo.
-- 3) Crea la agenda persistente de turnos.
-- 4) Publica la pantalla en el menú de Organización.
--
-- La migración es idempotente: puede ejecutarse varias veces.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. TABLA BASE: AUSENCIAS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tecnico_ausencias (
  id_ausencia SERIAL PRIMARY KEY,
  id_usuario_tecnico INT NOT NULL REFERENCES usuario(id_usuario),
  fecha_desde TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_hasta TIMESTAMP WITH TIME ZONE NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  id_usuario_reemplazo INT REFERENCES usuario(id_usuario),
  registrado_por INT REFERENCES usuario(id_usuario),
  fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  estado_registro BOOLEAN NOT NULL DEFAULT true
);

-- Compatibilidad con la definición histórica (id_tecnico/desde/hasta/creado_*).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'id_tecnico'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'id_usuario_tecnico'
  ) THEN
    ALTER TABLE tecnico_ausencias RENAME COLUMN id_tecnico TO id_usuario_tecnico;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'desde'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'fecha_desde'
  ) THEN
    ALTER TABLE tecnico_ausencias RENAME COLUMN desde TO fecha_desde;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'hasta'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'fecha_hasta'
  ) THEN
    ALTER TABLE tecnico_ausencias RENAME COLUMN hasta TO fecha_hasta;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'creado_por'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'registrado_por'
  ) THEN
    ALTER TABLE tecnico_ausencias RENAME COLUMN creado_por TO registrado_por;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'creado_en'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'fecha_registro'
  ) THEN
    ALTER TABLE tecnico_ausencias RENAME COLUMN creado_en TO fecha_registro;
  END IF;
END $$;

-- Columnas nuevas y defensas para instalaciones parcialmente migradas.
ALTER TABLE tecnico_ausencias
  ADD COLUMN IF NOT EXISTS id_usuario_reemplazo INT REFERENCES usuario(id_usuario),
  ADD COLUMN IF NOT EXISTS registrado_por INT REFERENCES usuario(id_usuario),
  ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS estado_registro BOOLEAN NOT NULL DEFAULT true;

-- Si conviven columnas históricas y nuevas, evita que las históricas bloqueen
-- los INSERT del contrato actual.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'id_tecnico'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tecnico_ausencias ALTER COLUMN id_tecnico DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'desde'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tecnico_ausencias ALTER COLUMN desde DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'tecnico_ausencias'
      AND column_name = 'hasta'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tecnico_ausencias ALTER COLUMN hasta DROP NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tecnico_ausencias_tecnico_fechas
  ON tecnico_ausencias (id_usuario_tecnico, fecha_desde, fecha_hasta)
  WHERE estado_registro = true;

-- ---------------------------------------------------------------------------
-- 2. AGENDA DE TURNOS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tecnico_turnos (
  id_turno SERIAL PRIMARY KEY,
  id_usuario_tecnico INT NOT NULL REFERENCES usuario(id_usuario),
  fecha DATE NOT NULL,
  turno VARCHAR(20) NOT NULL,
  notas VARCHAR(255),
  registrado_por INT REFERENCES usuario(id_usuario),
  fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  estado_registro BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT chk_tecnico_turnos_turno
    CHECK (turno IN ('MANANA', 'TARDE', 'NOCHE', 'GUARDIA_24X7')),
  CONSTRAINT uq_tecnico_turnos_tecnico_fecha_turno
    UNIQUE (id_usuario_tecnico, fecha, turno)
);

CREATE INDEX IF NOT EXISTS idx_tecnico_turnos_fecha
  ON tecnico_turnos (fecha, turno)
  WHERE estado_registro = true;

CREATE INDEX IF NOT EXISTS idx_tecnico_turnos_tecnico
  ON tecnico_turnos (id_usuario_tecnico, fecha)
  WHERE estado_registro = true;

-- ---------------------------------------------------------------------------
-- 3. MENÚ: TURNOS Y AUSENCIAS
-- ---------------------------------------------------------------------------
INSERT INTO opciones_menu (
  id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden,
  estado_registro, permiso_requerido, modulo_requerido, condicion_nivel,
  contador_clave, bloqueado, abierto_por_defecto
) VALUES (
  21266,
  'Turnos y ausencias',
  '/plataforma/organizacion/turnos-ausencias',
  'Calendario de turnos, guardias 24x7, vacaciones, permisos y técnico de reemplazo.',
  21264, 2, 5, true, NULL, NULL, NULL, NULL, false, false
)
ON CONFLICT (id_opcion_menu) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  url_menu = EXCLUDED.url_menu,
  descripcion = EXCLUDED.descripcion,
  id_padre = EXCLUDED.id_padre,
  nivel = EXCLUDED.nivel,
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
VALUES
  (21266, 1, 1, true),
  (21266, 4, 1, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET
  orden = EXCLUDED.orden,
  estado_registro = true;

COMMIT;
