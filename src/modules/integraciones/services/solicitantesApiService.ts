// Datos que FlowDesk comparte con otros equipos: solo Solicitantes activos
// (perfil 3), con los campos mínimos para identificarlos. El correo es el
// identificador común acordado entre equipos; el DNI se entrega enmascarado.
import { query, queryRow } from "@/shared/lib/db";

export const POR_PAGINA_MAX = 100;
const PERFIL_SOLICITANTE = 3;

export interface FiltrosSolicitantes {
  pagina: number;
  porPagina: number;
  correo?: string | null;
}

export function leerFiltros(params: URLSearchParams): FiltrosSolicitantes | string {
  const pagina = params.get("pagina") ?? "1";
  const porPagina = params.get("por_pagina") ?? "50";
  if (!/^\d{1,6}$/.test(pagina) || Number(pagina) < 1) return "El parámetro 'pagina' debe ser un entero mayor o igual a 1.";
  if (!/^\d{1,3}$/.test(porPagina) || Number(porPagina) < 1 || Number(porPagina) > POR_PAGINA_MAX)
    return `El parámetro 'por_pagina' debe estar entre 1 y ${POR_PAGINA_MAX}.`;
  const correo = params.get("correo");
  if (correo !== null && !/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(correo.trim()))
    return "El parámetro 'correo' no tiene un formato válido.";
  return { pagina: Number(pagina), porPagina: Number(porPagina), correo: correo?.trim().toLowerCase() || null };
}

function enmascararDni(dni: string | null): string | null {
  if (!dni) return null;
  const limpio = dni.trim();
  return limpio.length <= 4 ? "****" : `${"*".repeat(limpio.length - 4)}${limpio.slice(-4)}`;
}

export async function listarSolicitantes(f: FiltrosSolicitantes) {
  const condiciones = [
    "u.estado_registro = true",
    "u.cuenta_bloqueada = false",
    `EXISTS (SELECT 1 FROM usuario_perfiles up WHERE up.id_usuario = u.id_usuario
              AND up.id_perfil = ${PERFIL_SOLICITANTE} AND up.estado_registro = true)`,
  ];
  const params: unknown[] = [];
  if (f.correo) {
    params.push(f.correo);
    condiciones.push(`lower(u.correo_electronico) = $${params.length}`);
  }
  const where = condiciones.join(" AND ");

  const total = Number(
    (await queryRow<{ total: string }>(`SELECT COUNT(*) AS total FROM usuario u WHERE ${where}`, params))?.total || 0
  );

  const filas = await query<any>(
    `SELECT u.id_usuario, u.dni, u.nombres, u.apellido_paterno, u.apellido_materno,
            u.correo_electronico, u.celular, de.nombre AS departamento, u.fecha_creacion
       FROM usuario u
       LEFT JOIN departamento_empresa de ON de.id_departamento_empresa = u.id_departamento_empresa
      WHERE ${where}
      ORDER BY u.id_usuario
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, f.porPagina, (f.pagina - 1) * f.porPagina]
  );

  return {
    sistema: "FlowDesk ITSM",
    recurso: "solicitantes",
    pagina: f.pagina,
    por_pagina: f.porPagina,
    total,
    total_paginas: Math.max(1, Math.ceil(total / f.porPagina)),
    solicitantes: filas.map((u) => ({
      id: u.id_usuario,
      nombres: u.nombres,
      apellidos: [u.apellido_paterno, u.apellido_materno].filter(Boolean).join(" "),
      correo: u.correo_electronico,
      telefono: u.celular || null,
      dni_enmascarado: enmascararDni(u.dni),
      departamento: u.departamento || null,
      fecha_registro: u.fecha_creacion ? new Date(u.fecha_creacion).toISOString() : null,
    })),
  };
}
