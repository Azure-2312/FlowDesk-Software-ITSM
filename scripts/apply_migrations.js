const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/flowdesk';
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  for (const line of content.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      connectionString = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
    }
  }
}

const pool = new Pool({ connectionString });

const migrationsToRun = [
  '20261011_modulo_problemas_configuracion_formulario.sql',
  '20261012_modulo_problemas_flujo.sql',
  '20261013_modulo_problemas_relaciones.sql',
];

async function main() {
  for (const file of migrationsToRun) {
    const filePath = path.join(__dirname, '..', 'db', 'migrations', file);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    console.log(`Running migration: ${file}...`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    try {
      await pool.query(sql);
      console.log(`SUCCESS: ${file}`);
    } catch (err) {
      console.error(`FAILED: ${file}:`, err.message);
    }
  }

  // Also check other migrations that might have useful tables
  const allFiles = fs.readdirSync(path.join(__dirname, '..', 'db', 'migrations'))
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`\nChecking all ${allFiles.length} migration files in db/migrations...`);
  for (const file of allFiles) {
    if (migrationsToRun.includes(file)) continue;
    const filePath = path.join(__dirname, '..', 'db', 'migrations', file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    try {
      await pool.query(sql);
      console.log(`OK: ${file}`);
    } catch (err) {
      // It might already exist or conflict with unique/primary key, which is normal for idempotent migrations
      console.log(`SKIP/WARN on ${file}: ${err.message.substring(0, 100)}`);
    }
  }

  await pool.end();
}

main();
