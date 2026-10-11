import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feriados = await query(`
      SELECT fecha_inicio, fecha_fin, nombre, tipo, alcance, recurrente_anual, activo
      FROM calendario_feriados
      ORDER BY fecha_inicio ASC
    `);

    let csv = "fecha_inicio,fecha_fin,nombre,tipo,alcance,recurrente_anual,activo\n";
    for (const f of feriados) {
      const fIni = f.fecha_inicio instanceof Date ? f.fecha_inicio.toISOString().substring(0, 10) : String(f.fecha_inicio).substring(0, 10);
      const fFin = f.fecha_fin instanceof Date ? f.fecha_fin.toISOString().substring(0, 10) : String(f.fecha_fin).substring(0, 10);
      const nombreEscapado = `"${(f.nombre || "").replace(/"/g, '""')}"`;
      csv += `${fIni},${fFin},${nombreEscapado},${f.tipo},${f.alcance},${f.recurrente_anual},${f.activo}\n`;
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="calendario_feriados.csv"'
      }
    });
  } catch (error: any) {
    console.error("Error al exportar feriados CSV:", error);
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
    const idxInicio = encabezados.indexOf("fecha_inicio");
    const idxFin = encabezados.indexOf("fecha_fin");
    const idxNombre = encabezados.indexOf("nombre");
    const idxTipo = encabezados.indexOf("tipo");
    const idxAlcance = encabezados.indexOf("alcance");
    const idxRecurrente = encabezados.indexOf("recurrente_anual");
    const idxActivo = encabezados.indexOf("activo");

    if (idxInicio === -1 || idxNombre === -1) {
      return NextResponse.json({ error: "Las columnas 'fecha_inicio' y 'nombre' son obligatorias en el encabezado" }, { status: 400 });
    }

    let insertados = 0;
    const errores: string[] = [];

    for (let i = 1; i < lineas.length; i++) {
      const linea = lineas[i];
      // Manejar comillas simples/dobles
      const partes = linea.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || linea.split(",");
      if (partes.length < 2) continue;

      const fInicio = partes[idxInicio]?.replace(/^"|"$/g, '').trim();
      const fFin = idxFin !== -1 && partes[idxFin] ? partes[idxFin].replace(/^"|"$/g, '').trim() : fInicio;
      const nombre = partes[idxNombre]?.replace(/^"|"$/g, '').trim();
      const tipo = idxTipo !== -1 && partes[idxTipo] ? partes[idxTipo].replace(/^"|"$/g, '').trim() : "nacional";
      const alcance = idxAlcance !== -1 && partes[idxAlcance] ? partes[idxAlcance].replace(/^"|"$/g, '').trim() : "toda_la_organizacion";
      const recurrente = idxRecurrente !== -1 ? partes[idxRecurrente]?.toLowerCase().includes("true") : true;
      const activo = idxActivo !== -1 ? !partes[idxActivo]?.toLowerCase().includes("false") : true;

      if (!fInicio || !nombre) {
        errores.push(`Fila ${i + 1}: Faltan campos requeridos`);
        continue;
      }

      await query(`
        INSERT INTO calendario_feriados (fecha_inicio, fecha_fin, nombre, tipo, alcance, recurrente_anual, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [fInicio, fFin, nombre, tipo, alcance, recurrente, activo]);
      insertados++;
    }

    return NextResponse.json({
      ok: true,
      mensaje: `Se importaron ${insertados} feriados exitosamente.`,
      importados: insertados,
      errores
    });
  } catch (error: any) {
    console.error("Error al importar feriados CSV:", error);
    return NextResponse.json({ error: error.message || "Error al importar CSV" }, { status: 500 });
  }
}
