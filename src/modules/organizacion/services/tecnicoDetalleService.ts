import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export async function retirarTecnico(idUsuario: number) {
  await query("UPDATE tecnico_detalle SET estado_registro=false,estado_operativo='INACTIVO' WHERE id_usuario=$1", [idUsuario]);
  return { ok: true };
}

export async function actualizarTecnico(idUsuario: number, body: any, sesion: any) {
  const actual = await queryRow<any>(
    "SELECT * FROM tecnico_detalle WHERE id_usuario = $1 AND estado_registro = true",
    [idUsuario]
  );

  if (!actual) {
    throw new ErrorDominio("Detalle del técnico no encontrado", 404);
  }

  const esAdminOSupervisor = sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_TECNICOS);

  if (sesion.perfilActivo.id_perfil === 4) {
    const gestionaActual = await queryRow<{ existe: boolean }>(
      `SELECT EXISTS (
           SELECT 1 FROM departamento_ti
           WHERE id_departamento = $1 AND id_supervisor = $2 AND estado_registro = true
         ) AS existe`,
      [actual.id_departamento, sesion.id_usuario]
    );
    if (!gestionaActual?.existe) {
      throw new ErrorDominio("El técnico no pertenece a tus grupos de TI.", 403);
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
        throw new ErrorDominio("No puedes transferir técnicos a un grupo que no supervisas.", 403);
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

  return { tecnico: actualizado };
}
