"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ArticuloAdminData {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  contenido_markdown: string;
  id_categoria: number;
  categoria_nombre?: string;
  estado_editorial: string;
  autor_nombre?: string;
  revisor_nombre?: string;
  visitas: number;
  utilidad_positiva: number;
  utilidad_negativa: number;
  veces_utilizado_en_tickets?: number;
  fecha_publicacion?: string;
  fecha_creacion: string;
  version?: number;
}

interface HistorialTransicion {
  id_historial: number;
  estado_anterior?: string;
  estado_nuevo: string;
  comentario?: string;
  usuario_nombre?: string;
  fecha: string;
}

interface VersionItem {
  id_version: number;
  numero_version: string;
  titulo: string;
  contenido_markdown: string;
  motivo_cambio?: string;
  autor_nombre?: string;
  fecha_creacion: string;
}

interface FeedbackItem {
  id_feedback: number;
  es_positivo: boolean;
  motivo_negativo?: string;
  comentario?: string;
  ip?: string;
  fecha: string;
  usuario_nombre?: string;
}

interface VinculoTicketItem {
  id_vinculo: number;
  id_ticket: number;
  codigo_ticket: string;
  ticket_titulo: string;
  resolvio_ticket: boolean;
  fecha_vinculo: string;
  tecnico_nombre?: string;
}

export default function PaginaHistorialArticuloDetallado() {
  const params = useParams();
  const idArticulo = params?.id as string;

  const [articulo, setArticulo] = useState<ArticuloAdminData | null>(null);
  const [historial, setHistorial] = useState<HistorialTransicion[]>([]);
  const [versiones, setVersiones] = useState<VersionItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [vinculos, setVinculos] = useState<VinculoTicketItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarReporte() {
      if (!idArticulo) return;
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/conocimiento/${idArticulo}`);
        if (!res.ok) {
          const d = await res.json().catch(() => null);
          throw new Error(d?.error || "Error al cargar la trazabilidad del artículo.");
        }
        const data = await res.json();
        setArticulo(data.articulo || null);
        setHistorial(data.historial || []);
        setVersiones(data.versiones || []);
        setFeedbacks(data.feedbacks || []);
        setVinculos(data.vinculosTickets || []);
      } catch (err: any) {
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    }
    cargarReporte();
  }, [idArticulo]);

  if (cargando) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 text-center">
        <p className="text-sm font-semibold text-slate-500">
          Cargando informe detallado de trazabilidad y métricas del artículo...
        </p>
      </div>
    );
  }

  if (error || !articulo) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4">
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          {error || "El artículo solicitado no existe o fue retirado."}
        </div>
        <Link
          href="/plataforma/admin/conocimiento-config/articulos"
          className="inline-flex px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
        >
          Volver a la Gestión de Conocimiento
        </Link>
      </div>
    );
  }

  const totalVotos = articulo.utilidad_positiva + articulo.utilidad_negativa;
  const tasaAprobacion = totalVotos > 0 ? Math.round((articulo.utilidad_positiva / totalVotos) * 100) : 100;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Cabecera y Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/plataforma/admin/conocimiento-config/articulos" className="hover:text-blue-600 transition-colors">
              Gestión de Conocimiento
            </Link>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono">{articulo.codigo_articulo}</span>
            <span>/</span>
            <span>Historial y Métricas de Auditoría</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {articulo.titulo}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Categoría: <strong className="text-slate-700 dark:text-slate-300">{articulo.categoria_nombre || "General"}</strong> | Autor: <strong className="text-slate-700 dark:text-slate-300">{articulo.autor_nombre || "Especialista"}</strong> | Versión Actual: <strong className="text-slate-700 dark:text-slate-300">v{articulo.version || 1}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/plataforma/admin/conocimiento-config/articulos/${articulo.id_articulo}/editar`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Editar Artículo
          </Link>
          <Link
            href="/plataforma/admin/conocimiento-config/articulos"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas de Calidad */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Lecturas / Vistas
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {articulo.visitas}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consultas en portal y mesa</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
            Valoraciones Útiles (Likes)
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            +{articulo.utilidad_positiva}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Usuarios que confirmaron solución</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
            Valoraciones Negativas (Dislikes)
          </span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            -{articulo.utilidad_negativa}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Reportes de insatisfacción</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
            Tasa de Aprobación
          </span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {tasaAprobacion}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{totalVotos} votos registrados</p>
        </div>
      </div>

      {/* Sección 1: Registro Detallado de Feedback de Usuarios (Likes / Dislikes y Motivos) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Registro Detallado de Valoraciones y Feedback de Usuarios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historial de votos positivos y motivos de rechazo dejados por solicitantes o técnicos.
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            Aún no se registran calificaciones de retroalimentación detallada para este artículo.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Usuario / Origen</th>
                  <th className="py-2.5 px-3 text-center">Voto</th>
                  <th className="py-2.5 px-3">Motivo de Insatisfacción</th>
                  <th className="py-2.5 px-3">Comentario Textual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {feedbacks.map((f) => (
                  <tr key={f.id_feedback} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {new Date(f.fecha).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {f.usuario_nombre || `IP: ${f.ip || "Autoservicio"}`}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                          f.es_positivo
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        {f.es_positivo ? "ÚTIL (LIKE)" : "NO ÚTIL (DISLIKE)"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {f.motivo_negativo || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 italic max-w-sm">
                      {f.comentario || "Sin comentarios adicionales."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección 2: Historial del Ciclo Editorial de Aprobaciones */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Historial de Decisiones y Transiciones Editoriales
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pista inalterable de auditoría sobre revisiones, aprobaciones, devoluciones y retiros.
          </p>
        </div>

        {historial.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No se registran transiciones de estado en la bitácora editorial.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Estado Previo</th>
                  <th className="py-2.5 px-3">Estado Resultante</th>
                  <th className="py-2.5 px-3">Comentario / Motivo</th>
                  <th className="py-2.5 px-3">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historial.map((h) => (
                  <tr key={h.id_historial} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {new Date(h.fecha).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {h.estado_anterior || "INICIAL"}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                      {h.estado_nuevo}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {h.comentario || "—"}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {h.usuario_nombre || "Sistema"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección 3: Historial de Versiones Técnicas del Artículo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Registro de Versiones Históricas del Contenido
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Snapshots de modificaciones realizadas sobre el título y texto Markdown.
          </p>
        </div>

        {versiones.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            Este artículo se encuentra en su versión inicial sin revisiones secundarias archivadas.
          </p>
        ) : (
          <div className="space-y-3">
            {versiones.map((v) => (
              <div
                key={v.id_version}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      v{v.numero_version}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{v.titulo}</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {new Date(v.fecha_creacion).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Motivo:</strong> {v.motivo_cambio || "Actualización general"} | <strong className="text-slate-700 dark:text-slate-300">Autor:</strong> {v.autor_nombre || "Especialista"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección 4: Tickets de Mesa Resueltos Utilizando este Artículo (Solve Loop) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. Tickets de Soporte Resueltos con este Artículo (KCS Solve Loop)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro de casos operativos de soporte donde los especialistas aplicaron exitosamente esta guía.
          </p>
        </div>

        {vinculos.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            Aún no se registran tickets resueltos formalmente vinculados a este artículo.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Código Ticket</th>
                  <th className="py-2.5 px-3">Asunto del Incidente</th>
                  <th className="py-2.5 px-3">Técnico Resolutor</th>
                  <th className="py-2.5 px-3">Fecha de Solución</th>
                  <th className="py-2.5 px-3 text-center">Efectividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vinculos.map((vk) => (
                  <tr key={vk.id_vinculo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                      {vk.codigo_ticket || `#${vk.id_ticket}`}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {vk.ticket_titulo}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {vk.tecnico_nombre || "Especialista TI"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {new Date(vk.fecha_vinculo).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        RESUELTO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
