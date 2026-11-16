import { redirect } from "next/navigation";
import { exigirMenuPagina } from "@/shared/lib/page-auth";

/** Ruta legada de reportes de problemas; ahora vive en el modulo reportes. */
export default async function PaginaReportesProblemasLegacy() {
  await exigirMenuPagina("/plataforma/reportes/problemas");
  redirect("/plataforma/reportes/problemas");
}
