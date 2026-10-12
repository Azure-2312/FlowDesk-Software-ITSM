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
      { source: "/tecnico/:path*", destination: "/plataforma/tecnico/:path*" },
    ];
  },
};

module.exports = nextConfig;
