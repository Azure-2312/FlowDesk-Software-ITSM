// ============================================================================
// PANTALLA OFICIAL DE EQUIPO DE TRABAJO EN CAMBIOS (ITIL v4)
// ============================================================================
// Muestra el equipo técnico al que pertenece el usuario, el cambio RFC activo
// en curso y el historial de implementaciones conjuntas o individuales.
// ============================================================================

import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { obtenerDatosEquipoTrabajo } from "@/modules/cambios/services/cambiosEquipoService";
import VistaCambiosEquipoTrabajo from "@/modules/cambios/views/VistaCambiosEquipoTrabajo";

export default async function PaginaCambiosEquipo() {
  const { idUsuario } = await exigirMenuPagina("/plataforma/cambios/equipo");
  const datos = await obtenerDatosEquipoTrabajo(idUsuario);

  return <VistaCambiosEquipoTrabajo datos={datos} />;
}
