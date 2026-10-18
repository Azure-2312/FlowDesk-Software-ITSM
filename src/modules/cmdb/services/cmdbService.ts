import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface FiltrosCmdb {
  tipo?: string | null;
  criticidad?: string | null;
  estado?: string | null; // "activos", "inactivos", "todos"
}

export async function listarCmdb(filtros: FiltrosCmdb) {
  const { tipo, criticidad, estado } = filtros;

  const condiciones: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (estado === "inactivos") {
    condiciones.push("ci.estado_registro = false");
  } else if (estado === "todos") {
    // Sin filtro de estado
  } else {
    // Por defecto: activos
    condiciones.push("ci.estado_registro = true");
  }

  if (tipo) {
    condiciones.push(`ci.tipo_ci = $${paramIdx++}`);
    params.push(tipo.toUpperCase());
  }

  if (criticidad) {
    condiciones.push(`ci.criticidad = $${paramIdx++}`);
    params.push(criticidad.toUpperCase());
  }

  const sql = `
    SELECT 
      ci.id_ci,
      ci.id_activo,
      a.codigo_patrimonial AS activo_codigo,
      ci.codigo_ci,
      ci.nombre,
      ci.tipo_ci,
      ci.ambiente,
      ci.ip_principal,
      ci.version_software,
      ci.criticidad,
      ci.id_departamento_soporte,
      dep.nombre AS departamento_soporte_nombre,
      ci.fecha_creacion,
      ci.estado_registro,
      ci.motivo_inactivacion,
      ci.fecha_inactivacion,
      ci.usuario_inactivacion,
      CONCAT(u_inact.nombres, ' ', u_inact.apellido_paterno) AS usuario_inactivacion_nombre
    FROM elemento_configuracion ci
    LEFT JOIN activo a ON ci.id_activo = a.id_activo
    LEFT JOIN departamento_ti dep ON ci.id_departamento_soporte = dep.id_departamento
    LEFT JOIN usuario u_inact ON ci.usuario_inactivacion = u_inact.id_usuario
    WHERE ${condiciones.length > 0 ? condiciones.join(" AND ") : "1=1"}
    ORDER BY ci.id_ci ASC
  `;

  const elementos = await query(sql, params);

  // Obtener relaciones para el mapa de dependencias
  const relacionesSql = `
    SELECT 
      cr.id_ci_padre,
      p.codigo_ci AS padre_codigo,
      p.nombre AS padre_nombre,
      cr.id_ci_hijo,
      h.codigo_ci AS hijo_codigo,
      h.nombre AS hijo_nombre,
      cr.tipo_relacion
    FROM ci_relacion cr
    JOIN elemento_configuracion p ON cr.id_ci_padre = p.id_ci
    JOIN elemento_configuracion h ON cr.id_ci_hijo = h.id_ci
  `;
  const relaciones = await query(relacionesSql);

  return { elementos, relaciones };
}

export async function crearCi(sesion: any, body: any) {
  const {
    codigo_ci,
    nombre,
    tipo_ci,
    ambiente,
    ip_principal,
    version_software,
    criticidad,
    id_activo,
    id_departamento_soporte,
    relacion, // opcional { id_ci_padre, tipo_relacion }
  } = body;

  if (!codigo_ci || !nombre || !tipo_ci || !ambiente || !criticidad) {
    throw new ErrorDominio("Código, nombre, tipo, ambiente y criticidad son obligatorios para el CI.");
  }

  const insertSql = `
    INSERT INTO elemento_configuracion (
      codigo_ci,
      nombre,
      tipo_ci,
      ambiente,
      ip_principal,
      version_software,
      criticidad,
      id_activo,
      id_departamento_soporte,
      usuario_creacion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id_ci, codigo_ci, nombre
  `;

  let ciRow: { id_ci: number; codigo_ci: string; nombre: string } | null;
  try {
    ciRow = await queryRow<{ id_ci: number; codigo_ci: string; nombre: string }>(insertSql, [
      codigo_ci.trim().toUpperCase(),
      nombre.trim(),
      tipo_ci.toUpperCase(),
      ambiente.toUpperCase(),
      ip_principal ? ip_principal.trim() : null,
      version_software ? version_software.trim() : null,
      criticidad.toUpperCase(),
      id_activo || null,
      id_departamento_soporte || 4,
      sesion.id_usuario,
    ]);
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ErrorDominio("Ya existe un Elemento de Configuración con ese código CI.");
    }
    throw error;
  }

  if (ciRow && relacion?.id_ci_padre) {
    await query(
      `INSERT INTO ci_relacion (id_ci_padre, id_ci_hijo, tipo_relacion)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [relacion.id_ci_padre, ciRow.id_ci, relacion.tipo_relacion || "DEPENDE_DE"]
    );
  }

  return { mensaje: "Elemento de Configuración (CI) registrado exitosamente.", ci: ciRow };
}

export async function actualizarCi(sesion: any, body: any) {
  const { id_ci } = body;

  if (!id_ci) {
    throw new ErrorDominio("ID de CI requerido");
  }

  const actual = await queryRow<any>("SELECT * FROM elemento_configuracion WHERE id_ci = $1", [id_ci]);
  if (!actual) {
    throw new ErrorDominio("CI no encontrado", 404);
  }

  let nuevoEstado = actual.estado_registro;
  let motivoInactivacion = actual.motivo_inactivacion;
  let fechaInactivacion = actual.fecha_inactivacion;
  let usuarioInactivacion = actual.usuario_inactivacion;

  if (body.estado_registro !== undefined) {
    nuevoEstado = Boolean(body.estado_registro);
    if (!nuevoEstado) {
      if (!body.motivo_inactivacion || typeof body.motivo_inactivacion !== "string" || body.motivo_inactivacion.trim().length < 5) {
        throw new ErrorDominio("Debe ingresar una justificación detallada (mínimo 5 caracteres) para dar de baja el CI.");
      }
      motivoInactivacion = body.motivo_inactivacion.trim();
      fechaInactivacion = new Date();
      usuarioInactivacion = sesion.id_usuario;
    } else {
      motivoInactivacion = null;
      fechaInactivacion = null;
      usuarioInactivacion = null;
    }
  }

  const codigo_ci = body.codigo_ci !== undefined ? body.codigo_ci.trim().toUpperCase() : actual.codigo_ci;
  const nombre = body.nombre !== undefined ? body.nombre.trim() : actual.nombre;
  const tipo_ci = body.tipo_ci !== undefined ? body.tipo_ci.toUpperCase() : actual.tipo_ci;
  const ambiente = body.ambiente !== undefined ? body.ambiente.toUpperCase() : actual.ambiente;
  const ip_principal = body.ip_principal !== undefined ? (body.ip_principal.trim() || null) : actual.ip_principal;
  const version_software = body.version_software !== undefined ? (body.version_software.trim() || null) : actual.version_software;
  const criticidad = body.criticidad !== undefined ? body.criticidad.toUpperCase() : actual.criticidad;
  const id_departamento_soporte = body.id_departamento_soporte !== undefined ? body.id_departamento_soporte : actual.id_departamento_soporte;

  let actualizado;
  try {
    actualizado = await queryRow(
      `UPDATE elemento_configuracion SET
        codigo_ci = $1,
        nombre = $2,
        tipo_ci = $3,
        ambiente = $4,
        ip_principal = $5,
        version_software = $6,
        criticidad = $7,
        id_departamento_soporte = $8,
        estado_registro = $9,
        motivo_inactivacion = $10,
        fecha_inactivacion = $11,
        usuario_inactivacion = $12
      WHERE id_ci = $13
      RETURNING *`,
      [
        codigo_ci,
        nombre,
        tipo_ci,
        ambiente,
        ip_principal,
        version_software,
        criticidad,
        id_departamento_soporte,
        nuevoEstado,
        motivoInactivacion,
        fechaInactivacion,
        usuarioInactivacion,
        id_ci,
      ]
    );
  } catch (err: any) {
    if (err?.code === "23505") {
      throw new ErrorDominio("Ya existe un CI con ese código.");
    }
    throw err;
  }

  return { mensaje: "Elemento de configuración actualizado exitosamente", ci: actualizado };
}
