const fs = require('fs');
const path = require('path');

// 1. Read all physical pages in src/app/plataforma
function getPages(dir, base = '') {
  let pages = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const rel = path.join(base, item).replace(/\\/g, '/');
    if (fs.statSync(full).isDirectory()) {
      pages.push(...getPages(full, rel));
    } else if (item === 'page.tsx' || item === 'page.ts' || item === 'page.jsx' || item === 'page.js') {
      pages.push('/' + base.replace(/\\/g, '/'));
    }
  }
  return pages;
}
const physicalPages = new Set(getPages('./src/app/plataforma').map(p => '/plataforma' + p));

// 2. Read dump
const dumpLines = fs.readFileSync('scripts/opciones_menu_dump.txt', 'utf8').split('\n').slice(2);
const items = [];
dumpLines.forEach(l => {
  if (!l.trim()) return;
  const parts = l.split('|').map(s => s.trim());
  if (parts.length >= 5) {
    items.push({
      id: parseInt(parts[0]),
      nivel: parseInt(parts[1]),
      padre: parts[2],
      nombre: parts[3],
      url: parts[4] === '(carpeta)' ? '' : parts[4]
    });
  }
});

console.log(`Analyzing ${items.length} options...`);

console.log('\n=== CATEGORY 1: URLs WITH PROFILE/ROLE NAMES (tecnico, supervisor, aprobador, gestor-area, auditor) ===');
const roleUrls = items.filter(it => it.url && /\/(tecnico|supervisor|aprobador|gestor-area|gestor-cambios|auditor|solicitante|administrador)(\/|$)/.test(it.url));
roleUrls.forEach(it => {
  console.log(`[${it.id}] ${it.padre} -> ${it.nombre} | URL: ${it.url}`);
});
console.log(`Total: ${roleUrls.length}`);

console.log('\n=== CATEGORY 2: CROSS-MODULE URLs (e.g. in Incidentes/Solicitudes pointing to /plataforma/tickets/...) ===');
const crossUrls = items.filter(it => {
  if (!it.url) return false;
  // If parent is Incidentes or Mesa de Servicio -> Incidentes, but url points to /plataforma/tickets/
  if (it.padre.includes('Incidentes') && it.url.startsWith('/plataforma/tickets/')) return true;
  if (it.padre.includes('Solicitudes') && it.url.startsWith('/plataforma/tickets/')) return true;
  return false;
});
crossUrls.forEach(it => {
  console.log(`[${it.id}] ${it.padre} -> ${it.nombre} | URL: ${it.url}`);
});
console.log(`Total: ${crossUrls.length}`);

console.log('\n=== CATEGORY 3: CHILD OPTION HAS MODULE ROOT URL ===');
// E.g. padre is NOT root, but url is /plataforma/problemas, /plataforma/cambios, /plataforma/activos, etc.
const rootModuleUrls = ['/plataforma/problemas', '/plataforma/cambios', '/plataforma/activos', '/plataforma/incidentes', '/plataforma/solicitudes', '/plataforma/conocimiento', '/plataforma/cmdb'];
const childAtRoot = items.filter(it => {
  if (!it.url) return false;
  const urlBase = it.url.split('?')[0];
  return rootModuleUrls.includes(urlBase) && it.nivel > 1;
});
childAtRoot.forEach(it => {
  console.log(`[${it.id}] (Nivel ${it.nivel}) ${it.padre} -> ${it.nombre} | URL: ${it.url}`);
});
console.log(`Total: ${childAtRoot.length}`);

console.log('\n=== CATEGORY 4: DUPLICATE OR OVERLAPPING OPTION NAMES WITHIN SAME PARENT ===');
const byPadre = {};
items.forEach(it => {
  if (!byPadre[it.padre]) byPadre[it.padre] = [];
  byPadre[it.padre].push(it);
});
for (const [padre, children] of Object.entries(byPadre)) {
  const seen = {};
  children.forEach(c => {
    const norm = c.nombre.toLowerCase().replace(/^(registrar|registro de|consultar)\s+/i, '');
    if (!seen[norm]) seen[norm] = [];
    seen[norm].push(c);
  });
  for (const [norm, group] of Object.entries(seen)) {
    if (group.length > 1) {
      console.log(`Parent "${padre}": overlapping concept "${norm}":`);
      group.forEach(g => console.log(`  [${g.id}] ${g.nombre} -> ${g.url || '(carpeta)'}`));
    }
  }
}

console.log('\n=== CATEGORY 5: URLs IN MENU NOT FOUND IN PHYSICAL src/app/plataforma PAGES ===');
const missingPages = items.filter(it => {
  if (!it.url) return false;
  const urlBase = it.url.split('?')[0];
  // check if physicalPages has it
  return !physicalPages.has(urlBase);
});
missingPages.forEach(it => {
  console.log(`[${it.id}] ${it.nombre} -> ${it.url} (NOT IN NEXT.JS ROUTES)`);
});
console.log(`Total missing: ${missingPages.length}`);
