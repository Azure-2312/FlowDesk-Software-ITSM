import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";

/**
 * Evidencias asociadas a los informes de auditoría: documentos, enlaces o
 * notas que sustentan los hallazgos registrados por el Auditor.
 */

async function verificarInforme(idInforme: number) {
  const informe = await queryRow<{ id_informe: number }>(
    `SELECT id_informe FROM informe_auditoria
     WHERE id_informe = $1 AND estado_registro = true`,
    [idInforme]
  );
  if (!informe) throw new ErrorDominio("El informe de auditoría no existe.", 404);
}

export async function listarEvidencias(idInforme: number) {
  const id = Number(idInforme);
  if (!id) throw new ErrorDominio("Debes indicar el informe de auditoría.");
  await verificarInforme(id);

  return query(
    `SELECT e.id_evidencia, e.id_informe, e.descripcion, e.contenido, e.creado_en,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS creador_nombre
     FROM informe_evidencia e
     LEFT JOIN usuario u ON u.id_usuario = e.creado_por
     WHERE e.id_informe = $1
     ORDER BY e.creado_en DESC`,
    [id]
  );
}

export async function agregarEvidencia(
  idInforme: number,
  descripcion: string,
  contenido: string | null,
  creadoPor: number
) {
  const id = Number(idInforme);
  if (!id) throw new ErrorDominio("Debes indicar el informe de auditoría.");
  await verificarInforme(id);

  const vDescripcion = validarTexto(descripcion, 5, 500, "La descripción de la evidencia", true);
  if (!vDescripcion.valido) throw new ErrorDominio(vDescripcion.mensaje!);

  const vContenido = validarTexto(contenido, 0, 8000, "El contenido de la evidencia", false);
  if (!vContenido.valido) throw new ErrorDominio(vContenido.mensaje!);

  const fila = await queryRow(
    `INSERT INTO informe_evidencia (id_informe, descripcion, contenido, creado_por)
     VALUES ($1, $2, $3, $4)
     RETURNING id_evidencia, id_informe, descripcion, contenido, creado_en`,
    [id, String(descripcion).trim(), contenido ? String(contenido).trim() : null, creadoPor]
  );

  return { mensaje: "Evidencia registrada.", evidencia: fila };
}
