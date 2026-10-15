import { NextRequest, NextResponse } from "next/server";
import { cambiarClaveRecuperacion } from "@/modules/seguridad/recuperacionClaveService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const resultado = await cambiarClaveRecuperacion({ ...body, ip });
    return NextResponse.json(resultado.payload, { status: resultado.httpStatus });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la contraseña. Intenta más tarde." },
      { status: 500 }
    );
  }
}
