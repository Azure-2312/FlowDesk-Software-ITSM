"use client";

import { Ticket } from "@/types";

interface Props {
  ticket: Ticket;
}

export default function StepperProgresoConsumidor({ ticket }: Props) {
  // Determinar etapa actual (1 a 4)
  // 1: Registrado / Abierto (id_estado === 1)
  // 2: En Aprobación (estado_aprobacion === "PENDIENTE_APROBACION" o id_estado === 2 sin aprobacion completada)
  // 3: En Proceso / En Espera (id_estado === 3 o id_estado === 4)
  // 4: Resuelto / Cerrado (id_estado === 5 o id_estado === 6)
  let pasoActual = 1;
  const requiereAprobacion = ticket.estado_aprobacion !== "NO_APLICA";

  if (ticket.id_estado === 5 || ticket.id_estado === 6) {
    pasoActual = 4;
  } else if (ticket.id_estado === 3 || ticket.id_estado === 4) {
    pasoActual = 3;
  } else if (ticket.estado_aprobacion === "PENDIENTE_APROBACION") {
    pasoActual = 2;
  } else if (ticket.id_estado === 2) {
    pasoActual = requiereAprobacion && ticket.estado_aprobacion !== "APROBADO" ? 2 : 3;
  } else {
    pasoActual = 1;
  }

  const etapas = [
    {
      numero: 1,
      titulo: "Solicitud Registrada",
      subtitulo: "Recibida en la Mesa de Ayuda",
    },
    {
      numero: 2,
      titulo: "Revision y Aprobacion",
      subtitulo: requiereAprobacion ? (ticket.estado_aprobacion === "APROBADO" ? "Aprobado por Jefatura" : ticket.estado_aprobacion === "RECHAZADO" ? "Rechazado" : "Pendiente de Visto Bueno") : "No requiere autorizacion",
      omitido: !requiereAprobacion,
    },
    {
      numero: 3,
      titulo: "Atencion en Curso",
      subtitulo: ticket.id_estado === 4 ? "En espera de informacion" : ticket.tecnico_nombre ? `Atendido por ${ticket.tecnico_nombre}` : "Asignando especialista",
    },
    {
      numero: 4,
      titulo: "Servicio Resuelto",
      subtitulo: ticket.id_estado === 6 ? "Confirmado y Cerrado" : ticket.id_estado === 5 ? "Solucion disponible para validacion" : "Pendiente de finalizacion",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "transparent",
        borderBottom: "1px solid #f1f5f9",
        padding: "4px 0 14px 0",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          gap: 8,
        }}
      >
        {etapas.map((etapa) => {
          const esCompletado = pasoActual > etapa.numero || (pasoActual === 4 && etapa.numero === 4);
          const esActivo = pasoActual === etapa.numero && pasoActual !== 4;
          const esRechazado = etapa.numero === 2 && ticket.estado_aprobacion === "RECHAZADO";

          return (
            <div
              key={etapa.numero}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                flex: 1,
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: esRechazado
                    ? "#ef4444"
                    : esCompletado
                    ? "#10b981"
                    : esActivo
                    ? "#2563eb"
                    : "#f1f5f9",
                  color: esCompletado || esActivo || esRechazado ? "#ffffff" : "#64748b",
                  border: esCompletado || esActivo || esRechazado ? "none" : "1px solid #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 11,
                  marginBottom: 6,
                  boxShadow: esActivo ? "0 0 0 3px rgba(37, 99, 235, 0.15)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {esRechazado ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : esCompletado ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  etapa.numero
                )}
              </div>
              <strong
                style={{
                  fontSize: 12,
                  color: esRechazado ? "#b91c1c" : esActivo ? "#1e40af" : esCompletado ? "#065f46" : "#475569",
                  lineHeight: 1.25,
                }}
              >
                {etapa.titulo}
              </strong>
              <span
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  marginTop: 2,
                  lineHeight: 1.2,
                  maxWidth: 160,
                }}
              >
                {etapa.subtitulo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
