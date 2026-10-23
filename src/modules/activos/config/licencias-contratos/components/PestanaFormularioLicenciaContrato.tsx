"use client";

import React, { useState } from "react";

export interface CampoEntidad {
  id: string;
  etiqueta: string;
  seccion: string;
  obligatorio: boolean;
  bloqueado: boolean;
  visible?: boolean;
}

export interface FormularioLicenciaContratoData {
  campos_licencia?: CampoEntidad[];
  campos_contrato?: CampoEntidad[];
}

interface Props {
  datos: FormularioLicenciaContratoData;
  onChange: (nuevosDatos: FormularioLicenciaContratoData) => void;
  bloqueado: boolean;
}

export function PestanaFormularioLicenciaContrato({ datos, onChange, bloqueado }: Props) {
  const [formularioActivo, setFormularioActivo] = useState<"licencia" | "contrato">("licencia");

  const camposLicencia = datos?.campos_licencia || [
    { id: "codigo_licencia", etiqueta: "Código de licencia", seccion: "identificacion", obligatorio: true, bloqueado: true, visible: true },
    { id: "nombre_producto", etiqueta: "Nombre del producto", seccion: "identificacion", obligatorio: true, bloqueado: true, visible: true },
    { id: "fabricante", etiqueta: "Fabricante / Editor", seccion: "identificacion", obligatorio: true, bloqueado: false, visible: true },
    { id: "tipo_licencia_id", etiqueta: "Tipo de licencia", seccion: "identificacion", obligatorio: true, bloqueado: true, visible: true },
    { id: "metrica_id", etiqueta: "Métrica de licenciamiento", seccion: "identificacion", obligatorio: true, bloqueado: true, visible: true },
    { id: "cantidad_adquirida", etiqueta: "Cantidad adquirida", seccion: "derechos", obligatorio: true, bloqueado: true, visible: true },
    { id: "clave_serial", etiqueta: "Clave de activación (Sensible)", seccion: "derechos", obligatorio: false, bloqueado: false, visible: true },
    { id: "fecha_adquisicion", etiqueta: "Fecha de adquisición", seccion: "vigencia", obligatorio: false, bloqueado: false, visible: true },
    { id: "fecha_vencimiento", etiqueta: "Fecha de vencimiento", seccion: "vigencia", obligatorio: false, bloqueado: false, visible: true },
    { id: "contrato_id", etiqueta: "Contrato asociado (Módulo 8)", seccion: "finanzas", obligatorio: false, bloqueado: false, visible: true },
    { id: "responsable_id", etiqueta: "Responsable de la licencia", seccion: "responsabilidad", obligatorio: true, bloqueado: false, visible: true }
  ];

  const camposContrato = datos?.campos_contrato || [
    { id: "numero_contrato", etiqueta: "Número de contrato", seccion: "identificacion", obligatorio: true, bloqueado: true, visible: true },
    { id: "titulo", etiqueta: "Título del contrato", seccion: "identificacion", obligatorio: true, bloqueado: true, visible: true },
    { id: "tipo_contrato_id", etiqueta: "Tipo de contrato", seccion: "identificacion", obligatorio: true, bloqueado: true, visible: true },
    { id: "proveedor_id", etiqueta: "Proveedor adjudicado", seccion: "identificacion", obligatorio: true, bloqueado: true, visible: true },
    { id: "fecha_inicio", etiqueta: "Fecha de inicio", seccion: "vigencia", obligatorio: true, bloqueado: true, visible: true },
    { id: "fecha_fin", etiqueta: "Fecha de fin de vigencia", seccion: "vigencia", obligatorio: true, bloqueado: true, visible: true },
    { id: "monto_total", etiqueta: "Monto económico", seccion: "economico", obligatorio: false, bloqueado: false, visible: true },
    { id: "moneda", etiqueta: "Moneda de facturación", seccion: "economico", obligatorio: true, bloqueado: false, visible: true },
    { id: "responsable_id", etiqueta: "Responsable del contrato", seccion: "responsabilidad", obligatorio: true, bloqueado: false, visible: true }
  ];

  const toggleObligatorio = (id: string) => {
    if (bloqueado) return;
    if (formularioActivo === "licencia") {
      const act = camposLicencia.map((c) => (c.id === id && !c.bloqueado ? { ...c, obligatorio: !c.obligatorio } : c));
      onChange({ ...datos, campos_licencia: act });
    } else {
      const act = camposContrato.map((c) => (c.id === id && !c.bloqueado ? { ...c, obligatorio: !c.obligatorio } : c));
      onChange({ ...datos, campos_contrato: act });
    }
  };

  const toggleVisible = (id: string) => {
    if (bloqueado) return;
    if (formularioActivo === "licencia") {
      const act = camposLicencia.map((c) => (c.id === id && !c.bloqueado ? { ...c, visible: c.visible === false ? true : false } : c));
      onChange({ ...datos, campos_licencia: act });
    } else {
      const act = camposContrato.map((c) => (c.id === id && !c.bloqueado ? { ...c, visible: c.visible === false ? true : false } : c));
      onChange({ ...datos, campos_contrato: act });
    }
  };

  const listaActual = formularioActivo === "licencia" ? camposLicencia : camposContrato;

  return (
    <div className="space-y-6">
      {/* Encabezado y selector de formulario */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Configuración de formularios de licencias y contratos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalización de obligatoriedad, visibilidad y reglas de consistencia de captura de datos.
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-semibold">
          <button
            onClick={() => setFormularioActivo("licencia")}
            className={`px-3 py-1 rounded-md transition-colors ${
              formularioActivo === "licencia" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Formulario: Licencia de Software (SAM)
          </button>
          <button
            onClick={() => setFormularioActivo("contrato")}
            className={`px-3 py-1 rounded-md transition-colors ${
              formularioActivo === "contrato" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Formulario: Contrato TI con Proveedor
          </button>
        </div>
      </div>

      {/* Lista de campos del formulario seleccionado */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Esquema de campos para: {formularioActivo === "licencia" ? "Licencia de Software" : "Contrato TI"}
            </h4>
            <p className="text-xs text-slate-500">
              Los campos con candado son estructurales de fábrica y no pueden ocultarse ni omitirse.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Etiqueta de campo</th>
                <th className="py-2.5 px-3">Identificador interno</th>
                <th className="py-2.5 px-3">Sección del formulario</th>
                <th className="py-2.5 px-3 text-center">Obligatorio</th>
                <th className="py-2.5 px-3 text-center">Visible</th>
                <th className="py-2.5 px-3">Gobernanza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {listaActual.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{c.etiqueta}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{c.id}</td>
                  <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-slate-600">{c.seccion}</td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={c.obligatorio}
                      disabled={c.bloqueado || bloqueado}
                      onChange={() => toggleObligatorio(c.id)}
                      className="rounded border-slate-300 text-indigo-600 disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={c.visible !== false}
                      disabled={c.bloqueado || bloqueado}
                      onChange={() => toggleVisible(c.id)}
                      className="rounded border-slate-300 text-indigo-600 disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    {c.bloqueado ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                        Bloqueado (Estructural)
                      </span>
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
    </div>
  );
}
