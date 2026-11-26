"use client";

import React, { useState, useEffect } from "react";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

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

  useEffect(() => {
    onActualizarVista({
      cabecera: listaCabecera,
      pestanas: listaPestanas,
    });
  }, [listaCabecera, listaPestanas, onActualizarVista]);

  return (
    <div className="space-y-6">
      {/* Alerta de Éxito */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <span>{mensajeExito}</span>
          <button type="button" onClick={() => setMensajeExito("")} className="boton-icono">
            ×
          </button>
        </div>
      )}

      {/* Barra Superior */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Parametrización de la Vista del Ticket de Problema
          </h3>
          <p className="text-xs text-slate-500">
            Configure la distribución de la cabecera fija, las 12 pestañas funcionales, el panel de resumen y la barra de acciones.
          </p>
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
                  className="boton-secundario boton-sm" aria-pressed={el.visible}
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

        <TablaDobleScroll minWidth={750}>
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
                      className="boton-icono boton-sm"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoverPestana(idx, "abajo")}
                      disabled={idx === listaPestanas.length - 1 || !puedeEditar}
                      className="boton-icono boton-sm"
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
                      className="boton-secundario boton-sm" aria-pressed={p.visible}
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
                      className="boton-secundario boton-sm"
                    >
                      Configurar campos…
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaDobleScroll>
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
                <span className="text-emerald-700 font-bold">Activo</span>
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

      {/* Modal Información de Campos de Pestaña */}
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
                className="boton-secundario boton-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
