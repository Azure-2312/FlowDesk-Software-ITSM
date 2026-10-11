import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (![2, 4, 6, 7, 8, 9].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "Este perfil no puede consultar problemas." }, { status: 403 });
  }

  const id = params.id;
  const idProblema = parseInt(id, 10);
  if (isNaN(idProblema)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const sql = `
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
      WHERE p.id_problema = $1 AND p.estado_registro = true
    `;

    const row = await queryRow(sql, [idProblema]);
    if (!row) {
      return NextResponse.json({ error: "Problema no encontrado" }, { status: 404 });
    }

    const perfil = sesion.perfilActivo?.id_perfil;
    if (perfil === 2) {
      const propio = await queryRow<{ existe: boolean }>(
        `SELECT EXISTS (SELECT 1 FROM problema p JOIN tecnico_detalle td ON td.id_departamento = p.id_departamento
         WHERE p.id_problema = $1 AND td.id_usuario = $2 AND td.estado_registro = true) AS existe`,
        [idProblema, sesion.id_usuario]
      );
      if (!propio?.existe) return NextResponse.json({ error: "Problema no encontrado." }, { status: 404 });
    } else if (perfil === 4) {
      const propio = await queryRow<{ existe: boolean }>(
        `SELECT EXISTS (SELECT 1 FROM problema p JOIN departamento_ti d ON d.id_departamento = p.id_departamento
         WHERE p.id_problema = $1 AND d.id_supervisor = $2 AND d.estado_registro = true) AS existe`,
        [idProblema, sesion.id_usuario]
      );
      if (!propio?.existe) return NextResponse.json({ error: "Problema no encontrado." }, { status: 404 });
    }

    const kedbSql = `
      SELECT id_error_conocido, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva, fecha_publicacion
      FROM error_conocido
      WHERE id_problema = $1 AND estado_registro = true
    `;
    const kedb = await query(kedbSql, [idProblema]);

    return NextResponse.json({
      ...row,
      errores_conocidos: kedb
    });
  } catch (error) {
    console.error("Error al obtener detalle del problema:", error);
    return NextResponse.json({ error: "Error interno al obtener problema" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (![2, 4].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "Solo Técnicos y Supervisores pueden modificar problemas." }, { status: 403 });
  }

  const id = params.id;
  const idProblema = parseInt(id, 10);
  if (isNaN(idProblema)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const alcance = await queryRow<{ existe: boolean }>(
      sesion.perfilActivo?.id_perfil === 2
        ? `SELECT EXISTS (SELECT 1 FROM problema p JOIN tecnico_detalle td ON td.id_departamento = p.id_departamento WHERE p.id_problema = $1 AND td.id_usuario = $2 AND td.estado_registro = true) AS existe`
        : `SELECT EXISTS (SELECT 1 FROM problema p JOIN departamento_ti d ON d.id_departamento = p.id_departamento WHERE p.id_problema = $1 AND d.id_supervisor = $2 AND d.estado_registro = true) AS existe`,
      [idProblema, sesion.id_usuario]
    );
    if (!alcance?.existe) return NextResponse.json({ error: "Problema no encontrado." }, { status: 404 });

    const body = await req.json();
    const {
      id_estado,
      causa_raiz,
      metodo_analisis,
      workaround,
      es_error_conocido,
      solucion_definitiva,
      publicar_en_kedb,
      id_ci_afectado,
      id_ticket_asociar
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
      if (!mismoGrupo?.existe) return NextResponse.json({ error: "El incidente debe pertenecer al grupo resolutor del problema." }, { status: 400 });
      await query(
        `INSERT INTO problema_incidente (id_problema, id_ticket) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [idProblema, id_ticket_asociar]
      );
      await query(
        `UPDATE ticket SET id_problema = $1 WHERE id_ticket = $2`,
        [idProblema, id_ticket_asociar]
      );
    }

    const updates: string[] = ["usuario_modificacion = $1", "fecha_modificacion = now()"];
    const paramsUpdate: any[] = [sesion.id_usuario];
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
      const codKedb = `KEDB-${String((parseInt(countKedb?.c || "0", 10) + 1)).padStart(3, "0")}`;

      await query(
        `INSERT INTO error_conocido (id_problema, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          idProblema,
          codKedb,
          prob?.titulo || "Error Conocido",
          prob?.descripcion || "",
          workaround,
          solucion_definitiva || null
        ]
      );

      // Actualizar estado del problema a 4 (Error Conocido) y flag
      await query("UPDATE problema SET es_error_conocido = true, id_estado = 4 WHERE id_problema = $1", [idProblema]);
    }

    return NextResponse.json({ mensaje: "Problema actualizado exitosamente." });
  } catch (error) {
    console.error("Error al actualizar problema:", error);
    return NextResponse.json({ error: "Error interno al actualizar el problema" }, { status: 500 });
  }
}
