import { NextRequest } from "next/server";
import { PERMISO_SOLICITANTES, errorApi, respuestaApi, validarToken } from "@/shared/lib/seguridad-api-externa";
import { leerFiltros, listarSolicitantes } from "@/modules/integraciones/services/solicitantesApiService";

export const dynamic = "force-dynamic";

/** Lista paginada (solo lectura) de los Solicitantes registrados en FlowDesk. */
export async function GET(req: NextRequest) {
  let auth;
  try {
    auth = await validarToken(req, PERMISO_SOLICITANTES);
  } catch (err: any) {
    console.error("[API_EXTERNA] Error al validar token:", err?.message);
    return errorApi(500, "error_interno", "No se pudo procesar la solicitud.");
  }
  if (!auth.ok) return auth.respuesta;
  const { ctx } = auth;

  const filtros = leerFiltros(req.nextUrl.searchParams);
  if (typeof filtros === "string") {
    await ctx.registrar(400, undefined, filtros);
    return errorApi(400, "parametro_invalido", filtros, ctx.cabeceras);
  }

  try {
    const datos = await listarSolicitantes(filtros);
    await ctx.registrar(200, `pagina ${datos.pagina} · ${datos.solicitantes.length} registros`);
    return respuestaApi(datos, 200, ctx.cabeceras);
  } catch (err: any) {
    console.error("[API_EXTERNA] Error al listar solicitantes:", err?.message);
    await ctx.registrar(500, undefined, "Error interno al listar");
    return errorApi(500, "error_interno", "No se pudo procesar la solicitud.", ctx.cabeceras);
  }
}

function metodoNoPermitido() {
  return errorApi(405, "metodo_no_permitido", "Este recurso es de solo lectura.", { Allow: "GET" });
}
export const POST = metodoNoPermitido;
export const PUT = metodoNoPermitido;
export const PATCH = metodoNoPermitido;
export const DELETE = metodoNoPermitido;
