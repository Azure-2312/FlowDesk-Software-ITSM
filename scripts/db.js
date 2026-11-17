const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const l of lines) {
      const trimmed = l.trim();
      if (trimmed.startsWith('DATABASE_URL=')) {
        dbUrl = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
        break;
      }
    }
  }
}

const pool = new Pool({ connectionString: dbUrl });

module.exports = { pool };
