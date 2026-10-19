import { redirect } from "next/navigation";

/** Ruta legada de reportes de problemas; ahora vive en el modulo reportes. */
export default function PaginaReportesProblemasLegacy() {
  redirect("/plataforma/reportes/problemas");
}
