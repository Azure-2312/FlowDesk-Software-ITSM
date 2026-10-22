import Link from "next/link";

export default function PaginaAdministracion() {
  const secciones = [
    {
      categoria: "Diseño y Gobierno de Tickets",
      items: [
        {
          titulo: "Diseñador de Vistas por Perfil",
          descripcion: "Configuración de qué secciones, notas internas, respuestas y tipos de ticket puede visualizar cada rol institucional.",
          href: "/admin/tickets-vistas",
        },
        {
          titulo: "Constructor de Formularios",
          descripcion: "Definición de campos requeridos y visibles para incidentes, solicitudes, problemas y cambios RFC.",
          href: "/admin/tickets-formularios",
        },
      ],
    },
    {
      categoria: "Portafolio, Autoservicio y Conocimiento",
      items: [
        {
          titulo: "Catálogo de Servicios y SLAs",
          descripcion: "Definición de servicios de TI, clasificación de tipos, categorías y acuerdos de nivel de servicio según ITIL v4.",
          href: "/admin/servicios",
        },
        {
          titulo: "Gobernanza de Conocimientos (KCS)",
          descripcion: "Supervisión del ciclo editorial, métricas de deflexión y configuración del flujo de aprobación técnica de artículos.",
          href: "/plataforma/admin/conocimiento-config/articulos",
        },
        {
          titulo: "Configuración de Categorías",
          descripcion: "Taxonomía de soporte, códigos de clasificación temática y catálogo de categorías de autoayuda.",
          href: "/plataforma/admin/conocimiento-config/categorias",
        },
      ],
    },
    {
      categoria: "Comunicaciones y Notificaciones",
      items: [
        {
          titulo: "Plantillas de Correo y Canales",
          descripcion: "Diseño visual HTML de correos con logotipo de marca y parametrización de integraciones (WhatsApp, SMS, Slack, Teams).",
          href: "/admin/notificaciones",
        },
      ],
    },
    {
      categoria: "Identidades, Organización y Accesos (IAM)",
      items: [
        {
          titulo: "Gestión de Usuarios",
          descripcion: "Administración integral de usuarios, asignación de perfiles, reseteo de contraseñas y desbloqueo de seguridad.",
          href: "/admin/usuarios",
        },
        {
          titulo: "Perfiles y Permisos (RBAC)",
          descripcion: "Matriz de privilegios institucionales, control de accesos a menús y delimitación de funciones SoD.",
          href: "/admin/perfiles",
        },
        {
          titulo: "Departamentos y Acuerdos OLA",
          descripcion: "Estructura organizativa de áreas resolutoras de TI, jefaturas responsables y acuerdos de nivel operativo.",
          href: "/admin/departamentos",
        },
        {
          titulo: "Especialistas Técnicos",
          descripcion: "Enrolamiento de técnicos, asignación de niveles (L1/L2/L3) y calibración de capacidad concurrente (límite WIP).",
          href: "/admin/tecnicos",
        },
        {
          titulo: "Estructura del Menú",
          descripcion: "Parametrización dinámica de la jerarquía de opciones, iconos y niveles de visibilidad.",
          href: "/admin/menu",
        },
      ],
    },
    {
      categoria: "Auditoría, Analítica y Mantenimiento",
      items: [
        {
          titulo: "Bitácora de Auditoría Integral (Audit Trail)",
          descripcion: "Registro inmutable de todas las modificaciones de configuración y eventos del sistema con identificación de usuario y fecha.",
          href: "/admin/auditoria-sistema",
        },
        {
          titulo: "Diseñador de Dashboards Globales",
          descripcion: "Configuración de gráficos de rendimiento gerenciales (gráficos de pastel de tickets, barras de SLA, tendencias MTTR).",
          href: "/plataforma/reportes/tableros",
        },
        {
          titulo: "Mantenimiento y Purga de Datos",
          descripcion: "Herramientas de optimización para archivar y purgar de manera segura tickets cerrados antiguos de la base de datos.",
          href: "/admin/mantenimiento-datos",
        },
        {
          titulo: "Logs de Seguridad ISO 27001",
          descripcion: "Trazabilidad de intentos de inicio de sesión, bloqueos por fuerza bruta y auditoría de direcciones IP.",
          href: "/admin/seguridad-logs",
        },
      ],
    },
  ];

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Panel de Administración del Sistema</h1>
          <p className="subtitulo">
            Centro de arquitectura, gobernanza global de servicios TI, diseño de formularios, auditoría inmutable y mantenimiento de la plataforma.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {secciones.map((sec, idx) => (
          <div key={idx}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
              {sec.categoria}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
              {sec.items.map((m) => (
                <div
                  key={m.href}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 14, margin: "0 0 6px 0", color: "#0f172a", fontWeight: 700 }}>{m.titulo}</h3>
                    <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                      {m.descripcion}
                    </p>
                  </div>
                  <div>
                    <Link
                      href={m.href}
                      className="boton-mini"
                      style={{
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "#f1f5f9",
                        color: "#1e293b",
                        borderColor: "#cbd5e1",
                        fontSize: 12,
                        padding: "5px 10px",
                      }}
                    >
                      <span>Configurar</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
