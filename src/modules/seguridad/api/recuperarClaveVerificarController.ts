import { NextRequest, NextResponse } from "next/server";
import { verificarCodigoRecuperacion } from "@/modules/seguridad/recuperacionClaveService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resultado = await verificarCodigoRecuperacion(body);
    return NextResponse.json(resultado.payload, { status: resultado.httpStatus });
  } catch (error) {
    console.error("Error al verificar código:", error);
    return NextResponse.json(
      { error: "Error interno al verificar el código" },
      { status: 500 }
    );
  }
}
