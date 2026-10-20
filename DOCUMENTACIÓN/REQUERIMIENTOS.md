# Requerimientos, Reglas de Negocio y Criterios de Calidad — FlowDesk ITSM

> **Versión:** 3.0 · **Fecha:** 2026-10-19 · **Estado:** vigente.
> **Alcance:** especificación funcional, criterios no funcionales y reglas de negocio del sistema, consolidados en un solo documento. La trazabilidad detallada vive en `TRAZABILIDAD.md`; las historias de usuario en `HISTORIAS_DE_USUARIO.md`.

Este documento reemplaza a `requerimientos_funcionales.md`, `requerimientos_no_funcionales.md` y `reglas_de_negocio.md`. Se conservaron los catálogos y criterios de aceptación de los tres documentos, actualizados al estado del sistema al 2026-10-19 (separación Incidentes/Solicitudes, catálogos en Servicios y reportes centralizados).

---

## Parte I — Requerimientos Funcionales

## Informacion del Documento y Roles Oficiales

- **Proyecto:** Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITSM)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Concepto Fundamental de Requerimiento Funcional (RF):**
  - Un requerimiento funcional describe **las acciones, tareas, comportamientos y capacidades operativas especificas que el software debe realizar** para satisfacer las necesidades de los usuarios y de la organizacion.
  - El sistema actual fue construido como una primera version del producto; por tanto, los requerimientos funcionales documentan tanto **las capacidades ya implementadas** que respaldan las funciones actuales, como **los requerimientos de evolucion y mejora continua (Roadmap del Producto)** que la mesa de ayuda requiere para su distribucion y escalamiento.
- **Roles Oficiales del Sistema (10):**
  1. **Solicitante:** Trabajador de la empresa o cliente que reporta fallas tecnicas, solicita servicios del catalogo, consulta manuales de autoayuda, adjunta evidencias y califica la atencion recibida.
  2. **Tecnico:** Especialista que revisa casos asignados o libres, ejecuta la atencion tecnica, registra notas de trabajo internas, sustenta evidencias, documenta la solucion final y registra solicitudes de cambio RFC operativas.
  3. **Supervisor:** Responsable de coordinar a los tecnicos de su area, equilibrar la carga de trabajo (WIP), autorizar reasignaciones, monitorear el cumplimiento de plazos (SLA) y exportar reportes gerenciales.
  4. **Gestor de Area:** Responsable departamental que autoriza o rechaza con sustento obligatorio las solicitudes de accesos, licencias o equipos que realizan sus colaboradores antes del inicio de labores de TI.
  5. **Auditor:** Revisor que fiscaliza el historial inmutable de tickets, atenciones, eventos de seguridad ISO 27001, licencias y cambios para comprobar el cumplimiento normativo (modo estricto solo lectura).
  6. **Administrador:** Responsable general de la gobernanza y configuracion del sistema: parametriza plantillas RFC, formularios de captura, catalogo corporativo de servicios, acuerdos SLA/OLA, matriz RBAC y estructura de menu.
  7. **Aprobador (CAB):** Autoridad de Cambio que evalua colegiadamente el impacto y riesgo tecnico de las solicitudes de cambio RFC y emite su voto formal en las sesiones del comite.
  8. **Gestor de Cambios:** Change Manager que planifica el calendario de cambios, administra ventanas de mantenimiento y periodos de congelamiento (freeze), coordina las sesiones CAB y fiscaliza las revisiones PIR.
  9. **Gestor de Activos y Configuracion:** Custodio tecnologico que administra el inventario patrimonial de hardware (HAM), el mapa de elementos de configuracion (CMDB) y el licenciamiento de software (SAM).
  10. **Gestor de Problemas:** Responsable del proceso de Problemas: prioriza y da seguimiento a problemas, documenta errores conocidos y workarounds en la KEDB, coordina el analisis de causa raiz y promueve cambios definitivos.
- **Terminologia Estandarizada:** Se utiliza exclusivamente el termino "usuario" o "usuarios".

---

## 1. Resumen de Requerimientos Funcionales agrupados por Dominio

```
+----------------------------------------------------------------------------------------------------+
|                         REQUERIMIENTOS FUNCIONALES DEL SISTEMA (RF)                                |
+--------------------------------+-------------------------------------+-----------------------------+
| Dominio del Sistema            | Requerimiento Funcional             | Regla de Negocio Vinculada  |
+--------------------------------+-------------------------------------+-----------------------------+
| 1. GOBERNANZA Y ACCESO         | [RF-01] Acceso e Identificacion     | [RN-01], [RN-08]            |
|                                | [RF-02] Restablecimiento de Acceso  | [RN-01]                     |
|                                | [RF-03] Perfil y Preferencias       | [RN-08], [RN-29]            |
|                                | [RF-04] Trazabilidad y Bitacora     | [RN-03]                     |
|                                | [RF-05] Consulta de Historial       | [RN-03], [RN-04]            |
+--------------------------------+-------------------------------------+-----------------------------+
| 2. USUARIOS Y ROLES            | [RF-06] Administracion de Personal  | [RN-05], [RN-08]            |
|                                | [RF-07] Cambio de Funcion Laboral   | [RN-05], [RN-06]            |
|                                | [RF-08] Delimitacion de Vistas      | [RN-07]                     |
+--------------------------------+-------------------------------------+-----------------------------+
| 3. CATALOGO DE SERVICIOS       | [RF-09] Lista Oficial de Servicios  | [RN-09], [RN-10], [RN-12]   |
|                                | [RF-10] Portal de Solicitudes       | [RN-09], [RN-18]            |
|                                | [RF-11] Centro de Autoayuda Rapida  | [RN-13]                     |
|                                | [RF-12] Protocolos de Verificacion  | [RN-11]                     |
+--------------------------------+-------------------------------------+-----------------------------+
| 4. DEPARTAMENTOS TECNICOS      | [RF-13] Estructura Departamental    | [RN-14]                     |
|                                | [RF-14] Registro de Especialistas   | [RN-15], [RN-16]            |
|                                | [RF-15] Tablero de Carga y Turnos   | [RN-16], [RN-17]            |
+--------------------------------+-------------------------------------+-----------------------------+
| 5. CICLO DE VIDA DE TICKETS    | [RF-16] Registro de Solicitudes     | [RN-18], [RN-19]            |
|                                | [RF-17] Priorizacion Automatizada   | [RN-20]                     |
|                                | [RF-18] Aprobacion de Pedidos       | [RN-12], [RN-21]            |
|                                | [RF-19] Asignacion y Autoasignacion | [RN-15], [RN-16], [RN-17]   |
|                                | [RF-20] Suspension de Tiempos       | [RN-22]                     |
|                                | [RF-21] Notas Publicas y Privadas   | [RN-23]                     |
|                                | [RF-22] Documentacion de Solucion   | [RN-24]                     |
|                                | [RF-23] Evaluacion de Satisfaccion  | [RN-25]                     |
|                                | [RF-24] Cierre Formal y Tacito      | [RN-26]                     |
|                                | [RF-25] Envio de Evidencias         | [RN-27]                     |
|                                | [RF-26] Alerta Preventiva al 80%    | [RN-28]                     |
|                                | [RF-27] Notificaciones por Correo   | [RN-29]                     |
|                                | [RF-28] Descarga de Reportes        | [RN-30]                     |
|                                | [RF-29] Reclamacion y Reapertura    | [RN-26]                     |
+--------------------------------+-------------------------------------+-----------------------------+
| 6. GESTION DE CAMBIOS (ITIL)   | [RF-30] Registro y Formulacion RFC  | [RN-33], [RN-34]            |
|                                | [RF-31] Votacion Colegiada en CAB   | [RN-31], [RN-32]            |
|                                | [RF-32] Calendario y Ventanas Freeze| [RN-33]                     |
|                                | [RF-33] Historial y Evaluacion PIR  | [RN-34]                     |
+--------------------------------+-------------------------------------+-----------------------------+
| 7. ACTIVOS Y CMDB (ITAM/SACM)  | [RF-34] Inventario de Hardware HAM  | [RN-35]                     |
|                                | [RF-35] Topologia y Dependencias CI | [RN-35]                     |
|                                | [RF-36] Control de Licencias SAM    | [RN-36]                     |
+--------------------------------+-------------------------------------+-----------------------------+
| 8. GOBERNANZA ADMINISTRATIVA   | [RF-37] Configurador de Plantillas  | [RN-37]                     |
|                                | [RF-38] Disenador de Menu y RBAC    | [RN-05], [RN-07], [RN-38]   |
|                                | [RF-39] Monitoreo Logs ISO 27001    | [RN-03], [RN-38]            |
|                                | [RF-40] Motor Reglas Notificacion   | [RN-29]                     |
|                                | [RF-43] Formularios Dinamicos SRV   | [RN-09], [RN-37]            |
|                                | [RF-44] Purga y Mantenimiento Datos | [RN-03], [RN-41]            |
+--------------------------------+-------------------------------------+-----------------------------+
| 9. GESTION DE PROBLEMAS (ITIL) | [RF-41] Gestion Problemas y KEDB    | [RN-18]                     |
+--------------------------------+-------------------------------------+-----------------------------+
| 10. ITAM AVANZADO Y CONOCIMIENTO| [RF-42] Modelos y Ciclo de Vida ITAM| [RN-35], [RN-36], [RN-39]   |
|                                | [RF-45] Ciclo Editorial KCS         | [RN-13], [RN-40]            |
+--------------------------------+-------------------------------------+-----------------------------+
```

---

## 2. Desarrollo Detallado de Requerimientos Funcionales

---

### Dominio 1: GOBERNANZA Y ACCESO AL SERVICIO

#### [RF-01] Acceso e Identificacion en el Portal
- **Descripcion:** El sistema permite a los colaboradores identificarse en el portal de soporte mediante su correo corporativo y clave personal para consultar sus atenciones en curso o solicitar nueva asistencia tecnica.
- **Que entrega al usuario:** Acceso ordenado y directo a su entorno de trabajo segun su puesto laboral.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-01], [RN-08].
- **Roles Autorizados:** Todos los usuarios.

#### [RF-02] Restablecimiento Autonomo de Acceso
- **Descripcion:** El sistema permite al trabajador que haya olvidado su clave solicitar un codigo de verificacion temporal a su correo institucional para definir una nueva credencial sin depender de una llamada al soporte tecnico.
- **Que entrega al usuario:** Recuperacion inmediata de su capacidad de trabajo y autonomia operativa.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-01].
- **Roles Autorizados:** Todos los usuarios.

#### [RF-03] Gestion de Perfil y Preferencias
- **Descripcion:** El sistema permite a cada colaborador verificar sus datos de contacto institucionales y configurar sus canales de aviso para el seguimiento oportuno de sus solicitudes de servicio.
- **Que entrega al usuario:** Canales de comunicacion directos para coordinar con los especialistas asignados a sus tickets.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-08], [RN-29].
- **Roles Autorizados:** Todos los usuarios.

#### [RF-04] Trazabilidad y Bitacora de Eventos
- **Descripcion:** El sistema guarda una constancia inalterable de cada evento de servicio: apertura de tickets, asignaciones, pausas de SLA, dictamenes de aprobacion y dictamenes de solucion tecnica.
- **Que entrega a la empresa:** Transparencia probatoria y registro permanente para el control de calidad y auditorias operativas.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-03].
- **Roles Autorizados:** Auditor y Administrador (para consulta).

#### [RF-05] Consulta de Historial y Auditoria Operativa
- **Descripcion:** El sistema ofrece una pantalla de busqueda y filtrado del historial de actividades corporativas para verificar el cumplimiento de protocolos y politicas de servicio.
- **Que entrega a la empresa:** Capacidad de fiscalizacion del servicio prestado y deteccion oportuna de desviaciones de procedimiento.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-03], [RN-04].
- **Roles Autorizados:** Auditor y Supervisor.

---

### Dominio 2: USUARIOS Y ROLES ORGANIZACIONALES

#### [RF-06] Administracion de Personal y Colaboradores
- **Descripcion:** El sistema permite al Administrador dar de alta colaboradores, actualizar sus datos personales, conmutar su estado entre activo e inactivo y asignar los perfiles de responsabilidad que les corresponden.
- **Que entrega a la empresa:** Control ordenado y centralizado del personal autorizado para interactuar con los servicios tecnicos.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-05], [RN-08].
- **Roles Autorizados:** Administrador.

#### [RF-07] Cambio de Funcion Laboral en Sesion
- **Descripcion:** El sistema ofrece un conmutador en la barra superior para que colaboradores que desempenen multiples responsabilidades elijan con cual perfil desean operar en cada momento sin cerrar su sesion.
- **Que entrega al usuario:** Flexibilidad para alternar entre atender requerimientos como especialista tecnico y solicitar atenciones de soporte personal como solicitante.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-05], [RN-06].
- **Roles Autorizados:** Colaboradores con mas de un perfil asignado.

#### [RF-08] Delimitacion de Vistas por Puesto
- **Descripcion:** El sistema adapta la barra lateral y los accesos mostrando con exclusividad las opciones autorizadas para el cargo activo, denegando el ingreso a rutas operativas no permitidas.
- **Que entrega a la empresa:** Cumplimiento del principio de minimo privilegio y resguardo de la confidencialidad de la informacion.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-07].
- **Roles Autorizados:** Todos los usuarios.

---

### Dominio 3: CATALOGO DE SERVICIOS Y ACUERDOS DE NIVEL DE SERVICIO (SLA)

#### [RF-09] Lista Oficial de Servicios
- **Descripcion:** El sistema permite al Administrador estructurar y mantener el portafolio corporativo de servicios, indicando denominacion, area responsable, criticidad, plazos maximos de primera respuesta y resolucion, y compuerta de visto bueno.
- **Que entrega a la empresa:** Formalizacion de los compromisos de servicio de tecnologia hacia la organizacion.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-09], [RN-10], [RN-12].
- **Roles Autorizados:** Administrador.

#### [RF-10] Portal de Solicitudes Asistido
- **Descripcion:** El sistema presenta a los colaboradores un catalogo visual organizado por categorias con tarjetas descriptivas de cada prestacion, orientando el llenado del requerimiento.
- **Que entrega al usuario:** Tramitacion intuitiva, guiada y transparente sin recurrir a canales informales.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-09], [RN-18].
- **Roles Autorizados:** Solicitante.

#### [RF-11] Centro de Autoayuda Rapida
- **Descripcion:** El sistema dispone de un buscador de manuales breves y guias de solucion para problemas comunes, sugiriendolas al usuario antes de completar la apertura de un ticket.
- **Que entrega al usuario:** Respuestas inmediatas a dudas recurrentes sin esperar la disponibilidad de un tecnico.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-13].
- **Roles Autorizados:** Solicitante (consulta) y Supervisor/Administrador (edicion).

#### [RF-12] Protocolos de Verificacion por Servicio
- **Descripcion:** El sistema permite configurar listas de pasos de verificacion tecnica obligatorios asociados a un servicio del catalogo, exigiendo al especialista marcar su ejecucion antes de concluir el ticket.
- **Que entrega a la empresa:** Aseguramiento de la calidad tecnica y prevencion de omisiones en configuraciones criticas.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-11].
- **Roles Autorizados:** Administrador (configura) y Tecnico (ejecuta).

---

### Dominio 4: DEPARTAMENTOS TECNICOS Y CAPACIDAD OPERATIVA

#### [RF-13] Estructura Departamental de TI
- **Descripcion:** El sistema permite organizar las areas tecnicas de soporte (Soporte a Usuarios, Redes, Infraestructura, Sistemas) y designar formalmente al Supervisor responsable de cada departamento.
- **Que entrega a la empresa:** Claridad jerarquica y liderazgo operativo por cada especialidad tecnica.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-14].
- **Roles Autorizados:** Administrador.

#### [RF-14] Registro de Especialistas y Limites de Capacidad
- **Descripcion:** El sistema permite registrar a los tecnicos vinculandolos a su departamento, fijando su nivel de pericia (Nivel 1, 2 o 3) y su tope maximo de casos concurrentes en proceso.
- **Que entrega al equipo:** Proteccion contra la sobrecarga laboral y canalizacion de casos segun nivel de preparacion.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-15], [RN-16].
- **Roles Autorizados:** Administrador y Supervisor.

#### [RF-15] Tablero de Carga y Disponibilidad de Tecnicos
- **Descripcion:** El sistema provee al Supervisor un panel en tiempo real donde visualiza la cantidad de casos activos por tecnico y su estado de disponibilidad en turno (Disponible, Ocupado, Ausente).
- **Que entrega al supervisor:** Informacion para balancear la carga de trabajo y tomar decisiones de asignacion equitativas.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-16], [RN-17].
- **Roles Autorizados:** Supervisor.

---

### Dominio 5: CICLO DE VIDA DE TICKETS, CALIDAD Y CIERRE

#### [RF-16] Registro Integral de Incidentes y Solicitudes
- **Descripcion:** El sistema permite registrar pedidos clasificandolos como Incidentes (fallas imprevistas) o Solicitudes de Servicio (nuevos pedidos planificables), capturando titulo, detalle, area de destino e impacto.
- **Que entrega al usuario:** Generacion formal de su expediente con codigo correlativo irrepetible para seguimiento continuo.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-18], [RN-19].
- **Roles Autorizados:** Solicitante y Tecnico.

#### [RF-17] Priorizacion Automatizada por Matriz de Impacto y Urgencia
- **Descripcion:** El sistema cruza de forma automatica el impacto declarado sobre la empresa con la urgencia del trabajador, determinando la prioridad del ticket (Baja, Media, Alta o Critica).
- **Que entrega a la empresa:** Atencion imparcial orientada a resolver primero las contingencias que paralizan la operacion.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-20].
- **Roles Autorizados:** Todos los usuarios.

#### [RF-18] Flujo de Aprobacion de Requerimientos Criticos
- **Descripcion:** El sistema retiene el avance de tickets que requieren visto bueno en una bandeja de autorizaciones, permitiendo al Gestor de Area aprobar o denegar la solicitud registrando un motivo fundamentado.
- **Que entrega a la empresa:** Control de gastos de tecnologia y resguardo de la seguridad institucional.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-12], [RN-21].
- **Roles Autorizados:** Gestor de Area.

#### [RF-19] Asignacion y Autoasignacion de Casos
- **Descripcion:** El sistema permite que el supervisor entregue tickets a los tecnicos de su area, o que los propios especialistas tomen tickets de la bandeja disponible siempre que no excedan su capacidad maxima.
- **Que entrega al equipo:** Celeridad en el inicio de las atenciones tecnicas y respeto a los limites individuales de atencion.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-15], [RN-16], [RN-17].
- **Roles Autorizados:** Supervisor y Tecnico.

#### [RF-20] Suspension Operativa del Tiempo de SLA
- **Descripcion:** El sistema permite colocar el ticket en estado En Espera cuando se requiera informacion o pruebas del solicitante, congelando el reloj del SLA hasta que el usuario responda.
- **Que entrega al tecnico:** Evaluacion justa de sus tiempos de atencion, sin verse perjudicado por demoras ajenas a su control.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-22].
- **Roles Autorizados:** Tecnico y Supervisor.

#### [RF-21] Comunicacion Publica y Notas Tecnicas Privadas
- **Descripcion:** El expediente de atencion dispone de dos canales de anotacion: un canal publico para dialogar con el solicitante y un canal privado restringido a tecnicos y supervisores para notas de diagnostico interno.
- **Que entrega al servicio:** Claridad en la atencion al usuario y espacio confidencial para coordinaciones entre especialistas.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-23].
- **Roles Autorizados:** Tecnico, Supervisor y Solicitante (en comentarios publicos).

#### [RF-22] Documentacion Obligatoria de Solucion
- **Descripcion:** El sistema exige al tecnico registrar la descripcion de la reparacion efectuada y la categoria de resolucion antes de poder marcar el caso como resuelto.
- **Que entrega a la empresa:** Sustento verificable del trabajo entregado y fortalecimiento de la base de conocimiento interno.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-24].
- **Roles Autorizados:** Tecnico.

#### [RF-23] Evaluacion de Satisfaccion del Servicio
- **Descripcion:** El sistema habilita una encuesta de calificacion (de 1 a 5 estrellas y comentarios libres) exclusivamente en la pantalla del solicitante titular del ticket una vez resuelto el caso.
- **Que entrega a la empresa:** Medicion objetiva y fidedigna de la percepcion del cliente interno sobre el servicio recibido.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-25].
- **Roles Autorizados:** Solicitante.

#### [RF-24] Cierre Formal y Tacito de Tickets
- **Descripcion:** El sistema permite al solicitante manifestar su conformidad para cerrar el caso de inmediato, o procede al cierre automatico transcurridas 48 horas sin observaciones tras la notificacion de resolucion.
- **Que entrega a la empresa:** Finalizacion ordenada de los ciclos de atencion y reduccion de tickets estancados.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-26].
- **Roles Autorizados:** Solicitante y Sistema.

#### [RF-25] Envio y Gestion de Evidencias Documentales
- **Descripcion:** El sistema permite adjuntar y descargar archivos de sustento (capturas de error, actas de entrega o manuales) en formatos seguros (PNG, JPG, PDF) con un limite de cinco megabytes.
- **Que entrega al servicio:** Informacion grafica y probatoria precisa para diagnosticar fallas sin arriesgar la red corporativa.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-27].
- **Roles Autorizados:** Solicitante y Tecnico.

#### [RF-26] Alerta Preventiva por Riesgo de SLA al 80%
- **Descripcion:** El sistema despliega indicadores visuales en color amarillo cuando un ticket ha consumido el 80% de su plazo limite de solucion sin estar resuelto.
- **Que entrega al supervisor:** Capacidad de intervenir de manera anticipada para reasignar tareas o enviar refuerzos antes de incumplir el acuerdo.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-28].
- **Roles Autorizados:** Supervisor.

#### [RF-27] Despacho de Notificaciones por Correo
- **Descripcion:** El sistema despacha mensajes de correo electronico informando al colaborador y a los involucrados en cada cambio relevante de su caso: creacion, asignacion, aprobacion, solucion y cierre.
- **Que entrega al usuario:** Informacion oportuna y reduccion de la necesidad de consultar manualmente el estado de su ticket.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-29].
- **Roles Autorizados:** Sistema (emision automatica).

#### [RF-28] Descarga de Reportes Gerenciales
- **Descripcion:** El sistema permite a supervisores y auditores filtrar el historico de tickets por fechas, departamentos y tecnicos, y exportar los resultados tabulados en hojas de calculo.
- **Que entrega a la direccion:** Datos consolidados de tiempos de atencion, volumen de atenciones y cumplimiento de acuerdos para la toma de decisiones.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-30].
- **Roles Autorizados:** Supervisor y Auditor.

#### [RF-29] Reclamacion y Reapertura Justificada de Tickets
- **Descripcion:** El sistema permite al solicitante solicitar la reapertura justificada de un ticket resuelto dentro del plazo de observacion de 48 horas si comprueba que el inconveniente persiste, reactivando el caso bajo el mismo codigo para evitar duplicidades.
- **Que entrega al usuario:** Garantia de una solucion completa y definitiva a su problema sin tener que volver a ingresar todos los datos desde cero.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-26].
- **Roles Autorizados:** Solicitante.

---

### Dominio 6: GESTION DE CAMBIOS (CHANGE ENABLEMENT - ITIL v4)

#### [RF-30] Registro y Formulacion de Solicitudes RFC
- **Descripcion:** El sistema provee un formulario estructurado para que tecnicos y gestores de cambio registren peticiones formales de modificacion a la infraestructura (RFC), detallando titulo, clasificacion (Estandar, Normal, Emergencia), evaluacion de impacto, plan de ejecucion, plan de pruebas y plan de contingencia/rollback.
- **Que entrega al usuario:** Estandarizacion de las solicitudes tecnicas minimizando el riesgo de errores en despliegues productivos.
- **Estado de Implementacion:** Implementado en el sistema actual (`/cambios/gestion/crear`).
- **Reglas Vinculadas:** [RN-33], [RN-34].
- **Roles Autorizados:** Tecnico y Gestor de Cambios.

#### [RF-31] Mesa de Evaluacion y Votacion Colegiada CAB
- **Descripcion:** El sistema dispone de una consola de dictamen (`/cambios/gestion/cab`) donde los miembros de la Autoridad de Cambio evaluan las RFCs pendientes, revisan los planes de mitigacion y emiten su voto nominal (Aprobado, Rechazado, Requiere Revision) con autoexclusion automatica ante conflicto de interes.
- **Que entrega a la organizacion:** Gobernanza colegiada y control preventivo sobre intervenciones mayores en sistemas criticos.
- **Estado de Implementacion:** Implementado en el sistema actual (`/cambios/gestion/cab`).
- **Reglas Vinculadas:** [RN-31], [RN-32].
- **Roles Autorizados:** Aprobador (CAB) y Gestor de Cambios.

#### [RF-32] Calendario Corporativo de Ventanas de Mantenimiento y Change Freeze
- **Descripcion:** El sistema provee un calendario interactivo (`/cambios/gestion/calendario`) donde se proyectan cronologicamente las ventanas de mantenimiento autorizadas, cruces de dependencias y periodos de congelamiento (freeze), restringiendo despliegues concurrentes en la misma franja horaria.
- **Que entrega a TI:** Planificacion visual y prevencion de colisiones entre intervenciones de infraestructura.
- **Estado de Implementacion:** Implementado en el sistema actual (`/cambios/gestion/calendario`).
- **Reglas Vinculadas:** [RN-33].
- **Roles Autorizados:** Tecnico, Supervisor, Administrador, Aprobador (CAB) y Gestor de Cambios.

#### [RF-33] Historial Consolidado y Evaluacion Post-Implementacion (PIR)
- **Descripcion:** El sistema centraliza la consulta forense de todas las solicitudes RFC ejecutadas (`/cambios/gestion/todos`), permitiendo documentar la Revision Post-Implementacion (PIR), causas de exito o fallas de rollback y lecciones aprendidas.
- **Que entrega a la direccion:** Trazabilidad integral de auditoria de cambios para mejora continua y cumplimiento normativo.
- **Estado de Implementacion:** Implementado en el sistema actual (`/cambios/gestion/todos`).
- **Reglas Vinculadas:** [RN-03], [RN-34].
- **Roles Autorizados:** Tecnico, Supervisor, Auditor, Administrador, Aprobador (CAB) y Gestor de Cambios.

---

### Dominio 7: GESTION DE ACTIVOS Y CONFIGURACION (ITAM / SACM)

#### [RF-34] Inventario Patrimonial de Hardware (HAM)
- **Descripcion:** El sistema gestiona el catalogo maestro de activos fisicos de computo y red (`/activos/inventario`), registrando marca, modelo, numero de serie, responsable asignado, ubicacion fisica y estado operativo del ciclo de vida.
- **Que entrega al gestor:** Control patrimonial exacto de los recursos tecnologicos de la empresa.
- **Estado de Implementacion:** Implementado en el sistema actual (`/activos/inventario`).
- **Reglas Vinculadas:** [RN-35].
- **Roles Autorizados:** Gestor de Activos y Configuracion, Tecnico, Auditor y Administrador.

#### [RF-35] Topologia de Servicios y Mapa de Elementos de Configuracion (CMDB)
- **Descripcion:** El sistema grafica y administra la topologia de relaciones entre Elementos de Configuracion (CIs) (`/activos/cmdb`), vinculando servidores, switches, bases de datos y servicios de negocio para analisis de impacto de fallas y cambios.
- **Que entrega al equipo de ingenieria:** Comprension inmediata de las dependencias tecnicas ante un incidente o cambio.
- **Estado de Implementacion:** Implementado en el sistema actual (`/activos/cmdb`).
- **Reglas Vinculadas:** [RN-35].
- **Roles Autorizados:** Gestor de Activos y Configuracion, Administrador, Aprobador (CAB) y Gestor de Cambios.

#### [RF-36] Control y Alertas de Licencias de Software y Garantias (SAM)
- **Descripcion:** El sistema monitorea el parque de software corporativo (`/activos/licencias`), cotejando contratos, claves de producto, volumen de licencias adquiridas versus asignadas y alertas de vencimiento de soporte o garantias.
- **Que entrega a la empresa:** Blindaje legal frente a auditorias de software y optimizacion del gasto en licenciamiento.
- **Estado de Implementacion:** Implementado en el sistema actual (`/activos/licencias`).
- **Reglas Vinculadas:** [RN-36].
- **Roles Autorizados:** Gestor de Activos y Configuracion, Auditor y Administrador.

---

### Dominio 8: GOBERNANZA ADMINISTRATIVA Y CONFIGURACION DE PLATAFORMA

#### [RF-37] Configurador de Formularios, Campos y Plantillas de Servicio y RFC
- **Descripcion:** El sistema provee consolas administrativas exclusivas para que el Administrador defina que campos se solicitan en los formularios, cuales son obligatorios, que plantillas aplican segun el tipo de servicio o RFC, y que reglas de negocio se ejecutan al guardar y visualizar expedientes, sin actuar como resolutor operativo.
- **Que entrega al administrador:** Flexibilidad y gobierno total para modelar procesos de captura sin alterar codigo fuente.
- **Estado de Implementacion:** Implementado en el sistema actual (`/admin/servicios`).
- **Reglas Vinculadas:** [RN-09], [RN-37].
- **Roles Autorizados:** Administrador.

#### [RF-38] Disenador de Jerarquia Dinamica del Menu y Matriz RBAC
- **Descripcion:** El sistema cuenta con consolas de gestion de identidades, perfiles y menus (`/admin/usuarios`, `/admin/perfiles`, `/admin/menu`) que permiten configurar que opciones de nivel 1, 2 y 3 visualiza cada perfil de forma dinamica segun su mandato institucional y principios de minimo privilegio.
- **Que entrega a la organizacion:** Seguridad granular, navegacion adaptativa y cumplimiento estricto de politicas SoD.
- **Estado de Implementacion:** Implementado en el sistema actual (`/admin/usuarios`, `/admin/perfiles`, `/admin/menu`).
- **Reglas Vinculadas:** [RN-05], [RN-07], [RN-38].
- **Roles Autorizados:** Administrador.

#### [RF-39] Monitoreo Forense de Logs de Seguridad e Intentos Fallidos ISO 27001
- **Descripcion:** El sistema almacena y visualiza de forma inmutable los logs de autenticacion, bloqueos de cuenta, modificaciones de permisos y accesos por direccion IP (`/admin/seguridad-logs`), facilitando la auditoria forense y deteccion de anomalias.
- **Que entrega a los auditores:** Evidencia probatoria inalterable para cumplimiento del estandar ISO/IEC 27001.
- **Estado de Implementacion:** Implementado en el sistema actual (`/admin/seguridad-logs`).
- **Reglas Vinculadas:** [RN-03], [RN-38].
- **Roles Autorizados:** Administrador y Auditor.

---

### Dominio 8: GOBERNANZA ADMINISTRATIVA (Continuacion)

#### [RF-40] Motor de Reglas de Notificacion y Eventos del Sistema
- **Descripcion:** El sistema permite al Administrador configurar reglas de disparo automatico de notificaciones (`/admin/notificaciones` y `/api/admin/notificaciones/reglas`) basadas en eventos institucionales (`TICKET_CREADO`, `TICKET_RESUELTO`, `RFC_ENVIADA_CAB`, etc.), asignando canales de correo, plantillas y roles destinatarios (`SOLICITANTE`, `TECNICO_ASIGNADO`, `SUPERVISOR_GRUPO`, `CAB`, `GESTOR_CAMBIO`, `GESTOR_AREA`).
- **Que entrega a la organizacion:** Automatizacion centralizada de las comunicaciones del servicio segun los estandares ISO/IEC 20000-1 e ITIL 4.
- **Estado de Implementacion:** Implementado en el sistema actual (`/admin/notificaciones`, `/api/admin/notificaciones/reglas`).
- **Reglas Vinculadas:** [RN-29].
- **Roles Autorizados:** Administrador.

#### [RF-43] Formularios Dinamicos y Enrutamiento por Servicio
- **Descripcion:** El sistema permite al Administrador crear campos personalizados en tiempo de ejecucion (`texto`, `area`, `numero`, `fecha`, `correo`, `lista`, `casilla`) por cada servicio del catalogo (`/admin/servicios/[id]/formulario`), definir el departamento resolutor inicial (`id_departamento_resolutor`) y programar reglas de escalamiento automatico por horas.
- **Que entrega al usuario:** Formularios intuitivos adaptados a las particularidades de cada tramite, con captura y persistencia automatica en `campos_adicionales`.
- **Estado de Implementacion:** Implementado en el sistema actual (`/admin/servicios/[id]/formulario`, `/tickets/gestion/crear`, `/api/tickets`).
- **Reglas Vinculadas:** [RN-09], [RN-37].
- **Roles Autorizados:** Administrador (configuracion) y Solicitante / Tecnico (consumo).

#### [RF-44] Mantenimiento, Optimizacion y Purga Segura de Datos
- **Descripcion:** El sistema proporciona una herramienta de administracion para depurar registros antiguos de tickets cerrados (`/admin/mantenimiento-datos`), permitiendo simular el impacto en volumen y espacio antes de ejecutar la purga formal, la cual queda registrada con sello de tiempo en la bitacora de auditoria del sistema (`log_auditoria_sistema`).
- **Que entrega a la organizacion:** Optimizacion del rendimiento de la base de datos PostgreSQL y cumplimiento de politicas de retencion documental.
- **Estado de Implementacion:** Implementado en el sistema actual (`/admin/mantenimiento-datos`, `/api/admin/mantenimiento-datos`).
- **Reglas Vinculadas:** [RN-03], [RN-41].
- **Roles Autorizados:** Administrador.

---

### Dominio 9: GESTION DE PROBLEMAS Y BASE DE ERRORES CONOCIDOS (KEDB)

#### [RF-41] Gestion de Problemas TI y Base de Errores Conocidos (KEDB)
- **Descripcion:** El sistema permite a los tecnicos y supervisores registrar expedientes de problemas derivados de incidentes recurrentes (`/problemas` y `/api/problemas`), investigar causas raices, asociar incidentes vinculados y publicar soluciones temporales (workarounds) o definitivas en la base de errores conocidos (`/problemas/kedb`).
- **Que entrega a la empresa:** Enfoque proactivo de soporte tecnico bajo ITIL, eliminando fallas recurrentes en la infraestructura corporativa y acelerando la resolucion de incidentes futuros.
- **Estado de Implementacion:** Implementado en el sistema actual (`/problemas`, `/problemas/kedb`, `/api/problemas`).
- **Reglas Vinculadas:** [RN-18].
- **Roles Autorizados:** Tecnico y Supervisor.

---

### Dominio 10: GESTION AVANZADA DE ACTIVOS (ITAM) Y GOBIERNO DEL CONOCIMIENTO (KCS)

#### [RF-42] Modelado Maestro de Activos, Depreciacion y Asignacion de Licencias (ITAM)
- **Descripcion:** El sistema permite registrar tipos de activos (`/api/activos/tipos`), catalogos de modelos de hardware y software (`/api/activos/modelos`) con parametros de vida util y depreciacion lineal, transiciones de estados del ciclo de vida (`transicion_activo`) con motivos obligatorios, bitacora cronologica de custodia (`activo_historial`), y asignacion nominativa de licencias a usuarios o equipos (`/activos/licencias`, `/api/activos/licencias/asignaciones`).
- **Que entrega al gestor de activos:** Control integral del ciclo de vida financiero y operacional de los bienes tecnologicos (HAM y SAM).
- **Estado de Implementacion:** Implementado en el sistema actual (`/activos/inventario`, `/activos/licencias`, `/activos/cmdb/tipos`).
- **Reglas Vinculadas:** [RN-35], [RN-36], [RN-39].
- **Roles Autorizados:** Gestor de Activos y Configuracion, y Administrador.

#### [RF-45] Ciclo de Vida Editorial de Articulos de Conocimiento (KCS) y Audiencias
- **Descripcion:** El sistema gestiona articulos de autoayuda con versionado incremental (`version`), bitacora de cambios de estado editorial (`articulo_conocimiento_historial`), delimitacion de lectura segun el perfil del usuario autenticado (`audiencia_perfiles`) y flujo de retiro con motivo obligatorio (`/admin/conocimiento-config`, `/api/admin/conocimiento/[id]`).
- **Que entrega a la organizacion:** Gobierno de calidad y confidencialidad en el conocimiento institucional segun las mejores practicas de Knowledge-Centered Service (KCS).
- **Estado de Implementacion:** Implementado en el sistema actual (`/admin/conocimiento-config`, `/api/admin/conocimiento/[id]`, `/api/conocimiento`).
- **Reglas Vinculadas:** [RN-13], [RN-40].
- **Roles Autorizados:** Administrador (gobierno editorial) y Todos los usuarios (lectura segun audiencia).



---

## Parte II — Requerimientos No Funcionales

## Informacion del Documento y Roles Oficiales

- **Proyecto:** Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITSM)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Concepto Fundamental de Requerimiento No Funcional (RNF):**
  - Un requerimiento no funcional define los **atributos de calidad, restricciones tecnicas, rendimiento y condiciones operativas** que determinan como debe comportarse el sistema.
  - A diferencia de las reglas de negocio (que dictan directrices organizacionales) y de los requerimientos funcionales (que describen acciones y tareas especificas), los RNF establecen metricas objetivas de eficiencia, disponibilidad, seguridad informatica, usabilidad, capacidad y mantenibilidad del software.
  - Basado en el estandar internacional de calidad de software **ISO/IEC 25010 (SQuaRE)**.
- **Roles Oficiales del Sistema:** Los 10 perfiles vigentes se detallan en la Parte I de este documento y en `MENUS_Y_PERFILES.md`. Los RNF aplican a todos ellos con independencia del perfil activo.
- **Terminologia Estandarizada:** Se utiliza exclusivamente el termino "usuario" o "usuarios".

---

## 1. Catalogo de Requerimientos No Funcionales (RNF)

```
+----------------------------------------------------------------------------------------------------+
|                       REQUERIMIENTOS NO FUNCIONALES DEL SISTEMA (RNF)                              |
+-------------+----------------------------------------------+---------------------------------------+
| Codigo      | Atributo de Calidad (ISO/IEC 25010)          | Metrica y Criterio de Aceptacion      |
+-------------+----------------------------------------------+---------------------------------------+
| RNF-01      | Eficiencia de Rendimiento y Respuesta        | Respuestas transaccionales < 2.0 s    |
| RNF-02      | Disponibilidad y Continuidad Operativa       | Operatividad minima del 99.5% laboral |
| RNF-03      | Seguridad del Software y Proteccion de Datos | Cifrado HTTPS/TLS y datos resguardados|
| RNF-04      | Usabilidad y Adaptabilidad Multidispositivo  | Diseno responsivo movil y escritorio  |
| RNF-05      | Escalabilidad y Capacidad Concurrente        | 50 sesiones simultaneas sin demora    |
| RNF-06      | Mantenibilidad, Modularidad y Arquitectura   | Arquitectura por capas desacopladas   |
+-------------+----------------------------------------------+---------------------------------------+
```

---

## 2. Desarrollo Detallado de Requerimientos No Funcionales

---

### [RNF-01] Eficiencia de Rendimiento y Tiempos de Respuesta
- **Atributo de Calidad:** Rendimiento / Eficiencia de Desempeno (Performance Efficiency).
- **Que define para el Sistema:** El software debe responder de manera agil y fluida ante las solicitudes del personal, evitando demoras que perjudiquen el flujo laboral.
- **Criterio de Medicion y Aceptacion:**
  - Las transacciones cotidianas (filtrado de tickets en bandejas, busqueda en el catalogo de servicios, envio de comentarios y cambios de estado) deben completarse en un tiempo no mayor a 1.5 a 2.0 segundos bajo condiciones habituales de red.
  - La generacion y descarga de reportes gerenciales en hojas de calculo debe ejecutarse en menos de 3.5 segundos para volumenes de hasta diez mil registros.
- **Impacto en el Servicio:** Permite que tecnicos y supervisores atiendan incidentes con celeridad sin que la plataforma se convierta en un cuello de botella.

---

### [RNF-02] Disponibilidad y Continuidad Operativa
- **Atributo de Calidad:** Confiabilidad / Disponibilidad (Reliability & Availability).
- **Que define para el Sistema:** La plataforma de soporte debe encontrarse operativa y lista para recibir requerimientos durante toda la jornada productiva de la organizacion.
- **Criterio de Medicion y Aceptacion:**
  - El sistema debe garantizar un nivel de disponibilidad no menor al 99.5% durante el horario de atencion laboral establecido por la empresa (lunes a sabado de 07:00 a 20:00).
  - En caso de presentarse una falla imprevista, el tiempo medio de recuperacion operativa del servicio (MTTR) no debe superar los 30 minutos.
- **Impacto en el Servicio:** Otorga certidumbre institucional de que las contingencias tecnologicas siempre contaran con un canal formal habilitado para su reporte inmediato.

---

### [RNF-03] Seguridad del Software y Proteccion de Datos
- **Atributo de Calidad:** Seguridad Informatica (Security & Confidentiality).
- **Que define para el Sistema:** El software debe proteger la privacidad e integridad de los datos institucionales transmitidos y almacenados, resguardando las credenciales y la informacion privada de las solicitudes.
- **Criterio de Medicion y Aceptacion:**
  - Todo el trafico entre el navegador y el servidor debe cursar obligatoriamente bajo protocolo web seguro (HTTPS con TLS 1.3).
  - Las contrasenas deben procesarse mediante algoritmos de derivacion criptografica irreversibles.
  - El sistema debe protegerse de vulnerabilidades comunes en aplicaciones web (inyecciones SQL mediante consultas parametrizadas, ataques XSS mediante sanitizacion de entradas y proteccion contra manipulacion de sesiones activas).
- **Impacto en el Servicio:** Protege los activos de informacion institucional y previene intrusiones o accesos no autorizados a la infraestructura corporativa.

---

### [RNF-04] Usabilidad y Adaptabilidad Multidispositivo
- **Atributo de Calidad:** Usabilidad y Adaptabilidad (Usability & Responsiveness).
- **Que define para el Sistema:** La interfaz debe ser clara, intuitiva y accesible desde distintos dispositivos de trabajo (computadoras de escritorio, laptops, tablets y telefonos moviles institucionales).
- **Criterio de Medicion y Aceptacion:**
  - La interfaz de usuario debe adaptarse fluidamente a pantallas con anchos desde 360 pixeles hasta monitores de alta resolucion, sin perdida de funcionalidad ni desbordamientos horizontales.
  - Cualquier colaborador debe ser capaz de registrar una solicitud de soporte en menos de 3 minutos sin requerir capacitaciones tecnicas previas.
  - La plataforma debe presentar retroalimentacion visual clara (mensajes descriptivos de exito, aviso o error) que guie al usuario ante omisiones o errores de llenado.
- **Impacto en el Servicio:** Facilita la adopcion inmediata de la herramienta por parte de los trabajadores y permite a jefes y supervisores autorizar o derivar casos desde sus dispositivos moviles en cualquier momento.

---

### [RNF-05] Escalabilidad y Capacidad Concurrente
- **Atributo de Calidad:** Capacidad y Escalabilidad (Scalability & Capacity).
- **Que define para el Sistema:** La arquitectura del software debe soportar el crecimiento de la demanda de atenciones y el incremento progresivo de personal sin degradar sus estandares de rendimiento.
- **Criterio de Medicion y Aceptacion:**
  - El sistema debe soportar un minimo de 50 usuarios concurrentes realizando transacciones simultaneas y almacenar mas de 10,000 expedientes historicos sin presentar bloqueos de base de datos ni incremento superior al 20% en los tiempos de respuesta.
- **Impacto en el Servicio:** Garantiza la viabilidad del producto tanto para su uso corporativo actual como para su distribucion a organizaciones de mediana envergadura.

---

### [RNF-06] Mantenibilidad, Modularidad y Arquitectura
- **Atributo de Calidad:** Mantenibilidad y Portabilidad (Maintainability & Modularity).
- **Que define para el Sistema:** La aplicacion debe estructurarse con componentes desacoplados, ordenados y legibles que faciliten su evolucion continua y adaptacion a nuevos requerimientos del negocio.
- **Criterio de Medicion y Aceptacion:**
  - Separacion estricta en tres capas logicas: capa de presentacion visual, capa de servicios y logica del negocio, y capa de persistencia de datos.
  - Modulos independientes para administracion, catalogo de servicios, gestion de tecnicos y ciclo de vida de tickets, permitiendo modificar o incorporar reglas operativas sin alterar el funcionamiento global de la plataforma.
  - Registro centralizado de excepciones y errores para diagnostico rapido por parte del equipo de desarrollo.
- **Impacto en el Servicio:** Reduce el costo y tiempo de mantenimiento, facilitando la incorporacion de nuevas funcionalidades de mesa de ayuda a lo largo del tiempo.


---

## Parte III — Reglas de Negocio

## Informacion del Documento y Marco Metodologico

- **Proyecto:** Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITSM)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Concepto Fundamental de Regla de Negocio (Business Rule):**
  - Una regla de negocio es una directriz, restriccion o condicion logica que dicta como debe operar la organizacion y prestar sus servicios de soporte de tecnologia de la informacion.
  - **Existe independientemente del software**: define politicas empresariales, acuerdos de nivel de servicio (SLA), delegacion de autoridad, lineas de mando y principios de calidad y confidencialidad de la organizacion.
  - El software de Service Desk tiene la mision de cumplir y automatizar estas reglas de manera estricta y transparente, sin que la implementacion tecnica suplante la logica del negocio.
- **Roles Oficiales de la Organizacion (10):**
  1. **Solicitante:** Trabajador o cliente que requiere asistencia tecnica, solicita servicios del catalogo, consulta manuales de ayuda, entrega evidencias y evalua la calidad del servicio recibido.
  2. **Tecnico:** Especialista operativo que atiende incidentes asignados o disponibles, coordina acciones tecnicas internas, sustenta evidencias, documenta la solucion final y registra solicitudes de cambio RFC operativas.
  3. **Supervisor:** Lider del departamento tecnico encargado de coordinar al equipo, equilibrar la carga de trabajo (WIP), autorizar reasignaciones, monitorear el cumplimiento de plazos SLA y generar reportes gerenciales.
  4. **Gestor de Area:** Responsable departamental con atribuciones para autorizar o desaprobar solicitudes que involucren recursos, compras, licencias o accesos de su personal.
  5. **Auditor:** Revisor formal que vigila la transparencia de las atenciones, el cumplimiento de acuerdos de servicio, los logs de seguridad ISO 27001 y la inalterabilidad del historial operativo (estricto modo de solo lectura).
  6. **Administrador:** Responsable institucional del gobierno y configuracion de la plataforma: parametriza formularios, esquemas de datos, plantillas RFC, catalogos de servicios, acuerdos SLA/OLA, estructura del menu y perfiles RBAC, sin realizar operaciones transaccionales de atencion o cambio.
  7. **Aprobador (CAB):** Autoridad de Cambio integrante del Change Advisory Board facultada para evaluar colegiadamente el riesgo, impacto y autorizar o rechazar solicitudes de cambio (RFC) tecnicas.
  8. **Gestor de Cambios:** Change Manager responsable del proceso integral de Habilitacion del Cambio: coordina el calendario de cambios, ventanas de mantenimiento, periodos de congelamiento (freeze), comites CAB y revisiones post-implementacion (PIR).
  9. **Gestor de Activos y Configuracion:** Custodio tecnologico responsable del inventario de hardware (HAM), la base de datos de configuracion (CMDB) y el cumplimiento de licencias de software (SAM).
  10. **Gestor de Problemas:** Responsable de la gestion de problemas, la priorizacion y el analisis de causa raiz, la KEDB y los workarounds, y de la coordinacion de cambios definitivos con el Gestor de Cambios.
- **Terminologia Estandarizada:** Se utiliza exclusivamente el termino "usuario" o "usuarios".

---

## 1. Justificacion de la Secuencia Operativa del Negocio

Las directrices del negocio de soporte se ordenan siguiendo la jerarquia natural de dependencias organizacionales:

```
+----------------------------------------------------------------------------------------------------+
|                         JERARQUIA OPERATIVA DEL SERVICIO DE SOPORTE                                |
+----------------------------------------------------------------------------------------------------+
| 1. GOBERNANZA, IDENTIDAD Y CONFIDENCIALIDAD DEL SERVICIO                                           |
|    - Directrices sobre acreditacion de identidad, confidencialidad, no repudio y trazabilidad.     |
|    - Justificacion: Sin reglas de identidad y confidencialidad, ninguna atencion es valida.       |
+----------------------------------------------------------------------------------------------------+
|                                                  |
|                                                  v
+----------------------------------------------------------------------------------------------------+
| 2. GESTION DE USUARIOS Y ROLES ORGANIZACIONALES                                                    |
|    - Directrices sobre delimitacion de responsabilidades, roles de trabajo y separacion de puestos.|
|    - Justificacion: Define quienes componen la organizacion y que facultades posee cada colaborador|
+----------------------------------------------------------------------------------------------------+
|                                                  |
|                                                  v
+----------------------------------------------------------------------------------------------------+
| 3. CATALOGO DE SERVICIOS Y ACUERDOS DE NIVEL DE SERVICIO (SLA)                                     |
|    - Directrices sobre portafolio formal de atenciones, metas de tiempo, compuertas y autoayuda.   |
|    - Justificacion: Establece que compromisos asume TI con la empresa antes de recibir solicitudes.|
+----------------------------------------------------------------------------------------------------+
|                                                  |
|                                                  v
+----------------------------------------------------------------------------------------------------+
| 4. DEPARTAMENTOS TECNICOS Y CAPACIDAD OPERATIVA                                                    |
|    - Directrices sobre supervisores de area, niveles de pericia, disponibilidad y topes de carga. |
|    - Justificacion: Organiza la estructura y capacidad del equipo humano que brinda la atencion.   |
+----------------------------------------------------------------------------------------------------+
|                                                  |
|                                                  v
+----------------------------------------------------------------------------------------------------+
| 5. CICLO DE VIDA DE TICKETS, CALIDAD Y CIERRE                                                      |
|    - Directrices de atencion, aprobacion de jefes, coordinacion interna, alertas y evaluacion.     |
|    - Justificacion: Regula la ejecucion real del servicio: atencion oportuna, justa y transparente.|
+----------------------------------------------------------------------------------------------------+
|                                                  |
|                                                  v
+----------------------------------------------------------------------------------------------------+
| 6. HABILITACION DEL CAMBIO Y EVALUACION COLEGIADA (CAB)                                            |
|    - Directrices sobre solicitudes RFC, ventanas de mantenimiento, change freeze y revision PIR.   |
|    - Justificacion: Previene la interrupcion no planificada de servicios por cambios descontrolados.|
+----------------------------------------------------------------------------------------------------+
|                                                  |
|                                                  v
+----------------------------------------------------------------------------------------------------+
| 7. GESTION DE ACTIVOS TECNOLOGICOS Y CMDB (ITAM / SACM)                                            |
|    - Directrices sobre custodia patrimonial (HAM), mapa de topologia CI y licencias (SAM).        |
|    - Justificacion: Mantiene la visibilidad exacta de la infraestructura que soporta el negocio.   |
+----------------------------------------------------------------------------------------------------+
|                                                  |
|                                                  v
+----------------------------------------------------------------------------------------------------+
| 8. GOBERNANZA ADMINISTRATIVA Y DISENO DE FORMULARIOS / PLANTILLAS                                  |
|    - Directrices sobre configuracion de esquemas, formularios RFC, matriz RBAC y logs ISO 27001.   |
|    - Justificacion: Segrega el diseno y administracion del sistema frente a la operacion tecnica.   |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Resumen del Catalogo de Reglas de Negocio (RN)

```
+----------------------------------------------------------------------------------------------------+
|                                REGLAS DE NEGOCIO DEL SISTEMA (RN)                                  |
+-------------+----------------------------------------------+---------------------------------------+
| Codigo      | Nombre de la Regla                           | Dominio del Sistema                   |
+-------------+----------------------------------------------+---------------------------------------+
| RN-01       | Identificacion Obligatoria y No Repudio      | 1. GOBERNANZA Y CONFIDENCIALIDAD      |
| RN-02       | Confidencialidad de la Informacion           | 1. GOBERNANZA Y CONFIDENCIALIDAD      |
| RN-03       | Trazabilidad e Inalterabilidad Operativa     | 1. GOBERNANZA Y CONFIDENCIALIDAD      |
| RN-04       | Segregacion y Prevencion de Conflictos       | 1. GOBERNANZA Y CONFIDENCIALIDAD      |
+-------------+----------------------------------------------+---------------------------------------+
| RN-05       | Delimitacion de Responsabilidades por Puesto | 2. USUARIOS Y ROLES                   |
| RN-06       | Exclusividad de Rol en Ejecucion             | 2. USUARIOS Y ROLES                   |
| RN-07       | Restriccion de Atribuciones y Privilegios    | 2. USUARIOS Y ROLES                   |
| RN-08       | Unicidad de Identidad Corporativa            | 2. USUARIOS Y ROLES                   |
+-------------+----------------------------------------------+---------------------------------------+
| RN-09       | Formalizacion del Portafolio de Servicios    | 3. CATALOGO DE SERVICIOS              |
| RN-10       | Cumplimiento Obligatorio de Tiempos de SLA   | 3. CATALOGO DE SERVICIOS              |
| RN-11       | Estandarizacion de Protocolos de Atencion    | 3. CATALOGO DE SERVICIOS              |
| RN-12       | Autorizacion Previa para Recursos Criticos   | 3. CATALOGO DE SERVICIOS              |
| RN-13       | Politica de Fomento al Autoservicio          | 3. CATALOGO DE SERVICIOS              |
+-------------+----------------------------------------------+---------------------------------------+
| RN-14       | Responsabilidad Jerarquica y Supervision     | 4. DEPARTAMENTOS TECNICOS             |
| RN-15       | Asignacion Escalonada por Complejidad        | 4. DEPARTAMENTOS TECNICOS             |
| RN-16       | Limite de Capacidad y Control de Saturacion  | 4. DEPARTAMENTOS TECNICOS             |
| RN-17       | Asignacion Exclusiva a Personal en Turno     | 4. DEPARTAMENTOS TECNICOS             |
+-------------+----------------------------------------------+---------------------------------------+
| RN-18       | Diferenciacion entre Incidentes y Solicitudes| 5. CICLO DE VIDA DE TICKETS           |
| RN-19       | Codigo Institucional Unico de Expediente     | 5. CICLO DE VIDA DE TICKETS           |
| RN-20       | Priorizacion Basada en Impacto y Urgencia    | 5. CICLO DE VIDA DE TICKETS           |
| RN-21       | Sustento Obligatorio ante Denegacion         | 5. CICLO DE VIDA DE TICKETS           |
| RN-22       | Suspension de Tiempos por Espera de Usuario  | 5. CICLO DE VIDA DE TICKETS           |
| RN-23       | Reserva de la Deliberacion Tecnica Interna   | 5. CICLO DE VIDA DE TICKETS           |
| RN-24       | Sustento Obligatorio de la Solucion Tecnica  | 5. CICLO DE VIDA DE TICKETS           |
| RN-25       | Evaluacion Exclusiva por el Solicitante      | 5. CICLO DE VIDA DE TICKETS           |
| RN-26       | Cierre por Aceptacion Tacita tras 48 Horas   | 5. CICLO DE VIDA DE TICKETS           |
| RN-27       | Admisibilidad Segura de Evidencias           | 5. CICLO DE VIDA DE TICKETS           |
| RN-28       | Escalamiento Proactivo al 80% del Plazo      | 5. CICLO DE VIDA DE TICKETS           |
| RN-29       | Notificacion Oportuna de Hitos del Servicio  | 5. CICLO DE VIDA DE TICKETS           |
| RN-30       | Custodia de Indicadores Gerenciales          | 5. CICLO DE VIDA DE TICKETS           |
+-------------+----------------------------------------------+---------------------------------------+
| RN-31       | Voto Colegiado Obligatorio en Comite CAB     | 6. HABILITACION DEL CAMBIO            |
| RN-32       | Autoexclusion por Conflicto en Votacion CAB  | 6. HABILITACION DEL CAMBIO            |
| RN-33       | Respeto de Ventanas y Congelamiento (Freeze) | 6. HABILITACION DEL CAMBIO            |
| RN-34       | Plan Obligatorio de Reversion y Revision PIR | 6. HABILITACION DEL CAMBIO            |
+-------------+----------------------------------------------+---------------------------------------+
| RN-35       | Integridad y Relaciones Topologicas en CMDB  | 7. GESTION DE ACTIVOS Y CMDB          |
| RN-36       | Trazabilidad Legal de Licenciamiento SAM     | 7. GESTION DE ACTIVOS Y CMDB          |
+-------------+----------------------------------------------+---------------------------------------+
| RN-37       | Segregacion entre Configuracion y Operacion  | 8. GOBERNANZA ADMINISTRATIVA          |
| RN-38       | Inmutabilidad de Matriz RBAC y Logs ISO27001 | 8. GOBERNANZA ADMINISTRATIVA          |
| RN-39       | Transiciones y Custodia de Activos (ITAM)    | 7. GESTION DE ACTIVOS Y CMDB          |
| RN-40       | Ciclo Editorial y Vigencia del Saber (KCS)   | 8. GOBERNANZA ADMINISTRATIVA          |
| RN-41       | Purga Segura con No Repudio en Auditoria     | 8. GOBERNANZA ADMINISTRATIVA          |
+-------------+----------------------------------------------+---------------------------------------+
```

---

## 3. Especificacion Detallada de Reglas de Negocio

---

### Dominio 1: GOBERNANZA, IDENTIDAD Y CONFIDENCIALIDAD DEL SERVICIO

#### [RN-01] Identificacion Obligatoria y No Repudio del Solicitante
- **Directriz de Negocio:** Toda solicitud de asistencia tecnica o requerimiento de recursos debe estar formalmente vinculada a un colaborador activo de la organizacion, con identidad debidamente acreditada. Quedan terminantemente prohibidas las atenciones anonimas o solicitudes a nombre de terceros sin delegacion formal.
- **Razon de Negocio:** Garantizar el principio de no repudio, la responsabilidad operativa individual y la legitimidad en el uso de los recursos corporativos.
- **Automatizacion en el Software:** El software exige la autenticacion previa del usuario y asocia de forma indeleble la identidad del solicitante al ticket creado, impidiendo el registro de peticiones sin titular identificado.
- **Roles Involucrados:** Solicitante y Administrador.

#### [RN-02] Confidencialidad de la Informacion Institucional en Servicios
- **Directriz de Negocio:** Toda informacion corporativa, configuraciones de red, credenciales temporales, actas o datos de negocio expuestos durante el tramite y resolucion de un ticket estan amparados bajo el principio de reserva y secreto profesional corporativo. Ningun miembro de la organizacion puede divulgar ni utilizar dicha informacion fuera del ambito estricto de la atencion tecnica.
- **Razon de Negocio:** Proteger los activos de informacion, la privacidad de los usuarios y el secreto comercial de la empresa.
- **Automatizacion en el Software:** El software restringe el acceso a los detalles y adjuntos del ticket unicamente a las partes legitimamente autorizadas (solicitante, tecnicos asignados, supervisor y auditor).
- **Roles Involucrados:** Todos los roles del sistema.

#### [RN-03] Trazabilidad e Inalterabilidad de la Evidencia Operativa
- **Directriz de Negocio:** Todo evento ocurrido a lo largo del ciclo de vida del servicio (apertura, derivacion, cambios de estado, aprobaciones de jefatura, notas tecnicas y actas de conformidad) constituye un registro probatorio inmutable de auditoria institucional. Ningun colaborador esta facultado para modificar, alterar o eliminar hechos ya sucedidos en el historial.
- **Razon de Negocio:** Garantizar la transparencia, la responsabilidad de gestion y el cumplimiento de normativas de auditoria interna y estandares de calidad de servicio (ITIL / ISO 20000).
- **Automatizacion en el Software:** El software almacena cada suceso en una bitacora cronologica acumulativa de solo lectura, bloqueando de forma absoluta cualquier instruccion de edicion o eliminacion de registros historicos.
- **Roles Involucrados:** Todos los roles; ningun usuario (ni siquiera el Administrador) puede borrar trazas del sistema.

#### [RN-04] Segregacion de Funciones y Prevencion de Conflicto de Interes
- **Directriz de Negocio:** En la prestacion de servicios rige el principio de estricta separacion de responsabilidades: quien solicita un servicio o recurso tecnico no puede autorizar su propio pedido ni autoasignarse la atencion tecnica resolutiva para beneficio propio.
- **Razon de Negocio:** Evitar fraudes, colusion interna, autoaprobacion de privilegios indebidos y desvio irregular de los activos tecnologicos de la empresa.
- **Automatizacion en el Software:** El software valida la identidad del solicitante frente a las acciones de aprobacion y resolucion, bloqueando de forma automatica que un usuario apruebe o cierre tickets donde figure como solicitante.
- **Roles Involucrados:** Solicitante, Gestor de Area, Tecnico y Supervisor.

---

### Dominio 2: GESTION DE USUARIOS Y ROLES ORGANIZACIONALES

#### [RN-05] Delimitacion de Responsabilidades por Puesto
- **Directriz de Negocio:** La mesa de ayuda opera bajo diez perfiles institucionales claramente delimitados: Solicitante, Tecnico, Supervisor, Gestor de Area, Auditor, Administrador, Aprobador (CAB), Gestor de Cambios, Gestor de Activos y Configuracion, y Gestor de Problemas. Cada puesto laboral ejerce exclusivamente las atribuciones asignadas formalmente por la organizacion.
- **Razon de Negocio:** Organizar el trabajo segun la estructura funcional de la empresa y asegurar que cada area responda por su ambito de competencia.
- **Automatizacion en el Software:** El software controla los privilegios operativos mediante control de acceso basado en roles, habilitando a cada perfil unicamente sus funciones autorizadas.
- **Roles Involucrados:** Los 10 roles oficiales del sistema.

#### [RN-06] Exclusividad de Rol en Ejecucion
- **Directriz de Negocio:** Cuando un colaborador ejerza funciones tecnicas o de supervision y simultaneamente requiera tramitar pedidos de soporte como usuario particular, debe actuar formalmente bajo una sola condicion a la vez durante su interaccion con el servicio.
- **Razon de Negocio:** Impedir que se utilicen facultades tecnicas o de jefatura para otorgarse ventajas, saltar aprobaciones o alterar prioridades en tramites de interes personal.
- **Automatizacion en el Software:** El software exige seleccionar un perfil activo por sesion, requiriendo conmutar expresamente de rol para ejercer facultades distintas y registrando bajo cual rol se ejecuto cada accion.
- **Roles Involucrados:** Colaboradores que dispongan de mas de un perfil asignado.

#### [RN-07] Restriccion de Atribuciones y Minimo Privilegio Operativo
- **Directriz de Negocio:** Los colaboradores unicamente tienen facultad para consultar y gestionar la informacion y expedientes pertinentes al cumplimiento estricto de sus funciones laborales.
- **Razon de Negocio:** Cuidar la privacidad corporativa y evitar que el personal interfiera en atenciones ajenas a su area de responsabilidad.
- **Automatizacion en el Software:** El software adapta la navegacion y las vistas de datos mostrando con exclusividad lo autorizado para el puesto en uso, bloqueando el acceso a rutas y expedientes no correspondientes.
- **Roles Involucrados:** Todos los colaboradores.

#### [RN-08] Unicidad de Identidad Corporativa por Trabajador
- **Directriz de Negocio:** Cada colaborador habilitado en el servicio debe poseer una unica identidad institucional respaldada por su correo corporativo y documento oficial, garantizandose la trazabilidad univoca de sus solicitudes y atenciones.
- **Razon de Negocio:** Garantizar la responsabilidad operativa individual y evitar la fragmentacion del historial de atenciones de una persona.
- **Automatizacion en el Software:** El software valida la unicidad del correo institucional y del documento de identidad en el alta de usuarios, prohibiendo registros duplicados.
- **Roles Involucrados:** Administrador y colaboradores registrados.

---

### Dominio 3: CATALOGO DE SERVICIOS Y ACUERDOS DE NIVEL DE SERVICIO (SLA)

#### [RN-09] Formalizacion del Portafolio de Servicios
- **Directriz de Negocio:** Toda asistencia tecnica prestada a la empresa debe estar catalogada formalmente, especificando su objetivo, area responsable, impacto y si requiere visto bueno. No se gestionan requerimientos informales ni atenciones fuera de catalogo.
- **Razon de Negocio:** Desterrar la atencion discrecional o por favoritismos, ordenando la demanda en funcion de los compromisos oficiales de TI con la organizacion.
- **Automatizacion en el Software:** El software estructura el portafolio y condiciona la apertura de cualquier solicitud a su seleccion dentro del catalogo formal.
- **Roles Involucrados:** Administrador (publica) y Solicitante (utiliza).

#### [RN-10] Cumplimiento Obligatorio de Tiempos de Servicio (SLA)
- **Directriz de Negocio:** Todo servicio catalogado debe contar con compromisos temporales maximos: plazo limite de primera respuesta (primer contacto con el usuario) y plazo limite de solucion definitiva, acordados con la direccion.
- **Razon de Negocio:** Garantizar la continuidad de los procesos de negocio de la empresa y permitir la evaluacion objetiva de la eficiencia del soporte.
- **Automatizacion en el Software:** El software inicia cronometros operativos al crearse la solicitud y computa el cumplimiento de los tiempos acordados.
- **Roles Involucrados:** Tecnico (cumple), Supervisor (supervisa) y Solicitante (se beneficia).

#### [RN-11] Estandarizacion de Protocolos de Atencion
- **Directriz de Negocio:** Los servicios que involucren configuraciones delicadas, entrega de activos o modificaciones de infraestructura deben ejecutarse siguiendo un protocolo estricto de pasos secuenciales y verificables.
- **Razon de Negocio:** Estandarizar la calidad de atencion y evitar fallas posteriores derivadas de la omision involuntaria de pasos tecnicos.
- **Automatizacion en el Software:** El software despliega listas de comprobacion obligatorias asociadas al servicio y exige su validacion antes de permitir concluir la tarea.
- **Roles Involucrados:** Tecnicos y Supervisores.

#### [RN-12] Autorizacion Previa para Recursos Criticos
- **Directriz de Negocio:** Toda peticion que implique adquisicion de equipos, licencias de software con costo institucional o accesos a sistemas estrategicos requiere la aprobacion formal del jefe de area del trabajador antes de comprometer recursos de TI.
- **Razon de Negocio:** Controlar el gasto presupuestal de la empresa y resguardar la seguridad de la informacion corporativa.
- **Automatizacion en el Software:** El software suspende el pase a la bandeja tecnica de servicios marcados con aprobacion obligatoria hasta que el Gestor de Area emita su autorizacion formal.
- **Roles Involucrados:** Solicitante, Gestor de Area y Tecnico.

#### [RN-13] Politica de Fomento al Autoservicio
- **Directriz de Negocio:** La organizacion promueve la resolucion autonoma de dudas operativas e incidentes recurrentes mediante guias y manuales de ayuda rapida estandarizados, evitando la saturacion innecesaria del personal tecnico.
- **Razon de Negocio:** Incrementar la autonomia y productividad de los colaboradores, liberando capacidad tecnica para problemas de alta complejidad.
- **Automatizacion en el Software:** El software sugiere articulos de autoayuda relevantes segun la categoria seleccionada antes de permitir el envio de un nuevo ticket.
- **Roles Involucrados:** Solicitante (consulta) y Supervisor/Administrador (mantiene el contenido).

---

### Dominio 4: DEPARTAMENTOS TECNICOS Y CAPACIDAD OPERATIVA

#### [RN-14] Responsabilidad Jerarquica y Supervision por Area
- **Directriz de Negocio:** Cada departamento tecnico debe contar con un Supervisor formal a cargo de la conduccion del equipo, el cumplimiento de los plazos de entrega y la disciplina operativa de su especialidad.
- **Razon de Negocio:** Establecer lineas claras de liderazgo, responsabilidad de gestion y gestion de la calidad por cada dominio tecnico.
- **Automatizacion en el Software:** El software vincula a cada supervisor con su respectivo departamento, otorgandole facultades de balanceo, reasignacion y monitoreo de SLAs.
- **Roles Involucrados:** Administrador y Supervisor.

#### [RN-15] Asignacion Escalonada por Niveles de Complejidad
- **Directriz de Negocio:** Los requerimientos de soporte se distribuyen segun el nivel de experiencia del personal: Nivel 1 para recepcion y soporte basico, Nivel 2 para especialistas de campo y sistemas, Nivel 3 para infraestructura central y proyectos especializados.
- **Razon de Negocio:** Optimizar la resolucion en primer contacto y reservar a los especialistas mas avanzados para incidentes criticos de alto impacto.
- **Automatizacion en el Software:** El software registra los niveles de competencia de los tecnicos y facilita la derivacion escalonada segun la naturaleza y complejidad del caso.
- **Roles Involucrados:** Supervisor y Tecnico.

#### [RN-16] Limite de Capacidad y Control de Saturacion Tecnica
- **Directriz de Negocio:** Ningun tecnico de soporte puede tener bajo su responsabilidad mas casos activos de los que puede atender con calidad (fijado por defecto en ocho casos concurrentes).
- **Razon de Negocio:** Prevenir la sobrecarga laboral del personal, evitar cuellos de botella y preservar altos estandares de servicio.
- **Automatizacion en el Software:** El software bloquea la asignacion de nuevos tickets a un especialista cuando este alcanza su capacidad maxima de casos en proceso.
- **Roles Involucrados:** Tecnico y Supervisor.

#### [RN-17] Asignacion Exclusiva a Personal en Turno Activo
- **Directriz de Negocio:** Los tickets de soporte solo pueden ser entregados a especialistas que se encuentren cumpliendo turno laboral activo y con disponibilidad declarada.
- **Razon de Negocio:** Evitar que las solicitudes de los usuarios queden desatendidas en bandejas de especialistas ausentes por descansos, permisos o vacaciones.
- **Automatizacion en el Software:** El software filtra y excluye de las listas de asignacion a aquellos tecnicos cuyo estado sea distinto a Disponible o En Turno.
- **Roles Involucrados:** Tecnicos y Supervisores.

---

### Dominio 5: CICLO DE VIDA DE TICKETS, CALIDAD Y CIERRE

#### [RN-18] Diferenciacion Operativa entre Incidentes y Solicitudes de Servicio
- **Directriz de Negocio:** La mesa de ayuda distingue rigurosamente entre:
  - Incidente (Falla): Suceso no planificado que interrumpe o degrada el trabajo del usuario y requiere restauracion inmediata sin tramites de autorizacion.
  - Solicitud de Servicio: Peticion formal de un nuevo recurso o servicio contemplado en el catalogo, planificable y sujeta a politicas de aprobacion.
- **Razon de Negocio:** Otorgar maxima prioridad a la continuidad operativa del negocio frente a requerimientos nuevos que admiten programacion.
- **Automatizacion en el Software:** El software procesa los requerimientos aplicando reglas operativas y de validacion distintas segun el tipo seleccionado.
- **Roles Involucrados:** Solicitante y Tecnico.

#### [RN-19] Codigo Institucional Unico de Expediente
- **Directriz de Negocio:** Toda atencion iniciada en la mesa de servicios debe contar con una clave unica e irrepetible para su consulta, auditoria y seguimiento formal durante todo su ciclo de vida.
- **Razon de Negocio:** Respaldar la existencia de un expediente administrativo ordenado, localizable e inalterable.
- **Automatizacion en el Software:** El software genera automaticamente el correlativo oficial (`INC-ANO-NUMERO` o `REQ-ANO-NUMERO`) al crearse la solicitud y prohibe su alteracion.
- **Roles Involucrados:** Todos los roles que intervienen en la atencion.

#### [RN-20] Priorizacion Objetiva por Matriz de Impacto y Urgencia
- **Directriz de Negocio:** El orden de resolucion de los requerimientos de soporte se determina mediante la gravedad objetiva del caso (magnitud del perjuicio sobre el negocio y cantidad de usuarios perjudicados), anteponiendo siempre el bienestar de la empresa a intereses particulares.
- **Razon de Negocio:** Garantizar que los incidentes que paralizan areas clave del negocio se resuelvan con prioridad maxima.
- **Automatizacion en el Software:** El software calcula de forma automatica la prioridad resultante cruzando el nivel de impacto institucional con la urgencia operativa declarada.
- **Roles Involucrados:** Solicitante y Tecnico.

#### [RN-21] Sustento Obligatorio ante Denegacion de Solicitudes
- **Directriz de Negocio:** Toda solicitud que requiera visto bueno queda condicionada a la decision del responsable de area; en caso de denegacion, la jefatura debe registrar obligatoriamente la justificacion del rechazo y el pedido queda formalmente cancelado.
- **Razon de Negocio:** Garantizar la transparencia y fundamentacion al respetar las facultades resolutivas de la linea de mando institucional.
- **Automatizacion en el Software:** El software exige el motivo del rechazo, da por cancelado el caso de manera definitiva e informa de inmediato al colaborador.
- **Roles Involucrados:** Gestor de Area y Solicitante.

#### [RN-22] Suspension de Tiempos de SLA por Espera de Usuario
- **Directriz de Negocio:** Cuando la labor tecnica se detenga obligatoriamente a la espera de que el solicitante brinde mayor informacion o realice una prueba de campo, el computo del tiempo limite de solucion se congela.
- **Razon de Negocio:** Medir con justicia el desempeno del equipo tecnico, evitando penalizar sus metricas por demoras imputables a la respuesta del usuario.
- **Automatizacion en el Software:** El software pausa el reloj de tiempo de atencion durante el estado en espera y ajusta la fecha limite prometida al reanudarse el trabajo.
- **Roles Involucrados:** Tecnico y Solicitante.

#### [RN-23] Reserva de la Coordinacion y Deliberacion Tecnica
- **Directriz de Negocio:** Las deliberaciones de diagnostico interno, pruebas preliminares y coordinaciones entre especialistas son privadas y no deben exponerse al solicitante para evitar malentendidos o alarmas infundadas.
- **Razon de Negocio:** Cuidar la comunicacion formal hacia el colaborador y resguardar las notas de trabajo internas del area de soporte.
- **Automatizacion en el Software:** El software provee un canal de notas internas dentro del expediente, restringiendo su lectura y escritura exclusivamente a tecnicos y supervisores.
- **Roles Involucrados:** Tecnicos y Supervisores.

#### [RN-24] Sustento Obligatorio de la Solucion Tecnica
- **Directriz de Negocio:** Ningun caso tecnico puede declararse terminado sin que el especialista detalle en lenguaje claro el procedimiento correctivo aplicado y seleccione la categoria de solucion correspondiente.
- **Razon de Negocio:** Fortalecer la memoria operativa de soporte tecnico y brindar constancia verificable del trabajo entregado.
- **Automatizacion en el Software:** El software impide el cambio a estado resuelto si no se completan la descripcion de la solucion y la categoria de cierre.
- **Roles Involucrados:** Tecnico y Auditor.

#### [RN-25] Evaluacion de Satisfaccion Exclusiva por el Solicitante Titular
- **Directriz de Negocio:** La calificacion del servicio y el trato brindado corresponde unica y exclusivamente al colaborador que solicito la atencion.
- **Razon de Negocio:** Salvaguardar la fidelidad de los indicadores de satisfaccion, evitando que terceros o los propios tecnicos alteren las evaluaciones.
- **Automatizacion en el Software:** El software activa la encuesta de conformidad exclusivamente en la interfaz del colaborador titular del requerimiento.
- **Roles Involucrados:** Solicitante y Supervisor.

#### [RN-26] Cierre por Aceptacion Tacita tras Plazo de Conformidad
- **Directriz de Negocio:** Notificada la solucion del caso, el trabajador dispone de un plazo de dos dias habiles (48 horas) para expresar su conformidad o solicitar la reapertura si el inconveniente continua; vencido ese plazo sin comentarios, se asume la conformidad tacita y el expediente queda formalmente cerrado.
- **Razon de Negocio:** Evitar la acumulacion indefinida de casos pendientes de cierre y ordenar los cierres contables y operativos de soporte.
- **Automatizacion en el Software:** El software efectua el cierre definitivo automatico tras transcurrir 48 horas sin observaciones por parte del solicitante.
- **Roles Involucrados:** Solicitante y Sistema.

#### [RN-27] Admisibilidad Segura de Evidencias Documentales
- **Directriz de Negocio:** Las evidencias de fallas (capturas de error, actas o documentos de respaldo) deben aportarse en formatos estandarizados de imagen o documento, prohibiendose el envio de archivos de ejecucion que pongan en peligro la seguridad de la red.
- **Razon de Negocio:** Disponer de informacion probatoria fidedigna para el diagnostico resguardando la infraestructura informatica de la empresa.
- **Automatizacion en el Software:** El software restringe los adjuntos a formatos autorizados (PNG, JPG, PDF) con limite de cinco megabytes, rechazando extensiones potencialmente riesgosas.
- **Roles Involucrados:** Solicitante y Tecnico.

#### [RN-28] Escalamiento Proactivo ante Riesgo de Vencimiento de SLA
- **Directriz de Negocio:** La mesa de soporte trabaja bajo un criterio de prevencion activa: cuando un caso consuma el ochenta por ciento de su tiempo limite sin estar solucionado, la jefatura del area tecnica debe ser alertada para intervenir antes del vencimiento.
- **Razon de Negocio:** Prevenir el incumplimiento de los acuerdos de servicio y mitigar la insatisfaccion de los colaboradores de la empresa.
- **Automatizacion en el Software:** El software despliega alertas visuales en amarillo para el supervisor cuando el avance del cronometro llega al 80% del plazo pactado.
- **Roles Involucrados:** Supervisor y Tecnico.

#### [RN-29] Notificacion Oportuna de Hitos del Servicio
- **Directriz de Negocio:** La mesa de ayuda mantiene informados a los colaboradores sobre cada acontecimiento relevante del caso (registro, asignacion, aprobacion, solucion y cierre) sin que el trabajador deba acudir a consultar el estado.
- **Razon de Negocio:** Disminuir la incertidumbre del colaborador y evitar la sobrecarga de consultas reiterativas al personal tecnico.
- **Automatizacion en el Software:** El software despacha comunicaciones automaticas por correo electronico ante cada cambio de estado significativo en el expediente.
- **Roles Involucrados:** Solicitante, Gestor de Area y Tecnico.

#### [RN-30] Custodia de Indicadores Gerenciales del Servicio
- **Directriz de Negocio:** Las estadisticas consolidadas sobre volumen de demanda, tiempos promedio de atencion, causas de fallas recurrentes y desempeno por departamento constituyen informacion gerencial reservada para la toma de decisiones directivas y la mejora continua del servicio.
- **Razon de Negocio:** Preservar la confidencialidad de los indicadores institucionales y respaldar las auditorias formales de gestion.
- **Automatizacion en el Software:** El software restringe las vistas consolidadas y la descarga de reportes ejecutivos exclusivamente a los perfiles de Supervisor y Auditor.
- **Roles Involucrados:** Supervisor y Auditor.

---

### Dominio 6: HABILITACION DEL CAMBIO Y EVALUACION COLEGIADA (CAB)

#### [RN-31] Voto Colegiado Obligatorio en Comite CAB
- **Directriz de Negocio:** Todo cambio sobre la infraestructura tecnologica clasificado como Normal o de Emergencia debe ser evaluado y autorizado colegiadamente por los miembros del Comite Asesor de Cambios (CAB). Ningun cambio puede implementarse en produccion de forma unilateral sin contar con la mayoria calificada de votos aprobatorios registrados en acta.
- **Razon de Negocio:** Mitigar el riesgo operacional de caidas de servicio y garantizar la revision multidisciplinaria de impactos tecnicos y de negocio.
- **Automatizacion en el Software:** El software bloquea el paso de la solicitud RFC al estado "Aprobado / Listo para Despliegue" hasta que se registre el dictamen favorable con el quorum de votos requeridos en la bandeja CAB.
- **Roles Involucrados:** Aprobador (CAB) y Gestor de Cambios.

#### [RN-32] Autoexclusion por Conflicto de Interes en Votacion CAB (SoD CAB)
- **Directriz de Negocio:** Por principio estricto de Segregacion de Funciones (SoD), ningun miembro del Comite Asesor de Cambios puede votar o emitir dictamen sobre una solicitud RFC en la que figure como solicitante, promotor o tecnico ejecutor asignado.
- **Razon de Negocio:** Garantizar la objetividad e imparcialidad en la evaluacion del riesgo y evitar la autoaprobacion de modificaciones tecnicas.
- **Automatizacion en el Software:** El software valida el identificador del usuario autenticado contra los campos de solicitante y tecnico de la RFC; si coinciden, inhabilita los controles de votacion y marca el voto como "Inhabilitado por Autoexclusion SoD".
- **Roles Involucrados:** Aprobador (CAB) y Gestor de Cambios.

#### [RN-33] Respeto de Ventanas de Mantenimiento y Periodos de Congelamiento (Change Freeze)
- **Directriz de Negocio:** Toda intervencion tecnica programada debe ejecutarse dentro de las ventanas de mantenimiento autorizadas en el calendario corporativo. Queda terminantemente prohibido programar o ejecutar cambios durante periodos de congelamiento (Change Freeze) declarados por la direccion, salvo excepciones criticas autorizadas expresamente como Cambio de Emergencia (ECAB).
- **Razon de Negocio:** Proteger la estabilidad de las operaciones de negocio en temporadas de alta transaccionalidad (cierres contables, campanas comerciales, auditorias).
- **Automatizacion en el Software:** El calendario corporativo de cambios restringe la seleccion de fechas en periodos de freeze, emitiendo una alerta bloqueante si una RFC intenta programarse en una franja no permitida.
- **Roles Involucrados:** Gestor de Cambios y Tecnico.

#### [RN-34] Plan Obligatorio de Reversion (Rollback) y Evaluacion Post-Implementacion (PIR)
- **Directriz de Negocio:** Toda solicitud de cambio debe contar previamente con un plan detallado de marcha atras (rollback) y pruebas de validacion antes de su aprobacion. Finalizado el despliegue, es obligatorio registrar la Revision Post-Implementacion (PIR) documentando si el cambio fue exitoso o requirio reversion.
- **Razon de Negocio:** Minimizar el tiempo de indisponibilidad ante fallas imprevistas y alimentar el ciclo de mejora continua de ITIL v4.
- **Automatizacion en el Software:** El formulario de registro RFC exige como campos obligatorios el plan de pruebas y plan de contingencia/rollback; asimismo, no permite cerrar la RFC sin el informe PIR correspondiente.
- **Roles Involucrados:** Tecnico, Gestor de Cambios y Auditor.

---

### Dominio 7: GESTION DE ACTIVOS TECNOLOGICOS Y CMDB (ITAM / SACM)

#### [RN-35] Integridad y Relaciones Topologicas en CMDB
- **Directriz de Negocio:** Todo elemento de configuracion (servidores, bases de datos, switches, servicios de software) debe estar debidamente documentado en la Base de Datos de Gestion de Configuracion (CMDB), especificando sus relaciones de dependencia logica y fisica.
- **Razon de Negocio:** Evaluar con precision el analisis de impacto de incidentes mayores y solicitudes de cambio antes de intervenir la infraestructura.
- **Automatizacion en el Software:** El modulo CMDB almacena la topologia de relaciones nodo-a-nodo (padre-hijo, dependencia de red, servicio soportado) e impide eliminar un CI activo que mantenga vinculos con tickets o cambios en proceso.
- **Roles Involucrados:** Gestor de Activos y Configuracion, y Gestor de Cambios.

#### [RN-36] Trazabilidad Legal de Licenciamiento de Software (SAM)
- **Directriz de Negocio:** Todo software instalado y utilizado en la organizacion debe estar amparado por un contrato de licencia o suscripcion vigente, vigilando que la cantidad de asignaciones activas nunca supere las licencias adquiridas.
- **Razon de Negocio:** Evitar contingencias legales, multas por infraccion de derechos de autor y sobrecostos por licenciamiento no utilizado.
- **Automatizacion en el Software:** El sistema calcula en tiempo real el porcentaje de utilizacion de licencias frente al total adquirido, emitiendo alertas preventivas al alcanzar el 90% del cupo o ante la proximidad del vencimiento de garantias.
- **Roles Involucrados:** Gestor de Activos y Configuracion, y Auditor.

---

### Dominio 8: GOBERNANZA ADMINISTRATIVA Y DISENO DE FORMULARIOS / PLANTILLAS

#### [RN-37] Segregacion Estricta entre Configuracion de Plataforma y Operacion del Servicio
- **Directriz de Negocio:** El Administrador es el custodio institucional de la plataforma. Su funcion consiste en parametrizar el espacio de trabajo, definir que campos se solicitan en los formularios, como se guardan, como se visualizan las solicitudes y que plantillas aplican para tickets y RFCs. El Administrador tiene expresamente vedado crear solicitudes RFC operativas, resolver incidentes tecnicos o votar en el CAB en calidad de resolutor.
- **Razon de Negocio:** Cumplir el principio de Segregacion de Funciones (SoD) y evitar que quien define las reglas del sistema manipule la atencion de operaciones en su propio beneficio.
- **Automatizacion en el Software:** El sistema delimita el menu del Administrador habilitandole consolas de configuracion, gobernanza y diseno, bloqueando el acceso a formularios de creacion de RFCs operativas y paneles de resolucion tecnica personal.
- **Roles Involucrados:** Administrador, Tecnico y Gestor de Cambios.

#### [RN-38] Inmutabilidad de la Matriz RBAC y Registro de Auditoria ISO 27001
- **Directriz de Negocio:** Cualquier asignacion o revocacion de perfiles a usuarios, asi como la modificacion de la estructura jerarquica del menu o de los acuerdos SLA, debe quedar indeleblemente registrada en las bitacoras de seguridad del sistema con marca de tiempo inmutable y autor de la transaccion.
- **Razon de Negocio:** Cumplir con los requerimientos de auditoria forense y controles de seguridad de la informacion de la norma ISO/IEC 27001.
- **Automatizacion en el Software:** Cada transaccion sobre `usuario_perfiles`, `opciones_menu_perfiles` o `servicios` dispara un registro automatico en las bitacoras de auditoria, bloqueando cualquier comando de eliminacion sobre dichos historiales.
- **Roles Involucrados:** Administrador y Auditor.

#### [RN-39] Transiciones Controladas del Ciclo de Vida y Custodia de Activos (ITAM)
- **Directriz de Negocio:** Ningun activo patrimonial de hardware o software puede cambiar de estado arbitrariamente sin respetar la matriz autorizada del ciclo de vida (`EN_STOCK` -> `EN_OPERACION` -> `EN_REPARACION` -> `BAJA`). Toda transicion restrictiva o declaracion de baja exige justificacion obligatoria y genera un asiento cronologico inmutable en la bitacora de custodia.
- **Razon de Negocio:** Evitar perdidas patrimoniales, garantizar la trazabilidad del custodio legal del bien y respaldar las auditorias de inventario fisico.
- **Automatizacion en el Software:** La API `/api/activos` valida cada cambio de estado contra la tabla `transicion_activo`, rechaza saltos no autorizados y registra automaticamente cada modificacion en `activo_historial` con usuario, custodio anterior/nuevo, estado y motivo.
- **Roles Involucrados:** Gestor de Activos y Configuracion, y Auditor.

#### [RN-40] Ciclo Editorial, Versionado y Vigencia del Conocimiento (KCS)
- **Directriz de Negocio:** Todo articulo publicado en la base de conocimientos debe contar con versionado secuencial formal, revision periodica de vigencia y delimitacion de audiencias por perfil para evitar la exposicion no autorizada de procedimientos tecnicos internos o confidenciales. El retiro formal de un articulo exige un motivo obligatorio auditable.
- **Razon de Negocio:** Garantizar la veracidad y precision de las soluciones brindadas a los usuarios y salvaguardar la propiedad intelectual de la empresa.
- **Automatizacion en el Software:** La API `/api/admin/conocimiento` registra el historial de revisiones en `articulo_conocimiento_historial`, incrementa el numero de version en cada edicion sustantiva, filtra el catalogo visible segun `audiencia_perfiles` y exige motivo al ejecutar la accion de retiro.
- **Roles Involucrados:** Administrador, Tecnico y Solicitante.

#### [RN-41] Purga Segura con No Repudio en Bitacora de Auditoria
- **Directriz de Negocio:** La depuracion o archivo historico de expedientes de soporte cerrados con anos de antiguedad debe ejecutarse bajo estrictas politicas de retencion documental, requiriendo una fase de simulacion obligatoria que cuantifique el impacto en registros y espacio antes de su ejecucion irrevocable.
- **Razon de Negocio:** Preservar la integridad referencial y el rendimiento de la base de datos sin vulnerar requisitos legales o fiscales de conservacion de expedientes.
- **Automatizacion en el Software:** La consola `/admin/mantenimiento-datos` implementa un flujo en dos fases (simulacion previa y confirmacion autenticada), registrando el resultado final de la purga en `log_auditoria_sistema` con sello inmutable.
- **Roles Involucrados:** Administrador y Auditor.
