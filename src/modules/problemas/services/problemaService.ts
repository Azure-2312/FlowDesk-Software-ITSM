import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface SesionProblema {
  idUsuario: number;
  idPerfil?: number;
}

const SELECT_PROBLEMA = `
    SELECT 
      p.id_problema,
      p.codigo_problema,
      p.titulo,
      p.descripcion,
      p.id_impacto,
      it.nombre AS impacto_nombre,
      p.id_urgencia,
      ut.nombre AS urgencia_nombre,
      p.id_prioridad,
      pt.nombre AS prioridad_nombre,
      p.id_estado,
      CASE p.id_estado
        WHEN 1 THEN 'Registrado'
        WHEN 2 THEN 'En Investigación'
        WHEN 3 THEN 'Causa Raíz Identificada'
        WHEN 4 THEN 'Error Conocido (KEDB)'
        WHEN 5 THEN 'Resuelto'
        WHEN 6 THEN 'Cerrado'
        ELSE 'Desconocido'
      END AS estado_nombre,
      p.causa_raiz,
      p.metodo_analisis,
      p.workaround,
      p.es_error_conocido,
      p.id_ci_afectado,
      ci.codigo_ci,
      ci.nombre AS ci_nombre,
      p.id_usuario_asignado,
      CONCAT(u.nombres, ' ', u.apellido_paterno) AS tecnico_asignado_nombre,
      p.id_departamento,
      dep.nombre AS departamento_nombre,
      p.solucion_definitiva,
      p.fecha_creacion,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id_ticket', t.id_ticket,
          'codigo_ticket', t.codigo_ticket,
          'titulo', t.titulo
        )) FROM problema_incidente pi
        JOIN ticket t ON pi.id_ticket = t.id_ticket
        WHERE pi.id_problema = p.id_problema),
        '[]'::json
      ) AS incidentes_asociados
    FROM problema p
    LEFT JOIN impacto_ticket it ON p.id_impacto = it.id_impacto
    LEFT JOIN urgencia_ticket ut ON p.id_urgencia = ut.id_urgencia
    LEFT JOIN prioridad_ticket pt ON p.id_prioridad = pt.id_prioridad
    LEFT JOIN elemento_configuracion ci ON p.id_ci_afectado = ci.id_ci
    LEFT JOIN usuario u ON p.id_usuario_asignado = u.id_usuario
    LEFT JOIN departamento_ti dep ON p.id_departamento = dep.id_departamento
`;

export interface FiltrosProblemas {
  estado?: string | null;
  soloKedb?: boolean;
}

export async function listarProblemas(filtros: FiltrosProblemas, sesion: SesionProblema) {
  const condiciones: string[] = ["p.estado_registro = true"];
  const params: any[] = [];
  let paramIdx = 1;

  if (filtros.estado) {
    condiciones.push(`p.id_estado = $${paramIdx++}`);
    params.push(parseInt(filtros.estado, 10));
  }

  if (filtros.soloKedb) {
    condiciones.push(`p.es_error_conocido = true`);
  }

  if (sesion.idPerfil === 2) {
    condiciones.push(
      `p.id_departamento = (SELECT td.id_departamento FROM tecnico_detalle td WHERE td.id_usuario = $${paramIdx++} AND td.estado_registro = true)`
    );
    params.push(sesion.idUsuario);
  } else if (sesion.idPerfil === 4) {
    condiciones.push(
      `p.id_departamento IN (SELECT d.id_departamento FROM departamento_ti d WHERE d.id_supervisor = $${paramIdx++} AND d.estado_registro = true)`
    );
    params.push(sesion.idUsuario);
  }

  return query(`${SELECT_PROBLEMA} WHERE ${condiciones.join(" AND ")} ORDER BY p.id_problema DESC`, params);
}

export interface DatosProblema {
  titulo?: string;
  descripcion?: string;
  id_impacto?: unknown;
  id_urgencia?: unknown;
  id_prioridad?: unknown;
  metodo_analisis?: string;
  id_ci_afectado?: unknown;
  id_departamento?: unknown;
  id_ticket_origen?: unknown;
}

export async function crearProblema(body: DatosProblema, sesion: SesionProblema) {
  const {
    titulo,
    descripcion,
    id_impacto,
    id_urgencia,
    id_prioridad,
    metodo_analisis,
    id_ci_afectado,
    id_departamento,
    id_ticket_origen,
  } = body;

  let idDepartamentoFinal: number;
  if (sesion.idPerfil === 2) {
    const grupoTecnico = await queryRow<{ id_departamento: number }>(
      "SELECT id_departamento FROM tecnico_detalle WHERE id_usuario = $1 AND estado_registro = true",
      [sesion.idUsuario]
    );
    if (!grupoTecnico) throw new ErrorDominio("El técnico no tiene un grupo resolutor activo.", 403);
    idDepartamentoFinal = Number(grupoTecnico.id_departamento);
    if (id_departamento && Number(id_departamento) !== idDepartamentoFinal) {
      throw new ErrorDominio("Solo puedes registrar problemas para tu grupo resolutor.", 403);
    }
  } else {
    const gruposSupervisor = await query<{ id_departamento: number }>(
      "SELECT id_departamento FROM departamento_ti WHERE id_supervisor = $1 AND estado_registro = true ORDER BY id_departamento",
      [sesion.idUsuario]
    );
    if (id_departamento) {
      idDepartamentoFinal = Number(id_departamento);
      if (!gruposSupervisor.some((d) => Number(d.id_departamento) === idDepartamentoFinal)) {
        throw new ErrorDominio("Solo puedes registrar problemas para grupos que supervisas.", 403);
      }
    } else if (gruposSupervisor[0]) {
      idDepartamentoFinal = Number(gruposSupervisor[0].id_departamento);
    } else {
      throw new ErrorDominio("No tienes un grupo de TI asignado para registrar el problema.", 403);
    }
  }

  if (!titulo || !descripcion) {
    throw new ErrorDominio("Título y descripción son obligatorios para el Problema.");
  }

  if (id_ticket_origen) {
    const ticketDelGrupo = await queryRow<{ existe: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM ticket WHERE id_ticket = $1 AND id_departamento = $2 AND estado_registro = true) AS existe",
      [id_ticket_origen, idDepartamentoFinal]
    );
    if (!ticketDelGrupo?.existe) {
      throw new ErrorDominio("El incidente de origen debe pertenecer al mismo grupo resolutor del problema.");
    }
  }

  const year = new Date().getFullYear();
  const countRow = await queryRow<{ c: string }>(
    "SELECT COUNT(*) as c FROM problema WHERE EXTRACT(YEAR FROM fecha_creacion) = $1",
    [year]
  );
  const correlativo = String(parseInt(countRow?.c || "0", 10) + 1).padStart(4, "0");
  const codigo_problema = `PRB-${year}-${correlativo}`;

  const row = await queryRow<{ id_problema: number; codigo_problema: string }>(
    `
      INSERT INTO problema (
        codigo_problema,
        titulo,
        descripcion,
        id_impacto,
        id_urgencia,
        id_prioridad,
        id_estado,
        metodo_analisis,
        id_ci_afectado,
        id_usuario_asignado,
        id_departamento,
        usuario_creacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 1, $7, $8, $9, $10, $11
      ) RETURNING id_problema, codigo_problema
    `,
    [
      codigo_problema,
      titulo,
      descripcion,
      id_impacto || 2,
      id_urgencia || 2,
      id_prioridad || 2,
      metodo_analisis || "5_WHYS",
      id_ci_afectado || null,
      sesion.idUsuario,
      idDepartamentoFinal,
      sesion.idUsuario,
    ]
  );

  const idProblema = row?.id_problema;

  // Si viene originado de un ticket, asociarlo
  if (idProblema && id_ticket_origen) {
    await query(
      `INSERT INTO problema_incidente (id_problema, id_ticket) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [idProblema, id_ticket_origen]
    );
    await query(`UPDATE ticket SET id_problema = $1 WHERE id_ticket = $2`, [idProblema, id_ticket_origen]);
  }

  return {
    mensaje: "Problema ITIL registrado exitosamente.",
    id_problema: idProblema,
    codigo_problema: row?.codigo_problema,
  };
}

export async function obtenerProblema(idProblema: number, sesion: SesionProblema) {
  const row = await queryRow(`${SELECT_PROBLEMA} WHERE p.id_problema = $1 AND p.estado_registro = true`, [
    idProblema,
  ]);
  if (!row) throw new ErrorDominio("Problema no encontrado", 404);

  if (sesion.idPerfil === 2) {
    const propio = await queryRow<{ existe: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM problema p JOIN tecnico_detalle td ON td.id_departamento = p.id_departamento
         WHERE p.id_problema = $1 AND td.id_usuario = $2 AND td.estado_registro = true) AS existe`,
      [idProblema, sesion.idUsuario]
    );
    if (!propio?.existe) throw new ErrorDominio("Problema no encontrado.", 404);
  } else if (sesion.idPerfil === 4) {
    const propio = await queryRow<{ existe: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM problema p JOIN departamento_ti d ON d.id_departamento = p.id_departamento
         WHERE p.id_problema = $1 AND d.id_supervisor = $2 AND d.estado_registro = true) AS existe`,
      [idProblema, sesion.idUsuario]
    );
    if (!propio?.existe) throw new ErrorDominio("Problema no encontrado.", 404);
  }

  const kedb = await query(
    `SELECT id_error_conocido, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva, fecha_publicacion
      FROM error_conocido
      WHERE id_problema = $1 AND estado_registro = true`,
    [idProblema]
  );

  return { ...row, errores_conocidos: kedb };
}

export interface ActualizacionProblema {
  id_estado?: unknown;
  causa_raiz?: unknown;
  metodo_analisis?: unknown;
  workaround?: unknown;
  es_error_conocido?: unknown;
  solucion_definitiva?: unknown;
  publicar_en_kedb?: unknown;
  id_ci_afectado?: unknown;
  id_ticket_asociar?: unknown;
}

export async function actualizarProblema(
  idProblema: number,
  body: ActualizacionProblema,
  sesion: SesionProblema
) {
  const alcance = await queryRow<{ existe: boolean }>(
    sesion.idPerfil === 2
      ? `SELECT EXISTS (SELECT 1 FROM problema p JOIN tecnico_detalle td ON td.id_departamento = p.id_departamento WHERE p.id_problema = $1 AND td.id_usuario = $2 AND td.estado_registro = true) AS existe`
      : `SELECT EXISTS (SELECT 1 FROM problema p JOIN departamento_ti d ON d.id_departamento = p.id_departamento WHERE p.id_problema = $1 AND d.id_supervisor = $2 AND d.estado_registro = true) AS existe`,
    [idProblema, sesion.idUsuario]
  );
  if (!alcance?.existe) throw new ErrorDominio("Problema no encontrado.", 404);

  const {
    id_estado,
    causa_raiz,
    metodo_analisis,
    workaround,
    es_error_conocido,
    solucion_definitiva,
    publicar_en_kedb,
    id_ci_afectado,
    id_ticket_asociar,
  } = body;

  // Si se envía un ticket para asociar
  if (id_ticket_asociar) {
    const mismoGrupo = await queryRow<{ existe: boolean }>(
      `SELECT EXISTS (
          SELECT 1 FROM problema p JOIN ticket t ON t.id_departamento = p.id_departamento
          WHERE p.id_problema = $1 AND t.id_ticket = $2 AND t.estado_registro = true
        ) AS existe`,
      [idProblema, id_ticket_asociar]
    );
    if (!mismoGrupo?.existe) {
      throw new ErrorDominio("El incidente debe pertenecer al grupo resolutor del problema.");
    }
    await query(
      `INSERT INTO problema_incidente (id_problema, id_ticket) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [idProblema, id_ticket_asociar]
    );
    await query(`UPDATE ticket SET id_problema = $1 WHERE id_ticket = $2`, [idProblema, id_ticket_asociar]);
  }

  const updates: string[] = ["usuario_modificacion = $1", "fecha_modificacion = now()"];
  const paramsUpdate: any[] = [sesion.idUsuario];
  let idx = 2;

  if (id_estado !== undefined) {
    updates.push(`id_estado = $${idx++}`);
    paramsUpdate.push(id_estado);
  }
  if (causa_raiz !== undefined) {
    updates.push(`causa_raiz = $${idx++}`);
    paramsUpdate.push(causa_raiz);
  }
  if (metodo_analisis !== undefined) {
    updates.push(`metodo_analisis = $${idx++}`);
    paramsUpdate.push(metodo_analisis);
  }
  if (workaround !== undefined) {
    updates.push(`workaround = $${idx++}`);
    paramsUpdate.push(workaround);
  }
  if (es_error_conocido !== undefined) {
    updates.push(`es_error_conocido = $${idx++}`);
    paramsUpdate.push(es_error_conocido);
  }
  if (solucion_definitiva !== undefined) {
    updates.push(`solucion_definitiva = $${idx++}`);
    paramsUpdate.push(solucion_definitiva);
  }
  if (id_ci_afectado !== undefined) {
    updates.push(`id_ci_afectado = $${idx++}`);
    paramsUpdate.push(id_ci_afectado);
  }

  paramsUpdate.push(idProblema);
  await query(`UPDATE problema SET ${updates.join(", ")} WHERE id_problema = $${idx}`, paramsUpdate);

  // Publicación opcional en la Base de Datos de Errores Conocidos (KEDB)
  if (publicar_en_kedb && workaround) {
    const prob = await queryRow<{ titulo: string; descripcion: string }>(
      "SELECT titulo, descripcion FROM problema WHERE id_problema = $1",
      [idProblema]
    );
    const countKedb = await queryRow<{ c: string }>("SELECT COUNT(*) as c FROM error_conocido");
    const codKedb = `KEDB-${String(parseInt(countKedb?.c || "0", 10) + 1).padStart(3, "0")}`;

    await query(
      `INSERT INTO error_conocido (id_problema, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva)
         VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        idProblema,
        codKedb,
        prob?.titulo || "Error Conocido",
        prob?.descripcion || "",
        workaround,
        solucion_definitiva || null,
      ]
    );

    // Actualizar estado del problema a 4 (Error Conocido) y flag
    await query("UPDATE problema SET es_error_conocido = true, id_estado = 4 WHERE id_problema = $1", [
      idProblema,
    ]);
  }

  return { mensaje: "Problema actualizado exitosamente." };
}
