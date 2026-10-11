-- ============================================================================
-- MIGRACIÓN: MÓDULO DE GESTIÓN DE PROBLEMAS - ETAPA C
-- PANTALLA 1.3.4.3: RELACIÓN CON INCIDENTES, ERRORES CONOCIDOS Y CONOCIMIENTO
-- ============================================================================

-- 1. ACTUALIZAR OPCIÓN DE MENÚ 5343
UPDATE opciones_menu
SET nombre = 'Relación con incidentes, errores conocidos y conocimiento',
    url_menu = '/admin/procesos/problemas/relaciones'
WHERE id_opcion_menu = 5343;

-- 2. TABLA: REGLAS DE CREACIÓN AUTOMÁTICA POR UMBRAL (1.3.4.3.1)
CREATE TABLE IF NOT EXISTS problema_regla_umbral (
    id_regla SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    orden INT NOT NULL DEFAULT 1,
    activa BOOLEAN NOT NULL DEFAULT false,
    estados_incluidos JSONB NOT NULL DEFAULT '["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"]',
    prioridad_minima VARCHAR(10) NOT NULL DEFAULT 'P4',
    servicios_incluidos JSONB NOT NULL DEFAULT '[]',
    categorias_incluidas JSONB NOT NULL DEFAULT '[]',
    agrupar_por VARCHAR(50) NOT NULL DEFAULT 'servicio',
    sensibilidad_texto VARCHAR(20) DEFAULT 'media',
    umbral_incidentes INT NOT NULL DEFAULT 3,
    ventana_horas INT NOT NULL DEFAULT 24,
    accion VARCHAR(50) NOT NULL DEFAULT 'crear_automatico',
    id_plantilla INT,
    prioridad_problema VARCHAR(30) NOT NULL DEFAULT 'maxima_incidentes',
    id_departamento_destino INT,
    vincular_incidentes BOOLEAN NOT NULL DEFAULT true,
    evitar_duplicados BOOLEAN NOT NULL DEFAULT true,
    enfriamiento_horas INT NOT NULL DEFAULT 24,
    notificar_destinatarios JSONB NOT NULL DEFAULT '["gestor_problemas"]',
    notificar_plantilla VARCHAR(100) DEFAULT 'alerta_umbral_problema',
    ultima_ejecucion TIMESTAMPTZ,
    problemas_generados INT NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REGLAS DE FÁBRICA DE 1.3.4.3.1
INSERT INTO problema_regla_umbral (
    nombre, descripcion, orden, activa, estados_incluidos, prioridad_minima,
    agrupar_por, umbral_incidentes, ventana_horas, accion, prioridad_problema,
    evitar_duplicados, enfriamiento_horas
) VALUES
  ('5 incidentes de la misma categoría y CI en 7 días', 'Detección proactiva de fallas recurrentes por componente de infraestructura.', 1, false, '["ABIERTO", "EN_PROCESO", "RESUELTO"]', 'P4', 'ci', 5, 168, 'crear_automatico', 'maxima_incidentes', true, 48),
  ('3 incidentes del mismo servicio en 24 horas', 'Alerta temprana por degradación operativa de un servicio de TI.', 2, false, '["ABIERTO", "EN_PROCESO"]', 'P3', 'servicio', 3, 24, 'sugerir', 'maxima_incidentes', true, 24),
  ('Incidente mayor registrado (P1)', 'Generación obligatoria de problema ante incidentes críticos de alto impacto.', 3, false, '["ABIERTO", "EN_PROCESO"]', 'P1', 'servicio', 1, 24, 'crear_automatico', 'fija_p1', true, 12)
ON CONFLICT DO NOTHING;

-- TABLA: HISTORIAL DE EJECUCIÓN DE UMBRALES
CREATE TABLE IF NOT EXISTS problema_regla_umbral_ejecucion (
    id_ejecucion SERIAL PRIMARY KEY,
    id_regla INT REFERENCES problema_regla_umbral(id_regla) ON DELETE CASCADE,
    fecha_ejecucion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    incidentes_analizados INT NOT NULL DEFAULT 0,
    grupos_detectados INT NOT NULL DEFAULT 0,
    problemas_creados INT NOT NULL DEFAULT 0,
    detalle JSONB NOT NULL DEFAULT '[]'
);

-- 3. TABLA: CONFIGURACIÓN DE INCIDENTES VINCULADOS (1.3.4.3.2)
CREATE TABLE IF NOT EXISTS problema_config_incidentes_vinculados (
    id_config INT PRIMARY KEY DEFAULT 1,
    tipos_vinculo JSONB NOT NULL DEFAULT '["Causado por el problema", "Relacionado", "Posible causa"]',
    estados_incidente_permitidos JSONB NOT NULL DEFAULT '["NUEVO", "ASIGNADO", "EN_PROCESO", "PENDIENTE_TERCERO", "PENDIENTE_USUARIO"]',
    max_incidentes_por_problema INT NOT NULL DEFAULT 500,
    permitir_vinculo_multiple_abierto BOOLEAN NOT NULL DEFAULT false,
    heredar_servicio BOOLEAN NOT NULL DEFAULT true,
    heredar_ci BOOLEAN NOT NULL DEFAULT true,
    heredar_categoria BOOLEAN NOT NULL DEFAULT true,
    perfiles_desvincular JSONB NOT NULL DEFAULT '[1, 10]',
    motivo_desvincular_obligatorio BOOLEAN NOT NULL DEFAULT true,
    mostrar_banner_incidente BOOLEAN NOT NULL DEFAULT true,
    mostrar_workaround_incidente BOOLEAN NOT NULL DEFAULT true,
    audiencia_workaround_mesa BOOLEAN NOT NULL DEFAULT true,
    audiencia_workaround_tecnicos BOOLEAN NOT NULL DEFAULT true,
    audiencia_workaround_solicitante BOOLEAN NOT NULL DEFAULT false,
    sugerir_problema_registro_incidente BOOLEAN NOT NULL DEFAULT true,
    accion_error_conocido VARCHAR(50) NOT NULL DEFAULT 'agregar_nota_workaround',
    politica_cierre VARCHAR(50) NOT NULL DEFAULT 'C_resolucion_asistida',
    codigo_resolucion_masiva VARCHAR(80) DEFAULT 'Solventado por resolución de problema',
    plantilla_nota_masiva TEXT DEFAULT 'Incidente resuelto automáticamente mediante la solución permanente del problema {problema_id}: {solucion}',
    notificar_solicitantes_masiva BOOLEAN NOT NULL DEFAULT true,
    exigir_sin_incidentes_abiertos BOOLEAN NOT NULL DEFAULT true,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO problema_config_incidentes_vinculados (id_config) VALUES (1)
ON CONFLICT (id_config) DO NOTHING;

-- 4. TABLA: CONFIGURACIÓN DE ERRORES CONOCIDOS - KEDB (1.3.4.3.3)
CREATE TABLE IF NOT EXISTS problema_config_kedb (
    id_config INT PRIMARY KEY DEFAULT 1,
    req_workaround BOOLEAN NOT NULL DEFAULT true,
    req_sintomas BOOLEAN NOT NULL DEFAULT true,
    req_servicio_ci BOOLEAN NOT NULL DEFAULT true,
    req_causa_raiz BOOLEAN NOT NULL DEFAULT false,
    req_instrucciones_paso_paso BOOLEAN NOT NULL DEFAULT true,
    req_aprobacion_gestor BOOLEAN NOT NULL DEFAULT true,
    perfil_aprobador INT DEFAULT 10,
    estados_ciclo JSONB NOT NULL DEFAULT '["Borrador", "En revisión", "Publicado", "Retirado"]',
    publicacion_directa_perfiles JSONB NOT NULL DEFAULT '[1, 10]',
    revision_periodica_meses INT NOT NULL DEFAULT 6,
    recordatorio_dias_antes INT NOT NULL DEFAULT 15,
    pasar_a_revision_si_vence BOOLEAN NOT NULL DEFAULT true,
    retiro_automatico_solucion_permanente BOOLEAN NOT NULL DEFAULT true,
    audiencia_mesa_servicio BOOLEAN NOT NULL DEFAULT true,
    audiencia_tecnicos_todos BOOLEAN NOT NULL DEFAULT true,
    audiencia_tecnicos_grupo BOOLEAN NOT NULL DEFAULT true,
    audiencia_autoservicio_portal BOOLEAN NOT NULL DEFAULT false,
    sugerir_ke_en_incidente BOOLEAN NOT NULL DEFAULT true,
    peso_servicio INT NOT NULL DEFAULT 4,
    peso_categoria INT NOT NULL DEFAULT 3,
    peso_ci INT NOT NULL DEFAULT 5,
    peso_clase_ci INT NOT NULL DEFAULT 2,
    peso_palabras_titulo INT NOT NULL DEFAULT 4,
    peso_palabras_descripcion INT NOT NULL DEFAULT 3,
    umbral_minimo_coincidencia INT NOT NULL DEFAULT 60,
    maximo_sugerencias INT NOT NULL DEFAULT 5,
    campos_ke JSONB NOT NULL DEFAULT '[
      {"codigo": "id_ke", "nombre": "ID de Error Conocido", "tipo": "sistema", "obligatorio": true},
      {"codigo": "titulo", "nombre": "Título del Error Conocido", "tipo": "texto", "obligatorio": true},
      {"codigo": "sintomas", "nombre": "Síntomas y Detección", "tipo": "textarea", "obligatorio": true},
      {"codigo": "causa", "nombre": "Causa Raíz", "tipo": "textarea", "obligatorio": false},
      {"codigo": "workaround", "nombre": "Solución Temporal (Workaround)", "tipo": "textarea", "obligatorio": true},
      {"codigo": "solucion_definitiva", "nombre": "Solución Permanente Planificada", "tipo": "textarea", "obligatorio": false},
      {"codigo": "servicios_ci", "nombre": "Servicios y Elementos de Configuración", "tipo": "relacion", "obligatorio": true},
      {"codigo": "audiencia", "nombre": "Audiencia Destino", "tipo": "lista", "obligatorio": true},
      {"codigo": "estado", "nombre": "Estado de Ciclo KEDB", "tipo": "estado", "obligatorio": true},
      {"codigo": "responsable", "nombre": "Especialista Responsable", "tipo": "usuario", "obligatorio": true},
      {"codigo": "proxima_revision", "nombre": "Fecha de Próxima Revisión", "tipo": "fecha", "obligatorio": true},
      {"codigo": "problema_origen", "nombre": "Problema de Origen", "tipo": "relacion", "obligatorio": true}
    ]',
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO problema_config_kedb (id_config) VALUES (1)
ON CONFLICT (id_config) DO NOTHING;

-- 5. TABLA: CONFIGURACIÓN DE CAMBIOS (RFC) (1.3.4.3.4)
CREATE TABLE IF NOT EXISTS problema_config_rfc (
    id_config INT PRIMARY KEY DEFAULT 1,
    exigir_rfc_para_pendiente_cambio BOOLEAN NOT NULL DEFAULT true,
    permitir_varias_rfc BOOLEAN NOT NULL DEFAULT true,
    maximo_rfc INT NOT NULL DEFAULT 5,
    tipo_cambio_sugerido VARCHAR(30) NOT NULL DEFAULT 'Normal',
    regla_p1_riesgo_recurrencia BOOLEAN NOT NULL DEFAULT true,
    mapeo_campos JSONB NOT NULL DEFAULT '[
      {"origen": "titulo", "campo_problema": "Título", "destino": "titulo", "campo_rfc": "Título del cambio"},
      {"origen": "descripcion", "campo_problema": "Descripción", "destino": "justificacion", "campo_rfc": "Motivo y Justificación"},
      {"origen": "solucion_permanente", "campo_problema": "Solución permanente", "destino": "descripcion", "campo_rfc": "Descripción detallada del cambio"},
      {"origen": "servicio", "campo_problema": "Servicio afectado", "destino": "servicio", "campo_rfc": "Servicio de TI afectado"},
      {"origen": "ci_afectados", "campo_problema": "CI afectados", "destino": "activos_ci", "campo_rfc": "Activos y Elementos de Configuración"},
      {"origen": "prioridad", "campo_problema": "Prioridad del problema", "destino": "urgencia", "campo_rfc": "Urgencia sugerida del cambio"},
      {"origen": "codigo_problema", "campo_problema": "Código de problema", "destino": "origen_cambio", "campo_rfc": "Origen = Problema (vínculo trazable)"}
    ]',
    exigir_todas_rfc_implementadas_exito BOOLEAN NOT NULL DEFAULT true,
    accion_rfc_fallida VARCHAR(50) NOT NULL DEFAULT 'volver_causa_raiz',
    crear_tarea_rfc_fallida BOOLEAN NOT NULL DEFAULT true,
    plantilla_tarea_rfc_fallida VARCHAR(255) DEFAULT 'Evaluar alternativa técnica tras rechazo/falla de cambio RFC-{rfc_id}',
    notificar_roles_rfc_fallida JSONB NOT NULL DEFAULT '["gestor_problemas", "responsable_problema"]',
    pasar_automatico_a_resuelto BOOLEAN NOT NULL DEFAULT true,
    verificacion_post_cambio_dias INT NOT NULL DEFAULT 7,
    sincronizacion_tiempo_real BOOLEAN NOT NULL DEFAULT true,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO problema_config_rfc (id_config) VALUES (1)
ON CONFLICT (id_config) DO NOTHING;

-- 6. TABLA: CONFIGURACIÓN DE CONOCIMIENTO (1.3.4.3.5)
CREATE TABLE IF NOT EXISTS problema_config_conocimiento (
    id_config INT PRIMARY KEY DEFAULT 1,
    generar_al_publicar_ke BOOLEAN NOT NULL DEFAULT true,
    generar_al_resolver BOOLEAN NOT NULL DEFAULT true,
    generar_al_cerrar BOOLEAN NOT NULL DEFAULT false,
    solo_manual BOOLEAN NOT NULL DEFAULT false,
    tipo_articulo_por_evento JSONB NOT NULL DEFAULT '{
      "publicar_ke": "Error conocido (workaround)",
      "resolver": "Solución definitiva",
      "cerrar": "Guía de resolución y lecciones aprendidas"
    }',
    plantilla_mapeo JSONB NOT NULL DEFAULT '{
      "sintomas": "descripcion",
      "causa": "causa_raiz",
      "workaround": "workaround",
      "solucion": "solucion_permanente",
      "servicios_ci": "lista_afectados",
      "referencia": "enlace_problema",
      "palabras_clave": "categoria_mas_servicio"
    }',
    audiencia_defecto VARCHAR(50) DEFAULT 'segun_error_conocido',
    id_categoria_defecto INT DEFAULT 1,
    responsable_revision VARCHAR(50) NOT NULL DEFAULT 'responsable_categoria',
    articulo_obligatorio_para_cerrar BOOLEAN NOT NULL DEFAULT false,
    excepciones_codigos_cierre JSONB NOT NULL DEFAULT '["Cerrado – no reproducible", "Cerrado – duplicado"]',
    estado_inicial_borrador VARCHAR(30) NOT NULL DEFAULT 'Borrador',
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO problema_config_conocimiento (id_config) VALUES (1)
ON CONFLICT (id_config) DO NOTHING;

-- 7. TABLA: CONFIGURACIÓN DE CI Y SERVICIOS (CMDB) (1.3.4.3.6)
CREATE TABLE IF NOT EXISTS problema_config_cmdb (
    id_config INT PRIMARY KEY DEFAULT 1,
    herencia_ci_desde_incidentes BOOLEAN NOT NULL DEFAULT true,
    validar_relacion_ci_servicio VARCHAR(30) NOT NULL DEFAULT 'avisar',
    clases_ci_permitidas JSONB NOT NULL DEFAULT '[]',
    maximo_ci_por_problema INT NOT NULL DEFAULT 100,
    mostrar_marca_problema_abierto BOOLEAN NOT NULL DEFAULT true,
    mostrar_marca_ke_vigente BOOLEAN NOT NULL DEFAULT true,
    sugerir_impacto_alto_si_criticidad_mayor VARCHAR(30) DEFAULT 'CRITICO',
    servicio_critico_activa_problema_mayor BOOLEAN NOT NULL DEFAULT true,
    accion_baja_ci_con_problemas VARCHAR(30) NOT NULL DEFAULT 'avisar_responsable',
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO problema_config_cmdb (id_config) VALUES (1)
ON CONFLICT (id_config) DO NOTHING;

-- 8. TABLA: VERSIONADO Y AUDITORÍA DE RELACIONES (Sección 3)
CREATE TABLE IF NOT EXISTS problema_relaciones_version (
    id_version SERIAL PRIMARY KEY,
    numero_version INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'publicado',
    datos JSONB NOT NULL,
    motivo_cambio VARCHAR(255) NOT NULL,
    creado_por INT REFERENCES usuario(id_usuario),
    publicado_por INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_publicacion TIMESTAMPTZ
);
