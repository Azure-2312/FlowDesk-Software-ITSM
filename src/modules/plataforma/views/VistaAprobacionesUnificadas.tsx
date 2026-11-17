"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VistaTicketsGestionAprobaciones from "@/modules/tickets/gestion/aprobaciones/VistaTicketsGestionAprobaciones";
import VistaAprobacionesCambios from "@/modules/cambios/views/VistaAprobacionesCambios";
import VistaAprobacionesTecnicas from "@/modules/cambios/views/VistaAprobacionesTecnicas";
import VistaAprobacionesNegocio from "@/modules/solicitudes/views/VistaAprobacionesNegocio";
import VistaBajasActivos from "@/modules/activos/views/VistaBajasActivos";

type TipoAprobacion = "solicitud" | "cambio" | "cambio-tecnica" | "cambio-negocio" | "baja";

interface TipoConfig {
  id: TipoAprobacion;
  titulo: string;
  descripcion: string;
  urlApi: string;
}

const CONFIG_TIPOS: TipoConfig[] = [
  {
    id: "solicitud",
    titulo: "Solicitudes de servicio",
    descripcion: "Requerimientos y solicitudes de usuarios pendientes de autorización",
    urlApi: "/api/aprobaciones",
  },
  {
    id: "cambio",
    titulo: "Cambios (CAB)",
    descripcion: "Solicitudes de cambio en evaluación por el comité de cambios",
    urlApi: "/api/cambios/aprobaciones",
  },
  {
    id: "cambio-tecnica",
    titulo: "Cambios - Evaluación técnica",
    descripcion: "Cambios técnicos pendientes de visto bueno de supervisión",
    urlApi: "/api/cambios/aprobaciones/tecnicas",
  },
  {
    id: "cambio-negocio",
    titulo: "Cambios - V°B° de área",
    descripcion: "Cambios que afectan sistemas del área del gestor",
    urlApi: "/api/cambios/area/aprobaciones",
  },
  {
    id: "baja",
    titulo: "Bajas de activos",
    descripcion: "Solicitudes de retiro o baja de equipamiento y activos",
    urlApi: "/api/activos/bajas/aprobaciones",
  },
];

export default function VistaAprobacionesUnificadas({ tipoInicial }: { tipoInicial?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoQuery = (searchParams?.get("tipo") || tipoInicial || "") as TipoAprobacion;

  const [conteos, setConteos] = useState<Record<TipoAprobacion, number>>({
    solicitud: 0,
    cambio: 0,
    "cambio-tecnica": 0,
    "cambio-negocio": 0,
    baja: 0,
  });
  const [disponibles, setDisponibles] = useState<Record<TipoAprobacion, boolean>>({
    solicitud: false,
    cambio: false,
    "cambio-tecnica": false,
    "cambio-negocio": false,
    baja: false,
  });
  const [cargandoConteos, setCargandoConteos] = useState(true);
  const [tipoActivo, setTipoActivo] = useState<TipoAprobacion>("solicitud");

  useEffect(() => {
    let activo = true;

    async function cargarConteos() {
      setCargandoConteos(true);
      const nuevosConteos: Record<TipoAprobacion, number> = {
        solicitud: 0,
        cambio: 0,
        "cambio-tecnica": 0,
        "cambio-negocio": 0,
        baja: 0,
      };
      const nuevosDisponibles: Record<TipoAprobacion, boolean> = {
        solicitud: false,
        cambio: false,
        "cambio-tecnica": false,
        "cambio-negocio": false,
        baja: false,
      };

      const promesas = CONFIG_TIPOS.map(async (cfg) => {
        try {
          const res = await fetch(`${cfg.urlApi}?_t=${Date.now()}`);
          if (res.ok) {
            const data = await res.json();
            nuevosDisponibles[cfg.id] = true;
            if (cfg.id === "solicitud") {
              nuevosConteos[cfg.id] = Array.isArray(data.tickets) ? data.tickets.length : 0;
            } else {
              nuevosConteos[cfg.id] = Array.isArray(data) ? data.length : 0;
            }
          } else if (res.status !== 403 && res.status !== 401) {
            // Si no fue error de permisos, asumimos disponible con 0
            nuevosDisponibles[cfg.id] = true;
          }
        } catch {
          // Ignorar error de red individual
        }
      });

      await Promise.allSettled(promesas);

      if (activo) {
        setConteos(nuevosConteos);
        setDisponibles(nuevosDisponibles);
        setCargandoConteos(false);

        // Resolver tipo activo
        if (tipoQuery && nuevosDisponibles[tipoQuery]) {
          setTipoActivo(tipoQuery);
        } else {
          // Seleccionar primer tipo disponible con items pendientes, o el primer disponible
          const primerConPendientes = CONFIG_TIPOS.find(
            (c) => nuevosDisponibles[c.id] && nuevosConteos[c.id] > 0
          );
          if (primerConPendientes) {
            setTipoActivo(primerConPendientes.id);
          } else {
            const primerDisponible = CONFIG_TIPOS.find((c) => nuevosDisponibles[c.id]);
            if (primerDisponible) setTipoActivo(primerDisponible.id);
          }
        }
      }
    }

    cargarConteos();

    return () => {
      activo = false;
    };
  }, [tipoQuery]);

  function cambiarTipo(tipo: TipoAprobacion) {
    setTipoActivo(tipo);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("tipo", tipo);
    router.replace(`/plataforma/aprobaciones?${params.toString()}`);
  }

  const tiposVisibles = CONFIG_TIPOS.filter((c) => disponibles[c.id]);
  const totalGeneral = Object.values(conteos).reduce((acc, val) => acc + val, 0);

  return (
    <div className="space-y-6">
      {/* Selector de tipo con contador por tipo */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Bandeja Centralizada de Aprobaciones
            </h2>
            <p className="text-xs text-slate-500">
              Gestiona todas tus aprobaciones asignadas y delegadas según tu rol en un solo lugar.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            <span>Total pendientes:</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
              {cargandoConteos ? "..." : totalGeneral}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {tiposVisibles.map((cfg) => {
            const esActivo = tipoActivo === cfg.id;
            const cantidad = conteos[cfg.id];
            return (
              <button
                key={cfg.id}
                type="button"
                onClick={() => cambiarTipo(cfg.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  esActivo
                    ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{cfg.titulo}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    esActivo
                      ? "bg-white/20 text-white"
                      : cantidad > 0
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {cargandoConteos ? "..." : cantidad}
                </span>
              </button>
            );
          })}
          {tiposVisibles.length === 0 && !cargandoConteos && (
            <div className="text-xs text-slate-500 py-2">
              No tienes tipos de aprobación asignados a tu perfil activo.
            </div>
          )}
        </div>
      </div>

      {/* Renderizado de la bandeja activa según el tipo seleccionado */}
      <div className="bg-transparent">
        {tipoActivo === "solicitud" && <VistaTicketsGestionAprobaciones />}
        {tipoActivo === "cambio" && <VistaAprobacionesCambios />}
        {tipoActivo === "cambio-tecnica" && <VistaAprobacionesTecnicas />}
        {tipoActivo === "cambio-negocio" && <VistaAprobacionesNegocio />}
        {tipoActivo === "baja" && <VistaBajasActivos />}
      </div>
    </div>
  );
}
