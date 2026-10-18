import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";

/**
 * Gestión de la CMDB para el Gestor de Activos y Configuración: actualizaciones
 * desde cambios, calidad/auditoría, líneas base e inexactitudes reportadas.
 */

export async function listarActualizaciones() {
  const actualizaciones = await query(
    `SELECT u.id_actualizacion, u.tipo_operacion, u.detalle, u.estado, u.fecha_creacion, u.fecha_aplicacion,
            c.codigo_cambio, c.titulo AS cambio_titulo,
            ci.codigo_ci, ci.nombre AS ci_nombre
     FROM cmdb_actualizacion u
     LEFT JOIN cambio c ON c.id_cambio = u.id_cambio
     LEFT JOIN elemento_configuracion ci ON ci.id_ci = u.id_ci
     WHERE u.estado_registro = true
     ORDER BY (u.estado = 'PENDIENTE') DESC, u.fecha_creacion DESC`
  );
  const pendientes = actualizaciones.filter((a: any) => a.estado === "PENDIENTE").length;
  return { actualizaciones, pendientes };
}

export async function generarDesdeCambios(idUsuario: number) {
  const cambios = await query<{ id_cambio: number; id_ci_afectado: number }>(
    `SELECT c.id_cambio, c.id_ci_afectado
     FROM cambio c
     WHERE c.estado_registro = true AND c.id_estado = 6 AND c.id_ci_afectado IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM cmdb_actualizacion u WHERE u.id_cambio = c.id_cambio AND u.estado_registro = true
       )`
  );
  let creadas = 0;
  for (const c of cambios) {
    await query(
      `INSERT INTO cmdb_actualizacion (id_cambio, id_ci, tipo_operacion, detalle, estado, id_usuario_aplica)
       VALUES ($1, $2, 'MODIFICACION', 'Actualización pendiente generada desde RFC cerrada', 'PENDIENTE', $3)`,
      [c.id_cambio, c.id_ci_afectado, idUsuario]
    );
    creadas++;
  }
  return { mensaje: creadas > 0 ? `Se generaron ${creadas} actualizaciones desde cambios cerrados.` : "No hay cambios cerrados pendientes de reflejar en la CMDB.", creadas };
}

export async function resolverActualizacion(idUsuario: number, body: any) {
  const idActualizacion = Number(body.id_actualizacion);
  if (!idActualizacion) throw new ErrorDominio("Falta el identificador de la actualización.");
  const decision = String(body.decision || "").toUpperCase();
  if (!["APLICAR", "DESCARTAR"].includes(decision)) throw new ErrorDominio("La decisión debe ser APLICAR o DESCARTAR.");

  const estado = decision === "APLICAR" ? "APLICADO" : "DESCARTADO";
  const fila = await queryRow<any>(
    `UPDATE cmdb_actualizacion
     SET estado = $1, fecha_aplicacion = CASE WHEN $1 = 'APLICADO' THEN now() ELSE fecha_aplicacion END,
         id_usuario_aplica = $2
     WHERE id_actualizacion = $3 AND estado = 'PENDIENTE' AND estado_registro = true
     RETURNING id_actualizacion, estado`,
    [estado, idUsuario, idActualizacion]
  );
  if (!fila) throw new ErrorDominio("La actualización no existe o ya fue procesada.", 409);
  return { mensaje: `Actualización ${estado.toLowerCase()}.`, actualizacion: fila };
}

export async function listarAuditoriaCmdb() {
  const resumen = await queryRow<any>(
    `SELECT
       COUNT(*)::int AS total_ci,
       COUNT(*) FILTER (WHERE ip_principal IS NULL)::int AS sin_ip,
       COUNT(*) FILTER (WHERE version_software IS NULL)::int AS sin_version,
       COUNT(*) FILTER (WHERE id_departamento_soporte IS NULL)::int AS sin_departamento,
       COUNT(*) FILTER (WHERE criticidad = 'CRITICA')::int AS criticos,
       COUNT(*) FILTER (WHERE id_activo IS NULL)::int AS sin_activo
     FROM elemento_configuracion WHERE estado_registro = true`
  );

  const sinRelaciones = await query(
    `SELECT ci.id_ci, ci.codigo_ci, ci.nombre, ci.tipo_ci, ci.ambiente
     FROM elemento_configuracion ci
     WHERE ci.estado_registro = true
       AND NOT EXISTS (SELECT 1 FROM ci_relacion r WHERE r.id_ci_padre = ci.id_ci OR r.id_ci_hijo = ci.id_ci)
     ORDER BY ci.codigo_ci LIMIT 20`
  );

  const inexactitudesAbiertas = await query(
    `SELECT i.id_inexactitud, i.descripcion, i.estado, i.fecha_creacion,
            ci.codigo_ci, ci.nombre AS ci_nombre,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS reporta_nombre
     FROM cmdb_inexactitud i
     LEFT JOIN elemento_configuracion ci ON ci.id_ci = i.id_ci
     LEFT JOIN usuario u ON u.id_usuario = i.id_usuario_reporta
     WHERE i.estado_registro = true AND i.estado <> 'RESUELTA'
     ORDER BY i.fecha_creacion DESC LIMIT 20`
  );

  const total = resumen?.total_ci ?? 0;
  const completos = total - ((resumen?.sin_ip ?? 0) + (resumen?.sin_version ?? 0));
  return {
    resumen: {
      total_ci: total,
      sin_ip: resumen?.sin_ip ?? 0,
      sin_version: resumen?.sin_version ?? 0,
      sin_departamento: resumen?.sin_departamento ?? 0,
      sin_activo: resumen?.sin_activo ?? 0,
      criticos: resumen?.criticos ?? 0,
      exactitud: total > 0 ? Math.round((Math.max(completos, 0) / total) * 100) : null,
    },
    sinRelaciones,
    inexactitudesAbiertas,
  };
}

export async function listarLineasBase() {
  return query(
    `SELECT l.id_linea_base, l.nombre, l.descripcion, l.total_elementos, l.fecha_creacion,
            ci.codigo_ci, ci.nombre AS ci_nombre,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS creador_nombre
     FROM cmdb_linea_base l
     LEFT JOIN elemento_configuracion ci ON ci.id_ci = l.id_ci
     LEFT JOIN usuario u ON u.id_usuario = l.id_usuario_creacion
     WHERE l.estado_registro = true
     ORDER BY l.fecha_creacion DESC`
  );
}

export async function crearLineaBase(idUsuario: number, body: any) {
  const vNombre = validarTexto(body.nombre, 3, 200, "El nombre de la línea base", true);
  if (!vNombre.valido) throw new ErrorDominio(vNombre.mensaje!);

  const idCi = body.id_ci ? Number(body.id_ci) : null;
  let snapshot: any[];
  if (idCi) {
    snapshot = await query(
      `SELECT id_ci, codigo_ci, nombre, tipo_ci, ambiente, ip_principal, version_software, criticidad
       FROM elemento_configuracion WHERE id_ci = $1 AND estado_registro = true`,
      [idCi]
    );
    if (snapshot.length === 0) throw new ErrorDominio("El CI no existe.", 404);
  } else {
    snapshot = await query(
      `SELECT id_ci, codigo_ci, nombre, tipo_ci, ambiente, ip_principal, version_software, criticidad
       FROM elemento_configuracion WHERE estado_registro = true ORDER BY codigo_ci`
    );
  }

  const fila = await queryRow<any>(
    `INSERT INTO cmdb_linea_base (nombre, descripcion, id_ci, snapshot, total_elementos, id_usuario_creacion)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_linea_base, nombre, total_elementos, fecha_creacion`,
    [String(body.nombre).trim(), body.descripcion ?? null, idCi, JSON.stringify(snapshot), snapshot.length, idUsuario]
  );
  return { mensaje: `Línea base creada con ${snapshot.length} elementos.`, linea_base: fila };
}

export async function listarInexactitudes() {
  const [inexactitudes, cis, usuarios] = await Promise.all([
    query(
      `SELECT i.id_inexactitud, i.descripcion, i.estado, i.fecha_creacion, i.fecha_resolucion,
              ci.codigo_ci, ci.nombre AS ci_nombre,
              CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS reporta_nombre,
              CONCAT(ua.nombres, ' ', ua.apellido_paterno) AS asigna_nombre
       FROM cmdb_inexactitud i
       LEFT JOIN elemento_configuracion ci ON ci.id_ci = i.id_ci
       LEFT JOIN usuario ur ON ur.id_usuario = i.id_usuario_reporta
       LEFT JOIN usuario ua ON ua.id_usuario = i.id_usuario_asigna
       WHERE i.estado_registro = true
       ORDER BY (i.estado <> 'RESUELTA') DESC, i.fecha_creacion DESC`
    ),
    query(`SELECT id_ci, codigo_ci, nombre FROM elemento_configuracion WHERE estado_registro = true ORDER BY codigo_ci`),
    query(`SELECT id_usuario, CONCAT(nombres, ' ', apellido_paterno) AS nombre FROM usuario WHERE estado_registro = true ORDER BY apellido_paterno`),
  ]);
  return { inexactitudes, cis, usuarios };
}

export async function crearInexactitud(idUsuario: number, body: any) {
  const idCi = Number(body.id_ci);
  if (!idCi) throw new ErrorDominio("Debes indicar el CI con inexactitud.");
  const vDesc = validarTexto(body.descripcion, 5, 2000, "La descripción de la inexactitud", true);
  if (!vDesc.valido) throw new ErrorDominio(vDesc.mensaje!);
  const ci = await queryRow<{ id_ci: number }>(
    `SELECT id_ci FROM elemento_configuracion WHERE id_ci = $1 AND estado_registro = true`,
    [idCi]
  );
  if (!ci) throw new ErrorDominio("El CI no existe.", 404);

  const fila = await queryRow<any>(
    `INSERT INTO cmdb_inexactitud (id_ci, descripcion, id_usuario_reporta, estado, id_usuario_asigna)
     VALUES ($1, $2, $3, 'REPORTADA', $4)
     RETURNING id_inexactitud, estado, fecha_creacion`,
    [idCi, String(body.descripcion).trim(), idUsuario, body.id_usuario_asigna ? Number(body.id_usuario_asigna) : null]
  );
  return { mensaje: "Inexactitud reportada.", inexactitud: fila };
}

export async function resolverInexactitud(idUsuario: number, body: any) {
  const idInexactitud = Number(body.id_inexactitud);
  if (!idInexactitud) throw new ErrorDominio("Falta el identificador de la inexactitud.");
  const estado = String(body.estado || "RESUELTA").toUpperCase();
  if (!["EN_PROCESO", "RESUELTA", "DESCARTADA"].includes(estado)) {
    throw new ErrorDominio("Estado de inexactitud no válido.");
  }
  const fila = await queryRow<any>(
    `UPDATE cmdb_inexactitud
     SET estado = $1, id_usuario_asigna = COALESCE(id_usuario_asigna, $2),
         fecha_resolucion = CASE WHEN $1 = 'RESUELTA' THEN now() ELSE fecha_resolucion END
     WHERE id_inexactitud = $3 AND estado_registro = true
     RETURNING id_inexactitud, estado`,
    [estado, idUsuario, idInexactitud]
  );
  if (!fila) throw new ErrorDominio("La inexactitud no existe.", 404);
  return { mensaje: "Inexactitud actualizada.", inexactitud: fila };
}
