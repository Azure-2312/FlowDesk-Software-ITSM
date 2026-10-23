import { redirect } from "next/navigation";

export default function PaginaAdminIncidentesIndex() {
  redirect("/admin/tickets-formularios?tipo=incidente");
}
