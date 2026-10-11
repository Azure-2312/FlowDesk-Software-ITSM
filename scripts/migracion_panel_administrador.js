const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log("Iniciando migración para panel avanzado de administración...");

  // 1. Tabla para configuraciones del sistema (JSONB flexible para vistas de tickets, formularios, notificaciones, etc.)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS configuracion_sistema (
      clave VARCHAR(100) PRIMARY KEY,
      categoria VARCHAR(50) NOT NULL,
      descripcion VARCHAR(255),
      valor JSONB NOT NULL,
      usuario_modificacion INT REFERENCES usuario(id_usuario),
      fecha_modificacion TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 2. Tabla para log de auditoría integral del sistema (Audit Trail)
  await pool.query(`
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
  `);

  // 3. Tabla para tipos de Elementos de Configuración (CMDB Modeling)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tipo_ci (
      id_tipo_ci SERIAL PRIMARY KEY,
      codigo VARCHAR(30) UNIQUE NOT NULL,
      nombre VARCHAR(80) NOT NULL,
      descripcion TEXT,
      categoria VARCHAR(50) NOT NULL, -- INFRAESTRUCTURA, APLICACION, RED, LICENCIA, SERVICIO
      icono VARCHAR(50) DEFAULT 'server',
      atributos_requeridos JSONB DEFAULT '[]'::jsonb,
      reglas_impacto JSONB DEFAULT '[]'::jsonb,
      estado_registro BOOLEAN DEFAULT TRUE,
      fecha_creacion TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Poblar tipos_ci estándar si no existen
  const checkTiposCI = await pool.query(`SELECT COUNT(*)::int as total FROM tipo_ci`);
  if (checkTiposCI.rows[0].total === 0) {
    await pool.query(`
      INSERT INTO tipo_ci (codigo, nombre, descripcion, categoria, icono, atributos_requeridos, reglas_impacto)
      VALUES 
      ('SRV_FISICO', 'Servidor Físico', 'Equipos bare-metal de centro de datos o rack', 'INFRAESTRUCTURA', 'server', '["ip_principal", "ram_gb", "procesador", "ubicacion_rack"]'::jsonb, '[{"relacion": "ALOJA", "tipo_destino": "SRV_CLOUD", "impacto": "CRITICO"}]'::jsonb),
      ('SRV_CLOUD', 'Servidor Cloud / VM', 'Instancias virtuales en la nube o hipervisor', 'INFRAESTRUCTURA', 'cloud', '["proveedor", "ip_privada", "ip_publica", "so_version"]'::jsonb, '[{"relacion": "EJECUTA", "tipo_destino": "BD", "impacto": "ALTO"}]'::jsonb),
      ('BD', 'Base de Datos', 'Motores de bases de datos relacionales o NoSQL', 'APLICACION', 'database', '["motor", "puerto", "version", "tamanio_gb"]'::jsonb, '[{"relacion": "SOPORTA", "tipo_destino": "APP_NEGOCIO", "impacto": "BLOQUEANTE"}]'::jsonb),
      ('RED_SWITCH', 'Switch / Router de Red', 'Equipos de comunicaciones y conmutación perimetral', 'RED', 'network', '["marca", "modelo", "puertos", "vlan"]'::jsonb, '[{"relacion": "CONECTA", "tipo_destino": "SRV_FISICO", "impacto": "CRITICO"}]'::jsonb),
      ('APP_NEGOCIO', 'Aplicación de Negocio (ERP/CRM)', 'Sistemas transaccionales de cara al usuario final', 'APLICACION', 'app', '["url_acceso", "area_propietaria", "sla_critico"]'::jsonb, '[{"relacion": "DEPENDE_DE", "tipo_destino": "BD", "impacto": "TOTAL"}]'::jsonb),
      ('LIC_SOFTWARE', 'Licencia de Software', 'Contrato o suscripción de software corporativo', 'LICENCIA', 'key', '["fabricante", "asientos_totales", "fecha_vencimiento"]'::jsonb, '[{"relacion": "ASIGNADA_A", "tipo_destino": "APP_NEGOCIO", "impacto": "LEGAL"}]'::jsonb)
    `);
  }

  // 4. Sembrar configuraciones iniciales por defecto si no existen
  const configsDefecto = [
    {
      clave: 'vistas_ticket_perfil',
      categoria: 'TICKETS',
      descripcion: 'Configuración de visibilidad de secciones y tipos de ticket por perfil',
      valor: {
        solicitante: {
          ver_incidentes: true,
          ver_solicitudes: true,
          ver_problemas: false,
          ver_cambios: false,
          seccion_notas_internas: false,
          seccion_respuestas_publicas: true,
          seccion_cmdb: false,
          seccion_costos_sla: false,
          seccion_transiciones: false
        },
        tecnico: {
          ver_incidentes: true,
          ver_solicitudes: true,
          ver_problemas: true,
          ver_cambios: true,
          seccion_notas_internas: true,
          seccion_respuestas_publicas: true,
          seccion_cmdb: true,
          seccion_costos_sla: true,
          seccion_transiciones: true
        },
        supervisor: {
          ver_incidentes: true,
          ver_solicitudes: true,
          ver_problemas: true,
          ver_cambios: true,
          seccion_notas_internas: true,
          seccion_respuestas_publicas: true,
          seccion_cmdb: true,
          seccion_costos_sla: true,
          seccion_transiciones: true
        },
        gestor_area: {
          ver_incidentes: true,
          ver_solicitudes: true,
          ver_problemas: false,
          ver_cambios: true,
          seccion_notas_internas: false,
          seccion_respuestas_publicas: true,
          seccion_cmdb: true,
          seccion_costos_sla: true,
          seccion_transiciones: false
        }
      }
    },
    {
      clave: 'formularios_ticket_campos',
      categoria: 'TICKETS',
      descripcion: 'Configuración de campos requeridos por tipo de ticket',
      valor: {
        incidente: {
          titulo: { requerido: true, visible: true },
          descripcion: { requerido: true, visible: true },
          servicio: { requerido: true, visible: true },
          urgencia: { requerido: true, visible: true },
          impacto: { requerido: true, visible: true },
          ci_afectado: { requerido: false, visible: true },
          adjuntos: { requerido: false, visible: true }
        },
        solicitud: {
          titulo: { requerido: true, visible: true },
          descripcion: { requerido: true, visible: true },
          servicio: { requerido: true, visible: true },
          justificacion: { requerido: true, visible: true },
          urgencia: { requerido: false, visible: true },
          impacto: { requerido: false, visible: true },
          adjuntos: { requerido: false, visible: true }
        },
        problema: {
          titulo: { requerido: true, visible: true },
          descripcion: { requerido: true, visible: true },
          servicio: { requerido: true, visible: true },
          ci_afectado: { requerido: true, visible: true },
          urgencia: { requerido: true, visible: true },
          impacto: { requerido: true, visible: true },
          analisis_causa_raiz: { requerido: true, visible: true },
          error_conocido: { requerido: false, visible: true }
        },
        cambio: {
          titulo: { requerido: true, visible: true },
          descripcion: { requerido: true, visible: true },
          servicio: { requerido: true, visible: true },
          ci_afectado: { requerido: true, visible: true },
          tipo_cambio: { requerido: true, visible: true },
          plan_trabajo: { requerido: true, visible: true },
          plan_rollback: { requerido: true, visible: true },
          plan_pruebas: { requerido: true, visible: true },
          ventana_mantenimiento: { requerido: true, visible: true }
        }
      }
    },
    {
      clave: 'plantillas_correo_html',
      categoria: 'NOTIFICACIONES',
      descripcion: 'Plantillas HTML y diseño corporativo de correos del sistema',
      valor: {
        color_primario: '#2563eb',
        nombre_empresa: 'Sistema Institucional de Gestión de Servicios TI',
        logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
        plantillas: {
          ticket_creado: {
            asunto: 'Ticket Registrado: [{{codigo_ticket}}] {{titulo}}',
            encabezado: 'Su requerimiento ha sido registrado formalmente',
            cuerpo: 'Estimado/a {{solicitante_nombre}},\n\nHemos recibido satisfactoriamente su requerimiento en la Mesa de Servicio. Un especialista asignado procederá a su atención dentro del plazo comprometido por el acuerdo de nivel de servicio (SLA).\n\nPuede consultar el avance y la línea de tiempo en el portal.',
            destinatarios: { solicitante: true, tecnico: false, supervisor: true }
          },
          ticket_resuelto: {
            asunto: 'Ticket Resuelto: [{{codigo_ticket}}] {{titulo}}',
            encabezado: 'El servicio ha sido restablecido',
            cuerpo: 'Estimado/a {{solicitante_nombre}},\n\nLe informamos que el caso {{codigo_ticket}} ha sido resuelto por el equipo técnico resolutor.\n\nPor favor ingrese al sistema para calificar el servicio y confirmar el cierre definitivo del caso.',
            destinatarios: { solicitante: true, tecnico: true, supervisor: true }
          },
          cambio_cab: {
            asunto: 'Convocatoria CAB para Solicitud de Cambio: [{{codigo_cambio}}]',
            encabezado: 'Revisión y Dictamen Colegiado del Comité CAB',
            cuerpo: 'Estimado Miembro del CAB,\n\nSe ha programado una solicitud de cambio que requiere evaluación de contingencias y análisis de impacto en la infraestructura.',
            destinatarios: { solicitante: false, tecnico: true, supervisor: true, cab: true }
          }
        }
      }
    },
    {
      clave: 'canales_comunicacion',
      categoria: 'NOTIFICACIONES',
      descripcion: 'Configuración de canales externos para mensajería y alertas',
      valor: {
        whatsapp: { activo: false, proveedor: 'Meta Cloud API', webhook_url: '', telefono_remitente: '+51 900 000 000' },
        sms: { activo: false, proveedor: 'Twilio Gateway', account_sid: '', remitente: 'MESA_TI' },
        slack: { activo: true, webhook_url: 'https://hooks.slack.com/services/T00/B00/XXXXX', canal: '#soporte-critico-ti' },
        teams: { activo: false, webhook_url: 'https://outlook.office.com/webhook/XXXXX', canal: 'Alertas Infraestructura TI' }
      }
    }
  ];

  for (const c of configsDefecto) {
    await pool.query(`
      INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (clave) DO NOTHING
    `, [c.clave, c.categoria, c.descripcion, JSON.stringify(c.valor)]);
  }

  // 5. Sembrar un primer log de auditoría del sistema
  await pool.query(`
    INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
    VALUES (1, 'GOBERNANZA', 'CONFIGURACION_INICIAL', 'Inicialización del marco de gobernanza, plantillas de correo y modelado CMDB', '{"version": "2.0", "perfiles_configurados": 5}'::jsonb, '127.0.0.1')
  `);

  console.log("Migración completada con éxito.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Error en migración:", err);
  process.exit(1);
});
