# Solicitudes a Otros Módulos — Módulo Activos (ITAM / SAM)

Documento normativo conforme a la Sección 17 del Prompt 3 de 3.

| Id | Módulo Destino (Dueño) | Requerimiento | Contrato Propuesto | Comportamiento en Degradación |
|---|---|---|---|---|
| **SA-1** | `tickets` (Miguel) | Publicar editor de formularios y creador de campos para `activo`, `licencia` y `contrato`. | `@/modules/tickets/ui` + servicio de definición de campos. | `activos` usa el adaptador configurado para renderizar campos estándar y personalizados sin duplicar lógica. |
| **SA-2** | `shared` (Tech Lead) | Declarar capacidades `activos:config:*`, `licencias:config:*`, `contratos:config:*` en `capacidades.ts`. | `CAPACIDADES.ACTIVOS_CONFIG_*`. | Se utilizan las capacidades base existentes `ACTIVOS_CONFIGURAR` y validaciones a nivel de controlador. |
| **SA-3** | `incidentes` / `tickets` (Miguel) | Integración del selector de CI bajo custodia y reporte de incidente por pérdida/robo. | `@/modules/cmdb` (`listarCiBajoCustodia`) y `@/modules/incidentes`. | El selector de incidentes mantiene su consulta directa y el reporte por robo se registra como nota en bitácora. |
| **SA-4** | `servicios` / `solicitudes` (Miguel) | Generación automática de pre-activo tras cierre de solicitud de adquisición. | `@/modules/solicitudes` (evento de cierre). | El Gestor de Activos registra la recepción manualmente desde la consola de adquisiciones. |
| **SA-5** | `organizacion` / `identidades` (Junior / Miguel) | Hook de aviso de activos pendientes ante desvinculación de usuarios. | `@/modules/identidades` (`onUsuarioDesactivado`). | Se muestra una advertencia informativa de activos asignados en el panel del Gestor de Activos. |
| **SA-6** | `plataforma` (Miguel) | Emisión de eventos para alertas de vencimiento de garantías y retención de bajas. | `@/modules/plataforma` (servicio de eventos). | Registro en tabla de notificaciones locales y auditoría de sistema. |
| **SA-7** | `problemas` (Alexis) | Exposición de marcas `Problema abierto` y `Error conocido` en ficha del activo. | `@/modules/problemas` (`obtenerMarcasCi`). | La ficha técnica se visualiza sin las marcas concurrentes de problemas. |
| **SA-8** | `cambios` (Nain) | Integración con cambios para atributos protegidos y líneas base automáticas. | `@/modules/cmdb` (`aplicarActualizacionCmdb`). | Las modificaciones fuera de cambio se auditan directamente en la bitácora del activo. |
| **SA-9** | `proveedores` (Nain) | Catálogo unificado de proveedores para contratos y órdenes de compra. | `@/modules/proveedores`. | Se utiliza el catálogo interno de proveedores registrado en la tabla `contrato_ti`. |
| **SA-10** | `reportes` (Alexis) | Vistas analíticas de activos, amortización y garantías. | Lectura SQL de `activo` y `licencia_software`. | El módulo de reportes consume directamente las tablas estándar. |
| **SA-11** | `shared` (Tech Lead) | Promoción de modales y barra de acciones compartidas a `src/shared/components/admin/`. | `@/shared/components/admin/*`. | Implementación local limpia en cada módulo respetando el patrón estándar. |
