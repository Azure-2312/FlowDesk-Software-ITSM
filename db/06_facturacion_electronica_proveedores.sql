-- ============================================================================
-- 06 · FACTURACIÓN ELECTRÓNICA DE PROVEEDORES (SUNAT vía fact_api)
-- ----------------------------------------------------------------------------
-- Integra la API de facturación electrónica (https://github.com/angelitosystems/fact_api)
-- en la práctica de Gestión de Activos (ITIL v4: IT Asset Management /
-- Supplier Management). El proveedor que entrega activos emite su comprobante
-- electrónico (factura 01 / boleta 03) a la institución a través de FlowDesk;
-- FlowDesk lo envía a SUNAT por fact_api, guarda el estado/CDR y lo vincula a
-- la recepción y a los activos. Una sola base de información; cada perfil ve:
--   · Gestor de Activos (9) .... registro, emisión y envío a SUNAT
--   · Gestor de Área (5) ....... conformidad de los comprobantes de su área
--   · Auditor (6) .............. consulta y trazabilidad (solo lectura)
--   · Administrador (1) ........ todo + configuración de la integración
-- Idempotente: se puede ejecutar más de una vez.
-- ============================================================================

-- 1. Datos tributarios del proveedor y su vínculo con fact_api ---------------
ALTER TABLE proveedor_ti ADD COLUMN IF NOT EXISTS ruc VARCHAR(11);
ALTER TABLE proveedor_ti ADD COLUMN IF NOT EXISTS razon_social VARCHAR(255);
ALTER TABLE proveedor_ti ADD COLUMN IF NOT EXISTS fact_company_id INTEGER;
ALTER TABLE proveedor_ti ADD COLUMN IF NOT EXISTS fact_branch_id INTEGER;
ALTER TABLE proveedor_ti ADD COLUMN IF NOT EXISTS serie_factura VARCHAR(4) DEFAULT 'F001';
ALTER TABLE proveedor_ti ADD COLUMN IF NOT EXISTS serie_boleta VARCHAR(4) DEFAULT 'B001';
CREATE UNIQUE INDEX IF NOT EXISTS ux_proveedor_ti_ruc ON proveedor_ti (ruc) WHERE ruc IS NOT NULL AND estado_registro = true;

-- 2. Comprobante electrónico del proveedor ------------------------------------
CREATE TABLE IF NOT EXISTS comprobante_proveedor (
  id_comprobante          SERIAL PRIMARY KEY,
  codigo                  VARCHAR(20) NOT NULL UNIQUE,              -- CPE-2026-0001
  id_proveedor            INTEGER NOT NULL REFERENCES proveedor_ti(id_proveedor),
  id_recepcion            INTEGER REFERENCES recepcion_activo(id_recepcion),
  id_contrato             INTEGER REFERENCES contrato_ti(id_contrato),
  id_departamento_empresa INTEGER REFERENCES departamento_empresa(id_departamento_empresa), -- área destinataria
  tipo_documento          VARCHAR(2) NOT NULL CHECK (tipo_documento IN ('01', '03')),
  serie                   VARCHAR(4) NOT NULL,
  correlativo             VARCHAR(10),                              -- lo asigna fact_api
  fecha_emision           DATE NOT NULL,
  fecha_vencimiento       DATE,
  moneda                  VARCHAR(3) NOT NULL DEFAULT 'PEN' CHECK (moneda IN ('PEN', 'USD')),
  forma_pago              VARCHAR(10) NOT NULL DEFAULT 'Contado' CHECK (forma_pago IN ('Contado', 'Credito')),
  subtotal                NUMERIC(14, 2) NOT NULL DEFAULT 0,
  igv                     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total                   NUMERIC(14, 2) NOT NULL DEFAULT 0,
  -- Ciclo: BORRADOR → REGISTRADO (en fact_api) → ACEPTADO | RECHAZADO | ERROR
  estado                  VARCHAR(15) NOT NULL DEFAULT 'BORRADOR'
                          CHECK (estado IN ('BORRADOR', 'REGISTRADO', 'ACEPTADO', 'RECHAZADO', 'ERROR', 'ANULADO')),
  id_documento_api        INTEGER,                                  -- id del documento en fact_api
  estado_sunat            VARCHAR(30),                              -- valor devuelto por fact_api
  codigo_respuesta_sunat  VARCHAR(20),
  mensaje_sunat           TEXT,
  fecha_envio_sunat       TIMESTAMPTZ,
  -- Conformidad del área usuaria (recepción conforme del bien)
  conformidad             VARCHAR(12) NOT NULL DEFAULT 'PENDIENTE'
                          CHECK (conformidad IN ('PENDIENTE', 'CONFORME', 'OBSERVADO')),
  observacion_conformidad TEXT,
  id_usuario_conformidad  INTEGER REFERENCES usuario(id_usuario),
  fecha_conformidad       TIMESTAMPTZ,
  observaciones           TEXT,
  usuario_creacion        INTEGER REFERENCES usuario(id_usuario),
  fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT now(),
  usuario_modificacion    INTEGER REFERENCES usuario(id_usuario),
  fecha_modificacion      TIMESTAMPTZ,
  estado_registro         BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_comprobante_proveedor_proveedor ON comprobante_proveedor (id_proveedor);
CREATE INDEX IF NOT EXISTS ix_comprobante_proveedor_area ON comprobante_proveedor (id_departamento_empresa);
CREATE INDEX IF NOT EXISTS ix_comprobante_proveedor_estado ON comprobante_proveedor (estado, conformidad);

-- 3. Ítems del comprobante (opcionalmente vinculados a un activo) --------------
CREATE TABLE IF NOT EXISTS comprobante_proveedor_detalle (
  id_detalle       SERIAL PRIMARY KEY,
  id_comprobante   INTEGER NOT NULL REFERENCES comprobante_proveedor(id_comprobante) ON DELETE CASCADE,
  id_activo        INTEGER REFERENCES activo(id_activo),
  codigo           VARCHAR(50) NOT NULL,
  descripcion      VARCHAR(500) NOT NULL,
  unidad           VARCHAR(3) NOT NULL DEFAULT 'NIU',
  cantidad         NUMERIC(12, 3) NOT NULL CHECK (cantidad > 0),
  valor_unitario   NUMERIC(14, 4) NOT NULL CHECK (valor_unitario >= 0),  -- sin IGV
  porcentaje_igv   NUMERIC(5, 2) NOT NULL DEFAULT 18,
  tip_afe_igv      VARCHAR(2) NOT NULL DEFAULT '10',
  subtotal         NUMERIC(14, 2) NOT NULL DEFAULT 0,
  igv              NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total            NUMERIC(14, 2) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_comprobante_detalle_comprobante ON comprobante_proveedor_detalle (id_comprobante);

-- 4. Bitácora de trazabilidad (lo que ve el Auditor) --------------------------
CREATE TABLE IF NOT EXISTS comprobante_proveedor_evento (
  id_evento        SERIAL PRIMARY KEY,
  id_comprobante   INTEGER NOT NULL REFERENCES comprobante_proveedor(id_comprobante) ON DELETE CASCADE,
  accion           VARCHAR(40) NOT NULL,
  estado_anterior  VARCHAR(15),
  estado_nuevo     VARCHAR(15),
  detalle          JSONB,
  id_usuario       INTEGER REFERENCES usuario(id_usuario),
  id_perfil        INTEGER,
  fecha            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_comprobante_evento_comprobante ON comprobante_proveedor_evento (id_comprobante, fecha);

-- 5. Configuración de la integración (sin secretos: las credenciales van en .env)
INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, usuario_modificacion, fecha_modificacion)
SELECT 'integracion_fact_api', 'INTEGRACIONES',
       'API de facturación electrónica SUNAT (fact_api) para comprobantes de proveedores de activos',
       '{"habilitado": false, "url_base": "http://localhost:8000", "ruc_institucion": "", "razon_social_institucion": "", "direccion_institucion": "", "tiempo_espera_ms": 20000, "exigir_conformidad_para_costo": true}'::jsonb,
       1, now()
 WHERE NOT EXISTS (SELECT 1 FROM configuracion_sistema WHERE clave = 'integracion_fact_api');

-- 6. Menú: Activos → "Comprobantes electrónicos" y permisos por perfil --------
UPDATE opciones_menu SET orden = orden + 1
 WHERE id_padre = (SELECT id_padre FROM opciones_menu WHERE url_menu = '/plataforma/activos/contratos' LIMIT 1)
   AND orden >= 7
   AND NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/plataforma/activos/comprobantes');

INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
SELECT 21276, 'Comprobantes electrónicos', '/plataforma/activos/comprobantes',
       'Facturas y boletas electrónicas (SUNAT) de proveedores de activos',
       (SELECT id_padre FROM opciones_menu WHERE url_menu = '/plataforma/activos/contratos' LIMIT 1), 3, 7, true
 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/plataforma/activos/comprobantes');

SELECT setval('opciones_menu_id_opcion_menu_seq', GREATEST((SELECT MAX(id_opcion_menu) FROM opciones_menu), 1));

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT 21276, p.id_perfil, 7, true
  FROM (VALUES (1), (5), (6), (9)) AS p(id_perfil)
 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles x WHERE x.id_opcion_menu = 21276 AND x.id_perfil = p.id_perfil);

-- Vistas (pestañas) de la pantalla por perfil: misma información, distinto alcance
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro)
SELECT 21276, v.id_perfil, v.vista, true
  FROM (VALUES
          (9, 'registro'), (9, 'consulta'),      -- Gestor de Activos
          (5, 'conformidad'),                    -- Gestor de Área
          (6, 'consulta')                        -- Auditor
       ) AS v(id_perfil, vista)
 WHERE NOT EXISTS (
   SELECT 1 FROM opciones_menu_vistas_perfiles x
    WHERE x.id_opcion_menu = 21276 AND x.id_perfil = v.id_perfil AND x.vista = v.vista
 );

-- Configuración de la integración: pestaña nueva en Activos → Configuración (solo Administrador;
-- el Administrador ve todas las vistas registradas sin necesitar filas aquí).
