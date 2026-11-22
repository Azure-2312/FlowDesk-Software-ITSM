import { NextRequest } from "next/server";
import { handleListarUsuarios, handleCrearUsuario } from "@/modules/identidades/api/apiClientesController";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleListarUsuarios(req);
}

export async function POST(req: NextRequest) {
  return handleCrearUsuario(req);
}
