-- Acta de entrega / aceptación digital de activos (perfil Solicitante).
-- Registra las actas de entrega emitidas al custodio de un activo para que
-- este pueda aceptarlas o devolverlas desde "Mis activos". Idempotente.

CREATE TABLE IF NOT EXISTS acta_entrega (
    id_acta       SERIAL PRIMARY KEY,
    id_activo     INT NOT NULL REFERENCES activo(id_activo),
    id_usuario    INT NOT NULL REFERENCES usuario(id_usuario),
    tipo          TEXT NOT NULL DEFAULT 'ENTREGA',
    estado        TEXT NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
    aceptado_en   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_acta_entrega_activo ON acta_entrega(id_activo);
CREATE INDEX IF NOT EXISTS idx_acta_entrega_usuario ON acta_entrega(id_usuario);
CREATE INDEX IF NOT EXISTS idx_acta_entrega_estado ON acta_entrega(estado);
