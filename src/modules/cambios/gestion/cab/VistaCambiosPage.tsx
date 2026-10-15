"use client";

import { useEffect, useState } from "react";
import { Cambio, SesionUsuario } from "@/types";

export default function PaginaAutorizacionesCAB() {
  const [rfcs, setRfcs] = useState<Cambio[]>([]);
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Estado del modal de votación CAB
  const [rfcVotar, setRfcVotar] = useState<Cambio | null>(null);
  const [decision, setDecision] = useState<"APROBADO" | "RECHAZADO" | "OBSERVADO">("APROBADO");
  const [comentario, setComentario] = useState("");
  const [enviandoVoto, setEnviandoVoto] = useState(false);
  const [errorVoto, setErrorVoto] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [resCambios, resSesion] = await Promise.all([
        fetch("/api/cambios?estado=2").then((r) => r.json()),
        fetch("/api/menu").then((r) => r.json()),
      ]);

      if (Array.isArray(resCambios)) setRfcs(resCambios);
      if (resSesion?.sesion) setSesion(resSesion.sesion);
    } catch (err) {
      console.error("Error al cargar cambios para CAB:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const idPerfilActivo = sesion?.perfilActivo?.id_perfil;
  const esAdmin = idPerfilActivo === 1;
  const esAprobadorCab = idPerfilActivo === 7;

  async function manejarVoto(e: React.FormEvent) {
    e.preventDefault();
    if (!rfcVotar) return;
    setErrorVoto(null);

    if (!comentario.trim() || comentario.trim().length < 8) {
      setErrorVoto("El dictamen técnico del comité CAB debe tener al menos 8 caracteres explicativos.");
      return;
    }

    setEnviandoVoto(true);
    try {
      const res = await fetch(`/api/cambios/${rfcVotar.id_cambio}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          comentario: comentario.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorVoto(data.error || "No se pudo registrar el voto en el comité.");
        return;
      }

      setMensajeExito(`Dictamen ${decision} emitido formalmente para ${rfcVotar.codigo_cambio}.`);
      setRfcVotar(null);
      setComentario("");
      await cargarDatos();
    } catch {
      setErrorVoto("Error de conexión al emitir dictamen CAB.");
    } finally {
      setEnviandoVoto(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Bandeja de Autorizaciones CAB (Change Advisory Board)</h1>
          <p className="descripcion">
            Evaluación colegiada de solicitudes de cambio mayores y normales para mitigar riesgos operacionales (ITIL v4 / ISO 20000).
          </p>
        </div>
      </div>

      {/* Alerta de Segregación de Funciones */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "14px 18px",
          marginBottom: 20,
          fontSize: 12.5,
          color: "#334155",
          lineHeight: 1.6,
        }}
      >
        <strong>Regla de Autoexclusión SoD (ITIL v4 e ISO 27001):</strong> El miembro del comité CAB que figure como solicitante o técnico responsable de una solicitud no podrá emitir voto de aprobación sobre su propio cambio. Asimismo, el Administrador del sistema actúa en rol de gobernanza y no emite votos técnicos de infraestructura.
      </div>

      {esAdmin ? (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 12.5,
            color: "#991b1b",
          }}
        >
          <strong>Aviso de Gobernanza SoD:</strong> Su sesión se encuentra activa bajo el perfil Administrador. Por principio de Segregación de Funciones, el Administrador puede supervisar las actas del CAB pero no emite votos técnicos directos.
        </div>
      ) : null}

      {idPerfilActivo === 8 ? (
        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 12.5,
            color: "#1e3a8a",
          }}
        >
          Vista de consulta para el Gestor de Cambios. Los dictámenes y votos solo están disponibles para integrantes del perfil Aprobador CAB.
        </div>
      ) : null}

      {mensajeExito && (
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {mensajeExito}
        </div>
      )}

      {cargando ? (
        <div className="contenedor-tabla" style={{ padding: 32, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
          Consultando solicitudes pendientes de evaluación CAB...
        </div>
      ) : rfcs.length === 0 ? (
        <div className="contenedor-tabla" style={{ padding: 36, textAlign: "center", backgroundColor: "#f8fafc" }}>
          <p style={{ margin: 0, color: "#64748b", fontWeight: 600 }}>
            No hay solicitudes de cambio pendientes de dictamen en el comité CAB en este momento.
          </p>
        </div>
      ) : (
        <div className="contenedor-tabla">
          <div style={{ overflowX: "auto" }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Código RFC</th>
                  <th>Título del Cambio</th>
                  <th>Tipo</th>
                  <th>CI Afectado</th>
                  <th>Solicitante</th>
                  <th>Ventana Programada</th>
                  <th>Regla SoD</th>
                  <th style={{ textAlign: "right" }}>{esAprobadorCab ? "Acción CAB" : "Acceso"}</th>
                </tr>
              </thead>
              <tbody>
                {rfcs.map((rfc) => {
                  const esMiSolicitud = rfc.id_usuario_solicitante === sesion?.id_usuario;
                  const esResponsable = rfc.id_usuario_responsable === sesion?.id_usuario;
                  const puedeVotar = esAprobadorCab && !esMiSolicitud && !esResponsable;

                  return (
                    <tr key={rfc.id_cambio}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e293b" }}>{rfc.codigo_cambio}</td>
                      <td style={{ fontWeight: 600, maxWidth: 280 }}>{rfc.titulo}</td>
                      <td>
                        <span
                          className="badge-itil"
                          style={{
                            backgroundColor: rfc.tipo_cambio === "EMERGENCIA" ? "#fee2e2" : "#eff6ff",
                            color: rfc.tipo_cambio === "EMERGENCIA" ? "#991b1b" : "#1e40af",
                            border: `1px solid ${rfc.tipo_cambio === "EMERGENCIA" ? "#fecaca" : "#bfdbfe"}`,
                          }}
                        >
                          {rfc.tipo_cambio}
                        </span>
                      </td>
                      <td>{rfc.ci_codigo ? `[${rfc.ci_codigo}] ${rfc.ci_nombre}` : "General"}</td>
                      <td>{rfc.solicitante_nombre}</td>
                      <td style={{ fontSize: 11.5 }}>
                        {new Date(rfc.ventana_inicio).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td>
                        {esMiSolicitud || esResponsable ? (
                          <span style={{ fontSize: 11, color: "#b45309", backgroundColor: "#fef3c7", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                            {esMiSolicitud ? "Solicitante" : "Responsable"} — autoexclusión
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: esAprobadorCab ? "#15803d" : "#64748b" }}>
                            {esAprobadorCab ? "Habilitado" : "Solo lectura"}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right", width: 50 }}>
                        {esAprobadorCab ? <button
                          type="button"
                          className="boton-primario"
                          style={{
                            width: "auto",
                            padding: "6px 10px",
                            backgroundColor: puedeVotar ? "#2563eb" : "#94a3b8",
                            borderColor: puedeVotar ? "#1d4ed8" : "#94a3b8",
                            cursor: puedeVotar ? "pointer" : "not-allowed",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          disabled={!puedeVotar}
                          onClick={() => {
                            setRfcVotar(rfc);
                            setDecision("APROBADO");
                            setComentario("");
                            setErrorVoto(null);
                          }}
                          title={
                            esMiSolicitud
                              ? "Autoexclusión SoD: El solicitante no puede dictaminar su propio cambio"
                              : esResponsable
                              ? "Autoexclusión SoD: El responsable no puede dictaminar su propio cambio"
                              : "Evaluar y emitir dictamen técnico CAB"
                          }
                          aria-label="Evaluar y emitir dictamen técnico CAB"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="9 11 12 14 22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          </svg>
                        </button> : <span style={{ fontSize: 11.5, color: "#64748b" }}>Solo lectura</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Dictamen CAB */}
      {rfcVotar && (
        <div className="modal-overlay" onClick={() => setRfcVotar(null)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640, padding: 24, backgroundColor: "#ffffff" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#2563eb" }}>
                  {rfcVotar.codigo_cambio}
                </span>
                <h3 style={{ margin: "4px 0", fontSize: 17, color: "#0f172a" }}>Dictamen Colegiado del Comité CAB</h3>
              </div>
              <button
                type="button"
                className="modal-cerrar-boton"
                onClick={() => setRfcVotar(null)}
                title="Cerrar modal"
                aria-label="Cerrar modal"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 8, marginBottom: 14, fontSize: 12.5 }}>
              <div><strong>Título:</strong> {rfcVotar.titulo}</div>
              <div><strong>Justificación:</strong> {rfcVotar.justificacion}</div>
              <div><strong>Plan de Rollback:</strong> {rfcVotar.plan_rollback}</div>
            </div>

            {errorVoto && (
              <div className="mensaje-error" style={{ marginBottom: 12 }}>
                {errorVoto}
              </div>
            )}

            <form onSubmit={manejarVoto}>
              <div style={{ marginBottom: 14 }}>
                <label className="etiqueta">Sentido del Voto / Decisión del Comité *</label>
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  {(["APROBADO", "OBSERVADO", "RECHAZADO"] as const).map((dec) => (
                    <button
                      key={dec}
                      type="button"
                      onClick={() => setDecision(dec)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: `2px solid ${decision === dec ? (dec === "APROBADO" ? "#16a34a" : dec === "OBSERVADO" ? "#d97706" : "#dc2626") : "#cbd5e1"}`,
                        backgroundColor: decision === dec ? (dec === "APROBADO" ? "#dcfce7" : dec === "OBSERVADO" ? "#fef3c7" : "#fee2e2") : "#ffffff",
                        color: decision === dec ? (dec === "APROBADO" ? "#166534" : dec === "OBSERVADO" ? "#92400e" : "#991b1b") : "#475569",
                        fontWeight: decision === dec ? 700 : 500,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      {dec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="campo" style={{ marginBottom: 16 }}>
                <label className="etiqueta">Sustento Técnico del Dictamen *</label>
                <textarea
                  className="input-base"
                  rows={4}
                  placeholder="Fundamente las consideraciones de riesgo operacional, impacto en servicios y viabilidad del rollback..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="boton-mini" onClick={() => setRfcVotar(null)}>
                  Cancelar
                </button>
                <button type="submit" className="boton-primario" style={{ width: "auto" }} disabled={enviandoVoto}>
                  {enviandoVoto ? "Emitiendo dictamen..." : "Confirmar Dictamen CAB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
