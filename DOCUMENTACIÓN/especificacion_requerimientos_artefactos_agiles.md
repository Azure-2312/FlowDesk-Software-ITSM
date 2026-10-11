# Especificacion Integral de Requerimientos y Artefactos Agiles

## Informacion del Proyecto y Equipo

- **Proyecto:** Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITSM)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Roles Oficiales de la Organizacion (9):**
  1. **Solicitante:** Trabajador o cliente que reporta fallas tecnicas, solicita servicios, consulta manuales de ayuda, entrega evidencias y evalua la calidad del servicio recibido.
  2. **Tecnico:** Especialista operativo que atiende incidentes asignados o disponibles, coordina acciones tecnicas internas, sustenta evidencias y documenta la solucion final.
  3. **Supervisor:** Lider del departamento tecnico encargado de coordinar al equipo, equilibrar la carga de trabajo, autorizar reasignaciones, monitorear el cumplimiento de plazos (SLA/OLA) y generar reportes gerenciales.
  4. **Gestor de Area:** Responsable departamental con atribuciones para autorizar o desaprobar solicitudes que involucren recursos, compras, licencias o accesos sensibles de su personal.
  5. **Auditor:** Revisor formal que vigila la transparencia de las atenciones, el cumplimiento de acuerdos de servicio y la inalterabilidad del historial operativo y de auditoria.
  6. **Administrador:** Responsable institucional de la gestion de usuarios, asignacion de perfiles, definicion de departamentos tecnicos y mantenimiento del catalogo de servicios.
  7. **Aprobador CAB:** Integrante del Comite Asesor de Cambios facultado para evaluar el riesgo e impacto de Solicitudes de Cambio (RFC) y emitir su voto colegiado vinculante.
  8. **Gestor de Cambios:** Lider metodologico que gobierna el ciclo de vida de los cambios tecnologicos, agenda las ventanas de mantenimiento, previene conflictos y conduce la revision post-implementacion (PIR).
  9. **Gestor de Activos y Configuracion:** Responsable de fiscalizar el inventario de hardware y software, controlar el ciclo de vida patrimonial y mantener la topologia de dependencias en la CMDB.
- **Marco Metodologico:**
  - Las Reglas de Negocio representan directrices y politicas organizacionales de soporte ITSM que existen independientemente del software.
  - Los Requerimientos y las Historias de Usuario definen las capacidades y necesidades laborales que el software automatiza de forma estricta y transparente.
- **Estructura Modular de Documentos:**
  - [reglas_de_negocio.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/reglas_de_negocio.md)
  - [requerimientos_funcionales.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/requerimientos_funcionales.md)
  - [requerimientos_no_funcionales.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/requerimientos_no_funcionales.md)
  - [historias_de_usuario.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/historias_de_usuario.md)

---

## 1. Justificacion de la Secuencia Operativa del Negocio

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
```

---

## 2. Catalogo de Reglas de Negocio (RN)

### 2.1. Resumen de Reglas de Negocio (RN)
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
```

---


---

### 2.2. Especificacion Detallada de Reglas de Negocio
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

#### [RN-31] Cumplimiento de Acuerdos de Nivel Operativo entre Equipos Internos (OLA)
- **Directriz de Negocio:** Cada requerimiento o incidente transferido entre departamentos tecnicos (Mesa de Ayuda N1, Soporte en Sitio N2, Redes, Sistemas N3 y Ciberseguridad) esta sujeto a un tiempo limite de atencion interna pactado (OLA), impidiendo que un equipo retenga un caso indefinidamente y arriesgue el plazo global comprometido con el solicitante (SLA).
- **Razon de Negocio:** Garantizar la corresponsabilidad y coordinacion fluida entre las unidades tecnicas de TI, eliminando cuellos de botella no detectados en la cadena de resolucion.
- **Automatizacion en el Software:** El software mide el tiempo de permanencia del expediente en cada departamento, alerta al supervisor cuando se consume el 75% del OLA correspondiente y registra el cumplimiento en el expediente historico.
- **Roles Involucrados:** Tecnico, Supervisor y Administrador.

---

## 3. Especificacion de Requerimientos del Sistema

### 3.1. Requerimientos Funcionales (RF)

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
| 6. ROADMAP Y MEJORA CONTINUA   | [RF-30] Notificaciones en Pantalla  | [RN-29] (Planificado)       |
|                                | [RF-31] Vinculacion de Activos TI   | [RN-09] (Planificado)       |
|                                | [RF-32] Gestion de Problemas TI     | [RN-18] (Planificado)       |
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

### Dominio 6: ROADMAP Y MEJORA CONTINUA (Requerimientos en Evolucion)

#### [RF-30] Notificaciones en Tiempo Real en Pantalla
- **Descripcion:** El sistema contara con un centro de notificaciones visuales en la cabecera de la interfaz (icono de campana interactivo), alertando al usuario de asignaciones, comentarios y resoluciones sin requerir recargar la pagina o consultar el correo.
- **Que entrega al usuario:** Interactividad en tiempo real y comunicacion dinamica durante la atencion del caso.
- **Estado de Implementacion:** Planificado para la siguiente fase evolutiva del producto.
- **Reglas Vinculadas:** [RN-29].
- **Roles Autorizados:** Todos los usuarios.

#### [RF-31] Vinculacion de Activos de TI al Expediente de Servicio
- **Descripcion:** El sistema permitira asociar a la solicitud de soporte el equipo informatico o activo institucional asignado al colaborador (laptop, monitor, impresora corporativa), extrayendo sus datos tecnicos y garantia.
- **Que entrega al tecnico:** Contexto tecnico inmediato sobre las caracteristicas del equipo para acelerar el diagnostico de hardware.
- **Estado de Implementacion:** Planificado para la siguiente fase evolutiva del producto (Modulo de Inventario / CMDB Basica).
- **Reglas Vinculadas:** [RN-09].
- **Roles Autorizados:** Solicitante, Tecnico y Administrador.

#### [RF-32] Gestion de Problemas y Causas Raiz Comunes
- **Descripcion:** El sistema permitira a los supervisores vincular multiples incidentes reiterados a un expediente maestro de problema, permitiendo coordinar soluciones estructurales de fondo que resuelvan la causa origen y cierren los incidentes asociados en lote.
- **Que entrega a la empresa:** Enfoque proactivo de soporte tecnico bajo ITIL, eliminando fallas recurrentes en la infraestructura corporativa.
- **Estado de Implementacion:** Planificado para la siguiente fase evolutiva del producto.
- **Reglas Vinculadas:** [RN-18].
- **Roles Autorizados:** Supervisor y Administrador.

#### [RF-33] Medicion y Monitoreo de Acuerdos de Nivel Operativo (OLA)
- **Descripcion:** El sistema permite configurar y auditar los tiempos maximos de permanencia y atencion interna acordados para cada departamento de TI (Mesa de Ayuda, Soporte en Sitio, Redes, Sistemas y Ciberseguridad), midiendo el tiempo transcurrido desde que un caso entra a la cola departamental hasta su traspaso o resolucion.
- **Que entrega al supervisor:** Deteccion precoz de demoras y cuellos de botella internos entre especialidades antes de que se vulnere el acuerdo global con el solicitante.
- **Estado de Implementacion:** Implementado en el sistema actual.
- **Reglas Vinculadas:** [RN-31].
- **Roles Autorizados:** Administrador, Supervisor y Tecnico.

---

### 3.2. Requerimientos No Funcionales (RNF)


## Informacion del Documento y Roles Oficiales

- **Proyecto:** Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITSM)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Concepto Fundamental de Requerimiento No Funcional (RNF):**
  - Un requerimiento no funcional define los **atributos de calidad, restricciones tecnicas, rendimiento y condiciones operativas** que determinan como debe comportarse el sistema.
  - A diferencia de las reglas de negocio (que dictan directrices organizacionales) y de los requerimientos funcionales (que describen acciones y tareas especificas), los RNF establecen metricas objetivas de eficiencia, disponibilidad, seguridad informatica, usabilidad, capacidad y mantenibilidad del software.
  - Basado en el estandar internacional de calidad de software **ISO/IEC 25010 (SQuaRE)**.
- **Roles Oficiales del Sistema (6):**
  1. **Solicitante:** Trabajador o cliente que reporta incidentes, solicita servicios y califica la atencion.
  2. **Tecnico:** Especialista operativo que atiende y resuelve los requerimientos tecnicos.
  3. **Supervisor:** Lider que coordina al equipo, equilibra cargas de trabajo y monitorea el cumplimiento de plazos.
  4. **Gestor de Area:** Responsable de departamento que autoriza o deniega peticiones con impacto de recursos.
  5. **Auditor:** Revisor formal de la transparencia, cumplimiento normativo e inalterabilidad de registros.
  6. **Administrador:** Responsable de la gestion integral de usuarios, catalogo de servicios y parametros del sistema.
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

## 4. Artefactos Agiles: Historias de Usuario (HU)

El producto se organiza en seis grandes areas de trabajo:

```
+----------------------------------------------------------------------------------------------------+
|                                    LISTA DE HISTORIAS DE USUARIO                                   |
+----------------------------------------------------------------------------------------------------+
| EPI-01: ACCESO AL PORTAL DE SERVICIOS                                                              |
|   ├── [HU-01] Acceso al Espacio de Trabajo                                                         |
|   ├── [HU-02] Restablecimiento Autonomo de Acceso                                                  |
|   └── [HU-03] Gestion de Perfil Institucional                                                      |
+----------------------------------------------------------------------------------------------------+
| EPI-02: ADMINISTRACION DE USUARIOS Y ROLES                                                         |
|   ├── [HU-04] Administracion Integral de Colaboradores                                             |
|   ├── [HU-05] Configuracion de Perfiles de Responsabilidad                                         |
|   ├── [HU-06] Conmutacion de Funcion Laboral                                                       |
|   └── [HU-07] Delimitacion de Opciones de Navegacion                                                |
+----------------------------------------------------------------------------------------------------+
| EPI-03: CATALOGO DE SERVICIOS DE TI                                                                |
|   ├── [HU-08] Administracion del Catalogo de Servicios                                             |
|   ├── [HU-09] Solicitud Asistida desde el Catalogo                                                 |
|   ├── [HU-10] Consulta de Guias de Autoayuda                                                       |
|   └── [HU-11] Parametrizacion de Protocolos de Atencion                                            |
+----------------------------------------------------------------------------------------------------+
| EPI-04: DEPARTAMENTOS TECNICOS Y CAPACIDAD OPERATIVA                                               |
|   ├── [HU-12] Administracion de Departamentos Tecnicos                                             |
|   ├── [HU-13] Gestion de Especialistas Tecnicos                                                    |
|   └── [HU-14] Supervision de Carga del Equipo                                                      |
+----------------------------------------------------------------------------------------------------+
| EPI-05: GESTION INTEGRAL DE TICKETS                                                                |
|   ├── [HU-15] Registro de Solicitudes de Atencion                                                  |
|   ├── [HU-16] Priorizacion Automatizada de Casos                                                   |
|   ├── [HU-17] Aprobacion de Pedidos Institucionales                                                |
|   ├── [HU-18] Asignacion Operativa de Casos                                                        |
|   ├── [HU-19] Pausa Operativa de Atencion                                                          |
|   ├── [HU-20] Colaboracion mediante Notas Privadas                                                 |
|   ├── [HU-21] Documentacion Obligatoria de Solucion                                                |
|   ├── [HU-22] Evaluacion de Satisfaccion del Servicio                                              |
|   ├── [HU-23] Cierre Formal del Expediente                                                         |
|   ├── [HU-24] Adjuncion de Evidencias Documentales                                                 |
|   ├── [HU-25] Alerta Preventiva por Riesgo de Vencimiento de SLA                                   |
|   ├── [HU-26] Despacho Automatico de Notificaciones                                                |
|   ├── [HU-27] Descarga de Reportes Gerenciales                                                     |
|   ├── [HU-28] Reclamacion por Persistencia de Falla                                                |
|   └── [HU-29] Fiscalizacion de Registros Operativos                                                |
+----------------------------------------------------------------------------------------------------+
| EPI-06: MEJORA CONTINUA Y EVOLUCION ITSM (ROADMAP)                                                 |
|   ├── [HU-30] Centro de Notificaciones en Pantalla                                                 |
|   ├── [HU-31] Vinculacion de Activos Institucionales                                               |
|   └── [HU-32] Gestion de Problemas Operativos                                                      |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Desarrollo Detallado de Historias de Usuario

---

### Epica 1 [EPI-01]: ACCESO AL PORTAL DE SERVICIOS

#### [HU-01] Acceso al Espacio de Trabajo
- **Como:** Usuarios
- **Deseo:** Ingresar con mi correo institucional y clave personal
- **Para:** Disponer de mi entorno de trabajo y gestionar mis requerimientos de tecnologia.
- **Regla de Negocio:** [RN-01], [RN-08]
- **Requerimiento:** [RF-01]

**Criterios de Aceptacion:**

##### Escenario 1: Ingreso exitoso con credenciales validas
```gherkin
Dado que ingreso al sistema como Usuarios con acceso habilitado
Cuando escribo mi correo institucional y mi clave correcta
Entonces el sistema me permite entrar y me muestra mi portal principal de trabajo
```

##### Escenario 2: Notificacion ante credenciales no coincidentes
```gherkin
Dado que ingreso al sistema como Usuarios
Cuando escribo una clave que no coincide con los registros
Entonces el sistema me informa que los datos son incorrectos y me ofrece la opcion de recuperar mi clave
```

---

#### [HU-02] Restablecimiento Autonomo de Acceso
- **Como:** Usuarios
- **Deseo:** Solicitar un codigo temporal de comprobacion a mi buzon institucional
- **Para:** Definir una nueva clave y retomar mis labores sin esperar atencion manual de soporte.
- **Regla de Negocio:** [RN-01]
- **Requerimiento:** [RF-02]

**Criterios de Aceptacion:**

##### Escenario 1: Restablecimiento satisfactorio de clave
```gherkin
Dado que ingreso al sistema como Usuarios en la pantalla de recuperacion
Cuando ingreso mi correo corporativo y transcribo el codigo de verificacion recibido
Entonces el sistema valida mi identidad y me permite definir una nueva clave de acceso
```

##### Escenario 2: Codigo de verificacion expirado
```gherkin
Dado que ingreso al sistema como Usuarios con un codigo fuera de tiempo
Cuando presiono el boton de confirmar
Entonces el sistema me avisa que el codigo caduco y me ofrece despachar un nuevo codigo
```

---

#### [HU-03] Gestion de Perfil Institucional
- **Como:** Usuarios
- **Deseo:** Actualizar mis canales de contacto telefonico y mi clave personal
- **Para:** Mantener mi ficha al dia y facilitar que los tecnicos me localicen oportunamente.
- **Regla de Negocio:** [RN-08], [RN-29]
- **Requerimiento:** [RF-03]

**Criterios de Aceptacion:**

##### Escenario 1: Actualizacion exitosa de datos de contacto
```gherkin
Dado que ingreso al sistema como Usuarios en la seccion de mi perfil
Cuando actualizo mi anexo telefonico y presiono guardar cambios
Entonces el sistema confirma la actualizacion y refleja el nuevo anexo en mis requerimientos
```

##### Escenario 2: Proteccion de campos institucionales inmutables
```gherkin
Dado que ingreso al sistema como Usuarios en mi perfil
Cuando visualizo mi correo institucional y numero de documento
Entonces el sistema los presenta como campos protegidos que solo el Administrador puede modificar
```

---

### Epica 2 [EPI-02]: ADMINISTRACION DE USUARIOS Y ROLES

#### [HU-04] Administracion Integral de Colaboradores
- **Como:** Administrador
- **Deseo:** Registrar nuevos trabajadores, actualizar sus datos y conmutar su estado entre activo e inactivo
- **Para:** Mantener el padron oficial del personal autorizado para interactuar con los servicios tecnicos.
- **Regla de Negocio:** [RN-05], [RN-08]
- **Requerimiento:** [RF-06]

**Criterios de Aceptacion:**

##### Escenario 1: Alta exitosa de un colaborador
```gherkin
Dado que ingreso al sistema como Administrador en el modulo de personal
Cuando completo nombres, documento y correo corporativo unico
Entonces el sistema registra al colaborador y le habilita su acceso institucional
```

##### Escenario 2: Suspension de colaborador cesado
```gherkin
Dado que ingreso al sistema como Administrador
Cuando conmuto el estado de un trabajador de activo a inactivo
Entonces el sistema suspende de inmediato su acceso al portal de servicios
```

---

#### [HU-05] Configuracion de Perfiles de Responsabilidad
- **Como:** Administrador
- **Deseo:** Asignar perfiles y atribuciones operativas a cada colaborador
- **Para:** Que cada persona desempenre unicamente las funciones autorizadas para su puesto.
- **Regla de Negocio:** [RN-05]
- **Requerimiento:** [RF-06]

**Criterios de Aceptacion:**

##### Escenario 1: Asignacion de perfil tecnico
```gherkin
Dado que ingreso al sistema como Administrador
Cuando selecciono a un colaborador y le vinculo el perfil de Tecnico
Entonces el sistema le otorga acceso a las bandejas operativas de soporte
```

---

#### [HU-06] Conmutacion de Funcion Laboral
- **Como:** Usuarios
- **Deseo:** Alternar mi perfil activo desde la cabecera del portal
- **Para:** Desempenar mis distintas responsabilidades laborales sin cerrar sesion.
- **Regla de Negocio:** [RN-05], [RN-06]
- **Requerimiento:** [RF-07]

**Criterios de Aceptacion:**

##### Escenario 1: Cambio exitoso de perfil operativo
```gherkin
Dado que ingreso al sistema como Tecnico con doble perfil asignado
Cuando selecciono la opcion de Solicitante en el selector superior
Entonces el sistema refresca la interfaz mostrando unicamente mis solicitudes personales
```

---

#### [HU-07] Delimitacion de Opciones de Navegacion
- **Como:** Auditor
- **Deseo:** Comprobar la restriccion de accesos a rutas no autorizadas
- **Para:** Velar por el cumplimiento de la segregacion estricta de funciones.
- **Regla de Negocio:** [RN-07]
- **Requerimiento:** [RF-08]

**Criterios de Aceptacion:**

##### Escenario 1: Bloqueo de acceso a modulos no permitidos
```gherkin
Dado que ingreso al sistema como Solicitante
Cuando intento ingresar directamente a una ruta de administracion de personal
Entonces el sistema me deniega la entrada y me redirige a mi panel autorizado
```

---

### Epica 3 [EPI-03]: CATALOGO DE SERVICIOS DE TI

#### [HU-08] Administracion del Catalogo de Servicios
- **Como:** Administrador
- **Deseo:** Registrar y parametrizar las prestaciones tecnicas con sus plazos de SLA y compuertas de aprobacion
- **Para:** Formalizar el portafolio corporativo de atenciones disponibles para la empresa.
- **Regla de Negocio:** [RN-09], [RN-10], [RN-12]
- **Requerimiento:** [RF-09]

**Criterios de Aceptacion:**

##### Escenario 1: Registro formal de un servicio de catalogo
```gherkin
Dado que ingreso al sistema como Administrador en el portafolio de servicios
Cuando registro un servicio indicando nombre, departamento, plazos de atencion y visto bueno requerido
Entonces el sistema publica el servicio quedando disponible para su solicitud formal
```

---

#### [HU-09] Solicitud Asistida desde el Catalogo
- **Como:** Solicitante
- **Deseo:** Explorar los servicios organizados por categorias y tramitar mi requerimiento mediante formularios claros
- **Para:** Recibir atencion guiada sin recurrir a canales informales o llamadas telefonicas.
- **Regla de Negocio:** [RN-09], [RN-18]
- **Requerimiento:** [RF-10]

**Criterios de Aceptacion:**

##### Escenario 1: Tramitacion asistida de requerimiento
```gherkin
Dado que ingreso al sistema como Solicitante en la vitrina del catalogo
Cuando selecciono una tarjeta de servicio y completo los detalles solicitados
Entonces el sistema emite mi requerimiento formal asignandome un expediente unico
```

---

#### [HU-10] Consulta de Guias de Autoayuda
- **Como:** Solicitante
- **Deseo:** Revisar manuales breves de solucion para problemas tecnicos frecuentes
- **Para:** Resolver dudas operativas de manera autonoma y agilizar mi jornada.
- **Regla de Negocio:** [RN-13]
- **Requerimiento:** [RF-11]

**Criterios de Aceptacion:**

##### Escenario 1: Resolucion exitosa mediante guia de autoayuda
```gherkin
Dado que ingreso al sistema como Solicitante en el centro de ayuda rapida
Cuando busco una guia sobre configuracion de correo y sigo los pasos descritos
Entonces resuelvo mi inconveniente sin necesidad de aperturar un ticket formal
```

---

#### [HU-11] Parametrizacion de Protocolos de Atencion
- **Como:** Administrador
- **Deseo:** Configurar listas de verificacion obligatorias por cada servicio complejo
- **Para:** Estandarizar la calidad tecnica y evitar omisiones durante la solucion.
- **Regla de Negocio:** [RN-11]
- **Requerimiento:** [RF-12]

**Criterios de Aceptacion:**

##### Escenario 1: Definicion de protocolo tecnico
```gherkin
Dado que ingreso al sistema como Administrador en el catalogo
Cuando anado una lista de tareas tecnicas obligatorias a un servicio critico
Entonces el sistema exigira que el tecnico valide cada paso antes de dar por resuelto el caso
```

---

### Epica 4 [EPI-04]: DEPARTAMENTOS TECNICOS Y CAPACIDAD OPERATIVA

#### [HU-12] Administracion de Departamentos Tecnicos
- **Como:** Administrador
- **Deseo:** Estructurar las unidades de soporte y designar formalmente al Supervisor responsable
- **Para:** Establecer una linea jerarquica clara de gestion por cada especialidad.
- **Regla de Negocio:** [RN-14]
- **Requerimiento:** [RF-13]

**Criterios de Aceptacion:**

##### Escenario 1: Creacion de area tecnica con jefatura
```gherkin
Dado que ingreso al sistema como Administrador
Cuando creo el departamento de Redes y le vinculo a su Supervisor responsable
Entonces el sistema habilita el area y le otorga atribuciones de direccion a dicho supervisor
```

---

#### [HU-13] Gestion de Especialistas Tecnicos
- **Como:** Supervisor
- **Deseo:** Registrar tecnicos asignando su nivel de pericia y su tope maximo de casos en paralelo
- **Para:** Proteger la capacidad del personal y garantizar una atencion tecnica de calidad.
- **Regla de Negocio:** [RN-15], [RN-16]
- **Requerimiento:** [RF-14]

**Criterios de Aceptacion:**

##### Escenario 1: Asignacion de limites operativos
```gherkin
Dado que ingreso al sistema como Supervisor en la gestion de equipo
Cuando defino el nivel de un tecnico y fijo su tope en ocho casos concurrentes
Entonces el sistema valida dicho limite impidiendo sobrecargas en su bandeja
```

---

#### [HU-14] Supervision de Carga del Equipo
- **Como:** Supervisor
- **Deseo:** Visualizar en tiempo real los casos activos y la disponibilidad del personal en turno
- **Para:** Balancear el trabajo de forma equitativa y evitar cuellos de botella.
- **Regla de Negocio:** [RN-16], [RN-17]
- **Requerimiento:** [RF-15]

**Criterios de Aceptacion:**

##### Escenario 1: Monitoreo visual de la capacidad del equipo
```gherkin
Dado que ingreso al sistema como Supervisor en el tablero de tecnicos
Cuando reviso el panel de disponibilidad de mi departamento
Entonces el sistema me muestra la cantidad de casos en proceso y el estado en turno de cada miembro
```

---

### Epica 5 [EPI-05]: GESTION INTEGRAL DE TICKETS

#### [HU-15] Registro de Solicitudes de Atencion
- **Como:** Solicitante
- **Deseo:** Reportar un incidente imprevisto o tramitar un servicio formal
- **Para:** Obtener un codigo correlativo de expediente y dar inicio a la atencion tecnica.
- **Regla de Negocio:** [RN-18], [RN-19]
- **Requerimiento:** [RF-16]

**Criterios de Aceptacion:**

##### Escenario 1: Emision de reporte de falla tecnica
```gherkin
Dado que ingreso al sistema como Solicitante en el formulario de creacion
Cuando elijo tipo Incidente, redacto el problema y selecciono el impacto
Entonces el sistema genera el codigo oficial correlativo y lo deriva a la mesa de soporte
```

---

#### [HU-16] Priorizacion Automatizada de Casos
- **Como:** Tecnico
- **Deseo:** Que el sistema ordene las atenciones segun su impacto y urgencia operativa
- **Para:** Resolver primero aquellas contingencias que paralizan la operacion institucional.
- **Regla de Negocio:** [RN-20]
- **Requerimiento:** [RF-17]

**Criterios de Aceptacion:**

##### Escenario 1: Calculo objetivo de prioridad critica
```gherkin
Dado que ingreso al sistema como Tecnico en la bandeja de entrada
Cuando ingresa un ticket marcado con alto impacto empresarial y urgencia alta
Entonces el sistema lo posiciona con prioridad Critica en la cima de la bandeja
```

---

#### [HU-17] Aprobacion de Pedidos Institucionales
- **Como:** Gestor de Area
- **Deseo:** Evaluar y autorizar o denegar solicitudes con justificacion obligatoria
- **Para:** Cautelar los recursos de la empresa y resguardar la seguridad institucional.
- **Regla de Negocio:** [RN-12], [RN-21]
- **Requerimiento:** [RF-18]

**Criterios de Aceptacion:**

##### Escenario 1: Autorizacion formal de solicitud
```gherkin
Dado que ingreso al sistema como Gestor de Area en mi bandeja de aprobaciones
Cuando examino el pedido de mi colaborador y presiono Aprobar
Entonces el sistema deriva el ticket de inmediato al departamento tecnico para su atencion
```

##### Escenario 2: Denegacion fundamentada de solicitud
```gherkin
Dado que ingreso al sistema como Gestor de Area
Cuando rechazo un pedido registrando el motivo de cancelacion
Entonces el sistema cancela el expediente e informa al trabajador con el sustento registrado
```

---

#### [HU-18] Asignacion Operativa de Casos
- **Como:** Supervisor
- **Deseo:** Derivar expedientes a los especialistas o permitir su toma directa desde la bandeja
- **Para:** Poner en marcha la atencion tecnica sin perder tiempo util de respuesta.
- **Regla de Negocio:** [RN-15], [RN-16], [RN-17]
- **Requerimiento:** [RF-19]

**Criterios de Aceptacion:**

##### Escenario 1: Asignacion directa respetando capacidad
```gherkin
Dado que ingreso al sistema como Supervisor en la bandeja de asignaciones
Cuando selecciono a un tecnico disponible con carga inferior a su limite
Entonces el sistema le transfiere el ticket y le despacha un aviso automatico
```

##### Escenario 2: Restriccion ante saturacion de casos
```gherkin
Dado que ingreso al sistema como Supervisor
Cuando intento asignar un caso a un tecnico que ya alcanzo su tope maximo
Entonces el sistema bloquea la asignacion y me sugiere especialistas con disponibilidad
```

---

#### [HU-19] Pausa Operativa de Atencion
- **Como:** Tecnico
- **Deseo:** Suspender temporalmente el reloj de SLA cuando requiera respuesta del usuario
- **Para:** Mantener una evaluacion justa de mis tiempos sin afectarme por demoras ajenas.
- **Regla de Negocio:** [RN-22]
- **Requerimiento:** [RF-20]

**Criterios de Aceptacion:**

##### Escenario 1: Congelamiento del tiempo de SLA
```gherkin
Dado que ingreso al sistema como Tecnico atendiendo un caso activo
Cuando cambio el estado a En Espera solicitando informacion al colaborador
Entonces el sistema pausa el cronometro de SLA hasta que el usuario responda
```

---

#### [HU-20] Colaboracion mediante Notas Privadas
- **Como:** Tecnico
- **Deseo:** Registrar observaciones confidenciales de diagnostico interno en el ticket
- **Para:** Coordinar con colegas y jefes sin alarmar ni confundir al solicitante.
- **Regla de Negocio:** [RN-23]
- **Requerimiento:** [RF-21]

**Criterios de Aceptacion:**

##### Escenario 1: Registro de apunte privado entre especialistas
```gherkin
Dado que ingreso al sistema como Tecnico en el expediente de atencion
Cuando publico una nota marcada como privada
Entonces el sistema la muestra exclusivamente al personal de soporte y la oculta al solicitante
```

---

#### [HU-21] Documentacion Obligatoria de Solucion
- **Como:** Tecnico
- **Deseo:** Registrar el procedimiento correctivo aplicado y clasificar la reparacion
- **Para:** Concluir formalmente el trabajo y enriquecer la base de conocimiento interno.
- **Regla de Negocio:** [RN-24]
- **Requerimiento:** [RF-22]

**Criterios de Aceptacion:**

##### Escenario 1: Registro formal de solucion tecnica
```gherkin
Dado que ingreso al sistema como Tecnico
Cuando describo el procedimiento correctivo y selecciono la categoria de cierre
Entonces el sistema pasa el caso a estado Resuelto y notifica la conformidad al solicitante
```

---

#### [HU-22] Evaluacion de Satisfaccion del Servicio
- **Como:** Solicitante
- **Deseo:** Calificar con estrellas y redactar comentarios sobre la atencion recibida
- **Para:** Expresar mi nivel de conformidad y contribuir a la mejora continua del servicio.
- **Regla de Negocio:** [RN-25]
- **Requerimiento:** [RF-23]

**Criterios de Aceptacion:**

##### Escenario 1: Calificacion exclusiva por el titular
```gherkin
Dado que ingreso al sistema como Solicitante en mi ticket resuelto
Cuando selecciono cinco estrellas y anoto un comentario de agradecimiento
Entonces el sistema guarda mi evaluacion de forma definitiva e irreversible
```

---

#### [HU-23] Cierre Formal del Expediente
- **Como:** Solicitante
- **Deseo:** Confirmar la resolucion de mi ticket o permitir su cierre automatico tras dos dias
- **Para:** Dar por terminada la atencion tecnica de manera definitiva.
- **Regla de Negocio:** [RN-26]
- **Requerimiento:** [RF-24]

**Criterios de Aceptacion:**

##### Escenario 1: Cierre por conformidad expresa
```gherkin
Dado que ingreso al sistema como Solicitante
Cuando confirmo que el problema fue resuelto a satisfaccion
Entonces el sistema cambia el ticket a estado Cerrado de forma inmediata
```

##### Escenario 2: Cierre automatico por aceptacion tacita
```gherkin
Dado que ingreso al sistema como Usuarios en un ticket resuelto hace 48 horas
Cuando transcurre dicho plazo sin comentarios u observaciones del solicitante
Entonces el sistema asume la conformidad tacita y cierra el caso automaticamente
```

---

#### [HU-24] Adjuncion de Evidencias Documentales
- **Como:** Solicitante
- **Deseo:** Adjuntar capturas de pantalla y documentos en formatos protegidos
- **Para:** Respaldar el reporte de la falla con claridad objetiva y facilitar el diagnostico.
- **Regla de Negocio:** [RN-27]
- **Requerimiento:** [RF-25]

**Criterios de Aceptacion:**

##### Escenario 1: Subida de captura de error valida
```gherkin
Dado que ingreso al sistema como Solicitante al reportar una falla
Cuando selecciono una imagen en formato PNG de tres megabytes
Entonces el sistema la adjunta al expediente y la deja disponible para inspeccion del tecnico
```

##### Escenario 2: Rechazo de archivos riesgosos
```gherkin
Dado que ingreso al sistema como Solicitante
Cuando intento adjuntar un archivo ejecutable
Entonces el sistema rechaza el archivo informando que solo se admiten formatos seguros
```

---

#### [HU-25] Alerta Preventiva por Riesgo de Vencimiento de SLA
- **Como:** Supervisor
- **Deseo:** Recibir alertas visuales al consumirse el 80% del tiempo maximo de atencion
- **Para:** Actuar preventivamente antes de incumplir el acuerdo pactado con la empresa.
- **Regla de Negocio:** [RN-28]
- **Requerimiento:** [RF-26]

**Criterios de Aceptacion:**

##### Escenario 1: Senalizacion amarilla de alerta temprana
```gherkin
Dado que ingreso al sistema como Supervisor en el panel de atenciones
Cuando un caso en proceso alcanza el 80% de su tiempo de resolucion comprometido
Entonces el sistema resalta el ticket en color amarillo alertando la urgencia de intervencion
```

---

#### [HU-26] Despacho Automatico de Notificaciones
- **Como:** Solicitante
- **Deseo:** Recibir avisos oportunos en mi correo ante cada cambio de estado de mi ticket
- **Para:** Mantenerme informado del progreso sin necesidad de consultar manualmente.
- **Regla de Negocio:** [RN-29]
- **Requerimiento:** [RF-27]

**Criterios de Aceptacion:**

##### Escenario 1: Notificacion automatica de asignacion
```gherkin
Dado que ingreso al sistema como Solicitante con un ticket abierto
Cuando el supervisor entrega mi solicitud a un tecnico asignado
Entonces el sistema me despacha de forma automatica un correo informando quien atendera mi caso
```

---

#### [HU-27] Descarga de Reportes Gerenciales
- **Como:** Supervisor
- **Deseo:** Filtrar y exportar hojas de calculo con las metricas de atencion del area
- **Para:** Evaluar el rendimiento del departamento y sustentar decisiones directivas.
- **Regla de Negocio:** [RN-30]
- **Requerimiento:** [RF-28]

**Criterios de Aceptacion:**

##### Escenario 1: Generacion limpia de reporte mensual
```gherkin
Dado que ingreso al sistema como Supervisor en el modulo de reportes
Cuando defino el rango de fechas del mes y presiono Exportar a Excel
Entonces el sistema genera y descarga un archivo tabulado con todos los casos y tiempos
```

---

#### [HU-28] Reclamacion por Persistencia de Falla
- **Como:** Solicitante
- **Deseo:** Solicitar la reapertura de un ticket dentro del plazo prudencial si el problema no fue resuelto
- **Para:** Exigir la correccion definitiva bajo el mismo caso sin generar tickets duplicados.
- **Regla de Negocio:** [RN-26]
- **Requerimiento:** [RF-29]

**Criterios de Aceptacion:**

##### Escenario 1: Reapertura justificada dentro de 48 horas
```gherkin
Dado que ingreso al sistema como Solicitante en mi ticket marcado como resuelto
Cuando indico que la falla continua y sustento el motivo de mi disconformidad
Entonces el sistema reactiva el expediente bajo el mismo codigo y reasigna al especialista
```

---

#### [HU-29] Fiscalizacion de Registros Operativos
- **Como:** Auditor
- **Deseo:** Inspeccionar la cronologia completa y las decisiones de cada expediente
- **Para:** Comprobar el cumplimiento de normas de calidad y acuerdos institucionales.
- **Regla de Negocio:** [RN-03], [RN-04]
- **Requerimiento:** [RF-05]

**Criterios de Aceptacion:**

##### Escenario 1: Revision de trazas inalterables de atencion
```gherkin
Dado que ingreso al sistema como Auditor en la bitacora de auditoria
Cuando consulto un ticket concluido y reviso sus fechas, autores y dictamenes
Entonces el sistema me presenta el historial inalterable sin posibilidad de manipulacion
```

---

### Epica 6 [EPI-06]: MEJORA CONTINUA Y EVOLUCION ITSM (ROADMAP)

#### [HU-30] Centro de Notificaciones en Pantalla
- **Como:** Usuarios
- **Deseo:** Visualizar avisos inmediatos en la cabecera de la interfaz sin refrescar la pagina
- **Para:** Enterarme al instante de novedades y avances en mis requerimientos de servicio.
- **Regla de Negocio:** [RN-29]
- **Requerimiento:** [RF-30]

**Criterios de Aceptacion:**

##### Escenario 1: Alerta interactiva en cabecera
```gherkin
Dado que ingreso al sistema como Usuarios en cualquier pantalla del portal
Cuando un especialista publica un comentario o actualiza el estado de mi caso
Entonces el sistema activa un indicador visual en el icono de campana informando la novedad
```

---

#### [HU-31] Vinculacion de Activos Institucionales
- **Como:** Solicitante
- **Deseo:** Asociar mi equipo informatico asignado al momento de emitir un ticket
- **Para:** Que el especialista conozca de inmediato las caracteristicas del hardware involucrado.
- **Regla de Negocio:** [RN-09]
- **Requerimiento:** [RF-31]

**Criterios de Aceptacion:**

##### Escenario 1: Seleccion de equipo informatico personal
```gherkin
Dado que ingreso al sistema como Solicitante al reportar una falla
Cuando elijo mi laptop institucional desde la lista de activos vinculados a mi persona
Entonces el sistema asocia el numero de serie y especificaciones al expediente tecnico
```

---

#### [HU-32] Gestion de Problemas Operativos
- **Como:** Supervisor
- **Deseo:** Agrupar incidentes repetitivos en un caso maestro de problema
- **Para:** Eliminar la causa raiz estructural de fallas recurrentes bajo estandares ITIL.
- **Regla de Negocio:** [RN-18]
- **Requerimiento:** [RF-32]

**Criterios de Aceptacion:**

##### Escenario 1: Vinculacion de incidentes a un problema maestro
```gherkin
Dado que ingreso al sistema como Supervisor en el modulo de incidentes
Cuando identifico tres incidentes con la misma caida de enlace y los vinculo a un problema
Entonces el sistema asocia los casos permitiendo resolverlos en lote al solucionar la causa raiz
```

---

#### [HU-33] Monitoreo de Tiempos Operativos Internos Departamentales
- **Como:** Supervisor
- **Deseo:** Monitorear el tiempo que los expedientes permanecen en mi departamento tecnico frente al acuerdo operativo pactado
- **Para:** Detectar oportunamente demoras internas antes de quebrantar el tiempo comprometido con el solicitante.
- **Regla de Negocio:** [RN-31]
- **Requerimiento:** [RF-33]

**Criterios de Aceptacion:**

##### Escenario 1: Medicion del cumplimiento de OLA departamental
```gherkin
Dado que ingreso al sistema como Supervisor en el panel de mi departamento
Cuando examino los tickets asignados a mi area tecnica
Entonces el sistema me muestra el tiempo consumido de nuestro acuerdo operativo frente al plazo estandar pactado
```

##### Escenario 2: Alerta preventiva ante consumo critico de OLA
```gherkin
Dado que ingreso al sistema como Supervisor en el seguimiento de casos
Cuando un ticket en la cola de mi area alcanza el 75% del tiempo operativo sin resolverse
Entonces el sistema destaca el expediente con aviso preventivo para acelerar su atencion o reasignacion
```

---

## 3. Matriz de Trazabilidad del Sistema

```
+-----------------------------------------------------------------------------------------------------------------------+
|                                         MATRIZ DE TRAZABILIDAD DEL SISTEMA                                            |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| Regla (RN)  | Requer. (RF)| Epica   | Historia  | Titulo de la Historia (HU)           | Escenarios de Prueba         |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| RN-01, RN-08| RF-01       | EPI-01  | HU-01     | Acceso al Espacio de Trabajo         | Ingreso valido y aviso error |
| RN-01       | RF-02       | EPI-01  | HU-02     | Restablecimiento Autonomo de Acceso  | Codigo temporal y caducidad  |
| RN-08, RN-29| RF-03       | EPI-01  | HU-03     | Gestion de Perfil Institucional      | Actualizacion y proteccion   |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| RN-05, RN-08| RF-06       | EPI-02  | HU-04     | Administracion Integral Colaboradores| Alta y suspension de usuario |
| RN-05       | RF-06       | EPI-02  | HU-05     | Configuracion Perfiles Responsabilid.| Asignacion de atribuciones   |
| RN-05, RN-06| RF-07       | EPI-02  | HU-06     | Conmutacion de Funcion Laboral       | Alternar perfil en cabecera  |
| RN-07       | RF-08       | EPI-02  | HU-07     | Delimitacion Opciones de Navegacion  | Denegacion de rutas indebidas|
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| RN-09, RN-10| RF-09       | EPI-03  | HU-08     | Administracion Catalogo de Servicios | Registro con SLAs y compuerta|
| RN-09, RN-18| RF-10       | EPI-03  | HU-09     | Solicitud Asistida desde Catalogo    | Tramitacion por tarjeta      |
| RN-13       | RF-11       | EPI-03  | HU-10     | Consulta de Guias de Autoayuda       | Resolucion autonoma guiada   |
| RN-11       | RF-12       | EPI-03  | HU-11     | Parametrizacion Protocolos Atencion  | Checklist de pasos tecnicos  |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| RN-14       | RF-13       | EPI-04  | HU-12     | Administracion Departamentos Tecnicos| Estructura y designar jefe   |
| RN-15, RN-16| RF-14       | EPI-04  | HU-13     | Gestion de Especialistas Tecnicos    | Asignacion pericia y limites |
| RN-16, RN-17| RF-15       | EPI-04  | HU-14     | Supervision de Carga del Equipo      | Monitoreo de disponibilidad  |
| RN-31       | RF-33       | EPI-04  | HU-33     | Monitoreo Tiempos Operativos Internos| Medicion OLA y alerta al 75% |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| RN-18, RN-19| RF-16       | EPI-05  | HU-15     | Registro de Solicitudes de Atencion  | Reporte con codigo unico     |
| RN-20       | RF-17       | EPI-05  | HU-16     | Priorizacion Automatizada de Casos   | Calculo por impacto-urgencia |
| RN-12, RN-21| RF-18       | EPI-05  | HU-17     | Aprobacion Pedidos Institucionales   | Autorizacion y rechazo mot.  |
| RN-15..RN-17| RF-19       | EPI-05  | HU-18     | Asignacion Operativa de Casos        | Derivacion y control de tope |
| RN-22       | RF-20       | EPI-05  | HU-19     | Pausa Operativa de Atencion          | Pausa y reanudacion de reloj |
| RN-23       | RF-21       | EPI-05  | HU-20     | Colaboracion mediante Notas Privadas | Apuntes tecnicos reservados  |
| RN-24       | RF-22       | EPI-05  | HU-21     | Documentacion Obligatoria Solucion   | Cierre con sustento tecnico  |
| RN-25       | RF-23       | EPI-05  | HU-22     | Evaluacion Satisfaccion del Servicio | Encuesta de 1 a 5 estrellas  |
| RN-26       | RF-24       | EPI-05  | HU-23     | Cierre Formal del Expediente         | Conformidad y cierre tacito  |
| RN-27       | RF-25       | EPI-05  | HU-24     | Adjuncion Evidencias Documentales    | Carga segura y rechazo malos |
| RN-28       | RF-26       | EPI-05  | HU-25     | Alerta Preventiva Riesgo de SLA 80%  | Marca amarilla anticipada    |
| RN-29       | RF-27       | EPI-05  | HU-26     | Despacho Automatico Notificaciones   | Mensajes por correo en hitos |
| RN-30       | RF-28       | EPI-05  | HU-27     | Descarga de Reportes Gerenciales     | Exportacion tabular a Excel  |
| RN-26       | RF-29       | EPI-05  | HU-28     | Reclamacion Persistencia de Falla    | Reapertura dentro de 48 horas|
| RN-03, RN-04| RF-05       | EPI-05  | HU-29     | Fiscalizacion Registros Operativos   | Bitacora inalterable auditor |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| RN-29       | RF-30       | EPI-06  | HU-30     | Centro de Notificaciones en Pantalla | Campana de alertas tiempo real|
| RN-09       | RF-31       | EPI-06  | HU-31     | Vinculacion Activos Institucionales  | Asociacion de equipo a ticket|
| RN-18       | RF-32       | EPI-06  | HU-32     | Gestion de Problemas Operativos      | Resolucion de causa raiz     |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
```
