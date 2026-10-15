import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { DepartamentoTI } from "@/types";
import { validarCodigo, validarTexto, validarNumeroPositivo } from "@/shared/lib/validaciones";

export async function listarDepartamentosTi(sesion: any) {
  const perfil = sesion.perfilActivo.id_perfil;
  const scope = perfil === 4
    ? "AND d.id_supervisor = $1"
    : perfil === 2
      ? "AND d.id_departamento = (SELECT td.id_departamento FROM tecnico_detalle td WHERE td.id_usuario = $1 AND td.estado_registro = true)"
      : "";
  const scopeParams = scope ? [sesion.id_usuario] : [];

  const departamentos = await query<DepartamentoTI>(`
      SELECT 
        d.id_departamento,
        d.codigo,
        d.nombre,
        d.descripcion,
        d.id_supervisor,
        CONCAT(u.nombres, ' ', u.apellido_paterno) as supervisor_nombre,
        u.correo_electronico as supervisor_correo,
        COUNT(t.id_tecnico_detalle)::int as cantidad_tecnicos,
        d.tiempo_ola_horas,
        d.tiempo_ola_critico_hrs,
        d.estado_registro
      FROM departamento_ti d
      LEFT JOIN usuario u ON u.id_usuario = d.id_supervisor
      LEFT JOIN tecnico_detalle t ON t.id_departamento = d.id_departamento AND t.estado_registro = true
      WHERE d.estado_registro = true ${scope}
      GROUP BY d.id_departamento, d.codigo, d.nombre, d.descripcion, d.id_supervisor, u.nombres, u.apellido_paterno, u.correo_electronico, d.tiempo_ola_horas, d.tiempo_ola_critico_hrs, d.estado_registro
      ORDER BY d.id_departamento ASC
    `, scopeParams);

  return { departamentos };
}

export async function crearDepartamentoTi(body: any) {
  const { codigo, nombre, descripcion, id_supervisor, tiempo_ola_horas, tiempo_ola_critico_hrs } = body;

  const vCod = validarCodigo(codigo, 2, 20, "El código del departamento");
  if (!vCod.valido) throw new ErrorDominio(vCod.mensaje!);

  const vNom = validarTexto(nombre, 3, 100, "El nombre del departamento", true);
  if (!vNom.valido) throw new ErrorDominio(vNom.mensaje!);

  if (descripcion) {
    const vDesc = validarTexto(descripcion, 3, 500, "La descripción del departamento", false);
    if (!vDesc.valido) throw new ErrorDominio(vDesc.mensaje!);
  }

  if (tiempo_ola_horas !== undefined && tiempo_ola_horas !== null) {
    const vOla = validarNumeroPositivo(tiempo_ola_horas, "El tiempo OLA (horas)", 1, 720);
    if (!vOla.valido) throw new ErrorDominio(vOla.mensaje!);
  }

  if (tiempo_ola_critico_hrs !== undefined && tiempo_ola_critico_hrs !== null) {
    const vOlaCrit = validarNumeroPositivo(tiempo_ola_critico_hrs, "El tiempo OLA crítico (horas)", 1, 720);
    if (!vOlaCrit.valido) throw new ErrorDominio(vOlaCrit.mensaje!);
  }

  if (id_supervisor) {
    const supervisorValido = await queryRow<{ existe: boolean }>(
      `SELECT EXISTS (
           SELECT 1 FROM usuario u
           JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
           WHERE u.id_usuario = $1 AND u.estado_registro = true AND up.id_perfil = 4
         ) AS existe`,
      [id_supervisor]
    );
    if (!supervisorValido?.existe) {
      throw new ErrorDominio("El responsable debe ser un usuario activo con el perfil Supervisor.");
    }
  }

  const codigoFormateado = codigo.trim().toUpperCase();

  const existe = await queryRow(
    "SELECT id_departamento FROM departamento_ti WHERE codigo = $1",
    [codigoFormateado]
  );

  if (existe) {
    throw new ErrorDominio(`Ya existe un departamento con el código [${codigoFormateado}]`, 409);
  }

  const nuevo = await queryRow<DepartamentoTI>(
    `INSERT INTO departamento_ti (
        codigo, nombre, descripcion, id_supervisor, tiempo_ola_horas, tiempo_ola_critico_hrs, estado_registro
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *`,
    [
      codigoFormateado,
      nombre.trim(),
      descripcion?.trim() || null,
      id_supervisor || null,
      tiempo_ola_horas ? parseInt(tiempo_ola_horas, 10) : 8,
      tiempo_ola_critico_hrs ? parseInt(tiempo_ola_critico_hrs, 10) : 2,
    ]
  );

  return { httpStatus: 201, payload: { departamento: nuevo } };
}
