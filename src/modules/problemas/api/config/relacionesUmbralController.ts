import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarReglaUmbral,
  crearReglaUmbral,
  duplicarReglaUmbral,
  eliminarReglaUmbral,
  listarReglasUmbral,
  simularReglaUmbral,
} from "@/modules/problemas/services/relacionesUmbralService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  try {
    const data = await listarReglasUmbral(searchParams.get("id_regla"));
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al listar reglas de umbral:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { accion, regla, diasSimulacion } = body;

    if (accion === "simular") {
      return NextResponse.json(await simularReglaUmbral(regla, diasSimulacion));
    }
    if (accion === "crear") {
      return NextResponse.json(await crearReglaUmbral(regla));
    }
    if (accion === "duplicar") {
      return NextResponse.json(await duplicarReglaUmbral(regla));
    }

    return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al procesar regla de umbral:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    return NextResponse.json(await actualizarReglaUmbral(body));
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar regla de umbral:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  try {
    return NextResponse.json(await eliminarReglaUmbral(id));
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al eliminar regla de umbral:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}
