import { redirect } from "next/navigation";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function OperacionServicios() {
  exigirCapacidadPagina(CAPACIDADES.OPERACION_VER);
  redirect("/plataforma/operacion/eventos");
}
