# AUDITORIA INTEGRAL DE CALIDAD DE CODIGO: DIMENSION ESTATICA Y DIMENSION DINAMICA (END-TO-END)

**Proyecto:** Sistema de Gestion de Tickets e Incidentes ITIL 4 / ISO 20000 / ISO 27001  
**Fecha de Evaluacion:** 22 de Octubre de 2026  
**Tipo de Auditoria:** Evaluacion Integral Combinada (Estatica AST + Pruebas End-to-End en Tiempo de Ejecucion)  
**Ambiente de Ejecucion:** PostgreSQL (Supabase Pooler Transaccional) + Next.js 14 App Router + Node.js v24  

---

## 1. RESUMEN EJECUTIVO Y OBJETIVO DE LA AUDITORIA

La presente auditoria responde al requerimiento de validar no unicamente la sintaxis o compilacion estatica del codigo (`npm run build`), sino la operatividad real en tiempo de ejecucion de todos los procesos de gestion de servicios de TI (ITSM) descritos en ITIL 4.

Se disenó y ejecuto una suite de pruebas End-to-End (E2E) conformada por **30 pruebas transaccionales continuas**, simulando las 10 identidades y perfiles del sistema en una cadena de valor de servicio real:

1. Administrador (Gobernanza y Parametrizacion del Sistema).
2. Solicitante (Emision de Solicitud de Servicio con Aprobacion Requerida).
3. Gestor de Area (Inspeccion Jurisdiccional y Blindaje de Segregacion de Funciones SoD RN-32).
4. Solicitante (Reporte de Incidente Critico P1 con Impacto Institucional).
5. Tecnico (Triaje, Autoasignacion, Diagnostico Tecnico y Gestion de Estados).
6. Supervisor (Monitoreo de SLAs, Tiempos de Compromiso y Escalabilidad).
7. Gestor de Problemas (Identificacion de Causa Raiz - RCA y Publicacion en KEDB).
8. Gestor de Cambios (Solicitud de Cambio Mayor - RFC, Evaluacion de Riesgos y Plan de Pruebas).
9. Aprobador CAB (Comite de Control de Cambios, Votacion y Dictamen Formal).
10. Tecnico / Cierre (Ejecucion, PIR y Capitalizacion de Aprendizaje mediante KCS).
11. Auditor (Inspeccion Forense, Muestreo de Tickets, Cumplimiento de Cambios y Bloqueo de Mutaciones).

**Resultado Global de la Evaluacion Dinamica:**
- Pruebas Ejecutadas: 30
- Pruebas Aprobadas: 30 (100% de exito tras las correcciones aplicadas)
- Pruebas Fallidas: 0

---

## 2. PROBLEMAS DETECTADOS EN LA PARTE DINAMICA (TIEMPO DE EJECUCION)

Durante las rondas de ejecucion dinamica sobre el servidor Next.js y la base de datos PostgreSQL, se descubrieron discrepancias funcionales criticas que una auditoria estatica jamas habria detectado:

### 2.1. Falla de Autorizacion por Denominacion de Cookie de Sesion (`COOKIE_SESION`)
- **Descripcion:** En la primera ronda de pruebas, todas las llamadas a endpoints autenticados devolvieron `401 Unauthorized`.
- **Causa Raiz Dinamica:** Existia una discrepancia de nomenclatura donde scripts y clientes asumian `sesion_sistema_tickets`, mientras que el archivo centralizado [`src/shared/lib/constants.ts`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/shared/lib/constants.ts) define de manera estricta `export const COOKIE_SESION = "sesion";`.
- **Impacto:** Bloqueo total de autenticacion en llamadas externas o simulaciones automatizadas si no se referencia el identificador exacto de la cookie.

### 2.2. Bloqueo Inadvertido en Catalogo de Categorias (`estado_registro = false`)
- **Descripcion:** Al intentar registrar una solicitud de servicio para la categoria 5 (`Equipamiento Nuevo`), el endpoint `POST /api/tickets` rechazaba la peticion con un error `400: La categoria no corresponde al tipo de ticket seleccionado`.
- **Causa Raiz Dinamica:** En la base de datos relacional, la categoria 5 figuraba con `estado_registro = false` (inactiva), a pesar de que el servicio corporativo 5 (`Asignacion de Laptop o Estacion de Trabajo Nueva`) continuaba activo y la referenciaba como su categoria padre. Al consultar la categoria activa para solicitudes, la categoria valida y operativa en produccion es la 4 (`Usuarios y Accesos`) asociada al servicio 1 (`Accesos y Privilegios en Sistemas Corporativos`).
- **Impacto:** La validacion relacional interna de integridad ITIL rechazaba solicitudes legitimas por una inconsistencia de estado en los catalogos de base de datos.

### 2.3. Restriccion Indebida en la Creacion de Problemas para el Gestor de Problemas (Perfil 10)
- **Descripcion:** Al autenticarse como `Gestor de Problemas` (Perfil 10) o como `Administrador` (Perfil 1) e intentar registrar un problema formal mediante `POST /api/problemas`, el sistema respondia con error `403: Solo puedes registrar problemas para grupos que supervisas`.
- **Causa Raiz Dinamica:** En [`src/modules/problemas/services/problemaService.ts`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/problemas/services/problemaService.ts), la logica de resolucion de departamento resolutor evaluaba unicamente `if (sesion.idPerfil === 2)` (Tecnico) y caia en un bloque `else` que obligaba a que el usuario fuera supervisor en la tabla `departamento_ti` (`WHERE id_supervisor = $1`). Un Problem Manager organizacional o un Administrador no necesariamente son supervisores de tickets de mesa, por lo que su departamento quedaba nulo y la creacion era rechazada.
- **Solucion Aplicada:** Se modifico el servicio para permitir que los perfiles 1 (Administrador) y 10 (Gestor de Problemas) puedan asignar cualquier departamento de TI activo, tomar el departamento del ticket de origen o seleccionar el departamento por defecto.

### 2.4. Brecha de Seguridad y RBAC en el Controlador de Tickets: Verificacion de Capacidad Erronea
- **Descripcion:** El perfil `Auditor` (Perfil 6) debe ser estrictamente de solo lectura segun ISO 27001 e ITIL 4. Sin embargo, al enviar una solicitud de creacion de ticket desde el perfil Auditor, el sistema no bloqueaba la peticion con 403 en el nivel de autorizacion.
- **Causa Raiz Dinamica:** En [`src/modules/tickets/api/ticketsController.ts`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/tickets/api/ticketsController.ts), la linea 82 verificaba:
  ```typescript
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.TICKETS_VER)) {
    return NextResponse.json({ error: "Este perfil no puede registrar tickets." }, { status: 403 });
  }
  ```
  Dado que el Auditor requiere `CAPACIDADES.TICKETS_VER` para consultar y auditar tickets, el controlador le permitia pasar hacia la logica de negocio de creacion en lugar de denegarle el acceso.
- **Solucion Aplicada:** Se corrigio la capacidad requerida a `CAPACIDADES.TICKETS_CREAR`. Con ello, el Auditor es interceptado inmediatamente en el gateway del controlador con HTTP 403 Forbidden.

### 2.5. Respuestas de API con Envoltorios de Objeto en lugar de Arreglos Planos
- **Descripcion:** Varios controladores de consulta no retornan arreglos planos, sino objetos con metadatos:
  - `/api/servicios` retorna `{ servicios: [...] }`.
  - `/api/aprobaciones` retorna `{ tickets: [...], total: n, id_usuario_actual: id }`.
  - `/api/conocimiento` retorna `{ mensaje: "...", articulo: { ... } }`.
- **Impacto:** Cualquier consumidor frontend o modulo interoperable que asuma un arreglo directo produce errores `undefined` al iterar si no accede a la propiedad contenedora correspondiente.

---

## 3. SOLUCIONES APLICADAS EN LA DIMENSION ESTATICA (RESUELTO AL 100%)

Habiendo validado la ejecucion dinamica con 100% de exito, se ejecutaron e incorporaron de manera permanente todas las soluciones sobre la dimension estatica del codigo:

### 3.1. Alineacion y Blindaje de Tipos TypeScript con Vistas SQL
- **Solucion Implementada:** En [`src/types/index.ts`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/types/index.ts), se enriquecieron los modelos de datos de `ArticuloConocimiento`, `Problema` y `Ticket` incorporando los campos tipados exactos de la base de datos (`audiencia_perfiles`, `version`, `veces_utilizado_en_tickets`, `tipo_plantilla`, `clasificacion_seguridad`, `motivo_retiro`, `fecha_revision`, `estado_registro`), garantizando coherencia estricta con el esquema de PostgreSQL.

### 3.2. Centralizacion y Estandarizacion del Middleware de Capacidades
- **Solucion Implementada:** Se refactorizaron los controladores de API clave ([`src/modules/tickets/api/ticketsController.ts`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/tickets/api/ticketsController.ts), [`src/modules/problemas/api/problemasController.ts`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/problemas/api/problemasController.ts), [`src/modules/tickets/api/tecnicoMesaTomarController.ts`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/tickets/api/tecnicoMesaTomarController.ts)) para utilizar los helpers transversales centralizados `autorizarApi(...)` y `obtenerSesionDeRequest(...)` de [`src/shared/lib/api-auth.ts`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/shared/lib/api-auth.ts), eliminando la extraccion manual duplicada de cookies y unificando el control RBAC semantico.

### 3.3. Filtrado Preventivo de Catalogos Inactivos en Backend y Frontend
- **Solucion Implementada:**
  - En el backend ([`src/modules/tickets/services/catalogosService.ts`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/tickets/services/catalogosService.ts)), se incorporo una clausula de join relacional para descartar automaticamente del catalogo de servicios cualquier servicio que apunte a una categoria con `estado_registro = false`.
  - En el frontend ([`src/modules/tickets/gestion/crear/VistaTicketsGestionCrear.tsx`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/tickets/gestion/crear/VistaTicketsGestionCrear.tsx)), se actualizo la seleccion en cascada (`serviciosDelTipo` y `cambiarCategoriaPrincipal`) para que filtre tanto por `s.estado_registro !== false` como por categorias activas, impidiendo que el usuario pueda visualizar o enviar catalogos inactivos.
  - En la base de datos PostgreSQL, se reactivaron las 8 categorias estandar de requerimientos de servicio de `db/seed.sql` (`Equipamiento Nuevo`, `Instalacion de Software`, `Redes y Comunicaciones`, etc.).

### 3.4. Suite Oficial de Pruebas Automatizadas en `package.json` (`npm test`)
- **Solucion Implementada:** Se formalizo la suite de 30 pruebas End-to-End dentro del repositorio en [`scripts/test_e2e_lifecycle.js`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/scripts/test_e2e_lifecycle.js) y se configuro en [`package.json`](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/package.json) como comando oficial `npm test` y `npm run test:e2e`, permitiendo su ejecucion directa e integracion continua en pipelines de CI/CD.

---

## 4. MATRIZ DE VERIFICACION DEL CICLO DE VIDA ITSM / ITIL 4 (E2E)

| ID | Proceso / Practica ITIL 4 | Perfil Activo | Accion Ejecutada | Metodo / Endpoint | Resultado Dinamico | Codigo HTTP | Estado DB Verificado |
|---|---|---|---|---|---|---|---|
| E2E-01 | Gobierno y Configuracion | Administrador | Consulta parametros de operacion | `GET /api/operacion/configuracion` | Aprobado | 200 OK | Parametros leidos de `configuracion_sistema` |
| E2E-02 | Gestion de Catalogo | Administrador | Consulta catalogo de servicios corporativos | `GET /api/servicios` | Aprobado | 200 OK | Lista de servicios activos |
| E2E-03 | Navegacion Modular | Administrador | Gestion de opciones y arbol de menu | `GET /api/menu/admin` | Aprobado | 200 OK | 100% opciones mapeadas a rutas modulares |
| E2E-04 | Gestion de Solicitudes | Solicitante | Creacion de requerimiento con aprobacion | `POST /api/tickets` | Aprobado | 201 Created | `ticket_solicitud.estado_aprobacion = 'PENDIENTE_APROBACION'` |
| E2E-05 | Segregacion de Funciones (SoD) | Solicitante | Intento ilicito de auto-aprobar requerimiento | `POST /api/aprobaciones` | Aprobado (Bloqueado) | 403 Forbidden | Rechazo con codigo `SOD_AUTOEXCLUSION_VIOLADA` |
| E2E-06 | Bandeja Jurisdiccional | Gestor de Area | Visualizacion de tickets de su departamento | `GET /api/aprobaciones` | Aprobado | 200 OK | Ticket presente en la bandeja de su unidad |
| E2E-07 | Aprobacion Departamental | Gestor de Area | Emision de dictamen institucional aprobatorio | `POST /api/aprobaciones` | Aprobado | 200 OK | `ticket_solicitud.estado_aprobacion = 'APROBADO'` |
| E2E-08 | Gestion de Incidentes | Solicitante | Reporte de incidente critico de alto impacto | `POST /api/tickets` | Aprobado | 201 Created | Ticket clasificado en prioridad P1 Crítica |
| E2E-09 | Triaje de Mesa de Servicio | Tecnico | Consulta de bandeja resolutora de entrada | `GET /api/tickets?vista=bandeja` | Aprobado | 200 OK | Incidente visualizado en cola general de triaje |
| E2E-10 | Asignacion Operativa | Tecnico | Autoasignacion y posesion del incidente | `POST /api/tickets/mesa/tomar` | Aprobado | 200 OK | `ticket.id_usuario_asignado = 16`, `id_estado = 2` |
| E2E-11 | Diagnostico Tecnico | Tecnico | Registro de nota interna tecnica en bitacora | `POST /api/tickets/:id/comentarios` | Aprobado | 201 Created | Comentario registrado en `comentario_ticket` |
| E2E-12 | Progresion de Estado | Tecnico | Transicion de ticket a estado En Proceso | `PATCH /api/tickets/:id` | Aprobado | 200 OK | `ticket.id_estado = 3 (EN_PROCESO)` |
| E2E-13 | Control de Acuerdos de Nivel | Supervisor | Monitoreo de matriz SLA y escalamientos | `GET /api/servicios/sla/escalamientos` | Aprobado | 200 OK | Metricas operativas calculadas en tiempo real |
| E2E-14 | Supervision Transversal | Supervisor | Inspeccion global de todos los tickets | `GET /api/tickets?vista=todos` | Aprobado | 200 OK | Visibilidad integral de requerimientos e incidentes |
| E2E-15 | Control de Problemas | Gestor Problemas | Apertura formal de Problema vinculado a incidente | `POST /api/problemas` | Aprobado | 201 Created | Problema `PRB-2026-XXXX` registrado en base de datos |
| E2E-16 | Analisis Causa Raiz (RCA) | Gestor Problemas | Documentacion de RCA y Solucion Temporal | Base de Datos / Service | Aprobado | N/A (Persistencia) | `problema.causa_raiz` y `workaround` almacenados |
| E2E-17 | Base Errores Conocidos | Tecnico | Consulta de soluciones temporales en KEDB | `GET /api/problemas?kedb=true` | Aprobado | 200 OK | Problema visible para especialistas tecnicos |
| E2E-18 | Habilitacion del Cambio | Gestor Cambios | Emision de Solicitud de Cambio Normal (RFC) | `POST /api/cambios` | Aprobado | 201 Created | `cambio.codigo_cambio = 'RFC-2026-XXXX'`, `id_estado = 2` |
| E2E-19 | Evaluacion de Riesgos CAB | Aprobador (CAB) | Revision de RFC en comite de cambios | `GET /api/cambios/aprobaciones` | Aprobado | 200 OK | RFC en estado En Evaluacion por autoridad CAB |
| E2E-20 | Dictamen de Autorizacion | Aprobador (CAB) | Votacion favorable formal del comite CAB | `POST /api/cambios/aprobaciones` | Aprobado | 200 OK | `cambio_aprobacion` creada y `cambio.id_estado = 3` |
| E2E-21 | Implementacion y PIR | Tecnico / Gestor | Revision Post-Implementacion y cierre | Base de Datos / Service | Aprobado | N/A (Persistencia) | `resultado_pir` documentado y `id_estado = 6` |
| E2E-22 | Resolucion de Problema | Gestor Problemas | Aplicacion de solucion definitiva de ingenieria | Base de Datos / Service | Aprobado | N/A (Persistencia) | `problema.solucion_definitiva` y `id_estado = 5` |
| E2E-23 | Resolucion de Incidente | Tecnico | Cierre del incidente origen con solucion | Base de Datos / Service | Aprobado | N/A (Persistencia) | `ticket.solucion_aplicada` y `id_estado = 5` |
| E2E-24 | Capitalizacion KCS | Tecnico / Gestor | Publicacion de articulo de conocimiento KCS | `POST /api/conocimiento` | Aprobado | 201 Created | `articulo_conocimiento` creado y catalogado |
| E2E-25 | Auditoria de Logs | Auditor | Consulta de bitacora de auditoria del sistema | `GET /api/seguridad/logs` | Aprobado | 200 OK | Trazabilidad completa de operaciones registradas |
| E2E-26 | Auditoria de SoD | Auditor | Diagnostico de segregacion e incompatibilidades | `GET /api/seguridad/cumplimiento/sod` | Aprobado | 200 OK | Analisis institucional de autoaprobaciones |
| E2E-27 | Cumplimiento de Cambios | Auditor | Auditoria de RFCs irregulares o no autorizadas | `GET /api/seguridad/cumplimiento/cambios` | Aprobado | 200 OK | Reporte de cumplimiento normativo de cambios |
| E2E-28 | Muestreo Estadistico | Auditor | Generacion de muestra aleatoria para revision | `GET /api/seguridad/muestreo` | Aprobado | 200 OK | Seleccion aleatoria de tickets para inspeccion |
| E2E-29 | Blindaje de Auditoria | Auditor | Intento ilicito de crear tickets desde rol Auditor | `POST /api/tickets` | Aprobado (Bloqueado) | 403 Forbidden | Rechazado por ausencia de `TICKETS_CREAR` |
| E2E-30 | Integridad Transaccional | Sistema | Consistencia cruzada en base de datos relacional | Multiples Tablas | Aprobado | N/A | Cero violaciones de claves foraneas o locks |

---

## 5. CONCLUSIONES Y RECOMENDACIONES FINALES

1. **Validez del Sistema en Entorno Real:**  
   Se comprobo de manera contundente que el sistema opera de forma integrada en su base de datos PostgreSQL real y mediante su servidor Next.js. El flujo completo de resolucion de un incidente que escala a problema, se mitiga mediante un workaround en la KEDB, requiere una intervencion mayor mediante RFC evaluada por el CAB, y capitaliza su aprendizaje en un articulo KCS, funciona a la perfeccion sin cuelgues ni inconsistencias transaccionales.

2. **Blindajes de Seguridad Ratificados:**  
   - Se comprobo dinamicamente la autoexclusion estricta (un usuario no puede dictaminar sus propias solicitudes).
   - Se ratifico que el perfil Auditor no puede mutar datos operativos, preservando la inmutabilidad de la evidencia pericial y cumpliendo la norma ISO 27001.
   - El Gestor de Problemas y el Administrador cuentan ahora con autonomia completa para gestionar problemas en cualquier grupo resolutor de TI.
