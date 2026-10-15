import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { DepartamentoTI } from "@/types";
import { validarCodigo, validarTexto, validarNumeroPositivo } from "@/shared/lib/validaciones";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const perfil = sesion.perfilActivo.id_perfil;
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ORGANIZACION_VER)) {
    return NextResponse.json({ departamentos: [] });
  }
  const scope = perfil === 4
    ? "AND d.id_supervisor = $1"
    : perfil === 2
      ? "AND d.id_departamento = (SELECT td.id_departamento FROM tecnico_detalle td WHERE td.id_usuario = $1 AND td.estado_registro = true)"
      : "";
  const scopeParams = scope ? [sesion.id_usuario] : [];

  try {
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

    return NextResponse.json({ departamentos });
  } catch (err) {
    console.error("Error al obtener departamentos de TI:", err);
    return NextResponse.json({ error: "Error interno al consultar departamentos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // La estructura de grupos TI es dato maestro; el Supervisor coordina su
  // grupo, pero no crea la estructura organizacional.
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_ORGANIZACION)) {
    return NextResponse.json({ error: "No autorizado para crear departamentos de TI" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { codigo, nombre, descripcion, id_supervisor, tiempo_ola_horas, tiempo_ola_critico_hrs } = body;

    const vCod = validarCodigo(codigo, 2, 20, "El código del departamento");
    if (!vCod.valido) return NextResponse.json({ error: vCod.mensaje }, { status: 400 });

    const vNom = validarTexto(nombre, 3, 100, "El nombre del departamento", true);
    if (!vNom.valido) return NextResponse.json({ error: vNom.mensaje }, { status: 400 });

    if (descripcion) {
      const vDesc = validarTexto(descripcion, 3, 500, "La descripción del departamento", false);
      if (!vDesc.valido) return NextResponse.json({ error: vDesc.mensaje }, { status: 400 });
    }

    if (tiempo_ola_horas !== undefined && tiempo_ola_horas !== null) {
      const vOla = validarNumeroPositivo(tiempo_ola_horas, "El tiempo OLA (horas)", 1, 720);
      if (!vOla.valido) return NextResponse.json({ error: vOla.mensaje }, { status: 400 });
    }

    if (tiempo_ola_critico_hrs !== undefined && tiempo_ola_critico_hrs !== null) {
      const vOlaCrit = validarNumeroPositivo(tiempo_ola_critico_hrs, "El tiempo OLA crítico (horas)", 1, 720);
      if (!vOlaCrit.valido) return NextResponse.json({ error: vOlaCrit.mensaje }, { status: 400 });
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
        return NextResponse.json({ error: "El responsable debe ser un usuario activo con el perfil Supervisor." }, { status: 400 });
      }
    }

    const codigoFormateado = codigo.trim().toUpperCase();

    const existe = await queryRow(
      "SELECT id_departamento FROM departamento_ti WHERE codigo = $1",
      [codigoFormateado]
    );

    if (existe) {
      return NextResponse.json(
        { error: `Ya existe un departamento con el código [${codigoFormateado}]` },
        { status: 409 }
      );
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

    return NextResponse.json({ departamento: nuevo }, { status: 201 });
  } catch (err) {
    console.error("Error al crear departamento de TI:", err);
    return NextResponse.json({ error: "Error al registrar el departamento" }, { status: 500 });
  }
}
