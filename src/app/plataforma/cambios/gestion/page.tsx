import { redirect } from "next/navigation";
import { exigirMenuPagina } from "@/shared/lib/page-auth";

export default async function PaginaCambiosGestion() {
  await exigirMenuPagina("/plataforma/cambios/gestion/todos");
  redirect("/plataforma/cambios/gestion/todos");
}
