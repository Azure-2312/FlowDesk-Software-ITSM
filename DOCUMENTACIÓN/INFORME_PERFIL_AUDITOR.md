# Informe Tecnico y Arquitectonico de Perfil: Auditor

> [!IMPORTANT]
> **Perfil ID**: `6` | **Rol ITSM**: `Auditor` | **Fecha de Auditoria**: 2026-10-22
> **Cumplimiento Funcional Global**: **96%** (26 de 27 opciones operativas)

## 1. Proposito del Rol y Marco Normativo ITIL v4

El Auditor de TI evalua la conformidad normativa (ISO/IEC 20000, ISO/IEC 27001). Audita registros de cambios sin autorizacion, detecta conflictos de segregacion de funciones (SoD), revisa muestreos aleatorios de tickets y examina las lineas base de la CMDB sin capacidad de alterar datos operativos.

- **Marco Primario**: ITIL v4 (Sistema de Valor del Servicio - SVS)
- **Estandares de Calidad y Seguridad**: ISO/IEC 20000-1 (Gestion de Servicios), ISO/IEC 27001 (Seguridad de la Informacion)
- **Nivel de Gobernanza**: Control de Acceso Basado en Roles (RBAC) con capacidades granulares y aislamiento modular

## 2. Resumen Ejecutivo de Cobertura y Madurez

| Metrica | Cantidad | Descripcion |
| :--- | :--- | :--- |
| **Modulos con Acceso** | 12 | Modulos de dominio alcanzados por el menu del perfil |
| **Opciones Totales en Menu** | 44 | Elementos registrados en la jerarquia de navegacion |
| **Encabezados de Agrupacion** | 17 | Categorias nivel 1 y 2 que estructuran el acordeon visual |
| **Vistas Terminales (URLs)** | 27 | Pantallas con ruta web directa (`page.tsx`) |
| **Desarrollo Completo (100%)** | 18 | Vistas con estado, hooks de reactividad y APIs operativas |
| **Desarrollo Funcional Base** | 8 | Componentes estables con soporte de datos integrado |
| **Desarrollo Parcial / Pendiente** | 1 | Vistas con implementacion parcial o logica en consolidacion |

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

##### Opcion: "CMDB"

- **Nivel**: `1` | **Orden**: `5`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Reportes"

- **Nivel**: `1` | **Orden**: `9`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Plataforma"

- **Nivel**: `1` | **Orden**: `11`
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

##### Opcion: "Inventario" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `1`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Cumplimiento" (Padre: *Plataforma*)

- **Nivel**: `2` | **Orden**: `1`
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

##### Opcion: "Identidades" (Padre: *Plataforma*)

- **Nivel**: `2` | **Orden**: `5`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

### 3.2. Modulo: `REPORTES`

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

##### Opcion: "Informes de auditoría" (Padre: *Reportes*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/reportes/auditoria`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/auditoria/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/auditoria/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/auditoria/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Tableros" (Padre: *Reportes*)

- **Nivel**: `2` | **Orden**: `8`
- **URL Web**: [`/plataforma/reportes/tableros`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/tableros/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/tableros/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/tableros/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.3. Modulo: `SEGURIDAD`

- **Practica ITIL v4**: Gestion de la Seguridad de la Informacion y Cumplimiento (ISO 27001 / ISO 20000)
- **Objetivo de Control**: Preservacion de confidencialidad, integridad y trazabilidad mediante segregacion de funciones (SoD), auditoria de accesos y gestion de evidencias.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Auditoría de cambios" (Padre: *Plataforma*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/seguridad/auditoria-sistema`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/auditoria-sistema/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/auditoria-sistema/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/auditoria-sistema/page.tsx)
- **Componente Modular de Vista**: [`src/modules/plataforma/config/auditoria-sistema/VistaAuditoriaSistema.tsx`](file:///src/modules/plataforma/config/auditoria-sistema/VistaAuditoriaSistema.tsx)
  - **Lineas de Codigo**: `395` | **Tamano**: `18 KB`
  - **Consumo de Endpoints API**:
    - [`/api/seguridad/auditoria?${params.toString()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/seguridad/auditoria/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/seguridad/auditoria?${params.toString()}).

##### Opcion: "Registros de seguridad" (Padre: *Plataforma*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/seguridad/seguridad-logs`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/seguridad-logs/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/seguridad-logs/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/seguridad-logs/page.tsx)
- **Componente Modular de Vista**: [`src/modules/plataforma/config/seguridad-logs/VistaSeguridadLogs.tsx`](file:///src/modules/plataforma/config/seguridad-logs/VistaSeguridadLogs.tsx)
  - **Lineas de Codigo**: `196` | **Tamano**: `8 KB`
  - **Consumo de Endpoints API**:
    - [`/api/seguridad/logs?${params.toString()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/seguridad/logs/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/seguridad/logs?${params.toString()}).

##### Opcion: "Recertificación de accesos" (Padre: *Plataforma*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/seguridad/accesos/recertificacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/accesos/recertificacion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/accesos/recertificacion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/accesos/recertificacion/page.tsx)
- **Componente Modular de Vista**: [`src/modules/identidades/views/auditor/VistaRecertificacion.tsx`](file:///src/modules/identidades/views/auditor/VistaRecertificacion.tsx)
  - **Lineas de Codigo**: `146` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/identidades/recertificacion?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/identidades/recertificacion/route.ts)
    - [`/api/identidades/recertificacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/identidades/recertificacion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/identidades/recertificacion?_t=${Date.now()}, /api/identidades/recertificacion).

##### Opcion: "Cambios no autorizados" (Padre: *Cumplimiento*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/seguridad/cumplimiento/cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/cumplimiento/cambios/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/cumplimiento/cambios/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/cumplimiento/cambios/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/auditor/VistaCambiosIrregulares.tsx`](file:///src/modules/cambios/views/auditor/VistaCambiosIrregulares.tsx)
  - **Lineas de Codigo**: `110` | **Tamano**: `4 KB`
  - **Consumo de Endpoints API**:
    - [`/api/seguridad/cumplimiento/cambios?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/seguridad/cumplimiento/cambios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/seguridad/cumplimiento/cambios?_t=${Date.now()}).

##### Opcion: "Perfiles y permisos" (Padre: *Identidades*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/seguridad/perfiles`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/perfiles/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/perfiles/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/perfiles/page.tsx)
- **Componente Modular de Vista**: [`src/modules/identidades/config/perfiles/VistaPerfiles.tsx`](file:///src/modules/identidades/config/perfiles/VistaPerfiles.tsx)
  - **Lineas de Codigo**: `569` | **Tamano**: `21 KB`
  - **Consumo de Endpoints API**:
    - [`/api/identidades/perfiles?todos=true`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/identidades/perfiles/route.ts)
    - [`/api/menu/admin`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/menu/admin/route.ts)
    - `/api/identidades/perfiles/${perfil.id_perfil}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/identidades/perfiles?todos=true, /api/menu/admin, /api/identidades/perfiles/${perfil.id_perfil}).

##### Opcion: "Muestreo de auditoría" (Padre: *Cumplimiento*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/seguridad/muestreo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/muestreo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/muestreo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/muestreo/page.tsx)
- **Componente Modular de Vista**: [`src/modules/seguridad/views/auditor/VistaMuestreo.tsx`](file:///src/modules/seguridad/views/auditor/VistaMuestreo.tsx)
  - **Lineas de Codigo**: `136` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/seguridad/muestreo?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/seguridad/muestreo/route.ts)
    - [`/api/seguridad/muestreo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/seguridad/muestreo/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/seguridad/muestreo?_t=${Date.now()}, /api/seguridad/muestreo).

##### Opcion: "Segregación de funciones" (Padre: *Cumplimiento*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/seguridad/cumplimiento/sod`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/cumplimiento/sod/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/cumplimiento/sod/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/cumplimiento/sod/page.tsx)
- **Componente Modular de Vista**: [`src/modules/seguridad/views/auditor/VistaSod.tsx`](file:///src/modules/seguridad/views/auditor/VistaSod.tsx)
  - **Lineas de Codigo**: `129` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/seguridad/cumplimiento/sod?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/seguridad/cumplimiento/sod/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/seguridad/cumplimiento/sod?_t=${Date.now()}).

### 3.4. Modulo: `MI-CUENTA`

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

### 3.5. Modulo: `CAMBIOS`

- **Practica ITIL v4**: Habilitacion del Cambio (Change Enablement - ITIL 4 / ISO 20000 Cl. 8.5)
- **Objetivo de Control**: Maximizacion de cambios exitosos evaluando riesgos, autorizando mediante autoridades de cambio (CAB/Emergencia) y gestionando el calendario de congelamiento.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Historial de cambios" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/cambios/gestion/todos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/todos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/todos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/gestion/todos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/gestion/todos/VistaCambiosGestionTodos.tsx`](file:///src/modules/cambios/gestion/todos/VistaCambiosGestionTodos.tsx)
  - **Lineas de Codigo**: `289` | **Tamano**: `14 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.6. Modulo: `OPERACION`

- **Practica ITIL v4**: Gestion de Operaciones y Monitoreo (Service Operations & Event Management - ITIL 4)
- **Objetivo de Control**: Supervision centralizada del estado de los servicios, gestion de tareas diarias, alertas tempranas y tableros unificados de control operativo.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Panel de auditoría" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/operacion/paneles/auditor`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/auditor/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/auditor/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/auditor/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/paneles/auditor/VistaPanelAuditoria.tsx`](file:///src/modules/operacion/paneles/auditor/VistaPanelAuditoria.tsx)
  - **Lineas de Codigo**: `109` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/paneles/auditor?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/paneles/auditor/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/paneles/auditor?_t=${Date.now()}).

##### Opcion: "Retención y depuración" (Padre: *Plataforma*)

- **Nivel**: `2` | **Orden**: `3`
- **URL Web**: [`/plataforma/operacion/mantenimiento-datos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/mantenimiento-datos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/mantenimiento-datos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/mantenimiento-datos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/plataforma/config/mantenimiento-datos/VistaMantenimientoDatos.tsx`](file:///src/modules/plataforma/config/mantenimiento-datos/VistaMantenimientoDatos.tsx)
  - **Lineas de Codigo**: `184` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/mantenimiento-datos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/mantenimiento-datos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/mantenimiento-datos).

### 3.7. Modulo: `PROBLEMAS`

- **Practica ITIL v4**: Gestion de Problemas (Problem Management - ITIL 4)
- **Objetivo de Control**: Reduccion de la probabilidad e impacto de incidentes mediante la identificacion de causas raiz (RCA), soluciones temporales (Workarounds) y Base de Errores Conocidos (KEDB).

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Registro de problemas" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `15`
- **URL Web**: [`/plataforma/problemas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/views/VistaProblemas.tsx`](file:///src/modules/problemas/views/VistaProblemas.tsx)
  - **Lineas de Codigo**: `6` | **Tamano**: `0 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

### 3.8. Modulo: `INCIDENTES`

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

##### Opcion: "Incidentes resueltos" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `5`
- **URL Web**: [`/plataforma/incidentes/resueltos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/resueltos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/resueltos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/resueltos/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.9. Modulo: `SOLICITUDES`

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

##### Opcion: "Solicitudes resueltas" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `5`
- **URL Web**: [`/plataforma/solicitudes/resueltos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/resueltos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/resueltos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/resueltos/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.10. Modulo: `ACTIVOS`

- **Practica ITIL v4**: Gestion de Activos de TI (ITAM - ITIL 4 / ISO 19770)
- **Objetivo de Control**: Control del ciclo de vida financiero, contractual y fisico de los activos de TI, asegurando valor optimo, cumplimiento de licencias y disposicion segura.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Consulta de bajas" (Padre: *Bajas y disposición*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/activos/auditor/bajas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/auditor/bajas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/auditor/bajas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/auditor/bajas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaBajasDisposicion.tsx`](file:///src/modules/activos/views/VistaBajasDisposicion.tsx)
  - **Lineas de Codigo**: `91` | **Tamano**: `3 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/bajas/auditoria?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/bajas/auditoria/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/bajas/auditoria?_t=${Date.now()}).

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

### 3.11. Modulo: `TICKETS`

- **Practica ITIL v4**: Gestion de Incidentes y Mesa de Servicio (Service Desk & Incident Management - ITIL 4)
- **Objetivo de Control**: Restauracion del servicio normal lo antes posible minimizando el impacto en el negocio, con categorizacion, priorizacion y escalamiento estructurado.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

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

### 3.12. Modulo: `CMDB`

- **Practica ITIL v4**: Gestion de la Configuracion del Servicio (SACM - ITIL 4)
- **Objetivo de Control**: Mantenimiento de informacion precisa y confiable sobre los elementos de configuracion (CIs) y sus relaciones e interdependencias en la entrega de servicios.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Auditorías de CMDB" (Padre: *CMDB*)

- **Nivel**: `3` | **Orden**: `9`
- **URL Web**: [`/plataforma/cmdb/auditor/resultados`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/auditor/resultados/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/auditor/resultados/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/auditor/resultados/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/views/auditor/VistaCmdbResultados.tsx`](file:///src/modules/cmdb/views/auditor/VistaCmdbResultados.tsx)
  - **Lineas de Codigo**: `82` | **Tamano**: `4 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cmdb/resultados?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/resultados/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cmdb/resultados?_t=${Date.now()}).

## 4. Analisis Comparativo frente a ITIL v4 e ISO/IEC 20000

### Fortalezas de la Implementacion Actual:
1. **Alineacion Modular Estricta**: No existe logica funcional acoplada a carpetas de perfiles; todo el codigo de dominio reside en modulos independientes desacoplados.
2. **Seguridad RBAC en Capas**: El perfil cuenta con segregacion visual en el arbol de base de datos (`opciones_menu_perfiles`) y validacion de capacidad en el layout de sesion.
3. **Trazabilidad de Navegacion**: Las URLs del navegador coinciden exactamente 1:1 con la estructura de carpetas de modulos, cumpliendo con la exigencia de transparencia arquitectonica.

### Brechas Identificadas y Recomendaciones de Evolucion:
1. **Consolidacion de Componentes Parciales**: Se detectaron 1 opciones que cuentan con interfaz base pero requieren completar persistencia completa en PostgreSQL o sustitucion de colecciones locales.
2. **Automatizacion de Flujos Transversales**: Profundizar la integracion automatica de notificaciones en tiempo real (WebSockets / SSE) para eventos criticos asignados a este perfil.
3. **Metricas y Auditoria de Sesion**: Fortalecer el registro detallado en `auditoria_sistema` de cada accion de creacion, modificacion o transicion de estado ejecutada por este perfil.

---
*Informe generado automaticamente mediante auditoria estatica y validacion de base de datos del Sistema ITSM.*