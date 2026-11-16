import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  descartarBorradorFlujo,
  guardarBorradorFlujo,
  obtenerFlujo,
  publicarFlujo,
} from "@/modules/problemas/services/flujoService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "estados";
    const data = await obtenerFlujo(pestana);

    // Permisos según las capacidades del usuario autenticado
    const permisos = {
      ver: true,
      editar: sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR),
      publicar: sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIG_PUBLICAR),
    };

    return NextResponse.json({ ...data, permisos });
  } catch (error: any) {
    console.error("Error al obtener flujo de problemas:", error);
    return NextResponse.json({ error: "Error en el servidor al cargar flujo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { accion, pestana = "estados", datos, motivo } = body;

    // 1. Guardar Borrador
    if (accion === "guardar_borrador") {
      const resultado = await guardarBorradorFlujo(pestana, datos, sesion.id_usuario);
      return NextResponse.json(resultado);
    }

    // 2. Publicar Versión Oficial (Solo Admin)
    if (accion === "publicar") {
      if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR)) {
        return NextResponse.json(
          { error: "Solo el perfil Administrador cuenta con privilegios para publicar versiones oficiales" },
          { status: 403 }
        );
      }
      const resultado = await publicarFlujo(pestana, motivo, sesion.id_usuario);
      return NextResponse.json(resultado);
    }

    // 3. Descartar Borrador
    if (accion === "descartar") {
      const resultado = await descartarBorradorFlujo(pestana);
      return NextResponse.json(resultado);
    }

    // 4. Restaurar de Fábrica
    if (accion === "restaurar_fabrica") {
      return NextResponse.json({ ok: true, mensaje: "Valores de fábrica restaurados en borrador" });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al procesar acción en flujo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error en el servidor");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
