# Solicitudes a Otros Módulos — Módulo CMDB

Documento normativo conforme a la Sección 17 del Prompt 3 de 3.

| Id | Módulo Destino (Dueño) | Requerimiento | Contrato Propuesto | Comportamiento en Degradación |
|---|---|---|---|---|
| **SA-2** | `shared` (Tech Lead) | Declarar capacidades `cmdb:config:*` en `capacidades.ts`. | `CAPACIDADES.CMDB_CONFIG_*`. | Se utiliza la capacidad base `CMDB_GESTIONAR` y validaciones en controlador. |
| **SA-3** | `incidentes` / `tickets` (Miguel) | Consumo de `listarCiBajoCustodia` para selector de Incidentes y `PanelInfraestructuraCi`. | `@/modules/cmdb` (`listarCiBajoCustodia`). | El selector actual lee directamente los CIs vinculados al custodio sin romper compatibilidad. |
| **SA-7** | `problemas` (Alexis) | Correlación de CIs afectados por problemas mayores y errores conocidos (KEDB). | `@/modules/problemas` (`obtenerProblemasPorCi`). | La visualización de topología opera sin el marcador de problemas abiertos. |
| **SA-8** | `cambios` (Nain) | Integración de análisis de impacto CMDB y actualización de CI por RFC. | `@/modules/cmdb` (`analizarImpacto`, `aplicarActualizacionCmdb`). | La aplicación de cambios sobre la CMDB se realiza mediante actualización formal controlada. |
| **SA-11** | `shared` (Tech Lead) | Promoción de modales y componentes comunes a `shared`. | `@/shared/components/admin/*`. | Implementación local limpia dentro de `cmdb/config/`. |
