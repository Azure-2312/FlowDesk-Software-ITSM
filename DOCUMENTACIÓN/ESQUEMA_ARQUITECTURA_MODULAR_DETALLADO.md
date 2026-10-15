# ESQUEMA DETALLADO DE ARQUITECTURA MODULAR - FLOWDESK SOFTWARE ITSM

## 0. Metadata

- **Proyecto:** FlowDesk Software ITSM
- **Objetivo:** Definir una arquitectura modular, escalable, trazable y defendible frente a ITIL v4, ISO/IEC 20000-1:2018 e ISO/IEC 27001:2022.
- **Enfoque:** Feature-First + Thin Routes + RBAC por capacidades.
- **Condicion tecnica obligatoria en Next.js 14:** Las rutas visibles permanecen en `src/app/`; la logica del negocio vive en `src/modules/`.
- **Regla de seguridad:** Las carpetas no son mecanismo de seguridad. El control real vive en middleware, APIs, servicios y validaciones.
- **Referencias de mercado:** ServiceNow ITSM, Jira Service Management, Freshservice, GLPI, osTicket/Zendesk. Se comparan capacidades esperadas: autoservicio, catalogo, SLA, CAB, KEDB, CMDB, formularios dinamicos, flujos configurables, auditoria y reportes.

---

# 1. Principios de arquitectura

## 1.1 Principios estructurales

1. **Thin Routes**
   - `src/app/` solo contiene paginas, layouts y route handlers delgados.
   - Ninguna pagina deberia concentrar logica de negocio, SQL o reglas de negocio.

2. **Modulo por feature / dominio**
   - Cada practica ITIL se convierte en un modulo autonomo.
   - Un modulo posee sus tipos, servicios, validaciones, vistas, presentadores y permisos.

3. **Modulo core transversal**
   - `Tickets` es la entidad comun.
   - `Incidentes` y `Solicitudes` son especializaciones funcionales de Tickets.

4. **Capability-Based RBAC**
   - No basarse solo en `perfilActivo`.
   - Usar capacidades funcionales como `incidentes:crear`, `incidentes:configurar`, `tickets:auditar`.

5. **Configuracion dentro del modulo**
   - La configuracion de formularios, vistas, flujos y reglas vive dentro del modulo afectado.

6. **Componentes comunes fuera del dominio**
   - Si se reutiliza en mas de un modulo, va a `shared/components`.

7. **Infraestructura unica**
   - DB, email, auth, seguridad global y validaciones transversales viven en `lib/` o `shared/lib/`.

8. **Trazabilidad**
   - Toda accion sensible debe dejar registro en `ticket_historial`, `log_acceso` o tabla de auditoria.

---

# 2. Mapa normativo ITSM -> modulos

| Practica / norma | Modulo principal | Objetivo |
|---|---|---|
| Service Desk (ITIL 4) | `tickets`, `tecnico`, `operacion` | Mesa de ayuda, cola, atencion, seguimiento |
| Incident Management (ITIL 4) | `incidentes` | Restaurar servicio con minima incidencia de negocio |
| Service Request Management (ITIL 4) | `solicitudes`, `servicios` | Solicitudes estandarizadas y auto-servicio |
| Problem Management (ITIL 4) | `problemas`, `conocimiento` | Causa raiz, KEDB, KE, RCA |
| Change Enablement (ITIL 4) | `cambios` | RFC, CAB, riesgo, rollback, calendarizacion |
| Asset Management / ITAM | `activos` | Ciclo de vida de activos TI |
| Configuration Management (CMDB) | `activos` / `cmdb` | CI, relaciones, impacto, integridad |
| Knowledge Management (KCS) | `conocimiento` | Articulos, versiones, validacion, reutilizacion |
| Service Level Management | `servicios`, `reportes` | SLA, OLA, UC, medicion |
| Service Catalog Management | `servicios`, `solicitudes` | Oferta, entitlements, aprobaciones |
| Supplier Management | `proveedores` | Contratos, soporte externo, SLA proveedor |
| Event Management | `operacion` | Monitoreo, alertas, eventos |
| Availability Management | `operacion`, `activos` | Disponibilidad, resiliencia, impacto |
| Capacity & Performance | `reportes`, `operacion` | Saturacion, tendencias, forecasting |
| Access Management | `seguridad` | Identidad, roles, permisos, bloqueo |
| Risk Management | `cambios`, `problemas`, `admin` | Riesgo operativo y tecnico |
| Compliance / Audit | `admin`, `reportes`, `seguridad` | Auditoria, logs, trazabilidad |
| Continual Improvement | `reportes`, `conocimiento`, `admin` | Mejora continua, Kaizen, KPIs |

---

# 3. Top-level propuesto

```text
src/
├── app/                              # Next.js Thin Routes: pages y route handlers
├── modules/                           # Dominios de negocio / features ITSM
├── shared/                            # Componentes, libs y tipos transversales
├── lib/                               # Infraestructura global y utilidades core
├── components/                        # UI legado en retiro gradual
├── types/                             # Tipos globales y contratos base
├── middleware.ts                      # Guard de sesion + acceso base
└── globals.css?                       # (usualmente en app/)
```

---

# 4. Estructura completa propuesta por dominio

## 4.1 Patrón estándar de todo módulo

```text
modules/<modulo>/
├── index.ts                           # Contrato publico del modulo
├── types.ts                           # Tipos y contratos del dominio
├── <modulo>Service.ts                 # Orquestacion backend / logica de aplicacion
├── <modulo>Validaciones.ts             # Validaciones puras compartidas por cliente y servidor
├── constants.ts                       # Catalogos internos, codigos, helpers
├── components/                        # Componentes React reutilizables del modulo
├── views/                             # Pantallas compuestas (page-level)
├── presentadores/                     # Vistas adaptadas por rol/perfil
├── config/                            # Configuracion administrativa del modulo
├── hooks/                             # Hooks React especificos del modulo
├── permissions/                       # Capacidades y RBAC funcional
└── api/                               # (Opcional) controladores internos si se descentralizan
```

---

## 4.2 Modulo `tickets` - Core transversal de tickets

```text
modules/tickets/
├── index.ts                           # Exporta API publica del modulo
├── types.ts                           # Ticket, comentario, adjunto, aprobacion, cols, estados
├── ticketsService.ts                  # Crear, listar, cambiar estado, asignar, auditoria
├── ticketsValidaciones.ts             # Validaciones compartidas frontend/backend
├── constants.ts                       # Estados tipados, colores, claves, prefijos
├── components/
│   ├── TablaTickets.tsx               # Tabla reutilizable de tickets
│   ├── ModalDetalleTicket.tsx         # Modal de detalle resumido
│   ├── CockpitTemporizadorSla.tsx     # Temporizador SLA
│   ├── ControlesDespacho.tsx          # Asignar/escalar/despachar
│   ├── StepperProgresoConsumidor.tsx   # Progreso visible al solicitante
│   ├── StreamChatPublico.tsx          # Chat publico usuario-resolutor
│   ├── StreamNotasInternas.tsx        # Notas internas tecnicas
│   ├── TarjetaAprobacionSod.tsx       # Tarjeta de aprobacion SoD
│   └── TarjetaCalificacionCsat.tsx    # Encuesta SAT/CSAT
├── views/
│   ├── VistaBandejaTickets.tsx        # Bandeja global
│   ├── VistaTicketDetalle.tsx         # Detalle completo
│   ├── VistaMisTickets.tsx            # Tickets del usuario actual
│   ├── VistaAsignados.tsx            # Tickets asignados a tecnico/area
│   └── VistaResueltos.tsx            # Historico resuelto/cerrado
├── presentadores/
│   ├── VistaTicketAdministrador.tsx   # Presentacion para ADMIN
│   ├── VistaTicketConsumidor.tsx      # Presentacion para SOLICITANTE
│   ├── VistaTicketGobernanza.tsx      # Presentacion para SUPERVISOR/APROBADOR
│   ├── VistaTicketOperador.tsx         # Presentacion para TECNICO
│   └── VistaTicketSupervisor.tsx      # Presentacion para GESTOR/COORDINADOR
├── config/
│   ├── ConfiguracionVistasTickets.tsx # Columnas y vistas por perfil
│   ├── ConfiguracionFormularioTicket.tsx # Campos dinamicos de formulario
│   └── ConfiguracionNotificacionesTicket.tsx # Triggers de correo/eventos
├── hooks/
│   └── useTickets.ts                  # Estado reactivo y filtros
├── permissions/
│   └── ticketsPermissions.ts          # Capacidades del modulo ticket
└── secciones/
    ├── BarraAccionesOperativas.tsx
    ├── PanelInfraestructuraCi.tsx
    └── ...
```

### Normatividad relacionada
- ITIL: Service Desk, Incident, Request, Service Level, Knowledge.
- ISO 20000: seguimiento, control y medicion de servicios.
- ISO 27001: registro de eventos, trazabilidad y no repudio.

### Archivos actuales representativos a migrar
- `src/app/plataforma/tickets/page.tsx`
- `src/app/plataforma/tickets/gestion/**/*.tsx`
- `src/app/plataforma/tickets/[id]/page.tsx`
- `src/app/api/tickets/route.ts`
- `src/app/api/tickets/catalogos/route.ts`
- `src/app/api/tickets/[id]/route.ts`
- `src/app/api/tickets/[id]/comentarios/route.ts`
- `src/components/ModalDetalleTicket.tsx`
- `src/components/TablaTickets.tsx`
- `src/components/ticket-detail/**`
- `src/lib/sla.ts`

### Archivos faltantes recomendados
- `services/ticketStateMachine.ts` - maquina de estados segun ITIL.
- `services/slaMeasurementService.ts` - medicion detallada por fase.
- `services/auditTrailService.ts` - evidencia forense.
- `components/TimelineTicket.tsx` - linea temporal de cambios.
- `components/MajorIncidentBanner.tsx` - incidente mayor.
- `views/VistaMesaAyudaOperativa.tsx` - workspace de atencion.
- `config/EscalationRulesConfig.tsx` - reglas de escalamiento.
- `reports/AgingTicketsReport.tsx` - reporte de antiguedad.

---

## 4.3 Modulo `incidentes`

```text
modules/incidentes/
├── index.ts                           # Contrato publico del modulo
├── types.ts                           # Incidente, impacto, mayor, causa visible
├── incidentesService.ts               # Crear, buscar, listar, incidentes mayores
├── incidentesValidaciones.ts          # Validaciones de incidente
├── constants.ts                       # Codigos incidente mayor, severidades
├── components/
│   ├── FormularioIncidente.tsx        # Formulario reactivo de incidente
│   ├── BandejaIncidentes.tsx          # Bandeja de incidentes
│   ├── MajorIncidentHeader.tsx        # Encabezado incidente mayor
│   ├── IncidentImpactPanel.tsx        # Impacto de negocio
│   └── EscalationTimer.tsx           # Temporizador de escalamiento
├── views/
│   ├── VistaCrearIncidente.tsx        # Pantalla crear incidente
│   ├── VistaMisIncidentes.tsx         # Incidentes reportados por usuario
│   ├── VistaIncidentesBandeja.tsx     # Bandeja controlada
│   ├── VistaIncidenteDetalle.tsx      # Detalle incidente
│   └── VistaIncidentesMayores.tsx     # Centro de incidentes mayores
├── presentadores/
│   ├── VistaIncidenteAdministrador.tsx
│   ├── VistaIncidenteOperador.tsx
│   ├── VistaIncidenteSupervisor.tsx
│   ├── VistaIncidenteConsumidor.tsx
│   └── VistaIncidenteAuditor.tsx
├── config/
│   ├── ConfiguracionFormularioIncidente.tsx  # Campos personalizados de incidente
│   ├── CategorizacionIncidenteConfig.tsx     # Categorias/impacto/urgencia
│   ├── IncidenteMayorConfig.tsx            # Criterios de incidente mayor
│   └── EscalamientoIncidenteConfig.tsx      # Reglas de escalamiento
├── hooks/
│   └── useIncidentes.ts              # Estado y filtros
├── permissions/
│   └── incidentesPermissions.ts       # Capacidades de incidente
└── reports/
    ├── IncidentesPorCategoria.tsx
    ├── IncidentesMayores.tsx
    └── MTTR MTBF placeholder
```

### Normatividad relacionada
- ITIL Incident Management.
- ITIL Major Incident Management.
- Reglas de priorizacion: impacto x urgencia.
- ISO 20000: respuesta y restauracion.
- ISO 27001: registro de incidentes de seguridad si aplica.

### Archivos actuales representativos a migrar
- `src/app/plataforma/incidentes/page.tsx`
- `src/app/plataforma/tickets/gestion/incidentes/page.tsx`
- `src/app/api/incidentes/route.ts`
- `src/modules/itsm/incidentes/incidentesService.ts`
- `src/modules/itsm/incidentes/incidentesTypes.ts`
- `src/modules/itsm/incidentes/incidentesValidaciones.ts`

### Archivos faltantes recomendados
- `services/incidenteMayorService.ts`
- `services/escalationIncidentService.ts`
- `views/VistaComandoIncidenteMayor.tsx`
- `components/MajorIncidentRoles.tsx`
- `reports/AnalisisIncidentesRecurrentes.tsx`
- `config/ClasificacionIncidenteConfig.tsx`
- `config/ImpactoNegocioConfig.tsx`

---

## 4.4 Modulo `solicitudes`

```text
modules/solicitudes/
├── index.ts
├── types.ts
├── solicitudesService.ts
├── solicitudesValidaciones.ts
├── constants.ts
├── components/
│   ├── CatalogoServicios.tsx
│   ├── CardServicioSolicitud.tsx
│   ├── FormularioSolicitud.tsx
│   ├── AprobacionSolicitud.tsx
│   └── EstadoSolicitud.tsx
├── views/
│   ├── VistaCatalogoServicios.tsx
│   ├── VistaCrearSolicitud.tsx
│   ├── VistaMisSolicitudes.tsx
│   ├── VistaAprobacionesSolicitudes.tsx
│   └── VistaSolicitudDetalle.tsx
├── presentadores/
├── config/
│   ├── ConfiguracionCatalogoServicios.tsx
│   ├── EntitlementsConfig.tsx
│   └── AprobacionesSolicitudConfig.tsx
├── hooks/
└── permissions/
```

### Normatividad relacionada
- ITIL Service Request Management.
- Service Catalog Management.
- Entitlements y aprobacion SoD.

### Archivos actuales representativos
- `src/app/plataforma/tickets/catalogo/page.tsx`
- `src/app/plataforma/solicitudes/page.tsx`
- `src/app/plataforma/tickets/gestion/solicitudes/page.tsx`
- `src/app/api/solicitudes/route.ts`
- `src/app/api/servicios/route.ts`
- `src/app/api/servicios/[id]/route.ts`
- `src/app/api/servicios/[id]/workflow/route.ts`

### Archivos faltantes recomendados
- `services/entitlementService.ts`
- `services/serviceCatalogService.ts`
- `views/VistaCatalogoEntitlements.tsx`
- `config/SLAporServicioConfig.tsx`
- `config/WorkflowSolicitudConfig.tsx`

---

## 4.5 Modulo `cambios`

```text
modules/cambios/
├── index.ts
├── types.ts
├── cambiosService.ts
├── cambiosValidaciones.ts
├── constants.ts
├── components/
│   ├── FormularioCambio.tsx
│   ├── CabMeetingPanel.tsx
│   ├── RiskQuestionnaire.tsx
│   ├── ChangeCalendar.tsx
│   ├── FreezePeriodsPanel.tsx
│   └── RollbackPlan.tsx
├── views/
│   ├── VistaListaCambios.tsx
│   ├── VistaCrearCambio.tsx
│   ├── VistaDetalleCambio.tsx
│   ├── VistaCalendarioCambios.tsx
│   ├── VistaCab.tsx
│   └── VistaImplementacionCierre.tsx
├── presentadores/
├── config/
│   ├── FlujoEvaluacionConfig.tsx
│   ├── FormularioCambioConfig.tsx
│   ├── TiposCambioConfig.tsx
│   ├── TiposRequisitosConfig.tsx
│   ├── MatrizAutoridadConfig.tsx
│   ├── ModelosEstandarConfig.tsx
│   ├── ReglasClasificacionConfig.tsx
│   ├── NotificacionesCalendarioConfig.tsx
│   ├── FeriadosCongelamientosConfig.tsx
│   ├── VentanasMantenimientoConfig.tsx
│   └── PresentacionCalendarioConfig.tsx
├── hooks/
├── permissions/
└── reports/
    ├── PIRReport.tsx
    ├── CambiosPorTipo.tsx
    └── FallosImplementacion.tsx
```

### Normatividad relacionada
- ITIL Change Enablement.
- RFC, CAB, evaluacion de riesgo, plan de marcha atras.
- Segregacion de funciones (SoD): solicitante no auto-aprueba.
- Calendario de cambios, ventanas y congelamientos.

### Archivos actuales representativos
- `src/app/plataforma/cambios/page.tsx`
- `src/app/plataforma/cambios/gestion/**/*.tsx`
- `src/app/plataforma/admin/procesos/cambios/**/*.tsx`
- `src/app/api/cambios/route.ts`
- `src/app/api/cambios/[id]/route.ts`
- `src/app/api/admin/cambios/**/*.ts`

### Archivos faltantes recomendados
- `services/cabService.ts`
- `services/riskAssessmentService.ts`
- `services/rollbackService.ts`
- `services/standardChangeCatalogService.ts`
- `views/VistaEmergencyChange.tsx`
- `views/VistaPir.tsx`
- `config/ChangeClassificationMatrix.tsx`
- `reports/SuccessRateChanges.tsx`

---

## 4.6 Modulo `problemas`

```text
modules/problemas/
├── index.ts
├── types.ts
├── problemasService.ts
├── problemasValidaciones.ts
├── constants.ts
├── components/
│   ├── FormularioProblema.tsx
│   ├── KedbPanel.tsx
│   ├── KnownErrorCard.tsx
│   ├── RootCauseAnalysis.tsx
│   ├── WorkaroundEditor.tsx
│   └── ProblemTaskList.tsx
├── views/
│   ├── VistaListaProblemas.tsx
│   ├── VistaCrearProblema.tsx
│   ├── VistaDetalleProblema.tsx
│   ├── VistaKedb.tsx
│   └── VistaErroresConocidos.tsx
├── presentadores/
├── config/
│   ├── FlujoProblemaConfig.tsx
│   ├── EstadosTransicionesConfig.tsx
│   ├── AsignacionProblemaConfig.tsx
│   ├── ObjetivosTiempoConfig.tsx
│   ├── EscalamientoProblemaConfig.tsx
│   ├── ReaperturaConfig.tsx
│   ├── RelacionesConfig.tsx
│   ├── UmbralMayorConfig.tsx
│   ├── TareasProblemaConfig.tsx
│   └── FormularioProblemaConfig.tsx
├── hooks/
├── permissions/
└── reports/
    ├── ProblemasRecurrentes.tsx
    ├── KEUsageReport.tsx
    └── RootCauseDistribution.tsx
```

### Normatividad relacionada
- ITIL Problem Management.
- Root Cause Analysis (RCA): 5 whys, fishbone, fault tree.
- KEDB y Known Error.
- Workaround formal.

### Archivos actuales representativos
- `src/app/plataforma/problemas/page.tsx`
- `src/app/plataforma/problemas/kedb/page.tsx`
- `src/app/plataforma/admin/procesos/problemas/**/*.tsx`
- `src/app/api/problemas/route.ts`
- `src/app/api/problemas/[id]/route.ts`
- `src/app/api/problemas/[id]/comentarios/route.ts`

### Archivos faltantes recomendados
- `services/rcaService.ts`
- `services/kedbService.ts`
- `services/knownErrorService.ts`
- `components/FishboneDiagram.tsx`
- `components/ProblemTimeline.tsx`
- `views/VistaCapa.tsx` (Corrective Action / Preventive Action)
- `reports/KpiProblemManagement.tsx`

---

## 4.7 Modulo `activos`

```text
modules/activos/
├── index.ts
├── types.ts
├── activosService.ts
├── activosValidaciones.ts
├── constants.ts
├── components/
│   ├── InventarioActivos.tsx
│   ├── FichaActivo.tsx
│   ├── HistorialActivo.tsx
│   ├── AsignacionActivo.tsx
│   ├── MantenimientoActivo.tsx
│   ├── ConteoInventario.tsx
│   └── MapaUbicaciones.tsx
├── views/
│   ├── VistaInventarioActivos.tsx
│   ├── VistaActivosTecnico.tsx
│   ├── VistaMantenimientoActivos.tsx
│   └── VistaConteoInventario.tsx
├── presentadores/
├── config/
│   ├── TiposModelosAtributosConfig.tsx
│   ├── CiclosVidaTransicionesConfig.tsx
│   ├── LicenciasContratosConfig.tsx
│   └── CmdbRelacionesConfig.tsx
├── permissions/
└── reports/
    ├── AssetsByCategory.tsx
    ├── AssetsWithoutOwner.tsx
    └── LicenseCompliance.tsx
```

### Modulo `cmdb` (puede vivir separado o dentro de activos)

```text
modules/cmdb/
├── index.ts
├── types.ts
├── cmdbService.ts
├── ciRelacionesService.ts
├── components/
│   ├── CIGraph.tsx
│   ├── CICard.tsx
│   ├── RelacionesCI.tsx
│   ├── ImpactAnalysis.tsx
│   └── BaselineAudit.tsx
├── views/
│   ├── VistaExploradorCmdb.tsx
│   ├── VistaTiposCi.tsx
│   └── VistaImpactoCi.tsx
├── config/
│   ├── ClasesCiConfig.tsx
│   ├── TiposRelacionConfig.tsx
│   ├── CriticidadEntornosConfig.tsx
│   ├── ReglasIntegridadConfig.tsx
│   ├── FuentesAtributosConfig.tsx
│   └── AuditoriaLineasBaseConfig.tsx
├── permissions/
└── reports/
    ├── CiChangesImpact.tsx
    └── CiWithoutOwner.tsx
```

### Normatividad
- ITIL Asset Management + Configuration Management.
- ITIL Asset / Configuration como soporte a incidentes, problemas y cambios.
- ISO 27001: inventario de activos, clasificacion y proteccion.
- ISO 20000: gestion de configuracion.

### Archivos actuales
- `src/app/plataforma/activos/**/*.tsx`
- `src/app/api/activos/**/*.ts`
- `src/app/api/admin/activos-config/**/*.ts`

### Archivos faltantes recomendados
- `services/ciDiscoveryService.ts`
- `services/ciImpactAnalysisService.ts`
- `components/CiGraphInteractive.tsx`
- `components/DuplicateCiDetection.tsx`
- `services/costDepreciationService.ts`
- `reports/AssetLifecycleReport.tsx`

---

## 4.8 Modulo `servicios`

```text
modules/servicios/
├── index.ts
├── types.ts
├── serviciosService.ts
├── validaciones.ts
├── constants.ts
├── components/
│   ├── ServicioCard.tsx
│   ├── ServicioForm.tsx
│   ├── CatalogoServicios.tsx
│   └── MatrizPrioridadSla.tsx
├── views/
│   ├── VistaGestionServicios.tsx
│   ├── VistaConfiguracionSla.tsx
│   └── VistaMatrizPrioridad.tsx
├── config/
│   ├── CategoriasServicioConfig.tsx
│   ├── ObjetivosSlaConfig.tsx
│   ├── MatrizPrioridadSlaConfig.tsx
│   └── AgreementsOlaUcConfig.tsx
├── hooks/
├── permissions/
└── reports/
    ├── SlaCompliance.tsx
    └── SlaBreaches.tsx
```

### Normatividad
- ITIL Service Catalog Management.
- Service Level Management.
- OLA / UC / SLA.
- Disponibilidad y capacidad.

### Archivos actuales
- `src/app/plataforma/admin/servicios/**/*.tsx`
- `src/app/api/servicios/route.ts`
- `src/app/api/admin/sla/route.ts`
- `src/app/api/admin/sla/matriz/route.ts`

### Archivos faltantes recomendados
- `services/slaCalculationService.ts`
- `services/olaManagementService.ts`
- `services/ucManagementService.ts`
- `reports/ServiceAvailabilityReport.tsx`
- `config/CalendarBusinessHoursConfig.tsx`

---

## 4.9 Modulo `conocimiento`

```text
modules/conocimiento/
├── index.ts
├── types.ts
├── conocimientoService.ts
├── validaciones.ts
├── constants.ts
├── components/
│   ├── EditorArticulo.tsx
│   ├── ArticuloCard.tsx
│   ├── ArticuloVersion.tsx
│   ├── FeedbackArticulo.tsx
│   └── BuscadorKnowledge.tsx
├── views/
│   ├── VistaBaseConocimiento.tsx
│   ├── VistaMisArticulos.tsx
│   ├── VistaNuevoArticulo.tsx
│   ├── VistaRevisionArticulos.tsx
│   └── VistaArticuloDetalle.tsx
├── config/
│   ├── CategoriasConocimientoConfig.tsx
│   ├── PoliticasConocimientoConfig.tsx
│   └── WorkflowRevisionConfig.tsx
├── hooks/
├── permissions/
└── reports/
    ├── KnowledgeUsageReport.tsx
    └── KnowledgeGapsReport.tsx
```

### Normatividad
- ITIL Knowledge Management / KCS.
- Control de versiones.
- Validacion y aprobacion de contenido.
- Reutilizacion de soluciones.
- KEDB y known errors.

### Archivos actuales
- `src/app/plataforma/tecnico/conocimiento/**/*.tsx`
- `src/app/api/conocimiento/route.ts`
- `src/app/api/conocimiento/[id]/route.ts`
- `src/app/api/admin/conocimiento/**/*.ts`

### Archivos faltantes recomendados
- `services/knowledgeApprovalService.ts`
- `services/knowledgeVersioningService.ts`
- `services/knowledgeSearchService.ts`
- `components/KnowledgeArticleTimeline.tsx`
- `reports/KnowledgeEffectiveness.tsx`

---

## 4.10 Modulo `operacion`

```text
modules/operacion/
├── index.ts
├── types.ts
├── eventosService.ts
├── resilienciaService.ts
├── validaciones.ts
├── components/
│   ├── BoardEventos.tsx
│   ├── AlertTimeline.tsx
│   ├── ResilienciaPanel.tsx
│   ├── CapacityPanel.tsx
│   └── DisponibilidadPanel.tsx
├── views/
│   ├── VistaEventosOperacion.tsx
│   ├── VistaResiliencia.tsx
│   ├── VistaCapacidad.tsx
│   └── VistaDisponibilidad.tsx
├── config/
│   ├── MonitoreoConfig.tsx
│   ├── UmbralesAlertasConfig.tsx
│   └── ResilienciaConfig.tsx
├── hooks/
├── permissions/
└── reports/
    ├── AvailabilityReport.tsx
    ├── EventBacklog.tsx
    └── MTTRAvailability.tsx
```

### Normatividad
- ITIL Event Management.
- Availability Management.
- Capacity and Performance Management.
- Monitoring and Event Management.
- Service Continuity.

### Archivos actuales
- `src/app/plataforma/operacion/**/*.tsx`
- `src/app/api/operacion/**/*.ts`
- `src/components/itsm/EventosWorkspace.tsx`
- `src/components/itsm/ResilienciaWorkspace.tsx`

### Archivos faltantes recomendados
- `services/eventCorrelationService.ts`
- `services/availabilityCalculationService.ts`
- `services/capacityForecastService.ts`
- `components/TopologyView.tsx`
- `reports/IncidentVsEventCorrelation.tsx`

---

## 4.11 Modulo `proveedores`

```text
modules/proveedores/
├── index.ts
├── types.ts
├── proveedoresService.ts
├── validaciones.ts
├── components/
│   ├── ProveedorCard.tsx
│   ├── ContratoPanel.tsx
│   ├── SlaProveedorPanel.tsx
│   └── EscalationSupplier.tsx
├── views/
│   ├── VistaProveedores.tsx
│   ├── VistaContratos.tsx
│   └── VistaSlaProveedor.tsx
├── config/
│   └── ProveedoresConfig.tsx
├── permissions/
└── reports/
    └── SupplierPerformance.tsx
```

### Normatividad
- ITIL Supplier Management.
- Control de OLA/UC externo.
- Contratos y escalaciones.

### Archivos actuales
- `src/app/plataforma/proveedores/page.tsx`
- `src/app/api/proveedores/route.ts`
- `src/app/api/proveedores/[id]/route.ts`
- `src/components/itsm/ProveedoresWorkspace.tsx`

### Archivos faltantes recomendados
- `services/contractExpiryService.ts`
- `services/supplierSlaService.ts`
- `components/ContractAlerts.tsx`
- `reports/SupplierCompliance.tsx`

---

## 4.12 Modulo `seguridad`

```text
modules/seguridad/
├── index.ts
├── types.ts
├── authService.ts
├── captchaService.ts
├── sesionService.ts
├── usuariosService.ts
├── perfilesService.ts
├── permissionsCatalog.ts
├── validaciones.ts
├── components/
│   ├── LoginForm.tsx
│   ├── CaptchaChallenge.tsx
│   ├── SelectorPerfilActivo.tsx
│   ├── GestionUsuarios.tsx
│   ├── GestionPerfiles.tsx
│   └── AuditLogsTable.tsx
├── views/
│   ├── VistaLogin.tsx
│   ├── VistaSeleccionPerfil.tsx
│   ├── VistaMiCuenta.tsx
│   ├── VistaUsuarios.tsx
│   ├── VistaPerfiles.tsx
│   ├── VistaSeguridadLogs.tsx
│   └── VistaAuditoriaSistema.tsx
├── config/
│   ├── PasswordPolicyConfig.tsx
│   ├── SessionPolicyConfig.tsx
│   ├── CaptchaConfig.tsx
│   ├── DomainAccessConfig.tsx
│   └── RbacMatrixConfig.tsx
├── permissions/
│   └── securityPermissions.ts
└── reports/
    ├── AccessAuditReport.tsx
    ├── FailedLoginsReport.tsx
    └── ProfileUsageReport.tsx
```

### Normatividad
- ISO 27001: control de acceso, gestion de identidades, auditoria.
- ITIL Access Management.
- RGPD / proteccion de datos si aplica.
- RBAC, MFA recomendado, bloqueo por intentos, trazabilidad.

### Archivos actuales
- `src/app/login/page.tsx`
- `src/app/api/auth/**/*.ts`
- `src/app/plataforma/admin/usuarios/page.tsx`
- `src/app/plataforma/admin/perfiles/page.tsx`
- `src/app/api/usuarios/**/*.ts`
- `src/app/api/perfiles/**/*.ts`
- `src/modules/seguridad/*`
- `src/lib/auth.ts`
- `src/lib/security.ts`
- `src/lib/usuarios.ts`

### Archivos faltantes recomendados
- `services/mfaService.ts`
- `services/passwordPolicyService.ts`
- `services/accountLockoutService.ts` (ya parcial)
- `services/auditImmutabilityService.ts`
- `components/MfaEnrollment.tsx`
- `config/DataRetentionConfig.tsx`
- `reports/PermissionUsageReport.tsx`

---

## 4.13 Modulo `administracion`

```text
modules/administracion/
├── index.ts
├── types.ts
├── adminService.ts
├── validaciones.ts
├── components/
│   ├── GestionCategorias.tsx
│   ├── GestionDepartamentos.tsx
│   ├── GestionMenu.tsx
│   ├── MantenimientoDatos.tsx
│   └── ReportesDisenador.tsx
├── views/
│   ├── VistaAdministracion.tsx
│   ├── VistaUsuarios.tsx
│   ├── VistaPerfiles.tsx
│   ├── VistaMenu.tsx
│   ├── VistaDepartamentos.tsx
│   ├── VistaDepartamentosEmpresa.tsx
│   ├── VistaConocimientoConfig.tsx
│   ├── VistaMantenimientoDatos.tsx
│   ├── VistaAuditoriaSistema.tsx
│   └── VistaReportesDisenador.tsx
├── config/
│   ├── MenuConfig.tsx
│   ├── DepartamentosConfig.tsx
│   ├── NotificacionesReglasConfig.tsx
│   ├── CatalogosAuxiliaresConfig.tsx
│   ├── CamposPersonalizadosConfig.tsx
│   └── ReportBuilderConfig.tsx
├── permissions/
└── reports/
    ├── ConfigChangeReport.tsx
    └── SystemUsageReport.tsx
```

### Normatividad
- Governance de ITSM.
- Configuracion controlada y versionada.
- Cambio controlado de catalogos.
- Auditoria administrativa.

### Archivos actuales
- `src/app/plataforma/admin/**/*.tsx`
- `src/app/api/admin/**/*.ts`
- `src/app/api/admin/categorias/**`
- `src/app/api/admin/conocimiento/**`
- `src/app/api/menu/**`
- `src/app/api/departamentos-ti/**`
- `src/app/api/departamentos-empresa/**`

### Archivos faltantes recomendados
- `services/configurationVersioningService.ts`
- `services/catalogGovernanceService.ts`
- `components/ConfigApprovalWorkflow.tsx`
- `reports/ConfigurationDriftReport.tsx`

---

## 4.14 Modulo `reportes`

```text
modules/reportes/
├── index.ts
├── types.ts
├── reportesService.ts
├── validaciones.ts
├── components/
│   ├── SlaReport.tsx
│   ├── CsatsReport.tsx
│   ├── BacklogReport.tsx
│   ├── AgentPerformanceReport.tsx
│   ├── IncidentReport.tsx
│   └── ChartWrapper.tsx
├── views/
│   ├── VistaDashboard.tsx
│   ├── VistaIndicadoresOperativos.tsx
│   ├── VistaReportesTi.tsx
│   └── VistaReportBuilder.tsx
├── config/
│   ├── IndicadoresConfig.tsx
│   └── ExportConfig.tsx
├── hooks/
├── permissions/
└── exports/
    ├── pdfExport.ts
    ├── csvExport.ts
    └── excelExport.ts
```

### Normatividad
- ITIL Monitoring and Reporting.
- Continual Improvement.
- KPI/KRI.
- ISO 20000: medicion y mejora.

### Archivos actuales
- `src/app/plataforma/dashboard/page.tsx`
- `src/app/plataforma/tickets/reportes/page.tsx`
- `src/app/api/reportes/indicadores/route.ts`
- `src/app/api/admin/reportes-disenador/route.ts`

### Archivos faltantes recomendados
- `services/kpiService.ts`
- `services/csatService.ts`
- `services/exportService.ts`
- `reports/SLAHeatmap.tsx`
- `reports/MTTR_MTBFReport.tsx`
- `reports/ProblemRcaPareto.tsx`

---

# 5. Capa `shared/`

```text
shared/
├── components/
│   ├── admin/
│   │   ├── BarraAccionesComun.tsx
│   │   ├── ModalHistorialVersiones.tsx
│   │   ├── ModalPublicacion.tsx
│   │   ├── ModalRestaurarFabrica.tsx
│   │   └── ModalVistaPrevia.tsx
│   ├── layout/
│   │   ├── BotonLogout.tsx
│   │   ├── MenuLateral.tsx
│   │   └── SelectorPerfil.tsx
│   └── ui/
│       ├── AlertaCampo.tsx
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── DataTable.tsx
│       ├── Tabs.tsx
│       └── Iconos.tsx
├── hooks/
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   └── usePermissions.ts
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── security.ts
│   ├── email.ts
│   ├── sla.ts
│   ├── validaciones.ts
│   ├── menu.ts
│   └── page-auth.ts
├── constants/
│   ├── perfiles.ts
│   ├── estados.ts
│   ├── roles.ts
│   └── rutas.ts
└── types/
    ├── api.ts
    ├── ui.ts
    └── common.ts
```

---

# 6. Capa `lib/` global (infraestructura)

```text
lib/
├── db.ts                              # Pool PostgreSQL singleton
├── auth.ts                            # JWT, login, sesion
├── security.ts                        # Hash, cifrado, proteccion
├── email.ts                           # Nodemailer SMTP
├── constants.ts                       # Cookies, nombres, codigos
├── validaciones.ts                    # Validaciones puras globales
├── sla.ts                             # Calculo SLA global inicial
├── menu.ts                            # Arbol de menu y filtrado por perfil
├── page-auth.ts                       # Proteccion de paginas
├── usuarios.ts                        # Utilidades de usuario
└── correo-util.ts                     # Utilidades de correo
```

---

# 7. `app/` thin routes esperadas por modulo

## 7.1 Rutas principales

```text
app/plataforma/
├── dashboard/page.tsx                 # Dashboard ejecutivo
├── mi-cuenta/page.tsx                 # Perfil propio
├── incidentes/page.tsx                # Vista incidentes
├── tickets/page.tsx                   # Entrada tickets
├── tickets/[id]/page.tsx              # Detalle ticket
├── cambios/page.tsx                   # Vista cambios
├── problemas/page.tsx                 # Vista problemas
├── activos/page.tsx                   # Inicio activos
├── solicitudes/page.tsx               # Vista solicitudes
├── proveedores/page.tsx               # Vista proveedores
├── operacion/page.tsx                 # Vista operacion
└── admin/page.tsx                     # Vista administracion
```

## 7.2 Rutas operativas

```text
app/plataforma/tickets/gestion/
├── bandeja/page.tsx
├── crear/page.tsx
├── mios/page.tsx
├── asignados/page.tsx
├── todos/page.tsx
├── incidentes/page.tsx
├── solicitudes/page.tsx
├── problemas/page.tsx
├── cambios/page.tsx
├── resueltos/page.tsx
├── aprobaciones/page.tsx
├── auditoria/page.tsx
├── ayuda/page.tsx
├── colaboradores/page.tsx
├── departamento/page.tsx
└── tecnicos/page.tsx
```

## 7.3 Rutas administrativas/configuracion

```text
app/plataforma/admin/
├── usuarios/page.tsx
├── perfiles/page.tsx
├── menu/page.tsx
├── servicios/page.tsx
├── servicios/sla/page.tsx
├── servicios/[id]/formulario/page.tsx
├── tecnicos/page.tsx
├── notificaciones/page.tsx
├── auditoria-sistema/page.tsx
├── seguridad-logs/page.tsx
├── mantenimiento-datos/page.tsx
├── reportes-disenador/page.tsx
├── tickets-formularios/page.tsx
├── tickets-vistas/page.tsx
├── departamentos/page.tsx
├── departamentos-empresa/page.tsx
├── conocimiento-config/page.tsx
├── procesos/cambios/...
├── procesos/problemas/...
└── activos-config/...
```

---

# 8. API thin handlers esperados

## 8.1 Patron

```text
app/api/<dominio>/
├── route.ts                           # GET/POST listado-creacion
├── [id]/route.ts                      # GET/PATCH/DELETE detalle
├── [id]/comentarios/route.ts
├── catalogos/route.ts
└── configuracion/route.ts
```

## 8.2 Inventario de endpoints por dominio (actual + esperado)

- `api/auth/*`: login, captcha, seleccion-perfil, cambiar-perfil, recuperar-clave.
- `api/tickets/*`: tickets, detalle, comentarios, catalogos.
- `api/incidentes/*`: incidentes, categorias, impacto.
- `api/solicitudes/*`: solicitudes, aprobaciones, catalogo.
- `api/cambios/*`: cambios, detalle, aprobaciones.
- `api/admin/cambios/*`: configuracion flujo, formularios, tipos, notificaciones, calendario.
- `api/problemas/*`: problemas, detalle, comentarios.
- `api/admin/problemas/*`: configuracion flujo, campos, relaciones, plantillas.
- `api/activos/*`: activos, cmdb, licencias, modelos, tipos, historial.
- `api/admin/activos-config/*`: configuracion de ciclos, cmdb, licencias, atributos.
- `api/servicios/*`: servicios, detalle, workflow.
- `api/admin/sla/*`: SLA y matriz.
- `api/conocimiento/*`: articulos y detalle.
- `api/admin/conocimiento/*`: categorias y politicas.
- `api/operacion/*`: eventos y resiliencia.
- `api/proveedores/*`: proveedores y detalle.
- `api/tecnicos/*`: contadores, mesa, usuarios, recordatorios.
- `api/usuarios/*`, `api/perfiles/*`, `api/menu/*`, `api/admin/*`: RBAC y configuracion.

---

# 9. Mapeo actual -> objetivo

| Ubicacion actual | Objetivo modular | Accion |
|---|---|---|
| `src/app/plataforma/tickets/*` | `modules/tickets/views/*` | Extraer a modulo; dejar thin route |
| `src/app/plataforma/tickets/gestion/incidentes/*` | `modules/incidentes/views/*` | Unificar por incidente |
| `src/app/plataforma/incidentes/*` | `modules/incidentes/views/*` | Unificar |
| `src/app/plataforma/admin/tickets-formularios/*` | `modules/tickets/config/*` | Config por modulo |
| `src/app/plataforma/admin/procesos/cambios/*` | `modules/cambios/config/*` | Config por modulo |
| `src/app/plataforma/admin/procesos/problemas/*` | `modules/problemas/config/*` | Config por modulo |
| `src/app/plataforma/admin/activos-config/*` | `modules/activos/config/*` + `modules/cmdb/config/*` | Separar por subdominio |
| `src/app/plataforma/admin/servicios/*` | `modules/servicios/config/*` | Config por modulo |
| `src/components/ticket-detail/*` | `modules/tickets/components/*` + views | Migrar |
| `src/components/ticket-detail/presentadores/*` | `modules/tickets/presentadores/*` | Mantener tipado por perfil |
| `src/modules/itsm/incidentes/*` | `modules/incidentes/*` | Consolidar como feature |
| `src/modules/itsm/presentadores/*` | Repartir por modulo (`tickets`, `cambios`, etc.) | Evitar mega-presentador |
| `src/modules/admin/*` | `modules/administracion/*` | Alinear nombres |
| `src/modules/seguridad/*` | `modules/seguridad/*` | Mantener y ampliar |
| `src/shared/*` | `shared/*` | Mantener como capa transversal |
| `src/lib/*` | `lib/*` + `shared/lib/*` | Separar infra y utilidades |

---

# 10. Archivos comunes por perfil esperados

## 10.1 Auditor
- `AuditoriaSistemaView.tsx`
- `TicketsAuditoriaView.tsx`
- `SecurityLogsView.tsx`
- `HistorialTicketView.tsx`
- `ReporteTrazabilidadView.tsx`
- capacidades `*:leer`, `*:auditar`, `*:exportar-evidencia`

## 10.2 Aprobador
- `AprobacionesView.tsx`
- `SolicitudesAprobacionView.tsx`
- `CambiosCabView.tsx`
- `MatrizAutoridadConfig.tsx`
- capacidad `aprobar`, `rechazar`, `observar`

## 10.3 Gestor de Area
- `BandejaAreaView.tsx`
- `AsignacionEquipoView.tsx`
- `CargaTrabajoView.tsx`
- `EscalamientoAreaView.tsx`

## 10.4 Tecnico
- `MesaTrabajoView.tsx`
- `MisAsignadosView.tsx`
- `RegistrarTicketView.tsx`
- `KnowledgeAuthorView.tsx`
- `ProblemasTecnicoView.tsx`

## 10.5 Solicitante
- `CatalogoServiciosView.tsx`
- `CrearIncidenteView.tsx`
- `MisIncidentesView.tsx`
- `MisSolicitudesView.tsx`
- `MisTicketsView.tsx`
- `SeguimientoSlaView.tsx`

## 10.6 Gestor de Cambios
- `CambiosView.tsx`
- `CabWorkbenchView.tsx`
- `ChangeCalendarView.tsx`
- `RfcReviewView.tsx`
- `PirView.tsx`

## 10.7 Gestor de Activos
- `InventarioView.tsx`
- `CmdbExplorerView.tsx`
- `LicensesView.tsx`
- `CycleVidaView.tsx`
- `AssetAuditView.tsx`

## 10.8 Gestor de Problemas
- `ProblemasView.tsx`
- `KedbView.tsx`
- `KnownErrorsView.tsx`
- `RcaView.tsx`
- `ProblemTaskView.tsx`

---

# 11. Datos y entidades base

## 11.1 Nucleo
- `ticket`
- `ticket_aprobacion`
- `comentario_ticket`
- `adjunto_ticket`
- `elemento_configuracion`
- `ci_relacion`
- `activo`
- `licencia_software`
- `licencia_asignacion`

## 11.2 Tipos y catalogos
- `tipo_ticket`
- `impacto_ticket`
- `urgencia_ticket`
- `prioridad_ticket`
- `estado_ticket`
- `motivo_espera_ticket`
- `categoria_ticket`
- `servicio_catalogo`
- `servicio_catalogo_perfiles`
- `servicio_workflow_paso`

## 11.3 Identidad y acceso
- `usuario`
- `perfil`
- `usuario_perfil`
- `opcion_menu`
- `opcion_menu_perfil`
- `departamento_ti`
- `departamento_empresa`
- `log_acceso`
- `codigo_recuperacion`

## 11.4 Servicio / SLA
- `acuerdo_nivel_operativo`
- `regla_notificacion`
- `configuracion_modulo_versiones`
- `bloqueo_edicion_concurrente`

## Cambio / Problema
- `cambio`
- `cambio_aprobacion`
- `problema`
- `problema_incidente`
- `error_conocido`
- `problema_*` (catalogos, reglas, flujos, umbrales, config)

## Activos
- `tipo_activo_catalogo`
- `modelo_activo`
- `transicion_activo`
- `activo_historial`

## Conocimiento
- `articulo_conocimiento`
- `articulo_conocimiento_historial`

## Operacion
- `evento_servicio`
- `resiliencia_servicio`

## Proveedores
- `proveedor_ti`

## Configuracion RFC
- `configuracion_rfc`

---

# 12. Gap comparativo frente a otros ITSM

| Capacidad esperada | Estado actual FlowDesk | Recomendacion |
|---|---|---|
| Portal de autoservicio | Existe parcialmente | Centralizar en `solicitudes` + `conocimiento` |
| Catalogo de servicios | Existe | Agregar entitlements y OLA |
| SLA en tiempo real | Existe base | Agregar medicion por fase y heatmaps |
| Bandeja operativa | Existe por perfil | Unificar en `tickets/views` |
| Incident major | Parcial | Crear workspace de comando |
| CAB y RFC | Existe base | Agregar PIR, standard changes |
| KEDB | Existe | Agregar known error formal y RCA |
| CMDB | Existe base | Agregar grafos e impacto |
| Knowledge | Existe base | Agregar ciclo de vida y feedback |
| Activos | Existe base | Agregar discovery y depreciation |
| Reportes avanzados | Basico | Agregar export, KPI, drill-down |
| RBAC por capacidad | Basico por perfil | Agregar permission catalog |
| Multi-tenancy | No visible | Evaluar si es necesario |
| Automatizaciones / macros | No visible | Agregar reglas y macros |
| Notificaciones dinamicas | Existe base | Centralizar en modulo de notificaciones |
| Calendarios operativos | Existe en cambios | Reutilizar en SLA y disponibilidad |

---

# 13. Plan de migracion en 8 olas

## Ola 1 - Base modular
- Crear `modules/tickets/core`.
- Crear `shared` completo.
- Dejar thin routes.
- Crear `permissions` base.

## Ola 2 - Incidentes
- Migrar `incidentes`.
- Migrar presentadores de incidente.
- Migrar config de formulario incidente.

## Ola 3 - Tickets
- Migrar `TablaTickets`, detalle, comentarios, SLA, aprobaciones.
- Unificar presentadores.

## Ola 4 - Cambios
- Migrar rutas y config de cambios.
- Unificar CAB, formularios, calendario.

## Ola 5 - Problemas
- Migrar flujos y config.
- Agregar KEDB y RCA.

## Ola 6 - Activos y CMDB
- Migrar inventario, licencias, relaciones, ciclos.
- Agregar grafos e impacto.

## Ola 7 - Servicios y conocimiento
- Migrar catalogos, SLA, articulos.
- Agregar OLA, feedback y versioning.

## Ola 8 - Operacion, seguridad y administracion
- Migrar eventos, resiliencia.
- Migrar usuarios, perfiles, auditoria, menu, mantenimiento.
- Refactor final de prefijos `admin/legacy`.

---

# 14. Regla final de seguridad

La arquitectura por carpetas debe mejorar mantenibilidad, no seguridad real.

El control de acceso debe validarse en:

1. `src/middleware.ts`
2. `src/app/api/*/route.ts`
3. `src/modules/*/Service.ts`
4. `src/modules/*/*/permissions/*.ts`
5. `src/lib/auth.ts`
6. `src/lib/security.ts`

La UI puede ocultar opciones con menus y presentadores, pero la API y el servicio deben rechazar cualquier operacion no autorizada.

---

# 15. Convencion de nombres recomendada

- Carpetas de modulo: minusculas y singular si es dominio (`incidentes`, `tickets`).
- Archivos componente: `PascalCase.tsx`.
- Servicios: `camelCaseService.ts`.
- Validaciones: `camelCaseValidaciones.ts`.
- Tipos: `types.ts`.
- Configuraciones: `Configuracion...tsx` o `...Config.tsx`.
- Hooks: `useDominio.ts`.
- Permisos: `dominioPermissions.ts`.

---

# 16. Resumen ejecutivo

La arquitectura objetivo no es solo "mover archivos". Es:

1. Convertir cada practica ITIL en un modulo feature autónomo.
2. Mantener `src/app/` como capa delgada de Next.js.
3. Centralizar el modulo de tickets como core transversal.
4. Separar incidentes y solicitudes como especializaciones.
5. Mover configuracion a cada modulo.
6. Mantener shared infra reutilizable.
7. Cambiar RBAC por perfil a RBAC por capacidades.
8. Migrar gradualmente por olas, sin reescritura completa.
9. Usar normativas ITIL v4, ISO 20000, ISO 27001 y benchmark de otros ITSM como criterio de cobertura.

**Este es el esquema base recomendado para que FlowDesk deje de ser una plataforma funcional con estructura fragmentada y pase a ser una plataforma ITSM modular, escalable y defendible.**

---

# 17. Estado de migracion (corte actual)

## 17.1 Resultado estructural

- Todas las paginas en `src/app/**/page.tsx` son delgadas: ninguna supera 50 lineas.
- Todos los route handlers en `src/app/api/**/route.ts` son delgados: ninguna supera 5 lineas.
- La logica de render, estado, configuracion y vistas vive en `src/modules/<feature>/...`.
- La logica de API vive en `src/modules/<feature>/api/*Controller.ts`.
- La infraestructura transversal vive en `src/shared/lib` y `src/shared/components`.
- No existe dependencia de rutas sobre `src/components` ni `src/lib` (ambas eliminadas).
- No existen imports entre route handlers (`from "../<ruta>/route"`): los adaptadores consumen los controladores de modulo.

## 17.2 Modulos migrados

| Bloque | Modulos/rutas cubiertos |
|---|---|
| Operacion ITIL | `incidentes`, `cambios`, `problemas`, `activos`, `cmdb`, `conocimiento`, `solicitudes`, `proveedores`, `operacion` |
| Gestion de tickets | `tickets` (listado, creacion, asignacion, mios, tecnicos, aprobaciones, ayuda, reportes y detalle `[id]`) |
| Mesa tecnica | `tecnico` (panel, agenda, tareas, mesa, activos, cambios, problemas, SLA, catalogo) |
| Administracion | `administracion/config` (usuarios, perfiles, departamentos, menu, notificaciones, auditoria, seguridad, reportes, mantenimiento, tipos de cambio, formularios de tickets, servicios y SLA, activos-config, conocimiento) |
| Acceso | `seguridad/views/VistaLogin.tsx` |

## 17.3 Convencion aplicada

- Patron de ruta delgada: `page.tsx` importa una vista desde `@/modules/<feature>/...` y la renderiza.
- Patron de vista: si la ruta original es cliente, la vista conserva `"use client"`.
- Patron de configuracion: cada modulo guarda sus vistas, componentes internos y configuraciones en subcarpetas propias.
- Patron de imports: alias `@/modules/...`, `@/shared/...`; sin rutas relativas que crucen `src/app` hacia `src/modules`.

## 17.4 Validacion

- `npx tsc --noEmit`: sin errores.
- `npm run build`: exitoso.
- Sincronizacion en las cuatro ramas remotas: `main`, `feature/alexis-problemas-conocimiento`, `prueba-conexion`, `verify-junior`.

## 17.5 Capa de API por modulo

- Patron de controlador: la logica de cada endpoint se movio a `src/modules/<feature>/api/<nombre>Controller.ts`.
- Patron de ruta API: `route.ts` solo reexporta los metodos HTTP y conserva la configuracion de segmento (`dynamic`, `revalidate`).
- Adaptadores de dominio: `incidentes` y `solicitudes` validan el tipo de ticket y delegan en los controladores de `tickets`.
- Duplicacion eliminada: `seguridad/authService.ts` reexporta la implementacion unica de `shared/lib/auth.ts`.
- Contratos publicos: `src/modules/seguridad/index.ts` expone la API estable del modulo de seguridad.

## 17.6 RBAC por capacidades

- Catalogo unico: `src/shared/lib/capacidades.ts` define `PERFILES`, `CAPACIDADES` (`dominio:accion`) y el mapa puente `CAPACIDADES_POR_PERFIL`.
- Resolucion: `resolverCapacidades`, `tieneCapacidad`, `tieneAlgunaCapacidad`, `tieneTodasLasCapacidades` y equivalentes de sesion (`sesionTieneCapacidad`, `sesionTieneAlgunaCapacidad`).
- Paginas: `exigirCapacidadPagina(capacidades)` en `src/shared/lib/page-auth.ts` reemplaza a `exigirPerfilPagina` (que queda deprecado). Todas las paginas que antes enumeraban perfiles ahora consultan capacidades.
- API: `src/shared/lib/api-auth.ts` expone `autorizarApi(req, capacidades)` y `obtenerSesionDeRequest(req)`; los controladores migrados usan `sesionTieneCapacidad(sesion, CAPACIDADES.X)` en lugar de arreglos de perfiles.
- Alcance migrado: controladores de `administracion`, `activos`, `cambios`, `conocimiento`, `operacion`, `problemas`, `proveedores`, `servicios`, `tecnico`, `tickets` y `reportes`.
- Nota de compatibilidad: las capacidades de lectura replican las listas de perfiles vigentes; se normalizaron algunas inconsistencias (p. ej. el perfil `Gestor de Problemas` (10) ahora accede a problemas/KEDB de forma coherente con su proposito).
- Pendiente: la tabla `vistasPermitidas` de `ticketsController` (bandejas por perfil) sigue siendo un mapa perfil->vista y puede convertirse en capacidades `tickets:vista:*`.

## 17.7 Siguiente nivel recomendado

1. Reemplazar el mapa puente `CAPACIDADES_POR_PERFIL` por una tabla `perfil_capacidades` en la base de datos.
2. Llevar la logica de datos a `Service.ts` por modulo y adelgazar aun mas los controladores.
3. Estandarizar nombres de vistas (`Vista<Feature>.tsx`) y de configuraciones.
4. Incorporar pruebas de contrato por modulo.
5. Exponer contratos publicos (`index.ts`) en los modulos que aun no los tienen.
