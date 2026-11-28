-- ============================================================================
-- CARGA DE GESTIÓN DE CAMBIOS · ejecutar UNA sola vez
-- ----------------------------------------------------------------------------
-- REQUISITOS (en este orden): carga_conocimiento_tickets.sql,
-- db/10_incidentes_mayores_y_limpieza.sql, db/11_cambio_desde_solicitud.sql y
-- carga_problemas.sql.
--
-- 1. Configuración que faltaba (solo si está vacía): catálogos del formulario
--    de RFC (categorías, entornos, motivos, medios de emergencia) y cuatro
--    modelos de cambio estándar aprobados.
-- 2. Trece RFC que cubren los 8 estados y los 3 tipos, con su origen:
--      · de problemas: firmware del Wi-Fi del piso 3 (en planificación), índice
--        del ERP para el cierre (en evaluación CAB), fuentes del Host 02
--        (emergencia, exitoso) y alertas de hardware (exitoso);
--      · de solicitudes: excepción web para un proveedor (estándar, exitoso) y
--        puntos de red (normal, aprobado);
--      · de mantenimiento: parches mensuales (estándar; uno falló), reinicio del
--        servidor del ERP (en ejecución ahora);
--      · otros: cliente VPN (fallido con rollback), migración del correo
--        (rechazada por el CAB) y renovación del switch del piso 1 (registrada).
-- 3. Votos del CAB, dictamen del ECAB, dos reuniones del CAB (una realizada y
--    otra programada), PIR, avisos de "enterado" de los técnicos y la
--    actualización de la CMDB de los cambios exitosos.
--
-- Las fechas se calculan desde "ahora" y desde los tickets y problemas ya
-- cargados, así que la historia cuadra aunque se ejecute otro día.
-- Reglas: solo corre si no hay cambios; todo va en UN bloque; al final valida
-- que todo cuadre y, si no, se revierte completo. Haga un respaldo antes.
-- Respeta los períodos de congelamiento: ningún cambio normal o estándar cae
-- dentro de uno (los de emergencia están exentos).
-- ============================================================================

-- ¿La fecha cae en un período de congelamiento activo? (fechas exactas o
-- recurrentes "MM-DD"; además, el cierre de fin de año del calendario)
CREATE OR REPLACE FUNCTION pg_temp.en_congelamiento(d DATE) RETURNS BOOLEAN LANGUAGE sql STABLE AS $f$
  SELECT to_char(d, 'MM-DD') >= '12-20' OR to_char(d, 'MM-DD') <= '01-05'
      OR EXISTS (
        SELECT 1 FROM periodos_congelamiento pc
         WHERE pc.activo
           AND ((d BETWEEN (pc.fecha_inicio AT TIME ZONE 'America/Lima')::date AND (pc.fecha_fin AT TIME ZONE 'America/Lima')::date)
             OR (pc.recurrente_anual AND pc.mes_dia_inicio IS NOT NULL AND pc.mes_dia_fin IS NOT NULL
                 AND CASE WHEN pc.mes_dia_inicio <= pc.mes_dia_fin
                          THEN to_char(d, 'MM-DD') BETWEEN pc.mes_dia_inicio AND pc.mes_dia_fin
                          ELSE to_char(d, 'MM-DD') >= pc.mes_dia_inicio OR to_char(d, 'MM-DD') <= pc.mes_dia_fin END)))
$f$;

DO $$
DECLARE
  v_ahora       TIMESTAMPTZ := now();
  v_hoy         DATE := (now() AT TIME ZONE 'America/Lima')::date;
  v_gestor      INTEGER;
  v_votantes    INTEGER[];
  v_quorum      INTEGER;
  v_autorizador INTEGER;
  v_tec_redes   INTEGER;
  v_tec_sist    INTEGER;
  v_tec_campo   INTEGER;
  v_mayor_tk    INTEGER;
  v_mayor_ini   TIMESTAMPTZ;
  v_sol_web     INTEGER;
  v_sol_web_ini TIMESTAMPTZ;
  v_sol_web_fin TIMESTAMPTZ;
  v_sol_red     INTEGER;
  v_sabado      DATE;
  v_martes      DATE;
  v_cierre_mes  DATE;
  v_reunion     TIMESTAMPTZ;   -- última reunión del CAB (martes pasado, 10:00)
  v_meses       TEXT[] := ARRAY['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
                                'septiembre', 'octubre', 'noviembre', 'diciembre'];
  v_n           INTEGER;
  v_vuelta      INTEGER;
  v_problemas   TEXT := '';
  r             RECORD;
BEGIN
  -- ------------------------------------------------------------------------
  -- Protecciones
  -- ------------------------------------------------------------------------
  IF EXISTS (SELECT 1 FROM cambio) THEN
    RAISE EXCEPTION 'Ya hay cambios registrados. Esta carga solo corre sobre la tabla vacía.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM problema WHERE titulo = 'Cortes recurrentes de Wi-Fi en el piso 3') THEN
    RAISE EXCEPTION 'Primero ejecute carga_problemas.sql (faltan los problemas que originan los cambios).';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cambio' AND column_name = 'id_solicitud_origen') THEN
    RAISE EXCEPTION 'Primero ejecute db/11_cambio_desde_solicitud.sql.';
  END IF;

  -- ------------------------------------------------------------------------
  -- Personas: Gestor de Cambios (o Administrador), Aprobadores CAB y técnicos
  -- ------------------------------------------------------------------------
  -- De preferencia, un Gestor de Cambios que no sea también Aprobador CAB
  -- (quien presenta una RFC no puede votarla).
  SELECT up.id_usuario INTO v_gestor FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil = 8 AND up.estado_registro AND u.estado_registro
   ORDER BY EXISTS (SELECT 1 FROM usuario_perfiles a WHERE a.id_usuario = up.id_usuario AND a.id_perfil = 7 AND a.estado_registro),
            up.id_usuario
   LIMIT 1;
  IF v_gestor IS NULL THEN
    SELECT MIN(up.id_usuario) INTO v_gestor FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
     WHERE up.id_perfil = 1 AND up.estado_registro AND u.estado_registro;
  END IF;

  -- Quórum del CAB = mitad + 1 de los Aprobadores CAB activos (misma regla de la app)
  SELECT array_agg(DISTINCT up.id_usuario ORDER BY up.id_usuario) INTO v_votantes
    FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil = 7 AND up.estado_registro AND u.estado_registro;
  v_quorum := COALESCE(array_length(v_votantes, 1), 0) / 2 + 1;

  SELECT MIN(up.id_usuario) INTO v_autorizador FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil IN (7, 4, 1) AND up.estado_registro AND u.estado_registro AND up.id_usuario <> v_gestor;
  v_autorizador := COALESCE(v_autorizador, v_gestor);

  SELECT MIN(td.id_usuario) INTO v_tec_redes FROM tecnico_detalle td JOIN departamento_ti d USING (id_departamento)
    JOIN usuario u ON u.id_usuario = td.id_usuario AND u.estado_registro
   WHERE d.codigo = 'DEP-REDES' AND td.estado_registro AND td.id_usuario <> v_gestor;
  SELECT MIN(td.id_usuario) INTO v_tec_sist FROM tecnico_detalle td JOIN departamento_ti d USING (id_departamento)
    JOIN usuario u ON u.id_usuario = td.id_usuario AND u.estado_registro
   WHERE d.codigo = 'DEP-N3-SIST' AND td.estado_registro AND td.id_usuario <> v_gestor;
  SELECT MIN(td.id_usuario) INTO v_tec_campo FROM tecnico_detalle td JOIN departamento_ti d USING (id_departamento)
    JOIN usuario u ON u.id_usuario = td.id_usuario AND u.estado_registro
   WHERE d.codigo = 'DEP-N2-CAMPO' AND td.estado_registro AND td.id_usuario <> v_gestor;
  IF v_gestor IS NULL OR v_tec_redes IS NULL OR v_tec_sist IS NULL OR v_tec_campo IS NULL THEN
    RAISE EXCEPTION 'Faltan el Gestor de Cambios/Administrador o técnicos activos en Redes, Sistemas (N3) o Soporte en sitio (N2).';
  END IF;

  -- ========================================================================
  -- 1. CONFIGURACIÓN QUE FALTABA
  -- ========================================================================
  INSERT INTO cambio_catalogo_item (catalogo, codigo, nombre, descripcion, color, orden, activo, es_sistema, usuario_creacion)
  SELECT c.catalogo, c.codigo, c.nombre, c.descripcion, c.color, c.orden, true, true, v_gestor
    FROM (VALUES
      ('categorias_cambio', 'INFRA', 'Infraestructura y servidores', 'Servidores, virtualización, almacenamiento y respaldos.', '#1d4ed8', 1),
      ('categorias_cambio', 'REDES', 'Redes y comunicaciones', 'Switches, Wi-Fi, firewall y enlaces.', '#0f766e', 2),
      ('categorias_cambio', 'SOFTWARE', 'Software y aplicaciones', 'ERP, intranet, correo y software de los equipos.', '#7c3aed', 3),
      ('categorias_cambio', 'SEGURIDAD', 'Seguridad', 'Accesos, parches de seguridad y reglas de protección.', '#b91c1c', 4),
      ('entornos', 'PRODUCCION', 'Producción', 'Servicios que usan los colaboradores.', '#b91c1c', 1),
      ('entornos', 'PREPRODUCCION', 'Preproducción', 'Copia de producción para la validación final.', '#c2410c', 2),
      ('entornos', 'PRUEBAS', 'Pruebas', 'Entorno de pruebas funcionales.', '#1d4ed8', 3),
      ('entornos', 'DESARROLLO', 'Desarrollo', 'Entorno de desarrollo.', '#475569', 4),
      ('origenes', 'PROBLEMA', 'Solución de un problema', 'Elimina la causa raíz de un problema.', '#be185d', 1),
      ('origenes', 'INCIDENTE', 'Restablecimiento de un incidente', 'Necesario para recuperar un servicio.', '#b91c1c', 2),
      ('origenes', 'SOLICITUD', 'Requerimiento del negocio', 'Atiende una solicitud de servicio.', '#15803d', 3),
      ('origenes', 'MANTENIMIENTO', 'Mantenimiento preventivo', 'Parches, renovaciones y tareas periódicas.', '#1d4ed8', 4),
      ('origenes', 'MEJORA', 'Mejora continua', 'Mejora un servicio que funciona.', '#7c3aed', 5),
      ('origenes', 'CUMPLIMIENTO', 'Cumplimiento normativo o de seguridad', 'Exigido por una norma o una auditoría.', '#475569', 6),
      ('medios_emergencia', 'LLAMADA', 'Llamada telefónica', NULL, '#475569', 1),
      ('medios_emergencia', 'SALA_CRISIS', 'Sala de crisis', NULL, '#b91c1c', 2),
      ('medios_emergencia', 'CORREO', 'Correo electrónico', NULL, '#1d4ed8', 3),
      ('medios_emergencia', 'PRESENCIAL', 'Presencial', NULL, '#15803d', 4)
    ) c(catalogo, codigo, nombre, descripcion, color, orden)
   WHERE NOT EXISTS (SELECT 1 FROM cambio_catalogo_item x WHERE x.catalogo = c.catalogo);

  INSERT INTO cambio_modelo_estandar (codigo, nombre, descripcion, categoria_id, estado, version_modelo, propietario_id,
                                      vigencia_desde, entornos_permitidos, riesgo_fijo, autorizacion_automatica,
                                      lista_elegibilidad, contenido_prellenado, usuario_creacion, fecha_creacion)
  SELECT m.codigo, m.nombre, m.descripcion,
         (SELECT id_item FROM cambio_catalogo_item WHERE catalogo = 'categorias_cambio' AND codigo = m.categoria),
         'APROBADO', 1, v_gestor, (v_hoy - 210), '["produccion"]'::jsonb, 'bajo', true,
         m.elegibilidad::jsonb, m.prellenado::jsonb, v_gestor, v_ahora - INTERVAL '210 days'
    FROM (VALUES
      ('STD-PARCHES', 'Parches mensuales de Windows en equipos de usuario', 'Instalación de las actualizaciones acumulativas aprobadas del mes en los equipos de los colaboradores.', 'SEGURIDAD',
       '["Las actualizaciones fueron aprobadas en el grupo piloto la semana anterior", "Se aplican fuera del horario de oficina", "Existe respaldo de la consola de actualizaciones"]',
       '{"motivo": "Mantenimiento preventivo", "plan_implementacion": "Liberar las actualizaciones aprobadas en la consola y forzar la instalación con reinicio a las 21:00.", "plan_rollback": "Desinstalar la actualización problemática desde la consola y bloquearla.", "plan_pruebas": "Verificar en 10 equipos de muestra el inicio de sesión, el correo, el ERP y la impresión."}'),
      ('STD-REINICIO', 'Reinicio programado de un servidor de aplicaciones', 'Reinicio controlado para liberar memoria y aplicar configuraciones pendientes.', 'INFRA',
       '["El servidor tiene un nodo o una ventana sin usuarios", "Se avisó a los usuarios del servicio", "Hay un respaldo de configuración de menos de 24 horas"]',
       '{"motivo": "Mantenimiento preventivo", "plan_implementacion": "Detener el servicio, reiniciar el servidor y levantar el servicio en orden.", "plan_rollback": "Restaurar la instantánea de la máquina virtual tomada antes del reinicio.", "plan_pruebas": "Iniciar sesión en la aplicación y abrir tres pantallas de uso frecuente."}'),
      ('STD-WEB', 'Excepción de filtrado web para un sitio de proveedor', 'Permite en el firewall un sitio de un proveedor que el filtro web bloquea por categoría.', 'REDES',
       '["El sitio pertenece a un proveedor con contrato vigente", "La reputación del dominio es buena", "El jefe del área aprobó la solicitud"]',
       '{"motivo": "Requerimiento del negocio", "plan_implementacion": "Agregar el dominio a la lista de sitios permitidos del firewall perimetral.", "plan_rollback": "Eliminar el dominio de la lista de sitios permitidos.", "plan_pruebas": "Abrir el sitio desde un equipo del área solicitante."}'),
      ('STD-CARPETA', 'Carpeta compartida de área con permisos por grupo', 'Crea una carpeta en el servidor de archivos con permisos asignados a un grupo del directorio.', 'INFRA',
       '["El jefe del área aprobó la solicitud", "El grupo del directorio ya existe", "Hay espacio disponible en el volumen"]',
       '{"motivo": "Requerimiento del negocio", "plan_implementacion": "Crear la carpeta y asignar permisos de lectura y escritura al grupo del área.", "plan_rollback": "Quitar los permisos y eliminar la carpeta vacía.", "plan_pruebas": "Un usuario del grupo crea y abre un archivo de prueba."}')
    ) m(codigo, nombre, descripcion, categoria, elegibilidad, prellenado)
   WHERE NOT EXISTS (SELECT 1 FROM cambio_modelo_estandar x WHERE x.codigo = m.codigo);

  -- ========================================================================
  -- 2. FECHAS DE REFERENCIA
  -- ========================================================================
  v_sabado := v_hoy + ((6 - extract(isodow FROM v_hoy)::int + 7) % 7);
  IF v_sabado <= v_hoy + 1 THEN v_sabado := v_sabado + 7; END IF;          -- próximo sábado (al menos en 2 días)
  v_martes := v_hoy + ((2 - extract(isodow FROM v_hoy)::int + 7) % 7);
  IF v_martes <= v_hoy THEN v_martes := v_martes + 7; END IF;              -- próximo martes (reunión del CAB)
  v_reunion := ((v_hoy - ((extract(isodow FROM v_hoy)::int - 2 + 7) % 7)
                 - CASE WHEN extract(isodow FROM v_hoy) = 2 THEN 7 ELSE 0 END) + TIME '10:00') AT TIME ZONE 'America/Lima';
  v_cierre_mes := (date_trunc('month', v_hoy) + INTERVAL '1 month' - INTERVAL '3 days')::date;
  IF v_cierre_mes <= v_hoy + 2 THEN
    v_cierre_mes := (date_trunc('month', v_hoy) + INTERVAL '2 months' - INTERVAL '3 days')::date;
  END IF;

  SELECT t.id_ticket, t.fecha_creacion INTO v_mayor_tk, v_mayor_ini
    FROM ticket t JOIN ticket_incidente ti USING (id_ticket) JOIN elemento_configuracion ci ON ci.id_ci = t.id_ci
   WHERE ti.es_incidente_mayor AND ci.codigo_ci = 'CI-HOST-02' ORDER BY t.fecha_creacion LIMIT 1;

  -- Solicitud de excepción web ya atendida (la más larga, para que el cambio quepa en su atención)
  SELECT t.id_ticket, t.fecha_creacion, t.fecha_resolucion INTO v_sol_web, v_sol_web_ini, v_sol_web_fin
    FROM ticket t
   WHERE t.titulo = 'Desbloquear un sitio web de proveedor' AND t.fecha_resolucion IS NOT NULL
     AND t.fecha_resolucion - t.fecha_creacion >= INTERVAL '3 hours'
     AND NOT pg_temp.en_congelamiento((t.fecha_resolucion AT TIME ZONE 'America/Lima')::date)
   ORDER BY t.fecha_creacion DESC LIMIT 1;

  -- Solicitud de punto de red que se está atendiendo (si hoy hay alguna)
  SELECT t.id_ticket INTO v_sol_red
    FROM ticket t LEFT JOIN ticket_solicitud ts USING (id_ticket)
   WHERE t.titulo = 'Habilitar un punto de red' AND t.id_estado IN (1, 2, 3, 4)
     AND COALESCE(ts.estado_aprobacion, 'NO_APLICA') IN ('NO_APLICA', 'APROBADO')
   ORDER BY t.fecha_creacion DESC LIMIT 1;

  -- ========================================================================
  -- 3. LAS RFC
  -- ========================================================================
  CREATE TEMP TABLE _c (
    clave TEXT PRIMARY KEY, tipo TEXT, estado INTEGER, titulo TEXT, descripcion TEXT, justificacion TEXT,
    plan_impl TEXT, plan_rb TEXT, plan_pr TEXT, criterios TEXT, motivo TEXT, ci TEXT, imp INTEGER, urg INTEGER,
    creado TIMESTAMPTZ, v_ini TIMESTAMPTZ, v_fin TIMESTAMPTZ, cerrado TIMESTAMPTZ,
    solicitante INTEGER, responsable INTEGER, problema TEXT, incidente INTEGER, solicitud INTEGER,
    modelo TEXT, riesgo TEXT, interrupcion BOOLEAN DEFAULT false, servicio TEXT,
    pir TEXT, inducidos INTEGER DEFAULT 0, medio TEXT, just_urg TEXT,
    voto TEXT, voto_fecha TIMESTAMPTZ, voto_comentario TEXT,
    id_cambio INTEGER
  ) ON COMMIT DROP;

  -- 3.1 Wi-Fi del piso 3: firmware + 5 GHz · EN PLANIFICACIÓN
  INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                  creado, v_ini, v_fin, solicitante, responsable, problema, riesgo, interrupcion, servicio, voto, voto_fecha, voto_comentario)
  VALUES ('WIFI', 'NORMAL', 4, 'Actualizar el firmware y habilitar 5 GHz en el punto de acceso del piso 3',
          'Actualizar el firmware del punto de acceso del piso 3 a la versión 8.12 y habilitar la banda de 5 GHz para repartir la carga de clientes.',
          'Elimina la causa raíz de los cortes de Wi-Fi del piso 3 (problema PRB, error conocido publicado).',
          '1. Respaldar la configuración del punto de acceso. 2. Cargar el firmware 8.12 y reiniciar. 3. Habilitar la SSID FLOWDESK en 5 GHz y fijar el canal 36. 4. Verificar la conexión de los equipos del piso.',
          'Volver a cargar el firmware 8.10 y restaurar la configuración respaldada (15 minutos).',
          'Medir durante 2 días hábiles los reinicios de radio y la cantidad de clientes por banda.',
          'Cero reinicios de radio en 2 días hábiles y al menos 40 % de los clientes en 5 GHz.',
          'Solución de un problema', 'CI-AP-P3', 2, 2,
          v_reunion - INTERVAL '3 days', ((v_sabado + TIME '07:00') AT TIME ZONE 'America/Lima'), ((v_sabado + TIME '09:00') AT TIME ZONE 'America/Lima'),
          v_gestor, v_tec_redes, 'Cortes recurrentes de Wi-Fi en el piso 3', 'Medio', true, 'SRV-INC-RED-001',
          'APROBADO', v_reunion + INTERVAL '30 minutes', 'Aprobado. Ejecutar en sábado y avisar al piso 3 el viernes.');

  -- 3.2 ERP: índice por período y cierre fuera de horario · EVALUACIÓN CAB
  INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                  creado, v_ini, v_fin, solicitante, responsable, problema, riesgo, interrupcion, servicio)
  VALUES ('ERP', 'NORMAL', 2, 'Crear el índice por período y mover el cierre contable fuera del horario de oficina',
          'Crear un índice por período en la tabla de movimientos del ERP y programar el proceso de cierre a las 20:00.',
          'Elimina la causa raíz de la lentitud del ERP durante el cierre de mes (problema con causa raíz identificada).',
          '1. Crear el índice en línea en la base del ERP. 2. Reprogramar la tarea de cierre a las 20:00. 3. Ejecutar un cierre de prueba en el entorno de pruebas.',
          'Eliminar el índice y devolver la tarea de cierre a su horario anterior.',
          'Cierre completo en el entorno de pruebas con datos del mes anterior, midiendo el tiempo por pantalla.',
          'Menos de 3 segundos por pantalla durante el cierre de mes.',
          'Solución de un problema', 'CI-APP-ERP', 2, 3,
          v_ahora - INTERVAL '2 days', ((v_cierre_mes + TIME '20:00') AT TIME ZONE 'America/Lima'), ((v_cierre_mes + TIME '23:00') AT TIME ZONE 'America/Lima'),
          v_gestor, v_tec_sist, 'ERP financiero lento durante el cierre de mes', 'Medio', true, 'SRV-INC-SW-001');

  -- 3.3 Host 02: reemplazo de fuentes · EMERGENCIA, EXITOSO
  INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                  creado, v_ini, v_fin, cerrado, solicitante, responsable, problema, incidente, riesgo, interrupcion, servicio,
                  pir, medio, just_urg)
  VALUES ('FUENTES', 'EMERGENCIA', 6, 'Reemplazar las fuentes de poder del Host de virtualización 02',
          'Instalar dos fuentes de poder nuevas en el Host 02 tras la caída del servicio.',
          'El Host 02 opera sin redundancia: una nueva falla dejaría otra vez sin ERP ni intranet a toda la institución.',
          '1. Migrar las máquinas virtuales al Host 01. 2. Reemplazar las dos fuentes. 3. Encender el host, revisar la consola y devolver las máquinas virtuales.',
          'Mantener las máquinas virtuales en el Host 01 hasta tener fuentes de reemplazo operativas.',
          'Verificar ambas fuentes en verde en la consola y una prueba de desconexión de cada una.',
          'Host 02 con redundancia de energía y máquinas virtuales operando.',
          'Restablecimiento de un incidente', 'CI-HOST-02', 3, 3,
          v_mayor_ini + INTERVAL '3 hours', v_mayor_ini + INTERVAL '1 day 9 hours', v_mayor_ini + INTERVAL '1 day 11 hours',
          v_mayor_ini + INTERVAL '1 day 11 hours 10 minutes', v_gestor, v_tec_sist, 'Caída del Host de virtualización 02', v_mayor_tk,
          'Alto', true, 'SRV-INC-INF-001',
          'Se reemplazaron ambas fuentes dentro de la ventana y las pruebas de desconexión fueron correctas. Lección: tener fuentes de repuesto en almacén.',
          'Sala de crisis', 'Sin redundancia de energía, una nueva falla del Host 02 detiene el ERP y la intranet.');

  -- 3.4 Alertas de hardware al canal de guardia · EXITOSO
  INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                  creado, v_ini, v_fin, cerrado, solicitante, responsable, problema, riesgo, pir, voto, voto_fecha, voto_comentario)
  VALUES ('ALERTAS', 'NORMAL', 6, 'Enviar las alertas de hardware de los hosts al canal de guardia de Sistemas',
          'Redirigir las alertas de la consola de gestión de los hosts al canal de guardia y agregar una revisión mensual.',
          'Las alertas llegaban a un buzón que nadie revisaba: así pasó desapercibida la primera falla del Host 02.',
          '1. Configurar el envío de alertas al canal de guardia. 2. Generar una alerta de prueba. 3. Documentar la revisión mensual.',
          'Volver a la configuración de alertas anterior.',
          'Alerta de prueba recibida por los dos técnicos de guardia.',
          'Toda alerta de hardware llega al canal de guardia en menos de 5 minutos.',
          'Solución de un problema', 'CI-HOST-02', 2, 2,
          v_mayor_ini + INTERVAL '3 days', v_mayor_ini + INTERVAL '8 days 9 hours', v_mayor_ini + INTERVAL '8 days 10 hours',
          v_mayor_ini + INTERVAL '8 days 10 hours 5 minutes', v_gestor, v_tec_sist, 'Caída del Host de virtualización 02', 'Bajo',
          'Alerta de prueba recibida en 2 minutos por los dos técnicos de guardia. Sin efectos en el servicio.',
          'APROBADO', v_mayor_ini + INTERVAL '5 days', 'Aprobado: bajo riesgo y sin interrupción del servicio.');

  -- 3.5 Excepción web para un proveedor · ESTÁNDAR, desde una solicitud, EXITOSO
  IF v_sol_web IS NOT NULL THEN
    INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                    creado, v_ini, v_fin, cerrado, solicitante, responsable, solicitud, modelo, riesgo, pir)
    VALUES ('WEB', 'ESTANDAR', 6, 'Excepción de filtrado web para un sitio de proveedor',
            'Permitir en el firewall perimetral el portal del proveedor que pidió el área.',
            'Atiende la solicitud del área: el portal del proveedor está bloqueado por categoría.',
            'Agregar el dominio a la lista de sitios permitidos del firewall perimetral.',
            'Eliminar el dominio de la lista de sitios permitidos.',
            'Abrir el sitio desde un equipo del área solicitante.',
            'El sitio abre desde el área solicitante.',
            'Requerimiento del negocio', 'CI-FW-01', 1, 1,
            v_sol_web_ini + INTERVAL '20 minutes', v_sol_web_fin - INTERVAL '1 hour 30 minutes', v_sol_web_fin - INTERVAL '1 hour',
            v_sol_web_fin - INTERVAL '50 minutes', v_tec_redes, v_tec_redes, v_sol_web, 'STD-WEB', 'Bajo',
            'Cambio estándar sin incidencias.');
  END IF;

  -- 3.6 Puntos de red · NORMAL, APROBADO (desde la solicitud que se esté atendiendo, si hay)
  INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                  creado, v_ini, v_fin, solicitante, responsable, solicitud, riesgo, voto, voto_fecha, voto_comentario)
  VALUES ('RED', 'NORMAL', 3, 'Habilitar puntos de red nuevos en el switch del piso 2',
          'Configurar las bocas libres del switch del piso 2 en la VLAN de usuarios para los puntos de red solicitados.',
          CASE WHEN v_sol_red IS NOT NULL THEN 'Atiende la solicitud de habilitación de un punto de red.'
               ELSE 'Habilita los puntos de red de la nueva sala de reuniones del piso 2.' END,
          '1. Asignar las bocas libres a la VLAN de usuarios. 2. Activar la seguridad de puertos. 3. Probar con una laptop.',
          'Volver a desactivar las bocas configuradas.',
          'Conectar una laptop en cada punto y validar la dirección IP y la salida a internet.',
          'Cada punto entrega dirección IP de la VLAN de usuarios y sale a internet.',
          'Requerimiento del negocio', 'CI-SW-P2', 1, 2,
          v_reunion - INTERVAL '2 days', ((v_sabado + TIME '10:00') AT TIME ZONE 'America/Lima'), ((v_sabado + TIME '11:00') AT TIME ZONE 'America/Lima'),
          v_tec_redes, v_tec_redes, v_sol_red, 'Bajo',
          'APROBADO', v_reunion + INTERVAL '50 minutes', 'Aprobado. Coordinar el acceso al gabinete del piso 2.');

  -- 3.7 Parches mensuales · ESTÁNDAR (tres meses: exitoso con PIR, fallido, exitoso sin PIR)
  FOR r IN
    SELECT k, d - ((extract(isodow FROM d)::int - 2 + 7) % 7) AS martes
      FROM (SELECT k, (date_trunc('month', v_hoy) - (k * INTERVAL '1 month') + INTERVAL '13 days')::date AS d
              FROM generate_series(0, 5) k) x
     ORDER BY k
  LOOP
    CONTINUE WHEN r.martes >= v_hoy - 6;            -- solo ventanas ya pasadas (con al menos 6 días)
    CONTINUE WHEN pg_temp.en_congelamiento(r.martes);   -- ese mes no se parcha en congelamiento
    CONTINUE WHEN (SELECT COUNT(*) FROM _c WHERE modelo = 'STD-PARCHES') >= 3;
    v_n := (SELECT COUNT(*) FROM _c WHERE modelo = 'STD-PARCHES');
    INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                    creado, v_ini, v_fin, cerrado, solicitante, responsable, modelo, riesgo, pir, inducidos)
    VALUES ('PARCHES-' || v_n, 'ESTANDAR', CASE WHEN v_n = 1 THEN 7 ELSE 6 END,
            'Parches de Windows de ' || v_meses[extract(month FROM r.martes)::int] || ' ' || extract(year FROM r.martes)::int,
            'Actualizaciones acumulativas del mes en los equipos de los colaboradores.',
            'Corrige vulnerabilidades publicadas por el fabricante.',
            'Liberar las actualizaciones aprobadas en la consola y forzar la instalación con reinicio a las 21:00.',
            'Desinstalar la actualización problemática desde la consola y bloquearla.',
            'Verificar en 10 equipos de muestra el inicio de sesión, el correo, el ERP y la impresión.',
            'El 95 % de los equipos queda actualizado sin incidentes.',
            'Mantenimiento preventivo', NULL, 1, 1,
            ((r.martes - 5) + TIME '10:00') AT TIME ZONE 'America/Lima',
            (r.martes + TIME '21:00') AT TIME ZONE 'America/Lima', (r.martes + TIME '23:30') AT TIME ZONE 'America/Lima',
            ((r.martes + 1) + TIME '09:00') AT TIME ZONE 'America/Lima',
            v_gestor, v_tec_campo, 'STD-PARCHES', 'Bajo',
            CASE v_n WHEN 0 THEN NULL   -- el más reciente queda con la PIR pendiente
                     WHEN 1 THEN 'La actualización acumulativa rompió la impresión en 3 equipos; se desinstaló y se bloqueó hasta el parche corregido del fabricante.'
                     ELSE 'Sin incidencias: 97 % de los equipos actualizados en la ventana.' END,
            CASE WHEN v_n = 1 THEN 3 ELSE 0 END);
  END LOOP;

  -- 3.8 Reinicio del servidor del ERP · ESTÁNDAR, EN EJECUCIÓN ahora
  INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                  creado, v_ini, v_fin, solicitante, responsable, modelo, riesgo, interrupcion, servicio)
  VALUES ('REINICIO', 'ESTANDAR', 5, 'Reinicio programado del servidor de aplicaciones del ERP',
          'Reinicio controlado para liberar memoria y aplicar la configuración pendiente del servidor de aplicaciones.',
          'El consumo de memoria del servidor del ERP sube cada semana hasta degradar el servicio.',
          'Detener el servicio, reiniciar el servidor y levantar el servicio en orden.',
          'Restaurar la instantánea de la máquina virtual tomada antes del reinicio.',
          'Iniciar sesión en la aplicación y abrir tres pantallas de uso frecuente.',
          'El ERP responde con normalidad después del reinicio.',
          'Mantenimiento preventivo', 'CI-APP-ERP', 2, 1,
          v_ahora - INTERVAL '2 days', v_ahora - INTERVAL '20 minutes', v_ahora + INTERVAL '70 minutes',
          v_tec_sist, v_tec_sist, 'STD-REINICIO', 'Bajo', true, 'SRV-INC-SW-001');

  -- 3.9 Cliente VPN · NORMAL, FALLIDO con rollback
  INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                  creado, v_ini, v_fin, cerrado, solicitante, responsable, riesgo, pir, inducidos, voto, voto_fecha, voto_comentario)
  VALUES ('VPN', 'NORMAL', 7, 'Actualizar el cliente VPN de los equipos portátiles',
          'Distribuir la versión nueva del cliente VPN a todas las laptops.',
          'La versión actual del cliente VPN deja de tener soporte del fabricante.',
          'Distribuir el instalador por la consola de software en dos tandas.',
          'Reinstalar la versión anterior desde la consola de software.',
          'Probar la conexión desde 5 laptops fuera de la red.',
          'Todas las laptops se conectan con la versión nueva.',
          'Cumplimiento normativo o de seguridad', 'CI-FW-01', 2, 2,
          v_ahora - INTERVAL '52 days', ((v_hoy - 45) + TIME '20:00') AT TIME ZONE 'America/Lima', ((v_hoy - 45) + TIME '23:00') AT TIME ZONE 'America/Lima',
          ((v_hoy - 45) + TIME '23:20') AT TIME ZONE 'America/Lima', v_gestor, v_tec_redes, 'Medio',
          'Fallido: la versión nueva no conectaba con el perfil de doble factor y 4 usuarios reportaron que no podían trabajar desde casa. Se ejecutó el rollback en 40 minutos. Lección: probar con el perfil de doble factor antes de liberar.',
          4, 'APROBADO', v_ahora - INTERVAL '49 days', 'Aprobado con la condición de ejecutar en dos tandas.');

  -- 3.10 Migración del correo · NORMAL, RECHAZADO por el CAB
  INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                  creado, v_ini, v_fin, cerrado, solicitante, responsable, riesgo, interrupcion, servicio, voto, voto_fecha, voto_comentario)
  VALUES ('CORREO', 'NORMAL', 8, 'Migrar los buzones de correo al nuevo dominio institucional',
          'Mover todos los buzones al dominio nuevo en un solo fin de semana.',
          'Unificar la identidad institucional con el nuevo dominio.',
          'Migrar los buzones por lotes durante el fin de semana y cambiar los registros del dominio.',
          'Volver a apuntar los registros del dominio al servicio anterior.',
          'Probar envío y recepción con 20 buzones piloto.',
          'Todos los buzones reciben correo en el dominio nuevo el lunes.',
          'Mejora continua', 'CI-SVC-CORREO', 3, 1,
          v_ahora - INTERVAL '24 days', ((v_hoy - 14) + TIME '20:00') AT TIME ZONE 'America/Lima', ((v_hoy - 13) + TIME '06:00') AT TIME ZONE 'America/Lima',
          v_ahora - INTERVAL '20 days', v_gestor, v_tec_sist, 'Alto', true, NULL,
          'RECHAZADO', v_ahora - INTERVAL '20 days', 'Rechazado: migrar todo en un fin de semana es muy riesgoso. Presentar una migración por áreas con piloto.');

  -- 3.11 Switch del piso 1 · NORMAL, REGISTRADO (sin evaluar)
  INSERT INTO _c (clave, tipo, estado, titulo, descripcion, justificacion, plan_impl, plan_rb, plan_pr, criterios, motivo, ci, imp, urg,
                  creado, v_ini, v_fin, solicitante, responsable, riesgo, interrupcion, servicio)
  VALUES ('SWITCH', 'NORMAL', 1, 'Renovar el switch de acceso del piso 1',
          'Reemplazar el switch del piso 1, que llegó al fin de su soporte.',
          'El equipo dejó de recibir actualizaciones de seguridad del fabricante.',
          'Preconfigurar el switch nuevo, cambiarlo en el gabinete y mover los cables uno a uno.',
          'Reinstalar el switch anterior con su configuración respaldada.',
          'Probar cada punto de red del piso 1 después del cambio.',
          'Todos los puntos del piso 1 operan en el switch nuevo.',
          'Mantenimiento preventivo', 'CI-SW-P1', 2, 1,
          v_ahora - INTERVAL '1 day', ((v_sabado + 14 + TIME '07:00') AT TIME ZONE 'America/Lima'), ((v_sabado + 14 + TIME '12:00') AT TIME ZONE 'America/Lima'),
          v_gestor, NULL, 'Medio', true, 'SRV-INC-RED-001');

  -- 3.12 Ningún cambio normal o estándar dentro de un congelamiento: las
  --      ventanas futuras pasan a la semana siguiente y las ya cerradas se
  --      mueven a una semana libre (toda su historia se mueve con ellas).
  FOR r IN SELECT clave FROM _c WHERE tipo <> 'EMERGENCIA' AND clave <> 'REINICIO' LOOP
    FOR v_vuelta IN 1..12 LOOP
      EXIT WHEN NOT EXISTS (SELECT 1 FROM _c c WHERE c.clave = r.clave
                              AND (pg_temp.en_congelamiento((c.v_ini AT TIME ZONE 'America/Lima')::date)
                                   OR pg_temp.en_congelamiento((c.v_fin AT TIME ZONE 'America/Lima')::date)));
      UPDATE _c c SET
        v_ini = v_ini + d.delta, v_fin = v_fin + d.delta,
        creado = CASE WHEN c.estado IN (1, 2, 3, 4) THEN creado ELSE creado + d.delta END,
        cerrado = cerrado + d.delta,
        voto_fecha = CASE WHEN c.estado IN (1, 2, 3, 4) THEN voto_fecha ELSE voto_fecha + d.delta END
        FROM (SELECT CASE WHEN x.estado IN (1, 2, 3, 4) OR x.cerrado + INTERVAL '7 days' < v_ahora - INTERVAL '1 day'
                          THEN INTERVAL '7 days' ELSE INTERVAL '-7 days' END AS delta
                FROM _c x WHERE x.clave = r.clave) d
       WHERE c.clave = r.clave;
    END LOOP;
  END LOOP;

  -- 3.13 Registro de las RFC (códigos en orden cronológico, como la app)
  INSERT INTO cambio (codigo_cambio, titulo, descripcion, tipo_cambio, id_impacto, id_urgencia, id_prioridad, id_estado,
                      justificacion, plan_implementacion, plan_rollback, plan_pruebas, ventana_inicio, ventana_fin,
                      id_ci_afectado, id_problema_origen, id_incidente_origen, id_solicitud_origen,
                      id_usuario_solicitante, id_usuario_responsable, resultado_pir, incidentes_inducidos,
                      usuario_creacion, fecha_creacion, usuario_modificacion, fecha_modificacion, campos_adicionales)
  SELECT 'TMP-' || c.clave, c.titulo, c.descripcion, c.tipo,
         (SELECT id_impacto FROM impacto_ticket WHERE nivel = c.imp),
         (SELECT id_urgencia FROM urgencia_ticket WHERE nivel = c.urg),
         CASE WHEN c.tipo = 'ESTANDAR' THEN (SELECT id_prioridad FROM prioridad_ticket WHERE codigo = 'P4')
              WHEN c.tipo = 'EMERGENCIA' THEN (SELECT id_prioridad FROM prioridad_ticket WHERE codigo = 'P1')
              ELSE (SELECT id_prioridad FROM prioridad_ticket WHERE codigo =
                      CASE WHEN c.imp + c.urg >= 6 THEN 'P1' WHEN c.imp + c.urg = 5 THEN 'P2'
                           WHEN c.imp + c.urg = 4 THEN 'P3' ELSE 'P4' END) END,
         c.estado, c.justificacion, c.plan_impl, c.plan_rb, c.plan_pr, c.v_ini, c.v_fin,
         ci.id_ci, p.id_problema, c.incidente, c.solicitud,
         c.solicitante, c.responsable,
         CASE WHEN c.estado IN (6, 7) THEN c.pir END,
         CASE WHEN c.estado IN (6, 7) THEN c.inducidos ELSE 0 END,
         c.solicitante, c.creado, COALESCE(c.responsable, c.solicitante),
         COALESCE(c.cerrado, c.voto_fecha, c.creado),
         jsonb_build_object(
           'motivo_cambio', c.motivo, 'entorno', 'Producción', 'criterios_exito', c.criterios,
           'requiere_interrupcion', c.interrupcion,
           'id_servicio_afectado', s.id_servicio, 'servicio_afectado_nombre', s.nombre,
           'id_modelo_estandar', m.id_modelo,
           'checklist_elegibilidad', CASE WHEN m.id_modelo IS NOT NULL
                                          THEN (SELECT jsonb_object_agg(i - 1, true) FROM generate_series(1, jsonb_array_length(m.lista_elegibilidad)) i) END,
           'medio_autorizacion_emergencia', c.medio,
           'id_usuario_autorizador_emergencia', CASE WHEN c.tipo = 'EMERGENCIA' THEN v_autorizador END,
           'autorizador_emergencia_nombre', CASE WHEN c.tipo = 'EMERGENCIA' THEN
                                                (SELECT TRIM(CONCAT(nombres, ' ', apellido_paterno)) FROM usuario WHERE id_usuario = v_autorizador) END,
           'justificacion_urgencia', c.just_urg,
           'nivel_riesgo', c.riesgo, 'evidencias', NULL)
    FROM _c c
    LEFT JOIN elemento_configuracion ci ON ci.codigo_ci = c.ci
    LEFT JOIN problema p ON p.titulo = c.problema
    LEFT JOIN servicio_catalogo s ON s.codigo_servicio = c.servicio
    LEFT JOIN cambio_modelo_estandar m ON m.codigo = c.modelo;

  UPDATE _c c SET id_cambio = x.id_cambio FROM cambio x WHERE x.codigo_cambio = 'TMP-' || c.clave;

  UPDATE cambio x SET codigo_cambio = y.codigo
    FROM (SELECT id_cambio, 'RFC-' || to_char(fecha_creacion AT TIME ZONE 'America/Lima', 'YYYY') || '-' ||
                 lpad(row_number() OVER (PARTITION BY to_char(fecha_creacion AT TIME ZONE 'America/Lima', 'YYYY')
                                         ORDER BY fecha_creacion)::text, 4, '0') AS codigo
            FROM cambio) y
   WHERE y.id_cambio = x.id_cambio;

  -- ========================================================================
  -- 4. AUTORIZACIONES, CAB, ENTERADOS, CMDB Y SOLICITUDES
  -- ========================================================================
  -- Votos del CAB: el quórum de Aprobadores CAB vota igual (nunca el solicitante ni el responsable)
  INSERT INTO cambio_aprobacion (id_cambio, id_usuario_aprobador, decision, comentario, fecha_decision)
  SELECT c.id_cambio, v.id_usuario, c.voto, c.voto_comentario, c.voto_fecha + (v.n - 1) * INTERVAL '25 minutes'
    FROM _c c
    CROSS JOIN LATERAL (
      SELECT u AS id_usuario, row_number() OVER (ORDER BY u) AS n
        FROM unnest(v_votantes) u
       WHERE u <> c.solicitante AND u IS DISTINCT FROM c.responsable
       LIMIT v_quorum) v
   WHERE c.voto IS NOT NULL;

  -- Si ningún Aprobador CAB podía votar una RFC, la decisión la registra un Administrador
  INSERT INTO cambio_aprobacion (id_cambio, id_usuario_aprobador, decision, comentario, fecha_decision)
  SELECT c.id_cambio, a.id_usuario, c.voto, c.voto_comentario, c.voto_fecha
    FROM _c c
    CROSS JOIN LATERAL (
      SELECT up.id_usuario FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
       WHERE up.id_perfil = 1 AND up.estado_registro AND u.estado_registro
         AND up.id_usuario <> c.solicitante AND up.id_usuario IS DISTINCT FROM c.responsable
       ORDER BY up.id_usuario LIMIT 1) a
   WHERE c.voto IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM cambio_aprobacion x WHERE x.id_cambio = c.id_cambio);

  -- Dictamen del ECAB para la emergencia
  INSERT INTO ecab_decision (id_cambio, decision, condiciones, plazo_horas, revision_retroactiva, id_aprobador, fecha_decision)
  SELECT c.id_cambio, 'APROBADO', 'Ejecutar con las máquinas virtuales ya migradas al Host 01 y regularizar la documentación en 48 horas.',
         48, true, v_autorizador, c.creado + INTERVAL '30 minutes'
    FROM _c c WHERE c.tipo = 'EMERGENCIA';

  -- Reuniones del CAB: una realizada (aprobó los cambios recientes) y la próxima
  INSERT INTO cab_reunion (titulo, fecha_reunion, tipo, estado, agenda, acta, id_convocante, fecha_creacion)
  SELECT 'Comité de cambios semanal', v_reunion, 'ORDINARIA', 'REALIZADA',
         (SELECT jsonb_agg(jsonb_build_object('id_cambio', x.id_cambio, 'codigo_cambio', x.codigo_cambio, 'titulo', x.titulo) ORDER BY x.codigo_cambio)
            FROM cambio x JOIN _c c ON c.id_cambio = x.id_cambio WHERE c.clave IN ('WIFI', 'RED')),
         'Se aprobaron el firmware del Wi-Fi del piso 3 (ejecutar en sábado) y los puntos de red del piso 2. Sin observaciones pendientes.',
         v_gestor, v_reunion - INTERVAL '4 days';
  INSERT INTO cab_reunion (titulo, fecha_reunion, tipo, estado, agenda, id_convocante, fecha_creacion)
  SELECT 'Comité de cambios semanal', (v_martes + TIME '10:00') AT TIME ZONE 'America/Lima', 'ORDINARIA', 'PROGRAMADA',
         (SELECT jsonb_agg(jsonb_build_object('id_cambio', x.id_cambio, 'codigo_cambio', x.codigo_cambio, 'titulo', x.titulo) ORDER BY x.codigo_cambio)
            FROM cambio x JOIN _c c ON c.id_cambio = x.id_cambio WHERE c.clave IN ('ERP')),
         v_gestor, v_ahora - INTERVAL '1 day';

  -- Si el reinicio de hoy cae en un congelamiento, queda con su excepción autorizada
  INSERT INTO cambio_excepcion (id_cambio, tipo, motivo, id_usuario_autoriza, fecha_creacion)
  SELECT c.id_cambio, 'CONGELAMIENTO',
         'Reinicio necesario para evitar la degradación del ERP; sin impacto en los procesos del período congelado.',
         v_gestor, c.creado + INTERVAL '1 hour'
    FROM _c c
   WHERE c.clave = 'REINICIO' AND pg_temp.en_congelamiento(v_hoy);

  -- Los técnicos del grupo confirman que están enterados de los cambios programados
  INSERT INTO cambio_enterado (id_cambio, id_usuario, fecha_enterado, observacion)
  SELECT c.id_cambio, td.id_usuario, LEAST(c.voto_fecha + INTERVAL '3 hours', v_ahora - INTERVAL '1 hour'), 'Enterado. Disponible para la ventana.'
    FROM _c c
    JOIN departamento_ti d ON d.codigo = 'DEP-REDES'
    JOIN tecnico_detalle td ON td.id_departamento = d.id_departamento AND td.estado_registro
    JOIN usuario u ON u.id_usuario = td.id_usuario AND u.estado_registro
   WHERE c.clave IN ('WIFI', 'RED')
  ON CONFLICT DO NOTHING;

  -- CMDB: cada cambio exitoso con CI deja su actualización aplicada
  INSERT INTO cmdb_actualizacion (id_cambio, id_ci, tipo_operacion, detalle, estado, id_usuario_aplica, fecha_creacion, fecha_aplicacion)
  SELECT x.id_cambio, x.id_ci_afectado, 'CAMBIO_APLICADO', 'RFC ' || x.codigo_cambio || ': ' || x.titulo, 'APLICADO',
         x.id_usuario_responsable, x.ventana_fin, x.ventana_fin
    FROM cambio x JOIN _c c ON c.id_cambio = x.id_cambio
   WHERE x.id_estado = 6 AND x.id_ci_afectado IS NOT NULL;

  -- Las solicitudes de origen dejan constancia de su RFC (igual que la app)
  INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno, fecha_creacion)
  SELECT x.id_solicitud_origen, x.id_usuario_solicitante,
         'Se registró la solicitud de cambio ' || x.codigo_cambio || ' para atender esta solicitud. Su avance se sigue en Gestión de Cambios.',
         false, x.fecha_creacion
    FROM cambio x JOIN _c c ON c.id_cambio = x.id_cambio
   WHERE x.id_solicitud_origen IS NOT NULL;

  -- Uso de los modelos estándar
  UPDATE cambio_modelo_estandar m
     SET veces_usado = u.usados, veces_exitoso = u.exitosos, veces_fallido = u.fallidos, ultimo_uso = u.ultimo
    FROM (SELECT (x.campos_adicionales ->> 'id_modelo_estandar')::int AS id_modelo,
                 COUNT(*) AS usados, COUNT(*) FILTER (WHERE x.id_estado = 6) AS exitosos,
                 COUNT(*) FILTER (WHERE x.id_estado = 7) AS fallidos, MAX(x.ventana_inicio) AS ultimo
            FROM cambio x WHERE x.campos_adicionales ->> 'id_modelo_estandar' IS NOT NULL GROUP BY 1) u
   WHERE m.id_modelo = u.id_modelo;

  -- ========================================================================
  -- 5. VALIDACIÓN FINAL: si algo no cuadra, se revierte todo
  -- ========================================================================
  IF EXISTS (SELECT 1 FROM generate_series(1, 8) e WHERE NOT EXISTS (SELECT 1 FROM cambio x WHERE x.id_estado = e)) THEN
    v_problemas := v_problemas || ' · no se cubren los 8 estados';
  END IF;
  IF (SELECT COUNT(DISTINCT tipo_cambio) FROM cambio) <> 3 THEN
    v_problemas := v_problemas || ' · faltan tipos de cambio';
  END IF;
  IF EXISTS (SELECT 1 FROM cambio WHERE codigo_cambio LIKE 'TMP-%' OR id_prioridad IS NULL OR id_impacto IS NULL) THEN
    v_problemas := v_problemas || ' · RFC sin código, prioridad o impacto';
  END IF;
  IF EXISTS (SELECT 1 FROM cambio WHERE ventana_fin <= ventana_inicio OR fecha_creacion > v_ahora
               OR fecha_modificacion < fecha_creacion OR fecha_modificacion > v_ahora) THEN
    v_problemas := v_problemas || ' · fechas de RFC fuera de orden';
  END IF;
  IF EXISTS (SELECT 1 FROM cambio WHERE id_estado IN (6, 7) AND ventana_fin > v_ahora) THEN
    v_problemas := v_problemas || ' · cambios cerrados con la ventana en el futuro';
  END IF;
  IF EXISTS (SELECT 1 FROM cambio WHERE id_estado IN (3, 4) AND ventana_inicio <= v_ahora) THEN
    v_problemas := v_problemas || ' · cambios aprobados o programados con la ventana ya pasada';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM cambio WHERE id_estado = 5 AND v_ahora BETWEEN ventana_inicio AND ventana_fin) THEN
    v_problemas := v_problemas || ' · el cambio en ejecución no está dentro de su ventana';
  END IF;
  IF EXISTS (SELECT 1 FROM cambio WHERE tipo_cambio = 'EMERGENCIA' AND id_incidente_origen IS NULL) THEN
    v_problemas := v_problemas || ' · emergencia sin incidente de origen';
  END IF;
  IF EXISTS (SELECT 1 FROM cambio WHERE tipo_cambio = 'EMERGENCIA'
               AND NOT EXISTS (SELECT 1 FROM ecab_decision e WHERE e.id_cambio = cambio.id_cambio)) THEN
    v_problemas := v_problemas || ' · emergencia sin dictamen del ECAB';
  END IF;
  IF EXISTS (SELECT 1 FROM cambio x JOIN cambio_aprobacion a USING (id_cambio)
              WHERE a.id_usuario_aprobador IN (x.id_usuario_solicitante, x.id_usuario_responsable)) THEN
    v_problemas := v_problemas || ' · votos del solicitante o del responsable (segregación de funciones)';
  END IF;
  IF EXISTS (SELECT 1 FROM cambio x JOIN ticket t ON t.id_ticket = x.id_solicitud_origen
               JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket WHERE tt.codigo <> 'SOLICITUD') THEN
    v_problemas := v_problemas || ' · solicitud de origen que no es una solicitud';
  END IF;
  IF EXISTS (SELECT 1 FROM cambio x WHERE x.tipo_cambio <> 'EMERGENCIA' AND x.id_estado <> 8
               AND (pg_temp.en_congelamiento((x.ventana_inicio AT TIME ZONE 'America/Lima')::date)
                    OR pg_temp.en_congelamiento((x.ventana_fin AT TIME ZONE 'America/Lima')::date))
               AND NOT EXISTS (SELECT 1 FROM cambio_excepcion e WHERE e.id_cambio = x.id_cambio AND e.tipo = 'CONGELAMIENTO')) THEN
    v_problemas := v_problemas || ' · cambios dentro de un período de congelamiento';
  END IF;
  IF (SELECT COUNT(*) FROM cambio WHERE id_problema_origen IS NOT NULL) < 4 THEN
    v_problemas := v_problemas || ' · faltan los cambios que nacen de problemas';
  END IF;

  IF v_problemas <> '' THEN
    RAISE EXCEPTION 'La carga no cuadra y se revirtió:%', v_problemas;
  END IF;

  RAISE NOTICE 'Carga completa: % RFC, % votos del CAB, % reuniones del CAB, % modelos estándar.',
    (SELECT COUNT(*) FROM cambio), (SELECT COUNT(*) FROM cambio_aprobacion),
    (SELECT COUNT(*) FROM cab_reunion), (SELECT COUNT(*) FROM cambio_modelo_estandar);
END $$;

-- Resumen ----------------------------------------------------------------------
SELECT x.codigo_cambio, x.tipo_cambio,
       CASE x.id_estado WHEN 1 THEN 'Registrado' WHEN 2 THEN 'Evaluación CAB' WHEN 3 THEN 'Aprobado'
                        WHEN 4 THEN 'En planificación' WHEN 5 THEN 'En ejecución' WHEN 6 THEN 'Exitoso'
                        WHEN 7 THEN 'Fallido' WHEN 8 THEN 'Cancelado' END AS estado,
       x.titulo,
       COALESCE(p.codigo_problema, ti.codigo_ticket, ts.codigo_ticket, '—') AS origen,
       to_char(x.ventana_inicio AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI') AS ventana
  FROM cambio x
  LEFT JOIN problema p ON p.id_problema = x.id_problema_origen
  LEFT JOIN ticket ti ON ti.id_ticket = x.id_incidente_origen
  LEFT JOIN ticket ts ON ts.id_ticket = x.id_solicitud_origen
 ORDER BY x.codigo_cambio;
