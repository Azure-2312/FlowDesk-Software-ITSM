const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function run() {
  const plataformaDir = path.join(__dirname, '../src/app/plataforma');
  
  function getPages(dir, baseRoute = '/plataforma') {
    let pages = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        pages = pages.concat(getPages(fullPath, `${baseRoute}/${entry.name}`));
      } else if (entry.name === 'page.tsx') {
        pages.push({
          route: baseRoute,
          filePath: path.relative(path.join(__dirname, '..'), fullPath).replace(/\\/g, '/')
        });
      }
    }
    return pages;
  }

  const allPages = getPages(plataformaDir);
  console.log(`Total page.tsx under /plataforma: ${allPages.length}`);

  const menuRows = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu
    FROM opciones_menu
    WHERE estado_registro = true AND url_menu IS NOT NULL
    ORDER BY id_opcion_menu
  `);
  const menuUrls = new Set(menuRows.rows.map(r => r.url_menu));
  console.log(`Total URLs en opciones_menu: ${menuUrls.size}`);

  const menuMatched = [];
  const nonMenu = [];

  for (const p of allPages) {
    if (menuUrls.has(p.route)) {
      menuMatched.push(p);
    } else {
      nonMenu.push(p);
    }
  }

  console.log(`\n--- Coinciden con menú (${menuMatched.length}) ---`);
  console.log(`\n--- No están en menú (${nonMenu.length}) ---`);
  for (const nm of nonMenu) {
    console.log(`  ${nm.route} -> ${nm.filePath}`);
  }

  // Check if any menuUrl has no page.tsx
  const pageRoutes = new Set(allPages.map(p => p.route));
  const missingPages = [];
  for (const mUrl of menuUrls) {
    if (!pageRoutes.has(mUrl)) {
      missingPages.push(mUrl);
    }
  }
  if (missingPages.length > 0) {
    console.log('\n[ALERTA] URLs del menú sin page.tsx:');
    for (const mp of missingPages) console.log('  ', mp);
  } else {
    console.log('\n[OK] Todas las URLs del menú tienen su page.tsx correspondiente.');
  }

  await pool.end();
}

run().catch(console.error);
