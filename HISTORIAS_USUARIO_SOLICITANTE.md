# Historias de Usuario - Perfil Solicitante

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
