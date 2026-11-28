-- ============================================================================
-- CARGA DE GESTIÓN DE PROBLEMAS · ejecutar UNA sola vez
-- ----------------------------------------------------------------------------
-- REQUISITOS (en este orden): correccion_catalogo_servicios.sql,
-- carga_ecosistema_activos.sql, carga_conocimiento_tickets.sql y
-- db/10_incidentes_mayores_y_limpieza.sql.
--
-- Los problemas nacen de los patrones repetidos que dejó la carga de tickets.
-- Las fechas salen de esos mismos incidentes y artículos, así que la historia
-- cuadra aunque la carga de tickets se haya hecho otro día. Cubre los seis
-- estados del ciclo de vida:
--
--   1. Wi-Fi del piso 3 ............ ERROR CONOCIDO (KEDB publicado; espera un
--                                     cambio de firmware)
--   2. Impresora del piso 2 ........ RESUELTO (rodillos reemplazados)
--   3. Caída del Host 02 ........... CERRADO (problema mayor: cierre aprobado,
--                                     con su incidente mayor IM- registrado)
--   4. ERP lento a fin de mes ...... CAUSA RAÍZ IDENTIFICADA (falta el cambio)
--   5. ERP "La sesión expiró" ...... EN INVESTIGACIÓN (análisis en curso)
--   6. Unidad compartida S: ........ REGISTRADO, sin responsable (por asignar)
--
-- Cada problema vincula sus incidentes (problema_incidente y
-- ticket_incidente.id_problema), su análisis de causa raíz y, cuando aplica,
-- su error conocido y el artículo de conocimiento que nació de él. Otros
-- patrones (por ejemplo "Outlook no recibe correos") quedan sin convertir:
-- aparecen en Candidatos para que el Gestor de Problemas decida.
--
-- Reglas: solo corre si no hay problemas ni errores conocidos; todo va en UN
-- bloque; al final valida que todo cuadre y, si no, se revierte completo.
-- Haga un respaldo antes de ejecutarlo en producción.
-- ============================================================================
DO $$
DECLARE
  v_ahora      TIMESTAMPTZ := now();
  v_creador    INTEGER;
  v_aprobador  INTEGER;
  v_dep_redes  INTEGER;
  v_dep_campo  INTEGER;
  v_dep_sist   INTEGER;
  v_p          INTEGER;
  v_tec        INTEGER;
  v_c          TIMESTAMPTZ;   -- creación del problema
  v_a          TIMESTAMPTZ;   -- análisis
  v_k          TIMESTAMPTZ;   -- publicación del error conocido
  v_m          TIMESTAMPTZ;   -- última modificación (estado actual)
  v_ini        TIMESTAMPTZ;
  v_fin        TIMESTAMPTZ;
  v_mayor_tk   INTEGER;
  v_mayor_ini  TIMESTAMPTZ;
  v_mayor_res  TIMESTAMPTZ;
  v_mayor_tec  INTEGER;
  v_ci         INTEGER;
  v_n          INTEGER;
  v_problemas  TEXT := '';
BEGIN
  -- ------------------------------------------------------------------------
  -- Protecciones
  -- ------------------------------------------------------------------------
  IF EXISTS (SELECT 1 FROM problema) OR EXISTS (SELECT 1 FROM error_conocido) THEN
    RAISE EXCEPTION 'Ya hay problemas o errores conocidos. Esta carga solo corre sobre tablas vacías.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM ticket WHERE titulo = 'Se corta el Wi-Fi en el piso 3')
     OR NOT EXISTS (SELECT 1 FROM ticket t JOIN ticket_incidente ti USING (id_ticket)
                     JOIN elemento_configuracion ci ON ci.id_ci = t.id_ci
                    WHERE ti.es_incidente_mayor AND ci.codigo_ci = 'CI-HOST-02') THEN
    RAISE EXCEPTION 'Primero ejecute carga_conocimiento_tickets.sql (faltan los incidentes que originan los problemas).';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'incidente_mayor_estado_check') THEN
    RAISE EXCEPTION 'Primero ejecute db/10_incidentes_mayores_y_limpieza.sql.';
  END IF;

  SELECT id_departamento INTO v_dep_redes FROM departamento_ti WHERE codigo = 'DEP-REDES' AND estado_registro;
  SELECT id_departamento INTO v_dep_campo FROM departamento_ti WHERE codigo = 'DEP-N2-CAMPO' AND estado_registro;
  SELECT id_departamento INTO v_dep_sist  FROM departamento_ti WHERE codigo = 'DEP-N3-SIST' AND estado_registro;
  IF v_dep_redes IS NULL OR v_dep_campo IS NULL OR v_dep_sist IS NULL THEN
    RAISE EXCEPTION 'Faltan los grupos resolutores DEP-REDES, DEP-N2-CAMPO o DEP-N3-SIST.';
  END IF;

  -- Quién registra los problemas: el Gestor de Problemas; si no hay, el
  -- Administrador. Quién aprueba el cierre de un problema mayor: el Aprobador.
  SELECT MIN(up.id_usuario) INTO v_creador FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil = 10 AND up.estado_registro AND u.estado_registro;
  IF v_creador IS NULL THEN
    SELECT MIN(up.id_usuario) INTO v_creador FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
     WHERE up.id_perfil = 1 AND up.estado_registro AND u.estado_registro;
  END IF;
  SELECT MIN(up.id_usuario) INTO v_aprobador FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil = 7 AND up.estado_registro AND u.estado_registro AND up.id_usuario <> v_creador;
  v_aprobador := COALESCE(v_aprobador, v_creador);

  -- Objetivos de tiempo por prioridad (solo si la tabla está vacía)
  INSERT INTO problema_objetivo_tiempo (id_prioridad, primera_respuesta_horas, diagnostico_horas, resolucion_total_horas, descripcion_operativa)
  SELECT p.id_prioridad, o.resp, o.diag, o.res, o.texto
    FROM (VALUES ('P1', 4, 72, 240, 'Problema crítico: diagnóstico en 3 días y solución en 10.'),
                 ('P2', 8, 120, 720, 'Problema alto: diagnóstico en 5 días y solución en 30.'),
                 ('P3', 24, 240, 1440, 'Problema medio: diagnóstico en 10 días y solución en 60.'),
                 ('P4', 48, 480, 2160, 'Problema bajo: diagnóstico en 20 días y solución en 90.')) o(cod, resp, diag, res, texto)
    JOIN prioridad_ticket p ON p.codigo = o.cod
   WHERE NOT EXISTS (SELECT 1 FROM problema_objetivo_tiempo);

  -- Reglas de detección de candidatos (solo si no hay ninguna). Solo proponen:
  -- el Gestor de Problemas decide si cada candidato se convierte en problema.
  INSERT INTO problema_regla_umbral (nombre, descripcion, orden, activa, prioridad_minima, agrupar_por, umbral_incidentes, ventana_horas)
  SELECT r.nombre, r.descripcion, r.orden, true, r.prio, r.agrupar, r.umbral, r.ventana
    FROM (VALUES ('5 incidentes del mismo CI en 7 días', 'Fallas recurrentes de un mismo componente de infraestructura.', 1, 'P4', 'ci', 5, 168),
                 ('3 incidentes del mismo servicio en 24 horas', 'Alerta temprana por degradación operativa de un servicio de TI.', 2, 'P3', 'servicio', 3, 24),
                 ('Incidente crítico (P1) en un servicio', 'Todo incidente P1 se propone para investigar su causa raíz.', 3, 'P1', 'servicio', 1, 24))
         r(nombre, descripcion, orden, prio, agrupar, umbral, ventana)
   WHERE NOT EXISTS (SELECT 1 FROM problema_regla_umbral);

  CREATE TEMP TABLE _vinc (id_problema INTEGER, id_ticket INTEGER) ON COMMIT DROP;

  -- Prioridad = impacto × urgencia (matriz institucional; si no está, la de ITIL)
  CREATE TEMP TABLE _prio ON COMMIT DROP AS
  SELECT i.nivel AS imp, u.nivel AS urg,
         COALESCE((SELECT m.id_prioridad FROM matriz_prioridad_institucional m
                    WHERE m.entidad = 'compartida' AND m.nivel_impacto = i.nivel AND m.nivel_urgencia = u.nivel),
                  (SELECT p.id_prioridad FROM prioridad_ticket p WHERE p.codigo =
                     CASE WHEN i.nivel = 3 AND u.nivel = 3 THEN 'P1'
                          WHEN i.nivel + u.nivel = 5 THEN 'P2'
                          WHEN i.nivel + u.nivel = 4 THEN 'P3'
                          WHEN i.nivel = 3 OR u.nivel = 3 THEN 'P3' ELSE 'P4' END)) AS id_prioridad,
         i.id_impacto, u.id_urgencia
    FROM impacto_ticket i CROSS JOIN urgencia_ticket u;

  -- ========================================================================
  -- 1. WI-FI DEL PISO 3 · Error conocido
  -- ========================================================================
  SELECT MIN(fecha_creacion) INTO v_ini FROM ticket WHERE titulo = 'Se corta el Wi-Fi en el piso 3';
  SELECT fecha_creacion, fecha_publicacion INTO v_a, v_k FROM articulo_conocimiento
   WHERE titulo = 'Cortes de Wi-Fi en el piso 3: solución temporal' AND estado_registro LIMIT 1;
  v_c := GREATEST(COALESCE(v_a - INTERVAL '3 days', v_ini + INTERVAL '14 days'), v_ini + INTERVAL '2 days');
  v_a := v_c + INTERVAL '2 days 3 hours';
  v_k := GREATEST(COALESCE(v_k, v_a + INTERVAL '1 day'), v_a + INTERVAL '2 hours');
  v_m := v_k;
  SELECT id_usuario_asignado INTO v_tec FROM ticket WHERE titulo = 'Se corta el Wi-Fi en el piso 3' AND id_usuario_asignado IS NOT NULL
   GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 1;
  SELECT id_ci INTO v_ci FROM elemento_configuracion WHERE codigo_ci = 'CI-AP-P3';

  INSERT INTO problema (codigo_problema, titulo, descripcion, id_impacto, id_urgencia, id_prioridad, id_estado,
                        causa_raiz, metodo_analisis, workaround, es_error_conocido, id_ci_afectado,
                        id_usuario_asignado, id_departamento, solucion_definitiva,
                        usuario_creacion, fecha_creacion, usuario_modificacion, fecha_modificacion)
  SELECT 'TMP-1', 'Cortes recurrentes de Wi-Fi en el piso 3',
         'El punto de acceso del piso 3 se desconecta varias veces al día por algunos minutos. Afecta a todo el piso y se repite desde hace semanas.',
         pr.id_impacto, pr.id_urgencia, pr.id_prioridad, 4,
         'El punto de acceso del piso 3 trabaja en el canal 6 de 2,4 GHz, saturado por las redes de los vecinos, y su firmware 8.10 tiene un fallo conocido: reinicia la radio cuando supera 40 clientes conectados.',
         '5_WHYS',
         'Reconectarse a la red FLOWDESK-5G. Si el corte persiste, Redes reinicia el punto de acceso de forma remota (2 minutos).',
         true, v_ci, v_tec, v_dep_redes, NULL,
         v_creador, v_c, v_tec, v_m
    FROM _prio pr WHERE pr.imp = 2 AND pr.urg = 2
  RETURNING id_problema INTO v_p;

  INSERT INTO problema_analisis (id_problema, metodo, cinco_porques, conclusion, id_usuario, fecha_creacion)
  VALUES (v_p, '5_WHYS',
          jsonb_build_array(
            '¿Por qué se corta el Wi-Fi? Porque el punto de acceso del piso 3 reinicia su radio.',
            '¿Por qué reinicia la radio? Porque supera los 40 clientes conectados en horas punta.',
            '¿Por qué eso la reinicia? Por un fallo conocido del firmware 8.10 del fabricante.',
            '¿Por qué tantos clientes en 2,4 GHz? Porque el piso 3 no tiene habilitada la banda de 5 GHz.',
            '¿Por qué el canal se satura? Porque el canal 6 comparte espectro con las redes de los edificios vecinos.'),
          'Firmware 8.10 con fallo de reinicio y canal 6 de 2,4 GHz saturado. Solución definitiva: actualizar el firmware y habilitar 5 GHz (requiere un cambio).',
          v_tec, v_a);

  INSERT INTO error_conocido (id_problema, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva, fecha_publicacion)
  VALUES (v_p, 'TMP-K1', 'Cortes de Wi-Fi en el piso 3',
          'Desconexiones de 1 a 3 minutos varias veces al día en todo el piso 3, sobre todo entre las 10:00 y las 16:00.',
          'Reconectarse a la red FLOWDESK-5G. Si el corte persiste, Redes reinicia el punto de acceso de forma remota.',
          NULL, v_k);

  UPDATE articulo_conocimiento SET id_problema_origen = v_p
   WHERE titulo = 'Cortes de Wi-Fi en el piso 3: solución temporal' AND estado_registro;

  INSERT INTO _vinc SELECT v_p, id_ticket FROM ticket WHERE titulo = 'Se corta el Wi-Fi en el piso 3' AND estado_registro;

  -- ========================================================================
  -- 2. IMPRESORA DEL PISO 2 · Resuelto
  -- ========================================================================
  SELECT fecha_creacion INTO v_ini FROM ticket WHERE titulo = 'La impresora del piso 2 se atasca'
   ORDER BY fecha_creacion OFFSET 5 LIMIT 1;
  SELECT MAX(fecha_creacion) INTO v_fin FROM ticket WHERE titulo = 'La impresora del piso 2 se atasca';
  v_c := v_ini + INTERVAL '1 day';
  v_a := v_c + INTERVAL '2 days';
  v_k := v_a + INTERVAL '1 day';
  v_m := LEAST(GREATEST(v_fin, v_k) + INTERVAL '1 day', v_ahora - INTERVAL '2 hours');
  SELECT id_usuario_asignado INTO v_tec FROM ticket WHERE titulo = 'La impresora del piso 2 se atasca' AND id_usuario_asignado IS NOT NULL
   GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 1;
  SELECT id_ci INTO v_ci FROM elemento_configuracion ci
    JOIN activo a ON a.id_activo = ci.id_activo WHERE a.codigo_patrimonial = 'HDW-PRN-0002' LIMIT 1;

  INSERT INTO problema (codigo_problema, titulo, descripcion, id_impacto, id_urgencia, id_prioridad, id_estado,
                        causa_raiz, metodo_analisis, workaround, es_error_conocido, id_ci_afectado,
                        id_usuario_asignado, id_departamento, solucion_definitiva,
                        usuario_creacion, fecha_creacion, usuario_modificacion, fecha_modificacion)
  SELECT 'TMP-2', 'Atascos repetidos en la impresora del piso 2 (HDW-PRN-0002)',
         'La impresora del piso 2 se atasca con el papel de la bandeja 2 varias veces por semana. Cada atasco detiene la impresión de todo el piso.',
         pr.id_impacto, pr.id_urgencia, pr.id_prioridad, 5,
         'El kit de rodillos de alimentación de la bandeja 2 está desgastado: la impresora superó las 150 000 páginas sin el mantenimiento preventivo que indica el fabricante.',
         '5_WHYS',
         'Imprimir desde la bandeja 1. Si se atasca, retirar el papel por la puerta lateral siguiendo la guía pegada en el equipo.',
         true, v_ci, v_tec, v_dep_campo,
         'El proveedor reemplazó el kit de rodillos de la bandeja 2 y se programó el mantenimiento preventivo cada 100 000 páginas.',
         v_creador, v_c, v_tec, v_m
    FROM _prio pr WHERE pr.imp = 2 AND pr.urg = 2
  RETURNING id_problema INTO v_p;

  INSERT INTO problema_analisis (id_problema, metodo, cinco_porques, conclusion, id_usuario, fecha_creacion)
  VALUES (v_p, '5_WHYS',
          jsonb_build_array(
            '¿Por qué se atasca? Porque el papel de la bandeja 2 entra torcido.',
            '¿Por qué entra torcido? Porque el rodillo de alimentación ya no tiene agarre.',
            '¿Por qué no tiene agarre? Porque está desgastado por el uso.',
            '¿Por qué llegó a ese desgaste? Porque superó las 150 000 páginas.',
            '¿Por qué nadie lo cambió? Porque el equipo no tenía un mantenimiento preventivo programado.'),
          'Rodillos de la bandeja 2 desgastados y sin mantenimiento preventivo. Solución: cambiar el kit de rodillos y programar el mantenimiento.',
          v_tec, v_a);

  INSERT INTO error_conocido (id_problema, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva, fecha_publicacion)
  VALUES (v_p, 'TMP-K2', 'Atascos en la bandeja 2 de la impresora del piso 2',
          'El papel de la bandeja 2 se atasca en la entrada; la pantalla muestra "Atasco en la bandeja 2".',
          'Imprimir desde la bandeja 1. Si se atasca, retirar el papel por la puerta lateral siguiendo la guía pegada en el equipo.',
          'Reemplazo del kit de rodillos de la bandeja 2 y mantenimiento preventivo cada 100 000 páginas.',
          v_k);

  INSERT INTO _vinc SELECT v_p, id_ticket FROM ticket WHERE titulo = 'La impresora del piso 2 se atasca' AND estado_registro;

  -- ========================================================================
  -- 3. CAÍDA DEL HOST 02 · Cerrado (problema mayor) + su incidente mayor
  -- ========================================================================
  SELECT t.id_ticket, t.fecha_creacion, COALESCE(t.fecha_resolucion, t.fecha_creacion + INTERVAL '2 hours 35 minutes'), t.id_usuario_asignado
    INTO v_mayor_tk, v_mayor_ini, v_mayor_res, v_mayor_tec
    FROM ticket t JOIN ticket_incidente ti USING (id_ticket) JOIN elemento_configuracion ci ON ci.id_ci = t.id_ci
   WHERE ti.es_incidente_mayor AND ci.codigo_ci = 'CI-HOST-02'
   ORDER BY t.fecha_creacion LIMIT 1;
  v_c := v_mayor_res + INTERVAL '2 hours';
  v_a := v_mayor_ini + INTERVAL '2 days';
  v_k := v_a + INTERVAL '3 hours';
  v_m := LEAST(v_mayor_ini + INTERVAL '22 days', v_ahora - INTERVAL '1 day');
  SELECT id_ci INTO v_ci FROM elemento_configuracion WHERE codigo_ci = 'CI-HOST-02';

  INSERT INTO problema (codigo_problema, titulo, descripcion, id_impacto, id_urgencia, id_prioridad, id_estado,
                        causa_raiz, metodo_analisis, workaround, es_error_conocido, id_ci_afectado,
                        id_usuario_asignado, id_departamento, solucion_definitiva,
                        usuario_creacion, fecha_creacion, usuario_modificacion, fecha_modificacion)
  SELECT 'TMP-3', 'Caída del Host de virtualización 02',
         'El Host 02 se apagó de forma inesperada y dejó sin servicio al ERP financiero y a la intranet durante unas dos horas y media. Se investiga por qué ocurrió y cómo evitar que se repita.',
         pr.id_impacto, pr.id_urgencia, pr.id_prioridad, 6,
         'La primera fuente de poder del Host 02 falló semanas antes y nadie lo notó: la alerta de la consola de gestión llegaba a un buzón que nadie revisaba. Cuando falló la segunda fuente, el host se apagó.',
         'COMBINADO',
         'Si un host cae, migrar sus máquinas virtuales al Host 01 con el procedimiento de recuperación publicado en la base de conocimiento.',
         true, v_ci, v_mayor_tec, v_dep_sist,
         'Se reemplazaron las dos fuentes de poder, las alertas de hardware llegan ahora al canal de guardia de Sistemas y se agregó una revisión mensual del estado de los hosts.',
         v_creador, v_c, v_mayor_tec, v_m
    FROM _prio pr WHERE pr.imp = 3 AND pr.urg = 3
  RETURNING id_problema INTO v_p;

  INSERT INTO problema_analisis (id_problema, metodo, cinco_porques, linea_tiempo, conclusion, id_usuario, fecha_creacion)
  VALUES (v_p, 'COMBINADO',
          jsonb_build_array(
            '¿Por qué cayó el ERP? Porque se apagó el Host 02, donde corre.',
            '¿Por qué se apagó el Host 02? Porque fallaron sus dos fuentes de poder.',
            '¿Por qué no bastó la redundancia? Porque la primera fuente ya estaba dañada desde hacía semanas.',
            '¿Por qué nadie lo sabía? Porque la alerta llegaba a un buzón sin monitoreo.',
            '¿Por qué ese buzón? Porque al instalar el host no se definió quién recibe las alertas de hardware.'),
          jsonb_build_array(
            jsonb_build_object('fecha', to_char(v_mayor_ini - INTERVAL '41 days', 'DD/MM/YYYY'), 'evento', 'Falla la fuente de poder 1; la alerta va a un buzón sin monitoreo.'),
            jsonb_build_object('fecha', to_char(v_mayor_ini AT TIME ZONE 'America/Lima', 'DD/MM/YYYY HH24:MI'), 'evento', 'Falla la fuente de poder 2 y el Host 02 se apaga.'),
            jsonb_build_object('fecha', to_char((v_mayor_ini + INTERVAL '10 minutes') AT TIME ZONE 'America/Lima', 'DD/MM/YYYY HH24:MI'), 'evento', 'Se declara el incidente mayor.'),
            jsonb_build_object('fecha', to_char(v_mayor_res AT TIME ZONE 'America/Lima', 'DD/MM/YYYY HH24:MI'), 'evento', 'Las máquinas virtuales vuelven a operar desde el Host 01.')),
          'Falla doble de fuentes de poder sin alerta atendida. Solución: reemplazo de fuentes y alertas al canal de guardia.',
          v_mayor_tec, v_a);

  INSERT INTO error_conocido (id_problema, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva, fecha_publicacion)
  VALUES (v_p, 'TMP-K3', 'Host de virtualización apagado por falla de fuentes de poder',
          'El host no responde, la consola de gestión muestra las fuentes de poder en rojo y las máquinas virtuales quedan fuera de servicio.',
          'Migrar las máquinas virtuales al Host 01 con el procedimiento de recuperación de la base de conocimiento.',
          'Reemplazar las fuentes dañadas y verificar que las alertas de hardware lleguen al canal de guardia.',
          v_k);

  -- El cierre de un problema mayor exige la aprobación del riesgo residual
  INSERT INTO problema_cierre_aprobacion (id_problema, decision, riesgo_aceptado, comentario, id_aprobador, fecha_decision)
  VALUES (v_p, 'APROBADO',
          'Mientras exista un solo host de respaldo, una falla simultánea de los dos hosts dejaría sin servicio al ERP. Se acepta hasta la renovación de servidores del próximo año.',
          'Fuentes reemplazadas, alertas probadas y tres semanas sin nuevas fallas.',
          v_aprobador, v_m - INTERVAL '2 hours');

  INSERT INTO _vinc SELECT v_p, v_mayor_tk;
  INSERT INTO _vinc
  SELECT v_p, t.id_ticket FROM ticket t
    JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket AND tt.codigo = 'INCIDENTE'
    JOIN elemento_configuracion ci ON ci.id_ci = t.id_ci AND ci.codigo_ci IN ('CI-SVC-ERP', 'CI-SVC-INTRA')
   WHERE t.fecha_creacion BETWEEN v_mayor_ini AND v_mayor_res AND t.id_ticket <> v_mayor_tk;

  -- Incidente mayor de la caída (si aún no se registró)
  IF NOT EXISTS (SELECT 1 FROM incidente_mayor WHERE id_ticket = v_mayor_tk AND estado_registro) THEN
    INSERT INTO incidente_mayor (codigo, titulo, descripcion, severidad, estado, id_ticket, id_problema, id_departamento,
                                 comunicados, involucrados, id_usuario_declara, id_usuario_cierra, fecha_declaracion, fecha_cierre)
    SELECT 'IM-' || to_char(v_mayor_ini AT TIME ZONE 'America/Lima', 'YYYY') || '-' ||
             lpad((COALESCE((SELECT MAX(SUBSTRING(codigo FROM '^IM-[0-9]{4}-([0-9]+)$')::int) FROM incidente_mayor
                              WHERE codigo LIKE 'IM-' || to_char(v_mayor_ini AT TIME ZONE 'America/Lima', 'YYYY') || '-%'), 0) + 1)::text, 4, '0'),
           'Caída del Host de virtualización 02',
           'El ERP financiero y la intranet quedaron fuera de servicio para toda la institución.',
           'P1', 'CERRADO', v_mayor_tk, v_p, v_dep_sist,
           jsonb_build_array(
             jsonb_build_object('texto', 'El ERP y la intranet no están disponibles. Sistemas ya trabaja en la recuperación.', 'fecha', v_mayor_ini + INTERVAL '15 minutes', 'usuario', sup.nombre),
             jsonb_build_object('texto', 'Se están migrando las máquinas virtuales al Host 01. Tiempo estimado: 2 horas.', 'fecha', v_mayor_ini + INTERVAL '1 hour', 'usuario', sup.nombre),
             jsonb_build_object('texto', 'Servicio restablecido. El ERP y la intranet funcionan con normalidad.', 'fecha', v_mayor_res + INTERVAL '5 minutes', 'usuario', sup.nombre)),
           CASE WHEN v_mayor_tec IS NULL THEN '[]'::jsonb
                ELSE jsonb_build_array(jsonb_build_object('id_usuario', v_mayor_tec, 'nombre', tec.nombre, 'rol_crisis', 'Especialista Técnico / Resolutor', 'tipo', 'tecnico')) END,
           COALESCE(d.id_supervisor, v_creador), COALESCE(d.id_supervisor, v_creador),
           v_mayor_ini + INTERVAL '10 minutes', v_mayor_res + INTERVAL '20 minutes'
      FROM departamento_ti d
      LEFT JOIN LATERAL (SELECT TRIM(CONCAT(u.nombres, ' ', u.apellido_paterno)) AS nombre FROM usuario u
                          WHERE u.id_usuario = COALESCE(d.id_supervisor, v_creador)) sup ON true
      LEFT JOIN LATERAL (SELECT TRIM(CONCAT(u.nombres, ' ', u.apellido_paterno)) AS nombre FROM usuario u
                          WHERE u.id_usuario = v_mayor_tec) tec ON true
     WHERE d.id_departamento = v_dep_sist;
  ELSE
    UPDATE incidente_mayor SET id_problema = v_p WHERE id_ticket = v_mayor_tk AND estado_registro AND id_problema IS NULL;
  END IF;

  -- ========================================================================
  -- 4. ERP LENTO A FIN DE MES · Causa raíz identificada
  -- ========================================================================
  SELECT f INTO v_ini FROM (
    SELECT date_trunc('month', fecha_creacion) m, MIN(fecha_creacion) f FROM ticket
     WHERE titulo = 'El ERP está muy lento' GROUP BY 1 ORDER BY 1 OFFSET 2 LIMIT 1) x;
  v_ini := COALESCE(v_ini, (SELECT MIN(fecha_creacion) FROM ticket WHERE titulo = 'El ERP está muy lento'));
  v_c := v_ini + INTERVAL '3 days';
  SELECT f INTO v_a FROM (
    SELECT date_trunc('month', fecha_creacion) m, MAX(fecha_creacion) f FROM ticket
     WHERE titulo = 'El ERP está muy lento' AND fecha_creacion > v_c GROUP BY 1 ORDER BY 1 LIMIT 1) x;
  v_a := LEAST(COALESCE(v_a, v_c + INTERVAL '30 days') + INTERVAL '2 days', v_ahora - INTERVAL '1 day');
  v_m := v_a;
  SELECT id_usuario_asignado INTO v_tec FROM ticket WHERE titulo = 'El ERP está muy lento' AND id_usuario_asignado IS NOT NULL
   GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 1;
  SELECT id_ci INTO v_ci FROM elemento_configuracion WHERE codigo_ci = 'CI-APP-ERP';

  INSERT INTO problema (codigo_problema, titulo, descripcion, id_impacto, id_urgencia, id_prioridad, id_estado,
                        causa_raiz, metodo_analisis, workaround, es_error_conocido, id_ci_afectado,
                        id_usuario_asignado, id_departamento, solucion_definitiva,
                        usuario_creacion, fecha_creacion, usuario_modificacion, fecha_modificacion)
  SELECT 'TMP-4', 'ERP financiero lento durante el cierre de mes',
         'En los últimos días de cada mes el ERP tarda más de 20 segundos por pantalla. Coincide con el cierre contable y afecta a Finanzas y Contabilidad.',
         pr.id_impacto, pr.id_urgencia, pr.id_prioridad, 3,
         'El proceso de cierre recalcula los saldos recorriendo la tabla de movimientos sin un índice por período y la bloquea varios minutos; las consultas de los usuarios quedan en espera detrás de ese bloqueo.',
         'TIMELINE',
         'Durante el cierre, Sistemas libera las sesiones bloqueadas de la base de datos del ERP; el tiempo de respuesta se normaliza en minutos.',
         false, v_ci, v_tec, v_dep_sist, NULL,
         v_creador, v_c, v_tec, v_m
    FROM _prio pr WHERE pr.imp = 2 AND pr.urg = 3
  RETURNING id_problema INTO v_p;

  INSERT INTO problema_analisis (id_problema, metodo, linea_tiempo, conclusion, id_usuario, fecha_creacion)
  VALUES (v_p, 'TIMELINE',
          jsonb_build_array(
            jsonb_build_object('fecha', 'Día 28 · 18:00', 'evento', 'Contabilidad lanza el proceso de cierre de saldos.'),
            jsonb_build_object('fecha', 'Día 28 · 18:05', 'evento', 'El proceso bloquea la tabla de movimientos.'),
            jsonb_build_object('fecha', 'Día 29 · 09:00', 'evento', 'Los usuarios reportan pantallas de más de 20 segundos.'),
            jsonb_build_object('fecha', 'Día 29 · 09:40', 'evento', 'Sistemas libera las sesiones bloqueadas y el servicio se normaliza.')),
          'El cierre bloquea la tabla de movimientos por falta de un índice por período. Solución propuesta: crear el índice y ejecutar el cierre fuera del horario de oficina (requiere un cambio).',
          v_tec, v_a);

  UPDATE articulo_conocimiento SET id_problema_origen = v_p
   WHERE titulo = 'ERP lento a fin de mes (borrador en análisis)' AND estado_registro;

  INSERT INTO _vinc SELECT v_p, id_ticket FROM ticket WHERE titulo = 'El ERP está muy lento' AND estado_registro;

  -- ========================================================================
  -- 5. ERP "LA SESIÓN EXPIRÓ" · En investigación
  -- ========================================================================
  v_c := ((date_trunc('day', (v_ahora - INTERVAL '6 days') AT TIME ZONE 'America/Lima') + INTERVAL '10 hours') AT TIME ZONE 'America/Lima');
  v_a := v_c + INTERVAL '2 days 4 hours';
  v_m := v_a;
  SELECT id_usuario_asignado INTO v_tec FROM ticket WHERE titulo = 'El ERP me dice que la sesión expiró' AND id_usuario_asignado IS NOT NULL
   GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 1;

  INSERT INTO problema (codigo_problema, titulo, descripcion, id_impacto, id_urgencia, id_prioridad, id_estado,
                        causa_raiz, metodo_analisis, workaround, es_error_conocido, id_ci_afectado,
                        id_usuario_asignado, id_departamento, solucion_definitiva,
                        usuario_creacion, fecha_creacion, usuario_modificacion, fecha_modificacion)
  SELECT 'TMP-5', 'El ERP cierra la sesión apenas se inicia',
         'Detectado en Candidatos: el mensaje "La sesión expiró" se repite cada semana en distintas áreas. La solución temporal funciona, pero el error vuelve.',
         pr.id_impacto, pr.id_urgencia, pr.id_prioridad, 2,
         NULL, '5_WHYS',
         'Borrar las cookies del sitio del ERP y volver a iniciar sesión (artículo de la base de conocimiento).',
         false, v_ci, v_tec, v_dep_sist, NULL,
         v_creador, v_c, v_tec, v_m
    FROM _prio pr WHERE pr.imp = 2 AND pr.urg = 2
  RETURNING id_problema INTO v_p;

  INSERT INTO problema_analisis (id_problema, metodo, cinco_porques, conclusion, id_usuario, fecha_creacion)
  VALUES (v_p, '5_WHYS',
          jsonb_build_array(
            '¿Por qué aparece "La sesión expiró"? Porque el ERP no reconoce la cookie de sesión recién creada.',
            '¿Por qué no la reconoce? Porque la cookie llega con un dominio distinto al que espera el ERP (en revisión).'),
          NULL, v_tec, v_a);

  INSERT INTO _vinc SELECT v_p, id_ticket FROM ticket WHERE titulo = 'El ERP me dice que la sesión expiró' AND estado_registro;

  -- ========================================================================
  -- 6. UNIDAD COMPARTIDA S: · Registrado, sin responsable
  -- ========================================================================
  v_c := ((date_trunc('day', (v_ahora - INTERVAL '1 day') AT TIME ZONE 'America/Lima') + INTERVAL '9 hours 30 minutes') AT TIME ZONE 'America/Lima');
  v_c := LEAST(v_c, v_ahora - INTERVAL '1 hour');
  SELECT id_ci INTO v_ci FROM elemento_configuracion WHERE codigo_ci = 'CI-APP-FILES';

  INSERT INTO problema (codigo_problema, titulo, descripcion, id_impacto, id_urgencia, id_prioridad, id_estado,
                        causa_raiz, metodo_analisis, workaround, es_error_conocido, id_ci_afectado,
                        id_usuario_asignado, id_departamento, solucion_definitiva,
                        usuario_creacion, fecha_creacion, usuario_modificacion, fecha_modificacion)
  SELECT 'TMP-6', 'La unidad compartida S: deja de estar disponible',
         'Detectado en Candidatos: varios usuarios no pueden abrir la unidad S: en el último mes. Falta asignar un responsable para investigarlo.',
         pr.id_impacto, pr.id_urgencia, pr.id_prioridad, 1,
         NULL, '5_WHYS', NULL, false, v_ci, NULL, v_dep_sist, NULL,
         v_creador, v_c, v_creador, v_c
    FROM _prio pr WHERE pr.imp = 2 AND pr.urg = 2
  RETURNING id_problema INTO v_p;

  INSERT INTO _vinc
  SELECT v_p, id_ticket FROM ticket
   WHERE titulo = 'No puedo abrir la unidad compartida S:' AND estado_registro AND fecha_creacion >= v_ahora - INTERVAL '30 days';
  IF NOT EXISTS (SELECT 1 FROM _vinc WHERE id_problema = v_p) THEN
    INSERT INTO _vinc
    SELECT v_p, id_ticket FROM ticket WHERE titulo = 'No puedo abrir la unidad compartida S:' AND estado_registro
     ORDER BY fecha_creacion DESC LIMIT 5;
  END IF;

  -- ========================================================================
  -- 7. Códigos en orden cronológico, vínculos con los incidentes
  -- ========================================================================
  UPDATE problema p SET codigo_problema = x.codigo
    FROM (SELECT id_problema,
                 'PRB-' || to_char(fecha_creacion AT TIME ZONE 'America/Lima', 'YYYY') || '-' ||
                 lpad(row_number() OVER (PARTITION BY to_char(fecha_creacion AT TIME ZONE 'America/Lima', 'YYYY')
                                         ORDER BY fecha_creacion)::text, 4, '0') AS codigo
            FROM problema) x
   WHERE x.id_problema = p.id_problema;

  UPDATE error_conocido e SET codigo_kedb = x.codigo
    FROM (SELECT id_error_conocido, 'KEDB-' || lpad(row_number() OVER (ORDER BY fecha_publicacion)::text, 3, '0') AS codigo
            FROM error_conocido) x
   WHERE x.id_error_conocido = e.id_error_conocido;

  INSERT INTO problema_incidente (id_problema, id_ticket, fecha_asociacion)
  SELECT DISTINCT v.id_problema, v.id_ticket, GREATEST(t.fecha_creacion, p.fecha_creacion)
    FROM _vinc v JOIN ticket t ON t.id_ticket = v.id_ticket JOIN problema p ON p.id_problema = v.id_problema
  ON CONFLICT DO NOTHING;

  INSERT INTO ticket_incidente (id_ticket, id_problema)
  SELECT DISTINCT id_ticket, id_problema FROM _vinc
  ON CONFLICT (id_ticket) DO UPDATE SET id_problema = EXCLUDED.id_problema;

  -- ========================================================================
  -- 8. Validación final: si algo no cuadra, se revierte todo
  -- ========================================================================
  IF (SELECT COUNT(*) FROM problema) <> 6 THEN
    v_problemas := v_problemas || ' · no se crearon los 6 problemas';
  END IF;
  IF (SELECT array_agg(id_estado ORDER BY id_estado) FROM problema) <> ARRAY[1, 2, 3, 4, 5, 6] THEN
    v_problemas := v_problemas || ' · los estados no cubren el ciclo de vida';
  END IF;
  IF EXISTS (SELECT 1 FROM problema WHERE id_departamento IS NULL OR id_prioridad IS NULL OR codigo_problema LIKE 'TMP-%') THEN
    v_problemas := v_problemas || ' · problemas sin grupo, prioridad o código';
  END IF;
  IF EXISTS (SELECT 1 FROM problema WHERE fecha_creacion > v_ahora OR fecha_modificacion < fecha_creacion OR fecha_modificacion > v_ahora) THEN
    v_problemas := v_problemas || ' · fechas de problemas fuera de orden';
  END IF;
  IF EXISTS (SELECT 1 FROM problema WHERE id_estado >= 2 AND id_usuario_asignado IS NULL) THEN
    v_problemas := v_problemas || ' · problemas en curso sin responsable';
  END IF;
  IF EXISTS (SELECT 1 FROM problema p WHERE NOT EXISTS (SELECT 1 FROM problema_incidente pi WHERE pi.id_problema = p.id_problema)) THEN
    v_problemas := v_problemas || ' · problemas sin incidentes vinculados';
  END IF;
  IF EXISTS (SELECT 1 FROM problema_incidente pi JOIN ticket t USING (id_ticket)
               JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket WHERE tt.codigo <> 'INCIDENTE') THEN
    v_problemas := v_problemas || ' · solicitudes vinculadas a un problema';
  END IF;
  IF EXISTS (SELECT 1 FROM problema_incidente pi JOIN ticket_incidente ti USING (id_ticket)
              WHERE ti.id_problema IS DISTINCT FROM pi.id_problema) THEN
    v_problemas := v_problemas || ' · vínculos ticket ↔ problema que no coinciden';
  END IF;
  IF EXISTS (SELECT 1 FROM problema p WHERE p.es_error_conocido
               AND NOT EXISTS (SELECT 1 FROM error_conocido e WHERE e.id_problema = p.id_problema)) THEN
    v_problemas := v_problemas || ' · error conocido marcado sin registro en la KEDB';
  END IF;
  IF EXISTS (SELECT 1 FROM error_conocido e JOIN problema p USING (id_problema) WHERE e.fecha_publicacion < p.fecha_creacion) THEN
    v_problemas := v_problemas || ' · errores conocidos publicados antes que su problema';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM incidente_mayor im JOIN problema p ON p.id_problema = im.id_problema
                  WHERE im.estado = 'CERRADO' AND p.id_estado = 6) THEN
    v_problemas := v_problemas || ' · el incidente mayor no quedó vinculado al problema cerrado';
  END IF;

  IF v_problemas <> '' THEN
    RAISE EXCEPTION 'La carga no cuadra y se revirtió:%', v_problemas;
  END IF;

  SELECT COUNT(*) INTO v_n FROM problema_incidente;
  RAISE NOTICE 'Carga completa: 6 problemas, % incidentes vinculados, % errores conocidos, % incidente(s) mayor(es).',
    v_n, (SELECT COUNT(*) FROM error_conocido), (SELECT COUNT(*) FROM incidente_mayor);
END $$;

-- Resumen ----------------------------------------------------------------------
SELECT p.codigo_problema,
       CASE p.id_estado WHEN 1 THEN 'Registrado' WHEN 2 THEN 'En investigación' WHEN 3 THEN 'Causa raíz identificada'
                        WHEN 4 THEN 'Error conocido (KEDB)' WHEN 5 THEN 'Resuelto' WHEN 6 THEN 'Cerrado' END AS estado,
       pr.codigo AS prioridad, p.titulo, d.nombre AS grupo,
       (SELECT COUNT(*) FROM problema_incidente pi WHERE pi.id_problema = p.id_problema) AS incidentes,
       (SELECT string_agg(e.codigo_kedb, ', ') FROM error_conocido e WHERE e.id_problema = p.id_problema) AS kedb,
       to_char(p.fecha_creacion AT TIME ZONE 'America/Lima', 'YYYY-MM-DD') AS creado
  FROM problema p
  JOIN prioridad_ticket pr ON pr.id_prioridad = p.id_prioridad
  JOIN departamento_ti d ON d.id_departamento = p.id_departamento
 ORDER BY p.codigo_problema;
