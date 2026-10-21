# SOLICITUDES A OTROS MÓDULOS (SC-1 a SC-11) — Gestión de Cambios (RFC)

> **Módulo emisor:** `src/modules/cambios` (Change Enablement)  
> **Fecha:** 2026-10-21  
> **Regla de oro:** El módulo `cambios` no modifica otros módulos. Las dependencias externas se consumen exclusivamente por contrato formal o mediante estas solicitudes con degradación elegante documentada.

---

### SC-1: Editor de Formularios y Creador de Campos Personalizados
* **Módulo destino:** `tickets` (Miguel)
* **Qué se necesita:** Contrato en `@/modules/tickets/ui` para renderizar el diseñador de campos dinámicos con soporte para la entidad `cambio`.
* **Contrato propuesto:** `export { DisenadorFormularios } from "@/modules/tickets/ui";`
* **Degradación mientras no exista:** `cambios` utiliza su implementación interna de catálogo y campos personalizados (`camposPersonalizadosService.ts` y tabla `cambio_catalogo_item`), marcando la sincronización global como disponible en siguiente iteración.

---

### SC-2: Ampliación de Capacidades en `shared/lib/capacidades.ts`
* **Módulo destino:** `shared` (Tech Lead)
* **Qué se necesita:** Declaración explícita de sub-capacidades finas de configuración y calendario (`cambios:config:editar`, `cambios:config:calendario:editar`, `cambios:config:calendario:publicar`, `cambios:crear-emergencia`).
* **Contrato propuesto:** Añadir constantes en `CAPACIDADES` de `src/shared/lib/capacidades.ts`.
* **Degradación mientras no exista:** Las páginas y endpoints emplean `CAPACIDADES.CAMBIOS_CONFIG_VER` y `CAPACIDADES.CAMBIOS_CONFIG_PUBLICAR`, mapeadas directamente en `CAPACIDADES_POR_PERFIL` para Administrador y Gestor de Cambios.

---

### SC-3: Atributos de Criticidad y Matriz Alternativa en Servicios
* **Módulo destino:** `servicios` (Miguel)
* **Qué se necesita:** Exposición de criticidad de servicio y soporte de matriz de prioridad parametrizable por proceso.
* **Contrato propuesto:** `obtenerServicioPorId(id: number)` incluye `{ criticidad: 'ALTA' | 'MEDIA' | 'BAJA' }`.
* **Degradación mientras no exista:** Se lee la criticidad directamente de la tabla `servicio_catalogo` mediante SQL de solo lectura acotado en el servicio de cambios.

---

### SC-4: Integración Bidireccional RFC ↔ Incidente
* **Módulo destino:** `incidentes` / `tickets` (Miguel)
* **Qué se necesita:** Creación automática de incidente ante fallo de cambio (vía contrato formal) y botón "Crear RFC desde incidente".
* **Contrato propuesto:** `crearIncidenteDesdeFallo(datos: DatosFalloCambio): Promise<string>;`
* **Degradación mientras no exista:** La configuración se almacena en el borrador/versión de cambios; si la integración no está montada, se registra el evento en auditoría y se solicita registro manual del incidente.

---

### SC-5: Registro de Ausencias y Suplencias de Técnicos
* **Módulo destino:** `organizacion` (Junior)
* **Qué se necesita:** Consulta de técnicos disponibles para comités CAB y asignaciones técnicas (`tecnico_ausencias`).
* **Contrato propuesto:** `esTecnicoDisponible(idTecnico: number, fecha: Date): Promise<boolean>;`
* **Degradación mientras no exista:** La asignación a comités se realiza sobre la lista de técnicos activos sin bloqueo por ausencia, alertando en la interfaz "Verificación de suplencia manual requerida".

---

### SC-6: Emisión de Eventos y Notificaciones Masivas
* **Módulo destino:** `plataforma` (Miguel)
* **Qué se necesita:** Disparador central de correos y avisos ante eventos `cambio.*` (ej. T-48h de interrupción a usuarios).
* **Contrato propuesto:** `emitirEventoPlataforma(evento: string, payload: any): Promise<void>;`
* **Degradación mientras no exista:** Se registran los eventos en la bitácora de la RFC (`cambio_bitacora` o historial), sin envío de correos directos hasta que la pasarela de notificación esté activa.

---

### SC-7: Origen Problema y Mapeo Automático
* **Módulo destino:** `problemas` (Alexis)
* **Qué se necesita:** Contrato de consulta de causas raíz y workaround de problemas vinculados para prellenado de RFC.
* **Contrato propuesto:** `obtenerProblemaParaRfc(idProblema: number): Promise<DatosProblemaParaRfc>;`
* **Degradación mientras no exista:** El usuario introduce el código del problema (`id_problema_origen`) y completa manualmente la justificación y planes de implementación.

---

### SC-8: Análisis de Impacto Profundo en CMDB
* **Módulo destino:** `cmdb` (Nain)
* **Qué se necesita:** Grafo de dependencias multinivel de CIs para análisis de colisiones (profundidad 2 o 3).
* **Contrato propuesto:** `obtenerGrafoDependenciasCi(idCi: number, profundidad: number): Promise<GrafoCi>;`
* **Degradación mientras no exista:** Se consulta directamente `ci_relacion` a nivel 1 (dependencia directa), indicando en el reporte de conflictos que el análisis multinivel está en fase básica.

---

### SC-9: Artículos de Conocimiento Vinculados
* **Módulo destino:** `conocimiento` (Alexis)
* **Qué se necesita:** Búsqueda y vinculación formal de guías de implementación (KEDB / KB) a modelos de cambio estándar.
* **Contrato propuesto:** `buscarArticulosKb(termino: string): Promise<ArticuloKbResumen[]>;`
* **Degradación mientras no exista:** El modelo de cambio estándar guarda la referencia como URL o identificador textual en `campos_adicionales`.

---

### SC-10: Promoción de Componentes Administrativos a `shared`
* **Módulo destino:** Tech Lead / `shared`
* **Qué se necesita:** Unificación formal de `BarraAccionesComun`, `ModalPublicacion` y modales de versionado en `@/shared/components/admin/`.
* **Contrato propuesto:** `@/shared/components/admin/` como única fuente de verdad para los tres módulos de procesos (`problemas`, `cambios`, `activos`).
* **Degradación mientras no exista:** `cambios` consume `@/shared/components/admin/` como importación común, garantizando código DRY.

---

### SC-11: Gobernanza del Calendario de Feriados Compartido
* **Módulo destino:** `servicios` / `tickets` (dueño de SLA)
* **Qué se necesita:** Contrato de lectura y sincronización de feriados institucionales para que el motor de SLA y el calendario de cambios compartan el 100% de los días inhábiles.
* **Contrato propuesto:** `calendario_feriados` como tabla unificada de PostgreSQL leída por ambos módulos.
* **Degradación mientras no exista:** Ya se encuentra resuelto: ambos procesos leen la misma tabla `calendario_feriados`.
