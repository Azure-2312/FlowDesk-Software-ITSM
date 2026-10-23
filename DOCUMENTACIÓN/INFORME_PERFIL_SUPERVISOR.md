# Informe Tecnico y Arquitectonico de Perfil: Supervisor

> [!IMPORTANT]
> **Perfil ID**: `4` | **Rol ITSM**: `Supervisor` | **Fecha de Auditoria**: 2026-10-22
> **Cumplimiento Funcional Global**: **89%** (34 de 38 opciones operativas)

## 1. Proposito del Rol y Marco Normativo ITIL v4

El Supervisor de Soporte lidera la operacion diaria del Service Desk. Garantiza el cumplimiento de SLAs, balancea la asignacion de tickets y problemas sin asignar, gestiona ausencias del equipo y analiza reportes de productividad operativa.

- **Marco Primario**: ITIL v4 (Sistema de Valor del Servicio - SVS)
- **Estandares de Calidad y Seguridad**: ISO/IEC 20000-1 (Gestion de Servicios), ISO/IEC 27001 (Seguridad de la Informacion)
- **Nivel de Gobernanza**: Control de Acceso Basado en Roles (RBAC) con capacidades granulares y aislamiento modular

## 2. Resumen Ejecutivo de Cobertura y Madurez

| Metrica | Cantidad | Descripcion |
| :--- | :--- | :--- |
| **Modulos con Acceso** | 13 | Modulos de dominio alcanzados por el menu del perfil |
| **Opciones Totales en Menu** | 56 | Elementos registrados en la jerarquia de navegacion |
| **Encabezados de Agrupacion** | 18 | Categorias nivel 1 y 2 que estructuran el acordeon visual |
| **Vistas Terminales (URLs)** | 38 | Pantallas con ruta web directa (`page.tsx`) |
| **Desarrollo Completo (100%)** | 24 | Vistas con estado, hooks de reactividad y APIs operativas |
| **Desarrollo Funcional Base** | 10 | Componentes estables con soporte de datos integrado |
| **Desarrollo Parcial / Pendiente** | 4 | Vistas con implementacion parcial o logica en consolidacion |

## 3. Desglose Exhaustivo por Modulo: Carpetas, Subcarpetas y Archivos

### 3.1. Modulo: `GENERAL`

- **Practica ITIL v4**: Gobernanza y Estructura Base de Plataforma (Platform Governance - ITIL 4)
- **Objetivo de Control**: Estructuracion jerarquica de accesos y navegacion basada en roles.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Mi trabajo"

- **Nivel**: `1` | **Orden**: `1`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Mesa de Servicio"

- **Nivel**: `1` | **Orden**: `2`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Cambios"

- **Nivel**: `1` | **Orden**: `3`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Problemas"

- **Nivel**: `1` | **Orden**: `4`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Activos"

- **Nivel**: `1` | **Orden**: `5`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Conocimiento"

- **Nivel**: `1` | **Orden**: `6`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Operación"

- **Nivel**: `1` | **Orden**: `8`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Reportes"

- **Nivel**: `1` | **Orden**: `9`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Mi cuenta"

- **Nivel**: `1` | **Orden**: `12`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Incidentes" (Padre: *Mesa de Servicio*)

- **Nivel**: `2` | **Orden**: `1`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Mis cambios" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `1`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Inventario" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `1`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Equipo" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `2`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Bajas y disposición" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `2`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Solicitudes" (Padre: *Mesa de Servicio*)

- **Nivel**: `2` | **Orden**: `2`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Operacion de la mesa" (Padre: *Mesa de Servicio*)

- **Nivel**: `2` | **Orden**: `3`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Licencias" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `4`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "SLA" (Padre: *Mesa de Servicio*)

- **Nivel**: `2` | **Orden**: `4`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

### 3.2. Modulo: `CONOCIMIENTO`

- **Practica ITIL v4**: Gestion del Conocimiento (Knowledge Management & KCS - ITIL 4)
- **Objetivo de Control**: Captura, estructuracion, reutilizacion y mejora continua del conocimiento tecnico y de usuario para optimizar la resolucion y fomentar el autoservicio.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Base de conocimiento" (Padre: *Conocimiento*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/conocimiento`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/page.tsx)
- **Componente Modular de Vista**: [`src/modules/conocimiento/views/VistaConocimientoBase.tsx`](file:///src/modules/conocimiento/views/VistaConocimientoBase.tsx)
  - **Lineas de Codigo**: `317` | **Tamano**: `11 KB`
  - **Consumo de Endpoints API**:
    - [`/api/conocimiento?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/conocimiento?_t=${Date.now()}).

##### Opcion: "Publicación de artículos" (Padre: *Conocimiento*)

- **Nivel**: `2` | **Orden**: `5`
- **URL Web**: [`/plataforma/conocimiento/supervisor/revisiones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/supervisor/revisiones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/supervisor/revisiones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/supervisor/revisiones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/conocimiento/views/VistaConocimientoRevisiones.tsx`](file:///src/modules/conocimiento/views/VistaConocimientoRevisiones.tsx)
  - **Lineas de Codigo**: `153` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/conocimiento?vista=revisiones&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/conocimiento?vista=revisiones&_t=${Date.now()}).

### 3.3. Modulo: `REPORTES`

- **Practica ITIL v4**: Mejora Continua, Medicion e Informes (Continual Improvement - ITIL 4)
- **Objetivo de Control**: Recopilacion y analisis de metricas operativas, de cumplimiento y productividad para respaldar la toma de decisiones basada en datos.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Indicadores operativos y SLA" (Padre: *Reportes*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/reportes/operativos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/operativos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/operativos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/operativos/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Productividad individual" (Padre: *Reportes*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/reportes/productividad`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/productividad/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/productividad/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/productividad/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.4. Modulo: `OPERACION`

- **Practica ITIL v4**: Gestion de Operaciones y Monitoreo (Service Operations & Event Management - ITIL 4)
- **Objetivo de Control**: Supervision centralizada del estado de los servicios, gestion de tareas diarias, alertas tempranas y tableros unificados de control operativo.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Capacidad y continuidad" (Padre: *Operación*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/operacion/resiliencia`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/resiliencia/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/resiliencia/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/resiliencia/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/views/VistaResilienciaOperacion.tsx`](file:///src/modules/operacion/views/VistaResilienciaOperacion.tsx)
  - **Lineas de Codigo**: `6` | **Tamano**: `0 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Eventos y alertas" (Padre: *Operación*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/operacion/eventos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/eventos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/eventos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/eventos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/views/VistaEventosOperacion.tsx`](file:///src/modules/operacion/views/VistaEventosOperacion.tsx)
  - **Lineas de Codigo**: `6` | **Tamano**: `0 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Panel de supervisión" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `5`
- **URL Web**: [`/plataforma/operacion/paneles/supervisor`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/supervisor/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/supervisor/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/supervisor/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/paneles/supervisor/VistaPanelSupervisor.tsx`](file:///src/modules/operacion/paneles/supervisor/VistaPanelSupervisor.tsx)
  - **Lineas de Codigo**: `136` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/paneles/supervisor?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/paneles/supervisor/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/paneles/supervisor?_t=${Date.now()}).

### 3.5. Modulo: `CAMBIOS`

- **Practica ITIL v4**: Habilitacion del Cambio (Change Enablement - ITIL 4 / ISO 20000 Cl. 8.5)
- **Objetivo de Control**: Maximizacion de cambios exitosos evaluando riesgos, autorizando mediante autoridades de cambio (CAB/Emergencia) y gestionando el calendario de congelamiento.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Calendario de cambios" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/cambios/gestion/calendario`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/calendario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/calendario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/calendario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/gestion/calendario/VistaCambiosGestionCalendario.tsx`](file:///src/modules/cambios/gestion/calendario/VistaCambiosGestionCalendario.tsx)
  - **Lineas de Codigo**: `206` | **Tamano**: `9 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios).

##### Opcion: "Aprobaciones técnicas de RFC" (Padre: *Mis cambios*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/cambios/supervisor/aprobaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/supervisor/aprobaciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/supervisor/aprobaciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/supervisor/aprobaciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/supervisor/VistaAprobacionesTecnicas.tsx`](file:///src/modules/cambios/views/supervisor/VistaAprobacionesTecnicas.tsx)
  - **Lineas de Codigo**: `118` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/supervisor/aprobaciones?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/supervisor/aprobaciones/route.ts)
    - [`/api/cambios/supervisor/aprobaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/supervisor/aprobaciones/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/supervisor/aprobaciones?_t=${Date.now()}, /api/cambios/supervisor/aprobaciones).

##### Opcion: "Cambios que afectan al equipo" (Padre: *Mis cambios*)

- **Nivel**: `3` | **Orden**: `5`
- **URL Web**: [`/plataforma/cambios/supervisor/impacto`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/supervisor/impacto/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/supervisor/impacto/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/supervisor/impacto/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/tecnico/VistaTecnicoCambiosImpacto.tsx`](file:///src/modules/cambios/views/tecnico/VistaTecnicoCambiosImpacto.tsx)
  - **Lineas de Codigo**: `191` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios?vista=impacto&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
    - [`/api/cambios/tecnico/enterado`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/tecnico/enterado/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios?vista=impacto&_t=${Date.now()}, /api/cambios/tecnico/enterado).

##### Opcion: "Implementaciones del equipo" (Padre: *Mis cambios*)

- **Nivel**: `3` | **Orden**: `9`
- **URL Web**: [`/plataforma/cambios/supervisor/programar`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/supervisor/programar/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/supervisor/programar/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/supervisor/programar/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/supervisor/VistaProgramacionCambios.tsx`](file:///src/modules/cambios/views/supervisor/VistaProgramacionCambios.tsx)
  - **Lineas de Codigo**: `142` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/supervisor/programar?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/supervisor/programar/route.ts)
    - [`/api/cambios/supervisor/programar`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/supervisor/programar/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/supervisor/programar?_t=${Date.now()}, /api/cambios/supervisor/programar).

### 3.6. Modulo: `MI-CUENTA`

- **Practica ITIL v4**: Autogestion de Identidad del Usuario (User Identity & Notification Preferences)
- **Objetivo de Control**: Gestion de perfil personal, seguridad de credenciales y canalizacion de avisos y notificaciones individuales.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Mi perfil y seguridad" (Padre: *Mi cuenta*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/mi-cuenta/perfil`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/mi-cuenta/perfil/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/mi-cuenta/perfil/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/mi-cuenta/perfil/page.tsx)
- **Componente Modular de Vista**: [`src/modules/seguridad/views/MiCuentaView.tsx`](file:///src/modules/seguridad/views/MiCuentaView.tsx)
  - **Lineas de Codigo**: `489` | **Tamano**: `17 KB`
  - **Consumo de Endpoints API**:
    - [`/api/mi-cuenta`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/mi-cuenta/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/mi-cuenta).

##### Opcion: "Preferencias de notificación" (Padre: *Mi cuenta*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/mi-cuenta/notificaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/mi-cuenta/notificaciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/mi-cuenta/notificaciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/mi-cuenta/notificaciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/seguridad/views/VistaPreferenciasNotificacion.tsx`](file:///src/modules/seguridad/views/VistaPreferenciasNotificacion.tsx)
  - **Lineas de Codigo**: `181` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/mi-cuenta/notificaciones?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/mi-cuenta/notificaciones/route.ts)
    - [`/api/mi-cuenta/notificaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/mi-cuenta/notificaciones/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/mi-cuenta/notificaciones?_t=${Date.now()}, /api/mi-cuenta/notificaciones).

### 3.7. Modulo: `PROBLEMAS`

- **Practica ITIL v4**: Gestion de Problemas (Problem Management - ITIL 4)
- **Objetivo de Control**: Reduccion de la probabilidad e impacto de incidentes mediante la identificacion de causas raiz (RCA), soluciones temporales (Workarounds) y Base de Errores Conocidos (KEDB).

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Asignación de problemas" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/problemas/supervisor/asignar`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/supervisor/asignar/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/supervisor/asignar/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/supervisor/asignar/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/views/supervisor/VistaAsignacionProblemas.tsx`](file:///src/modules/problemas/views/supervisor/VistaAsignacionProblemas.tsx)
  - **Lineas de Codigo**: `130` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/problemas/asignar?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/asignar/route.ts)
    - [`/api/tecnicos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tecnicos/route.ts)
    - [`/api/problemas/asignar`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/asignar/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/problemas/asignar?_t=${Date.now()}, /api/tecnicos?_t=${Date.now()}, /api/problemas/asignar).

##### Opcion: "Errores conocidos (KEDB)" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `8`
- **URL Web**: [`/plataforma/problemas/kedb`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/kedb/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/kedb/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/kedb/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/views/VistaKedb.tsx`](file:///src/modules/problemas/views/VistaKedb.tsx)
  - **Lineas de Codigo**: `6` | **Tamano**: `0 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Registro de problemas" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `15`
- **URL Web**: [`/plataforma/problemas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/views/VistaProblemas.tsx`](file:///src/modules/problemas/views/VistaProblemas.tsx)
  - **Lineas de Codigo**: `6` | **Tamano**: `0 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

### 3.8. Modulo: `SOLICITUDES`

- **Practica ITIL v4**: Gestion de Solicitudes de Servicio (Service Request Management - ITIL 4)
- **Objetivo de Control**: Procesamiento eficiente de solicitudes pre-aprobadas y estandarizadas con flujo de aprobaciones de negocio y cumplimiento de acuerdos de entrega.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Todas las solicitudes" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/solicitudes`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Bandeja de solicitudes" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/solicitudes/bandeja`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/bandeja/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/bandeja/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/bandeja/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Solicitudes resueltas" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `5`
- **URL Web**: [`/plataforma/solicitudes/resueltos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/resueltos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/resueltos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/resueltos/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.9. Modulo: `ORGANIZACION`

- **Practica ITIL v4**: Gestion del Talento y la Fuerza Laboral (Workforce & Talent Management - ITIL 4)
- **Objetivo de Control**: Asignacion eficiente de capacidades tecnicas, balance de carga de trabajo, cobertura de turnos y administracion de ausencias del personal.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Ausencias y guardias" (Padre: *Equipo*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/organizacion/equipo/ausencias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/equipo/ausencias/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/equipo/ausencias/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/equipo/ausencias/page.tsx)
- **Componente Modular de Vista**: [`src/modules/organizacion/views/supervisor/VistaAusenciasEquipo.tsx`](file:///src/modules/organizacion/views/supervisor/VistaAusenciasEquipo.tsx)
  - **Lineas de Codigo**: `166` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/organizacion/equipo/ausencias?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/organizacion/equipo/ausencias/route.ts)
    - [`/api/tecnicos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tecnicos/route.ts)
    - [`/api/organizacion/equipo/ausencias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/organizacion/equipo/ausencias/route.ts)
    - [`/api/organizacion/equipo/ausencias?id=${id}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/organizacion/equipo/ausencias/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/organizacion/equipo/ausencias?_t=${Date.now()}, /api/tecnicos?_t=${Date.now()}, /api/organizacion/equipo/ausencias, /api/organizacion/equipo/ausencias?id=${id}).

##### Opcion: "Vistas compartidas" (Padre: *Equipo*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/organizacion/equipo/vistas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/equipo/vistas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/equipo/vistas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/equipo/vistas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/organizacion/views/supervisor/VistaRecursosEquipo.tsx`](file:///src/modules/organizacion/views/supervisor/VistaRecursosEquipo.tsx)
  - **Lineas de Codigo**: `143` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/organizacion/equipo/vistas?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/organizacion/equipo/vistas/route.ts)
    - [`/api/organizacion/equipo/vistas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/organizacion/equipo/vistas/route.ts)
    - [`/api/organizacion/equipo/vistas?id=${id}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/organizacion/equipo/vistas/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/organizacion/equipo/vistas?_t=${Date.now()}, /api/organizacion/equipo/vistas, /api/organizacion/equipo/vistas?id=${id}).

### 3.10. Modulo: `ACTIVOS`

- **Practica ITIL v4**: Gestion de Activos de TI (ITAM - ITIL 4 / ISO 19770)
- **Objetivo de Control**: Control del ciclo de vida financiero, contractual y fisico de los activos de TI, asegurando valor optimo, cumplimiento de licencias y disposicion segura.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Aprobación de bajas" (Padre: *Bajas y disposición*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/activos/supervisor/bajas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/supervisor/bajas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/supervisor/bajas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/supervisor/bajas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaSupervisorBajasActivos.tsx`](file:///src/modules/activos/views/VistaSupervisorBajasActivos.tsx)
  - **Lineas de Codigo**: `117` | **Tamano**: `4 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/bajas/supervisor?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/bajas/supervisor/route.ts)
    - [`/api/activos/bajas/supervisor`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/bajas/supervisor/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/bajas/supervisor?_t=${Date.now()}, /api/activos/bajas/supervisor).

##### Opcion: "Licencias de software" (Padre: *Licencias*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/activos/licencias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/licencias/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/licencias/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/licencias/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaLicenciasActivos.tsx`](file:///src/modules/activos/views/VistaLicenciasActivos.tsx)
  - **Lineas de Codigo**: `666` | **Tamano**: `29 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/licencias/asignaciones?id_licencia=${idLic}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/licencias/asignaciones/route.ts)
    - [`/api/usuarios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/usuarios/route.ts)
    - [`/api/activos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/route.ts)
    - [`/api/activos/licencias/asignaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/licencias/asignaciones/route.ts)
    - [`/api/activos/licencias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/licencias/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/licencias/asignaciones?id_licencia=${idLic}, /api/usuarios, /api/activos, /api/activos/licencias/asignaciones, /api/activos/licencias).

##### Opcion: "Inventario de activos" (Padre: *Inventario*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/activos/inventario`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/inventario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/inventario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/inventario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaInventarioActivos.tsx`](file:///src/modules/activos/views/VistaInventarioActivos.tsx)
  - **Lineas de Codigo**: `1516` | **Tamano**: `61 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/modelos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/modelos/route.ts)
    - [`/api/activos/tipos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/tipos/route.ts)
    - `/api/activos/${a.id_activo}/historial`
    - [`/api/activos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/modelos, /api/activos/tipos, /api/activos/${a.id_activo}/historial, /api/activos).

### 3.11. Modulo: `SERVICIOS`

- **Practica ITIL v4**: Gestion del Catalogo y Niveles de Servicio (Service Level Management - ITIL 4)
- **Objetivo de Control**: Definicion de metas de servicio realistas y medibles (SLA/OLA), monitoreo de semaforos de cumplimiento y gestion proactiva de escalamientos.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Riesgos de SLA" (Padre: *SLA*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/servicios/sla/supervisor/escalamientos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/supervisor/escalamientos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/supervisor/escalamientos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/supervisor/escalamientos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/views/supervisor/VistaEscalamientosSla.tsx`](file:///src/modules/servicios/views/supervisor/VistaEscalamientosSla.tsx)
  - **Lineas de Codigo**: `100` | **Tamano**: `3 KB`
  - **Consumo de Endpoints API**:
    - [`/api/servicios/sla/escalamientos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/servicios/sla/escalamientos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/servicios/sla/escalamientos?_t=${Date.now()}).

##### Opcion: "Incumplimientos y causas" (Padre: *SLA*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/servicios/sla/supervisor/incumplimientos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/supervisor/incumplimientos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/supervisor/incumplimientos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/supervisor/incumplimientos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/views/supervisor/VistaIncumplimientosSla.tsx`](file:///src/modules/servicios/views/supervisor/VistaIncumplimientosSla.tsx)
  - **Lineas de Codigo**: `83` | **Tamano**: `3 KB`
  - **Consumo de Endpoints API**:
    - [`/api/servicios/sla/incumplimientos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/servicios/sla/incumplimientos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/servicios/sla/incumplimientos?_t=${Date.now()}).

##### Opcion: "Objetivos de tiempo vigentes" (Padre: *SLA*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/servicios/sla/tecnico/objetivos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/tecnico/objetivos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/tecnico/objetivos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/tecnico/objetivos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/views/tecnico/VistaTecnicoSlaObjetivos.tsx`](file:///src/modules/servicios/views/tecnico/VistaTecnicoSlaObjetivos.tsx)
  - **Lineas de Codigo**: `204` | **Tamano**: `8 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Semaforo de SLA del grupo" (Padre: *SLA*)

- **Nivel**: `3` | **Orden**: `5`
- **URL Web**: [`/plataforma/servicios/sla/supervisor/semaforo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/supervisor/semaforo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/supervisor/semaforo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/supervisor/semaforo/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/views/tecnico/VistaTecnicoSlaSemaforo.tsx`](file:///src/modules/servicios/views/tecnico/VistaTecnicoSlaSemaforo.tsx)
  - **Lineas de Codigo**: `291` | **Tamano**: `14 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets?vista=${vista}&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets?vista=${vista}&_t=${Date.now()}).

### 3.12. Modulo: `INCIDENTES`

- **Practica ITIL v4**: Gobernanza y Estructura Base de Plataforma (Platform Governance - ITIL 4)
- **Objetivo de Control**: Estructuracion jerarquica de accesos y navegacion basada en roles.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Todos los incidentes" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/incidentes`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Bandeja de incidentes" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/incidentes/bandeja`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/bandeja/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/bandeja/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/bandeja/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Incidentes resueltos" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `5`
- **URL Web**: [`/plataforma/incidentes/resueltos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/resueltos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/resueltos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/resueltos/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Incidentes mayores" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `9`
- **URL Web**: [`/plataforma/incidentes/mayores`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/mayores/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/mayores/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/mayores/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.13. Modulo: `TICKETS`

- **Practica ITIL v4**: Gestion de Incidentes y Mesa de Servicio (Service Desk & Incident Management - ITIL 4)
- **Objetivo de Control**: Restauracion del servicio normal lo antes posible minimizando el impacto en el negocio, con categorizacion, priorizacion y escalamiento estructurado.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Centro de asignacion" (Padre: *Operacion de la mesa*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/tickets/gestion/asignar`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/asignar/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/asignar/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/asignar/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/gestion/asignar/VistaTicketsGestionAsignar.tsx`](file:///src/modules/tickets/gestion/asignar/VistaTicketsGestionAsignar.tsx)
  - **Lineas de Codigo**: `719` | **Tamano**: `30 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets?vista=todos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/route.ts)
    - [`/api/tecnicos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tecnicos/route.ts)
    - [`/api/departamentos-ti`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/departamentos-ti/route.ts)
    - `/api/tickets/${ticketSeleccionado.id_ticket}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets?vista=todos, /api/tecnicos, /api/departamentos-ti, /api/tickets/${ticketSeleccionado.id_ticket}).

##### Opcion: "Bandeja de pendientes" (Padre: *Operacion de la mesa*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/tickets/gestion/bandeja`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/bandeja/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/bandeja/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/bandeja/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/components/TablaTickets.tsx`](file:///src/modules/tickets/components/TablaTickets.tsx)
  - **Lineas de Codigo**: `668` | **Tamano**: `28 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/catalogos/route.ts)
    - [`/api/departamentos-ti`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/departamentos-ti/route.ts)
    - [`/api/problemas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/route.ts)
    - [`/api/cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
    - `${endpoint}?${params.toString()}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets/catalogos, /api/departamentos-ti, /api/problemas, /api/cambios, ${endpoint}?${params.toString()}).

##### Opcion: "Historial de resueltos" (Padre: *Operacion de la mesa*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/tickets/gestion/resueltos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/resueltos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/resueltos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/resueltos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/components/TablaTickets.tsx`](file:///src/modules/tickets/components/TablaTickets.tsx)
  - **Lineas de Codigo**: `668` | **Tamano**: `28 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/catalogos/route.ts)
    - [`/api/departamentos-ti`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/departamentos-ti/route.ts)
    - [`/api/problemas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/route.ts)
    - [`/api/cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
    - `${endpoint}?${params.toString()}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets/catalogos, /api/departamentos-ti, /api/problemas, /api/cambios, ${endpoint}?${params.toString()}).

##### Opcion: "Todos los tickets" (Padre: *Operacion de la mesa*)

- **Nivel**: `3` | **Orden**: `6`
- **URL Web**: [`/plataforma/tickets/gestion/todos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/todos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/todos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/todos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/components/TablaTickets.tsx`](file:///src/modules/tickets/components/TablaTickets.tsx)
  - **Lineas de Codigo**: `668` | **Tamano**: `28 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/catalogos/route.ts)
    - [`/api/departamentos-ti`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/departamentos-ti/route.ts)
    - [`/api/problemas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/route.ts)
    - [`/api/cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
    - `${endpoint}?${params.toString()}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets/catalogos, /api/departamentos-ti, /api/problemas, /api/cambios, ${endpoint}?${params.toString()}).

##### Opcion: "Registrar ticket de usuario" (Padre: *Operacion de la mesa*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/tickets/gestion/crear`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/crear/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/crear/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/crear/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/gestion/crear/VistaTicketsGestionCrear.tsx`](file:///src/modules/tickets/gestion/crear/VistaTicketsGestionCrear.tsx)
  - **Lineas de Codigo**: `1586` | **Tamano**: `69 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/catalogos/route.ts)
    - [`/api/mi-cuenta`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/mi-cuenta/route.ts)
    - [`/api/operacion/configuracion?clave=formularios_solicitante_config`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/configuracion/route.ts)
    - [`/api/servicios/sla`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/servicios/sla/route.ts)
    - [`/api/identidades/tecnicos?q=${encodeURIComponent(termino.trim())}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/identidades/tecnicos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets/catalogos, /api/mi-cuenta, /api/operacion/configuracion?clave=formularios_solicitante_config, /api/servicios/sla, /api/identidades/tecnicos?q=${encodeURIComponent(termino.trim())}).

##### Opcion: "Auditoria de tickets" (Padre: *Operacion de la mesa*)

- **Nivel**: `3` | **Orden**: `8`
- **URL Web**: [`/plataforma/tickets/gestion/auditoria`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/auditoria/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/auditoria/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/auditoria/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/components/TablaTickets.tsx`](file:///src/modules/tickets/components/TablaTickets.tsx)
  - **Lineas de Codigo**: `668` | **Tamano**: `28 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/catalogos/route.ts)
    - [`/api/departamentos-ti`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/departamentos-ti/route.ts)
    - [`/api/problemas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/route.ts)
    - [`/api/cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
    - `${endpoint}?${params.toString()}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets/catalogos, /api/departamentos-ti, /api/problemas, /api/cambios, ${endpoint}?${params.toString()}).

## 4. Analisis Comparativo frente a ITIL v4 e ISO/IEC 20000

### Fortalezas de la Implementacion Actual:
1. **Alineacion Modular Estricta**: No existe logica funcional acoplada a carpetas de perfiles; todo el codigo de dominio reside en modulos independientes desacoplados.
2. **Seguridad RBAC en Capas**: El perfil cuenta con segregacion visual en el arbol de base de datos (`opciones_menu_perfiles`) y validacion de capacidad en el layout de sesion.
3. **Trazabilidad de Navegacion**: Las URLs del navegador coinciden exactamente 1:1 con la estructura de carpetas de modulos, cumpliendo con la exigencia de transparencia arquitectonica.

### Brechas Identificadas y Recomendaciones de Evolucion:
1. **Consolidacion de Componentes Parciales**: Se detectaron 4 opciones que cuentan con interfaz base pero requieren completar persistencia completa en PostgreSQL o sustitucion de colecciones locales.
2. **Automatizacion de Flujos Transversales**: Profundizar la integracion automatica de notificaciones en tiempo real (WebSockets / SSE) para eventos criticos asignados a este perfil.
3. **Metricas y Auditoria de Sesion**: Fortalecer el registro detallado en `auditoria_sistema` de cada accion de creacion, modificacion o transicion de estado ejecutada por este perfil.

---
*Informe generado automaticamente mediante auditoria estatica y validacion de base de datos del Sistema ITSM.*