import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CLAVE_DASHBOARD = "dashboard_widgets_config";

const WIDGETS_POR_DEFECTO = [
  { id: "w1", titulo: "Distribución de Tickets Abiertos por Tipo (Incidentes vs Solicitudes)", tipo_grafico: "PASTEL", metrica: "conteo_tickets", filtro: "estado=abierto,en_proceso", ancho: "MEDIO", activo: true },
  { id: "w2", titulo: "Cumplimiento Porcentual de SLA por Categoría y Tipo", tipo_grafico: "BARRAS", metrica: "porcentaje_cumplimiento_sla", filtro: "ultimos_30_dias", ancho: "MEDIO", activo: true },
  { id: "w3", titulo: "Composición de Carga Activa por Nivel de Prioridad (P1 a P4)", tipo_grafico: "PASTEL", metrica: "prioridad_activos", filtro: "carga_cola", ancho: "MEDIO", activo: true },
  { id: "w4", titulo: "Pipeline y Estados del Ciclo de Vida del Servicio", tipo_grafico: "BARRAS", metrica: "estados_pipeline", filtro: "general", ancho: "MEDIO", activo: true },
];

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (![1, 4, 6].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const fila = await queryRow<{ valor: any }>(
      "SELECT valor FROM configuracion_sistema WHERE clave = $1",
      [CLAVE_DASHBOARD]
    );

    const widgets = fila?.valor?.widgets || WIDGETS_POR_DEFECTO;
    return NextResponse.json({ widgets });
  } catch (error) {
    console.error("Error al obtener configuración de widgets:", error);
    return NextResponse.json({ error: "Error al consultar widgets" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json({ error: "Solo Administración puede guardar la configuración del dashboard." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const widgets = Array.isArray(body.widgets) ? body.widgets : WIDGETS_POR_DEFECTO;

    await query(
      `INSERT INTO configuracion_sistema (clave, valor, fecha_modificacion, usuario_modificacion)
       VALUES ($1, $2, now(), $3)
       ON CONFLICT (clave) DO UPDATE SET
         valor = EXCLUDED.valor,
         fecha_modificacion = now(),
         usuario_modificacion = EXCLUDED.usuario_modificacion`,
      [CLAVE_DASHBOARD, JSON.stringify({ widgets }), sesion.id_usuario]
    );

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "REPORTES",
        "ACTUALIZAR_DASHBOARDS_GLOBALES",
        `El usuario ${sesion.nombres} actualizó la configuración de widgets y gráficos del Dashboard Global gerencial (${widgets.filter((w: any) => w.activo).length} widgets activos).`,
        JSON.stringify({ cantidad_activos: widgets.filter((w: any) => w.activo).length }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ mensaje: "Configuración de tableros guardada y auditada exitosamente.", widgets });
  } catch (error) {
    console.error("Error al guardar widgets de dashboard:", error);
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
  }
}
