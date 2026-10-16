import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";

/**
 * Cumplimiento y sobreuso de licencias (SAM) y catálogo de software autorizado
 * para el Gestor de Activos y Configuración.
 */

export async function listarCumplimiento() {
  const licencias = await query(
    `SELECT l.id_licencia, l.nombre_software, l.fabricante, l.tipo_licencia,
            l.cantidad_adquirida, l.cantidad_en_uso, l.fecha_vencimiento, l.costo_anual,
            (l.cantidad_en_uso - l.cantidad_adquirida) AS exceso,
            (l.cantidad_adquirida - l.cantidad_en_uso) AS disponibles,
            (l.fecha_vencimiento IS NOT NULL AND l.fecha_vencimiento < CURRENT_DATE) AS vencida,
            (SELECT COUNT(*)::int FROM licencia_asignacion a
             WHERE a.id_licencia = l.id_licencia AND a.fecha_devolucion IS NULL) AS asignadas_activas
     FROM licencia_software l
     WHERE l.estado_registro = true
     ORDER BY (l.cantidad_en_uso > l.cantidad_adquirida) DESC, l.nombre_software`
  );

  const resumen = await queryRow<any>(
    `SELECT
       COUNT(*)::int AS total_licencias,
       COALESCE(SUM(cantidad_adquirida), 0)::int AS total_adquiridas,
       COALESCE(SUM(cantidad_en_uso), 0)::int AS total_en_uso,
       COUNT(*) FILTER (WHERE cantidad_en_uso > cantidad_adquirida)::int AS en_sobreuso,
       COUNT(*) FILTER (WHERE fecha_vencimiento IS NOT NULL AND fecha_vencimiento < CURRENT_DATE)::int AS vencidas,
       COALESCE(SUM(costo_anual), 0)::numeric AS costo_anual
     FROM licencia_software WHERE estado_registro = true`
  );

  return { licencias, resumen };
}

export async function listarSoftware() {
  return query(
    `SELECT s.id_software, s.nombre, s.fabricante, s.version, s.categoria, s.licencia_requerida,
            s.estado, s.fecha_aprobacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS aprueba_nombre
     FROM software_autorizado s
     LEFT JOIN usuario u ON u.id_usuario = s.id_usuario_aprueba
     WHERE s.estado_registro = true
     ORDER BY s.estado, s.nombre`
  );
}

export async function crearSoftware(idUsuario: number, body: any) {
  const vNombre = validarTexto(body.nombre, 3, 200, "El nombre del software", true);
  if (!vNombre.valido) throw new ErrorDominio(vNombre.mensaje!);

  const existe = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM software_autorizado
       WHERE estado_registro = true AND lower(nombre) = lower($1) AND COALESCE(version, '') = COALESCE($2, '')
     ) AS existe`,
    [String(body.nombre).trim(), body.version ?? null]
  );
  if (existe?.existe) throw new ErrorDominio("Ese software y versión ya están en el catálogo.", 409);

  const fila = await queryRow<any>(
    `INSERT INTO software_autorizado (nombre, fabricante, version, categoria, licencia_requerida, estado, id_usuario_aprueba, fecha_aprobacion, usuario_creacion)
     VALUES ($1, $2, $3, $4, $5, 'AUTORIZADO', $6, now(), $6)
     RETURNING id_software, nombre, estado`,
    [
      String(body.nombre).trim(), body.fabricante ?? null, body.version ?? null, body.categoria ?? null,
      Boolean(body.licencia_requerida), idUsuario,
    ]
  );
  return { mensaje: "Software agregado al catálogo autorizado.", software: fila };
}

export async function cambiarEstadoSoftware(idSoftware: number, estado: string) {
  const normalizado = String(estado || "").toUpperCase();
  if (!["AUTORIZADO", "RESTRINGIDO", "PROHIBIDO", "OBSOLETO"].includes(normalizado)) {
    throw new ErrorDominio("Estado de software no válido.");
  }
  const fila = await queryRow<any>(
    `UPDATE software_autorizado SET estado = $1 WHERE id_software = $2 AND estado_registro = true
     RETURNING id_software, estado`,
    [normalizado, idSoftware]
  );
  if (!fila) throw new ErrorDominio("El software no existe.", 404);
  return { mensaje: "Estado del software actualizado.", software: fila };
}
