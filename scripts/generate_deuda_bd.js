const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function run() {
  console.log('Analizando tablas de base de datos...');
  const resTables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  function getAllCode(dir) {
    let files = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name !== '.next' && ent.name !== 'node_modules') {
          files = files.concat(getAllCode(full));
        }
      } else if (/\.(ts|tsx|js)$/.test(ent.name)) {
        files.push(fs.readFileSync(full, 'utf8'));
      }
    }
    return files;
  }

  const codeFiles = getAllCode(path.join(__dirname, '../src'));
  const allCode = codeFiles.join('\n');

  const unusedTables = [];
  const usedTables = [];

  for (const row of resTables.rows) {
    const tName = row.table_name;
    const regex = new RegExp(`\\b${tName}\\b`, 'i');
    if (!regex.test(allCode)) {
      unusedTables.push(tName);
    } else {
      usedTables.push(tName);
    }
  }

  console.log(`Total tablas en BD: ${resTables.rows.length}`);
  console.log(`Tablas referenciadas en código: ${usedTables.length}`);
  console.log(`Tablas sin referencias en código (Deuda BD R6): ${unusedTables.length}`);

  let md = `# Registro de Deuda Técnica de Base de Datos (Fase 15)

**Fecha:** 17 de Noviembre de 2026  
**Regla R6 (Cero destrucción de datos):** En estricto cumplimiento de la regla R6, las tablas y columnas asociadas a funciones eliminadas o diferidas para la Fase 2 no se eliminan físicamente de la base de datos (evitando pérdida de datos históricos o restricciones de claves foráneas). Este documento inventaría dichas estructuras como deuda técnica reconocida para su archivado o migración futura.

---

## 1. Resumen de Tablas

- **Total de tablas en esquema público:** ${resTables.rows.length}
- **Tablas activamente referenciadas por la aplicación:** ${usedTables.length}
- **Tablas sin referencias activas en el código (Deuda BD):** ${unusedTables.length}

---

## 2. Inventario de Tablas sin Referencia Activa en Código

| Tabla | Módulo Original | Motivo de Inactividad | Acción R6 |
|---|---|---|---|
`;

  for (const t of unusedTables) {
    let modulo = 'Operación / Soporte';
    if (t.includes('evento')) modulo = 'Operación (Eventos)';
    else if (t.includes('resiliencia')) modulo = 'Operación (Resiliencia)';
    else if (t.includes('campana') || t.includes('conteo')) modulo = 'Activos (Inventario Físico)';
    else if (t.includes('licencia') && t.includes('cumplimiento')) modulo = 'Activos (Licencias / Descubrimiento)';
    else if (t.includes('ishikawa')) modulo = 'Problemas (Ishikawa)';
    else if (t.includes('notificacion') && (t.includes('plantilla') || t.includes('contacto'))) modulo = 'Notificaciones externas';

    md += `| \`${t}\` | ${modulo} | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |\n`;
  }

  md += `
---

## 3. Conclusión

Ninguna tabla ha sido eliminada con \`DROP TABLE\`. La integridad referencial y el histórico de datos se encuentran completamente preservados.
`;

  const outPath = path.join(__dirname, '../docs/reestructuracion/deuda-bd.md');
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`deuda-bd.md generado en ${outPath}`);

  await pool.end();
}

run().catch(console.error);
