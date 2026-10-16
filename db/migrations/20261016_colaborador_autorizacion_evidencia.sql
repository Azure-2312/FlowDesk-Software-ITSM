-- Autorizaciones delegadas por el Gestor de Área a los colaboradores de su
-- departamento empresarial y evidencias asociadas a los informes de auditoría.
-- Idempotente: puede ejecutarse varias veces sin efectos colaterales.

-- Autorizaciones funcionales que el Gestor de Área otorga a sus colaboradores.
CREATE TABLE IF NOT EXISTS colaborador_autorizacion (
    id_autorizacion SERIAL PRIMARY KEY,
    id_usuario      INT NOT NULL REFERENCES usuario(id_usuario),
    tipo            TEXT NOT NULL,
    otorgado_por    INT REFERENCES usuario(id_usuario),
    activo          BOOLEAN NOT NULL DEFAULT true,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT colaborador_autorizacion_usuario_tipo_key UNIQUE (id_usuario, tipo)
);

CREATE INDEX IF NOT EXISTS idx_colaborador_autorizacion_usuario
    ON colaborador_autorizacion(id_usuario) WHERE activo = true;

-- Evidencias (documentos, enlaces o notas) adjuntas a un informe de auditoría.
CREATE TABLE IF NOT EXISTS informe_evidencia (
    id_evidencia SERIAL PRIMARY KEY,
    id_informe   INT NOT NULL REFERENCES informe_auditoria(id_informe),
    descripcion  TEXT NOT NULL,
    contenido    TEXT,
    creado_por   INT REFERENCES usuario(id_usuario),
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_informe_evidencia_informe
    ON informe_evidencia(id_informe);
