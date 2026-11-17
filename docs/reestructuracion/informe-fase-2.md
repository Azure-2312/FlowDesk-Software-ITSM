# Informe de Ejecución — Fase 2: N2 Notificaciones solo dentro del sistema y Retiro de Canales Externos

**Fecha:** 17 de noviembre de 2026  
**Rama:** `reestructuracion-menu`  
**Commit:** `reestructuracion(F2): notificaciones in-app y retiro de canales externos`

---

## 1. Resumen Ejecutivo
Se ejecutó la Fase 2 del plan de reestructuración del menú, implementando la decisión arquitectónica y de producto **N2**: el sistema notifica **únicamente dentro de sí mismo**. Se erradicó al 100 % la dependencia de canales externos (correo SMTP, WhatsApp Business, SMS Gateway, Slack/Teams Webhooks) y de la infraestructura de recuperación de contraseñas por correo. Se construyó el modelo de base de datos relacional para notificaciones in-app, el servicio centralizado `notificar(...)`, el catálogo inmutable de los 15 eventos ITIL 4 con deep linking (`?abrir=<id>`), la campana con badge dinámico y polling reactivo en el layout, y la nueva pantalla institucional «Notificaciones» (`/plataforma/notificaciones`, #21265) concedida a todos los perfiles de la organización.

---

## 2. Tabla de Criterios de Aceptación y Resultados (Esperado vs. Real)

| # | Criterio de Aceptación | Esperado | Real | Estado |
|---|---|---|---|:---:|
| **E2.1** | Modelo y servicio de notificaciones | Tabla `notificaciones` con índices, columna `debe_cambiar_clave` en `usuario`, servicio centralizado `notificar(...)` | Creados en `db/migrations/20261117_notificaciones_in_app_n2.sql` y `src/shared/lib/notificacionesService.ts`. Columnas e índices verificados. | **CONFORME** |
| **E2.2** | Catálogo fijo de eventos (15) | Los 15 eventos ITIL v4 emiten filas válidas en BD con textos constantes y URLs canónicas del Anexo B | Implementado en `src/shared/lib/eventos-notificacion.ts`. Test unitario `scripts/test_notificaciones_n2.js` emitió y verificó los 15 eventos con éxito. | **CONFORME** |
| **E2.3** | Componentes de interfaz (Campana y Pantalla) | Campana con badge no leídas en cabecera (polling 35s, pausado en pestaña oculta) + pantalla `/plataforma/notificaciones` | Creados `<CampanaNotificaciones />` (integrado en `layout.tsx`) y `VistaNotificacionesInApp.tsx` en `/plataforma/notificaciones/page.tsx` con soporte `?abrir=<id>`. | **CONFORME** |
| **E2.4** | Grep canales externos en `src`, `package.json`, `.env.example` | `grep -rniE "nodemailer\|smtp\|sendgrid\|mailgun\|twilio\|whatsapp\|webhook" src package.json .env.example` → **0 resultados** | **0 resultados** (código de salida 1 sin líneas devueltas). Dependencia `nodemailer` y `@types/nodemailer` desinstaladas y depuradas de `package.json` y `package-lock.json`. | **CONFORME** |
| **E2.5** | Grep selectores de canal | `grep -rn "NOTIFICACION_CANAL\|canal.*email" src` → **0 resultados** | **0 resultados** (código de salida 1 sin líneas devueltas). Selectores removidos de formularios y comités. | **CONFORME** |
| **E2.6** | Independencia de flujos de correo | Ningún flujo (crear usuario, resolver ticket, aprobar) depende de enviar correo. Restablecimiento con contraseña temporal una sola vez + `debe_cambiar_clave`. | En creación y edición de usuarios se genera clave temporal en pantalla (N6), sin envíos externos. Recuperación de contraseña externa en Login sustituida por modal informativo de solicitud a soporte. | **CONFORME** |
| **E2.7** | Modificaciones en menú de base de datos | 3 filas eliminadas (#21212, #21214, #21227) y 1 fila nueva (#21265 «Notificaciones») creada y concedida a los 10 perfiles | Fila #21265 creada (`/plataforma/notificaciones`), padre #21001, orden 5. Concedida en `opciones_menu_perfiles` a los 10 perfiles. Filas #21212, #21214, #21227 eliminadas en migración DDL. | **CONFORME** |
| **E2.8** | Compilación y tests verdes | `tsc --noEmit` y `npm run build` sin errores | `tsc --noEmit` exitoso (0 errores). `npm run build` generó las 265 páginas estáticas y dinámicas de Next.js limpiamente. `scripts/test_notificaciones_n2.js` 100 % aprobado. | **CONFORME** |
| **E2.9** | Documentación de la fase | `docs/reestructuracion/informe-fase-2.md` | Presente documento. | **CONFORME** |

---

## 3. Inventario de Modificaciones Físicas

### 3.1 Archivos Creados
1. `db/migrations/20261117_notificaciones_in_app_n2.sql`: DDL de tabla `notificaciones`, índices, alter a `usuario` (`debe_cambiar_clave`), alta de opción #21265 y eliminación de #21212, #21214, #21227.
2. `src/shared/lib/eventos-notificacion.ts`: Catálogo canónico inmutable de los 15 eventos ITIL v4 y formateadores de mensajes y URLs.
3. `src/shared/lib/notificacionesService.ts`: Servicio único para inserción, consulta paginada, conteo y lectura de notificaciones in-app.
4. `src/app/api/notificaciones/route.ts`: Endpoint GET (listado paginado / filtros) y PUT (marcar todas como leídas).
5. `src/app/api/notificaciones/[id]/leer/route.ts`: Endpoint PUT (marcar notificación individual como leída).
6. `src/app/api/notificaciones/contador/route.ts`: Endpoint GET liviano para polling de la campana.
7. `src/shared/components/layout/CampanaNotificaciones.tsx`: Componente React de campana con contador, desplegable de últimas 10 y enlace a pantalla completa.
8. `src/modules/plataforma/views/VistaNotificacionesInApp.tsx`: Vista de página completa de notificaciones con pestañas (Todas / Sin leer), paginación y navegación profunda.
9. `src/app/plataforma/notificaciones/page.tsx`: RSC de la ruta `/plataforma/notificaciones` protegido con `exigirMenuPagina("/plataforma/notificaciones")`.
10. `scripts/test_notificaciones_n2.js`: Script de verificación automatizado para Fase 2.

### 3.2 Archivos Eliminados (Físicamente de Git y Disco)
1. `src/shared/lib/email.ts` (cliente Nodemailer)
2. `src/modules/seguridad/recuperacionClaveService.ts`
3. `src/modules/seguridad/api/recuperarClaveSolicitarController.ts`
4. `src/modules/seguridad/api/recuperarClaveVerificarController.ts`
5. `src/modules/seguridad/api/recuperarClaveCambiarController.ts`
6. `src/modules/seguridad/preferenciasNotificacionService.ts`
7. `src/modules/seguridad/api/preferenciasNotificacionController.ts`
8. `src/modules/plataforma/config/notificaciones/VistaNotificaciones.tsx`
9. `src/modules/plataforma/api/config/saludSistemaCorreoController.ts`
10. `src/modules/identidades/services/enviarCredencialesService.ts`
11. `src/modules/identidades/api/enviarCredencialesController.ts`
12. `src/modules/cambios/config/notificaciones-calendario/components/PestanaNotificaciones.tsx`
13. `src/modules/cambios/config/notificaciones-calendario/components/PestanaPresentacionCalendario.tsx`
14. `src/app/plataforma/operacion/notificaciones/contacto/page.tsx`
15. `src/app/plataforma/operacion/notificaciones/plantillas/page.tsx`
16. `src/app/plataforma/operacion/notificaciones/page.tsx`
17. `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`
18. `src/app/api/mi-cuenta/notificaciones/route.ts`
19. `src/app/api/auth/recuperar-clave/solicitar/route.ts`
20. `src/app/api/auth/recuperar-clave/verificar/route.ts`
21. `src/app/api/auth/recuperar-clave/cambiar/route.ts`
22. `src/app/api/operacion/salud-sistema/correo/route.ts`
23. `src/app/api/usuarios/enviar-credenciales/route.ts`

### 3.3 Archivos Modificados
- `package.json` y `package-lock.json`: Eliminadas dependencias `nodemailer` y `@types/nodemailer`.
- `.env.example`: Eliminadas variables `GMAIL_USER` y `GMAIL_APP_PASSWORD`.
- `src/app/plataforma/layout.tsx`: Incorporada `<CampanaNotificaciones />` en el encabezado.
- `src/modules/seguridad/views/VistaLogin.tsx`: Eliminados flujos y pantallas de recuperación de contraseña por correo OTP; reemplazados por modal informativo institucional.
- `src/modules/seguridad/index.ts`: Retiradas exportaciones de funciones de recuperación de contraseña.
- `src/modules/identidades/config/usuarios/VistaUsuarios.tsx`: Eliminado botón y lógica de envío de credenciales por correo; implementada visualización única de contraseña temporal con cambio obligatorio (N6).
- `src/modules/identidades/services/usuarioService.ts`: Al insertar usuarios se establece `debe_cambiar_clave = true`.
- `src/modules/identidades/services/usuarioDetalleService.ts`: Al actualizar contraseñas se marca `debe_cambiar_clave = true`.
- `src/modules/identidades/index.ts`: Retirada exportación de `enviarCredenciales`.
- `src/modules/cambios/config/flujo-evaluacion/components/PestanaComites.tsx`: Eliminada opción `sms_whatsapp`.
- `src/modules/cambios/gestion/crear/VistaCambiosGestionCrear.tsx`: Reemplazada etiqueta de WhatsApp por mensajería institucional.
- `src/modules/cambios/config/notificaciones-calendario/VistaNotificacionesCalendario.tsx`: Eliminadas pestañas de notificaciones y presentación calendario.
- `src/modules/plataforma/config/salud/VistaSaludSistema.tsx`: Retirada sección y tarjeta de cola de correo / SMTP.
- `src/modules/plataforma/services/saludSistemaService.ts`: Eliminadas funciones de consulta y reintento de cola de correo.
- `src/modules/activos/config/licencias-contratos/components/PestanaAlertasVencimiento.tsx`: Retirado modal de prueba de alerta por correo electrónico.

---

## 4. Conclusión
La Fase 2 queda completada al 100 % sin advertencias ni regresiones, cumpliendo estrictamente con el producto libre de canales externos (N2), política de credenciales temporales (N6), sin shim o archivos puente (R4) y validación integral de compilación y pruebas (R8).
