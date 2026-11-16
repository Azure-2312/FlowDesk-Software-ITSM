import { redirect } from "next/navigation";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAdminProblemasHub() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_CONFIG_VER);
  redirect("/plataforma/problemas/configuracion/formulario");
}
