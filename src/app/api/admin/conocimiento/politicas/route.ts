import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CLAVE_KCS = "kcs_gobierno_config";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (![1, 4].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const fila = await queryRow<{ valor: any }>(
      "SELECT valor FROM configuracion_sistema WHERE clave = $1",
      [CLAVE_KCS]
    );

    const politicas = fila?.valor || {
      perfiles_redaccion: [1, 2, 4, 8],
      perfiles_aprobacion: [1, 4],
      requiere_aprobacion_previa: true,
      frecuencia_revision_dias: 90,
      permitir_calificacion_csat: true,
    };

    const perfiles = await query(
      "SELECT id_perfil, nombre, codigo FROM perfiles WHERE estado_registro = true ORDER BY id_perfil ASC"
    );

    return NextResponse.json({ politicas, perfiles });
  } catch (error) {
    console.error("Error al obtener políticas KCS:", error);
    return NextResponse.json({ error: "Error al consultar políticas KCS" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json({ error: "Solo Administración puede configurar las políticas de gobierno KCS." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      perfiles_redaccion,
      perfiles_aprobacion,
      requiere_aprobacion_previa,
      frecuencia_revision_dias,
      permitir_calificacion_csat,
    } = body;

    const redaccion = Array.isArray(perfiles_redaccion) && perfiles_redaccion.length > 0 ? perfiles_redaccion : [1, 2];
    const aprobacion = Array.isArray(perfiles_aprobacion) && perfiles_aprobacion.length > 0 ? perfiles_aprobacion : [1];

    const nuevasPoliticas = {
      perfiles_redaccion: redaccion,
      perfiles_aprobacion: aprobacion,
      requiere_aprobacion_previa: Boolean(requiere_aprobacion_previa),
      frecuencia_revision_dias: Number(frecuencia_revision_dias) || 90,
      permitir_calificacion_csat: Boolean(permitir_calificacion_csat),
    };

    await query(
      `INSERT INTO configuracion_sistema (clave, valor, fecha_modificacion, usuario_modificacion)
       VALUES ($1, $2, now(), $3)
       ON CONFLICT (clave) DO UPDATE SET
         valor = EXCLUDED.valor,
         fecha_modificacion = now(),
         usuario_modificacion = EXCLUDED.usuario_modificacion`,
      [CLAVE_KCS, JSON.stringify(nuevasPoliticas), sesion.id_usuario]
    );

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "CONOCIMIENTO",
        "ACTUALIZAR_POLITICAS_KCS",
        `El usuario ${sesion.nombres} actualizó las políticas de gobierno editorial KCS (Aprobación previa: ${nuevasPoliticas.requiere_aprobacion_previa}, Revisión cada ${nuevasPoliticas.frecuencia_revision_dias} días).`,
        JSON.stringify(nuevasPoliticas),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ mensaje: "Políticas de gobierno KCS actualizadas y auditadas.", politicas: nuevasPoliticas });
  } catch (error) {
    console.error("Error al guardar políticas KCS:", error);
    return NextResponse.json({ error: "Error al guardar políticas KCS" }, { status: 500 });
  }
}
