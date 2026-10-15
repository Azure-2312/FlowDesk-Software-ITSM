import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { validarCodigo, validarTexto } from "@/shared/lib/validaciones";

function sesion(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}
export async function GET(req: NextRequest) {
  const s = sesion(req);
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.ADMIN_ORGANIZACION)) return NextResponse.json({ error: "Solo Administración puede consultar departamentos." }, { status: 403 });
  const departamentos = await query("SELECT d.*,COUNT(u.id_usuario)::int AS colaboradores FROM departamento_empresa d LEFT JOIN usuario u ON u.id_departamento_empresa=d.id_departamento_empresa AND u.estado_registro=true GROUP BY d.id_departamento_empresa ORDER BY d.nombre");
  return NextResponse.json({ departamentos });
}
export async function POST(req: NextRequest) {
  const s = sesion(req);
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.ADMIN_ORGANIZACION)) return NextResponse.json({ error: "Solo Administración puede crear departamentos." }, { status: 403 });
  const b = await req.json();

  const vCod = validarCodigo(b.codigo, 2, 20, "El código del departamento empresarial");
  if (!vCod.valido) return NextResponse.json({ error: vCod.mensaje }, { status: 400 });

  const vNom = validarTexto(b.nombre, 2, 100, "El nombre del departamento empresarial", true);
  if (!vNom.valido) return NextResponse.json({ error: vNom.mensaje }, { status: 400 });

  const nombre = String(b.nombre).trim();
  const codigo = String(b.codigo).trim().toUpperCase();
  try {
    const departamento = await queryRow("INSERT INTO departamento_empresa(codigo,nombre,descripcion) VALUES($1,$2,$3) RETURNING *", [codigo,nombre,String(b.descripcion||"").trim()||null]);
    return NextResponse.json({ departamento }, { status: 201 });
  } catch (e: any) {
    if (e.code === "23505") return NextResponse.json({ error: "Ya existe un departamento con ese código o nombre." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo crear el departamento." }, { status: 500 });
  }
}
