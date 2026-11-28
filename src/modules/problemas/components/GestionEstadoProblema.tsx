"use client";

// ============================================================================
// AVANCE DEL PROBLEMA: investigación → causa raíz → (error conocido) →
// resuelto → cerrado. Cada paso pide solo el dato que exige el servidor.
//   - Avanzar y resolver: Técnico, Supervisor y Gestor de Problemas (en su alcance).
//   - Cerrar: Gestor de Problemas. Si es mayor, lo cierra el Aprobador al
//     autorizar el riesgo residual (Problemas → Cierre de problemas mayores).
// ============================================================================

import { useState } from "react";
import { ACCIONES, CAPACIDADES } from "@/shared/lib/capacidades";
import { useCapacidad, usePuede } from "@/shared/components/layout/PermisosProvider";

interface Props {
  idProblema: number;
  idEstado: number;
  esMayor: boolean;
  cierreAutorizado: boolean;
  ultimaDevolucion: string | null;
  causaRaiz: string | null;
  workaround: string | null;
  solucionDefinitiva: string | null;
  onActualizado: () => void;
}

type Paso = { destino: number; etiqueta: string; campo?: "causa_raiz" | "workaround" | "solucion_definitiva"; ayuda?: string };

const PASOS: Record<number, Paso[]> = {
  1: [{ destino: 2, etiqueta: "Iniciar investigación" }],
  2: [{ destino: 3, etiqueta: "Registrar causa raíz", campo: "causa_raiz", ayuda: "Causa raíz identificada" }],
  3: [
    { destino: 4, etiqueta: "Publicar como error conocido", campo: "workaround", ayuda: "Workaround para la KEDB" },
    { destino: 5, etiqueta: "Marcar como resuelto", campo: "solucion_definitiva", ayuda: "Solución definitiva aplicada" },
  ],
  4: [{ destino: 5, etiqueta: "Marcar como resuelto", campo: "solucion_definitiva", ayuda: "Solución definitiva aplicada" }],
  5: [{ destino: 2, etiqueta: "Reabrir investigación" }],
};

const campoEstilo = { display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 } as const;

export default function GestionEstadoProblema(props: Props) {
  const puedeAvanzar = useCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  const puedeCerrar = usePuede(ACCIONES.PROBLEMA_CERRAR);
  const [paso, setPaso] = useState<Paso | null>(null);
  const [texto, setTexto] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  if (!puedeAvanzar && !puedeCerrar) return null;

  const pasos = puedeAvanzar ? PASOS[props.idEstado] ?? [] : [];
  const puedeCerrarAhora = puedeCerrar && props.idEstado === 5 && (!props.esMayor || props.cierreAutorizado);
  const esperaAprobador = props.idEstado === 5 && props.esMayor && !props.cierreAutorizado;

  function elegir(p: Paso) {
    setPaso(p);
    setError(null);
    setOk(null);
    const previo = p.campo === "causa_raiz" ? props.causaRaiz : p.campo === "workaround" ? props.workaround : p.campo === "solucion_definitiva" ? props.solucionDefinitiva : "";
    setTexto(previo ?? "");
  }

  async function enviar(destino: number, campo?: Paso["campo"]) {
    setProcesando(true);
    setError(null);
    setOk(null);
    const cuerpo: Record<string, unknown> = { id_estado: destino };
    if (campo) cuerpo[campo] = texto.trim();
    if (campo === "workaround") {
      cuerpo.es_error_conocido = true;
      cuerpo.publicar_en_kedb = true;
    }
    try {
      const res = await fetch(`/api/problemas/${props.idProblema}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setError(json.error ?? "No se pudo actualizar el problema.");
      else {
        setOk(destino === 6 ? "Problema cerrado." : "Problema actualizado.");
        setPaso(null);
        props.onActualizado();
      }
    } catch {
      setError("Error de conexión al actualizar el problema.");
    } finally {
      setProcesando(false);
    }
  }

  if (props.idEstado === 6) {
    return (
      <div className="tarjeta-formulario" style={{ margin: "16px 0 0" }}>
        <h2 style={{ marginTop: 0 }}>Avance del problema</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>El problema está cerrado.</p>
      </div>
    );
  }

  return (
    <div className="tarjeta-formulario" style={{ margin: "16px 0 0" }}>
      <h2 style={{ marginTop: 0 }}>Avance del problema</h2>
      {props.ultimaDevolucion && props.idEstado !== 5 && (
        <p style={{ fontSize: 12.5, color: "#b45309", marginTop: 0 }}>
          El Aprobador devolvió el cierre: {props.ultimaDevolucion}
        </p>
      )}
      {esperaAprobador && (
        <p style={{ fontSize: 12.5, color: "#1d4ed8", marginTop: 0 }}>
          Es un problema mayor: espera que el Aprobador autorice el cierre aceptando el riesgo residual.
        </p>
      )}
      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginTop: 0 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginTop: 0 }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {pasos.map((p) => (
          <button
            key={p.destino + p.etiqueta}
            className={paso?.destino === p.destino ? "boton-primario" : "boton-secundario"}
            disabled={procesando}
            onClick={() => (p.campo ? elegir(p) : enviar(p.destino))}
          >
            {p.etiqueta}
          </button>
        ))}
        {puedeCerrarAhora && (
          <button className="boton-primario" disabled={procesando} onClick={() => enviar(6)}>
            Cerrar problema
          </button>
        )}
        {pasos.length === 0 && !puedeCerrarAhora && !esperaAprobador && (
          <span style={{ fontSize: 12.5, color: "#6b7280" }}>No hay acciones disponibles para tu perfil en este estado.</span>
        )}
      </div>

      {paso?.campo && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            {paso.ayuda}
            <textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} style={campoEstilo} />
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="boton-primario" disabled={procesando || texto.trim().length < 10} onClick={() => enviar(paso.destino, paso.campo)}>
              Guardar
            </button>
            <button className="boton-secundario" disabled={procesando} onClick={() => setPaso(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
