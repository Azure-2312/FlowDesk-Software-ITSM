import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export default function VistaDashboard(): any {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    redirect("/login");
  }

  // Redireccion por perfil segun la documentacion de MENUS_Y_PERFILES.md
  // Antes se usaban rutas directas heterogeneas (/reportes, /operacion), con lo que unos
  // perfiles caian en su panel y otros en una pantalla operativa, asi que el
  // mismo enlace /dashboard daba resultados distintos sin una regla clara.
  const destinosPorPerfil: Record<number, string> = {
    1: "/plataforma/perfiles/administrador/panel", // 1. Administrador
    2: "/plataforma/perfiles/tecnico/panel", // 2. Tecnico
    3: "/plataforma/perfiles/solicitante/panel", // 3. Solicitante
    4: "/plataforma/perfiles/supervisor/panel", // 4. Supervisor
    5: "/plataforma/perfiles/gestor-area/panel", // 5. Gestor de Area
    6: "/plataforma/perfiles/auditor/panel", // 6. Auditor
    7: "/plataforma/perfiles/aprobador/panel", // 7. Aprobador
    8: "/plataforma/perfiles/gestor-cambios/panel", // 8. Gestor de Cambios
    9: "/plataforma/gestor-activos/panel", // 9. Gestor de Activos y CMDB
    10: "/plataforma/gestor-problemas/panel", // 10. Gestor de Problemas
  };

  const idPerfil = sesion.perfilActivo?.id_perfil;
  const destino = idPerfil ? destinosPorPerfil[idPerfil] : "/login";

  redirect(destino || "/login");
}
