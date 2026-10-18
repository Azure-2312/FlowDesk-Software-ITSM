import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { registrarEnteradoCambio } from "@/modules/perfiles/tecnico/services/cambiosEnteradoService";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id_cambio } = await req.json();
    const resultado = await registrarEnteradoCambio(id_cambio, sesion.id_usuario);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al registrar enterado:", error);
    return NextResponse.json({ error: "Error al registrar confirmación" }, { status: 500 });
  }
}
