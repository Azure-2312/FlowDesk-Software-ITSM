import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaModelosCambioUnificada from "@/modules/cambios/views/VistaModelosCambioUnificada";

export default async function PaginaCambiosModelos() {
  await exigirMenuPagina("/plataforma/cambios/modelos");
  return <VistaModelosCambioUnificada />;
}
