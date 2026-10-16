import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Autorizaciones que el Gestor de Área delega a los colaboradores de su
 * departamento empresarial (página "Colaboradores de mi área").
 */

export const TIPOS_AUTORIZACION = [
  "aprobar_solicitud",
  "registrar_ticket",
  "ver_reportes",
  "gestionar_activos",
] as const;

export type TipoAutorizacion = (typeof TIPOS_AUTORIZACION)[number];

/** Resuelve el departamento empresarial activo de un usuario. */
export async function resolverDepartamentoEmpresa(idUsuario: number) {
  return queryRow<{ id_departamento_empresa: number | null; nombre: string | null }>(
    `SELECT u.id_departamento_empresa, d.nombre
     FROM usuario u
     LEFT JOIN departamento_empresa d
       ON d.id_departamento_empresa = u.id_departamento_empresa AND d.estado_registro = true
     WHERE u.id_usuario = $1 AND u.estado_registro = true`,
    [idUsuario]
  );
}

export async function listarAutorizaciones(departamentoEmpresaId: number) {
  if (!departamentoEmpresaId) {
    throw new ErrorDominio("Tu usuario no tiene un departamento empresarial activo asignado.", 409);
  }

  const autorizaciones = await query(
    `SELECT ca.id_autorizacion, ca.id_usuario, ca.tipo, ca.activo, ca.creado_en,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS colaborador_nombre
     FROM colaborador_autorizacion ca
     JOIN usuario u ON u.id_usuario = ca.id_usuario
     WHERE u.id_departamento_empresa = $1 AND u.estado_registro = true
     ORDER BY u.apellido_paterno, u.nombres, ca.tipo`,
    [departamentoEmpresaId]
  );

  return { autorizaciones, tipos: TIPOS_AUTORIZACION };
}

export async function otorgarAutorizacion(
  idUsuario: number,
  tipo: string,
  otorgadoPor: number
) {
  const normalizado = String(tipo || "").trim().toLowerCase();
  if (!(TIPOS_AUTORIZACION as readonly string[]).includes(normalizado)) {
    throw new ErrorDominio(
      `Tipo de autorización no válido. Usa: ${TIPOS_AUTORIZACION.join(", ")}.`
    );
  }
  if (!idUsuario) throw new ErrorDominio("Debes indicar el colaborador.");
  if (idUsuario === otorgadoPor) {
    throw new ErrorDominio("No puedes otorgarte autorizaciones a ti mismo.", 409);
  }

  const area = await resolverDepartamentoEmpresa(otorgadoPor);
  if (!area?.id_departamento_empresa) {
    throw new ErrorDominio("Tu usuario no tiene un departamento empresarial activo asignado.", 409);
  }

  const objetivo = await resolverDepartamentoEmpresa(idUsuario);
  if (!objetivo) throw new ErrorDominio("El colaborador indicado no existe.", 404);
  if (objetivo.id_departamento_empresa !== area.id_departamento_empresa) {
    throw new ErrorDominio("Solo puedes autorizar a colaboradores de tu propio departamento.", 403);
  }

  const fila = await queryRow(
    `INSERT INTO colaborador_autorizacion (id_usuario, tipo, otorgado_por, activo)
     VALUES ($1, $2, $3, true)
     ON CONFLICT (id_usuario, tipo)
     DO UPDATE SET activo = true, otorgado_por = EXCLUDED.otorgado_por, creado_en = now()
     RETURNING id_autorizacion, id_usuario, tipo, activo, creado_en`,
    [idUsuario, normalizado, otorgadoPor]
  );

  return { mensaje: "Autorización otorgada.", autorizacion: fila };
}

export async function revocarAutorizacion(idAutorizacion: number, otorgadoPor?: number) {
  if (!idAutorizacion) throw new ErrorDominio("Falta el identificador de la autorización.");

  if (otorgadoPor) {
    const area = await resolverDepartamentoEmpresa(otorgadoPor);
    const pertenece = await queryRow<{ id_autorizacion: number }>(
      `SELECT ca.id_autorizacion
       FROM colaborador_autorizacion ca
       JOIN usuario u ON u.id_usuario = ca.id_usuario
       WHERE ca.id_autorizacion = $1 AND u.id_departamento_empresa = $2`,
      [idAutorizacion, area?.id_departamento_empresa ?? -1]
    );
    if (!pertenece) {
      throw new ErrorDominio("La autorización no existe o no pertenece a tu área.", 404);
    }
  }

  const fila = await queryRow(
    `UPDATE colaborador_autorizacion
     SET activo = false
     WHERE id_autorizacion = $1
     RETURNING id_autorizacion, id_usuario, tipo, activo, creado_en`,
    [idAutorizacion]
  );
  if (!fila) throw new ErrorDominio("La autorización no existe.", 404);

  return { mensaje: "Autorización revocada.", autorizacion: fila };
}
