# Arquitectura y Código — FlowDesk ITSM

**Proyecto:** FlowDesk ITSM — Sistema de Gestión de Tickets y Servicios de TI  
**Versión:** 2.0 (Documento Canónico de Arquitectura Integral)  
**Fecha de Corte:** 2026-10-24  
**Ámbito:** Arquitectura modular, contratos de servidor/cliente, desglose de carpetas y archivos, rutas, seguridad RBAC, modelo relacional C, persistencia, patrones de desarrollo, quality gates y despliegue.  
**Alineación Normativa:** ITIL 4, ISO/IEC 20000-1:2018, ISO/IEC 27001:2022, ISO/IEC 19770-1 y COBIT 2019.

> **Propósito para Desarrolladores y Modelos de IA:**  
> Este documento constituye la especificación canónica y exhaustiva de la arquitectura del software FlowDesk ITSM. Cualquier asistente de Inteligencia Artificial o ingeniero de software que lea este archivo obtendrá una comprensión completa, profunda y exacta de la jerarquía de directorios, la responsabilidad de cada archivo, los contratos de comunicación entre módulos, los mecanismos de seguridad perimetral y el modelo de persistencia relacional, erradicando suposiciones o ambigüedades.

---

## 1. Principios Fundamentales de Arquitectura

FlowDesk ITSM se estructura bajo una arquitectura **Vertical Slice por Dominio**, diseñada para permitir que cinco desarrolladores colaboren en paralelo sin colisiones en Git, con fronteras de aislamiento estricto y desacoplamiento de dependencias.

```text
                            Capa de Enrutamiento y Presentación
                         ┌────────────────────────────────────────┐
                         │   src/app/ (Cascarones Delgados)       │
                         │   page.tsx  layout.tsx  route.ts       │
                         └───────────────────┬────────────────────┘
                                             │  Consume contratos
                                             ▼
                         Capa de Lógica de Negocio y Dominio
                         ┌────────────────────────────────────────┐
                         │   src/modules/<modulo>/                │
                         │   ├── index.ts (Contrato de Servidor)  │
                         │   ├── ui.ts    (Contrato de Cliente)   │
                         │   ├── services/  api/  views/  config/ │
                         └───────────────────┬────────────────────┘
                                             │  Consume infraestructura
                                             ▼
                         Capa Transversal (Hoja Estricta)
                         ┌────────────────────────────────────────┐
                         │   src/shared/                          │
                         │   ├── lib/ (db, auth, api-auth, menu)  │
                         │   ├── components/  types/              │
                         └────────────────────────────────────────┘
```

### 1.1. Principio de Vertical Slice (Rebanadas Verticales por Dominio)
A diferencia de las arquitecturas por capas horizontales tradicionales (donde todos los controladores están en una carpeta `controllers/`, los servicios en `services/` y las vistas en `views/`), FlowDesk agrupa todos los elementos de un proceso en su propio módulo bajo `src/modules/<modulo>/`.
- Cada módulo contiene sus propios controladores de API (`api/`), servicios de dominio con consultas SQL (`services/`), pantallas operativas (`views/`), componentes reutilizables internos (`components/`) y configuraciones administrativas (`config/`).
- **Ventaja:** Cualquier cambio o nueva funcionalidad relacionada con la Gestión de Cambios, por ejemplo, se desarrolla exclusivamente dentro de `src/modules/cambios/`, evitando tocar código de otros compañeros.

### 1.2. Principio de Cascarones Delgados (`src/app/` es Delgado)
El directorio `src/app/` utiliza el App Router de Next.js 14, pero sus archivos actúan exclusivamente como **cascarones delgados de conexión**:
- `page.tsx`: No contiene lógica de negocio ni SQL. Solo valida la sesión/permisos invocando una guarda transversal (`exigirMenuPagina` o `exigirCapacidadPagina`) y renderiza la vista exportada por el módulo correspondiente.
- `route.ts`: Declara `export const dynamic = 'force-dynamic'` y `export const revalidate = 0`, y reexporta directamente las funciones `GET`, `POST`, `PUT`, `DELETE` del controlador HTTP del módulo correspondiente.
- `layout.tsx`: Define la composición visual, inyección de metadatos y el montaje del Sidebar/Navbar global.

### 1.3. Principio de Contratos Públicos Estrictos (`index.ts` y `ui.ts`)
Cada módulo encapsula su implementación interna y expone únicamente una interfaz pública:
1. `index.ts` (Contrato de Servidor): Reexporta servicios de dominio, tipos TypeScript, esquemas de validación Zod y controladores HTTP. Es el único punto de entrada autorizado para importar lógica de negocio desde otros módulos.
2. `ui.ts` (Contrato de Cliente): Reexporta componentes de interfaz de usuario diseñados para ser consumidos por otros frentes. **Regla de oro:** `ui.ts` jamás importa conexiones a base de datos, controladores de backend ni librerías de servidor.

> **Regla de Importación Prohibida:**  
> Queda terminantemente prohibido realizar importaciones profundas hacia subcarpetas internas de otro módulo (ej. `import { x } from "@/modules/tickets/services/ticketService"` es ILEGAL). La importación autorizada debe ser siempre hacia la raíz del contrato: `import { x } from "@/modules/tickets"` o `import { TablaTickets } from "@/modules/tickets/ui"`.

### 1.4. Principio de Hoja Transversal (`src/shared/` es Hoja)
La carpeta `src/shared/` proporciona infraestructura técnica común (pool de base de datos, utilidades criptográficas JWT, guardas de autorización, parseador del menú, tipos globales y componentes UI transversales).
- **Regla Inversa Innegociable:** `src/shared/` es un nodo hoja en el grafo de dependencias. **JAMÁS importa nada desde `src/modules/*` ni desde `src/app/*`**. Esto previene bucles de dependencia cíclica y acoplamientos espurios.

---

## 2. Inventario Exhaustivo y Jerarquía de Carpetas

A continuación se detalla la función, orden y contenido de cada directorio de la raíz del proyecto:

```text
SISTEMA DE TICKETS/
├── src/                          # Código fuente de la aplicación
│   ├── app/                      # Enrutador App Router de Next.js 14
│   │   ├── (public)/             # Rutas públicas (login, recuperación de clave)
│   │   ├── api/                  # 209 Route Handlers (HTTP REST)
│   │   ├── plataforma/           # 312 Páginas autenticadas de la aplicación
│   │   ├── layout.tsx            # Shell HTML raíz con proveedores de estado
│   │   ├── not-found.tsx         # Pantalla amigable 404
│   │   └── globals.css           # Estilos base y variables CSS
│   ├── modules/                  # 17 Módulos de Dominio (Vertical Slices)
│   ├── shared/                   # Infraestructura transversal compartida
│   └── middleware.ts             # Interceptor perimetral de cookies de sesión
├── db/                           # Persistencia relacional PostgreSQL
│   ├── schema.sql                # DDL inicial histórico
│   ├── seed.sql                  # Datos semilla de perfiles, menú, categorías y catálogos
│   └── migrations/               # 40 scripts SQL incrementales versionados
├── scripts/                      # Automatizaciones de desarrollo, pruebas y despliegue
│   └── test_e2e_lifecycle.js     # Suite oficial E2E de 30 pruebas ITIL 4
└── DOCUMENTACIÓN/                # Suite canónica de documentación técnica y ágil
```

---

## 3. Desglose en Profundidad de los 17 Módulos de Dominio

### 3.1. Módulo: `tickets` (Motor Core Transaccional)
- **Ubicación:** `src/modules/tickets` (60 archivos TS/TSX).
- **Dueño Responsable:** Miguel (Tech Lead).
- **Propósito:** Núcleo transaccional congelado del sistema. Gestiona la tabla base `ticket`, los estados de ciclo de vida comunes, el cálculo de prioridad matricial ITIL (Impacto × Urgencia), la bandeja de entrada unificada, el visualizador detallado con stepper y el hilo cronológico de comentarios públicos y notas técnicas privadas.
- **Estructura Interna:**
  - `api/`: `ticketsController.ts`, `ticketDetalleController.ts`, `ticketComentariosController.ts`, `catalogosController.ts`, `adminTicketsController.ts`.
  - `services/`: `ticketService.ts`, `ticketDetalleService.ts`, `ticketComentarioService.ts`, `prioridadService.ts`.
  - `views/`: `VistaTicketsLista.tsx`, `VistaTicketsDetalle.tsx`, `VistaTicketsCrear.tsx`.
  - `components/`: `TablaTickets.tsx`, `StepperTicket.tsx`, `BitacoraComentarios.tsx`, `BadgeEstadoTicket.tsx`, `FiltrosTickets.tsx`.
- **Contratos:**
  - Servidor (`index.ts`): Exporta `listarTickets`, `crearTicket`, `obtenerDetalleTicket`, `actualizarTicket`, `calcularPrioridadITIL`, `ticketsGet`, `ticketsPost`.
  - Cliente (`ui.ts`): Exporta `TablaTickets`, `StepperTicket`, `BadgeEstadoTicket`.

### 3.2. Módulo: `incidentes` (Gestión de Incidentes e Incidentes Mayores)
- **Ubicación:** `src/modules/incidentes` (12 archivos TS/TSX).
- **Dueño Responsable:** Miguel.
- **Propósito:** Manejo integral de interrupciones no planificadas o degradaciones de servicios de TI según ITIL 4. Especializa el ticket base mediante la tabla `ticket_incidente` (Modelo C). Gestiona la activación de incidentes mayores P1 y la sala de crisis.
- **Estructura Interna:**
  - `api/`: Controladores para bandeja de incidentes, catálogo de incidentes y sala de crisis.
  - `services/`: Lógica de clasificación de severidad y enlace con problemas conocidos.
  - `views/`: `VistaIncidentesBandeja.tsx`, `VistaIncidentesMayores.tsx`, `VistaSalaCrisis.tsx`.
  - `config/`: Parametrización de formularios específicos de incidentes y umbrales de severidad.

### 3.3. Módulo: `solicitudes` (Gestión de Solicitudes de Servicio)
- **Ubicación:** `src/modules/solicitudes` (14 archivos TS/TSX).
- **Dueño Responsable:** Miguel.
- **Propósito:** Peticiones formales de los usuarios para la entrega de un servicio, recurso o acceso predefinido en el catálogo. Especializa el ticket mediante `ticket_solicitud`. Administra las compuertas de evaluación y aprobación jerárquica con Segregación de Funciones (SoD).
- **Estructura Interna:**
  - `api/`: Endpoints de bandeja de solicitudes, captura de justificación de negocio y aprobaciones.
  - `services/`: Lógica de validación de plazos mínimos de entrega según SLA y flujo de aprobación.
  - `views/`: `VistaSolicitudesBandeja.tsx`, `VistaAprobacionesSolicitudes.tsx`.
  - `config/`: Parametrización de requisitos y atributos adicionales por categoría de solicitud.

### 3.4. Módulo: `servicios` (Catálogo de Servicios y Acuerdos SLA)
- **Ubicación:** `src/modules/servicios` (33 archivos TS/TSX).
- **Dueño Responsable:** Lourdes.
- **Propósito:** Corazón de la oferta tecnológica corporativa. Contiene la vitrina del catálogo de servicios al cliente (autoservicio) y el catálogo técnico (orientado a ingenieros resolutores). Administra el árbol taxonómico de categorías, los Acuerdos de Nivel de Servicio (SLA), Acuerdos Operativos Internos (OLA) y el Diseñador Dinámico de Campos por Servicio.
- **Estructura Interna:**
  - `admin/servicios/`: Mantenimiento y publicación de fichas de servicio.
  - `admin/servicios/[id]/formulario/`: Diseñador dinámico de campos con validación Zod reactiva.
  - `admin/servicios/sla/`: Parametrización de matrices de tiempo (primera respuesta y resolución) en jornada hábil (8x5) y régimen continuo (24x7).
  - `catalogo/`: Vitrina visual interactiva orientada al solicitante con búsqueda predictiva.
  - `catalogo-tecnico/`: Vista orientada a TI con vinculación a CIs y grupos de soporte.
  - `config/`: Submódulos modulares en `config/catalogo/`, `config/categorias/`, `config/sla/`, `config/formularios/`.
- **Contratos:**
  - Servidor (`index.ts`): Métodos de consulta de servicios, categorías, cálculo de SLA y esquemas Zod dinámicos.
  - Cliente (`ui.ts`): `VistaCatalogoServicios`, `VistaTecnicoCatalogo`.

### 3.5. Módulo: `activos` (Gestión de Activos de TI — HAM/SAM)
- **Ubicación:** `src/modules/activos` (94 archivos TS/TSX).
- **Dueño Responsable:** Lourdes.
- **Propósito:** Control del ciclo de vida patrimonial de hardware (HAM) y licencias de software (SAM) según ISO/IEC 19770-1. Registra altas con número de serie, marca, modelo, custodio institucional, inventario en bodega (stock), equipos en taller de mantenimiento, control de garantías y bajas seguras con borrado certificado de datos. Implementa el semáforo SAM preventivo de licencias (verde <80%, ámbar 80-99%, rojo 100%+).
- **Estructura Interna:**
  - `views/`: `VistaActivos.tsx`, `VistaActivosStock.tsx`, `VistaActivosAsignados.tsx`, `VistaActivosMantenimiento.tsx`, `VistaActivosBajas.tsx`, `VistaActivosLicencias.tsx`, `VistaActivosContratos.tsx`.
  - `config/`: `tipos-modelos-atributos/`, `ciclos-vida-transiciones/`, `licencias-contratos/`.
  - `services/`: Validaciones de asignación patrimonial y cálculo de ocupación de software.

### 3.6. Módulo: `problemas` (Gestión de Problemas y KEDB)
- **Ubicación:** `src/modules/problemas` (94 archivos TS/TSX).
- **Dueño Responsable:** Alexis / Darhien.
- **Propósito:** Prevención y análisis de causas subyacentes de incidentes recurrentes según ITIL 4. Gestiona la correlación de tickets para identificar candidatos a problema, la documentación guiada de Análisis de Causa Raíz (RCA) mediante la técnica de los 5 Porqués y diagramas de Ishikawa, la publicación de Soluciones Temporales (*workarounds*) en la Base de Datos de Errores Conocidos (KEDB) y la generación de RFCs derivadas para soluciones definitivas.
- **Estructura Interna:**
  - `views/`: `VistaProblemas.tsx`, `VistaProblemasCandidatos.tsx`, `VistaProblemasErroresConocidos.tsx`, `VistaProblemasMayores.tsx`, `VistaPanelGestorProblemas.tsx`.
  - `config/`: 13 submódulos modulares (`acuerdos/`, `campos/`, `catalogos/`, `clasificacion/`, `estado/`, `fases/`, `flujo/`, `formulario/`, `gobernanza/`, `notificaciones/`, `rca/`, `roles/`, `sla/`).
  - `services/`: Lógica de bloqueo de cierre sin RCA validado e indexación contextual de workarounds.

### 3.7. Módulo: `conocimiento` (Gestión del Conocimiento — KCS v6)
- **Ubicación:** `src/modules/conocimiento` (29 archivos TS/TSX).
- **Dueño Responsable:** Alexis / Darhien.
- **Propósito:** Repositorio corporativo de artículos de solución, guías de autoayuda y procedimientos técnicos alineado con el estándar *Knowledge-Centered Service* (KCS v6). Provee un ciclo de vida editorial (Borrador -> En Revisión Técnica -> Aprobado -> Publicado), control de visibilidad por audiencia (público para clientes vs interno para técnicos), motor de búsqueda indexada por palabras clave y captura de feedback con votos de utilidad ("¿Te sirvió este artículo?").
- **Estructura Interna:**
  - `views/`: `VistaConocimientoBase.tsx`, `VistaConocimientoDetalle.tsx`, `VistaConocimientoMisArticulos.tsx`, `VistaConocimientoNuevo.tsx`, `VistaConocimientoRevisiones.tsx`.
  - `config/`: `categorias/`, `workflow-editorial/`, `politicas-acceso/`.
  - `services/`: Servicio de indexación, historial de revisiones y cálculo de efectividad KCS.

### 3.8. Módulo: `seguridad` (Autenticación y Ciberseguridad ISO 27001)
- **Ubicación:** `src/modules/seguridad` (36 archivos TS/TSX).
- **Dueño Responsable:** Junior.
- **Propósito:** Seguridad perimetral de acceso y autenticación conforme a ISO/IEC 27001. Administra el formulario de login, verificación criptográfica con `bcryptjs`, desafío captcha matemático para mitigación de fuerza bruta, políticas de contraseñas robustas (mayúsculas, minúsculas, números, caracteres especiales y longitud mínima de 8 caracteres), emisión de tokens JWT de sesión (8 horas) y flujo guiado de recuperación de clave mediante códigos temporales de un solo uso con vigencia estricta de 15 minutos despachados vía SMTP.
- **Estructura Interna:**
  - `api/`: `loginController.ts`, `recuperarController.ts`, `captchaController.ts`, `cambiarClaveController.ts`.
  - `views/`: `VistaLogin.tsx`, `VistaRecuperarClave.tsx`, `VistaCambiarClave.tsx`.
  - `services/`: Validación de intentos fallidos con bloqueo de cuenta preventivo tras 3 o 5 fallos consecutivos.

### 3.9. Módulo: `identidades` (Directorio Corporativo y RBAC)
- **Ubicación:** `src/modules/identidades` (22 archivos TS/TSX).
- **Dueño Responsable:** Junior.
- **Propósito:** Gestión de Identidades y Accesos (*Identity and Access Management - IAM*). Administra el directorio oficial de colaboradores, alta y edición de cuentas, asignación de perfiles RBAC, políticas de desbloqueo supervisado y provisión automatizada de credenciales institucionales.
- **Estructura Interna:**
  - `views/`: `VistaUsuarios.tsx`, `VistaPerfiles.tsx`.
  - `config/`: `usuarios/`, `perfiles/`, `permisos/`, `politicas-acceso/`.
  - `api/`: Endpoints administrativos para altas, bajas lógicas y recertificación de accesos.

### 3.10. Módulo: `organizacion` (Estructura Organizacional, Turnos y Ausencias)
- **Ubicación:** `src/modules/organizacion` (32 archivos TS/TSX).
- **Dueño Responsable:** Junior.
- **Propósito:** Mapeo de la estructura empresarial e infraestructura de soporte de TI. Administra las áreas de negocio (Departamentos Empresa) y los grupos resolutores de TI clasificados por niveles N1, N2 y N3. Gobierna el calendario de turnos laborales, guardias 24x7 y registro de ausencias programadas (vacaciones, licencias médicas), actualizando el motor de balanceo de carga para excluir automáticamente a los técnicos no disponibles.
- **Estructura Interna:**
  - `views/`: `VistaDepartamentos.tsx`, `VistaTecnicos.tsx`, `VistaTurnosAusencias.tsx`.
  - `config/`: `departamentos/`, `departamentos-empresa/`, `tecnicos/`, `turnos-ausencias/`.
  - `services/`: Servicio de cálculo de carga activa por técnico y disponibilidad horaria.

### 3.11. Módulo: `proveedores` (Gestión de Proveedores ITIL 4)
- **Ubicación:** `src/modules/proveedores` (6 archivos TS/TSX).
- **Dueño Responsable:** Junior.
- **Propósito:** Práctica de *Supplier Management*. Administra el catálogo de terceros homologados, registro de contratos de soporte externo (*Underpinning Contracts - UC*), vigencias, datos de contacto de escalamiento y evaluaciones periódicas de calidad de servicio para auditorías de compras.

### 3.12. Módulo: `cambios` (Habilitación del Cambio — Change Enablement)
- **Ubicación:** `src/modules/cambios` (134 archivos TS/TSX).
- **Dueño Responsable:** Nain.
- **Propósito:** Práctica ITIL 4 de Habilitación del Cambio (*Change Enablement*). Control riguroso de Solicitudes de Cambio (RFC) divididas en Estándar (preaprobadas), Normales (menores o mayores) y de Emergencia. Gestiona la matriz de evaluación de riesgo e impacto, la detección automática de colisiones con ventanas de mantenimiento o periodos de congelamiento (*blackout / freeze*), las sesiones virtuales del Comité Asesor de Cambios (CAB/ECAB) con registro de quórum y votación formal, el calendario gráfico de intervenciones y la Revisión Post-Implementación (PIR) obligatoria.
- **Estructura Interna:**
  - `views/`: `VistaCambios.tsx`, `VistaCab.tsx`, `VistaCalendarioCambios.tsx`, `VistaCambiosComite.tsx`, `VistaCambiosEmergencia.tsx`.
  - `config/`: 8 submódulos modulares (`flujo-evaluacion/`, `formulario/`, `matriz-autoridad/`, `modelos-estandar/`, `notificaciones-calendario/`, `plantillas/`, `reglas-clasificacion/`, `tipos-requisitos/`).
  - `services/`: Validación algorítmica de solapamiento horario y cálculo de riesgo por criticidad de CIs.

### 3.13. Módulo: `cmdb` (Gestión de Configuración — SACM)
- **Ubicación:** `src/modules/cmdb` (34 archivos TS/TSX).
- **Dueño Responsable:** Nain.
- **Propósito:** Práctica de *Service Configuration Management* (SACM). Modela la infraestructura física y lógica de TI mediante Elementos de Configuración (CIs: servidores, switches, routers, bases de datos, aplicaciones, clusters). Gestiona el grafo de dependencias bidireccional (relaciones aguas arriba / aguas abajo: "Depende de", "Conectado a", "Aloja a"), previene bucles circulares mediante algoritmo DFS, ejecuta simulaciones de análisis de impacto ante caídas y audita discrepancias entre líneas base autorizadas y el estado real.
- **Estructura Interna:**
  - `views/`: `VistaCmdbCi.tsx`, `VistaCmdbRelaciones.tsx`, `VistaCmdbLineasBase.tsx`, `VistaCmdbTopologia.tsx`.
  - `config/`: `cmdb-relaciones/` (reglas de integridad referencial y taxonomía de clases de CI).
  - `services/`: Motor de cálculo topológico y reconciliación de datos.

### 3.14. Módulo: `reportes` (Analítica ITSM y Reportes Gerenciales)
- **Ubicación:** `src/modules/reportes` (24 archivos TS/TSX).
- **Dueño Responsable:** Miguel.
- **Propósito:** Central de Business Intelligence y Analítica ITSM. Agrupa los 9 reportes analíticos unificados de la plataforma (Operativos, Auditoría, Productividad, Activos, Cambios, Decisiones, Problemas, Área y Diseñador de Tableros) junto al panel consolidado de **Reportes Gerenciales** con cálculo de KPIs clave (MTTR, MTBF, % cumplimiento SLA, volumen de tickets resueltos por grupo) y exportación limpia a formatos CSV y Excel corporativo.
- **Contratos:**
  - Servidor (`index.ts`): Servicios de extracción de métricas agregadas mediante SQL acotado de lectura.
  - Cliente (`ui.ts`): Vistas de los 9 reportes y componentes de gráficos de tendencia.

### 3.15. Módulo: `operacion` (Monitoreo, Alertas de SLA y Tableros Unificados)
- **Ubicación:** `src/modules/operacion` (34 archivos TS/TSX).
- **Dueño Responsable:** Miguel.
- **Propósito:** Supervisión operativa en tiempo real y resiliencia de servicios. Aloja la estructura canónica de los **Paneles de Control Unificados por Perfil** (`/plataforma/operacion/paneles/<rol>`) para los 10 roles del sistema. Ejecuta el motor de reglas de escalamiento preventivo que dispara notificaciones visuales y por correo al alcanzarse el 75% y 90% del tiempo comprometido en el SLA.
- **Estructura Interna:**
  - `paneles/`: Vistas de aterrizaje personalizadas para cada rol funcional.
  - `services/`: Motor de evaluación de eventos operativos y monitoreo de colas.

### 3.16. Módulo: `plataforma` (Gobierno del Sistema y Auditoría Global)
- **Ubicación:** `src/modules/plataforma` (29 archivos TS/TSX).
- **Dueño Responsable:** Miguel.
- **Propósito:** Administración transversal del ecosistema FlowDesk. Gestiona la salud de los servicios de base de datos y cache, los registros de auditoría inmutable de cambios de estado, el catálogo dinámico de opciones de menú, la asignación de visibilidad de pantallas por perfil (`opciones_menu_perfiles`), las reglas de retención de datos y las políticas de notificación global.

### 3.17. Módulo: `perfiles` (Consolas de Rol Especializadas)
- **Ubicación:** `src/modules/perfiles` (135 archivos TS/TSX).
- **Propósito:** Capa de ensamblaje visual por rol. Contiene las subcarpetas operativas para cada rol (`administrador`, `tecnico`, `solicitante`, `supervisor`, `gestor-area`, `auditor`, `aprobador`, `gestor-cambios`).
- **Regla de Diseño Estricta:** Las consolas de perfil solo resuelven alcance y composición de pantallas; delegan toda la lógica de negocio a los contratos de los módulos de dominio correspondientes (`@/modules/<dominio>`), impidiendo la duplicación de código.

---

## 4. Arquitectura de Rutas y Navegación

### 4.1. Unificación Canónica de Paneles de Control
Para erradicar rutas dispersas o duplicadas, todas las pantallas principales de aterrizaje (*dashboards*) de los 10 perfiles oficiales convergen estrictamente en la siguiente estructura canónica:

```text
/plataforma/operacion/paneles/
├── administrador      -> Consola de Gobierno e Identidades
├── tecnico            -> Mesa Resolutora y KEDB
├── solicitante        -> Portal de Autoservicio "Mis Tickets"
├── supervisor         -> Control de SLA, Turnos y Colas
├── gestor-area        -> Aprobación de Requerimientos Departamentales
├── auditor            -> Inspección Forense Read-Only y SoD
├── aprobador          -> Votación Colegiada de Cambios CAB
├── gestor-cambios     -> Calendario RFC y Detección de Freeze
├── gestor-activos     -> Inventario HAM y Semáforo SAM de Licencias
└── gestor-problemas   -> Análisis RCA (5 Porqués / Ishikawa)
```

El componente `SelectorPerfil.tsx` y la ruta `/plataforma/dashboard` resuelven dinámicamente el perfil del usuario autenticado y lo redirigen de forma transparente a su panel canónico correspondiente.

### 4.2. Mapa Canónico de Rutas Principales

| Prefijo de Ruta | Módulo Responsable | Controlador / API | Propósito Operativo |
| :--- | :--- | :--- | :--- |
| `/plataforma/operacion/paneles/*` | `operacion` | `/api/reportes/indicadores` | Paneles de mando unificados para los 10 perfiles oficiales. |
| `/plataforma/tickets/**` | `tickets` | `/api/tickets` | Bandejas generales transversales y búsqueda global de tickets. |
| `/plataforma/incidentes/**` | `incidentes` | `/api/incidentes` | Incidentes: bandeja, asignados, míos, catálogo, mayores y sala de crisis. |
| `/plataforma/solicitudes/**` | `solicitudes` | `/api/solicitudes` | Solicitudes: bandeja, catálogo, autorizaciones de área y plazos. |
| `/plataforma/servicios/**` | `servicios` | `/api/servicios`, `/api/admin/sla` | Catálogo maestro de servicios, Acuerdos SLA y diseñador dinámico. |
| `/plataforma/activos/**` | `activos` | `/api/activos` | Gestión patrimonial HAM, stock, asignaciones, semáforo SAM y bajas. |
| `/plataforma/cmdb/**` | `cmdb` | `/api/cmdb` | Elementos de Configuración CIs, relaciones lógicas y grafo topológico. |
| `/plataforma/problemas/**` | `problemas` | `/api/problemas` | Ciclo de problemas, investigación RCA 5-Why/Ishikawa y KEDB. |
| `/plataforma/conocimiento/**` | `conocimiento` | `/api/conocimiento` | Artículos KCS v6, taxonomía, búsqueda predictiva y revisiones. |
| `/plataforma/cambios/**` | `cambios` | `/api/cambios` | Solicitudes RFC, calendario, freeze, comités CAB/ECAB y PIR. |
| `/plataforma/reportes/**` | `reportes` | `/api/reportes/indicadores` | 9 reportes centralizados y panel de reportes gerenciales con CSV. |
| `/plataforma/organizacion/**` | `organizacion` | `/api/organizacion` | Departamentos TI, grupos resolutores N1/N2/N3, turnos y ausencias. |
| `/plataforma/seguridad/**` | `identidades` + `seguridad` | `/api/usuarios`, `/api/seguridad` | Usuarios, perfiles RBAC, políticas de contraseña y auditoría. |
| `/plataforma/mi-cuenta/**` | `seguridad` | `/api/mi-cuenta` | Perfil del usuario conectado, cambio de clave y preferencias. |

### 4.3. Route Handlers en `src/app/api/`
Los 209 archivos `route.ts` en `src/app/api/` aplican el principio de cascarón delgado:
```ts
// Ejemplo: src/app/api/incidentes/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

export { GET, POST } from "@/modules/incidentes/api/incidentesController";
```
Toda la lógica de parseo de request, validación Zod, invocación del servicio y respuesta HTTP reside en el controlador correspondiente dentro de `src/modules/<modulo>/api/`.

---

## 5. Seguridad, Autenticación y Modelo de Permisos (RBAC)

### 5.1. Flujo de Autenticación y Manejo de Sesión
1. **Petición de Ingreso:** `POST /api/auth/login` recibe correo institucional, contraseña y respuesta de captcha.
2. **Validación Criptográfica:** El servicio consulta la tabla `usuario`, valida el dominio corporativo autorizado y compara el hash mediante `bcryptjs.compare(passwordPlana, hashBD)`.
3. **Manejo Multi-Perfil:** Si el usuario tiene asignados múltiples perfiles (por ejemplo, es Solicitante en su área pero Aprobador en el CAB), el servidor genera una **pre-sesión** temporal de 5 minutos que le exige seleccionar con qué rol desea operar.
4. **Emisión de Token JWT:** Una vez elegido el perfil activo, se firma un JWT con vigencia de 8 horas conteniendo:
   ```json
   {
     "idUsuario": 12,
     "idPerfil": 2,
     "nombre": "Carlos Mendoza",
     "correo": "cmendoza@organizacion.com",
     "perfilNombre": "Tecnico",
     "exp": 1729800000
   }
   ```
5. **Persistencia en Cookie:** El token se estampa en la cookie HTTP segura `sesion` con atributos:
   - `HttpOnly: true` (Inaccesible desde scripts cliente / XSS).
   - `SameSite: Lax` (Mitigación contra ataques CSRF).
   - `Secure: true` (Obligatorio en conexiones HTTPS o entornos productivos).
   - `MaxAge: 28800` (8 horas).

### 5.2. Las 71 Capacidades Semánticas y Guardas de Protección
El sistema no evalúa permisos mediante comparaciones rígidas de cadenas de perfil (`if perfil == 'Tecnico'`), sino a través de un catálogo de **71 capacidades semánticas** con nomenclatura `dominio:accion` declaradas en `src/shared/lib/capacidades.ts`:

- **Guardas de API:** En los controladores HTTP, el guard normativo es `sesionConCapacidad`:
  ```ts
  import { sesionConCapacidad } from "@/shared/lib/api-auth";
  import { CAPACIDADES } from "@/shared/lib/capacidades";

  export async function POST(req: NextRequest) {
    const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_CREAR);
    if (error) return error; // Retorna 401 Unauthorized o 403 Forbidden
    // Ejecución segura de la lógica...
  }
  ```
- **Guardas de Página:** En las vistas del servidor (`page.tsx`), se utiliza `exigirMenuPagina` o `exigirCapacidadPagina`:
  ```tsx
  export default async function PaginaInventarioActivos() {
    await exigirCapacidadPagina(CAPACIDADES.ACTIVOS_VER);
    return <VistaActivos />;
  }
  ```

### 5.3. Segregación de Funciones (SoD) Validadas en Servidor
El servidor aplica de forma bloqueante las directivas de control interno:
- **RN-32 (Autoaprobación Prohibida):** Un usuario no puede dictaminar favorablemente una solicitud o RFC creada por él mismo (`id_solicitante <> id_aprobador`).
- **RN-16 (Límite de Ocupación Técnica):** Un técnico no puede mantener más de 5 tickets activos simultáneamente en estado "En Proceso" para garantizar calidad en la atención.
- **RN-27 (Integridad de Archivos por Magic Bytes):** Todo archivo adjunto se valida analizando la cabecera binaria del buffer en el servidor, impidiendo la subida de ejecutables camuflados como imágenes o PDF.
- **RN-10 (Cálculo Hábil de SLA):** El temporizador de SLA descuenta estrictamente sábados, domingos y días feriados registrados en el calendario oficial de la empresa.

---

## 6. Modelo Relacional de Base de Datos

La persistencia relacional opera en PostgreSQL 15 (Supabase) sobre un esquema normalizado compuesto por **132 tablas base** y **1 vista relacional**.

### 6.1. El Modelo C de Tickets
El núcleo transaccional desacopla los atributos comunes de los datos particulares de incidentes y solicitudes:

```text
                               ┌────────────────────────┐
                               │         ticket         │ (Núcleo Compartido)
                               │────────────────────────│
                               │ id_ticket (PK)         │
                               │ codigo_ticket          │
                               │ id_tipo_ticket (1 ó 2) │
                               │ id_estado              │
                               │ id_prioridad           │
                               │ id_solicitante         │
                               │ id_tecnico_asignado    │
                               │ fecha_limite_resolucion│
                               │ campos_adicionales JSON│
                               └───────────┬────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
            1:1     │ (Si id_tipo_ticket = 1)             1:1     │ (Si id_tipo_ticket = 2)
                    ▼                                             ▼
        ┌────────────────────────┐                    ┌────────────────────────┐
        │    ticket_incidente    │                    │    ticket_solicitud    │
        │────────────────────────│                    │────────────────────────│
        │ id_ticket (PK, FK)     │                    │ id_ticket (PK, FK)     │
        │ id_problema (FK)       │                    │ estado_aprobacion      │
        │ es_incidente_mayor bool│                    │ id_paso_actual (FK)    │
        │ causado_por_cambio_id  │                    │ justificacion_negocio  │
        └────────────────────────┘                    └────────────────────────┘
```

- **Trigger de Integridad `trg_ticket_subtipo`:** Cuando se inserta un registro en `ticket`, el trigger genera automáticamente la fila correspondiente en `ticket_incidente` o `ticket_solicitud` según el valor de `id_tipo_ticket`, eliminando cualquier fila del subtipo opuesto para asegurar que una tupla nunca tenga ambas extensiones.
- **Vista `vista_ticket`:** Ejecuta un `LEFT JOIN` entre `ticket`, `ticket_incidente` y `ticket_solicitud`, permitiendo consultas de lectura que devuelven la estructura plana sin sobrecostos de mantenimiento.

### 6.2. Tablas Principales por Dominio

| Dominio | Tablas Representativas | Llaves Foráneas y Propósito |
| :--- | :--- | :--- |
| **Tickets** | `ticket`, `ticket_incidente`, `ticket_solicitud`, `comentario_ticket`, `ticket_aprobacion`, `estado_ticket`, `prioridad_ticket` | Ciclo de vida transaccional, estados, historial de comentarios públicos y notas técnicas privadas. |
| **Catálogo & SLA** | `servicio_catalogo`, `servicio_catalogo_perfiles`, `servicio_workflow_paso`, `categoria_servicio`, `sla_objetivo`, `acuerdo_nivel_operativo` | Portafolio de servicios, matriz de prioridad SLA, pasos de aprobación y horarios de atención. |
| **Cambios (CAB)** | `cambio`, `cambio_aprobacion`, `cab_reunion`, `cab_voto`, `periodos_congelamiento`, `cambio_plantilla`, `cambio_modelo_estandar` | Expediente de RFC, evaluación de riesgo, agenda y votación CAB, ventanas blackout y revisiones PIR. |
| **Problemas** | `problema`, `problema_incidente`, `problema_analisis`, `error_conocido`, `problema_categoria_causa` | Registro de problemas, correlación de incidentes, hallazgos RCA 5-Why/Ishikawa y repositorio KEDB. |
| **Activos (HAM/SAM)** | `activo`, `activo_componente`, `licencia_software`, `licencia_asignacion`, `contrato_ti`, `activo_baja_registro` | Inventario patrimonial por serie, asignación a custodios, semáforo SAM de licencias y certificados de baja. |
| **CMDB** | `elemento_configuracion`, `ci_clase`, `ci_relacion`, `ci_tipo_relacion`, `cmdb_linea_base`, `cmdb_inexactitud` | SACM: catálogo de CIs, aristas del grafo topológico, auditoría de líneas base y control de exactitud. |
| **Conocimiento** | `articulo_conocimiento`, `articulo_categoria`, `articulo_revision`, `articulo_voto` | Repositorio KCS, categorías jerárquicas, flujo de aprobación editorial y votos de utilidad. |
| **Identidades & IAM** | `usuario`, `perfiles`, `usuario_perfiles`, `perfiles_permisos`, `token_recuperacion_clave` | Directorio institucional de colaboradores, roles funcionales RBAC y tokens temporales SMTP. |
| **Organización** | `departamento_ti`, `departamento_empresa`, `tecnico_departamento`, `tecnico_turno`, `tecnico_ausencia` | Grupos resolutores TI N1/N2/N3, jefaturas de área, planificación de turnos y registro de ausencias. |
| **Menú Dinámico** | `opciones_menu`, `opciones_menu_perfiles`, `configuracion_sistema` | Catálogo único de 230 opciones de menú lateral y matriz de visibilidad de 393 asignaciones por rol. |

---

## 7. Catálogo Único de Menú y Autorización por Navegación

El sistema cuenta con un catálogo maestro centralizado de opciones de navegación en la tabla `opciones_menu`:
- `url_menu = ''`: Representa un nodo contenedor o **carpeta visual** en el sidebar.
- `url_menu <> ''`: Representa una **pantalla operativa** navegable.

### 7.1. Matriz de Visibilidad N:M
La tabla `opciones_menu_perfiles` asocia qué perfiles tienen derecho de visualización sobre cada pantalla o carpeta. De esta forma, una pantalla (por ejemplo, el visualizador de un ticket o el catálogo de servicios) existe una sola vez en el sistema, pero su visibilidad se gobierna dinámicamente según el perfil activo del usuario.

### 7.2. Algoritmo de Construcción del Árbol de Navegación
En `src/shared/lib/menu.ts`, el motor de navegación ejecuta la siguiente secuencia:
1. Consulta las opciones asignadas al perfil activo del usuario en la base de datos.
2. Filtra registros activos (`estado_registro = true`).
3. Construye el árbol jerárquico relacionando `id_opcion` con `id_padre`.
4. **Colapso Automático de Carpetas:** Si una carpeta tiene un único hijo visible para ese perfil particular, el árbol colapsa la carpeta intermedia y eleva directamente la pantalla final, evitando clics redundantes en la experiencia de usuario.
5. **Eliminación de Nodos Vacíos:** Si una carpeta no contiene ninguna pantalla permitida para ese rol, se excluye por completo del árbol de navegación.

---

## 8. Calidad de Código, Verificación y Despliegue

### 8.1. Quality Gates Mandatorios
Antes de que cualquier código sea integrado en la rama `main` o desplegado a producción, debe superar de forma obligatoria los tres Quality Gates del repositorio:

```bash
# Quality Gate 1: Verificación estática estricta de TypeScript
npx tsc --noEmit
# Criterio de Éxito: 0 errores de compilación, 0 tipos incompatibles.

# Quality Gate 2: Compilación de producción en Next.js
npm run build
# Criterio de Éxito: Generación limpia de las 335 páginas compiladas con código de salida 0.

# Quality Gate 3: Suite Oficial de Pruebas Dinámicas E2E ITIL 4
node scripts/test_e2e_lifecycle.js
# Criterio de Éxito: 30 de 30 pruebas aprobadas (100% éxito) cubriendo el ciclo completo.
```

### 8.2. Cobertura de la Suite de Pruebas E2E (`scripts/test_e2e_lifecycle.js`)
La suite oficial ejecuta 30 pruebas automatizadas contra la base de datos y la API simulando el comportamiento real de usuarios:
1. Autenticación con credenciales válidas y verificación de JWT.
2. Bloqueo de sesión ante credenciales inválidas.
3. Validación de mitigación de fuerza bruta con captcha.
4. Generación de código temporal de recuperación con vencimiento a 15 min.
5. Consulta paginada del catálogo de servicios.
6. Validación de esquema dinámico Zod al enviar requerimiento.
7. Creación de ticket y cálculo de fecha límite hábil según matriz SLA.
8. Despacho y autoasignación de ticket a técnico de soporte.
9. Validación de regla RN-16 (bloqueo al intentar tomar más de 5 tickets activos).
10. Registro de comentario público en bitácora de ticket.
11. Registro de nota técnica privada y comprobación de que el solicitante no puede leerla.
12. Resolución técnica de ticket con registro de diagnóstico.
13. Calificación de satisfacción CSAT por el solicitante.
14. Reapertura controlada ante disconformidad del cliente.
15. Creación de caso de problema vinculado a incidentes recurrentes.
16. Registro de análisis de causa raíz RCA (5 Porqués).
17. Bloqueo de cierre de problema si no cuenta con causa raíz confirmada.
18. Publicación de solución temporal (*workaround*) en la KEDB.
19. Creación de Solicitud de Cambio (RFC) Normal con plan de contingencia (*rollback*).
20. Detección automática de colisiones con periodos de congelamiento (*freeze*).
21. Sesión y registro de voto colegiado de miembro del comité CAB.
22. Transición automática de estado de RFC al alcanzar el quórum aprobatorio.
23. Alta patrimonial de activo TI con número de serie y custodio asignado.
24. Cálculo automático de ocupación SAM de licencias de software.
25. Alerta semafórica preventiva al alcanzar el 95% de uso de licencias.
26. Bloqueo de asignación al intentar exceder el 100% del cupo legal de licencias.
27. Creación de CI en la CMDB y asociación con activo de inventario.
28. Vinculación de relación lógica entre CIs ("Depende de") con prevención de ciclos.
29. Exclusión automática de técnicos ausentes en el balanceador de carga.
30. Extracción de KPIs consolidados en el panel de reportes gerenciales.

---

## 9. Propiedad de Módulos y Modelo de Asignación del Equipo

Para garantizar total autonomía y cero bloqueos entre los cinco integrantes del equipo de desarrollo, la propiedad de los módulos se encuentra formalmente delimitada según el acuerdo de rebalanceo oficial:

```text
                                  EQUIPO FLOWDESK
                               ┌───────────────────┐
                               │ 5 DESARROLLADORES │
                               └─────────┬─────────┘
        ┌───────────────────┬────────────┼────────────┬───────────────────┐
        ▼                   ▼            ▼            ▼                   ▼
     Miguel              Lourdes       Alexis       Junior              Nain
  (Tech Lead)          (Servicios)   (Problemas)  (Seguridad e IAM)   (Cambios)
        │                   │            │            │                   │
  ├── tickets         ├── servicios  ├── problemas├── seguridad       ├── cambios
  ├── incidentes      └── activos    └── conocim. ├── identidades     └── cmdb
  ├── solicitudes                                 ├── organizacion
  ├── reportes                                    └── proveedores
  ├── operacion
  └── plataforma
```

- **Miguel:** Lidera el Núcleo Transaccional, los frentes operativos de Incidentes y Solicitudes, la Analítica y Reportes centralizados, el monitoreo en Operación, la gobernanza de Plataforma y la infraestructura transversal (`src/shared/lib`).
- **Lourdes:** Lidera la Oferta de Servicios y Recursos TI, consolidando el Catálogo de Servicios, Acuerdos SLA/OLA/UC, Diseñador de Formularios Dinámicos, el Inventario Patrimonial de Activos (HAM), el control de licencias (SAM) y la gestión de bajas seguras.
- **Alexis / Darhien:** Lidera la Estabilidad y Gestión del Conocimiento, gobernando el proceso de Problemas, la metodología de análisis de causa raíz (RCA 5-Why / Ishikawa), la Base de Errores Conocidos (KEDB) y el ciclo editorial de artículos KCS v6.
- **Junior:** Lidera la Ciberseguridad, Directorio Maestro y Terceros, gobernando la autenticación ISO 27001 en Seguridad, el directorio corporativo en Identidades (IAM), los grupos resolutores, turnos y ausencias en Organización, y la homologación de contratistas en Proveedores.
- **Nain:** Lidera el Control de Infraestructura y Producción, gobernando el ciclo completo de Habilitación del Cambio (*Change Enablement*), comités CAB/ECAB, ventanas de freeze, y la Gestión de Configuración (CMDB) con su catálogo de CIs y grafo topológico de impacto.

---

## 10. Resumen de Calidad y Mantenimiento para Asistentes de IA

Cualquier modelo de IA que asista en la edición, depuración o ampliación de FlowDesk ITSM debe cumplir estrictamente estas seis directivas inmutables:

1. **Aislamiento de Módulo:** Modifique exclusivamente archivos pertenecientes al módulo que se le asigne. Nunca edite archivos en carpetas de otros compañeros sin previa solicitud expresa.
2. **Respeto a los Contratos Públicos:** Si un módulo requiere comunicarse con otro, hágalo únicamente importando desde `@/modules/<modulo>` (servidor) o `@/modules/<modulo>/ui` (cliente). Nunca genere importaciones profundas hacia subcarpetas internas de otro dominio.
3. **Cascarones Delgados:** No coloque lógica de negocio, consultas SQL ni validaciones complejas dentro de `src/app/`. Toda la lógica reside en `src/modules/<modulo>/services/` o `src/modules/<modulo>/api/`.
4. **Seguridad y Guardas:** No cree guardas de autenticación locales ni invente archivos `guardia.ts`. Utilice siempre las guardas centrales normativas provistas en `src/shared/lib/api-auth.ts` y `src/shared/lib/page-auth.ts`.
5. **Estándar Cero Emojis:** Mantenga un código limpio, profesional y libre de emojis en código fuente, comentarios, mensajes de commit y archivos de documentación.
6. **Compilación Limpia:** Antes de dar por concluida cualquier intervención técnica, ejecute `npx tsc --noEmit` y `npm run build` para certificar que el código compila con código de salida 0 y cero advertencias.
