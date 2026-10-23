import { redirect } from "next/navigation";

/** Ruta legada de informes de auditoria; ahora vive en el modulo reportes. */
export default function PaginaInformesAuditoriaLegacy() {
  redirect("/plataforma/reportes/auditoria");
}
