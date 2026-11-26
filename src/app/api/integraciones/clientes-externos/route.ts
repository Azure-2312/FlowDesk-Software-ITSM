import { NextRequest } from "next/server";
import { getClientesExternos } from "@/modules/integraciones/api/integracionesController";

export const dynamic = "force-dynamic";
// La API del Equipo 10 está en Render y puede tardar ~1 minuto en "despertar".
export const maxDuration = 120;

export function GET(req: NextRequest) {
  return getClientesExternos(req);
}
