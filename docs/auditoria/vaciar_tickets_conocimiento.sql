-- ============================================================================
-- VACIAR TICKETS Y BASE DE CONOCIMIENTO (producción) · antes de recargar
-- ----------------------------------------------------------------------------
-- Para volver a ejecutar carga_conocimiento_tickets.sql con su versión nueva.
--
-- Vacía: tickets (incidentes y solicitudes) con sus comentarios, adjuntos,
-- aprobaciones, incidentes mayores y vínculos; artículos de conocimiento con
-- sus votos, historial y versiones; y las notificaciones de tickets/artículos.
--
-- NO toca: usuarios, catálogo de servicios, activos, CI, licencias, contratos
-- ni configuración. (Las fechas de asignación de Adobe las vuelve a fijar la
-- carga de tickets.)
--
-- Protección: si ya existen cambios o problemas, se detiene sin borrar nada,
-- porque esos registros pueden depender de los tickets.
-- Todo va en UN bloque: si algo falla, no se borra nada.
-- Haga un respaldo antes de ejecutarlo.
-- ============================================================================
DO $$
DECLARE
  v_tablas    TEXT[];
  v_existen   TEXT[];
  r           RECORD;
  v_t         TEXT;
BEGIN
  IF to_regclass('public.cambio') IS NOT NULL AND EXISTS (SELECT 1 FROM cambio) THEN
    RAISE EXCEPTION 'Hay cambios registrados que pueden depender de los tickets. No se borró nada.';
  END IF;
  IF to_regclass('public.problema') IS NOT NULL AND EXISTS (SELECT 1 FROM problema) THEN
    RAISE EXCEPTION 'Hay problemas registrados que pueden depender de los tickets. No se borró nada.';
  END IF;

  -- Tablas de tickets y conocimiento, de hijas a padres (las que no existan
  -- se omiten). Se borra fila a fila (DELETE) para respetar las llaves: si
  -- alguna tabla no prevista dependiera de un ticket, falla y no borra nada.
  v_tablas := ARRAY[
    'articulo_conocimiento_vinculo_ticket', 'articulo_conocimiento_feedback',
    'articulo_conocimiento_historial', 'articulo_conocimiento_version',
    'comentario_ticket', 'adjunto_ticket', 'ticket_aprobacion', 'ticket_incidente', 'ticket_solicitud',
    'incidente_mayor', 'problema_incidente', 'evento_servicio', 'ticket_lecturas',
    'articulo_conocimiento', 'ticket'];
  SELECT array_agg(t ORDER BY o) INTO v_existen
    FROM unnest(v_tablas) WITH ORDINALITY AS x(t, o) WHERE to_regclass('public.' || t) IS NOT NULL;

  FOREACH v_t IN ARRAY v_existen LOOP
    EXECUTE format('DELETE FROM %I', v_t);
  END LOOP;

  -- Contadores de id en 1 (incluye secuencias creadas aparte de su tabla)
  FOR r IN
    SELECT substring(c.column_default FROM 'nextval\(''([^'']+)''') AS secuencia
      FROM information_schema.columns c
     WHERE c.table_schema = 'public' AND c.column_default LIKE 'nextval(%'
       AND c.table_name = ANY (v_existen)
  LOOP
    EXECUTE format('SELECT setval(%L, 1, false)', r.secuencia);
  END LOOP;

  -- Notificaciones que apuntan a tickets o artículos que ya no existen
  IF to_regclass('public.notificaciones') IS NOT NULL THEN
    DELETE FROM notificaciones WHERE entidad_tipo IN ('ticket', 'articulo');
  END IF;

  RAISE NOTICE 'Vaciadas % tablas: %', array_length(v_existen, 1), array_to_string(v_existen, ', ');
END $$;

-- Verificación: todo en 0; usuarios, servicios y activos se conservan
SELECT (SELECT COUNT(*) FROM ticket)                AS tickets,
       (SELECT COUNT(*) FROM comentario_ticket)     AS comentarios,
       (SELECT COUNT(*) FROM articulo_conocimiento) AS articulos,
       (SELECT COUNT(*) FROM usuario)               AS usuarios_conservados,
       (SELECT COUNT(*) FROM servicio_catalogo)     AS servicios_conservados,
       (SELECT COUNT(*) FROM activo)                AS activos_conservados;
