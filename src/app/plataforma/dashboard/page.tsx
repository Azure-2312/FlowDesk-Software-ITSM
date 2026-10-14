import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export default function PaginaDashboard() {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    redirect("/login");
  }

  // Redireccion inteligente segun perfil activo en la sesion JWT (10 perfiles oficiales ITSM)
  const destinosPorPerfil: Record<number, string> = {
    1: "/admin/usuarios",              // 1. Administrador -> Gestion de identidades y accesos
    2: "/tecnico/panel",               // 2. Tecnico -> Panel operativo de atencion y SLA
    3: "/tickets",                     // 3. Solicitante -> Portal de tickets y autoservicio
    4: "/tickets/gestion/asignar",     // 4. Supervisor -> Centro de despacho y monitoreo de equipo
    5: "/tickets/gestion/aprobaciones",// 5. Gestor de Area -> Aprobaciones departamentales
    6: "/tickets/gestion/auditoria",   // 6. Auditor -> Consola de auditoria forense inmutable
    7: "/cambios/gestion/cab",         // 7. Aprobador -> Panel de dictamen colegiado CAB
    8: "/cambios/gestion/todos",       // 8. Gestor de Cambios -> Consolidado de RFCs y calendario
    9: "/activos/inventario",          // 9. Gestor de Activos y CMDB -> Inventario de hardware y software
    10: "/problemas",                  // 10. Gestor de Problemas -> Registro de problemas y KEDB
  };

  const idPerfil = sesion.perfilActivo?.id_perfil;
  const destino = idPerfil ? destinosPorPerfil[idPerfil] : "/login";

  redirect(destino || "/login");
}
