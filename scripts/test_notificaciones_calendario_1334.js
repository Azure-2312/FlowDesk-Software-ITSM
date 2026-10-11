const { Pool } = require('pg');
const fs = require('fs');

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

async function testear() {
  console.log("=== INICIANDO PRUEBAS DE SUBMÓDULO 1.3.3.4 ===");

  // 1. Verificar registros en base de datos para 1.3.3.4
  const resVersiones = await pool.query(`
    SELECT pestana, numero_version, es_publicada, es_borrador, fecha_creacion
    FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4'
    ORDER BY pestana
  `);

  console.log(`Pestañas publicadas en BD: ${resVersiones.rows.length}/6`);
  resVersiones.rows.forEach(r => {
    console.log(` - Pestaña '${r.pestana}': v${r.numero_version} (Publicada: ${r.es_publicada})`);
  });

  if (resVersiones.rows.length !== 6) {
    throw new Error(`Se esperaban 6 pestañas sembradas, se encontraron ${resVersiones.rows.length}`);
  }

  // 2. Verificar tablas de calendario compartidas
  const resFeriados = await pool.query("SELECT COUNT(*) FROM calendario_feriados;");
  const resVentanas = await pool.query("SELECT COUNT(*) FROM ventanas_mantenimiento;");
  const resCongelamiento = await pool.query("SELECT COUNT(*) FROM periodos_congelamiento;");

  console.log(`Tablas operativas compartidas:`);
  console.log(` - calendario_feriados: ${resFeriados.rows[0].count} registros`);
  console.log(` - ventanas_mantenimiento: ${resVentanas.rows[0].count} registros`);
  console.log(` - periodos_congelamiento: ${resCongelamiento.rows[0].count} registros`);

  if (parseInt(resFeriados.rows[0].count) === 0 || parseInt(resVentanas.rows[0].count) === 0 || parseInt(resCongelamiento.rows[0].count) === 0) {
    throw new Error("Una o más tablas operativas no tienen registros sembrados");
  }

  console.log("=== TODAS LAS VERIFICACIONES DE BASE DE DATOS PARA 1.3.3.4 PASARON EXITOSAMENTE ===");
  await pool.end();
}

testear().catch(err => {
  console.error("Error en pruebas:", err);
  process.exit(1);
});
