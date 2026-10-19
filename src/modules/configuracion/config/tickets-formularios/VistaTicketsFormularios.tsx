import ConfiguracionFormulariosTickets from "@/modules/configuracion/components/ConfiguracionFormulariosTickets";

export default function PaginaTicketsFormularios({ tipoFijo }: { tipoFijo?: "incidente" | "solicitud" } = {}) {
  return <ConfiguracionFormulariosTickets tipoFijo={tipoFijo} />;
}
