import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Permitido para Administrador (1) y Auditor (6)
  if (sesion.perfilActivo.id_perfil !== 1 && sesion.perfilActivo.id_perfil !== 6) {
    return NextResponse.json({ error: "No autorizado para consultar la bitácora integral de auditoría." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const modulo = searchParams.get("modulo");
  const accion = searchParams.get("accion");
  const buscar = searchParams.get("buscar");
  const fechaDesde = searchParams.get("fecha_desde");
  const fechaHasta = searchParams.get("fecha_hasta");

  try {
    let sql = `
      SELECT 
        l.id_log,
        l.id_usuario,
        CONCAT(u.nombres, ' ', u.apellido_paterno) as usuario_nombre,
        u.correo_electronico as usuario_correo,
        l.modulo,
        l.accion,
        l.descripcion,
        l.detalles,
        l.direccion_ip,
        l.fecha_creacion
      FROM log_auditoria_sistema l
      LEFT JOIN usuario u ON u.id_usuario = l.id_usuario
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (modulo) {
      sql += ` AND l.modulo = $${idx++}`;
      params.push(modulo);
    }

    if (accion) {
      sql += ` AND l.accion = $${idx++}`;
      params.push(accion);
    }

    if (fechaDesde) {
      sql += ` AND l.fecha_creacion >= $${idx++}::timestamptz`;
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      sql += ` AND l.fecha_creacion <= ($${idx++}::date + interval '1 day')`;
      params.push(fechaHasta);
    }

    if (buscar && buscar.trim()) {
      sql += ` AND (l.descripcion ILIKE $${idx} OR CONCAT(u.nombres, ' ', u.apellido_paterno) ILIKE $${idx} OR l.modulo ILIKE $${idx} OR l.accion ILIKE $${idx})`;
      params.push(`%${buscar.trim()}%`);
      idx++;
    }

    sql += ` ORDER BY l.fecha_creacion DESC LIMIT 200`;

    const logs = await query(sql, params);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error al consultar bitácora de auditoría:", error);
    return NextResponse.json({ error: "Error interno al consultar auditoría" }, { status: 500 });
  }
}
