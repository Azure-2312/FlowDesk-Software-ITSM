import { NextRequest, NextResponse } from "next/server";
import { query } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const inicio = Date.now();
  let dbStatus = "DISCONNECTED";
  let dbLatency = 0;

  try {
    const ping = await query("SELECT 1 as ping");
    if (ping.length > 0) {
      dbStatus = "CONNECTED";
      dbLatency = Date.now() - inicio;
    }
  } catch (err: any) {
    dbStatus = "ERROR: " + err.message;
  }

  const statusHttp = dbStatus === "CONNECTED" ? 200 : 503;

  return NextResponse.json(
    {
      servicio: "FlowDesk ITSM - API Clientes y Usuarios Externos",
      version: "1.0.0",
      estado: dbStatus === "CONNECTED" ? "OPERACIONAL" : "DEGRADADO",
      base_de_datos: {
        estado: dbStatus,
        latencia_ms: dbLatency,
        motor: "PostgreSQL 15 (Supabase)"
      },
      uptime_segundos: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    },
    { status: statusHttp }
  );
}
