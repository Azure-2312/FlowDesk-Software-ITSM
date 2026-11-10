import ConfiguracionVistasTickets, { ConfiguracionVistasTicketsProps } from "@/modules/tickets/config/vistas/ConfiguracionVistasTickets";

export default function PaginaTicketsVistas(props: ConfiguracionVistasTicketsProps = {}) {
  return <ConfiguracionVistasTickets {...props} />;
}
