# Informe Tecnico y Arquitectonico de Perfil: Gestor de Cambios

> [!IMPORTANT]
> **Perfil ID**: `8` | **Rol ITSM**: `Gestor de Cambios` | **Fecha de Auditoria**: 2026-10-22
> **Cumplimiento Funcional Global**: **84%** (16 de 19 opciones operativas)

## 1. Proposito del Rol y Marco Normativo ITIL v4

El Gestor de Cambios (Change Manager) coordina el flujo integral de Habilitacion del Cambio. Programa el calendario de despliegue, detecta conflictos de ventanas de mantenimiento, hace cumplir congelamientos tecnicos y lidera las revisiones post-implementacion (PIR).

- **Marco Primario**: ITIL v4 (Sistema de Valor del Servicio - SVS)
- **Estandares de Calidad y Seguridad**: ISO/IEC 20000-1 (Gestion de Servicios), ISO/IEC 27001 (Seguridad de la Informacion)
- **Nivel de Gobernanza**: Control de Acceso Basado en Roles (RBAC) con capacidades granulares y aislamiento modular

## 2. Resumen Ejecutivo de Cobertura y Madurez

| Metrica | Cantidad | Descripcion |
| :--- | :--- | :--- |
| **Modulos con Acceso** | 5 | Modulos de dominio alcanzados por el menu del perfil |
| **Opciones Totales en Menu** | 25 | Elementos registrados en la jerarquia de navegacion |
| **Encabezados de Agrupacion** | 6 | Categorias nivel 1 y 2 que estructuran el acordeon visual |
| **Vistas Terminales (URLs)** | 19 | Pantallas con ruta web directa (`page.tsx`) |
| **Desarrollo Completo (100%)** | 14 | Vistas con estado, hooks de reactividad y APIs operativas |
| **Desarrollo Funcional Base** | 2 | Componentes estables con soporte de datos integrado |
| **Desarrollo Parcial / Pendiente** | 3 | Vistas con implementacion parcial o logica en consolidacion |

## 3. Desglose Exhaustivo por Modulo: Carpetas, Subcarpetas y Archivos

### 3.1. Modulo: `GENERAL`

- **Practica ITIL v4**: Gobernanza y Estructura Base de Plataforma (Platform Governance - ITIL 4)
- **Objetivo de Control**: Estructuracion jerarquica de accesos y navegacion basada en roles.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Mi trabajo"

- **Nivel**: `1` | **Orden**: `1`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Cambios"

- **Nivel**: `1` | **Orden**: `3`
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

##### Opcion: "Gestión" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `2`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "CAB" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `3`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

### 3.2. Modulo: `MI-CUENTA`

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

### 3.3. Modulo: `CAMBIOS`

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

##### Opcion: "Historial de cambios" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/cambios/gestion/todos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/todos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/todos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/todos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/gestion/todos/VistaCambiosGestionTodos.tsx`](file:///src/modules/cambios/gestion/todos/VistaCambiosGestionTodos.tsx)
  - **Lineas de Codigo**: `289` | **Tamano**: `14 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Solicitar un cambio" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `3`
- **URL Web**: [`/plataforma/cambios/gestion/crear`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/crear/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/crear/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/crear/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/gestion/crear/VistaCambiosGestionCrear.tsx`](file:///src/modules/cambios/gestion/crear/VistaCambiosGestionCrear.tsx)
  - **Lineas de Codigo**: `651` | **Tamano**: `28 KB`
  - **Consumo de Endpoints API**:
    - [`/api/menu`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/menu/route.ts)
    - [`/api/activos/cmdb`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/route.ts)
    - [`/api/problemas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/route.ts)
    - [`/api/cambios/configuracion/rfc`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/configuracion/rfc/route.ts)
    - [`/api/cambios/configuracion/modelos-estandar`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/configuracion/modelos-estandar/route.ts)
    - [`/api/cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/menu, /api/activos/cmdb, /api/problemas, /api/cambios/configuracion/rfc, /api/cambios/configuracion/modelos-estandar, /api/cambios).

##### Opcion: "Feriados" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `9`
- **URL Web**: [`/plataforma/cambios/configuracion/notificaciones-calendario?vista=feriados`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/ui.ts`](file:///src/modules/cambios/ui.ts)
  - **Lineas de Codigo**: `25` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Períodos de congelamiento" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `10`
- **URL Web**: [`/plataforma/cambios/configuracion/notificaciones-calendario?vista=congelamiento`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/ui.ts`](file:///src/modules/cambios/ui.ts)
  - **Lineas de Codigo**: `25` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Ventanas de mantenimiento" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `11`
- **URL Web**: [`/plataforma/cambios/configuracion/notificaciones-calendario?vista=ventanas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/ui.ts`](file:///src/modules/cambios/ui.ts)
  - **Lineas de Codigo**: `25` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Bandeja de RFC por evaluar" (Padre: *Gestión*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/cambios/gestion/evaluacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/evaluacion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/evaluacion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/evaluacion/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/gestion/VistaEvaluacionRfc.tsx`](file:///src/modules/cambios/views/gestion/VistaEvaluacionRfc.tsx)
  - **Lineas de Codigo**: `162` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/gestion/evaluacion?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/evaluacion/route.ts)
    - [`/api/cambios/gestion/evaluacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/evaluacion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/gestion/evaluacion?_t=${Date.now()}, /api/cambios/gestion/evaluacion).

##### Opcion: "Conflictos y capacidad" (Padre: *Gestión*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/cambios/gestion/conflictos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/conflictos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/conflictos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/conflictos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/gestion/VistaConflictos.tsx`](file:///src/modules/cambios/views/gestion/VistaConflictos.tsx)
  - **Lineas de Codigo**: `167` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/gestion/conflictos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/conflictos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/gestion/conflictos?_t=${Date.now()}).

##### Opcion: "Convocatoria, agenda y actas" (Padre: *CAB*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/cambios/gestion/cab-agenda`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/cab-agenda/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/cab-agenda/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/cab-agenda/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/gestion/VistaCabAgendaGestion.tsx`](file:///src/modules/cambios/views/gestion/VistaCabAgendaGestion.tsx)
  - **Lineas de Codigo**: `227` | **Tamano**: `10 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/gestion/cab-agenda?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/cab-agenda/route.ts)
    - [`/api/cambios/gestion/cab-agenda`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/cab-agenda/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/gestion/cab-agenda?_t=${Date.now()}, /api/cambios/gestion/cab-agenda).

##### Opcion: "Modelos de cambio estándar" (Padre: *Gestión*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/cambios/gestion/modelos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/modelos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/modelos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/modelos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/gestion/VistaModelosGestion.tsx`](file:///src/modules/cambios/views/gestion/VistaModelosGestion.tsx)
  - **Lineas de Codigo**: `196` | **Tamano**: `8 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/gestion/modelos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/modelos/route.ts)
    - [`/api/cambios/gestion/modelos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/modelos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/gestion/modelos?_t=${Date.now()}, /api/cambios/gestion/modelos).

##### Opcion: "Cambios autorizados" (Padre: *Gestión*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/cambios/gestion/programacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/programacion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/programacion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/programacion/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/gestion/VistaProgramacion.tsx`](file:///src/modules/cambios/views/gestion/VistaProgramacion.tsx)
  - **Lineas de Codigo**: `141` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/gestion/programacion?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/programacion/route.ts)
    - [`/api/cambios/gestion/programacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/programacion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/gestion/programacion?_t=${Date.now()}, /api/cambios/gestion/programacion).

##### Opcion: "Dictamen colegiado (CAB)" (Padre: *CAB*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/cambios/gestion/cab`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/cab/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/cab/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/cab/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/gestion/cab/VistaCambiosGestionCab.tsx`](file:///src/modules/cambios/gestion/cab/VistaCambiosGestionCab.tsx)
  - **Lineas de Codigo**: `362` | **Tamano**: `15 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios?estado=2`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
    - [`/api/menu`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/menu/route.ts)
    - `/api/cambios/${rfcVotar.id_cambio}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios?estado=2, /api/menu, /api/cambios/${rfcVotar.id_cambio}).

##### Opcion: "Revisión post-implementación" (Padre: *Gestión*)

- **Nivel**: `3` | **Orden**: `5`
- **URL Web**: [`/plataforma/cambios/gestion/pir`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/pir/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/pir/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/pir/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/gestion/VistaPir.tsx`](file:///src/modules/cambios/views/gestion/VistaPir.tsx)
  - **Lineas de Codigo**: `157` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/gestion/pir?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/pir/route.ts)
    - [`/api/cambios/gestion/pir`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/pir/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/gestion/pir?_t=${Date.now()}, /api/cambios/gestion/pir).

##### Opcion: "Seguimiento de ejecución" (Padre: *Gestión*)

- **Nivel**: `3` | **Orden**: `6`
- **URL Web**: [`/plataforma/cambios/gestion/ejecucion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/ejecucion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/ejecucion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/ejecucion/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/gestion/VistaEjecucion.tsx`](file:///src/modules/cambios/views/gestion/VistaEjecucion.tsx)
  - **Lineas de Codigo**: `145` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/gestion/ejecucion?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/ejecucion/route.ts)
    - [`/api/cambios/gestion/ejecucion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/ejecucion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/gestion/ejecucion?_t=${Date.now()}, /api/cambios/gestion/ejecucion).

##### Opcion: "Etapas de aprobación" (Padre: *Gestión*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/cambios/gestion/autorizaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/autorizaciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/autorizaciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/autorizaciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/gestion/VistaAutorizaciones.tsx`](file:///src/modules/cambios/views/gestion/VistaAutorizaciones.tsx)
  - **Lineas de Codigo**: `167` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios/gestion/autorizaciones?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/autorizaciones/route.ts)
    - [`/api/cambios/gestion/autorizaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/gestion/autorizaciones/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios/gestion/autorizaciones?_t=${Date.now()}, /api/cambios/gestion/autorizaciones).

### 3.4. Modulo: `OPERACION`

- **Practica ITIL v4**: Gestion de Operaciones y Monitoreo (Service Operations & Event Management - ITIL 4)
- **Objetivo de Control**: Supervision centralizada del estado de los servicios, gestion de tareas diarias, alertas tempranas y tableros unificados de control operativo.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Panel de gestión de cambios" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `3`
- **URL Web**: [`/plataforma/operacion/paneles/gestor-cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/gestor-cambios/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/gestor-cambios/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/gestor-cambios/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/paneles/gestor-cambios/VistaPanelGestion.tsx`](file:///src/modules/operacion/paneles/gestor-cambios/VistaPanelGestion.tsx)
  - **Lineas de Codigo**: `114` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/paneles/cambios?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/paneles/cambios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/paneles/cambios?_t=${Date.now()}).

### 3.5. Modulo: `REPORTES`

- **Practica ITIL v4**: Mejora Continua, Medicion e Informes (Continual Improvement - ITIL 4)
- **Objetivo de Control**: Recopilacion y analisis de metricas operativas, de cumplimiento y productividad para respaldar la toma de decisiones basada en datos.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Reportes de cambios" (Padre: *Reportes*)

- **Nivel**: `2` | **Orden**: `4`
- **URL Web**: [`/plataforma/reportes/cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/cambios/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/cambios/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/cambios/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

## 4. Analisis Comparativo frente a ITIL v4 e ISO/IEC 20000

### Fortalezas de la Implementacion Actual:
1. **Alineacion Modular Estricta**: No existe logica funcional acoplada a carpetas de perfiles; todo el codigo de dominio reside en modulos independientes desacoplados.
2. **Seguridad RBAC en Capas**: El perfil cuenta con segregacion visual en el arbol de base de datos (`opciones_menu_perfiles`) y validacion de capacidad en el layout de sesion.
3. **Trazabilidad de Navegacion**: Las URLs del navegador coinciden exactamente 1:1 con la estructura de carpetas de modulos, cumpliendo con la exigencia de transparencia arquitectonica.

### Brechas Identificadas y Recomendaciones de Evolucion:
1. **Consolidacion de Componentes Parciales**: Se detectaron 3 opciones que cuentan con interfaz base pero requieren completar persistencia completa en PostgreSQL o sustitucion de colecciones locales.
2. **Automatizacion de Flujos Transversales**: Profundizar la integracion automatica de notificaciones en tiempo real (WebSockets / SSE) para eventos criticos asignados a este perfil.
3. **Metricas y Auditoria de Sesion**: Fortalecer el registro detallado en `auditoria_sistema` de cada accion de creacion, modificacion o transicion de estado ejecutada por este perfil.

---
*Informe generado automaticamente mediante auditoria estatica y validacion de base de datos del Sistema ITSM.*