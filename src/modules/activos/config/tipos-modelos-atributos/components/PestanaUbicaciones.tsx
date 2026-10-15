"use client";

import React, { useState } from "react";

interface UbicacionNodo {
  id_ubicacion: number;
  codigo: string;
  nombre: string;
  tipo_nivel: string;
  ruta_completa?: string;
  capacidad_u?: number;
  activo?: boolean;
}

interface Props {
  datos: any;
  catalogoUbicaciones?: UbicacionNodo[];
  onChange: (nuevosDatos: any) => void;
  bloqueado: boolean;
}

export function PestanaUbicaciones({ datos, catalogoUbicaciones = [], onChange, bloqueado }: Props) {
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<UbicacionNodo | null>(catalogoUbicaciones[0] || null);
  const [busqueda, setBusqueda] = useState("");

  // Formulario nueva ubicación
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoNivel, setNuevoNivel] = useState("PISO");
  const [nuevaCapacidad, setNuevaCapacidad] = useState<number>(0);

  const ubicacionesFiltradas = catalogoUbicaciones.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.ruta_completa || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20 }}>
      {/* Columna Izquierda: Árbol / Listado jerárquico de ubicaciones */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
            Jerarquía de Ubicaciones Físicas
          </h3>
          <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 10px 0" }}>
            Estructura física de 5 niveles: Sede &gt; Edificio &gt; Piso &gt; Ambiente &gt; Rack
          </p>
          <input
            type="text"
            className="input-base"
            placeholder="Buscar ubicación o ruta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ fontSize: 12, padding: "6px 10px", width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "540px", overflowY: "auto" }}>
          {ubicacionesFiltradas.map((u) => {
            const esSeleccionada = ubicacionSeleccionada?.id_ubicacion === u.id_ubicacion;
            return (
              <div
                key={u.id_ubicacion}
                onClick={() => setUbicacionSeleccionada(u)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  backgroundColor: esSeleccionada ? "#f1f5f9" : "#ffffff",
                  border: esSeleccionada ? "2px solid #0284c7" : "1px solid #e2e8f0"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <strong style={{ fontSize: 12.5, color: "#1e293b" }}>{u.nombre}</strong>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, backgroundColor: "#e2e8f0", fontWeight: 700, color: "#334155" }}>
                    {u.tipo_nivel}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", wordBreak: "break-word" }}>
                  {u.ruta_completa || u.codigo}
                </div>
                {u.capacidad_u ? (
                  <div style={{ fontSize: 10, color: "#0369a1", marginTop: 4 }}>
                    Capacidad: {u.capacidad_u} Unidades Rack (U)
                  </div>
                ) : null}
              </div>
            );
          })}
          {ubicacionesFiltradas.length === 0 && (
            <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
              No se encontraron ubicaciones registradas.
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha: Detalle y configuración de ubicación */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {ubicacionSeleccionada ? (
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
                  {ubicacionSeleccionada.nombre}
                </h3>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>
                  Código: {ubicacionSeleccionada.codigo}
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, backgroundColor: "#dcfce7", color: "#166534" }}>
                Nivel {ubicacionSeleccionada.tipo_nivel} Activo
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                  Ruta Jerárquica Completa
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={ubicacionSeleccionada.ruta_completa || ubicacionSeleccionada.nombre}
                  disabled
                  style={{ width: "100%", fontSize: 12, backgroundColor: "#f8fafc" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                  Nivel en la Estructura
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={ubicacionSeleccionada.tipo_nivel}
                  disabled
                  style={{ width: "100%", fontSize: 12, backgroundColor: "#f8fafc" }}
                />
              </div>

              {ubicacionSeleccionada.capacidad_u !== undefined && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Capacidad en Unidades Rack (U)
                  </label>
                  <input
                    type="number"
                    className="input-base"
                    value={ubicacionSeleccionada.capacidad_u}
                    disabled
                    style={{ width: "100%", fontSize: 12, backgroundColor: "#f8fafc" }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Políticas de Gobernanza de Ubicación */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px 0", color: "#0f172a" }}>
            Políticas de Integridad de Ubicaciones Físicas
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#334155" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={datos?.exigir_responsable_en_rack ?? true} disabled={bloqueado} onChange={() => {}} />
              <span>Exigir responsable técnico asignado para ubicaciones de tipo Rack y Sala de Servidores</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={datos?.heredar_departamento_si_vacio ?? true} disabled={bloqueado} onChange={() => {}} />
              <span>Heredar automáticamente el departamento responsable desde la sede/edificio superior</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={true} disabled onChange={() => {}} />
              <span>Bloquear eliminación de ubicaciones que contengan activos activos asociados</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
