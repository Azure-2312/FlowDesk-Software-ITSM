-- ============================================================================
-- CARGA DEL ECOSISTEMA DE ACTIVOS, CMDB Y LICENCIAS · ejecutar UNA sola vez
-- ----------------------------------------------------------------------------
-- Crea un inventario coherente A PARTIR DE LOS USUARIOS QUE YA EXISTEN.
-- Nada se escribe con ids a mano: cada dato se enlaza con lo creado antes.
--
--   Capa 0  Catálogos ..... tipos de activo, modelos, tipos de CI, ubicaciones,
--                            proveedores y contratos
--   Capa 1  Activos ....... 1 equipo (laptop o PC) por cada usuario activo,
--                            con ese usuario como custodio; equipos en stock y
--                            en reparación; servidores, red e impresoras
--   Capa 2  CI ............ los físicos (servidores, red) apuntan a su activo;
--                            los lógicos (VM, BD, aplicaciones, servicios) no
--   Capa 3  Relaciones .... red → servidores → VM → BD/aplicación → servicio
--   Capa 4  Licencias ..... asignadas a los mismos usuarios y equipos; la
--                            cantidad "en uso" se calcula de las asignaciones
--   Capa 5  Mantenimiento . sobre activos existentes, con técnicos reales
--
-- Reglas de la carga:
--   · Solo corre si el inventario está vacío (no duplica nada si se repite).
--   · Todo va en UN bloque: si algo falla o no cuadra, se revierte completo.
--   · Al final valida que todo cuadre; si no, se revierte.
--   · No inventa RUC ni claves de licencia (se dejan en blanco).
--   · Haga un respaldo antes de ejecutarlo en producción.
-- ============================================================================
DO $$
DECLARE
  v_registrador   INTEGER;                   -- quien registra la carga
  v_tecnicos      INTEGER[];                 -- técnicos para mantenimientos
  v_tecnicos_campo INTEGER[];                -- técnicos de Soporte en sitio
  v_resp_infra    INTEGER;                   -- responsable de servidores
  v_dep_campo     INTEGER;                   -- Soporte en sitio (N2)
  v_dep_redes     INTEGER;                   -- Redes y conectividad
  v_dep_infra     INTEGER;                   -- Sistemas e infraestructura (N3)
  v_dep_sec       INTEGER;                   -- Ciberseguridad
  v_ubi_sede      INTEGER;
  v_ubi_dc        INTEGER;
  v_ubi_rack_a    INTEGER;
  v_ubi_rack_b    INTEGER;
  v_pisos         INTEGER[] := '{}';
  v_prov_hw       INTEGER;
  v_prov_red      INTEGER;
  v_prov_sw       INTEGER;
  v_prov_imp      INTEGER;
  v_prov_sec      INTEGER;
  v_id            INTEGER;
  v_n             INTEGER;
  v_i             INTEGER;
  v_srv_activos   INTEGER[] := '{}';         -- activos de servidores físicos
  v_lic           INTEGER;
  v_vence         DATE;
  v_problemas     TEXT := '';
BEGIN
  PERFORM setseed(0.2026);  -- mismos resultados en cada ejecución de prueba

  -- ------------------------------------------------------------------------
  -- Protección: solo sobre un inventario vacío
  -- ------------------------------------------------------------------------
  IF EXISTS (SELECT 1 FROM activo) OR EXISTS (SELECT 1 FROM elemento_configuracion)
     OR EXISTS (SELECT 1 FROM licencia_software) THEN
    RAISE EXCEPTION 'Ya hay activos, CI o licencias cargados. Esta carga solo corre sobre un inventario vacío.';
  END IF;

  IF (SELECT COUNT(*) FROM usuario WHERE estado_registro = true) < 5 THEN
    RAISE EXCEPTION 'Hay menos de 5 usuarios activos; cargue primero los usuarios.';
  END IF;

  -- Registrador: el primer Gestor de Activos y Configuración (perfil 9);
  -- si no hay, el primer Administrador.
  SELECT up.id_usuario INTO v_registrador
    FROM usuario_perfiles up JOIN usuario u ON u.id_usuario = up.id_usuario
   WHERE up.id_perfil = 9 AND u.estado_registro = true
   ORDER BY up.id_usuario LIMIT 1;
  IF v_registrador IS NULL THEN
    SELECT up.id_usuario INTO v_registrador
      FROM usuario_perfiles up JOIN usuario u ON u.id_usuario = up.id_usuario
     WHERE up.id_perfil = 1 AND u.estado_registro = true
     ORDER BY up.id_usuario LIMIT 1;
  END IF;

  -- Técnicos (perfil 2) para responsables de mantenimiento
  SELECT COALESCE(array_agg(id_usuario ORDER BY id_usuario), '{}') INTO v_tecnicos
    FROM (SELECT DISTINCT up.id_usuario
            FROM usuario_perfiles up JOIN usuario u ON u.id_usuario = up.id_usuario
           WHERE up.id_perfil = 2 AND u.estado_registro = true) t;
  IF array_length(v_tecnicos, 1) IS NULL THEN
    v_tecnicos := ARRAY[v_registrador];
  END IF;

  -- Departamentos de soporte (por código; si no existen quedan en blanco)
  SELECT id_departamento INTO v_dep_campo FROM departamento_ti WHERE codigo = 'DEP-N2-CAMPO';
  SELECT id_departamento INTO v_dep_redes FROM departamento_ti WHERE codigo = 'DEP-REDES';
  SELECT id_departamento INTO v_dep_infra FROM departamento_ti WHERE codigo = 'DEP-N3-SIST';
  SELECT id_departamento INTO v_dep_sec   FROM departamento_ti WHERE codigo = 'DEP-SEC';

  -- Responsable de servidores: un técnico de Infraestructura, si lo hay
  SELECT td.id_usuario INTO v_resp_infra
    FROM tecnico_detalle td JOIN usuario u ON u.id_usuario = td.id_usuario
   WHERE td.id_departamento = v_dep_infra AND td.estado_registro = true AND u.estado_registro = true
   ORDER BY td.id_usuario LIMIT 1;
  v_resp_infra := COALESCE(v_resp_infra, v_registrador);

  -- Impresoras y equipos de usuario los atiende Soporte en sitio (N2)
  SELECT array_agg(td.id_usuario ORDER BY td.id_usuario) INTO v_tecnicos_campo
    FROM tecnico_detalle td JOIN usuario u ON u.id_usuario = td.id_usuario
   WHERE td.id_departamento = v_dep_campo AND td.estado_registro = true AND u.estado_registro = true;
  IF v_tecnicos_campo IS NOT NULL THEN
    v_tecnicos := v_tecnicos_campo;
  END IF;

  -- ========================================================================
  -- CAPA 0 · CATÁLOGOS
  -- ========================================================================

  -- Tipos de activo (los mismos códigos que usa el inventario)
  INSERT INTO tipo_activo_catalogo (codigo, nombre, clase, usuario_modificacion) VALUES
    ('LAPTOP',    'Laptop / Portátil',       'HARDWARE', v_registrador),
    ('DESKTOP',   'Estación de trabajo',     'HARDWARE', v_registrador),
    ('SERVIDOR',  'Servidor físico',         'HARDWARE', v_registrador),
    ('SWITCH',    'Switch / Equipo de red',  'HARDWARE', v_registrador),
    ('IMPRESORA', 'Impresora corporativa',   'HARDWARE', v_registrador)
  ON CONFLICT (codigo) DO NOTHING;

  -- Modelos: fabricante, vida útil y residual (el costo se usa en la Capa 1)
  CREATE TEMP TABLE _modelo (tipo TEXT, fabricante TEXT, nombre TEXT, vida SMALLINT, residual NUMERIC, costo NUMERIC, specs JSONB) ON COMMIT DROP;
  INSERT INTO _modelo VALUES
    ('LAPTOP',    'Lenovo',   'ThinkPad T14 Gen 4',        48, 10, 5200, '{"cpu":"Intel Core i7-1365U","ram_gb":16,"disco_gb":512,"so":"Windows 11 Pro"}'),
    ('LAPTOP',    'Dell',     'Latitude 5440',             48, 10, 4600, '{"cpu":"Intel Core i5-1345U","ram_gb":16,"disco_gb":512,"so":"Windows 11 Pro"}'),
    ('LAPTOP',    'HP',       'EliteBook 840 G10',         48, 10, 5000, '{"cpu":"Intel Core i7-1355U","ram_gb":16,"disco_gb":512,"so":"Windows 11 Pro"}'),
    ('DESKTOP',   'Dell',     'OptiPlex 7010 SFF',         60, 10, 3400, '{"cpu":"Intel Core i5-13500","ram_gb":16,"disco_gb":512,"so":"Windows 11 Pro"}'),
    ('DESKTOP',   'Lenovo',   'ThinkCentre M70s Gen 4',    60, 10, 3200, '{"cpu":"Intel Core i5-13400","ram_gb":16,"disco_gb":512,"so":"Windows 11 Pro"}'),
    ('SERVIDOR',  'Dell',     'PowerEdge R750',            60, 5, 48000, '{"cpu":"2x Intel Xeon Gold 6338","ram_gb":512,"disco_gb":7680,"so":"VMware ESXi 8.0"}'),
    ('SERVIDOR',  'HPE',      'ProLiant DL380 Gen11',      60, 5, 52000, '{"cpu":"2x Intel Xeon Gold 6430","ram_gb":512,"disco_gb":7680,"so":"VMware ESXi 8.0"}'),
    ('SWITCH',    'Fortinet', 'FortiGate 100F',            60, 5, 14500, '{"funcion":"Firewall perimetral"}'),
    ('SWITCH',    'Cisco',    'Catalyst 9300-48P',         72, 5, 21000, '{"funcion":"Switch núcleo","puertos":48}'),
    ('SWITCH',    'Cisco',    'Catalyst 9200L-24P',        72, 5, 7800,  '{"funcion":"Switch de acceso","puertos":24}'),
    ('SWITCH',    'Ubiquiti', 'UniFi U6 Pro',              48, 0, 900,   '{"funcion":"Punto de acceso Wi-Fi"}'),
    ('IMPRESORA', 'HP',       'LaserJet Enterprise MFP M528', 60, 5, 4300, '{"funcion":"Multifuncional láser B/N"}');

  INSERT INTO modelo_activo (id_tipo_activo, fabricante, nombre_modelo, vida_util_meses, metodo_depreciacion, valor_residual_pct, usuario_modificacion)
  SELECT t.id_tipo_activo, mo.fabricante, mo.nombre, mo.vida, 'LINEAL', mo.residual, v_registrador
    FROM _modelo mo JOIN tipo_activo_catalogo t ON t.codigo = mo.tipo
  ON CONFLICT (id_tipo_activo, fabricante, nombre_modelo) DO NOTHING;

  -- Tipos de CI (los mismos códigos que usan la CMDB y su mapa)
  INSERT INTO tipo_ci (codigo, nombre, descripcion, categoria, icono) VALUES
    ('SERVIDOR_FISICO', 'Servidor físico',          'Host de virtualización en el centro de datos', 'INFRAESTRUCTURA', 'server'),
    ('SERVIDOR_LOGICO', 'Servidor lógico / VM',     'Máquina virtual alojada en un host',           'INFRAESTRUCTURA', 'server'),
    ('NODO_RED',        'Nodo de red',              'Firewall, switch o punto de acceso',           'RED',             'network'),
    ('BASE_DATOS',      'Base de datos',            'Instancia de base de datos',                   'DATOS',           'database'),
    ('APLICACION',      'Aplicación',               'Aplicación o módulo de software',              'SOFTWARE',        'app'),
    ('SERVICIO_TI',     'Servicio TI',              'Servicio que consume el negocio',              'SERVICIO',        'service')
  ON CONFLICT (codigo) DO NOTHING;

  -- Ubicaciones: Sede → 4 pisos; Sede → Centro de datos → 2 racks
  INSERT INTO ubicacion (codigo, nombre, tipo_nivel, direccion, id_responsable, ruta_completa)
  VALUES ('FD-SEDE', 'Sede Central', 'SEDE', 'Av. Principal 1250, Lima', v_registrador, 'Sede Central')
  RETURNING id_ubicacion INTO v_ubi_sede;

  FOR v_i IN 1..4 LOOP
    INSERT INTO ubicacion (codigo, nombre, id_padre, tipo_nivel, ruta_completa)
    VALUES ('FD-SEDE-P' || v_i, 'Piso ' || v_i, v_ubi_sede, 'PISO', 'Sede Central / Piso ' || v_i)
    RETURNING id_ubicacion INTO v_id;
    v_pisos := v_pisos || v_id;
  END LOOP;

  INSERT INTO ubicacion (codigo, nombre, id_padre, tipo_nivel, id_responsable, ruta_completa)
  VALUES ('FD-SEDE-DC', 'Centro de datos', v_pisos[1], 'SALA', v_resp_infra, 'Sede Central / Piso 1 / Centro de datos')
  RETURNING id_ubicacion INTO v_ubi_dc;
  INSERT INTO ubicacion (codigo, nombre, id_padre, tipo_nivel, capacidad_u, ruta_completa)
  VALUES ('FD-SEDE-DC-RA', 'Rack A', v_ubi_dc, 'RACK', 42, 'Sede Central / Piso 1 / Centro de datos / Rack A')
  RETURNING id_ubicacion INTO v_ubi_rack_a;
  INSERT INTO ubicacion (codigo, nombre, id_padre, tipo_nivel, capacidad_u, ruta_completa)
  VALUES ('FD-SEDE-DC-RB', 'Rack B', v_ubi_dc, 'RACK', 42, 'Sede Central / Piso 1 / Centro de datos / Rack B')
  RETURNING id_ubicacion INTO v_ubi_rack_b;

  -- Proveedores (nombres ficticios; el RUC se registra después en Proveedores)
  INSERT INTO proveedor_ti (codigo_proveedor, nombre, tipo_servicio, contacto_nombre, contacto_correo, numero_contrato,
                            fecha_inicio, fecha_vencimiento, servicio_soportado, compromiso_sla, evaluacion_desempeno, usuario_creacion)
  VALUES ('PRV-HW', 'Distribuidora Andina de Cómputo S.A.C.', 'Hardware y garantías', 'Mesa comercial', 'ventas@proveedor-hw.example',
          'CT-2025-HW', CURRENT_DATE - 400, CURRENT_DATE + 695, 'Laptops, PC y servidores', 'Reemplazo de partes en 48 h', 4, v_registrador)
  RETURNING id_proveedor INTO v_prov_hw;
  INSERT INTO proveedor_ti (codigo_proveedor, nombre, tipo_servicio, contacto_nombre, contacto_correo, numero_contrato,
                            fecha_inicio, fecha_vencimiento, servicio_soportado, compromiso_sla, evaluacion_desempeno, usuario_creacion)
  VALUES ('PRV-RED', 'Redes Integradas del Pacífico S.A.C.', 'Soporte de red', 'Centro de soporte', 'soporte@proveedor-red.example',
          'CT-2025-RED', CURRENT_DATE - 300, CURRENT_DATE + 430, 'Firewall, switches y Wi-Fi', 'Atención 24x7, respuesta en 4 h', 4, v_registrador)
  RETURNING id_proveedor INTO v_prov_red;
  INSERT INTO proveedor_ti (codigo_proveedor, nombre, tipo_servicio, contacto_nombre, contacto_correo, numero_contrato,
                            fecha_inicio, fecha_vencimiento, servicio_soportado, compromiso_sla, evaluacion_desempeno, usuario_creacion)
  VALUES ('PRV-SW', 'Licencias y Nube Corporativa S.A.C.', 'Licenciamiento de software', 'Ejecutivo de cuenta', 'cuentas@proveedor-sw.example',
          'CT-2026-SW', CURRENT_DATE - 200, CURRENT_DATE + 165, 'Microsoft 365, Windows Server y SQL Server', 'Activación en 24 h', 5, v_registrador)
  RETURNING id_proveedor INTO v_prov_sw;
  INSERT INTO proveedor_ti (codigo_proveedor, nombre, tipo_servicio, contacto_nombre, contacto_correo, numero_contrato,
                            fecha_inicio, fecha_vencimiento, servicio_soportado, compromiso_sla, evaluacion_desempeno, usuario_creacion)
  VALUES ('PRV-IMP', 'Servicios de Impresión Lima S.A.C.', 'Outsourcing de impresión', 'Coordinador de servicio', 'servicio@proveedor-imp.example',
          'CT-2025-IMP', CURRENT_DATE - 500, CURRENT_DATE + 230, 'Impresoras multifuncionales y suministros', 'Visita técnica en 8 h', 3, v_registrador)
  RETURNING id_proveedor INTO v_prov_imp;
  INSERT INTO proveedor_ti (codigo_proveedor, nombre, tipo_servicio, contacto_nombre, contacto_correo, numero_contrato,
                            fecha_inicio, fecha_vencimiento, servicio_soportado, compromiso_sla, evaluacion_desempeno, usuario_creacion)
  VALUES ('PRV-SEC', 'Ciberdefensa Perú S.A.C.', 'Seguridad informática', 'Centro de operaciones', 'soc@proveedor-sec.example',
          'CT-2026-SEC', CURRENT_DATE - 150, CURRENT_DATE + 20, 'Antivirus corporativo', 'Respuesta a incidentes en 2 h', 4, v_registrador)
  RETURNING id_proveedor INTO v_prov_sec;

  -- Contratos: uno por proveedor, con las mismas fechas que el proveedor
  INSERT INTO contrato_ti (codigo, nombre, id_proveedor, tipo, descripcion, fecha_inicio, fecha_fin, monto, moneda, cobertura,
                           renovacion_automatica, dias_aviso, estado, usuario_creacion)
  SELECT p.numero_contrato, 'Contrato ' || p.tipo_servicio, p.id_proveedor, x.tipo, p.servicio_soportado,
         p.fecha_inicio, p.fecha_vencimiento, x.monto, 'PEN', p.compromiso_sla, x.renueva, 30,
         CASE WHEN p.fecha_vencimiento <= CURRENT_DATE + 30 THEN 'POR_VENCER' ELSE 'VIGENTE' END, v_registrador
    FROM proveedor_ti p
    JOIN (VALUES (v_prov_hw,  'GARANTIA',    180000::numeric, false),
                 (v_prov_red, 'SOPORTE',      64000::numeric, true),
                 (v_prov_sw,  'LICENCIAMIENTO',0::numeric,    true),   -- se recalcula con las licencias
                 (v_prov_imp, 'OUTSOURCING',  38000::numeric, false),
                 (v_prov_sec, 'LICENCIAMIENTO',0::numeric,    true)) AS x(id, tipo, monto, renueva)
      ON x.id = p.id_proveedor;

  -- ========================================================================
  -- CAPA 1 · ACTIVOS
  -- Primero se arma la lista completa en _act y luego se inserta de una vez.
  -- "clave" es un nombre interno para enlazar el activo con su CI.
  -- ========================================================================
  CREATE TEMP TABLE _act (
    orden SERIAL, clave TEXT, prefijo TEXT, tipo TEXT, modelo TEXT, atributos JSONB,
    id_departamento INTEGER, custodio INTEGER, estado TEXT, fecha DATE, garantia_meses INTEGER,
    codigo TEXT
  ) ON COMMIT DROP;

  -- 1a. Un equipo por cada usuario activo (custodio = el propio usuario).
  --     7 de cada 10 laptops, el resto PC; el piso sale de su departamento.
  INSERT INTO _act (prefijo, tipo, modelo, atributos, id_departamento, custodio, estado, fecha, garantia_meses)
  SELECT CASE WHEN x.es_laptop THEN 'HDW-LAP-' ELSE 'HDW-DSK-' END,
         CASE WHEN x.es_laptop THEN 'LAPTOP' ELSE 'DESKTOP' END,
         CASE WHEN x.es_laptop THEN (ARRAY['ThinkPad T14 Gen 4', 'Latitude 5440', 'EliteBook 840 G10'])[1 + x.fila % 3]
              ELSE (ARRAY['OptiPlex 7010 SFF', 'ThinkCentre M70s Gen 4'])[1 + x.fila % 2] END,
         jsonb_build_object('id_ubicacion', v_pisos[1 + x.piso], 'ubicacion', 'Sede Central / Piso ' || (1 + x.piso)),
         v_dep_campo, x.id_usuario,
         CASE WHEN x.fila % 67 = 0 THEN 'MANTENIMIENTO' ELSE 'EN_OPERACION' END,
         CURRENT_DATE - (30 + floor(random() * 1120))::int, 36
    FROM (SELECT u.id_usuario,
                 row_number() OVER (ORDER BY u.id_usuario) AS fila,
                 (row_number() OVER (ORDER BY u.id_usuario)) % 10 < 7 AS es_laptop,
                 COALESCE(u.id_departamento_empresa, u.id_usuario) % 4 AS piso
            FROM usuario u WHERE u.estado_registro = true) x
   ORDER BY x.fila;

  -- 1b. Stock de reserva: ~5 % de laptops sin custodio, en el centro de datos
  INSERT INTO _act (prefijo, tipo, modelo, atributos, id_departamento, custodio, estado, fecha, garantia_meses)
  SELECT 'HDW-LAP-', 'LAPTOP', (ARRAY['ThinkPad T14 Gen 4', 'Latitude 5440', 'EliteBook 840 G10'])[1 + g % 3],
         jsonb_build_object('id_ubicacion', v_ubi_dc, 'ubicacion', 'Sede Central / Piso 1 / Centro de datos'),
         v_dep_campo, NULL, 'EN_STOCK', CURRENT_DATE - (10 + floor(random() * 120))::int, 36
    FROM generate_series(1, GREATEST(2, ceil((SELECT COUNT(*) FROM _act) * 0.05)::int)) g;

  -- 1c. Servidores físicos: 4 hosts, dos por rack
  INSERT INTO _act (clave, prefijo, tipo, modelo, atributos, id_departamento, custodio, estado, fecha, garantia_meses)
  SELECT 'HOST-0' || g, 'HDW-SRV-', 'SERVIDOR',
         CASE WHEN g % 2 = 1 THEN 'PowerEdge R750' ELSE 'ProLiant DL380 Gen11' END,
         jsonb_build_object('hostname', 'FD-HOST-0' || g, 'ip', '10.10.10.' || (10 + g),
                            'id_ubicacion', CASE WHEN g <= 2 THEN v_ubi_rack_a ELSE v_ubi_rack_b END,
                            'ubicacion', 'Sede Central / Piso 1 / Centro de datos / Rack ' || CASE WHEN g <= 2 THEN 'A' ELSE 'B' END,
                            'posicion_u', CASE WHEN g % 2 = 1 THEN 10 ELSE 14 END),
         v_dep_infra, v_resp_infra, 'EN_OPERACION', CURRENT_DATE - (400 + g * 60), 60
    FROM generate_series(1, 4) g;

  -- 1d. Red: firewall y switch núcleo en el Rack A; por piso, switch y Wi-Fi
  INSERT INTO _act (clave, prefijo, tipo, modelo, atributos, id_departamento, custodio, estado, fecha, garantia_meses) VALUES
    ('FW-01', 'NET-FW-', 'SWITCH', 'FortiGate 100F',
     jsonb_build_object('hostname', 'FD-FW-01', 'ip', '10.10.0.1', 'id_ubicacion', v_ubi_rack_a,
                        'ubicacion', 'Sede Central / Piso 1 / Centro de datos / Rack A', 'posicion_u', 40),
     v_dep_redes, NULL, 'EN_OPERACION', CURRENT_DATE - 520, 36),
    ('SW-CORE', 'NET-SW-', 'SWITCH', 'Catalyst 9300-48P',
     jsonb_build_object('hostname', 'FD-SW-CORE', 'ip', '10.10.0.2', 'id_ubicacion', v_ubi_rack_a,
                        'ubicacion', 'Sede Central / Piso 1 / Centro de datos / Rack A', 'posicion_u', 38),
     v_dep_redes, NULL, 'EN_OPERACION', CURRENT_DATE - 520, 36);

  INSERT INTO _act (clave, prefijo, tipo, modelo, atributos, id_departamento, custodio, estado, fecha, garantia_meses)
  SELECT 'SW-P' || g, 'NET-SW-', 'SWITCH', 'Catalyst 9200L-24P',
         jsonb_build_object('hostname', 'FD-SW-P' || g, 'ip', '10.10.' || g || '.2', 'id_ubicacion', v_pisos[g], 'ubicacion', 'Sede Central / Piso ' || g),
         v_dep_redes, NULL, 'EN_OPERACION', CURRENT_DATE - 510, 36
    FROM generate_series(1, 4) g;
  INSERT INTO _act (clave, prefijo, tipo, modelo, atributos, id_departamento, custodio, estado, fecha, garantia_meses)
  SELECT 'AP-P' || g, 'NET-AP-', 'SWITCH', 'UniFi U6 Pro',
         jsonb_build_object('hostname', 'FD-AP-P' || g, 'ip', '10.10.' || g || '.3', 'id_ubicacion', v_pisos[g], 'ubicacion', 'Sede Central / Piso ' || g),
         v_dep_redes, NULL, 'EN_OPERACION', CURRENT_DATE - 480, 24
    FROM generate_series(1, 4) g;

  -- 1e. Una impresora multifuncional por piso (activo, no CI)
  INSERT INTO _act (prefijo, tipo, modelo, atributos, id_departamento, custodio, estado, fecha, garantia_meses)
  SELECT 'HDW-PRN-', 'IMPRESORA', 'LaserJet Enterprise MFP M528',
         jsonb_build_object('hostname', 'FD-PRN-P' || g, 'ip', '10.10.' || g || '.50', 'id_ubicacion', v_pisos[g], 'ubicacion', 'Sede Central / Piso ' || g),
         v_dep_campo, NULL, 'EN_OPERACION', CURRENT_DATE - 600, 24
    FROM generate_series(1, 4) g;

  -- Código patrimonial correlativo por prefijo (HDW-LAP-0001, NET-SW-0001...)
  UPDATE _act a SET codigo = x.prefijo || lpad(x.n::text, 4, '0')
    FROM (SELECT orden, prefijo, row_number() OVER (PARTITION BY prefijo ORDER BY orden) AS n FROM _act) x
   WHERE x.orden = a.orden;

  -- Hostname de los equipos de usuario = su código (FD-LAP-0001, FD-DSK-0001)
  UPDATE _act SET atributos = atributos || jsonb_build_object('hostname', replace(codigo, 'HDW-', 'FD-'))
   WHERE tipo IN ('LAPTOP', 'DESKTOP');

  -- Inserción: marca, modelo, especificaciones, costo y vida útil salen del modelo
  INSERT INTO activo (codigo_patrimonial, numero_serie, tipo_activo, marca, modelo, id_modelo, atributos,
                      valor_residual, vida_util_meses, id_departamento, id_usuario_custodio, estado_activo,
                      fecha_adquisicion, fecha_fin_garantia, costo_compra, usuario_creacion)
  SELECT a.codigo,
         upper(left(mo.fabricante, 2)) || upper(substr(md5(a.codigo || '-fd'), 1, 10)),
         a.tipo, mo.fabricante, mo.nombre, ma.id_modelo,
         mo.specs || a.atributos,
         round(mo.costo * mo.residual / 100, 2), mo.vida, a.id_departamento, a.custodio, a.estado,
         a.fecha, (a.fecha + make_interval(months => a.garantia_meses))::date, mo.costo, v_registrador
    FROM _act a
    JOIN _modelo mo ON mo.nombre = a.modelo
    JOIN tipo_activo_catalogo t ON t.codigo = mo.tipo
    JOIN modelo_activo ma ON ma.id_tipo_activo = t.id_tipo_activo AND ma.fabricante = mo.fabricante AND ma.nombre_modelo = mo.nombre
   ORDER BY a.orden;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n <> (SELECT COUNT(*) FROM _act) THEN
    RAISE EXCEPTION 'No se insertaron todos los activos: % de %', v_n, (SELECT COUNT(*) FROM _act);
  END IF;

  -- Historial: alta inicial de cada activo, igual que al registrarlo en pantalla
  INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
  SELECT id_activo, NULL, estado_activo, NULL, id_usuario_custodio, 'Alta inicial de activo en el sistema', v_registrador,
         fecha_adquisicion::timestamptz
    FROM activo;

  SELECT array_agg(ac.id_activo ORDER BY a.clave) INTO v_srv_activos
    FROM _act a JOIN activo ac ON ac.codigo_patrimonial = a.codigo
   WHERE a.clave LIKE 'HOST-%';

  -- ========================================================================
  -- CAPA 2 · CI
  -- Los físicos se enlazan con su activo por la "clave"; los lógicos no.
  -- ========================================================================
  CREATE TEMP TABLE _ci (codigo TEXT PRIMARY KEY, clave_activo TEXT, nombre TEXT, tipo TEXT, ambiente TEXT,
                         ip TEXT, version TEXT, criticidad TEXT, soporte TEXT) ON COMMIT DROP;
  INSERT INTO _ci VALUES
    -- Físicos (cada uno es un activo del inventario)
    ('CI-FW-01',      'FW-01',   'Firewall perimetral',              'NODO_RED',        'PRODUCCION', '10.10.0.1',   'FortiOS 7.4',         'CRITICA', 'SEC'),
    ('CI-SW-CORE',    'SW-CORE', 'Switch núcleo',                    'NODO_RED',        'PRODUCCION', '10.10.0.2',   'IOS XE 17.9',         'CRITICA', 'REDES'),
    ('CI-SW-P1',      'SW-P1',   'Switch de acceso piso 1',          'NODO_RED',        'PRODUCCION', '10.10.1.2',   'IOS XE 17.9',         'ALTA',    'REDES'),
    ('CI-SW-P2',      'SW-P2',   'Switch de acceso piso 2',          'NODO_RED',        'PRODUCCION', '10.10.2.2',   'IOS XE 17.9',         'ALTA',    'REDES'),
    ('CI-SW-P3',      'SW-P3',   'Switch de acceso piso 3',          'NODO_RED',        'PRODUCCION', '10.10.3.2',   'IOS XE 17.9',         'ALTA',    'REDES'),
    ('CI-SW-P4',      'SW-P4',   'Switch de acceso piso 4',          'NODO_RED',        'PRODUCCION', '10.10.4.2',   'IOS XE 17.9',         'ALTA',    'REDES'),
    ('CI-AP-P1',      'AP-P1',   'Wi-Fi piso 1',                     'NODO_RED',        'PRODUCCION', '10.10.1.3',   'UniFi 6.6',           'MEDIA',   'REDES'),
    ('CI-AP-P2',      'AP-P2',   'Wi-Fi piso 2',                     'NODO_RED',        'PRODUCCION', '10.10.2.3',   'UniFi 6.6',           'MEDIA',   'REDES'),
    ('CI-AP-P3',      'AP-P3',   'Wi-Fi piso 3',                     'NODO_RED',        'PRODUCCION', '10.10.3.3',   'UniFi 6.6',           'MEDIA',   'REDES'),
    ('CI-AP-P4',      'AP-P4',   'Wi-Fi piso 4',                     'NODO_RED',        'PRODUCCION', '10.10.4.3',   'UniFi 6.6',           'MEDIA',   'REDES'),
    ('CI-HOST-01',    'HOST-01', 'Host de virtualización 01',        'SERVIDOR_FISICO', 'PRODUCCION', '10.10.10.11', 'VMware ESXi 8.0',     'CRITICA', 'INFRA'),
    ('CI-HOST-02',    'HOST-02', 'Host de virtualización 02',        'SERVIDOR_FISICO', 'PRODUCCION', '10.10.10.12', 'VMware ESXi 8.0',     'CRITICA', 'INFRA'),
    ('CI-HOST-03',    'HOST-03', 'Host de virtualización 03',        'SERVIDOR_FISICO', 'PRODUCCION', '10.10.10.13', 'VMware ESXi 8.0',     'ALTA',    'INFRA'),
    ('CI-HOST-04',    'HOST-04', 'Host de virtualización 04 (QA)',   'SERVIDOR_FISICO', 'QA',         '10.10.10.14', 'VMware ESXi 8.0',     'MEDIA',   'INFRA'),
    -- Máquinas virtuales
    ('CI-VM-AD01',    NULL, 'Controlador de dominio',            'SERVIDOR_LOGICO', 'PRODUCCION', '10.10.20.10', 'Windows Server 2022', 'CRITICA', 'INFRA'),
    ('CI-VM-ERPAPP',  NULL, 'Servidor de aplicaciones ERP',      'SERVIDOR_LOGICO', 'PRODUCCION', '10.10.20.20', 'Windows Server 2022', 'CRITICA', 'INFRA'),
    ('CI-VM-ERPDB',   NULL, 'Servidor de base de datos ERP',     'SERVIDOR_LOGICO', 'PRODUCCION', '10.10.20.21', 'Windows Server 2022', 'CRITICA', 'INFRA'),
    ('CI-VM-WEB01',   NULL, 'Servidor web intranet',             'SERVIDOR_LOGICO', 'PRODUCCION', '10.10.20.30', 'Ubuntu Server 24.04', 'ALTA',    'INFRA'),
    ('CI-VM-FS01',    NULL, 'Servidor de archivos',              'SERVIDOR_LOGICO', 'PRODUCCION', '10.10.20.40', 'Windows Server 2022', 'ALTA',    'INFRA'),
    ('CI-VM-BKP01',   NULL, 'Servidor de respaldos',             'SERVIDOR_LOGICO', 'PRODUCCION', '10.10.20.50', 'Windows Server 2022', 'ALTA',    'INFRA'),
    ('CI-VM-ERPQA',   NULL, 'Servidor ERP de pruebas',           'SERVIDOR_LOGICO', 'QA',         '10.10.30.20', 'Windows Server 2022', 'BAJA',    'INFRA'),
    -- Bases de datos
    ('CI-BD-ERP',     NULL, 'Base de datos ERP',                 'BASE_DATOS',      'PRODUCCION', '10.10.20.21', 'SQL Server 2022',     'CRITICA', 'INFRA'),
    ('CI-BD-INTRA',   NULL, 'Base de datos intranet',            'BASE_DATOS',      'PRODUCCION', '10.10.20.30', 'PostgreSQL 16',       'ALTA',    'INFRA'),
    ('CI-BD-ERPQA',   NULL, 'Base de datos ERP de pruebas',      'BASE_DATOS',      'QA',         '10.10.30.20', 'SQL Server 2022',     'BAJA',    'INFRA'),
    -- Aplicaciones
    ('CI-APP-AD',     NULL, 'Directorio activo',                 'APLICACION',      'PRODUCCION', NULL,          'AD DS 2022',          'CRITICA', 'SEC'),
    ('CI-APP-ERP',    NULL, 'ERP financiero',                    'APLICACION',      'PRODUCCION', NULL,          '12.4',                'CRITICA', 'INFRA'),
    ('CI-APP-INTRA',  NULL, 'Portal intranet',                   'APLICACION',      'PRODUCCION', NULL,          '3.2',                 'MEDIA',   'INFRA'),
    ('CI-APP-FILES',  NULL, 'Carpetas compartidas',              'APLICACION',      'PRODUCCION', NULL,          'DFS 2022',            'ALTA',    'INFRA'),
    ('CI-APP-BKP',    NULL, 'Plataforma de respaldos',           'APLICACION',      'PRODUCCION', NULL,          '12.1',                'ALTA',    'INFRA'),
    ('CI-APP-ERPQA',  NULL, 'ERP financiero (pruebas)',          'APLICACION',      'QA',         NULL,          '12.5-beta',           'BAJA',    'INFRA'),
    -- Servicios que consume el negocio
    ('CI-SVC-ERP',    NULL, 'Servicio de gestión financiera',    'SERVICIO_TI',     'PRODUCCION', NULL,          NULL,                  'CRITICA', 'INFRA'),
    ('CI-SVC-CORREO', NULL, 'Servicio de correo y colaboración', 'SERVICIO_TI',     'PRODUCCION', NULL,          'Microsoft 365',       'CRITICA', 'INFRA'),
    ('CI-SVC-INTRA',  NULL, 'Servicio de intranet',              'SERVICIO_TI',     'PRODUCCION', NULL,          NULL,                  'MEDIA',   'INFRA'),
    ('CI-SVC-ARCH',   NULL, 'Servicio de archivos compartidos',  'SERVICIO_TI',     'PRODUCCION', NULL,          NULL,                  'ALTA',    'INFRA'),
    ('CI-SVC-NET',    NULL, 'Servicio de internet y red',        'SERVICIO_TI',     'PRODUCCION', NULL,          NULL,                  'CRITICA', 'REDES');

  INSERT INTO elemento_configuracion (id_activo, codigo_ci, nombre, tipo_ci, ambiente, ip_principal, version_software,
                                      criticidad, id_departamento_soporte, usuario_creacion)
  SELECT ac.id_activo, c.codigo, c.nombre, c.tipo, c.ambiente, c.ip, c.version, c.criticidad,
         CASE c.soporte WHEN 'REDES' THEN v_dep_redes WHEN 'SEC' THEN COALESCE(v_dep_sec, v_dep_infra) ELSE v_dep_infra END,
         v_registrador
    FROM _ci c
    LEFT JOIN _act a ON a.clave = c.clave_activo
    LEFT JOIN activo ac ON ac.codigo_patrimonial = a.codigo;

  -- ========================================================================
  -- CAPA 3 · RELACIONES (padre → hijo: si cae el padre, se afecta el hijo)
  -- ========================================================================
  CREATE TEMP TABLE _rel (padre TEXT, hijo TEXT, tipo TEXT) ON COMMIT DROP;
  INSERT INTO _rel VALUES
    -- Red física
    ('CI-FW-01',   'CI-SW-CORE', 'CONECTADO_CON'),
    ('CI-SW-CORE', 'CI-SW-P1',   'CONECTADO_CON'),
    ('CI-SW-CORE', 'CI-SW-P2',   'CONECTADO_CON'),
    ('CI-SW-CORE', 'CI-SW-P3',   'CONECTADO_CON'),
    ('CI-SW-CORE', 'CI-SW-P4',   'CONECTADO_CON'),
    ('CI-SW-P1',   'CI-AP-P1',   'CONECTADO_CON'),
    ('CI-SW-P2',   'CI-AP-P2',   'CONECTADO_CON'),
    ('CI-SW-P3',   'CI-AP-P3',   'CONECTADO_CON'),
    ('CI-SW-P4',   'CI-AP-P4',   'CONECTADO_CON'),
    ('CI-SW-CORE', 'CI-HOST-01', 'CONECTADO_CON'),
    ('CI-SW-CORE', 'CI-HOST-02', 'CONECTADO_CON'),
    ('CI-SW-CORE', 'CI-HOST-03', 'CONECTADO_CON'),
    ('CI-SW-CORE', 'CI-HOST-04', 'CONECTADO_CON'),
    -- Hosts → VM que alojan
    ('CI-HOST-01', 'CI-VM-AD01',   'ALBERGA_A'),
    ('CI-HOST-01', 'CI-VM-ERPAPP', 'ALBERGA_A'),
    ('CI-HOST-01', 'CI-VM-FS01',   'ALBERGA_A'),
    ('CI-HOST-02', 'CI-VM-ERPDB',  'ALBERGA_A'),
    ('CI-HOST-02', 'CI-VM-WEB01',  'ALBERGA_A'),
    ('CI-HOST-03', 'CI-VM-BKP01',  'ALBERGA_A'),
    ('CI-HOST-04', 'CI-VM-ERPQA',  'ALBERGA_A'),
    -- VM → bases de datos y aplicaciones que corren en ellas
    ('CI-VM-ERPDB',  'CI-BD-ERP',    'ALBERGA_A'),
    ('CI-VM-WEB01',  'CI-BD-INTRA',  'ALBERGA_A'),
    ('CI-VM-ERPQA',  'CI-BD-ERPQA',  'ALBERGA_A'),
    ('CI-VM-AD01',   'CI-APP-AD',    'ALBERGA_A'),
    ('CI-VM-ERPAPP', 'CI-APP-ERP',   'ALBERGA_A'),
    ('CI-VM-WEB01',  'CI-APP-INTRA', 'ALBERGA_A'),
    ('CI-VM-FS01',   'CI-APP-FILES', 'ALBERGA_A'),
    ('CI-VM-BKP01',  'CI-APP-BKP',   'ALBERGA_A'),
    ('CI-VM-ERPQA',  'CI-APP-ERPQA', 'ALBERGA_A'),
    -- Aplicaciones → de qué dependen
    ('CI-BD-ERP',    'CI-APP-ERP',   'DEPENDE_DE'),
    ('CI-BD-INTRA',  'CI-APP-INTRA', 'DEPENDE_DE'),
    ('CI-BD-ERPQA',  'CI-APP-ERPQA', 'DEPENDE_DE'),
    ('CI-APP-AD',    'CI-APP-ERP',   'DEPENDE_DE'),
    ('CI-APP-AD',    'CI-APP-INTRA', 'DEPENDE_DE'),
    ('CI-APP-AD',    'CI-APP-FILES', 'DEPENDE_DE'),
    -- Servicios → qué los sostiene
    ('CI-APP-ERP',   'CI-SVC-ERP',    'DEPENDE_DE'),
    ('CI-APP-AD',    'CI-SVC-CORREO', 'DEPENDE_DE'),
    ('CI-FW-01',     'CI-SVC-CORREO', 'DEPENDE_DE'),
    ('CI-APP-INTRA', 'CI-SVC-INTRA',  'DEPENDE_DE'),
    ('CI-APP-FILES', 'CI-SVC-ARCH',   'DEPENDE_DE'),
    ('CI-FW-01',     'CI-SVC-NET',    'DEPENDE_DE'),
    ('CI-SW-CORE',   'CI-SVC-NET',    'DEPENDE_DE');

  INSERT INTO ci_relacion (id_ci_padre, id_ci_hijo, tipo_relacion)
  SELECT p.id_ci, h.id_ci, r2.tipo
    FROM _rel r2
    JOIN elemento_configuracion p ON p.codigo_ci = r2.padre
    JOIN elemento_configuracion h ON h.codigo_ci = r2.hijo;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n <> (SELECT COUNT(*) FROM _rel) THEN
    RAISE EXCEPTION 'Relaciones de CI incompletas: % de %', v_n, (SELECT COUNT(*) FROM _rel);
  END IF;

  -- ========================================================================
  -- CAPA 4 · LICENCIAS Y ASIGNACIONES
  -- ========================================================================

  -- Microsoft 365 E3: una por usuario con equipo asignado
  INSERT INTO licencia_software (nombre_software, fabricante, tipo_licencia, cantidad_adquirida, fecha_vencimiento, costo_anual, usuario_creacion)
  SELECT 'Microsoft 365 E3', 'Microsoft', 'SUSCRIPCION_ANUAL', ceil(COUNT(*) * 1.10)::int, CURRENT_DATE + 165,
         ceil(COUNT(*) * 1.10) * 1450, v_registrador
    FROM activo WHERE tipo_activo IN ('LAPTOP', 'DESKTOP') AND id_usuario_custodio IS NOT NULL
  RETURNING id_licencia INTO v_lic;
  INSERT INTO licencia_asignacion (id_licencia, id_usuario, fecha_asignacion, id_usuario_registro)
  SELECT v_lic, id_usuario_custodio, fecha_adquisicion, v_registrador
    FROM activo WHERE tipo_activo IN ('LAPTOP', 'DESKTOP') AND id_usuario_custodio IS NOT NULL;

  -- Windows 11 Pro (OEM): una por equipo, incluido el stock (+5 % de reserva)
  INSERT INTO licencia_software (nombre_software, fabricante, tipo_licencia, cantidad_adquirida, fecha_vencimiento, costo_anual, usuario_creacion)
  SELECT 'Windows 11 Pro', 'Microsoft', 'OEM', ceil(COUNT(*) * 1.05)::int, NULL, NULL, v_registrador
    FROM activo WHERE tipo_activo IN ('LAPTOP', 'DESKTOP')
  RETURNING id_licencia INTO v_lic;
  INSERT INTO licencia_asignacion (id_licencia, id_activo, fecha_asignacion, id_usuario_registro)
  SELECT v_lic, id_activo, fecha_adquisicion, v_registrador FROM activo WHERE tipo_activo IN ('LAPTOP', 'DESKTOP');

  -- Antivirus: equipos y servidores, con 10 de reserva; vence en 20 días (alerta)
  v_vence := CURRENT_DATE + 20;
  INSERT INTO licencia_software (nombre_software, fabricante, tipo_licencia, cantidad_adquirida, fecha_vencimiento, costo_anual, usuario_creacion)
  SELECT 'ESET PROTECT Advanced', 'ESET', 'SUSCRIPCION_ANUAL', (ceil(COUNT(*) / 10.0) * 10 + 10)::int, v_vence,
         (ceil(COUNT(*) / 10.0) * 10 + 10) * 120, v_registrador
    FROM activo WHERE tipo_activo IN ('LAPTOP', 'DESKTOP', 'SERVIDOR')
  RETURNING id_licencia INTO v_lic;
  INSERT INTO licencia_asignacion (id_licencia, id_activo, fecha_asignacion, id_usuario_registro)
  SELECT v_lic, id_activo, GREATEST(fecha_adquisicion, v_vence - 365), v_registrador
    FROM activo WHERE tipo_activo IN ('LAPTOP', 'DESKTOP', 'SERVIDOR');

  -- Windows Server 2022 Datacenter: una por host (cubre sus VM) + 2 para contingencia
  INSERT INTO licencia_software (nombre_software, fabricante, tipo_licencia, cantidad_adquirida, fecha_vencimiento, costo_anual, usuario_creacion)
  VALUES ('Windows Server 2022 Datacenter', 'Microsoft', 'POR_VOLUMEN', 6, NULL, NULL, v_registrador)
  RETURNING id_licencia INTO v_lic;
  INSERT INTO licencia_asignacion (id_licencia, id_activo, fecha_asignacion, id_usuario_registro)
  SELECT v_lic, id_activo, fecha_adquisicion, v_registrador FROM activo WHERE id_activo = ANY (v_srv_activos);

  -- SQL Server 2022 Standard: hosts con BD SQL Server (02 y 04) + 1 de reserva
  INSERT INTO licencia_software (nombre_software, fabricante, tipo_licencia, cantidad_adquirida, fecha_vencimiento, costo_anual, usuario_creacion)
  VALUES ('SQL Server 2022 Standard', 'Microsoft', 'POR_VOLUMEN', 3, NULL, NULL, v_registrador)
  RETURNING id_licencia INTO v_lic;
  INSERT INTO licencia_asignacion (id_licencia, id_activo, fecha_asignacion, id_usuario_registro)
  SELECT v_lic, id_activo, fecha_adquisicion, v_registrador FROM activo WHERE id_activo IN (v_srv_activos[2], v_srv_activos[4]);

  -- Adobe Acrobat Pro: 1 de cada 8 usuarios con equipo, más 2 de reserva
  INSERT INTO licencia_software (nombre_software, fabricante, tipo_licencia, cantidad_adquirida, fecha_vencimiento, costo_anual, usuario_creacion)
  VALUES ('Adobe Acrobat Pro', 'Adobe', 'SUSCRIPCION_ANUAL', 0, CURRENT_DATE + 230, NULL, v_registrador)
  RETURNING id_licencia INTO v_lic;
  INSERT INTO licencia_asignacion (id_licencia, id_usuario, fecha_asignacion, id_usuario_registro)
  SELECT v_lic, id_usuario_custodio, CURRENT_DATE - 135, v_registrador
    FROM (SELECT id_usuario_custodio, row_number() OVER (ORDER BY id_usuario_custodio) AS fila
            FROM activo WHERE tipo_activo IN ('LAPTOP', 'DESKTOP') AND id_usuario_custodio IS NOT NULL) x
   WHERE x.fila % 8 = 1;
  UPDATE licencia_software
     SET cantidad_adquirida = (SELECT COUNT(*) FROM licencia_asignacion WHERE id_licencia = v_lic) + 2
   WHERE id_licencia = v_lic;
  UPDATE licencia_software SET costo_anual = cantidad_adquirida * 780 WHERE id_licencia = v_lic;

  -- "En uso" = asignaciones vigentes (nunca un número escrito a mano)
  UPDATE licencia_software l
     SET cantidad_en_uso = (SELECT COUNT(*) FROM licencia_asignacion a
                             WHERE a.id_licencia = l.id_licencia AND a.fecha_devolucion IS NULL);

  -- El contrato de licenciamiento suma lo que cuestan las licencias
  UPDATE contrato_ti SET monto = (SELECT COALESCE(SUM(costo_anual), 0) FROM licencia_software WHERE fabricante = 'Microsoft')
   WHERE id_proveedor = v_prov_sw;
  UPDATE contrato_ti SET monto = (SELECT COALESCE(SUM(costo_anual), 0) FROM licencia_software WHERE fabricante = 'ESET')
   WHERE id_proveedor = v_prov_sec;

  -- ========================================================================
  -- CAPA 5 · MANTENIMIENTOS (sobre activos que ya existen)
  -- ========================================================================

  -- Servidores: preventivo hecho el trimestre pasado y el próximo programado
  INSERT INTO mantenimiento_activo (id_activo, tipo, descripcion, proveedor, fecha_programada, fecha_ejecucion, costo, estado, id_usuario_responsable, usuario_creacion)
  SELECT a.id_activo, 'PREVENTIVO', 'Actualización de firmware y revisión de discos', p.nombre,
         CURRENT_DATE - 75, CURRENT_DATE - 74, 0, 'COMPLETADO', v_resp_infra, v_registrador
    FROM activo a, proveedor_ti p WHERE a.id_activo = ANY (v_srv_activos) AND p.id_proveedor = v_prov_hw;
  INSERT INTO mantenimiento_activo (id_activo, tipo, descripcion, proveedor, fecha_programada, estado, id_usuario_responsable, usuario_creacion)
  SELECT a.id_activo, 'PREVENTIVO', 'Mantenimiento trimestral de hardware', p.nombre,
         CURRENT_DATE + 15, 'PROGRAMADO', v_resp_infra, v_registrador
    FROM activo a, proveedor_ti p WHERE a.id_activo = ANY (v_srv_activos) AND p.id_proveedor = v_prov_hw;

  -- Impresoras: limpieza y cambio de kit, a cargo de técnicos (rotando)
  INSERT INTO mantenimiento_activo (id_activo, tipo, descripcion, proveedor, fecha_programada, estado, id_usuario_responsable, usuario_creacion)
  SELECT a.id_activo, 'PREVENTIVO', 'Limpieza y cambio de kit de mantenimiento', p.nombre,
         CURRENT_DATE + 7 * x.fila::int, 'PROGRAMADO',
         v_tecnicos[1 + ((x.fila::int - 1) % array_length(v_tecnicos, 1))], v_registrador
    FROM (SELECT id_activo, row_number() OVER (ORDER BY id_activo) AS fila FROM activo WHERE tipo_activo = 'IMPRESORA') x
    JOIN activo a ON a.id_activo = x.id_activo, proveedor_ti p
   WHERE p.id_proveedor = v_prov_imp;

  -- Equipos en reparación: correctivo en proceso
  INSERT INTO mantenimiento_activo (id_activo, tipo, descripcion, proveedor, fecha_programada, estado, id_usuario_responsable, usuario_creacion)
  SELECT a.id_activo, 'CORRECTIVO', 'Falla de batería; equipo enviado a garantía', p.nombre,
         CURRENT_DATE - 3, 'EN_PROCESO',
         v_tecnicos[1 + ((x.fila::int - 1) % array_length(v_tecnicos, 1))], v_registrador
    FROM (SELECT id_activo, row_number() OVER (ORDER BY id_activo) AS fila FROM activo WHERE estado_activo = 'MANTENIMIENTO') x
    JOIN activo a ON a.id_activo = x.id_activo, proveedor_ti p
   WHERE p.id_proveedor = v_prov_hw;

  -- ========================================================================
  -- VALIDACIÓN FINAL: si algo no cuadra, se revierte todo
  -- ========================================================================
  IF EXISTS (SELECT 1 FROM activo a LEFT JOIN usuario u ON u.id_usuario = a.id_usuario_custodio
              WHERE a.id_usuario_custodio IS NOT NULL AND (u.id_usuario IS NULL OR u.estado_registro = false)) THEN
    v_problemas := v_problemas || ' · activos con custodio inexistente o inactivo';
  END IF;
  IF EXISTS (SELECT 1 FROM activo WHERE tipo_activo IN ('LAPTOP', 'DESKTOP') AND estado_activo <> 'EN_STOCK' AND id_usuario_custodio IS NULL) THEN
    v_problemas := v_problemas || ' · equipos en uso sin custodio';
  END IF;
  IF EXISTS (SELECT 1 FROM usuario u WHERE u.estado_registro = true
              AND NOT EXISTS (SELECT 1 FROM activo a WHERE a.id_usuario_custodio = u.id_usuario AND a.tipo_activo IN ('LAPTOP', 'DESKTOP'))) THEN
    v_problemas := v_problemas || ' · usuarios activos sin equipo';
  END IF;
  IF EXISTS (SELECT 1 FROM licencia_software WHERE cantidad_en_uso > cantidad_adquirida) THEN
    v_problemas := v_problemas || ' · licencias usadas por encima de las compradas';
  END IF;
  IF EXISTS (SELECT 1 FROM licencia_software l
              WHERE l.cantidad_en_uso <> (SELECT COUNT(*) FROM licencia_asignacion a WHERE a.id_licencia = l.id_licencia AND a.fecha_devolucion IS NULL)) THEN
    v_problemas := v_problemas || ' · licencias en uso que no coinciden con sus asignaciones';
  END IF;
  IF EXISTS (SELECT 1 FROM elemento_configuracion WHERE tipo_ci IN ('SERVIDOR_FISICO', 'NODO_RED') AND id_activo IS NULL) THEN
    v_problemas := v_problemas || ' · CI físicos sin su activo';
  END IF;
  IF EXISTS (SELECT 1 FROM elemento_configuracion ci
              WHERE ci.tipo_ci NOT IN ('SERVIDOR_FISICO', 'NODO_RED')
                AND NOT EXISTS (SELECT 1 FROM ci_relacion cr WHERE cr.id_ci_hijo = ci.id_ci)) THEN
    v_problemas := v_problemas || ' · CI lógicos sin nada que los sostenga';
  END IF;
  IF EXISTS (SELECT 1 FROM activo a WHERE NOT EXISTS (SELECT 1 FROM activo_historial h WHERE h.id_activo = a.id_activo)) THEN
    v_problemas := v_problemas || ' · activos sin historial de alta';
  END IF;

  IF v_problemas <> '' THEN
    RAISE EXCEPTION 'La carga no cuadra y se revirtió:%', v_problemas;
  END IF;

  RAISE NOTICE 'Carga completa: % activos, % CI, % relaciones, % licencias, % asignaciones, % mantenimientos.',
    (SELECT COUNT(*) FROM activo), (SELECT COUNT(*) FROM elemento_configuracion), (SELECT COUNT(*) FROM ci_relacion),
    (SELECT COUNT(*) FROM licencia_software), (SELECT COUNT(*) FROM licencia_asignacion), (SELECT COUNT(*) FROM mantenimiento_activo);
END $$;

-- Verificación: resumen de lo cargado y controles de cuadre (todos en 0)
SELECT (SELECT COUNT(*) FROM activo)                                                        AS activos,
       (SELECT COUNT(*) FROM activo WHERE id_usuario_custodio IS NOT NULL)                  AS con_custodio,
       (SELECT COUNT(*) FROM elemento_configuracion)                                        AS ci,
       (SELECT COUNT(*) FROM ci_relacion)                                                   AS relaciones,
       (SELECT COUNT(*) FROM licencia_software)                                             AS licencias,
       (SELECT COUNT(*) FROM licencia_asignacion)                                           AS asignaciones,
       (SELECT COUNT(*) FROM usuario u WHERE u.estado_registro
           AND NOT EXISTS (SELECT 1 FROM activo a WHERE a.id_usuario_custodio = u.id_usuario)) AS control_usuarios_sin_equipo,
       (SELECT COUNT(*) FROM licencia_software WHERE cantidad_en_uso > cantidad_adquirida)  AS control_licencias_excedidas,
       (SELECT COUNT(*) FROM elemento_configuracion
         WHERE tipo_ci IN ('SERVIDOR_FISICO', 'NODO_RED') AND id_activo IS NULL)           AS control_ci_fisicos_sin_activo;
