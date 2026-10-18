import { ErrorDominio } from "@/shared/lib/errores";
import { enviarCorreoCredencialesNuevas } from "@/shared/lib/email";

export async function enviarCredenciales(body: any) {
  const {
    correo_personal,
    correo_corporativo,
    clave_temporal,
    nombres,
    perfiles = [],
  } = body;

  if (!correo_personal || !correo_corporativo || !clave_temporal || !nombres) {
    throw new ErrorDominio("Faltan datos requeridos para el envío de credenciales");
  }

  const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexCorreo.test(correo_personal.trim())) {
    throw new ErrorDominio("El correo personal no tiene un formato válido");
  }

  await enviarCorreoCredencialesNuevas(correo_personal.trim(), {
    nombres: nombres.trim(),
    correoCorporativo: correo_corporativo.trim(),
    claveTemporal: clave_temporal,
    perfiles: Array.isArray(perfiles) ? perfiles : [],
  });

  return {
    ok: true,
    mensaje: `Credenciales enviadas exitosamente al correo personal ${correo_personal.trim()}`,
  };
}
