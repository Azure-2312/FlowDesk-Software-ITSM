-- Migración para configuracion_sistema y tablas del panel de administración

CREATE TABLE IF NOT EXISTS configuracion_sistema (
  clave VARCHAR(100) PRIMARY KEY,
  categoria VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  valor JSONB NOT NULL,
  usuario_modificacion INT REFERENCES usuario(id_usuario),
  fecha_modificacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS log_auditoria_sistema (
  id_log SERIAL PRIMARY KEY,
  id_usuario INT REFERENCES usuario(id_usuario),
  modulo VARCHAR(60) NOT NULL,
  accion VARCHAR(30) NOT NULL,
  descripcion TEXT NOT NULL,
  detalles JSONB,
  direccion_ip VARCHAR(45),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipo_ci (
  id_tipo_ci SERIAL PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50) NOT NULL,
  icono VARCHAR(50) DEFAULT 'server',
  atributos_requeridos JSONB DEFAULT '[]'::jsonb,
  reglas_impacto JSONB DEFAULT '[]'::jsonb,
  estado_registro BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tipo_ci (codigo, nombre, descripcion, categoria, icono, atributos_requeridos, reglas_impacto)
VALUES 
  ('SRV_FISICO', 'Servidor Físico', 'Equipos bare-metal de centro de datos o rack', 'INFRAESTRUCTURA', 'server', '["ip_principal", "ram_gb", "procesador", "ubicacion_rack"]'::jsonb, '[{"relacion": "ALOJA", "tipo_destino": "SRV_CLOUD", "impacto": "CRITICO"}]'::jsonb),
  ('SRV_CLOUD', 'Servidor Cloud / VM', 'Instancias virtuales en la nube o hipervisor', 'INFRAESTRUCTURA', 'cloud', '["proveedor", "ip_privada", "ip_publica", "so_version"]'::jsonb, '[{"relacion": "EJECUTA", "tipo_destino": "BD", "impacto": "ALTO"}]'::jsonb),
  ('BD', 'Base de Datos', 'Motores de bases de datos relacionales o NoSQL', 'APLICACION', 'database', '["motor", "puerto", "version", "tamanio_gb"]'::jsonb, '[{"relacion": "SOPORTA", "tipo_destino": "APP_NEGOCIO", "impacto": "BLOQUEANTE"}]'::jsonb),
  ('RED_SWITCH', 'Switch / Router de Red', 'Equipos de comunicaciones y conmutación perimetral', 'RED', 'network', '["marca", "modelo", "puertos", "vlan"]'::jsonb, '[{"relacion": "CONECTA", "tipo_destino": "SRV_FISICO", "impacto": "CRITICO"}]'::jsonb),
  ('APP_NEGOCIO', 'Aplicación de Negocio (ERP/CRM)', 'Sistemas transaccionales de cara al usuario final', 'APLICACION', 'app', '["url_acceso", "area_propietaria", "sla_critico"]'::jsonb, '[{"relacion": "DEPENDE_DE", "tipo_destino": "BD", "impacto": "TOTAL"}]'::jsonb),
  ('LIC_SOFTWARE', 'Licencia de Software', 'Contrato o suscripción de software corporativo', 'LICENCIA', 'key', '["fabricante", "asientos_totales", "fecha_vencimiento"]'::jsonb, '[{"relacion": "ASIGNADA_A", "tipo_destino": "APP_NEGOCIO", "impacto": "LEGAL"}]'::jsonb)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor)
VALUES 
  ('limite_campos_personalizados_cambio', 'CAMBIOS', 'Límite de campos personalizados para el módulo de cambios', '30'::jsonb),
  ('limite_campos_personalizados_problemas', 'PROBLEMAS', 'Límite de campos personalizados para el módulo de problemas', '30'::jsonb)
ON CONFLICT (clave) DO NOTHING;
