# Indice Maestro de Documentacion del Sistema

En este directorio se compila la documentacion tecnica, metodologica, de requisitos y de auditoria del Sistema de Gestion de Tickets y Servicios de TI. **ITIL 4, ISO/IEC 20000-1:2018, COBIT 2019 e ISO/IEC 27001:2022 se usan como marcos de orientacion y contraste; esta documentacion no certifica conformidad.**

> **Estado actual frente al objetivo:** [Modelo objetivo de menú y rutas ITSM](modelo_objetivo_menu_y_rutas_itsm.md) registra la jerarquía objetivo. [Registro de ejecución por fases ITSM](registro_ejecucion_fases_itsm.md) distingue las fases aplicadas y verificadas de las capacidades pendientes. Las matrices y documentos de requisitos conservan partes del estado previo; deben reconciliarse cuando se cierre la implementación para no presentar propuestas como funcionalidades ya disponibles.

---

## Catalogo de Documentos

### 1. Ingenieria de Software y Metodologias
- **[Catalogo de Reglas de Negocio](reglas_de_negocio.md)**
  - *Descripcion:* Documento independiente con las 30 Reglas de Negocio (RN-01 a RN-30) ordenadas en los 5 dominios jerarquicos del sistema, redactadas en lenguaje del cliente y politicas organizacionales sin tecnicismos de programador.
- **[Especificacion de Requerimientos Funcionales](requerimientos_funcionales.md)**
  - *Descripcion:* Documento modular con los 27 Requerimientos Funcionales (RF-01 a RF-27) agrupados por dominio, detallando las capacidades entregadas al usuario, reglas vinculadas y roles autorizados.
- **[Especificacion de Requerimientos No Funcionales](requerimientos_no_funcionales.md)**
  - *Descripcion:* Documento enfocado en la calidad percibida del sistema bajo 6 categorias (RNF-01 a RNF-06): privacidad, seguridad, rapidez, adaptacion responsive, amabilidad y presentacion profesional.
- **[Mapa de Epicas, Historias de Usuario y Criterios BDD](historias_de_usuario.md)**
  - *Descripcion:* Backlog completo con 5 Epicas (EPI-01 a EPI-05), 26 Historias de Usuario atomicas (HU-01 a HU-26) sin conjuncion "Y" en sus titulos, criterios de aceptacion BDD Gherkin concisos y matriz de trazabilidad bidireccional.
- **[Especificacion Consolidada de Requerimientos y Artefactos Agiles](especificacion_requerimientos_artefactos_agiles.md)**
  - *Descripcion:* Documento maestro que compila de manera integrada las reglas de negocio, requerimientos funcionales, requerimientos no funcionales, historias de usuario y matriz de trazabilidad general.
- **[Guia Metodologica Integral de Desarrollo ITSM](guia_metodologica_desarrollo_itsm.md)**
  - *Descripcion:* Guia exhaustiva de ciclo de vida completo (SDLC) para software de mesa de servicio empresarial. Cubre investigacion previa y viabilidad TELOS, marcos agiles hibridos (Scrumban, XP, TDD, CI/CD), diseno con Domain-Driven Design (DDD) y Clean Architecture, y matriz comparativa entre el Sistema Ideal y el Sistema Desarrollado.

---

### 2. Cumplimiento Normativo y Auditoria
- **[Catálogo general de opciones de menú ITSM](catalogo_general_opciones_menu_itsm.md)**
  - *Descripcion:* Catálogo maestro sincronizado con la base activa (67 opciones, nueve perfiles), decisiones para las capacidades ITSM y estado de ejecución de los cinco pasos de navegación.
- **[Modelo objetivo de menú y rutas ITSM](modelo_objetivo_menu_y_rutas_itsm.md)**
  - *Descripción:* Especificación del paso 1 para separar configuración administrativa, módulos operativos, catálogo, rutas frontend/API, grupos de soporte y límites de configuración. Pendiente de aplicación gradual al software.
- **[Registro de ejecución por fases ITSM](registro_ejecucion_fases_itsm.md)**
  - *Descripción:* Estado verificable de las fases ejecutadas: alcance por perfil, módulos independientes de incidentes y solicitudes, audiencia del catálogo, cambios en menú y brechas pendientes de formularios por servicio, CMDB, notificaciones y documentación.
- **[Matriz de menú, vistas y acciones por perfil](matriz_menu_y_vistas_por_rol_2026-10-01.md)**
  - *Descripcion:* Opciones visibles y límites de cada uno de los nueve perfiles, diferencias de vista/acciones por tipo de expediente y comprobaciones visuales pendientes.

- **[Auditoría integral del estado ITSM (2026-09-30)](auditoria_integral_estado_itsm_2026-09-30.md)**
  - *Descripcion:* Revision estatica del repositorio, permisos/API, nueve roles y vistas, modelo de datos, documentacion y brechas frente a ITIL 4, ISO/IEC 20000-1, ISO/IEC 27001, COBIT, NIST CSF, OWASP ASVS e ISO/IEC 25010. Incluye menu objetivo, hallazgos priorizados y plan de remediacion; no es certificacion ni prueba de ejecucion.

- **[Auditoria Integral de Cumplimiento Normativo del Sistema](itil_auditoria_normativa_sistema.md)**
  - *Descripcion:* Auditoria tecnica y formal de las 4 etapas del sistema (Autenticacion y RBAC, Catalogo y Workflows, Departamentos y Tecnicos, Definicion de Tickets y SLA). Incluye evaluacion detallada clausula por clausula de ISO/IEC 20000-1:2018 (Clausulas 4 a 10), practicas medulares de ITIL v4, dominios de gobierno COBIT 2019 (DSS, APO, MEA), controles del Anexo A de ISO/IEC 27001:2022, matriz de cumplimiento cruzado, evidencias en codigo/base de datos, analisis de brechas (GAP) y dictamen formal de conformidad.

- **[Analisis ITIL del Sistema](analisis-itil.md)**
  - *Descripcion:* Analisis conceptual y diagnostico de alineacion a las cuatro dimensiones de la gestion del servicio de ITIL v4 y su Sistema de Valor del Servicio (SVS).

- **[Justificacion Tecnica de Cambios](itil_justificacion_cambios.md)**
  - *Descripcion:* Sustentacion teorica y practica de las decisiones de diseno arquitectonico adoptadas para la transicion hacia el estandar ITIL v4.

---

### 3. Catalogo de Servicios y Procesos de Atencion
- **[Catalogo Corporativo de Servicios Completo](itil_catalogo_servicios_completo.md)**
  - *Descripcion:* Definicion detallada de los 18 servicios del catalogo clasificados en 4 familias operativas (Identidad y Accesos, Equipamiento ITAM, Redes e Infraestructura, Software Empresarial), con sus codigos nemotecnicos, criticidad, SLAs de respuesta y resolucion, compuertas de aprobacion y workflows operativos paso a paso.

- **[Analisis del Catalogo de Servicios](itil_catalogo_servicios_analisis.md)**
  - *Descripcion:* Estudio de distribucion de demanda, tiempos de respuesta, roles aprobadores requeridos y costos estimados por familia de servicio.

---

### 4. Registro de Implementacion y Evolucion
- **[Resumen Consolidado de las 4 Etapas (Walkthrough)](walkthrough.md)**
  - *Descripcion:* Registro pormenorizado de los cambios implementados en la base de datos PostgreSQL, tipos TypeScript, endpoints de backend en Next.js, interfaces de usuario y resultados de pruebas de compilacion de produccion.

