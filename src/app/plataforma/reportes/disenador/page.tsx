import { redirect } from "next/navigation";

/** Ruta legada del disenador de tableros; ahora vive en el modulo reportes. */
export default function PaginaAdminReportesDisenadorLegacy() {
  redirect("/plataforma/reportes/tableros");
}
