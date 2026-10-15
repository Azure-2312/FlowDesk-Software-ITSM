import { NextRequest, NextResponse } from "next/server";
import { solicitarRecuperacionClave } from "@/modules/seguridad/recuperacionClaveService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resultado = await solicitarRecuperacionClave(body);
    return NextResponse.json(resultado.payload, { status: resultado.httpStatus });
  } catch (error) {
    console.error("Error al solicitar código de recuperación:", error);
    return NextResponse.json(
      { error: "No se pudo enviar el correo de recuperación. Intenta más tarde." },
      { status: 500 }
    );
  }
}
