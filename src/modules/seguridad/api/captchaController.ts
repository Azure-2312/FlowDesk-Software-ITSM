import { NextResponse } from "next/server";
import { generarNuevoCaptcha } from "@/modules/seguridad/captchaService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const desafio = generarNuevoCaptcha();
    return NextResponse.json(desafio);
  } catch {
    return NextResponse.json(
      { error: "No se pudo generar el código de seguridad." },
      { status: 503 }
    );
  }
}
