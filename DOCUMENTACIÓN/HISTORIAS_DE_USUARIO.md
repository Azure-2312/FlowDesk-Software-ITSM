# Historias de Usuario — FlowDesk ITSM

> **Versión:** 4.0 · **Fecha:** 2026-10-23 · **Estado:** Vigente y Alineado con Trello.
> **Estructura Documental:**
> 1. **Parte I — Historias de Usuario en Columna "HECHO" (Sprint 1 y Sprint 2):** Avance tangible y comprobable en el software.
> 2. **Parte II — Historias de Usuario en Columna "PRODUCT BACKLOG" (Pendientes):** Funcionalidades planificadas para siguientes iteraciones.
> 3. **Parte III — Matriz de Asignación por Integrante:** Mapeo de historias por responsable Scrum y módulo de dominio.

---

## Parte I — Historias de Usuario en Columna "HECHO" (Sprint 1 y Sprint 2)

> Estas historias representan las capacidades funcionales desarrolladas, probadas y aceptadas por el equipo Scrum en los dos primeros sprints de trabajo.

Historia de Usuario 00

Como: Administrador de la plataforma de TI.
Deseo: Generar correos corporativos estandarizados, contraseñas seguras y despacharlos al correo personal del usuario mediante servicio SMTP.
Para: Agilizar el aprovisionamiento de cuentas de nuevos colaboradores manteniendo altos estándares de seguridad informática.

Criterios de Aceptación:
Escenario 1: Generación automática de correo institucional y contraseña estándar
Dado que el administrador ingresa los nombres y apellidos de un nuevo colaborador en el formulario de alta.

Cuando el sistema procesa los campos de texto en tiempo real.

Entonces genera automáticamente la sugerencia de correo corporativo institucional (por ejemplo, inicial_nombre + apellido_paterno @organizacion.com) y una clave aleatoria compleja de 8 o más caracteres con mayúsculas, minúsculas y números.

Escenario 2: Envío de credenciales vía correo electrónico SMTP
Dado que se ha completado el registro de un nuevo usuario con correo personal verificado.

Cuando el administrador hace clic en el botón "Enviar credenciales por correo".

Entonces el servidor despacha un correo electrónico seguro con la bienvenida institucional, el usuario asignado, la contraseña temporal y el enlace directo de inicio de sesión.

Escenario 3: Copiado rápido de credenciales al portapapeles
Dado que el administrador visualiza el panel de confirmación de creación de usuario.

Cuando pulsa los botones de acción "Copiar correo" o "Copiar clave".

Entonces el sistema copia la cadena correspondiente al portapapeles del sistema operativo y despliega un indicador visual confirmando el copiado.


Historia de Usuario 01

Como: Usuarios

Deseo: Ingresar con mi correo institucional y clave personal

Para: Disponer de mi entorno de trabajo y gestionar mis requerimientos de tecnología.

Criterios de Aceptación
Escenario 1: Ingreso exitoso con credenciales validas
Dado que ingreso al sistema como Usuarios con acceso habilitado

Cuando escribo mi correo institucional y mi clave correcta

Entonces el sistema me permite entrar y me muestra mi portal principal de trabajo

Escenario 2: Notificación ante credenciales no coincidentes
Dado que ingreso al sistema como Usuarios

Cuando escribo una clave que no coincide con los registros

Entonces el sistema me informa que los datos son incorrectos y me ofrece la opción de recuperar mi clave


Historia de Usuario 02

Como: Usuarios

Deseo: Solicitar un código temporal de comprobación a mi buzón institucional

Para: Definir una nueva clave y retomar mis labores sin esperar atención manual de soporte.

Criterios de Aceptación
Escenario 1: Restablecimiento satisfactorio de clave
Dado que ingreso al sistema como Usuarios en la pantalla de recuperación.

Cuando ingreso mi correo corporativo y transcribo el código de verificación recibido.

Entonces el sistema valida mi identidad y me permite definir una nueva clave de acceso.

Escenario 2: Código de verificación expirado
Dado que ingreso al sistema como Usuarios con un código fuera de tiempo

Cuando presiono el botón de confirmar

Entonces el sistema me avisa que el código caduco y me ofrece despachar un nuevo código


Historias de Usuario 03

Como: Usuarios

Deseo: Actualizar mis canales de contacto telefonico y mi clave personal

Para: Mantener mi ficha al dia y facilitar que los tecnicos me localicen oportunamente.

Criterios de Aceptacion:
Escenario 1: Actualizacion exitosa de datos de contacto
Dado que ingreso al sistema como Usuarios en la seccion de mi perfil.

Cuando actualizo mi anexo telefonico y presiono guardar cambios.

Entonces el sistema confirma la actualizacion y refleja el nuevo anexo en mis requerimientos.

Escenario 2: Proteccion de campos institucionales inmutables
Dado que ingreso al sistema como Usuarios en mi perfil.

Cuando visualizo mi correo institucional y numero de documento.

Entonces el sistema los presenta como campos protegidos que solo el Administrador puede modificar.

Historia de Usuario 04
Como: Administrador general del sistema.
Deseo: Crear, editar y administrar las cuentas de usuario institucionales con asignación múltiple de perfiles, dependencias y niveles de prioridad.
Para: Garantizar un control centralizado de identidades y asegurar que cada colaborador disponga del nivel de servicio y permisos adecuados en la plataforma.

Criterios de Aceptación:
Escenario 1: Registro exitoso de nuevo usuario con múltiples roles
Dado que el administrador ingresa al módulo de Gestión de Usuarios y selecciona "Nuevo Usuario".

Cuando completa los datos de identidad (DNI, nombres, apellidos, teléfono, correo personal), selecciona su departamento y asigna los perfiles de "Técnico" y "Solicitante".

Entonces el sistema valida la unicidad del documento y correo, registra la cuenta en la base de datos y presenta una ventana de resumen con las credenciales generadas.

Escenario 2: Asignación de nivel de prioridad VIP / Ejecutiva
Dado que el administrador edita los datos de un usuario perteneciente a la alta dirección o gerencia.

Cuando modifica el selector de prioridad de "Nivel 5: Estándar" a "Nivel 1: Prioridad VIP".

Entonces el sistema persiste la jerarquía del usuario, provocando que todos los tickets que este usuario reporte en el futuro se etiqueten como prioritarios para el cálculo de tiempos SLA.

Escenario 3: Bloqueo y desactivación de cuenta de usuario
Dado que un colaborador cesa sus labores o requiere suspensión preventiva de acceso.

Cuando el administrador pulsa la acción de desactivar usuario en la tabla y confirma la operación.

Entonces el sistema efectúa un borrado lógico (estado_registro = false), invalidando de inmediato cualquier sesión activa del colaborador e impidiendo futuros inicios de sesión.



Historia de Usuario 05

Como: Administrador de seguridad del sistema.
Deseo: Definir perfiles operativos y asignar permisos granulares sobre el árbol jerárquico del menú de navegación.
Para: Garantizar el principio de menor privilegio (PoLP) y cumplimiento de directivas de segregación de funciones (SoD).

Criterios de Aceptación:
Escenario 1: Creación y parametrización de un nuevo perfil
Dado que el administrador accede a la sección de "Perfiles y Permisos".

Cuando hace clic en "Crear Perfil", ingresa un nombre formal (por ejemplo, "Auditor de Mesa") y una descripción funcional del rol.

Entonces el sistema habilita el árbol interactivo de opciones de menú para configurar los accesos exclusivos que tendrá dicho perfil.

Escenario 2: Propagación jerárquica de selección en el árbol de permisos
Dado que el administrador está asignando permisos en un perfil dentro del árbol de 3 niveles.

Cuando marca una opción hoja (nivel 3, por ejemplo, "Tickets Pendientes").

Entonces el sistema marca automáticamente todos los módulos padre y carpetas contenedoras ascendentes (nivel 2 y nivel 1) para asegurar la navegabilidad de la ruta.

Escenario 3: Desmarcación en cascada de ramas subordinadas
Dado que una carpeta contenedora de menú tiene varias opciones hijas seleccionadas.

Cuando el administrador desmarca la casilla del módulo padre de nivel superior.

Entonces el sistema desmarca automáticamente todas las pantallas descendientes asociadas a dicha rama, impidiendo la asignación parcial o inconsistente de permisos.




Historia de Usuario 06
 
Como: Administrador del catálogo de servicios de TI.
Deseo: Administrar el catálogo de servicios orientados a Incidentes, definiendo sus categorías, criticidad y acuerdos de nivel de servicio (SLA).
Para: Proporcionar a la Mesa de Ayuda un marco formal para clasificar y restaurar de forma priorizada fallas e interrupciones del servicio.

Criterios de Aceptación:
Escenario 1: Filtrado y consulta exclusiva de servicios de tipo Incidente
Dado que el administrador ingresa al módulo de Servicios del Catálogo.

Cuando selecciona la vista o filtro de "Incidentes" (tipo = 1).

Entonces la tabla despliega exclusivamente los servicios diseñados para resolver caídas y averías (código con prefijo SRV-INC), omitiendo solicitudes de adquisición o aprovisionamiento.

Escenario 2: Asignación de grupo técnico resolutor inicial
Dado que el administrador edita un servicio de incidente (por ejemplo, "Falla en Enlace de Fibra Óptica").

Cuando selecciona en el selector de departamento resolutor el grupo "Redes y Telecomunicaciones".

Entonces el sistema almacena dicha relación, garantizando que los incidentes de este servicio se enruten directamente al equipo técnico especializado correspondiente.

Escenario 3: Actualización de tiempos de primera respuesta y resolución
Dado que la organización renegocia los acuerdos de soporte técnico para incidentes críticos.

Cuando el administrador ajusta el tiempo de primera respuesta a 30 minutos y resolución a 2 horas en la ficha del servicio.

Entonces el catálogo actualiza los parámetros en la base de datos y recalcula automáticamente los límites de vencimiento para los nuevos tickets que se aperturen bajo este servicio.


Historia de Usuario 07

Como: Administrador de servicios corporativos.
Deseo: Configurar los servicios orientados a Solicitudes de Servicio (peticiones de equipamiento, software, accesos y cambios menores).
Para: Estandarizar la oferta de requerimientos informáticos hacia los colaboradores y definir las reglas de entrega y validación correspondientes.

Criterios de Aceptación:
Escenario 1: Configuración de acuerdos de entrega (SLA/OLA) para solicitudes
Dado que el administrador selecciona un servicio del catálogo clasificado como "Solicitud de Servicio" (tipo = 2).

Cuando define el tiempo de entrega prometido (por ejemplo, 24 horas hábiles) y su horario de cobertura (8x5 o 24x7).

Entonces el sistema registra el acuerdo de servicio y lo publica en el catálogo oficial para conocimiento transparente de los usuarios solicitantes.

Escenario 2: Activación de compuertas de aprobación obligatorias
Dado que un servicio de solicitud implica asignación presupuestal o riesgo de seguridad (por ejemplo, "Asignación de Laptop de Alta Gama").

Cuando el administrador activa la casilla "Requiere Aprobación Jerárquica Obligatoria".

Entonces el sistema configura el servicio para que ningún técnico pueda despacharlo sin contar previamente con el visto bueno del jefe de área o supervisor correspondiente.

Escenario 3: Deshabilitación controlada de un servicio con justificación formal
Dado que un servicio de solicitud entra en obsolescencia o mantenimiento temporal.

Cuando el administrador pulsa "Deshabilitar Servicio", ingresa la justificación institucional requerida y confirma.

Entonces el servicio se oculta del portal de autoservicio de los solicitantes, quedando archivado en el catálogo administrativo con trazabilidad de auditoría.




[HU-08] Registro Oficial de Nuevos Servicios en el Catálogo

Como: Administrador del sistema ITIL v4.
Deseo: Utilizar un formulario oficial unificado para dar de alta nuevos servicios en el catálogo institucional.
Para: Garantizar que todo servicio nuevo cumpla con los estándares de nomenclatura, clasificación, costos y acuerdos de servicio definidos por la organización.

Criterios de Aceptación:
Escenario 1: Generación automática de código oficial ITIL
Dado que el administrador abre la vista de creación de servicio.

Cuando selecciona la naturaleza del servicio ("Incidente" o "Solicitud") y la categoría técnica ("Ciberseguridad", "Redes", "Sistemas", etc.).

Entonces el sistema genera en tiempo real el código estandarizado del servicio (por ejemplo, SRV-INC-SEC-005 o SRV-SOL-ACC-012) en formato de solo lectura.

Escenario 2: Validación estricta de parámetros mínimos requeridos
Dado que el administrador intenta guardar el nuevo servicio sin ingresar la descripción del entregable o con tiempos SLA en cero.

Cuando hace clic en el botón "Registrar Servicio" al pie del formulario.

Entonces el sistema interrumpe el registro, focaliza el campo con error y emite un mensaje indicando que todos los parámetros operativos son mandatorios.

Escenario 3: Redirección automática y publicación en el catálogo
Dado que todos los campos del formulario cumplen las validaciones de negocio.

Cuando el administrador confirma el registro del nuevo servicio.

Entonces el sistema guarda el servicio en la base de datos, muestra una alerta de confirmación exitosa y redirige al listado filtrado por la categoría correspondiente.


HU-09: Exploración del Catálogo de Servicios

Como: Solicitante de soporte institucional.
Deseo: Explorar el catálogo oficial de servicios categorizado por tipo de requerimiento e insumo técnico.
Para: Identificar rápidamente la solución tecnológica que requiero y conocer los acuerdos de nivel de servicio (SLA) comprometidos.

Criterios de Aceptación:
Escenario 1: Diferenciación entre Incidentes y Solicitudes de Servicio
Dado que el solicitante ingresa al módulo de Catálogo de Servicios.

Cuando alterna entre las pestañas "Incidentes" y "Solicitudes de Servicio".

Entonces el sistema filtra los ítems disponibles, mostrando para incidentes aquellos destinados a reportar fallas e interrupciones, y para solicitudes aquellos destinados a peticiones de equipamiento, software o accesos.

Escenario 2: Visualización transparente de tiempos SLA
Dado que el usuario navega por las tarjetas de servicio en el catálogo.

Cuando examina un servicio específico (por ejemplo, "Configuración de Red VPN").

Entonces el sistema exhibe el tiempo estimado de primera respuesta, el tiempo máximo de resolución oficial y la descripción funcional del entregable.

Escenario 3: Inicio guiado de ticket desde el catálogo
Dado que el solicitante localiza el servicio requerido en la cuadrícula de categorías.

Cuando hace clic en el botón de acción del servicio seleccionado.

Entonces el sistema lo redirige al formulario de creación preseleccionando automáticamente el tipo de ticket, la categoría y el servicio correspondiente.




HU-10: Creación y Clasificación de Tickets

Como: Solicitante del portal de autoservicio.
Deseo: Completar y enviar un formulario estructurado para reportar una incidencia o solicitar un servicio.
Para: Que el equipo de soporte reciba la información precisa y pueda iniciar la atención de acuerdo con los niveles de servicio establecidos.

Criterios de Aceptación:
Escenario 1: Deducción automática de prioridad según Impacto y Urgencia
Dado que el solicitante se encuentra en el formulario oficial de creación de tickets.

Cuando selecciona un nivel de Impacto (por ejemplo, "Alto") y un nivel de Urgencia (por ejemplo, "Alto").

Entonces el sistema calcula en tiempo real la prioridad resultante ("P1 - Crítica") y actualiza la insignia de plazo de resolución asociado según la matriz ITIL.

Escenario 2: Validación de completitud en campos requeridos
Dado que el solicitante intenta enviar el formulario sin completar el título o detallar la descripción del problema.

Cuando presiona el botón "Registrar Ticket".

Entonces el sistema bloquea el envío, resalta los campos faltantes en color de alerta y muestra mensajes de validación indicando la longitud mínima obligatoria.

Escenario 3: Captura de campos contextuales para Solicitudes de Servicio
Dado que el solicitante selecciona la modalidad "Solicitud de Servicio".

Cuando se despliega el formulario especializado.

Entonces el sistema habilita de forma obligatoria los campos de "Justificación del Requerimiento" y "Fecha Límite Deseada", validando que dicha fecha no sea anterior a la fecha actual.






HU-12: Seguimiento y Filtrado de Mis Tickets

Como: Solicitante recurrente de la organización.
Deseo: Consultar mi historial de tickets con métricas resumidas y herramientas de búsqueda avanzada.
Para: Conocer el estado de avance de mis solicitudes abiertas y consultar el historial de requerimientos concluidos.

Criterios de Aceptación:
Escenario 1: Segmentación rápida por estado mediante tarjetas métricas
Dado que el solicitante accede a la vista de "Mis Tickets".

Cuando pulsa sobre las tarjetas superiores ("En Proceso", "Finalizados" o "Total Registrados").

Entonces la tabla inferior filtra dinámicamente el listado, mostrando exclusivamente los tickets que coincidan con la fase del ciclo de vida seleccionada.

Escenario 2: Búsqueda reactiva por múltiples atributos
Dado que el solicitante cuenta con múltiples tickets registrados en su historial.

Cuando escribe un término en el campo de búsqueda (código de ticket, nombre de servicio o palabras clave del título).

Entonces la tabla filtra instantáneamente las filas coincidentes sin recargar la página completa.

Escenario 3: Filtrado combinado mediante panel desplegable
Dado que el usuario abre el panel de filtros mediante el botón "Filtrar".

Cuando selecciona simultáneamente filtros de tipo ("Solicitud de Servicio"), prioridad ("P2 - Alta") y estado ("En Atención").

Entonces la lista muestra únicamente los registros que cumplen todas las condiciones, mostrando un indicador numérico con la cantidad de filtros activos aplicados.




HU-13: Consulta Detallada y Progreso del Ticket

Como: Solicitante del servicio.
Deseo: Abrir el detalle completo de un ticket específico y observar su evolución en una interfaz simplificada.
Para: Comprender en qué etapa de atención se encuentra mi requerimiento sin interpretar tecnicismos de soporte.

Criterios de Aceptación:
Escenario 1: Línea de tiempo visual simplificada (Stepper de 4 etapas)
Dado que el solicitante ingresa a la vista detallada de uno de sus tickets.

Cuando visualiza el componente de seguimiento en la parte superior.

Entonces el sistema presenta un stepper con 4 fases de negocio claras: "Registrado", "Asignado", "En Proceso" y "Resuelto/Cerrado", marcando con color activo la etapa correspondiente al estado interno ITIL del ticket.

Escenario 2: Información de contacto del especialista y tiempo comprometido
Dado que el ticket ha sido asignado a un técnico de soporte.

Cuando el usuario revisa la tarjeta de información general.

Entonces el sistema muestra el nombre del especialista a cargo, la fecha de registro y la fecha límite de entrega según el SLA convenido.

Escenario 3: Descarga de evidencias y visualización del requerimiento
Dado que el ticket contiene archivos adjuntos originales.

Cuando el solicitante hace clic en el enlace "Descargar" de cualquiera de los adjuntos.

Entonces el navegador inicia la descarga del archivo con su nombre original e integridad intacta.



HU-14: Comunicación Bidireccional con Soporte Técnico

Como: Solicitante con un ticket en atención.
Deseo: Enviar y recibir mensajes públicos a través de un canal de conversación dentro del ticket.
Para: Coordinar detalles de la solución, aclarar dudas y responder consultas del técnico asignado.

Criterios de Aceptación:
Escenario 1: Envío de mensaje al equipo de soporte
Dado que el ticket se encuentra en estado de atención o espera.

Cuando el solicitante redacta un mensaje en el campo de chat público y presiona "Enviar".

Entonces el comentario se almacena en la bitácora del ticket con autoría del solicitante, fecha y hora exacta, quedando visible para el técnico responsable.

Escenario 2: Restricción de acceso a notas técnicas internas
Dado que el equipo técnico o supervisor registra notas de trabajo privadas (internas) para coordinación de TI.

Cuando el solicitante consulta el historial de mensajes de su ticket.

Entonces el sistema omite estrictamente la visualización de notas internas, garantizando que el usuario solo visualice mensajes marcados como públicos.

Escenario 3: Validación contra envíos en blanco
Dado que el solicitante presiona el botón de envío sin haber redactado texto en la caja de comentarios.

Cuando el sistema evalúa la acción.

Entonces el botón permanece inactivo o el sistema previene el envío, evitando la inserción de registros vacíos en la base de datos.

Historia de Usuario 15: Configuración del Formulario de Incidentes

Como: Administrador de la plataforma de TI.
Deseo: Parametrizar y personalizar los campos del formulario de registro de incidentes en el panel de configuración.
Para: Estandarizar la recolección de información técnica obligatoria según el tipo de incidente y evitar reportes incompletos.

Criterios de Aceptación:
Escenario 1: Activación y marcado de campos obligatorios en el formulario
Dado que el administrador accede a la ruta de configuración de formularios de incidentes.
Cuando selecciona los campos estándar (síntomas observados, urgencia, impacto y equipo afectado) y activa el interruptor de obligatoriedad.
Entonces el sistema guarda la plantilla y valida que en los próximos registros de incidentes dichos campos no puedan dejarse en blanco.

Escenario 2: Previsualización reactiva de la plantilla del formulario
Dado que el administrador modifica la visibilidad de los campos en el panel de administración.
Cuando observa el panel lateral de previsualización.
Entonces el sistema refleja instantáneamente los cambios en tiempo real mostrando exactamente cómo visualizará el formulario el usuario técnico.

Escenario 3: Validación contra eliminación de campos esenciales
Dado que el administrador intenta deshabilitar el campo de descripción detallada o título del incidente.
Cuando presiona la opción de desactivar.
Entonces el sistema bloquea la acción notificando que son campos críticos del núcleo ITSM requeridos para el ciclo de vida del ticket.


Historia de Usuario 16: Configuración del Formulario de Solicitudes

Como: Administrador de la plataforma de TI.
Deseo: Configurar la estructura de captura de solicitudes de servicio, incluyendo justificación de negocio y plazos requeridos.
Para: Garantizar que los pedidos institucionales cuenten con sustento suficiente para la evaluación del gestor de área.

Criterios de Aceptación:
Escenario 1: Configuración de campos de justificación y fecha límite
Dado que el administrador ingresa a la configuración de formularios de solicitudes de servicio.
Cuando activa la exigencia obligatoria de justificación de negocio y fecha requerida de entrega.
Entonces el sistema actualiza la plantilla de solicitud para todos los servicios del catálogo empresarial.

Escenario 2: Restricción de fecha mínima en el selector
Dado que un usuario intenta enviar una solicitud indicando una fecha deseada pasada o del mismo instante.
Cuando el formulario valida el valor ingresado.
Entonces el sistema bloquea el envío alertando que la fecha requerida debe cumplir con los plazos mínimos del acuerdo de nivel de servicio.

Escenario 3: Persistencia de parámetros adicionales por categoría
Dado que el administrador añade atributos específicos a una categoría de solicitudes.
Cuando presiona el botón "Guardar configuración".
Entonces el sistema confirma la actualización con un mensaje visual y asienta los cambios en la base de datos sin afectar los incidentes.


Historia de Usuario 17: Gestión de Acuerdos de Nivel de Servicio (SLA)

Como: Líder de Servicios y Product Owner.
Deseo: Definir umbrales de tiempo máximo de primera respuesta y tiempo de resolución asociados a la prioridad y categoría del servicio.
Para: Garantizar compromisos de calidad medibles con las áreas de negocio y monitorear el rendimiento operativo.

Criterios de Aceptación:
Escenario 1: Registro de matriz de tiempos por nivel de prioridad
Dado que se configuran los SLAs para incidentes en el módulo de servicios.
Cuando se asignan 1 hora para P1 Crítica, 4 horas para P2 Alta, 8 horas para P3 Media y 24 horas para P4 Baja.
Entonces el sistema almacena la matriz de compromisos y la asocia automáticamente a los tickets categorizados bajo esa prioridad.

Escenario 2: Cálculo automático de fecha y hora límite al crear el caso
Dado que un solicitante o técnico registra un nuevo ticket con prioridad P2.
Cuando el sistema procesa el guardado inicial.
Entonces calcula y estampa automáticamente el campo de fecha límite de resolución sumando las horas comprometidas según el calendario laboral.

Escenario 3: Alerta visual de aproximación a vencimiento
Dado que un ticket se encuentra abierto y el tiempo transcurrido supera el 80% del umbral de SLA establecido.
Cuando el supervisor o técnico visualiza la bandeja de casos.
Entonces el sistema despliega un indicador en color ámbar alertando sobre la proximidad del incumplimiento de SLA.


Historia de Usuario 18: Homologación Visual de Formularios y Acciones de Mesa

Como: Diseñadora de UI y Analista Funcional.
Deseo: Homologar los botones de acción, iconos, alertas y espaciados en las pantallas operativas de la mesa de servicio.
Para: Proporcionar una experiencia de usuario consistente, intuitiva y libre de sobrecargas cognitivas.

Criterios de Aceptación:
Escenario 1: Estandarización de botones de acción
Dado que el usuario navega entre las diferentes vistas de tickets, incidentes y solicitudes.
Cuando interactúa con botones de guardar, editar, cancelar o filtrar.
Entonces todos los controles presentan la misma paleta de colores, tipografía, tamaño compacto y estados interactivos de hover y focus.

Escenario 2: Presentación adaptativa y eliminación de contenedores desbordados
Dado que se visualizan formularios con múltiples bloques de configuración en pantallas de diferentes resoluciones.
Cuando se redimensiona la ventana del navegador.
Entonces el diseño en tres columnas se reorganiza fluidamente sin generar barras de desplazamiento horizontales innecesarias.

Escenario 3: Mensajería de alerta homogénea ante errores y confirmaciones
Dado que ocurre un error de validación o una operación exitosa en cualquier módulo.
Cuando el sistema emite la notificación.
Entonces despliega el componente estandarizado de alerta con el color correspondiente (rojo para error, verde para éxito, azul para información) sin alterar el layout.


Historia de Usuario 19: Registro de Problemas y Análisis Causa Raíz (RCA)

Como: Gestor de Problemas y Especialista de Diagnóstico.
Deseo: Registrar formalmente un Problema vinculado a incidentes recurrentes y documentar el análisis de causa raíz mediante la técnica de los 5 Porqués.
Para: Identificar el origen estructural de las fallas de infraestructura y prevenir su repetición en el entorno de producción.

Criterios de Aceptación:
Escenario 1: Alta formal de problema vinculado a incidentes
Dado que se detecta un patrón de incidentes recurrentes sobre el mismo servicio.
Cuando el gestor registra el problema indicando título, categoría, urgencia e impacto.
Entonces el sistema genera el código correlativo de problema y lo coloca en estado de investigación activa.

Escenario 2: Estructuración del análisis de los 5 Porqués
Dado que el especialista inicia la etapa de diagnóstico causa raíz.
Cuando completa los campos guiados correspondientes a la secuencia de los 5 Porqués detallando la cadena causal de la falla.
Entonces el sistema concatena el análisis en la bitácora técnica del problema y habilita la formulación de una solución temporal o definitiva.

Escenario 3: Vinculación referencial de tickets origen
Dado que existen dos o más incidentes reportados por los usuarios debido a la misma causa.
Cuando el gestor enlaza dichos incidentes en la pestaña de tickets asociados del problema.
Entonces el sistema actualiza la relación bidireccional permitiendo que los técnicos consulten el problema matriz desde la ficha del incidente.


Historia de Usuario 20: Publicación en la Base de Errores Conocidos (KEDB)

Como: Técnico de Soporte Nivel 2.
Deseo: Consultar y publicar soluciones temporales (workarounds) en la KEDB vinculadas a problemas bajo investigación.
Para: Restablecer el servicio de los usuarios con rapidez mientras el equipo de ingeniería implementa la corrección definitiva.

Criterios de Aceptación:
Escenario 1: Publicación de solución de contingencia aprobada
Dado que se ha determinado una solución alternativa eficaz para un problema en curso.
Cuando el gestor de problemas marca la opción "Publicar en KEDB" ingresando los pasos de remediación rápida.
Entonces el registro se hace visible de inmediato en la sección de Errores Conocidos para todos los técnicos resolutores.

Escenario 2: Búsqueda reactiva de workarounds desde la mesa de ayuda
Dado que un técnico atiende un nuevo incidente de red o base de datos.
Cuando escribe los síntomas en el buscador de la base de errores conocidos.
Entonces el sistema lista instantáneamente los artículos de la KEDB que coincidan con la descripción del fallo.

Escenario 3: Control de vigencia y actualización de la solución temporal
Dado que se implementa una solución de raíz que subsana de forma permanente el problema.
Cuando el gestor actualiza el estado del problema a resuelto.
Entonces la entrada en la KEDB se actualiza reflejando que la contingencia ya no es requerida e indicando la solución permanente.


Historia de Usuario 21: Asignación de Grupos Resolutores y Niveles de Soporte

Como: Administrador de Organización y Recursos.
Deseo: Estructurar los departamentos técnicos de TI y asignar especialistas definiendo sus niveles de soporte N1, N2 y N3.
Para: Garantizar que cada incidente o solicitud sea canalizado al escalón técnico con las competencias adecuadas.

Criterios de Aceptación:
Escenario 1: Creación de grupo resolutor con supervisor asignado
Dado que el administrador accede al módulo de organización técnica.
Cuando crea un nuevo departamento de TI (por ejemplo, Infraestructura, Redes, Sistemas) y le asigna un supervisor responsable.
Entonces el departamento queda habilitado en la plataforma como grupo resolutor destino de tickets.

Escenario 2: Alta de especialista y asignación de nivel de escalamiento
Dado que se incorpora un nuevo técnico al equipo de soporte.
Cuando el administrador o supervisor lo asocia a su departamento técnico seleccionando su nivel de escalamiento (Nivel 1, Nivel 2 o Nivel 3).
Entonces el usuario adquiere las capacidades operativas correspondientes a su nivel en la mesa de ayuda.

Escenario 3: Bloqueo de asignación a técnicos inactivos
Dado que un técnico se encuentra en estado inactivo o dado de baja institucional.
Cuando un operador intenta asignarle un ticket en el selector de técnicos.
Entonces el sistema filtra la lista excluyendo al usuario inactivo e impidiendo asignaciones erróneas.


Historia de Usuario 22: Planificación de Turnos Técnicos y Gestión de Ausencias

Como: Supervisor de Mesa de Ayuda.
Deseo: Programar los turnos operativos semanales de los técnicos y registrar sus ausencias justificadas asignando un técnico de reemplazo.
Para: Mantener la cobertura permanente de los servicios y asegurar que no queden tickets desatendidos durante vacaciones o permisos.

Criterios de Aceptación:
Escenario 1: Registro de turno operativo en el calendario
Dado que el supervisor accede a la pantalla de turnos y ausencias.
Cuando selecciona a un técnico, una fecha y asigna el turno correspondiente (Mañana, Tarde, Noche o Guardia 24x7).
Entonces el sistema graba la agenda y muestra visualmente la cuadrícula de cobertura horaria del grupo.

Escenario 2: Registro de ausencia programada con técnico sustituto obligatorio
Dado que un especialista técnico solicita un período de permiso o descanso.
Cuando el supervisor registra la ausencia con fecha de inicio, fin y selecciona obligatoriamente al técnico de reemplazo.
Entonces el sistema asienta la ausencia y bloquea la asignación de turnos a dicho técnico durante el rango de fechas establecido.

Escenario 3: Prevención de solapamiento de ausencias en el mismo grupo
Dado que el supervisor intenta programar una ausencia que dejaría sin cobertura mínima al departamento.
Cuando se evalúa la disponibilidad del equipo para la fecha seleccionada.
Entonces el sistema muestra una advertencia preventiva informando la cantidad de técnicos disponibles en dicho turno.


Historia de Usuario 23: Registro de Solicitud de Cambio (RFC) y Solapamiento Horario

Como: Gestor de Cambios y Coordinador Operativo.
Deseo: Registrar Solicitudes de Cambio (RFC) especificando ventana de ejecución y CI afectado, bloqueando cambios en ventanas concurrentes.
Para: Evitar colisiones operativas sobre servidores y bases de datos provocadas por intervenciones simultáneas de distintos equipos.

Criterios de Aceptación:
Escenario 1: Creación exitosa de RFC estándar o normal
Dado que el usuario responsable completa el formulario de solicitud de cambio con título, justificación, plan de rollback y fechas de inicio y fin.
Cuando presiona el botón "Registrar RFC".
Entonces el sistema genera el código correlativo de cambio (ejemplo: RFC-2026-0001) y sitúa la solicitud en estado de evaluación.

Escenario 2: Detección y bloqueo automático de solapamiento de cambios
Dado que existe una RFC programada sobre el servidor de base de datos principal para el día de mañana de 14:00 a 16:00.
Cuando otro equipo intenta registrar una nueva RFC sobre el mismo CI para el mismo día de 15:00 a 17:00.
Entonces el sistema rechaza la creación arrojando un mensaje de conflicto indicando el código y título del cambio solapado.

Escenario 3: Validación obligatoria de plan de reversa (Rollback)
Dado que la política institucional exige plan de contingencia para todo cambio de infraestructura.
Cuando el usuario omite redactar las acciones de rollback e intenta guardar la RFC.
Entonces el sistema detiene el proceso destacando el campo en rojo y exigiendo su llenado para continuar.


Historia de Usuario 24: Inventario de Activos y Semáforo SAM de Licencias

Como: Gestor de Activos de TI (ITAM).
Deseo: Administrar el inventario físico de activos y monitorear el cumplimiento de licencias de software mediante un semáforo visual de consumo.
Para: Controlar la custodia de equipos informáticos y evitar riesgos legales o sobrecostos por sublicenciamiento o licencias ociosas.

Criterios de Aceptación:
Escenario 1: Alta y catalogación de activo informático
Dado que el gestor de activos accede al catálogo de hardware.
Cuando ingresa número de serie, marca, modelo, ubicación física y colaborador responsable.
Entonces el activo queda registrado con estado operativo "En Uso" y vinculado al inventario general.

Escenario 2: Semáforo de utilización de licencias en tiempo real
Dado que el gestor consulta la tabla de licencias de software institucional.
Cuando el sistema evalúa la relación entre licencias adquiridas y licencias asignadas.
Entonces despliega una insignia visual: verde ("SUPERÁVIT") si el consumo es menor al 80%, ámbar ("LÍMITE") si está entre 80% y 99%, y rojo ("DÉFICIT") si alcanza o supera el 100%.

Escenario 3: Filtrado de activos por estado operativo
Dado que se requiere auditar los equipos que se encuentran en mantenimiento o pendientes de baja.
Cuando el usuario selecciona el filtro de estado contractual u operativo correspondiente.
Entonces la grilla actualiza instantáneamente los resultados mostrando únicamente los activos que coinciden con el criterio seleccionado.

---

## Parte II — Historias de Usuario en Columna "PRODUCT BACKLOG" (Pendientes)

> Estas historias representan el backlog priorizado para sprints futuros. Abarcan funcionalidades avanzadas de orquestación, CMDB gráfica, encuestas y automatizaciones que se desarrollarán en las siguientes iteraciones.

Historia de Usuario 25: Sala de Crisis Colaborativa en Tiempo Real para P1

Como: Coordinador de Incidentes Mayores.
Deseo: Disponer de una sala de crisis virtual con mensajería instantánea y bitácora en vivo al declararse un Incidente Crítico P1.
Para: Centralizar la toma de decisiones técnicas entre líderes de infraestructura y reducir el tiempo medio de recuperación del servicio.

Criterios de Aceptación:
Escenario 1: Apertura automática de sala al escalar a Incidente Mayor
Dado que un incidente es reclasificado formalmente como P1 Mayor.
Cuando el sistema confirma el cambio de criticidad.
Entonces habilita el acceso a la sala de crisis convocando a los supervisores de área y técnicos especialistas asignados.

Escenario 2: Bitácora cronológica inmutable de acciones en vivo
Dado que los integrantes del comité técnico documentan acciones durante la contingencia.
Cuando envían mensajes o reportes de estado en la sala.
Entonces los registros se estampan con marca de tiempo precisa sin posibilidad de alteración o borrado.

Escenario 3: Cierre formal de la sesión y generación de minuta de crisis
Dado que el incidente mayor ha sido restablecido y mitigado.
Cuando el coordinador finaliza la sesión de crisis.
Entonces el sistema compila automáticamente un resumen descargable con la cronología de eventos y diagnósticos vertidos.


Historia de Usuario 26: Escalamiento Automatizado por Umbrales de SLA

Como: Supervisor de Operaciones de Mesa de Ayuda.
Deseo: Que el sistema reasigne automáticamente o alerte a jefaturas cuando un ticket consuma el 90% de su tiempo de atención sin resolución.
Para: Intervenir proactivamente antes de incurrir en penalizaciones o incumplimientos contractuales con el usuario.

Criterios de Aceptación:
Escenario 1: Detección y notificación automática por cron de vencimiento
Dado que un ticket de prioridad alta se encuentra sin resolver y el reloj de SLA alcanza el 90% de su tiempo límite.
Cuando el servicio de monitoreo en segundo plano ejecuta la revisión periódica.
Entonces despacha una alerta de prioridad alta al correo del supervisor del departamento técnico responsable.

Escenario 2: Reasignación jerárquica a especialista Nivel 3
Dado que transcurre el tiempo de gracia posterior a la alerta preventiva sin interacción técnica en el ticket.
Cuando el motor de escalamiento evalúa la inactividad.
Entonces transfiere el caso automáticamente a la cola de atención del especialista N3 del grupo resolutor.

Escenario 3: Registro en la bitácora de auditoría del ticket
Dado que se produce una acción de escalamiento automático por SLA.
Cuando el supervisor o auditor revisa el historial del ticket.
Entonces visualiza el evento con autoría del sistema detallando la regla disparadora y la hora de ejecución.


Historia de Usuario 27: Diseñador Gráfico de Flujos de Estados para Solicitudes

Como: Administrador de Procesos de Negocio.
Deseo: Contar con una herramienta visual de modelado de estados para definir transiciones personalizadas en solicitudes complejas.
Para: Adaptar los flujos de aprobación a los procedimientos cambiantes de cada gerencia sin requerir modificaciones en el código fuente.

Criterios de Aceptación:
Escenario 1: Conexión visual de nodos de estado
Dado que el administrador accede al diseñador interactivo de workflows.
Cuando arrastra una transición entre el estado "Evaluación Técnica" y "Aprobación Financiera".
Entonces la herramienta valida que el flujo sea unidireccional y persistente en la configuración del servicio.

Escenario 2: Asignación de permisos por transición de estado
Dado que se modela una transición crítica de aprobación.
Cuando se especifica qué perfil tiene la atribución exclusiva de ejecutar el cambio de fase.
Entonces el motor de flujo restringe la visibilidad del botón de acción en la vista operativa a los usuarios autorizados.

Escenario 3: Validación contra ciclos infinitos o estados huérfanos
Dado que el diseñador detecta un nodo final sin salida o un bucle cerrado sin avance.
Cuando el administrador presiona "Publicar flujo".
Entonces el sistema advierte sobre la inconsistencia lógica e impide guardar hasta corregir la estructura.


Historia de Usuario 28: Encuestas de Satisfacción Automatizadas (CSAT)

Como: Responsable de Calidad y Experiencia del Cliente.
Deseo: Enviar automáticamente un cuestionario breve de satisfacción al correo del solicitante una vez resuelto y cerrado su requerimiento.
Para: Medir el índice CSAT de la mesa de ayuda y detectar áreas de oportunidad en la atención técnica.

Criterios de Aceptación:
Escenario 1: Disparo de encuesta al confirmar el cierre del caso
Dado que un ticket pasa a estado formalmente "Cerrado".
Cuando el sistema procesa el evento de cierre.
Entonces envía un correo al solicitante con un enlace de acceso seguro de un solo uso para calificar la atención.

Escenario 2: Calificación en escala de estrellas y captura de feedback
Dado que el usuario abre el formulario de encuesta en su navegador.
Cuando selecciona una puntuación de 1 a 5 estrellas y redacta un comentario opcional sobre el trato recibido.
Entonces el sistema graba la evaluación vinculada al ticket y al especialista que lo atendió.

Escenario 3: Consolidación de métricas de satisfacción en el módulo de reportes
Dado que se han recibido múltiples evaluaciones de usuarios durante el mes.
Cuando el supervisor consulta los indicadores de calidad.
Entonces el sistema grafica la distribución de satisfacción global y el promedio por grupo técnico.


Historia de Usuario 29: Diagrama Causa-Efecto (Ishikawa) para Problemas Mayores

Como: Gestor de Problemas y Analista de Calidad.
Deseo: Construir diagramas de espina de pescado (Ishikawa) interactivos en la ficha de problemas mayores categorizando causas.
Para: Sistematizar el análisis multidisciplinario en fallas complejas que involucran personas, procesos, tecnología y proveedores.

Criterios de Aceptación:
Escenario 1: Categorización guiada de causas en ramas estándar
Dado que el especialista inicia la sesión de análisis Ishikawa en un problema mayor.
Cuando añade causas secundarias en las ramas de Métodos, Máquinas, Mano de obra y Medio ambiente.
Entonces el sistema renderiza el diagrama gráfico en pantalla organizando visualmente las hipótesis de falla.

Escenario 2: Ponderación y selección de la causa raíz confirmada
Dado que el equipo técnico valida cuál de las causas identificadas originó el incidente mayor.
Cuando el gestor marca la causa principal en el diagrama interactivo.
Entonces el sistema traslada automáticamente dicha hipótesis al campo de Causa Raíz definitiva del problema.

Escenario 3: Exportación del diagrama para comités ejecutivos
Dado que se debe presentar el informe post-incidente a la gerencia general.
Cuando el analista pulsa la opción "Exportar diagrama".
Entonces el sistema descarga el gráfico en formato PDF o imagen de alta resolución junto con las conclusiones.


Historia de Usuario 30: Flujo Editorial Multinivel KCS v6 para Conocimiento

Como: Curador de Conocimiento Institucional.
Deseo: Implementar un flujo de revisión por pares y aprobación formal antes de publicar artículos técnicos en la base pública.
Para: Asegurar que las guías de solución cumplan con los estándares de redacción, veracidad técnica y seguridad de la información.

Criterios de Aceptación:
Escenario 1: Envío de borrador a revisión técnica
Dado que un técnico redacta un nuevo artículo de solución tras resolver un incidente complejo.
Cuando presiona el botón "Enviar a revisión editorial".
Entonces el artículo pasa a estado "En Revisión" y queda en la bandeja del curador de contenido.

Escenario 2: Retroalimentación y solicitud de correcciones al autor
Dado que el revisor identifica pasos técnicos incompletos o imprecisos en el borrador.
Cuando anota observaciones de mejora y presiona "Solicitar corrección".
Entonces el sistema devuelve el artículo al autor notificándole los ajustes requeridos para su publicación.

Escenario 3: Publicación final y disponibilidad en el centro de ayuda
Dado que el revisor verifica que el artículo cumple todas las políticas de calidad KCS.
Cuando hace clic en "Aprobar y publicar".
Entonces el artículo se indexa en el motor de búsqueda y queda disponible para consulta del personal y usuarios finales.


Historia de Usuario 31: Recertificación Periódica Automatizada de Cuentas

Como: Oficial de Seguridad y Cumplimiento (Auditor).
Deseo: Iniciar campañas trimestrales de recertificación de usuarios y privilegios exigiendo ratificación por parte de los jefes de área.
Para: Cumplir con la norma ISO/IEC 27001 retirando accesos obsoletos o privilegios excesivos de colaboradores transferidos o desvinculados.

Criterios de Aceptación:
Escenario 1: Convocatoria masiva a jefaturas departamentales
Dado que se apertura el período de recertificación institucional de accesos.
Cuando el oficial de seguridad lanza la campaña desde la consola de auditoría.
Entonces el sistema genera una lista de verificación para cada gestor de área con los colaboradores a su cargo.

Escenario 2: Confirmación o solicitud de baja de permisos por perfil
Dado que el jefe de departamento revisa la nómina de su personal.
Cuando marca la ratificación de funciones o solicita la desactivación de un perfil no utilizado.
Entonces el sistema registra la decisión con firma digital de auditoría y genera la tarea de revocación correspondiente.

Escenario 3: Bloqueo preventivo de cuentas no ratificadas al vencer el plazo
Dado que expira la fecha límite de la campaña de recertificación sin confirmación de la jefatura.
Cuando el servicio de control ejecuta la regla de cierre.
Entonces suspende temporalmente las cuentas no confirmadas alertando al administrador para su verificación manual.


Historia de Usuario 32: Matriz Forense de Segregación de Funciones (SoD)

Como: Auditor de Sistemas y Gobierno TI.
Deseo: Ejecutar un análisis automatizado que detecte usuarios con combinaciones de perfiles incompatibles según la matriz SoD.
Para: Prevenir fraudes internos, autoaprobaciones indebidas y violaciones a las políticas de control interno COBIT.

Criterios de Aceptación:
Escenario 1: Identificación de conflicto Solicitante - Aprobador
Dado que se evalúa la asignación de perfiles en la base de usuarios.
Cuando el motor de auditoría detecta un usuario que ostenta simultáneamente perfil de solicitante y aprobador de compras en la misma área.
Entonces el sistema emite una alerta de riesgo alto en el informe forense detallando la incompatibilidad detectada.

Escenario 2: Detección de privilegios cruzados de Administrador y Operador
Dado que las políticas de gobierno prohíben que quien audita o administra la plataforma gestione incidentes operativos ordinarios.
Cuando se realiza el escaneo de roles del personal.
Entonces el sistema reporta cualquier técnico que conserve permisos de administración global de base de datos.

Escenario 3: Exportación de evidencias para auditorías externas
Dado que se requiere presentar los controles de seguridad a auditores regulatorios.
Cuando el auditor pulsa "Descargar matriz SoD".
Entonces el sistema genera un reporte inmutable con la totalidad de roles, permisos efectivos y ausencias de conflicto comprobadas.


Historia de Usuario 33: Análisis Gráfico de Topología e Impacto en la CMDB

Como: Gestor de Configuración y Especialista de Arquitectura.
Deseo: Visualizar un mapa interactivo de relaciones y dependencias entre Elementos de Configuración (CIs) de infraestructura.
Para: Evaluar el impacto sistémico de caídas o mantenimientos programados sobre los servicios de negocio de la organización.

Criterios de Aceptación:
Escenario 1: Renderizado de grafo de dependencias aguas arriba y aguas abajo
Dado que el especialista selecciona un servidor de aplicaciones en la consola CMDB.
Cuando abre la vista de topología interactiva.
Entonces el sistema dibuja el árbol de relaciones mostrando la base de datos subyacente, el switch de red y los servicios de cara al cliente dependientes.

Escenario 2: Simulación de caída de nodo crítico
Dado que se planifica una intervención sobre un elemento de red central.
Cuando el gestor simula la indisponibilidad del nodo en el grafo interactivo.
Entonces el sistema resalta en color rojo todos los CIs y aplicaciones que quedarían fuera de servicio como consecuencia del corte.

Escenario 3: Detección de relaciones circulares o CIs huérfanos
Dado que se actualizan las relaciones lógicas de la infraestructura.
Cuando el módulo audita la integridad del grafo.
Entonces alerta sobre elementos de configuración sin relaciones ascendentes o bucles lógicos que distorsionen el análisis de impacto.


Historia de Usuario 34: Comité de Cambios (CAB) Virtual con Votación en Línea

Como: Miembro del Comité Asesor de Cambios (CAB).
Deseo: Evaluar las RFCs programadas para la semana y registrar mi voto de aprobación o rechazo con fundamentación técnica en un panel virtual.
Para: Agilizar la toma de decisiones colegiada sin depender de reuniones presenciales prolongadas.

Criterios de Aceptación:
Escenario 1: Visualización del expediente consolidado de cambio en la agenda CAB
Dado que el integrante del CAB ingresa a la sesión de evaluación semanal.
Cuando consulta una RFC en agenda.
Entonces el sistema despliega el expediente completo: justificación, análisis de riesgos, plan de pruebas, rollback y CIs involucrados.

Escenario 2: Emisión y registro de dictamen individual fundamentado
Dado que el aprobador analiza la viabilidad del cambio propuesto.
Cuando selecciona su voto (Aprobado, Rechazado o Con Observaciones) e ingresa un comentario explicativo.
Entonces el sistema registra el dictamen formal en la bitácora del cambio contabilizando el quorum requerido.

Escenario 3: Transición automática de estado al alcanzar la mayoría calificada
Dado que todos los miembros requeridos del comité han emitido su dictamen favorable.
Cuando el sistema computa el último voto requerido.
Entonces la RFC transiciona automáticamente a estado "Aprobado para Implementación" notificando al gestor de cambios y al solicitante.

---

## Parte III — Matriz de Asignación por Integrante del Equipo Scrum

| ID Historia | Título de la Historia de Usuario | Módulo ITSM | Estado en Trello | Integrante Responsable | Rol en el Equipo |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **HU-00** | Provisión de Credenciales SMTP Seguras | Identidades | HECHO (Sprint 1) | Junior | Developer (IAM / Organización) |
| **HU-01** | Inicio de Sesión y Control de Acceso | Seguridad | HECHO (Sprint 1) | Miguel | Scrum Master / Tech Lead |
| **HU-02** | Recuperación Autónoma de Clave | Seguridad | HECHO (Sprint 1) | Miguel | Scrum Master / Tech Lead |
| **HU-03** | Actualización de Perfil y Contacto | Seguridad | HECHO (Sprint 1) | Miguel | Scrum Master / Tech Lead |
| **HU-04** | Gestión Integral de Usuarios y Roles | Identidades | HECHO (Sprint 1) | Junior | Developer (IAM / Organización) |
| **HU-05** | Matriz de Perfiles y Capacidades RBAC | Identidades | HECHO (Sprint 1) | Junior | Developer (IAM / Organización) |
| **HU-06** | Creación y Estructura de Categorías | Servicios | HECHO (Sprint 1) | Lourdes | Product Owner / Líder UI |
| **HU-07** | Configuración de Servicios y Prioridades | Servicios | HECHO (Sprint 1) | Lourdes | Product Owner / Líder UI |
| **HU-08** | Edición y Mantenimiento del Catálogo | Servicios | HECHO (Sprint 1) | Lourdes | Product Owner / Líder UI |
| **HU-09** | Activación y Desactivación de Servicios | Servicios | HECHO (Sprint 1) | Lourdes | Product Owner / Líder UI |
| **HU-10** | Exploración y Búsqueda en Catálogo | Solicitudes | HECHO (Sprint 1) | Lourdes | Product Owner / Líder UI |
| **HU-11** | Registro Asistido de Requerimiento | Solicitudes | HECHO (Sprint 1) | Lourdes | Product Owner / Líder UI |
| **HU-12** | Seguimiento y Filtros de Mis Tickets | Solicitudes | HECHO (Sprint 1) | Miguel | Scrum Master / Tech Lead |
| **HU-13** | Consulta Detallada y Stepper del Ticket | Solicitudes | HECHO (Sprint 1) | Miguel | Scrum Master / Tech Lead |
| **HU-14** | Comunicación Bidireccional y Notas Privadas | Tickets Core | HECHO (Sprint 1) | Miguel | Scrum Master / Tech Lead |
| **HU-15** | Configuración del Formulario de Incidentes | Incidentes / Admin | HECHO (Sprint 2) | Miguel | Scrum Master / Tech Lead |
| **HU-16** | Configuración del Formulario de Solicitudes | Solicitudes / Admin | HECHO (Sprint 2) | Miguel | Scrum Master / Tech Lead |
| **HU-17** | Gestión de Acuerdos de Nivel de Servicio (SLA) | Servicios / SLA | HECHO (Sprint 2) | Lourdes | Product Owner / Líder UI |
| **HU-18** | Homologación Visual de Formularios y Acciones | Shared UI / Core | HECHO (Sprint 2) | Lourdes | Product Owner / Líder UI |
| **HU-19** | Registro de Problemas y Análisis Causa Raíz (RCA) | Problemas | HECHO (Sprint 2) | Alexis | Developer (Problemas / KCS) |
| **HU-20** | Publicación en la Base de Errores Conocidos (KEDB) | Problemas / KEDB | HECHO (Sprint 2) | Alexis | Developer (Problemas / KCS) |
| **HU-21** | Asignación de Grupos Resolutores y Niveles | Organización | HECHO (Sprint 2) | Junior | Developer (IAM / Organización) |
| **HU-22** | Planificación de Turnos y Gestión de Ausencias | Organización / Turnos | HECHO (Sprint 2) | Junior | Developer (IAM / Organización) |
| **HU-23** | Registro de RFC y Solapamiento Horario | Cambios / RFC | HECHO (Sprint 2) | Nain | Developer (Cambios / Activos) |
| **HU-24** | Inventario de Activos y Semáforo SAM de Licencias | Activos / SAM | HECHO (Sprint 2) | Nain | Developer (Cambios / Activos) |
| **HU-25** | Sala de Crisis Colaborativa en Vivo para P1 | Incidentes Mayores | PRODUCT BACKLOG | Miguel | Scrum Master / Tech Lead |
| **HU-26** | Escalamiento Automatizado por Umbrales de SLA | Operación / SLA | PRODUCT BACKLOG | Miguel | Scrum Master / Tech Lead |
| **HU-27** | Diseñador Gráfico de Flujos de Estados | Solicitudes | PRODUCT BACKLOG | Lourdes | Product Owner / Líder UI |
| **HU-28** | Encuestas de Satisfacción Automatizadas (CSAT) | Servicios / Calidad | PRODUCT BACKLOG | Lourdes | Product Owner / Líder UI |
| **HU-29** | Diagrama Causa-Efecto (Ishikawa) para Problemas | Problemas | PRODUCT BACKLOG | Alexis | Developer (Problemas / KCS) |
| **HU-30** | Flujo Editorial Multinivel KCS v6 para Conocimiento | Conocimiento (KCS) | PRODUCT BACKLOG | Alexis | Developer (Problemas / KCS) |
| **HU-31** | Recertificación Periódica Automatizada de Cuentas | Plataforma / Seguridad | PRODUCT BACKLOG | Junior | Developer (IAM / Organización) |
| **HU-32** | Matriz Forense de Segregación de Funciones (SoD) | Auditoría / SoD | PRODUCT BACKLOG | Junior | Developer (IAM / Organización) |
| **HU-33** | Análisis Gráfico de Topología e Impacto CMDB | CMDB | PRODUCT BACKLOG | Nain | Developer (Cambios / Activos) |
| **HU-34** | Comité de Cambios (CAB) Virtual con Votación | Cambios / CAB | PRODUCT BACKLOG | Nain | Developer (Cambios / Activos) |
