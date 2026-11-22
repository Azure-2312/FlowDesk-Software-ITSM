# Manual de Integración — API de Clientes y Usuarios (FlowDesk ITSM) v2.0

> **Destinado a:** Equipos aliados, docentes evaluadores y desarrolladores externos.  
> **Versión de API:** 2.0.0 (Actualizada con Seguridad Reforzada) · **Formato:** RESTful JSON · **Protocolo:** HTTP/HTTPS  
> **Servidor Base:** `http://localhost:3000/api/v1`  
> **Panel Visual:** `http://localhost:3000/panel` (o `http://localhost:3000/api-clientes`)

---

## 1. Contexto del Negocio y Dominio

En **FlowDesk ITSM**, los **clientes** corresponden a los **trabajadores y colaboradores de la empresa cliente** (áreas de Finanzas, Recursos Humanos, Contabilidad, Operaciones, Ventas, etc.) que solicitan atención de soporte técnico, hardware o software a la mesa de ayuda.

Esta API RESTful permite a un sistema externo aliado:
1. **Consultar y listar** a los clientes/trabajadores registrados en la base de datos de FlowDesk.
2. **Buscar colaboradores por DNI** (8 dígitos) o por ID de usuario.
3. **Registrar nuevos clientes/trabajadores** directamente en la base de datos de FlowDesk, asignándoles automáticamente el perfil de *Solicitante* para que puedan emitir tickets de inmediato.
4. **Inspeccionar la bitácora inmutable de trazabilidad y auditoría forense** de todas las operaciones realizadas, con aislamiento de privacidad por grupo.

---

## 2. Seguridad y Autenticación Reforzada (ISO 27001 & OWASP API Security)

En esta nueva versión se han implementado 5 capas de protección criptográfica y arquitectónica:

1. **Almacenamiento de Claves Unidireccional:**
   * Las claves nunca se almacenan en texto plano.
   * Se utiliza un esquema criptográfico de **API Keys hasheadas con HMAC-SHA256 y Salt corporativo secreto**.
2. **Mitigación de Timing Attacks:**
   * La validación de credenciales utiliza buffers de tiempo constante mediante `crypto.timingSafeEqual()`, imposibilitando ataques de canal lateral (*timing attacks*).
3. **Generación Segura de Contraseñas (Sin Contraseñas Fijas):**
   * Al registrar un nuevo trabajador desde la API externa, el sistema genera una clave criptográfica aleatoria de 32 bytes (`crypto.randomBytes(32)`), la cifra con `bcrypt` y marca la bandera `debe_cambiar_clave = true`.
   * El usuario queda registrado en la base de datos pero no puede acceder a la interfaz web hasta que el administrador active su cuenta o restablezca su clave.
4. **Aislamiento y Privacidad en Trazabilidad:**
   * Los grupos externos únicamente pueden ver los logs forenses de sus propias peticiones (`ACTIVIDAD_PROPIO_GRUPO`), protegiendo direcciones IP y datos de otros clientes u organizaciones.
5. **Inmutabilidad Estricta a Nivel de Base de Datos (Append-Only):**
   * Un trigger nativo en PostgreSQL (`trg_proteger_log_auditoria`) intercepta cualquier intento de `UPDATE` o `DELETE` sobre la tabla `api_log_auditoria`, lanzando una excepción `VIOLACION_DE_INTEGRIDAD`.

### Credencial Asignada para el Grupo Aliado:
* **Encabezado HTTP:** `X-API-KEY` (o `Authorization: Bearer <token>`)
* **Token:** `fdk_live_grupo_aliado_2026_acceso_seguro_token`
* **Permisos asociados (Scopes):** `["clientes:read", "clientes:write"]`
* **Rate Limit:** 120 peticiones por minuto con encabezados estándar `X-RateLimit-Limit`, `X-RateLimit-Remaining` y `X-RateLimit-Reset`.

---

## 3. Endpoints Disponibles

> 💡 **Nota de Compatibilidad:** Puede llamar a las rutas usando `/api/v1/clientes` o `/api/v1/usuarios`. Ambos endpoints son alias simétricos y devuelven la misma estructura.

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/health` | Público | Estado de operatividad y latencia de conexión a PostgreSQL / Supabase |
| `GET` | `/api/v1/info` | Público | Especificación técnica, versión y listado de endpoints |
| `GET` | `/api/v1/clientes` | Privado (`X-API-KEY`) | Listado paginado de clientes/trabajadores con filtros de búsqueda |
| `GET` | `/api/v1/usuarios` | Privado (`X-API-KEY`) | Alias idéntico a `/api/v1/clientes` |
| `GET` | `/api/v1/clientes/:id` | Privado (`X-API-KEY`) | Detalle de un cliente/trabajador por su ID numérico |
| `GET` | `/api/v1/usuarios/dni/:dni` | Privado (`X-API-KEY`) | Búsqueda directa por DNI peruano (8 dígitos) |
| `POST` | `/api/v1/clientes` | Privado (`X-API-KEY`) | Registrar nuevo cliente/trabajador con perfil Solicitante |
| `POST` | `/api/v1/usuarios` | Privado (`X-API-KEY`) | Alias idéntico a `POST /api/v1/clientes` |
| `GET` | `/api/v1/trazabilidad` | Privado (`X-API-KEY`) | Bitácora de auditoría forense (`api_log_auditoria`) con alcance por grupo |

---

## 4. Ejemplos de Peticiones y Respuestas

### 4.1. Salud del Servicio (GET /api/v1/health)
```bash
curl -X GET "http://localhost:3000/api/v1/health"
```

### 4.2. Listar Clientes / Trabajadores (GET /api/v1/clientes)
```bash
curl -X GET "http://localhost:3000/api/v1/clientes?limite=5" \
     -H "X-API-KEY: fdk_live_grupo_aliado_2026_acceso_seguro_token"
```

### 4.3. Buscar por DNI (GET /api/v1/usuarios/dni/:dni)
```bash
curl -X GET "http://localhost:3000/api/v1/usuarios/dni/67675675" \
     -H "X-API-KEY: fdk_live_grupo_aliado_2026_acceso_seguro_token"
```

### 4.4. Registrar Nuevo Cliente / Trabajador (POST /api/v1/clientes)
```bash
curl -X POST "http://localhost:3000/api/v1/clientes" \
     -H "Content-Type: application/json" \
     -H "X-API-KEY: fdk_live_grupo_aliado_2026_acceso_seguro_token" \
     -d '{
       "dni": "72114488",
       "nombres": "Rosa Elena",
       "apellido_paterno": "Vargas",
       "apellido_materno": "Quispe",
       "correo_electronico": "rosa.vargas@empresa.com",
       "celular": "987654321",
       "departamento": "Recursos Humanos"
     }'
```
**Respuesta Exitosa (201 Created):**
```json
{
  "exito": true,
  "mensaje": "Trabajador/Cliente registrado exitosamente en la base de datos de FlowDesk ITSM",
  "cliente": {
    "id_usuario": 188,
    "dni": "72114488",
    "nombre_completo": "Rosa Elena Vargas Quispe",
    "correo_electronico": "rosa.vargas@empresa.com",
    "departamento_asignado": "Recursos Humanos",
    "perfil_asignado": "Solicitante (Trabajador de la Empresa)",
    "acceso_web": "Requiere activación de credenciales por el administrador",
    "registrado_por": "Grupo 2 - Sistema Aliado Externo",
    "fecha_creacion": "2026-11-21T18:25:00.000Z"
  }
}
```

### 4.5. Bitácora de Trazabilidad y Métricas (GET /api/v1/trazabilidad)
```bash
curl -X GET "http://localhost:3000/api/v1/trazabilidad?limite=10" \
     -H "X-API-KEY: fdk_live_grupo_aliado_2026_acceso_seguro_token"
```

---

## 5. Formas de Comprobación y Demostración

### Opción A — Desde el Navegador Web (Recomendado)
1. Abrir en cualquier navegador:  
   👉 `http://localhost:3000/panel` (o `http://localhost:3000/api-clientes`)
2. Probar interactivamente con los botones de prueba:
   * **Llave Aliada Válida** (`200 OK`)
   * **Clave Falsa / Inválida** (`401 Unauthorized`)
   * **Sin Clave** (`401 Unauthorized`)
   * **Registro con datos demo aleatorios** (`201 Created`)
   * **Bitácora forense en vivo** (`api_log_auditoria`)

### Opción B — Suite de Pruebas Automatizadas (12/12)
Ejecutar en la terminal:
```bash
npm run test:api-clientes
```
Verifica:
* ✅ Salud del servicio y latencia BD (`200 OK`)
* ✅ Endpoint descriptivo de especificación (`200 OK`)
* ✅ Bloqueo sin API Key (`401 Unauthorized`)
* ✅ Bloqueo con API Key falsa (`401 Unauthorized`)
* ✅ Presencia de encabezados estándar `X-RateLimit-*`
* ✅ Consulta de trabajadores en tabla `usuario` (`200 OK`)
* ✅ Compatibilidad de alias `/api/v1/clientes` (`200 OK`)
* ✅ Creación con clave aleatoria segura y `debe_cambiar_clave` (`201 Created`)
* ✅ Búsqueda por DNI del cliente creado (`200 OK`)
* ✅ Rechazo ante DNI duplicado (`409 Conflict`)
* ✅ Aislamiento de privacidad por grupo en trazabilidad (`200 OK`)
* ✅ Inmutabilidad estricta: trigger bloquea `DELETE`/`UPDATE` en `api_log_auditoria` con excepción `VIOLACION_DE_INTEGRIDAD`

### Opción C — Aplicación del Trigger de Inmutabilidad
```bash
npm run protect:audit-log
```
Aplica o verifica el trigger `trg_proteger_log_auditoria` en Supabase.
