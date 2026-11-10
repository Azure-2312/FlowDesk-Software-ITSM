import VistaTicketsVistas from "@/modules/tickets/config/vistas/VistaTicketsVistas";

export default function PaginaAdminIncidentesFlujo() {
  return (
    <VistaTicketsVistas
      seccionInicial="estados"
      tipoFijo="incidente"
      ocultarTabsSuperiores={true}
    />
  );
}
