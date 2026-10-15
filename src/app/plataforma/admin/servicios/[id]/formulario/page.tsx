import { exigirPerfilPagina } from "@/shared/lib/page-auth";
import FormularioServicioConfig from "@/modules/servicios/admin/servicios/[id]/formulario/ui";

export default function PaginaFormularioServicio({ params }: { params: { id: string } }) {
  exigirPerfilPagina([1]);
  return <FormularioServicioConfig id={params.id} />;
}
