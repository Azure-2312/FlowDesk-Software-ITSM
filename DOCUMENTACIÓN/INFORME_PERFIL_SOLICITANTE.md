# Informe Tecnico y Arquitectonico de Perfil: Solicitante

> [!IMPORTANT]
> **Perfil ID**: `3` | **Rol ITSM**: `Solicitante` | **Fecha de Auditoria**: 2026-10-22
> **Cumplimiento Funcional Global**: **100%** (12 de 12 opciones operativas)

## 1. Proposito del Rol y Marco Normativo ITIL v4

El Solicitante representa a los consumidores del servicio. Registra incidentes, solicita items del catalogo de servicios, consulta la base de conocimiento de autoservicio y realiza seguimiento al ciclo de vida de sus peticiones.

- **Marco Primario**: ITIL v4 (Sistema de Valor del Servicio - SVS)
- **Estandares de Calidad y Seguridad**: ISO/IEC 20000-1 (Gestion de Servicios), ISO/IEC 27001 (Seguridad de la Informacion)
- **Nivel de Gobernanza**: Control de Acceso Basado en Roles (RBAC) con capacidades granulares y aislamiento modular

## 2. Resumen Ejecutivo de Cobertura y Madurez

| Metrica | Cantidad | Descripcion |
| :--- | :--- | :--- |
| **Modulos con Acceso** | 8 | Modulos de dominio alcanzados por el menu del perfil |
| **Opciones Totales en Menu** | 21 | Elementos registrados en la jerarquia de navegacion |
| **Encabezados de Agrupacion** | 9 | Categorias nivel 1 y 2 que estructuran el acordeon visual |
| **Vistas Terminales (URLs)** | 12 | Pantallas con ruta web directa (`page.tsx`) |
| **Desarrollo Completo (100%)** | 6 | Vistas con estado, hooks de reactividad y APIs operativas |
| **Desarrollo Funcional Base** | 6 | Componentes estables con soporte de datos integrado |
| **Desarrollo Parcial / Pendiente** | 0 | Vistas con implementacion parcial o logica en consolidacion |

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

##### Opcion: "Activos"

- **Nivel**: `1` | **Orden**: `5`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Conocimiento"

- **Nivel**: `1` | **Orden**: `6`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Mi cuenta"

- **Nivel**: `1` | **Orden**: `12`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Inventario" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `1`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Incidentes" (Padre: *Mesa de Servicio*)

- **Nivel**: `2` | **Orden**: `1`
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

### 3.3. Modulo: `CONOCIMIENTO`

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

### 3.4. Modulo: `OPERACION`

- **Practica ITIL v4**: Gestion de Operaciones y Monitoreo (Service Operations & Event Management - ITIL 4)
- **Objetivo de Control**: Supervision centralizada del estado de los servicios, gestion de tareas diarias, alertas tempranas y tableros unificados de control operativo.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Panel del solicitante" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `13`
- **URL Web**: [`/plataforma/operacion/paneles/solicitante`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/solicitante/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/solicitante/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/solicitante/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/paneles/solicitante/VistaPanelSolicitante.tsx`](file:///src/modules/operacion/paneles/solicitante/VistaPanelSolicitante.tsx)
  - **Lineas de Codigo**: `157` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/paneles/solicitante?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/paneles/solicitante/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/paneles/solicitante?_t=${Date.now()}).

### 3.5. Modulo: `SOLICITUDES`

- **Practica ITIL v4**: Gestion de Solicitudes de Servicio (Service Request Management - ITIL 4)
- **Objetivo de Control**: Procesamiento eficiente de solicitudes pre-aprobadas y estandarizadas con flujo de aprobaciones de negocio y cumplimiento de acuerdos de entrega.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Mis solicitudes" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/solicitudes/mios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/mios/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/mios/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/mios/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Registrar solicitud" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/solicitudes/crear`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/crear/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/crear/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/crear/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Catalogo de solicitudes" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `8`
- **URL Web**: [`/plataforma/solicitudes/catalogo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/catalogo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/catalogo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/catalogo/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.6. Modulo: `INCIDENTES`

- **Practica ITIL v4**: Gobernanza y Estructura Base de Plataforma (Platform Governance - ITIL 4)
- **Objetivo de Control**: Estructuracion jerarquica de accesos y navegacion basada en roles.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Mis incidentes" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/incidentes/mios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/mios/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/mios/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/mios/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Registrar incidente" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/incidentes/crear`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/crear/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/crear/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/crear/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Catalogo de incidentes" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `8`
- **URL Web**: [`/plataforma/incidentes/catalogo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/catalogo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/catalogo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/catalogo/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.7. Modulo: `ACTIVOS`

- **Practica ITIL v4**: Gestion de Activos de TI (ITAM - ITIL 4 / ISO 19770)
- **Objetivo de Control**: Control del ciclo de vida financiero, contractual y fisico de los activos de TI, asegurando valor optimo, cumplimiento de licencias y disposicion segura.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Mis activos" (Padre: *Inventario*)

- **Nivel**: `3` | **Orden**: `8`
- **URL Web**: [`/plataforma/activos/mis-activos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/mis-activos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/mis-activos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/mis-activos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaMisActivos.tsx`](file:///src/modules/activos/views/VistaMisActivos.tsx)
  - **Lineas de Codigo**: `295` | **Tamano**: `10 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/mis-activos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/mis-activos/route.ts)
    - [`/api/activos/mis-activos/aceptar?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/mis-activos/aceptar/route.ts)
    - [`/api/activos/mis-activos/aceptar`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/mis-activos/aceptar/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/mis-activos?_t=${Date.now()}, /api/activos/mis-activos/aceptar?_t=${Date.now()}, /api/activos/mis-activos/aceptar).

### 3.8. Modulo: `AVISOS`

- **Practica ITIL v4**: Gobernanza y Estructura Base de Plataforma (Platform Governance - ITIL 4)
- **Objetivo de Control**: Estructuracion jerarquica de accesos y navegacion basada en roles.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Avisos de servicio" (Padre: *Operacion de la mesa*)

- **Nivel**: `3` | **Orden**: `9`
- **URL Web**: [`/plataforma/avisos/mantenimientos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/avisos/mantenimientos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/avisos/mantenimientos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/avisos/mantenimientos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/VistaAvisosMantenimiento.tsx`](file:///src/modules/cambios/views/VistaAvisosMantenimiento.tsx)
  - **Lineas de Codigo**: `129` | **Tamano**: `4 KB`
  - **Consumo de Endpoints API**:
    - [`/api/avisos/mantenimientos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/avisos/mantenimientos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/avisos/mantenimientos?_t=${Date.now()}).

## 4. Analisis Comparativo frente a ITIL v4 e ISO/IEC 20000

### Fortalezas de la Implementacion Actual:
1. **Alineacion Modular Estricta**: No existe logica funcional acoplada a carpetas de perfiles; todo el codigo de dominio reside en modulos independientes desacoplados.
2. **Seguridad RBAC en Capas**: El perfil cuenta con segregacion visual en el arbol de base de datos (`opciones_menu_perfiles`) y validacion de capacidad en el layout de sesion.
3. **Trazabilidad de Navegacion**: Las URLs del navegador coinciden exactamente 1:1 con la estructura de carpetas de modulos, cumpliendo con la exigencia de transparencia arquitectonica.

### Brechas Identificadas y Recomendaciones de Evolucion:
1. **Consistencia Operativa**: La totalidad de vistas terminales dispone de componentes React y controladores de API vinculados.
2. **Automatizacion de Flujos Transversales**: Profundizar la integracion automatica de notificaciones en tiempo real (WebSockets / SSE) para eventos criticos asignados a este perfil.
3. **Metricas y Auditoria de Sesion**: Fortalecer el registro detallado en `auditoria_sistema` de cada accion de creacion, modificacion o transicion de estado ejecutada por este perfil.

---
*Informe generado automaticamente mediante auditoria estatica y validacion de base de datos del Sistema ITSM.*