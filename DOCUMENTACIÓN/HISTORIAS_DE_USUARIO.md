# Historias de Usuario — FlowDesk ITSM

> **Versión:** 5.0 (Reestructuración Ágil Colaborativa) · **Fecha:** 2026-10-27  
> **Metodología:** Scrum / ITIL v4 · **Modalidad:** Trabajo en Equipo Multidisciplinario (Swarming)  
> **Equipo Scrum:**
> - **Junior:** Arquitectura de Datos y Persistencia (PostgreSQL / Migraciones)
> - **Nain:** Lógica de Negocio y Servicios API (TypeScript / REST / Validaciones)
> - **Lourdes:** Interfaz de Usuario y Experiencia (React / Next.js / Formularios)
> - **Alexis:** Control de Calidad y Criterios de Aceptación (QA / Testing / Gherkin)
> - **Miguel:** Seguridad RBAC, Integración de Menú y Tech Lead (Git / Trazabilidad)

---

## 1. Lineamientos Metodológicos y Reglas de Calidad

Siguiendo las directrices formales de evaluación académica y metodológica Scrum:
1. **Atomicidad estricta:** Ningún título contiene la conjunción copulativa "y" que denote funcionalidades divisibles. Las operaciones maestras de ciclo de vida se formulan como capacidades globales de negocio (*Gestión Integral de...* o *CRUD de...*).
2. **Sin microfuncionalidades:** No existen historias para botones o elementos aislados de interfaz.
3. **Lenguaje comprensible de negocio:** La redacción evita tecnicismos de bajo nivel (nombres de tablas, sentencias SQL o scripts) y se enfoca en el valor percibido por el rol de negocio.
4. **Criterios de Aceptación estándar (Gherkin):**
   - El contexto inicial **Dado que** formula obligatoriamente el rol: *`Dado que ingreso al sistema como [Rol específico de negocio]...`*.
   - Toda historia contiene un **mínimo de 2 escenarios** (camino feliz y control de excepciones o reglas de negocio).
5. **Alcance Progresivo:** Incluye tanto las capacidades actualmente construidas y validadas (`HECHO`) como las capacidades y mejoras pendientes planificadas para siguientes iteraciones (`PRODUCT BACKLOG`), reconociendo la naturaleza evolutiva del proyecto.

---

## 2. Índice General de Historias de Usuario por Fases

| ID | Título de la Historia de Usuario | Fase de Dominio | Estado en Backlog | Complejidad |
| :---: | :--- | :--- | :---: | :---: |
| **HU-01** | [Autenticación Segura de Usuarios](#hu-01-autenticación-segura-de-usuarios) | Fase 1: Seguridad y Cuentas | **HECHO** | Media (M) |
| **HU-02** | [Recuperación Autónoma de Contraseña](#hu-02-recuperación-autónoma-de-contraseña) | Fase 1: Seguridad y Cuentas | **HECHO** | Media (M) |
| **HU-03** | [Actualización de Perfil de Usuario](#hu-03-actualización-de-perfil-de-usuario) | Fase 1: Seguridad y Cuentas | **HECHO** | Baja (S) |
| **HU-04** | [Administración Centralizada de Cuentas de Usuario](#hu-04-administración-centralizada-de-cuentas-de-usuario) | Fase 1: Seguridad y Cuentas | **HECHO** | Alta (L) |
| **HU-05** | [Provisión Segura de Credenciales Temporales](#hu-05-provisión-segura-de-credenciales-temporales) | Fase 1: Seguridad y Cuentas | **HECHO** | Media (M) |
| **HU-06** | [Bloqueo Preventivo de Cuentas Comprometidas](#hu-06-bloqueo-preventivo-de-cuentas-comprometidas) | Fase 1: Seguridad y Cuentas | **PRODUCT BACKLOG** | Media (M) |
| **HU-07** | [Asignación de Perfiles RBAC Institucionales](#hu-07-asignación-de-perfiles-rbac-institucionales) | Fase 2: Gobernanza RBAC | **HECHO** | Media (M) |
| **HU-08** | [Navegación Segura según Matriz de Privilegios](#hu-08-navegación-segura-según-matriz-de-privilegios) | Fase 2: Gobernanza RBAC | **HECHO** | Alta (L) |
| **HU-09** | [Catálogo Maestro de Opciones de Menú](#hu-09-catálogo-maestro-de-opciones-de-menú) | Fase 2: Gobernanza RBAC | **HECHO** | Media (M) |
| **HU-10** | [Auditoría Forense de Sesiones de Usuario](#hu-10-auditoría-forense-de-sesiones-de-usuario) | Fase 2: Gobernanza RBAC | **PRODUCT BACKLOG** | Media (M) |
| **HU-11** | [Estructura de Departamentos Empresariales](#hu-11-estructura-de-departamentos-empresariales) | Fase 3: Organización TI | **HECHO** | Media (M) |
| **HU-12** | [Configuración de Grupos Resolutores de TI](#hu-12-configuración-de-grupos-resolutores-de-ti) | Fase 3: Organización TI | **HECHO** | Media (M) |
| **HU-13** | [Planificación de Turnos de Soporte Técnico](#hu-13-planificación-de-turnos-de-soporte-técnico) | Fase 3: Organización TI | **HECHO** | Media (M) |
| **HU-14** | [Control de Ausencias en Mesa de Ayuda](#hu-14-control-de-ausencias-en-mesa-de-ayuda) | Fase 3: Organización TI | **HECHO** | Media (M) |
| **HU-15** | [Balanceo Automático de Carga de Técnicos](#hu-15-balanceo-automático-de-carga-de-técnicos) | Fase 3: Organización TI | **PRODUCT BACKLOG** | Alta (L) |
| **HU-16** | [Clasificación de Categorías de Servicio](#hu-16-clasificación-de-categorías-de-servicio) | Fase 4: Catálogo y SLA | **HECHO** | Media (M) |
| **HU-17** | [Ficha Técnica de Servicios Corporativos](#hu-17-ficha-técnica-de-servicios-corporativos) | Fase 4: Catálogo y SLA | **HECHO** | Alta (L) |
| **HU-18** | [Parametrización de Acuerdos de Nivel de Servicio (SLA)](#hu-18-parametrización-de-acuerdos-de-nivel-de-servicio-sla) | Fase 4: Catálogo y SLA | **HECHO** | Alta (L) |
| **HU-19** | [Priorización ITIL según Matriz Impacto-Urgencia](#hu-19-priorización-itil-según-matriz-impacto-urgencia) | Fase 4: Catálogo y SLA | **HECHO** | Media (M) |
| **HU-20** | [Calendario Laboral de Feriados Corporativos](#hu-20-calendario-laboral-de-feriados-corporativos) | Fase 4: Catálogo y SLA | **PRODUCT BACKLOG** | Media (M) |
| **HU-21** | [Reporte Asistido de Incidente Operativo](#hu-21-reporte-asistido-de-incidente-operativo) | Fase 5: Incidentes y Mesa | **HECHO** | Alta (L) |
| **HU-22** | [Consola Técnica de Incidentes con Indicadores SLA](#hu-22-consola-técnica-de-incidentes-con-indicadores-sla) | Fase 5: Incidentes y Mesa | **HECHO** | Alta (L) |
| **HU-23** | [Autoasignación de Incidentes en Mesa](#hu-23-autoasignación-de-incidentes-en-mesa) | Fase 5: Incidentes y Mesa | **HECHO** | Media (M) |
| **HU-24** | [Bitácora Técnica de Comentarios Operativos](#hu-24-bitácora-técnica-de-comentarios-operativos) | Fase 5: Incidentes y Mesa | **HECHO** | Media (M) |
| **HU-25** | [Protocolo de Gestión de Incidentes Mayores P1](#hu-25-protocolo-de-gestión-de-incidentes-mayores-p1) | Fase 5: Incidentes y Mesa | **HECHO** | Alta (L) |
| **HU-26** | [Escalamiento Jerárquico por Incumplimiento de SLA](#hu-26-escalamiento-jerárquico-por-incumplimiento-de-sla) | Fase 5: Incidentes y Mesa | **PRODUCT BACKLOG** | Media (M) |
| **HU-27** | [Catálogo de Autoservicio de Solicitudes Institucionales](#hu-27-catálogo-de-autoservicio-de-solicitudes-institucionales) | Fase 6: Solicitudes de Servicio | **HECHO** | Media (M) |
| **HU-28** | [Captura de Solicitud con Justificación de Negocio](#hu-28-captura-de-solicitud-con-justificación-de-negocio) | Fase 6: Solicitudes de Servicio | **HECHO** | Alta (L) |
| **HU-29** | [Bandeja Jurisdiccional de Aprobaciones de Área](#hu-29-bandeja-jurisdiccional-de-aprobaciones-de-área) | Fase 6: Solicitudes de Servicio | **HECHO** | Media (M) |
| **HU-30** | [Blindaje de Segregación de Funciones en Aprobaciones](#hu-30-blindaje-de-segregación-de-funciones-en-aprobaciones) | Fase 6: Solicitudes de Servicio | **HECHO** | Media (M) |
| **HU-31** | [Delegación Temporal de Autoridad de Aprobación](#hu-31-delegación-temporal-de-autoridad-de-aprobación) | Fase 6: Solicitudes de Servicio | **PRODUCT BACKLOG** | Media (M) |
| **HU-32** | [Formalización de Expediente de Problema Operativo](#hu-32-formalización-de-expediente-de-problema-operativo) | Fase 7: Problemas y KEDB | **HECHO** | Alta (L) |
| **HU-33** | [Vinculación de Incidentes Recurrentes a un Problema](#hu-33-vinculación-de-incidentes-recurrentes-a-un-problema) | Fase 7: Problemas y KEDB | **HECHO** | Media (M) |
| **HU-34** | [Repositorio de Errores Conocidos (KEDB)](#hu-34-repositorio-de-errores-conocidos-kedb) | Fase 7: Problemas y KEDB | **HECHO** | Media (M) |
| **HU-35** | [Análisis Estructurado de Causa Raíz (RCA)](#hu-35-análisis-estructurado-de-causa-raíz-rca) | Fase 7: Problemas y KEDB | **PRODUCT BACKLOG** | Alta (L) |
| **HU-36** | [Cierre Definitivo de Problema con Validación de Eficacia](#hu-36-cierre-definitivo-de-problema-con-validación-de-eficacia) | Fase 7: Problemas y KEDB | **PRODUCT BACKLOG** | Media (M) |
| **HU-37** | [Registro de Solicitud de Cambio (RFC)](#hu-37-registro-de-solicitud-de-cambio-rfc) | Fases Futuras: Cambios RFC | **HECHO** | Alta (L) |
| **HU-38** | [Evaluación de Impacto por Comité de Cambios (CAB)](#hu-38-evaluación-de-impacto-por-comité-de-cambios-cab) | Fases Futuras: Cambios RFC | **PRODUCT BACKLOG** | Alta (L) |
| **HU-39** | [Inventario Maestro de Elementos de Configuración en CMDB](#hu-39-inventario-maestro-de-elementos-de-configuración-en-cmdb) | Fases Futuras: Activos y CMDB | **HECHO** | Alta (L) |
| **HU-40** | [Auditoría Forense de Segregación de Funciones (SoD)](#hu-40-auditoría-forense-de-segregación-de-funciones-sod) | Fases Futuras: Auditoría | **HECHO** | Media (M) |
| **HU-41** | [Tablero de Indicadores Gerenciales de Cumplimiento SLA](#hu-41-tablero-de-indicadores-gerenciales-de-cumplimiento-sla) | Fases Futuras: Reportes | **PRODUCT BACKLOG** | Alta (L) |

---

## 3. Especificación Detallada de Historias de Usuario

### Fase 1: Seguridad, Autenticación y Cuentas (Cimientos I)

#### HU-01: Autenticación Segura de Usuarios
- **Identificador:** `HU-01` · **Fase:** Seguridad y Cuentas
- **Equipo Responsable:** Equipo Scrum FlowDesk (Junior: DB, Nain: API, Lourdes: UI, Alexis: QA, Miguel: Tech Lead)
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Colaborador de la organización.
  - **Deseo:** Iniciar sesión con mi correo corporativo, contraseña cifrada y validación de seguridad visual CAPTCHA.
  - **Para:** Acceder a la plataforma de servicios garantizando la protección de mi identidad laboral.
- **Criterios de Aceptación:**
  - **Escenario 1: Autenticación exitosa con credenciales válidas**
    - **Dado que** ingreso al sistema como *Colaborador institucional* en el formulario de inicio de sesión.
    - **Cuando** ingreso mi correo corporativo activo, mi contraseña correcta y digito el código CAPTCHA mostrado.
    - **Entonces** el sistema valida mis credenciales, establece una cookie de sesión cifrada HTTP-Only y me redirige a la consola correspondiente a mi perfil principal.
  - **Escenario 2: Notificación defensiva ante credenciales erróneas**
    - **Dado que** ingreso al sistema como *Colaborador institucional* en el formulario de inicio de sesión.
    - **Cuando** ingreso una contraseña que no coincide con los registros oficiales.
    - **Entonces** el sistema deniega el acceso, incrementa el contador de intentos fallidos y muestra un mensaje genérico de error sin revelar si el correo existe.

#### HU-02: Recuperación Autónoma de Contraseña
- **Identificador:** `HU-02` · **Fase:** Seguridad y Cuentas
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Colaborador que ha olvidado su clave de acceso.
  - **Deseo:** Solicitar un código temporal de verificación despachado a mi buzón institucional.
  - **Para:** Restablecer mi contraseña de forma autónoma sin depender de la atención manual del equipo de soporte.
- **Criterios de Aceptación:**
  - **Escenario 1: Generación y canje de código temporal válido**
    - **Dado que** ingreso al sistema como *Colaborador institucional* en la vista de recuperación de credenciales.
    - **Cuando** solicito el restablecimiento para mi correo institucional e ingreso el código de 6 dígitos recibido dentro de los 15 minutos de vigencia.
    - **Entonces** el sistema autoriza la definición de una nueva contraseña y actualiza el registro en la base de datos de forma segura.
  - **Escenario 2: Rechazo de código temporal vencido**
    - **Dado que** ingreso al sistema como *Colaborador institucional* con un código de recuperación emitido hace más de 15 minutos.
    - **Cuando** intento confirmar el cambio de contraseña con dicho código.
    - **Entonces** el sistema bloquea la operación, declara el código como expirado y exige una nueva solicitud.

#### HU-03: Actualización de Perfil de Usuario
- **Identificador:** `HU-03` · **Fase:** Seguridad y Cuentas
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Baja (S) · **Prioridad:** Media
- **Definición:**
  - **Como:** Colaborador autenticado en la plataforma.
  - **Deseo:** Actualizar mi número telefónico institucional, correo de contacto y preferencias de notificación.
  - **Para:** Mantener mis canales de contacto actualizados para la atención de mis requerimientos de TI.
- **Criterios de Aceptación:**
  - **Escenario 1: Actualización válida de número celular y canal de contacto**
    - **Dado que** ingreso al sistema como *Colaborador institucional* en el módulo de configuración de mi cuenta.
    - **Cuando** modifico mi número de celular de contacto y guardo los cambios.
    - **Entonces** el sistema valida el formato numérico, guarda la información y despliega una notificación de confirmación de datos guardados.
  - **Escenario 2: Restricción de modificación de nombres y DNI**
    - **Dado que** ingreso al sistema como *Colaborador institucional* en la vista de edición de perfil.
    - **Cuando** reviso los campos de nombres oficiales, apellidos y número de documento de identidad (DNI).
    - **Entonces** estos campos se encuentran en modo de solo lectura, indicando que cualquier corrección de identidad debe ser gestionada por Recursos Humanos.

#### HU-04: Administración Centralizada de Cuentas de Usuario
- **Identificador:** `HU-04` · **Fase:** Seguridad y Cuentas
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Administrador del sistema.
  - **Deseo:** Gestionar el ciclo de vida de los colaboradores en la plataforma mediante un catálogo centralizado de usuarios.
  - **Para:** Registrar altas, consultar personal activo y desactivar cuentas ante desvinculaciones laborales.
- **Criterios de Aceptación:**
  - **Escenario 1: Alta exitosa de nuevo colaborador con validación de documento único**
    - **Dado que** ingreso al sistema como *Administrador institucional* en el catálogo maestro de usuarios.
    - **Cuando** registro un nuevo usuario con nombres, DNI único, departamento empresarial y correo corporativo.
    - **Entonces** el sistema crea la cuenta en estado activo y le asigna el perfil base de Solicitante.
  - **Escenario 2: Control de duplicidad de documento de identidad**
    - **Dado que** ingreso al sistema como *Administrador institucional* en el formulario de registro de usuario.
    - **Cuando** intento registrar un colaborador con un DNI o correo que ya pertenece a otro usuario activo.
    - **Entonces** el sistema detiene el guardado y resalta el campo en conflicto con una alerta de duplicidad.

#### HU-05: Provisión Segura de Credenciales Temporales
- **Identificador:** `HU-05` · **Fase:** Seguridad y Cuentas
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Administrador del sistema.
  - **Deseo:** Generar contraseñas temporales complejas con opción de despacho por correo institucional y copiado al portapapeles.
  - **Para:** Entregar credenciales seguras a los usuarios recién contratados sin exponer contraseñas en texto plano.
- **Criterios de Aceptación:**
  - **Escenario 1: Despacho automático de credenciales vía servicio de correo**
    - **Dado que** ingreso al sistema como *Administrador institucional* tras crear la cuenta de un nuevo colaborador.
    - **Cuando** ejecuto la acción de emisión de credenciales temporales.
    - **Entonces** el servidor genera una clave aleatoria que cumple la política de complejidad y despacha la notificación con el enlace de inicio de sesión.
  - **Escenario 2: Copiado seguro de clave temporal en consola**
    - **Dado que** ingreso al sistema como *Administrador institucional* en el diálogo de confirmación de cuenta.
    - **Cuando** presiono el botón de copiar credencial.
    - **Entonces** el sistema transfiere el valor al portapapeles local y presenta un mensaje visual confirmando la operación.

#### HU-06: Bloqueo Preventivo de Cuentas Comprometidas
- **Identificador:** `HU-06` · **Fase:** Seguridad y Cuentas
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Media (M) · **Prioridad:** Media
- **Definición:**
  - **Como:** Supervisor de seguridad de la información.
  - **Deseo:** Suspender preventivamente cuentas de usuario con actividades anómalas o solicitudes urgentes de cese laboral.
  - **Para:** Bloquear el acceso a los sistemas corporativos e impedir fugas de información.
- **Criterios de Aceptación:**
  - **Escenario 1: Inactivación inmediata de cuenta y revocación de sesión**
    - **Dado que** ingreso al sistema como *Supervisor de seguridad* en el expediente de un colaborador en investigación.
    - **Cuando** activo la casilla de bloqueo de cuenta por riesgo de seguridad.
    - **Entonces** la cuenta cambia a estado bloqueado y cualquier sesión web activa del usuario se destruye inmediatamente.
  - **Escenario 2: Bitácora obligatoria del motivo de bloqueo**
    - **Dado que** ingreso al sistema como *Supervisor de seguridad* en el proceso de suspensión de una cuenta.
    - **Cuando** confirmo el bloqueo en la plataforma.
    - **Entonces** el sistema me exige registrar obligatoriamente una justificación técnica que queda guardada en los registros de auditoría.

---

### Fase 2: Gobernanza RBAC y Árbol de Navegación (Cimientos II)

#### HU-07: Asignación de Perfiles RBAC Institucionales
- **Identificador:** `HU-07` · **Fase:** Gobernanza RBAC
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Administrador del sistema.
  - **Deseo:** Vincular uno o múltiples perfiles de responsabilidad (Administrador, Técnico, Solicitante, Supervisor, Gestores) a una cuenta de usuario.
  - **Para:** Conceder únicamente las capacidades operativas requeridas según el puesto de trabajo del colaborador.
- **Criterios de Aceptación:**
  - **Escenario 1: Concesión exitosa de perfil técnico resolutor**
    - **Dado que** ingreso al sistema como *Administrador institucional* en el panel de privilegios de un colaborador.
    - **Cuando** selecciono el perfil 'Técnico de Soporte' y confirmo la asignación.
    - **Entonces** la cuenta recibe inmediatamente las capacidades para visualizar tickets de la mesa y registrar comentarios técnicos.
  - **Escenario 2: Restricción de autoeliminación de perfil administrativo**
    - **Dado que** ingreso al sistema como *Administrador institucional* editando mi propio usuario.
    - **Cuando** intento desmarcar mi propio perfil de Administrador dejándome sin acceso de gestión.
    - **Entonces** el sistema bloquea la acción con una advertencia impidiendo que la plataforma quede sin administradores habilitados.

#### HU-08: Navegación Segura según Matriz de Privilegios
- **Identificador:** `HU-08` · **Fase:** Gobernanza RBAC
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Colaborador institucional con un perfil activo asignado.
  - **Deseo:** Disponer de una barra de navegación que muestre únicamente los módulos autorizados para mi función.
  - **Para:** Navegar con claridad sin toparme con accesos indebidos o secciones ajenas a mi labor diaria.
- **Criterios de Aceptación:**
  - **Escenario 1: Filtro dinámico de módulos para el perfil Solicitante**
    - **Dado que** ingreso al sistema como *Solicitante de autoservicio*.
    - **Cuando** se carga la barra lateral de opciones de navegación.
    - **Entonces** únicamente visualizo las opciones de Catálogo de Servicios y Seguimiento de Tickets, permaneciendo ocultos los menús de configuración técnica y auditoría.
  - **Escenario 2: Conmutación fluida entre perfiles asignados**
    - **Dado que** ingreso al sistema como *Usuario con perfiles combinados de Técnico y Supervisor*.
    - **Cuando** utilizo el selector de rol activo en el encabezado de la plataforma.
    - **Entonces** el menú se reconstruye instantáneamente reflejando las opciones operativas del perfil conmutado sin cerrar mi sesión.

#### HU-09: Catálogo Maestro de Opciones de Menú
- **Identificador:** `HU-09` · **Fase:** Gobernanza RBAC
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Administrador del sistema.
  - **Deseo:** Administrar el catálogo institucional de opciones de menú y sus rutas asociadas en el sistema.
  - **Para:** Mantener organizada la estructura de navegación y enlazar nuevas funcionalidades conforme se incorporan a la plataforma.
- **Criterios de Aceptación:**
  - **Escenario 1: Verificación de rutas activas contra archivos del sistema**
    - **Dado que** ingreso al sistema como *Administrador institucional* en el visor de opciones de menú.
    - **Cuando** consulto las opciones activas de la plataforma.
    - **Entonces** cada entrada del árbol de menú corresponde exactamente con una ruta canónica y funcional del sistema.
  - **Escenario 2: Inactivación de opción de menú obsoleta**
    - **Dado que** ingreso al sistema como *Administrador institucional* en el mantenimiento del menú.
    - **Cuando** desactivo una opción que se encuentra en desuso o en migración.
    - **Entonces** desaparece de las barras de navegación de todos los roles sin afectar los datos históricos asociados.

#### HU-10: Auditoría Forense de Sesiones de Usuario
- **Identificador:** `HU-10` · **Fase:** Gobernanza RBAC
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Media (M) · **Prioridad:** Media
- **Definición:**
  - **Como:** Auditor de seguridad de la información.
  - **Deseo:** Consultar un registro histórico de accesos con direcciones IP, fechas, navegadores utilizados y perfiles ejercidos.
  - **Para:** Investigar accesos no autorizados o conexiones concurrentes desde ubicaciones geográficas incompatibles.
- **Criterios de Aceptación:**
  - **Escenario 1: Búsqueda de accesos por rango de fechas e IP**
    - **Dado que** ingreso al sistema como *Auditor de seguridad* en el visor de sesiones.
    - **Cuando** filtro por la dirección IP de una sucursal remota durante los últimos 7 días.
    - **Entonces** el sistema lista ordenadamente las sesiones iniciadas, los usuarios involucrados y el estado de la conexión.
  - **Escenario 2: Alerta de conexiones concurrentes bajo una misma credencial**
    - **Dado que** ingreso al sistema como *Auditor de seguridad* en el panel de auditoría en tiempo real.
    - **Cuando** una misma cuenta inicia sesión desde dos direcciones IP de diferentes rangos en menos de 5 minutos.
    - **Entonces** el sistema emite una alerta de bandera roja en la bitácora de eventos de seguridad.

---

### Fase 3: Estructura Organizacional y Mesa de Trabajo

#### HU-11: Estructura de Departamentos Empresariales
- **Identificador:** `HU-11` · **Fase:** Organización TI
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Administrador del sistema.
  - **Deseo:** Gestionar el catálogo de áreas y departamentos de la empresa (Finanzas, Operaciones, Ventas, TI, Recursos Humanos).
  - **Para:** Asignar los centros de costo correctos y definir a las jefaturas encargadas de autorizar solicitudes.
- **Criterios de Aceptación:**
  - **Escenario 1: Registro de nuevo departamento empresarial con jefatura asignada**
    - **Dado que** ingreso al sistema como *Administrador institucional* en el módulo de estructura organizativa.
    - **Cuando** registro el departamento de 'Finanzas y Contabilidad' asignando a su respectivo gerente aprobador.
    - **Entonces** el departamento queda registrado y disponible para la vinculación de colaboradores y solicitudes de compra.
  - **Escenario 2: Bloqueo de eliminación de departamentos con personal activo**
    - **Dado que** ingreso al sistema como *Administrador institucional* en la lista de áreas corporativas.
    - **Cuando** intento eliminar un departamento que tiene colaboradores asignados.
    - **Entonces** el sistema rechaza la eliminación e indica que se deben reubicar los usuarios antes de retirar el área.

#### HU-12: Configuración de Grupos Resolutores de TI
- **Identificador:** `HU-12` · **Fase:** Organización TI
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Supervisor de mesa de ayuda.
  - **Deseo:** Organizar a los técnicos en grupos de especialidad (Mesa N1, Infraestructura, Redes, Aplicaciones, Ciberseguridad).
  - **Para:** Enrutar los incidentes hacia el equipo de soporte capacitado para resolver cada tipo de falla.
- **Criterios de Aceptación:**
  - **Escenario 1: Asignación de técnico a grupo resolutor de Redes**
    - **Dado que** ingreso al sistema como *Supervisor de mesa de ayuda* en el gestor de grupos técnicos.
    - **Cuando** incorporo a un técnico al grupo de 'Comunicaciones y Conectividad'.
    - **Entonces** el técnico pasa a formar parte de la bandeja de entrada técnica de conectividad y puede autoasignarse casos de red.
  - **Escenario 2: Asignación de supervisor responsable por grupo**
    - **Dado que** ingreso al sistema como *Supervisor de mesa de ayuda* en la edición de un grupo resolutor.
    - **Cuando** establezco al supervisor titular de la unidad de Soporte Nivel 1.
    - **Entonces** las alertas por incidentes críticos y vencimientos de SLA de ese grupo se dirigen a dicho supervisor.

#### HU-13: Planificación de Turnos de Soporte Técnico
- **Identificador:** `HU-13` · **Fase:** Organización TI
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Media
- **Definición:**
  - **Como:** Supervisor de operaciones de TI.
  - **Deseo:** Definir las franjas horarias y días de cobertura de los técnicos de soporte.
  - **Para:** Garantizar la disponibilidad de personal técnico durante las horas laborales de la empresa.
- **Criterios de Aceptación:**
  - **Escenario 1: Asignación de turno de guardia para técnico de mesa**
    - **Dado que** ingreso al sistema como *Supervisor de operaciones* en el calendario de turnos.
    - **Cuando** programo a un técnico para la franja diurna de lunes a viernes de 08:00 a 17:00.
    - **Entonces** el sistema actualiza el horario hábil del técnico y habilita la recepción de tickets en su bandeja.
  - **Escenario 2: Advertencia de descobertura en horario operativo**
    - **Dado que** ingreso al sistema como *Supervisor de operaciones* planificando la semana laboral.
    - **Cuando** un turno queda sin ningún técnico activo asignado.
    - **Entonces** el sistema emite una alerta visual en el calendario señalando la franja descubierta.

#### HU-14: Control de Ausencias en Mesa de Ayuda
- **Identificador:** `HU-14` · **Fase:** Organización TI
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Media
- **Definición:**
  - **Como:** Técnico de soporte de mesa de ayuda.
  - **Deseo:** Registrar permisos médicos, vacaciones o capacitaciones programadas en el sistema.
  - **Para:** Evitar que me asignen incidentes mientras me encuentro ausente de mis labores operativas.
- **Criterios de Aceptación:**
  - **Escenario 1: Registro formal de ausencia con fecha de inicio y fin**
    - **Dado que** ingreso al sistema como *Técnico de soporte de mesa de ayuda* en la sección de mis ausencias.
    - **Cuando** registro un periodo de vacaciones de 5 días con la debida justificación.
    - **Entonces** el sistema marca mi estado como no disponible para esas fechas y excluye mi usuario de los repartos automáticos.
  - **Escenario 2: Reasignación preventiva de tickets pendientes**
    - **Dado que** ingreso al sistema como *Supervisor de mesa de ayuda* aprobando una ausencia de un técnico.
    - **Cuando** confirmo la ausencia de un técnico que mantiene 3 tickets en proceso.
    - **Entonces** la plataforma despliega una ventana de traspaso para reasignar dichos tickets a otro técnico en turno.

#### HU-15: Balanceo Automático de Carga de Técnicos
- **Identificador:** `HU-15` · **Fase:** Organización TI
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Alta (L) · **Prioridad:** Media
- **Definición:**
  - **Como:** Supervisor de mesa de ayuda.
  - **Deseo:** Configurar un motor de reparto equitativo que asigne tickets automáticamente al técnico con menor cantidad de casos en curso.
  - **Para:** Prevenir la saturación de los resolutores y equilibrar los tiempos de atención en la mesa.
- **Criterios de Aceptación:**
  - **Escenario 1: Reparto por menor carga de trabajo activa**
    - **Dado que** ingreso al sistema como *Supervisor de mesa de ayuda* con el motor de asignación automática encendido.
    - **Cuando** ingresa un nuevo ticket de soporte de ofimática al grupo de Mesa Nivel 1.
    - **Entonces** el algoritmo selecciona al técnico que posea el menor número de tickets abiertos en ese instante y le asigna el caso.
  - **Escenario 2: Exclusión automática de técnicos ausentes o fuera de turno**
    - **Dado que** ingreso al sistema como *Supervisor de mesa de ayuda* durante la asignación automática.
    - **Cuando** se evalúa la lista de técnicos del grupo resolutor.
    - **Entonces** el motor descarta a los técnicos con ausencias aprobadas o fuera de su franja horaria activa.

---

### Fase 4: Catálogo de Servicios y Acuerdos de Nivel de Servicio (SLA)

#### HU-16: Clasificación de Categorías de Servicio
- **Identificador:** `HU-16` · **Fase:** Catálogo y SLA
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Administrador del catálogo de servicios.
  - **Deseo:** Gestionar las categorías maestras de incidentes y solicitudes con sus tiempos base de atención y códigos normalizados.
  - **Para:** Organizar las prestaciones de TI y estandarizar los compromisos de respuesta ante la empresa.
- **Criterios de Aceptación:**
  - **Escenario 1: Consulta completa de categorías diferenciadas por tipo de servicio**
    - **Dado que** ingreso al sistema como *Administrador del catálogo* en el módulo de categorías de servicio.
    - **Cuando** accedo a la vista de configuración del catálogo.
    - **Entonces** visualizo las 10 categorías maestras con sus insignias de Incidente o Solicitud, tiempos de SLA base y conteo de servicios asociados.
  - **Escenario 2: Modificación de tiempos base de respuesta y resolución**
    - **Dado que** ingreso al sistema como *Administrador del catálogo* editando la categoría de Seguridad de la Información.
    - **Cuando** ajusto el SLA base a 1 hora de respuesta y 2 horas de resolución y guardo.
    - **Entonces** el sistema actualiza la categoría y aplica los nuevos tiempos para los servicios que hereden dicha regla.

#### HU-17: Ficha Técnica de Servicios Corporativos
- **Identificador:** `HU-17` · **Fase:** Catálogo y SLA
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Administrador del catálogo de servicios.
  - **Deseo:** Gestionar el catálogo corporativo de 23 servicios con su descripción comercial, entregable formal, costo referencial y requerimiento de aprobación.
  - **Para:** Ofrecer a los colaboradores una guía clara de los servicios tecnológicos disponibles en la organización.
- **Criterios de Aceptación:**
  - **Escenario 1: Consulta estructurada del catálogo de servicios activos**
    - **Dado que** ingreso al sistema como *Colaborador institucional* en el portal del catálogo.
    - **Cuando** filtro por la categoría de Usuarios y Accesos.
    - **Entonces** visualizo los servicios disponibles (creación de cuentas, accesos temporales, buzones compartidos) con sus tiempos de entrega y condiciones.
  - **Escenario 2: Configuración de servicio con aprobación obligatoria**
    - **Dado que** ingreso al sistema como *Administrador del catálogo* editando la ficha del servicio de Asignación de Laptop Nueva.
    - **Cuando** marco la opción de requerir aprobación de jefatura de área y guardo la ficha.
    - **Entonces** cualquier requerimiento generado para este servicio se pondrá automáticamente en estado Pendiente de Aprobación.

#### HU-18: Parametrización de Acuerdos de Nivel de Servicio (SLA)
- **Identificador:** `HU-18` · **Fase:** Catálogo y SLA
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Gestor de niveles de servicio (SLA Manager).
  - **Deseo:** Parametrizar las metas de tiempo máximo para la primera respuesta y la solución definitiva de cada servicio.
  - **Para:** Medir la eficiencia operativa del área de TI y cumplir los acuerdos pactados con las áreas de negocio.
- **Criterios de Aceptación:**
  - **Escenario 1: Registro de matriz de SLA por prioridad de incidente**
    - **Dado que** ingreso al sistema como *Gestor de niveles de servicio* en la matriz de compromisos SLA.
    - **Cuando** defino que un incidente P1 Crítico tiene máximo 15 minutos de respuesta y 2 horas de resolución.
    - **Entonces** el motor de cálculo de tiempos asume estos valores como límite para todos los incidentes clasificados en P1.
  - **Escenario 2: Validación de coherencia entre tiempo de respuesta y resolución**
    - **Dado que** ingreso al sistema como *Gestor de niveles de servicio* configurando los parámetros de un servicio.
    - **Cuando** intento ingresar un tiempo de primera respuesta superior al tiempo de resolución total.
    - **Entonces** el sistema rechaza el valor indicando que el tiempo de respuesta no puede exceder el límite de resolución.

#### HU-19: Priorización ITIL según Matriz Impacto-Urgencia
- **Identificador:** `HU-19` · **Fase:** Catálogo y SLA
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Técnico o solicitante al reportar un problema técnico.
  - **Deseo:** Que la prioridad del incidente (P1 Crítica, P2 Alta, P3 Media, P4 Baja) se calcule de forma automatizada combinando el impacto en el negocio y la urgencia operativa.
  - **Para:** Evitar la sobredimensión subjetiva de casos y canalizar la atención técnica en función del impacto real de la organización.
- **Criterios de Aceptación:**
  - **Escenario 1: Cálculo automático de Incidente Crítico P1**
    - **Dado que** ingreso al sistema como *Técnico de soporte* registrando una falla en la plataforma principal de pagos.
    - **Cuando** selecciono Impacto Alto (afecta a toda la empresa) y Urgencia Alta (el servicio está completamente detenido).
    - **Entonces** el sistema clasifica de forma automática e inmediata el ticket con Prioridad P1 Crítica.
  - **Escenario 2: Bloqueo de alteración manual injustificada de prioridad**
    - **Dado que** ingreso al sistema como *Solicitante de autoservicio* creando un ticket para una consulta menor.
    - **Cuando** selecciono Impacto Bajo y Urgencia Baja.
    - **Entonces** el sistema fija la prioridad en P4 Baja sin permitir forzar un nivel superior sin elevar el impacto.

#### HU-20: Calendario Laboral de Feriados Corporativos
- **Identificador:** `HU-20` · **Fase:** Catálogo y SLA
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Gestor de niveles de servicio.
  - **Deseo:** Configurar el calendario corporativo con días feriados oficiales y horarios de atención institucional.
  - **Para:** Asegurar que los cronómetros de SLA no descuenten horas durante fines de semana, noches o días festivos no laborables.
- **Criterios de Aceptación:**
  - **Escenario 1: Pausa automática de cronómetro SLA fuera de horario hábil**
    - **Dado que** ingreso al sistema como *Supervisor de mesa de ayuda* consultando un ticket P3 ingresado un viernes a las 17:50.
    - **Cuando** llega el horario de cierre operativo a las 18:00.
    - **Entonces** el cronómetro de SLA se congela y reanuda su conteo el lunes a las 08:00 sin incurrir en mora.
  - **Escenario 2: Carga masiva de feriados nacionales en el calendario**
    - **Dado que** ingreso al sistema como *Gestor de niveles de servicio* en la configuración del calendario anual.
    - **Cuando** registro los feriados nacionales del calendario oficial.
    - **Entonces** el sistema omite dichos días en los cálculos de vencimiento de todos los tickets activos.

---

### Fase 5: Operación de Mesa de Ayuda y Gestión de Incidentes

#### HU-21: Reporte Asistido de Incidente Operativo
- **Identificador:** `HU-21` · **Fase:** Incidentes y Mesa
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Colaborador que sufre una interrupción en sus herramientas de trabajo.
  - **Deseo:** Completar un formulario de reporte de incidente con selección de servicio afectado, descripción de la falla y subida de evidencias.
  - **Para:** Poner en conocimiento de la mesa de TI el problema y obtener asistencia oportuna.
- **Criterios de Aceptación:**
  - **Escenario 1: Registro exitoso de incidente con generación de código correlativo**
    - **Dado que** ingreso al sistema como *Solicitante institucional* en el formulario de incidentes.
    - **Cuando** selecciono el servicio de Conectividad VPN, detallo el mensaje de error y confirmo el envío.
    - **Entonces** el sistema registra el incidente en estado Nuevo, genera un código correlativo único `INC-XXXX` y me envía confirmación al correo.
  - **Escenario 2: Validación de adjunto de capturas en formato seguro**
    - **Dado que** ingreso al sistema como *Solicitante institucional* adjuntando una captura de pantalla al reporte.
    - **Cuando** subo un archivo en formato PNG o PDF de hasta 5 megabytes.
    - **Entonces** el sistema valida la extensión y el contenido del archivo, vinculándolo de forma segura al ticket.

#### HU-22: Consola Técnica de Incidentes con Indicadores SLA
- **Identificador:** `HU-22` · **Fase:** Incidentes y Mesa
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Técnico de soporte de mesa de ayuda.
  - **Deseo:** Disponer de una bandeja de entrada técnica con filtros por estado, prioridad y semáforos de tiempo restante de SLA.
  - **Para:** Identificar a golpe de vista los casos más críticos y gestionar ordenadamente mi jornada de soporte.
- **Criterios de Aceptación:**
  - **Escenario 1: Visualización semafórica de incidentes en riesgo de vencimiento**
    - **Dado que** ingreso al sistema como *Técnico de soporte* en mi bandeja de trabajo técnico.
    - **Cuando** un incidente asignado consume más del 75% del tiempo establecido por el SLA.
    - **Entonces** el indicador de tiempo restante cambia a color naranja de advertencia y sitúa el ticket en los primeros lugares de la lista.
  - **Escenario 2: Filtrado rápido por incidentes no asignados en mesa**
    - **Dado que** ingreso al sistema como *Técnico de soporte* revisando los casos entrantes.
    - **Cuando** aplico el filtro de 'Sin asignar' para mi grupo resolutor.
    - **Entonces** la tabla muestra únicamente los tickets disponibles para ser tomados por los miembros del equipo.

#### HU-23: Autoasignación de Incidentes en Mesa
- **Identificador:** `HU-23` · **Fase:** Incidentes y Mesa
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Técnico de soporte de mesa de ayuda.
  - **Deseo:** Tomar posesión operativa de un incidente no asignado de mi grupo con un solo clic.
  - **Para:** Asumir formalmente la responsabilidad del diagnóstico y resolución del caso sin esperar una orden manual del supervisor.
- **Criterios de Aceptación:**
  - **Escenario 1: Toma exitosa de ticket con transición a estado En Proceso**
    - **Dado que** ingreso al sistema como *Técnico de soporte* visualizando un incidente en estado Nuevo.
    - **Cuando** hago clic en el botón de acción 'Tomar Ticket'.
    - **Entonces** mi nombre queda asignado como técnico responsable, el estado del ticket transiciona a En Proceso y se registra la traza de auditoría.
  - **Escenario 2: Protección contra toma concurrente simultánea**
    - **Dado que** ingreso al sistema como *Técnico de soporte* intentando tomar un ticket.
    - **Cuando** otro técnico ha tomado exactamente el mismo ticket milisegundos antes.
    - **Entonces** el sistema me avisa que el caso ya fue asignado al otro técnico y actualiza mi pantalla evitando la colisión.

#### HU-24: Bitácora Técnica de Comentarios Operativos
- **Identificador:** `HU-24` · **Fase:** Incidentes y Mesa
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Técnico de soporte asignado a un incidente.
  - **Deseo:** Publicar notas técnicas privadas internas para otros técnicos y comentarios públicos visibles para el solicitante.
  - **Para:** Documentar el procedimiento de diagnóstico manteniendo informado al usuario sobre el progreso de su caso.
- **Criterios de Aceptación:**
  - **Escenario 1: Publicación de nota técnica confidencial entre resolutores**
    - **Dado que** ingreso al sistema como *Técnico de soporte* en la bitácora de un incidente.
    - **Cuando** publico un apunte marcándolo como 'Nota técnica interna'.
    - **Entonces** el comentario es visible para los técnicos y supervisores, permaneciendo completamente oculto en la vista del solicitante.
  - **Escenario 2: Notificación al usuario ante mensaje público de soporte**
    - **Dado que** ingreso al sistema como *Técnico de soporte* escribiendo en la bitácora del ticket.
    - **Cuando** registro una respuesta pública solicitando más detalles del error al colaborador.
    - **Entonces** el comentario se publica en la línea de tiempo del ticket y el solicitante recibe un correo con el mensaje del técnico.

#### HU-25: Protocolo de Gestión de Incidentes Mayores P1
- **Identificador:** `HU-25` · **Fase:** Incidentes y Mesa
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Supervisor de operaciones de TI o Técnico líder.
  - **Deseo:** Activar el protocolo de Incidente Mayor para fallas catastróficas P1 que detienen la operación de la empresa.
  - **Para:** Abrir una sala de crisis colaborativa, alertar a la gerencia y movilizar recursos técnicos prioritarios.
- **Criterios de Aceptación:**
  - **Escenario 1: Declaración formal de Incidente Mayor en la mesa**
    - **Dado que** ingreso al sistema como *Supervisor de mesa de ayuda* frente a un incidente P1 que afecta al servidor ERP.
    - **Cuando** presiono la acción de 'Declarar Incidente Mayor'.
    - **Entonces** el sistema activa el encabezado de alerta de crisis, envía notificaciones prioritarias al comité operativo y abre la sala de seguimiento técnico.
  - **Escenario 2: Publicación de comunicados de estado en sala de crisis**
    - **Dado que** ingreso al sistema como *Supervisor de mesa de ayuda* liderando la sala de crisis.
    - **Cuando** publico un boletín de actualización operacional cada 30 minutos.
    - **Entonces** los directores y jefes de área suscritos visualizan el avance del restablecimiento en tiempo real.

#### HU-26: Escalamiento Jerárquico por Incumplimiento de SLA
- **Identificador:** `HU-26` · **Fase:** Incidentes y Mesa
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Supervisor de operaciones de TI.
  - **Deseo:** Que el sistema escale automáticamente los tickets que alcancen el 90% de su tiempo límite de atención sin haber sido resueltos.
  - **Para:** Intervenir oportunamente en los casos desatendidos antes de que se consume la penalización por quiebre de SLA.
- **Criterios de Aceptación:**
  - **Escenario 1: Escalamiento funcional hacia técnico especialista de segundo nivel**
    - **Dado que** ingreso al sistema como *Supervisor de operaciones* monitoreando la mesa.
    - **Cuando** un ticket P2 en manos de Nivel 1 alcanza el 90% del tiempo de resolución sin avances.
    - **Entonces** el sistema transfiere el ticket al grupo resolutor Nivel 2 y alerta con máxima prioridad al técnico de guardia.
  - **Escenario 2: Notificación gerencial por ticket vencido**
    - **Dado que** ingreso al sistema como *Supervisor de operaciones* en el seguimiento de compromisos.
    - **Cuando** un incidente P1 agota el 100% del SLA de resolución sin cerrarse.
    - **Entonces** la plataforma emite un reporte formal de incumplimiento a la Gerencia de TI detallando las causas del retraso.

---

### Fase 6: Gestión de Solicitudes de Servicio y Flujo de Aprobaciones

#### HU-27: Catálogo de Autoservicio de Solicitudes Institucionales
- **Identificador:** `HU-27` · **Fase:** Solicitudes de Servicio
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Colaborador de la organización.
  - **Deseo:** Explorar el catálogo de peticiones estándar (accesorios, nuevos accesos, licencias de software, buzones) organizadas por categorías con buscador predictivo.
  - **Para:** Solicitar recursos informáticos formales sin requerir llamadas telefónicas ni correos informales.
- **Criterios de Aceptación:**
  - **Escenario 1: Búsqueda rápida de servicio por palabras clave**
    - **Dado que** ingreso al sistema como *Solicitante institucional* en el portal de autoservicio.
    - **Cuando** escribo 'mouse' o 'laptop' en la barra de búsqueda de servicios.
    - **Entonces** la interfaz me presenta de inmediato las fichas correspondientes con sus tiempos estimados de entrega y requisitos.
  - **Escenario 2: Identificación de servicios que requieren aprobación previa**
    - **Dado que** ingreso al sistema como *Solicitante institucional* explorando las opciones del catálogo.
    - **Cuando** visualizo un servicio de alto costo o perfil sensible.
    - **Entonces** la ficha muestra un distintivo ámbar indicando que la petición requerirá visto bueno de mi gerencia.

#### HU-28: Captura de Solicitud con Justificación de Negocio
- **Identificador:** `HU-28` · **Fase:** Solicitudes de Servicio
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Colaborador que requiere un nuevo recurso tecnológico.
  - **Deseo:** Completar el formulario de solicitud detallando la justificación de negocio, el centro de costos y los entregables requeridos.
  - **Para:** Proporcionar la información necesaria para que mi jefatura evalúe y autorice el pedido.
- **Criterios de Aceptación:**
  - **Escenario 1: Envío exitoso de solicitud con puesta en cola de aprobación**
    - **Dado que** ingreso al sistema como *Solicitante institucional* solicitando una licencia de software de diseño.
    - **Cuando** completo la justificación del proyecto, selecciono mi departamento y confirmo el envío.
    - **Entonces** la solicitud queda registrada con el código `SOL-XXXX` en estado Pendiente de Aprobación y se notifica al aprobador del área.
  - **Escenario 2: Validación de obligatoriedad en la justificación operativa**
    - **Dado que** ingreso al sistema como *Solicitante institucional* en el formulario de pedido.
    - **Cuando** intento enviar la solicitud dejando en blanco el campo de justificación de negocio.
    - **Entonces** el sistema impide el envío y señala el campo en rojo exigiendo documentar el motivo de la petición.

#### HU-29: Bandeja Jurisdiccional de Aprobaciones de Área
- **Identificador:** `HU-29` · **Fase:** Solicitudes de Servicio
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Gerente o Gestor de área aprobador.
  - **Deseo:** Disponer de una bandeja de requerimientos pendientes de mi departamento con opción de aprobar o rechazar con dictamen fundamentado.
  - **Para:** Controlar el gasto y verificar la pertinencia de los recursos de TI solicitados por mis colaboradores.
- **Criterios de Aceptación:**
  - **Escenario 1: Aprobación formal de requerimiento y pase a atención técnica**
    - **Dado que** ingreso al sistema como *Gestor de área aprobador* en mi bandeja de aprobaciones pendientes.
    - **Cuando** reviso la justificación de compra de un monitor y pulso 'Aprobar Solicitud' agregando mi conformidad.
    - **Entonces** la solicitud cambia de estado a Aprobado, pasa a la mesa de soporte para su adquisición y se registra mi firma digital en la traza.
  - **Escenario 2: Rechazo fundamentado de requerimiento no justificado**
    - **Dado que** ingreso al sistema como *Gestor de área aprobador* ante una solicitud no pertinente.
    - **Cuando** selecciono la opción 'Rechazar' e ingreso el motivo del rechazo.
    - **Entonces** la solicitud pasa a estado Rechazado, se cierra el flujo y el solicitante recibe la notificación con mis observaciones.

#### HU-30: Blindaje de Segregación de Funciones en Aprobaciones
- **Identificador:** `HU-30` · **Fase:** Solicitudes de Servicio
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Auditor de cumplimiento normativo (SOX / ISO 27001).
  - **Deseo:** Que el sistema impida estrictamente que un usuario que tiene perfil de aprobador pueda autorizar sus propias solicitudes de servicio.
  - **Para:** Cumplir las políticas de Segregación de Funciones (SoD) y evitar conflictos de interés en el uso de recursos corporativos.
- **Criterios de Aceptación:**
  - **Escenario 1: Bloqueo de autoaprobación de solicitud propia**
    - **Dado que** ingreso al sistema como *Gestor de área con facultades de aprobación*.
    - **Cuando** genero una solicitud de equipamiento nuevo a mi propio nombre e intento aprobarla desde mi bandeja.
    - **Entonces** el sistema inhabilita los botones de decisión para ese ticket específico y despliega una advertencia de conflicto de interés SoD.
  - **Escenario 2: Canalización obligatoria hacia jefatura superior o delegado**
    - **Dado que** ingreso al sistema como *Gestor de área* con una solicitud propia que requiere visto bueno.
    - **Cuando** el sistema procesa el flujo de autorización.
    - **Entonces** el ticket se enruta automáticamente hacia la bandeja del superior jerárquico o al auditor designado.

#### HU-31: Delegación Temporal de Autoridad de Aprobación
- **Identificador:** `HU-31` · **Fase:** Solicitudes de Servicio
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Media (M) · **Prioridad:** Media
- **Definición:**
  - **Como:** Gerente o Gestor de área aprobador.
  - **Deseo:** Delegar temporalmente mi potestad de aprobación a un suplente calificado durante mis vacaciones o viajes de trabajo.
  - **Para:** Evitar que los colaboradores de mi equipo queden paralizados esperando autorizaciones durante mi ausencia.
- **Criterios de Aceptación:**
  - **Escenario 1: Alta de delegación con fecha de caducidad automática**
    - **Dado que** ingreso al sistema como *Gestor de área aprobador* antes de iniciar un periodo de vacaciones de 10 días.
    - **Cuando** elijo a mi coordinador adjunto como delegado temporal fijando la fecha de inicio y retorno.
    - **Entonces** durante ese periodo las solicitudes de mi área llegan a la bandeja de mi delegado con plena facultad resolutiva.
  - **Escenario 2: Restitución automática de autoridad al vencer la delegación**
    - **Dado que** ingreso al sistema como *Gestor de área aprobador* al día siguiente de vencido el plazo de la delegación.
    - **Cuando** se genera una nueva solicitud en mi departamento.
    - **Entonces** la delegación se cancela de forma automática y las nuevas autorizaciones retornan exclusivamente a mi cuenta.

---

### Fase 7: Gestión de Problemas y Base de Errores Conocidos (KEDB)

#### HU-32: Formalización de Expediente de Problema Operativo
- **Identificador:** `HU-32` · **Fase:** Problemas y KEDB
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Gestor de problemas de TI (Problem Manager).
  - **Deseo:** Registrar formalmente un expediente de Problema categorizado con su título, descripción del síntoma y especialista técnico asignado.
  - **Para:** Conducir la investigación técnica que determine la falla de fondo que genera interrupciones operativas.
- **Criterios de Aceptación:**
  - **Escenario 1: Creación de expediente con código correlativo PRB**
    - **Dado que** ingreso al sistema como *Gestor de problemas de TI* en el módulo de registro de problemas.
    - **Cuando** defino el título del expediente, la categoría tecnológica de infraestructura y asigno al especialista sénior.
    - **Entonces** el sistema genera el código único `PRB-XXXX`, sitúa el expediente en estado 'En Investigación' y notifica al técnico encargado.
  - **Escenario 2: Asignación de prioridad según impacto de recurrencia**
    - **Dado que** ingreso al sistema como *Gestor de problemas de TI* evaluando un caso recurrente.
    - **Cuando** establezco que la falla afecta a más de 3 servicios corporativos de forma simultánea.
    - **Entonces** el sistema clasifica el problema con severidad de Problema Mayor y habilita seguimiento prioritario.

#### HU-33: Vinculación de Incidentes Recurrentes a un Problema
- **Identificador:** `HU-33` · **Fase:** Problemas y KEDB
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Gestor de problemas de TI.
  - **Deseo:** Asociar múltiples incidentes cerrados o activos a un mismo expediente de problema.
  - **Para:** Centralizar el historial de tickets repetitivos y medir el impacto cuantitativo de la falla en la organización.
- **Criterios de Aceptación:**
  - **Escenario 1: Asociación masiva de incidentes similares**
    - **Dado que** ingreso al sistema como *Gestor de problemas de TI* en la pestaña de incidentes vinculados.
    - **Cuando** busco y selecciono cuatro incidentes de corte de enlace de fibra óptica ocurridos en el último mes.
    - **Entonces** los cuatro tickets quedan enlazados al expediente del problema y su contador de incidentes asociados sube a 4.
  - **Escenario 2: Notificación masiva de estado a los incidentes vinculados**
    - **Dado que** ingreso al sistema como *Gestor de problemas de TI* actualizando el estado de un problema en curso.
    - **Cuando** agrego una nota de progreso sobre el diagnóstico del hardware defectuoso.
    - **Entonces** la bitácora de cada incidente vinculado refleja el avance para que los técnicos informen a los usuarios afectados.

#### HU-34: Repositorio de Errores Conocidos (KEDB)
- **Identificador:** `HU-34` · **Fase:** Problemas y KEDB
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Técnico de soporte de mesa de ayuda.
  - **Deseo:** Consultar la base de datos de errores conocidos (KEDB) buscando por síntomas o mensajes de error.
  - **Para:** Aplicar soluciones temporales comprobadas (workarounds) de inmediato sin perder tiempo rediagnosticando problemas ya conocidos.
- **Criterios de Aceptación:**
  - **Escenario 1: Localización y aplicación de workaround oficial**
    - **Dado que** ingreso al sistema como *Técnico de soporte* atendiendo un incidente con error de conexión en base de datos.
    - **Cuando** busco en la KEDB por el código de error numérico.
    - **Entonces** el sistema me presenta el artículo de Error Conocido con el procedimiento paso a paso para reiniciar el servicio de forma segura.
  - **Escenario 2: Publicación autorizada de nuevo Error Conocido desde un problema**
    - **Dado que** ingreso al sistema como *Gestor de problemas de TI* habiendo validado una solución temporal.
    - **Cuando** activo la casilla de 'Publicar en KEDB' con el detalle del método de mitigación.
    - **Entonces** el registro pasa a ser accesible para todos los técnicos resolutores de la organización.

#### HU-35: Análisis Estructurado de Causa Raíz (RCA)
- **Identificador:** `HU-35` · **Fase:** Problemas y KEDB
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Alta (L) · **Prioridad:** Media
- **Definición:**
  - **Como:** Gestor de problemas de TI.
  - **Deseo:** Utilizar herramientas metodológicas estructuradas (técnica de los 5 Porqués y Diagrama de Ishikawa de Causa-Efecto) dentro del expediente del problema.
  - **Para:** Llegar sistemáticamente al origen fundamental de la falla evitando deducciones precipitadas o soluciones superficiales.
- **Criterios de Aceptación:**
  - **Escenario 1: Construcción guiada de la secuencia de 5 Porqués**
    - **Dado que** ingreso al sistema como *Gestor de problemas de TI* en la sección de análisis metodológico.
    - **Cuando** completo los 5 niveles correlativos de causa y efecto documentando cada respuesta técnica.
    - **Entonces** la plataforma genera un diagrama visual de la cadena causal y extrae la conclusión final de la causa raíz.
  - **Escenario 2: Clasificación de causas en las 6M del Diagrama de Ishikawa**
    - **Dado que** ingreso al sistema como *Gestor de problemas de TI* analizando un incidente de infraestructura.
    - **Cuando** clasifico los factores contribuyentes en Método, Mano de obra, Maquinaria y Materiales.
    - **Entonces** el sistema genera el gráfico de espina de pescado para el informe técnico de gerencia.

#### HU-36: Cierre Definitivo de Problema con Validación de Eficacia
- **Identificador:** `HU-36` · **Fase:** Problemas y KEDB
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Media (M) · **Prioridad:** Media
- **Definición:**
  - **Como:** Gestor de problemas de TI.
  - **Deseo:** Someter los problemas con solución definitiva a un periodo de observación de 30 días antes del cierre final.
  - **Para:** Confirmar fehacientemente que la tasa de recurrencia bajó a cero y que la solución aplicada fue verdaderamente eficaz.
- **Criterios de Aceptación:**
  - **Escenario 1: Conclusión exitosa de periodo de observación sin reincidencias**
    - **Dado que** ingreso al sistema como *Gestor de problemas de TI* evaluando un problema resuelto hace 30 días.
    - **Cuando** verifico que no ha ingresado ningún nuevo incidente vinculado al síntoma en dicho lapso.
    - **Entonces** el sistema autoriza el cierre formal definitivo del expediente y archiva el caso en los registros históricos de calidad.
  - **Escenario 2: Reapertura automática ante aparición de incidente reincidente**
    - **Dado que** ingreso al sistema como *Gestor de problemas de TI* con un expediente en periodo de observación.
    - **Cuando** un técnico vincula un nuevo incidente idéntico ocurrido dentro de la ventana de prueba.
    - **Entonces** la plataforma cancela la pre-resolución, devuelve el problema a estado 'En Investigación' y alerta al equipo técnico.

---

### Fases Futuras en Product Backlog (Fases 8 a 10)

#### HU-37: Registro de Solicitud de Cambio (RFC)
- **Identificador:** `HU-37` · **Fase:** Fases Futuras (Cambios RFC)
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Gestor de cambios de TI (Change Manager).
  - **Deseo:** Registrar una Solicitud de Cambio formal (RFC) vinculada a un Problema con plan de implementación, plan de pruebas y plan de reversa (rollback).
  - **Para:** Controlar las modificaciones en los sistemas de producción minimizando los riesgos de interrupción no planificada.
- **Criterios de Aceptación:**
  - **Escenario 1: Registro formal de cambio normal con matriz de riesgos**
    - **Dado que** ingreso al sistema como *Gestor de cambios de TI* en el formulario de registro de RFC.
    - **Cuando** completo los planes de ejecución, plan de marcha atrás y vinculo los servidores afectados.
    - **Entonces** la RFC queda registrada en estado 'En Evaluación CAB' para su posterior dictamen por el comité.
  - **Escenario 2: Validación obligatoria del plan de contingencia y reversa**
    - **Dado que** ingreso al sistema como *Gestor de cambios de TI* registrando un cambio de arquitectura.
    - **Cuando** intento enviar la RFC sin adjuntar el procedimiento detallado de recuperación ante fallos.
    - **Entonces** el sistema impide el guardado exigiendo documentar el plan de marcha atrás obligatorio.

#### HU-38: Evaluación de Impacto por Comité de Cambios (CAB)
- **Identificador:** `HU-38` · **Fase:** Fases Futuras (Cambios RFC)
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Alta (L) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Miembro del Comité de Cambios (CAB).
  - **Deseo:** Emitir mi voto formal (Aprobado, Rechazado, Requiere Modificación) dentro de la ficha de la RFC con quorum verificable.
  - **Para:** Autorizar únicamente aquellas modificaciones que cumplan los requisitos de seguridad y no colisionen con ventanas de congelamiento.
- **Criterios de Aceptación:**
  - **Escenario 1: Votación de cambio alcanzando el quorum requerido**
    - **Dado que** ingreso al sistema como *Miembro del comité CAB* en la sesión de votación de una RFC.
    - **Cuando** reviso el análisis de riesgo y registro mi voto de aprobación junto a los demás miembros convocados.
    - **Entonces** al alcanzar la mayoría estipulada la RFC cambia automáticamente a estado 'Aprobado para Despliegue'.
  - **Escenario 2: Detección automática de conflicto en ventana de congelamiento**
    - **Dado que** ingreso al sistema como *Miembro del comité CAB* evaluando la fecha de ejecución de un cambio.
    - **Cuando** la fecha propuesta coincide con un periodo de cierre contable o congelamiento de código (freeze window).
    - **Entonces** el sistema marca la fecha en color rojo de alerta advirtiendo el conflicto de calendario.

#### HU-39: Inventario Maestro de Elementos de Configuración en CMDB
- **Identificador:** `HU-39` · **Fase:** Fases Futuras (Activos y CMDB)
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Alta (L) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Gestor de activos y configuración (SACM Manager).
  - **Deseo:** Administrar el inventario de CIs (servidores, bases de datos, aplicaciones, switches) y sus dependencias topológicas en la CMDB.
  - **Para:** Identificar qué servicios de negocio se verán afectados ante la falla o modificación de un componente de infraestructura.
- **Criterios de Aceptación:**
  - **Escenario 1: Mapeo de relación de dependencia entre servidor y servicio**
    - **Dado que** ingreso al sistema como *Gestor de configuración* en la ficha de un servidor de base de datos.
    - **Cuando** establezco una relación de 'Soporta a' con el servicio del Portal Transaccional.
    - **Entonces** la CMDB guarda la dependencia y actualiza el mapa de impacto tecnológico del servicio.
  - **Escenario 2: Auditoría de discrepancias contra la línea base autorizada**
    - **Dado que** ingreso al sistema como *Gestor de configuración* en el visor de exactitud de la CMDB.
    - **Cuando** ejecuto una comparación entre el inventario reportado y la línea base histórica.
    - **Entonces** la plataforma resalta las modificaciones que no cuenten con una RFC de respaldo autorizada.

#### HU-40: Auditoría Forense de Segregación de Funciones (SoD)
- **Identificador:** `HU-40` · **Fase:** Fases Futuras (Auditoría)
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **HECHO** · **Complejidad:** Media (M) · **Prioridad:** Crítica
- **Definición:**
  - **Como:** Auditor de sistemas e inspección de cumplimiento.
  - **Deseo:** Inspeccionar la bitácora inmutable de transacciones y correr análisis automatizados de Segregación de Funciones.
  - **Para:** Verificar que ningún colaborador haya vulnerado los controles internos o actuado como juez y parte en aprobaciones y cambios.
- **Criterios de Aceptación:**
  - **Escenario 1: Ejecución de escaneo automatizado de matrices de riesgo SoD**
    - **Dado que** ingreso al sistema como *Auditor de sistemas* en el módulo de cumplimiento.
    - **Cuando** corro el análisis de Segregación de Funciones sobre las transacciones del último mes.
    - **Entonces** el sistema emite el reporte de cero incidentes de autoaprobación y certifica la conformidad del proceso.
  - **Escenario 2: Generación de muestra aleatoria representativa para auditoría**
    - **Dado que** ingreso al sistema como *Auditor de sistemas* preparando la auditoría externa anual.
    - **Cuando** solicito la extracción de una muestra aleatoria del 10% de tickets resueltos.
    - **Entonces** la plataforma exporta la muestra con sus firmas temporales, logs de auditoría y nombres de los técnicos intervinientes.

#### HU-41: Tablero de Indicadores Gerenciales de Cumplimiento SLA
- **Identificador:** `HU-41` · **Fase:** Fases Futuras (Reportes)
- **Equipo Responsable:** Equipo Scrum FlowDesk
- **Estado:** **PRODUCT BACKLOG** · **Complejidad:** Alta (L) · **Prioridad:** Alta
- **Definición:**
  - **Como:** Director de Tecnología de la Información (CIO) o Gerente de Operaciones.
  - **Deseo:** Consultar un tablero ejecutivo con el porcentaje global de cumplimiento de SLA, tiempo medio de reparación (MTTR) y satisfacción de usuario.
  - **Para:** Evaluar el rendimiento estratégico del servicio de TI y fundamentar decisiones de inversión en infraestructura y personal.
- **Criterios de Aceptación:**
  - **Escenario 1: Desglose porcentual de SLA por departamento empresarial**
    - **Dado que** ingreso al sistema como *Director de TI* en el panel gerencial de indicadores.
    - **Cuando** selecciono el periodo trimestral y filtro por áreas de la compañía.
    - **Entonces** el tablero muestra gráficos interactivos con el índice de cumplimiento por área comparado contra la meta institucional del 95%.
  - **Escenario 2: Cálculo del Tiempo Medio de Reparación (MTTR)**
    - **Dado que** ingreso al sistema como *Director de TI* revisando los reportes de incidentes mayores.
    - **Cuando** consulto la métrica de tiempo de resolución de fallas críticas.
    - **Entonces** el sistema calcula el promedio de horas de duración de las interrupciones y grafica la tendencia mensual.
