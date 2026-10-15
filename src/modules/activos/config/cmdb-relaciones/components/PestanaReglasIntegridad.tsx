"use client";

import React, { useState } from "react";

export type SeveridadRegla = "bloquear" | "advertir";

export interface ReglaIntegridadItem {
  id: number;
  nombre: string;
  descripcion: string;
  severidad: SeveridadRegla;
  bloqueado: boolean;
  activa: boolean;
  parametro?: string;
}

export interface ReglasIntegridadData {
  reglas?: ReglaIntegridadItem[];
}

interface Props {
  datos: ReglasIntegridadData;
  onChange: (nuevosDatos: ReglasIntegridadData) => void;
  bloqueado: boolean;
}

interface HallazgoDiagnostico {
  codigo_ci: string;
  nombre_ci: string;
  regla_incumplida: string;
  severidad: SeveridadRegla;
  detalle: string;
}

const HALLAZGOS_MUESTRA: HallazgoDiagnostico[] = [
  {
    codigo_ci: "SRV-002",
    nombre_ci: "Servidor de Base de Datos Nómina",
    regla_incumplida: "Responsable técnico obligatorio en producción",
    severidad: "bloquear",
    detalle: "El CI se encuentra en entorno Producción pero no tiene asignado un responsable técnico resolutor."
  },
  {
    codigo_ci: "APP-014",
    nombre_ci: "Portal Web Institucional",
    regla_incumplida: "Coherencia de criticidad CI vs servicio que soporta",
    severidad: "advertir",
    detalle: "El CI tiene criticidad Media pero soporta directamente el Servicio Crítico 'Operaciones en Línea'."
  }
];

export function PestanaReglasIntegridad({ datos, onChange, bloqueado }: Props) {
  const reglas: ReglaIntegridadItem[] = datos?.reglas || [];

  const [modalDiagnostico, setModalDiagnostico] = useState(false);
  const [ejecutando, setEjecutando] = useState(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const handleToggleActiva = (id: number) => {
    if (bloqueado) return;
    const actualizadas = reglas.map((r) => (r.id === id ? { ...r, activa: !r.activa } : r));
    onChange({ ...datos, reglas: actualizadas });
  };

  const handleChangeSeveridad = (id: number, sev: SeveridadRegla) => {
    if (bloqueado) return;
    const regla = reglas.find((r) => r.id === id);
    if (regla?.bloqueado && sev === "advertir") {
      mostrarToast("Esta regla de integridad es estructural y no puede degradarse a advertencia.");
      return;
    }
    const actualizadas = reglas.map((r) => (r.id === id ? { ...r, severidad: sev } : r));
    onChange({ ...datos, reglas: actualizadas });
  };

  const ejecutarVerificacion = () => {
    setEjecutando(true);
    setTimeout(() => {
      setEjecutando(false);
      setModalDiagnostico(true);
      mostrarToast("Verificación de integridad completada.");
    }, 1200);
  };

  const exportarResultados = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Codigo CI,Nombre CI,Regla Incumplida,Severidad,Detalle\n" +
      HALLAZGOS_MUESTRA.map((h) => `"${h.codigo_ci}","${h.nombre_ci}","${h.regla_incumplida}","${h.severidad}","${h.detalle}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `diagnostico_integridad_cmdb_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarToast("Reporte de hallazgos exportado en formato CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMensaje && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-sm transition-opacity">
          {toastMensaje}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Reglas de Integridad y Coherencia de la CMDB
          </h2>
          <p className="text-sm text-slate-500">
            Controles que impiden inconsistencias en la topología, desvinculación indebida de CIs y omisión de datos obligatorios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportarResultados}
            className="px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-medium rounded-md shadow-sm"
          >
            Exportar resultados
          </button>
          <button
            type="button"
            disabled={ejecutando}
            onClick={ejecutarVerificacion}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm disabled:opacity-50"
          >
            {ejecutando ? "Verificando..." : "Ejecutar verificación ahora"}
          </button>
        </div>
      </div>

      {/* Tabla de 12 Reglas de Integridad */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3 text-center">Nº</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Regla de Integridad</th>
                <th className="px-4 py-3">Descripción y Alcance</th>
                <th className="px-4 py-3 text-center">Severidad de Acción</th>
                <th className="px-4 py-3 text-center">Protección</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reglas.map((regla) => (
                <tr key={regla.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">
                    #{regla.id}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={bloqueado}
                      onClick={() => handleToggleActiva(regla.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        regla.activa
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {regla.activa ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {regla.nombre}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-sm">
                    {regla.descripcion}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      disabled={bloqueado || regla.bloqueado}
                      value={regla.severidad}
                      onChange={(e) => handleChangeSeveridad(regla.id, e.target.value as SeveridadRegla)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                        regla.severidad === "bloquear"
                          ? "bg-rose-50 text-rose-800 border-rose-300"
                          : "bg-amber-50 text-amber-800 border-amber-300"
                      } disabled:opacity-80`}
                    >
                      <option value="bloquear">Bloquear operación</option>
                      <option value="advertir">Advertir al usuario</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {regla.bloqueado ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                        Bloqueada por integridad
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Configurable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Diagnóstico de Violaciones */}
      {modalDiagnostico && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Resultado de Verificación de Integridad de la CMDB
              </h3>
              <button
                type="button"
                onClick={() => setModalDiagnostico(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex justify-between items-center">
              <span>Elementos analizados en la base de datos: <strong>4 elementos de configuración</strong></span>
              <span className="text-amber-700 font-bold">2 hallazgos detectados</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                  <tr>
                    <th className="px-3 py-2">CI Afectado</th>
                    <th className="px-3 py-2">Regla Incumplida</th>
                    <th className="px-3 py-2 text-center">Severidad</th>
                    <th className="px-3 py-2">Detalle de Inconsistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {HALLAZGOS_MUESTRA.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-slate-800 font-bold">
                        <div>{h.codigo_ci}</div>
                        <div className="text-[11px] font-normal text-slate-500">{h.nombre_ci}</div>
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-700">{h.regla_incumplida}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.severidad === "bloquear"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {h.severidad}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{h.detalle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={exportarResultados}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={() => setModalDiagnostico(false)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
