-- ============================================================================
-- MIGRACIÓN: Creación y Remediación de vista_ticket para Incidentes y Solicitudes
-- Archivo: db/migrations/20261108_vista_ticket_remediacion.sql
-- ============================================================================

CREATE OR REPLACE VIEW vista_ticket AS
SELECT
    t.*,
    ti.causado_por_cambio_id,
    COALESCE(ts.estado_aprobacion, 'NO_APLICA') AS estado_aprobacion,
    ts.id_paso_actual
FROM ticket t
LEFT JOIN ticket_incidente ti ON ti.id_ticket = t.id_ticket
LEFT JOIN ticket_solicitud ts ON ts.id_ticket = t.id_ticket;
