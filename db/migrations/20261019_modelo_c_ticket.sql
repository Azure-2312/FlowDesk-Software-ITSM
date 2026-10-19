-- Modelo C: tabla base `ticket` + extensiones 1:1 por tipo.
-- Fecha: 2026-10-19
-- Contexto: la tabla `ticket` tenia 0 filas al aplicar esta migracion.
--
-- Regla:
--   * `ticket` conserva el ciclo de vida compartido.
--   * `ticket_incidente` guarda solo lo exclusivo de incidentes.
--   * `ticket_solicitud` guarda solo lo exclusivo de solicitudes.
--   * `vista_ticket` devuelve la forma plana anterior para no cambiar la API.

BEGIN;

CREATE TABLE IF NOT EXISTS ticket_incidente (
    id_ticket             INT PRIMARY KEY REFERENCES ticket(id_ticket) ON DELETE CASCADE,
    id_problema           INT REFERENCES problema(id_problema),
    es_incidente_mayor    BOOLEAN NOT NULL DEFAULT false,
    causado_por_cambio_id INT REFERENCES cambio(id_cambio)
);

CREATE TABLE IF NOT EXISTS ticket_solicitud (
    id_ticket         INT PRIMARY KEY REFERENCES ticket(id_ticket) ON DELETE CASCADE,
    estado_aprobacion VARCHAR(30) NOT NULL DEFAULT 'NO_APLICA',
    id_paso_actual    INT REFERENCES servicio_workflow_paso(id_paso)
);

-- Backfill (la tabla estaba vacia; se deja por si se aplica en otro entorno).
INSERT INTO ticket_incidente (id_ticket, id_problema, es_incidente_mayor, causado_por_cambio_id)
SELECT id_ticket, id_problema, COALESCE(es_incidente_mayor, false), causado_por_cambio_id
FROM ticket
WHERE id_tipo_ticket = 1
ON CONFLICT (id_ticket) DO NOTHING;

INSERT INTO ticket_solicitud (id_ticket, estado_aprobacion, id_paso_actual)
SELECT id_ticket, COALESCE(estado_aprobacion, 'NO_APLICA'), id_paso_actual
FROM ticket
WHERE id_tipo_ticket = 2
ON CONFLICT (id_ticket) DO NOTHING;

ALTER TABLE ticket
    DROP COLUMN IF EXISTS id_problema,
    DROP COLUMN IF EXISTS es_incidente_mayor,
    DROP COLUMN IF EXISTS causado_por_cambio_id,
    DROP COLUMN IF EXISTS estado_aprobacion,
    DROP COLUMN IF EXISTS id_paso_actual;

CREATE OR REPLACE VIEW vista_ticket AS
SELECT
    t.*,
    ti.id_problema,
    COALESCE(ti.es_incidente_mayor, false) AS es_incidente_mayor,
    ti.causado_por_cambio_id,
    COALESCE(ts.estado_aprobacion, 'NO_APLICA') AS estado_aprobacion,
    ts.id_paso_actual
FROM ticket t
LEFT JOIN ticket_incidente ti ON ti.id_ticket = t.id_ticket
LEFT JOIN ticket_solicitud ts ON ts.id_ticket = t.id_ticket;

-- Toda fila de ticket nace con su extension correcta y nunca con las dos.
CREATE OR REPLACE FUNCTION fn_ticket_subtipo() RETURNS trigger AS $$
BEGIN
    IF NEW.id_tipo_ticket = 1 THEN
        INSERT INTO ticket_incidente (id_ticket) VALUES (NEW.id_ticket)
        ON CONFLICT (id_ticket) DO NOTHING;
        DELETE FROM ticket_solicitud WHERE id_ticket = NEW.id_ticket;
    ELSIF NEW.id_tipo_ticket = 2 THEN
        INSERT INTO ticket_solicitud (id_ticket) VALUES (NEW.id_ticket)
        ON CONFLICT (id_ticket) DO NOTHING;
        DELETE FROM ticket_incidente WHERE id_ticket = NEW.id_ticket;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ticket_subtipo ON ticket;
CREATE TRIGGER trg_ticket_subtipo
AFTER INSERT OR UPDATE OF id_tipo_ticket ON ticket
FOR EACH ROW EXECUTE FUNCTION fn_ticket_subtipo();

COMMIT;
