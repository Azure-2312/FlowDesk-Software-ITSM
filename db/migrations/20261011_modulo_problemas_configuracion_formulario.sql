-- ============================================================================
-- MIGRACIÓN: Módulo de Gestión de Problemas - Etapa A: Configuración de Formulario
-- Archivo: db/migrations/20261011_modulo_problemas_configuracion_formulario.sql
-- Alineación: ITIL 4, ISO/IEC 20000-1:2018 (Cl. 8.6.3), ISO/IEC 27001
-- ============================================================================

-- 1. PERFIL: GESTOR DE PROBLEMAS (id_perfil 10)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM perfiles WHERE nombre = 'Gestor de Problemas') THEN
    INSERT INTO perfiles (id_perfil, nombre, descripcion, estado_registro)
    VALUES (
      10,
      'Gestor de Problemas',
      'Problem Manager: coordina la identificación, control del problema y control de errores según ITIL 4',
      true
    );
  END IF;
END $$;

-- 2. ACTUALIZACIÓN DEL MENÚ: 1.3.4.1 Configuración de Formulario
ALTER TABLE opciones_menu ALTER COLUMN descripcion TYPE VARCHAR(255);

UPDATE opciones_menu
SET 
  nombre = 'Configuración de formulario',
  url_menu = '/admin/procesos/problemas/formulario',
  descripcion = 'Campos, catálogos, matriz de prioridad, plantillas y vista del ticket de problemas'
WHERE id_opcion_menu = 5341;


-- Asegurar asignación de opciones de problemas a Administrador y Gestor de Problemas
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT om.id_opcion_menu, 1, om.orden, true
FROM opciones_menu om
WHERE om.id_opcion_menu IN (5340, 5341, 5342, 5343)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT om.id_opcion_menu, 10, om.orden, true
FROM opciones_menu om
WHERE om.id_opcion_menu IN (100, 400, 700, 5340, 5341, 5342, 5343)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;

-- 3. TABLA: VERSIONADO DE CONFIGURACIÓN POR MÓDULO Y PESTAÑA (Patrón Común Sección 3)
CREATE TABLE IF NOT EXISTS configuracion_modulo_versiones (
  id_version SERIAL PRIMARY KEY,
  modulo VARCHAR(50) NOT NULL,              -- 'problemas', 'incidentes', 'solicitudes'
  pantalla VARCHAR(50) NOT NULL,            -- '1.3.4.1', '1.3.4.2', '1.3.4.3'
  pestana VARCHAR(50) NOT NULL,             -- 'campos', 'personalizados', 'catalogos', 'matriz_prioridad', 'plantillas', 'vista_ticket'
  numero_version INT NOT NULL DEFAULT 1,
  es_publicada BOOLEAN NOT NULL DEFAULT false,
  es_borrador BOOLEAN NOT NULL DEFAULT true,
  snapshot JSONB NOT NULL,
  diff JSONB,
  motivo TEXT,
  impacto_resumen TEXT,
  id_usuario_creacion INT REFERENCES usuario(id_usuario),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_config_mod_versiones_lookup 
ON configuracion_modulo_versiones (modulo, pantalla, pestana, es_publicada, es_borrador);

-- 4. TABLA: BLOQUEO DE EDICIÓN CONCURRENTE (15 minutos de inactividad)
CREATE TABLE IF NOT EXISTS bloqueo_edicion_concurrente (
  id_bloqueo SERIAL PRIMARY KEY,
  recurso VARCHAR(120) NOT NULL UNIQUE,     -- ej: 'problemas:1.3.4.1:campos'
  id_usuario INT REFERENCES usuario(id_usuario) NOT NULL,
  fecha_bloqueo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 5. TABLA: AUSENCIAS DE TÉCNICOS (Sección 12.3)
CREATE TABLE IF NOT EXISTS tecnico_ausencias (
  id_ausencia SERIAL PRIMARY KEY,
  id_tecnico INT NOT NULL REFERENCES usuario(id_usuario),
  desde TIMESTAMP WITH TIME ZONE NOT NULL,
  hasta TIMESTAMP WITH TIME ZONE NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  creado_por INT REFERENCES usuario(id_usuario),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado_registro BOOLEAN NOT NULL DEFAULT true
);

-- 6. CATÁLOGOS DE GESTIÓN DE PROBLEMAS (Pestaña 1.3.4.1.3)

-- 6.1 Categorías de Problema (Árbol 2 Niveles)
CREATE TABLE IF NOT EXISTS problema_categoria (
  id_categoria SERIAL PRIMARY KEY,
  id_padre INT REFERENCES problema_categoria(id_categoria),
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#2563eb',
  orden INT NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  es_sistema BOOLEAN NOT NULL DEFAULT false,
  id_departamento_defecto INT REFERENCES departamento_ti(id_departamento),
  id_usuario_defecto INT REFERENCES usuario(id_usuario),
  id_servicio_defecto INT REFERENCES servicio_catalogo(id_servicio),
  id_plantilla_defecto INT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.2 Orígenes de Problema
CREATE TABLE IF NOT EXISTS problema_origen (
  id_origen SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#475569',
  orden INT NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  es_sistema BOOLEAN NOT NULL DEFAULT false,
  requiere_incidentes BOOLEAN NOT NULL DEFAULT false,
  es_proactivo BOOLEAN NOT NULL DEFAULT false
);

-- 6.3 Categorías de Causa Raíz
CREATE TABLE IF NOT EXISTS problema_causa_raiz_categoria (
  id_causa_categoria SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#d97706',
  orden INT NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  es_sistema BOOLEAN NOT NULL DEFAULT false,
  sugiere_rfc BOOLEAN NOT NULL DEFAULT false,
  descripcion_ejemplo TEXT
);

-- 6.4 Códigos de Cierre
CREATE TABLE IF NOT EXISTS problema_codigo_cierre (
  id_codigo_cierre SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#059669',
  orden INT NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  es_sistema BOOLEAN NOT NULL DEFAULT false,
  requiere_solucion_permanente BOOLEAN NOT NULL DEFAULT false,
  requiere_rfc_cerrada BOOLEAN NOT NULL DEFAULT false,
  requiere_error_conocido BOOLEAN NOT NULL DEFAULT false,
  cuenta_como_exito BOOLEAN NOT NULL DEFAULT true,
  requiere_aprobacion_supervisor BOOLEAN NOT NULL DEFAULT false
);

-- 6.5 Métodos de Análisis
CREATE TABLE IF NOT EXISTS problema_metodo_analisis (
  id_metodo SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#6366f1',
  orden INT NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  es_sistema BOOLEAN NOT NULL DEFAULT false,
  plantilla_ayuda TEXT
);

-- 6.6 Motivos de Espera
CREATE TABLE IF NOT EXISTS problema_motivo_espera (
  id_motivo_espera SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#f97316',
  orden INT NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  es_sistema BOOLEAN NOT NULL DEFAULT false,
  pausa_reloj_resolucion BOOLEAN NOT NULL DEFAULT true,
  requiere_fecha_reanudacion BOOLEAN NOT NULL DEFAULT false
);

-- 6.7 Motivos de Cancelación
CREATE TABLE IF NOT EXISTS problema_motivo_cancelacion (
  id_motivo_cancelacion SERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#dc2626',
  orden INT NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  es_sistema BOOLEAN NOT NULL DEFAULT false,
  requiere_aprobacion BOOLEAN NOT NULL DEFAULT false
);

-- 7. TABLA: MATRIZ DE PRIORIDAD INSTITUCIONAL (Pestaña 1.3.4.1.4)
CREATE TABLE IF NOT EXISTS matriz_prioridad_institucional (
  id_celda SERIAL PRIMARY KEY,
  entidad VARCHAR(50) NOT NULL DEFAULT 'compartida', -- 'compartida', 'problema'
  nivel_impacto INT NOT NULL CHECK (nivel_impacto BETWEEN 1 AND 3),
  nivel_urgencia INT NOT NULL CHECK (nivel_urgencia BETWEEN 1 AND 3),
  id_prioridad INT NOT NULL REFERENCES prioridad_ticket(id_prioridad),
  fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_matriz_entidad_celda UNIQUE (entidad, nivel_impacto, nivel_urgencia)
);

-- 8. TABLA: PLANTILLAS DE PROBLEMA (Pestaña 1.3.4.1.5)
CREATE TABLE IF NOT EXISTS plantilla_problema (
  id_plantilla SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN NOT NULL DEFAULT true,
  id_categoria INT REFERENCES problema_categoria(id_categoria),
  perfiles_visibles JSONB DEFAULT '[]',
  valores_prellenados JSONB NOT NULL DEFAULT '{}',
  campos_bloqueados JSONB NOT NULL DEFAULT '{}',
  tareas_incluidas JSONB NOT NULL DEFAULT '[]',
  veces_usada INT NOT NULL DEFAULT 0,
  usuario_creacion INT REFERENCES usuario(id_usuario),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLA: CAMPOS PERSONALIZADOS (Pestaña 1.3.4.1.2)
CREATE TABLE IF NOT EXISTS campo_personalizado (
  id_campo SERIAL PRIMARY KEY,
  entidad VARCHAR(50) NOT NULL DEFAULT 'problema', -- 'problema', 'incidente', 'solicitud'
  codigo VARCHAR(60) NOT NULL,
  etiqueta VARCHAR(80) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(40) NOT NULL,                      -- 'texto_corto', 'texto_largo', 'numero', 'fecha', 'lista', 'casilla', etc.
  activo BOOLEAN NOT NULL DEFAULT true,
  propiedades JSONB NOT NULL DEFAULT '{}',
  formularios_visibles JSONB NOT NULL DEFAULT '["registro", "edicion"]',
  pestana_vista VARCHAR(50) DEFAULT 'detalle',
  seccion VARCHAR(50) DEFAULT 'A. Identificación',
  obligatorio VARCHAR(20) DEFAULT 'no',           -- 'si', 'no', 'condicional'
  reglas_condicionales JSONB DEFAULT '[]',
  orden INT DEFAULT 1,
  veces_usado INT DEFAULT 0,
  usuario_creacion INT REFERENCES usuario(id_usuario),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_campo_entidad_codigo UNIQUE (entidad, codigo)
);

-- 10. COLUMNAS COMPLEMENTARIAS (Sección 12.4)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket' AND column_name = 'es_incidente_mayor') THEN
    ALTER TABLE ticket ADD COLUMN es_incidente_mayor BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servicio_catalogo' AND column_name = 'es_critico') THEN
    ALTER TABLE servicio_catalogo ADD COLUMN es_critico BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'elemento_configuracion' AND column_name = 'criticidad') THEN
    ALTER TABLE elemento_configuracion ADD COLUMN criticidad VARCHAR(20) NOT NULL DEFAULT 'MEDIA';
  END IF;
END $$;

-- 11. DATOS SEMILLA (Sección 10)

-- 11.1 Orígenes de Problema Semilla
INSERT INTO problema_origen (codigo, nombre, descripcion, color, orden, activo, es_sistema, requiere_incidentes, es_proactivo) VALUES
('incidente_recurrente', 'Incidente(s) recurrente(s)', 'Múltiples incidentes con síntomas o causas análogas', '#dc2626', 1, true, true, true, false),
('incidente_mayor', 'Incidente mayor', 'Problema derivado formalmente de un incidente crítico P1', '#b91c1c', 2, true, true, true, false),
('deteccion_proactiva', 'Detección proactiva', 'Identificación preventiva por auditorías o análisis de telemetría', '#2563eb', 3, true, true, false, true),
('analisis_tendencias', 'Análisis de tendencias', 'Patrones detectados en la analítica periódica de operaciones', '#0891b2', 4, true, true, false, true),
('notificacion_proveedor', 'Notificación de proveedor', 'Alerta o boletín de vulnerabilidad emitido por un fabricante o tercero', '#7c3aed', 5, true, true, false, false),
('evento_monitoreo', 'Evento de monitoreo (alerta)', 'Disparo proveniente de sondas APM, SIEM o plataformas de monitoreo', '#f59e0b', 6, true, false, false, true)
ON CONFLICT (codigo) DO NOTHING;

-- 11.2 Categorías de Problema Semilla (Nivel 1 y Nivel 2)
INSERT INTO problema_categoria (codigo, nombre, descripcion, color, orden, activo, es_sistema) VALUES
('cat_hardware', 'Hardware e Infraestructura Física', 'Componentes físicos de servidores, estaciones y periféricos', '#dc2626', 1, true, true),
('cat_software', 'Software y Aplicaciones de Negocio', 'Sistemas operativos, software empaquetado y ERP corporativo', '#2563eb', 2, true, true),
('cat_redes', 'Red y Comunicaciones', 'Conectividad LAN, WAN, telefonía IP y túneles VPN', '#0891b2', 3, true, true),
('cat_infraestructura', 'Infraestructura y Plataforma Cloud', 'Virtualización, centros de cómputo y servicios en la nube', '#4f46e5', 4, true, true),
('cat_bd', 'Base de Datos y Almacenamiento', 'Motores de bases de datos relacionales y repositorios de datos', '#7c3aed', 5, true, true),
('cat_seguridad', 'Ciberseguridad y Accesos', 'Políticas de seguridad, certificados SSL y mitigación de amenazas', '#be123c', 6, true, true),
('cat_procesos', 'Procesos y Procedimientos Operativos', 'Desviaciones metodológicas o vacíos de documentación operativa', '#059669', 7, true, true),
('cat_proveedor', 'Proveedor / Tercero Especialista', 'SLA y servicios provistos por empresas subcontratadas', '#d97706', 8, true, true),
('cat_usuarios', 'Usuarios y Capacitación', 'Buenas prácticas de operación y alfabetización digital', '#64748b', 9, true, true),
('cat_otros', 'Otros / No catalogado', 'Expedientes en fase preliminar de categorización', '#94a3b8', 10, true, true)
ON CONFLICT (codigo) DO NOTHING;

-- Subcategorías Nivel 2
DO $$
DECLARE
  id_hw INT;
  id_sw INT;
  id_red INT;
BEGIN
  SELECT id_categoria INTO id_hw FROM problema_categoria WHERE codigo = 'cat_hardware';
  SELECT id_categoria INTO id_sw FROM problema_categoria WHERE codigo = 'cat_software';
  SELECT id_categoria INTO id_red FROM problema_categoria WHERE codigo = 'cat_redes';

  IF id_hw IS NOT NULL THEN
    INSERT INTO problema_categoria (id_padre, codigo, nombre, descripcion, color, orden, activo, es_sistema) VALUES
    (id_hw, 'sub_hw_usuario', 'Equipos de usuario (Laptops/Desktops)', 'Microinformática asignada a colaboradores', '#dc2626', 1, true, true),
    (id_hw, 'sub_hw_servidor', 'Servidores y Cómputo Central', 'Nodos blade y servidores físicos de centros de datos', '#b91c1c', 2, true, true),
    (id_hw, 'sub_hw_perifericos', 'Periféricos y Dispositivos de Red', 'Impresoras, lectores biométricos y componentes auxiliares', '#ea580c', 3, true, true)
    ON CONFLICT (codigo) DO NOTHING;
  END IF;

  IF id_sw IS NOT NULL THEN
    INSERT INTO problema_categoria (id_padre, codigo, nombre, descripcion, color, orden, activo, es_sistema) VALUES
    (id_sw, 'sub_sw_negocio', 'Aplicaciones de Negocio (ERP / CRM)', 'Sistemas transaccionales de la organización', '#2563eb', 1, true, true),
    (id_sw, 'sub_sw_so', 'Sistema Operativo y Controladores', 'Capas base Windows/Linux y compatibilidad de controladores', '#1d4ed8', 2, true, true),
    (id_sw, 'sub_sw_ofimatica', 'Herramientas de Productividad y Correo', 'Suites colaborativas institucionales', '#3b82f6', 3, true, true)
    ON CONFLICT (codigo) DO NOTHING;
  END IF;

  IF id_red IS NOT NULL THEN
    INSERT INTO problema_categoria (id_padre, codigo, nombre, descripcion, color, orden, activo, es_sistema) VALUES
    (id_red, 'sub_red_lan', 'Red Local (LAN / WLAN)', 'Switches de acceso, cableado estructurado y WiFi', '#0891b2', 1, true, true),
    (id_red, 'sub_red_wan', 'Enlaces WAN e Internet', 'Conexiones dedicadas y proveedores de enlace troncal', '#0e7490', 2, true, true),
    (id_red, 'sub_red_vpn', 'Accesos Remotos y VPN', 'Pasarelas de conexión remota segura', '#06b6d4', 3, true, true)
    ON CONFLICT (codigo) DO NOTHING;
  END IF;
END $$;

-- 11.3 Categorías de Causa Raíz Semilla
INSERT INTO problema_causa_raiz_categoria (codigo, nombre, descripcion, color, orden, activo, es_sistema, sugiere_rfc, descripcion_ejemplo) VALUES
('cr_fallo_hw', 'Fallo de hardware', 'Avería física comprobada en componentes electrónicos o mecánicos', '#dc2626', 1, true, true, false, 'Daño irreversible en memoria RAM o tarjeta controladora RAID'),
('cr_defecto_sw', 'Defecto de software (Bug)', 'Comportamiento anómalo en la lógica de programación o excepción no controlada', '#2563eb', 2, true, true, true, 'Desbordamiento de búfer o bucle infinito en servicio transaccional'),
('cr_error_config', 'Error de configuración', 'Parámetros erróneos en ficheros de despliegue o variables de entorno', '#d97706', 3, true, true, true, 'Cadena de conexión o puerto de escucha mal direccionado'),
('cr_cambio_mal_imp', 'Cambio mal implementado', 'Intervención técnica reciente que generó efectos colaterales imprevistos', '#ea580c', 4, true, true, true, 'Despliegue de actualización que sobrescribió librerías compartidas'),
('cr_capacidad_insuf', 'Capacidad insuficiente', 'Saturación de recursos de almacenamiento, cómputo o ancho de banda', '#7c3aed', 5, true, true, true, 'Llenado del 100% de la partición de logs del servidor web'),
('cr_error_humano', 'Error humano / falta de capacitación', 'Operación indebida de procedimientos técnicos o administrativos', '#64748b', 6, true, true, false, 'Ejecución de script en entorno productivo por equivocación'),
('cr_proceso_defic', 'Proceso deficiente o inexistente', 'Carencia de protocolos estandarizados de soporte o mantenimiento', '#475569', 7, true, true, false, 'Ausencia de rotación periódica de credenciales de servicio'),
('cr_falla_proveedor', 'Falla de proveedor o tercero', 'Interrupción atribuible a la infraestructura del socio tecnológico', '#0891b2', 8, true, true, false, 'Caída de fibra óptica perimétrica del operador de telecomunicaciones'),
('cr_seguridad', 'Incidente de seguridad', 'Ataque dirigido, compromiso de credenciales o infección de malware', '#be123c', 9, true, true, true, 'Inyección SQL o propagación de ransomware en segmento DMZ'),
('cr_ambiental', 'Factor ambiental (energía / climatización)', 'Anomalías en suministro eléctrico, UPS o aire acondicionado', '#f59e0b', 10, true, true, false, 'Falla en el grupo electrógeno principal durante corte eléctrico'),
('cr_obsolescencia', 'Obsolescencia tecnológica', 'Fin de soporte de fabricante (EOL) y desgaste acumulado de componentes', '#78716c', 11, true, true, true, 'Sistema operativo fuera de soporte sin parches de seguridad'),
('cr_no_determinada', 'Causa no determinada', 'Investigación técnica que no logró aislar de forma concluyente el origen', '#94a3b8', 12, true, true, false, 'Falla esporádica no reproducible en laboratorio')
ON CONFLICT (codigo) DO NOTHING;

-- 11.4 Códigos de Cierre Semilla
INSERT INTO problema_codigo_cierre (codigo, nombre, descripcion, color, orden, activo, es_sistema, requiere_solucion_permanente, requiere_rfc_cerrada, requiere_error_conocido, cuenta_como_exito, requiere_aprobacion_supervisor) VALUES
('cierre_resuelto_con_cambio', 'Resuelto con cambio', 'Solución permanente aplicada e implementada exitosamente mediante RFC', '#059669', 1, true, true, true, true, false, true, false),
('cierre_resuelto_sin_cambio', 'Resuelto sin cambio', 'Solución definitiva implementada mediante ajuste operativo menor sin impacto', '#10b981', 2, true, true, true, false, false, true, false),
('cierre_error_conocido_aceptado', 'Cerrado con error conocido aceptado', 'Problema no resuelto pero con workaround estable y aceptado en la KEDB', '#3b82f6', 3, true, true, false, false, true, false, false),
('cierre_no_reproducible', 'Cerrado – no reproducible', 'El problema no volvió a presentarse tras agotarse la fase de pruebas técnicas', '#64748b', 4, true, true, false, false, false, false, false),
('cierre_duplicado', 'Cerrado – duplicado', 'Expediente consolidado en otro registro de problema principal', '#94a3b8', 5, true, true, false, false, false, false, false),
('cierre_tercero', 'Cerrado – responsabilidad de tercero', 'La resolución definitiva depende y fue trasladada contractualmente al proveedor', '#f59e0b', 6, true, true, false, false, false, false, false),
('cierre_riesgo_aceptado', 'Cerrado – riesgo aceptado (requiere aprobación)', 'La organización acepta conscientemente convivir con el riesgo operativo residual', '#dc2626', 7, true, true, false, false, false, false, true)
ON CONFLICT (codigo) DO NOTHING;

-- 11.5 Métodos de Análisis Semilla
INSERT INTO problema_metodo_analisis (codigo, nombre, descripcion, color, orden, activo, es_sistema, plantilla_ayuda) VALUES
('metodo_5_porques', '5 porqués', 'Técnica iterativa interrogativa para explorar relaciones de causa-efecto', '#6366f1', 1, true, true, '1. ¿Por qué ocurrió la falla inicial?\n2. ¿Por qué se produjo esa condición?\n3. ¿Por qué no fue detectada por los controles?\n4. ¿Por qué existía esa vulnerabilidad o debilidad?\n5. ¿Por qué no se corrigió oportunamente? (Causa Raíz)'),
('metodo_ishikawa', 'Diagrama de Ishikawa (Espina de Pescado)', 'Análisis causal clasificando por 6M: Método, Mano de obra, Material, Máquina, Medición, Medio ambiente', '#4f46e5', 2, true, true, 'Mano de obra:\nMáquina / Hardware:\nMétodo / Procedimiento:\nMaterial / Software:\nMedición:\nMedio ambiente:'),
('metodo_arbol_fallas', 'Árbol de fallas (FTA)', 'Análisis deductivo descendente con puertas lógicas booleanas Y/O', '#4338ca', 3, true, true, 'Evento no deseado superior:\n- Hipótesis A (Condición 1 Y Condición 2)\n- Hipótesis B (Falla de redundancia)'),
('metodo_kepner_tregoe', 'Kepner-Tregoe', 'Metodología analítica estructurada para identificar causas mediante Qué es / Qué no es', '#3730a3', 4, true, true, 'Identidad (Qué es / Qué no es):\nUbicación (Dónde es / Dónde no es):\nTiempo (Cuándo es / Cuándo no es):\nMagnitud (Cuánto abarca / Cuánto no abarca):'),
('metodo_cronologico', 'Análisis cronológico', 'Reconstrucción de la línea de tiempo minuto a minuto de eventos y logs', '#2563eb', 5, true, true, 'Línea de tiempo consolidada:\n- [HH:MM] Evento preliminar registrado en syslog\n- [HH:MM] Anomalía reportada por usuarios\n- [HH:MM] Interrupción del servicio'),
('metodo_cambios_recientes', 'Análisis de cambios recientes', 'Revisión y contraste con las RFCs y despliegues ejecutados en las últimas 72 horas', '#0891b2', 6, true, true, 'Cambios evaluados:\n- RFC-XXXXX: Modificación en base de datos\n- Despliegue de versión en servidor web'),
('metodo_pareto', 'Análisis de Pareto (80/20)', 'Identificación de las pocas causas vitales que originan la mayoría de los incidentes', '#059669', 7, true, true, 'Frecuencia de incidentes por categoría y concentración del 80% del impacto'),
('metodo_otro', 'Otro método documentado', 'Metodología técnica personalizada con sustento documental adjunto', '#64748b', 8, true, true, 'Describa el método de análisis aplicado y justificación:')
ON CONFLICT (codigo) DO NOTHING;

-- 11.6 Motivos de Espera Semilla
INSERT INTO problema_motivo_espera (codigo, nombre, descripcion, color, orden, activo, es_sistema, pausa_reloj_resolucion, requiere_fecha_reanudacion) VALUES
('esp_proveedor', 'Esperando al proveedor', 'Atención dependiente de escalamiento a soporte técnico de terceros con contrato OLA', '#f97316', 1, true, true, true, true),
('esp_ventana', 'Esperando ventana de mantenimiento', 'Intervención en espera de ventana aprobada para no impactar producción', '#ea580c', 2, true, true, true, true),
('esp_usuario', 'Esperando información del usuario', 'Se requiere recolección de evidencias complementarias de estaciones de trabajo', '#d97706', 3, true, true, true, false),
('esp_repuesto', 'Esperando repuesto o licencia', 'Suministro de hardware de reemplazo o emisión de licencia por fabricante', '#eab308', 4, true, true, true, true),
('esp_recurrencia', 'Esperando recurrencia para recolectar evidencia', 'Falla intermitente bajo monitoreo activo con trazadores encendidos', '#64748b', 5, true, true, false, false)
ON CONFLICT (codigo) DO NOTHING;

-- 11.7 Motivos de Cancelación Semilla
INSERT INTO problema_motivo_cancelacion (codigo, nombre, descripcion, color, orden, activo, es_sistema, requiere_aprobacion) VALUES
('canc_error', 'Registrado por error', 'Expediente dado de alta por equivocación o prueba no productiva', '#dc2626', 1, true, true, false),
('canc_duplicado', 'Duplicado', 'Existe un expediente activo previo que atiende la misma causa de raíz', '#b91c1c', 2, true, true, false),
('canc_no_aplica', 'Ya no aplica', 'El servicio, activo o entorno involucrado fue desmantelado o sustituido', '#991b1b', 3, true, true, false),
('canc_fusionado', 'Fusionado con otro problema', 'Incidentes e investigaciones transferidos y consolidados en otro problema', '#7f1d1d', 4, true, true, true)
ON CONFLICT (codigo) DO NOTHING;

-- 11.8 Matriz de Prioridad Institucional Semilla (Compartida y Problemas)
-- Cruce formal ITIL v4:
-- Impacto 3 (Alta)   + Urgencia 3 (Alta)   -> P1 (Crítica)
-- Impacto 3 (Alta)   + Urgencia 2 (Media)  -> P2 (Alta)
-- Impacto 3 (Alta)   + Urgencia 1 (Baja)   -> P3 (Media)
-- Impacto 2 (Media)  + Urgencia 3 (Alta)   -> P2 (Alta)
-- Impacto 2 (Media)  + Urgencia 2 (Media)  -> P3 (Media)
-- Impacto 2 (Media)  + Urgencia 1 (Baja)   -> P4 (Baja)
-- Impacto 1 (Baja)   + Urgencia 3 (Alta)   -> P3 (Media)
-- Impacto 1 (Baja)   + Urgencia 2 (Media)  -> P4 (Baja)
-- Impacto 1 (Baja)   + Urgencia 1 (Baja)   -> P4 (Baja)

DO $$
DECLARE
  p1 INT; p2 INT; p3 INT; p4 INT;
BEGIN
  SELECT id_prioridad INTO p1 FROM prioridad_ticket WHERE codigo = 'P1';
  SELECT id_prioridad INTO p2 FROM prioridad_ticket WHERE codigo = 'P2';
  SELECT id_prioridad INTO p3 FROM prioridad_ticket WHERE codigo = 'P3';
  SELECT id_prioridad INTO p4 FROM prioridad_ticket WHERE codigo = 'P4';

  IF p1 IS NOT NULL AND p2 IS NOT NULL AND p3 IS NOT NULL AND p4 IS NOT NULL THEN
    -- Matriz compartida vigente
    INSERT INTO matriz_prioridad_institucional (entidad, nivel_impacto, nivel_urgencia, id_prioridad) VALUES
    ('compartida', 3, 3, p1),
    ('compartida', 3, 2, p2),
    ('compartida', 3, 1, p3),
    ('compartida', 2, 3, p2),
    ('compartida', 2, 2, p3),
    ('compartida', 2, 1, p4),
    ('compartida', 1, 3, p3),
    ('compartida', 1, 2, p4),
    ('compartida', 1, 1, p4)
    ON CONFLICT (entidad, nivel_impacto, nivel_urgencia) DO UPDATE SET id_prioridad = EXCLUDED.id_prioridad;

    -- Matriz inicial para problemas (idéntica por defecto)
    INSERT INTO matriz_prioridad_institucional (entidad, nivel_impacto, nivel_urgencia, id_prioridad) VALUES
    ('problema', 3, 3, p1),
    ('problema', 3, 2, p2),
    ('problema', 3, 1, p3),
    ('problema', 2, 3, p2),
    ('problema', 2, 2, p3),
    ('problema', 2, 1, p4),
    ('problema', 1, 3, p3),
    ('problema', 1, 2, p4),
    ('problema', 1, 1, p4)
    ON CONFLICT (entidad, nivel_impacto, nivel_urgencia) DO UPDATE SET id_prioridad = EXCLUDED.id_prioridad;
  END IF;
END $$;

-- 11.9 Plantillas de Problema Semilla (Sección 10)
INSERT INTO plantilla_problema (nombre, descripcion, activa, perfiles_visibles, valores_prellenados, campos_bloqueados, veces_usada) VALUES
(
  'Problema recurrente de incidentes',
  'Expediente para investigar causas estructurales derivadas de múltiples incidentes similares en producción',
  true,
  '[1, 2, 4, 10]',
  '{"origen": "incidente_recurrente", "descripcion": "SÍNTOMAS OBSERVADOS:\n- Frecuencia de la falla: Recurrente en horario punta.\n- Pasos previos para reproducir:\n- Afectación registrada: Impacto transversal en la operación.", "impacto": 2, "urgencia": 2}',
  '{"origen": true}',
  0
),
(
  'Problema proactivo – tendencia',
  'Investigación preventiva originada a partir del análisis estadístico de telemetría y métricas operativas',
  true,
  '[1, 4, 10]',
  '{"origen": "analisis_tendencias", "descripcion": "TENDENCIA IDENTIFICADA:\n- Parámetro con degradación progresiva:\n- Umbral superado:\n- Impacto potencial a mediano plazo:", "impacto": 1, "urgencia": 1}',
  '{"origen": true}',
  0
),
(
  'Problema de proveedor',
  'Gestión y seguimiento de anomalías originadas en servicios o productos contratados con terceros',
  true,
  '[1, 2, 4, 10]',
  '{"origen": "notificacion_proveedor", "descripcion": "DATOS DEL TERCERO:\n- Nombre del proveedor:\n- Número de ticket externo:\n- Servicio contratado afectado:\n- Diagnóstico inicial del fabricante:", "impacto": 2, "urgencia": 2}',
  '{"origen": true}',
  0
)
ON CONFLICT (nombre) DO NOTHING;

-- 11.10 Versión Publicada Inicial v1 para Configuración de Formulario (Sección 3)
INSERT INTO configuracion_modulo_versiones (
  modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, motivo
) VALUES
(
  'problemas',
  '1.3.4.1',
  'campos',
  1,
  true,
  false,
  '{"formulario_activo": "registro", "secciones": [{"id": "sec_identificacion", "titulo": "A. Identificación", "orden": 1, "campos": ["titulo", "descripcion", "origen", "incidentes_vinculados"]}, {"id": "sec_alcance", "titulo": "B. Alcance", "orden": 2, "campos": ["servicio_id", "ci_afectados", "categoria_id"]}, {"id": "sec_clasificacion", "titulo": "C. Clasificación y priorización", "orden": 3, "campos": ["impacto", "urgencia", "prioridad"]}, {"id": "sec_asignacion", "titulo": "D. Asignación", "orden": 4, "campos": ["grupo_id", "responsable_id"]}, {"id": "sec_mitigacion", "titulo": "E. Mitigación", "orden": 5, "campos": ["workaround"]}, {"id": "sec_adjuntos", "titulo": "F. Adjuntos", "orden": 6, "campos": ["adjuntos"]}]}',
  'Inicialización de fábrica de la configuración de campos para Gestión de Problemas ITIL 4'
)
ON CONFLICT DO NOTHING;
