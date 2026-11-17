# PROMPT DE REESTRUCTURACIÓN DEL MENÚ Y DE LAS PANTALLAS — Plataforma ITSM (ITIL 4)


---

## 0. Tu rol y la misión en una frase

Eres un ingeniero de software senior encargado de **reducir el menú de la plataforma de 227 opciones (186 URLs distintas) a 73 filas de menú (58 pantallas)** sin perder ningún flujo ITIL 4 requerido, **eliminando por completo el código que deje de usarse**, **actualizando todas las referencias y URLs** de lo que se reemplace, y **sin dejar redirecciones que tapen archivos muertos**. Al terminar, el sistema debe poder auditarse contra la sección 19 («Resultados esperados»), que es el contrato de aceptación.

## 1. Contexto y por qué se hace

- El producto es un ITSM multi-rol que cubre **incidentes, solicitudes de servicio, problemas, cambios, activos, CMDB y conocimiento**, además de usuarios/roles, seguridad y reportes.
- **El tiempo de desarrollo y de verificación es limitado.** Hoy hay 227 IDs de menú, 167 pestañas internas, ~275 botones con modal y 87 pestañas solo en pantallas de configuración. Es inviable programar, probar y mantener todo.
- La auditoría funcional del manual contra ITIL 4 concluyó que:
  1. **Todas las prácticas requeridas están cubiertas**; el problema no es que falte, es que **sobra**.
  2. Hay **la misma pantalla expuesta de 2 a 6 veces** con otro filtro (p. ej. `TablaTickets` con parámetro `vista` aparece 18 veces).
  3. Hay **funciones extra no requeridas** (eventos/monitoreo, disponibilidad y continuidad, inventario físico en campo, cumplimiento de licencias con agentes, recertificación de accesos, etc.).
  4. Las **notificaciones** dependen de correo/WhatsApp/webhooks; la decisión de producto es que sean **solo dentro del sistema**.
  5. Hay **pantallas stub** (p. ej. «Búsqueda avanzada» solo redirige) y **conteos inconsistentes** en el manual.
- **Principio rector:** *convención sobre configuración.* Los estados, transiciones, etapas y reglas de ITIL se **siembran** como datos fijos; solo se deja editable lo que un administrador de empresa realmente necesita (campos, listas, matriz de prioridad/SLA, catálogo, cuestionario de riesgo, matriz de autoridad, ventanas de cambio, clases de CI, tipos de activo).

## 2. Qué NO es esta tarea

- No es un rediseño visual ni una refactorización estética.
- No es agregar funcionalidades (salvo las 6 construcciones permitidas de la sección 4).
- No es borrar datos ni tablas de base de datos.
- No es «mejorar» lo que funciona. Si algo no está en este documento, **no lo toques**.

---

## 3. Reglas inviolables (cada una con su justificación)

**R1 — Cero código muerto.**
*Qué:* todo archivo, componente, hook, servicio, acción de servidor, ruta API, constante de capacidad, tipo, estilo, test, fixture, seed y dependencia de `package.json` que quede sin consumidor vivo tras un cambio **se elimina en el mismo cambio**. No se comenta, no se renombra a `_old`/`.bak`, no se deja «por si acaso», no se oculta tras un *feature flag*.
*Por qué:* el dueño del producto no tiene tiempo de verificar lo que no se usa; el código muerto parece funcional, engaña a quien lo audita y puede reactivarse por accidente. El historial de Git (tag de la Fase 0) es la red de seguridad: lo borrado es recuperable sin quedar en el árbol de trabajo.
*Cómo se comprueba:* `knip` (o `ts-prune` + `depcheck`) sobre `src`, más búsqueda manual de los nombres eliminados (sección 19, V-30 a V-34).

**R2 — Cero redirecciones por obsolescencia.**
*Qué:* está **prohibido** conservar una URL vieja redirigiendo a la nueva (en `page.tsx` con `redirect()`/`permanentRedirect()`, en `next.config` con `redirects`/`rewrites`, en `middleware`, en componentes con `router.replace`, ni en catch-alls). Las URLs antiguas **deben responder 404** porque su ruta ya no existe. Esto aplica también a redirecciones obsoletas **que ya existían antes** (p. ej. «Búsqueda avanzada» → asignados, «Tableros» → panel por perfil): se eliminan.
*Por qué:* una redirección de compatibilidad es un archivo muerto con disfraz: oculta referencias rotas que debieron corregirse y mantiene vivo código que nadie audita. Si todas las referencias internas se actualizan (R3), no hace falta ninguna.
*Redirecciones LEGÍTIMAS permitidas (lista cerrada):* (a) no autenticado → login; (b) post-login → `/plataforma/inicio`; (c) navegación posterior a una acción (crear ticket → ver su detalle); (d) denegación de acceso → página de acceso denegado. Cada `redirect(` que sobreviva debe estar justificado en el informe final (V-22).

**R3 — Todo reemplazo actualiza TODAS las referencias.**
*Qué:* cuando una pantalla se fusiona, mueve o renombra, **cada** referencia a su URL, ID o nombre de componente se actualiza al destino. Tipos de referencia a buscar, sin excepción: `href` y `<Link>`, `router.push/replace`, `redirect(`, `window.location`, `revalidatePath/revalidateTag`, literales y *template strings* con la URL, constantes/enums de rutas, mapas de iconos o breadcrumbs indexados por URL, `exigirMenuPagina('<url>')` y `exigirCapacidadPagina`, enlaces dentro de textos de notificación, seeds y migraciones de `opciones_menu`, tests (unitarios, integración, e2e), Storybook/fixtures, documentación y el propio manual.
*Por qué:* una referencia que apunta a una ruta eliminada produce un 404 silencioso en producción; una que apunta a una ruta equivocada produce comportamiento incorrecto que ningún compilador detecta.
*Cómo se comprueba:* búsqueda de las 142 URLs antiguas (Anexo D) con resultado cero (V-20).

**R4 — Sin *shims*, alias ni duplicados temporales.**
*Qué:* al mover un componente se actualizan **todos** sus `import` y se borra la ruta vieja. Prohibido dejar archivos que solo re-exportan (`export * from`), alias de ruta de compatibilidad o copias «mientras migramos».
*Por qué:* son código muerto en potencia (R1) y esconden imports sin actualizar.

**R5 — Los permisos efectivos se preservan: ningún perfil gana ni pierde acceso por accidente.**
*Qué:* hoy cada perfil ve exactamente las opciones de menú que tiene concedidas. Al fusionar varias opciones en una pantalla con pestañas (vistas), **cada pestaña solo la ve el perfil que tenía la opción de menú equivalente**. Ejemplo: un técnico que tenía «Asignados a mí» pero no «Todos los incidentes» debe ver solo la pestaña «Asignados» en la nueva «Bandeja de incidentes». Ocultar la pestaña en la interfaz **no basta**: el servidor debe validar la vista en cada consulta y acción (carga de datos, acciones de servidor, rutas API).
*Por qué:* una unión ingenua de permisos (si tenía cualquiera de las opciones, ve todas las pestañas) sería una **escalada de privilegios** y un fallo de seguridad.
*Cómo se comprueba:* matriz de acceso efectivo antes/después (V-15), con las únicas diferencias deliberadas listadas en la sección 19.

**R6 — No se altera la lógica de negocio fuera de lo indicado, y no se destruyen datos.**
*Qué:* no se hace `DROP TABLE`, `DROP COLUMN` ni `DELETE` de datos de negocio. Las tablas de configuración conservan sus **valores actuales** (solo se retira la interfaz para editarlos). Los motores (SLA, aprobaciones, asignación, CMDB, cálculo de prioridad) no se modifican, salvo los puntos expresamente indicados.
*Por qué:* irreversible, innecesario para reducir menú y arriesgado. Las tablas huérfanas se documentan como deuda en `docs/reestructuracion/deuda-bd.md` para decidir después.

**R7 — Solo estas construcciones nuevas están permitidas** (sección 4). Cualquier otra idea se anota en el informe como «sugerencia fase 2» y **no** se implementa.

**R8 — Una fase = un cambio coherente con el sistema compilando.**
*Qué:* al cerrar cada fase: `tsc --noEmit`, lint, tests y `build` en verde; un commit por bloque (mensaje: `reestructuracion(F<n>.<b>): <resumen>`); y un informe `docs/reestructuracion/informe-fase-<n>.md` con tabla *Esperado | Real | Estado*.
*Por qué:* permite auditar y revertir por fases, y evita que un error de la fase 7 se descubra en la fase 15.

**R9 — Evidencia, no suposición.** No declares algo hecho sin mostrar la salida del comando que lo demuestra (`grep`, `psql`, `tsc`, tests). «Debería funcionar» no es evidencia.

**R10 — Cuando la realidad contradiga este documento.**
*Estructural* (cambia el diseño: p. ej. los permisos no se pueden representar como se describe, un módulo depende de algo que se iba a borrar y no hay alternativa): **detente en ese bloque, documéntalo y continúa solo con los bloques independientes**.
*Menor* (nombre de pestaña distinto, ruta con otra capitalización, componente con otro nombre): aplica la regla por defecto del bloque, **decide por función (no por nombre)** y regístralo en «Desviaciones» del informe.
*Un ID de menú que existe en la base de datos pero no figura en el manual (o viceversa):* **conservarlo** y reportarlo; no lo borres.

**R11 — Tests.** Prohibido `.skip`, `xit`, `todo` o borrar un test «porque falla» sin que la funcionalidad probada haya sido eliminada deliberadamente. Los tests de funciones eliminadas se borran; para cada pantalla/vista nueva se crea, como mínimo, una prueba de humo (carga con el perfil correcto; 403 con perfil sin acceso).

**R12 — Sin dependencias nuevas.** No instales paquetes. Solo se puede **quitar** lo que quede sin uso (p. ej. cliente SMTP, WhatsApp). Herramientas de análisis (`knip`) se ejecutan con `npx` sin agregarlas a `package.json`.

**R13 — Convenciones del repositorio.** Respeta idioma (español), estructura de carpetas, nombres, estilo y utilidades existentes (`exigirMenuPagina`, `exigirCapacidadPagina`, `opciones_menu`, `opciones_menu_perfiles`). No renombres nada que este documento no pida.

**R14 — Migraciones reversibles y idempotentes.** Toda modificación de datos del menú/permisos va en una **migración nueva** (no edites migraciones ya aplicadas) y, si el repositorio usa seeds como fuente de verdad, **también en el seed**, de modo que una base nueva y una base migrada terminen idénticas (V-12). Haz respaldo (`pg_dump`) antes de la primera migración.

---

## 4. Construcciones nuevas permitidas (lista cerrada)

| Código | Qué | Por qué es necesaria |
|---|---|---|
| N1 | **Infraestructura de «vistas»** (pestañas con permiso propio): registro estático, tabla de permisos por vista, helper de servidor, componente de pestañas, extensión del grid de «Perfiles y Permisos» | Es lo que permite fusionar 90 opciones en pestañas **sin escalar privilegios** (R5) |
| N2 | **Notificaciones solo dentro del sistema** (tabla, servicio `notificar()`, campana con contador, pantalla «Notificaciones») | Sustituye correo/WhatsApp/webhooks por decisión de producto; sin esto se perdería toda comunicación de eventos |
| N3 | **Inicio** (`/plataforma/inicio`): compone los 10 paneles ya existentes, sin lógica nueva | Reemplaza 10 opciones de menú y la redirección «Tableros» |
| N4 | **Mis aprobaciones** (`/plataforma/aprobaciones`): bandeja única que agrega consultas **ya existentes** (solicitudes, cambios técnicos/negocio/generales, bajas de activos) + historial | Reemplaza 8 bandejas dispersas; es composición, no lógica nueva |
| N5 | **CIs (elementos de configuración)**: lista + alta/edición mínima, **solo si en la Fase 0 se confirma que no existe** | ITIL exige un registro navegable de CIs; el manual no lo muestra |
| N6 | **Credencial temporal con cambio obligatorio** (`debe_cambiar_clave`) **solo si no existe** | Reemplaza «Enviar credenciales por correo» al retirar el correo |

---

## 5. Recetas reutilizables (los bloques las referencian por código)

### REC-FUS — Fusionar una pantalla A dentro de una pantalla B como pestaña/vista
1. **Identifica** la página de A (`page.tsx`), su guard (`exigirMenuPagina('<urlA>')`) y los componentes que renderiza.
2. **Registra** la vista en el registro de N1 bajo la URL de B (código de vista = columna `vista` del Anexo C).
3. **Mueve** el componente de A a la carpeta de componentes de B si vive dentro de la carpeta de la ruta de A (actualiza imports; R4). Si el componente ya es reutilizable, déjalo donde está.
4. **Renderiza** el componente en B cuando `vista === '<codigo>'`, validando en servidor con el helper de N1 (R5). Los datos de A solo se cargan si la vista está activa y permitida.
5. **Migra permisos** (REC-PER).
6. **Actualiza referencias** (REC-URL): toda mención de `urlA` pasa a `urlB?vista=<codigo>` (más filtros secundarios si el Anexo A los indica: `alcance`, `tipo`, `solo-mios`).
7. **Elimina** `page.tsx` de A, su carpeta si queda vacía, wrappers/props usados solo por A, estilos y tests exclusivos de A, y la fila de menú de A (REC-MEN).
8. **Verifica:** build verde; `urlA` devuelve 404; la vista de B carga con un perfil que tenía A y devuelve «sin acceso» con uno que no.

### REC-ELI — Eliminar una función
1. **Análisis de dependencias previo** (consta en `dependencias-eliminacion.md` de la Fase 0): UI, rutas API/acciones de servidor, servicios/repositorios, tablas, *jobs*, constantes de capacidad, seeds, tests, textos, enlaces entrantes.
2. **Quita primero los consumidores** (botones, enlaces, tarjetas, widgets de otras pantallas que apunten a la función).
3. **Borra la UI** (página, componentes exclusivos, estilos).
4. **Borra el backend sin otro consumidor** (acciones, servicios, rutas API, tipos, validaciones). **Regla de dependencia:** si un servicio/tabla sigue siendo usado por otra función **viva**, se conserva y se anota; si no, se elimina el código (la tabla de BD se conserva: R6).
5. **Borra capacidades y menú:** constante de capacidad sin uso, concesiones en `opciones_menu_perfiles`, fila de `opciones_menu` (REC-MEN).
6. **Borra tests y documentación** de la función.
7. **Verifica:** búsqueda de nombres/URLs/capacidades eliminadas = 0 resultados; build y tests en verde.

### REC-URL — Cambiar o retirar una URL
1. Busca la URL vieja (literal, con y sin barra final, en *template strings*, con parámetros) en `src`, `tests`, `docs`, seeds/migraciones, `public`, `next.config.*`, `middleware.*`.
2. Reemplaza cada ocurrencia por la URL nueva; si la ocurrencia era un enlace a una función eliminada, **elimina el enlace** (y el elemento de UI que lo contenía si queda sin sentido).
3. Mueve/borra el `page.tsx` según corresponda. **Orden obligatorio ante colisión de rutas** (p. ej. una URL vieja que coincide con el prefijo de una nueva): primero borra la ruta vieja, luego crea la nueva.
4. Repite la búsqueda: debe dar **0** coincidencias fuera de `docs/reestructuracion/`.
5. Si la URL es usada por el menú lateral/breadcrumbs: la comparación de «ítem activo» debe hacerse **solo con `pathname`** (sin `?vista=`).

### REC-PER — Migrar permisos de varias opciones a una pantalla con vistas
Para cada fila del Anexo A con acción `FUSIONAR` (destino S, vista V) y cada perfil P:
- si P tenía la opción legada L → **conceder S** en `opciones_menu_perfiles` (si no la tenía) **y** conceder la vista V de S en la tabla de vistas de N1;
- las vistas que provienen de la **propia** fila sobreviviente S (p. ej. `bandeja` de #21233) heredan los permisos de S;
- después de migrar, elimina las concesiones de L.
Todo en SQL de migración, **idempotente** (`INSERT … ON CONFLICT DO NOTHING`). Guarda el script en `docs/reestructuracion/migracion-permisos.sql`.

### REC-MEN — Modificar el menú (datos)
- **Conserva** la fila (mismo ID): actualiza `nombre`, `url`, `padre_id`, `orden` solo si el Anexo A/B lo indica.
- **Elimina** la fila **y** sus concesiones, **después** de ejecutar REC-PER.
- **Nueva** fila: ID siguiente libre; concede a los perfiles indicados en el bloque.
- Reordena los hijos según el Anexo B.
- Actualiza la **fuente de verdad** (seed/migración) para que base nueva = base migrada.

---

## 6. Orden de ejecución (no lo alteres)

| Fase | Contenido | Depende de |
|---|---|---|
| 0 | Línea base y descubrimiento (solo lectura + respaldo) | — |
| 1 | N1: infraestructura de vistas y permisos | 0 |
| 2 | N2: notificaciones in-app y retiro de correo/WhatsApp/webhooks | 1 |
| 3 | Mi trabajo y Mi cuenta (Inicio, Mis aprobaciones, Delegaciones, Notificaciones) | 1, 2 |
| 4 | Mesa de servicio (incidentes, solicitudes, asignación, SLA) | 1, 3 |
| 5 | Cambios | 1, 2, 3 |
| 6 | Problemas | 1, 4 |
| 7 | Activos | 1, 3 |
| 8 | CMDB | 1, 7 |
| 9 | Conocimiento | 1 |
| 10 | Catálogo de servicios y matriz de prioridad/SLA únicos | 1, 4 |
| 11 | Reportes | 1 |
| 12 | Organización | 1 |
| 13 | Plataforma (seguridad y administración) | 2 |
| 14 | Retiro de la raíz «Operación» | 4–13 |
| 15 | Limpieza global y barrido de huérfanos | 3–14 |
| 16 | Documentación y manual | 15 |
| 17 | Verificación final e informe de reconciliación | 16 |

**Por qué este orden:** primero la infraestructura (sin ella no se pueden fusionar pantallas sin escalar privilegios), luego notificaciones (porque las fases siguientes borran todas las configuraciones de correo), luego los módulos de mayor reutilización (aprobaciones), y la limpieza global al final, cuando ya se conoce todo lo que quedó huérfano.

---

## 7. FASE 0 — Línea base y descubrimiento

**Objetivo:** conocer el estado real, fijar un punto de retorno y capturar los números «antes» contra los que se compara el «después». **No modifica código ni datos.**

### 0.1 Punto de retorno
- Verifica árbol limpio (`git status`). Crea rama `reestructuracion-menu` y tag `pre-reestructuracion-menu`.
- Respaldo de BD de desarrollo: `pg_dump` a `docs/reestructuracion/respaldo/` (fuera del control de versiones si pesa mucho; anota la ruta).
- Registra versiones: Node, gestor de paquetes, Next.js (importante: en versiones recientes `searchParams` es asíncrono), TypeScript, ORM/cliente de BD.
- **Por qué:** sin punto de retorno no hay reversibilidad (R1 se apoya en esto).

### 0.2 Salud de la línea base
- Instala dependencias y ejecuta: `tsc --noEmit`, lint, tests, `build`. Guarda las salidas.
- **Si algo falla ya en la línea base:** reporta y **detente** hasta que el responsable lo autorice; si no, no podrás distinguir tus errores de los previos.
- **Esperado:** cuatro comandos con resultado conocido (verde o lista exacta de fallos previos).

### 0.3 Inventario de rutas
Genera `docs/reestructuracion/00-rutas-antes.csv` con **todas** las rutas bajo `src/app` (páginas, `route.ts`, layouts, `loading`/`error`, `middleware`): URL resultante, archivo, guard usado (`exigirMenuPagina(url)` / `exigirCapacidadPagina(cap)` / ninguno), si contiene `redirect(`, componentes principales que importa.
- **Esperado:** las 186 URLs del Anexo D aparecen; cualquier ruta bajo `/plataforma` sin fila de menú se marca `HUERFANA` o `DETALLE` (p. ej. `[id]`).

### 0.4 Inventario del menú y de permisos
- Exporta `opciones_menu` (id, padre, nombre, url, orden, icono, activo) y `opciones_menu_perfiles` (perfil ↔ opción) y la lista de perfiles.
- Compara con el manual: **esperado 227 IDs** (12 raíces, 20 sub-agrupadores, 195 pantallas). Reporta IDs que existan en un lado y no en el otro (R10).
- Identifica la **fuente de verdad** del menú (seed SQL, migraciones, JSON, ORM) y documenta cuál es.

### 0.5 Sistema de autorización
Documenta en `00-autorizacion.md`: cómo funcionan `exigirMenuPagina` y `exigirCapacidadPagina`; dónde se definen las capacidades (constantes, tabla); cómo se resuelve el perfil del usuario; cómo el menú lateral decide el ítem activo (¿compara URL completa o `pathname`?); cómo «Perfiles y Permisos» construye su grid (¿lee `opciones_menu` dinámicamente o tiene una lista fija?); cómo `ModalDetalleTicket` elige su arquetipo (¿por `vista` o por capacidades?).
- **Por qué:** de esto depende cómo se implementa N1 sin romper el modelo vigente.

### 0.6 Matriz de acceso efectivo (ANTES)
Genera `matriz-acceso-antes.csv`: para **cada perfil × cada ID de menú**: `tiene_acceso` (0/1), más las capacidades relevantes de cada perfil.
- **Por qué:** es la referencia de R5; sin ella no se puede demostrar que no hubo escalada de privilegios.

### 0.7 Inventario de referencias
Para cada una de las 186 URLs, para cada nombre de componente citado en el manual y para cada constante de capacidad ligada a funciones a eliminar: busca en todo el repo y guarda `referencias-antes.csv` (archivo:línea, tipo de referencia según R3).
- **Esperado:** cifra total de referencias registrada; es la lista de trabajo de REC-URL.

### 0.8 Inventario de redirecciones
`grep` de `redirect(`, `permanentRedirect(`, `redirects`/`rewrites` en `next.config.*`, `NextResponse.redirect`, `router.replace/push` hacia rutas internas. Clasifica cada una: **legítima** (R2, lista cerrada) u **obsolescencia**.
- **Esperado:** al menos las de «Búsqueda avanzada» y «Tableros»; las de obsolescencia entran al plan de eliminación.

### 0.9 Análisis de dependencias de lo que se elimina
Para cada función eliminada (columna `ELIMINAR` del Anexo A y las vistas eliminadas dentro de pantallas que sobreviven), genera `dependencias-eliminacion.md` con la estructura de REC-ELI paso 1. Cuida especialmente estas dependencias cruzadas (**no asumas, verifica**):

| Función a eliminar | Qué verificar antes de borrar |
|---|---|
| Ausencias y guardias (#21009) | ¿El motor de asignación automática lee ausencias? Si sí, conserva el servicio/tabla y borra solo la pantalla |
| Vistas y respuestas compartidas (#21010) | ¿`ModalDetalleTicket` inserta respuestas rápidas guardadas ahí? Si sí, conserva el consumo y elimina solo la pantalla de gestión |
| Colaboradores de mi área (#21252) | Qué capacidades concedía (`AUTORIZACION_*`); dónde se consumen; quedan concedibles desde «Perfiles y Permisos» |
| Auditoría de tickets (#21258) | Que el arquetipo Auditor (solo lectura) siga resolviéndose por capacidad cuando se abre desde la vista `todos` |
| Campos personalizados (todas las entidades) | `SELECT count(*)` de definiciones existentes. Si hay 0 en todas las entidades: eliminar también el código que las renderiza. Si hay >0: **conservar el render** y documentar |
| Plantillas de problema | Botón «Cargar desde plantilla» en «Registrar problema»: se elimina junto con el modal |
| Flujos/estados/etapas (UI de edición) | Confirmar que los valores vigentes están en BD/seed y que el motor los lee de ahí; se conservan tal cual |
| Correo / WhatsApp / webhooks | Todos los puntos de envío (ver Fase 2) y funciones que dependen de correo (recuperar contraseña, credenciales iniciales) |
| Código patrimonial y etiquetas (pestaña de configuración de activos) | Que el alta de activos siga generando código con el esquema vigente sembrado |
| Categorías de conocimiento | Dónde se administran hoy (si viven en una pestaña que se elimina, conservarla; ver Fase 9) |
| Matriz de prioridad de Problemas y de Cambios | ¿Usan la misma tabla que `#21167` («Matriz institucional compartida») o tablas propias? |

### 0.10 Decisiones que dependen del hallazgo (registrar en `00-decisiones.md`)
1. **CIs (N5):** ¿existe ya una pantalla o ruta que liste/cree CIs (aunque no tenga fila de menú)? *Caso A:* existe → se le asigna fila de menú y se conserva. *Caso B:* no existe → se construye N5 mínimo (Fase 8).
2. **`debe_cambiar_clave` (N6):** ¿existe ya? Si no, añadirlo (columna + validación en login + pantalla de cambio).
3. **Recuperación de contraseña por correo:** si existe, se **elimina**; el restablecimiento lo hace el administrador desde «Usuarios».
4. **Aterrizaje tras login:** a qué ruta envía hoy a cada perfil (probablemente vía «Tableros» o un panel). Se sustituye por `/plataforma/inicio` y la vista por defecto debe ser **la misma que hoy recibe cada perfil**.
5. **Importación masiva de activos:** ¿el asistente es página o modal? (afecta la vista `importar`).
6. **Esquema de permisos** para N1: *Camino B (por defecto)* tabla nueva de permisos por vista; *Camino A* solo si el sistema ya posee capacidades granulares equivalentes por cada vista (verifícalo con la matriz de 0.6).

### 0.11 Entregable de la fase
`docs/reestructuracion/00-linea-base.md` con: versiones, resultados de 0.2, cifras (rutas, IDs, referencias, redirecciones, perfiles), hallazgos que contradicen este prompt (R10) y decisiones de 0.10.

**Resultados esperados de la Fase 0:** (E0.1) tag y rama creados; (E0.2) línea base verde o fallos previos listados; (E0.3) 186 URLs inventariadas; (E0.4) 227 IDs conciliados o discrepancias listadas; (E0.5) matriz «antes» generada para todos los perfiles; (E0.6) inventario de referencias y de redirecciones; (E0.7) `dependencias-eliminacion.md` con cada función de la columna `ELIMINAR`; (E0.8) decisiones de 0.10 registradas. **Ningún archivo de `src` modificado** (`git diff --stat` vacío salvo `docs/`).

---

## 8. FASE 1 — N1: infraestructura de vistas (pestañas con permiso)

**Por qué existe:** 90 de las 156 opciones que desaparecen no se borran: se **convierten en pestañas** de otra pantalla. Hoy el permiso es «por opción de menú»; al fusionar, el permiso debe pasar a ser «por pestaña» (R5). Esta fase construye esa pieza una sola vez y todas las fases siguientes la reutilizan.

### 1.1 Registro estático de vistas
Crea un módulo (p. ej. `src/modules/menu/vistas.ts`, adaptando a las convenciones) que exporte, **por URL base de pantalla**, la lista ordenada de vistas con `codigo` y `etiqueta`. Debe reproducir **exactamente** el Anexo C (32 pantallas, 107 vistas). Incluye el `codigo` por defecto de cada pantalla (la primera vista permitida al usuario, en el orden del Anexo C; para Inicio, la que hoy recibe cada perfil — 0.10.4).
**Por qué estático:** las vistas son parte del código (cada una renderiza un componente concreto); solo sus **concesiones** son datos.

### 1.2 Tabla de permisos por vista
Migración nueva: `opciones_menu_vistas_perfiles (opcion_id, perfil_id, vista, PK compuesta, FK a opciones_menu y perfiles)`. (Si 0.10.6 eligió Camino A, documenta cómo se mapea cada vista a su capacidad y omite la tabla.)
**Regla de consistencia:** una vista concedida exige la pantalla concedida; quitar la pantalla quita sus vistas; una pantalla con vistas debe tener al menos una concedida (si no, acceso denegado).

### 1.3 Helper de servidor
Función (p. ej. `exigirVistaPagina(urlBase, vistaSolicitada)`) que: (1) llama al guard de pantalla existente; (2) carga las vistas permitidas del usuario; (3) si `vistaSolicitada` es válida y permitida → la devuelve; si es inválida o no permitida → devuelve la **vista por defecto permitida**; (4) si no tiene ninguna → acceso denegado como hoy. Además expone `puedeVerVista(urlBase, vista)` para validar en **acciones de servidor y rutas API** que sirvan datos de una vista concreta (R5).
Adapta al manejo de `searchParams` de la versión instalada (asíncrono en Next.js recientes).

### 1.4 Componente de pestañas
Componente único (p. ej. `PestanasVista`) basado en enlaces (`?vista=<codigo>`), que **solo muestra las vistas permitidas**, conserva los filtros secundarios definidos (`alcance`, `tipo`, `solo-mios`) y marca la activa. Sin estado de cliente que no sea indispensable.

### 1.5 Menú lateral y *breadcrumbs*
El ítem activo se calcula **solo con `pathname`**. Verifica que una URL con `?vista=` resalta la fila correcta. Los *breadcrumbs* no enlazan a raíces inexistentes.

### 1.6 «Perfiles y Permisos» (#21210)
Extiende el grid para mostrar, bajo cada pantalla con vistas, **casillas anidadas por vista**. Verifica que el grid se construye leyendo `opciones_menu` dinámicamente (si tuviera una lista fija de 227, reemplázala por lectura de BD: V-25).

### 1.7 Pruebas de la fase
Pruebas unitarias del helper (válida/ inválida/ no permitida/ sin vistas) y de que una acción de servidor rechaza una vista no concedida aunque se llame directamente.

**Resultados esperados de la Fase 1:** (E1.1) registro con **32 pantallas / 107 vistas** (comparar con el Anexo C: diferencia 0); (E1.2) tabla de permisos creada vía migración, vacía de datos (los datos se cargan en cada fase con REC-PER); (E1.3) helper + componente con tests verdes; (E1.4) el grid de Perfiles y Permisos lee el menú de la BD; (E1.5) build verde; (E1.6) ninguna pantalla existente cambió de comportamiento todavía.

---

## 9. FASE 2 — N2: notificaciones solo dentro del sistema

**Decisión de producto:** el sistema notifica **únicamente dentro de sí mismo**. No hay correo, WhatsApp, webhooks ni preferencias por canal.
**Por qué:** cada canal externo implica integración, plantillas, reintentos, preferencias, monitoreo y pruebas; en conjunto es más trabajo que todo el módulo de cambios. Con una sola vía interna se cubre el 100 % de los eventos ITIL con una fracción del esfuerzo, y se elimina la superficie de configuración (plantillas, canales, 32 eventos × 3 canales).

### 2.1 Modelo y servicio
- Tabla `notificaciones`: `id`, `usuario_id`, `evento` (código), `titulo`, `mensaje`, `entidad_tipo`, `entidad_id`, `url_destino`, `leida` (bool), `creada_en`, `leida_en`. Índice por `(usuario_id, leida, creada_en desc)`.
- Servicio único `notificar({ usuarios, evento, entidad, … })` que inserta filas. **Un solo punto de entrada.** Los textos son constantes en código (`eventos-notificacion.ts`), no plantillas editables.
- `url_destino` debe generarse con las **URLs nuevas** (Anexo B); un test verifica que cada `url_destino` generable existe como ruta.
- **Enlace profundo (parte de N2, único añadido permitido):** si hoy no existe forma de abrir un ticket, RFC o problema concreto por URL, se admite el parámetro `?abrir=<id>` en las pantallas de lista correspondientes, que al cargar abre el detalle **ya existente**. No se crea ninguna vista nueva.

### 2.2 Catálogo fijo de eventos (15) y destinatarios
| # | Evento | Destinatarios |
|---|---|---|
| 1 | Ticket asignado | Técnico asignado |
| 2 | Cambio de estado de ticket | Solicitante y técnico asignado |
| 3 | Comentario público en ticket | La contraparte (solicitante ↔ técnico) |
| 4 | Ticket resuelto: confirmar | Solicitante |
| 5 | SLA en riesgo (75 %) | Técnico y supervisor del grupo |
| 6 | SLA vencido | Técnico, supervisor y jefe de TI |
| 7 | Aprobación pendiente | Aprobador (incluye delegado vigente) |
| 8 | Aprobación resuelta (aprobada/rechazada) | Solicitante del trámite |
| 9 | Cambio autorizado / programado | Solicitante, implementador, dueños de servicios afectados |
| 10 | Convocatoria / acta de CAB | Miembros del CAB |
| 11 | Incidente mayor declarado | Gestor de incidentes, jefe de TI, equipo de crisis |
| 12 | Problema asignado / error conocido publicado | Responsable / soporte |
| 13 | Artículo enviado a revisión / publicado / devuelto | Revisores / autor |
| 14 | Vencimiento de contrato, licencia o garantía (90/60/30 días) | Gestor de activos |
| 15 | Delegación activada o terminada | Delegante y delegado |

### 2.3 Puntos de emisión
Localiza **todos** los lugares donde hoy se envía correo/webhook/alerta (usa el inventario de 0.9) y sustitúyelos por `notificar(...)`. Para SLA (5 y 6) y vencimientos (14) reutiliza los *jobs* o *crons* existentes; si hoy emiten correo, cámbialos a `notificar`.

### 2.4 Interfaz
- **Campana** en la cabecera con contador de no leídas; panel desplegable con las últimas 10 y enlace a la pantalla completa.
- **Pantalla «Notificaciones»** (`/plataforma/notificaciones`, fila nueva bajo «Mi trabajo», concedida a **todos los perfiles**): lista paginada, filtro «sin leer», marcar una/todas como leídas, clic → navega a `url_destino` y marca como leída.
- Actualización por *polling* cada 30–60 s, pausado con la pestaña oculta. **Sin websockets.**

### 2.5 Retiro de todo lo externo (REC-ELI)
Elimina, con su análisis de dependencias: «Configuración de contacto» (#21212), «Plantillas de correo y canales» (#21214), «Preferencias de notificación» (#21227), la pestaña «Notificaciones» y la de presentación/ICS de #21194, los selectores de canal Email/Webhook de las reglas de escalamiento, el botón «Enviar credenciales por correo» (se reemplaza por N6: contraseña temporal mostrada **una sola vez** + `debe_cambiar_clave`), el botón «Probar SMTP» de Salud del sistema, la recuperación de contraseña por correo (si existe), el cliente de correo, cliente WhatsApp, emisores de webhook, plantillas, variables de entorno asociadas (`.env.example`) y **las dependencias de `package.json` que queden sin uso**.

**Resultados esperados de la Fase 2:** (E2.1) tabla y servicio creados con tests; (E2.2) los 15 eventos emiten filas en pruebas (una prueba por evento); (E2.3) campana y pantalla operativas con los tres perfiles de prueba; (E2.4) `grep -rniE "nodemailer|smtp|sendgrid|mailgun|twilio|whatsapp|webhook" src package.json .env.example` → **0 resultados** (salvo comentarios de este informe); (E2.5) `grep -rn "NOTIFICACION_CANAL\|canal.*email" src` → 0; (E2.6) ningún flujo (crear usuario, resolver ticket, aprobar) depende ya de enviar correo; (E2.7) **3 filas de menú eliminadas** (#21212, #21214, #21227) y **1 fila nueva** («Notificaciones») creada y concedida a todos los perfiles; (E2.8) build y tests verdes; (E2.9) `informe-fase-2.md`.

---

## 10. FASE 3 — Mi trabajo y Mi cuenta

**Estado final esperado de la raíz «Mi trabajo» (#21001):** 5 hijos en este orden — **Inicio** (#21022), **Mis tareas** (#21020), **Mis aprobaciones** (#21249), **Delegaciones** (#21004), **Notificaciones** (fila nueva de la Fase 2). «Mi cuenta» (#21225) conserva solo **Mi perfil y seguridad** (#21226).

### Bloque 3.1 — Inicio: 10 paneles + «Tableros» → 1 pantalla (N3)
- **IDs:** sobreviviente **#21022** (renombrar «Inicio», URL `/plataforma/inicio`); se fusionan #21007, #21011, #21012, #21013, #21014, #21015, #21016, #21017, #21021; se elimina #21183 (Tableros).
- **Por qué:** los 10 paneles son el mismo concepto («mi resumen según mi rol»). «Tableros» solo existía para redirigir al panel del perfil: es justo el patrón de archivo-puente que R2 prohíbe. Una sola pantalla que **renderiza** el panel elimina la redirección sin perder ninguno de los 10 paneles.
- **Pasos:**
  1. Crea `/plataforma/inicio/page.tsx`: guard de pantalla + helper de vistas (Fase 1). Las vistas son los 10 códigos del Anexo C (`solicitante`, `tecnico`, `supervisor`, `aprobador`, `area`, `gestion-activos`, `gestion-cambios`, `gestion-problemas`, `auditor`, `administrador`).
  2. Renderiza el **componente de panel existente** de la vista activa (reutilízalos; no los reescribas). Si el usuario tiene más de un panel, muestra `PestanasVista`.
  3. **Vista por defecto = la que hoy recibe cada perfil** (decisión 0.10.4). Reutiliza (mueve, no dupliques) la función que hoy resuelve «panel por perfil» (probablemente dentro de «Tableros»).
  4. REC-PER: cada perfil recibe la vista equivalente a cada panel que tenía. **Diferencia deliberada D-01:** todo perfil activo recibe además Inicio con la vista `solicitante` si no tenía ningún panel (para que nadie aterrice en un vacío).
  5. Actualiza el destino post-login, el enlace del logo y cualquier «volver al inicio» a `/plataforma/inicio`.
  6. Elimina las 10 rutas `/plataforma/operacion/paneles/*` (URLs exactas en el Anexo A, filas #21007…#21021), la ruta de «Tableros» (#21183) y la función de redirección por perfil si quedó sin uso.
- **Resultado esperado:** `/plataforma/inicio` carga para los 10 perfiles de prueba con el panel correcto; las 11 URLs antiguas devuelven 404; cero `redirect(` hacia paneles; build verde.

### Bloque 3.2 — Mis aprobaciones: 8 bandejas + 2 historiales → 1 pantalla (N4)
- **IDs:** sobreviviente **#21249** (renombrar «Mis aprobaciones», URL `/plataforma/aprobaciones`, padre #21001); se fusionan #21061, #21088, #21089, #21121 (bandejas) y #21005, #21006 (historiales).
- **Por qué:** el aprobador piensa en «lo que me toca decidir», no en el módulo de origen. Ocho bandejas con la misma mecánica (listar pendientes → abrir → aprobar/rechazar con justificación) son una sola bandeja con filtro por tipo. Los dos historiales usan el mismo componente (`VistaHistorialAprobaciones`).
- **Pasos:**
  1. Crea `/plataforma/aprobaciones` con vistas `pendientes` (por defecto), `historial` (#21006), `historial-area` (#21005, alcance de área).
  2. En `pendientes`, agrega las **consultas ya existentes** de: solicitudes, cambios (técnica, negocio, general) y bajas de activos. Filtro `?tipo=` con valores `solicitud`, `cambio-tecnica`, `cambio-negocio`, `cambio`, `baja`. Cada fila despacha a la **acción de servidor existente** de su tipo. **No toques el motor de aprobaciones**; solo compón.
  3. La **autorización se mantiene por asignación**: el usuario ve únicamente lo que está asignado a él o a quien delega en él (como hoy). El filtro `tipo` solo muestra los tipos con los que el usuario tiene algo.
  4. Antes de borrar las bandejas viejas, **anota para 3 usuarios de prueba** cuántos pendientes muestra cada una; la nueva debe mostrar los mismos totales por tipo (V-17).
  5. REC-PER para las 7 opciones fusionadas; REC-MEN: #21249 pasa de «Solicitudes» a «Mi trabajo».
  6. Elimina las rutas viejas (Anexo A): `/plataforma/cambios/aprobaciones/tecnicas`, `/plataforma/cambios/aprobaciones/negocio`, `/plataforma/cambios/aprobaciones`, `/plataforma/activos/bajas/aprobacion`, `/plataforma/solicitudes/aprobaciones`, `/plataforma/solicitudes/area/historial`, `/plataforma/seguridad/historial-aprobaciones`, y los wrappers exclusivos.
  7. **Fuera de esta bandeja** (no se tocan aquí): el dictamen colegiado en vivo del CAB (Fase 5) y la aprobación de riesgo de problemas (se elimina en Fase 6).
- **Resultado esperado:** una sola bandeja; 7 URLs viejas → 404; totales por tipo iguales a los de la línea base; delegaciones vigentes siguen funcionando.

### Bloque 3.3 — Delegaciones: 2 entradas → 1
- **IDs:** sobreviviente **#21004** (`/plataforma/seguridad/delegaciones`, padre #21001); se fusiona #21003 (`/plataforma/solicitudes/area/delegacion`).
- **Por qué:** las dos entradas renderizan el mismo componente (`VistaDelegaciones`). La URL «canónica» ya existe; la duplicada además colgaba de una ruta de solicitudes incoherente.
- **Pasos:** REC-FUS sin pestañas; REC-PER por unión; actualiza referencias a `/solicitudes/area/delegacion`; borra su `page.tsx`.
- **Resultado esperado:** 1 ruta; la vieja → 404; todo perfil que tenía cualquiera de las dos conserva acceso.

### Bloque 3.4 — Funciones personales/de equipo eliminadas (fase 2 del producto)
- **IDs a eliminar:** #21002 (sub-agrupador Aprobaciones, queda vacío), #21008 (sub-agrupador Equipo), #21009 Ausencias y guardias, #21010 Vistas y respuestas compartidas, #21018 Mi agenda, #21019 Mi desempeño.
- **Por qué:** no son requisito ITIL ni de los flujos pedidos; cada una es una pantalla completa con su lógica. Mi desempeño personal se cubre con «Productividad individual» de Reportes.
- **Pasos:** REC-ELI para cada una **usando `dependencias-eliminacion.md`**. Casos críticos: si el motor de asignación lee ausencias o `ModalDetalleTicket` consume respuestas rápidas, conserva ese servicio y borra solo la pantalla de gestión; documenta la decisión.
- **Resultado esperado:** 6 filas de menú eliminadas; sus rutas → 404; ninguna referencia a sus componentes/capacidades.

### Bloque 3.5 — Mis tareas (#21020) y Mi cuenta (#21225)
- Mis tareas: **sin cambios funcionales**; solo actualiza enlaces que apunten a rutas eliminadas.
- Mi cuenta: #21226 intacto; #21227 ya eliminado en la Fase 2.
- **Resultado esperado:** ambas cargan; ninguna referencia a rutas eliminadas.

**Resultados esperados de la Fase 3:** (E3.1) «Mi trabajo» con exactamente 5 hijos en el orden indicado; (E3.2) **23 filas de menú eliminadas** en esta fase: #21002, #21003, #21005, #21006, #21007, #21008, #21009, #21010, #21011–#21017, #21018, #21019, #21021, #21061, #21088, #21089, #21121, #21183; (E3.3) 0 referencias a `/plataforma/operacion/paneles`, `/solicitudes/area/`, `/seguridad/historial-aprobaciones`; (E3.4) totales de aprobaciones idénticos a la línea base; (E3.5) build y tests verdes; (E3.6) informe `informe-fase-3.md`.

---

## 11. FASE 4 — Mesa de servicio (incidentes, solicitudes, asignación, SLA)

**Estado final esperado de la raíz «Mesa de Servicio» (#21023):** sub-agrupador **Incidentes** (5 pantallas), sub-agrupador **Solicitudes** (4 pantallas), **Centro de asignación** (#21251) y **Monitor de SLA** (#21045).

### Bloque 4.1 — Bandeja de incidentes: 6 entradas + auditoría → 1 pantalla
- **IDs:** sobreviviente **#21233** (`/plataforma/incidentes/bandeja`); se fusionan #21230 (todos), #21232 (asignados), #21234 (resueltos), #21235 (departamento), #21258 (auditoría de tickets → vista `todos`). **#21231 «Mis incidentes» se conserva** (es la entrada del solicitante).
- **Por qué:** las seis pantallas son `TablaTickets` con otro valor de la propiedad `vista`. Mantener seis filas multiplica el menú, los permisos y las pruebas sin añadir una línea de lógica.
- **Pasos:**
  1. Vistas (URL `?vista=`): `bandeja` (sin asignar), `asignados`, `departamento`, `resueltos`, `todos`. Mapea cada una a la propiedad `vista` que **ya** usa `TablaTickets` (mismos valores internos para no tocar el componente).
  2. Orden de pestañas = Anexo C; vista por defecto = primera permitida en ese orden.
  3. REC-PER: cada perfil recibe solo las vistas cuyas opciones tenía. `todos` hereda de #21230 **y** #21258.
  4. **Arquetipo del detalle:** verifica que `ModalDetalleTicket` decide el arquetipo (Solicitante/Técnico/Supervisor/Auditor…) **por capacidades del usuario y no por la vista**. Si hoy depende de `vista === 'auditoria'`, cámbialo a capacidad (`TICKETS_AUDITORIA` o la equivalente) para que un auditor siga en **solo lectura** al entrar por `todos`.
  5. Elimina rutas y filas (Anexo A). Habilita `?abrir=<id>` para abrir el detalle desde notificaciones.
- **Resultado esperado:** un técnico que solo tenía «Asignados a mí» ve **solo** esa pestaña; un auditor ve `todos` sin botones de edición; 5 URLs viejas → 404.

### Bloque 4.2 — Bandeja de solicitudes: 5 entradas → 1 pantalla
- **IDs:** sobreviviente **#21244** (`/plataforma/solicitudes/bandeja`); se fusionan #21241, #21243, #21245, #21246; #21258 también aporta a `todos` de esta pantalla. **#21242 «Mis solicitudes» se conserva.**
- Mismos pasos, razones y verificaciones que 4.1 (vistas `bandeja`, `asignados`, `departamento`, `resueltos`, `todos`).
- **Resultado esperado:** igual que 4.1 para solicitudes; 4 URLs viejas → 404.

### Bloque 4.3 — «Registrar ticket para un usuario» (#21257) → selector «Solicitante»
- **ID:** se elimina #21257 (`/plataforma/tickets/gestion/crear`); destinos #21236 y #21247.
- **Por qué:** registrar «a nombre de otro» (llamada telefónica, presencial) es un **campo**, no una pantalla. Una pantalla aparte genera un tercer formulario de alta que mantener.
- **Pasos:**
  1. Los formularios de «Registrar incidente» (#21236) y «Registrar solicitud» (#21247) muestran el selector de solicitante **solo con la capacidad** de registrar para terceros (nómbrala como ya exista; si hoy el permiso es solo la fila de menú #21257, crea la capacidad con el mecanismo vigente y concédela a todo perfil que tenía #21257).
  2. Si el componente de alta tenía una variante sin `tipoFijo` usada solo por #21257, **elimina esa variante** (R1).
- **Resultado esperado:** un agente registra tickets a nombre de otro; un solicitante no ve el selector; la ruta vieja → 404.

### Bloque 4.4 — Incidentes mayores + Sala de crisis → 1 pantalla
- **IDs:** sobreviviente **#21238** (`/plataforma/incidentes/mayores`); se fusiona #21239 (`/plataforma/incidentes/sala-crisis`) como vista `sala-crisis`.
- **Por qué:** la sala de crisis es el espacio de trabajo de un incidente mayor concreto; separar «lista» y «sala» en dos opciones de menú obliga a navegar entre dos entradas para un mismo proceso.
- **Pasos:** REC-FUS; el listado enlaza a `?vista=sala-crisis&abrir=<id>`; REC-PER; elimina ruta vieja.
- **Resultado esperado:** 1 pantalla con 2 vistas; ruta vieja → 404.

### Bloque 4.5 — Configuración de incidentes y de solicitudes
- **IDs:** sobrevive **#21240** → «Configuración de incidentes» (`/plataforma/incidentes/configuracion`), vistas `campos`, `reglas`; sobrevive **#21250** → «Configuración de solicitudes» (`/plataforma/solicitudes/configuracion`), mismas vistas. Se fusionan #21187 y #21186 (pantallas de «Flujo») como vista `reglas`.
- **Por qué:** cada tipo de ticket tenía **dos** pantallas de configuración (formulario y flujo) con 3 + 2 pestañas. El flujo ITIL (estados, transiciones, escalamiento) queda **sembrado** (convención sobre configuración); solo se deja editable lo que varía entre empresas: campos visibles/obligatorios y parámetros operativos.
- **Pasos:**
  1. `campos` = pestaña de campos del formulario (la que hoy existe). **Eliminar** las pestañas «Campos personalizados» y «Niveles de solicitante» (según 0.9: si no hay definiciones de campos personalizados en BD, elimina también su código de render; si las hay, conserva el render y documenta).
  2. `reglas` = «Reglas operativas y parámetros» (con la lista de estados activos como **solo lectura**). Se eliminan los selectores de canal (Fase 2).
  3. REC-PER; borra las rutas de «Flujo» (#21186, #21187) y sus componentes exclusivos.
  4. **No toques** las tablas de configuración ni los valores vigentes: el motor sigue leyéndolos.
- **Resultado esperado:** 5 + 5 pestañas de configuración → 2 + 2 vistas; el motor de estados/escalamiento funciona igual; 2 URLs viejas → 404.

### Bloque 4.6 — Centro de asignación y eliminación de «Operación de la mesa»
- **Conserva:** #21251 Centro de asignación (`/plataforma/tickets/gestion/asignar`), que **sube** a la raíz de Mesa de Servicio (padre #21023).
- **Elimina:** #21024 (sub-agrupador), #21252 Colaboradores de mi área, #21253 Bandeja consolidada, #21254 Historial consolidado de resueltos, #21255 Tickets de mi departamento, #21256 Todos los tickets, #21259 Avisos de servicio, #21260 Búsqueda avanzada, #21261 Historial de mis tickets.
- **Por qué (uno por uno):**
  - #21253–#21256 y #21261: vistas consolidadas de las dos bandejas por tipo ya cubiertas por 4.1, 4.2 y por «Mis incidentes/Mis solicitudes» + Inicio; son más filtros del mismo componente.
  - #21260: **stub** que solo redirige (patrón prohibido por R2); no hay búsqueda real detrás.
  - #21259: duplicaba lo que muestra el Calendario de cambios; si el expediente del cambio tiene un botón «Publicar aviso», se elimina (REC-ELI paso 2).
  - #21252: matriz de delegación de capacidades por jefe de área; solapa con «Delegaciones» y «Perfiles y Permisos». Las capacidades `AUTORIZACION_*` quedan concedibles por el administrador.
- **Pasos:** REC-ELI de cada una. **Paso crítico:** tras borrar las páginas, revisa `TablaTickets`, sus tipos y sus consultas: el conjunto de valores de `vista` soportado debe quedar **exactamente** en `{mios, bandeja, asignados, departamento, resueltos, todos}`. Elimina toda rama, prop, tipo y consulta de las vistas `consolidada`, `auditoria`, `historial-propio` y similares que ya no tengan página (R1).
- **Resultado esperado:** 9 filas eliminadas; `TablaTickets` sin ramas huérfanas (búsqueda de cada `vista` eliminada = 0 resultados).

### Bloque 4.7 — Monitor de SLA: 5 pantallas → 1 (más la de problemas en la Fase 6)
- **IDs:** sobreviviente **#21045** → «Monitor de SLA» (`/plataforma/servicios/sla`, padre #21023); se fusionan #21046 (`incumplimientos`), #21047 (`objetivos`), #21048 (`mi-cola`), #21049 (`grupo`); #21101 (problemas) se agrega en la Fase 6 como `problemas`. Se elimina #21044 (sub-agrupador).
- **Por qué:** son vistas del mismo dato (cumplimiento de tiempos) con distinto alcance (mi cola / mi grupo / en riesgo / incumplidos / objetivos vigentes). Un supervisor las alterna constantemente; en pestañas se comparan sin cambiar de pantalla.
- **Pasos:** REC-FUS ×4. **Colisión de rutas:** la URL nueva `/plataforma/servicios/sla` es prefijo de las viejas; mueve primero el contenido de `sla/escalamientos/page.tsx` a `sla/page.tsx` y borra después las carpetas hijas. REC-PER. Actualiza la «tarjeta de riesgo de SLA» del panel y cualquier enlace.
- **Resultado esperado:** 1 pantalla con 5 vistas (6 tras la Fase 6); 4 URLs viejas → 404.

**Resultados esperados de la Fase 4:** (E4.1) árbol de «Mesa de Servicio» igual al Anexo B; (E4.2) **27 filas de menú eliminadas** en esta fase: #21024, #21044, #21046–#21049, #21230, #21232, #21234, #21235, #21241, #21243, #21245, #21246, #21239, #21186, #21187, #21252–#21261; (E4.3) 0 referencias a las URLs viejas de esos bloques; (E4.4) `TablaTickets` soporta exactamente las 6 vistas; (E4.5) prueba de permisos: técnico con solo `asignados` no accede a `todos` (ni por UI ni por llamada directa a la acción); (E4.6) build y tests verdes; (E4.7) `informe-fase-4.md`.

---

## 12. FASE 5 — Cambios (habilitación de cambios)

**Estado final esperado de la raíz «Cambios» (#21059):** 8 pantallas planas (sin sub-agrupadores), en este orden: **Solicitar cambio** (#21070), **Mis cambios** (#21068), **Gestión de cambios** (#21073), **CAB y ECAB** (#21082), **Calendario de cambios** (#21071), **Modelos de cambio estándar** (#21090), **Revisión post-implementación** (#21077), **Configuración de cambios** (#21191).

**Principio ITIL 4:** la *change authority* debe ser proporcional al riesgo: cambios estándar preautorizados, normales según el riesgo, emergencias por ECAB. Se **conserva** esa lógica; se quitan las pantallas redundantes y la configuración del flujo.

### Bloque 5.1 — Solicitar cambio: 2 formularios → 1
- **IDs:** sobreviviente **#21070** (`/plataforma/cambios/nuevo`); se fusiona #21086 (`/plataforma/cambios/gestion/crear`).
- **Por qué:** dos altas de RFC son dos formularios que mantener y que divergen con el tiempo.
- **Pasos:** compara ambos formularios campo a campo. El que contenga el **superconjunto** sobrevive; los campos exclusivos del otro pasan al sobreviviente **con la capacidad que hoy los restringe**. Elimina el componente y la ruta sobrantes. Actualiza enlaces (botones «Nuevo cambio» en otras pantallas, desde el expediente del problema y del incidente).
- **Resultado esperado:** 1 alta de RFC; la otra ruta → 404; los enlaces desde incidentes/problemas siguen creando RFC vinculado.

### Bloque 5.2 — Mis cambios: 8 pantallas → 1 con 6 vistas
- **IDs:** sobreviviente **#21068**; se fusionan #21064 (`por-implementar`), #21063 (`afectan-area`), #21065 (`afectan-equipo`), #21066 (`afectan-servicios`), #21067 (`historial`); #21062 va al Calendario (5.3); #21061 va a Mis aprobaciones (3.2). Se elimina el sub-agrupador #21060.
- **Por qué:** son listados del mismo universo (cambios) con distinto filtro. Los tres «afectan…» son el mismo informe con tres alcances; **cada alcance es una vista propia** porque lo ve un perfil distinto (jefe de área, líder de equipo, dueño de servicio) y R5 exige que ninguno vea el alcance de otro.
- **Pasos:** REC-FUS ×5 con vistas del Anexo C; REC-PER; elimina rutas/componentes exclusivos.
- **Resultado esperado:** un jefe de área con solo #21063 ve únicamente `afectan-area`; 5 URLs viejas → 404.

### Bloque 5.3 — Calendario de cambios: 4 entradas → 1 con 2 vistas
- **IDs:** sobreviviente **#21071** (`/plataforma/cambios/gestion/calendario`); se fusionan #21062 («Calendario de mis cambios», `/plataforma/cambios/calendario` → filtro `solo-mios=1` de la vista `calendario`), #21069 y #21076 (ambos → vista `programacion`, que unifica «Programación del equipo» y «Programación de cambios autorizados»).
- **Por qué:** calendario y programación son dos presentaciones (cuadrícula y agenda) del mismo cronograma; ITIL 4 pide un único *change schedule*.
- **Pasos:** REC-FUS; la vista `calendario` incluye ventanas de mantenimiento y congelamientos como capas existentes; REC-PER.
- **Resultado esperado:** 1 pantalla; 3 URLs viejas → 404.

### Bloque 5.4 — Gestión de cambios: 5 pantallas → 1 con 4 vistas; se elimina «Conflictos»
- **IDs:** sobreviviente **#21073** (URL nueva `/plataforma/cambios/gestion`, antes `/gestion/evaluacion`); se fusionan #21079 (`aprobacion`), #21078 (`ejecucion`), #21080 (`historial`); se elimina #21074 «Conflictos y capacidad»; se elimina el sub-agrupador #21072. Vista por defecto `por-evaluar`.
- **Por qué:** el gestor sigue el ciclo de vida del RFC (evaluar → aprobar → ejecutar → cerrar) como pestañas de una sola consola. La pantalla de conflictos duplica el análisis de conflictos que **ya existe dentro del expediente del cambio** y el motor de detección permanece; ver conflicto en el expediente es suficiente para el MVP.
- **Pasos:** REC-FUS ×3; **colisión de rutas:** crea `gestion/page.tsx` después de comprobar que no existe una página índice previa (si existe y es una redirección, **elimínala**: R2); elimina `gestion/evaluacion`; REC-ELI de #21074 (conserva el motor y la pestaña de conflictos del expediente).
- **Resultado esperado:** 4 vistas; 4 URLs viejas → 404; el expediente del cambio sigue mostrando conflictos.

### Bloque 5.5 — CAB y ECAB: 4 pantallas → 1 con 4 vistas
- **IDs:** sobreviviente **#21082** (URL nueva `/plataforma/cambios/cab`); se fusionan #21084 (duplicado de ID de la misma pantalla → `agenda`), #21083 (`emergencia`), #21085 (`dictamen`); la vista `miembros` recibe los **miembros y quórum** que hoy están en la pestaña «Comités» de la configuración del flujo (#21193). Se elimina el sub-agrupador #21081.
- **Por qué:** todo lo del CAB ocurre en el mismo momento (sesión): convocatoria, votación, acta y emergencia. Los miembros del CAB pertenecen a esa pantalla, no a una configuración de flujo.
- **Pasos:** REC-FUS ×3; mueve el componente de miembros/quórum; REC-PER (`miembros` hereda de #21193); elimina rutas `/plataforma/cambios/cab/agenda`, `/cab/emergencia`, `/gestion/cab` y las equivalentes del Anexo A.
- **Resultado esperado:** 1 pantalla; el quórum y los votos se registran igual que antes.

### Bloque 5.6 — Modelos de cambio estándar: 4 lugares → 1 pantalla
- **IDs:** sobreviviente **#21090** (`/plataforma/cambios/modelos`); se fusiona #21075 (`administracion`). Además, **se eliminan** las pestañas «Modelos estándar» de la configuración del formulario (#21191) y de «Tipos de cambio» (#21196).
- **Por qué:** los modelos aparecían en cuatro sitios. Los cambios estándar son el mecanismo ITIL 4 para dar velocidad a lo repetitivo y de bajo riesgo; basta **un** catálogo. La consulta (cualquiera con permiso) y la administración (alta/edición) son **vistas distintas** para no dar edición a quien solo consultaba (R5).
- **Pasos:** REC-FUS; REC-PER; borra las dos pestañas duplicadas y sus componentes si quedan sin uso.
- **Resultado esperado:** 1 catálogo; búsqueda del componente de modelos estándar muestra un único consumidor de cada vista.

### Bloque 5.7 — Calendario, PIR y Expediente 360 (sin cambios funcionales)
- **#21077 (PIR):** se conserva tal cual (`/plataforma/cambios/gestion/pir`); solo se actualizan enlaces.
- **Expediente 360° del cambio (7 pestañas):** **no se modifica**. Es la pantalla de trabajo diario y la que ITIL 4 más necesita.
- **Resultado esperado:** ambos cargan; enlaces actualizados.

### Bloque 5.8 — Configuración de cambios (la pantalla de 7 pestañas) → 5 vistas
- **IDs:** sobreviviente **#21191** → «Configuración de cambios» (URL `/plataforma/cambios/configuracion`, antes `/configuracion/formulario`). Se fusionan: #21196 (`autoridad`) y las cuatro filas que comparten la URL de «notificaciones-calendario» — #21192 Feriados, #21195 Congelamientos, #21197 Ventanas (`calendario`). Se eliminan #21193 (Flujo de evaluación) y #21194 (Notificaciones).
- **Por qué (esta es la pantalla de 7 pestañas):** configurar un cambio se repartía en **cuatro** pantallas y **25 pestañas** (formulario 7 + flujo 8 + tipos 4 + calendario/notificaciones 6). Se conserva solo lo que una empresa necesita personalizar y se siembra el resto.
- **Decisión pestaña por pestaña** (verifica los nombres reales en el código y decide **por función**):

| Pestaña (según el manual) | Decisión | Razón |
|---|---|---|
| Formulario: Campos | **Conservar** (`campos`) | Visibilidad/obligatoriedad por tipo de cambio |
| Formulario: Campos personalizados | Eliminar | Fase 2 (regla de 0.9) |
| Formulario: Listas y catálogos | **Conservar** (`listas`) | Alimenta desplegables; sin ella no se podrían editar categorías |
| Formulario: Cuestionario de riesgo | **Conservar** (`riesgo`) | Es la evaluación de riesgo/impacto que exige ITIL 4 |
| Formulario: Prioridad | Eliminar | Se usa la **matriz única** de #21167 (Fase 10) |
| Formulario: Modelos estándar | Eliminar | Está en #21090 (5.6) |
| Formulario: Diseño del ticket | Eliminar | Editor visual de maquetación: costoso, no requerido |
| Flujo (8 pestañas: estados, transiciones, etapas, tareas por defecto, SoD, comités, tiempos…) | Eliminar la UI; **sembrar** valores vigentes | Los motores siguen leyendo las tablas; los miembros del CAB pasan a 5.5 |
| Tipos de cambio: matriz de autoridad | **Conservar** (`autoridad`) | Define quién autoriza según riesgo (proporcionalidad ITIL 4) |
| Tipos de cambio: parámetros de tipo, reglas de clasificación, modelos | Eliminar | Sembrados / duplicado |
| Calendario: Ventanas, Congelamientos, Feriados | **Conservar** (los tres apilados en la vista `calendario`) | Base del *change schedule* |
| Calendario: conflictos y capacidad (parámetros) | Eliminar | Motor con valores sembrados |
| Notificaciones por canal / presentación ICS | Eliminar | Fase 2 |

- **Pasos:** REC-FUS/REC-ELI según la tabla; REC-PER; actualiza el enlace «Configuración» del menú y de cualquier atajo; borra las 4 rutas/pestañas sobrantes y sus componentes.
- **Resultado esperado:** 25 pestañas → **5 vistas** (`campos`, `listas`, `riesgo`, `autoridad`, `calendario`) + `miembros` en 5.5; los cambios se evalúan y aprueban con las mismas etapas y valores que antes.

### Bloque 5.9 — Aprobaciones de cambios
Ya resueltas en el bloque 3.2 (#21061, #21088, #21089). Verifica que el expediente del cambio enlaza a `/plataforma/aprobaciones?vista=pendientes&tipo=cambio…` y no a las rutas viejas.

**Resultados esperados de la Fase 5:** (E5.1) 8 hijos planos en «Cambios» en el orden indicado; (E5.2) **27 filas de menú eliminadas** en esta fase: #21060, #21062–#21067, #21069, #21072, #21074–#21076, #21078–#21081, #21083–#21087, #21192–#21197; (E5.3) 0 referencias a las URLs viejas del Anexo D bajo `/plataforma/cambios/`; (E5.4) una RFC de prueba recorre solicitud → evaluación → aprobación → programación → implementación → PIR sin errores; (E5.5) 0 `redirect(` de obsolescencia en `/cambios`; (E5.6) pestañas de configuración: 5 vistas (+ `miembros`); (E5.7) build y tests verdes; (E5.8) `informe-fase-5.md`.

---

## 13. FASE 6 — Problemas

**Estado final esperado de la raíz «Problemas» (#21091):** 5 pantallas — **Registrar problema** (#21105), **Bandeja de problemas** (#21093), **Candidatos a problema** (#21095), **Errores conocidos** (#21098), **Configuración de problemas** (#21199).

### Bloque 6.1 — Bandeja de problemas: 5 entradas → 1 con 4 vistas
- **IDs:** sobreviviente **#21093** (URL nueva `/plataforma/problemas/bandeja`, antes `/problemas/asignacion`); se fusionan #21094 (duplicado de ID → `sin-asignar`), #21102 (`asignados`), #21103 (`grupo`), #21106 (`historial`).
- **Por qué:** «Bandeja y asignación», «Asignados a mí», «De mi grupo» e «Historial» son filtros de la misma lista de problemas. El nombre de URL `asignacion` dejaría de describir el contenido, por eso se renombra.
- **Pasos:** REC-FUS ×4 con vistas del Anexo C; REC-PER; REC-URL (colisión: la ruta nueva no existe aún; crea y luego borra la vieja); actualiza enlaces desde incidentes («Vincular a problema»), panel del gestor de problemas y notificaciones.
- **Resultado esperado:** 1 pantalla / 4 vistas; 4 URLs viejas → 404.

### Bloque 6.2 — Candidatos a problema: 3 entradas → 1 con 2 vistas
- **IDs:** sobreviviente **#21095** (`/plataforma/problemas/candidatos`); se fusionan #21096 (duplicado de ID → `propuestos`) y #21100 «Incidentes recurrentes» (`recurrentes`).
- **Por qué:** ambas detectan el mismo insumo del proceso de problemas (qué incidentes merecen análisis): unos propuestos por el equipo, otros detectados por recurrencia.
- **Resultado esperado:** 1 pantalla / 2 vistas; 2 URLs viejas → 404.

### Bloque 6.3 — Análisis de causa raíz: de pantalla de menú a pestaña del expediente
- **ID:** #21092 («Análisis de causa raíz») deja de ser opción de menú; su contenido pasa a ser la pestaña **«Causa raíz»** del **expediente del problema** (detalle `[id]`).
- **Por qué:** un análisis de causa raíz siempre pertenece a **un problema concreto**; una pantalla suelta obliga a elegir primero el problema y se desconecta del resto del expediente (incidentes vinculados, errores conocidos, RFC).
- **Pasos:**
  1. Haz que los componentes de análisis reciban `problemaId` (si ya lo reciben, no cambies nada).
  2. Conserva las técnicas: **5 Porqués**, **línea de tiempo** y **conclusión de causa raíz**. **Elimina «Ishikawa»** (fase 2).
  3. REC-PER: quien tenía #21092 recibe la capacidad de editar causa raíz; el resto la ve en solo lectura según su rol actual.
  4. Elimina la ruta y los enlaces a `/plataforma/problemas/analisis`.
- **Resultado esperado:** la pestaña funciona dentro del expediente; no hay componente huérfano de Ishikawa; la ruta vieja → 404.

### Bloque 6.4 — Funciones de problemas que se eliminan
- **IDs:** #21097 Conocimiento derivado, #21104 Problemas mayores y comités PIR, #21107 Aprobación de riesgo y cierre, #21108 Solicitudes de cambio derivadas, #21200 Flujo (config), #21201 Relaciones y automatizaciones (config), y #21101 Objetivos de tiempo (pasa a Monitor de SLA, ver 6.5).
- **Por qué (uno por uno):**
  - #21097: lista de artículos que ya se generan desde un botón del expediente; la pantalla solo duplicaba esa lista.
  - #21104: concepto de «problema mayor» y comité de PIR no es requisito de ITIL 4 (el proceso de revisión formal aplica a incidentes mayores y a cambios).
  - #21107: bandeja aparte para una decisión que ocurre **dentro del expediente**. Se conserva la **transición** «Aceptar riesgo / cerrar» en el expediente, protegida por la **capacidad que hoy usa esa pantalla**; sin bandeja separada (la persona recibe una notificación in-app).
  - #21108: el expediente ya tiene la pestaña de RFC vinculadas.
  - #21200/#21201: flujo, relaciones y umbrales automáticos se **siembran**; no se edita la UI.
- **Pasos:** REC-ELI de cada uno con `dependencias-eliminacion.md`; **no elimines** el motor de umbrales ni el cálculo de prioridad si algún job los usa.
- **Resultado esperado:** 6 filas eliminadas; expediente de problema con sus pestañas intactas (+ «Causa raíz»); transición de riesgo operativa.

### Bloque 6.5 — Monitor de SLA: vista `problemas`
- **ID:** #21101 → vista `problemas` de #21045 (Monitor de SLA, bloque 4.7).
- **Resultado esperado:** Monitor de SLA con 6 vistas; `/plataforma/problemas/objetivos` → 404.

### Bloque 6.6 — Registrar problema y Configuración de problemas
- **#21105:** se conserva; **se elimina** el botón/modal «Cargar desde plantilla» (las plantillas de problema desaparecen con la configuración).
- **#21199** → «Configuración de problemas» (URL `/plataforma/problemas/configuracion`, antes `/configuracion/formulario`), vistas `campos` y `listas`. De sus 6 pestañas se eliminan **Campos personalizados, Prioridad (usa la matriz única de #21167), Plantillas y Diseño del ticket**.
- **Por qué:** misma lógica que 5.8: solo se deja editable lo que varía por empresa; `listas` alimenta desplegables (categorías, componentes, tipos de causa).
- **Resultado esperado:** 6 pestañas → 2 vistas; el cálculo de prioridad de problemas lee la matriz global (ver Fase 10, punto 10.2).

**Resultados esperados de la Fase 6:** (E6.1) 5 hijos en «Problemas» según Anexo B; (E6.2) **15 filas de menú eliminadas**: #21092, #21094, #21096, #21097, #21099, #21100, #21101, #21102, #21103, #21104, #21106, #21107, #21108, #21200, #21201; (E6.3) 0 referencias a las URLs viejas bajo `/plataforma/problemas/`; (E6.4) una prueba de recorrido incidente recurrente → candidato → problema → causa raíz → error conocido → RFC → cierre funciona; (E6.5) 0 referencias a `Ishikawa`; (E6.6) build y tests verdes; (E6.7) `informe-fase-6.md`.

---

## 14. FASE 7 — Activos

**Estado final esperado del sub-agrupador «Activos» (#21110):** 8 pantallas — **Inventario de activos** (#21114), **Mis activos** (#21118), **Asignación y actas** (#21112), **Mantenimiento y garantías** (#21126), **Licencias de software** (#21132), **Contratos y proveedores** (#21144), **Bajas de activos** (#21123), **Configuración de activos** (#21154). Los sub-agrupadores #21120, #21125, #21128, #21143 y #21148 desaparecen.

### Bloque 7.1 — Inventario de activos: 4 entradas → 1 con 4 vistas
- **IDs:** sobreviviente **#21114** (`/plataforma/activos/inventario`); se fusionan #21111 («Activos de mi área» → `mi-area`), #21117 («Inventario operativo» → `operativo`), #21113 («Importación masiva» → `importar`). #21118 «Mis activos» se conserva (autoservicio).
- **Por qué:** son el mismo inventario con distinto alcance (todo / mi área / operativo). La importación masiva es una **acción** del inventario, no un destino de menú.
- **Pasos:** REC-FUS; para `importar` renderiza el asistente existente dentro de la pantalla (si es una página, intégrala como contenido de la vista; si es modal, ábrelo desde un botón con la capacidad actual); REC-PER (`mi-area` y `operativo` conservan sus alcances: **no concedas `todos` a quien solo tenía `mi-area`**).
- **Resultado esperado:** 1 pantalla / 4 vistas; 3 URLs viejas → 404.

### Bloque 7.2 — Mantenimiento y garantías
- **IDs:** sobreviviente **#21126** (`/plataforma/activos/mantenimiento`); se fusiona #21127 Reparaciones (`reparaciones`); se elimina el sub-agrupador #21125.
- **Resultado esperado:** 2 vistas; 1 URL vieja → 404.

### Bloque 7.3 — Licencias de software: 4 entradas → 1 con 3 vistas; se elimina «Cumplimiento y sobreuso»
- **IDs:** sobreviviente **#21132** (`licencias`, mantenimiento del maestro); se fusionan #21130 (`consulta`, solo lectura) y #21129 (`catalogo-software`); se elimina #21131 y el sub-agrupador #21128.
- **Por qué:** la gestión de licencias necesita el maestro, un catálogo de software autorizado y una consulta de lectura. **«Cumplimiento y sobreuso»** compara licencias contra **instalaciones detectadas por agentes en la red**: requiere infraestructura de descubrimiento que no existe; sin ella la pantalla no puede funcionar y es el mayor costo de verificación de este módulo.
- **Regla R5:** `consulta` es una vista **distinta** de `licencias` para que quien solo consultaba no obtenga edición.
- **Resultado esperado:** 3 vistas; #21131 y sus cálculos de cumplimiento eliminados; 3 URLs viejas → 404.

### Bloque 7.4 — Contratos y proveedores: 4 entradas → 1 con 4 vistas
- **IDs:** sobreviviente **#21144** (`/plataforma/activos/contratos`); se fusionan #21145 («Licencias y contratos de mi departamento» → `mi-area`, **alcance restringido**), #21146 (`proveedores`), #21147 (`renovaciones`); se elimina el sub-agrupador #21143.
- **Por qué:** contratos, renovaciones y proveedores son una misma agenda de vigencias; ITIL 4 trata proveedor y contrato como el mismo registro de gestión de proveedores.
- **Resultado esperado:** 4 vistas; 3 URLs viejas → 404; las alertas de vencimiento 90/60/30 días siguen emitiendo notificaciones (evento 14).

### Bloque 7.5 — Bajas de activos: de 4 pantallas a 1 con 2 vistas
- **IDs:** sobreviviente **#21123** (`/plataforma/activos/bajas`); se fusiona #21122 («Consulta de bajas» → `consulta`); #21121 («Aprobación de bajas de mi área») ya pasó a Mis aprobaciones (3.2); se elimina #21124 («Bajas y renovaciones por monto») y el sub-agrupador #21120.
- **Por qué:** el ciclo de baja es gestionar y consultar; la aprobación ya está en la bandeja única; el análisis financiero por monto es un reporte fuera de alcance.
- **Resultado esperado:** 2 vistas; 3 URLs viejas → 404.

### Bloque 7.6 — Funciones físicas y de compras que se eliminan
- **IDs:** #21115 Campañas de inventario físico, #21116 Inventario físico en campo, #21119 Recepción de adquisiciones.
- **Por qué:** requieren operación en terreno (lectores de código de barras, móvil) y un proceso de compras que no está entre las gestiones pedidas. ITIL 4 pide conocer el activo y su ciclo de vida, no ejecutar conteos físicos desde el sistema.
- **Pasos:** REC-ELI; conserva campos/estados del activo que el ciclo de vida usa.
- **Resultado esperado:** 3 filas y 3 rutas eliminadas; ningún componente de escaneo/campo sin uso.

### Bloque 7.7 — Configuración de activos
- **IDs:** sobreviviente **#21154** → «Configuración de activos» (URL `/plataforma/activos/configuracion`, antes `/configuracion/tipos-modelos-atributos`); se fusionan #21150 (`fabricantes-modelos`), #21155 (`ubicaciones`), #21152 (`listas`); se eliminan #21149 (Ciclos de vida) y #21151 (Licencias y contratos: tipos y alertas), y el sub-agrupador #21148. #21153 pasa a CMDB (Fase 8).
- **Vistas finales:** `tipos-atributos` (clases/tipos y atributos por tipo), `fabricantes-modelos`, `ubicaciones`, `listas`.
- **De sus 9 pestañas** se eliminan «Código y etiquetas» (sembrar el esquema de código vigente), «Formulario de activo (diseño)», «Ficha y listado» e «Importación de inventario (parámetros)». **Verifica** que el alta de activos sigue generando el código patrimonial con el esquema vigente.
- **Por qué:** fabricantes/modelos y ubicaciones aparecían **dos veces** (pantalla propia y pestaña); ciclos de vida y tipos de licencia/contrato son listas cerradas ITIL (sembradas).
- **Resultado esperado:** 3 + 6 + 6 + 9 pestañas de configuración de activos → **4 vistas**; 5 URLs viejas → 404.

**Resultados esperados de la Fase 7:** (E7.1) «Activos» con 8 hijos según Anexo B; (E7.2) **25 filas de menú eliminadas**: #21111, #21113, #21115, #21116, #21117, #21119, #21120, #21122, #21124, #21125, #21127, #21128, #21129, #21130, #21131, #21143, #21145, #21146, #21147, #21148, #21149, #21150, #21151, #21152, #21155; (E7.3) 0 referencias a las URLs viejas bajo `/plataforma/activos/`; (E7.4) `mi-area` no da acceso a `todos` (prueba de permisos); (E7.5) alta de activo genera código; asignación con acta, mantenimiento y baja funcionan; (E7.6) build y tests verdes; (E7.7) `informe-fase-7.md`.

---

## 15. FASE 8 — CMDB (gestión de configuración)

**Estado final esperado del sub-agrupador «CMDB» (#21133):** 4 pantallas — **CIs** (nueva), **Topología y relaciones** (#21139), **Análisis de impacto** (#21135), **Configuración de CMDB** (#21141).

### Bloque 8.1 — CIs (N5): garantizar que exista el registro de elementos de configuración
- **Por qué:** ITIL 4 (gestión de la configuración de servicios) exige poder **ver, crear y mantener CIs** y sus relaciones. El manual documenta análisis, topología, clases y calidad, pero **ninguna pantalla para listar/crear CIs**.
- **Caso A** (según 0.10.1: ya existe una ruta o vista que lista/crea CIs): crea la **fila de menú nueva «CIs»** apuntando a esa ruta; no construyas nada.
- **Caso B** (no existe): construye el mínimo —
  - Lista `/plataforma/cmdb/cis`: filtros por clase, estado y criticidad; búsqueda por nombre/código.
  - Alta y edición: clase (de la configuración de CMDB), atributos de la clase, estado, criticidad, propietario, servicio(s) que sostiene. Sin importación masiva ni descubrimiento.
  - Detalle del CI con sus relaciones (alta/baja de relaciones, tipos de la configuración de CMDB) y los incidentes/cambios que lo mencionan.
  - Reutiliza componentes de formulario y tabla existentes; **no** añadas gráficas ni auditoría.
- **Permisos:** concede la nueva fila a la **unión** de perfiles que tenían #21135, #21139 o #21141; la edición se rige por las capacidades de CMDB existentes.
- **Resultado esperado:** existe una pantalla «CIs» operativa (Caso A o B) y los selectores de CI del expediente del ticket/cambio/problema siguen funcionando.

### Bloque 8.2 — Topología y relaciones
- **IDs:** se conserva **#21139** (`/plataforma/cmdb/topologia`); se fusiona #21140 (duplicado de ID). Renombrar a «Topología y relaciones».
- **Resultado esperado:** 1 fila; mapa y relaciones funcionan.

### Bloque 8.3 — Configuración de CMDB: 2 pantallas → 1 con 2 vistas
- **IDs:** sobreviviente **#21141** → «Configuración de CMDB» (URL `/plataforma/cmdb/configuracion`, antes `/cmdb/tipos`), vistas `clases` y `relaciones`; se fusiona #21153 («Tipos de CI y relaciones»), conservando solo **clases/tipos** y **tipos de relación** (sus otras pestañas: reglas de integridad, criticidad y entornos, fuentes protegidas, auditoría/líneas base → se eliminan; criticidad y entornos quedan **sembrados**).
- **Por qué:** «Modelado de clases de CI» y «Tipos de CI y relaciones» eran dos pantallas para definir **las clases de CI**. Una sola.
- **Resultado esperado:** 2 vistas; 2 URLs viejas → 404.

### Bloque 8.4 — Eliminaciones de CMDB
- **IDs:** #21134 Actualizaciones desde cambios, #21136 Calidad y auditoría, #21137 Inexactitudes reportadas, #21138 Líneas base, #21142 Resultados de auditorías.
- **Por qué:** son controles de calidad avanzados (ITIL los recomienda, no los exige para operar). La **sincronización automática del CMDB al cerrar un cambio no se toca**: #21134 era solo la pantalla de reconciliación manual.
- **Pasos:** REC-ELI; conserva el servicio que aplica los cambios al CMDB cuando se cierra un RFC.
- **Resultado esperado:** 5 filas eliminadas; el cierre de un cambio de prueba actualiza el CI afectado.

**Resultados esperados de la Fase 8:** (E8.1) «CMDB» con 4 hijos; (E8.2) **7 filas de menú eliminadas**: #21134, #21136, #21137, #21138, #21140, #21142, #21153 (+1 fila nueva «CIs»); (E8.3) 0 referencias a las URLs viejas bajo `/plataforma/cmdb/` y `/activos/configuracion/cmdb-relaciones`; (E8.4) un CI se crea, se relaciona, aparece en Topología y en Análisis de impacto; (E8.5) build y tests verdes; (E8.6) `informe-fase-8.md`.

---

## 16. FASES 9 a 14 — Conocimiento, Catálogo, Reportes, Organización, Plataforma, Operación

### FASE 9 — Gestión del conocimiento
**Estado final de «Conocimiento» (#21156):** 5 pantallas — Base de conocimiento (#21157), Crear artículo (#21159), Mis artículos (#21160), **Revisión y publicación** (#21161), Configuración de conocimiento (#21202).
- **9.1 (#21158):** duplicado de ID de la Base de conocimiento → se elimina la fila duplicada.
- **9.2 Revisión y publicación:** sobreviviente #21161 (`/plataforma/conocimiento/publicacion`, antes `/conocimiento/revisiones`); se fusiona #21162 «Revisiones pendientes» como vista `pendientes`. **Por qué:** es la misma cola de arbitraje de artículos. **R5:** `pendientes` y `publicacion` son vistas separadas para que quien solo revisaba no obtenga capacidad de publicar.
- **9.3 Configuración (#21202):** se conservan las vistas `articulos` (inventario maestro: **único lugar** para retirar o corregir artículos publicados ajenos; ITIL/KCS exige gestionar su ciclo de vida) y `politicas` (categorías, responsables, frecuencia de revisión). Se **elimina** «Vista previa del portal». **Verifica** que las categorías se administran aún desde alguna vista; si vivían en la pestaña eliminada, muévelas a `politicas`.
- **Resultado esperado de la Fase 9:** (E9.1) 5 hijos; (E9.2) 2 filas eliminadas (#21158, #21162); (E9.3) 2 URLs viejas → 404; (E9.4) flujo borrador → revisión → publicación → retiro funcional; (E9.5) 0 referencias a la vista previa del portal; (E9.6) `informe-fase-9.md`.

### FASE 10 — Catálogo de servicios y matriz de prioridad/SLA únicos
**Estado final de «Catálogo de Servicios» (#21163):** 2 pantallas — **Catálogo de servicios** (#21164) y **Objetivos SLA y matriz de prioridad** (#21167).
- **10.1 Catálogo único:** sobreviviente #21164 (`/plataforma/servicios/catalogo`) con vistas `explorar` (con filtro `?tipo=incidente|solicitud`), `administrar-incidentes` (#21168), `administrar-solicitudes` (#21169), `crear` (#21166, el asistente de alta de servicio) y `categorias` (#21165). Se fusionan además #21237 («Catálogo de incidentes») y #21248 («Catálogo de solicitudes») dentro de `explorar`. **Por qué:** eran **tres vistas del mismo catálogo** más cuatro pantallas de administración sobre las mismas tablas. **R5:** `administrar-incidentes`, `administrar-solicitudes` y `crear` son vistas distintas porque las gobiernan perfiles distintos (gestor de incidentes vs. de solicitudes). Actualiza los enlaces de las tarjetas del catálogo («Reportar incidente», «Solicitar») hacia los formularios de registro con el servicio preseleccionado.
- **10.2 Matriz de prioridad ÚNICA:** #21167 es **la** matriz Impacto × Urgencia y los objetivos SLA del sistema (vistas `tiempos` y `matriz`). Incidentes, solicitudes, problemas y cambios **calculan su prioridad con esta matriz**. Si Fase 0 (0.9) halló que Problemas o Cambios tienen tablas propias: compara valores; si son iguales, apunta el cálculo a la matriz global y borra el código duplicado; si difieren, **gana la global** y registra la diferencia en «Decisiones a confirmar» del informe. **Por qué:** una matriz que se edita en tres sitios es el origen típico de «¿por qué este ticket tiene otra prioridad?».
- **Resultado esperado de la Fase 10:** (E10.1) 2 hijos; (E10.2) **6 filas eliminadas**: #21165, #21166, #21168, #21169, #21237, #21248; (E10.3) 6 URLs viejas → 404; (E10.4) una sola tabla/fuente de matriz de prioridad consultada por los 4 módulos (búsqueda de accesos a tablas de matriz = 1 servicio); (E10.5) `informe-fase-10.md`.

### FASE 11 — Reportes
**Estado final de «Reportes» (#21174):** 4 pantallas — **Indicadores operativos y SLA** (#21175), **Reportes de cambios y problemas** (#21179), **Reportes de activos** (#21178), **Productividad individual** (#21177).
- #21182 «Reportes del área» → vista `area` de #21175 (`/plataforma/reportes/operativos`); #21181 «Reportes de problemas» → vista `problemas` de #21179 (`/plataforma/reportes/cambios`, renombrado «Reportes de cambios y problemas»). **Por qué:** mismo motor de reportes con distinto alcance/módulo.
- Se eliminan #21176 (Informes de auditoría), #21180 (Reportes de decisiones) y #21183 (ya eliminada en 3.1). **Por qué:** informes de auditoría formal y analítica de decisiones son de fase 2; los tableros viven en Inicio.
- **Resultado esperado:** (E11.1) 4 hijos; (E11.2) 4 filas eliminadas: #21176, #21180, #21181, #21182; (E11.3) 4 URLs viejas → 404; (E11.4) los reportes exportan/consultan como antes; (E11.5) `informe-fase-11.md`.

### FASE 12 — Organización
**Estado final de «Organización» (#21264):** 2 pantallas — **Departamentos empresariales** (#21204) y **Grupos y técnicos de TI** (#21205).
- #21205 (URL nueva `/plataforma/organizacion/grupos-ti`, antes `/organizacion/departamentos`) absorbe #21206 «Supervisores» (`supervisores`) y #21207 «Técnicos y niveles» (`tecnicos`); vista `grupos` por defecto. **Por qué:** grupo resolutor, sus técnicos con nivel y sus supervisores son **un único objeto** (el equipo de soporte); el URL antiguo `departamentos` era engañoso (confundible con #21204). **Colisión de rutas:** `/organizacion/departamentos/supervisores` es hija de la ruta que se renombra; mueve y borra en el orden de REC-URL.
- **Resultado esperado:** (E12.1) 2 hijos; (E12.2) 2 filas eliminadas: #21206, #21207; (E12.3) 3 URLs viejas → 404 (`/organizacion/departamentos`, `/departamentos/supervisores`, `/organizacion/tecnicos`); (E12.4) las asignaciones automáticas siguen resolviendo grupos y niveles; (E12.5) `informe-fase-12.md`.

### FASE 13 — Plataforma (seguridad y administración)
**Estado final de «Plataforma» (#21215):** 3 pantallas planas — **Usuarios** (#21209), **Perfiles y permisos** (#21210), **Auditoría y accesos** (#21220). #21212, #21214 y #21227 ya se eliminaron en la Fase 2.
- **13.1 Auditoría y accesos:** sobreviviente #21220 (`/plataforma/seguridad/auditoria-sistema`) con vistas `configuracion` (auditoría de cambios de configuración) y `accesos` (#21221, registros de seguridad/autenticación). **Por qué:** «quién cambió qué» y «quién entró» son las dos mitades de la trazabilidad de seguridad.
- **13.2 Usuarios (#21209):** se conserva; se retira «Enviar credenciales por correo» (ver N6): al crear o restablecer, el administrador ve la contraseña temporal **una sola vez** y el usuario debe cambiarla al primer ingreso.
- **13.3 Perfiles y permisos (#21210):** se conserva con el grid dinámico y vistas de la Fase 1.
- **13.4 Se eliminan (fase 2 del producto o herramienta de desarrollo):** #21208 y #21211 (sub-agrupadores), #21213 Estructura del menú (editor del árbol: el menú se gestiona por migración/seed), #21216 Cumplimiento (sub-agrupador), #21217 Cambios sin autorización, #21218 Muestreo de auditoría, #21219 Segregación de funciones, #21222 Recertificación de accesos, #21223 Retención de datos, #21224 Salud del sistema.
- **Regla importante:** eliminar la **pantalla** de segregación de funciones **no** elimina la **regla** (quien solicita/crea no puede aprobar su propio trámite). **Verifica** que el motor de aprobaciones la sigue aplicando; no la reimplementes si ya existe.
- **Resultado esperado de la Fase 13:** (E13.1) 3 hijos; (E13.2) **11 filas eliminadas**: #21208, #21211, #21213, #21216, #21217, #21218, #21219, #21221, #21222, #21223, #21224; (E13.3) toda fila eliminada que tuviera URL → 404 (los sub-agrupadores no tenían URL); (E13.4) prueba: un usuario no puede aprobar su propia solicitud/cambio; (E13.5) crear usuario muestra contraseña temporal y fuerza cambio; (E13.6) 0 referencias a correo en administración; (E13.7) `informe-fase-13.md`.

### FASE 14 — Retiro de la raíz «Operación» (#21170)
- Se eliminan #21170 (raíz), #21172 Eventos y alertas (`/plataforma/operacion/eventos`), #21173 Eventos y resiliencia (`/plataforma/operacion/eventos-resiliencia`) y #21171 Disponibilidad, capacidad y continuidad (`/plataforma/operacion/resiliencia`).
- **Por qué:** gestión de eventos/monitoreo, disponibilidad, capacidad y continuidad **no están entre las gestiones requeridas**, necesitan integraciones de monitoreo externas y tienen ~10 pestañas. Son prácticas ITIL 4 válidas para una fase posterior.
- **Pasos:** REC-ELI completo con `dependencias-eliminacion.md`: **verifica especialmente** que el botón «Promover evento a incidente» no sea el único origen de algún flujo de incidentes y que ningún *job* de ingesta quede ejecutándose sin consumidor.
- **Resultado esperado:** (E14.1) menú de **11** raíces; (E14.2) 4 filas eliminadas; (E14.3) las tres rutas anteriores → 404; (E14.4) jobs de eventos eliminados; (E14.5) `informe-fase-14.md`.

---

## 17. FASE 15 — Limpieza global y barrido de huérfanos

**Por qué una fase global:** cada bloque borró lo que sabía que quedaba huérfano; esta fase busca lo que **no** se vio (consumidores indirectos, constantes, estilos, tipos). Es lo que convierte «borré las pantallas» en «no queda código muerto».

1. **Rutas huérfanas.** Recorre `src/app/plataforma`: cada `page.tsx`/`route.ts` debe ser (a) una de las 58 URLs base del Anexo B, o (b) una ruta **permitida sin menú** (detalle `[id]`, sub-ruta de acción, login, acceso denegado, API) registrada con su pantalla padre en `docs/reestructuracion/rutas-permitidas-sin-menu.md`. **Toda otra ruta se elimina.**
2. **Redirecciones.** Repite el inventario de 0.8. Resultado: solo las 4 legítimas de R2; ninguna en `next.config.*` ni en `middleware` por obsolescencia.
3. **Código muerto.** Ejecuta `npx knip` (o `ts-prune` + `depcheck`) y elimina: archivos no importados, exports sin uso, tipos sin uso, dependencias sin uso. Repite hasta resultado vacío. Ten en cuenta *entry points* de Next.js (páginas, layouts, rutas API, `middleware`) para no borrar lo vivo; ante duda, busca el nombre con `grep` antes de borrar.
4. **Capacidades.** Cada constante de capacidad definida debe tener al menos un consumidor (guard, acción, componente). Las huérfanas se borran del código.
5. **Estilos, textos e imágenes** exclusivos de pantallas eliminadas.
6. **Configuración de entorno.** `.env.example`, `docker-compose`, CI: variables de correo/WhatsApp/webhooks y servicios asociados fuera.
7. **Base de datos.** Genera `deuda-bd.md`: tablas y columnas **sin ninguna referencia en el código** tras la reestructuración (no se borran: R6).
8. **Equivalencia seed ↔ migración.** Crea una BD vacía, aplica migraciones + seed, vuelca `opciones_menu`, `opciones_menu_perfiles` y la tabla de vistas; compáralos con la BD migrada: **diferencia 0** (V-12).
9. **Marcadores.** `grep -rniE "_old|\.bak|deprecated|TODO.*(elimin|quitar|borrar)|FIXME.*(ruta|menu)"` → 0 en lo que tocaste.

**Resultados esperados:** (E15.1) 0 rutas huérfanas; (E15.2) 0 redirecciones por obsolescencia; (E15.3) `knip` sin hallazgos y `depcheck` sin dependencias sin uso; (E15.4) 0 capacidades huérfanas; (E15.5) seed ≡ migración; (E15.6) `deuda-bd.md` generado; (E15.7) `informe-fase-15.md`.

---

## 18. FASE 16 — Documentación

1. **Regenera `MANUAL_FUNCIONAL_OPCIONES_MENU.md`** con el mismo formato, reflejando **solo** el estado final: encabezado con **73 filas (11 raíces, 4 sub-agrupadores, 58 pantallas)** y las vistas de cada pantalla (Anexo C). Elimina del manual toda sección de funciones removidas y corrige las afirmaciones falsas del original (p. ej. «cero redirecciones», conteos de pantallas). Añade una sección «Historial de la reestructuración» que enlace a `docs/reestructuracion/`.
2. Publica `docs/reestructuracion/mapa-urls.md` (= Anexo D) y `matriz-acceso-despues.csv`.
3. Actualiza `README` y cualquier documento que cite rutas, IDs o capacidades eliminadas (V-20 también cubre `docs/`, salvo `docs/reestructuracion/`).
4. Documenta la política vigente: **notificaciones solo in-app**, **estados/flujos sembrados**, **matriz de prioridad única**, **vistas con permiso propio** (cómo agregar una vista nueva).

**Resultados esperados:** (E16.1) el manual nuevo lista exactamente las 73 filas del Anexo B; (E16.2) 0 menciones en el manual a correo/WhatsApp como canal; (E16.3) documentos citados existen; (E16.4) `informe-fase-16.md`.

---

## 19. FASE 17 — Verificación final: contrato de «Resultados esperados»

> **Esta sección es el contrato de aceptación.** Ejecuta cada verificación, **pega la evidencia** (salida del comando) y marca *Esperado | Real | Estado*. Esta misma tabla servirá al dueño del producto para auditar el sistema completo contra lo prometido.

### 19.1 Números globales (antes → después)

| Métrica | Antes | Esperado después | Cómo medirla |
|---|---|---|---|
| IDs/filas de menú activas | 227 | **73** (11 raíces + 4 sub-agrupadores + 58 pantallas) | `SELECT count(*) FROM opciones_menu WHERE activo` y por nivel |
| IDs conservados | — | **71** (los marcados MANTENER en el Anexo A) | SQL con la lista del Anexo A |
| IDs eliminados o fusionados | — | **156** (90 fusionados + 66 eliminados); **0 de ellos existe** en BD | SQL |
| IDs nuevos | — | **2** («Notificaciones» y «CIs») | SQL |
| URLs de menú distintas | 186 | **58** | `SELECT count(DISTINCT url)` (sin raíces/subs) |
| URLs antiguas que deben dar 404 | — | **142** (48 eliminadas + 85 fusionadas + 9 renombradas) menos las que coincidan con una URL nueva | script V-21 |
| URLs antiguas sin cambio | — | 44 | Anexo D (no listadas) |
| Pantallas con vistas (pestañas con permiso) | — | **32** | registro de vistas |
| Vistas totales | — | **107** | registro de vistas |
| Pestañas de configuración | **87** | **22** (tabla 19.3) | recuento por pantalla |
| Raíces de menú | 12 | **11** (sin «Operación») | SQL |
| Redirecciones por obsolescencia | ≥ 2 (Búsqueda avanzada, Tableros) | **0** | inventario 0.8 vs 15.2 |
| Canales de notificación | correo, WhatsApp, webhook, in-app | **solo in-app** | grep V-18 |
| Matrices de prioridad editables | 3 | **1** (#21167) | búsqueda de pantallas/pestañas de matriz |

### 19.2 Pantallas por módulo (después)

| Módulo | IDs hoy | Pantallas finales |
|---|---|---|
| Mi trabajo y Mi cuenta | 25 | 6 (Inicio, Mis tareas, Mis aprobaciones, Delegaciones, Notificaciones, Mi perfil) |
| Mesa de servicio (incl. SLA y operación) | 44 | 11 |
| Cambios | 39 | 8 |
| Problemas | 21 | 5 |
| Activos y CMDB | 47 | 12 (8 + 4) |
| Conocimiento | 8 | 5 |
| Catálogo de servicios | 7 | 2 |
| Operación | 4 | 0 |
| Reportes | 10 | 4 |
| Organización | 5 | 2 |
| Plataforma | 17 | 3 |
| **Total** | **227** | **58** |

### 19.3 Pestañas de configuración (87 → 22)

| Pantalla | Antes | Después (vistas) |
|---|---|---|
| Config. de incidentes | 5 (formulario 3 + flujo 2) | 2: `campos`, `reglas` |
| Config. de solicitudes | 5 (3 + 2) | 2: `campos`, `reglas` |
| Config. de problemas | 20 (6 + 8 + 6) | 2: `campos`, `listas` |
| Config. de cambios | 25 (7 + 8 + 4 + 6) | 5: `campos`, `listas`, `riesgo`, `autoridad`, `calendario` |
| CAB — miembros y quórum | (dentro del flujo) | 1: `miembros` |
| Config. de activos | 21 (ciclos de vida 6 + licencias y contratos 6 + tipos, modelos y atributos 9) | 4: `tipos-atributos`, `fabricantes-modelos`, `ubicaciones`, `listas` |
| Config. de CMDB | 6 (tipos de CI y relaciones) | 2: `clases`, `relaciones` |
| Config. de conocimiento | 3 | 2: `articulos`, `politicas` |
| Objetivos SLA y matriz | 2 | 2: `tiempos`, `matriz` |
| **Total** | **87** (la cifra del manual) | **22** |

> Nota: si al contar en el código el «antes» difiere de 87 por pestañas que el manual agrupa distinto, registra tu recuento real; lo que se audita es el **después = 22**.

### 19.4 Lista de verificaciones

**Compilación y pruebas**
- **V-01** Rama y tag existen; árbol limpio; un commit por bloque.
- **V-02** `tsc --noEmit`: 0 errores. **V-03** lint: 0 errores y sin más advertencias que la línea base. **V-04** tests: todos verdes, **0 tests omitidos** añadidos. **V-05** `build` de producción exitoso.

**Menú y datos**
- **V-10** Filas activas = 73; por nivel 11/4/58.
- **V-11** Los 71 IDs conservados existen; los 156 eliminados **no** existen (ni en `opciones_menu` ni en `opciones_menu_perfiles` ni en la tabla de vistas); los 2 nuevos existen.
- **V-12** BD nueva (migraciones + seed) ≡ BD migrada (diferencia 0).
- **V-13** Cada fila con URL tiene `page.tsx`; cada `page.tsx` bajo `/plataforma` es una URL de menú o está en la lista de rutas permitidas sin menú.
- **V-14** Sin filas con `padre_id` inexistente; ningún sub-agrupador con menos de 2 hijos; el orden de hijos = Anexo B.

**Permisos (R5)**
- **V-15** Matriz de acceso «después» vs «antes»: para cada perfil y cada ID legado L con destino (S, vista V): `tenía(L)` ⇔ `tiene(S) ∧ tiene(S,V)`. **Diferencias permitidas (únicas):** D-01 Inicio para todo perfil (vista `solicitante` si no tenía panel); D-02 Notificaciones para todos; D-03 «CIs» para la unión de #21135/#21139/#21141; D-04 pérdida de acceso a funciones eliminadas; D-05 capacidad «registrar para terceros» creada para quien tenía #21257 (si aplicó). **Cualquier otra diferencia = fallo.**
- **V-16** El registro de vistas coincide con el Anexo C (32 pantallas / 107 vistas; diferencia 0).
- **V-17** Aprobaciones: totales por tipo de «Mis aprobaciones» = totales de las bandejas viejas (usuarios de prueba de 3.2).
- **V-26** Pruebas negativas de servidor: para al menos 10 pares (perfil, vista) **no concedidos**, la llamada directa a la acción/ruta API devuelve denegado. Incluye: técnico con solo `asignados` → `todos`; `mi-area` → `todos` en inventario; consulta → `licencias`/`administracion`; `pendientes` → `publicacion`.

**URLs y referencias (R2, R3)**
- **V-20** Para cada URL antigua del Anexo D (que no coincida con una URL nueva): `grep -rnF "<url>" src tests docs public *.md --exclude-dir=reestructuracion` → **0**. Incluye variantes con barra final y con parámetros.
- **V-21** Con sesión de administrador: cada URL antigua → **404** (nunca 3xx); cada URL nueva (58) → 200 con un perfil autorizado y 403/denegado con uno no autorizado; cada `?vista=` válida carga.
- **V-22** `grep -rnE "redirect\(|permanentRedirect\(" src` → cada ocurrencia justificada en el informe como legítima (R2); `next.config.*`: 0 `redirects`/`rewrites`; `middleware`: solo autenticación.
- **V-23** Ningún `page.tsx` cuyo único contenido sea una redirección o un `return null`.
- **V-24** Ítem activo del menú correcto para cada pantalla con `?vista=` (e2e).
- **V-25** «Perfiles y permisos» lista exactamente las 73 filas con vistas anidadas y permite concederlas/revocarlas (e2e).

**Código muerto (R1)**
- **V-30** `knip`: 0 archivos y 0 exports sin uso. **V-31** `depcheck`: 0 dependencias sin uso; sin paquetes de correo/WhatsApp/webhooks.
- **V-32** Para **cada** componente, servicio, acción y constante de capacidad eliminada (lista en `dependencias-eliminacion.md`): `grep` → 0 resultados.
- **V-33** `TablaTickets` soporta exactamente `{mios, bandeja, asignados, departamento, resueltos, todos}`.
- **V-34** `grep -rniE "_old|\.bak|TODO.*(elimin|quitar|borrar)"` → 0; sin bloques de código comentado que mencionen funciones eliminadas.

**Notificaciones (N2)**
- **V-18** `grep -rniE "nodemailer|smtp|sendgrid|mailgun|twilio|whatsapp|webhook" src package.json .env.example` → 0. Los 15 eventos generan filas (tests); campana y pantalla operativas; `url_destino` de cada evento resuelve a una ruta existente.
- **V-19** Crear usuario y restablecer clave muestran contraseña temporal una sola vez y fuerzan cambio en el primer ingreso (N6).

**Funcionamiento ITIL (humo de extremo a extremo, un escenario por flujo)**
- **V-50** Con cada uno de los 10 perfiles: abrir **todas** sus pantallas y **todas** sus vistas sin errores de consola ni 500.
- **V-51** Escenarios obligatorios:
  1. **Incidente → problema → cambio → CMDB:** solicitante reporta incidente → técnico lo atiende y vincula CI → gestor crea problema (causa raíz, error conocido) → RFC → evaluación, aprobación (Mis aprobaciones), CAB, programación (Calendario), implementación, PIR → CI actualizado.
  2. **Incidente mayor:** declarar, sala de crisis, notificaciones in-app, cierre.
  3. **Solicitud de servicio con aprobación:** catálogo → solicitud → aprobador (con delegación) → cumplimiento → cierre → encuesta.
  4. **Cambio estándar** desde un modelo y **cambio de emergencia** vía ECAB.
  5. **Activo:** alta → asignación con acta → mantenimiento → baja con aprobación.
  6. **Conocimiento:** artículo desde un ticket → revisión → publicación → consulta desde el portal → retiro.
  7. **SLA:** ticket que llega a 75 % y a vencido genera notificaciones y aparece en Monitor de SLA.
  8. **Seguridad:** un usuario no puede aprobar su propio trámite; auditoría registra cambios de configuración y accesos.

**Documentación**
- **V-43** Manual regenerado: 73 filas, sin funciones eliminadas, sin afirmaciones falsas.
- **V-44** `docs/reestructuracion/` contiene: línea base, informes por fase (2 a 16), `mapa-urls.md`, matrices de acceso antes/después, `deuda-bd.md`, `rutas-permitidas-sin-menu.md`, `dependencias-eliminacion.md`, `informe-final.md`.

### 19.5 Formato del informe final (`docs/reestructuracion/informe-final.md`)
1. **Resumen ejecutivo** (5 líneas): qué se hizo y estado global (CUMPLIDO / CUMPLIDO CON DESVIACIONES / NO CUMPLIDO).
2. **Tabla de reconciliación:** una fila por cada verificación V-xx con *Esperado | Real | Estado (✔/✘) | Evidencia (comando + salida resumida)*.
3. **Métricas antes/después** (19.1 y 19.3 con valores reales).
4. **Desviaciones** (R10) con decisión tomada y motivo.
5. **Decisiones a confirmar** por el dueño del producto (p. ej. diferencias entre matrices de prioridad, funciones cuya eliminación afecta a algún cliente).
6. **Deuda** (tablas/columnas huérfanas) y **sugerencias de fase 2** (lista de funciones eliminadas que podrían volver, con el tag desde el que recuperarlas).
7. **Cómo revertir**: por bloque (`git revert <commit>` + migración inversa) y total (tag `pre-reestructuracion-menu` + respaldo de BD).

### 19.6 Condición de cierre
La reestructuración se considera **terminada** únicamente cuando **todas** las verificaciones V-xx están en ✔ o tienen una desviación documentada y aceptada. Si una verificación falla, **no la ocultes ni la «ajustes» para que pase**: corrige la causa o repórtala.

---

# ANEXOS

> Los anexos A–D son **generados** a partir del manual vigente y de las decisiones de este documento. Si alguno contradice el texto de una fase, prevalece el **Anexo A** (tabla maestra) y lo reportas como desviación.

## ANEXO A — Tabla maestra de los 227 IDs (acción y destino de cada uno)

Acciones: **MANTENER** (la fila sobrevive, con los cambios indicados) · **FUSIONAR** (la fila se elimina y su función pasa a otra pantalla como vista/pestaña; sus permisos se migran con REC-PER) · **ELIMINAR** (la función se retira con REC-ELI). Las URL con `?vista=` indican la vista de destino.

| ID | Nombre actual | URL actual | Acción | Destino / resultado | Motivo |
|---|---|---|---|---|---|
| #21001 | Mi trabajo | — | MANTENER | Conserva | Raíz se conserva |
| #21002 | Aprobaciones | — | ELIMINAR | Se elimina | Sub-agrupador queda vacío; sus hijos se fusionan o se mueven |
| #21003 | Delegación de aprobaciones | `/plataforma/solicitudes/area/delegacion` | FUSIONAR | Se absorbe en #21004 «Delegaciones» → `/plataforma/seguridad/delegaciones` | Misma vista (VistaDelegaciones) con 2 entradas |
| #21004 | Delegaciones | `/plataforma/seguridad/delegaciones` | MANTENER | Conserva (padre → #21001) | Sobreviviente única de delegaciones |
| #21005 | Historial de aprobaciones de mi área | `/plataforma/solicitudes/area/historial` | FUSIONAR | Se absorbe en #21249 «Mis aprobaciones» → `/plataforma/aprobaciones?vista=historial-area` | Mismo componente VistaHistorialAprobaciones |
| #21006 | Historial de aprobaciones y dictámenes | `/plataforma/seguridad/historial-aprobaciones` | FUSIONAR | Se absorbe en #21249 «Mis aprobaciones» → `/plataforma/aprobaciones?vista=historial` | Mismo componente VistaHistorialAprobaciones |
| #21007 | Panel de activos y CMDB | `/plataforma/operacion/paneles/gestor-activos` | FUSIONAR | Se absorbe en #21022 «Inicio» → `/plataforma/inicio?vista=gestion-activos` | Panel pasa a ser pestaña de Inicio |
| #21008 | Equipo | — | ELIMINAR | Se elimina | Sub-agrupador Equipo: sus 2 hijos se eliminan (fase 2) |
| #21009 | Ausencias y guardias del equipo | `/plataforma/operacion/equipo/ausencias` | ELIMINAR | Se elimina | Ausencias y guardias del equipo: fase 2 |
| #21010 | Vistas y respuestas compartidas | `/plataforma/operacion/equipo/vistas` | ELIMINAR | Se elimina | Vistas y respuestas compartidas: fase 2 (verificar consumidores) |
| #21011 | Panel de auditoría | `/plataforma/operacion/paneles/auditor` | FUSIONAR | Se absorbe en #21022 «Inicio» → `/plataforma/inicio?vista=auditor` | Panel pasa a ser pestaña de Inicio |
| #21012 | Panel de gestión de cambios | `/plataforma/operacion/paneles/gestor-cambios` | FUSIONAR | Se absorbe en #21022 «Inicio» → `/plataforma/inicio?vista=gestion-cambios` | Panel pasa a ser pestaña de Inicio |
| #21013 | Panel de gestión de problemas | `/plataforma/operacion/paneles/gestor-problemas` | FUSIONAR | Se absorbe en #21022 «Inicio» → `/plataforma/inicio?vista=gestion-problemas` | Panel pasa a ser pestaña de Inicio |
| #21014 | Panel de supervisión | `/plataforma/operacion/paneles/supervisor` | FUSIONAR | Se absorbe en #21022 «Inicio» → `/plataforma/inicio?vista=supervisor` | Panel pasa a ser pestaña de Inicio |
| #21015 | Panel del aprobador | `/plataforma/operacion/paneles/aprobador` | FUSIONAR | Se absorbe en #21022 «Inicio» → `/plataforma/inicio?vista=aprobador` | Panel pasa a ser pestaña de Inicio |
| #21016 | Panel del área | `/plataforma/operacion/paneles/gestor-area` | FUSIONAR | Se absorbe en #21022 «Inicio» → `/plataforma/inicio?vista=area` | Panel pasa a ser pestaña de Inicio |
| #21017 | Panel del técnico | `/plataforma/operacion/paneles/tecnico` | FUSIONAR | Se absorbe en #21022 «Inicio» → `/plataforma/inicio?vista=tecnico` | Panel pasa a ser pestaña de Inicio |
| #21018 | Mi agenda y disponibilidad | `/plataforma/operacion/agenda` | ELIMINAR | Se elimina | Mi agenda y disponibilidad: fase 2 |
| #21019 | Mi desempeño | `/plataforma/operacion/desempeno` | ELIMINAR | Se elimina | Mi desempeño: fase 2 (queda Productividad individual en Reportes) |
| #21020 | Mis tareas | `/plataforma/operacion/tareas` | MANTENER | Conserva (padre → #21001) | Sin cambios |
| #21021 | Panel de administración | `/plataforma/operacion/paneles/administrador` | FUSIONAR | Se absorbe en #21022 «Inicio» → `/plataforma/inicio?vista=administrador` | Panel pasa a ser pestaña de Inicio |
| #21022 | Panel del solicitante | `/plataforma/operacion/paneles/solicitante` | MANTENER | Conserva (renombrar → «Inicio»; URL → `/plataforma/inicio`; padre → #21001) | Sobreviviente: Inicio con panel según capacidades (vista=solicitante) |
| #21023 | Mesa de Servicio | — | MANTENER | Conserva | Raíz se conserva |
| #21024 | Operación de la mesa | — | ELIMINAR | Se elimina | Sub-agrupador: solo sobrevive Centro de asignación, que sube a la raíz |
| #21044 | SLA | — | ELIMINAR | Se elimina | Sub-agrupador: su único hijo (Monitor de SLA) sube a la raíz |
| #21045 | Escalamientos y riesgos de SLA | `/plataforma/servicios/sla/escalamientos` | MANTENER | Conserva (renombrar → «Monitor de SLA»; URL → `/plataforma/servicios/sla`; padre → #21023) | Sobreviviente con 6 vistas |
| #21046 | Incumplimientos y causas | `/plataforma/servicios/sla/incumplimientos` | FUSIONAR | Se absorbe en #21045 «Monitor de SLA» → `/plataforma/servicios/sla?vista=incumplimientos` |  |
| #21047 | Objetivos de tiempo vigentes | `/plataforma/servicios/sla/objetivos` | FUSIONAR | Se absorbe en #21045 «Monitor de SLA» → `/plataforma/servicios/sla?vista=objetivos` |  |
| #21048 | Semáforo de SLA de mi cola | `/plataforma/servicios/sla/semaforo-cola` | FUSIONAR | Se absorbe en #21045 «Monitor de SLA» → `/plataforma/servicios/sla?vista=mi-cola` |  |
| #21049 | Semáforo de SLA del grupo | `/plataforma/servicios/sla/semaforo-grupo` | FUSIONAR | Se absorbe en #21045 «Monitor de SLA» → `/plataforma/servicios/sla?vista=grupo` |  |
| #21059 | Cambios | — | MANTENER | Conserva | Raíz se conserva |
| #21060 | Mis cambios | — | ELIMINAR | Se elimina | Sub-agrupador vacío |
| #21061 | Aprobaciones técnicas de RFC | `/plataforma/cambios/aprobaciones/tecnicas` | FUSIONAR | Se absorbe en #21249 «Mis aprobaciones» → `/plataforma/aprobaciones?vista=pendientes&tipo=cambio-tecnica` | Bandeja de aprobaciones, filtro tipo |
| #21062 | Calendario de mis cambios | `/plataforma/cambios/calendario` | FUSIONAR | Se absorbe en #21071 «Calendario de cambios» → `/plataforma/cambios/gestion/calendario?vista=calendario&solo-mios=1` | Filtro "solo mis cambios" del Calendario |
| #21063 | Cambios con interrupción para mi área | `/plataforma/cambios/impacto/interrupciones` | FUSIONAR | Se absorbe en #21068 «Mis cambios» → `/plataforma/cambios/mis-cambios?vista=afectan-area` | Vista propia: permiso distinto por alcance |
| #21064 | Cambios por implementar | `/plataforma/cambios/implementacion` | FUSIONAR | Se absorbe en #21068 «Mis cambios» → `/plataforma/cambios/mis-cambios?vista=por-implementar` |  |
| #21065 | Cambios que afectan a mi equipo | `/plataforma/cambios/impacto/equipo` | FUSIONAR | Se absorbe en #21068 «Mis cambios» → `/plataforma/cambios/mis-cambios?vista=afectan-equipo` | Vista propia: permiso distinto por alcance |
| #21066 | Cambios que afectan mis servicios | `/plataforma/cambios/impacto/servicios` | FUSIONAR | Se absorbe en #21068 «Mis cambios» → `/plataforma/cambios/mis-cambios?vista=afectan-servicios` | Vista propia: permiso distinto por alcance |
| #21067 | Historial de mis cambios | `/plataforma/cambios/historial` | FUSIONAR | Se absorbe en #21068 «Mis cambios» → `/plataforma/cambios/mis-cambios?vista=historial` |  |
| #21068 | Mis cambios | `/plataforma/cambios/mis-cambios` | MANTENER | Conserva | Sobreviviente con 6 vistas (en-tramite, por-implementar, afectan-area, afectan-equipo, afectan-servicios, historial) |
| #21069 | Programación de implementaciones del equipo | `/plataforma/cambios/programacion` | FUSIONAR | Se absorbe en #21071 «Calendario de cambios» → `/plataforma/cambios/gestion/calendario?vista=programacion` |  |
| #21070 | Registrar solicitud RFC | `/plataforma/cambios/nuevo` | MANTENER | Conserva (renombrar → «Solicitar cambio») | Absorbe #21086 |
| #21071 | Calendario de cambios | `/plataforma/cambios/gestion/calendario` | MANTENER | Conserva | Sobreviviente con 2 vistas (calendario, programacion) |
| #21072 | Gestión | — | ELIMINAR | Se elimina | Sub-agrupador vacío |
| #21073 | Bandeja de RFC por evaluar | `/plataforma/cambios/gestion/evaluacion` | MANTENER | Conserva (renombrar → «Gestión de cambios»; URL → `/plataforma/cambios/gestion`) | Sobreviviente con 4 vistas (por-evaluar, aprobacion, ejecucion, historial) |
| #21074 | Conflictos y capacidad | `/plataforma/cambios/gestion/conflictos` | ELIMINAR | Se elimina | Pantalla de conflictos: la detección sigue en el expediente del cambio |
| #21075 | Modelos de cambio estándar | `/plataforma/cambios/gestion/modelos` | FUSIONAR | Se absorbe en #21090 «Modelos de cambio estándar» → `/plataforma/cambios/modelos?vista=administracion` | Alta/edición de modelos: vista propia para no dar edición a quien solo consultaba |
| #21076 | Programación de cambios autorizados | `/plataforma/cambios/gestion/programacion` | FUSIONAR | Se absorbe en #21071 «Calendario de cambios» → `/plataforma/cambios/gestion/calendario?vista=programacion` |  |
| #21077 | Revisión post-implementación | `/plataforma/cambios/gestion/pir` | MANTENER | Conserva | Sin cambios |
| #21078 | Seguimiento de ejecución | `/plataforma/cambios/gestion/ejecucion` | FUSIONAR | Se absorbe en #21073 «Gestión de cambios» → `/plataforma/cambios/gestion?vista=ejecucion` |  |
| #21079 | Seguimiento de etapas de aprobación | `/plataforma/cambios/gestion/autorizaciones` | FUSIONAR | Se absorbe en #21073 «Gestión de cambios» → `/plataforma/cambios/gestion?vista=aprobacion` |  |
| #21080 | Historial de cambios | `/plataforma/cambios/gestion/todos` | FUSIONAR | Se absorbe en #21073 «Gestión de cambios» → `/plataforma/cambios/gestion?vista=historial` |  |
| #21081 | CAB | — | ELIMINAR | Se elimina | Sub-agrupador vacío |
| #21082 | Agenda y actas | `/plataforma/cambios/cab/agenda` | MANTENER | Conserva (renombrar → «CAB y ECAB»; URL → `/plataforma/cambios/cab`) | Sobreviviente con 4 vistas (agenda, emergencia, dictamen, miembros) |
| #21083 | Comité de emergencia (ECAB) | `/plataforma/cambios/cab/emergencia` | FUSIONAR | Se absorbe en #21082 «CAB y ECAB» → `/plataforma/cambios/cab?vista=emergencia` |  |
| #21084 | Agenda y actas | `/plataforma/cambios/cab/agenda` | FUSIONAR | Se absorbe en #21082 «CAB y ECAB» → `/plataforma/cambios/cab?vista=agenda` | ID duplicado de la misma pantalla |
| #21085 | Dictamen colegiado (CAB) | `/plataforma/cambios/gestion/cab` | FUSIONAR | Se absorbe en #21082 «CAB y ECAB» → `/plataforma/cambios/cab?vista=dictamen` |  |
| #21086 | Solicitar un cambio | `/plataforma/cambios/gestion/crear` | FUSIONAR | Se absorbe en #21070 «Solicitar cambio» → `/plataforma/cambios/nuevo` | Duplicado del formulario de alta de RFC |
| #21087 | Aprobaciones | — | ELIMINAR | Se elimina | Sub-agrupador vacío |
| #21088 | Aprobación de negocio de cambios | `/plataforma/cambios/aprobaciones/negocio` | FUSIONAR | Se absorbe en #21249 «Mis aprobaciones» → `/plataforma/aprobaciones?vista=pendientes&tipo=cambio-negocio` | Bandeja de aprobaciones, filtro tipo |
| #21089 | Aprobaciones de cambios | `/plataforma/cambios/aprobaciones` | FUSIONAR | Se absorbe en #21249 «Mis aprobaciones» → `/plataforma/aprobaciones?vista=pendientes&tipo=cambio` | Bandeja de aprobaciones, filtro tipo |
| #21090 | Modelos de cambio estándar | `/plataforma/cambios/modelos` | MANTENER | Conserva | Sobreviviente con 2 vistas (consulta, administracion) |
| #21091 | Problemas | — | MANTENER | Conserva | Raíz se conserva |
| #21092 | Análisis de causa raíz | `/plataforma/problemas/analisis` | FUSIONAR | Pasa a pestaña «Causa raíz» del expediente del problema | Pasa a pestaña "Causa raíz" del expediente del problema |
| #21093 | Bandeja y asignación | `/plataforma/problemas/asignacion` | MANTENER | Conserva (renombrar → «Bandeja de problemas»; URL → `/plataforma/problemas/bandeja`) | Sobreviviente con 4 vistas |
| #21094 | Bandeja y asignación | `/plataforma/problemas/asignacion` | FUSIONAR | Se absorbe en #21093 «Bandeja de problemas» → `/plataforma/problemas/bandeja?vista=sin-asignar` | ID duplicado de la misma pantalla |
| #21095 | Candidatos a problema | `/plataforma/problemas/candidatos` | MANTENER | Conserva | Sobreviviente con 2 vistas (propuestos, recurrentes) |
| #21096 | Candidatos a problema | `/plataforma/problemas/candidatos` | FUSIONAR | Se absorbe en #21095 «Candidatos a problema» → `/plataforma/problemas/candidatos?vista=propuestos` | ID duplicado de la misma pantalla |
| #21097 | Conocimiento derivado | `/plataforma/problemas/conocimiento` | ELIMINAR | Se elimina | Pantalla duplicada de un botón del expediente |
| #21098 | Errores conocidos (KEDB) | `/plataforma/problemas/kedb` | MANTENER | Conserva | Sin cambios (KEDB) |
| #21099 | Errores conocidos (KEDB) | `/plataforma/problemas/kedb` | FUSIONAR | Se absorbe en #21098 «Errores conocidos (KEDB)» → `/plataforma/problemas/kedb` | ID duplicado de la misma pantalla |
| #21100 | Incidentes recurrentes | `/plataforma/problemas/recurrentes` | FUSIONAR | Se absorbe en #21095 «Candidatos a problema» → `/plataforma/problemas/candidatos?vista=recurrentes` |  |
| #21101 | Objetivos de tiempo | `/plataforma/problemas/objetivos` | FUSIONAR | Se absorbe en #21045 «Monitor de SLA» → `/plataforma/servicios/sla?vista=problemas` |  |
| #21102 | Problemas asignados a mí | `/plataforma/problemas/asignados` | FUSIONAR | Se absorbe en #21093 «Bandeja de problemas» → `/plataforma/problemas/bandeja?vista=asignados` |  |
| #21103 | Problemas de mi grupo | `/plataforma/problemas/grupo` | FUSIONAR | Se absorbe en #21093 «Bandeja de problemas» → `/plataforma/problemas/bandeja?vista=grupo` |  |
| #21104 | Problemas mayores y comités | `/plataforma/problemas/mayores` | ELIMINAR | Se elimina | Problemas mayores y comités PIR: fase 2 |
| #21105 | Registrar problema | `/plataforma/problemas/crear` | MANTENER | Conserva | Sin cambios (se elimina solo el botón de plantillas) |
| #21106 | Historial de problemas | `/plataforma/problemas/historial` | FUSIONAR | Se absorbe en #21093 «Bandeja de problemas» → `/plataforma/problemas/bandeja?vista=historial` |  |
| #21107 | Aprobación de riesgo y cierre | `/plataforma/problemas/aprobaciones` | ELIMINAR | Se elimina | Se resuelve como transición con capacidad dentro del expediente |
| #21108 | Solicitudes de cambio derivadas | `/plataforma/problemas/cambios` | ELIMINAR | Se elimina | Duplicado de la pestaña RFC del expediente del problema |
| #21109 | Activos y CMDB | — | MANTENER | Conserva | Raíz se conserva |
| #21110 | Inventario | — | MANTENER | Conserva (renombrar → «Activos») | Sub-agrupador |
| #21111 | Activos de mi área | `/plataforma/activos/area` | FUSIONAR | Se absorbe en #21114 «Inventario de activos» → `/plataforma/activos/inventario?vista=mi-area` |  |
| #21112 | Asignación, custodia y actas | `/plataforma/activos/asignaciones` | MANTENER | Conserva | Sin cambios |
| #21113 | Importación masiva | `/plataforma/activos/importacion` | FUSIONAR | Se absorbe en #21114 «Inventario de activos» → `/plataforma/activos/inventario?vista=importar` |  |
| #21114 | Inventario de activos | `/plataforma/activos/inventario` | MANTENER | Conserva | Sobreviviente con 4 vistas |
| #21115 | Inventario físico (campañas) | `/plataforma/activos/inventario-fisico` | ELIMINAR | Se elimina | Campañas de inventario físico: fase 2 |
| #21116 | Inventario físico en campo | `/plataforma/activos/conteos` | ELIMINAR | Se elimina | Inventario físico en campo (móvil/código de barras): fase 2 |
| #21117 | Inventario operativo | `/plataforma/activos/inventario-operativo` | FUSIONAR | Se absorbe en #21114 «Inventario de activos» → `/plataforma/activos/inventario?vista=operativo` |  |
| #21118 | Mis activos | `/plataforma/activos/mis-activos` | MANTENER | Conserva | Sin cambios (autoservicio) |
| #21119 | Recepción de adquisiciones | `/plataforma/activos/recepcion` | ELIMINAR | Se elimina | Recepción de adquisiciones (compras): fase 2 |
| #21120 | Bajas y disposición | — | ELIMINAR | Se elimina | Sub-agrupador Bajas: queda una sola pantalla |
| #21121 | Aprobación de bajas de mi área | `/plataforma/activos/bajas/aprobacion` | FUSIONAR | Se absorbe en #21249 «Mis aprobaciones» → `/plataforma/aprobaciones?vista=pendientes&tipo=baja` | Bandeja de aprobaciones, filtro tipo |
| #21122 | Consulta de bajas | `/plataforma/activos/bajas/consulta` | FUSIONAR | Se absorbe en #21123 «Bajas de activos» → `/plataforma/activos/bajas?vista=consulta` |  |
| #21123 | Gestión de bajas | `/plataforma/activos/bajas` | MANTENER | Conserva (renombrar → «Bajas de activos») | Sobreviviente con 2 vistas (gestion, consulta) |
| #21124 | Bajas y renovaciones por monto | `/plataforma/activos/bajas/renovaciones` | ELIMINAR | Se elimina | Análisis financiero por monto: fase 2 |
| #21125 | Mantenimiento | — | ELIMINAR | Se elimina | Sub-agrupador Mantenimiento: queda una sola pantalla |
| #21126 | Mantenimiento y garantías | `/plataforma/activos/mantenimiento` | MANTENER | Conserva | Sobreviviente con 2 vistas (garantias, reparaciones) |
| #21127 | Mantenimiento y reparaciones | `/plataforma/activos/reparaciones` | FUSIONAR | Se absorbe en #21126 «Mantenimiento y garantías» → `/plataforma/activos/mantenimiento?vista=reparaciones` |  |
| #21128 | Licencias | — | ELIMINAR | Se elimina | Sub-agrupador Licencias: queda una sola pantalla |
| #21129 | Catálogo de software autorizado | `/plataforma/activos/licencias/catalogo-software` | FUSIONAR | Se absorbe en #21132 «Licencias de software» → `/plataforma/activos/licencias?vista=catalogo-software` |  |
| #21130 | Consultar licencias | `/plataforma/activos/licencias/consulta` | FUSIONAR | Se absorbe en #21132 «Licencias de software» → `/plataforma/activos/licencias?vista=consulta` | Consulta de solo lectura: vista propia para no dar edición a quien solo consultaba |
| #21131 | Cumplimiento y sobreuso | `/plataforma/activos/licencias/cumplimiento` | ELIMINAR | Se elimina | Cumplimiento y sobreuso requiere agentes de descubrimiento: fase 2 |
| #21132 | Licencias de software | `/plataforma/activos/licencias` | MANTENER | Conserva | Sobreviviente con 3 vistas (licencias, consulta, catalogo-software) |
| #21133 | CMDB | — | MANTENER | Conserva | Sub-agrupador |
| #21134 | Actualizaciones de CMDB desde cambios | `/plataforma/cmdb/actualizaciones` | ELIMINAR | Se elimina | Reconciliación: la sincronización CMDB al cerrar un cambio sigue automática |
| #21135 | Análisis e impacto | `/plataforma/cmdb/analisis` | MANTENER | Conserva | Sin cambios |
| #21136 | Calidad y auditoría de CMDB | `/plataforma/cmdb/auditoria` | ELIMINAR | Se elimina | Calidad y auditoría de CMDB: fase 2 |
| #21137 | Inexactitudes reportadas | `/plataforma/cmdb/inexactitudes` | ELIMINAR | Se elimina | Inexactitudes reportadas: fase 2 |
| #21138 | Líneas base | `/plataforma/cmdb/lineas-base` | ELIMINAR | Se elimina | Líneas base: fase 2 |
| #21139 | Mapa de topología | `/plataforma/cmdb/topologia` | MANTENER | Conserva (renombrar → «Topología y relaciones») | Sin cambios funcionales |
| #21140 | Mapa de topología | `/plataforma/cmdb/topologia` | FUSIONAR | Se absorbe en #21139 «Topología y relaciones» → `/plataforma/cmdb/topologia` | ID duplicado de la misma pantalla |
| #21141 | Modelado de clases CI | `/plataforma/cmdb/tipos` | MANTENER | Conserva (renombrar → «Configuración de CMDB»; URL → `/plataforma/cmdb/configuracion`) | Sobreviviente con 2 vistas (clases, relaciones) |
| #21142 | Resultados de auditorías de CMDB | `/plataforma/cmdb/auditoria/resultados` | ELIMINAR | Se elimina | Resultados de auditorías de CMDB: fase 2 |
| #21143 | Proveedores y contratos | — | ELIMINAR | Se elimina | Sub-agrupador Proveedores y contratos: queda una sola pantalla |
| #21144 | Contratos y cobertura | `/plataforma/activos/contratos` | MANTENER | Conserva (renombrar → «Contratos y proveedores») | Sobreviviente con 4 vistas |
| #21145 | Licencias y contratos de mi departamento | `/plataforma/activos/contratos-area` | FUSIONAR | Se absorbe en #21144 «Contratos y proveedores» → `/plataforma/activos/contratos?vista=mi-area` |  |
| #21146 | Proveedores | `/plataforma/activos/proveedores` | FUSIONAR | Se absorbe en #21144 «Contratos y proveedores» → `/plataforma/activos/contratos?vista=proveedores` |  |
| #21147 | Renovaciones y vencimientos | `/plataforma/activos/renovaciones` | FUSIONAR | Se absorbe en #21144 «Contratos y proveedores» → `/plataforma/activos/contratos?vista=renovaciones` |  |
| #21148 | Catálogos y configuración de activos | — | ELIMINAR | Se elimina | Sub-agrupador de configuración: queda una sola pantalla |
| #21149 | Ciclos de vida y reglas de transición | `/plataforma/activos/configuracion/ciclos-vida-transiciones` | ELIMINAR | Se elimina | Ciclos de vida: estados y transiciones quedan sembrados |
| #21150 | Fabricantes y modelos | `/plataforma/activos/configuracion/tipos-modelos-atributos/fabricantes` | FUSIONAR | Se absorbe en #21154 «Configuración de activos» → `/plataforma/activos/configuracion?vista=fabricantes-modelos` |  |
| #21151 | Licencias y contratos | `/plataforma/activos/configuracion/licencias-contratos` | ELIMINAR | Se elimina | Config de licencias y contratos: tipos y alertas quedan fijos |
| #21152 | Listas auxiliares | `/plataforma/activos/configuracion/tipos-modelos-atributos/catalogos` | FUSIONAR | Se absorbe en #21154 «Configuración de activos» → `/plataforma/activos/configuracion?vista=listas` |  |
| #21153 | Tipos de CI y relaciones de CMDB | `/plataforma/activos/configuracion/cmdb-relaciones` | FUSIONAR | Se absorbe en #21141 «Configuración de CMDB» → `/plataforma/cmdb/configuracion?vista=relaciones` | Se conservan solo clases y tipos de relación |
| #21154 | Tipos, modelos y atributos | `/plataforma/activos/configuracion/tipos-modelos-atributos` | MANTENER | Conserva (renombrar → «Configuración de activos»; URL → `/plataforma/activos/configuracion`) | Sobreviviente con 4 vistas |
| #21155 | Ubicaciones | `/plataforma/activos/configuracion/tipos-modelos-atributos/ubicaciones` | FUSIONAR | Se absorbe en #21154 «Configuración de activos» → `/plataforma/activos/configuracion?vista=ubicaciones` |  |
| #21156 | Conocimiento | — | MANTENER | Conserva | Raíz se conserva |
| #21157 | Base de conocimiento | `/plataforma/conocimiento/base` | MANTENER | Conserva | Sin cambios |
| #21158 | Base de conocimiento | `/plataforma/conocimiento/base` | FUSIONAR | Se absorbe en #21157 «Base de conocimiento» → `/plataforma/conocimiento/base` | ID duplicado de la misma pantalla |
| #21159 | Crear artículo | `/plataforma/conocimiento/nuevo` | MANTENER | Conserva | Sin cambios |
| #21160 | Mis artículos | `/plataforma/conocimiento/mis-articulos` | MANTENER | Conserva | Sin cambios |
| #21161 | Revisión y publicación de artículos | `/plataforma/conocimiento/publicacion` | MANTENER | Conserva (renombrar → «Revisión y publicación») | Sobreviviente con 2 vistas (publicacion, pendientes) |
| #21162 | Revisiones pendientes | `/plataforma/conocimiento/revisiones` | FUSIONAR | Se absorbe en #21161 «Revisión y publicación» → `/plataforma/conocimiento/publicacion?vista=pendientes` | Cola operativa de revisión: vista propia para no dar publicación a quien solo revisaba |
| #21163 | Catálogo de Servicios | — | MANTENER | Conserva | Raíz se conserva |
| #21164 | Catálogo de servicios | `/plataforma/servicios/catalogo` | MANTENER | Conserva | Sobreviviente con 5 vistas (explorar, administrar-incidentes, administrar-solicitudes, crear, categorias) |
| #21165 | Configuración de categorías | `/plataforma/servicios/configuracion/categorias` | FUSIONAR | Se absorbe en #21164 «Catálogo de servicios» → `/plataforma/servicios/catalogo?vista=categorias` |  |
| #21166 | Crear servicio | `/plataforma/servicios/configuracion/crear` | FUSIONAR | Se absorbe en #21164 «Catálogo de servicios» → `/plataforma/servicios/catalogo?vista=crear` | Asistente de alta de servicio |
| #21167 | Objetivos SLA | `/plataforma/servicios/configuracion/sla` | MANTENER | Conserva (renombrar → «Objetivos SLA y matriz de prioridad») | Matriz de prioridad ÚNICA del sistema |
| #21168 | Servicios de incidentes | `/plataforma/servicios/configuracion/incidentes` | FUSIONAR | Se absorbe en #21164 «Catálogo de servicios» → `/plataforma/servicios/catalogo?vista=administrar-incidentes` |  |
| #21169 | Servicios de solicitudes | `/plataforma/servicios/configuracion/solicitudes` | FUSIONAR | Se absorbe en #21164 «Catálogo de servicios» → `/plataforma/servicios/catalogo?vista=administrar-solicitudes` |  |
| #21170 | Operación | — | ELIMINAR | Se elimina | Raíz completa fuera de alcance (eventos, disponibilidad, continuidad) |
| #21171 | Disponibilidad, capacidad y continuidad | `/plataforma/operacion/resiliencia` | ELIMINAR | Se elimina | Eventos / disponibilidad / continuidad: fuera de alcance (fase 2) |
| #21172 | Eventos y alertas | `/plataforma/operacion/eventos` | ELIMINAR | Se elimina | Eventos / disponibilidad / continuidad: fuera de alcance (fase 2) |
| #21173 | Eventos y resiliencia | `/plataforma/operacion/eventos-resiliencia` | ELIMINAR | Se elimina | Eventos / disponibilidad / continuidad: fuera de alcance (fase 2) |
| #21174 | Reportes | — | MANTENER | Conserva | Raíz se conserva |
| #21175 | Indicadores operativos y SLA | `/plataforma/reportes/operativos` | MANTENER | Conserva | Sobreviviente con 2 vistas (operativo, area) |
| #21176 | Informes de auditoría | `/plataforma/reportes/auditoria` | ELIMINAR | Se elimina | Informes de auditoría: fase 2 |
| #21177 | Productividad individual | `/plataforma/reportes/productividad` | MANTENER | Conserva | Sin cambios |
| #21178 | Reportes de activos | `/plataforma/reportes/activos` | MANTENER | Conserva | Sin cambios |
| #21179 | Reportes de cambios | `/plataforma/reportes/cambios` | MANTENER | Conserva (renombrar → «Reportes de cambios y problemas») | Sobreviviente con 2 vistas (cambios, problemas) |
| #21180 | Reportes de decisiones | `/plataforma/reportes/decisiones` | ELIMINAR | Se elimina | Reportes de decisiones: fase 2 |
| #21181 | Reportes de problemas | `/plataforma/reportes/problemas` | FUSIONAR | Se absorbe en #21179 «Reportes de cambios y problemas» → `/plataforma/reportes/cambios?vista=problemas` |  |
| #21182 | Reportes del área | `/plataforma/reportes/area` | FUSIONAR | Se absorbe en #21175 «Indicadores operativos y SLA» → `/plataforma/reportes/operativos?vista=area` |  |
| #21183 | Tableros | `/plataforma/reportes/tableros` | ELIMINAR | Se elimina | Tableros: solo redirigía; lo reemplaza Inicio |
| #21186 | Flujo de atención y aprobaciones | `/plataforma/solicitudes/configuracion/flujo` | FUSIONAR | Se absorbe en #21250 «Configuración de solicitudes» → `/plataforma/solicitudes/configuracion?vista=reglas` |  |
| #21187 | Flujo de estados y acciones | `/plataforma/incidentes/configuracion/flujo` | FUSIONAR | Se absorbe en #21240 «Configuración de incidentes» → `/plataforma/incidentes/configuracion?vista=reglas` |  |
| #21191 | Configuración de formulario | `/plataforma/cambios/configuracion/formulario` | MANTENER | Conserva (renombrar → «Configuración de cambios»; URL → `/plataforma/cambios/configuracion`) | Sobreviviente con 5 vistas |
| #21192 | Feriados | `/plataforma/cambios/configuracion/notificaciones-calendario` | FUSIONAR | Se absorbe en #21191 «Configuración de cambios» → `/plataforma/cambios/configuracion?vista=calendario` |  |
| #21193 | Flujo de evaluación, autorización y revisión posterior | `/plataforma/cambios/configuracion/flujo-evaluacion` | ELIMINAR | Se elimina | Flujo: estados/transiciones/etapas quedan sembrados; miembros del CAB pasan a CAB y ECAB |
| #21194 | Notificaciones de cambios | `/plataforma/cambios/configuracion/notificaciones-calendario` | ELIMINAR | Se elimina | Notificaciones por canal: reemplazadas por notificaciones in-app |
| #21195 | Períodos de congelamiento | `/plataforma/cambios/configuracion/notificaciones-calendario` | FUSIONAR | Se absorbe en #21191 «Configuración de cambios» → `/plataforma/cambios/configuracion?vista=calendario` |  |
| #21196 | Tipos de cambio y requisitos | `/plataforma/cambios/configuracion/tipos-requisitos` | FUSIONAR | Se absorbe en #21191 «Configuración de cambios» → `/plataforma/cambios/configuracion?vista=autoridad` | Solo se conserva la matriz de autoridad |
| #21197 | Ventanas de mantenimiento | `/plataforma/cambios/configuracion/notificaciones-calendario` | FUSIONAR | Se absorbe en #21191 «Configuración de cambios» → `/plataforma/cambios/configuracion?vista=calendario` |  |
| #21199 | Configuración de formulario | `/plataforma/problemas/configuracion/formulario` | MANTENER | Conserva (renombrar → «Configuración de problemas»; URL → `/plataforma/problemas/configuracion`) | Sobreviviente con 2 vistas (campos, listas) |
| #21200 | Flujo de investigación y seguimiento | `/plataforma/problemas/configuracion/flujo` | ELIMINAR | Se elimina | Flujo: queda sembrado |
| #21201 | Relación con incidentes, errores conocidos y conocimiento | `/plataforma/problemas/configuracion/relaciones` | ELIMINAR | Se elimina | Relaciones/automatizaciones: quedan fijas (fase 2) |
| #21202 | Categorías, responsables y reglas de publicación y revisión | `/plataforma/conocimiento/configuracion` | MANTENER | Conserva (renombrar → «Configuración de conocimiento») | Sobreviviente con 2 vistas (articulos, politicas); se elimina vista previa del portal |
| #21204 | Departamentos empresariales | `/plataforma/organizacion/departamentos-empresa` | MANTENER | Conserva | Sin cambios |
| #21205 | Departamentos y grupos resolutores de TI | `/plataforma/organizacion/departamentos` | MANTENER | Conserva (renombrar → «Grupos y técnicos de TI»; URL → `/plataforma/organizacion/grupos-ti`) | Sobreviviente con 3 vistas |
| #21206 | Supervisores | `/plataforma/organizacion/departamentos/supervisores` | FUSIONAR | Se absorbe en #21205 «Grupos y técnicos de TI» → `/plataforma/organizacion/grupos-ti?vista=supervisores` |  |
| #21207 | Técnicos y niveles de soporte | `/plataforma/organizacion/tecnicos` | FUSIONAR | Se absorbe en #21205 «Grupos y técnicos de TI» → `/plataforma/organizacion/grupos-ti?vista=tecnicos` |  |
| #21208 | Identidades | — | ELIMINAR | Se elimina | Sub-agrupador Identidades: sus hijos suben a la raíz Plataforma |
| #21209 | Gestión de usuarios | `/plataforma/seguridad/usuarios` | MANTENER | Conserva (padre → #21215) | Sin cambios de pantalla; se retira envío de credenciales por correo |
| #21210 | Perfiles y permisos | `/plataforma/seguridad/perfiles` | MANTENER | Conserva (padre → #21215) | Grid se extiende para vistas |
| #21211 | Menú y notificaciones | — | ELIMINAR | Se elimina | Sub-agrupador Menú y notificaciones |
| #21212 | Configuración de contacto | `/plataforma/operacion/notificaciones/contacto` | ELIMINAR | Se elimina | Contacto por WhatsApp/teléfono: fuera |
| #21213 | Estructura del menú | `/plataforma/operacion/menu` | ELIMINAR | Se elimina | Editor del árbol de menú: herramienta de desarrollo, fuera |
| #21214 | Plantillas de correo y otros canales | `/plataforma/operacion/notificaciones/plantillas` | ELIMINAR | Se elimina | Plantillas de correo y canales: reemplazadas por notificaciones in-app |
| #21215 | Plataforma | — | MANTENER | Conserva | Raíz se conserva |
| #21216 | Cumplimiento | — | ELIMINAR | Se elimina | Sub-agrupador Cumplimiento: fase 2 |
| #21217 | Cambios sin autorización o fuera de ventana | `/plataforma/seguridad/cumplimiento/cambios` | ELIMINAR | Se elimina | Cambios sin autorización: fase 2 |
| #21218 | Muestreo de auditoría | `/plataforma/seguridad/muestreo` | ELIMINAR | Se elimina | Muestreo de auditoría: fase 2 |
| #21219 | Segregación de funciones | `/plataforma/seguridad/cumplimiento/sod` | ELIMINAR | Se elimina | SoD (pantalla): fase 2; la regla solicitante≠aprobador se mantiene en el motor |
| #21220 | Auditoría de cambios de configuración | `/plataforma/seguridad/auditoria-sistema` | MANTENER | Conserva (renombrar → «Auditoría y accesos»; padre → #21215) | Sobreviviente con 2 vistas (configuracion, accesos) |
| #21221 | Registros de seguridad y autenticación | `/plataforma/seguridad/seguridad-logs` | FUSIONAR | Se absorbe en #21220 «Auditoría y accesos» → `/plataforma/seguridad/auditoria-sistema?vista=accesos` |  |
| #21222 | Recertificación de accesos | `/plataforma/seguridad/accesos/recertificacion` | ELIMINAR | Se elimina | Recertificación de accesos: fase 2 |
| #21223 | Retención y mantenimiento de datos | `/plataforma/operacion/mantenimiento-datos` | ELIMINAR | Se elimina | Retención y mantenimiento de datos: fase 2 |
| #21224 | Salud del sistema | `/plataforma/operacion/salud-sistema` | ELIMINAR | Se elimina | Salud del sistema: fase 2 |
| #21225 | Mi cuenta | — | MANTENER | Conserva | Raíz se conserva |
| #21226 | Mi perfil y seguridad | `/plataforma/mi-cuenta/perfil` | MANTENER | Conserva | Sin cambios |
| #21227 | Preferencias de notificación | `/plataforma/mi-cuenta/notificaciones` | ELIMINAR | Se elimina | Reemplazada por el centro de notificaciones in-app |
| #21228 | Incidentes | — | MANTENER | Conserva | Sub-agrupador Incidentes |
| #21229 | Solicitudes | — | MANTENER | Conserva | Sub-agrupador Solicitudes |
| #21230 | Todos los incidentes | `/plataforma/incidentes` | FUSIONAR | Se absorbe en #21233 «Bandeja de incidentes» → `/plataforma/incidentes/bandeja?vista=todos` |  |
| #21231 | Mis incidentes | `/plataforma/incidentes/mios` | MANTENER | Conserva | Sin cambios (entrada del solicitante) |
| #21232 | Incidentes asignados a mi | `/plataforma/incidentes/asignados` | FUSIONAR | Se absorbe en #21233 «Bandeja de incidentes» → `/plataforma/incidentes/bandeja?vista=asignados` |  |
| #21233 | Bandeja de incidentes | `/plataforma/incidentes/bandeja` | MANTENER | Conserva | Sobreviviente con 5 vistas |
| #21234 | Incidentes resueltos | `/plataforma/incidentes/resueltos` | FUSIONAR | Se absorbe en #21233 «Bandeja de incidentes» → `/plataforma/incidentes/bandeja?vista=resueltos` |  |
| #21235 | Incidentes de mi departamento | `/plataforma/incidentes/departamento` | FUSIONAR | Se absorbe en #21233 «Bandeja de incidentes» → `/plataforma/incidentes/bandeja?vista=departamento` |  |
| #21236 | Registrar incidente | `/plataforma/incidentes/crear` | MANTENER | Conserva | Absorbe el selector de solicitante de #21257 |
| #21237 | Catálogo de incidentes | `/plataforma/incidentes/catalogo` | FUSIONAR | Se absorbe en #21164 «Catálogo de servicios» → `/plataforma/servicios/catalogo?vista=explorar&tipo=incidente` | Catálogo duplicado: se usa el catálogo único con filtro tipo=incidente |
| #21238 | Incidentes mayores | `/plataforma/incidentes/mayores` | MANTENER | Conserva | Sobreviviente con 2 vistas (listado, sala-crisis) |
| #21239 | Sala de crisis (incidente mayor) | `/plataforma/incidentes/sala-crisis` | FUSIONAR | Se absorbe en #21238 «Incidentes mayores» → `/plataforma/incidentes/mayores?vista=sala-crisis` |  |
| #21240 | Configuración del formulario | `/plataforma/incidentes/configuracion` | MANTENER | Conserva (renombrar → «Configuración de incidentes») | Sobreviviente con 2 vistas (campos, reglas) |
| #21241 | Todas las solicitudes | `/plataforma/solicitudes` | FUSIONAR | Se absorbe en #21244 «Bandeja de solicitudes» → `/plataforma/solicitudes/bandeja?vista=todos` |  |
| #21242 | Mis solicitudes | `/plataforma/solicitudes/mios` | MANTENER | Conserva | Sin cambios (entrada del solicitante) |
| #21243 | Solicitudes asignadas a mi | `/plataforma/solicitudes/asignados` | FUSIONAR | Se absorbe en #21244 «Bandeja de solicitudes» → `/plataforma/solicitudes/bandeja?vista=asignados` |  |
| #21244 | Bandeja de solicitudes | `/plataforma/solicitudes/bandeja` | MANTENER | Conserva | Sobreviviente con 5 vistas |
| #21245 | Solicitudes resueltas | `/plataforma/solicitudes/resueltos` | FUSIONAR | Se absorbe en #21244 «Bandeja de solicitudes» → `/plataforma/solicitudes/bandeja?vista=resueltos` |  |
| #21246 | Solicitudes de mi departamento | `/plataforma/solicitudes/departamento` | FUSIONAR | Se absorbe en #21244 «Bandeja de solicitudes» → `/plataforma/solicitudes/bandeja?vista=departamento` |  |
| #21247 | Registrar solicitud | `/plataforma/solicitudes/crear` | MANTENER | Conserva | Absorbe el selector de solicitante de #21257 |
| #21248 | Catálogo de solicitudes | `/plataforma/solicitudes/catalogo` | FUSIONAR | Se absorbe en #21164 «Catálogo de servicios» → `/plataforma/servicios/catalogo?vista=explorar&tipo=solicitud` | Catálogo duplicado: se usa el catálogo único con filtro tipo=solicitud |
| #21249 | Aprobaciones de solicitudes | `/plataforma/solicitudes/aprobaciones` | MANTENER | Conserva (renombrar → «Mis aprobaciones»; URL → `/plataforma/aprobaciones`; padre → #21001) | Sobreviviente: bandeja única de aprobaciones (todas las prácticas) + historial |
| #21250 | Configuración del formulario | `/plataforma/solicitudes/configuracion` | MANTENER | Conserva (renombrar → «Configuración de solicitudes») | Sobreviviente con 2 vistas (campos, reglas) |
| #21251 | Centro de asignación | `/plataforma/tickets/gestion/asignar` | MANTENER | Conserva (padre → #21023) | Sube a la raíz Mesa de Servicio |
| #21252 | Colaboradores de mi área | `/plataforma/tickets/gestion/colaboradores` | ELIMINAR | Se elimina | Matriz de delegación por jefe de área: se resuelve con Perfiles y Delegaciones |
| #21253 | Bandeja consolidada de pendientes | `/plataforma/tickets/gestion/bandeja` | ELIMINAR | Se elimina | Duplicado: Bandejas por tipo ya cubren pendientes |
| #21254 | Historial consolidado de resueltos | `/plataforma/tickets/gestion/resueltos` | ELIMINAR | Se elimina | Duplicado: Bandejas por tipo (vista resueltos) |
| #21255 | Tickets de mi departamento | `/plataforma/tickets/gestion/departamento` | ELIMINAR | Se elimina | Duplicado: Bandejas por tipo (vista departamento) |
| #21256 | Todos los tickets | `/plataforma/tickets/gestion/todos` | ELIMINAR | Se elimina | Duplicado: Bandejas por tipo (vista todos) |
| #21257 | Registrar ticket para un usuario | `/plataforma/tickets/gestion/crear` | FUSIONAR | Se absorbe en #21236 «Registrar incidente» → `/plataforma/incidentes/crear` | Se convierte en selector "Solicitante" en Registrar incidente y Registrar solicitud (capacidad REGISTRAR_PARA_TERCEROS) |
| #21258 | Auditoría de tickets | `/plataforma/tickets/gestion/auditoria` | FUSIONAR | Se absorbe en #21233 «Bandeja de incidentes» → `/plataforma/incidentes/bandeja?vista=todos` | Auditor usa vista todos en modo solo lectura (también en #21244) |
| #21259 | Avisos de servicio | `/plataforma/avisos/mantenimientos` | ELIMINAR | Se elimina | Avisos de servicio: lo cubre el Calendario de cambios (fase 2) |
| #21260 | Búsqueda avanzada de tickets | `/plataforma/tickets/mesa/buscar` | ELIMINAR | Se elimina | Stub: solo redirige; búsqueda real queda en cabecera/filtros |
| #21261 | Historial de mis tickets | `/plataforma/tickets/gestion/mios` | ELIMINAR | Se elimina | Duplicado: Mis incidentes + Mis solicitudes + Inicio |
| #21264 | Organización | — | MANTENER | Conserva | Raíz se conserva |

## ANEXO B — Árbol de menú final (73 filas)

Orden y jerarquía exactos que debe tener `opciones_menu` al terminar. Las filas **NUEVO** se crean con el siguiente ID libre. La URL de «CIs» se confirma en la Fase 0 (decisión 0.10.1).

| # | ID | Opción de menú | URL final | Nivel |
|---|---|---|---|---|
| 1 | #21001 | **Mi trabajo** | — | Raíz |
| 2 | #21022 | ↳ Inicio | `/plataforma/inicio` | Pantalla |
| 3 | #21020 | ↳ Mis tareas | `/plataforma/operacion/tareas` | Pantalla |
| 4 | #21249 | ↳ Mis aprobaciones | `/plataforma/aprobaciones` | Pantalla |
| 5 | #21004 | ↳ Delegaciones | `/plataforma/seguridad/delegaciones` | Pantalla |
| 6 | NUEVO | ↳ Notificaciones | `/plataforma/notificaciones` | Pantalla |
| 7 | #21023 | **Mesa de Servicio** | — | Raíz |
| 8 | #21228 | ↳ **Incidentes** | — | Sub-agrupador |
| 9 | #21236 | ↳↳ Registrar incidente | `/plataforma/incidentes/crear` | Pantalla |
| 10 | #21231 | ↳↳ Mis incidentes | `/plataforma/incidentes/mios` | Pantalla |
| 11 | #21233 | ↳↳ Bandeja de incidentes | `/plataforma/incidentes/bandeja` | Pantalla |
| 12 | #21238 | ↳↳ Incidentes mayores | `/plataforma/incidentes/mayores` | Pantalla |
| 13 | #21240 | ↳↳ Configuración de incidentes | `/plataforma/incidentes/configuracion` | Pantalla |
| 14 | #21229 | ↳ **Solicitudes** | — | Sub-agrupador |
| 15 | #21247 | ↳↳ Registrar solicitud | `/plataforma/solicitudes/crear` | Pantalla |
| 16 | #21242 | ↳↳ Mis solicitudes | `/plataforma/solicitudes/mios` | Pantalla |
| 17 | #21244 | ↳↳ Bandeja de solicitudes | `/plataforma/solicitudes/bandeja` | Pantalla |
| 18 | #21250 | ↳↳ Configuración de solicitudes | `/plataforma/solicitudes/configuracion` | Pantalla |
| 19 | #21251 | ↳ Centro de asignación | `/plataforma/tickets/gestion/asignar` | Pantalla |
| 20 | #21045 | ↳ Monitor de SLA | `/plataforma/servicios/sla` | Pantalla |
| 21 | #21059 | **Cambios** | — | Raíz |
| 22 | #21070 | ↳ Solicitar cambio | `/plataforma/cambios/nuevo` | Pantalla |
| 23 | #21068 | ↳ Mis cambios | `/plataforma/cambios/mis-cambios` | Pantalla |
| 24 | #21073 | ↳ Gestión de cambios | `/plataforma/cambios/gestion` | Pantalla |
| 25 | #21082 | ↳ CAB y ECAB | `/plataforma/cambios/cab` | Pantalla |
| 26 | #21071 | ↳ Calendario de cambios | `/plataforma/cambios/gestion/calendario` | Pantalla |
| 27 | #21090 | ↳ Modelos de cambio estándar | `/plataforma/cambios/modelos` | Pantalla |
| 28 | #21077 | ↳ Revisión post-implementación | `/plataforma/cambios/gestion/pir` | Pantalla |
| 29 | #21191 | ↳ Configuración de cambios | `/plataforma/cambios/configuracion` | Pantalla |
| 30 | #21091 | **Problemas** | — | Raíz |
| 31 | #21105 | ↳ Registrar problema | `/plataforma/problemas/crear` | Pantalla |
| 32 | #21093 | ↳ Bandeja de problemas | `/plataforma/problemas/bandeja` | Pantalla |
| 33 | #21095 | ↳ Candidatos a problema | `/plataforma/problemas/candidatos` | Pantalla |
| 34 | #21098 | ↳ Errores conocidos (KEDB) | `/plataforma/problemas/kedb` | Pantalla |
| 35 | #21199 | ↳ Configuración de problemas | `/plataforma/problemas/configuracion` | Pantalla |
| 36 | #21109 | **Activos y CMDB** | — | Raíz |
| 37 | #21110 | ↳ **Activos** | — | Sub-agrupador |
| 38 | #21114 | ↳↳ Inventario de activos | `/plataforma/activos/inventario` | Pantalla |
| 39 | #21118 | ↳↳ Mis activos | `/plataforma/activos/mis-activos` | Pantalla |
| 40 | #21112 | ↳↳ Asignación, custodia y actas | `/plataforma/activos/asignaciones` | Pantalla |
| 41 | #21126 | ↳↳ Mantenimiento y garantías | `/plataforma/activos/mantenimiento` | Pantalla |
| 42 | #21132 | ↳↳ Licencias de software | `/plataforma/activos/licencias` | Pantalla |
| 43 | #21144 | ↳↳ Contratos y proveedores | `/plataforma/activos/contratos` | Pantalla |
| 44 | #21123 | ↳↳ Bajas de activos | `/plataforma/activos/bajas` | Pantalla |
| 45 | #21154 | ↳↳ Configuración de activos | `/plataforma/activos/configuracion` | Pantalla |
| 46 | #21133 | ↳ **CMDB** | — | Sub-agrupador |
| 47 | NUEVO | ↳↳ CIs (elementos de configuración) | `/plataforma/cmdb/cis  (o la ruta existente hallada en Fase 0)` | Pantalla |
| 48 | #21139 | ↳↳ Topología y relaciones | `/plataforma/cmdb/topologia` | Pantalla |
| 49 | #21135 | ↳↳ Análisis e impacto | `/plataforma/cmdb/analisis` | Pantalla |
| 50 | #21141 | ↳↳ Configuración de CMDB | `/plataforma/cmdb/configuracion` | Pantalla |
| 51 | #21156 | **Conocimiento** | — | Raíz |
| 52 | #21157 | ↳ Base de conocimiento | `/plataforma/conocimiento/base` | Pantalla |
| 53 | #21159 | ↳ Crear artículo | `/plataforma/conocimiento/nuevo` | Pantalla |
| 54 | #21160 | ↳ Mis artículos | `/plataforma/conocimiento/mis-articulos` | Pantalla |
| 55 | #21161 | ↳ Revisión y publicación | `/plataforma/conocimiento/publicacion` | Pantalla |
| 56 | #21202 | ↳ Configuración de conocimiento | `/plataforma/conocimiento/configuracion` | Pantalla |
| 57 | #21163 | **Catálogo de Servicios** | — | Raíz |
| 58 | #21164 | ↳ Catálogo de servicios | `/plataforma/servicios/catalogo` | Pantalla |
| 59 | #21167 | ↳ Objetivos SLA y matriz de prioridad | `/plataforma/servicios/configuracion/sla` | Pantalla |
| 60 | #21174 | **Reportes** | — | Raíz |
| 61 | #21175 | ↳ Indicadores operativos y SLA | `/plataforma/reportes/operativos` | Pantalla |
| 62 | #21179 | ↳ Reportes de cambios y problemas | `/plataforma/reportes/cambios` | Pantalla |
| 63 | #21178 | ↳ Reportes de activos | `/plataforma/reportes/activos` | Pantalla |
| 64 | #21177 | ↳ Productividad individual | `/plataforma/reportes/productividad` | Pantalla |
| 65 | #21264 | **Organización** | — | Raíz |
| 66 | #21204 | ↳ Departamentos empresariales | `/plataforma/organizacion/departamentos-empresa` | Pantalla |
| 67 | #21205 | ↳ Grupos y técnicos de TI | `/plataforma/organizacion/grupos-ti` | Pantalla |
| 68 | #21215 | **Plataforma** | — | Raíz |
| 69 | #21209 | ↳ Gestión de usuarios | `/plataforma/seguridad/usuarios` | Pantalla |
| 70 | #21210 | ↳ Perfiles y permisos | `/plataforma/seguridad/perfiles` | Pantalla |
| 71 | #21220 | ↳ Auditoría y accesos | `/plataforma/seguridad/auditoria-sistema` | Pantalla |
| 72 | #21225 | **Mi cuenta** | — | Raíz |
| 73 | #21226 | ↳ Mi perfil y seguridad | `/plataforma/mi-cuenta/perfil` | Pantalla |

## ANEXO C — Registro de vistas (32 pantallas / 107 vistas)

Cada fila es una vista con permiso propio. La columna final indica de qué IDs legados hereda sus permisos (REC-PER). El orden de las vistas dentro de una pantalla es el orden de las pestañas; la vista por defecto es la primera permitida al usuario (en Inicio, la que hoy recibe el perfil).

| Pantalla (ID sobreviviente) | URL base | Vista (`?vista=`) | IDs legados cuyos permisos heredan |
|---|---|---|---|
| **#21022 Inicio** | `/plataforma/inicio` | `solicitante` | 21022 |
|  |  | `tecnico` | 21017 |
|  |  | `supervisor` | 21014 |
|  |  | `aprobador` | 21015 |
|  |  | `area` | 21016 |
|  |  | `gestion-activos` | 21007 |
|  |  | `gestion-cambios` | 21012 |
|  |  | `gestion-problemas` | 21013 |
|  |  | `auditor` | 21011 |
|  |  | `administrador` | 21021 |
| **#21249 Mis aprobaciones** | `/plataforma/aprobaciones` | `pendientes` | 21249 + 21061 + 21088 + 21089 + 21121 |
|  |  | `historial` | 21006 |
|  |  | `historial-area` | 21005 |
| **#21233 Bandeja de incidentes** | `/plataforma/incidentes/bandeja` | `bandeja` | 21233 |
|  |  | `asignados` | 21232 |
|  |  | `departamento` | 21235 |
|  |  | `resueltos` | 21234 |
|  |  | `todos` | 21230 + 21258 |
| **#21244 Bandeja de solicitudes** | `/plataforma/solicitudes/bandeja` | `bandeja` | 21244 |
|  |  | `asignados` | 21243 |
|  |  | `departamento` | 21246 |
|  |  | `resueltos` | 21245 |
|  |  | `todos` | 21241 + 21258 |
| **#21238 Incidentes mayores** | `/plataforma/incidentes/mayores` | `listado` | 21238 |
|  |  | `sala-crisis` | 21239 |
| **#21240 Configuración de incidentes** | `/plataforma/incidentes/configuracion` | `campos` | 21240 |
|  |  | `reglas` | 21187 |
| **#21250 Configuración de solicitudes** | `/plataforma/solicitudes/configuracion` | `campos` | 21250 |
|  |  | `reglas` | 21186 |
| **#21045 Monitor de SLA** | `/plataforma/servicios/sla` | `riesgo` | 21045 |
|  |  | `incumplimientos` | 21046 |
|  |  | `objetivos` | 21047 |
|  |  | `mi-cola` | 21048 |
|  |  | `grupo` | 21049 |
|  |  | `problemas` | 21101 |
| **#21068 Mis cambios** | `/plataforma/cambios/mis-cambios` | `en-tramite` | 21068 |
|  |  | `por-implementar` | 21064 |
|  |  | `afectan-area` | 21063 |
|  |  | `afectan-equipo` | 21065 |
|  |  | `afectan-servicios` | 21066 |
|  |  | `historial` | 21067 |
| **#21071 Calendario de cambios** | `/plataforma/cambios/gestion/calendario` | `calendario` | 21071 + 21062 |
|  |  | `programacion` | 21069 + 21076 |
| **#21073 Gestión de cambios** | `/plataforma/cambios/gestion` | `por-evaluar` | 21073 |
|  |  | `aprobacion` | 21079 |
|  |  | `ejecucion` | 21078 |
|  |  | `historial` | 21080 |
| **#21082 CAB y ECAB** | `/plataforma/cambios/cab` | `agenda` | 21082 + 21084 |
|  |  | `emergencia` | 21083 |
|  |  | `dictamen` | 21085 |
|  |  | `miembros` | 21193 |
| **#21191 Configuración de cambios** | `/plataforma/cambios/configuracion` | `campos` | 21191 |
|  |  | `listas` | 21191 |
|  |  | `riesgo` | 21191 |
|  |  | `autoridad` | 21196 |
|  |  | `calendario` | 21192 + 21195 + 21197 |
| **#21090 Modelos de cambio estándar** | `/plataforma/cambios/modelos` | `consulta` | 21090 |
|  |  | `administracion` | 21075 |
| **#21093 Bandeja de problemas** | `/plataforma/problemas/bandeja` | `sin-asignar` | 21093 + 21094 |
|  |  | `asignados` | 21102 |
|  |  | `grupo` | 21103 |
|  |  | `historial` | 21106 |
| **#21095 Candidatos a problema** | `/plataforma/problemas/candidatos` | `propuestos` | 21095 + 21096 |
|  |  | `recurrentes` | 21100 |
| **#21199 Configuración de problemas** | `/plataforma/problemas/configuracion` | `campos` | 21199 |
|  |  | `listas` | 21199 |
| **#21114 Inventario de activos** | `/plataforma/activos/inventario` | `todos` | 21114 |
|  |  | `mi-area` | 21111 |
|  |  | `operativo` | 21117 |
|  |  | `importar` | 21113 |
| **#21126 Mantenimiento y garantías** | `/plataforma/activos/mantenimiento` | `garantias` | 21126 |
|  |  | `reparaciones` | 21127 |
| **#21132 Licencias de software** | `/plataforma/activos/licencias` | `licencias` | 21132 |
|  |  | `consulta` | 21130 |
|  |  | `catalogo-software` | 21129 |
| **#21144 Contratos y proveedores** | `/plataforma/activos/contratos` | `contratos` | 21144 |
|  |  | `mi-area` | 21145 |
|  |  | `renovaciones` | 21147 |
|  |  | `proveedores` | 21146 |
| **#21123 Bajas de activos** | `/plataforma/activos/bajas` | `gestion` | 21123 |
|  |  | `consulta` | 21122 |
| **#21154 Configuración de activos** | `/plataforma/activos/configuracion` | `tipos-atributos` | 21154 |
|  |  | `fabricantes-modelos` | 21150 |
|  |  | `ubicaciones` | 21155 |
|  |  | `listas` | 21152 |
| **#21141 Configuración de CMDB** | `/plataforma/cmdb/configuracion` | `clases` | 21141 |
|  |  | `relaciones` | 21153 |
| **#21161 Revisión y publicación** | `/plataforma/conocimiento/publicacion` | `publicacion` | 21161 |
|  |  | `pendientes` | 21162 |
| **#21202 Configuración de conocimiento** | `/plataforma/conocimiento/configuracion` | `articulos` | 21202 |
|  |  | `politicas` | 21202 |
| **#21164 Catálogo de servicios** | `/plataforma/servicios/catalogo` | `explorar` | 21164 + 21237 + 21248 |
|  |  | `administrar-incidentes` | 21168 |
|  |  | `administrar-solicitudes` | 21169 |
|  |  | `crear` | 21166 |
|  |  | `categorias` | 21165 |
| **#21167 Objetivos SLA y matriz de prioridad** | `/plataforma/servicios/configuracion/sla` | `tiempos` | 21167 |
|  |  | `matriz` | 21167 |
| **#21175 Indicadores operativos y SLA** | `/plataforma/reportes/operativos` | `operativo` | 21175 |
|  |  | `area` | 21182 |
| **#21179 Reportes de cambios y problemas** | `/plataforma/reportes/cambios` | `cambios` | 21179 |
|  |  | `problemas` | 21181 |
| **#21205 Grupos y técnicos de TI** | `/plataforma/organizacion/grupos-ti` | `grupos` | 21205 |
|  |  | `tecnicos` | 21207 |
|  |  | `supervisores` | 21206 |
| **#21220 Auditoría y accesos** | `/plataforma/seguridad/auditoria-sistema` | `configuracion` | 21220 |
|  |  | `accesos` | 21221 |

## ANEXO D — Mapa de URLs antiguas → nuevas (142 afectadas; 44 sin cambio no se listan)

«Eliminada (404)» = la ruta deja de existir y no se redirige. «Fusionada» = el contenido vive ahora como vista de otra pantalla (la URL vieja también da 404). «Renombrada» = misma pantalla con URL nueva (la vieja da 404).

| URL antigua | Qué pasa | URL nueva / destino |
|---|---|---|
| `/plataforma/solicitudes/area/delegacion` | Fusionada | `/plataforma/seguridad/delegaciones` |
| `/plataforma/solicitudes/area/historial` | Fusionada | `/plataforma/aprobaciones?vista=historial-area` |
| `/plataforma/seguridad/historial-aprobaciones` | Fusionada | `/plataforma/aprobaciones?vista=historial` |
| `/plataforma/operacion/paneles/gestor-activos` | Fusionada | `/plataforma/inicio?vista=gestion-activos` |
| `/plataforma/operacion/equipo/ausencias` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/equipo/vistas` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/paneles/auditor` | Fusionada | `/plataforma/inicio?vista=auditor` |
| `/plataforma/operacion/paneles/gestor-cambios` | Fusionada | `/plataforma/inicio?vista=gestion-cambios` |
| `/plataforma/operacion/paneles/gestor-problemas` | Fusionada | `/plataforma/inicio?vista=gestion-problemas` |
| `/plataforma/operacion/paneles/supervisor` | Fusionada | `/plataforma/inicio?vista=supervisor` |
| `/plataforma/operacion/paneles/aprobador` | Fusionada | `/plataforma/inicio?vista=aprobador` |
| `/plataforma/operacion/paneles/gestor-area` | Fusionada | `/plataforma/inicio?vista=area` |
| `/plataforma/operacion/paneles/tecnico` | Fusionada | `/plataforma/inicio?vista=tecnico` |
| `/plataforma/operacion/agenda` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/desempeno` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/paneles/administrador` | Fusionada | `/plataforma/inicio?vista=administrador` |
| `/plataforma/operacion/paneles/solicitante` | Renombrada | `/plataforma/inicio` |
| `/plataforma/servicios/sla/escalamientos` | Renombrada | `/plataforma/servicios/sla` |
| `/plataforma/servicios/sla/incumplimientos` | Fusionada | `/plataforma/servicios/sla?vista=incumplimientos` |
| `/plataforma/servicios/sla/objetivos` | Fusionada | `/plataforma/servicios/sla?vista=objetivos` |
| `/plataforma/servicios/sla/semaforo-cola` | Fusionada | `/plataforma/servicios/sla?vista=mi-cola` |
| `/plataforma/servicios/sla/semaforo-grupo` | Fusionada | `/plataforma/servicios/sla?vista=grupo` |
| `/plataforma/cambios/aprobaciones/tecnicas` | Fusionada | `/plataforma/aprobaciones?vista=pendientes&tipo=cambio-tecnica` |
| `/plataforma/cambios/calendario` | Fusionada | `/plataforma/cambios/gestion/calendario?vista=calendario&solo-mios=1` |
| `/plataforma/cambios/impacto/interrupciones` | Fusionada | `/plataforma/cambios/mis-cambios?vista=afectan-area` |
| `/plataforma/cambios/implementacion` | Fusionada | `/plataforma/cambios/mis-cambios?vista=por-implementar` |
| `/plataforma/cambios/impacto/equipo` | Fusionada | `/plataforma/cambios/mis-cambios?vista=afectan-equipo` |
| `/plataforma/cambios/impacto/servicios` | Fusionada | `/plataforma/cambios/mis-cambios?vista=afectan-servicios` |
| `/plataforma/cambios/historial` | Fusionada | `/plataforma/cambios/mis-cambios?vista=historial` |
| `/plataforma/cambios/programacion` | Fusionada | `/plataforma/cambios/gestion/calendario?vista=programacion` |
| `/plataforma/cambios/gestion/evaluacion` | Renombrada | `/plataforma/cambios/gestion` |
| `/plataforma/cambios/gestion/conflictos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/cambios/gestion/modelos` | Fusionada | `/plataforma/cambios/modelos?vista=administracion` |
| `/plataforma/cambios/gestion/programacion` | Fusionada | `/plataforma/cambios/gestion/calendario?vista=programacion` |
| `/plataforma/cambios/gestion/ejecucion` | Fusionada | `/plataforma/cambios/gestion?vista=ejecucion` |
| `/plataforma/cambios/gestion/autorizaciones` | Fusionada | `/plataforma/cambios/gestion?vista=aprobacion` |
| `/plataforma/cambios/gestion/todos` | Fusionada | `/plataforma/cambios/gestion?vista=historial` |
| `/plataforma/cambios/cab/agenda` | Fusionada | `/plataforma/cambios/cab?vista=agenda` · `/plataforma/cambios/cab` |
| `/plataforma/cambios/cab/emergencia` | Fusionada | `/plataforma/cambios/cab?vista=emergencia` |
| `/plataforma/cambios/gestion/cab` | Fusionada | `/plataforma/cambios/cab?vista=dictamen` |
| `/plataforma/cambios/gestion/crear` | Fusionada | `/plataforma/cambios/nuevo` |
| `/plataforma/cambios/aprobaciones/negocio` | Fusionada | `/plataforma/aprobaciones?vista=pendientes&tipo=cambio-negocio` |
| `/plataforma/cambios/aprobaciones` | Fusionada | `/plataforma/aprobaciones?vista=pendientes&tipo=cambio` |
| `/plataforma/problemas/analisis` | Fusionada | Expediente del problema (pestaña «Causa raíz») |
| `/plataforma/problemas/asignacion` | Fusionada | `/plataforma/problemas/bandeja?vista=sin-asignar` · `/plataforma/problemas/bandeja` |
| `/plataforma/problemas/candidatos` | Fusionada | `/plataforma/problemas/candidatos?vista=propuestos` |
| `/plataforma/problemas/conocimiento` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/problemas/recurrentes` | Fusionada | `/plataforma/problemas/candidatos?vista=recurrentes` |
| `/plataforma/problemas/objetivos` | Fusionada | `/plataforma/servicios/sla?vista=problemas` |
| `/plataforma/problemas/asignados` | Fusionada | `/plataforma/problemas/bandeja?vista=asignados` |
| `/plataforma/problemas/grupo` | Fusionada | `/plataforma/problemas/bandeja?vista=grupo` |
| `/plataforma/problemas/mayores` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/problemas/historial` | Fusionada | `/plataforma/problemas/bandeja?vista=historial` |
| `/plataforma/problemas/aprobaciones` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/problemas/cambios` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/activos/area` | Fusionada | `/plataforma/activos/inventario?vista=mi-area` |
| `/plataforma/activos/importacion` | Fusionada | `/plataforma/activos/inventario?vista=importar` |
| `/plataforma/activos/inventario-fisico` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/activos/conteos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/activos/inventario-operativo` | Fusionada | `/plataforma/activos/inventario?vista=operativo` |
| `/plataforma/activos/recepcion` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/activos/bajas/aprobacion` | Fusionada | `/plataforma/aprobaciones?vista=pendientes&tipo=baja` |
| `/plataforma/activos/bajas/consulta` | Fusionada | `/plataforma/activos/bajas?vista=consulta` |
| `/plataforma/activos/bajas/renovaciones` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/activos/reparaciones` | Fusionada | `/plataforma/activos/mantenimiento?vista=reparaciones` |
| `/plataforma/activos/licencias/catalogo-software` | Fusionada | `/plataforma/activos/licencias?vista=catalogo-software` |
| `/plataforma/activos/licencias/consulta` | Fusionada | `/plataforma/activos/licencias?vista=consulta` |
| `/plataforma/activos/licencias/cumplimiento` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/cmdb/actualizaciones` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/cmdb/auditoria` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/cmdb/inexactitudes` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/cmdb/lineas-base` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/cmdb/tipos` | Renombrada | `/plataforma/cmdb/configuracion` |
| `/plataforma/cmdb/auditoria/resultados` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/activos/contratos-area` | Fusionada | `/plataforma/activos/contratos?vista=mi-area` |
| `/plataforma/activos/proveedores` | Fusionada | `/plataforma/activos/contratos?vista=proveedores` |
| `/plataforma/activos/renovaciones` | Fusionada | `/plataforma/activos/contratos?vista=renovaciones` |
| `/plataforma/activos/configuracion/ciclos-vida-transiciones` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/activos/configuracion/tipos-modelos-atributos/fabricantes` | Fusionada | `/plataforma/activos/configuracion?vista=fabricantes-modelos` |
| `/plataforma/activos/configuracion/licencias-contratos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/activos/configuracion/tipos-modelos-atributos/catalogos` | Fusionada | `/plataforma/activos/configuracion?vista=listas` |
| `/plataforma/activos/configuracion/cmdb-relaciones` | Fusionada | `/plataforma/cmdb/configuracion?vista=relaciones` |
| `/plataforma/activos/configuracion/tipos-modelos-atributos` | Renombrada | `/plataforma/activos/configuracion` |
| `/plataforma/activos/configuracion/tipos-modelos-atributos/ubicaciones` | Fusionada | `/plataforma/activos/configuracion?vista=ubicaciones` |
| `/plataforma/conocimiento/revisiones` | Fusionada | `/plataforma/conocimiento/publicacion?vista=pendientes` |
| `/plataforma/servicios/configuracion/categorias` | Fusionada | `/plataforma/servicios/catalogo?vista=categorias` |
| `/plataforma/servicios/configuracion/crear` | Fusionada | `/plataforma/servicios/catalogo?vista=crear` |
| `/plataforma/servicios/configuracion/incidentes` | Fusionada | `/plataforma/servicios/catalogo?vista=administrar-incidentes` |
| `/plataforma/servicios/configuracion/solicitudes` | Fusionada | `/plataforma/servicios/catalogo?vista=administrar-solicitudes` |
| `/plataforma/operacion/resiliencia` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/eventos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/eventos-resiliencia` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/reportes/auditoria` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/reportes/decisiones` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/reportes/problemas` | Fusionada | `/plataforma/reportes/cambios?vista=problemas` |
| `/plataforma/reportes/area` | Fusionada | `/plataforma/reportes/operativos?vista=area` |
| `/plataforma/reportes/tableros` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/solicitudes/configuracion/flujo` | Fusionada | `/plataforma/solicitudes/configuracion?vista=reglas` |
| `/plataforma/incidentes/configuracion/flujo` | Fusionada | `/plataforma/incidentes/configuracion?vista=reglas` |
| `/plataforma/cambios/configuracion/formulario` | Renombrada | `/plataforma/cambios/configuracion` |
| `/plataforma/cambios/configuracion/notificaciones-calendario` | Fusionada | `/plataforma/cambios/configuracion?vista=calendario` |
| `/plataforma/cambios/configuracion/flujo-evaluacion` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/cambios/configuracion/tipos-requisitos` | Fusionada | `/plataforma/cambios/configuracion?vista=autoridad` |
| `/plataforma/problemas/configuracion/formulario` | Renombrada | `/plataforma/problemas/configuracion` |
| `/plataforma/problemas/configuracion/flujo` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/problemas/configuracion/relaciones` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/organizacion/departamentos` | Renombrada | `/plataforma/organizacion/grupos-ti` |
| `/plataforma/organizacion/departamentos/supervisores` | Fusionada | `/plataforma/organizacion/grupos-ti?vista=supervisores` |
| `/plataforma/organizacion/tecnicos` | Fusionada | `/plataforma/organizacion/grupos-ti?vista=tecnicos` |
| `/plataforma/operacion/notificaciones/contacto` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/menu` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/notificaciones/plantillas` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/seguridad/cumplimiento/cambios` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/seguridad/muestreo` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/seguridad/cumplimiento/sod` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/seguridad/seguridad-logs` | Fusionada | `/plataforma/seguridad/auditoria-sistema?vista=accesos` |
| `/plataforma/seguridad/accesos/recertificacion` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/mantenimiento-datos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/salud-sistema` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/mi-cuenta/notificaciones` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/incidentes` | Fusionada | `/plataforma/incidentes/bandeja?vista=todos` |
| `/plataforma/incidentes/asignados` | Fusionada | `/plataforma/incidentes/bandeja?vista=asignados` |
| `/plataforma/incidentes/resueltos` | Fusionada | `/plataforma/incidentes/bandeja?vista=resueltos` |
| `/plataforma/incidentes/departamento` | Fusionada | `/plataforma/incidentes/bandeja?vista=departamento` |
| `/plataforma/incidentes/catalogo` | Fusionada | `/plataforma/servicios/catalogo?vista=explorar&tipo=incidente` |
| `/plataforma/incidentes/sala-crisis` | Fusionada | `/plataforma/incidentes/mayores?vista=sala-crisis` |
| `/plataforma/solicitudes` | Fusionada | `/plataforma/solicitudes/bandeja?vista=todos` |
| `/plataforma/solicitudes/asignados` | Fusionada | `/plataforma/solicitudes/bandeja?vista=asignados` |
| `/plataforma/solicitudes/resueltos` | Fusionada | `/plataforma/solicitudes/bandeja?vista=resueltos` |
| `/plataforma/solicitudes/departamento` | Fusionada | `/plataforma/solicitudes/bandeja?vista=departamento` |
| `/plataforma/solicitudes/catalogo` | Fusionada | `/plataforma/servicios/catalogo?vista=explorar&tipo=solicitud` |
| `/plataforma/solicitudes/aprobaciones` | Renombrada | `/plataforma/aprobaciones` |
| `/plataforma/tickets/gestion/colaboradores` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/bandeja` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/resueltos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/departamento` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/todos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/crear` | Fusionada | `/plataforma/incidentes/crear` |
| `/plataforma/tickets/gestion/auditoria` | Fusionada | `/plataforma/incidentes/bandeja?vista=todos` |
| `/plataforma/avisos/mantenimientos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/mesa/buscar` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/mios` | Eliminada (404) | ELIMINADA (404) |
