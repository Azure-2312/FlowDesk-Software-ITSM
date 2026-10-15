import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

const CONFIGURACION_RFC_DEFECTO = {
  perfiles_solicitantes: [2, 8],
  tipos_rfc: ["ESTANDAR", "NORMAL", "EMERGENCIA"],
  exige_ci: false,
  exige_plan_pruebas: false,
  permite_emergencia: true,
  campos_personalizados: [],
  exige_rollback: true,
  duracion_maxima_horas: 24,
};

export async function obtenerConfiguracionRfc() {
  const row = await queryRow(
    "SELECT perfiles_solicitantes,tipos_rfc,exige_ci,exige_plan_pruebas,permite_emergencia,campos_personalizados,exige_rollback,duracion_maxima_horas FROM configuracion_rfc WHERE id_configuracion=1"
  );
  return row || CONFIGURACION_RFC_DEFECTO;
}

export async function guardarConfiguracionRfc(sesion: any, body: any, ip: string) {
  const perfiles: number[] = Array.from(new Set<number>((Array.isArray(body.perfiles_solicitantes) ? body.perfiles_solicitantes : []).map((x: unknown) => Number(x))));
  const tipos = Array.from(new Set<string>((Array.isArray(body.tipos_rfc) ? body.tipos_rfc : []).map((x: unknown) => String(x).toUpperCase()))).filter(x => ["ESTANDAR", "NORMAL", "EMERGENCIA"].includes(x));
  if (!perfiles.length || perfiles.some(x => ![2, 8].includes(x))) throw new ErrorDominio("Solo se puede habilitar a Técnico y Gestor de Cambios como solicitantes de RFC");
  if (!tipos.length) throw new ErrorDominio("Selecciona al menos un tipo RFC válido.");
  const campos = Array.isArray(body.campos_personalizados) ? body.campos_personalizados : [];
  if (campos.length > 20 || campos.some((f: any) => !f || !/^[a-z][a-z0-9_]{1,49}$/.test(String(f.clave || "")) || !String(f.etiqueta || "").trim() || !["texto", "area", "numero", "fecha", "correo", "lista"].includes(f.tipo) || (f.tipo === "lista" && (!Array.isArray(f.opciones) || !f.opciones.length)))) throw new ErrorDominio("Revisa las claves, etiquetas, tipos y opciones de los campos RFC.");
  if (new Set(campos.map((f: any) => f.clave)).size !== campos.length) throw new ErrorDominio("Las claves de campos RFC deben ser únicas.");
  const duracion = Number(body.duracion_maxima_horas);
  if (!Number.isInteger(duracion) || duracion < 1 || duracion > 720) throw new ErrorDominio("La duración máxima debe estar entre 1 y 720 horas.");

  const row = await queryRow(`INSERT INTO configuracion_rfc(id_configuracion,perfiles_solicitantes,tipos_rfc,exige_ci,exige_plan_pruebas,permite_emergencia,campos_personalizados,exige_rollback,duracion_maxima_horas,usuario_modificacion,fecha_modificacion) VALUES(1,$1,$2,$3,$4,$5,$6,$7,$8,$9,now()) ON CONFLICT(id_configuracion) DO UPDATE SET perfiles_solicitantes=EXCLUDED.perfiles_solicitantes,tipos_rfc=EXCLUDED.tipos_rfc,exige_ci=EXCLUDED.exige_ci,exige_plan_pruebas=EXCLUDED.exige_plan_pruebas,permite_emergencia=EXCLUDED.permite_emergencia,campos_personalizados=EXCLUDED.campos_personalizados,exige_rollback=EXCLUDED.exige_rollback,duracion_maxima_horas=EXCLUDED.duracion_maxima_horas,usuario_modificacion=EXCLUDED.usuario_modificacion,fecha_modificacion=now() RETURNING perfiles_solicitantes,tipos_rfc,exige_ci,exige_plan_pruebas,permite_emergencia,campos_personalizados,exige_rollback,duracion_maxima_horas`, [perfiles, tipos, Boolean(body.exige_ci), Boolean(body.exige_plan_pruebas), Boolean(body.permite_emergencia), JSON.stringify(campos), Boolean(body.exige_rollback), duracion, sesion.id_usuario]);

  await query(
    `INSERT INTO log_auditoria_sistema (
      id_usuario, modulo, accion, descripcion, detalles, direccion_ip
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      sesion.id_usuario,
      "CAMBIOS",
      "ACTUALIZAR_CONFIGURACION_RFC",
      `El usuario ${sesion.nombres} actualizó las reglas del esquema RFC (Rollback obligatorio: ${Boolean(body.exige_rollback)}, CI obligatorio: ${Boolean(body.exige_ci)}, Ventana máx: ${duracion}h).`,
      JSON.stringify({ perfiles_solicitantes: perfiles, tipos_rfc: tipos, exige_rollback: Boolean(body.exige_rollback), exige_ci: Boolean(body.exige_ci), duracion_maxima_horas: duracion }),
      ip,
    ]
  );

  return row;
}
