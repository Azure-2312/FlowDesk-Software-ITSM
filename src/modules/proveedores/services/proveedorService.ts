import { randomUUID } from "crypto";
import { query } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

const CAMPOS_LISTADO =
  "id_proveedor,codigo_proveedor,nombre,tipo_servicio,contacto_nombre,contacto_correo," +
  "contacto_telefono,numero_contrato,fecha_inicio,fecha_vencimiento,servicio_soportado," +
  "compromiso_sla,evaluacion_desempeno,estado,observaciones,fecha_creacion";

export const ESTADOS_PROVEEDOR = ["ACTIVO", "EN_REVISION", "VENCIDO", "INACTIVO"] as const;

export interface DatosProveedor {
  nombre?: unknown;
  tipo_servicio?: unknown;
  contacto_nombre?: unknown;
  contacto_correo?: unknown;
  contacto_telefono?: unknown;
  numero_contrato?: unknown;
  fecha_inicio?: unknown;
  fecha_vencimiento?: unknown;
  servicio_soportado?: unknown;
  compromiso_sla?: unknown;
  evaluacion_desempeno?: unknown;
  estado?: unknown;
  observaciones?: unknown;
}

/** Lista proveedores; el Gestor de Activos puede incluir los inactivos. */
export async function listarProveedores(incluirInactivos: boolean) {
  const where = incluirInactivos ? "" : "WHERE estado_registro=true";
  return query(
    `SELECT ${CAMPOS_LISTADO} FROM proveedor_ti ${where} ORDER BY fecha_vencimiento NULLS LAST,nombre`
  );
}

function textoOpcional(valor: unknown): string | null {
  const texto = String(valor ?? "").trim();
  return texto || null;
}

export async function crearProveedor(datos: DatosProveedor, idUsuario: number) {
  const nombre = String(datos.nombre || "").trim();
  const tipo = String(datos.tipo_servicio || "").trim();
  if (!nombre || !tipo) {
    throw new ErrorDominio("Proveedor y tipo de servicio son obligatorios");
  }

  const evaluacion =
    datos.evaluacion_desempeno === "" || datos.evaluacion_desempeno == null
      ? null
      : Number(datos.evaluacion_desempeno);
  if (evaluacion !== null && (!Number.isInteger(evaluacion) || evaluacion < 1 || evaluacion > 5)) {
    throw new ErrorDominio("La evaluación debe ser de 1 a 5");
  }

  const codigo = `PRV-${randomUUID().slice(0, 8).toUpperCase()}`;
  const values = [
    codigo,
    nombre,
    tipo,
    textoOpcional(datos.contacto_nombre),
    textoOpcional(datos.contacto_correo),
    textoOpcional(datos.contacto_telefono),
    textoOpcional(datos.numero_contrato),
    datos.fecha_inicio || null,
    datos.fecha_vencimiento || null,
    textoOpcional(datos.servicio_soportado),
    textoOpcional(datos.compromiso_sla),
    evaluacion,
    String(datos.estado || "ACTIVO").toUpperCase(),
    textoOpcional(datos.observaciones),
    idUsuario,
  ];

  const rows = await query(
    `INSERT INTO proveedor_ti(codigo_proveedor,nombre,tipo_servicio,contacto_nombre,contacto_correo,
       contacto_telefono,numero_contrato,fecha_inicio,fecha_vencimiento,servicio_soportado,
       compromiso_sla,evaluacion_desempeno,estado,observaciones,usuario_creacion)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING id_proveedor,codigo_proveedor,nombre,tipo_servicio,numero_contrato,fecha_vencimiento,estado`,
    values
  );
  return rows[0];
}

export async function actualizarProveedor(
  id: number,
  datos: { estado?: unknown; observaciones?: unknown },
  idUsuario: number
) {
  const estado = String(datos.estado || "ACTIVO").toUpperCase();
  if (!(ESTADOS_PROVEEDOR as readonly string[]).includes(estado)) {
    throw new ErrorDominio("Estado no válido");
  }

  const rows = await query(
    `UPDATE proveedor_ti
     SET estado=$2,
         observaciones=COALESCE($3,observaciones),
         usuario_modificacion=$4,
         fecha_modificacion=now(),
         estado_registro=($2<>'INACTIVO')
     WHERE id_proveedor=$1
     RETURNING id_proveedor,codigo_proveedor,nombre,estado,observaciones`,
    [id, estado, datos.observaciones === undefined ? null : String(datos.observaciones).trim(), idUsuario]
  );
  if (!rows.length) {
    throw new ErrorDominio("Proveedor no encontrado", 404);
  }
  return rows[0];
}
