import { query } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function crearRelacionCmdb(body: any) {
  const { id_ci_padre, id_ci_hijo, tipo_relacion } = body;

  if (!id_ci_padre || !id_ci_hijo || !tipo_relacion) {
    throw new ErrorDominio("id_ci_padre, id_ci_hijo y tipo_relacion son requeridos");
  }

  if (id_ci_padre === id_ci_hijo) {
    throw new ErrorDominio("Un Elemento de Configuración no puede relacionarse consigo mismo");
  }

  await query(
    `INSERT INTO ci_relacion (id_ci_padre, id_ci_hijo, tipo_relacion)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_ci_padre, id_ci_hijo) DO UPDATE SET tipo_relacion = EXCLUDED.tipo_relacion`,
    [Number(id_ci_padre), Number(id_ci_hijo), tipo_relacion]
  );

  return { mensaje: "Relación de topología creada/actualizada exitosamente" };
}

export async function eliminarRelacionCmdb(idPadre: string | null, idHijo: string | null) {
  if (!idPadre || !idHijo) {
    throw new ErrorDominio("id_ci_padre e id_ci_hijo son requeridos para eliminar relación");
  }

  await query(
    `DELETE FROM ci_relacion WHERE id_ci_padre = $1 AND id_ci_hijo = $2`,
    [Number(idPadre), Number(idHijo)]
  );

  return { mensaje: "Relación de dependencia eliminada exitosamente" };
}
