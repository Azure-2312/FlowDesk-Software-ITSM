import { NextRequest, NextResponse } from "next/server";
import { query } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Administrador (1) o Gestor de Activos (9)
  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "No autorizado para modificar dependencias en la CMDB" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_ci_padre, id_ci_hijo, tipo_relacion } = body;

    if (!id_ci_padre || !id_ci_hijo || !tipo_relacion) {
      return NextResponse.json(
        { error: "id_ci_padre, id_ci_hijo y tipo_relacion son requeridos" },
        { status: 400 }
      );
    }

    if (id_ci_padre === id_ci_hijo) {
      return NextResponse.json(
        { error: "Un Elemento de Configuración no puede relacionarse consigo mismo" },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO ci_relacion (id_ci_padre, id_ci_hijo, tipo_relacion)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_ci_padre, id_ci_hijo) DO UPDATE SET tipo_relacion = EXCLUDED.tipo_relacion`,
      [Number(id_ci_padre), Number(id_ci_hijo), tipo_relacion]
    );

    return NextResponse.json({ mensaje: "Relación de topología creada/actualizada exitosamente" });
  } catch (err) {
    console.error("Error al registrar relación CMDB:", err);
    return NextResponse.json({ error: "Error al guardar relación en CMDB" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Administrador (1) o Gestor de Activos (9)
  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "No autorizado para eliminar dependencias en la CMDB" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const idPadre = searchParams.get("id_ci_padre");
    const idHijo = searchParams.get("id_ci_hijo");

    if (!idPadre || !idHijo) {
      return NextResponse.json(
        { error: "id_ci_padre e id_ci_hijo son requeridos para eliminar relación" },
        { status: 400 }
      );
    }

    await query(
      `DELETE FROM ci_relacion WHERE id_ci_padre = $1 AND id_ci_hijo = $2`,
      [Number(idPadre), Number(idHijo)]
    );

    return NextResponse.json({ mensaje: "Relación de dependencia eliminada exitosamente" });
  } catch (err) {
    console.error("Error al eliminar relación CMDB:", err);
    return NextResponse.json({ error: "Error al eliminar relación en CMDB" }, { status: 500 });
  }
}
