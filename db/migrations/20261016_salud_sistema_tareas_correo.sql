-- Salud del sistema: tareas programadas (4.2) y cola de correo (4.3).
-- Idempotente: puede ejecutarse varias veces sin efectos colaterales.

CREATE TABLE IF NOT EXISTS tarea_programada (
    id_tarea          SERIAL PRIMARY KEY,
    codigo            TEXT UNIQUE NOT NULL,
    nombre            TEXT NOT NULL,
    descripcion       TEXT,
    frecuencia        TEXT,
    ultima_ejecucion  TIMESTAMPTZ,
    proxima_ejecucion TIMESTAMPTZ,
    estado            TEXT,
    duracion_ms       INTEGER,
    ultimo_resultado  TEXT,
    activo            BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS cola_correo (
    id_correo    SERIAL PRIMARY KEY,
    destinatario TEXT NOT NULL,
    asunto       TEXT NOT NULL,
    plantilla    TEXT,
    estado       TEXT NOT NULL DEFAULT 'pendiente',
    intentos     INTEGER NOT NULL DEFAULT 0,
    ultimo_error TEXT,
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),
    enviado_en   TIMESTAMPTZ
);

-- Seed de tareas programadas (idempotente por `codigo`).
INSERT INTO tarea_programada
    (codigo, nombre, descripcion, frecuencia, ultima_ejecucion, proxima_ejecucion, estado, duracion_ms, ultimo_resultado, activo)
VALUES
    ('recalculo_sla',
     'Recálculo de SLA',
     'Recalcula vencimientos y niveles de servicio de los tickets abiertos.',
     'Cada 15 minutos',
     now() - interval '12 minutes', now() + interval '3 minutes',
     'exitoso', 1840, 'OK: 128 tickets evaluados', true),
    ('campanas_inventario',
     'Campañas de inventario',
     'Genera las campañas de levantamiento de inventario de activos.',
     'Diaria (02:00)',
     now() - interval '22 hours', now() + interval '2 hours',
     'exitoso', 5230, 'OK: 3 campañas programadas', true),
    ('pir_vencidas',
     'PIR vencidas',
     'Detecta revisiones post-implementación vencidas y notifica a los responsables.',
     'Cada 6 horas',
     now() - interval '5 hours', now() + interval '1 hour',
     'advertencia', 980, 'Advertencia: 2 PIR sin cerrar', true),
    ('limpieza_logs',
     'Limpieza de logs',
     'Purga registros de auditoría y logs técnicos con más de 180 días.',
     'Diaria (03:30)',
     now() - interval '20 hours', now() + interval '4 hours',
     'exitoso', 12450, 'OK: 8421 registros purgados', true),
    ('recertificacion_accesos',
     'Recertificación de accesos',
     'Inicia el ciclo trimestral de recertificación de accesos por perfil.',
     'Trimestral',
     now() - interval '80 days', now() + interval '10 days',
     'exitoso', 3120, 'OK: ciclo enviado a 34 usuarios', true),
    ('renovaciones_contrato',
     'Renovaciones de contrato',
     'Avisa sobre contratos de proveedores próximos a vencer en 30 días.',
     'Diaria (07:00)',
     now() - interval '9 hours', now() + interval '15 hours',
     'fallido', 610, 'Error: no se pudo conectar con el módulo de proveedores', true)
ON CONFLICT (codigo) DO NOTHING;

-- Seed de la cola de correo (solo si está vacía, para mantener idempotencia).
INSERT INTO cola_correo
    (destinatario, asunto, plantilla, estado, intentos, ultimo_error, creado_en, enviado_en)
SELECT * FROM (VALUES
    ('apazamiguel88@gmail.com', 'Ticket #1042 asignado a tu bandeja', 'ticket_asignado', 'enviado', 1, NULL,
     now() - interval '3 hours', now() - interval '3 hours' + interval '4 seconds'),
    ('soporte.nivel2@empresa.pe', 'Cambio RFC-2087 aprobado por el CAB', 'cambio_aprobado', 'enviado', 1, NULL,
     now() - interval '2 hours', now() - interval '2 hours' + interval '2 seconds'),
    ('infraestructura@empresa.pe', 'PIR pendiente de cerrar (SLA vencido)', 'pir_vencida', 'fallido', 3,
     'SMTP 550: buzón no disponible', now() - interval '90 minutes', NULL),
    ('gestion.humana@empresa.pe', 'Recertificación de accesos: acción requerida', 'recertificacion', 'pendiente', 0, NULL,
     now() - interval '45 minutes', NULL),
    ('proveedores@empresa.pe', 'Contrato de licencias vence en 30 días', 'renovacion_contrato', 'pendiente', 0, NULL,
     now() - interval '30 minutes', NULL),
    ('auditoria@empresa.pe', 'Resumen diario de eventos de seguridad', 'resumen_seguridad', 'enviado', 1, NULL,
     now() - interval '20 minutes', now() - interval '20 minutes' + interval '3 seconds'),
    ('mesa.ayuda@empresa.pe', 'Encuesta de satisfacción del ticket #1038', 'encuesta_satisfaccion', 'fallido', 2,
     'Timeout del servidor SMTP', now() - interval '12 minutes', NULL),
    ('apazamiguel88@gmail.com', 'Código de recuperación de contraseña', 'recuperacion_clave', 'enviado', 1, NULL,
     now() - interval '5 minutes', now() - interval '5 minutes' + interval '1 second')
) AS v(destinatario, asunto, plantilla, estado, intentos, ultimo_error, creado_en, enviado_en)
WHERE NOT EXISTS (SELECT 1 FROM cola_correo);
