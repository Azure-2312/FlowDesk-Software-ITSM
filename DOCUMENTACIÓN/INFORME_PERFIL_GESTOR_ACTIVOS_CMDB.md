# Informe Tecnico y Arquitectonico de Perfil: Gestor de Activos y Configuracion

> [!IMPORTANT]
> **Perfil ID**: `9` | **Rol ITSM**: `Gestor de Activos y Configuracion` | **Fecha de Auditoria**: 2026-10-22
> **Cumplimiento Funcional Global**: **96%** (25 de 26 opciones operativas)

## 1. Proposito del Rol y Marco Normativo ITIL v4

El Gestor de Activos y Configuracion (ITAM & SACM Manager) custodia el ciclo de vida completo de hardware, software, licencias y contratos, asi como la integridad de la base de datos de configuracion (CMDB), sus tipos de CI y sus relaciones topologicas.

- **Marco Primario**: ITIL v4 (Sistema de Valor del Servicio - SVS)
- **Estandares de Calidad y Seguridad**: ISO/IEC 20000-1 (Gestion de Servicios), ISO/IEC 27001 (Seguridad de la Informacion)
- **Nivel de Gobernanza**: Control de Acceso Basado en Roles (RBAC) con capacidades granulares y aislamiento modular

## 2. Resumen Ejecutivo de Cobertura y Madurez

| Metrica | Cantidad | Descripcion |
| :--- | :--- | :--- |
| **Modulos con Acceso** | 6 | Modulos de dominio alcanzados por el menu del perfil |
| **Opciones Totales en Menu** | 37 | Elementos registrados en la jerarquia de navegacion |
| **Encabezados de Agrupacion** | 11 | Categorias nivel 1 y 2 que estructuran el acordeon visual |
| **Vistas Terminales (URLs)** | 26 | Pantallas con ruta web directa (`page.tsx`) |
| **Desarrollo Completo (100%)** | 24 | Vistas con estado, hooks de reactividad y APIs operativas |
| **Desarrollo Funcional Base** | 1 | Componentes estables con soporte de datos integrado |
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

##### Opcion: "Mi cuenta"

- **Nivel**: `1` | **Orden**: `12`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Inventario" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `1`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Bajas y disposición" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `2`
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

##### Opcion: "Proveedores y contratos" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `6`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

##### Opcion: "Configuración de activos" (Padre: *Activos*)

- **Nivel**: `2` | **Orden**: `7`
- **Tipo de Elemento**: Encabezado jerarquico de menu (Contenedor acordeon sin ruta web propia).
- **Estado**: **Estructura Organizacional Valida** (Cumple estandar ITIL de agrupacion logica de servicios).

### 3.2. Modulo: `ACTIVOS`

- **Practica ITIL v4**: Gestion de Activos de TI (ITAM - ITIL 4 / ISO 19770)
- **Objetivo de Control**: Control del ciclo de vida financiero, contractual y fisico de los activos de TI, asegurando valor optimo, cumplimiento de licencias y disposicion segura.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Panel de activos y CMDB" (Padre: *Mi trabajo*)

- **Nivel**: `2` | **Orden**: `1`
- **URL Web**: [`/plataforma/activos/panel`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/panel/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/panel/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/panel/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaPanelGestorActivos.tsx`](file:///src/modules/activos/views/VistaPanelGestorActivos.tsx)
  - **Lineas de Codigo**: `124` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/panel?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/panel/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/panel?_t=${Date.now()}).

##### Opcion: "Software autorizado" (Padre: *Licencias*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/activos/licencias/catalogo-software`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/licencias/catalogo-software/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/licencias/catalogo-software/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/licencias/catalogo-software/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaCatalogoSoftware.tsx`](file:///src/modules/activos/views/VistaCatalogoSoftware.tsx)
  - **Lineas de Codigo**: `179` | **Tamano**: `8 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/licencias/catalogo-software?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/licencias/catalogo-software/route.ts)
    - [`/api/activos/licencias/catalogo-software`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/licencias/catalogo-software/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/licencias/catalogo-software?_t=${Date.now()}, /api/activos/licencias/catalogo-software).

##### Opcion: "Mantenimiento y garantías" (Padre: *Mantenimiento*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/activos/mantenimiento`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/mantenimiento/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/mantenimiento/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/mantenimiento/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaMantenimientoActivos.tsx`](file:///src/modules/activos/views/VistaMantenimientoActivos.tsx)
  - **Lineas de Codigo**: `234` | **Tamano**: `11 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/mantenimiento?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/mantenimiento/route.ts)
    - [`/api/activos/mantenimiento`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/mantenimiento/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/mantenimiento?_t=${Date.now()}, /api/activos/mantenimiento).

##### Opcion: "Contratos y cobertura" (Padre: *Proveedores y contratos*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/activos/contratos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/contratos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/contratos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/contratos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaContratos.tsx`](file:///src/modules/activos/views/VistaContratos.tsx)
  - **Lineas de Codigo**: `225` | **Tamano**: `11 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/contratos?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/contratos/route.ts)
    - [`/api/activos/contratos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/contratos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/contratos?_t=${Date.now()}, /api/activos/contratos).

##### Opcion: "Fabricantes y modelos" (Padre: *Configuración de activos*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/activos/configuracion/tipos-modelos-atributos/fabricantes`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/fabricantes/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/fabricantes/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/fabricantes/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/config/tipos-modelos-atributos/VistaTiposModelosAtributos.tsx`](file:///src/modules/activos/config/tipos-modelos-atributos/VistaTiposModelosAtributos.tsx)
  - **Lineas de Codigo**: `710` | **Tamano**: `26 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/configuracion/tipos-modelos-atributos/configuracion?pestana=${tabActiva}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/tipos-modelos-atributos/configuracion/route.ts)
    - [`/api/activos/configuracion/tipos-modelos-atributos/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/tipos-modelos-atributos/configuracion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/configuracion/tipos-modelos-atributos/configuracion?pestana=${tabActiva}, /api/activos/configuracion/tipos-modelos-atributos/configuracion).

##### Opcion: "Asignación, custodia y actas" (Padre: *Inventario*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/activos/asignaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/asignaciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/asignaciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/asignaciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaAsignacionesActivos.tsx`](file:///src/modules/activos/views/VistaAsignacionesActivos.tsx)
  - **Lineas de Codigo**: `168` | **Tamano**: `8 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/asignaciones?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/asignaciones/route.ts)
    - [`/api/activos/asignaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/asignaciones/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/asignaciones?_t=${Date.now()}, /api/activos/asignaciones).

##### Opcion: "Análisis e impacto" (Padre: *CMDB*)

- **Nivel**: `3` | **Orden**: `2`
- **URL Web**: [`/plataforma/activos/cmdb/analisis`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/cmdb/analisis/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/cmdb/analisis/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/cmdb/analisis/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/views/VistaCmdbAnalisis.tsx`](file:///src/modules/cmdb/views/VistaCmdbAnalisis.tsx)
  - **Lineas de Codigo**: `465` | **Tamano**: `20 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/cmdb?estado=activos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/route.ts)
    - [`/api/activos/cmdb/analisis?vista=reconciliacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/analisis/route.ts)
    - [`/api/activos/cmdb/analisis?vista=topologia&id_ci=${idCi}&profundidad=${profundidad}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/analisis/route.ts)
    - [`/api/activos/cmdb/analisis?vista=impacto&id_ci=${idCi}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/analisis/route.ts)
    - [`/api/activos/cmdb/analisis?vista=historial&id_ci=${idCi}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/analisis/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/cmdb?estado=activos, /api/activos/cmdb/analisis?vista=reconciliacion, /api/activos/cmdb/analisis?vista=topologia&id_ci=${idCi}&profundidad=${profundidad}, /api/activos/cmdb/analisis?vista=impacto&id_ci=${idCi}, /api/activos/cmdb/analisis?vista=historial&id_ci=${idCi}).

##### Opcion: "Importación masiva" (Padre: *Inventario*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/activos/importacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/importacion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/importacion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/importacion/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaImportacionActivos.tsx`](file:///src/modules/activos/views/VistaImportacionActivos.tsx)
  - **Lineas de Codigo**: `163` | **Tamano**: `7 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/importacion?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/importacion/route.ts)
    - [`/api/activos/importacion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/importacion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/importacion?_t=${Date.now()}, /api/activos/importacion).

##### Opcion: "Cumplimiento y sobreuso" (Padre: *Licencias*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/activos/licencias/cumplimiento`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/licencias/cumplimiento/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/licencias/cumplimiento/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/licencias/cumplimiento/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaCumplimientoLicencias.tsx`](file:///src/modules/activos/views/VistaCumplimientoLicencias.tsx)
  - **Lineas de Codigo**: `119` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/licencias/cumplimiento?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/licencias/cumplimiento/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/licencias/cumplimiento?_t=${Date.now()}).

##### Opcion: "Gestión de bajas" (Padre: *Bajas y disposición*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/activos/bajas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/bajas/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/bajas/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/bajas/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaBajasActivos.tsx`](file:///src/modules/activos/views/VistaBajasActivos.tsx)
  - **Lineas de Codigo**: `191` | **Tamano**: `9 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/bajas?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/bajas/route.ts)
    - [`/api/activos/bajas`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/bajas/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/bajas?_t=${Date.now()}, /api/activos/bajas).

##### Opcion: "Listas auxiliares" (Padre: *Configuración de activos*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/activos/configuracion/tipos-modelos-atributos/catalogos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/catalogos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/catalogos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/catalogos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/config/tipos-modelos-atributos/VistaTiposModelosAtributos.tsx`](file:///src/modules/activos/config/tipos-modelos-atributos/VistaTiposModelosAtributos.tsx)
  - **Lineas de Codigo**: `710` | **Tamano**: `26 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/configuracion/tipos-modelos-atributos/configuracion?pestana=${tabActiva}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/tipos-modelos-atributos/configuracion/route.ts)
    - [`/api/activos/configuracion/tipos-modelos-atributos/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/tipos-modelos-atributos/configuracion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/configuracion/tipos-modelos-atributos/configuracion?pestana=${tabActiva}, /api/activos/configuracion/tipos-modelos-atributos/configuracion).

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

##### Opcion: "Renovaciones y vencimientos" (Padre: *Proveedores y contratos*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/activos/renovaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/renovaciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/renovaciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/renovaciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaRenovaciones.tsx`](file:///src/modules/activos/views/VistaRenovaciones.tsx)
  - **Lineas de Codigo**: `223` | **Tamano**: `10 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/renovaciones?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/renovaciones/route.ts)
    - [`/api/activos/renovaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/renovaciones/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/renovaciones?_t=${Date.now()}, /api/activos/renovaciones).

##### Opcion: "Inventario físico (campañas)" (Padre: *Inventario*)

- **Nivel**: `3` | **Orden**: `5`
- **URL Web**: [`/plataforma/activos/inventario-fisico`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/inventario-fisico/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/inventario-fisico/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/inventario-fisico/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaInventarioFisico.tsx`](file:///src/modules/activos/views/VistaInventarioFisico.tsx)
  - **Lineas de Codigo**: `269` | **Tamano**: `12 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/inventario-fisico?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/inventario-fisico/route.ts)
    - [`/api/activos/inventario-fisico`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/inventario-fisico/route.ts)
    - [`/api/activos/inventario-fisico?id_campana=${idCampana}&_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/inventario-fisico/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/inventario-fisico?_t=${Date.now()}, /api/activos/inventario-fisico, /api/activos/inventario-fisico?id_campana=${idCampana}&_t=${Date.now()}).

##### Opcion: "Mapa de topología" (Padre: *CMDB*)

- **Nivel**: `3` | **Orden**: `6`
- **URL Web**: [`/plataforma/activos/cmdb`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/cmdb/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/cmdb/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/cmdb/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/views/VistaCmdb.tsx`](file:///src/modules/cmdb/views/VistaCmdb.tsx)
  - **Lineas de Codigo**: `1435` | **Tamano**: `58 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/cmdb?${params.toString()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/route.ts)
    - [`/api/activos/cmdb`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/route.ts)
    - [`/api/activos/cmdb/relaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/relaciones/route.ts)
    - [`/api/activos/cmdb/relaciones?id_ci_padre=${idPadre}&id_ci_hijo=${idHijo}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/cmdb/relaciones/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/cmdb?${params.toString()}, /api/activos/cmdb, /api/activos/cmdb/relaciones, /api/activos/cmdb/relaciones?id_ci_padre=${idPadre}&id_ci_hijo=${idHijo}).

##### Opcion: "Ubicaciones" (Padre: *Configuración de activos*)

- **Nivel**: `3` | **Orden**: `7`
- **URL Web**: [`/plataforma/activos/configuracion/tipos-modelos-atributos/ubicaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/ubicaciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/ubicaciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/configuracion/tipos-modelos-atributos/ubicaciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/config/tipos-modelos-atributos/VistaTiposModelosAtributos.tsx`](file:///src/modules/activos/config/tipos-modelos-atributos/VistaTiposModelosAtributos.tsx)
  - **Lineas de Codigo**: `710` | **Tamano**: `26 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/configuracion/tipos-modelos-atributos/configuracion?pestana=${tabActiva}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/tipos-modelos-atributos/configuracion/route.ts)
    - [`/api/activos/configuracion/tipos-modelos-atributos/configuracion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/configuracion/tipos-modelos-atributos/configuracion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/configuracion/tipos-modelos-atributos/configuracion?pestana=${tabActiva}, /api/activos/configuracion/tipos-modelos-atributos/configuracion).

##### Opcion: "Modelado de clases CI" (Padre: *CMDB*)

- **Nivel**: `3` | **Orden**: `8`
- **URL Web**: [`/plataforma/activos/cmdb/tipos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/cmdb/tipos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/cmdb/tipos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/cmdb/tipos/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/views/VistaTiposCi.tsx`](file:///src/modules/cmdb/views/VistaTiposCi.tsx)
  - **Lineas de Codigo**: `324` | **Tamano**: `13 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cmdb/tipos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/tipos/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cmdb/tipos).

##### Opcion: "Recepción de adquisiciones" (Padre: *Inventario*)

- **Nivel**: `3` | **Orden**: `9`
- **URL Web**: [`/plataforma/activos/recepcion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/recepcion/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/recepcion/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/activos/recepcion/page.tsx)
- **Componente Modular de Vista**: [`src/modules/activos/views/VistaRecepcionActivos.tsx`](file:///src/modules/activos/views/VistaRecepcionActivos.tsx)
  - **Lineas de Codigo**: `180` | **Tamano**: `9 KB`
  - **Consumo de Endpoints API**:
    - [`/api/activos/recepcion?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/recepcion/route.ts)
    - [`/api/activos/recepcion`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/activos/recepcion/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/activos/recepcion?_t=${Date.now()}, /api/activos/recepcion).

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

##### Opcion: "Reportes de activos" (Padre: *Reportes*)

- **Nivel**: `2` | **Orden**: `3`
- **URL Web**: [`/plataforma/reportes/activos`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/activos/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/activos/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/reportes/activos/page.tsx)
- **Componente Modular de Vista**: [`src/shared/lib/page-auth.ts`](file:///src/shared/lib/page-auth.ts)
  - **Lineas de Codigo**: `64` | **Tamano**: `2 KB`
- **Diagnostico de Desarrollo**: **Desarrollado (Funcional Base)**
- **Detalle Tecnico**: Componente funcional operativo.

### 3.5. Modulo: `CMDB`

- **Practica ITIL v4**: Gestion de la Configuracion del Servicio (SACM - ITIL 4)
- **Objetivo de Control**: Mantenimiento de informacion precisa y confiable sobre los elementos de configuracion (CIs) y sus relaciones e interdependencias en la entrega de servicios.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Actualizaciones de CMDB" (Padre: *CMDB*)

- **Nivel**: `3` | **Orden**: `1`
- **URL Web**: [`/plataforma/cmdb/actualizaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/actualizaciones/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/actualizaciones/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/actualizaciones/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/views/VistaCmdbActualizaciones.tsx`](file:///src/modules/cmdb/views/VistaCmdbActualizaciones.tsx)
  - **Lineas de Codigo**: `132` | **Tamano**: `6 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cmdb/actualizaciones?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/actualizaciones/route.ts)
    - [`/api/cmdb/actualizaciones`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/actualizaciones/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cmdb/actualizaciones?_t=${Date.now()}, /api/cmdb/actualizaciones).

##### Opcion: "Calidad y auditoría de CMDB" (Padre: *CMDB*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/cmdb/auditoria`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/auditoria/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/auditoria/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/auditoria/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/views/VistaCmdbAuditoria.tsx`](file:///src/modules/cmdb/views/VistaCmdbAuditoria.tsx)
  - **Lineas de Codigo**: `123` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cmdb/auditoria?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/auditoria/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cmdb/auditoria?_t=${Date.now()}).

##### Opcion: "Inexactitudes reportadas" (Padre: *CMDB*)

- **Nivel**: `3` | **Orden**: `4`
- **URL Web**: [`/plataforma/cmdb/inexactitudes`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/inexactitudes/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/inexactitudes/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/inexactitudes/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/views/VistaCmdbInexactitudes.tsx`](file:///src/modules/cmdb/views/VistaCmdbInexactitudes.tsx)
  - **Lineas de Codigo**: `190` | **Tamano**: `8 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cmdb/inexactitudes?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/inexactitudes/route.ts)
    - [`/api/cmdb/inexactitudes`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/inexactitudes/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cmdb/inexactitudes?_t=${Date.now()}, /api/cmdb/inexactitudes).

##### Opcion: "Líneas base" (Padre: *CMDB*)

- **Nivel**: `3` | **Orden**: `5`
- **URL Web**: [`/plataforma/cmdb/lineas-base`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/lineas-base/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/lineas-base/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/cmdb/lineas-base/page.tsx)
- **Componente Modular de Vista**: [`src/modules/cmdb/views/VistaCmdbLineasBase.tsx`](file:///src/modules/cmdb/views/VistaCmdbLineasBase.tsx)
  - **Lineas de Codigo**: `123` | **Tamano**: `5 KB`
  - **Consumo de Endpoints API**:
    - [`/api/cmdb/lineas-base?_t=${Date.now()}`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/lineas-base/route.ts)
    - [`/api/cmdb/lineas-base`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/api/cmdb/lineas-base/route.ts)
- **Diagnostico de Desarrollo**: **Desarrollado y Funcional (100%)**
- **Detalle Tecnico**: Implementacion completa con estado, hooks de reactividad y consumo de API (/api/cmdb/lineas-base?_t=${Date.now()}, /api/cmdb/lineas-base).

### 3.6. Modulo: `PROVEEDORES`

- **Practica ITIL v4**: Gobernanza y Estructura Base de Plataforma (Platform Governance - ITIL 4)
- **Objetivo de Control**: Estructuracion jerarquica de accesos y navegacion basada en roles.

#### Inventario de Rutas, Archivos y Nivel de Desarrollo

##### Opcion: "Proveedores" (Padre: *Proveedores y contratos*)

- **Nivel**: `3` | **Orden**: `3`
- **URL Web**: [`/plataforma/proveedores`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/proveedores/page.tsx)
- **Archivo de Pagina (Next.js)**: [`C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/proveedores/page.tsx`](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/app/plataforma/proveedores/page.tsx)
- **Componente Modular de Vista**: [`src/modules/proveedores/views/VistaProveedores.tsx`](file:///src/modules/proveedores/views/VistaProveedores.tsx)
  - **Lineas de Codigo**: `6` | **Tamano**: `0 KB`
- **Diagnostico de Desarrollo**: **Esqueleto / Envoltorio Base**
- **Detalle Tecnico**: Componente inicial o de redireccion con logica minima.

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