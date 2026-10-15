import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { obtenerMenuDelUsuario } from "@/shared/lib/menu";
import VistaSolicitudes from "@/modules/solicitudes/views/VistaSolicitudes";

export default async function PaginaSolicitudes() {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) redirect("/login");
  const menu = await obtenerMenuDelUsuario(sesion.id_usuario, sesion.perfilActivo?.id_perfil);
  if (!menu.some((opcion) => opcion.url_menu === "/solicitudes")) redirect("/dashboard");
  return <VistaSolicitudes />;
}
