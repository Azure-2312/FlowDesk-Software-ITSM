-- ============================================================================
-- DIAGNÓSTICO DEL ESTADO DE LA BASE DE DATOS · PARTE 2 (solo lectura)
-- ----------------------------------------------------------------------------
-- Cómo usarlo: Supabase → SQL Editor → pegar todo → Run → botón "Export" →
-- "Download CSV". Guardar el archivo como docs/auditoria/estado_bd_2.csv
-- Devuelve las tablas desde la número 101 en orden alfabético.
--
-- No modifica nada (solo SELECT) y no devuelve datos personales: por cada
-- tabla entrega cuántas filas tiene, su tamaño, sus columnas, de qué tablas
-- depende y cuántas tablas dependen de ella.
-- ============================================================================
WITH tablas AS (
  SELECT c.oid, c.relname AS tabla
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
),
conteo AS (
  SELECT t.tabla,
         (xpath('/row/c/text()',
                query_to_xml(format('SELECT COUNT(*) AS c FROM public.%I', t.tabla), false, true, '')))[1]::text::bigint AS filas
    FROM tablas t
),
columnas AS (
  SELECT table_name AS tabla, COUNT(*) AS num_columnas,
         string_agg(column_name, ', ' ORDER BY ordinal_position) AS lista_columnas
    FROM information_schema.columns
   WHERE table_schema = 'public'
   GROUP BY table_name
),
depende_de AS (
  SELECT conrelid AS oid, string_agg(DISTINCT confrelid::regclass::text, ', ') AS depende_de
    FROM pg_constraint WHERE contype = 'f' GROUP BY conrelid
),
referenciada_por AS (
  SELECT confrelid AS oid, COUNT(DISTINCT conrelid) AS tablas_que_la_usan
    FROM pg_constraint WHERE contype = 'f' GROUP BY confrelid
)
SELECT t.tabla,
       co.filas,
       pg_size_pretty(pg_total_relation_size(t.oid)) AS tamano,
       s.n_tup_ins AS inserciones,
       s.n_tup_upd AS actualizaciones,
       s.n_tup_del AS borrados,
       cl.num_columnas,
       COALESCE(r.tablas_que_la_usan, 0) AS tablas_que_la_usan,
       d.depende_de,
       cl.lista_columnas
  FROM tablas t
  JOIN conteo co ON co.tabla = t.tabla
  LEFT JOIN columnas cl ON cl.tabla = t.tabla
  LEFT JOIN depende_de d ON d.oid = t.oid
  LEFT JOIN referenciada_por r ON r.oid = t.oid
  LEFT JOIN pg_stat_user_tables s ON s.relid = t.oid
 ORDER BY t.tabla
OFFSET 100;
