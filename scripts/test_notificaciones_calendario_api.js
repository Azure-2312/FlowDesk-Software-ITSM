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

async function probarLogicaSimulacion() {
  console.log("=== INICIANDO PRUEBA DE LÓGICA DEL MOTOR DE CONFLICTOS (1.3.3.4.5) ===");

  // 1. Simular caso 1: Intervención en período de congelamiento
  // Cierre Anual: 2026-12-20 a 2027-01-05
  const fechaCongelamiento = new Date("2026-12-24T10:00:00Z");
  const pcRows = await pool.query(`
    SELECT * FROM periodos_congelamiento 
    WHERE activo = true AND fecha_inicio <= $1 AND fecha_fin >= $1;
  `, [fechaCongelamiento.toISOString()]);

  console.log(`Períodos de congelamiento detectados para 2026-12-24: ${pcRows.rows.length}`);
  if (pcRows.rows.length === 0) {
    throw new Error("No se detectó el período de congelamiento de cierre anual");
  }
  console.log(` - Detectado: ${pcRows.rows[0].nombre} (Severidad: ${pcRows.rows[0].severidad})`);

  // 2. Simular caso 2: Intervención en Feriado
  // Fiestas Patrias: 2026-07-28
  const feriadosRows = await pool.query(`
    SELECT * FROM calendario_feriados
    WHERE activo = true AND fecha_inicio <= '2026-07-28' AND fecha_fin >= '2026-07-28';
  `);
  console.log(`Feriados detectados para 2026-07-28: ${feriadosRows.rows.length}`);
  if (feriadosRows.rows.length === 0) {
    throw new Error("No se detectó el feriado de Fiestas Patrias");
  }
  console.log(` - Detectado: ${feriadosRows.rows[0].nombre} (${feriadosRows.rows[0].tipo})`);

  // 3. Simular caso 3: Ventanas de mantenimiento
  const ventanasRows = await pool.query(`SELECT codigo, nombre, recurrencia, hora_inicio, hora_fin FROM ventanas_mantenimiento;`);
  console.log(`Ventanas de mantenimiento registradas en BD: ${ventanasRows.rows.length}`);
  ventanasRows.rows.forEach(v => {
    console.log(` - [${v.codigo}] ${v.nombre} (${v.recurrencia}: ${v.hora_inicio} a ${v.hora_fin})`);
  });

  // 4. Validar versión publicada de las 6 pestañas
  const versiones = await pool.query(`
    SELECT pestana, numero_version, es_publicada FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND es_publicada = true
    ORDER BY pestana;
  `);

  console.log(`Versiones publicadas activas: ${versiones.rows.length}/6`);
  const pestanasEsperadas = ["conflictos_capacidad", "feriados", "notificaciones", "periodos_congelamiento", "presentacion_calendario", "ventanas_mantenimiento"];
  const pestanasEncontradas = versiones.rows.map(r => r.pestana);

  for (const p of pestanasEsperadas) {
    if (!pestanasEncontradas.includes(p)) {
      throw new Error(`Falta pestaña requerida: ${p}`);
    }
  }

  console.log("=== TODAS LAS PRUEBAS DE 1.3.3.4 FINALIZARON CON ÉXITO ===");
  await pool.end();
}

probarLogicaSimulacion().catch(err => {
  console.error("Error en pruebas:", err);
  process.exit(1);
});
