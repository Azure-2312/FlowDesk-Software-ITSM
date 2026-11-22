import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    nombre: "API RESTful de Gestión e Integración de Clientes y Usuarios",
    plataforma: "FlowDesk ITSM",
    version: "1.0.0",
    autenticacion: {
      tipo: "API Key (X-API-KEY header)",
      seguridad: "Criptografía HMAC-SHA256 con Salt corporativo",
      almacenamiento_claves: "Hasheado unidireccional en base de datos (OWASP API Security)"
    },
    endpoints_disponibles: [
      { metodo: "GET", ruta: "/api/v1/health", descripcion: "Estado de salud y latencia de base de datos", acceso: "Público" },
      { metodo: "GET", ruta: "/api/v1/info", descripcion: "Especificación técnica de la API", acceso: "Público" },
      { metodo: "GET", ruta: "/api/v1/usuarios", descripcion: "Listado paginado de usuarios/trabajadores con filtros", acceso: "Privado (X-API-KEY)" },
      { metodo: "GET", ruta: "/api/v1/clientes", descripcion: "Alias idéntico para integración externa de clientes", acceso: "Privado (X-API-KEY)" },
      { metodo: "GET", ruta: "/api/v1/usuarios/:id", descripcion: "Detalle de trabajador por ID numérico", acceso: "Privado (X-API-KEY)" },
      { metodo: "GET", ruta: "/api/v1/usuarios/dni/:dni", descripcion: "Búsqueda directa por DNI peruano (8 dígitos)", acceso: "Privado (X-API-KEY)" },
      { metodo: "POST", ruta: "/api/v1/usuarios", descripcion: "Registrar nuevo trabajador en FlowDesk ITSM", acceso: "Privado (X-API-KEY)" },
      { metodo: "POST", ruta: "/api/v1/clientes", descripcion: "Registrar nuevo cliente en FlowDesk ITSM", acceso: "Privado (X-API-KEY)" },
      { metodo: "GET", ruta: "/api/v1/trazabilidad", descripcion: "Bitácora forense de auditoría inmutable", acceso: "Privado (X-API-KEY)" }
    ],
    timestamp: new Date().toISOString()
  });
}
