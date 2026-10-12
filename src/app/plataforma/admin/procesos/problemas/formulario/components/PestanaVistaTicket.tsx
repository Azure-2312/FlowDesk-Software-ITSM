"use client";

import React, { useState } from "react";

interface ElementoCabecera {
  id: string;
  nombre: string;
  fijo: boolean;
  visible: boolean;
  orden: number;
}

interface PestanaTicketConfig {
  id: string;
  nombre: string;
  visible: boolean;
  fijo: boolean;
  orden: number;
  visible_desde_estado?: string;
  editable_en_estados?: string[];
  perfiles_visibles?: number[];
}

interface PestanaVistaTicketProps {
  cabecera: ElementoCabecera[];
  pestanas: PestanaTicketConfig[];
  puedeEditar: boolean;
  onActualizarVista: (datos: {
    cabecera: ElementoCabecera[];
    pestanas: PestanaTicketConfig[];
  }) => Promise<void>;
}

export const PestanaVistaTicket: React.FC<PestanaVistaTicketProps> = ({
  cabecera,
  pestanas,
  puedeEditar,
  onActualizarVista,
}) => {
  const [listaCabecera, setListaCabecera] = useState<ElementoCabecera[]>(cabecera);
  const [listaPestanas, setListaPestanas] = useState<PestanaTicketConfig[]>(pestanas);
  const [modalCamposPestana, setModalCamposPestana] = useState<string | null>(null);
  const [modalSimuladorVista, setModalSimuladorVista] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const handleToggleVisiblePestana = (id: string) => {
    if (!puedeEditar) return;
    setListaPestanas((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          if (p.fijo) {
            alert(`La pestaña '${p.nombre}' es obligatoria para la trazabilidad y no puede ocultarse.`);
            return p;
          }
          return { ...p, visible: !p.visible };
        }
        return p;
      })
    );
  };

  const handleMoverPestana = (idx: number, direccion: "arriba" | "abajo") => {
    if (!puedeEditar) return;
    const targetIdx = direccion === "arriba" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= listaPestanas.length) return;
    const nuevas = [...listaPestanas];
    const temp = nuevas[idx];
    nuevas[idx] = nuevas[targetIdx];
    nuevas[targetIdx] = temp;
    setListaPestanas(nuevas);
  };

  const handleGuardarCambios = async () => {
    try {
      setGuardando(true);
      setMensajeExito("");
      await onActualizarVista({
        cabecera: listaCabecera,
        pestanas: listaPestanas,
      });
      setMensajeExito("Estructura visual del ticket de problema guardada en el borrador.");
    } catch (err: any) {
      alert(err.message || "Error al actualizar la vista del ticket");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta de Éxito */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <span>{mensajeExito}</span>
          <button type="button" onClick={() => setMensajeExito("")} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Barra Superior con Botón de Vista Previa */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Parametrización de la Vista del Ticket de Problema
          </h3>
          <p className="text-xs text-slate-500">
            Configure la distribución de la cabecera fija, las 12 pestañas funcionales, el panel de resumen y la barra de acciones.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setModalSimuladorVista(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
          >
            Vista previa con ejemplo
          </button>
          <button
            type="button"
            onClick={handleGuardarCambios}
            disabled={guardando || !puedeEditar}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* BLOQUE 1: Elementos de la Cabecera Fija (Sección 6.6) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Bloque 1 — Elementos de Cabecera Fija (Hasta 8 elementos)
          </span>
          <span className="text-[11px] text-slate-400">
            Los elementos Código PRB, Título, Estado y Prioridad son institucionales fijos.
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 text-xs">
          {listaCabecera.map((el, idx) => (
            <div
              key={el.id}
              className={`p-3 rounded-lg border flex items-center justify-between transition ${
                el.visible
                  ? "bg-slate-50 border-slate-200 text-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-400 line-through"
              }`}
            >
              <div>
                <span className="font-semibold block">{el.nombre}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {el.fijo ? "[Fijo Requerido]" : "Configurable"}
                </span>
              </div>

              {!el.fijo && puedeEditar && (
                <button
                  type="button"
                  onClick={() => {
                    const nuevas = [...listaCabecera];
                    nuevas[idx].visible = !nuevas[idx].visible;
                    setListaCabecera(nuevas);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    el.visible
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-slate-200 border-slate-300 text-slate-600"
                  }`}
                >
                  {el.visible ? "Visible" : "Oculto"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BLOQUE 2: Pestañas Funcionales (12 Pestañas de la Sección 5.4) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Bloque 2 — Gobernanza de las 12 Pestañas Funcionales
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Orden</th>
                <th className="py-2.5 px-3">Nombre de la Pestaña</th>
                <th className="py-2.5 px-3 text-center">Visible</th>
                <th className="py-2.5 px-3">Visible desde Estado</th>
                <th className="py-2.5 px-3">Editable en Estados</th>
                <th className="py-2.5 px-3 text-right">Campos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {listaPestanas.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 space-x-1 font-mono text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleMoverPestana(idx, "arriba")}
                      disabled={idx === 0 || !puedeEditar}
                      className="hover:text-slate-700 disabled:opacity-20"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoverPestana(idx, "abajo")}
                      disabled={idx === listaPestanas.length - 1 || !puedeEditar}
                      className="hover:text-slate-700 disabled:opacity-20"
                    >
                      ▼
                    </button>
                    <span className="ml-1">{idx + 1}</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {p.nombre}
                    {p.fijo && (
                      <span className="ml-2 text-[10px] font-normal text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Obligatoria
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleVisiblePestana(p.id)}
                      disabled={p.fijo || !puedeEditar}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.visible
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600 line-through"
                      }`}
                    >
                      {p.visible ? "Visible" : "Oculta"}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {p.id === "cierre" ? "Resuelto" : "Siempre"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {p.id === "cierre" ? "Resuelto, Cerrado" : "Estados no finales"}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setModalCamposPestana(p.nombre)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition"
                    >
                      Configurar campos…
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BLOQUE 3 Y 4: Panel Lateral y Barra de Acciones */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        {/* Panel Lateral */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider block">
            Bloque 3 — Elementos del Panel Lateral (Resumen)
          </span>
          <p className="text-[11px] text-slate-500">
            Datos clave exhibidos en la columna derecha de consulta rápida.
          </p>
          <div className="space-y-1.5 pt-1">
            {[
              "Solicitante / Registrado por",
              "Servicio afectado del catálogo",
              "Categoría y Subcategoría taxonómica",
              "Impacto y Urgencia OLA",
              "Origen y Nº de incidentes vinculados",
              "Nº de CI afectados y RFC asociada",
              "Próximo vencimiento de diagn./resol.",
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between"
              >
                <span>{item}</span>
                <span className="text-emerald-700 font-bold">✓ Activo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de Acciones */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider block">
            Bloque 4 — Barra de Acciones y Menú Extendido
          </span>
          <p className="text-[11px] text-slate-500">
            Botones de acción rápida en cabecera vs opciones bajo el menú [⋯].
          </p>
          <div className="space-y-1.5 pt-1">
            <div className="p-2 bg-blue-50/60 border border-blue-200 rounded">
              <span className="font-semibold text-blue-900 block">Acciones Rápidas Visibles:</span>
              <span className="text-[11px] text-slate-600">
                [Iniciar análisis] [Registrar causa raíz] [Publicar workaround] [Resolver]
              </span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-800 block">Menú Extendido [⋯]:</span>
              <span className="text-[11px] text-slate-600">
                Imprimir/PDF · Copiar enlace · Duplicar como nuevo · Desvincular incidentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Simulación de Campos de Pestaña */}
      {modalCamposPestana && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">
              Campos de la Pestaña: {modalCamposPestana}
            </h3>
            <p className="text-xs text-slate-500">
              Los campos de esta pestaña heredan las definiciones de visibilidad por rol y reglas de solo lectura en estados finales.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div>• Modo de edición en línea: habilitado con permiso 'problemas.editar'.</div>
              <div>• Campos con validación obligatoria al ejecutar transiciones de estado.</div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalCamposPestana(null)}
                className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Simulador Completo de Vista */}
      {modalSimuladorVista && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-5xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-bold text-slate-900">
                Simulador Visual del Ticket PRB-000042 (Sección 5 de la spec)
              </span>
              <button
                type="button"
                onClick={() => setModalSimuladorVista(false)}
                className="font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Cabecera Simulada */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                    PRB-000042
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    Caída recurrente del gateway de pagos
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    En análisis
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    P1 - Crítica
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Responsable: Carlos Mendoza · Grupo: Redes e Infraestructura · Abierto hace: 1 d 4 h
                </div>
              </div>

              {/* Medidores de objetivos */}
              <div className="flex space-x-3 text-xs">
                <div className="bg-white p-2 rounded border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Diagnóstico</span>
                  <span className="font-bold text-blue-700">18h restantes (45%)</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Resolución</span>
                  <span className="font-bold text-emerald-700">62h restantes (15%)</span>
                </div>
              </div>
            </div>

            {/* Pestañas Horizontales */}
            <div className="flex border-b border-slate-200 space-x-1 text-xs font-semibold overflow-x-auto pb-1">
              {listaPestanas
                .filter((p) => p.visible)
                .map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`px-3 py-1.5 rounded-t-lg transition ${
                      idx === 0
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {p.nombre}
                  </button>
                ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              Vista del ticket estructurada y conforme con las 12 secciones ITIL v4 de la especificación.
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setModalSimuladorVista(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-medium rounded-lg text-slate-700"
              >
                Cerrar Simulador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
