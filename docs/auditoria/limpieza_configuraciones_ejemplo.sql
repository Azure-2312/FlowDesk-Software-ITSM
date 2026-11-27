-- ============================================================================
-- LIMPIEZA DE CONFIGURACIONES DE EJEMPLO (producción) · ejecutar UNA sola vez
-- ----------------------------------------------------------------------------
-- Borra:
--   · configuracion_modulo_versiones (borradores y versiones publicadas de las
--     pantallas de configuración: CAB/ECAB, tipos y modelos, ciclos de vida,
--     licencias, CMDB, notificaciones y calendario...). Cada módulo vuelve a
--     sus valores de fábrica, que ya no traen datos ficticios.
--   · ubicacion (sedes, pisos, salas de ejemplo)
--   · ventanas_mantenimiento
--   · periodos_congelamiento
--
-- Ninguna otra tabla depende de estas (verificado en estado_bd.csv), y las
-- operativas que las usaban ya están vacías.
--
-- OPCIONAL, antes de ejecutar: para ver qué configuraciones publicadas se
-- perderán, corra solo esta consulta:
--   SELECT modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, fecha_creacion
--     FROM configuracion_modulo_versiones ORDER BY modulo, pantalla, pestana, numero_version;
-- ============================================================================
BEGIN;

TRUNCATE TABLE
  configuracion_modulo_versiones,
  ubicacion,
  ventanas_mantenimiento,
  periodos_congelamiento
RESTART IDENTITY;

-- Contadores de id en 1 (incluye secuencias creadas aparte de su tabla).
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT substring(c.column_default FROM 'nextval\(''([^'']+)''') AS secuencia
      FROM information_schema.columns c
     WHERE c.table_schema = 'public' AND c.column_default LIKE 'nextval(%'
       AND c.table_name IN ('configuracion_modulo_versiones', 'ubicacion', 'ventanas_mantenimiento', 'periodos_congelamiento')
  LOOP
    EXECUTE format('SELECT setval(%L, 1, false)', r.secuencia);
  END LOOP;
END $$;

COMMIT;

-- Verificación: las cuatro deben quedar en 0.
SELECT 'configuracion_modulo_versiones' AS tabla, COUNT(*) AS filas FROM configuracion_modulo_versiones
UNION ALL SELECT 'ubicacion', COUNT(*) FROM ubicacion
UNION ALL SELECT 'ventanas_mantenimiento', COUNT(*) FROM ventanas_mantenimiento
UNION ALL SELECT 'periodos_congelamiento', COUNT(*) FROM periodos_congelamiento;
