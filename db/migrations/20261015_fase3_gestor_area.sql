-- Fase 3 (Gestor de Área): delegación de aprobaciones por ausencia.
-- Idempotente.

CREATE TABLE IF NOT EXISTS aprobacion_delegacion (
    id_delegacion        SERIAL PRIMARY KEY,
    id_usuario_delegante INT NOT NULL REFERENCES usuario(id_usuario),
    id_usuario_delegado  INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_desde          DATE NOT NULL,
    fecha_hasta          DATE NOT NULL,
    motivo               TEXT,
    estado_registro      BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (fecha_hasta >= fecha_desde),
    CHECK (id_usuario_delegante <> id_usuario_delegado)
);

CREATE INDEX IF NOT EXISTS idx_aprobacion_delegacion_delegante
    ON aprobacion_delegacion(id_usuario_delegante) WHERE estado_registro = true;
