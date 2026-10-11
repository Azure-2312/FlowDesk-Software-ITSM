# Catalogo de Reglas de Negocio del Sistema de Tickets

## Informacion del Documento y Marco Metodologico

- **Proyecto:** Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITSM)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Concepto Fundamental de Regla de Negocio (Business Rule):**
  - Una regla de negocio es una directriz, restriccion o condicion logica que dicta como debe operar la organizacion y prestar sus servicios de soporte de tecnologia de la informacion.
  - **Existe independientemente del software**: define politicas empresariales, acuerdos de nivel de servicio (SLA), delegacion de autoridad, lineas de mando y principios de calidad y confidencialidad de la organizacion.
  - El software de Service Desk tiene la mision de cumplir y automatizar estas reglas de manera estricta y transparente, sin que la implementacion tecnica suplante la logica del negocio.
- **Roles Oficiales de la Organizacion (9):**
  1. **Solicitante:** Trabajador o cliente que requiere asistencia tecnica, solicita servicios del catalogo, consulta manuales de ayuda, entrega evidencias y evalua la calidad del servicio recibido.
  2. **Tecnico:** Especialista operativo que atiende incidentes asignados o disponibles, coordina acciones tecnicas internas, sustenta evidencias, documenta la solucion final y registra solicitudes de cambio RFC operativas.
  3. **Supervisor:** Lider del departamento tecnico encargado de coordinar al equipo, equilibrar la carga de trabajo (WIP), autorizar reasignaciones, monitorear el cumplimiento de plazos SLA y generar reportes gerenciales.
  4. **Gestor de Area:** Responsable departamental con atribuciones para autorizar o desaprobar solicitudes que involucren recursos, compras, licencias o accesos de su personal.
  5. **Auditor:** Revisor formal que vigila la transparencia de las atenciones, el cumplimiento de acuerdos de servicio, los logs de seguridad ISO 27001 y la inalterabilidad del historial operativo (estricto modo de solo lectura).
  6. **Administrador:** Responsable institucional del gobierno y configuracion de la plataforma: parametriza formularios, esquemas de datos, plantillas RFC, catalogos de servicios, acuerdos SLA/OLA, estructura del menu y perfiles RBAC, sin realizar operaciones transaccionales de atencion o cambio.
  7. **Aprobador (CAB):** Autoridad de Cambio integrante del Change Advisory Board facultada para evaluar colegiadamente el riesgo, impacto y autorizar o rechazar solicitudes de cambio (RFC) tecnicas.
  8. **Gestor de Cambios:** Change Manager responsable del proceso integral de Habilitacion del Cambio: coordina el calendario de cambios, ventanas de mantenimiento, periodos de congelamiento (freeze), comites CAB y revisiones post-implementacion (PIR).
  9. **Gestor de Activos y Configuracion:** Custodio tecnologico responsable del inventario de hardware (HAM), la base de datos de configuracion (CMDB) y el cumplimiento de licencias de software (SAM).
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
- **Directriz de Negocio:** La mesa de ayuda opera bajo seis perfiles institucionales claramente delimitados: Solicitante, Tecnico, Supervisor, Gestor de Area, Auditor y Administrador. Cada puesto laboral ejerce exclusivamente las atribuciones asignadas formalmente por la organizacion.
- **Razon de Negocio:** Organizar el trabajo segun la estructura funcional de la empresa y asegurar que cada area responda por su ambito de competencia.
- **Automatizacion en el Software:** El software controla los privilegios operativos mediante control de acceso basado en roles, habilitando a cada perfil unicamente sus funciones autorizadas.
- **Roles Involucrados:** Los 6 roles oficiales del sistema.

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


