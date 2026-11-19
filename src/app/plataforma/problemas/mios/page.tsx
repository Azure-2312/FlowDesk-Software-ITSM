// ============================================================================
// PANTALLA OFICIAL DE MIS PROBLEMAS (ITIL v4)
// ============================================================================
// Muestra los problemas de causa raíz asignados a la cartera técnica del usuario.
// ============================================================================

import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaProblemasAsignados from "@/modules/problemas/views/VistaProblemasAsignados";

export default async function PaginaProblemasMios() {
  await exigirMenuPagina("/plataforma/problemas/mios");
  return <VistaProblemasAsignados />;
}
