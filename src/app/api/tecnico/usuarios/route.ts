import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  try {
    let sql = `
      SELECT 
        u.id_usuario,
        u.nombres,
        u.apellido_paterno,
        u.apellido_materno,
        u.correo_electronico,
        u.dni as numero_documento,
        u.celular as telefono,
        COALESCE(u.nivel_prioridad, 5) as nivel_prioridad,
        de.nombre as departamento_nombre
      FROM usuario u
      LEFT JOIN departamento_empresa de ON de.id_departamento_empresa = u.id_departamento_empresa
      WHERE u.estado_registro = true
    `;
    const params: any[] = [];

    if (q) {
      sql += ` AND (
        u.nombres ILIKE $1 OR 
        u.apellido_paterno ILIKE $1 OR 
        u.apellido_materno ILIKE $1 OR
        CONCAT(u.nombres, ' ', u.apellido_paterno) ILIKE $1 OR
        CONCAT(u.nombres, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) ILIKE $1 OR
        u.correo_electronico ILIKE $1 OR
        u.dni ILIKE $1
      )`;
      params.push(`%${q}%`);
    }

    sql += ` ORDER BY u.nombres ASC LIMIT 30`;

    const usuarios = await query<any>(sql, params);
    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("Error al buscar usuarios para registro técnico:", error);
    return NextResponse.json({ error: "Error al buscar usuarios." }, { status: 500 });
  }
}
