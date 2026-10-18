# MANUAL TECNICO INTEGRAL, ARQUITECTURA DE SOFTWARE Y DICCIONARIO DE CODIGO
## FLOWDESK SOFTWARE ITSM - SISTEMA DE GESTION DE SERVICIOS TI BASADO EN ITIL v4

---

### FICHA DE IDENTIFICACION Y METADATOS DEL PROYECTO
* **Nombre Oficial del Software**: FlowDesk Software ITSM
* **Version de la Plataforma**: 1.0.0 Enterprise Ready
* **Repositorio Oficial de Codigo**: https://github.com/Azure-2312/FlowDesk-Software-ITSM.git
* **Rama de Produccion**: main
* **Fecha de Compilacion**: Octubre 2026
* **Estandar de Arquitectura de Software**: Next.js 14 App Router con React Server Components y Client Components
* **Estandar de Tipado**: TypeScript 5.x Strict Mode
* **Motor de Base de Datos**: PostgreSQL 15 / Supabase Cloud Enterprise
* **Framework de Buenas Practicas de TI**: ITIL v4 (Information Technology Infrastructure Library Version 4)
* **Normas Internacionales Complementarias**: ISO/IEC 20000-1:2018 (Gestion de Servicios), ISO/IEC 27001:2022 (Seguridad de la Informacion)
* **Destinatarios del Documento**: Arquitectos de Software, Ingenieros de Desarrollo, Administradores de Base de Datos, Gestores de Servicio ITSM, Auditores de Seguridad y Modelos de Inteligencia Artificial de Asistencia de Codigo.

---

## CAPITULO 1: VISION GENERAL, OBJETIVOS Y MARCO CONCEPTUAL ITIL v4

### 1.1 Proposito del Sistema
FlowDesk Software ITSM es una solucion integral disenada para orquestar la totalidad del ciclo de vida de los servicios de tecnologias de la informacion dentro de organizaciones empresariales modernas.
El sistema unifica bajo una misma plataforma el soporte al usuario final, la resolucion tecnica de incidentes, la administracion de requerimientos y solicitudes estandarizadas, el diagnostico profundo de causas raiz de problemas, la gobernanza de cambios tecnologicos, la base de datos de configuracion (CMDB), el control de activos de hardware y software (ITAM), la medicion estricta de Acuerdos de Nivel de Servicio (SLA) y la retroalimentacion continua mediante encuestas de satisfaccion.
El software ha sido concebido desde sus cimientos para erradicar las ineficiencias de la comunicacion desestructurada por correo electronico o mensajeria instantanea, canalizando todas las interacciones a traves de flujos de trabajo trazables, auditables y medibles segun las mejores practicas internacionales.

### 1.2 La Cadena de Valor del Servicio (SVS) en FlowDesk
El diseno arquitectonico del software refleja con total fidelidad la Cadena de Valor del Servicio propuesta por ITIL v4:
1. **Planear (Plan)**:
   FlowDesk proporciona modulos de planificacion estrategica que incluyen la definicion de matrices de criticidad y prioridad (Urgencia vs Impacto), la configuracion de calendarios operativos tecnicos, la parametrizacion de ventanas de congelamiento (Freeze Periods) y el establecimiento de metas cuantitativas de disponibilidad y cumplimiento de niveles de servicio.
   Permite a los directores de tecnologia proyectar capacidades, prever cuellos de botella y justificar presupuestos mediante datos de demanda real.
2. **Mejorar (Improve)**:
   A traves del modulo de Gestion de Problemas y la Base de Datos de Errores Conocidos (KEDB), la plataforma analiza tendencias de incidentes recurrentes, captura soluciones temporales (Workarounds) y retroalimenta al equipo de desarrollo e infraestructura para mitigar la deuda tecnica.
   Asimismo, el modulo de encuestas CSAT y los indicadores de desempeno del personal alimentan ciclos continuos de optimizacion de procesos bajo la filosofia Kaizen.
3. **Involucrar (Engage)**:
   El portal de autoservicio para solicitantes ofrece un canal amigable y estructurado para reportar fallas y solicitar servicios. Las alertas tempranas, el chat interactivo en tiempo real entre el usuario y el resolutor, y las notificaciones automaticas por correo electronico garantizan una comunicacion transparente y constante durante todo el ciclo de atencion.
4. **Disenar y Transicionar (Design and Transition)**:
   La gestion formal de Solicitudes de Cambio (RFC) somete cualquier modificacion sustancial en la infraestructura a una rigurosa evaluacion de impacto, analisis de riesgos, aprobacion colegiada del Comite Asesor de Cambios (CAB), planes obligatorios de marcha atras (Rollback) y segregacion estricta de funciones (SoD).
5. **Obtener y Construir (Obtain/Build)**:
   La integracion con el inventario de activos de hardware, licencias de software y proveedores de tecnologia asegura que los recursos necesarios para resolver incidentes o entregar solicitudes esten plenamente identificados, inventariados y trazados.
6. **Entregar y Soportar (Deliver and Support)**:
   La Mesa de Ayuda tecnica (Service Desk) canaliza el flujo diario de tickets. Temporizadores visuales en tiempo real controlan el consumo de horas respecto al SLA de primera respuesta y resolucion total, priorizando la atencion segun criterios objetivos de impacto institucional.

### 1.3 Las Cuatro Dimensiones de la Gestion de Servicios en el Codigo
* **Dimension 1: Organizaciones y Personas**: Implementada en la arquitectura de roles y perfiles RBAC (`usuario`, `perfil`, `usuario_perfil`, `departamento_ti`, `departamento_empresa`), gestionando identidades, competencias tecnicas y horarios de atencion.
* **Dimension 2: Informacion y Tecnologia**: Implementada en la CMDB (`elemento_configuracion`), el catalogo de KEDB (`problema`), la base de conocimiento KCS (`articulo_conocimiento`) y el registro inmutable de auditoria (`ticket_historial`).
* **Dimension 3: Socios y Proveedores**: Implementada en la tabla `proveedor` y los contratos OLA asociados a los servicios del catalogo.
* **Dimension 4: Flujos de Valor y Procesos**: Implementada en las maquinas de estado y controladores de `ticket`, `problema`, `cambio_rfc` y sus workflows asociados.

## CAPITULO 2: ARQUITECTURA TECNOLOGICA, STACK Y PATRONES DE DISENO

### 2.1 Pila Tecnologica (Tech Stack)
* **Runtime de Ejecucion**: Node.js v18.18.0+ / Node.js v20 LTS.
* **Framework Web**: Next.js 14.2.x (utilizando App Router).
* **Libreria de Componentes de Interfaz**: React 18.x.
* **Lenguaje de Programacion**: TypeScript 5.x con tipado estricto habilitado (`strict: true`, `noImplicitAny: true`).
* **Motor de Persistencia**: PostgreSQL 15 alojado en infraestructura Supabase.
* **Cliente de Acceso a Base de Datos**: Libreria nativa `pg` (`node-postgres`) configurada con connection pooling.
* **Gestion de Sesiones y Cifrado**: Cifrado simetrico y firmado de tokens JSON Web Tokens (JWT) con algoritmo HS256 (`jsonwebtoken`), con hash de contraseñas mediante `bcryptjs` (10 rondas de salt).
* **Servicio de Envio de Correos**: Nodemailer configurado con transporte SMTP seguro para Google Gmail.
* **Estilos y Maquetacion**: CSS modular nativo encapsulado en `src/app/globals.css` y estilos en linea reactivos de alto desempeno.

### 2.2 Patrones Arquitectonicos Aplicados
1. **App Router & Server/Client Boundaries**:
   El sistema separa estrictamente los componentes que corren en el servidor de aquellos que se ejecutan en el navegador. Las paginas contenedoras delegan el renderizado interactivo en componentes cliente marcados con `"use client";`, lo que permite un renderizado inicial ultrarrapido (SSR) mientras se preserva una rica reactividad para formularios dinamicos, selectores y temporizadores.
2. **Singleton Connection Pooling (`src/lib/db.ts`)**:
   Para evitar el agotamiento de sockets en entornos Serverless y en desarrollo local con Fast Refresh, el pool de PostgreSQL se almacena en el objeto global de Node.js (`globalThis.dbPool`).
3. **Stateless Authentication via Secure HTTP-Only Cookies**:
   Las sesiones no requieren almacenamiento en memoria en el servidor. La cookie `sesion_tickets` contiene el payload firmado y cifrado del usuario autenticado, verificable en cada peticion mediante el middleware o en los Route Handlers.
4. **Role-Based Access Control (RBAC) con Multi-Perfil Activo**:
   Un usuario puede ostentar multiples roles simultaneos. La sesion activa opera bajo un perfil seleccionado (`perfilActivo`), el cual condiciona la visibilidad de rutas en el middleware, el arbol de navegacion del menu y las politicas de ejecucion en las APIs.
5. **Validacion Reactiva en Capa Doble (Cliente y Servidor)**:
   Todas las entradas de usuario se validan reactivamente en el cliente conforme se escribe o se abandona un campo (`onBlur`), y se vuelven a evaluar con las mismas funciones puras en el servidor (`src/lib/validaciones.ts`) antes de emitir cualquier sentencia SQL.
6. **Inmutabilidad de Auditoria (Audit Trail)**:
   Toda transaccion critica (creacion, cambio de estado, asignacion, modificacion de SLA, cancelacion) emite un registro inmutable en `ticket_historial` o en la tabla de logs de seguridad, asegurando trazabilidad forense completa.

## CAPITULO 3: SEGURIDAD, AUTENTICACION Y CONTROL DE ACCESO

### 3.1 Flujo de Autenticacion y Login
El punto de entrada al sistema se localiza en `src/app/login/page.tsx` y se procesa en `POST /api/auth/login`.
El procedimiento sigue los siguientes pasos rigurosos:
1. **Recepcion de Payload**: Se reciben los campos `correo`, `password` y `captchaRespuesta`.
2. **Validacion de Desafio Captcha**: Se comprueba el resultado matematico contra la cookie temporal cifrada emitida por `/api/auth/captcha`. Si no coincide, se deniega la peticion inmediatamente sin consultar la base de datos.
3. **Validacion de Dominio de Correo**:
   * El sistema verifica que el dominio del correo corresponda al dominio institucional configurado en la empresa.
   * **Excepcion Maestra Unica**: Se permite exclusivamente al superusuario `apazamiguel88@gmail.com` iniciar sesion con un dominio publico externo.
4. **Evaluacion de Estado de Bloqueo**: Se comprueba si la columna `cuenta_bloqueada` en la tabla `usuario` es verdadera. Si esta bloqueada, se rechaza el acceso solicitando desbloqueo administrativo.
5. **Verificacion Criptografica de Contrasena**: Se compara la clave ingresada contra `password_hash` mediante `bcrypt.compare`.
   * Si la contrasena es incorrecta: Se incrementa el campo `intentos_fallidos`. Si alcanza 5 fallos, se marca `cuenta_bloqueada = true`.
   * Si la contrasena es correcta: Se resetea `intentos_fallidos = 0`.
6. **Consulta de Perfiles Asignados**: Se consultan todos los registros asociados en `usuario_perfil`.
7. **Emision de Token JWT**:
   * Si el usuario tiene exactamente un perfil, se establece dicho perfil como `perfilActivo`.
   * Si tiene multiples perfiles, se le presenta la pantalla de seleccion inicial.
   * Se genera el token JWT y se emite la cookie `sesion_tickets` con opciones de maxima seguridad.

### 3.2 Los Cinco Perfiles del Sistema y su Matriz de Autorizacion

| Perfil ID | Nombre Oficial | Codigo | Descripcion de Privilegios | Rutas Permitidas |
|:---|:---|:---|:---|:---|
| 1 | Administrador | ADMIN | Control maestro del sistema, seguridad, configuracion de catalogos, SLAs, CMDB, KEDB y roles | `/admin/*`, `/tickets/*`, `/cambios/*`, `/problemas/*`, `/activos/*`, `/dashboard` |
| 2 | Tecnico / Especialista | TECNICO | Atencion y resolucion operativa de tickets asignados, cola de mesa, registro de CIs y ejecucion de cambios | `/plataforma/perfiles/tecnico/*`, `/tickets/*`, `/problemas/*`, `/cambios/*`, `/activos/*`, `/dashboard` |
| 3 | Solicitante / Consumidor | SOLICITANTE | Portal de autoservicio, catalogo interactivo de servicios, creacion de incidentes y solicitudes, seguimiento | `/tickets/catalogo`, `/tickets/gestion/crear`, `/tickets/gestion/mios`, `/mi-cuenta` |
| 4 | Supervisor de Mesa | SUPERVISOR | Supervision de colas de trabajo, aprobacion de cambios RFC/CAB, autorizacion de solicitudes SoD, auditoria | `/tickets/gestion/*`, `/cambios/gestion/cab`, `/reportes/*`, `/dashboard` |
| 5 | Auditor de Calidad | AUDITOR | Auditoria forense de solo lectura a registros inmutables, historiales de tickets, matriz de trazabilidad y logs | `/admin/auditoria-sistema`, `/admin/seguridad-logs`, `/tickets/gestion/auditoria` |

## CAPITULO 4: DICCIONARIO COMPLETO DE BASE DE DATOS Y MODELO ENTIDAD-RELACION

A continuacion se presenta la especificacion tecnica exhaustiva de todas las 77 tablas registradas en el esquema de la base de datos de PostgreSQL:

### 4.1 Tabla: `usuario`
* **Nombre de Entidad**: `usuario`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de usuario.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_usuario` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_usuario para control de la entidad |
| `dni` | `VARCHAR(15) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo dni para control de la entidad |
| `nombres` | `VARCHAR(40) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombres para control de la entidad |
| `apellido_paterno` | `VARCHAR(40) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo apellido_paterno para control de la entidad |
| `apellido_materno` | `VARCHAR(40)` | Estandar | Registro de atributo apellido_materno para control de la entidad |
| `celular` | `VARCHAR(15)` | Estandar | Registro de atributo celular para control de la entidad |
| `correo_personal` | `VARCHAR(100)` | Estandar | Registro de atributo correo_personal para control de la entidad |
| `correo_electronico` | `VARCHAR(40) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo correo_electronico para control de la entidad |
| `clave` | `VARCHAR(255) NOT NULL, -- se guarda HASHEADA (bcrypt), nunca en texto plano` | Obligatorio (NOT NULL) | Registro de atributo clave para control de la entidad |
| `intentos_fallidos` | `SMALLINT NOT NULL DEFAULT 0, -- para bloqueo por intentos fallidos` | Obligatorio (NOT NULL) | Registro de atributo intentos_fallidos para control de la entidad |
| `bloqueado_hasta` | `TIMESTAMP, -- null = no bloqueado` | Estandar | Registro de atributo bloqueado_hasta para control de la entidad |
| `cuenta_bloqueada` | `BOOLEAN NOT NULL DEFAULT false, -- bloqueo definitivo por fuerza bruta (3 intentos)` | Obligatorio (NOT NULL) | Registro de atributo cuenta_bloqueada para control de la entidad |
| `usuario_creacion` | `INT` | Estandar | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMP NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |
| `usuario_modificacion` | `INT` | Estandar | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMP` | Estandar | Registro de atributo fecha_modificacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true -- soft delete: activo/inactivo` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `usuario` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.2 Tabla: `perfiles`
* **Nombre de Entidad**: `perfiles`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de perfiles.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_perfil` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_perfil para control de la entidad |
| `nombre` | `VARCHAR(50) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `VARCHAR(500)` | Estandar | Registro de atributo descripcion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `perfiles` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.3 Tabla: `opciones_menu`
* **Nombre de Entidad**: `opciones_menu`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de opciones menu.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_opcion_menu` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_opcion_menu para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `url_menu` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo url_menu para control de la entidad |
| `descripcion` | `VARCHAR(150)` | Estandar | Registro de atributo descripcion para control de la entidad |
| `id_padre` | `INT REFERENCES opciones_menu(id_opcion_menu)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_padre para control de la entidad |
| `nivel` | `SMALLINT NOT NULL DEFAULT 1 CHECK (nivel BETWEEN 1 AND 5)` | Obligatorio (NOT NULL) | Registro de atributo nivel para control de la entidad |
| `orden` | `SMALLINT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `opciones_menu` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.4 Tabla: `usuario_perfiles`
* **Nombre de Entidad**: `usuario_perfiles`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de usuario perfiles.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_usuario` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario para control de la entidad |
| `id_perfil` | `INT NOT NULL REFERENCES perfiles(id_perfil)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_perfil para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |
| `PRIMARY` | `KEY (id_usuario, id_perfil)` | Estandar | Registro de atributo PRIMARY para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `usuario_perfiles` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.5 Tabla: `opciones_menu_perfiles`
* **Nombre de Entidad**: `opciones_menu_perfiles`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de opciones menu perfiles.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_opcion_menu` | `INT NOT NULL REFERENCES opciones_menu(id_opcion_menu)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_opcion_menu para control de la entidad |
| `id_perfil` | `INT NOT NULL REFERENCES perfiles(id_perfil)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_perfil para control de la entidad |
| `orden` | `SMALLINT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |
| `PRIMARY` | `KEY (id_opcion_menu, id_perfil)` | Estandar | Registro de atributo PRIMARY para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `opciones_menu_perfiles` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.6 Tabla: `log_acceso`
* **Nombre de Entidad**: `log_acceso`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de log acceso.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_log` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_log para control de la entidad |
| `id_usuario` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario para control de la entidad |
| `correo_intento` | `VARCHAR(40)` | Estandar | Registro de atributo correo_intento para control de la entidad |
| `exitoso` | `BOOLEAN NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo exitoso para control de la entidad |
| `ip` | `VARCHAR(45)` | Estandar | Registro de atributo ip para control de la entidad |
| `fecha` | `TIMESTAMP NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `log_acceso` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.7 Tabla: `tipo_ticket`
* **Nombre de Entidad**: `tipo_ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de tipo ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_tipo_ticket` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_tipo_ticket para control de la entidad |
| `codigo` | `VARCHAR(20) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(50) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `VARCHAR(250) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo descripcion para control de la entidad |
| `prefijo_codigo` | `VARCHAR(5) NOT NULL, -- INC o REQ` | Obligatorio (NOT NULL) | Registro de atributo prefijo_codigo para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `tipo_ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.8 Tabla: `impacto_ticket`
* **Nombre de Entidad**: `impacto_ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de impacto ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_impacto` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_impacto para control de la entidad |
| `nivel` | `SMALLINT UNIQUE NOT NULL, -- 1=Bajo, 2=Medio, 3=Alto` | Restriccion de Unicidad (UNIQUE) | Registro de atributo nivel para control de la entidad |
| `nombre` | `VARCHAR(30) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `VARCHAR(200) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo descripcion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `impacto_ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.9 Tabla: `urgencia_ticket`
* **Nombre de Entidad**: `urgencia_ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de urgencia ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_urgencia` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_urgencia para control de la entidad |
| `nivel` | `SMALLINT UNIQUE NOT NULL, -- 1=Baja, 2=Media, 3=Alta` | Restriccion de Unicidad (UNIQUE) | Registro de atributo nivel para control de la entidad |
| `nombre` | `VARCHAR(30) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `VARCHAR(200) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo descripcion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `urgencia_ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.10 Tabla: `prioridad_ticket`
* **Nombre de Entidad**: `prioridad_ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de prioridad ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_prioridad` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_prioridad para control de la entidad |
| `codigo` | `VARCHAR(10) UNIQUE NOT NULL, -- P1, P2, P3, P4` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(30) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `nivel` | `SMALLINT UNIQUE NOT NULL, -- 1=Crítica .. 4=Baja` | Restriccion de Unicidad (UNIQUE) | Registro de atributo nivel para control de la entidad |
| `tiempo_resolucion_horas` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tiempo_resolucion_horas para control de la entidad |
| `tiempo_primera_respuesta_hrs` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tiempo_primera_respuesta_hrs para control de la entidad |
| `color` | `VARCHAR(20) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo color para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `prioridad_ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.11 Tabla: `estado_ticket`
* **Nombre de Entidad**: `estado_ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de estado ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_estado` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_estado para control de la entidad |
| `codigo` | `VARCHAR(20) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(30) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `orden` | `SMALLINT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `es_terminal` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_terminal para control de la entidad |
| `pausa_sla` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo pausa_sla para control de la entidad |
| `color` | `VARCHAR(20) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo color para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `estado_ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.12 Tabla: `motivo_espera_ticket`
* **Nombre de Entidad**: `motivo_espera_ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de motivo espera ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_motivo_espera` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_motivo_espera para control de la entidad |
| `nombre` | `VARCHAR(80) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `VARCHAR(200) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo descripcion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `motivo_espera_ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.13 Tabla: `categoria_ticket`
* **Nombre de Entidad**: `categoria_ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de categoria ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_categoria` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_categoria para control de la entidad |
| `id_tipo_ticket` | `INT NOT NULL REFERENCES tipo_ticket(id_tipo_ticket)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_tipo_ticket para control de la entidad |
| `nombre` | `VARCHAR(60) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `VARCHAR(200)` | Estandar | Registro de atributo descripcion para control de la entidad |
| `codigo_corto` | `VARCHAR(10) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo codigo_corto para control de la entidad |
| `sla_default_respuesta` | `INT NOT NULL DEFAULT 4` | Obligatorio (NOT NULL) | Registro de atributo sla_default_respuesta para control de la entidad |
| `sla_default_resolucion` | `INT NOT NULL DEFAULT 24` | Obligatorio (NOT NULL) | Registro de atributo sla_default_resolucion para control de la entidad |
| `UNIQUE` | `(id_categoria, id_tipo_ticket)` | Estandar | Registro de atributo UNIQUE para control de la entidad |
| `UNIQUE` | `(id_tipo_ticket, codigo_corto)` | Estandar | Registro de atributo UNIQUE para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `categoria_ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.14 Tabla: `servicio_catalogo`
* **Nombre de Entidad**: `servicio_catalogo`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de servicio catalogo.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_servicio` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_servicio para control de la entidad |
| `codigo_servicio` | `VARCHAR(30) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_servicio para control de la entidad |
| `id_tipo_ticket` | `INT NOT NULL REFERENCES tipo_ticket(id_tipo_ticket)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_tipo_ticket para control de la entidad |
| `id_categoria` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo id_categoria para control de la entidad |
| `nombre` | `VARCHAR(100) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion_comercial` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo descripcion_comercial para control de la entidad |
| `entregable` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo entregable para control de la entidad |
| `requiere_aprobacion` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_aprobacion para control de la entidad |
| `sla_horas_resolucion` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo sla_horas_resolucion para control de la entidad |
| `sla_horas_respuesta` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo sla_horas_respuesta para control de la entidad |
| `costo_referencial` | `NUMERIC(10,2) DEFAULT 0.00` | Con valor por defecto (DEFAULT) | Registro de atributo costo_referencial para control de la entidad |
| `icono` | `VARCHAR(50) DEFAULT 'servicio'` | Con valor por defecto (DEFAULT) | Registro de atributo icono para control de la entidad |
| `motivo_inactivacion` | `TEXT` | Estandar | Registro de atributo motivo_inactivacion para control de la entidad |
| `fecha_inactivacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_inactivacion para control de la entidad |
| `usuario_inactivacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_inactivacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |
| `FOREIGN` | `KEY (id_categoria, id_tipo_ticket) REFERENCES categoria_ticket(id_categoria, id_tipo_ticket)` | Clave Foranea (FK) con integridad referencial | Registro de atributo FOREIGN para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `servicio_catalogo` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.15 Tabla: `servicio_catalogo_perfiles`
* **Nombre de Entidad**: `servicio_catalogo_perfiles`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de servicio catalogo perfiles.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_servicio` | `INT NOT NULL REFERENCES servicio_catalogo(id_servicio) ON DELETE CASCADE` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_servicio para control de la entidad |
| `id_perfil` | `INT NOT NULL REFERENCES perfiles(id_perfil)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_perfil para control de la entidad |
| `PRIMARY` | `KEY (id_servicio, id_perfil)` | Estandar | Registro de atributo PRIMARY para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `servicio_catalogo_perfiles` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.16 Tabla: `servicio_workflow_paso`
* **Nombre de Entidad**: `servicio_workflow_paso`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de servicio workflow paso.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_paso` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_paso para control de la entidad |
| `id_servicio` | `INT NOT NULL REFERENCES servicio_catalogo(id_servicio) ON DELETE CASCADE` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_servicio para control de la entidad |
| `orden` | `SMALLINT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `codigo_paso` | `VARCHAR(30) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo codigo_paso para control de la entidad |
| `nombre_paso` | `VARCHAR(60) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre_paso para control de la entidad |
| `rol_ejecutor` | `VARCHAR(30) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo rol_ejecutor para control de la entidad |
| `es_compuerta_aprobacion` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_compuerta_aprobacion para control de la entidad |
| `pausa_sla` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo pausa_sla para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `servicio_workflow_paso` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.17 Tabla: `departamento_ti`
* **Nombre de Entidad**: `departamento_ti`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de departamento ti.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_departamento` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_departamento para control de la entidad |
| `codigo` | `VARCHAR(20) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(80) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `id_supervisor` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_supervisor para control de la entidad |
| `tiempo_ola_horas` | `INT NOT NULL DEFAULT 8` | Obligatorio (NOT NULL) | Registro de atributo tiempo_ola_horas para control de la entidad |
| `tiempo_ola_critico_hrs` | `INT NOT NULL DEFAULT 2` | Obligatorio (NOT NULL) | Registro de atributo tiempo_ola_critico_hrs para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `departamento_ti` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.18 Tabla: `departamento_empresa`
* **Nombre de Entidad**: `departamento_empresa`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de departamento empresa.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_departamento_empresa` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_departamento_empresa para control de la entidad |
| `codigo` | `VARCHAR(30) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `departamento_empresa` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.19 Tabla: `acuerdo_nivel_operativo`
* **Nombre de Entidad**: `acuerdo_nivel_operativo`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de acuerdo nivel operativo.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_ola` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_ola para control de la entidad |
| `id_departamento` | `INT NOT NULL REFERENCES departamento_ti(id_departamento)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento para control de la entidad |
| `codigo_acuerdo` | `VARCHAR(30) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_acuerdo para control de la entidad |
| `nombre_acuerdo` | `VARCHAR(100) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre_acuerdo para control de la entidad |
| `tipo_compromiso` | `VARCHAR(40) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tipo_compromiso para control de la entidad |
| `tiempo_maximo_horas` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tiempo_maximo_horas para control de la entidad |
| `tiempo_alerta_horas` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tiempo_alerta_horas para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `acuerdo_nivel_operativo` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.20 Tabla: `tecnico_detalle`
* **Nombre de Entidad**: `tecnico_detalle`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de tecnico detalle.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_tecnico_detalle` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_tecnico_detalle para control de la entidad |
| `id_usuario` | `INT UNIQUE NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario para control de la entidad |
| `id_departamento` | `INT NOT NULL REFERENCES departamento_ti(id_departamento)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento para control de la entidad |
| `nivel_soporte` | `SMALLINT NOT NULL DEFAULT 1 CHECK (nivel_soporte IN (1, 2, 3))` | Obligatorio (NOT NULL) | Registro de atributo nivel_soporte para control de la entidad |
| `capacidad_maxima_tickets` | `INT NOT NULL DEFAULT 8` | Obligatorio (NOT NULL) | Registro de atributo capacidad_maxima_tickets para control de la entidad |
| `estado_operativo` | `VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE'` | Obligatorio (NOT NULL) | Registro de atributo estado_operativo para control de la entidad |
| `especialidad_principal` | `VARCHAR(100)` | Estandar | Registro de atributo especialidad_principal para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `tecnico_detalle` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.21 Tabla: `ticket`
* **Nombre de Entidad**: `ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_ticket` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_ticket para control de la entidad |
| `codigo_ticket` | `VARCHAR(30) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_ticket para control de la entidad |
| `titulo` | `VARCHAR(150) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo titulo para control de la entidad |
| `descripcion` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo descripcion para control de la entidad |
| `id_tipo_ticket` | `INT NOT NULL REFERENCES tipo_ticket(id_tipo_ticket)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_tipo_ticket para control de la entidad |
| `id_categoria` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo id_categoria para control de la entidad |
| `id_servicio` | `INT REFERENCES servicio_catalogo(id_servicio)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_servicio para control de la entidad |
| `id_departamento` | `INT REFERENCES departamento_ti(id_departamento)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento para control de la entidad |
| `id_departamento_empresa` | `INT REFERENCES departamento_empresa(id_departamento_empresa)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento_empresa para control de la entidad |
| `canal_comunicacion` | `VARCHAR(30) NOT NULL DEFAULT 'PORTAL_WEB'` | Obligatorio (NOT NULL) | Registro de atributo canal_comunicacion para control de la entidad |
| `estado_aprobacion` | `VARCHAR(30) NOT NULL DEFAULT 'NO_APLICA'` | Obligatorio (NOT NULL) | Registro de atributo estado_aprobacion para control de la entidad |
| `id_paso_actual` | `INT REFERENCES servicio_workflow_paso(id_paso)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_paso_actual para control de la entidad |
| `id_impacto` | `INT NOT NULL REFERENCES impacto_ticket(id_impacto)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_impacto para control de la entidad |
| `id_urgencia` | `INT NOT NULL REFERENCES urgencia_ticket(id_urgencia)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_urgencia para control de la entidad |
| `id_prioridad` | `INT NOT NULL REFERENCES prioridad_ticket(id_prioridad)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_prioridad para control de la entidad |
| `id_estado` | `INT NOT NULL REFERENCES estado_ticket(id_estado)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_estado para control de la entidad |
| `id_motivo_espera` | `INT REFERENCES motivo_espera_ticket(id_motivo_espera)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_motivo_espera para control de la entidad |
| `id_usuario_solicitante` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_solicitante para control de la entidad |
| `id_usuario_asignado` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_asignado para control de la entidad |
| `categoria_resolucion` | `VARCHAR(60)` | Estandar | Registro de atributo categoria_resolucion para control de la entidad |
| `solucion_aplicada` | `TEXT` | Estandar | Registro de atributo solucion_aplicada para control de la entidad |
| `motivo_cancelacion` | `TEXT` | Estandar | Registro de atributo motivo_cancelacion para control de la entidad |
| `calificacion_csat` | `SMALLINT CHECK (calificacion_csat BETWEEN 1 AND 5)` | Estandar | Registro de atributo calificacion_csat para control de la entidad |
| `comentario_csat` | `TEXT` | Estandar | Registro de atributo comentario_csat para control de la entidad |
| `fecha_csat` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_csat para control de la entidad |
| `tiempo_pausado_minutos` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo tiempo_pausado_minutos para control de la entidad |
| `fecha_ultima_pausa` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_ultima_pausa para control de la entidad |
| `fecha_limite_sla` | `TIMESTAMPTZ NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo fecha_limite_sla para control de la entidad |
| `fecha_limite_respuesta_sla` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_limite_respuesta_sla para control de la entidad |
| `fecha_primera_respuesta` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_primera_respuesta para control de la entidad |
| `fecha_resolucion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_resolucion para control de la entidad |
| `fecha_cierre` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_cierre para control de la entidad |
| `sla_cumplido` | `BOOLEAN` | Estandar | Registro de atributo sla_cumplido para control de la entidad |
| `campos_adicionales` | `JSONB DEFAULT '{}'::jsonb` | Con valor por defecto (DEFAULT) | Registro de atributo campos_adicionales para control de la entidad |
| `usuario_creacion` | `INT` | Estandar | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |
| `usuario_modificacion` | `INT` | Estandar | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_modificacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |
| `FOREIGN` | `KEY (id_categoria, id_tipo_ticket) REFERENCES categoria_ticket(id_categoria, id_tipo_ticket)` | Clave Foranea (FK) con integridad referencial | Registro de atributo FOREIGN para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.22 Tabla: `ticket_aprobacion`
* **Nombre de Entidad**: `ticket_aprobacion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de ticket aprobacion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_ticket_aprobacion` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_ticket_aprobacion para control de la entidad |
| `id_ticket` | `INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ticket para control de la entidad |
| `id_usuario_aprobador` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_aprobador para control de la entidad |
| `id_paso_workflow` | `INT REFERENCES servicio_workflow_paso(id_paso)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_paso_workflow para control de la entidad |
| `estado_decision` | `VARCHAR(20) NOT NULL, -- APROBADO, RECHAZADO, OBSERVADO` | Obligatorio (NOT NULL) | Registro de atributo estado_decision para control de la entidad |
| `comentario` | `TEXT` | Estandar | Registro de atributo comentario para control de la entidad |
| `fecha_decision` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_decision para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `ticket_aprobacion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.23 Tabla: `adjunto_ticket`
* **Nombre de Entidad**: `adjunto_ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de adjunto ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_adjunto` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_adjunto para control de la entidad |
| `id_ticket` | `INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ticket para control de la entidad |
| `nombre_archivo` | `VARCHAR(255) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre_archivo para control de la entidad |
| `tipo_mime` | `VARCHAR(100) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tipo_mime para control de la entidad |
| `tamano_bytes` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tamano_bytes para control de la entidad |
| `datos_base64` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo datos_base64 para control de la entidad |
| `id_usuario_subio` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_subio para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `adjunto_ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.24 Tabla: `comentario_ticket`
* **Nombre de Entidad**: `comentario_ticket`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de comentario ticket.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_comentario` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_comentario para control de la entidad |
| `id_ticket` | `INT NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ticket para control de la entidad |
| `id_usuario` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario para control de la entidad |
| `comentario` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo comentario para control de la entidad |
| `es_interno` | `BOOLEAN NOT NULL DEFAULT false, -- true = nota técnica privada para TI` | Obligatorio (NOT NULL) | Registro de atributo es_interno para control de la entidad |
| `id_estado_cambiado` | `INT REFERENCES estado_ticket(id_estado)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_estado_cambiado para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `comentario_ticket` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.25 Tabla: `codigo_recuperacion`
* **Nombre de Entidad**: `codigo_recuperacion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de codigo recuperacion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_recuperacion` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_recuperacion para control de la entidad |
| `id_usuario` | `INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario para control de la entidad |
| `correo` | `VARCHAR(60) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo correo para control de la entidad |
| `codigo` | `VARCHAR(6) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo codigo para control de la entidad |
| `token_sesion` | `VARCHAR(255) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo token_sesion para control de la entidad |
| `fecha_envio` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_envio para control de la entidad |
| `expira_codigo` | `TIMESTAMPTZ NOT NULL, -- Validez de 1 minuto` | Obligatorio (NOT NULL) | Registro de atributo expira_codigo para control de la entidad |
| `expira_sesion` | `TIMESTAMPTZ NOT NULL, -- Validez máxima del proceso de 3 minutos` | Obligatorio (NOT NULL) | Registro de atributo expira_sesion para control de la entidad |
| `utilizado` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo utilizado para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `codigo_recuperacion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.26 Tabla: `activo`
* **Nombre de Entidad**: `activo`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de activo.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_activo` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_activo para control de la entidad |
| `codigo_patrimonial` | `VARCHAR(50) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_patrimonial para control de la entidad |
| `numero_serie` | `VARCHAR(100)` | Estandar | Registro de atributo numero_serie para control de la entidad |
| `tipo_activo` | `VARCHAR(50) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tipo_activo para control de la entidad |
| `marca` | `VARCHAR(100) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo marca para control de la entidad |
| `modelo` | `VARCHAR(100) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo modelo para control de la entidad |
| `id_departamento` | `INT REFERENCES departamento_ti(id_departamento)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento para control de la entidad |
| `id_usuario_custodio` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_custodio para control de la entidad |
| `estado_activo` | `VARCHAR(30) NOT NULL DEFAULT 'EN_OPERACION'` | Obligatorio (NOT NULL) | Registro de atributo estado_activo para control de la entidad |
| `fecha_adquisicion` | `DATE` | Estandar | Registro de atributo fecha_adquisicion para control de la entidad |
| `fecha_fin_garantia` | `DATE` | Estandar | Registro de atributo fecha_fin_garantia para control de la entidad |
| `costo_compra` | `NUMERIC(12,2)` | Estandar | Registro de atributo costo_compra para control de la entidad |
| `motivo_inactivacion` | `TEXT` | Estandar | Registro de atributo motivo_inactivacion para control de la entidad |
| `fecha_inactivacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_inactivacion para control de la entidad |
| `usuario_inactivacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_inactivacion para control de la entidad |
| `usuario_creacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |
| `usuario_modificacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_modificacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `activo` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.27 Tabla: `elemento_configuracion`
* **Nombre de Entidad**: `elemento_configuracion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de elemento configuracion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_ci` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_ci para control de la entidad |
| `id_activo` | `INT REFERENCES activo(id_activo)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_activo para control de la entidad |
| `codigo_ci` | `VARCHAR(50) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_ci para control de la entidad |
| `nombre` | `VARCHAR(150) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `tipo_ci` | `VARCHAR(50) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tipo_ci para control de la entidad |
| `ambiente` | `VARCHAR(20) NOT NULL CHECK (ambiente IN ('PRODUCCION', 'QA', 'DESARROLLO'))` | Obligatorio (NOT NULL) | Registro de atributo ambiente para control de la entidad |
| `ip_principal` | `VARCHAR(45)` | Estandar | Registro de atributo ip_principal para control de la entidad |
| `version_software` | `VARCHAR(50)` | Estandar | Registro de atributo version_software para control de la entidad |
| `criticidad` | `VARCHAR(20) NOT NULL CHECK (criticidad IN ('CRITICA', 'ALTA', 'MEDIA', 'BAJA'))` | Obligatorio (NOT NULL) | Registro de atributo criticidad para control de la entidad |
| `id_departamento_soporte` | `INT REFERENCES departamento_ti(id_departamento)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento_soporte para control de la entidad |
| `motivo_inactivacion` | `TEXT` | Estandar | Registro de atributo motivo_inactivacion para control de la entidad |
| `fecha_inactivacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_inactivacion para control de la entidad |
| `usuario_inactivacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_inactivacion para control de la entidad |
| `usuario_creacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `elemento_configuracion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.28 Tabla: `ci_relacion`
* **Nombre de Entidad**: `ci_relacion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de ci relacion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_ci_padre` | `INT NOT NULL REFERENCES elemento_configuracion(id_ci)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ci_padre para control de la entidad |
| `id_ci_hijo` | `INT NOT NULL REFERENCES elemento_configuracion(id_ci)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ci_hijo para control de la entidad |
| `tipo_relacion` | `VARCHAR(50) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tipo_relacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |
| `PRIMARY` | `KEY (id_ci_padre, id_ci_hijo)` | Estandar | Registro de atributo PRIMARY para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `ci_relacion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.29 Tabla: `licencia_software`
* **Nombre de Entidad**: `licencia_software`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de licencia software.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_licencia` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_licencia para control de la entidad |
| `nombre_software` | `VARCHAR(150) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre_software para control de la entidad |
| `fabricante` | `VARCHAR(100) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo fabricante para control de la entidad |
| `clave_licencia` | `VARCHAR(255)` | Estandar | Registro de atributo clave_licencia para control de la entidad |
| `tipo_licencia` | `VARCHAR(50) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tipo_licencia para control de la entidad |
| `cantidad_adquirida` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo cantidad_adquirida para control de la entidad |
| `cantidad_en_uso` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo cantidad_en_uso para control de la entidad |
| `fecha_vencimiento` | `DATE` | Estandar | Registro de atributo fecha_vencimiento para control de la entidad |
| `costo_anual` | `NUMERIC(12,2)` | Estandar | Registro de atributo costo_anual para control de la entidad |
| `usuario_creacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `licencia_software` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.30 Tabla: `problema`
* **Nombre de Entidad**: `problema`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_problema` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_problema para control de la entidad |
| `codigo_problema` | `VARCHAR(30) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_problema para control de la entidad |
| `titulo` | `VARCHAR(255) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo titulo para control de la entidad |
| `descripcion` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo descripcion para control de la entidad |
| `id_impacto` | `INT REFERENCES impacto_ticket(id_impacto)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_impacto para control de la entidad |
| `id_urgencia` | `INT REFERENCES urgencia_ticket(id_urgencia)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_urgencia para control de la entidad |
| `id_prioridad` | `INT REFERENCES prioridad_ticket(id_prioridad)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_prioridad para control de la entidad |
| `id_estado` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo id_estado para control de la entidad |
| `causa_raiz` | `TEXT` | Estandar | Registro de atributo causa_raiz para control de la entidad |
| `metodo_analisis` | `VARCHAR(50) DEFAULT '5_WHYS'` | Con valor por defecto (DEFAULT) | Registro de atributo metodo_analisis para control de la entidad |
| `workaround` | `TEXT` | Estandar | Registro de atributo workaround para control de la entidad |
| `es_error_conocido` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_error_conocido para control de la entidad |
| `id_ci_afectado` | `INT REFERENCES elemento_configuracion(id_ci)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ci_afectado para control de la entidad |
| `id_usuario_asignado` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_asignado para control de la entidad |
| `id_departamento` | `INT REFERENCES departamento_ti(id_departamento)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento para control de la entidad |
| `solucion_definitiva` | `TEXT` | Estandar | Registro de atributo solucion_definitiva para control de la entidad |
| `usuario_creacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |
| `usuario_modificacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_modificacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.31 Tabla: `problema_incidente`
* **Nombre de Entidad**: `problema_incidente`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema incidente.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_problema` | `INT NOT NULL REFERENCES problema(id_problema)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_problema para control de la entidad |
| `id_ticket` | `INT NOT NULL REFERENCES ticket(id_ticket)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ticket para control de la entidad |
| `fecha_asociacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_asociacion para control de la entidad |
| `PRIMARY` | `KEY (id_problema, id_ticket)` | Estandar | Registro de atributo PRIMARY para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_incidente` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.32 Tabla: `error_conocido`
* **Nombre de Entidad**: `error_conocido`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de error conocido.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_error_conocido` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_error_conocido para control de la entidad |
| `id_problema` | `INT NOT NULL REFERENCES problema(id_problema)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_problema para control de la entidad |
| `codigo_kedb` | `VARCHAR(30) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_kedb para control de la entidad |
| `titulo` | `VARCHAR(255) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo titulo para control de la entidad |
| `sintomas` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo sintomas para control de la entidad |
| `workaround` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo workaround para control de la entidad |
| `solucion_definitiva` | `TEXT` | Estandar | Registro de atributo solucion_definitiva para control de la entidad |
| `fecha_publicacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_publicacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `error_conocido` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.33 Tabla: `cambio`
* **Nombre de Entidad**: `cambio`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de cambio.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_cambio` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_cambio para control de la entidad |
| `codigo_cambio` | `VARCHAR(30) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_cambio para control de la entidad |
| `titulo` | `VARCHAR(255) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo titulo para control de la entidad |
| `descripcion` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo descripcion para control de la entidad |
| `tipo_cambio` | `VARCHAR(20) NOT NULL CHECK (tipo_cambio IN ('ESTANDAR', 'NORMAL', 'EMERGENCIA'))` | Obligatorio (NOT NULL) | Registro de atributo tipo_cambio para control de la entidad |
| `id_impacto` | `INT REFERENCES impacto_ticket(id_impacto)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_impacto para control de la entidad |
| `id_urgencia` | `INT REFERENCES urgencia_ticket(id_urgencia)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_urgencia para control de la entidad |
| `id_prioridad` | `INT REFERENCES prioridad_ticket(id_prioridad)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_prioridad para control de la entidad |
| `id_estado` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo id_estado para control de la entidad |
| `justificacion` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo justificacion para control de la entidad |
| `plan_implementacion` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo plan_implementacion para control de la entidad |
| `plan_rollback` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo plan_rollback para control de la entidad |
| `plan_pruebas` | `TEXT` | Estandar | Registro de atributo plan_pruebas para control de la entidad |
| `ventana_inicio` | `TIMESTAMPTZ NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo ventana_inicio para control de la entidad |
| `ventana_fin` | `TIMESTAMPTZ NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo ventana_fin para control de la entidad |
| `id_ci_afectado` | `INT REFERENCES elemento_configuracion(id_ci)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ci_afectado para control de la entidad |
| `id_problema_origen` | `INT REFERENCES problema(id_problema)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_problema_origen para control de la entidad |
| `id_incidente_origen` | `INT REFERENCES ticket(id_ticket)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_incidente_origen para control de la entidad |
| `id_usuario_solicitante` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_solicitante para control de la entidad |
| `id_usuario_responsable` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_responsable para control de la entidad |
| `resultado_pir` | `TEXT` | Estandar | Registro de atributo resultado_pir para control de la entidad |
| `incidentes_inducidos` | `INT DEFAULT 0` | Con valor por defecto (DEFAULT) | Registro de atributo incidentes_inducidos para control de la entidad |
| `usuario_creacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |
| `usuario_modificacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_modificacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `cambio` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.34 Tabla: `cambio_aprobacion`
* **Nombre de Entidad**: `cambio_aprobacion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de cambio aprobacion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_cambio_aprobacion` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_cambio_aprobacion para control de la entidad |
| `id_cambio` | `INT NOT NULL REFERENCES cambio(id_cambio)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_cambio para control de la entidad |
| `id_usuario_aprobador` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_aprobador para control de la entidad |
| `decision` | `VARCHAR(20) NOT NULL CHECK (decision IN ('APROBADO', 'RECHAZADO', 'OBSERVADO'))` | Obligatorio (NOT NULL) | Registro de atributo decision para control de la entidad |
| `comentario` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo comentario para control de la entidad |
| `fecha_decision` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_decision para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `cambio_aprobacion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.35 Tabla: `articulo_conocimiento`
* **Nombre de Entidad**: `articulo_conocimiento`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de articulo conocimiento.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_articulo` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_articulo para control de la entidad |
| `codigo_articulo` | `VARCHAR(30) UNIQUE NOT NULL` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_articulo para control de la entidad |
| `titulo` | `VARCHAR(255) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo titulo para control de la entidad |
| `contenido_markdown` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo contenido_markdown para control de la entidad |
| `id_categoria` | `INT REFERENCES categoria_ticket(id_categoria)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_categoria para control de la entidad |
| `id_problema_origen` | `INT REFERENCES problema(id_problema)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_problema_origen para control de la entidad |
| `estado_editorial` | `VARCHAR(20) NOT NULL DEFAULT 'PUBLICADO' CHECK (estado_editorial IN ('BORRADOR', 'EN_REVISION', 'PUBLICADO', 'ARCHIVADO'))` | Obligatorio (NOT NULL) | Registro de atributo estado_editorial para control de la entidad |
| `id_autor` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_autor para control de la entidad |
| `id_revisor` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_revisor para control de la entidad |
| `visitas` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo visitas para control de la entidad |
| `utilidad_positiva` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo utilidad_positiva para control de la entidad |
| `utilidad_negativa` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo utilidad_negativa para control de la entidad |
| `fecha_publicacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_publicacion para control de la entidad |
| `usuario_creacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ DEFAULT now()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `articulo_conocimiento` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.36 Tabla: `evento_servicio`
* **Nombre de Entidad**: `evento_servicio`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de evento servicio.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_evento` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_evento para control de la entidad |
| `codigo_evento` | `VARCHAR(30) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_evento para control de la entidad |
| `fuente` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo fuente para control de la entidad |
| `titulo` | `VARCHAR(180) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo titulo para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `severidad` | `VARCHAR(12) NOT NULL DEFAULT 'MEDIA' CHECK (severidad IN ('BAJA','MEDIA','ALTA','CRITICA'))` | Obligatorio (NOT NULL) | Registro de atributo severidad para control de la entidad |
| `estado` | `VARCHAR(16) NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO','RECONOCIDO','VINCULADO','CERRADO'))` | Obligatorio (NOT NULL) | Registro de atributo estado para control de la entidad |
| `id_ci` | `INT REFERENCES elemento_configuracion(id_ci)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ci para control de la entidad |
| `id_ticket` | `INT REFERENCES ticket(id_ticket)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_ticket para control de la entidad |
| `detectado_en` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo detectado_en para control de la entidad |
| `reconocido_por` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo reconocido_por para control de la entidad |
| `reconocido_en` | `TIMESTAMPTZ` | Estandar | Registro de atributo reconocido_en para control de la entidad |
| `cerrado_por` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo cerrado_por para control de la entidad |
| `cerrado_en` | `TIMESTAMPTZ` | Estandar | Registro de atributo cerrado_en para control de la entidad |
| `usuario_creacion` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `evento_servicio` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.37 Tabla: `resiliencia_servicio`
* **Nombre de Entidad**: `resiliencia_servicio`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de resiliencia servicio.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_resiliencia` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_resiliencia para control de la entidad |
| `id_servicio` | `INT NOT NULL UNIQUE REFERENCES servicio_catalogo(id_servicio)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_servicio para control de la entidad |
| `objetivo_disponibilidad` | `NUMERIC(5,2) NOT NULL DEFAULT 99.00 CHECK (objetivo_disponibilidad BETWEEN 0 AND 100)` | Obligatorio (NOT NULL) | Registro de atributo objetivo_disponibilidad para control de la entidad |
| `disponibilidad_observada` | `NUMERIC(5,2) CHECK (disponibilidad_observada BETWEEN 0 AND 100)` | Estandar | Registro de atributo disponibilidad_observada para control de la entidad |
| `rto_horas` | `NUMERIC(8,2) CHECK (rto_horas >= 0)` | Estandar | Registro de atributo rto_horas para control de la entidad |
| `rpo_horas` | `NUMERIC(8,2) CHECK (rpo_horas >= 0)` | Estandar | Registro de atributo rpo_horas para control de la entidad |
| `umbral_capacidad_pct` | `SMALLINT CHECK (umbral_capacidad_pct BETWEEN 1 AND 100)` | Estandar | Registro de atributo umbral_capacidad_pct para control de la entidad |
| `consumo_capacidad_pct` | `SMALLINT CHECK (consumo_capacidad_pct BETWEEN 0 AND 100)` | Estandar | Registro de atributo consumo_capacidad_pct para control de la entidad |
| `plan_continuidad` | `TEXT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo plan_continuidad para control de la entidad |
| `ultima_prueba` | `TIMESTAMPTZ` | Estandar | Registro de atributo ultima_prueba para control de la entidad |
| `proxima_prueba` | `TIMESTAMPTZ` | Estandar | Registro de atributo proxima_prueba para control de la entidad |
| `resultado_ultima_prueba` | `TEXT` | Estandar | Registro de atributo resultado_ultima_prueba para control de la entidad |
| `id_responsable` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_responsable para control de la entidad |
| `usuario_creacion` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `usuario_modificacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_modificacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `resiliencia_servicio` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.38 Tabla: `proveedor_ti`
* **Nombre de Entidad**: `proveedor_ti`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de proveedor ti.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_proveedor` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_proveedor para control de la entidad |
| `codigo_proveedor` | `VARCHAR(30) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_proveedor para control de la entidad |
| `nombre` | `VARCHAR(160) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `tipo_servicio` | `VARCHAR(100) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo tipo_servicio para control de la entidad |
| `contacto_nombre` | `VARCHAR(120)` | Estandar | Registro de atributo contacto_nombre para control de la entidad |
| `contacto_correo` | `VARCHAR(160)` | Estandar | Registro de atributo contacto_correo para control de la entidad |
| `contacto_telefono` | `VARCHAR(40)` | Estandar | Registro de atributo contacto_telefono para control de la entidad |
| `numero_contrato` | `VARCHAR(80)` | Estandar | Registro de atributo numero_contrato para control de la entidad |
| `fecha_inicio` | `DATE` | Estandar | Registro de atributo fecha_inicio para control de la entidad |
| `fecha_vencimiento` | `DATE` | Estandar | Registro de atributo fecha_vencimiento para control de la entidad |
| `servicio_soportado` | `VARCHAR(180)` | Estandar | Registro de atributo servicio_soportado para control de la entidad |
| `compromiso_sla` | `TEXT` | Estandar | Registro de atributo compromiso_sla para control de la entidad |
| `evaluacion_desempeno` | `SMALLINT CHECK (evaluacion_desempeno BETWEEN 1 AND 5)` | Estandar | Registro de atributo evaluacion_desempeno para control de la entidad |
| `estado` | `VARCHAR(16) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO','EN_REVISION','VENCIDO','INACTIVO'))` | Obligatorio (NOT NULL) | Registro de atributo estado para control de la entidad |
| `observaciones` | `TEXT` | Estandar | Registro de atributo observaciones para control de la entidad |
| `usuario_creacion` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `usuario_modificacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_modificacion para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |
| `CHECK` | `(fecha_vencimiento IS NULL OR fecha_inicio IS NULL OR fecha_vencimiento >= fecha_inicio)` | Estandar | Registro de atributo CHECK para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `proveedor_ti` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.39 Tabla: `configuracion_rfc`
* **Nombre de Entidad**: `configuracion_rfc`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de configuracion rfc.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_configuracion` | `SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id_configuracion=1)` | Clave Primaria (PK) | Registro de atributo id_configuracion para control de la entidad |
| `perfiles_solicitantes` | `SMALLINT[] NOT NULL DEFAULT ARRAY[2,8]::SMALLINT[]` | Obligatorio (NOT NULL) | Registro de atributo perfiles_solicitantes para control de la entidad |
| `tipos_rfc` | `TEXT[] NOT NULL DEFAULT ARRAY['ESTANDAR','NORMAL','EMERGENCIA']::TEXT[]` | Obligatorio (NOT NULL) | Registro de atributo tipos_rfc para control de la entidad |
| `exige_ci` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo exige_ci para control de la entidad |
| `exige_plan_pruebas` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo exige_plan_pruebas para control de la entidad |
| `permite_emergencia` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo permite_emergencia para control de la entidad |
| `usuario_modificacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_modificacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `configuracion_rfc` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.40 Tabla: `articulo_conocimiento_historial`
* **Nombre de Entidad**: `articulo_conocimiento_historial`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de articulo conocimiento historial.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_historial` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_historial para control de la entidad |
| `id_articulo` | `INT NOT NULL REFERENCES articulo_conocimiento(id_articulo)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_articulo para control de la entidad |
| `estado_anterior` | `VARCHAR(20)` | Estandar | Registro de atributo estado_anterior para control de la entidad |
| `estado_nuevo` | `VARCHAR(20) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo estado_nuevo para control de la entidad |
| `comentario` | `TEXT` | Estandar | Registro de atributo comentario para control de la entidad |
| `id_usuario` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario para control de la entidad |
| `fecha` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `articulo_conocimiento_historial` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.41 Tabla: `tipo_activo_catalogo`
* **Nombre de Entidad**: `tipo_activo_catalogo`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de tipo activo catalogo.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_tipo_activo` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_tipo_activo para control de la entidad |
| `codigo` | `VARCHAR(40) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `clase` | `VARCHAR(16) NOT NULL CHECK (clase IN ('HARDWARE','SOFTWARE'))` | Obligatorio (NOT NULL) | Registro de atributo clase para control de la entidad |
| `atributos` | `JSONB NOT NULL DEFAULT '[]'::jsonb` | Obligatorio (NOT NULL) | Registro de atributo atributos para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |
| `usuario_modificacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_modificacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `tipo_activo_catalogo` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.42 Tabla: `modelo_activo`
* **Nombre de Entidad**: `modelo_activo`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de modelo activo.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_modelo` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_modelo para control de la entidad |
| `id_tipo_activo` | `INT NOT NULL REFERENCES tipo_activo_catalogo(id_tipo_activo)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_tipo_activo para control de la entidad |
| `fabricante` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo fabricante para control de la entidad |
| `nombre_modelo` | `VARCHAR(160) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre_modelo para control de la entidad |
| `atributos` | `JSONB NOT NULL DEFAULT '[]'::jsonb` | Obligatorio (NOT NULL) | Registro de atributo atributos para control de la entidad |
| `vida_util_meses` | `SMALLINT CHECK (vida_util_meses > 0)` | Estandar | Registro de atributo vida_util_meses para control de la entidad |
| `metodo_depreciacion` | `VARCHAR(20) NOT NULL DEFAULT 'LINEAL' CHECK (metodo_depreciacion IN ('LINEAL','NINGUNA'))` | Obligatorio (NOT NULL) | Registro de atributo metodo_depreciacion para control de la entidad |
| `valor_residual_pct` | `NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (valor_residual_pct BETWEEN 0 AND 100)` | Obligatorio (NOT NULL) | Registro de atributo valor_residual_pct para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |
| `usuario_modificacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_modificacion para control de la entidad |
| `UNIQUE(id_tipo_activo,` | `fabricante, nombre_modelo)` | Estandar | Registro de atributo UNIQUE(id_tipo_activo, para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `modelo_activo` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.43 Tabla: `transicion_activo`
* **Nombre de Entidad**: `transicion_activo`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de transicion activo.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `estado_origen` | `VARCHAR(30) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo estado_origen para control de la entidad |
| `estado_destino` | `VARCHAR(30) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo estado_destino para control de la entidad |
| `requiere_motivo` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_motivo para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |
| `PRIMARY` | `KEY(estado_origen, estado_destino)` | Estandar | Registro de atributo PRIMARY para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `transicion_activo` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.44 Tabla: `activo_historial`
* **Nombre de Entidad**: `activo_historial`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de activo historial.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_historial` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_historial para control de la entidad |
| `id_activo` | `INT NOT NULL REFERENCES activo(id_activo)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_activo para control de la entidad |
| `estado_anterior` | `VARCHAR(30)` | Estandar | Registro de atributo estado_anterior para control de la entidad |
| `estado_nuevo` | `VARCHAR(30) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo estado_nuevo para control de la entidad |
| `custodio_anterior` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo custodio_anterior para control de la entidad |
| `custodio_nuevo` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo custodio_nuevo para control de la entidad |
| `motivo` | `TEXT` | Estandar | Registro de atributo motivo para control de la entidad |
| `id_usuario` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario para control de la entidad |
| `fecha` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `activo_historial` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.45 Tabla: `licencia_asignacion`
* **Nombre de Entidad**: `licencia_asignacion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de licencia asignacion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_asignacion` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_asignacion para control de la entidad |
| `id_licencia` | `INT NOT NULL REFERENCES licencia_software(id_licencia)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_licencia para control de la entidad |
| `id_usuario` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario para control de la entidad |
| `id_activo` | `INT REFERENCES activo(id_activo)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_activo para control de la entidad |
| `fecha_asignacion` | `DATE NOT NULL DEFAULT CURRENT_DATE` | Obligatorio (NOT NULL) | Registro de atributo fecha_asignacion para control de la entidad |
| `fecha_devolucion` | `DATE` | Estandar | Registro de atributo fecha_devolucion para control de la entidad |
| `motivo_devolucion` | `TEXT` | Estandar | Registro de atributo motivo_devolucion para control de la entidad |
| `id_usuario_registro` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_registro para control de la entidad |
| `CHECK` | `(id_usuario IS NOT NULL OR id_activo IS NOT NULL)` | Obligatorio (NOT NULL) | Registro de atributo CHECK para control de la entidad |
| `CHECK` | `(fecha_devolucion IS NULL OR fecha_devolucion >= fecha_asignacion)` | Estandar | Registro de atributo CHECK para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `licencia_asignacion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.46 Tabla: `regla_notificacion`
* **Nombre de Entidad**: `regla_notificacion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de regla notificacion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_regla` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_regla para control de la entidad |
| `codigo_evento` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo_evento para control de la entidad |
| `nombre` | `VARCHAR(140) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `canal` | `VARCHAR(20) NOT NULL DEFAULT 'EMAIL' CHECK (canal IN ('EMAIL'))` | Obligatorio (NOT NULL) | Registro de atributo canal para control de la entidad |
| `plantilla` | `JSONB NOT NULL DEFAULT '{}'::jsonb` | Obligatorio (NOT NULL) | Registro de atributo plantilla para control de la entidad |
| `destinatarios` | `TEXT[] NOT NULL DEFAULT ARRAY['SOLICITANTE']::TEXT[]` | Obligatorio (NOT NULL) | Registro de atributo destinatarios para control de la entidad |
| `activa` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activa para control de la entidad |
| `usuario_modificacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_modificacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Obligatorio (NOT NULL) | Registro de atributo fecha_modificacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `regla_notificacion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.47 Tabla: `configuracion_modulo_versiones`
* **Nombre de Entidad**: `configuracion_modulo_versiones`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de configuracion modulo versiones.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_version` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_version para control de la entidad |
| `modulo` | `VARCHAR(50) NOT NULL, -- 'problemas', 'incidentes', 'solicitudes'` | Obligatorio (NOT NULL) | Registro de atributo modulo para control de la entidad |
| `pantalla` | `VARCHAR(50) NOT NULL, -- '1.3.4.1', '1.3.4.2', '1.3.4.3'` | Obligatorio (NOT NULL) | Registro de atributo pantalla para control de la entidad |
| `pestana` | `VARCHAR(50) NOT NULL, -- 'campos', 'personalizados', 'catalogos', 'matriz_prioridad', 'plantillas', 'vista_ticket'` | Obligatorio (NOT NULL) | Registro de atributo pestana para control de la entidad |
| `numero_version` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo numero_version para control de la entidad |
| `es_publicada` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_publicada para control de la entidad |
| `es_borrador` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo es_borrador para control de la entidad |
| `snapshot` | `JSONB NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo snapshot para control de la entidad |
| `diff` | `JSONB` | Estandar | Registro de atributo diff para control de la entidad |
| `motivo` | `TEXT` | Estandar | Registro de atributo motivo para control de la entidad |
| `impacto_resumen` | `TEXT` | Estandar | Registro de atributo impacto_resumen para control de la entidad |
| `id_usuario_creacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `configuracion_modulo_versiones` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.48 Tabla: `bloqueo_edicion_concurrente`
* **Nombre de Entidad**: `bloqueo_edicion_concurrente`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de bloqueo edicion concurrente.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_bloqueo` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_bloqueo para control de la entidad |
| `recurso` | `VARCHAR(120) NOT NULL UNIQUE, -- ej: 'problemas:1.3.4.1:campos'` | Restriccion de Unicidad (UNIQUE) | Registro de atributo recurso para control de la entidad |
| `id_usuario` | `INT REFERENCES usuario(id_usuario) NOT NULL` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario para control de la entidad |
| `fecha_bloqueo` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_bloqueo para control de la entidad |
| `fecha_expiracion` | `TIMESTAMP WITH TIME ZONE NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo fecha_expiracion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `bloqueo_edicion_concurrente` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.49 Tabla: `tecnico_ausencias`
* **Nombre de Entidad**: `tecnico_ausencias`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de tecnico ausencias.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_ausencia` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_ausencia para control de la entidad |
| `id_tecnico` | `INT NOT NULL REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_tecnico para control de la entidad |
| `desde` | `TIMESTAMP WITH TIME ZONE NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo desde para control de la entidad |
| `hasta` | `TIMESTAMP WITH TIME ZONE NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo hasta para control de la entidad |
| `motivo` | `VARCHAR(255) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo motivo para control de la entidad |
| `creado_por` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo creado_por para control de la entidad |
| `creado_en` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo creado_en para control de la entidad |
| `estado_registro` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo estado_registro para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `tecnico_ausencias` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.50 Tabla: `problema_categoria`
* **Nombre de Entidad**: `problema_categoria`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema categoria.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_categoria` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_categoria para control de la entidad |
| `id_padre` | `INT REFERENCES problema_categoria(id_categoria)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_padre para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `color` | `VARCHAR(20) DEFAULT '#2563eb'` | Con valor por defecto (DEFAULT) | Registro de atributo color para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `es_sistema` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_sistema para control de la entidad |
| `id_departamento_defecto` | `INT REFERENCES departamento_ti(id_departamento)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento_defecto para control de la entidad |
| `id_usuario_defecto` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_usuario_defecto para control de la entidad |
| `id_servicio_defecto` | `INT REFERENCES servicio_catalogo(id_servicio)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_servicio_defecto para control de la entidad |
| `id_plantilla_defecto` | `INT` | Estandar | Registro de atributo id_plantilla_defecto para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_categoria` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.51 Tabla: `problema_origen`
* **Nombre de Entidad**: `problema_origen`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema origen.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_origen` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_origen para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `color` | `VARCHAR(20) DEFAULT '#475569'` | Con valor por defecto (DEFAULT) | Registro de atributo color para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `es_sistema` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_sistema para control de la entidad |
| `requiere_incidentes` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_incidentes para control de la entidad |
| `es_proactivo` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_proactivo para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_origen` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.52 Tabla: `problema_causa_raiz_categoria`
* **Nombre de Entidad**: `problema_causa_raiz_categoria`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema causa raiz categoria.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_causa_categoria` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_causa_categoria para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `color` | `VARCHAR(20) DEFAULT '#d97706'` | Con valor por defecto (DEFAULT) | Registro de atributo color para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `es_sistema` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_sistema para control de la entidad |
| `sugiere_rfc` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo sugiere_rfc para control de la entidad |
| `descripcion_ejemplo` | `TEXT` | Estandar | Registro de atributo descripcion_ejemplo para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_causa_raiz_categoria` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.53 Tabla: `problema_codigo_cierre`
* **Nombre de Entidad**: `problema_codigo_cierre`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema codigo cierre.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_codigo_cierre` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_codigo_cierre para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `color` | `VARCHAR(20) DEFAULT '#059669'` | Con valor por defecto (DEFAULT) | Registro de atributo color para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `es_sistema` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_sistema para control de la entidad |
| `requiere_solucion_permanente` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_solucion_permanente para control de la entidad |
| `requiere_rfc_cerrada` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_rfc_cerrada para control de la entidad |
| `requiere_error_conocido` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_error_conocido para control de la entidad |
| `cuenta_como_exito` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo cuenta_como_exito para control de la entidad |
| `requiere_aprobacion_supervisor` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_aprobacion_supervisor para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_codigo_cierre` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.54 Tabla: `problema_metodo_analisis`
* **Nombre de Entidad**: `problema_metodo_analisis`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema metodo analisis.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_metodo` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_metodo para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `color` | `VARCHAR(20) DEFAULT '#6366f1'` | Con valor por defecto (DEFAULT) | Registro de atributo color para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `es_sistema` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_sistema para control de la entidad |
| `plantilla_ayuda` | `TEXT` | Estandar | Registro de atributo plantilla_ayuda para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_metodo_analisis` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.55 Tabla: `problema_motivo_espera`
* **Nombre de Entidad**: `problema_motivo_espera`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema motivo espera.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_motivo_espera` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_motivo_espera para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `color` | `VARCHAR(20) DEFAULT '#f97316'` | Con valor por defecto (DEFAULT) | Registro de atributo color para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `es_sistema` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_sistema para control de la entidad |
| `pausa_reloj_resolucion` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo pausa_reloj_resolucion para control de la entidad |
| `requiere_fecha_reanudacion` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_fecha_reanudacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_motivo_espera` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.56 Tabla: `problema_motivo_cancelacion`
* **Nombre de Entidad**: `problema_motivo_cancelacion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema motivo cancelacion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_motivo_cancelacion` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_motivo_cancelacion para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `color` | `VARCHAR(20) DEFAULT '#dc2626'` | Con valor por defecto (DEFAULT) | Registro de atributo color para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `es_sistema` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_sistema para control de la entidad |
| `requiere_aprobacion` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_aprobacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_motivo_cancelacion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.57 Tabla: `matriz_prioridad_institucional`
* **Nombre de Entidad**: `matriz_prioridad_institucional`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de matriz prioridad institucional.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_celda` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_celda para control de la entidad |
| `entidad` | `VARCHAR(50) NOT NULL DEFAULT 'compartida', -- 'compartida', 'problema'` | Obligatorio (NOT NULL) | Registro de atributo entidad para control de la entidad |
| `nivel_impacto` | `INT NOT NULL CHECK (nivel_impacto BETWEEN 1 AND 3)` | Obligatorio (NOT NULL) | Registro de atributo nivel_impacto para control de la entidad |
| `nivel_urgencia` | `INT NOT NULL CHECK (nivel_urgencia BETWEEN 1 AND 3)` | Obligatorio (NOT NULL) | Registro de atributo nivel_urgencia para control de la entidad |
| `id_prioridad` | `INT NOT NULL REFERENCES prioridad_ticket(id_prioridad)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_prioridad para control de la entidad |
| `fecha_modificacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_modificacion para control de la entidad |
| `CONSTRAINT` | `uq_matriz_entidad_celda UNIQUE (entidad, nivel_impacto, nivel_urgencia)` | Restriccion de Unicidad (UNIQUE) | Registro de atributo CONSTRAINT para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `matriz_prioridad_institucional` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.58 Tabla: `plantilla_problema`
* **Nombre de Entidad**: `plantilla_problema`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de plantilla problema.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_plantilla` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_plantilla para control de la entidad |
| `nombre` | `VARCHAR(100) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `activa` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activa para control de la entidad |
| `id_categoria` | `INT REFERENCES problema_categoria(id_categoria)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_categoria para control de la entidad |
| `perfiles_visibles` | `JSONB DEFAULT '[]'` | Con valor por defecto (DEFAULT) | Registro de atributo perfiles_visibles para control de la entidad |
| `valores_prellenados` | `JSONB NOT NULL DEFAULT '{}'` | Obligatorio (NOT NULL) | Registro de atributo valores_prellenados para control de la entidad |
| `campos_bloqueados` | `JSONB NOT NULL DEFAULT '{}'` | Obligatorio (NOT NULL) | Registro de atributo campos_bloqueados para control de la entidad |
| `tareas_incluidas` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo tareas_incluidas para control de la entidad |
| `veces_usada` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo veces_usada para control de la entidad |
| `usuario_creacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |
| `fecha_modificacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_modificacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `plantilla_problema` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.59 Tabla: `campo_personalizado`
* **Nombre de Entidad**: `campo_personalizado`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de campo personalizado.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_campo` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_campo para control de la entidad |
| `entidad` | `VARCHAR(50) NOT NULL DEFAULT 'problema', -- 'problema', 'incidente', 'solicitud'` | Obligatorio (NOT NULL) | Registro de atributo entidad para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo codigo para control de la entidad |
| `etiqueta` | `VARCHAR(80) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo etiqueta para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `tipo` | `VARCHAR(40) NOT NULL, -- 'texto_corto', 'texto_largo', 'numero', 'fecha', 'lista', 'casilla', etc.` | Obligatorio (NOT NULL) | Registro de atributo tipo para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `propiedades` | `JSONB NOT NULL DEFAULT '{}'` | Obligatorio (NOT NULL) | Registro de atributo propiedades para control de la entidad |
| `formularios_visibles` | `JSONB NOT NULL DEFAULT '["registro", "edicion"]'` | Obligatorio (NOT NULL) | Registro de atributo formularios_visibles para control de la entidad |
| `pestana_vista` | `VARCHAR(50) DEFAULT 'detalle'` | Con valor por defecto (DEFAULT) | Registro de atributo pestana_vista para control de la entidad |
| `seccion` | `VARCHAR(50) DEFAULT 'A. Identificación'` | Con valor por defecto (DEFAULT) | Registro de atributo seccion para control de la entidad |
| `obligatorio` | `VARCHAR(20) DEFAULT 'no', -- 'si', 'no', 'condicional'` | Con valor por defecto (DEFAULT) | Registro de atributo obligatorio para control de la entidad |
| `reglas_condicionales` | `JSONB DEFAULT '[]'` | Con valor por defecto (DEFAULT) | Registro de atributo reglas_condicionales para control de la entidad |
| `orden` | `INT DEFAULT 1` | Con valor por defecto (DEFAULT) | Registro de atributo orden para control de la entidad |
| `veces_usado` | `INT DEFAULT 0` | Con valor por defecto (DEFAULT) | Registro de atributo veces_usado para control de la entidad |
| `usuario_creacion` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo usuario_creacion para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |
| `CONSTRAINT` | `uq_campo_entidad_codigo UNIQUE (entidad, codigo)` | Restriccion de Unicidad (UNIQUE) | Registro de atributo CONSTRAINT para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `campo_personalizado` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.60 Tabla: `problema_estado`
* **Nombre de Entidad**: `problema_estado`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema estado.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_estado` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_estado para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(60) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `tipo` | `VARCHAR(30) NOT NULL CHECK (tipo IN ('inicial', 'en_curso', 'en_pausa', 'resuelto', 'final'))` | Obligatorio (NOT NULL) | Registro de atributo tipo para control de la entidad |
| `color` | `VARCHAR(20) NOT NULL DEFAULT '#3b82f6'` | Obligatorio (NOT NULL) | Registro de atributo color para control de la entidad |
| `reloj_diagnostico` | `VARCHAR(20) NOT NULL DEFAULT 'corre' CHECK (reloj_diagnostico IN ('corre', 'pausado', 'detenido'))` | Obligatorio (NOT NULL) | Registro de atributo reloj_diagnostico para control de la entidad |
| `reloj_resolucion` | `VARCHAR(20) NOT NULL DEFAULT 'corre' CHECK (reloj_resolucion IN ('corre', 'pausado', 'detenido'))` | Obligatorio (NOT NULL) | Registro de atributo reloj_resolucion para control de la entidad |
| `cuenta_como_abierto` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo cuenta_como_abierto para control de la entidad |
| `permite_edicion` | `VARCHAR(30) NOT NULL DEFAULT 'si' CHECK (permite_edicion IN ('si', 'solo_comentarios', 'no'))` | Obligatorio (NOT NULL) | Registro de atributo permite_edicion para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `es_sistema` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_sistema para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_estado` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.61 Tabla: `problema_transicion`
* **Nombre de Entidad**: `problema_transicion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema transicion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_transicion` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_transicion para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(80) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `estado_origen_id` | `INT NOT NULL REFERENCES problema_estado(id_estado)` | Clave Foranea (FK) con integridad referencial | Registro de atributo estado_origen_id para control de la entidad |
| `estado_destino_id` | `INT NOT NULL REFERENCES problema_estado(id_estado)` | Clave Foranea (FK) con integridad referencial | Registro de atributo estado_destino_id para control de la entidad |
| `perfiles_autorizados` | `JSONB NOT NULL DEFAULT '[]', -- IDs de perfiles autorizados` | Obligatorio (NOT NULL) | Registro de atributo perfiles_autorizados para control de la entidad |
| `roles_contextuales` | `JSONB NOT NULL DEFAULT '{"responsable": true, "grupo": true, "supervisor": true}'` | Obligatorio (NOT NULL) | Registro de atributo roles_contextuales para control de la entidad |
| `condiciones_previas` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo condiciones_previas para control de la entidad |
| `campos_requeridos` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo campos_requeridos para control de la entidad |
| `politica_comentario` | `VARCHAR(30) NOT NULL DEFAULT 'opcional' CHECK (politica_comentario IN ('ninguno', 'opcional', 'obligatorio'))` | Obligatorio (NOT NULL) | Registro de atributo politica_comentario para control de la entidad |
| `requiere_confirmacion` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_confirmacion para control de la entidad |
| `mensaje_confirmacion` | `TEXT` | Estandar | Registro de atributo mensaje_confirmacion para control de la entidad |
| `requiere_aprobacion` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo requiere_aprobacion para control de la entidad |
| `aprobador_tipo` | `VARCHAR(40) DEFAULT 'supervisor_grupo'` | Con valor por defecto (DEFAULT) | Registro de atributo aprobador_tipo para control de la entidad |
| `color_boton` | `VARCHAR(20) DEFAULT '#2563eb'` | Con valor por defecto (DEFAULT) | Registro de atributo color_boton para control de la entidad |
| `automatizaciones` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo automatizaciones para control de la entidad |
| `activa` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activa para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `es_sistema` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo es_sistema para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_transicion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.62 Tabla: `problema_regla_asignacion`
* **Nombre de Entidad**: `problema_regla_asignacion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema regla asignacion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_regla` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_regla para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `activa` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activa para control de la entidad |
| `evento_evaluacion` | `VARCHAR(40) NOT NULL DEFAULT 'al_registrar'` | Obligatorio (NOT NULL) | Registro de atributo evento_evaluacion para control de la entidad |
| `condiciones` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo condiciones para control de la entidad |
| `id_departamento_destino` | `INT REFERENCES departamento_ti(id_departamento)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento_destino para control de la entidad |
| `estrategia` | `VARCHAR(40) NOT NULL DEFAULT 'sin_responsable', -- 'sin_responsable', 'round_robin', 'menor_carga', 'tecnico_fijo'` | Obligatorio (NOT NULL) | Registro de atributo estrategia para control de la entidad |
| `id_tecnico_fijo` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_tecnico_fijo para control de la entidad |
| `considerar_disponibilidad` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo considerar_disponibilidad para control de la entidad |
| `notificar_asignacion` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo notificar_asignacion para control de la entidad |
| `veces_aplicada` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo veces_aplicada para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_regla_asignacion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.63 Tabla: `problema_objetivo_tiempo`
* **Nombre de Entidad**: `problema_objetivo_tiempo`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema objetivo tiempo.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_objetivo` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_objetivo para control de la entidad |
| `id_prioridad` | `INT NOT NULL UNIQUE REFERENCES prioridad_ticket(id_prioridad)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_prioridad para control de la entidad |
| `primera_respuesta_horas` | `INT NOT NULL DEFAULT 4` | Obligatorio (NOT NULL) | Registro de atributo primera_respuesta_horas para control de la entidad |
| `diagnostico_horas` | `INT NOT NULL DEFAULT 72` | Obligatorio (NOT NULL) | Registro de atributo diagnostico_horas para control de la entidad |
| `resolucion_total_horas` | `INT NOT NULL DEFAULT 240` | Obligatorio (NOT NULL) | Registro de atributo resolucion_total_horas para control de la entidad |
| `descripcion_operativa` | `TEXT` | Estandar | Registro de atributo descripcion_operativa para control de la entidad |
| `umbrales_alerta` | `JSONB NOT NULL DEFAULT '[50, 75, 90]'` | Obligatorio (NOT NULL) | Registro de atributo umbrales_alerta para control de la entidad |
| `fecha_modificacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_modificacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_objetivo_tiempo` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.64 Tabla: `problema_regla_escalamiento`
* **Nombre de Entidad**: `problema_regla_escalamiento`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema regla escalamiento.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_escalamiento` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_escalamiento para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `objetivo` | `VARCHAR(40) NOT NULL DEFAULT 'diagnostico', -- 'diagnostico', 'resolucion', 'primera_respuesta'` | Obligatorio (NOT NULL) | Registro de atributo objetivo para control de la entidad |
| `prioridades` | `JSONB NOT NULL DEFAULT '["P1", "P2", "P3", "P4"]'` | Obligatorio (NOT NULL) | Registro de atributo prioridades para control de la entidad |
| `tipo_umbral` | `VARCHAR(30) NOT NULL DEFAULT 'porcentaje', -- 'porcentaje', 'horas_vencido'` | Obligatorio (NOT NULL) | Registro de atributo tipo_umbral para control de la entidad |
| `umbral_valor` | `INT NOT NULL DEFAULT 75` | Obligatorio (NOT NULL) | Registro de atributo umbral_valor para control de la entidad |
| `acciones` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo acciones para control de la entidad |
| `repetir_cada_horas` | `INT DEFAULT NULL` | Con valor por defecto (DEFAULT) | Registro de atributo repetir_cada_horas para control de la entidad |
| `max_repeticiones` | `INT DEFAULT 1` | Con valor por defecto (DEFAULT) | Registro de atributo max_repeticiones para control de la entidad |
| `activa` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activa para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_regla_escalamiento` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.65 Tabla: `problema_config_reapertura`
* **Nombre de Entidad**: `problema_config_reapertura`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema config reapertura.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id para control de la entidad |
| `permitir_reapertura` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo permitir_reapertura para control de la entidad |
| `ventana_dias_resuelto` | `INT NOT NULL DEFAULT 30` | Obligatorio (NOT NULL) | Registro de atributo ventana_dias_resuelto para control de la entidad |
| `ventana_dias_cerrado` | `INT NOT NULL DEFAULT 15` | Obligatorio (NOT NULL) | Registro de atributo ventana_dias_cerrado para control de la entidad |
| `perfiles_autorizados` | `JSONB NOT NULL DEFAULT '[1, 10, 4]', -- Admin, Gestor de Problemas, Supervisor` | Obligatorio (NOT NULL) | Registro de atributo perfiles_autorizados para control de la entidad |
| `estado_destino_id` | `INT REFERENCES problema_estado(id_estado)` | Clave Foranea (FK) con integridad referencial | Registro de atributo estado_destino_id para control de la entidad |
| `motivo_obligatorio` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo motivo_obligatorio para control de la entidad |
| `max_reaperturas` | `INT NOT NULL DEFAULT 2` | Obligatorio (NOT NULL) | Registro de atributo max_reaperturas para control de la entidad |
| `reinicio_relojes` | `VARCHAR(20) NOT NULL DEFAULT 'continuar', -- 'reiniciar', 'continuar'` | Obligatorio (NOT NULL) | Registro de atributo reinicio_relojes para control de la entidad |
| `estrategia_asignacion` | `VARCHAR(20) NOT NULL DEFAULT 'mantener', -- 'mantener', 'reasignar'` | Obligatorio (NOT NULL) | Registro de atributo estrategia_asignacion para control de la entidad |
| `motivos_catalogo` | `JSONB NOT NULL DEFAULT '["El incidente reaparece", "La solución no funcionó", "Cambio revertido", "Otro"]'` | Obligatorio (NOT NULL) | Registro de atributo motivos_catalogo para control de la entidad |
| `fecha_modificacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_modificacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_config_reapertura` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.66 Tabla: `problema_tarea_catalogo`
* **Nombre de Entidad**: `problema_tarea_catalogo`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema tarea catalogo.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_tarea` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_tarea para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `titulo` | `VARCHAR(150) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo titulo para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `tipo` | `VARCHAR(40) NOT NULL DEFAULT 'investigacion', -- 'investigacion', 'logs', 'laboratorio', 'proveedor', 'documentacion', 'validacion'` | Obligatorio (NOT NULL) | Registro de atributo tipo para control de la entidad |
| `id_departamento_destino` | `INT REFERENCES departamento_ti(id_departamento)` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_departamento_destino para control de la entidad |
| `duracion_estimada_horas` | `INT DEFAULT 4` | Con valor por defecto (DEFAULT) | Registro de atributo duracion_estimada_horas para control de la entidad |
| `offset_dias_vencimiento` | `INT DEFAULT 2` | Con valor por defecto (DEFAULT) | Registro de atributo offset_dias_vencimiento para control de la entidad |
| `obligatoria` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo obligatoria para control de la entidad |
| `checklist` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo checklist para control de la entidad |
| `activa` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activa para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_tarea_catalogo` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.67 Tabla: `problema_tarea_paquete`
* **Nombre de Entidad**: `problema_tarea_paquete`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema tarea paquete.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_paquete` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_paquete para control de la entidad |
| `codigo` | `VARCHAR(60) NOT NULL UNIQUE` | Restriccion de Unicidad (UNIQUE) | Registro de atributo codigo para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `tareas` | `JSONB NOT NULL DEFAULT '[]', -- Lista ordenada de referencias a tareas con offset` | Obligatorio (NOT NULL) | Registro de atributo tareas para control de la entidad |
| `regla_aplicacion` | `JSONB NOT NULL DEFAULT '{"evento": "al_iniciar_analisis"}'` | Obligatorio (NOT NULL) | Registro de atributo regla_aplicacion para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_tarea_paquete` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.68 Tabla: `problema_criterio_mayor`
* **Nombre de Entidad**: `problema_criterio_mayor`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema criterio mayor.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_criterio` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_criterio para control de la entidad |
| `nombre` | `VARCHAR(120) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `tipo` | `VARCHAR(40) NOT NULL, -- 'prioridad', 'incidentes_minimos', 'servicio_critico', 'ci_critico', 'duracion_horas', 'manual_supervisor'` | Obligatorio (NOT NULL) | Registro de atributo tipo para control de la entidad |
| `parametros` | `JSONB NOT NULL DEFAULT '{}'` | Obligatorio (NOT NULL) | Registro de atributo parametros para control de la entidad |
| `activo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo activo para control de la entidad |
| `fecha_creacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_criterio_mayor` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.69 Tabla: `problema_config_mayor`
* **Nombre de Entidad**: `problema_config_mayor`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema config mayor.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id para control de la entidad |
| `aplicar_paquete_tareas` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo aplicar_paquete_tareas para control de la entidad |
| `exigir_revision_cierre` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo exigir_revision_cierre para control de la entidad |
| `plazo_revision_dias` | `INT NOT NULL DEFAULT 10` | Obligatorio (NOT NULL) | Registro de atributo plazo_revision_dias para control de la entidad |
| `participantes_roles` | `JSONB NOT NULL DEFAULT '["gestor_problemas", "supervisor", "responsable"]'` | Obligatorio (NOT NULL) | Registro de atributo participantes_roles para control de la entidad |
| `aprobacion_cierre_perfil` | `INT REFERENCES perfiles(id_perfil)` | Clave Foranea (FK) con integridad referencial | Registro de atributo aprobacion_cierre_perfil para control de la entidad |
| `notificar_direccion_al_detectar` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo notificar_direccion_al_detectar para control de la entidad |
| `notificar_direccion_al_cerrar` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo notificar_direccion_al_cerrar para control de la entidad |
| `generar_informe_pdf` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo generar_informe_pdf para control de la entidad |
| `plantilla_preguntas` | `JSONB NOT NULL DEFAULT '[` | Obligatorio (NOT NULL) | Registro de atributo plantilla_preguntas para control de la entidad |
| `{"id":` | `"q1", "pregunta": "¿Qué ocurrió y cuál fue el impacto en el negocio?", "tipo": "texto_largo", "obligatoria": true}` | Estandar | Registro de atributo {"id": para control de la entidad |
| `{"id":` | `"q2", "pregunta": "Cronología detallada de la ocurrencia e investigación", "tipo": "cronologia", "obligatoria": true}` | Estandar | Registro de atributo {"id": para control de la entidad |
| `{"id":` | `"q3", "pregunta": "Causa raíz confirmada", "tipo": "texto_largo", "obligatoria": true}` | Estandar | Registro de atributo {"id": para control de la entidad |
| `{"id":` | `"q4", "pregunta": "¿Qué funcionó bien durante la atención?", "tipo": "texto_largo", "obligatoria": true}` | Estandar | Registro de atributo {"id": para control de la entidad |
| `{"id":` | `"q5", "pregunta": "¿Qué aspectos deben mejorar para evitar recurrencias?", "tipo": "texto_largo", "obligatoria": true}` | Estandar | Registro de atributo {"id": para control de la entidad |
| `{"id":` | `"q6", "pregunta": "Acciones preventivas acordadas", "tipo": "tabla_acciones", "obligatoria": true}` | Estandar | Registro de atributo {"id": para control de la entidad |
| `{"id":` | `"q7", "pregunta": "¿Se actualizó la CMDB?", "tipo": "si_no", "obligatoria": true}` | Estandar | Registro de atributo {"id": para control de la entidad |
| `{"id":` | `"q8", "pregunta": "¿Se publicó conocimiento o lecciones aprendidas?", "tipo": "si_no", "obligatoria": true}` | Estandar | Registro de atributo {"id": para control de la entidad |
| `fecha_modificacion` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | Con valor por defecto (DEFAULT) | Registro de atributo fecha_modificacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_config_mayor` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.70 Tabla: `problema_regla_umbral`
* **Nombre de Entidad**: `problema_regla_umbral`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema regla umbral.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_regla` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_regla para control de la entidad |
| `nombre` | `VARCHAR(150) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo nombre para control de la entidad |
| `descripcion` | `TEXT` | Estandar | Registro de atributo descripcion para control de la entidad |
| `orden` | `INT NOT NULL DEFAULT 1` | Obligatorio (NOT NULL) | Registro de atributo orden para control de la entidad |
| `activa` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo activa para control de la entidad |
| `estados_incluidos` | `JSONB NOT NULL DEFAULT '["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"]'` | Obligatorio (NOT NULL) | Registro de atributo estados_incluidos para control de la entidad |
| `prioridad_minima` | `VARCHAR(10) NOT NULL DEFAULT 'P4'` | Obligatorio (NOT NULL) | Registro de atributo prioridad_minima para control de la entidad |
| `servicios_incluidos` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo servicios_incluidos para control de la entidad |
| `categorias_incluidas` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo categorias_incluidas para control de la entidad |
| `agrupar_por` | `VARCHAR(50) NOT NULL DEFAULT 'servicio'` | Obligatorio (NOT NULL) | Registro de atributo agrupar_por para control de la entidad |
| `sensibilidad_texto` | `VARCHAR(20) DEFAULT 'media'` | Con valor por defecto (DEFAULT) | Registro de atributo sensibilidad_texto para control de la entidad |
| `umbral_incidentes` | `INT NOT NULL DEFAULT 3` | Obligatorio (NOT NULL) | Registro de atributo umbral_incidentes para control de la entidad |
| `ventana_horas` | `INT NOT NULL DEFAULT 24` | Obligatorio (NOT NULL) | Registro de atributo ventana_horas para control de la entidad |
| `accion` | `VARCHAR(50) NOT NULL DEFAULT 'crear_automatico'` | Obligatorio (NOT NULL) | Registro de atributo accion para control de la entidad |
| `id_plantilla` | `INT` | Estandar | Registro de atributo id_plantilla para control de la entidad |
| `prioridad_problema` | `VARCHAR(30) NOT NULL DEFAULT 'maxima_incidentes'` | Obligatorio (NOT NULL) | Registro de atributo prioridad_problema para control de la entidad |
| `id_departamento_destino` | `INT` | Estandar | Registro de atributo id_departamento_destino para control de la entidad |
| `vincular_incidentes` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo vincular_incidentes para control de la entidad |
| `evitar_duplicados` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo evitar_duplicados para control de la entidad |
| `enfriamiento_horas` | `INT NOT NULL DEFAULT 24` | Obligatorio (NOT NULL) | Registro de atributo enfriamiento_horas para control de la entidad |
| `notificar_destinatarios` | `JSONB NOT NULL DEFAULT '["gestor_problemas"]'` | Obligatorio (NOT NULL) | Registro de atributo notificar_destinatarios para control de la entidad |
| `notificar_plantilla` | `VARCHAR(100) DEFAULT 'alerta_umbral_problema'` | Con valor por defecto (DEFAULT) | Registro de atributo notificar_plantilla para control de la entidad |
| `ultima_ejecucion` | `TIMESTAMPTZ` | Estandar | Registro de atributo ultima_ejecucion para control de la entidad |
| `problemas_generados` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo problemas_generados para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_regla_umbral` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.71 Tabla: `problema_regla_umbral_ejecucion`
* **Nombre de Entidad**: `problema_regla_umbral_ejecucion`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema regla umbral ejecucion.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_ejecucion` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_ejecucion para control de la entidad |
| `id_regla` | `INT REFERENCES problema_regla_umbral(id_regla) ON DELETE CASCADE` | Clave Foranea (FK) con integridad referencial | Registro de atributo id_regla para control de la entidad |
| `fecha_ejecucion` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Obligatorio (NOT NULL) | Registro de atributo fecha_ejecucion para control de la entidad |
| `incidentes_analizados` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo incidentes_analizados para control de la entidad |
| `grupos_detectados` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo grupos_detectados para control de la entidad |
| `problemas_creados` | `INT NOT NULL DEFAULT 0` | Obligatorio (NOT NULL) | Registro de atributo problemas_creados para control de la entidad |
| `detalle` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo detalle para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_regla_umbral_ejecucion` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.72 Tabla: `problema_config_incidentes_vinculados`
* **Nombre de Entidad**: `problema_config_incidentes_vinculados`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema config incidentes vinculados.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_config` | `INT PRIMARY KEY DEFAULT 1` | Clave Primaria (PK) | Registro de atributo id_config para control de la entidad |
| `tipos_vinculo` | `JSONB NOT NULL DEFAULT '["Causado por el problema", "Relacionado", "Posible causa"]'` | Obligatorio (NOT NULL) | Registro de atributo tipos_vinculo para control de la entidad |
| `estados_incidente_permitidos` | `JSONB NOT NULL DEFAULT '["NUEVO", "ASIGNADO", "EN_PROCESO", "PENDIENTE_TERCERO", "PENDIENTE_USUARIO"]'` | Obligatorio (NOT NULL) | Registro de atributo estados_incidente_permitidos para control de la entidad |
| `max_incidentes_por_problema` | `INT NOT NULL DEFAULT 500` | Obligatorio (NOT NULL) | Registro de atributo max_incidentes_por_problema para control de la entidad |
| `permitir_vinculo_multiple_abierto` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo permitir_vinculo_multiple_abierto para control de la entidad |
| `heredar_servicio` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo heredar_servicio para control de la entidad |
| `heredar_ci` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo heredar_ci para control de la entidad |
| `heredar_categoria` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo heredar_categoria para control de la entidad |
| `perfiles_desvincular` | `JSONB NOT NULL DEFAULT '[1, 10]'` | Obligatorio (NOT NULL) | Registro de atributo perfiles_desvincular para control de la entidad |
| `motivo_desvincular_obligatorio` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo motivo_desvincular_obligatorio para control de la entidad |
| `mostrar_banner_incidente` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo mostrar_banner_incidente para control de la entidad |
| `mostrar_workaround_incidente` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo mostrar_workaround_incidente para control de la entidad |
| `audiencia_workaround_mesa` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo audiencia_workaround_mesa para control de la entidad |
| `audiencia_workaround_tecnicos` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo audiencia_workaround_tecnicos para control de la entidad |
| `audiencia_workaround_solicitante` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo audiencia_workaround_solicitante para control de la entidad |
| `sugerir_problema_registro_incidente` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo sugerir_problema_registro_incidente para control de la entidad |
| `accion_error_conocido` | `VARCHAR(50) NOT NULL DEFAULT 'agregar_nota_workaround'` | Obligatorio (NOT NULL) | Registro de atributo accion_error_conocido para control de la entidad |
| `politica_cierre` | `VARCHAR(50) NOT NULL DEFAULT 'C_resolucion_asistida'` | Obligatorio (NOT NULL) | Registro de atributo politica_cierre para control de la entidad |
| `codigo_resolucion_masiva` | `VARCHAR(80) DEFAULT 'Solventado por resolución de problema'` | Con valor por defecto (DEFAULT) | Registro de atributo codigo_resolucion_masiva para control de la entidad |
| `plantilla_nota_masiva` | `TEXT DEFAULT 'Incidente resuelto automáticamente mediante la solución permanente del problema {problema_id}: {solucion}'` | Con valor por defecto (DEFAULT) | Registro de atributo plantilla_nota_masiva para control de la entidad |
| `notificar_solicitantes_masiva` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo notificar_solicitantes_masiva para control de la entidad |
| `exigir_sin_incidentes_abiertos` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo exigir_sin_incidentes_abiertos para control de la entidad |
| `fecha_actualizacion` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Obligatorio (NOT NULL) | Registro de atributo fecha_actualizacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_config_incidentes_vinculados` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.73 Tabla: `problema_config_kedb`
* **Nombre de Entidad**: `problema_config_kedb`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema config kedb.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_config` | `INT PRIMARY KEY DEFAULT 1` | Clave Primaria (PK) | Registro de atributo id_config para control de la entidad |
| `req_workaround` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo req_workaround para control de la entidad |
| `req_sintomas` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo req_sintomas para control de la entidad |
| `req_servicio_ci` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo req_servicio_ci para control de la entidad |
| `req_causa_raiz` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo req_causa_raiz para control de la entidad |
| `req_instrucciones_paso_paso` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo req_instrucciones_paso_paso para control de la entidad |
| `req_aprobacion_gestor` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo req_aprobacion_gestor para control de la entidad |
| `perfil_aprobador` | `INT DEFAULT 10` | Con valor por defecto (DEFAULT) | Registro de atributo perfil_aprobador para control de la entidad |
| `estados_ciclo` | `JSONB NOT NULL DEFAULT '["Borrador", "En revisión", "Publicado", "Retirado"]'` | Obligatorio (NOT NULL) | Registro de atributo estados_ciclo para control de la entidad |
| `publicacion_directa_perfiles` | `JSONB NOT NULL DEFAULT '[1, 10]'` | Obligatorio (NOT NULL) | Registro de atributo publicacion_directa_perfiles para control de la entidad |
| `revision_periodica_meses` | `INT NOT NULL DEFAULT 6` | Obligatorio (NOT NULL) | Registro de atributo revision_periodica_meses para control de la entidad |
| `recordatorio_dias_antes` | `INT NOT NULL DEFAULT 15` | Obligatorio (NOT NULL) | Registro de atributo recordatorio_dias_antes para control de la entidad |
| `pasar_a_revision_si_vence` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo pasar_a_revision_si_vence para control de la entidad |
| `retiro_automatico_solucion_permanente` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo retiro_automatico_solucion_permanente para control de la entidad |
| `audiencia_mesa_servicio` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo audiencia_mesa_servicio para control de la entidad |
| `audiencia_tecnicos_todos` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo audiencia_tecnicos_todos para control de la entidad |
| `audiencia_tecnicos_grupo` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo audiencia_tecnicos_grupo para control de la entidad |
| `audiencia_autoservicio_portal` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo audiencia_autoservicio_portal para control de la entidad |
| `sugerir_ke_en_incidente` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo sugerir_ke_en_incidente para control de la entidad |
| `peso_servicio` | `INT NOT NULL DEFAULT 4` | Obligatorio (NOT NULL) | Registro de atributo peso_servicio para control de la entidad |
| `peso_categoria` | `INT NOT NULL DEFAULT 3` | Obligatorio (NOT NULL) | Registro de atributo peso_categoria para control de la entidad |
| `peso_ci` | `INT NOT NULL DEFAULT 5` | Obligatorio (NOT NULL) | Registro de atributo peso_ci para control de la entidad |
| `peso_clase_ci` | `INT NOT NULL DEFAULT 2` | Obligatorio (NOT NULL) | Registro de atributo peso_clase_ci para control de la entidad |
| `peso_palabras_titulo` | `INT NOT NULL DEFAULT 4` | Obligatorio (NOT NULL) | Registro de atributo peso_palabras_titulo para control de la entidad |
| `peso_palabras_descripcion` | `INT NOT NULL DEFAULT 3` | Obligatorio (NOT NULL) | Registro de atributo peso_palabras_descripcion para control de la entidad |
| `umbral_minimo_coincidencia` | `INT NOT NULL DEFAULT 60` | Obligatorio (NOT NULL) | Registro de atributo umbral_minimo_coincidencia para control de la entidad |
| `maximo_sugerencias` | `INT NOT NULL DEFAULT 5` | Obligatorio (NOT NULL) | Registro de atributo maximo_sugerencias para control de la entidad |
| `campos_ke` | `JSONB NOT NULL DEFAULT '[` | Obligatorio (NOT NULL) | Registro de atributo campos_ke para control de la entidad |
| `{"codigo":` | `"id_ke", "nombre": "ID de Error Conocido", "tipo": "sistema", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"titulo", "nombre": "Título del Error Conocido", "tipo": "texto", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"sintomas", "nombre": "Síntomas y Detección", "tipo": "textarea", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"causa", "nombre": "Causa Raíz", "tipo": "textarea", "obligatorio": false}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"workaround", "nombre": "Solución Temporal (Workaround)", "tipo": "textarea", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"solucion_definitiva", "nombre": "Solución Permanente Planificada", "tipo": "textarea", "obligatorio": false}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"servicios_ci", "nombre": "Servicios y Elementos de Configuración", "tipo": "relacion", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"audiencia", "nombre": "Audiencia Destino", "tipo": "lista", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"estado", "nombre": "Estado de Ciclo KEDB", "tipo": "estado", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"responsable", "nombre": "Especialista Responsable", "tipo": "usuario", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"proxima_revision", "nombre": "Fecha de Próxima Revisión", "tipo": "fecha", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `{"codigo":` | `"problema_origen", "nombre": "Problema de Origen", "tipo": "relacion", "obligatorio": true}` | Estandar | Registro de atributo {"codigo": para control de la entidad |
| `fecha_actualizacion` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Obligatorio (NOT NULL) | Registro de atributo fecha_actualizacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_config_kedb` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.74 Tabla: `problema_config_rfc`
* **Nombre de Entidad**: `problema_config_rfc`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema config rfc.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_config` | `INT PRIMARY KEY DEFAULT 1` | Clave Primaria (PK) | Registro de atributo id_config para control de la entidad |
| `exigir_rfc_para_pendiente_cambio` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo exigir_rfc_para_pendiente_cambio para control de la entidad |
| `permitir_varias_rfc` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo permitir_varias_rfc para control de la entidad |
| `maximo_rfc` | `INT NOT NULL DEFAULT 5` | Obligatorio (NOT NULL) | Registro de atributo maximo_rfc para control de la entidad |
| `tipo_cambio_sugerido` | `VARCHAR(30) NOT NULL DEFAULT 'Normal'` | Obligatorio (NOT NULL) | Registro de atributo tipo_cambio_sugerido para control de la entidad |
| `regla_p1_riesgo_recurrencia` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo regla_p1_riesgo_recurrencia para control de la entidad |
| `mapeo_campos` | `JSONB NOT NULL DEFAULT '[` | Obligatorio (NOT NULL) | Registro de atributo mapeo_campos para control de la entidad |
| `{"origen":` | `"titulo", "campo_problema": "Título", "destino": "titulo", "campo_rfc": "Título del cambio"}` | Estandar | Registro de atributo {"origen": para control de la entidad |
| `{"origen":` | `"descripcion", "campo_problema": "Descripción", "destino": "justificacion", "campo_rfc": "Motivo y Justificación"}` | Estandar | Registro de atributo {"origen": para control de la entidad |
| `{"origen":` | `"solucion_permanente", "campo_problema": "Solución permanente", "destino": "descripcion", "campo_rfc": "Descripción detallada del cambio"}` | Estandar | Registro de atributo {"origen": para control de la entidad |
| `{"origen":` | `"servicio", "campo_problema": "Servicio afectado", "destino": "servicio", "campo_rfc": "Servicio de TI afectado"}` | Estandar | Registro de atributo {"origen": para control de la entidad |
| `{"origen":` | `"ci_afectados", "campo_problema": "CI afectados", "destino": "activos_ci", "campo_rfc": "Activos y Elementos de Configuración"}` | Estandar | Registro de atributo {"origen": para control de la entidad |
| `{"origen":` | `"prioridad", "campo_problema": "Prioridad del problema", "destino": "urgencia", "campo_rfc": "Urgencia sugerida del cambio"}` | Estandar | Registro de atributo {"origen": para control de la entidad |
| `{"origen":` | `"codigo_problema", "campo_problema": "Código de problema", "destino": "origen_cambio", "campo_rfc": "Origen = Problema (vínculo trazable)"}` | Estandar | Registro de atributo {"origen": para control de la entidad |
| `exigir_todas_rfc_implementadas_exito` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo exigir_todas_rfc_implementadas_exito para control de la entidad |
| `accion_rfc_fallida` | `VARCHAR(50) NOT NULL DEFAULT 'volver_causa_raiz'` | Obligatorio (NOT NULL) | Registro de atributo accion_rfc_fallida para control de la entidad |
| `crear_tarea_rfc_fallida` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo crear_tarea_rfc_fallida para control de la entidad |
| `plantilla_tarea_rfc_fallida` | `VARCHAR(255) DEFAULT 'Evaluar alternativa técnica tras rechazo/falla de cambio RFC-{rfc_id}'` | Con valor por defecto (DEFAULT) | Registro de atributo plantilla_tarea_rfc_fallida para control de la entidad |
| `notificar_roles_rfc_fallida` | `JSONB NOT NULL DEFAULT '["gestor_problemas", "responsable_problema"]'` | Obligatorio (NOT NULL) | Registro de atributo notificar_roles_rfc_fallida para control de la entidad |
| `pasar_automatico_a_resuelto` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo pasar_automatico_a_resuelto para control de la entidad |
| `verificacion_post_cambio_dias` | `INT NOT NULL DEFAULT 7` | Obligatorio (NOT NULL) | Registro de atributo verificacion_post_cambio_dias para control de la entidad |
| `sincronizacion_tiempo_real` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo sincronizacion_tiempo_real para control de la entidad |
| `fecha_actualizacion` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Obligatorio (NOT NULL) | Registro de atributo fecha_actualizacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_config_rfc` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.75 Tabla: `problema_config_conocimiento`
* **Nombre de Entidad**: `problema_config_conocimiento`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema config conocimiento.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_config` | `INT PRIMARY KEY DEFAULT 1` | Clave Primaria (PK) | Registro de atributo id_config para control de la entidad |
| `generar_al_publicar_ke` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo generar_al_publicar_ke para control de la entidad |
| `generar_al_resolver` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo generar_al_resolver para control de la entidad |
| `generar_al_cerrar` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo generar_al_cerrar para control de la entidad |
| `solo_manual` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo solo_manual para control de la entidad |
| `tipo_articulo_por_evento` | `JSONB NOT NULL DEFAULT '{` | Obligatorio (NOT NULL) | Registro de atributo tipo_articulo_por_evento para control de la entidad |
| `"publicar_ke":` | `"Error conocido (workaround)"` | Estandar | Registro de atributo "publicar_ke": para control de la entidad |
| `"resolver":` | `"Solución definitiva"` | Estandar | Registro de atributo "resolver": para control de la entidad |
| `"cerrar":` | `"Guía de resolución y lecciones aprendidas"` | Estandar | Registro de atributo "cerrar": para control de la entidad |
| `plantilla_mapeo` | `JSONB NOT NULL DEFAULT '{` | Obligatorio (NOT NULL) | Registro de atributo plantilla_mapeo para control de la entidad |
| `"sintomas":` | `"descripcion"` | Estandar | Registro de atributo "sintomas": para control de la entidad |
| `"causa":` | `"causa_raiz"` | Estandar | Registro de atributo "causa": para control de la entidad |
| `"workaround":` | `"workaround"` | Estandar | Registro de atributo "workaround": para control de la entidad |
| `"solucion":` | `"solucion_permanente"` | Estandar | Registro de atributo "solucion": para control de la entidad |
| `"servicios_ci":` | `"lista_afectados"` | Estandar | Registro de atributo "servicios_ci": para control de la entidad |
| `"referencia":` | `"enlace_problema"` | Estandar | Registro de atributo "referencia": para control de la entidad |
| `"palabras_clave":` | `"categoria_mas_servicio"` | Estandar | Registro de atributo "palabras_clave": para control de la entidad |
| `audiencia_defecto` | `VARCHAR(50) DEFAULT 'segun_error_conocido'` | Con valor por defecto (DEFAULT) | Registro de atributo audiencia_defecto para control de la entidad |
| `id_categoria_defecto` | `INT DEFAULT 1` | Con valor por defecto (DEFAULT) | Registro de atributo id_categoria_defecto para control de la entidad |
| `responsable_revision` | `VARCHAR(50) NOT NULL DEFAULT 'responsable_categoria'` | Obligatorio (NOT NULL) | Registro de atributo responsable_revision para control de la entidad |
| `articulo_obligatorio_para_cerrar` | `BOOLEAN NOT NULL DEFAULT false` | Obligatorio (NOT NULL) | Registro de atributo articulo_obligatorio_para_cerrar para control de la entidad |
| `excepciones_codigos_cierre` | `JSONB NOT NULL DEFAULT '["Cerrado – no reproducible", "Cerrado – duplicado"]'` | Obligatorio (NOT NULL) | Registro de atributo excepciones_codigos_cierre para control de la entidad |
| `estado_inicial_borrador` | `VARCHAR(30) NOT NULL DEFAULT 'Borrador'` | Obligatorio (NOT NULL) | Registro de atributo estado_inicial_borrador para control de la entidad |
| `fecha_actualizacion` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Obligatorio (NOT NULL) | Registro de atributo fecha_actualizacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_config_conocimiento` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.76 Tabla: `problema_config_cmdb`
* **Nombre de Entidad**: `problema_config_cmdb`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema config cmdb.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_config` | `INT PRIMARY KEY DEFAULT 1` | Clave Primaria (PK) | Registro de atributo id_config para control de la entidad |
| `herencia_ci_desde_incidentes` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo herencia_ci_desde_incidentes para control de la entidad |
| `validar_relacion_ci_servicio` | `VARCHAR(30) NOT NULL DEFAULT 'avisar'` | Obligatorio (NOT NULL) | Registro de atributo validar_relacion_ci_servicio para control de la entidad |
| `clases_ci_permitidas` | `JSONB NOT NULL DEFAULT '[]'` | Obligatorio (NOT NULL) | Registro de atributo clases_ci_permitidas para control de la entidad |
| `maximo_ci_por_problema` | `INT NOT NULL DEFAULT 100` | Obligatorio (NOT NULL) | Registro de atributo maximo_ci_por_problema para control de la entidad |
| `mostrar_marca_problema_abierto` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo mostrar_marca_problema_abierto para control de la entidad |
| `mostrar_marca_ke_vigente` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo mostrar_marca_ke_vigente para control de la entidad |
| `sugerir_impacto_alto_si_criticidad_mayor` | `VARCHAR(30) DEFAULT 'CRITICO'` | Con valor por defecto (DEFAULT) | Registro de atributo sugerir_impacto_alto_si_criticidad_mayor para control de la entidad |
| `servicio_critico_activa_problema_mayor` | `BOOLEAN NOT NULL DEFAULT true` | Obligatorio (NOT NULL) | Registro de atributo servicio_critico_activa_problema_mayor para control de la entidad |
| `accion_baja_ci_con_problemas` | `VARCHAR(30) NOT NULL DEFAULT 'avisar_responsable'` | Obligatorio (NOT NULL) | Registro de atributo accion_baja_ci_con_problemas para control de la entidad |
| `fecha_actualizacion` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Obligatorio (NOT NULL) | Registro de atributo fecha_actualizacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_config_cmdb` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

### 4.77 Tabla: `problema_relaciones_version`
* **Nombre de Entidad**: `problema_relaciones_version`
* **Motor y Esquema**: PostgreSQL 15 / Esquema public
* **Finalidad en ITIL v4**: Soporta la persistencia de datos relacionales para el modulo de problema relaciones version.

#### Diccionario de Columnas
| Nombre de Columna | Definicion SQL / Tipo | Restriccion e Integridad | Proposito Funcional |
|:---|:---|:---|:---|
| `id_version` | `SERIAL PRIMARY KEY` | Clave Primaria (PK) | Registro de atributo id_version para control de la entidad |
| `numero_version` | `INT NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo numero_version para control de la entidad |
| `estado` | `VARCHAR(20) NOT NULL DEFAULT 'publicado'` | Obligatorio (NOT NULL) | Registro de atributo estado para control de la entidad |
| `datos` | `JSONB NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo datos para control de la entidad |
| `motivo_cambio` | `VARCHAR(255) NOT NULL` | Obligatorio (NOT NULL) | Registro de atributo motivo_cambio para control de la entidad |
| `creado_por` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo creado_por para control de la entidad |
| `publicado_por` | `INT REFERENCES usuario(id_usuario)` | Clave Foranea (FK) con integridad referencial | Registro de atributo publicado_por para control de la entidad |
| `fecha_creacion` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Obligatorio (NOT NULL) | Registro de atributo fecha_creacion para control de la entidad |
| `fecha_publicacion` | `TIMESTAMPTZ` | Estandar | Registro de atributo fecha_publicacion para control de la entidad |

#### Reglas de Integridad y Relaciones
La entidad `problema_relaciones_version` mantiene relaciones foraneas e indices para optimizar busquedas concurrentes.
Toda insercion o modificacion respeta la consistencia referencial con borrado seguro o restringido.

## CAPITULO 5: CATALOGO EXHAUSTIVO DE ENDPOINTS DE LA API (119 ROUTE HANDLERS)

Este capitulo contiene la documentacion profunda de cada una de las 119 rutas de backend en `src/app/api/`.
Para cada ruta se especifican los metodos soportados, parametros, cuerpo esperado, consultas a la base de datos, respuestas y codigos de error.

### 5.1 Endpoint: `/api/activos/[id]/historial`
* **Ruta Canonica**: `/api/activos/[id]/historial`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/activos/[id]/historial/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/activos/[id]/historial`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT h.id_historial, h.id_activo, h.estado_anterior, h.estado_nuevo,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.2 Endpoint: `/api/activos/cmdb/relaciones`
* **Ruta Canonica**: `/api/activos/cmdb/relaciones`
* **Metodos HTTP Disponibles**: `POST`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/activos/cmdb/relaciones/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/activos/cmdb/relaciones`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id_ci_padre` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id_ci_hijo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_ci_padre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_ci_hijo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo_relacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_ci_padre": "valor_de_ejemplo",
  "id_ci_hijo": "valor_de_ejemplo",
  "tipo_relacion": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO ci_relacion (id_ci_padre, id_ci_hijo, tipo_relacion) VALUES ($1, $2, $3) ON CONFLICT (id_ci_padre, id_ci_hijo) DO UPDATE SET tipo_relacion = EXCLUDED.tipo_relacion
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.3 Endpoint: `/api/activos/cmdb`
* **Ruta Canonica**: `/api/activos/cmdb`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/activos/cmdb/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/activos/cmdb`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `tipo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `criticidad` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_ci` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_ci": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT ci.id_ci, ci.id_activo, a.codigo_patrimonial AS activo_codigo, ci.codigo_ci,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.4 Endpoint: `/api/activos/licencias/asignaciones`
* **Ruta Canonica**: `/api/activos/licencias/asignaciones`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/activos/licencias/asignaciones/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/activos/licencias/asignaciones`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id_licencia` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `activas` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_licencia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_usuario` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fecha_asignacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_asignacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo_devolucion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_licencia": "valor_de_ejemplo",
  "id_usuario": "valor_de_ejemplo",
  "id_activo": "valor_de_ejemplo",
  "fecha_asignacion": "valor_de_ejemplo",
  "id_asignacion": "valor_de_ejemplo",
  "motivo_devolucion": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT la.id_asignacion, la.id_licencia, ls.nombre_software, ls.fabricante,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.5 Endpoint: `/api/activos/licencias`
* **Ruta Canonica**: `/api/activos/licencias`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/activos/licencias/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/activos/licencias`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombre_software` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fabricante` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `clave_licencia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo_licencia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `cantidad_adquirida` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `cantidad_en_uso` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fecha_vencimiento` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `costo_anual` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_licencia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombre_software": "valor_de_ejemplo",
  "fabricante": "valor_de_ejemplo",
  "clave_licencia": "valor_de_ejemplo",
  "tipo_licencia": "valor_de_ejemplo",
  "cantidad_adquirida": "valor_de_ejemplo",
  "cantidad_en_uso": "valor_de_ejemplo",
  "fecha_vencimiento": "valor_de_ejemplo",
  "costo_anual": "valor_de_ejemplo",
  "id_licencia": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_licencia, nombre_software, fabricante, tipo_licencia,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.6 Endpoint: `/api/activos/modelos`
* **Ruta Canonica**: `/api/activos/modelos`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/activos/modelos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/activos/modelos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_tipo_activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fabricante` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre_modelo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `atributos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `vida_util_meses` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `metodo_depreciacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `valor_residual_pct` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_tipo_activo": "valor_de_ejemplo",
  "fabricante": "valor_de_ejemplo",
  "nombre_modelo": "valor_de_ejemplo",
  "atributos": "valor_de_ejemplo",
  "vida_util_meses": "valor_de_ejemplo",
  "metodo_depreciacion": "valor_de_ejemplo",
  "valor_residual_pct": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT m.id_modelo, m.id_tipo_activo, t.codigo AS tipo_codigo, t.nombre AS tipo_nombre,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.7 Endpoint: `/api/activos`
* **Ruta Canonica**: `/api/activos`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/activos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/activos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `tipo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `codigo_patrimonial` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `numero_serie` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo_activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `marca` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `modelo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_modelo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `atributos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `valor_residual` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `vida_util_meses` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_departamento` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_usuario_custodio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estado_activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fecha_adquisicion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fecha_fin_garantia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `costo_compra` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "codigo_patrimonial": "valor_de_ejemplo",
  "numero_serie": "valor_de_ejemplo",
  "tipo_activo": "valor_de_ejemplo",
  "marca": "valor_de_ejemplo",
  "modelo": "valor_de_ejemplo",
  "id_modelo": "valor_de_ejemplo",
  "atributos": "valor_de_ejemplo",
  "valor_residual": "valor_de_ejemplo",
  "vida_util_meses": "valor_de_ejemplo",
  "id_departamento": "valor_de_ejemplo",
  "id_usuario_custodio": "valor_de_ejemplo",
  "estado_activo": "valor_de_ejemplo",
  "fecha_adquisicion": "valor_de_ejemplo",
  "fecha_fin_garantia": "valor_de_ejemplo",
  "costo_compra": "valor_de_ejemplo",
  "id_activo": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT a.id_activo, a.codigo_patrimonial, a.numero_serie, a.tipo_activo,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.8 Endpoint: `/api/activos/tipos`
* **Ruta Canonica**: `/api/activos/tipos`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/activos/tipos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/activos/tipos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `codigo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `clase` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `atributos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "codigo": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "clase": "valor_de_ejemplo",
  "atributos": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO tipo_activo_catalogo (codigo, nombre, clase, atributos, usuario_modificacion, fecha_modificacion) VALUES ($1, $2, $3, $4, $5, now()) RETURNING *
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.9 Endpoint: `/api/admin/activos-config/ciclos-vida-transiciones/configuracion`
* **Ruta Canonica**: `/api/admin/activos-config/ciclos-vida-transiciones/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/activos-config/ciclos-vida-transiciones/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/activos-config/ciclos-vida-transiciones/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `pestana` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `snapshot` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `version_id_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `diff` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "pestana": "valor_de_ejemplo",
  "snapshot": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "version_id_origen": "valor_de_ejemplo",
  "diff": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion FROM configuracion_modulo_versiones WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_publicada = true ORDER BY num...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.10 Endpoint: `/api/admin/activos-config/cmdb-relaciones/configuracion`
* **Ruta Canonica**: `/api/admin/activos-config/cmdb-relaciones/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/activos-config/cmdb-relaciones/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/activos-config/cmdb-relaciones/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `pestana` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `snapshot` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `diff` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "pestana": "valor_de_ejemplo",
  "snapshot": "valor_de_ejemplo",
  "accion": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "diff": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion FROM configuracion_modulo_versiones WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.4' AND pestana = $1 AND es_publicada = true ORDER BY num...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.11 Endpoint: `/api/admin/activos-config/licencias-contratos/configuracion`
* **Ruta Canonica**: `/api/admin/activos-config/licencias-contratos/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/activos-config/licencias-contratos/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/activos-config/licencias-contratos/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `pestana` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `snapshot` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `version_id_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `diff` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "pestana": "valor_de_ejemplo",
  "snapshot": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "version_id_origen": "valor_de_ejemplo",
  "diff": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion FROM configuracion_modulo_versiones WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_publicada = true ORDER BY num...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.12 Endpoint: `/api/admin/activos-config/tipos-modelos-atributos/configuracion`
* **Ruta Canonica**: `/api/admin/activos-config/tipos-modelos-atributos/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/activos-config/tipos-modelos-atributos/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/activos-config/tipos-modelos-atributos/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `pestana` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `snapshot` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `version_id_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `impacto_resumen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "pestana": "valor_de_ejemplo",
  "snapshot": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "version_id_origen": "valor_de_ejemplo",
  "impacto_resumen": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion FROM configuracion_modulo_versiones WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_publicada = true ORDER BY num...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.13 Endpoint: `/api/admin/auditoria-sistema`
* **Ruta Canonica**: `/api/admin/auditoria-sistema`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/admin/auditoria-sistema/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/auditoria-sistema`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `modulo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `accion` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `buscar` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `fecha_desde` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `fecha_hasta` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT l.id_log, l.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as usuario_nombre, u.correo_electronico as usuario_correo,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.14 Endpoint: `/api/admin/cambios/campos-personalizados`
* **Ruta Canonica**: `/api/admin/cambios/campos-personalizados`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/campos-personalizados/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/campos-personalizados`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id_campo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_campo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `etiqueta` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `propiedades` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `formularios_visibles` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pestana_vista` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `seccion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `obligatorio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `reglas_condicionales` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_campo": "valor_de_ejemplo",
  "etiqueta": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "activo": "valor_de_ejemplo",
  "propiedades": "valor_de_ejemplo",
  "formularios_visibles": "valor_de_ejemplo",
  "pestana_vista": "valor_de_ejemplo",
  "seccion": "valor_de_ejemplo",
  "obligatorio": "valor_de_ejemplo",
  "reglas_condicionales": "valor_de_ejemplo",
  "orden": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT c.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as creador_nombre FROM campo_personalizado c LEFT JOIN usuario u ON u.id_usuario = c.usuario_creacion WHERE c.entidad = 'cambio' ORDER BY c.orden, c.id_campo
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.15 Endpoint: `/api/admin/cambios/catalogos`
* **Ruta Canonica**: `/api/admin/cambios/catalogos`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/catalogos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/catalogos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `catalogo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id_item` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_destino` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `catalogo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_item` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `color` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `atributos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_padre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "id_origen": "valor_de_ejemplo",
  "id_destino": "valor_de_ejemplo",
  "catalogo": "valor_de_ejemplo",
  "id_item": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "color": "valor_de_ejemplo",
  "orden": "valor_de_ejemplo",
  "activo": "valor_de_ejemplo",
  "atributos": "valor_de_ejemplo",
  "id_padre": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT c.*, p.nombre as padre_nombre, CONCAT(u.nombres, ' ', u.apellido_paterno) as creador_nombre FROM cambio_catalogo_item c LEFT JOIN cambio_catalogo_item p ON p.id_item = c.id_padre LEFT JOIN usuario u ON u.id_usuario = c.usuario_creacion
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.16 Endpoint: `/api/admin/cambios/cuestionario-riesgo`
* **Ruta Canonica**: `/api/admin/cambios/cuestionario-riesgo`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/cuestionario-riesgo/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/cuestionario-riesgo`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT snapshot FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.1' AND pestana = 'cuestionario_riesgo' ORDER BY es_borrador DESC, numero_version DESC LIMIT 1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.17 Endpoint: `/api/admin/cambios/flujo-evaluacion/configuracion`
* **Ruta Canonica**: `/api/admin/cambios/flujo-evaluacion/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/flujo-evaluacion/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/flujo-evaluacion/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pestana` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `snapshot` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `version_id_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `impacto_resumen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "pestana": "valor_de_ejemplo",
  "snapshot": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "version_id_origen": "valor_de_ejemplo",
  "impacto_resumen": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_publicada = true ORDER ...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.18 Endpoint: `/api/admin/cambios/flujo-evaluacion/simular-escalamiento`
* **Ruta Canonica**: `/api/admin/cambios/flujo-evaluacion/simular-escalamiento`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/flujo-evaluacion/simular-escalamiento/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/flujo-evaluacion/simular-escalamiento`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `prioridad = "p2"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo_cambio = "normal"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fase = "autorizacion"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `horas_transcurridas = 18` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `parametros_custom` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "prioridad = "p2"": "valor_de_ejemplo",
  "tipo_cambio = "normal"": "valor_de_ejemplo",
  "fase = "autorizacion"": "valor_de_ejemplo",
  "horas_transcurridas = 18": "valor_de_ejemplo",
  "parametros_custom": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT snapshot FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'plazos_escalamiento' AND es_publicada = true ORDER BY numero_version DESC LIMIT 1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.19 Endpoint: `/api/admin/cambios/flujo-evaluacion/simular-etapas`
* **Ruta Canonica**: `/api/admin/cambios/flujo-evaluacion/simular-etapas`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/flujo-evaluacion/simular-etapas/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/flujo-evaluacion/simular-etapas`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `tipo_cambio = "normal"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nivel_riesgo = "medio"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `solicitante_id = 6` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `requiere_interrupcion = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fuera_de_ventana = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `dentro_congelamiento = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "tipo_cambio = "normal"": "valor_de_ejemplo",
  "nivel_riesgo = "medio"": "valor_de_ejemplo",
  "solicitante_id = 6": "valor_de_ejemplo",
  "requiere_interrupcion = false": "valor_de_ejemplo",
  "fuera_de_ventana = false": "valor_de_ejemplo",
  "dentro_congelamiento = false": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT snapshot FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'etapas_aprobacion' AND es_publicada = true ORDER BY numero_version DESC LIMIT 1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.20 Endpoint: `/api/admin/cambios/flujo-evaluacion/simular-quorum`
* **Ruta Canonica**: `/api/admin/cambios/flujo-evaluacion/simular-quorum`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/flujo-evaluacion/simular-quorum/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/flujo-evaluacion/simular-quorum`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `comite_id = "cab"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `miembros = []` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `parametros_custom` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "comite_id = "cab"": "valor_de_ejemplo",
  "miembros = []": "valor_de_ejemplo",
  "parametros_custom": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT snapshot FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'comites' AND es_publicada = true ORDER BY numero_version DESC LIMIT 1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.21 Endpoint: `/api/admin/cambios/flujo-evaluacion/validar-flujo`
* **Ruta Canonica**: `/api/admin/cambios/flujo-evaluacion/validar-flujo`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/flujo-evaluacion/validar-flujo/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/flujo-evaluacion/validar-flujo`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT snapshot FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'estados' AND es_publicada = true ORDER BY numero_version DESC LIMIT 1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.22 Endpoint: `/api/admin/cambios/formulario/configuracion`
* **Ruta Canonica**: `/api/admin/cambios/formulario/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/formulario/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/formulario/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pantalla` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `ambito` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `pantalla = "1.3.3.1"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pestana = "campos"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `snapshot` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo = "Guardado de borrador"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "pantalla = "1.3.3.1"": "valor_de_ejemplo",
  "pestana = "campos"": "valor_de_ejemplo",
  "accion": "valor_de_ejemplo",
  "snapshot": "valor_de_ejemplo",
  "motivo = "Guardado de borrador"": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT b.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as nombres, b.fecha_bloqueo FROM bloqueo_edicion_concurrente b JOIN usuario u ON u.id_usuario = b.id_usuario WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.23 Endpoint: `/api/admin/cambios/matriz-autoridad/simular`
* **Ruta Canonica**: `/api/admin/cambios/matriz-autoridad/simular`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/matriz-autoridad/simular/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/matriz-autoridad/simular`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `tipo_cambio = "normal"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nivel_riesgo = "bajo"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `criticidad_maxima = "baja"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `entorno = "produccion"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `requiere_interrupcion = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fuera_de_ventana = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `dentro_congelamiento = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `modelo_aprobado = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "tipo_cambio = "normal"": "valor_de_ejemplo",
  "nivel_riesgo = "bajo"": "valor_de_ejemplo",
  "criticidad_maxima = "baja"": "valor_de_ejemplo",
  "entorno = "produccion"": "valor_de_ejemplo",
  "requiere_interrupcion = false": "valor_de_ejemplo",
  "fuera_de_ventana = false": "valor_de_ejemplo",
  "dentro_congelamiento = false": "valor_de_ejemplo",
  "modelo_aprobado = false": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT snapshot FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = 'matriz_autoridad' ORDER BY es_borrador DESC, numero_version DESC LIMIT 1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.24 Endpoint: `/api/admin/cambios/modelos-estandar`
* **Ruta Canonica**: `/api/admin/cambios/modelos-estandar`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/modelos-estandar/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/modelos-estandar`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `categoria_id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `busqueda` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `solo_aprobados` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `codigo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `categoria_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `propietario_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `vigencia_desde` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `vigencia_hasta` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `servicios_aplicables` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `clases_ci_aplicables` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `entornos_permitidos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `riesgo_fijo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `autorizacion_automatica` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `etapa_minima_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `lista_elegibilidad` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `contenido_prellenado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `campos_bloqueados` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `ventanas_permitidas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `anticipacion_horas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `limite_frecuencia_ci` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `paquete_tareas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `checklist_items` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `control_calidad_activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `umbral_tasa_fallo_pct` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `umbral_fallos_consecutivos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `dias_observacion_calidad` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `revision_periodica_meses` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_modelo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `transicion_estado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "codigo": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "categoria_id": "valor_de_ejemplo",
  "propietario_id": "valor_de_ejemplo",
  "vigencia_desde": "valor_de_ejemplo",
  "vigencia_hasta": "valor_de_ejemplo",
  "servicios_aplicables": "valor_de_ejemplo",
  "clases_ci_aplicables": "valor_de_ejemplo",
  "entornos_permitidos": "valor_de_ejemplo",
  "riesgo_fijo": "valor_de_ejemplo",
  "autorizacion_automatica": "valor_de_ejemplo",
  "etapa_minima_id": "valor_de_ejemplo",
  "lista_elegibilidad": "valor_de_ejemplo",
  "contenido_prellenado": "valor_de_ejemplo",
  "campos_bloqueados": "valor_de_ejemplo",
  "ventanas_permitidas": "valor_de_ejemplo",
  "anticipacion_horas": "valor_de_ejemplo",
  "limite_frecuencia_ci": "valor_de_ejemplo",
  "paquete_tareas": "valor_de_ejemplo",
  "checklist_items": "valor_de_ejemplo",
  "control_calidad_activo": "valor_de_ejemplo",
  "umbral_tasa_fallo_pct": "valor_de_ejemplo",
  "umbral_fallos_consecutivos": "valor_de_ejemplo",
  "dias_observacion_calidad": "valor_de_ejemplo",
  "revision_periodica_meses": "valor_de_ejemplo",
  "id_modelo": "valor_de_ejemplo",
  "transicion_estado": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT m.*, c.nombre as categoria_nombre, u_prop.nombre_completo as propietario_nombre, u_crea.nombre_completo as creador_nombre FROM cambio_modelo_estandar m
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.25 Endpoint: `/api/admin/cambios/notificaciones-calendario/configuracion`
* **Ruta Canonica**: `/api/admin/cambios/notificaciones-calendario/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/notificaciones-calendario/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/notificaciones-calendario/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pestana` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `snapshot` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `version_id_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `impacto_resumen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "pestana": "valor_de_ejemplo",
  "snapshot": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "version_id_origen": "valor_de_ejemplo",
  "impacto_resumen": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_publicada = true ORDER ...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.26 Endpoint: `/api/admin/cambios/notificaciones-calendario/congelamiento/csv`
* **Ruta Canonica**: `/api/admin/cambios/notificaciones-calendario/congelamiento/csv`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/notificaciones-calendario/congelamiento/csv/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/notificaciones-calendario/congelamiento/csv`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `csv` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "csv": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT nombre, motivo, fecha_inicio, fecha_fin, recurrente_anual, alcance_tipo, severidad, dias_aviso_anticipado, color, activo FROM periodos_congelamiento ORDER BY fecha_inicio ASC
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.27 Endpoint: `/api/admin/cambios/notificaciones-calendario/feriados/csv`
* **Ruta Canonica**: `/api/admin/cambios/notificaciones-calendario/feriados/csv`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/notificaciones-calendario/feriados/csv/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/notificaciones-calendario/feriados/csv`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `csv` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "csv": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT fecha_inicio, fecha_fin, nombre, tipo, alcance, recurrente_anual, activo FROM calendario_feriados ORDER BY fecha_inicio ASC
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.28 Endpoint: `/api/admin/cambios/notificaciones-calendario/simular-conflictos`
* **Ruta Canonica**: `/api/admin/cambios/notificaciones-calendario/simular-conflictos`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/notificaciones-calendario/simular-conflictos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/notificaciones-calendario/simular-conflictos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `tipo_cambio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fecha_inicio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `duracion_horas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `servicio_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `ci_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `implementador_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `requiere_interrupcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "tipo_cambio": "valor_de_ejemplo",
  "fecha_inicio": "valor_de_ejemplo",
  "duracion_horas": "valor_de_ejemplo",
  "servicio_id": "valor_de_ejemplo",
  "ci_id": "valor_de_ejemplo",
  "implementador_id": "valor_de_ejemplo",
  "requiere_interrupcion": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT snapshot FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = 'conflictos_capacidad' AND es_publicada = true ORDER BY numero_version DESC LIMIT 1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.29 Endpoint: `/api/admin/cambios/plantillas`
* **Ruta Canonica**: `/api/admin/cambios/plantillas`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/plantillas/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/plantillas`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id_plantilla` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_plantilla` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo_cambio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_categoria` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles_permitidos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `campos_prellenados` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `campos_bloqueados` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pasos_implementacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tareas_paquete` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_plantilla": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "tipo_cambio": "valor_de_ejemplo",
  "id_categoria": "valor_de_ejemplo",
  "perfiles_permitidos": "valor_de_ejemplo",
  "campos_prellenados": "valor_de_ejemplo",
  "campos_bloqueados": "valor_de_ejemplo",
  "pasos_implementacion": "valor_de_ejemplo",
  "tareas_paquete": "valor_de_ejemplo",
  "activo": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT p.*, c.nombre as categoria_nombre FROM cambio_plantilla p LEFT JOIN cambio_catalogo_item c ON c.id_item = p.id_categoria ORDER BY p.activo DESC, p.id_plantilla
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.30 Endpoint: `/api/admin/cambios/reglas-clasificacion/simular`
* **Ruta Canonica**: `/api/admin/cambios/reglas-clasificacion/simular`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/reglas-clasificacion/simular/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/reglas-clasificacion/simular`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `tipo_cambio = "estandar"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nivel_riesgo = "medio"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `criticidad_ci = "media"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `entorno = "produccion"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `horas_anticipacion = 12` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fuera_de_ventana = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `dentro_congelamiento = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "tipo_cambio = "estandar"": "valor_de_ejemplo",
  "nivel_riesgo = "medio"": "valor_de_ejemplo",
  "criticidad_ci = "media"": "valor_de_ejemplo",
  "entorno = "produccion"": "valor_de_ejemplo",
  "horas_anticipacion = 12": "valor_de_ejemplo",
  "fuera_de_ventana = false": "valor_de_ejemplo",
  "dentro_congelamiento = false": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT snapshot FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = 'reglas_clasificacion' ORDER BY es_borrador DESC, numero_version DESC LIMIT 1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.31 Endpoint: `/api/admin/cambios/tipos-requisitos/configuracion`
* **Ruta Canonica**: `/api/admin/cambios/tipos-requisitos/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/cambios/tipos-requisitos/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cambios/tipos-requisitos/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pestana` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `snapshot` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `version_id_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `impacto_resumen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "pestana": "valor_de_ejemplo",
  "snapshot": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "version_id_origen": "valor_de_ejemplo",
  "impacto_resumen": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_publicada = true ORDER ...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.32 Endpoint: `/api/admin/categorias/[id]`
* **Ruta Canonica**: `/api/admin/categorias/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/categorias/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/categorias/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT c.*, tt.nombre as tipo_nombre, tt.codigo as tipo_codigo, cp.nombre as categoria_padre_nombre,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.33 Endpoint: `/api/admin/categorias`
* **Ruta Canonica**: `/api/admin/categorias`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/admin/categorias/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/categorias`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id_tipo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `buscar` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_tipo_ticket` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `codigo_corto` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `sla_default_respuesta` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `sla_default_resolucion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_padre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombre": "valor_de_ejemplo",
  "id_tipo_ticket": "valor_de_ejemplo",
  "codigo_corto": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "sla_default_respuesta": "valor_de_ejemplo",
  "sla_default_resolucion": "valor_de_ejemplo",
  "id_padre": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT c.id_categoria, c.id_tipo_ticket, tt.nombre as tipo_nombre, tt.codigo as tipo_codigo,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.34 Endpoint: `/api/admin/cmdb/tipos`
* **Ruta Canonica**: `/api/admin/cmdb/tipos`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/admin/cmdb/tipos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/cmdb/tipos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `codigo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `categoria` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `icono` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `atributos_requeridos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `reglas_impacto` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "codigo": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "categoria": "valor_de_ejemplo",
  "icono": "valor_de_ejemplo",
  "atributos_requeridos": "valor_de_ejemplo",
  "reglas_impacto": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_tipo_ci, codigo, nombre, descripcion,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.35 Endpoint: `/api/admin/configuracion`
* **Ruta Canonica**: `/api/admin/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `clave` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `categoria` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `clave` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `valor` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "clave": "valor_de_ejemplo",
  "valor": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT clave, categoria, descripcion, valor, fecha_modificacion FROM configuracion_sistema WHERE clave = $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.36 Endpoint: `/api/admin/conocimiento/[id]`
* **Ruta Canonica**: `/api/admin/conocimiento/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/admin/conocimiento/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/conocimiento/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo_retiro` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `comentario` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `audiencia_perfiles` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "motivo_retiro": "valor_de_ejemplo",
  "comentario": "valor_de_ejemplo",
  "audiencia_perfiles": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT a.*, cat.nombre AS categoria_nombre, CONCAT(ua.nombres, ' ', ua.apellido_paterno) AS autor_nombre, CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS revisor_nombre
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.37 Endpoint: `/api/admin/conocimiento/categorias`
* **Ruta Canonica**: `/api/admin/conocimiento/categorias`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/admin/conocimiento/categorias/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/conocimiento/categorias`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `codigo_corto` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_categoria` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estado_registro` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "codigo_corto": "valor_de_ejemplo",
  "id_categoria": "valor_de_ejemplo",
  "estado_registro": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT c.id_categoria, c.nombre, c.descripcion, c.codigo_corto,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.38 Endpoint: `/api/admin/conocimiento/politicas`
* **Ruta Canonica**: `/api/admin/conocimiento/politicas`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/conocimiento/politicas/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/conocimiento/politicas`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `perfiles_redaccion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles_aprobacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `requiere_aprobacion_previa` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `frecuencia_revision_dias` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `permitir_calificacion_csat` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "perfiles_redaccion": "valor_de_ejemplo",
  "perfiles_aprobacion": "valor_de_ejemplo",
  "requiere_aprobacion_previa": "valor_de_ejemplo",
  "frecuencia_revision_dias": "valor_de_ejemplo",
  "permitir_calificacion_csat": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO configuracion_sistema (clave, valor, fecha_modificacion, usuario_modificacion) VALUES ($1, $2, now(), $3) ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, fecha_modificacion = now(),
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.39 Endpoint: `/api/admin/conocimiento`
* **Ruta Canonica**: `/api/admin/conocimiento`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/admin/conocimiento/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/conocimiento`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `titulo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `contenido_markdown` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_categoria` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `audiencia_perfiles` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estado_editorial` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "titulo": "valor_de_ejemplo",
  "contenido_markdown": "valor_de_ejemplo",
  "id_categoria": "valor_de_ejemplo",
  "audiencia_perfiles": "valor_de_ejemplo",
  "estado_editorial": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT a.id_articulo, a.codigo_articulo, a.titulo, a.contenido_markdown,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.40 Endpoint: `/api/admin/logs`
* **Ruta Canonica**: `/api/admin/logs`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/admin/logs/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/logs`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `buscar` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `resultado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT l.id_log, l.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as usuario_nombre, l.correo_intento,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.41 Endpoint: `/api/admin/mantenimiento-datos`
* **Ruta Canonica**: `/api/admin/mantenimiento-datos`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/mantenimiento-datos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/mantenimiento-datos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `aniosAntiguedad = 5` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `accion = "SIMULAR"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "aniosAntiguedad = 5": "valor_de_ejemplo",
  "accion = "SIMULAR"": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT COUNT(*)::int as total FROM ticket WHERE id_estado IN (6, 7) -- Cerrado o Cancelado AND fecha_cierre < $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.42 Endpoint: `/api/admin/notificaciones/reglas`
* **Ruta Canonica**: `/api/admin/notificaciones/reglas`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/notificaciones/reglas/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/notificaciones/reglas`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_regla` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `canal` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `plantilla` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `destinatarios` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activa` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `codigo_evento` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_regla": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "canal": "valor_de_ejemplo",
  "plantilla": "valor_de_ejemplo",
  "destinatarios": "valor_de_ejemplo",
  "activa": "valor_de_ejemplo",
  "codigo_evento": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_regla, codigo_evento, nombre, descripcion,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.43 Endpoint: `/api/admin/problemas/campos-personalizados`
* **Ruta Canonica**: `/api/admin/problemas/campos-personalizados`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/campos-personalizados/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/campos-personalizados`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `entidad` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_campo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `etiqueta` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `propiedades` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `formularios_visibles` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pestana_vista` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `seccion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `obligatorio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `reglas_condicionales` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_campo": "valor_de_ejemplo",
  "etiqueta": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "activo": "valor_de_ejemplo",
  "propiedades": "valor_de_ejemplo",
  "formularios_visibles": "valor_de_ejemplo",
  "pestana_vista": "valor_de_ejemplo",
  "seccion": "valor_de_ejemplo",
  "obligatorio": "valor_de_ejemplo",
  "reglas_condicionales": "valor_de_ejemplo",
  "orden": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT c.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as creador_nombre FROM campo_personalizado c LEFT JOIN usuario u ON u.id_usuario = c.usuario_creacion WHERE c.entidad = $1 ORDER BY c.orden, c.id_campo
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.44 Endpoint: `/api/admin/problemas/catalogos`
* **Ruta Canonica**: `/api/admin/problemas/catalogos`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/catalogos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/catalogos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `catalogo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `catalogo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `item` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `operacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_destino` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "catalogo": "valor_de_ejemplo",
  "item": "valor_de_ejemplo",
  "operacion": "valor_de_ejemplo",
  "id_origen": "valor_de_ejemplo",
  "id_destino": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT c.*, p.nombre as padre_nombre, dep.nombre as departamento_nombre, s.nombre as servicio_nombre, (SELECT COUNT(*) FROM problema prob WHERE prob.id_categoria = c.id_categoria) as usos_tickets FROM problema_categoria c LEFT JOIN problema_categoria...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.45 Endpoint: `/api/admin/problemas/configuracion`
* **Ruta Canonica**: `/api/admin/problemas/configuracion`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/configuracion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/configuracion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pantalla` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `ambito` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pantalla = "1.3.4.1"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pestana = "campos"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `snapshot` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `impacto_resumen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `diff` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "pantalla = "1.3.4.1"": "valor_de_ejemplo",
  "pestana = "campos"": "valor_de_ejemplo",
  "snapshot": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "impacto_resumen": "valor_de_ejemplo",
  "diff": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT b.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as nombres, b.fecha_bloqueo FROM bloqueo_edicion_concurrente b JOIN usuario u ON u.id_usuario = b.id_usuario WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.46 Endpoint: `/api/admin/problemas/flujo/asignacion`
* **Ruta Canonica**: `/api/admin/problemas/flujo/asignacion`
* **Metodos HTTP Disponibles**: `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/flujo/asignacion/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/flujo/asignacion`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden = 1` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activa = true` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `evento_evaluacion = "al_registrar"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `condiciones = []` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_departamento_destino` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estrategia = "sin_responsable"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_tecnico_fijo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `considerar_disponibilidad = true` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `notificar_asignacion = true` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_regla` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activa` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `evento_evaluacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `condiciones` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estrategia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `considerar_disponibilidad` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `notificar_asignacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombre": "valor_de_ejemplo",
  "orden = 1": "valor_de_ejemplo",
  "activa = true": "valor_de_ejemplo",
  "evento_evaluacion = "al_registrar"": "valor_de_ejemplo",
  "condiciones = []": "valor_de_ejemplo",
  "id_departamento_destino": "valor_de_ejemplo",
  "estrategia = "sin_responsable"": "valor_de_ejemplo",
  "id_tecnico_fijo": "valor_de_ejemplo",
  "considerar_disponibilidad = true": "valor_de_ejemplo",
  "notificar_asignacion = true": "valor_de_ejemplo",
  "id_regla": "valor_de_ejemplo",
  "orden": "valor_de_ejemplo",
  "activa": "valor_de_ejemplo",
  "evento_evaluacion": "valor_de_ejemplo",
  "condiciones": "valor_de_ejemplo",
  "estrategia": "valor_de_ejemplo",
  "considerar_disponibilidad": "valor_de_ejemplo",
  "notificar_asignacion": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO problema_regla_asignacion ( nombre, orden, activa, evento_evaluacion, condiciones, id_departamento_destino, estrategia, id_tecnico_fijo, considerar_disponibilidad, notificar_asignacion, veces_aplicada, fecha_creacion ) VALUES ($1, $2, $3,...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.47 Endpoint: `/api/admin/problemas/flujo/escalamiento`
* **Ruta Canonica**: `/api/admin/problemas/flujo/escalamiento`
* **Metodos HTTP Disponibles**: `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/flujo/escalamiento/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/flujo/escalamiento`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `objetivo = "diagnostico"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `prioridades = ["P1"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `"P2"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `"P3"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `"P4"]` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo_umbral = "porcentaje"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `umbral_valor = 75` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `acciones = []` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `repetir_cada_horas = null` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `max_repeticiones = 1` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activa = true` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_escalamiento` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `objetivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `prioridades` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo_umbral` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `umbral_valor` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `acciones` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `repetir_cada_horas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `max_repeticiones` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activa` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombre": "valor_de_ejemplo",
  "objetivo = "diagnostico"": "valor_de_ejemplo",
  "prioridades = ["P1"": "valor_de_ejemplo",
  ""P2"": "valor_de_ejemplo",
  ""P3"": "valor_de_ejemplo",
  ""P4"]": "valor_de_ejemplo",
  "tipo_umbral = "porcentaje"": "valor_de_ejemplo",
  "umbral_valor = 75": "valor_de_ejemplo",
  "acciones = []": "valor_de_ejemplo",
  "repetir_cada_horas = null": "valor_de_ejemplo",
  "max_repeticiones = 1": "valor_de_ejemplo",
  "activa = true": "valor_de_ejemplo",
  "id_escalamiento": "valor_de_ejemplo",
  "objetivo": "valor_de_ejemplo",
  "prioridades": "valor_de_ejemplo",
  "tipo_umbral": "valor_de_ejemplo",
  "umbral_valor": "valor_de_ejemplo",
  "acciones": "valor_de_ejemplo",
  "repetir_cada_horas": "valor_de_ejemplo",
  "max_repeticiones": "valor_de_ejemplo",
  "activa": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO problema_regla_escalamiento ( nombre, objetivo, prioridades, tipo_umbral, umbral_valor, acciones, repetir_cada_horas, max_repeticiones, activa, fecha_creacion ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.48 Endpoint: `/api/admin/problemas/flujo/estados`
* **Ruta Canonica**: `/api/admin/problemas/flujo/estados`
* **Metodos HTTP Disponibles**: `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/flujo/estados/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/flujo/estados`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `codigo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `color = "#3b82f6"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `reloj_diagnostico = "corre"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `reloj_resolucion = "corre"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `cuenta_como_abierto = true` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `permite_edicion = "si"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion = ""` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden = 1` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_estado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `color` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `reloj_diagnostico` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `reloj_resolucion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `cuenta_como_abierto` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `permite_edicion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "codigo": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "tipo": "valor_de_ejemplo",
  "color = "#3b82f6"": "valor_de_ejemplo",
  "reloj_diagnostico = "corre"": "valor_de_ejemplo",
  "reloj_resolucion = "corre"": "valor_de_ejemplo",
  "cuenta_como_abierto = true": "valor_de_ejemplo",
  "permite_edicion = "si"": "valor_de_ejemplo",
  "descripcion = """: "valor_de_ejemplo",
  "orden = 1": "valor_de_ejemplo",
  "id_estado": "valor_de_ejemplo",
  "color": "valor_de_ejemplo",
  "reloj_diagnostico": "valor_de_ejemplo",
  "reloj_resolucion": "valor_de_ejemplo",
  "cuenta_como_abierto": "valor_de_ejemplo",
  "permite_edicion": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "orden": "valor_de_ejemplo",
  "activo": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO problema_estado ( codigo, nombre, tipo, color, reloj_diagnostico, reloj_resolucion, cuenta_como_abierto, permite_edicion, descripcion, orden, es_sistema, activo ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, true) RETURNING *
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.49 Endpoint: `/api/admin/problemas/flujo/mayores`
* **Ruta Canonica**: `/api/admin/problemas/flujo/mayores`
* **Metodos HTTP Disponibles**: `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/flujo/mayores/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/flujo/mayores`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `aplicar_paquete_tareas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `exigir_revision_cierre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `plazo_revision_dias` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `participantes_roles` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `aprobacion_cierre_perfil` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `notificar_direccion_al_detectar` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `notificar_direccion_al_cerrar` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `generar_informe_pdf` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `plantilla_preguntas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "aplicar_paquete_tareas": "valor_de_ejemplo",
  "exigir_revision_cierre": "valor_de_ejemplo",
  "plazo_revision_dias": "valor_de_ejemplo",
  "participantes_roles": "valor_de_ejemplo",
  "aprobacion_cierre_perfil": "valor_de_ejemplo",
  "notificar_direccion_al_detectar": "valor_de_ejemplo",
  "notificar_direccion_al_cerrar": "valor_de_ejemplo",
  "generar_informe_pdf": "valor_de_ejemplo",
  "plantilla_preguntas": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
UPDATE problema_config_mayor SET aplicar_paquete_tareas = COALESCE($1, aplicar_paquete_tareas), exigir_revision_cierre = COALESCE($2, exigir_revision_cierre), plazo_revision_dias = COALESCE($3, plazo_revision_dias), participantes_roles = COALESCE($4,...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.50 Endpoint: `/api/admin/problemas/flujo/objetivos`
* **Ruta Canonica**: `/api/admin/problemas/flujo/objetivos`
* **Metodos HTTP Disponibles**: `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/flujo/objetivos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/flujo/objetivos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `objetivos = []` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "objetivos = []": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
UPDATE problema_objetivo_tiempo SET primera_respuesta_horas = $1, diagnostico_horas = $2, resolucion_total_horas = $3, descripcion_operativa = $4,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.51 Endpoint: `/api/admin/problemas/flujo/reapertura`
* **Ruta Canonica**: `/api/admin/problemas/flujo/reapertura`
* **Metodos HTTP Disponibles**: `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/flujo/reapertura/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/flujo/reapertura`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `permitir_reapertura` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `ventana_dias_resuelto` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `ventana_dias_cerrado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles_autorizados` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estado_destino_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo_obligatorio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `max_reaperturas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `reinicio_relojes` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estrategia_asignacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivos_catalogo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "permitir_reapertura": "valor_de_ejemplo",
  "ventana_dias_resuelto": "valor_de_ejemplo",
  "ventana_dias_cerrado": "valor_de_ejemplo",
  "perfiles_autorizados": "valor_de_ejemplo",
  "estado_destino_id": "valor_de_ejemplo",
  "motivo_obligatorio": "valor_de_ejemplo",
  "max_reaperturas": "valor_de_ejemplo",
  "reinicio_relojes": "valor_de_ejemplo",
  "estrategia_asignacion": "valor_de_ejemplo",
  "motivos_catalogo": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
UPDATE problema_config_reapertura SET permitir_reapertura = COALESCE($1, permitir_reapertura), ventana_dias_resuelto = COALESCE($2, ventana_dias_resuelto), ventana_dias_cerrado = COALESCE($3, ventana_dias_cerrado), perfiles_autorizados = COALESCE($4,...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.52 Endpoint: `/api/admin/problemas/flujo`
* **Ruta Canonica**: `/api/admin/problemas/flujo`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/flujo/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/flujo`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `pestana` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `ambito = "flujo"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `pestana = "estados"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `datos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "ambito = "flujo"": "valor_de_ejemplo",
  "pestana = "estados"": "valor_de_ejemplo",
  "datos": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT e.*, (SELECT COUNT(*) FROM problema p WHERE p.id_estado = e.id_estado) as usos_tickets FROM problema_estado e ORDER BY e.orden ASC
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.53 Endpoint: `/api/admin/problemas/flujo/tareas`
* **Ruta Canonica**: `/api/admin/problemas/flujo/tareas`
* **Metodos HTTP Disponibles**: `POST`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/flujo/tareas/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/flujo/tareas`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `tipo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `tipo_entidad = "tarea"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `codigo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `titulo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo = "investigacion"` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_departamento_destino` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `duracion_estimada_horas = 4` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `obligatoria = false` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `checklist = []` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tareas = []` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "tipo_entidad = "tarea"": "valor_de_ejemplo",
  "codigo": "valor_de_ejemplo",
  "titulo": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "tipo = "investigacion"": "valor_de_ejemplo",
  "id_departamento_destino": "valor_de_ejemplo",
  "duracion_estimada_horas = 4": "valor_de_ejemplo",
  "obligatoria = false": "valor_de_ejemplo",
  "checklist = []": "valor_de_ejemplo",
  "tareas = []": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO problema_tarea_paquete (codigo, nombre, descripcion, tareas, activo, fecha_creacion) VALUES ($1, $2, $3, $4, true, NOW()) RETURNING *
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.54 Endpoint: `/api/admin/problemas/flujo/transiciones`
* **Ruta Canonica**: `/api/admin/problemas/flujo/transiciones`
* **Metodos HTTP Disponibles**: `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/flujo/transiciones/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/flujo/transiciones`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_transicion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estado_origen_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estado_destino_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles_autorizados` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `roles_contextuales` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `condiciones_previas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `campos_requeridos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `politica_comentario` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `requiere_confirmacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `mensaje_confirmacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `requiere_aprobacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `aprobador_tipo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `color_boton` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `automatizaciones` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activa` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_transicion": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "estado_origen_id": "valor_de_ejemplo",
  "estado_destino_id": "valor_de_ejemplo",
  "perfiles_autorizados": "valor_de_ejemplo",
  "roles_contextuales": "valor_de_ejemplo",
  "condiciones_previas": "valor_de_ejemplo",
  "campos_requeridos": "valor_de_ejemplo",
  "politica_comentario": "valor_de_ejemplo",
  "requiere_confirmacion": "valor_de_ejemplo",
  "mensaje_confirmacion": "valor_de_ejemplo",
  "requiere_aprobacion": "valor_de_ejemplo",
  "aprobador_tipo": "valor_de_ejemplo",
  "color_boton": "valor_de_ejemplo",
  "automatizaciones": "valor_de_ejemplo",
  "activa": "valor_de_ejemplo",
  "orden": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO problema_transicion ( codigo, nombre, estado_origen_id, estado_destino_id, perfiles_autorizados, roles_contextuales, condiciones_previas, campos_requeridos, politica_comentario, requiere_confirmacion, mensaje_confirmacion, requiere_aproba...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.55 Endpoint: `/api/admin/problemas/matriz-prioridad`
* **Ruta Canonica**: `/api/admin/problemas/matriz-prioridad`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/matriz-prioridad/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/matriz-prioridad`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `config` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `celdas_problemas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `celdas_compartidas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "config": "valor_de_ejemplo",
  "celdas_problemas": "valor_de_ejemplo",
  "celdas_compartidas": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO matriz_prioridad_institucional (entidad, nivel_impacto, nivel_urgencia, id_prioridad, fecha_modificacion) VALUES ('problema', $1, $2, $3, NOW()) ON CONFLICT (entidad, nivel_impacto, nivel_urgencia) DO UPDATE SET id_prioridad = EXCLUDED.id...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.56 Endpoint: `/api/admin/problemas/plantillas`
* **Ruta Canonica**: `/api/admin/problemas/plantillas`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/plantillas/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/plantillas`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_plantilla` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activa` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_categoria` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles_visibles` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `valores_prellenados` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `campos_bloqueados` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tareas_incluidas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_plantilla": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "activa": "valor_de_ejemplo",
  "id_categoria": "valor_de_ejemplo",
  "perfiles_visibles": "valor_de_ejemplo",
  "valores_prellenados": "valor_de_ejemplo",
  "campos_bloqueados": "valor_de_ejemplo",
  "tareas_incluidas": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT p.*, c.nombre as categoria_nombre FROM plantilla_problema p LEFT JOIN problema_categoria c ON c.id_categoria = p.id_categoria WHERE p.id_plantilla = $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.57 Endpoint: `/api/admin/problemas/relaciones/kedb`
* **Ruta Canonica**: `/api/admin/problemas/relaciones/kedb`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/relaciones/kedb/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/relaciones/kedb`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `prueba` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "prueba": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.58 Endpoint: `/api/admin/problemas/relaciones`
* **Ruta Canonica**: `/api/admin/problemas/relaciones`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/relaciones/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/relaciones`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `datos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `confirmacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "datos": "valor_de_ejemplo",
  "confirmacion": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT r.*, (SELECT COUNT(*) FROM problema_regla_umbral_ejecucion e WHERE e.id_regla = r.id_regla) as total_ejecuciones FROM problema_regla_umbral r ORDER BY r.orden ASC, r.id_regla ASC
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.59 Endpoint: `/api/admin/problemas/relaciones/umbral`
* **Ruta Canonica**: `/api/admin/problemas/relaciones/umbral`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/problemas/relaciones/umbral/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/problemas/relaciones/umbral`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id_regla` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `accion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `regla` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `diasSimulacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_regla` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `activa` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `...resto` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "accion": "valor_de_ejemplo",
  "regla": "valor_de_ejemplo",
  "diasSimulacion": "valor_de_ejemplo",
  "id_regla": "valor_de_ejemplo",
  "activa": "valor_de_ejemplo",
  "...resto": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM problema_regla_umbral_ejecucion WHERE id_regla = $1 ORDER BY fecha_ejecucion DESC LIMIT 50
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.60 Endpoint: `/api/admin/reportes-disenador`
* **Ruta Canonica**: `/api/admin/reportes-disenador`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/reportes-disenador/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/reportes-disenador`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO configuracion_sistema (clave, valor, fecha_modificacion, usuario_modificacion) VALUES ($1, $2, now(), $3) ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, fecha_modificacion = now(),
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.61 Endpoint: `/api/admin/rfc-config`
* **Ruta Canonica**: `/api/admin/rfc-config`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/rfc-config/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/rfc-config`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO configuracion_rfc(id_configuracion,perfiles_solicitantes,tipos_rfc,exige_ci,exige_plan_pruebas,permite_emergencia,campos_personalizados,exige_rollback,duracion_maxima_horas,usuario_modificacion,fecha_modificacion) VALUES(1,$1,$2,$3,$4,$5,...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.62 Endpoint: `/api/admin/sla/matriz`
* **Ruta Canonica**: `/api/admin/sla/matriz`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/sla/matriz/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/sla/matriz`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `config` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `celdas_problemas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `celdas_compartidas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "config": "valor_de_ejemplo",
  "celdas_problemas": "valor_de_ejemplo",
  "celdas_compartidas": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO matriz_prioridad_institucional (entidad, nivel_impacto, nivel_urgencia, id_prioridad, fecha_modificacion) VALUES ('compartida', $1, $2, $3, NOW()) ON CONFLICT (entidad, nivel_impacto, nivel_urgencia) DO UPDATE SET id_prioridad = EXCLUDED....
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.63 Endpoint: `/api/admin/sla`
* **Ruta Canonica**: `/api/admin/sla`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/admin/sla/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/sla`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `prioridades` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `politicaSla` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `objetivosOla` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "prioridades": "valor_de_ejemplo",
  "politicaSla": "valor_de_ejemplo",
  "objetivosOla": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_prioridad, codigo, nombre, nivel, tiempo_primera_respuesta_hrs, tiempo_resolucion_horas, color, estado_registro FROM prioridad_ticket WHERE estado_registro = true ORDER BY nivel ASC
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.64 Endpoint: `/api/admin/tecnicos/ausencias`
* **Ruta Canonica**: `/api/admin/tecnicos/ausencias`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/admin/tecnicos/ausencias/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/admin/tecnicos/ausencias`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_usuario_tecnico` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fecha_desde` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fecha_hasta` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `motivo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_ausencia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_usuario_tecnico": "valor_de_ejemplo",
  "fecha_desde": "valor_de_ejemplo",
  "fecha_hasta": "valor_de_ejemplo",
  "motivo": "valor_de_ejemplo",
  "id_ausencia": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT a.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as tecnico_nombre FROM tecnico_ausencias a JOIN usuario u ON u.id_usuario = a.id_usuario_tecnico ORDER BY a.fecha_desde DESC
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.65 Endpoint: `/api/area/colaboradores`
* **Ruta Canonica**: `/api/area/colaboradores`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/area/colaboradores/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/area/colaboradores`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT u.id_usuario,u.nombres,u.apellido_paterno,u.correo_electronico,COUNT(t.id_ticket) FILTER(WHERE et.es_terminal=false)::int AS tickets_abiertos FROM usuario u LEFT JOIN ticket t ON t.id_usuario_solicitante=u.id_usuario AND t.id_departamento_empr...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.66 Endpoint: `/api/auth/cambiar-perfil`
* **Ruta Canonica**: `/api/auth/cambiar-perfil`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/auth/cambiar-perfil/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/auth/cambiar-perfil`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_perfil` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_perfil": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT p.id_perfil, p.nombre FROM perfiles p INNER JOIN usuario_perfiles up ON up.id_perfil = p.id_perfil WHERE up.id_usuario = $1 AND up.id_perfil = $2
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.67 Endpoint: `/api/auth/captcha`
* **Ruta Canonica**: `/api/auth/captcha`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/auth/captcha/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Endpoint Publico sin requerimiento de sesion previa

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/auth/captcha`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.68 Endpoint: `/api/auth/login`
* **Ruta Canonica**: `/api/auth/login`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/auth/login/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Endpoint Publico sin requerimiento de sesion previa

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/auth/login`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO log_acceso (id_usuario, correo_intento, exitoso, ip) VALUES ($1, $2, $3, $4)
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.69 Endpoint: `/api/auth/logout`
* **Ruta Canonica**: `/api/auth/logout`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/auth/logout/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/auth/logout`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.70 Endpoint: `/api/auth/recuperar-clave/cambiar`
* **Ruta Canonica**: `/api/auth/recuperar-clave/cambiar`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/auth/recuperar-clave/cambiar/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Endpoint Publico sin requerimiento de sesion previa

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/auth/recuperar-clave/cambiar`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `token_sesion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `codigo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `clave_nueva` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "token_sesion": "valor_de_ejemplo",
  "codigo": "valor_de_ejemplo",
  "clave_nueva": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_recuperacion, id_usuario, codigo, utilizado, (now() > expira_sesion) as sesion_expirada, (now() > expira_codigo) as codigo_expirado FROM codigo_recuperacion WHERE token_sesion = $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.71 Endpoint: `/api/auth/recuperar-clave/solicitar`
* **Ruta Canonica**: `/api/auth/recuperar-clave/solicitar`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/auth/recuperar-clave/solicitar/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Endpoint Publico sin requerimiento de sesion previa

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/auth/recuperar-clave/solicitar`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `correo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "correo": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_usuario, nombres, correo_electronico, estado_registro FROM usuario WHERE LOWER(correo_electronico) = $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.72 Endpoint: `/api/auth/recuperar-clave/verificar`
* **Ruta Canonica**: `/api/auth/recuperar-clave/verificar`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/auth/recuperar-clave/verificar/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Endpoint Publico sin requerimiento de sesion previa

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/auth/recuperar-clave/verificar`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `token_sesion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `codigo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "token_sesion": "valor_de_ejemplo",
  "codigo": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_recuperacion, id_usuario, codigo, expira_codigo, expira_sesion, utilizado, (now() > expira_sesion) as sesion_expirada, (now() > expira_codigo) as codigo_expirado FROM codigo_recuperacion WHERE token_sesion = $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.73 Endpoint: `/api/auth/seleccionar-perfil`
* **Ruta Canonica**: `/api/auth/seleccionar-perfil`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/auth/seleccionar-perfil/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/auth/seleccionar-perfil`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `tokenPreSesion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_perfil` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "tokenPreSesion": "valor_de_ejemplo",
  "id_perfil": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.74 Endpoint: `/api/cambios/[id]`
* **Ruta Canonica**: `/api/cambios/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/cambios/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/cambios/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `decision` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `comentario` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_estado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `resultado_pir` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `incidentes_inducidos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "decision": "valor_de_ejemplo",
  "comentario": "valor_de_ejemplo",
  "id_estado": "valor_de_ejemplo",
  "resultado_pir": "valor_de_ejemplo",
  "incidentes_inducidos": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.descripcion,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.75 Endpoint: `/api/cambios`
* **Ruta Canonica**: `/api/cambios`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/cambios/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/cambios`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `tipo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `vista` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `titulo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tipo_cambio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_impacto` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_urgencia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_prioridad` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `justificacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `plan_implementacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `plan_rollback` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `plan_pruebas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `ventana_inicio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `ventana_fin` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_ci_afectado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_problema_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_incidente_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "titulo": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "tipo_cambio": "valor_de_ejemplo",
  "id_impacto": "valor_de_ejemplo",
  "id_urgencia": "valor_de_ejemplo",
  "id_prioridad": "valor_de_ejemplo",
  "justificacion": "valor_de_ejemplo",
  "plan_implementacion": "valor_de_ejemplo",
  "plan_rollback": "valor_de_ejemplo",
  "plan_pruebas": "valor_de_ejemplo",
  "ventana_inicio": "valor_de_ejemplo",
  "ventana_fin": "valor_de_ejemplo",
  "id_ci_afectado": "valor_de_ejemplo",
  "id_problema_origen": "valor_de_ejemplo",
  "id_incidente_origen": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
c.id_usuario_solicitante IN ( SELECT u.id_usuario FROM usuario u WHERE u.id_departamento IN ( SELECT d.id_departamento FROM departamento_ti d WHERE d.id_supervisor = $${paramIdx++} AND d.estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.76 Endpoint: `/api/conocimiento/[id]`
* **Ruta Canonica**: `/api/conocimiento/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/conocimiento/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/conocimiento/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `voto_utilidad` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "voto_utilidad": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT a.id_articulo, a.codigo_articulo, a.titulo, a.contenido_markdown,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.77 Endpoint: `/api/conocimiento`
* **Ruta Canonica**: `/api/conocimiento`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/conocimiento/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/conocimiento`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `buscar` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id_categoria` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `vista` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `titulo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `contenido_markdown` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_categoria` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_problema_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `audiencia_perfiles` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "titulo": "valor_de_ejemplo",
  "contenido_markdown": "valor_de_ejemplo",
  "id_categoria": "valor_de_ejemplo",
  "id_problema_origen": "valor_de_ejemplo",
  "audiencia_perfiles": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT a.id_articulo, a.codigo_articulo, a.titulo, a.contenido_markdown,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.78 Endpoint: `/api/departamentos-empresa/[id]`
* **Ruta Canonica**: `/api/departamentos-empresa/[id]`
* **Metodos HTTP Disponibles**: `PATCH`
* **Archivo Fuente en Repositorio**: `api/departamentos-empresa/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/departamentos-empresa/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.79 Endpoint: `/api/departamentos-empresa`
* **Ruta Canonica**: `/api/departamentos-empresa`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/departamentos-empresa/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/departamentos-empresa`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.80 Endpoint: `/api/departamentos-ti/[id]`
* **Ruta Canonica**: `/api/departamentos-ti/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/departamentos-ti/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/departamentos-ti/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT d.id_departamento, d.codigo, d.nombre, d.descripcion,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.81 Endpoint: `/api/departamentos-ti`
* **Ruta Canonica**: `/api/departamentos-ti`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/departamentos-ti/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/departamentos-ti`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `codigo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_supervisor` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tiempo_ola_horas` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `tiempo_ola_critico_hrs` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "codigo": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "id_supervisor": "valor_de_ejemplo",
  "tiempo_ola_horas": "valor_de_ejemplo",
  "tiempo_ola_critico_hrs": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT d.id_departamento, d.codigo, d.nombre, d.descripcion,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.82 Endpoint: `/api/incidentes/[id]/comentarios`
* **Ruta Canonica**: `/api/incidentes/[id]/comentarios`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/incidentes/[id]/comentarios/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/incidentes/[id]/comentarios`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.83 Endpoint: `/api/incidentes/[id]`
* **Ruta Canonica**: `/api/incidentes/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/incidentes/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/incidentes/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.84 Endpoint: `/api/incidentes`
* **Ruta Canonica**: `/api/incidentes`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/incidentes/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/incidentes`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.85 Endpoint: `/api/menu/admin/[id]`
* **Ruta Canonica**: `/api/menu/admin/[id]`
* **Metodos HTTP Disponibles**: `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/menu/admin/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/menu/admin/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `url_menu` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_padre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles_ids` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombre": "valor_de_ejemplo",
  "url_menu": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "id_padre": "valor_de_ejemplo",
  "orden": "valor_de_ejemplo",
  "perfiles_ids": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT nivel FROM opciones_menu WHERE id_opcion_menu = $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.86 Endpoint: `/api/menu/admin`
* **Ruta Canonica**: `/api/menu/admin`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/menu/admin/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/menu/admin`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `url_menu` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_padre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `orden` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles_ids` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombre": "valor_de_ejemplo",
  "url_menu": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "id_padre": "valor_de_ejemplo",
  "orden": "valor_de_ejemplo",
  "perfiles_ids": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT om.id_opcion_menu, om.nombre, om.url_menu, om.descripcion, om.id_padre, om.nivel, om.orden, om.estado_registro, padre.nombre as nombre_padre FROM opciones_menu om LEFT JOIN opciones_menu padre ON padre.id_opcion_menu = om.id_padre
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.87 Endpoint: `/api/menu`
* **Ruta Canonica**: `/api/menu`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/menu/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/menu`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.88 Endpoint: `/api/mi-cuenta`
* **Ruta Canonica**: `/api/mi-cuenta`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/mi-cuenta/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/mi-cuenta`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombres` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `apellido_paterno` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `apellido_materno` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `celular` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `clave_actual` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `clave_nueva` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombres": "valor_de_ejemplo",
  "apellido_paterno": "valor_de_ejemplo",
  "apellido_materno": "valor_de_ejemplo",
  "celular": "valor_de_ejemplo",
  "clave_actual": "valor_de_ejemplo",
  "clave_nueva": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_usuario, dni, nombres, apellido_paterno, apellido_materno, celular, correo_electronico, estado_registro, COALESCE(nivel_prioridad, 5) AS nivel_prioridad FROM usuario WHERE id_usuario = $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.89 Endpoint: `/api/operacion/eventos/[id]`
* **Ruta Canonica**: `/api/operacion/eventos/[id]`
* **Metodos HTTP Disponibles**: `PATCH`
* **Archivo Fuente en Repositorio**: `api/operacion/eventos/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/operacion/eventos/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
UPDATE evento_servicio SET estado=$2,id_ticket=COALESCE($3,id_ticket), reconocido_por=CASE WHEN $2='RECONOCIDO' AND reconocido_por IS NULL THEN $4 ELSE reconocido_por END, reconocido_en=CASE WHEN $2='RECONOCIDO' AND reconocido_en IS NULL THEN now() E...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.90 Endpoint: `/api/operacion/eventos`
* **Ruta Canonica**: `/api/operacion/eventos`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/operacion/eventos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/operacion/eventos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT e.id_evento,e.codigo_evento,e.fuente,e.titulo,e.descripcion,e.severidad,e.estado,e.detectado_en, e.id_ci,ci.codigo_ci,ci.nombre AS ci_nombre,e.id_ticket,t.codigo_ticket FROM evento_servicio e LEFT JOIN elemento_configuracion ci ON ci.id_ci=e.i...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.91 Endpoint: `/api/operacion/resiliencia`
* **Ruta Canonica**: `/api/operacion/resiliencia`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/operacion/resiliencia/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/operacion/resiliencia`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT r.*,s.codigo_servicio,s.nombre AS servicio_nombre FROM resiliencia_servicio r JOIN servicio_catalogo s ON s.id_servicio=r.id_servicio WHERE r.estado_registro=true AND s.estado_registro=true ORDER BY s.nombre
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.92 Endpoint: `/api/identidades/perfiles/[id]`
* **Ruta Canonica**: `/api/identidades/perfiles/[id]`
* **Metodos HTTP Disponibles**: `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/perfiles/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/identidades/perfiles/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `opciones_ids` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "opciones_ids": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_perfil FROM perfiles WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1)) AND id_perfil <> $2
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.93 Endpoint: `/api/identidades/perfiles`
* **Ruta Canonica**: `/api/identidades/perfiles`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/perfiles/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/identidades/perfiles`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `todos` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `opciones_ids` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "nombre": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "opciones_ids": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_perfil, nombre, descripcion, estado_registro FROM perfiles WHERE estado_registro = true ORDER BY nombre
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.94 Endpoint: `/api/problemas/[id]`
* **Ruta Canonica**: `/api/problemas/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/problemas/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/problemas/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_estado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `causa_raiz` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `metodo_analisis` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `workaround` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `es_error_conocido` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `solucion_definitiva` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `publicar_en_kedb` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_ci_afectado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_ticket_asociar` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_estado": "valor_de_ejemplo",
  "causa_raiz": "valor_de_ejemplo",
  "metodo_analisis": "valor_de_ejemplo",
  "workaround": "valor_de_ejemplo",
  "es_error_conocido": "valor_de_ejemplo",
  "solucion_definitiva": "valor_de_ejemplo",
  "publicar_en_kedb": "valor_de_ejemplo",
  "id_ci_afectado": "valor_de_ejemplo",
  "id_ticket_asociar": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT p.id_problema, p.codigo_problema, p.titulo, p.descripcion,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.95 Endpoint: `/api/problemas`
* **Ruta Canonica**: `/api/problemas`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/problemas/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/problemas`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `kedb` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `titulo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_impacto` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_urgencia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_prioridad` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `metodo_analisis` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_ci_afectado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_departamento` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_ticket_origen` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "titulo": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "id_impacto": "valor_de_ejemplo",
  "id_urgencia": "valor_de_ejemplo",
  "id_prioridad": "valor_de_ejemplo",
  "metodo_analisis": "valor_de_ejemplo",
  "id_ci_afectado": "valor_de_ejemplo",
  "id_departamento": "valor_de_ejemplo",
  "id_ticket_origen": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
p.id_departamento = (SELECT td.id_departamento FROM tecnico_detalle td WHERE td.id_usuario = $${paramIdx++} AND td.estado_registro = true)
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.96 Endpoint: `/api/proveedores/[id]`
* **Ruta Canonica**: `/api/proveedores/[id]`
* **Metodos HTTP Disponibles**: `PATCH`
* **Archivo Fuente en Repositorio**: `api/proveedores/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/proveedores/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
UPDATE proveedor_ti SET estado=$2,observaciones=COALESCE($3,observaciones),usuario_modificacion=$4,fecha_modificacion=now(),estado_registro=($2<>'INACTIVO') WHERE id_proveedor=$1 RETURNING id_proveedor,codigo_proveedor,nombre,estado,observaciones
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.97 Endpoint: `/api/proveedores`
* **Ruta Canonica**: `/api/proveedores`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/proveedores/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/proveedores`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_proveedor,codigo_proveedor,nombre,tipo_servicio,contacto_nombre,contacto_correo,contacto_telefono,numero_contrato,fecha_inicio,fecha_vencimiento,servicio_soportado,compromiso_sla,evaluacion_desempeno,estado,observaciones,fecha_creacion FROM...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.98 Endpoint: `/api/reportes/indicadores`
* **Ruta Canonica**: `/api/reportes/indicadores`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/reportes/indicadores/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/reportes/indicadores`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
t.id_departamento IN ( SELECT d.id_departamento FROM departamento_ti d WHERE d.id_supervisor = $${params.length} AND d.estado_registro = true )
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.99 Endpoint: `/api/servicios/[id]`
* **Ruta Canonica**: `/api/servicios/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/servicios/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/servicios/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT s.id_servicio, s.codigo_servicio, s.id_tipo_ticket, tt.nombre as tipo_nombre,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.100 Endpoint: `/api/servicios/[id]/workflow`
* **Ruta Canonica**: `/api/servicios/[id]/workflow`
* **Metodos HTTP Disponibles**: `GET`, `PUT`
* **Archivo Fuente en Repositorio**: `api/servicios/[id]/workflow/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/servicios/[id]/workflow`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `pasos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "pasos": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT id_paso, id_servicio, orden, codigo_paso,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.101 Endpoint: `/api/servicios`
* **Ruta Canonica**: `/api/servicios`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/servicios/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/servicios`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id_tipo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id_categoria` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `buscar` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `perfil_preview` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_tipo_ticket` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_categoria` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombre` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion_comercial` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `entregable` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `requiere_aprobacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `sla_horas_resolucion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `sla_horas_respuesta` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `costo_referencial` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `icono` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles_habilitados` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `esquema_formulario` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_departamento_resolutor` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `reglas_escalamiento` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `ids_servicios` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_tipo_ticket": "valor_de_ejemplo",
  "id_categoria": "valor_de_ejemplo",
  "nombre": "valor_de_ejemplo",
  "descripcion_comercial": "valor_de_ejemplo",
  "entregable": "valor_de_ejemplo",
  "requiere_aprobacion": "valor_de_ejemplo",
  "sla_horas_resolucion": "valor_de_ejemplo",
  "sla_horas_respuesta": "valor_de_ejemplo",
  "costo_referencial": "valor_de_ejemplo",
  "icono": "valor_de_ejemplo",
  "perfiles_habilitados": "valor_de_ejemplo",
  "esquema_formulario": "valor_de_ejemplo",
  "id_departamento_resolutor": "valor_de_ejemplo",
  "reglas_escalamiento": "valor_de_ejemplo",
  "ids_servicios": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT s.id_servicio, s.codigo_servicio, s.id_tipo_ticket, tt.nombre as tipo_nombre,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.102 Endpoint: `/api/solicitudes/[id]/comentarios`
* **Ruta Canonica**: `/api/solicitudes/[id]/comentarios`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/solicitudes/[id]/comentarios/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/solicitudes/[id]/comentarios`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.103 Endpoint: `/api/solicitudes/[id]`
* **Ruta Canonica**: `/api/solicitudes/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/solicitudes/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/solicitudes/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.104 Endpoint: `/api/solicitudes`
* **Ruta Canonica**: `/api/solicitudes`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/solicitudes/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/solicitudes`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.105 Endpoint: `/api/perfiles/tecnico/cambios/enterado`
* **Ruta Canonica**: `/api/perfiles/tecnico/cambios/enterado`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/tecnico/cambios/enterado/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/perfiles/tecnico/cambios/enterado`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_cambio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_cambio": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO cambio_enterado (id_cambio, id_usuario) VALUES ($1, $2) ON CONFLICT (id_cambio, id_usuario) DO NOTHING
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.106 Endpoint: `/api/perfiles/tecnico/contadores`
* **Ruta Canonica**: `/api/perfiles/tecnico/contadores`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/tecnico/contadores/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/perfiles/tecnico/contadores`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT COUNT(*)::text as total, COUNT(CASE WHEN fecha_limite_sla < NOW() THEN 1 END)::text as vencidos FROM ticket WHERE id_usuario_asignado = $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.107 Endpoint: `/api/perfiles/tecnico/mesa/tomar`
* **Ruta Canonica**: `/api/perfiles/tecnico/mesa/tomar`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/tecnico/mesa/tomar/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/perfiles/tecnico/mesa/tomar`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_ticket` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_ticket": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
UPDATE ticket SET id_usuario_asignado = $1, id_estado = CASE WHEN id_estado = 1 THEN 2 ELSE id_estado END, usuario_modificacion = $1, fecha_modificacion = now()
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.108 Endpoint: `/api/perfiles/tecnico/recordatorios`
* **Ruta Canonica**: `/api/perfiles/tecnico/recordatorios`
* **Metodos HTTP Disponibles**: `GET`, `POST`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/tecnico/recordatorios/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/perfiles/tecnico/recordatorios`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `titulo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `fecha_hora` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `objeto_tipo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `objeto_id` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_recordatorio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `completado` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "titulo": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "fecha_hora": "valor_de_ejemplo",
  "objeto_tipo": "valor_de_ejemplo",
  "objeto_id": "valor_de_ejemplo",
  "id_recordatorio": "valor_de_ejemplo",
  "completado": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM tecnico_recordatorios WHERE id_usuario = $1 ORDER BY fecha_hora ASC
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.109 Endpoint: `/api/perfiles/tecnico/usuarios`
* **Ruta Canonica**: `/api/perfiles/tecnico/usuarios`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/tecnico/usuarios/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/perfiles/tecnico/usuarios`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `q` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.110 Endpoint: `/api/tecnicos/[id]`
* **Ruta Canonica**: `/api/tecnicos/[id]`
* **Metodos HTTP Disponibles**: `PATCH`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/tecnicos/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/tecnicos/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT EXISTS ( SELECT 1 FROM departamento_ti WHERE id_departamento = $1 AND id_supervisor = $2 AND estado_registro = true ) AS existe
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.111 Endpoint: `/api/tecnicos`
* **Ruta Canonica**: `/api/tecnicos`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/tecnicos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/tecnicos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `id_departamento` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `nivel` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `id_usuario` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_departamento` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nivel_soporte` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `capacidad_maxima_tickets` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `estado_operativo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `especialidad_principal` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "id_usuario": "valor_de_ejemplo",
  "id_departamento": "valor_de_ejemplo",
  "nivel_soporte": "valor_de_ejemplo",
  "capacidad_maxima_tickets": "valor_de_ejemplo",
  "estado_operativo": "valor_de_ejemplo",
  "especialidad_principal": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
td.id_departamento IN ( SELECT d.id_departamento FROM departamento_ti d WHERE d.id_supervisor = $${paramIdx++} AND d.estado_registro = true )
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.112 Endpoint: `/api/tickets/[id]/comentarios`
* **Ruta Canonica**: `/api/tickets/[id]/comentarios`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/tickets/[id]/comentarios/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/tickets/[id]/comentarios`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `comentario` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `es_interno` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "comentario": "valor_de_ejemplo",
  "es_interno": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno) VALUES ($1, $2, $3, $4) RETURNING *
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.113 Endpoint: `/api/tickets/[id]`
* **Ruta Canonica**: `/api/tickets/[id]`
* **Metodos HTTP Disponibles**: `GET`, `PATCH`
* **Archivo Fuente en Repositorio**: `api/tickets/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/tickets/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT t.id_ticket, t.codigo_ticket, t.titulo, t.descripcion,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.114 Endpoint: `/api/tickets/catalogos`
* **Ruta Canonica**: `/api/tickets/catalogos`
* **Metodos HTTP Disponibles**: `GET`
* **Archivo Fuente en Repositorio**: `api/tickets/catalogos/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/tickets/catalogos`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT DISTINCT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre, u.correo_electronico as correo, td.id_departamento, dep.nombre as departamento_nombre,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.115 Endpoint: `/api/tickets`
* **Ruta Canonica**: `/api/tickets`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/tickets/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/tickets`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Parametros de Consulta en URL (Query Parameters)
| Parametro | Tipo | Restriccion | Descripcion / Uso en Filtro |
|:---|:---|:---|:---|
| `vista` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id_tipo` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id_prioridad` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id_estado` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id_departamento` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `id_servicio` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `estado_aprobacion` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `buscar` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `solo_asignados_a_mi` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `sla_vencido` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `solicitante` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |
| `tecnico` | `string` | Opcional | Filtro aplicado en la clausula WHERE para paginacion o busqueda |

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `titulo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `descripcion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_tipo_ticket` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_categoria` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_servicio` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_departamento` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `canal_comunicacion` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_impacto` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_urgencia` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `campos_adicionales` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `archivos` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "titulo": "valor_de_ejemplo",
  "descripcion": "valor_de_ejemplo",
  "id_tipo_ticket": "valor_de_ejemplo",
  "id_categoria": "valor_de_ejemplo",
  "id_servicio": "valor_de_ejemplo",
  "id_departamento": "valor_de_ejemplo",
  "canal_comunicacion": "valor_de_ejemplo",
  "id_impacto": "valor_de_ejemplo",
  "id_urgencia": "valor_de_ejemplo",
  "campos_adicionales": "valor_de_ejemplo",
  "archivos": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
t.id_departamento = (SELECT td.id_departamento FROM tecnico_detalle td WHERE td.id_usuario = $${paramIdx++} AND td.estado_registro = true)
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.116 Endpoint: `/api/usuarios/[id]/desbloquear`
* **Ruta Canonica**: `/api/usuarios/[id]/desbloquear`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/usuarios/[id]/desbloquear/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Autenticacion obligatoria (Sesion JWT en cookie sesion_tickets)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/usuarios/[id]/desbloquear`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
UPDATE usuario SET intentos_fallidos = 0, cuenta_bloqueada = false, bloqueado_hasta = NULL, usuario_modificacion = $1,
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.117 Endpoint: `/api/usuarios/[id]`
* **Ruta Canonica**: `/api/usuarios/[id]`
* **Metodos HTTP Disponibles**: `PUT`, `DELETE`
* **Archivo Fuente en Repositorio**: `api/usuarios/[id]/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/usuarios/[id]`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `dni` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombres` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `apellido_paterno` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `apellido_materno` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `celular` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `correo_personal` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `correo_electronico` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `clave` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `// opcional` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `id_departamento_empresa` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nivel_prioridad` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "dni": "valor_de_ejemplo",
  "nombres": "valor_de_ejemplo",
  "apellido_paterno": "valor_de_ejemplo",
  "apellido_materno": "valor_de_ejemplo",
  "celular": "valor_de_ejemplo",
  "correo_personal": "valor_de_ejemplo",
  "correo_electronico": "valor_de_ejemplo",
  "clave": "valor_de_ejemplo",
  "// opcional": "valor_de_ejemplo",
  "id_departamento_empresa": "valor_de_ejemplo",
  "nivel_prioridad": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT clave FROM usuario WHERE id_usuario = $1
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.118 Endpoint: `/api/usuarios/enviar-credenciales`
* **Ruta Canonica**: `/api/usuarios/enviar-credenciales`
* **Metodos HTTP Disponibles**: `POST`
* **Archivo Fuente en Repositorio**: `api/usuarios/enviar-credenciales/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/usuarios/enviar-credenciales`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `correo_personal` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `correo_corporativo` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `clave_temporal` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombres` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles = []` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "correo_personal": "valor_de_ejemplo",
  "correo_corporativo": "valor_de_ejemplo",
  "clave_temporal": "valor_de_ejemplo",
  "nombres": "valor_de_ejemplo",
  "perfiles = []": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT * FROM entidad WHERE estado_registro = true
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

### 5.119 Endpoint: `/api/usuarios`
* **Ruta Canonica**: `/api/usuarios`
* **Metodos HTTP Disponibles**: `GET`, `POST`
* **Archivo Fuente en Repositorio**: `api/usuarios/route.ts`
* **Nivel de Seguridad y Perfil Requerido**: Acceso Exclusivo para el Perfil 1 (Administrador del Sistema)

#### Proposito Operacional y Contexto ITIL v4
Este controlador atiende las peticiones dirigidas al recurso `/api/usuarios`.
Implementa transacciones parametrizadas contra PostgreSQL que garantizan integridad referencial absoluta.

#### Flujo de Procesamiento Interno Paso a Paso
1. **Recepcion de Peticion HTTP**: El runtime de Next.js despacha la solicitud entrante al Route Handler.
2. **Validacion de Sesion y Privilegios**: Se examina la cookie `sesion_tickets`, se decodifica el JWT y se verifica que el `perfilActivo` posea autorizacion.
3. **Sanitizacion de Entradas**: Se procesan los parametros URL o el cuerpo JSON mediante `src/lib/validaciones.ts`.
4. **Ejecucion de Logica de Negocio**: Se coordinan las consultas SQL parametrizadas a traves del pool de base de datos.
5. **Generacion de Pista de Auditoria**: Las transacciones que mutan estado emiten un registro en `ticket_historial`.
6. **Serializacion de Respuesta**: Se retorna un objeto JSON estandarizado acompanado del codigo de estado HTTP semantico.

#### Especificacion del Cuerpo de Peticion (JSON Request Body)
| Propiedad | Tipo | Obligatorio | Regla de Validacion Aplicada |
|:---|:---|:---|:---|
| `dni` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nombres` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `apellido_paterno` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `apellido_materno` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `celular` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `correo_personal` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `correo_electronico` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `clave` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `perfiles` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |
| `nivel_prioridad` | `any` | Si | Campo evaluado por las funciones de validacion pura de la aplicacion |

```json
// Ejemplo de Request Body:
{
  "dni": "valor_de_ejemplo",
  "nombres": "valor_de_ejemplo",
  "apellido_paterno": "valor_de_ejemplo",
  "apellido_materno": "valor_de_ejemplo",
  "celular": "valor_de_ejemplo",
  "correo_personal": "valor_de_ejemplo",
  "correo_electronico": "valor_de_ejemplo",
  "clave": "valor_de_ejemplo",
  "perfiles": "valor_de_ejemplo",
  "nivel_prioridad": "valor_de_ejemplo"
}
```

#### Transacciones y Sentencias SQL Ejecutadas
```sql
-- Sentencia principal parametrizada:
SELECT u.id_usuario, u.dni, u.nombres, u.apellido_paterno, u.apellido_materno, u.celular, u.correo_personal, u.correo_electronico, u.estado_registro, u.intentos_fallidos, u.cuenta_bloqueada, u.id_departamento_empresa, u.nivel_prioridad, de.nombre AS ...
```

#### Contrato de Respuestas y Codigos HTTP
* **`200 OK` / `201 Created`**: Peticion procesada exitosamente.
  ```json
  {
    "exito": true,
    "mensaje": "Operacion completada exitosamente.",
    "datos": {}
  }
  ```
* **`400 Bad Request`**: Carga util incompleta o datos que violan reglas tecnicas.
* **`401 Unauthorized`**: Sesion no autenticada o token JWT invalido.
* **`403 Forbidden`**: El perfil activo del usuario no tiene permisos para esta accion.
* **`404 Not Found`**: El registro solicitado no fue encontrado.
* **`409 Conflict`**: Colision de unicidad de datos en la base de datos.
* **`500 Internal Server Error`**: Falla inesperada en el motor de base de datos o conexion.

---

## CAPITULO 6: ARQUITECTURA DE INTERFAZ Y DESGLOSE EXHAUSTIVO DE PAGINAS

Este capitulo contiene el desglose analitico de las 108 paginas que componen el arbol de navegacion bajo `src/app/(app)/`.
Cada pagina se documenta con su ruta de navegacion, roles que tienen acceso, estados reactivos administrados y componentes integrados.

### 6.1 Vista: `/activos/cmdb`
* **Ruta de Acceso Web**: `/activos/cmdb`
* **Archivo Fuente**: `src/app/(app)/activos/cmdb/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/activos/cmdb`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `elementos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `relaciones` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroTipo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroCriticidad` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vista` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 15 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/activos/cmdb?${params.toString()}`
* `/api/activos/cmdb`
* `/api/activos/cmdb/relaciones`
* `/api/activos/cmdb/relaciones?id_ci_padre=${idPadre}&id_ci_hijo=${idHijo}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.2 Vista: `/activos/cmdb/tipos`
* **Ruta de Acceso Web**: `/activos/cmdb/tipos`
* **Archivo Fuente**: `src/app/(app)/activos/cmdb/tipos/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/activos/cmdb/tipos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tipos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vista` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `codigo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nombre` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `descripcion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `categoria` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `atributosTxt` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 1 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/cmdb/tipos`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.3 Vista: `/activos/inventario`
* **Ruta de Acceso Web**: `/activos/inventario`
* **Archivo Fuente**: `src/app/(app)/activos/inventario/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/activos/inventario`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `activos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroTipo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vista` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `activoSeleccionado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 23 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/activos/modelos`
* `/api/activos/tipos`
* `/api/activos/${a.id_activo}/historial`
* `/api/activos`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.4 Vista: `/activos/licencias`
* **Ruta de Acceso Web**: `/activos/licencias`
* **Archivo Fuente**: `src/app/(app)/activos/licencias/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/activos/licencias`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `licencias` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vista` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `licenciaSeleccionada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nombreSoftware` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fabricante` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `claveLicencia` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `tipoLicencia` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cantidadAdquirida` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cantidadEnUso` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 12 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/activos/licencias/asignaciones?id_licencia=${idLic}`
* `/api/usuarios`
* `/api/activos`
* `/api/activos/licencias/asignaciones`
* `/api/activos/licencias`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.5 Vista: `/activos`
* **Ruta de Acceso Web**: `/activos`
* **Archivo Fuente**: `src/app/(app)/activos/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/activos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.6 Vista: `/admin/activos-config/ciclos-vida-transiciones`
* **Ruta de Acceso Web**: `/admin/activos-config/ciclos-vida-transiciones`
* **Archivo Fuente**: `src/app/(app)/admin/activos-config/ciclos-vida-transiciones/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/activos-config/ciclos-vida-transiciones`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 10 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/activos-config/ciclos-vida-transiciones/configuracion?pestana=${tabActiva}`
* `/api/admin/activos-config/ciclos-vida-transiciones/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.7 Vista: `/admin/activos-config/cmdb-relaciones`
* **Ruta de Acceso Web**: `/admin/activos-config/cmdb-relaciones`
* **Archivo Fuente**: `src/app/(app)/admin/activos-config/cmdb-relaciones/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/activos-config/cmdb-relaciones`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 10 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/activos-config/cmdb-relaciones/configuracion?pestana=${tabActiva}`
* `/api/admin/activos-config/cmdb-relaciones/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.8 Vista: `/admin/activos-config/licencias-contratos`
* **Ruta de Acceso Web**: `/admin/activos-config/licencias-contratos`
* **Archivo Fuente**: `src/app/(app)/admin/activos-config/licencias-contratos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/activos-config/licencias-contratos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 10 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/activos-config/licencias-contratos/configuracion?pestana=${tabActiva}`
* `/api/admin/activos-config/licencias-contratos/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.9 Vista: `/admin/activos-config/tipos-modelos-atributos`
* **Ruta de Acceso Web**: `/admin/activos-config/tipos-modelos-atributos`
* **Archivo Fuente**: `src/app/(app)/admin/activos-config/tipos-modelos-atributos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/activos-config/tipos-modelos-atributos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 10 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/activos-config/tipos-modelos-atributos/configuracion?pestana=${tabActiva}`
* `/api/admin/activos-config/tipos-modelos-atributos/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.10 Vista: `/admin/auditoria-sistema`
* **Ruta de Acceso Web**: `/admin/auditoria-sistema`
* **Archivo Fuente**: `src/app/(app)/admin/auditoria-sistema/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/auditoria-sistema`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `logs` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroModulo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroAccion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaDesde` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaHasta` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `logSeleccionado` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/auditoria-sistema?${params.toString()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.11 Vista: `/admin/conocimiento-config`
* **Ruta de Acceso Web**: `/admin/conocimiento-config`
* **Archivo Fuente**: `src/app/(app)/admin/conocimiento-config/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/conocimiento-config`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `articulos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `ok` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `articuloSeleccionado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `historialArticulo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargandoDetalle` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idRetirar` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 17 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/conocimiento`
* `/api/admin/conocimiento/categorias`
* `/api/admin/conocimiento/politicas`
* `/api/admin/conocimiento/${id}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.12 Vista: `/admin/departamentos-empresa`
* **Ruta de Acceso Web**: `/admin/departamentos-empresa`
* **Archivo Fuente**: `src/app/(app)/admin/departamentos-empresa/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/departamentos-empresa`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `items` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `codigo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nombre` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `descripcion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `ok` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/departamentos-empresa`
* `/api/departamentos-empresa/${d.id_departamento_empresa}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.13 Vista: `/admin/departamentos`
* **Ruta de Acceso Web**: `/admin/departamentos`
* **Archivo Fuente**: `src/app/(app)/admin/departamentos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/departamentos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `departamentos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `usuarios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vista` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `deptoEditando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `deptoVerTecnicos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 11 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/departamentos-ti`
* `/api/usuarios`
* `/api/departamentos-ti/${dep.id_departamento}`
* `/api/tecnicos`
* `/api/tecnicos/${t.id_usuario}`
* `/api/departamentos-ti/${deptoEditando.id_departamento}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.14 Vista: `/admin/mantenimiento-datos`
* **Ruta de Acceso Web**: `/admin/mantenimiento-datos`
* **Archivo Fuente**: `src/app/(app)/admin/mantenimiento-datos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/mantenimiento-datos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `aniosAntiguedad` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `simulando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `purgando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `resultadoSimulacion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/mantenimiento-datos`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.15 Vista: `/admin/menu`
* **Ruta de Acceso Web**: `/admin/menu`
* **Archivo Fuente**: `src/app/(app)/admin/menu/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/menu`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `opciones` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `perfiles` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mostrarFormulario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `formulario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/menu/admin`
* `/api/identidades/perfiles`
* `/api/menu/admin/${op.id_opcion_menu}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.16 Vista: `/admin/notificaciones`
* **Ruta de Acceso Web**: `/admin/notificaciones`
* **Archivo Fuente**: `src/app/(app)/admin/notificaciones/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/notificaciones`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `pestana` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `plantillaSeleccionada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `colorPrimario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nombreEmpresa` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `logoUrl` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `plantillas` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mediosContacto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `modalNuevoMedioAbierto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nuevoMedioNombre` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nuevoMedioDescripcion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 6 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/configuracion?clave=plantillas_correo_html`
* `/api/admin/configuracion?clave=canales_comunicacion`
* `/api/admin/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.17 Vista: `/admin`
* **Ruta de Acceso Web**: `/admin`
* **Archivo Fuente**: `src/app/(app)/admin/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.18 Vista: `/admin/perfiles`
* **Ruta de Acceso Web**: `/admin/perfiles`
* **Archivo Fuente**: `src/app/(app)/admin/perfiles/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/perfiles`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `perfiles` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `opcionesMenu` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mostrarFormulario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `formulario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/identidades/perfiles?todos=true`
* `/api/menu/admin`
* `/api/identidades/perfiles/${perfil.id_perfil}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.19 Vista: `/admin/procesos/cambios/flujo-evaluacion`
* **Ruta de Acceso Web**: `/admin/procesos/cambios/flujo-evaluacion`
* **Archivo Fuente**: `src/app/(app)/admin/procesos/cambios/flujo-evaluacion/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/procesos/cambios/flujo-evaluacion`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 11 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/cambios/flujo-evaluacion/configuracion?pestana=${tabActiva}`
* `/api/admin/cambios/flujo-evaluacion/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.20 Vista: `/admin/procesos/cambios/formulario`
* **Ruta de Acceso Web**: `/admin/procesos/cambios/formulario`
* **Archivo Fuente**: `src/app/(app)/admin/procesos/cambios/formulario/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/procesos/cambios/formulario`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 11 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/cambios/formulario/configuracion?pantalla=1.3.3.1&pestana=${tabActiva}`
* `/api/admin/cambios/campos-personalizados`
* `/api/admin/cambios/formulario/configuracion`
* `/api/cambios`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.21 Vista: `/admin/procesos/cambios/notificaciones-calendario`
* **Ruta de Acceso Web**: `/admin/procesos/cambios/notificaciones-calendario`
* **Archivo Fuente**: `src/app/(app)/admin/procesos/cambios/notificaciones-calendario/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/procesos/cambios/notificaciones-calendario`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 13 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/cambios/notificaciones-calendario/configuracion?pestana=${tabActiva}`
* `/api/admin/cambios/notificaciones-calendario/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.22 Vista: `/admin/procesos/cambios`
* **Ruta de Acceso Web**: `/admin/procesos/cambios`
* **Archivo Fuente**: `src/app/(app)/admin/procesos/cambios/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/procesos/cambios`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.23 Vista: `/admin/procesos/cambios/tipos-requisitos`
* **Ruta de Acceso Web**: `/admin/procesos/cambios/tipos-requisitos`
* **Archivo Fuente**: `src/app/(app)/admin/procesos/cambios/tipos-requisitos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/procesos/cambios/tipos-requisitos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 8 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/cambios/tipos-requisitos/configuracion?pestana=${tabActiva}`
* `/api/admin/cambios/tipos-requisitos/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.24 Vista: `/admin/procesos/problemas/flujo`
* **Ruta de Acceso Web**: `/admin/procesos/problemas/flujo`
* **Archivo Fuente**: `src/app/(app)/admin/procesos/problemas/flujo/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/procesos/problemas/flujo`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 20 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/problemas/flujo?pestana=${tabActiva}`
* `/api/admin/problemas/flujo`
* `/api/admin/problemas/flujo/estados`
* `/api/admin/problemas/flujo/estados?id=${id}`
* `/api/admin/problemas/flujo/transiciones`
* `/api/admin/problemas/flujo/transiciones?id=${id}`
* `/api/admin/problemas/flujo/asignacion`
* `/api/admin/problemas/flujo/asignacion?id=${id}`
* `/api/admin/problemas/flujo/objetivos`
* `/api/admin/problemas/flujo/escalamiento`
* `/api/admin/problemas/flujo/escalamiento?id=${id}`
* `/api/admin/problemas/flujo/reapertura`
* `/api/admin/problemas/flujo/tareas`
* `/api/admin/problemas/flujo/tareas?id=${id}&tipo=${tipo}`
* `/api/admin/problemas/flujo/mayores`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.25 Vista: `/admin/procesos/problemas/formulario`
* **Ruta de Acceso Web**: `/admin/procesos/problemas/formulario`
* **Archivo Fuente**: `src/app/(app)/admin/procesos/problemas/formulario/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/procesos/problemas/formulario`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bloqueadoPorOtro` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 20 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/problemas/configuracion?ambito=${tabActiva}`
* `/api/admin/problemas/campos-personalizados?entidad=problema`
* `/api/admin/problemas/catalogos`
* `/api/admin/problemas/matriz-prioridad`
* `/api/admin/problemas/plantillas`
* `/api/admin/problemas/configuracion`
* `/api/admin/problemas/configuracion?ambito=${tabActiva}&historial=true`
* `/api/admin/problemas/catalogos?catalogo=${cat}&id=${id}`
* `/api/admin/problemas/plantillas?id=${id}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.26 Vista: `/admin/procesos/problemas`
* **Ruta de Acceso Web**: `/admin/procesos/problemas`
* **Archivo Fuente**: `src/app/(app)/admin/procesos/problemas/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/procesos/problemas`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.27 Vista: `/admin/procesos/problemas/relaciones`
* **Ruta de Acceso Web**: `/admin/procesos/problemas/relaciones`
* **Archivo Fuente**: `src/app/(app)/admin/procesos/problemas/relaciones/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/procesos/problemas/relaciones`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tabActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorCarga` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `versionPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `autorPublicada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `hayBorrador` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `publicando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `puedePublicar` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 13 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/problemas/relaciones`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.28 Vista: `/admin/reportes-disenador`
* **Ruta de Acceso Web**: `/admin/reportes-disenador`
* **Archivo Fuente**: `src/app/(app)/admin/reportes-disenador/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/reportes-disenador`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `widgets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/reportes-disenador`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.29 Vista: `/admin/rfc`
* **Ruta de Acceso Web**: `/admin/rfc`
* **Archivo Fuente**: `src/app/(app)/admin/rfc/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/rfc`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.30 Vista: `/admin/seguridad-logs`
* **Ruta de Acceso Web**: `/admin/seguridad-logs`
* **Archivo Fuente**: `src/app/(app)/admin/seguridad-logs/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/seguridad-logs`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `logs` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroResultado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/logs?${params.toString()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.31 Vista: `/admin/servicios/[id]/formulario`
* **Ruta de Acceso Web**: `/admin/servicios/[id]/formulario`
* **Archivo Fuente**: `src/app/(app)/admin/servicios/[id]/formulario/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/servicios/[id]/formulario`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.32 Vista: `/admin/servicios`
* **Ruta de Acceso Web**: `/admin/servicios`
* **Archivo Fuente**: `src/app/(app)/admin/servicios/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/servicios`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `servicios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `categorias` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `categoriaSeleccionada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `serviciosSeleccionadosParaAsignar` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busquedaAsignar` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 24 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/servicios?${params.toString()}`
* `/api/tickets/catalogos`
* `/api/servicios`
* `/api/servicios/${servicioSeleccionado.id_servicio}`
* `/api/servicios/${servicioSeleccionado.id_servicio}/workflow`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.33 Vista: `/admin/servicios/sla`
* **Ruta de Acceso Web**: `/admin/servicios/sla`
* **Archivo Fuente**: `src/app/(app)/admin/servicios/sla/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/servicios/sla`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.34 Vista: `/admin/tecnicos`
* **Ruta de Acceso Web**: `/admin/tecnicos`
* **Archivo Fuente**: `src/app/(app)/admin/tecnicos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/tecnicos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tecnicos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `departamentos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `usuariosDisponibles` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroDepto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroNivel` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vista` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 22 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tecnicos?${params.toString()}`
* `/api/departamentos-ti`
* `/api/usuarios`
* `/api/admin/tecnicos/ausencias`
* `/api/admin/tecnicos/ausencias?id=${id}`
* `/api/tecnicos/${tecnicoEditando.id_usuario}`
* `/api/tecnicos`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.35 Vista: `/admin/tickets-formularios`
* **Ruta de Acceso Web**: `/admin/tickets-formularios`
* **Archivo Fuente**: `src/app/(app)/admin/tickets-formularios/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/tickets-formularios`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `camposPorProceso` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vistaPreviaModo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `prioridadSimuladaId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `servicioSimuladoId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nuevoCampoEtiqueta` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nuevoCampoTipo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 5 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/admin/configuracion?clave=formularios_solicitante_config`
* `/api/admin/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.36 Vista: `/admin/tickets-vistas`
* **Ruta de Acceso Web**: `/admin/tickets-vistas`
* **Archivo Fuente**: `src/app/(app)/admin/tickets-vistas/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/tickets-vistas`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `pestanaPrincipal` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `tipoTicket` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `usuarios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `perfiles` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `modoSeleccion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `claveSeleccionada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busquedaUsuario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vistas` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `flujoEstados` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 3 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/usuarios`
* `/api/identidades/perfiles`
* `/api/admin/configuracion?clave=vistas_ticket_perfil`
* `/api/admin/configuracion?clave=flujo_estados_acciones`
* `/api/admin/configuracion`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.37 Vista: `/admin/usuarios`
* **Ruta de Acceso Web**: `/admin/usuarios`
* **Archivo Fuente**: `src/app/(app)/admin/usuarios/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 1 (Administrador del Sistema)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/admin/usuarios`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `usuarios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `perfilesDisponibles` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `departamentosEmpresa` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vista` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `formulario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `resumenNuevoUsuario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `enviandoCorreoCredenciales` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `correoCredencialesEnviado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 6 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/usuarios`
* `/api/identidades/perfiles`
* `/api/usuarios/${formulario.id_usuario}`
* `/api/usuarios/enviar-credenciales`
* `/api/usuarios/${usuario.id_usuario}`
* `/api/usuarios/${idUsuario}/desbloquear`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.38 Vista: `/cambios/gestion/[id]`
* **Ruta de Acceso Web**: `/cambios/gestion/[id]`
* **Archivo Fuente**: `src/app/(app)/cambios/gestion/[id]/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/cambios/gestion/[id]`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `cambio` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `sesion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `pestanaActiva` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/cambios/${id}`
* `/api/menu`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.39 Vista: `/cambios/gestion/cab`
* **Ruta de Acceso Web**: `/cambios/gestion/cab`
* **Archivo Fuente**: `src/app/(app)/cambios/gestion/cab/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 4 (Supervisor) y Perfil 1 (Administrador)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/cambios/gestion/cab`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `rfcs` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `sesion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `rfcVotar` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `decision` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `comentario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `enviandoVoto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorVoto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/cambios?estado=2`
* `/api/menu`
* `/api/cambios/${rfcVotar.id_cambio}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.40 Vista: `/cambios/gestion/calendario`
* **Ruta de Acceso Web**: `/cambios/gestion/calendario`
* **Archivo Fuente**: `src/app/(app)/cambios/gestion/calendario/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/cambios/gestion/calendario`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `cambios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/cambios`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.41 Vista: `/cambios/gestion/crear`
* **Ruta de Acceso Web**: `/cambios/gestion/crear`
* **Archivo Fuente**: `src/app/(app)/cambios/gestion/crear/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/cambios/gestion/crear`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `sesion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `configRfc` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `camposPersonalizados` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cis` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `problemas` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `titulo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `tipoCambio` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idImpacto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idUrgencia` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 14 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/menu`
* `/api/activos/cmdb`
* `/api/problemas`
* `/api/admin/rfc-config`
* `/api/admin/cambios/modelos-estandar`
* `/api/cambios`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.42 Vista: `/cambios/gestion`
* **Ruta de Acceso Web**: `/cambios/gestion`
* **Archivo Fuente**: `src/app/(app)/cambios/gestion/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/cambios/gestion`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.43 Vista: `/cambios/gestion/todos`
* **Ruta de Acceso Web**: `/cambios/gestion/todos`
* **Archivo Fuente**: `src/app/(app)/cambios/gestion/todos/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/cambios/gestion/todos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `cambios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroTipo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cambioSeleccionado` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.44 Vista: `/cambios`
* **Ruta de Acceso Web**: `/cambios`
* **Archivo Fuente**: `src/app/(app)/cambios/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/cambios`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.45 Vista: `/dashboard`
* **Ruta de Acceso Web**: `/dashboard`
* **Archivo Fuente**: `src/app/(app)/dashboard/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/dashboard`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.46 Vista: `/incidentes`
* **Ruta de Acceso Web**: `/incidentes`
* **Archivo Fuente**: `src/app/(app)/incidentes/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/incidentes`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.47 Vista: `/mi-cuenta`
* **Ruta de Acceso Web**: `/mi-cuenta`
* **Archivo Fuente**: `src/app/(app)/mi-cuenta/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/mi-cuenta`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `usuario` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `perfiles` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nombres` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `apellidoPaterno` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `apellidoMaterno` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `celular` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardandoDatos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `claveActual` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `claveNueva` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 5 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/mi-cuenta`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.48 Vista: `/operacion/eventos`
* **Ruta de Acceso Web**: `/operacion/eventos`
* **Archivo Fuente**: `src/app/(app)/operacion/eventos/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/operacion/eventos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.49 Vista: `/operacion`
* **Ruta de Acceso Web**: `/operacion`
* **Archivo Fuente**: `src/app/(app)/operacion/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/operacion`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.50 Vista: `/operacion/resiliencia`
* **Ruta de Acceso Web**: `/operacion/resiliencia`
* **Archivo Fuente**: `src/app/(app)/operacion/resiliencia/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/operacion/resiliencia`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.51 Vista: `/problemas/kedb`
* **Ruta de Acceso Web**: `/problemas/kedb`
* **Archivo Fuente**: `src/app/(app)/problemas/kedb/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/problemas/kedb`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.52 Vista: `/problemas`
* **Ruta de Acceso Web**: `/problemas`
* **Archivo Fuente**: `src/app/(app)/problemas/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/problemas`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.53 Vista: `/proveedores`
* **Ruta de Acceso Web**: `/proveedores`
* **Archivo Fuente**: `src/app/(app)/proveedores/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/proveedores`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.54 Vista: `/solicitudes`
* **Ruta de Acceso Web**: `/solicitudes`
* **Archivo Fuente**: `src/app/(app)/solicitudes/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/solicitudes`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.55 Vista: `/plataforma/perfiles/tecnico/activos/conteos`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/activos/conteos`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/activos/conteos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/activos/conteos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `items` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `codigoIngresado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `itemEncontrado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `sobranteModal` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `serieSobrante` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nombreSobrante` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.56 Vista: `/plataforma/perfiles/tecnico/activos/inventario`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/activos/inventario`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/activos/inventario/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/activos/inventario`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `activos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroTipo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/activos?_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.57 Vista: `/plataforma/perfiles/tecnico/activos/licencias`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/activos/licencias`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/activos/licencias/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/activos/licencias`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.58 Vista: `/plataforma/perfiles/tecnico/activos/mantenimiento`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/activos/mantenimiento`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/activos/mantenimiento/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/activos/mantenimiento`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `pestana` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.59 Vista: `/plataforma/perfiles/tecnico/activos/mapa`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/activos/mapa`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/activos/mapa/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/activos/mapa`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `ciSeleccionado` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.60 Vista: `/plataforma/perfiles/tecnico/agenda`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/agenda`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/agenda/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/agenda`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `recordatorios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `vista` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `modalNuevo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `titulo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaHora` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=asignados&_t=${Date.now()}`
* `/api/perfiles/tecnico/recordatorios?_t=${Date.now()}`
* `/api/perfiles/tecnico/recordatorios`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.61 Vista: `/plataforma/perfiles/tecnico/cambios/calendario`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/cambios/calendario`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/cambios/calendario/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/cambios/calendario`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `cambios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/cambios?vista=calendario&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.62 Vista: `/plataforma/perfiles/tecnico/cambios/historial`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/cambios/historial`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/cambios/historial/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/cambios/historial`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `cambios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/cambios?vista=historial&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.63 Vista: `/plataforma/perfiles/tecnico/cambios/impacto`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/cambios/impacto`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/cambios/impacto/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/cambios/impacto`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `cambios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `enterados` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/cambios?vista=impacto&_t=${Date.now()}`
* `/api/perfiles/tecnico/cambios/enterado`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.64 Vista: `/plataforma/perfiles/tecnico/cambios/implementacion`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/cambios/implementacion`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/cambios/implementacion/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/cambios/implementacion`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `cambios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `seleccionado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `goNoGoListo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `enEjecucion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `bitacora` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nuevoPasoTexto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/cambios?vista=implementacion&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.65 Vista: `/plataforma/perfiles/tecnico/cambios/mis-cambios`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/cambios/mis-cambios`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/cambios/mis-cambios/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/cambios/mis-cambios`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `cambios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `segmento` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/cambios?vista=mis_cambios&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.66 Vista: `/plataforma/perfiles/tecnico/cambios/nuevo`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/cambios/nuevo`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/cambios/nuevo/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/cambios/nuevo`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.67 Vista: `/plataforma/perfiles/tecnico/catalogo`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/catalogo`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/catalogo/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/catalogo`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `servicios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `pestana` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets/catalogos`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.68 Vista: `/plataforma/perfiles/tecnico/conocimiento/base`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/conocimiento/base`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/conocimiento/base/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/conocimiento/base`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `articulos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `articuloSeleccionado` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/conocimiento?_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.69 Vista: `/plataforma/perfiles/tecnico/conocimiento/mis-articulos`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/conocimiento/mis-articulos`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/conocimiento/mis-articulos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/conocimiento/mis-articulos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `articulos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/conocimiento?vista=mis_articulos&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.70 Vista: `/plataforma/perfiles/tecnico/conocimiento/nuevo`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/conocimiento/nuevo`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/conocimiento/nuevo/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/conocimiento/nuevo`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `titulo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `contenido` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idCategoria` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `plantilla` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/conocimiento`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.71 Vista: `/plataforma/perfiles/tecnico/conocimiento/revisiones`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/conocimiento/revisiones`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/conocimiento/revisiones/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/conocimiento/revisiones`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `articulos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/conocimiento?vista=revisiones&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.72 Vista: `/plataforma/perfiles/tecnico/desempeno`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/desempeno`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/desempeno/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/desempeno`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.73 Vista: `/plataforma/perfiles/tecnico/mesa/area`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/mesa/area`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/mesa/area/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/mesa/area`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroTipo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroPrioridad` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=departamento&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.74 Vista: `/plataforma/perfiles/tecnico/mesa/asignados`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/mesa/asignados`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/mesa/asignados/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/mesa/asignados`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `segmento` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroPrioridad` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mostrarFiltros` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=asignados&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.75 Vista: `/plataforma/perfiles/tecnico/mesa/buscar`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/mesa/buscar`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/mesa/buscar/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/mesa/buscar`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.76 Vista: `/plataforma/perfiles/tecnico/mesa/historial`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/mesa/historial`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/mesa/historial/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/mesa/historial`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroSla` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mostrarFiltros` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=resueltos&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.77 Vista: `/plataforma/perfiles/tecnico/mesa/pendientes`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/mesa/pendientes`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/mesa/pendientes/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/mesa/pendientes`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `tomandoId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `segmento` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroPrioridad` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mostrarFiltros` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=bandeja&_t=${Date.now()}`
* `/api/perfiles/tecnico/mesa/tomar`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.78 Vista: `/plataforma/perfiles/tecnico/mesa/registrar`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/mesa/registrar`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/mesa/registrar/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/mesa/registrar`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.79 Vista: `/plataforma/perfiles/tecnico`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.80 Vista: `/plataforma/perfiles/tecnico/panel`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/panel`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/panel/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/panel`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `ticketsAsignados` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `ticketsPendientes` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `recordatorios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `ticketsResueltos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `periodoDesempeno` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=asignados&_t=${Date.now()}`
* `/api/tickets?vista=bandeja&_t=${Date.now()}`
* `/api/perfiles/tecnico/recordatorios?_t=${Date.now()}`
* `/api/tickets?vista=resueltos&solo_asignados_a_mi=1&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.81 Vista: `/plataforma/perfiles/tecnico/problemas/asignados`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/problemas/asignados`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/problemas/asignados/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/problemas/asignados`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `problemas` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/problemas?_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.82 Vista: `/plataforma/perfiles/tecnico/problemas/candidatos`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/problemas/candidatos`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/problemas/candidatos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/problemas/candidatos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `candidatos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=todos&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.83 Vista: `/plataforma/perfiles/tecnico/problemas/errores-conocidos`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/problemas/errores-conocidos`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/problemas/errores-conocidos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/problemas/errores-conocidos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `errores` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `copiadoId` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/problemas?kedb=true&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.84 Vista: `/plataforma/perfiles/tecnico/problemas/grupo`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/problemas/grupo`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/problemas/grupo/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/problemas/grupo`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `problemas` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/problemas?_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.85 Vista: `/plataforma/perfiles/tecnico/problemas/nuevo`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/problemas/nuevo`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/problemas/nuevo/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/problemas/nuevo`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `titulo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `descripcion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idImpacto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idUrgencia` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `metodoAnalisis` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/problemas`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.86 Vista: `/plataforma/perfiles/tecnico/sla/objetivos`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/sla/objetivos`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/sla/objetivos/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/sla/objetivos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `prioridadSeleccionada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `fechaInicio` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.87 Vista: `/plataforma/perfiles/tecnico/sla/semaforo`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/sla/semaforo`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/sla/semaforo/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/sla/semaforo`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `alcance` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=${vista}&_t=${Date.now()}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.88 Vista: `/plataforma/perfiles/tecnico/tareas`
* **Ruta de Acceso Web**: `/plataforma/perfiles/tecnico/tareas`
* **Archivo Fuente**: `src/app/(app)/plataforma/perfiles/tecnico/tareas/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 2 (Especialista Tecnico)

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/plataforma/perfiles/tecnico/tareas`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tareas` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `segmento` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `modalNuevo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nuevoTitulo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nuevaDescripcion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `nuevaFecha` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `guardando` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/perfiles/tecnico/recordatorios?_t=${Date.now()}`
* `/api/perfiles/tecnico/recordatorios`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.89 Vista: `/tickets/[id]`
* **Ruta de Acceso Web**: `/tickets/[id]`
* **Archivo Fuente**: `src/app/(app)/tickets/[id]/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/[id]`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `ticket` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `comentarios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `catalogos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `usuarioActual` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `perfilesIds` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `camposConfig` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `ejecutandoAccion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `modalOperativo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 16 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets/${idTicket}`
* `/api/mi-cuenta`
* `/api/admin/configuracion?clave=formularios_solicitante_config`
* `/api/tickets/catalogos`
* `/api/tickets/${idTicket}/comentarios`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.90 Vista: `/tickets/catalogo`
* **Ruta de Acceso Web**: `/tickets/catalogo`
* **Archivo Fuente**: `src/app/(app)/tickets/catalogo/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/catalogo`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `categorias` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `servicios` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `categoriaSeleccionada` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets/catalogos`
* `/api/servicios?estado=activos`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.91 Vista: `/tickets/gestion/aprobaciones`
* **Ruta de Acceso Web**: `/tickets/gestion/aprobaciones`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/aprobaciones/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/aprobaciones`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `ticketSeleccionadoId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `ticketRechazandoId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `motivoRechazo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `procesandoId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idUsuarioActual` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=aprobaciones`
* `/api/tickets/${idTicket}`
* `/api/tickets/${ticketRechazandoId}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.92 Vista: `/tickets/gestion/asignados`
* **Ruta de Acceso Web**: `/tickets/gestion/asignados`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/asignados/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/asignados`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.93 Vista: `/tickets/gestion/asignar`
* **Ruta de Acceso Web**: `/tickets/gestion/asignar`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/asignar/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/asignar`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `tecnicos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `departamentos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `ticketSeleccionado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `notaAsignacion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `asignando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mensajeExito` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `errorAsignacion` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `verDetalleModalId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 5 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=todos`
* `/api/tecnicos`
* `/api/departamentos-ti`
* `/api/tickets/${ticketSeleccionado.id_ticket}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.94 Vista: `/tickets/gestion/auditoria`
* **Ruta de Acceso Web**: `/tickets/gestion/auditoria`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/auditoria/page.tsx`
* **Perfil de Usuario con Acceso**: Perfil 5 (Auditor de Gobernanza) y Perfil 1

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/auditoria`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.95 Vista: `/tickets/gestion/ayuda`
* **Ruta de Acceso Web**: `/tickets/gestion/ayuda`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/ayuda/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/ayuda`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `articulos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `articuloAbiertoId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `votados` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/conocimiento/${idArticulo}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.96 Vista: `/tickets/gestion/bandeja`
* **Ruta de Acceso Web**: `/tickets/gestion/bandeja`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/bandeja/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/bandeja`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.97 Vista: `/tickets/gestion/colaboradores`
* **Ruta de Acceso Web**: `/tickets/gestion/colaboradores`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/colaboradores/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/colaboradores`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/area/colaboradores`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.98 Vista: `/tickets/gestion/crear`
* **Ruta de Acceso Web**: `/tickets/gestion/crear`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/crear/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/crear`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `idTipo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `catalogos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `usuarioActual` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `camposConfig` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `slaObjetivosAdmin` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `slaDefaultSolicitud` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idServicio` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idCategoria` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `idImpacto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 20 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets/catalogos`
* `/api/mi-cuenta`
* `/api/admin/configuracion?clave=formularios_solicitante_config`
* `/api/admin/sla`
* `/api/perfiles/tecnico/usuarios?q=${encodeURIComponent(termino.trim())}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.99 Vista: `/tickets/gestion/departamento`
* **Ruta de Acceso Web**: `/tickets/gestion/departamento`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/departamento/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/departamento`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.100 Vista: `/tickets/gestion/incidentes`
* **Ruta de Acceso Web**: `/tickets/gestion/incidentes`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/incidentes/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/incidentes`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.101 Vista: `/tickets/gestion/mios`
* **Ruta de Acceso Web**: `/tickets/gestion/mios`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/mios/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/mios`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `error` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `pestana` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `busqueda` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroTipo` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroCategoria` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroPrioridad` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `mostrarFiltros` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 1 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tickets?vista=mios&_t=${Date.now()}`
* `/api/tickets/catalogos`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.102 Vista: `/tickets/gestion`
* **Ruta de Acceso Web**: `/tickets/gestion`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.103 Vista: `/tickets/gestion/resueltos`
* **Ruta de Acceso Web**: `/tickets/gestion/resueltos`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/resueltos/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/resueltos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.104 Vista: `/tickets/gestion/solicitudes`
* **Ruta de Acceso Web**: `/tickets/gestion/solicitudes`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/solicitudes/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/solicitudes`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.105 Vista: `/tickets/gestion/tecnicos`
* **Ruta de Acceso Web**: `/tickets/gestion/tecnicos`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/tecnicos/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/tecnicos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `tecnicos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `departamentos` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `tickets` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `actualizandoId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `ticketSeleccionadoId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `tecnicoFiltroId` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroDepto` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroNivel` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `filtroEstado` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| *...y 1 estados reactivos adicionales.* | Control fino de modales, alertas y selecciones |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/tecnicos`
* `/api/departamentos-ti`
* `/api/tickets?vista=todos`
* `/api/tecnicos/${idUsuario}`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.106 Vista: `/tickets/gestion/todos`
* **Ruta de Acceso Web**: `/tickets/gestion/todos`
* **Archivo Fuente**: `src/app/(app)/tickets/gestion/todos/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/gestion/todos`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.107 Vista: `/tickets`
* **Ruta de Acceso Web**: `/tickets`
* **Archivo Fuente**: `src/app/(app)/tickets/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

### 6.108 Vista: `/tickets/reportes`
* **Ruta de Acceso Web**: `/tickets/reportes`
* **Archivo Fuente**: `src/app/(app)/tickets/reportes/page.tsx`
* **Perfil de Usuario con Acceso**: Todos los usuarios autenticados

#### Historia de Usuario y Valor para el Negocio
* **Como**: Usuario operando con el rol autorizado en `/tickets/reportes`.
* **Quiero**: Visualizar, gestionar o interactuar con los datos y acciones de este modulo.
* **Para**: Cumplir con los objetivos de servicio establecidos en las politicas de la organizacion.

#### Estructura Visual y Composicion de la Pantalla
1. **Cabecera y Titulo de Modulo**: Presenta la identificacion de la vista, descripcion funcional y botones de accion principal.
2. **Barra de Herramientas y Filtros**: Facilita la busqueda reactiva, segmentacion por estado y filtrado por categorias.
3. **Area de Visualizacion Central**: Grilla interactiva, tarjetas de autoservicio o formulario dinamico con validaciones reactivas.
4. **Paneles Modales de Apoyo**: Dialogos para creacion, edicion, vista previa o confirmacion de acciones criticas.

#### Variables de Estado Reactivo (React Hooks)
| Variable de Estado | Proposito en la Vista |
|:---|:---|
| `indicadores` | Mantiene el valor reactivo para renderizado dinamico y filtros |
| `cargando` | Mantiene el valor reactivo para renderizado dinamico y filtros |

#### Dependencias de Servicios API (Data Fetching)
Para mantener sincronizada la interfaz, esta vista se comunica con los endpoints:
* `/api/reportes/indicadores`

#### Flujo de Interaccion del Usuario y Reglas de UX
1. **Carga Inicial**: Se evalua la sesion activa. Si no cumple con el perfil, el layout redirige o restringe la operacion.
2. **Interaccion con Formularios**: Conforme el usuario escribe, las validaciones en tiempo real se ejecutan sin mostrar alertas verdes superfluas.
3. **Resaltado Visual de Errores**: Todo campo que incumple reglas adquiere borde `#ef4444`, fondo `#fef2f2` y un mensaje formal con `<AlertaCampo error={...} />`.
4. **Inhabilitacion de Botones en Vista Previa**: Si la vista se proyecta en modo previsualizacion, los botones de accion permanecen desactivados.
5. **Iconografia**: Absolutamente libre de emojis, utilizando trazados vectoriales limpios.

---

## CAPITULO 7: BIBLIOTECAS INTERNAS Y COMPONENTES REUTILIZABLES

### 7.1 Modulos de Soporte (`src/lib/`)

#### 7.1.1 Modulo: `src/lib/auth.ts`
* **Ruta de Archivo**: `src/lib/auth.ts`
* **Funciones y Simbolos Exportados**:
  - `hashearClave`
  - `compararClave`
  - `validarFortalezaClave`
  - `crearTokenSesion`
  - `verificarTokenSesion`
  - `crearTokenPreSesion`
  - `verificarTokenPreSesion`
  - `MAX_INTENTOS_FALLIDOS`

#### 7.1.2 Modulo: `src/lib/constants.ts`
* **Ruta de Archivo**: `src/lib/constants.ts`
* **Funciones y Simbolos Exportados**:
  - `COOKIE_SESION`

#### 7.1.3 Modulo: `src/lib/correo-util.ts`
* **Ruta de Archivo**: `src/lib/correo-util.ts`
* **Funciones y Simbolos Exportados**:
  - `sanitizarTextoParaCorreo`
  - `generarCorreoCorporativo`
  - `generarClaveEstandar`

#### 7.1.4 Modulo: `src/lib/db.ts`
* **Ruta de Archivo**: `src/lib/db.ts`
* **Funciones y Simbolos Exportados**:
  - `pool`
  - `query`
  - `queryRow`
  - `transaccion`

#### 7.1.5 Modulo: `src/lib/email.ts`
* **Ruta de Archivo**: `src/lib/email.ts`
* **Funciones y Simbolos Exportados**:
  - `enviarCorreoCodigoRecuperacion`
  - `enviarCorreoCredencialesNuevas`

#### 7.1.6 Modulo: `src/lib/menu.ts`
* **Ruta de Archivo**: `src/lib/menu.ts`
* **Funciones y Simbolos Exportados**:
  - `obtenerMenuDelUsuario`

#### 7.1.7 Modulo: `src/lib/mock-tickets.ts`
* **Ruta de Archivo**: `src/lib/mock-tickets.ts`
* **Funciones y Simbolos Exportados**:
  - `TICKETS_MOCK`

#### 7.1.8 Modulo: `src/lib/page-auth.ts`
* **Ruta de Archivo**: `src/lib/page-auth.ts`
* **Funciones y Simbolos Exportados**:
  - `exigirPerfilPagina`

#### 7.1.9 Modulo: `src/lib/scripts/limpiar_barra_y_busqueda.ts`
* **Ruta de Archivo**: `src/lib/scripts/limpiar_barra_y_busqueda.ts`
* **Funciones y Simbolos Exportados**:
  - Declaraciones de configuracion y tipos.

#### 7.1.10 Modulo: `src/lib/scripts/migrar_menu_tecnico.ts`
* **Ruta de Archivo**: `src/lib/scripts/migrar_menu_tecnico.ts`
* **Funciones y Simbolos Exportados**:
  - Declaraciones de configuracion y tipos.

#### 7.1.11 Modulo: `src/lib/security.ts`
* **Ruta de Archivo**: `src/lib/security.ts`
* **Funciones y Simbolos Exportados**:
  - `sanitizarTexto`
  - `sanitizarCorreo`
  - `generarCaptchaDesafio`
  - `verificarCaptcha`

#### 7.1.12 Modulo: `src/lib/sla.ts`
* **Ruta de Archivo**: `src/lib/sla.ts`
* **Funciones y Simbolos Exportados**:
  - `HORA_INICIO_JORNADA`
  - `HORA_FIN_JORNADA`
  - `HORAS_POR_JORNADA`
  - `esDiaHabil`
  - `ajustarAInicioHabil`
  - `calcularFechaLimiteHorasHabiles`

#### 7.1.13 Modulo: `src/lib/usuarios.ts`
* **Ruta de Archivo**: `src/lib/usuarios.ts`
* **Funciones y Simbolos Exportados**:
  - `asignarPerfilesAUsuario`

#### 7.1.14 Modulo: `src/lib/validaciones.ts`
* **Ruta de Archivo**: `src/lib/validaciones.ts`
* **Funciones y Simbolos Exportados**:
  - `validarDni`
  - `validarRuc`
  - `validarNombre`
  - `validarCorreo`
  - `validarCelular`
  - `validarCodigo`
  - `validarTexto`
  - `validarNumeroPositivo`
  - `validarFechaNoPasada`
  - `EXTENSIONES_PELIGROSAS`
  - `validarArchivoAdjunto`
  - `validarSlaTiempos`

### 7.2 Componentes React Reutilizables (`src/components/`)

#### 7.2.1 Componente: `src/components/BotonCerrarSesion.tsx`
* **Ubicacion**: `src/components/BotonCerrarSesion.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.2 Componente: `src/components/EnConstruccion.tsx`
* **Ubicacion**: `src/components/EnConstruccion.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.3 Componente: `src/components/itsm/ConfiguracionRfc.tsx`
* **Ubicacion**: `src/components/itsm/ConfiguracionRfc.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.4 Componente: `src/components/itsm/EventosWorkspace.tsx`
* **Ubicacion**: `src/components/itsm/EventosWorkspace.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.5 Componente: `src/components/itsm/ProblemasWorkspace.tsx`
* **Ubicacion**: `src/components/itsm/ProblemasWorkspace.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.6 Componente: `src/components/itsm/ProveedoresWorkspace.tsx`
* **Ubicacion**: `src/components/itsm/ProveedoresWorkspace.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.7 Componente: `src/components/itsm/ResilienciaWorkspace.tsx`
* **Ubicacion**: `src/components/itsm/ResilienciaWorkspace.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.8 Componente: `src/components/Menu.tsx`
* **Ubicacion**: `src/components/Menu.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.9 Componente: `src/components/ModalDetalleTicket.tsx`
* **Ubicacion**: `src/components/ModalDetalleTicket.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.10 Componente: `src/components/SelectorPerfilActivo.tsx`
* **Ubicacion**: `src/components/SelectorPerfilActivo.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.11 Componente: `src/components/TablaTickets.tsx`
* **Ubicacion**: `src/components/TablaTickets.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.12 Componente: `src/components/tecnico/BarraSuperiorTecnico.tsx`
* **Ubicacion**: `src/components/tecnico/BarraSuperiorTecnico.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.13 Componente: `src/components/ticket-detail/presentadores/VistaTicketAdministrador.tsx`
* **Ubicacion**: `src/components/ticket-detail/presentadores/VistaTicketAdministrador.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.14 Componente: `src/components/ticket-detail/presentadores/VistaTicketConsumidor.tsx`
* **Ubicacion**: `src/components/ticket-detail/presentadores/VistaTicketConsumidor.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.15 Componente: `src/components/ticket-detail/presentadores/VistaTicketGobernanza.tsx`
* **Ubicacion**: `src/components/ticket-detail/presentadores/VistaTicketGobernanza.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.16 Componente: `src/components/ticket-detail/presentadores/VistaTicketOperador.tsx`
* **Ubicacion**: `src/components/ticket-detail/presentadores/VistaTicketOperador.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.17 Componente: `src/components/ticket-detail/presentadores/VistaTicketSupervisor.tsx`
* **Ubicacion**: `src/components/ticket-detail/presentadores/VistaTicketSupervisor.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.18 Componente: `src/components/ticket-detail/secciones/BarraAccionesOperativas.tsx`
* **Ubicacion**: `src/components/ticket-detail/secciones/BarraAccionesOperativas.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.19 Componente: `src/components/ticket-detail/secciones/CockpitTemporizadorSla.tsx`
* **Ubicacion**: `src/components/ticket-detail/secciones/CockpitTemporizadorSla.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.20 Componente: `src/components/ticket-detail/secciones/ControlesDespacho.tsx`
* **Ubicacion**: `src/components/ticket-detail/secciones/ControlesDespacho.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.21 Componente: `src/components/ticket-detail/secciones/PanelInfraestructuraCi.tsx`
* **Ubicacion**: `src/components/ticket-detail/secciones/PanelInfraestructuraCi.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.22 Componente: `src/components/ticket-detail/secciones/StepperProgresoConsumidor.tsx`
* **Ubicacion**: `src/components/ticket-detail/secciones/StepperProgresoConsumidor.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.23 Componente: `src/components/ticket-detail/secciones/StreamChatPublico.tsx`
* **Ubicacion**: `src/components/ticket-detail/secciones/StreamChatPublico.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.24 Componente: `src/components/ticket-detail/secciones/StreamNotasInternas.tsx`
* **Ubicacion**: `src/components/ticket-detail/secciones/StreamNotasInternas.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.25 Componente: `src/components/ticket-detail/secciones/TarjetaAprobacionSod.tsx`
* **Ubicacion**: `src/components/ticket-detail/secciones/TarjetaAprobacionSod.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.26 Componente: `src/components/ticket-detail/secciones/TarjetaCalificacionCsat.tsx`
* **Ubicacion**: `src/components/ticket-detail/secciones/TarjetaCalificacionCsat.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.27 Componente: `src/components/ticket-detail/tipos.ts`
* **Ubicacion**: `src/components/ticket-detail/tipos.ts`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

#### 7.2.28 Componente: `src/components/ui/AlertaCampo.tsx`
* **Ubicacion**: `src/components/ui/AlertaCampo.tsx`
* **Descripcion Tecnica**: Componente modular React disenado bajo el principio de responsabilidad unica y desacoplamiento visual.

## CAPITULO 8: MODELOS DE DOMINIO Y TIPOS TYPESCRIPT (`src/types/index.ts`)

El archivo `src/types/index.ts` centraliza todos los contratos de interfaz del sistema, asegurando que el backend, las APIs y el frontend hablen exactamente el mismo lenguaje.

### 8.1 Interfaz: `Usuario`
```typescript
export interface Usuario {
  id_usuario: number;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  celular: string | null;
  correo_personal?: string | null;
  correo_electronico: string;
  id_departamento?: number | null;
  departamento_nombre?: string | null;
  id_departamento_empresa?: number | null;
  departamento_empresa_nombre?: string | null;
  estado_registro: boolean;
  intentos_fallidos?: number;
  cuenta_bloqueada?: boolean;
  nivel_prioridad?: number;
}
```

### 8.2 Interfaz: `UsuarioConPerfiles`
```typescript
export interface UsuarioConPerfiles extends Usuario {
  perfiles: { id_perfil: number; nombre: string }
```

### 8.3 Interfaz: `Perfil`
```typescript
export interface Perfil {
  id_perfil: number;
  nombre: string;
  descripcion: string | null;
  estado_registro: boolean;
}
```

### 8.4 Interfaz: `PerfilConOpciones`
```typescript
export interface PerfilConOpciones extends Perfil {
  opciones_ids: number[];
  cantidad_usuarios?: number;
  total_usuarios?: number;
}
```

### 8.5 Interfaz: `OpcionMenuPlana`
```typescript
export interface OpcionMenuPlana {
  id_opcion_menu: number;
  nombre: string;
  url_menu: string;
  descripcion: string | null;
  id_padre: number | null;
  nivel: number;
  orden: number;
  contador_clave?: string | null;
  bloqueado?: boolean;
  abierto_por_defecto?: boolean;
}
```

### 8.6 Interfaz: `OpcionMenuArbol`
```typescript
export interface OpcionMenuArbol extends OpcionMenuPlana {
  hijos: OpcionMenuArbol[];
}
```

### 8.7 Interfaz: `OpcionMenuAdmin`
```typescript
export interface OpcionMenuAdmin extends OpcionMenuPlana {
  nombre_padre: string | null;
  perfiles_ids: number[];
  estado_registro: boolean;
}
```

### 8.8 Interfaz: `PerfilBasico`
```typescript
export interface PerfilBasico {
  id_perfil: number;
  nombre: string;
}
```

### 8.9 Interfaz: `SesionUsuario`
```typescript
export interface SesionUsuario {
  id_usuario: number;
  nombres: string;
  correo_electronico: string;
  perfiles: PerfilBasico[];
  perfilActivo: PerfilBasico;
}
```

### 8.10 Interfaz: `TipoTicket`
```typescript
export interface TipoTicket {
  id_tipo_ticket: number;
  codigo: "INCIDENTE" | "SOLICITUD";
  nombre: string;
  descripcion: string;
  prefijo_codigo: string;
  estado_registro: boolean;
}
```

### 8.11 Interfaz: `ImpactoTicket`
```typescript
export interface ImpactoTicket {
  id_impacto: number;
  nivel: 1 | 2 | 3;
  nombre: string;
  descripcion: string;
  estado_registro: boolean;
}
```

### 8.12 Interfaz: `UrgenciaTicket`
```typescript
export interface UrgenciaTicket {
  id_urgencia: number;
  nivel: 1 | 2 | 3;
  nombre: string;
  descripcion: string;
  estado_registro: boolean;
}
```

### 8.13 Interfaz: `PrioridadTicket`
```typescript
export interface PrioridadTicket {
  id_prioridad: number;
  codigo: "P1" | "P2" | "P3" | "P4";
  nombre: string;
  nivel: number;
  tiempo_resolucion_horas: number;
  tiempo_primera_respuesta_hrs: number;
  color: string;
  estado_registro: boolean;
}
```

### 8.14 Interfaz: `EstadoTicket`
```typescript
export interface EstadoTicket {
  id_estado: number;
  codigo: "ABIERTO" | "ASIGNADO" | "EN_PROCESO" | "EN_ESPERA" | "RESUELTO" | "CERRADO" | "CANCELADO";
  nombre: string;
  orden: number;
  es_terminal: boolean;
  pausa_sla: boolean;
  color: string;
  estado_registro: boolean;
}
```

### 8.15 Interfaz: `MotivoEsperaTicket`
```typescript
export interface MotivoEsperaTicket {
  id_motivo_espera: number;
  nombre: string;
  descripcion: string;
  estado_registro: boolean;
}
```

### 8.16 Interfaz: `CategoriaTicket`
```typescript
export interface CategoriaTicket {
  id_categoria: number;
  id_tipo_ticket: number | null;
  nombre: string;
  codigo_corto?: string;
  sla_default_respuesta?: number;
  sla_default_resolucion?: number;
  descripcion: string | null;
  estado_registro: boolean;
}
```

### 8.17 Interfaz: `ServicioWorkflowPaso`
```typescript
export interface ServicioWorkflowPaso {
  id_paso: number;
  id_servicio: number;
  orden: number;
  codigo_paso: string;
  nombre_paso: string;
  rol_ejecutor: string;
  es_compuerta_aprobacion: boolean;
  pausa_sla: boolean;
  estado_registro: boolean;
}
```

### 8.18 Interfaz: `ServicioCatalogo`
```typescript
export interface ServicioCatalogo {
  id_servicio: number;
  codigo_servicio: string;
  id_tipo_ticket: number;
  tipo_nombre?: string;
  tipo_codigo?: string;
  id_categoria: number;
  categoria_nombre?: string;
  nombre: string;
  descripcion_comercial: string;
  entregable: string;
  requiere_aprobacion: boolean;
  sla_horas_resolucion: number;
  sla_horas_respuesta: number;
  costo_referencial: number;
  icono?: string;
  estado_registro: boolean;
  motivo_inactivacion?: string | null;
  fecha_inactivacion?: string | null;
  usuario_inactivacion?: number | null;
  usuario_inactivacion_nombre?: string | null;
  pasos?: ServicioWorkflowPaso[];
  perfiles_habilitados?: number[];
  esquema_formulario?: CampoFormularioServicio[];
  id_departamento_resolutor?: number | null;
  reglas_escalamiento?: ReglaEscalamientoServicio[];
}
```

### 8.19 Interfaz: `CampoFormularioServicio`
```typescript
export interface CampoFormularioServicio {
  clave: string;
  etiqueta: string;
  tipo: "texto" | "area" | "numero" | "fecha" | "correo" | "lista" | "casilla";
  obligatorio: boolean;
  opciones?: string[];
  ayuda?: string;
}
```

### 8.20 Interfaz: `ReglaEscalamientoServicio`
```typescript
export interface ReglaEscalamientoServicio {
  despues_horas: number;
  id_departamento: number;
}
```

### 8.21 Interfaz: `Ticket`
```typescript
export interface Ticket {
  id_ticket: number;
  codigo_ticket: string;
  titulo: string;
  descripcion: string;
  id_tipo_ticket: number;
  tipo_nombre?: string;
  tipo_codigo?: string;
  id_categoria: number;
  categoria_nombre?: string;
  id_servicio: number | null;
  servicio_nombre?: string | null;
  servicio_codigo?: string | null;
  id_departamento: number | null;
  id_departamento_empresa?: number | null;
  departamento_nombre?: string | null;
  departamento_empresa_nombre?: string | null;
  departamento_codigo?: string | null;
  canal_comunicacion: "PORTAL_WEB" | "CORREO_ELECTRONICO" | "LLAMADA_TELEFONICA" | "CHAT_EN_VIVO" | "SISTEMA_MONITOREO_AUTOMATICO";
  estado_aprobacion: "NO_APLICA" | "PENDIENTE_APROBACION" | "APROBADO" | "RECHAZADO";
  id_paso_actual: number | null;
  paso_actual_nombre?: string | null;
  categoria_resolucion?: string | null;
  calificacion_csat?: number | null;
  comentario_csat?: string | null;
  fecha_csat?: string | null;
  tiempo_pausado_minutos?: number;
  fecha_ultima_pausa?: string | null;
  id_impacto: number;
  impacto_nombre?: string;
  impacto_nivel?: number;
  id_urgencia: number;
  urgencia_nombre?: string;
  urgencia_nivel?: number;
  id_prioridad: number;
  prioridad_codigo?: string;
  prioridad_nombre?: string;
  prioridad_color?: string;
  tiempo_resolucion_horas?: number;
  id_estado: number;
  estado_codigo?: string;
  estado_nombre?: string;
  estado_color?: string;
  pausa_sla?: boolean;
  es_terminal?: boolean;
  id_motivo_espera: number | null;
  motivo_espera_nombre?: string | null;
  id_usuario_solicitante: number;
  solicitante_nombre?: string;
  solicitante_correo?: string;
  id_usuario_asignado: number | null;
  tecnico_nombre?: string | null;
  tecnico_correo?: string | null;
  solucion_aplicada: string | null;
  motivo_cancelacion: string | null;
  fecha_limite_sla: string;
  fecha_limite_respuesta_sla?: string | null;
  fecha_primera_respuesta: string | null;
  fecha_resolucion: string | null;
  fecha_cierre: string | null;
  sla_cumplido: boolean | null;
  minutos_restantes_sla?: number;
  sla_vencido?: boolean;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  campos_adicionales?: Record<string, any> | null;
  adjuntos?: AdjuntoTicket[];
  comentarios_cantidad?: number;
  aprobaciones?: TicketAprobacion[];
  id_problema?: number | null;
  problema_codigo?: string | null;
  problema_titulo?: string | null;
  id_ci?: number | null;
  ci_codigo?: string | null;
  ci_nombre?: string | null;
  fecha_reapertura?: string | null;
  motivo_reapertura?: string | null;
  conteo_reaperturas?: number;
  es_incidente_mayor?: boolean | null;
}
```

### 8.22 Interfaz: `AdjuntoTicket`
```typescript
export interface AdjuntoTicket {
  id_adjunto: number;
  id_ticket: number;
  nombre_archivo: string;
  tipo_mime: string;
  tamano_bytes: number;
  datos_base64?: string;
  id_usuario_subio: number;
  usuario_nombre?: string;
  fecha_creacion: string;
}
```

### 8.23 Interfaz: `TicketAprobacion`
```typescript
export interface TicketAprobacion {
  id_ticket_aprobacion: number;
  id_ticket: number;
  id_usuario_aprobador: number;
  aprobador_nombre?: string;
  aprobador_correo?: string;
  id_paso_workflow?: number | null;
  estado_decision: "APROBADO" | "RECHAZADO" | "OBSERVADO";
  comentario: string | null;
  fecha_decision: string;
  estado_registro: boolean;
}
```

### 8.24 Interfaz: `ComentarioTicket`
```typescript
export interface ComentarioTicket {
  id_comentario: number;
  id_ticket: number;
  id_usuario: number;
  usuario_nombre?: string;
  usuario_correo?: string;
  autor_nombre?: string;
  autor_perfil?: string;
  comentario: string;
  es_interno: boolean;
  id_estado_cambiado: number | null;
  estado_nombre?: string | null;
  fecha_creacion: string;
  estado_registro: boolean;
}
```

### 8.25 Interfaz: `CatalogosTickets`
```typescript
export interface CatalogosTickets {
  tipos: TipoTicket[];
  impactos: ImpactoTicket[];
  urgencias: UrgenciaTicket[];
  prioridades: PrioridadTicket[];
  estados: EstadoTicket[];
  motivosEspera: MotivoEsperaTicket[];
  categorias: CategoriaTicket[];
  tecnicos: {
    id_usuario: number;
    nombre: string;
    correo: string;
    id_departamento?: number;
    departamento_nombre?: string;
    nivel_soporte?: number;
    estado_operativo?: string;
    capacidad_maxima_tickets?: number;
    tickets_activos?: number;
  }
```

### 8.26 Interfaz: `DepartamentoTI`
```typescript
export interface DepartamentoTI {
  id_departamento: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  id_supervisor: number | null;
  supervisor_nombre?: string | null;
  supervisor_correo?: string | null;
  cantidad_tecnicos?: number;
  total_tecnicos?: number;
  tiempo_ola_horas?: number;
  tiempo_ola_critico_hrs?: number;
  estado_registro: boolean;
}
```

### 8.27 Interfaz: `AcuerdoNivelOperativo`
```typescript
export interface AcuerdoNivelOperativo {
  id_ola: number;
  id_departamento: number;
  codigo_acuerdo: string;
  nombre_acuerdo: string;
  tipo_compromiso: string;
  tiempo_maximo_horas: number;
  tiempo_alerta_horas: number;
  descripcion: string | null;
  estado_registro: boolean;
}
```

### 8.28 Interfaz: `TecnicoDetalle`
```typescript
export interface TecnicoDetalle {
  id_tecnico_detalle: number;
  id_usuario: number;
  id_departamento: number;
  departamento_nombre?: string;
  departamento_codigo?: string;
  nivel_soporte: 1 | 2 | 3;
  capacidad_maxima_tickets: number;
  estado_operativo: "DISPONIBLE" | "EN_ATENCION" | "EN_GUARDIA" | "EN_RECESO" | "VACACIONES";
  especialidad_principal: string | null;
  estado_registro: boolean;
}
```

### 8.29 Interfaz: `TecnicoConCarga`
```typescript
export interface TecnicoConCarga extends TecnicoDetalle {
  nombre_completo: string;
  nombres: string;
  apellido_paterno: string;
  correo_electronico: string;
  celular: string | null;
  tickets_activos: number;
  tickets_resueltos: number;
  tickets_criticos: number;
  tickets_sla_vencido: number;
  porcentaje_ocupacion: number;
}
```

### 8.30 Interfaz: `CrearTicketPayload`
```typescript
export interface CrearTicketPayload {
  titulo: string;
  descripcion: string;
  id_tipo_ticket: number;
  id_categoria: number;
  id_servicio?: number | null;
  id_departamento?: number | null;
  canal_comunicacion?: "PORTAL_WEB" | "CORREO_ELECTRONICO" | "LLAMADA_TELEFONICA" | "CHAT_EN_VIVO" | "SISTEMA_MONITOREO_AUTOMATICO";
  id_impacto: number;
  id_urgencia: number;
  id_usuario_solicitante?: number | null;
  autoasignar_tecnico?: boolean;
  campos_adicionales?: Record<string, any>;
  archivos?: {
    nombre: string;
    tipo: string;
    tamano: number;
    base64: string;
  }
```

### 8.31 Interfaz: `ActualizarTicketPayload`
```typescript
export interface ActualizarTicketPayload {
  id_estado?: number;
  id_usuario_asignado?: number | null;
  id_departamento?: number | null;
  id_paso_actual?: number | null;
  id_motivo_espera?: number | null;
  solucion_aplicada?: string;
  categoria_resolucion?: string;
  motivo_cancelacion?: string;
  nota_cambio?: string;
  es_nota_interna?: boolean;
  decision_aprobacion?: "APROBADO" | "RECHAZADO";
  comentario_aprobacion?: string;
  calificacion_csat?: number;
  comentario_csat?: string;
  motivo_reapertura?: string;
  es_reapertura?: boolean;
  id_problema?: number | null;
  id_ci?: number | null;
}
```

### 8.32 Interfaz: `Activo`
```typescript
export interface Activo {
  id_activo: number;
  codigo_patrimonial: string;
  numero_serie?: string | null;
  tipo_activo: "LAPTOP" | "DESKTOP" | "SERVIDOR" | "SWITCH" | "IMPRESORA" | "ROUTER" | string;
  marca: string;
  modelo: string;
  id_departamento?: number | null;
  departamento_nombre?: string | null;
  id_usuario_custodio?: number | null;
  custodio_nombre?: string | null;
  estado_activo: "EN_OPERACION" | "EN_STOCK" | "MANTENIMIENTO" | "BAJA";
  fecha_adquisicion?: string | null;
  fecha_fin_garantia?: string | null;
  costo_compra?: number | null;
  fecha_creacion: string;
  estado_registro?: boolean;
  motivo_inactivacion?: string | null;
  fecha_inactivacion?: string | null;
  usuario_inactivacion?: number | null;
}
```

### 8.33 Interfaz: `ElementoConfiguracion`
```typescript
export interface ElementoConfiguracion {
  id_ci: number;
  id_activo?: number | null;
  activo_codigo?: string | null;
  codigo_ci: string;
  nombre: string;
  tipo_ci: "SERVICIO_TI" | "SERVIDOR_LOGICO" | "APLICACION" | "BASE_DATOS" | "NODO_RED" | string;
  ambiente: "PRODUCCION" | "QA" | "DESARROLLO";
  ip_principal?: string | null;
  version_software?: string | null;
  criticidad: "CRITICA" | "ALTA" | "MEDIA" | "BAJA";
  id_departamento_soporte?: number | null;
  departamento_soporte_nombre?: string | null;
  relaciones_padre?: CIRelacion[];
  relaciones_hijo?: CIRelacion[];
  fecha_creacion: string;
  estado_registro?: boolean;
  motivo_inactivacion?: string | null;
  fecha_inactivacion?: string | null;
  usuario_inactivacion?: number | null;
  usuario_inactivacion_nombre?: string | null;
}
```

### 8.34 Interfaz: `CIRelacion`
```typescript
export interface CIRelacion {
  id_ci_padre: number;
  padre_codigo?: string;
  padre_nombre?: string;
  id_ci_hijo: number;
  hijo_codigo?: string;
  hijo_nombre?: string;
  tipo_relacion: "DEPENDE_DE" | "ALBERGA_A" | "CONECTADO_CON";
}
```

### 8.35 Interfaz: `LicenciaSoftware`
```typescript
export interface LicenciaSoftware {
  id_licencia: number;
  nombre_software: string;
  fabricante: string;
  clave_licencia?: string | null;
  tipo_licencia: "PERPETUA" | "SUSCRIPCION_ANUAL" | "POR_VOLUMEN" | "OEM" | string;
  cantidad_adquirida: number;
  cantidad_en_uso: number;
  fecha_vencimiento?: string | null;
  costo_anual?: number | null;
}
```

### 8.36 Interfaz: `Problema`
```typescript
export interface Problema {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  id_impacto: number;
  impacto_nombre?: string;
  id_urgencia: number;
  urgencia_nombre?: string;
  id_prioridad: number;
  prioridad_nombre?: string;
  id_estado: number; // 1: Registrado, 2: En Investigacion, 3: Causa Raiz Identificada, 4: Error Conocido, 5: Resuelto, 6: Cerrado
  estado_nombre?: string;
  causa_raiz?: string | null;
  metodo_analisis: "5_WHYS" | "ISHIKAWA" | "ARBOL_FALLAS" | "PRUEBAS_AISLAMIENTO" | string;
  workaround?: string | null;
  es_error_conocido: boolean;
  id_ci_afectado?: number | null;
  ci_codigo?: string | null;
  ci_nombre?: string | null;
  id_usuario_asignado?: number | null;
  tecnico_asignado_nombre?: string | null;
  id_departamento?: number | null;
  departamento_nombre?: string | null;
  solucion_definitiva?: string | null;
  incidentes_asociados?: { id_ticket: number; codigo_ticket: string; titulo: string }
```

### 8.37 Interfaz: `ErrorConocido`
```typescript
export interface ErrorConocido {
  id_error_conocido: number;
  id_problema: number;
  codigo_kedb: string;
  titulo: string;
  sintomas: string;
  workaround: string;
  solucion_definitiva?: string | null;
  fecha_publicacion: string;
}
```

### 8.38 Interfaz: `Cambio`
```typescript
export interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  descripcion: string;
  tipo_cambio: "ESTANDAR" | "NORMAL" | "EMERGENCIA";
  id_impacto: number;
  impacto_nombre?: string;
  id_urgencia: number;
  urgencia_nombre?: string;
  id_prioridad: number;
  prioridad_nombre?: string;
  id_estado: number; // 1: Registrado, 2: Evaluacion CAB, 3: Aprobado, 4: En Planificacion, 5: En Ejecucion, 6: Exitoso, 7: Fallido, 8: Cancelado
  estado_nombre?: string;
  justificacion: string;
  plan_implementacion: string;
  plan_rollback: string;
  plan_pruebas?: string | null;
  ventana_inicio: string;
  ventana_fin: string;
  id_ci_afectado?: number | null;
  ci_codigo?: string | null;
  ci_nombre?: string | null;
  id_problema_origen?: number | null;
  problema_codigo?: string | null;
  codigo_problema?: string | null;
  id_incidente_origen?: number | null;
  incidente_codigo?: string | null;
  id_usuario_solicitante: number;
  solicitante_nombre?: string;
  solicitante_email?: string;
  id_usuario_responsable?: number | null;
  responsable_nombre?: string | null;
  resultado_pir?: string | null;
  incidentes_inducidos: number;
  aprobaciones?: CambioAprobacion[];
  fecha_creacion: string;
}
```

### 8.39 Interfaz: `CambioAprobacion`
```typescript
export interface CambioAprobacion {
  id_cambio_aprobacion: number;
  id_cambio: number;
  id_usuario_aprobador: number;
  aprobador_nombre?: string;
  decision: "APROBADO" | "RECHAZADO" | "OBSERVADO";
  comentario: string;
  fecha_decision: string;
}
```

### 8.40 Interfaz: `ArticuloConocimiento`
```typescript
export interface ArticuloConocimiento {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  contenido_markdown: string;
  id_categoria?: number | null;
  categoria_nombre?: string | null;
  id_problema_origen?: number | null;
  estado_editorial: "BORRADOR" | "EN_REVISION" | "PUBLICADO" | "ARCHIVADO";
  id_autor: number;
  autor_nombre?: string;
  id_revisor?: number | null;
  revisor_nombre?: string | null;
  visitas: number;
  utilidad_positiva: number;
  utilidad_negativa: number;
  fecha_publicacion?: string | null;
  fecha_creacion: string;
}
```

## CAPITULO 9: ARQUITECTURA DE VALIDACIONES Y MOTOR DE EXPERIENCIA DE USUARIO (UX)

### 9.1 Funciones de Validacion Pura (`src/lib/validaciones.ts`)
Todas las validaciones estan desacopladas en funciones puras reutilizables:
1. `validarDni(dni: string)`: Verifica longitud de exactamente 8 digitos numericos.
2. `validarRuc(ruc: string, obligatorio?: boolean)`: Verifica longitud de exactamente 11 digitos numericos.
3. `validarNombre(valor: string, campo?: string)`: Valida nombres permitiendo acentos y caracteres internacionales pero prohibiendo digitos o simbolos extranos.
4. `validarCorreo(correo: string)`: Valida estructura RFC 5322.
5. `validarCodigo(codigo: string, min?: number, max?: number)`: Exige formato en mayusculas sin espacios.
6. `validarTexto(texto: string, min: number, max: number, campo: string)`: Control estricto de limites de caracteres.
7. `validarNumeroPositivo(valor: any, campo: string, min?: number, max?: number)`: Valida numeros mayores a cero.
8. `validarSlaTiempos(respuestaHoras: number, resolucionHoras: number)`: Valida que la respuesta sea estrictamente menor a la resolucion.
9. `validarArchivoAdjunto(nombre: string, bytes: number, maxMb?: number)`: Bloquea extensiones ejecutables o de script.

### 9.2 Directivas Obligatorias de UX en Formularios
* **Prohibicion de Mensajes Verdes**: No se incluyen mensajes de exito debajo de los campos de entrada.
* **Bordes y Fondos de Error**: Se aplican dinamicamente `borderColor: "#ef4444"` y `backgroundColor: "#fef2f2"`.
* **Alerta Unificada**: Se muestra `<AlertaCampo error={...} />` debajo de cada campo con error.
* **Busqueda de Usuarios**: Requiere al menos 2 letras ingresadas para desplegar resultados.
* **Vistas Previas**: Botones de accion inhabilitados en modales de previsualizacion.

## CAPITULO 10: MATRIZ MAESTRA DE PRIVILEGIOS Y CONTROL DE ACCESO RBAC

| Entidad del Sistema | Administrador (1) | Tecnico (2) | Solicitante (3) | Supervisor (4) | Auditor (5) |
|:---|:---:|:---:|:---:|:---:|:---:|
| Tickets de Incidentes | CRUD Total | Atender / Resolver | Crear / Consultar Mios | Reasignar / Escalar | Solo Lectura |
| Solicitudes de Servicio | CRUD Total | Atender / Entregar | Solicitar / Consultar Mios | Aprobar / Reasignar | Solo Lectura |
| Catalogo de Servicios | CRUD Total | Consultar | Consultar | Consultar | Solo Lectura |
| Categorias de Tickets | CRUD Total | Consultar | Consultar | Consultar | Solo Lectura |
| Gestion de Problemas | CRUD Total | Investigar / Documentar | Sin Acceso | Supervisar / Cerrar | Solo Lectura |
| Base de Errores (KEDB) | CRUD Total | Registrar / Consultar | Consultar Soluciones | Validar / Publicar | Solo Lectura |
| Cambios (RFC) | CRUD Total | Solicitar / Ejecutar | Sin Acceso | Evaluar en CAB / Aprobar | Solo Lectura |
| CMDB y Activos | CRUD Total | Actualizar Estado | Sin Acceso | Consultar Criticidad | Solo Lectura |
| Base de Conocimiento | CRUD Total | Crear / Publicar | Consultar Publicos | Aprobar Revision | Solo Lectura |
| Usuarios y Seguridad | CRUD Total | Sin Acceso | Sin Acceso | Sin Acceso | Solo Lectura |
| Auditoria e Historial | CRUD Total | Consultar Propio | Sin Acceso | Consultar Area | Auditoria Integral |

## CAPITULO 11: COMPENDIO DE REGLAS DE NEGOCIO Y ESTANDARES DE DESARROLLO

### 11.1 Regla `RN-01`: Coherencia Temporal de SLAs (ITIL v4)
* **Identificador**: `RN-01`
* **Enunciado**: En toda categoria, servicio o ticket, el tiempo de primera respuesta (sla_default_respuesta) debe ser estrictamente menor al tiempo de resolucion total (sla_default_resolucion). Es una violacion metodologica pretender resolver un caso antes de que exista contacto inicial.

### 11.2 Regla `RN-02`: SLA por Defecto en Ausencia de Servicio
* **Identificador**: `RN-02`
* **Enunciado**: Si el solicitante no elige un servicio del catalogo corporativo, el ticket adquiere de manera automatica los SLAs base de la categoria seleccionada o calcula los tiempos en base a la matriz de prioridad Urgencia vs Impacto.

### 11.3 Regla `RN-03`: Unicidad de Categorias en Tiempo Real
* **Identificador**: `RN-03`
* **Enunciado**: No se permite duplicar el nombre ni el codigo corto mnemonico de una categoria dentro del mismo tipo de ticket (Incidente o Solicitud). Esta validacion se evalua reactivamente en memoria mientras el usuario escribe y se ratifica en el servidor con HTTP 409 Conflict.

### 11.4 Regla `RN-04`: Directiva Estricta de Cero Emojis
* **Identificador**: `RN-04`
* **Enunciado**: Queda terminantemente prohibido incorporar emojis en mensajes, titulos, componentes, botones, correos o logs del sistema. Toda iconografia debe resolverse exclusivamente mediante trazados SVG vectoriales formales.

### 11.5 Regla `RN-05`: Prohibicion de Alertas Verdes de Exito en Formularios
* **Identificador**: `RN-05`
* **Enunciado**: Durante la interaccion con formularios, los campos con datos validos deben permanecer en su estado neutro limpio. No se proyectan banners o textos verdes tipo "Nombre correcto". El color rojo y los avisos se reservan exclusivamente para senalar errores de validacion.

### 11.6 Regla `RN-06`: Estilo Visual Dinamico de Error
* **Identificador**: `RN-06`
* **Enunciado**: Todo campo con error debe recibir inmediatamente un borde rojo (#ef4444) y un fondo rojo suave (#fef2f2), acompanado del componente formal <AlertaCampo error={...} />.

### 11.7 Regla `RN-07`: Busqueda de Usuarios con Minimo 2 Caracteres
* **Identificador**: `RN-07`
* **Enunciado**: En los selectores para registrar tickets a nombre de otros colaboradores, la lista desplegable de coincidencias no debe activarse vacia. Exige al menos 2 caracteres ingresados antes de consultar a la API o mostrar resultados.

### 11.8 Regla `RN-08`: Inhabilitacion de Acciones en Vistas Previas
* **Identificador**: `RN-08`
* **Enunciado**: Los botones de ejecucion operativa (Guardar, Resolver, Asignar) dentro de modales o pantallas catalogadas como Vista Previa deben estar desactivados (disabled) para evitar ejecuciones accidentales.

### 11.9 Regla `RN-09`: Segregacion de Funciones en Aprobaciones (SoD)
* **Identificador**: `RN-09`
* **Enunciado**: El usuario que somete una Solicitud de Cambio (RFC) o un requerimiento que requiera autorizacion no puede ser el unico aprobador de dicho caso, garantizando controles de seguridad ISO 27001.

### 11.10 Regla `RN-10`: Restriccion de Dominio de Correo en Login
* **Identificador**: `RN-10`
* **Enunciado**: El acceso al sistema solo esta permitido a direcciones de correo electronico pertenecientes al dominio corporativo institucional, con la excepcion unica programada del superusuario apazamiguel88@gmail.com.

### 11.11 Regla `RN-11`: Bloqueo Preventivo por Intentos Fallidos
* **Identificador**: `RN-11`
* **Enunciado**: Cinco intentos fallidos consecutivos de contrasena en el login bloquean de inmediato la cuenta (cuenta_bloqueada = true), requiriendo desbloqueo por el Administrador o token OTP.

### 11.12 Regla `RN-12`: Inmutabilidad del Historial de Auditoria
* **Identificador**: `RN-12`
* **Enunciado**: Las entradas en ticket_historial son de solo insercion (Append-Only). No existen endpoints ni funciones en la aplicacion que permitan actualizar o eliminar trazas de auditoria.

### 11.13 Regla `RN-13`: Proteccion contra Adjuntos Peligrosos
* **Identificador**: `RN-13`
* **Enunciado**: El sistema bloquea la carga de archivos con extensiones ejecutables o de script (.exe, .bat, .cmd, .sh, .ps1, .vbs, .js, .scr, .jar, etc.) y limita el peso maximo a 5 MB por archivo.

### 11.14 Regla `RN-14`: Sincronizacion Global del Catalogo
* **Identificador**: `RN-14`
* **Enunciado**: Cualquier alta, edicion o baja de categoria o servicio se refleja de forma inmediata tanto en los botones del portal de autoservicio como en los selectores desplegables de creacion de tickets de la mesa de ayuda.

## CAPITULO 12: MANUAL DE INSTALACION, CONFIGURACION Y DESPLIEGUE

### 12.1 Preparacion del Entorno
1. Instalar Node.js 18.18+ o Node.js 20 LTS.
2. Instalar PostgreSQL 14+ o crear un proyecto en Supabase Cloud.
3. Disponer de credenciales de Git con acceso al repositorio.

### 12.2 Procedimiento de Despliegue Local
```bash
# 1. Clonar el repositorio
git clone https://github.com/Azure-2312/FlowDesk-Software-ITSM.git
cd FlowDesk-Software-ITSM

# 2. Instalar dependencias del proyecto
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales de base de datos de PostgreSQL/Supabase

# 4. Validar integridad de tipos de TypeScript
npx tsc --noEmit

# 5. Iniciar servidor de desarrollo
npm run dev
```

### 12.3 Resolucion de Errores Comunes de Operacion
* **Error de Tenant no Encontrado en Supabase (`(ENOTFOUND) tenant/user postgres.* not found`)**:
  Ocurre cuando un proyecto gratuito de Supabase entra en pausa por 7 dias de inactividad. Se resuelve ingresando a la consola web de Supabase y presionando el boton "Restore project".
* **Error de Concurrencia en Conexiones**:
  Asegurarse de utilizar la cadena de conexion con el puerto 6543 (Connection Pooler en modo Transaction) si se trabaja con múltiples instancias de Next.js.

## CAPITULO 13: GUIA DE CONTEXTO PARA MODELOS DE INTELIGENCIA ARTIFICIAL

Si eres un agente de inteligencia artificial o desarrollador que continue evolucionando esta base de codigo, debes cumplir sin excepcion las siguientes directivas:
1. **Nunca incluyas emojis**: Queda estrictamente vetado el uso de emojis en respuestas, comentarios, cadenas de texto o documentacion.
2. **Nunca agregues alertas verdes en formularios**: Los campos validos permanecen neutros.
3. **Cumple la regla de SLA ITIL v4**: Todo tiempo de primera respuesta debe ser menor al de resolucion.
4. **Verifica la compilacion tras cada cambio**: Ejecuta `npx tsc --noEmit` para garantizar cero fallos de TypeScript.
5. **Respeta las migraciones de base de datos**: Toda modificacion de DDL debe quedar registrada en `db/migrations/`.

---
*Documento tecnico maestro de FlowDesk Software ITSM compilado exitosamente.*