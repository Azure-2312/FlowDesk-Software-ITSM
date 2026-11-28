-- ============================================================================
-- 11 · Cambio (RFC) originado por una solicitud de servicio
-- ----------------------------------------------------------------------------
-- Cuando cumplir una solicitud exige modificar algo en producción (por ejemplo,
-- abrir un puerto del firewall), el técnico registra una RFC desde la solicitud.
-- La RFC guarda la solicitud de origen, igual que ya guarda el incidente o el
-- problema de origen, y ambos detalles muestran el vínculo.
-- Idempotente: se puede ejecutar más de una vez.
-- ============================================================================
ALTER TABLE cambio ADD COLUMN IF NOT EXISTS id_solicitud_origen INTEGER;

ALTER TABLE cambio DROP CONSTRAINT IF EXISTS cambio_id_solicitud_origen_fkey;
ALTER TABLE cambio ADD CONSTRAINT cambio_id_solicitud_origen_fkey
  FOREIGN KEY (id_solicitud_origen) REFERENCES ticket(id_ticket);

CREATE INDEX IF NOT EXISTS idx_cambio_solicitud_origen ON cambio (id_solicitud_origen)
  WHERE id_solicitud_origen IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cambio_incidente_origen ON cambio (id_incidente_origen)
  WHERE id_incidente_origen IS NOT NULL;

-- Verificación
SELECT column_name, data_type FROM information_schema.columns
 WHERE table_name = 'cambio' AND column_name IN ('id_incidente_origen', 'id_problema_origen', 'id_solicitud_origen')
 ORDER BY column_name;
