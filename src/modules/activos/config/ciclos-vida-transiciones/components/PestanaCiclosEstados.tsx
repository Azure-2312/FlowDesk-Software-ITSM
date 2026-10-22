"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Edit2, Ban, Play, Check, X } from "@/shared/components/ui/Iconos";

export type TipoEstadoActivo =
  | "planificado"
  | "disponible"
  | "en_uso"
  | "en_mantenimiento"
  | "inactivo"
  | "final";

export type PermiteEdicion = "si" | "solo_tecnico" | "no";

export interface EstadoCiclo {
  id: string;
  codigo: string;
  nombre: string;
  tipo_estado: TipoEstadoActivo;
  color: string;
  es_inicial: boolean;
  es_inicial_alterno?: boolean;
  cuenta_inventario: boolean;
  asignable: boolean;
  ci_activo: boolean;
  permite_incidentes: boolean;
  permite_rfc: boolean;
  requiere_ubicacion: boolean;
  requiere_custodio: boolean;
  permite_edicion: PermiteEdicion;
  sistema: boolean;
  activo: boolean;
  orden: number;
}

export interface CicloVida {
  id: string;
  nombre: string;
  descripcion: string;
  aplica_a: string[];
  activo: boolean;
  estados: EstadoCiclo[];
}

export interface CiclosEstadosData {
  ciclos?: CicloVida[];
}

interface Props {
  datos: CiclosEstadosData;
  onChange: (nuevosDatos: CiclosEstadosData) => void;
  bloqueado: boolean;
}

export function PestanaCiclosEstados({ datos, onChange, bloqueado }: Props) {
  const ciclos: CicloVida[] = datos?.ciclos || [];
  const [cicloSeleccionadoId, setCicloSeleccionadoId] = useState<string>(ciclos[0]?.id || "ciclo_hardware");
  const [modalEstado, setModalEstado] = useState<{ abierto: boolean; estado?: EstadoCiclo; esNuevo: boolean }>({
    abierto: false,
    esNuevo: true
  });
  const [formEstado, setFormEstado] = useState<Partial<EstadoCiclo>>({});
  const [modalCiclo, setModalCiclo] = useState<{ abierto: boolean; ciclo?: CicloVida; esNuevo: boolean }>({
    abierto: false,
    esNuevo: true
  });
  const [formCiclo, setFormCiclo] = useState<Partial<CicloVida>>({});
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const cicloActivo = ciclos.find((c) => c.id === cicloSeleccionadoId) || ciclos[0];
  const estados: EstadoCiclo[] = cicloActivo?.estados || [];

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  // Reordenar estados
  const moverEstado = (idx: number, direccion: "arriba" | "abajo") => {
    if (bloqueado || !cicloActivo) return;
    const targetIdx = direccion === "arriba" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= estados.length) return;

    const copiaEstados = [...estados];
    const temp = copiaEstados[idx];
    copiaEstados[idx] = copiaEstados[targetIdx];
    copiaEstados[targetIdx] = temp;

    const reordenados = copiaEstados.map((est, i) => ({ ...est, orden: i + 1 }));
    const ciclosActualizados = ciclos.map((c) =>
      c.id === cicloActivo.id ? { ...c, estados: reordenados } : c
    );
    onChange({ ...datos, ciclos: ciclosActualizados });
  };

  // Toggle activo
  const toggleEstadoActivo = (estadoId: string) => {
    if (bloqueado || !cicloActivo) return;
    const est = estados.find((e) => e.id === estadoId);
    if (est?.sistema) {
      mostrarToast("Los estados esenciales del sistema no pueden desactivarse.");
      return;
    }
    const nuevosEstados = estados.map((e) => (e.id === estadoId ? { ...e, activo: !e.activo } : e));
    const ciclosActualizados = ciclos.map((c) =>
      c.id === cicloActivo.id ? { ...c, estados: nuevosEstados } : c
    );
    onChange({ ...datos, ciclos: ciclosActualizados });
  };

  // Guardar estado
  const guardarEstado = () => {
    if (bloqueado || !cicloActivo || !formEstado.nombre || !formEstado.codigo) return;

    let nuevosEstados: EstadoCiclo[];
    if (modalEstado.esNuevo) {
      const nuevo: EstadoCiclo = {
        id: (formEstado.codigo || `est_${Date.now()}`).toLowerCase(),
        codigo: formEstado.codigo.toUpperCase(),
        nombre: formEstado.nombre,
        tipo_estado: formEstado.tipo_estado || "planificado",
        color: formEstado.color || "#64748b",
        es_inicial: !!formEstado.es_inicial,
        es_inicial_alterno: !!formEstado.es_inicial_alterno,
        cuenta_inventario: !!formEstado.cuenta_inventario,
        asignable: !!formEstado.asignable,
        ci_activo: !!formEstado.ci_activo,
        permite_incidentes: !!formEstado.permite_incidentes,
        permite_rfc: !!formEstado.permite_rfc,
        requiere_ubicacion: !!formEstado.requiere_ubicacion,
        requiere_custodio: !!formEstado.requiere_custodio,
        permite_edicion: formEstado.permite_edicion || "si",
        sistema: false,
        activo: true,
        orden: estados.length + 1
      };
      // Si se marca como inicial, desmarcar otros
      if (nuevo.es_inicial) {
        nuevosEstados = estados.map((e) => ({ ...e, es_inicial: false })).concat(nuevo);
      } else {
        nuevosEstados = [...estados, nuevo];
      }
    } else {
      nuevosEstados = estados.map((e) => {
        if (e.id === formEstado.id) {
          return { ...e, ...formEstado } as EstadoCiclo;
        }
        if (formEstado.es_inicial) {
          return { ...e, es_inicial: false };
        }
        return e;
      });
    }

    const ciclosActualizados = ciclos.map((c) =>
      c.id === cicloActivo.id ? { ...c, estados: nuevosEstados } : c
    );
    onChange({ ...datos, ciclos: ciclosActualizados });
    setModalEstado({ abierto: false, esNuevo: true });
    mostrarToast("Estado guardado en el borrador.");
  };

  // Guardar ciclo
  const guardarCiclo = () => {
    if (bloqueado || !formCiclo.nombre) return;
    let nuevosCiclos: CicloVida[];
    if (modalCiclo.esNuevo) {
      const nuevo: CicloVida = {
        id: `ciclo_${Date.now()}`,
        nombre: formCiclo.nombre,
        descripcion: formCiclo.descripcion || "",
        aplica_a: formCiclo.aplica_a || [],
        activo: true,
        estados: [
          {
            id: `planificado_${Date.now()}`,
            codigo: "PLANIFICADO",
            nombre: "Planificado",
            tipo_estado: "planificado",
            color: "#64748b",
            es_inicial: true,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: true,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 1
          },
          {
            id: `activo_${Date.now()}`,
            codigo: "ACTIVO",
            nombre: "Activo en uso",
            tipo_estado: "en_uso",
            color: "#10b981",
            es_inicial: false,
            cuenta_inventario: true,
            asignable: true,
            ci_activo: true,
            permite_incidentes: true,
            permite_rfc: true,
            requiere_ubicacion: true,
            requiere_custodio: false,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 2
          },
          {
            id: `final_${Date.now()}`,
            codigo: "FINALIZADO",
            nombre: "Retirado / Final",
            tipo_estado: "final",
            color: "#1e293b",
            es_inicial: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: false,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "no",
            sistema: true,
            activo: true,
            orden: 3
          }
        ]
      };
      nuevosCiclos = [...ciclos, nuevo];
      setCicloSeleccionadoId(nuevo.id);
    } else {
      nuevosCiclos = ciclos.map((c) => (c.id === formCiclo.id ? { ...c, ...formCiclo } : c));
    }
    onChange({ ...datos, ciclos: nuevosCiclos });
    setModalCiclo({ abierto: false, esNuevo: true });
    mostrarToast("Ciclo de vida actualizado en el borrador.");
  };

  const getBadgeTipo = (tipo: TipoEstadoActivo) => {
    switch (tipo) {
      case "planificado":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">Planificado</span>;
      case "disponible":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Disponible</span>;
      case "en_uso":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">En uso</span>;
      case "en_mantenimiento":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">En mantenimiento</span>;
      case "inactivo":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">Inactivo</span>;
      case "final":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-white">Final</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast informativo */}
      {toastMensaje && (
        <div className="fixed bottom-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium border border-slate-700">
          {toastMensaje}
        </div>
      )}

      {/* Encabezado */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            1.5.2.1 Ciclos de vida y estados de activos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gobierna los estados autorizados por ciclo, flags de inventario físico, vinculación con incidentes y CMDB.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormCiclo({ aplica_a: [] });
              setModalCiclo({ abierto: true, esNuevo: true });
            }}
            disabled={bloqueado}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors disabled:opacity-50"
          >
            + Nuevo ciclo
          </button>
          <button
            onClick={() => {
              setFormEstado({
                tipo_estado: "planificado",
                color: "#64748b",
                permite_edicion: "si",
                cuenta_inventario: true,
                activo: true
              });
              setModalEstado({ abierto: true, esNuevo: true });
            }}
            disabled={bloqueado}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
          >
            + Nuevo estado
          </button>
        </div>
      </div>

      {/* Layout de 2 columnas: Ciclos a la izquierda, Estados a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Columna 1: Lista de ciclos de vida */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Ciclos de vida activos ({ciclos.length})
            </h4>
            <div className="space-y-2">
              {ciclos.map((c) => {
                const seleccionado = c.id === cicloActivo?.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCicloSeleccionadoId(c.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                      seleccionado
                        ? "bg-indigo-50 border-indigo-300 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${seleccionado ? "text-indigo-900" : "text-slate-800"}`}>
                        {c.nombre}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                        {c.estados?.length || 0} est.
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{c.descripcion}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.aplica_a?.map((ap, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600">
                          {ap}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna 2: Tabla de estados del ciclo seleccionado */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Estados del ciclo: {cicloActivo?.nombre}
                </h4>
                <p className="text-xs text-slate-500">
                  {cicloActivo?.descripcion}
                </p>
              </div>
              <button
                onClick={() => {
                  setFormCiclo({ ...cicloActivo });
                  setModalCiclo({ abierto: true, ciclo: cicloActivo, esNuevo: false });
                }}
                disabled={bloqueado}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Editar propiedades del ciclo
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-16">Orden</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Tipo de estado</th>
                    <th className="py-2.5 px-3 text-center">Inicial</th>
                    <th className="py-2.5 px-3 text-center">Inventario</th>
                    <th className="py-2.5 px-3 text-center">Asignable</th>
                    <th className="py-2.5 px-3 text-center">CI Activo</th>
                    <th className="py-2.5 px-3 text-center">Incidentes</th>
                    <th className="py-2.5 px-3 text-center">RFC</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {estados.map((item, idx) => (
                    <tr key={item.id} className={`hover:bg-slate-50 ${!item.activo ? "opacity-50" : ""}`}>
                      <td className="py-2.5 px-3 font-mono text-slate-500 flex items-center gap-1">
                        <span>{item.orden}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            onClick={() => moverEstado(idx, "arriba")}
                            disabled={idx === 0 || bloqueado}
                            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moverEstado(idx, "abajo")}
                            disabled={idx === estados.length - 1 || bloqueado}
                            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-slate-300"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block">{item.nombre}</span>
                            <span className="font-mono text-[10px] text-slate-500">{item.codigo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{getBadgeTipo(item.tipo_estado)}</td>
                      <td className="py-2.5 px-3 text-center">
                        {item.es_inicial ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Inicial
                          </span>
                        ) : item.es_inicial_alterno ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                            Ingreso directo
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.cuenta_inventario ? <span className="text-emerald-600 inline-flex items-center"><Check size={12} /></span> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.asignable ? <span className="text-indigo-600 inline-flex items-center"><Check size={12} /></span> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.ci_activo ? <span className="text-blue-600 inline-flex items-center"><Check size={12} /></span> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.permite_incidentes ? <span className="text-emerald-600 inline-flex items-center"><Check size={12} /></span> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.permite_rfc ? <span className="text-purple-600 inline-flex items-center"><Check size={12} /></span> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setFormEstado({ ...item });
                            setModalEstado({ abierto: true, estado: item, esNuevo: false });
                          }}
                          disabled={bloqueado}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Editar
                        </button>
                        {!item.sistema && (
                          <button
                            onClick={() => toggleEstadoActivo(item.id)}
                            disabled={bloqueado}
                            className="text-slate-600 hover:text-slate-800"
                          >
                            {item.activo ? "Desactivar" : "Activar"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Agregar/Editar Estado */}
      {modalEstado.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                {modalEstado.esNuevo ? "Nuevo estado del ciclo" : `Editar estado: ${formEstado.nombre}`}
              </h3>
              <BotonIcono variante="normal" icono={<X size={14} />} titulo="Cerrar modal" ariaLabel="Cerrar modal" onClick={() => setModalEstado({ abierto: false, esNuevo: true })} />
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del estado</label>
                  <input
                    type="text"
                    value={formEstado.nombre || ""}
                    onChange={(e) => setFormEstado({ ...formEstado, nombre: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                    placeholder="EJ: En evaluación"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código (inmutable)</label>
                  <input
                    type="text"
                    disabled={!modalEstado.esNuevo}
                    value={formEstado.codigo || ""}
                    onChange={(e) => setFormEstado({ ...formEstado, codigo: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                    placeholder="EJ: EN_EVALUACION"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de estado ITIL</label>
                  <select
                    value={formEstado.tipo_estado || "planificado"}
                    onChange={(e) => setFormEstado({ ...formEstado, tipo_estado: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="planificado">Planificado</option>
                    <option value="disponible">Disponible</option>
                    <option value="en_uso">En uso</option>
                    <option value="en_mantenimiento">En mantenimiento</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="final">Final (Terminal)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Color distintivo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formEstado.color || "#64748b"}
                      onChange={(e) => setFormEstado({ ...formEstado, color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formEstado.color || "#64748b"}
                      onChange={(e) => setFormEstado({ ...formEstado, color: e.target.value })}
                      className="w-28 px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formEstado.es_inicial}
                    onChange={(e) => setFormEstado({ ...formEstado, es_inicial: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Estado inicial único del ciclo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formEstado.cuenta_inventario}
                    onChange={(e) => setFormEstado({ ...formEstado, cuenta_inventario: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Cuenta como existencia en inventario activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formEstado.asignable}
                    onChange={(e) => setFormEstado({ ...formEstado, asignable: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Asignable (Permite ejecutar la acción Asignar)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formEstado.ci_activo}
                    onChange={(e) => setFormEstado({ ...formEstado, ci_activo: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Cuenta como CI activo en topología CMDB</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formEstado.permite_incidentes}
                    onChange={(e) => setFormEstado({ ...formEstado, permite_incidentes: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Permite registrar incidentes sobre este activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formEstado.permite_rfc}
                    onChange={(e) => setFormEstado({ ...formEstado, permite_rfc: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Permite incluir este activo en solicitudes de Cambio (RFC)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formEstado.requiere_ubicacion}
                    onChange={(e) => setFormEstado({ ...formEstado, requiere_ubicacion: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Exige ubicación física asignada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formEstado.requiere_custodio}
                    onChange={(e) => setFormEstado({ ...formEstado, requiere_custodio: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Exige custodio responsable vigente</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block font-semibold text-slate-700 mb-1">Permisos de edición de atributos</label>
                <select
                  value={formEstado.permite_edicion || "si"}
                  onChange={(e) => setFormEstado({ ...formEstado, permite_edicion: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="si">Edición completa permitida</option>
                  <option value="solo_tecnico">Solo atributos técnicos modificables</option>
                  <option value="no">Solo lectura (Bloqueo de edición)</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setModalEstado({ abierto: false, esNuevo: true })}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEstado}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
              >
                Guardar estado en borrador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear / Editar Ciclo */}
      {modalCiclo.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                {modalCiclo.esNuevo ? "Nuevo ciclo de vida" : "Editar ciclo de vida"}
              </h3>
              <BotonIcono variante="normal" icono={<X size={14} />} titulo="Cerrar modal" ariaLabel="Cerrar modal" onClick={() => setModalCiclo({ abierto: false, esNuevo: true })} />
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del ciclo</label>
                <input
                  type="text"
                  value={formCiclo.nombre || ""}
                  onChange={(e) => setFormCiclo({ ...formCiclo, nombre: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                  placeholder="EJ: Dispositivos Móviles Corporativos"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formCiclo.descripcion || ""}
                  onChange={(e) => setFormCiclo({ ...formCiclo, descripcion: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  placeholder="Alcance y tipos de activos sujetos a este ciclo..."
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setModalCiclo({ abierto: false, esNuevo: true })}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCiclo}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
              >
                Guardar ciclo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
