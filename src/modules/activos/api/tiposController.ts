import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const tipos = await query(
      "SELECT * FROM tipo_activo_catalogo WHERE estado_registro = true ORDER BY clase ASC, nombre ASC"
    );
    return NextResponse.json({ tipos });
  } catch (error) {
    console.error("Error al obtener tipos de activo:", error);
    return NextResponse.json({ error: "Error al consultar tipos de activo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || ![1, 9].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "No autorizado para registrar tipos de activo." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { codigo, nombre, clase, atributos } = body;

    if (!codigo?.trim() || !nombre?.trim() || !clase) {
      return NextResponse.json({ error: "Código, nombre y clase ('HARDWARE' o 'SOFTWARE') son requeridos." }, { status: 400 });
    }

    const row = await queryRow(
      `INSERT INTO tipo_activo_catalogo (codigo, nombre, clase, atributos, usuario_modificacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, $5, now())
       RETURNING *`,
      [
        codigo.trim().toUpperCase(),
        nombre.trim(),
        clase.trim().toUpperCase(),
        JSON.stringify(atributos || []),
        sesion.id_usuario
      ]
    );

    return NextResponse.json({ mensaje: "Tipo de activo registrado exitosamente.", tipo: row }, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar tipo de activo:", error);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Ya existe un tipo de activo con ese código." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al registrar tipo de activo" }, { status: 500 });
  }
}
