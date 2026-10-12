import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

/** Envía la ruta común de tickets a la vista inicial autorizada para el perfil activo. */
export default function PaginaTickets() {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) redirect("/login");

  const destinosPorPerfil: Record<number, string> = {
    1: "/admin/usuarios",
    2: "/tickets/gestion/asignados",
    3: "/tickets/gestion/mios",
    4: "/tickets/gestion/todos",
    5: "/tickets/gestion/aprobaciones",
    6: "/tickets/gestion/auditoria",
    7: "/cambios/gestion/cab",
    8: "/cambios",
    9: "/activos",
  };

  redirect(destinosPorPerfil[sesion.perfilActivo?.id_perfil] ?? "/login");
}
