const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/flowdesk';
if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf-8').split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      connectionString = line.substring(13).trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

const pool = new Pool({ connectionString });

async function run() {
  const file = process.argv[2];
  if (!file) {
    console.error('Please specify migration file path');
    process.exit(1);
  }
  const fullPath = path.resolve(file);
  console.log(`Executing migration ${fullPath}...`);
  const sql = fs.readFileSync(fullPath, 'utf-8');
  await pool.query(sql);
  console.log('SUCCESS!');
  await pool.end();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
