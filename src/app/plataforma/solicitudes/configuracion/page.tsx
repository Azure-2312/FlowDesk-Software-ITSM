import { redirect } from "next/navigation";

export default function PaginaAdminSolicitudesIndex() {
  redirect("/plataforma/tickets/configuracion/formularios?tipo=solicitud");
}
