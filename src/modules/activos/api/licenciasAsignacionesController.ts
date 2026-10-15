import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.LICENCIAS_ASIGNACIONES_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar asignaciones de licencias" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const idLicencia = searchParams.get("id_licencia");
  const activas = searchParams.get("activas");

  const condiciones: string[] = ["1=1"];
  const params: any[] = [];
  let pIdx = 1;

  if (idLicencia) {
    condiciones.push(`la.id_licencia = $${pIdx++}`);
    params.push(Number(idLicencia));
  }

  if (activas === "1") {
    condiciones.push("la.fecha_devolucion IS NULL");
  }

  try {
    const asignaciones = await query(
      `SELECT 
        la.id_asignacion,
        la.id_licencia,
        ls.nombre_software,
        ls.fabricante,
        ls.tipo_licencia,
        la.id_usuario,
        CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre,
        u.correo_electronico AS usuario_correo,
        la.id_activo,
        a.codigo_patrimonial AS activo_codigo,
        a.modelo AS activo_modelo,
        la.fecha_asignacion,
        la.fecha_devolucion,
        la.motivo_devolucion,
        CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS usuario_registro_nombre
       FROM licencia_asignacion la
       JOIN licencia_software ls ON la.id_licencia = ls.id_licencia
       LEFT JOIN usuario u ON la.id_usuario = u.id_usuario
       LEFT JOIN activo a ON la.id_activo = a.id_activo
       LEFT JOIN usuario ur ON la.id_usuario_registro = ur.id_usuario
       WHERE ${condiciones.join(" AND ")}
       ORDER BY la.fecha_devolucion IS NULL DESC, la.fecha_asignacion DESC`,
      params
    );

    return NextResponse.json({ asignaciones });
  } catch (error) {
    console.error("Error al obtener asignaciones de licencias:", error);
    return NextResponse.json({ error: "Error al consultar asignaciones de licencias" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.LICENCIAS_GESTIONAR)) {
    return NextResponse.json({ error: "Solo Gestión de Activos puede asignar licencias de software." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_licencia, id_usuario, id_activo, fecha_asignacion } = body;

    if (!id_licencia || (!id_usuario && !id_activo)) {
      return NextResponse.json({ error: "Debe indicar la licencia y al menos un usuario o activo destinatario." }, { status: 400 });
    }

    const lic = await queryRow<{ id_licencia: number; cantidad_adquirida: number; cantidad_en_uso: number }>(
      "SELECT id_licencia, cantidad_adquirida, cantidad_en_uso FROM licencia_software WHERE id_licencia = $1 AND estado_registro = true",
      [Number(id_licencia)]
    );

    if (!lic) {
      return NextResponse.json({ error: "Licencia no encontrada o inactiva." }, { status: 404 });
    }

    if (lic.cantidad_en_uso >= lic.cantidad_adquirida) {
      return NextResponse.json({ error: "No hay cupos disponibles para esta licencia (capacidad agotada)." }, { status: 400 });
    }

    const row = await queryRow(
      `INSERT INTO licencia_asignacion (
        id_licencia,
        id_usuario,
        id_activo,
        fecha_asignacion,
        id_usuario_registro
      ) VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5)
      RETURNING *`,
      [
        Number(id_licencia),
        id_usuario ? Number(id_usuario) : null,
        id_activo ? Number(id_activo) : null,
        fecha_asignacion || null,
        sesion.id_usuario
      ]
    );

    await query(
      "UPDATE licencia_software SET cantidad_en_uso = cantidad_en_uso + 1 WHERE id_licencia = $1",
      [Number(id_licencia)]
    );

    return NextResponse.json({ mensaje: "Licencia asignada exitosamente.", asignacion: row }, { status: 201 });
  } catch (error: any) {
    console.error("Error al asignar licencia:", error);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Ya existe una asignación activa de esta licencia para el destinatario." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al registrar asignación de licencia" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.LICENCIAS_GESTIONAR)) {
    return NextResponse.json({ error: "Solo Gestión de Activos puede revocar asignaciones." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_asignacion, motivo_devolucion } = body;

    if (!id_asignacion) {
      return NextResponse.json({ error: "ID de asignación requerido." }, { status: 400 });
    }

    const actual = await queryRow<{ id_asignacion: number; id_licencia: number; fecha_devolucion: string | null }>(
      "SELECT id_asignacion, id_licencia, fecha_devolucion FROM licencia_asignacion WHERE id_asignacion = $1",
      [Number(id_asignacion)]
    );

    if (!actual) {
      return NextResponse.json({ error: "Asignación no encontrada." }, { status: 404 });
    }

    if (actual.fecha_devolucion) {
      return NextResponse.json({ error: "Esta asignación ya fue devuelta/revocada anteriormente." }, { status: 400 });
    }

    const row = await queryRow(
      `UPDATE licencia_asignacion SET
        fecha_devolucion = CURRENT_DATE,
        motivo_devolucion = $1
       WHERE id_asignacion = $2
       RETURNING *`,
      [motivo_devolucion?.trim() || "Devolución regular de activo/licencia", Number(id_asignacion)]
    );

    await query(
      "UPDATE licencia_software SET cantidad_en_uso = GREATEST(cantidad_en_uso - 1, 0) WHERE id_licencia = $1",
      [actual.id_licencia]
    );

    return NextResponse.json({ mensaje: "Licencia revocada y reincorporada al inventario disponible.", asignacion: row });
  } catch (error) {
    console.error("Error al revocar licencia:", error);
    return NextResponse.json({ error: "Error al revocar asignación de licencia" }, { status: 500 });
  }
}
