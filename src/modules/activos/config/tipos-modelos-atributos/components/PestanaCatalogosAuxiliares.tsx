"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Edit2, Ban, Play, ArrowUp, ArrowDown, X } from "@/shared/components/ui/Iconos";

export interface CondicionFisica {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  exige_informe: boolean;
  orden: number;
  activo: boolean;
  usos?: number;
}

export interface Moneda {
  codigo: string;
  simbolo: string;
  nombre: string;
  por_defecto: boolean;
  activo: boolean;
}

export interface TipoAdquisicion {
  codigo: string;
  nombre: string;
  exige_contrato: boolean;
  exige_fecha_fin?: boolean;
  orden: number;
  activo: boolean;
}

export interface TipoDocumento {
  codigo: string;
  nombre: string;
  obligatorio_baja: boolean;
  obligatorio_asignacion?: boolean;
  orden: number;
  activo: boolean;
}

export interface CentroCosto {
  codigo: string;
  nombre: string;
  departamento: string;
  activo?: boolean;
}

export interface EtiquetaSugerida {
  id: string;
  nombre: string;
  color: string;
  activo: boolean;
}

export interface MotivoAuxiliar {
  id: string;
  tipo: "reclasificacion" | "fusion";
  motivo: string;
  activo: boolean;
}

export interface CatalogosAuxiliaresData {
  condicion_fisica?: CondicionFisica[];
  monedas?: Moneda[];
  tipos_adquisicion?: TipoAdquisicion[];
  tipos_documento?: TipoDocumento[];
  centros_costo?: CentroCosto[];
  etiquetas_sugeridas?: EtiquetaSugerida[];
  motivos_auxiliares?: MotivoAuxiliar[];
}

interface Props {
  datos: CatalogosAuxiliaresData;
  onChange: (nuevosDatos: CatalogosAuxiliaresData) => void;
  bloqueado: boolean;
}

type CatalogoId =
  | "condicion_fisica"
  | "monedas"
  | "tipos_adquisicion"
  | "tipos_documento"
  | "centros_costo"
  | "etiquetas_sugeridas"
  | "motivos_auxiliares";

export function PestanaCatalogosAuxiliares({ datos, onChange, bloqueado }: Props) {
  const [catalogoActivo, setCatalogoActivo] = useState<CatalogoId>("condicion_fisica");
  const [modalEdicion, setModalEdicion] = useState<{ abierto: boolean; catalogo: CatalogoId; item?: any; esNuevo: boolean }>({
    abierto: false,
    catalogo: "condicion_fisica",
    esNuevo: true
  });
  const [itemEdicion, setItemEdicion] = useState<any>({});
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const condiciones: CondicionFisica[] = datos?.condicion_fisica || [
    { id: "nuevo", codigo: "NUEVO", nombre: "Nuevo", color: "#10b981", exige_informe: false, orden: 1, activo: true, usos: 45 },
    { id: "bueno", codigo: "BUENO", nombre: "Bueno", color: "#3b82f6", exige_informe: false, orden: 2, activo: true, usos: 120 },
    { id: "regular", codigo: "REGULAR", nombre: "Regular", color: "#f59e0b", exige_informe: false, orden: 3, activo: true, usos: 30 },
    { id: "malo", codigo: "MALO", nombre: "Malo", color: "#ef4444", exige_informe: true, orden: 4, activo: true, usos: 8 }
  ];

  const monedas: Moneda[] = datos?.monedas || [
    { codigo: "USD", simbolo: "$", nombre: "Dólar estadounidense", por_defecto: true, activo: true },
    { codigo: "PEN", simbolo: "S/.", nombre: "Sol peruano", por_defecto: false, activo: true },
    { codigo: "EUR", simbolo: "€", nombre: "Euro", por_defecto: false, activo: true }
  ];

  const tiposAdquisicion: TipoAdquisicion[] = datos?.tipos_adquisicion || [
    { codigo: "COMPRA", nombre: "Compra directa", exige_contrato: false, exige_fecha_fin: false, orden: 1, activo: true },
    { codigo: "ARRENDAMIENTO", nombre: "Arrendamiento (Leasing)", exige_contrato: true, exige_fecha_fin: true, orden: 2, activo: true },
    { codigo: "DONACION", nombre: "Donación", exige_contrato: false, exige_fecha_fin: false, orden: 3, activo: true },
    { codigo: "COMODATO", nombre: "Comodato", exige_contrato: true, exige_fecha_fin: true, orden: 4, activo: true },
    { codigo: "OTRO", nombre: "Otro", exige_contrato: false, exige_fecha_fin: false, orden: 5, activo: true }
  ];

  const tiposDocumento: TipoDocumento[] = datos?.tipos_documento || [
    { codigo: "FACTURA", nombre: "Factura comercial", obligatorio_baja: false, obligatorio_asignacion: false, orden: 1, activo: true },
    { codigo: "GARANTIA", nombre: "Certificado de garantía", obligatorio_baja: false, obligatorio_asignacion: false, orden: 2, activo: true },
    { codigo: "ACTA_ENTREGA", nombre: "Acta de entrega / custodia", obligatorio_baja: false, obligatorio_asignacion: true, orden: 3, activo: true },
    { codigo: "ACTA_BAJA", nombre: "Acta de baja y disposición", obligatorio_baja: true, obligatorio_asignacion: false, orden: 4, activo: true },
    { codigo: "CERTIFICADO_BORRADO", nombre: "Certificado de borrado seguro", obligatorio_baja: true, obligatorio_asignacion: false, orden: 5, activo: true },
    { codigo: "MANUAL", nombre: "Manual técnico / Ficha", obligatorio_baja: false, obligatorio_asignacion: false, orden: 6, activo: true },
    { codigo: "FOTO", nombre: "Fotografía de evidencia", obligatorio_baja: false, obligatorio_asignacion: false, orden: 7, activo: true }
  ];

  const centrosCosto: CentroCosto[] = datos?.centros_costo || [
    { codigo: "CC-TI-01", nombre: "Tecnología e Infraestructura", departamento: "TI", activo: true },
    { codigo: "CC-ADM-01", nombre: "Administración General", departamento: "Administración", activo: true },
    { codigo: "CC-OPS-01", nombre: "Operaciones Institucionales", departamento: "Operaciones", activo: true }
  ];

  const etiquetasSugeridas: EtiquetaSugerida[] = datos?.etiquetas_sugeridas || [
    { id: "1", nombre: "Crítico", color: "#ef4444", activo: true },
    { id: "2", nombre: "VIP", color: "#8b5cf6", activo: true },
    { id: "3", nombre: "Home Office", color: "#3b82f6", activo: true },
    { id: "4", nombre: "Renovación 2026", color: "#f59e0b", activo: true },
    { id: "5", nombre: "Préstamo", color: "#10b981", activo: true }
  ];

  const motivosAuxiliares: MotivoAuxiliar[] = datos?.motivos_auxiliares || [
    { id: "1", tipo: "reclasificacion", motivo: "Error en catalogación inicial durante el alta", activo: true },
    { id: "2", tipo: "reclasificacion", motivo: "Transformación tecnológica o virtualización de activo", activo: true },
    { id: "3", tipo: "reclasificacion", motivo: "Reasignación funcional de uso informático a industrial", activo: true },
    { id: "4", tipo: "fusion", motivo: "Duplicidad detectada en migración inicial de inventario", activo: true },
    { id: "5", tipo: "fusion", motivo: "Registro duplicado por alta simultánea en recepción", activo: true }
  ];

  const mostrarAviso = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const abrirEdicion = (catalogo: CatalogoId, item?: any) => {
    if (bloqueado) return;
    setItemEdicion(item ? { ...item } : {});
    setModalEdicion({
      abierto: true,
      catalogo,
      item,
      esNuevo: !item
    });
  };

  const guardarEdicion = () => {
    if (bloqueado) return;
    const cat = modalEdicion.catalogo;
    const esNuevo = modalEdicion.esNuevo;

    if (cat === "condicion_fisica") {
      let actualizados: CondicionFisica[];
      if (esNuevo) {
        const nuevo: CondicionFisica = {
          id: (itemEdicion.codigo || `cond_${Date.now()}`).toLowerCase(),
          codigo: itemEdicion.codigo?.toUpperCase() || "NUEVO_VALOR",
          nombre: itemEdicion.nombre || "Sin nombre",
          color: itemEdicion.color || "#6b7280",
          exige_informe: !!itemEdicion.exige_informe,
          orden: condiciones.length + 1,
          activo: true,
          usos: 0
        };
        actualizados = [...condiciones, nuevo];
      } else {
        actualizados = condiciones.map((c) => (c.id === itemEdicion.id ? { ...c, ...itemEdicion } : c));
      }
      onChange({ ...datos, condicion_fisica: actualizados });
    } else if (cat === "monedas") {
      let actualizados: Moneda[];
      if (esNuevo) {
        const nuevo: Moneda = {
          codigo: itemEdicion.codigo?.toUpperCase() || "MON",
          simbolo: itemEdicion.simbolo || "$",
          nombre: itemEdicion.nombre || "Moneda",
          por_defecto: !!itemEdicion.por_defecto,
          activo: true
        };
        if (nuevo.por_defecto) {
          actualizados = monedas.map((m) => ({ ...m, por_defecto: false })).concat(nuevo);
        } else {
          actualizados = [...monedas, nuevo];
        }
      } else {
        actualizados = monedas.map((m) => {
          if (m.codigo === itemEdicion.codigo) {
            return { ...m, ...itemEdicion };
          }
          if (itemEdicion.por_defecto) {
            return { ...m, por_defecto: false };
          }
          return m;
        });
      }
      onChange({ ...datos, monedas: actualizados });
    } else if (cat === "tipos_adquisicion") {
      let actualizados: TipoAdquisicion[];
      if (esNuevo) {
        const nuevo: TipoAdquisicion = {
          codigo: itemEdicion.codigo?.toUpperCase() || `TA_${Date.now()}`,
          nombre: itemEdicion.nombre || "Nuevo Tipo",
          exige_contrato: !!itemEdicion.exige_contrato,
          exige_fecha_fin: !!itemEdicion.exige_fecha_fin,
          orden: tiposAdquisicion.length + 1,
          activo: true
        };
        actualizados = [...tiposAdquisicion, nuevo];
      } else {
        actualizados = tiposAdquisicion.map((t) => (t.codigo === itemEdicion.codigo ? { ...t, ...itemEdicion } : t));
      }
      onChange({ ...datos, tipos_adquisicion: actualizados });
    } else if (cat === "tipos_documento") {
      let actualizados: TipoDocumento[];
      if (esNuevo) {
        const nuevo: TipoDocumento = {
          codigo: itemEdicion.codigo?.toUpperCase() || `DOC_${Date.now()}`,
          nombre: itemEdicion.nombre || "Nuevo Documento",
          obligatorio_baja: !!itemEdicion.obligatorio_baja,
          obligatorio_asignacion: !!itemEdicion.obligatorio_asignacion,
          orden: tiposDocumento.length + 1,
          activo: true
        };
        actualizados = [...tiposDocumento, nuevo];
      } else {
        actualizados = tiposDocumento.map((d) => (d.codigo === itemEdicion.codigo ? { ...d, ...itemEdicion } : d));
      }
      onChange({ ...datos, tipos_documento: actualizados });
    } else if (cat === "centros_costo") {
      let actualizados: CentroCosto[];
      if (esNuevo) {
        const nuevo: CentroCosto = {
          codigo: itemEdicion.codigo?.toUpperCase() || `CC-${Date.now()}`,
          nombre: itemEdicion.nombre || "Centro de Costo",
          departamento: itemEdicion.departamento || "General",
          activo: true
        };
        actualizados = [...centrosCosto, nuevo];
      } else {
        actualizados = centrosCosto.map((c) => (c.codigo === itemEdicion.codigo ? { ...c, ...itemEdicion } : c));
      }
      onChange({ ...datos, centros_costo: actualizados });
    } else if (cat === "etiquetas_sugeridas") {
      let actualizados: EtiquetaSugerida[];
      if (esNuevo) {
        const nuevo: EtiquetaSugerida = {
          id: String(Date.now()),
          nombre: itemEdicion.nombre || "Etiqueta",
          color: itemEdicion.color || "#6b7280",
          activo: true
        };
        actualizados = [...etiquetasSugeridas, nuevo];
      } else {
        actualizados = etiquetasSugeridas.map((e) => (e.id === itemEdicion.id ? { ...e, ...itemEdicion } : e));
      }
      onChange({ ...datos, etiquetas_sugeridas: actualizados });
    } else if (cat === "motivos_auxiliares") {
      let actualizados: MotivoAuxiliar[];
      if (esNuevo) {
        const nuevo: MotivoAuxiliar = {
          id: String(Date.now()),
          tipo: itemEdicion.tipo || "reclasificacion",
          motivo: itemEdicion.motivo || "Motivo sin detalle",
          activo: true
        };
        actualizados = [...motivosAuxiliares, nuevo];
      } else {
        actualizados = motivosAuxiliares.map((m) => (m.id === itemEdicion.id ? { ...m, ...itemEdicion } : m));
      }
      onChange({ ...datos, motivos_auxiliares: actualizados });
    }

    setModalEdicion({ abierto: false, catalogo: "condicion_fisica", esNuevo: true });
    mostrarAviso("Elemento guardado en el borrador.");
  };

  const cambiarEstadoActivo = (catalogo: CatalogoId, identificador: string, activoActual: boolean) => {
    if (bloqueado) return;
    if (catalogo === "condicion_fisica") {
      const act = condiciones.map((c) => (c.id === identificador ? { ...c, activo: !activoActual } : c));
      onChange({ ...datos, condicion_fisica: act });
    } else if (catalogo === "monedas") {
      const act = monedas.map((m) => (m.codigo === identificador ? { ...m, activo: !activoActual } : m));
      onChange({ ...datos, monedas: act });
    } else if (catalogo === "tipos_adquisicion") {
      const act = tiposAdquisicion.map((t) => (t.codigo === identificador ? { ...t, activo: !activoActual } : t));
      onChange({ ...datos, tipos_adquisicion: act });
    } else if (catalogo === "tipos_documento") {
      const act = tiposDocumento.map((d) => (d.codigo === identificador ? { ...d, activo: !activoActual } : d));
      onChange({ ...datos, tipos_documento: act });
    } else if (catalogo === "centros_costo") {
      const act = centrosCosto.map((c) => (c.codigo === identificador ? { ...c, activo: !activoActual } : c));
      onChange({ ...datos, centros_costo: act });
    } else if (catalogo === "etiquetas_sugeridas") {
      const act = etiquetasSugeridas.map((e) => (e.id === identificador ? { ...e, activo: !activoActual } : e));
      onChange({ ...datos, etiquetas_sugeridas: act });
    } else if (catalogo === "motivos_auxiliares") {
      const act = motivosAuxiliares.map((m) => (m.id === identificador ? { ...m, activo: !activoActual } : m));
      onChange({ ...datos, motivos_auxiliares: act });
    }
  };

  const moverElemento = (catalogo: CatalogoId, index: number, direccion: "arriba" | "abajo") => {
    if (bloqueado) return;
    if (catalogo === "condicion_fisica") {
      const targetIndex = direccion === "arriba" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= condiciones.length) return;
      const clone = [...condiciones];
      const temp = clone[index];
      clone[index] = clone[targetIndex];
      clone[targetIndex] = temp;
      const reordenados = clone.map((item, idx) => ({ ...item, orden: idx + 1 }));
      onChange({ ...datos, condicion_fisica: reordenados });
    } else if (catalogo === "tipos_adquisicion") {
      const targetIndex = direccion === "arriba" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= tiposAdquisicion.length) return;
      const clone = [...tiposAdquisicion];
      const temp = clone[index];
      clone[index] = clone[targetIndex];
      clone[targetIndex] = temp;
      const reordenados = clone.map((item, idx) => ({ ...item, orden: idx + 1 }));
      onChange({ ...datos, tipos_adquisicion: reordenados });
    } else if (catalogo === "tipos_documento") {
      const targetIndex = direccion === "arriba" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= tiposDocumento.length) return;
      const clone = [...tiposDocumento];
      const temp = clone[index];
      clone[index] = clone[targetIndex];
      clone[targetIndex] = temp;
      const reordenados = clone.map((item, idx) => ({ ...item, orden: idx + 1 }));
      onChange({ ...datos, tipos_documento: reordenados });
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

      {/* Barra superior con navegación de submódulos de catálogos */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Listas y catálogos auxiliares de activos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Administración de listas maestras para normalización de datos en ciclo de vida, finanzas y auditoría.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => mostrarAviso("Plantilla CSV descargada con encabezados estándar.")}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => mostrarAviso("Seleccione un archivo CSV para importar valores normalizados.")}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              Importar CSV
            </button>
            <button
              onClick={() => abrirEdicion(catalogoActivo)}
              disabled={bloqueado}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
            >
              + Nuevo valor
            </button>
          </div>
        </div>

        {/* Pestañas horizontales de catálogos */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 mt-4 pb-2">
          {[
            { id: "condicion_fisica", label: "Condición física", badge: condiciones.length },
            { id: "monedas", label: "Monedas", badge: monedas.length },
            { id: "tipos_adquisicion", label: "Tipos de adquisición", badge: tiposAdquisicion.length },
            { id: "tipos_documento", label: "Tipos de documento", badge: tiposDocumento.length },
            { id: "centros_costo", label: "Centros de costo", badge: centrosCosto.length },
            { id: "etiquetas_sugeridas", label: "Etiquetas sugeridas", badge: etiquetasSugeridas.length },
            { id: "motivos_auxiliares", label: "Motivos de reclasificación / fusión", badge: motivosAuxiliares.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCatalogoActivo(tab.id as CatalogoId)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                catalogoActivo === tab.id
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  catalogoActivo === tab.id ? "bg-indigo-200 text-indigo-800" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido según catálogo activo */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* 1. Condición Física */}
        {catalogoActivo === "condicion_fisica" && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Catálogo de condición física</h4>
                <p className="text-xs text-slate-500">
                  Estados de preservación del hardware. Si se marca "Exige informe", se solicitará dictamen técnico al degradar.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-16">Orden</th>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Nombre</th>
                    <th className="py-2.5 px-3">Color distintivo</th>
                    <th className="py-2.5 px-3">Exige informe técnico</th>
                    <th className="py-2.5 px-3">Usos registrados</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {condiciones.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 flex items-center gap-1">
                        <span>{item.orden}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            onClick={() => moverElemento("condicion_fisica", idx, "arriba")}
                            disabled={idx === 0 || bloqueado}
                            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            onClick={() => moverElemento("condicion_fisica", idx, "abajo")}
                            disabled={idx === condiciones.length - 1 || bloqueado}
                            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                          >
                            <ArrowDown size={10} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{item.codigo}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.nombre}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-mono text-slate-600">{item.color}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        {item.exige_informe ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">
                            Requerido
                          </span>
                        ) : (
                          <span className="text-slate-400">Opcional</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{item.usos || 0} activos</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {item.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right"><div style={{ display: "inline-flex", gap: 4 }}><BotonIcono variante="normal" icono={<Edit2 size={13} />} titulo="Editar condición" ariaLabel="Editar condición" disabled={bloqueado} onClick={() => abrirEdicion("condicion_fisica", item)} /><BotonIcono variante={item.activo ? "peligro" : "normal"} icono={item.activo ? <Ban size={13} /> : <Play size={13} />} titulo={item.activo ? "Desactivar condición" : "Activar condición"} ariaLabel={item.activo ? "Desactivar condición" : "Activar condición"} disabled={bloqueado} onClick={() => cambiarEstadoActivo("condicion_fisica", item.id, item.activo)} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Monedas */}
        {catalogoActivo === "monedas" && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-800">Catálogo de monedas</h4>
              <p className="text-xs text-slate-500">
                Monedas para registro de costos de adquisición, contratos y pólizas de soporte.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Código ISO</th>
                    <th className="py-2.5 px-3">Símbolo</th>
                    <th className="py-2.5 px-3">Nombre oficial</th>
                    <th className="py-2.5 px-3">Moneda base del sistema</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monedas.map((m) => (
                    <tr key={m.codigo} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{m.codigo}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{m.simbolo}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{m.nombre}</td>
                      <td className="py-2.5 px-3">
                        {m.por_defecto ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Por defecto
                          </span>
                        ) : (
                          <span className="text-slate-400">Alternativa</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            m.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {m.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right"><div style={{ display: "inline-flex", gap: 4 }}><BotonIcono variante="normal" icono={<Edit2 size={13} />} titulo="Editar moneda" ariaLabel="Editar moneda" disabled={bloqueado} onClick={() => abrirEdicion("monedas", m)} />{!m.por_defecto && (<BotonIcono variante={m.activo ? "peligro" : "normal"} icono={m.activo ? <Ban size={13} /> : <Play size={13} />} titulo={m.activo ? "Desactivar moneda" : "Activar moneda"} ariaLabel={m.activo ? "Desactivar moneda" : "Activar moneda"} disabled={bloqueado} onClick={() => cambiarEstadoActivo("monedas", m.codigo, m.activo)} />)}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Tipos de Adquisición */}
        {catalogoActivo === "tipos_adquisicion" && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-800">Tipos de adquisición</h4>
              <p className="text-xs text-slate-500">
                Modalidades de ingreso patrimonial al parque tecnológico corporativo.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-16">Orden</th>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Nombre</th>
                    <th className="py-2.5 px-3">Exige contrato TI (Módulo 8)</th>
                    <th className="py-2.5 px-3">Exige fecha fin vigencia</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tiposAdquisicion.map((item, idx) => (
                    <tr key={item.codigo} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 flex items-center gap-1">
                        <span>{item.orden}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            onClick={() => moverElemento("tipos_adquisicion", idx, "arriba")}
                            disabled={idx === 0 || bloqueado}
                            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            onClick={() => moverElemento("tipos_adquisicion", idx, "abajo")}
                            disabled={idx === tiposAdquisicion.length - 1 || bloqueado}
                            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                          >
                            <ArrowDown size={10} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{item.codigo}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.nombre}</td>
                      <td className="py-2.5 px-3">
                        {item.exige_contrato ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Exigido
                          </span>
                        ) : (
                          <span className="text-slate-400">No requerido</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.exige_fecha_fin ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                            Exigida
                          </span>
                        ) : (
                          <span className="text-slate-400">No aplica</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {item.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right"><div style={{ display: "inline-flex", gap: 4 }}><BotonIcono variante="normal" icono={<Edit2 size={13} />} titulo="Editar modalidad" ariaLabel="Editar modalidad" disabled={bloqueado} onClick={() => abrirEdicion("tipos_adquisicion", item)} /><BotonIcono variante={item.activo ? "peligro" : "normal"} icono={item.activo ? <Ban size={13} /> : <Play size={13} />} titulo={item.activo ? "Desactivar modalidad" : "Activar modalidad"} ariaLabel={item.activo ? "Desactivar modalidad" : "Activar modalidad"} disabled={bloqueado} onClick={() => cambiarEstadoActivo("tipos_adquisicion", item.codigo, item.activo)} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Tipos de Documento */}
        {catalogoActivo === "tipos_documento" && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-800">Tipos de documentos adjuntos</h4>
              <p className="text-xs text-slate-500">
                Clasificación de evidencias, garantías, facturas y actas obligatorias en transiciones.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-16">Orden</th>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Nombre</th>
                    <th className="py-2.5 px-3">Obligatorio en Baja (1.5.2.6)</th>
                    <th className="py-2.5 px-3">Obligatorio en Asignación (1.5.2.3)</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tiposDocumento.map((item, idx) => (
                    <tr key={item.codigo} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 flex items-center gap-1">
                        <span>{item.orden}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            onClick={() => moverElemento("tipos_documento", idx, "arriba")}
                            disabled={idx === 0 || bloqueado}
                            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            onClick={() => moverElemento("tipos_documento", idx, "abajo")}
                            disabled={idx === tiposDocumento.length - 1 || bloqueado}
                            className="text-[9px] text-slate-400 hover:text-slate-700 disabled:opacity-20 leading-none"
                          >
                            <ArrowDown size={10} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{item.codigo}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.nombre}</td>
                      <td className="py-2.5 px-3">
                        {item.obligatorio_baja ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                            Requerido
                          </span>
                        ) : (
                          <span className="text-slate-400">Opcional</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.obligatorio_asignacion ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                            Requerido
                          </span>
                        ) : (
                          <span className="text-slate-400">Opcional</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {item.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right"><div style={{ display: "inline-flex", gap: 4 }}><BotonIcono variante="normal" icono={<Edit2 size={13} />} titulo="Editar documento" ariaLabel="Editar documento" disabled={bloqueado} onClick={() => abrirEdicion("tipos_documento", item)} /><BotonIcono variante={item.activo ? "peligro" : "normal"} icono={item.activo ? <Ban size={13} /> : <Play size={13} />} titulo={item.activo ? "Desactivar documento" : "Activar documento"} ariaLabel={item.activo ? "Desactivar documento" : "Activar documento"} disabled={bloqueado} onClick={() => cambiarEstadoActivo("tipos_documento", item.codigo, item.activo)} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Centros de Costo */}
        {catalogoActivo === "centros_costo" && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-800">Centros de costo presupuestario</h4>
              <p className="text-xs text-slate-500">
                Imputación de costos de adquisición, licencias SAM y contratos de mantenimiento por área.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Código presupuestal</th>
                    <th className="py-2.5 px-3">Denominación</th>
                    <th className="py-2.5 px-3">Departamento asignado</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {centrosCosto.map((item) => (
                    <tr key={item.codigo} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{item.codigo}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.nombre}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.departamento}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.activo !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {item.activo !== false ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right"><div style={{ display: "inline-flex", gap: 4 }}><BotonIcono variante="normal" icono={<Edit2 size={13} />} titulo="Editar centro de costo" ariaLabel="Editar centro de costo" disabled={bloqueado} onClick={() => abrirEdicion("centros_costo", item)} /><BotonIcono variante={item.activo !== false ? "peligro" : "normal"} icono={item.activo !== false ? <Ban size={13} /> : <Play size={13} />} titulo={item.activo !== false ? "Desactivar centro de costo" : "Activar centro de costo"} ariaLabel={item.activo !== false ? "Desactivar centro de costo" : "Activar centro de costo"} disabled={bloqueado} onClick={() => cambiarEstadoActivo("centros_costo", item.codigo, item.activo !== false)} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Etiquetas Sugeridas */}
        {catalogoActivo === "etiquetas_sugeridas" && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-800">Etiquetas sugeridas (Chips rápidos)</h4>
              <p className="text-xs text-slate-500">
                Tags estandarizados para búsqueda cruzada y clasificación rápida de activos en inventario.
              </p>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {etiquetasSugeridas.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-slate-800">{item.nombre}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded ${
                      item.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.activo ? "Activa" : "Inactiva"}
                  </span>
                  <BotonIcono variante="normal" icono={<Edit2 size={11} />} titulo="Editar etiqueta" ariaLabel="Editar etiqueta" disabled={bloqueado} onClick={() => abrirEdicion("etiquetas_sugeridas", item)} style={{ width: 22, height: 22 }} />
                  <BotonIcono variante="peligro" icono={<X size={11} />} titulo="Desactivar etiqueta" ariaLabel="Desactivar etiqueta" disabled={bloqueado} onClick={() => cambiarEstadoActivo("etiquetas_sugeridas", item.id, item.activo)} style={{ width: 22, height: 22 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Motivos de reclasificación y fusión */}
        {catalogoActivo === "motivos_auxiliares" && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-800">Motivos de reclasificación y de fusión de activos</h4>
              <p className="text-xs text-slate-500">
                Razones formales exigidas en auditoría al modificar clase/tipo o al fusionar duplicados.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Tipo de operación</th>
                    <th className="py-2.5 px-3">Motivo justificado</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {motivosAuxiliares.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.tipo === "reclasificacion"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.tipo === "reclasificacion" ? "Reclasificación" : "Fusión de duplicados"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.motivo}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {item.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right"><div style={{ display: "inline-flex", gap: 4 }}><BotonIcono variante="normal" icono={<Edit2 size={13} />} titulo="Editar motivo" ariaLabel="Editar motivo" disabled={bloqueado} onClick={() => abrirEdicion("motivos_auxiliares", item)} /><BotonIcono variante={item.activo ? "peligro" : "normal"} icono={item.activo ? <Ban size={13} /> : <Play size={13} />} titulo={item.activo ? "Desactivar motivo" : "Activar motivo"} ariaLabel={item.activo ? "Desactivar motivo" : "Activar motivo"} disabled={bloqueado} onClick={() => cambiarEstadoActivo("motivos_auxiliares", item.id, item.activo)} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de adición / edición de elemento de catálogo */}
      {modalEdicion.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in duration-150">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                {modalEdicion.esNuevo ? "Nuevo elemento de catálogo" : "Editar elemento de catálogo"}
              </h3>
              <BotonIcono variante="normal" icono={<X size={14} />} titulo="Cerrar ventana" ariaLabel="Cerrar ventana" onClick={() => setModalEdicion({ abierto: false, catalogo: "condicion_fisica", esNuevo: true })} />
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Campos dinámicos según el catálogo */}
              {modalEdicion.catalogo === "condicion_fisica" && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código (inmutable)</label>
                    <input
                      type="text"
                      disabled={!modalEdicion.esNuevo}
                      value={itemEdicion.codigo || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, codigo: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase focus:ring-1 focus:ring-indigo-500"
                      placeholder="EJ: OPTIMO"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={itemEdicion.nombre || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, nombre: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                      placeholder="EJ: Estado Óptimo"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Color distintivo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={itemEdicion.color || "#10b981"}
                        onChange={(e) => setItemEdicion({ ...itemEdicion, color: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={itemEdicion.color || "#10b981"}
                        onChange={(e) => setItemEdicion({ ...itemEdicion, color: e.target.value })}
                        className="w-32 px-2 py-1 border border-slate-300 rounded font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="check_informe"
                      checked={!!itemEdicion.exige_informe}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, exige_informe: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="check_informe" className="font-semibold text-slate-700 cursor-pointer">
                      Exige informe técnico de degradación al seleccionar este valor
                    </label>
                  </div>
                </>
              )}

              {modalEdicion.catalogo === "monedas" && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código ISO 4217</label>
                    <input
                      type="text"
                      disabled={!modalEdicion.esNuevo}
                      value={itemEdicion.codigo || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, codigo: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                      placeholder="EJ: GBP"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Símbolo</label>
                    <input
                      type="text"
                      value={itemEdicion.simbolo || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, simbolo: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      placeholder="EJ: £"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre oficial</label>
                    <input
                      type="text"
                      value={itemEdicion.nombre || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, nombre: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      placeholder="EJ: Libra esterlina"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="check_defecto"
                      checked={!!itemEdicion.por_defecto}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, por_defecto: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <label htmlFor="check_defecto" className="font-semibold text-slate-700 cursor-pointer">
                      Establecer como moneda por defecto del sistema
                    </label>
                  </div>
                </>
              )}

              {modalEdicion.catalogo === "tipos_adquisicion" && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código</label>
                    <input
                      type="text"
                      disabled={!modalEdicion.esNuevo}
                      value={itemEdicion.codigo || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, codigo: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre de modalidad</label>
                    <input
                      type="text"
                      value={itemEdicion.nombre || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, nombre: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!itemEdicion.exige_contrato}
                        onChange={(e) => setItemEdicion({ ...itemEdicion, exige_contrato: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span className="font-semibold text-slate-700">Exige asociar contrato TI (Módulo 8)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!itemEdicion.exige_fecha_fin}
                        onChange={(e) => setItemEdicion({ ...itemEdicion, exige_fecha_fin: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span className="font-semibold text-slate-700">Exige fecha de fin de vigencia</span>
                    </label>
                  </div>
                </>
              )}

              {modalEdicion.catalogo === "tipos_documento" && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código</label>
                    <input
                      type="text"
                      disabled={!modalEdicion.esNuevo}
                      value={itemEdicion.codigo || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, codigo: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre de documento</label>
                    <input
                      type="text"
                      value={itemEdicion.nombre || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, nombre: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!itemEdicion.obligatorio_baja}
                        onChange={(e) => setItemEdicion({ ...itemEdicion, obligatorio_baja: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span className="font-semibold text-slate-700">Obligatorio en Baja y Disposición (1.5.2.6)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!itemEdicion.obligatorio_asignacion}
                        onChange={(e) => setItemEdicion({ ...itemEdicion, obligatorio_asignacion: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span className="font-semibold text-slate-700">Obligatorio en Asignación / Custodia (1.5.2.3)</span>
                    </label>
                  </div>
                </>
              )}

              {modalEdicion.catalogo === "centros_costo" && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código de centro de costo</label>
                    <input
                      type="text"
                      value={itemEdicion.codigo || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, codigo: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                      placeholder="EJ: CC-TI-02"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Denominación</label>
                    <input
                      type="text"
                      value={itemEdicion.nombre || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, nombre: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      placeholder="EJ: Seguridad de la Información"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Departamento responsable</label>
                    <input
                      type="text"
                      value={itemEdicion.departamento || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, departamento: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      placeholder="EJ: TI"
                    />
                  </div>
                </>
              )}

              {modalEdicion.catalogo === "etiquetas_sugeridas" && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Texto de la etiqueta</label>
                    <input
                      type="text"
                      value={itemEdicion.nombre || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, nombre: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      placeholder="EJ: Proyecto Alpha"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Color distintivo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={itemEdicion.color || "#3b82f6"}
                        onChange={(e) => setItemEdicion({ ...itemEdicion, color: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={itemEdicion.color || "#3b82f6"}
                        onChange={(e) => setItemEdicion({ ...itemEdicion, color: e.target.value })}
                        className="w-32 px-2 py-1 border border-slate-300 rounded font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalEdicion.catalogo === "motivos_auxiliares" && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de operación</label>
                    <select
                      value={itemEdicion.tipo || "reclasificacion"}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, tipo: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                    >
                      <option value="reclasificacion">Reclasificación de clase / tipo</option>
                      <option value="fusion">Fusión de activos duplicados</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Motivo justificado</label>
                    <textarea
                      rows={3}
                      value={itemEdicion.motivo || ""}
                      onChange={(e) => setItemEdicion({ ...itemEdicion, motivo: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded"
                      placeholder="Describa el motivo formal que quedará registrado en auditoría..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setModalEdicion({ abierto: false, catalogo: "condicion_fisica", esNuevo: true })}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
              >
                Guardar en borrador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
