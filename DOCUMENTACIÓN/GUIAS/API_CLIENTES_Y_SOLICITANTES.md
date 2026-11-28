# Intercambio de datos con otros equipos: API de clientes y API de solicitantes

FlowDesk tiene **dos conexiones** con otros equipos. Son distintas y conviene no mezclarlas:

| | **API de clientes (Equipo 10)** | **API de solicitantes (FlowDesk)** |
|---|---|---|
| Dirección | **Saliente**: FlowDesk le pide datos al Equipo 10 | **Entrante**: otros equipos le piden datos a FlowDesk |
| Qué datos | Clientes de su tienda | Nuestros solicitantes activos |
| Seguridad | Una clave fija (`X-API-Key`) que **ellos** nos dieron | Credencial + token temporal que **nosotros** emitimos |
| Quién la usa | El Administrador, desde Integraciones API | El sistema del otro equipo, desde su servidor |

---

## 1. Mapa de carpetas y archivos

```
APIS COMPARTIDAS/
├── API_CLIENTES.md                     ← documento que nos entregó el Equipo 10
└── API_SOLICITANTES_FLOWDESK.md        ← documento que entregamos a los otros equipos

db/07_api_integraciones_seguras.sql     ← tablas, bitácora inmutable, configuración y opción de menú

src/shared/lib/seguridad-api-externa.ts ← toda la seguridad de la API entrante (tokens, bloqueos, bitácora)

src/modules/integraciones/
├── services/
│   ├── clientesExternosService.ts      ← llamada a la API del Equipo 10 (saliente)
│   ├── credencialesApiService.ts       ← emitir, revocar y rotar credenciales; consultar la bitácora
│   └── solicitantesApiService.ts       ← qué datos de solicitantes se entregan (entrante)
├── api/integracionesController.ts      ← solo Administrador; genera JSON, CSV, Excel y PDF
└── views/
    ├── VistaClientesExternos.tsx       ← vista previa y descarga de clientes
    ├── VistaCredencialesApi.tsx        ← credenciales emitidas
    └── VistaBitacoraApi.tsx            ← bitácora de accesos

src/app/api/integraciones/              ← rutas INTERNAS (requieren sesión de Administrador)
├── credenciales/            GET lista · POST emitir
├── credenciales/[id]/       PATCH revocar / rotar
├── bitacora/                GET bitácora
└── clientes-externos/       GET vista previa o descarga (?formato=json|csv|xlsx|pdf)

src/app/api/v1/                         ← rutas PÚBLICAS (para los otros equipos)
├── auth/token/              POST canjear credencial por token
├── solicitantes/            GET  lista de solicitantes (con token)
├── health/                  GET  estado del servicio
└── info/                    GET  descripción de la API
```

**Pantalla:** Plataforma → Seguridad → **Integraciones API**. Solo la ve el **Administrador** (perfil 1).

---

# PARTE A · API de clientes del Equipo 10 (FlowDesk consume)

## A.1 Acuerdo entre equipos y entrega de la clave

El Equipo 10 nos entregó el documento `APIS COMPARTIDAS/API_CLIENTES.md` con lo siguiente:

- **Endpoint:** `GET https://carrito-equipo10.onrender.com/api/clientes`
- **Autenticación:** encabezado `X-API-Key: <clave>`. La clave se entrega **por mensaje privado**.
- **Paginación:** parámetros `pagina` y `por_pagina` (máximo 100). La respuesta trae `total_paginas`.
- **Identificador común:** el **correo**. Si un cliente ya existe con ese correo, no se duplica.
- **Hosting:** Render gratuito. Si nadie lo usa por unos 15 minutos, la primera petición tarda de 30 a 60 s, así que hay que esperar al menos 90 s.

Respuesta de ejemplo:

```json
{
  "equipo": "10", "pagina": 1, "por_pagina": 50, "total": 2, "total_paginas": 1,
  "clientes": [
    { "id": 15, "nombres": "Ana", "apellidos": "Pérez Gómez", "correo": "ana@mail.com",
      "telefono": "987654321", "direccion": "Av. Lima 123", "ubigeo": "150101",
      "fecha_registro": "2026-11-20T10:30:00" }
  ]
}
```

## A.2 Dónde guardamos cada dato

| Dato | Dónde | Motivo |
|---|---|---|
| Clave `X-API-Key` | Variable de entorno `EQUIPO10_API_KEY` (`.env.local` y Vercel) | Es secreta: no entra a la base de datos, al navegador ni a GitHub |
| URL (opcional) | Variable `EQUIPO10_API_URL` | Permite cambiar de servidor sin tocar la base de datos |
| Ruta, tamaño de página y tiempo de espera | `configuracion_sistema`, clave `integracion_equipo10_clientes` (la crea `db/07`) | No son secretos |

```sql
-- db/07_api_integraciones_seguras.sql
'integracion_equipo10_clientes' →
  {"url_base": "https://carrito-equipo10.onrender.com", "ruta": "/api/clientes",
   "por_pagina": 100, "tiempo_espera_ms": 90000}
```

`leerConfig()` limita los valores (`por_pagina` entre 1 y 100, tiempo de espera entre 5 y 110 s) y en producción **exige HTTPS**.

## A.3 La llamada, siempre desde el servidor

El navegador **nunca** habla con el Equipo 10. El recorrido es este:

```
Navegador ──GET /api/integraciones/clientes-externos──▶ servidor FlowDesk ──GET + X-API-Key──▶ Equipo 10
```

`pedirPagina()` (en `clientesExternosService.ts`):

```ts
res = await fetch(url, {
  method: "GET",
  headers: { "X-API-Key": clave, Accept: "application/json" },
  cache: "no-store",
  redirect: "error",                    // no sigue redirecciones: la clave no puede filtrarse a otro sitio
  signal: AbortSignal.timeout(esperaMs) // 90 s en la primera página (Render puede estar "dormido")
});
```

**Protecciones de la llamada:**

| Situación | Qué hace |
|---|---|
| Error de red | Reintenta una vez |
| Render responde 502, 503 o 504 mientras arranca | Espera 4 s y reintenta |
| 401 / 403 / 429 / 500… | Traduce el error (por ejemplo, 401 → "revise EQUIPO10_API_KEY") |
| La respuesta no es JSON o no trae `clientes` | Error 502 "formato no esperado" |
| Tiempo agotado | Error 504 "puede estar iniciando, intente en un minuto" |

**Todas las páginas.** Pide la página 1, lee `total_paginas` y pide las demás. Hay un tope de seguridad de **50 páginas** (5 000 clientes), y si el total lo supera la respuesta lo indica con `truncado: true`.

**Limpieza de datos.** `normalizar()` quita caracteres de control y recorta cada campo a una longitud máxima.

## A.4 Qué hacemos con los datos

- **No se guardan en FlowDesk.** Se consultan, se muestran o se exportan, y se descartan.
- Desde la pantalla hay dos opciones:
  - **Vista previa:** una tabla en pantalla.
  - **Descarga:** en **JSON, CSV, Excel o PDF** (`generarArchivo` en el controlador).
    - El **CSV** evita la inyección de fórmulas: si un valor empieza con `=`, `+`, `-` o `@`, le antepone una comilla.
    - El **Excel** congela la fila de títulos, añade autofiltro y una hoja **"Origen"** con la empresa, el servidor, la fecha y el total.
    - El **PDF** incluye un subtítulo con el total, el origen y la fecha de extracción.
- Cada extracción, exitosa o fallida, queda en la **bitácora** con dirección `SALIENTE`: quién la hizo, cuántos clientes trajo y en qué formato.

```ts
await registrarBitacora({ direccion: "SALIENTE", grupo: "Equipo 10 · API de clientes", idUsuario,
  codigo: 200, detalle: `${datos.clientes.length} clientes · descarga XLSX` });
```

---

# PARTE B · API de solicitantes (FlowDesk expone)

Funciona como el flujo **"client credentials" de OAuth2**, pero más simple:

```
1. El Administrador emite la credencial      → client_id + client_secret (el secreto se ve una sola vez)
2. El otro equipo canjea la credencial       → POST /api/v1/auth/token  → token de 15 minutos
3. El otro equipo consulta con el token      → GET /api/v1/solicitantes con Authorization: Bearer <token>
```

## B.1 Requisito del servidor: el "pepper"

La variable `API_KEY_SALT` (**mínimo 32 caracteres**) debe existir en el servidor. Con ella se calcula el HMAC de secretos y tokens. Si falta, la API **no atiende nada** y responde 503: es un diseño "falla cerrado".

```ts
function obtenerPepper(): string | null {
  const pepper = process.env.API_KEY_SALT || "";
  return pepper.length >= 32 ? pepper : null;
}
```

## B.2 El Administrador crea la credencial

En **Integraciones API → Credenciales** se registra:

| Campo | Regla |
|---|---|
| Nombre del equipo o sistema | Mínimo 3 caracteres |
| Contacto | Opcional |
| Vigencia | 1 a 180 días (30 por defecto) |
| Límite por minuto | 5 a 600 peticiones (60 por defecto) |
| IPs permitidas | Opcional, hasta 10 (IPv4/IPv6) |

`POST /api/integraciones/credenciales` → `crearCredencial()`:

```ts
const clientId = generarClientId();      // "fdc_" + 18 caracteres hexadecimales
const secreto  = generarClientSecret();  // "fds_" + 32 bytes aleatorios en base64url
// En la BD solo se guarda hmacSecreto(secreto) = HMAC-SHA256(secreto, API_KEY_SALT)
// Permiso asignado: ["solicitantes:leer"]
```

- El secreto **se muestra una sola vez**. Ni FlowDesk puede recuperarlo después, porque solo guarda su HMAC.
- Se entrega al otro equipo **por privado**, junto con el documento `APIS COMPARTIDAS/API_SOLICITANTES_FLOWDESK.md`.
- La emisión queda en la bitácora con dirección `ADMIN`.
- **Protección CSRF:** las operaciones de escritura exigen que la petición venga del mismo origen que FlowDesk.

## B.3 El otro equipo pide un token

```http
POST /api/v1/auth/token
Content-Type: application/json

{ "client_id": "fdc_...", "client_secret": "fds_..." }
```

También acepta los mismos datos por **HTTP Basic**. `emitirToken()` revisa, **en este orden**:

1. Que la API esté configurada (`API_KEY_SALT`) y que la conexión sea **HTTPS** en producción.
2. **Bloqueo por fuerza bruta:** 10 fallos por IP o 5 por `client_id` en 15 minutos → **429** con `Retry-After`.
3. **Comparación del secreto:** calcula el HMAC **aunque el `client_id` no exista**, para no delatar por el tiempo de respuesta. Compara con `timingSafeEqual`.
4. Que la credencial no esté **revocada** ni **vencida**.
5. Que la **IP** esté permitida, si hay lista.
6. Que no se haya superado el **límite por minuto**.
7. Si todo está bien, genera un token `fdt_...` válido por **15 minutos** y guarda **solo su hash** en `api_token_acceso`.

```json
{ "access_token": "fdt_...", "token_type": "Bearer", "expires_in": 900, "alcance": ["solicitantes:leer"] }
```

## B.4 El otro equipo consulta los datos

```http
GET /api/v1/solicitantes?pagina=1&por_pagina=50&correo=ana@empresa.com
Authorization: Bearer fdt_...
```

`validarToken()` repite los controles: formato del token, hash, vigencia, revocación, IP, permiso `solicitantes:leer` y límite por minuto. Después, `listarSolicitantes()` entrega:

- **Solo** usuarios activos, no bloqueados y con perfil **Solicitante (3)**.
- Campos mínimos: id, nombres, apellidos, correo, teléfono, departamento y fecha de registro.
- El **DNI enmascarado** (`****5678`).
- Paginación (`pagina`, `por_pagina` hasta 100, `total`, `total_paginas`) y búsqueda exacta por `correo`.

```json
{
  "sistema": "FlowDesk ITSM", "recurso": "solicitantes",
  "pagina": 1, "por_pagina": 50, "total": 120, "total_paginas": 3,
  "solicitantes": [
    { "id": 45, "nombres": "Ana", "apellidos": "Pérez Gómez", "correo": "ana@empresa.com",
      "telefono": "987654321", "dni_enmascarado": "****5678", "departamento": "Finanzas",
      "fecha_registro": "2026-10-01T14:00:00.000Z" }
  ]
}
```

La API es de **solo lectura**: POST, PUT, PATCH y DELETE responden **405**. Cada respuesta indica el límite y las peticiones restantes con `X-RateLimit-Limit` y `X-RateLimit-Remaining`.

**Cabeceras de seguridad en todas las respuestas:** `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`. No hay CORS (no se puede llamar desde un navegador ajeno), y los errores son genéricos para no revelar detalles internos.

## B.5 Mantenimiento de credenciales

| Acción | Efecto |
|---|---|
| **Revocar** | Apaga la credencial y **anula todos sus tokens activos** en la misma transacción |
| **Rotar** | Genera un secreto nuevo (se muestra una sola vez), invalida el anterior y anula sus tokens |
| **Vencimiento** | Al llegar la fecha de expiración, la credencial deja de funcionar sola |

Las credenciales del esquema antiguo (sin `client_id`) quedaron revocadas automáticamente al ejecutar `db/07`.

## B.6 Bitácora inmutable

La tabla `api_log_auditoria` registra **cada petición**: dirección (`ENTRANTE`, `SALIENTE` o `ADMIN`), credencial, usuario interno, método, ruta, código HTTP, IP, tiempo de respuesta, error y detalle.

- Un trigger (`trg_proteger_log_auditoria`) **impide modificarla o borrarla**.
- Los bloqueos por fuerza bruta y el límite por minuto se **calculan sobre esta bitácora** en la base de datos. Por eso funcionan en Vercel, que es serverless y no guarda memoria entre peticiones.
- La pantalla muestra un resumen de las últimas 24 horas: exitosas, rechazadas (401/403), bloqueadas (429) y extracciones salientes.

---

## C. Los finales posibles

### API de solicitantes (entrante)
| Código | `error` | Cuándo |
|---|---|---|
| **200** | — | Token emitido o datos entregados |
| **400** | `https_requerido` / `parametro_invalido` | Conexión sin HTTPS, o `pagina`, `por_pagina` o `correo` inválidos |
| **401** | `no_autorizado` | Secreto incorrecto, o token ausente, mal formado, vencido o revocado |
| **403** | `ip_no_permitida` / `permiso_insuficiente` | IP fuera de la lista, o credencial sin el permiso |
| **405** | `metodo_no_permitido` | Intento de escritura, o GET en `/auth/token` |
| **429** | `bloqueo_temporal` / `limite_excedido` | Fuerza bruta, o más peticiones por minuto de las permitidas |
| **500** | `error_interno` | Falla inesperada (sin detalles) |
| **503** | `servicio_no_disponible` | Falta `API_KEY_SALT` |

### API de clientes (saliente)
| Resultado | Cuándo |
|---|---|
| Vista previa o archivo | Todo correcto; se registra en la bitácora `SALIENTE` |
| **503** | Falta `EQUIPO10_API_KEY` en el servidor |
| **502** | El Equipo 10 rechazó la clave, falló o devolvió un formato inesperado |
| **504** | No respondió a tiempo (Render "dormido") o no hubo conexión |

---

## D. Resumen para la sustentación

- **Hacia afuera** usamos la clave que nos dieron, **siempre desde el servidor**, sin guardar sus datos y dejando registro de cada consulta.
- **Hacia adentro** nunca hay una clave fija: hay una **credencial que vence y se puede revocar**, un **token de 15 minutos**, **solo hashes** en la base de datos, **límites contra abuso**, **datos mínimos** (DNI enmascarado) y una **bitácora que no se puede modificar**.
