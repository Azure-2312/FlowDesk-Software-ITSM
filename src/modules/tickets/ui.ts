// =====================================================================
// Contrato de UI del modulo tickets.
//
// Los modulos externos deben importar los componentes compartidos
// SOLO desde aqui:
//
//   import { TablaTickets } from "@/modules/tickets/ui";
//
// Este archivo es de cliente: no debe importar logica de servidor
// (controladores, acceso a base de datos, etc.).
// =====================================================================

export { default as TablaTickets } from "./components/TablaTickets";

export {
  default as PresentadorRfcAprobador,
  type DecisionRfc,
} from "./presentadores/PresentadorRfcAprobador";

export { default as PresentadorProblemaGestor } from "./presentadores/PresentadorProblemaGestor";
