import { TablaTickets } from "@/modules/tickets/ui";

export default function VistaSolicitudes() {
  return (
    <TablaTickets
      vista="todos"
      tipoInicial="2"
      tipoFijo="2"
      titulo="Solicitudes de Servicio"
      descripcion="Gestiona peticiones est\u00e1ndar de acceso, equipamiento, software y prestaciones publicadas en el cat\u00e1logo."
    />
  );
}
