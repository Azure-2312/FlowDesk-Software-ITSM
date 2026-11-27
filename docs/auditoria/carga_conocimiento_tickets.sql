-- ============================================================================
-- CARGA DE CONOCIMIENTO, INCIDENTES Y SOLICITUDES · ejecutar UNA sola vez
-- ----------------------------------------------------------------------------
-- REQUISITOS (en este orden): correccion_catalogo_servicios.sql y
-- carga_ecosistema_activos.sql. Esta carga usa el catálogo corregido y los
-- activos, CI y licencias para que todo cuadre.
--
--   1. Base de conocimiento inicial (publicada antes del historial) sobre los
--      equipos, CI y servicios que de verdad existen.
--   2. Seis meses de incidentes y solicitudes a partir de escenarios:
--      · el solicitante es un usuario activo y, si reporta su equipo, es el
--        equipo que tiene asignado;
--      · el técnico es del área que resuelve ese tipo de caso;
--      · prioridad = impacto × urgencia (misma regla de la app) y el SLA sale
--        del servicio del catálogo o de la prioridad.
--   3. Conocimiento ↔ tickets: los tickets con artículo disponible quedan
--      vinculados; tres artículos NACEN de tickets repetidos y desde su
--      publicación resuelven los siguientes.
--   4. Solicitudes que explican el inventario: instalación de cada licencia de
--      Adobe, equipos nuevos de los últimos 6 meses, garantías vencidas
--      (renovación pendiente) y equipos en mantenimiento (incidente abierto).
--   5. Una caída grave: el Host de virtualización 02 y los reportes de
--      usuarios que provocó.
--   6. Patrones repetidos a propósito (Wi-Fi del piso 3, ERP lento a fin de
--      mes, impresora del piso 2) para la futura carga de problemas.
--
-- Reglas: solo corre si no hay tickets ni artículos; todo va en UN bloque;
-- al final valida que todo cuadre y, si no, se revierte completo.
-- Haga un respaldo antes de ejecutarlo en producción.
-- ============================================================================
DO $$
DECLARE
  v_ahora        TIMESTAMPTZ := now();
  v_inicio       TIMESTAMPTZ := now() - INTERVAL '180 days';
  v_registrador  INTEGER;
  v_revisor      INTEGER;
  v_usuarios     INTEGER;
  v_factor       NUMERIC;
  v_mayor        TIMESTAMPTZ;
  v_n            INTEGER;
  v_problemas    TEXT := '';
BEGIN
  PERFORM setseed(0.3141);

  -- ------------------------------------------------------------------------
  -- Protecciones
  -- ------------------------------------------------------------------------
  IF EXISTS (SELECT 1 FROM ticket) OR EXISTS (SELECT 1 FROM articulo_conocimiento) THEN
    RAISE EXCEPTION 'Ya hay tickets o artículos de conocimiento. Esta carga solo corre sobre tablas vacías.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM elemento_configuracion WHERE codigo_ci = 'CI-HOST-02')
     OR NOT EXISTS (SELECT 1 FROM licencia_software WHERE nombre_software = 'Adobe Acrobat Pro') THEN
    RAISE EXCEPTION 'Primero ejecute carga_ecosistema_activos.sql (faltan sus activos, CI o licencias).';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM servicio_catalogo WHERE codigo_servicio = 'SRV-INC-SW-003' AND estado_registro) THEN
    RAISE EXCEPTION 'Primero ejecute correccion_catalogo_servicios.sql (el catálogo aún no está corregido).';
  END IF;

  SELECT COUNT(*) INTO v_usuarios FROM usuario WHERE estado_registro = true;
  v_factor := 1.6 * v_usuarios / 200.0;   -- ~900 tickets por cada 200 usuarios

  SELECT up.id_usuario INTO v_registrador FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil = 1 AND u.estado_registro ORDER BY 1 LIMIT 1;
  SELECT up.id_usuario INTO v_revisor FROM usuario_perfiles up JOIN usuario u USING (id_usuario)
   WHERE up.id_perfil = 4 AND u.estado_registro ORDER BY 1 LIMIT 1;
  v_revisor := COALESCE(v_revisor, v_registrador);

  -- Técnicos activos con su área de soporte
  CREATE TEMP TABLE _tec ON COMMIT DROP AS
  SELECT td.id_usuario, d.codigo AS dep, td.id_departamento
    FROM tecnico_detalle td
    JOIN usuario u ON u.id_usuario = td.id_usuario AND u.estado_registro
    JOIN departamento_ti d ON d.id_departamento = td.id_departamento
   WHERE td.estado_registro;
  IF NOT EXISTS (SELECT 1 FROM _tec) THEN
    RAISE EXCEPTION 'No hay técnicos activos (tecnico_detalle); cárguelos antes.';
  END IF;

  -- ========================================================================
  -- 1. ARTÍCULOS DE CONOCIMIENTO
  --    origen BASE = publicado antes del historial; NACE = nace de tickets;
  --    BORRADOR = en redacción (semilla para la futura gestión de problemas)
  -- ========================================================================
  CREATE TEMP TABLE _art (
    clave TEXT PRIMARY KEY, origen TEXT, titulo TEXT, categoria TEXT, tipo_cat INTEGER,
    area TEXT, publico BOOLEAN, contenido TEXT,
    autor INTEGER, f_creacion TIMESTAMPTZ, f_publicacion TIMESTAMPTZ, estado TEXT,
    codigo TEXT, id_articulo INTEGER
  ) ON COMMIT DROP;

  INSERT INTO _art (clave, origen, titulo, categoria, tipo_cat, area, publico, contenido) VALUES
  ('A-BAT-DELL', 'BASE', 'Batería que no carga en Dell Latitude 5440', 'Hardware y Equipos', 1, 'DEP-N2-CAMPO', true,
$m$## Síntoma
La laptop Dell Latitude 5440 muestra "Conectado, no se está cargando" o la batería no pasa de cierto porcentaje.

## Solución
1. Verifique que usa el **cargador USB-C original de 65 W**; los cargadores de celular no cargan el equipo.
2. Apague la laptop, desconecte el cargador y mantenga presionado el botón de encendido **15 segundos**.
3. Conecte el cargador y encienda. Abra **Dell Power Manager** y confirme que el modo de carga sea "Estándar" (el modo "Uso principal con CA" limita la carga al 80 %).
4. Si la batería sigue sin cargar, registre un incidente: el técnico revisará el estado en el BIOS (F2) y gestionará la garantía.$m$),

  ('A-WIFI', 'BASE', 'Conectarse al Wi-Fi corporativo', 'Redes y Conectividad', 1, 'DEP-REDES', true,
$m$## Pasos
1. En la barra de tareas, abra las redes inalámbricas y elija **FLOWDESK-CORP** (no use FLOWDESK-INVITADOS para trabajar).
2. Ingrese su **usuario y contraseña de dominio**, los mismos de su sesión de Windows.
3. Si aparece una advertencia de certificado, acéptela solo si el emisor es la entidad interna de FlowDesk.

## Si no conecta
- Haga clic derecho en la red → **Olvidar** y vuelva a conectarse.
- Si cambió su contraseña hace poco, la red pedirá la nueva.
- Si nadie en su piso tiene Wi-Fi, registre un incidente indicando el piso: puede ser el punto de acceso.$m$),

  ('A-OUTLOOK', 'BASE', 'Outlook no sincroniza el correo (Microsoft 365)', 'Software y Aplicaciones', 1, 'DEP-N1-MESA', true,
$m$## Síntoma
Outlook muestra "Desconectado", "Intentando conectar" o los correos nuevos no llegan.

## Solución
1. Revise que tenga internet abriendo cualquier página web.
2. En Outlook: **Archivo → Configuración de la cuenta → Restablecer** o cierre Outlook y ábralo de nuevo.
3. Si pide contraseña repetidamente, cierre sesión en Office (**Archivo → Cuenta → Cerrar sesión**) y vuelva a ingresar con su cuenta corporativa y el doble factor.
4. Pruebe el correo en el navegador (outlook.office.com). Si allí funciona, el problema es del equipo: registre un incidente.$m$),

  ('A-CARPETAS', 'BASE', 'No puedo abrir las carpetas compartidas', 'Software y Aplicaciones', 1, 'DEP-N3-SIST', true,
$m$## Síntoma
La unidad **S:** aparece con una X roja o muestra "No tiene permiso".

## Solución
1. Confirme que está conectado a la red corporativa (cable o FLOWDESK-CORP). Desde casa, conéctese primero a la VPN.
2. En el Explorador, escriba `\\flowdesk.local\compartido` y presione Enter.
3. Si pide credenciales, use su usuario de dominio.
4. Si dice "sin permiso", su jefe debe solicitar el acceso a la carpeta mediante el servicio **Accesos y privilegios en sistemas corporativos**.$m$),

  ('A-ERP-SESION', 'BASE', 'ERP financiero: "La sesión expiró" al iniciar', 'Software y Aplicaciones', 1, 'DEP-N3-SIST', true,
$m$## Síntoma
Al ingresar al ERP financiero aparece "La sesión expiró" aunque acaba de iniciar sesión.

## Solución
1. Cierre todas las pestañas del ERP.
2. Borre las cookies del sitio del ERP (Configuración del navegador → Privacidad → Cookies del sitio).
3. Ingrese de nuevo con su usuario de dominio.
4. Si el error continúa, verifique que la hora de su equipo sea correcta: una diferencia de más de 5 minutos invalida la sesión.$m$),

  ('A-PRN-ATASCO', 'BASE', 'Atasco de papel en HP LaserJet Enterprise MFP M528', 'Hardware y Equipos', 1, 'DEP-N2-CAMPO', true,
$m$## Pasos
1. Siga la animación de la pantalla de la impresora: indica la puerta exacta del atasco.
2. Abra la **puerta derecha** y retire el papel tirando con ambas manos, sin romperlo.
3. Revise la **bandeja 2**: el papel no debe superar la marca de llenado.
4. Use papel de 75 a 80 g/m²; el papel húmedo o reciclado causa atascos frecuentes.

Si el atasco se repite varias veces al día, registre un incidente: puede requerir el cambio del kit de rodillos.$m$),

  ('A-PRN-COLA', 'BASE', 'La impresora de red no imprime: reinstalar la cola', 'Hardware y Equipos', 1, 'DEP-N2-CAMPO', true,
$m$## Solución
1. Abra **Configuración → Impresoras y escáneres**, elija la impresora de su piso y presione **Abrir cola**. Cancele los documentos atascados.
2. Si sigue sin imprimir, quite la impresora y agréguela de nuevo desde `\\flowdesk.local` → **Impresoras** → *Impresora piso N*.
3. Las impresoras de cada piso son HP LaserJet Enterprise MFP M528 con el controlador "HP Universal Printing PCL 6".$m$),

  ('A-ESET', 'BASE', 'ESET bloquea una aplicación de trabajo', 'Seguridad de la Información', 1, 'DEP-SEC', false,
$m$## Procedimiento (uso interno de soporte)
1. En la consola **ESET PROTECT**, ubique el equipo por su hostname (FD-LAP-xxxx / FD-DSK-xxxx) y revise el registro de detecciones.
2. Confirme con Seguridad que la aplicación es legítima (firma digital del fabricante, hash conocido).
3. Cree una **exclusión por hash**, nunca por carpeta completa, en la política del grupo del área.
4. Fuerce la sincronización de la política y pida al usuario que reinicie la aplicación.
5. Registre la exclusión en el ticket.$m$),

  ('A-PHISHING', 'BASE', 'Cómo reportar un correo sospechoso (phishing)', 'Seguridad de la Información', 1, 'DEP-SEC', true,
$m$## Señales de alerta
- Remitente desconocido o dominio parecido al nuestro.
- Urgencia ("su cuenta será bloqueada hoy").
- Enlaces o adjuntos que no esperaba.

## Qué hacer
1. **No haga clic** en enlaces ni abra adjuntos.
2. En Outlook use el botón **Reportar → Phishing**.
3. Registre un incidente de seguridad. Si ya hizo clic o escribió su contraseña, indíquelo: cambiaremos su contraseña de inmediato.$m$),

  ('A-WIN-ACT', 'BASE', 'Windows 11 Pro muestra "Activar Windows"', 'Software y Aplicaciones', 1, 'DEP-N2-CAMPO', false,
$m$## Procedimiento (uso interno de soporte)
Los equipos tienen licencia **Windows 11 Pro OEM** grabada en el firmware.
1. En una consola de administrador ejecute `slmgr /dlv` y revise el estado.
2. Si se cambió la placa madre en garantía, ejecute `slmgr /ipk` con la clave OEM del firmware (`wmic path softwarelicensingservice get OA3xOriginalProductKey`).
3. Active con `slmgr /ato` y confirme en **Configuración → Activación**.$m$),

  ('A-RED-CABLE', 'BASE', 'Sin conexión por cable: revisar el punto de red', 'Redes y Conectividad', 1, 'DEP-REDES', true,
$m$## Pasos
1. Revise que el cable esté conectado en ambos extremos y que la luz del puerto parpadee.
2. Pruebe otro cable o el punto de red de un compañero.
3. Si en el piso nadie tiene conexión, registre un incidente indicando el piso: puede ser el switch de acceso.$m$),

  ('A-PC-LENTA', 'BASE', 'PC de escritorio lenta: limpieza y reinicio', 'Hardware y Equipos', 1, 'DEP-N2-CAMPO', true,
$m$## Pasos
1. Reinicie el equipo (no basta con apagar la pantalla). Los equipos que no se reinician en semanas se vuelven lentos.
2. Abra **Configuración → Sistema → Almacenamiento** y ejecute "Liberador de espacio".
3. En el Administrador de tareas (Ctrl + Shift + Esc) revise qué programa usa más memoria.
4. Si el disco está casi lleno o la lentitud continúa, registre un incidente.$m$),

  ('A-PASS', 'BASE', 'Restablecer la contraseña de dominio', 'Usuarios y Accesos', 2, 'DEP-N1-MESA', true,
$m$## Autoservicio
1. Ingrese al portal de restablecimiento de contraseñas de Microsoft 365.
2. Verifique su identidad con el doble factor registrado.
3. La nueva contraseña debe tener al menos 12 caracteres y no repetir las últimas 5.

## Si no tiene acceso al doble factor
Solicite el servicio **Restablecimiento de credenciales y doble factor (MFA)**. Mesa de Ayuda validará su identidad por llamada antes del cambio.$m$),

  ('A-MFA', 'BASE', 'Volver a registrar el doble factor (MFA) de Microsoft 365', 'Usuarios y Accesos', 2, 'DEP-N1-MESA', true,
$m$## Cuándo aplica
Cambió de celular o desinstaló Microsoft Authenticator.

## Pasos
1. Mesa de Ayuda restablece su método de MFA tras validar su identidad.
2. Inicie sesión en office.com: se le pedirá registrar el método de nuevo.
3. Instale **Microsoft Authenticator**, escanee el código QR y apruebe la notificación de prueba.$m$),

  ('A-RESTORE', 'BASE', 'Restaurar un archivo desde el respaldo', 'Datos y Copias de Seguridad', 2, 'DEP-N3-SIST', false,
$m$## Procedimiento (uso interno de soporte)
1. Confirme la ruta exacta y la fecha aproximada en que el archivo estaba bien.
2. En la **plataforma de respaldos** (servidor FD-BKP-01) busque el punto de restauración más cercano.
3. Restaure en una carpeta alterna (`\\flowdesk.local\compartido\_restaurado\<ticket>`), nunca sobre el original.
4. Pida al usuario que valide el archivo antes de cerrar el ticket.$m$),

  ('A-ACCESO-ERP', 'BASE', 'Procedimiento: alta de accesos al ERP financiero', 'Usuarios y Accesos', 2, 'DEP-N3-SIST', false,
$m$## Procedimiento (uso interno de soporte)
1. Verifique que la solicitud tenga la **aprobación del jefe** del área.
2. Asigne el rol mínimo necesario (consulta, registro o aprobación); nunca copie los permisos de otro usuario.
3. Agregue al usuario al grupo del directorio activo correspondiente (`ERP-<rol>-<área>`).
4. Pida al usuario que cierre sesión y vuelva a ingresar para tomar el nuevo rol.$m$),

  ('A-ONBOARD', 'BASE', 'Preparación de laptop para un nuevo ingreso', 'Equipamiento Nuevo', 2, 'DEP-N2-CAMPO', false,
$m$## Procedimiento (uso interno de soporte)
1. Tome un equipo del stock y registre la **asignación** al nuevo custodio en Activos.
2. Una el equipo al dominio con hostname FD-LAP-xxxx o FD-DSK-xxxx (igual a su código patrimonial).
3. Verifique la activación de Windows 11 Pro y que ESET quede sincronizado con la consola.
4. Asigne la licencia de Microsoft 365 y entregue el equipo con el acta firmada.$m$),

  ('A-ADOBE', 'BASE', 'Instalar Adobe Acrobat Pro y asignar la licencia', 'Instalación de Software', 2, 'DEP-N3-SIST', false,
$m$## Procedimiento (uso interno de soporte)
1. Confirme la **aprobación** del jefe (la licencia tiene costo anual).
2. En **Activos → Licencias**, asigne una licencia disponible de Adobe Acrobat Pro al usuario.
3. Agregue al usuario en la consola de administración de Adobe y pídale que inicie sesión en Acrobat con su correo corporativo.
4. Si no hay licencias disponibles, deje el ticket en espera y avise al Gestor de Activos.$m$),

  ('A-HOST', 'BASE', 'Recuperación de un host de virtualización caído', 'Hardware y Equipos', 1, 'DEP-N3-SIST', false,
$m$## Procedimiento (uso interno de Infraestructura)
1. Revise en la CMDB qué máquinas virtuales aloja el host (**Análisis de impacto**) y avise a Mesa de Ayuda del alcance.
2. Ingrese a la consola de gestión remota del servidor (iDRAC / iLO) y revise el registro de hardware.
3. Si el host no responde, reinícielo desde la consola remota. Si falla el hardware, mueva las VM críticas a otro host.
4. Valide que el ERP, la intranet y sus bases de datos respondan antes de cerrar el incidente.$m$),

  ('A-PERIF', 'BASE', 'Entrega de accesorios y periféricos', 'Equipamiento Nuevo', 2, 'DEP-N2-CAMPO', false,
$m$## Procedimiento (uso interno de soporte)
Accesorios estándar: mouse, teclado, base para laptop y adaptador USB-C a HDMI.
1. Verifique el stock del accesorio.
2. Entregue al usuario y registre la entrega en el ticket.
3. Los monitores adicionales requieren aprobación del jefe.$m$),

  -- Nacen de tickets repetidos (fecha y autor se calculan más abajo)
  ('N-LAPTOP-ON', 'NACE', 'Laptop no enciende: descarga de energía residual', 'Hardware y Equipos', 1, 'DEP-N2-CAMPO', true,
$m$## Síntoma
La laptop no enciende ni muestra luces, aunque el cargador está conectado.

## Solución
1. Desconecte el cargador y todos los accesorios (docking, USB).
2. Mantenga presionado el botón de encendido **30 segundos** para descargar la energía residual.
3. Conecte solo el cargador original y espere 5 minutos antes de encender.
4. Si no enciende, registre un incidente: puede requerir revisión de la batería o de la placa en garantía.

*Artículo creado a partir de varios incidentes repetidos con el mismo síntoma.*$m$),

  ('N-WIFI-P3', 'NACE', 'Cortes de Wi-Fi en el piso 3: solución temporal', 'Redes y Conectividad', 1, 'DEP-REDES', true,
$m$## Síntoma
En el piso 3 el Wi-Fi se desconecta varias veces al día por algunos minutos.

## Solución temporal
1. Olvide la red FLOWDESK-CORP y vuelva a conectarse.
2. Si trabaja cerca de la sala de reuniones, use un punto de red cableado mientras dure la intermitencia.

## Estado
Redes está investigando la causa de fondo del punto de acceso del piso 3. Mientras tanto, registre cada corte como incidente indicando la hora.$m$),

  ('N-TEAMS', 'NACE', 'Teams sin audio o sin cámara: restablecer dispositivos', 'Software y Aplicaciones', 1, 'DEP-N1-MESA', true,
$m$## Solución
1. En Teams: **Configuración → Dispositivos** y elija el micrófono, el parlante y la cámara correctos.
2. Cierre Teams desde el ícono junto al reloj (**Salir**) y ábralo de nuevo.
3. En Windows: **Configuración → Privacidad → Cámara / Micrófono** y permita el acceso a Teams.
4. Si usa audífonos USB, desconéctelos y conéctelos en otro puerto.

*Artículo creado a partir de varios incidentes repetidos con el mismo síntoma.*$m$),

  ('B-ERP-LENTO', 'BORRADOR', 'ERP lento a fin de mes (borrador en análisis)', 'Software y Aplicaciones', 1, 'DEP-N3-SIST', false,
$m$## Borrador
Durante los últimos días de cada mes el ERP financiero responde con lentitud (más de 20 segundos por pantalla) en los cierres contables.

## Observaciones
- Coincide con la ejecución de los procesos de cierre en la base de datos del ERP.
- Pendiente: revisar índices y la programación de los procesos nocturnos.

*No publicar hasta tener la causa raíz confirmada.*$m$);

  -- Autor de los artículos BASE y BORRADOR: un técnico del área (o el admin)
  UPDATE _art a SET autor = COALESCE(
      (SELECT id_usuario FROM _tec t WHERE t.dep = a.area ORDER BY id_usuario LIMIT 1),
      (SELECT id_usuario FROM _tec ORDER BY id_usuario LIMIT 1));
  UPDATE _art SET f_creacion = v_inicio - INTERVAL '40 days' + (random() * 25) * INTERVAL '1 day',
                  estado = 'PUBLICADO'
   WHERE origen = 'BASE';
  UPDATE _art SET f_publicacion = f_creacion + INTERVAL '2 days' WHERE origen = 'BASE';
  UPDATE _art SET f_creacion = v_ahora - INTERVAL '9 days', estado = 'BORRADOR' WHERE origen = 'BORRADOR';

  -- ========================================================================
  -- 2. ESCENARIOS DE TICKETS
  --    cantidad = peso × tamaño de la organización
  --    {equipo} {codigo} {piso} se reemplazan con los datos del solicitante
  -- ========================================================================
  CREATE TEMP TABLE _esc (
    clave TEXT, tipo INTEGER, categoria TEXT, servicio TEXT, filtro_tipo TEXT, filtro_modelo TEXT,
    piso INTEGER, piso_excluir INTEGER, ci TEXT, impacto INTEGER, urgencia INTEGER, dep TEXT,
    art TEXT, peso INTEGER, patron TEXT, espera INTEGER, usa_equipo BOOLEAN, canal TEXT,
    titulo TEXT, descripcion TEXT, solucion TEXT
  ) ON COMMIT DROP;

  INSERT INTO _esc VALUES
  -- ---------------------------------------------------------------- Incidentes
  ('I-BATERIA', 1, 'Hardware y Equipos', NULL, 'LAPTOP', 'Latitude 5440', NULL, NULL, NULL, 1, 2, 'DEP-N2-CAMPO', 'A-BAT-DELL', 20, NULL, 2, true, 'PORTAL_WEB',
   'La batería de mi laptop no carga', 'Mi {equipo} ({codigo}) dice "Conectado, no se está cargando" y se apaga cuando la desconecto.',
   'Se restableció la energía y se configuró la carga estándar en Dell Power Manager. La batería vuelve a cargar con normalidad.'),
  ('I-NO-ENCIENDE', 1, 'Hardware y Equipos', NULL, 'LAPTOP', NULL, NULL, NULL, NULL, 1, 3, 'DEP-N2-CAMPO', 'N-LAPTOP-ON', 25, NULL, NULL, true, 'LLAMADA_TELEFONICA',
   'Mi laptop no enciende', 'Mi {equipo} ({codigo}) no enciende ni muestra luces desde esta mañana.',
   'Se descargó la energía residual (botón de encendido 30 s sin cargador) y el equipo encendió correctamente.'),
  ('I-WIFI-P3', 1, 'Redes y Conectividad', 'SRV-INC-RED-001', NULL, NULL, 3, NULL, 'CI-AP-P3', 2, 2, 'DEP-REDES', 'N-WIFI-P3', 30, NULL, NULL, false, 'PORTAL_WEB',
   'Se corta el Wi-Fi en el piso 3', 'En el piso 3 el Wi-Fi se desconecta varias veces al día; a mis compañeros también les pasa.',
   'Se reinició el punto de acceso del piso 3 y se reconectaron los equipos afectados. El servicio se restableció.'),
  ('I-WIFI', 1, 'Redes y Conectividad', 'SRV-INC-RED-001', NULL, NULL, NULL, 3, 'CI-AP-P{piso}', 1, 2, 'DEP-REDES', 'A-WIFI', 20, NULL, NULL, true, 'PORTAL_WEB',
   'No puedo conectarme al Wi-Fi', 'Mi {equipo} ({codigo}) no se conecta a FLOWDESK-CORP en el piso {piso}.',
   'Se eliminó el perfil de red guardado y se volvió a conectar con las credenciales de dominio actualizadas.'),
  ('I-OUTLOOK', 1, 'Software y Aplicaciones', NULL, NULL, NULL, NULL, NULL, 'CI-SVC-CORREO', 1, 2, 'DEP-N1-MESA', 'A-OUTLOOK', 35, NULL, NULL, false, 'PORTAL_WEB',
   'Outlook no recibe correos', 'Outlook dice "Desconectado" y no me llegan correos nuevos desde hace una hora.',
   'Se cerró sesión en Office y se volvió a ingresar con doble factor. Outlook sincroniza correctamente.'),
  ('I-CARPETAS', 1, 'Software y Aplicaciones', NULL, NULL, NULL, NULL, NULL, 'CI-APP-FILES', 1, 2, 'DEP-N3-SIST', 'A-CARPETAS', 25, NULL, NULL, false, 'PORTAL_WEB',
   'No puedo abrir la unidad compartida S:', 'La unidad S: aparece con una X roja y no puedo abrir los archivos del área.',
   'Se reconectó la unidad compartida y se validó la pertenencia del usuario al grupo del área.'),
  ('I-ERP-SESION', 1, 'Software y Aplicaciones', NULL, NULL, NULL, NULL, NULL, 'CI-APP-ERP', 1, 2, 'DEP-N3-SIST', 'A-ERP-SESION', 25, NULL, NULL, false, 'PORTAL_WEB',
   'El ERP me dice que la sesión expiró', 'Al ingresar al ERP financiero aparece "La sesión expiró" apenas inicio sesión.',
   'Se limpiaron las cookies del sitio y se corrigió la hora del equipo, que estaba desfasada. El acceso funciona.'),
  ('I-ERP-LENTO', 1, 'Software y Aplicaciones', NULL, NULL, NULL, NULL, NULL, 'CI-APP-ERP', 2, 2, 'DEP-N3-SIST', NULL, 25, 'FIN_MES', NULL, false, 'LLAMADA_TELEFONICA',
   'El ERP está muy lento', 'El ERP financiero tarda más de 20 segundos en cada pantalla; estamos en pleno cierre de mes.',
   'Se liberaron sesiones bloqueadas en la base de datos del ERP y el tiempo de respuesta se normalizó.'),
  ('I-PRN-P2', 1, 'Hardware y Equipos', NULL, NULL, NULL, 2, NULL, NULL, 1, 2, 'DEP-N2-CAMPO', 'A-PRN-ATASCO', 22, NULL, NULL, false, 'PORTAL_WEB',
   'La impresora del piso 2 se atasca', 'La impresora del piso 2 (HDW-PRN-0002) se atasca otra vez con el papel de la bandeja 2.',
   'Se retiró el papel atascado de la puerta derecha y se ajustaron las guías de la bandeja 2.'),
  ('I-PRN-COLA', 1, 'Hardware y Equipos', NULL, NULL, NULL, NULL, 2, NULL, 1, 1, 'DEP-N2-CAMPO', 'A-PRN-COLA', 18, NULL, NULL, true, 'PORTAL_WEB',
   'No puedo imprimir', 'Envío documentos a la impresora del piso {piso} y se quedan en la cola sin imprimir.',
   'Se limpió la cola de impresión y se reinstaló la impresora de red con el controlador universal.'),
  ('I-ESET', 1, 'Seguridad de la Información', NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, 'DEP-SEC', 'A-ESET', 15, NULL, 4, true, 'PORTAL_WEB',
   'El antivirus bloquea un programa', 'ESET bloquea un programa que uso para mi trabajo en mi {equipo} ({codigo}).',
   'Seguridad validó la aplicación y se creó una exclusión por hash en la política del área.'),
  ('I-PHISHING', 1, 'Seguridad de la Información', 'SRV-INC-SEC-001', NULL, NULL, NULL, NULL, 'CI-SVC-CORREO', 2, 2, 'DEP-SEC', 'A-PHISHING', 20, NULL, NULL, false, 'CORREO_ELECTRONICO',
   'Recibí un correo sospechoso', 'Me llegó un correo que pide actualizar mi contraseña con un enlace extraño.',
   'Se bloqueó el remitente, se eliminó el correo de todos los buzones y se confirmó que el usuario no ingresó credenciales.'),
  ('I-WIN-ACT', 1, 'Software y Aplicaciones', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 'DEP-N2-CAMPO', 'A-WIN-ACT', 8, NULL, NULL, true, 'PORTAL_WEB',
   'Windows pide activarse', 'Mi {equipo} ({codigo}) muestra la marca de agua "Activar Windows".',
   'Se reactivó Windows 11 Pro con la clave OEM del firmware.'),
  ('I-TECLADO', 1, 'Hardware y Equipos', NULL, 'LAPTOP', 'ThinkPad T14 Gen 4', NULL, NULL, NULL, 1, 2, 'DEP-N2-CAMPO', NULL, 10, NULL, 3, true, 'PORTAL_WEB',
   'Fallan teclas del teclado de mi laptop', 'Algunas teclas de mi {equipo} ({codigo}) no responden.',
   'Se reemplazó el teclado por garantía del fabricante.'),
  ('I-TEAMS', 1, 'Software y Aplicaciones', NULL, NULL, NULL, NULL, NULL, 'CI-SVC-CORREO', 1, 2, 'DEP-N1-MESA', 'N-TEAMS', 15, NULL, NULL, false, 'PORTAL_WEB',
   'Teams no detecta mi micrófono', 'En las reuniones de Teams no me escuchan y la cámara aparece apagada.',
   'Se seleccionaron los dispositivos correctos en Teams y se habilitaron los permisos de cámara y micrófono en Windows.'),
  ('I-INTRANET', 1, 'Software y Aplicaciones', NULL, NULL, NULL, NULL, NULL, 'CI-APP-INTRA', 1, 1, 'DEP-N3-SIST', NULL, 10, NULL, NULL, false, 'PORTAL_WEB',
   'La intranet no carga', 'El portal de la intranet se queda cargando.',
   'Se reinició el servicio web de la intranet y se verificó el acceso.'),
  ('I-CABLE', 1, 'Redes y Conectividad', 'SRV-INC-RED-001', NULL, NULL, NULL, NULL, 'CI-SW-P{piso}', 1, 2, 'DEP-REDES', 'A-RED-CABLE', 12, NULL, NULL, true, 'PORTAL_WEB',
   'Sin internet por cable', 'Mi {equipo} ({codigo}) no tiene conexión por cable en el piso {piso}.',
   'Se reemplazó el cable de red y se habilitó de nuevo el puerto en el switch de acceso.'),
  ('I-PC-LENTA', 1, 'Hardware y Equipos', NULL, 'DESKTOP', NULL, NULL, NULL, NULL, 1, 1, 'DEP-N2-CAMPO', 'A-PC-LENTA', 15, NULL, NULL, true, 'PORTAL_WEB',
   'Mi computadora está muy lenta', 'Mi {equipo} ({codigo}) tarda mucho en abrir los programas.',
   'Se liberó espacio en disco, se deshabilitaron programas de inicio y se reinició el equipo.'),
  -- ---------------------------------------------------------------- Solicitudes
  ('R-PASSWORD', 2, 'Usuarios y Accesos', 'SRV-SOL-ACC-005', NULL, NULL, NULL, NULL, NULL, 1, 2, 'DEP-N1-MESA', 'A-PASS', 55, NULL, NULL, false, 'LLAMADA_TELEFONICA',
   'Restablecer mi contraseña', 'Olvidé mi contraseña de dominio y no puedo iniciar sesión.',
   'Se validó la identidad del usuario por llamada y se restableció la contraseña con cambio obligatorio al ingresar.'),
  ('R-MFA', 2, 'Usuarios y Accesos', 'SRV-SOL-ACC-005', NULL, NULL, NULL, NULL, NULL, 1, 2, 'DEP-N1-MESA', 'A-MFA', 15, NULL, NULL, false, 'PORTAL_WEB',
   'Cambié de celular y no tengo el doble factor', 'Cambié de celular y ya no recibo las notificaciones de Microsoft Authenticator.',
   'Se restableció el método de MFA y el usuario lo registró en su nuevo celular.'),
  ('R-ACCESO-ERP', 2, 'Usuarios y Accesos', 'SRV-SOL-ACC-001', NULL, NULL, NULL, NULL, 'CI-APP-ERP', 1, 1, 'DEP-N3-SIST', 'A-ACCESO-ERP', 30, NULL, NULL, false, 'PORTAL_WEB',
   'Acceso al módulo de cuentas por pagar del ERP', 'Necesito acceso de registro al módulo de cuentas por pagar del ERP por cambio de funciones.',
   'Se asignó el rol de registro en cuentas por pagar mediante el grupo del directorio activo.'),
  ('R-BUZON', 2, 'Usuarios y Accesos', 'SRV-SOL-ACC-004', NULL, NULL, NULL, NULL, 'CI-SVC-CORREO', 1, 1, 'DEP-N1-MESA', NULL, 12, NULL, NULL, false, 'PORTAL_WEB',
   'Crear un buzón compartido para el área', 'Necesitamos un buzón compartido para atender las consultas del área.',
   'Se creó el buzón compartido y se dio acceso a los miembros indicados.'),
  ('R-PERIFERICO', 2, 'Equipamiento Nuevo', 'SRV-SOL-HW-004', NULL, NULL, NULL, NULL, NULL, 1, 1, 'DEP-N2-CAMPO', 'A-PERIF', 25, NULL, NULL, true, 'PORTAL_WEB',
   'Solicito mouse y adaptador HDMI', 'Necesito un mouse y un adaptador USB-C a HDMI para mi {equipo} ({codigo}).',
   'Se entregaron el mouse y el adaptador; el usuario firmó la entrega.'),
  ('R-RESTORE', 2, 'Datos y Copias de Seguridad', 'SRV-SOL-BKP-001', NULL, NULL, NULL, NULL, 'CI-APP-BKP', 1, 2, 'DEP-N3-SIST', 'A-RESTORE', 15, NULL, NULL, false, 'PORTAL_WEB',
   'Recuperar un archivo borrado', 'Borré por error un archivo Excel de la carpeta compartida del área ayer por la tarde.',
   'Se restauró el archivo desde el respaldo de la noche anterior en una carpeta alterna y el usuario lo validó.'),
  ('R-FIREWALL', 2, 'Redes y Comunicaciones', 'SRV-SOL-RED-003', NULL, NULL, NULL, NULL, 'CI-FW-01', 1, 1, 'DEP-SEC', NULL, 12, NULL, NULL, false, 'PORTAL_WEB',
   'Desbloquear un sitio web de proveedor', 'Necesito acceso al portal de un proveedor que aparece bloqueado por el firewall.',
   'Seguridad validó el sitio y se agregó una excepción de navegación en el firewall.'),
  ('R-PUNTO-RED', 2, 'Redes y Comunicaciones', 'SRV-SOL-RED-001', NULL, NULL, NULL, NULL, 'CI-SW-P{piso}', 1, 1, 'DEP-REDES', NULL, 5, NULL, NULL, true, 'PORTAL_WEB',
   'Habilitar un punto de red', 'Necesitamos habilitar un punto de red adicional en el piso {piso} para una nueva estación.',
   'Se habilitó el punto de red y se configuró el puerto en el switch de acceso.'),
  ('R-PRESTAMO', 2, 'Equipamiento Nuevo', 'SRV-SOL-HW-003', NULL, NULL, NULL, NULL, NULL, 1, 2, 'DEP-N2-CAMPO', NULL, 6, NULL, NULL, false, 'PORTAL_WEB',
   'Préstamo de laptop para viaje', 'Necesito una laptop de préstamo para una presentación fuera de la oficina.',
   'Se prestó una laptop del stock y el usuario la devolvió en buen estado al finalizar.'),
  ('R-CARPETA', 2, 'Usuarios y Accesos', 'SRV-SOL-ACC-006', NULL, NULL, NULL, NULL, 'CI-APP-FILES', 1, 1, 'DEP-N3-SIST', NULL, 14, NULL, NULL, false, 'PORTAL_WEB',
   'Acceso a la carpeta compartida de otra área', 'Necesito acceso de lectura a la carpeta compartida de Contabilidad para el proyecto de presupuesto.',
   'Se agregó al usuario al grupo de lectura de la carpeta y verificó el acceso.'),
  ('R-TONER', 2, 'Impresión y Consumibles', 'SRV-SOL-PRN-002', NULL, NULL, NULL, NULL, NULL, 1, 1, 'DEP-N2-CAMPO', NULL, 14, NULL, NULL, true, 'PORTAL_WEB',
   'Tóner para la impresora del piso', 'La impresora del piso {piso} indica tóner bajo; solicito el reemplazo.',
   'Se instaló un tóner nuevo del stock del proveedor de impresión.'),
  ('R-IMPRESORA', 2, 'Impresión y Consumibles', 'SRV-SOL-PRN-003', NULL, NULL, NULL, NULL, NULL, 1, 1, 'DEP-N2-CAMPO', 'A-PRN-COLA', 10, NULL, NULL, true, 'PORTAL_WEB',
   'Instalar la impresora del piso en mi equipo', 'Necesito instalar la impresora del piso {piso} en mi {equipo} ({codigo}).',
   'Se instaló la impresora de red con el controlador corporativo y se imprimió una página de prueba.'),
  ('R-ALIAS', 2, 'Correo y Colaboración Empresarial', 'SRV-SOL-MAIL-001', NULL, NULL, NULL, NULL, 'CI-SVC-CORREO', 1, 1, 'DEP-N1-MESA', NULL, 6, NULL, NULL, false, 'PORTAL_WEB',
   'Crear un alias de correo', 'Necesito un alias de correo para recibir las consultas del proyecto en mi buzón.',
   'Se creó el alias en Microsoft 365 y se verificó la recepción.'),
  ('R-ACOMPANA', 2, 'Capacitación y Asistencia al Usuario', 'SRV-SOL-CAP-002', NULL, NULL, NULL, NULL, NULL, 1, 1, 'DEP-N1-MESA', NULL, 8, NULL, NULL, false, 'PORTAL_WEB',
   'Ayuda para usar OneDrive y Teams', 'Necesito una sesión corta para aprender a compartir archivos en OneDrive y Teams.',
   'Se realizó la sesión guiada de 30 minutos con el usuario.'),
  ('R-SW-LIBRE', 2, 'Instalación de Software', 'SRV-SOL-SW-003', NULL, NULL, NULL, NULL, NULL, 1, 1, 'DEP-N2-CAMPO', NULL, 10, NULL, NULL, true, 'PORTAL_WEB',
   'Instalar un compresor de archivos', 'Necesito un programa para abrir archivos comprimidos en mi {equipo} ({codigo}).',
   'Se instaló el compresor de archivos aprobado desde la fuente oficial.'),
  ('R-EXC-ESET', 2, 'Instalación de Software', 'SRV-SOL-SEC-003', NULL, NULL, NULL, NULL, NULL, 1, 1, 'DEP-SEC', 'A-ESET', 6, NULL, NULL, true, 'PORTAL_WEB',
   'Permitir una aplicación bloqueada por el antivirus', 'ESET bloquea el programa de firma de documentos que necesito en mi {equipo} ({codigo}).',
   'Seguridad validó la aplicación y creó una excepción por hash en la política del área.');

  -- Servicio real del catálogo corregido para cada escenario de incidente
  UPDATE _esc e SET servicio = m.servicio
    FROM (VALUES ('I-BATERIA', 'SRV-INC-HW-001'), ('I-NO-ENCIENDE', 'SRV-INC-HW-001'), ('I-PC-LENTA', 'SRV-INC-HW-001'),
                 ('I-TECLADO', 'SRV-INC-HW-002'), ('I-OUTLOOK', 'SRV-INC-MAIL-002'), ('I-TEAMS', 'SRV-INC-TEL-002'),
                 ('I-CARPETAS', 'SRV-INC-SW-003'), ('I-ERP-SESION', 'SRV-INC-SW-001'), ('I-ERP-LENTO', 'SRV-INC-SW-001'),
                 ('I-INTRANET', 'SRV-INC-SW-001'), ('I-PRN-P2', 'SRV-INC-PRN-001'), ('I-PRN-COLA', 'SRV-INC-PRN-001'),
                 ('I-ESET', 'SRV-INC-SEC-002'), ('I-WIN-ACT', 'SRV-INC-SW-002')) AS m(clave, servicio)
   WHERE e.clave = m.clave;

  -- ========================================================================
  -- 3. TICKETS (se arman en _tk y se insertan de una vez)
  -- ========================================================================
  CREATE TEMP TABLE _tk (
    n SERIAL, esc TEXT, tipo INTEGER, categoria TEXT, servicio TEXT, ci TEXT, impacto INTEGER, urgencia INTEGER,
    dep TEXT, art TEXT, patron TEXT, espera INTEGER, canal TEXT, derivado BOOLEAN DEFAULT false,
    solicitante INTEGER, equipo TEXT, codigo_activo TEXT, piso INTEGER, usa_equipo BOOLEAN,
    titulo TEXT, descripcion TEXT, solucion TEXT,
    t0 TIMESTAMPTZ, res_fija TIMESTAMPTZ, estado_fijo INTEGER, pendiente_aprob BOOLEAN DEFAULT false,
    ref_id INTEGER, tecnico INTEGER, es_mayor BOOLEAN DEFAULT false,
    r1 FLOAT, r2 FLOAT, r3 FLOAT, r4 FLOAT, r5 FLOAT,
    id_categoria INTEGER, id_servicio INTEGER, id_ci INTEGER, id_dep INTEGER, id_dep_emp INTEGER, id_prioridad INTEGER,
    sla_res INTEGER, sla_resp INTEGER, req_aprob BOOLEAN, paso_gate INTEGER, paso_fin INTEGER,
    estado INTEGER, rechazado BOOLEAN DEFAULT false, cancelado BOOLEAN DEFAULT false,
    aprobador INTEGER, f_aprob TIMESTAMPTZ, f_resp TIMESTAMPTZ, f_res TIMESTAMPTZ, f_cierre TIMESTAMPTZ,
    f_lim TIMESTAMPTZ, f_lim_resp TIMESTAMPTZ, pausa_min INTEGER DEFAULT 0, f_pausa TIMESTAMPTZ,
    sla_ok BOOLEAN, csat SMALLINT, f_csat TIMESTAMPTZ, codigo TEXT, id_ticket INTEGER, id_articulo INTEGER
  ) ON COMMIT DROP;

  -- 3a. Tickets de los escenarios: solicitante (y su equipo) elegido al azar
  --     entre los usuarios activos que cumplen el filtro del escenario.
  INSERT INTO _tk (esc, tipo, categoria, servicio, ci, impacto, urgencia, dep, art, patron, espera, canal,
                   solicitante, equipo, codigo_activo, piso, usa_equipo, titulo, descripcion, solucion,
                   r1, r2, r3, r4, r5)
  SELECT e.clave, e.tipo, e.categoria, e.servicio, replace(e.ci, '{piso}', COALESCE(q.piso, 1)::text), e.impacto, e.urgencia,
         e.dep, e.art, e.patron, e.espera, e.canal,
         q.uid, q.equipo, q.codigo, q.piso, e.usa_equipo,
         e.titulo,
         replace(replace(replace(e.descripcion, '{equipo}', q.equipo), '{codigo}', q.codigo), '{piso}', COALESCE(q.piso, 1)::text),
         e.solucion, random(), random(), random(), random(), random()
    FROM _esc e
    CROSS JOIN LATERAL generate_series(1, GREATEST(1, round(e.peso * v_factor)::int)) g
    CROSS JOIN LATERAL (
      SELECT a.id_usuario_custodio AS uid, a.marca || ' ' || a.modelo AS equipo, a.codigo_patrimonial AS codigo,
             (regexp_match(a.atributos ->> 'ubicacion', 'Piso (\d)'))[1]::int AS piso
        FROM activo a JOIN usuario u ON u.id_usuario = a.id_usuario_custodio AND u.estado_registro
       WHERE a.tipo_activo IN ('LAPTOP', 'DESKTOP') AND a.estado_activo = 'EN_OPERACION'
         AND (e.filtro_tipo IS NULL OR a.tipo_activo = e.filtro_tipo)
         AND (e.filtro_modelo IS NULL OR a.modelo = e.filtro_modelo)
         AND (e.piso IS NULL OR a.atributos ->> 'ubicacion' LIKE '%Piso ' || e.piso)
         AND (e.piso_excluir IS NULL OR a.atributos ->> 'ubicacion' NOT LIKE '%Piso ' || e.piso_excluir)
         AND g.g > 0
       ORDER BY random() LIMIT 1) q;

  -- Fecha de apertura: en horario de oficina (Lima), de lunes a viernes
  UPDATE _tk SET t0 = CASE
      WHEN patron = 'FIN_MES' THEN
        date_trunc('month', v_ahora - floor(r1 * 6)::int * INTERVAL '1 month') + INTERVAL '1 month' - (1 + floor(r2 * 3)::int) * INTERVAL '1 day'
      ELSE v_inicio + r1 * (v_ahora - v_inicio - INTERVAL '2 hours') END;
  -- La semana en curso tiene más movimiento: así las bandejas no quedan vacías
  UPDATE _tk SET t0 = v_ahora - r4 * INTERVAL '6 days' WHERE patron IS NULL AND r5 BETWEEN 0.5 AND 0.56;
  UPDATE _tk SET t0 = ((date_trunc('day', t0 AT TIME ZONE 'America/Lima') + INTERVAL '8 hours' + r3 * INTERVAL '10 hours')
                       + CASE extract(isodow FROM t0 AT TIME ZONE 'America/Lima') WHEN 6 THEN INTERVAL '2 days' WHEN 7 THEN INTERVAL '1 day' ELSE INTERVAL '0' END)
                      AT TIME ZONE 'America/Lima';
  UPDATE _tk SET t0 = t0 - INTERVAL '1 day' WHERE t0 > v_ahora - INTERVAL '30 minutes';
  UPDATE _tk SET t0 = t0 - INTERVAL '1 month' WHERE patron = 'FIN_MES' AND t0 > v_ahora - INTERVAL '30 minutes';

  -- 3b. Solicitudes que explican el inventario --------------------------------

  -- Cada licencia de Adobe asignada nació de una solicitud de instalación
  INSERT INTO _tk (esc, tipo, categoria, servicio, impacto, urgencia, dep, art, canal, derivado, solicitante,
                   usa_equipo, titulo, descripcion, solucion, ref_id, res_fija, r1, r2, r3, r4, r5)
  SELECT 'D-ADOBE', 2, 'Instalación de Software', 'SRV-SOL-SW-001', 1, 1, 'DEP-N3-SIST', 'A-ADOBE', 'PORTAL_WEB', true,
         la.id_usuario, false, 'Instalar Adobe Acrobat Pro',
         'Necesito Adobe Acrobat Pro para editar y firmar documentos PDF del área.',
         'Se asignó una licencia de Adobe Acrobat Pro y el usuario inició sesión con su cuenta corporativa.',
         la.id_asignacion,
         ((date_trunc('day', (v_inicio + random() * (v_ahora - v_inicio - INTERVAL '12 days')) AT TIME ZONE 'America/Lima') + INTERVAL '15 hours') AT TIME ZONE 'America/Lima'),
         random(), random(), random(), random(), random()
    FROM licencia_asignacion la JOIN licencia_software ls ON ls.id_licencia = la.id_licencia
   WHERE ls.nombre_software = 'Adobe Acrobat Pro' AND la.id_usuario IS NOT NULL AND la.fecha_devolucion IS NULL;

  -- Equipos comprados en los últimos 6 meses: solicitud de equipo nuevo,
  -- entregado el día de su alta
  INSERT INTO _tk (esc, tipo, categoria, servicio, impacto, urgencia, dep, art, canal, derivado, solicitante,
                   equipo, codigo_activo, usa_equipo, titulo, descripcion, solucion, ref_id, res_fija, r1, r2, r3, r4, r5)
  SELECT 'D-EQUIPO', 2, 'Equipamiento Nuevo', 'SRV-SOL-HW-001', 1, 2, 'DEP-N2-CAMPO', 'A-ONBOARD', 'PORTAL_WEB', true,
         a.id_usuario_custodio, a.marca || ' ' || a.modelo, a.codigo_patrimonial, true,
         'Asignación de equipo de trabajo',
         'Solicito un equipo de cómputo para el colaborador; inicia funciones esta semana.',
         'Se preparó y entregó el ' || a.marca || ' ' || a.modelo || ' (' || a.codigo_patrimonial || ') con acta firmada.',
         a.id_activo,
         ((a.fecha_adquisicion + INTERVAL '11 hours')::timestamp AT TIME ZONE 'America/Lima'),
         random(), random(), random(), random(), random()
    FROM activo a JOIN usuario u ON u.id_usuario = a.id_usuario_custodio AND u.estado_registro
   WHERE a.tipo_activo IN ('LAPTOP', 'DESKTOP') AND a.fecha_adquisicion >= (v_inicio + INTERVAL '5 days')::date
     AND (a.fecha_adquisicion + INTERVAL '11 hours')::timestamp AT TIME ZONE 'America/Lima' < v_ahora;

  -- Garantía vencida: renovación pendiente de aprobación (abierta, de los
  -- últimos 2 días: el jefe todavía no decide)
  INSERT INTO _tk (esc, tipo, categoria, servicio, impacto, urgencia, dep, canal, derivado, solicitante,
                   equipo, codigo_activo, usa_equipo, titulo, descripcion, solucion, ref_id, t0, estado_fijo,
                   pendiente_aprob, r1, r2, r3, r4, r5)
  SELECT 'D-RENOVACION', 2, 'Equipamiento Nuevo', 'SRV-SOL-HW-002', 1, 1, 'DEP-N2-CAMPO', 'PORTAL_WEB', true,
         a.id_usuario_custodio, a.marca || ' ' || a.modelo, a.codigo_patrimonial, true,
         'Renovación de equipo por garantía vencida',
         'Mi ' || a.marca || ' ' || a.modelo || ' (' || a.codigo_patrimonial || ') ya no tiene garantía desde el '
           || to_char(a.fecha_fin_garantia, 'DD/MM/YYYY') || ' y presenta lentitud. Solicito su renovación.',
         NULL, a.id_activo,
         ((date_trunc('day', (v_ahora - (1 + floor(random() * 2))::int * INTERVAL '1 day') AT TIME ZONE 'America/Lima')
           + INTERVAL '8 hours' + random() * INTERVAL '9 hours') AT TIME ZONE 'America/Lima'), 1, true,
         random(), random(), random(), random(), random()
    FROM activo a JOIN usuario u ON u.id_usuario = a.id_usuario_custodio AND u.estado_registro
   WHERE a.tipo_activo IN ('LAPTOP', 'DESKTOP') AND a.fecha_fin_garantia < CURRENT_DATE AND a.estado_activo = 'EN_OPERACION';

  -- Equipos en mantenimiento: incidente abierto, en espera del proveedor
  INSERT INTO _tk (esc, tipo, categoria, impacto, urgencia, dep, art, canal, derivado, solicitante, equipo,
                   codigo_activo, usa_equipo, titulo, descripcion, solucion, ref_id, t0, estado_fijo, espera,
                   tecnico, r1, r2, r3, r4, r5)
  SELECT 'D-REPARACION', 1, 'Hardware y Equipos', 1, 2, 'DEP-N2-CAMPO', NULL, 'PORTAL_WEB', true,
         a.id_usuario_custodio, a.marca || ' ' || a.modelo, a.codigo_patrimonial, true,
         'La batería de mi equipo se descarga en minutos',
         'Mi ' || a.marca || ' ' || a.modelo || ' (' || a.codigo_patrimonial || ') se apaga a los pocos minutos sin el cargador.',
         NULL, a.id_activo,
         ((m.fecha_programada + INTERVAL '9 hours')::timestamp AT TIME ZONE 'America/Lima') - INTERVAL '1 day',
         4, 3, m.id_usuario_responsable, random(), random(), random(), random(), random()
    FROM activo a
    JOIN mantenimiento_activo m ON m.id_activo = a.id_activo AND m.tipo = 'CORRECTIVO'
   WHERE a.estado_activo = 'MANTENIMIENTO' AND a.id_usuario_custodio IS NOT NULL;

  -- Usuarios dados de baja: su jefe pidió desactivar los accesos (cerrada)
  INSERT INTO _tk (esc, tipo, categoria, servicio, impacto, urgencia, dep, canal, derivado, solicitante,
                   usa_equipo, titulo, descripcion, solucion, ref_id, res_fija, r1, r2, r3, r4, r5)
  SELECT 'D-OFFBOARDING', 2, 'Usuarios y Accesos', 'SRV-SOL-ACC-002', 2, 3, 'DEP-N1-MESA', 'PORTAL_WEB', true,
         COALESCE((SELECT up.id_usuario FROM usuario_perfiles up JOIN usuario j ON j.id_usuario = up.id_usuario AND j.estado_registro
                    WHERE up.id_perfil = 5 AND j.id_departamento_empresa = u.id_departamento_empresa ORDER BY 1 LIMIT 1), v_registrador),
         false, 'Desactivar accesos por cese de ' || u.nombres || ' ' || u.apellido_paterno,
         'El colaborador ' || u.nombres || ' ' || u.apellido_paterno || ' cesó en sus funciones. Solicito desactivar sus accesos.',
         'Se deshabilitó la cuenta de dominio, se convirtió el buzón en compartido y se retiraron sus licencias.',
         u.id_usuario,
         v_inicio + random() * (v_ahora - v_inicio - INTERVAL '3 days'),
         random(), random(), random(), random(), random()
    FROM usuario u WHERE u.estado_registro = false;

  -- 3c. Caída grave: Host de virtualización 02 ------------------------------
  v_mayor := ((date_trunc('day', (v_ahora - INTERVAL '62 days') AT TIME ZONE 'America/Lima') + INTERVAL '10 hours 12 minutes') AT TIME ZONE 'America/Lima');
  v_mayor := v_mayor + CASE extract(isodow FROM v_mayor AT TIME ZONE 'America/Lima') WHEN 6 THEN INTERVAL '2 days' WHEN 7 THEN INTERVAL '1 day' ELSE INTERVAL '0' END;

  INSERT INTO _tk (esc, tipo, categoria, ci, impacto, urgencia, dep, art, canal, derivado, solicitante, usa_equipo,
                   titulo, descripcion, solucion, t0, res_fija, es_mayor, tecnico, r1, r2, r3, r4, r5)
  SELECT 'D-MAYOR', 1, 'Hardware y Equipos', 'CI-HOST-02', 3, 3, 'DEP-N3-SIST', 'A-HOST', 'LLAMADA_TELEFONICA', true,
         t.id_usuario, false,
         'Caída del Host de virtualización 02',
         'El monitoreo reporta que el Host de virtualización 02 no responde. Afecta a la base de datos del ERP y a la intranet.',
         'Falla de la controladora de discos. Se reinició el host desde la consola remota, se validaron las VM del ERP y de la intranet y se abrió caso de garantía con el fabricante.',
         v_mayor, v_mayor + INTERVAL '2 hours 35 minutes', true, t.id_usuario,
         random(), random(), random(), random(), random()
    FROM _tec t WHERE t.dep = 'DEP-N3-SIST' ORDER BY t.id_usuario LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO _tk (esc, tipo, categoria, ci, impacto, urgencia, dep, art, canal, derivado, solicitante, usa_equipo,
                     titulo, descripcion, solucion, t0, res_fija, es_mayor, tecnico, r1, r2, r3, r4, r5)
    SELECT 'D-MAYOR', 1, 'Hardware y Equipos', 'CI-HOST-02', 3, 3, 'DEP-N3-SIST', 'A-HOST', 'LLAMADA_TELEFONICA', true,
           t.id_usuario, false, 'Caída del Host de virtualización 02',
           'El monitoreo reporta que el Host de virtualización 02 no responde. Afecta a la base de datos del ERP y a la intranet.',
           'Falla de la controladora de discos. Se reinició el host desde la consola remota y se validaron las VM afectadas.',
           v_mayor, v_mayor + INTERVAL '2 hours 35 minutes', true, t.id_usuario, random(), random(), random(), random(), random()
      FROM _tec t ORDER BY t.id_usuario LIMIT 1;
  END IF;

  -- Reportes de usuarios durante la caída (se resuelven al recuperar el host)
  INSERT INTO _tk (esc, tipo, categoria, ci, impacto, urgencia, dep, canal, derivado, solicitante, usa_equipo,
                   titulo, descripcion, solucion, t0, res_fija, r1, r2, r3, r4, r5)
  SELECT 'D-MAYOR-USR', 1, 'Software y Aplicaciones', CASE WHEN g % 3 = 0 THEN 'CI-SVC-INTRA' ELSE 'CI-SVC-ERP' END,
         2, 3, 'DEP-N3-SIST', CASE WHEN g % 2 = 0 THEN 'LLAMADA_TELEFONICA' ELSE 'PORTAL_WEB' END, true,
         q.uid, false,
         CASE WHEN g % 3 = 0 THEN 'La intranet no abre' ELSE 'El ERP no responde' END,
         CASE WHEN g % 3 = 0 THEN 'No puedo ingresar a la intranet, se queda en blanco.'
              ELSE 'El ERP financiero muestra error de conexión y no puedo registrar operaciones.' END,
         'Servicio restablecido al recuperar el Host de virtualización 02 (ver {MAYOR}).',
         v_mayor + (3 + g * 4) * INTERVAL '1 minute', v_mayor + INTERVAL '2 hours 40 minutes' + g * INTERVAL '1 minute',
         random(), random(), random(), random(), random()
    FROM generate_series(1, GREATEST(6, round(12 * v_usuarios / 200.0)::int)) g
    CROSS JOIN LATERAL (SELECT id_usuario AS uid FROM usuario WHERE estado_registro AND g > 0 ORDER BY random() LIMIT 1) q;

  -- 3d. Catálogos: categoría, servicio, CI, área, prioridad y SLA ------------
  UPDATE _tk t SET id_categoria = COALESCE(
      (SELECT c.id_categoria FROM categoria_ticket c WHERE c.nombre = t.categoria AND c.id_tipo_ticket = t.tipo AND c.estado_registro ORDER BY 1 LIMIT 1),
      (SELECT c.id_categoria FROM categoria_ticket c WHERE c.id_tipo_ticket = t.tipo AND c.estado_registro ORDER BY 1 LIMIT 1));
  UPDATE _tk SET servicio = CASE esc WHEN 'D-REPARACION' THEN 'SRV-INC-HW-001' WHEN 'D-MAYOR' THEN 'SRV-INC-INF-001'
                                       WHEN 'D-MAYOR-USR' THEN 'SRV-INC-SW-001' ELSE servicio END;
  UPDATE _tk t SET id_servicio = s.id_servicio, req_aprob = s.requiere_aprobacion
    FROM servicio_catalogo s WHERE s.codigo_servicio = t.servicio AND s.estado_registro;
  -- La categoría del ticket es la de su servicio (así cuadra con el catálogo)
  UPDATE _tk t SET id_categoria = s.id_categoria
    FROM servicio_catalogo s WHERE s.id_servicio = t.id_servicio AND s.id_categoria IS NOT NULL;
  UPDATE _tk t SET id_ci = ci.id_ci FROM elemento_configuracion ci WHERE ci.codigo_ci = t.ci;
  UPDATE _tk t SET id_dep = d.id_departamento FROM departamento_ti d WHERE d.codigo = t.dep;
  UPDATE _tk t SET id_dep = COALESCE(s.id_departamento_resolutor, t.id_dep)
    FROM servicio_catalogo s WHERE s.id_servicio = t.id_servicio;
  UPDATE _tk t SET id_dep_emp = u.id_departamento_empresa FROM usuario u WHERE u.id_usuario = t.solicitante;
  UPDATE _tk t SET id_prioridad = p.id_prioridad, sla_res = p.tiempo_resolucion_horas, sla_resp = p.tiempo_primera_respuesta_hrs
    FROM prioridad_ticket p WHERE p.codigo = fn_calcular_prioridad_itil(
           (SELECT i.id_impacto FROM impacto_ticket i WHERE i.nivel = t.impacto ORDER BY 1 LIMIT 1),
           (SELECT u.id_urgencia FROM urgencia_ticket u WHERE u.nivel = t.urgencia ORDER BY 1 LIMIT 1));
  UPDATE _tk t SET sla_res = CASE WHEN s.sla_horas_resolucion > 0 THEN s.sla_horas_resolucion ELSE t.sla_res END,
                   sla_resp = CASE WHEN s.sla_horas_respuesta > 0 THEN s.sla_horas_respuesta ELSE t.sla_resp END
    FROM servicio_catalogo s WHERE s.id_servicio = t.id_servicio;
  UPDATE _tk t SET paso_gate = (SELECT p.id_paso FROM servicio_workflow_paso p WHERE p.id_servicio = t.id_servicio AND p.es_compuerta_aprobacion AND p.estado_registro ORDER BY p.orden LIMIT 1),
                   paso_fin  = (SELECT p.id_paso FROM servicio_workflow_paso p WHERE p.id_servicio = t.id_servicio AND p.estado_registro ORDER BY p.orden DESC LIMIT 1)
   WHERE t.id_servicio IS NOT NULL;
  UPDATE _tk SET req_aprob = COALESCE(req_aprob, false) AND tipo = 2;

  -- Técnico del área que resuelve (si el área no tiene técnicos, cualquiera)
  UPDATE _tk t SET tecnico = COALESCE(
      (SELECT x.id_usuario FROM _tec x WHERE x.id_departamento = t.id_dep AND t.n > 0 ORDER BY random() LIMIT 1),
      (SELECT x.id_usuario FROM _tec x WHERE t.n > 0 ORDER BY random() LIMIT 1))
   WHERE tecnico IS NULL;

  -- Aprobador: un Gestor de Área (perfil 5) del departamento del solicitante;
  -- si no hay, un Aprobador (perfil 7) o el administrador
  UPDATE _tk t SET aprobador = COALESCE(
      (SELECT up.id_usuario FROM usuario_perfiles up JOIN usuario u ON u.id_usuario = up.id_usuario AND u.estado_registro
        WHERE up.id_perfil = 5 AND u.id_departamento_empresa = t.id_dep_emp AND up.id_usuario <> t.solicitante ORDER BY 1 LIMIT 1),
      (SELECT up.id_usuario FROM usuario_perfiles up JOIN usuario u ON u.id_usuario = up.id_usuario AND u.estado_registro
        WHERE up.id_perfil IN (5, 7) AND up.id_usuario <> t.solicitante ORDER BY up.id_perfil, 1 LIMIT 1),
      v_registrador)
   WHERE req_aprob;

  -- Solicitudes con aprobación abiertas hace menos de un día: aún pendientes
  UPDATE _tk SET pendiente_aprob = true, estado_fijo = 1
   WHERE req_aprob AND NOT derivado AND t0 > v_ahora - INTERVAL '1 day';

  -- 3e. Ciclo de vida (misma lógica que los procedimientos de la app) -------
  -- Derivados con fecha de solución fija: la apertura se calcula hacia atrás
  UPDATE _tk SET t0 = res_fija - (sla_res * (0.2 + r4 * 0.6)) * INTERVAL '1 hour'
   WHERE res_fija IS NOT NULL AND t0 IS NULL;
  -- ...y también cae en horario de oficina (si no, el día hábil anterior)
  UPDATE _tk SET t0 = (date_trunc('day', t0 AT TIME ZONE 'America/Lima') + INTERVAL '8 hours' + r5 * INTERVAL '2 hours') AT TIME ZONE 'America/Lima'
   WHERE derivado AND res_fija IS NOT NULL AND NOT es_mayor AND esc <> 'D-MAYOR-USR'
     AND extract(hour FROM t0 AT TIME ZONE 'America/Lima') NOT BETWEEN 8 AND 17;
  UPDATE _tk SET t0 = t0 - INTERVAL '1 day' WHERE derivado AND res_fija IS NOT NULL AND t0 > res_fija - INTERVAL '1 hour';

  UPDATE _tk SET
    f_lim_resp = t0 + sla_resp * INTERVAL '1 hour',
    f_aprob    = CASE WHEN req_aprob AND NOT pendiente_aprob THEN t0 + (0.5 + r2 * 5) * INTERVAL '1 hour' END,
    rechazado  = req_aprob AND NOT pendiente_aprob AND NOT derivado AND r4 < 0.04,
    pausa_min  = CASE WHEN espera IS NOT NULL AND estado_fijo IS NULL AND r5 < 0.4 THEN (240 + r2 * 2600)::int ELSE 0 END;

  UPDATE _tk SET
    f_resp = GREATEST(t0 + sla_resp * INTERVAL '1 hour' * CASE WHEN r1 < 0.06 THEN 1.1 + r2 * 0.5 ELSE 0.1 + r2 * 0.7 END,
                      COALESCE(f_aprob + INTERVAL '10 minutes', t0)),
    f_lim  = t0 + sla_res * INTERVAL '1 hour' + pausa_min * INTERVAL '1 minute';
  UPDATE _tk SET
    f_res = COALESCE(res_fija,
                     t0 + sla_res * INTERVAL '1 hour' * CASE WHEN r3 < 0.11 THEN 1.05 + r4 * 0.9 ELSE 0.15 + r4 * 0.8 END
                        + pausa_min * INTERVAL '1 minute');
  UPDATE _tk SET f_resp = LEAST(f_resp, f_res - INTERVAL '5 minutes') WHERE f_res - INTERVAL '5 minutes' > t0;
  UPDATE _tk SET f_res = GREATEST(f_res, f_resp + INTERVAL '15 minutes') WHERE res_fija IS NULL;
  -- La aprobación ocurre antes de que el técnico tome el caso
  UPDATE _tk SET f_aprob = LEAST(f_aprob, t0 + (f_res - t0) * 0.25) WHERE f_aprob IS NOT NULL;
  UPDATE _tk SET f_resp = GREATEST(f_resp, f_aprob + (f_res - f_aprob) * 0.2) WHERE f_aprob IS NOT NULL;
  UPDATE _tk SET f_cierre = f_res + (1 + r1 * 2) * INTERVAL '1 day';
  UPDATE _tk SET f_pausa = f_resp + INTERVAL '20 minutes' WHERE pausa_min > 0;

  -- Estado según lo que ya ocurrió hasta hoy
  UPDATE _tk SET estado = CASE
      WHEN estado_fijo IS NOT NULL THEN estado_fijo
      WHEN rechazado THEN 7
      -- Lo que llegó en los últimos 4 días y aún tiene trabajo pendiente
      -- Todavía no se resuelve, o llegó hace poco y sigue en cola. Casi todos
      -- siguen dentro de plazo; cerca de 1 de cada 4 de la cola ya venció.
      WHEN f_res > v_ahora OR (NOT derivado AND t0 > v_ahora - INTERVAL '4 days' AND r2 < 0.45
                               AND (t0 + sla_res * INTERVAL '1 hour' > v_ahora OR r3 < 0.25)) THEN CASE
           WHEN t0 > v_ahora - INTERVAL '2 hours' AND r1 < 0.5 THEN 1
           WHEN espera IS NOT NULL AND r5 < 0.5 THEN 4
           WHEN r4 < 0.3 THEN 2 ELSE 3 END
      WHEN f_cierre > v_ahora THEN 5
      WHEN NOT derivado AND r5 > 0.975 THEN 7
      ELSE 6 END;
  UPDATE _tk SET cancelado = true WHERE estado = 7 AND NOT rechazado;

  -- Limpieza de fechas que todavía no ocurrieron
  UPDATE _tk SET f_res = NULL, f_cierre = NULL WHERE estado IN (1, 2, 3, 4, 7);
  UPDATE _tk SET f_cierre = NULL WHERE estado = 5;
  UPDATE _tk SET f_resp = NULL WHERE estado IN (1, 2) OR (estado = 7 AND (rechazado OR f_resp > v_ahora));
  UPDATE _tk SET tecnico = NULL WHERE estado = 1 OR rechazado;
  -- Si la primera respuesta todavía no ocurrió, el ticket sigue solo asignado
  UPDATE _tk SET f_resp = NULL, estado = 2 WHERE estado = 3 AND f_resp > v_ahora;
  UPDATE _tk SET f_aprob = NULL WHERE pendiente_aprob;
  UPDATE _tk SET pausa_min = 0, f_lim = t0 + sla_res * INTERVAL '1 hour' WHERE estado <> 6 AND estado <> 5;
  UPDATE _tk SET f_pausa = CASE WHEN estado = 4 THEN LEAST(COALESCE(f_resp, t0) + INTERVAL '30 minutes', v_ahora - INTERVAL '10 minutes') END
   WHERE estado <> 5 AND estado <> 6;
  UPDATE _tk SET f_resp = LEAST(COALESCE(f_resp, t0 + INTERVAL '15 minutes'), f_pausa - INTERVAL '5 minutes') WHERE estado = 4;
  UPDATE _tk SET sla_ok = (f_res <= f_lim) WHERE estado IN (5, 6);

  -- Encuesta de satisfacción: 6 de cada 10 tickets cerrados
  UPDATE _tk SET
    csat = CASE WHEN sla_ok THEN CASE WHEN r4 < 0.7 THEN 5 WHEN r4 < 0.93 THEN 4 ELSE 3 END
                ELSE CASE WHEN r4 < 0.4 THEN 4 WHEN r4 < 0.75 THEN 3 ELSE 2 END END,
    f_csat = f_res + (f_cierre - f_res) * 0.5
   WHERE estado = 6 AND r3 < 0.6;

  -- 3f. Códigos INC-AAAA-NNNN / REQ-AAAA-NNNN en orden de apertura
  UPDATE _tk t SET codigo = x.cod
    FROM (SELECT n, tt.prefijo_codigo || '-' || to_char(t0 AT TIME ZONE 'America/Lima', 'YYYY') || '-' ||
                 lpad(row_number() OVER (PARTITION BY tk.tipo, to_char(t0 AT TIME ZONE 'America/Lima', 'YYYY') ORDER BY t0, n)::text, 4, '0') AS cod
            FROM _tk tk JOIN tipo_ticket tt ON tt.id_tipo_ticket = tk.tipo) x
   WHERE x.n = t.n;
  UPDATE _tk SET solucion = replace(solucion, '{MAYOR}', (SELECT codigo FROM _tk WHERE es_mayor LIMIT 1))
   WHERE solucion LIKE '%{MAYOR}%';

  -- ========================================================================
  -- 4. ARTÍCULOS QUE NACEN DE TICKETS
  --    Tras el 6.º ticket resuelto del escenario, el técnico que lo resolvió
  --    redacta el artículo; Supervisión lo publica dos días después.
  -- ========================================================================
  UPDATE _art a SET autor = x.tecnico, f_creacion = x.f_res + INTERVAL '2 hours'
    FROM (SELECT DISTINCT ON (art) art, tecnico, f_res
            FROM (SELECT art, tecnico, f_res, row_number() OVER (PARTITION BY art ORDER BY f_res) AS k
                    FROM _tk WHERE art LIKE 'N-%' AND f_res IS NOT NULL AND tecnico IS NOT NULL) y
           WHERE k = 6 ORDER BY art) x
   WHERE a.clave = x.art;
  UPDATE _art SET autor = COALESCE(autor, (SELECT id_usuario FROM _tec t WHERE t.dep = _art.area ORDER BY 1 LIMIT 1), (SELECT id_usuario FROM _tec ORDER BY 1 LIMIT 1)),
                  f_creacion = COALESCE(f_creacion, v_ahora - INTERVAL '3 days')
   WHERE origen = 'NACE';
  UPDATE _art SET f_publicacion = f_creacion + INTERVAL '2 days', estado = 'PUBLICADO'
   WHERE origen = 'NACE' AND f_creacion + INTERVAL '2 days' < v_ahora;
  UPDATE _art SET estado = 'EN_REVISION' WHERE origen = 'NACE' AND f_publicacion IS NULL;

  UPDATE _art a SET codigo = x.cod
    FROM (SELECT clave, 'ART-' || to_char(f_creacion AT TIME ZONE 'America/Lima', 'YYYY') || '-' ||
                 lpad(row_number() OVER (ORDER BY f_creacion, clave)::text, 3, '0') AS cod FROM _art) x
   WHERE x.clave = a.clave;

  -- Ficha del ticket ↔ artículo: solo si el artículo ya estaba publicado
  -- cuando el técnico atendió el caso
  UPDATE _tk t SET solucion = 'Según el artículo ' || a.codigo || ': ' || t.solucion
    FROM _art a
   WHERE a.clave = t.art AND a.f_publicacion IS NOT NULL AND a.f_publicacion <= COALESCE(t.f_resp, t.t0)
     AND t.estado IN (5, 6);

  -- Inserción de artículos, su historial editorial y su primera versión
  INSERT INTO articulo_conocimiento (codigo_articulo, titulo, contenido_markdown, id_categoria, estado_editorial, id_autor, id_revisor,
                                     fecha_publicacion, usuario_creacion, fecha_creacion, audiencia_perfiles, fecha_revision,
                                     tipo_plantilla, clasificacion_seguridad)
  SELECT a.codigo, a.titulo, a.contenido,
         (SELECT c.id_categoria FROM categoria_ticket c WHERE c.nombre = a.categoria AND c.id_tipo_ticket = a.tipo_cat ORDER BY 1 LIMIT 1),
         a.estado, a.autor, CASE WHEN a.estado = 'PUBLICADO' THEN v_revisor END,
         a.f_publicacion, a.autor, a.f_creacion,
         CASE WHEN a.publico THEN ARRAY[2,3,4,5,6,7,8,9]::int2[] ELSE ARRAY[2,4,8,9]::int2[] END,
         CASE WHEN a.estado = 'PUBLICADO' THEN (a.f_publicacion + INTERVAL '1 year')::date END,
         'SOLUCION', CASE WHEN a.publico THEN 'PUBLICO' ELSE 'INTERNO' END
    FROM _art a ORDER BY a.f_creacion;
  UPDATE _art a SET id_articulo = ac.id_articulo FROM articulo_conocimiento ac WHERE ac.codigo_articulo = a.codigo;

  INSERT INTO articulo_conocimiento_historial (id_articulo, estado_anterior, estado_nuevo, comentario, id_usuario, fecha)
  SELECT id_articulo, NULL, CASE WHEN estado = 'BORRADOR' THEN 'BORRADOR' ELSE 'EN_REVISION' END,
         CASE WHEN estado = 'BORRADOR' THEN 'Borrador inicial' ELSE 'Envío inicial a revisión editorial' END, autor, f_creacion
    FROM _art
  UNION ALL
  SELECT id_articulo, 'EN_REVISION', 'PUBLICADO', 'Revisado y publicado', v_revisor, f_publicacion
    FROM _art WHERE estado = 'PUBLICADO';

  INSERT INTO articulo_conocimiento_version (id_articulo, numero_version, titulo, contenido_markdown, motivo_cambio, id_autor, fecha_creacion)
  SELECT id_articulo, '1.0', titulo, contenido, 'Versión inicial', autor, f_creacion FROM _art;

  -- ========================================================================
  -- 5. INSERCIÓN DE TICKETS Y SU DETALLE
  -- ========================================================================
  INSERT INTO ticket (codigo_ticket, titulo, descripcion, id_tipo_ticket, id_categoria, id_impacto, id_urgencia, id_prioridad,
                      id_estado, id_motivo_espera, id_usuario_solicitante, id_usuario_asignado, solucion_aplicada, motivo_cancelacion,
                      fecha_limite_sla, fecha_primera_respuesta, fecha_resolucion, fecha_cierre, sla_cumplido,
                      usuario_creacion, fecha_creacion, usuario_modificacion, fecha_modificacion,
                      id_servicio, id_departamento, canal_comunicacion, calificacion_csat, comentario_csat, fecha_csat,
                      tiempo_pausado_minutos, fecha_ultima_pausa, campos_adicionales, id_ci, id_departamento_empresa,
                      fecha_limite_respuesta_sla)
  SELECT t.codigo, t.titulo, t.descripcion, t.tipo, t.id_categoria,
         (SELECT id_impacto FROM impacto_ticket WHERE nivel = t.impacto ORDER BY 1 LIMIT 1),
         (SELECT id_urgencia FROM urgencia_ticket WHERE nivel = t.urgencia ORDER BY 1 LIMIT 1),
         t.id_prioridad, t.estado, CASE WHEN t.estado = 4 THEN t.espera END,
         t.solicitante, t.tecnico,
         CASE WHEN t.estado IN (5, 6) THEN t.solucion END,
         CASE WHEN t.rechazado THEN 'Compuerta de aprobación RECHAZADA: la solicitud no está justificada para el área.'
              WHEN t.cancelado THEN 'El usuario indicó que el inconveniente se resolvió por sí solo.' END,
         t.f_lim, t.f_resp, t.f_res, t.f_cierre, t.sla_ok,
         t.solicitante, t.t0,
         COALESCE(t.tecnico, t.aprobador, t.solicitante),
         GREATEST(t.t0, t.f_aprob, t.f_resp, t.f_pausa, t.f_res, t.f_csat, t.f_cierre),
         t.id_servicio, t.id_dep, t.canal,
         t.csat,
         CASE t.csat WHEN 5 THEN 'Excelente atención, muy rápido.' WHEN 4 THEN 'Buena atención.' WHEN 3 THEN 'Se resolvió, pero tardó.'
                     WHEN 2 THEN 'Demoró demasiado.' END,
         t.f_csat, t.pausa_min, CASE WHEN t.estado = 4 THEN t.f_pausa END,
         CASE WHEN t.usa_equipo AND t.codigo_activo IS NOT NULL
              THEN jsonb_build_object('activo_afectado', t.codigo_activo, 'equipo', t.equipo) ELSE '{}'::jsonb END,
         t.id_ci, t.id_dep_emp, t.f_lim_resp
    FROM _tk t ORDER BY t.t0, t.n;
  UPDATE _tk t SET id_ticket = x.id_ticket FROM ticket x WHERE x.codigo_ticket = t.codigo;

  -- Subtipos (el trigger ya creó las filas)
  UPDATE ticket_incidente ti SET es_incidente_mayor = true FROM _tk t WHERE t.id_ticket = ti.id_ticket AND t.es_mayor;
  UPDATE ticket_solicitud ts SET
      estado_aprobacion = CASE WHEN NOT t.req_aprob THEN 'NO_APLICA' WHEN t.pendiente_aprob THEN 'PENDIENTE_APROBACION'
                               WHEN t.rechazado THEN 'RECHAZADO' ELSE 'APROBADO' END,
      id_paso_actual = CASE WHEN t.pendiente_aprob THEN t.paso_gate WHEN t.estado IN (5, 6) THEN t.paso_fin END
    FROM _tk t WHERE t.id_ticket = ts.id_ticket;

  -- Aprobaciones
  INSERT INTO ticket_aprobacion (id_ticket, id_usuario_aprobador, id_paso_workflow, estado_decision, comentario, fecha_decision)
  SELECT id_ticket, aprobador, paso_gate, CASE WHEN rechazado THEN 'RECHAZADO' ELSE 'APROBADO' END,
         CASE WHEN rechazado THEN 'No está justificado para el área.' ELSE 'Conforme.' END, f_aprob
    FROM _tk WHERE f_aprob IS NOT NULL;

  -- Bitácora (comentarios) con la misma redacción de los procedimientos
  INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado, fecha_creacion)
  SELECT id_ticket, solicitante,
         'Ticket ' || codigo || ' registrado en Service Desk mediante Stored Procedure.' ||
         CASE WHEN req_aprob THEN ' Sujeto a compuerta de aprobación.' ELSE '' END, false, NULL::int, t0
    FROM _tk
  UNION ALL
  SELECT t.id_ticket, t.aprobador,
         'Compuerta de aprobación ' || CASE WHEN t.rechazado THEN 'RECHAZADA' ELSE 'APROBADA' END || ' por ' || u.nombres || ' ' || u.apellido_paterno || '.',
         false, CASE WHEN t.rechazado THEN 7 ELSE 2 END, t.f_aprob
    FROM _tk t JOIN usuario u ON u.id_usuario = t.aprobador WHERE t.f_aprob IS NOT NULL
  UNION ALL
  SELECT id_ticket, tecnico, 'Tomo el caso y reviso con el usuario.', false, 3, f_resp
    FROM _tk WHERE f_resp IS NOT NULL AND tecnico IS NOT NULL
  UNION ALL
  SELECT t.id_ticket, t.tecnico, 'En espera: ' || m.nombre || '.', false, 4, t.f_pausa
    FROM _tk t JOIN motivo_espera_ticket m ON m.id_motivo_espera = t.espera
   WHERE t.f_pausa IS NOT NULL AND t.tecnico IS NOT NULL
  UNION ALL
  SELECT id_ticket, tecnico, 'Se reanuda la atención.', false, 3, f_pausa + pausa_min * INTERVAL '1 minute'
    FROM _tk WHERE pausa_min > 0 AND estado IN (5, 6)
  UNION ALL
  SELECT id_ticket, tecnico, 'Solución: ' || solucion, false, 5, f_res
    FROM _tk WHERE estado IN (5, 6)
  UNION ALL
  SELECT id_ticket, COALESCE(tecnico, solicitante), 'Cierre tras la conformidad del usuario.', false, 6, f_cierre
    FROM _tk WHERE estado = 6
  UNION ALL
  SELECT id_ticket, solicitante, 'El usuario indicó que el inconveniente se resolvió por sí solo.', false, 7, t0 + INTERVAL '40 minutes'
    FROM _tk WHERE cancelado
  UNION ALL
  SELECT id_ticket, solicitante, 'Evaluación CSAT registrada: ' || csat || '/5 estrellas.', false, NULL, f_csat
    FROM _tk WHERE csat IS NOT NULL;

  -- Vínculos artículo ↔ ticket (el técnico usó el artículo)
  INSERT INTO articulo_conocimiento_vinculo_ticket (id_articulo, id_ticket, id_tecnico, resolvio_ticket, fecha_vinculo)
  SELECT a.id_articulo, t.id_ticket, t.tecnico, t.estado IN (5, 6), LEAST(COALESCE(t.f_res - INTERVAL '10 minutes', t.f_resp + INTERVAL '10 minutes'), v_ahora)
    FROM _tk t JOIN _art a ON a.clave = t.art
   WHERE a.f_publicacion IS NOT NULL AND a.f_publicacion <= COALESCE(t.f_resp, t.t0)
     AND t.tecnico IS NOT NULL AND t.estado IN (3, 4, 5, 6) AND t.f_resp IS NOT NULL;

  -- Valoraciones de los artículos por los usuarios atendidos (3 de cada 10)
  INSERT INTO articulo_conocimiento_feedback (id_articulo, id_usuario, es_positivo, motivo_negativo, comentario, ip, fecha)
  SELECT v.id_articulo, t.solicitante, t.r2 < 0.88,
         CASE WHEN t.r2 >= 0.88 THEN 'No resolvió mi caso por completo' END,
         CASE WHEN t.r2 < 0.88 THEN 'Me sirvió.' END, '10.10.' || COALESCE(t.piso, 1) || '.' || (100 + t.n % 120),
         v.fecha_vinculo + INTERVAL '1 day'
    FROM articulo_conocimiento_vinculo_ticket v JOIN _tk t ON t.id_ticket = v.id_ticket
   WHERE v.resolvio_ticket AND t.r1 < 0.3 AND v.fecha_vinculo + INTERVAL '1 day' < v_ahora;

  -- Contadores calculados de los datos (nunca escritos a mano)
  UPDATE articulo_conocimiento ac SET
    veces_utilizado_en_tickets = (SELECT COUNT(*) FROM articulo_conocimiento_vinculo_ticket v WHERE v.id_articulo = ac.id_articulo),
    utilidad_positiva = (SELECT COUNT(*) FROM articulo_conocimiento_feedback f WHERE f.id_articulo = ac.id_articulo AND f.es_positivo),
    utilidad_negativa = (SELECT COUNT(*) FROM articulo_conocimiento_feedback f WHERE f.id_articulo = ac.id_articulo AND NOT f.es_positivo);
  UPDATE articulo_conocimiento SET visitas = veces_utilizado_en_tickets * 3 + utilidad_positiva + utilidad_negativa + floor(random() * 40)::int
   WHERE estado_editorial = 'PUBLICADO';

  -- Inventario: cada licencia de Adobe se asignó el día que se resolvió su solicitud
  UPDATE licencia_asignacion la SET fecha_asignacion = (t.f_res AT TIME ZONE 'America/Lima')::date
    FROM _tk t WHERE t.esc = 'D-ADOBE' AND t.ref_id = la.id_asignacion AND t.f_res IS NOT NULL;

  -- ========================================================================
  -- 6. VALIDACIÓN FINAL: si algo no cuadra, se revierte todo
  -- ========================================================================
  IF EXISTS (SELECT 1 FROM ticket t JOIN usuario u ON u.id_usuario = t.id_usuario_solicitante WHERE NOT u.estado_registro) THEN
    v_problemas := v_problemas || ' · tickets de solicitantes inactivos';
  END IF;
  IF EXISTS (SELECT 1 FROM ticket t WHERE t.id_usuario_asignado IS NOT NULL
               AND NOT EXISTS (SELECT 1 FROM _tec x WHERE x.id_usuario = t.id_usuario_asignado)) THEN
    v_problemas := v_problemas || ' · tickets asignados a quien no es técnico activo';
  END IF;
  IF EXISTS (SELECT 1 FROM ticket WHERE fecha_primera_respuesta < fecha_creacion OR fecha_resolucion < fecha_primera_respuesta
               OR fecha_cierre < fecha_resolucion OR fecha_cierre > v_ahora OR fecha_resolucion > v_ahora OR fecha_creacion > v_ahora) THEN
    v_problemas := v_problemas || ' · fechas fuera de orden';
  END IF;
  IF EXISTS (SELECT 1 FROM ticket WHERE id_estado IN (5, 6) AND (solucion_aplicada IS NULL OR fecha_resolucion IS NULL OR sla_cumplido IS NULL)) THEN
    v_problemas := v_problemas || ' · tickets resueltos sin solución o sin SLA';
  END IF;
  IF EXISTS (SELECT 1 FROM ticket WHERE id_estado IN (1, 2, 3, 4) AND (fecha_resolucion IS NOT NULL OR fecha_cierre IS NOT NULL)) THEN
    v_problemas := v_problemas || ' · tickets abiertos con fecha de resolución';
  END IF;
  IF EXISTS (SELECT 1 FROM articulo_conocimiento_vinculo_ticket v JOIN articulo_conocimiento a ON a.id_articulo = v.id_articulo
               JOIN ticket t ON t.id_ticket = v.id_ticket
              WHERE a.fecha_publicacion IS NULL OR a.fecha_publicacion > COALESCE(t.fecha_primera_respuesta, t.fecha_creacion)) THEN
    v_problemas := v_problemas || ' · tickets vinculados a artículos que aún no existían';
  END IF;
  IF EXISTS (SELECT 1 FROM articulo_conocimiento a
              WHERE a.veces_utilizado_en_tickets <> (SELECT COUNT(*) FROM articulo_conocimiento_vinculo_ticket v WHERE v.id_articulo = a.id_articulo)) THEN
    v_problemas := v_problemas || ' · usos de artículos que no coinciden con sus vínculos';
  END IF;
  IF EXISTS (SELECT 1 FROM ticket_solicitud ts JOIN ticket t USING (id_ticket)
              WHERE ts.estado_aprobacion = 'PENDIENTE_APROBACION' AND t.id_estado <> 1) THEN
    v_problemas := v_problemas || ' · solicitudes pendientes de aprobación fuera de estado Abierto';
  END IF;
  IF EXISTS (SELECT 1 FROM licencia_asignacion la JOIN licencia_software ls USING (id_licencia)
              WHERE ls.nombre_software = 'Adobe Acrobat Pro' AND la.id_usuario IS NOT NULL
                AND NOT EXISTS (SELECT 1 FROM ticket t WHERE t.id_usuario_solicitante = la.id_usuario
                                  AND t.titulo = 'Instalar Adobe Acrobat Pro'
                                  AND (t.fecha_resolucion AT TIME ZONE 'America/Lima')::date = la.fecha_asignacion)) THEN
    v_problemas := v_problemas || ' · licencias de Adobe sin su solicitud';
  END IF;
  IF EXISTS (SELECT 1 FROM ticket t JOIN servicio_catalogo s ON s.id_servicio = t.id_servicio
              WHERE NOT s.estado_registro OR (s.id_categoria IS NOT NULL AND s.id_categoria <> t.id_categoria)) THEN
    v_problemas := v_problemas || ' · tickets con servicio dado de baja o con categoría distinta a la de su servicio';
  END IF;
  IF EXISTS (SELECT 1 FROM _esc e WHERE e.servicio IS NOT NULL
               AND NOT EXISTS (SELECT 1 FROM servicio_catalogo s WHERE s.codigo_servicio = e.servicio AND s.estado_registro)) THEN
    v_problemas := v_problemas || ' · escenarios cuyo servicio no existe en el catálogo ('
      || (SELECT string_agg(e.servicio, ', ') FROM _esc e WHERE e.servicio IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM servicio_catalogo s WHERE s.codigo_servicio = e.servicio AND s.estado_registro)) || ')';
  END IF;

  IF v_problemas <> '' THEN
    RAISE EXCEPTION 'La carga no cuadra y se revirtió:%', v_problemas;
  END IF;

  RAISE NOTICE 'Carga completa: % artículos, % incidentes, % solicitudes, % vínculos artículo-ticket.',
    (SELECT COUNT(*) FROM articulo_conocimiento), (SELECT COUNT(*) FROM ticket WHERE id_tipo_ticket = 1),
    (SELECT COUNT(*) FROM ticket WHERE id_tipo_ticket = 2), (SELECT COUNT(*) FROM articulo_conocimiento_vinculo_ticket);
END $$;

-- Verificación: resumen por tipo y estado, y controles de cuadre (en 0)
SELECT tt.nombre AS tipo, e.nombre AS estado, COUNT(*) AS tickets,
       ROUND(100.0 * COUNT(*) FILTER (WHERE t.sla_cumplido) / NULLIF(COUNT(t.sla_cumplido), 0), 1) AS pct_sla_cumplido
  FROM ticket t JOIN tipo_ticket tt USING (id_tipo_ticket) JOIN estado_ticket e USING (id_estado)
 GROUP BY tt.nombre, e.nombre, e.orden ORDER BY tt.nombre, e.orden;

SELECT a.codigo_articulo, a.titulo, a.estado_editorial, a.veces_utilizado_en_tickets AS usos,
       to_char(a.fecha_publicacion, 'YYYY-MM-DD') AS publicado
  FROM articulo_conocimiento a ORDER BY a.codigo_articulo;
