const { pool } = require('./db.js');
const fs = require('fs');
const path = require('path');

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/20261117_cmdb_n9.sql'), 'utf8');
  console.log('Aplicando migracion 20261117_cmdb_n9.sql...');
  await pool.query(sql);
  console.log('Migracion aplicada con exito.');
  await pool.end();
}

main().catch(err => {
  console.error('Error aplicando migracion:', err);
  process.exit(1);
});
