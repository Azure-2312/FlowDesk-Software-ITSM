"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Ticket, SesionUsuario, Problema, ErrorConocido } from "@/types";
import PresentadorProblemaGestor from "@/modules/tickets/presentadores/PresentadorProblemaGestor";

type ProblemaDetalle = Problema & { errores_conocidos?: ErrorConocido[] };

export default function VistaProblemaDetalle() {
  const params = useParams();
  const router = useRouter();
  const idProblema = params?.id as string;

  const [problema, setProblema] = useState<ProblemaDetalle | null>(null);
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const [resProblema, resMenu] = await Promise.all([
        fetch(`/api/problemas/${idProblema}`, { cache: "no-store" }),
        fetch("/api/menu").then((r) => r.json()).catch(() => null),
      ]);

      const dataProblema = await resProblema.json();
      if (!resProblema.ok) {
        setError(dataProblema.error || "No se pudo cargar el expediente del problema.");
        return;
      }

      setProblema(dataProblema as ProblemaDetalle);
      if (resMenu?.sesion) setSesion(resMenu.sesion);
    } catch {
      setError("Error de conexión al cargar el expediente del problema.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (idProblema) void cargar();
  }, [idProblema]);

  if (cargando) {
    return (
      <div className="vista-contenedor" style={{ padding: 48, textAlign: "center", color: "#be185d", fontWeight: 600 }}>
        Cargando expediente del problema...
      </div>
    );
  }

  if (error || !problema) {
    return (
      <div className="vista-contenedor" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: 20, color: "#991b1b", maxWidth: 520, margin: "0 auto" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Error al abrir el problema</h3>
          <p style={{ margin: "0 0 16px 0", fontSize: 13 }}>{error || "El problema solicitado no existe."}</p>
          <Link href="/problemas" className="boton-primario" style={{ fontSize: 12, textDecoration: "none" }}>
            Volver a Gestión de problemas
          </Link>
        </div>
      </div>
    );
  }

  // Adaptador de Problema -> Ticket para reutilizar el presentador del Gestor de Problemas.
  const problemaComoTicket = {
    id_ticket: problema.id_problema,
    codigo_ticket: problema.codigo_problema,
    titulo: problema.titulo,
    descripcion: problema.descripcion,
    id_ci: problema.id_ci_afectado ?? null,
    ci_codigo: problema.ci_codigo ?? null,
    ci_nombre: problema.ci_nombre ?? null,
    problema_codigo: problema.codigo_problema,
    problema_titulo: problema.titulo,
    categoria_resolucion: problema.causa_raiz ?? null,
    canal_comunicacion: "PORTAL_WEB",
    campos_adicionales: {
      estado: problema.estado_nombre,
      metodo_analisis: problema.metodo_analisis,
      causa_raiz: problema.causa_raiz,
      workaround: problema.workaround,
      solucion_definitiva: problema.solucion_definitiva,
      es_error_conocido: problema.es_error_conocido,
      tecnico_asignado: problema.tecnico_asignado_nombre,
      departamento: problema.departamento_nombre,
    },
  } as unknown as Ticket;

  const incidentes = problema.incidentes_asociados || [];
  const erroresConocidos = problema.errores_conocidos || [];

  return (
    <div className="vista-contenedor" style={{ paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", marginBottom: 12 }}>
        <Link href="/problemas" style={{ color: "#64748b", textDecoration: "none" }}>Gestión de problemas</Link>
        <span>›</span>
        <span style={{ color: "#0f172a", fontWeight: 700, fontFamily: "monospace" }}>{problema.codigo_problema}</span>
      </div>

      {/* Cabecera del expediente */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          padding: "16px 22px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: "#be185d" }}>
              {problema.codigo_problema}
            </span>
            <span
              className="badge-itil"
              style={{ backgroundColor: "#fce7f3", color: "#9d174d", border: "1px solid #f472b6", fontWeight: 700, fontSize: 11 }}
            >
              {problema.estado_nombre || "Registrado"}
            </span>
            {problema.es_error_conocido && (
              <span
                className="badge-itil"
                style={{ backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", fontWeight: 700, fontSize: 11 }}
              >
                Error conocido (KEDB)
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", margin: "8px 0 4px 0" }}>{problema.titulo}</h1>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Registrado: {problema.fecha_creacion ? new Date(problema.fecha_creacion).toLocaleString() : "—"}
          </div>
        </div>

        <button type="button" className="boton-secundario" style={{ width: "auto" }} onClick={() => router.push("/problemas")}>
          Volver al listado
        </button>
      </div>

      {/* Detalle reutilizando el presentador del Gestor de Problemas */}
      <PresentadorProblemaGestor
        ticket={problemaComoTicket}
        comentarios={[]}
        catalogos={null}
        sesion={sesion ?? ({ perfilActivo: { id_perfil: 10, nombre: "Gestor de Problemas" } } as SesionUsuario)}
        onEjecutarAccion={async () => {}}
        onEnviarComentario={async () => {}}
        ejecutandoAccion={false}
        enviandoComentario={false}
        onCerrarModal={() => router.push("/problemas")}
        onActualizado={() => void cargar()}
      />

      {/* Incidentes vinculados al problema */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginTop: 16 }}>
        <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 8 }}>
          Incidentes Vinculados ({incidentes.length})
        </strong>
        {incidentes.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
            No hay incidentes asociados a este problema.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {incidentes.map((inc) => (
              <div key={inc.id_ticket} style={{ backgroundColor: "#f8fafc", padding: 8, borderRadius: 6, fontSize: 12 }}>
                <strong style={{ fontFamily: "monospace", color: "#2563eb" }}>{inc.codigo_ticket}</strong> · {inc.titulo}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Errores conocidos publicados */}
      {erroresConocidos.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginTop: 16 }}>
          <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 8 }}>
            Registros KEDB ({erroresConocidos.length})
          </strong>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {erroresConocidos.map((kedb) => (
              <div key={kedb.id_error_conocido} style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: 8, borderRadius: 6, fontSize: 11.5 }}>
                <strong style={{ color: "#065f46" }}>{kedb.codigo_kedb} · {kedb.titulo}</strong>
                <p style={{ margin: "4px 0 0 0", color: "#334155" }}>
                  <strong>Workaround:</strong> {kedb.workaround}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
