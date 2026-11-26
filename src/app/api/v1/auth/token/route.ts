import { NextRequest } from "next/server";
import { emitirToken, errorApi } from "@/shared/lib/seguridad-api-externa";

export const dynamic = "force-dynamic";

/** Canjea client_id + client_secret por un token temporal (15 minutos). */
export async function POST(req: NextRequest) {
  try {
    return await emitirToken(req);
  } catch (err: any) {
    console.error("[API_EXTERNA] Error al emitir token:", err?.message);
    return errorApi(500, "error_interno", "No se pudo procesar la solicitud.");
  }
}

export async function GET() {
  return errorApi(405, "metodo_no_permitido", "Use POST con client_id y client_secret.", { Allow: "POST" });
}
