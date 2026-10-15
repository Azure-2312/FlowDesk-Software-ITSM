-- Preferencias de notificación por usuario (página /mi-cuenta/notificaciones).
-- Idempotente: puede ejecutarse varias veces sin efectos colaterales.

CREATE TABLE IF NOT EXISTS preferencia_notificacion (
    id_usuario          INT PRIMARY KEY REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    correo_tickets      BOOLEAN NOT NULL DEFAULT true,
    correo_cambios      BOOLEAN NOT NULL DEFAULT true,
    correo_problemas    BOOLEAN NOT NULL DEFAULT true,
    correo_conocimiento BOOLEAN NOT NULL DEFAULT false,
    resumen_diario      BOOLEAN NOT NULL DEFAULT false,
    canal_preferido     VARCHAR(20) NOT NULL DEFAULT 'CORREO',
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);
