// Administración de credenciales de la API externa y consulta de su bitácora.
// Solo el Administrador usa estas funciones (lo valida el controlador).
import { query, queryRow, transaccion } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import {
  PERMISO_SOLICITANTES,
  generarClientId,
  generarClientSecret,
  hmacSecreto,
  apiConfigurada,
  registrarBitacora,
} from "@/shared/lib/seguridad-api-externa";

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-fA-F:]{2,45}$/;

export interface DatosNuevaCredencial {
  nombre_grupo?: unknown;
  contacto?: unknown;
  dias_vigencia?: unknown;
  limite_rpm?: unknown;
  ips_permitidas?: unknown;
}

function texto(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.trim().replace(/[<>]/g, "").substring(0, max) : "";
}

function leerIps(valor: unknown): string[] {
  const lista = Array.isArray(valor)
    ? valor
    : typeof valor === "string"
      ? valor.split(/[\s,;]+/)
      : [];
  const ips = lista.map((v) => String(v).trim()).filter(Boolean);
  const invalida = ips.find((ip) => !IPV4.test(ip) && !(ip.includes(":") && IPV6.test(ip)));
  if (invalida) throw new ErrorDominio(`La IP "${invalida.substring(0, 45)}" no es válida.`, 400);
  if (ips.length > 10) throw new ErrorDominio("Se permiten como máximo 10 IPs por credencial.", 400);
  return Array.from(new Set(ips));
}

function exigirApiConfigurada() {
  if (!apiConfigurada()) {
    throw new ErrorDominio(
      "Falta configurar la variable de entorno API_KEY_SALT (mínimo 32 caracteres) en el servidor.",
      503
    );
  }
}

export async function listarCredenciales() {
  return query<any>(
    `SELECT c.id_credencial, c.nombre_grupo, c.contacto, c.client_id, c.permisos, c.limite_rpm,
            c.estado, c.fecha_creacion, c.fecha_expiracion, c.fecha_rotacion, c.fecha_revocacion,
            c.ultimo_acceso, c.total_peticiones, c.ips_permitidas,
            (c.estado AND (c.fecha_expiracion IS NULL OR c.fecha_expiracion > now())) AS vigente,
            (SELECT COUNT(*)::int FROM api_token_acceso t
              WHERE t.id_credencial = c.id_credencial AND t.revocado = false AND t.fecha_expiracion > now()) AS tokens_activos,
            TRIM(CONCAT(u.nombres, ' ', u.apellido_paterno)) AS creado_por
       FROM api_credenciales_externas c
       LEFT JOIN usuario u ON u.id_usuario = c.id_usuario_creacion
      WHERE c.client_id IS NOT NULL
      ORDER BY c.estado DESC, c.fecha_creacion DESC`
  );
}

export async function crearCredencial(datos: DatosNuevaCredencial, idUsuario: number, ip: string) {
  exigirApiConfigurada();
  const inicio = Date.now();
  const nombre = texto(datos.nombre_grupo, 100);
  if (nombre.length < 3) throw new ErrorDominio("Indique el nombre del equipo o sistema (mínimo 3 caracteres).", 400);
  const contacto = texto(datos.contacto, 100) || null;
  const dias = Number(datos.dias_vigencia ?? 30);
  if (!Number.isInteger(dias) || dias < 1 || dias > 180)
    throw new ErrorDominio("La vigencia debe estar entre 1 y 180 días.", 400);
  const limite = Number(datos.limite_rpm ?? 60);
  if (!Number.isInteger(limite) || limite < 5 || limite > 600)
    throw new ErrorDominio("El límite por minuto debe estar entre 5 y 600.", 400);
  const ips = leerIps(datos.ips_permitidas);

  const clientId = generarClientId();
  const secreto = generarClientSecret();
  const fila = await queryRow<{ id_credencial: number; fecha_expiracion: string }>(
    `INSERT INTO api_credenciales_externas
       (nombre_grupo, contacto, client_id, api_key_prefijo, api_key_hash, permisos, limite_rpm, estado,
        fecha_expiracion, ips_permitidas, id_usuario_creacion)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, true, now() + ($8 || ' days')::interval, $9, $10)
     RETURNING id_credencial, fecha_expiracion`,
    [
      nombre,
      contacto,
      clientId,
      clientId.substring(0, 12),
      hmacSecreto(secreto),
      JSON.stringify([PERMISO_SOLICITANTES]),
      limite,
      String(dias),
      ips.length ? ips : null,
      idUsuario,
    ]
  );
  await registrarBitacora({
    direccion: "ADMIN",
    idCredencial: fila!.id_credencial,
    grupo: nombre,
    idUsuario,
    metodo: "POST",
    ruta: "admin/credenciales",
    codigo: 201,
    ip,
    inicio,
    detalle: `Credencial emitida · vigencia ${dias} días`,
  });
  return {
    id_credencial: fila!.id_credencial,
    client_id: clientId,
    client_secret: secreto,
    fecha_expiracion: fila!.fecha_expiracion,
  };
}

async function obtenerActiva(id: number) {
  const cred = await queryRow<any>(
    `SELECT id_credencial, nombre_grupo, estado, client_id FROM api_credenciales_externas
      WHERE id_credencial = $1 AND client_id IS NOT NULL`,
    [id]
  );
  if (!cred) throw new ErrorDominio("La credencial no existe.", 404);
  if (!cred.estado) throw new ErrorDominio("La credencial ya está revocada.", 409);
  return cred;
}

export async function revocarCredencial(id: number, idUsuario: number, ip: string) {
  const inicio = Date.now();
  const cred = await obtenerActiva(id);
  await transaccion(async (cli) => {
    await cli.query(
      `UPDATE api_credenciales_externas
          SET estado = false, fecha_revocacion = now(), id_usuario_revocacion = $2
        WHERE id_credencial = $1`,
      [id, idUsuario]
    );
    await cli.query(`UPDATE api_token_acceso SET revocado = true WHERE id_credencial = $1 AND revocado = false`, [id]);
  });
  await registrarBitacora({
    direccion: "ADMIN", idCredencial: id, grupo: cred.nombre_grupo, idUsuario,
    metodo: "PATCH", ruta: "admin/credenciales", codigo: 200, ip, inicio,
    detalle: "Credencial revocada y tokens anulados",
  });
}

export async function rotarSecreto(id: number, idUsuario: number, ip: string) {
  exigirApiConfigurada();
  const inicio = Date.now();
  const cred = await obtenerActiva(id);
  const secreto = generarClientSecret();
  await transaccion(async (cli) => {
    await cli.query(
      `UPDATE api_credenciales_externas SET api_key_hash = $2, fecha_rotacion = now() WHERE id_credencial = $1`,
      [id, hmacSecreto(secreto)]
    );
    await cli.query(`UPDATE api_token_acceso SET revocado = true WHERE id_credencial = $1 AND revocado = false`, [id]);
  });
  await registrarBitacora({
    direccion: "ADMIN", idCredencial: id, grupo: cred.nombre_grupo, idUsuario,
    metodo: "PATCH", ruta: "admin/credenciales", codigo: 200, ip, inicio,
    detalle: "Secreto rotado y tokens anulados",
  });
  return { client_id: cred.client_id, client_secret: secreto };
}

export async function listarBitacora(filtros: { direccion?: string | null; resultado?: string | null }) {
  const cond: string[] = [];
  const params: unknown[] = [];
  if (filtros.direccion && ["ENTRANTE", "SALIENTE", "ADMIN"].includes(filtros.direccion)) {
    params.push(filtros.direccion);
    cond.push(`l.direccion = $${params.length}`);
  }
  if (filtros.resultado === "exito") cond.push("l.codigo_estado < 400");
  if (filtros.resultado === "error") cond.push("l.codigo_estado >= 400");
  const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";

  const [registros, resumen] = await Promise.all([
    query<any>(
      `SELECT l.id_log, l.direccion, l.grupo_identificado, l.metodo, l.ruta, l.codigo_estado, l.ip_origen,
              l.tiempo_respuesta_ms, l.mensaje_error, l.detalle, l.fecha_registro,
              TRIM(CONCAT(u.nombres, ' ', u.apellido_paterno)) AS usuario
         FROM api_log_auditoria l
         LEFT JOIN usuario u ON u.id_usuario = l.id_usuario
         ${where}
        ORDER BY l.fecha_registro DESC
        LIMIT 300`,
      params
    ),
    queryRow<any>(
      `SELECT COUNT(*) FILTER (WHERE codigo_estado < 400)::int                       AS exitosas,
              COUNT(*) FILTER (WHERE codigo_estado IN (401, 403))::int               AS rechazadas,
              COUNT(*) FILTER (WHERE codigo_estado = 429)::int                       AS bloqueadas,
              COUNT(*) FILTER (WHERE direccion = 'SALIENTE')::int                    AS extracciones
         FROM api_log_auditoria
        WHERE fecha_registro > now() - interval '24 hours'`
    ),
  ]);
  return { registros, resumen_24h: resumen };
}
