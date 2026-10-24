# Historias de Usuario — FlowDesk ITSM

> **Versión:** 4.1 · **Fecha:** 2026-10-24 · **Estado:** Vigente y Alineado con Tablero Trello.
> **Estructura Documental:**
> 1. **Parte I — Historias de Usuario en Columna "HECHO" (Sprint 1 y Sprint 2):** Avance tangible y comprobable en el software.
> 2. **Parte II — Historias de Usuario en Columna "PRODUCT BACKLOG" (Pendientes):** Funcionalidades planificadas para siguientes iteraciones.
> 3. **Parte III — Matriz de Asignación por Integrante:** Mapeo de historias por responsable y módulo de dominio.

---

## Índice Rápido de Historias de Usuario

| Identificador | Título de la Historia de Usuario | Módulo Asignado | Integrante Asignado | Estado en Trello |
| :---: | :--- | :--- | :---: | :---: |
| [HU-00](#hu-00-provisi-n-de-credenciales-smtp-seguras) | Provisión de Credenciales SMTP Seguras | `identidades` | Junior | HECHO (Sprint 1) |
| [HU-01](#hu-01-inicio-de-sesi-n-y-control-de-acceso-institucional) | Inicio de Sesión y Control de Acceso Institucional | `seguridad` | Miguel | HECHO (Sprint 1) |
| [HU-02](#hu-02-recuperaci-n-aut-noma-de-contrase-a-por-c-digo-temporal) | Recuperación Autónoma de Contraseña por Código Temporal | `seguridad` | Miguel | HECHO (Sprint 1) |
| [HU-03](#hu-03-actualizaci-n-de-perfil-y-canales-de-contacto) | Actualización de Perfil y Canales de Contacto | `seguridad` | Miguel | HECHO (Sprint 1) |
| [HU-04](#hu-04-administraci-n-centralizada-de-cuentas-de-usuario) | Administración Centralizada de Cuentas de Usuario | `identidades` | Junior | HECHO (Sprint 1) |
| [HU-05](#hu-05-asignaci-n-de-perfiles-rbac-y-pol-ticas-de-acceso) | Asignación de Perfiles RBAC y Políticas de Acceso | `identidades` | Junior | HECHO (Sprint 1) |
| [HU-06](#hu-06-creaci-n-y-jerarquizaci-n-de-categor-as-del-cat-logo) | Creación y Jerarquización de Categorías del Catálogo | `servicios` | Lourdes | HECHO (Sprint 1) |
| [HU-07](#hu-07-configuraci-n-de-ficha-de-servicio-y-par-metros-base) | Configuración de Ficha de Servicio y Parámetros Base | `servicios` | Lourdes | HECHO (Sprint 1) |
| [HU-08](#hu-08-edici-n-integral-y-actualizaci-n-del-cat-logo-de-servicios) | Edición Integral y Actualización del Catálogo de Servicios | `servicios` | Lourdes | HECHO (Sprint 1) |
| [HU-09](#hu-09-activaci-n-y-retiro-controlado-de-tems-del-cat-logo) | Activación y Retiro Controlado de Ítems del Catálogo | `servicios` | Lourdes | HECHO (Sprint 1) |
| [HU-10](#hu-10-b-squeda-predictiva-y-exploraci-n-de-servicios-para-solicitantes) | Búsqueda Predictiva y Exploración de Servicios para Solicitantes | `servicios` | Lourdes | HECHO (Sprint 1) |
| [HU-11](#hu-11-captura-asistida-de-requerimientos-desde-el-cat-logo) | Captura Asistida de Requerimientos desde el Catálogo | `servicios` | Lourdes | HECHO (Sprint 1) |
| [HU-12](#hu-12-bandeja-de-seguimiento-mis-tickets-con-filtros-de-estado) | Bandeja de Seguimiento 'Mis Tickets' con Filtros de Estado | `tickets` | Miguel | HECHO (Sprint 1) |
| [HU-13](#hu-13-visualizador-detallado-de-ticket-con-l-nea-de-tiempo-stepper-) | Visualizador Detallado de Ticket con Línea de Tiempo (Stepper) | `tickets` | Miguel | HECHO (Sprint 1) |
| [HU-14](#hu-14-bit-cora-de-comentarios-p-blicos-y-notas-t-cnicas-privadas) | Bitácora de Comentarios Públicos y Notas Técnicas Privadas | `tickets` | Miguel | HECHO (Sprint 1) |
| [HU-15](#hu-15-configuraci-n-din-mica-de-formularios-de-incidentes) | Configuración Dinámica de Formularios de Incidentes | `incidentes` | Miguel | HECHO (Sprint 2) |
| [HU-16](#hu-16-configuraci-n-de-formularios-de-solicitudes-y-justificaci-n-de-negocio) | Configuración de Formularios de Solicitudes y Justificación de Negocio | `solicitudes` | Miguel | HECHO (Sprint 2) |
| [HU-17](#hu-17-parametrizaci-n-de-acuerdos-de-nivel-de-servicio-sla-y-horarios-h-biles) | Parametrización de Acuerdos de Nivel de Servicio (SLA) y Horarios Hábiles | `servicios` | Lourdes | HECHO (Sprint 2) |
| [HU-18](#hu-18-dise-ador-din-mico-de-campos-para-formularios-de-servicios-del-cat-logo) | Diseñador Dinámico de Campos para Formularios de Servicios del Catálogo | `servicios` | Lourdes | HECHO (Sprint 2) |
| [HU-19](#hu-19-registro-estructurado-de-problemas-y-an-lisis-causa-ra-z-rca-) | Registro Estructurado de Problemas y Análisis Causa Raíz (RCA) | `problemas` | Alexis | HECHO (Sprint 2) |
| [HU-20](#hu-20-base-de-datos-de-errores-conocidos-kedb-y-publicaci-n-de-workarounds) | Base de Datos de Errores Conocidos (KEDB) y Publicación de Workarounds | `problemas` | Alexis | HECHO (Sprint 2) |
| [HU-21](#hu-21-configuraci-n-de-departamentos-ti-y-grupos-resolutores-n1-n2-n3) | Configuración de Departamentos TI y Grupos Resolutores N1/N2/N3 | `organizacion` | Junior | HECHO (Sprint 2) |
| [HU-22](#hu-22-planificaci-n-de-turnos-t-cnicos-y-control-de-ausencias-en-mesa) | Planificación de Turnos Técnicos y Control de Ausencias en Mesa | `organizacion` | Junior | HECHO (Sprint 2) |
| [HU-23](#hu-23-registro-de-solicitud-de-cambio-rfc-y-validaci-n-de-ventanas-de-mantenimiento) | Registro de Solicitud de Cambio (RFC) y Validación de Ventanas de Mantenimiento | `cambios` | Nain | HECHO (Sprint 2) |
| [HU-24](#hu-24-inventario-maestro-de-activos-ti-y-control-semaf-rico-de-licencias-sam-) | Inventario Maestro de Activos TI y Control Semafórico de Licencias (SAM) | `activos` | Nain | HECHO (Sprint 2) |
| [HU-25](#hu-25-sala-de-crisis-colaborativa-y-gesti-n-de-incidentes-mayores-p1) | Sala de Crisis Colaborativa y Gestión de Incidentes Mayores P1 | `incidentes` | Miguel | PRODUCT BACKLOG |
| [HU-26](#hu-26-motor-de-escalamiento-autom-tico-y-notificaciones-operativas) | Motor de Escalamiento Automático y Notificaciones Operativas | `operacion` | Miguel | PRODUCT BACKLOG |
| [HU-27](#hu-27-cat-logo-de-servicios-t-cnicos-y-vinculaci-n-con-acuerdos-operativos-ola) | Catálogo de Servicios Técnicos y Vinculación con Acuerdos Operativos OLA | `servicios` | Lourdes | PRODUCT BACKLOG |
| [HU-28](#hu-28-parametrizaci-n-de-contratos-de-soporte-externo-uc-y-excepciones-de-calendario) | Parametrización de Contratos de Soporte Externo (UC) y Excepciones de Calendario | `servicios` | Lourdes | PRODUCT BACKLOG |
| [HU-29](#hu-29-diagrama-causa-efecto-ishikawa-y-rbol-de-fallas-para-problemas-complejos) | Diagrama Causa-Efecto (Ishikawa) y Árbol de Fallas para Problemas Complejos | `problemas` | Alexis | PRODUCT BACKLOG |
| [HU-30](#hu-30-flujo-editorial-kcs-con-aprobaci-n-y-votaci-n-de-art-culos-de-conocimiento) | Flujo Editorial KCS con Aprobación y Votación de Artículos de Conocimiento | `conocimiento` | Alexis | PRODUCT BACKLOG |
| [HU-31](#hu-31-matriz-de-desbloqueo-seguro-y-pol-ticas-de-caducidad-de-contrase-as-iam) | Matriz de Desbloqueo Seguro y Políticas de Caducidad de Contraseñas IAM | `identidades` | Junior | PRODUCT BACKLOG |
| [HU-32](#hu-32-cat-logo-de-proveedores-y-evaluaci-n-de-cumplimiento-de-contratos-de-terceros) | Catálogo de Proveedores y Evaluación de Cumplimiento de Contratos de Terceros | `proveedores` | Junior | PRODUCT BACKLOG |
| [HU-33](#hu-33-topolog-a-interactiva-de-cis-y-matriz-de-an-lisis-de-impacto-en-cmdb) | Topología Interactiva de CIs y Matriz de Análisis de Impacto en CMDB | `cmdb` | Nain | PRODUCT BACKLOG |
| [HU-34](#hu-34-sesi-n-virtual-del-comit-de-cambios-cab-con-votaci-n-formal-de-rfcs) | Sesión Virtual del Comité de Cambios (CAB) con Votación Formal de RFCs | `cambios` | Nain | PRODUCT BACKLOG |

---

## Parte I — Historias de Usuario en Columna "HECHO"

> Estas historias representan las capacidades funcionales desarrolladas, probadas y aceptadas en los dos primeros sprints de trabajo.

### Sección A: Historias de Usuario — Sprint 1 (Cimientos y Autoservicio)

---

### HU-00: Provisión de Credenciales SMTP Seguras

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-00` |
| **Módulo Asignado** | `identidades` ([src/modules/identidades](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/identidades)) |
| **Integrante Responsable** | Junior |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Administrador de la plataforma de TI.
- **Deseo:** Generar correos corporativos estandarizados, contraseñas seguras y despacharlos al correo personal del usuario mediante servicio SMTP.
- **Para:** Agilizar el aprovisionamiento de cuentas de nuevos colaboradores manteniendo altos estándares de seguridad informática.

#### Criterios de Aceptación

##### Escenario 1: Generación automática de correo institucional y contraseña estándar
- **Dado que** el administrador ingresa los nombres y apellidos de un nuevo colaborador en el formulario de alta.
- **Cuando** el sistema procesa los campos de texto en tiempo real.
- **Entonces** genera automáticamente la sugerencia de correo corporativo institucional (inicial_nombre + apellido_paterno @organizacion.com) y una clave aleatoria compleja de 8 o más caracteres con mayúsculas, minúsculas y números.

##### Escenario 2: Envío de credenciales vía correo electrónico SMTP
- **Dado que** se ha completado el registro de un nuevo usuario con correo personal verificado.
- **Cuando** el administrador hace clic en el botón 'Enviar credenciales por correo'.
- **Entonces** el servidor despacha un correo electrónico seguro con la bienvenida institucional, el usuario asignado, la contraseña temporal y el enlace directo de inicio de sesión.

##### Escenario 3: Copiado rápido de credenciales al portapapeles
- **Dado que** el administrador visualiza el panel de confirmación de creación de usuario.
- **Cuando** pulsa los botones de acción 'Copiar correo' o 'Copiar clave'.
- **Entonces** el sistema copia la cadena correspondiente al portapapeles del sistema operativo y despliega un indicador visual confirmando el copiado.

---

### HU-01: Inicio de Sesión y Control de Acceso Institucional

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-01` |
| **Módulo Asignado** | `seguridad` ([src/modules/seguridad](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/seguridad)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Usuario de la plataforma.
- **Deseo:** Ingresar con mi correo institucional y clave personal autenticada.
- **Para:** Disponer de mi entorno de trabajo y gestionar mis requerimientos de tecnología con sesión protegida.

#### Criterios de Aceptación

##### Escenario 1: Ingreso exitoso con credenciales válidas
- **Dado que** ingreso al sistema como usuario con acceso activo.
- **Cuando** escribo mi correo institucional y mi clave correcta.
- **Entonces** el sistema me permite entrar, inicializa mi sesión protegida y me muestra mi portal principal de trabajo según mi perfil asignado.

##### Escenario 2: Notificación ante credenciales no coincidentes
- **Dado que** ingreso a la pantalla de login institucional.
- **Cuando** escribo una clave que no coincide con los registros.
- **Entonces** el sistema me informa que los datos son incorrectos y me ofrece la opción de recuperar mi clave sin revelar la existencia del correo.

---

### HU-02: Recuperación Autónoma de Contraseña por Código Temporal

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-02` |
| **Módulo Asignado** | `seguridad` ([src/modules/seguridad](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/seguridad)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Usuario de la plataforma.
- **Deseo:** Solicitar un código temporal de comprobación a mi buzón institucional.
- **Para:** Definir una nueva clave y retomar mis labores sin esperar atención manual de soporte.

#### Criterios de Aceptación

##### Escenario 1: Restablecimiento satisfactorio de clave
- **Dado que** ingreso al sistema en la pantalla de recuperación de contraseña.
- **Cuando** ingreso mi correo corporativo y transcribo el código de verificación recibido.
- **Entonces** el sistema valida mi identidad y me permite definir una nueva clave de acceso segura.

##### Escenario 2: Código de verificación expirado o inválido
- **Dado que** ingreso un código que ha superado el tiempo límite de vigencia de 15 minutos.
- **Cuando** presiono el botón de confirmar.
- **Entonces** el sistema me avisa que el código caducó y me ofrece despachar un nuevo código de seguridad.

---

### HU-03: Actualización de Perfil y Canales de Contacto

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-03` |
| **Módulo Asignado** | `seguridad` ([src/modules/seguridad](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/seguridad)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Baja (S) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Usuario de la plataforma.
- **Deseo:** Actualizar mis canales de contacto telefónico y mi clave personal.
- **Para:** Mantener mi ficha al día y facilitar que los técnicos me localicen oportunamente.

#### Criterios de Aceptación

##### Escenario 1: Actualización correcta de número de contacto
- **Dado que** ingreso al apartado 'Mi Perfil' con sesión activa.
- **Cuando** digito mi nuevo número telefónico y confirmo el guardado.
- **Entonces** el sistema actualiza mis datos inmediatamente y emite un mensaje de éxito.

##### Escenario 2: Renovación voluntaria de clave de acceso
- **Dado que** me encuentro en el formulario de cambio de clave.
- **Cuando** ingreso mi contraseña actual, digito la nueva clave cumpliendo las políticas de seguridad y la confirmo.
- **Entonces** el sistema actualiza mi contraseña y me notifica que el cambio fue exitoso.

---

### HU-04: Administración Centralizada de Cuentas de Usuario

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-04` |
| **Módulo Asignado** | `identidades` ([src/modules/identidades](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/identidades)) |
| **Integrante Responsable** | Junior |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Administrador de la plataforma de TI.
- **Deseo:** Visualizar, registrar, modificar y suspender cuentas de colaboradores desde un panel unificado.
- **Para:** Garantizar que solo el personal autorizado tenga acceso a las herramientas empresariales.

#### Criterios de Aceptación

##### Escenario 1: Consulta paginada del listado de colaboradores
- **Dado que** ingreso al módulo de gestión de usuarios.
- **Cuando** el panel carga los registros de la organización.
- **Entonces** visualizo la tabla paginada con nombres, correo, departamento, perfil asignado y estado operativo.

##### Escenario 2: Búsqueda y filtrado facetado de personal
- **Dado que** tengo un volumen amplio de cuentas registradas.
- **Cuando** escribo un término de búsqueda o selecciono un filtro por departamento.
- **Entonces** la grilla actualiza instantáneamente los resultados mostrando solo las coincidencias exactas.

##### Escenario 3: Baja lógica y suspensión preventiva de acceso
- **Dado que** un colaborador cesa en sus funciones o presenta anomalías de seguridad.
- **Cuando** el administrador cambia su estado a 'Inactivo' o 'Bloqueado'.
- **Entonces** el sistema revoca inmediatamente sus credenciales e impide el inicio de nuevas sesiones.

---

### HU-05: Asignación de Perfiles RBAC y Políticas de Acceso

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-05` |
| **Módulo Asignado** | `identidades` ([src/modules/identidades](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/identidades)) |
| **Integrante Responsable** | Junior |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Administrador de la plataforma de TI.
- **Deseo:** Asignar y actualizar los roles funcionales de cada colaborador en la organización.
- **Para:** Asegurar que cada usuario disponga únicamente de los permisos correspondientes a su cargo (SoD).

#### Criterios de Aceptación

##### Escenario 1: Asignación de rol funcional a colaborador
- **Dado que** el administrador edita la ficha de un usuario.
- **Cuando** selecciona uno de los perfiles disponibles (Solicitante, Técnico, Supervisor, etc.) y guarda.
- **Entonces** el sistema asocia el nuevo rol y recalcula sus permisos de navegación en el menú lateral.

##### Escenario 2: Segregación de funciones (SoD) en roles incompatibles
- **Dado que** se configuran las directivas de seguridad corporativa.
- **Cuando** el administrador intenta otorgar permisos concurrentes de solicitante y aprobador de solicitudes propias.
- **Entonces** el sistema previene la acumulación de privilegios en cumplimiento de la política SoD.

---

### HU-06: Creación y Jerarquización de Categorías del Catálogo

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-06` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Servicios de TI.
- **Deseo:** Diseñar y registrar categorías temáticas para organizar los servicios tecnológicos.
- **Para:** Facilitar la navegación intuitiva de los usuarios que requieren asistencia.

#### Criterios de Aceptación

##### Escenario 1: Alta exitosa de nueva categoría taxonómica
- **Dado que** el gestor accede a la administración de categorías del catálogo.
- **Cuando** ingresa nombre, código, icono representativo y descripción de la nueva categoría.
- **Entonces** el sistema registra la categoría y la despliega en el árbol taxonómico de servicios.

##### Escenario 2: Validación de unicidad en nombres de categoría
- **Dado que** ya existe una categoría denominada 'Hardware y Equipamiento'.
- **Cuando** se intenta registrar otra categoría con el mismo nombre en el mismo nivel.
- **Entonces** el sistema bloquea el guardado advirtiendo que el nombre ya se encuentra en uso.

---

### HU-07: Configuración de Ficha de Servicio y Parámetros Base

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-07` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Servicios de TI.
- **Deseo:** Configurar nuevos servicios definiendo su nombre, descripción, categoría y criticidad.
- **Para:** Poner a disposición de la organización un portafolio de atención claro y estandarizado.

#### Criterios de Aceptación

##### Escenario 1: Creación de servicio en estado Borrador
- **Dado que** el gestor completa los datos base del nuevo servicio.
- **Cuando** guarda la ficha técnica inicial.
- **Entonces** el servicio se crea en estado 'Borrador', quedando listo para su parametrización sin ser visible aún a usuarios finales.

##### Escenario 2: Asociación de categoría obligatoria
- **Dado que** se está registrando una nueva prestación tecnológica.
- **Cuando** el gestor intenta guardar sin vincular una categoría padre.
- **Entonces** el formulario impide el envío resaltando la selección de categoría como obligatoria.

---

### HU-08: Edición Integral y Actualización del Catálogo de Servicios

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-08` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Gestor de Servicios de TI.
- **Deseo:** Modificar los datos y alcances de servicios previamente registrados.
- **Para:** Mantener la oferta tecnológica alineada con las necesidades operativas actuales.

#### Criterios de Aceptación

##### Escenario 1: Actualización de descripción y requisitos de entrega
- **Dado que** un servicio activo requiere cambios en sus términos o entregables.
- **Cuando** el gestor modifica el texto descriptivo y guarda los cambios.
- **Entonces** el catálogo actualiza inmediatamente la ficha pública del servicio para futuras solicitudes.

##### Escenario 2: Trazabilidad de modificaciones en catálogo
- **Dado que** se actualizan parámetros de un servicio crítico.
- **Cuando** se confirman los cambios en base de datos.
- **Entonces** el sistema registra la fecha, hora y usuario que ejecutó la edición en la bitácora de auditoría.

---

### HU-09: Activación y Retiro Controlado de Ítems del Catálogo

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-09` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Baja (S) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Gestor de Servicios de TI.
- **Deseo:** Activar o retirar temporalmente servicios del catálogo visible.
- **Para:** Controlar la disponibilidad de requerimientos según la capacidad operativa de la mesa.

#### Criterios de Aceptación

##### Escenario 1: Paso de servicio a estado Activo para publicación
- **Dado que** un servicio en borrador cuenta con su configuración y SLAs definidos.
- **Cuando** el gestor pulsa el interruptor de publicación a 'Activo'.
- **Entonces** el servicio se visualiza de inmediato en la vitrina del solicitante para su consumo.

##### Escenario 2: Retiro de servicio sin afectación a tickets en curso
- **Dado que** un servicio se vuelve obsoleto y pasa a estado 'Retirado'.
- **Cuando** se inhabilita en el catálogo.
- **Entonces** deja de aparecer para nuevas solicitudes, pero los tickets previamente creados continúan su ciclo de vida normal.

---

### HU-10: Búsqueda Predictiva y Exploración de Servicios para Solicitantes

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-10` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Solicitante de la organización.
- **Deseo:** Explorar el catálogo interactivo mediante un buscador de palabras clave y filtros de categoría.
- **Para:** Identificar con rapidez el servicio tecnológico adecuado para mi necesidad.

#### Criterios de Aceptación

##### Escenario 1: Búsqueda en tiempo real por término clave
- **Dado que** el usuario se encuentra en el portal de autoservicio.
- **Cuando** escribe 'laptop' o 'acceso' en el campo de búsqueda.
- **Entonces** la pantalla filtra instantáneamente las tarjetas de servicio relevantes sin recargar la página.

##### Escenario 2: Navegación por categorías del árbol
- **Dado que** el usuario prefiere explorar por familia de servicios.
- **Cuando** selecciona una categoría específica en la barra lateral.
- **Entonces** se despliegan únicamente los ítems pertenecientes a esa taxonomía.

---

### HU-11: Captura Asistida de Requerimientos desde el Catálogo

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-11` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Solicitante de la organización.
- **Deseo:** Completar el formulario estandarizado del servicio seleccionado con validación de datos.
- **Para:** Despachar mi pedido con la información requerida para su pronta resolución.

#### Criterios de Aceptación

##### Escenario 1: Apertura del formulario dinámico del servicio
- **Dado que** el usuario hace clic en el botón 'Solicitar' de una tarjeta del catálogo.
- **Cuando** se abre la vista de requerimiento.
- **Entonces** el sistema presenta el formulario oficial con sus campos específicos validados.

##### Escenario 2: Validación de campos obligatorios antes del envío
- **Dado que** el usuario intenta presionar 'Enviar Solicitud' con campos vacíos requeridos.
- **Cuando** el motor de validación en cliente evalúa el formulario.
- **Entonces** bloquea el despacho y resalta los campos pendientes con mensajes claros.

---

### HU-12: Bandeja de Seguimiento 'Mis Tickets' con Filtros de Estado

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-12` |
| **Módulo Asignado** | `tickets` ([src/modules/tickets](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/tickets)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Solicitante de la organización.
- **Deseo:** Consultar la lista de todos mis requerimientos e incidentes abiertos y cerrados con filtros.
- **Para:** Conocer en todo momento la situación de mis casos sin contactar directamente a la mesa.

#### Criterios de Aceptación

##### Escenario 1: Visualización de grilla personal de tickets
- **Dado que** el usuario ingresa a la opción 'Mis Solicitudes' o 'Mis Tickets'.
- **Cuando** la vista consulta el contrato del módulo de tickets.
- **Entonces** muestra todos los tickets creados por el solicitante ordenados cronológicamente.

##### Escenario 2: Filtrado por estado de atención
- **Dado que** el solicitante desea revisar únicamente casos que requieren su atención o están resueltos.
- **Cuando** aplica el filtro por estado (Abierto, En Proceso, Resuelto, Cerrado).
- **Entonces** la tabla muestra de inmediato los registros coincidentes.

---

### HU-13: Visualizador Detallado de Ticket con Línea de Tiempo (Stepper)

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-13` |
| **Módulo Asignado** | `tickets` ([src/modules/tickets](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/tickets)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Solicitante de la organización.
- **Deseo:** Abrir el expediente de un caso y visualizar su barra de avance (stepper) y técnico asignado.
- **Para:** Comprender la etapa exacta de atención en la que se encuentra mi trámite.

#### Criterios de Aceptación

##### Escenario 1: Renderizado del stepper de ciclo de vida
- **Dado que** el usuario selecciona un ticket de su bandeja.
- **Cuando** accede a la pantalla de detalle del ticket.
- **Entonces** visualiza la barra gráfica de progreso indicando la fase actual (Registrado -> Asignado -> En Proceso -> Resuelto).

##### Escenario 2: Identificación del especialista o grupo asignado
- **Dado que** un ticket ha sido despachado a un técnico de soporte.
- **Cuando** el solicitante consulta la ficha del caso.
- **Entonces** puede identificar el nombre del técnico o departamento TI responsable de la atención.

---

### HU-14: Bitácora de Comentarios Públicos y Notas Técnicas Privadas

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-14` |
| **Módulo Asignado** | `tickets` ([src/modules/tickets](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/tickets)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna HECHO (Sprint 1) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Usuario participante de un ticket.
- **Deseo:** Intercambiar mensajes en una bitácora cronológica adjuntando aclaraciones sobre el caso.
- **Para:** Mantener una comunicación fluida y transparente durante todo el ciclo de atención.

#### Criterios de Aceptación

##### Escenario 1: Envío y visualización de comentario público
- **Dado que** el solicitante o el técnico redacta un mensaje de actualización.
- **Cuando** confirma el envío en el panel de conversación.
- **Entonces** el comentario se registra en la bitácora con estampa de tiempo y queda visible para ambas partes.

##### Escenario 2: Privacidad de notas técnicas internas
- **Dado que** un técnico registra una nota de diagnóstico clasificada como privada.
- **Cuando** se persiste en la base de datos.
- **Entonces** la nota es visible exclusivamente para el equipo de TI y permanece oculta para el solicitante.

---

### Sección B: Historias de Usuario — Sprint 2 (Operación y Procesos ITIL)

---

### HU-15: Configuración Dinámica de Formularios de Incidentes

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-15` |
| **Módulo Asignado** | `incidentes` ([src/modules/incidentes](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/incidentes)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Administrador de la plataforma de TI.
- **Deseo:** Parametrizar y personalizar los campos del formulario de registro de incidentes en el panel de configuración.
- **Para:** Estandarizar la recolección de información técnica obligatoria según el tipo de incidente y evitar reportes incompletos.

#### Criterios de Aceptación

##### Escenario 1: Activación y marcado de campos obligatorios en el formulario
- **Dado que** el administrador accede a la ruta de configuración de formularios de incidentes.
- **Cuando** selecciona los campos estándar (síntomas observados, urgencia, impacto y equipo afectado) y activa el interruptor de obligatoriedad.
- **Entonces** el sistema guarda la plantilla y valida que en los próximos registros de incidentes dichos campos no puedan dejarse en blanco.

##### Escenario 2: Previsualización reactiva de la plantilla del formulario
- **Dado que** el administrador modifica la visibilidad de los campos en el panel de administración.
- **Cuando** observa el panel lateral de previsualización.
- **Entonces** el sistema refleja instantáneamente los cambios en tiempo real mostrando exactamente cómo visualizará el formulario el usuario técnico.

##### Escenario 3: Validación contra eliminación de campos esenciales
- **Dado que** el administrador intenta deshabilitar el campo de descripción detallada o título del incidente.
- **Cuando** presiona la opción de desactivar.
- **Entonces** el sistema bloquea la acción notificando que son campos críticos del núcleo ITSM requeridos para el ciclo de vida del ticket.

---

### HU-16: Configuración de Formularios de Solicitudes y Justificación de Negocio

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-16` |
| **Módulo Asignado** | `solicitudes` ([src/modules/solicitudes](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/solicitudes)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Administrador de la plataforma de TI.
- **Deseo:** Configurar la estructura de captura de solicitudes de servicio, incluyendo justificación de negocio y plazos requeridos.
- **Para:** Garantizar que los pedidos institucionales cuenten con sustento suficiente para la evaluación del gestor de área.

#### Criterios de Aceptación

##### Escenario 1: Configuración de campos de justificación y fecha límite
- **Dado que** el administrador ingresa a la configuración de formularios de solicitudes de servicio.
- **Cuando** activa la exigencia obligatoria de justificación de negocio y fecha requerida de entrega.
- **Entonces** el sistema actualiza la plantilla de solicitud para todos los servicios del catálogo empresarial.

##### Escenario 2: Restricción de fecha mínima en el selector
- **Dado que** un usuario intenta enviar una solicitud indicando una fecha deseada pasada o del mismo instante.
- **Cuando** el formulario valida el valor ingresado.
- **Entonces** el sistema bloquea el envío alertando que la fecha requerida debe cumplir con los plazos mínimos del acuerdo de nivel de servicio.

##### Escenario 3: Persistencia de parámetros adicionales por categoría
- **Dado que** el administrador añade atributos específicos a una categoría de solicitudes.
- **Cuando** presiona el botón 'Guardar configuración'.
- **Entonces** el sistema confirma la actualización con un mensaje visual y asienta los cambios en la base de datos sin afectar los incidentes.

---

### HU-17: Parametrización de Acuerdos de Nivel de Servicio (SLA) y Horarios Hábiles

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-17` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Servicios de TI.
- **Deseo:** Definir umbrales de tiempo máximo de primera respuesta y resolución asociados a la prioridad y descontando feriados y fines de semana.
- **Para:** Garantizar compromisos de servicio medibles con las áreas de negocio y monitorear el cumplimiento operativo.

#### Criterios de Aceptación

##### Escenario 1: Registro de matriz de tiempos por nivel de prioridad
- **Dado que** se configuran los SLAs para servicios en el módulo de servicios.
- **Cuando** se asignan 1 hora para P1 Crítica, 4 horas para P2 Alta, 8 horas para P3 Media y 24 horas para P4 Baja.
- **Entonces** el sistema almacena la matriz de compromisos y la asocia automáticamente a los tickets categorizados bajo esa prioridad.

##### Escenario 2: Cálculo automático de fecha y hora límite al crear el caso
- **Dado que** un solicitante o técnico registra un nuevo ticket con prioridad P2.
- **Cuando** el sistema procesa el guardado inicial.
- **Entonces** calcula y estampa automáticamente el campo de fecha límite de resolución sumando las horas comprometidas según el calendario laboral.

##### Escenario 3: Alerta visual de aproximación a vencimiento
- **Dado que** un ticket se encuentra abierto y el tiempo transcurrido supera el 80% del umbral de SLA establecido.
- **Cuando** el supervisor o técnico visualiza la bandeja de casos.
- **Entonces** el sistema despliega un indicador en color ámbar alertando sobre la proximidad del incumplimiento de SLA.

---

### HU-18: Diseñador Dinámico de Campos para Formularios de Servicios del Catálogo

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-18` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Servicios de TI.
- **Deseo:** Diseñar y configurar campos dinámicos personalizados (texto, listas desplegables, selectores, casillas) para cada servicio individual.
- **Para:** Capturar los atributos técnicos y administrativos específicos de cada prestación sin sobrecargar servicios simples con datos innecesarios.

#### Criterios de Aceptación

##### Escenario 1: Creación de campos personalizados por ítem de servicio
- **Dado que** el gestor accede a la configuración de formulario de un servicio específico del catálogo.
- **Cuando** agrega un nuevo control de entrada definiendo etiqueta, tipo de dato (texto, numérico, fecha o selección) y obligatoriedad.
- **Entonces** el diseñador registra el atributo en el esquema dinámico del servicio y lo persiste en la base de datos.

##### Escenario 2: Previsualización en vivo del formulario generado
- **Dado que** se añaden o reordenan campos dinámicos en el diseñador de servicios.
- **Cuando** el gestor interactúa con el panel de vista previa.
- **Entonces** el sistema renderiza en tiempo real el formulario exactamente como lo visualizará el usuario solicitante al requerir dicho servicio.

##### Escenario 3: Validación reactiva con esquema Zod al registrar solicitud
- **Dado que** un usuario solicita un servicio que posee campos dinámicos obligatorios configurados.
- **Cuando** intenta enviar la solicitud sin completar los campos requeridos o con un formato inválido.
- **Entonces** el motor de validación dinámico previene el envío y resalta los controles con mensajes de error específicos.

---

### HU-19: Registro Estructurado de Problemas y Análisis Causa Raíz (RCA)

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-19` |
| **Módulo Asignado** | `problemas` ([src/modules/problemas](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/problemas)) |
| **Integrante Responsable** | Alexis |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Problemas de TI.
- **Deseo:** Registrar problemas a partir de incidentes recurrentes y documentar el análisis de causa raíz (RCA) mediante metodología de los 5 Porqués.
- **Para:** Erradicar fallas estructurales y prevenir la repetición de incidentes de alto impacto.

#### Criterios de Aceptación

##### Escenario 1: Apertura de caso de problema vinculado a incidentes
- **Dado que** se identifican incidentes múltiples asociados a la caída recurrente de un servicio.
- **Cuando** el gestor de problemas crea un registro de problema y vincula los IDs de los incidentes relacionados.
- **Entonces** el sistema asocia los casos en la base de datos y coloca el problema en estado 'Bajo Investigación'.

##### Escenario 2: Documentación guiada de los 5 Porqués
- **Dado que** el especialista inicia la investigación técnica en la pestaña RCA.
- **Cuando** completa secuencialmente las cinco iteraciones de causa-efecto identificando el factor raíz.
- **Entonces** el sistema estructura el informe técnico de causa raíz y lo asocia permanentemente al expediente.

##### Escenario 3: Bloqueo de cierre sin resolución técnica
- **Dado que** un problema se encuentra en estado de diagnóstico.
- **Cuando** el usuario intenta marcar el caso como cerrado sin haber completado el campo de causa raíz confirmada.
- **Entonces** el sistema impide la transición de estado exigiendo el sustento técnico correspondiente.

---

### HU-20: Base de Datos de Errores Conocidos (KEDB) y Publicación de Workarounds

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-20` |
| **Módulo Asignado** | `problemas` ([src/modules/problemas](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/problemas)) |
| **Integrante Responsable** | Alexis |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Problemas de TI.
- **Deseo:** Publicar soluciones temporales (workarounds) asociadas a errores conocidos en la KEDB con indexación contextual.
- **Para:** Permitir que los técnicos de mesa resuelvan incidentes similares de forma ágil mientras se implementa la solución definitiva.

#### Criterios de Aceptación

##### Escenario 1: Publicación de solución temporal en la KEDB
- **Dado que** se determina un procedimiento de mitigación temporal para una falla de software no subsanada por el fabricante.
- **Cuando** el gestor redacta los pasos de remediación y activa el interruptor 'Publicar en KEDB'.
- **Entonces** el registro se indexa inmediatamente en el repositorio de errores conocidos disponible para la mesa técnica.

##### Escenario 2: Búsqueda contextual de workarounds desde incidentes
- **Dado que** un técnico atiende un incidente con síntomas semejantes a un error conocido.
- **Cuando** consulta la pestaña de soluciones temporales recomendadas.
- **Entonces** el sistema despliega el artículo KEDB con los pasos exactos para restablecer el servicio al usuario.

##### Escenario 3: Trazabilidad de aplicación de soluciones temporales
- **Dado que** un técnico aplica un workaround de la KEDB para resolver un ticket.
- **Cuando** confirma la aplicación de la solución temporal.
- **Entonces** el sistema incrementa el contador de efectividad del artículo y vincula la referencia en la bitácora del ticket.

---

### HU-21: Configuración de Departamentos TI y Grupos Resolutores N1/N2/N3

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-21` |
| **Módulo Asignado** | `organizacion` ([src/modules/organizacion](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/organizacion)) |
| **Integrante Responsable** | Junior |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Administrador de la plataforma de TI.
- **Deseo:** Configurar grupos resolutores especializados asignando técnicos, especialidades y niveles de soporte N1, N2 y N3.
- **Para:** Direccionar eficientemente los requerimientos e incidentes hacia el personal técnico idóneo para su atención.

#### Criterios de Aceptación

##### Escenario 1: Creación de grupo resolutor técnico
- **Dado que** el administrador accede a la gestión de departamentos de TI.
- **Cuando** crea el grupo 'Soporte de Redes y Conectividad' y asigna un líder de área.
- **Entonces** el grupo queda registrado y disponible en las listas de derivación y despacho de tickets.

##### Escenario 2: Asignación de técnicos con nivel de escalamiento
- **Dado que** se agregan miembros a un grupo resolutor.
- **Cuando** el administrador clasifica a los especialistas en niveles N1 (Mesa), N2 (Especialistas) o N3 (Ingeniería).
- **Entonces** el sistema restringe las opciones de escalamiento de tickets garantizando el flujo jerárquico correcto.

##### Escenario 3: Prevención de grupos resolutores sin integrantes activos
- **Dado que** un grupo resolutor tiene asignados incidentes en cola.
- **Cuando** se intenta desactivar o desvincular a todos sus integrantes.
- **Entonces** el sistema alerta sobre la presencia de tickets pendientes e impide dejar el grupo sin capacidad resolutora.

---

### HU-22: Planificación de Turnos Técnicos y Control de Ausencias en Mesa

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-22` |
| **Módulo Asignado** | `organizacion` ([src/modules/organizacion](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/organizacion)) |
| **Integrante Responsable** | Junior |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Administrador o Supervisor de TI.
- **Deseo:** Registrar turnos de trabajo, horarios de disponibilidad y periodos de ausencia o vacaciones del personal técnico.
- **Para:** Evitar la asignación automática de tickets a especialistas no disponibles y redistribuir la carga operativa equitativamente.

#### Criterios de Aceptación

##### Escenario 1: Registro de ausencia programada o licencia técnica
- **Dado que** un técnico notifica su periodo de descanso médico o vacaciones.
- **Cuando** el supervisor registra las fechas de inicio y fin en el calendario de ausencias.
- **Entonces** el sistema cambia el estado operativo del técnico a 'Ausente' durante el periodo configurado.

##### Escenario 2: Exclusión de técnicos ausentes del balanceo de carga
- **Dado que** un técnico se encuentra en fecha de ausencia registrada.
- **Cuando** ingresa un nuevo ticket dirigido a su grupo de soporte.
- **Entonces** el algoritmo de balanceo omite automáticamente al técnico ausente y asigna el caso a un especialista disponible.

##### Escenario 3: Alerta visual en reasignación manual de casos
- **Dado que** un supervisor intenta reasignar manualmente un ticket a un técnico con turno concluido o ausencia activa.
- **Cuando** selecciona su nombre en el menú de asignación.
- **Entonces** el sistema despliega una advertencia indicando que el especialista se encuentra fuera de turno y solicita confirmación.

---

### HU-23: Registro de Solicitud de Cambio (RFC) y Validación de Ventanas de Mantenimiento

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-23` |
| **Módulo Asignado** | `cambios` ([src/modules/cambios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/cambios)) |
| **Integrante Responsable** | Nain |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Cambios de TI.
- **Deseo:** Registrar solicitudes de cambio (RFC) evaluando riesgo, impacto y verificando ventanas de mantenimiento y periodos de congelamiento.
- **Para:** Minimizar el riesgo de interrupción en los servicios de producción durante la aplicación de actualizaciones o despliegues.

#### Criterios de Aceptación

##### Escenario 1: Captura de plan de implementación y plan de rollback
- **Dado que** un ingeniero registra una Solicitud de Cambio Normal.
- **Cuando** completa los campos obligatorios de justificación técnica, plan de pruebas y plan de contingencia (rollback).
- **Entonces** el sistema genera la RFC asignándole código único y estado 'En Evaluación'.

##### Escenario 2: Detección de colisiones con ventanas de congelamiento (freeze)
- **Dado que** existe un periodo de freeze institucional configurado por cierre fiscal o auditoría.
- **Cuando** el solicitante intenta programar una RFC normal dentro de esa ventana de tiempo.
- **Entonces** el sistema bloquea la programación alertando sobre la restricción de cambios en producción.

##### Escenario 3: Cálculo automático de nivel de riesgo de la RFC
- **Dado que** se seleccionan los CIs afectados y el horario previsto.
- **Cuando** el formulario cruza impacto sobre usuarios y complejidad técnica.
- **Entonces** calcula el puntaje de riesgo recomendando si el cambio debe elevarse a evaluación del comité CAB.

---

### HU-24: Inventario Maestro de Activos TI y Control Semafórico de Licencias (SAM)

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-24` |
| **Módulo Asignado** | `activos` ([src/modules/activos](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/activos)) |
| **Integrante Responsable** | Nain |
| **Estado en Trello** | Columna HECHO (Sprint 2) |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Activos de TI.
- **Deseo:** Gestionar el inventario físico y lógico de equipos y monitorear el consumo de licencias de software mediante semáforo de cumplimiento.
- **Para:** Mantener el control patrimonial de hardware y garantizar el cumplimiento contractual de licenciamiento evitando penalidades.

#### Criterios de Aceptación

##### Escenario 1: Alta de activo TI con número de serie y custodia
- **Dado que** ingresa un nuevo lote de equipos informáticos al almacén.
- **Cuando** el gestor registra el número de serie, modelo, fabricante, fecha de compra y asigna el colaborador custodio.
- **Entonces** el sistema crea la ficha patrimonial del activo con su código de barra interno y estado 'En Stock'.

##### Escenario 2: Semáforo de cumplimiento SAM de licencias de software
- **Dado que** se tiene contratado un paquete de 100 licencias de software ofimático o base de datos.
- **Cuando** el número de asignaciones activas alcanza el 95% del total comprado.
- **Entonces** el panel SAM cambia el indicador a color ámbar alertando sobre la proximidad de sobreuso de licencias.

##### Escenario 3: Alerta de bloqueo ante sobreasignación de licencias
- **Dado que** se intenta asignar una licencia cuando se ha alcanzado el 100% del cupo legal contratado.
- **Cuando** el operador intenta confirmar la asignación a un nuevo equipo.
- **Entonces** el sistema emite una alerta en color rojo previniendo la instalación en incumplimiento de los contratos vigentes.

---

## Parte II — Historias de Usuario en Columna "PRODUCT BACKLOG"

> Estas historias representan funcionalidades planificadas para siguientes iteraciones del proyecto que aún no han sido abordadas en el código actual.

---

### HU-25: Sala de Crisis Colaborativa y Gestión de Incidentes Mayores P1

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-25` |
| **Módulo Asignado** | `incidentes` ([src/modules/incidentes](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/incidentes)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Incidentes Mayores.
- **Deseo:** Habilitar una sala de crisis virtual con chat técnico dedicado, cronómetro de impacto y asignación de brigadas de atención inmediata.
- **Para:** Coordinar la respuesta multidisciplinaria ante caídas críticas de servicios y restablecer la operación en el menor tiempo posible.

#### Criterios de Aceptación

##### Escenario 1: Apertura automática de sala de crisis al clasificar incidente P1
- **Dado que** un incidente es catalogado con Prioridad 1 Crítica por interrupción general de operaciones.
- **Cuando** se confirma la severidad del caso.
- **Entonces** el sistema crea un espacio de trabajo colaborativo en vivo y notifica de emergencia a los líderes técnicos y gerentes de servicio.

##### Escenario 2: Cronómetro de indisponibilidad y registro de hitos
- **Dado que** la sala de crisis se encuentra activa.
- **Cuando** los especialistas ingresan avances en el chat de operaciones.
- **Entonces** el panel computa los minutos acumulados de indisponibilidad y estampa los hitos de diagnóstico para el informe post-mortem.

##### Escenario 3: Despacho de comunicados de estado a usuarios corporativos
- **Dado que** el gestor redacta un comunicado de avance para la empresa.
- **Cuando** presiona 'Enviar boletín de crisis'.
- **Entonces** el sistema despacha una notificación por correo y publica un banner informativo en el portal de autoservicio.

---

### HU-26: Motor de Escalamiento Automático y Notificaciones Operativas

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-26` |
| **Módulo Asignado** | `operacion` ([src/modules/operacion](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/operacion)) |
| **Integrante Responsable** | Miguel |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Supervisor de Operaciones de TI.
- **Deseo:** Parametrizar reglas de escalamiento jerárquico y funcional que se disparen automáticamente al consumirse el 75% o 90% del SLA.
- **Para:** Alertar a líderes técnicos antes de que se produzca una brecha de servicio no mitigada.

#### Criterios de Aceptación

##### Escenario 1: Disparo de alerta preventiva por proximidad de vencimiento
- **Dado que** un ticket de alta prioridad no ha recibido primera respuesta y consume el 75% de su tiempo límite.
- **Cuando** el cronómetro del motor de reglas evalúa el caso.
- **Entonces** emite un correo prioritario al supervisor de guardia y resalta el ticket con borde intermitente en la consola técnica.

##### Escenario 2: Reasignación forzosa a especialista senior al vencer el 90%
- **Dado que** el ticket alcanza el 90% del umbral de resolución sin cambios de estado.
- **Cuando** la regla de escalamiento se ejecuta.
- **Entonces** el sistema reasigna automáticamente el caso al equipo de soporte de segundo nivel N2 y registra la novedad en la bitácora.

##### Escenario 3: Registro en la bitácora de auditoría del ticket
- **Dado que** se produce una acción de escalamiento automático por SLA.
- **Cuando** el supervisor o auditor revisa el historial del ticket.
- **Entonces** visualiza el evento con autoría del sistema detallando la regla disparadora y la hora de ejecución.

---

### HU-27: Catálogo de Servicios Técnicos y Vinculación con Acuerdos Operativos OLA

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-27` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Gestor de Servicios de TI.
- **Deseo:** Publicar una vista del catálogo orientada a especialistas técnicos que vincule CIs subyacentes y acuerdos de nivel operativo (OLA).
- **Para:** Transparentar las dependencias internas entre grupos resolutores y los tiempos de transferencia técnica.

#### Criterios de Aceptación

##### Escenario 1: Visualización de acuerdos operativos internos (OLA) por servicio
- **Dado que** el gestor accede a la vista de catálogo técnico.
- **Cuando** consulta un servicio de infraestructura (ej. Aprovisionamiento de Servidor Cloud).
- **Entonces** el sistema detalla los compromisos de tiempo OLA entre el área de Redes, Sistemas y Seguridad requeridos para la entrega.

##### Escenario 2: Mapeo de elementos de configuración (CIs) al catálogo
- **Dado que** se asocian componentes de infraestructura a un ítem de servicio.
- **Cuando** el técnico consulta la ficha técnica.
- **Entonces** visualiza los servidores, bases de datos y licencias vinculadas al soporte de dicho servicio.

##### Escenario 3: Monitoreo de cumplimiento OLA entre equipos internos
- **Dado que** un ticket de servicio se transfiere de la mesa de ayuda al equipo de redes.
- **Cuando** se evalúa el tiempo que permaneció en cada área resolutora.
- **Entonces** el sistema compara el tiempo transcurrido contra el OLA específico de cada departamento.

---

### HU-28: Parametrización de Contratos de Soporte Externo (UC) y Excepciones de Calendario

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-28` |
| **Módulo Asignado** | `servicios` ([src/modules/servicios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/servicios)) |
| **Integrante Responsable** | Lourdes |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Gestor de Servicios de TI.
- **Deseo:** Configurar Acuerdos de Soporte Externo (Underpinning Contracts - UC) con proveedores de infraestructura y calendarios con excepciones festivas.
- **Para:** Sincronizar las penalizaciones y compromisos contractuales de terceros con los SLAs ofrecidos a la empresa.

#### Criterios de Aceptación

##### Escenario 1: Definición de contrato de soporte de tercero (UC) vinculado a servicio
- **Dado que** un servicio del catálogo depende de un proveedor de enlace de telecomunicaciones.
- **Cuando** el gestor configura el contrato UC estableciendo 2 horas de respuesta comprometida por el proveedor.
- **Entonces** el sistema enlaza el tiempo de resolución externa como una meta medible dentro del SLA global.

##### Escenario 2: Configuración de excepciones en el calendario de días no hábiles
- **Dado que** se publican feriados oficiales o asuetos institucionales de fin de año.
- **Cuando** el gestor ingresa las fechas no laborables en el calendario del módulo de servicios.
- **Entonces** el motor de SLA pausa automáticamente el conteo de horas hábiles durante esos días festivos.

##### Escenario 3: Diferenciación entre horario hábil 8x5 y cobertura 24x7
- **Dado que** un servicio VIP o crítico opera con régimen de guardia ininterrumpida.
- **Cuando** se asigna la política de cobertura 24x7 al servicio.
- **Entonces** los cronómetros contabilizan horas naturales consecutivas sin aplicar descuentos de jornada laboral.

---

### HU-29: Diagrama Causa-Efecto (Ishikawa) y Árbol de Fallas para Problemas Complejos

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-29` |
| **Módulo Asignado** | `problemas` ([src/modules/problemas](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/problemas)) |
| **Integrante Responsable** | Alexis |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Gestor de Problemas de TI.
- **Deseo:** Diseñar diagramas de espina de pescado (Ishikawa) y árboles de falla interactivos dentro del expediente del problema.
- **Para:** Sistematizar el análisis multidisciplinario en fallas crónicas que involucran métodos, máquinas, personal y entorno.

#### Criterios de Aceptación

##### Escenario 1: Categorización guiada de causas en ramas estándar Ishikawa
- **Dado que** el especialista inicia la sesión de análisis en un problema recurrente.
- **Cuando** añade causas secundarias en las ramas de Métodos, Máquinas, Personas y Entorno.
- **Entonces** el sistema renderiza el diagrama gráfico en pantalla organizando visualmente las hipótesis de falla.

##### Escenario 2: Ponderación y selección de la causa raíz confirmada
- **Dado que** el equipo técnico valida cuál de las hipótesis originó el problema.
- **Cuando** el gestor marca la causa principal en el diagrama interactivo.
- **Entonces** el sistema traslada automáticamente dicha hipótesis al campo de Causa Raíz definitiva del expediente.

##### Escenario 3: Exportación del diagrama para informes ejecutivos
- **Dado que** se debe presentar el informe post-problema a la gerencia.
- **Cuando** el gestor presiona 'Exportar diagrama'.
- **Entonces** el sistema genera un archivo vectorial PDF/PNG con el diagrama y las evidencias analizadas.

---

### HU-30: Flujo Editorial KCS con Aprobación y Votación de Artículos de Conocimiento

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-30` |
| **Módulo Asignado** | `conocimiento` ([src/modules/conocimiento](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/conocimiento)) |
| **Integrante Responsable** | Alexis |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Especialista de Conocimiento de TI.
- **Deseo:** Disponer de un flujo editorial formal (Borrador -> En Revisión Técnica -> Aprobado -> Publicado) con sistema de votación de utilidad.
- **Para:** Garantizar que solo artículos precisos y verificados formen parte de la base de conocimiento institucional.

#### Criterios de Aceptación

##### Escenario 1: Envío de artículo a revisión por pares técnicos
- **Dado que** un técnico documenta la solución para un error de configuración.
- **Cuando** solicita la publicación del borrador.
- **Entonces** el artículo entra en cola de revisión para el Gestor de Conocimiento con estado 'En Revisión'.

##### Escenario 2: Votación de utilidad por solicitantes y técnicos
- **Dado que** un usuario consulta un artículo público para resolver una duda tecnológica.
- **Cuando** califica el contenido con las opciones '¿Te sirvió este artículo? Sí / No'.
- **Entonces** el sistema registra la votación y calcula la tasa de efectividad del contenido.

##### Escenario 3: Alerta automática de revisión periódica por obsolescencia
- **Dado que** un artículo cumple 180 días desde su última fecha de actualización.
- **Cuando** el motor editorial audita la vigencia de la base de conocimientos.
- **Entonces** marca el artículo como 'Pendiente de Recertificación' y notifica a su autor para validar si continúa vigente.

---

### HU-31: Matriz de Desbloqueo Seguro y Políticas de Caducidad de Contraseñas IAM

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-31` |
| **Módulo Asignado** | `identidades` ([src/modules/identidades](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/identidades)) |
| **Integrante Responsable** | Junior |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Administrador de la plataforma de TI.
- **Deseo:** Configurar políticas de vigencia periódica de credenciales, bloqueo automático por intentos fallidos y flujo de desbloqueo supervisado.
- **Para:** Proteger la plataforma contra accesos no autorizados y ataques de fuerza bruta según directrices ISO/IEC 27001.

#### Criterios de Aceptación

##### Escenario 1: Bloqueo automático de cuenta tras 5 intentos fallidos
- **Dado que** un usuario o atacante ingresa contraseñas erróneas consecutivas.
- **Cuando** el contador alcanza el quinto intento fallido.
- **Entonces** el sistema bloquea temporalmente la cuenta por 30 minutos y registra la IP de origen en la bitácora de seguridad.

##### Escenario 2: Desbloqueo manual con registro de motivo de seguridad
- **Dado que** un colaborador bloqueado solicita restablecimiento en la mesa de ayuda.
- **Cuando** el administrador valida su identidad y pulsa 'Desbloquear cuenta' ingresando una justificación.
- **Entonces** el sistema restablece el acceso y envía un correo con token de cambio obligatorio en el siguiente inicio.

##### Escenario 3: Notificación de caducidad de clave a los 90 días
- **Dado que** se alcanza el plazo de vigencia configurado para credenciales institucionales.
- **Cuando** el usuario inicia sesión.
- **Entonces** el sistema le exige actualizar su contraseña impidiéndole navegar hasta definir una nueva clave segura.

---

### HU-32: Catálogo de Proveedores y Evaluación de Cumplimiento de Contratos de Terceros

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-32` |
| **Módulo Asignado** | `proveedores` ([src/modules/proveedores](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/proveedores)) |
| **Integrante Responsable** | Junior |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Media (M) |
| **Prioridad de Negocio** | Media |

#### Definición de la Historia
- **Como:** Gestor de Proveedores de TI.
- **Deseo:** Administrar el directorio oficial de contratistas tecnológicos, sus contratos de mantenimiento y registrar evaluaciones periódicas de servicio.
- **Para:** Mantener control sobre los terceros homologados y auditar el cumplimiento de los contratos de soporte externo.

#### Criterios de Aceptación

##### Escenario 1: Registro de ficha de proveedor tecnológico y contratos asociados
- **Dado que** se contrata a una empresa externa de soporte de infraestructura o licencias.
- **Cuando** el gestor registra razón social, RUC, contactos técnicos y adjunta el contrato con sus fechas de vigencia.
- **Entonces** el proveedor queda homologado en el sistema con estado 'Activo'.

##### Escenario 2: Registro de evaluación semestral de desempeño de proveedores
- **Dado que** concluye un periodo contractual de soporte externo.
- **Cuando** el gestor califica el cumplimiento de tiempos de respuesta, calidad técnica y resolución de quejas.
- **Entonces** el sistema calcula el índice de rendimiento del contratista y emite recomendaciones de renovación.

##### Escenario 3: Alerta de vencimiento de contrato de mantenimiento 30 días antes
- **Dado que** un contrato de soporte tecnológico se aproxima a su fecha de expiración.
- **Cuando** restan 30 días calendario para el término.
- **Entonces** el sistema genera una alerta en la consola del gestor de proveedores para iniciar el trámite de renovación.

---

### HU-33: Topología Interactiva de CIs y Matriz de Análisis de Impacto en CMDB

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-33` |
| **Módulo Asignado** | `cmdb` ([src/modules/cmdb](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/cmdb)) |
| **Integrante Responsable** | Nain |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Gestor de Configuración y CMDB.
- **Deseo:** Visualizar el mapa topológico interactivo de relaciones lógicas y físicas entre CIs, con simulación gráfica de fallas aguas arriba y aguas abajo.
- **Para:** Anticipar el impacto colateral que tendrá la intervención de un servidor, enlace o base de datos sobre los servicios de negocio.

#### Criterios de Aceptación

##### Escenario 1: Renderizado de grafo de dependencias aguas arriba y aguas abajo
- **Dado que** el especialista selecciona un servidor de aplicaciones en la consola CMDB.
- **Cuando** abre la vista de topología interactiva.
- **Entonces** el sistema dibuja el árbol de relaciones mostrando la base de datos subyacente, el switch de red y los servicios de negocio dependientes.

##### Escenario 2: Simulación de caída de nodo crítico de infraestructura
- **Dado que** se planifica una intervención sobre un elemento de red central.
- **Cuando** el gestor simula la indisponibilidad del nodo en el grafo interactivo.
- **Entonces** el sistema resalta en color rojo todos los CIs y aplicaciones que quedarían fuera de servicio como consecuencia del corte.

##### Escenario 3: Detección de relaciones circulares o CIs huérfanos
- **Dado que** se actualizan las relaciones lógicas de la infraestructura tecnológica.
- **Cuando** el módulo audita la integridad referencial del grafo.
- **Entonces** alerta sobre elementos de configuración sin relaciones ascendentes o bucles lógicos que distorsionen el análisis de impacto.

---

### HU-34: Sesión Virtual del Comité de Cambios (CAB) con Votación Formal de RFCs

| Parámetro | Detalle |
| :--- | :--- |
| **Identificador** | `HU-34` |
| **Módulo Asignado** | `cambios` ([src/modules/cambios](file:///C:/Users/apaza/Desktop/SISTEMA DE TICKETS/src/modules/cambios)) |
| **Integrante Responsable** | Nain |
| **Estado en Trello** | Columna PRODUCT BACKLOG |
| **Estimación / Complejidad** | Alta (L) |
| **Prioridad de Negocio** | Alta |

#### Definición de la Historia
- **Como:** Miembro del Comité Asesor de Cambios (CAB).
- **Deseo:** Evaluar el expediente consolidado de cambios normales en una agenda virtual y consignar mi voto de aprobación o rechazo fundamentado.
- **Para:** Agilizar las decisiones colegiadas de autorización de cambios sin depender de reuniones presenciales prolongadas.

#### Criterios de Aceptación

##### Escenario 1: Visualización del expediente consolidado de cambio en la agenda CAB
- **Dado que** el integrante del CAB ingresa a la sesión de evaluación semanal.
- **Cuando** consulta una RFC en agenda.
- **Entonces** el sistema despliega el expediente completo: justificación, análisis de riesgos, plan de pruebas, rollback y CIs involucrados.

##### Escenario 2: Emisión y registro de dictamen individual fundamentado
- **Dado que** el aprobador analiza la viabilidad del cambio propuesto.
- **Cuando** selecciona su voto (Aprobado, Rechazado o Con Observaciones) e ingresa un comentario explicativo.
- **Entonces** el sistema registra el dictamen formal en la bitácora del cambio contabilizando el quórum requerido.

##### Escenario 3: Transición automática de estado al alcanzar la mayoría calificada
- **Dado que** todos los miembros requeridos del comité han emitido su dictamen favorable.
- **Cuando** el sistema computa el último voto requerido.
- **Entonces** la RFC transiciona automáticamente a estado 'Aprobado para Implementación' notificando al gestor de cambios y al solicitante.

---

## Parte III — Matriz de Asignación por Integrante

| ID Historia | Título de la Historia de Usuario | Módulo Asignado | Estado en Trello | Integrante Responsable |
| :---: | :--- | :--- | :---: | :--- |
| **HU-00** | Provisión de Credenciales SMTP Seguras | `identidades` | HECHO (Sprint 1) | Junior |
| **HU-01** | Inicio de Sesión y Control de Acceso Institucional | `seguridad` | HECHO (Sprint 1) | Miguel |
| **HU-02** | Recuperación Autónoma de Contraseña por Código Temporal | `seguridad` | HECHO (Sprint 1) | Miguel |
| **HU-03** | Actualización de Perfil y Canales de Contacto | `seguridad` | HECHO (Sprint 1) | Miguel |
| **HU-04** | Administración Centralizada de Cuentas de Usuario | `identidades` | HECHO (Sprint 1) | Junior |
| **HU-05** | Asignación de Perfiles RBAC y Políticas de Acceso | `identidades` | HECHO (Sprint 1) | Junior |
| **HU-06** | Creación y Jerarquización de Categorías del Catálogo | `servicios` | HECHO (Sprint 1) | Lourdes |
| **HU-07** | Configuración de Ficha de Servicio y Parámetros Base | `servicios` | HECHO (Sprint 1) | Lourdes |
| **HU-08** | Edición Integral y Actualización del Catálogo de Servicios | `servicios` | HECHO (Sprint 1) | Lourdes |
| **HU-09** | Activación y Retiro Controlado de Ítems del Catálogo | `servicios` | HECHO (Sprint 1) | Lourdes |
| **HU-10** | Búsqueda Predictiva y Exploración de Servicios para Solicitantes | `servicios` | HECHO (Sprint 1) | Lourdes |
| **HU-11** | Captura Asistida de Requerimientos desde el Catálogo | `servicios` | HECHO (Sprint 1) | Lourdes |
| **HU-12** | Bandeja de Seguimiento 'Mis Tickets' con Filtros de Estado | `tickets` | HECHO (Sprint 1) | Miguel |
| **HU-13** | Visualizador Detallado de Ticket con Línea de Tiempo (Stepper) | `tickets` | HECHO (Sprint 1) | Miguel |
| **HU-14** | Bitácora de Comentarios Públicos y Notas Técnicas Privadas | `tickets` | HECHO (Sprint 1) | Miguel |
| **HU-15** | Configuración Dinámica de Formularios de Incidentes | `incidentes` | HECHO (Sprint 2) | Miguel |
| **HU-16** | Configuración de Formularios de Solicitudes y Justificación de Negocio | `solicitudes` | HECHO (Sprint 2) | Miguel |
| **HU-17** | Parametrización de Acuerdos de Nivel de Servicio (SLA) y Horarios Hábiles | `servicios` | HECHO (Sprint 2) | Lourdes |
| **HU-18** | Diseñador Dinámico de Campos para Formularios de Servicios del Catálogo | `servicios` | HECHO (Sprint 2) | Lourdes |
| **HU-19** | Registro Estructurado de Problemas y Análisis Causa Raíz (RCA) | `problemas` | HECHO (Sprint 2) | Alexis |
| **HU-20** | Base de Datos de Errores Conocidos (KEDB) y Publicación de Workarounds | `problemas` | HECHO (Sprint 2) | Alexis |
| **HU-21** | Configuración de Departamentos TI y Grupos Resolutores N1/N2/N3 | `organizacion` | HECHO (Sprint 2) | Junior |
| **HU-22** | Planificación de Turnos Técnicos y Control de Ausencias en Mesa | `organizacion` | HECHO (Sprint 2) | Junior |
| **HU-23** | Registro de Solicitud de Cambio (RFC) y Validación de Ventanas de Mantenimiento | `cambios` | HECHO (Sprint 2) | Nain |
| **HU-24** | Inventario Maestro de Activos TI y Control Semafórico de Licencias (SAM) | `activos` | HECHO (Sprint 2) | Nain |
| **HU-25** | Sala de Crisis Colaborativa y Gestión de Incidentes Mayores P1 | `incidentes` | PRODUCT BACKLOG | Miguel |
| **HU-26** | Motor de Escalamiento Automático y Notificaciones Operativas | `operacion` | PRODUCT BACKLOG | Miguel |
| **HU-27** | Catálogo de Servicios Técnicos y Vinculación con Acuerdos Operativos OLA | `servicios` | PRODUCT BACKLOG | Lourdes |
| **HU-28** | Parametrización de Contratos de Soporte Externo (UC) y Excepciones de Calendario | `servicios` | PRODUCT BACKLOG | Lourdes |
| **HU-29** | Diagrama Causa-Efecto (Ishikawa) y Árbol de Fallas para Problemas Complejos | `problemas` | PRODUCT BACKLOG | Alexis |
| **HU-30** | Flujo Editorial KCS con Aprobación y Votación de Artículos de Conocimiento | `conocimiento` | PRODUCT BACKLOG | Alexis |
| **HU-31** | Matriz de Desbloqueo Seguro y Políticas de Caducidad de Contraseñas IAM | `identidades` | PRODUCT BACKLOG | Junior |
| **HU-32** | Catálogo de Proveedores y Evaluación de Cumplimiento de Contratos de Terceros | `proveedores` | PRODUCT BACKLOG | Junior |
| **HU-33** | Topología Interactiva de CIs y Matriz de Análisis de Impacto en CMDB | `cmdb` | PRODUCT BACKLOG | Nain |
| **HU-34** | Sesión Virtual del Comité de Cambios (CAB) con Votación Formal de RFCs | `cambios` | PRODUCT BACKLOG | Nain |
