import { NextResponse } from "next/server";
import { generarCaptchaDesafio } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const desafio = generarCaptchaDesafio();
    return NextResponse.json({
      token: desafio.token,
      svg: desafio.svg,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo generar el código de seguridad." },
      { status: 503 }
    );
  }
}
