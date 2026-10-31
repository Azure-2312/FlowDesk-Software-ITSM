# Matriz Maestra de Trazabilidad y Cobertura: Historias de Usuario vs. Menú y Flujos de Software

> **Documento Canónico de Cobertura y Trazabilidad Integral** · **Versión:** 2.0  
> **Proyecto:** FlowDesk ITSM — Sistema de Gestión de Tickets y Servicios de TI  
> **Fecha:** 2026-10-27  
> **Ámbito:** Demostración de cobertura de las **41 Historias de Usuario atómicas** sobre las **197 páginas físicas (hojas)** del árbol de navegación, con sus flujos de negocio ITIL v4, flujos en el software y verificación paso a paso por criterio de aceptación.

---

## 1. Resumen Ejecutivo de Cobertura y Arquitectura

1. **Total de Historias de Usuario:** **41 Historias** (31 en estado `HECHO`, 10 en `PRODUCT BACKLOG`).
2. **Total de Páginas Físicas del Menú (Hojas Navegables):** **197 URLs** activas en el repositorio y verificadas contra rutas Next.js en disco.
3. **Relación Matemática de Agrupación:** 
   $$\mathbf{41\text{ Historias de Usuario}} \times \mathbf{\sim 4.8\text{ páginas promedio por historia}} = \mathbf{197\text{ páginas físicas}}$$
4. **Por qué 1 Historia no es 1 Página Web:**
   En desarrollo ágil profesional, una Historia de Usuario representa una **capacidad de negocio completa de extremo a extremo**. Cada historia integra de forma natural:
   - *Vista 1:* Bandeja de entrada o listado maestro con filtros.
   - *Vista 2:* Formulario de captura y validación de datos.
   - *Vista 3:* Vista detallada del registro (el botón *"Ver Ficha"* o *"Ver Expediente"*).
   - *Vista 4 y 5:* Pestañas internas de subprocesos (bitácora, cronómetro de SLA, workflow de aprobaciones o relaciones de impacto).
   Convertir cada botón o cada sub-página en una historia independiente violaría la regla de **atomicidad de negocio** y crearía microfuncionalidades triviales (el error que el profesor rechazó).

---

## 2. Gran Matriz de Trazabilidad Integral (Las 41 Historias de Usuario)

A continuación se presenta la matriz completa detallando para cada una de las 41 historias:
- **Columna 1: HU** (Identificador y Título Atómico sin "y").
- **Columna 2: Páginas y Rutas Web que la Componen** (todas las URLs del software asociadas).
- **Columna 3: Flujo de Negocio ITIL v4** (proceso del mundo real que modela).
- **Columna 4: Flujo General en el Software** (paso a paso de navegación e interacción).
- **Columna 5: Criterios de Aceptación** (escenarios Gherkin con rol obligatorio en el *Dado que*).
- **Columna 6: Flujo Específico por Criterio** (paso a paso de verificación de cada escenario).

---

### HU-01: Autenticación Segura de Usuarios

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-01** — *Autenticación Segura de Usuarios*<br>*(Fase: Fase 1: Seguridad y Cuentas)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/login`<br>`/api/auth/login`<br>`/api/auth/captcha`<br>`/perfil` *(seguridad)* |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Acceso e Identidades (IAM): El colaborador inicia su jornada validando credenciales institucionales y control antibot para prevenir ataques de fuerza bruta. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Usuario ingresa a la raíz del sitio -> 2. Sistema detecta ausencia de sesión y redirige a /login -> 3. Formulario solicita correo, contraseña y CAPTCHA -> 4. Se envía POST a /api/auth/login -> 5. Se emite cookie de sesión HTTP-Only -> 6. Redirección a la consola del perfil activo. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Ingreso válido<br>Dado que ingreso al sistema como Colaborador institucional en el formulario de inicio de sesión.<br>Cuando ingreso mi correo corporativo activo, mi contraseña correcta y digito el código CAPTCHA mostrado.<br>Entonces el sistema valida mis credenciales, establece una cookie de sesión cifrada HTTP-Only y me redirige a la consola de mi perfil.<br><br>Escenario 2: Notificación defensiva<br>Dado que ingreso al sistema como Colaborador institucional en el formulario de inicio de sesión.<br>Cuando ingreso una contraseña que no coincide con los registros oficiales.<br>Entonces el sistema deniega el acceso, incrementa el contador de intentos fallidos y muestra un mensaje genérico de error sin revelar la existencia del correo. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Navegador en /login -> Escribe 'apazamiguel88@gmail.com' -> Escribe 'admin123' -> Resuelve CAPTCHA -> Clic en 'Iniciar Sesión' -> Servidor valida hash bcrypt -> Respuesta HTTP 200 con Set-Cookie -> Redirección automática a /plataforma/operacion/paneles/administrador.<br><br>Flujo Escenario 2: Navegador en /login -> Escribe correo válido -> Escribe contraseña errónea -> Clic en 'Iniciar Sesión' -> API responde HTTP 401 con 'Usuario o contraseña incorrectos' -> UI incrementa intentos fallidos -> El campo de contraseña se limpia y el CAPTCHA se regenera. |

---

### HU-02: Recuperación Autónoma de Contraseña

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-02** — *Recuperación Autónoma de Contraseña*<br>*(Fase: Fase 1: Seguridad y Cuentas)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/login-clave`<br>`/api/auth/login-clave/solicitar`<br>`/api/auth/login-clave/verificar`<br>`/api/auth/login-clave/cambiar` |
| **Columna 3: Flujo de Negocio ITIL v4** | Autoservicio de Seguridad: Restablecimiento de credenciales sin intervención de operadores humanos mediante verificación de canal fuera de banda (código temporal OTP por correo). |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Usuario hace clic en '¿Olvidaste tu contraseña?' en /login -> 2. Carga /login-clave -> 3. Ingresa correo corporativo -> 4. Servidor despacha código de 6 dígitos con expiración a 15 min -> 5. Usuario ingresa código -> 6. Servidor valida token y habilita formulario de nueva clave -> 7. Contraseña actualizada. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Canje de código válido<br>Dado que ingreso al sistema como Colaborador institucional en la vista de recuperación de credenciales.<br>Cuando solicito el restablecimiento para mi correo institucional e ingreso el código de 6 dígitos recibido dentro de los 15 minutos.<br>Entonces el sistema autoriza la definición de una nueva contraseña y actualiza el registro en la base de datos.<br><br>Escenario 2: Rechazo de código expirado<br>Dado que ingreso al sistema como Colaborador institucional con un código de recuperación emitido hace más de 15 minutos.<br>Cuando intento confirmar el cambio de contraseña con dicho código.<br>Entonces el sistema bloquea la operación, declara el código como expirado y exige una nueva solicitud. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Abre /login-clave -> Ingresa correo institucional -> Clic en 'Enviar código' -> Revisa buzón -> Copia '481920' -> Pega en la vista -> Servidor valida OTP -> Ingresa nueva clave -> Clic en 'Guardar' -> Mensaje de éxito -> Redirección a /login.<br><br>Flujo Escenario 2: Abre /login-clave -> Ingresa código tras 20 min -> Servidor evalúa expiración -> HTTP 400 'Código expirado' -> Formulario muestra alerta roja y botón para reiniciar solicitud. |

---

### HU-03: Actualización de Perfil de Usuario

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-03** — *Actualización de Perfil de Usuario*<br>*(Fase: Fase 1: Seguridad y Cuentas)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/perfil`<br>`/perfil` *(preferencias)*<br>`/plataforma/operacion/notificaciones` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Datos Maestros de Contacto: Los colaboradores mantienen actualizada su información operativa (celular, anexos y canales de notificación preferidos) garantizando la comunicación fluida con la mesa de TI. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Usuario autenticado abre menú lateral 'Mi cuenta' -> 2. Selecciona 'Mi perfil' -> 3. Carga /plataforma/cuenta/perfil -> 4. Modifica campos permitidos (celular, correo personal, preferencias) -> 5. Presiona 'Guardar Cambios' -> 6. Servidor valida formato y actualiza tabla usuario -> 7. Feedback visual de guardado. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Actualización válida de celular<br>Dado que ingreso al sistema como Colaborador institucional en el módulo de configuración de mi cuenta.<br>Cuando modifico mi número de celular de contacto y guardo los cambios.<br>Entonces el sistema valida el formato numérico, guarda la información y despliega una notificación de confirmación.<br><br>Escenario 2: Restricción de campos protegidos<br>Dado que ingreso al sistema como Colaborador institucional en la vista de edición de perfil.<br>Cuando reviso los campos de nombres oficiales, apellidos y número de documento (DNI).<br>Entonces estos campos se encuentran en modo de solo lectura, impidiendo su edición directa. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Clic en avatar superior -> Clic en 'Mi perfil' -> Cambia celular a '987654321' -> Clic en 'Actualizar' -> Validación regex local -> Envío PATCH a /api/usuario/perfil -> Toast flotante verde 'Perfil actualizado exitosamente'.<br><br>Flujo Escenario 2: Abre /plataforma/cuenta/perfil -> Hace clic sobre el campo 'DNI' -> El cursor muestra ícono de prohibido -> El atributo readonly impide escritura -> Tooltip informa: 'Para modificar su DNI comuníquese con RRHH'. |

---

### HU-04: Administración Centralizada de Cuentas de Usuario

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-04** — *Administración Centralizada de Cuentas de Usuario*<br>*(Fase: Fase 1: Seguridad y Cuentas)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/seguridad/usuarios`<br>`/plataforma/seguridad/usuarios` *(modal alta)*<br>`/plataforma/seguridad/usuarios` *(detalle [id])*<br>`/plataforma/organizacion/departamentos/supervisores` |
| **Columna 3: Flujo de Negocio ITIL v4** | Ciclo de Vida de Identidades (Identity Governance): Altas, consultas y modificaciones de personal institucional garantizando unicidad de identidad laboral y asignación al departamento empresarial correspondiente. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Administrador accede a 'Seguridad e Identidades' -> 2. Clic en 'Gestión de usuarios' (/plataforma/seguridad/usuarios) -> 3. Clic en 'Nuevo Usuario' -> 4. Completa formulario de alta con DNI, nombres y correo -> 5. Selecciona departamento -> 6. POST a base de datos -> 7. Retorno a la tabla de usuarios con la nueva fila. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Alta exitosa de nuevo usuario<br>Dado que ingreso al sistema como Administrador institucional en el catálogo maestro de usuarios.<br>Cuando registro un nuevo usuario con nombres, DNI único, departamento empresarial y correo corporativo.<br>Entonces el sistema crea la cuenta en estado activo y le asigna el perfil base de Solicitante.<br><br>Escenario 2: Detección de DNI duplicado<br>Dado que ingreso al sistema como Administrador institucional en el formulario de registro de usuario.<br>Cuando intento registrar un colaborador con un DNI que ya pertenece a otro usuario registrado.<br>Entonces el sistema detiene el guardado y resalta el campo en conflicto con una alerta de duplicidad. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Navega a /plataforma/seguridad/usuarios/nuevo -> Ingresa DNI '70819283', nombres 'Juan', apellido 'Pérez', departamento 'Operaciones' -> Clic en 'Registrar' -> BD inserta en tabla usuario con clave hasheada -> Tabla muestra fila de Juan Pérez con estado 'Activo'.<br><br>Flujo Escenario 2: En formulario de nuevo usuario -> Digita DNI existente '12345678' -> Al perder el foco (onBlur) el sistema consulta API -> Respuesta HTTP 409 -> Borde rojo en input con texto: 'El DNI ya se encuentra registrado'. |

---

### HU-05: Provisión Segura de Credenciales Temporales

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-05** — *Provisión Segura de Credenciales Temporales*<br>*(Fase: Fase 1: Seguridad y Cuentas)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/seguridad/usuarios` *(despacho credenciales)*<br>`/plataforma/seguridad/accesos/recertificacion` |
| **Columna 3: Flujo de Negocio ITIL v4** | Aprovisionamiento de Accesos Seguros: Generación de contraseñas de primer uso con política de alta entropía, entrega segura por canal SMTP y registro de auditoría de entrega. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Administrador selecciona usuario en /plataforma/seguridad/usuarios -> 2. Abre modal o vista de emisión de credenciales -> 3. Sistema genera clave temporal de 12 caracteres -> 4. Opción de enviar por correo o copiar al portapapeles -> 5. Se marca flag de cambio obligatorio en el próximo login -> 6. Registro en bitácora. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Despacho automático vía correo<br>Dado que ingreso al sistema como Administrador institucional tras crear la cuenta de un nuevo colaborador.<br>Cuando ejecuto la acción de emisión de credenciales temporales.<br>Entonces el servidor genera una clave aleatoria compleja y despacha la notificación con el enlace de inicio de sesión.<br><br>Escenario 2: Copiado seguro en consola<br>Dado que ingreso al sistema como Administrador institucional en el diálogo de confirmación de cuenta.<br>Cuando presiono el botón de copiar credencial.<br>Entonces el sistema transfiere el valor al portapapeles local y presenta un mensaje visual confirmando la operación. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Modal de credenciales -> Presiona 'Despachar por correo' -> Backend ejecuta transporter nodemailer -> Email enviado al correo personal del colaborador con template formal -> Modal muestra check verde 'Notificación despachada'.<br><br>Flujo Escenario 2: Modal de credenciales -> Presiona botón con ícono de portapapeles -> navigator.clipboard.writeText ejecuta copia -> Mensaje flotante 'Contraseña copiada al portapapeles' visible durante 3 segundos. |

---

### HU-06: Bloqueo Preventivo de Cuentas Comprometidas

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-06** — *Bloqueo Preventivo de Cuentas Comprometidas*<br>*(Fase: Fase 1: Seguridad y Cuentas)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/seguridad/usuarios` *(filtro bloqueados)*<br>`/plataforma/seguridad/seguridad-logs` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Incidentes de Seguridad de la Información (SecOps): Suspensión cautelar de accesos ante sospechas de fuga, pérdida de dispositivo o cese laboral intempestivo. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Supervisor de seguridad abre /plataforma/seguridad/usuarios -> 2. Busca usuario comprometido -> 3. Accede a opciones avanzadas -> 4. Selecciona 'Bloquear Cuenta Preventivamente' -> 5. Ingresa motivo de seguridad -> 6. BD actualiza cuenta_bloqueada=true y revoca tokens JWT -> 7. Logs registran evento. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Bloqueo inmediato y cierre de sesión<br>Dado que ingreso al sistema como Supervisor de seguridad en el expediente de un colaborador en investigación.<br>Cuando activo la casilla de bloqueo de cuenta por riesgo de seguridad.<br>Entonces la cuenta cambia a estado bloqueado y cualquier sesión web activa del usuario se destruye inmediatamente.<br><br>Escenario 2: Justificación obligatoria de bloqueo<br>Dado que ingreso al sistema como Supervisor de seguridad en el proceso de suspensión de una cuenta.<br>Cuando confirmo el bloqueo en la plataforma.<br>Entonces el sistema me exige registrar obligatoriamente una justificación técnica que queda guardada en auditoría. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Clic en 'Bloquear acceso' -> Confirma diálogo -> Backend invalida registros en usuario -> Usuario afectado navega en otra pestaña -> Siguiente petición fetch responde HTTP 401 -> Es expulsado a la pantalla /login.<br><br>Flujo Escenario 2: Intenta confirmar diálogo de bloqueo dejando el área de texto vacía -> El botón de confirmación permanece deshabilitado -> Texto de advertencia: 'Debe justificar el bloqueo preventivo para efectos de auditoría'. |

---

### HU-07: Asignación de Perfiles RBAC Institucionales

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-07** — *Asignación de Perfiles RBAC Institucionales*<br>*(Fase: Fase 2: Gobernanza RBAC)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/seguridad/perfiles`<br>`/plataforma/seguridad/perfiles` *(edición [id])*<br>`/api/auth/cambiar-perfil`<br>`/api/auth/seleccionar-perfil` |
| **Columna 3: Flujo de Negocio ITIL v4** | Control de Acceso Basado en Roles (RBAC): Asignación de atribuciones operativas (Administrador, Técnico, Gestor de Cambios, etc.) según las responsabilidades del colaborador en la organización. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Administrador abre /plataforma/seguridad/perfiles -> 2. Selecciona usuario o rol -> 3. Marca casillas de perfiles autorizados (1 a 10) -> 4. POST a tabla usuario_perfiles -> 5. Usuario al iniciar sesión o conmutar rol recibe token JWT con claims actualizados -> 6. Capacidades actualizadas. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Concesión de perfil técnico<br>Dado que ingreso al sistema como Administrador institucional en el panel de privilegios de un colaborador.<br>Cuando selecciono el perfil 'Técnico de Soporte' y confirmo la asignación.<br>Entonces la cuenta recibe inmediatamente las capacidades para visualizar tickets de la mesa y registrar comentarios técnicos.<br><br>Escenario 2: Protección contra autoeliminación de perfil admin<br>Dado que ingreso al sistema como Administrador institucional editando mi propio usuario.<br>Cuando intento desmarcar mi propio perfil de Administrador dejándome sin acceso de gestión.<br>Entonces el sistema bloquea la acción con una advertencia impidiendo que la plataforma quede sin administradores. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Selecciona colaborador 'Roberto' -> Marca checkbox 'Técnico' -> Guarda cambios -> Roberto refresca navegador -> En su cabecera aparece la consola 'Mesa Técnica' y el selector de rol.<br><br>Flujo Escenario 2: Admin con id_usuario=1 edita su cuenta -> Desmarca 'Administrador' -> Clic en guardar -> API valida (id_usuario === sesion.id && desmarcandoAdmin) -> Responde HTTP 403 con 'No puede revocar su propio rol de administrador'. |

---

### HU-08: Navegación Segura según Matriz de Privilegios

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-08** — *Navegación Segura según Matriz de Privilegios*<br>*(Fase: Fase 2: Gobernanza RBAC)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/operacion/paneles/solicitante`<br>`/plataforma/operacion/paneles/tecnico`<br>`/plataforma/operacion/paneles/supervisor`<br>`/plataforma/operacion/paneles/administrador`<br>`/plataforma/operacion/paneles/auditor`<br>`/plataforma/operacion/paneles/gestor-area`<br>`/plataforma/operacion/paneles/aprobador`<br>`/plataforma/operacion/paneles/gestor-cambios`<br>`/plataforma/operacion/paneles/gestor-activos`<br>`/plataforma/operacion/paneles/gestor-problemas` |
| **Columna 3: Flujo de Negocio ITIL v4** | Principio de Menor Privilegio (PoLP): Garantiza que cada rol visualice exclusivamente las consolas y datos vinculados a su jurisdicción laboral, ocultando información reservada o sensible. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Usuario inicia sesión con su perfil activo -> 2. Layout raíz consulta /api/menu filtrado por id_perfil -> 3. Sidebar renderiza solo ramas autorizadas -> 4. Si el usuario tipea una URL no permitida, el middleware evalúa permisos -> 5. Redirección o denegación HTTP 403. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Filtro para Solicitante<br>Dado que ingreso al sistema como Solicitante de autoservicio.<br>Cuando se carga la barra lateral de opciones de navegación.<br>Entonces únicamente visualizo las opciones de Catálogo de Servicios y Mis Tickets, permaneciendo ocultos los módulos administrativos.<br><br>Escenario 2: Conmutación de perfil activo<br>Dado que ingreso al sistema como Usuario con perfiles combinados de Técnico y Supervisor.<br>Cuando utilizo el selector de rol activo en el encabezado de la plataforma.<br>Entonces el menú se reconstruye instantáneamente reflejando las opciones del perfil conmutado sin cerrar mi sesión. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Login con cuenta 'solicitante.e2e@empresa.com' -> Carga /plataforma/operacion/paneles/solicitante -> Sidebar muestra 2 grupos: 'Catálogo de Servicios' y 'Mis Tickets' -> Rutas de /plataforma/seguridad o /cmdb no existen en el DOM.<br><br>Flujo Escenario 2: Usuario abre dropdown de roles en el header -> Elige 'Supervisor' -> Llamada POST a /api/auth/cambiar-perfil con {id_perfil: 4} -> Servidor emite nuevo token -> Sidebar se recarga mostrando 'Consola de Supervisión' y 'Métricas SLA'. |

---

### HU-09: Catálogo Maestro de Opciones de Menú

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-09** — *Catálogo Maestro de Opciones de Menú*<br>*(Fase: Fase 2: Gobernanza RBAC)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/operacion/menu`<br>`/plataforma/operacion/menu`<br>`/api/menu`<br>`/api/menu/admin` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gobernanza del Mapa de Navegación del Sistema: Administración centralizada del árbol jerárquico de 229 opciones de menú, vinculación con URLs canónicas y asignación masiva a perfiles. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Administrador abre /plataforma/operacion/menu -> 2. Carga árbol de navegación (carpetas y hojas) -> 3. Puede editar orden, nombre, descripción o activar/inactivar opciones -> 4. Asigna qué perfiles tienen acceso a cada nodo -> 5. Cambios guardados en opciones_menu y opciones_menu_perfiles. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Verificación de rutas activas<br>Dado que ingreso al sistema como Administrador institucional en el visor de opciones de menú.<br>Cuando consulto las opciones activas de la plataforma.<br>Entonces cada entrada del árbol de menú corresponde exactamente con una ruta canónica y funcional del sistema.<br><br>Escenario 2: Inactivación de opción obsoleta<br>Dado que ingreso al sistema como Administrador institucional en el mantenimiento del menú.<br>Cuando desactivo una opción que se encuentra en desuso o en migración.<br>Entonces desaparece de las barras de navegación de todos los roles sin afectar los datos históricos asociados. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Navega a /plataforma/operacion/menu -> Árbol despliega 13 raíces y 197 hojas con badges verdes -> Clic en 'Reportes gerenciales' (/plataforma/reportes/gerenciales) -> Verifica vínculo directo sin error 404.<br><br>Flujo Escenario 2: En la fila de una opción -> Hace switch de 'Activo' a 'Inactivo' -> Envío PATCH a /api/menu/admin/[id] -> Recarga de menú -> La opción ya no es visible para ningún rol. |

---

### HU-10: Auditoría Forense de Sesiones de Usuario

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-10** — *Auditoría Forense de Sesiones de Usuario*<br>*(Fase: Fase 2: Gobernanza RBAC)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/seguridad/auditoria-sistema`<br>`/plataforma/operacion/salud-sistema`<br>`/plataforma/reportes/auditoria` |
| **Columna 3: Flujo de Negocio ITIL v4** | Supervisión y Seguridad de la Operación (SecOps / Compliance): Registro inmutable de actividad de sesión, detección de accesos remotos sospechosos y trazabilidad forense para auditoría SOX. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Auditor accede a /plataforma/seguridad/auditoria-sistema -> 2. Filtra por rango de fechas o usuario específico -> 3. Visualiza bitácora con IP, user-agent, timestamp y acción ejecutada -> 4. Puede exportar informe en PDF/Excel para dictamen de cumplimiento. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Búsqueda de accesos por rango de fechas e IP<br>Dado que ingreso al sistema como Auditor de seguridad en el visor de sesiones.<br>Cuando filtro por la dirección IP de una sucursal remota durante los últimos 7 días.<br>Entonces el sistema lista ordenadamente las sesiones iniciadas, los usuarios involucrados y el estado de la conexión.<br><br>Escenario 2: Alerta de conexiones concurrentes sospechosas<br>Dado que ingreso al sistema como Auditor de seguridad en el panel de auditoría en tiempo real.<br>Cuando una misma cuenta inicia sesión desde dos direcciones IP de diferentes rangos en menos de 5 minutos.<br>Entonces el sistema emite una alerta de bandera roja en la bitácora de eventos de seguridad. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Abre filtros -> Ingresa IP '192.168.10.45' y rango '2026-10-15 a 2026-10-22' -> Clic en 'Filtrar' -> Tabla muestra 12 registros de inicio de sesión con timestamps exactos y perfil ejercido.<br><br>Flujo Escenario 2: Tabla de auditoría resalta fila en rojo con ícono de advertencia -> Detalle indica: 'Alerta SoD: Sesión iniciada en Lima y Trujillo en simultáneo'. |

---

### HU-11: Estructura de Departamentos Empresariales

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-11** — *Estructura de Departamentos Empresariales*<br>*(Fase: Fase 3: Organización TI y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/organizacion/departamentos-empresa`<br>`/plataforma/organizacion/departamentos-empresa` *(modal [id])*<br>`/api/departamentos-empresa` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión Organizacional: Definición de centros de costos y áreas operativas de la compañía (Finanzas, Ventas, TI, Legal) que solicitan servicios de tecnología y requieren aprobaciones de jefatura. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Administrador abre /plataforma/organizacion/departamentos-empresa -> 2. Clic en 'Nuevo Departamento' -> 3. Ingresa nombre, código contable y designa jefatura aprobatoria -> 4. Guarda en base de datos -> 5. Se habilita para asignación de colaboradores. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Registro de nuevo departamento<br>Dado que ingreso al sistema como Administrador institucional en el módulo de estructura organizativa.<br>Cuando registro el departamento de 'Finanzas y Contabilidad' asignando a su respectivo gerente aprobador.<br>Entonces el departamento queda registrado y disponible para la vinculación de colaboradores y solicitudes.<br><br>Escenario 2: Restricción de eliminación con personal activo<br>Dado que ingreso al sistema como Administrador institucional en la lista de áreas corporativas.<br>Cuando intento eliminar un departamento que tiene colaboradores asignados.<br>Entonces el sistema rechaza la eliminación e indica que se deben reubicar los usuarios antes de retirar el área. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En formulario de departamento -> Digita 'Finanzas', código 'DEP-FIN-01', selecciona usuario aprobador -> Presiona 'Guardar' -> BD inserta en departamento_empresa -> Lista muestra la nueva área activa.<br><br>Flujo Escenario 2: Clic en botón eliminar de 'Operaciones' (tiene 14 colaboradores) -> Sistema evalúa FK en tabla usuario -> Error modal: 'No se puede eliminar: el departamento contiene 14 usuarios vinculados'. |

---

### HU-12: Configuración de Grupos Resolutores de TI

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-12** — *Configuración de Grupos Resolutores de TI*<br>*(Fase: Fase 3: Organización TI y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/organizacion/departamentos/supervisores`<br>`/plataforma/organizacion/departamentos/supervisores`<br>`/plataforma/organizacion/tecnicos`<br>`/plataforma/tickets/gestion/asignar` |
| **Columna 3: Flujo de Negocio ITIL v4** | Estructura de Soporte Técnico (Service Desk): Organización de especialistas en niveles resolutores (Mesa N1, Infraestructura, Telecomunicaciones, Base de Datos) con sus respectivos supervisores técnicos. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Supervisor abre /plataforma/organizacion/departamentos-ti -> 2. Crea o edita grupo resolutor -> 3. Asigna supervisor a cargo -> 4. Agrega técnicos especialistas -> 5. Guarda cambios -> 6. Los tickets categorizados para ese dominio se enrutan a este grupo. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Incorporación de técnico a grupo de Redes<br>Dado que ingreso al sistema como Supervisor de mesa de ayuda en el gestor de grupos técnicos.<br>Cuando incorporo a un técnico al grupo de 'Comunicaciones y Conectividad'.<br>Entonces el técnico pasa a formar parte de la bandeja de entrada técnica de conectividad y puede autoasignarse casos de red.<br><br>Escenario 2: Asignación de supervisor responsable por grupo<br>Dado que ingreso al sistema como Supervisor de mesa de ayuda en la edición de un grupo resolutor.<br>Cuando establezco al supervisor titular de la unidad de Soporte Nivel 1.<br>Entonces las alertas por incidentes críticos y vencimientos de SLA de ese grupo se dirigen a dicho supervisor. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Selecciona grupo 'Redes y Telecom' -> Abre pestaña 'Técnicos' -> Clic en 'Agregar' -> Elige 'Roberto Técnico' -> Guarda -> Roberto ingresa a su consola técnica y visualiza los tickets del grupo Redes.<br><br>Flujo Escenario 2: Edita grupo 'Soporte N1' -> Selector de supervisor -> Elige 'Sofía Supervisor' -> Guarda en departamento_ti.id_supervisor -> Incidentes P1 del grupo envían correo inmediato a Sofía. |

---

### HU-13: Planificación de Turnos de Soporte Técnico

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-13** — *Planificación de Turnos de Soporte Técnico*<br>*(Fase: Fase 3: Organización TI y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/operacion/agenda`<br>`/plataforma/organizacion/turnos-ausencias`<br>`/plataforma/operacion/tareas` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Capacidad y Fuerza Laboral (Workforce Management): Planificación de turnos de guardia, horarios de cobertura y guardias pasivas para asegurar la atención continua del Service Desk. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Supervisor ingresa a /plataforma/operacion/agenda -> 2. Visualiza cuadrícula semanal de turnos -> 3. Asigna técnicos a franjas horarias (Mañana, Tarde, Noche) -> 4. Sistema calcula capacidad de atención por franja -> 5. Técnico consulta su horario en su consola. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Asignación de turno de guardia diurno<br>Dado que ingreso al sistema como Supervisor de operaciones en el calendario de turnos.<br>Cuando programo a un técnico para la franja diurna de lunes a viernes de 08:00 a 17:00.<br>Entonces el sistema actualiza el horario hábil del técnico y habilita la recepción de tickets en su bandeja.<br><br>Escenario 2: Advertencia de descobertura en horario operativo<br>Dado que ingreso al sistema como Supervisor de operaciones planificando la semana laboral.<br>Cuando un turno queda sin ningún técnico activo asignado.<br>Entonces el sistema emite una alerta visual en el calendario señalando la franja descubierta. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En calendario semanal -> Arrastra tarjeta de 'Roberto' al turno mañana (8-17h) -> Sistema registra en agenda_guardias -> Roberto abre su app y ve su calendario operativo actualizado.<br><br>Flujo Escenario 2: Franja de sábado 14:00-22:00 sin técnicos asignados -> Celda del calendario se tiñe de rojo con ícono de advertencia -> Tooltip alerta: 'Franja crítica sin resolutores'. |

---

### HU-14: Control de Ausencias en Mesa de Ayuda

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-14** — *Control de Ausencias en Mesa de Ayuda*<br>*(Fase: Fase 3: Organización TI y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/operacion/equipo/ausencias`<br>`/plataforma/organizacion/equipo/ausencias`<br>`/plataforma/operacion/equipo/vistas` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Disponibilidad del Personal: Registro y aprobación de vacaciones, descansos médicos y comisiones de servicio, previniendo asignaciones a técnicos que no están en su puesto. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Técnico accede a /plataforma/operacion/equipo/ausencias -> 2. Registra solicitud de descanso médico con rango de fechas -> 3. Notificación al supervisor -> 4. Supervisor aprueba -> 5. Estado del técnico pasa a 'Ausente' -> 6. Motor de asignación lo excluye de colas de tickets. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Registro formal de ausencia con fecha de inicio y fin<br>Dado que ingreso al sistema como Técnico de soporte de mesa de ayuda en la sección de mis ausencias.<br>Cuando registro un periodo de vacaciones de 5 días con la debida justificación.<br>Entonces el sistema marca mi estado como no disponible para esas fechas y excluye mi usuario de los repartos automáticos.<br><br>Escenario 2: Reasignación preventiva de tickets pendientes<br>Dado que ingreso al sistema como Supervisor de mesa de ayuda aprobando una ausencia de un técnico.<br>Cuando confirmo la ausencia de un técnico que mantiene 3 tickets en proceso.<br>Entonces la plataforma despliega una ventana de traspaso para reasignar dichos tickets a otro técnico en turno. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Formulario de ausencia -> Selecciona 'Vacaciones', fecha 01/11 al 05/11 -> Clic en 'Solicitar' -> Registro guardado con estado 'Aprobado' -> Durante esos días, el ticket no permite autoasignarse a su nombre.<br><br>Flujo Escenario 2: Supervisor aprueba ausencia -> Modal de confirmación detecta 3 tickets abiertos -> Permite seleccionar técnico de relevo en combo -> Reasigna los 3 tickets en una sola transacción atómica. |

---

### HU-15: Balanceo Automático de Carga de Técnicos

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-15** — *Balanceo Automático de Carga de Técnicos*<br>*(Fase: Fase 3: Organización TI y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/operacion/desempeno`<br>`/plataforma/tickets/desempeno`<br>`/plataforma/reportes/productividad` |
| **Columna 3: Flujo de Negocio ITIL v4** | Monitoreo de Carga y Productividad: Algoritmo de distribución equitativa de casos basado en la cantidad de tickets activos y cumplimiento individual de SLA. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Supervisor ingresa a /plataforma/operacion/desempeno -> 2. Configura parámetros de carga máxima por técnico (ej. máx 5 tickets P2 en simultáneo) -> 3. Sistema evalúa colas al entrar un nuevo ticket -> 4. Asignación automática al técnico con menor carga disponible. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Reparto por menor carga de trabajo activa<br>Dado que ingreso al sistema como Supervisor de mesa de ayuda con el motor de asignación automática encendido.<br>Cuando ingresa un nuevo ticket de soporte de ofimática al grupo de Mesa Nivel 1.<br>Entonces el algoritmo selecciona al técnico que posea el menor número de tickets abiertos en ese instante y le asigna el caso.<br><br>Escenario 2: Exclusión automática de técnicos ausentes o fuera de turno<br>Dado que ingreso al sistema como Supervisor de mesa de ayuda durante la asignación automática.<br>Cuando se evalúa la lista de técnicos del grupo resolutor.<br>Entonces el motor descarta a los técnicos con ausencias aprobadas o fuera de su franja horaria activa. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Llega ticket INC-102 -> Técnico A tiene 4 tickets, Técnico B tiene 1 ticket -> Algoritmo evalúa MIN(tickets_activos) -> Asigna automáticamente a Técnico B -> Técnico B recibe notificación sonora/push.<br><br>Flujo Escenario 2: Técnico C tiene 0 tickets pero su turno terminó hace 1 hora -> Algoritmo evalúa horario hábil -> Descarta Técnico C -> Asigna al siguiente técnico disponible en turno activo. |

---

### HU-16: Clasificación de Categorías de Servicio

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-16** — *Clasificación de Categorías de Servicio*<br>*(Fase: Fase 4: Catálogo y SLA)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/servicios/configuracion/categorias`<br>`/plataforma/servicios/configuracion/categorias` *(edición [id])*<br>`/api/conocimiento/categorias` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión del Catálogo de Servicios (Service Catalogue Management): Estructuración taxonómica de las 10 categorías maestras ITIL v4, diferenciando fallas de incidentes de solicitudes de provisión. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Administrador abre /plataforma/servicios/configuracion/categorias -> 2. Visualiza las 10 categorías maestras con SLA base y contadores -> 3. Puede editar tiempos base o crear nueva subcategoría -> 4. Los formularios de reporte heredan estos valores. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Consulta completa de categorías diferenciadas<br>Dado que ingreso al sistema como Administrador del catálogo en el módulo de categorías de servicio.<br>Cuando accedo a la vista de configuración del catálogo.<br>Entonces visualizo las 10 categorías maestras con sus insignias de Incidente o Solicitud, tiempos de SLA base y conteo de servicios asociados.<br><br>Escenario 2: Modificación de tiempos base de respuesta y resolución<br>Dado que ingreso al sistema como Administrador del catálogo editando la categoría de Seguridad de la Información.<br>Cuando ajusto el SLA base a 1 hora de respuesta y 2 horas de resolución y guardo.<br>Entonces el sistema actualiza la categoría y aplica los nuevos tiempos para los servicios que hereden dicha regla. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Ingresa a /plataforma/servicios/configuracion/categorias -> Tarjetas marcan 'Total: 10, Incidentes: 4, Solicitudes: 6' -> Tabla lista las 10 categorías con badges de color -> Botones de edición habilitados.<br><br>Flujo Escenario 2: Clic en editar 'Seguridad de la Información' -> Cambia SLA respuesta a 1h y resolución a 2h -> Clic en 'Guardar' -> BD actualiza categoria_ticket -> Fila muestra '1h resp. / 2h resol.'. |

---

### HU-17: Ficha Técnica de Servicios Corporativos

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-17** — *Ficha Técnica de Servicios Corporativos*<br>*(Fase: Fase 4: Catálogo y SLA)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/servicios/catalogo`<br>`/plataforma/servicios` *(ficha [id])*<br>`/plataforma/servicios` *(workflow [id])*<br>`/plataforma/servicios/configuracion/crear`<br>`/plataforma/servicios/configuracion/incidentes`<br>`/plataforma/servicios/configuracion/solicitudes` |
| **Columna 3: Flujo de Negocio ITIL v4** | Definición y Mantenimiento del Catálogo de Servicios: Publicación de la ficha técnica de los 23 servicios corporativos, especificando entregables, tiempos comprometidos y flujos de aprobación. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Administrador abre /plataforma/servicios/catalogo -> 2. Clic en 'Ver Ficha' de un servicio (/plataforma/servicios/[id]) -> 3. Consulta pestañas: General, Tiempos SLA y Flujo de Aprobación (/workflow) -> 4. Puede modificar requisitos o costos referenciales -> 5. Guarda cambios. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Consulta estructurada del catálogo activo<br>Dado que ingreso al sistema como Colaborador institucional en el portal del catálogo.<br>Cuando filtro por la categoría de Usuarios y Accesos.<br>Entonces visualizo los servicios disponibles (creación de cuentas, accesos temporales, buzones) con sus tiempos de entrega y condiciones.<br><br>Escenario 2: Configuración de servicio con aprobación obligatoria<br>Dado que ingreso al sistema como Administrador del catálogo editando la ficha del servicio de Asignación de Laptop Nueva.<br>Cuando marco la opción de requerir aprobación de jefatura de área y guardo la ficha.<br>Entonces cualquier requerimiento generado para este servicio se pondrá automáticamente en estado Pendiente de Aprobación. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En /plataforma/servicios/catalogo -> Clic en chip 'Usuarios y Accesos' -> Lista muestra 5 tarjetas de servicio -> Clic en 'Ver Ficha' de SRV-SOL-ACC-001 -> Despliega entregables y costo referencial $0.00.<br><br>Flujo Escenario 2: En ficha de SRV-SOL-HW-001 -> Pestaña 'Workflow' -> Activa switch 'Requiere Aprobación Jefatura' -> Clic en 'Guardar' -> Solicitud de prueba creada con este servicio inicia con estado 'Pendiente de Aprobación'. |

---

### HU-18: Parametrización de Acuerdos de Nivel de Servicio (SLA)

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-18** — *Parametrización de Acuerdos de Nivel de Servicio (SLA)*<br>*(Fase: Fase 4: Catálogo y SLA)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/servicios/configuracion/sla`<br>`/plataforma/servicios/sla`<br>`/plataforma/servicios/sla/supervisor/escalamientos`<br>`/plataforma/servicios/sla/supervisor/incumplimientos`<br>`/plataforma/servicios/sla/supervisor/semaforo`<br>`/plataforma/servicios/sla/tecnico/objetivos`<br>`/plataforma/servicios/sla/tecnico/semaforo` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Niveles de Servicio (Service Level Management): Parametrización de matrices de tiempo límite para respuesta y solución, fijando los umbrales semafóricos que rigen a la mesa. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor SLA abre /plataforma/servicios/configuracion/sla -> 2. Configura tiempos por tipo de servicio y prioridad (P1=2h, P2=8h, P3=24h, P4=48h) -> 3. Define umbrales de alerta (75% verde a ámbar, 90% rojo) -> 4. Los cronómetros en consolas técnicas reflejan estos tiempos. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Registro de matriz de SLA por prioridad<br>Dado que ingreso al sistema como Gestor de niveles de servicio en la matriz de compromisos SLA.<br>Cuando defino que un incidente P1 Crítico tiene máximo 15 minutos de respuesta y 2 horas de resolución.<br>Entonces el motor de cálculo de tiempos asume estos valores como límite para todos los incidentes clasificados en P1.<br><br>Escenario 2: Validación de coherencia de tiempos<br>Dado que ingreso al sistema como Gestor de niveles de servicio configurando los parámetros de un servicio.<br>Cuando intento ingresar un tiempo de primera respuesta superior al tiempo de resolución total.<br>Entonces el sistema rechaza el valor indicando que el tiempo de respuesta no puede exceder el límite de resolución. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En /plataforma/servicios/sla/matriz -> Fila P1 -> Ingresa '0.25' en respuesta y '2' en resolución -> Clic en guardar -> Incidente P1 creado a las 10:00 fija fecha_limite_resolucion a las 12:00 del mismo día.<br><br>Flujo Escenario 2: Intenta poner 10 horas de respuesta y 4 horas de resolución -> Validación frontend muestra alerta roja: 'El tiempo de respuesta no puede superar al de resolución' -> Botón guardar queda deshabilitado. |

---

### HU-19: Priorización ITIL según Matriz Impacto-Urgencia

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-19** — *Priorización ITIL según Matriz Impacto-Urgencia*<br>*(Fase: Fase 4: Catálogo y SLA)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/servicios/sla`<br>`/plataforma/servicios/sla`<br>`/plataforma/cambios/configuracion` *(cuestionario riesgo)* |
| **Columna 3: Flujo de Negocio ITIL v4** | Evaluación y Priorización Objetiva: Algoritmo bidimensional que cruza Urgencia (velocidad con la que el negocio requiere solución) e Impacto (amplitud del daño o cantidad de usuarios afectados) para determinar la Prioridad ITIL. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Usuario o técnico abre formulario de ticket -> 2. Selecciona selector de Impacto (Alto, Medio, Bajo) -> 3. Selecciona selector de Urgencia (Alto, Medio, Bajo) -> 4. Script evalúa matriz 3x3 en tiempo real -> 5. Campo de Prioridad se calcula automáticamente (P1 a P4) y se bloquea. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Cálculo automático de Incidente Crítico P1<br>Dado que ingreso al sistema como Técnico de soporte registrando una falla en la plataforma principal de pagos.<br>Cuando selecciono Impacto Alto (afecta a toda la empresa) y Urgencia Alta (el servicio está completamente detenido).<br>Entonces el sistema clasifica de forma automática e inmediata el ticket con Prioridad P1 Crítica.<br><br>Escenario 2: Bloqueo de alteración manual de prioridad<br>Dado que ingreso al sistema como Solicitante de autoservicio creando un ticket para una consulta menor.<br>Cuando selecciono Impacto Bajo y Urgencia Baja.<br>Entonces el sistema fija la prioridad en P4 Baja sin permitir forzar un nivel superior sin elevar el impacto. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En formulario de incidente -> Combo Impacto = 'Alto', Combo Urgencia = 'Alto' -> Evento onChange dispara función calcularPrioridadITIL -> Badge de prioridad cambia de gris a rojo 'P1 - Crítica' con ícono de fuego.<br><br>Flujo Escenario 2: En formulario solicitante -> Impacto = 'Bajo', Urgencia = 'Bajo' -> Prioridad marca 'P4 - Baja' -> El usuario intenta hacer clic sobre el selector de Prioridad -> El input se encuentra deshabilitado (disabled). |

---

### HU-20: Calendario Laboral de Feriados Corporativos

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-20** — *Calendario Laboral de Feriados Corporativos*<br>*(Fase: Fase 4: Catálogo y SLA)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/cambios/configuracion/notificaciones-calendario?vista=feriados`<br>`/plataforma/cambios/configuracion/notificaciones-calendario?vista=congelamiento`<br>`/plataforma/cambios/configuracion/notificaciones-calendario?vista=ventanas`<br>`/plataforma/avisos/mantenimientos` |
| **Columna 3: Flujo de Negocio ITIL v4** | Cálculo Preciso de SLA en Días Hábiles: Exclusión de días no laborables, feriados oficiales y horas fuera de cobertura en el conteo de tiempo transcurrido de los compromisos de servicio. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor de operaciones abre /plataforma/cambios/configuracion/notificaciones-calendario?vista=feriados -> 2. Registra los feriados oficiales del año -> 3. Define horarios hábiles (Lun-Vie 8-18h) -> 4. Motor de cálculo de SLA utiliza estos parámetros para fijar fechas de vencimiento. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Pausa de cronómetro fuera de horario hábil<br>Dado que ingreso al sistema como Supervisor de mesa de ayuda consultando un ticket P3 ingresado un viernes a las 17:50.<br>Cuando llega el horario de cierre operativo a las 18:00.<br>Entonces el cronómetro de SLA se congela y reanuda su conteo el lunes a las 08:00 sin incurrir en mora.<br><br>Escenario 2: Carga de feriados en calendario<br>Dado que ingreso al sistema como Gestor de niveles de servicio en la configuración del calendario anual.<br>Cuando registro los feriados nacionales del calendario oficial.<br>Entonces el sistema omite dichos días en los cálculos de vencimiento de todos los tickets activos. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Ticket creado viernes 17:50 con 2h de SLA -> 10 min consumidos el viernes -> Sistema calcula fecha límite para el lunes a las 09:50 -> El sábado el estado del SLA muestra 'En pausa: Fuera de horario'.<br><br>Flujo Escenario 2: Clic en 'Nuevo Feriado' -> Registra '28 de Julio - Fiestas Patrias' -> Ticket con SLA de 24 horas generado el 27 de julio salta automáticamente el 28 y vence el 29 de julio. |

---

### HU-21: Reporte Asistido de Incidente Operativo

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-21** — *Reporte Asistido de Incidente Operativo*<br>*(Fase: Fase 5: Incidentes y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/incidentes/catalogo`<br>`/plataforma/tickets/mesa/registrar`<br>`/plataforma/incidentes/crear`<br>`/plataforma/tickets/gestion/crear`<br>`/plataforma/tickets/configuracion/formularios` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Incidentes (Incident Management): Captura formal de eventos no planificados que degradan o interrumpen un servicio de TI, canalizando la falla hacia la mesa de ayuda. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Colaborador ingresa a /plataforma/incidentes/reportar -> 2. Selecciona servicio afectado de la lista -> 3. Describe el problema y adjunta captura -> 4. Sistema calcula prioridad -> 5. Se crea el ticket en BD con código INC-XXXX -> 6. Notificación por correo al usuario. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Reporte exitoso con código correlativo<br>Dado que ingreso al sistema como Solicitante institucional en el formulario de incidentes.<br>Cuando selecciono el servicio de Conectividad VPN, detallo el mensaje de error y confirmo el envío.<br>Entonces el sistema registra el incidente en estado Nuevo, genera un código correlativo único INC-XXXX y me envía confirmación al correo.<br><br>Escenario 2: Validación de adjuntos seguros<br>Dado que ingreso al sistema como Solicitante institucional adjuntando una captura de pantalla al reporte.<br>Cuando subo un archivo en formato PNG o PDF de hasta 5 megabytes.<br>Entonces el sistema valida la extensión y el contenido del archivo, vinculándolo de forma segura al ticket. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En /plataforma/incidentes/reportar -> Selecciona 'VPN', título 'Falla de conexión sede central', adjunta log -> Clic en 'Enviar Reporte' -> Backend genera 'INC-2026-0042' -> Pantalla redirige a la vista de seguimiento con mensaje verde de éxito.<br><br>Flujo Escenario 2: Intenta subir archivo 'virus.exe' -> Validador de tipo MIME detecta extensión no permitida -> Alerta en formulario: 'Formato no permitido. Solo se aceptan imágenes (PNG, JPG) o documentos PDF'. |

---

### HU-22: Consola Técnica de Incidentes con Indicadores SLA

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-22** — *Consola Técnica de Incidentes con Indicadores SLA*<br>*(Fase: Fase 5: Incidentes y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/tickets/mesa/asignados`<br>`/plataforma/incidentes/asignados`<br>`/plataforma/tickets/mesa/pendientes`<br>`/plataforma/tickets/gestion/bandeja`<br>`/plataforma/tickets/mesa/buscar` |
| **Columna 3: Flujo de Negocio ITIL v4** | Operación de Service Desk: Visualización y ordenamiento de la cola de incidentes por tiempo restante de SLA para priorizar la atención de las fallas más urgentes. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Técnico accede a /plataforma/incidentes/mesa -> 2. Visualiza tabla interactiva con tickets de su grupo -> 3. Las filas muestran semáforos de SLA en tiempo real -> 4. Filtra por estado o prioridad -> 5. Hace clic en un ticket para abrir su consola de atención. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Alerta visual de incidente próximo a vencer<br>Dado que ingreso al sistema como Técnico de soporte en mi bandeja de trabajo técnico.<br>Cuando un incidente asignado consume más del 75% del tiempo establecido por el SLA.<br>Entonces el indicador de tiempo restante cambia a color naranja de advertencia y sitúa el ticket en los primeros lugares de la lista.<br><br>Escenario 2: Filtrado por incidentes sin asignar<br>Dado que ingreso al sistema como Técnico de soporte revisando los casos entrantes.<br>Cuando aplico el filtro de 'Sin asignar' para mi grupo resolutor.<br>Entonces la tabla muestra únicamente los tickets disponibles para ser tomados por los miembros del equipo. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En /plataforma/incidentes/mesa -> Ticket INC-10 con 15 minutos restantes -> Cronómetro titila en naranja -> Alarma visual en la esquina del renglón -> El ticket se fija en la parte superior.<br><br>Flujo Escenario 2: Clic en pestaña 'Sin Asignar' -> Petición GET con ?estado=NUEVO&sin_asignar=true -> Tabla renderiza 3 tickets disponibles con botón azul 'Tomar Ticket'. |

---

### HU-23: Autoasignación de Incidentes en Mesa

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-23** — *Autoasignación de Incidentes en Mesa*<br>*(Fase: Fase 5: Incidentes y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/tickets/mesa/pendientes`<br>`/plataforma/operacion/tecnico`<br>`/api/tickets/mesa/tomar`<br>`/plataforma/incidentes/[id]` |
| **Columna 3: Flujo de Negocio ITIL v4** | Triaje y Toma de Responsabilidad Técnica: Un técnico asume personalmente la propiedad de un ticket disponible, iniciando el cronómetro de atención. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Técnico visualiza ticket sin asignar en /plataforma/incidentes/sin-asignar -> 2. Presiona botón 'Tomar Ticket' -> 3. Envío POST a /api/tickets/mesa/tomar -> 4. Se asigna su id_usuario -> 5. Estado cambia de NUEVO a EN_PROCESO -> 6. Notificación al solicitante. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Toma exitosa de ticket<br>Dado que ingreso al sistema como Técnico de soporte visualizando un incidente en estado Nuevo.<br>Cuando hago clic en el botón de acción 'Tomar Ticket'.<br>Entonces mi nombre queda asignado como técnico responsable, el estado del ticket transiciona a En Proceso y se registra la traza de auditoría.<br><br>Escenario 2: Control de concurrencia<br>Dado que ingreso al sistema como Técnico de soporte intentando tomar un ticket.<br>Cuando otro técnico ha tomado exactamente el mismo ticket milisegundos antes.<br>Entonces el sistema me avisa que el caso ya fue asignado al otro técnico y actualiza mi pantalla evitando la colisión. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Clic en botón 'Tomar' -> API ejecuta UPDATE ticket SET id_usuario_asignado = $1, id_estado = 2 WHERE id_ticket = $2 AND id_usuario_asignado IS NULL -> Respuesta HTTP 200 -> Ticket se mueve a la pestaña 'Mis Asignados'.<br><br>Flujo Escenario 2: Dos técnicos presionan 'Tomar' al mismo segundo -> La BD bloquea la fila por lock pesimista -> El segundo técnico recibe HTTP 409 con 'El ticket ya fue tomado por Carlos Admin' -> La fila desaparece de su vista. |

---

### HU-24: Bitácora Técnica de Comentarios Operativos

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-24** — *Bitácora Técnica de Comentarios Operativos*<br>*(Fase: Fase 5: Incidentes y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/tickets/[id]` *(bitácora comentarios)*<br>`/plataforma/tickets/[id]` *(bitácora comentarios)*<br>`/plataforma/tickets/gestion/auditoria`<br>`/plataforma/tickets/[id]` *(bitácora comentarios)* |
| **Columna 3: Flujo de Negocio ITIL v4** | Documentación y Comunicación Técnica: Registro de hallazgos, pruebas de diagnóstico y soluciones con separación estricta entre notas privadas entre técnicos y notas públicas visibles para el usuario. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Técnico abre detalle de ticket /plataforma/incidentes/[id] -> 2. Accede a sección 'Bitácora' -> 3. Escribe comentario -> 4. Selecciona si es 'Público' o 'Nota Interna Privada' -> 5. Guarda -> 6. Los solicitantes solo ven notas públicas. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Publicación de nota técnica confidencial<br>Dado que ingreso al sistema como Técnico de soporte en la bitácora de un incidente.<br>Cuando publico un apunte marcándolo como 'Nota técnica interna'.<br>Entonces el comentario es visible para los técnicos y supervisores, permaneciendo completamente oculto en la vista del solicitante.<br><br>Escenario 2: Notificación al usuario ante mensaje público<br>Dado que ingreso al sistema como Técnico de soporte escribiendo en la bitácora del ticket.<br>Cuando registro una respuesta pública solicitando más detalles del error al colaborador.<br>Entonces el comentario se publica en la línea de tiempo del ticket y el solicitante recibe un correo con el mensaje del técnico. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En bitácora del ticket -> Escribe 'Se detecta caída de puerto en switch SW-CORE-02' -> Marca switch 'Nota Interna' -> Guarda -> Solicitante abre el ticket desde su portal -> El comentario técnico no aparece en su pantalla.<br><br>Flujo Escenario 2: Técnico escribe 'Favor de reiniciar su computadora y confirmar' -> Marca 'Público' -> Guarda -> Solicitante ve el mensaje en color azul en su stepper y le llega un email con el requerimiento del técnico. |

---

### HU-25: Protocolo de Gestión de Incidentes Mayores P1

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-25** — *Protocolo de Gestión de Incidentes Mayores P1*<br>*(Fase: Fase 5: Incidentes y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/incidentes/mayores`<br>`/plataforma/tickets/incidentes-mayores`<br>`/plataforma/tickets/mesa/incidente-mayor`<br>`/plataforma/operacion/eventos-resiliencia` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Incidentes Mayores (Major Incident Management): Movilización de comités de crisis, apertura de sala técnica de coordinación y emisión de boletines ejecutivos ante caídas críticas del negocio. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Supervisor detecta o recibe incidente crítico P1 -> 2. Presiona botón 'Declarar Incidente Mayor' en la consola -> 3. Sistema abre /plataforma/tickets/mesa/incidente-mayor -> 4. Se habilita sala de crisis virtual -> 5. Notificación prioritaria a la gerencia -> 6. Publicación periódica de estados. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Declaración formal de Incidente Mayor<br>Dado que ingreso al sistema como Supervisor de mesa de ayuda frente a un incidente P1 que afecta al servidor ERP.<br>Cuando presiono la acción de 'Declarar Incidente Mayor'.<br>Entonces el sistema activa el encabezado de alerta de crisis, envía notificaciones prioritarias al comité operativo y abre la sala de seguimiento técnico.<br><br>Escenario 2: Publicación de comunicados en sala de crisis<br>Dado que ingreso al sistema como Supervisor de mesa de ayuda liderando la sala de crisis.<br>Cuando publico un boletín de actualización operacional cada 30 minutos.<br>Entonces los directores y jefes de área suscritos visualizan el avance del restablecimiento en tiempo real. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Clic en 'Declarar Mayor' -> Modal solicita impacto y líder técnico -> Confirma -> Banner rojo parpadea en la plataforma 'SALA DE CRISIS ACTIVA: INC-001' -> Se despachan alertas a directores.<br><br>Flujo Escenario 2: En sala de crisis -> Escribe boletín 'Servicio de base de datos restablecido al 80%' -> Publicar -> Dashboard ejecutivo actualiza el porcentaje de recuperación instantáneamente. |

---

### HU-26: Escalamiento Jerárquico por Incumplimiento de SLA

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-26** — *Escalamiento Jerárquico por Incumplimiento de SLA*<br>*(Fase: Fase 5: Incidentes y Mesa)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/operacion/notificaciones`<br>`/plataforma/operacion/notificaciones`<br>`/plataforma/reportes/operativos` |
| **Columna 3: Flujo de Negocio ITIL v4** | Escalamiento Jerárquico y Funcional: Alertas automáticas a supervisores y reasignación forzosa a especialistas superiores cuando un caso se aproxima a la violación del SLA. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Tarea cron o motor de eventos evalúa tickets abiertos en segundo plano -> 2. Ticket alcanza el 90% del SLA sin respuesta o resolución -> 3. Sistema ejecuta regla de escalamiento -> 4. Se reasigna al supervisor o especialista de nivel superior -> 5. Registro en bitácora de escalamiento. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Escalamiento funcional a segundo nivel<br>Dado que ingreso al sistema como Supervisor de operaciones monitoreando la mesa.<br>Cuando un ticket P2 en manos de Nivel 1 alcanza el 90% del tiempo de resolución sin avances.<br>Entonces el sistema transfiere el ticket al grupo resolutor Nivel 2 y alerta con máxima prioridad al técnico de guardia.<br><br>Escenario 2: Notificación gerencial por ticket vencido<br>Dado que ingreso al sistema como Supervisor de operaciones en el seguimiento de compromisos.<br>Cuando un incidente P1 agota el 100% del SLA de resolución sin cerrarse.<br>Entonces la plataforma emite un reporte formal de incumplimiento a la Gerencia de TI detallando las causas del retraso. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Cron detecta ticket P2 con 18 horas de 20 consumidas -> Dispara trigger de escalamiento -> ticket.id_departamento cambia a 'Soporte N2' -> Notificación por correo con asunto '[URGENTE ESCALADO] Incidente por vencer'.<br><br>Flujo Escenario 2: Ticket P1 llega a 2h 01m -> Estado SLA cambia a 'VENCIDO' -> Se genera informe en /plataforma/reportes/operativos con cálculo de penalización. |

---

### HU-27: Catálogo de Autoservicio de Solicitudes Institucionales

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-27** — *Catálogo de Autoservicio de Solicitudes Institucionales*<br>*(Fase: Fase 6: Solicitudes de Servicio)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/solicitudes/catalogo`<br>`/plataforma/solicitudes/mios`<br>`/plataforma/tickets/gestion/mios`<br>`/plataforma/solicitudes/departamento` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Solicitudes de Servicio (Service Request Management): Portal de peticiones estándar del catálogo (periféricos, permisos, buzones, accesos) con tiempos comprometidos y flujos aprobatorios. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Colaborador entra a /plataforma/solicitudes/catalogo -> 2. Explora categorías o usa buscador predictivo -> 3. Selecciona el servicio deseado -> 4. Clic en 'Solicitar' -> 5. Se abre formulario específico con campos parametrizados. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Búsqueda rápida de servicio<br>Dado que ingreso al sistema como Solicitante institucional en el portal de autoservicio.<br>Cuando escribo 'mouse' o 'laptop' en la barra de búsqueda de servicios.<br>Entonces la interfaz me presenta de inmediato las fichas correspondientes con sus tiempos estimados de entrega y requisitos.<br><br>Escenario 2: Identificación de requerimiento de aprobación<br>Dado que ingreso al sistema como Solicitante institucional explorando las opciones del catálogo.<br>Cuando visualizo un servicio de alto costo o perfil sensible.<br>Entonces la ficha muestra un distintivo ámbar indicando que la petición requerirá visto bueno de mi gerencia. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En buscador escribe 'mouse' -> Filtro reactivo en memoria oculta servicios irrelevantes -> Muestra tarjeta 'Asignación de Accesorios Periféricos y Ergonomía' con tiempo estimado '24 horas'.<br><br>Flujo Escenario 2: Tarjeta de 'Asignación de Laptop Nueva' muestra badge 'Requiere Aprobación' -> Al hacer clic en solicitar, un banner informa: 'Este pedido será enviado a su jefe de área para autorización'. |

---

### HU-28: Captura de Solicitud con Justificación de Negocio

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-28** — *Captura de Solicitud con Justificación de Negocio*<br>*(Fase: Fase 6: Solicitudes de Servicio)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/solicitudes/crear`<br>`/plataforma/solicitudes/configuracion`<br>`/plataforma/tickets/configuracion/vistas?seccion=estados&tipo=solicitud` |
| **Columna 3: Flujo de Negocio ITIL v4** | Formulación de Requerimiento de Servicio: Captura de justificación presupuestal y operativa requerida por auditoría para respaldar la provisión de recursos informáticos. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Colaborador completa formulario en /plataforma/solicitudes/crear -> 2. Ingresa justificación de uso, fecha requerida y especificaciones -> 3. Valida datos -> 4. Envío POST -> 5. Solicitud queda en estado PENDIENTE_APROBACION -> 6. Correo al aprobador del área. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Envío con puesta en cola de aprobación<br>Dado que ingreso al sistema como Solicitante institucional solicitando una licencia de software de diseño.<br>Cuando completo la justificación del proyecto, selecciono mi departamento y confirmo el envío.<br>Entonces la solicitud queda registrada con el código SOL-XXXX en estado Pendiente de Aprobación y se notifica al aprobador.<br><br>Escenario 2: Validación de justificación obligatoria<br>Dado que ingreso al sistema como Solicitante institucional en el formulario de pedido.<br>Cuando intento enviar la solicitud dejando en blanco el campo de justificación de negocio.<br>Entonces el sistema impide el envío y señala el campo en rojo exigiendo documentar el motivo de la petición. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Llena campos de justificación 'Proyecto Marketing Q4' -> Clic en 'Enviar' -> BD guarda en ticket con subtipo SOLICITUD -> Código 'SOL-0015' -> Bandeja del gerente de área recibe el caso.<br><br>Flujo Escenario 2: Deja justificación vacía -> Clic en enviar -> Validación HTML5/React detiene submit -> Borde rojo parpadeante con mensaje 'La justificación de negocio es obligatoria'. |

---

### HU-29: Bandeja Jurisdiccional de Aprobaciones de Área

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-29** — *Bandeja Jurisdiccional de Aprobaciones de Área*<br>*(Fase: Fase 6: Solicitudes de Servicio)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/solicitudes/aprobaciones`<br>`/plataforma/operacion/aprobaciones/historial-area`<br>`/plataforma/solicitudes/area/historial`<br>`/plataforma/seguridad/aprobador/historial` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gobernanza Financiera y Operativa: Evaluación, dictamen formal y registro de firmas de autorización de jefaturas sobre solicitudes de bienes y servicios tecnológicos. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gerente de área ingresa a /plataforma/solicitudes/aprobaciones -> 2. Visualiza requerimientos de los miembros de su departamento -> 3. Abre detalle de solicitud -> 4. Hace clic en 'Aprobar' o 'Rechazar' -> 5. Ingresa comentario de dictamen -> 6. Solicitud pasa a estado APROBADO o RECHAZADO. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Aprobación formal de solicitud<br>Dado que ingreso al sistema como Gestor de área aprobador en mi bandeja de aprobaciones pendientes.<br>Cuando reviso la justificación de compra de un monitor y pulso 'Aprobar Solicitud' agregando mi conformidad.<br>Entonces la solicitud cambia de estado a Aprobado, pasa a la mesa de soporte para su adquisición y se registra mi firma digital en la traza.<br><br>Escenario 2: Rechazo fundamentado de requerimiento<br>Dado que ingreso al sistema como Gestor de área aprobador ante una solicitud no pertinente.<br>Cuando selecciono la opción 'Rechazar' e ingreso el motivo del rechazo.<br>Entonces la solicitud pasa a estado Rechazado, se cierra el flujo y el solicitante recibe la notificación con mis observaciones. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Gestor abre solicitud SOL-20 -> Clic en botón verde 'Aprobar' -> Modal solicita comentario opcional -> Confirma -> ticket_aprobacion.estado pasa a 'APROBADO' -> Ticket se enruta a mesa técnica de soporte para su entrega.<br><br>Flujo Escenario 2: Gestor abre solicitud injustificada -> Clic en botón rojo 'Rechazar' -> Escribe 'No corresponde al rol del colaborador' -> Confirma -> Ticket pasa a estado 'RECHAZADO' -> Flujo cerrado. |

---

### HU-30: Blindaje de Segregación de Funciones en Aprobaciones

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-30** — *Blindaje de Segregación de Funciones en Aprobaciones*<br>*(Fase: Fase 6: Solicitudes de Servicio)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/seguridad/cumplimiento/sod`<br>`/plataforma/operacion/aprobaciones/historial`<br>`/plataforma/seguridad/muestreo` |
| **Columna 3: Flujo de Negocio ITIL v4** | Cumplimiento Normativo (Segregation of Duties - SoD / SOX): Regla de negocio RN-32 que prohíbe taxativamente que un usuario con facultades de aprobación autorice sus propias solicitudes de recursos. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor de área genera una solicitud para sí mismo -> 2. El sistema detecta que id_solicitante === id_aprobador -> 3. Inhabilita botones de dictamen para dicho usuario -> 4. Enruta la aprobación al supervisor inmediato o director de área -> 5. Bitácora SoD certifica cumplimiento. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Bloqueo de autoaprobación de solicitud propia<br>Dado que ingreso al sistema como Gestor de área con facultades de aprobación.<br>Cuando genero una solicitud de equipamiento nuevo a mi propio nombre e intento aprobarla desde mi bandeja.<br>Entonces el sistema inhabilita los botones de decisión para ese ticket específico y despliega una advertencia de conflicto de interés SoD.<br><br>Escenario 2: Canalización a jefatura superior<br>Dado que ingreso al sistema como Gestor de área con una solicitud propia que requiere visto bueno.<br>Cuando el sistema procesa el flujo de autorización.<br>Entonces el ticket se enruta automáticamente hacia la bandeja del superior jerárquico o al auditor designado. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Gestor abre su propia solicitud SOL-33 -> Los botones 'Aprobar' y 'Rechazar' se muestran en gris deshabilitados -> Mensaje informativo: 'Regla SoD RN-32: No puede autorizar sus propios requerimientos'.<br><br>Flujo Escenario 2: Backend detecta id_solicitante = id_aprobador -> Consulta organigrama de jefaturas -> Reasigna id_usuario_aprobador al Director de Finanzas -> Ticket aparece en bandeja del director. |

---

### HU-31: Delegación Temporal de Autoridad de Aprobación

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-31** — *Delegación Temporal de Autoridad de Aprobación*<br>*(Fase: Fase 6: Solicitudes de Servicio)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/solicitudes/area/delegacion`<br>`/plataforma/seguridad/aprobador/delegaciones`<br>`/plataforma/operacion/aprobaciones/delegaciones`<br>`/plataforma/operacion/aprobaciones/delegacion` |
| **Columna 3: Flujo de Negocio ITIL v4** | Continuidad del Flujo de Aprobación: Traspaso legal y temporal de facultades de firma a un suplente acreditado durante periodos de licencia, incapacidad o vacaciones del titular. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Aprobador titular abre /plataforma/solicitudes/area/delegacion -> 2. Clic en 'Crear Delegación' -> 3. Selecciona colaborador delegado y fija rango de fechas -> 4. Sistema otorga permiso temporal -> 5. Las solicitudes entrantes se reflejan en la bandeja del delegado. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Alta de delegación con fecha de caducidad<br>Dado que ingreso al sistema como Gestor de área aprobador antes de iniciar un periodo de vacaciones de 10 días.<br>Cuando elijo a mi coordinador adjunto como delegado temporal fijando la fecha de inicio y retorno.<br>Entonces durante ese periodo las solicitudes de mi área llegan a la bandeja de mi delegado con plena facultad resolutiva.<br><br>Escenario 2: Restitución automática al vencer plazo<br>Dado que ingreso al sistema como Gestor de área aprobador al día siguiente de vencido el plazo de la delegación.<br>Cuando se genera una nueva solicitud en mi departamento.<br>Entonces la delegación se cancela de forma automática y las nuevas autorizaciones retornan exclusivamente a mi cuenta. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Titular configura delegado 'Pedro' del 10 al 20 de noviembre -> Se crea registro en aprobacion_delegacion -> Nueva solicitud SOL-45 notifica a Pedro y aparece en su bandeja de aprobaciones.<br><br>Flujo Escenario 2: Llega 21 de noviembre -> Tarea cron o consulta SQL valida CURRENT_DATE > fecha_fin -> Marca delegación como inactiva -> Nuevas solicitudes vuelven a ingresar a la bandeja del titular. |

---

### HU-32: Formalización de Expediente de Problema Operativo

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-32** — *Formalización de Expediente de Problema Operativo*<br>*(Fase: Fase 7: Problemas y KEDB)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/problemas/gestion` *(modal nuevo)*<br>`/plataforma/problemas/tecnico/nuevo`<br>`/plataforma/problemas/[id]`<br>`/plataforma/problemas/gestion/mayores`<br>`/plataforma/problemas/gestion/panel` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Problemas (Problem Management): Apertura formal de expedientes para investigar las causas subyacentes de incidentes recurrentes y prevenir fallas repetitivas. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor de problemas ingresa a /plataforma/problemas/gestion/nuevo -> 2. Completa formulario de problema con título, descripción y categoría tecnológica -> 3. Asigna especialista líder -> 4. Guarda expediente -> 5. Se genera código PRB-XXXX -> 6. Estado pasa a 'En Investigación'. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Creación con código correlativo PRB<br>Dado que ingreso al sistema como Gestor de problemas de TI en el módulo de registro de problemas.<br>Cuando defino el título del expediente, la categoría tecnológica de infraestructura y asigno al especialista sénior.<br>Entonces el sistema genera el código único PRB-XXXX, sitúa el expediente en estado 'En Investigación' y notifica al técnico encargado.<br><br>Escenario 2: Severidad de Problema Mayor por impacto crítico<br>Dado que ingreso al sistema como Gestor de problemas de TI evaluando un caso recurrente.<br>Cuando establezco que la falla afecta a más de 3 servicios corporativos de forma simultánea.<br>Entonces el sistema clasifica el problema con severidad de Problema Mayor y habilita seguimiento prioritario. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En formulario de registro -> Ingresa 'Degradación de latencia en VPN Fortigate', categoría 'Redes', especialista 'Roberto' -> Clic en 'Crear' -> Sistema genera 'PRB-2026-0005' -> Abre expediente con pestañas de análisis.<br><br>Flujo Escenario 2: Marca checkbox 'Problema Mayor' -> Sistema resalta encabezado en color vino tinto (#be123c) -> Aparece en la sección de Problemas Mayores del panel gerencial. |

---

### HU-33: Vinculación de Incidentes Recurrentes a un Problema

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-33** — *Vinculación de Incidentes Recurrentes a un Problema*<br>*(Fase: Fase 7: Problemas y KEDB)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/problemas/gestion/recurrentes`<br>`/plataforma/problemas/gestion/candidatos`<br>`/plataforma/problemas/tecnico/candidatos`<br>`/plataforma/problemas/configuracion/relaciones`<br>`/plataforma/problemas/configuracion` |
| **Columna 3: Flujo de Negocio ITIL v4** | Detección de Patrones y Agrupación de Fallas: Correlación de tickets de incidentes que comparten síntomas idénticos para analizar conjuntamente la falla estructural de origen. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor abre /plataforma/problemas/gestion/candidatos -> 2. Sistema detecta automáticamente incidentes con mismo código de error o servicio -> 3. Gestor abre expediente PRB -> 4. Pestaña 'Incidentes Vinculados' -> 5. Asocia los tickets candidatos -> 6. Actualiza contador. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Asociación masiva de incidentes similares<br>Dado que ingreso al sistema como Gestor de problemas de TI en la pestaña de incidentes vinculados.<br>Cuando busco y selecciono cuatro incidentes de corte de enlace de fibra óptica ocurridos en el último mes.<br>Entonces los cuatro tickets quedan enlazados al expediente del problema y su contador de incidentes asociados sube a 4.<br><br>Escenario 2: Difusión de avances a tickets vinculados<br>Dado que ingreso al sistema como Gestor de problemas de TI actualizando el estado de un problema en curso.<br>Cuando agrego una nota de progreso sobre el diagnóstico del hardware defectuoso.<br>Entonces la bitácora de cada incidente vinculado refleja el avance para que los técnicos informen a los usuarios afectados. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En expediente PRB-05 -> Pestaña 'Incidentes' -> Clic en 'Vincular' -> Selecciona INC-10, INC-15, INC-22 -> Clic en confirmar -> Tabla muestra los 3 incidentes enlazados con badge 'Vinculado'.<br><br>Flujo Escenario 2: Gestor publica actualización de estado 'Causa identificada: módulo SFP defectuoso' -> Trigger actualiza bitácora en INC-10, INC-15, INC-22 con mensaje automático de Problem Management. |

---

### HU-34: Repositorio de Errores Conocidos (KEDB)

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-34** — *Repositorio de Errores Conocidos (KEDB)*<br>*(Fase: Fase 7: Problemas y KEDB)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/problemas/kedb`<br>`/plataforma/problemas/tecnico/errores-conocidos`<br>`/plataforma/problemas/gestion/conocimiento`<br>`/plataforma/problemas/kedb` |
| **Columna 3: Flujo de Negocio ITIL v4** | Known Error Database (KEDB): Repositorio centralizado de soluciones de contorno (workarounds) comprobadas para mitigar incidentes rápidamente mientras se implementa la solución definitiva. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor de problemas documenta solución temporal en el expediente PRB -> 2. Marca 'Publicar en KEDB' -> 3. Registro se publica en /plataforma/problemas/kedb -> 4. Técnicos en la mesa buscan por síntoma o error -> 5. Aplican el procedimiento de mitigación validado. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Búsqueda y aplicación de workaround oficial<br>Dado que ingreso al sistema como Técnico de soporte atendiendo un incidente con error de conexión en base de datos.<br>Cuando busco en la KEDB por el código de error numérico.<br>Entonces el sistema me presenta el artículo de Error Conocido con el procedimiento paso a paso para reiniciar el servicio de forma segura.<br><br>Escenario 2: Publicación autorizada de nuevo Error Conocido<br>Dado que ingreso al sistema como Gestor de problemas de TI habiendo validado una solución temporal.<br>Cuando activo la casilla de 'Publicar en KEDB' con el detalle del método de mitigación.<br>Entonces el registro pasa a ser accesible para todos los técnicos resolutores de la organización. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Técnico en consola de tickets tipea 'ORA-01033' en buscador KEDB -> Muestra artículo KEDB-008 'Reinicio de tablespace en caliente' -> Técnico sigue pasos y restablece el servicio en 5 minutos.<br><br>Flujo Escenario 2: En expediente PRB-12 -> Pestaña 'Solución Temporal' -> Escribe workaround -> Clic en 'Publicar en KEDB' -> Artículo pasa a estado 'Publicado' con fecha y firma del autor. |

---

### HU-35: Análisis Estructurado de Causa Raíz (RCA)

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-35** — *Análisis Estructurado de Causa Raíz (RCA)*<br>*(Fase: Fase 7: Problemas y KEDB)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/problemas/gestion` *(análisis [id])*<br>`/plataforma/problemas/configuracion/flujo`<br>`/plataforma/problemas/configuracion/formulario`<br>`/plataforma/problemas/configuracion` |
| **Columna 3: Flujo de Negocio ITIL v4** | Root Cause Analysis (RCA): Metodologías sistemáticas de ingeniería (Técnica de los 5 Porqués, Diagrama de Ishikawa de Espina de Pescado) para identificar el fallo raíz en infraestructura, software o procesos. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor abre expediente PRB -> 2. Clic en pestaña 'Análisis RCA' (/plataforma/problemas/[id]/analisis) -> 3. Selecciona método de análisis (5 Porqués o Ishikawa) -> 4. Documenta las causas encadenadas -> 5. Sistema sintetiza la causa raíz fundamental -> 6. Guarda informe técnico. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Encadenamiento guiado de 5 Porqués<br>Dado que ingreso al sistema como Gestor de problemas de TI en la sección de análisis metodológico.<br>Cuando completo los 5 niveles correlativos de causa y efecto documentando cada respuesta técnica.<br>Entonces la plataforma genera un diagrama visual de la cadena causal y extrae la conclusión final de la causa raíz.<br><br>Escenario 2: Clasificación en Diagrama de Ishikawa<br>Dado que ingreso al sistema como Gestor de problemas de TI analizando un incidente de infraestructura.<br>Cuando clasifico los factores contribuyentes en Método, Mano de obra, Maquinaria y Materiales.<br>Entonces el sistema genera el gráfico de espina de pescado para el informe técnico de gerencia. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Formulario 5 Porqués -> Completa nivel 1 al 5 -> Clic en 'Generar Cadena' -> UI dibuja flujo gráfico interactivo conectando cada porqué hasta la causa raíz 'Falta de renovación de certificado SSL'.<br><br>Flujo Escenario 2: Matriz Ishikawa -> Agrega causas en cuadrante 'Tecnología' y 'Procedimiento' -> Sistema renderiza diagrama SVG exportable en PDF para el comité de TI. |

---

### HU-36: Cierre Definitivo de Problema con Validación de Eficacia

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-36** — *Cierre Definitivo de Problema con Validación de Eficacia*<br>*(Fase: Fase 7: Problemas y KEDB)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/problemas/gestion/objetivos`<br>`/plataforma/problemas/supervisor/asignar`<br>`/plataforma/problemas/tecnico/grupo`<br>`/plataforma/problemas/tecnico/asignados` |
| **Columna 3: Flujo de Negocio ITIL v4** | Evaluación de Eficacia de Solución (PIR): Periodo de observación de 30 días para verificar que tras aplicar el cambio correctivo no vuelven a ocurrir incidentes de la misma naturaleza. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor abre problema con solución aplicada -> 2. Selecciona 'Iniciar Periodo de Observación (30 días)' -> 3. El sistema monitorea colas de incidentes -> 4. Si transcurren 30 días sin incidentes vinculados, se habilita el botón 'Cerrar Definitivamente' -> 5. Cierre formal. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Cierre exitoso tras periodo de observación<br>Dado que ingreso al sistema como Gestor de problemas de TI evaluando un problema resuelto hace 30 días.<br>Cuando verifico que no ha ingresado ningún nuevo incidente vinculado al síntoma en dicho lapso.<br>Entonces el sistema autoriza el cierre formal definitivo del expediente y archiva el caso en los registros históricos de calidad.<br><br>Escenario 2: Reapertura ante reincidencia de falla<br>Dado que ingreso al sistema como Gestor de problemas de TI con un expediente en periodo de observación.<br>Cuando un técnico vincula un nuevo incidente idéntico ocurrido dentro de la ventana de prueba.<br>Entonces la plataforma cancela la pre-resolución, devuelve el problema a estado 'En Investigación' y alerta al equipo técnico. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Problema PRB-02 cumplió 30 días en observación -> Contador de reincidencias marca 0 -> Botón 'Cerrar Definitivamente' se habilita en verde -> Clic -> Estado pasa a 'CERRADO'.<br><br>Flujo Escenario 2: En día 12 de observación se vincula INC-99 con misma falla -> Sistema emite alerta de reincidencia -> Estado del problema retrocede a 'EN_INVESTIGACION' y notifica al líder técnico. |

---

### HU-37: Registro de Solicitud de Cambio (RFC)

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-37** — *Registro de Solicitud de Cambio (RFC)*<br>*(Fase: Fases Futuras: Gestión de Cambios)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/cambios/gestion/crear`<br>`/plataforma/cambios/gestion/evaluacion`<br>`/plataforma/cambios/gestion/todos`<br>`/plataforma/cambios/tecnico/mis-cambios`<br>`/plataforma/cambios/configuracion/formulario`<br>`/plataforma/cambios/configuracion/tipos-requisitos` |
| **Columna 3: Flujo de Negocio ITIL v4** | Habilitación del Cambio (Change Enablement): Registro formal de una Solicitud de Cambio (RFC) vinculada a un Problema con plan de implementación, pruebas y marcha atrás (rollback). |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor o técnico accede a /plataforma/cambios/gestion/crear -> 2. Selecciona tipo de cambio (Estándar, Normal, Emergencia) -> 3. Vincula el problema origen -> 4. Detalla plan de implementación y plan de reversa -> 5. Envía RFC -> 6. Estado pasa a 'En Evaluación CAB'. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Registro formal de cambio normal<br>Dado que ingreso al sistema como Gestor de cambios de TI en el formulario de registro de RFC.<br>Cuando completo los planes de ejecución, plan de marcha atrás y vinculo los servidores afectados.<br>Entonces la RFC queda registrada en estado 'En Evaluación CAB' para su posterior dictamen por el comité.<br><br>Escenario 2: Validación obligatoria de plan de reversa<br>Dado que ingreso al sistema como Gestor de cambios de TI registrando un cambio de arquitectura.<br>Cuando intento enviar la RFC sin adjuntar el procedimiento detallado de recuperación ante fallos.<br>Entonces el sistema impide el guardado exigiendo documentar el plan de marcha atrás obligatorio. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Llena formulario con fecha propuesta, plan de despliegue y archivo de rollback -> Clic en 'Enviar a CAB' -> Se genera código RFC-2026-0012 en estado 'EN_EVALUACION' -> Aparece en la agenda del comité.<br><br>Flujo Escenario 2: Deja campo 'Plan de Rollback' vacío -> Clic en enviar -> Validación detiene submit -> Alerta: 'De acuerdo a política ITIL v4, ningún cambio puede someterse a evaluación sin plan de marcha atrás'. |

---

### HU-38: Evaluación de Impacto por Comité de Cambios (CAB)

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-38** — *Evaluación de Impacto por Comité de Cambios (CAB)*<br>*(Fase: Fases Futuras: Gestión de Cambios)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/cambios/gestion/cab`<br>`/plataforma/cambios/cab/agenda`<br>`/plataforma/cambios/cab/emergencia`<br>`/plataforma/cambios/aprobador`<br>`/plataforma/cambios/supervisor/aprobaciones`<br>`/plataforma/cambios/gestor-area/aprobaciones`<br>`/plataforma/cambios/gestion/calendario`<br>`/plataforma/cambios/gestion/conflictos`<br>`/plataforma/cambios/gestion/programacion`<br>`/plataforma/cambios/gestion/ejecucion`<br>`/plataforma/cambios/gestion/pir`<br>`/plataforma/cambios/gestion/modelos` |
| **Columna 3: Flujo de Negocio ITIL v4** | Comité Asesor de Cambios (CAB / ECAB): Votación colegiada, verificación de ventanas de congelamiento (freeze windows) y autorización formal de despliegue en producción. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Miembro del CAB abre /plataforma/cambios/gestion/cab -> 2. Consulta agenda de RFCs convocadas -> 3. Revisa análisis de riesgos y matriz de conflictos (/gestion/conflictos) -> 4. Emite voto formal (Aprobado/Rechazado) -> 5. Al alcanzar quorum, RFC pasa a 'Aprobado para Despliegue'. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Votación alcanzando quorum requerido<br>Dado que ingreso al sistema como Miembro del comité CAB en la sesión de votación de una RFC.<br>Cuando reviso el análisis de riesgo y registro mi voto de aprobación junto a los demás miembros convocados.<br>Entonces al alcanzar la mayoría estipulada la RFC cambia automáticamente a estado 'Aprobado para Despliegue'.<br><br>Escenario 2: Conflicto en ventana de congelamiento<br>Dado que ingreso al sistema como Miembro del comité CAB evaluando la fecha de ejecución de un cambio.<br>Cuando la fecha propuesta coincide con un periodo de cierre contable o congelamiento de código.<br>Entonces el sistema marca la fecha en color rojo de alerta advirtiendo el conflicto de calendario. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En sesión CAB -> Miembro pulsa botón 'Aprobar' -> Sistema suma 3 de 4 votos requeridos -> Estado transiciona a 'APROBADO' -> Se habilita programación en calendario.<br><br>Flujo Escenario 2: Revisa RFC con fecha 31 de diciembre -> Verificador de calendario detecta 'Freeze Window Cierre Anual' -> Banner rojo advierte: 'Conflicto Crítico: Ventana de congelamiento activa'. |

---

### HU-39: Inventario Maestro de Elementos de Configuración en CMDB

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-39** — *Inventario Maestro de Elementos de Configuración en CMDB*<br>*(Fase: Fases Futuras: Activos y CMDB)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/activos/inventario`<br>`/plataforma/activos/asignaciones`<br>`/plataforma/activos/mis-activos`<br>`/plataforma/activos/cmdb`<br>`/plataforma/activos/cmdb/analisis`<br>`/plataforma/activos/cmdb/tipos`<br>`/plataforma/activos/cmdb`<br>`/plataforma/activos/cmdb` *(relaciones)*<br>`/plataforma/cmdb/lineas-base`<br>`/plataforma/activos/cmdb` *(auditoría exactitud)*<br>`/plataforma/cmdb/auditoria`<br>`/plataforma/activos/licencias`<br>`/plataforma/activos/licencias/cumplimiento`<br>`/plataforma/activos/contratos`<br>`/plataforma/activos/bajas`<br>`/plataforma/activos/recepcion`<br>`/plataforma/proveedores` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gestión de Configuración y Activos de TI (SACM / ITAM): Registro y relación de hardware, software, servidores y dependencias de red, auditando líneas base y control de licencias. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gestor de configuración abre /plataforma/cmdb/elementos -> 2. Crea o consulta un Elemento de Configuración (CI) -> 3. Abre pestaña de 'Relaciones' (/cmdb/relaciones) -> 4. Vincula qué aplicaciones corren sobre qué servidores -> 5. Genera mapa topológico interactivo. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Mapeo de relación de dependencia entre CI y servicio<br>Dado que ingreso al sistema como Gestor de configuración en la ficha de un servidor de base de datos.<br>Cuando establezco una relación de 'Soporta a' con el servicio del Portal Transaccional.<br>Entonces la CMDB guarda la dependencia y actualiza el mapa de impacto tecnológico del servicio.<br><br>Escenario 2: Auditoría de discrepancias contra línea base<br>Dado que ingreso al sistema como Gestor de configuración en el visor de exactitud de la CMDB.<br>Cuando ejecuto una comparación entre el inventario reportado y la línea base histórica.<br>Entonces la plataforma resalta las modificaciones que no cuenten con una RFC de respaldo autorizada. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En servidor SRV-DB-01 -> Clic en 'Nueva Relación' -> Tipo 'Ejecuta en', Destino 'SRV-TRANSACT' -> Guardar -> Visor de topología dibuja arista dirigida entre ambos nodos.<br><br>Flujo Escenario 2: Clic en 'Auditar Línea Base' -> Compara snapshots -> Resalta en amarillo 'Memoria RAM modificada de 32GB a 64GB sin RFC asociada' -> Se emite ticket de investigación a auditoría. |

---

### HU-40: Auditoría Forense de Segregación de Funciones (SoD)

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-40** — *Auditoría Forense de Segregación de Funciones (SoD)*<br>*(Fase: Fases Futuras: Auditoría y Cumplimiento)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/seguridad/cumplimiento/cambios`<br>`/plataforma/reportes/auditoria`<br>`/plataforma/reportes/decisiones`<br>`/plataforma/reportes/cambios`<br>`/plataforma/operacion/mantenimiento-datos`<br>`/plataforma/operacion/resiliencia` |
| **Columna 3: Flujo de Negocio ITIL v4** | Gobernanza y Cumplimiento de Controles Internos (IT Compliance / SOX): Verificación automatizada de matrices de incompatibilidad de funciones y trazabilidad de aprobaciones. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Auditor institucional accede a /plataforma/seguridad/cumplimiento/sod -> 2. Ejecuta motor de escaneo de Segregación de Funciones -> 3. Algoritmo valida que ningún aprobador haya autorizado cambios propios ni tickets propios -> 4. Emite certificado de cumplimiento con firma temporal. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Escaneo automatizado de matrices SoD<br>Dado que ingreso al sistema como Auditor de sistemas en el módulo de cumplimiento.<br>Cuando corro el análisis de Segregación de Funciones sobre las transacciones del último mes.<br>Entonces el sistema emite el reporte de cero incidentes de autoaprobación y certifica la conformidad del proceso.<br><br>Escenario 2: Extracción de muestra aleatoria para inspección<br>Dado que ingreso al sistema como Auditor de sistemas preparando la auditoría externa anual.<br>Cuando solicito la extracción de una muestra aleatoria del 10% de tickets resueltos.<br>Entonces la plataforma exporta la muestra con sus firmas temporales, logs de auditoría y nombres de los técnicos intervinientes. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: Clic en 'Iniciar Escaneo SoD' -> Backend recorre 1,400 tickets y aprobaciones -> Verifica regla 'id_solicitante <> id_aprobador' -> Muestra tarjeta verde 'Cumplimiento 100%: 0 infracciones detectadas'.<br><br>Flujo Escenario 2: Selector de muestra -> Ingresa 10% -> Clic en 'Muestrear' -> Algoritmo selecciona 140 tickets pseudoaleatorios con semilla criptográfica -> Exporta CSV listo para entrega a auditores externos. |

---

### HU-41: Tablero de Indicadores Gerenciales de Cumplimiento SLA

| Dimensión | Detalle Operativo y Arquitectónico |
| :--- | :--- |
| **Columna 1: Historia de Usuario (HU)** | **HU-41** — *Tablero de Indicadores Gerenciales de Cumplimiento SLA*<br>*(Fase: Fases Futuras: Reportes e Indicadores)* |
| **Columna 2: Páginas y Rutas Web que la Componen** | `/plataforma/reportes/gerenciales`<br>`/plataforma/reportes/operativos`<br>`/plataforma/reportes/area`<br>`/plataforma/reportes/problemas`<br>`/plataforma/reportes/activos`<br>`/plataforma/reportes/tableros` |
| **Columna 3: Flujo de Negocio ITIL v4** | Mejora Continua del Servicio (Continual Service Improvement - CSI): Medición analítica del desempeño de TI mediante indicadores clave (KPIs): porcentaje de cumplimiento de SLA, MTTR y volumen por área. |
| **Columna 4: Flujo General en el Software (Paso a Paso)** | 1. Gerente de TI accede a /plataforma/reportes/gerenciales -> 2. Selecciona rango de fechas y filtro de departamento -> 3. El sistema procesa métricas agregadas -> 4. Se despliegan gráficos interactivos de SLA, tiempos medios y satisfacción -> 5. Opción de exportación ejecutiva. |
| **Columna 5: Criterios de Aceptación (Gherkin con Rol)** | Escenario 1: Desglose porcentual de SLA por departamento<br>Dado que ingreso al sistema como Director de TI en el panel gerencial de indicadores.<br>Cuando selecciono el periodo trimestral y filtro por áreas de la compañía.<br>Entonces el tablero muestra gráficos interactivos con el índice de cumplimiento por área comparado contra la meta institucional del 95%.<br><br>Escenario 2: Cálculo del Tiempo Medio de Reparación (MTTR)<br>Dado que ingreso al sistema como Director de TI revisando los reportes de incidentes mayores.<br>Cuando consulto la métrica de tiempo de resolución de fallas críticas.<br>Entonces el sistema calcula el promedio de horas de duración de las interrupciones y grafica la tendencia mensual. |
| **Columna 6: Flujo Específico de cada Criterio de Aceptación** | Flujo Escenario 1: En /plataforma/reportes/gerenciales -> Elige 'Tercer Trimestre' -> Dashboard calcula SLA cumplido = 96.4% -> Gráfico de barras muestra Finanzas 98%, Operaciones 95%, Logística 96% -> Todos sobre el umbral verde.<br><br>Flujo Escenario 2: Clic en tarjeta 'MTTR' -> Gráfico de líneas traza promedio mensual: Enero 3.2h, Febrero 2.8h, Marzo 1.9h -> Indicador confirma reducción del 40% en tiempo de inactividad. |

---

