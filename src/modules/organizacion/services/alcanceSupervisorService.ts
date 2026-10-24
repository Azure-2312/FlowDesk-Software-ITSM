import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import type { SesionUsuario } from "@/types";

type Sesion = Pick<SesionUsuario, "id_usuario" | "perfilActivo">;

export function esPerfilSupervisor(sesion: Sesion) {
  return sesion.perfilActivo?.id_perfil === 4;
}

export async function tecnicoPerteneceAlSupervisor(
  idUsuarioTecnico: number,
  idSupervisor: number
): Promise<boolean> {
  const fila = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM tecnico_detalle td
       INNER JOIN departamento_ti d ON d.id_departamento = td.id_departamento
       WHERE td.id_usuario = $1
         AND td.estado_registro = true
         AND d.estado_registro = true
         AND d.id_supervisor = $2
     ) AS existe`,
    [idUsuarioTecnico, idSupervisor]
  );
  return Boolean(fila?.existe);
}

export async function exigirTecnicoDelSupervisor(
  idUsuarioTecnico: number,
  sesion: Sesion
) {
  if (!esPerfilSupervisor(sesion)) return;
  if (!(await tecnicoPerteneceAlSupervisor(idUsuarioTecnico, sesion.id_usuario))) {
    throw new ErrorDominio(
      "Solo puedes gestionar técnicos de tus grupos.",
      403
    );
  }
}

export async function exigirTecnicoActivo(idUsuarioTecnico: number) {
  const fila = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM tecnico_detalle td
       INNER JOIN usuario u ON u.id_usuario = td.id_usuario
       WHERE td.id_usuario = $1
         AND td.estado_registro = true
         AND u.estado_registro = true
     ) AS existe`,
    [idUsuarioTecnico]
  );
  if (!fila?.existe) {
    throw new ErrorDominio("El técnico seleccionado no está activo.", 422);
  }
}
