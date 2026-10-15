import Link from "next/link";

export default function VistaCambios() {
  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Gesti\u00f3n de Cambios (Change Enablement)</h1>
          <p className="subtitulo">
            Pr\u00e1ctica ITIL v4 e ISO/IEC 20000 para maximizar el n\u00famero de cambios de TI exitosos asegurando la adecuada evaluaci\u00f3n de riesgos y autorizaci\u00f3n.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span
            className="badge-itil"
            style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "6px 12px", fontSize: 12 }}
          >
            M\u00f3dulo en Preparaci\u00f3n T\u00e9cnica
          </span>
        </div>
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
        <strong>Aviso de Fase de Dise\u00f1o:</strong> Esta secci\u00f3n forma parte de la ampliaci\u00f3n de cobertura ITIL v4 del sistema. Las vistas, formularios y tableros est\u00e1n estructurados visualmente para validaci\u00f3n arquitect\u00f3nica, pero sus controles se encuentran temporalmente no operativos.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
          <h3 style={{ fontSize: 15, margin: 0, marginBottom: 8, color: "#0f172a" }}>Crear Solicitud RFC</h3>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, marginBottom: 14 }}>
            Formulario estructurado con plan de implementaci\u00f3n, an\u00e1lisis de riesgos y plan de contingencia (rollback).
          </p>
          <Link
            href="/cambios/gestion/crear"
            className="boton-mini"
            style={{ textDecoration: "none", display: "inline-block", backgroundColor: "#f1f5f9", color: "#1e293b", borderColor: "#cbd5e1" }}
          >
            Ver Formulario RFC
          </Link>
        </div>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
          <h3 style={{ fontSize: 15, margin: 0, marginBottom: 8, color: "#0f172a" }}>Autorizaciones CAB</h3>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, marginBottom: 14 }}>
            Bandeja del Comit\u00e9 Asesor de Cambios (Change Advisory Board) con regla de autoexclusi\u00f3n para aprobadores.
          </p>
          <Link
            href="/cambios/gestion/cab"
            className="boton-mini"
            style={{ textDecoration: "none", display: "inline-block", backgroundColor: "#f1f5f9", color: "#1e293b", borderColor: "#cbd5e1" }}
          >
            Ver Bandeja CAB
          </Link>
        </div>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
          <h3 style={{ fontSize: 15, margin: 0, marginBottom: 8, color: "#0f172a" }}>Calendario de Ventanas</h3>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, marginBottom: 14 }}>
            Programaci\u00f3n de ventanas de mantenimiento preventivo y detecci\u00f3n de periodos de congelamiento (change freeze).
          </p>
          <Link
            href="/cambios/gestion/calendario"
            className="boton-mini"
            style={{ textDecoration: "none", display: "inline-block", backgroundColor: "#f1f5f9", color: "#1e293b", borderColor: "#cbd5e1" }}
          >
            Ver Calendario
          </Link>
        </div>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
          <h3 style={{ fontSize: 15, margin: 0, marginBottom: 8, color: "#0f172a" }}>Historial Consolidado</h3>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, marginBottom: 14 }}>
            Auditor\u00eda de todos los cambios registrados, evaluaci\u00f3n post-implementaci\u00f3n (PIR) y lecciones aprendidas.
          </p>
          <Link
            href="/cambios/gestion/todos"
            className="boton-mini"
            style={{ textDecoration: "none", display: "inline-block", backgroundColor: "#f1f5f9", color: "#1e293b", borderColor: "#cbd5e1" }}
          >
            Ver Historial
          </Link>
        </div>
      </div>
    </div>
  );
}
