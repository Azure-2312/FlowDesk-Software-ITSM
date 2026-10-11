# Historias de Usuario - Perfil Administrador

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
- **Dado que** el administrador está asignando permisos en un perfil dentro del árbol de 3 niveles.
- **Cuando** marca una opción hoja (nivel 3, por ejemplo, "Tickets Pendientes").
- **Entonces** el sistema marca automáticamente todos los módulos padre y carpetas contenedoras ascendentes (nivel 2 y nivel 1) para asegurar la navegabilidad de la ruta.

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
