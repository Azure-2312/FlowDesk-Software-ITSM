import { redirect } from "next/navigation";

export default function PaginaAdminIncidentesIndex() {
  redirect("/plataforma/tickets/configuracion/formularios?tipo=incidente");
}
