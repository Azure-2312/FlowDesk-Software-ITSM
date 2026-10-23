import { redirect } from "next/navigation";

export default function PaginaAdminSolicitudesIndex() {
  redirect("/admin/tickets-formularios?tipo=solicitud");
}
