#!/usr/bin/env node
// ============================================================================
// VERIFICADOR DEL SISTEMA DE DISEÑO (npm run test:estilos)
// ----------------------------------------------------------------------------
// Falla si alguna vista se sale del catálogo visual (ver /plataforma/guia-estilo):
//   1. <button> sin una clase del sistema (boton-*, pestana, opcion-seleccionable,
//      interruptor).
//   2. Botones o pestañas con colores/tamaños inline (los estilos los da el CSS).
//   3. Botones con icono Y texto a la vez (regla: o icono o texto).
//   4. Pestañas (.pestana) fuera de un contenedor .pestanas.
//   5. Clases de botón antiguas que ya no existen en el CSS.
// Uso: node scripts/verificar_estilos.js [--detalle]
// ============================================================================
const fs = require("fs");
const path = require("path");
const ts = require(path.join(process.cwd(), "node_modules", "typescript"));

const RAIZ = path.join(process.cwd(), "src");
// Componentes de layout con estilo propio (barra lateral, login, selector de perfil)
const EXENTOS = [/shared[\\/]components[\\/]layout[\\/]/];
const CLASES_LOGIN = ["opcion-seleccion-perfil", "link-olvide-clave"];
const CLASES_SISTEMA = /(^|[\s"'`{])(boton-(primario|secundario|peligro|enlace|icono)|pestana|opcion-seleccionable|interruptor)([\s"'`}]|$)/;
const CLASES_ANTIGUAS = /(^|[\s"'`])(boton-(principal|mini|mini-peligro|mini-desbloquear|accion-icono|accion-primario|accion-peligro|accion-exito|texto|tabla-[a-z-]+)|modal-cerrar-boton|control-segmentado(-item)?)(?=[\s"'`]|$)/;
const VISUAL = /^(padding|paddingTop|paddingBottom|paddingLeft|paddingRight|fontSize|fontWeight|background|backgroundColor|color|border|borderColor|borderRadius|borderBottom|borderTop|borderLeft|borderRight|boxShadow|height|lineHeight|cursor|opacity)$/;
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}]/u;

const archivos = [];
(function recorrer(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) recorrer(p);
    else if (/\.tsx$/.test(f)) archivos.push(p);
  }
})(RAIZ);

const fallos = { sinClase: [], estiloInline: [], iconoYTexto: [], pestanaSuelta: [], claseAntigua: [] };

function atributo(op, nombre, sf) {
  return op.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === nombre);
}

function contenido(n, sf) {
  let icono = false, texto = false;
  (function v(x) {
    if (ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x)) {
      const tag = (ts.isJsxElement(x) ? x.openingElement.tagName : x.tagName).getText(sf);
      if (tag === "svg" || /(Icon|Icono)$/.test(tag) || /^[A-Z][a-z]+[A-Z0-9]?\w*$/.test(tag) && ts.isJsxSelfClosingElement(x) && /size=/.test(x.getText(sf))) { icono = true; return; }
    }
    if (ts.isJsxText(x)) {
      const s = x.getText(sf);
      if (EMOJI.test(s)) icono = true;
      if (/[A-Za-zÁÉÍÓÚáéíóúñÑ]{2,}/.test(s.replace(EMOJI, ""))) texto = true;
    }
    if (ts.isJsxExpression(x) && x.expression) {
      const s = x.expression.getText(sf);
      // Expresiones simples (variables, textos) cuentan como texto; las que
      // contienen JSX se recorren para revisar cada rama.
      if (!/</.test(s) && (/["'`][^"'`]*[A-Za-zÁÉÍÓÚáéíóúñÑ]{3,}/.test(s) || /^[\w.?]+$/.test(s))) texto = true;
    }
    if ((ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x)) && ts.isConditionalExpression(x.parent) && x !== x.parent.condition) {
      if (/[A-Za-zÁÉÍÓÚáéíóúñÑ]{3,}/.test(x.text)) texto = true;
    }
    if (ts.isJsxAttributes(x)) return;
    ts.forEachChild(x, v);
  })(n);
  return { icono, texto };
}

for (const f of archivos) {
  const rel = path.relative(process.cwd(), f).split(path.sep).join("/");
  if (EXENTOS.some((r) => r.test(f))) continue;
  const src = fs.readFileSync(f, "utf8");
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const linea = (n) => `${rel}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`;

  (function v(n) {
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
      const op = ts.isJsxElement(n) ? n.openingElement : n;
      const tag = op.tagName.getText(sf);
      const cls = atributo(op, "className", sf);
      const clsTxt = cls ? cls.getText(sf) : "";
      const st = atributo(op, "style", sf);

      if (CLASES_ANTIGUAS.test(clsTxt)) fallos.claseAntigua.push(`${linea(n)}  ${clsTxt.slice(0, 80)}`);

      const esSistema = CLASES_SISTEMA.test(clsTxt);
      if (tag === "button" && !esSistema && !CLASES_LOGIN.some((c) => clsTxt.includes(c)) && !/shared[\\/]components[\\/]ui/.test(f)) {
        fallos.sinClase.push(`${linea(n)}  ${clsTxt ? clsTxt.slice(0, 70) : "(sin className)"}`);
      }
      if (esSistema && st && st.initializer && st.initializer.expression && ts.isObjectLiteralExpression(st.initializer.expression)) {
        const visuales = st.initializer.expression.properties
          .filter((p) => ts.isPropertyAssignment(p) && VISUAL.test(p.name.getText(sf).replace(/["']/g, "")))
          .map((p) => p.name.getText(sf));
        if (visuales.length) fallos.estiloInline.push(`${linea(n)}  ${visuales.join(", ")}`);
      }
      if (tag === "button" && ts.isJsxElement(n)) {
        const c = contenido(n, sf);
        if (c.icono && c.texto) fallos.iconoYTexto.push(linea(n));
      }
      if (/(^|["'`\s])pestana(["'`\s]|$)/.test(clsTxt)) {
        let p = n.parent, ok = false;
        while (p) {
          if (ts.isJsxElement(p)) {
            const pc = atributo(p.openingElement, "className", sf);
            if (pc && /pestanas/.test(pc.getText(sf))) { ok = true; break; }
            if (/^(div|nav)$/.test(p.openingElement.tagName.getText(sf))) break;
          }
          p = p.parent;
        }
        if (!ok && !/shared[\\/]components[\\/]ui/.test(f)) fallos.pestanaSuelta.push(linea(n));
      }
    }
    ts.forEachChild(n, v);
  })(sf);
}

const titulos = {
  sinClase: "Botones sin clase del sistema de diseño",
  estiloInline: "Botones/pestañas con estilo visual inline",
  iconoYTexto: "Botones con icono y texto a la vez",
  pestanaSuelta: "Pestañas fuera de un contenedor .pestanas",
  claseAntigua: "Clases de botón antiguas (ya no existen en el CSS)",
};
let total = 0;
const detalle = process.argv.includes("--detalle");
for (const [k, lista] of Object.entries(fallos)) {
  total += lista.length;
  console.log(`${lista.length === 0 ? "OK " : "ERR"}  ${titulos[k]}: ${lista.length}`);
  if (lista.length && (detalle || lista.length <= 15)) lista.forEach((l) => console.log("       " + l));
}
console.log(total === 0 ? "\nSistema de diseño: sin desviaciones." : `\n${total} desviaciones del sistema de diseño.`);
process.exit(total === 0 ? 0 : 1);
