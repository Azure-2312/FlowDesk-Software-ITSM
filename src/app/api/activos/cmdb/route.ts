import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (![1, 2, 4, 6, 7, 8, 9].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "No autorizado para consultar la CMDB" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const criticidad = searchParams.get("criticidad");
  const estado = searchParams.get("estado"); // "activos", "inactivos", "todos"

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

  try {
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

    return NextResponse.json({
      elementos,
      relaciones
    });
  } catch (error) {
    console.error("Error al obtener CMDB:", error);
    return NextResponse.json({ error: "Error al consultar la base de datos de configuración (CMDB)" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Administrador (1) o Gestor de Activos (9)
  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "Solo administradores y gestores de configuración pueden registrar CIs" }, { status: 403 });
  }

  try {
    const body = await req.json();
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
      relacion // opcional { id_ci_padre, tipo_relacion }
    } = body;

    if (!codigo_ci || !nombre || !tipo_ci || !ambiente || !criticidad) {
      return NextResponse.json({ error: "Código, nombre, tipo, ambiente y criticidad son obligatorios para el CI." }, { status: 400 });
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

    const ciRow = await queryRow<{ id_ci: number; codigo_ci: string; nombre: string }>(insertSql, [
      codigo_ci.trim().toUpperCase(),
      nombre.trim(),
      tipo_ci.toUpperCase(),
      ambiente.toUpperCase(),
      ip_principal ? ip_principal.trim() : null,
      version_software ? version_software.trim() : null,
      criticidad.toUpperCase(),
      id_activo || null,
      id_departamento_soporte || 4,
      sesion.id_usuario
    ]);

    if (ciRow && relacion?.id_ci_padre) {
      await query(
        `INSERT INTO ci_relacion (id_ci_padre, id_ci_hijo, tipo_relacion)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [relacion.id_ci_padre, ciRow.id_ci, relacion.tipo_relacion || "DEPENDE_DE"]
      );
    }

    return NextResponse.json({
      mensaje: "Elemento de Configuración (CI) registrado exitosamente.",
      ci: ciRow
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar CI:", error);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Ya existe un Elemento de Configuración con ese código CI." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno al registrar CI en la CMDB" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Administrador (1) o Gestor de Activos (9)
  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "No autorizado para modificar CIs de la CMDB" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_ci } = body;

    if (!id_ci) {
      return NextResponse.json({ error: "ID de CI requerido" }, { status: 400 });
    }

    const actual = await queryRow<any>("SELECT * FROM elemento_configuracion WHERE id_ci = $1", [id_ci]);
    if (!actual) {
      return NextResponse.json({ error: "CI no encontrado" }, { status: 404 });
    }

    let nuevoEstado = actual.estado_registro;
    let motivoInactivacion = actual.motivo_inactivacion;
    let fechaInactivacion = actual.fecha_inactivacion;
    let usuarioInactivacion = actual.usuario_inactivacion;

    if (body.estado_registro !== undefined) {
      nuevoEstado = Boolean(body.estado_registro);
      if (!nuevoEstado) {
        if (!body.motivo_inactivacion || typeof body.motivo_inactivacion !== "string" || body.motivo_inactivacion.trim().length < 5) {
          return NextResponse.json(
            { error: "Debe ingresar una justificación detallada (mínimo 5 caracteres) para dar de baja el CI." },
            { status: 400 }
          );
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

    const actualizado = await queryRow(
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
        id_ci
      ]
    );

    return NextResponse.json({
      mensaje: "Elemento de configuración actualizado exitosamente",
      ci: actualizado
    });
  } catch (err: any) {
    console.error("Error al actualizar CI:", err);
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Ya existe un CI con ese código." }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo actualizar el CI en la CMDB" }, { status: 500 });
  }
}
