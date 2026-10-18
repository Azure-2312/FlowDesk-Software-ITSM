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
  async rewrites() {
    return [
      { source: "/dashboard", destination: "/plataforma/dashboard" },
      { source: "/admin/:path*", destination: "/plataforma/admin/:path*" },
      { source: "/tickets/:path*", destination: "/plataforma/tickets/:path*" },
      { source: "/incidentes/:path*", destination: "/plataforma/incidentes/:path*" },
      { source: "/solicitudes/:path*", destination: "/plataforma/solicitudes/:path*" },
      { source: "/cambios/:path*", destination: "/plataforma/cambios/:path*" },
      { source: "/problemas/:path*", destination: "/plataforma/problemas/:path*" },
      { source: "/activos/:path*", destination: "/plataforma/activos/:path*" },
      { source: "/mi-cuenta/:path*", destination: "/plataforma/mi-cuenta/:path*" },
      { source: "/operacion/:path*", destination: "/plataforma/operacion/:path*" },
      { source: "/proveedores/:path*", destination: "/plataforma/proveedores/:path*" },
      // Consolas de rol: las rutas raiz siguen siendo la URL publica; el
      // arbol interno vive en /plataforma/perfiles/<rol> (orden del repo).
      { source: "/tecnico/:path*", destination: "/plataforma/perfiles/tecnico/:path*" },
      { source: "/supervisor/:path*", destination: "/plataforma/perfiles/supervisor/:path*" },
      { source: "/gestor-area/:path*", destination: "/plataforma/perfiles/gestor-area/:path*" },
      { source: "/aprobador/:path*", destination: "/plataforma/perfiles/aprobador/:path*" },
      { source: "/auditor/:path*", destination: "/plataforma/perfiles/auditor/:path*" },
      { source: "/gestor-cambios/:path*", destination: "/plataforma/perfiles/gestor-cambios/:path*" },
    ];
  },
};

module.exports = nextConfig;
