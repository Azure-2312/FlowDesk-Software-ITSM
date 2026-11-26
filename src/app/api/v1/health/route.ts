import { query } from "@/shared/lib/db";
import { apiConfigurada, respuestaApi } from "@/shared/lib/seguridad-api-externa";

export const dynamic = "force-dynamic";

/** Estado público mínimo (sin detalles internos del servidor ni de la BD). */
export async function GET() {
  let bdOk = false;
  try {
    bdOk = (await query("SELECT 1 AS ok")).length > 0;
  } catch {
    bdOk = false;
  }
  const operativo = bdOk && apiConfigurada();
  return respuestaApi(
    { servicio: "FlowDesk ITSM · API de Solicitantes", estado: operativo ? "operativo" : "degradado", fecha: new Date().toISOString() },
    operativo ? 200 : 503
  );
}
