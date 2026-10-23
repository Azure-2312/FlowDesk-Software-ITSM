"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Download, Trash2, X } from "@/shared/components/ui/Iconos";

export interface PerfilImportacion {
  id: string;
  nombre: string;
  tipo_activo: string;
  modo: "solo_crear" | "solo_actualizar" | "crear_y_actualizar";
  clave_coincidencia: "codigo_patrimonial" | "numero_serie" | "hostname" | "combinada";
  limite_filas: number;
  manejo_duplicados: "omitir" | "actualizar" | "error";
  estado_inicial_id: string;
  ultima_ejecucion?: string;
  total_importados?: number;
}

export interface ConfiguracionCampania {
  periodicidad: "unica" | "trimestral" | "semestral" | "anual";
  recordatorio_dias: number;
  alcance_tipo: "todas_sedes" | "sedes_seleccionadas" | "muestreo_aleatorio";
  porcentaje_muestreo?: number;
  metodo: "escaneo_qr" | "lista_manual" | "hibrido";
  tolerancia_no_verificado_campanias: number;
  auto_actualizar_ubicacion_si_cambia: boolean;
  cambiar_a_perdido_si_no_aparece: boolean;
  generar_incidente_seguridad_al_perder: boolean;
  accion_sobrante: "crear_activo_provisional" | "solo_reportar" | "ignorar";
  exigir_revision_discrepancias_al_cerrar: boolean;
}

export interface ImportacionInventarioData {
  perfiles_importacion?: PerfilImportacion[];
  configuracion_campania?: ConfiguracionCampania;
  limite_filas_archivo?: number;
  tiempo_reversion_horas?: number;
  clave_coincidencia_defecto?: string;
  modo_importacion_defecto?: string;
  frecuencia_campanias_defecto?: string;
  tolerancia_no_verificado_campanias?: number;
  accion_sobrante?: string;
  generar_incidente_seguridad_al_perder?: boolean;
}

interface Props {
  datos: ImportacionInventarioData;
  onChange: (nuevosDatos: ImportacionInventarioData) => void;
  bloqueado: boolean;
}

const PERFILES_DEFAULT: PerfilImportacion[] = [
  {
    id: "perfil_laptops",
    nombre: "Importación masiva de computadoras portátiles",
    tipo_activo: "portatil",
    modo: "crear_y_actualizar",
    clave_coincidencia: "numero_serie",
    limite_filas: 5000,
    manejo_duplicados: "actualizar",
    estado_inicial_id: "en_stock",
    ultima_ejecucion: "2026-09-15 11:30",
    total_importados: 120
  },
  {
    id: "perfil_servidores",
    nombre: "Carga de servidores y equipos de cómputo central",
    tipo_activo: "servidor_fisico",
    modo: "solo_crear",
    clave_coincidencia: "codigo_patrimonial",
    limite_filas: 1000,
    manejo_duplicados: "error",
    estado_inicial_id: "planificado",
    ultima_ejecucion: "2026-08-20 16:45",
    total_importados: 15
  },
  {
    id: "perfil_switches",
    nombre: "Actualización de switches y equipamiento de red",
    tipo_activo: "switch_red",
    modo: "crear_y_actualizar",
    clave_coincidencia: "hostname",
    limite_filas: 2000,
    manejo_duplicados: "actualizar",
    estado_inicial_id: "en_stock",
    ultima_ejecucion: "2026-09-02 09:15",
    total_importados: 48
  }
];

const CAMPANIA_DEFAULT: ConfiguracionCampania = {
  periodicidad: "trimestral",
  recordatorio_dias: 15,
  alcance_tipo: "todas_sedes",
  porcentaje_muestreo: 100,
  metodo: "escaneo_qr",
  tolerancia_no_verificado_campanias: 2,
  auto_actualizar_ubicacion_si_cambia: true,
  cambiar_a_perdido_si_no_aparece: true,
  generar_incidente_seguridad_al_perder: true,
  accion_sobrante: "crear_activo_provisional",
  exigir_revision_discrepancias_al_cerrar: true
};

export function PestanaImportacionInventario({ datos, onChange, bloqueado }: Props) {
  const [seccionActiva, setSeccionActiva] = useState<"importacion" | "campanias" | "simulador">("importacion");
  const [modalNuevoPerfil, setModalNuevoPerfil] = useState(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const perfiles: PerfilImportacion[] = datos?.perfiles_importacion || PERFILES_DEFAULT;
  const campania: ConfiguracionCampania = datos?.configuracion_campania || {
    ...CAMPANIA_DEFAULT,
    tolerancia_no_verificado_campanias: datos?.tolerancia_no_verificado_campanias || 2,
    generar_incidente_seguridad_al_perder: datos?.generar_incidente_seguridad_al_perder ?? true,
    accion_sobrante: (datos?.accion_sobrante as any) || "crear_activo_provisional"
  };

  const tiempoReversion = datos?.tiempo_reversion_horas ?? 24;
  const limiteFilas = datos?.limite_filas_archivo ?? 5000;

  // Estado para nuevo perfil
  const [nuevoPerfil, setNuevoPerfil] = useState<Partial<PerfilImportacion>>({
    nombre: "",
    tipo_activo: "portatil",
    modo: "crear_y_actualizar",
    clave_coincidencia: "codigo_patrimonial",
    limite_filas: 5000,
    manejo_duplicados: "actualizar",
    estado_inicial_id: "en_stock"
  });

  // Estado de simulación de Dry Run
  const [simulando, setSimulando] = useState(false);
  const [resultadoSimulacion, setResultadoSimulacion] = useState<{
    total: number;
    validos: number;
    advertencias: number;
    errores: number;
    tiempoEstimado: string;
  } | null>(null);

  const mostrarAviso = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const guardarNuevoPerfil = () => {
    if (bloqueado || !nuevoPerfil.nombre) return;
    const creado: PerfilImportacion = {
      id: `perfil_${Date.now()}`,
      nombre: nuevoPerfil.nombre,
      tipo_activo: nuevoPerfil.tipo_activo || "portatil",
      modo: nuevoPerfil.modo || "crear_y_actualizar",
      clave_coincidencia: nuevoPerfil.clave_coincidencia || "codigo_patrimonial",
      limite_filas: nuevoPerfil.limite_filas || 5000,
      manejo_duplicados: nuevoPerfil.manejo_duplicados || "actualizar",
      estado_inicial_id: nuevoPerfil.estado_inicial_id || "en_stock",
      total_importados: 0
    };
    const actualizados = [...perfiles, creado];
    onChange({ ...datos, perfiles_importacion: actualizados });
    setModalNuevoPerfil(false);
    mostrarAviso("Perfil de importación creado y guardado en borrador.");
  };

  const eliminarPerfil = (id: string) => {
    if (bloqueado) return;
    const actualizados = perfiles.filter((p) => p.id !== id);
    onChange({ ...datos, perfiles_importacion: actualizados });
    mostrarAviso("Perfil eliminado del borrador.");
  };

  const actualizarCampania = (campos: Partial<ConfiguracionCampania>) => {
    if (bloqueado) return;
    const nuevaCampania = { ...campania, ...campos };
    onChange({
      ...datos,
      configuracion_campania: nuevaCampania,
      tolerancia_no_verificado_campanias: nuevaCampania.tolerancia_no_verificado_campanias,
      generar_incidente_seguridad_al_perder: nuevaCampania.generar_incidente_seguridad_al_perder,
      accion_sobrante: nuevaCampania.accion_sobrante
    });
  };

  const ejecutarSimulacionDryRun = () => {
    setSimulando(true);
    setResultadoSimulacion(null);
    setTimeout(() => {
      setSimulando(false);
      setResultadoSimulacion({
        total: 150,
        validos: 142,
        advertencias: 5,
        errores: 3,
        tiempoEstimado: "2.4 segundos"
      });
      mostrarAviso("Validación en seco finalizada: 142 filas aptas para procesamiento.");
    }, 1000);
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
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Importación masiva e inventario físico de activos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gobernanza de plantillas de carga masiva, validación previa en seco (Dry Run) y campañas de conteo físico periódico.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalNuevoPerfil(true)}
              disabled={bloqueado}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
            >
              + Nuevo perfil de importación
            </button>
          </div>
        </div>

        {/* Sub-navegación */}
        <div className="flex gap-2 border-b border-slate-200 mt-4 pb-2">
          {[
            { id: "importacion", label: "A. Perfiles y reglas de importación", badge: perfiles.length },
            { id: "campanias", label: "B. Campañas de inventario físico (conteos)", badge: campania.periodicidad },
            { id: "simulador", label: "Simulador de validación en seco (Dry Run)", badge: "Test" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSeccionActiva(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                seccionActiva === tab.id
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  seccionActiva === tab.id ? "bg-indigo-200 text-indigo-800" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* A. Perfiles de importación */}
      {seccionActiva === "importacion" && (
        <div className="space-y-6">
          {/* Parámetros globales de importación */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Parámetros de salvaguarda y reversión
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Límite máximo de filas por archivo (Seguridad operativa)
                </label>
                <input
                  type="number"
                  disabled={bloqueado}
                  value={limiteFilas}
                  onChange={(e) => onChange({ ...datos, limite_filas_archivo: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Valor recomendado de fábrica: 5000 registros por lote.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ventana de tiempo para reversión completa [Deshacer importación]
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    disabled={bloqueado}
                    value={tiempoReversion}
                    onChange={(e) => onChange({ ...datos, tiempo_reversion_horas: parseInt(e.target.value, 10) })}
                    className="w-32 px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-600 font-medium">horas posteriores a la carga</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Permite deshacer la carga si ningún activo fue modificado o transicionado.
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de perfiles */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Perfiles de mapeo configurados</h4>
                <p className="text-xs text-slate-500">
                  Cada perfil enlaza columnas CSV a los atributos específicos del tipo de activo seleccionado.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Nombre del perfil</th>
                    <th className="py-2.5 px-3">Tipo de activo</th>
                    <th className="py-2.5 px-3">Modo de operación</th>
                    <th className="py-2.5 px-3">Clave de coincidencia</th>
                    <th className="py-2.5 px-3">Manejo duplicados</th>
                    <th className="py-2.5 px-3">Última ejecución</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {perfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{p.nombre}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{p.tipo_activo}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.modo === "crear_y_actualizar"
                              ? "bg-indigo-100 text-indigo-800"
                              : p.modo === "solo_crear"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {p.modo === "crear_y_actualizar"
                            ? "Crear y actualizar"
                            : p.modo === "solo_crear"
                            ? "Solo crear"
                            : "Solo actualizar"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{p.clave_coincidencia}</td>
                      <td className="py-2.5 px-3 uppercase text-slate-600">{p.manejo_duplicados}</td>
                      <td className="py-2.5 px-3 text-slate-500">{p.ultima_ejecucion || "Sin ejecuciones"}</td>
                      <td className="py-2 px-3 text-right"><div style={{ display: "inline-flex", gap: 4 }}><BotonIcono variante="normal" icono={<Download size={14} />} titulo="Descargar plantilla CSV" ariaLabel="Descargar plantilla CSV" onClick={() => mostrarAviso(`Descargando plantilla CSV oficial para ${p.nombre}...`)} /><BotonIcono variante="peligro" icono={<Trash2 size={14} />} titulo="Eliminar perfil" ariaLabel="Eliminar perfil" disabled={bloqueado} onClick={() => eliminarPerfil(p.id)} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* B. Campañas de inventario físico */}
      {seccionActiva === "campanias" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-6">
          <div className="pb-3 border-b border-slate-200">
            <h4 className="text-sm font-bold text-slate-800">Reglas de gobernanza para conteos físicos e inventario</h4>
            <p className="text-xs text-slate-500">
              Automatizaciones aplicables al detectar discrepancias en auditorías físicas presenciales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Parámetros de periodicidad y método */}
            <div className="space-y-4">
              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Programación y método de conteo
              </h5>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Periodicidad institucional</label>
                <select
                  value={campania.periodicidad}
                  disabled={bloqueado}
                  onChange={(e) => actualizarCampania({ periodicidad: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="trimestral">Trimestral (Recomendada para activos críticos)</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual (Auditoría fiscal patrimonial)</option>
                  <option value="unica">Campaña única extraordinaria</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Método de recolección en campo</label>
                <select
                  value={campania.metodo}
                  disabled={bloqueado}
                  onChange={(e) => actualizarCampania({ metodo: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="escaneo_qr">Escaneo óptico de QR / Código de barras en vivo</option>
                  <option value="lista_manual">Lista de verificación manual firmada</option>
                  <option value="hibrido">Híbrido (Escaneo con respaldo manual)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alcance geográfico y de muestreo</label>
                <select
                  value={campania.alcance_tipo}
                  disabled={bloqueado}
                  onChange={(e) => actualizarCampania({ alcance_tipo: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="todas_sedes">Todas las sedes y almacenes de la organización (100%)</option>
                  <option value="sedes_seleccionadas">Sedes seleccionadas por campaña</option>
                  <option value="muestreo_aleatorio">Muestreo aleatorio representativo</option>
                </select>
              </div>
            </div>

            {/* Tolerancias y automatizaciones */}
            <div className="space-y-4">
              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Acciones automáticas ante discrepancias
              </h5>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campania.auto_actualizar_ubicacion_si_cambia}
                  disabled={bloqueado}
                  onChange={(e) => actualizarCampania({ auto_actualizar_ubicacion_si_cambia: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Actualizar ubicación física automáticamente si es hallado en otro ambiente
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Si el activo se escanea en un piso u oficina distinta a la registrada, actualiza su ficha y registra la traza.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campania.generar_incidente_seguridad_al_perder}
                  disabled={bloqueado}
                  onChange={(e) => actualizarCampania({ generar_incidente_seguridad_al_perder: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Abrir incidente de seguridad si el activo no se halla tras {campania.tolerancia_no_verificado_campanias} campañas
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Transiciona automáticamente el activo al estado "Perdido o robado" y emite ticket en Gestión de Incidentes.
                  </span>
                </div>
              </label>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Acción ante activo sobrante (No registrado en base de datos)
                </label>
                <select
                  value={campania.accion_sobrante}
                  disabled={bloqueado}
                  onChange={(e) => actualizarCampania({ accion_sobrante: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="crear_activo_provisional">
                    Crear activo provisional con estado "En revisión" y fuente "Inventario Físico"
                  </option>
                  <option value="solo_reportar">Solo reportar en el acta de discrepancias</option>
                  <option value="ignorar">Ignorar durante el cierre</option>
                </select>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campania.exigir_revision_discrepancias_al_cerrar}
                  disabled={bloqueado}
                  onChange={(e) => actualizarCampania({ exigir_revision_discrepancias_al_cerrar: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Exigir revisión y dictamen de discrepancias antes del cierre de campaña
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Genera el Acta Oficial de Cierre de Inventario en PDF firmada por el Gestor.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Simulador de Dry Run */}
      {seccionActiva === "simulador" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h4 className="text-sm font-bold text-slate-800">Simulador de validación en seco (Dry Run)</h4>
            <p className="text-xs text-slate-500">
              Prueba un lote de datos sin escribir en la base de datos real. Analiza unicidad de códigos, series y formatos de IP/MAC.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-700">Lote de prueba precargado:</p>
              <p className="text-xs text-slate-500">150 registros sintéticos de portátiles Lenovo y Dell.</p>
            </div>
            <button
              onClick={ejecutarSimulacionDryRun}
              disabled={simulando}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
            >
              {simulando ? "Ejecutando validación en seco..." : "Ejecutar validación en seco (Dry Run)"}
            </button>
          </div>

          {resultadoSimulacion && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-center">
                  <span className="text-slate-500 block">Total analizados</span>
                  <span className="text-xl font-bold text-slate-800">{resultadoSimulacion.total}</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-emerald-700 block">Válidos (Aptos)</span>
                  <span className="text-xl font-bold text-emerald-800">{resultadoSimulacion.validos}</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                  <span className="text-amber-700 block">Con advertencias</span>
                  <span className="text-xl font-bold text-amber-800">{resultadoSimulacion.advertencias}</span>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
                  <span className="text-red-700 block">Con errores fatales</span>
                  <span className="text-xl font-bold text-red-800">{resultadoSimulacion.errores}</span>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs space-y-1 text-red-800">
                <p className="font-bold">Detalle de errores detectados en la simulación:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Fila #14: Número de serie "PF-48X92K" duplicado con activo existente LAP-2026-000101.</li>
                  <li>Fila #48: Dirección MAC "00:1B:44:11:3A:ZZ" inválida (caracteres no hexadecimales).</li>
                  <li>Fila #102: Hostname "SRV-WEB-01" ya asignado a una máquina virtual en producción.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => mostrarAviso("Descargando informe de discrepancias en CSV...")}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                >
                  Descargar reporte de errores CSV
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear nuevo perfil */}
      {modalNuevoPerfil && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Nuevo perfil de importación masiva</h3>
              <BotonIcono variante="normal" icono={<X size={14} />} titulo="Cerrar modal" ariaLabel="Cerrar modal" onClick={() => setModalNuevoPerfil(false)} />
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre descriptivo del perfil</label>
                <input
                  type="text"
                  value={nuevoPerfil.nombre || ""}
                  onChange={(e) => setNuevoPerfil({ ...nuevoPerfil, nombre: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  placeholder="EJ: Carga de Switches de Borde 2026"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de activo objetivo</label>
                <select
                  value={nuevoPerfil.tipo_activo || "portatil"}
                  onChange={(e) => setNuevoPerfil({ ...nuevoPerfil, tipo_activo: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="portatil">Computadora portátil (Laptop)</option>
                  <option value="servidor_fisico">Servidor físico (Rack/Blade)</option>
                  <option value="switch_red">Switch de red</option>
                  <option value="estacion_trabajo">Estación de trabajo (Desktop)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Modo de procesamiento</label>
                <select
                  value={nuevoPerfil.modo || "crear_y_actualizar"}
                  onChange={(e) => setNuevoPerfil({ ...nuevoPerfil, modo: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="crear_y_actualizar">Crear nuevos y actualizar existentes</option>
                  <option value="solo_crear">Solo crear nuevos (Falla si ya existe)</option>
                  <option value="solo_actualizar">Solo actualizar existentes (Ignora nuevos)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clave de coincidencia para matching</label>
                <select
                  value={nuevoPerfil.clave_coincidencia || "codigo_patrimonial"}
                  onChange={(e) => setNuevoPerfil({ ...nuevoPerfil, clave_coincidencia: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="codigo_patrimonial">Código de activo patrimonial</option>
                  <option value="numero_serie">Número de serie de fabricante</option>
                  <option value="hostname">Hostname de red</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tratamiento de duplicados</label>
                <select
                  value={nuevoPerfil.manejo_duplicados || "actualizar"}
                  onChange={(e) => setNuevoPerfil({ ...nuevoPerfil, manejo_duplicados: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="actualizar">Sobrescribir atributos con datos del archivo</option>
                  <option value="omitir">Omitir fila y continuar procesamiento</option>
                  <option value="error">Detener la importación con error</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setModalNuevoPerfil(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNuevoPerfil}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
              >
                Guardar perfil en borrador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
