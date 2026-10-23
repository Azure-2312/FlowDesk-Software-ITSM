import { redirect } from "next/navigation";

/** Ruta legada del catálogo de consulta del técnico; ahora vive en servicios. */
export default function PaginaTecnicoCatalogoLegacy() {
  redirect("/plataforma/servicios/catalogo");
}
