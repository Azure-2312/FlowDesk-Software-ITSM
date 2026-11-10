-- Migración para renombrar opciones de menú de configuración de formulario
-- Quita 'de incidentes' y 'de solicitudes' ya que están dentro de sus respectivas áreas en Mesa de Servicio

UPDATE opciones_menu
SET nombre = 'Configuración del formulario'
WHERE id_opcion_menu = 21240;

UPDATE opciones_menu
SET nombre = 'Configuración del formulario'
WHERE id_opcion_menu = 21250;

-- Asegurar configuraciones base en configuracion_sistema para vistas_ticket_perfil y flujo_estados_acciones
INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor)
VALUES 
  (
    'vistas_ticket_perfil',
    'operacion',
    'Configuración de visibilidad de secciones de ticket por perfil o usuario',
    '{
      "administrador": {
        "ver_incidentes": true,
        "ver_solicitudes": true,
        "ver_problemas": true,
        "ver_cambios": true,
        "seccion_notas_internas": true,
        "seccion_respuestas_publicas": true,
        "seccion_cmdb": true,
        "seccion_costos_sla": true,
        "seccion_transiciones": true,
        "habilitado": true
      },
      "tecnico": {
        "ver_incidentes": true,
        "ver_solicitudes": true,
        "ver_problemas": true,
        "ver_cambios": true,
        "seccion_notas_internas": true,
        "seccion_respuestas_publicas": true,
        "seccion_cmdb": true,
        "seccion_costos_sla": false,
        "seccion_transiciones": true,
        "habilitado": true
      },
      "solicitante": {
        "ver_incidentes": true,
        "ver_solicitudes": true,
        "ver_problemas": false,
        "ver_cambios": false,
        "seccion_notas_internas": false,
        "seccion_respuestas_publicas": true,
        "seccion_cmdb": false,
        "seccion_costos_sla": false,
        "seccion_transiciones": false,
        "habilitado": true
      },
      "supervisor": {
        "ver_incidentes": true,
        "ver_solicitudes": true,
        "ver_problemas": true,
        "ver_cambios": true,
        "seccion_notas_internas": true,
        "seccion_respuestas_publicas": true,
        "seccion_cmdb": true,
        "seccion_costos_sla": true,
        "seccion_transiciones": true,
        "habilitado": true
      },
      "gestor_area": {
        "ver_incidentes": true,
        "ver_solicitudes": true,
        "ver_problemas": false,
        "ver_cambios": false,
        "seccion_notas_internas": false,
        "seccion_respuestas_publicas": true,
        "seccion_cmdb": true,
        "seccion_costos_sla": true,
        "seccion_transiciones": false,
        "habilitado": true
      }
    }'::jsonb
  )
ON CONFLICT (clave) DO NOTHING;

INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor)
VALUES 
  (
    'flujo_estados_acciones',
    'operacion',
    'Parámetros y compuertas de la máquina de estados y ciclo de vida de tickets',
    '{
      "pausar_sla_en_espera": true,
      "horas_reapertura": 48,
      "exigir_solucion_al_resolver": true,
      "horas_cierre_tacito": 48,
      "permitir_autoasignacion_n1": true
    }'::jsonb
  )
ON CONFLICT (clave) DO NOTHING;
