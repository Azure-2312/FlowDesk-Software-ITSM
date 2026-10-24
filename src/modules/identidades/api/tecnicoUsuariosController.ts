import { NextRequest, NextResponse } from "next/server";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { buscarUsuariosTecnicos } from "@/modules/identidades/services/tecnicoUsuariosService";

export async function GET(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.TICKETS_GESTIONAR);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  try {
    const usuarios = await buscarUsuariosTecnicos(searchParams.get("q")?.trim() || "");
    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("Error al buscar usuarios para registro técnico:", error);
    return NextResponse.json({ error: "Error al buscar usuarios." }, { status: 500 });
  }
}
