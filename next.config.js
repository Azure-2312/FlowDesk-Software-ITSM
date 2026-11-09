/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/plataforma/admin/procesos/cambios/:path*",
        destination: "/plataforma/cambios/configuracion/:path*",
        permanent: false,
      },
      {
        source: "/plataforma/admin/procesos/problemas/:path*",
        destination: "/plataforma/problemas/configuracion/:path*",
        permanent: false,
      },
      {
        source: "/plataforma/admin/activos-config/:path*",
        destination: "/plataforma/activos/configuracion/:path*",
        permanent: false,
      },
      {
        source: "/plataforma/admin/departamentos-empresa",
        destination: "/plataforma/organizacion/departamentos-empresa",
        permanent: false,
      },
      {
        source: "/plataforma/admin/departamentos",
        destination: "/plataforma/organizacion/departamentos",
        permanent: false,
      },
      {
        source: "/plataforma/admin/tecnicos",
        destination: "/plataforma/organizacion/tecnicos",
        permanent: false,
      },
      {
        source: "/plataforma/admin/usuarios",
        destination: "/plataforma/seguridad/usuarios",
        permanent: false,
      },
      {
        source: "/plataforma/admin/perfiles",
        destination: "/plataforma/seguridad/perfiles",
        permanent: false,
      },
      {
        source: "/plataforma/admin/auditoria-sistema",
        destination: "/plataforma/seguridad/auditoria-sistema",
        permanent: false,
      },
      {
        source: "/plataforma/admin/seguridad-logs",
        destination: "/plataforma/seguridad/seguridad-logs",
        permanent: false,
      },
      {
        source: "/plataforma/admin/mantenimiento-datos",
        destination: "/plataforma/operacion/mantenimiento-datos",
        permanent: false,
      },
      {
        source: "/plataforma/admin/salud-sistema",
        destination: "/plataforma/operacion/salud-sistema",
        permanent: false,
      },
      {
        source: "/plataforma/admin/menu",
        destination: "/plataforma/operacion/menu",
        permanent: false,
      },
      {
        source: "/plataforma/admin/notificaciones",
        destination: "/plataforma/operacion/notificaciones",
        permanent: false,
      },
      {
        source: "/plataforma/admin/conocimiento-config",
        destination: "/plataforma/conocimiento/configuracion",
        permanent: false,
      },
      {
        source: "/plataforma/admin/servicios/sla",
        destination: "/plataforma/servicios/configuracion/sla",
        permanent: false,
      },
      {
        source: "/plataforma/admin/servicios",
        destination: "/plataforma/servicios/configuracion/categorias",
        permanent: false,
      },
      {
        source: "/plataforma/perfiles/administrador/panel",
        destination: "/plataforma/operacion/paneles/administrador",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/dashboard", destination: "/plataforma/dashboard" },
      { source: "/tickets/:path*", destination: "/plataforma/tickets/:path*" },
      { source: "/incidentes/:path*", destination: "/plataforma/incidentes/:path*" },
      { source: "/solicitudes/:path*", destination: "/plataforma/solicitudes/:path*" },
      { source: "/servicios/:path*", destination: "/plataforma/servicios/:path*" },
      { source: "/reportes/:path*", destination: "/plataforma/reportes/:path*" },
      { source: "/cambios/:path*", destination: "/plataforma/cambios/:path*" },
      { source: "/problemas/:path*", destination: "/plataforma/problemas/:path*" },
      { source: "/activos/:path*", destination: "/plataforma/activos/:path*" },
      { source: "/mi-cuenta/:path*", destination: "/plataforma/mi-cuenta/:path*" },
      { source: "/operacion/:path*", destination: "/plataforma/operacion/:path*" },
      { source: "/proveedores/:path*", destination: "/plataforma/proveedores/:path*" },
      { source: "/gestor-activos/:path*", destination: "/plataforma/gestor-activos/:path*" },
      { source: "/gestor-problemas/:path*", destination: "/plataforma/gestor-problemas/:path*" },
      { source: "/avisos/:path*", destination: "/plataforma/avisos/:path*" },
      { source: "/conocimiento/:path*", destination: "/plataforma/conocimiento/:path*" },
    ];
  },
};

module.exports = nextConfig;
