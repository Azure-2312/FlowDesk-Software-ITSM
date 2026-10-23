const fs = require('fs');
const path = require('path');

const pageDefinitions = [
  // 1. Incidentes
  {
    target: 'src/app/plataforma/incidentes/sala-crisis/page.tsx',
    content: `import VistaTecnicoMesaIncidenteMayor from "@/modules/tickets/views/tecnico/VistaTecnicoMesaIncidenteMayor";

export default function PaginaIncidentesSalaCrisis() {
  return <VistaTecnicoMesaIncidenteMayor />;
}
`
  },
  {
    target: 'src/app/plataforma/incidentes/configuracion/flujo/page.tsx',
    content: `import VistaTicketsVistas from "@/modules/tickets/config/vistas/VistaTicketsVistas";

export default function PaginaIncidentesFlujo() {
  return <VistaTicketsVistas />;
}
`
  },
  {
    target: 'src/app/plataforma/incidentes/todos/page.tsx',
    content: `import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaIncidentes from "@/modules/incidentes/views/VistaIncidentes";

export default async function PaginaIncidentesTodos() {
  await exigirMenuPagina("/plataforma/incidentes", { prefijo: true });
  return <VistaIncidentes />;
}
`
  },

  // 2. Solicitudes
  {
    target: 'src/app/plataforma/solicitudes/configuracion/flujo/page.tsx',
    content: `import VistaTicketsVistas from "@/modules/tickets/config/vistas/VistaTicketsVistas";

export default function PaginaSolicitudesFlujo() {
  return <VistaTicketsVistas />;
}
`
  },
  {
    target: 'src/app/plataforma/solicitudes/todos/page.tsx',
    content: `import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaSolicitudes from "@/modules/solicitudes/views/VistaSolicitudes";

export default async function PaginaSolicitudesTodos() {
  await exigirMenuPagina("/plataforma/solicitudes", { prefijo: true });
  return <VistaSolicitudes />;
}
`
  },
  {
    target: 'src/app/plataforma/solicitudes/delegaciones/page.tsx',
    content: `import VistaAreaSolicitudesDelegacion from "@/modules/solicitudes/views/area/VistaAreaSolicitudesDelegacion";

export default function PaginaSolicitudesDelegaciones() {
  return <VistaAreaSolicitudesDelegacion />;
}
`
  },
  {
    target: 'src/app/plataforma/solicitudes/historial-area/page.tsx',
    content: `import VistaAreaSolicitudesHistorial from "@/modules/solicitudes/views/area/VistaAreaSolicitudesHistorial";

export default function PaginaSolicitudesHistorialArea() {
  return <VistaAreaSolicitudesHistorial />;
}
`
  },

  // 3. Problemas
  {
    target: 'src/app/plataforma/problemas/nuevo/page.tsx',
    content: `import VistaTecnicoProblemasNuevo from "@/modules/problemas/views/tecnico/VistaTecnicoProblemasNuevo";

export default function PaginaProblemasNuevo() {
  return <VistaTecnicoProblemasNuevo />;
}
`
  },
  {
    target: 'src/app/plataforma/problemas/todos/page.tsx',
    content: `import VistaProblemas from "@/modules/problemas/views/VistaProblemas";
import { CAPACIDADES, tieneCapacidad } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProblemasTodos() {
  const { idPerfil } = exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_VER);
  return <VistaProblemas puedeCrear={tieneCapacidad(idPerfil, CAPACIDADES.PROBLEMAS_CREAR)} />;
}
`
  },
  {
    target: 'src/app/plataforma/problemas/asignacion/page.tsx',
    content: `import VistaSupervisorProblemasAsignar from "@/modules/problemas/views/supervisor/VistaSupervisorProblemasAsignar";

export default function PaginaProblemasAsignacion() {
  return <VistaSupervisorProblemasAsignar />;
}
`
  },
  {
    target: 'src/app/plataforma/problemas/candidatos/page.tsx',
    content: `import VistaTecnicoProblemasCandidatos from "@/modules/problemas/views/tecnico/VistaTecnicoProblemasCandidatos";

export default function PaginaProblemasCandidatos() {
  return <VistaTecnicoProblemasCandidatos />;
}
`
  },
  {
    target: 'src/app/plataforma/problemas/asignados/page.tsx',
    content: `import VistaTecnicoProblemasAsignados from "@/modules/problemas/views/tecnico/VistaTecnicoProblemasAsignados";

export default function PaginaProblemasAsignados() {
  return <VistaTecnicoProblemasAsignados />;
}
`
  },
  {
    target: 'src/app/plataforma/problemas/grupo/page.tsx',
    content: `import VistaTecnicoProblemasGrupo from "@/modules/problemas/views/tecnico/VistaTecnicoProblemasGrupo";

export default function PaginaProblemasGrupo() {
  return <VistaTecnicoProblemasGrupo />;
}
`
  },
  {
    target: 'src/app/plataforma/problemas/mayores/page.tsx',
    content: `import VistaAprobadorProblemas from "@/modules/problemas/views/aprobador/VistaAprobadorProblemas";

export default function PaginaProblemasMayores() {
  return <VistaAprobadorProblemas />;
}
`
  },

  // 4. Cambios
  {
    target: 'src/app/plataforma/cambios/nuevo/page.tsx',
    content: `import VistaTecnicoCambiosNuevo from "@/modules/cambios/views/tecnico/VistaTecnicoCambiosNuevo";

export default function PaginaCambiosNuevo() {
  return <VistaTecnicoCambiosNuevo />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/calendario/page.tsx',
    content: `import VistaTecnicoCambiosCalendario from "@/modules/cambios/views/tecnico/VistaTecnicoCambiosCalendario";

export default function PaginaCambiosCalendario() {
  return <VistaTecnicoCambiosCalendario />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/implementacion/page.tsx',
    content: `import VistaTecnicoCambiosImplementacion from "@/modules/cambios/views/tecnico/VistaTecnicoCambiosImplementacion";

export default function PaginaCambiosImplementacion() {
  return <VistaTecnicoCambiosImplementacion />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/historial/page.tsx',
    content: `import VistaTecnicoCambiosHistorial from "@/modules/cambios/views/tecnico/VistaTecnicoCambiosHistorial";

export default function PaginaCambiosHistorial() {
  return <VistaTecnicoCambiosHistorial />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/mis-cambios/page.tsx',
    content: `import VistaTecnicoCambiosMisCambios from "@/modules/cambios/views/tecnico/VistaTecnicoCambiosMisCambios";

export default function PaginaCambiosMisCambios() {
  return <VistaTecnicoCambiosMisCambios />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/aprobaciones/tecnicas/page.tsx',
    content: `import VistaSupervisorCambiosAprobaciones from "@/modules/cambios/views/supervisor/VistaSupervisorCambiosAprobaciones";

export default function PaginaCambiosAprobacionesTecnicas() {
  return <VistaSupervisorCambiosAprobaciones />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/programacion/page.tsx',
    content: `import VistaSupervisorCambiosProgramar from "@/modules/cambios/views/supervisor/VistaSupervisorCambiosProgramar";

export default function PaginaCambiosProgramacion() {
  return <VistaSupervisorCambiosProgramar />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/impacto/equipo/page.tsx',
    content: `import VistaSupervisorCambiosImpacto from "@/modules/cambios/views/supervisor/VistaSupervisorCambiosImpacto";

export default function PaginaCambiosImpactoEquipo() {
  return <VistaSupervisorCambiosImpacto />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/impacto/servicios/page.tsx',
    content: `import VistaTecnicoCambiosImpacto from "@/modules/cambios/views/tecnico/VistaTecnicoCambiosImpacto";

export default function PaginaCambiosImpactoServicios() {
  return <VistaTecnicoCambiosImpacto />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/impacto/interrupciones/page.tsx',
    content: `import VistaAreaCambiosImpacto from "@/modules/cambios/views/area/VistaAreaCambiosImpacto";

export default function PaginaCambiosImpactoInterrupciones() {
  return <VistaAreaCambiosImpacto />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/aprobaciones/negocio/page.tsx',
    content: `import VistaAreaCambiosAprobaciones from "@/modules/cambios/views/area/VistaAreaCambiosAprobaciones";

export default function PaginaCambiosAprobacionesNegocio() {
  return <VistaAreaCambiosAprobaciones />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/aprobaciones/page.tsx',
    content: `import VistaAprobadorCambios from "@/modules/cambios/views/aprobador/VistaAprobadorCambios";

export default function PaginaCambiosAprobaciones() {
  return <VistaAprobadorCambios />;
}
`
  },
  {
    target: 'src/app/plataforma/cambios/modelos/page.tsx',
    content: `import VistaAprobadorCambiosModelos from "@/modules/cambios/views/aprobador/VistaAprobadorCambiosModelos";

export default function PaginaCambiosModelos() {
  return <VistaAprobadorCambiosModelos />;
}
`
  },

  // 5. Activos
  {
    target: 'src/app/plataforma/activos/area/page.tsx',
    content: `import VistaAreaActivos from "@/modules/activos/views/area/VistaAreaActivos";

export default function PaginaActivosArea() {
  return <VistaAreaActivos />;
}
`
  },
  {
    target: 'src/app/plataforma/activos/conteos/page.tsx',
    content: `import VistaTecnicoActivosConteos from "@/modules/activos/views/tecnico/VistaTecnicoActivosConteos";

export default function PaginaActivosConteos() {
  return <VistaTecnicoActivosConteos />;
}
`
  },
  {
    target: 'src/app/plataforma/activos/inventario-tecnico/page.tsx',
    content: `import VistaTecnicoActivosInventario from "@/modules/activos/views/tecnico/VistaTecnicoActivosInventario";

export default function PaginaActivosInventarioTecnico() {
  return <VistaTecnicoActivosInventario />;
}
`
  },
  {
    target: 'src/app/plataforma/activos/bajas/aprobacion/page.tsx',
    content: `import VistaSupervisorActivosBajas from "@/modules/activos/views/supervisor/VistaSupervisorActivosBajas";

export default function PaginaActivosBajasAprobacion() {
  return <VistaSupervisorActivosBajas />;
}
`
  },
  {
    target: 'src/app/plataforma/activos/bajas/consulta/page.tsx',
    content: `import VistaAuditorActivosBajas from "@/modules/activos/views/auditor/VistaAuditorActivosBajas";

export default function PaginaActivosBajasConsulta() {
  return <VistaAuditorActivosBajas />;
}
`
  },
  {
    target: 'src/app/plataforma/activos/bajas/renovaciones/page.tsx',
    content: `import VistaAprobadorActivos from "@/modules/activos/views/aprobador/VistaAprobadorActivos";

export default function PaginaActivosBajasRenovaciones() {
  return <VistaAprobadorActivos />;
}
`
  },
  {
    target: 'src/app/plataforma/activos/reparaciones/page.tsx',
    content: `import VistaTecnicoActivosMantenimiento from "@/modules/activos/views/tecnico/VistaTecnicoActivosMantenimiento";

export default function PaginaActivosReparaciones() {
  return <VistaTecnicoActivosMantenimiento />;
}
`
  },
  {
    target: 'src/app/plataforma/activos/licencias/consulta/page.tsx',
    content: `import VistaTecnicoActivosLicencias from "@/modules/activos/views/tecnico/VistaTecnicoActivosLicencias";

export default function PaginaActivosLicenciasConsulta() {
  return <VistaTecnicoActivosLicencias />;
}
`
  },

  // 6. CMDB
  {
    target: 'src/app/plataforma/cmdb/topologia/page.tsx',
    content: `import VistaActivosCmdb from "@/modules/activos/views/cmdb/VistaActivosCmdb";

export default function PaginaCmdbTopologia() {
  return <VistaActivosCmdb />;
}
`
  },
  {
    target: 'src/app/plataforma/cmdb/tipos/page.tsx',
    content: `import VistaActivosCmdbTipos from "@/modules/activos/views/cmdb/tipos/VistaActivosCmdbTipos";

export default function PaginaCmdbTipos() {
  return <VistaActivosCmdbTipos />;
}
`
  },
  {
    target: 'src/app/plataforma/cmdb/auditoria/resultados/page.tsx',
    content: `import VistaAuditorCmdbResultados from "@/modules/cmdb/views/auditor/VistaAuditorCmdbResultados";

export default function PaginaCmdbAuditoriaResultados() {
  return <VistaAuditorCmdbResultados />;
}
`
  },

  // 7. Conocimiento
  {
    target: 'src/app/plataforma/conocimiento/base/page.tsx',
    content: `import VistaTecnicoConocimientoBase from "@/modules/conocimiento/views/tecnico/VistaTecnicoConocimientoBase";

export default function PaginaConocimientoBase() {
  return <VistaTecnicoConocimientoBase />;
}
`
  },
  {
    target: 'src/app/plataforma/conocimiento/nuevo/page.tsx',
    content: `import VistaTecnicoConocimientoNuevo from "@/modules/conocimiento/views/tecnico/VistaTecnicoConocimientoNuevo";

export default function PaginaConocimientoNuevo() {
  return <VistaTecnicoConocimientoNuevo />;
}
`
  },
  {
    target: 'src/app/plataforma/conocimiento/mis-articulos/page.tsx',
    content: `import VistaTecnicoConocimientoMisArticulos from "@/modules/conocimiento/views/tecnico/VistaTecnicoConocimientoMisArticulos";

export default function PaginaConocimientoMisArticulos() {
  return <VistaTecnicoConocimientoMisArticulos />;
}
`
  },
  {
    target: 'src/app/plataforma/conocimiento/publicacion/page.tsx',
    content: `import VistaSupervisorConocimientoRevisiones from "@/modules/conocimiento/views/supervisor/VistaSupervisorConocimientoRevisiones";

export default function PaginaConocimientoPublicacion() {
  return <VistaSupervisorConocimientoRevisiones />;
}
`
  },
  {
    target: 'src/app/plataforma/conocimiento/revisiones/page.tsx',
    content: `import VistaTecnicoConocimientoRevisiones from "@/modules/conocimiento/views/tecnico/VistaTecnicoConocimientoRevisiones";

export default function PaginaConocimientoRevisiones() {
  return <VistaTecnicoConocimientoRevisiones />;
}
`
  },

  // 8. SLA
  {
    target: 'src/app/plataforma/servicios/sla/escalamientos/page.tsx',
    content: `import VistaSupervisorSlaEscalamientos from "@/modules/servicios/views/sla/supervisor/VistaSupervisorSlaEscalamientos";

export default function PaginaSlaEscalamientos() {
  return <VistaSupervisorSlaEscalamientos />;
}
`
  },
  {
    target: 'src/app/plataforma/servicios/sla/incumplimientos/page.tsx',
    content: `import VistaSupervisorSlaIncumplimientos from "@/modules/servicios/views/sla/supervisor/VistaSupervisorSlaIncumplimientos";

export default function PaginaSlaIncumplimientos() {
  return <VistaSupervisorSlaIncumplimientos />;
}
`
  },
  {
    target: 'src/app/plataforma/servicios/sla/objetivos/page.tsx',
    content: `import VistaTecnicoSlaObjetivos from "@/modules/servicios/views/sla/tecnico/VistaTecnicoSlaObjetivos";

export default function PaginaSlaObjetivos() {
  return <VistaTecnicoSlaObjetivos />;
}
`
  },
  {
    target: 'src/app/plataforma/servicios/sla/semaforo-cola/page.tsx',
    content: `import VistaTecnicoSlaSemaforo from "@/modules/servicios/views/sla/tecnico/VistaTecnicoSlaSemaforo";

export default function PaginaSlaSemaforoCola() {
  return <VistaTecnicoSlaSemaforo />;
}
`
  },
  {
    target: 'src/app/plataforma/servicios/sla/semaforo-grupo/page.tsx',
    content: `import VistaSupervisorSlaSemaforo from "@/modules/servicios/views/sla/supervisor/VistaSupervisorSlaSemaforo";

export default function PaginaSlaSemaforoGrupo() {
  return <VistaSupervisorSlaSemaforo />;
}
`
  },

  // 9. Seguridad
  {
    target: 'src/app/plataforma/seguridad/delegaciones/page.tsx',
    content: `import VistaAprobadorSeguridadDelegaciones from "@/modules/seguridad/views/aprobador/VistaAprobadorSeguridadDelegaciones";

export default function PaginaSeguridadDelegaciones() {
  return <VistaAprobadorSeguridadDelegaciones />;
}
`
  },
  {
    target: 'src/app/plataforma/seguridad/historial-aprobaciones/page.tsx',
    content: `import VistaAprobadorSeguridadHistorial from "@/modules/seguridad/views/aprobador/VistaAprobadorSeguridadHistorial";

export default function PaginaSeguridadHistorialAprobaciones() {
  return <VistaAprobadorSeguridadHistorial />;
}
`
  },

  // 10. Operacion
  {
    target: 'src/app/plataforma/operacion/eventos-resiliencia/page.tsx',
    content: `import VistaOperacionResiliencia from "@/modules/operacion/views/VistaOperacionResiliencia";

export default function PaginaOperacionEventosResiliencia() {
  return <VistaOperacionResiliencia />;
}
`
  }
];

let created = 0;
for (const p of pageDefinitions) {
  const dir = path.dirname(p.target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(p.target, p.content, 'utf8');
  created++;
  console.log(`Created: ${p.target}`);
}

console.log(`\nSuccessfully created ${created} canonical pages.`);
