// Exporta el menú, los permisos por perfil, las vistas por perfil y la
// configuración del sistema desde la BD indicada en DATABASE_URL hacia
// db/04_menu_y_configuracion.sql, para que la restauración (db/01-03) quede
// con el menú vigente. Uso:  DATABASE_URL="postgresql://..." node scripts/exportar_menu_actual.js
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const TABLAS = [
  { tabla: "opciones_menu", orden: "nivel, id_opcion_menu" },
  { tabla: "opciones_menu_perfiles", orden: "id_opcion_menu, id_perfil" },
  { tabla: "opciones_menu_vistas_perfiles", orden: "id_opcion_menu, id_perfil, vista" },
  { tabla: "configuracion_sistema", orden: "clave" },
];

const OID_JSON = new Set([114, 3802]);

function literal(v, oid) {
  if (v === null || v === undefined) return "NULL";
  if (OID_JSON.has(oid)) return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Define DATABASE_URL con la BD de origen.");
  const esLocal = /localhost|127\.0\.0\.1/.test(url);
  const db = new Client({ connectionString: url, ssl: esLocal ? false : { rejectUnauthorized: false } });
  await db.connect();
  const salida = [
    "-- Generado por scripts/exportar_menu_actual.js — ejecutar DESPUÉS de 01, 02 y 03.",
    "BEGIN;",
    "TRUNCATE opciones_menu_vistas_perfiles, opciones_menu_perfiles;",
    "DELETE FROM opciones_menu;",
  ];
  for (const { tabla, orden } of TABLAS) {
    const { rows, fields } = await db.query(`SELECT * FROM ${tabla} ORDER BY ${orden}`);
    if (tabla === "configuracion_sistema") salida.push("DELETE FROM configuracion_sistema;");
    const cols = fields.map((f) => f.name);
    const oids = Object.fromEntries(fields.map((f) => [f.name, f.dataTypeID]));
    for (const r of rows) {
      salida.push(`INSERT INTO ${tabla} (${cols.join(", ")}) VALUES (${cols.map((c) => literal(r[c], oids[c])).join(", ")});`);
    }
    console.log(`${tabla}: ${rows.length} filas`);
  }
  salida.push("COMMIT;");
  await db.end();
  const destino = path.join(__dirname, "..", "db", "04_menu_y_configuracion.sql");
  fs.writeFileSync(destino, salida.join("\n") + "\n", "utf8");
  console.log(`Escrito ${destino}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
