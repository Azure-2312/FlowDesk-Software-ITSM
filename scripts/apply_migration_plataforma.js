const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/20261117_plataforma_n14.sql'), 'utf8');
  console.log('Aplicando migración plataforma n14...');
  await pool.query(sql);
  console.log('Migración aplicada con éxito.');
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
