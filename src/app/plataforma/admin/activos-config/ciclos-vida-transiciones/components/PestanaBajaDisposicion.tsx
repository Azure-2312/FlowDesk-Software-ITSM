"use client";

import React, { useState } from "react";

export interface MotivoBaja {
  id: string;
  codigo: string;
  nombre: string;
  exige_aprobacion: boolean;
  exige_informe_tecnico: boolean;
  exige_borrado_seguro: boolean;
  exige_denuncia: boolean;
  exige_incidente_seguridad: boolean;
  exige_acta: boolean;
  activo: boolean;
}

export interface DestinoDisposicion {
  id: string;
  nombre: string;
  exige_datos_receptor: boolean;
  exige_monto_venta: boolean;
  exige_certificado: boolean;
}

export interface MetodoBorrado {
  id: string;
  nombre: string;
  aplicable_a: string;
  exige_certificado: boolean;
}

export interface BajaDisposicionData {
  motivos_baja?: MotivoBaja[];
  destinos_disposicion?: DestinoDisposicion[];
  metodos_borrado_seguro?: MetodoBorrado[];
  bloqueos_integridad?: {
    bloquear_si_rfc_abierta: boolean;
    bloquear_si_incidentes_abiertos: boolean;
    bloquear_si_asignacion_vigente: boolean;
    bloquear_si_ci_dependientes_activos: boolean;
  };
  retencion_anios?: number;
}

interface Props {
  datos: BajaDisposicionData;
  onChange: (nuevosDatos: BajaDisposicionData) => void;
  bloqueado: boolean;
}

export function PestanaBajaDisposicion({ datos, onChange, bloqueado }: Props) {
  const [subSeccion, setSubSeccion] = useState<"motivos" | "destinos" | "borrado" | "bloqueos">("motivos");
  const [modalVistaPreviaActa, setModalVistaPreviaActa] = useState(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const motivos: MotivoBaja[] = datos?.motivos_baja || [
    { id: "obsolescencia", codigo: "OBSOLESCENCIA", nombre: "Obsolescencia tecnológica superada", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
    { id: "dano_irreparable", codigo: "DANO_IRREPARABLE", nombre: "Daño físico o siniestro irreparable", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
    { id: "perdida", codigo: "PERDIDA", nombre: "Pérdida o extravío no recuperable", exige_aprobacion: true, exige_informe_tecnico: false, exige_borrado_seguro: false, exige_denuncia: true, exige_incidente_seguridad: true, exige_acta: true, activo: true },
    { id: "robo", codigo: "ROBO", nombre: "Robo o sustracción delictiva", exige_aprobacion: true, exige_informe_tecnico: false, exige_borrado_seguro: false, exige_denuncia: true, exige_incidente_seguridad: true, exige_acta: true, activo: true },
    { id: "venta", codigo: "VENTA", nombre: "Venta patrimonial autorizada", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
    { id: "donacion", codigo: "DONACION", nombre: "Donación social institucional", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
    { id: "devolucion_proveedor", codigo: "DEVOLUCION_PROVEEDOR", nombre: "Devolución por fin de arrendamiento", exige_aprobacion: false, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
    { id: "reciclaje", codigo: "RECICLAJE", nombre: "Reciclaje y chatarrización RAEE", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true }
  ];

  const destinos: DestinoDisposicion[] = datos?.destinos_disposicion || [
    { id: "venta", nombre: "Venta a terceros", exige_datos_receptor: true, exige_monto_venta: true, exige_certificado: false },
    { id: "donacion", nombre: "Donación a entidad sin fines de lucro", exige_datos_receptor: true, exige_monto_venta: false, exige_certificado: true },
    { id: "reciclaje", nombre: "Operador de reciclaje RAEE certificado", exige_datos_receptor: true, exige_monto_venta: false, exige_certificado: true },
    { id: "devolucion_proveedor", nombre: "Retorno al arrendador o proveedor", exige_datos_receptor: true, exige_monto_venta: false, exige_certificado: true },
    { id: "destruccion_certificada", nombre: "Destrucción física certificada", exige_datos_receptor: true, exige_monto_venta: false, exige_certificado: true }
  ];

  const metodosBorrado: MetodoBorrado[] = datos?.metodos_borrado_seguro || [
    { id: "sobrescritura", nombre: "Sobrescritura NIST SP 800-88 / DoD 5220.22-M (3 pasadas)", aplicable_a: "Discos duros mecánicos y SSD", exige_certificado: true },
    { id: "criptografico", nombre: "Borrado criptográfico (Crypto-Erase / Instant Secure Erase)", aplicable_a: "Unidades SED / NVMe SSD", exige_certificado: true },
    { id: "desmagnetizacion", nombre: "Desmagnetización física (Degaussing)", aplicable_a: "Cintas magnéticas y discos mecánicos", exige_certificado: true },
    { id: "destruccion_fisica", nombre: "Trituración mecánica o desintegración", aplicable_a: "Cualquier medio físico con datos", exige_certificado: true }
  ];

  const bloqueos = datos?.bloqueos_integridad || {
    bloquear_si_rfc_abierta: true,
    bloquear_si_incidentes_abiertos: true,
    bloquear_si_asignacion_vigente: true,
    bloquear_si_ci_dependientes_activos: true
  };

  const retencionAnios = datos?.retencion_anios ?? 7;

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const actualizarBloqueos = (campos: Partial<typeof bloqueos>) => {
    if (bloqueado) return;
    onChange({
      ...datos,
      bloqueos_integridad: { ...bloqueos, ...campos }
    });
  };

  const toggleMotivoCampo = (id: string, campo: "exige_aprobacion" | "exige_informe_tecnico" | "exige_borrado_seguro" | "exige_denuncia") => {
    if (bloqueado) return;
    const act = motivos.map((m) => (m.id === id ? { ...m, [campo]: !m[campo] } : m));
    onChange({ ...datos, motivos_baja: act });
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
            1.5.2.6 Baja definitiva y disposición patrimonial
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gobernanza de motivos de baja, borrado seguro obligatorio (ISO 27001), bloqueos de integridad y actas oficiales.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalVistaPreviaActa(true)}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100"
          >
            Vista previa del acta de baja
          </button>
        </div>

        {/* Sub-navegación */}
        <div className="flex gap-2 border-b border-slate-200 w-full mt-2 pb-2">
          {[
            { id: "motivos", label: "Motivos de baja autorizados", badge: motivos.length },
            { id: "destinos", label: "Destinos de disposición", badge: destinos.length },
            { id: "borrado", label: "Borrado seguro de datos (ISO 27001)", badge: metodosBorrado.length },
            { id: "bloqueos", label: "Bloqueos de integridad y retención" }
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
              {tab.badge !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Motivos de baja autorizados */}
      {subSeccion === "motivos" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Motivo justificado</th>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3 text-center">Exige aprobación</th>
                  <th className="py-2.5 px-3 text-center">Informe técnico</th>
                  <th className="py-2.5 px-3 text-center">Borrado seguro</th>
                  <th className="py-2.5 px-3 text-center">Denuncia policial</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {motivos.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{m.nombre}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{m.codigo}</td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={m.exige_aprobacion}
                        disabled={bloqueado}
                        onChange={() => toggleMotivoCampo(m.id, "exige_aprobacion")}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={m.exige_informe_tecnico}
                        disabled={bloqueado}
                        onChange={() => toggleMotivoCampo(m.id, "exige_informe_tecnico")}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={m.exige_borrado_seguro}
                        disabled={bloqueado}
                        onChange={() => toggleMotivoCampo(m.id, "exige_borrado_seguro")}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={m.exige_denuncia}
                        disabled={bloqueado}
                        onChange={() => toggleMotivoCampo(m.id, "exige_denuncia")}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Autorizado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Destinos de disposición */}
      {subSeccion === "destinos" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Destino final del bien</th>
                <th className="py-2.5 px-3">Exige datos del receptor</th>
                <th className="py-2.5 px-3">Exige registro de monto</th>
                <th className="py-2.5 px-3">Exige certificado oficial</th>
                <th className="py-2.5 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {destinos.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{d.nombre}</td>
                  <td className="py-2.5 px-3">{d.exige_datos_receptor ? "Sí (RUC/DNI y Razón Social)" : "No"}</td>
                  <td className="py-2.5 px-3">{d.exige_monto_venta ? "Sí (Monto residual/venta)" : "No aplica"}</td>
                  <td className="py-2.5 px-3">{d.exige_certificado ? "Requerido (Adjunto)" : "Opcional"}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Válido
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Borrado seguro de datos (ISO 27001) */}
      {subSeccion === "borrado" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <span className="font-bold block">Salvaguarda de Seguridad de la Información (ISO/IEC 27001 A.7.14 y A.8.10)</span>
            <span>
              Todo activo clasificado con almacenamiento de datos exige registrar método de borrado, fecha, técnico responsable y certificado o evidencia antes de consumar la transición a "Dado de baja".
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Método técnico homologado</th>
                  <th className="py-2.5 px-3">Medios aplicables</th>
                  <th className="py-2.5 px-3">Certificado / Hash obligatorio</th>
                  <th className="py-2.5 px-3">Gobernanza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {metodosBorrado.map((met) => (
                  <tr key={met.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{met.nombre}</td>
                    <td className="py-2.5 px-3 text-slate-600">{met.aplicable_a}</td>
                    <td className="py-2.5 px-3">
                      {met.exige_certificado ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                          Obligatorio
                        </span>
                      ) : (
                        <span className="text-slate-400">Opcional</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold text-slate-500">Estándar internacional</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Bloqueos de integridad y retención */}
      {subSeccion === "bloqueos" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Bloqueos duros de integridad */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Bloqueos previos al cambio a "Dado de baja"
              </h4>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bloqueos.bloquear_si_rfc_abierta}
                  disabled={bloqueado}
                  onChange={(e) => actualizarBloqueos({ bloquear_si_rfc_abierta: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Bloquear si tiene Solicitudes de Cambio (RFC) abiertas o programadas
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Impide retirar el activo si hay intervenciones técnicas en curso.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bloqueos.bloquear_si_incidentes_abiertos}
                  disabled={bloqueado}
                  onChange={(e) => actualizarBloqueos({ bloquear_si_incidentes_abiertos: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Bloquear si tiene incidentes o problemas abiertos sin resolver
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Exige resolver o desvincular los tickets antes de autorizar la baja patrimonial.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bloqueos.bloquear_si_asignacion_vigente}
                  disabled={bloqueado}
                  onChange={(e) => actualizarBloqueos({ bloquear_si_asignacion_vigente: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Bloquear si mantiene asignación de custodio vigente
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Obliga a ejecutar primero la devolución con su respectivo checklist.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bloqueos.bloquear_si_ci_dependientes_activos}
                  disabled={bloqueado}
                  onChange={(e) => actualizarBloqueos({ bloquear_si_ci_dependientes_activos: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Bloquear si otros CI o servicios críticos dependen de este elemento
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Protege la topología CMDB contra cortes de servicio no planificados.
                  </span>
                </div>
              </label>
            </div>

            {/* Retención inmutable */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Política de retención histórica (No eliminación física)
              </h4>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <p className="text-slate-700">
                  <span className="font-bold block">Regla institucional de auditoría inmutable:</span>
                  Los activos dados de baja <strong>nunca se eliminan físicamente</strong> de la base de datos para preservar la trazabilidad fiscal y forense.
                </p>
                <div className="pt-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Plazo mínimo de retención en consulta histórica
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={retencionAnios}
                      disabled={bloqueado}
                      onChange={(e) => onChange({ ...datos, retencion_anios: parseInt(e.target.value, 10) })}
                      className="w-20 px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                    <span className="text-slate-600">años posteriores a la fecha de baja</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa Acta de Baja */}
      {modalVistaPreviaActa && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                Vista previa: Acta Oficial de Baja y Disposición Patrimonial
              </h3>
              <button onClick={() => setModalVistaPreviaActa(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-serif bg-slate-50/50">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Acta de Baja Técnica y Disposición Final de Activo TI
                </h2>
                <span className="text-[10px] text-slate-500">Expediente N° AB-2026-0042</span>
              </div>

              <p className="text-slate-700 leading-relaxed">
                En la ciudad de Lima, a los 02 días del mes de Octubre de 2026, la Comisión de Gestión de Activos y Configuración certifica que el activo <strong>LAP-2026-000101</strong> (ThinkPad X1 Carbon Gen 11, S/N: PF-48X92K) ha culminado su ciclo de vida útil por causal de <strong>Obsolescencia tecnológica superada</strong>.
              </p>

              <div className="p-3 bg-white rounded border border-slate-200 space-y-1 font-sans text-[11px]">
                <div><span className="font-semibold text-slate-600">Destino autorizado:</span> Operador de reciclaje RAEE certificado</div>
                <div><span className="font-semibold text-slate-600">Método de borrado:</span> Sobrescritura NIST SP 800-88 (Certificado #B-8941)</div>
                <div><span className="font-semibold text-slate-600">Dictamen técnico:</span> Aprobado por Supervisor y Gestor de Activos</div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center font-sans text-[10px]">
                <div className="border-t border-slate-400 pt-1 text-slate-700">Firma del Gestor de Activos y Configuración</div>
                <div className="border-t border-slate-400 pt-1 text-slate-700">Firma de la Autoridad de Aprobación</div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setModalVistaPreviaActa(false)}
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
