import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/lib/auth";

const LECTURA = [6, 7, 8, 9];
function sesionDe(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET(req: NextRequest) {
  const sesion = sesionDe(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!LECTURA.includes(sesion.perfilActivo?.id_perfil || 0)) return NextResponse.json({ error: "No autorizado para consultar proveedores y contratos" }, { status: 403 });
  try {
    const where = sesion.perfilActivo?.id_perfil === 9 ? "" : "WHERE estado_registro=true";
    const rows = await query(`SELECT id_proveedor,codigo_proveedor,nombre,tipo_servicio,contacto_nombre,contacto_correo,contacto_telefono,numero_contrato,fecha_inicio,fecha_vencimiento,servicio_soportado,compromiso_sla,evaluacion_desempeno,estado,observaciones,fecha_creacion FROM proveedor_ti ${where} ORDER BY fecha_vencimiento NULLS LAST,nombre`);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al consultar proveedores:", error);
    return NextResponse.json({ error: "No se pudieron consultar proveedores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sesion = sesionDe(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (sesion.perfilActivo?.id_perfil !== 9) return NextResponse.json({ error: "Solo el Gestor de Activos y Configuración mantiene proveedores técnicos" }, { status: 403 });
  try {
    const b = await req.json();
    const nombre = String(b.nombre || "").trim();
    const tipo = String(b.tipo_servicio || "").trim();
    if (!nombre || !tipo) return NextResponse.json({ error: "Proveedor y tipo de servicio son obligatorios" }, { status: 400 });
    const evaluacion = b.evaluacion_desempeno === "" || b.evaluacion_desempeno == null ? null : Number(b.evaluacion_desempeno);
    if (evaluacion !== null && (!Number.isInteger(evaluacion) || evaluacion < 1 || evaluacion > 5)) return NextResponse.json({ error: "La evaluación debe ser de 1 a 5" }, { status: 400 });
    const codigo = `PRV-${randomUUID().slice(0, 8).toUpperCase()}`;
    const values = [codigo,nombre,tipo,String(b.contacto_nombre||"").trim()||null,String(b.contacto_correo||"").trim()||null,String(b.contacto_telefono||"").trim()||null,String(b.numero_contrato||"").trim()||null,b.fecha_inicio||null,b.fecha_vencimiento||null,String(b.servicio_soportado||"").trim()||null,String(b.compromiso_sla||"").trim()||null,evaluacion,String(b.estado||"ACTIVO").toUpperCase(),String(b.observaciones||"").trim()||null,sesion.id_usuario];
    const rows = await query(`INSERT INTO proveedor_ti(codigo_proveedor,nombre,tipo_servicio,contacto_nombre,contacto_correo,contacto_telefono,numero_contrato,fecha_inicio,fecha_vencimiento,servicio_soportado,compromiso_sla,evaluacion_desempeno,estado,observaciones,usuario_creacion) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id_proveedor,codigo_proveedor,nombre,tipo_servicio,numero_contrato,fecha_vencimiento,estado`, values);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    return NextResponse.json({ error: "No se pudo crear el proveedor o contrato" }, { status: 500 });
  }
}
