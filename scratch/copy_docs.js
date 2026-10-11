const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'DOCUMENTACIÓN');
const artifactsDir = 'C:\\Users\\apaza\\.gemini\\antigravity\\brain\\5582153f-ad75-4a63-a899-a0da18c9ceda';
const rootDir = path.join(__dirname, '..');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const artifactFiles = [
  'itil_auditoria_normativa_sistema.md',
  'guia_metodologica_desarrollo_itsm.md',
  'itil_catalogo_servicios_completo.md',
  'itil_catalogo_servicios_analisis.md',
  'itil_justificacion_cambios.md',
  'walkthrough.md'
];

console.log('Copiando archivos desde artefactos...');
artifactFiles.forEach(file => {
  const src = path.join(artifactsDir, file);
  if (fs.existsSync(src)) {
    const dest = path.join(targetDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copiado: ${file} -> DOCUMENTACIÓN/${file}`);
  } else {
    console.warn(`No encontrado en artefactos: ${src}`);
  }
});

const rootFiles = [
  'analisis-itil.md',
  'historias_de_usuario.md',
  'historias_de_usuario_propuestas.md'
];

console.log('\nCopiando archivos desde la raiz del proyecto...');
rootFiles.forEach(file => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    const dest = path.join(targetDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copiado: ${file} -> DOCUMENTACIÓN/${file}`);
  } else {
    console.warn(`No encontrado en raiz: ${src}`);
  }
});

console.log('\nFinalizado con exito.');
