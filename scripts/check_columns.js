const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.qagfznblisjownpozmen:13011124-APMA@aws-0-us-east-2.pooler.supabase.com:5432/postgres",
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('servicio_catalogo', 'elemento_configuracion', 'activo', 'servicio_workflow_paso')
      ORDER BY table_name, ordinal_position
    `);
    console.table(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

check();
