import Link from "next/link";

export default function PaginaActivos() {
  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Gestión de Activos de TI y Configuración (CMDB)</h1>
          <p className="subtitulo">
            Práctica ITIL v4 e ISO/IEC 20000 para planificar y gestionar el ciclo de vida completo de todos los activos tecnológicos y sus interdependencias.
          </p>
        </div>
        <span
          className="badge-itil"
          style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "6px 12px", fontSize: 12 }}
        >
          Módulo en Preparación Técnica
        </span>
      </div>

      <div
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 8,
          padding: "16px 20px",
          marginBottom: 24,
          fontSize: 13,
          color: "#92400e",
          lineHeight: 1.6,
        }}
      >
        <strong>Aviso de Fase de Diseño:</strong> Este módulo integra la custodia patrimonial de hardware, el catálogo de Elementos de Configuración (CI) y el control de licenciamiento. Las vistas se encuentran actualmente en modo de visualización previa estructurada.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
          <h3 style={{ fontSize: 15, margin: 0, marginBottom: 8, color: "#0f172a" }}>Inventario de Activos</h3>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, marginBottom: 14 }}>
            Control de equipos de cómputo, servidores físicos, switches, series de fábrica y asignación de custodios.
          </p>
          <Link
            href="/activos/inventario"
            className="boton-mini"
            style={{ textDecoration: "none", display: "inline-block", backgroundColor: "#f1f5f9", color: "#1e293b", borderColor: "#cbd5e1" }}
          >
            Ver Inventario
          </Link>
        </div>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
          <h3 style={{ fontSize: 15, margin: 0, marginBottom: 8, color: "#0f172a" }}>Mapa CMDB</h3>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, marginBottom: 14 }}>
            Modelado de Elementos de Configuración (CI) y relaciones de dependencia para evaluación de impacto en incidentes y cambios.
          </p>
          <Link
            href="/activos/cmdb"
            className="boton-mini"
            style={{ textDecoration: "none", display: "inline-block", backgroundColor: "#f1f5f9", color: "#1e293b", borderColor: "#cbd5e1" }}
          >
            Ver Mapa CI
          </Link>
        </div>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
          <h3 style={{ fontSize: 15, margin: 0, marginBottom: 8, color: "#0f172a" }}>Licencias y Suscripciones</h3>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, marginBottom: 14 }}>
            Supervisión de asientos de software (M365, bases de datos, utilitarios) y alertas de vencimiento de garantías.
          </p>
          <Link
            href="/activos/licencias"
            className="boton-mini"
            style={{ textDecoration: "none", display: "inline-block", backgroundColor: "#f1f5f9", color: "#1e293b", borderColor: "#cbd5e1" }}
          >
            Ver Licencias
          </Link>
        </div>
      </div>
    </div>
  );
}
