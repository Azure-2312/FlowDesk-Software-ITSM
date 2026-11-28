import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Acciones del Supervisor (perfil 4) sobre cambios cuya lógica es de dominio y
 * no depende de su área: aprobación técnica y reprogramación de la ventana.
 * Movidas desde src/modules/perfiles/supervisor para que el rol solo conserve
 * su UI y su alcance (consultas filtradas por departamento).
 */

/**
 * Concepto técnico del Supervisor sobre una RFC en evaluación. Queda registrado
 * en la RFC para que lo vea el CAB, pero NO la aprueba ni la rechaza: eso lo
 * decide la votación del CAB (o el ECAB en emergencias). Solo sobre RFC de
 * técnicos de sus grupos; el Administrador, sobre cualquiera.
 */
export async function resolverAprobacionTecnica(
  idUsuario: number,
  idCambio: number,
  decision: string,
  comentario?: string,
  esAdministrador = false
) {
  // La pantalla envía APROBADO u OBSERVADO; se aceptan ambos vocabularios.
  const d = String(decision || "").toUpperCase();
  const normalizada = ["APROBAR", "APROBADO"].includes(d) ? "APROBAR"
    : ["RECHAZAR", "RECHAZADO", "OBSERVADO"].includes(d) ? "RECHAZAR" : "";
  if (!normalizada) {
    throw new ErrorDominio("La decisión debe ser APROBAR u OBSERVAR.");
  }
  const texto = String(comentario ?? "").trim();
  if (normalizada === "RECHAZAR" && texto.length < 5) {
    throw new ErrorDominio("Indica por qué no recomiendas el cambio (mínimo 5 caracteres).");
  }
  const fila = await queryRow<any>(
    `UPDATE cambio c
     SET campos_adicionales = COALESCE(c.campos_adicionales, '{}'::jsonb) ||
           jsonb_build_object('aprobacion_tecnica', jsonb_build_object(
             'decision', $2::text, 'comentario', $3::text, 'fecha', now(), 'usuario', $4::int)),
         usuario_modificacion = $4, fecha_modificacion = now()
     WHERE c.id_cambio = $1 AND c.id_estado = 2 AND c.estado_registro = true
       AND ($5::boolean OR c.id_usuario_solicitante IN (
             SELECT u.id_usuario FROM usuario u
              WHERE u.id_departamento IN (SELECT d.id_departamento FROM departamento_ti d
                                           WHERE d.id_supervisor = $4 AND d.estado_registro = true)))
     RETURNING c.id_cambio, c.codigo_cambio, c.id_estado`,
    [idCambio, normalizada, texto || null, idUsuario, esAdministrador]
  );
  if (!fila) {
    throw new ErrorDominio("La RFC no existe, ya no está en evaluación o no es de tus grupos.", 404);
  }
  return {
    mensaje: `Concepto técnico registrado (${normalizada === "APROBAR" ? "recomienda" : "no recomienda"} el cambio). La decisión final es del CAB.`,
    cambio: fila,
  };
}

export async function reprogramarCambio(
  idUsuario: number,
  idCambio: number,
  ventanaInicio: string,
  ventanaFin: string
) {
  const inicio = new Date(ventanaInicio).getTime();
  const fin = new Date(ventanaFin).getTime();
  if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio) {
    throw new ErrorDominio("La ventana debe tener fechas válidas y el fin posterior al inicio.");
  }
  if (inicio < Date.now()) {
    throw new ErrorDominio("La nueva ventana no puede empezar en el pasado.");
  }
  // Mismas reglas que al registrar la RFC: sin choques en el mismo CI
  const choque = await queryRow<{ codigo_cambio: string }>(
    `SELECT o.codigo_cambio
       FROM cambio c JOIN cambio o ON o.id_ci_afectado = c.id_ci_afectado AND o.id_cambio <> c.id_cambio
      WHERE c.id_cambio = $1 AND o.estado_registro = true AND o.id_estado IN (3, 4, 5)
        AND o.ventana_inicio < $3 AND o.ventana_fin > $2
      LIMIT 1`,
    [idCambio, ventanaInicio, ventanaFin]
  );
  if (choque) {
    throw new ErrorDominio(`La nueva ventana choca con ${choque.codigo_cambio} sobre el mismo elemento de configuración.`, 409);
  }
  const fila = await queryRow<any>(
    `UPDATE cambio
     SET ventana_inicio = $2, ventana_fin = $3,
         usuario_modificacion = $4, fecha_modificacion = now()
     WHERE id_cambio = $1 AND id_estado IN (3, 4)
     RETURNING id_cambio, codigo_cambio, ventana_inicio, ventana_fin`,
    [idCambio, ventanaInicio, ventanaFin, idUsuario]
  );
  if (!fila) throw new ErrorDominio("El cambio no existe o no admite reprogramación.", 404);
  return { mensaje: "Ventana de cambio actualizada.", cambio: fila };
}
