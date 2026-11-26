"use client";

import { useEffect, useState } from "react";
import { DatosInformeSupervision } from "../services/informeSupervisionService";

export default function VistaInformeSupervision() {
  const [data, setData] = useState<DatosInformeSupervision | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarInforme() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/reportes/supervision?_t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError("No se pudo cargar el informe de supervisión.");
      }
    } catch {
      setError("Error de conexión al cargar el informe de supervisión.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarInforme();
  }, []);

  function handleImprimir() {
    window.print();
  }

  if (cargando) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#334155", fontFamily: "sans-serif" }}>
        Generando informe ejecutivo de supervisión operativa...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: 24, backgroundColor: "#ffffff", border: "1px solid #000000", margin: 20, color: "#000000" }}>
        <p><strong>Error al generar reporte:</strong> {error || "Datos no disponibles."}</p>
        <button className="boton-secundario" onClick={cargarInforme} >
          Reintentar
        </button>
      </div>
    );
  }

  const { metadatos, resumenTickets, slaOla, tecnicos, equiposModulos, gestoresArea, actividadesRecientes, auditorias } = data;

  return (
    <div className="contenedor-informe-empresarial">
      <style>{`
        @media screen {
          .contenedor-informe-empresarial {
            max-width: 1200px;
            margin: 20px auto;
            padding: 36px 48px;
            background: #ffffff;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
          }
          .barra-acciones-impresion {
            display: flex;
            justifyContent: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #cbd5e1;
          }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 10.5pt !important;
          }
          .barra-acciones-impresion, header, nav, aside, .sidebar, .no-print {
            display: none !important;
          }
          .contenedor-informe-empresarial {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .bloque-seccion {
            page-break-inside: avoid;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
        .tabla-formal {
          width: 100%;
          border-collapse: collapse;
          font-size: 11.5px;
          color: #000000;
          margin-top: 8px;
          margin-bottom: 20px;
        }
        .tabla-formal th {
          background-color: #f1f5f9;
          border: 1px solid #000000;
          padding: 6px 8px;
          text-align: left;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.3px;
        }
        .tabla-formal td {
          border: 1px solid #000000;
          padding: 6px 8px;
          vertical-align: top;
        }
        .tabla-formal tr:nth-child(even) {
          background-color: #fafafa;
        }
        .titulo-seccion-formal {
          font-size: 13.5px;
          font-weight: 800;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 22px 0 6px 0;
          padding-bottom: 4px;
          border-bottom: 1.5px solid #000000;
        }
      `}</style>

      {/* Barra de Control de Impresión (oculta al imprimir) */}
      <div className="barra-acciones-impresion no-print">
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
            Módulo de Reportes Oficiales · ITIL v4
          </span>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Informe Ejecutivo de Supervisión Operativa de TI
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="boton-secundario"
            type="button"
            onClick={cargarInforme}
          >
            Actualizar Datos
          </button>
          <button className="boton-primario"
            type="button"
            onClick={handleImprimir}
          >
            Imprimir Documento / Guardar como PDF
          </button>
        </div>
      </div>

      {/* Membrete Corporativo Formal */}
      <div style={{ borderBottom: "2px solid #000000", paddingBottom: 14, marginBottom: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: "top" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {metadatos.organizacion}
                </div>
                <h1 className="titulo-pagina">
                  Informe de Supervisión y Rendimiento Operativo de TI
                </h1>
                <div style={{ fontSize: 11, color: "#334155" }}>
                  Evaluación consolidada de equipos técnicos, acuerdos SLA/OLA, actividades y gestores de área
                </div>
              </td>
              <td style={{ verticalAlign: "top", textAlign: "right", fontSize: 11, lineHeight: 1.5, color: "#000000" }}>
                <div><strong>Fecha de Emisión:</strong> {metadatos.fecha_emision}</div>
                <div><strong>Supervisor Responsable:</strong> {metadatos.supervisor_nombre}</div>
                <div><strong>Contacto Institucional:</strong> {metadatos.supervisor_correo}</div>
                <div><strong>Plataforma:</strong> {metadatos.version_sistema}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sección 1: Estadísticas Generales de Tickets */}
      <div className="bloque-seccion">
        <div className="titulo-seccion-formal">
          1. Resumen Estadístico de Tickets (Mesa de Servicio)
        </div>
        <table className="tabla-formal">
          <thead>
            <tr>
              <th>Total Registrados</th>
              <th>En Curso / Abiertos</th>
              <th>Resueltos</th>
              <th>Cancelados</th>
              <th>Incidentes</th>
              <th>Solicitudes</th>
              <th>P1 (Crítica)</th>
              <th>P2 (Alta)</th>
              <th>P3 (Media)</th>
              <th>P4 (Baja)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 700, textAlign: "center" }}>{resumenTickets.total}</td>
              <td style={{ textAlign: "center" }}>{resumenTickets.abiertos}</td>
              <td style={{ textAlign: "center", fontWeight: 700 }}>{resumenTickets.resueltos}</td>
              <td style={{ textAlign: "center" }}>{resumenTickets.cancelados}</td>
              <td style={{ textAlign: "center" }}>{resumenTickets.incidentes}</td>
              <td style={{ textAlign: "center" }}>{resumenTickets.solicitudes}</td>
              <td style={{ textAlign: "center", fontWeight: 700 }}>{resumenTickets.p1_criticos}</td>
              <td style={{ textAlign: "center" }}>{resumenTickets.p2_altos}</td>
              <td style={{ textAlign: "center" }}>{resumenTickets.p3_medios}</td>
              <td style={{ textAlign: "center" }}>{resumenTickets.p4_bajos}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sección 2: Métricas de Acuerdos de Nivel de Servicio (SLA) y Nivel Operativo (OLA) */}
      <div className="bloque-seccion">
        <div className="titulo-seccion-formal">
          2. Cumplimiento de Acuerdos de Nivel de Servicio (SLA) y Nivel Operativo (OLA)
        </div>
        <table className="tabla-formal">
          <thead>
            <tr>
              <th>Indicador de Cumplimiento</th>
              <th>Objetivo Institucional</th>
              <th>Resultado Obtenido</th>
              <th>Casos en Riesgo (4h)</th>
              <th>Incumplimientos</th>
              <th>Evaluación Cualitativa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SLA - Tiempo de Primera Respuesta</td>
              <td>≥ 95.0%</td>
              <td style={{ fontWeight: 700 }}>{slaOla.cumplimiento_respuesta_pct}%</td>
              <td style={{ textAlign: "center" }}>—</td>
              <td style={{ textAlign: "center" }}>0</td>
              <td>Cumple estándar contractual</td>
            </tr>
            <tr>
              <td>SLA - Tiempo de Resolución Final</td>
              <td>≥ 90.0%</td>
              <td style={{ fontWeight: 700 }}>{slaOla.cumplimiento_resolucion_pct}%</td>
              <td style={{ textAlign: "center" }}>{slaOla.tickets_en_riesgo}</td>
              <td style={{ textAlign: "center" }}>{slaOla.tickets_vencidos}</td>
              <td>{slaOla.tickets_vencidos === 0 ? "Adherencia óptima" : "Monitoreo continuo requerido"}</td>
            </tr>
            <tr>
              <td>OLA - Transferencia Interdepartamental</td>
              <td>≤ 4.0 horas</td>
              <td style={{ fontWeight: 700 }}>{slaOla.ola_promedio_horas} hrs</td>
              <td style={{ textAlign: "center" }}>—</td>
              <td style={{ textAlign: "center" }}>—</td>
              <td>Cumplimiento operativo del {slaOla.cumplimiento_ola_pct}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sección 3: Rendimiento y Estadísticas Individuales por Técnico */}
      <div className="bloque-seccion">
        <div className="titulo-seccion-formal">
          3. Desempeño y Productividad Individual por Especialista Técnico
        </div>
        {tecnicos.length === 0 ? (
          <p style={{ fontSize: 11, fontStyle: "italic", margin: "6px 0 16px 0" }}>No se registran técnicos adscritos en el período evaluado.</p>
        ) : (
          <table className="tabla-formal">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Nombre del Técnico</th>
                <th>Correo Institucional</th>
                <th>Departamento TI</th>
                <th>Asignados</th>
                <th>Resueltos</th>
                <th>Cancelados</th>
                <th>En Atención</th>
                <th>Promedio Hrs</th>
                <th>SLA Cumplido</th>
                <th>Satisfacción (CSAT)</th>
              </tr>
            </thead>
            <tbody>
              {tecnicos.map((t) => (
                <tr key={t.id_usuario}>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{t.nivel}</td>
                  <td style={{ fontWeight: 600 }}>{t.nombre}</td>
                  <td>{t.correo}</td>
                  <td>{t.departamento}</td>
                  <td style={{ textAlign: "center" }}>{t.asignados}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{t.resueltos}</td>
                  <td style={{ textAlign: "center" }}>{t.cancelados}</td>
                  <td style={{ textAlign: "center" }}>{t.en_atencion}</td>
                  <td style={{ textAlign: "center" }}>{t.horas_promedio !== null ? `${t.horas_promedio}h` : "—"}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{t.cumplimiento_sla_pct}%</td>
                  <td style={{ textAlign: "center" }}>{t.csat_promedio ? `${t.csat_promedio} / 5.0` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sección 4: Equipos de Trabajo de los Distintos Módulos */}
      <div className="bloque-seccion">
        <div className="titulo-seccion-formal">
          4. Estructura de Equipos de Trabajo por Módulo Operativo
        </div>
        {equiposModulos.length === 0 ? (
          <p style={{ fontSize: 11, fontStyle: "italic", margin: "6px 0 16px 0" }}>No se registran equipos estructurados.</p>
        ) : (
          <table className="tabla-formal">
            <thead>
              <tr>
                <th>Módulo de Operación</th>
                <th>Código Equipo</th>
                <th>Nombre del Departamento TI</th>
                <th>Supervisor Responsable</th>
                <th>Especialistas Asignados</th>
                <th>Casos Activos en Curso</th>
              </tr>
            </thead>
            <tbody>
              {equiposModulos.map((em, idx) => (
                <tr key={`${em.modulo}-${em.codigo_depto}-${idx}`}>
                  <td style={{ fontWeight: 700 }}>{em.modulo}</td>
                  <td style={{ textAlign: "center" }}>{em.codigo_depto}</td>
                  <td>{em.departamento}</td>
                  <td>{em.supervisor}</td>
                  <td style={{ textAlign: "center" }}>{em.total_especialistas} técnicos</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{em.casos_activos} casos</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sección 5: Directorio Institucional de Gestores de Área */}
      <div className="bloque-seccion">
        <div className="titulo-seccion-formal">
          5. Relación Institucional de Áreas de Negocio y Gestores Designados
        </div>
        {gestoresArea.length === 0 ? (
          <p style={{ fontSize: 11, fontStyle: "italic", margin: "6px 0 16px 0" }}>No se registran gestores de área configurados.</p>
        ) : (
          <table className="tabla-formal">
            <thead>
              <tr>
                <th>Código Área</th>
                <th>Departamento / Área de la Empresa</th>
                <th>Gestor de Área Designado</th>
                <th>Correo Electrónico Institucional</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {gestoresArea.map((g) => (
                <tr key={g.id_departamento_empresa}>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{g.codigo}</td>
                  <td style={{ fontWeight: 600 }}>{g.nombre_area}</td>
                  <td>{g.gestor_nombre}</td>
                  <td>{g.gestor_correo}</td>
                  <td style={{ textAlign: "center" }}>{g.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sección 6: Relación de Actividades y Tareas Realizadas por los Técnicos */}
      <div className="bloque-seccion">
        <div className="titulo-seccion-formal">
          6. Bitácora de Actividades y Acciones Operativas Recientes Realizadas por Técnicos
        </div>
        {actividadesRecientes.length === 0 ? (
          <p style={{ fontSize: 11, fontStyle: "italic", margin: "6px 0 16px 0" }}>Sin registro de actividades en la bitácora del sistema.</p>
        ) : (
          <table className="tabla-formal">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Técnico Responsable</th>
                <th>Módulo</th>
                <th>Acción Ejecutada</th>
                <th>Descripción y Detalle Operativo</th>
              </tr>
            </thead>
            <tbody>
              {actividadesRecientes.map((act) => (
                <tr key={act.id_log}>
                  <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>{act.fecha}</td>
                  <td style={{ fontWeight: 600 }}>{act.tecnico}</td>
                  <td>{act.modulo}</td>
                  <td style={{ fontWeight: 600 }}>{act.accion}</td>
                  <td>{act.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sección 7: Resultados de Auditorías del Sistema */}
      <div className="bloque-seccion">
        <div className="titulo-seccion-formal">
          7. Resultados y Dictámenes de Auditorías del Sistema
        </div>
        {auditorias.length === 0 ? (
          <p style={{ fontSize: 11, fontStyle: "italic", margin: "6px 0 16px 0" }}>No se han emitido informes formales de auditoría en el período.</p>
        ) : (
          <table className="tabla-formal">
            <thead>
              <tr>
                <th>Código Auditoría</th>
                <th>Título del Informe</th>
                <th>Período Evaluado</th>
                <th>Hallazgos Identificados</th>
                <th>Recomendaciones / Acciones</th>
                <th>Estado / Dictamen</th>
              </tr>
            </thead>
            <tbody>
              {auditorias.map((aud) => (
                <tr key={aud.id_informe}>
                  <td style={{ fontWeight: 700, textAlign: "center" }}>{aud.codigo_informe}</td>
                  <td style={{ fontWeight: 600 }}>{aud.titulo}</td>
                  <td style={{ textAlign: "center" }}>{aud.periodo}</td>
                  <td>{aud.hallazgos}</td>
                  <td>{aud.recomendaciones}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{aud.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sección 8: Firmas de Conformidad Institucional */}
      <div className="bloque-seccion" style={{ marginTop: 40, paddingTop: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ width: "45%", textAlign: "center", borderTop: "1px solid #000000", padding: "8px 0" }}>
                <div style={{ fontWeight: 700, fontSize: 11.5, color: "#000000" }}>{metadatos.supervisor_nombre}</div>
                <div style={{ fontSize: 10.5, color: "#334155" }}>Supervisor del Área de Tecnologías de Información</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>FlowDesk ITIL v4 Service Desk Management</div>
              </td>
              <td style={{ width: "10%" }}></td>
              <td style={{ width: "45%", textAlign: "center", borderTop: "1px solid #000000", padding: "8px 0" }}>
                <div style={{ fontWeight: 700, fontSize: 11.5, color: "#000000" }}>Dirección de Tecnología & Transformación Digital</div>
                <div style={{ fontSize: 10.5, color: "#334155" }}>Conformidad Institucional de Operaciones</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>Fecha de Recepción y Archivo</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
