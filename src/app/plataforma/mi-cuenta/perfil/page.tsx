import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { obtenerMiCuenta } from "@/modules/seguridad/miCuentaService";
import MiCuentaView from "@/modules/seguridad/views/MiCuentaView";

export default async function PaginaMiCuentaPerfil() {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) {
    redirect("/login");
  }

  let datosIniciales = null;
  try {
    datosIniciales = await obtenerMiCuenta(sesion.id_usuario);
  } catch (err) {
    console.error("Error al obtener datos iniciales de usuario:", err);
  }

  return <MiCuentaView datosIniciales={datosIniciales} />;
}
