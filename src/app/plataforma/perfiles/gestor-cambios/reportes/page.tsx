import { redirect } from "next/navigation";

/** Ruta legada de reportes de cambios; ahora vive en el modulo reportes. */
export default function PaginaReportesCambiosLegacy() {
  redirect("/plataforma/reportes/cambios");
}
