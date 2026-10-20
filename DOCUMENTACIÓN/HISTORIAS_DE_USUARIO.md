# Historias de Usuario — FlowDesk ITSM

> **Versión:** 3.0 · **Fecha:** 2026-10-19 · **Estado:** vigente.
> **Alcance:** catálogo de épicas e historias de usuario del sistema, con el detalle de los perfiles Administrador y Solicitante. Los criterios de aceptación se mantienen en formato BDD/Gherkin.
> **Relación:** los RF, RNF y RN viven en `REQUERIMIENTOS.md`; la matriz de trazabilidad en `TRAZABILIDAD.md`.

Este documento reemplaza a `historias_de_usuario.md`, `HISTORIAS_USUARIO_ADMINISTRADOR.md` e `HISTORIAS_USUARIO_SOLICITANTE.md`. El catálogo general (Parte I) es la línea base; los detalles por perfil (Partes II y III) amplían criterios y escenarios.

---

## Parte I — Catálogo general de épicas e historias

## Informacion del Documento y Marco Metodologico

- **Proyecto:** Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITSM)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Concepto Fundamental de Historia de Usuario (HU):**
  - Una historia de usuario es una descripcion breve, sencilla y centrada en el valor de una funcionalidad, redactada desde la perspectiva del usuario final.
  - Expresa **quien** necesita la funcion (Como), **que** accion desea realizar (Deseo) y **para que** beneficio o valor de negocio la requiere (Para).
  - Cada historia es atomica pero engloba una capacidad operativa coherente (evitando la fragmentacion innecesaria en botones individuales).
  - Los titulos de las historias no contienen la conjuncion "y", garantizando la unidad del artefacto agil.
  - Cubre la totalidad de las funciones implementadas en el software actual y define las historias de evolucion planificadas en el Roadmap del producto ITSM.
- **Roles Oficiales del Sistema (10):**
  - **Solicitante:** Trabajador o cliente que reporta incidentes, solicita servicios del catalogo y evalua atenciones.
  - **Tecnico:** Especialista operativo que ejecuta las atenciones, sustenta soluciones y registra RFCs tecnicas.
  - **Supervisor:** Lider que coordina al equipo, equilibra cargas de trabajo (WIP) y monitorea acuerdos SLA.
  - **Gestor de Area:** Responsable departamental que autoriza o deniega solicitudes con impacto en recursos.
  - **Auditor:** Revisor formal que fiscaliza la transparencia, cumplimiento normativo y trazabilidad inmutable (solo lectura).
  - **Administrador:** Responsable institucional de la configuracion de formularios, plantillas RFC, catalogos, SLAs y perfiles RBAC.
  - **Aprobador (CAB):** Autoridad de Cambio que evalua colegiadamente el riesgo e impacto de las solicitudes de cambio RFC.
  - **Gestor de Cambios:** Change Manager que planifica el calendario de cambios, ventanas de mantenimiento, freeze y revisiones PIR.
  - **Gestor de Activos y Configuracion:** Custodio tecnologico del inventario de hardware (HAM), topologia CMDB y licencias (SAM).
  - **Gestor de Problemas:** Responsable de la gestion de problemas, el analisis de causa raiz, la KEDB y los workarounds; prioriza problemas, coordina su cierre y alimenta el cambio y el conocimiento.
  - **Usuarios:** Termino universal empleado cuando la historia de usuario aplica a la totalidad de perfiles del sistema.
- **Terminologia Estandarizada:** Se utiliza exclusivamente el termino "usuario" o "usuarios".

---

## 1. Mapa de Epicas del Sistema

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
| EPI-06: GESTION DE CAMBIOS (CHANGE ENABLEMENT)                                                     |
|   ├── [HU-30] Registro de Solicitud de Cambio RFC                                                  |
|   ├── [HU-31] Dictamen y Votacion Colegiada en CAB                                                 |
|   ├── [HU-32] Gestion de Ventanas y Congelamiento                                                  |
|   └── [HU-33] Evaluacion Post-Implementacion PIR                                                   |
+----------------------------------------------------------------------------------------------------+
| EPI-07: GESTION DE ACTIVOS Y CMDB (ITAM / SACM)                                                    |
|   ├── [HU-34] Administracion del Inventario de Hardware HAM                                        |
|   ├── [HU-35] Topologia y Dependencias de Servicios CMDB                                           |
|   └── [HU-36] Control y Cumplimiento de Licencias SAM                                              |
+----------------------------------------------------------------------------------------------------+
| EPI-08: GOBERNANZA ADMINISTRATIVA Y CONFIGURACION DEL SISTEMA                                      |
|   ├── [HU-37] Parametrizacion de Esquemas, Formularios y Plantillas                                 |
|   └── [HU-38] Fiscalizacion Forense de Logs ISO 27001                                              |
+----------------------------------------------------------------------------------------------------+
| EPI-09: MEJORA CONTINUA Y ROADMAP ITSM                                                             |
|   ├── [HU-39] Centro de Notificaciones en Pantalla                                                 |
|   └── [HU-40] Gestion de Problemas Operativos                                                      |
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

### Epica 6 [EPI-06]: GESTION DE CAMBIOS (CHANGE ENABLEMENT)

#### [HU-30] Registro de Solicitud de Cambio RFC
- **Como:** Tecnico o Gestor de Cambios
- **Deseo:** Registrar una peticion formal de cambio tecnico con planes de trabajo, pruebas y contingencia
- **Para:** Asegurar que las intervenciones mayores en produccion esten controladas y mitiguen fallas.
- **Regla de Negocio:** [RN-33], [RN-34]
- **Requerimiento:** [RF-30]

**Criterios de Aceptacion:**

##### Escenario 1: Registro formal de RFC con plan de rollback obligatorio
```gherkin
Dado que ingreso al sistema como Tecnico o Gestor de Cambios en la ruta de registro RFC
Cuando completo el formulario indicando impacto, plan de despliegue y plan de reversion
Entonces el sistema crea la solicitud asignandole un correlativo institucional RFC y la remite a evaluacion
```

---

#### [HU-31] Dictamen y Votacion Colegiada en CAB
- **Como:** Aprobador (CAB)
- **Deseo:** Evaluar las RFCs pendientes y emitir mi voto formal en la consola colegiada
- **Para:** Autorizar intervenciones tecnologicas con garantia de estabilidad y sin conflicto de intereses.
- **Regla de Negocio:** [RN-31], [RN-32]
- **Requerimiento:** [RF-31]

**Criterios de Aceptacion:**

##### Escenario 1: Emision de voto aprobatorio colegiado
```gherkin
Dado que ingreso al sistema como Aprobador CAB en la consola de votacion
Cuando reviso el expediente de la RFC y selecciono la opcion de aprobar con justificacion
Entonces el sistema registra mi voto formalmente y computa el quorum requerido para autorizar el cambio
```

##### Escenario 2: Autoexclusion automatica por conflicto de interes
```gherkin
Dado que ingreso al sistema como Aprobador CAB pero soy el solicitante de la RFC
Cuando intento emitir un voto en la consola
Entonces el sistema bloquea los controles indicando inhabilitacion por autoexclusion SoD
```

---

#### [HU-32] Gestion de Ventanas de Mantenimiento y Congelamiento
- **Como:** Gestor de Cambios
- **Deseo:** Programar ventanas de cambio e identificar periodos de freeze en el calendario corporativo
- **Para:** Prevenir colisiones entre despliegues y evitar indisponibilidad en temporadas criticas.
- **Regla de Negocio:** [RN-33]
- **Requerimiento:** [RF-32]

**Criterios de Aceptacion:**

##### Escenario 1: Deteccion de conflicto con periodo de congelamiento
```gherkin
Dado que ingreso al sistema como Gestor de Cambios en el calendario de ventanas
Cuando intento programar un cambio en una franja declarada como Change Freeze
Entonces el sistema emite una alerta bloqueante impidiendo agendar la ejecucion
```

---

#### [HU-33] Evaluacion Post-Implementacion PIR y Auditoria de Cambios
- **Como:** Gestor de Cambios o Auditor
- **Deseo:** Consultar el historial consolidado de cambios y documentar la revision PIR
- **Para:** Medir el exito de los despliegues y mantener la trazabilidad de lecciones aprendidas.
- **Regla de Negocio:** [RN-03], [RN-34]
- **Requerimiento:** [RF-33]

**Criterios de Aceptacion:**

##### Escenario 1: Cierre de cambio con acta PIR
```gherkin
Dado que ingreso al sistema como Gestor de Cambios tras ejecutarse una RFC
Cuando ingreso al historial consolidado y registro el informe de validacion exitosa
Entonces el sistema almacena el acta PIR de forma inalterable y concluye formalmente el cambio
```

---

### Epica 7 [EPI-07]: GESTION DE ACTIVOS Y CMDB (ITAM / SACM)

#### [HU-34] Administracion del Inventario de Hardware HAM
- **Como:** Gestor de Activos y Configuracion
- **Deseo:** Registrar y actualizar el inventario fisico de equipos informaticos y de red
- **Para:** Mantener el control patrimonial de activos asignados y en stock.
- **Regla de Negocio:** [RN-35]
- **Requerimiento:** [RF-34]

**Criterios de Aceptacion:**

##### Escenario 1: Registro y actualizacion de estado de hardware
```gherkin
Dado que ingreso al sistema como Gestor de Activos en el inventario patrimonial
Cuando registro un nuevo servidor con su numero de serie, ubicacion y estado operativo
Entonces el sistema lo incorpora al catalogo maestro de hardware activo
```

---

#### [HU-35] Topologia y Dependencias de Servicios CMDB
- **Como:** Gestor de Activos y Configuracion
- **Deseo:** Mapear las relaciones de interdependencia entre Elementos de Configuracion (CIs)
- **Para:** Visualizar el impacto topologico de incidentes y cambios sobre los servicios de negocio.
- **Regla de Negocio:** [RN-35]
- **Requerimiento:** [RF-35]

**Criterios de Aceptacion:**

##### Escenario 1: Mapeo de elemento de red y servicio vinculado
```gherkin
Dado que ingreso al sistema en el modulo CMDB
Cuando vinculo una base de datos con el servidor de aplicaciones que soporta el ERP
Entonces el sistema grafica la relacion de dependencia permitiendo analisis de impacto
```

---

#### [HU-36] Control y Cumplimiento de Licencias SAM
- **Como:** Gestor de Activos y Configuracion
- **Deseo:** Supervisar el consumo de licencias de software y vencimiento de garantias
- **Para:** Asegurar el cumplimiento legal de licenciamiento y evitar sobrecostos o sanciones.
- **Regla de Negocio:** [RN-36]
- **Requerimiento:** [RF-36]

**Criterios de Aceptacion:**

##### Escenario 1: Deteccion de alerta por tope de licenciamiento
```gherkin
Dado que ingreso al sistema en el modulo de licencias
Cuando el numero de asignaciones de una suite de software supera el 90% del contrato
Entonces el sistema activa una alerta preventiva de saturacion de licencias
```

---

### Epica 8 [EPI-08]: GOBERNANZA ADMINISTRATIVA Y CONFIGURACION DEL SISTEMA

#### [HU-37] Parametrizacion de Esquemas, Formularios y Plantillas
- **Como:** Administrador
- **Deseo:** Configurar el espacio de captura, campos obligatorios, plantillas RFC y catalogos de servicios
- **Para:** Adaptar los formularios y reglas operativas sin intervenir en la ejecucion transaccional.
- **Regla de Negocio:** [RN-09], [RN-37]
- **Requerimiento:** [RF-37]

**Criterios de Aceptacion:**

##### Escenario 1: Parametrizacion de campos y plantillas de servicio
```gherkin
Dado que ingreso al sistema como Administrador en el panel de servicios
Cuando configuro una plantilla de requerimiento marcando campos obligatorios y compuertas de aprobacion
Entonces el sistema aplica el diseno a los formularios sin permitirme atender o aprobar solicitudes
```

---

#### [HU-38] Fiscalizacion Forense de Logs de Seguridad ISO 27001
- **Como:** Auditor o Administrador
- **Deseo:** Inspeccionar las bitacoras de autenticacion, bloqueos de usuarios e IPs
- **Para:** Garantizar la trazabilidad perimetral inalterable y el cumplimiento de la norma ISO/IEC 27001.
- **Regla de Negocio:** [RN-03], [RN-38]
- **Requerimiento:** [RF-39]

**Criterios de Aceptacion:**

##### Escenario 1: Consulta inalterable de bitacora de seguridad
```gherkin
Dado que ingreso al sistema como Auditor en el visor de logs de seguridad
Cuando aplico filtros por fecha e IP de inicio de sesion fallido
Entonces el sistema despliega el registro historico en modo estricto de solo lectura
```

---

### Epica 9 [EPI-09]: MEJORA CONTINUA Y ROADMAP ITSM

#### [HU-39] Centro de Notificaciones en Pantalla
- **Como:** Usuarios
- **Deseo:** Visualizar avisos inmediatos en la cabecera sin recargar la pagina
- **Para:** Recibir avisos al instante sobre avances en mis expedientes de soporte.
- **Regla de Negocio:** [RN-29]
- **Requerimiento:** [RF-40]

---

#### [HU-40] Gestion de Problemas Operativos
- **Como:** Supervisor
- **Deseo:** Agrupar incidentes repetitivos en un caso maestro de problema
- **Para:** Eliminar la causa raiz estructural de fallas recurrentes bajo estandares ITIL.
- **Regla de Negocio:** [RN-18]
- **Requerimiento:** [RF-41]

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
| RN-33, RN-34| RF-30       | EPI-06  | HU-30     | Registro de Solicitud de Cambio RFC  | Registro formal y rollback   |
| RN-31, RN-32| RF-31       | EPI-06  | HU-31     | Dictamen y Votacion Colegiada en CAB | Quorum y autoexclusion SoD   |
| RN-33       | RF-32       | EPI-06  | HU-32     | Gestion de Ventanas y Congelamiento  | Alerta de freeze y cruces    |
| RN-03, RN-34| RF-33       | EPI-06  | HU-33     | Evaluacion Post-Implementacion PIR   | Trazabilidad de cierre PIR   |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| RN-35       | RF-34       | EPI-07  | HU-34     | Administracion Inventario de Hardware| Control patrimonial y serie  |
| RN-35       | RF-35       | EPI-07  | HU-35     | Topologia y Dependencias CMDB        | Mapeo nodo CI y dependencias |
| RN-36       | RF-36       | EPI-07  | HU-36     | Control y Cumplimiento Licencias SAM | Alertas de vencimiento y tope|
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| RN-09, RN-37| RF-37       | EPI-08  | HU-37     | Parametrizacion Esquemas y Plantillas| Formularios y plantillas RFC |
| RN-03, RN-38| RF-39       | EPI-08  | HU-38     | Fiscalizacion Forense Logs ISO 27001 | Bitacora perimetral auditor  |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
| RN-29       | RF-40       | EPI-09  | HU-39     | Centro de Notificaciones en Pantalla | Campana de alertas tiempo real|
| RN-18       | RF-41       | EPI-09  | HU-40     | Gestion de Problemas Operativos      | Resolucion de causa raiz     |
+-------------+-------------+---------+-----------+--------------------------------------+------------------------------+
```


---

## Parte II — Detalle del perfil Administrador

Sistema de Gestión de Tickets e Incidentes ITIL v4 / ISO 20000

---

## Historia de Usuario HU-ADM-01: Gestión Integral de Usuarios y Asignación de Roles

**Como:** Administrador general del sistema.  
**Deseo:** Crear, editar y administrar las cuentas de usuario institucionales con asignación múltiple de perfiles, dependencias y niveles de prioridad.  
**Para:** Garantizar un control centralizado de identidades y asegurar que cada colaborador disponga del nivel de servicio y permisos adecuados en la plataforma.

### Criterios de Aceptación:

#### Escenario 1: Registro exitoso de nuevo usuario con múltiples roles
- **Dado que** el administrador ingresa al módulo de Gestión de Usuarios y selecciona "Nuevo Usuario".
- **Cuando** completa los datos de identidad (DNI, nombres, apellidos, teléfono, correo personal), selecciona su departamento y asigna los perfiles de "Técnico" y "Solicitante".
- **Entonces** el sistema valida la unicidad del documento y correo, registra la cuenta en la base de datos y presenta una ventana de resumen con las credenciales generadas.

#### Escenario 2: Asignación de nivel de prioridad VIP / Ejecutiva
- **Dado que** el administrador edita los datos de un usuario perteneciente a la alta dirección o gerencia.
- **Cuando** modifica el selector de prioridad de "Nivel 5: Estándar" a "Nivel 1: Prioridad VIP".
- **Entonces** el sistema persiste la jerarquía del usuario, provocando que todos los tickets que este usuario reporte en el futuro se etiqueten como prioritarios para el cálculo de tiempos SLA.

#### Escenario 3: Bloqueo y desactivación de cuenta de usuario
- **Dado que** un colaborador cesa sus labores o requiere suspensión preventiva de acceso.
- **Cuando** el administrador pulsa la acción de desactivar usuario en la tabla y confirma la operación.
- **Entonces** el sistema efectúa un borrado lógico (`estado_registro = false`), invalidando de inmediato cualquier sesión activa del colaborador e impidiendo futuros inicios de sesión.

---

## Historia de Usuario HU-ADM-02: Generación y Despacho Automatizado de Credenciales

**Como:** Administrador de la plataforma de TI.  
**Deseo:** Generar correos corporativos estandarizados, contraseñas seguras y despacharlos al correo personal del usuario mediante servicio SMTP.  
**Para:** Agilizar el aprovisionamiento de cuentas de nuevos colaboradores manteniendo altos estándares de seguridad informática.

### Criterios de Aceptación:

#### Escenario 1: Generación automática de correo institucional y contraseña estándar
- **Dado que** el administrador ingresa los nombres y apellidos de un nuevo colaborador en el formulario de alta.
- **Cuando** el sistema procesa los campos de texto en tiempo real.
- **Entonces** genera automáticamente la sugerencia de correo corporativo institucional (por ejemplo, `inicial_nombre + apellido_paterno @organizacion.com`) y una clave aleatoria compleja de 8 o más caracteres con mayúsculas, minúsculas y números.

#### Escenario 2: Envío de credenciales vía correo electrónico SMTP
- **Dado que** se ha completado el registro de un nuevo usuario con correo personal verificado.
- **Cuando** el administrador hace clic en el botón "Enviar credenciales por correo".
- **Entonces** el servidor despacha un correo electrónico seguro con la bienvenida institucional, el usuario asignado, la contraseña temporal y el enlace directo de inicio de sesión.

#### Escenario 3: Copiado rápido de credenciales al portapapeles
- **Dado que** el administrador visualiza el panel de confirmación de creación de usuario.
- **Cuando** pulsa los botones de acción "Copiar correo" o "Copiar clave".
- **Entonces** el sistema copia la cadena correspondiente al portapapeles del sistema operativo y despliega un indicador visual confirmando el copiado.

---

## Historia de Usuario HU-ADM-03: Administración de Perfiles y Matriz Jerárquica de Permisos

**Como:** Administrador de seguridad del sistema.  
**Deseo:** Definir perfiles operativos y asignar permisos granulares sobre el árbol jerárquico del menú de navegación.  
**Para:** Garantizar el principio de menor privilegio (PoLP) y cumplimiento de directivas de segregación de funciones (SoD).

### Criterios de Aceptación:

#### Escenario 1: Creación y parametrización de un nuevo perfil
- **Dado que** el administrador accede a la sección de "Perfiles y Permisos".
- **Cuando** hace clic en "Crear Perfil", ingresa un nombre formal (por ejemplo, "Auditor de Mesa") y una descripción funcional del rol.
- **Entonces** el sistema habilita el árbol interactivo de opciones de menú para configurar los accesos exclusivos que tendrá dicho perfil.

#### Escenario 2: Propagación jerárquica de selección en el árbol de permisos
- **Dado que** el administrador está asignando permisos en un perfil dentro del árbol de menú.
- **Cuando** marca una opción hoja (por ejemplo, nivel 3 "Tickets Pendientes" o nivel 4 "Configuración del formulario").
- **Entonces** el sistema marca automáticamente todos los módulos padre y carpetas contenedoras ascendentes para asegurar la navegabilidad de la ruta.

#### Escenario 3: Desmarcación en cascada de ramas subordinadas
- **Dado que** una carpeta contenedora de menú tiene varias opciones hijas seleccionadas.
- **Cuando** el administrador desmarca la casilla del módulo padre de nivel superior.
- **Entonces** el sistema desmarca automáticamente todas las pantallas descendientes asociadas a dicha rama, impidiendo la asignación parcial o inconsistente de permisos.

---

## Historia de Usuario HU-ADM-04: Gestión del Catálogo de Servicios de Incidentes

**Como:** Administrador del catálogo de servicios de TI.  
**Deseo:** Administrar el catálogo de servicios orientados a Incidentes, definiendo sus categorías, criticidad y acuerdos de nivel de servicio (SLA).  
**Para:** Proporcionar a la Mesa de Ayuda un marco formal para clasificar y restaurar de forma priorizada fallas e interrupciones del servicio.

### Criterios de Aceptación:

#### Escenario 1: Filtrado y consulta exclusiva de servicios de tipo Incidente
- **Dado que** el administrador ingresa al módulo de Servicios del Catálogo.
- **Cuando** selecciona la vista o filtro de "Incidentes" (`tipo = 1`).
- **Entonces** la tabla despliega exclusivamente los servicios diseñados para resolver caídas y averías (código con prefijo `SRV-INC`), omitiendo solicitudes de adquisición o aprovisionamiento.

#### Escenario 2: Asignación de grupo técnico resolutor inicial
- **Dado que** el administrador edita un servicio de incidente (por ejemplo, "Falla en Enlace de Fibra Óptica").
- **Cuando** selecciona en el selector de departamento resolutor el grupo "Redes y Telecomunicaciones".
- **Entonces** el sistema almacena dicha relación, garantizando que los incidentes de este servicio se enruten directamente al equipo técnico especializado correspondiente.

#### Escenario 3: Actualización de tiempos de primera respuesta y resolución
- **Dado que** la organización renegocia los acuerdos de soporte técnico para incidentes críticos.
- **Cuando** el administrador ajusta el tiempo de primera respuesta a 30 minutos y resolución a 2 horas en la ficha del servicio.
- **Entonces** el catálogo actualiza los parámetros en la base de datos y recalcula automáticamente los límites de vencimiento para los nuevos tickets que se aperturen bajo este servicio.

---

## Historia de Usuario HU-ADM-05: Gestión del Catálogo de Servicios de Solicitudes

**Como:** Administrador de servicios corporativos.  
**Deseo:** Configurar los servicios orientados a Solicitudes de Servicio (peticiones de equipamiento, software, accesos y cambios menores).  
**Para:** Estandarizar la oferta de requerimientos informáticos hacia los colaboradores y definir las reglas de entrega y validación correspondientes.

### Criterios de Aceptación:

#### Escenario 1: Configuración de acuerdos de entrega (SLA/OLA) para solicitudes
- **Dado que** el administrador selecciona un servicio del catálogo clasificado como "Solicitud de Servicio" (`tipo = 2`).
- **Cuando** define el tiempo de entrega prometido (por ejemplo, 24 horas hábiles) y su horario de cobertura (8x5 o 24x7).
- **Entonces** el sistema registra el acuerdo de servicio y lo publica en el catálogo oficial para conocimiento transparente de los usuarios solicitantes.

#### Escenario 2: Activación de compuertas de aprobación obligatorias
- **Dado que** un servicio de solicitud implica asignación presupuestal o riesgo de seguridad (por ejemplo, "Asignación de Laptop de Alta Gama").
- **Cuando** el administrador activa la casilla "Requiere Aprobación Jerárquica Obligatoria".
- **Entonces** el sistema configura el servicio para que ningún técnico pueda despacharlo sin contar previamente con el visto bueno del jefe de área o supervisor correspondiente.

#### Escenario 3: Deshabilitación controlada de un servicio con justificación formal
- **Dado que** un servicio de solicitud entra en obsolescencia o mantenimiento temporal.
- **Cuando** el administrador pulsa "Deshabilitar Servicio", ingresa la justificación institucional requerida y confirma.
- **Entonces** el servicio se oculta del portal de autoservicio de los solicitantes, quedando archivado en el catálogo administrativo con trazabilidad de auditoría.

---

## Historia de Usuario HU-ADM-06: Registro Oficial de Nuevos Servicios en el Catálogo

**Como:** Administrador del sistema ITIL v4.  
**Deseo:** Utilizar un formulario oficial unificado para dar de alta nuevos servicios en el catálogo institucional.  
**Para:** Garantizar que todo servicio nuevo cumpla con los estándares de nomenclatura, clasificación, costos y acuerdos de servicio definidos por la organización.

### Criterios de Aceptación:

#### Escenario 1: Generación automática de código oficial ITIL
- **Dado que** el administrador abre la vista de creación de servicio.
- **Cuando** selecciona la naturaleza del servicio ("Incidente" o "Solicitud") y la categoría técnica ("Ciberseguridad", "Redes", "Sistemas", etc.).
- **Entonces** el sistema genera en tiempo real el código estandarizado del servicio (por ejemplo, `SRV-INC-SEC-005` o `SRV-SOL-ACC-012`) en formato de solo lectura.

#### Escenario 2: Validación estricta de parámetros mínimos requeridos
- **Dado que** el administrador intenta guardar el nuevo servicio sin ingresar la descripción del entregable o con tiempos SLA en cero.
- **Cuando** hace clic en el botón "Registrar Servicio" al pie del formulario.
- **Entonces** el sistema interrumpe el registro, focaliza el campo con error y emite un mensaje indicando que todos los parámetros operativos son mandatorios.

#### Escenario 3: Redirección automática y publicación en el catálogo
- **Dado que** todos los campos del formulario cumplen las validaciones de negocio.
- **Cuando** el administrador confirma el registro del nuevo servicio.
- **Entonces** el sistema guarda el servicio en la base de datos, muestra una alerta de confirmación exitosa y redirige al listado filtrado por la categoría correspondiente.

---

## Historia de Usuario HU-ADM-07: Configuración de Formularios Dinámicos para Incidentes

**Como:** Administrador de procesos de la Mesa de Ayuda.  
**Deseo:** Parametrizar los campos adicionales del formulario de incidentes y regular su visibilidad según la prioridad del usuario solicitante.  
**Para:** Capturar información técnica pertinente en el reporte de fallas sin sobrecargar al usuario con preguntas innecesarias.

### Criterios de Aceptación:

#### Escenario 1: Adición de campos personalizados al formulario de incidentes
- **Dado que** el administrador ingresa a la pestaña "Incidentes" en el Diseñador de Formularios.
- **Cuando** agrega un campo de tipo lista denominado "Sede o Ubicación de la Falla" con opciones delimitadas por comas.
- **Entonces** el campo se incorpora a la lista activa del formulario y se refleja inmediatamente en el panel de vista previa interactiva.

#### Escenario 2: Regla de visibilidad por nivel de prioridad del solicitante
- **Dado que** el administrador configura el campo "Registrar en nombre de otro usuario".
- **Cuando** define como prioridad mínima visible el "Nivel 3: Prioridad Preferente".
- **Entonces** el sistema asegura que dicho campo solo sea visible para usuarios con prioridad VIP, Ejecutiva o Preferente, ocultándose para colaboradores de perfil estándar.

#### Escenario 3: Marcado de obligatoriedad y persistencia en base de datos
- **Dado que** el administrador activa la casilla "Obligatorio" en un campo específico y hace clic en "Guardar Configuración".
- **Cuando** la API procesa la petición de actualización.
- **Entonces** el esquema JSON de configuración se guarda en la tabla de parámetros y el portal de autoservicio exigirá obligatoriamente dicho campo al reportar un incidente.

---

## Historia de Usuario HU-ADM-08: Configuración de Formularios para Solicitudes de Servicio

**Como:** Administrador de catálogo y autoservicio.  
**Deseo:** Personalizar los campos requeridos en el formulario de solicitudes de servicio, incluyendo datos presupuestales, modalidades de acceso y justificaciones.  
**Para:** Obtener todos los recaudos necesarios antes de evaluar la factibilidad técnica y económica de la petición.

### Criterios de Aceptación:

#### Escenario 1: Configuración de campos de centro de costos y modalidad de uso
- **Dado que** el administrador selecciona la pestaña "Solicitudes de Servicio" en el diseñador de formularios.
- **Cuando** habilita los campos "Centro de Costos / Aprobación Presupuestal" y "Modalidad de Uso (Temporal / Definitivo)".
- **Entonces** el sistema actualiza el esquema dinámico de solicitudes y valida que dichos campos se rendericen cuando el usuario solicite un recurso de TI.

#### Escenario 2: Simulación interactiva de formulario y vista de expediente
- **Dado que** el administrador está modificando los campos de solicitud de servicio.
- **Cuando** conmuta el selector de vista previa entre "Modo Formulario" y "Modo Ticket / Expediente".
- **Entonces** la plataforma renderiza en tiempo real cómo visualizará el solicitante el formulario de entrada y cómo visualizará el técnico la información recibida en el ticket.

#### Escenario 3: Inclusión de mensajes de ayuda y texto de marcador de posición (placeholder)
- **Dado que** un campo requiere instrucciones específicas para evitar errores del usuario.
- **Cuando** el administrador ingresa un texto de ayuda en el configurador del campo.
- **Entonces** el sistema asocia dicha guía contextual al campo, mostrándola debajo de la etiqueta en el portal del solicitante.

---

## Historia de Usuario HU-ADM-09: Diseñador de Flujos de Trabajo y Compuertas de Aprobación

**Como:** Administrador de procesos ITIL.  
**Deseo:** Diseñar los pasos operativos de atención, roles ejecutores y compuertas de aprobación jerárquica (Gateways SoD) de cada servicio.  
**Para:** Automatizar el ciclo de vida del ticket, asegurar la debida autorización antes de despachar cambios y controlar la pausa del SLA durante revisiones externas.

### Criterios de Aceptación:

#### Escenario 1: Creación secuencial de pasos operativos con rol ejecutor
- **Dado que** el administrador abre el diseñador de workflow de un servicio específico.
- **Cuando** hace clic en "Agregar Paso Operativo", define el código, el nombre del paso (por ejemplo, "Diagnóstico L1") y selecciona el rol ejecutor ("Mesa de Ayuda N1").
- **Entonces** el sistema añade el paso con su numeración correlativa y vincula la responsabilidad operativa a ese perfil específico.

#### Escenario 2: Configuración de compuerta de aprobación jerárquica (Gateway SoD)
- **Dado que** un paso del flujo requiere validación por parte de una jefatura antes de continuar la atención.
- **Cuando** el administrador marca la casilla "Es Compuerta de Aprobación Jerárquica" y asigna el rol "Jefe de Área / Supervisor".
- **Entonces** el sistema transforma el paso en una compuerta formal, impidiendo el avance a fases posteriores hasta que un usuario con dicho rol registre su aprobación formal.

#### Escenario 3: Regla de pausa automática del temporizador de SLA
- **Dado que** un paso depende de terceros o requiere una aprobación que no consume tiempo técnico directo.
- **Cuando** el administrador activa la casilla "Pausar temporizador de SLA en este paso".
- **Entonces** el motor de SLA congelará automáticamente el conteo regresivo del cronómetro mientras el ticket permanezca en dicho paso, reactivándolo una vez emitida la resolución.


---

## Parte III — Detalle del perfil Solicitante

Sistema de Gestión de Tickets e Incidentes ITIL v4 / ISO 20000

---

## Historia de Usuario HU-01: Alternancia de Perfil Operativo

**Como:** Usuario institucional con múltiples roles asignados en el sistema.  
**Deseo:** Alternar mi perfil activo hacia el rol de Solicitante desde la cabecera del portal.  
**Para:** Gestionar mis solicitudes personales de servicio técnico sin requerir cerrar sesión ni abrir ventanas privadas.

### Criterios de Aceptación:

#### Escenario 1: Cambio exitoso de perfil operativo
- **Dado que** el usuario ha iniciado sesión con credenciales válidas y cuenta con perfiles de Técnico y Solicitante asignados.
- **Cuando** despliega el selector de roles en la cabecera y selecciona la opción "Solicitante".
- **Entonces** el sistema actualiza la sesión activa en el servidor y redirige automáticamente al usuario a su bandeja personal (`/tickets/gestion/mios`), ocultando las opciones y herramientas administrativas del perfil previo.

#### Escenario 2: Persistencia del perfil durante la navegación
- **Dado que** el usuario seleccionó exitosamente el perfil de Solicitante.
- **Cuando** recarga la página o navega a través de las opciones del menú lateral.
- **Entonces** el sistema conserva la cookie de sesión con el perfil de Solicitante y restringe el acceso a rutas operativas o de configuración global.

#### Escenario 3: Interfaz estática para usuarios con rol único
- **Dado que** un colaborador cuenta únicamente con el perfil de Solicitante asignado en la base de datos.
- **Cuando** visualiza la cabecera superior del sistema.
- **Entonces** el selector de perfil se muestra en modo informativo sin menú desplegable ni flechas de alternancia, indicando de forma fija "Solicitante".

---

## Historia de Usuario HU-02: Exploración del Catálogo de Servicios

**Como:** Solicitante de soporte institucional.  
**Deseo:** Explorar el catálogo oficial de servicios categorizado por tipo de requerimiento e insumo técnico.  
**Para:** Identificar rápidamente la solución tecnológica que requiero y conocer los acuerdos de nivel de servicio (SLA) comprometidos.

### Criterios de Aceptación:

#### Escenario 1: Diferenciación entre Incidentes y Solicitudes de Servicio
- **Dado que** el solicitante ingresa al módulo de Catálogo de Servicios.
- **Cuando** alterna entre las pestañas "Incidentes" y "Solicitudes de Servicio".
- **Entonces** el sistema filtra los ítems disponibles, mostrando para incidentes aquellos destinados a reportar fallas e interrupciones, y para solicitudes aquellos destinados a peticiones de equipamiento, software o accesos.

#### Escenario 2: Visualización transparente de tiempos SLA
- **Dado que** el usuario navega por las tarjetas de servicio en el catálogo.
- **Cuando** examina un servicio específico (por ejemplo, "Configuración de Red VPN").
- **Entonces** el sistema exhibe el tiempo estimado de primera respuesta, el tiempo máximo de resolución oficial y la descripción funcional del entregable.

#### Escenario 3: Inicio guiado de ticket desde el catálogo
- **Dado que** el solicitante localiza el servicio requerido en la cuadrícula de categorías.
- **Cuando** hace clic en el botón de acción del servicio seleccionado.
- **Entonces** el sistema lo redirige al formulario de creación preseleccionando automáticamente el tipo de ticket, la categoría y el servicio correspondiente.

---

## Historia de Usuario HU-03: Creación y Clasificación de Tickets

**Como:** Solicitante del portal de autoservicio.  
**Deseo:** Completar y enviar un formulario estructurado para reportar una incidencia o solicitar un servicio.  
**Para:** Que el equipo de soporte reciba la información precisa y pueda iniciar la atención de acuerdo con los niveles de servicio establecidos.

### Criterios de Aceptación:

#### Escenario 1: Deducción automática de prioridad según Impacto y Urgencia
- **Dado que** el solicitante se encuentra en el formulario oficial de creación de tickets.
- **Cuando** selecciona un nivel de Impacto (por ejemplo, "Alto") y un nivel de Urgencia (por ejemplo, "Alto").
- **Entonces** el sistema calcula en tiempo real la prioridad resultante ("P1 - Crítica") y actualiza la insignia de plazo de resolución asociado según la matriz ITIL.

#### Escenario 2: Validación de completitud en campos requeridos
- **Dado que** el solicitante intenta enviar el formulario sin completar el título o detallar la descripción del problema.
- **Cuando** presiona el botón "Registrar Ticket".
- **Entonces** el sistema bloquea el envío, resalta los campos faltantes en color de alerta y muestra mensajes de validación indicando la longitud mínima obligatoria.

#### Escenario 3: Captura de campos contextuales para Solicitudes de Servicio
- **Dado que** el solicitante selecciona la modalidad "Solicitud de Servicio".
- **Cuando** se despliega el formulario especializado.
- **Entonces** el sistema habilita de forma obligatoria los campos de "Justificación del Requerimiento" y "Fecha Límite Deseada", validando que dicha fecha no sea anterior a la fecha actual.

---

## Historia de Usuario HU-04: Carga y Validación de Archivos Adjuntos

**Como:** Solicitante de soporte técnico.  
**Deseo:** Adjuntar archivos, capturas de pantalla y documentos probatorios al crear un ticket.  
**Para:** Proporcionar evidencia tangible de fallas técnicas o documentación formal de autorización a los especialistas de TI.

### Criterios de Aceptación:

#### Escenario 1: Carga exitosa de evidencias fotográficas o documentales
- **Dado que** el usuario redacta una solicitud o reporte de incidente.
- **Cuando** selecciona archivos en formatos permitidos (PNG, JPG, PDF, DOCX, XLSX) con un peso menor o igual a 5 MB por archivo.
- **Entonces** el sistema carga los archivos localmente, genera una vista previa con nombre y tamaño en kilobytes, y los lista en la bandeja de adjuntos pendientes de envío.

#### Escenario 2: Bloqueo y advertencia ante extensiones no seguras
- **Dado que** el usuario intenta subir un archivo con extensión potencialmente peligrosa (.exe, .bat, .sh, .cmd, .js).
- **Cuando** procesa la selección en el cuadro de diálogo de archivos.
- **Entonces** el sistema rechaza el archivo de inmediato, omite su incorporación y presenta un mensaje indicando que el tipo de archivo no está permitido por directivas de seguridad.

#### Escenario 3: Retiro de archivos adjuntos antes del envío
- **Dado que** el usuario cargó un archivo por error en el formulario.
- **Cuando** presiona el botón de eliminar asociado a dicho archivo en la lista previa.
- **Entonces** el archivo se remueve de la memoria del formulario sin dejar rastros en el registro previo al envío formal.

---

## Historia de Usuario HU-05: Seguimiento y Filtrado en la Bandeja "Mis Tickets"

**Como:** Solicitante recurrente de la organización.  
**Deseo:** Consultar mi historial de tickets con métricas resumidas y herramientas de búsqueda avanzada.  
**Para:** Conocer el estado de avance de mis solicitudes abiertas y consultar el historial de requerimientos concluidos.

### Criterios de Aceptación:

#### Escenario 1: Segmentación rápida por estado mediante tarjetas métricas
- **Dado que** el solicitante accede a la vista de "Mis Tickets".
- **Cuando** pulsa sobre las tarjetas superiores ("En Proceso", "Finalizados" o "Total Registrados").
- **Entonces** la tabla inferior filtra dinámicamente el listado, mostrando exclusivamente los tickets que coincidan con la fase del ciclo de vida seleccionada.

#### Escenario 2: Búsqueda reactiva por múltiples atributos
- **Dado que** el solicitante cuenta con múltiples tickets registrados en su historial.
- **Cuando** escribe un término en el campo de búsqueda (código de ticket, nombre de servicio o palabras clave del título).
- **Entonces** la tabla filtra instantáneamente las filas coincidentes sin recargar la página completa.

#### Escenario 3: Filtrado combinado mediante panel desplegable
- **Dado que** el usuario abre el panel de filtros mediante el botón "Filtrar".
- **Cuando** selecciona simultáneamente filtros de tipo ("Solicitud de Servicio"), prioridad ("P2 - Alta") y estado ("En Atención").
- **Entonces** la lista muestra únicamente los registros que cumplen todas las condiciones, mostrando un indicador numérico con la cantidad de filtros activos aplicados.

---

## Historia de Usuario HU-06: Consulta Detallada y Progreso del Ticket

**Como:** Solicitante del servicio.  
**Deseo:** Abrir el detalle completo de un ticket específico y observar su evolución en una interfaz simplificada.  
**Para:** Comprender en qué etapa de atención se encuentra mi requerimiento sin interpretar tecnicismos de soporte.

### Criterios de Aceptación:

#### Escenario 1: Línea de tiempo visual simplificada (Stepper de 4 etapas)
- **Dado que** el solicitante ingresa a la vista detallada de uno de sus tickets.
- **Cuando** visualiza el componente de seguimiento en la parte superior.
- **Entonces** el sistema presenta un stepper con 4 fases de negocio claras: "Registrado", "Asignado", "En Proceso" y "Resuelto/Cerrado", marcando con color activo la etapa correspondiente al estado interno ITIL del ticket.

#### Escenario 2: Información de contacto del especialista y tiempo comprometido
- **Dado que** el ticket ha sido asignado a un técnico de soporte.
- **Cuando** el usuario revisa la tarjeta de información general.
- **Entonces** el sistema muestra el nombre del especialista a cargo, la fecha de registro y la fecha límite de entrega según el SLA convenido.

#### Escenario 3: Descarga de evidencias y visualización del requerimiento
- **Dado que** el ticket contiene archivos adjuntos originales.
- **Cuando** el solicitante hace clic en el enlace "Descargar" de cualquiera de los adjuntos.
- **Entonces** el navegador inicia la descarga del archivo con su nombre original e integridad intacta.

---

## Historia de Usuario HU-07: Comunicación Bidireccional con Soporte Técnico

**Como:** Solicitante con un ticket en atención.  
**Deseo:** Enviar y recibir mensajes públicos a través de un canal de conversación dentro del ticket.  
**Para:** Coordinar detalles de la solución, aclarar dudas y responder consultas del técnico asignado.

### Criterios de Aceptación:

#### Escenario 1: Envío de mensaje al equipo de soporte
- **Dado que** el ticket se encuentra en estado de atención o espera.
- **Cuando** el solicitante redacta un mensaje en el campo de chat público y presiona "Enviar".
- **Entonces** el comentario se almacena en la bitácora del ticket con autoría del solicitante, fecha y hora exacta, quedando visible para el técnico responsable.

#### Escenario 2: Restricción de acceso a notas técnicas internas
- **Dado que** el equipo técnico o supervisor registra notas de trabajo privadas (internas) para coordinación de TI.
- **Cuando** el solicitante consulta el historial de mensajes de su ticket.
- **Entonces** el sistema omite estrictamente la visualización de notas internas, garantizando que el usuario solo visualice mensajes marcados como públicos.

#### Escenario 3: Validación contra envíos en blanco
- **Dado que** el solicitante presiona el botón de envío sin haber redactado texto en la caja de comentarios.
- **Cuando** el sistema evalúa la acción.
- **Entonces** el botón permanece inactivo o el sistema previene el envío, evitando la inserción de registros vacíos en la base de datos.

---

## Historia de Usuario HU-08: Confirmación de Conformidad y Cierre de Servicio

**Como:** Solicitante que ha recibido atención técnica en su requerimiento.  
**Deseo:** Confirmar formalmente la conformidad del servicio una vez que el especialista marca el ticket como resuelto.  
**Para:** Validar que la solución entregada es satisfactoria y permitir el cierre administrativo definitivo del ticket.

### Criterios de Aceptación:

#### Escenario 1: Cierre voluntario tras validación exitosa
- **Dado que** el especialista resolvió la incidencia y registró la solución técnica aplicada en el ticket.
- **Cuando** el solicitante verifica que la solución funciona y hace clic en "Confirmar Conformidad y Cerrar Ticket".
- **Entonces** el sistema actualiza el estado del ticket a "Cerrado", sella la fecha de cierre formal y habilita el módulo de calificación de servicio.

#### Escenario 2: Visualización de la solución documentada
- **Dado que** el ticket ha cambiado a estado "Resuelto".
- **Cuando** el usuario ingresa a la vista del ticket.
- **Entonces** se presenta un panel destacado que describe en lenguaje claro la solución aplicada por el especialista para que el usuario conozca las acciones realizadas.

#### Escenario 3: Restricción de cierre anticipado
- **Dado que** el ticket se encuentra en estado "Abierto", "Asignado" o "En Atención".
- **Cuando** el solicitante visualiza las acciones disponibles en la pantalla.
- **Entonces** el botón de confirmación de conformidad permanece oculto, impidiendo el cierre de tickets que aún no han sido solucionados.

---

## Historia de Usuario HU-09: Reapertura Justificada de Tickets

**Como:** Solicitante cuyo problema reportado no quedó resuelto de manera efectiva.  
**Deseo:** Solicitar la reapertura de un ticket resuelto dentro del plazo de garantía de 48 horas.  
**Para:** Que el equipo de soporte retome la atención sin necesidad de generar un nuevo ticket desde cero.

### Criterios de Aceptación:

#### Escenario 1: Reapertura dentro de la ventana de garantía
- **Dado que** un ticket se encuentra en estado "Resuelto" y no han transcurrido más de 48 horas desde la fecha de resolución registrada.
- **Cuando** el usuario activa la opción "La falla persiste (Reabrir)", ingresa una explicación detallada de más de 8 caracteres y confirma la acción.
- **Entonces** el sistema cambia el estado del ticket a reapertura/atención, notifica al técnico y registra el motivo formal en el historial de auditoría.

#### Escenario 2: Validación de justificación obligatoria
- **Dado que** el solicitante hace clic en solicitar reapertura pero deja el campo de motivo vacío o con texto menor a 8 caracteres.
- **Cuando** presiona "Enviar Solicitud de Reapertura".
- **Entonces** el sistema bloquea la transacción y muestra un mensaje de alerta solicitando explicar con suficiente detalle la persistencia de la falla.

#### Escenario 3: Cierre de ventana de reapertura superadas las 48 horas
- **Dado que** han transcurrido más de 48 horas calendario desde la fecha de resolución del ticket.
- **Cuando** el solicitante revisa las acciones disponibles en el ticket resuelto.
- **Entonces** el botón de reapertura se encuentra deshabilitado y se muestra un mensaje informativo indicando "Ventana de reapertura (48h) concluida", instruyendo a registrar un nuevo requerimiento en caso de nueva incidencia.

---

## Historia de Usuario HU-10: Calificación de Calidad del Servicio (Encuesta CSAT)

**Como:** Solicitante que concluyó un trámite o soporte técnico.  
**Deseo:** Evaluar la calidad de atención recibida mediante una escala de estrellas y un comentario voluntario.  
**Para:** Retroalimentar a la dirección de TI sobre el desempeño del soporte y contribuir a la mejora continua del servicio.

### Criterios de Aceptación:

#### Escenario 1: Registro satisfactorio de calificación de servicio
- **Dado que** el ticket ha alcanzado el estado "Resuelto" o "Cerrado" y no ha sido calificado previamente.
- **Cuando** el usuario selecciona una puntuación entre 1 y 5 estrellas, redacta una opinión voluntaria y presiona "Enviar Calificación".
- **Entonces** el sistema almacena el puntaje y retroalimentación en la base de datos, asociándolos a las métricas del técnico y actualizando la interfaz a un resumen de agradecimiento.

#### Escenario 2: Bloqueo de encuestas duplicadas (inmutabilidad de la calificación)
- **Dado que** el usuario ya envió la calificación de satisfacción para un ticket en particular.
- **Cuando** regresa posteriormente a la vista de dicho ticket.
- **Entonces** el componente interactivo de estrellas se deshabilita y se exhibe en modo de solo lectura la puntuación previamente registrada, impidiendo modificaciones posteriores.

#### Escenario 3: Obligatoriedad de puntaje numérico mínimo
- **Dado que** el usuario intenta pulsar "Enviar Calificación" sin haber seleccionado ninguna estrella (puntuación cero).
- **Cuando** se ejecuta la acción en la tarjeta CSAT.
- **Entonces** el sistema impide el registro y señala visualmente que debe seleccionar al menos una estrella para validar su evaluación.
