import { NextRequest, NextResponse } from "next/server";
import { query } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const periodos = await query(`
      SELECT nombre, motivo, fecha_inicio, fecha_fin, recurrente_anual, alcance_tipo, severidad, dias_aviso_anticipado, color, activo
      FROM periodos_congelamiento
      ORDER BY fecha_inicio ASC
    `);

    let csv = "nombre,motivo,fecha_inicio,fecha_fin,recurrente_anual,alcance_tipo,severidad,dias_aviso_anticipado,color,activo\n";
    for (const p of periodos) {
      const pIni = p.fecha_inicio instanceof Date ? p.fecha_inicio.toISOString() : String(p.fecha_inicio);
      const pFin = p.fecha_fin instanceof Date ? p.fecha_fin.toISOString() : String(p.fecha_fin);
      const nombreEscapado = `"${(p.nombre || "").replace(/"/g, '""')}"`;
      csv += `${nombreEscapado},${p.motivo},${pIni},${pFin},${p.recurrente_anual},${p.alcance_tipo},${p.severidad},${p.dias_aviso_anticipado},${p.color},${p.activo}\n`;
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="periodos_congelamiento.csv"'
      }
    });
  } catch (error: any) {
    console.error("Error al exportar períodos de congelamiento CSV:", error);
    return NextResponse.json({ error: error.message || "Error al exportar CSV" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { csv } = body;

    if (!csv || typeof csv !== "string") {
      return NextResponse.json({ error: "Contenido CSV inválido o vacío" }, { status: 400 });
    }

    const lineas = csv.split("\n").map(l => l.trim()).filter(Boolean);
    if (lineas.length <= 1) {
      return NextResponse.json({ error: "El archivo no contiene filas de datos" }, { status: 400 });
    }

    const encabezados = lineas[0].split(",").map(h => h.trim().toLowerCase());
    const idxNombre = encabezados.indexOf("nombre");
    const idxMotivo = encabezados.indexOf("motivo");
    const idxInicio = encabezados.indexOf("fecha_inicio");
    const idxFin = encabezados.indexOf("fecha_fin");
    const idxRecurrente = encabezados.indexOf("recurrente_anual");
    const idxAlcance = encabezados.indexOf("alcance_tipo");
    const idxSeveridad = encabezados.indexOf("severidad");
    const idxAviso = encabezados.indexOf("dias_aviso_anticipado");
    const idxColor = encabezados.indexOf("color");
    const idxActivo = encabezados.indexOf("activo");

    if (idxNombre === -1 || idxInicio === -1 || idxFin === -1) {
      return NextResponse.json({ error: "Las columnas 'nombre', 'fecha_inicio' y 'fecha_fin' son obligatorias" }, { status: 400 });
    }

    let insertados = 0;
    const errores: string[] = [];

    for (let i = 1; i < lineas.length; i++) {
      const linea = lineas[i];
      const partes = linea.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || linea.split(",");
      if (partes.length < 3) continue;

      const nombre = partes[idxNombre]?.replace(/^"|"$/g, '').trim();
      const motivo = idxMotivo !== -1 && partes[idxMotivo] ? partes[idxMotivo].replace(/^"|"$/g, '').trim() : "cierre_contable";
      const fInicio = partes[idxInicio]?.replace(/^"|"$/g, '').trim();
      const fFin = partes[idxFin]?.replace(/^"|"$/g, '').trim();
      const recurrente = idxRecurrente !== -1 ? partes[idxRecurrente]?.toLowerCase().includes("true") : false;
      const alcance = idxAlcance !== -1 && partes[idxAlcance] ? partes[idxAlcance].replace(/^"|"$/g, '').trim() : "toda_la_organizacion";
      const severidad = idxSeveridad !== -1 && partes[idxSeveridad] ? partes[idxSeveridad].replace(/^"|"$/g, '').trim() : "bloqueo_total";
      const aviso = idxAviso !== -1 ? parseInt(partes[idxAviso] || "7", 10) : 7;
      const color = idxColor !== -1 && partes[idxColor] ? partes[idxColor].replace(/^"|"$/g, '').trim() : "#dc2626";
      const activo = idxActivo !== -1 ? !partes[idxActivo]?.toLowerCase().includes("false") : true;

      if (!nombre || !fInicio || !fFin) {
        errores.push(`Fila ${i + 1}: Faltan campos obligatorios`);
        continue;
      }

      await query(`
        INSERT INTO periodos_congelamiento (
          nombre, motivo, fecha_inicio, fecha_fin, recurrente_anual, alcance_tipo,
          severidad, dias_aviso_anticipado, color, activo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [nombre, motivo, fInicio, fFin, recurrente, alcance, severidad, aviso, color, activo]);
      insertados++;
    }

    return NextResponse.json({
      ok: true,
      mensaje: `Se importaron ${insertados} períodos de congelamiento exitosamente.`,
      importados: insertados,
      errores
    });
  } catch (error: any) {
    console.error("Error al importar períodos CSV:", error);
    return NextResponse.json({ error: error.message || "Error al importar CSV" }, { status: 500 });
  }
}
