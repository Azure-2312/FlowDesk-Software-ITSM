const fs = require('fs');
const { Pool } = require('pg');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.replace('DATABASE_URL=', '').trim().replace(/^['"]|['"]$/g, '');
      break;
    }
  }
}

const pool = new Pool({ connectionString: dbUrl });

async function migrar() {
  const client = await pool.connect();
  try {
    console.log("Iniciando migración de tablas de calendario y feriados...");
    await client.query("BEGIN;");

    // 1. Tabla calendario_feriados
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendario_feriados (
        id SERIAL PRIMARY KEY,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'nacional',
        alcance VARCHAR(50) NOT NULL DEFAULT 'toda_la_organizacion',
        sede_id INTEGER NULL,
        recurrente_anual BOOLEAN NOT NULL DEFAULT true,
        activo BOOLEAN NOT NULL DEFAULT true,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Tabla ventanas_mantenimiento
    await client.query(`
      CREATE TABLE IF NOT EXISTS ventanas_mantenimiento (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) NOT NULL UNIQUE,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        recurrencia VARCHAR(50) NOT NULL DEFAULT 'semanal',
        dias_semana JSONB DEFAULT '[]',
        regla_mensual JSONB DEFAULT '{}',
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        cruce_medianoche BOOLEAN NOT NULL DEFAULT false,
        fecha_vigencia_desde DATE,
        fecha_vigencia_hasta DATE,
        excepciones_fechas JSONB DEFAULT '[]',
        alcance_tipo VARCHAR(50) NOT NULL DEFAULT 'toda_la_organizacion',
        id_servicios JSONB DEFAULT '[]',
        clases_ci JSONB DEFAULT '[]',
        entornos JSONB DEFAULT '[]',
        id_departamentos JSONB DEFAULT '[]',
        tipos_cambio_permitidos JSONB NOT NULL DEFAULT '["estandar", "normal"]',
        capacidad_simultanea INTEGER NOT NULL DEFAULT 5,
        capacidad_acumulada INTEGER NOT NULL DEFAULT 20,
        permite_interrupcion BOOLEAN NOT NULL DEFAULT false,
        permite_en_feriados BOOLEAN NOT NULL DEFAULT false,
        color VARCHAR(30) NOT NULL DEFAULT '#2563eb',
        activo BOOLEAN NOT NULL DEFAULT true,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Tabla periodos_congelamiento
    await client.query(`
      CREATE TABLE IF NOT EXISTS periodos_congelamiento (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        motivo VARCHAR(100) NOT NULL DEFAULT 'cierre_contable',
        descripcion TEXT,
        fecha_inicio TIMESTAMPTZ NOT NULL,
        fecha_fin TIMESTAMPTZ NOT NULL,
        recurrente_anual BOOLEAN NOT NULL DEFAULT false,
        mes_dia_inicio VARCHAR(10) NULL,
        mes_dia_fin VARCHAR(10) NULL,
        alcance_tipo VARCHAR(50) NOT NULL DEFAULT 'toda_la_organizacion',
        id_servicios JSONB DEFAULT '[]',
        id_ci JSONB DEFAULT '[]',
        id_departamentos JSONB DEFAULT '[]',
        severidad VARCHAR(50) NOT NULL DEFAULT 'bloqueo_total',
        tipos_exentos JSONB DEFAULT '["emergencia"]',
        dias_aviso_anticipado INTEGER NOT NULL DEFAULT 7,
        color VARCHAR(30) NOT NULL DEFAULT '#dc2626',
        activo BOOLEAN NOT NULL DEFAULT true,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 4. Sembrar ventanas de mantenimiento de fábrica si la tabla está vacía
    const countVentanas = await client.query("SELECT COUNT(*) FROM ventanas_mantenimiento;");
    if (parseInt(countVentanas.rows[0].count) === 0) {
      console.log("Sembrando ventanas de mantenimiento de fábrica...");
      await client.query(`
        INSERT INTO ventanas_mantenimiento (
          codigo, nombre, descripcion, recurrencia, dias_semana, regla_mensual,
          hora_inicio, hora_fin, cruce_medianoche, alcance_tipo,
          tipos_cambio_permitidos, capacidad_simultanea, capacidad_acumulada,
          permite_interrupcion, permite_en_feriados, color, activo
        ) VALUES 
        (
          'VENT-SEM', 'Noche entre semana',
          'Ventana nocturna de lunes a jueves para cambios estándar y normales sin interrupción prolongada.',
          'semanal', '[1, 2, 3, 4]', '{}',
          '22:00:00', '05:00:00', true, 'toda_la_organizacion',
          '["estandar", "normal"]', 3, 12,
          false, false, '#3b82f6', false
        ),
        (
          'VENT-FDS', 'Fin de semana',
          'Ventana extendida para intervenciones mayores con ventana de interrupción autorizada.',
          'semanal', '[6, 0]', '{}',
          '22:00:00', '06:00:00', true, 'toda_la_organizacion',
          '["estandar", "normal", "emergencia"]', 5, 20,
          true, false, '#10b981', false
        ),
        (
          'VENT-PARCHES', 'Ventana mensual de parches',
          'Segundo sábado del mes para mantenimiento acumulativo y despliegue de parches de seguridad.',
          'mensual', '[]', '{"tipo": "posicion", "orden": 2, "dia_semana": 6}',
          '22:00:00', '06:00:00', true, 'servicios',
          '["estandar", "normal"]', 4, 10,
          true, false, '#8b5cf6', false
        );
      `);
    }

    // 5. Sembrar períodos de congelamiento de fábrica si la tabla está vacía
    const countCongelamiento = await client.query("SELECT COUNT(*) FROM periodos_congelamiento;");
    if (parseInt(countCongelamiento.rows[0].count) === 0) {
      console.log("Sembrando períodos de congelamiento de fábrica...");
      await client.query(`
        INSERT INTO periodos_congelamiento (
          nombre, motivo, descripcion, fecha_inicio, fecha_fin,
          recurrente_anual, mes_dia_inicio, mes_dia_fin, alcance_tipo,
          severidad, tipos_exentos, dias_aviso_anticipado, color, activo
        ) VALUES 
        (
          'Cierre Anual y Balance Contable', 'cierre_contable',
          'Período crítico de facturación, balance contable anual y consolidación financiera institucional.',
          '2026-12-20 00:00:00+00', '2027-01-05 23:59:59+00',
          true, '12-20', '01-05', 'toda_la_organizacion',
          'bloqueo_total', '["emergencia"]', 15, '#ef4444', true
        ),
        (
          'Cierre Contable Semestral', 'cierre_contable',
          'Restricción de cambios de alto impacto durante el cierre contable de mitad de año.',
          '2026-06-25 00:00:00+00', '2026-07-02 23:59:59+00',
          true, '06-25', '07-02', 'toda_la_organizacion',
          'bloqueo_con_excepcion', '["emergencia"]', 10, '#f97316', true
        ),
        (
          'Campaña Institucional Alta Demanda', 'campana',
          'Período de auditoría e inscripciones de alta concurrencia de usuarios.',
          '2026-03-01 00:00:00+00', '2026-03-15 23:59:59+00',
          false, null, null, 'toda_la_organizacion',
          'advertencia', '["estandar", "emergencia"]', 7, '#f59e0b', true
        );
      `);
    }

    // 6. Sembrar feriados de fábrica si la tabla está vacía
    const countFeriados = await client.query("SELECT COUNT(*) FROM calendario_feriados;");
    if (parseInt(countFeriados.rows[0].count) === 0) {
      console.log("Sembrando feriados nacionales de fábrica...");
      await client.query(`
        INSERT INTO calendario_feriados (
          fecha_inicio, fecha_fin, nombre, tipo, alcance, recurrente_anual, activo
        ) VALUES 
        ('2026-01-01', '2026-01-01', 'Año Nuevo', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-04-02', '2026-04-02', 'Jueves Santo', 'nacional', 'toda_la_organizacion', false, true),
        ('2026-04-03', '2026-04-03', 'Viernes Santo', 'nacional', 'toda_la_organizacion', false, true),
        ('2026-05-01', '2026-05-01', 'Día del Trabajo', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-06-07', '2026-06-07', 'Batalla de Arica y Día de la Bandera', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-06-29', '2026-06-29', 'San Pedro y San Pablo', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-07-23', '2026-07-23', 'Día de la Fuerza Aérea del Perú', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-07-28', '2026-07-28', 'Fiestas Patrias - Día 1', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-07-29', '2026-07-29', 'Fiestas Patrias - Día 2', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-08-06', '2026-08-06', 'Batalla de Junín', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-08-30', '2026-08-30', 'Santa Rosa de Lima', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-10-08', '2026-10-08', 'Combate de Angamos', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-11-01', '2026-11-01', 'Día de Todos los Santos', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-12-08', '2026-12-08', 'Inmaculada Concepción', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-12-09', '2026-12-09', 'Batalla de Ayacucho', 'nacional', 'toda_la_organizacion', true, true),
        ('2026-12-25', '2026-12-25', 'Navidad del Señor', 'nacional', 'toda_la_organizacion', true, true);
      `);
    }

    // 7. Asegurar permisos en opciones_menu_perfiles para 5334
    // Supervisor (4), Auditor (6), Gestor de Cambios (8)
    const perfilesExtra = [4, 6, 8];
    for (const idp of perfilesExtra) {
      await client.query(`
        INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
        VALUES (5334, $1, 4, true)
        ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;
      `, [idp]);
    }

    await client.query("COMMIT;");
    console.log("Migración de tablas de calendario y feriados completada con éxito.");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error en migración:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrar();
