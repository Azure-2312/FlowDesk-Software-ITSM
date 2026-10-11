"use client";

import React, { useState } from "react";

export interface ConfigReapertura {
  permitir_reapertura: boolean;
  ventana_dias_resuelto: number;
  ventana_dias_cerrado: number;
  perfiles_autorizados: number[];
  estado_destino_id?: number;
  motivo_obligatorio: boolean;
  max_reaperturas: number;
  reinicio_relojes: "reiniciar" | "continuar";
  estrategia_asignacion: "mantener" | "reasignar";
  motivos_catalogo: string[];
}

interface PestanaReaperturaProps {
  config: ConfigReapertura;
  estados: any[];
  perfiles: any[];
  puedeEditar: boolean;
  onActualizarConfig: (datos: Partial<ConfigReapertura>) => Promise<void>;
}

export const PestanaReapertura: React.FC<PestanaReaperturaProps> = ({
  config,
  estados,
  perfiles,
  puedeEditar,
  onActualizarConfig,
}) => {
  const [permitir, setPermitir] = useState(config.permitir_reapertura ?? true);
  const [diasResuelto, setDiasResuelto] = useState(config.ventana_dias_resuelto || 30);
  const [diasCerrado, setDiasCerrado] = useState(config.ventana_dias_cerrado || 15);
  const [perfilesSel, setPerfilesSel] = useState<number[]>(config.perfiles_autorizados || [1, 10, 4]);
  const [estadoDestino, setEstadoDestino] = useState<number | undefined>(config.estado_destino_id);
  const [motivoOblig, setMotivoOblig] = useState(config.motivo_obligatorio ?? true);
  const [maxReap, setMaxReap] = useState(config.max_reaperturas || 2);
  const [relojes, setRelojes] = useState<"reiniciar" | "continuar">(config.reinicio_relojes || "continuar");
  const [asignacion, setAsignacion] = useState<"mantener" | "reasignar">(config.estrategia_asignacion || "mantener");
  const [motivos, setMotivos] = useState<string[]>(
    config.motivos_catalogo || [
      "El incidente reaparece",
      "La solución no funcionó",
      "Cambio revertido",
      "Otro",
    ]
  );
  const [nuevoMotivo, setNuevoMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setMensajeExito("");

      await onActualizarConfig({
        permitir_reapertura: permitir,
        ventana_dias_resuelto: diasResuelto,
        ventana_dias_cerrado: diasCerrado,
        perfiles_autorizados: perfilesSel,
        estado_destino_id: estadoDestino,
        motivo_obligatorio: motivoOblig,
        max_reaperturas: maxReap,
        reinicio_relojes: relojes,
        estrategia_asignacion: asignacion,
        motivos_catalogo: motivos,
      });

      setMensajeExito("Parámetros de reapertura actualizados con éxito.");
    } catch (err: any) {
      alert(err.message || "Error al actualizar");
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarMotivo = () => {
    if (!nuevoMotivo.trim()) return;
    setMotivos([...motivos, nuevoMotivo.trim()]);
    setNuevoMotivo("");
  };

  return (
    <div className="space-y-6">
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <span>{mensajeExito}</span>
          <button type="button" onClick={() => setMensajeExito("")} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Barra de Encabezado */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Política de Reapertura de Problemas
          </h3>
          <p className="text-xs text-slate-500">
            Controla las condiciones, ventanas temporales y motivos bajo los cuales un problema cerrado puede reanudarse.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGuardar}
          disabled={guardando || !puedeEditar}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
        >
          {guardando ? "Guardando..." : "Guardar política"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 items-start text-xs">
        {/* Columna Izquierda: Parámetros y Ventanas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <span className="font-bold text-slate-800 uppercase tracking-wider block">
            Condiciones de Acceso
          </span>

          <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={permitir}
              onChange={(e) => setPermitir(e.target.checked)}
              disabled={!puedeEditar}
              className="rounded text-blue-600"
            />
            <div>
              <span className="font-bold text-slate-800 block">Permitir reapertura de tickets</span>
              <span className="text-[11px] text-slate-500">
                Si se desactiva, los problemas cerrados no podrán reactivarse bajo ningún motivo.
              </span>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ventana desde Resuelto (días):
              </label>
              <input
                type="number"
                min={1}
                value={diasResuelto}
                onChange={(e) => setDiasResuelto(parseInt(e.target.value, 10) || 1)}
                disabled={!puedeEditar}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ventana desde Cerrado (días):
              </label>
              <input
                type="number"
                min={1}
                value={diasCerrado}
                onChange={(e) => setDiasCerrado(parseInt(e.target.value, 10) || 1)}
                disabled={!puedeEditar}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Máximo de reaperturas permitidas:
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={maxReap}
                onChange={(e) => setMaxReap(parseInt(e.target.value, 10) || 1)}
                disabled={!puedeEditar}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Al superarse, se exige "Crear nuevo problema relacionado".
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Estado destino al reabrir:
              </label>
              <select
                value={estadoDestino || ""}
                onChange={(e) => setEstadoDestino(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                disabled={!puedeEditar}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white"
              >
                <option value="">En análisis (Por defecto)</option>
                {estados
                  .filter((e) => e.tipo === "en_curso")
                  .map((e) => (
                    <option key={e.id_estado} value={e.id_estado}>
                      {e.nombre}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Comportamiento de Relojes OLA:
            </label>
            <select
              value={relojes}
              onChange={(e) => setRelojes(e.target.value as any)}
              disabled={!puedeEditar}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white"
            >
              <option value="continuar">Continuar donde quedaron acumulados</option>
              <option value="reiniciar">Reiniciar contadores a cero</option>
            </select>
          </div>
        </div>

        {/* Columna Derecha: Catálogo de Motivos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <span className="font-bold text-slate-800 uppercase tracking-wider block">
            Catálogo de Motivos de Reapertura
          </span>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={motivoOblig}
              onChange={(e) => setMotivoOblig(e.target.checked)}
              disabled={!puedeEditar}
              className="rounded text-blue-600"
            />
            <span className="font-semibold text-slate-800">
              Exigir justificación obligatoria al reabrir
            </span>
          </label>

          <div className="space-y-2">
            <label className="block text-slate-600 font-medium">Motivos disponibles:</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {motivos.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between"
                >
                  <span className="text-slate-800">{m}</span>
                  {puedeEditar && (
                    <button
                      type="button"
                      onClick={() => setMotivos(motivos.filter((_, i) => i !== idx))}
                      className="text-rose-600 hover:text-rose-800 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {puedeEditar && (
              <div className="flex space-x-2 pt-2">
                <input
                  type="text"
                  value={nuevoMotivo}
                  onChange={(e) => setNuevoMotivo(e.target.value)}
                  placeholder="Agregar nuevo motivo..."
                  className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAgregarMotivo}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold border border-blue-200 rounded hover:bg-blue-100"
                >
                  + Agregar
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 space-y-1 text-[11px]">
            <div>• La etiqueta 'Reabierto' se estampa automáticamente y no puede removerse.</div>
            <div>• Todo evento de reapertura queda registrado en la bitácora inmutable.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
