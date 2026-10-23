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
    1: "/plataforma/operacion/paneles/administrador", // 1. Administrador
    2: "/plataforma/operacion/paneles/tecnico", // 2. Tecnico
    3: "/plataforma/operacion/paneles/solicitante", // 3. Solicitante
    4: "/plataforma/operacion/paneles/supervisor", // 4. Supervisor
    5: "/plataforma/operacion/paneles/gestor-area", // 5. Gestor de Area
    6: "/plataforma/operacion/paneles/auditor", // 6. Auditor
    7: "/plataforma/operacion/paneles/aprobador", // 7. Aprobador
    8: "/plataforma/operacion/paneles/gestor-cambios", // 8. Gestor de Cambios
    9: "/plataforma/activos/panel", // 9. Gestor de Activos y CMDB
    10: "/plataforma/problemas/gestion/panel", // 10. Gestor de Problemas
  };

  const idPerfil = sesion.perfilActivo?.id_perfil;
  const destino = idPerfil ? destinosPorPerfil[idPerfil] : "/login";

  redirect(destino || "/login");
}
