import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (sesion.perfilActivo?.id_perfil !== 1) return NextResponse.json({ error: "Solo Administración puede retirar técnicos de un departamento." }, { status: 403 });
  const idUsuario = Number(params.id);
  if (!Number.isInteger(idUsuario)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  await query("UPDATE tecnico_detalle SET estado_registro=false,estado_operativo='INACTIVO' WHERE id_usuario=$1", [idUsuario]);
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idUsuario = parseInt(params.id, 10);
  if (isNaN(idUsuario)) {
    return NextResponse.json({ error: "ID de técnico inválido" }, { status: 400 });
  }

  const esAdminOSupervisor = [1, 4].includes(sesion.perfilActivo.id_perfil);
  const esElMismoTecnico = sesion.id_usuario === idUsuario;

  if (!esAdminOSupervisor && !esElMismoTecnico) {
    return NextResponse.json({ error: "No autorizado para modificar este técnico" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const actual = await queryRow<any>(
      "SELECT * FROM tecnico_detalle WHERE id_usuario = $1 AND estado_registro = true",
      [idUsuario]
    );

    if (!actual) {
      return NextResponse.json({ error: "Detalle del técnico no encontrado" }, { status: 404 });
    }

    if (sesion.perfilActivo.id_perfil === 4) {
      const gestionaActual = await queryRow<{ existe: boolean }>(
        `SELECT EXISTS (
           SELECT 1 FROM departamento_ti
           WHERE id_departamento = $1 AND id_supervisor = $2 AND estado_registro = true
         ) AS existe`,
        [actual.id_departamento, sesion.id_usuario]
      );
      if (!gestionaActual?.existe) {
        return NextResponse.json({ error: "El técnico no pertenece a tus grupos de TI." }, { status: 403 });
      }
      if (body.id_departamento !== undefined) {
        const gestionaDestino = await queryRow<{ existe: boolean }>(
          `SELECT EXISTS (
             SELECT 1 FROM departamento_ti
             WHERE id_departamento = $1 AND id_supervisor = $2 AND estado_registro = true
           ) AS existe`,
          [body.id_departamento, sesion.id_usuario]
        );
        if (!gestionaDestino?.existe) {
          return NextResponse.json({ error: "No puedes transferir técnicos a un grupo que no supervisas." }, { status: 403 });
        }
      }
    }

    // El propio técnico solo puede cambiar su estado operativo (disponibilidad)
    const estado_operativo = body.estado_operativo !== undefined ? body.estado_operativo : actual.estado_operativo;

    // Solo admin o supervisor pueden cambiar departamento, nivel o capacidad
    const id_departamento = esAdminOSupervisor && body.id_departamento !== undefined ? body.id_departamento : actual.id_departamento;
    const nivel_soporte = esAdminOSupervisor && body.nivel_soporte !== undefined ? body.nivel_soporte : actual.nivel_soporte;
    const capacidad_maxima_tickets = esAdminOSupervisor && body.capacidad_maxima_tickets !== undefined ? body.capacidad_maxima_tickets : actual.capacidad_maxima_tickets;
    const especialidad_principal = esAdminOSupervisor && body.especialidad_principal !== undefined ? body.especialidad_principal : actual.especialidad_principal;

    const actualizado = await queryRow(
      `UPDATE tecnico_detalle SET
        estado_operativo = $1,
        id_departamento = $2,
        nivel_soporte = $3,
        capacidad_maxima_tickets = $4,
        especialidad_principal = $5
       WHERE id_usuario = $6 AND estado_registro = true
       RETURNING *`,
      [estado_operativo, id_departamento, nivel_soporte, capacidad_maxima_tickets, especialidad_principal, idUsuario]
    );

    return NextResponse.json({ tecnico: actualizado });
  } catch (err) {
    console.error("Error al actualizar técnico:", err);
    return NextResponse.json({ error: "No se pudo actualizar el técnico" }, { status: 500 });
  }
}
