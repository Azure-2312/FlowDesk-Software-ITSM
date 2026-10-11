# Especificacion de Requerimientos Funcionales (RF)

## Informacion del Documento y Roles Oficiales

- **Proyecto:** Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITSM)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Concepto Fundamental de Requerimiento Funcional (RF):**
  - Un requerimiento funcional describe **las acciones, tareas, comportamientos y capacidades operativas especificas que el software debe realizar** para satisfacer las necesidades de los usuarios y de la organizacion.
  - El sistema actual fue construido como una primera version del producto; por tanto, los requerimientos funcionales documentan tanto **las capacidades ya implementadas** que respaldan las funciones actuales, como **los requerimientos de evolucion y mejora continua (Roadmap del Producto)** que la mesa de ayuda requiere para su distribucion y escalamiento.
- **Roles Oficiales del Sistema (9):**
  1. **Solicitante:** Trabajador de la empresa o cliente que reporta fallas tecnicas, solicita servicios del catalogo, consulta manuales de autoayuda, adjunta evidencias y califica la atencion recibida.
  2. **Tecnico:** Especialista que revisa casos asignados o libres, ejecuta la atencion tecnica, registra notas de trabajo internas, sustenta evidencias, documenta la solucion final y registra solicitudes de cambio RFC operativas.
  3. **Supervisor:** Responsable de coordinar a los tecnicos de su area, equilibrar la carga de trabajo (WIP), autorizar reasignaciones, monitorear el cumplimiento de plazos (SLA) y exportar reportes gerenciales.
  4. **Gestor de Area:** Responsable departamental que autoriza o rechaza con sustento obligatorio las solicitudes de accesos, licencias o equipos que realizan sus colaboradores antes del inicio de labores de TI.
  5. **Auditor:** Revisor que fiscaliza el historial inmutable de tickets, atenciones, eventos de seguridad ISO 27001, licencias y cambios para comprobar el cumplimiento normativo (modo estricto solo lectura).
  6. **Administrador:** Responsable general de la gobernanza y configuracion del sistema: parametriza plantillas RFC, formularios de captura, catalogo corporativo de servicios, acuerdos SLA/OLA, matriz RBAC y estructura de menu.
  7. **Aprobador (CAB):** Autoridad de Cambio que evalua colegiadamente el impacto y riesgo tecnico de las solicitudes de cambio RFC y emite su voto formal en las sesiones del comite.
  8. **Gestor de Cambios:** Change Manager que planifica el calendario de cambios, administra ventanas de mantenimiento y periodos de congelamiento (freeze), coordina las sesiones CAB y fiscaliza las revisiones PIR.
  9. **Gestor de Activos y Configuracion:** Custodio tecnologico que administra el inventario patrimonial de hardware (HAM), el mapa de elementos de configuracion (CMDB) y el licenciamiento de software (SAM).
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

