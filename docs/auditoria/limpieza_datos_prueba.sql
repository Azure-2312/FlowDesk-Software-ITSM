-- ============================================================================
-- LIMPIEZA DE DATOS DE PRUEBA (producción) · ejecutar UNA sola vez
-- ----------------------------------------------------------------------------
-- Deja el sistema listo para usarse: conserva usuarios, perfiles, menú,
-- catálogos y configuración; vacía todo lo operativo (tickets, problemas,
-- cambios, activos, CMDB, conocimiento, comprobantes, bitácoras...) y elimina
-- 17 tablas que el código no usa.
--
-- ANTES DE EJECUTAR: haga un respaldo (Supabase → Database → Backups, o
-- pg_dump). Vaciar tablas NO se puede deshacer.
--
-- Todo corre en una transacción: si algo falla, no se aplica nada.
-- Clasificación basada en docs/auditoria/estado_bd.csv y estado_bd_2.csv
-- (134 tablas) y en las consultas reales del código (2026-11-26).
-- ============================================================================
BEGIN;

-- 1. Eliminar las 17 tablas que ningún código usa (primero, porque algunas
--    apuntan a tablas que se vacían) -----------------------------------------
--    Sin CASCADE: si otra tabla las referenciara, falla y no se elimina nada.
DROP TABLE IF EXISTS acuerdo_nivel_operativo;
DROP TABLE IF EXISTS codigo_recuperacion;
DROP TABLE IF EXISTS cola_correo;
DROP TABLE IF EXISTS evento_servicio;
DROP TABLE IF EXISTS preferencia_notificacion;
DROP TABLE IF EXISTS problema_config_mayor;
DROP TABLE IF EXISTS problema_config_reapertura;
DROP TABLE IF EXISTS problema_criterio_mayor;
DROP TABLE IF EXISTS problema_regla_asignacion;
DROP TABLE IF EXISTS problema_regla_escalamiento;
DROP TABLE IF EXISTS problema_tarea_catalogo;
DROP TABLE IF EXISTS problema_tarea_paquete;
DROP TABLE IF EXISTS problema_transicion;
DROP TABLE IF EXISTS resiliencia_servicio;
DROP TABLE IF EXISTS respuestas_predefinidas;
DROP TABLE IF EXISTS ticket_lecturas;
DROP TABLE IF EXISTS cliente;

-- 2. Vaciar las 62 tablas operativas y reiniciar sus contadores de id ---------
--    Sin CASCADE: si alguna tabla que se conserva dependiera de estas, la
--    instrucción falla y no se borra nada.
TRUNCATE TABLE
  acta_entrega,
  activo,
  activo_historial,
  adjunto_ticket,
  api_credenciales_externas,
  api_log_auditoria,
  api_token_acceso,
  aprobacion_monto,
  articulo_conocimiento,
  articulo_conocimiento_feedback,
  articulo_conocimiento_historial,
  articulo_conocimiento_version,
  articulo_conocimiento_vinculo_ticket,
  bloqueo_edicion_concurrente,
  cab_reunion,
  cambio,
  cambio_aprobacion,
  cambio_enterado,
  cambio_excepcion,
  campana_inventario,
  campana_inventario_item,
  ci_relacion,
  cmdb_actualizacion,
  cmdb_inexactitud,
  cmdb_linea_base,
  colaborador_autorizacion,
  comentario_ticket,
  comprobante_proveedor,
  comprobante_proveedor_archivo,
  comprobante_proveedor_detalle,
  comprobante_proveedor_evento,
  contrato_ti,
  ecab_decision,
  elemento_configuracion,
  equipo_recurso_compartido,
  error_conocido,
  importacion_activos,
  incidente_mayor,
  informe_auditoria,
  informe_evidencia,
  licencia_asignacion,
  licencia_software,
  log_acceso,
  log_auditoria_sistema,
  mantenimiento_activo,
  notificaciones,
  problema,
  problema_analisis,
  problema_cierre_aprobacion,
  problema_incidente,
  problema_regla_umbral_ejecucion,
  recepcion_activo,
  recertificacion_acceso,
  renovacion_contrato,
  solicitud_baja_activo,
  tecnico_ausencias,
  tecnico_recordatorios,
  tecnico_turnos,
  ticket,
  ticket_aprobacion,
  ticket_incidente,
  ticket_solicitud
RESTART IDENTITY;

-- 3. Reiniciar en 1 los contadores de id de las tablas vaciadas ----------------
--    (RESTART IDENTITY no alcanza a las secuencias creadas aparte de su tabla).
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT substring(c.column_default FROM 'nextval\(''([^'']+)''') AS secuencia
      FROM information_schema.columns c
     WHERE c.table_schema = 'public' AND c.column_default LIKE 'nextval(%'
       AND c.table_name = ANY (ARRAY['acta_entrega','activo','activo_historial','adjunto_ticket','api_credenciales_externas','api_log_auditoria','api_token_acceso','aprobacion_monto','articulo_conocimiento','articulo_conocimiento_feedback','articulo_conocimiento_historial','articulo_conocimiento_version','articulo_conocimiento_vinculo_ticket','bloqueo_edicion_concurrente','cab_reunion','cambio','cambio_aprobacion','cambio_enterado','cambio_excepcion','campana_inventario','campana_inventario_item','ci_relacion','cmdb_actualizacion','cmdb_inexactitud','cmdb_linea_base','colaborador_autorizacion','comentario_ticket','comprobante_proveedor','comprobante_proveedor_archivo','comprobante_proveedor_detalle','comprobante_proveedor_evento','contrato_ti','ecab_decision','elemento_configuracion','equipo_recurso_compartido','error_conocido','importacion_activos','incidente_mayor','informe_auditoria','informe_evidencia','licencia_asignacion','licencia_software','log_acceso','log_auditoria_sistema','mantenimiento_activo','notificaciones','problema','problema_analisis','problema_cierre_aprobacion','problema_incidente','problema_regla_umbral_ejecucion','recepcion_activo','recertificacion_acceso','renovacion_contrato','solicitud_baja_activo','tecnico_ausencias','tecnico_recordatorios','tecnico_turnos','ticket','ticket_aprobacion','ticket_incidente','ticket_solicitud'])
  LOOP
    EXECUTE format('SELECT setval(%L, 1, false)', r.secuencia);
  END LOOP;
END $$;

COMMIT;

-- 4. Verificación: todas las tablas operativas deben quedar en 0 ------------------
SELECT 'tablas vaciadas con datos' AS control,
       COUNT(*) FILTER (WHERE n > 0) AS resultado_debe_ser_0
  FROM (
    SELECT (xpath('/row/c/text()', query_to_xml(format('SELECT COUNT(*) AS c FROM public.%I', t), false, true, '')))[1]::text::int AS n
      FROM unnest(ARRAY['acta_entrega','activo','activo_historial','adjunto_ticket','api_credenciales_externas','api_log_auditoria','api_token_acceso','aprobacion_monto','articulo_conocimiento','articulo_conocimiento_feedback','articulo_conocimiento_historial','articulo_conocimiento_version','articulo_conocimiento_vinculo_ticket','bloqueo_edicion_concurrente','cab_reunion','cambio','cambio_aprobacion','cambio_enterado','cambio_excepcion','campana_inventario','campana_inventario_item','ci_relacion','cmdb_actualizacion','cmdb_inexactitud','cmdb_linea_base','colaborador_autorizacion','comentario_ticket','comprobante_proveedor','comprobante_proveedor_archivo','comprobante_proveedor_detalle','comprobante_proveedor_evento','contrato_ti','ecab_decision','elemento_configuracion','equipo_recurso_compartido','error_conocido','importacion_activos','incidente_mayor','informe_auditoria','informe_evidencia','licencia_asignacion','licencia_software','log_acceso','log_auditoria_sistema','mantenimiento_activo','notificaciones','problema','problema_analisis','problema_cierre_aprobacion','problema_incidente','problema_regla_umbral_ejecucion','recepcion_activo','recertificacion_acceso','renovacion_contrato','solicitud_baja_activo','tecnico_ausencias','tecnico_recordatorios','tecnico_turnos','ticket','ticket_aprobacion','ticket_incidente','ticket_solicitud']) AS t
  ) x
UNION ALL
SELECT 'tablas sin uso que siguen existiendo', COUNT(*)
  FROM pg_tables WHERE schemaname = 'public'
   AND tablename IN ('acuerdo_nivel_operativo','codigo_recuperacion','cola_correo','evento_servicio','preferencia_notificacion','problema_config_mayor','problema_config_reapertura','problema_criterio_mayor','problema_regla_asignacion','problema_regla_escalamiento','problema_tarea_catalogo','problema_tarea_paquete','problema_transicion','resiliencia_servicio','respuestas_predefinidas','ticket_lecturas','cliente')
UNION ALL
SELECT 'usuarios conservados', COUNT(*) FROM usuario
UNION ALL
SELECT 'opciones de menú conservadas', COUNT(*) FROM opciones_menu
UNION ALL
SELECT 'servicios del catálogo conservados', COUNT(*) FROM servicio_catalogo;
