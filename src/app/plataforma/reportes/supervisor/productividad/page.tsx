import { redirect } from "next/navigation";

/** Ruta legada de productividad; ahora vive en el modulo reportes. */
export default function PaginaProductividadLegacy() {
  redirect("/plataforma/reportes/productividad");
}
