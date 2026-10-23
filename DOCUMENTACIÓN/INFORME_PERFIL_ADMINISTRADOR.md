# Informe Tecnico y Arquitectonico de Perfil: Administrador

> [!IMPORTANT]
> **Perfil ID**: `1` | **Rol ITSM**: `Administrador` | **Fecha de Auditoria**: 2026-10-22
> **Cumplimiento Funcional Global**: **81%** (39 de 48 opciones operativas)

## 1. Proposito del Rol y Marco Normativo ITIL v4

El Administrador del Sistema posee control total de configuracion sobre las dimensiones de la gestion del servicio ITIL 4 (Organizaciones y personas, Informacion y tecnologia, Socios y proveedores, Flujos de valor y procesos). Configura esquemas de ciclo de vida, modelos de cambio, matrices de prioridad, SLAs y politicas de gobernanza.

- **Marco Primario**: ITIL v4 (Sistema de Valor del Servicio - SVS)
- **Estandares de Calidad y Seguridad**: ISO/IEC 20000-1 (Gestion de Servicios), ISO/IEC 27001 (Seguridad de la Informacion)
- **Nivel de Gobernanza**: Control de Acceso Basado en Roles (RBAC) con capacidades granulares y aislamiento modular

## 2. Resumen Ejecutivo de Cobertura y Madurez

| Metrica | Cantidad | Descripcion |
| :--- | :--- | :--- |
| **Modulos con Acceso** | 15 | Modulos de dominio alcanzados por el menu del perfil |
| **Opciones Totales en Menu** | 68 | Elementos registrados en la jerarquia de navegacion |
| **Encabezados de Agrupacion** | 20 | Categorias nivel 1 y 2 que estructuran el acordeon visual |
| **Vistas Terminales (URLs)** | 48 | Pantallas con ruta web directa (`page.tsx`) |
| **Desarrollo Completo (100%)** | 32 | Vistas con estado, hooks de reactividad y APIs operativas |
| **Desarrollo Funcional Base** | 7 | Componentes estables con soporte de datos integrado |
| **Desarrollo Parcial / Pendiente** | 9 | Vistas con implementacion parcial o logica en consolidacion |

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

##### Opcion: "Operación"

- **Nivel**: `1` | **Orden**: `8`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Reportes"

- **Nivel**: `1` | **Orden**: `9`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Organización"

- **Nivel**: `1` | **Orden**: `10`
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

##### Opcion: "Identidades" (Padre: *Plataforma*)

- **Nivel**: `2` | **Orden**: `5`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Menú y notificaciones" (Padre: *Plataforma*)

- **Nivel**: `2` | **Orden**: `6`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Configuración de activos" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `7`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

### 3.2. Modulo: `SEGURIDAD`

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

##### Opcion: "Gestión de usuarios" (Padre: *Identidades*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/seguridad/usuarios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/usuarios/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/usuarios/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/seguridad/usuarios/page.tsx)
- **Componente Modular de Vista**: [`src/modules/identidades/config/usuarios/VistaUsuarios.tsx`](file:///src/modules/identidades/config/usuarios/VistaUsuarios.tsx)
  - **Lineas de Codigo**: `1343` | **Tamano**: `52 KB`
  - **Consumo de Endpoints API**:
    - [`/api/usuarios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/usuarios/route.ts)
    - [`/api/identidades/perfiles`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/identidades/perfiles/route.ts)
    - `/api/usuarios/${formulario.id_usuario}`
    - [`/api/usuarios/enviar-credenciales`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/usuarios/enviar-credenciales/route.ts)
    - `/api/usuarios/${usuario.id_usuario}`
    - `/api/usuarios/${idUsuario}/desbloquear`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/usuarios, /api/identidades/perfiles, /api/usuarios/${formulario.id_usuario}, /api/usuarios/enviar-credenciales, /api/usuarios/${usuario.id_usuario}, /api/usuarios/${idUsuario}/desbloquear).

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

### 3.4. Modulo: `REPORTES`

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

##### Opcion: "Tableros" (Padre: *Reportes*)

- **Nivel**: `2` | **Orden**: `8`
- **URL Web**: [`/plataforma/reportes/tableros`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/tableros/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/tableros/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/tableros/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.5. Modulo: `CONOCIMIENTO`

- **Practica ITIL v4**: Gestion del Conocimiento (Knowledge Management & KCS - ITIL 4)
- **Objetivo de Control**: Captura, estructuracion, reutilizacion y mejora continua del conocimiento tecnico y de usuario para optimizar la resolucion y fomentar el autoservicio.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Artículos y gobernanza KCS" (Padre: *Conocimiento*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/conocimiento/configuracion/articulos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/configuracion/articulos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/configuracion/articulos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/configuracion/articulos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/conocimiento/config/VistaConocimientoConfig.tsx`](file:///src/modules/conocimiento/config/VistaConocimientoConfig.tsx)
  - **Lineas de Codigo**: `898` | **Tamano**: `43 KB`
  - **Consumo de Endpoints API**:
    - [`/api/conocimiento`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/route.ts)
    - [`/api/conocimiento/categorias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/categorias/route.ts)
    - [`/api/conocimiento/politicas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/politicas/route.ts)
    - `/api/conocimiento/${id}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/conocimiento, /api/conocimiento/categorias, /api/conocimiento/politicas, /api/conocimiento/${id}).

##### Opcion: "Configuración categorías" (Padre: *Conocimiento*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/conocimiento/configuracion/categorias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/configuracion/categorias/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/configuracion/categorias/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/conocimiento/configuracion/categorias/page.tsx)
- **Componente Modular de Vista**: [`src/modules/conocimiento/config/categorias/VistaConfigCategorias.tsx`](file:///src/modules/conocimiento/config/categorias/VistaConfigCategorias.tsx)
  - **Lineas de Codigo**: `774` | **Tamano**: `29 KB`
  - **Consumo de Endpoints API**:
    - [`/api/conocimiento/categorias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/categorias/route.ts)
    - [`/api/conocimiento/categorias?id=${categoriaEliminar.id_categoria}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/categorias/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/conocimiento/categorias, /api/conocimiento/categorias?id=${categoriaEliminar.id_categoria}).

### 3.6. Modulo: `ORGANIZACION`

- **Practica ITIL v4**: Gestion del Talento y la Fuerza Laboral (Workforce & Talent Management - ITIL 4)
- **Objetivo de Control**: Asignacion eficiente de capacidades tecnicas, balance de carga de trabajo, cobertura de turnos y administracion de ausencias del personal.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Departamentos empresariales" (Padre: *Organización*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/organizacion/departamentos-empresa`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/departamentos-empresa/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/departamentos-empresa/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/departamentos-empresa/page.tsx)
- **Componente Modular de Vista**: [`src/modules/organizacion/config/departamentos-empresa/VistaDepartamentosEmpresa.tsx`](file:///src/modules/organizacion/config/departamentos-empresa/VistaDepartamentosEmpresa.tsx)
  - **Lineas de Codigo**: `230` | **Tamano**: `8 KB`
  - **Consumo de Endpoints API**:
    - [`/api/departamentos-empresa`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/departamentos-empresa/route.ts)
    - `/api/departamentos-empresa/${d.id_departamento_empresa}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/departamentos-empresa, /api/departamentos-empresa/${d.id_departamento_empresa}).

##### Opcion: "Grupos resolutores de TI" (Padre: *Organización*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/organizacion/departamentos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/departamentos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/departamentos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/departamentos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/organizacion/config/departamentos/VistaDepartamentos.tsx`](file:///src/modules/organizacion/config/departamentos/VistaDepartamentos.tsx)
  - **Lineas de Codigo**: `840` | **Tamano**: `36 KB`
  - **Consumo de Endpoints API**:
    - [`/api/departamentos-ti`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/departamentos-ti/route.ts)
    - [`/api/usuarios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/usuarios/route.ts)
    - `/api/departamentos-ti/${dep.id_departamento}`
    - [`/api/tecnicos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tecnicos/route.ts)
    - `/api/tecnicos/${t.id_usuario}`
    - `/api/departamentos-ti/${deptoEditando.id_departamento}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/departamentos-ti, /api/usuarios, /api/departamentos-ti/${dep.id_departamento}, /api/tecnicos, /api/tecnicos/${t.id_usuario}, /api/departamentos-ti/${deptoEditando.id_departamento}).

##### Opcion: "Supervisores" (Padre: *Organización*)

- **Nivel**: `2` | **Orden**: `3`
- **URL Web**: [`/plataforma/organizacion/departamentos/supervisores`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/departamentos/supervisores/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/departamentos/supervisores/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/departamentos/supervisores/page.tsx)
- **Componente Modular de Vista**: [`src/modules/organizacion/config/departamentos/VistaDepartamentos.tsx`](file:///src/modules/organizacion/config/departamentos/VistaDepartamentos.tsx)
  - **Lineas de Codigo**: `840` | **Tamano**: `36 KB`
  - **Consumo de Endpoints API**:
    - [`/api/departamentos-ti`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/departamentos-ti/route.ts)
    - [`/api/usuarios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/usuarios/route.ts)
    - `/api/departamentos-ti/${dep.id_departamento}`
    - [`/api/tecnicos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tecnicos/route.ts)
    - `/api/tecnicos/${t.id_usuario}`
    - `/api/departamentos-ti/${deptoEditando.id_departamento}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/departamentos-ti, /api/usuarios, /api/departamentos-ti/${dep.id_departamento}, /api/tecnicos, /api/tecnicos/${t.id_usuario}, /api/departamentos-ti/${deptoEditando.id_departamento}).

##### Opcion: "Técnicos y soporte" (Padre: *Organización*)

- **Nivel**: `2` | **Orden**: `4`
- **URL Web**: [`/plataforma/organizacion/tecnicos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/tecnicos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/tecnicos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/organizacion/tecnicos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/organizacion/config/tecnicos/VistaTecnicos.tsx`](file:///src/modules/organizacion/config/tecnicos/VistaTecnicos.tsx)
  - **Lineas de Codigo**: `1138` | **Tamano**: `47 KB`
  - **Consumo de Endpoints API**:
    - [`/api/tecnicos?${params.toString()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tecnicos/route.ts)
    - [`/api/departamentos-ti`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/departamentos-ti/route.ts)
    - [`/api/usuarios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/usuarios/route.ts)
    - [`/api/organizacion/tecnicos/ausencias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/organizacion/tecnicos/ausencias/route.ts)
    - [`/api/organizacion/tecnicos/ausencias?id=${id}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/organizacion/tecnicos/ausencias/route.ts)
    - `/api/tecnicos/${tecnicoEditando.id_usuario}`
    - [`/api/tecnicos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tecnicos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/tecnicos?${params.toString()}, /api/departamentos-ti, /api/usuarios, /api/organizacion/tecnicos/ausencias, /api/organizacion/tecnicos/ausencias?id=${id}, /api/tecnicos/${tecnicoEditando.id_usuario}, /api/tecnicos).

### 3.7. Modulo: `SERVICIOS`

- **Practica ITIL v4**: Gestion del Catalogo y Niveles de Servicio (Service Level Management - ITIL 4)
- **Objetivo de Control**: Definicion de metas de servicio realistas y medibles (SLA/OLA), monitoreo de semaforos de cumplimiento y gestion proactiva de escalamientos.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Configuración de categorías" (Padre: *Catálogo de Servicios*)

- **Nivel**: `2` | **Orden**: `2`
- **URL Web**: [`/plataforma/servicios/configuracion/categorias`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/categorias/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/categorias/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/categorias/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/admin/servicios/GestionCategorias.tsx`](file:///src/modules/servicios/admin/servicios/GestionCategorias.tsx)
  - **Lineas de Codigo**: `1064` | **Tamano**: `46 KB`
  - **Consumo de Endpoints API**:
    - [`/api/conocimiento/categorias?estado=todos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/conocimiento/categorias/route.ts)
    - `/api/conocimiento/categorias/${c.id_categoria}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/conocimiento/categorias?estado=todos, /api/conocimiento/categorias/${c.id_categoria}).

##### Opcion: "Crear servicio" (Padre: *Catálogo de Servicios*)

- **Nivel**: `2` | **Orden**: `3`
- **URL Web**: [`/plataforma/servicios/configuracion/crear`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/crear/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/crear/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/crear/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/admin/servicios/page.tsx`](file:///src/modules/servicios/admin/servicios/page.tsx)
  - **Lineas de Codigo**: `2289` | **Tamano**: `102 KB`
  - **Consumo de Endpoints API**:
    - [`/api/servicios?${params.toString()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/servicios/route.ts)
    - [`/api/tickets/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/catalogos/route.ts)
    - [`/api/servicios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/servicios/route.ts)
    - `/api/servicios/${servicioSeleccionado.id_servicio}`
    - `/api/servicios/${servicioSeleccionado.id_servicio}/workflow`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/servicios?${params.toString()}, /api/tickets/catalogos, /api/servicios, /api/servicios/${servicioSeleccionado.id_servicio}, /api/servicios/${servicioSeleccionado.id_servicio}/workflow).

##### Opcion: "Objetivos SLA" (Padre: *Catálogo de Servicios*)

- **Nivel**: `2` | **Orden**: `4`
- **URL Web**: [`/plataforma/servicios/configuracion/sla`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/sla/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/sla/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/sla/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/admin/servicios/sla/page.tsx`](file:///src/modules/servicios/admin/servicios/sla/page.tsx)
  - **Lineas de Codigo**: `40` | **Tamano**: `1 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Servicios de incidentes" (Padre: *Catálogo de Servicios*)

- **Nivel**: `2` | **Orden**: `5`
- **URL Web**: [`/plataforma/servicios/configuracion/incidentes`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/incidentes/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/incidentes/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/incidentes/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/admin/servicios/page.tsx`](file:///src/modules/servicios/admin/servicios/page.tsx)
  - **Lineas de Codigo**: `2289` | **Tamano**: `102 KB`
  - **Consumo de Endpoints API**:
    - [`/api/servicios?${params.toString()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/servicios/route.ts)
    - [`/api/tickets/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/catalogos/route.ts)
    - [`/api/servicios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/servicios/route.ts)
    - `/api/servicios/${servicioSeleccionado.id_servicio}`
    - `/api/servicios/${servicioSeleccionado.id_servicio}/workflow`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/servicios?${params.toString()}, /api/tickets/catalogos, /api/servicios, /api/servicios/${servicioSeleccionado.id_servicio}, /api/servicios/${servicioSeleccionado.id_servicio}/workflow).

##### Opcion: "Servicios de solicitudes" (Padre: *Catálogo de Servicios*)

- **Nivel**: `2` | **Orden**: `6`
- **URL Web**: [`/plataforma/servicios/configuracion/solicitudes`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/solicitudes/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/solicitudes/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/servicios/configuracion/solicitudes/page.tsx)
- **Componente Modular de Vista**: [`src/modules/servicios/admin/servicios/page.tsx`](file:///src/modules/servicios/admin/servicios/page.tsx)
  - **Lineas de Codigo**: `2289` | **Tamano**: `102 KB`
  - **Consumo de Endpoints API**:
    - [`/api/servicios?${params.toString()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/servicios/route.ts)
    - [`/api/tickets/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/tickets/catalogos/route.ts)
    - [`/api/servicios`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/servicios/route.ts)
    - `/api/servicios/${servicioSeleccionado.id_servicio}`
    - `/api/servicios/${servicioSeleccionado.id_servicio}/workflow`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/servicios?${params.toString()}, /api/tickets/catalogos, /api/servicios, /api/servicios/${servicioSeleccionado.id_servicio}, /api/servicios/${servicioSeleccionado.id_servicio}/workflow).

### 3.8. Modulo: `CAMBIOS`

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

##### Opcion: "Configuración de formulario" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `5`
- **URL Web**: [`/plataforma/cambios/configuracion/formulario`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/formulario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/formulario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/formulario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/ui.ts`](file:///src/modules/cambios/ui.ts)
  - **Lineas de Codigo**: `25` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Flujo de evaluación y PIR" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `6`
- **URL Web**: [`/plataforma/cambios/configuracion/flujo-evaluacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/flujo-evaluacion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/flujo-evaluacion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/flujo-evaluacion/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/ui.ts`](file:///src/modules/cambios/ui.ts)
  - **Lineas de Codigo**: `25` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Tipos de cambio y requisitos" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `7`
- **URL Web**: [`/plataforma/cambios/configuracion/tipos-requisitos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/tipos-requisitos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/tipos-requisitos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/tipos-requisitos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/ui.ts`](file:///src/modules/cambios/ui.ts)
  - **Lineas de Codigo**: `25` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Notificaciones de cambios" (Padre: *Cambios*)

- **Nivel**: `2` | **Orden**: `8`
- **URL Web**: [`/plataforma/cambios/configuracion/notificaciones-calendario`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cambios/configuracion/notificaciones-calendario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cambios/ui.ts`](file:///src/modules/cambios/ui.ts)
  - **Lineas de Codigo**: `25` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

### 3.9. Modulo: `OPERACION`

- **Practica ITIL v4**: Gestion de Operaciones y Monitoreo (Service Operations & Event Management - ITIL 4)
- **Objetivo de Control**: Supervision centralizada del estado de los servicios, gestion de tareas diarias, alertas tempranas y tableros unificados de control operativo.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

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

##### Opcion: "Eventos y resiliencia" (Padre: *Operación*)

- **Nivel**: `2` | **Orden**: `3`
- **URL Web**: [`/plataforma/operacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/capacidades.ts`](file:///src/shared/lib/capacidades.ts)
  - **Lineas de Codigo**: `434` | **Tamano**: `14 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

##### Opcion: "Salud del sistema" (Padre: *Plataforma*)

- **Nivel**: `2` | **Orden**: `4`
- **URL Web**: [`/plataforma/operacion/salud-sistema`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/salud-sistema/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/salud-sistema/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/salud-sistema/page.tsx)
- **Componente Modular de Vista**: [`src/modules/plataforma/config/salud/VistaSaludSistema.tsx`](file:///src/modules/plataforma/config/salud/VistaSaludSistema.tsx)
  - **Lineas de Codigo**: `464` | **Tamano**: `16 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/salud-sistema?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/salud-sistema/route.ts)
    - [`/api/operacion/salud-sistema/tareas?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/salud-sistema/tareas/route.ts)
    - [`/api/operacion/salud-sistema/correo?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/salud-sistema/correo/route.ts)
    - [`/api/operacion/salud-sistema/tareas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/salud-sistema/tareas/route.ts)
    - [`/api/operacion/salud-sistema/correo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/salud-sistema/correo/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/salud-sistema?_t=${Date.now()}, /api/operacion/salud-sistema/tareas?_t=${Date.now()}, /api/operacion/salud-sistema/correo?_t=${Date.now()}, /api/operacion/salud-sistema/tareas, /api/operacion/salud-sistema/correo).

##### Opcion: "Panel de administración" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `12`
- **URL Web**: [`/plataforma/operacion/paneles/administrador`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/administrador/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/administrador/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/paneles/administrador/page.tsx)
- **Componente Modular de Vista**: [`src/modules/operacion/paneles/administrador/VistaPanelAdministrador.tsx`](file:///src/modules/operacion/paneles/administrador/VistaPanelAdministrador.tsx)
  - **Lineas de Codigo**: `141` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/paneles/administrador?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/paneles/administrador/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/paneles/administrador?_t=${Date.now()}).

##### Opcion: "Configuración de contacto" (Padre: *Menú y notificaciones*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/operacion/notificaciones/contacto`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/notificaciones/contacto/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/notificaciones/contacto/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/notificaciones/contacto/page.tsx)
- **Componente Modular de Vista**: [`src/modules/plataforma/config/notificaciones/VistaNotificaciones.tsx`](file:///src/modules/plataforma/config/notificaciones/VistaNotificaciones.tsx)
  - **Lineas de Codigo**: `848` | **Tamano**: `37 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/configuracion?clave=plantillas_correo_html`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/configuracion/route.ts)
    - [`/api/operacion/configuracion?clave=canales_comunicacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/configuracion/route.ts)
    - [`/api/operacion/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/configuracion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/configuracion?clave=plantillas_correo_html, /api/operacion/configuracion?clave=canales_comunicacion, /api/operacion/configuracion).

##### Opcion: "Estructura del menú" (Padre: *Menú y notificaciones*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/operacion/menu`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/menu/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/menu/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/menu/page.tsx)
- **Componente Modular de Vista**: [`src/modules/plataforma/config/menu/VistaMenu.tsx`](file:///src/modules/plataforma/config/menu/VistaMenu.tsx)
  - **Lineas de Codigo**: `515` | **Tamano**: `20 KB`
  - **Consumo de Endpoints API**:
    - [`/api/menu/admin`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/menu/admin/route.ts)
    - [`/api/identidades/perfiles`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/identidades/perfiles/route.ts)
    - `/api/menu/admin/${op.id_opcion_menu}`
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/menu/admin, /api/identidades/perfiles, /api/menu/admin/${op.id_opcion_menu}).

##### Opcion: "Plantillas de correo y avisos" (Padre: *Menú y notificaciones*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/operacion/notificaciones/plantillas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/notificaciones/plantillas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/notificaciones/plantillas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/operacion/notificaciones/plantillas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/plataforma/config/notificaciones/VistaNotificaciones.tsx`](file:///src/modules/plataforma/config/notificaciones/VistaNotificaciones.tsx)
  - **Lineas de Codigo**: `848` | **Tamano**: `37 KB`
  - **Consumo de Endpoints API**:
    - [`/api/operacion/configuracion?clave=plantillas_correo_html`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/configuracion/route.ts)
    - [`/api/operacion/configuracion?clave=canales_comunicacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/configuracion/route.ts)
    - [`/api/operacion/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/operacion/configuracion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/operacion/configuracion?clave=plantillas_correo_html, /api/operacion/configuracion?clave=canales_comunicacion, /api/operacion/configuracion).

### 3.10. Modulo: `CMDB`

- **Practica ITIL v4**: Gestion de la Configuracion del Servicio (SACM - ITIL 4)
- **Objetivo de Control**: Mantenimiento de informacion precisa y confiable sobre los elementos de configuracion (CIs) y sus relaciones e interdependencias en la entrega de servicios.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Tipos de CI y relaciones CMDB" (Padre: *CMDB*)

- **Nivel**: `2` | **Orden**: `5`
- **URL Web**: [`/plataforma/cmdb/configuracion/relaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/configuracion/relaciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/configuracion/relaciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/configuracion/relaciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/config/cmdb-relaciones/VistaCmdbRelaciones.tsx`](file:///src/modules/cmdb/config/cmdb-relaciones/VistaCmdbRelaciones.tsx)
  - **Lineas de Codigo**: `614` | **Tamano**: `23 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cmdb/configuracion/relaciones/configuracion?pestana=${tabActiva}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/configuracion/relaciones/configuracion/route.ts)
    - [`/api/cmdb/configuracion/relaciones/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/configuracion/relaciones/configuracion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cmdb/configuracion/relaciones/configuracion?pestana=${tabActiva}, /api/cmdb/configuracion/relaciones/configuracion).

### 3.11. Modulo: `PROBLEMAS`

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

##### Opcion: "Configuración de formulario" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `18`
- **URL Web**: [`/plataforma/problemas/configuracion/formulario`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/configuracion/formulario/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/configuracion/formulario/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/configuracion/formulario/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/config/formulario/VistaFormularioProblemas.tsx`](file:///src/modules/problemas/config/formulario/VistaFormularioProblemas.tsx)
  - **Lineas de Codigo**: `736` | **Tamano**: `28 KB`
  - **Consumo de Endpoints API**:
    - [`/api/problemas/configuracion/configuracion?ambito=${tabActiva}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/configuracion/route.ts)
    - [`/api/problemas/configuracion/campos-personalizados?entidad=problema`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/campos-personalizados/route.ts)
    - [`/api/problemas/configuracion/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/catalogos/route.ts)
    - [`/api/problemas/configuracion/matriz-prioridad`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/matriz-prioridad/route.ts)
    - [`/api/problemas/configuracion/plantillas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/plantillas/route.ts)
    - [`/api/problemas/configuracion/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/configuracion/route.ts)
    - [`/api/problemas/configuracion/configuracion?ambito=${tabActiva}&historial=true`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/configuracion/route.ts)
    - [`/api/problemas/configuracion/catalogos?catalogo=${cat}&id=${id}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/catalogos/route.ts)
    - [`/api/problemas/configuracion/plantillas?id=${id}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/plantillas/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/problemas/configuracion/configuracion?ambito=${tabActiva}, /api/problemas/configuracion/campos-personalizados?entidad=problema, /api/problemas/configuracion/catalogos, /api/problemas/configuracion/matriz-prioridad, /api/problemas/configuracion/plantillas, /api/problemas/configuracion/configuracion, /api/problemas/configuracion/configuracion?ambito=${tabActiva}&historial=true, /api/problemas/configuracion/catalogos?catalogo=${cat}&id=${id}, /api/problemas/configuracion/plantillas?id=${id}).

##### Opcion: "Flujo de investigación" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `19`
- **URL Web**: [`/plataforma/problemas/configuracion/flujo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/configuracion/flujo/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/configuracion/flujo/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/configuracion/flujo/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/config/flujo/VistaFlujoProblemas.tsx`](file:///src/modules/problemas/config/flujo/VistaFlujoProblemas.tsx)
  - **Lineas de Codigo**: `638` | **Tamano**: `25 KB`
  - **Consumo de Endpoints API**:
    - [`/api/problemas/configuracion/flujo?pestana=${tabActiva}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/route.ts)
    - [`/api/problemas/configuracion/flujo`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/route.ts)
    - [`/api/problemas/configuracion/flujo/estados`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/estados/route.ts)
    - [`/api/problemas/configuracion/flujo/estados?id=${id}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/estados/route.ts)
    - [`/api/problemas/configuracion/flujo/transiciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/transiciones/route.ts)
    - [`/api/problemas/configuracion/flujo/transiciones?id=${id}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/transiciones/route.ts)
    - [`/api/problemas/configuracion/flujo/asignacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/asignacion/route.ts)
    - [`/api/problemas/configuracion/flujo/asignacion?id=${id}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/asignacion/route.ts)
    - [`/api/problemas/configuracion/flujo/objetivos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/objetivos/route.ts)
    - [`/api/problemas/configuracion/flujo/escalamiento`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/escalamiento/route.ts)
    - [`/api/problemas/configuracion/flujo/escalamiento?id=${id}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/escalamiento/route.ts)
    - [`/api/problemas/configuracion/flujo/reapertura`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/reapertura/route.ts)
    - [`/api/problemas/configuracion/flujo/tareas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/tareas/route.ts)
    - [`/api/problemas/configuracion/flujo/tareas?id=${id}&tipo=${tipo}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/tareas/route.ts)
    - [`/api/problemas/configuracion/flujo/mayores`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/flujo/mayores/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/problemas/configuracion/flujo?pestana=${tabActiva}, /api/problemas/configuracion/flujo, /api/problemas/configuracion/flujo/estados, /api/problemas/configuracion/flujo/estados?id=${id}, /api/problemas/configuracion/flujo/transiciones, /api/problemas/configuracion/flujo/transiciones?id=${id}, /api/problemas/configuracion/flujo/asignacion, /api/problemas/configuracion/flujo/asignacion?id=${id}, /api/problemas/configuracion/flujo/objetivos, /api/problemas/configuracion/flujo/escalamiento, /api/problemas/configuracion/flujo/escalamiento?id=${id}, /api/problemas/configuracion/flujo/reapertura, /api/problemas/configuracion/flujo/tareas, /api/problemas/configuracion/flujo/tareas?id=${id}&tipo=${tipo}, /api/problemas/configuracion/flujo/mayores).

##### Opcion: "Relación con incidentes y KEDB" (Padre: *Problemas*)

- **Nivel**: `2` | **Orden**: `20`
- **URL Web**: [`/plataforma/problemas/configuracion/relaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/configuracion/relaciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/configuracion/relaciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/problemas/configuracion/relaciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/problemas/config/relaciones/VistaRelacionesProblemas.tsx`](file:///src/modules/problemas/config/relaciones/VistaRelacionesProblemas.tsx)
  - **Lineas de Codigo**: `541` | **Tamano**: `19 KB`
  - **Consumo de Endpoints API**:
    - [`/api/problemas/configuracion/relaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/problemas/configuracion/relaciones/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/problemas/configuracion/relaciones).

### 3.12. Modulo: `ACTIVOS`

- **Practica ITIL v4**: Gestion de Activos de TI (ITAM - ITIL 4 / ISO 19770)
- **Objetivo de Control**: Control del ciclo de vida financiero, contractual y fisico de los activos de TI, asegurando valor optimo, cumplimiento de licencias y disposicion segura.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Ciclos de vida y transiciones" (Padre: *Configuración de activos*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/activos/configuracion/ciclos-vida-transiciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/ciclos-vida-transiciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/ciclos-vida-transiciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/ciclos-vida-transiciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/config/ciclos-vida-transiciones/VistaCiclosVidaTransiciones.tsx`](file:///src/modules/activos/config/ciclos-vida-transiciones/VistaCiclosVidaTransiciones.tsx)
  - **Lineas de Codigo**: `636` | **Tamano**: `24 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/configuracion/ciclos-vida-transiciones/configuracion?pestana=${tabActiva}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/ciclos-vida-transiciones/configuracion/route.ts)
    - [`/api/activos/configuracion/ciclos-vida-transiciones/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/ciclos-vida-transiciones/configuracion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/configuracion/ciclos-vida-transiciones/configuracion?pestana=${tabActiva}, /api/activos/configuracion/ciclos-vida-transiciones/configuracion).

##### Opcion: "Licencias y contratos" (Padre: *Configuración de activos*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/activos/configuracion/licencias-contratos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/licencias-contratos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/licencias-contratos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/licencias-contratos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/config/licencias-contratos/VistaLicenciasContratos.tsx`](file:///src/modules/activos/config/licencias-contratos/VistaLicenciasContratos.tsx)
  - **Lineas de Codigo**: `611` | **Tamano**: `23 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/configuracion/licencias-contratos/configuracion?pestana=${tabActiva}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/licencias-contratos/configuracion/route.ts)
    - [`/api/activos/configuracion/licencias-contratos/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/licencias-contratos/configuracion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/configuracion/licencias-contratos/configuracion?pestana=${tabActiva}, /api/activos/configuracion/licencias-contratos/configuracion).

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

##### Opcion: "Tipos, modelos y atributos" (Padre: *Configuración de activos*)

- **Nivel**: `3` | **Orden**: `6`
- **URL Web**: [`/plataforma/activos/configuracion/tipos-modelos-atributos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/config/tipos-modelos-atributos/VistaTiposModelosAtributos.tsx`](file:///src/modules/activos/config/tipos-modelos-atributos/VistaTiposModelosAtributos.tsx)
  - **Lineas de Codigo**: `710` | **Tamano**: `26 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/configuracion/tipos-modelos-atributos/configuracion?pestana=${tabActiva}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/tipos-modelos-atributos/configuracion/route.ts)
    - [`/api/activos/configuracion/tipos-modelos-atributos/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/tipos-modelos-atributos/configuracion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/configuracion/tipos-modelos-atributos/configuracion?pestana=${tabActiva}, /api/activos/configuracion/tipos-modelos-atributos/configuracion).

### 3.13. Modulo: `SOLICITUDES`

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

##### Opcion: "Configuración del formulario" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `10`
- **URL Web**: [`/plataforma/solicitudes/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/configuracion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/configuracion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/solicitudes/configuracion/page.tsx)
- **Componente Modular de Vista**: *Envoltorio directo o redireccion en page.tsx*
- **Diagnostico de Desarrollo**: **Parcial (Solo Pagina / Sin Componente Modular)**
- **Detalle Tecnico**: Existe el archivo de ruta page.tsx pero no enlaza a un componente de vista desacoplado.

### 3.14. Modulo: `INCIDENTES`

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

##### Opcion: "Configuración del formulario" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `11`
- **URL Web**: [`/plataforma/incidentes/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/configuracion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/configuracion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/incidentes/configuracion/page.tsx)
- **Componente Modular de Vista**: *Envoltorio directo o redireccion en page.tsx*
- **Diagnostico de Desarrollo**: **Parcial (Solo Pagina / Sin Componente Modular)**
- **Detalle Tecnico**: Existe el archivo de ruta page.tsx pero no enlaza a un componente de vista desacoplado.

### 3.15. Modulo: `TICKETS`

- **Practica ITIL v4**: Gestion de Incidentes y Mesa de Servicio (Service Desk & Incident Management - ITIL 4)
- **Objetivo de Control**: Restauracion del servicio normal lo antes posible minimizando el impacto en el negocio, con categorizacion, priorizacion y escalamiento estructurado.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

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

##### Opcion: "Flujo y aprobaciones" (Padre: *Solicitudes*)

- **Nivel**: `3` | **Orden**: `11`
- **URL Web**: [`/plataforma/tickets/configuracion/vistas?seccion=estados&tipo=solicitud`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/configuracion/vistas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/configuracion/vistas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/configuracion/vistas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/config/vistas/VistaTicketsVistas.tsx`](file:///src/modules/tickets/config/vistas/VistaTicketsVistas.tsx)
  - **Lineas de Codigo**: `6` | **Tamano**: `0 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

##### Opcion: "Flujo de estados y acciones" (Padre: *Incidentes*)

- **Nivel**: `3` | **Orden**: `12`
- **URL Web**: [`/plataforma/tickets/configuracion/vistas?seccion=estados&tipo=incidente`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/configuracion/vistas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/configuracion/vistas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/tickets/configuracion/vistas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/tickets/config/vistas/VistaTicketsVistas.tsx`](file:///src/modules/tickets/config/vistas/VistaTicketsVistas.tsx)
  - **Lineas de Codigo**: `6` | **Tamano**: `0 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

## 4. Analisis Comparativo frente a ITIL v4 e ISO/IEC 20000

### Fortalezas de la Implementacion Actual:
1. **Alineacion Modular Estricta**: No existe logica funcional acoplada a carpetas de perfiles; todo el codigo de dominio reside en modulos independientes desacoplados.
2. **Seguridad RBAC en Capas**: El perfil cuenta con segregacion visual en el arbol de base de datos (`opciones_menu_perfiles`) y validacion de capacidad en el layout de sesion.
3. **Trazabilidad de Navegacion**: Las URLs del navegador coinciden exactamente 1:1 con la estructura de carpetas de modulos, cumpliendo con la exigencia de transparencia arquitectonica.

### Brechas Identificadas y Recomendaciones de Evolucion:
1. **Consolidacion de Componentes Parciales**: Se detectaron 9 opciones que cuentan con interfaz base pero requieren completar persistencia completa en PostgreSQL o sustitucion de colecciones locales.
2. **Automatizacion de Flujos Transversales**: Profundizar la integracion automatica de notificaciones en tiempo real (WebSockets / SSE) para eventos criticos asignados a este perfil.
3. **Metricas y Auditoria de Sesion**: Fortalecer el registro detallado en `auditoria_sistema` de cada accion de creacion, modificacion o transicion de estado ejecutada por este perfil.

---
*Informe generado automaticamente mediante auditoria estatica y validacion de base de datos del Sistema ITSM.*