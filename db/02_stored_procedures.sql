-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS, FUNCIONES Y TRIGGERS DE FLOWDESK ITSM v2.0
-- Motor: PostgreSQL (Supabase / Local)
-- Estándar: ITIL v4 / ISO 20000 / OWASP API Security
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FUNCIÓN MATRIZ ITIL: fn_calcular_prioridad_itil
-- Calcula el código de prioridad (P1, P2, P3, P4) según la matriz Impacto x Urgencia
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calcular_prioridad_itil(p_impacto INT, p_urgencia INT)
RETURNS VARCHAR(10) AS $$
DECLARE
    v_imp_nivel INT;
    v_urg_nivel INT;
BEGIN
    SELECT nivel INTO v_imp_nivel FROM impacto_ticket WHERE id_impacto = p_impacto;
    SELECT nivel INTO v_urg_nivel FROM urgencia_ticket WHERE id_urgencia = p_urgencia;
    
    IF v_imp_nivel IS NULL THEN v_imp_nivel := 1; END IF;
    IF v_urg_nivel IS NULL THEN v_urg_nivel := 1; END IF;

    -- Matriz ITIL: 3=Alto, 2=Medio, 1=Bajo
    IF v_imp_nivel = 3 AND v_urg_nivel = 3 THEN
        RETURN 'P1';
    ELSIF (v_imp_nivel = 3 AND v_urg_nivel = 2) OR (v_imp_nivel = 2 AND v_urg_nivel = 3) THEN
        RETURN 'P2';
    ELSIF (v_imp_nivel = 3 AND v_urg_nivel = 1) OR (v_imp_nivel = 2 AND v_urg_nivel = 2) OR (v_imp_nivel = 1 AND v_urg_nivel = 3) THEN
        RETURN 'P3';
    ELSE
        RETURN 'P4';
    END IF;
END;
$$ LANGUAGE plpgsql;


-- ----------------------------------------------------------------------------
-- 2. PROCEDIMIENTO ALMACENADO: sp_crear_ticket
-- Centraliza generación de correlativo (INC-YYYY-XXXX / SOL-YYYY-XXXX), cálculo de SLA,
-- compuertas de aprobación, inserción atómica e historial de auditoría.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_crear_ticket(
    p_titulo VARCHAR,
    p_descripcion TEXT,
    p_id_tipo_ticket INT,
    p_id_categoria INT,
    p_id_servicio INT,
    p_id_impacto INT,
    p_id_urgencia INT,
    p_canal_comunicacion VARCHAR,
    p_id_solicitante INT,
    p_id_asignado INT,
    p_id_departamento INT,
    p_id_ci INT,
    p_campos_adicionales JSONB,
    p_usuario_creacion INT
)
RETURNS TABLE (
    id_ticket INT,
    codigo_ticket VARCHAR,
    id_prioridad INT,
    id_estado INT,
    estado_aprobacion VARCHAR,
    fecha_limite_sla TIMESTAMPTZ,
    fecha_limite_respuesta_sla TIMESTAMPTZ
) AS $$
DECLARE
    v_prefijo VARCHAR(10);
    v_anio VARCHAR(4);
    v_max_correlativo INT;
    v_nuevo_codigo VARCHAR(30);
    v_codigo_prio VARCHAR(10);
    v_id_prio INT;
    v_horas_resolucion INT;
    v_horas_respuesta INT;
    v_sla_resolucion_serv INT;
    v_sla_resp_serv INT;
    v_req_aprob BOOLEAN := false;
    v_id_depto_resolutor INT;
    v_id_depto_empresa INT;
    v_estado_aprob VARCHAR(30) := 'NO_APLICA';
    v_id_paso_inicial INT := NULL;
    v_id_estado_inicial INT;
    v_fecha_limite TIMESTAMPTZ;
    v_fecha_limite_resp TIMESTAMPTZ;
    v_nuevo_id INT;
    v_comentario_inicial TEXT;
BEGIN
    -- Validar tipo de ticket
    SELECT prefijo_codigo INTO v_prefijo FROM tipo_ticket WHERE id_tipo_ticket = p_id_tipo_ticket;
    IF v_prefijo IS NULL THEN
        RAISE EXCEPTION 'Tipo de ticket inválido: %', p_id_tipo_ticket;
    END IF;

    -- Generar correlativo atómico por tipo y año
    v_anio := TO_CHAR(now(), 'YYYY');
    SELECT COALESCE(MAX(
        NULLIF(SUBSTRING(t.codigo_ticket FROM '[0-9]+$'), '')::INT
    ), 0) + 1
    INTO v_max_correlativo
    FROM ticket t
    WHERE t.id_tipo_ticket = p_id_tipo_ticket
      AND t.codigo_ticket LIKE v_prefijo || '-' || v_anio || '-%';

    v_nuevo_codigo := v_prefijo || '-' || v_anio || '-' || LPAD(v_max_correlativo::TEXT, 4, '0');

    -- Calcular prioridad ITIL y obtener tiempos SLA base
    v_codigo_prio := fn_calcular_prioridad_itil(p_id_impacto, p_id_urgencia);
    SELECT pt.id_prioridad, pt.tiempo_resolucion_horas, pt.tiempo_primera_respuesta_hrs
    INTO v_id_prio, v_horas_resolucion, v_horas_respuesta
    FROM prioridad_ticket pt
    WHERE pt.codigo = v_codigo_prio;

    -- Si se vincula a un catálogo de servicios, heredar sus SLAs y compuertas de aprobación
    IF p_id_servicio IS NOT NULL THEN
        SELECT s.sla_horas_resolucion, s.sla_horas_respuesta, s.requiere_aprobacion, s.id_departamento_resolutor
        INTO v_sla_resolucion_serv, v_sla_resp_serv, v_req_aprob, v_id_depto_resolutor
        FROM servicio_catalogo s
        WHERE s.id_servicio = p_id_servicio AND s.estado_registro = true;

        IF v_sla_resolucion_serv IS NOT NULL AND v_sla_resolucion_serv > 0 THEN
            v_horas_resolucion := v_sla_resolucion_serv;
        END IF;
        IF v_sla_resp_serv IS NOT NULL AND v_sla_resp_serv > 0 THEN
            v_horas_respuesta := v_sla_resp_serv;
        END IF;

        IF p_id_tipo_ticket = 2 AND v_req_aprob = true THEN
            v_estado_aprob := 'PENDIENTE_APROBACION';
            SELECT swp.id_paso INTO v_id_paso_inicial
            FROM servicio_workflow_paso swp
            WHERE swp.id_servicio = p_id_servicio AND swp.estado_registro = true
            ORDER BY swp.orden ASC LIMIT 1;
        END IF;
    END IF;

    -- Determinar departamento resolutor y de la empresa
    IF v_id_depto_resolutor IS NULL THEN
        v_id_depto_resolutor := COALESCE(p_id_departamento, 1);
    END IF;

    SELECT u.id_departamento_empresa INTO v_id_depto_empresa
    FROM usuario u WHERE u.id_usuario = p_id_solicitante;

    -- Calcular fechas SLA
    v_fecha_limite := now() + (v_horas_resolucion || ' hours')::INTERVAL;
    v_fecha_limite_resp := now() + (v_horas_respuesta || ' hours')::INTERVAL;

    -- Estado inicial: 2 (Asignado) si tiene técnico, 1 (Abierto) si entra en cola
    IF p_id_asignado IS NOT NULL THEN
        v_id_estado_inicial := 2;
    ELSE
        v_id_estado_inicial := 1;
    END IF;

    -- Inserción del Ticket
    INSERT INTO ticket (
        codigo_ticket, titulo, descripcion, id_tipo_ticket, id_categoria,
        id_servicio, id_departamento, id_departamento_empresa, canal_comunicacion,
        id_impacto, id_urgencia, id_prioridad, id_estado,
        id_usuario_solicitante, id_usuario_asignado,
        fecha_limite_sla, fecha_limite_respuesta_sla,
        usuario_creacion, campos_adicionales, id_ci
    ) VALUES (
        v_nuevo_codigo, p_titulo, p_descripcion, p_id_tipo_ticket, p_id_categoria,
        p_id_servicio, v_id_depto_resolutor, v_id_depto_empresa, COALESCE(p_canal_comunicacion, 'PORTAL_WEB'),
        p_id_impacto, p_id_urgencia, v_id_prio, v_id_estado_inicial,
        p_id_solicitante, p_id_asignado,
        v_fecha_limite, v_fecha_limite_resp,
        p_usuario_creacion, COALESCE(p_campos_adicionales, '{}'::jsonb), p_id_ci
    ) RETURNING ticket.id_ticket INTO v_nuevo_id;

    -- Actualizar subtipo de solicitud (si aplica)
    IF p_id_tipo_ticket = 2 THEN
        UPDATE ticket_solicitud
        SET estado_aprobacion = v_estado_aprob,
            id_paso_actual = v_id_paso_inicial
        WHERE ticket_solicitud.id_ticket = v_nuevo_id;
    END IF;

    -- Registro en bitácora de auditoría
    v_comentario_inicial := 'Ticket ' || v_nuevo_codigo || ' registrado en Service Desk mediante Stored Procedure.';
    IF v_estado_aprob = 'PENDIENTE_APROBACION' THEN
        v_comentario_inicial := v_comentario_inicial || ' Sujeto a compuerta de aprobación.';
    END IF;

    INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno)
    VALUES (v_nuevo_id, p_usuario_creacion, v_comentario_inicial, false);

    RETURN QUERY SELECT
        v_nuevo_id,
        v_nuevo_codigo,
        v_id_prio,
        v_id_estado_inicial,
        v_estado_aprob,
        v_fecha_limite,
        v_fecha_limite_resp;
END;
$$ LANGUAGE plpgsql;


-- ----------------------------------------------------------------------------
-- 3. PROCEDIMIENTO ALMACENADO: sp_resolver_aprobacion_ticket
-- Procesa el dictamen de un Gestor/Aprobador (APROBADO / RECHAZADO)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_resolver_aprobacion_ticket(
    p_id_ticket INT,
    p_id_usuario_aprobador INT,
    p_decision VARCHAR,
    p_comentario TEXT
)
RETURNS TABLE (
    id_ticket INT,
    nuevo_estado_ticket INT,
    nuevo_estado_aprobacion VARCHAR,
    mensaje TEXT
) AS $$
DECLARE
    v_estado_actual INT;
    v_tipo INT;
    v_nombre_aprobador VARCHAR;
    v_nuevo_estado INT;
    v_nuevo_aprob VARCHAR(30);
    v_nota TEXT;
BEGIN
    SELECT t.id_estado, t.id_tipo_ticket, CONCAT(u.nombres, ' ', u.apellido_paterno)
    INTO v_estado_actual, v_tipo, v_nombre_aprobador
    FROM ticket t
    JOIN usuario u ON u.id_usuario = p_id_usuario_aprobador
    WHERE t.id_ticket = p_id_ticket;

    IF v_estado_actual IS NULL THEN
        RAISE EXCEPTION 'Ticket % no encontrado', p_id_ticket;
    END IF;

    IF p_decision NOT IN ('APROBADO', 'RECHAZADO') THEN
        RAISE EXCEPTION 'Decisión inválida: %. Debe ser APROBADO o RECHAZADO', p_decision;
    END IF;

    -- Registrar en tabla de auditoría ticket_aprobacion
    INSERT INTO ticket_aprobacion (
        id_ticket, id_usuario_aprobador, estado_decision, comentario, fecha_decision
    ) VALUES (
        p_id_ticket, p_id_usuario_aprobador, p_decision, p_comentario, now()
    );

    IF p_decision = 'RECHAZADO' THEN
        v_nuevo_estado := 7; -- Cancelado
        v_nuevo_aprob := 'RECHAZADO';
        v_nota := 'Compuerta de aprobación RECHAZADA por ' || v_nombre_aprobador || '.';
        IF p_comentario IS NOT NULL AND length(trim(p_comentario)) > 0 THEN
            v_nota := v_nota || ' Motivo: ' || trim(p_comentario);
        END IF;

        UPDATE ticket
        SET id_estado = v_nuevo_estado,
            motivo_cancelacion = v_nota,
            usuario_modificacion = p_id_usuario_aprobador,
            fecha_modificacion = now()
        WHERE ticket.id_ticket = p_id_ticket;
    ELSE
        v_nuevo_estado := 2; -- Asignado
        v_nuevo_aprob := 'APROBADO';
        v_nota := 'Compuerta de aprobación APROBADA por ' || v_nombre_aprobador || '.';
        IF p_comentario IS NOT NULL AND length(trim(p_comentario)) > 0 THEN
            v_nota := v_nota || ' Observación: ' || trim(p_comentario);
        END IF;

        UPDATE ticket
        SET id_estado = v_nuevo_estado,
            usuario_modificacion = p_id_usuario_aprobador,
            fecha_modificacion = now()
        WHERE ticket.id_ticket = p_id_ticket;
    END IF;

    UPDATE ticket_solicitud
    SET estado_aprobacion = v_nuevo_aprob
    WHERE ticket_solicitud.id_ticket = p_id_ticket;

    INSERT INTO comentario_ticket (
        id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado
    ) VALUES (
        p_id_ticket, p_id_usuario_aprobador, v_nota, false, v_nuevo_estado
    );

    RETURN QUERY SELECT
        p_id_ticket,
        v_nuevo_estado,
        v_nuevo_aprob,
        v_nota;
END;
$$ LANGUAGE plpgsql;


-- ----------------------------------------------------------------------------
-- 4. PROCEDIMIENTO ALMACENADO: sp_cambiar_estado_ticket
-- Maneja transiciones de estado, cálculo de pausas de SLA en minutos y cumplimiento
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_cambiar_estado_ticket(
    p_id_ticket INT,
    p_id_nuevo_estado INT,
    p_id_usuario INT,
    p_solucion TEXT,
    p_motivo_cancelacion TEXT,
    p_id_motivo_espera INT,
    p_comentario TEXT
)
RETURNS TABLE (
    id_ticket INT,
    id_estado_anterior INT,
    id_estado_nuevo INT,
    sla_cumplido BOOLEAN,
    fecha_resolucion TIMESTAMPTZ,
    fecha_cierre TIMESTAMPTZ
) AS $$
DECLARE
    v_est_ant INT;
    v_fecha_limite TIMESTAMPTZ;
    v_pausa_ant TIMESTAMPTZ;
    v_tiempo_pausado INT;
    v_minutos_pausa INT := 0;
    v_fecha_res TIMESTAMPTZ := NULL;
    v_fecha_cie TIMESTAMPTZ := NULL;
    v_sla_ok BOOLEAN := NULL;
    v_nombre_estado_nuevo VARCHAR;
    v_nota TEXT;
BEGIN
    SELECT t.id_estado, t.fecha_limite_sla, t.fecha_ultima_pausa, COALESCE(t.tiempo_pausado_minutos, 0)
    INTO v_est_ant, v_fecha_limite, v_pausa_ant, v_tiempo_pausado
    FROM ticket t WHERE t.id_ticket = p_id_ticket;

    IF v_est_ant IS NULL THEN
        RAISE EXCEPTION 'Ticket % no encontrado', p_id_ticket;
    END IF;

    SELECT et.nombre INTO v_nombre_estado_nuevo FROM estado_ticket et WHERE et.id_estado = p_id_nuevo_estado;

    -- Si estaba en espera (4) y ahora se reanuda, sumar tiempo transcurrido al SLA
    IF v_est_ant = 4 AND p_id_nuevo_estado <> 4 AND v_pausa_ant IS NOT NULL THEN
        v_minutos_pausa := ROUND(EXTRACT(EPOCH FROM (now() - v_pausa_ant)) / 60)::INT;
        v_tiempo_pausado := v_tiempo_pausado + v_minutos_pausa;
        v_fecha_limite := v_fecha_limite + (v_minutos_pausa || ' minutes')::INTERVAL;
    END IF;

    -- Transición a En Espera (4)
    IF p_id_nuevo_estado = 4 THEN
        UPDATE ticket
        SET id_estado = 4,
            id_motivo_espera = p_id_motivo_espera,
            fecha_ultima_pausa = now(),
            usuario_modificacion = p_id_usuario,
            fecha_modificacion = now()
        WHERE ticket.id_ticket = p_id_ticket;
    -- Transición a Resuelto (5)
    ELSIF p_id_nuevo_estado = 5 THEN
        v_fecha_res := now();
        v_sla_ok := (now() <= v_fecha_limite);
        UPDATE ticket
        SET id_estado = 5,
            solucion_aplicada = COALESCE(p_solucion, solucion_aplicada),
            fecha_resolucion = v_fecha_res,
            sla_cumplido = v_sla_ok,
            tiempo_pausado_minutos = v_tiempo_pausado,
            fecha_ultima_pausa = NULL,
            fecha_limite_sla = v_fecha_limite,
            usuario_modificacion = p_id_usuario,
            fecha_modificacion = now()
        WHERE ticket.id_ticket = p_id_ticket;
    -- Transición a Cerrado (6)
    ELSIF p_id_nuevo_estado = 6 THEN
        v_fecha_cie := now();
        IF v_fecha_res IS NULL THEN v_fecha_res := now(); END IF;
        v_sla_ok := (now() <= v_fecha_limite);
        UPDATE ticket
        SET id_estado = 6,
            fecha_cierre = v_fecha_cie,
            fecha_resolucion = COALESCE(fecha_resolucion, v_fecha_res),
            sla_cumplido = COALESCE(sla_cumplido, v_sla_ok),
            tiempo_pausado_minutos = v_tiempo_pausado,
            fecha_ultima_pausa = NULL,
            fecha_limite_sla = v_fecha_limite,
            usuario_modificacion = p_id_usuario,
            fecha_modificacion = now()
        WHERE ticket.id_ticket = p_id_ticket;
    -- Transición a Cancelado (7)
    ELSIF p_id_nuevo_estado = 7 THEN
        UPDATE ticket
        SET id_estado = 7,
            motivo_cancelacion = COALESCE(p_motivo_cancelacion, 'Cancelado por el usuario o soporte'),
            usuario_modificacion = p_id_usuario,
            fecha_modificacion = now()
        WHERE ticket.id_ticket = p_id_ticket;
    -- Otros estados (1=Abierto, 2=Asignado, 3=En Progreso)
    ELSE
        UPDATE ticket
        SET id_estado = p_id_nuevo_estado,
            tiempo_pausado_minutos = v_tiempo_pausado,
            fecha_ultima_pausa = CASE WHEN p_id_nuevo_estado = 4 THEN now() ELSE NULL END,
            fecha_limite_sla = v_fecha_limite,
            usuario_modificacion = p_id_usuario,
            fecha_modificacion = now()
        WHERE ticket.id_ticket = p_id_ticket;
    END IF;

    v_nota := COALESCE(p_comentario, 'Transición de estado a: ' || COALESCE(v_nombre_estado_nuevo, p_id_nuevo_estado::TEXT));
    INSERT INTO comentario_ticket (
        id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado
    ) VALUES (
        p_id_ticket, p_id_usuario, v_nota, false, p_id_nuevo_estado
    );

    RETURN QUERY SELECT
        p_id_ticket,
        v_est_ant,
        p_id_nuevo_estado,
        v_sla_ok,
        v_fecha_res,
        v_fecha_cie;
END;
$$ LANGUAGE plpgsql;


-- ----------------------------------------------------------------------------
-- 5. PROCEDIMIENTO ALMACENADO: sp_evaluar_csat_ticket
-- Registra la encuesta de satisfacción del cliente (1 a 5 estrellas) con validación
-- de titularidad y estado del ticket.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_evaluar_csat_ticket(
    p_id_ticket INT,
    p_id_usuario INT,
    p_calificacion INT,
    p_comentario TEXT
)
RETURNS TABLE (
    id_ticket INT,
    calificacion_registrada INT,
    fecha_evaluacion TIMESTAMPTZ,
    mensaje TEXT
) AS $$
DECLARE
    v_solicitante INT;
    v_estado INT;
    v_csat_ant INT;
    v_calif_final INT;
BEGIN
    SELECT t.id_usuario_solicitante, t.id_estado, t.calificacion_csat
    INTO v_solicitante, v_estado, v_csat_ant
    FROM ticket t WHERE t.id_ticket = p_id_ticket;

    IF v_solicitante IS NULL THEN
        RAISE EXCEPTION 'Ticket % no encontrado', p_id_ticket;
    END IF;

    IF v_solicitante <> p_id_usuario THEN
        RAISE EXCEPTION 'Solo el usuario solicitante titular puede calificar el servicio.';
    END IF;

    IF v_estado NOT IN (5, 6) THEN
        RAISE EXCEPTION 'Solo se pueden evaluar tickets resueltos o cerrados.';
    END IF;

    IF v_csat_ant IS NOT NULL THEN
        RAISE EXCEPTION 'Este ticket ya cuenta con una evaluación de satisfacción registrada.';
    END IF;

    v_calif_final := GREATEST(1, LEAST(5, p_calificacion));

    UPDATE ticket
    SET calificacion_csat = v_calif_final,
        comentario_csat = trim(p_comentario),
        fecha_csat = now(),
        usuario_modificacion = p_id_usuario,
        fecha_modificacion = now()
    WHERE ticket.id_ticket = p_id_ticket;

    INSERT INTO comentario_ticket (
        id_ticket, id_usuario, comentario, es_interno
    ) VALUES (
        p_id_ticket,
        p_id_usuario,
        'Evaluación CSAT registrada: ' || v_calif_final || '/5 estrellas. ' || COALESCE(trim(p_comentario), ''),
        false
    );

    RETURN QUERY SELECT
        p_id_ticket,
        v_calif_final,
        now(),
        'Evaluación de satisfacción registrada exitosamente.'::TEXT;
END;
$$ LANGUAGE plpgsql;


-- ----------------------------------------------------------------------------
-- 6. TRIGGER DE SUBTIPO: trg_ticket_subtipo
-- Mantiene consistencia de subtipos 1:1 (ticket_incidente vs ticket_solicitud)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_ticket_subtipo() RETURNS trigger AS $$
BEGIN
    IF NEW.id_tipo_ticket = 1 THEN
        INSERT INTO ticket_incidente (id_ticket) VALUES (NEW.id_ticket)
        ON CONFLICT (id_ticket) DO NOTHING;
        DELETE FROM ticket_solicitud WHERE id_ticket = NEW.id_ticket;
    ELSIF NEW.id_tipo_ticket = 2 THEN
        INSERT INTO ticket_solicitud (id_ticket) VALUES (NEW.id_ticket)
        ON CONFLICT (id_ticket) DO NOTHING;
        DELETE FROM ticket_incidente WHERE id_ticket = NEW.id_ticket;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ticket_subtipo ON ticket;
CREATE TRIGGER trg_ticket_subtipo
AFTER INSERT OR UPDATE OF id_tipo_ticket ON ticket
FOR EACH ROW EXECUTE FUNCTION fn_ticket_subtipo();


-- ----------------------------------------------------------------------------
-- 7. TRIGGER DE SEGURIDAD E INMUTABILIDAD: trg_proteger_log_auditoria
-- Garantiza registro Append-Only inmutable en api_log_auditoria (bloquea UPDATE/DELETE)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevenir_modificacion_log_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACIÓN DE INTEGRIDAD: La bitácora api_log_auditoria es estrictamente inmutable (Append-Only). No se permiten operaciones de UPDATE o DELETE.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proteger_log_auditoria ON api_log_auditoria;
CREATE TRIGGER trg_proteger_log_auditoria
BEFORE UPDATE OR DELETE ON api_log_auditoria
FOR EACH STATEMENT EXECUTE FUNCTION prevenir_modificacion_log_auditoria();


-- ----------------------------------------------------------------------------
-- 8. PROCEDIMIENTO ALMACENADO: sp_registrar_usuario_cliente
-- Registro atómico de clientes/trabajadores mediante API externa (SoD + Perfil 3)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_registrar_usuario_cliente(
    p_dni VARCHAR,
    p_nombres VARCHAR,
    p_apellido_paterno VARCHAR,
    p_apellido_materno VARCHAR,
    p_correo VARCHAR,
    p_celular VARCHAR,
    p_clave_hash VARCHAR,
    p_id_departamento INT
)
RETURNS TABLE (
    id_usuario INT,
    dni VARCHAR,
    nombres VARCHAR,
    apellido_paterno VARCHAR,
    apellido_materno VARCHAR,
    correo_electronico VARCHAR,
    celular VARCHAR,
    fecha_creacion TIMESTAMPTZ
) AS $$
#variable_conflict use_column
DECLARE
    v_nuevo_id INT;
    v_fecha TIMESTAMPTZ := now();
BEGIN
    IF EXISTS (SELECT 1 FROM usuario u WHERE u.dni = p_dni AND u.estado_registro = true) THEN
        RAISE EXCEPTION 'DNI_DUPLICADO: El DNI % ya se encuentra registrado.', p_dni;
    END IF;

    IF EXISTS (SELECT 1 FROM usuario u WHERE LOWER(u.correo_electronico) = LOWER(p_correo) AND u.estado_registro = true) THEN
        RAISE EXCEPTION 'CORREO_DUPLICADO: El correo % ya se encuentra registrado.', p_correo;
    END IF;

    INSERT INTO usuario (
        dni, nombres, apellido_paterno, apellido_materno, celular,
        correo_electronico, clave, id_departamento_empresa, estado_registro,
        debe_cambiar_clave, fecha_creacion, fecha_modificacion
    ) VALUES (
        p_dni, p_nombres, p_apellido_paterno, p_apellido_materno, p_celular,
        LOWER(p_correo), p_clave_hash, p_id_departamento, true,
        true, v_fecha, v_fecha
    ) RETURNING usuario.id_usuario INTO v_nuevo_id;

    INSERT INTO usuario_perfiles (id_usuario, id_perfil, estado_registro)
    VALUES (v_nuevo_id, 3, true)
    ON CONFLICT (id_usuario, id_perfil) DO UPDATE SET estado_registro = true;

    RETURN QUERY SELECT
        v_nuevo_id,
        p_dni,
        p_nombres,
        p_apellido_paterno,
        p_apellido_materno,
        LOWER(p_correo)::VARCHAR,
        p_celular,
        v_fecha;
END;
$$ LANGUAGE plpgsql;


-- ----------------------------------------------------------------------------
-- 9. PROCEDIMIENTO ALMACENADO: sp_actualizar_usuario_cliente
-- Actualización atómica de datos de usuario con control de unicidad de correo
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_actualizar_usuario_cliente(
    p_id_usuario INT,
    p_nombres VARCHAR,
    p_apellido_paterno VARCHAR,
    p_apellido_materno VARCHAR,
    p_correo VARCHAR,
    p_celular VARCHAR,
    p_id_departamento INT,
    p_estado_registro BOOLEAN
)
RETURNS TABLE (
    id_usuario INT,
    actualizado BOOLEAN
) AS $$
#variable_conflict use_column
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuario WHERE usuario.id_usuario = p_id_usuario) THEN
        RAISE EXCEPTION 'USUARIO_NO_ENCONTRADO: Usuario % no existe.', p_id_usuario;
    END IF;

    IF p_correo IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM usuario u 
            WHERE LOWER(u.correo_electronico) = LOWER(p_correo) 
              AND u.id_usuario <> p_id_usuario 
              AND u.estado_registro = true
        ) THEN
            RAISE EXCEPTION 'CORREO_DUPLICADO: El correo % ya está en uso por otro usuario.', p_correo;
        END IF;
    END IF;

    UPDATE usuario
    SET
        nombres = COALESCE(p_nombres, nombres),
        apellido_paterno = COALESCE(p_apellido_paterno, apellido_paterno),
        apellido_materno = COALESCE(p_apellido_materno, apellido_materno),
        correo_electronico = COALESCE(LOWER(p_correo), correo_electronico),
        celular = COALESCE(p_celular, celular),
        id_departamento_empresa = COALESCE(p_id_departamento, id_departamento_empresa),
        estado_registro = COALESCE(p_estado_registro, estado_registro),
        fecha_modificacion = now()
    WHERE usuario.id_usuario = p_id_usuario;

    RETURN QUERY SELECT p_id_usuario, true;
END;
$$ LANGUAGE plpgsql;

