import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";

export function exigirPerfilPagina(perfiles: number[]) {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) redirect("/login");
  const idPerfil = sesion.perfilActivo?.id_perfil || 0;
  if (!perfiles.includes(idPerfil)) redirect("/403");
  return { idUsuario: sesion.id_usuario, idPerfil };
}
