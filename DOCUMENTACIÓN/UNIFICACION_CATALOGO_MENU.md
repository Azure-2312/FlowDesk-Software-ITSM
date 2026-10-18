# Unificacion del catalogo de menu (`opciones_menu`)

**Estado:** **ejecutada el 2026-10-18.** Medicion tomada antes de migrar.
**Fecha de medicion:** 2026-10-18.
**Alcance:** `opciones_menu`, `opciones_menu_perfiles`, `MenuLateral`, admin de menu
(`/plataforma/admin/menu` y `/plataforma/admin/perfiles`) y `db/seed.sql`.

Complementa a `ARQUITECTURA_MODULAR_Y_CONTRATOS.md` (arquitectura por modulos) y
a `ESQUEMA_MENUS_POR_PERFIL.md` (menus por perfil). Este documento define como
pasa el menu de "10 menus escritos a mano" a "1 catalogo por modulos con
visibilidad por perfil".

---

## 0. Resumen

1. Hoy hay **451 opciones**: 143 del catalogo viejo (gen-1, sin ningun perfil) y
   308 del catalogo nuevo (gen-2, todas asignadas).
2. Las 308 de gen-2 **no son un catalogo: son 10 menus paralelos**, uno por
   perfil. Ninguna opcion se comparte entre dos perfiles.
3. Consecuencia medida: **240 paginas para 189 URLs distintas**, en 23 grupos
   duplicados (74 filas, **51 sobrantes**). La misma pantalla aparece hasta 10
   veces, con nombres distintos segun el perfil.
4. No hay enlaces rotos: las 174 rutas del menu existen como pagina. Hay 12
   paginas reales sin entrada de menu (portadas de seccion).
5. El esquema **ya soporta** el modelo objetivo: la PK de
   `opciones_menu_perfiles` es `(id_opcion_menu, id_perfil)`, es decir N:M.
6. Propuesta: **una fila por pantalla** + visibilidad N:M + **12 raices por
   modulo**. Resultado: 189 paginas + 36 carpetas, y **ningun perfil pierde ni
   gana pantallas** (solo cambia el nombre y la ubicacion de algunas).
7. **Ejecutada el 2026-10-18**: el catalogo quedo en **225 opciones** (36
   carpetas + 189 pantallas) y **359 filas de visibilidad**. Ya no hay 10 menus
   paralelos: hay uno solo y cada perfil ve su parte (ver 6).

---

## 1. Medicion

| Metrica | Valor |
| :--- | ---: |
| Opciones totales | 451 |
| gen-1 (ids < 11000) | 143 (33 carpetas + 110 paginas), 0 perfiles |
| gen-2 (ids >= 11000) | 308 (68 carpetas + 240 paginas), 1 perfil cada una |
| URLs distintas en gen-2 | 189 |
| Grupos de URLs repetidas | 23 |
| Filas en grupos repetidos | 74 |
| Filas sobrantes al unificar | **51** |
| Maximo de filas para una misma pantalla | 10 (`/mi-cuenta`) |
| Maximo de nombres distintos para una misma pantalla | 4 (`/activos/inventario`) |
| Opciones visibles para mas de un perfil | 0 |
| Entradas de menu sin pagina | 0 |
| Paginas sin entrada de menu | 12 (portadas de seccion) |
| Filas de visibilidad (`opciones_menu_perfiles`) | 308, todas activas |
| Opciones con `contador_clave` | 13 |

---

## 2. Diagnostico

### 2.1 Diez menus, no uno

Cada perfil tiene su arbol completo, escrito aparte. La misma pantalla se repite
con el nombre que le conviene a cada perfil:

| Pantalla | Filas | Perfiles | Nombres que recibe hoy |
| :--- | ---: | :--- | :--- |
| `/mi-cuenta` | 10 | 1-10 | "Mi perfil y seguridad" (igual en los 10) |
| `/activos/inventario` | 4 | 1,4,6,9 | Inventario y CMDB (consulta global) / Inventario (consulta) / Inventario (lectura) / Listado y ficha del activo |
| `/problemas` | 4 | 1,4,6,10 | Problemas (consulta global) / Registro de problemas / Problemas y errores conocidos / Registro de problemas |
| `/cambios/gestion/calendario` | 4 | 4,5,7,8 | Calendario de cambios / de mantenimientos / de cambios / de ventanas |
| `/tickets/reportes` | 4 | 1,4,6 | Indicadores operativos y SLA (x2) / Cumplimiento de SLA / Indicadores operativos y SLA |
| `/tickets/gestion/todos` | 3 | 1,4,6 | Todos los tickets / ... de mi area tecnica / ... (solo lectura) |
| `/conocimiento` | 3 | 3,4,5 | Buscar y leer articulos / Base de conocimiento / Gestion de Conocimiento |
| `/cambios/gestion/todos` | 3 | 1,6,8 | Cambios (consulta global) / Cambios: historial... / Historial consolidado |
| `/tickets/gestion/auditoria` | 3 | 1,4,6 | Auditoria forense de tickets / Auditoria de mi area / Auditoria forense |

### 2.2 El modelo de acceso esta escrito en el nombre

"Cumplimiento de licencias" no es una pantalla distinta de "Licencias
(consulta)": es la misma pagina con otro nombre porque la ve el Auditor. Eso
obliga a mantener N nombres coherentes y a repetir cada alta, cada cambio de
ruta y cada reordenamiento 10 veces.

### 2.3 gen-1 es peso muerto

143 filas, 0 perfiles, 105 de sus 110 paginas ya estan en gen-2. Solo aportan 4
destinos que gen-2 no tiene (ver 4.5). Provienen del catalogo original
("Mesa de Servicio", "Mi trabajo", "Seguimiento de SLA"...) y quedaron
huerfanas al construir gen-2.

### 2.4 Un duplicado dentro del mismo perfil

El Auditor tiene `/tickets/reportes` dos veces (ids `16017` y `16024`, en dos
carpetas distintas). No es un problema de perfiles: es un duplicado del arbol.

### 2.5 El esquema ya soporta el objetivo

```
PRIMARY KEY (id_opcion_menu, id_perfil)
```

Una opcion puede tener N perfiles sin cambiar el esquema ni el codigo:
`obtenerMenuDelUsuario` hace `INNER JOIN` con `opciones_menu_perfiles` y
`MenuLateral` solo pinta lo que llega. **Ningun archivo del codigo referencia
ids concretos.**

### 2.6 Columnas sin uso

| Columna | Con valor | Nota |
| :--- | ---: | :--- |
| `permiso_requerido` | 0/451 | la autorizacion real va por `page-auth` |
| `modulo_requerido` | 0/451 | idem |
| `condicion_nivel` | 0/451 | idem |
| `abierto_por_defecto` | 451/451 | siempre informada |
| `contador_clave` | 13/451 | se debe preservar al migrar |
| `bloqueado` | 451/451 | se transporta, no se usa en el render |

---

## 3. Modelo objetivo

1. **Una fila por pantalla.** La identidad de una opcion es su `url_menu`
   completa (incluye `?vista=...` cuando son pantallas distintas).
2. **Visibilidad N:M** en `opciones_menu_perfiles`: la unica fuente de "quien ve
   que". El nombre no cambia por perfil.
3. **Carpeta vs pagina:** `url_menu = ''` es carpeta; `url_menu` con valor es
   pagina. Una carpeta podra tener ademas la URL de su portada (doble clic).
4. **La estructura refleja `src/modules`**, no el perfil.
5. **Un nombre neutro por pantalla.** "Mis cambios" y "Todos los cambios" son
   pantallas distintas y conservan su nombre; "Inventario (lectura)" no, porque
   es la misma pantalla.
6. `nivel` y `orden` se calculan del arbol; no se escriben a mano.
7. Lo que el Administrador quiera cambiar despues (mover, renombrar, dar o
   quitar visibilidad) se hace desde `/plataforma/admin/menu`, que ya existe.

---

## 4. Estructura propuesta

### 4.1 Raices (12)

Se validaron por reglas contra los 174 destinos: **0 sin ubicar**.

| Raiz | Contenido | Destinos |
| :--- | :--- | ---: |
| Activos y CMDB | inventario, licencias, CMDB, proveedores y contratos, catalogos | 38 |
| Mesa de Servicio | tickets, incidentes, solicitudes, catalogo, SLA, avisos | 29 |
| Cambios | RFC, calendario, CAB, aprobaciones, PIR | 28 |
| Problemas | registro, analisis, KEDB, candidatos | 19 |
| Configuracion | formularios, flujos, organizacion, identidades, menu | 17 |
| Mi trabajo | panel, tareas, agenda, desempeno, equipo, aprobaciones | 15 |
| Plataforma | auditoria, seguridad, salud, retencion, accesos | 9 |
| Conocimiento | base, articulos, revisiones | 6 |
| Reportes | operativos, tableros, informes de auditoria | 5 |
| Catalogo de Servicios | servicios y objetivos SLA | 3 |
| Operacion | eventos, resiliencia | 3 |
| Mi cuenta | perfil y preferencias de notificacion | 2 |

### 4.2 Subcarpetas

| Raiz | Subcarpetas (destinos) |
| :--- | :--- |
| Activos y CMDB | Inventario (11), Mi area (10), CMDB (8), Catalogos (4), Licencias (3), Proveedores y contratos (2) |
| Mesa de Servicio | Gestion (11), Mi mesa (7), SLA (5), Catalogo (2), Aprobaciones (1), Auditoria (1), Avisos (1), Incidentes mayores (1) |
| Cambios | Mi cambios (11), Gestion (8), CAB (3), Aprobaciones (2), raiz (4) |
| Problemas | raiz (19) |
| Configuracion | Cambios (4), Problemas (3), Organizacion (3), Mesa de Servicio (2), Identidades (2), Menu y notificaciones (2), Conocimiento (1) |
| Mi trabajo | raiz (9: paneles y desempeno), Aprobaciones (2), Equipo (2) |
| Plataforma | raiz (5), Cumplimiento (3), Accesos (1) |
| Conocimiento | raiz (6) |
| Reportes | raiz (4), Auditoria (1) |
| Catalogo de Servicios | raiz (3) |
| Operacion | raiz (3) |
| Mi cuenta | raiz (2) |

**Criterio de ubicacion:** la URL manda. `/tickets/**` -> Mesa de Servicio;
`/cambios/**` y `/perfiles/*/cambios/**` -> Cambios; `/activos/**`,
`/gestor-activos/**` y `/admin/activos-config/**` -> Activos y CMDB; y asi. Lo
que no encaje se mueve desde el admin de menu, sin tocar codigo.

### 4.3 Las consolas de rol

Las 84 pantallas bajo `/plataforma/perfiles/<rol>/**` se reparten por dominio
(una aprobacion de cambio va a Cambios, no a "Supervisor"), salvo las
personales (panel, tareas, agenda, desempeno, equipo), que van a **Mi trabajo**.

Esto cumple el caso de uso pedido: el Administrador y el Tecnico abren la misma
carpeta "Cambios" y cada uno ve sus hijos; el Tecnico ve "Mis cambios", el
Gestor de Cambios ve "Bandeja de RFC por evaluar", el Administrador ve ademas
"Configuracion > Cambios".

### 4.4 Portadas de carpeta (doble clic)

Hay 12 paginas reales que hoy no tienen entrada de menu porque son portadas de
seccion: `/plataforma/activos`, `/plataforma/admin`,
`/plataforma/admin/procesos/{cambios,incidentes,problemas,solicitudes}`,
`/plataforma/cambios`, `/plataforma/cambios/gestion`,
`/plataforma/gestor-activos/cmdb/analisis`, `/plataforma/perfiles/tecnico`,
`/plataforma/tickets/gestion` y `/plataforma/dashboard`.

Son las candidatas naturales a **portada de carpeta**: se guardan en el
`url_menu` de la carpeta y el doble clic las abre. Mientras el doble clic no
exista, las carpetas siguen con `url_menu = ''` (regla ya aplicada en
`20261018_carpetas_sin_url.sql`).

### 4.5 Pantallas que solo existen en gen-1

| id | Pantalla | Decision |
| :--- | :--- | :--- |
| 114, 1600 | `/tickets/gestion/ayuda` (Guias de autoayuda) | Falta ubicarla; candidata a "Mesa de Servicio > Avisos > Ayuda" |
| 132 | `/tickets/gestion/tecnicos` (Monitoreo de tecnicos) | El supervisor ya tiene "Monitoreo de tecnicos" como carpeta (`14004`) sin portada: candidata a portada de esa carpeta |
| 135 | `/incidentes` | Pagina suelta que duplica el flujo de tickets; no se agrega al menu |
| 136 | `/solicitudes` | Idem |

Las paginas 135 y 136 se autoprotegen mirando el menu (`menu.some(url_menu === ...)`),
asi que hoy redirigen a `/dashboard` para todos: son inalcanzables y no estan en
ningun arbol. Recomendacion: retirarlas del codigo (es decision del dueno del
modulo `tickets`, no del menu).

---

## 5. Migracion

### 5.1 Invariante de aceptacion

> Para cada perfil, el **conjunto de URLs** que ve hoy debe ser identico al que
> ve despues. Cambian los nombres, el orden y la ubicacion; no la cobertura.

Se verifica en SQL antes y despues (ver 5.6).

### 5.2 Estrategia

Reconstruccion completa, no cirugia fila por fila:

1. Respaldo: `CREATE TABLE opciones_menu_bak_20261018 AS SELECT * FROM opciones_menu;`
   (idem `opciones_menu_perfiles`).
2. Generar el arbol nuevo con **ids en el rango 21000+** (carpetas y paginas),
   a partir de una tabla de definicion (una fila por pantalla, con su
   visibilidad por perfil).
3. Insertar en una transaccion y luego borrar el catalogo anterior
   (`DELETE FROM opciones_menu_perfiles; DELETE FROM opciones_menu;`).
4. `seed.sql`: reescribir el bloque de menu con el arbol nuevo (hoy el seed
   define gen-1 y gen-2 a mano; pasa a definir solo el catalogo unico).
5. Rollback: `TRUNCATE` de ambas tablas + `INSERT ... SELECT` desde el respaldo.

### 5.3 Por que ids nuevos

- No hay `FOREIGN KEY` externa: solo `opciones_menu_perfiles` y `id_padre`
  apuntan a `opciones_menu` (`ON DELETE NO ACTION`).
- Ningun archivo del codigo usa ids concretos.
- Evita decidir "cual de las 10 filas de `/mi-cuenta` sobrevive" y arrastrar
  `id_padre`/`orden` de arboles que desaparecen.
- La trazabilidad queda en el respaldo y en el historial de git, no en los ids.

### 5.4 Visibilidad

Cada pantalla nueva recibe una fila por cada perfil que hoy la ve (union de los
perfiles de sus filas actuales): **239 filas** (antes 240; la que sobra es el
duplicado interno del Auditor). Lo que cambia es que ahora 51 de esas filas
cuelgan de una opcion compartida en vez de una copia.

Ademas, **cada carpeta necesita su propia fila de visibilidad**: el arbol se
construye uniendose contra `opciones_menu_perfiles`, asi que una carpeta sin
perfil no se dibuja y sus hijos desaparecen con ella. La regla es:

> Una carpeta es visible para todo perfil que vea **al menos un descendiente**
> (hijo, nieto...), no solo un hijo directo.

Eso importa en las raices cuyos hijos son todas carpetas: `Mesa de Servicio`,
`Activos y CMDB` y `Configuracion` no tienen ninguna pantalla colgando
directamente, asi que mirar solo a los hijos directos las dejaba sin visibilidad
y el modulo entero desaparecia del menu. Con la regla de descendientes, las 43
carpetas aportan **120 filas**. Total: **359 filas** (239 pantallas + 120
carpetas).

### 5.5 Orden y nombres

- Un nombre neutro por pantalla. Se toma el mas corto y sin coletilla de alcance
  ("Inventario de activos", no "Inventario (lectura)"); el matiz de alcance va a
  `descripcion`.
- `orden` por bloque funcional (bandejas primero, configuracion al final).
- Se preserva `contador_clave` en las 13 opciones que lo tienen.

### 5.5.1 Carpetas que no aportan

Una carpeta con **un solo hijo** no organiza nada: agrega un clic y un nivel de
anidamiento para nada. La regla es:

> Si una carpeta tiene un solo hijo, la carpeta se elimina y el hijo sube un
> nivel, heredando `nivel` y `orden` de la carpeta.

Se aplica en cascada: al subir un hijo, su nueva carpeta padre puede quedar con
un solo hijo y se vuelve a evaluar. En esta migracion eliminaron 7 carpetas:
`Aprobaciones`, `Incidentes mayores` y `Avisos` (bajo Mesa de Servicio),
`Auditoria` (bajo Mesa de Servicio y bajo Reportes), `Conocimiento` (bajo
Configuracion) y `Accesos` (bajo Plataforma).

### 5.6 Verificacion

1. `SELECT` comparativo por perfil: URLs antes vs despues (debe dar 0
   diferencias).
2. Sin huerfanos: `opciones_menu_perfiles` sin fila en `opciones_menu` = 0.
3. Sin duplicados: `url_menu` repetida entre paginas = 0 (salvo `?vista=`).
4. Render: entrar con un usuario de cada perfil y comparar el menu.
5. `npx tsc --noEmit` y `npm run build` verdes.

---

## 6. Resultado de la ejecucion (2026-10-18)

Migracion aplicada: `db/migrations/20261019_unificacion_catalogo_menu.sql`.

| Concepto | Antes | Despues |
| :--- | ---: | ---: |
| Filas en `opciones_menu` | 451 | **225** |
| Carpetas (`url_menu = ''`) | 68 | **36** |
| Pantallas (URL con valor) | 240 | **189** |
| URLs distintas | 189 | **189** |
| Filas en `opciones_menu_perfiles` | 308 | **359** (239 pantallas + 120 carpetas) |
| Opciones sin ningun perfil | 143 | **0** |
| Enlaces a rutas inexistentes | 0 | **0** |

Invariante verificado contra el respaldo (`opciones_menu_bak_20261018`): **0 URLs
que falten, 0 que sobren**, en los 10 perfiles.

| Perfil | Pantallas antes | Pantallas despues | URLs distintas |
| :--- | ---: | ---: | ---: |
| 1 Administrador | 44 | 44 | 44 |
| 2 Tecnico | 36 | 36 | 36 |
| 3 Solicitante | 9 | 9 | 9 |
| 4 Supervisor | 36 | 36 | 36 |
| 5 Gestor de Area | 18 | 18 | 18 |
| 6 Auditor | 23 | 22 | 22 |
| 7 Aprobador (CAB) | 15 | 15 | 15 |
| 8 Gestor de Cambios | 19 | 19 | 19 |
| 9 Gestor de Activos | 26 | 26 | 26 |
| 10 Gestor de Problemas | 14 | 14 | 14 |

El Auditor baja de 23 a 22 filas porque tenia `/tickets/reportes` dos veces en su
propio menu. El conjunto de URLs no cambia en ningun perfil.

Integridad: 0 visibilidades huerfanas, 0 `id_padre` inexistente, 0 URL duplicada
entre pantallas, 0 carpetas sin visibilidad.

**Correccion posterior al primer intento:** la primera pasada calculo la
visibilidad de cada carpeta solo con sus hijos directos. Eso dejo sin fila a las
tres raices cuyos hijos son todas carpetas (`Mesa de Servicio`, `Activos y CMDB`,
`Configuracion`): el arbol no las dibujaba y se perdian 3 modulos completos. Se
corrigio con la regla de descendientes (5.4), que agrego 19 filas. Verificado con
la consulta recursiva de render: los 10 perfiles ven sus raices.

**Segunda pasada:** se aplico la regla de carpetas sin funcion (5.5.1). Se
eliminaron 7 carpetas de un solo hijo, quedando **36 carpetas** y **225
opciones**. El invariante de URLs se volvio a verificar contra el respaldo: 0
diferencias en los 10 perfiles. Los ids se renumeraron en orden de arbol
(21001+), asi que la migracion reproduce el estado exacto al re-aplicarse.

Archivos tocados: la migracion, `db/seed.sql` (bloque de menu reescrito con el
catalogo unico) y `db/schema.sql` (las 6 columnas de menu que solo existian en
migraciones: `permiso_requerido`, `modulo_requerido`, `condicion_nivel`,
`contador_clave`, `bloqueado`, `abierto_por_defecto`).

Rollback: `TRUNCATE opciones_menu_perfiles, opciones_menu; INSERT ... SELECT`
desde las tablas `_bak_20261018`.

---

## 7. Decisiones (cerradas)

| # | Decision | Resolucion |
| :--- | :--- | :--- |
| D1 | Nombres y cantidad de raices (4.1) | Aprobadas las 12 |
| D2 | Consolas de rol dentro de su dominio (4.3) | Repartidas por dominio |
| D3 | Las 4 pantallas de 4.5 | Fuera del catalogo (eran gen-1; desaparecen con el) |
| D4 | Ejecutar la migracion | Ejecutada |

Sobre D3: las 4 filas no entran al catalogo. Dos de esas rutas siguen existiendo
como pagina viva enlazada desde otras pantallas (`Monitoreo de tecnicos` desde el
panel del supervisor y `Ayuda` desde Configuracion de Conocimiento), asi que no se
borraron del codigo en esta migracion; `/incidentes` y `/solicitudes` quedan sin
entrada de menu. Retirar esas paginas del codigo es un cambio aparte, de los
modulos `tickets`, `incidentes` y `solicitudes`.

---

## 8. Riesgos

| Riesgo | Mitigacion |
| :--- | :--- |
| Perder matices de nombre ("consulta global" vs "lectura") | Nombre neutro + `descripcion` |
| Cambia el orden del menu de cada perfil | Es esperado: el orden pasa a ser global |
| El admin mueve algo y se pierde en la siguiente migracion | `seed.sql` se reescribe una sola vez; el admin edita despues |
| Las 4 vistas `?vista=` se confunden con duplicados | La identidad incluye la query string |
| El Auditor tenia un duplicado interno | Se elimina (una sola entrada de `/tickets/reportes`) |

---

## 9. Reproducir la medicion

Con `DATABASE_URL` en `.env.local`:

```sql
-- paginas gen-2 y cuantas filas tiene cada URL exacta
SELECT url_menu, COUNT(*) AS filas
FROM opciones_menu om
WHERE estado_registro AND id_opcion_menu >= 11000
  AND NOT EXISTS (SELECT 1 FROM opciones_menu h
                  WHERE h.id_padre = om.id_opcion_menu AND h.estado_registro)
GROUP BY url_menu HAVING COUNT(*) > 1
ORDER BY filas DESC;
```
