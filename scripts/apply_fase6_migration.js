const fs = require('fs');
const { pool } = require('./db.js');

async function main() {
  const sql = fs.readFileSync('db/migrations/20261117_problemas_n7.sql', 'utf8');
  console.log('Applying migration db/migrations/20261117_problemas_n7.sql...');
  await pool.query(sql);
  console.log('Migration applied successfully!');
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
