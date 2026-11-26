import { NextRequest } from "next/server";
import { patchCredencial } from "@/modules/integraciones/api/integracionesController";

export const dynamic = "force-dynamic";

export function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return patchCredencial(req, params.id);
}
