# GUIA MAESTRA DE ARQUITECTURA Y JERARQUIA DE CODIGO FUENTE (SRC)
## FlowDesk Software ITSM - Sistema de Gestion de Servicios de TI

---

### Proposito de este Documento
Este documento detalla de manera minuciosa, estructurada y jerarquica la totalidad de carpetas y archivos que componen el directorio `src/` de **FlowDesk Software ITSM**.
El objetivo es que cualquier desarrollador, estudiante o modelo de inteligencia artificial que descargue el repositorio pueda comprender con total claridad:
1. Que es cada carpeta o archivo.
2. Que funcion cumple dentro del sistema.
3. Que contiene exactamente y que logica implementa.
4. Como se relaciona con el resto de la arquitectura del software.

La jerarquia sigue una numeracion formal multinivel (1, 1.1, 1.1.1, 1.1.1.1, etc.) reflejando con precision la profundidad del arbol de archivos.

---

## Diagrama de Capas de la Arquitectura en `src/`

```
+-----------------------------------------------------------------------------------+
|                                       SRC/                                        |
|                                                                                   |
|  +-------------------------+  +-------------------------+  +-------------------+  |
|  |        1.1 APP/         |  |    1.2 COMPONENTS/      |  |     1.3 LIB/      |  |
|  |  - (app)/ (Paginas UI)  |  |  - ticket-detail/       |  |  - db.ts (Pool pg)|  |
|  |  - api/ (Route Handlers)|  |  - itsm/ (Workspaces)   |  |  - auth.ts (JWT)  |  |
|  |  - login/ (Portal Auth) |  |  - ui/ (AlertaCampo)    |  |  - validaciones.ts|  |
|  |  - globals.css          |  |  - Menu.tsx, Tablas     |  |  - sla.ts, email  |  |
|  +-------------------------+  +-------------------------+  +-------------------+  |
|                                                                                   |
|  +------------------------------------------------------+  +-------------------+  |
|  |                   1.4 TYPES/                         |  | 1.5 MIDDLEWARE.TS |  |
|  |  - index.ts (Contratos TypeScript de dominio)        |  |  - Guardian HTTP  |  |
|  +------------------------------------------------------+  +-------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 1. Directorio Raiz: `src/`
* **Ruta Relativa**: `src/`
* **Tipo de Elemento**: Directorio Raiz de Codigo Fuente
* **Que es**: El contenedor absoluto de todo el codigo de la aplicacion.
* **Que hace**: Agrupa las capas de presentacion, navegacion, servicios de backend, utilidades de base de datos y tipado estricto.
* **Que contiene**: Los directorios `app/`, `components/`, `lib/`, `types/` y el archivo `middleware.ts`.

### 1.1 Directorio: `src/app/`
* **Ruta Relativa**: `src/app/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Enrutador oficial de Next.js 14 basado en carpetas (App Router).
* **Que hace**: Define tanto las pantallas visibles del sistema (Client y Server Components) como los endpoints RESTful de la API.
* **Que contiene**: Tres subdirectorios medulares: (app)/ (vistas protegidas), api/ (servicios backend), login/ (portal de acceso) y los archivos raiz globals.css, layout.tsx y page.tsx.

### 1.1.1 Directorio: `src/app/(app)/`
* **Ruta Relativa**: `src/app/(app)/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Grupo de rutas protegidas (Route Group) que comparten el diseno corporativo.
* **Que hace**: Aplica el layout principal con la barra lateral de navegacion (`Menu.tsx`) y la barra superior con el selector de perfil en caliente (`SelectorPerfilActivo.tsx`).
* **Que contiene**: Modulos funcionales del sistema: activos/, admin/, cambios/, dashboard/, incidentes/, mi-cuenta/, operacion/, problemas/, proveedores/, solicitudes/, tecnico/ y tickets/.

### 1.1.1.1 Directorio: `src/app/(app)/activos/`
* **Ruta Relativa**: `src/app/(app)/activos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Modulo de Gestion de Activos de TI (ITAM) y Base de Datos de Configuracion (CMDB).
* **Que hace**: Permite inventariar y rastrear el ciclo de vida de hardware, servidores, redes y licencias de software.
* **Que contiene**: Pantallas para exploracion de CMDB, catalogo de tipos de CIs, inventario general y control de contratos de licencias.

### 1.1.1.1.1 Directorio: `src/app/(app)/activos/cmdb/`
* **Ruta Relativa**: `src/app/(app)/activos/cmdb/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cmdb`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.1.1.1 Archivo: `src/app/(app)/activos/cmdb/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/activos/cmdb/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/activos/cmdb`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.1.1.2 Directorio: `src/app/(app)/activos/cmdb/tipos/`
* **Ruta Relativa**: `src/app/(app)/activos/cmdb/tipos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tipos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.1.1.2.1 Archivo: `src/app/(app)/activos/cmdb/tipos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/activos/cmdb/tipos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/activos/cmdb/tipos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.1.2 Directorio: `src/app/(app)/activos/inventario/`
* **Ruta Relativa**: `src/app/(app)/activos/inventario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `inventario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.1.2.1 Archivo: `src/app/(app)/activos/inventario/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/activos/inventario/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/activos/inventario`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.1.3 Directorio: `src/app/(app)/activos/licencias/`
* **Ruta Relativa**: `src/app/(app)/activos/licencias/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `licencias`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.1.3.1 Archivo: `src/app/(app)/activos/licencias/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/activos/licencias/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/activos/licencias`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.1.4 Archivo: `src/app/(app)/activos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/activos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/activos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2 Directorio: `src/app/(app)/admin/`
* **Ruta Relativa**: `src/app/(app)/admin/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Consola central de administracion exclusiva para usuarios con perfil Administrador (ID 1).
* **Que hace**: Permite configurar todos los parametros maestros del sistema, catalogos, seguridad, reglas y procesos.
* **Que contiene**: Submodulos de configuracion de activos, auditoria, base de conocimientos, departamentos, mantenimiento, menu, perfiles, procesos de cambios, procesos de problemas, reportes, seguridad, servicios y usuarios.

### 1.1.1.2.1 Directorio: `src/app/(app)/admin/activos-config/`
* **Ruta Relativa**: `src/app/(app)/admin/activos-config/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `activos-config`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.1.1 Directorio: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/`
* **Ruta Relativa**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `ciclos-vida-transiciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.1.1.1 Directorio: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/`
* **Ruta Relativa**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.1.1.1.1 Archivo: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaAdquisicionRecepcion.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaAdquisicionRecepcion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaAdquisicionRecepcion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.1.1.2 Archivo: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaAsignacionCustodia.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaAsignacionCustodia.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaAsignacionCustodia.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.1.1.3 Archivo: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaBajaDisposicion.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaBajaDisposicion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaBajaDisposicion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.1.1.4 Archivo: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaCiclosEstados.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaCiclosEstados.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaCiclosEstados.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.1.1.5 Archivo: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaMantenimientoFinVida.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaMantenimientoFinVida.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaMantenimientoFinVida.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.1.1.6 Archivo: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaTransicionesReglas.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaTransicionesReglas.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/components/PestanaTransicionesReglas.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.1.2 Archivo: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/activos-config/ciclos-vida-transiciones`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.1.2 Directorio: `src/app/(app)/admin/activos-config/cmdb-relaciones/`
* **Ruta Relativa**: `src/app/(app)/admin/activos-config/cmdb-relaciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cmdb-relaciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.1.2.1 Directorio: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/`
* **Ruta Relativa**: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.1.2.1.1 Archivo: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaAuditoriaLineasBase.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaAuditoriaLineasBase.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaAuditoriaLineasBase.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.2.1.2 Archivo: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaClasesCI.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaClasesCI.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaClasesCI.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.2.1.3 Archivo: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaCriticidadEntornos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaCriticidadEntornos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaCriticidadEntornos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.2.1.4 Archivo: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaFuentesAtributosProtegidos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaFuentesAtributosProtegidos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaFuentesAtributosProtegidos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.2.1.5 Archivo: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaReglasIntegridad.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaReglasIntegridad.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaReglasIntegridad.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.2.1.6 Archivo: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaTiposRelacion.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaTiposRelacion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/cmdb-relaciones/components/PestanaTiposRelacion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.2.2 Archivo: `src/app/(app)/admin/activos-config/cmdb-relaciones/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/cmdb-relaciones/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/activos-config/cmdb-relaciones`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.1.3 Directorio: `src/app/(app)/admin/activos-config/licencias-contratos/`
* **Ruta Relativa**: `src/app/(app)/admin/activos-config/licencias-contratos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `licencias-contratos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.1.3.1 Directorio: `src/app/(app)/admin/activos-config/licencias-contratos/components/`
* **Ruta Relativa**: `src/app/(app)/admin/activos-config/licencias-contratos/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.1.3.1.1 Archivo: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaAlertasVencimiento.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaAlertasVencimiento.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaAlertasVencimiento.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.3.1.2 Archivo: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaCumplimientoSobreuso.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaCumplimientoSobreuso.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaCumplimientoSobreuso.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.3.1.3 Archivo: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaFormularioLicenciaContrato.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaFormularioLicenciaContrato.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaFormularioLicenciaContrato.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.3.1.4 Archivo: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaRenovacion.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaRenovacion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaRenovacion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.3.1.5 Archivo: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaTiposContrato.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaTiposContrato.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaTiposContrato.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.3.1.6 Archivo: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaTiposLicencia.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaTiposLicencia.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/licencias-contratos/components/PestanaTiposLicencia.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.3.2 Archivo: `src/app/(app)/admin/activos-config/licencias-contratos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/licencias-contratos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/activos-config/licencias-contratos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.1.4 Directorio: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/`
* **Ruta Relativa**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tipos-modelos-atributos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.1.4.1 Directorio: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/`
* **Ruta Relativa**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.1.4.1.1 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaAtributosTipo.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaAtributosTipo.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaAtributosTipo.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.4.1.2 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaCatalogosAuxiliares.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaCatalogosAuxiliares.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaCatalogosAuxiliares.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.4.1.3 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaClasesTipos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaClasesTipos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaClasesTipos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.4.1.4 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaCodigoEtiquetas.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaCodigoEtiquetas.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaCodigoEtiquetas.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.4.1.5 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaFabricantesModelos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaFabricantesModelos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaFabricantesModelos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.4.1.6 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaFichaListado.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaFichaListado.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaFichaListado.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.4.1.7 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaFormularioActivo.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaFormularioActivo.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaFormularioActivo.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.4.1.8 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaImportacionInventario.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaImportacionInventario.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaImportacionInventario.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.4.1.9 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaUbicaciones.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaUbicaciones.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/activos-config/tipos-modelos-atributos/components/PestanaUbicaciones.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.1.4.2 Archivo: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/activos-config/tipos-modelos-atributos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.2 Directorio: `src/app/(app)/admin/auditoria-sistema/`
* **Ruta Relativa**: `src/app/(app)/admin/auditoria-sistema/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `auditoria-sistema`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.2.1 Archivo: `src/app/(app)/admin/auditoria-sistema/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/auditoria-sistema/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/auditoria-sistema`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.3 Directorio: `src/app/(app)/admin/conocimiento-config/`
* **Ruta Relativa**: `src/app/(app)/admin/conocimiento-config/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `conocimiento-config`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.3.1 Archivo: `src/app/(app)/admin/conocimiento-config/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/conocimiento-config/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/conocimiento-config`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.4 Directorio: `src/app/(app)/admin/departamentos/`
* **Ruta Relativa**: `src/app/(app)/admin/departamentos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `departamentos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.4.1 Archivo: `src/app/(app)/admin/departamentos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/departamentos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/departamentos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.5 Directorio: `src/app/(app)/admin/departamentos-empresa/`
* **Ruta Relativa**: `src/app/(app)/admin/departamentos-empresa/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `departamentos-empresa`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.5.1 Archivo: `src/app/(app)/admin/departamentos-empresa/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/departamentos-empresa/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/departamentos-empresa`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.6 Directorio: `src/app/(app)/admin/mantenimiento-datos/`
* **Ruta Relativa**: `src/app/(app)/admin/mantenimiento-datos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mantenimiento-datos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.6.1 Archivo: `src/app/(app)/admin/mantenimiento-datos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/mantenimiento-datos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/mantenimiento-datos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.7 Directorio: `src/app/(app)/admin/menu/`
* **Ruta Relativa**: `src/app/(app)/admin/menu/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `menu`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.7.1 Archivo: `src/app/(app)/admin/menu/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/menu/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/menu`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.8 Directorio: `src/app/(app)/admin/notificaciones/`
* **Ruta Relativa**: `src/app/(app)/admin/notificaciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `notificaciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.8.1 Archivo: `src/app/(app)/admin/notificaciones/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/notificaciones/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/notificaciones`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.2.9 Archivo: `src/app/(app)/admin/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.10 Directorio: `src/app/(app)/admin/perfiles/`
* **Ruta Relativa**: `src/app/(app)/admin/perfiles/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `perfiles`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.10.1 Archivo: `src/app/(app)/admin/perfiles/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/perfiles/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/perfiles`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.11 Directorio: `src/app/(app)/admin/procesos/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `procesos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.1 Directorio: `src/app/(app)/admin/procesos/cambios/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/cambios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cambios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.1.1 Directorio: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `flujo-evaluacion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.1.1.1 Directorio: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.11.1.1.1.1 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/Iconos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/Iconos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/Iconos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.1.1.2 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaComites.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaComites.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaComites.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.1.1.3 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaEstados.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaEstados.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaEstados.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.1.1.4 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaEtapasAprobacion.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaEtapasAprobacion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaEtapasAprobacion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.1.1.5 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaImplementacionCierre.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaImplementacionCierre.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaImplementacionCierre.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.1.1.6 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaPir.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaPir.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaPir.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.1.1.7 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaPlazosEscalamiento.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaPlazosEscalamiento.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaPlazosEscalamiento.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.1.1.8 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaTareasChecklists.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaTareasChecklists.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaTareasChecklists.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.1.1.9 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaTransiciones.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaTransiciones.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/components/PestanaTransiciones.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.1.2 Archivo: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/procesos/cambios/flujo-evaluacion`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.11.1.2 Directorio: `src/app/(app)/admin/procesos/cambios/formulario/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/cambios/formulario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `formulario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.1.2.1 Directorio: `src/app/(app)/admin/procesos/cambios/formulario/components/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/cambios/formulario/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.11.1.2.1.1 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/BarraAccionesComun.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/BarraAccionesComun.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/BarraAccionesComun.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.2 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/ModalHistorialVersiones.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/ModalHistorialVersiones.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/ModalHistorialVersiones.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.3 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/ModalPublicacion.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/ModalPublicacion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/ModalPublicacion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.4 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/ModalRestaurarFabrica.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/ModalRestaurarFabrica.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/ModalRestaurarFabrica.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.5 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/ModalVistaPrevia.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/ModalVistaPrevia.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/ModalVistaPrevia.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.6 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCampos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCampos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCampos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.7 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCamposPersonalizados.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCamposPersonalizados.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCamposPersonalizados.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.8 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCatalogos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCatalogos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCatalogos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.9 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCuestionarioRiesgo.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCuestionarioRiesgo.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaCuestionarioRiesgo.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.10 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaPlantillas.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaPlantillas.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaPlantillas.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.11 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaPrioridad.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaPrioridad.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaPrioridad.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.1.12 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaVistaTicket.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaVistaTicket.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/formulario/components/PestanaVistaTicket.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.2.2 Archivo: `src/app/(app)/admin/procesos/cambios/formulario/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/formulario/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/procesos/cambios/formulario`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.11.1.3 Directorio: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `notificaciones-calendario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.1.3.1 Directorio: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.11.1.3.1.1 Archivo: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/Iconos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/Iconos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/Iconos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.3.1.2 Archivo: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaConflictosCapacidad.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaConflictosCapacidad.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaConflictosCapacidad.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.3.1.3 Archivo: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaFeriados.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaFeriados.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaFeriados.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.3.1.4 Archivo: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaNotificaciones.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaNotificaciones.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaNotificaciones.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.3.1.5 Archivo: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaPeriodosCongelamiento.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaPeriodosCongelamiento.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaPeriodosCongelamiento.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.3.1.6 Archivo: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaPresentacionCalendario.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaPresentacionCalendario.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaPresentacionCalendario.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.3.1.7 Archivo: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaVentanasMantenimiento.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaVentanasMantenimiento.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/components/PestanaVentanasMantenimiento.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.3.2 Archivo: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/procesos/cambios/notificaciones-calendario`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.2.11.1.4 Archivo: `src/app/(app)/admin/procesos/cambios/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/procesos/cambios`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.11.1.5 Directorio: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tipos-requisitos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.1.5.1 Directorio: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.11.1.5.1.1 Archivo: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaMatrizAutoridad.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaMatrizAutoridad.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaMatrizAutoridad.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.5.1.2 Archivo: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaModelosEstandar.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaModelosEstandar.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaModelosEstandar.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.5.1.3 Archivo: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaReglasClasificacion.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaReglasClasificacion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaReglasClasificacion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.5.1.4 Archivo: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaTiposCambio.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaTiposCambio.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/cambios/tipos-requisitos/components/PestanaTiposCambio.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.1.5.2 Archivo: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/procesos/cambios/tipos-requisitos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.11.2 Directorio: `src/app/(app)/admin/procesos/problemas/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/problemas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `problemas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.2.1 Directorio: `src/app/(app)/admin/procesos/problemas/flujo/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/problemas/flujo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `flujo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.2.1.1 Directorio: `src/app/(app)/admin/procesos/problemas/flujo/components/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/problemas/flujo/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.11.2.1.1.1 Archivo: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaAsignacion.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaAsignacion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaAsignacion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.1.1.2 Archivo: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaEscalamiento.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaEscalamiento.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaEscalamiento.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.1.1.3 Archivo: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaEstados.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaEstados.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaEstados.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.1.1.4 Archivo: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaMayores.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaMayores.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaMayores.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.1.1.5 Archivo: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaObjetivosTiempo.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaObjetivosTiempo.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaObjetivosTiempo.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.1.1.6 Archivo: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaReapertura.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaReapertura.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaReapertura.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.1.1.7 Archivo: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaTareas.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaTareas.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaTareas.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.1.1.8 Archivo: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaTransiciones.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaTransiciones.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/flujo/components/PestanaTransiciones.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.1.2 Archivo: `src/app/(app)/admin/procesos/problemas/flujo/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/flujo/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/procesos/problemas/flujo`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.11.2.2 Directorio: `src/app/(app)/admin/procesos/problemas/formulario/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/problemas/formulario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `formulario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.2.2.1 Directorio: `src/app/(app)/admin/procesos/problemas/formulario/components/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/problemas/formulario/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.11.2.2.1.1 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/components/BarraAccionesComun.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/components/BarraAccionesComun.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/formulario/components/BarraAccionesComun.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.2.1.2 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/components/ModalHistorialVersiones.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/components/ModalHistorialVersiones.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/formulario/components/ModalHistorialVersiones.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.2.1.3 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/components/ModalPublicacion.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/components/ModalPublicacion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/formulario/components/ModalPublicacion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.2.1.4 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/components/ModalRestaurarFabrica.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/components/ModalRestaurarFabrica.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/formulario/components/ModalRestaurarFabrica.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.2.1.5 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/components/ModalVistaPrevia.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/components/ModalVistaPrevia.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/formulario/components/ModalVistaPrevia.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.2.1.6 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaCampos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaCampos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaCampos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.2.1.7 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaListasCatalogos.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaListasCatalogos.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaListasCatalogos.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.2.1.8 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaPlantillas.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaPlantillas.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaPlantillas.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.2.1.9 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaVistaTicket.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaVistaTicket.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/formulario/components/PestanaVistaTicket.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.2.2 Archivo: `src/app/(app)/admin/procesos/problemas/formulario/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/formulario/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/procesos/problemas/formulario`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.2.11.2.3 Archivo: `src/app/(app)/admin/procesos/problemas/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/procesos/problemas`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.11.2.4 Directorio: `src/app/(app)/admin/procesos/problemas/relaciones/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/problemas/relaciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `relaciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.11.2.4.1 Directorio: `src/app/(app)/admin/procesos/problemas/relaciones/components/`
* **Ruta Relativa**: `src/app/(app)/admin/procesos/problemas/relaciones/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.11.2.4.1.1 Archivo: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaCmdb.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaCmdb.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaCmdb.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.4.1.2 Archivo: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaConocimiento.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaConocimiento.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaConocimiento.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.4.1.3 Archivo: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaIncidentesVinculados.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaIncidentesVinculados.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaIncidentesVinculados.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.4.1.4 Archivo: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaKedb.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaKedb.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaKedb.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.4.1.5 Archivo: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaRfc.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaRfc.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaRfc.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.4.1.6 Archivo: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaUmbral.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaUmbral.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/procesos/problemas/relaciones/components/PestanaUmbral.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.11.2.4.2 Archivo: `src/app/(app)/admin/procesos/problemas/relaciones/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/procesos/problemas/relaciones/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/procesos/problemas/relaciones`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.12 Directorio: `src/app/(app)/admin/reportes-disenador/`
* **Ruta Relativa**: `src/app/(app)/admin/reportes-disenador/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `reportes-disenador`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.12.1 Archivo: `src/app/(app)/admin/reportes-disenador/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/reportes-disenador/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/reportes-disenador`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.13 Directorio: `src/app/(app)/admin/rfc/`
* **Ruta Relativa**: `src/app/(app)/admin/rfc/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `rfc`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.13.1 Archivo: `src/app/(app)/admin/rfc/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/rfc/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/rfc`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.14 Directorio: `src/app/(app)/admin/seguridad-logs/`
* **Ruta Relativa**: `src/app/(app)/admin/seguridad-logs/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `seguridad-logs`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.14.1 Archivo: `src/app/(app)/admin/seguridad-logs/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/seguridad-logs/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/seguridad-logs`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.15 Directorio: `src/app/(app)/admin/servicios/`
* **Ruta Relativa**: `src/app/(app)/admin/servicios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Administrador del Catalogo de Servicios y Clasificacion de Categorias de TI.
* **Que hace**: Permite dar de alta, editar y organizar los servicios corporativos, sus SLAs y las categorias maestras que los agrupan.
* **Que contiene**: Gestion de servicios (`page.tsx`), configuracion de SLAs (`sla/page.tsx`), formulario de servicio (`[id]/formulario/page.tsx`) y el componente interactivo de categorias (`GestionCategorias.tsx`).

#### 1.1.1.2.15.1 Archivo: `src/app/(app)/admin/servicios/ConfiguracionObjetivosSla.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/servicios/ConfiguracionObjetivosSla.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/servicios/ConfiguracionObjetivosSla.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.15.2 Archivo: `src/app/(app)/admin/servicios/GestionCategorias.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/servicios/GestionCategorias.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Modulo completo de administracion de categorias tecnicas dentro del catalogo de servicios.
* **Que hace**: Implementa el CRUD de categorias sincronizado en tiempo real con los botones de autoservicio y los desplegables de tickets.
* **Que contiene**: Validaciones reactivas en tiempo real para unicidad de nombre y codigo, y la regla ITIL v4 de SLA respuesta < SLA resolucion.

### 1.1.1.2.15.3 Directorio: `src/app/(app)/admin/servicios/[id]/`
* **Ruta Relativa**: `src/app/(app)/admin/servicios/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.15.3.1 Directorio: `src/app/(app)/admin/servicios/[id]/formulario/`
* **Ruta Relativa**: `src/app/(app)/admin/servicios/[id]/formulario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `formulario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.15.3.1.1 Archivo: `src/app/(app)/admin/servicios/[id]/formulario/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/servicios/[id]/formulario/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/servicios/[id]/formulario`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.2.15.3.1.2 Archivo: `src/app/(app)/admin/servicios/[id]/formulario/ui.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/servicios/[id]/formulario/ui.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/servicios/[id]/formulario/ui.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.15.4 Archivo: `src/app/(app)/admin/servicios/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/servicios/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/servicios`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.15.5 Directorio: `src/app/(app)/admin/servicios/sla/`
* **Ruta Relativa**: `src/app/(app)/admin/servicios/sla/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `sla`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.2.15.5.1 Directorio: `src/app/(app)/admin/servicios/sla/components/`
* **Ruta Relativa**: `src/app/(app)/admin/servicios/sla/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `components`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.15.5.1.1 Archivo: `src/app/(app)/admin/servicios/sla/components/MatrizPrioridadSla.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/servicios/sla/components/MatrizPrioridadSla.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/admin/servicios/sla/components/MatrizPrioridadSla.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.1.1.2.15.5.2 Archivo: `src/app/(app)/admin/servicios/sla/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/servicios/sla/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/servicios/sla`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.16 Directorio: `src/app/(app)/admin/tecnicos/`
* **Ruta Relativa**: `src/app/(app)/admin/tecnicos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tecnicos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.16.1 Archivo: `src/app/(app)/admin/tecnicos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/tecnicos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/tecnicos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.17 Directorio: `src/app/(app)/admin/tickets-formularios/`
* **Ruta Relativa**: `src/app/(app)/admin/tickets-formularios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tickets-formularios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.17.1 Archivo: `src/app/(app)/admin/tickets-formularios/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/tickets-formularios/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/tickets-formularios`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.18 Directorio: `src/app/(app)/admin/tickets-vistas/`
* **Ruta Relativa**: `src/app/(app)/admin/tickets-vistas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tickets-vistas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.18.1 Archivo: `src/app/(app)/admin/tickets-vistas/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/tickets-vistas/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/tickets-vistas`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.2.19 Directorio: `src/app/(app)/admin/usuarios/`
* **Ruta Relativa**: `src/app/(app)/admin/usuarios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `usuarios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.2.19.1 Archivo: `src/app/(app)/admin/usuarios/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/admin/usuarios/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/admin/usuarios`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.3 Directorio: `src/app/(app)/cambios/`
* **Ruta Relativa**: `src/app/(app)/cambios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Modulo de Habilitacion del Cambio (Change Enablement / RFC) segun ITIL v4.
* **Que hace**: Controla el flujo de evaluacion, evaluacion de riesgos, dictamen del comite CAB, ventanas de congelamiento y despliegue.
* **Que contiene**: Pantallas de gestion de cambios (`gestion/`), sala de evaluacion colegiada CAB (`gestion/cab/`), calendario de ventanas (`gestion/calendario/`) y detalle de cambio (`gestion/[id]/`).

### 1.1.1.3.1 Directorio: `src/app/(app)/cambios/gestion/`
* **Ruta Relativa**: `src/app/(app)/cambios/gestion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `gestion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.3.1.1 Directorio: `src/app/(app)/cambios/gestion/[id]/`
* **Ruta Relativa**: `src/app/(app)/cambios/gestion/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.3.1.1.1 Archivo: `src/app/(app)/cambios/gestion/[id]/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/cambios/gestion/[id]/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/cambios/gestion/[id]`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.3.1.2 Directorio: `src/app/(app)/cambios/gestion/cab/`
* **Ruta Relativa**: `src/app/(app)/cambios/gestion/cab/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cab`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.3.1.2.1 Archivo: `src/app/(app)/cambios/gestion/cab/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/cambios/gestion/cab/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/cambios/gestion/cab`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.3.1.3 Directorio: `src/app/(app)/cambios/gestion/calendario/`
* **Ruta Relativa**: `src/app/(app)/cambios/gestion/calendario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `calendario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.3.1.3.1 Archivo: `src/app/(app)/cambios/gestion/calendario/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/cambios/gestion/calendario/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/cambios/gestion/calendario`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.3.1.4 Directorio: `src/app/(app)/cambios/gestion/crear/`
* **Ruta Relativa**: `src/app/(app)/cambios/gestion/crear/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `crear`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.3.1.4.1 Archivo: `src/app/(app)/cambios/gestion/crear/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/cambios/gestion/crear/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/cambios/gestion/crear`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.3.1.5 Archivo: `src/app/(app)/cambios/gestion/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/cambios/gestion/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/cambios/gestion`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.3.1.6 Directorio: `src/app/(app)/cambios/gestion/todos/`
* **Ruta Relativa**: `src/app/(app)/cambios/gestion/todos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `todos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.3.1.6.1 Archivo: `src/app/(app)/cambios/gestion/todos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/cambios/gestion/todos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/cambios/gestion/todos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.3.2 Archivo: `src/app/(app)/cambios/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/cambios/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/cambios`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.4 Directorio: `src/app/(app)/dashboard/`
* **Ruta Relativa**: `src/app/(app)/dashboard/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `dashboard`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.4.1 Archivo: `src/app/(app)/dashboard/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/dashboard/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/dashboard`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.5 Directorio: `src/app/(app)/incidentes/`
* **Ruta Relativa**: `src/app/(app)/incidentes/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `incidentes`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.5.1 Archivo: `src/app/(app)/incidentes/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/incidentes/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/incidentes`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.6 Archivo: `src/app/(app)/layout.tsx`
* **Ruta de Archivo**: `src/app/(app)/layout.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/app/(app)/layout.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

### 1.1.1.7 Directorio: `src/app/(app)/mi-cuenta/`
* **Ruta Relativa**: `src/app/(app)/mi-cuenta/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mi-cuenta`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.7.1 Archivo: `src/app/(app)/mi-cuenta/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/mi-cuenta/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/mi-cuenta`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.8 Directorio: `src/app/(app)/operacion/`
* **Ruta Relativa**: `src/app/(app)/operacion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `operacion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.8.1 Directorio: `src/app/(app)/operacion/eventos/`
* **Ruta Relativa**: `src/app/(app)/operacion/eventos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `eventos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.8.1.1 Archivo: `src/app/(app)/operacion/eventos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/operacion/eventos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/operacion/eventos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.8.2 Archivo: `src/app/(app)/operacion/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/operacion/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/operacion`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.8.3 Directorio: `src/app/(app)/operacion/resiliencia/`
* **Ruta Relativa**: `src/app/(app)/operacion/resiliencia/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `resiliencia`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.8.3.1 Archivo: `src/app/(app)/operacion/resiliencia/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/operacion/resiliencia/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/operacion/resiliencia`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.9 Directorio: `src/app/(app)/problemas/`
* **Ruta Relativa**: `src/app/(app)/problemas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Modulo de Gestion de Problemas (Problem Management) y Base de Errores Conocidos (KEDB).
* **Que hace**: Permite investigar fallas recurrentes, determinar causas raiz (RCA) y documentar soluciones temporales (Workarounds).
* **Que contiene**: Listado y seguimiento de problemas (`page.tsx`) y el repositorio de soluciones de errores conocidos (`kedb/page.tsx`).

### 1.1.1.9.1 Directorio: `src/app/(app)/problemas/kedb/`
* **Ruta Relativa**: `src/app/(app)/problemas/kedb/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `kedb`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.9.1.1 Archivo: `src/app/(app)/problemas/kedb/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/problemas/kedb/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/problemas/kedb`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.9.2 Archivo: `src/app/(app)/problemas/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/problemas/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/problemas`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.10 Directorio: `src/app/(app)/proveedores/`
* **Ruta Relativa**: `src/app/(app)/proveedores/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `proveedores`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.10.1 Archivo: `src/app/(app)/proveedores/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/proveedores/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/proveedores`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.11 Directorio: `src/app/(app)/solicitudes/`
* **Ruta Relativa**: `src/app/(app)/solicitudes/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `solicitudes`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.11.1 Archivo: `src/app/(app)/solicitudes/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/solicitudes/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/solicitudes`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12 Directorio: `src/app/(app)/tecnico/`
* **Ruta Relativa**: `src/app/(app)/tecnico/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Consola operativa especializada para el personal de Mesa de Ayuda (Perfil 2: Tecnico).
* **Que hace**: Brinda al especialista una estacion de trabajo optimizada para atender su carga de trabajo diaria.
* **Que contiene**: Submodulos de activos, agenda, cambios, catalogo, base de conocimiento, desempeno, colas de mesa (area, asignados, buscar, historial, pendientes, registrar), panel de control y SLAs.

### 1.1.1.12.1 Directorio: `src/app/(app)/tecnico/activos/`
* **Ruta Relativa**: `src/app/(app)/tecnico/activos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `activos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.12.1.1 Directorio: `src/app/(app)/tecnico/activos/conteos/`
* **Ruta Relativa**: `src/app/(app)/tecnico/activos/conteos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `conteos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.1.1.1 Archivo: `src/app/(app)/tecnico/activos/conteos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/activos/conteos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/activos/conteos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.1.2 Directorio: `src/app/(app)/tecnico/activos/inventario/`
* **Ruta Relativa**: `src/app/(app)/tecnico/activos/inventario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `inventario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.1.2.1 Archivo: `src/app/(app)/tecnico/activos/inventario/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/activos/inventario/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/activos/inventario`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.1.3 Directorio: `src/app/(app)/tecnico/activos/licencias/`
* **Ruta Relativa**: `src/app/(app)/tecnico/activos/licencias/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `licencias`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.1.3.1 Archivo: `src/app/(app)/tecnico/activos/licencias/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/activos/licencias/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/activos/licencias`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.1.4 Directorio: `src/app/(app)/tecnico/activos/mantenimiento/`
* **Ruta Relativa**: `src/app/(app)/tecnico/activos/mantenimiento/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mantenimiento`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.1.4.1 Archivo: `src/app/(app)/tecnico/activos/mantenimiento/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/activos/mantenimiento/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/activos/mantenimiento`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.1.5 Directorio: `src/app/(app)/tecnico/activos/mapa/`
* **Ruta Relativa**: `src/app/(app)/tecnico/activos/mapa/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mapa`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.1.5.1 Archivo: `src/app/(app)/tecnico/activos/mapa/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/activos/mapa/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/activos/mapa`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.2 Directorio: `src/app/(app)/tecnico/agenda/`
* **Ruta Relativa**: `src/app/(app)/tecnico/agenda/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `agenda`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.2.1 Archivo: `src/app/(app)/tecnico/agenda/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/agenda/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/agenda`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.3 Directorio: `src/app/(app)/tecnico/cambios/`
* **Ruta Relativa**: `src/app/(app)/tecnico/cambios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cambios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.12.3.1 Directorio: `src/app/(app)/tecnico/cambios/calendario/`
* **Ruta Relativa**: `src/app/(app)/tecnico/cambios/calendario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `calendario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.3.1.1 Archivo: `src/app/(app)/tecnico/cambios/calendario/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/cambios/calendario/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/cambios/calendario`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.3.2 Directorio: `src/app/(app)/tecnico/cambios/historial/`
* **Ruta Relativa**: `src/app/(app)/tecnico/cambios/historial/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `historial`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.3.2.1 Archivo: `src/app/(app)/tecnico/cambios/historial/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/cambios/historial/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/cambios/historial`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.3.3 Directorio: `src/app/(app)/tecnico/cambios/impacto/`
* **Ruta Relativa**: `src/app/(app)/tecnico/cambios/impacto/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `impacto`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.3.3.1 Archivo: `src/app/(app)/tecnico/cambios/impacto/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/cambios/impacto/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/cambios/impacto`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.3.4 Directorio: `src/app/(app)/tecnico/cambios/implementacion/`
* **Ruta Relativa**: `src/app/(app)/tecnico/cambios/implementacion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `implementacion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.3.4.1 Archivo: `src/app/(app)/tecnico/cambios/implementacion/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/cambios/implementacion/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/cambios/implementacion`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.3.5 Directorio: `src/app/(app)/tecnico/cambios/mis-cambios/`
* **Ruta Relativa**: `src/app/(app)/tecnico/cambios/mis-cambios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mis-cambios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.3.5.1 Archivo: `src/app/(app)/tecnico/cambios/mis-cambios/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/cambios/mis-cambios/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/cambios/mis-cambios`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.3.6 Directorio: `src/app/(app)/tecnico/cambios/nuevo/`
* **Ruta Relativa**: `src/app/(app)/tecnico/cambios/nuevo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `nuevo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.3.6.1 Archivo: `src/app/(app)/tecnico/cambios/nuevo/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/cambios/nuevo/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/cambios/nuevo`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.4 Directorio: `src/app/(app)/tecnico/catalogo/`
* **Ruta Relativa**: `src/app/(app)/tecnico/catalogo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `catalogo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.4.1 Archivo: `src/app/(app)/tecnico/catalogo/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/catalogo/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/catalogo`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.5 Directorio: `src/app/(app)/tecnico/conocimiento/`
* **Ruta Relativa**: `src/app/(app)/tecnico/conocimiento/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `conocimiento`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.12.5.1 Directorio: `src/app/(app)/tecnico/conocimiento/base/`
* **Ruta Relativa**: `src/app/(app)/tecnico/conocimiento/base/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `base`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.5.1.1 Archivo: `src/app/(app)/tecnico/conocimiento/base/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/conocimiento/base/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/conocimiento/base`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.5.2 Directorio: `src/app/(app)/tecnico/conocimiento/mis-articulos/`
* **Ruta Relativa**: `src/app/(app)/tecnico/conocimiento/mis-articulos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mis-articulos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.5.2.1 Archivo: `src/app/(app)/tecnico/conocimiento/mis-articulos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/conocimiento/mis-articulos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/conocimiento/mis-articulos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.5.3 Directorio: `src/app/(app)/tecnico/conocimiento/nuevo/`
* **Ruta Relativa**: `src/app/(app)/tecnico/conocimiento/nuevo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `nuevo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.5.3.1 Archivo: `src/app/(app)/tecnico/conocimiento/nuevo/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/conocimiento/nuevo/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/conocimiento/nuevo`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.5.4 Directorio: `src/app/(app)/tecnico/conocimiento/revisiones/`
* **Ruta Relativa**: `src/app/(app)/tecnico/conocimiento/revisiones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `revisiones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.5.4.1 Archivo: `src/app/(app)/tecnico/conocimiento/revisiones/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/conocimiento/revisiones/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/conocimiento/revisiones`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.6 Directorio: `src/app/(app)/tecnico/desempeno/`
* **Ruta Relativa**: `src/app/(app)/tecnico/desempeno/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `desempeno`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.6.1 Archivo: `src/app/(app)/tecnico/desempeno/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/desempeno/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/desempeno`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.7 Directorio: `src/app/(app)/tecnico/mesa/`
* **Ruta Relativa**: `src/app/(app)/tecnico/mesa/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mesa`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.12.7.1 Directorio: `src/app/(app)/tecnico/mesa/area/`
* **Ruta Relativa**: `src/app/(app)/tecnico/mesa/area/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `area`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.7.1.1 Archivo: `src/app/(app)/tecnico/mesa/area/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/mesa/area/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/mesa/area`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.7.2 Directorio: `src/app/(app)/tecnico/mesa/asignados/`
* **Ruta Relativa**: `src/app/(app)/tecnico/mesa/asignados/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `asignados`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.7.2.1 Archivo: `src/app/(app)/tecnico/mesa/asignados/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/mesa/asignados/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/mesa/asignados`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.7.3 Directorio: `src/app/(app)/tecnico/mesa/buscar/`
* **Ruta Relativa**: `src/app/(app)/tecnico/mesa/buscar/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `buscar`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.7.3.1 Archivo: `src/app/(app)/tecnico/mesa/buscar/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/mesa/buscar/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/mesa/buscar`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.7.4 Directorio: `src/app/(app)/tecnico/mesa/historial/`
* **Ruta Relativa**: `src/app/(app)/tecnico/mesa/historial/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `historial`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.7.4.1 Archivo: `src/app/(app)/tecnico/mesa/historial/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/mesa/historial/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/mesa/historial`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.7.5 Directorio: `src/app/(app)/tecnico/mesa/pendientes/`
* **Ruta Relativa**: `src/app/(app)/tecnico/mesa/pendientes/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `pendientes`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.7.5.1 Archivo: `src/app/(app)/tecnico/mesa/pendientes/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/mesa/pendientes/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/mesa/pendientes`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.7.6 Directorio: `src/app/(app)/tecnico/mesa/registrar/`
* **Ruta Relativa**: `src/app/(app)/tecnico/mesa/registrar/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `registrar`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.7.6.1 Archivo: `src/app/(app)/tecnico/mesa/registrar/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/mesa/registrar/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/mesa/registrar`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.12.8 Archivo: `src/app/(app)/tecnico/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.9 Directorio: `src/app/(app)/tecnico/panel/`
* **Ruta Relativa**: `src/app/(app)/tecnico/panel/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `panel`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.9.1 Archivo: `src/app/(app)/tecnico/panel/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/panel/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/panel`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.10 Directorio: `src/app/(app)/tecnico/problemas/`
* **Ruta Relativa**: `src/app/(app)/tecnico/problemas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `problemas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.12.10.1 Directorio: `src/app/(app)/tecnico/problemas/asignados/`
* **Ruta Relativa**: `src/app/(app)/tecnico/problemas/asignados/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `asignados`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.10.1.1 Archivo: `src/app/(app)/tecnico/problemas/asignados/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/problemas/asignados/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/problemas/asignados`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.10.2 Directorio: `src/app/(app)/tecnico/problemas/candidatos/`
* **Ruta Relativa**: `src/app/(app)/tecnico/problemas/candidatos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `candidatos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.10.2.1 Archivo: `src/app/(app)/tecnico/problemas/candidatos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/problemas/candidatos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/problemas/candidatos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.10.3 Directorio: `src/app/(app)/tecnico/problemas/errores-conocidos/`
* **Ruta Relativa**: `src/app/(app)/tecnico/problemas/errores-conocidos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `errores-conocidos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.10.3.1 Archivo: `src/app/(app)/tecnico/problemas/errores-conocidos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/problemas/errores-conocidos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/problemas/errores-conocidos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.10.4 Directorio: `src/app/(app)/tecnico/problemas/grupo/`
* **Ruta Relativa**: `src/app/(app)/tecnico/problemas/grupo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `grupo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.10.4.1 Archivo: `src/app/(app)/tecnico/problemas/grupo/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/problemas/grupo/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/problemas/grupo`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.10.5 Directorio: `src/app/(app)/tecnico/problemas/nuevo/`
* **Ruta Relativa**: `src/app/(app)/tecnico/problemas/nuevo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `nuevo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.10.5.1 Archivo: `src/app/(app)/tecnico/problemas/nuevo/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/problemas/nuevo/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/problemas/nuevo`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.11 Directorio: `src/app/(app)/tecnico/sla/`
* **Ruta Relativa**: `src/app/(app)/tecnico/sla/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `sla`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.12.11.1 Directorio: `src/app/(app)/tecnico/sla/objetivos/`
* **Ruta Relativa**: `src/app/(app)/tecnico/sla/objetivos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `objetivos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.11.1.1 Archivo: `src/app/(app)/tecnico/sla/objetivos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/sla/objetivos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/sla/objetivos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.11.2 Directorio: `src/app/(app)/tecnico/sla/semaforo/`
* **Ruta Relativa**: `src/app/(app)/tecnico/sla/semaforo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `semaforo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.11.2.1 Archivo: `src/app/(app)/tecnico/sla/semaforo/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/sla/semaforo/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/sla/semaforo`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.12.12 Directorio: `src/app/(app)/tecnico/tareas/`
* **Ruta Relativa**: `src/app/(app)/tecnico/tareas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tareas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.12.12.1 Archivo: `src/app/(app)/tecnico/tareas/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tecnico/tareas/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tecnico/tareas`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13 Directorio: `src/app/(app)/tickets/`
* **Ruta Relativa**: `src/app/(app)/tickets/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Modulo unificado de atencion, autoservicio y seguimiento de tickets.
* **Que hace**: Sirve tanto a solicitantes para consultar el catalogo y crear tickets, como a supervisores y tecnicos para gestionarlos.
* **Que contiene**: Catalogo interactivo (`catalogo/`), gestion avanzada (`gestion/`), reportes (`reportes/`) y la vista de detalle dinamico (`[id]/page.tsx`).

### 1.1.1.13.1 Directorio: `src/app/(app)/tickets/[id]/`
* **Ruta Relativa**: `src/app/(app)/tickets/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.1.1 Archivo: `src/app/(app)/tickets/[id]/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/[id]/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/[id]`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.2 Directorio: `src/app/(app)/tickets/catalogo/`
* **Ruta Relativa**: `src/app/(app)/tickets/catalogo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `catalogo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.2.1 Archivo: `src/app/(app)/tickets/catalogo/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/catalogo/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/catalogo`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3 Directorio: `src/app/(app)/tickets/gestion/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `gestion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.13.3.1 Directorio: `src/app/(app)/tickets/gestion/aprobaciones/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/aprobaciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `aprobaciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.1.1 Archivo: `src/app/(app)/tickets/gestion/aprobaciones/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/aprobaciones/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/aprobaciones`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.2 Directorio: `src/app/(app)/tickets/gestion/asignados/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/asignados/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `asignados`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.2.1 Archivo: `src/app/(app)/tickets/gestion/asignados/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/asignados/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/asignados`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.3 Directorio: `src/app/(app)/tickets/gestion/asignar/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/asignar/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `asignar`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.3.1 Archivo: `src/app/(app)/tickets/gestion/asignar/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/asignar/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/asignar`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.4 Directorio: `src/app/(app)/tickets/gestion/auditoria/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/auditoria/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `auditoria`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.4.1 Archivo: `src/app/(app)/tickets/gestion/auditoria/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/auditoria/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/auditoria`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.5 Directorio: `src/app/(app)/tickets/gestion/ayuda/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/ayuda/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `ayuda`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.5.1 Archivo: `src/app/(app)/tickets/gestion/ayuda/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/ayuda/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/ayuda`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.6 Directorio: `src/app/(app)/tickets/gestion/bandeja/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/bandeja/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `bandeja`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.6.1 Archivo: `src/app/(app)/tickets/gestion/bandeja/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/bandeja/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/bandeja`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.7 Directorio: `src/app/(app)/tickets/gestion/cambios/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/cambios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cambios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.13.3.8 Directorio: `src/app/(app)/tickets/gestion/colaboradores/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/colaboradores/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `colaboradores`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.8.1 Archivo: `src/app/(app)/tickets/gestion/colaboradores/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/colaboradores/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/colaboradores`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.9 Directorio: `src/app/(app)/tickets/gestion/crear/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/crear/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `crear`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.9.1 Archivo: `src/app/(app)/tickets/gestion/crear/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/crear/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/crear`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.10 Directorio: `src/app/(app)/tickets/gestion/departamento/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/departamento/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `departamento`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.10.1 Archivo: `src/app/(app)/tickets/gestion/departamento/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/departamento/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/departamento`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.11 Directorio: `src/app/(app)/tickets/gestion/incidentes/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/incidentes/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `incidentes`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.11.1 Archivo: `src/app/(app)/tickets/gestion/incidentes/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/incidentes/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/incidentes`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.12 Directorio: `src/app/(app)/tickets/gestion/mios/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/mios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.12.1 Archivo: `src/app/(app)/tickets/gestion/mios/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/mios/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/mios`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.13.3.13 Archivo: `src/app/(app)/tickets/gestion/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.14 Directorio: `src/app/(app)/tickets/gestion/problemas/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/problemas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `problemas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.1.13.3.15 Directorio: `src/app/(app)/tickets/gestion/resueltos/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/resueltos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `resueltos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.15.1 Archivo: `src/app/(app)/tickets/gestion/resueltos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/resueltos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/resueltos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.16 Directorio: `src/app/(app)/tickets/gestion/solicitudes/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/solicitudes/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `solicitudes`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.16.1 Archivo: `src/app/(app)/tickets/gestion/solicitudes/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/solicitudes/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/solicitudes`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.17 Directorio: `src/app/(app)/tickets/gestion/tecnicos/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/tecnicos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tecnicos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.17.1 Archivo: `src/app/(app)/tickets/gestion/tecnicos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/tecnicos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/tecnicos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.3.18 Directorio: `src/app/(app)/tickets/gestion/todos/`
* **Ruta Relativa**: `src/app/(app)/tickets/gestion/todos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `todos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.3.18.1 Archivo: `src/app/(app)/tickets/gestion/todos/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/gestion/todos/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/gestion/todos`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

#### 1.1.1.13.4 Archivo: `src/app/(app)/tickets/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.1.13.5 Directorio: `src/app/(app)/tickets/reportes/`
* **Ruta Relativa**: `src/app/(app)/tickets/reportes/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `reportes`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.1.13.5.1 Archivo: `src/app/(app)/tickets/reportes/page.tsx`
* **Ruta de Archivo**: `src/app/(app)/tickets/reportes/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente de pagina (React Page) correspondiente a la ruta navegable `/tickets/reportes`.
* **Que hace**: Renderiza la interfaz de usuario para esta seccion, gestiona estados reactivos (`useState`), consume APIs mediante `fetch` y aplica las politicas de visualizacion segun el rol activo.
* **Que contiene**: Maquetacion visual con tablas interactivas, formularios con validaciones reactivas en tiempo real o paneles de indicadores.

### 1.1.2 Directorio: `src/app/api/`
* **Ruta Relativa**: `src/app/api/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Capa de backend y servicios RESTful (Route Handlers) de Next.js.
* **Que hace**: Recibe peticiones HTTP, valida la seguridad del token JWT, sanitiza entradas y ejecuta consultas SQL en PostgreSQL.
* **Que contiene**: 119 rutas organizadas por dominios de negocio: admin/, area/, auth/, cambios/, conocimiento/, departamentos/, incidentes/, menu/, mi-cuenta/, operacion/, perfiles/, problemas/, proveedores/, reportes/, servicios/, solicitudes/, tecnico/, tecnicos/, tickets/ y usuarios/.

### 1.1.2.1 Directorio: `src/app/api/activos/`
* **Ruta Relativa**: `src/app/api/activos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `activos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.1.1 Directorio: `src/app/api/activos/[id]/`
* **Ruta Relativa**: `src/app/api/activos/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.1.1.1 Directorio: `src/app/api/activos/[id]/historial/`
* **Ruta Relativa**: `src/app/api/activos/[id]/historial/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `historial`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.1.1.1.1 Archivo: `src/app/api/activos/[id]/historial/route.ts`
* **Ruta de Archivo**: `src/app/api/activos/[id]/historial/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/activos/[id]/historial`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.1.2 Directorio: `src/app/api/activos/cmdb/`
* **Ruta Relativa**: `src/app/api/activos/cmdb/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cmdb`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.1.2.1 Directorio: `src/app/api/activos/cmdb/relaciones/`
* **Ruta Relativa**: `src/app/api/activos/cmdb/relaciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `relaciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.1.2.1.1 Archivo: `src/app/api/activos/cmdb/relaciones/route.ts`
* **Ruta de Archivo**: `src/app/api/activos/cmdb/relaciones/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/activos/cmdb/relaciones`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.1.2.2 Archivo: `src/app/api/activos/cmdb/route.ts`
* **Ruta de Archivo**: `src/app/api/activos/cmdb/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/activos/cmdb`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.1.3 Directorio: `src/app/api/activos/licencias/`
* **Ruta Relativa**: `src/app/api/activos/licencias/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `licencias`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.1.3.1 Directorio: `src/app/api/activos/licencias/asignaciones/`
* **Ruta Relativa**: `src/app/api/activos/licencias/asignaciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `asignaciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.1.3.1.1 Archivo: `src/app/api/activos/licencias/asignaciones/route.ts`
* **Ruta de Archivo**: `src/app/api/activos/licencias/asignaciones/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/activos/licencias/asignaciones`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.1.3.2 Archivo: `src/app/api/activos/licencias/route.ts`
* **Ruta de Archivo**: `src/app/api/activos/licencias/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/activos/licencias`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.1.4 Directorio: `src/app/api/activos/modelos/`
* **Ruta Relativa**: `src/app/api/activos/modelos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `modelos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.1.4.1 Archivo: `src/app/api/activos/modelos/route.ts`
* **Ruta de Archivo**: `src/app/api/activos/modelos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/activos/modelos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.1.5 Archivo: `src/app/api/activos/route.ts`
* **Ruta de Archivo**: `src/app/api/activos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/activos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.1.6 Directorio: `src/app/api/activos/tipos/`
* **Ruta Relativa**: `src/app/api/activos/tipos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tipos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.1.6.1 Archivo: `src/app/api/activos/tipos/route.ts`
* **Ruta de Archivo**: `src/app/api/activos/tipos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/activos/tipos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2 Directorio: `src/app/api/admin/`
* **Ruta Relativa**: `src/app/api/admin/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `admin`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.1 Directorio: `src/app/api/admin/activos-config/`
* **Ruta Relativa**: `src/app/api/admin/activos-config/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `activos-config`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.1.1 Directorio: `src/app/api/admin/activos-config/ciclos-vida-transiciones/`
* **Ruta Relativa**: `src/app/api/admin/activos-config/ciclos-vida-transiciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `ciclos-vida-transiciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.1.1.1 Directorio: `src/app/api/admin/activos-config/ciclos-vida-transiciones/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/activos-config/ciclos-vida-transiciones/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.1.1.1.1 Archivo: `src/app/api/admin/activos-config/ciclos-vida-transiciones/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/activos-config/ciclos-vida-transiciones/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/activos-config/ciclos-vida-transiciones/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.1.2 Directorio: `src/app/api/admin/activos-config/cmdb-relaciones/`
* **Ruta Relativa**: `src/app/api/admin/activos-config/cmdb-relaciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cmdb-relaciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.1.2.1 Directorio: `src/app/api/admin/activos-config/cmdb-relaciones/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/activos-config/cmdb-relaciones/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.1.2.1.1 Archivo: `src/app/api/admin/activos-config/cmdb-relaciones/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/activos-config/cmdb-relaciones/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/activos-config/cmdb-relaciones/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.1.3 Directorio: `src/app/api/admin/activos-config/licencias-contratos/`
* **Ruta Relativa**: `src/app/api/admin/activos-config/licencias-contratos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `licencias-contratos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.1.3.1 Directorio: `src/app/api/admin/activos-config/licencias-contratos/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/activos-config/licencias-contratos/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.1.3.1.1 Archivo: `src/app/api/admin/activos-config/licencias-contratos/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/activos-config/licencias-contratos/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/activos-config/licencias-contratos/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.1.4 Directorio: `src/app/api/admin/activos-config/tipos-modelos-atributos/`
* **Ruta Relativa**: `src/app/api/admin/activos-config/tipos-modelos-atributos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tipos-modelos-atributos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.1.4.1 Directorio: `src/app/api/admin/activos-config/tipos-modelos-atributos/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/activos-config/tipos-modelos-atributos/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.1.4.1.1 Archivo: `src/app/api/admin/activos-config/tipos-modelos-atributos/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/activos-config/tipos-modelos-atributos/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/activos-config/tipos-modelos-atributos/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.2 Directorio: `src/app/api/admin/auditoria-sistema/`
* **Ruta Relativa**: `src/app/api/admin/auditoria-sistema/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `auditoria-sistema`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.2.1 Archivo: `src/app/api/admin/auditoria-sistema/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/auditoria-sistema/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/auditoria-sistema`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3 Directorio: `src/app/api/admin/cambios/`
* **Ruta Relativa**: `src/app/api/admin/cambios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cambios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.3.1 Directorio: `src/app/api/admin/cambios/campos-personalizados/`
* **Ruta Relativa**: `src/app/api/admin/cambios/campos-personalizados/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `campos-personalizados`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.1.1 Archivo: `src/app/api/admin/cambios/campos-personalizados/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/campos-personalizados/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/campos-personalizados`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.2 Directorio: `src/app/api/admin/cambios/catalogos/`
* **Ruta Relativa**: `src/app/api/admin/cambios/catalogos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `catalogos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.2.1 Archivo: `src/app/api/admin/cambios/catalogos/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/catalogos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/catalogos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.3 Directorio: `src/app/api/admin/cambios/cuestionario-riesgo/`
* **Ruta Relativa**: `src/app/api/admin/cambios/cuestionario-riesgo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cuestionario-riesgo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.3.1 Archivo: `src/app/api/admin/cambios/cuestionario-riesgo/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/cuestionario-riesgo/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/cuestionario-riesgo`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.4 Directorio: `src/app/api/admin/cambios/flujo-evaluacion/`
* **Ruta Relativa**: `src/app/api/admin/cambios/flujo-evaluacion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `flujo-evaluacion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.3.4.1 Directorio: `src/app/api/admin/cambios/flujo-evaluacion/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/cambios/flujo-evaluacion/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.4.1.1 Archivo: `src/app/api/admin/cambios/flujo-evaluacion/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/flujo-evaluacion/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/flujo-evaluacion/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.4.2 Directorio: `src/app/api/admin/cambios/flujo-evaluacion/simular-escalamiento/`
* **Ruta Relativa**: `src/app/api/admin/cambios/flujo-evaluacion/simular-escalamiento/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `simular-escalamiento`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.4.2.1 Archivo: `src/app/api/admin/cambios/flujo-evaluacion/simular-escalamiento/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/flujo-evaluacion/simular-escalamiento/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/flujo-evaluacion/simular-escalamiento`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.4.3 Directorio: `src/app/api/admin/cambios/flujo-evaluacion/simular-etapas/`
* **Ruta Relativa**: `src/app/api/admin/cambios/flujo-evaluacion/simular-etapas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `simular-etapas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.4.3.1 Archivo: `src/app/api/admin/cambios/flujo-evaluacion/simular-etapas/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/flujo-evaluacion/simular-etapas/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/flujo-evaluacion/simular-etapas`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.4.4 Directorio: `src/app/api/admin/cambios/flujo-evaluacion/simular-quorum/`
* **Ruta Relativa**: `src/app/api/admin/cambios/flujo-evaluacion/simular-quorum/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `simular-quorum`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.4.4.1 Archivo: `src/app/api/admin/cambios/flujo-evaluacion/simular-quorum/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/flujo-evaluacion/simular-quorum/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/flujo-evaluacion/simular-quorum`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.4.5 Directorio: `src/app/api/admin/cambios/flujo-evaluacion/validar-flujo/`
* **Ruta Relativa**: `src/app/api/admin/cambios/flujo-evaluacion/validar-flujo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `validar-flujo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.4.5.1 Archivo: `src/app/api/admin/cambios/flujo-evaluacion/validar-flujo/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/flujo-evaluacion/validar-flujo/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/flujo-evaluacion/validar-flujo`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.5 Directorio: `src/app/api/admin/cambios/formulario/`
* **Ruta Relativa**: `src/app/api/admin/cambios/formulario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `formulario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.3.5.1 Directorio: `src/app/api/admin/cambios/formulario/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/cambios/formulario/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.5.1.1 Archivo: `src/app/api/admin/cambios/formulario/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/formulario/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/formulario/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.6 Directorio: `src/app/api/admin/cambios/matriz-autoridad/`
* **Ruta Relativa**: `src/app/api/admin/cambios/matriz-autoridad/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `matriz-autoridad`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.3.6.1 Directorio: `src/app/api/admin/cambios/matriz-autoridad/simular/`
* **Ruta Relativa**: `src/app/api/admin/cambios/matriz-autoridad/simular/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `simular`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.6.1.1 Archivo: `src/app/api/admin/cambios/matriz-autoridad/simular/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/matriz-autoridad/simular/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/matriz-autoridad/simular`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.7 Directorio: `src/app/api/admin/cambios/modelos-estandar/`
* **Ruta Relativa**: `src/app/api/admin/cambios/modelos-estandar/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `modelos-estandar`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.7.1 Archivo: `src/app/api/admin/cambios/modelos-estandar/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/modelos-estandar/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/modelos-estandar`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.8 Directorio: `src/app/api/admin/cambios/notificaciones-calendario/`
* **Ruta Relativa**: `src/app/api/admin/cambios/notificaciones-calendario/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `notificaciones-calendario`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.3.8.1 Directorio: `src/app/api/admin/cambios/notificaciones-calendario/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/cambios/notificaciones-calendario/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.8.1.1 Archivo: `src/app/api/admin/cambios/notificaciones-calendario/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/notificaciones-calendario/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/notificaciones-calendario/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.8.2 Directorio: `src/app/api/admin/cambios/notificaciones-calendario/congelamiento/`
* **Ruta Relativa**: `src/app/api/admin/cambios/notificaciones-calendario/congelamiento/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `congelamiento`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.3.8.2.1 Directorio: `src/app/api/admin/cambios/notificaciones-calendario/congelamiento/csv/`
* **Ruta Relativa**: `src/app/api/admin/cambios/notificaciones-calendario/congelamiento/csv/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `csv`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.8.2.1.1 Archivo: `src/app/api/admin/cambios/notificaciones-calendario/congelamiento/csv/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/notificaciones-calendario/congelamiento/csv/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/notificaciones-calendario/congelamiento/csv`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.8.3 Directorio: `src/app/api/admin/cambios/notificaciones-calendario/feriados/`
* **Ruta Relativa**: `src/app/api/admin/cambios/notificaciones-calendario/feriados/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `feriados`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.3.8.3.1 Directorio: `src/app/api/admin/cambios/notificaciones-calendario/feriados/csv/`
* **Ruta Relativa**: `src/app/api/admin/cambios/notificaciones-calendario/feriados/csv/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `csv`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.8.3.1.1 Archivo: `src/app/api/admin/cambios/notificaciones-calendario/feriados/csv/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/notificaciones-calendario/feriados/csv/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/notificaciones-calendario/feriados/csv`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.8.4 Directorio: `src/app/api/admin/cambios/notificaciones-calendario/simular-conflictos/`
* **Ruta Relativa**: `src/app/api/admin/cambios/notificaciones-calendario/simular-conflictos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `simular-conflictos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.8.4.1 Archivo: `src/app/api/admin/cambios/notificaciones-calendario/simular-conflictos/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/notificaciones-calendario/simular-conflictos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/notificaciones-calendario/simular-conflictos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.9 Directorio: `src/app/api/admin/cambios/plantillas/`
* **Ruta Relativa**: `src/app/api/admin/cambios/plantillas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `plantillas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.9.1 Archivo: `src/app/api/admin/cambios/plantillas/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/plantillas/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/plantillas`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.10 Directorio: `src/app/api/admin/cambios/reglas-clasificacion/`
* **Ruta Relativa**: `src/app/api/admin/cambios/reglas-clasificacion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `reglas-clasificacion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.3.10.1 Directorio: `src/app/api/admin/cambios/reglas-clasificacion/simular/`
* **Ruta Relativa**: `src/app/api/admin/cambios/reglas-clasificacion/simular/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `simular`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.10.1.1 Archivo: `src/app/api/admin/cambios/reglas-clasificacion/simular/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/reglas-clasificacion/simular/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/reglas-clasificacion/simular`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.3.11 Directorio: `src/app/api/admin/cambios/tipos-requisitos/`
* **Ruta Relativa**: `src/app/api/admin/cambios/tipos-requisitos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tipos-requisitos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.3.11.1 Directorio: `src/app/api/admin/cambios/tipos-requisitos/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/cambios/tipos-requisitos/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.3.11.1.1 Archivo: `src/app/api/admin/cambios/tipos-requisitos/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cambios/tipos-requisitos/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cambios/tipos-requisitos/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.4 Directorio: `src/app/api/admin/categorias/`
* **Ruta Relativa**: `src/app/api/admin/categorias/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `categorias`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.4.1 Directorio: `src/app/api/admin/categorias/[id]/`
* **Ruta Relativa**: `src/app/api/admin/categorias/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.4.1.1 Archivo: `src/app/api/admin/categorias/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/categorias/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/categorias/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.2.4.2 Archivo: `src/app/api/admin/categorias/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/categorias/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/categorias`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.5 Directorio: `src/app/api/admin/cmdb/`
* **Ruta Relativa**: `src/app/api/admin/cmdb/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cmdb`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.5.1 Directorio: `src/app/api/admin/cmdb/tipos/`
* **Ruta Relativa**: `src/app/api/admin/cmdb/tipos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tipos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.5.1.1 Archivo: `src/app/api/admin/cmdb/tipos/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/cmdb/tipos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/cmdb/tipos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.6 Directorio: `src/app/api/admin/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.6.1 Archivo: `src/app/api/admin/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.7 Directorio: `src/app/api/admin/conocimiento/`
* **Ruta Relativa**: `src/app/api/admin/conocimiento/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `conocimiento`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.7.1 Directorio: `src/app/api/admin/conocimiento/[id]/`
* **Ruta Relativa**: `src/app/api/admin/conocimiento/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.7.1.1 Archivo: `src/app/api/admin/conocimiento/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/conocimiento/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/conocimiento/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.7.2 Directorio: `src/app/api/admin/conocimiento/categorias/`
* **Ruta Relativa**: `src/app/api/admin/conocimiento/categorias/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `categorias`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.7.2.1 Archivo: `src/app/api/admin/conocimiento/categorias/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/conocimiento/categorias/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/conocimiento/categorias`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.7.3 Directorio: `src/app/api/admin/conocimiento/politicas/`
* **Ruta Relativa**: `src/app/api/admin/conocimiento/politicas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `politicas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.7.3.1 Archivo: `src/app/api/admin/conocimiento/politicas/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/conocimiento/politicas/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/conocimiento/politicas`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.2.7.4 Archivo: `src/app/api/admin/conocimiento/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/conocimiento/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/conocimiento`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.8 Directorio: `src/app/api/admin/logs/`
* **Ruta Relativa**: `src/app/api/admin/logs/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `logs`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.8.1 Archivo: `src/app/api/admin/logs/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/logs/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/logs`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.9 Directorio: `src/app/api/admin/mantenimiento-datos/`
* **Ruta Relativa**: `src/app/api/admin/mantenimiento-datos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mantenimiento-datos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.9.1 Archivo: `src/app/api/admin/mantenimiento-datos/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/mantenimiento-datos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/mantenimiento-datos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.10 Directorio: `src/app/api/admin/notificaciones/`
* **Ruta Relativa**: `src/app/api/admin/notificaciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `notificaciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.10.1 Directorio: `src/app/api/admin/notificaciones/reglas/`
* **Ruta Relativa**: `src/app/api/admin/notificaciones/reglas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `reglas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.10.1.1 Archivo: `src/app/api/admin/notificaciones/reglas/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/notificaciones/reglas/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/notificaciones/reglas`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11 Directorio: `src/app/api/admin/problemas/`
* **Ruta Relativa**: `src/app/api/admin/problemas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `problemas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.11.1 Directorio: `src/app/api/admin/problemas/campos-personalizados/`
* **Ruta Relativa**: `src/app/api/admin/problemas/campos-personalizados/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `campos-personalizados`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.1.1 Archivo: `src/app/api/admin/problemas/campos-personalizados/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/campos-personalizados/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/campos-personalizados`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.2 Directorio: `src/app/api/admin/problemas/catalogos/`
* **Ruta Relativa**: `src/app/api/admin/problemas/catalogos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `catalogos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.2.1 Archivo: `src/app/api/admin/problemas/catalogos/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/catalogos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/catalogos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.3 Directorio: `src/app/api/admin/problemas/configuracion/`
* **Ruta Relativa**: `src/app/api/admin/problemas/configuracion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `configuracion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.3.1 Archivo: `src/app/api/admin/problemas/configuracion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/configuracion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/configuracion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.4 Directorio: `src/app/api/admin/problemas/flujo/`
* **Ruta Relativa**: `src/app/api/admin/problemas/flujo/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `flujo`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.11.4.1 Directorio: `src/app/api/admin/problemas/flujo/asignacion/`
* **Ruta Relativa**: `src/app/api/admin/problemas/flujo/asignacion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `asignacion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.4.1.1 Archivo: `src/app/api/admin/problemas/flujo/asignacion/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/flujo/asignacion/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/flujo/asignacion`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.4.2 Directorio: `src/app/api/admin/problemas/flujo/escalamiento/`
* **Ruta Relativa**: `src/app/api/admin/problemas/flujo/escalamiento/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `escalamiento`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.4.2.1 Archivo: `src/app/api/admin/problemas/flujo/escalamiento/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/flujo/escalamiento/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/flujo/escalamiento`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.4.3 Directorio: `src/app/api/admin/problemas/flujo/estados/`
* **Ruta Relativa**: `src/app/api/admin/problemas/flujo/estados/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `estados`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.4.3.1 Archivo: `src/app/api/admin/problemas/flujo/estados/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/flujo/estados/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/flujo/estados`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.4.4 Directorio: `src/app/api/admin/problemas/flujo/mayores/`
* **Ruta Relativa**: `src/app/api/admin/problemas/flujo/mayores/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mayores`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.4.4.1 Archivo: `src/app/api/admin/problemas/flujo/mayores/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/flujo/mayores/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/flujo/mayores`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.4.5 Directorio: `src/app/api/admin/problemas/flujo/objetivos/`
* **Ruta Relativa**: `src/app/api/admin/problemas/flujo/objetivos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `objetivos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.4.5.1 Archivo: `src/app/api/admin/problemas/flujo/objetivos/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/flujo/objetivos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/flujo/objetivos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.4.6 Directorio: `src/app/api/admin/problemas/flujo/reapertura/`
* **Ruta Relativa**: `src/app/api/admin/problemas/flujo/reapertura/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `reapertura`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.4.6.1 Archivo: `src/app/api/admin/problemas/flujo/reapertura/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/flujo/reapertura/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/flujo/reapertura`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.2.11.4.7 Archivo: `src/app/api/admin/problemas/flujo/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/flujo/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/flujo`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.4.8 Directorio: `src/app/api/admin/problemas/flujo/tareas/`
* **Ruta Relativa**: `src/app/api/admin/problemas/flujo/tareas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tareas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.4.8.1 Archivo: `src/app/api/admin/problemas/flujo/tareas/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/flujo/tareas/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/flujo/tareas`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.4.9 Directorio: `src/app/api/admin/problemas/flujo/transiciones/`
* **Ruta Relativa**: `src/app/api/admin/problemas/flujo/transiciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `transiciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.4.9.1 Archivo: `src/app/api/admin/problemas/flujo/transiciones/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/flujo/transiciones/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/flujo/transiciones`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.5 Directorio: `src/app/api/admin/problemas/matriz-prioridad/`
* **Ruta Relativa**: `src/app/api/admin/problemas/matriz-prioridad/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `matriz-prioridad`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.5.1 Archivo: `src/app/api/admin/problemas/matriz-prioridad/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/matriz-prioridad/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/matriz-prioridad`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.6 Directorio: `src/app/api/admin/problemas/plantillas/`
* **Ruta Relativa**: `src/app/api/admin/problemas/plantillas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `plantillas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.6.1 Archivo: `src/app/api/admin/problemas/plantillas/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/plantillas/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/plantillas`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.7 Directorio: `src/app/api/admin/problemas/relaciones/`
* **Ruta Relativa**: `src/app/api/admin/problemas/relaciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `relaciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.11.7.1 Directorio: `src/app/api/admin/problemas/relaciones/kedb/`
* **Ruta Relativa**: `src/app/api/admin/problemas/relaciones/kedb/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `kedb`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.7.1.1 Archivo: `src/app/api/admin/problemas/relaciones/kedb/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/relaciones/kedb/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/relaciones/kedb`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.2.11.7.2 Archivo: `src/app/api/admin/problemas/relaciones/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/relaciones/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/relaciones`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.11.7.3 Directorio: `src/app/api/admin/problemas/relaciones/umbral/`
* **Ruta Relativa**: `src/app/api/admin/problemas/relaciones/umbral/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `umbral`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.11.7.3.1 Archivo: `src/app/api/admin/problemas/relaciones/umbral/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/problemas/relaciones/umbral/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/problemas/relaciones/umbral`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.12 Directorio: `src/app/api/admin/reportes-disenador/`
* **Ruta Relativa**: `src/app/api/admin/reportes-disenador/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `reportes-disenador`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.12.1 Archivo: `src/app/api/admin/reportes-disenador/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/reportes-disenador/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/reportes-disenador`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.13 Directorio: `src/app/api/admin/rfc-config/`
* **Ruta Relativa**: `src/app/api/admin/rfc-config/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `rfc-config`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.13.1 Archivo: `src/app/api/admin/rfc-config/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/rfc-config/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/rfc-config`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.14 Directorio: `src/app/api/admin/sla/`
* **Ruta Relativa**: `src/app/api/admin/sla/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `sla`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.14.1 Directorio: `src/app/api/admin/sla/matriz/`
* **Ruta Relativa**: `src/app/api/admin/sla/matriz/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `matriz`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.14.1.1 Archivo: `src/app/api/admin/sla/matriz/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/sla/matriz/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/sla/matriz`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.2.14.2 Archivo: `src/app/api/admin/sla/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/sla/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/sla`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.2.15 Directorio: `src/app/api/admin/tecnicos/`
* **Ruta Relativa**: `src/app/api/admin/tecnicos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tecnicos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.2.15.1 Directorio: `src/app/api/admin/tecnicos/ausencias/`
* **Ruta Relativa**: `src/app/api/admin/tecnicos/ausencias/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `ausencias`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.2.15.1.1 Archivo: `src/app/api/admin/tecnicos/ausencias/route.ts`
* **Ruta de Archivo**: `src/app/api/admin/tecnicos/ausencias/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/admin/tecnicos/ausencias`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.3 Directorio: `src/app/api/area/`
* **Ruta Relativa**: `src/app/api/area/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `area`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.3.1 Directorio: `src/app/api/area/colaboradores/`
* **Ruta Relativa**: `src/app/api/area/colaboradores/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `colaboradores`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.3.1.1 Archivo: `src/app/api/area/colaboradores/route.ts`
* **Ruta de Archivo**: `src/app/api/area/colaboradores/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/area/colaboradores`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.4 Directorio: `src/app/api/auth/`
* **Ruta Relativa**: `src/app/api/auth/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Controlador de seguridad, sesion y ciclo de vida de credenciales.
* **Que hace**: Gestiona el inicio de sesion, cierre de sesion, verificacion de captcha, conmutacion de perfil activo y recuperacion OTP.
* **Que contiene**: Endpoints para /login, /logout, /captcha, /cambiar-perfil, /seleccionar-perfil y /recuperar-clave.

### 1.1.2.4.1 Directorio: `src/app/api/auth/cambiar-perfil/`
* **Ruta Relativa**: `src/app/api/auth/cambiar-perfil/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cambiar-perfil`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.4.1.1 Archivo: `src/app/api/auth/cambiar-perfil/route.ts`
* **Ruta de Archivo**: `src/app/api/auth/cambiar-perfil/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/auth/cambiar-perfil`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.4.2 Directorio: `src/app/api/auth/captcha/`
* **Ruta Relativa**: `src/app/api/auth/captcha/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `captcha`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.4.2.1 Archivo: `src/app/api/auth/captcha/route.ts`
* **Ruta de Archivo**: `src/app/api/auth/captcha/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/auth/captcha`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.4.3 Directorio: `src/app/api/auth/login/`
* **Ruta Relativa**: `src/app/api/auth/login/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `login`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.4.3.1 Archivo: `src/app/api/auth/login/route.ts`
* **Ruta de Archivo**: `src/app/api/auth/login/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/auth/login`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.4.4 Directorio: `src/app/api/auth/logout/`
* **Ruta Relativa**: `src/app/api/auth/logout/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `logout`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.4.4.1 Archivo: `src/app/api/auth/logout/route.ts`
* **Ruta de Archivo**: `src/app/api/auth/logout/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/auth/logout`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.4.5 Directorio: `src/app/api/auth/recuperar-clave/`
* **Ruta Relativa**: `src/app/api/auth/recuperar-clave/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `recuperar-clave`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.4.5.1 Directorio: `src/app/api/auth/recuperar-clave/cambiar/`
* **Ruta Relativa**: `src/app/api/auth/recuperar-clave/cambiar/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cambiar`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.4.5.1.1 Archivo: `src/app/api/auth/recuperar-clave/cambiar/route.ts`
* **Ruta de Archivo**: `src/app/api/auth/recuperar-clave/cambiar/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/auth/recuperar-clave/cambiar`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.4.5.2 Directorio: `src/app/api/auth/recuperar-clave/solicitar/`
* **Ruta Relativa**: `src/app/api/auth/recuperar-clave/solicitar/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `solicitar`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.4.5.2.1 Archivo: `src/app/api/auth/recuperar-clave/solicitar/route.ts`
* **Ruta de Archivo**: `src/app/api/auth/recuperar-clave/solicitar/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/auth/recuperar-clave/solicitar`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.4.5.3 Directorio: `src/app/api/auth/recuperar-clave/verificar/`
* **Ruta Relativa**: `src/app/api/auth/recuperar-clave/verificar/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `verificar`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.4.5.3.1 Archivo: `src/app/api/auth/recuperar-clave/verificar/route.ts`
* **Ruta de Archivo**: `src/app/api/auth/recuperar-clave/verificar/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/auth/recuperar-clave/verificar`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.4.6 Directorio: `src/app/api/auth/seleccionar-perfil/`
* **Ruta Relativa**: `src/app/api/auth/seleccionar-perfil/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `seleccionar-perfil`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.4.6.1 Archivo: `src/app/api/auth/seleccionar-perfil/route.ts`
* **Ruta de Archivo**: `src/app/api/auth/seleccionar-perfil/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/auth/seleccionar-perfil`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.5 Directorio: `src/app/api/cambios/`
* **Ruta Relativa**: `src/app/api/cambios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cambios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.5.1 Directorio: `src/app/api/cambios/[id]/`
* **Ruta Relativa**: `src/app/api/cambios/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.5.1.1 Archivo: `src/app/api/cambios/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/cambios/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/cambios/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.5.2 Archivo: `src/app/api/cambios/route.ts`
* **Ruta de Archivo**: `src/app/api/cambios/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/cambios`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.6 Directorio: `src/app/api/conocimiento/`
* **Ruta Relativa**: `src/app/api/conocimiento/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `conocimiento`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.6.1 Directorio: `src/app/api/conocimiento/[id]/`
* **Ruta Relativa**: `src/app/api/conocimiento/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.6.1.1 Archivo: `src/app/api/conocimiento/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/conocimiento/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/conocimiento/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.6.2 Archivo: `src/app/api/conocimiento/route.ts`
* **Ruta de Archivo**: `src/app/api/conocimiento/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/conocimiento`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.7 Directorio: `src/app/api/departamentos-empresa/`
* **Ruta Relativa**: `src/app/api/departamentos-empresa/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `departamentos-empresa`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.7.1 Directorio: `src/app/api/departamentos-empresa/[id]/`
* **Ruta Relativa**: `src/app/api/departamentos-empresa/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.7.1.1 Archivo: `src/app/api/departamentos-empresa/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/departamentos-empresa/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/departamentos-empresa/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.7.2 Archivo: `src/app/api/departamentos-empresa/route.ts`
* **Ruta de Archivo**: `src/app/api/departamentos-empresa/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/departamentos-empresa`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.8 Directorio: `src/app/api/departamentos-ti/`
* **Ruta Relativa**: `src/app/api/departamentos-ti/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `departamentos-ti`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.8.1 Directorio: `src/app/api/departamentos-ti/[id]/`
* **Ruta Relativa**: `src/app/api/departamentos-ti/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.8.1.1 Archivo: `src/app/api/departamentos-ti/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/departamentos-ti/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/departamentos-ti/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.8.2 Archivo: `src/app/api/departamentos-ti/route.ts`
* **Ruta de Archivo**: `src/app/api/departamentos-ti/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/departamentos-ti`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.9 Directorio: `src/app/api/incidentes/`
* **Ruta Relativa**: `src/app/api/incidentes/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `incidentes`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.9.1 Directorio: `src/app/api/incidentes/[id]/`
* **Ruta Relativa**: `src/app/api/incidentes/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.9.1.1 Directorio: `src/app/api/incidentes/[id]/comentarios/`
* **Ruta Relativa**: `src/app/api/incidentes/[id]/comentarios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `comentarios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.9.1.1.1 Archivo: `src/app/api/incidentes/[id]/comentarios/route.ts`
* **Ruta de Archivo**: `src/app/api/incidentes/[id]/comentarios/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/incidentes/[id]/comentarios`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.9.1.2 Archivo: `src/app/api/incidentes/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/incidentes/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/incidentes/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.9.2 Archivo: `src/app/api/incidentes/route.ts`
* **Ruta de Archivo**: `src/app/api/incidentes/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/incidentes`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.10 Directorio: `src/app/api/menu/`
* **Ruta Relativa**: `src/app/api/menu/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `menu`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.10.1 Directorio: `src/app/api/menu/admin/`
* **Ruta Relativa**: `src/app/api/menu/admin/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `admin`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.10.1.1 Directorio: `src/app/api/menu/admin/[id]/`
* **Ruta Relativa**: `src/app/api/menu/admin/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.10.1.1.1 Archivo: `src/app/api/menu/admin/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/menu/admin/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/menu/admin/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.10.1.2 Archivo: `src/app/api/menu/admin/route.ts`
* **Ruta de Archivo**: `src/app/api/menu/admin/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/menu/admin`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.10.2 Archivo: `src/app/api/menu/route.ts`
* **Ruta de Archivo**: `src/app/api/menu/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/menu`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.11 Directorio: `src/app/api/mi-cuenta/`
* **Ruta Relativa**: `src/app/api/mi-cuenta/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mi-cuenta`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.11.1 Archivo: `src/app/api/mi-cuenta/route.ts`
* **Ruta de Archivo**: `src/app/api/mi-cuenta/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/mi-cuenta`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.12 Directorio: `src/app/api/operacion/`
* **Ruta Relativa**: `src/app/api/operacion/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `operacion`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.12.1 Directorio: `src/app/api/operacion/eventos/`
* **Ruta Relativa**: `src/app/api/operacion/eventos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `eventos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.12.1.1 Directorio: `src/app/api/operacion/eventos/[id]/`
* **Ruta Relativa**: `src/app/api/operacion/eventos/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.12.1.1.1 Archivo: `src/app/api/operacion/eventos/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/operacion/eventos/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/operacion/eventos/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.12.1.2 Archivo: `src/app/api/operacion/eventos/route.ts`
* **Ruta de Archivo**: `src/app/api/operacion/eventos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/operacion/eventos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.12.2 Directorio: `src/app/api/operacion/resiliencia/`
* **Ruta Relativa**: `src/app/api/operacion/resiliencia/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `resiliencia`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.12.2.1 Archivo: `src/app/api/operacion/resiliencia/route.ts`
* **Ruta de Archivo**: `src/app/api/operacion/resiliencia/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/operacion/resiliencia`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.13 Directorio: `src/app/api/perfiles/`
* **Ruta Relativa**: `src/app/api/perfiles/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `perfiles`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.13.1 Directorio: `src/app/api/perfiles/[id]/`
* **Ruta Relativa**: `src/app/api/perfiles/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.13.1.1 Archivo: `src/app/api/perfiles/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/perfiles/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/perfiles/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.13.2 Archivo: `src/app/api/perfiles/route.ts`
* **Ruta de Archivo**: `src/app/api/perfiles/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/perfiles`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.14 Directorio: `src/app/api/problemas/`
* **Ruta Relativa**: `src/app/api/problemas/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `problemas`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.14.1 Directorio: `src/app/api/problemas/[id]/`
* **Ruta Relativa**: `src/app/api/problemas/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.14.1.1 Archivo: `src/app/api/problemas/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/problemas/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/problemas/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.14.2 Archivo: `src/app/api/problemas/route.ts`
* **Ruta de Archivo**: `src/app/api/problemas/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/problemas`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.15 Directorio: `src/app/api/proveedores/`
* **Ruta Relativa**: `src/app/api/proveedores/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `proveedores`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.15.1 Directorio: `src/app/api/proveedores/[id]/`
* **Ruta Relativa**: `src/app/api/proveedores/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.15.1.1 Archivo: `src/app/api/proveedores/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/proveedores/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/proveedores/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.15.2 Archivo: `src/app/api/proveedores/route.ts`
* **Ruta de Archivo**: `src/app/api/proveedores/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/proveedores`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.16 Directorio: `src/app/api/reportes/`
* **Ruta Relativa**: `src/app/api/reportes/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `reportes`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.16.1 Directorio: `src/app/api/reportes/indicadores/`
* **Ruta Relativa**: `src/app/api/reportes/indicadores/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `indicadores`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.16.1.1 Archivo: `src/app/api/reportes/indicadores/route.ts`
* **Ruta de Archivo**: `src/app/api/reportes/indicadores/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/reportes/indicadores`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.17 Directorio: `src/app/api/servicios/`
* **Ruta Relativa**: `src/app/api/servicios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `servicios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.17.1 Directorio: `src/app/api/servicios/[id]/`
* **Ruta Relativa**: `src/app/api/servicios/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.17.1.1 Archivo: `src/app/api/servicios/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/servicios/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/servicios/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.17.1.2 Directorio: `src/app/api/servicios/[id]/workflow/`
* **Ruta Relativa**: `src/app/api/servicios/[id]/workflow/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `workflow`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.17.1.2.1 Archivo: `src/app/api/servicios/[id]/workflow/route.ts`
* **Ruta de Archivo**: `src/app/api/servicios/[id]/workflow/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/servicios/[id]/workflow`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.17.2 Archivo: `src/app/api/servicios/route.ts`
* **Ruta de Archivo**: `src/app/api/servicios/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/servicios`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.18 Directorio: `src/app/api/solicitudes/`
* **Ruta Relativa**: `src/app/api/solicitudes/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `solicitudes`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.18.1 Directorio: `src/app/api/solicitudes/[id]/`
* **Ruta Relativa**: `src/app/api/solicitudes/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.18.1.1 Directorio: `src/app/api/solicitudes/[id]/comentarios/`
* **Ruta Relativa**: `src/app/api/solicitudes/[id]/comentarios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `comentarios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.18.1.1.1 Archivo: `src/app/api/solicitudes/[id]/comentarios/route.ts`
* **Ruta de Archivo**: `src/app/api/solicitudes/[id]/comentarios/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/solicitudes/[id]/comentarios`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.18.1.2 Archivo: `src/app/api/solicitudes/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/solicitudes/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/solicitudes/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.18.2 Archivo: `src/app/api/solicitudes/route.ts`
* **Ruta de Archivo**: `src/app/api/solicitudes/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/solicitudes`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.19 Directorio: `src/app/api/tecnico/`
* **Ruta Relativa**: `src/app/api/tecnico/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tecnico`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.19.1 Directorio: `src/app/api/tecnico/cambios/`
* **Ruta Relativa**: `src/app/api/tecnico/cambios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `cambios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.19.1.1 Directorio: `src/app/api/tecnico/cambios/enterado/`
* **Ruta Relativa**: `src/app/api/tecnico/cambios/enterado/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `enterado`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.19.1.1.1 Archivo: `src/app/api/tecnico/cambios/enterado/route.ts`
* **Ruta de Archivo**: `src/app/api/tecnico/cambios/enterado/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tecnico/cambios/enterado`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.19.2 Directorio: `src/app/api/tecnico/contadores/`
* **Ruta Relativa**: `src/app/api/tecnico/contadores/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `contadores`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.19.2.1 Archivo: `src/app/api/tecnico/contadores/route.ts`
* **Ruta de Archivo**: `src/app/api/tecnico/contadores/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tecnico/contadores`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.19.3 Directorio: `src/app/api/tecnico/mesa/`
* **Ruta Relativa**: `src/app/api/tecnico/mesa/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `mesa`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.19.3.1 Directorio: `src/app/api/tecnico/mesa/tomar/`
* **Ruta Relativa**: `src/app/api/tecnico/mesa/tomar/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tomar`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.19.3.1.1 Archivo: `src/app/api/tecnico/mesa/tomar/route.ts`
* **Ruta de Archivo**: `src/app/api/tecnico/mesa/tomar/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tecnico/mesa/tomar`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.19.4 Directorio: `src/app/api/tecnico/recordatorios/`
* **Ruta Relativa**: `src/app/api/tecnico/recordatorios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `recordatorios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.19.4.1 Archivo: `src/app/api/tecnico/recordatorios/route.ts`
* **Ruta de Archivo**: `src/app/api/tecnico/recordatorios/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tecnico/recordatorios`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.19.5 Directorio: `src/app/api/tecnico/usuarios/`
* **Ruta Relativa**: `src/app/api/tecnico/usuarios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `usuarios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.19.5.1 Archivo: `src/app/api/tecnico/usuarios/route.ts`
* **Ruta de Archivo**: `src/app/api/tecnico/usuarios/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tecnico/usuarios`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.20 Directorio: `src/app/api/tecnicos/`
* **Ruta Relativa**: `src/app/api/tecnicos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tecnicos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.20.1 Directorio: `src/app/api/tecnicos/[id]/`
* **Ruta Relativa**: `src/app/api/tecnicos/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.20.1.1 Archivo: `src/app/api/tecnicos/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/tecnicos/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tecnicos/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.20.2 Archivo: `src/app/api/tecnicos/route.ts`
* **Ruta de Archivo**: `src/app/api/tecnicos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tecnicos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.21 Directorio: `src/app/api/tickets/`
* **Ruta Relativa**: `src/app/api/tickets/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Controlador principal de la operacion de tickets del Service Desk.
* **Que hace**: Crea tickets de incidentes y solicitudes, calcula SLAs, asigna tecnicos y recupera historiales y catalogos.
* **Que contiene**: Ruta principal `route.ts`, catalogos de apoyo `catalogos/route.ts`, detalle `[id]/route.ts` y comentarios `[id]/comentarios/route.ts`.

### 1.1.2.21.1 Directorio: `src/app/api/tickets/[id]/`
* **Ruta Relativa**: `src/app/api/tickets/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.21.1.1 Directorio: `src/app/api/tickets/[id]/comentarios/`
* **Ruta Relativa**: `src/app/api/tickets/[id]/comentarios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `comentarios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.21.1.1.1 Archivo: `src/app/api/tickets/[id]/comentarios/route.ts`
* **Ruta de Archivo**: `src/app/api/tickets/[id]/comentarios/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tickets/[id]/comentarios`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.21.1.2 Archivo: `src/app/api/tickets/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/tickets/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tickets/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.21.2 Directorio: `src/app/api/tickets/catalogos/`
* **Ruta Relativa**: `src/app/api/tickets/catalogos/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `catalogos`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.21.2.1 Archivo: `src/app/api/tickets/catalogos/route.ts`
* **Ruta de Archivo**: `src/app/api/tickets/catalogos/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tickets/catalogos`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.21.3 Archivo: `src/app/api/tickets/route.ts`
* **Ruta de Archivo**: `src/app/api/tickets/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/tickets`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.22 Directorio: `src/app/api/usuarios/`
* **Ruta Relativa**: `src/app/api/usuarios/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `usuarios`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.22.1 Directorio: `src/app/api/usuarios/[id]/`
* **Ruta Relativa**: `src/app/api/usuarios/[id]/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `[id]`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

### 1.1.2.22.1.1 Directorio: `src/app/api/usuarios/[id]/desbloquear/`
* **Ruta Relativa**: `src/app/api/usuarios/[id]/desbloquear/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `desbloquear`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.22.1.1.1 Archivo: `src/app/api/usuarios/[id]/desbloquear/route.ts`
* **Ruta de Archivo**: `src/app/api/usuarios/[id]/desbloquear/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/usuarios/[id]/desbloquear`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.22.1.2 Archivo: `src/app/api/usuarios/[id]/route.ts`
* **Ruta de Archivo**: `src/app/api/usuarios/[id]/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/usuarios/[id]`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

### 1.1.2.22.2 Directorio: `src/app/api/usuarios/enviar-credenciales/`
* **Ruta Relativa**: `src/app/api/usuarios/enviar-credenciales/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `enviar-credenciales`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.2.22.2.1 Archivo: `src/app/api/usuarios/enviar-credenciales/route.ts`
* **Ruta de Archivo**: `src/app/api/usuarios/enviar-credenciales/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/usuarios/enviar-credenciales`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.2.22.3 Archivo: `src/app/api/usuarios/route.ts`
* **Ruta de Archivo**: `src/app/api/usuarios/route.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Controlador de servicios RESTful (Route Handler) para el endpoint canonico `/api/usuarios`.
* **Que hace**: Recibe peticiones HTTP (GET, POST, PATCH, PUT o DELETE), valida la cookie de sesion JWT, evalua el perfil activo, ejecuta consultas SQL parametrizadas en PostgreSQL y responde con JSON estandarizado.
* **Que contiene**: Funciones asincronas exportadas segun los verbos HTTP soportados, integradas con `src/lib/db.ts` y `src/lib/validaciones.ts`.

#### 1.1.3 Archivo: `src/app/globals.css`
* **Ruta de Archivo**: `src/app/globals.css`
* **Tipo de Archivo**: Archivo de Codigo (`.css`)
* **Que es**: Hoja de estilos CSS global de la aplicacion.
* **Que hace**: Define las variables de color corporativas, tipografias, estilos de botones, campos de entrada, tarjetas y tablas.
* **Que contiene**: Mas de 2,000 lineas de reglas CSS puras estructuradas sin dependencias pesadas de frameworks externos.

#### 1.1.4 Archivo: `src/app/layout.tsx`
* **Ruta de Archivo**: `src/app/layout.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Layout raiz HTML de Next.js para toda la aplicacion.
* **Que hace**: Establece la estructura `<html>` y `<body>`, define el favicon institucional y carga `globals.css`.
* **Que contiene**: Componente `RootLayout` que envuelve a todas las paginas hijas.

### 1.1.5 Directorio: `src/app/login/`
* **Ruta Relativa**: `src/app/login/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `login`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.1.5.1 Archivo: `src/app/login/page.tsx`
* **Ruta de Archivo**: `src/app/login/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Pantalla publica interactiva de inicio de sesion y recuperacion de acceso.
* **Que hace**: Permite ingresar credenciales corporativas, resolver el captcha matematico, solicitar restablecimiento de contrasena por correo OTP y seleccionar perfil inicial.
* **Que contiene**: Formularios reactivos con validaciones dinamicas, manejo de cookies y transiciones visuales seguras.

#### 1.1.6 Archivo: `src/app/page.tsx`
* **Ruta de Archivo**: `src/app/page.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Pagina raiz de bienvenida y redireccion inicial del sistema (`/`).
* **Que hace**: Verifica si existe una sesion activa. Si existe, redirige al usuario a `/dashboard`; si no, lo envia a `/login`.
* **Que contiene**: Redireccion automatica del servidor mediante `redirect()` de `next/navigation`.

### 1.2 Directorio: `src/components/`
* **Ruta Relativa**: `src/components/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Capa de presentacion y componentes reutilizables de React.
* **Que hace**: Encapsula la logica visual, maquetacion de tablas, modales, alertas y barras de navegacion.
* **Que contiene**: Componentes principales (Menu.tsx, TablaTickets.tsx, SelectorPerfilActivo.tsx), y carpetas itsm/, tecnico/, ticket-detail/ y ui/.

#### 1.2.1 Archivo: `src/components/BotonCerrarSesion.tsx`
* **Ruta de Archivo**: `src/components/BotonCerrarSesion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/BotonCerrarSesion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.2 Archivo: `src/components/EnConstruccion.tsx`
* **Ruta de Archivo**: `src/components/EnConstruccion.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/EnConstruccion.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.3 Archivo: `src/components/Menu.tsx`
* **Ruta de Archivo**: `src/components/Menu.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Barra lateral fija de navegacion jerarquica del sistema.
* **Que hace**: Consume `/api/menu` para pintar dinamicamente las opciones que el perfil activo tiene autorizadas segun la base de datos.
* **Que contiene**: Componente recursivo con soporte para submenus colapsables de hasta 3 niveles, contadores de notificaciones y resaltado de ruta activa.

#### 1.2.4 Archivo: `src/components/ModalDetalleTicket.tsx`
* **Ruta de Archivo**: `src/components/ModalDetalleTicket.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ModalDetalleTicket.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.5 Archivo: `src/components/SelectorPerfilActivo.tsx`
* **Ruta de Archivo**: `src/components/SelectorPerfilActivo.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente interactivo ubicado en la barra superior para conmutacion de roles en caliente.
* **Que hace**: Permite a los usuarios con multiples perfiles alternar su rol de trabajo instantaneamente invocando `/api/auth/cambiar-perfil` sin cerrar sesion.
* **Que contiene**: Menu desplegable con deteccion del perfil activo actual y envio de senal de recarga de navegacion.

#### 1.2.6 Archivo: `src/components/TablaTickets.tsx`
* **Ruta de Archivo**: `src/components/TablaTickets.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Grilla interactiva maestra para visualizacion y gestion de tickets.
* **Que hace**: Presenta tickets con badges de prioridad, estado, tiempos restantes de SLA, filtros avanzados por columnas y buscador de texto.
* **Que contiene**: Mecanismo de paginacion, ordenamiento reactivo e integracion con modales de previsualizacion rapida.

### 1.2.7 Directorio: `src/components/itsm/`
* **Ruta Relativa**: `src/components/itsm/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `itsm`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.2.7.1 Archivo: `src/components/itsm/ConfiguracionRfc.tsx`
* **Ruta de Archivo**: `src/components/itsm/ConfiguracionRfc.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/itsm/ConfiguracionRfc.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.7.2 Archivo: `src/components/itsm/EventosWorkspace.tsx`
* **Ruta de Archivo**: `src/components/itsm/EventosWorkspace.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/itsm/EventosWorkspace.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.7.3 Archivo: `src/components/itsm/ProblemasWorkspace.tsx`
* **Ruta de Archivo**: `src/components/itsm/ProblemasWorkspace.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/itsm/ProblemasWorkspace.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.7.4 Archivo: `src/components/itsm/ProveedoresWorkspace.tsx`
* **Ruta de Archivo**: `src/components/itsm/ProveedoresWorkspace.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/itsm/ProveedoresWorkspace.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.7.5 Archivo: `src/components/itsm/ResilienciaWorkspace.tsx`
* **Ruta de Archivo**: `src/components/itsm/ResilienciaWorkspace.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/itsm/ResilienciaWorkspace.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

### 1.2.8 Directorio: `src/components/tecnico/`
* **Ruta Relativa**: `src/components/tecnico/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `tecnico`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.2.8.1 Archivo: `src/components/tecnico/BarraSuperiorTecnico.tsx`
* **Ruta de Archivo**: `src/components/tecnico/BarraSuperiorTecnico.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/tecnico/BarraSuperiorTecnico.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

### 1.2.9 Directorio: `src/components/ticket-detail/`
* **Ruta Relativa**: `src/components/ticket-detail/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Modulo desacoplado para la renderizacion del detalle integral de un ticket.
* **Que hace**: Proyecta interfaces adaptadas a cada rol (Consumidor, Operador, Supervisor, Administrador, Auditor).
* **Que contiene**: Subcarpetas `presentadores/` (vistas completas por perfil), `secciones/` (bloques modulares reutilizables) y `tipos.ts`.

### 1.2.9.1 Directorio: `src/components/ticket-detail/presentadores/`
* **Ruta Relativa**: `src/components/ticket-detail/presentadores/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `presentadores`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.2.9.1.1 Archivo: `src/components/ticket-detail/presentadores/VistaTicketAdministrador.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/presentadores/VistaTicketAdministrador.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/presentadores/VistaTicketAdministrador.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.1.2 Archivo: `src/components/ticket-detail/presentadores/VistaTicketConsumidor.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/presentadores/VistaTicketConsumidor.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/presentadores/VistaTicketConsumidor.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.1.3 Archivo: `src/components/ticket-detail/presentadores/VistaTicketGobernanza.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/presentadores/VistaTicketGobernanza.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/presentadores/VistaTicketGobernanza.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.1.4 Archivo: `src/components/ticket-detail/presentadores/VistaTicketOperador.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/presentadores/VistaTicketOperador.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/presentadores/VistaTicketOperador.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.1.5 Archivo: `src/components/ticket-detail/presentadores/VistaTicketSupervisor.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/presentadores/VistaTicketSupervisor.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/presentadores/VistaTicketSupervisor.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

### 1.2.9.2 Directorio: `src/components/ticket-detail/secciones/`
* **Ruta Relativa**: `src/components/ticket-detail/secciones/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `secciones`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.2.9.2.1 Archivo: `src/components/ticket-detail/secciones/BarraAccionesOperativas.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/secciones/BarraAccionesOperativas.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/secciones/BarraAccionesOperativas.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.2.2 Archivo: `src/components/ticket-detail/secciones/CockpitTemporizadorSla.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/secciones/CockpitTemporizadorSla.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/secciones/CockpitTemporizadorSla.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.2.3 Archivo: `src/components/ticket-detail/secciones/ControlesDespacho.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/secciones/ControlesDespacho.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/secciones/ControlesDespacho.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.2.4 Archivo: `src/components/ticket-detail/secciones/PanelInfraestructuraCi.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/secciones/PanelInfraestructuraCi.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/secciones/PanelInfraestructuraCi.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.2.5 Archivo: `src/components/ticket-detail/secciones/StepperProgresoConsumidor.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/secciones/StepperProgresoConsumidor.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/secciones/StepperProgresoConsumidor.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.2.6 Archivo: `src/components/ticket-detail/secciones/StreamChatPublico.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/secciones/StreamChatPublico.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/secciones/StreamChatPublico.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.2.7 Archivo: `src/components/ticket-detail/secciones/StreamNotasInternas.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/secciones/StreamNotasInternas.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/secciones/StreamNotasInternas.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.2.8 Archivo: `src/components/ticket-detail/secciones/TarjetaAprobacionSod.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/secciones/TarjetaAprobacionSod.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/secciones/TarjetaAprobacionSod.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.2.9 Archivo: `src/components/ticket-detail/secciones/TarjetaCalificacionCsat.tsx`
* **Ruta de Archivo**: `src/components/ticket-detail/secciones/TarjetaCalificacionCsat.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/secciones/TarjetaCalificacionCsat.tsx`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.2.9.3 Archivo: `src/components/ticket-detail/tipos.ts`
* **Ruta de Archivo**: `src/components/ticket-detail/tipos.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/components/ticket-detail/tipos.ts`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

### 1.2.10 Directorio: `src/components/ui/`
* **Ruta Relativa**: `src/components/ui/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Componentes base de interfaz atomica del sistema.
* **Que hace**: Estandariza los estilos visuales de advertencias y controles.
* **Que contiene**: Componente `AlertaCampo.tsx` para mensajes de error accesibles y limpios.

#### 1.2.10.1 Archivo: `src/components/ui/AlertaCampo.tsx`
* **Ruta de Archivo**: `src/components/ui/AlertaCampo.tsx`
* **Tipo de Archivo**: Archivo de Codigo (`.tsx`)
* **Que es**: Componente unificado para senalizacion de errores en formularios.
* **Que hace**: Garantiza la directiva de accesibilidad y diseno formal: suprime mensajes verdes superfluos y proyecta advertencias rojas accesibles con `role="alert"`.
* **Que contiene**: Etiqueta semantica con estilos inline consistentes (`#b91c1c`, fondo `#fef2f2`, borde `#fecaca`).

### 1.3 Directorio: `src/lib/`
* **Ruta Relativa**: `src/lib/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Capa de infraestructura de software, librerias auxiliares y logica de negocio en el servidor.
* **Que hace**: Provee acceso a base de datos, cifrado, envio de correos, algoritmos de SLA y validaciones.
* **Que contiene**: Modulos `db.ts`, `auth.ts`, `validaciones.ts`, `sla.ts`, `email.ts`, `menu.ts`, `security.ts`, `usuarios.ts`, `correo-util.ts` y scripts auxiliares.

#### 1.3.1 Archivo: `src/lib/auth.ts`
* **Ruta de Archivo**: `src/lib/auth.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Servicio criptografico de autenticacion y emision de tokens JWT.
* **Que hace**: Firma y valida tokens JSON Web Tokens, extrae la sesion desde la cookie `sesion_tickets` y compara hashes de claves con bcrypt.
* **Que contiene**: Funciones `crearTokenSesion()`, `verificarTokenSesion()` y constantes de expiracion de cookies seguras.

#### 1.3.2 Archivo: `src/lib/constants.ts`
* **Ruta de Archivo**: `src/lib/constants.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/lib/constants.ts`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.3.3 Archivo: `src/lib/correo-util.ts`
* **Ruta de Archivo**: `src/lib/correo-util.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/lib/correo-util.ts`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.3.4 Archivo: `src/lib/db.ts`
* **Ruta de Archivo**: `src/lib/db.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Modulo central de conexion a base de datos PostgreSQL.
* **Que hace**: Administra el pool de conexiones de `pg` en singleton global (`globalThis.dbPool`) y expone `query<T>()` y `queryRow<T>()`.
* **Que contiene**: Manejo de reconexion automatica, captura de excepciones y deteccion de proyectos pausados en Supabase.

#### 1.3.5 Archivo: `src/lib/email.ts`
* **Ruta de Archivo**: `src/lib/email.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Cliente de mensajeria y notificaciones por correo electronico.
* **Que hace**: Configura el transporte SMTP con Nodemailer para enviar codigos OTP de recuperacion de clave y alertas de tickets.
* **Que contiene**: Plantillas HTML corporativas con diseno responsivo y formateo formal sin emojis.

#### 1.3.6 Archivo: `src/lib/menu.ts`
* **Ruta de Archivo**: `src/lib/menu.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Motor de resolucion y armado del arbol jerarquico de navegacion.
* **Que hace**: Transforma la lista plana de opciones de la base de datos en un arbol anidado ordenado por nivel y perfil activo.
* **Que contiene**: Funciones `construirArbolMenu()` y filtros de seguridad para garantizar que ningun rol vea opciones no autorizadas.

#### 1.3.7 Archivo: `src/lib/mock-tickets.ts`
* **Ruta de Archivo**: `src/lib/mock-tickets.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/lib/mock-tickets.ts`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.3.8 Archivo: `src/lib/page-auth.ts`
* **Ruta de Archivo**: `src/lib/page-auth.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/lib/page-auth.ts`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

### 1.3.9 Directorio: `src/lib/scripts/`
* **Ruta Relativa**: `src/lib/scripts/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Directorio de agrupacion logica: `scripts`.
* **Que hace**: Organiza componentes, paginas o servicios pertenecientes a este modulo funcional.
* **Que contiene**: Subcarpetas y archivos de implementacion correspondientes a este dominio.

#### 1.3.9.1 Archivo: `src/lib/scripts/limpiar_barra_y_busqueda.ts`
* **Ruta de Archivo**: `src/lib/scripts/limpiar_barra_y_busqueda.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/lib/scripts/limpiar_barra_y_busqueda.ts`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.3.9.2 Archivo: `src/lib/scripts/migrar_menu_tecnico.ts`
* **Ruta de Archivo**: `src/lib/scripts/migrar_menu_tecnico.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/lib/scripts/migrar_menu_tecnico.ts`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.3.10 Archivo: `src/lib/security.ts`
* **Ruta de Archivo**: `src/lib/security.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Capa de seguridad defensiva, sanitizacion y mitigacion de ataques.
* **Que hace**: Protege contra ataques de denegacion de servicio, inyecciones de script (XSS) y abuso de credenciales.
* **Que contiene**: Contadores de intentos fallidos, rutinas de bloqueo automatico y utilidades de hashing.

#### 1.3.11 Archivo: `src/lib/sla.ts`
* **Ruta de Archivo**: `src/lib/sla.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Motor de calculo y evaluacion de Acuerdos de Nivel de Servicio (SLA).
* **Que hace**: Calcula fechas limite de primera respuesta y resolucion total segun matriz de prioridad Urgencia vs Impacto y calendarios habiles.
* **Que contiene**: Algoritmos matematicos de conteo de horas y determinacion de tickets en riesgo o vencidos.

#### 1.3.12 Archivo: `src/lib/usuarios.ts`
* **Ruta de Archivo**: `src/lib/usuarios.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Archivo de codigo fuente TypeScript/React ubicado en `src/lib/usuarios.ts`.
* **Que hace**: Forma parte del subsistema correspondiente dentro de la arquitectura de la aplicacion.
* **Que contiene**: Funciones, hooks, tipos o componentes exportados para su consumo en la plataforma.

#### 1.3.13 Archivo: `src/lib/validaciones.ts`
* **Ruta de Archivo**: `src/lib/validaciones.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Biblioteca centralizada de funciones puras de validacion de datos.
* **Que hace**: Valida entradas en cliente y servidor: DNI, RUC, nombres internacionales, correos RFC 5322, codigos, SLAs y adjuntos.
* **Que contiene**: Funciones desacopladas que retornan `{ valido: boolean, mensaje?: string }` sin efectos secundarios.

#### 1.4 Archivo: `src/middleware.ts`
* **Ruta de Archivo**: `src/middleware.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Middleware perimetral de seguridad ejecutado en el Edge de Next.js antes de procesar cualquier ruta.
* **Que hace**: Intercepta todas las solicitudes entrantes, inspecciona la cookie segura `sesion_tickets`, redirige a `/login` si no hay sesion y evita que usuarios sin autenticacion accedan a `/(app)/*`.
* **Que contiene**: Funcion `middleware(request)` con coincidencia de rutas (`config.matcher`) y logica de redireccion HTTP 307.

### 1.5 Directorio: `src/types/`
* **Ruta Relativa**: `src/types/`
* **Tipo de Elemento**: Carpeta de Codigo Fuente (Directorio)
* **Que es**: Capa de tipado estricto global de TypeScript.
* **Que hace**: Define las interfaces, tipos y enums de todas las entidades de la base de datos y de las APIs.
* **Que contiene**: Archivo central `index.ts` con mas de 600 lineas de modelos de dominio.

#### 1.5.1 Archivo: `src/types/index.ts`
* **Ruta de Archivo**: `src/types/index.ts`
* **Tipo de Archivo**: Archivo de Codigo (`.ts`)
* **Que es**: Contrato maestro de tipos e interfaces de TypeScript de todo el proyecto.
* **Que hace**: Garantiza el tipado estricto entre base de datos, APIs de backend y componentes de frontend.
* **Que contiene**: Mas de 40 interfaces y tipos que modelan usuarios, perfiles, tickets, problemas, cambios, CMDB y catalogos.

---

## Resumen Cuantitativo del Arbol `src/`
* **Total de Rutas de API REST (`route.ts`)**: 119 endpoints implementados.
* **Total de Paginas de Usuario (`page.tsx`)**: 108 vistas funcionales.
* **Total de Componentes Reutilizables**: 28 modulos React de presentacion.
* **Total de Bibliotecas y Utilidades de Servidor**: 14 modulos de infraestructura.
* **Total de Interfaces de Dominio**: Mas de 40 interfaces y tipos en `src/types/index.ts`.

---
*Guia de arquitectura y jerarquia generada y validada para FlowDesk Software ITSM.*