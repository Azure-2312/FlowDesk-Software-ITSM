# Auditoría integral del sistema ITSM

**Fecha:** 30 de septiembre de 2026  
**Alcance:** revisión estática de documentación, interfaz Next.js, API, autenticación/autorización, esquema/semillas SQL, migraciones y módulos del repositorio.  
**Dictamen:** base funcional prometedora para un prototipo ITSM; todavía no es segura ni consistente para operación institucional. Los principales riesgos son la autorización en servidor, la segregación de roles, la exposición de información, la reproducibilidad de la base y los controles operativos. Esta revisión no certifica conformidad con ITIL ni con normas ISO.

**Actualización de implementación:** después de la primera revisión se aplicaron correcciones en el código para los accesos administrativos, las bandejas y detalle de tickets, comentarios, asignación/acciones, perfiles 7–9, RFC/CAB, problemas, activos/CMDB/licencias, secretos y esquema. Los hallazgos marcados abajo como corregidos describen el estado previo y su cambio en código; siguen pendientes la ejecución de la migración en la base existente y la validación de comportamiento con cuentas por rol. Esta actualización no convierte la revisión estática en una prueba ni en una certificación.

> No se ejecutó el sistema, no se probaron endpoints y no se consultó la base desplegada. “El esquema define” se refiere a `db/schema.sql`, no necesariamente a la instancia Supabase. Las conclusiones son estáticas; las pruebas de ejecución son una fase pendiente.

## 1. Dictamen ejecutivo

La evolución de “tickets” a “ITSM” ya está reflejada en el modelo: catálogo de servicios, incidentes/solicitudes, aprobaciones, cambios RFC/CAB, problemas/KEDB, activos, CMDB, conocimiento y datos de SLA. La dirección funcional es válida. Sin embargo, varias especificaciones prometen más cobertura de la comprobable; los nueve perfiles están nombrados de forma divergente entre documentos/código; y las API no aplican una política uniforme de rol y ámbito. Una vista o un menú oculto no protegen el endpoint.

**Riesgo global actual: alto hasta validar en ejecución para permisos y datos; medio-alto para integridad/operación; medio para coherencia funcional.** El código ahora separa las vistas de ticket por los perfiles operativos 1–6 y rechaza el acceso de ticket para 7–9. Las brechas restantes son de validación integral, transacciones, trazabilidad y consistencia documental.

### Hallazgos prioritarios

1. **Crítico en revisión inicial — privilegios administrativos. Corregido en código, falta validar.** CRUD de usuarios, perfiles y menú ahora exige el perfil Administrador (1). Las rutas de desbloqueo/configuración y otras APIs deben seguir auditándose bajo una política común. Véanse [usuarios/route.ts](../src/app/api/usuarios/route.ts), [perfiles/route.ts](../src/app/api/perfiles/route.ts) y [menu/admin/route.ts](../src/app/api/menu/admin/route.ts).
2. **Crítico en revisión inicial — tickets y comentarios. Corregido parcialmente en código, falta validar.** El PATCH ahora usa listas de campos y transiciones por perfil; comentarios validan titular, asignación o ámbito departamental; la asignación de técnicos se limita a supervisor y técnico (autoasignación elegible). Aún deben verificarse concurrencia, integridad transaccional y todos los flujos reales. Véanse [comentarios/route.ts](../src/app/api/tickets/%5Bid%5D/comentarios/route.ts) y [tickets/[id]/route.ts](../src/app/api/tickets/%5Bid%5D/route.ts).
3. **Alto en revisión inicial — exposición del detalle. Corregido parcialmente en código, falta validar.** El detalle ahora comprueba perfil y relación con el ticket, oculta notas internas salvo técnico/supervisor y no devuelve Base64 de adjuntos a perfiles no operativos. Falta revisar autorización de descarga, retención y escaneo de archivos.
4. **Alto en revisión inicial — perfiles 7–9. Corregido en presentador/menú/código de dominio.** CAB (7), Gestor de Cambios (8) y Gestor de Activos y Configuración (9) ya no heredan presentación de técnico; las APIs de RFC/CAB y activos aplican permisos separados. El presentador de ticket hace fallback de solo lectura para perfiles sin flujo operativo. Debe validarse con usuarios reales y el esquema de permisos de cada instancia.
5. **Alto en revisión inicial — secreto de base de datos hardcodeado. Corregido en repositorio, rotación externa pendiente.** [migracion_motivo_inactivacion.js](../scripts/migracion_motivo_inactivacion.js) ya no tiene URI de conexión por defecto y exige `DATABASE_URL`. La credencial expuesta debe rotarse por fuera del repositorio y revisarse en historial/copias.
6. **Alto en revisión inicial — columna SLA. Corregido en la consulta del listado.** Se unificó con `fecha_limite_sla` que declara [schema.sql](../db/schema.sql); queda verificar que el despliegue use el mismo esquema.
7. **Alto — las auditorías anteriores declaran “100%” sin evidencia actual.** `auditoria_final_parcial_matriz_maestra.md` incluye rutas y perfiles que ya no reflejan el árbol del proyecto, y cuenta pantallas “no funcionales” como cumplimiento total. No usar su porcentaje como estado del producto sin una nueva verificación.

## 2. Qué está bien encaminado

- Separación de `usuario`, `perfiles`, `usuario_perfiles` y permisos de menú; permite varios roles y perfil activo. El seed define nueve perfiles.
- bcrypt, JWT en cookie HttpOnly, expiración, control de intentos y validación de que el perfil a activar pertenece al usuario. Buena base, insuficiente por sí sola para autorizar operaciones, revocar sesiones o proteger secretos.
- Uso frecuente de consultas SQL parametrizadas, que reduce inyección SQL; no resuelve controles de acceso, validación de dominio ni privacidad.
- Incidente y solicitud de servicio se distinguen; existen impacto, urgencia, prioridad, estado, servicio y departamento. La prioridad se calcula en backend al crear el ticket.
- Están presentes conceptos ITSM relevantes: catálogo y workflow, aprobaciones, SLA, notas internas/públicas, problemas, cambios, activos/CI, licencias y conocimiento.
- Hay presentadores separados de ticket para consumidor, operador, supervisor, gobernanza y administrador, además de secciones reutilizables. La divulgación por tarea es una buena decisión de diseño.
- La decisión de aprobación se persiste en `ticket_aprobacion` con usuario, decisión, fecha y comentario.
- El ciclo de vida contempla espera, resolución, cierre, CSAT y reapertura; requiere controles más estrictos y persistencia transaccional.
- La documentación cubre requisitos, reglas, historias, catálogo, menús, vistas, marcos y walkthrough. Falta consolidar su autoridad, estado y trazabilidad.

## 3. Nueve roles y menú objetivo

Los perfiles representan responsabilidades. Si una persona tiene varios, cada petición opera con el rol activo; la política debe comprobar también titularidad, equipo/departamento, asignación o delegación. No conceder acceso a registros globales por tener un rol con nombre amplio.

| ID / rol oficial | Debe ver y hacer | Menú recomendado | No debe obtener por defecto |
|---|---|---|---|
| **1 Administrador** | Identidades, perfiles, configuración, permisos y auditoría técnica | Administración: usuarios, roles, permisos, menú, servicios, formularios, configuración y logs | Aprobar CAB o negocio por ser administrador; operar tickets salvo permiso break-glass auditado/rol adicional |
| **2 Técnico** | Tickets asignados y cola elegible de su equipo; diagnóstico, notas internas, espera, solución y resolución | Mesa: mis asignados, cola del equipo, historial autorizado, conocimiento y CI de lectura | Reasignar a otros, editar identidades/configuración, ver tickets globales o aprobar su propio trabajo |
| **3 Solicitante** | Catálogo, sus propios registros, mensajes públicos, evidencia, respuesta, conformidad y CSAT | Portal: catálogo, nueva solicitud/incidente, mis solicitudes, ayuda, perfil/notificaciones | Notas internas, tickets ajenos, colas, despacho, administración o datos personales de otros |
| **4 Supervisor** | Colas y capacidad de su ámbito, despacho, reasignación, escalamiento y métricas de soporte | Operación: colas, asignación, técnicos, SLA, reportes del equipo | Cambios globales de configuración o acceso universal sin ámbito |
| **5 Gestor de Área** | Solicitudes/aprobaciones de su departamento, impacto y niveles del servicio | Gobernanza: aprobaciones asignadas, solicitudes del área, SLA/CSAT | Notas internas, tickets de otros departamentos, modificar solución o asignar técnicos |
| **6 Auditor** | Solo lectura de eventos, evidencias, historial y reportes permitidos, con trazabilidad | Auditoría y analítica: bitácora, exportaciones aprobadas, cumplimiento | Mutar datos, asignar, aprobar, comentar o ver secretos/adjuntos fuera de alcance |
| **7 Aprobador CAB** | RFC asignadas, riesgos, CI afectados, planes/rollback y votos CAB | Cambios: bandeja CAB, detalle RFC, calendario y decisiones | Aprobar solicitudes ordinarias por el solo hecho de ser CAB; votar en conflicto de interés |
| **8 Gestor de Cambios** | Preparar RFC, analizar riesgo, coordinar calendario/ventanas, CAB y PIR | Gestión de cambios: RFC, calendario, freezes, PIR e indicadores | Votar su propio RFC; consola técnica de tickets o edición de activos sin otro rol |
| **9 Gestor de Activos y Configuración** | HAM/SAM/CMDB, relaciones, ciclo de vida y vínculo de CI con servicios | Activos/configuración: inventario, licencias, CMDB, relaciones e historial | Despacho de tickets, notas internas globales, voto CAB o aprobación de negocio |

### Menú sembrado actualmente (seed.sql)

El siguiente inventario refleja las opciones que el `seed.sql` activa por perfil; no garantiza por sí solo que una instancia existente haya ejecutado el seed. Las rutas padre abren el módulo y las opciones hijas son las páginas enlazadas.

| Perfil | Módulos y opciones actualmente asignados |
|---|---|
| 1 Administrador | Todos: mesa de servicio, cambios, activos/CMDB, reportes y administración. |
| 2 Técnico | Mesa: autoservicio/crear/ayuda, operación (asignados, bandeja, tickets de departamento, resueltos); cambios (solicitudes RFC, calendario e historial); lectura de inventario y CMDB. No tiene despacho/admin en menú. |
| 3 Solicitante | Portal: catálogo, registrar solicitud, mis solicitudes y guías de autoayuda. |
| 4 Supervisor | Mesa: pendientes, historial, despacho, monitoreo técnico, todos y auditoría; consulta/cambio RFC; reportes; organización/capacidad (departamentos y técnicos). |
| 5 Gestor de Área | Portal/mesa, crear y consultar solicitudes propias, aprobaciones y tickets departamentales; reportes. |
| 6 Auditor | Mesa y auditoría forense; consulta de RFC; inventario y licencias sin claves; reportes; lectura de catálogo/servicios y logs de seguridad. |
| 7 Aprobador CAB | Gestión de cambios, historial/calendario, comité y dictamen CAB; lectura CMDB para impacto. |
| 8 Gestor de Cambios | Solicitudes RFC, calendario, historial, CAB en lectura y CMDB para evaluar impacto. La página CAB no muestra acción de voto y la API tampoco permite emitirlo. |
| 9 Gestor de Activos y Configuración | Inventario de hardware, CMDB/topología, relaciones y licencias. |

**Desajustes a vigilar:** el menú del Auditor contiene áreas de administración/catálogo que deben permanecer de solo lectura; la API de licencias se abrió a perfil 6 solo para lectura y su respuesta omite la clave. El Técnico conserva menú de RFC y lectura de activos/CMDB por alcance sembrado, pero no puede operar activos ni ver RFC ajenas. Los menús se deben reconciliar en cualquier base ya existente mediante seed o migración.

### Jerarquía de navegación recomendada

- **Portal de servicio:** catálogo publicado; nueva solicitud/incidente; mis solicitudes; base de conocimiento; perfil/notificaciones.
- **Mesa de servicio:** bandeja del equipo; mis asignados; detalle con acciones habilitadas; problemas/KEDB con permisos definidos.
- **Gobierno del servicio:** aprobaciones asignadas; servicios/niveles; indicadores departamentales.
- **Gestión de cambios:** RFC; evaluación CAB; calendario/ventanas/congelamiento; PIR.
- **Activos y configuración:** inventario; licencias; CMDB/relaciones; historial CI.
- **Analítica y auditoría:** reportes según ámbito; actividad y evidencia; exportaciones auditadas.
- **Administración:** identidades/perfiles; políticas; catálogo/formularios; notificaciones; configuración; mantenimiento controlado.

Mostrar padres solo si contienen una opción autorizada. Proteger rutas directas y cada operación en servidor; el menú no es una medida de seguridad.

## 4. Diferencias actuales entre vistas y acciones de ticket

### Verificación en el código

- [ModalDetalleTicket.tsx](../src/components/ModalDetalleTicket.tsx) elige una vista según `perfilActivo` y delega a cinco presentadores. Hay diferenciación real, pero parcial.
- El mapeo actual después de la corrección: 1 administrador; 2 técnico; 3 solicitante; 4 supervisor; 5 gobernanza; 6 auditor. Perfiles 7–9 no reciben acciones operativas de ticket y el presentador cae a solo lectura; sus interfaces de trabajo son CAB, Cambios y Activos.
- [BarraAccionesOperativas.tsx](../src/components/ticket-detail/secciones/BarraAccionesOperativas.tsx) presenta acciones operativas a supervisor/admin y autoasignación a técnico. Es una distinción adecuada en principio; API aún debe validar cola, equipo, estado, aprobación y capacidad.
- `VistaTicketGobernanza` comparte estructura entre gestor de área y auditor, pero ahora distingue el perfil 6 en modo de solo lectura y oculta el formulario de comentario; perfil 5 mantiene la conversación pública y su aprobación de área. `TarjetaAprobacionSod` autoriza visualmente 1/4/5; el backend acepta solo 4/5 para dictaminar, mientras que el Administrador permanece observador.
- Los presentadores reciben sesión y ticket amplios. Entregar menos datos a cada presentación ayuda UX, pero no es seguridad mientras backend devuelva campos restringidos.
- La API de comentarios comprueba titularidad/asignación/ámbito y solo permite nota interna a Técnico y Supervisor; el detalle filtra las notas internas para los demás.

| Rol | Detalle que debe ver | Acciones del detalle |
|---|---|---|
| Solicitante titular | Estado, comunicaciones públicas, fechas/compromiso explicados y evidencia autorizada | Responder, adjuntar, pedir reapertura válida, confirmar cierre y CSAT |
| Técnico | Diagnóstico, CI/servicio necesario, contacto mínimo e historial operativo | Autoasignarse de cola elegible; iniciar, esperar con motivo, comentar, resolver y escalar problema |
| Supervisor | Información operativa del equipo, colas, carga, SLA y escalamiento | Asignar/reasignar en su ámbito; escalar y revisar; no alterar historia previa |
| Gestor de Área | Resumen de negocio, ámbito, aprobaciones e historial decisorio; mensajes públicos | Aprobar/rechazar pendiente de su departamento con justificación; sin alterar solución |
| Auditor | Eventos, valores antes/después, actores, tiempos y evidencia autorizada | Solo lectura, incluida exportación auditada |
| Aprobador CAB | RFC, CI/servicio impactado, riesgo, plan, rollback y decisiones del comité | Votar/abstenerse en RFC asignada, respetando quorum y conflicto de interés |
| Gestor de Cambios | RFC, calendario, freezes, dependencias y PIR | Preparar y coordinar RFC; no votar su propio cambio |
| Gestor de Activos | Activo/CI enlazado y estado/custodia necesarios | Editar activos, licencias o relaciones autorizadas; no acciones del service desk |
| Administrador | Metadatos mínimos para soporte | Administración; excepción operativa temporal y auditada cuando aplique |

## 5. Evaluación funcional ITSM / ITIL 4

ITIL 4 es un marco de prácticas y creación de valor, no un esquema de tablas ni una certificación automática del software.

| Práctica / dominio | Presente | Brecha principal |
|---|---|---|
| Service Desk, incidentes, solicitudes | Tipos, portal, ciclo de estados, comentarios y bandejas; reglas de permiso y ámbito añadidas | Falta demostrar autorización/cola end-to-end, clasificación coherente, vinculación formal a servicios y calidad operacional. Estado de ticket y aprobación están acoplados. |
| Catálogo y solicitudes | `servicio_catalogo`, campos JSONB y pasos de workflow | Completar audiencia/eligibilidad, dueño, publicación/versionado, niveles de servicio y outcomes; validar que servicio/tipo/categoría concuerden. |
| Incidentes y SLA | Prioridad por impacto/urgencia, fechas y espera; consulta corregida a `fecha_limite_sla` | Calendarios, festivos, zonas horarias y objetivos de primera respuesta/resolución no están gobernados de forma configurable. Aclarar si reloj corre durante aprobación. |
| Problemas / KEDB | Tablas, presentación y relación a incidentes | Restringir creación/edición; gobernar RCA, recurrencia, revisión, publicación y caducidad del workaround. |
| Change Enablement / CAB | RFC estándar/normal/emergencia, votos, calendario | Roles y SoD no son consistentes; autorizaciones/quorum deben ser explícitos. “Estándar” exige catálogo preautorizado con criterio y control. |
| ITAM / Service Configuration | Inventario, licencias, CI y relaciones | Distinguir activo patrimonial y CI de servicio; completar dueño, ciclo de vida, fuente/calidad, historial/impacto, conciliación y cumplimiento SAM. Migraciones agregan columnas ausentes del bootstrap. |
| Conocimiento | Artículos, revisión/publicación, utilidad y relación con problemas | Endurecer permisos, revisión independiente, público objetivo, versionado y caducidad; respetar estado editorial en toda respuesta API. |
| Niveles, medición y mejora | CSAT, campos SLA/OLA, métricas y reglas documentadas | Definiciones de KPI, fórmula, exclusiones, dueño y ciclo de mejora no están evidenciados end-to-end; no declarar OLA operativo solo porque existe tabla. |

### ISO/IEC 20000-1

ISO/IEC 20000-1 exige un sistema de gestión de servicios de la organización: contexto, liderazgo, planificación, apoyo, operación, evaluación y mejora. El producto puede apoyar controles, pero no hace que organización o software sean conformes por sí solos. Faltan evidencias de alcance/política/objetivos SMS, autoridad, plan de gestión, riesgo, requisitos de servicio, control operativo/proveedores, evaluación interna, revisión de dirección, acción correctiva y mejora. Las auditorías internas que asignan cumplimiento clausular deben contrastarse con evidencia real, no con nombres de pantalla.

## 6. Seguridad, privacidad, auditoría y calidad

### Defectos y riesgos de código

- **Autorización fragmentada:** se cerraron permisos en rutas de usuarios/perfiles/menú, tickets/comentarios, cambios/CAB, problemas/conocimiento y lecturas de activos, CMDB, licencias y técnicos. Aún no existe un middleware/policy service común; auditar endpoints restantes y verificar que las reglas no diverjan.
- **Sesiones:** JWT de 8 h incluye rol/perfil activo; revocación/desactivación de cuenta o permiso podría tardar en reflejarse si la ruta no vuelve a consultar estado. `middleware.ts` solo revisa presencia de cookie; la verificación criptográfica queda para layout/API. Definir revocación, rotación y bloqueo de sesiones activas.
- **Secretos:** los fallback de JWT/CAPTCHA y la URI fija de migración se retiraron; se exige `JWT_SECRET` con longitud mínima y `DATABASE_URL` en el script. Falta rotar la credencial previamente expuesta, provisionar secretos de despliegue y verificar la rotación.
- **CAPTCHA en el login:** se detectó que el `JWT_SECRET` local tenía 31 caracteres frente al mínimo exigido de 32, por lo que `/api/auth/captcha` fallaba y el cliente no mostraba el error. `.env.local` se actualizó con un secreto aleatorio de 32 bytes; el endpoint ahora responde con error controlado y el formulario informa si no logra cargar el desafío. La nueva configuración requiere reiniciar Next.js.
- **CSRF/abuso:** `SameSite=Lax` mitiga parcialmente; definir protección CSRF para mutaciones con cookie, rate limits de autenticación/recuperación/carga y controles distribuidos. CAPTCHA no sustituye límites.
- **Recuperación de cuenta:** `codigo_recuperacion` guarda código OTP legible. Preferir hash de código, intentos limitados, no reutilización, invalidación y respuesta anti-enumeración.
- **Auditoría:** `log_acceso` cubre acceso, pero no es auditoría completa de cambios. Agregar eventos append-only de actor/rol, recurso, acción, antes/después, motivo, correlación, hora y origen; evitar que purgas eliminen evidencia exigida.
- **Adjuntos:** `datos_base64` en Postgres se entrega en respuesta de detalle; MIME del cliente no es confiable. Faltan evidencias de límites backend, escaneo, autorización de descarga, cifrado/retención y almacenamiento segregado.
- **Cambios:** `/api/cambios` limita lectura por perfil y las RFC de Técnico a sus propias solicitudes; solo CAB (7) emite votos y Gestor de Cambios (8) transiciona el ciclo de vida. La UI CAB muestra la acción solo a perfil 7 y bloquea solicitante/responsable. Hay quórum mayoritario y unicidad de voto; el CAB se modela como grupo y no hay asignación individual de RFC a aprobadores. Revisar la necesidad de transacciones y recalcular el quórum cuando cambie la membresía.
- **Otros dominios:** problemas, conocimiento, activos, CMDB, licencias y carga de técnicos ya tienen controles de perfil en las rutas modificadas. Las matrices de estos dominios aún requieren una revisión end-to-end contra cada pantalla, dato sensible y rol de la instalación.
- **Validación e integridad:** unificar esquemas de validación, límites de longitud/enum/relaciones y transacciones para ticket + adjuntos + actividad.

### Esquema y persistencia

- **Drift de esquema:** `db/schema.sql` ahora declara columnas de inactivación usadas por `activo` y `elemento_configuracion`; el script legado sigue siendo idempotente. Se añadió `db/migrations/20260930_roles_itsm.sql` para corregir mapeos 8/9 y unicidad de votos en instancias existentes. Falta consolidar y documentar un historial único de migraciones, y ejecutar esta en la base desplegada.
- **Nombre SLA:** esquema y listado de tickets usan `fecha_limite_sla`; falta validar la misma versión de esquema en despliegue.
- **Relaciones débiles:** validar pertenencia de categoría a tipo y servicio a categoría/tipo; agregar constraints para impedir combinaciones incoherentes.
- **Correlativos:** `COUNT(*) + 1` en tickets/RFC/problemas puede colisionar bajo concurrencia. Usar secuencia/tabla de numeración transaccional, constraint y reintento.
- **Atomicidad:** creación de ticket y adjuntos/comentario ocurre en varias consultas; fallo intermedio deja registros parciales. Agrupar todo en transacción.
- **Retención:** cascadas de borrado de ticket a comentario/aprobación/adjunto contradicen los requisitos documentales de evidencia inmutable. Definir retención y anonimización en vez de borrado cascada de pruebas.
- **Auditoría de usuario:** varios campos de creación/modificación no son FK o carecen de actor/rol consistente.
- **Estados:** IDs enteros mágicos se repiten en SQL/TypeScript; declarar transiciones válidas por código de estado y guardar cambios. Aprovechar `pausa_sla` en vez de depender solo de IDs numéricos.
- **Privacidad:** determinar clasificación, minimización, retención, residencia y jurisdicción legal de despliegue; documentos no la establecen.

## 7. Calidad documental

`DOCUMENTACIÓN/README.md` no deja una fuente de verdad única ni un ciclo de vida claro para documentos obsoletos. Hay auditorías solapadas; `auditoria_final_parcial_matriz_maestra.md` se limita a un parcial, pero incluye rutas/perfiles que ya no reflejan el árbol y trata maquetas no funcionales como “100%”. `diseno_composicion_vistas_por_rol_itsm.md` usa perfil 7 “Analista de Calidad” y 8 “Especialista de Problemas”, en conflicto con catálogo maestro y `seed.sql` (7 CAB, 8 Gestor de Cambios, 9 Activos). El código se alineó con el catálogo, pero los documentos divergentes continúan pendientes de reconciliación.

RF/HU/RN mezclan capacidades operativas, maquetas y roadmap; numeración y recuentos varían. “Implementado” y porcentajes no enlazan siempre a criterio verificable de permiso, datos, error y auditoría. El README raíz también está heredado: afirma que los módulos de tickets están por implementar aunque existen páginas/API. Revisar instrucciones y datos de demo.

**Saneamiento recomendado:** catálogo oficial de perfiles versionado; matriz RF/RN/HU ↔ página/API/tabla ↔ permiso ↔ criterio ↔ estado (no iniciado/parcial/operativo/verificado), fecha y responsable; archivar borradores viejos conservando evidencia útil; reconciliar los README y el esquema bootstrap.

### Reconciliación para la entrega actual

Con el plazo corto, estabilizar primero el alcance que se va a presentar y cerrar los controles críticos es razonable. Para mantener rigor académico, la documentación debe quedar como **línea base reconstruida del producto implementado**, con la fecha y el orden real del trabajo; no afirmar que las historias originales guiaron código que ya existía. Al terminar el código, reconciliar RF/RNF, reglas e historias contra la versión congelada: cada elemento debe indicar `implementado`, `parcial`, `pendiente` o `fuera de alcance`, y enlazar criterio de aceptación con pantalla/API/datos y rol. Mantener por separado mejoras de roadmap. Para cumplir las indicaciones registradas por el profesor: conservar los nueve nombres oficiales, títulos de HU atómicos sin “y”, criterios de aceptación Gherkin/BDD y terminología consistente de “usuario(s)”. Después de la presentación, cualquier cambio de software actualiza esa misma matriz y su historial de cambios.

## 8. Marcos adecuados y alcance

- **ITIL 4:** usar prácticas para procesos/flujo/medición; no afirmar “cumple ITIL” por tener tablas o pantallas.
- **ISO/IEC 20000-1:2018 + Amd 1:2024:** sistema de gestión de servicios certificable a nivel de organización/scope; el producto solo apoya evidencia y controles.
- **ISO/IEC 27001:2022 y enmienda:** sistema de gestión de seguridad basado en riesgo; definir controles según contexto y SoA. No etiquetar controles de UI como certificación.
- **COBIT 2019:** gobierno empresarial de I&T, objetivos adaptados, responsables y métricas; no una lista de menús.
- **NIST CSF 2.0:** perfil actual/objetivo sobre Govern, Identify, Protect, Detect, Respond y Recover; distinguir incidente cibernético de ticket de soporte.
- **OWASP ASVS 5.0.0:** criterios verificables para auth/sesión/control de acceso, validación, archivos, logging y configuración; esta revisión no es pentest ni evaluación ASVS.
- **ISO/IEC 25010:2023:** modelo de calidad del producto; traducir RNF a escenarios medibles de rendimiento, disponibilidad, seguridad, accesibilidad, compatibilidad y recuperabilidad.
- **ISO/IEC/IEEE 29148:2018 (si se mantiene):** requisitos únicos, trazables, verificables, medibles, priorizados y versionados.

## 9. Plan recomendado

### P0 — seguridad antes de ampliar

1. **Hecho en código, falta revisión integral:** controles explícitos por perfil/ámbito en las rutas P0 intervenidas; documentar y verificar matriz completa por acción y dato.
2. **Hecho parcialmente:** usuarios/perfiles/menú, tickets/comentarios, cambios/CAB, problemas, conocimiento, activos/CI/licencias y técnicos. Revisar configuración, departamentos, servicios, reportes y endpoints auxiliares.
3. **Fallback retirado; rotación pendiente:** configurar secretos obligatorios en el entorno y sustituir el secreto previamente expuesto.
4. **Hecho en código y seed:** perfiles 1–9 se alinean con catálogo maestro; aplicar migración en las bases existentes.
5. **Hecho parcialmente:** detalle y listados de tickets, RFC, activos y CMDB aplican controles. Falta revisar cada respuesta/exportación y ejecución con pruebas de autorización.

### P1 — integridad y operación

1. Consolidar migraciones; bootstrap reproducible; unificar nombres y tipos del contrato de SLA.
2. Declarar transiciones por estado/rol/servicio con validaciones atómicas y auditoría.
3. Sustituir correlativos basados en conteo; transaccionar alta/adjuntos/actividad; revisar retención.
4. Especificar horarios, festivos, zona horaria, SLA de respuesta/resolución, pausas, aprobación y OLA.
5. Definir almacenamiento/escaneo/descarga de archivos; proteger recuperación OTP, CSRF y rate limiting.
6. Implementar autoridad CAB/negocio desde asignación/delegación empresarial y reglas verificables de conflicto/quorum.

### P2 — completar el alcance ITSM

1. Delimitar qué módulos son operativos y qué está en roadmap; no presentar maquetas como funcionalidad cumplida.
2. Completar propietarios de servicio, catálogo/versiones, problemas/RCA/KEDB, cambios/PIR, CMDB de servicio y gobierno editorial del conocimiento.
3. Definir indicadores, fórmulas, responsables y mejora continua; completar acuerdos/proveedores si están en alcance.
4. Fijar requisitos observables de disponibilidad, backup, RPO/RTO, alertas, rendimiento y accesibilidad.
5. Determinar requisitos de privacidad/leyes por país y contexto de tratamiento.

### P3 — aseguramiento

Automatizar pruebas de acceso por matriz (incluidas rutas directas y manipulación de API), aislamiento entre usuarios/departamentos, contratos con base limpia, flujos por rol, SLA y workflows. Ejecutar revisión de seguridad basada en OWASP ASVS. **No se ejecutaron pruebas en esta auditoría.**

## 10. Criterios para dar por corregido el control por perfil

- Cada API define acceso público/autenticado/rol/acción/ámbito; denegación por defecto.
- Solicitante no consulta, comenta, califica ni descarga evidencia ajena alterando IDs.
- Nota interna no se devuelve a solicitante, auditor, CAB, gestor de cambios/activos ni ámbito no autorizado.
- Supervisor reasigna solo colas autorizadas; técnico toma únicamente tickets elegibles de su equipo y dentro de capacidad.
- Auditor no puede mutar datos; exportaciones y lecturas quedan auditadas.
- Gestor de Área aprueba solicitudes pendientes de su ámbito, no las propias; autoridad proviene de delegación vigente.
- CAB vota solo RFC asignadas, con reglas de quorum/abstención y SoD; no aprueba automáticamente solicitudes de servicio.
- Gestor de Cambios opera RFC; Gestor de Activos opera HAM/SAM/CMDB; no heredan acciones de ticket por ID genérico.
- Los botones corresponden a permisos efectivos; el backend devuelve 403 aunque se invoque una operación a mano.
- Una base vacía se crea y actualiza desde el repositorio sin columnas/migraciones manuales no documentadas.

## Fuentes oficiales consultadas

- [PeopleCert — ITIL 4 practices](https://www.peoplecert.org/ITIL4-practices)
- [ISO — ISO/IEC 20000-1:2018, estado y enmienda 2024](https://committee.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/07/06/70636.html?browse=tc)
- [ISO — ISO/IEC 27001:2022](https://www.iso.org/standard/27001?azure-portal=true)
- [ISACA — COBIT resources](https://www.isaca.org/resources/cobit)
- [NIST — Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)
- [OWASP — ASVS 5.0.0](https://owasp.org/projects/asvs)
- [ISO — ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html)

### Cierre

Hay base útil para evolucionar a ITSM; el bloqueo actual no se resuelve agregando pantallas sino alineando roles, vistas, autorización de API, esquema y reglas de servicio. Cerrar P0 y establecer una fuente única para los nueve roles; luego declarar con evidencia qué prácticas son operativas y cuál es el nivel de madurez perseguido. Esta revisión no determina conformidad certificable ni el estado real de la base desplegada.
