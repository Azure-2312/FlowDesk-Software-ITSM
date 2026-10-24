"use client";

import { useMemo, useState } from "react";
import {
  CAPACIDADES,
  CAPACIDADES_POR_PERFIL,
  PERFILES,
  resolverCapacidades,
  type Capacidad,
} from "@/shared/lib/capacidades";
import GrillaPermisosRol, {
  type FilaCapacidad,
  type GrupoCapacidades,
  type PerfilMatriz,
} from "./components/GrillaPermisosRol";

const PERFILES_MATRIZ: PerfilMatriz[] = [
  { id: PERFILES.ADMINISTRADOR, nombre: "Administrador" },
  { id: PERFILES.TECNICO, nombre: "Técnico" },
  { id: PERFILES.SOLICITANTE, nombre: "Solicitante" },
  { id: PERFILES.SUPERVISOR, nombre: "Supervisor" },
  { id: PERFILES.GESTOR_AREA, nombre: "Gestor de área" },
  { id: PERFILES.AUDITOR, nombre: "Auditor" },
  { id: PERFILES.APROBADOR, nombre: "Aprobador CAB" },
  { id: PERFILES.GESTOR_CAMBIOS, nombre: "Gestor de cambios" },
  { id: PERFILES.GESTOR_ACTIVOS, nombre: "Gestor de activos" },
  { id: PERFILES.GESTOR_PROBLEMAS, nombre: "Gestor de problemas" },
];

const DOMINIOS: Record<string, string> = {
  tickets: "Mesa de servicio",
  incidentes: "Incidentes",
  solicitudes: "Solicitudes de servicio",
  problemas: "Problemas",
  kedb: "Base de errores conocidos (KEDB)",
  cambios: "Gestión de cambios",
  activos: "Activos",
  licencias: "Licencias",
  cmdb: "CMDB",
  conocimiento: "Conocimiento",
  servicios: "Servicios y SLA",
  operacion: "Operación de servicios",
  proveedores: "Proveedores",
  admin: "Administración de plataforma",
  organizacion: "Organización",
  categorias: "Categorías",
  area: "Gestión de área",
  auditoria: "Auditoría",
  seguridad: "Seguridad",
  reportes: "Reportes",
  indicadores: "Indicadores",
};

function etiquetaCapacidad(capacidad: Capacidad) {
  return capacidad
    .split(":")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" · ");
}

function dominioDe(capacidad: Capacidad) {
  return capacidad.split(":")[0] ?? "otros";
}

export default function VistaConfigPermisos({ onVolver }: { onVolver?: () => void }) {
  const [busqueda, setBusqueda] = useState("");
  const [dominio, setDominio] = useState("TODOS");
  const [perfil, setPerfil] = useState("TODOS");

  const capacidades = useMemo(
    () => Array.from(new Set(Object.values(CAPACIDADES) as Capacidad[])),
    []
  );

  const dominiosDisponibles = useMemo(() => {
    const presentes = new Set(capacidades.map(dominioDe));
    return Array.from(presentes).sort((a, b) =>
      (DOMINIOS[a] ?? a).localeCompare(DOMINIOS[b] ?? b, "es")
    );
  }, [capacidades]);

  const grupos = useMemo<GrupoCapacidades[]>(() => {
    const texto = busqueda.trim().toLowerCase();
    const idPerfil = perfil === "TODOS" ? null : Number(perfil);
    const conjuntoPerfil = idPerfil ? resolverCapacidades(idPerfil) : null;

    const filtradas = capacidades.filter((capacidad) => {
      if (dominio !== "TODOS" && dominioDe(capacidad) !== dominio) return false;
      if (conjuntoPerfil && !conjuntoPerfil.has(capacidad)) return false;
      if (!texto) return true;
      return (
        capacidad.toLowerCase().includes(texto) ||
        etiquetaCapacidad(capacidad).toLowerCase().includes(texto) ||
        (DOMINIOS[dominioDe(capacidad)] ?? "").toLowerCase().includes(texto)
      );
    });

    const mapa = new Map<string, FilaCapacidad[]>();
    filtradas.forEach((capacidad) => {
      const clave = dominioDe(capacidad);
      const filas = mapa.get(clave) ?? [];
      filas.push({ capacidad, etiqueta: etiquetaCapacidad(capacidad) });
      mapa.set(clave, filas);
    });

    return Array.from(mapa.entries())
      .sort(([a], [b]) => (DOMINIOS[a] ?? a).localeCompare(DOMINIOS[b] ?? b, "es"))
      .map(([clave, filas]) => ({
        dominio: clave,
        etiqueta: DOMINIOS[clave] ?? clave,
        filas: filas.sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es")),
      }));
  }, [busqueda, capacidades, dominio, perfil]);

  const totalAsignaciones = useMemo(
    () =>
      Object.values(CAPACIDADES_POR_PERFIL).reduce(
        (total, lista) => total + lista.length,
        0
      ),
    []
  );

  function limpiarFiltros() {
    setBusqueda("");
    setDominio("TODOS");
    setPerfil("TODOS");
  }

  return (
    <div>
      <div
        className="cabecera-pagina"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          {onVolver && (
            <button
              type="button"
              onClick={onVolver}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "none",
                color: "#2563eb",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 6,
                padding: 0,
              }}
            >
              ← Volver a la lista de perfiles
            </button>
          )}
          <h1>Matriz de capacidades por perfil</h1>
          <p>
            Vista consolidada del catálogo RBAC. Cada capacidad se evalúa antes de permitir
            el acceso a una página, endpoint o acción del sistema.
          </p>
        </div>
        <button
          type="button"
          className="boton-secundario"
          style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>

      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          color: "#1e40af",
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        Consulta de solo lectura. La asignación de opciones de menú se edita en la ficha de
        cada perfil; la matriz de capacidades refleja el mapa RBAC vigente del sistema.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {[
          { etiqueta: "Perfiles evaluados", valor: PERFILES_MATRIZ.length },
          { etiqueta: "Capacidades del catálogo", valor: capacidades.length },
          { etiqueta: "Asignaciones vigentes", valor: totalAsignaciones },
          { etiqueta: "Grupos funcionales", valor: dominiosDisponibles.length },
        ].map((indicador) => (
          <div
            key={indicador.etiqueta}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
              {indicador.etiqueta}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
              {indicador.valor}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-end",
          marginBottom: 14,
        }}
      >
        <label style={{ flex: "1 1 260px", fontSize: 13, color: "#475569" }}>
          Buscar capacidad
          <input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Ej. tickets, auditoría, admin:perfiles"
            className="input-base"
            style={{ marginTop: 6 }}
          />
        </label>
        <label style={{ minWidth: 210, fontSize: 13, color: "#475569" }}>
          Dominio
          <select
            value={dominio}
            onChange={(event) => setDominio(event.target.value)}
            className="input-base"
            style={{ marginTop: 6 }}
          >
            <option value="TODOS">Todos los dominios</option>
            {dominiosDisponibles.map((clave) => (
              <option key={clave} value={clave}>
                {DOMINIOS[clave] ?? clave}
              </option>
            ))}
          </select>
        </label>
        <label style={{ minWidth: 210, fontSize: 13, color: "#475569" }}>
          Capacidades del perfil
          <select
            value={perfil}
            onChange={(event) => setPerfil(event.target.value)}
            className="input-base"
            style={{ marginTop: 6 }}
          >
            <option value="TODOS">Todos los perfiles</option>
            {PERFILES_MATRIZ.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 10,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        <span>
          {grupos.reduce((total, grupo) => total + grupo.filas.length, 0)} capacidades
          visibles en {grupos.length} grupo{grupos.length === 1 ? "" : "s"}
        </span>
        <span>
          <strong style={{ color: "#1d4ed8" }}>Sí</strong> = capacidad asignada ·{" "}
          <strong>—</strong> = no asignada
        </span>
      </div>

      <GrillaPermisosRol grupos={grupos} perfiles={PERFILES_MATRIZ} />
    </div>
  );
}
