// Controladores HTTP de comprobantes electrónicos de proveedores y de la
// configuración de la integración con Nubefact.

import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad, type Capacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import type { SesionUsuario } from "@/types";
import {
  actualizarEstadoSunat,
  anularBorrador,
  archivoComprobante,
  catalogosRegistro,
  emitirComprobante,
  listarComprobantes,
  obtenerComprobante,
  registrarComprobante,
  registrarConformidad,
} from "@/modules/facturacion/services/comprobantesService";
import {
  guardarConfiguracion,
  guardarVinculoProveedor,
  leerConfiguracion,
  listarProveedoresFacturacion,
} from "@/modules/facturacion/services/configuracionFacturacionService";
import { probarConexion } from "@/modules/facturacion/services/nubefactCliente";

type Contexto = { params: { id: string } };

function exigir(req: NextRequest, capacidad: Capacidad): SesionUsuario | NextResponse {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, capacidad)) {
    return NextResponse.json({ error: "No autorizado para esta operación de comprobantes electrónicos" }, { status: 403 });
  }
  return sesion;
}

async function responder(fn: () => Promise<unknown>, mensaje: string, status = 200) {
  try {
    const datos = await fn();
    return NextResponse.json(datos ?? { ok: true }, { status });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error(mensaje, error);
    const r = respuestaError(error, mensaje);
    return NextResponse.json({ error: r.error }, { status: r.status });
  }
}

function idDe(ctx: Contexto): number {
  const id = Number(ctx.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorDominio("Identificador no válido.");
  return id;
}

// GET /api/facturacion/comprobantes
export async function listar(req: NextRequest) {
  const s = exigir(req, CAPACIDADES.COMPROBANTES_VER);
  if (s instanceof NextResponse) return s;
  const u = req.nextUrl.searchParams;
  return responder(
    () => listarComprobantes(s, { estado: u.get("estado") || undefined, conformidad: u.get("conformidad") || undefined, texto: u.get("q") || undefined }),
    "No se pudieron listar los comprobantes"
  );
}

// POST /api/facturacion/comprobantes
export async function crear(req: NextRequest) {
  const s = exigir(req, CAPACIDADES.COMPROBANTES_GESTIONAR);
  if (s instanceof NextResponse) return s;
  const body = await req.json().catch(() => ({}));
  return responder(() => registrarComprobante(body, s), "No se pudo registrar el comprobante", 201);
}

// GET /api/facturacion/comprobantes/[id]
export async function detalle(req: NextRequest, ctx: Contexto) {
  const s = exigir(req, CAPACIDADES.COMPROBANTES_VER);
  if (s instanceof NextResponse) return s;
  return responder(() => obtenerComprobante(idDe(ctx), s), "No se pudo obtener el comprobante");
}

// DELETE /api/facturacion/comprobantes/[id]  (anula un borrador)
export async function anular(req: NextRequest, ctx: Contexto) {
  const s = exigir(req, CAPACIDADES.COMPROBANTES_GESTIONAR);
  if (s instanceof NextResponse) return s;
  return responder(() => anularBorrador(idDe(ctx), s), "No se pudo anular el comprobante");
}

// POST /api/facturacion/comprobantes/[id]/emitir
export async function emitir(req: NextRequest, ctx: Contexto) {
  const s = exigir(req, CAPACIDADES.COMPROBANTES_GESTIONAR);
  if (s instanceof NextResponse) return s;
  return responder(() => emitirComprobante(idDe(ctx), s), "No se pudo enviar el comprobante a SUNAT");
}

// POST /api/facturacion/comprobantes/[id]/estado
export async function consultarEstado(req: NextRequest, ctx: Contexto) {
  const s = exigir(req, CAPACIDADES.COMPROBANTES_GESTIONAR);
  if (s instanceof NextResponse) return s;
  return responder(() => actualizarEstadoSunat(idDe(ctx), s), "No se pudo consultar el estado en SUNAT");
}

// POST /api/facturacion/comprobantes/[id]/conformidad  { decision, observacion }
export async function conformidad(req: NextRequest, ctx: Contexto) {
  const s = exigir(req, CAPACIDADES.COMPROBANTES_CONFORMIDAD);
  if (s instanceof NextResponse) return s;
  const body = await req.json().catch(() => ({}));
  return responder(() => registrarConformidad(idDe(ctx), body.decision, body.observacion ?? null, s), "No se pudo registrar la conformidad");
}

// GET /api/facturacion/comprobantes/[id]/archivo?tipo=pdf|xml|cdr
export async function archivo(req: NextRequest, ctx: Contexto) {
  const s = exigir(req, CAPACIDADES.COMPROBANTES_VER);
  if (s instanceof NextResponse) return s;
  const tipo = req.nextUrl.searchParams.get("tipo");
  if (tipo !== "pdf" && tipo !== "xml" && tipo !== "cdr") {
    return NextResponse.json({ error: "Tipo de archivo no válido (pdf, xml o cdr)." }, { status: 400 });
  }
  try {
    const a = await archivoComprobante(idDe(ctx), s, tipo); // aplica alcance del perfil
    return new NextResponse(new Uint8Array(a.contenido), {
      status: 200,
      headers: {
        "Content-Type": a.tipoContenido,
        "Content-Disposition": `attachment; filename="${a.nombre}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al descargar archivo de comprobante", error);
    const r = respuestaError(error, "No se pudo descargar el archivo");
    return NextResponse.json({ error: r.error }, { status: r.status });
  }
}

// GET /api/facturacion/catalogos
export async function catalogos(req: NextRequest) {
  const s = exigir(req, CAPACIDADES.COMPROBANTES_GESTIONAR);
  if (s instanceof NextResponse) return s;
  return responder(() => catalogosRegistro(), "No se pudieron cargar los catálogos");
}

// GET/PUT /api/facturacion/configuracion  ·  POST /api/facturacion/configuracion/probar
export async function verConfiguracion(req: NextRequest) {
  const s = exigir(req, CAPACIDADES.FACTURACION_CONFIGURAR);
  if (s instanceof NextResponse) return s;
  return responder(async () => ({ ...(await leerConfiguracion()), proveedores: await listarProveedoresFacturacion() }), "No se pudo leer la configuración");
}

export async function editarConfiguracion(req: NextRequest) {
  const s = exigir(req, CAPACIDADES.FACTURACION_CONFIGURAR);
  if (s instanceof NextResponse) return s;
  const body = await req.json().catch(() => ({}));
  return responder(() => guardarConfiguracion(body, s.id_usuario), "No se pudo guardar la configuración");
}

export async function probar(req: NextRequest) {
  const s = exigir(req, CAPACIDADES.FACTURACION_CONFIGURAR);
  if (s instanceof NextResponse) return s;
  return responder(() => probarConexion(), "No se pudo probar la conexión");
}

// PUT /api/facturacion/proveedores/[id]
export async function vincularProveedor(req: NextRequest, ctx: Contexto) {
  const s = exigir(req, CAPACIDADES.FACTURACION_CONFIGURAR);
  if (s instanceof NextResponse) return s;
  const body = await req.json().catch(() => ({}));
  return responder(() => guardarVinculoProveedor(idDe(ctx), body), "No se pudo guardar el vínculo del proveedor");
}
