export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { validarTexto, validarNumeroPositivo, validarSlaTiempos } from "@/lib/validaciones";

interface CategoriaConStats {
  id_categoria: number;
  id_tipo_ticket: number;
  tipo_nombre: string;
  tipo_codigo: string;
  nombre: string;
  codigo_corto: string;
  descripcion: string | null;
  sla_default_respuesta: number;
  sla_default_resolucion: number;
  estado_registro: boolean;
  id_padre: number | null;
  categoria_padre_nombre: string | null;
  total_servicios: number;
  servicios_activos: number;
  total_tickets: number;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Permitir a perfiles administrativos y de gestión técnica
  const perfilesAutorizados = [1, 2, 4];
  if (!sesion.perfilActivo || !perfilesAutorizados.includes(sesion.perfilActivo.id_perfil)) {
    return NextResponse.json(
      { error: "No tienes permisos para consultar la administración de categorías." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const idTipo = searchParams.get("id_tipo");
    const estado = searchParams.get("estado"); // "activos", "inactivos", "todos"
    const buscar = searchParams.get("buscar");

    const condiciones: string[] = [];
    const params: (string | number)[] = [];
    let paramIdx = 1;

    if (idTipo && (idTipo === "1" || idTipo === "2")) {
      condiciones.push(`c.id_tipo_ticket = $${paramIdx++}`);
      params.push(Number(idTipo));
    }

    if (estado === "activos") {
      condiciones.push("c.estado_registro = true");
    } else if (estado === "inactivos") {
      condiciones.push("c.estado_registro = false");
    }

    if (buscar && buscar.trim().length > 0) {
      condiciones.push(`(c.nombre ILIKE $${paramIdx} OR c.codigo_corto ILIKE $${paramIdx} OR c.descripcion ILIKE $${paramIdx})`);
      params.push(`%${buscar.trim()}%`);
      paramIdx++;
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

    const sql = `
      SELECT 
        c.id_categoria,
        c.id_tipo_ticket,
        tt.nombre as tipo_nombre,
        tt.codigo as tipo_codigo,
        c.nombre,
        c.codigo_corto,
        c.descripcion,
        c.sla_default_respuesta,
        c.sla_default_resolucion,
        c.estado_registro,
        c.id_padre,
        cp.nombre as categoria_padre_nombre,
        COUNT(DISTINCT s.id_servicio)::int as total_servicios,
        COUNT(DISTINCT s.id_servicio) FILTER (WHERE s.estado_registro = true)::int as servicios_activos,
        COUNT(DISTINCT t.id_ticket)::int as total_tickets
      FROM categoria_ticket c
      INNER JOIN tipo_ticket tt ON tt.id_tipo_ticket = c.id_tipo_ticket
      LEFT JOIN categoria_ticket cp ON cp.id_categoria = c.id_padre
      LEFT JOIN servicio_catalogo s ON s.id_categoria = c.id_categoria
      LEFT JOIN ticket t ON t.id_categoria = c.id_categoria
      ${whereClause}
      GROUP BY 
        c.id_categoria,
        c.id_tipo_ticket,
        tt.nombre,
        tt.codigo,
        c.nombre,
        c.codigo_corto,
        c.descripcion,
        c.sla_default_respuesta,
        c.sla_default_resolucion,
        c.estado_registro,
        c.id_padre,
        cp.nombre
      ORDER BY c.id_tipo_ticket ASC, c.nombre ASC
    `;

    const categorias = await query<CategoriaConStats>(sql, params);
    return NextResponse.json({ categorias });
  } catch (error) {
    console.error("Error al listar categorías:", error);
    return NextResponse.json({ error: "Error al consultar categorías del sistema." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para registrar nuevas categorías." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      nombre,
      id_tipo_ticket,
      codigo_corto,
      descripcion,
      sla_default_respuesta,
      sla_default_resolucion,
      id_padre,
    } = body;

    // 1. Validar nombre
    const vNom = validarTexto(nombre, 3, 60, "El nombre de la categoría", true);
    if (!vNom.valido) {
      return NextResponse.json({ error: vNom.mensaje }, { status: 400 });
    }

    // 2. Validar tipo
    const tipoNum = Number(id_tipo_ticket);
    if (tipoNum !== 1 && tipoNum !== 2) {
      return NextResponse.json(
        { error: "Debes seleccionar un tipo válido de ticket (1 para Incidente o 2 para Solicitud)." },
        { status: 400 }
      );
    }

    // 3. Validar código corto
    const codigoLimpio = String(codigo_corto || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (codigoLimpio.length < 2 || codigoLimpio.length > 10) {
      return NextResponse.json(
        { error: "El código corto debe contener entre 2 y 10 caracteres alfanuméricos en mayúsculas (ej: RED, SW, ACC)." },
        { status: 400 }
      );
    }

    // 4. Validar SLAs
    const numResp = Number(sla_default_respuesta) || 4;
    const numReso = Number(sla_default_resolucion) || 24;
    const vResp = validarNumeroPositivo(numResp, "El SLA de primera respuesta", 0.5, 720);
    if (!vResp.valido) {
      return NextResponse.json({ error: vResp.mensaje }, { status: 400 });
    }
    const vReso = validarNumeroPositivo(numReso, "El SLA de resolución total", 1, 720);
    if (!vReso.valido) {
      return NextResponse.json({ error: vReso.mensaje }, { status: 400 });
    }
    const vSla = validarSlaTiempos(numResp, numReso);
    if (!vSla.valido) {
      return NextResponse.json({ error: vSla.mensaje }, { status: 400 });
    }

    // 5. Validar descripción opcional
    const descLimpia = typeof descripcion === "string" ? descripcion.trim() : null;
    if (descLimpia && descLimpia.length > 200) {
      return NextResponse.json(
        { error: "La descripción no puede exceder los 200 caracteres." },
        { status: 400 }
      );
    }

    // 6. Validar unicidad del código corto y nombre en el mismo tipo
    const existeCodigo = await queryRow<{ id_categoria: number }>(
      `SELECT id_categoria FROM categoria_ticket WHERE id_tipo_ticket = $1 AND codigo_corto = $2`,
      [tipoNum, codigoLimpio]
    );
    if (existeCodigo) {
      return NextResponse.json(
        { error: `El código corto "${codigoLimpio}" ya está registrado para este tipo de ticket. Elija otro código.` },
        { status: 409 }
      );
    }

    const existeNombre = await queryRow<{ id_categoria: number }>(
      `SELECT id_categoria FROM categoria_ticket WHERE id_tipo_ticket = $1 AND LOWER(nombre) = LOWER($2)`,
      [tipoNum, nombre.trim()]
    );
    if (existeNombre) {
      return NextResponse.json(
        { error: `Ya existe una categoría denominada "${nombre.trim()}" para este tipo de ticket.` },
        { status: 409 }
      );
    }

    // 7. Insertar nueva categoría
    const nueva = await queryRow<CategoriaConStats>(
      `INSERT INTO categoria_ticket 
        (id_tipo_ticket, nombre, codigo_corto, descripcion, sla_default_respuesta, sla_default_resolucion, id_padre, estado_registro)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [
        tipoNum,
        nombre.trim(),
        codigoLimpio,
        descLimpia,
        numResp,
        numReso,
        id_padre ? Number(id_padre) : null,
      ]
    );

    // 8. Registrar auditoría
    const ip = req.headers.get("x-forwarded-for") ?? "desconocida";
    await query(
      `INSERT INTO log_auditoria_sistema 
        (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
       VALUES ($1, 'CATALOGO_SERVICIOS', 'CREAR_CATEGORIA', $2, $3, $4)`,
      [
        sesion.id_usuario,
        `Se creó la categoría [${codigoLimpio}] ${nombre.trim()} para ${tipoNum === 1 ? "Incidentes" : "Solicitudes"}`,
        JSON.stringify({ nueva_categoria: nueva }),
        ip,
      ]
    );

    return NextResponse.json({
      ok: true,
      mensaje: `Categoría "${nombre.trim()}" registrada exitosamente.`,
      categoria: nueva,
    }, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json({ error: "Ocurrió un error al registrar la categoría." }, { status: 500 });
  }
}
