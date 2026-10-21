# Menús, perfiles y cobertura — FlowDesk ITSM

> **Documento canónico de navegación, roles y cobertura funcional.**
> **Vigencia:** 2026-10-20.
> **Alcance:** los 10 perfiles oficiales, el catálogo único `opciones_menu`, la visibilidad N:M `opciones_menu_perfiles`, el árbol visible del sidebar y la cobertura frente a ITIL 4, ISO/IEC 20000-1, ISO/IEC 27001, ISO/IEC 19770-1 y COBIT 2019.
> **Fuente autoritativa del árbol:** la captura generada desde la base el 2026-10-20 e incluida en la sección 5, con el colapso de carpetas de un solo hijo.
> **Regla de precedencia:** si una matriz histórica contradice el árbol actual, **prevalece el árbol de la sección 5**. Las diferencias se señalan expresamente.

Este documento sustituye funcionalmente a los siguientes documentos, retirados en la consolidación del 2026-10-19. Su contenido útil se conserva aquí y el histórico completo permanece en Git:

| Documento sustituido | Aporte conservado |
| :--- | :--- |
| `DOCUMENTACIÓN/ESQUEMA_MENUS_POR_PERFIL.md` | Inventario funcional por perfil, decisiones de organización y criterios de rutas. |
| `DOCUMENTACIÓN/catalogo_maestro_jerarquia_menu_por_perfil_itsm.md` | Roles, atribuciones y segregación de funciones (SoD); taxonomía por módulos. |
| `DOCUMENTACIÓN/AUDITORIA_COBERTURA_ITIL_ISO_POR_PERFIL.md` | Cobertura ITIL 4 / ISO 20000 / ISO 27001 / ISO 19770 / COBIT y brechas de marco. |
| `DOCUMENTACIÓN/MATRIZ_BRECHA_ACTUAL_VS_PROPUESTA_POR_PERFIL.md` | Contraste propuesta vs. software, prioridades de adaptación y retiro de componentes legacy. |
| `DOCUMENTACIÓN/MATRIZ_ESTADO_MENUS_POR_PERFIL_ITIL.md` | Estado por ítem de menú y lista de brechas operativas. |
| `DOCUMENTACIÓN/MATRIZ_EXHAUSTIVA_MENUS_Y_PESTANAS_POR_PERFIL.md` | Inventario de pestañas internas y evidencia de cierre de brechas. |
| `DOCUMENTACIÓN/UNIFICACION_CATALOGO_MENU.md` | Modelo de catálogo único, métricas de migración, decisiones y verificación. |

---

## 0. Resumen ejecutivo

| Indicador | Valor al 2026-10-20 |
| :--- | ---: |
| Perfiles oficiales | **10** |
| Opciones activas en `opciones_menu` | **227** |
| Carpetas (`url_menu = ''`) | **32** |
| Pantallas (`url_menu` con valor) | **195** |
| URLs de pantalla distintas | **195** |
| Raíces del catálogo | **12** |
| Filas activas en `opciones_menu_perfiles` | **388** |
| Asignaciones pantalla-perfil | **260** |
| Asignaciones carpeta-perfil | **128** |
| Carpetas que el sidebar colapsa al dibujar | **45** |
| Entradas de primer nivel visibles en los 10 perfiles | **68** |
| Rutas de reportes unificadas | **9** |

**Ideas fuerza:**

1. **Un solo catálogo, no diez menús.** Cada pantalla existe una vez en `opciones_menu`; lo que cambia por perfil es la visibilidad N:M en `opciones_menu_perfiles`, no el nombre ni la copia de la pantalla.
2. **La estructura refleja módulos, no perfiles.** Las consolas de rol se reparten por dominio (una aprobación de cambio vive en Cambios; un panel personal vive en Mi trabajo).
3. **El sidebar colapsa carpetas de un solo hijo visible.** Por eso el primer nivel que ve un perfil no equivale a las 12 raíces del catálogo: una raíz puede aparecer como su único hijo visible.
4. **El menú también autoriza.** Las páginas validan pertenencia al menú (`exigirMenuPagina`, `menuIncluyeUrl`, `menuIncluyePrefijo`); una pantalla sin fila de menú no es alcanzable por navegación normal.
5. **La operación ITSM está cubierta; el gobierno corporativo es parcial o está fuera de alcance.** La cobertura es alta en incidentes, solicitudes, problemas, cambios, activos, CMDB, catálogo, SLA, conocimiento y medición; las prácticas de finanzas, portafolio, proyecto, arquitectura o ISMS no forman parte del núcleo del producto.

---

## 1. Propósito, vigencia y cómo leer

### 1.1 Propósito

Este es el documento de referencia para:

- entender qué ve cada perfil y por qué;
- mantener la coherencia entre roles, segregación de funciones y menú;
- ubicar cada módulo y sus rutas canónicas;
- evaluar la cobertura frente a los marcos de referencia;
- planificar cambios de menú sin romper la navegación ni la autorización.

No es un inventario línea a línea de cada pestaña interna. La matriz exhaustiva de pestañas se sintetizó aquí y su histórico queda en Git; este documento refleja lo vigente.

### 1.2 Vigencia y fuentes

| Fuente | Uso en este documento | Precedencia |
| :--- | :--- | :--- |
| Captura de la base (sección 5) | Árbol visible por perfil, con colapso de carpetas de un solo hijo. | **Máxima para el árbol.** |
| `db/migrations/20261020_distribuir_configuracion_en_modulos.sql` | Distribución vigente: eliminó la raíz Configuración y reubicó sus pantallas; 227 opciones y 388 visibilidades. | Máxima para estructura y conteos. |
| `db/migrations/20261020_fase2_modulos_incidentes_solicitudes.sql` | Catálogo base de Incidentes y Solicitudes: 231 opciones y 394 visibilidades. | Alta para antecedentes. |
| `db/migrations/20261019_unificacion_catalogo_menu.sql` | Modelo de catálogo único y migración inicial. | Alta para el modelo. |
| `db/migrations/20261021_fase3_catalogo_servicios.sql` | Catálogo de consulta del técnico en `servicios`. | Alta para rutas. |
| `db/migrations/20261022_fase4_modulo_reportes.sql` | Centralización de los 9 reportes. | Alta para rutas. |
| `src/shared/lib/menu.ts` y `src/shared/lib/page-auth.ts` | Construcción del árbol, colapso y guardas de página. | Alta para comportamiento. |
| `next.config.js` | Alias públicos y reescrituras. | Alta para rutas públicas. |
| Documentos históricos listados arriba | Justificación de roles, cobertura y decisiones. | Media; ceden ante el árbol actual. |

### 1.3 Cómo leer este documento

- **Rutas internas:** se escriben completas, con `/plataforma/...`, salvo que se indique un alias público. Por ejemplo, `/admin/menu` es el alias público de `/plataforma/admin/menu`.
- **Pantalla:** opción con `url_menu` no vacía. **Carpeta:** opción con `url_menu = ''`.
- **Filas de visibilidad:** una fila por combinación opción-perfil. Una pantalla compartida por 5 perfiles suma 5 filas.
- **Primer nivel visible:** entrada que el sidebar muestra arriba después del colapso. No es lo mismo que “raíz del catálogo”.
- **Nombres del árbol:** se conservan literalmente los nombres del catálogo, incluida su acentuación actual. Las diferencias de tilde o mayúsculas son deuda de calidad, no un cambio de alcance.
- **Estados de cobertura:** 🟢 sólido (pantalla, servicio y uso verificable), 🟡 parcial (existe el flujo, falta profundidad o formalización), 🔴 ausente o fuera de alcance.
- **Contradicciones:** cuando una matriz antigua afirma que un ítem “falta” pero el árbol actual lo muestra, se explica en la sección de brechas. El árbol manda.

---

## 2. Roles y segregación de funciones (SoD)

### 2.1 Principios

FlowDesk opera con **RBAC** (control de acceso basado en roles) y **SoD** (separación de funciones). Los principios aplicados son:

1. **Menor privilegio:** cada perfil ve solo lo necesario para su responsabilidad.
2. **Quien configura no opera:** el Administrador parametriza formularios, flujos, SLA, menú y catálogos, pero no atiende tickets ni vota en el CAB.
3. **Quien opera no aprueba:** el Técnico resuelve, pero no autoriza compras, cambios ni excepciones.
4. **Quien solicita no aprueba y quien custodia activos no compra:** nadie dictamina su propia solicitud o cambio; el Gestor de Activos mantiene inventario y CMDB, pero no autoriza adquisiciones.
5. **El Auditor no escribe:** su acceso es de lectura estricta en todo el sistema.
6. **El Aprobador se autoexcluye:** no puede votar un cambio donde figure como solicitante, promotor o ejecutor.
7. **El Gestor de Cambios no se autoaprueba:** coordina el proceso, pero no sustituye la decisión colegiada del CAB.
8. **El Gestor de Problemas no acepta su propio riesgo mayor:** el riesgo aceptado y el cierre de un problema mayor requieren aprobación de otra autoridad.
9. **Editar y publicar son funciones distintas:** en la configuración de procesos, un usuario puede guardar borrador y otro publicar.

### 2.2 Los 10 perfiles

| # | Perfil | Propósito | Alcance de datos | Fronteras SoD |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Administrador** | Gobierno y configuración de la plataforma: formularios, flujos, SLA, perfiles, menú, catálogos, retención y salud del sistema. | Configuración global y consulta de la operación. | No atiende tickets, no crea RFC operativas, no vota en el CAB, no aprueba compras ni solicitudes de área. |
| 2 | **Técnico** | Resolutor N1/N2/N3 de incidentes y solicitudes; registra problemas y RFC; implementa cambios autorizados; mantiene activos en campo y produce conocimiento. | Tickets asignados, bandejas, su grupo, sus cambios y sus activos. | No modifica SLA ni parámetros globales; no reasigna arbitrariamente; no aprueba compras, cambios ni solicitudes. |
| 3 | **Solicitante** | Cliente interno que consume servicios, reporta fallas y hace solicitudes. | Solo sus tickets, sus activos en custodia y el conocimiento publicado. | No ve tickets de terceros ni notas internas; no opera colas, cambios, activos globales ni configuración. |
| 4 | **Supervisor** | Coordina la mesa: asignación, capacidad, SLA, calidad de atención y aprobación técnica de cambios. | Todos los tickets de su ámbito, su equipo, SLA y reportes operativos. | No administra identidades ni RBAC; no aprueba presupuesto; no sustituye al CAB; no altera registros de auditoría. |
| 5 | **Gestor de Área** | Jefe de unidad de negocio: valida solicitudes y cambios de negocio de su área y controla el servicio recibido. | Tickets, activos, contratos y reportes de su departamento. | No opera la mesa de TI; no dictamina sobre otras áreas; no configura infraestructura ni parámetros globales. |
| 6 | **Auditor** | Aseguramiento de calidad y cumplimiento: trazabilidad, SoD, muestreo, evidencias y recertificación de accesos. | Lectura global de tickets, cambios, problemas, activos, reportes, logs y configuración. | **Read-only:** no crea, edita, transiciona ni elimina datos; no opera la mesa ni registra RFC. |
| 7 | **Aprobador** | Autoridad de cambio y de riesgo: dictamina RFC en CAB/ECAB, acepta riesgo y cierra problemas mayores, aprueba bajas o renovaciones por monto. | Cambios, problemas mayores, activos por monto y sus propias solicitudes. | No recibe incidentes (decisión de Fase 2); no opera tickets; no configura; se autoexcluye de cambios donde participa. |
| 8 | **Gestor de Cambios** | Coordina el ciclo RFC: evaluación, autorizaciones, calendario, conflictos, capacidad, ejecución, PIR y modelos estándar. | Todos los cambios, calendario, ventanas, freeze, CAB y reportes de cambios. | No autoaprueba cambios mayores o normales; no administra identidades, menú ni logs perimetrales. |
| 9 | **Gestor de Activos y Configuración** | Custodio de HAM, SAM, CMDB, proveedores, contratos, mantenimiento, bajas y catálogos de activos. | Inventario completo, licencias, contratos, CMDB y reportes de activos. | No autoriza cambios en producción sin RFC aprobada; no aprueba compras; no administra perfiles ni accesos. |
| 10 | **Gestor de Problemas** | Coordina identificación, análisis de causa raíz, KEDB, problemas mayores, RFC derivadas y conocimiento derivado. | Todos los problemas, candidatos, errores conocidos, objetivos y reportes de problemas. | No opera la mesa de servicio; no acepta riesgo ni cierra un problema mayor por sí solo; no configura el sistema. |

> **Nota histórica:** el catálogo maestro de roles describía 9 perfiles. El perfil 10 (Gestor de Problemas) se incorporó con el módulo de Problemas y está plenamente reflejado en el catálogo actual.

### 2.3 Matriz funcional por perfil

Leyenda: **Config.** = configura; **Opera** = ejecuta el flujo; **Propios** = solo sus propios registros; **Lectura** = consulta sin escribir; **Aprueba** = dictamina; **Gestiona** = administra el ciclo completo; **—** = sin acceso en el menú actual.

| Dominio | 1 Admin | 2 Técnico | 3 Solicitante | 4 Supervisor | 5 G. Área | 6 Auditor | 7 Aprobador | 8 G. Cambios | 9 G. Activos | 10 G. Problemas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Incidentes | Consulta/config. | Opera | Propios | Opera | Propios/dep. | Lectura | — | — | — | — |
| Solicitudes | Consulta/config. | Opera | Propios | Opera | Propios/dep./aprueba | Lectura | Propios | — | — | — |
| Operación de la mesa | Consulta | Búsqueda | — | Gestiona | Departamento | Lectura | — | — | — | — |
| SLA | Configura | Monitorea | — | Gestiona | — | Audita | — | — | — | — |
| Cambios | Consulta/config. | Solicita/implementa | — | Aprueba técnico | Aprueba negocio | Audita | CAB/dictamina | Gestiona/config. | — | — |
| Problemas | Consulta/config. | Registra/asignados | — | Asigna | — | Lectura | Riesgo/cierre mayor | — | — | Gestiona |
| Activos y CMDB | Configura | Inventario/mant. | Propios | Bajas | Área | Lectura | Bajas/renov. | — | Gestiona | — |
| Conocimiento | Gobierna | Crea/consume | Consume | Revisa | Consume | Lectura | — | — | — | — |
| Catálogo | Configura | Consulta | Por tipo | — | Consulta | — | — | — | — | — |
| Operación | Eventos/resiliencia | — | — | Eventos/resiliencia | — | — | — | — | — | — |
| Reportes | Operativos/tableros | — | — | Operativos/productividad | Área | Operativos/auditoría/tableros | Decisiones | Cambios | Activos | Problemas |
| Organización | Configura | — | — | — | — | — | — | — | — | — |
| Plataforma | Total | — | — | — | — | Perfiles/permisos | — | — | — | — |
| Mi cuenta | Propia | Propia | Propia | Propia | Propia | Propia | Propia | Propia | Propia | Propia |

> La matriz resume el **menú actual**. Las capacidades transversales se ejecutan dentro de su módulo, no como entrada de otro dominio: el Gestor de Problemas crea RFC derivadas y conocimiento derivado desde Problemas; el Gestor de Activos actualiza la CMDB desde Activos. No implica que un perfil no pueda recibir un permiso puntual por configuración; la autorización efectiva es `page-auth` más la visibilidad del menú.

---

## 3. Resumen cuantitativo por perfil

### 3.1 Lectura de los totales

Las **388 visibilidades** se descomponen en **260 asignaciones de pantalla + 128 asignaciones de carpeta**. Las 195 pantallas no se repiten en el catálogo; lo que se repite es su asignación a varios perfiles. El sidebar oculta **45 carpetas** por la regla de un solo hijo visible, de ahí que el primer nivel visible (**68 entradas** en los 10 perfiles) sea menor que el conjunto de raíces y carpetas.

### 3.2 Detalle por perfil

| # | Perfil | Entrada canónica | Pantallas | Filas totales | Carpetas visibles | Colapsadas | 1.er nivel visible |
| :---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 1 | Administrador | `/plataforma/perfiles/administrador/panel` | 47 | 66 | 15 | 4 | 12 |
| 2 | Técnico | `/plataforma/perfiles/tecnico/panel` | 40 | 57 | 12 | 5 | 8 |
| 3 | Solicitante | `/plataforma/perfiles/solicitante/panel` | 12 | 21 | 4 | 5 | 5 |
| 4 | Supervisor | `/plataforma/perfiles/supervisor/panel` | 38 | 56 | 15 | 3 | 9 |
| 5 | Gestor de Área | `/plataforma/perfiles/gestor-area/panel` | 22 | 37 | 9 | 6 | 7 |
| 6 | Auditor | `/plataforma/perfiles/auditor/panel` | 27 | 44 | 9 | 8 | 8 |
| 7 | Aprobador | `/plataforma/perfiles/aprobador/panel` | 15 | 27 | 6 | 6 | 7 |
| 8 | Gestor de Cambios | `/plataforma/perfiles/gestor-cambios/panel` | 19 | 25 | 4 | 2 | 4 |
| 9 | Gestor de Activos | `/plataforma/gestor-activos/panel` | 26 | 37 | 7 | 4 | 4 |
| 10 | Gestor de Problemas | `/plataforma/gestor-problemas/panel` | 14 | 18 | 2 | 2 | 4 |
| — | **Total** | — | **260** | **388** | **83** | **45** | **68** |

**Notas:**

- “Pantallas” y “filas totales” son asignaciones, no opciones únicas: una pantalla compartida cuenta en cada perfil que la ve. “Carpetas visibles” es lo que queda tras el colapso; “colapsadas” es la diferencia contra las asignadas.
- El perfil 1 tiene 12 entradas de primer nivel; varias raíces se colapsan en su único hijo. El perfil 8 ya no muestra dos entradas "Cambios": la configuración de calendario quedó dentro de la raíz Cambios.

---

## 4. Raíces y reglas de navegación

### 4.1 Las 12 raíces del catálogo

| Orden | Raíz | Tipo | Contenido principal | Perfiles con algún descendiente visible |
| ---: | :--- | :--- | :--- | :--- |
| 1 | **Mi trabajo** | Carpeta | Paneles de rol, tareas, agenda, desempeño, equipo y aprobaciones personales. | 1–10 |
| 2 | **Mesa de Servicio** | Carpeta | Incidentes, solicitudes, operación transversal, SLA y avisos. | 1, 2, 3, 4, 5, 6, 7 |
| 3 | **Cambios** | Carpeta | RFC, calendario, CAB, aprobaciones, programación, PIR e historial. | 1, 2, 4, 5, 6, 7, 8 |
| 4 | **Problemas** | Carpeta | Registro, análisis, KEDB, candidatos, mayores y RFC derivadas. | 1, 2, 4, 6, 7, 10 |
| 5 | **Activos y CMDB** | Carpeta | Inventario, licencias, CMDB, mantenimiento, proveedores y catálogos. | 1, 2, 3, 4, 5, 6, 7, 9 |
| 6 | **Conocimiento** | Carpeta | Base, artículos, creación, revisión, publicación y configuración editorial. | 1, 2, 3, 4, 5 |
| 7 | **Catálogo de Servicios** | Carpeta | Catálogo de consulta y configuración de servicios/SLA. | 1, 2 |
| 8 | **Operación** | Carpeta | Eventos, alertas, disponibilidad, capacidad y continuidad. | 1, 4 |
| 9 | **Reportes** | Carpeta | Los 9 reportes corporativos. | 1, 4, 5, 6, 7, 8, 9, 10 |
| 10 | **Organización** | Carpeta | Departamentos, grupos resolutores, supervisores y técnicos. | 1 |
| 11 | **Plataforma** | Carpeta | Identidades, menú, notificaciones, auditoría, seguridad, retención, salud y cumplimiento. | 1, 6 |
| 12 | **Mi cuenta** | Carpeta | Perfil, seguridad y preferencias de notificación. | 1–10 |

> “Perfiles con algún descendiente visible” incluye casos en que la raíz se colapsa y aparece como su hijo. Por eso un perfil puede no ver literalmente el rótulo “Mi trabajo” y sí ver “Panel del técnico”.

### 4.2 Reglas de construcción

1. **Una fila por pantalla.** La identidad es la URL completa, incluida la query cuando define una pantalla distinta (`?vista=...`, `?tipo=...`).
2. **Carpeta vs. página.** `url_menu = ''` es carpeta; `url_menu` con valor es página. Una carpeta no debe llevar URL mientras no exista el doble clic de portada.
3. **Visibilidad N:M.** La única fuente de “quién ve qué” es `opciones_menu_perfiles`. No se crean copias de la misma pantalla por perfil.
4. **Nombre neutro.** El nombre no cambia según el perfil; el matiz de alcance va en `descripcion`.
5. **Carpeta visible si un descendiente es visible.** No basta con mirar hijos directos: una raíz cuyos hijos son todas carpetas debe seguir apareciendo si algún nieto es visible.
6. **Colapso de carpetas intermedias de un solo hijo.** Si una carpeta visible *intermedia* tiene un solo hijo visible, la carpeta no se dibuja y el hijo sube un nivel para simplificar la navegación. Las 12 raíces de dominio funcional (nivel 1) se preservan intactas (`esNivelRaiz = true`) para mantener la coherencia conceptual de los dominios ITIL/ITSM y evitar pantallas huérfanas sin categoría.
7. **Doce raíces, no doce entradas por perfil.** El catálogo tiene 12 raíces; el primer nivel visible depende de la visibilidad y del colapso.
8. **El menú autoriza.** `exigirMenuPagina` bloquea páginas que no están en el menú del usuario; los detalles que no son opción propia se autorizan por prefijo (`menuIncluyePrefijo`).
9. **Inicio único y administración.** `/dashboard` redirige al panel del perfil activo; el Administrador gestiona estructura, nombres, orden, visibilidad y bloqueo en `/plataforma/admin/menu` (alias público `/admin/menu`).
10. **Alias públicos.** `next.config.js` reescribe rutas sin `/plataforma` (`/admin`, `/tickets`, `/incidentes`, `/solicitudes`, `/servicios`, `/reportes`, `/cambios`, `/problemas`, `/activos`, `/gestor-activos`, `/gestor-problemas`, `/conocimiento`, `/avisos`, `/operacion`, `/mi-cuenta`, entre otras). La ruta canónica interna es la que lleva `/plataforma`.

### 4.3 Cómo se lee el árbol de la sección 5

- Cada línea con `— \`/ruta\`` es una **página**.
- Cada línea sin ruta es una **carpeta**.
- La indentación representa la jerarquía **después del colapso**.
- Los nombres se conservan tal como están en la base; no se corrigen tildes ni mayúsculas para no alterar la huella del catálogo.
- Si una página aparece en el primer nivel, puede ser una raíz real o el hijo único de una raíz colapsada. El árbol no distingue ambos casos visualmente; la sección 4.1 y las observaciones lo aclaran.
- La configuración de la Mesa de Servicio se integra en las carpetas Incidentes y Solicitudes; el resto del catálogo mantiene tres niveles como norma. El colapso puede reducir la profundidad visible.

---

## 5. Árbol actual por perfil

> **Fuente:** captura generada desde la base de datos el 2026-10-21 tras la canonización total de URLs a `/plataforma/...` y la estabilización de raíces de dominio ITIL.

### PERFIL 1 — Administrador

- Mi trabajo
  - Panel de administración — `/plataforma/perfiles/administrador/panel`
- Mesa de Servicio
  - Incidentes
    - Todos los incidentes — `/plataforma/incidentes`
    - Configuración del formulario — `/plataforma/incidentes/configuracion`
    - Flujo de estados y acciones — `/plataforma/admin/tickets-vistas?seccion=estados&tipo=incidente`
  - Solicitudes
    - Todas las solicitudes — `/plataforma/solicitudes`
    - Configuración del formulario — `/plataforma/solicitudes/configuracion`
    - Flujo de atención y aprobaciones — `/plataforma/admin/tickets-vistas?seccion=estados&tipo=solicitud`
  - Operacion de la mesa
    - Todos los tickets — `/plataforma/tickets/gestion/todos`
    - Auditoria de tickets — `/plataforma/tickets/gestion/auditoria`
- Cambios
  - Historial de cambios — `/plataforma/cambios/gestion/todos`
  - Configuración de formulario — `/plataforma/admin/procesos/cambios/formulario`
  - Flujo de evaluación, autorización y revisión posterior — `/plataforma/admin/procesos/cambios/flujo-evaluacion`
  - Tipos de cambio y requisitos — `/plataforma/admin/procesos/cambios/tipos-requisitos`
  - Notificaciones de cambios — `/plataforma/admin/procesos/cambios/notificaciones-calendario`
- Problemas
  - Registro de problemas — `/plataforma/problemas`
  - Configuración de formulario — `/plataforma/admin/procesos/problemas/formulario`
  - Flujo de investigación y seguimiento — `/plataforma/admin/procesos/problemas/flujo`
  - Relación con incidentes, errores conocidos y conocimiento — `/plataforma/admin/procesos/problemas/relaciones`
- Activos y CMDB
  - Inventario de activos — `/plataforma/activos/inventario`
  - Catálogos
    - Ciclos de vida y reglas de transición — `/plataforma/admin/activos-config/ciclos-vida-transiciones`
    - Licencias y contratos — `/plataforma/admin/activos-config/licencias-contratos`
    - Tipos de elementos de configuración y relaciones de CMDB — `/plataforma/admin/activos-config/cmdb-relaciones`
    - Tipos, modelos y atributos — `/plataforma/admin/activos-config/tipos-modelos-atributos`
- Conocimiento
  - Categorías, responsables y reglas de publicación y revisión — `/plataforma/admin/conocimiento-config`
- Catálogo de Servicios
  - Configuración de categorías — `/plataforma/admin/servicios?vista=categorias`
  - Crear servicio — `/plataforma/admin/servicios?vista=crear`
  - Objetivos SLA — `/plataforma/admin/servicios/sla`
  - Servicios de incidentes — `/plataforma/admin/servicios?tipo=1`
  - Servicios de solicitudes — `/plataforma/admin/servicios?tipo=2`
- Operación
  - Eventos y resiliencia — `/plataforma/operacion`
- Reportes
  - Indicadores operativos y SLA — `/plataforma/reportes/operativos`
  - Tableros — `/plataforma/reportes/tableros`
- Organización
  - Departamentos empresariales — `/plataforma/admin/departamentos-empresa`
  - Departamentos y grupos resolutores de TI — `/plataforma/admin/departamentos`
  - Supervisores — `/plataforma/admin/departamentos?vista=supervisores`
  - Técnicos y niveles de soporte — `/plataforma/admin/tecnicos`
- Plataforma
  - Auditoría de cambios de configuración — `/plataforma/admin/auditoria-sistema`
  - Registros de seguridad y autenticación — `/plataforma/admin/seguridad-logs`
  - Retención y mantenimiento de datos — `/plataforma/admin/mantenimiento-datos`
  - Salud del sistema — `/plataforma/admin/salud-sistema`
  - Identidades
    - Gestión de usuarios — `/plataforma/admin/usuarios`
    - Perfiles y permisos — `/plataforma/admin/perfiles`
  - Menú y notificaciones
    - Configuración de contacto — `/plataforma/admin/notificaciones?seccion=contacto`
    - Estructura del menú — `/plataforma/admin/menu`
    - Plantillas de correo y otros canales — `/plataforma/admin/notificaciones?seccion=plantillas`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`

### PERFIL 2 — Tecnico

- Mi trabajo
  - Panel del técnico — `/plataforma/perfiles/tecnico/panel`
  - Mi agenda y disponibilidad — `/plataforma/perfiles/tecnico/agenda`
  - Mi desempeño — `/plataforma/perfiles/tecnico/desempeno`
  - Mis tareas — `/plataforma/perfiles/tecnico/tareas`
- Mesa de Servicio
  - Incidentes
    - Incidentes asignados a mi — `/plataforma/incidentes/asignados`
    - Bandeja de incidentes — `/plataforma/incidentes/bandeja`
    - Incidentes resueltos — `/plataforma/incidentes/resueltos`
    - Registrar incidente — `/plataforma/incidentes/crear`
    - Sala de crisis (incidente mayor) — `/plataforma/perfiles/tecnico/mesa/incidente-mayor`
  - Solicitudes
    - Solicitudes asignadas a mi — `/plataforma/solicitudes/asignados`
    - Bandeja de solicitudes — `/plataforma/solicitudes/bandeja`
    - Solicitudes resueltas — `/plataforma/solicitudes/resueltos`
    - Registrar solicitud — `/plataforma/solicitudes/crear`
  - Operacion de la mesa
    - Busqueda avanzada de tickets — `/plataforma/perfiles/tecnico/mesa/buscar`
    - Historial de mis tickets — `/plataforma/tickets/gestion/mios`
  - SLA
    - Objetivos de tiempo vigentes — `/plataforma/perfiles/tecnico/sla/objetivos`
    - Semaforo de SLA de mi cola — `/plataforma/perfiles/tecnico/sla/semaforo`
- Cambios
  - Mis cambios
    - Calendario de mis cambios — `/plataforma/perfiles/tecnico/cambios/calendario`
    - Cambios por implementar — `/plataforma/perfiles/tecnico/cambios/implementacion`
    - Cambios que afectan mis servicios — `/plataforma/perfiles/tecnico/cambios/impacto`
    - Historial de mis cambios — `/plataforma/perfiles/tecnico/cambios/historial`
    - Mis cambios — `/plataforma/perfiles/tecnico/cambios/mis-cambios`
    - Registrar solicitud RFC — `/plataforma/perfiles/tecnico/cambios/nuevo`
- Problemas
  - Candidatos de mi grupo — `/plataforma/perfiles/tecnico/problemas/candidatos`
  - Consultar KEDB — `/plataforma/perfiles/tecnico/problemas/errores-conocidos`
  - Problemas asignados a mí — `/plataforma/perfiles/tecnico/problemas/asignados`
  - Problemas de mi grupo — `/plataforma/perfiles/tecnico/problemas/grupo`
  - Registrar problema — `/plataforma/perfiles/tecnico/problemas/nuevo`
- Activos y CMDB
  - Inventario
    - Inventario físico en campo — `/plataforma/perfiles/tecnico/activos/conteos`
    - Inventario técnico — `/plataforma/perfiles/tecnico/activos/inventario`
  - Mantenimiento y reparaciones — `/plataforma/perfiles/tecnico/activos/mantenimiento`
  - Consultar licencias — `/plataforma/perfiles/tecnico/activos/licencias`
  - Mapa de topología CMDB — `/plataforma/perfiles/tecnico/activos/mapa`
- Conocimiento
  - Consultar base de conocimiento — `/plataforma/perfiles/tecnico/conocimiento/base`
  - Crear artículo — `/plataforma/perfiles/tecnico/conocimiento/nuevo`
  - Mis artículos — `/plataforma/perfiles/tecnico/conocimiento/mis-articulos`
  - Revisiones pendientes — `/plataforma/perfiles/tecnico/conocimiento/revisiones`
- Catálogo de Servicios
  - Catálogo de servicios — `/plataforma/servicios/catalogo`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`

### PERFIL 3 — Solicitante

- Mi trabajo
  - Panel del solicitante — `/plataforma/perfiles/solicitante/panel`
- Mesa de Servicio
  - Incidentes
    - Mis incidentes — `/plataforma/incidentes/mios`
    - Registrar incidente — `/plataforma/incidentes/crear`
    - Catalogo de incidentes — `/plataforma/incidentes/catalogo`
  - Solicitudes
    - Mis solicitudes — `/plataforma/solicitudes/mios`
    - Registrar solicitud — `/plataforma/solicitudes/crear`
    - Catalogo de solicitudes — `/plataforma/solicitudes/catalogo`
  - Avisos de servicio — `/plataforma/avisos/mantenimientos`
- Activos y CMDB
  - Mis activos — `/plataforma/activos/mis-activos`
- Conocimiento
  - Base de conocimiento — `/plataforma/conocimiento`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`

### PERFIL 4 — Supervisor

- Mi trabajo
  - Equipo
    - Ausencias y guardias del equipo — `/plataforma/perfiles/supervisor/equipo/ausencias`
    - Vistas y respuestas compartidas — `/plataforma/perfiles/supervisor/equipo/vistas`
  - Panel de supervisión — `/plataforma/perfiles/supervisor/panel`
- Mesa de Servicio
  - Incidentes
    - Todos los incidentes — `/plataforma/incidentes`
    - Bandeja de incidentes — `/plataforma/incidentes/bandeja`
    - Incidentes resueltos — `/plataforma/incidentes/resueltos`
    - Incidentes mayores — `/plataforma/incidentes/mayores`
  - Solicitudes
    - Todas las solicitudes — `/plataforma/solicitudes`
    - Bandeja de solicitudes — `/plataforma/solicitudes/bandeja`
    - Solicitudes resueltas — `/plataforma/solicitudes/resueltos`
  - Operacion de la mesa
    - Centro de asignacion — `/plataforma/tickets/gestion/asignar`
    - Bandeja consolidada de pendientes — `/plataforma/tickets/gestion/bandeja`
    - Historial consolidado de resueltos — `/plataforma/tickets/gestion/resueltos`
    - Todos los tickets — `/plataforma/tickets/gestion/todos`
    - Registrar ticket para un usuario — `/plataforma/tickets/gestion/crear`
    - Auditoria de tickets — `/plataforma/tickets/gestion/auditoria`
  - SLA
    - Escalamientos y riesgos de SLA — `/plataforma/perfiles/supervisor/sla/escalamientos`
    - Incumplimientos y causas — `/plataforma/perfiles/supervisor/sla/incumplimientos`
    - Objetivos de tiempo vigentes — `/plataforma/perfiles/tecnico/sla/objetivos`
    - Semaforo de SLA del grupo — `/plataforma/perfiles/supervisor/sla/semaforo`
- Cambios
  - Mis cambios
    - Aprobaciones técnicas de RFC — `/plataforma/perfiles/supervisor/cambios/aprobaciones`
    - Cambios que afectan a mi equipo — `/plataforma/perfiles/supervisor/cambios/impacto`
    - Programación de implementaciones del equipo — `/plataforma/perfiles/supervisor/cambios/programar`
  - Calendario de cambios — `/plataforma/cambios/gestion/calendario`
- Problemas
  - Asignación de problemas — `/plataforma/perfiles/supervisor/problemas/asignar`
  - Errores conocidos (KEDB) — `/plataforma/problemas/kedb`
  - Registro de problemas — `/plataforma/problemas`
- Activos y CMDB
  - Inventario de activos — `/plataforma/activos/inventario`
  - Aprobación de bajas de mi área — `/plataforma/perfiles/supervisor/activos/bajas`
  - Licencias de software — `/plataforma/activos/licencias`
- Conocimiento
  - Base de conocimiento — `/plataforma/conocimiento`
  - Revisión y publicación de artículos — `/plataforma/perfiles/supervisor/conocimiento/revisiones`
- Operación
  - Disponibilidad, capacidad y continuidad — `/plataforma/operacion/resiliencia`
  - Eventos y alertas — `/plataforma/operacion/eventos`
- Reportes
  - Indicadores operativos y SLA — `/plataforma/reportes/operativos`
  - Productividad individual — `/plataforma/reportes/productividad`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`

### PERFIL 5 — Gestor de Area

- Mi trabajo
  - Aprobaciones
    - Delegación de aprobaciones — `/plataforma/perfiles/gestor-area/aprobaciones/delegacion`
    - Historial de aprobaciones de mi área — `/plataforma/perfiles/gestor-area/aprobaciones/historial`
  - Panel del área — `/plataforma/perfiles/gestor-area/panel`
- Mesa de Servicio
  - Incidentes
    - Mis incidentes — `/plataforma/incidentes/mios`
    - Incidentes de mi departamento — `/plataforma/incidentes/departamento`
  - Solicitudes
    - Mis solicitudes — `/plataforma/solicitudes/mios`
    - Solicitudes de mi departamento — `/plataforma/solicitudes/departamento`
    - Catalogo de solicitudes — `/plataforma/solicitudes/catalogo`
    - Aprobaciones de solicitudes — `/plataforma/solicitudes/aprobaciones`
  - Operacion de la mesa
    - Colaboradores de mi area — `/plataforma/tickets/gestion/colaboradores`
    - Tickets de mi departamento — `/plataforma/tickets/gestion/departamento`
    - Registrar ticket para un usuario — `/plataforma/tickets/gestion/crear`
- Cambios
  - Cambios con interrupción para mi área — `/plataforma/perfiles/gestor-area/cambios/impacto`
  - Calendario de cambios — `/plataforma/cambios/gestion/calendario`
  - Solicitar un cambio — `/plataforma/cambios/gestion/crear`
  - Aprobación de negocio de cambios — `/plataforma/perfiles/gestor-area/cambios/aprobaciones`
- Activos y CMDB
  - Activos de mi área — `/plataforma/perfiles/gestor-area/activos`
  - Licencias y contratos de mi departamento — `/plataforma/perfiles/gestor-area/contratos`
- Conocimiento
  - Base de conocimiento — `/plataforma/conocimiento`
- Reportes
  - Reportes del área — `/plataforma/reportes/area`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`

### PERFIL 6 — Auditor

- Mi trabajo
  - Panel de auditoría — `/plataforma/perfiles/auditor/panel`
- Mesa de Servicio
  - Incidentes
    - Todos los incidentes — `/plataforma/incidentes`
    - Incidentes resueltos — `/plataforma/incidentes/resueltos`
  - Solicitudes
    - Todas las solicitudes — `/plataforma/solicitudes`
    - Solicitudes resueltas — `/plataforma/solicitudes/resueltos`
  - Operacion de la mesa
    - Historial consolidado de resueltos — `/plataforma/tickets/gestion/resueltos`
    - Todos los tickets — `/plataforma/tickets/gestion/todos`
    - Auditoria de tickets — `/plataforma/tickets/gestion/auditoria`
- Cambios
  - Historial de cambios — `/plataforma/cambios/gestion/todos`
- Problemas
  - Registro de problemas — `/plataforma/problemas`
- Activos y CMDB
  - Inventario de activos — `/plataforma/activos/inventario`
  - Consulta de bajas — `/plataforma/perfiles/auditor/activos/bajas`
  - Licencias de software — `/plataforma/activos/licencias`
  - Resultados de auditorías de CMDB — `/plataforma/perfiles/auditor/cmdb/resultados`
- Reportes
  - Indicadores operativos y SLA — `/plataforma/reportes/operativos`
  - Informes de auditoría — `/plataforma/reportes/auditoria`
  - Tableros — `/plataforma/reportes/tableros`
- Plataforma
  - Cumplimiento
    - Cambios sin autorización o fuera de ventana — `/plataforma/perfiles/auditor/cumplimiento/cambios`
    - Muestreo de auditoría — `/plataforma/perfiles/auditor/muestreo`
    - Segregación de funciones — `/plataforma/perfiles/auditor/cumplimiento/sod`
  - Auditoría de cambios de configuración — `/plataforma/admin/auditoria-sistema`
  - Registros de seguridad y autenticación — `/plataforma/admin/seguridad-logs`
  - Recertificación de accesos — `/plataforma/perfiles/auditor/accesos/recertificacion`
  - Retención y mantenimiento de datos — `/plataforma/admin/mantenimiento-datos`
  - Perfiles y permisos — `/plataforma/admin/perfiles`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`

### PERFIL 7 — Aprobador

- Mi trabajo
  - Aprobaciones
    - Delegaciones — `/plataforma/perfiles/aprobador/delegaciones`
    - Historial de aprobaciones y dictámenes — `/plataforma/perfiles/aprobador/historial`
  - Panel del aprobador — `/plataforma/perfiles/aprobador/panel`
- Mesa de Servicio
  - Mis solicitudes — `/plataforma/solicitudes/mios`
- Cambios
  - Calendario de cambios — `/plataforma/cambios/gestion/calendario`
  - CAB
    - Agenda y actas — `/plataforma/perfiles/aprobador/cab/agenda`
    - Comité de emergencia (ECAB) — `/plataforma/perfiles/aprobador/cab/emergencia`
    - Dictamen colegiado (CAB) — `/plataforma/cambios/gestion/cab`
  - Aprobaciones
    - Aprobaciones de cambios — `/plataforma/perfiles/aprobador/cambios`
    - Modelos de cambio estándar — `/plataforma/perfiles/aprobador/cambios/modelos`
- Problemas
  - Riesgo aceptado y cierre de problemas mayores — `/plataforma/perfiles/aprobador/problemas`
- Activos y CMDB
  - Bajas y renovaciones por monto — `/plataforma/perfiles/aprobador/activos`
- Reportes
  - Reportes de decisiones — `/plataforma/reportes/decisiones`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`

### PERFIL 8 — Gestor de Cambios

- Mi trabajo
  - Panel de gestión de cambios — `/plataforma/perfiles/gestor-cambios/panel`
- Cambios
  - Calendario de cambios — `/plataforma/cambios/gestion/calendario`
  - Gestión
    - Bandeja de RFC por evaluar — `/plataforma/perfiles/gestor-cambios/evaluacion`
    - Conflictos y capacidad — `/plataforma/perfiles/gestor-cambios/conflictos`
    - Modelos de cambio estándar — `/plataforma/perfiles/gestor-cambios/modelos`
    - Programación de cambios autorizados — `/plataforma/perfiles/gestor-cambios/programacion`
    - Revisión post-implementación — `/plataforma/perfiles/gestor-cambios/pir`
    - Seguimiento de ejecución — `/plataforma/perfiles/gestor-cambios/ejecucion`
    - Seguimiento de etapas de aprobación — `/plataforma/perfiles/gestor-cambios/autorizaciones`
  - Historial de cambios — `/plataforma/cambios/gestion/todos`
  - CAB
    - Convocatoria, agenda y actas — `/plataforma/perfiles/gestor-cambios/cab/agenda`
    - Dictamen colegiado (CAB) — `/plataforma/cambios/gestion/cab`
  - Solicitar un cambio — `/plataforma/cambios/gestion/crear`
  - Feriados — `/plataforma/admin/procesos/cambios/notificaciones-calendario?vista=feriados`
  - Períodos de congelamiento — `/plataforma/admin/procesos/cambios/notificaciones-calendario?vista=congelamiento`
  - Ventanas de mantenimiento — `/plataforma/admin/procesos/cambios/notificaciones-calendario?vista=ventanas`
- Reportes
  - Reportes de cambios — `/plataforma/reportes/cambios`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`

### PERFIL 9 — Gestor de Activos y Configuracion

- Mi trabajo
  - Panel de activos y CMDB — `/plataforma/gestor-activos/panel`
- Activos y CMDB
  - Inventario
    - Asignación, custodia y actas — `/plataforma/gestor-activos/asignaciones`
    - Importación masiva — `/plataforma/gestor-activos/importacion`
    - Inventario de activos — `/plataforma/activos/inventario`
    - Inventario físico (campañas) — `/plataforma/gestor-activos/inventario-fisico`
    - Recepción de adquisiciones — `/plataforma/gestor-activos/recepcion`
  - Gestión de bajas — `/plataforma/gestor-activos/bajas`
  - Mantenimiento y garantías — `/plataforma/gestor-activos/mantenimiento`
  - Licencias
    - Catálogo de software autorizado — `/plataforma/gestor-activos/licencias/catalogo-software`
    - Cumplimiento y sobreuso — `/plataforma/gestor-activos/licencias/cumplimiento`
  - CMDB
    - Actualizaciones de CMDB desde cambios — `/plataforma/gestor-activos/cmdb/actualizaciones`
    - Análisis e impacto — `/plataforma/activos/cmdb/analisis`
    - Calidad y auditoría de CMDB — `/plataforma/gestor-activos/cmdb/auditoria`
    - Inexactitudes reportadas — `/plataforma/gestor-activos/cmdb/inexactitudes`
    - Líneas base — `/plataforma/gestor-activos/cmdb/lineas-base`
    - Mapa de topología — `/plataforma/activos/cmdb`
    - Modelado de clases CI — `/plataforma/activos/cmdb/tipos`
  - Proveedores y contratos
    - Contratos y cobertura — `/plataforma/gestor-activos/contratos`
    - Proveedores — `/plataforma/proveedores`
    - Renovaciones y vencimientos — `/plataforma/gestor-activos/renovaciones`
  - Catálogos
    - Fabricantes y modelos — `/plataforma/admin/activos-config/tipos-modelos-atributos?vista=fabricantes`
    - Listas auxiliares — `/plataforma/admin/activos-config/tipos-modelos-atributos?vista=catalogos`
    - Ubicaciones — `/plataforma/admin/activos-config/tipos-modelos-atributos?vista=ubicaciones`
- Reportes
  - Reportes de activos — `/plataforma/reportes/activos`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`

### PERFIL 10 — Gestor de Problemas

- Mi trabajo
  - Panel de gestión de problemas — `/plataforma/gestor-problemas/panel`
- Problemas
  - Análisis de causa raíz — `/plataforma/gestor-problemas/analisis`
  - Bandeja y asignación — `/plataforma/gestor-problemas/asignacion`
  - Candidatos a problema — `/plataforma/gestor-problemas/candidatos`
  - Conocimiento derivado — `/plataforma/gestor-problemas/conocimiento`
  - Errores conocidos (KEDB) — `/plataforma/problemas/kedb`
  - Incidentes recurrentes — `/plataforma/gestor-problemas/recurrentes`
  - Objetivos de tiempo — `/plataforma/gestor-problemas/objetivos`
  - Problemas mayores y revisión — `/plataforma/gestor-problemas/mayores`
  - Registro de problemas — `/plataforma/problemas`
  - Solicitudes de cambio derivadas — `/plataforma/gestor-problemas/cambios`
- Reportes
  - Reportes de problemas — `/plataforma/reportes/problemas`
- Mi cuenta
  - Mi perfil y seguridad — `/plataforma/mi-cuenta`
  - Preferencias de notificación — `/plataforma/mi-cuenta/notificaciones`


### 5.1 Observaciones del árbol

1. **Perfil 1 (Administrador):** Conserva sus raíces de dominio (`Mi trabajo`, `Mesa de Servicio`, `Cambios`, `Problemas`, `Activos y CMDB`, `Conocimiento`, `Catálogo de Servicios`, `Operación`, `Reportes`, `Organización`, `Plataforma`, `Mi cuenta`). Todas las rutas reflejan su ubicación canónica `/plataforma/...` sin alias ambiguos.
2. **Perfil 2 (Técnico):** Agrupa sus herramientas operativas en `Mi trabajo`, `Mesa de Servicio` (Incidentes y Solicitudes), `Cambios`, `Problemas`, `Activos y CMDB`, `Conocimiento`, `Catálogo de Servicios` y `Mi cuenta`.
3. **Perfil 3 (Solicitante):** Estructura clara y limpia centrada en el usuario final: `Mi trabajo` (panel y seguimiento), `Mesa de Servicio` (catálogos y registro asistido), `Activos y CMDB` (mis activos custodiados), `Conocimiento` (base de consulta pública) y `Mi cuenta`.
4. **Perfil 4 (Supervisor):** Conserva la operación transversal de la mesa, el control de SLA, la productividad individual y la gestión de incidentes mayores y resiliencia.
5. **Perfil 5 (Gestor de Área):** Enfoque departamental: gestión de solicitudes del área, aprobaciones de negocio y de compras, y reportes analíticos del área.
6. **Perfil 6 (Auditor):** Lectura e inspección integral sin capacidad de mutación operativa: pistas de auditoría de tickets, tableros, seguridad, salud de plataforma y cumplimiento SoD.
7. **Perfil 7 (Aprobador):** Segregación SoD estricta (no recibe incidentes operativos): gestión de solicitudes pendientes de firma, evaluación colegiada en CAB, dictamen de problemas mayores, aprobación de bajas patrimoniales y reportes de decisiones.
8. **Perfil 8 (Gestor de Cambios):** Consola especializada de gobernanza: flujo de evaluación, autorización, ejecución, revisión post-implementación (PIR), secretaría del CAB, ventanas de mantenimiento y congelamientos.
9. **Perfil 9 (Gestor de Activos y Configuración):** Gestión del ciclo de vida de hardware/software, CMDB, topología, auditoría de configuración, contratos, garantías y catálogo de software autorizado.
10. **Perfil 10 (Gestor de Problemas):** Gestión integral del ciclo de vida de problemas: candidatos, incidentes recurrentes, RCA, errores conocidos (KEDB), conocimiento derivado y RFCs correctivos.

---

## 6. Mapa de módulos y rutas

### 6.1 Dominios canónicos

| Dominio | Módulo principal | Rutas canónicas | Rutas legacy o alias | Perfiles principales |
| :--- | :--- | :--- | :--- | :--- |
| Incidentes | `src/modules/incidentes` | `/plataforma/incidentes`, `/asignados`, `/bandeja`, `/resueltos`, `/crear`, `/mios`, `/departamento`, `/mayores`, `/catalogo`, `/configuracion`, `/[id]` | `/plataforma/tickets/gestion/incidentes` → `/plataforma/incidentes` | 1, 2, 3, 4, 5, 6 |
| Solicitudes | `src/modules/solicitudes` | `/plataforma/solicitudes`, `/asignados`, `/bandeja`, `/resueltos`, `/crear`, `/mios`, `/departamento`, `/aprobaciones`, `/catalogo`, `/configuracion`, `/[id]` | `/plataforma/tickets/gestion/solicitudes` → `/plataforma/solicitudes` | 1, 2, 3, 4, 5, 6, 7 |
| Operación de la mesa | `src/modules/tickets` | `/plataforma/tickets/gestion/{todos,auditoria,asignar,bandeja,resueltos,crear,mios,colaboradores,departamento}`, `/plataforma/tickets/[id]` | `/tickets/...` (alias público) | 1, 2, 4, 5, 6 |
| Cambios | `src/modules/cambios` | `/plataforma/cambios/gestion/{calendario,cab,crear,todos,[id]}`, consolas `/plataforma/perfiles/*/cambios/*`, configuración `/plataforma/admin/procesos/cambios/*` | `/cambios/...` (alias público) | 1, 2, 4, 5, 6, 7, 8 |
| Problemas | `src/modules/problemas` | `/plataforma/problemas`, `/problemas/kedb`, `/problemas/[id]`, `/plataforma/gestor-problemas/*`, configuración `/plataforma/admin/procesos/problemas/*` | `/problemas/...`, `/gestor-problemas/...` | 1, 2, 4, 6, 7, 10 |
| Activos y CMDB | `src/modules/activos`, `src/modules/cmdb` | `/plataforma/activos/inventario`, `/activos/cmdb`, `/activos/cmdb/tipos`, `/activos/cmdb/analisis`, `/activos/licencias`, `/activos/mis-activos`, `/plataforma/gestor-activos/*`, `/plataforma/admin/activos-config/*` | `/activos/...`, `/gestor-activos/...` | 1, 2, 3, 4, 5, 6, 7, 9 |
| Conocimiento | `src/modules/conocimiento` | `/plataforma/conocimiento`, `/conocimiento/[id]`, `/plataforma/admin/conocimiento-config`, consolas de perfil | `/conocimiento/...` | 1, 2, 3, 4, 5, 6, 10 |
| Catálogo de Servicios | `src/modules/servicios` | `/plataforma/servicios/catalogo`, `/plataforma/incidentes/catalogo`, `/plataforma/solicitudes/catalogo`, `/plataforma/admin/servicios` (vistas `categorias` y `crear`; tipos 1 y 2), `/sla` | `/plataforma/perfiles/tecnico/catalogo` → `/plataforma/servicios/catalogo` | 1, 2, 3, 5 |
| Operación | `src/modules/operacion` | `/plataforma/operacion`, `/operacion/eventos`, `/operacion/resiliencia` | `/operacion/...` | 1, 4 |
| Reportes | `src/modules/reportes` | `/plataforma/reportes/{operativos,auditoria,productividad,activos,cambios,decisiones,problemas,area,tableros}` | varias rutas antiguas (ver 6.3) | 1, 4, 5, 6, 7, 8, 9, 10 |
| Organización | `src/modules/organizacion` | `/plataforma/admin/departamentos-empresa`, `/departamentos`, `/tecnicos` | `/admin/...` | 1 |
| Plataforma | `src/modules/plataforma`, `identidades`, `seguridad` | `/plataforma/admin/{auditoria-sistema,seguridad-logs,mantenimiento-datos,salud-sistema,menu,notificaciones,usuarios,perfiles}` | `/admin/...` | 1, 6 |
| Mi cuenta | `src/modules/identidades` | `/plataforma/mi-cuenta`, `/mi-cuenta/notificaciones` | `/mi-cuenta/...` | 1–10 |

### 6.2 Fases de cambio de rutas

Las rutas actuales son el resultado de cuatro fases: **(1)** modelo C de tickets (tabla base + extensiones 1:1, sin duplicar estados ni historial); **(2)** separación de Incidentes y Solicitudes (`/plataforma/incidentes/*`, `/plataforma/solicitudes/*`) y reconstrucción del catálogo; **(3)** catálogos de servicios en `servicios` (`/plataforma/servicios/catalogo` y catálogos por tipo); **(4)** centralización de los 9 reportes en `/plataforma/reportes/*`, con redirección de las rutas anteriores.

### 6.3 Los 9 reportes

| Reporte | Ruta canónica | Perfiles que lo ven | Ruta anterior que redirige |
| :--- | :--- | :--- | :--- |
| Indicadores operativos y SLA | `/plataforma/reportes/operativos` | 1, 4, 6 | `/plataforma/tickets/reportes` |
| Informes de auditoría | `/plataforma/reportes/auditoria` | 6 | `/plataforma/perfiles/auditor/informes` |
| Productividad individual | `/plataforma/reportes/productividad` | 4 | `/plataforma/perfiles/supervisor/reportes/productividad` |
| Reportes de activos | `/plataforma/reportes/activos` | 9 | `/plataforma/gestor-activos/reportes` |
| Reportes de cambios | `/plataforma/reportes/cambios` | 8 | `/plataforma/perfiles/gestor-cambios/reportes` |
| Reportes de decisiones | `/plataforma/reportes/decisiones` | 7 | `/plataforma/perfiles/aprobador/reportes` |
| Reportes de problemas | `/plataforma/reportes/problemas` | 10 | `/plataforma/gestor-problemas/reportes` |
| Reportes del área | `/plataforma/reportes/area` | 5 | `/plataforma/perfiles/gestor-area/reportes` |
| Tableros | `/plataforma/reportes/tableros` | 1, 6 | `/plataforma/admin/reportes-disenador` |

**Regla:** ningún reporte se enlaza desde una consola de perfil con su ruta antigua. Los paneles y el diseñador de tableros apuntan a `/plataforma/reportes/*`. Las rutas anteriores se conservan solo como redirecciones de compatibilidad.

### 6.4 Catálogo de servicios: tres entradas, tres audiencias

| Audiencia | Ruta | Qué muestra | Guarda |
| :--- | :--- | :--- | :--- |
| Solicitante / Gestor de Área | `/plataforma/incidentes/catalogo` | Servicios de tipo incidente, con acción de registro. | Menú del perfil. |
| Solicitante / Gestor de Área | `/plataforma/solicitudes/catalogo` | Servicios de tipo solicitud, con acción de registro y requisitos de aprobación. | Menú del perfil. |
| Técnico / Administrador | `/plataforma/servicios/catalogo` | Consulta completa del catálogo para diagnóstico y atención. | Menú del perfil. |
| Administrador | `/plataforma/admin/servicios?vista=categorias`, `?vista=crear`, `?tipo=1`, `?tipo=2`, `/sla` | Configuración de categorías, servicios y objetivos SLA. | Configuración global. |

El catálogo del solicitante **no** se mezcla en una sola pantalla: se expone por tipo para que el registro nazca con el flujo correcto. La consulta del técnico es una vista de lectura del mismo catálogo, no una copia de datos.

### 6.5 Alias y redirecciones

| Ruta anterior o alias | Destino | Mecanismo |
| :--- | :--- | :--- |
| `/plataforma/tickets/gestion/incidentes` | `/plataforma/incidentes` | Redirección de página. |
| `/plataforma/tickets/gestion/solicitudes` | `/plataforma/solicitudes` | Redirección de página. |
| `/plataforma/perfiles/tecnico/catalogo` | `/plataforma/servicios/catalogo` | Redirección de página. |
| `/plataforma/tickets/reportes` | `/plataforma/reportes/operativos` | Redirección de página. |
| `/plataforma/perfiles/auditor/informes` | `/plataforma/reportes/auditoria` | Redirección de página. |
| `/plataforma/perfiles/supervisor/reportes/productividad` | `/plataforma/reportes/productividad` | Redirección de página. |
| `/plataforma/gestor-activos/reportes` | `/plataforma/reportes/activos` | Redirección de página. |
| `/plataforma/perfiles/gestor-cambios/reportes` | `/plataforma/reportes/cambios` | Redirección de página. |
| `/plataforma/perfiles/aprobador/reportes` | `/plataforma/reportes/decisiones` | Redirección de página. |
| `/plataforma/gestor-problemas/reportes` | `/plataforma/reportes/problemas` | Redirección de página. |
| `/plataforma/perfiles/gestor-area/reportes` | `/plataforma/reportes/area` | Redirección de página. |
| `/plataforma/admin/reportes-disenador` | `/plataforma/reportes/tableros` | Redirección de página. |

Además, `next.config.js` mantiene reescrituras públicas para que `/admin`, `/tickets`, `/incidentes`, `/solicitudes`, `/servicios`, `/reportes`, `/cambios`, `/problemas`, `/activos`, `/gestor-activos`, `/gestor-problemas`, `/conocimiento`, `/avisos`, `/operacion` y `/mi-cuenta` funcionen sin el prefijo interno. No son rutas nuevas del catálogo: son alias de la misma pantalla.

---

## 7. Modelo de catálogo único y migración

### 7.1 Modelo de datos

| Tabla | Rol | Campos relevantes |
| :--- | :--- | :--- |
| `opciones_menu` | Catálogo único de nodos. | `id_opcion_menu`, `nombre`, `url_menu`, `descripcion`, `id_padre`, `nivel`, `orden`, `estado_registro`, `contador_clave`, `bloqueado`, `abierto_por_defecto`. |
| `opciones_menu_perfiles` | Visibilidad N:M opción-perfil. | `id_opcion_menu`, `id_perfil`, `orden`, `estado_registro`; PK compuesta `(id_opcion_menu, id_perfil)`. |
| `usuario_perfiles` | Perfiles activos del usuario. | `id_usuario`, `id_perfil`, `estado_registro`. |

**Consecuencias del modelo:**

- Una opción puede tener N perfiles sin cambiar el esquema.
- `obtenerMenuDelUsuario` hace `INNER JOIN` con `opciones_menu_perfiles` y `MenuLateral` solo pinta lo que llega.
- Ningún archivo del código referencia IDs concretos.
- `nivel` y `orden` se calculan del árbol y se mantienen globales; el orden ya no es “por perfil”.
- `permiso_requerido`, `modulo_requerido` y `condicion_nivel` no son la fuente de autorización; la autorización real va por `page-auth`.
- `contador_clave` se preserva en las opciones que lo usan.
- `bloqueado` se transporta por compatibilidad; el render actual no decide por ese campo.

### 7.2 Reglas para dar de alta una opción

1. La pantalla debe existir y tener su guarda de página.
2. Se crea **una** fila en `opciones_menu` con URL completa, nombre neutro, descripción de alcance, padre y orden.
3. Si es carpeta, `url_menu = ''`; si es página, URL con valor.
4. Se agregan filas en `opciones_menu_perfiles` para cada perfil que debe verla.
5. Si es carpeta, se verifica que sea visible para todo perfil que vea al menos un descendiente.
6. Se comprueba el colapso: si la carpeta queda con un solo hijo visible, desaparece y el hijo sube.
7. Se actualiza `db/seed.sql` solo como línea base (los cambios posteriores van por `/plataforma/admin/menu`), este documento y la captura del árbol de la sección 5.

**Prohibido:** crear una copia de la misma pantalla por perfil, cambiar el nombre para expresar el rol, o crear una carpeta con un solo hijo para “ordenar” sin aportar jerarquía.

### 7.3 Histórico condensado de migración

| Momento | Cambio | Resultado |
| :--- | :--- | :--- |
| Antes del 2026-10-18 | 10 menús paralelos escritos a mano; 451 opciones y 308 visibilidades; 240 pantallas para 189 URLs; 51 filas sobrantes. | Duplicación, nombres por perfil y mantenimiento x10. |
| 2026-10-18 | Unificación ejecutada: una fila por pantalla, visibilidad N:M, 12 raíces, IDs 21001+, respaldo `_bak_20261018`. | 227 opciones (36 carpetas + 191 pantallas) y 363 visibilidades. |
| 2026-10-18 | Regla de carpetas de un solo hijo y colapso en render (`colapsarCarpetasDeUnHijo`). | 7 carpetas eliminadas del catálogo; 49 carpetas ocultas al dibujar en ese momento. |
| 2026-10-18 | Paneles de Administrador y Solicitante; alias de `/gestor-activos`, `/gestor-problemas`, `/avisos` y `/conocimiento`. | 227 opciones; los 10 perfiles aterrizan en su panel; 0 enlaces rotos. |
| Fase 1 (2026-10-19) | Modelo C: tabla base de tickets + extensiones 1:1. | Base para separar incidentes y solicitudes sin duplicar estados ni historial. |
| Fase 2 (2026-10-19) | Separación de Incidentes y Solicitudes; operación de mesa y SLA transversales; configuración de formularios por módulo; reconstrucción del catálogo. | **231 opciones (36 carpetas + 195 pantallas) y 394 visibilidades.** |
| Fase 3 (2026-10-19) | Catálogos de servicios al módulo `servicios`. | `/plataforma/servicios/catalogo`; redirección de la ruta del técnico. |
| Fase 4 (2026-10-19) | Reportes centralizados en `reportes`. | 9 rutas `/plataforma/reportes/*`; redirecciones de las rutas antiguas. |
| Ajuste de menú (2026-10-20) | Configuración de Mesa de Servicio en cuatro niveles: Incidentes y Solicitudes, cada uno con formulario y flujo. | **233 opciones (38 carpetas + 195 pantallas) y 396 visibilidades.** |
| Distribución de configuración (2026-10-20) | Se eliminó la raíz Configuración; sus pantallas quedaron en Mesa de Servicio, Cambios, Problemas, Conocimiento, Organización y Plataforma. | **227 opciones (32 carpetas + 195 pantallas) y 388 visibilidades.** |

### 7.4 Decisiones cerradas

| # | Decisión | Resolución |
| :---: | :--- | :--- |
| D1 | Nombres y cantidad de raíces. | 12 raíces aprobadas. |
| D2 | Consolas de rol. | Se reparten por dominio; las personales van a Mi trabajo. |
| D3 | Pantallas gen-1 sin ubicación. | Fuera del catálogo; no se reintroducen como copias. |
| D4 | Estrategia de migración. | Reconstrucción completa con IDs 21000+, no cirugía fila por fila. |
| D5 | Fuente de visibilidad. | Solo `opciones_menu_perfiles`; sin nombres ni copias por perfil. |
| D6 | Carpetas de un solo hijo. | Se eliminan del catálogo y se colapsan también al dibujar. |
| D7 | Nombres. | Neutros y estables; el alcance va en `descripcion`. |
| D8 | Gobierno posterior. | El Administrador edita por `/plataforma/admin/menu`; el seed es línea base. |
| D9 | Separación de la mesa. | Incidentes y Solicitudes con rutas y catálogo propios; Operación de la mesa y SLA transversales. |
| D10 | Alcance del Aprobador. | **No recibe Incidentes**; solo “Mis solicitudes” y sus circuitos de cambio/riesgo/bajas. |
| D11 | Catálogo del solicitante. | Se expone por tipo: incidentes y solicitudes. La consulta del técnico es lectura. |
| D12 | Reportes. | Todos viven en `reportes`; las consolas y el admin solo enlazan. |
| D13 | Configuración de la Mesa de Servicio. | Cuatro niveles: `Configuración → Mesa de Servicio → Incidentes/Solicitudes → formulario o flujo`. Reemplazada por D14. |
| D14 | Distribución de la configuración. | Se elimina la raíz Configuración. Cada pantalla vive en su módulo dueño: Mesa de Servicio → Incidentes/Solicitudes, Cambios, Problemas, Conocimiento, Organización y Plataforma. Sin carpetas por perfil. |

### 7.5 Invariantes de aceptación

Toda migración o cambio de menú debe cumplir:

1. **Mismo conjunto de URLs por perfil** antes y después, salvo altas deliberadas y documentadas.
2. **Cero huérfanos:** toda fila de `opciones_menu_perfiles` apunta a una opción existente.
3. **Cero duplicados:** una misma URL de pantalla no se repite en `opciones_menu` (salvo query que defina pantalla distinta).
4. **Cero carpetas sin visibilidad:** toda carpeta tiene al menos un perfil que vea algún descendiente.
5. **Cero enlaces rotos:** toda URL del menú tiene página o redirección deliberada.
6. **Render correcto:** los 10 perfiles ven sus raíces y sus paneles; el colapso no elimina módulos.
7. **Compilación:** `npx tsc --noEmit` y `npm run build` sin errores.

**Respaldo y rollback:** las migraciones de unificación dejaron `opciones_menu_bak_20261018`, `opciones_menu_perfiles_bak_20261018`, `opciones_menu_bak_20261020` y `opciones_menu_perfiles_bak_20261020`. El rollback es `TRUNCATE` de las tablas vivas + `INSERT ... SELECT` desde el respaldo correspondiente.

---

## 8. Cobertura ITIL 4 / ISO 20000 / ISO 27001 / ISO 19770 / COBIT

### 8.1 Criterio

La cobertura se evalúa contra el **uso real** del producto, no contra la existencia de una pantalla aislada. Un módulo puede tener pantalla y aun así ser parcial si le falta gobierno, registro formal o integración. Las prácticas financieras, de portafolio, proyecto, arquitectura o desarrollo de software se marcan fuera de alcance cuando pertenecen al ERP o a la oficina de proyectos, no a un ITSM.

### 8.2 ITIL 4 — 34 prácticas (agrupadas)

| Práctica | Estado | Dónde vive en FlowDesk |
| :--- | :---: | :--- |
| Gobierno corporativo y desarrollo (Architecture, Portfolio, Project, Financial, Strategy, Business Analysis, Software Development) | 🔴 | Fuera de alcance del ITSM; finanzas y activos fijos viven en el ERP. |
| Continual Improvement | 🟡 | Paneles, reportes y configuración de procesos; sin registro formal de mejoras/CSI. |
| Information Security Management | 🟡 | RBAC, logs, auditoría, retención y SoD; sin ISMS ni registro de riesgos de seguridad. |
| Knowledge Management | 🟢 | Conocimiento, artículos, revisiones, publicación y KEDB. |
| Measurement and Reporting | 🟢 | 9 reportes, tableros, KPIs y SLA. |
| Organizational Change Management | 🟡 | Organización, departamentos, colaboradores y ausencias; sin gestión formal del cambio organizacional. |
| Relationship Management | 🟡 | Proveedores/contratos y CSAT; sin gestión de stakeholders. |
| Risk Management | 🟡 | Cuestionario y matriz de autoridad de cambios; sin registro corporativo de riesgos. |
| Supplier Management | 🟡 | Proveedores, contratos, renovaciones y evaluación básica. |
| Workforce and Talent Management | 🟡 | Técnicos, desempeño, agenda y ausencias; sin formación/talento. |
| Availability Management | 🟡 | Operación/Resiliencia; sin planes formales de disponibilidad. |
| Capacity and Performance Management | 🟡 | Resiliencia/Capacidad; sin modelado formal de capacidad. |
| Change Enablement | 🟢 | RFC, evaluación, CAB/ECAB, autorizaciones, calendario, conflictos, PIR y modelos estándar. |
| Incident Management | 🟢 | Incidentes, bandejas, asignación, mayores y escalamiento. |
| IT Asset Management | 🟢 | HAM, SAM, ciclo de vida, custodia, bajas, licencias y contratos. |
| Monitoring and Event Management | 🟡 | Operación/Eventos; sin descubrimiento ni agentes de monitoreo. |
| Problem Management | 🟢 | Registro, candidatos, análisis de causa raíz, KEDB, mayores y RFC derivadas. |
| Release Management | 🟡 | Se cubre vía cambios/implementación; sin módulo de release separado. |
| Service Catalogue Management | 🟢 | Catálogo por tipo, categorías, servicios y SLA. |
| Service Configuration Management | 🟢 | CMDB, relaciones, líneas base, auditoría, inexactitudes y actualizaciones desde cambios. |
| Service Continuity Management | 🟡 | Resiliencia; sin BIA ni planes de continuidad formales. |
| Service Design | 🟡 | Configuración de servicios y SLA; sin diseño de servicio extremo a extremo. |
| Service Desk | 🟢 | Mesa de servicio, bandejas, registro y operación transversal. |
| Service Level Management | 🟢 | SLA, objetivos, semáforos, incumplimientos y escalamientos. |
| Service Request Management | 🟢 | Catálogo de solicitudes, aprobaciones y seguimiento. |
| Service Validation and Testing | 🟡 | Planes de prueba en RFC y PIR; sin validación formal de servicios. |
| Deployment Management | 🟡 | Implementación de cambios; sin pipeline de despliegue. |
| Infrastructure and Platform Management | 🟡 | Inventario, CMDB y mantenimiento; sin gestión de plataforma completa. |

**Síntesis ITIL 4:** el **núcleo operativo** (incidentes, solicitudes, problemas, cambios, mesa, SLA, catálogo, configuración, activos, conocimiento y medición) es sólido. Las prácticas de **gobierno corporativo** y **finanzas** son parciales o están fuera de alcance; no comprometen el ciclo de vida del servicio que FlowDesk resuelve.

### 8.3 ISO/IEC 20000-1:2018

| Tema | Estado | Evidencia |
| :--- | :---: | :--- |
| Sistema de gestión de servicios (SGS) | 🟡 | Gobernanza, auditoría y reportes; sin política/objetivos formales del SGS. |
| Catálogo y acuerdos (SLA) | 🟢 | Catálogo, SLA, objetivos e incumplimientos. |
| Relaciones y proveedores | 🟡 | Proveedores, contratos y evaluación básica. |
| Gestión de activos | 🟢 | HAM/SAM, ciclo de vida, custodia y bajas. |
| Gestión de la configuración | 🟢 | CMDB, integridad, líneas base y auditoría. |
| Presupuesto y demanda | 🔴 | Sin presupuesto ni gestión formal de demanda. |
| Diseño, construcción y transición | 🟡 | Cambios y transición cubiertos; diseño formal parcial. |
| Gestión de cambios | 🟢 | Evaluación, autorización, emergencias, calendario y PIR. |
| Resolución y cumplimiento | 🟢 | Incidentes, solicitudes y problemas con trazabilidad. |
| Garantía de servicio | 🟡 | Disponibilidad, continuidad, seguridad y capacidad parciales. |

### 8.4 ISO/IEC 27001:2022

| Control o tema | Estado | Evidencia |
| :--- | :---: | :--- |
| Inventario de activos (A.5.9) | 🟢 | HAM, SAM y CMDB. |
| Uso aceptable (A.5.10) y devolución (A.5.11) | 🟢 | Asignación, custodia, devolución y actas. |
| Disposición segura / borrado (A.7.14, A.8.10) | 🟢 | Bajas con borrado seguro y evidencia. |
| Propiedad intelectual / licencias (A.5.32) | 🟢 | SAM, catálogo autorizado y cumplimiento/sobreuso. |
| Control de accesos y perfiles | 🟢 | RBAC, perfiles, recertificación y revisión de accesos. |
| Segregación de funciones (A.5.18) | 🟢 | Reglas SoD y autoexclusión CAB; auditoría de SoD. |
| Registro y monitoreo (A.8.15) | 🟢 | Logs de seguridad, auditoría de configuración y retención. |
| Gestión de riesgos de seguridad / ISMS | 🔴 | No hay módulo de riesgos, tratamiento ni SGS de seguridad. |

### 8.5 ISO/IEC 19770-1 (SAM)

Cobertura **fuerte** en derechos vs. instalaciones, métricas de licencia, umbral de riesgo, catálogo de software autorizado, asignación/liberación, renovaciones y alertas de vencimiento. El descubrimiento automático de software y los agentes de inventario están fuera de alcance por diseño.

### 8.6 COBIT 2019

| Objetivo | Estado | Evidencia |
| :--- | :---: | :--- |
| BAI06 — Managed IT Changes | 🟢 | Cambios, CAB, autorizaciones y PIR. |
| BAI07 — Managed IT Change Acceptance and Transitioning | 🟡 | Transición y PIR; aceptación formal parcial. |
| BAI09 — Managed Assets | 🟢 | HAM/SAM, ciclo de vida y contratos. |
| BAI10 — Managed Configuration | 🟢 | CMDB, líneas base y auditoría. |
| DSS03 — Managed Problems | 🟢 | Problemas, causa raíz y KEDB. |
| DSS05 — Managed Security Services | 🟡 | Logs, accesos, retención y SoD; sin servicio de seguridad completo. |
| MEA — Monitorización y evaluación | 🟡 | Reportes y tableros; sin modelo de madurez formal. |

### 8.7 Síntesis por marco

**ITIL 4** tiene cobertura alta en la operación (incidentes, solicitudes, problemas, cambios, activos, CMDB, catálogo, SLA, conocimiento y medición) y parcial en gobierno, finanzas, CSI y riesgos. **ISO 20000-1** es alta en resolución, cambio, activos/configuración y SLA; le faltan SGS formal, presupuesto/demanda y garantía de servicio. **ISO 27001** es media-alta en inventario, accesos, SoD, licencias, bajas, logs y retención; falta ISMS y tratamiento de riesgos. **ISO 19770-1** es alta en SAM, con descubrimiento automático fuera de alcance. **COBIT 2019** es media-alta: BAI06, BAI09, BAI10 y DSS03 sólidos; BAI07, DSS05 y MEA parciales.

> **Nota de alcance:** presupuesto, costeo, depreciación, facturación y activos fijos viven en el ERP. FlowDesk guarda costo/contrato del activo como referencia y no lleva contabilidad. Su ausencia es **por diseño**, no una carencia del ITSM.

---

## 9. Brechas y roadmap

### 9.1 Brechas operativas cerradas

La auditoría del 2026-10-15 identificó 10 brechas operativas. Al 2026-10-19, todas tienen artefacto verificable en el repositorio:

| # | Brecha original | Solución implementada | Evidencia |
| :---: | :--- | :--- | :--- |
| 1 | Admin — Salud del sistema: tareas programadas. | Tabla, servicio, API y sección de ejecución. | `/plataforma/admin/salud-sistema`; `/api/admin/salud-sistema/tareas`. |
| 2 | Admin — Salud del sistema: cola de correo. | Tabla, servicio, API y reintento. | `/api/admin/salud-sistema/correo`. |
| 3 | Admin — Problemas: campos personalizados y prioridad. | Pestañas nuevas en el formulario de problemas. | `PestanaCamposPersonalizados.tsx`, `PestanaPrioridad.tsx`. |
| 4 | Solicitante — detalle de conocimiento. | Página y presentador de detalle. | `/plataforma/conocimiento/[id]`. |
| 5 | Solicitante — aceptar actas de activos. | Tabla, API y acción de aceptación. | `/api/activos/mis-activos/aceptar`. |
| 6 | Gestor de Área — autorizaciones de colaboradores. | Tabla, API y UI. | `/api/area/colaboradores/autorizaciones`. |
| 7 | Auditor — evidencias de informe. | Tabla, API y UI. | `/api/perfiles/auditor/evidencia`. |
| 8 | Aprobador — presentador de RFC. | Presentador y enrutado en el detalle. | `src/modules/tickets/presentadores/PresentadorRfcAprobador.tsx`. |
| 9 | Gestor de Problemas — detalle del problema. | Página y presentador de detalle. | `/plataforma/problemas/[id]`. |
| 10 | Activos — validaciones. | Módulo de validaciones en uso. | `src/modules/activos/activosValidaciones.ts`. |

**Conclusión:** no quedan brechas de menú declaradas como “pantalla ausente” en los 10 perfiles. Lo que sigue son brechas de **calidad de navegación**, **deuda técnica** y **madurez de gobierno**.

### 9.2 Brechas y riesgos abiertos

| # | Brecha o riesgo | Impacto | Acción recomendada |
| :---: | :--- | :--- | :--- |
| G1 | Nombres del catálogo sin tildes o con mayúsculas inconsistentes (“Operacion”, “Configuracion”, “Semaforo”). | Calidad percibida y coherencia con los `<h1>`. | Normalizar nombres y descripciones en una migración de textos; actualizar seed y este documento. |
| G2 | El menú es también autorización. | Una página nueva sin fila/visibilidad devuelve bloqueo aunque el código exista. | Checklist obligatorio de alta de página + opción + visibilidad + prueba de render. |
| G3 | Rutas legacy de reportes y catálogo siguen existiendo como redirecciones. | Deuda técnica y enlaces antiguos en documentación externa. | Mantener mientras haya tráfico; retirar cuando la telemetría sea cero y no haya enlaces internos. |
| G4 | No hay prueba automática de regresión del árbol. | Un cambio de visibilidad puede romper un perfil sin detectarse hasta el login. | Añadir snapshot SQL por perfil y comparación contra el respaldo en CI. |
| G5 | Cobertura de gobierno: CSI, riesgos, ISMS, portafolio, arquitectura y finanzas. | Limita certificaciones formales ISO 20000/27001 y madurez COBIT. | Roadmap de gobierno; no bloquear la operación. |
| G6 | Disponibilidad, capacidad y continuidad son parciales. | Falta evidencia formal para auditorías de garantía de servicio. | Formalizar planes, BIA y pruebas de continuidad. |
| G7 | COBIT BAI07, DSS05 y MEA parciales. | Evidencia de transición, seguridad y evaluación incompleta. | Completar aceptación formal, catálogo de servicios de seguridad y modelo de madurez. |

### 9.3 Roadmap recomendado

| Horizonte | Acción | Responsable sugerido | Criterio de cierre |
| :--- | :--- | :--- | :--- |
| 0–15 días | Normalizar tildes/mayúsculas de nombres y `<h1>`. | Dueño de configuración | Catálogo y pantallas con el mismo texto; seed actualizado. |
| 0–15 días | Añadir snapshot SQL del menú por perfil. | Plataforma / QA | Test que falla si cambia el conjunto de URLs de un perfil sin decisión. |
| 15–60 días | Probar los 10 perfiles en cada release (panel + 3 pantallas + 1 detalle). | QA | 0 errores 404/403 no deliberados. |
| 15–60 días | Revisar la matriz de reportes y confirmar que cada perfil ve lo que necesita. | Dueños de módulo | Matriz 6.3 validada por negocio. |
| 15–60 días | Decidir retiro o permanencia de rutas legacy. | Arquitectura | Redirect o baja documentada; sin enlaces internos. |
| 1–2 trimestres | Registro de mejora continua (CSI) y de riesgos. | Gobierno TI | Registro con owners, estados y evidencias. |
| 1–2 trimestres | Formalizar disponibilidad, capacidad y continuidad. | Operación | Planes, BIA y pruebas documentadas. |
| 1–2 trimestres | ISMS ligero y tratamiento de riesgos de seguridad. | Seguridad | Inventario de riesgos, tratamiento y evidencia. |
| Fuera de alcance | Presupuesto, costeo, depreciación, facturación, portafolio, proyecto, arquitectura, descubrimiento automático. | ERP / PMO | No se implementa en FlowDesk. |

---

## 10. Verificación y mantenimiento

### 10.1 Checklist antes de cambiar el menú

1. ¿La pantalla existe, tiene guarda y la URL es completa y única, incluida la query?
2. ¿Es página (`url_menu` con valor) o carpeta (`url_menu = ''`), con nombre neutro y alcance en `descripcion`?
3. ¿La visibilidad cubre a todos los perfiles y, si es carpeta, a todo perfil con algún descendiente visible?
4. ¿El colapso de un solo hijo deja una navegación comprensible?
5. ¿Se actualizaron `db/seed.sql`, la captura de la sección 5 y este documento?
6. ¿Se probó con los 10 perfiles?

### 10.2 Consultas de verificación

Con `DATABASE_URL` configurada:

```sql
-- 1. Totales del catálogo
SELECT
  COUNT(*) FILTER (WHERE url_menu = '') AS carpetas,
  COUNT(*) FILTER (WHERE url_menu <> '') AS pantallas,
  COUNT(*) AS total
FROM opciones_menu
WHERE estado_registro;

-- 2. Visibilidades activas
SELECT COUNT(*) AS visibilidades
FROM opciones_menu_perfiles
WHERE estado_registro;

-- 3. URLs de pantalla duplicadas
SELECT url_menu, COUNT(*) AS filas
FROM opciones_menu
WHERE estado_registro AND url_menu <> ''
GROUP BY url_menu
HAVING COUNT(*) > 1;

-- 4. Visibilidades huérfanas
SELECT COUNT(*) AS huerfanas
FROM opciones_menu_perfiles omp
LEFT JOIN opciones_menu om ON om.id_opcion_menu = omp.id_opcion_menu
WHERE omp.estado_registro AND om.id_opcion_menu IS NULL;

-- 5. Carpetas sin visibilidad
SELECT COUNT(*) AS carpetas_sin_visibilidad
FROM opciones_menu om
WHERE om.estado_registro
  AND om.url_menu = ''
  AND NOT EXISTS (
    SELECT 1
    FROM opciones_menu_perfiles omp
    WHERE omp.id_opcion_menu = om.id_opcion_menu
      AND omp.estado_registro
  );

-- 6. Filas por perfil
SELECT id_perfil, COUNT(*) AS opciones
FROM opciones_menu_perfiles
WHERE estado_registro
GROUP BY id_perfil
ORDER BY id_perfil;
```

**Valores esperados al 2026-10-20:** 32 carpetas, 195 pantallas, 227 total, 388 visibilidades, 0 duplicados, 0 huérfanas, 0 carpetas sin visibilidad. El detalle por perfil debe coincidir con la tabla 3.2.

### 10.3 Verificación de render

1. Entrar con un usuario de cada perfil y confirmar que `/dashboard` aterriza en su panel y que el primer nivel coincide con la sección 5.
2. Abrir al menos una bandeja, un detalle y una pantalla de configuración por perfil; confirmar que no hay 404/403 no deliberados.
3. Verificar que los detalles (`/tickets/[id]`, `/incidentes/[id]`, `/solicitudes/[id]`, `/cambios/gestion/[id]`, `/problemas/[id]`) se autorizan por prefijo y no exigen fila propia.
4. Ejecutar `npx tsc --noEmit` y `npm run build`.

### 10.4 Mantenimiento del documento

- **Regenerar la captura del árbol** desde la base y reemplazar la sección 5.
- **Actualizar conteos** (secciones 0 y 3), la matriz de reportes y la fecha de vigencia.
- **Revisar la cobertura** solo cuando cambie el alcance funcional, no en cada cambio de menú.

### 10.5 Propiedad y revisión

El **Administrador de plataforma** mantiene catálogo, nombres, orden y visibilidad en cada cambio. **Seguridad/Auditor** revisa roles y SoD trimestralmente; **Gobierno de TI** revisa la cobertura semestralmente o por certificación; **QA/Plataforma** ejecuta el render de los 10 perfiles en cada release.

---

## Anexo A. Fuentes usadas

**Autoritativas:** captura del árbol visible generada desde la base el 2026-10-20 (no versionada); migraciones `20261019_unificacion_catalogo_menu.sql`, `20261019_modelo_c_ticket.sql`, `20261020_fase2_modulos_incidentes_solicitudes.sql`, `20261020_distribuir_configuracion_en_modulos.sql`, `20261021_fase3_catalogo_servicios.sql` y `20261022_fase4_modulo_reportes.sql`; `db/seed.sql`; `src/shared/lib/menu.ts`, `src/shared/lib/page-auth.ts` y `next.config.js`.

**Históricas, sintetizadas y retiradas:** `ESQUEMA_MENUS_POR_PERFIL.md`, `catalogo_maestro_jerarquia_menu_por_perfil_itsm.md`, `AUDITORIA_COBERTURA_ITIL_ISO_POR_PERFIL.md`, `MATRIZ_BRECHA_ACTUAL_VS_PROPUESTA_POR_PERFIL.md`, `MATRIZ_ESTADO_MENUS_POR_PERFIL_ITIL.md`, `MATRIZ_EXHAUSTIVA_MENUS_Y_PESTANAS_POR_PERFIL.md` y `UNIFICACION_CATALOGO_MENU.md`; `prompt_1_config_gestion_de_problemas.md` (hoy en `PROMPTS_CONFIGURACION_ADMIN.md`).

---

*Documento canónico de menús, perfiles y cobertura. No modifica código ni datos. Si el árbol actual cambia, este documento debe actualizarse en la misma entrega.*
