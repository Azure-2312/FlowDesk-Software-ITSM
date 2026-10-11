const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const tipos = await pool.query(`SELECT * FROM tipo_ticket`);
  console.log('TIPOS:', tipos.rows);
  const estados = await pool.query(`SELECT * FROM estado_ticket`);
  console.log('ESTADOS:', estados.rows);
  await pool.end();
}
run();
