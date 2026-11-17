const fs = require('fs');
const path = require('path');

const routes = [
  'inventario',
  'area',
  'inventario-operativo',
  'importacion',
  'mis-activos',
  'asignaciones',
  'mantenimiento',
  'reparaciones',
  'licencias',
  'licencias/consulta',
  'licencias/catalogo-software',
  'licencias/cumplimiento',
  'contratos',
  'contratos-area',
  'proveedores',
  'renovaciones',
  'bajas',
  'bajas/consulta',
  'configuracion',
  'configuracion/tipos-modelos-atributos',
  'configuracion/tipos-modelos-atributos/fabricantes',
  'configuracion/tipos-modelos-atributos/ubicaciones',
  'configuracion/tipos-modelos-atributos/catalogos',
];

for (const r of routes) {
  const p = path.join('src/app/plataforma/activos', r, 'page.tsx');
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    const imports = c.split('\n').filter(l => l.includes('import ') && (l.includes('Vista') || l.includes('Pestana'))).join('; ');
    const ret = c.split('\n').filter(l => l.includes('<Vista') || l.includes('<Pestana') || l.includes('redirect(')).join('; ');
    console.log(`${r}: \n  ${imports}\n  ${ret}`);
  } else {
    console.log(`${r}: NO EXISTE`);
  }
}
