// =====================================================================
// Modulo Organizacion
// Departamentos (TI y empresa), tecnicos, colaboradores y ausencias.
//
// Contrato publico: importar SOLO desde "@/modules/organizacion".
// =====================================================================

export { listarDepartamentosTi, crearDepartamentoTi } from "./services/departamentoTiService";

export {
  obtenerDepartamentoTi,
  actualizarDepartamentoTi,
  type ContextoAuditoriaDepartamentoTi,
} from "./services/departamentoTiDetalleService";

export {
  listarDepartamentosEmpresa,
  crearDepartamentoEmpresa,
} from "./services/departamentoEmpresaService";

export { actualizarDepartamentoEmpresa } from "./services/departamentoEmpresaDetalleService";

export {
  listarTecnicos,
  guardarTecnico,
  type FiltrosTecnicos,
} from "./services/tecnicoService";

export { retirarTecnico, actualizarTecnico } from "./services/tecnicoDetalleService";

export { listarColaboradores } from "./services/colaboradoresService";

export {
  listarAusencias,
  crearAusencia,
  actualizarAusencia,
  eliminarAusencia,
} from "./services/ausenciasService";

export {
  esTecnicoDisponible,
  obtenerDisponibilidadTecnico,
  type DisponibilidadTecnico,
} from "./services/disponibilidadService";

export {
  listarTurnos,
  crearTurno,
  eliminarTurno,
  TURNOS_VALIDOS,
  type TurnoOperativo,
} from "./services/turnosService";
