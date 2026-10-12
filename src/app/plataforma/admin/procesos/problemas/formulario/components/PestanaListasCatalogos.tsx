"use client";

import React, { useState } from "react";

interface CatalogoItem {
  id: number | string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden: number;
  activo: boolean;
  es_sistema?: boolean;
  usos_tickets?: number;
  [key: string]: any;
}

interface PestanaListasCatalogosProps {
  catalogos: {
    categorias: CatalogoItem[];
    origenes: CatalogoItem[];
    causas_raiz: CatalogoItem[];
    codigos_cierre: CatalogoItem[];
    metodos_analisis: CatalogoItem[];
    motivos_espera: CatalogoItem[];
    motivos_cancelacion: CatalogoItem[];
  };
  puedeEditar: boolean;
  onCrearItem: (catalogo: string, datos: any) => Promise<void>;
  onActualizarItem: (catalogo: string, id: number | string, datos: any) => Promise<void>;
  onEliminarItem: (catalogo: string, id: number | string) => Promise<void>;
  onFusionarItem: (catalogo: string, idOrigen: number | string, idDestino: number | string) => Promise<void>;
}

const CATALOGOS_DEF = [
  { id: "categorias", nombre: "Categorías de problema", desc: "Jerarquía de 2 niveles y asignación" },
  { id: "origenes", nombre: "Orígenes", desc: "Procedencia del problema e indicadores KPI" },
  { id: "causas_raiz", nombre: "Categorías de causa raíz", desc: "Taxonomía técnica de la falla de origen" },
  { id: "codigos_cierre", nombre: "Códigos de cierre", desc: "Condiciones de solución definitiva y éxito" },
  { id: "metodos_analisis", nombre: "Métodos de análisis", desc: "Metodologías (5 Porqués, Ishikawa, etc.)" },
  { id: "motivos_espera", nombre: "Motivos de espera", desc: "Causales de pausa en relojes de atención" },
  { id: "motivos_cancelacion", nombre: "Motivos de cancelación", desc: "Justificaciones de anulación del ticket" },
];

export const PestanaListasCatalogos: React.FC<PestanaListasCatalogosProps> = ({
  catalogos,
  puedeEditar,
  onCrearItem,
  onActualizarItem,
  onEliminarItem,
  onFusionarItem,
}) => {
  const [catalogoActivo, setCatalogoActivo] = useState("categorias");
  const [busqueda, setBusqueda] = useState("");
  const [modalEditar, setModalEditar] = useState(false);
  const [itemEnEdicion, setItemEnEdicion] = useState<CatalogoItem | null>(null);
  const [esNuevo, setEsNuevo] = useState(false);
  const [modalFusion, setModalFusion] = useState(false);
  const [origenFusion, setOrigenFusion] = useState<CatalogoItem | null>(null);
  const [destinoFusionId, setDestinoFusionId] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  // Estado del formulario de edición
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [atributosExtra, setAtributosExtra] = useState<Record<string, any>>({});

  const itemsActuales: CatalogoItem[] = (catalogos as any)[catalogoActivo] || [];

  const itemsFiltrados = itemsActuales.filter(
    (item) =>
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModalNuevo = (esSubcat = false) => {
    setEsNuevo(true);
    setItemEnEdicion(null);
    setNombre("");
    setCodigo("");
    setDescripcion("");
    setColor("#2563eb");
    setAtributosExtra(esSubcat ? { es_subcategoria: true } : {});
    setErrorLocal("");
    setModalEditar(true);
  };

  const abrirModalEditar = (item: CatalogoItem) => {
    setEsNuevo(false);
    setItemEnEdicion(item);
    setNombre(item.nombre);
    setCodigo(item.codigo);
    setDescripcion(item.descripcion || "");
    setColor(item.color || "#2563eb");
    setAtributosExtra({ ...item });
    setErrorLocal("");
    setModalEditar(true);
  };

  const handleGuardarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || (!itemEnEdicion && !codigo.trim())) {
      setErrorLocal("El nombre y código son obligatorios.");
      return;
    }

    try {
      setGuardando(true);
      setErrorLocal("");

      const datos = {
        nombre: nombre.trim(),
        codigo: codigo.trim().toLowerCase(),
        descripcion: descripcion.trim(),
        color,
        ...atributosExtra,
      };

      if (esNuevo) {
        await onCrearItem(catalogoActivo, datos);
      } else if (itemEnEdicion) {
        const idCampo = (itemEnEdicion as any).id_categoria || (itemEnEdicion as any).id_origen || (itemEnEdicion as any).id_causa_categoria || (itemEnEdicion as any).id_codigo_cierre || (itemEnEdicion as any).id_metodo || (itemEnEdicion as any).id_motivo_espera || (itemEnEdicion as any).id_motivo_cancelacion || itemEnEdicion.id;
        await onActualizarItem(catalogoActivo, idCampo, datos);
      }

      setModalEditar(false);
    } catch (err: any) {
      setErrorLocal(err.message || "Error al procesar el catálogo");
    } finally {
      setGuardando(false);
    }
  };

  const handleFusionarSubmit = async () => {
    if (!origenFusion || !destinoFusionId) return;
    try {
      setGuardando(true);
      setErrorLocal("");
      const idOrigen = (origenFusion as any).id_categoria || (origenFusion as any).id_origen || (origenFusion as any).id_causa_categoria || (origenFusion as any).id_codigo_cierre || (origenFusion as any).id_metodo || (origenFusion as any).id_motivo_espera || (origenFusion as any).id_motivo_cancelacion || origenFusion.id;
      await onFusionarItem(catalogoActivo, idOrigen, destinoFusionId);
      setModalFusion(false);
    } catch (err: any) {
      setErrorLocal(err.message || "Error al fusionar registros");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 items-start min-h-[550px]">
        {/* Panel Izquierdo: Lista de los 7 Catálogos */}
        <div className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs p-3 space-y-2">
          <div className="pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Catálogos ITIL v4
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">7 catálogos institucionales</p>
          </div>

          <div className="space-y-1">
            {CATALOGOS_DEF.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCatalogoActivo(cat.id);
                  setBusqueda("");
                }}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex flex-col ${
                  catalogoActivo === cat.id
                    ? "bg-blue-50/80 border-blue-400 font-bold text-blue-900 shadow-xs"
                    : "bg-white border-transparent hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>{cat.nombre}</span>
                <span className="text-[10px] font-normal text-slate-400 mt-0.5">{cat.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Tabla y Acciones del Catálogo Seleccionado */}
        <div className="col-span-9 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
          {/* Barra de Herramientas */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {CATALOGOS_DEF.find((c) => c.id === catalogoActivo)?.nombre}
              </h3>
              <p className="text-xs text-slate-500">
                Administre valores, colores, reglas de negocio y políticas de cierre.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Buscar valor o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 w-48 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {catalogoActivo === "categorias" ? (
                <>
                  <button
                    type="button"
                    onClick={() => abrirModalNuevo(false)}
                    disabled={!puedeEditar}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                  >
                    + Nueva categoría
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirModalNuevo(true)}
                    disabled={!puedeEditar}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                  >
                    + Subcategoría
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => abrirModalNuevo(false)}
                  disabled={!puedeEditar}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                >
                  + Nuevo valor
                </button>
              )}

              {/* Botón Exportar CSV */}
              <button
                type="button"
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    ["codigo,nombre,orden,activo,usos_tickets"]
                      .concat(
                        itemsActuales.map(
                          (i) => `${i.codigo},"${i.nombre}",${i.orden},${i.activo},${i.usos_tickets || 0}`
                        )
                      )
                      .join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `catalogo_${catalogoActivo}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
              >
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Tabla de Registros */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Orden</th>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3">Atributos Clave</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-center">Usos</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {itemsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                      No hay elementos registrados en este catálogo.
                    </td>
                  </tr>
                ) : (
                  itemsFiltrados.map((item, idx) => {
                    const idCampo = (item as any).id_categoria || (item as any).id_origen || (item as any).id_causa_categoria || (item as any).id_codigo_cierre || (item as any).id_metodo || (item as any).id_motivo_espera || (item as any).id_motivo_cancelacion || item.id;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {item.orden || idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {item.codigo}
                          {item.es_sistema && (
                            <span
                              className="ml-1 text-amber-600 font-bold"
                              title="Valor de fábrica del sistema"
                            >
                              [Sistema]
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center space-x-2">
                          {item.color && (
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 inline-block"
                              style={{ backgroundColor: item.color }}
                            />
                          )}
                          <span>{item.nombre}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">
                          {catalogoActivo === "origenes" && (
                            <span>
                              {item.requiere_incidentes ? "Req. Incidentes | " : ""}
                              {item.es_proactivo ? "Proactivo (KPI)" : "Reactivo"}
                            </span>
                          )}
                          {catalogoActivo === "codigos_cierre" && (
                            <span>
                              {item.cuenta_como_exito ? "Exitoso | " : "No resuelto | "}
                              {item.requiere_rfc_cerrada ? "Req. RFC" : ""}
                            </span>
                          )}
                          {catalogoActivo === "motivos_espera" && (
                            <span>
                              {item.pausa_resolucion ? "Pausa Reloj" : "Reloj Activo"}
                            </span>
                          )}
                          {catalogoActivo === "categorias" && (
                            <span>
                              {item.padre_nombre ? `Sub de: ${item.padre_nombre}` : "Categoría Nivel 1"}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              onActualizarItem(catalogoActivo, idCampo, { activo: !item.activo })
                            }
                            disabled={item.es_sistema || !puedeEditar}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.activo
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {item.activo ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {item.usos_tickets || 0}
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(item)}
                            disabled={!puedeEditar}
                            className="px-2 py-0.5 rounded text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOrigenFusion(item);
                              setDestinoFusionId("");
                              setModalFusion(true);
                            }}
                            disabled={!puedeEditar}
                            className="px-2 py-0.5 rounded text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100"
                            title="Fusionar con otro valor reasignando tickets"
                          >
                            Fusionar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.es_sistema) {
                                alert("Los valores de fábrica del sistema no pueden ser eliminados.");
                                return;
                              }
                              if ((item.usos_tickets || 0) > 0) {
                                alert(
                                  `Este valor está en uso por ${item.usos_tickets} tickets. Solo puede desactivarlo o fusionarlo.`
                                );
                                return;
                              }
                              if (confirm(`¿Eliminar '${item.nombre}' permanentemente?`)) {
                                onEliminarItem(catalogoActivo, idCampo);
                              }
                            }}
                            disabled={item.es_sistema || (item.usos_tickets || 0) > 0 || !puedeEditar}
                            className="px-2 py-0.5 rounded text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Alta / Edición de Elemento de Catálogo */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800">
                {esNuevo ? "Alta de Valor" : "Editar Valor"} — {CATALOGOS_DEF.find((c) => c.id === catalogoActivo)?.nombre}
              </h3>
              <button
                type="button"
                onClick={() => setModalEditar(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nombre Visible <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Falla de Servidor"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Código Interno <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  disabled={!esNuevo}
                  placeholder="falla_servidor"
                  className="w-full font-mono border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Color representativo</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                  <span className="font-mono text-slate-600">{color}</span>
                </div>
              </div>

              {/* Atributos específicos según catálogo */}
              {catalogoActivo === "origenes" && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={atributosExtra.requiere_incidentes || false}
                      onChange={(e) =>
                        setAtributosExtra({ ...atributosExtra, requiere_incidentes: e.target.checked })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Requiere incidentes vinculados obligatoriamente</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={atributosExtra.es_proactivo || false}
                      onChange={(e) =>
                        setAtributosExtra({ ...atributosExtra, es_proactivo: e.target.checked })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Es origen proactivo (KPI proactividad)</span>
                  </label>
                </div>
              )}

              {catalogoActivo === "codigos_cierre" && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={atributosExtra.cuenta_como_exito !== false}
                      onChange={(e) =>
                        setAtributosExtra({ ...atributosExtra, cuenta_como_exito: e.target.checked })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Cuenta como resuelto con éxito en KPI</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={atributosExtra.requiere_rfc_cerrada || false}
                      onChange={(e) =>
                        setAtributosExtra({ ...atributosExtra, requiere_rfc_cerrada: e.target.checked })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Requiere RFC cerrada con éxito</span>
                  </label>
                </div>
              )}

              {errorLocal && <p className="text-xs text-rose-600 font-medium">{errorLocal}</p>}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditar(false)}
                  className="px-3 py-1.5 rounded text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-1.5 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  {guardando ? "Guardando..." : "Guardar valor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fusión de Elementos */}
      {modalFusion && origenFusion && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              Fusionar Valor: {origenFusion.nombre}
            </h3>
            <p className="text-xs text-slate-600">
              Esta operación reasignará todos los tickets asociados (
              <strong>{origenFusion.usos_tickets || 0} tickets</strong>) al nuevo valor seleccionado y desactivará el registro origen de inmediato.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">Seleccione el valor de destino:</label>
              <select
                value={destinoFusionId}
                onChange={(e) => setDestinoFusionId(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-2 text-slate-800 bg-white"
              >
                <option value="">Seleccione destino...</option>
                {itemsActuales
                  .filter((i) => i.codigo !== origenFusion.codigo)
                  .map((i, idx) => (
                    <option
                      key={idx}
                      value={(i as any).id_categoria || (i as any).id_origen || (i as any).id_causa_categoria || (i as any).id_codigo_cierre || (i as any).id_metodo || (i as any).id_motivo_espera || (i as any).id_motivo_cancelacion || i.id}
                    >
                      {i.nombre} ({i.codigo})
                    </option>
                  ))}
              </select>
            </div>

            {errorLocal && <p className="text-xs text-rose-600 font-medium">{errorLocal}</p>}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setModalFusion(false)}
                className="px-3 py-1.5 rounded text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFusionarSubmit}
                disabled={!destinoFusionId || guardando}
                className="px-4 py-1.5 rounded font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-40"
              >
                {guardando ? "Fusionando..." : "Confirmar Fusión"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
