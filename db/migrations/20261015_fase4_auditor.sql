-- Fase 4 (Auditor): informes de auditoría, recertificación de accesos y
-- bitácora de auditoría del sistema (idempotente).

-- Bitácora integral del sistema (ya creada por scripts/migracion_panel_administrador.js).
CREATE TABLE IF NOT EXISTS log_auditoria_sistema (
    id_log         SERIAL PRIMARY KEY,
    id_usuario     INT REFERENCES usuario(id_usuario),
    modulo         VARCHAR(60) NOT NULL,
    accion         VARCHAR(30) NOT NULL,
    descripcion    TEXT NOT NULL,
    detalles       JSONB,
    direccion_ip   VARCHAR(45),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Informes de auditoría: hallazgos, recomendaciones y seguimiento.
CREATE TABLE IF NOT EXISTS informe_auditoria (
    id_informe      SERIAL PRIMARY KEY,
    codigo_informe  VARCHAR(30) UNIQUE NOT NULL,
    titulo          VARCHAR(200) NOT NULL,
    periodo         VARCHAR(60) NOT NULL,
    hallazgos       TEXT NOT NULL,
    recomendaciones TEXT,
    estado          VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
                    CHECK (estado IN ('BORRADOR', 'EMITIDO', 'CERRADO')),
    id_auditor      INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre    TIMESTAMPTZ,
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_informe_auditoria_auditor
    ON informe_auditoria(id_auditor) WHERE estado_registro = true;

-- Recertificación de accesos: decisión periódica del auditor sobre usuario × perfil.
CREATE TABLE IF NOT EXISTS recertificacion_acceso (
    id_recertificacion SERIAL PRIMARY KEY,
    id_usuario         INT NOT NULL REFERENCES usuario(id_usuario),
    id_perfil          INT NOT NULL REFERENCES perfiles(id_perfil),
    decision           VARCHAR(20) NOT NULL
                       CHECK (decision IN ('CONFIRMADO', 'RETIRADO')),
    comentario         TEXT,
    id_auditor         INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_decision     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recertificacion_usuario
    ON recertificacion_acceso(id_usuario, id_perfil);
