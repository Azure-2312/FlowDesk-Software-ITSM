// Controlador de Plataforma → Integraciones API (solo Administrador).
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { obtenerSesionDeRequest } from "@/shared/lib/api-auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { extraerIp, registrarBitacora } from "@/shared/lib/seguridad-api-externa";
import { generarPdfTabla } from "@/shared/lib/pdf-tabla";
import {
  crearCredencial,
  listarBitacora,
  listarCredenciales,
  revocarCredencial,
  rotarSecreto,
} from "@/modules/integraciones/services/credencialesApiService";
import { extraerClientesEquipo10, type ClienteExterno } from "@/modules/integraciones/services/clientesExternosService";

const SIN_CACHE = { "Cache-Control": "no-store" };

function json(cuerpo: unknown, status = 200) {
  return NextResponse.json(cuerpo, { status, headers: SIN_CACHE });
}

/** Solo Administrador; en operaciones de escritura exige además mismo origen (anti-CSRF). */
function exigirAdmin(req: NextRequest, escritura = false) {
  const sesion = obtenerSesionDeRequest(req);
  if (!sesion) return { error: json({ error: "No autenticado" }, 401) };
  if (sesion.perfilActivo.id_perfil !== 1) {
    return { error: json({ error: "Solo el Administrador puede gestionar las integraciones API" }, 403) };
  }
  if (escritura) {
    const origen = req.headers.get("origin");
    if (origen && new URL(origen).host !== req.headers.get("host")) {
      return { error: json({ error: "Origen no permitido" }, 403) };
    }
  }
  return { sesion };
}

function manejarError(err: unknown, mensaje: string) {
  if (!(err instanceof ErrorDominio)) console.error(`[INTEGRACIONES] ${mensaje}:`, err);
  const { error, status } = respuestaError(err, mensaje);
  return json({ error }, status);
}

// ---------------------------------------------------------------------------
// Credenciales
// ---------------------------------------------------------------------------

export async function getCredenciales(req: NextRequest) {
  const { error } = exigirAdmin(req);
  if (error) return error;
  try {
    return json({ credenciales: await listarCredenciales() });
  } catch (err) {
    return manejarError(err, "Error al listar credenciales");
  }
}

export async function postCredencial(req: NextRequest) {
  const { sesion, error } = exigirAdmin(req, true);
  if (error) return error;
  try {
    const datos = await req.json().catch(() => ({}));
    const creada = await crearCredencial(datos, sesion.id_usuario, extraerIp(req));
    return json({ credencial: creada }, 201);
  } catch (err) {
    return manejarError(err, "Error al emitir la credencial");
  }
}

export async function patchCredencial(req: NextRequest, id: string) {
  const { sesion, error } = exigirAdmin(req, true);
  if (error) return error;
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum < 1) return json({ error: "Identificador inválido" }, 400);
  try {
    const { accion } = await req.json().catch(() => ({ accion: null }));
    if (accion === "revocar") {
      await revocarCredencial(idNum, sesion.id_usuario, extraerIp(req));
      return json({ ok: true });
    }
    if (accion === "rotar") {
      return json({ credencial: await rotarSecreto(idNum, sesion.id_usuario, extraerIp(req)) });
    }
    return json({ error: "Acción no válida" }, 400);
  } catch (err) {
    return manejarError(err, "Error al actualizar la credencial");
  }
}

export async function getBitacora(req: NextRequest) {
  const { error } = exigirAdmin(req);
  if (error) return error;
  try {
    const p = req.nextUrl.searchParams;
    return json(await listarBitacora({ direccion: p.get("direccion"), resultado: p.get("resultado") }));
  } catch (err) {
    return manejarError(err, "Error al consultar la bitácora");
  }
}

// ---------------------------------------------------------------------------
// Clientes de la empresa externa (Equipo 10) → vista previa o descarga
// ---------------------------------------------------------------------------

const COLUMNAS: { clave: keyof ClienteExterno; titulo: string; anchoPdf: number; anchoXlsx: number }[] = [
  { clave: "id", titulo: "ID", anchoPdf: 34, anchoXlsx: 8 },
  { clave: "nombres", titulo: "Nombres", anchoPdf: 92, anchoXlsx: 22 },
  { clave: "apellidos", titulo: "Apellidos", anchoPdf: 104, anchoXlsx: 24 },
  { clave: "correo", titulo: "Correo", anchoPdf: 150, anchoXlsx: 32 },
  { clave: "telefono", titulo: "Teléfono", anchoPdf: 66, anchoXlsx: 14 },
  { clave: "direccion", titulo: "Dirección", anchoPdf: 180, anchoXlsx: 40 },
  { clave: "ubigeo", titulo: "Ubigeo", anchoPdf: 44, anchoXlsx: 10 },
  { clave: "fecha_registro", titulo: "Fecha de registro", anchoPdf: 108, anchoXlsx: 22 },
];

/** Evita inyección de fórmulas al abrir el CSV en Excel. */
function celdaCsv(valor: string): string {
  const seguro = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
  return `"${seguro.replace(/"/g, '""')}"`;
}

function formatoFecha(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("es-PE", { timeZone: "America/Lima" });
}

async function generarArchivo(formato: string, datos: Awaited<ReturnType<typeof extraerClientesEquipo10>>) {
  const sello = datos.fecha_extraccion.replace(/[-:]/g, "").substring(0, 13);
  const base = `clientes-${datos.equipo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${sello}`;

  if (formato === "json") {
    return {
      nombre: `${base}.json`,
      tipo: "application/json; charset=utf-8",
      cuerpo: Buffer.from(JSON.stringify(datos, null, 2), "utf8"),
    };
  }
  if (formato === "csv") {
    const lineas = [
      COLUMNAS.map((c) => celdaCsv(c.titulo)).join(","),
      ...datos.clientes.map((cl) => COLUMNAS.map((c) => celdaCsv(cl[c.clave])).join(",")),
    ];
    return {
      nombre: `${base}.csv`,
      tipo: "text/csv; charset=utf-8",
      cuerpo: Buffer.from("﻿" + lineas.join("\r\n"), "utf8"),
    };
  }
  if (formato === "xlsx") {
    const libro = new ExcelJS.Workbook();
    libro.creator = "FlowDesk ITSM";
    libro.created = new Date();
    const hoja = libro.addWorksheet("Clientes");
    hoja.columns = COLUMNAS.map((c) => ({ header: c.titulo, key: c.clave, width: c.anchoXlsx }));
    hoja.getRow(1).font = { bold: true };
    hoja.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    hoja.views = [{ state: "frozen", ySplit: 1 }];
    datos.clientes.forEach((cl) => hoja.addRow(cl));
    hoja.autoFilter = { from: "A1", to: `H${datos.clientes.length + 1}` };
    const info = libro.addWorksheet("Origen");
    info.addRows([
      ["Empresa", datos.equipo],
      ["Origen", datos.origen],
      ["Fecha de extracción", formatoFecha(datos.fecha_extraccion)],
      ["Total de clientes", datos.clientes.length],
    ]);
    info.getColumn(1).width = 22;
    info.getColumn(2).width = 40;
    return {
      nombre: `${base}.xlsx`,
      tipo: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      cuerpo: Buffer.from(await libro.xlsx.writeBuffer()),
    };
  }
  if (formato === "pdf") {
    return {
      nombre: `${base}.pdf`,
      tipo: "application/pdf",
      cuerpo: generarPdfTabla({
        titulo: `Clientes de la empresa externa · ${datos.equipo}`,
        subtitulo: `${datos.clientes.length} clientes · Origen: ${datos.origen} · Extraído el ${formatoFecha(datos.fecha_extraccion)}`,
        columnas: COLUMNAS.map((c) => ({ titulo: c.titulo, ancho: c.anchoPdf })),
        filas: datos.clientes.map((cl) =>
          COLUMNAS.map((c) => (c.clave === "fecha_registro" ? formatoFecha(cl[c.clave]) : cl[c.clave]))
        ),
      }),
    };
  }
  return null;
}

export async function getClientesExternos(req: NextRequest) {
  const { sesion, error } = exigirAdmin(req);
  if (error) return error;
  const formato = req.nextUrl.searchParams.get("formato") || "vista";
  if (!["vista", "json", "csv", "xlsx", "pdf"].includes(formato)) {
    return json({ error: "Formato no válido" }, 400);
  }
  const inicio = Date.now();
  const bitacora = {
    direccion: "SALIENTE" as const,
    grupo: "Equipo 10 · API de clientes",
    idUsuario: sesion.id_usuario,
    metodo: "GET",
    ruta: "equipo10:/api/clientes",
    ip: extraerIp(req),
    inicio,
  };

  try {
    const datos = await extraerClientesEquipo10();
    const archivo = formato === "vista" ? null : await generarArchivo(formato, datos);
    await registrarBitacora({
      ...bitacora,
      codigo: 200,
      detalle: `${datos.clientes.length} clientes · ${formato === "vista" ? "vista previa" : `descarga ${formato.toUpperCase()}`}`,
    });
    if (!archivo) return json(datos);
    return new NextResponse(new Uint8Array(archivo.cuerpo), {
      status: 200,
      headers: {
        ...SIN_CACHE,
        "Content-Type": archivo.tipo,
        "Content-Disposition": `attachment; filename="${archivo.nombre}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    const estado = err instanceof ErrorDominio ? err.estado : 500;
    await registrarBitacora({ ...bitacora, codigo: estado, error: err instanceof Error ? err.message : "Error" });
    return manejarError(err, "Error al consultar la API externa");
  }
}
