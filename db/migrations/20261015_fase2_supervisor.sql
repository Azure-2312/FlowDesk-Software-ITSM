-- Fase 2 (Supervisor): tablas de soporte para las páginas nuevas del perfil 4.
-- Idempotente.

-- Incidentes mayores declarados por el Supervisor (sala de crisis).
CREATE TABLE IF NOT EXISTS incidente_mayor (
    id_incidente_mayor  SERIAL PRIMARY KEY,
    codigo              VARCHAR(30) UNIQUE NOT NULL,
    titulo              VARCHAR(200) NOT NULL,
    descripcion         TEXT,
    severidad           VARCHAR(10) NOT NULL DEFAULT 'P1',
    id_ticket           INT REFERENCES ticket(id_ticket),
    id_departamento     INT REFERENCES departamento_ti(id_departamento),
    estado              VARCHAR(20) NOT NULL DEFAULT 'ABIERTO', -- ABIERTO | MITIGADO | CERRADO
    sala_virtual        TEXT,
    comunicados         JSONB NOT NULL DEFAULT '[]'::jsonb,
    id_usuario_declara  INT NOT NULL REFERENCES usuario(id_usuario),
    id_usuario_cierra   INT REFERENCES usuario(id_usuario),
    fecha_declaracion   TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre        TIMESTAMPTZ,
    estado_registro     BOOLEAN NOT NULL DEFAULT true
);

-- Vistas guardadas y respuestas predefinidas compartidas por el equipo.
CREATE TABLE IF NOT EXISTS equipo_recurso_compartido (
    id_recurso          SERIAL PRIMARY KEY,
    tipo                VARCHAR(20) NOT NULL, -- VISTA | RESPUESTA
    nombre              VARCHAR(120) NOT NULL,
    contenido           JSONB NOT NULL DEFAULT '{}'::jsonb,
    id_departamento     INT REFERENCES departamento_ti(id_departamento),
    id_usuario_creacion INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro     BOOLEAN NOT NULL DEFAULT true
);

-- Solicitudes de baja de activos que aprueba o rechaza el Supervisor.
CREATE TABLE IF NOT EXISTS solicitud_baja_activo (
    id_solicitud          SERIAL PRIMARY KEY,
    id_activo             INT NOT NULL REFERENCES activo(id_activo),
    motivo                TEXT NOT NULL,
    estado                VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE | APROBADA | RECHAZADA
    id_usuario_solicita   INT NOT NULL REFERENCES usuario(id_usuario),
    id_usuario_resuelve   INT REFERENCES usuario(id_usuario),
    comentario_resolucion TEXT,
    fecha_solicitud       TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_resolucion      TIMESTAMPTZ,
    estado_registro       BOOLEAN NOT NULL DEFAULT true
);
