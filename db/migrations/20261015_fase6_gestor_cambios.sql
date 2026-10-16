-- Fase 6 (Gestor de Cambios): excepciones de conflicto/congelamiento y
-- reclasificación de tipo de RFC con motivo. Idempotente.

CREATE TABLE IF NOT EXISTS cambio_excepcion (
    id_excepcion       SERIAL PRIMARY KEY,
    id_cambio          INT NOT NULL REFERENCES cambio(id_cambio),
    tipo               VARCHAR(20) NOT NULL
                       CHECK (tipo IN ('CONFLICTO', 'CONGELAMIENTO', 'RECLASIFICACION')),
    motivo             TEXT NOT NULL,
    id_usuario_autoriza INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_creacion     TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro    BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_cambio_excepcion_cambio
    ON cambio_excepcion(id_cambio) WHERE estado_registro = true;
