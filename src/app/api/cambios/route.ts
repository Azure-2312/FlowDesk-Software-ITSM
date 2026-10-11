import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { validarTexto, validarFechaNoPasada } from "@/lib/validaciones";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (![1, 2, 4, 6, 7, 8].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "Este perfil no puede consultar solicitudes de cambio." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const estado = searchParams.get("estado");
  const vista = searchParams.get("vista");

  const condiciones: string[] = ["c.estado_registro = true"];
  const params: any[] = [];
  let paramIdx = 1;

  if (vista === "implementacion") {
    condiciones.push(`(c.id_usuario_responsable = $${paramIdx} OR c.id_usuario_solicitante = $${paramIdx})`);
    params.push(sesion.id_usuario);
    paramIdx++;
    condiciones.push(`c.id_estado IN (3, 4, 5)`);
  } else if (vista === "calendario") {
    condiciones.push(`c.id_estado IN (3, 4, 5, 6)`);
  } else if (vista === "impacto") {
    condiciones.push(`c.id_estado IN (3, 4, 5)`);
  } else if (vista === "historial") {
    condiciones.push(`c.id_estado IN (6, 7, 8)`);
  } else if (sesion.perfilActivo?.id_perfil === 2) {
    condiciones.push(`(c.id_usuario_solicitante = $${paramIdx} OR c.id_usuario_responsable = $${paramIdx})`);
    params.push(sesion.id_usuario);
    paramIdx++;
  } else if (sesion.perfilActivo?.id_perfil === 4) {
    condiciones.push(`c.id_usuario_solicitante IN (
      SELECT u.id_usuario FROM usuario u
      WHERE u.id_departamento IN (
        SELECT d.id_departamento FROM departamento_ti d
        WHERE d.id_supervisor = $${paramIdx++} AND d.estado_registro = true
      )
    )`);
    params.push(sesion.id_usuario);
  }

  if (tipo) {
    condiciones.push(`c.tipo_cambio = $${paramIdx++}`);
    params.push(tipo.toUpperCase());
  }

  if (estado) {
    condiciones.push(`c.id_estado = $${paramIdx++}`);
    params.push(parseInt(estado, 10));
  }

  const sql = `
    SELECT 
      c.id_cambio,
      c.codigo_cambio,
      c.titulo,
      c.descripcion,
      c.tipo_cambio,
      c.id_impacto,
      it.nombre AS impacto_nombre,
      c.id_urgencia,
      ut.nombre AS urgencia_nombre,
      c.id_prioridad,
      pt.nombre AS prioridad_nombre,
      c.id_estado,
      CASE c.id_estado
        WHEN 1 THEN 'Registrado'
        WHEN 2 THEN 'Evaluación CAB'
        WHEN 3 THEN 'Aprobado'
        WHEN 4 THEN 'En Planificación'
        WHEN 5 THEN 'En Ejecución'
        WHEN 6 THEN 'Exitoso'
        WHEN 7 THEN 'Fallido'
        WHEN 8 THEN 'Cancelado'
        ELSE 'Desconocido'
      END AS estado_nombre,
      c.justificacion,
      c.plan_implementacion,
      c.plan_rollback,
      c.plan_pruebas,
      c.ventana_inicio,
      c.ventana_fin,
      c.id_ci_afectado,
      ci.codigo_ci,
      ci.nombre AS ci_nombre,
      c.id_problema_origen,
      p.codigo_problema,
      c.id_incidente_origen,
      t.codigo_ticket AS incidente_codigo,
      c.id_usuario_solicitante,
      CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre,
      us.correo_electronico AS solicitante_email,
      c.id_usuario_responsable,
      CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS responsable_nombre,
      c.resultado_pir,
      c.incidentes_inducidos,
      c.campos_adicionales,
      c.fecha_creacion
    FROM cambio c
    LEFT JOIN impacto_ticket it ON c.id_impacto = it.id_impacto
    LEFT JOIN urgencia_ticket ut ON c.id_urgencia = ut.id_urgencia
    LEFT JOIN prioridad_ticket pt ON c.id_prioridad = pt.id_prioridad
    LEFT JOIN elemento_configuracion ci ON c.id_ci_afectado = ci.id_ci
    LEFT JOIN problema p ON c.id_problema_origen = p.id_problema
    LEFT JOIN ticket t ON c.id_incidente_origen = t.id_ticket
    LEFT JOIN usuario us ON c.id_usuario_solicitante = us.id_usuario
    LEFT JOIN usuario ur ON c.id_usuario_responsable = ur.id_usuario
    WHERE ${condiciones.join(" AND ")}
    ORDER BY c.id_cambio DESC
  `;

  try {
    const rows = await query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener cambios:", error);
    return NextResponse.json({ error: "Error al consultar cambios RFC" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const config = await queryRow<{ perfiles_solicitantes: number[]; tipos_rfc:string[]; exige_ci: boolean; exige_plan_pruebas: boolean; permite_emergencia: boolean; campos_personalizados:any[]; exige_rollback:boolean; duracion_maxima_horas:number }>(
      "SELECT perfiles_solicitantes,tipos_rfc,exige_ci,exige_plan_pruebas,permite_emergencia,campos_personalizados,exige_rollback,duracion_maxima_horas FROM configuracion_rfc WHERE id_configuracion=1"
    );
    const idPerfil = sesion.perfilActivo?.id_perfil || 0;
    if (!(config?.perfiles_solicitantes || [2, 8]).includes(idPerfil)) {
      return NextResponse.json({ error: "El perfil activo no está habilitado para presentar RFC." }, { status: 403 });
    }
    const body = await req.json();
    const {
      titulo,
      descripcion,
      tipo_cambio,
      id_impacto,
      id_urgencia,
      id_prioridad,
      justificacion,
      plan_implementacion,
      plan_rollback,
      plan_pruebas,
      ventana_inicio,
      ventana_fin,
      id_ci_afectado,
      id_problema_origen,
      id_incidente_origen
    } = body;

    const vTit = validarTexto(titulo, 5, 150, "El título del cambio", true);
    if (!vTit.valido) return NextResponse.json({ error: vTit.mensaje }, { status: 400 });

    const vJust = validarTexto(justificacion, 10, 2000, "La justificación del cambio", true);
    if (!vJust.valido) return NextResponse.json({ error: vJust.mensaje }, { status: 400 });

    const vPlan = validarTexto(plan_implementacion, 10, 3000, "El plan de implementación", true);
    if (!vPlan.valido) return NextResponse.json({ error: vPlan.mensaje }, { status: 400 });

    if (!tipo_cambio || (config?.exige_rollback !== false && !plan_rollback) || !ventana_inicio || !ventana_fin) {
      return NextResponse.json({ error: "Faltan campos obligatorios para registrar la Solicitud de Cambio (RFC)." }, { status: 400 });
    }

    const vFecha = validarFechaNoPasada(ventana_inicio, "El inicio de la ventana de cambio");
    if (!vFecha.valido) return NextResponse.json({ error: vFecha.mensaje }, { status: 400 });
    if (config?.exige_ci && !id_ci_afectado) return NextResponse.json({ error: "La configuración RFC requiere seleccionar el CI afectado." }, { status: 400 });
    if (config?.exige_plan_pruebas && !String(plan_pruebas || "").trim()) return NextResponse.json({ error: "La configuración RFC requiere documentar el plan de pruebas." }, { status: 400 });
    const inicio = new Date(ventana_inicio).getTime(); const fin = new Date(ventana_fin).getTime();
    if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio) return NextResponse.json({ error: "La ventana de cambio debe tener fechas válidas y su fin debe ser posterior al inicio." }, { status: 400 });
    if ((fin-inicio)/3600000 > Number(config?.duracion_maxima_horas || 24)) return NextResponse.json({ error: `La ventana supera el máximo configurado de ${config?.duracion_maxima_horas || 24} horas.` }, { status: 400 });
    const custom = body.campos_personalizados && typeof body.campos_personalizados === "object" ? body.campos_personalizados : {};
    for (const field of config?.campos_personalizados || []) {
      const value=custom[field.clave];
      if(field.obligatorio&&(value===undefined||value===null||String(value).trim()===""))return NextResponse.json({error:`Completa el campo obligatorio: ${field.etiqueta}.`},{status:400});
      if(value!==undefined&&field.tipo==="lista"&&!(field.opciones||[]).includes(String(value)))return NextResponse.json({error:`Valor no válido para ${field.etiqueta}.`},{status:400});
    }
    if (!config?.permite_emergencia && String(tipo_cambio).toUpperCase() === "EMERGENCIA") return NextResponse.json({ error: "Las RFC de emergencia están deshabilitadas por configuración." }, { status: 400 });

    // Generar código correlativo RFC-YYYY-XXXX
    const year = new Date().getFullYear();
    const countRow = await queryRow<{ c: string }>(
      "SELECT COUNT(*) as c FROM cambio WHERE EXTRACT(YEAR FROM fecha_creacion) = $1",
      [year]
    );
    const correlativo = String((parseInt(countRow?.c || "0", 10) + 1)).padStart(4, "0");
    const codigo_cambio = `RFC-${year}-${correlativo}`;

    // Estado inicial segun ITIL:
    // ESTANDAR -> id_estado = 3 (Aprobado pre-autorizado)
    // NORMAL / EMERGENCIA -> id_estado = 2 (En Evaluacion CAB)
    const tipoNormalizado = (tipo_cambio as string).toUpperCase();
    if (!(config?.tipos_rfc || ["ESTANDAR","NORMAL","EMERGENCIA"]).includes(tipoNormalizado)) return NextResponse.json({ error: "Este tipo de RFC no está habilitado por la configuración del sistema." }, { status: 400 });
    if (tipoNormalizado === "EMERGENCIA" && !config?.permite_emergencia) return NextResponse.json({ error: "Las RFC de emergencia están deshabilitadas por configuración." }, { status: 400 });
    const id_estado = tipoNormalizado === "ESTANDAR" ? 3 : 2;

    const insertSql = `
      INSERT INTO cambio (
        codigo_cambio,
        titulo,
        descripcion,
        tipo_cambio,
        id_impacto,
        id_urgencia,
        id_prioridad,
        id_estado,
        justificacion,
        plan_implementacion,
        plan_rollback,
        plan_pruebas,
        ventana_inicio,
        ventana_fin,
        id_ci_afectado,
        id_problema_origen,
        id_incidente_origen,
        id_usuario_solicitante,
        id_usuario_responsable,
        usuario_creacion,
        campos_adicionales
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING id_cambio, codigo_cambio
    `;

    const row = await queryRow<{ id_cambio: number; codigo_cambio: string }>(insertSql, [
      codigo_cambio,
      titulo,
      descripcion,
      tipoNormalizado,
      id_impacto || 2,
      id_urgencia || 2,
      id_prioridad || 2,
      id_estado,
      justificacion,
      plan_implementacion,
      plan_rollback,
      plan_pruebas || null,
      ventana_inicio,
      ventana_fin,
      id_ci_afectado || null,
      id_problema_origen || null,
      id_incidente_origen || null,
      sesion.id_usuario,
      sesion.id_usuario,
      sesion.id_usuario,
      JSON.stringify(custom)
    ]);

    return NextResponse.json({
      mensaje: "Solicitud de Cambio (RFC) creada exitosamente.",
      id_cambio: row?.id_cambio,
      codigo_cambio: row?.codigo_cambio
    }, { status: 201 });
  } catch (error) {
    console.error("Error al crear cambio RFC:", error);
    return NextResponse.json({ error: "Error interno al crear el cambio" }, { status: 500 });
  }
}
