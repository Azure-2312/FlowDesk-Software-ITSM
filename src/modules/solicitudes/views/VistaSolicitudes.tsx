import { TablaTickets } from "@/modules/tickets/ui";

export default function VistaSolicitudes() {
  return (
    <TablaTickets
      vista="todos"
      tipoInicial="2"
      tipoFijo="2"
      rutaDetalleBase="/plataforma/solicitudes"
      titulo="Solicitudes de Servicio"
      descripcion="Gestiona peticiones estándar de acceso, equipamiento, software y prestaciones publicadas en el catálogo."
    />
  );
}
