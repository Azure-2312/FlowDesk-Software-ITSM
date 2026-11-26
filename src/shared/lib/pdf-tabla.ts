// Generador mínimo de PDF (sin dependencias) para exportar tablas de texto.
// Usa la fuente estándar Helvetica con codificación WinAnsi, que cubre tildes,
// ñ y signos del español. A4 horizontal, con cabecera, paginación y pie.

export interface ColumnaPdf {
  titulo: string;
  ancho: number; // en puntos
}

const ANCHO_PAGINA = 842;
const ALTO_PAGINA = 595;
const MARGEN = 32;
const TAM_FUENTE = 7.5;
const ALTO_FILA = 13;

function aWinAnsi(texto: string): string {
  // Sustituye caracteres fuera de Latin-1 y escapa los reservados del PDF.
  return Array.from(texto.normalize("NFC"))
    .map((c) => (c.charCodeAt(0) <= 0xff ? c : "?"))
    .join("")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function recortar(texto: string, anchoPts: number, tam: number): string {
  // Ancho promedio de Helvetica ≈ 0,5 em.
  const maxCaracteres = Math.max(3, Math.floor(anchoPts / (tam * 0.5)) - 1);
  return texto.length > maxCaracteres ? `${texto.substring(0, maxCaracteres - 3)}...` : texto;
}

function textoEn(x: number, y: number, texto: string, tam: number, negrita = false): string {
  return `BT /${negrita ? "F2" : "F1"} ${tam} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${aWinAnsi(texto)}) Tj ET`;
}

export function generarPdfTabla(opciones: {
  titulo: string;
  subtitulo?: string;
  columnas: ColumnaPdf[];
  filas: string[][];
}): Buffer {
  const { titulo, subtitulo, columnas, filas } = opciones;
  const inicioTabla = ALTO_PAGINA - MARGEN - 52;
  const filasPorPagina = Math.floor((inicioTabla - MARGEN - 20) / ALTO_FILA);
  const totalPaginas = Math.max(1, Math.ceil(filas.length / filasPorPagina));
  const anchoTabla = columnas.reduce((s, c) => s + c.ancho, 0);

  const contenidos: string[] = [];
  for (let p = 0; p < totalPaginas; p++) {
    const ops: string[] = [];
    ops.push(textoEn(MARGEN, ALTO_PAGINA - MARGEN - 6, titulo, 13, true));
    if (subtitulo) ops.push(textoEn(MARGEN, ALTO_PAGINA - MARGEN - 22, subtitulo, 8.5));

    // Cabecera de la tabla
    let y = inicioTabla;
    ops.push(`0.93 0.95 0.98 rg ${MARGEN} ${y - 4} ${anchoTabla} ${ALTO_FILA} re f 0 0 0 rg`);
    let x = MARGEN;
    for (const col of columnas) {
      ops.push(textoEn(x + 3, y, recortar(col.titulo, col.ancho, TAM_FUENTE), TAM_FUENTE, true));
      x += col.ancho;
    }

    // Filas
    const pagina = filas.slice(p * filasPorPagina, (p + 1) * filasPorPagina);
    for (let i = 0; i < pagina.length; i++) {
      y -= ALTO_FILA;
      if (i % 2 === 1) ops.push(`0.98 0.98 0.99 rg ${MARGEN} ${y - 4} ${anchoTabla} ${ALTO_FILA} re f 0 0 0 rg`);
      x = MARGEN;
      columnas.forEach((col, j) => {
        ops.push(textoEn(x + 3, y, recortar(pagina[i][j] ?? "", col.ancho, TAM_FUENTE), TAM_FUENTE));
        x += col.ancho;
      });
    }
    ops.push(`0.8 0.83 0.88 RG 0.5 w ${MARGEN} ${y - 6} m ${MARGEN + anchoTabla} ${y - 6} l S`);
    ops.push(textoEn(ANCHO_PAGINA - MARGEN - 70, MARGEN - 8, `Página ${p + 1} de ${totalPaginas}`, 7.5));
    ops.push(textoEn(MARGEN, MARGEN - 8, "FlowDesk ITSM · Documento generado automáticamente", 7.5));
    contenidos.push(ops.join("\n"));
  }

  // Ensamblado de objetos: 1 catálogo, 2 páginas, 3-4 fuentes, luego página+contenido.
  const objetos: string[] = [];
  const idsPaginas = contenidos.map((_, i) => 5 + i * 2);
  objetos[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objetos[2] = `<< /Type /Pages /Kids [${idsPaginas.map((id) => `${id} 0 R`).join(" ")}] /Count ${idsPaginas.length} >>`;
  objetos[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objetos[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
  contenidos.forEach((contenido, i) => {
    const idPagina = 5 + i * 2;
    const largo = Buffer.byteLength(contenido, "latin1");
    objetos[idPagina] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ANCHO_PAGINA} ${ALTO_PAGINA}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${idPagina + 1} 0 R >>`;
    objetos[idPagina + 1] = `<< /Length ${largo} >>\nstream\n${contenido}\nendstream`;
  });

  let pdf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const desplazamientos: number[] = [];
  for (let id = 1; id < objetos.length; id++) {
    desplazamientos[id] = Buffer.byteLength(pdf, "latin1");
    pdf += `${id} 0 obj\n${objetos[id]}\nendobj\n`;
  }
  const inicioXref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objetos.length; id++) {
    pdf += `${String(desplazamientos[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}
