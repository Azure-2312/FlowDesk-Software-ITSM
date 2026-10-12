# ANALISIS DE ARQUITECTURA DE SOFTWARE, ESTRATEGIAS DE EMPAQUETADO Y PROPUESTAS ESTRUCTURALES PARA FLOWDESK ITSM

Documento Tecnico de Arquitectura y Diseno de Software
Sistema: FlowDesk ITSM (Plataforma de Gestion de Servicios de TI)
Tecnologias: Next.js 14 (App Router), React 18, TypeScript 5, PostgreSQL 16, Tailwind CSS
Fecha de Elaboracion: Octubre 2026
Estado: Aprobado para Revision de Equipo y Diseno Estructural

---

## INDICE GENERAL

1. Fundamentos Teoricos y Conceptuales
   1.1 Arquitectura de Software vs. Package Structure
   1.2 Patrones de Arquitectura de Software (MVC, Capas, Hexagonal, Clean, Vertical Slice)
   1.3 Estrategias de Empaquetado (Package by Layer, Package by Feature, Bounded Contexts)
   1.4 Resolucion del Dilema de Negocio: Servicios ITSM vs. Administracion vs. Seguridad
   1.5 La Realidad Tecnica de Next.js 14 App Router y el Principio de Thin Router
2. Opcion 1: Vertical Slice Architecture + Feature Folders con Dominios Funcionales (Recomendada)
   2.1 Filosofia y Diseno Conceptual
   2.2 Estructura Completa de Carpetas y Archivos con Comentarios de Transformacion
   2.3 Dinamica de Trabajo en Equipo y Prevencion de Conflictos en Git
   2.4 Evaluacion: Ventajas y Desventajas
3. Opcion 2: Clean Architecture / Hexagonal Pragmatica (Ports & Adapters + Bounded Contexts)
   3.1 Filosofia y Diseno Conceptual
   3.2 Estructura Completa de Carpetas y Archivos con Comentarios de Transformacion
   3.3 Dinamica de Trabajo en Equipo y Prevencion de Conflictos en Git
   3.4 Evaluacion: Ventajas y Desventajas
4. Opcion 3: Arquitectura Modular en Capas por Dominio (Layered Domain Architecture)
   4.1 Filosofia y Diseno Conceptual
   4.2 Estructura Completa de Carpetas y Archivos con Comentarios de Transformacion
   4.3 Dinamica de Trabajo en Equipo y Prevencion de Conflictos en Git
   4.4 Evaluacion: Ventajas y Desventajas
5. Archivos Externos al Directorio src y Configuracion del Proyecto
   5.1 Configuracion de Path Aliases en tsconfig.json
   5.2 Variables de Entorno, Scripts y Persistencia SQL
6. Matriz Comparativa y Evaluacion Tecnica Multicriterio
7. Recomendacion Definitiva y Plan de Migracion Gradual sin Disrupcion

---

## 1. FUNDAMENTOS TEORICOS Y CONCEPTUALES

### 1.1 Arquitectura de Software vs. Package Structure

En la ingenieria de software moderna existe frecuentemente confusion entre dos conceptos que operan en niveles de abstraccion distintos pero complementarios:

1. **Arquitectura de Software (Software Architecture)**:
   Define los limites, responsabilidades, flujo de datos, reglas de dependencia e invariantes de negocio del sistema. Responde a preguntas como:
   * Quien puede llamar a quien? (Regla de dependencia).
   * Donde residen las reglas de negocio criticas (por ejemplo, transiciones de estado de un ticket ITIL, calculo de violacion de SLA)?
   * Como se aisla la logica del negocio de los detalles de infraestructura (base de datos PostgreSQL, protocolo HTTP, bibliotecas de correo Nodemailer)?

2. **Estructura de Paquetes / Carpetas (Package Structure)**:
   Es la manifestacion fisica y espacial del codigo fuente en el sistema de archivos del proyecto. Responde a preguntas como:
   * Donde encuentra un desarrollador el codigo que necesita modificar?
   * Que archivos cambian juntos cuando se implementa una nueva historia de usuario?
   * Como se organizan los archivos para minimizar colisiones y conflictos de fusion (merge conflicts) en ramas concurrentes de Git?

Una buena arquitectura de software implementada con una mala estructura de carpetas genera friccion cognitiva, navegacion tediosa entre carpetas distantes y altos conflictos en Git. A la inversa, una carpeta ordenada sin reglas arquitectonicas claras conduce al antipatron de espagueti modular, donde cualquier archivo importa funciones de cualquier otro sin control de fronteras.

---

### 1.2 Patrones de Arquitectura de Software

A continuacion se examinan los principales patrones arquitectonicos y su aplicabilidad en aplicaciones modernas con Next.js:

#### A. Modelo-Vista-Controlador (MVC)
* **Origen**: Creado originalmente por Trygve Reenskaug en 1979 para Smalltalk, adaptado luego a frameworks web tradicionales (Ruby on Rails, Django, Spring MVC, Laravel).
* **Concepto**:
  * **Modelo**: Representa los datos y la persistencia en base de datos.
  * **Vista**: Representa la plantilla HTML renderizada.
  * **Controlador**: Recibe la peticion HTTP, interactua con el modelo y selecciona la vista a retornar.
* **Limitacion en Next.js Moderno**:
  Next.js 14 con React Server Components y App Router desdibuja la separacion estricta de MVC. En React, la "Vista" no es una plantilla estatica, sino un arbol de componentes interactivo con estado local, hooks y efectos. Si se fuerza MVC clasico en Next.js, se tiende a crear controladores gigantescos o "fat controllers" en los endpoints API, mezclando transacciones SQL, envio de correos y validaciones en un solo bloque.

#### B. Arquitectura en Capas (N-Tier / Layered Architecture)
* **Concepto**: Organiza el software en estratos horizontales superpuestos:
  1. Capa de Presentacion (UI / Controladores HTTP).
  2. Capa de Aplicacion / Logica de Negocio (Servicios).
  3. Capa de Persistencia / Acceso a Datos (DAOs, Repositorios, ORM).
  4. Capa de Base de Datos.
* **Regla de Dependencia**: Cada capa solo puede comunicarse con la capa inmediatamente inferior.
* **Limitaciones**:
  * **Antipatron Sinkhole**: Frecuentemente, peticiones simples (ej. listar estados de tickets) atraviesan la capa de presentacion, la de aplicacion y la de datos sin agregar ningun valor de negocio, repitiendo metodos espejo `obtenerEstados()` en tres archivos diferentes.
  * **Baja Cohesion de Funcionalidad**: Para agregar un campo a la entidad "Cambios", el desarrollador debe abrir archivos en 4 carpetas separadas (`presentation/cambios`, `services/cambios`, `repositories/cambios`, `types/cambios`).

#### C. Arquitectura Hexagonal (Ports and Adapters - Alistair Cockburn)
* **Concepto**:
  * El nucleo de la aplicacion (Dominio y Casos de Uso) se ubica en el centro (dentro del hexagono).
  * El exterior consiste en actores que interactuan con el nucleo: usuarios web, base de datos, APIs de terceros, colas de mensajeria.
  * La comunicacion entre el nucleo y el exterior se realiza exclusivamente mediante **Puertos** (interfaces en TypeScript) y **Adaptadores** (implementaciones concretas).
  * **Adaptadores Primarios (Driving)**: Inician la accion (ej. Next.js API Routes, Vistas React).
  * **Adaptadores Secundarios (Driven)**: Son invocados por el nucleo (ej. adaptador de base de datos PostgreSQL con `pg`, adaptador de email con Nodemailer).
* **Ventaja Principal**: Desacoplamiento total. Si se cambia PostgreSQL por MySQL o DynamoDB, el nucleo de negocio no sufre ninguna modificacion.
* **Desventaja**: Mayor cantidad de interfaces, DTOs y clases intermedias (boiler-plate), lo cual puede ser excesivo si el equipo es reducido o el proyecto no cambia frecuentemente de infraestructura.

#### D. Clean Architecture (Robert C. Martin / Uncle Bob)
* **Concepto**: Similar a la Hexagonal, organiza el sistema en cuatro circulos concentricos:
  1. **Entities (Empresa / Dominio)**: Reglas de negocio universales.
  2. **Use Cases (Aplicacion)**: Orquestacion de flujos de negocio especificos.
  3. **Interface Adapters (Controladores, Presentadores, Gateways)**: Mapeo de datos entre la UI/BD y los casos de uso.
  4. **Frameworks & Drivers**: Herramientas externas (Next.js, Tailwind, PostgreSQL).
* **Regla de Dependencia**: Las dependencias siempre apuntan hacia adentro, hacia el centro. Las entidades de negocio jamas importan nada de React ni de PostgreSQL.

#### E. Vertical Slice Architecture (Jimmy Bogard)
* **Concepto**: En lugar de dividir el sistema por capas horizontales (todos los controladores juntos, todos los servicios juntos, todos los modelos juntos), el sistema se divide en **rebanadas verticales por funcionalidad** (Vertical Slices / Features).
* **Principio**: "Cosas que cambian juntas, deben vivir juntas".
* **Aplicacion**: Para la funcionalidad "Crear Ticket", todo lo relacionado (formulario visual, hook de estado, validacion Zod/manual, logica de insercion SQL y notificacion por correo) se ubica en un mismo modulo o paquete cohesivo.
* **Ventaja en Next.js**: Es la arquitectura mas afin al App Router de Next.js. Permite que diferentes desarrolladores trabajen en modulos independientes sin pisarse archivos mutuamente.

---

### 1.3 Estrategias de Empaquetado (Package Structure)

| Estrategia | Descripcion | Ventajas | Desventajas |
|---|---|---|---|
| **Package by Layer** | Carpetas como `components/`, `services/`, `controllers/`, `models/` | Facil de entender en proyectos pequenos. | A medida que el sistema crece, cada carpeta contiene 50+ archivos sin relacion entre si. Dificulta saber que archivos corresponden a cada modulo. |
| **Package by Feature** | Carpetas por funcionalidad: `incidentes/`, `usuarios/`, `reportes/` | Alta cohesion espacial. Cada funcionalidad es autocontenida y facil de mover, probar o eliminar. | Requiere disciplina para no duplicar utilidades comunes y saber donde ubicar componentes transversales. |
| **Package by Component / Bounded Context** | Carpetas por subdominios de negocio: `itsm-core/`, `administracion/`, `seguridad/` | Ideal para sistemas grandes con multiples dominios funcionales claramente diferenciados. | Requiere definir con precision los limites conceptuales entre modulos. |

---

### 1.4 Resolucion del Dilema de Negocio de FlowDesk ITSM

El desarrollador identifica un dilema muy comun y legitimo en proyectos ITSM:
> "Siempre he preferido que en este sistema que tenemos este organizado por carpeta de cada uno de los modulos (cambios, problemas, incidentes, solicitudes), pero tambien pienso en que estos son parte de los servicios que ofrecemos y combinarlos con carpetas de otras cosas (perfiles, usuarios, reportes, tablas) no le encuentro sentido... donde hiria seguridad, reportes, etc."

La solucion arquitectonica para este dilema radica en la **Clasificacion de Dominios de Primer Nivel**. No todos los modulos tienen la misma naturaleza dentro de FlowDesk:

1. **Dominio Operativo ITSM (Procesos Core ITIL)**:
   * Representan los servicios transaccionales de gestion de servicios de TI ofrecidos a la organizacion:
     * **Incidentes**: Restauracion rapida del servicio ante fallas no planificadas.
     * **Requerimientos / Solicitudes**: Peticiones de catalogo (nuevos accesos, equipos, software).
     * **Problemas**: Analisis de causa raiz y gestion de errores conocidos para prevenir incidentes recurrentes.
     * **Cambios**: Evaluacion de riesgos, comite CAB y autorizacion de despliegues.
     * **Tareas**: Actividades operativas asignadas a especialistas dentro de un ticket mayor.
     * **Catalogo de Servicios**: Vista al cliente de los servicios disponibles y sus categorias.
   * *Conclusion*: Todos ellos pertenecen al mismo subdominio de negocio (`itsm` u `operaciones`).

2. **Dominio de Administracion y Parametrizacion de Plataforma**:
   * Funcionalidades que configuran las reglas maestras del sistema y la estructura organizacional:
     * **Usuarios**: Cuentas del sistema, datos de contacto, estados.
     * **Perfiles y Permisos**: Roles de consumidor, operador, supervisor, administrador, gobierno.
     * **Areas y Departamentos**: Estructura jerarquica de la empresa y asignacion de mesas de ayuda.
     * **SLA (Acuerdos de Nivel de Servicio)**: Politicas de tiempo de respuesta y solucion por prioridad.
     * **Categorias de Servicios**: Clasificacion taxonomica de servicios en el catalogo.
     * **Formularios Dinamicos**: Configuracion de campos requeridos y opcionales por servicio.
     * **Encuestas de Satisfaccion**: Plantillas de calificacion post-cierre de tickets.
   * *Conclusion*: Pertenecen al subdominio (`admin` o `administracion`). No son tickets operativos, sino tablas maestras y configuracion.

3. **Dominio Transversal de Seguridad e Identidad**:
   * Mecanismos que controlan el acceso al sistema:
     * Autenticacion (credenciales, hashing bcrypt, tokens JWT).
     * Validacion perimetral humana (Captcha matematico).
     * Gestion de sesion y conmutacion de perfil activo en cookies.
     * Middleware de proteccion de rutas en Edge.
   * *Conclusion*: Pertenecen al modulo (`seguridad` o `auth`).

4. **Dominio de Analitica, Inteligencia y Gobierno**:
   * Extraccion y visualizacion de datos historicos:
     * Reportes de gestion operativa (cumplimiento de SLA, volumen de tickets, rendimiento por tecnico).
     * Auditoria de cambios en el sistema (trazabilidad de accesos y modificaciones criticas).
   * *Conclusion*: Pertenecen al subdominio (`analitica` o `reportes-auditoria`).

5. **Infraestructura y Componentes Compartidos (Shared / Core)**:
   * Elementos reutilizables sin logica de negocio particular:
     * Pool de conexiones a PostgreSQL (`db.ts`).
     * Motor de envio de emails (`email.ts`).
     * Sanitizacion y validaciones universales de formato (`validaciones.ts`).
     * Componentes UI primitivos (botones, tablas genericas, badges, modales de confirmacion).
     * Definicion de tipos TypeScript globales (`types/index.ts`).

---

### 1.5 La Realidad Tecnica de Next.js 14 App Router y el Principio de Thin Router

Next.js 14 impone una regla inviolable: **las rutas URL se determinan por la presencia de archivos `page.tsx` y `route.ts` dentro de `src/app/`**. No es posible eliminar `src/app/` sin romper el enrutamiento de Next.js.

Sin embargo, **no es obligatorio que toda la logica de programacion resida dentro de `src/app/`**. 

El diseno optimo para Next.js 14 consiste en el patron **Thin Router (Enrutador Delgado)**:
* La carpeta `src/app/` se mantiene extremadamente delgada:
  * Un archivo `route.ts` solo debe recibir la peticion HTTP, extraer los parametros, llamar a una funcion de servicio ubicada en el modulo correspondiente y retornar una respuesta JSON (`NextResponse.json(...)`). Un `route.ts` optimo no supera las 20 a 30 lineas de codigo.
  * Un archivo `page.tsx` solo debe importar y renderizar el componente o contenedor de la pagina ubicado en la carpeta del modulo.
* Toda la logica pesada (consultas SQL complejas, validaciones, calculos de fechas SLA, componentes visuales enriquecidos, hooks de React) vive dentro de carpetas modulares organizadas fuera de `app/` (por ejemplo, en `src/modules/` o `src/features/`).
* **Route Groups de Next.js**: Next.js permite nombrar carpetas entre parentesis como `src/app/itsm/`, `src/app/admin/`, `src/app/analitica/`. Los parentesis indican que el nombre de la carpeta **no se incluye en la URL del navegador**. Por ejemplo, `src/app/itsm/incidentes/page.tsx` se visualiza en el navegador limpiamente como `/incidentes`. Esto permite organizar visualmente las rutas de `app/` en perfecta concordancia con los dominios de negocio.

---

## 2. OPCION 1: VERTICAL SLICE ARCHITECTURE + FEATURE FOLDERS CON DOMINIOS FUNCIONALES (RECOMENDADA)

### 2.1 Filosofia y Diseno Conceptual

Esta arquitectura organiza el codigo en dos grandes niveles:
1. **Primer Nivel (Dominios de Negocio)**: Agrupa los modulos en `itsm` (servicios operativos), `admin` (parametrizacion y maestros), `seguridad` (autenticacion y sesion), `analitica` (reportes y auditoria) y `shared` (utilidades y componentes comunes).
2. **Segundo Nivel (Vertical Slices / Features)**: Dentro de cada dominio, cada modulo funcional contiene todo lo que necesita para operar: sus propios componentes, sus propios servicios con consultas a base de datos, sus esquemas de validacion y sus tipos.

**Por que es la opcion recomendada para FlowDesk**:
* Resuelve directamente la inquietud del desarrollador: los servicios operativos ITSM (`incidentes`, `requerimientos`, `problemas`, `cambios`, `tareas`, `catalogo`) quedan agrupados dentro de una misma carpeta padre `src/modules/itsm/`, completamente separados de `src/modules/admin/` y `src/modules/seguridad/`.
* Reduce a cero los conflictos de Git: si un companero de equipo trabaja en "Problemas", solo editara archivos dentro de `src/modules/itsm/problemas/` y `src/app/itsm/problemas/`. Si otro companero trabaja en "Usuarios", solo editara archivos en `src/modules/admin/usuarios/`. Sus ramas nunca colisionaran en Git.
* Adaptacion natural a Next.js 14: Los archivos en `src/app/` son cascarones de menos de 25 lineas que delegan a los modulos.

---

### 2.2 Estructura Completa de Carpetas y Archivos (Opcion 1)

```text
FlowDesk-Software-ITSM/
|-- .env.local                                      // Variables de entorno locales (credenciales DB PostgreSQL, secret JWT)
|-- .env.example                                    // Plantilla publica de variables requeridas para el equipo
|-- .gitignore                                      // Exclusiones de Git (node_modules, .next, .env.local)
|-- next.config.js                                  // Configuracion del bundler Next.js (reactStrictMode, headers)
|-- package.json                                    // Dependencias npm y scripts del proyecto (dev, build, start, lint)
|-- package-lock.json                               // Bloqueo estricto de arbol de dependencias npm
|-- tsconfig.json                                   // Configuracion TypeScript con Path Aliases: @/modules/*, @/shared/*
|-- README.md                                       // Manual general del repositorio para colaboradores
|-- DOCUMENTACIÓN/                                  // Repositorio de documentacion funcional y tecnica del sistema
|   |-- ARQUITECTURA_Y_JERARQUIA_SRC.md             // Inventario exhaustivo y mapeo previo de rutas y archivos
|   |-- PROPUESTAS_ARQUITECTURA_Y_ESTRUCTURA.md     // El presente documento maestro de diseno arquitectonico
|   |-- catalogo_maestro_jerarquia_menu_por_perfil_itsm.md // Especificacion funcional de roles y opciones de navegacion
|   +-- reglas_de_negocio.md                        // Reglas de validacion ITIL, SLA y transiciones de estado
|-- db/                                             // Directorio de scripts y migraciones de persistencia relacional
|   +-- migrations/                                 // Scripts SQL versionados para estructura y datos iniciales de PostgreSQL
|-- public/                                         // Recursos estaticos servidos directamente por el servidor web
|   |-- favicon.ico                                 // Icono del navegador
|   +-- logo.svg                                    // Logotipo corporativo de FlowDesk ITSM
|
+-- src/                                            // Codigo fuente principal de la aplicacion
    |-- middleware.ts                               // Interceptor Edge: valida cookie auth_token y protege rutas privadas
    |
    |-- app/                                        // CAPA DE ENRUTAMIENTO (THIN ROUTER - CONTROLADORES Y VISTAS DELEGADAS)
    |   |-- globals.css                             // Estilos globales de la aplicacion y directivas Tailwind CSS
    |   |-- layout.tsx                              // Layout raiz HTML: metadatos del sistema y fuentes tipograficas
    |   |-- page.tsx                                // Redireccion raiz: envia a /login si no hay sesion o a /dashboard
    |   |-- login/                                  // Ruta publica de autenticacion
    |   |   +-- page.tsx                            // Vista del login: importa componente LoginForm de @/modules/seguridad
    |   |
    |   |-- plataforma/                                  // GRUPO DE RUTAS AUTENTICADAS (COMPARTE LAYOUT GENERAL DEL SISTEMA)
    |   |   |-- layout.tsx                          // Layout privado: monta barra lateral Menu.tsx y Header con Perfiles
    |   |   |-- dashboard/                          // Tablero principal de bienvenida y resumen de indicadores
    |   |   |   +-- page.tsx                        // Renderiza vista DashboardView de @/modules/analitica
    |   |   |
    |   |   |-- itsm/                             // SUBGRUPO DE ENRUTAMIENTO: SERVICIOS OPERATIVOS ITIL (URL limpia)
    |   |   |   |-- incidentes/                     // Modulo de gestion de incidentes
    |   |   |   |   |-- page.tsx                    // Renderiza ListaIncidentesPage de @/modules/itsm/incidentes
    |   |   |   |   +-- [id]/                       // Detalle de incidente individual
    |   |   |   |       +-- page.tsx                // Renderiza DetalleIncidentePage con presentador segun rol activo
    |   |   |   |-- requerimientos/                 // Modulo de solicitudes de requerimiento
    |   |   |   |   |-- page.tsx                    // Renderiza ListaRequerimientosPage de @/modules/itsm/requerimientos
    |   |   |   |   +-- [id]/                       // Detalle de solicitud
    |   |   |   |       +-- page.tsx                // Renderiza DetalleRequerimientoPage
    |   |   |   |-- problemas/                      // Modulo de gestion de problemas
    |   |   |   |   |-- page.tsx                    // Renderiza ListaProblemasPage de @/modules/itsm/problemas
    |   |   |   |   +-- [id]/                       // Detalle de investigacion de problema
    |   |   |   |       +-- page.tsx                // Renderiza DetalleProblemaPage
    |   |   |   |-- cambios/                        // Modulo de gestion de cambios (RFC)
    |   |   |   |   |-- page.tsx                    // Renderiza ListaCambiosPage de @/modules/itsm/cambios
    |   |   |   |   +-- [id]/                       // Detalle y evaluacion CAB de cambio
    |   |   |   |       +-- page.tsx                // Renderiza DetalleCambioPage
    |   |   |   |-- tareas/                         // Modulo de tareas asignadas a especialistas
    |   |   |   |   +-- page.tsx                    // Renderiza ListaTareasPage de @/modules/itsm/tareas
    |   |   |   +-- catalogo/                       // Catalogo de servicios interactivo para solicitantes
    |   |   |       +-- page.tsx                    // Renderiza CatalogoServiciosView de @/modules/itsm/catalogo
    |   |   |
    |   |   |-- admin/                            // SUBGRUPO DE ENRUTAMIENTO: ADMINISTRACION Y MAESTROS DE PLATAFORMA
    |   |   |   |-- usuarios/                       // Administracion de usuarios del sistema
    |   |   |   |   +-- page.tsx                    // Renderiza GestionUsuariosView de @/modules/admin/usuarios
    |   |   |   |-- perfiles/                       // Matriz de perfiles y asignacion de permisos
    |   |   |   |   +-- page.tsx                    // Renderiza GestionPerfilesView de @/modules/admin/perfiles
    |   |   |   |-- departamentos/                  // Estructura de areas y departamentos tecnicos
    |   |   |   |   +-- page.tsx                    // Renderiza GestionDepartamentosView de @/modules/admin/departamentos
    |   |   |   |-- servicios/                      // Configuracion de servicios del catalogo
    |   |   |   |   +-- page.tsx                    // Renderiza GestionServiciosView de @/modules/admin/servicios
    |   |   |   |-- categorias-servicios/           // CRUD de categorias de servicios (desacoplado de pestanas)
    |   |   |   |   +-- page.tsx                    // Renderiza GestionCategoriasView de @/modules/admin/categorias
    |   |   |   |-- sla/                            // Configuracion de politicas de niveles de servicio
    |   |   |   |   +-- page.tsx                    // Renderiza ConfiguracionSLAView de @/modules/admin/sla
    |   |   |   |-- formularios/                    // Diseno de campos dinamicos por servicio
    |   |   |   |   +-- page.tsx                    // Renderiza ConfiguracionFormulariosView de @/modules/admin/formularios
    |   |   |   +-- encuestas/                      // Plantillas de encuestas de satisfaccion al cliente
    |   |   |       +-- page.tsx                    // Renderiza GestionEncuestasView de @/modules/admin/encuestas
    |   |   |
    |   |   +-- analitica/                        // SUBGRUPO DE ENRUTAMIENTO: INTELIGENCIA OPERATIVA Y GOBIERNO
    |   |       |-- reportes/                       // Generacion de reportes consolidados y graficos
    |   |       |   +-- page.tsx                    // Renderiza ReportesView de @/modules/analitica/reportes
    |   |       +-- auditoria/                      // Visor de eventos y registros de seguridad del sistema
    |   |           +-- page.tsx                    // Renderiza AuditoriaView de @/modules/analitica/auditoria
    |   |
    |   +-- api/                                    // CONTROLADORES REST HTTP (ENDPOINTS DELGADOS DELEGADORES)
    |       |-- auth/                               // Endpoints de autenticacion y gestion de identidad
    |       |   |-- login/                          // Endpoint POST: recibe credenciales
    |       |   |   +-- route.ts                    // // Pierde validacion y SQL; delega en seguridadService.autenticar()
    |       |   |-- logout/                         // Endpoint POST: destruye cookies de sesion
    |       |   |   +-- route.ts                    // // Delega en seguridadService.cerrarSesion()
    |       |   |-- captcha/                        // Endpoint GET: entrega captcha matematico
    |       |   |   +-- route.ts                    // // Delega en captchaService.generarCaptcha()
    |       |   |-- seleccionar-perfil/             // Endpoint POST: fija cookie active_profile_id
    |       |   |   +-- route.ts                    // // Delega en seguridadService.cambiarPerfilActivo()
    |       |   +-- cambiar-perfil/                 // Endpoint POST: conmutacion en caliente de rol
    |       |       +-- route.ts                    // // Delega en seguridadService.cambiarPerfilActivo()
    |       |
    |       |-- itsm/                               // Endpoints de servicios transaccionales ITIL
    |       |   |-- incidentes/                     // Gestion REST de incidentes
    |       |   |   |-- route.ts                    // // GET: lista incidentes; POST: delega a incidentesService.crear()
    |       |   |   +-- [id]/                       // Operaciones sobre un incidente puntual
    |       |   |       |-- route.ts                // // GET: obtiene detalle; PATCH: actualiza datos basicos
    |       |   |       |-- transicion/             // Endpoint POST: cambio de estado (en progreso, resuelto, cerrado)
    |       |   |       |   +-- route.ts            // // Delega a incidentesService.ejecutarTransicion()
    |       |   |       +-- comentarios/            // Endpoint GET/POST: bitacora y notas internas
    |       |   |           +-- route.ts            // // Delega a incidentesService.agregarComentario()
    |       |   |-- requerimientos/                 // Gestion REST de requerimientos
    |       |   |   |-- route.ts                    // // Delega en requerimientosService.listar() / crear()
    |       |   |   +-- [id]/route.ts               // // Delega en requerimientosService.obtenerPorId()
    |       |   |-- problemas/                      // Gestion REST de problemas y causas raiz
    |       |   |   |-- route.ts                    // // Delega en problemasService.listar() / crear()
    |       |   |   +-- [id]/route.ts               // // Delega en problemasService.obtenerPorId()
    |       |   |-- cambios/                        // Gestion REST de cambios (solicitud, evaluacion CAB, aprobacion)
    |       |   |   |-- route.ts                    // // Delega en cambiosService.listar() / crear()
    |       |   |   +-- [id]/route.ts               // // Delega en cambiosService.obtenerPorId()
    |       |   |-- tareas/                         // Subtareas tecnicas asociadas a tickets
    |       |   |   +-- route.ts                    // // Delega en tareasService.listar() / crear()
    |       |   +-- catalogo/                       // Catalogo publico para solicitantes
    |       |       +-- route.ts                    // // Delega en catalogoService.obtenerArbolServicios()
    |       |
    |       |-- admin/                              // Endpoints de mantenimiento y parametrizacion
    |       |   |-- usuarios/                       // CRUD de cuentas de usuario
    |       |   |   |-- route.ts                    // // Delega en adminUsuariosService.listar() / crear()
    |       |   |   +-- [id]/route.ts               // // Delega en adminUsuariosService.actualizar() / desactivar()
    |       |   |-- perfiles/                       // Listado y asignacion de roles
    |       |   |   +-- route.ts                    // // Delega en adminPerfilesService.listar()
    |       |   |-- departamentos/                  // CRUD de areas tecnicas
    |       |   |   +-- route.ts                    // // Delega en adminDepartamentosService.listar() / guardar()
    |       |   |-- servicios/                      // Creacion y edicion de servicios en catalogo
    |       |   |   +-- route.ts                    // // Delega en adminServiciosService.listar() / crear()
    |       |   |-- categorias/                     // CRUD estricto de categorias de servicios
    |       |   |   +-- route.ts                    // // Delega en adminCategoriasService.crudCompleto()
    |       |   |-- sla/                            // Configuracion de matriz de SLA por prioridad
    |       |   |   +-- route.ts                    // // Delega en adminSlaService.obtenerConfiguracion() / guardar()
    |       |   +-- formularios/                    // Parametrizacion de campos dinamicos
    |       |       +-- route.ts                    // // Delega en adminFormulariosService.obtenerConfiguracion()
    |       |
    |       +-- analitica/                          // Endpoints de generacion de reportes y auditoria
    |           |-- reportes/                       // Agregacion y metricas cuantitativas
    |           |   +-- route.ts                    // // Delega en analiticaService.generarMetricasOperativas()
    |           +-- auditoria/                      // Consulta paginada del log de auditoria
    |               +-- route.ts                    // // Delega en analiticaService.consultarLogAuditoria()
    |
    |-- modules/                                    // LOGICA DE NEGOCIO, SERVICIOS, COMPONENTES Y REBANADAS VERTICALES
    |   |
    |   |-- itsm/                                   // SUBDOMINIO: SERVICIOS OPERATIVOS ITIL (TICKETS Y PROCESOS CORE)
    |   |   |-- incidentes/                         // Feature vertical de Incidentes
    |   |   |   |-- components/                     // Componentes visuales especificos de incidentes
    |   |   |   |   |-- TablaIncidentes.tsx         // // Tabla enriquecida con estados, SLA y badges de prioridad
    |   |   |   |   |-- ModalIncidente.tsx     // // Formulario modal con validacion de impacto/urgencia
    |   |   |   |   +-- PanelIncidente.tsx   // // Vista completa con historial de transiciones
    |   |   |   |-- services/                       // Capa de persistencia y logica de negocio de incidentes
    |   |   |   |   |-- incidentesService.ts        // // Consultas SQL a tabla tickets filtradas por tipo incidente
    |   |   |   |   +-- transicionesService.ts    // // Maquina de estados (abierto -> en_progreso -> resuelto)
    |   |   |   |-- hooks/                          // Hooks personalizados de React
    |   |   |   |   +-- useIncidentes.ts            // // Manejo del ciclo de vida, fetching y cache local
    |   |   |   |-- validaciones/                   // Esquemas de validacion de entrada de datos
    |   |   |   |   +-- incidenteValidaciones.ts    // // Validacion estricta de campos obligatorios
    |   |   |   +-- types/                          // Tipos TypeScript especificos del modulo
    |   |   |       +-- incidentesTypes.ts           // // Interfaces de Incidente, FiltrosIncidente, TransicionIncidente
    |   |   |
    |   |   |-- requerimientos/                     // Feature vertical de Requerimientos / Solicitudes
    |   |   |   |-- components/
    |   |   |   |   |-- TablaRequerimientos.tsx     // // Tabla con datos especificos de solicitante y aprobacion
    |   |   |   |   +-- FormularioRequerimiento.tsx // // Formulario adaptado a los campos dinamicos del servicio
    |   |   |   |-- services/
    |   |   |   |   +-- requerimientosService.ts    // // Logica de insercion y transiciones para solicitudes
    |   |   |   |-- hooks/
    |   |   |   |   +-- useRequerimientos.ts        // // Hook de gestion de estado de requerimientos
    |   |   |   +-- types/
    |   |   |       +-- requerimientosTypes.ts       // // Tipos de Requerimiento y Aprobaciones
    |   |   |
    |   |   |-- problemas/                          // Feature vertical de Problemas y Errores Conocidos
    |   |   |   |-- components/
    |   |   |   |   |-- TablaProblemas.tsx          // // Vista de problemas abiertos, analisis de causa raiz
    |   |   |   |   +-- ModalCausaRaiz.tsx          // // Modal para documentar workaround y solucion definitiva
    |   |   |   |-- services/
    |   |   |   |   +-- problemasService.ts         // // Persistencia y asociacion de multiples incidentes a un problema
    |   |   |   +-- types/
    |   |   |       +-- problemasTypes.ts            // // Tipos de Problema, CausaRaiz, ErrorConocido
    |   |   |
    |   |   |-- cambios/                            // Feature vertical de Gestion de Cambios (RFC)
    |   |   |   |-- components/
    |   |   |   |   |-- TablaCambios.tsx            // // Tabla con clasificacion (estandar, normal, de emergencia)
    |   |   |   |   +-- PanelAprobacionCAB.tsx      // // Panel para votos y aprobaciones de miembros del comite
    |   |   |   |-- services/
    |   |   |   |   +-- cambiosService.ts           // // Evaluacion de riesgos y registro de planes de rollback
    |   |   |   +-- types/
    |   |   |       +-- cambiosTypes.ts              // // Tipos de Cambio, EvaluacionRiesgo, MiembroCAB
    |   |   |
    |   |   |-- tareas/                             // Feature vertical de Tareas Tecnicas Operativas
    |   |   |   |-- components/
    |   |   |   |   +-- ListaTareas.tsx    // // Checklist interactivo dentro de un ticket
    |   |   |   |-- services/
    |   |   |   |   +-- tareasService.ts            // // Operaciones de creacion, reasignacion y cierre de tarea
    |   |   |   +-- types/
    |   |   |       +-- tareasTypes.ts               // // Interfaces de Tarea, Asignado, EstadoTarea
    |   |   |
    |   |   +-- presentadores/                      // Presentadores polimorficos de tickets segun rol de usuario
    |   |       |-- PresentadorConsumidor.tsx       // // Vista simplificada para solicitante (estado + calificacion)
    |   |       |-- PresentadorOperador.tsx         // // Panel tecnico con acciones operativas y checklist
    |   |       |-- PresentadorSupervisor.tsx       // // Panel con reasignacion forzada y monitoreo SLA
    |   |       |-- PresentadorAdmin.tsx    // // Acceso total, auditoria y modificacion de parametros
    |   |       +-- PresentadorGobierno.tsx         // // Enfoque en cumplimiento normativo y revision post-cierre
    |   |
    |   |-- admin/                                  // SUBDOMINIO: ADMINISTRACION, MAESTROS Y CONFIGURACION DE PLATAFORMA
    |   |   |-- usuarios/                           // Administracion de cuentas
    |   |   |   |-- components/
    |   |   |   |   |-- TablaUsuarios.tsx           // // Listado con badges de estado y roles asignados
    |   |   |   |   +-- ModalUsuario.tsx      // // Formulario con validacion de DNI, email y perfil
    |   |   |   |-- services/
    |   |   |   |   +-- usuariosService.ts     // // Insercion con hashing bcrypt y consultas transaccionales
    |   |   |   +-- types/
    |   |   |       +-- usuariosTypes.ts        // // Tipos de Usuario, Credenciales, AsignacionRol
    |   |   |
    |   |   |-- perfiles/                           // Gestion de perfiles y autorizaciones
    |   |   |   |-- components/
    |   |   |   |   +-- MatrizPerfiles.tsx  // // Tabla interactiva de perfiles y capacidades
    |   |   |   +-- services/
    |   |   |       +-- perfilesService.ts     // // Consulta a tablas perfiles y perfiles_usuarios
    |   |   |
    |   |   |-- departamentos/                      // Areas y departamentos tecnicos
    |   |   |   |-- components/
    |   |   |   |   +-- ArbolDepartamentos.tsx      // // Jerarquia visual de departamentos y supervisores
    |   |   |   +-- services/
    |   |   |       +-- departamentosService.ts // // CRUD de areas y vinculacion con especialistas
    |   |   |
    |   |   |-- categorias/                         // CRUD de categorias de servicios (desacoplado del catalogo)
    |   |   |   |-- components/
    |   |   |   |   |-- TablaCategorias.tsx         // // Tabla con acciones de editar, desactivar y ordenar
    |   |   |   |   +-- ModalCategoria.tsx     // // Formulario con validaciones estrictas anti-duplicados
    |   |   |   +-- services/
    |   |   |       +-- categoriasService.ts   // // Persistencia directa sobre tabla categorias_servicios
    |   |   |
    |   |   |-- servicios/                          // Definicion y precios/tiempos de servicios del catalogo
    |   |   |   |-- components/
    |   |   |   |   |-- TablaServicios.tsx     // // Lista de servicios asociados a sus categorias
    |   |   |   |   +-- ModalServicio.tsx // // Formulario de SLA base y departamento responsable
    |   |   |   +-- services/
    |   |   |       +-- serviciosService.ts    // // Mantenimiento de tabla servicios
    |   |   |
    |   |   |-- sla/                                // Configuracion de acuerdos de nivel de servicio
    |   |   |   |-- components/
    |   |   |   |   +-- MatrizSla.tsx  // // Matriz interactiva de tiempos de respuesta/solucion
    |   |   |   +-- services/
    |   |   |       +-- slaService.ts          // // Persistencia y calculos de calendario habil vs corrido
    |   |   |
    |   |   +-- formularios/                        // Campos dinamicos y formularios de solicitante
    |   |       |-- components/
    |   |       |   +-- EditorFormulario.tsx  // // Constructor de campos obligatorios/opcionales
    |   |       +-- services/
    |   |           +-- formulariosService.ts  // // Almacenamiento en tabla configuraciones
    |   |
    |   |-- seguridad/                              // SUBDOMINIO: IDENTIDAD, AUTENTICACION Y SESION
    |   |   |-- components/
    |   |   |   |-- LoginForm.tsx                   // // Formulario de ingreso con usuario, password y captcha
    |   |   |   +-- SelectorPerfilModal.tsx         // // Modal presentado si el usuario posee multiples roles
    |   |   |-- services/
    |   |   |   |-- authService.ts                  // // Verificacion de credenciales, firma y lectura de JWT
    |   |   |   |-- captchaService.ts               // // Generador y validador de captcha matematico SVG
    |   |   |   +-- sessionService.ts               // // Manejo seguro de cookies httpOnly (auth_token, perfil)
    |   |   +-- types/
    |   |       +-- authTypes.ts                    // // Tipos de TokenPayload, SesionUsuario, Credenciales
    |   |
    |   +-- analitica/                              // SUBDOMINIO: REPORTES, AUDITORIA E INTELIGENCIA
    |       |-- components/
    |       |   |-- GraficosKpi.tsx       // // Graficos de cumplimiento SLA, tasa de resolucion
    |       |   |-- TablaAuditoria.tsx           // // Visor filtrable de eventos de seguridad
    |       |   +-- FiltrosFechas.tsx          // // Selector de intervalos temporales para exportacion
    |       |-- services/
    |       |   +-- analiticaService.ts             // // Consultas analiticas agregadas con GROUP BY y ventanas
    |       +-- types/
    |           +-- analiticaTypes.ts               // // Tipos de MetricasSla, EventoAuditoria, ResumenKpi
    |
    +-- shared/                                     // RECURSOS COMPARTIDOS Y TRANSVERSALES (CORE INALTERADO)
        |-- components/                             // Componentes de interfaz genericos y desacoplados del negocio
        |   |-- ui/                                 // Elementos visuales base
        |   |   |-- Boton.tsx                       // // Boton estandarizado con variantes (primary, danger, etc.)
        |   |   |-- Input.tsx                       // // Input con soporte de errores y accesibilidad
        |   |   |-- Badge.tsx                       // // Insignia para estados y prioridades
        |   |   |-- Modal.tsx                       // // Contenedor modal generico con backdrop accesible
        |   |   +-- Tabla.tsx               // // Tabla con paginacion y ordenamiento reutilizable
        |   |-- layout/                             // Estructura envolvente de navegacion
        |   |   |-- MenuLateral.tsx                 // // Menu lateral que lee la matriz de permisos
        |   |   +-- SelectorPerfil.tsx        // // Conmutador superior de rol activo en caliente
        |   +-- feedback/                           // Mensajeria al usuario
        |       |-- AlertaToast.tsx          // // Toast o banner de confirmacion y error
        |       +-- SpinnerCarga.tsx                // // Indicador visual de espera asincrona
        |
        |-- lib/                                    // Utilidades de infraestructura y librerias del servidor
        |   |-- db.ts                               // Pool de conexiones a PostgreSQL mediante pg parametrizado
        |   |-- sla.ts                              // Motor matematico de calculo de vencimiento de SLA
        |   |-- menu.ts                             // Matriz de rutas permitidas y visibilidad de opciones por rol
        |   |-- validaciones.ts                     // Funciones universales de sanitizacion y formato
        |   |-- email.ts                            // Cliente Nodemailer para notificaciones transaccionales
        |   +-- fechas.ts                           // Formateo y calculo de horas habiles en zona horaria local
        |
        +-- types/                                  // Tipos globales del sistema
            +-- index.ts                            // Definiciones base de entidades maestras compartidas
```

---

### 2.3 Dinamica de Trabajo en Equipo y Prevencion de Conflictos en Git

La principal ventaja practica de la **Opcion 1** para un equipo de companeros de trabajo es la **separacion fisica de areas de trabajo**:

1. **Escenario de Desarrollo Colaborativo**:
   * **Desarrollador A** recibe la tarea: *"Implementar gestion de problemas y causas raiz"*.
     * Crea su rama: `feature/modulo-problemas`.
     * Sus archivos de trabajo estan 100% confinados en: `src/modules/itsm/problemas/` y `src/app/plataforma/itsm/problemas/`.
   * **Desarrollador B** recibe la tarea: *"Implementar CRUD de categorias de servicios en administracion"*.
     * Crea su rama: `feature/crud-categorias-servicios`.
     * Sus archivos de trabajo estan 100% confinados en: `src/modules/admin/categorias/` y `src/app/plataforma/admin/categorias-servicios/`.
   * **Desarrollador C** recibe la tarea: *"Mejorar el sistema de login y agregar bloqueo de captcha por reintentos"*.
     * Crea su rama: `feature/seguridad-reintentos-captcha`.
     * Sus archivos estan confinados en: `src/modules/seguridad/`.

2. **Resultado de la Fusion en Git (Merge)**:
   * Cuando los tres desarrolladores suben sus ramas y abren Pull Requests hacia `main`, **Git fusiona los cambios automaticamente con cero conflictos**. No hay cruce de lineas de codigo porque ningun desarrollador toco los archivos de los demas.
   * El unico archivo compartido que podria modificarse es la matriz de navegacion en `src/shared/lib/menu.ts`, pero al ser una lista estructurada, resolver un eventual conflicto toma menos de 2 minutos.

---

### 2.4 Evaluacion: Ventajas y Desventajas

#### Ventajas:
* **Separacion Clara de Dominios**: Responde exactamente al requerimiento de aislar los servicios operativos ITSM de la administracion y de la seguridad.
* **Alta Cohesion Espacial**: Todo lo que concierne a un modulo (ej. incidentes) esta en una sola carpeta. No hay que saltar entre 6 directorios distantes para realizar un cambio.
* **Excelente Sinergia con Next.js 14**: Respeta el App Router mediante `Thin Routers` y aprovecha los Route Groups `itsm`, `admin`, `analitica` para mantener URLs limpias y legibles.
* **Minimos Conflictos en Git**: Maxima independencia de trabajo simultaneo entre companeros de equipo.
* **Curva de Aprendizaje Moderada**: Cualquier desarrollador con conocimientos basicos de TypeScript y React entiende la estructura en pocos minutos.

#### Desventajas:
* Requiere una disciplina inicial para evitar que los modulos se importen directamente entre si de forma cruzada (por ejemplo, que `incidentes` importe directamente cosas privadas de `usuarios`; la regla debe ser importar a traves de `shared` o servicios publicos).

---

## 3. OPCION 2: CLEAN ARCHITECTURE / HEXAGONAL PRAGMATICA (PORTS & ADAPTERS + BOUNDED CONTEXTS)

### 3.1 Filosofia y Diseno Conceptual

Esta arquitectura se fundamenta en los principios de **Domain-Driven Design (DDD)** y la **Arquitectura Hexagonal (Ports & Adapters)** de Alistair Cockburn:

* **Bounded Contexts (Contextos Delimitados)**: El sistema se divide en cuatro contextos independientes:
  1. Contexto ITSM (Operaciones ITIL)
  2. Contexto Administracion y Catalogos
  3. Contexto Identidad y Control de Acceso
  4. Contexto Analitica y Auditoria
* **Estructura Interna por Contexto (Tres Capas Concentricas)**:
  1. **Domain (Nucleo)**:
     * Contiene las entidades puras del negocio y sus invariantes (ej. `Incidente.ts`, `TransicionEstado.ts`).
     * Define los **Puertos de Salida** (`IncidenteRepositoryPort.ts`, `NotificadorPort.ts`) mediante interfaces de TypeScript.
     * Cero dependencias externas: no importa nada de Next.js, React ni bibliotecas SQL.
  2. **Application (Casos de Uso)**:
     * Contiene los casos de uso especificos (ej. `CrearIncidenteUseCase.ts`, `ResolverIncidenteUseCase.ts`).
     * Orquesta el flujo: recibe un DTO, invoca el repositorio a traves de su interfaz y ejecuta las reglas del dominio.
  3. **Infrastructure (Adaptadores Secundarios)**:
     * Implementa las interfaces de los puertos. Por ejemplo, `PostgresIncidenteRepository.ts` escribe las consultas SQL reales usando `pg`.
* **Primary Adapters (Adaptadores Primarios / Driving)**:
  * La carpeta `src/app/` actua estrictamente como el adaptador primario exterior: recibe peticiones HTTP o eventos de usuario, invoca el caso de uso correspondiente y serializa el resultado.

---

### 3.2 Estructura Completa de Carpetas y Archivos (Opcion 2)

```text
FlowDesk-Software-ITSM/
|-- .env.local                                      // Variables de entorno de base de datos y llaves criptograficas
|-- .env.example                                    // Plantilla publica de configuracion para el equipo
|-- tsconfig.json                                   // Configurado con Path Aliases: @/contexts/*, @/shared/*
|-- next.config.js                                  // Configuracion base de Next.js
|-- package.json                                    // Declaracion de dependencias del proyecto
|-- README.md                                       // Documentacion general del proyecto
|-- DOCUMENTACIÓN/                                  // Guias de arquitectura, requerimientos y trazabilidad
|-- db/migrations/                                  // Scripts SQL de base de datos relacional
|
+-- src/
    |-- middleware.ts                               // Interceptor perimetral HTTP (filtra tokens antes de llegar a la aplicacion)
    |
    |-- app/                                        // ADAPTADOR PRIMARIO EXTERNO (DRIVING ADAPTERS - HTTP Y REACT)
    |   |-- layout.tsx                              // Layout raiz HTML
    |   |-- globals.css                             // Estilos globales
    |   |-- web/                                  // Adaptadores de Presentacion Web (Vistas React)
    |   |   |-- login/page.tsx                      // Vista web de login (llama a IniciarSesionUseCase)
    |   |   |-- plataforma/                          // Vistas privadas con layout protegido
    |   |       |-- layout.tsx                      // Layout del panel con barra de navegacion
    |   |       |-- itsm/                           // Vistas operativas de servicios ITIL
    |   |       |   |-- incidentes/page.tsx         // // Renderiza vista conectada a ListarIncidentesUseCase
    |   |       |   |-- incidentes/[id]/page.tsx    // // Renderiza vista conectada a ObtenerDetalleIncidenteUseCase
    |   |       |   |-- requerimientos/page.tsx     // // Renderiza vista conectada a ListarRequerimientosUseCase
    |   |       |   |-- problemas/page.tsx          // // Renderiza vista conectada a ListarProblemasUseCase
    |   |       |   +-- cambios/page.tsx            // // Renderiza vista conectada a ListarCambiosUseCase
    |   |       |-- admin/                          // Vistas de administracion de plataforma
    |   |       |   |-- usuarios/page.tsx           // // Renderiza vista conectada a ListarUsuariosUseCase
    |   |       |   |-- categorias/page.tsx         // // Renderiza vista conectada a GestionarCategoriasUseCase
    |   |       |   +-- sla/page.tsx                // // Renderiza vista conectada a ConfigurarSlaUseCase
    |   |       +-- analitica/                      // Vistas de reportes y auditoria
    |   |           |-- reportes/page.tsx           // // Renderiza vista conectada a GenerarReportesUseCase
    |   |           +-- auditoria/page.tsx          // // Renderiza vista conectada a ConsultarAuditoriaUseCase
    |   |
    |   +-- api/                                    // Adaptadores HTTP REST (Controladores de endpoints)
    |       |-- itsm/
    |       |   |-- incidentes/route.ts             // // Controlador HTTP: parsea JSON y llama a CrearIncidenteUseCase
    |       |   +-- incidentes/[id]/transicion/route.ts // // Controlador HTTP: llama a TransicionarIncidenteUseCase
    |       |-- admin/
    |       |   +-- categorias/route.ts             // // Controlador HTTP: llama a CrearCategoriaUseCase
    |       +-- auth/
    |           +-- login/route.ts                  // // Controlador HTTP: llama a AutenticarUsuarioUseCase
    |
    |-- contexts/                                   // BOUNDED CONTEXTS (NUCLEO DEL SISTEMA DIVIDIDO EN SUBDOMINIOS)
    |   |
    |   |-- itsm/                                   // CONTEXTO DELIMITADO: SERVICIOS OPERATIVOS ITIL
    |   |   |-- domain/                             // Capa de Dominio Puro (Cero dependencias externas)
    |   |   |   |-- entities/                       // Entidades ricas con metodos de negocio
    |   |   |   |   |-- Incidente.ts                // // Reglas de negocio: calculo de prioridad, validacion de cierre
    |   |   |   |   |-- Requerimiento.ts            // // Reglas de aprobacion de solicitudes
    |   |   |   |   |-- Problema.ts                 // // Reglas de documentacion de causa raiz y workaround
    |   |   |   |   +-- Cambio.ts                   // // Reglas de comite de cambios y evaluacion de riesgo
    |   |   |   |-- value-objects/                  // Objetos de valor inmutables
    |   |   |   |   |-- ImpactoUrgencia.ts          // // Validacion de combinacion de impacto y urgencia
    |   |   |   |   +-- EstadoTicket.ts             // // Invariante de transiciones legales de estado
    |   |   |   |-- ports/                          // Interfaces de puertos requeridos por el dominio (contratos)
    |   |   |   |   |-- IIncidenteRepository.ts     // // Interfaz: guardar(), buscarPorId(), listar(), actualizar()
    |   |   |   |   |-- IProblemaRepository.ts      // // Interfaz de persistencia de problemas
    |   |   |   |   +-- INotificadorService.ts      // // Interfaz para enviar notificaciones de tickets
    |   |   |   +-- exceptions/                     // Excepciones de negocio tipadas
    |   |   |       +-- TransicionInvalidaException.ts // // Error lanzado si se intenta cerrar un ticket sin resolver
    |   |   |
    |   |   |-- application/                        // Capa de Aplicacion (Casos de Uso de Negocio)
    |   |   |   |-- use-cases/                      // Orquestadores de acciones de usuario
    |   |   |   |   |-- CrearIncidenteUseCase.ts    // // Coordina validacion, calculo SLA, persistencia y notificacion
    |   |   |   |   |-- TransicionarIncidenteUseCase.ts // // Valida maquina de estados y persiste historial
    |   |   |   |   |-- ResolverProblemaUseCase.ts  // // Registra solucion conocida y cierra incidentes vinculados
    |   |   |   |   +-- AprobarCambioUseCase.ts     // // Registra voto favorable de miembros del comite CAB
    |   |   |   +-- dtos/                           // Objetos de transferencia de datos de entrada y salida
    |   |   |       |-- CrearIncidenteDTO.ts        // // Tipado estricto del payload de entrada
    |   |   |       +-- IncidenteResponseDTO.ts     // // Datos proyectados hacia la capa de presentacion
    |   |   |
    |   |   +-- infrastructure/                     // Capa de Infraestructura (Adaptadores Secundarios)
    |   |       |-- repositories/                   // Implementaciones de persistencia relacional
    |   |       |   |-- PostgresIncidenteRepository.ts // // Implementa IIncidenteRepository ejecutando SQL con pg
    |   |       |   +-- PostgresProblemaRepository.ts  // // Implementa IProblemaRepository con consultas pg
    |   |       |-- adapters/                       // Adaptadores de servicios externos
    |   |       |   +-- NodemailerNotificadorAdapter.ts // // Implementa INotificadorService usando nodemailer
    |   |       +-- mappers/                        // Mapeadores entre filas SQL y entidades de dominio
    |   |           +-- IncidenteMapper.ts          // // Convierte fila de tabla tickets en instancia de Incidente
    |   |
    |   |-- admin/                                  // CONTEXTO DELIMITADO: ADMINISTRACION Y MAESTROS
    |   |   |-- domain/
    |   |   |   |-- entities/
    |   |   |   |   |-- Usuario.ts                  // // Entidad de usuario con validaciones de clave y estado
    |   |   |   |   |-- CategoriaServicio.ts        // // Entidad categoria con reglas de unicidad
    |   |   |   |   +-- PoliticaSla.ts              // // Reglas de calculo de tiempos de atencion
    |   |   |   +-- ports/
    |   |   |       |-- IUsuarioRepository.ts       // // Contrato de persistencia de usuarios
    |   |   |       +-- ICategoriaRepository.ts     // // Contrato de persistencia de categorias
    |   |   |-- application/
    |   |   |   |-- use-cases/
    |   |   |   |   |-- CrearUsuarioUseCase.ts      // // Aplica hash de contrasena y guarda en base de datos
    |   |   |   |   +-- CrearCategoriaUseCase.ts    // // Valida que el nombre no este duplicado y persiste
    |   |   |   +-- dtos/
    |   |   |       +-- UsuarioDTO.ts
    |   |   +-- infrastructure/
    |   |       |-- repositories/
    |   |       |   |-- PostgresUsuarioRepository.ts // // Implementacion SQL sobre tabla usuarios
    |   |       |   +-- PostgresCategoriaRepository.ts // // Implementacion SQL sobre tabla categorias_servicios
    |   |       +-- mappers/
    |   |           +-- UsuarioMapper.ts
    |   |
    |   |-- identidad/                              // CONTEXTO DELIMITADO: AUTENTICACION Y SEGURIDAD
    |   |   |-- domain/
    |   |   |   |-- entities/
    |   |   |   |   +-- Credencial.ts
    |   |   |   +-- ports/
    |   |   |       |-- ITokenService.ts            // // Contrato para firma y decodificacion de JWT
    |   |   |       +-- ICaptchaProvider.ts         // // Contrato para generacion de retos visuales
    |   |   |-- application/
    |   |   |   +-- use-cases/
    |   |   |       +-- AutenticarUsuarioUseCase.ts // // Verifica clave con bcrypt y genera token
    |   |   +-- infrastructure/
    |   |       |-- adapters/
    |   |       |   |-- JwtTokenAdapter.ts          // // Implementa ITokenService usando jsonwebtoken
    |   |       |   +-- MemorySvgCaptchaAdapter.ts  // // Implementa ICaptchaProvider generando SVG matematico
    |   |       +-- security/
    |   |           +-- BcryptPasswordHasher.ts     // // Algoritmo de hash seguro de contrasenas
    |   |
    |   +-- analitica/                              // CONTEXTO DELIMITADO: REPORTES Y AUDITORIA
    |       |-- domain/
    |       |   +-- ports/
    |       |       +-- IAuditoriaRepository.ts
    |       |-- application/
    |       |   +-- use-cases/
    |       |       |-- GenerarReportesOperativosUseCase.ts
    |       |       +-- RegistrarEventoAuditoriaUseCase.ts
    |       +-- infrastructure/
    |           +-- repositories/
    |               +-- PostgresAuditoriaRepository.ts
    |
    +-- shared/                                     // KERNEL COMPARTIDO TRANSVERSAL
        |-- domain/                                 // Clases base compartidas
        |   |-- AggregateRoot.ts                    // // Clase base para agregados de dominio
        |   +-- Result.ts                           // // Patron Result (manejo funcional de exitos y fallos)
        |-- infrastructure/                         // Conexiones de bajo nivel
        |   +-- DatabaseConnectionPool.ts           // // Instancia singleton de conexion pg a PostgreSQL
        +-- ui/                                     // Componentes de interfaz genericos (botones, inputs, modales)
            |-- Boton.tsx
            |-- Input.tsx
            +-- Modal.tsx
```

---

### 3.3 Dinamica de Trabajo en Equipo y Prevencion de Conflictos en Git

* La estricta separacion entre Domain, Application e Infrastructure permite una distribucion de tareas muy formal:
  * Un integrante del equipo puede encargarse de modelar el dominio y los casos de uso (`itsm/domain/` e `itsm/application/`) definiendo los contratos (interfaces).
  * Otro integrante puede encargarse de implementar la persistencia en base de datos (`itsm/infrastructure/repositories/`) satisfaciendo los contratos de las interfaces.
  * Un tercer integrante puede construir la pantalla en Next.js (`src/app/` y componentes visuales) consumiendo los casos de uso a traves de sus DTOs.
* **Impacto en Git**: Excelente aislamiento entre subdominios (`contexts/itsm/` vs `contexts/admin/`). Sin embargo, para una misma funcionalidad, un solo desarrollador debe crear o modificar 5 a 6 archivos diferentes (Entidad, Interfaz Puerto, Caso de Uso, DTO, Repositorio SQL, Mapper y Ruta HTTP).

---

### 3.4 Evaluacion: Ventajas y Desventajas

#### Ventajas:
* **Maximo Desacoplamiento y Testabilidad**: Es la arquitectura mas facil de someter a pruebas unitarias puras, ya que el dominio y los casos de uso no dependen de la base de datos ni de Next.js.
* **Independencia Tecnologica Total**: Permite reemplazar PostgreSQL o el framework web en el futuro sin modificar las reglas de negocio de ITIL.
* **Claridad en Reglas Complejas**: Excelente si el sistema escala a un nivel enterprise con flujos de aprobacion muy intrincados.

#### Desventajas:
* **Alto Boilerplate y Sobrecarga Cognitiva**: Para operaciones sencillas de lectura o catalogos basicos (por ejemplo, listar categorias de servicios), la arquitectura obliga a pasar por 6 archivos intermedios, lo que puede resultar frustrante y excesivo para un equipo de estudiantes o un proyecto academico.
* **Curva de Aprendizaje Elevada**: Requiere que todos los companeros del equipo dominen conceptos avanzados de arquitectura (Inversion de Dependencias, DTOs, Mappers, Value Objects).

---

## 4. OPCION 3: ARQUITECTURA MODULAR EN CAPAS POR DOMINIO (LAYERED DOMAIN ARCHITECTURE)

### 4.1 Filosofia y Diseno Conceptual

Esta opcion toma la tradicional **Arquitectura en Capas (Layered Architecture)** de tres niveles (Presentacion, Negocio/Servicios y Datos) pero corrige su mayor defecto historico incorporando **subagrupacion por dominio dentro de cada capa**:

1. **Capa de Presentacion (`src/presentation/`)**:
   * Aloja la interfaz visual y el enrutador de Next.js (`src/app/`).
   * Los componentes de interfaz se dividen en carpetas por dominio: `itsm/` (tickets, paneles tecnicos), `admin/` (mantenimiento de usuarios, tablas maestras) y `shared/` (primitivos visuales).
2. **Capa de Negocio y Servicios (`src/business/`)**:
   * Aloja la logica de orquestacion, validaciones y reglas operativas.
   * Se divide estrictamente en submodulos de dominio: `itsm/` (servicios de incidentes, cambios, problemas), `admin/` (servicios de usuarios, perfiles, SLA), `security/` (autenticacion y tokens) y `analytics/` (reportes).
3. **Capa de Acceso a Datos / Persistencia (`src/data/`)**:
   * Aloja los objetos de acceso a datos (DAOs / Repositorios SQL directos con `pg`).
   * Contiene consultas parametrizadas agrupadas por entidad: `TicketDAO.ts`, `UsuarioDAO.ts`, `CategoriaDAO.ts`, `SlaDAO.ts`.
4. **Capa Transversal / Cross-Cutting (`src/crosscutting/`)**:
   * Infraestructura compartida: conexion a base de datos, envio de correos, funciones de fecha, tokens JWT y tipos compartidos.

---

### 4.2 Estructura Completa de Carpetas y Archivos (Opcion 3)

```text
FlowDesk-Software-ITSM/
|-- .env.local                                      // Parametros locales de conexion y llaves de cifrado
|-- .env.example                                    // Variables de entorno de referencia para colaboradores
|-- tsconfig.json                                   // Configurado con Path Aliases: @/presentation/*, @/business/*, @/data/*
|-- next.config.js                                  // Configuracion del entorno Next.js
|-- package.json                                    // Manifiesto de paquetes npm
|-- README.md                                       // Manual de inicio rapido
|-- DOCUMENTACIÓN/                                  // Documentacion y especificaciones del sistema
|-- db/migrations/                                  // Scripts SQL de esquemas de tablas y datos semilla
|
+-- src/
    |-- middleware.ts                               // Interceptor Edge perimetral de verificacion de sesion
    |
    |-- app/                                        // PARTE DE LA CAPA DE PRESENTACION (NEXT.JS ROUTING SHELL)
    |   |-- layout.tsx                              // Layout global de la aplicacion
    |   |-- globals.css                             // Estilos globales con Tailwind
    |   |-- page.tsx                                // Redireccion inicial /login o /dashboard
    |   |-- login/page.tsx                          // Pagina de acceso al sistema
    |   |-- plataforma/                                  // Rutas privadas agrupadas
    |   |   |-- layout.tsx                          // Layout privado con barra lateral y selector de perfil
    |   |   |-- dashboard/page.tsx                  // Tablero principal
    |   |   |-- incidentes/page.tsx                 // // Pagina: monta componentes de @/presentation/itsm/incidentes
    |   |   |-- requerimientos/page.tsx             // // Pagina: monta componentes de @/presentation/itsm/requerimientos
    |   |   |-- problemas/page.tsx                  // // Pagina: monta componentes de @/presentation/itsm/problemas
    |   |   |-- cambios/page.tsx                    // // Pagina: monta componentes de @/presentation/itsm/cambios
    |   |   |-- admin/usuarios/page.tsx             // // Pagina: monta componentes de @/presentation/admin/usuarios
    |   |   |-- admin/categorias/page.tsx           // // Pagina: monta componentes de @/presentation/admin/categorias
    |   |   +-- reportes/page.tsx                   // // Pagina: monta componentes de @/presentation/analytics/reportes
    |   |
    |   +-- api/                                    // Endpoints HTTP (Controladores delgados)
    |       |-- incidentes/route.ts                 // // Endpoint: llama a IncidenteService (capa business)
    |       |-- problemas/route.ts                  // // Endpoint: llama a ProblemaService (capa business)
    |       |-- admin/usuarios/route.ts             // // Endpoint: llama a UsuarioAdminService (capa business)
    |       |-- admin/categorias/route.ts           // // Endpoint: llama a CategoriaAdminService (capa business)
    |       +-- auth/login/route.ts                 // // Endpoint: llama a AuthService (capa business)
    |
    |-- presentation/                               // COMPONENTES DE INTERFAZ DE USUARIO (PRESENTACION PURA)
    |   |-- itsm/                                   // Componentes del dominio de servicios operativos ITIL
    |   |   |-- incidentes/                         // Componentes de visualizacion y edicion de incidentes
    |   |   |   |-- TablaIncidentes.tsx
    |   |   |   +-- ModalNuevoIncidente.tsx
    |   |   |-- requerimientos/
    |   |   |   +-- FormularioRequerimiento.tsx
    |   |   |-- problemas/
    |   |   |   +-- PanelGestionProblema.tsx
    |   |   |-- cambios/
    |   |   |   +-- PanelAprobacionCAB.tsx
    |   |   +-- presentadores/                      // Presentadores condicionales segun el rol del usuario
    |   |       |-- PresentadorConsumidor.tsx
    |   |       |-- PresentadorOperador.tsx
    |   |       +-- PresentadorSupervisor.tsx
    |   |
    |   |-- admin/                                  // Componentes de administracion y maestros
    |   |   |-- usuarios/
    |   |   |   +-- TablaUsuarios.tsx
    |   |   |-- categorias/
    |   |   |   +-- TablaCategorias.tsx
    |   |   +-- sla/
    |   |       +-- MatrizSla.tsx
    |   |
    |   +-- shared/                                 // Componentes de presentacion comunes
    |       |-- Boton.tsx
    |       |-- Input.tsx
    |       |-- Modal.tsx
    |       +-- MenuLateral.tsx
    |
    |-- business/                                   // CAPA DE LOGICA DE NEGOCIO Y SERVICIOS ORQUESTADORES
    |   |-- itsm/                                   // Logica de negocio de procesos ITIL
    |   |   |-- IncidenteService.ts                 // // Valida impacto/urgencia, calcula SLA y llama a TicketDAO
    |   |   |-- RequerimientoService.ts             // // Orquesta aprobaciones y llama a TicketDAO
    |   |   |-- ProblemaService.ts                  // // Asocia incidentes y gestiona estado de problemas
    |   |   +-- CambioService.ts                    // // Controla aprobaciones del comite CAB
    |   |
    |   |-- admin/                                  // Logica de negocio administrativa
    |   |   |-- UsuarioAdminService.ts              // // Hashea contrasenas con bcrypt y llama a UsuarioDAO
    |   |   |-- CategoriaAdminService.ts            // // Valida que no exista duplicado y llama a CategoriaDAO
    |   |   +-- SlaAdminService.ts                  // // Aplica reglas de calculo de tiempos de servicio
    |   |
    |   |-- security/                               // Logica de seguridad e identidad
    |   |   |-- AuthService.ts                      // // Valida credenciales, genera JWT y controla reintentos
    |   |   +-- CaptchaService.ts                   // // Genera reto matematico y verifica resultado en sesion
    |   |
    |   +-- analytics/                              // Logica de generacion de reportes y auditoria
    |       |-- ReporteService.ts                   // // Consolida datos para graficos de rendimiento
    |       +-- AuditoriaService.ts                 // // Registra eventos de seguridad en log persistente
    |
    |-- data/                                       // CAPA DE ACCESO A DATOS (DATA ACCESS OBJECTS - DAOS CON SQL)
    |   |-- daos/                                   // Consultas SQL directas parametrizadas sobre PostgreSQL
    |   |   |-- TicketDAO.ts                        // // SELECT, INSERT, UPDATE en tabla tickets y sus detalles
    |   |   |-- UsuarioDAO.ts                       // // Consultas sobre usuarios, perfiles y departamentos
    |   |   |-- CategoriaDAO.ts                     // // Consultas CRUD sobre tabla categorias_servicios
    |   |   |-- SlaDAO.ts                           // // Consultas sobre politicas y matrices de SLA
    |   |   |-- AuditoriaDAO.ts                     // // Insercion y lectura sobre tabla log_auditoria
    |   |   +-- ConfiguracionDAO.ts                 // // Lectura y escritura en tabla configuraciones
    |   +-- mappers/                                // Mapeadores entre filas brutas de la base de datos e interfaces
    |       |-- TicketRowMapper.ts
    |       +-- UsuarioRowMapper.ts
    |
    +-- crosscutting/                               // RECURSOS COMPARTIDOS TRANSVERSALES
        |-- database/
        |   +-- dbPool.ts                           // Pool de conexiones pg a PostgreSQL
        |-- email/
        |   +-- mailer.ts                           // Cliente de envio de correo transaccional
        |-- security/
        |   +-- jwtHelper.ts                        // Funciones auxiliares de codificacion de tokens
        |-- validation/
        |   +-- sanitizadores.ts                    // Funciones universales de limpieza de strings
        +-- types/
            +-- domainTypes.ts                      // Interfaces globales de entidades y contratos
```

---

### 4.3 Dinamica de Trabajo en Equipo y Prevencion de Conflictos en Git

* **Dinamica**: Es el modelo clasico mas intuitivo para desarrolladores que provienen de entornos como Java Spring Boot, C# .NET o Express.js estructurado:
  * Si un companero crea una funcionalidad nueva (ej. "Modulo de Encuestas"):
    * Agrega `EncuestaDAO.ts` en `src/data/daos/`.
    * Agrega `EncuestaService.ts` en `src/business/admin/`.
    * Agrega sus componentes en `src/presentation/admin/encuestas/`.
    * Agrega su ruta en `src/app/plataforma/admin/encuestas/page.tsx`.
* **Impacto en Git**: Si dos desarrolladores tocan entidades de tickets al mismo tiempo (ejemplo: uno modifica incidentes y otro solicitudes), ambos podrian editar `TicketDAO.ts` para agregar nuevas consultas SQL, lo cual **si puede generar un conflicto de fusion en Git** en dicho archivo compartido. Esto se resuelve subdividiendo los DAOs si el proyecto crece (`IncidenteDAO.ts`, `RequerimientoDAO.ts`).

---

### 4.4 Evaluacion: Ventajas y Desventajas

#### Ventajas:
* **Estructura Muy Familiar**: Sigue el patron tradicional de tres capas (Presentacion, Negocio, Datos) con el que la mayoria de los estudiantes de informatica e ingenieria estan familiarizados desde la universidad.
* **Separacion Clara de Responsabilidades Tecnicas**: El codigo SQL vive exclusivamente dentro de `src/data/daos/`, la logica de negocio en `src/business/` y la UI en `src/presentation/`.
* **Menos Boilerplate que Clean Architecture**: No requiere definir puertos/interfaces abstractas para cada entidad si no se va a cambiar de motor de base de datos.

#### Desventajas:
* **Baja Cohesion Espacial**: Para trabajar en una funcionalidad concreta (ej. "Incidentes"), el programador debe alternar continuamente entre `src/presentation/itsm/incidentes/`, `src/business/itsm/IncidenteService.ts`, `src/data/daos/TicketDAO.ts` y `src/app/api/incidentes/route.ts`.
* **Riesgo de DAOs Monoliticos**: Archivos como `TicketDAO.ts` pueden acumular cientos de lineas de metodos SQL de diferentes tipos de ticket, convirtiendose en cuellos de botella para el equipo.

---

## 5. ARCHIVOS EXTERNOS AL DIRECTORIO SRC Y CONFIGURACION DEL PROYECTO

Cualquiera de las tres opciones requiere que los archivos de configuracion en la raiz del proyecto esten correctamente alineados con la jerarquia elegida:

### 5.1 Configuracion de Path Aliases en tsconfig.json

Para evitar importaciones relativas fragiles y tediosas (como `../../../../shared/lib/db`), se deben configurar alias de rutas en `tsconfig.json`.

Ejemplo de configuracion recomendada para la **Opcion 1**:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/modules/*": ["./src/modules/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/itsm/*": ["./src/modules/itsm/*"],
      "@/admin/*": ["./src/modules/admin/*"],
      "@/seguridad/*": ["./src/modules/seguridad/*"],
      "@/analitica/*": ["./src/modules/analitica/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Con esta configuracion:
* Para importar el servicio de incidentes desde un endpoint:
  `import { incidentesService } from "@/itsm/incidentes/services/incidentesService";`
* Para importar la conexion de base de datos:
  `import { query } from "@/shared/lib/db";`
* Para importar un boton generico:
  `import { Boton } from "@/shared/components/ui/Boton";`

---

### 5.2 Variables de Entorno, Scripts y Persistencia SQL

Los archivos externos a `src/` cumplen funciones criticas de soporte que deben preservarse:

* **`.env.local`**: Contiene secretos sensibles que no deben subirse a Git (credenciales de conexion PostgreSQL `DATABASE_URL`, secreto de firma JWT `JWT_SECRET`, credenciales SMTP para correos).
* **`.env.example`**: Archivo de ejemplo versionado en Git que indica al equipo que variables deben configurar en su propia maquina.
* **`next.config.js`**: Configuracion del compilador de Next.js. Si se utilizan componentes de servidor y cliente con paquetes externos, aqui se configuran las politicas de transpiled packages o cabeceras de seguridad HTTP.
* **`package.json`**: Manifiesto de dependencias. Contiene scripts utiles como `npm run dev`, `npm run build`, `npm run lint`.
* **`db/migrations/`**: Carpeta donde se deben almacenar los scripts SQL versionados (`001_crear_tablas_iniciales.sql`, `002_agregar_categorias_servicios.sql`, etc.) para que todos los companeros de equipo puedan tener exactamente la misma estructura de base de datos en su PostgreSQL local.

---

## 6. MATRIZ COMPARATIVA Y EVALUACION TECNICA MULTICRITERIO

La siguiente matriz evalua cuantitativamente las tres opciones segun los criterios mas importantes para el equipo de desarrollo de FlowDesk ITSM (escala de 1 a 5, donde 5 es el maximo nivel de satisfaccion):

| Criterio de Evaluacion | Opcion 1: Vertical Slice + Feature Folders | Opcion 2: Clean / Hexagonal Bounded Contexts | Opcion 3: Modular Layered by Domain |
|---|:---:|:---:|:---:|
| **Alineacion con Next.js 14 App Router** | **5 / 5** (Optima: Thin Router + Features) | **3 / 5** (Media: fuerza adaptadores artificiales) | **4 / 5** (Buena: presentacion separada) |
| **Prevencion de Conflictos en Git (Merge)** | **5 / 5** (Maxima: cada companero toca su carpeta) | **4 / 5** (Alta, pero muchos archivos por feature) | **3 / 5** (Media: DAOs y servicios compartidos) |
| **Cohesion Espacial (Cosas que cambian juntas)** | **5 / 5** (Toda la feature esta en su directorio) | **2 / 5** (Dispersa entre Domain, App e Infra) | **3 / 5** (Dispersa entre Presentation, Business, Data) |
| **Curva de Aprendizaje para el Equipo** | **5 / 5** (Intuitiva y facil de explicar) | **2 / 5** (Muy empinada: interfaces, mappers, DTOs) | **4 / 5** (Familiar para desarrolladores tradicionales) |
| **Esfuerzo de Refactorizacion desde el Estado Actual** | **4 / 5** (Moderado: mover archivos a carpetas logicas) | **1 / 5** (Masivo: reescribir todo con puertos y DTOs) | **3 / 5** (Moderado-Alto: separar DAOs y Servicios) |
| **Testabilidad e Independencia Tecnologica** | **4 / 5** (Muy buena a nivel de servicios) | **5 / 5** (Absoluta: desacoplamiento total) | **3 / 5** (Aceptable si se usan mocks) |
| **Claridad en la Separacion ITSM vs. Admin** | **5 / 5** (Separacion fisica directa en carpetas) | **5 / 5** (Separacion formal en Bounded Contexts) | **4 / 5** (Separacion dentro de cada capa) |
| **PUNTUACION TOTAL PONDERADA** | **33 / 35 (94%)** | **22 / 35 (63%)** | **24 / 35 (69%)** |

---

## 7. RECOMENDACION DEFINITIVA Y PLAN DE MIGRACION GRADUAL SIN DISRUPCION

### 7.1 Conclusion Razonada: Por que la Opcion 1 es la Eleccion Optima

La **Opcion 1 (Vertical Slice Architecture + Feature Folders con Dominios Funcionales)** es la opcion ampliamente recomendada para FlowDesk ITSM por las siguientes razones de ingenieria:

1. **Satisface con precision el requerimiento del proyecto**:
   Permite agrupar los servicios operativos ITIL (`incidentes`, `requerimientos`, `problemas`, `cambios`, `tareas`, `catalogo`) bajo el paraguas comun `src/modules/itsm/`, manteniendolos estrictamente separados de `src/modules/admin/`, `src/modules/seguridad/` y `src/modules/analitica/`.
2. **Elimina la pesadilla de los conflictos de Git entre companeros**:
   Al asignar a cada companero un modulo funcional especifico, sus ramas de Git nunca colisionaran entre si porque trabajaran en carpetas fisicamente independientes.
3. **No introduce sobreingenieria innecesaria**:
   A diferencia de la Arquitectura Hexagonal pura (Opcion 2), que requiere crear 6 archivos para registrar una categoria simple, la Opcion 1 mantiene la agilidad del desarrollo fullstack de Next.js sin sacrificar orden ni arquitectura.
4. **Respeta la filosofia de Next.js 14**:
   Al implementar el patron de `Thin Router`, los archivos dentro de `src/app/` se convierten en controladores ligeros y limpios, facilitando el mantenimiento y la lectura del codigo.

---

### 7.2 Plan de Migracion Gradual en 5 Fases (Sin Romper el Sistema)

Para migrar el proyecto actual hacia la **Opcion 1** de forma segura, se recomienda seguir este plan gradual sin detener el desarrollo de nuevas caracteristicas:

#### Fase 1: Configuracion de Infraestructura y Path Aliases (Dia 1)
* Actualizar `tsconfig.json` agregando los alias `@/modules/*`, `@/shared/*`, `@/itsm/*`, `@/admin/*`, `@/seguridad/*`.
* Crear las carpetas base:
  * `src/modules/itsm/`
  * `src/modules/admin/`
  * `src/modules/seguridad/`
  * `src/modules/analitica/`
  * `src/shared/`

#### Fase 2: Extraccion de Modulos Transversales y Seguridad (Dia 2)
* Mover `src/lib/db.ts`, `src/lib/sla.ts`, `src/lib/email.ts`, `src/lib/validaciones.ts` a `src/shared/lib/`.
* Mover `src/components/ui/` y componentes genericos a `src/shared/components/`.
* Consolidar la autenticacion (`login`, `captcha`, `jwt`, `sesion`) en `src/modules/seguridad/`.

#### Fase 3: Migracion de Modulos de Administracion (Dia 3)
* Organizar la carpeta `src/modules/admin/`:
  * Mover la logica y componentes de usuarios a `src/modules/admin/usuarios/`.
  * Mover la logica y componentes de categorias a `src/modules/admin/categorias/`.
  * Mover la logica de SLA a `src/modules/admin/sla/`.
* Adelgazar los endpoints de `src/app/api/admin/` haciendo que deleguen en los nuevos servicios.

#### Fase 4: Migracion del Dominio Operativo ITSM (Dia 4)
* Organizar la carpeta `src/modules/itsm/`:
  * Crear las rebanadas verticales de `incidentes`, `requerimientos`, `problemas`, `cambios`, `tareas` y `catalogo`.
  * Mover los presentadores polimorficos (`PresentadorConsumidor.tsx`, `PresentadorOperador.tsx`, etc.) a `src/modules/itsm/presentadores/`.
* Adelgazar los endpoints de `src/app/api/tickets/` y subrutas de tickets.

#### Fase 5: Limpieza, Verificacion de Tipos y Pruebas de Integracion (Dia 5)
* Ejecutar comprobacion estricta de TypeScript: `npx tsc --noEmit`.
* Probar el flujo completo de usuario en navegador: login con captcha, cambio de perfil activo, creacion de ticket de catalogo, atencion tecnica y cierre.
* Publicar los cambios en la rama principal de Git y documentar para todo el equipo.
