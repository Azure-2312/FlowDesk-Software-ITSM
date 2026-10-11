const fs = require('fs');

const fileContent = `import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { ServicioCatalogo, ServicioWorkflowPaso } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const servicio = await queryRow<ServicioCatalogo>(
      \`SELECT 
        s.id_servicio,
        s.codigo_servicio,
        s.id_tipo_ticket,
        tt.nombre as tipo_nombre,
        tt.codigo as tipo_codigo,
        s.id_categoria,
        cat.nombre as categoria_nombre,
        s.nombre,
        s.descripcion_comercial,
        s.entregable,
        s.requiere_aprobacion,
        s.sla_horas_resolucion,
        s.sla_horas_respuesta,
        s.costo_referencial,
        s.icono,
        s.estado_registro,
        s.motivo_inactivacion,
        s.fecha_inactivacion,
        s.usuario_inactivacion,
        CONCAT(u_inact.nombres, ' ', u_inact.apellido_paterno) AS usuario_inactivacion_nombre
      FROM servicio_catalogo s
      INNER JOIN tipo_ticket tt ON tt.id_tipo_ticket = s.id_tipo_ticket
      INNER JOIN categoria_ticket cat ON cat.id_categoria = s.id_categoria
      LEFT JOIN usuario u_inact ON s.usuario_inactivacion = u_inact.id_usuario
      WHERE s.id_servicio = $1\`,
      [idServicio]
    );

    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    const pasos = await query<ServicioWorkflowPaso>(
      \`SELECT 
        id_paso,
        id_servicio,
        orden,
        codigo_paso,
        nombre_paso,
        rol_ejecutor,
        es_compuerta_aprobacion,
        pausa_sla,
        estado_registro
      FROM servicio_workflow_paso
      WHERE id_servicio = $1 AND estado_registro = true
      ORDER BY orden ASC\`,
      [idServicio]
    );

    return NextResponse.json({ servicio: { ...servicio, pasos } });
  } catch (err) {
    console.error("Error al obtener detalle del servicio:", err);
    return NextResponse.json({ error: "Error al consultar servicio" }, { status: 500 });
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

  // Solo Administrador (1)
  if (sesion.perfilActivo.id_perfil !== 1) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para modificar servicios" },
      { status: 403 }
    );
  }

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const actual = await queryRow<any>(
      "SELECT * FROM servicio_catalogo WHERE id_servicio = $1",
      [idServicio]
    );

    if (!actual) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    // Gestion de estado activo/inactivo con justificacion obligatoria
    let nuevoEstado = actual.estado_registro;
    let motivoInactivacion = actual.motivo_inactivacion;
    let fechaInactivacion = actual.fecha_inactivacion;
    let usuarioInactivacion = actual.usuario_inactivacion;

    if (body.estado_registro !== undefined) {
      nuevoEstado = Boolean(body.estado_registro);
      if (!nuevoEstado) {
        // Deshabilitando servicio: motivo obligatorio
        if (!body.motivo_inactivacion || typeof body.motivo_inactivacion !== "string" || body.motivo_inactivacion.trim().length < 5) {
          return NextResponse.json(
            { error: "Debe ingresar una justificación detallada (mínimo 5 caracteres) para deshabilitar el servicio." },
            { status: 400 }
          );
        }
        motivoInactivacion = body.motivo_inactivacion.trim();
        fechaInactivacion = new Date();
        usuarioInactivacion = sesion.id_usuario;
      } else {
        // Reactivando servicio
        motivoInactivacion = null;
        fechaInactivacion = null;
        usuarioInactivacion = null;
      }
    }

    const nombre = body.nombre !== undefined ? body.nombre.trim() : actual.nombre;
    const descripcion_comercial = body.descripcion_comercial !== undefined ? body.descripcion_comercial.trim() : actual.descripcion_comercial;
    const entregable = body.entregable !== undefined ? body.entregable.trim() : actual.entregable;
    const requiere_aprobacion = body.requiere_aprobacion !== undefined ? body.requiere_aprobacion : actual.requiere_aprobacion;
    const sla_horas_resolucion = body.sla_horas_resolucion !== undefined ? body.sla_horas_resolucion : actual.sla_horas_resolucion;
    const sla_horas_respuesta = body.sla_horas_respuesta !== undefined ? body.sla_horas_respuesta : actual.sla_horas_respuesta;
    const costo_referencial = body.costo_referencial !== undefined ? body.costo_referencial : actual.costo_referencial;
    const id_categoria = body.id_categoria !== undefined ? body.id_categoria : actual.id_categoria;
    const id_tipo_ticket = body.id_tipo_ticket !== undefined ? body.id_tipo_ticket : actual.id_tipo_ticket;

    const actualizado = await queryRow<ServicioCatalogo>(
      \`UPDATE servicio_catalogo SET
        nombre = $1,
        descripcion_comercial = $2,
        entregable = $3,
        requiere_aprobacion = $4,
        sla_horas_resolucion = $5,
        sla_horas_respuesta = $6,
        costo_referencial = $7,
        id_categoria = $8,
        id_tipo_ticket = $9,
        estado_registro = $10,
        motivo_inactivacion = $11,
        fecha_inactivacion = $12,
        usuario_inactivacion = $13
      WHERE id_servicio = $14
      RETURNING *\`,
      [
        nombre,
        descripcion_comercial,
        entregable,
        requiere_aprobacion,
        sla_horas_resolucion,
        sla_horas_respuesta,
        costo_referencial,
        id_categoria,
        id_tipo_ticket,
        nuevoEstado,
        motivoInactivacion,
        fechaInactivacion,
        usuarioInactivacion,
        idServicio,
      ]
    );

    return NextResponse.json({ servicio: actualizado });
  } catch (err) {
    console.error("Error al actualizar servicio:", err);
    return NextResponse.json({ error: "No se pudo actualizar el servicio" }, { status: 500 });
  }
}
`;

fs.writeFileSync('src/app/api/servicios/[id]/route.ts', fileContent, 'utf8');
console.log('src/app/api/servicios/[id]/route.ts updated');
