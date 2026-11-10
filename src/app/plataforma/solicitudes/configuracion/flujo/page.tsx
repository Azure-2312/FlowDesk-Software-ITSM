import VistaTicketsVistas from "@/modules/tickets/config/vistas/VistaTicketsVistas";

export default function PaginaAdminSolicitudesFlujo() {
  return (
    <VistaTicketsVistas
      seccionInicial="estados"
      tipoFijo="solicitud"
      ocultarTabsSuperiores={true}
    />
  );
}
