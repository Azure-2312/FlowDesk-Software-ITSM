-- ==============================================================================
-- MIGRACIÓN: Módulo de Gestión de Problemas - Pantalla 1.3.4.2 Flujo de Investigación y Seguimiento
-- Especificación: DOCUMENTACIÓN/prompt_1_config_gestion_de_problemas.md (Sección 7 y 10)
-- Fecha: 2026-10-12
-- ==============================================================================

-- 1. ACTUALIZAR OPCIÓN DE MENÚ 1.3.4.2
UPDATE opciones_menu
SET 
  nombre = 'Flujo de investigación y seguimiento',
  url_menu = '/admin/procesos/problemas/flujo',
  descripcion = 'Estados, transiciones, asignación automática, objetivos OLA, escalamiento, reapertura, tareas y problemas mayores'
WHERE id_opcion_menu = 5342;

-- 2. TABLA: ESTADOS DEL PROBLEMA (Pestaña 1.3.4.2.1)
CREATE TABLE IF NOT EXISTS problema_estado (
  id_estado SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(60) NOT NULL,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('inicial', 'en_curso', 'en_pausa', 'resuelto', 'final')),
  color VARCHAR(20) NOT NULL DEFAULT '#3b82f6',
  reloj_diagnostico VARCHAR(20) NOT NULL DEFAULT 'corre' CHECK (reloj_diagnostico IN ('corre', 'pausado', 'detenido')),
  reloj_resolucion VARCHAR(20) NOT NULL DEFAULT 'corre' CHECK (reloj_resolucion IN ('corre', 'pausado', 'detenido')),
  cuenta_como_abierto BOOLEAN NOT NULL DEFAULT true,
  permite_edicion VARCHAR(30) NOT NULL DEFAULT 'si' CHECK (permite_edicion IN ('si', 'solo_comentarios', 'no')),
  descripcion TEXT,
  orden INT NOT NULL DEFAULT 1,
  es_sistema BOOLEAN NOT NULL DEFAULT false,
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datos semilla: 9 Estados de Fábrica (Sección 10)
INSERT INTO problema_estado (
  codigo, nombre, tipo, color, reloj_diagnostico, reloj_resolucion, cuenta_como_abierto, permite_edicion, descripcion, orden, es_sistema, activo
) VALUES
  ('nuevo', 'Nuevo', 'inicial', '#3b82f6', 'corre', 'corre', true, 'si', 'Problema registrado pendiente de asignación e inicio de investigación', 1, true, true),
  ('en_analisis', 'En análisis', 'en_curso', '#f59e0b', 'corre', 'corre', true, 'si', 'Investigación técnica activa y aplicación de métodos de causa raíz', 2, false, true),
  ('en_espera', 'En espera', 'en_pausa', '#64748b', 'pausado', 'pausado', true, 'solo_comentarios', 'Pausa formal por proveedor, mantenimiento o ventana operativa', 3, false, true),
  ('causa_raiz_identificada', 'Causa raíz identificada', 'en_curso', '#8b5cf6', 'detenido', 'corre', true, 'si', 'Origen técnico confirmado y documentado con evidencia', 4, false, true),
  ('error_conocido', 'Error conocido', 'en_curso', '#06b6d4', 'detenido', 'corre', true, 'si', 'Falla con workaround publicado e ingresado en KEDB', 5, false, true),
  ('pendiente_cambio', 'Pendiente de cambio', 'en_curso', '#ec4899', 'detenido', 'pausado', true, 'solo_comentarios', 'Solución permanente requiere RFC y ventana de aprobación/despliegue', 6, false, true),
  ('resuelto', 'Resuelto', 'resuelto', '#10b981', 'detenido', 'detenido', true, 'solo_comentarios', 'Solución definitiva implementada o workaround validado', 7, true, true),
  ('cerrado', 'Cerrado', 'final', '#1e293b', 'detenido', 'detenido', false, 'no', 'Ticket cerrado con revisión completada y lecciones aprendidas', 8, true, true),
  ('cancelado', 'Cancelado', 'final', '#ef4444', 'detenido', 'detenido', false, 'no', 'Anulado por error de registro o reclasificación con motivo justificado', 9, true, true)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  color = EXCLUDED.color,
  reloj_diagnostico = EXCLUDED.reloj_diagnostico,
  reloj_resolucion = EXCLUDED.reloj_resolucion,
  cuenta_como_abierto = EXCLUDED.cuenta_como_abierto,
  permite_edicion = EXCLUDED.permite_edicion,
  descripcion = EXCLUDED.descripcion,
  orden = EXCLUDED.orden,
  es_sistema = EXCLUDED.es_sistema,
  activo = EXCLUDED.activo;

-- 3. TABLA: TRANSICIONES Y ACCIONES (Pestaña 1.3.4.2.2)
CREATE TABLE IF NOT EXISTS problema_transicion (
  id_transicion SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(80) NOT NULL,
  estado_origen_id INT NOT NULL REFERENCES problema_estado(id_estado),
  estado_destino_id INT NOT NULL REFERENCES problema_estado(id_estado),
  perfiles_autorizados JSONB NOT NULL DEFAULT '[]', -- IDs de perfiles autorizados
  roles_contextuales JSONB NOT NULL DEFAULT '{"responsable": true, "grupo": true, "supervisor": true}',
  condiciones_previas JSONB NOT NULL DEFAULT '[]',
  campos_requeridos JSONB NOT NULL DEFAULT '[]',
  politica_comentario VARCHAR(30) NOT NULL DEFAULT 'opcional' CHECK (politica_comentario IN ('ninguno', 'opcional', 'obligatorio')),
  requiere_confirmacion BOOLEAN NOT NULL DEFAULT false,
  mensaje_confirmacion TEXT,
  requiere_aprobacion BOOLEAN NOT NULL DEFAULT false,
  aprobador_tipo VARCHAR(40) DEFAULT 'supervisor_grupo',
  color_boton VARCHAR(20) DEFAULT '#2563eb',
  automatizaciones JSONB NOT NULL DEFAULT '[]',
  activa BOOLEAN NOT NULL DEFAULT true,
  orden INT NOT NULL DEFAULT 1,
  es_sistema BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transiciones de fábrica de la Sección 7.2
INSERT INTO problema_transicion (
  codigo, nombre, estado_origen_id, estado_destino_id, perfiles_autorizados, campos_requeridos, automatizaciones, activa, orden, es_sistema
) VALUES
  ('trn_iniciar_analisis', 'Iniciar análisis', 
    (SELECT id_estado FROM problema_estado WHERE codigo = 'nuevo'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'en_analisis'),
    '[1, 10, 2, 4]', '["grupo_id", "responsable_id"]', '[{"tipo": "iniciar_reloj_diagnostico"}]', true, 1, true),
  ('trn_poner_en_espera', 'Poner en espera',
    (SELECT id_estado FROM problema_estado WHERE codigo = 'en_analisis'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'en_espera'),
    '[1, 10, 2, 4]', '["motivo_espera", "fecha_reanudacion"]', '[{"tipo": "pausar_relojes"}]', true, 2, true),
  ('trn_reanudar', 'Reanudar análisis',
    (SELECT id_estado FROM problema_estado WHERE codigo = 'en_espera'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'en_analisis'),
    '[1, 10, 2, 4]', '[]', '[{"tipo": "reanudar_relojes"}]', true, 3, true),
  ('trn_registrar_causa', 'Registrar causa raíz',
    (SELECT id_estado FROM problema_estado WHERE codigo = 'en_analisis'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'causa_raiz_identificada'),
    '[1, 10, 2, 4]', '["metodo_analisis", "causa_raiz", "categoria_causa_raiz"]', '[{"tipo": "detener_reloj_diagnostico"}]', true, 4, true),
  ('trn_publicar_error_conocido', 'Publicar error conocido',
    (SELECT id_estado FROM problema_estado WHERE codigo = 'causa_raiz_identificada'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'error_conocido'),
    '[1, 10, 2, 4]', '["workaround"]', '[{"tipo": "crear_registro_kedb"}, {"tipo": "notificar_mesa_servicio"}]', true, 5, true),
  ('trn_solicitar_cambio', 'Solicitar cambio',
    (SELECT id_estado FROM problema_estado WHERE codigo = 'causa_raiz_identificada'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'pendiente_cambio'),
    '[1, 10, 2, 4]', '["solucion_permanente"]', '[{"tipo": "crear_rfc_prellenada"}]', true, 6, true),
  ('trn_resolver_sin_cambio', 'Resolver sin cambio',
    (SELECT id_estado FROM problema_estado WHERE codigo = 'causa_raiz_identificada'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'resuelto'),
    '[1, 10, 2, 4]', '["solucion_aplicada", "decision_resolucion"]', '[{"tipo": "detener_reloj_resolucion"}]', true, 7, true),
  ('trn_resolver_rfc', 'Resolver por RFC completada',
    (SELECT id_estado FROM problema_estado WHERE codigo = 'pendiente_cambio'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'resuelto'),
    '[1, 10, 4]', '[]', '[{"tipo": "detener_reloj_resolucion"}, {"tipo": "programar_verificacion_recurrencia"}]', true, 8, true),
  ('trn_cerrar', 'Cerrar problema',
    (SELECT id_estado FROM problema_estado WHERE codigo = 'resuelto'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'cerrado'),
    '[1, 10, 4]', '["codigo_cierre", "resumen_cierre"]', '[{"tipo": "cerrar_incidentes_asistido"}]', true, 9, true),
  ('trn_cancelar', 'Cancelar problema',
    (SELECT id_estado FROM problema_estado WHERE codigo = 'en_analisis'),
    (SELECT id_estado FROM problema_estado WHERE codigo = 'cancelado'),
    '[1, 10, 4]', '["motivo_cancelacion"]', '[]', true, 10, true)
ON CONFLICT (codigo) DO NOTHING;

-- 4. TABLA: REGLAS DE ASIGNACIÓN AUTOMÁTICA (Pestaña 1.3.4.2.3)
CREATE TABLE IF NOT EXISTS problema_regla_asignacion (
  id_regla SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  orden INT NOT NULL DEFAULT 1,
  activa BOOLEAN NOT NULL DEFAULT true,
  evento_evaluacion VARCHAR(40) NOT NULL DEFAULT 'al_registrar',
  condiciones JSONB NOT NULL DEFAULT '[]',
  id_departamento_destino INT REFERENCES departamento_ti(id_departamento),
  estrategia VARCHAR(40) NOT NULL DEFAULT 'sin_responsable', -- 'sin_responsable', 'round_robin', 'menor_carga', 'tecnico_fijo'
  id_tecnico_fijo INT REFERENCES usuario(id_usuario),
  considerar_disponibilidad BOOLEAN NOT NULL DEFAULT true,
  notificar_asignacion BOOLEAN NOT NULL DEFAULT true,
  veces_aplicada INT NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Regla de fábrica semilla
INSERT INTO problema_regla_asignacion (
  nombre, orden, activa, evento_evaluacion, condiciones, estrategia, considerar_disponibilidad, notificar_asignacion
) VALUES (
  'Asignación estándar por categoría del servicio',
  1, true, 'al_registrar', '[]', 'sin_responsable', true, true
) ON CONFLICT DO NOTHING;

-- 5. TABLA: OBJETIVOS DE TIEMPO OLA PARA PROBLEMAS (Pestaña 1.3.4.2.4)
CREATE TABLE IF NOT EXISTS problema_objetivo_tiempo (
  id_objetivo SERIAL PRIMARY KEY,
  id_prioridad INT NOT NULL UNIQUE REFERENCES prioridad_ticket(id_prioridad),
  primera_respuesta_horas INT NOT NULL DEFAULT 4,
  diagnostico_horas INT NOT NULL DEFAULT 72,
  resolucion_total_horas INT NOT NULL DEFAULT 240,
  descripcion_operativa TEXT,
  umbrales_alerta JSONB NOT NULL DEFAULT '[50, 75, 90]',
  fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cargar valores sugeridos de fábrica de la Sección 7.4 (P1 a P4)
INSERT INTO problema_objetivo_tiempo (
  id_prioridad, primera_respuesta_horas, diagnostico_horas, resolucion_total_horas, descripcion_operativa
)
SELECT 
  p.id_prioridad,
  CASE p.codigo
    WHEN 'P1' THEN 4
    WHEN 'P2' THEN 8
    WHEN 'P3' THEN 24
    ELSE 72
  END as primera_respuesta_horas,
  CASE p.codigo
    WHEN 'P1' THEN 72
    WHEN 'P2' THEN 120
    WHEN 'P3' THEN 240
    ELSE 480
  END as diagnostico_horas,
  CASE p.codigo
    WHEN 'P1' THEN 240
    WHEN 'P2' THEN 480
    WHEN 'P3' THEN 960
    ELSE 1440
  END as resolucion_total_horas,
  CASE p.codigo
    WHEN 'P1' THEN 'P1 Crítica: problema que causa incidentes de interrupción total o paralización crítica de servicio.'
    WHEN 'P2' THEN 'P2 Alta: degradación severa recurrente que afecta a operaciones de negocio importantes.'
    WHEN 'P3' THEN 'P3 Media: fallas repetitivas con impacto departamental o workaround provisional disponible.'
    ELSE 'P4 Baja: anomalías técnicas menores, consultas o mejoras preventivas de infraestructura.'
  END as descripcion_operativa
FROM prioridad_ticket p
ON CONFLICT (id_prioridad) DO UPDATE SET
  primera_respuesta_horas = EXCLUDED.primera_respuesta_horas,
  diagnostico_horas = EXCLUDED.diagnostico_horas,
  resolucion_total_horas = EXCLUDED.resolucion_total_horas,
  descripcion_operativa = EXCLUDED.descripcion_operativa;

-- 6. TABLA: REGLAS DE ESCALAMIENTO (Pestaña 1.3.4.2.5)
CREATE TABLE IF NOT EXISTS problema_regla_escalamiento (
  id_escalamiento SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  objetivo VARCHAR(40) NOT NULL DEFAULT 'diagnostico', -- 'diagnostico', 'resolucion', 'primera_respuesta'
  prioridades JSONB NOT NULL DEFAULT '["P1", "P2", "P3", "P4"]',
  tipo_umbral VARCHAR(30) NOT NULL DEFAULT 'porcentaje', -- 'porcentaje', 'horas_vencido'
  umbral_valor INT NOT NULL DEFAULT 75,
  acciones JSONB NOT NULL DEFAULT '[]',
  repetir_cada_horas INT DEFAULT NULL,
  max_repeticiones INT DEFAULT 1,
  activa BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reglas de fábrica de escalamiento (Sección 7.5)
INSERT INTO problema_regla_escalamiento (
  nombre, objetivo, prioridades, tipo_umbral, umbral_valor, acciones, activa
) VALUES
  ('Alerta preventiva al responsable (75% tiempo)', 'diagnostico', '["P1", "P2", "P3", "P4"]', 'porcentaje', 75, 
   '[{"tipo": "notificar", "destinatario": "responsable"}]', true),
  ('Alerta a supervisión técnica (90% tiempo)', 'diagnostico', '["P1", "P2", "P3"]', 'porcentaje', 90, 
   '[{"tipo": "notificar", "destinatario": "supervisor_grupo"}, {"tipo": "marcar_etiqueta", "etiqueta": "En riesgo"}]', true),
  ('Vencimiento crítico OLA (100% tiempo)', 'resolucion', '["P1", "P2"]', 'porcentaje', 100, 
   '[{"tipo": "notificar", "destinatario": "gestor_problemas"}, {"tipo": "notificar", "destinatario": "direccion_ti"}, {"tipo": "marcar_etiqueta", "etiqueta": "Vencido"}]', true)
ON CONFLICT DO NOTHING;

-- 7. TABLA: CONFIGURACIÓN DE REAPERTURA (Pestaña 1.3.4.2.6)
CREATE TABLE IF NOT EXISTS problema_config_reapertura (
  id SERIAL PRIMARY KEY,
  permitir_reapertura BOOLEAN NOT NULL DEFAULT true,
  ventana_dias_resuelto INT NOT NULL DEFAULT 30,
  ventana_dias_cerrado INT NOT NULL DEFAULT 15,
  perfiles_autorizados JSONB NOT NULL DEFAULT '[1, 10, 4]', -- Admin, Gestor de Problemas, Supervisor
  estado_destino_id INT REFERENCES problema_estado(id_estado),
  motivo_obligatorio BOOLEAN NOT NULL DEFAULT true,
  max_reaperturas INT NOT NULL DEFAULT 2,
  reinicio_relojes VARCHAR(20) NOT NULL DEFAULT 'continuar', -- 'reiniciar', 'continuar'
  estrategia_asignacion VARCHAR(20) NOT NULL DEFAULT 'mantener', -- 'mantener', 'reasignar'
  motivos_catalogo JSONB NOT NULL DEFAULT '["El incidente reaparece", "La solución no funcionó", "Cambio revertido", "Otro"]',
  fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registro semilla de reapertura
INSERT INTO problema_config_reapertura (id, permitir_reapertura)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

-- 8. TABLA: CATÁLOGO DE TAREAS Y PAQUETES (Pestaña 1.3.4.2.7)
CREATE TABLE IF NOT EXISTS problema_tarea_catalogo (
  id_tarea SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(40) NOT NULL DEFAULT 'investigacion', -- 'investigacion', 'logs', 'laboratorio', 'proveedor', 'documentacion', 'validacion'
  id_departamento_destino INT REFERENCES departamento_ti(id_departamento),
  duracion_estimada_horas INT DEFAULT 4,
  offset_dias_vencimiento INT DEFAULT 2,
  obligatoria BOOLEAN NOT NULL DEFAULT false,
  checklist JSONB NOT NULL DEFAULT '[]',
  activa BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problema_tarea_paquete (
  id_paquete SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  tareas JSONB NOT NULL DEFAULT '[]', -- Lista ordenada de referencias a tareas con offset
  regla_aplicacion JSONB NOT NULL DEFAULT '{"evento": "al_iniciar_analisis"}',
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tareas de fábrica (Sección 10)
INSERT INTO problema_tarea_catalogo (codigo, titulo, tipo, duracion_estimada_horas, obligatoria) VALUES
  ('tar_logs', 'Recopilar y revisar logs del sistema e infraestructura', 'logs', 4, true),
  ('tar_reproducir', 'Reproducir el fallo en laboratorio / ambiente de pruebas', 'laboratorio', 8, false),
  ('tar_cambios', 'Revisar cambios (RFC) recientes en los CI afectados', 'investigacion', 3, true),
  ('tar_metodo', 'Aplicar método de análisis formal (Ishikawa, 5 Porqués)', 'investigacion', 6, true),
  ('tar_causa', 'Documentar causa raíz técnica comprobada con evidencias', 'documentacion', 4, true),
  ('tar_workaround', 'Validar y documentar workaround para mitigación inmediata', 'validacion', 4, false),
  ('tar_sesion_mayor', 'Convocar sesión de análisis de problema mayor (Comité)', 'investigacion', 2, true),
  ('tar_informe_ejecutivo', 'Elaborar informe técnico ejecutivo para dirección', 'documentacion', 6, true),
  ('tar_revision_post', 'Completar revisión formal del problema mayor (PIR)', 'documentacion', 8, true),
  ('tar_verificar_no_recurrencia', 'Verificar que no existe recurrencia a N días', 'validacion', 2, true),
  ('tar_actualizar_cmdb', 'Actualizar relaciones y atributos en la CMDB', 'documentacion', 2, true),
  ('tar_publicar_conocimiento', 'Publicar artículo de base de conocimiento', 'documentacion', 3, true)
ON CONFLICT (codigo) DO NOTHING;

-- Paquetes de fábrica (Sección 10)
INSERT INTO problema_tarea_paquete (codigo, nombre, descripcion, tareas, activo) VALUES
  ('paq_investigacion_estandar', 'Investigación Estándar ITIL 4', 
   'Flujo metodológico completo de recopilación, diagnóstico y validación',
   '[{"codigo": "tar_logs", "orden": 1}, {"codigo": "tar_reproducir", "orden": 2}, {"codigo": "tar_cambios", "orden": 3}, {"codigo": "tar_metodo", "orden": 4}, {"codigo": "tar_causa", "orden": 5}, {"codigo": "tar_workaround", "orden": 6}]', true),
  ('paq_problema_mayor', 'Gestión de Problema Mayor', 
   'Investigación intensiva con sesión técnica, informe ejecutivo y revisión PIR obligatoria',
   '[{"codigo": "tar_sesion_mayor", "orden": 1}, {"codigo": "tar_logs", "orden": 2}, {"codigo": "tar_cambios", "orden": 3}, {"codigo": "tar_causa", "orden": 4}, {"codigo": "tar_informe_ejecutivo", "orden": 5}, {"codigo": "tar_revision_post", "orden": 6}]', true),
  ('paq_cierre', 'Cierre y Aprendizaje Continuo', 
   'Verificación de estabilidad, sincronización CMDB y actualización de conocimiento',
   '[{"codigo": "tar_verificar_no_recurrencia", "orden": 1}, {"codigo": "tar_actualizar_cmdb", "orden": 2}, {"codigo": "tar_publicar_conocimiento", "orden": 3}]', true)
ON CONFLICT (codigo) DO NOTHING;

-- 9. TABLA: PROBLEMAS MAYORES Y REVISIÓN OBLIGATORIA (Pestaña 1.3.4.2.8)
CREATE TABLE IF NOT EXISTS problema_criterio_mayor (
  id_criterio SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  tipo VARCHAR(40) NOT NULL, -- 'prioridad', 'incidentes_minimos', 'servicio_critico', 'ci_critico', 'duracion_horas', 'manual_supervisor'
  parametros JSONB NOT NULL DEFAULT '{}',
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problema_config_mayor (
  id SERIAL PRIMARY KEY,
  aplicar_paquete_tareas BOOLEAN NOT NULL DEFAULT true,
  exigir_revision_cierre BOOLEAN NOT NULL DEFAULT true,
  plazo_revision_dias INT NOT NULL DEFAULT 10,
  participantes_roles JSONB NOT NULL DEFAULT '["gestor_problemas", "supervisor", "responsable"]',
  aprobacion_cierre_perfil INT REFERENCES perfiles(id_perfil),
  notificar_direccion_al_detectar BOOLEAN NOT NULL DEFAULT true,
  notificar_direccion_al_cerrar BOOLEAN NOT NULL DEFAULT true,
  generar_informe_pdf BOOLEAN NOT NULL DEFAULT true,
  plantilla_preguntas JSONB NOT NULL DEFAULT '[
    {"id": "q1", "pregunta": "¿Qué ocurrió y cuál fue el impacto en el negocio?", "tipo": "texto_largo", "obligatoria": true},
    {"id": "q2", "pregunta": "Cronología detallada de la ocurrencia e investigación", "tipo": "cronologia", "obligatoria": true},
    {"id": "q3", "pregunta": "Causa raíz confirmada", "tipo": "texto_largo", "obligatoria": true},
    {"id": "q4", "pregunta": "¿Qué funcionó bien durante la atención?", "tipo": "texto_largo", "obligatoria": true},
    {"id": "q5", "pregunta": "¿Qué aspectos deben mejorar para evitar recurrencias?", "tipo": "texto_largo", "obligatoria": true},
    {"id": "q6", "pregunta": "Acciones preventivas acordadas", "tipo": "tabla_acciones", "obligatoria": true},
    {"id": "q7", "pregunta": "¿Se actualizó la CMDB?", "tipo": "si_no", "obligatoria": true},
    {"id": "q8", "pregunta": "¿Se publicó conocimiento o lecciones aprendidas?", "tipo": "si_no", "obligatoria": true}
  ]',
  fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cargar criterios de problema mayor semilla
INSERT INTO problema_criterio_mayor (nombre, tipo, parametros, activo) VALUES
  ('Prioridad P1 Crítica', 'prioridad', '{"prioridades": ["P1"]}', true),
  ('Más de 10 incidentes vinculados concurrentes', 'incidentes_minimos', '{"umbral": 10}', true),
  ('Afectación a Servicio Crítico Institucional', 'servicio_critico', '{"es_critico": true}', true),
  ('Marcado manualmente por Supervisor o Gestor', 'manual_supervisor', '{}', true)
ON CONFLICT DO NOTHING;

INSERT INTO problema_config_mayor (id, exigir_revision_cierre)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;
