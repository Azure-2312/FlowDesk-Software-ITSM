# Catálogo de Servicios — Datos de Carga (30 servicios)

> **Versión:** 2.0 · **Fecha:** 2026-10-19 · **Estado:** vigente como conjunto de datos de referencia.
> **Alcance:** 14 servicios de solicitud y 16 de incidente, con su distribución por categoría y el JSON listo para insertar.
> **Nota:** el catálogo se administra desde `/plataforma/admin/servicios`; los servicios activos se consultan en `/plataforma/incidentes/catalogo`, `/plataforma/solicitudes/catalogo` y `/plataforma/servicios/catalogo`.

> **Objetivo:** insertar en la base de datos 30 servicios nuevos del catálogo, ya agrupados en las categorías que existen en el sistema, usando los mismos campos del formulario **"Crear Nuevo Servicio en el Catálogo (Formulario Oficial)"**.
> **Stack:** Next.js + PostgreSQL en Supabase. Tienes acceso completo al código y a la base de datos.

---

## 1. Instrucciones para la IA

1. **Localiza** la tabla (o tablas) de servicios del catálogo y la de categorías funcionales, y el código del formulario "Crear Nuevo Servicio" (`/plataforma/admin/servicios?vista=crear`) para conocer los nombres reales de columnas y las reglas de validación.
2. **Mapea** cada campo de la sección 4 a la columna correspondiente:

| Campo del JSON | Campo del formulario |
|---|---|
| `tipo_itil` | Tipo ITIL v4 (*Solicitud de servicio* / *Incidente*) |
| `categoria_funcional` | Categoría Funcional |
| `nombre` | Nombre Comercial del Servicio (máx. 120 caracteres) |
| `sla_primera_respuesta_horas` | SLA Primera Respuesta (Horas) |
| `sla_resolucion_horas` | SLA Resolución Total (Horas) |
| `costo_referencial` | Costo Referencial (S/.) |
| `entregable_oficial` | Entregable Oficial del Servicio (Criterio de Aceptación) |
| `descripcion_comercial` | Descripción Comercial y Alcance Detallado |
| `requiere_aprobacion` | Requiere Aprobación Previa de Jefatura / Gestor de Área |

3. **Código oficial:** no lo escribas a mano. Genéralo con **el mismo mecanismo que usa el formulario** (patrón `SRV-SOL-ACC-NNN` para solicitudes; el equivalente `SRV-INC-…` para incidentes; el segmento intermedio es la abreviatura de la categoría que ya usa el sistema y `NNN` continúa el correlativo máximo existente en esa categoría). Si el sistema no tiene abreviatura para alguna categoría, repórtalo y propón una de 3 letras antes de insertar.
4. **Categorías:** búscalas por **nombre exacto** (sin distinguir mayúsculas ni tildes). Si alguna categoría no existe, **no la crees**: detente y repórtalo.
5. **Idempotencia:** antes de insertar cada servicio, verifica si ya existe uno con el mismo `nombre` en la misma categoría y tipo. Si existe, **omítelo** y repórtalo (el catálogo ya tiene algunos servicios en Usuarios y Accesos, Equipamiento Nuevo, Instalación de Software, Redes y Comunicaciones, Datos y Copias de Seguridad, Redes y Conectividad y Seguridad de la Información; **no los modifiques ni los dupliques**).
6. **Estado:** los servicios se insertan **activos / publicados**, visibles en el catálogo correspondiente (incidentes o solicitudes) con el contador de servicios de cada categoría actualizado.
7. **Validaciones antes de insertar:** `nombre` ≤ 120 caracteres y no vacío · SLA enteros > 0 y `sla_resolucion_horas` ≥ `sla_primera_respuesta_horas` · `costo_referencial` ≥ 0 con 2 decimales · `requiere_aprobacion` booleano · los incidentes siempre con `requiere_aprobacion = false` y costo 0.
8. **Cómo insertar:** mediante una **migración SQL o script de semilla idempotente y versionado** dentro de una sola transacción (todo o nada). No uses la interfaz. No cambies el esquema, salvo que falte una columna imprescindible (en ese caso repórtalo antes).
9. **Aprobaciones:** los servicios con `requiere_aprobacion = true` deben quedar con el flujo de aprobación por defecto del sistema (jefatura / Gestor de Área). Si el flujo requiere un aprobador configurado, usa el comportamiento que ya aplica el formulario al marcar esa casilla.
10. **Coherencia con la matriz de tiempos:** los SLA de los **incidentes** usan los pares de la "Matriz Institucional de Tiempos por Prioridad" de `1.2.4` (1 h/4 h, 2 h/8 h, 4 h/24 h, 8 h/72 h). Si el motor de SLA toma el tiempo desde la prioridad del ticket y no desde el servicio, esos valores del servicio son informativos; no cambies ese comportamiento.
11. **Al terminar**, entrega un informe breve con: servicios insertados (código, nombre, categoría), servicios omitidos por ya existir, advertencias, y el conteo final de servicios por categoría en ambos catálogos. Verifica que los contadores de las tarjetas del catálogo muestran los valores nuevos.
12. Los **valores de costo, SLA y aprobación son referenciales** y el Administrador podrá editarlos después desde la pantalla de servicios.

---

## 2. Distribución por categoría

| Catálogo | Categoría | Servicios nuevos |
|---|---|---|
| Solicitudes | Aprovisionamiento Cloud y Servidores | 2 |
| Solicitudes | Correo y Colaboración Empresarial | 2 |
| Solicitudes | Telefonía IP y Dispositivos Móviles | 2 |
| Solicitudes | Impresión y Consumibles | 2 |
| Solicitudes | Certificados Digitales y Firma Electrónica | 2 |
| Solicitudes | Capacitación y Asistencia al Usuario | 2 |
| Solicitudes | Datos y Copias de Seguridad | 1 |
| Solicitudes | Instalación de Software | 1 |
| Incidentes | Hardware y Equipos | 2 |
| Incidentes | Software y Aplicaciones | 2 |
| Incidentes | Infraestructura y Servidores | 2 |
| Incidentes | Bases de Datos y Almacenamiento | 2 |
| Incidentes | Telefonía y Comunicaciones Unificadas | 2 |
| Incidentes | Impresión y Periféricos | 2 |
| Incidentes | Correo y Colaboración Cloud | 2 |
| Incidentes | Servicios Cloud y DevOps | 2 |
| | **Total** | **30** |

---

## 3. Resumen de los 30 servicios

| # | Tipo | Categoría | Servicio | SLA (1.ª resp. / resolución) | Costo ref. (S/.) | Aprobación |
|---|---|---|---|---|---|---|
| 1 | Solicitud de servicio | Aprovisionamiento Cloud y Servidores | Creación de máquina virtual estándar | 4 h / 72 h | 0.00 | Sí |
| 2 | Solicitud de servicio | Aprovisionamiento Cloud y Servidores | Ampliación de recursos de servidor o máquina virtual (CPU, memoria o disco) | 4 h / 48 h | 0.00 | Sí |
| 3 | Solicitud de servicio | Correo y Colaboración Empresarial | Creación de buzón compartido de correo | 4 h / 24 h | 0.00 | Sí |
| 4 | Solicitud de servicio | Correo y Colaboración Empresarial | Alta de alias de correo electrónico | 4 h / 24 h | 0.00 | No |
| 5 | Solicitud de servicio | Telefonía IP y Dispositivos Móviles | Asignación de extensión telefónica IP | 8 h / 48 h | 0.00 | No |
| 6 | Solicitud de servicio | Telefonía IP y Dispositivos Móviles | Asignación de línea móvil corporativa con plan de datos | 8 h / 72 h | 80.00 | Sí |
| 7 | Solicitud de servicio | Impresión y Consumibles | Asignación de tarjeta de acceso a impresoras | 8 h / 24 h | 15.00 | No |
| 8 | Solicitud de servicio | Impresión y Consumibles | Solicitud de insumos y consumibles de impresión (tóner, tinta y papel) | 8 h / 48 h | 0.00 | No |
| 9 | Solicitud de servicio | Certificados Digitales y Firma Electrónica | Emisión de certificado SSL/TLS para sitio o aplicación | 8 h / 72 h | 350.00 | Sí |
| 10 | Solicitud de servicio | Certificados Digitales y Firma Electrónica | Emisión de token criptográfico y certificado de firma digital para funcionario | 8 h / 72 h | 220.00 | Sí |
| 11 | Solicitud de servicio | Capacitación y Asistencia al Usuario | Sesión de inducción en herramientas informáticas para nuevo ingreso | 8 h / 72 h | 0.00 | No |
| 12 | Solicitud de servicio | Capacitación y Asistencia al Usuario | Soporte guiado en el puesto de trabajo (acompañamiento presencial o remoto) | 8 h / 48 h | 0.00 | No |
| 13 | Solicitud de servicio | Datos y Copias de Seguridad | Respaldo extraordinario de información de equipo o carpeta | 8 h / 48 h | 0.00 | No |
| 14 | Solicitud de servicio | Instalación de Software | Instalación de software especializado con licencia (diseño, análisis o desarrollo) | 8 h / 72 h | 0.00 | Sí |
| 15 | Incidente | Hardware y Equipos | Laptop o computadora de escritorio no enciende o se reinicia sola | 2 h / 8 h | 0.00 | No |
| 16 | Incidente | Hardware y Equipos | Monitor, teclado, mouse o periférico de escritorio no funciona | 4 h / 24 h | 0.00 | No |
| 17 | Incidente | Software y Aplicaciones | Aplicación de negocio (ERP) lenta, con errores o sin respuesta | 2 h / 8 h | 0.00 | No |
| 18 | Incidente | Software y Aplicaciones | Software de escritorio se cierra inesperadamente o no abre | 4 h / 24 h | 0.00 | No |
| 19 | Incidente | Infraestructura y Servidores | Servidor físico o virtual caído o sin respuesta | 1 h / 4 h | 0.00 | No |
| 20 | Incidente | Infraestructura y Servidores | Alarma de recursos críticos en servidor (CPU, memoria o disco al límite) | 2 h / 8 h | 0.00 | No |
| 21 | Incidente | Bases de Datos y Almacenamiento | Base de datos no disponible, con bloqueos o consultas muy lentas | 1 h / 4 h | 0.00 | No |
| 22 | Incidente | Bases de Datos y Almacenamiento | Cuota de disco o almacenamiento compartido agotada | 2 h / 8 h | 0.00 | No |
| 23 | Incidente | Telefonía y Comunicaciones Unificadas | Caída de la central telefónica IP o sin tono de llamada | 1 h / 4 h | 0.00 | No |
| 24 | Incidente | Telefonía y Comunicaciones Unificadas | Fallas de audio o conexión en plataforma de videoconferencia | 4 h / 24 h | 0.00 | No |
| 25 | Incidente | Impresión y Periféricos | Impresora departamental atascada o sin imprimir | 4 h / 24 h | 0.00 | No |
| 26 | Incidente | Impresión y Periféricos | Escáner o multifuncional no digitaliza o no envía a correo | 8 h / 72 h | 0.00 | No |
| 27 | Incidente | Correo y Colaboración Cloud | No se envían o reciben correos corporativos | 2 h / 8 h | 0.00 | No |
| 28 | Incidente | Correo y Colaboración Cloud | Calendario o buzón no sincroniza en celular o en el cliente de correo | 4 h / 24 h | 0.00 | No |
| 29 | Incidente | Servicios Cloud y DevOps | Servicio alojado en la nube inaccesible o con degradación | 1 h / 4 h | 0.00 | No |
| 30 | Incidente | Servicios Cloud y DevOps | Falla en pipeline de integración y despliegue continuo (CI/CD) | 4 h / 24 h | 0.00 | No |

---

## 4. Datos completos (JSON para insertar)

```json
[
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Aprovisionamiento Cloud y Servidores",
    "nombre": "Creación de máquina virtual estándar",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 72,
    "costo_referencial": 0.0,
    "entregable_oficial": "Máquina virtual creada, con sistema operativo base, red y accesos entregados, registrada en la CMDB y validada por el solicitante mediante acta de conformidad.",
    "descripcion_comercial": "Incluye: creación de una máquina virtual de hasta 4 vCPU, 8 GB de RAM y 100 GB de disco, sistema operativo base licenciado, configuración de red, endurecimiento básico (hardening), alta en monitoreo y registro en la CMDB. No incluye: instalación de aplicaciones, licencias de software de terceros ni respaldos adicionales.",
    "requiere_aprobacion": true
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Aprovisionamiento Cloud y Servidores",
    "nombre": "Ampliación de recursos de servidor o máquina virtual (CPU, memoria o disco)",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 48,
    "costo_referencial": 0.0,
    "entregable_oficial": "Recursos ampliados y verificados por el solicitante, con la CMDB actualizada y evidencia del antes y después.",
    "descripcion_comercial": "Incluye: ampliación de vCPU, memoria RAM o almacenamiento de un servidor o máquina virtual existente, con validación de capacidad disponible. No incluye: migración de servicios, cambios de arquitectura ni compra de hardware nuevo.",
    "requiere_aprobacion": true
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Correo y Colaboración Empresarial",
    "nombre": "Creación de buzón compartido de correo",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 24,
    "costo_referencial": 0.0,
    "entregable_oficial": "Buzón compartido creado, con los permisos de acceso solicitados y confirmación escrita del responsable del buzón.",
    "descripcion_comercial": "Incluye: creación del buzón compartido, asignación de miembros con permisos de lectura, envío en nombre de o control total según se indique, y firma institucional opcional. No incluye: migración de correos antiguos ni capacitación en el uso del buzón.",
    "requiere_aprobacion": true
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Correo y Colaboración Empresarial",
    "nombre": "Alta de alias de correo electrónico",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 24,
    "costo_referencial": 0.0,
    "entregable_oficial": "Alias de correo creado y probado con envío y recepción, con confirmación del solicitante.",
    "descripcion_comercial": "Incluye: creación de un alias asociado a un buzón existente y prueba de entrega. No incluye: creación de buzones nuevos ni cambios de dominio.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Telefonía IP y Dispositivos Móviles",
    "nombre": "Asignación de extensión telefónica IP",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 48,
    "costo_referencial": 0.0,
    "entregable_oficial": "Extensión IP asignada, configurada en el teléfono o softphone, con llamada de prueba exitosa y directorio telefónico actualizado.",
    "descripcion_comercial": "Incluye: asignación de número de extensión, configuración SIP del equipo o aplicación, buzón de voz básico y actualización del directorio. No incluye: entrega de teléfono físico nuevo (se solicita como equipamiento) ni líneas externas directas.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Telefonía IP y Dispositivos Móviles",
    "nombre": "Asignación de línea móvil corporativa con plan de datos",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 72,
    "costo_referencial": 80.0,
    "entregable_oficial": "Línea móvil activa con plan de datos asignada al funcionario, con acta de entrega firmada y registro en el inventario de activos. El costo referencial corresponde al plan mensual.",
    "descripcion_comercial": "Incluye: activación de línea y plan corporativo, configuración inicial del equipo, registro de custodia y política de uso. No incluye: compra del equipo celular, accesorios ni servicios de roaming internacional.",
    "requiere_aprobacion": true
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Impresión y Consumibles",
    "nombre": "Asignación de tarjeta de acceso a impresoras",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 24,
    "costo_referencial": 15.0,
    "entregable_oficial": "Tarjeta de acceso entregada y registrada a nombre del usuario, con impresión de prueba exitosa en las impresoras autorizadas.",
    "descripcion_comercial": "Incluye: entrega y registro de la tarjeta, vinculación con el usuario en el servidor de impresión y acceso a las impresoras de su departamento. No incluye: reposición por pérdida (se tramita como nueva solicitud) ni impresoras de otras áreas.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Impresión y Consumibles",
    "nombre": "Solicitud de insumos y consumibles de impresión (tóner, tinta y papel)",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 48,
    "costo_referencial": 0.0,
    "entregable_oficial": "Insumos entregados en el área solicitante con acta de recepción y descuento del stock registrado.",
    "descripcion_comercial": "Incluye: entrega de tóner, tinta o papel según el modelo de impresora del área y verificación de compatibilidad. No incluye: reparación de impresoras ni compra de impresoras nuevas.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Certificados Digitales y Firma Electrónica",
    "nombre": "Emisión de certificado SSL/TLS para sitio o aplicación",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 72,
    "costo_referencial": 350.0,
    "entregable_oficial": "Certificado SSL/TLS emitido, instalado en el servicio indicado y validado con una prueba de acceso seguro, con fecha de vencimiento registrada.",
    "descripcion_comercial": "Incluye: generación de la solicitud de firma (CSR), gestión con la entidad certificadora, instalación y verificación del certificado y registro de vencimiento para su renovación. No incluye: registro o renovación de dominios ni configuración de aplicaciones ajenas al certificado.",
    "requiere_aprobacion": true
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Certificados Digitales y Firma Electrónica",
    "nombre": "Emisión de token criptográfico y certificado de firma digital para funcionario",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 72,
    "costo_referencial": 220.0,
    "entregable_oficial": "Token criptográfico entregado con certificado de firma digital habilitado, acta de entrega firmada y prueba de firma exitosa. El plazo de la entidad certificadora se gestiona como tiempo de espera.",
    "descripcion_comercial": "Incluye: validación de identidad y autorización del funcionario, trámite ante la entidad certificadora, entrega del token, instalación del controlador y prueba de firma. No incluye: renovación anticipada, reposición por pérdida ni firma masiva de documentos.",
    "requiere_aprobacion": true
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Capacitación y Asistencia al Usuario",
    "nombre": "Sesión de inducción en herramientas informáticas para nuevo ingreso",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 72,
    "costo_referencial": 0.0,
    "entregable_oficial": "Sesión realizada con registro de asistencia y confirmación del participante de haber recibido accesos y guías de uso.",
    "descripcion_comercial": "Incluye: sesión de hasta 90 minutos sobre correo, mensajería, VPN, sistema de tickets y buenas prácticas de seguridad, con material de apoyo. No incluye: capacitación en sistemas específicos del área ni cursos certificados.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Capacitación y Asistencia al Usuario",
    "nombre": "Soporte guiado en el puesto de trabajo (acompañamiento presencial o remoto)",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 48,
    "costo_referencial": 0.0,
    "entregable_oficial": "Acompañamiento realizado y confirmado por el usuario, con las dudas resueltas y los puntos tratados registrados en el ticket.",
    "descripcion_comercial": "Incluye: sesión individual de hasta 60 minutos para resolver dudas de uso de herramientas informáticas autorizadas. No incluye: resolución de fallas técnicas (se reporta como incidente) ni capacitación grupal.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Datos y Copias de Seguridad",
    "nombre": "Respaldo extraordinario de información de equipo o carpeta",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 48,
    "costo_referencial": 0.0,
    "entregable_oficial": "Respaldo completado y verificado por muestreo, con ubicación y fecha de retención informadas al solicitante.",
    "descripcion_comercial": "Incluye: copia de seguridad puntual de carpetas o del perfil de un equipo antes de un formateo, cambio de equipo o proceso crítico, con verificación de integridad. No incluye: respaldos periódicos programados ni respaldo de información personal no laboral.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Solicitud de servicio",
    "categoria_funcional": "Instalación de Software",
    "nombre": "Instalación de software especializado con licencia (diseño, análisis o desarrollo)",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 72,
    "costo_referencial": 0.0,
    "entregable_oficial": "Software instalado, activado con licencia válida y probado por el usuario, con la licencia asociada al equipo y registrada en el inventario. El costo de licencia se cotiza aparte.",
    "descripcion_comercial": "Incluye: validación de disponibilidad de licencia, instalación, activación, configuración básica y registro en el inventario de software. No incluye: compra de licencias nuevas ni capacitación en el uso del programa.",
    "requiere_aprobacion": true
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Hardware y Equipos",
    "nombre": "Laptop o computadora de escritorio no enciende o se reinicia sola",
    "sla_primera_respuesta_horas": 2,
    "sla_resolucion_horas": 8,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de equipos que no encienden, no cargan, no inician el sistema o se apagan o reinician solos. Indique código del equipo, qué ocurrió justo antes de la falla y si hay mensajes o luces en pantalla. Incluye diagnóstico y restablecimiento o reemplazo temporal. No incluye: compra de equipos nuevos.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Hardware y Equipos",
    "nombre": "Monitor, teclado, mouse o periférico de escritorio no funciona",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 24,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de fallas en monitores, teclados, mouse, cámaras web, diademas u otros periféricos conectados al equipo. Indique el modelo y si el problema ocurre en otro puerto o equipo. Incluye diagnóstico, ajuste, reemplazo del periférico si existe stock. No incluye: reparación de daños por mal uso fuera de garantía.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Software y Aplicaciones",
    "nombre": "Aplicación de negocio (ERP) lenta, con errores o sin respuesta",
    "sla_primera_respuesta_horas": 2,
    "sla_resolucion_horas": 8,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de lentitud severa, mensajes de error, cuelgues o indisponibilidad del sistema ERP u otra aplicación de negocio. Indique módulo, hora y duración, mensaje o código de error y cuántos usuarios están afectados. Incluye diagnóstico, restablecimiento y escalamiento al proveedor. No incluye: nuevos requerimientos funcionales.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Software y Aplicaciones",
    "nombre": "Software de escritorio se cierra inesperadamente o no abre",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 24,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de programas de ofimática, navegadores o software instalado que se cierran solos, no abren o muestran errores al iniciar. Indique nombre y versión del programa y el mensaje de error. Incluye reparación, reinstalación o ajuste de configuración. No incluye: instalación de software nuevo (se solicita en el catálogo de solicitudes).",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Infraestructura y Servidores",
    "nombre": "Servidor físico o virtual caído o sin respuesta",
    "sla_primera_respuesta_horas": 1,
    "sla_resolucion_horas": 4,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de servidores que no responden, no inician o están fuera de servicio, con afectación de aplicaciones o usuarios. Indique nombre del servidor, servicios afectados y hora de inicio. Incluye diagnóstico, restablecimiento y escalamiento a proveedor. No incluye: ampliaciones de capacidad (se solicitan como servicio).",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Infraestructura y Servidores",
    "nombre": "Alarma de recursos críticos en servidor (CPU, memoria o disco al límite)",
    "sla_primera_respuesta_horas": 2,
    "sla_resolucion_horas": 8,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de alertas o degradación por uso excesivo de CPU, memoria o espacio en disco en servidores. Indique el servidor, el recurso afectado y el porcentaje de uso. Incluye liberación de recursos, ajustes inmediatos y recomendación de ampliación. No incluye: la ampliación definitiva, que se tramita como solicitud.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Bases de Datos y Almacenamiento",
    "nombre": "Base de datos no disponible, con bloqueos o consultas muy lentas",
    "sla_primera_respuesta_horas": 1,
    "sla_resolucion_horas": 4,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de indisponibilidad, bloqueos, errores de conexión o lentitud severa en bases de datos. Indique el sistema, la base de datos, el mensaje de error y la hora de inicio. Incluye diagnóstico, restablecimiento y escalamiento al administrador de la base de datos. No incluye: consultas o reportes nuevos.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Bases de Datos y Almacenamiento",
    "nombre": "Cuota de disco o almacenamiento compartido agotada",
    "sla_primera_respuesta_horas": 2,
    "sla_resolucion_horas": 8,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de falta de espacio en carpetas compartidas, discos de servidor o almacenamiento SAN que impide guardar o procesar información. Indique la ruta o el volumen y el mensaje recibido. Incluye liberación de espacio y ajuste temporal de cuota. No incluye: ampliaciones permanentes (se solicitan como servicio).",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Telefonía y Comunicaciones Unificadas",
    "nombre": "Caída de la central telefónica IP o sin tono de llamada",
    "sla_primera_respuesta_horas": 1,
    "sla_resolucion_horas": 4,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de pérdida total o parcial de telefonía: sin tono, llamadas que se cortan o teléfonos desregistrados. Indique extensiones y áreas afectadas. Incluye diagnóstico de la central, la red de voz y los teléfonos, y escalamiento al proveedor de telefonía. No incluye: altas de nuevas extensiones.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Telefonía y Comunicaciones Unificadas",
    "nombre": "Fallas de audio o conexión en plataforma de videoconferencia",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 24,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de cortes de audio, video, imposibilidad de ingresar a reuniones o fallas de diademas y cámaras en la plataforma de videoconferencia. Indique la plataforma, la hora y si ocurre en un solo equipo o en varios. Incluye diagnóstico y corrección de configuración. No incluye: organización técnica de eventos.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Impresión y Periféricos",
    "nombre": "Impresora departamental atascada o sin imprimir",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 24,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de atascos de papel, cola de impresión detenida, impresiones con manchas o impresora fuera de línea. Indique el modelo o la ubicación de la impresora y el mensaje del panel. Incluye diagnóstico, limpieza, reinicio del servicio de impresión y reposición de insumos si hay stock. No incluye: compra de impresoras nuevas.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Impresión y Periféricos",
    "nombre": "Escáner o multifuncional no digitaliza o no envía a correo",
    "sla_primera_respuesta_horas": 8,
    "sla_resolucion_horas": 72,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de escáneres o multifuncionales que no digitalizan, no envían a correo o a carpeta de red. Indique modelo, ubicación y mensaje de error. Incluye revisión de configuración, credenciales y conectividad. No incluye: instalación de software de digitalización avanzado.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Correo y Colaboración Cloud",
    "nombre": "No se envían o reciben correos corporativos",
    "sla_primera_respuesta_horas": 2,
    "sla_resolucion_horas": 8,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de imposibilidad de enviar o recibir correo, rebotes o retrasos importantes. Indique la cuenta afectada, el mensaje de error y si ocurre con destinatarios internos, externos o ambos. Incluye diagnóstico del buzón, del cliente y del servicio y escalamiento al proveedor. No incluye: recuperación de correos eliminados hace más de 30 días.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Correo y Colaboración Cloud",
    "nombre": "Calendario o buzón no sincroniza en celular o en el cliente de correo",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 24,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de calendario, contactos o correos que no sincronizan en el celular, la aplicación de escritorio o el navegador. Indique el dispositivo, el cliente y desde cuándo ocurre. Incluye reconfiguración del perfil y de la cuenta. No incluye: configuración de cuentas personales.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Servicios Cloud y DevOps",
    "nombre": "Servicio alojado en la nube inaccesible o con degradación",
    "sla_primera_respuesta_horas": 1,
    "sla_resolucion_horas": 4,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de aplicaciones, sitios o servicios alojados en la nube que no responden o están degradados. Indique el servicio, la URL, el mensaje de error y los usuarios afectados. Incluye diagnóstico, restablecimiento y escalamiento al proveedor cloud. No incluye: rediseño de arquitectura.",
    "requiere_aprobacion": false
  },
  {
    "tipo_itil": "Incidente",
    "categoria_funcional": "Servicios Cloud y DevOps",
    "nombre": "Falla en pipeline de integración y despliegue continuo (CI/CD)",
    "sla_primera_respuesta_horas": 4,
    "sla_resolucion_horas": 24,
    "costo_referencial": 0.0,
    "entregable_oficial": "Servicio restablecido y confirmado por el usuario, con causa y solución aplicada registradas en el ticket.",
    "descripcion_comercial": "Reporte de pipelines que fallan, se quedan detenidos o no despliegan. Indique el repositorio, el pipeline, el paso donde falla y el registro del error. Incluye diagnóstico, corrección de configuración o credenciales y reejecución. No incluye: desarrollo de nuevos pipelines.",
    "requiere_aprobacion": false
  }
]
```
