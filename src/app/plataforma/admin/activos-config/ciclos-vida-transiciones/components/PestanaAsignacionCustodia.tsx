"use client";

import React, { useState } from "react";

export interface TipoAsignacion {
  id: string;
  nombre: string;
  exige_custodio_persona: boolean;
  exige_fecha_devolucion: boolean;
  exige_aceptacion: boolean;
  duracion_maxima_dias: number;
  activo: boolean;
}

export interface LimiteActivoUsuario {
  tipo_activo: string;
  maximo: number;
  accion: "advertir" | "bloquear";
}

export interface ChecklistItem {
  id: string;
  tarea: string;
  obligatorio: boolean;
}

export interface AsignacionCustodiaData {
  tipos_asignacion?: TipoAsignacion[];
  reglas_custodia?: {
    un_solo_custodio_vigente: boolean;
    limite_activos_por_usuario?: LimiteActivoUsuario[];
    exigir_aceptacion_digital: boolean;
    plazo_aceptacion_dias: number;
    accion_no_acepta: "escalar_supervisor" | "revertir_asignacion";
    recordatorio_prestamo_vencimiento_dias: number;
    permitir_transferencia_directa: boolean;
    accion_usuario_desvinculado: "notificar_gestor_y_crear_tarea" | "solo_notificar" | "bloquear_baja";
    incluir_activos_departamentales_en_selector_incidentes: boolean;
  };
  plantilla_acta_entrega?: {
    titulo: string;
    contenido: string;
    politica_uso_aceptable: string;
  };
  checklist_devolucion?: ChecklistItem[];
}

interface Props {
  datos: AsignacionCustodiaData;
  onChange: (nuevosDatos: AsignacionCustodiaData) => void;
  bloqueado: boolean;
}

export function PestanaAsignacionCustodia({ datos, onChange, bloqueado }: Props) {
  const [subSeccion, setSubSeccion] = useState<"tipos" | "reglas" | "acta" | "checklist">("reglas");
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const tipos: TipoAsignacion[] = datos?.tipos_asignacion || [
    { id: "personal", nombre: "Personal (Individual)", exige_custodio_persona: true, exige_fecha_devolucion: false, exige_aceptacion: true, duracion_maxima_dias: 0, activo: true },
    { id: "compartido", nombre: "Compartido o departamental", exige_custodio_persona: false, exige_fecha_devolucion: false, exige_aceptacion: false, duracion_maxima_dias: 0, activo: true },
    { id: "prestamo_temporal", nombre: "Préstamo temporal", exige_custodio_persona: true, exige_fecha_devolucion: true, exige_aceptacion: true, duracion_maxima_dias: 30, activo: true },
    { id: "ubicacion_servicio", nombre: "A ubicación o servicio técnico", exige_custodio_persona: false, exige_fecha_devolucion: false, exige_aceptacion: false, duracion_maxima_dias: 0, activo: true }
  ];

  const reglas = datos?.reglas_custodia || {
    un_solo_custodio_vigente: true,
    limite_activos_por_usuario: [
      { tipo_activo: "portatil", maximo: 1, accion: "advertir" },
      { tipo_activo: "estacion_trabajo", maximo: 1, accion: "bloquear" }
    ],
    exigir_aceptacion_digital: true,
    plazo_aceptacion_dias: 5,
    accion_no_acepta: "escalar_supervisor",
    recordatorio_prestamo_vencimiento_dias: 3,
    permitir_transferencia_directa: true,
    accion_usuario_desvinculado: "notificar_gestor_y_crear_tarea",
    incluir_activos_departamentales_en_selector_incidentes: true
  };

  const plantilla = datos?.plantilla_acta_entrega || {
    titulo: "Acta Oficial de Entrega y Recepción de Activo Tecnológico",
    contenido: "Por medio de la presente, el colaborador {custodio} declara haber recibido en conformidad el activo {nombre} ({codigo}), con número de serie {serie}, asumiendo la custodia responsable.",
    politica_uso_aceptable: "El custodio se compromete a salvaguardar los activos corporativos según la norma ISO/IEC 27001 A.5.10 y abstenerse de instalar software no homologado."
  };

  const checklist: ChecklistItem[] = datos?.checklist_devolucion || [
    { id: "1", tarea: "Inspección física visual (ausencia de rajaduras o daños por impacto)", obligatorio: true },
    { id: "2", tarea: "Entrega completa de accesorios originales (cargador, cables, periféricos)", obligatorio: true },
    { id: "3", tarea: "Copia de respaldo o purga de datos personales y cierre de sesiones corporativas", obligatorio: true },
    { id: "4", tarea: "Verificación de legibilidad de la etiqueta con código patrimonial", obligatorio: true }
  ];

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const actualizarReglas = (campos: Partial<typeof reglas>) => {
    if (bloqueado) return;
    onChange({
      ...datos,
      reglas_custodia: { ...reglas, ...campos }
    });
  };

  const actualizarPlantilla = (campos: Partial<typeof plantilla>) => {
    if (bloqueado) return;
    onChange({
      ...datos,
      plantilla_acta_entrega: { ...plantilla, ...campos }
    });
  };

  const agregarChecklistItem = () => {
    if (bloqueado) return;
    const nuevo: ChecklistItem = {
      id: String(Date.now()),
      tarea: "Nueva verificación técnica de devolución",
      obligatorio: true
    };
    onChange({
      ...datos,
      checklist_devolucion: [...checklist, nuevo]
    });
  };

  const toggleChecklistObligatorio = (id: string) => {
    if (bloqueado) return;
    const act = checklist.map((c) => (c.id === id ? { ...c, obligatorio: !c.obligatorio } : c));
    onChange({ ...datos, checklist_devolucion: act });
  };

  const eliminarChecklistItem = (id: string) => {
    if (bloqueado) return;
    const act = checklist.filter((c) => c.id !== id);
    onChange({ ...datos, checklist_devolucion: act });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMensaje && (
        <div className="fixed bottom-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium border border-slate-700">
          {toastMensaje}
        </div>
      )}

      {/* Encabezado */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            1.5.2.3 Asignación, custodia y devolución
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gobierna la responsabilidad unipersonal de custodia, aceptación digital, actas y checklist de devolución.
          </p>
        </div>

        {/* Sub-navegación */}
        <div className="flex gap-2 border-b border-slate-200 w-full mt-2 pb-2">
          {[
            { id: "reglas", label: "Reglas de custodia y límites" },
            { id: "tipos", label: "Tipos de asignación" },
            { id: "acta", label: "Plantilla de acta y política de uso" },
            { id: "checklist", label: "Checklist de devolución" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubSeccion(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                subSeccion === tab.id
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Reglas de custodia y límites */}
      {subSeccion === "reglas" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Principios inmutables y de seguridad */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Gobernanza de custodio único y aceptación
              </h4>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={reglas.un_solo_custodio_vigente}
                  disabled={true}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-bold text-indigo-950 block">
                    Un solo custodio vigente por activo (Regla inmutable)
                  </span>
                  <span className="text-indigo-800 text-[11px]">
                    Garantiza la responsabilidad individual patrimonial requerida para el selector "Elemento CMDB" de incidentes.
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reglas.exigir_aceptacion_digital}
                  disabled={bloqueado}
                  onChange={(e) => actualizarReglas({ exigir_aceptacion_digital: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Exigir aceptación digital en plataforma tras la entrega
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    El colaborador recibe notificación y debe confirmar la recepción del equipo.
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3 pl-6">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plazo máximo de aceptación</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={reglas.plazo_aceptacion_dias}
                      disabled={bloqueado}
                      onChange={(e) => actualizarReglas({ plazo_aceptacion_dias: parseInt(e.target.value, 10) })}
                      className="w-20 px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                    <span className="text-slate-600">días</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Acción ante vencimiento</label>
                  <select
                    value={reglas.accion_no_acepta}
                    disabled={bloqueado}
                    onChange={(e) => actualizarReglas({ accion_no_acepta: e.target.value as any })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="escalar_supervisor">Escalar a Supervisor</option>
                    <option value="revertir_asignacion">Revertir asignación a stock</option>
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={reglas.incluir_activos_departamentales_en_selector_incidentes}
                  disabled={bloqueado}
                  onChange={(e) => actualizarReglas({ incluir_activos_departamentales_en_selector_incidentes: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Vínculo con Incidentes: Incluir también activos compartidos del departamento
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Si se activa, el usuario reportante podrá elegir tanto sus activos personales como los compartidos de su área.
                  </span>
                </div>
              </label>
            </div>

            {/* Desvinculación de usuarios y límites */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Desvinculación laboral y límites por colaborador
              </h4>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Acción cuando un usuario se desactiva o deja la organización:
                </label>
                <select
                  value={reglas.accion_usuario_desvinculado}
                  disabled={bloqueado}
                  onChange={(e) => actualizarReglas({ accion_usuario_desvinculado: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="notificar_gestor_y_crear_tarea">
                    Notificar al Gestor de Activos y crear tarea prioritaria de devolución
                  </option>
                  <option value="solo_notificar">Solo enviar notificación con lista de activos pendientes</option>
                  <option value="bloquear_baja">Bloquear baja en módulo de usuarios hasta completar devolución</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Anticipación para recordatorio de préstamo por vencer
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={reglas.recordatorio_prestamo_vencimiento_dias}
                    disabled={bloqueado}
                    onChange={(e) => actualizarReglas({ recordatorio_prestamo_vencimiento_dias: parseInt(e.target.value, 10) })}
                    className="w-20 px-2 py-1 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-600">días antes de la fecha prevista</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Límites máximos de equipos por colaborador:
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  {reglas.limite_activos_por_usuario?.map((lim, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-slate-700 uppercase">{lim.tipo_activo}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Máx: {lim.maximo}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${lim.accion === "bloquear" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                          {lim.accion === "bloquear" ? "Bloquear" : "Advertir"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tipos de asignación */}
      {subSeccion === "tipos" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Modalidad</th>
                <th className="py-2.5 px-3">Exige custodio persona</th>
                <th className="py-2.5 px-3">Exige fecha devolución</th>
                <th className="py-2.5 px-3">Exige aceptación digital</th>
                <th className="py-2.5 px-3">Duración máxima</th>
                <th className="py-2.5 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tipos.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{t.nombre}</td>
                  <td className="py-2.5 px-3">{t.exige_custodio_persona ? "Sí" : "No"}</td>
                  <td className="py-2.5 px-3">{t.exige_fecha_devolucion ? "Obligatoria" : "No aplica"}</td>
                  <td className="py-2.5 px-3">{t.exige_aceptacion ? "Requerida" : "Opcional"}</td>
                  <td className="py-2.5 px-3 font-mono">
                    {t.duracion_maxima_dias > 0 ? `${t.duracion_maxima_dias} días` : "Indefinida"}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Plantilla de acta y política de uso */}
      {subSeccion === "acta" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">Título del documento generado</label>
            <input
              type="text"
              value={plantilla.titulo}
              disabled={bloqueado}
              onChange={(e) => actualizarPlantilla({ titulo: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Texto del acta de entrega (Variables admitidas: {"{custodio}"}, {"{codigo}"}, {"{nombre}"}, {"{serie}"}, {"{fecha}"})
            </label>
            <textarea
              rows={4}
              value={plantilla.contenido}
              disabled={bloqueado}
              onChange={(e) => actualizarPlantilla({ contenido: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Política de uso aceptable de tecnología (ISO/IEC 27001 A.5.10)
            </label>
            <textarea
              rows={3}
              value={plantilla.politica_uso_aceptable}
              disabled={bloqueado}
              onChange={(e) => actualizarPlantilla({ politica_uso_aceptable: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => mostrarToast("Vista previa del Acta de Entrega en PDF generada.")}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100"
            >
              Simular PDF del acta
            </button>
          </div>
        </div>
      )}

      {/* 4. Checklist de devolución */}
      {subSeccion === "checklist" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Checklist obligatorio para devolución de hardware</h4>
              <p className="text-xs text-slate-500">
                Puntos de control exigidos al técnico al recibir el equipo y retornar su estado a stock.
              </p>
            </div>
            <button
              onClick={agregarChecklistItem}
              disabled={bloqueado}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
            >
              + Agregar ítem
            </button>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {checklist.map((item, idx) => (
              <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-white hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 font-bold">{idx + 1}.</span>
                  <span className="font-medium text-slate-800">{item.tarea}</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.obligatorio}
                      disabled={bloqueado}
                      onChange={() => toggleChecklistObligatorio(item.id)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span className="text-slate-600 font-medium">Obligatorio</span>
                  </label>
                  <button
                    onClick={() => eliminarChecklistItem(item.id)}
                    disabled={bloqueado}
                    className="text-red-500 hover:text-red-700 font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
