BEGIN;

CREATE TABLE IF NOT EXISTS evento_servicio (
    id_evento SERIAL PRIMARY KEY,
    codigo_evento VARCHAR(30) NOT NULL UNIQUE,
    fuente VARCHAR(120) NOT NULL,
    titulo VARCHAR(180) NOT NULL,
    descripcion TEXT,
    severidad VARCHAR(12) NOT NULL DEFAULT 'MEDIA' CHECK (severidad IN ('BAJA','MEDIA','ALTA','CRITICA')),
    estado VARCHAR(16) NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO','RECONOCIDO','VINCULADO','CERRADO')),
    id_ci INT REFERENCES elemento_configuracion(id_ci),
    id_ticket INT REFERENCES ticket(id_ticket),
    detectado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    reconocido_por INT REFERENCES usuario(id_usuario),
    reconocido_en TIMESTAMPTZ,
    cerrado_por INT REFERENCES usuario(id_usuario),
    cerrado_en TIMESTAMPTZ,
    usuario_creacion INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_evento_servicio_estado_fecha ON evento_servicio(estado, detectado_en DESC) WHERE estado_registro=true;

CREATE TABLE IF NOT EXISTS resiliencia_servicio (
    id_resiliencia SERIAL PRIMARY KEY,
    id_servicio INT NOT NULL UNIQUE REFERENCES servicio_catalogo(id_servicio),
    objetivo_disponibilidad NUMERIC(5,2) NOT NULL DEFAULT 99.00 CHECK (objetivo_disponibilidad BETWEEN 0 AND 100),
    disponibilidad_observada NUMERIC(5,2) CHECK (disponibilidad_observada BETWEEN 0 AND 100),
    rto_horas NUMERIC(8,2) CHECK (rto_horas >= 0),
    rpo_horas NUMERIC(8,2) CHECK (rpo_horas >= 0),
    umbral_capacidad_pct SMALLINT CHECK (umbral_capacidad_pct BETWEEN 1 AND 100),
    consumo_capacidad_pct SMALLINT CHECK (consumo_capacidad_pct BETWEEN 0 AND 100),
    plan_continuidad TEXT NOT NULL,
    ultima_prueba TIMESTAMPTZ,
    proxima_prueba TIMESTAMPTZ,
    resultado_ultima_prueba TEXT,
    id_responsable INT REFERENCES usuario(id_usuario),
    usuario_creacion INT NOT NULL REFERENCES usuario(id_usuario),
    usuario_modificacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS proveedor_ti (
    id_proveedor SERIAL PRIMARY KEY,
    codigo_proveedor VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(160) NOT NULL,
    tipo_servicio VARCHAR(100) NOT NULL,
    contacto_nombre VARCHAR(120),
    contacto_correo VARCHAR(160),
    contacto_telefono VARCHAR(40),
    numero_contrato VARCHAR(80),
    fecha_inicio DATE,
    fecha_vencimiento DATE,
    servicio_soportado VARCHAR(180),
    compromiso_sla TEXT,
    evaluacion_desempeno SMALLINT CHECK (evaluacion_desempeno BETWEEN 1 AND 5),
    estado VARCHAR(16) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO','EN_REVISION','VENCIDO','INACTIVO')),
    observaciones TEXT,
    usuario_creacion INT NOT NULL REFERENCES usuario(id_usuario),
    usuario_modificacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN NOT NULL DEFAULT true,
    CHECK (fecha_vencimiento IS NULL OR fecha_inicio IS NULL OR fecha_vencimiento >= fecha_inicio)
);
CREATE INDEX IF NOT EXISTS idx_proveedor_ti_vencimiento ON proveedor_ti(fecha_vencimiento) WHERE estado_registro=true;

CREATE TABLE IF NOT EXISTS configuracion_rfc (
    id_configuracion SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id_configuracion=1),
    perfiles_solicitantes SMALLINT[] NOT NULL DEFAULT ARRAY[2,8]::SMALLINT[],
    exige_ci BOOLEAN NOT NULL DEFAULT false,
    exige_plan_pruebas BOOLEAN NOT NULL DEFAULT false,
    permite_emergencia BOOLEAN NOT NULL DEFAULT true,
    usuario_modificacion INT REFERENCES usuario(id_usuario),
    fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO configuracion_rfc(id_configuracion) VALUES(1) ON CONFLICT(id_configuracion) DO NOTHING;

-- Retira los dos accesos añadidos en la base activa a páginas genéricas que ya no existen.
UPDATE opciones_menu SET estado_registro=false WHERE id_opcion_menu IN (137,138);

-- Mantiene las vistas de Incidentes y Solicitudes en Operación y Soporte.
UPDATE opciones_menu SET id_padre=120, nivel=3, orden=5, nombre='Gestión de incidentes', url_menu='/tickets/gestion/incidentes', estado_registro=true WHERE id_opcion_menu=135;
UPDATE opciones_menu SET id_padre=120, nivel=3, orden=6, nombre='Gestión de solicitudes', url_menu='/tickets/gestion/solicitudes', estado_registro=true WHERE id_opcion_menu=136;

-- Opciones adicionales que ya estaban en la base activa, ahora incluidas en el catálogo mantenible.
INSERT INTO opciones_menu (id_opcion_menu,nombre,url_menu,descripcion,id_padre,nivel,orden,estado_registro) VALUES
(135,'Gestión de incidentes','/tickets/gestion/incidentes','Bandeja de trabajo dedicada a incidentes',120,3,5,true),
(136,'Gestión de solicitudes','/tickets/gestion/solicitudes','Bandeja de trabajo dedicada a solicitudes de servicio',120,3,6,true),
(340,'Modelado de clases CI','/activos/cmdb/tipos','Configuración del modelo de elementos de configuración',300,2,4,true),
(550,'Diseño de formularios y vistas','/admin/tickets-vistas','Configuración de formularios y vistas de trabajo',500,2,5,true),
(560,'Comunicaciones y notificaciones','/admin/notificaciones','Canales y plantillas de comunicación del sistema',500,2,6,true),
(570,'Auditoría y mantenimiento','/admin/auditoria-sistema','Auditoría y mantenimiento administrativo',500,2,7,true),
(580,'Experiencia y conocimiento','/admin/portal-autoservicio','Configuración administrativa del portal y conocimiento',500,2,8,true),
(551,'Vistas de ticket por perfil','/admin/tickets-vistas','Configuración de vistas por perfil',550,3,1,true),
(552,'Constructor de formularios','/admin/tickets-formularios','Configuración de formularios',550,3,2,true),
(561,'Plantillas de correo y canales','/admin/notificaciones','Plantillas y canales de notificación',560,3,1,true),
(571,'Auditoría integral','/admin/auditoria-sistema','Trazabilidad integral del sistema',570,3,1,true),
(572,'Diseñador de dashboards','/admin/reportes-disenador','Diseño de tableros e indicadores',400,2,2,true),
(573,'Mantenimiento de datos','/admin/mantenimiento-datos','Retención, depuración y mantenimiento de datos',570,3,2,true),
(581,'Configuración del portal','/admin/portal-autoservicio','Gestión administrativa de la experiencia del portal',580,3,1,true),
(582,'Gobierno del conocimiento','/admin/conocimiento-config','Revisión y publicación de artículos de conocimiento',580,3,2,true),
(600,'Operación y gobierno de servicios','/operacion','Eventos, resiliencia y terceros de servicios TI',NULL,1,6,true),
(610,'Eventos y alertas','/operacion/eventos','Registro y triage de eventos vinculados a CI e incidentes',600,2,1,true),
(620,'Disponibilidad, capacidad y continuidad','/operacion/resiliencia','Objetivos de servicio, resiliencia y pruebas de continuidad',600,2,2,true),
(700,'Gestión de problemas','/problemas','Análisis de causa raíz y errores conocidos',NULL,1,7,true),
(710,'Registro de problemas','/problemas','Investigación y seguimiento de problemas ITSM',700,2,1,true),
(720,'Errores conocidos (KEDB)','/problemas/kedb','Consulta de errores conocidos y workarounds',700,2,2,true),
(800,'Proveedores y contratos TI','/proveedores','Relaciones, contratos y desempeño de proveedores de TI',NULL,1,8,true)
ON CONFLICT (id_opcion_menu) DO UPDATE SET nombre=EXCLUDED.nombre,url_menu=EXCLUDED.url_menu,descripcion=EXCLUDED.descripcion,id_padre=EXCLUDED.id_padre,nivel=EXCLUDED.nivel,orden=EXCLUDED.orden,estado_registro=true;

-- Árboles del menú usan el comportamiento acordeón de sus grupos padre.
UPDATE opciones_menu SET orden=6 WHERE id_opcion_menu=600;
UPDATE opciones_menu SET orden=7 WHERE id_opcion_menu=700;
UPDATE opciones_menu SET orden=8 WHERE id_opcion_menu=800;
UPDATE opciones_menu SET url_menu='/admin/rfc',descripcion='Plantillas RFC, campos obligatorios y perfiles solicitantes permitidos' WHERE id_opcion_menu=522;

-- Sustituye el mapa de menú por la matriz activa de nueve perfiles. Las rutas/API conservan sus propios controles RBAC.
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (
100,110,111,112,113,114,120,121,122,123,124,130,131,132,133,134,135,136,137,138,140,141,142,
200,210,211,212,213,220,221,300,310,320,330,340,400,410,500,510,511,512,513,520,521,522,
530,531,532,540,541,550,551,552,560,561,570,571,572,573,580,581,582,600,610,620,700,710,720,800
);

WITH matriz(id_opcion_menu,id_perfil) AS (VALUES
(100,2),(110,2),(112,2),(114,2),(120,2),(121,2),(122,2),(123,2),(124,2),(135,2),(136,2),(200,2),(210,2),(211,2),(212,2),(213,2),(300,2),(310,2),(320,2),(600,2),(610,2),(620,2),(700,2),(710,2),(720,2),
(100,3),(110,3),(111,3),(112,3),(113,3),(114,3),
(100,4),(120,4),(122,4),(124,4),(130,4),(131,4),(132,4),(133,4),(134,4),(135,4),(136,4),(200,4),(210,4),(212,4),(213,4),(400,4),(410,4),(500,4),(530,4),(531,4),(532,4),(600,4),(610,4),(620,4),(700,4),(710,4),(720,4),
(100,5),(110,5),(111,5),(112,5),(113,5),(140,5),(141,5),(142,5),(400,5),(410,5),
(100,6),(130,6),(133,6),(134,6),(200,6),(210,6),(213,6),(300,6),(310,6),(320,6),(330,6),(340,6),(400,6),(410,6),(500,6),(520,6),(521,6),(540,6),(541,6),(570,6),(571,6),(600,6),(610,6),(620,6),(700,6),(710,6),(720,6),(800,6),
(200,7),(210,7),(212,7),(213,7),(220,7),(221,7),(300,7),(320,7),(600,7),(610,7),(620,7),(700,7),(710,7),(720,7),(800,7),
(200,8),(210,8),(211,8),(212,8),(213,8),(220,8),(221,8),(300,8),(320,8),(600,8),(610,8),(620,8),(700,8),(710,8),(720,8),(800,8),
(200,9),(210,9),(212,9),(213,9),(300,9),(310,9),(320,9),(330,9),(340,9),(600,9),(610,9),(620,9),(700,9),(710,9),(720,9),(800,9),
(400,1),(410,1),(500,1),(510,1),(511,1),(512,1),(513,1),(520,1),(521,1),(522,1),(530,1),(531,1),(532,1),(540,1),(541,1),(550,1),(551,1),(552,1),(560,1),(561,1),(570,1),(571,1),(572,1),(573,1),(580,1),(581,1),(582,1)
)
INSERT INTO opciones_menu_perfiles (id_opcion_menu,id_perfil,orden,estado_registro)
SELECT id_opcion_menu,id_perfil,ROW_NUMBER() OVER (PARTITION BY id_perfil ORDER BY id_opcion_menu),true FROM matriz
ON CONFLICT (id_opcion_menu,id_perfil) DO UPDATE SET orden=EXCLUDED.orden,estado_registro=true;

SELECT setval('opciones_menu_id_opcion_menu_seq',(SELECT MAX(id_opcion_menu) FROM opciones_menu));

COMMIT;
