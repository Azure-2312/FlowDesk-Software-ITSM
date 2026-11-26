import { NextRequest } from "next/server";
import { getBitacora } from "@/modules/integraciones/api/integracionesController";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  return getBitacora(req);
}
