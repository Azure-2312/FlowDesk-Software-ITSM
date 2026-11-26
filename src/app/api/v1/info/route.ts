import { respuestaApi, TTL_TOKEN_MINUTOS } from "@/shared/lib/seguridad-api-externa";
import { POR_PAGINA_MAX } from "@/modules/integraciones/services/solicitantesApiService";

export const dynamic = "force-dynamic";

export async function GET() {
  return respuestaApi({
    nombre: "FlowDesk ITSM · API de Solicitantes",
    version: "2.0.0",
    autenticacion: {
      tipo: "Credencial de cliente canjeada por token temporal (Bearer)",
      paso_1: "POST /api/v1/auth/token con JSON {client_id, client_secret}",
      paso_2: "GET /api/v1/solicitantes con encabezado Authorization: Bearer <access_token>",
      vigencia_token_segundos: TTL_TOKEN_MINUTOS * 60,
    },
    endpoints: [
      { metodo: "POST", ruta: "/api/v1/auth/token", descripcion: "Obtener token temporal" },
      {
        metodo: "GET",
        ruta: "/api/v1/solicitantes",
        descripcion: "Solicitantes activos (paginado, solo lectura)",
        parametros: {
          pagina: "entero ≥ 1 (por defecto 1)",
          por_pagina: `1 a ${POR_PAGINA_MAX} (por defecto 50)`,
          correo: "opcional, búsqueda exacta",
        },
      },
      { metodo: "GET", ruta: "/api/v1/health", descripcion: "Estado del servicio" },
    ],
  });
}
