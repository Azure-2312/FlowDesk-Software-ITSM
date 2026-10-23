"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { ArrowUp, ArrowDown, Check, X } from "@/shared/components/ui/Iconos";

export interface ElementoCabecera {
  id: string;
  nombre: string;
  visible: boolean;
  orden: number;
  bloqueado?: boolean;
}

export interface PestanaFichaConfig {
  id: string;
  nombre: string;
  orden: number;
  visible: boolean;
  solo_lectura: boolean;
  visible_clases?: string[];
  visible_perfiles?: string[];
  bloqueado?: boolean;
}

export interface ElementoPanelLateral {
  id: string;
  nombre: string;
  visible: boolean;
  orden: number;
}

export interface FichaListadoData {
  cabecera_elementos?: ElementoCabecera[];
  pestanas_ficha?: PestanaFichaConfig[];
  elementos_panel_lateral?: ElementoPanelLateral[];
  columnas_listado_71?: string[];
  orden_defecto_campo?: string;
  orden_defecto_direccion?: "ASC" | "DESC";
  tamano_pagina_defecto?: number;
  vistas_guardadas_defecto?: string[];
  perfiles_crear_vistas_compartidas?: string[];
}

interface Props {
  datos: FichaListadoData;
  onChange: (nuevosDatos: FichaListadoData) => void;
  bloqueado: boolean;
}

const ELEMENTOS_CABECERA_DEFAULT: ElementoCabecera[] = [
  { id: "codigo", nombre: "Código de activo", visible: true, orden: 1, bloqueado: true },
  { id: "nombre", nombre: "Nombre / Hostname", visible: true, orden: 2, bloqueado: true },
  { id: "estado", nombre: "Insignia de estado de ciclo de vida", visible: true, orden: 3, bloqueado: true },
  { id: "clase_tipo", nombre: "Clase y tipo de activo", visible: true, orden: 4 },
  { id: "fabricante_modelo", nombre: "Fabricante y modelo", visible: true, orden: 5 },
  { id: "criticidad", nombre: "Criticidad institucional", visible: true, orden: 6 },
  { id: "entorno", nombre: "Entorno operativo", visible: true, orden: 7 },
  { id: "custodio", nombre: "Custodio responsable", visible: true, orden: 8 },
  { id: "ubicacion", nombre: "Ubicación física", visible: true, orden: 9 },
  { id: "garantia", nombre: "Indicador de garantía", visible: true, orden: 10 }
];

const PESTANAS_FICHA_DEFAULT: PestanaFichaConfig[] = [
  { id: "general", nombre: "General", orden: 1, visible: true, solo_lectura: false, bloqueado: true },
  { id: "atributos_tecnicos", nombre: "Atributos técnicos", orden: 2, visible: true, solo_lectura: false },
  { id: "asignacion_ubicacion", nombre: "Asignación y ubicación", orden: 3, visible: true, solo_lectura: false },
  { id: "cmdb_relaciones", nombre: "CMDB y relaciones", orden: 4, visible: true, solo_lectura: false },
  { id: "tickets_asociados", nombre: "Tickets asociados", orden: 5, visible: true, solo_lectura: true },
  { id: "mantenimiento_garantia", nombre: "Mantenimiento y garantía", orden: 6, visible: true, solo_lectura: false },
  { id: "software_licencias", nombre: "Software y licencias", orden: 7, visible: true, solo_lectura: false },
  { id: "documentos", nombre: "Documentos", orden: 8, visible: true, solo_lectura: false },
  { id: "verificacion_inventario", nombre: "Verificación e inventario", orden: 9, visible: true, solo_lectura: true },
  { id: "comentarios_bitacora", nombre: "Comentarios y bitácora", orden: 10, visible: true, solo_lectura: false },
  { id: "historial_auditoria", nombre: "Historial / auditoría", orden: 11, visible: true, solo_lectura: true, bloqueado: true }
];

const PANEL_LATERAL_DEFAULT: ElementoPanelLateral[] = [
  { id: "estado_tiempo", nombre: "Estado y tiempo en el estado actual", visible: true, orden: 1 },
  { id: "custodio_tiempo", nombre: "Custodio y desde cuándo", visible: true, orden: 2 },
  { id: "servicios_soporte", nombre: "Servicios que soporta", visible: true, orden: 3 },
  { id: "ci_dependientes", nombre: "Número de CI dependientes", visible: true, orden: 4 },
  { id: "tickets_abiertos", nombre: "Tickets abiertos (Incidentes, Problemas, RFC)", visible: true, orden: 5 },
  { id: "contrato_mantenimiento", nombre: "Contrato de mantenimiento vigente", visible: true, orden: 6 },
  { id: "licencias_asignadas", nombre: "Licencias de software asignadas", visible: true, orden: 7 },
  { id: "proximo_mantenimiento", nombre: "Próximo mantenimiento preventivo programado", visible: true, orden: 8 },
  { id: "proxima_verificacion", nombre: "Próxima verificación física estimada", visible: true, orden: 9 },
  { id: "alertas_activas", nombre: "Alertas activas y salud de datos", visible: true, orden: 10 }
];

const TODAS_COLUMNAS_71 = [
  { id: "codigo", label: "Código de activo" },
  { id: "nombre", label: "Nombre / Hostname" },
  { id: "tipo", label: "Tipo de activo" },
  { id: "marca_modelo", label: "Marca / Modelo" },
  { id: "estado", label: "Estado del ciclo" },
  { id: "custodio", label: "Custodio asignado" },
  { id: "ubicacion", label: "Ubicación" },
  { id: "garantia", label: "Garantía" },
  { id: "numero_serie", label: "Número de serie" },
  { id: "direccion_ip", label: "Dirección IP" },
  { id: "criticidad", label: "Criticidad CMDB" }
];

export function PestanaFichaListado({ datos, onChange, bloqueado }: Props) {
  const [subSeccion, setSubSeccion] = useState<"cabecera" | "pestanas" | "panel" | "listado">("cabecera");
  const [modalVistaPrevia, setModalVistaPrevia] = useState(false);

  const cabecera: ElementoCabecera[] = datos?.cabecera_elementos || ELEMENTOS_CABECERA_DEFAULT;
  const pestanas: PestanaFichaConfig[] = datos?.pestanas_ficha || PESTANAS_FICHA_DEFAULT;
  const panelLateral: ElementoPanelLateral[] = datos?.elementos_panel_lateral || PANEL_LATERAL_DEFAULT;
  const columnas71: string[] = datos?.columnas_listado_71 || [
    "codigo",
    "nombre",
    "tipo",
    "marca_modelo",
    "estado",
    "custodio",
    "ubicacion",
    "garantia"
  ];
  const ordenCampo = datos?.orden_defecto_campo || "codigo";
  const ordenDir = datos?.orden_defecto_direccion || "ASC";
  const tamanoPagina = datos?.tamano_pagina_defecto || 25;
  const vistasGuardadas = datos?.vistas_guardadas_defecto || [
    "Todos",
    "Mis activos",
    "En stock",
    "En reparación",
    "Garantía por vencer",
    "Sin custodio",
    "Pendientes de baja"
  ];

  // Reordenar cabecera
  const moverCabecera = (idx: number, direccion: "arriba" | "abajo") => {
    if (bloqueado) return;
    const target = direccion === "arriba" ? idx - 1 : idx + 1;
    if (target < 0 || target >= cabecera.length) return;
    const clone = [...cabecera];
    const temp = clone[idx];
    clone[idx] = clone[target];
    clone[target] = temp;
    const reordenado = clone.map((c, i) => ({ ...c, orden: i + 1 }));
    onChange({ ...datos, cabecera_elementos: reordenado });
  };

  const toggleCabeceraVisible = (id: string) => {
    if (bloqueado) return;
    const reordenado = cabecera.map((c) => (c.id === id && !c.bloqueado ? { ...c, visible: !c.visible } : c));
    onChange({ ...datos, cabecera_elementos: reordenado });
  };

  // Reordenar pestañas
  const moverPestana = (idx: number, direccion: "arriba" | "abajo") => {
    if (bloqueado) return;
    const target = direccion === "arriba" ? idx - 1 : idx + 1;
    if (target < 0 || target >= pestanas.length) return;
    const clone = [...pestanas];
    const temp = clone[idx];
    clone[idx] = clone[target];
    clone[target] = temp;
    const reordenado = clone.map((p, i) => ({ ...p, orden: i + 1 }));
    onChange({ ...datos, pestanas_ficha: reordenado });
  };

  const togglePestanaVisible = (id: string) => {
    if (bloqueado) return;
    const reordenado = pestanas.map((p) => (p.id === id && !p.bloqueado ? { ...p, visible: !p.visible } : p));
    onChange({ ...datos, pestanas_ficha: reordenado });
  };

  const cambiarNombrePestana = (id: string, nuevoNombre: string) => {
    if (bloqueado) return;
    const act = pestanas.map((p) => (p.id === id ? { ...p, nombre: nuevoNombre } : p));
    onChange({ ...datos, pestanas_ficha: act });
  };

  // Panel lateral
  const togglePanelLateral = (id: string) => {
    if (bloqueado) return;
    const act = panelLateral.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p));
    onChange({ ...datos, elementos_panel_lateral: act });
  };

  const moverPanelLateral = (idx: number, direccion: "arriba" | "abajo") => {
    if (bloqueado) return;
    const target = direccion === "arriba" ? idx - 1 : idx + 1;
    if (target < 0 || target >= panelLateral.length) return;
    const clone = [...panelLateral];
    const temp = clone[idx];
    clone[idx] = clone[target];
    clone[target] = temp;
    const reordenado = clone.map((p, i) => ({ ...p, orden: i + 1 }));
    onChange({ ...datos, elementos_panel_lateral: reordenado });
  };

  // Columnas listado 7.1
  const toggleColumna71 = (colId: string) => {
    if (bloqueado) return;
    let nuevasColumnas: string[];
    if (columnas71.includes(colId)) {
      if (columnas71.length <= 3) return; // Mínimo 3 columnas
      nuevasColumnas = columnas71.filter((c) => c !== colId);
    } else {
      nuevasColumnas = [...columnas71, colId];
    }
    onChange({ ...datos, columnas_listado_71: nuevasColumnas });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y selector de sección */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Configuración de ficha del activo y listado general
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Define la cabecera, pestañas de información, panel lateral y vistas de inventario presentadas al usuario.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalVistaPrevia(true)}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
            >
              Vista previa de la ficha
            </button>
          </div>
        </div>

        {/* Sub-navegación */}
        <div className="flex gap-2 border-b border-slate-200 mt-4 pb-2">
          {[
            { id: "cabecera", label: "Bloque 1: Cabecera fija (5.1)", badge: `${cabecera.filter((c) => c.visible).length}/10` },
            { id: "pestanas", label: "Bloque 2: Pestañas de la ficha (5.4)", badge: `${pestanas.filter((p) => p.visible).length}/11` },
            { id: "panel", label: "Bloque 3: Panel lateral (5.3)", badge: `${panelLateral.filter((p) => p.visible).length}/10` },
            { id: "listado", label: "Bloque 5: Listado de inventario 7.1", badge: `${columnas71.length} columnas` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubSeccion(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                subSeccion === tab.id
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  subSeccion === tab.id ? "bg-indigo-200 text-indigo-800" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. Cabecera fija */}
      {subSeccion === "cabecera" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Elementos de la cabecera fija de la ficha</h4>
              <p className="text-xs text-slate-500">
                Máximo 10 elementos. Los campos Código, Nombre y Estado son obligatorios y fijos por diseño.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Visibles: {cabecera.filter((c) => c.visible).length} de 10
            </span>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {cabecera.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 text-xs ${
                  item.visible ? "bg-white" : "bg-slate-50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <button
                      onClick={() => moverCabecera(idx, "arriba")}
                      disabled={idx === 0 || bloqueado}
                      className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                    >
                      <ArrowUp size={10} />
                    </button>
                    <button
                      onClick={() => moverCabecera(idx, "abajo")}
                      disabled={idx === cabecera.length - 1 || bloqueado}
                      className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                    >
                      <ArrowDown size={10} />
                    </button>
                  </div>
                  <span className="w-6 font-mono text-slate-400 font-bold">{item.orden}</span>
                  <span className="font-semibold text-slate-800">{item.nombre}</span>
                  {item.bloqueado && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                      Fijo (No ocultable)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.visible}
                      disabled={item.bloqueado || bloqueado}
                      onChange={() => toggleCabeceraVisible(item.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <span className="text-slate-600 font-medium">Visible en cabecera</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Pestañas de la ficha */}
      {subSeccion === "pestanas" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Pestañas de navegación interna de la ficha</h4>
              <p className="text-xs text-slate-500">
                Gobernanza de las 11 pestañas de la ficha de activo. "General" e "Historial/auditoría" son inmutables.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Activas: {pestanas.filter((p) => p.visible).length} de {pestanas.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2 px-3 w-16">Orden</th>
                  <th className="py-2 px-3">Nombre visible</th>
                  <th className="py-2 px-3">Identificador interno</th>
                  <th className="py-2 px-3">Modo</th>
                  <th className="py-2 px-3">Visible</th>
                  <th className="py-2 px-3">Gobernanza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pestanas.map((item, idx) => (
                  <tr key={item.id} className={`hover:bg-slate-50 ${!item.visible ? "opacity-50" : ""}`}>
                    <td className="py-2.5 px-3 font-mono text-slate-500 flex items-center gap-1">
                      <span>{item.orden}</span>
                      <div className="flex flex-col ml-1">
                        <button
                          onClick={() => moverPestana(idx, "arriba")}
                          disabled={idx === 0 || bloqueado}
                          className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                        >
                          <ArrowUp size={10} />
                        </button>
                        <button
                          onClick={() => moverPestana(idx, "abajo")}
                          disabled={idx === pestanas.length - 1 || bloqueado}
                          className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                        >
                          <ArrowDown size={10} />
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.nombre}
                        disabled={bloqueado}
                        onChange={(e) => cambiarNombrePestana(item.id, e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded font-semibold text-slate-800 text-xs w-56 focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.id}</td>
                    <td className="py-2.5 px-3">
                      {item.solo_lectura ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          Solo lectura
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Interactiva
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        disabled={item.bloqueado || bloqueado}
                        onChange={() => togglePestanaVisible(item.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      {item.bloqueado ? (
                        <span className="text-[10px] font-semibold text-slate-500">Obligatoria</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Configurable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Panel lateral */}
      {subSeccion === "panel" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Panel lateral de resumen del activo (5.3)</h4>
              <p className="text-xs text-slate-500">
                Widgets e indicadores contextuales mostrados al lado derecho de la ficha.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Activos: {panelLateral.filter((p) => p.visible).length} de {panelLateral.length}
            </span>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {panelLateral.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 text-xs ${
                  item.visible ? "bg-white" : "bg-slate-50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <button
                      onClick={() => moverPanelLateral(idx, "arriba")}
                      disabled={idx === 0 || bloqueado}
                      className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                    >
                      <ArrowUp size={10} />
                    </button>
                    <button
                      onClick={() => moverPanelLateral(idx, "abajo")}
                      disabled={idx === panelLateral.length - 1 || bloqueado}
                      className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                    >
                      <ArrowDown size={10} />
                    </button>
                  </div>
                  <span className="w-6 font-mono text-slate-400 font-bold">{item.orden}</span>
                  <span className="font-semibold text-slate-800">{item.nombre}</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    disabled={bloqueado}
                    onChange={() => togglePanelLateral(item.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-600 font-medium">Visible en panel lateral</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Listado de inventario 7.1 */}
      {subSeccion === "listado" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-5">
          <div className="pb-3 border-b border-slate-200">
            <h4 className="text-sm font-bold text-slate-800">Configuración de la grilla de inventario (7.1 HAM)</h4>
            <p className="text-xs text-slate-500">
              Personalización de columnas, ordenación inicial y vistas predeterminadas para los gestores.
            </p>
          </div>

          {/* Selector de columnas visibles */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Columnas visibles por defecto en la tabla de inventario:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TODAS_COLUMNAS_71.map((col) => {
                const activa = columnas71.includes(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => toggleColumna71(col.id)}
                    disabled={bloqueado}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left transition-colors ${
                      activa
                        ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{col.label}</span>
                    <span className="font-bold">{activa ? <Check size={12} /> : "+"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parámetros de orden y paginación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campo de orden inicial</label>
              <select
                value={ordenCampo}
                disabled={bloqueado}
                onChange={(e) => onChange({ ...datos, orden_defecto_campo: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="codigo">Código de activo</option>
                <option value="nombre">Nombre / Hostname</option>
                <option value="fecha_creacion">Fecha de creación</option>
                <option value="estado">Estado del ciclo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección de orden</label>
              <select
                value={ordenDir}
                disabled={bloqueado}
                onChange={(e) => onChange({ ...datos, orden_defecto_direccion: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="ASC">Ascendente (A-Z / 1-9)</option>
                <option value="DESC">Descendente (Z-A / 9-1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tamaño de página por defecto</label>
              <select
                value={tamanoPagina}
                disabled={bloqueado}
                onChange={(e) => onChange({ ...datos, tamano_pagina_defecto: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value={10}>10 filas por página</option>
                <option value={25}>25 filas por página</option>
                <option value={50}>50 filas por página</option>
                <option value={100}>100 filas por página</option>
              </select>
            </div>
          </div>

          {/* Vistas guardadas de fábrica */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Vistas guardadas de fábrica disponibles en 7.1:
            </label>
            <div className="flex flex-wrap gap-2">
              {vistasGuardadas.map((vista, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-medium text-slate-700"
                >
                  {vista}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de simulación de vista previa de ficha */}
      {modalVistaPrevia && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-50 rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto border border-slate-200">
            <div className="sticky top-0 bg-white px-5 py-3 border-b border-slate-200 flex justify-between items-center shadow-sm">
              <h3 className="text-sm font-bold text-slate-800">
                Vista previa de la ficha del activo (Simulación de layout)
              </h3>
              <BotonIcono variante="normal" icono={<X size={14} />} titulo="Cerrar vista previa" ariaLabel="Cerrar vista previa" onClick={() => setModalVistaPrevia(false)} />
            </div>

            <div className="p-5 space-y-4">
              {/* Cabecera simulada */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-indigo-700">LAP-2026-000101</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        En uso
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Criticidad: Alta
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-800 mt-1">
                      ThinkPad X1 Carbon Gen 11 — Hostname: LP-CORP-042
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 border border-slate-300">
                      Garantía: Vigente (18 meses)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Custodio:</span>
                    <span className="font-semibold text-slate-800">Carlos Mendoza (TI)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Ubicación:</span>
                    <span className="font-semibold text-slate-800">Sede Central / Piso 2 / Oficina 204</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Clase / Tipo:</span>
                    <span className="font-semibold text-slate-800">Hardware &gt; Computadoras portátiles</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Completitud:</span>
                    <span className="font-semibold text-emerald-600">92% de datos completos</span>
                  </div>
                </div>
              </div>

              {/* Pestañas simuladas */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 pt-2 gap-1">
                  {pestanas
                    .filter((p) => p.visible)
                    .map((p, idx) => (
                      <span
                        key={p.id}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-t border-t border-x ${
                          idx === 0
                            ? "bg-white border-slate-200 text-indigo-700"
                            : "bg-slate-100 border-transparent text-slate-600"
                        }`}
                      >
                        {p.nombre}
                      </span>
                    ))}
                </div>
                <div className="p-4 text-xs text-slate-600">
                  <p className="font-medium text-slate-700 mb-2">Contenido de la pestaña activa simulada:</p>
                  <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold block text-slate-700">Número de parte:</span>
                        <span>21HM0004LM</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-slate-700">Número de serie:</span>
                        <span>PF-48X92K</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-slate-700">Fecha de compra:</span>
                        <span>15/01/2026</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-slate-700">Proveedor:</span>
                        <span>Lenovo Perú S.A.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setModalVistaPrevia(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded"
              >
                Cerrar vista previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
