-- ============================================================================
-- CARGA DEL CICLO DE VIDA DE LOS ACTIVOS · ejecutar UNA sola vez
-- ----------------------------------------------------------------------------
-- REQUISITOS: carga_ecosistema_activos.sql, carga_conocimiento_tickets.sql y
-- db/12_ciclo_vida_activos.sql.
--
-- 1. Recepciones: una por cada compra (mes y proveedor) con el detalle de los
--    equipos recibidos; las de equipos pedidos por una solicitud quedan
--    enlazadas a ella.
-- 2. Actas de entrega: cada activo asignado tiene su acta aceptada en la fecha
--    real de asignación (los equipos de "Asignación de equipo de trabajo", en
--    la fecha en que se resolvió la solicitud).
-- 3. Préstamo: los usuarios con su equipo en reparación reciben una laptop del
--    stock; esa acta queda PENDIENTE para que la acepten en "Mis activos".
-- 4. Bajas: los equipos de la generación anterior (laptops 2021 y switches
--    2019), retirados al renovar la flota:
--      · aprobadas por el Aprobador (valen 2 000 o más) o por el Gestor de
--        Activos (menos de 2 000), con su disposición final;
--      · una rechazada (el equipo aún se puede reparar);
--      · dos pendientes: una para el Aprobador y otra para el Gestor de Activos.
--
-- Umbral de aprobación por monto: 2 000 (UMBRAL_MONTO_APROBACION de la app).
-- Reglas: solo corre si no hay actas, bajas ni recepciones; todo va en UN
-- bloque; al final valida que todo cuadre y, si no, se revierte completo.
-- Haga un respaldo antes de ejecutarlo en producción.
-- ============================================================================
DO $$
DECLARE
  v_ahora        TIMESTAMPTZ := now();
  v_umbral       NUMERIC := 2000;
  v_gestor       INTEGER;   -- Gestor de Activos (o Administrador)
  v_aprobador    INTEGER;   -- Aprobador
  v_tec_campo    INTEGER;
  v_tec_redes    INTEGER;
  v_dep_campo    INTEGER;
  v_dep_redes    INTEGER;
  v_prov_hw      INTEGER;
  v_prov_red     INTEGER;
  v_prov_imp     INTEGER;
  v_id           INTEGER;
  v_sol          INTEGER;
  v_t            TIMESTAMPTZ;
  r              RECORD;
  v_n            INTEGER := 0;
  v_problemas    TEXT := '';
BEGIN
  PERFORM setseed(0.2718);

  -- ------------------------------------------------------------------------
  -- Protecciones
  -- ------------------------------------------------------------------------
  IF EXISTS (SELECT 1 FROM acta_entrega) OR EXISTS (SELECT 1 FROM solicitud_baja_activo)
     OR EXISTS (SELECT 1 FROM recepcion_activo) OR EXISTS (SELECT 1 FROM aprobacion_monto) THEN
    RAISE EXCEPTION 'Ya hay actas, bajas, recepciones o aprobaciones por monto. Esta carga solo corre sobre tablas vacías.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM activo WHERE tipo_activo = 'LAPTOP' AND estado_activo = 'EN_STOCK')
     OR NOT EXISTS (SELECT 1 FROM ticket WHERE titulo = 'Asignación de equipo de trabajo') THEN
    RAISE EXCEPTION 'Primero ejecute carga_ecosistema_activos.sql y carga_conocimiento_tickets.sql.';
  END IF;
  IF EXISTS (SELECT 1 FROM activo WHERE codigo_patrimonial LIKE 'HDW-%-A0%') THEN
    RAISE EXCEPTION 'Los equipos de la generación anterior ya están registrados.';
  END IF;

  -- ------------------------------------------------------------------------
  -- Personas, grupos y proveedores
  -- ------------------------------------------------------------------------
  SELECT MIN(up.id_usuario) INTO v_gestor FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil = 9 AND up.estado_registro AND u.estado_registro;
  IF v_gestor IS NULL THEN
    SELECT MIN(up.id_usuario) INTO v_gestor FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
     WHERE up.id_perfil = 1 AND up.estado_registro AND u.estado_registro;
  END IF;
  SELECT MIN(up.id_usuario) INTO v_aprobador FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil = 7 AND up.estado_registro AND u.estado_registro AND up.id_usuario <> v_gestor;
  IF v_aprobador IS NULL THEN
    SELECT MIN(up.id_usuario) INTO v_aprobador FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
     WHERE up.id_perfil IN (7, 1) AND up.estado_registro AND u.estado_registro;
  END IF;

  SELECT id_departamento INTO v_dep_campo FROM departamento_ti WHERE codigo = 'DEP-N2-CAMPO';
  SELECT id_departamento INTO v_dep_redes FROM departamento_ti WHERE codigo = 'DEP-REDES';
  SELECT MIN(td.id_usuario) INTO v_tec_campo FROM tecnico_detalle td JOIN usuario u USING (id_usuario)
   WHERE td.id_departamento = v_dep_campo AND td.estado_registro AND u.estado_registro
     AND td.id_usuario NOT IN (v_gestor, v_aprobador);
  SELECT MIN(td.id_usuario) INTO v_tec_redes FROM tecnico_detalle td JOIN usuario u USING (id_usuario)
   WHERE td.id_departamento = v_dep_redes AND td.estado_registro AND u.estado_registro
     AND td.id_usuario NOT IN (v_gestor, v_aprobador);
  SELECT id_proveedor INTO v_prov_hw  FROM proveedor_ti WHERE codigo_proveedor = 'PRV-HW';
  SELECT id_proveedor INTO v_prov_red FROM proveedor_ti WHERE codigo_proveedor = 'PRV-RED';
  SELECT id_proveedor INTO v_prov_imp FROM proveedor_ti WHERE codigo_proveedor = 'PRV-IMP';

  IF v_gestor IS NULL OR v_aprobador IS NULL OR v_tec_campo IS NULL OR v_tec_redes IS NULL
     OR v_prov_hw IS NULL OR v_prov_red IS NULL THEN
    RAISE EXCEPTION 'Faltan el Gestor de Activos/Administrador, un Aprobador, técnicos de Soporte en sitio o Redes, o los proveedores PRV-HW/PRV-RED.';
  END IF;

  -- ========================================================================
  -- 1. EQUIPOS DE LA GENERACIÓN ANTERIOR (retirados al renovar la flota)
  --    Cada laptop antigua fue de quien recibió una laptop nueva en la
  --    renovación de 2023-2024; se devolvió ese día y luego se dio de baja.
  -- ========================================================================
  CREATE TEMP TABLE _old (
    n INTEGER, codigo TEXT, tipo TEXT, marca TEXT, modelo TEXT, costo NUMERIC, adquirido DATE,
    custodio INTEGER, departamento INTEGER, devuelto TIMESTAMPTZ, destino TEXT, id_activo INTEGER
  ) ON COMMIT DROP;

  INSERT INTO _old (n, codigo, tipo, marca, modelo, costo, adquirido, custodio, departamento, devuelto, destino)
  SELECT row_number() OVER (ORDER BY h.fecha) AS n,
         'HDW-LAP-A00' || row_number() OVER (ORDER BY h.fecha), 'LAPTOP', 'Dell', 'Latitude 5420', 4200, DATE '2021-03-15',
         a.id_usuario_custodio, v_dep_campo, date_trunc('day', h.fecha) + INTERVAL '16 hours', NULL
    FROM (SELECT DISTINCT ON (a.id_usuario_custodio) a.id_activo, a.id_usuario_custodio
            FROM activo a
           WHERE a.tipo_activo = 'LAPTOP' AND a.id_usuario_custodio IS NOT NULL
             AND a.fecha_adquisicion < DATE '2024-02-01'
           ORDER BY a.id_usuario_custodio, a.fecha_adquisicion) a
    JOIN LATERAL (SELECT MIN(fecha) AS fecha FROM activo_historial x
                   WHERE x.id_activo = a.id_activo AND x.custodio_nuevo IS NOT NULL) h ON h.fecha IS NOT NULL
   ORDER BY h.fecha
   LIMIT 4;

  IF (SELECT COUNT(*) FROM _old) < 4 THEN
    RAISE EXCEPTION 'No se encontraron 4 laptops de la renovación de 2023-2024 para enlazar los equipos antiguos.';
  END IF;

  -- Dos switches de acceso antiguos: uno retirado y otro guardado como repuesto
  INSERT INTO _old (n, codigo, tipo, marca, modelo, costo, adquirido, custodio, departamento, devuelto, destino) VALUES
    (5, 'HDW-SWI-A001', 'SWITCH', 'Cisco', 'Catalyst 2960-X 24 puertos', 850, DATE '2019-05-20', NULL, v_dep_redes,
        (SELECT MIN(fecha_adquisicion) FROM activo WHERE tipo_activo = 'SWITCH')::timestamp AT TIME ZONE 'America/Lima' + INTERVAL '10 hours', NULL),
    (6, 'HDW-SWI-A002', 'SWITCH', 'Cisco', 'Catalyst 2960-X 24 puertos', 850, DATE '2019-05-20', NULL, v_dep_redes,
        (SELECT MIN(fecha_adquisicion) FROM activo WHERE tipo_activo = 'SWITCH')::timestamp AT TIME ZONE 'America/Lima' + INTERVAL '10 hours', NULL);

  UPDATE _old SET destino = CASE n WHEN 1 THEN 'DONACION' WHEN 2 THEN 'RECICLAJE' WHEN 3 THEN 'REVENTA' WHEN 5 THEN 'RECICLAJE' END;

  FOR r IN SELECT * FROM _old ORDER BY n LOOP
    INSERT INTO activo (codigo_patrimonial, numero_serie, tipo_activo, marca, modelo, id_departamento, id_usuario_custodio,
                        estado_activo, fecha_adquisicion, fecha_fin_garantia, costo_compra, usuario_creacion, fecha_creacion,
                        atributos, vida_util_meses, valor_residual)
    VALUES (r.codigo, CASE WHEN r.tipo = 'LAPTOP' THEN 'DL5420-' ELSE 'FOC19' END || lpad((1000 + r.n * 37)::text, 6, '0'),
            r.tipo, r.marca, r.modelo, r.departamento, NULL, 'EN_STOCK', r.adquirido, r.adquirido + INTERVAL '3 years',
            r.costo, v_gestor, (r.adquirido + TIME '09:00') AT TIME ZONE 'America/Lima',
            jsonb_build_object('generacion', 'anterior'), CASE WHEN r.tipo = 'LAPTOP' THEN 36 ELSE 60 END, 0)
    RETURNING id_activo INTO v_id;
    UPDATE _old SET id_activo = v_id WHERE n = r.n;

    -- Historia: alta → (asignada) → devuelta al stock en la renovación
    INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
    VALUES (v_id, NULL, 'EN_STOCK', NULL, NULL, 'Alta inicial de activo en el sistema', v_gestor, (r.adquirido + TIME '09:00') AT TIME ZONE 'America/Lima');
    IF r.custodio IS NOT NULL THEN
      INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
      VALUES (v_id, 'EN_STOCK', 'EN_OPERACION', NULL, r.custodio, 'Asignación de equipo de trabajo', v_gestor,
              ((r.adquirido + 5) + TIME '10:00') AT TIME ZONE 'America/Lima');
      INSERT INTO acta_entrega (id_activo, id_usuario, tipo, estado, observaciones, creado_en, aceptado_en)
      VALUES (v_id, r.custodio, 'ENTREGA', 'ACEPTADA', 'Entrega de equipo de trabajo',
              ((r.adquirido + 5) + TIME '10:00') AT TIME ZONE 'America/Lima', ((r.adquirido + 6) + TIME '09:30') AT TIME ZONE 'America/Lima');
      INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
      VALUES (v_id, 'EN_OPERACION', 'EN_STOCK', r.custodio, NULL, 'Devolución por renovación: el usuario recibió un equipo nuevo', v_gestor, r.devuelto - INTERVAL '1 hour');
    ELSE
      INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
      VALUES (v_id, 'EN_STOCK', 'EN_OPERACION', NULL, NULL, 'Instalado en el gabinete de comunicaciones', v_tec_redes,
              ((r.adquirido + 7) + TIME '10:00') AT TIME ZONE 'America/Lima');
      INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
      VALUES (v_id, 'EN_OPERACION', 'EN_STOCK', NULL, NULL, 'Retirado al instalar los switches nuevos', v_tec_redes, r.devuelto);
    END IF;
    UPDATE activo SET fecha_modificacion = r.devuelto, usuario_modificacion = v_gestor WHERE id_activo = v_id;
  END LOOP;

  -- ========================================================================
  -- 2. BAJAS
  -- ========================================================================
  -- 2.1 Aprobadas con disposición final: laptops 1-3 (Aprobador) y switch 5 (Gestor de Activos)
  FOR r IN SELECT * FROM _old WHERE n IN (1, 2, 3, 5) ORDER BY n LOOP
    v_t := r.devuelto + INTERVAL '12 days';
    INSERT INTO solicitud_baja_activo (id_activo, motivo, estado, id_usuario_solicita, id_usuario_resuelve, comentario_resolucion,
                                       fecha_solicitud, fecha_resolucion, destino_final, borrado_seguro, acta, fecha_disposicion)
    VALUES (r.id_activo,
            CASE WHEN r.tipo = 'LAPTOP'
                 THEN 'Equipo devuelto en la renovación de la flota: garantía vencida, batería agotada y sin soporte del fabricante.'
                 ELSE 'Switch retirado al instalar los nuevos: sin actualizaciones de seguridad del fabricante.' END,
            'APROBADA',
            CASE WHEN r.tipo = 'LAPTOP' THEN v_tec_campo ELSE v_tec_redes END,
            CASE WHEN r.costo >= v_umbral THEN v_aprobador ELSE v_gestor END,
            CASE WHEN r.costo >= v_umbral THEN 'Aprobado: equipo depreciado y reemplazado.' ELSE 'Aprobado: equipo obsoleto.' END,
            v_t, v_t + INTERVAL '3 days',
            r.destino, CASE WHEN r.tipo = 'LAPTOP' THEN true ELSE NULL END,
            CASE r.destino
              WHEN 'DONACION' THEN 'Donado a la institución educativa del distrito con acta de donación firmada. Disco borrado con sobrescritura de 3 pasadas.'
              WHEN 'REVENTA' THEN 'Vendido como equipo usado a un proveedor autorizado; disco borrado y certificado de borrado archivado.'
              ELSE 'Entregado a un gestor autorizado de residuos electrónicos con certificado de disposición.' END,
            v_t + INTERVAL '25 days')
    RETURNING id_solicitud INTO v_sol;

    IF r.costo >= v_umbral THEN
      INSERT INTO aprobacion_monto (tipo, id_referencia, monto, decision, comentario, id_aprobador, fecha_decision)
      VALUES ('BAJA', v_sol, r.costo, 'APROBADO', 'Aprobado: equipo depreciado y reemplazado.', v_aprobador, v_t + INTERVAL '3 days');
    END IF;

    UPDATE activo SET estado_activo = 'BAJA', motivo_inactivacion = (SELECT motivo FROM solicitud_baja_activo WHERE id_solicitud = v_sol),
                      fecha_inactivacion = v_t + INTERVAL '3 days',
                      usuario_inactivacion = CASE WHEN r.costo >= v_umbral THEN v_aprobador ELSE v_gestor END,
                      fecha_modificacion = v_t + INTERVAL '3 days'
     WHERE id_activo = r.id_activo;
    INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
    VALUES (r.id_activo, 'EN_STOCK', 'BAJA', NULL, NULL, 'Baja aprobada: ' || left((SELECT motivo FROM solicitud_baja_activo WHERE id_solicitud = v_sol), 300),
            CASE WHEN r.costo >= v_umbral THEN v_aprobador ELSE v_gestor END, v_t + INTERVAL '3 days');
  END LOOP;

  -- 2.2 Rechazada: la laptop antigua 4 aún sirve como equipo de préstamo
  SELECT * INTO r FROM _old WHERE n = 4;
  v_t := r.devuelto + INTERVAL '10 days';
  INSERT INTO solicitud_baja_activo (id_activo, motivo, estado, id_usuario_solicita, id_usuario_resuelve, comentario_resolucion,
                                     fecha_solicitud, fecha_resolucion)
  VALUES (r.id_activo, 'Equipo devuelto en la renovación de la flota; se propone darlo de baja.', 'RECHAZADA',
          v_tec_campo, v_aprobador, 'Rechazado: funciona bien. Se conserva en stock como equipo de préstamo para viajes.',
          v_t, v_t + INTERVAL '2 days')
  RETURNING id_solicitud INTO v_sol;
  INSERT INTO aprobacion_monto (tipo, id_referencia, monto, decision, comentario, id_aprobador, fecha_decision)
  VALUES ('BAJA', v_sol, r.costo, 'RECHAZADO', 'Rechazado: funciona bien. Se conserva en stock como equipo de préstamo para viajes.', v_aprobador, v_t + INTERVAL '2 days');

  -- 2.3 Pendiente del Aprobador: una laptop en uso con la garantía vencida y daño físico
  v_id := NULL;
  SELECT a.id_activo INTO v_id FROM activo a
   WHERE a.tipo_activo = 'LAPTOP' AND a.estado_activo = 'EN_OPERACION' AND a.fecha_fin_garantia < CURRENT_DATE
     AND NOT EXISTS (SELECT 1 FROM solicitud_baja_activo s WHERE s.id_activo = a.id_activo)
   ORDER BY a.fecha_fin_garantia LIMIT 1;
  IF v_id IS NOT NULL THEN
    INSERT INTO solicitud_baja_activo (id_activo, motivo, estado, id_usuario_solicita, fecha_solicitud)
    VALUES (v_id, 'Bisagra rota y batería hinchada; la garantía venció y la reparación cuesta más de la mitad de un equipo nuevo.',
            'PENDIENTE', v_tec_campo, v_ahora - INTERVAL '3 days');
  END IF;

  -- 2.4 Pendiente del Gestor de Activos: el switch antiguo de repuesto (menos de 2 000)
  INSERT INTO solicitud_baja_activo (id_activo, motivo, estado, id_usuario_solicita, fecha_solicitud)
  SELECT id_activo, 'Switch de repuesto con 6 puertos dañados por una descarga eléctrica; ya no es útil como respaldo.',
         'PENDIENTE', v_tec_redes, v_ahora - INTERVAL '1 day'
    FROM _old WHERE n = 6;

  -- ========================================================================
  -- 3. ACTAS DE ENTREGA DE LOS ACTIVOS ASIGNADOS HOY
  -- ========================================================================
  INSERT INTO acta_entrega (id_activo, id_usuario, tipo, estado, observaciones, creado_en, aceptado_en)
  SELECT a.id_activo, a.id_usuario_custodio, 'ENTREGA', 'ACEPTADA',
         CASE WHEN t.codigo_ticket IS NOT NULL THEN 'Entrega por la solicitud ' || t.codigo_ticket ELSE 'Entrega de equipo de trabajo' END,
         COALESCE(t.fecha_resolucion, h.fecha, (a.fecha_adquisicion + TIME '10:00') AT TIME ZONE 'America/Lima'),
         LEAST(COALESCE(t.fecha_resolucion, h.fecha, (a.fecha_adquisicion + TIME '10:00') AT TIME ZONE 'America/Lima') + INTERVAL '20 hours',
               v_ahora - INTERVAL '1 hour')
    FROM activo a
    LEFT JOIN LATERAL (SELECT MAX(x.fecha) AS fecha FROM activo_historial x
                        WHERE x.id_activo = a.id_activo AND x.custodio_nuevo = a.id_usuario_custodio) h ON true
    LEFT JOIN LATERAL (SELECT tk.codigo_ticket, tk.fecha_resolucion FROM ticket tk
                        WHERE tk.campos_adicionales ->> 'activo_afectado' = a.codigo_patrimonial
                          AND tk.titulo = 'Asignación de equipo de trabajo' AND tk.fecha_resolucion IS NOT NULL
                        ORDER BY tk.fecha_resolucion DESC LIMIT 1) t ON true
   WHERE a.id_usuario_custodio IS NOT NULL AND a.estado_registro;

  -- ========================================================================
  -- 4. PRÉSTAMO: laptop de reemplazo para quien tiene su equipo en reparación
  --    (acta PENDIENTE: la aceptan en "Mis activos")
  -- ========================================================================
  FOR r IN
    SELECT m.id_usuario_custodio AS usuario, m.codigo_patrimonial AS en_reparacion
      FROM activo m
     WHERE m.estado_activo = 'MANTENIMIENTO' AND m.id_usuario_custodio IS NOT NULL
     ORDER BY m.id_activo
  LOOP
    -- La laptop libre se busca en cada vuelta: la anterior ya quedó prestada
    v_id := NULL;
    SELECT s.id_activo INTO v_id FROM activo s
     WHERE s.tipo_activo = 'LAPTOP' AND s.estado_activo = 'EN_STOCK' AND s.id_usuario_custodio IS NULL
       AND s.codigo_patrimonial NOT LIKE 'HDW-%-A0%'
     ORDER BY s.fecha_adquisicion DESC, s.id_activo LIMIT 1;
    CONTINUE WHEN v_id IS NULL;
    v_t := v_ahora - INTERVAL '2 days';
    UPDATE activo SET id_usuario_custodio = r.usuario, estado_activo = 'EN_OPERACION',
                      fecha_modificacion = v_t, usuario_modificacion = v_gestor
     WHERE id_activo = v_id;
    INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
    VALUES (v_id, 'EN_STOCK', 'EN_OPERACION', NULL, r.usuario,
            'Préstamo mientras su equipo ' || r.en_reparacion || ' está en reparación', v_gestor, v_t);
    INSERT INTO acta_entrega (id_activo, id_usuario, tipo, estado, observaciones, creado_en)
    VALUES (v_id, r.usuario, 'ENTREGA', 'PENDIENTE',
            'Equipo de préstamo mientras ' || r.en_reparacion || ' está en reparación. Devolver al recibir su equipo.', v_t);
    v_n := v_n + 1;
  END LOOP;

  -- ========================================================================
  -- 5. RECEPCIONES: una por compra (mes y proveedor)
  -- ========================================================================
  INSERT INTO recepcion_activo (codigo, id_proveedor, documento, id_solicitud_origen, fecha_recepcion, total_items,
                                estado, id_usuario, detalle, fecha_creacion)
  SELECT 'REC-' || to_char(g.fecha, 'YYYY') || '-' || lpad(row_number() OVER (PARTITION BY to_char(g.fecha, 'YYYY') ORDER BY g.fecha, g.proveedor)::text, 3, '0'),
         g.proveedor,
         'Guía de remisión EG01-' || lpad((1200 + row_number() OVER (ORDER BY g.fecha, g.proveedor))::text, 6, '0'),
         g.solicitud, g.fecha, g.total, 'RECIBIDO', v_gestor,
         jsonb_build_object('items', g.items),
         (g.fecha + TIME '11:00') AT TIME ZONE 'America/Lima'
    FROM (SELECT date_trunc('month', a.fecha_adquisicion)::date AS mes,
                 MIN(a.fecha_adquisicion) AS fecha,
                 CASE WHEN a.tipo_activo = 'SWITCH' THEN v_prov_red
                      WHEN a.tipo_activo = 'IMPRESORA' THEN COALESCE(v_prov_imp, v_prov_hw)
                      ELSE v_prov_hw END AS proveedor,
                 COUNT(*) AS total,
                 MIN(tk.id_ticket) AS solicitud,
                 jsonb_agg(jsonb_build_object('codigo_patrimonial', a.codigo_patrimonial, 'tipo_activo', a.tipo_activo,
                                              'marca', a.marca, 'modelo', a.modelo, 'numero_serie', a.numero_serie,
                                              'costo_compra', a.costo_compra) ORDER BY a.codigo_patrimonial) AS items
            FROM activo a
            LEFT JOIN ticket tk ON tk.titulo = 'Asignación de equipo de trabajo'
                               AND tk.campos_adicionales ->> 'activo_afectado' = a.codigo_patrimonial
           WHERE a.estado_registro AND a.fecha_adquisicion IS NOT NULL
           GROUP BY 1, 3) g;

  -- ========================================================================
  -- 6. VALIDACIÓN FINAL: si algo no cuadra, se revierte todo
  -- ========================================================================
  IF EXISTS (SELECT 1 FROM activo a WHERE a.id_usuario_custodio IS NOT NULL AND a.estado_registro
               AND NOT EXISTS (SELECT 1 FROM acta_entrega ae WHERE ae.id_activo = a.id_activo
                                AND ae.id_usuario = a.id_usuario_custodio AND ae.estado IN ('ACEPTADA', 'PENDIENTE'))) THEN
    v_problemas := v_problemas || ' · activos asignados sin acta de su custodio';
  END IF;
  IF EXISTS (SELECT 1 FROM acta_entrega ae JOIN activo a USING (id_activo)
              WHERE ae.estado = 'PENDIENTE' AND ae.id_usuario IS DISTINCT FROM a.id_usuario_custodio)
     OR EXISTS (SELECT id_activo FROM acta_entrega WHERE estado = 'PENDIENTE' GROUP BY id_activo HAVING COUNT(*) > 1) THEN
    v_problemas := v_problemas || ' · actas pendientes que no son del custodio actual';
  END IF;
  IF EXISTS (SELECT 1 FROM acta_entrega WHERE creado_en > v_ahora OR aceptado_en > v_ahora OR aceptado_en < creado_en) THEN
    v_problemas := v_problemas || ' · fechas de actas fuera de orden';
  END IF;
  IF v_n = 0 OR (SELECT COUNT(*) FROM acta_entrega WHERE estado = 'PENDIENTE') <> v_n THEN
    v_problemas := v_problemas || ' · no quedaron actas pendientes de los préstamos';
  END IF;
  IF EXISTS (SELECT 1 FROM activo a WHERE a.estado_activo = 'BAJA'
               AND NOT EXISTS (SELECT 1 FROM solicitud_baja_activo s WHERE s.id_activo = a.id_activo AND s.estado = 'APROBADA')) THEN
    v_problemas := v_problemas || ' · activos en BAJA sin solicitud aprobada';
  END IF;
  IF EXISTS (SELECT 1 FROM solicitud_baja_activo s JOIN activo a USING (id_activo)
              WHERE s.estado IN ('APROBADA', 'RECHAZADA') AND COALESCE(a.costo_compra, 0) >= v_umbral
                AND NOT EXISTS (SELECT 1 FROM aprobacion_monto m WHERE m.tipo = 'BAJA' AND m.id_referencia = s.id_solicitud)) THEN
    v_problemas := v_problemas || ' · bajas de 2 000 o más resueltas sin decisión del Aprobador';
  END IF;
  IF EXISTS (SELECT 1 FROM solicitud_baja_activo WHERE id_usuario_resuelve = id_usuario_solicita) THEN
    v_problemas := v_problemas || ' · bajas resueltas por quien las solicitó';
  END IF;
  IF (SELECT COUNT(*) FROM solicitud_baja_activo WHERE estado = 'PENDIENTE') < 1 THEN
    v_problemas := v_problemas || ' · no quedaron bajas pendientes';
  END IF;
  IF EXISTS (SELECT 1 FROM activo a WHERE a.estado_registro AND a.fecha_adquisicion IS NOT NULL
               AND NOT EXISTS (SELECT 1 FROM recepcion_activo rc, jsonb_array_elements(rc.detalle -> 'items') i
                                WHERE i ->> 'codigo_patrimonial' = a.codigo_patrimonial)) THEN
    v_problemas := v_problemas || ' · activos sin recepción';
  END IF;

  IF v_problemas <> '' THEN
    RAISE EXCEPTION 'La carga no cuadra y se revirtió:%', v_problemas;
  END IF;

  RAISE NOTICE 'Carga completa: % actas (% pendientes), % solicitudes de baja, % recepciones, % equipos de la generación anterior.',
    (SELECT COUNT(*) FROM acta_entrega), v_n, (SELECT COUNT(*) FROM solicitud_baja_activo),
    (SELECT COUNT(*) FROM recepcion_activo), (SELECT COUNT(*) FROM _old);
END $$;

-- Resumen ----------------------------------------------------------------------
SELECT 'acta ' || estado AS registro, COUNT(*) AS cantidad FROM acta_entrega GROUP BY estado
UNION ALL
SELECT 'baja ' || s.estado || CASE WHEN COALESCE(a.costo_compra, 0) >= 2000 THEN ' (Aprobador)' ELSE ' (Gestor de Activos)' END, COUNT(*)
  FROM solicitud_baja_activo s JOIN activo a USING (id_activo) GROUP BY 1
UNION ALL
SELECT 'recepciones', COUNT(*) FROM recepcion_activo
ORDER BY 1;
