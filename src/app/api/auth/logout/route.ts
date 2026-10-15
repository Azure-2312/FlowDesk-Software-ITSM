import { NextResponse } from "next/server";
import { COOKIE_SESION } from "@/shared/lib/auth";

export async function POST() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(COOKIE_SESION, "", { path: "/", maxAge: 0 });
  return respuesta;
}
