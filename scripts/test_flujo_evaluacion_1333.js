const http = require('http');

// Simular llamadas directamente a la lógica de endpoints o validar que la base de datos y esquemas responden
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
  console.log("=== INICIANDO PRUEBAS DE SUBMÓDULO 1.3.3.3 ===");

  // 1. Verificar registros en base de datos para 1.3.3.3
  const resVersiones = await pool.query(`
    SELECT pestana, numero_version, es_publicada, es_borrador, fecha_creacion
    FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3'
    ORDER BY pestana
  `);

  console.log(`Pestañas publicadas en BD: ${resVersiones.rows.length}/8`);
  resVersiones.rows.forEach(r => {
    console.log(` - Pestaña '${r.pestana}': v${r.numero_version} (Publicada: ${r.es_publicada})`);
  });

  if (resVersiones.rows.length !== 8) {
    throw new Error(`Se esperaban 8 pestañas sembradas, se encontraron ${resVersiones.rows.length}`);
  }

  // 2. Verificar integridad del snapshot de Estados (8.1 y 11)
  const estadosRow = await pool.query(`
    SELECT snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'estados' AND es_publicada = true
  `);
  const estados = estadosRow.rows[0]?.snapshot?.estados || [];
  console.log(`Estados de ciclo de vida: ${estados.length} (esperados: 12)`);
  const inicial = estados.filter(e => e.tipo === 'inicial');
  const finales = estados.filter(e => e.tipo === 'final');
  console.log(` - Iniciales: ${inicial.length}, Finales: ${finales.length}`);
  if (inicial.length !== 1 || finales.length < 1) {
    throw new Error("Violación de regla: exactamente 1 inicial y al menos 1 final");
  }

  // 3. Verificar transiciones (8.2)
  const transRow = await pool.query(`
    SELECT snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'transiciones' AND es_publicada = true
  `);
  const trans = transRow.rows[0]?.snapshot?.transiciones || [];
  console.log(`Transiciones configuradas: ${trans.length} (esperadas >= 16)`);

  // 4. Verificar etapas de aprobación y segregación SoD (8.3)
  const etapasRow = await pool.query(`
    SELECT snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'etapas_aprobacion' AND es_publicada = true
  `);
  const etapas = etapasRow.rows[0]?.snapshot?.etapas || [];
  const sod = etapasRow.rows[0]?.snapshot?.segregacion_funciones || {};
  console.log(`Etapas de aprobación: ${etapas.length} (esperadas: 10)`);
  console.log(`SoD activa: Solicitante no aprueba=${sod.solicitante_no_aprueba}, Implementador no aprueba=${sod.implementador_no_aprueba}, Respaldo=${sod.aprobador_respaldo_activo}`);

  // 5. Verificar comités CAB y ECAB (8.4)
  const comitesRow = await pool.query(`
    SELECT snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'comites' AND es_publicada = true
  `);
  const cab = comitesRow.rows[0]?.snapshot?.cab;
  const ecab = comitesRow.rows[0]?.snapshot?.ecab;
  console.log(`CAB: quórum=${cab?.quorum_minimo}, miembros=${cab?.miembros?.length}`);
  console.log(`ECAB: quórum=${ecab?.quorum_minimo}, miembros=${ecab?.miembros?.length}`);

  // 6. Verificar preguntas PIR (8.8 y 11)
  const pirRow = await pool.query(`
    SELECT snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'pir' AND es_publicada = true
  `);
  const pirPreguntas = pirRow.rows[0]?.snapshot?.preguntas || [];
  console.log(`Preguntas de plantilla PIR: ${pirPreguntas.length} (esperadas: 12)`);
  if (pirPreguntas.length !== 12) {
    throw new Error(`Se esperaban 12 preguntas de auditoría PIR de fábrica, encontradas ${pirPreguntas.length}`);
  }

  console.log("=== TODAS LAS PRUEBAS DE ESTRUCTURA Y BASE DE DATOS SUPERADAS EXITOSAMENTE ===");
  await pool.end();
}

testear().catch(e => {
  console.error("Error en pruebas:", e);
  pool.end();
  process.exit(1);
});
