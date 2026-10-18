import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarColaboradores(idUsuario: number) {
  const area = await queryRow<{ id_departamento_empresa: number; nombre: string }>(
    "SELECT u.id_departamento_empresa,d.nombre FROM usuario u JOIN departamento_empresa d ON d.id_departamento_empresa=u.id_departamento_empresa WHERE u.id_usuario=$1 AND d.estado_registro=true",
    [idUsuario]
  );
  if (!area) {
    throw new ErrorDominio("Tu usuario no tiene un departamento empresarial activo asignado.", 409);
  }

  const colaboradores = await query(
    `SELECT u.id_usuario,u.nombres,u.apellido_paterno,u.correo_electronico,COUNT(t.id_ticket) FILTER(WHERE et.es_terminal=false)::int AS tickets_abiertos FROM usuario u LEFT JOIN ticket t ON t.id_usuario_solicitante=u.id_usuario AND t.id_departamento_empresa=$1 AND t.estado_registro=true LEFT JOIN estado_ticket et ON et.id_estado=t.id_estado WHERE u.id_departamento_empresa=$1 AND u.estado_registro=true AND u.id_usuario<>$2 GROUP BY u.id_usuario ORDER BY u.apellido_paterno,u.nombres`,
    [area.id_departamento_empresa, idUsuario]
  );

  return { departamento: area.nombre, colaboradores };
}
