const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateEtapa4() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('1. Agregando columnas de Etapa 4 (Definicion de Tickets ITIL v4) a la tabla ticket...');

    await client.query(`
      -- Relacion con el Catalogo de Servicios (Etapa 2)
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS id_servicio INT REFERENCES servicio_catalogo(id_servicio);

      -- Relacion con el Departamento de TI responsable (Etapa 3)
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS id_departamento INT REFERENCES departamento_ti(id_departamento);

      -- Canal de ingreso del requerimiento (ITIL 4 Service Desk Practice)
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS canal_comunicacion VARCHAR(30) NOT NULL DEFAULT 'PORTAL_WEB';

      -- Estado de Aprobacion Jerarquica (ITIL 4 / SOX / ISO 27001)
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS estado_aprobacion VARCHAR(30) NOT NULL DEFAULT 'NO_APLICA';

      -- Paso actual del workflow del servicio (Etapa 2)
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS id_paso_actual INT REFERENCES servicio_workflow_paso(id_paso);

      -- Categoria de resolucion / Causa raiz tipificada (ITIL 4 Incident & Problem Management)
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS categoria_resolucion VARCHAR(60);

      -- Evaluacion de satisfaccion del cliente (CSAT - ITIL 4 / ISO 20000)
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS calificacion_csat SMALLINT CHECK (calificacion_csat BETWEEN 1 AND 5);
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS comentario_csat TEXT;
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS fecha_csat TIMESTAMPTZ;

      -- Metricas avanzadas de pausa de SLA
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS tiempo_pausado_minutos INT NOT NULL DEFAULT 0;
      ALTER TABLE ticket ADD COLUMN IF NOT EXISTS fecha_ultima_pausa TIMESTAMPTZ;
    `);

    console.log('2. Creando tabla ticket_aprobacion para auditoria de compuertas...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_aprobacion (
        id_ticket_aprobacion SERIAL PRIMARY KEY,
        id_ticket             INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE,
        id_usuario_aprobador  INT NOT NULL REFERENCES usuario(id_usuario),
        id_paso_workflow      INT REFERENCES servicio_workflow_paso(id_paso),
        estado_decision       VARCHAR(20) NOT NULL, -- APROBADO, RECHAZADO, OBSERVADO
        comentario            TEXT,
        fecha_decision        TIMESTAMPTZ NOT NULL DEFAULT now(),
        estado_registro       BOOLEAN NOT NULL DEFAULT true
      );
    `);

    console.log('3. Creando indices para rendimiento de tickets...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ticket_servicio ON ticket(id_servicio);
      CREATE INDEX IF NOT EXISTS idx_ticket_departamento ON ticket(id_departamento);
      CREATE INDEX IF NOT EXISTS idx_ticket_aprobacion_estado ON ticket(estado_aprobacion);
      CREATE INDEX IF NOT EXISTS idx_ticket_aprobacion_ticket ON ticket_aprobacion(id_ticket);
    `);

    console.log('4. Actualizando tickets existentes con valores coherentes...');
    // Si hay tickets existentes sin departamento, asignarlos al depto N1 por defecto
    await client.query(`
      UPDATE ticket SET id_departamento = 1 WHERE id_departamento IS NULL;
    `);

    await client.query('COMMIT');
    console.log('Migracion de Etapa 4 completada exitosamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en migracion de Etapa 4:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateEtapa4();
