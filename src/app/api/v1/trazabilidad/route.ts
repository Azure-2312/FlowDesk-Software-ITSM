import { NextRequest } from "next/server";
import { handleObtenerTrazabilidad } from "@/modules/identidades/api/apiClientesController";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleObtenerTrazabilidad(req);
}
