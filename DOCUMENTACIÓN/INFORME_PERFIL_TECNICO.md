# Informe Tecnico y Arquitectonico de Perfil: Tecnico

> [!IMPORTANT]
> **Perfil ID**: `2` | **Rol ITSM**: `Tecnico` | **Fecha de Auditoria**: 2026-10-22
> **Cumplimiento Funcional Global**: **90%** (36 de 40 opciones operativas)

## 1. Proposito del Rol y Marco Normativo ITIL v4

El Especialista Tecnico es el operador central de resolucion en primer y segundo nivel. Atiende tickets de incidentes, ejecuta tareas de cambio, realiza conteos fisicos de activos, aporta soluciones temporales a la KEDB y gestiona su agenda de intervenciones tecnicas.

- **Marco Primario**: ITIL v4 (Sistema de Valor del Servicio - SVS)
- **Estandares de Calidad y Seguridad**: ISO/IEC 20000-1 (Gestion de Servicios), ISO/IEC 27001 (Seguridad de la Informacion)
- **Nivel de Gobernanza**: Control de Acceso Basado en Roles (RBAC) con capacidades granulares y aislamiento modular

## 2. Resumen Ejecutivo de Cobertura y Madurez

| Metrica | Cantidad | Descripcion |
| :--- | :--- | :--- |
| **Modulos con Acceso** | 12 | Modulos de dominio alcanzados por el menu del perfil |
| **Opciones Totales en Menu** | 57 | Elementos registrados en la jerarquia de navegacion |
| **Encabezados de Agrupacion** | 17 | Categorias nivel 1 y 2 que estructuran el acordeon visual |
| **Vistas Terminales (URLs)** | 40 | Pantallas con ruta web directa (`page.tsx`) |
| **Desarrollo Completo (100%)** | 23 | Vistas con estado, hooks de reactividad y APIs operativas |
| **Desarrollo Funcional Base** | 13 | Componentes estables con soporte de datos integrado |
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

##### Opcion: "CMDB"

- **Nivel**: `1` | **Orden**: `5`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Conocimiento"

- **Nivel**: `1` | **Orden**: `6`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Catálogo de Servicios"

- **Nivel**: `1` | **Orden**: `7`
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

##### Opcion: "Mis cambios" (Padre: *Cambios*)

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

##### Opcion: "Mantenimiento" (Padre: *Activos*)

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

### 3.2. Modulo: `SERVICIOS`

- **Practica ITIL v4**: Gestion del Catalogo y Niveles de Servicio (Service Level Management - ITIL 4)
- **Objetivo de Control**: Definicion de metas de servicio realistas y medibles (SLA/OLA), monitoreo de semaforos de cumplimiento y gestion proactiva de escalamientos.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Catálogo de servicios" (Padre: *Catálogo de Servicios*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/servicios/catalogo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/catalogo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/catalogo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/catalogo/page.tsx)
- **Componente Modular de Vista**: *Envoltorio directo o redireccion en page.tsx*
- **Diagnostico de Desarrollo**: **Parcial (Solo Pagina / Sin Componente Modular)**
- **Detalle Tecnico**: Existe el archivo de ruta page.tsx pero no enlaza a un componente de vista desacoplado.

##### Opcion: "Objetivos de tiempo vigentes" (Padre: *SLA*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/servicios/sla/tecnico/objetivos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/tecnico/objetivos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/tecnico/objetivos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/tecnico/objetivos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/views/tecnico/VistaTecnicoSlaObjetivos.tsx`](file:///src/modules/servicios/views/tecnico/VistaTecnicoSlaObjetivos.tsx)
  - **Lineas de Codigo**: `204` | **Tamano**: `8 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Semaforo de SLA de mi cola" (Padre: *SLA*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/servicios/sla/tecnico/semaforo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/tecnico/semaforo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/tecnico/semaforo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/sla/tecnico/semaforo/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/views/tecnico/VistaTecnicoSlaSemaforo.tsx`](file:///src/modules/servicios/views/tecnico/VistaTecnicoSlaSemaforo.tsx)
  - **Lineas de Codigo**: `291` | **Tamano**: `14 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets?vista=${vista}&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets?vista=${vista}&_t=${Date.now()}).

### 3.3. Modulo: `MI-CUENTA`

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

### 3.4. Modulo: `CONOCIMIENTO`

- **Practica ITIL v4**: Gestion del Conocimiento (Knowledge Management & KCS - ITIL 4)
- **Objetivo de Control**: Captura, estructuracion, reutilizacion y mejora continua del conocimiento tecnico y de usuario para optimizar la resolucion y fomentar el autoservicio.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Base de conocimiento" (Padre: *Conocimiento*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/conocimiento/tecnico/base`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/base/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/base/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/base/page.tsx)
- **Componente Modular de Vista**: [`src/modules/conocimiento/views/VistaConocimientoBase.tsx`](file:///src/modules/conocimiento/views/VistaConocimientoBase.tsx)
  - **Lineas de Codigo**: `317` | **Tamano**: `11 KB`
  - **Consumo de Endpoints API**:
    - [`/api/conocimiento?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/conocimiento?_t=${Date.now()}).

##### Opcion: "Crear artículo" (Padre: *Conocimiento*)

- **Nivel**: `2` | **Orden**: `3`
- **URL Web**: [`/plataforma/conocimiento/tecnico/nuevo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/nuevo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/nuevo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/nuevo/page.tsx)
- **Componente Modular de Vista**: [`src/modules/conocimiento/views/VistaConocimientoNuevo.tsx`](file:///src/modules/conocimiento/views/VistaConocimientoNuevo.tsx)
  - **Lineas de Codigo**: `217` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/conocimiento`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/conocimiento).

##### Opcion: "Mis artículos" (Padre: *Conocimiento*)

- **Nivel**: `2` | **Orden**: `4`
- **URL Web**: [`/plataforma/conocimiento/tecnico/mis-articulos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/mis-articulos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/mis-articulos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/mis-articulos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/conocimiento/views/VistaConocimientoMisArticulos.tsx`](file:///src/modules/conocimiento/views/VistaConocimientoMisArticulos.tsx)
  - **Lineas de Codigo**: `196` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/conocimiento?vista=mis_articulos&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/conocimiento?vista=mis_articulos&_t=${Date.now()}).

##### Opcion: "Revisiones pendientes" (Padre: *Conocimiento*)

- **Nivel**: `2` | **Orden**: `6`
- **URL Web**: [`/plataforma/conocimiento/tecnico/revisiones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/revisiones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/revisiones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/tecnico/revisiones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/conocimiento/views/VistaConocimientoRevisiones.tsx`](file:///src/modules/conocimiento/views/VistaConocimientoRevisiones.tsx)
  - **Lineas de Codigo**: `153` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/conocimiento?vista=revisiones&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/conocimiento?vista=revisiones&_t=${Date.now()}).

### 3.5. Modulo: `PROBLEMAS`

- **Practica ITIL v4**: Gestion de Problemas (Problem Management - ITIL 4)
- **Objetivo de Control**: Reduccion de la probabilidad e impacto de incidentes mediante la identificacion de causas raiz (RCA), soluciones temporales (Workarounds) y Base de Errores Conocidos (KEDB).

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Candidatos de mi grupo" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `5`
- **URL Web**: [`/plataforma/problemas/tecnico/candidatos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/candidatos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/candidatos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/candidatos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/views/tecnico/VistaTecnicoProblemasCandidatos.tsx`](file:///src/modules/problemas/views/tecnico/VistaTecnicoProblemasCandidatos.tsx)
  - **Lineas de Codigo**: `182` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets?vista=todos&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets?vista=todos&_t=${Date.now()}).

##### Opcion: "Consultar KEDB" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `7`
- **URL Web**: [`/plataforma/problemas/tecnico/errores-conocidos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/errores-conocidos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/errores-conocidos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/errores-conocidos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/views/tecnico/VistaTecnicoProblemasErroresConocidos.tsx`](file:///src/modules/problemas/views/tecnico/VistaTecnicoProblemasErroresConocidos.tsx)
  - **Lineas de Codigo**: `238` | **Tamano**: `8 KB`
  - **Consumo de Endpoints API**:
    - [`/api/problemas?kedb=true&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/problemas?kedb=true&_t=${Date.now()}).

##### Opcion: "Problemas asignados a mí" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `11`
- **URL Web**: [`/plataforma/problemas/tecnico/asignados`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/asignados/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/asignados/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/asignados/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/views/tecnico/VistaTecnicoProblemasAsignados.tsx`](file:///src/modules/problemas/views/tecnico/VistaTecnicoProblemasAsignados.tsx)
  - **Lineas de Codigo**: `229` | **Tamano**: `8 KB`
  - **Consumo de Endpoints API**:
    - [`/api/problemas?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/problemas?_t=${Date.now()}).

##### Opcion: "Problemas de mi grupo" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `12`
- **URL Web**: [`/plataforma/problemas/tecnico/grupo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/grupo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/grupo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/grupo/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/views/tecnico/VistaTecnicoProblemasGrupo.tsx`](file:///src/modules/problemas/views/tecnico/VistaTecnicoProblemasGrupo.tsx)
  - **Lineas de Codigo**: `191` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/problemas?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/problemas?_t=${Date.now()}).

##### Opcion: "Registrar problema" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `14`
- **URL Web**: [`/plataforma/problemas/tecnico/nuevo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/nuevo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/nuevo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/tecnico/nuevo/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/views/tecnico/VistaTecnicoProblemasNuevo.tsx`](file:///src/modules/problemas/views/tecnico/VistaTecnicoProblemasNuevo.tsx)
  - **Lineas de Codigo**: `220` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/problemas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/problemas).

### 3.6. Modulo: `OPERACION`

- **Practica ITIL v4**: Gestion de Operaciones y Monitoreo (Service Operations & Event Management - ITIL 4)
- **Objetivo de Control**: Supervision centralizada del estado de los servicios, gestion de tareas diarias, alertas tempranas y tableros unificados de control operativo.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Panel del técnico" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `8`
- **URL Web**: [`/plataforma/operacion/paneles/tecnico`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/tecnico/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/tecnico/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/tecnico/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/paneles/tecnico/VistaTecnicoPanel.tsx`](file:///src/modules/operacion/paneles/tecnico/VistaTecnicoPanel.tsx)
  - **Lineas de Codigo**: `632` | **Tamano**: `26 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets?vista=asignados&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/route.ts)
    - [`/api/tickets?vista=bandeja&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/route.ts)
    - [`/api/operacion/recordatorios?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/recordatorios/route.ts)
    - [`/api/tickets?vista=resueltos&solo_asignados_a_mi=1&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets?vista=asignados&_t=${Date.now()}, /api/tickets?vista=bandeja&_t=${Date.now()}, /api/operacion/recordatorios?_t=${Date.now()}, /api/tickets?vista=resueltos&solo_asignados_a_mi=1&_t=${Date.now()}).

##### Opcion: "Mi agenda y disponibilidad" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `9`
- **URL Web**: [`/plataforma/operacion/agenda`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/agenda/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/agenda/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/agenda/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/agenda/VistaTecnicoAgenda.tsx`](file:///src/modules/operacion/agenda/VistaTecnicoAgenda.tsx)
  - **Lineas de Codigo**: `522` | **Tamano**: `19 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets?vista=asignados&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/route.ts)
    - [`/api/operacion/recordatorios?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/recordatorios/route.ts)
    - [`/api/operacion/recordatorios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/recordatorios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets?vista=asignados&_t=${Date.now()}, /api/operacion/recordatorios?_t=${Date.now()}, /api/operacion/recordatorios).

##### Opcion: "Mis tareas" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `11`
- **URL Web**: [`/plataforma/operacion/tareas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/tareas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/tareas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/tareas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/agenda/VistaTecnicoTareas.tsx`](file:///src/modules/operacion/agenda/VistaTecnicoTareas.tsx)
  - **Lineas de Codigo**: `531` | **Tamano**: `19 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/recordatorios?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/recordatorios/route.ts)
    - [`/api/operacion/recordatorios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/recordatorios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/recordatorios?_t=${Date.now()}, /api/operacion/recordatorios).

### 3.7. Modulo: `TICKETS`

- **Practica ITIL v4**: Gestion de Incidentes y Mesa de Servicio (Service Desk & Incident Management - ITIL 4)
- **Objetivo de Control**: Restauracion del servicio normal lo antes posible minimizando el impacto en el negocio, con categorizacion, priorizacion y escalamiento estructurado.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Mi desempeño" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `10`
- **URL Web**: [`/plataforma/tickets/desempeno`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/desempeno/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/desempeno/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/desempeno/page.tsx)
- **Componente Modular de Vista**: *Envoltorio directo o redireccion en page.tsx*
- **Diagnostico de Desarrollo**: **Parcial (Solo Pagina / Sin Componente Modular)**
- **Detalle Tecnico**: Existe el archivo de ruta page.tsx pero no enlaza a un componente de vista desacoplado.

##### Opcion: "Sala de crisis (Mayor)" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `10`
- **URL Web**: [`/plataforma/tickets/mesa/incidente-mayor`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/mesa/incidente-mayor/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/mesa/incidente-mayor/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/mesa/incidente-mayor/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/views/tecnico/VistaTecnicoMesaIncidenteMayor.tsx`](file:///src/modules/tickets/views/tecnico/VistaTecnicoMesaIncidenteMayor.tsx)
  - **Lineas de Codigo**: `213` | **Tamano**: `10 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tickets/incidente-mayor?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/incidente-mayor/route.ts)
    - [`/api/tickets/incidente-mayor`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/incidente-mayor/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tickets/incidente-mayor?_t=${Date.now()}, /api/tickets/incidente-mayor).

##### Opcion: "Busqueda avanzada de tickets" (Padre: *Operacion de la mesa*)

- **Nivel**: `3` | **Orden**: `10`
- **URL Web**: [`/plataforma/tickets/mesa/buscar`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/mesa/buscar/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/mesa/buscar/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/mesa/buscar/page.tsx)
- **Componente Modular de Vista**: *Envoltorio directo o redireccion en page.tsx*
- **Diagnostico de Desarrollo**: **Parcial (Solo Pagina / Sin Componente Modular)**
- **Detalle Tecnico**: Existe el archivo de ruta page.tsx pero no enlaza a un componente de vista desacoplado.

##### Opcion: "Historial de mis tickets" (Padre: *Operacion de la mesa*)

- **Nivel**: `3` | **Orden**: `11`
- **URL Web**: [`/plataforma/tickets/gestion/mios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/mios/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/mios/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/gestion/mios/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/gestion/mios/VistaTicketsGestionMios.tsx`](file:///src/modules/tickets/gestion/mios/VistaTicketsGestionMios.tsx)
  - **Lineas de Codigo**: `674` | **Tamano**: `25 KB`
  - **Consumo de Endpoints API**:
    - `${endpoint}?vista=mios&_t=${Date.now()}`
    - [`/api/tickets/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/catalogos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (${endpoint}?vista=mios&_t=${Date.now()}, /api/tickets/catalogos).

### 3.8. Modulo: `ACTIVOS`

- **Practica ITIL v4**: Gestion de Activos de TI (ITAM - ITIL 4 / ISO 19770)
- **Objetivo de Control**: Control del ciclo de vida financiero, contractual y fisico de los activos de TI, asegurando valor optimo, cumplimiento de licencias y disposicion segura.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Mantenimiento y reparaciones" (Padre: *Mantenimiento*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/activos/tecnico/mantenimiento`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/mantenimiento/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/mantenimiento/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/mantenimiento/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/tecnico/VistaTecnicoActivosMantenimiento.tsx`](file:///src/modules/activos/views/tecnico/VistaTecnicoActivosMantenimiento.tsx)
  - **Lineas de Codigo**: `234` | **Tamano**: `9 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Consultar licencias" (Padre: *Licencias*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/activos/tecnico/licencias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/licencias/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/licencias/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/licencias/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/tecnico/VistaTecnicoActivosLicencias.tsx`](file:///src/modules/activos/views/tecnico/VistaTecnicoActivosLicencias.tsx)
  - **Lineas de Codigo**: `140` | **Tamano**: `5 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Inventario físico en campo" (Padre: *Inventario*)

- **Nivel**: `3` | **Orden**: `6`
- **URL Web**: [`/plataforma/activos/tecnico/conteos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/conteos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/conteos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/conteos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/tecnico/VistaTecnicoActivosConteos.tsx`](file:///src/modules/activos/views/tecnico/VistaTecnicoActivosConteos.tsx)
  - **Lineas de Codigo**: `381` | **Tamano**: `13 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Inventario técnico" (Padre: *Inventario*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/activos/tecnico/inventario`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/inventario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/inventario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/tecnico/inventario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/tecnico/VistaTecnicoActivosInventario.tsx`](file:///src/modules/activos/views/tecnico/VistaTecnicoActivosInventario.tsx)
  - **Lineas de Codigo**: `254` | **Tamano**: `9 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos?_t=${Date.now()}).

### 3.9. Modulo: `CAMBIOS`

- **Practica ITIL v4**: Habilitacion del Cambio (Change Enablement - ITIL 4 / ISO 20000 Cl. 8.5)
- **Objetivo de Control**: Maximizacion de cambios exitosos evaluando riesgos, autorizando mediante autoridades de cambio (CAB/Emergencia) y gestionando el calendario de congelamiento.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Calendario de mis cambios" (Padre: *Mis cambios*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/cambios/tecnico/calendario`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/calendario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/calendario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/calendario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/tecnico/VistaTecnicoCambiosCalendario.tsx`](file:///src/modules/cambios/views/tecnico/VistaTecnicoCambiosCalendario.tsx)
  - **Lineas de Codigo**: `149` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios?vista=calendario&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios?vista=calendario&_t=${Date.now()}).

##### Opcion: "Cambios por implementar" (Padre: *Mis cambios*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/cambios/tecnico/implementacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/implementacion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/implementacion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/implementacion/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/tecnico/VistaTecnicoCambiosImplementacion.tsx`](file:///src/modules/cambios/views/tecnico/VistaTecnicoCambiosImplementacion.tsx)
  - **Lineas de Codigo**: `344` | **Tamano**: `14 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios?vista=implementacion&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios?vista=implementacion&_t=${Date.now()}).

##### Opcion: "Cambios en mis servicios" (Padre: *Mis cambios*)

- **Nivel**: `3` | **Orden**: `6`
- **URL Web**: [`/plataforma/cambios/tecnico/impacto`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/impacto/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/impacto/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/impacto/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/tecnico/VistaTecnicoCambiosImpacto.tsx`](file:///src/modules/cambios/views/tecnico/VistaTecnicoCambiosImpacto.tsx)
  - **Lineas de Codigo**: `191` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios?vista=impacto&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
    - [`/api/cambios/tecnico/enterado`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/tecnico/enterado/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios?vista=impacto&_t=${Date.now()}, /api/cambios/tecnico/enterado).

##### Opcion: "Historial de mis cambios" (Padre: *Mis cambios*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/cambios/tecnico/historial`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/historial/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/historial/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/historial/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/tecnico/VistaTecnicoCambiosHistorial.tsx`](file:///src/modules/cambios/views/tecnico/VistaTecnicoCambiosHistorial.tsx)
  - **Lineas de Codigo**: `139` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios?vista=historial&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios?vista=historial&_t=${Date.now()}).

##### Opcion: "Mis cambios" (Padre: *Mis cambios*)

- **Nivel**: `3` | **Orden**: `8`
- **URL Web**: [`/plataforma/cambios/tecnico/mis-cambios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/mis-cambios/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/mis-cambios/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/mis-cambios/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/views/tecnico/VistaTecnicoCambiosMisCambios.tsx`](file:///src/modules/cambios/views/tecnico/VistaTecnicoCambiosMisCambios.tsx)
  - **Lineas de Codigo**: `298` | **Tamano**: `11 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cambios?vista=mis_cambios&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cambios/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cambios?vista=mis_cambios&_t=${Date.now()}).

##### Opcion: "Registrar solicitud RFC" (Padre: *Mis cambios*)

- **Nivel**: `3` | **Orden**: `10`
- **URL Web**: [`/plataforma/cambios/tecnico/nuevo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/nuevo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/nuevo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/tecnico/nuevo/page.tsx)
- **Componente Modular de Vista**: [`src/app/plataforma/cambios/gestion/crear/page.tsx`](file:///src/app/plataforma/cambios/gestion/crear/page.tsx)
  - **Lineas de Codigo**: `6` | **Tamano**: `0 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

### 3.10. Modulo: `INCIDENTES`

- **Practica ITIL v4**: Gobernanza y Estructura Base de Plataforma (Platform Governance - ITIL 4)
- **Objetivo de Control**: Estructuracion jerarquica de accesos y navegacion basada en roles.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Incidentes asignados a mi" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/incidentes/asignados`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/asignados/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/asignados/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/asignados/page.tsx)
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

##### Opcion: "Registrar incidente" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/incidentes/crear`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/crear/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/crear/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/crear/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.11. Modulo: `SOLICITUDES`

- **Practica ITIL v4**: Gestion de Solicitudes de Servicio (Service Request Management - ITIL 4)
- **Objetivo de Control**: Procesamiento eficiente de solicitudes pre-aprobadas y estandarizadas con flujo de aprobaciones de negocio y cumplimiento de acuerdos de entrega.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Solicitudes asignadas a mi" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/solicitudes/asignados`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/asignados/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/asignados/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/asignados/page.tsx)
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

##### Opcion: "Registrar solicitud" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/solicitudes/crear`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/crear/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/crear/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/crear/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.12. Modulo: `CMDB`

- **Practica ITIL v4**: Gestion de la Configuracion del Servicio (SACM - ITIL 4)
- **Objetivo de Control**: Mantenimiento de informacion precisa y confiable sobre los elementos de configuracion (CIs) y sus relaciones e interdependencias en la entrega de servicios.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Mapa de topología CMDB" (Padre: *CMDB*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/cmdb/mapa`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/mapa/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/mapa/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/mapa/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/views/tecnico/VistaTecnicoActivosMapa.tsx`](file:///src/modules/cmdb/views/tecnico/VistaTecnicoActivosMapa.tsx)
  - **Lineas de Codigo**: `182` | **Tamano**: `7 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

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