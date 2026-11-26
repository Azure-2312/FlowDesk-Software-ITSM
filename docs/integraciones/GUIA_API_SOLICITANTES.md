# API de Solicitantes de FlowDesk · Guía para el Equipo 10

FlowDesk ITSM comparte la lista de **usuarios registrados como Solicitantes** (personas que piden atención a la mesa de servicio). Solo se comparte en modo lectura y con los datos mínimos.

| Dato | Valor |
|---|---|
| URL base | `https://<dominio-de-flowdesk>.vercel.app` *(se entrega por privado al publicar)* |
| Formato | JSON (UTF-8) |
| Transporte | Solo HTTPS |
| Identificador común entre equipos | **correo** |

## 1. Cómo se autentica (sin enlaces directos ni claves fijas)

FlowDesk entrega a cada equipo una **credencial de cliente** por un canal privado. La credencial tiene dos partes:

- `client_id`, que empieza con `fdc_`.
- `client_secret`, que empieza con `fds_`. Se muestra una sola vez y FlowDesk solo guarda su huella HMAC-SHA256.

Esa credencial **no sirve para pedir datos**. Solo sirve para obtener un **token temporal de 15 minutos**, y con ese token se consultan los datos.

### Paso 1: pedir el token

```http
POST /api/v1/auth/token
Content-Type: application/json

{ "client_id": "fdc_xxxxxxxxxxxxxxxxxx", "client_secret": "fds_xxxxxxxx..." }
```

Respuesta `200`:

```json
{
  "access_token": "fdt_Qm9mT2xx...",
  "token_type": "Bearer",
  "expires_in": 900,
  "alcance": ["solicitantes:leer"]
}
```

*(También se acepta `Authorization: Basic base64(client_id:client_secret)`.)*

### Paso 2: consultar con el token

```http
GET /api/v1/solicitantes?pagina=1&por_pagina=50
Authorization: Bearer fdt_Qm9mT2xx...
```

Cuando el token vence (respuesta `401`), se pide otro con el paso 1.

## 2. Paginación y filtros

| Parámetro | Valores | Por defecto |
|---|---|---|
| `pagina` | entero ≥ 1 | 1 |
| `por_pagina` | 1 a 100 | 50 |
| `correo` | correo exacto, opcional (para cruzar con sus clientes) | — |

Para traer todo: se pide la `pagina=1` y luego se recorre hasta `total_paginas`.

## 3. Ejemplo real de respuesta

```json
{
  "sistema": "FlowDesk ITSM",
  "recurso": "solicitantes",
  "pagina": 1,
  "por_pagina": 50,
  "total": 2,
  "total_paginas": 1,
  "solicitantes": [
    {
      "id": 8,
      "nombres": "Lucía",
      "apellidos": "Ramírez Torres",
      "correo": "lucia.ramirez@empresa.pe",
      "telefono": "987654321",
      "dni_enmascarado": "****5678",
      "departamento": "Contabilidad",
      "fecha_registro": "2026-10-03T14:22:10.000Z"
    }
  ]
}
```

No se entregan contraseñas, el DNI completo, perfiles internos ni usuarios que no sean Solicitantes o que estén inactivos o bloqueados.

## 4. Códigos de respuesta

| Código | `error` | Significado |
|---|---|---|
| 200 | — | Correcto |
| 400 | `parametro_invalido` / `https_requerido` | Parámetro fuera de rango, o la conexión no es HTTPS |
| 401 | `no_autorizado` | Credencial o token inválido, vencido o revocado |
| 403 | `ip_no_permitida` / `permiso_insuficiente` | Origen no autorizado o recurso no permitido |
| 405 | `metodo_no_permitido` | Solo se permite `GET` (la API es de solo lectura) |
| 429 | `limite_excedido` / `bloqueo_temporal` | Más de N peticiones por minuto, o bloqueo por intentos fallidos. Ver el encabezado `Retry-After` |
| 503 | `servicio_no_disponible` | Servicio en mantenimiento |

Los errores son genéricos a propósito: no indican si falló el `client_id` o el secreto.

## 5. Medidas de seguridad

1. **Ningún enlace directo:** sin token vigente, la API no devuelve datos.
2. **Tokens temporales de 15 minutos:** se guardan hasheados, así que una filtración de la base de datos no permite usarlos.
3. **Secreto no recuperable:** se guarda con HMAC-SHA256 y una clave del servidor (*pepper*) que no está en la base de datos.
4. **Vigencia, revocación y rotación:** la credencial vence (de 7 a 180 días). El administrador puede revocarla o cambiar el secreto, y eso anula todos sus tokens al instante.
5. **IPs permitidas (opcional):** se puede restringir la credencial a las IPs de su servidor.
6. **Anti fuerza bruta:**
   - 5 intentos fallidos sobre un `client_id` lo bloquean 15 minutos.
   - 10 fallos desde una misma IP la bloquean 15 minutos.
7. **Límite por minuto:** cada credencial tiene su propio límite (60 peticiones por minuto por defecto).
8. **Solo lectura y datos mínimos:** `POST`, `PUT`, `PATCH` y `DELETE` responden `405`, y el DNI va enmascarado.
9. **Bitácora inmutable:** cada petición queda registrada (quién, cuándo, desde qué IP y con qué resultado). La base de datos impide modificar o borrar esos registros.
10. **HTTPS obligatorio, sin caché (`no-store`) y sin CORS:** la API se consume de servidor a servidor, nunca desde el navegador.

## 6. Prueba rápida con curl

```bash
TOKEN=$(curl -s -X POST https://<dominio>/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"client_id":"fdc_...","client_secret":"fds_..."}' | jq -r .access_token)

curl -s "https://<dominio>/api/v1/solicitantes?pagina=1&por_pagina=10" \
  -H "Authorization: Bearer $TOKEN"
```

`GET /api/v1/info` describe la API y `GET /api/v1/health` indica si el servicio está operativo. Ninguna de las dos devuelve datos personales.
