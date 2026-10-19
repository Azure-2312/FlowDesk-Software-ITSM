import { redirect } from "next/navigation";

/** Ruta legada de reportes de decisiones; ahora vive en el modulo reportes. */
export default function PaginaReportesAprobadorLegacy() {
  redirect("/plataforma/reportes/decisiones");
}
