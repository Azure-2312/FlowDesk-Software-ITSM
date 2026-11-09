const { Pool } = require("pg");
const fs = require("fs");

let connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/flowdesk";
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf-8").split("\n")) {
    if (line.startsWith("DATABASE_URL=")) {
      connectionString = line.substring(13).trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

const pool = new Pool({ connectionString, ssl: false });

async function check() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuario'
      ORDER BY ordinal_position
    `);
    console.table(res.rows);

    const userRes = await pool.query(`SELECT id_usuario, correo_electronico, nombres FROM usuario LIMIT 5`);
    console.log("Usuarios:", userRes.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

check();
