const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  console.log("========================================");
  console.log("AUDITORIA TECNICA COMPLETA ITIL V4 / ISO 20000");
  console.log("========================================\n");

  // 1. Tablas en base de datos
  const tablesRes = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("TABLAS EN BD (" + tablesRes.rows.length + "):");
  console.log(tablesRes.rows.map(r => r.table_name).join(", "));
  console.log("");

  // 2. Columnas de ticket
  const ticketCols = await pool.query(
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'ticket' ORDER BY ordinal_position"
  );
  console.log("COLUMNAS DE TICKET (" + ticketCols.rows.length + "):");
  console.table(ticketCols.rows);

  // 3. Perfiles
  const perfiles = await pool.query(
    "SELECT id_perfil, nombre, estado_registro FROM perfiles ORDER BY id_perfil"
  );
  console.log("\nPERFILES:");
  console.table(perfiles.rows);

  // 4. Motivos de espera
  const motivos = await pool.query("SELECT * FROM motivo_espera_ticket ORDER BY id_motivo_espera");
  console.log("\nMOTIVOS DE ESPERA:");
  console.table(motivos.rows);

  // 5. Categorias
  const cats = await pool.query("SELECT * FROM categoria_ticket ORDER BY id_categoria");
  console.log("\nCATEGORIAS TICKET:");
  console.table(cats.rows);

  await pool.end();
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
