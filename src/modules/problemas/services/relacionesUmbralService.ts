import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Reglas de detección de candidatos a problema (Gestión de Problemas proactiva).
 * Una regla NO crea problemas: cuando un servicio, categoría, CI o código de
 * resolución acumula incidentes por encima del umbral, el grupo aparece en
 * Gestión de Problemas → Candidatos y el Gestor decide si lo convierte en problema.
 */

export const DIMENSIONES_UMBRAL = ["servicio", "categoria", "ci", "resolucion"] as const;
const PRIORIDADES = ["P1", "P2", "P3", "P4"];

interface DatosRegla {
  nombre: string;
  descripcion: string;
  agrupar_por: string;
  umbral_incidentes: number;
  ventana_horas: number;
  prioridad_minima: string;
  activa: boolean;
}

function entero(valor: unknown, min: number, max: number, campo: string): number {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ErrorDominio(`${campo} debe ser un número entero entre ${min} y ${max}.`);
  }
  return n;
}

function validarRegla(regla: any, base?: Partial<DatosRegla>): DatosRegla {
  const nombre = String(regla?.nombre ?? base?.nombre ?? "").trim();
  if (nombre.length < 3) throw new ErrorDominio("El nombre de la regla debe tener al menos 3 caracteres.");
  const agrupar = String(regla?.agrupar_por ?? base?.agrupar_por ?? "servicio");
  if (!(DIMENSIONES_UMBRAL as readonly string[]).includes(agrupar)) {
    throw new ErrorDominio("El criterio de agrupación no es válido.");
  }
  const prioridad = String(regla?.prioridad_minima ?? base?.prioridad_minima ?? "P4").toUpperCase();
  if (!PRIORIDADES.includes(prioridad)) throw new ErrorDominio("La prioridad mínima no es válida.");
  return {
    nombre: nombre.substring(0, 150),
    descripcion: String(regla?.descripcion ?? base?.descripcion ?? "").trim(),
    agrupar_por: agrupar,
    umbral_incidentes: entero(regla?.umbral_incidentes ?? base?.umbral_incidentes ?? 3, 1, 100, "El umbral de incidentes"),
    ventana_horas: entero(regla?.ventana_horas ?? base?.ventana_horas ?? 24, 1, 720, "La ventana de evaluación (horas)"),
    prioridad_minima: prioridad,
    activa: Boolean(regla?.activa ?? base?.activa ?? false),
  };
}

export async function listarReglasUmbral() {
  const reglas = await query<any>(
    `SELECT r.* FROM problema_regla_umbral r ORDER BY r.orden ASC, r.id_regla ASC`
  );
  return { ok: true, reglas };
}

export async function crearReglaUmbral(regla: any) {
  const d = validarRegla(regla);
  const orden = await queryRow<{ n: number }>(`SELECT COALESCE(MAX(orden), 0) + 1 AS n FROM problema_regla_umbral`);
  const nueva = await queryRow<any>(
    `INSERT INTO problema_regla_umbral
       (nombre, descripcion, orden, activa, prioridad_minima, agrupar_por, umbral_incidentes, ventana_horas)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [d.nombre, d.descripcion, orden?.n ?? 1, d.activa, d.prioridad_minima, d.agrupar_por, d.umbral_incidentes, d.ventana_horas]
  );
  return { ok: true, regla: nueva };
}

export async function duplicarReglaUmbral(regla: any) {
  const id = Number(regla?.id_regla);
  if (!id) throw new ErrorDominio("ID de regla requerido");
  const orig = await queryRow<any>("SELECT * FROM problema_regla_umbral WHERE id_regla = $1", [id]);
  if (!orig) throw new ErrorDominio("Regla no encontrada", 404);
  return crearReglaUmbral({ ...orig, nombre: `${orig.nombre} (Copia)`.substring(0, 150), activa: false });
}

export async function actualizarReglaUmbral(body: any) {
  const id = Number(body?.id_regla);
  if (!id) throw new ErrorDominio("ID de regla requerido");
  const actual = await queryRow<any>("SELECT * FROM problema_regla_umbral WHERE id_regla = $1", [id]);
  if (!actual) throw new ErrorDominio("Regla no encontrada", 404);

  const d = validarRegla(body, actual);
  const actualizada = await queryRow<any>(
    `UPDATE problema_regla_umbral
     SET nombre = $1, descripcion = $2, agrupar_por = $3, umbral_incidentes = $4,
         ventana_horas = $5, prioridad_minima = $6, activa = $7
     WHERE id_regla = $8
     RETURNING *`,
    [d.nombre, d.descripcion, d.agrupar_por, d.umbral_incidentes, d.ventana_horas, d.prioridad_minima, d.activa, id]
  );
  return { ok: true, regla: actualizada };
}

export async function eliminarReglaUmbral(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorDominio("ID de regla inválido");
  await query("DELETE FROM problema_regla_umbral WHERE id_regla = $1", [n]);
  return { ok: true, mensaje: "Regla eliminada" };
}
