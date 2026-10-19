import { redirect } from "next/navigation";

/** Ruta legada de reportes del area; ahora vive en el modulo reportes. */
export default function PaginaReportesAreaLegacy() {
  redirect("/plataforma/reportes/area");
}
