// ============================================================================
// PANTALLA OFICIAL DE EQUIPO DE TRABAJO EN PROBLEMAS (ITIL v4)
// ============================================================================
// Muestra el equipo de soporte técnico/investigación RCA al que pertenece el usuario,
// los problemas activos en curso e historial de problemas resueltos colaborativamente.
// ============================================================================

import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { obtenerDatosEquipoProblemas } from "@/modules/problemas/services/problemasEquipoService";
import VistaProblemasEquipoTrabajo from "@/modules/problemas/views/VistaProblemasEquipoTrabajo";

export default async function PaginaProblemasEquipo() {
  const { idUsuario } = await exigirMenuPagina("/plataforma/problemas/equipo");
  const datos = await obtenerDatosEquipoProblemas(idUsuario);

  return <VistaProblemasEquipoTrabajo datos={datos} />;
}
