export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { validarTexto, validarNumeroPositivo, validarSlaTiempos } from "@/shared/lib/validaciones";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idCategoria = Number(params.id);
  if (!idCategoria || isNaN(idCategoria)) {
    return NextResponse.json({ error: "Identificador de categoría inválido." }, { status: 400 });
  }

  try {
    const categoria = await queryRow(
      `SELECT 
        c.*,
        tt.nombre as tipo_nombre,
        tt.codigo as tipo_codigo,
        cp.nombre as categoria_padre_nombre,
        COUNT(DISTINCT s.id_servicio)::int as total_servicios,
        COUNT(DISTINCT t.id_ticket)::int as total_tickets
      FROM categoria_ticket c
      INNER JOIN tipo_ticket tt ON tt.id_tipo_ticket = c.id_tipo_ticket
      LEFT JOIN categoria_ticket cp ON cp.id_categoria = c.id_padre
      LEFT JOIN servicio_catalogo s ON s.id_categoria = c.id_categoria
      LEFT JOIN ticket t ON t.id_categoria = c.id_categoria
      WHERE c.id_categoria = $1
      GROUP BY c.id_categoria, tt.nombre, tt.codigo, cp.nombre`,
      [idCategoria]
    );

    if (!categoria) {
      return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
    }

    const servicios = await query(
      `SELECT id_servicio, codigo_servicio, nombre, entregable, sla_horas_resolucion, estado_registro
       FROM servicio_catalogo
       WHERE id_categoria = $1
       ORDER BY nombre ASC`,
      [idCategoria]
    );

    return NextResponse.json({ categoria, servicios });
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    return NextResponse.json({ error: "Error al consultar la categoría." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_CONFIGURACION)) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para modificar categorías." },
      { status: 403 }
    );
  }

  const idCategoria = Number(params.id);
  if (!idCategoria || isNaN(idCategoria)) {
    return NextResponse.json({ error: "Identificador de categoría inválido." }, { status: 400 });
  }

  try {
    const actual = await queryRow<{
      id_categoria: number;
      id_tipo_ticket: number;
      nombre: string;
      codigo_corto: string;
      descripcion: string | null;
      sla_default_respuesta: number;
      sla_default_resolucion: number;
      estado_registro: boolean;
      id_padre: number | null;
    }>(
      `SELECT * FROM categoria_ticket WHERE id_categoria = $1`,
      [idCategoria]
    );

    if (!actual) {
      return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
    }

    const body = await req.json();

    // Caso 1: Cambio exclusivo de estado (activar / desactivar rápido)
    if (body.estado_registro !== undefined && Object.keys(body).length === 1) {
      const nuevoEstado = Boolean(body.estado_registro);
      await query(
        `UPDATE categoria_ticket SET estado_registro = $1 WHERE id_categoria = $2`,
        [nuevoEstado, idCategoria]
      );

      const ip = req.headers.get("x-forwarded-for") ?? "desconocida";
      await query(
        `INSERT INTO log_auditoria_sistema 
          (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
         VALUES ($1, 'CATALOGO_SERVICIOS', $2, $3, $4, $5)`,
        [
          sesion.id_usuario,
          nuevoEstado ? "ACTIVAR_CATEGORIA" : "DESACTIVAR_CATEGORIA",
          `Categoría [${actual.codigo_corto}] ${actual.nombre} fue ${nuevoEstado ? "activada" : "desactivada"}`,
          JSON.stringify({ id_categoria: idCategoria, estado_anterior: actual.estado_registro, nuevo_estado: nuevoEstado }),
          ip,
        ]
      );

      return NextResponse.json({
        ok: true,
        mensaje: `Categoría ${nuevoEstado ? "activada" : "desactivada"} correctamente.`,
      });
    }

    // Caso 2: Edición completa de datos de la categoría
    const nombre = body.nombre !== undefined ? String(body.nombre).trim() : actual.nombre;
    const codigo_corto = body.codigo_corto !== undefined ? String(body.codigo_corto).trim().toUpperCase() : actual.codigo_corto;
    const descripcion = body.descripcion !== undefined ? (typeof body.descripcion === "string" ? body.descripcion.trim() : null) : actual.descripcion;
    const id_tipo_ticket = body.id_tipo_ticket !== undefined ? Number(body.id_tipo_ticket) : actual.id_tipo_ticket;
    const sla_default_respuesta = body.sla_default_respuesta !== undefined ? Number(body.sla_default_respuesta) : actual.sla_default_respuesta;
    const sla_default_resolucion = body.sla_default_resolucion !== undefined ? Number(body.sla_default_resolucion) : actual.sla_default_resolucion;
    const id_padre = body.id_padre !== undefined ? (body.id_padre ? Number(body.id_padre) : null) : actual.id_padre;
    const estado_registro = body.estado_registro !== undefined ? Boolean(body.estado_registro) : actual.estado_registro;

    // Validar nombre
    const vNom = validarTexto(nombre, 3, 60, "El nombre de la categoría", true);
    if (!vNom.valido) return NextResponse.json({ error: vNom.mensaje }, { status: 400 });

    // Validar código corto
    const codigoLimpio = codigo_corto.replace(/[^A-Z0-9]/g, "");
    if (codigoLimpio.length < 2 || codigoLimpio.length > 10) {
      return NextResponse.json(
        { error: "El código corto debe contener entre 2 y 10 caracteres alfanuméricos en mayúsculas." },
        { status: 400 }
      );
    }

    // Validar tipo
    if (id_tipo_ticket !== 1 && id_tipo_ticket !== 2) {
      return NextResponse.json({ error: "Tipo de requerimiento inválido." }, { status: 400 });
    }

    // Validar SLAs
    const vResp = validarNumeroPositivo(sla_default_respuesta, "El SLA de primera respuesta", 0.5, 720);
    if (!vResp.valido) return NextResponse.json({ error: vResp.mensaje }, { status: 400 });

    const vReso = validarNumeroPositivo(sla_default_resolucion, "El SLA de resolución total", 1, 720);
    if (!vReso.valido) return NextResponse.json({ error: vReso.mensaje }, { status: 400 });

    const vSla = validarSlaTiempos(sla_default_respuesta, sla_default_resolucion);
    if (!vSla.valido) return NextResponse.json({ error: vSla.mensaje }, { status: 400 });

    // Validar descripción
    if (descripcion && descripcion.length > 200) {
      return NextResponse.json({ error: "La descripción no puede exceder los 200 caracteres." }, { status: 400 });
    }

    // Validar unicidad de código
    if (codigoLimpio !== actual.codigo_corto || id_tipo_ticket !== actual.id_tipo_ticket) {
      const existeCod = await queryRow<{ id_categoria: number }>(
        `SELECT id_categoria FROM categoria_ticket WHERE id_tipo_ticket = $1 AND codigo_corto = $2 AND id_categoria != $3`,
        [id_tipo_ticket, codigoLimpio, idCategoria]
      );
      if (existeCod) {
        return NextResponse.json(
          { error: `El código corto "${codigoLimpio}" ya está siendo utilizado por otra categoría.` },
          { status: 409 }
        );
      }
    }

    // Validar unicidad de nombre
    if (nombre.toLowerCase() !== actual.nombre.toLowerCase() || id_tipo_ticket !== actual.id_tipo_ticket) {
      const existeNom = await queryRow<{ id_categoria: number }>(
        `SELECT id_categoria FROM categoria_ticket WHERE id_tipo_ticket = $1 AND LOWER(nombre) = LOWER($2) AND id_categoria != $3`,
        [id_tipo_ticket, nombre, idCategoria]
      );
      if (existeNom) {
        return NextResponse.json(
          { error: `Ya existe otra categoría denominada "${nombre}" para este tipo de ticket.` },
          { status: 409 }
        );
      }
    }

    // Si cambió el tipo de ticket, verificar si tiene servicios asociados
    if (id_tipo_ticket !== actual.id_tipo_ticket) {
      const serviciosAsociados = await queryRow<{ cant: number }>(
        `SELECT COUNT(*)::int as cant FROM servicio_catalogo WHERE id_categoria = $1`,
        [idCategoria]
      );
      if (serviciosAsociados && serviciosAsociados.cant > 0) {
        return NextResponse.json(
          { error: `No se puede cambiar el tipo de ticket de esta categoría porque ya tiene ${serviciosAsociados.cant} servicio(s) asociados en el catálogo.` },
          { status: 400 }
        );
      }
    }

    // Actualizar categoría
    const actualizada = await queryRow(
      `UPDATE categoria_ticket
       SET nombre = $1,
           codigo_corto = $2,
           descripcion = $3,
           id_tipo_ticket = $4,
           sla_default_respuesta = $5,
           sla_default_resolucion = $6,
           id_padre = $7,
           estado_registro = $8
       WHERE id_categoria = $9
       RETURNING *`,
      [
        nombre,
        codigoLimpio,
        descripcion,
        id_tipo_ticket,
        sla_default_respuesta,
        sla_default_resolucion,
        id_padre,
        estado_registro,
        idCategoria,
      ]
    );

    // Auditoría
    const ip = req.headers.get("x-forwarded-for") ?? "desconocida";
    await query(
      `INSERT INTO log_auditoria_sistema 
        (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
       VALUES ($1, 'CATALOGO_SERVICIOS', 'EDITAR_CATEGORIA', $2, $3, $4)`,
      [
        sesion.id_usuario,
        `Se actualizó la categoría [${codigoLimpio}] ${nombre}`,
        JSON.stringify({ antes: actual, despues: actualizada }),
        ip,
      ]
    );

    return NextResponse.json({
      ok: true,
      mensaje: `Categoría "${nombre}" actualizada correctamente.`,
      categoria: actualizada,
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return NextResponse.json({ error: "Error al actualizar la categoría." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_CONFIGURACION)) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para eliminar categorías." },
      { status: 403 }
    );
  }

  const idCategoria = Number(params.id);
  if (!idCategoria || isNaN(idCategoria)) {
    return NextResponse.json({ error: "Identificador de categoría inválido." }, { status: 400 });
  }

  try {
    const actual = await queryRow<{
      id_categoria: number;
      nombre: string;
      codigo_corto: string;
      id_tipo_ticket: number;
    }>(
      `SELECT id_categoria, nombre, codigo_corto, id_tipo_ticket FROM categoria_ticket WHERE id_categoria = $1`,
      [idCategoria]
    );

    if (!actual) {
      return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
    }

    // Contar dependencias en servicios, tickets y artículos
    const [depsServicios, depsTickets] = await Promise.all([
      queryRow<{ cant: number }>(
        `SELECT COUNT(*)::int as cant FROM servicio_catalogo WHERE id_categoria = $1`,
        [idCategoria]
      ),
      queryRow<{ cant: number }>(
        `SELECT COUNT(*)::int as cant FROM ticket WHERE id_categoria = $1`,
        [idCategoria]
      ),
    ]);

    const numServicios = depsServicios?.cant || 0;
    const numTickets = depsTickets?.cant || 0;

    const ip = req.headers.get("x-forwarded-for") ?? "desconocida";

    if (numServicios > 0 || numTickets > 0) {
      // Tiene referencias: realizar deshabilitación segura (soft-delete)
      await query(
        `UPDATE categoria_ticket SET estado_registro = false WHERE id_categoria = $1`,
        [idCategoria]
      );

      await query(
        `INSERT INTO log_auditoria_sistema 
          (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
         VALUES ($1, 'CATALOGO_SERVICIOS', 'DESHABILITAR_CATEGORIA_POR_REFERENCIAS', $2, $3, $4)`,
        [
          sesion.id_usuario,
          `La categoría [${actual.codigo_corto}] ${actual.nombre} fue deshabilitada al tener ${numServicios} servicio(s) y ${numTickets} ticket(s) asociados`,
          JSON.stringify({ id_categoria: idCategoria, num_servicios: numServicios, num_tickets: numTickets }),
          ip,
        ]
      );

      return NextResponse.json({
        ok: true,
        deshabilitada: true,
        mensaje: `La categoría tiene ${numServicios} servicio(s) y ${numTickets} ticket(s) vinculados. Por motivos de auditoría y trazabilidad, ha sido deshabilitada del catálogo y de las listas de selección.`,
      });
    }

    // Sin dependencias: eliminación física permanente
    await query(`DELETE FROM categoria_ticket WHERE id_categoria = $1`, [idCategoria]);

    await query(
      `INSERT INTO log_auditoria_sistema 
        (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
       VALUES ($1, 'CATALOGO_SERVICIOS', 'ELIMINAR_CATEGORIA_PERMANENTE', $2, $3, $4)`,
      [
        sesion.id_usuario,
        `Se eliminó permanentemente la categoría [${actual.codigo_corto}] ${actual.nombre}`,
        JSON.stringify({ id_categoria: idCategoria, datos_eliminados: actual }),
        ip,
      ]
    );

    return NextResponse.json({
      ok: true,
      eliminada: true,
      mensaje: `Categoría "${actual.nombre}" eliminada permanentemente del sistema.`,
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json({ error: "Error al eliminar la categoría." }, { status: 500 });
  }
}
