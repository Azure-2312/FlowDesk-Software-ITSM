import { redirect } from "next/navigation";

/** Ruta legada de indicadores; ahora vive en el modulo reportes. */
export default function PaginaTicketsReportesLegacy() {
  redirect("/plataforma/reportes/operativos");
}
