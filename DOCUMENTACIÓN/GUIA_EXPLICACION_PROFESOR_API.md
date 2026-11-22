# Guía de Explicación y Defensa Académica — API de Clientes y Usuarios

> **Destinado a:** El equipo de desarrollo de FlowDesk ITSM  
> **Objetivo:** Explicar con fundamentos de ingeniería y seguridad al profesor cómo se diseñó, construyó y protegió la API de Clientes para la integración entre grupos de trabajo.

---

## 1. ¿Qué se construyó y por qué?

En cumplimiento del requerimiento de interoperabilidad e integración de software:
* Se desarrolló una **API RESTful modular y desacoplada** para la gestión de clientes/trabajadores.
* Permite a un **grupo externo (otro grupo de estudiantes o sistema aliado)**:
  1. Consultar el padrón de clientes existentes (`GET /api/v1/clientes` o `/api/v1/usuarios`).
  2. Buscar trabajadores por DNI peruano (`GET /api/v1/usuarios/dni/:dni` o `/documento/:dni`).
  3. Registrar nuevos trabajadores directamente en nuestra base de datos corporativa (`POST /api/v1/clientes`).
  4. Actualizar información de trabajadores (`PUT /api/v1/clientes/:id`).
  5. Consultar la bitácora inmutable de trazabilidad con aislamiento por grupo (`GET /api/v1/trazabilidad`).

---

## 2. Argumentación de Seguridad: "Las claves no quedan sueltas en el código"

Si el profesor pregunta:  
> *"¿Dónde guardaron las contraseñas o API Keys? ¿Están escritas en el código?"*

### Tu Respuesta Técnica:
> *"No, profesor. Siguiendo las directrices de **OWASP API Security** y la norma **ISO/IEC 27001**, las claves nunca se almacenan en texto plano ni quedan expuestas en el código fuente ni en el HTML.*  
> 
> *Implementamos un esquema criptográfico de **API Keys con Hash HMAC-SHA256 y Salt corporativo secreto**:*  
> 1. *Cuando se le genera una clave al grupo externo (ej: `fdk_live_grupo_aliado...`), se le entrega una sola vez al representante del otro grupo.*  
> 2. *En nuestra base de datos (tabla `api_credenciales_externas`), únicamente guardamos el hash criptográfico SHA-256 (`api_key_hash`) junto a un prefijo de auditoría (`api_key_prefijo`).*  
> 3. *Si un atacante lograra descargar nuestra base de datos o revisar nuestro código en GitHub, **no podrá obtener las claves originales**, porque una función hash HMAC es estrictamente unidireccional.*  
> 4. *Cuando el otro grupo realiza una petición con el header `X-API-KEY`, nuestro middleware calcula en milisegundos el hash de la clave recibida y lo compara contra la base de datos de manera segura contra ataques de canal lateral (*Timing Attacks*) usando `crypto.timingSafeEqual()`."*

---

## 3. Las 7 Preguntas Clave del Profesor y sus Respuestas Técnicas

### 📦 1. ¿Qué datos carga?
* **Respuesta:** *"Consulta la tabla corporativa `usuario` oficial de FlowDesk, devolviendo el identificador, DNI, nombres, apellidos, correo electrónico, celular, departamento asignado y el perfil Solicitante."*
* **Código:** `src/modules/identidades/services/apiClientesService.ts` &rarr; `listarUsuarios()`.

### 📜 2. Trazabilidad del API (Bitácora Append-Only)
* **Respuesta:** *"Cada petición (exitosa o rechazada) se registra en la tabla `api_log_auditoria`. Para cumplir con estándares forenses, creamos un trigger nativo en PostgreSQL (`trg_proteger_log_auditoria`) que prohíbe terminantemente `UPDATE` y `DELETE`. La tabla es estrictamente Append-Only."*
* **Código:** `scripts/protect_audit_log.js` y `GET /api/v1/trazabilidad`.

### 🛡️ 3. Validar si ya existen (Evitar Duplicados)
* **Respuesta:** *"Validamos el formato formal de documentos peruanos (DNI de exactamente 8 dígitos) y correo RFC 5322. Si el DNI o correo ya existen en la base de datos, la API aborta inmediatamente devolviendo un código estándar `409 Conflict` con un mensaje descriptivo."*

### ⏱️ 4. ¿Cuántos intentos tiene? (Rate Limiting)
* **Respuesta:** *"Implementamos un middleware de límite de peticiones por ventana deslizante de 1 minuto (120 RPM para grupos externos). Se ejecuta **antes** de procesar claves para frenar ataques de fuerza bruta. Inyecta los encabezados estándar `X-RateLimit-Limit`, `X-RateLimit-Remaining` y `X-RateLimit-Reset`. Si se excede, devuelve `429 Too Many Requests`."*

### 🔄 5. Ver el Flujo que Tiene (Paso a Paso)
* **Respuesta:**  
  1. *Petición HTTP entrante con `X-API-KEY`.*  
  2. *Rate Limiter verifica cuota disponible de la IP/Credencial.*  
  3. *Autenticación HMAC-SHA256 valida hash y scopes (`clientes:read` / `clientes:write`).*  
  4. *Validación de dominio: DNI 8 dígitos, unicidad y sanitización de texto.*  
  5. *Persistencia segura en transacción: genera clave criptográfica aleatoria de 32 bytes con bcrypt y `debe_cambiar_clave = true`.*  
  6. *Auditoría inmutable: registra evento en `api_log_auditoria` y retorna respuesta JSON (`200` o `201`).*

### ⚡ 6. ¿Qué pasa si el API se cae o se cierra?
* **Respuesta:**  
  * *Si se detiene el servidor: El puerto deja de escuchar y el cliente recibe `ECONNREFUSED` a nivel de socket sin corrupción de transacciones.*  
  * *Si la base de datos pierde conectividad: El endpoint `/api/v1/health` responde inmediatamente `503 Service Unavailable` con estado `DEGRADADO`, distinguiendo caídas de BD de problemas de credenciales (`401`).*

### 🔒 7. Seguridad Criptográfica y Scopes
* **Respuesta:** *"Cualquier petición sin clave o con clave adulterada es bloqueada perimetralmente con `401 Unauthorized` y registrada en la bitácora forense como intento no autorizado."*

---

## 4. Demostración en Vivo en 1 Minuto ante el Profesor

1. **Abrir el Panel de Verificación en el Navegador:**  
   👉 `http://localhost:3000/panel`  
   *Mostrar las 7 tarjetas interactivas que responden exactamente a cada uno de sus puntos de evaluación.*
2. **Ejecutar la Suite Automatizada de Pruebas:**
   ```bash
   npm run test:api-clientes
   ```
   *Verificar que las 12 pruebas pasan con 100% de éxito.*
