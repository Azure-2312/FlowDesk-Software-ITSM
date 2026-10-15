import { NextRequest, NextResponse } from "next/server";
import { query } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export interface LogAccesoItem {
  id_log: number;
  id_usuario: number | null;
  usuario_nombre?: string | null;
  correo_intento: string;
  exitoso: boolean;
  ip: string;
  fecha: string;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Restringido a Administrador (1) y Auditor (6)
  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 1 && perfilId !== 6) {
    return NextResponse.json(
      { error: "No tienes autorización para consultar los logs de seguridad" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const buscar = searchParams.get("buscar");
  const filtroResultado = searchParams.get("resultado"); // "exitoso", "fallido", o null

  const condiciones: string[] = ["1=1"];
  const params: any[] = [];
  let paramIdx = 1;

  if (filtroResultado === "exitoso") {
    condiciones.push("l.exitoso = true");
  } else if (filtroResultado === "fallido") {
    condiciones.push("l.exitoso = false");
  }

  if (buscar && buscar.trim().length > 0) {
    condiciones.push(
      `(l.correo_intento ILIKE $${paramIdx} OR l.ip ILIKE $${paramIdx} OR CONCAT(u.nombres, ' ', u.apellido_paterno) ILIKE $${paramIdx})`
    );
    params.push(`%${buscar.trim()}%`);
    paramIdx++;
  }

  const sql = `
    SELECT 
      l.id_log,
      l.id_usuario,
      CONCAT(u.nombres, ' ', u.apellido_paterno) as usuario_nombre,
      l.correo_intento,
      l.exitoso,
      l.ip,
      l.fecha
    FROM log_acceso l
    LEFT JOIN usuario u ON u.id_usuario = l.id_usuario
    WHERE ${condiciones.join(" AND ")}
    ORDER BY l.fecha DESC
    LIMIT 100
  `;

  try {
    const logs = await query<LogAccesoItem>(sql, params);
    return NextResponse.json({ logs });
  } catch (err) {
    console.error("Error al consultar logs de seguridad:", err);
    return NextResponse.json({ error: "Error al consultar registros de seguridad" }, { status: 500 });
  }
}
