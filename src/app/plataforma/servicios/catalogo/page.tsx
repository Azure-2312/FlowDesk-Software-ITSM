import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaTecnicoCatalogo } from "@/modules/servicios/ui";

export default async function PaginaServiciosCatalogo() {
  await exigirMenuPagina("/plataforma/servicios/catalogo");
  return <VistaTecnicoCatalogo />;
}
