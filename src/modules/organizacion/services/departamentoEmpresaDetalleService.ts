import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function actualizarDepartamentoEmpresa(id: number, body: any) {
  const actual = await queryRow<any>(
    "SELECT * FROM departamento_empresa WHERE id_departamento_empresa=$1",
    [id]
  );
  if (!actual) throw new ErrorDominio("Departamento no encontrado.", 404);

  const activo = body.estado_registro === undefined ? actual.estado_registro : Boolean(body.estado_registro);
  if (!activo) {
    const asignados = await queryRow<{ total: number }>(
      "SELECT COUNT(*)::int AS total FROM usuario WHERE id_departamento_empresa=$1 AND estado_registro=true",
      [id]
    );
    if ((asignados?.total || 0) > 0) {
      throw new ErrorDominio("No se puede inactivar: aún hay usuarios activos asignados. Reasígnalos primero.", 409);
    }
  }

  try {
    const row = await queryRow(
      "UPDATE departamento_empresa SET codigo=$1,nombre=$2,descripcion=$3,estado_registro=$4 WHERE id_departamento_empresa=$5 RETURNING *",
      [
        String(body.codigo ?? actual.codigo).trim().toUpperCase(),
        String(body.nombre ?? actual.nombre).trim(),
        String(body.descripcion ?? actual.descripcion ?? "").trim() || null,
        activo,
        id,
      ]
    );
    return { departamento: row };
  } catch (e: any) {
    if (e.code === "23505") throw new ErrorDominio("El código o nombre ya existe.", 409);
    throw e;
  }
}
