import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

function obtenerSesion(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET(req: NextRequest) {
  const sesion = obtenerSesion(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.OPERACION_EVENTOS)) return NextResponse.json({ error: "No autorizado para consultar eventos" }, { status: 403 });

  const estado = new URL(req.url).searchParams.get("estado");
  const where = estado ? "AND e.estado = $1" : "";
  const params = estado ? [estado] : [];
  try {
    const rows = await query(`
      SELECT e.id_evento,e.codigo_evento,e.fuente,e.titulo,e.descripcion,e.severidad,e.estado,e.detectado_en,
             e.id_ci,ci.codigo_ci,ci.nombre AS ci_nombre,e.id_ticket,t.codigo_ticket
      FROM evento_servicio e
      LEFT JOIN elemento_configuracion ci ON ci.id_ci=e.id_ci
      LEFT JOIN ticket t ON t.id_ticket=e.id_ticket
      WHERE e.estado_registro=true ${where}
      ORDER BY CASE e.severidad WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2 WHEN 'MEDIA' THEN 3 ELSE 4 END,e.detectado_en DESC
    `, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al consultar eventos de servicio:", error);
    return NextResponse.json({ error: "No se pudieron consultar los eventos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sesion = obtenerSesion(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.OPERACION_GESTIONAR)) return NextResponse.json({ error: "Solo el Supervisor registra y clasifica eventos manuales" }, { status: 403 });

  try {
    const body = await req.json();
    const fuente = String(body.fuente || "").trim();
    const titulo = String(body.titulo || "").trim();
    const descripcion = String(body.descripcion || "").trim();
    const severidad = String(body.severidad || "MEDIA").toUpperCase();
    const id_ci = body.id_ci ? Number(body.id_ci) : null;
    if (!fuente || !titulo) return NextResponse.json({ error: "Fuente y título son obligatorios" }, { status: 400 });
    if (!["BAJA", "MEDIA", "ALTA", "CRITICA"].includes(severidad)) return NextResponse.json({ error: "Severidad no válida" }, { status: 400 });
    const codigo = `EVT-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const row = await queryRow(`
      INSERT INTO evento_servicio (codigo_evento,fuente,titulo,descripcion,severidad,id_ci,usuario_creacion)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id_evento,codigo_evento,fuente,titulo,descripcion,severidad,estado,detectado_en,id_ci,id_ticket
    `, [codigo, fuente, titulo, descripcion || null, severidad, id_ci, sesion.id_usuario]);
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("Error al registrar evento:", error);
    return NextResponse.json({ error: "No se pudo registrar el evento" }, { status: 500 });
  }
}
