import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  descartarRelaciones,
  guardarBorradorRelaciones,
  obtenerRelacionesProblemas,
  publicarRelaciones,
  restaurarFabricaRelaciones,
} from "@/modules/problemas/services/relacionesService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const data = await obtenerRelacionesProblemas();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener relaciones de problemas:", error);
    return NextResponse.json({ error: error.message || "Error al cargar configuración" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const esAdminOGestor = sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR);

  try {
    const body = await req.json();
    const { accion, motivo, datos, confirmacion } = body;

    // 1. GUARDAR BORRADOR
    if (accion === "guardar_borrador") {
      return NextResponse.json(await guardarBorradorRelaciones(datos));
    }

    // 2. PUBLICAR CONFIGURACIÓN
    if (accion === "publicar") {
      if (!esAdminOGestor) {
        return NextResponse.json({ error: "No tiene permisos para publicar cambios normativos" }, { status: 403 });
      }
      return NextResponse.json(await publicarRelaciones(motivo, sesion.id_usuario));
    }

    // 3. DESCARTAR CAMBIOS
    if (accion === "descartar") {
      return NextResponse.json(await descartarRelaciones());
    }

    // 4. RESTAURAR VALORES DE FÁBRICA
    if (accion === "restaurar_fabrica") {
      return NextResponse.json(await restaurarFabricaRelaciones(confirmacion));
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al procesar acción de relaciones:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al procesar solicitud");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
