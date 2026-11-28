-- ============================================================================
-- 10 · Incidentes mayores unificados, sin "incidente causado por cambio" y
--      sin creación automática de problemas
-- ----------------------------------------------------------------------------
-- 1) INCIDENTES MAYORES: un solo modelo para la bandeja, la declaración y la
--    sala de crisis.
--    · Estados ABIERTO → MITIGADO → CERRADO (el "ACTIVO" antiguo pasa a ABIERTO).
--    · Severidad P1 o P2 (CRITICA/ALTA → P1, MEDIA/BAJA → P2).
--    · Comunicados con el mismo formato {texto, fecha, usuario}.
--    · El ticket de origen queda marcado como incidente mayor.
-- 2) Se elimina ticket_incidente.causado_por_cambio_id (nunca se usó). Para
--    quitar la columna se vuelve a crear la vista vista_ticket sin ella.
-- 3) Las reglas de umbral solo DETECTAN candidatos: se eliminan las columnas de
--    creación automática y la tabla de ejecuciones.
--
-- Ejecutar en Supabase después de un respaldo. Es idempotente y corre en una
-- sola transacción: si algo falla, no se aplica nada.
-- ============================================================================
BEGIN;

-- 1. Incidentes mayores ----------------------------------------------------------
UPDATE incidente_mayor SET estado = 'ABIERTO'
 WHERE estado IS NULL OR UPPER(estado) NOT IN ('ABIERTO', 'MITIGADO', 'CERRADO');
UPDATE incidente_mayor SET estado = UPPER(estado) WHERE estado <> UPPER(estado);

UPDATE incidente_mayor
   SET severidad = CASE WHEN UPPER(COALESCE(severidad, '')) IN ('P2', 'MEDIA', 'BAJA') THEN 'P2' ELSE 'P1' END
 WHERE severidad IS NULL OR severidad NOT IN ('P1', 'P2');

-- Comunicados guardados como texto plano → {texto, fecha, usuario}
UPDATE incidente_mayor im
   SET comunicados = (
     SELECT COALESCE(jsonb_agg(
              CASE WHEN jsonb_typeof(c) = 'string'
                   THEN jsonb_build_object('texto', c #>> '{}', 'fecha', im.fecha_declaracion, 'usuario', NULL)
                   ELSE c END
              ORDER BY o), '[]'::jsonb)
       FROM jsonb_array_elements(COALESCE(im.comunicados, '[]'::jsonb)) WITH ORDINALITY AS e(c, o))
 WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(im.comunicados, '[]'::jsonb)) c
                WHERE jsonb_typeof(c) = 'string');

-- Autor guardado como id de usuario → nombre del usuario
UPDATE incidente_mayor im
   SET comunicados = (
     SELECT jsonb_agg(
              CASE WHEN jsonb_typeof(c -> 'usuario') = 'number'
                   THEN jsonb_set(c, '{usuario}', COALESCE(
                          (SELECT to_jsonb(TRIM(CONCAT(u.nombres, ' ', u.apellido_paterno)))
                             FROM usuario u WHERE u.id_usuario = (c ->> 'usuario')::int), 'null'::jsonb))
                   ELSE c END
              ORDER BY o)
       FROM jsonb_array_elements(im.comunicados) WITH ORDINALITY AS e(c, o))
 WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(im.comunicados, '[]'::jsonb)) c
                WHERE jsonb_typeof(c) = 'object' AND jsonb_typeof(c -> 'usuario') = 'number');

-- Incidentes de origen marcados como incidente mayor
INSERT INTO ticket_incidente (id_ticket, es_incidente_mayor)
SELECT DISTINCT im.id_ticket, true FROM incidente_mayor im
 WHERE im.id_ticket IS NOT NULL AND im.estado_registro = true
ON CONFLICT (id_ticket) DO UPDATE SET es_incidente_mayor = true;

ALTER TABLE incidente_mayor DROP CONSTRAINT IF EXISTS incidente_mayor_estado_check;
ALTER TABLE incidente_mayor ADD CONSTRAINT incidente_mayor_estado_check
  CHECK (estado IN ('ABIERTO', 'MITIGADO', 'CERRADO'));
ALTER TABLE incidente_mayor DROP CONSTRAINT IF EXISTS incidente_mayor_severidad_check;
ALTER TABLE incidente_mayor ADD CONSTRAINT incidente_mayor_severidad_check
  CHECK (severidad IN ('P1', 'P2'));

-- 2. Sin "incidente causado por cambio" -------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name = 'ticket_incidente' AND column_name = 'causado_por_cambio_id') THEN
    DROP VIEW IF EXISTS vista_ticket;
    ALTER TABLE ticket_incidente DROP COLUMN causado_por_cambio_id;
  END IF;
END $$;

DROP VIEW IF EXISTS vista_ticket;
CREATE VIEW vista_ticket AS
SELECT t.id_ticket,
    t.codigo_ticket,
    t.titulo,
    t.descripcion,
    t.id_tipo_ticket,
    t.id_categoria,
    t.id_impacto,
    t.id_urgencia,
    t.id_prioridad,
    t.id_estado,
    t.id_motivo_espera,
    t.id_usuario_solicitante,
    t.id_usuario_asignado,
    t.solucion_aplicada,
    t.motivo_cancelacion,
    t.fecha_limite_sla,
    t.fecha_primera_respuesta,
    t.fecha_resolucion,
    t.fecha_cierre,
    t.sla_cumplido,
    t.usuario_creacion,
    t.fecha_creacion,
    t.usuario_modificacion,
    t.fecha_modificacion,
    t.estado_registro,
    t.id_servicio,
    t.id_departamento,
    t.canal_comunicacion,
    t.categoria_resolucion,
    t.calificacion_csat,
    t.comentario_csat,
    t.fecha_csat,
    t.tiempo_pausado_minutos,
    t.fecha_ultima_pausa,
    t.campos_adicionales,
    t.id_ci,
    t.fecha_reapertura,
    t.motivo_reapertura,
    t.conteo_reaperturas,
    t.id_departamento_empresa,
    t.fecha_limite_respuesta_sla,
    ti.id_problema,
    COALESCE(ti.es_incidente_mayor, false) AS es_incidente_mayor,
    COALESCE(ts.estado_aprobacion, 'NO_APLICA'::character varying) AS estado_aprobacion,
    ts.id_paso_actual
   FROM ((ticket t
     LEFT JOIN ticket_incidente ti ON ((ti.id_ticket = t.id_ticket)))
     LEFT JOIN ticket_solicitud ts ON ((ts.id_ticket = t.id_ticket)));

-- 3. Reglas de detección de candidatos (sin creación automática) -------------------
DROP TABLE IF EXISTS problema_regla_umbral_ejecucion;
ALTER TABLE problema_regla_umbral
  DROP COLUMN IF EXISTS accion,
  DROP COLUMN IF EXISTS id_plantilla,
  DROP COLUMN IF EXISTS prioridad_problema,
  DROP COLUMN IF EXISTS id_departamento_destino,
  DROP COLUMN IF EXISTS vincular_incidentes,
  DROP COLUMN IF EXISTS evitar_duplicados,
  DROP COLUMN IF EXISTS enfriamiento_horas,
  DROP COLUMN IF EXISTS notificar_destinatarios,
  DROP COLUMN IF EXISTS notificar_plantilla,
  DROP COLUMN IF EXISTS ultima_ejecucion,
  DROP COLUMN IF EXISTS problemas_generados;

-- Agrupaciones que el sistema no procesa → servicio; "codigo_resolucion" → "resolucion"
UPDATE problema_regla_umbral SET agrupar_por = 'resolucion' WHERE agrupar_por = 'codigo_resolucion';
UPDATE problema_regla_umbral SET agrupar_por = 'servicio'
 WHERE agrupar_por NOT IN ('servicio', 'categoria', 'ci', 'resolucion');

-- Textos de las reglas de fábrica que hablaban de "generar" problemas
UPDATE problema_regla_umbral
   SET nombre = 'Incidente crítico (P1) en un servicio',
       descripcion = 'Todo incidente P1 se propone para investigar su causa raíz.'
 WHERE nombre = 'Incidente mayor registrado (P1)';
UPDATE problema_regla_umbral
   SET nombre = '5 incidentes del mismo CI en 7 días',
       descripcion = 'Fallas recurrentes de un mismo componente de infraestructura.'
 WHERE nombre = '5 incidentes de la misma categoría y CI en 7 días';

COMMIT;

-- Verificación -------------------------------------------------------------------------
SELECT estado, severidad, COUNT(*) AS incidentes_mayores FROM incidente_mayor GROUP BY 1, 2 ORDER BY 1, 2;
SELECT COUNT(*) AS columna_causado_por_cambio
  FROM information_schema.columns WHERE table_name = 'ticket_incidente' AND column_name = 'causado_por_cambio_id';
SELECT id_regla, nombre, agrupar_por, umbral_incidentes, ventana_horas, prioridad_minima, activa
  FROM problema_regla_umbral ORDER BY orden;
