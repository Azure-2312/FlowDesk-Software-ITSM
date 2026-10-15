import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";

const LECTURA = [4, 6, 7, 8, 9];
function sesionDe(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET(req: NextRequest) {
  const sesion = sesionDe(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!LECTURA.includes(sesion.perfilActivo?.id_perfil || 0)) return NextResponse.json({ error: "No autorizado para consultar resiliencia de servicios" }, { status: 403 });
  try {
    const rows = await query(`
      SELECT r.*,s.codigo_servicio,s.nombre AS servicio_nombre
      FROM resiliencia_servicio r JOIN servicio_catalogo s ON s.id_servicio=r.id_servicio
      WHERE r.estado_registro=true AND s.estado_registro=true ORDER BY s.nombre
    `);
    const servicios = await query("SELECT id_servicio,codigo_servicio,nombre FROM servicio_catalogo WHERE estado_registro=true ORDER BY nombre");
    return NextResponse.json({ registros: rows, servicios });
  } catch (error) {
    console.error("Error al consultar resiliencia:", error);
    return NextResponse.json({ error: "No se pudieron consultar los datos de resiliencia" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sesion = sesionDe(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (sesion.perfilActivo?.id_perfil !== 4) return NextResponse.json({ error: "Solo el Supervisor mantiene el registro operativo de resiliencia" }, { status: 403 });
  try {
    const b = await req.json();
    const idServicio = Number(b.id_servicio);
    const objetivo = Number(b.objetivo_disponibilidad);
    const rto = b.rto_horas === "" || b.rto_horas == null ? null : Number(b.rto_horas);
    const rpo = b.rpo_horas === "" || b.rpo_horas == null ? null : Number(b.rpo_horas);
    const umbral = b.umbral_capacidad_pct === "" || b.umbral_capacidad_pct == null ? null : Number(b.umbral_capacidad_pct);
    const plan = String(b.plan_continuidad || "").trim();
    if (!Number.isInteger(idServicio) || !Number.isFinite(objetivo) || objetivo < 0 || objetivo > 100 || !plan) {
      return NextResponse.json({ error: "Servicio, objetivo de disponibilidad y plan de continuidad son obligatorios" }, { status: 400 });
    }
    if ((rto !== null && (!Number.isFinite(rto) || rto < 0)) || (rpo !== null && (!Number.isFinite(rpo) || rpo < 0)) || (umbral !== null && (!Number.isInteger(umbral) || umbral < 1 || umbral > 100))) {
      return NextResponse.json({ error: "RTO, RPO o umbral de capacidad no válido" }, { status: 400 });
    }
    const row = await queryRow(`
      INSERT INTO resiliencia_servicio(id_servicio,objetivo_disponibilidad,disponibilidad_observada,rto_horas,rpo_horas,umbral_capacidad_pct,consumo_capacidad_pct,plan_continuidad,ultima_prueba,proxima_prueba,resultado_ultima_prueba,id_responsable,usuario_creacion,usuario_modificacion,fecha_modificacion,estado_registro)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12,$12,now(),true)
      ON CONFLICT(id_servicio) DO UPDATE SET objetivo_disponibilidad=EXCLUDED.objetivo_disponibilidad,disponibilidad_observada=EXCLUDED.disponibilidad_observada,rto_horas=EXCLUDED.rto_horas,rpo_horas=EXCLUDED.rpo_horas,umbral_capacidad_pct=EXCLUDED.umbral_capacidad_pct,consumo_capacidad_pct=EXCLUDED.consumo_capacidad_pct,plan_continuidad=EXCLUDED.plan_continuidad,ultima_prueba=EXCLUDED.ultima_prueba,proxima_prueba=EXCLUDED.proxima_prueba,resultado_ultima_prueba=EXCLUDED.resultado_ultima_prueba,id_responsable=EXCLUDED.id_responsable,usuario_modificacion=EXCLUDED.usuario_modificacion,fecha_modificacion=now(),estado_registro=true
      RETURNING *
    `, [idServicio, objetivo, b.disponibilidad_observada == null || b.disponibilidad_observada === "" ? null : Number(b.disponibilidad_observada), rto, rpo, umbral, b.consumo_capacidad_pct == null || b.consumo_capacidad_pct === "" ? null : Number(b.consumo_capacidad_pct), plan, b.ultima_prueba || null, b.proxima_prueba || null, String(b.resultado_ultima_prueba || "").trim() || null, sesion.id_usuario]);
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("Error al guardar resiliencia:", error);
    return NextResponse.json({ error: "No se pudo guardar el registro de resiliencia" }, { status: 500 });
  }
}
