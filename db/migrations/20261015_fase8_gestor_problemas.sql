-- Fase 8 (Gestor de Problemas): análisis de causa raíz estructurado (5 porqués,
-- Ishikawa y línea de tiempo) y vínculo de problemas mayores con su problema.
-- Idempotente.

CREATE TABLE IF NOT EXISTS problema_analisis (
    id_analisis    SERIAL PRIMARY KEY,
    id_problema    INT NOT NULL REFERENCES problema(id_problema),
    metodo         VARCHAR(40) NOT NULL DEFAULT '5_WHYS',
    cinco_porques  JSONB,
    ishikawa       JSONB,
    linea_tiempo   JSONB,
    conclusion     TEXT,
    id_usuario     INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE incidente_mayor ADD COLUMN IF NOT EXISTS id_problema INT REFERENCES problema(id_problema);

CREATE INDEX IF NOT EXISTS idx_problema_analisis_problema ON problema_analisis(id_problema);
CREATE INDEX IF NOT EXISTS idx_incidente_mayor_problema ON incidente_mayor(id_problema);
