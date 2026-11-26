import { NextRequest } from "next/server";
import { getCredenciales, postCredencial } from "@/modules/integraciones/api/integracionesController";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  return getCredenciales(req);
}

export function POST(req: NextRequest) {
  return postCredencial(req);
}
