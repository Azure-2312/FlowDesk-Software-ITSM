-- ============================================================================
-- 08 · ARCHIVO DE COMPROBANTES ELECTRÓNICOS (XML, CDR y PDF)
-- ----------------------------------------------------------------------------
-- FlowDesk conserva su propia copia de cada comprobante emitido por Nubefact:
--   · xml → comprobante electrónico firmado (el documento legal)
--   · cdr → constancia de recepción de SUNAT (prueba de aceptación o rechazo)
--   · pdf → representación impresa
-- Cada archivo se guarda una sola vez, con su huella SHA-256 para demostrar
-- que no fue alterado. La tabla es de solo inserción: un trigger impide
-- modificar o borrar los archivos.
-- Requiere 06_facturacion_electronica_proveedores.sql. Idempotente.
-- ============================================================================

CREATE TABLE IF NOT EXISTS comprobante_proveedor_archivo (
  id_archivo           SERIAL PRIMARY KEY,
  id_comprobante       INTEGER NOT NULL REFERENCES comprobante_proveedor(id_comprobante) ON DELETE RESTRICT,
  tipo                 VARCHAR(3) NOT NULL CHECK (tipo IN ('xml', 'cdr', 'pdf')),
  nombre               VARCHAR(120) NOT NULL,
  tipo_contenido       VARCHAR(100) NOT NULL,
  tamano_bytes         INTEGER NOT NULL CHECK (tamano_bytes > 0),
  hash_sha256          CHAR(64) NOT NULL,
  contenido            BYTEA NOT NULL,
  origen               VARCHAR(100),                       -- servidor del que se descargó
  id_usuario           INTEGER REFERENCES usuario(id_usuario),
  fecha_almacenamiento TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ux_comprobante_archivo_tipo UNIQUE (id_comprobante, tipo)
);
CREATE INDEX IF NOT EXISTS ix_comprobante_archivo_comprobante ON comprobante_proveedor_archivo (id_comprobante);

-- Solo inserción: los archivos de un comprobante no se modifican ni se borran.
CREATE OR REPLACE FUNCTION fn_bloquear_modificacion_archivo_cpe() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Los archivos de comprobantes electrónicos no se pueden modificar ni eliminar';
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_proteger_archivo_cpe'
                   AND tgrelid = 'comprobante_proveedor_archivo'::regclass) THEN
    CREATE TRIGGER trg_proteger_archivo_cpe
      BEFORE UPDATE OR DELETE ON comprobante_proveedor_archivo
      FOR EACH ROW EXECUTE FUNCTION fn_bloquear_modificacion_archivo_cpe();
  END IF;
END $$;
