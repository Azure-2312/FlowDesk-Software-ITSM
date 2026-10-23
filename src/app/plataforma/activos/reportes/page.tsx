import { redirect } from "next/navigation";

/** Ruta legada de reportes de activos; ahora vive en el modulo reportes. */
export default function PaginaReportesActivosLegacy() {
  redirect("/plataforma/reportes/activos");
}
