import { redirect } from "next/navigation";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAdminCambiosIndex() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_CONFIG_VER);
  redirect("/plataforma/cambios/configuracion/formulario");
}
