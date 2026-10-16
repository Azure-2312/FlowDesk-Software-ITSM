-- Fase 5 (Aprobador / CAB): agenda y actas del comité, comité de emergencia,
-- aprobaciones por monto (bajas y renovaciones) y cierre de problemas mayores.
-- Idempotente.

-- Reuniones del Comité Asesor de Cambios (CAB): agenda y acta.
CREATE TABLE IF NOT EXISTS cab_reunion (
    id_reunion      SERIAL PRIMARY KEY,
    titulo          VARCHAR(200) NOT NULL,
    fecha_reunion   TIMESTAMPTZ NOT NULL,
    tipo            VARCHAR(20) NOT NULL DEFAULT 'ORDINARIA'
                    CHECK (tipo IN ('ORDINARIA', 'EXTRAORDINARIA', 'EMERGENCIA')),
    estado          VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADA'
                    CHECK (estado IN ('PROGRAMADA', 'REALIZADA', 'CANCELADA')),
    agenda          JSONB NOT NULL DEFAULT '[]'::jsonb,
    acta            TEXT,
    id_convocante   INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_cab_reunion_fecha
    ON cab_reunion(fecha_reunion) WHERE estado_registro = true;

-- Decisiones del Comité de Emergencia (ECAB): plazo y revisión retroactiva.
CREATE TABLE IF NOT EXISTS ecab_decision (
    id_ecab              SERIAL PRIMARY KEY,
    id_cambio            INT NOT NULL REFERENCES cambio(id_cambio),
    decision             VARCHAR(20) NOT NULL CHECK (decision IN ('APROBADO', 'RECHAZADO')),
    condiciones          TEXT,
    plazo_horas          INT,
    revision_retroactiva BOOLEAN NOT NULL DEFAULT true,
    id_aprobador         INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_decision       TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro      BOOLEAN NOT NULL DEFAULT true
);

-- Aprobaciones por monto: bajas de activos y renovaciones de licencias.
CREATE TABLE IF NOT EXISTS aprobacion_monto (
    id_aprobacion_monto SERIAL PRIMARY KEY,
    tipo                VARCHAR(20) NOT NULL CHECK (tipo IN ('BAJA', 'RENOVACION')),
    id_referencia       INT NOT NULL,
    monto               NUMERIC(12, 2),
    decision            VARCHAR(20) NOT NULL CHECK (decision IN ('APROBADO', 'RECHAZADO')),
    comentario          TEXT,
    id_aprobador        INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_decision      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aprobacion_monto_ref
    ON aprobacion_monto(tipo, id_referencia);

-- Riesgo aceptado y cierre de problemas mayores.
CREATE TABLE IF NOT EXISTS problema_cierre_aprobacion (
    id_cierre       SERIAL PRIMARY KEY,
    id_problema     INT NOT NULL REFERENCES problema(id_problema),
    decision        VARCHAR(20) NOT NULL CHECK (decision IN ('APROBADO', 'RECHAZADO')),
    riesgo_aceptado TEXT,
    comentario      TEXT,
    id_aprobador    INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_decision  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_problema_cierre_problema
    ON problema_cierre_aprobacion(id_problema);
