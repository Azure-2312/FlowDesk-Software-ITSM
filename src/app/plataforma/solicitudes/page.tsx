import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { obtenerMenuDelUsuario } from "@/lib/menu";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default async function PaginaSolicitudes() {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) redirect("/login");
  const menu = await obtenerMenuDelUsuario(sesion.id_usuario, sesion.perfilActivo?.id_perfil);
  if (!menu.some((opcion) => opcion.url_menu === "/solicitudes")) redirect("/dashboard");
  return (
    <TablaTickets
      vista="todos"
      tipoInicial="2"
      tipoFijo="2"
      titulo="Solicitudes de Servicio"
      descripcion="Gestiona peticiones estándar de acceso, equipamiento, software y prestaciones publicadas en el catálogo."
    />
  );
}

