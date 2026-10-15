import { NextRequest, NextResponse } from "next/server";
import { query } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ACTIVOS_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar el historial de activos" }, { status: 403 });
  }

  const idActivo = Number(params.id);
  if (!idActivo || isNaN(idActivo)) {
    return NextResponse.json({ error: "ID de activo inválido" }, { status: 400 });
  }

  try {
    const historial = await query(
      `SELECT 
        h.id_historial,
        h.id_activo,
        h.estado_anterior,
        h.estado_nuevo,
        h.custodio_anterior,
        CONCAT(u_ca.nombres, ' ', u_ca.apellido_paterno) AS custodio_anterior_nombre,
        h.custodio_nuevo,
        CONCAT(u_cn.nombres, ' ', u_cn.apellido_paterno) AS custodio_nuevo_nombre,
        h.motivo,
        h.id_usuario,
        CONCAT(u_reg.nombres, ' ', u_reg.apellido_paterno) AS usuario_registro_nombre,
        h.fecha
       FROM activo_historial h
       LEFT JOIN usuario u_ca ON h.custodio_anterior = u_ca.id_usuario
       LEFT JOIN usuario u_cn ON h.custodio_nuevo = u_cn.id_usuario
       LEFT JOIN usuario u_reg ON h.id_usuario = u_reg.id_usuario
       WHERE h.id_activo = $1
       ORDER BY h.fecha DESC, h.id_historial DESC`,
      [idActivo]
    );

    return NextResponse.json({ historial });
  } catch (error) {
    console.error("Error al obtener historial de activo:", error);
    return NextResponse.json({ error: "Error al consultar historial del activo" }, { status: 500 });
  }
}
