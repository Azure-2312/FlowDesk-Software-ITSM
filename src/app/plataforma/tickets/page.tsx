import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

/** Envía la ruta común de tickets a la vista inicial autorizada para el perfil activo. */
export default function PaginaTickets() {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) redirect("/login");

  const destinosPorPerfil: Record<number, string> = {
    1: "/plataforma/tickets/gestion/todos",
    2: "/plataforma/incidentes/asignados",
    3: "/plataforma/solicitudes/mios",
    4: "/plataforma/tickets/gestion/todos",
    5: "/plataforma/solicitudes/aprobaciones",
    6: "/plataforma/incidentes/todos",
    7: "/plataforma/solicitudes/aprobaciones",
    8: "/plataforma/cambios",
    9: "/plataforma/activos",
    10: "/plataforma/problemas",
  };

  redirect(destinosPorPerfil[sesion.perfilActivo?.id_perfil] ?? "/plataforma/dashboard");
}
