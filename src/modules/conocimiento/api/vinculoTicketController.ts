import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { respuestaError } from "@/shared/lib/errores";
import {
  vincularArticuloTicket,
  listarArticulosVinculadosTicket,
} from "@/modules/conocimiento/services/conocimientoService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const idTicket = searchParams.get("id_ticket");

  if (!idTicket) {
    return NextResponse.json({ error: "id_ticket es obligatorio." }, { status: 400 });
  }

  try {
    const vinculos = await listarArticulosVinculadosTicket(Number(idTicket));
    return NextResponse.json({ vinculos });
  } catch (error) {
    const { error: mensaje, status } = respuestaError(error, "Error al consultar artículos vinculados");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { id_articulo, id_ticket, resolvio_ticket } = body;

    if (!id_articulo || !id_ticket) {
      return NextResponse.json(
        { error: "id_articulo e id_ticket son obligatorios." },
        { status: 400 }
      );
    }

    const resultado = await vincularArticuloTicket(
      Number(id_articulo),
      Number(id_ticket),
      resolvio_ticket !== undefined ? Boolean(resolvio_ticket) : true,
      {
        idUsuario: sesion.id_usuario,
        nombres: sesion.nombres,
        idPerfil: sesion.perfilActivo?.id_perfil || 0,
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      }
    );

    return NextResponse.json(resultado);
  } catch (error) {
    const { error: mensaje, status } = respuestaError(error, "Error al vincular artículo al ticket");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
