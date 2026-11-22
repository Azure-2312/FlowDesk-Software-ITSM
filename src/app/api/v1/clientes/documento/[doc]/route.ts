import { NextRequest } from "next/server";
import { handleObtenerUsuarioPorDni } from "@/modules/identidades/api/apiClientesController";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { doc: string } }) {
  return handleObtenerUsuarioPorDni(req, params.doc);
}
