import { NextRequest } from "next/server";
import { handleObtenerUsuarioPorId, handleActualizarUsuario } from "@/modules/identidades/api/apiClientesController";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return handleObtenerUsuarioPorId(req, params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return handleActualizarUsuario(req, params.id);
}
