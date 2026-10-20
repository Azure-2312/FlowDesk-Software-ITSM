import ConfiguracionFormulariosTickets from "@/modules/tickets/config/formulario/ConfiguracionFormulariosTickets";

export default function PaginaTicketsFormularios({ tipoFijo }: { tipoFijo?: "incidente" | "solicitud" } = {}) {
  return <ConfiguracionFormulariosTickets tipoFijo={tipoFijo} />;
}
