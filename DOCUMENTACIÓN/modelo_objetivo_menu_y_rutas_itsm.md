# Modelo objetivo de menú y rutas ITSM

**Versión:** 1 de octubre de 2026  
**Estado:** modelo objetivo con aplicación parcial en desarrollo. Las rutas `/incidentes` y `/solicitudes`, los límites de acceso descritos en el registro de ejecución y parte del menú ya están aplicados; aún faltan las páginas de configuración de proceso y varias rutas objetivo. No afirmar como aplicada en producción sin desplegar y verificar allí.  
**Propósito:** fijar la separación entre configuración administrativa, operación de procesos y consulta analítica antes de cambiar permisos o código.

## 1. Decisiones del modelo

1. Incidentes, solicitudes de servicio, problemas y cambios son procesos y expedientes diferenciados. Pueden relacionarse entre sí y compartir servicios técnicos, pero no deben aparecer como simples tipos de un único módulo genérico.
2. Cada proceso tiene una entrada operativa propia para los perfiles autorizados. La ruta de pantalla representa ese espacio de trabajo.
3. La configuración de un proceso es otra página, bajo **Configuración**, accesible al Administrador. No convierte al Administrador en operador ni le concede aprobación sobre casos.
4. Formularios, vistas y acciones se configuran sobre una plantilla de proceso, tipo de solicitud o servicio publicado y perfil/criterio de audiencia. Se puede previsualizar como una persona real. Las excepciones por usuario deben ser deliberadas y auditables.
5. Los botones representan acciones autorizadas y transiciones válidas del flujo. No se ofrecen botones arbitrarios que permitan saltarse la lógica del proceso.
6. El catálogo de consumo publica incidentes reportables y ofertas de solicitudes de servicio. Problemas y cambios tienen sus procesos propios; una solicitud de servicio estándar puede iniciar una actividad preaprobada cuando las reglas organizacionales así lo definan.
7. La configuración del Administrador, el trabajo de los responsables de proceso y la aprobación de CAB son responsabilidades distintas. Un usuario con varios perfiles usa el perfil activo correspondiente.
8. Las rutas de frontend reflejan módulos, pero no obligan a duplicar autenticación, auditoría o componentes compartidos. La API y la lógica de dominio sí deben distinguir recursos, permisos y validaciones por proceso.

## 2. Menú objetivo del Administrador

Configuración aparece primero. Reportes y Analítica aparece después. Los módulos operativos se muestran como entradas independientes solo cuando el perfil activo tenga trabajo autorizado en ellos.

- **Configuración** (`/configuracion`)
  - **Identidades y accesos**
    - Gestión de usuarios
    - Perfiles y permisos
    - Estructura del menú
  - **Catálogo de servicios y SLAs**
    - Incidentes reportables
    - Ofertas de solicitudes de servicio
    - Categorías, publicación y audiencia
    - SLA de respuesta y resolución
  - **Configuración de procesos**
    - **Incidentes**
      - Formulario base y campos
      - Vista previa y visibilidad por perfil
      - Flujo, transiciones y acciones
      - Reglas de notificación del proceso
    - **Solicitudes de servicio**
      - Formularios por oferta del catálogo
      - Vista previa y visibilidad por perfil
      - Flujo de cumplimiento y aprobaciones
      - Reglas de notificación del proceso
    - **Gestión de cambios**
      - Formulario RFC, tipos y requisitos
      - Flujo de evaluación, autorización y revisión posterior
      - Calendario y reglas de notificación
    - **Gestión de problemas**
      - Formulario y campos
      - Flujo de investigación, errores conocidos y revisión
      - Reglas de notificación
  - **Organización y soporte**
    - Departamentos empresariales
    - Grupos resolutores y departamentos de TI
    - Técnicos, especialidades y niveles de soporte
    - Supervisores de TI
  - **Activos y configuración**
    - Tipos, modelos y atributos de activos
    - Ciclos de vida y reglas de transición
    - Licencias y contratos
    - Clases de CI y tipos de relación CMDB
  - **Comunicaciones y notificaciones**
    - Plantillas de correo y mensajes
    - Canales e integraciones
    - Variables y eventos admitidos
  - **Gobierno del conocimiento**
    - Categorías, responsables y audiencias
    - Revisión, publicación, vigencia y archivo
  - **Auditoría, seguridad y retención**
    - Auditoría funcional
    - Eventos de seguridad y autenticación
    - Retención y mantenimiento de datos
- **Reportes y Analítica**
  - Indicadores operativos
  - Cumplimiento y tendencias de SLA
  - Diseñador de tableros (cuando persista y aplique su configuración)

### 2.1 Módulos operativos independientes

Estas son entradas de navegación para los perfiles que operan o consultan cada práctica; no se anidan debajo de una página llamada “Tickets” o “Gestión”. La asignación exacta a los nueve perfiles se determina en una fase posterior.

- Incidentes
- Solicitudes de servicio
- Gestión de cambios
- Gestión de problemas
- Activos de TI
- CMDB
- Conocimiento / ayuda, con contenido distinto según audiencia
- Operación de eventos y otras capacidades ITSM que el sistema soporte
- Bandeja unificada opcional para perfiles de despacho/supervisión y auditoría; reúne registros heterogéneos sin convertirlos en un solo tipo de expediente.

## 3. Rutas objetivo

Las rutas siguientes distinguen el objetivo de algunas rutas ya existentes. Las nuevas opciones no deben habilitarse en el menú hasta que cada página y autorización correspondiente estén listas.

| Área | Ruta de pantalla propuesta |
|---|---|
| Incidentes operativo | `/incidentes` (aplicada) |
| Solicitudes operativo | `/solicitudes` (aplicada) |
| Cambios operativo | `/cambios` (existente) |
| Problemas operativo | `/problemas` (existente) |
| Inventario ITAM | `/activos` (existente) |
| CMDB | `/activos/cmdb` (existente; el objetivo lógico era `/cmdb`) |
| Catálogo de consumo | `/tickets/catalogo` (existente; el objetivo lógico era `/catalogo`) |
| Configuración del sistema | `/admin` (etiqueta visible “Configuración”; `/configuracion` sigue siendo destino propuesto) |
| Configuración de formulario de incidentes | `/configuracion/procesos/incidentes/formulario` |
| Configuración de solicitudes | `/configuracion/procesos/solicitudes` |
| Configuración de RFC | `/configuracion/procesos/cambios/rfc` |
| Configuración de problemas | `/configuracion/procesos/problemas` |
| Indicadores | `/tickets/reportes` (existente; `/reportes` sigue siendo destino propuesto) |

La correspondencia actual y las capacidades que faltan se registran en [registro de ejecución por fases ITSM](registro_ejecucion_fases_itsm.md). Mantener por ahora las rutas legacy evita romper enlaces mientras se implementan las vistas de configuración y se migra gradualmente la navegación.

Las API deberían distinguir recursos y reglas, por ejemplo `/api/incidentes`, `/api/solicitudes`, `/api/cambios`, `/api/problemas`, `/api/activos` y `/api/cmdb`. La configuración vive en endpoints separados, por ejemplo `/api/configuracion/procesos/incidentes`. El detalle de si la persistencia usa tablas comunes con tipos/subtipos o tablas específicas se decide al revisar el modelo de datos; no se presume que cada pantalla requiera una base de datos aparte.

## 4. Límites de configuración

- **Por perfil/rol:** permisos de lectura, campos, secciones y acciones disponibles.
- **Por oferta del catálogo:** campos requeridos, documentos, audiencias, aprobación, fulfillment y SLA que correspondan a esa oferta.
- **Por flujo y estado:** acciones disponibles en cada transición y quién puede ejecutarlas.
- **Por persona:** solo excepciones explícitas; la vista previa por usuario es válida, pero no equivale a crear una política distinta para cada empleado.
- **Por evento de negocio:** el proceso define cuándo notificar y a quién; Comunicaciones define el contenido de la plantilla y las conexiones de canales.
- **Por expediente:** la historia del caso registra quién hizo qué y cuándo. La auditoría central conserva cambios administrativos y eventos de seguridad; ambos registros no sustituyen la cronología del expediente.
- **ITAM/CMDB:** Administración define taxonomías y reglas maestras; el Gestor de Activos y Configuración mantiene los registros de activos, licencias, proveedores y CI en su función operativa.

## 5. Organización de los equipos de TI

ITIL no prescribe una cantidad obligatoria de niveles de soporte, ni exige que Nivel 3 esté compuesto exclusivamente por ingenieros. Se conserva la propuesta operativa como grupos resolutores con capacidad/nivel:

- Nivel 1: Mesa de ayuda y triage.
- Nivel 2: Soporte de sitio y hardware.
- Nivel 3: Sistemas/Infraestructura/Cloud; Redes/Conectividad/Telefonía; Ciberseguridad/Identidades.

Los especialistas se registran como técnicos con grupo, especialidad, capacidad y nivel. Supervisor es una función/perfil de supervisión que puede dirigir uno o varios grupos; no es un nivel adicional por defecto. Los departamentos empresariales (Finanzas, Legal, Ventas, etc.) son distintos de estos grupos de TI. El Gestor de Área se limita al departamento empresarial que tenga asignado.

## 6. Diferencia frente al estado actual

El inventario previo documenta 67 opciones activas en la base. El código actual incluye rutas antiguas para incidentes y solicitudes bajo `/tickets/gestion/`, rutas propias para cambios y problemas, páginas de activos/CMDB, y páginas administrativas de catálogo, RFC, formularios y vistas. El menú y las rutas todavía no reflejan uniformemente este modelo.

La especificación existente de formularios y vistas persiste configuración, pero el análisis previo encontró que esos valores no controlan todavía las fichas reales en runtime. No debe presentarse como configuración efectiva hasta conectar interfaz, API y validaciones.

Este documento fija el objetivo de navegación. El paso siguiente es inventariar qué páginas/APIs ya cumplen, asignar permisos por perfil y preparar migraciones de rutas sin romper enlaces ni dejar opciones activas que conduzcan a páginas inexistentes.

## 7. Criterios de aceptación del paso 1

- Configuración está primero en el menú del Administrador y reportes después.
- Las opciones operativas Incidentes, Solicitudes, Cambios y Problemas son módulos raíz independientes.
- Cada proceso dispone de un espacio de configuración administrativa separado de su cola operativa.
- Catálogo y SLA incluyen solamente las ofertas al consumidor; problemas/cambios conservan sus expedientes propios.
- Activos/CMDB distinguen configuración maestra de mantenimiento operativo.
- Toda opción que se muestre debe tener una página funcional y una política de acceso correspondiente antes de activarse.

## Referencias de orientación

- [PeopleCert — prácticas ITIL 4](https://www.peoplecert.org/ITIL4-practices)
- [PeopleCert — Change Enablement](https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-4-practitioner-change-enablement-3794)
- [Atlassian — categorías de trabajo ITSM](https://support.atlassian.com/jira-service-management-cloud/docs/manage-your-request-types-and-ticket-categories/)
- [Atlassian — tipos de solicitud, formularios y flujos](https://www.atlassian.com/software/jira/service-management/product-guide/getting-started/quick-start-guide)
- [ServiceNow — catálogo y relación con CI](https://www.servicenow.com/docs/r/servicenow-platform/service-catalog/request-cat-use-case.html)

Estas fuentes respaldan prácticas y patrones de producto, no exigen una jerarquía concreta de menú ni certifican este sistema.
