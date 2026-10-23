"use client";

import { Fragment } from "react";
import { resolverCapacidades, type Capacidad } from "@/shared/lib/capacidades";

export interface PerfilMatriz {
  id: number;
  nombre: string;
}

export interface FilaCapacidad {
  capacidad: Capacidad;
  etiqueta: string;
}

export interface GrupoCapacidades {
  dominio: string;
  etiqueta: string;
  filas: FilaCapacidad[];
}

interface Props {
  grupos: GrupoCapacidades[];
  perfiles: PerfilMatriz[];
}

export default function GrillaPermisosRol({ grupos, perfiles }: Props) {
  const conjuntos = new Map(
    perfiles.map((perfil) => [perfil.id, resolverCapacidades(perfil.id)])
  );

  return (
    <div
      className="contenedor-tabla"
      style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 10 }}
    >
      <table className="tabla" style={{ minWidth: 1100, borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            <th
              style={{
                position: "sticky",
                left: 0,
                zIndex: 2,
                background: "#f8fafc",
                minWidth: 260,
                textAlign: "left",
              }}
            >
              Capacidad
            </th>
            {perfiles.map((perfil) => {
              const total = conjuntos.get(perfil.id)?.size ?? 0;
              return (
                <th
                  key={perfil.id}
                  style={{ textAlign: "center", minWidth: 96, background: "#f8fafc" }}
                >
                  <div>{perfil.nombre}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#64748b" }}>
                    {total} capacidades
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {grupos.map((grupo) => (
            <Fragment key={grupo.dominio}>
              <tr>
                <td
                  colSpan={perfiles.length + 1}
                  style={{
                    background: "#eff6ff",
                    color: "#1e40af",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    padding: "8px 12px",
                    borderTop: "1px solid #dbeafe",
                  }}
                >
                  {grupo.etiqueta}
                </td>
              </tr>
              {grupo.filas.map((fila) => (
                <tr key={fila.capacidad}>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      background: "#fff",
                      borderRight: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                      {fila.etiqueta}
                    </div>
                    <code style={{ fontSize: 11, color: "#64748b" }}>{fila.capacidad}</code>
                  </td>
                  {perfiles.map((perfil) => {
                    const asignada = conjuntos.get(perfil.id)?.has(fila.capacidad) ?? false;
                    return (
                      <td key={perfil.id} style={{ textAlign: "center" }}>
                        {asignada ? (
                          <span
                            title={`${perfil.nombre} tiene ${fila.capacidad}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            Sí
                          </span>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
          {grupos.length === 0 && (
            <tr>
              <td
                colSpan={perfiles.length + 1}
                style={{ padding: 24, textAlign: "center", color: "#64748b" }}
              >
                No hay capacidades que coincidan con los filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
