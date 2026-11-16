import FormularioServicioConfig from "@/modules/servicios/config/servicios/[id]/formulario/ui";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaFormularioServicio({ params }: { params: { id: string } }) {
  exigirCapacidadPagina(CAPACIDADES.SERVICIOS_CONFIGURAR);
  return <FormularioServicioConfig id={params.id} />;
}
