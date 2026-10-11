import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { id_cambio } = await req.json();

    if (id_cambio) {
      await query(
        `INSERT INTO cambio_enterado (id_cambio, id_usuario)
         VALUES ($1, $2)
         ON CONFLICT (id_cambio, id_usuario) DO NOTHING`,
        [id_cambio, sesion.id_usuario]
      );
    }

    return NextResponse.json({ exito: true });
  } catch (error) {
    console.error("Error al registrar enterado:", error);
    return NextResponse.json({ error: "Error al registrar confirmación" }, { status: 500 });
  }
}
