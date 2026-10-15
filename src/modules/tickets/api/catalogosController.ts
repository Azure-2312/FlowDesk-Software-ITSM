export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { listarCatalogosTickets } from "@/modules/tickets/services/catalogosService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const data = await listarCatalogosTickets(sesion);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error al cargar catálogos de tickets:", err);
    return NextResponse.json({ error: "Error al cargar catálogos" }, { status: 500 });
  }
}
