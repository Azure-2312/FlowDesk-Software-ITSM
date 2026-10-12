# Plan Maestro de Distribucion de Responsabilidades del Equipo, Asignacion de Modulos (Desde Cero) y Metodologia Scrum

## Informacion General del Proyecto

- **Proyecto:** FlowDesk - Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITIL 4)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Arquitectura del Software:** Arquitectura Modular Orientada al Dominio (Feature-Driven / Vertical Slice Hibrido sobre Next.js App Router, TypeScript y PostgreSQL)
- **Enfoque de este Documento:** Planificacion integral **desde cero (End-to-End)**. Incluye absolutamente todo el alcance del proyecto (tanto los modulos, vistas, APIs y base de datos que ya fueron construidos como las funcionalidades avanzadas pendientes de implementacion), repartido equitativamente entre los 5 integrantes para efectos de desarrollo con Asistentes de IA, control de versiones en Git sin colisiones y sustentacion academica ante el docente.

---

## 1. Estructura del Equipo de 5 Integrantes y Estrategia de Aislamiento en Git

Para garantizar que los 5 integrantes trabajen simultaneamente con asistentes de Inteligencia Artificial sin generar conflictos de fusion (`merge conflicts`) en GitHub, el sistema se ha particionado bajo el principio de **Propiedad Exclusiva de Modulos y Carpetas**:

| Integrante | Rol Oficial en el Proyecto | Dominio Funcional Asignado (End-to-End) | Rama Oficial de Trabajo en Git |
| :--- | :--- | :--- | :--- |
| **1. Miguel** | **Lider Tecnico (Tech Lead), Arquitecto de Software y Desarrollador del Nucleo ITSM** | Arquitectura Base, Esquema PostgreSQL, Seguridad/RBAC, Ciclo de Vida de Incidentes y Solicitudes, Aprobaciones (SoD), Colas Operativas y Motor de Acuerdos de Nivel de Servicio (SLA/OLA). | `feature/miguel-nucleo-tickets-sla` |
| **2. Lourdes (Lu)** | **Lider de Frontend (UI/UX Design System) y Desarrolladora de Experiencia de Servicio** | Sistema de Diseno y Componentes Compartidos (`shared/components`), Catalogo de Servicios y Categorias, Formularios Dinamicos por Servicio, Encuestas CSAT, Reapertura de Casos y Notificaciones Multicanal. | `feature/lourdes-frontend-catalogo` |
| **3. Alexis** | **Desarrollador del Dominio de Gestion de Problemas y Base de Conocimiento** | Gestion de Problemas (ITIL Problem Management), Analisis de Causa Raiz (RCA), Base de Datos de Errores Conocidos (KEDB), Base de Conocimiento (Articulos KB), Flujo Editorial y Buscador de Autoayuda. | `feature/alexis-problemas-conocimiento` |
| **4. Nain** | **Desarrollador del Dominio de Habilitacion del Cambio (RFC) y Activos/CMDB** | Gestion de Cambios (RFC Normal, Estandar, Emergencia), Comite CAB, Calendario de Ventanas y Congelamiento (Change Freeze), Revision Post-Implementacion (PIR), Inventario ITAM y Topologia CMDB. | `feature/nain-cambios-activos-cmdb` |
| **5. Junior** | **Desarrollador de Administracion Organizacional, Inteligencia de Negocios y Auditoria** | Gestion de Usuarios y Cuentas, Perfiles y Permisos, Departamentos y Areas, Gestion de Especialistas Tecnicos, Reportes Gerenciales (KPIs / Exportacion CSV-Excel) y Auditoria Forense Inmutable. | `feature/junior-admin-reportes-auditoria` |

---

## 2. Matriz Resumen de Cobertura Total (100% de Bloques, HU, RF, RNF y RN)

Ningun artefacto de ingenieria de software queda huerfano. A continuacion se presenta la distribucion exacta de los **21 Bloques Funcionales**, las **44 Historias de Usuario (HU)**, los **44 Requerimientos Funcionales (RF)**, los **6 Requerimientos No Funcionales (RNF)** y las **41 Reglas de Negocio (RN)**:

| Integrante | Bloques de la Matriz | Historias de Usuario (HU) | Requerimientos Funcionales (RF) | Reglas de Negocio (RN) | Requerimientos No Funcionales (RNF) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Miguel** | Bloques I, III, V (Nucleo), VI, VII, VIII, XVII | HU-01, HU-02, HU-06, HU-07, HU-11, HU-14, HU-15, HU-16, HU-17, HU-18, HU-19, HU-20, HU-21, HU-25, HU-33, HU-36 *(16 HUs)* | RF-01, RF-02, RF-07, RF-08, RF-12, RF-15, RF-16, RF-17, RF-18, RF-19, RF-20, RF-21, RF-22, RF-26, RF-33, RF-36 *(16 RFs)* | RN-01, RN-03, RN-06, RN-07, RN-10, RN-11, RN-12, RN-14, RN-15, RN-16, RN-17, RN-18, RN-19, RN-20, RN-21, RN-22, RN-23, RN-24, RN-28, RN-31, RN-32, RN-33 *(22 RNs)* | RNF-01, RNF-02, RNF-03, RNF-05, RNF-06 |
| **Lourdes (Lu)** | Transversal UI/UX + Bloques II, IV, V (Dinamicos/Adjuntos), IX, X, XVIII | HU-03, HU-09, HU-10, HU-22, HU-23, HU-24, HU-26, HU-28, HU-30, HU-34, HU-35 *(11 HUs)* | RF-03, RF-10, RF-11, RF-23, RF-24, RF-25, RF-27, RF-29, RF-30, RF-34, RF-35 *(11 RFs)* | RN-09, RN-13, RN-25, RN-26, RN-27, RN-29, RN-41 *(7 RNs)* | RNF-01, RNF-04, RNF-06 |
| **Alexis** | Bloques XI, XVI | HU-32, HU-43, HU-44 (+ co-soporte tecnico en HU-10 para indexacion KB) *(3 HUs troncales + flujo editorial)* | RF-32, RF-43, RF-44 *(3 RFs complejos de ciclo completo)* | RN-37, RN-40 *(2 RNs troncales + reglas editoriales)* | RNF-01, RNF-04, RNF-06 |
| **Nain** | Bloques XII, XIII, XIV, XV | HU-31, HU-37, HU-38, HU-39, HU-40, HU-41, HU-42 *(7 HUs)* | RF-31, RF-37, RF-38, RF-39, RF-40, RF-41, RF-42 *(7 RFs)* | RN-34, RN-35, RN-36, RN-38, RN-39 *(5 RNs)* | RNF-02, RNF-05, RNF-06 |
| **Junior** | Bloques XIX, XX, XXI | HU-04, HU-05, HU-08, HU-12, HU-13, HU-27, HU-29 *(7 HUs)* | RF-04, RF-05, RF-06, RF-09, RF-13, RF-14, RF-28 *(7 RFs)* | RN-02, RN-04, RN-05, RN-08, RN-30 *(5 RNs)* | RNF-01, RNF-03, RNF-05 |

---

## 3. Desglose Detallado de Responsabilidades por Integrante (Desde Cero)

---

### INTEGRANTE 1: MIGUEL
**Rol:** Lider Tecnico (Tech Lead), Arquitecto de Software y Responsable del Nucleo Operativo ITSM (Seguridad, Incidentes, Solicitudes, Aprobaciones SoD y Motor SLA/OLA).

#### 3.1.1. Justificacion del Rol
Miguel posee el dominio completo de la arquitectura de FlowDesk, el diseno relacional en PostgreSQL y la configuracion de Next.js App Router. Por ello, asume el nucleo estructural del sistema (autenticacion, middleware de seguridad, enrutamiento `/plataforma`, conexion a base de datos, maquina de estados de tickets, segregacion de funciones en aprobaciones y calculo matematico de SLA/OLA), ademas de ser el responsable de aprobar e integrar los Pull Requests (`PR`) de sus 4 companeros en la rama `main`.

#### 3.1.2. Carpetas y Archivos Exclusivos en el Codigo Fuente (`src/`)
```text
├── database/
│   ├── schema.sql                                         # Esquema maestro PostgreSQL (35+ tablas)
│   └── seed.sql                                           # Datos semilla e inicializacion de roles y catalogos
├── next.config.js                                         # Rewrites transparentes de URLs hacia /plataforma
├── tsconfig.json                                          # Configuracion de alias @/* y tipado estricto
├── src/
│   ├── middleware.ts                                      # Guard de seguridad Edge y proteccion de rutas
│   ├── shared/
│   │   ├── lib/
│   │   │   ├── conexionBaseDatos.ts                       # Pool de conexiones PostgreSQL (pg)
│   │   │   ├── autenticacionJwt.ts                        # Firma/verificacion JWT (jose) y Bcrypt
│   │   │   ├── controlPermisos.ts                         # Matriz RBAC de 9 roles ITSM
│   │   │   └── clienteHttp.ts                             # Wrapper HTTP con manejo de sesion
│   │   └── types/
│   │       └── tiposGlobales.ts                           # Contratos e interfaces base del sistema
│   ├── modules/
│   │   ├── seguridad/                                     # Dominio de Autenticacion y Sesiones
│   │   │   ├── components/
│   │   │   │   ├── FormularioInicioSesion.tsx
│   │   │   │   └── GuardiaRutaRol.tsx
│   │   │   ├── services/
│   │   │   │   └── servicioAutenticacion.ts
│   │   │   ├── repositories/
│   │   │   │   └── repositorioSesiones.ts
│   │   │   └── types/
│   │   │       └── tiposSeguridad.ts
│   │   ├── tickets/                                       # Dominio Nucleo de Incidentes, Solicitudes y Aprobaciones
│   │   │   ├── components/
│   │   │   │   ├── TablaBandejaTickets.tsx
│   │   │   │   ├── DetalleTicketVista.tsx
│   │   │   │   ├── CronologiaTicket.tsx
│   │   │   │   ├── ModalDerivacionTicket.tsx
│   │   │   │   └── PanelAprobacionGestor.tsx
│   │   │   ├── services/
│   │   │   │   ├── servicioCicloTicket.ts
│   │   │   │   ├── servicioPrioridadMatriz.ts
│   │   │   │   └── servicioAprobacionSod.ts
│   │   │   ├── repositories/
│   │   │   │   ├── repositorioTickets.ts
│   │   │   │   └── repositorioComentarios.ts
│   │   │   └── types/
│   │   │       └── tiposTickets.ts
│   │   └── nivelesServicio/                               # Dominio de Acuerdos SLA, OLA y Horarios Laborales
│   │       ├── components/
│   │       │   ├── RelojSlaIndicador.tsx
│   │       │   └── ConfiguradorMatrizSla.tsx
│   │       ├── services/
│   │       │   └── servicioCalculoSla.ts
│   │       ├── repositories/
│   │       │   └── repositorioAcuerdosSla.ts
│   │       └── types/
│   │           └── tiposNivelesServicio.ts
│   └── app/
│       ├── login/page.tsx                                 # Vista de Inicio de Sesion
│       ├── plataforma/
│       │   ├── panel/page.tsx                             # Dashboard Operativo Principal
│       │   ├── tickets/
│       │   │   ├── page.tsx                               # Bandeja General y Cola de Tickets
│       │   │   └── [id]/page.tsx                          # Expediente Completo del Ticket y Bitacora
│       │   └── aprobaciones/page.tsx                      # Bandeja de Aprobaciones de Gestor de Area
│       └── api/
│           ├── auth/
│           │   ├── login/route.ts
│           │   ├── logout/route.ts
│           │   └── me/route.ts
│           ├── dashboard/route.ts
│           ├── tickets/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       ├── comments/route.ts
│           │       └── approval/route.ts
│           └── sla/route.ts
```

#### 3.1.3. Historias de Usuario (HU), Requerimientos Funcionales (RF) y Reglas de Negocio (RN) de Miguel
- **Bloques de la Matriz:**
  - **Bloque I:** Seguridad, Autenticacion y Control de Accesos (Funciones 1 a 8).
  - **Bloque III:** Configuracion de Acuerdos de Nivel de Servicio SLA y OLA (Funciones 15 a 19).
  - **Bloque V (Nucleo):** Creacion de Tickets de Incidente y Solicitud, calculo automatico de prioridad Impacto x Urgencia y deteccion de Incidentes Mayores P1 (Funciones 25, 26, 28, 30, 31).
  - **Bloque VI:** Flujo de Aprobaciones Jerarquicas y Segregacion de Funciones SoD (Funciones 32 a 38).
  - **Bloque VII:** Gestion de Colas, Asignacion, Derivacion y Balanceo de Carga (Funciones 39 a 46).
  - **Bloque VIII:** Atencion Tecnica, Bitacora Dual (Publica/Interna), Pausas de SLA y Resolucion (Funciones 47 a 54).
  - **Bloque XVII:** Motor de Monitoreo SLA en Tiempo Real y Escalamientos Automaticos (Funciones 115 a 121).
- **Historias de Usuario (16):**
  - `HU-01`: Inicio de sesion seguro en el sistema.
  - `HU-02`: Cierre de sesion seguro.
  - `HU-06`: Configuracion de tiempos de respuesta y resolucion (SLA).
  - `HU-07`: Creacion y registro de tickets de soporte.
  - `HU-11`: Seguimiento del estado e historial de tickets propios.
  - `HU-14`: Asignacion y derivacion de tickets a tecnicos.
  - `HU-15`: Reasignacion de tickets por sobrecarga o ausencia.
  - `HU-16`: Visualizacion de bandeja de tickets asignados al tecnico.
  - `HU-17`: Cambio de estados del ticket durante la atencion.
  - `HU-18`: Registro de comentarios publicos y notas tecnicas internas.
  - `HU-19`: Escalamiento de tickets complejos a segundo nivel o especialista.
  - `HU-20`: Documentacion de la solucion tecnica al resolver el ticket.
  - `HU-21`: Aprobacion o rechazo de solicitudes de servicio por el Gestor de Area.
  - `HU-25`: Monitoreo de alertas de vencimiento de SLA en tiempo real.
  - `HU-33`: Pausado automatico del reloj SLA en estado "En Espera del Usuario".
  - `HU-36`: Deteccion y declaracion de Incidente Mayor (Prioridad Critica P1).
- **Requerimientos Funcionales (16):**
  - `RF-01` (Autenticacion de usuarios), `RF-02` (Cierre de sesion), `RF-07` (Parametrizacion de SLA), `RF-08` (Registro de tickets), `RF-12` (Consulta de estado e historial), `RF-15` (Asignacion manual y derivacion), `RF-16` (Reasignacion de tickets), `RF-17` (Bandeja de trabajo del tecnico), `RF-18` (Actualizacion de estados), `RF-19` (Bitacora de comunicacion publica y privada), `RF-20` (Escalamiento funcional y jerarquico), `RF-21` (Registro de diagnostico y solucion), `RF-22` (Flujo de aprobacion o rechazo por Gestor de Area), `RF-26` (Semaforizacion y alertas de SLA), `RF-33` (Suspension temporal del cronometro SLA), `RF-36` (Protocolo de Incidente Mayor P1).
- **Reglas de Negocio (22):**
  - `RN-01` (Acceso exclusivo autenticado), `RN-03` (Restriccion de vistas por perfil RBAC), `RN-06` (Clasificacion obligatoria e impacto/urgencia), `RN-07` (Calculo automatico de prioridad y SLA), `RN-10` (Trazabilidad completa de estados), `RN-11` (Asignacion exclusiva a tecnicos activos del area), `RN-12` (Justificacion obligatoria en reasignaciones), `RN-14` (Flujo secuencial valido de estados), `RN-15` (Privacidad de notas internas para el solicitante), `RN-16` (Motivo obligatorio en escalamientos), `RN-17` (Solucion documentada obligatoria para resolver), `RN-18` (Bloqueo de atencion hasta aprobacion del gestor), `RN-19` (Sustento obligatorio en rechazo de solicitud), `RN-20` (Semaforo SLA: Verde <75%, Amarillo 75-99%, Rojo >=100%), `RN-21` (Inmutabilidad de tickets cerrados), `RN-22` (Pausa de reloj SLA por espera de informacion del solicitante), `RN-23` (Reactivacion automatica de SLA al responder el solicitante), `RN-24` (Auto-cierre por inactividad tras resolucion), `RN-28` (Segregacion de Funciones SoD: el solicitante no puede auto-aprobar su ticket), `RN-31` (Contabilizacion de SLA solo en horario habil laboral), `RN-32` (Alerta temprana al Supervisor al alcanzar 75% del SLA), `RN-33` (Escalamiento inmediato en Incidentes Mayores P1).

#### 3.1.4. Que debe programar Miguel (Checklist End-to-End: Construido + Pendiente)
1. **Infraestructura, Base de Datos y Seguridad (Construido / Mantenimiento):**
   - Esquema relacional `database/schema.sql` y datos semilla `database/seed.sql`.
   - Middleware de autenticacion JWT (`src/middleware.ts`), login/logout (`src/app/api/auth/*`) y vista `src/app/login/page.tsx`.
   - Rewrites de rutas limpias en `next.config.js` hacia `src/app/plataforma/*`.
2. **Motor de Tickets, Colas y Aprobaciones (Construido + Refactorizacion a `src/modules/tickets/`):**
   - Bandeja general de tickets (`src/app/plataforma/tickets/page.tsx`), vista de detalle (`src/app/plataforma/tickets/[id]/page.tsx`) y bandeja de aprobaciones (`src/app/plataforma/aprobaciones/page.tsx`).
   - Validacion estricta de Segregacion de Funciones (`RN-28`): impedir en el endpoint `POST /api/tickets/[id]/approval` que `approver_id === requester_id`.
   - Validacion de maquina de estados (`RN-14`, `RN-17`): exigir nota de solucion tecnica antes de pasar a `Resuelto`.
3. **Motor Avanzado de SLA/OLA y Pausas de Reloj (Por completar / Profundizar en `src/modules/nivelesServicio/`):**
   - Implementar `servicioCalculoSla.ts` que calcule el porcentaje consumido del SLA descontando los intervalos de pausa en la tabla `sla_pauses` (`HU-33`, `RN-22`, `RN-23`) y considerando el calendario de horario laboral (`RN-31`).
   - Crear el endpoint `GET /api/sla` y `PUT /api/sla` para que el Administrador o Service Level Manager configure tiempos de respuesta/resolucion (`HU-06`) y visualizar el semaforo en vivo (Verde/Amarillo/Rojo) en la bandeja de tickets (`HU-25`).

---

### INTEGRANTE 2: LOURDES (LU)
**Rol:** Lider de Frontend (UI/UX Design System) y Responsable de Experiencia del Usuario, Catalogo de Servicios, Formularios Dinamicos, Encuestas CSAT y Notificaciones.

#### 3.2.1. Justificacion del Rol
Lourdes tiene a su cargo dos pilares fundamentales que se complementan de forma natural:
1. **El Sistema de Diseno y Layout Global (Frontend Transversal):** Es duena de `src/shared/components/` (Sidebar dinamico por rol, Header con buscador y campana de alertas, Modales, Tablas reutilizables, Badges de estado y estilos globales en `globals.css`).
2. **Los Modulos Funcionales de Interaccion Directa con el Usuario (`catalogo`, `encuestas`, `notificaciones`):** Como todos usaran asistentes de IA, encargarse solo de estilos seria insuficiente; por ello, Lourdes tambien programa de principio a fin el **Catalogo de Servicios y Categorias**, los **Formularios Dinamicos de Solicitud**, la **Validacion/Reapertura y Encuesta de Satisfaccion (CSAT)** y el **Centro de Notificaciones Multicanal**.

#### 3.2.2. Carpetas y Archivos Exclusivos en el Codigo Fuente (`src/`)
```text
├── src/
│   ├── app/
│   │   ├── globals.css                                    # Variables CSS, Sistema de Diseno Dark/Glassmorphism
│   │   ├── layout.tsx                                     # Layout Raiz y Tipografia Inter
│   │   ├── plataforma/
│   │   │   ├── layout.tsx                                 # Shell Principal (Sidebar + Barra Superior + Alertas)
│   │   │   ├── catalogo/page.tsx                          # Administracion y Explorador del Catalogo de Servicios
│   │   │   ├── tickets/
│   │   │   │   └── nuevo/page.tsx                         # Wizard de Creacion con Formularios Dinamicos y Adjuntos
│   │   │   └── encuestas/page.tsx                         # Bandeja de Evaluacion CSAT y Cierre/Reapertura
│   │   └── api/
│       │   ├── catalog/
│       │   │   ├── route.ts                               # CRUD de Categorias, Subcategorias y Servicios
│       │   │   └── fields/route.ts                        # Esquema JSON de Campos Dinamicos por Servicio
│       │   ├── surveys/route.ts                           # Registro y consulta de Encuestas CSAT (1 a 5 estrellas)
│       │   └── notifications/route.ts                     # Bandeja de notificaciones en campana y lectura
│   ├── shared/
│   │   ├── components/
│   │   │   ├── BarraLateralNavegacion.tsx                 # Menu lateral adaptable a los 9 perfiles ITSM
│   │   │   ├── BarraSuperiorUsuario.tsx                   # Header con selector de estado, campana y perfil
│   │   │   ├── InsigniaEstadoTicket.tsx                   # Badges semanticos para estados y prioridades
│   │   │   ├── ModalConfirmacionAccion.tsx                # Modal accesible reutilizable
│   │   │   └── TarjetaIndicadorMetrica.tsx                # KPI Card reutilizable con micro-animaciones
│   │   └── hooks/
│   │       ├── useNotificaciones.ts                       # Polling/estado de alertas no leidas
│   │       └── useFormularioDinamico.ts                   # Renderizador reactivo de campos segun servicio
│   └── modules/
│       ├── catalogo/                                      # Dominio del Catalogo de Servicios de TI
│       │   ├── components/
│       │   │   ├── ExploradorTarjetasServicio.tsx
│       │   │   ├── FormularioServicioAdmin.tsx
│       │   │   ├── RenderizadorCamposDinamicos.tsx
│       │   │   └── CargadorArchivosAdjuntos.tsx
│       │   ├── services/
│       │   │   └── servicioCatalogo.ts
│       │   ├── repositories/
│       │   │   └── repositorioCatalogo.ts
│       │   └── types/
│       │       └── tiposCatalogo.ts
│       ├── encuestas/                                     # Dominio de Satisfaccion CSAT y Reapertura
│       │   ├── components/
│       │   │   ├── FormularioEncuestaCsat.tsx
│       │   │   ├── ModalReaperturaTicket.tsx
│       │   │   └── ResumenCalificacionesTecnico.tsx
│       │   ├── services/
│       │   │   └── servicioEncuestas.ts
│       │   ├── repositories/
│       │   │   └── repositorioEncuestas.ts
│       │   └── types/
│       │       └── tiposEncuestas.ts
│       └── notificaciones/                                # Dominio de Alertas Internas y Multicanal
│           ├── components/
│           │   ├── DesplegableCampanaAlertas.tsx
│           │   └── ListaHistorialNotificaciones.tsx
│           ├── services/
│           │   └── servicioNotificaciones.ts
│           ├── repositories/
│           │   └── repositorioNotificaciones.ts
│           └── types/
│               └── tiposNotificaciones.ts
```

#### 3.2.3. Historias de Usuario (HU), Requerimientos Funcionales (RF) y Reglas de Negocio (RN) de Lourdes
- **Bloques de la Matriz:**
  - **Bloque II:** Gestion del Catalogo de Servicios y Categorias (Funciones 9 a 14).
  - **Bloque IV:** Portal del Solicitante y Experiencia de Autoservicio (Funciones 20 a 24).
  - **Bloque V (Formularios y Adjuntos):** Renderizado de campos dinamicos por servicio y validacion de archivos adjuntos de evidencia (Funciones 27 y 29).
  - **Bloque IX:** Validacion de Solucion por el Solicitante y Reapertura de Tickets (Funciones 55 a 59).
  - **Bloque X:** Evaluacion de la Satisfaccion del Usuario CSAT (Funciones 60 a 63).
  - **Bloque XVIII:** Sistema de Notificaciones Internas y Alertas Multicanal (Funciones 122 a 126).
- **Historias de Usuario (11):**
  - `HU-03`: Administracion del catalogo de categorias y servicios de TI.
  - `HU-09`: Carga de capturas de pantalla o documentos adjuntos en el ticket.
  - `HU-10`: Busqueda de soluciones rapidas y vista de autoservicio antes de crear un ticket.
  - `HU-22`: Notificaciones automaticas al usuario sobre cambios en su ticket.
  - `HU-23`: Calificacion de la atencion recibida mediante encuesta de satisfaccion (CSAT).
  - `HU-24`: Reapertura de un ticket resuelto cuando la falla persiste.
  - `HU-26`: Alertas inmediatas al tecnico cuando recibe un nuevo ticket o comentario.
  - `HU-28`: Visualizacion del desempeno y calificaciones promedio de satisfaccion.
  - `HU-30`: Diseno responsivo y accesible desde dispositivos moviles y escritorio.
  - `HU-34`: Formularios dinamicos personalizados segun el servicio solicitado.
  - `HU-35`: Vinculacion de tickets hijos a un ticket padre (UI de agrupacion en el formulario/vista).
- **Requerimientos Funcionales (11):**
  - `RF-03` (Gestion del catalogo de servicios), `RF-10` (Adjuntar archivos de evidencia), `RF-11` (Interfaz de sugerencias de autoayuda en el wizard de nuevo ticket), `RF-23` (Notificaciones al solicitante), `RF-24` (Encuesta de satisfaccion CSAT), `RF-25` (Reapertura de tickets no conformes), `RF-27` (Alertas operativas para tecnicos), `RF-29` (Tablero de metricas CSAT), `RF-30` (Interfaz web responsiva), `RF-34` (Campos dinamicos por item de catalogo), `RF-35` (Asociacion visual Padre-Hijo en incidentes masivos).
- **Reglas de Negocio (7):**
  - `RN-09` (Restriccion de formato y tamano maximo de archivos adjuntos: PDF, PNG, JPG, DOCX hasta 10 MB), `RN-13` (Notificacion obligatoria en cada transicion clave), `RN-25` (Plazo maximo de 3 a 5 dias habiles para reabrir un ticket resuelto), `RN-26` (Una unica encuesta CSAT permitida por cada ticket cerrado), `RN-27` (Comentario justificatorio obligatorio cuando la calificacion CSAT es de 1 o 2 estrellas), `RN-29` (Visibilidad en el portal limitada exclusivamente a servicios con estado Activo), `RN-41` (Validacion de campos dinamicos obligatorios antes de enviar la solicitud).

#### 3.2.4. Que debe programar Lourdes (Checklist End-to-End: Construido + Pendiente)
1. **Sistema de Diseno, Layout Responsivo y Navegacion (Construido + Mejora Continua):**
   - Mantener y pulir `src/app/globals.css` y `src/app/plataforma/layout.tsx` asegurando adaptabilidad movil de 360px a 1920px (`HU-30`, `RNF-04`).
   - Extraer los componentes visuales reutilizables dentro de `src/shared/components/` para que todos los modulos mantengan uniformidad estetica.
2. **Catalogo de Servicios (30 servicios ITIL) y Formularios Dinamicos (`src/modules/catalogo/`):**
   - Vista `src/app/plataforma/catalogo/page.tsx` y API `src/app/api/catalog/route.ts` para crear, editar y activar/desactivar categorias y servicios (`HU-03`, `RN-29`).
   - En `src/app/plataforma/tickets/nuevo/page.tsx`, implementar `RenderizadorCamposDinamicos.tsx` que lee la tabla `catalog_custom_fields` del servicio elegido y exige completar los campos especificos (`HU-34`, `RN-41`), ademas del validador de archivos adjuntos (`HU-09`, `RN-09`).
3. **Encuestas CSAT, Reapertura y Centro de Notificaciones (`src/modules/encuestas/` y `notificaciones/`):**
   - Construir el flujo de confirmacion del solicitante: cuando un ticket esta en estado `Resuelto`, mostrar al solicitante dos botones claros: **"Confirmar Solucion y Calificar (CSAT)"** (`HU-23`) o **"Rechazar Solucion y Reabrir Ticket"** (`HU-24`, `RN-25`).
   - En el modal de encuesta CSAT (1 a 5 estrellas), obligar a escribir el motivo si elige 1 o 2 estrellas (`RN-27`) e impedir votar dos veces (`RN-26`).
   - Implementar la campana interactiva de notificaciones en la barra superior conectada a `GET/PATCH /api/notifications` (`HU-22`, `HU-26`, `RN-13`).

---

### INTEGRANTE 3: ALEXIS
**Rol:** Desarrollador del Dominio de Gestion de Problemas (ITIL Problem Management), Analisis de Causa Raiz (RCA), Errores Conocidos (KEDB) y Base de Conocimiento (Knowledge Management).

#### 3.3.1. Justificacion del Rol
En ITIL 4, la **Gestion de Problemas** y la **Gestion del Conocimiento** trabajan estrechamente unidas: cuando se repiten incidentes, se investiga la Causa Raiz (RCA), se documenta un Error Conocido con su solucion temporal (*Workaround*) en la KEDB y finalmente se publica un articulo en la Base de Conocimiento para evitar futuros tickets. Asignar ambos modulos a Alexis le otorga un dominio completo, altamente especializado y 100% independiente en Git.

#### 3.3.2. Carpetas y Archivos Exclusivos en el Codigo Fuente (`src/`)
```text
├── src/
│   ├── modules/
│   │   ├── problemas/                                     # Dominio de Gestion de Problemas, RCA y KEDB
│   │   │   ├── components/
│   │   │   │   ├── BandejaProblemasTabla.tsx
│   │   │   │   ├── FormularioAnalisisCausaRaiz.tsx
│   │   │   │   ├── CatalogoErroresConocidosKedb.tsx
│   │   │   │   └── ModalVincularIncidentesProblema.tsx
│   │   │   ├── services/
│   │   │   │   ├── servicioProblemas.ts
│   │   │   │   └── servicioKedb.ts
│   │   │   ├── repositories/
│   │   │   │   └── repositorioProblemas.ts
│   │   │   └── types/
│   │   │       └── tiposProblemas.ts
│   │   └── conocimiento/                                  # Dominio de Base de Conocimiento y Flujo Editorial
│   │       ├── components/
│   │       │   ├── ExploradorArticulosKb.tsx
│       │   │   ├── EditorArticuloConocimiento.tsx
│       │   │   ├── BandejaRevisionEditorial.tsx
│       │   │   └── VotacionUtilidadArticulo.tsx
│       │   ├── services/
│       │   │   └── servicioConocimiento.ts
│       │   ├── repositories/
│       │   │   └── repositorioConocimiento.ts
│       │   └── types/
│       │       └── tiposConocimiento.ts
│   └── app/
│       ├── plataforma/
│       │   ├── problemas/
│       │   │   ├── page.tsx                               # Gestion de Problemas, RCA y Pestana KEDB
│       │   │   └── [id]/page.tsx                          # Expediente Detallado del Problema e Incidentes Asociados
│       │   └── conocimiento/
│       │       ├── page.tsx                               # Portal de Base de Conocimiento, Editor y Aprobacion Editorial
│       │       └── [id]/page.tsx                          # Lector de Articulo KB, Workaround y Votacion Util/No Util
│       └── api/
│           ├── problems/
│           │   ├── route.ts                               # Listado y creacion de Problemas / KEDB
│           │   └── [id]/
│           │       ├── route.ts                           # Actualizacion de RCA, estado del problema y Workaround
│           │       └── incidents/route.ts                 # Vinculacion N:M entre Problemas e Incidentes recurrentes
│           └── kb/
│               ├── route.ts                               # Busqueda indexada y creacion de articulos KB
│               └── [id]/
│                   ├── route.ts                           # Flujo editorial (Borrador -> En Revision -> Publicado)
│                   └── vote/route.ts                      # Registro de votos Util / No Util y contador de vistas
```

#### 3.3.3. Historias de Usuario (HU), Requerimientos Funcionales (RF) y Reglas de Negocio (RN) de Alexis
- **Bloques de la Matriz:**
  - **Bloque XI:** Gestion de Problemas, Analisis de Causa Raiz (RCA) y Base de Errores Conocidos (KEDB) (Funciones 64 a 71).
  - **Bloque XVI:** Gestion del Conocimiento (Knowledge Management), Ciclo Editorial y Autoayuda (Funciones 107 a 114).
- **Historias de Usuario Asignadas:**
  - `HU-32`: Registro y gestion de Problemas a partir de incidentes recurrentes.
  - `HU-43`: Documentacion de Analisis de Causa Raiz (RCA) y registro en la Base de Datos de Errores Conocidos (KEDB) con soluciones temporales (*Workarounds*).
  - `HU-44`: Creacion, revision editorial, publicacion y valoracion de articulos en la Base de Conocimiento.
  - Co-responsable del motor de busqueda de `HU-10` (API de sugerencia automatica de articulos publicados por palabras clave).
- **Requerimientos Funcionales Asignados:**
  - `RF-32` (Identificacion y apertura de expedientes de Problema vinculados a multiples tickets de incidente).
  - `RF-43` (Gestion de Causa Raiz RCA, catalogacion en KEDB y difusion de *Workarounds* para los tecnicos de Nivel 1 y Nivel 2).
  - `RF-44` (Flujo editorial de Base de Conocimiento: Borrador, Revision por Gestor de Conocimiento, Publicacion, Archivo y retroalimentacion de utilidad).
- **Reglas de Negocio Asignadas:**
  - `RN-37`: Un Problema solo puede pasar a estado "Error Conocido (KEDB)" o "Resuelto" cuando tiene documentado obligatoriamente el Analisis de Causa Raiz (RCA) y al menos una solucion temporal (*Workaround*) o Solicitud de Cambio (RFC) asociada.
  - `RN-40`: Ningun articulo redactado por un Tecnico en la Base de Conocimiento es visible para los Solicitantes mientras permanezca en estado `Borrador` o `En Revision`; requiere aprobacion formal para pasar a `Publicado`.

#### 3.3.4. Que debe programar Alexis (Checklist End-to-End: Construido + Pendiente)
1. **Modulo de Gestion de Problemas y KEDB (`src/modules/problemas/` y `src/app/plataforma/problemas/`):**
   - Vista principal de Problemas con filtros por estado (`Identificado`, `En Investigacion RCA`, `Error Conocido KEDB`, `Resuelto`, `Cerrado`).
   - Implementar la vinculacion de multiples tickets de incidentes recurrentes a un Problema (`problem_incidents`) mostrando cuantos incidentes originaron el problema (`HU-32`).
   - Implementar el formulario estructurado de **Analisis de Causa Raiz (Metodo de los 5 Porques / Ishikawa)** y el registro de **Solucion Temporal (Workaround)** en la tabla `known_errors_kedb` (`HU-43`, `RN-37`).
2. **Modulo de Base de Conocimiento y Flujo Editorial (`src/modules/conocimiento/` y `src/app/plataforma/conocimiento/`):**
   - Construir el flujo de estados del articulo (`Borrador` -> `En Revision` -> `Publicado` -> `Archivado`) validando la regla `RN-40` segun el rol del usuario.
   - Implementar el sistema de votacion ("¿Te resulto util este articulo? Si / No") y el contador de visualizaciones en `POST /api/kb/[id]/vote` (`HU-44`).
   - Conectar un boton directo desde un Error Conocido (KEDB) para **"Generar Articulo de Conocimiento desde este Workaround"**.

---

### INTEGRANTE 4: NAIN
**Rol:** Desarrollador del Dominio de Habilitacion del Cambio (RFC / CAB / PIR) y Gestion de Activos de TI e Infraestructura (ITAM / CMDB / Proveedores).

#### 3.4.1. Justificacion del Rol
En la operacion de TI, cualquier cambio en la infraestructura (servidores, redes, software corporativo) requiere evaluar que Elementos de Configuracion (`CI`) de la CMDB se veran afectados, someter el Cambio (`RFC`) al Comite de Cambios (`CAB`), verificar que no exista una fecha de congelamiento (*Change Freeze*) y, tras ejecutarlo, realizar la Revision Post-Implementacion (`PIR`). Al asignar **Cambios (RFC)** y **Activos/CMDB** a Nain, ambos modulos quedan integrados bajo un mismo responsable sin tocar los archivos del resto del equipo.

#### 3.4.2. Carpetas y Archivos Exclusivos en el Codigo Fuente (`src/`)
```text
├── src/
│   ├── modules/
│   │   ├── cambios/                                       # Dominio de Habilitacion del Cambio (RFC, CAB, PIR)
│   │   │   ├── components/
│   │   │   │   ├── TablaSolicitudesCambio.tsx
│   │   │   │   ├── FormularioRegistroRfc.tsx
│   │   │   │   ├── PanelVotacionCab.tsx
│   │   │   │   ├── CalendarioVentanasCambio.tsx
│   │   │   │   └── FormularioRevisionPir.tsx
│   │   │   ├── services/
│   │   │   │   ├── servicioCambiosRfc.ts
│   │   │   │   ├── servicioComiteCab.ts
│   │   │   │   └── servicioVentanasCongelamiento.ts
│   │   │   ├── repositories/
│   │   │   │   └── repositorioCambios.ts
│   │   │   └── types/
│   │   │       └── tiposCambios.ts
│   │   └── activos/                                       # Dominio de Activos ITAM, Topologia CMDB y Proveedores
│   │       ├── components/
│   │       │   ├── TablaInventarioActivos.tsx
│   │       │   ├── FormularioElementoCmdb.tsx
│   │       │   ├── VisorRelacionesCmdb.tsx
│   │       │   ├── ControlLicenciasSoftware.tsx
│   │       │   └── DirectorioProveedoresContratos.tsx
│   │       ├── services/
│   │       │   ├── servicioActivosItam.ts
│   │       │   └── servicioTopologiaCmdb.ts
│   │       ├── repositories/
│   │       │   └── repositorioActivos.ts
│   │       └── types/
│   │           └── tiposActivos.ts
│   └── app/
│       ├── plataforma/
│       │   ├── cambios/
│       │   │   ├── page.tsx                               # Bandeja de RFCs, Calendario de Mantenimiento y CAB
│       │   │   └── [id]/page.tsx                          # Expediente del RFC, Plan de Rollback, Votos CAB y PIR
│       │   └── activos/
│       │       ├── page.tsx                               # Inventario ITAM (Hardware/Software), CMDB y Proveedores
│       │       └── [id]/page.tsx                          # Hoja de Vida del Activo, Historial de Tickets y Topologia
│       └── api/
│           ├── changes/
│           │   ├── route.ts                               # Listado y creacion de RFC (Estandar, Normal, Emergencia)
│           │   ├── calendar/route.ts                      # Ventanas de mantenimiento y periodos de Change Freeze
│           │   └── [id]/
│           │       ├── route.ts                           # Actualizacion de estado del RFC y ejecucion
│           │       ├── cab/route.ts                       # Emision de votos del Comite de Cambios (CAB)
│           │       └── pir/route.ts                       # Registro de Revision Post-Implementacion (PIR)
│           └── assets/
│               ├── route.ts                               # CRUD de Activos de TI (Hardware, Software, Licencias)
│               ├── suppliers/route.ts                     # Gestion de proveedores externos y garantias
│               └── [id]/
│                   ├── route.ts                           # Detalle del CI y asignacion a usuario/departamento
│                   └── relations/route.ts                 # Relaciones de dependencia entre CIs en la CMDB
```

#### 3.4.3. Historias de Usuario (HU), Requerimientos Funcionales (RF) y Reglas de Negocio (RN) de Nain
- **Bloques de la Matriz:**
  - **Bloque XII:** Habilitacion del Cambio (RFC: Estandar, Normal y de Emergencia) y Plan de Retorno (*Rollback*) (Funciones 72 a 79).
  - **Bloque XIII:** Comite Asesor de Cambios (CAB), Calendario de Mantenimiento, Congelamiento (*Change Freeze*) y Revision Post-Implementacion (PIR) (Funciones 80 a 87).
  - **Bloque XIV:** Gestion de Activos de TI (ITAM: Hardware, Software, Licencias y Ciclo de Vida) (Funciones 88 a 96).
  - **Bloque XV:** Base de Datos de Gestion de la Configuracion (CMDB), Relaciones entre CIs y Contratos de Proveedores (Funciones 97 a 106).
- **Historias de Usuario Asignadas (7):**
  - `HU-31`: Registro y gestion de Solicitudes de Cambio (RFC) clasificadas en Estandar, Normal y de Emergencia.
  - `HU-37`: Evaluacion de impacto, riesgo y votacion colegiada por el Comite Asesor de Cambios (CAB).
  - `HU-38`: Planificacion en el calendario de ventanas de mantenimiento y bloqueo por periodos de congelamiento (*Change Freeze*).
  - `HU-39`: Ejecucion de la Revision Post-Implementacion (PIR) antes de cerrar formalmente un cambio.
  - `HU-40`: Administracion del inventario de activos tecnologicos (Hardware, Software y control de licencias).
  - `HU-41`: Vinculacion del activo o Elemento de Configuracion (CI) afectado dentro del ticket o cambio.
  - `HU-42`: Visualizacion de relaciones de dependencia en la CMDB (Impacto Upstream/Downstream) y contratos de proveedores.
- **Requerimientos Funcionales Asignados (7):**
  - `RF-31` (Gestion de RFC y planes de implementacion/rollback), `RF-37` (Flujo de votacion del Comite CAB), `RF-38` (Calendario de cambios y validacion de *Change Freeze*), `RF-39` (Formulario y dictamen PIR), `RF-40` (Inventario ITAM y alertas de vencimiento de garantias/licencias), `RF-41` (Asociacion Activo-Ticket y hoja de vida de fallas por equipo), `RF-42` (Mapa de relaciones CMDB y gestion de proveedores terceros).
- **Reglas de Negocio Asignadas (5):**
  - `RN-34`: Ninguna Solicitud de Cambio (RFC) de tipo `Normal` o `Emergencia` puede enviarse a aprobacion ni ejecutarse si no cuenta con un **Plan de Retorno (Rollback)** y un **Analisis de Riesgo e Impacto** debidamente documentados.
  - `RN-35`: Los cambios de tipo `Normal` requieren aprobacion por mayoria del Comite de Cambios (CAB) antes de su programacion; los cambios `Estandar` usan plantillas pre-aprobadas de bajo riesgo.
  - `RN-36`: Durante un periodo declarado de **Congelamiento de Cambios (Change Freeze)** (ej. cierre contable o campanas criticas), el sistema bloquea la programacion de cambios `Normales` y solo permite cambios de `Emergencia` autorizados.
  - `RN-38`: Ningun RFC ejecutado puede pasar a estado `Cerrado` sin haber registrado previamente el acta de **Revision Post-Implementacion (PIR)** indicando si el cambio fue exitoso, parcial o requirio Rollback.
  - `RN-39`: Todo activo dado de baja (`Retirado` / `Decommissioned`) conserva su historial de tickets y mantenimientos por trazabilidad patrimonial, pero queda bloqueado para nuevas asignaciones a usuarios.

#### 3.4.4. Que debe programar Nain (Checklist End-to-End: Construido + Pendiente)
1. **Modulo de Habilitacion del Cambio, Comite CAB y PIR (`src/modules/cambios/` y `src/app/plataforma/cambios/`):**
   - Vista de gestion de RFCs con validacion obligatoria de Plan de Rollback (`RN-34`).
   - Panel de votacion del Comite CAB (`POST /api/changes/[id]/cab`) donde los miembros del CAB registran su voto (`Aprobar`, `Rechazar`, `Solicitar Ajustes`) con comentario (`HU-37`, `RN-35`).
   - Calendario de Ventanas de Cambio y validador de fechas de congelamiento (`change_freeze_periods`) que impide agendar un cambio Normal en dias bloqueados (`HU-38`, `RN-36`).
   - Modal y endpoint de Revision Post-Implementacion (`POST /api/changes/[id]/pir`) obligatorio antes de cerrar el RFC (`HU-39`, `RN-38`).
2. **Modulo de Inventario ITAM, CMDB y Proveedores (`src/modules/ activos/` y `src/app/plataforma/activos/`):**
   - Inventario completo de Hardware y Licencias de Software (`HU-40`, `RN-39`) con pestana de Proveedores y Garantias.
   - Visor de relaciones de dependencia entre Elementos de Configuracion (`asset_relationships`: "Depende de", "Aloja a", "Conectado a") para analizar el impacto en la CMDB (`HU-42`) e historial de tickets asociados a cada equipo (`HU-41`).

---

### INTEGRANTE 5: JUNIOR
**Rol:** Desarrollador de Administracion Organizacional e Identidades (Usuarios, Perfiles, Departamentos, Especialistas Tecnicos), Inteligencia de Negocios (Reportes Gerenciales / Exportacion) y Auditoria Forense.

#### 3.5.1. Justificacion del Rol
Junior es responsable de la columna vertebral administrativa y de gobierno corporativo de la plataforma:
1. **Administracion Organizacional:** Gestion de Cuentas de Usuario, Perfiles/Roles, Departamentos/Areas de la empresa y Especialistas Tecnicos (habilidades, niveles N1/N2/N3 y disponibilidad).
2. **Inteligencia de Negocios y Reportes Gerenciales:** Tablero analitico con metricas ITIL (MTTR, MTTA, cumplimiento SLA, carga por departamento) y motor de exportacion a CSV/Excel.
3. **Auditoria Forense Inmutable:** Bitacora de seguridad y trazabilidad inalterable para el rol de Auditor.
Todas estas carpetas (`usuarios`, `departamentos`, `tecnicos`, `reportes`, `auditoria`) son completamente independientes de los modulos operativos de sus otros 4 companeros.

#### 3.5.2. Carpetas y Archivos Exclusivos en el Codigo Fuente (`src/`)
```text
├── src/
│   ├── modules/
│   │   ├── usuarios/                                      # Dominio de Usuarios, Cuentas y Perfiles RBAC
│   │   │   ├── components/
│   │   │   │   ├── TablaDirectorioUsuarios.tsx
│   │   │   │   ├── FormularioGestionUsuario.tsx
│   │   │   │   └── SelectorPerfilPermisos.tsx
│   │   │   ├── services/
│   │   │   │   └── servicioUsuarios.ts
│   │   │   ├── repositories/
│   │   │   │   └── repositorioUsuarios.ts
│   │   │   └── types/
│   │   │       └── tiposUsuarios.ts
│   │   ├── departamentos/                                 # Dominio de Departamentos, Areas y Sedes
│   │   │   ├── components/
│   │   │   │   ├── TablaDepartamentosEmpresa.tsx
│   │   │   │   └── ModalAsignarJefeArea.tsx
│   │   │   ├── services/
│   │   │   │   └── servicioDepartamentos.ts
│   │   │   ├── repositories/
│   │   │   │   └── repositorioDepartamentos.ts
│   │   │   └── types/
│   │   │       └── tiposDepartamentos.ts
│   │   ├── tecnicos/                                      # Dominio de Especialistas Tecnicos, Niveles y Carga
│   │   │   ├── components/
│   │   │   │   ├── PanelCargaTecnicos.tsx
│   │   │   │   └── ConfiguradorEspecialidadTecnico.tsx
│   │   │   ├── services/
│   │   │   │   └── servicioTecnicos.ts
│   │   │   ├── repositories/
│   │   │   │   └── repositorioTecnicos.ts
│   │   │   └── types/
│   │   │       └── tiposTecnicos.ts
│   │   ├── reportes/                                      # Dominio de Reportes Gerenciales, KPIs y Exportacion
│   │   │   ├── components/
│   │   │   │   ├── TableroIndicadoresGerenciales.tsx
│   │   │   │   ├── GraficoCumplimientoSla.tsx
│   │   │   │   └── BotonExportarReporteCsv.tsx
│   │   │   ├── services/
│   │   │   │   ├── servicioReportesKpi.ts
│   │   │   │   └── servicioExportacionDatos.ts
│   │   │   ├── repositories/
│   │   │   │   └── repositorioReportes.ts
│   │   │   └── types/
│   │   │       └── tiposReportes.ts
│   │   └── auditoria/                                     # Dominio de Auditoria Forense Inmutable
│   │       ├── components/
│   │       │   ├── TablaBitacoraAuditoria.tsx
│   │       │   ├── FiltroAvanzadoAuditoria.tsx
│   │       │   └── VisorDiferenciasJson.tsx
│   │       ├── services/
│   │       │   └── servicioAuditoria.ts
│   │       ├── repositories/
│   │       │   └── repositorioAuditoria.ts
│   │       └── types/
│   │           └── tiposAuditoria.ts
│   └── app/
│       ├── plataforma/
│       │   ├── usuarios/page.tsx                          # Administracion de Usuarios y Estado Activo/Inactivo
│       │   ├── perfiles/page.tsx                          # Matriz visual de Roles y Permisos del Sistema
│       │   ├── departamentos/page.tsx                     # Gestion de Departamentos, Presupuesto y Gestores de Area
│       │   ├── tecnicos/page.tsx                          # Gestion de Tecnicos, Niveles N1/N2/N3 y Capacidad Maxima
│       │   ├── reportes/page.tsx                          # Inteligencia de Negocios, KPIs y Exportacion CSV/Excel
│       │   └── auditoria/page.tsx                         # Consola de Auditoria Forense de Solo Lectura
│       └── api/
│           ├── users/
│           │   ├── route.ts                               # Listado y creacion de usuarios con hash de contrasena
│           │   └── [id]/route.ts                          # Edicion de rol, departamento y baja logica (RN-02)
│           ├── profiles/route.ts                          # Consulta de perfiles y matriz de permisos
│           ├── departments/route.ts                       # CRUD de departamentos y asignacion de Gestor de Area
│           ├── technicians/route.ts                       # Configuracion de especialistas, skills y disponibilidad
│           ├── reports/
│           │   ├── route.ts                               # Agregaciones SQL para KPIs (MTTR, SLA, Volumen)
│           │   └── export/route.ts                        # Generacion de archivo descargable CSV/Excel
│           └── audit/route.ts                             # Consulta paginada e inmutable de audit_logs
```

#### 3.5.3. Historias de Usuario (HU), Requerimientos Funcionales (RF) y Reglas de Negocio (RN) de Junior
- **Bloques de la Matriz:**
  - **Bloque XIX:** Administracion de Usuarios, Perfiles, Departamentos y Especialistas Tecnicos (Funciones 127 a 133).
  - **Bloque XX:** Inteligencia de Negocios, Reportes Gerenciales y Metricas Operativas (KPIs) (Funciones 134 a 139).
  - **Bloque XXI:** Auditoria Forense, Trazabilidad Inmutable y Cumplimiento Normativo (Funciones 140 a 144).
- **Historias de Usuario Asignadas (7):**
  - `HU-04`: Administracion de cuentas de usuarios y asignacion de roles.
  - `HU-05`: Gestion de departamentos, areas organizacionales y especialistas tecnicos.
  - `HU-08`: Consulta del directorio de usuarios e historial de tickets por departamento.
  - `HU-12`: Monitoreo de carga de trabajo de los tecnicos del equipo.
  - `HU-13`: Visualizacion de metricas y reportes gerenciales de atencion.
  - `HU-27`: Exportacion de reportes operativos y estadisticos a formatos de hoja de calculo (CSV/Excel).
  - `HU-29`: Consulta de la bitacora de auditoria inalterable sobre acciones criticas del sistema.
- **Requerimientos Funcionales Asignados (7):**
  - `RF-04` (Gestion de usuarios y baja logica), `RF-05` (Asignacion de perfiles y roles), `RF-06` (Gestion de departamentos y especialistas tecnicos), `RF-09` (Historial consolidado por usuario y area), `RF-13` (Tablero de carga operativa por tecnico), `RF-14` (Generacion de indicadores gerenciales KPIs), `RF-28` (Exportacion de datos a CSV/Excel y consulta de bitacora de auditoria).
- **Reglas de Negocio Asignadas (5):**
  - `RN-02`: **Prohibicion de eliminacion fisica de usuarios:** Ningun usuario con historial de tickets o acciones puede borrarse con `DELETE` de la base de datos; unicamente se permite la desactivacion logica (`is_active = false`) para preservar la integridad referencial.
  - `RN-04`: **Unicidad de correo institucional y documento:** El sistema impide registrar dos cuentas con el mismo correo electronico corporativo.
  - `RN-05`: **Asociacion obligatoria a un Departamento activo:** Todo usuario y todo tecnico debe pertenecer obligatoriamente a un departamento organizacional valido.
  - `RN-08`: **Disponibilidad y capacidad del tecnico:** Un tecnico marcado como `Ausente`/`Vacaciones` o que haya superado su limite maximo de tickets simultaneos no debe recibir asignaciones automaticas.
  - `RN-30`: **Inmutabilidad absoluta de la bitacora de auditoria:** Los registros de `audit_logs` son de tipo *append-only* (solo insercion y lectura); ningun rol (ni siquiera el Administrador) tiene endpoints para editar o eliminar registros de auditoria.

#### 3.5.4. Que debe programar Junior (Checklist End-to-End: Construido + Pendiente)
1. **Administracion de Usuarios, Perfiles, Departamentos y Tecnicos (`usuarios`, `departamentos`, `tecnicos`):**
   - Completar el CRUD en `src/app/plataforma/usuarios/page.tsx` y `src/app/api/users/*` aplicando `RN-02` (baja logica Activo/Inactivo sin borrado fisico) y `RN-04` (correo unico).
   - Implementar la creacion y edicion de Departamentos en `src/app/plataforma/departamentos/page.tsx` con selector de Jefe/Gestor de Area (`HU-05`, `RN-05`).
   - En `src/app/plataforma/tecnicos/page.tsx`, permitir configurar el nivel de soporte del tecnico (`N1`, `N2`, `N3`), sus especialidades y su estado de disponibilidad (`Disponible`, `Ocupado`, `Ausente`) (`HU-12`, `RN-08`).
2. **Inteligencia de Negocios y Exportacion CSV/Excel (`src/modules/reportes/`):**
   - En `src/app/plataforma/reportes/page.tsx`, construir filtros por rango de fechas, departamento y prioridad, calculando KPIs reales desde PostgreSQL (Tiempo Medio de Resolucion MTTR, % de SLA cumplido, tickets por estado) (`HU-13`).
   - Crear el endpoint `GET /api/reports/export` y el componente `BotonExportarReporteCsv.tsx` que descargue los reportes filtrados en formato `.csv` compatible con Microsoft Excel con codificacion UTF-8 BOM (`HU-27`, `RNF-01`).
3. **Auditoria Forense Inmutable (`src/modules/auditoria/`):**
   - En `src/app/plataforma/auditoria/page.tsx`, implementar buscador por usuario actor, entidad afectada (`tickets`, `users`, `changes`, `sla`), accion (`CREATE`, `UPDATE`, `APPROVE`, `LOGIN`) y visor comparativo de valores anteriores vs. nuevos (`old_values` / `new_values`), garantizando cero botones de edicion o borrado (`HU-29`, `RN-30`).

---

## 4. Metodologia Agil Scrum y Guia de Ceremonias (Solicitado por el Docente)

Dado que el equipo esta conformado por 5 integrantes que desarrollan modulos distintos en paralelo, el docente evalua la aplicacion real del marco de trabajo **Scrum**. A continuacion se establece la organizacion oficial de roles Scrum, Sprints y el formato de los **Daily Scrum (Reuniones Diarias)** que todos deben registrar.

### 4.1. Roles Scrum dentro del Equipo de 5 Personas
En Scrum, ademas de que los 5 integrantes son **Developers (Desarrolladores)**, las responsabilidades de gestion agil se asignan asi:
- **Scrum Master (Facilitador del Equipo y Guardian de Git/Scrum):** **Miguel** (modera los Daily Scrum, elimina impedimentos tecnicos de base de datos o arquitectura y supervisa la integracion de ramas).
- **Product Owner Interno (Representante del Backlog y Criterios de Aceptacion):** **Lourdes** (verifica que las vistas entregadas por todos cumplan las Historias de Usuario `HU-01` a `HU-44` y el estandar visual del sistema).
- **Equipo de Desarrollo (Developers):** **Miguel, Lourdes, Alexis, Nain y Junior**.

---

### 4.2. Planificacion de Sprints del Proyecto (Desde Cero hasta Entrega Final)

Para presentar al profesor una trazabilidad coherente desde el dia 1 del proyecto, el desarrollo completo se divide en **4 Sprints**:

| Sprint | Objetivo del Sprint (Sprint Goal) | Entregables de Miguel | Entregables de Lourdes | Entregables de Alexis | Entregables de Nain | Entregables de Junior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sprint 1: Cimientos, Identidades y Catalogo Base** | Levantar la arquitectura Next.js + PostgreSQL, autenticacion JWT, diseno base UI y catalogos maestros. | Esquema SQL base, conexion DB, Login JWT (`HU-01`, `HU-02`), Middleware RBAC (`RN-01`, `RN-03`). | Sistema de diseno CSS, Layout `/plataforma`, Sidebar dinamico (`HU-30`), Catalogo de Servicios (`HU-03`, `RN-29`). | Modelo de datos de Base de Conocimiento y vista inicial de articulos (`HU-44` base). | Modelo de datos de Activos ITAM y listado de inventario (`HU-40` base). | CRUD de Usuarios (`HU-04`, `RN-02`, `RN-04`), Perfiles y Departamentos (`HU-05`, `RN-05`). |
| **Sprint 2: Operacion Central de Tickets, Activos y Conocimiento** | Habilitar el flujo completo de Incidentes y Solicitudes con formularios dinamicos, activos vinculados y autoayuda. | Creacion y bandeja de tickets (`HU-07`, `HU-11`), Asignacion/Derivacion (`HU-14`, `HU-16`) y Bitacora (`HU-18`, `RN-15`). | Wizard de nuevo ticket con Campos Dinamicos (`HU-34`, `RN-41`), Adjuntos (`HU-09`, `RN-09`) y Sugerencias de Autoayuda (`HU-10`). | Flujo editorial de KB (`RN-40`), buscador indexado y votacion Util/No Util en articulos (`HU-44`). | Vinculacion de Activo/CI al ticket (`HU-41`), Hoja de vida del equipo y Proveedores (`HU-42`). | Gestion de Especialistas Tecnicos, niveles N1/N2/N3 y tablero de carga de trabajo (`HU-08`, `HU-12`, `RN-08`). |
| **Sprint 3: Gobierno ITIL (SLA, Aprobaciones, Problemas y Cambios)** | Implementar control de tiempos SLA/OLA, aprobaciones SoD, Gestion de Problemas (RCA/KEDB) y Cambios (RFC/CAB). | Flujo de Aprobaciones con validacion SoD (`HU-21`, `RN-18`, `RN-28`), Escalamientos (`HU-19`), Resolucion (`HU-20`, `RN-17`) e Incidente Mayor P1 (`HU-36`). | Flujo de Confirmacion o Reapertura de tickets por el solicitante (`HU-24`, `RN-25`) y Centro de Notificaciones (`HU-22`, `HU-26`). | Gestion de Problemas desde incidentes recurrentes (`HU-32`), Analisis de Causa Raiz (RCA) y Base de Errores Conocidos KEDB (`HU-43`, `RN-37`). | Solicitudes de Cambio RFC con Plan de Rollback (`HU-31`, `RN-34`), Votacion del Comite CAB (`HU-37`, `RN-35`) y Calendario *Change Freeze* (`HU-38`, `RN-36`). | Consola de Auditoria Forense inmutable con filtros por entidad y actor (`HU-29`, `RN-30`). |
| **Sprint 4: Metricas Avanzadas, CSAT, PIR y Cierre de Calidad** | Completar pausas de reloj SLA, encuestas CSAT, revision PIR de cambios, exportacion gerencial y pruebas integrales. | Pausas automaticas de reloj SLA (`HU-33`, `RN-22`, `RN-23`), configurador de matriz SLA (`HU-06`) y semaforo en vivo (`HU-25`, `RN-20`). | Encuestas de Satisfaccion CSAT de 1 a 5 estrellas (`HU-23`, `RN-26`, `RN-27`), metricas de calificacion (`HU-28`) y asociacion Padre-Hijo (`HU-35`). | Integracion directa KEDB -> Publicacion automatica de Workaround en KB y pruebas de regresion de Problemas. | Revision Post-Implementacion (PIR) obligatoria para cerrar RFCs (`HU-39`, `RN-38`) y grafo de relaciones CMDB (`HU-42`). | Tablero de Reportes Gerenciales KPIs (`HU-13`) y motor de exportacion a CSV/Excel (`HU-27`, `RNF-01`). |

---

### 4.3. Guia Completa del Daily Scrum (Reunion Diaria del Equipo)

#### ¿Que es el Daily Scrum y por que lo pide el profesor?
El **Daily Scrum** (o *Daily Standup*) es una reunion corta de sincronizacion (maximo **15 minutos**) que realiza el equipo de desarrollo todos los dias de trabajo. Como los 5 integrantes programan modulos distintos (`tickets`, `catalogo`, `problemas`, `cambios`, `reportes`), el Daily sirve para que todos sepan el avance global, coordinen conexiones entre modulos y detecten bloqueos a tiempo.

#### Estructura Obligatoria de cada Integrante en el Daily Scrum
Cada uno de los 5 integrantes debe responder obligatoriamente **3 preguntas concretas**, mencionando siempre el codigo de la **Historia de Usuario (`HU`)**, **Regla de Negocio (`RN`)** o **archivo/ruta** en el que estuvo trabajando:
1. **¿Que hice ayer / en la sesion anterior?** (Logros concretos terminados en su rama de Git).
2. **¿Que voy a hacer hoy / en esta sesion?** (Compromiso especifico de programacion antes del proximo Daily).
3. **¿Tengo algun impedimento o bloqueo tecnico?** (Dudas de base de datos, necesidad de un componente compartido de Lourdes o de un endpoint de Miguel).

---

### 4.4. Plantillas y Ejemplos Reales de Actas de Daily Scrum (Listas para Presentar al Profesor)

A continuacion tienes **3 actas completas de Daily Scrum** en distintas etapas del proyecto, redactadas con rigor tecnico para que el equipo las use como modelo en sus bitacoras o exposiciones:

#### ACTA DE DAILY SCRUM N.° 01 (Fase Inicial - Construccion de Cimientos y Modulos Base)
- **Fecha:** Lunes - Semana 1 del Sprint
- **Duracion:** 14 minutos
- **Participantes:** Miguel, Lourdes, Alexis, Nain, Junior.

| Integrante | 1. ¿Que hice en la sesion anterior? | 2. ¿Que hare en la sesion de hoy? | 3. ¿Que impedimentos o bloqueos tengo? |
| :--- | :--- | :--- | :--- |
| **Miguel** | Diseñe el esquema relacional en `database/schema.sql` y configure el pool de PostgreSQL en `src/shared/lib/conexionBaseDatos.ts`. | Programare el endpoint `POST /api/auth/login` con JWT y el `src/middleware.ts` para cumplir `HU-01`, `HU-02` y `RN-01`. | Ninguno. Ya deje listo el archivo `.env.example` para que todos conecten su base de datos local. |
| **Lourdes** | Defini las variables de color y tipografia en `src/app/globals.css` y estructure el layout principal en `src/app/plataforma/layout.tsx` (`HU-30`). | Construire la `BarraLateralNavegacion.tsx` filtrada por los 9 roles ITSM y comenzare la vista del Catalogo de Servicios en `src/app/plataforma/catalogo/page.tsx` (`HU-03`). | Necesito que Miguel confirme los nombres exactos de los 9 roles en el payload del JWT para filtrar el menu lateral sin errores. |
| **Alexis** | Revise la estructura de las tablas `knowledge_articles` y `problems` y cree las carpetas de mi dominio en `src/modules/conocimiento/` y `src/modules/problemas/`. | Programare el listado y buscador de articulos en `src/app/plataforma/conocimiento/page.tsx` y su API `GET /api/kb` (`HU-44`). | Ninguno por ahora. |
| **Nain** | Cree la estructura modular de `src/modules/activos/` y `src/modules/cambios/` con sus interfaces TypeScript en `tiposActivos.ts` y `tiposCambios.ts`. | Implementare el inventario de Hardware y Licencias en `src/app/plataforma/activos/page.tsx` conectado a `GET/POST /api/assets` (`HU-40`, `RN-39`). | Necesito coordinar con Junior el listado de departamentos para asignar cada activo de hardware a un departamento valido. |
| **Junior** | Estructure los modulos `src/modules/usuarios/` y `src/modules/departamentos/` y valide las consultas SQL de usuarios. | Programare el CRUD de Usuarios en `src/app/plataforma/usuarios/page.tsx` aplicando la regla `RN-02` (baja logica sin borrado fisico) y `RN-04` (correo unico) (`HU-04`). | Ninguno. Hoy subire el endpoint `GET /api/departments` para que Nain pueda consumirlo en su modulo de Activos. |

---

#### ACTA DE DAILY SCRUM N.° 02 (Fase Intermedia - Reglas de Negocio Criticas e Integracion)
- **Fecha:** Miercoles - Semana 2 del Sprint
- **Duracion:** 15 minutos
- **Participantes:** Miguel, Lourdes, Alexis, Nain, Junior.

| Integrante | 1. ¿Que hice en la sesion anterior? | 2. ¿Que hare en la sesion de hoy? | 3. ¿Que impedimentos o bloqueos tengo? |
| :--- | :--- | :--- | :--- |
| **Miguel** | Termine la bandeja de tickets (`HU-16`) y el calculo automatico de prioridad por matriz Impacto x Urgencia (`RN-06`, `RN-07`). | Implementare el flujo de aprobaciones del Gestor de Area en `src/app/api/tickets/[id]/approval/route.ts` validando la Segregacion de Funciones `RN-28` (`HU-21`). | Ninguno. |
| **Lourdes** | Complete el CRUD del Catalogo con los 30 servicios ITIL (`HU-03`, `RN-29`) y el componente `InsigniaEstadoTicket.tsx`. | Programare el renderizador de Formularios Dinamicos en `src/app/plataforma/tickets/nuevo/page.tsx` segun el servicio seleccionado (`HU-34`, `RN-41`) y la carga de adjuntos (`HU-09`, `RN-09`). | Necesito que Alexis me indique el parametro de busqueda de `GET /api/kb` para mostrar sugerencias de autoayuda (`HU-10`) mientras el usuario escribe el asunto del ticket. |
| **Alexis** | Implemente el flujo editorial de la Base de Conocimiento (`Borrador`, `En Revision`, `Publicado`) cumpliendo la regla `RN-40` (`HU-44`). | Habilitare el filtro `?search=` en `GET /api/kb` para el widget de autoayuda de Lourdes y empezare el registro de Problemas vinculados a incidentes recurrentes (`HU-32`). | Ninguno; coordino inmediatamente el parametro `?search=` con Lourdes. |
| **Nain** | Complete la vinculacion de activos a tickets (`HU-41`) y el registro inicial de Solicitudes de Cambio RFC (`HU-31`). | Programare la validacion obligatoria del Plan de Rollback (`RN-34`) y el panel de votacion del Comite de Cambios CAB en `POST /api/changes/[id]/cab` (`HU-37`, `RN-35`). | Ninguno. |
| **Junior** | Finalice la administracion de Departamentos y el panel de carga operativa de Especialistas Tecnicos (`HU-05`, `HU-12`, `RN-08`). | Construire la consola de Auditoria Forense en `src/app/plataforma/auditoria/page.tsx` asegurando que sea 100% inmutable y de solo lectura (`HU-29`, `RN-30`). | Ninguno. |

---

#### ACTA DE DAILY SCRUM N.° 03 (Fase Avanzada - SLA en Vivo, KEDB, PIR, CSAT y Exportacion BI)
- **Fecha:** Viernes - Semana 3 del Sprint
- **Duracion:** 13 minutos
- **Participantes:** Miguel, Lourdes, Alexis, Nain, Junior.

| Integrante | 1. ¿Que hice en la sesion anterior? | 2. ¿Que hare en la sesion de hoy? | 3. ¿Que impedimentos o bloqueos tengo? |
| :--- | :--- | :--- | :--- |
| **Miguel** | Implemente el protocolo de Incidente Mayor P1 (`HU-36`, `RN-33`) y la bitacora dual de comentarios publicos y notas internas (`HU-18`, `RN-15`). | Programare la pausa automatica del reloj SLA cuando el ticket pasa a "En Espera del Usuario" (`HU-33`, `RN-22`, `RN-23`) y el semaforo SLA en tiempo real (`HU-25`, `RN-20`). | Ninguno. |
| **Lourdes** | Deje operativo el centro de notificaciones en la campana superior (`HU-22`, `HU-26`, `RN-13`). | Implementare el flujo de Encuesta de Satisfaccion CSAT (`HU-23`, `RN-26`, `RN-27`) y el modal de Reapertura de tickets resueltos dentro del plazo de 5 dias (`HU-24`, `RN-25`). | Ninguno. |
| **Alexis** | Termine la vinculacion de incidentes a problemas (`HU-32`). | Programare el formulario de Analisis de Causa Raiz (RCA) y el catalogo de Errores Conocidos (KEDB) con *Workaround* obligatorio (`HU-43`, `RN-37`). | Ninguno. |
| **Nain** | Complete la validacion de fechas de congelamiento (*Change Freeze*) en el calendario de cambios (`HU-38`, `RN-36`). | Implementare el formulario de Revision Post-Implementacion (PIR) obligatorio antes de cerrar cualquier RFC (`HU-39`, `RN-38`) y el visor de relaciones CMDB (`HU-42`). | Ninguno. |
| **Junior** | Deje terminada la vista de Auditoria Forense (`HU-29`) y las consultas SQL de metricas gerenciales (`HU-13`). | Programare la exportacion de reportes gerenciales a archivo CSV/Excel en `src/modules/reportes/` cumpliendo un tiempo de descarga menor a 3.5 segundos (`HU-27`, `RNF-01`). | Ninguno. |

---

## 5. Protocolo de Trabajo en Git y Prompts para el Asistente de IA de cada Integrante

### 5.1. Reglas de Oro de Git para los 5 Integrantes
1. **Nadie hace `git push origin main` directamente**, excepto Miguel al integrar Pull Requests revisados.
2. **Cada integrante trabaja exclusivamente en su rama y en sus carpetas asignadas:**
   - **Miguel:** `git checkout -b feature/miguel-nucleo-tickets-sla`
   - **Lourdes:** `git checkout -b feature/lourdes-frontend-catalogo`
   - **Alexis:** `git checkout -b feature/alexis-problemas-conocimiento`
   - **Nain:** `git checkout -b feature/nain-cambios-activos-cmdb`
   - **Junior:** `git checkout -b feature/junior-admin-reportes-auditoria`
3. **Rutina diaria antes de programar con la IA:**
   ```bash
   git checkout main
   git pull origin main
   git checkout <tu-rama>
   git merge main
   ```
4. **Rutina al terminar una funcionalidad verificada (`npx tsc --noEmit` sin errores):**
   ```bash
   git add .
   git commit -m "feat(<modulo>): implementar <descripcion corta sin emojis>"
   git push origin <tu-rama>
   ```

---

### 5.2. Prompts Oficiales para que cada Integrante le entregue a su Asistente de IA

Cada companero debe copiar y pegar su respectivo prompt al iniciar sesion con su Asistente de IA. Esto garantiza que la IA de cada integrante conozca el proyecto completo pero **respete estrictamente las fronteras de archivos**:

#### Prompt para el Asistente de IA de MIGUEL:
> "Actua como Arquitecto de Software y Desarrollador Principal del proyecto FlowDesk ITSM. Primero lee `DOCUMENTACIÓN/ARQUITECTURA_Y_JERARQUIA_SRC.md`, `DOCUMENTACIÓN/DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md` y `DOCUMENTACIÓN/matriz_trazabilidad_funciones_hu_rf_rn.md`. Yo soy **Miguel**. Mi responsabilidad exclusiva abarca `src/modules/seguridad/`, `src/modules/tickets/`, `src/modules/nivelesServicio/`, `src/shared/lib/`, `src/middleware.ts`, `src/app/plataforma/panel/`, `src/app/plataforma/tickets/` (excepto `nuevo/page.tsx`), `src/app/plataforma/aprobaciones/` y sus rutas API (`/api/auth`, `/api/tickets`, `/api/sla`, `/api/dashboard`). No modifiques archivos de los modulos de Lourdes, Alexis, Nain ni Junior. No utilices emojis en ningun archivo ni comentario."

#### Prompt para el Asistente de IA de LOURDES (LU):
> "Actua como Lider de Frontend UI/UX y Desarrolladora Full-Stack del proyecto FlowDesk ITSM. Primero lee `DOCUMENTACIÓN/ARQUITECTURA_Y_JERARQUIA_SRC.md`, `DOCUMENTACIÓN/DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md` y `DOCUMENTACIÓN/matriz_trazabilidad_funciones_hu_rf_rn.md`. Yo soy **Lourdes**. Mi responsabilidad exclusiva abarca el Sistema de Diseno y componentes compartidos (`src/shared/components/`, `src/shared/hooks/`, `src/app/globals.css`, `src/app/plataforma/layout.tsx`) y los modulos funcionales `src/modules/catalogo/`, `src/modules/encuestas/`, `src/modules/notificaciones/`, junto con las vistas `src/app/plataforma/catalogo/`, `src/app/plataforma/tickets/nuevo/`, `src/app/plataforma/encuestas/` y las APIs `/api/catalog`, `/api/surveys` y `/api/notifications`. No modifiques archivos fuera de mis carpetas asignadas para evitar conflictos en Git. No utilices emojis en ningun archivo."

#### Prompt para el Asistente de IA de ALEXIS:
> "Actua como Desarrollador Full-Stack especialista en ITIL 4 del proyecto FlowDesk ITSM. Primero lee `DOCUMENTACIÓN/ARQUITECTURA_Y_JERARQUIA_SRC.md`, `DOCUMENTACIÓN/DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md` y `DOCUMENTACIÓN/matriz_trazabilidad_funciones_hu_rf_rn.md`. Yo soy **Alexis**. Mi responsabilidad exclusiva abarca los dominios de Gestion de Problemas (RCA y Base de Errores Conocidos KEDB) y Base de Conocimiento: `src/modules/problemas/`, `src/modules/conocimiento/`, las vistas `src/app/plataforma/problemas/` y `src/app/plataforma/conocimiento/`, y las rutas API `/api/problems` y `/api/kb`, cumpliendo `HU-32`, `HU-43`, `HU-44`, `RF-32`, `RF-43`, `RF-44`, `RN-37` y `RN-40`. No modifiques archivos fuera de mis carpetas asignadas para evitar conflictos en Git. No utilices emojis en ningun archivo."

#### Prompt para el Asistente de IA de NAIN:
> "Actua como Desarrollador Full-Stack especialista en ITIL 4 del proyecto FlowDesk ITSM. Primero lee `DOCUMENTACIÓN/ARQUITECTURA_Y_JERARQUIA_SRC.md`, `DOCUMENTACIÓN/DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md` y `DOCUMENTACIÓN/matriz_trazabilidad_funciones_hu_rf_rn.md`. Yo soy **Nain**. Mi responsabilidad exclusiva abarca los dominios de Habilitacion del Cambio (RFC, Comite CAB, Calendario Change Freeze y Revision Post-Implementacion PIR) y Gestion de Activos ITAM / CMDB: `src/modules/cambios/`, `src/modules/activos/`, las vistas `src/app/plataforma/cambios/` y `src/app/plataforma/activos/`, y las rutas API `/api/changes` y `/api/assets`, cumpliendo `HU-31`, `HU-37` a `HU-42`, `RF-31`, `RF-37` a `RF-42` y `RN-34`, `RN-35`, `RN-36`, `RN-38`, `RN-39`. No modifiques archivos fuera de mis carpetas asignadas para evitar conflictos en Git. No utilices emojis en ningun archivo."

#### Prompt para el Asistente de IA de JUNIOR:
> "Actua como Desarrollador Full-Stack especialista en Administracion, Inteligencia de Negocios y Auditoria del proyecto FlowDesk ITSM. Primero lee `DOCUMENTACIÓN/ARQUITECTURA_Y_JERARQUIA_SRC.md`, `DOCUMENTACIÓN/DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md` y `DOCUMENTACIÓN/matriz_trazabilidad_funciones_hu_rf_rn.md`. Yo soy **Junior**. Mi responsabilidad exclusiva abarca los dominios `src/modules/usuarios/`, `src/modules/departamentos/`, `src/modules/tecnicos/`, `src/modules/reportes/` y `src/modules/auditoria/`, las vistas `src/app/plataforma/usuarios/`, `perfiles/`, `departamentos/`, `tecnicos/`, `reportes/` y `auditoria/`, y las rutas API `/api/users`, `/api/profiles`, `/api/departments`, `/api/technicians`, `/api/reports` y `/api/audit`, cumpliendo `HU-04`, `HU-05`, `HU-08`, `HU-12`, `HU-13`, `HU-27`, `HU-29` y `RN-02`, `RN-04`, `RN-05`, `RN-08`, `RN-30`. No modifiques archivos fuera de mis carpetas asignadas para evitar conflictos en Git. No utilices emojis en ningun archivo."
