# Facturación electrónica SUNAT con Nubefact

FlowDesk **no se conecta directamente con la SUNAT**. Lo hace a través de **Nubefact**, un proveedor autorizado por la SUNAT (OSE/PSE). Nubefact arma el XML, lo firma digitalmente, lo envía a la SUNAT y nos devuelve la respuesta (el **CDR**, Constancia de Recepción).

```
Pantalla (React) → API de FlowDesk (/api/facturacion/...) → comprobantesService.ts → nubefactCliente.ts
   → POST a la RUTA de la cuenta en Nubefact → Nubefact firma y envía a la SUNAT → respuesta + PDF / XML / CDR
   → FlowDesk guarda el estado y los archivos en su base de datos
```

> La cuenta que usamos es **DEMO**: los comprobantes no tienen validez legal, pero el circuito es idéntico al real.

---

## 1. Mapa de carpetas y archivos

```
src/modules/facturacion/
├── services/
│   ├── nubefactCliente.ts                 ← ÚNICO lugar que habla con Nubefact (HTTP)
│   ├── comprobantesService.ts             ← registrar, emitir, consultar, archivos, conformidad
│   └── configuracionFacturacionService.ts ← ruta, series, datos de la institución, RUC de proveedores
├── api/comprobantesController.ts          ← permisos y respuestas HTTP de cada endpoint
├── components/
│   ├── ComprobantesWorkspace.tsx          ← pantalla de comprobantes (lista, detalle, acciones)
│   └── FormularioComprobante.tsx          ← formulario de registro
└── views/VistaConfiguracionFacturacion.tsx← pantalla de configuración

src/app/api/facturacion/
├── catalogos/                    GET   catálogos del formulario
├── comprobantes/                 GET   lista · POST registrar
├── comprobantes/[id]/            GET   detalle · DELETE anular borrador
├── comprobantes/[id]/emitir/     POST  enviar a SUNAT
├── comprobantes/[id]/estado/     POST  volver a consultar a SUNAT
├── comprobantes/[id]/archivo/    GET   descargar PDF / XML / CDR
├── comprobantes/[id]/conformidad/POST  conformidad del área usuaria
├── configuracion/                GET / PUT configuración
├── configuracion/probar/         POST  probar conexión
└── proveedores/[id]/             PUT   RUC y razón social del proveedor

src/app/plataforma/activos/comprobantes/page.tsx   ← página de comprobantes

db/06_facturacion_electronica_proveedores.sql      ← tablas comprobante_proveedor, _detalle, _evento
db/08_comprobantes_archivos.sql                    ← tabla inmutable de archivos (XML, CDR, PDF)
```

---

## 2. Paso 0 · Obtener acceso (fuera de FlowDesk)

1. Crear una cuenta en **Nubefact** (DEMO para pruebas; producción con certificado digital y RUC real).
2. En el panel de Nubefact, sección **API (Integración)**, se obtienen dos datos:
   - **RUTA**: `https://api.nubefact.com/api/v1/<identificador-de-la-cuenta>`. Identifica la cuenta y **no es secreta**.
   - **TOKEN**: la clave de acceso. **Es secreta**.
3. Cada dato se guarda en un lugar distinto:

| Dato | Dónde se guarda | Por qué |
|---|---|---|
| TOKEN | Variable de entorno `NUBEFACT_TOKEN` (`.env.local` y Vercel) | Nunca toca la base de datos, la pantalla ni GitHub |
| RUTA, series, RUC… | `configuracion_sistema`, clave `integracion_nubefact` | No son secretos; se editan desde la pantalla |

```ts
// nubefactCliente.ts — el token solo se lee del entorno del servidor
function token(): string {
  return (process.env.NUBEFACT_TOKEN || "").trim();
}
export function tokenConfigurado(): boolean {
  return token().length >= 20;
}
```

---

## 3. Paso 1 · Configurar la integración

**Ubicación:** Activos → Configuración de activos → **Facturación electrónica (SUNAT)**. Solo la ve quien tiene la capacidad `FACTURACION_CONFIGURAR`.

Se registran la ruta, las series (`FFF1` facturas, `BBB1` boletas), el tiempo de espera y los datos de la institución (RUC, razón social y dirección). Al guardar se llama a `PUT /api/facturacion/configuracion` → `guardarConfiguracion()`:

```ts
// configuracionFacturacionService.ts
if (ruta && !rutaValida(ruta)) throw new ErrorDominio("La ruta debe ser la de su cuenta de Nubefact...");
if (!/^F[A-Z0-9]{3}$/.test(s)) throw new ErrorDominio("La serie de facturas debe ... empezar con F (ej. FFF1).");
if (ruc && !/^(10|15|17|20)\d{9}$/.test(ruc)) throw new ErrorDominio("El RUC de la institución debe tener 11 dígitos válidos.");
if (nueva.habilitado && (!nueva.ruc_institucion || !nueva.ruta))
  throw new ErrorDominio("Para habilitar la integración registre la ruta de Nubefact y el RUC de la institución.");
```

`rutaValida()` solo acepta **HTTPS hacia dominios de Nubefact**, para que el token nunca viaje a otro servidor:

```ts
export function rutaValida(ruta: string): boolean {
  const u = new URL(ruta);
  const hostOk = u.hostname === "api.nubefact.com" || u.hostname.endsWith(".nubefact.com") || u.hostname.endsWith(".pse.pe");
  return u.protocol === "https:" && hostOk && /^\/api\/v1\/[A-Za-z0-9-]{8,}\/?$/.test(u.pathname) && !u.search && !u.username;
}
```

### Probar conexión
`POST /api/facturacion/configuracion/probar` → `probarConexion()`. Usa los datos que están **en el formulario** aunque todavía no se hayan guardado (`configParaPrueba()`), y **no emite nada**:

1. ¿Existe `NUBEFACT_TOKEN`?
2. ¿La ruta tiene un formato válido?
3. Consulta un comprobante que no existe (número `99999999`). Si Nubefact responde el **código 24** ("el documento no existe"), entonces la ruta y el token son correctos.

```ts
const r = await consultarComprobante("01", config.serie_factura || "FFF1", 99999999, config);
const autenticado = r.json.codigo === 24 || (!r.json.errors && r.status === 200);
```

### Datos de los proveedores
En la misma pantalla, cada proveedor recibe su **RUC y razón social** (`PUT /api/facturacion/proveedores/[id]` → `guardarVinculoProveedor`). El RUC es obligatorio para registrar una **factura**.

---

## 4. Paso 2 · Registrar el comprobante → estado BORRADOR

`POST /api/facturacion/comprobantes` → `registrarComprobante()`:

- Valida el proveedor, el tipo (`01` factura o `03` boleta), las fechas y los ítems.
- Calcula por ítem el subtotal, el **IGV del 18 %** (o lo exonera) y el total.
- Toma la serie de la configuración y genera el código interno `CPE-AAAA-NNNN`.
- Guarda la cabecera (`comprobante_proveedor`) y el detalle (`comprobante_proveedor_detalle`) en una transacción.
- Registra el evento `REGISTRO`.

> Hasta aquí **no se envió nada a la SUNAT**. Un borrador puede anularse con `anularBorrador()` (BORRADOR → ANULADO).

---

## 5. Paso 3 · Emitir → `POST /api/facturacion/comprobantes/[id]/emitir`

`emitirComprobante()` hace lo siguiente:

**a) Controles previos.** Solo se emite desde `BORRADOR` o `ERROR`, con la integración **habilitada** y el RUC de la institución registrado.

**b) Si ya tiene número** (un intento anterior falló por red), **primero consulta** a Nubefact (`SINCRONIZACION_SUNAT`). Así nunca se emite dos veces el mismo comprobante.

**c) Reserva del número correlativo.** Nubefact exige que nosotros enviemos el número. Un bloqueo en la base de datos evita que dos emisiones simultáneas tomen el mismo:

```ts
await cliente.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [`cpe:${tipo}:${serie}`]);
// siguiente = MAX(correlativo) + 1 de esa serie
```

**d) Armado del JSON** según el manual de Nubefact (`armarPayload`):

```json
{
  "operacion": "generar_comprobante",
  "tipo_de_comprobante": 1,
  "serie": "FFF1",
  "numero": 15,
  "sunat_transaction": 1,
  "cliente_tipo_de_documento": 6,
  "cliente_numero_de_documento": "<RUC de la institución>",
  "fecha_de_emision": "27-11-2026",
  "moneda": 1,
  "total_gravada": 100.00,
  "total_igv": 18.00,
  "total": 118.00,
  "enviar_automaticamente_a_la_sunat": true,
  "items": [{ "unidad_de_medida": "NIU", "descripcion": "...", "cantidad": 1, "tipo_de_igv": 1, "...": "..." }]
}
```

Valores clave: `tipo_de_comprobante` 1 = factura y 2 = boleta. Fechas en `DD-MM-AAAA`. `tipo_de_igv` 1 = gravado y 8 = exonerado.

**e) Envío** (`generarComprobante` → `enviar`):

```ts
res = await fetch(config.ruta, {
  method: "POST",
  headers: { Authorization: `Token token="${token()}"`, "Content-Type": "application/json" },
  body: JSON.stringify({ operacion: "generar_comprobante", ...payload }),
  signal: controlador.signal,   // se corta al vencer el tiempo de espera (30 s por defecto)
});
```

**f) Clasificación de la respuesta** (`clasificar`):

```ts
if (r.anulado) return "ANULADO";
if (r.aceptada_por_sunat) return "ACEPTADO";
if (codigo >= 2000 && codigo < 4000) return "RECHAZADO";   // códigos de rechazo de la SUNAT
return "REGISTRADO";                                         // enviado, la SUNAT aún no responde
```

**g) Guardado.** `guardarRespuesta()` actualiza el estado y los campos de la SUNAT, registra el evento y llama a `almacenarArchivos()`.

---

## 6. Paso 4 · Guardar los archivos en FlowDesk

FlowDesk **no depende de los enlaces de Nubefact**. Descarga el **XML firmado**, el **PDF** y el **CDR** y los guarda en `comprobante_proveedor_archivo` junto con su **huella SHA-256**. Un trigger (`trg_proteger_archivo_cpe`) **impide modificarlos o borrarlos**.

Antes de guardarlos, `contenidoValido()` verifica que el contenido sea el que se espera. Mientras un archivo aún no existe, Nubefact devuelve `<xml>-</xml>`.

```ts
if (tipo === "pdf") return b.subarray(0, 5).toString("latin1") === "%PDF-";
return tipo === "xml" ? /<(\w+:)?Invoice[\s>]/.test(textoXml)
                      : /<(\w+:)?ApplicationResponse[\s>]/.test(textoXml);
```

- Cada descarga tiene un límite de **30 s** y **5 MB**.
- El CDR solo se pide cuando la SUNAT ya respondió (`sunatRespondio`).
- Al descargar un archivo (`GET .../archivo?tipo=pdf|xml|cdr`), `archivoComprobante()` lo lee de la base de datos y **recalcula la huella**. Si no coincide, registra `INTEGRIDAD_FALLIDA` y no lo entrega (error 500). Si el CDR aún no existe, responde 409.

---

## 7. Los finales posibles

| Final | Cuándo ocurre | Qué pasa después |
|---|---|---|
| **ACEPTADO** | La SUNAT aceptó (lo normal en facturas) | Se guardan XML, PDF y CDR, y el área usuaria da su **conformidad** |
| ↳ **CONFORME** | El área confirma lo recibido | Si la opción está activa, actualiza el **costo de compra** (con IGV) y la fecha de adquisición de los activos vinculados |
| ↳ **OBSERVADO** | El área encuentra un problema | Queda registrada la observación (el motivo es obligatorio) |
| **REGISTRADO** (pendiente) | Enviado, pero la SUNAT aún no responde. Es típico en **boletas**, que van en un resumen diario | El botón **Consultar estado** (`/estado` → `actualizarEstadoSunat`) vuelve a preguntar hasta que pase a ACEPTADO o RECHAZADO. El CDR se guarda en esa consulta |
| **RECHAZADO** | La SUNAT respondió con un código entre 2000 y 3999 | Es definitivo. Se corrige registrando un comprobante nuevo |
| **ERROR · configuración** | Códigos 10/11 (token o ruta incorrectos), 50/51 (cuenta suspendida o suspendida por falta de pago) → HTTP 503 | Se corrige la configuración y se **reintenta** desde ERROR |
| **ERROR · datos** | Código 20 (JSON inválido), 21 (operación no completada), 22 (fuera de plazo), 40 (error interno de Nubefact) → HTTP 422 | Se corrigen los datos o se espera, y se reintenta |
| **ERROR · red** | Sin conexión o tiempo agotado (`ENVIO_FALLIDO`) | Queda en ERROR **con su número**. Al reintentar, **primero consulta** si Nubefact ya lo tiene |
| **Número ya usado** | Código 23 (alguien emitió ese número desde el panel de Nubefact) | Toma automáticamente el siguiente número, hasta 3 intentos |
| **ANULADO** | El borrador se anula antes de enviarse, o Nubefact informa que el comprobante fue anulado | Ya no se puede emitir |

### Trazabilidad
Cada paso queda registrado en `comprobante_proveedor_evento`:

`REGISTRO` · `EMISION_SUNAT` · `SINCRONIZACION_SUNAT` · `EMISION_FALLIDA` · `ENVIO_FALLIDO` · `CONSULTA_SUNAT` · `CONSULTA_SUNAT_FALLIDA` · `ARCHIVOS_ALMACENADOS` · `ARCHIVOS_PENDIENTES` · `CONFORMIDAD` · `ANULACION` · `INTEGRIDAD_FALLIDA`

---

## 8. Permisos por endpoint

| Capacidad | Endpoints |
|---|---|
| `COMPROBANTES_VER` | listar, detalle, descargar archivo |
| `COMPROBANTES_GESTIONAR` | registrar, anular, emitir, consultar estado, catálogos |
| `COMPROBANTES_CONFORMIDAD` | registrar conformidad |
| `FACTURACION_CONFIGURAR` | ver y editar configuración, probar conexión, RUC de proveedores |

---

## 9. Aclaración para la sustentación

En este flujo **FlowDesk emite** el comprobante con su cuenta de Nubefact y pone a la institución como **cliente**. En la vida real, la factura de un proveedor la emite el **propio proveedor** desde su sistema, y la institución solo la **recibe y valida** (por ejemplo, consultando su validez en la SUNAT). Con una cuenta DEMO, esta es la forma de demostrar todo el circuito con la SUNAT: envío, CDR, rechazo y archivo.
