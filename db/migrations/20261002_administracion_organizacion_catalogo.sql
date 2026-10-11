BEGIN;

-- Departamentos organizacionales del cliente, separados de los grupos resolutores de TI.
CREATE TABLE IF NOT EXISTS departamento_empresa (
  id_departamento_empresa SERIAL PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  descripcion TEXT,
  estado_registro BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS id_departamento_empresa INT REFERENCES departamento_empresa(id_departamento_empresa);
ALTER TABLE ticket ADD COLUMN IF NOT EXISTS id_departamento_empresa INT REFERENCES departamento_empresa(id_departamento_empresa);
UPDATE ticket t SET id_departamento_empresa=u.id_departamento_empresa FROM usuario u
WHERE t.id_usuario_solicitante=u.id_usuario AND t.id_departamento_empresa IS NULL AND u.id_departamento_empresa IS NOT NULL;

-- Categorías válidas para cada tipo, con sigla y SLA de partida configurables.
ALTER TABLE categoria_ticket ADD COLUMN IF NOT EXISTS codigo_corto VARCHAR(10);
ALTER TABLE categoria_ticket ADD COLUMN IF NOT EXISTS sla_default_respuesta INT NOT NULL DEFAULT 4;
ALTER TABLE categoria_ticket ADD COLUMN IF NOT EXISTS sla_default_resolucion INT NOT NULL DEFAULT 24;
UPDATE categoria_ticket SET codigo_corto = CASE id_categoria
  WHEN 1 THEN 'HW' WHEN 2 THEN 'RED' WHEN 3 THEN 'SW'
  WHEN 4 THEN 'ACC' WHEN 5 THEN 'HW' WHEN 6 THEN 'SW'
  ELSE 'CAT' || id_categoria::text END
WHERE codigo_corto IS NULL;
UPDATE categoria_ticket SET sla_default_respuesta=2,sla_default_resolucion=8 WHERE id_tipo_ticket=1;
UPDATE categoria_ticket SET sla_default_respuesta=4,sla_default_resolucion=24 WHERE id_tipo_ticket=2;
UPDATE categoria_ticket SET sla_default_respuesta=1,sla_default_resolucion=4 WHERE id_tipo_ticket=1 AND id_categoria=2;
UPDATE categoria_ticket SET sla_default_respuesta=1,sla_default_resolucion=2 WHERE id_tipo_ticket=1 AND id_categoria=7;

INSERT INTO categoria_ticket (id_categoria,id_tipo_ticket,nombre,descripcion,codigo_corto,sla_default_respuesta,sla_default_resolucion,estado_registro) VALUES
(7,1,'Seguridad de la Información','Phishing, malware, acceso sospechoso y otros incidentes de seguridad','SEC',1,2,true),
(8,2,'Redes y Comunicaciones','Solicitudes de conectividad, puntos de red y telefonía','RED',4,24,true),
(9,2,'Datos y Copias de Seguridad','Restauración de archivos y solicitudes de recuperación de datos','BKP',4,24,true),
(10,2,'Cambios RFC (legado)','Categoría histórica; los cambios se gestionan en el módulo de Cambios','RFC',8,24,false)
ON CONFLICT (id_categoria) DO UPDATE SET nombre=EXCLUDED.nombre,descripcion=EXCLUDED.descripcion,codigo_corto=EXCLUDED.codigo_corto,sla_default_respuesta=EXCLUDED.sla_default_respuesta,sla_default_resolucion=EXCLUDED.sla_default_resolucion,estado_registro=EXCLUDED.estado_registro;

-- Corrige categorías que estaban ligadas a un tipo ITIL incompatible.
UPDATE servicio_catalogo SET id_categoria=9 WHERE id_servicio=11;
UPDATE servicio_catalogo SET id_categoria=8 WHERE id_servicio IN (13,14,17);
UPDATE servicio_catalogo SET id_categoria=7 WHERE id_servicio=16;
UPDATE servicio_catalogo SET id_categoria=10,estado_registro=false,motivo_inactivacion='Los RFC se administran en el módulo de Cambios, no como servicios del catálogo de solicitudes.' WHERE id_servicio IN (19,20);
UPDATE servicio_catalogo SET id_categoria=5 WHERE id_servicio=22;
UPDATE servicio_catalogo SET estado_registro=false,motivo_inactivacion='La gestión de problemas tiene módulo propio; no es una oferta del catálogo de consumo.' WHERE id_servicio=21;
UPDATE ticket SET id_categoria=7 WHERE id_ticket=6 AND id_tipo_ticket=1 AND id_categoria=4;
UPDATE ticket SET id_categoria=CASE id_categoria WHEN 1 THEN 5 WHEN 2 THEN 8 WHEN 3 THEN 6 ELSE 4 END
WHERE id_tipo_ticket=2 AND id_categoria IN (1,2,3);

CREATE UNIQUE INDEX IF NOT EXISTS uq_categoria_id_tipo ON categoria_ticket(id_categoria,id_tipo_ticket);
CREATE UNIQUE INDEX IF NOT EXISTS uq_categoria_tipo_codigo ON categoria_ticket(id_tipo_ticket,codigo_corto);
ALTER TABLE servicio_catalogo DROP CONSTRAINT IF EXISTS servicio_catalogo_id_categoria_fkey;
ALTER TABLE servicio_catalogo ADD CONSTRAINT fk_servicio_categoria_tipo
  FOREIGN KEY(id_categoria,id_tipo_ticket) REFERENCES categoria_ticket(id_categoria,id_tipo_ticket);
ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_id_categoria_id_tipo_ticket_fkey;
ALTER TABLE ticket ADD CONSTRAINT fk_ticket_categoria_tipo
  FOREIGN KEY(id_categoria,id_tipo_ticket) REFERENCES categoria_ticket(id_categoria,id_tipo_ticket);

-- Uniforma identificadores existentes según tipo/categoría/correlativo.
WITH numerados AS (
  SELECT s.id_servicio,
         'SRV-' || CASE s.id_tipo_ticket WHEN 1 THEN 'INC' ELSE 'SOL' END || '-' || c.codigo_corto || '-' ||
         LPAD(ROW_NUMBER() OVER (PARTITION BY s.id_tipo_ticket,s.id_categoria ORDER BY s.id_servicio)::text,3,'0') AS codigo
  FROM servicio_catalogo s JOIN categoria_ticket c ON c.id_categoria=s.id_categoria AND c.id_tipo_ticket=s.id_tipo_ticket
)
UPDATE servicio_catalogo s SET codigo_servicio=n.codigo FROM numerados n WHERE n.id_servicio=s.id_servicio;

-- Audiencias del catálogo. El administrador podrá ajustar estos perfiles desde el portal.
CREATE TABLE IF NOT EXISTS servicio_catalogo_perfiles (
  id_servicio INT NOT NULL REFERENCES servicio_catalogo(id_servicio) ON DELETE CASCADE,
  id_perfil INT NOT NULL REFERENCES perfiles(id_perfil),
  PRIMARY KEY(id_servicio,id_perfil)
);
INSERT INTO servicio_catalogo_perfiles(id_servicio,id_perfil)
SELECT s.id_servicio,p.id_perfil FROM servicio_catalogo s CROSS JOIN (VALUES(2),(3),(4),(5),(8)) AS p(id_perfil)
WHERE s.estado_registro=true ON CONFLICT DO NOTHING;

-- Tipos RFC permitidos: Normal, estándar y emergencia tienen evaluación distinta.
ALTER TABLE configuracion_rfc ADD COLUMN IF NOT EXISTS tipos_rfc TEXT[] NOT NULL DEFAULT ARRAY['ESTANDAR','NORMAL','EMERGENCIA']::TEXT[];

-- Reorganiza navegación: incidentes, solicitudes, problemas y cambios son módulos distintos.
UPDATE opciones_menu SET nombre='Incidentes',id_padre=NULL,nivel=1,orden=2,estado_registro=true,url_menu='/tickets/gestion/incidentes' WHERE id_opcion_menu=135;
UPDATE opciones_menu SET nombre='Solicitudes de servicio',id_padre=NULL,nivel=1,orden=3,estado_registro=true,url_menu='/tickets/gestion/solicitudes' WHERE id_opcion_menu=136;
UPDATE opciones_menu SET nombre='Configuración',descripcion='Configuración funcional y técnica del sistema' WHERE id_opcion_menu=500;
UPDATE opciones_menu SET nombre='Estructura organizacional y soporte' WHERE id_opcion_menu=530;
UPDATE opciones_menu SET nombre='Departamentos de TI' WHERE id_opcion_menu=531;
INSERT INTO opciones_menu(id_opcion_menu,nombre,url_menu,descripcion,id_padre,nivel,orden,estado_registro)
VALUES(533,'Departamentos empresariales','/admin/departamentos-empresa','Unidades organizativas configurables de cada cliente',530,3,3,true)
ON CONFLICT(id_opcion_menu) DO UPDATE SET nombre=EXCLUDED.nombre,url_menu=EXCLUDED.url_menu,descripcion=EXCLUDED.descripcion,id_padre=EXCLUDED.id_padre,nivel=EXCLUDED.nivel,orden=EXCLUDED.orden,estado_registro=true;

-- El Gestor de Área obtiene una bandeja dedicada a colaboradores de su unidad organizativa.
INSERT INTO opciones_menu(id_opcion_menu,nombre,url_menu,descripcion,id_padre,nivel,orden,estado_registro)
VALUES(143,'Colaboradores de mi área','/tickets/gestion/colaboradores','Colaboradores y tickets de la unidad empresarial asignada al Gestor de Área',140,3,3,true)
ON CONFLICT(id_opcion_menu) DO UPDATE SET nombre=EXCLUDED.nombre,url_menu=EXCLUDED.url_menu,descripcion=EXCLUDED.descripcion,id_padre=EXCLUDED.id_padre,nivel=EXCLUDED.nivel,orden=EXCLUDED.orden,estado_registro=true;

-- Estos enlaces estaban inactivos y apuntaban a páginas retiradas; se eliminan de la administración del menú.
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (137,138);
DELETE FROM opciones_menu WHERE id_opcion_menu IN (137,138);

-- Actualiza las asignaciones únicamente para opciones administradas por esta migración.
INSERT INTO opciones_menu_perfiles(id_opcion_menu,id_perfil,orden,estado_registro) VALUES
(533,1,1,true),(143,5,1,true)
ON CONFLICT(id_opcion_menu,id_perfil) DO UPDATE SET estado_registro=true,orden=EXCLUDED.orden;
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu=533 AND id_perfil<>1;

UPDATE opciones_menu SET orden=4 WHERE id_opcion_menu=700;
UPDATE opciones_menu SET orden=5 WHERE id_opcion_menu=200;
UPDATE opciones_menu SET orden=6 WHERE id_opcion_menu=600;
UPDATE opciones_menu SET orden=7 WHERE id_opcion_menu=300;
UPDATE opciones_menu SET orden=8 WHERE id_opcion_menu=800;
UPDATE opciones_menu SET orden=9 WHERE id_opcion_menu=400;
UPDATE opciones_menu SET orden=10 WHERE id_opcion_menu=500;

INSERT INTO configuracion_rfc(id_configuracion) VALUES(1) ON CONFLICT(id_configuracion) DO NOTHING;
SELECT setval('categoria_ticket_id_categoria_seq',(SELECT MAX(id_categoria) FROM categoria_ticket));
SELECT setval('opciones_menu_id_opcion_menu_seq',(SELECT MAX(id_opcion_menu) FROM opciones_menu));
COMMIT;
