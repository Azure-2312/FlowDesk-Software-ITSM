# AUDITORÍA EXHAUSTIVA DE ARQUITECTURA ITSM: ITIL v4, ISO/IEC 20000 E ISO 27001

**Fecha de Auditoría:** 28 de Septiembre de 2026  
**Alcance:** Código Fuente (Next.js 14 / TypeScript), Esquema Relacional de Base de Datos (PostgreSQL), APIs REST, Middleware y Matriz RBAC / SoD.  
**Criterio de Evaluación:** Implementación real verificable en código fuente y base de datos (no asunciones por nombres de archivos o maquetas).

---

## 1. GESTIÓN DE INCIDENTES

| Componente | Estado | Evidencia encontrada (archivo / tabla) | Qué falta específicamente |
| :--- | :---: | :--- | :--- |
| **Registro multicanal** | [PARCIAL] | `ticket.canal_comunicacion` en BD con restricción CHECK (`PORTAL_WEB`, `CORREO_ELECTRONICO`, `LLAMADA_TELEFONICA`, `CHAT_EN_VIVO`, `SISTEMA_MONITOREO_AUTOMATICO`). Frontend: [crear/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/gestion/crear/page.tsx#L320). Backend: [api/tickets/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/route.ts#L347). | Falta un servicio listener de ingesta de correos (IMAP/POP3) y un endpoint API desatendido protegido por API Key para alertas de sistemas de monitoreo externo (Zabbix/Nagios). |
| **Clasificación por categoría / subcategoría** | [PARCIAL] | Tabla `categoria_ticket` y columna `ticket.id_categoria`. Formulario [crear/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/gestion/crear/page.tsx#L340). | Solo existe 1 nivel de taxonomía (`categoria_ticket`). Falta la columna autorreferencial `id_padre` en `categoria_ticket` o una tabla `subcategoria_ticket` para jerarquía de 2 niveles. |
| **Matriz de priorización** | [IMPLEMENTADO] | Tablas `impacto_ticket`, `urgencia_ticket`, `prioridad_ticket`. Motor matemático `calcularPrioridadITIL()` en [api/tickets/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/route.ts#L6-L20) y cálculo en vivo en [crear/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/gestion/crear/page.tsx#L8-L19). | Ninguno. Opera al 100% y se valida en backend previniendo manipulación de prioridad en cliente. |
| **Motor de SLA real** | [IMPLEMENTADO] | Motor [src/lib/sla.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/lib/sla.ts) con horario laboral (L-V 08:00–18:00). Columnas `fecha_limite_sla`, `tiempo_pausado_minutos`, `fecha_ultima_pausa`, `id_motivo_espera`. Tabla `motivo_espera_ticket`. Lógica de pausa/reanudación en [api/tickets/[id]/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/route.ts#L406-L429). | Ninguno. Pausa el reloj con motivo obligatorio y extiende la fecha límite en horas hábiles. |
| **Escalamiento automático de SLA** | [FALTA] | Detección visual en consultas SQL (`sla_vencido = fecha_limite_sla < NOW()`) en [api/tickets/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/route.ts#L173). Tablero de supervisión en [tecnicos/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/gestion/tecnicos/page.tsx). | Falta un worker o cron desatendido (ej. pg_cron o script programado) que evalúe tickets al 75% y 100% del SLA para reasignación jerárquica a Nivel 2/3 o alertas automáticas. |
| **Ciclo de vida de estados completo** | [PARCIAL] | Tabla `estado_ticket` (1: Abierto, 2: Asignado, 3: En proceso, 4: En espera, 5: Resuelto, 6: Cerrado, 7: Cancelado). Validaciones en [api/tickets/[id]/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/route.ts#L395-L460). | Falta una máquina de estados formal con matriz de transiciones válidas (`VALID_TRANSITIONS`) en backend para prohibir saltos ilógicos (ej. pasar directo de Cerrado a En Espera). |
| **Reapertura con ventana de 48h** | [FALTA] | Estado 6 (`CERRADO`) y 7 (`CANCELADO`) tienen `es_terminal = true`, lo que deshabilita los botones en [ModalDetalleTicket.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/components/ModalDetalleTicket.tsx#L782). | Falta el flujo de reapertura: si un ticket está en Resuelto (5), permitir al Solicitante reabrirlo a En Proceso (3) únicamente dentro de las primeras 48 horas tras `fecha_resolucion`. |
| **Vinculación con Base de Conocimiento** | [FALTA] | Existe la vista estática [tickets/gestion/ayuda/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/gestion/ayuda/page.tsx) para el solicitante. | Falta un buscador o motor de sugerencias automáticas de artículos de conocimiento en el formulario de creación y en la pantalla de atención del técnico. |
| **Notas públicas vs notas internas separadas** | [IMPLEMENTADO] | Columna `comentario_ticket.es_interno`. Filtro en backend en [api/tickets/[id]/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/route.ts#L144-L146) y control estricto en [api/tickets/[id]/comentarios/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/comentarios/route.ts#L40-L47). | Ninguno. Los solicitantes tienen vetada la creación y visualización de notas técnicas internas de TI. |
| **Encuesta de satisfacción (CSAT)** | [IMPLEMENTADO] | Columnas `ticket.calificacion_csat`, `ticket.comentario_csat`, `ticket.fecha_csat`. Formulario en [ModalDetalleTicket.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/components/ModalDetalleTicket.tsx#L656-L710). Métricas en [reportes/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/reportes/page.tsx#L125). | Ninguno. Opera al 100% con cálculo porcentual e historial. |
| **Campo de vinculación con Problema origen** | [FALTA] | La tabla `ticket` no posee columna `id_problema` ni existe tabla relacional. | Falta agregar la columna `id_problema INT REFERENCES problema(id_problema)` en la tabla `ticket`. |
| **Campo de vinculación con activos / CIs** | [PARCIAL] | Se captura como atributo de texto en `ticket.campos_adicionales->>'serie_o_patrimonio'`. | Falta la columna relacional formal `id_ci INT REFERENCES elemento_configuracion(id_ci)` o `id_activo` en la tabla `ticket`. |

---

## 2. GESTIÓN DE SOLICITUDES DE SERVICIO

| Componente | Estado | Evidencia encontrada (archivo / tabla) | Qué falta específicamente |
| :--- | :---: | :--- | :--- |
| **Catálogo de servicios navegable** | [IMPLEMENTADO] | Vista interactiva con iconos circulares, categorías, buscador y migas de pan en [tickets/catalogo/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/catalogo/page.tsx). | Ninguno. 100% funcional y alineado con ITIL v4. |
| **Ficha técnica por servicio** | [IMPLEMENTADO] | Tabla `servicio_catalogo` (entregable, SLA de resolución/respuesta, costo, aprobación) y `servicio_workflow_paso`. Visualizador en modal de [catalogo/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/catalogo/page.tsx#L615-L690). | Ninguno. 100% operativo. |
| **Formulario dinámico por servicio** | [IMPLEMENTADO] | [crear/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/gestion/crear/page.tsx#L23-L175) detecta familias (`HARDWARE`, `ACCESOS`, `REDES`, `SOFTWARE`, `CAMBIOS`, `GENERAL`). Guarda en `ticket.campos_adicionales` JSONB y se visualiza en [ModalDetalleTicket.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/components/ModalDetalleTicket.tsx#L761-L805). | Ninguno. Resuelve campos dinámicos técnicos según el servicio seleccionado. |
| **Flujo de aprobación con compuerta** | [IMPLEMENTADO] | Campo `servicio_catalogo.requiere_aprobacion`. Tabla `ticket_aprobacion`. Validación SoD en [api/tickets/[id]/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/route.ts#L248) y banner restrictivo en [ModalDetalleTicket.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/components/ModalDetalleTicket.tsx#L538-L555). | Ninguno. Impide la autoaprobación y registra bitácora formal de decisiones. |
| **Registro de fulfillment diferenciado** | [PARCIAL] | Tabla `tipo_ticket` separa Incidente de Solicitud. `ticket.id_paso_actual` rastrea el paso de atención. | Al dar por atendida una solicitud, el formulario exige `solucion_aplicada` (orientado a fallas) en lugar de un acta o confirmación de entrega de bienes/servicios. |
| **Seguimiento visible para el solicitante** | [IMPLEMENTADO] | Bandeja [tickets/gestion/mios/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/gestion/mios/page.tsx) y modal interactivo de consulta [ModalDetalleTicket.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/components/ModalDetalleTicket.tsx). | Ninguno. Muestra estado, aprobaciones, fecha límite SLA y comentarios públicos en tiempo real. |

---

## 3. GESTIÓN DE PROBLEMAS

| Componente | Estado | Evidencia encontrada (archivo / tabla) | Qué falta específicamente |
| :--- | :---: | :--- | :--- |
| **Entidad "Problema" separada de Incidente** | [FALTA] | La base de datos no contiene ninguna tabla `problema`. Solo existe la tabla `ticket` con tipos Incidente y Solicitud. | Falta crear la tabla `problema` con ciclo de vida propio (Registrado, En Investigación, Diagnóstico Conocido, Resuelto, Cerrado). |
| **Vinculación Problema ↔ Incidentes (1:N)** | [FALTA] | No existe tabla relacional ni campo foráneo. | Falta crear la tabla asociativa `problema_incidente (id_problema, id_ticket)` o columna `id_problema` en `ticket`. |
| **Campo estructurado de análisis de causa raíz (RCA)** | [FALTA] | Solo existe `ticket.categoria_resolucion` (VARCHAR plano) para incidentes. | Falta modelar campos específicos de causa raíz: Método de análisis (5 Porqués, Ishikawa), Causa Raíz Identificada, Componente de Falla. |
| **Concepto de "Error Conocido" (Known Error / KEDB)** | [FALTA] | No existe tabla ni repositorio KEDB en base de datos. | Falta la tabla `error_conocido (id_error_conocido, id_problema, sintomas, workaround, solucion_definitiva, estado_registro)`. |
| **Vinculación Problema ↔ Cambio (RFC)** | [FALTA] | No existe relación técnica modelada. | Falta columna `id_cambio` en la futura entidad `problema` para canalizar soluciones definitivas vía RFC. |
| **Creación de Problema desde Incidente** | [FALTA] | [ModalDetalleTicket.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/components/ModalDetalleTicket.tsx) no cuenta con botón o acción para escalar incidentes recurrentes a Problema. | Falta agregar botón "Promover a Problema" en la interfaz del técnico y su correspondiente endpoint de backend. |

---

## 4. GESTIÓN DE CAMBIOS (CHANGE ENABLEMENT)

| Componente | Estado | Evidencia encontrada (archivo / tabla) | Qué falta específicamente |
| :--- | :---: | :--- | :--- |
| **Entidad "RFC" separada y estructurada** | [PARCIAL] | Frontend maquetado con formulario completo de RFC en [cambios/gestion/crear/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/cambios/gestion/crear/page.tsx). | La tabla `cambio` o `rfc` **no existe en la base de datos** (actualmente opera en modo demostración/previsualización sin persistencia SQL). |
| **Clasificación por tipo (Estándar, Normal, Emergencia)** | [PARCIAL] | Maquetado en selector de [cambios/gestion/crear/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/cambios/gestion/crear/page.tsx#L50). | Falta persistir y gobernar los tipos de cambio en tabla de base de datos (`tipo_cambio`). |
| **Enrutamiento automático al perfil Aprobador (CAB)** | [PARCIAL] | Ruta `/cambios/gestion/cab` asignada exclusivamente al perfil `Aprobador` (id 7). | Falta la lógica de backend que filtre las RFCs Normales hacia el comite CAB y autoapruebe las Estándar preautorizadas. |
| **Regla de Autoexclusión SoD en Cambios** | [PARCIAL] | Implementada y activa en el módulo de Tickets/Aprobaciones. Documentada para Cambios en [perfiles_permisos_y_rutas.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/perfiles_permisos_y_rutas.md#L255). | Falta la validación en backend en el futuro endpoint `PATCH /api/cambios/[id]` para impedir que el autor o ejecutor del cambio vote en su propia evaluación CAB. |
| **Calendario de ventanas de mantenimiento** | [PARCIAL] | Vista de cronograma interactivo en [cambios/gestion/calendario/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/cambios/gestion/calendario/page.tsx). | Los datos del calendario son estáticos en React; falta conectarlo a la base de datos de RFCs programadas. |
| **Detección de conflictos (Change Freeze)** | [PARCIAL] | Indicador visual de congelamiento de cambios en [calendario/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/cambios/gestion/calendario/page.tsx#L32). | Falta un validador algorítmico que verifique solapamiento de fechas y colisiones sobre el mismo Elemento de Configuración (CI). |
| **Registro post-implementación (PIR)** | [PARCIAL] | Maquetado de estados (Exitoso, Fallido, Revertido) en [cambios/gestion/todos/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/cambios/gestion/todos/page.tsx). | Falta persistencia de los campos de revisión post-implementación (lecciones aprendidas, incidentes inducidos). |
| **Vinculación Cambio ↔ Problema / Incidente** | [PARCIAL] | Campo visual presente en la interfaz de [crear/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/cambios/gestion/crear/page.tsx). | Falta la relación de clave foránea `id_problema_origen` / `id_incidente_origen` en la tabla de cambios. |

---

## 5. GESTIÓN DE ACTIVOS Y CONFIGURACIÓN (CMDB)

| Componente | Estado | Evidencia encontrada (archivo / tabla) | Qué falta específicamente |
| :--- | :---: | :--- | :--- |
| **Inventario de activos como entidad propia** | [PARCIAL] | Vistas maquetadas de inventario en [activos/inventario/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/activos/inventario/page.tsx) y licencias en [activos/licencias/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/activos/licencias/page.tsx). | Las tablas `activo` y `licencia_software` **no existen en PostgreSQL**; la información es estática en cliente. |
| **Ciclo de vida del activo** | [PARCIAL] | Estados representados en interfaz gráfica (En Operación, En Stock, En Mantenimiento, Dado de Baja). | Falta la tabla de base de datos con máquina de estados del activo y asignación de custodio. |
| **Elementos de Configuración (CIs) modelados** | [PARCIAL] | Visualización de topología y dependencias en [activos/cmdb/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/activos/cmdb/page.tsx). | Falta la tabla `elemento_configuracion (id_ci, nombre, tipo_ci, ambiente, ip, version)` en base de datos. |
| **Relaciones y dependencias entre CIs** | [PARCIAL] | Topología jerárquica graficada en [activos/cmdb/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/activos/cmdb/page.tsx). | Falta la tabla de dependencias relacionales `ci_relacion (id_ci_padre, id_ci_hijo, tipo_relacion)`. |
| **Vinculación de CIs a Incidentes / Cambios** | [PARCIAL] | Campo de texto en `ticket.campos_adicionales`. | Falta clave foránea formal `id_ci` en `ticket` y en la futura tabla `cambio`. |
| **Alertas de vencimiento de garantías y licencias** | [PARCIAL] | Distinción visual con colores de alerta en [activos/licencias/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/activos/licencias/page.tsx). | Falta un worker que calcule automáticamente días restantes y genere alertas preventivas antes del vencimiento. |

---

## 6. GESTIÓN DEL CONOCIMIENTO

| Componente | Estado | Evidencia encontrada (archivo / tabla) | Qué falta específicamente |
| :--- | :---: | :--- | :--- |
| **Repositorio de artículos de conocimiento** | [PARCIAL] | Portal de autoservicio y preguntas frecuentes con buscador en [tickets/gestion/ayuda/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/gestion/ayuda/page.tsx). | No existe tabla `articulo_conocimiento` en PostgreSQL; los artículos están codificados en el componente React. |
| **Vinculación artículo ↔ incidente / problema** | [FALTA] | Al resolver un ticket se captura `solucion_aplicada`, pero no se enlaza con artículos. | Falta opción para convertir una solución de ticket en borrador de artículo o asociar un artículo existente al ticket. |
| **Control de versiones y flujo editorial** | [FALTA] | No existe flujo editorial implementado. | Falta el circuito: Técnico redacta borrador -> Supervisor/Gestor de Conocimiento revisa y aprueba -> Publicación en catálogo. |

---

## 7. RBAC Y SEGURIDAD

### Verificación de Perfiles en Base de Datos
Consulta directa a la tabla `perfiles` en PostgreSQL:

| id_perfil | Perfil en Base de Datos | Rol ITIL v4 Equivalente | Estado en BD |
| :---: | :--- | :--- | :---: |
| 1 | Administrador | Custodio de plataforma / Gobierno de TI | [IMPLEMENTADO] |
| 2 | Tecnico | Process Practitioner (Incidentes, Solicitudes) | [IMPLEMENTADO] |
| 3 | Solicitante | Usuario final / Cliente interno | [IMPLEMENTADO] |
| 4 | Supervisor | Process Manager de Incidentes y Solicitudes | [IMPLEMENTADO] |
| 5 | Gestor de Area | Aprobador de negocio (Compuertas de Servicio) | [IMPLEMENTADO] |
| 6 | Auditor | Control de cumplimiento normativo (Solo lectura) | [IMPLEMENTADO] |
| 7 | Aprobador | Change Authority (Comité CAB) | [IMPLEMENTADO] |
| 8 | Gestor de Cambios | Change Manager | [IMPLEMENTADO] |
| 9 | Gestor de Activos y Configuracion | IT Asset Manager / Configuration Manager | [IMPLEMENTADO] |

Los **9 perfiles requeridos ya existen y se encuentran activos** en la tabla `perfiles`.

### Matriz de Capacidades: Verificación Real en Código

| Capacidad | Solicitante | Técnico | Supervisor | Gestor Área | Auditor | Admin | Aprobador | Gestor Cambios | Gestor Activos | Estado de Implementación |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Crear tickets / solicitudes** | Sí | No | No | Sí | No | No | No | No | No | [IMPLEMENTADO] (Ruta `/tickets/gestion/crear` en menú y formulario activo). |
| **Resolver tickets asignados** | No | Sí | Sí | No | No | No | No | No | No | [IMPLEMENTADO] (Validado en backend [api/tickets/[id]/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/route.ts#L355)). |
| **Tomar tickets de bandeja (pull)**| No | Sí | No | No | No | No | No | No | No | [IMPLEMENTADO] (Validado en backend [api/tickets/[id]/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/route.ts#L337)). |
| **Reasignar tickets / balancear WIP**| No | No | Sí | No | No | No | No | No | No | [IMPLEMENTADO] (Validado en backend [api/tickets/[id]/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/route.ts#L344)). |
| **Aprobar Solicitudes de Servicio**| No | No | No | Sí | No | No | No | No | No | [IMPLEMENTADO] (Validado en backend [api/tickets/[id]/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/route.ts#L240)). |
| **Crear RFC (Solicitud de Cambio)**| No | Sí | No | No | No | No | No | Sí | No | [PARCIAL] (Menús 28 asignados a Técnico y Gestor de Cambios; Admin excluido por SoD. Falta backend). |
| **Aprobar / rechazar Cambios (CAB)**| No | No | No | No | No | No | Sí | No | No | [PARCIAL] (Menú 29 asignado a Aprobador CAB. Falta backend de votación). |
| **Programar ventana de cambio** | No | No | No | No | No | Sí | Sí | Sí | No | [PARCIAL] (Vista de calendario accesible. Falta backend). |
| **Ejecutar el cambio técnicamente**| No | Sí | No | No | No | No | No | No | No | [FALTA] (No existe módulo de ejecución técnica de cambios). |
| **Crear registro de Problema** | No | Sí | No | No | No | No | No | No | No | [FALTA] (No existe entidad Problema). |
| **Asignar / balancear Problemas** | No | No | Sí | No | No | No | No | No | No | [FALTA] (No existe entidad Problema). |
| **Mantener inventario de activos** | No | No | No | No | No | Sí | No | No | Sí | [PARCIAL] (Menú 32 asignado a Gestor de Activos y Admin. Falta backend). |
| **Mapear relaciones CMDB** | No | No | No | No | No | Sí | No | No | Sí | [PARCIAL] (Menú 33 asignado a Gestor de Activos y Admin. Falta backend). |
| **Consultar auditoría / logs** | No | No | Sí | No | Sí | Sí | No | No | No | [IMPLEMENTADO] (Rutas `/admin/seguridad-logs` y `/tickets/gestion/auditoria` activas). |
| **Gestionar usuarios y perfiles** | No | No | No | No | No | Sí | No | No | No | [IMPLEMENTADO] (Rutas `/admin/usuarios`, `/admin/perfiles`, `/admin/menu` exclusivas de Admin). |

### Verificación de Reglas SoD en Código
1. **El Solicitante nunca puede aprobar su propia solicitud:**
   - Evidencia: [src/app/api/tickets/[id]/route.ts](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/api/tickets/%5Bid%5D/route.ts#L248) devuelve HTTP 403 `Violación de Segregación de Funciones (SoD)`. En frontend, [ModalDetalleTicket.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/components/ModalDetalleTicket.tsx#L538) oculta los botones y muestra banner de advertencia. **[IMPLEMENTADO Y BLINDADO]**.
2. **El Gestor de Área solo puede aprobar solicitudes de su propio departamento:**
   - Evidencia: La API valida el perfil (`[1, 4, 5].includes(idPerfilActivo)`), pero la tabla `usuario` no cuenta aún con columna `id_departamento`, por lo que actualmente no puede validar pertenencia departamental estricta. **[PARCIAL]**.
3. **El Auditor no debe tener ningún botón de edición/creación:**
   - Evidencia: El Auditor tiene denegadas las acciones operativas en [ModalDetalleTicket.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/components/ModalDetalleTicket.tsx#L78) (`puedeOperar = false`). Los endpoints de mutación rechazan al Auditor con 403. **[IMPLEMENTADO]**.
4. **El Aprobador CAB nunca puede ser autor o ejecutor del mismo Cambio:**
   - Evidencia: Documentado en matriz de requerimientos y SoD, pero pendiente de validación en backend al implementarse la tabla `cambio`. **[PARCIAL]**.

---

## 8. TRANSVERSALES

| Componente | Estado | Evidencia encontrada (archivo / tabla) | Qué falta específicamente |
| :--- | :---: | :--- | :--- |
| **Reportes / KPIs** | [IMPLEMENTADO] | [tickets/reportes/page.tsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/app/%28app%29/tickets/reportes/page.tsx) calcula MTTA, MTTR, porcentaje de cumplimiento de SLA, CSAT promedio, desglose por estado, prioridad, canal y departamento. | Ninguno. Opera en tiempo real con datos de PostgreSQL. |
| **Notificaciones en cambios de estado**| [PARCIAL] | Se inserta registro en `comentario_ticket` cada vez que cambia el estado o se emite una aprobación. | No existe servicio de transporte SMTP (Nodemailer/SendGrid) para envío de correos electrónicos ni WebPush. |
| **Log de auditoría inmutable** | [IMPLEMENTADO] | Tabla `log_acceso` (inicios de sesión, IP, user-agent). Tablas `ticket_aprobacion`, `comentario_ticket` y `adjunto_ticket` utilizan `now()` inalterable en PostgreSQL. | Ninguno. Los registros de auditoría son de solo inserción (append-only). |

---

## RESUMEN PRIORIZADO: ORDEN DE CONSTRUCCIÓN

Considerando las dependencias técnicas entre módulos ITIL, el orden recomendado de implementación es:

```
[FASE 1: ESQUEMA BASE DE DATOS]
  ├─ Crear tablas: problema, cambio, activo, elemento_configuracion
  └─ Añadir claves foráneas en tabla ticket (id_problema, id_ci)
           │
           ▼
[FASE 2: GESTIÓN DE PROBLEMAS] ◄── Prerrequisito indispensable para Cambios y KEDB
  ├─ Registro de Problemas con causa raíz (RCA) y Workaround
  ├─ Vinculación con Incidentes recurrentes
  └─ Conversión a Error Conocido (KEDB)
           │
           ▼
[FASE 3: GESTIÓN DE CAMBIOS (CHANGE ENABLEMENT)]
  ├─ Persistencia y ciclo de vida de RFCs vinculadas a Problemas/CIs
  ├─ Compuerta de votación CAB con regla de autoexclusión SoD en BD
  └─ Detección de colisiones en calendario de ventanas (Change Freeze)
           │
           ▼
[FASE 4: CMDB Y GESTIÓN DE ACTIVOS]
  ├─ Persistencia de CIs y topología de dependencias
  ├─ Ciclo de vida y auditoría de licencias/garantías con alertas
  └─ Integración bidireccional con Tickets y Cambios
           │
           ▼
[FASE 5: GESTIÓN DEL CONOCIMIENTO (KEDB)]
  ├─ Repositorio de artículos con flujo editorial (Borrador -> Aprobado)
  └─ Integración de sugerencias predictivas en la mesa de ayuda
           │
           ▼
[FASE 6: AUTOMATIZACIONES Y NOTIFICACIONES]
  ├─ Cron desatendido de escalamiento automático por vencimiento de SLA
  ├─ Flujo de reapertura de tickets en ventana de 48 horas post-resolución
  └─ Integración de notificaciones por correo electrónico (SMTP)
```

---

## CAMBIOS DE ESQUEMA NECESARIOS EN BASE DE DATOS

Para cerrar la totalidad de las brechas detectadas se requieren las siguientes modificaciones DDL:

### 1. Tablas Nuevas a Crear
```sql
-- 1. Gestión de Problemas
CREATE TABLE problema (
    id_problema SERIAL PRIMARY KEY,
    codigo_problema VARCHAR(30) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    id_impacto INT REFERENCES impacto_ticket(id_impacto),
    id_urgencia INT REFERENCES urgencia_ticket(id_urgencia),
    id_prioridad INT REFERENCES prioridad_ticket(id_prioridad),
    id_estado INT NOT NULL DEFAULT 1,
    causa_raiz TEXT,
    metodo_analisis VARCHAR(50), -- 5_WHYS, ISHIKAWA, ARBOL_FALLAS
    workaround TEXT,
    es_error_conocido BOOLEAN NOT NULL DEFAULT false,
    id_usuario_asignado INT REFERENCES usuario(id_usuario),
    id_departamento INT REFERENCES departamento_ti(id_departamento),
    usuario_creacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    usuario_modificacion INT REFERENCES usuario(id_usuario),
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE problema_incidente (
    id_problema INT REFERENCES problema(id_problema),
    id_ticket INT REFERENCES ticket(id_ticket),
    fecha_asociacion TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id_problema, id_ticket)
);

-- 2. Gestión de Cambios (Change Enablement)
CREATE TABLE cambio (
    id_cambio SERIAL PRIMARY KEY,
    codigo_cambio VARCHAR(30) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo_cambio VARCHAR(20) NOT NULL CHECK (tipo_cambio IN ('ESTANDAR', 'NORMAL', 'EMERGENCIA')),
    id_impacto INT REFERENCES impacto_ticket(id_impacto),
    id_urgencia INT REFERENCES urgencia_ticket(id_urgencia),
    id_prioridad INT REFERENCES prioridad_ticket(id_prioridad),
    id_estado INT NOT NULL DEFAULT 1, -- 1: Solicitado, 2: En Evaluacion CAB, 3: Aprobado, 4: En Ejecucion, 5: Exitoso, 6: Fallido, 7: Revertido, 8: Cancelado
    justificacion TEXT NOT NULL,
    plan_implementacion TEXT NOT NULL,
    plan_rollback TEXT NOT NULL,
    plan_pruebas TEXT,
    ventana_inicio TIMESTAMPTZ NOT NULL,
    ventana_fin TIMESTAMPTZ NOT NULL,
    id_problema_origen INT REFERENCES problema(id_problema),
    id_incidente_origen INT REFERENCES ticket(id_ticket),
    id_usuario_solicitante INT NOT NULL REFERENCES usuario(id_usuario),
    id_usuario_responsable INT REFERENCES usuario(id_usuario),
    resultado_pir TEXT,
    usuario_creacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    usuario_modificacion INT REFERENCES usuario(id_usuario),
    fecha_modificacion TIMESTAMPTZ,
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE cambio_aprobacion (
    id_cambio_aprobacion SERIAL PRIMARY KEY,
    id_cambio INT NOT NULL REFERENCES cambio(id_cambio),
    id_usuario_aprobador INT NOT NULL REFERENCES usuario(id_usuario),
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('APROBADO', 'RECHAZADO', 'OBSERVADO')),
    comentario TEXT NOT NULL,
    fecha_decision TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

-- 3. Gestión de Activos y CMDB
CREATE TABLE activo (
    id_activo SERIAL PRIMARY KEY,
    codigo_patrimonial VARCHAR(50) UNIQUE NOT NULL,
    numero_serie VARCHAR(100),
    tipo_activo VARCHAR(50) NOT NULL, -- LAPTOP, DESKTOP, SERVIDOR, SWITCH, IMPRESORA
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    id_departamento INT REFERENCES departamento_ti(id_departamento),
    id_usuario_custodio INT REFERENCES usuario(id_usuario),
    estado_activo VARCHAR(30) NOT NULL DEFAULT 'EN_OPERACION', -- EN_OPERACION, EN_STOCK, MANTENIMIENTO, BAJA
    fecha_adquisicion DATE,
    fecha_fin_garantia DATE,
    costo_compra NUMERIC(12,2),
    usuario_creacion INT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE elemento_configuracion (
    id_ci SERIAL PRIMARY KEY,
    id_activo INT REFERENCES activo(id_activo),
    codigo_ci VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo_ci VARCHAR(50) NOT NULL, -- SERVICIO_TI, SERVIDOR_LOGICO, APLICACION, BASE_DATOS, NODO_RED
    ambiente VARCHAR(20) NOT NULL CHECK (ambiente IN ('PRODUCCION', 'QA', 'DESARROLLO')),
    ip_principal VARCHAR(45),
    version_software VARCHAR(50),
    criticidad VARCHAR(20) NOT NULL CHECK (criticidad IN ('CRITICA', 'ALTA', 'MEDIA', 'BAJA')),
    id_departamento_soporte INT REFERENCES departamento_ti(id_departamento),
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE ci_relacion (
    id_ci_padre INT NOT NULL REFERENCES elemento_configuracion(id_ci),
    id_ci_hijo INT NOT NULL REFERENCES elemento_configuracion(id_ci),
    tipo_relacion VARCHAR(50) NOT NULL, -- DEPENDE_DE, ALBERGA_A, CONECTADO_CON
    PRIMARY KEY (id_ci_padre, id_ci_hijo)
);

CREATE TABLE licencia_software (
    id_licencia SERIAL PRIMARY KEY,
    nombre_software VARCHAR(150) NOT NULL,
    fabricante VARCHAR(100) NOT NULL,
    clave_licencia VARCHAR(255),
    tipo_licencia VARCHAR(50) NOT NULL, -- PERPETUA, SUSCRIPCION_ANUAL, POR_VOLUMEN, OEM
    cantidad_adquirida INT NOT NULL,
    cantidad_en_uso INT NOT NULL DEFAULT 0,
    fecha_vencimiento DATE,
    estado_registro BOOLEAN NOT NULL DEFAULT true
);

-- 4. Gestión del Conocimiento
CREATE TABLE articulo_conocimiento (
    id_articulo SERIAL PRIMARY KEY,
    codigo_articulo VARCHAR(30) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido_markdown TEXT NOT NULL,
    id_categoria INT REFERENCES categoria_ticket(id_categoria),
    id_problema_origen INT REFERENCES problema(id_problema),
    estado_editorial VARCHAR(20) NOT NULL DEFAULT 'BORRADOR' CHECK (estado_editorial IN ('BORRADOR', 'EN_REVISION', 'PUBLICADO', 'ARCHIVADO')),
    id_autor INT NOT NULL REFERENCES usuario(id_usuario),
    id_revisor INT REFERENCES usuario(id_usuario),
    fecha_publicacion TIMESTAMPTZ,
    vistas INT NOT NULL DEFAULT 0,
    utilidad_positiva INT NOT NULL DEFAULT 0,
    utilidad_negativa INT NOT NULL DEFAULT 0,
    estado_registro BOOLEAN NOT NULL DEFAULT true
);
```

### 2. Modificaciones en Tablas Existentes
```sql
-- Agregar claves foráneas en tabla ticket
ALTER TABLE ticket ADD COLUMN id_problema INT REFERENCES problema(id_problema);
ALTER TABLE ticket ADD COLUMN id_ci INT REFERENCES elemento_configuracion(id_ci);
ALTER TABLE ticket ADD COLUMN fecha_reapertura TIMESTAMPTZ;
ALTER TABLE ticket ADD COLUMN motivo_reapertura TEXT;

-- Agregar pertenencia departamental en tabla usuario para validación SoD del Gestor de Área
ALTER TABLE usuario ADD COLUMN id_departamento INT REFERENCES departamento_ti(id_departamento);

-- Agregar jerarquía autorreferencial de subcategorías
ALTER TABLE categoria_ticket ADD COLUMN id_padre INT REFERENCES categoria_ticket(id_categoria);
```

---

## VERIFICACIÓN ESPECÍFICA DE PERFILES Y RUTAS

1. **Tabla `perfiles`:**
   - La tabla `perfiles` **YA POSEE las 9 filas** exactamente con sus códigos oficiales:
     - Fila 7: `Aprobador` (Change Authority / CAB).
     - Fila 8: `Gestor de Cambios` (Change Manager).
     - Fila 9: `Gestor de Activos y Configuracion` (IT Asset / Configuration Manager).
   - **No se requiere insertar nuevos perfiles; los 9 están creados y activos.**

2. **Tabla `opciones_menu`:**
   - **YA POSEE** las 10 rutas correspondientes a Cambios y Activos:
     - `/cambios` (id 25)
     - `/activos` (id 26)
     - `/cambios/gestion` (id 27)
     - `/cambios/gestion/crear` (id 28)
     - `/cambios/gestion/cab` (id 29)
     - `/cambios/gestion/calendario` (id 30)
     - `/cambios/gestion/todos` (id 31)
     - `/activos/inventario` (id 32)
     - `/activos/cmdb` (id 33)
     - `/activos/licencias` (id 34)

3. **Tabla `opciones_menu_perfiles`:**
   - **YA SE ENCUENTRAN ASIGNADAS** con la segregación de funciones (SoD):
     - `Aprobador` (id 7): Tiene asignadas `/cambios`, `/cambios/gestion`, `/cambios/gestion/cab`, `/cambios/gestion/calendario`, `/cambios/gestion/todos`.
     - `Gestor de Cambios` (id 8): Tiene asignadas `/cambios`, `/cambios/gestion`, `/cambios/gestion/crear`, `/cambios/gestion/calendario`, `/cambios/gestion/todos`.
     - `Gestor de Activos y Configuración` (id 9): Tiene asignadas `/activos`, `/activos/inventario`, `/activos/cmdb`, `/activos/licencias`.
     - `Técnico` (id 2): Tiene asignadas `/cambios`, `/cambios/gestion`, `/cambios/gestion/crear`, `/cambios/gestion/todos`.
     - `Administrador` (id 1): Tiene asignadas las vistas de supervisión de infraestructura y CMDB (`/cambios`, `/cambios/gestion`, `/cambios/gestion/calendario`, `/cambios/gestion/todos`, `/activos`, `/activos/inventario`, `/activos/cmdb`, `/activos/licencias`), habiendo sido excluido de `Crear RFC` y `CAB` por normativa SoD.
   - **No se requieren nuevas asignaciones de menú; la matriz está 100% configurada.**
