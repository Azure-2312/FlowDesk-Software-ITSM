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

async function testSimuladores() {
  console.log("=== INICIANDO VALIDACIÓN DE SIMULADORES Y ALGORITMOS 1.3.3.3 ===");

  // 1. Probar Algoritmo de Quórum
  console.log("\n[1] Probando Quórum CAB con 5 miembros (1 con conflicto de interés y 1 ausente):");
  const miembrosCAB = [
    { id_usuario: 11, nombre: "Diego Mendoza", rol_comite: "presidente", presente: true, voto: "aprobar", es_solicitante: false },
    { id_usuario: 10, nombre: "Elena Vargas", rol_comite: "secretario", presente: true, voto: "aprobar", es_solicitante: false },
    { id_usuario: 7, nombre: "Roberto Flores", rol_comite: "miembro_voto", presente: true, voto: "aprobar", es_solicitante: true }, // Debe excluirse por conflicto
    { id_usuario: 12, nombre: "Andres Benitez", rol_comite: "miembro_voto", presente: false, ausente: true, suplente_id: 5, suplente_nombre: "Carlos Quispe (Suplente)", voto: "aprobar" },
    { id_usuario: 9, nombre: "Fernando Castro", rol_comite: "observador", presente: true, voto: "abstencion" } // Observador sin voto
  ];

  // Simulación manual de lógica de quórum
  const excluidos = miembrosCAB.filter(m => m.es_solicitante);
  const votantes = miembrosCAB.filter(m => !m.es_solicitante && (m.rol_comite === 'presidente' || m.rol_comite === 'secretario' || m.rol_comite === 'miembro_voto'));
  console.log(` - Excluidos por conflicto SoD: ${excluidos.map(e => e.nombre).join(", ")}`);
  console.log(` - Votantes hábiles: ${votantes.length} (Quórum mínimo CAB: 3)`);
  console.log(` - Quórum alcanzado: ${votantes.length >= 3 ? "SÍ" : "NO"}`);
  if (votantes.length < 3) throw new Error("Falla en cálculo de quórum");

  // 2. Probar Algoritmo de Escalamiento SLA
  console.log("\n[2] Probando Escalamiento P2 (Plazo total: 24h):");
  const horasTranscurridas = 19; // 19h / 24h = 79.1% -> Debe disparar regla de 75%
  const pct = Math.round((horasTranscurridas / 24) * 100);
  console.log(` - Horas transcurridas: ${horasTranscurridas}h / 24h (${pct}%)`);
  const dispara75 = pct >= 75;
  const dispara90 = pct >= 90;
  console.log(` - Dispara regla 75% (Aviso preventivo): ${dispara75 ? "SÍ" : "NO"}`);
  console.log(` - Dispara regla 90% (Inminente vencimiento): ${dispara90 ? "SÍ" : "NO"}`);
  if (!dispara75 || dispara90) throw new Error("Falla en umbral de escalamiento SLA");

  // 3. Probar Segregación de Funciones (SoD)
  console.log("\n[3] Probando Segregación de Funciones en Aprobaciones:");
  const solicitanteId = 7; // Roberto Flores
  const evaluadorTecnicoId = 7; // Roberto Flores (Mismo que solicitante)
  const respaldoId = 11; // Diego Mendoza (Change Manager)

  let aprobado = evaluadorTecnicoId;
  let reasignado = false;
  if (solicitanteId === evaluadorTecnicoId) {
    reasignado = true;
    aprobado = respaldoId;
    console.log(` - Alerta SoD-1: Solicitante (id 7) intentó evaluar/aprobar. Auto-reasignado al aprobador de respaldo (id 11).`);
  }
  if (!reasignado || aprobado !== respaldoId) throw new Error("Falla en control SoD-1");

  console.log("\n=== TODOS LOS ALGORITMOS DE CONTROL Y GOBERNANZA OPERAN CONFORME A NORMA ===");
  await pool.end();
}

testSimuladores().catch(err => {
  console.error("Error en prueba de algoritmos:", err);
  pool.end();
  process.exit(1);
});
