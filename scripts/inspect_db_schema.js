const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspect() {
  const tables = ['servicio_catalogo_perfiles', 'servicio_workflow_paso', 'resiliencia_servicio', 'evento_servicio'];
  for (const table of tables) {
    const res = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [table]);
    console.log(`=== ${table} ===`);
    console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  }
  await pool.end();
}
inspect().catch(console.error);
