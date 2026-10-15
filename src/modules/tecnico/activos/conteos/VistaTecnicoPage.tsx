"use client";

import { useState } from "react";

interface ItemConteo {
  serie: string;
  codigo: string;
  nombre: string;
  ubicacionEsperada: string;
  estado: "PENDIENTE" | "ENCONTRADO" | "OTRA_UBICACION" | "DANADO" | "NO_ENCONTRADO";
}

export default function PaginaConteosFisicos() {
  const [items, setItems] = useState<ItemConteo[]>([
    {
      serie: "5CG1234ABC",
      codigo: "ACT-2026-0001",
      nombre: "Laptop HP ProBook 450",
      ubicacionEsperada: "Piso 3 - Operaciones",
      estado: "PENDIENTE",
    },
    {
      serie: "PF2XYZ987",
      codigo: "ACT-2026-0002",
      nombre: "Monitor Dell 24 pulgadas",
      ubicacionEsperada: "Piso 3 - Operaciones",
      estado: "PENDIENTE",
    },
    {
      serie: "WS-IT-0099",
      codigo: "ACT-2026-0003",
      nombre: "Workstation Dell Precision",
      ubicacionEsperada: "Piso 2 - TI",
      estado: "PENDIENTE",
    },
  ]);

  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [itemEncontrado, setItemEncontrado] = useState<ItemConteo | null>(null);
  const [sobranteModal, setSobranteModal] = useState(false);
  const [serieSobrante, setSerieSobrante] = useState("");
  const [nombreSobrante, setNombreSobrante] = useState("");

  const encontrados = items.filter((i) => i.estado === "ENCONTRADO" || i.estado === "OTRA_UBICACION").length;
  const pendientes = items.filter((i) => i.estado === "PENDIENTE").length;
  const discrepancias = items.filter((i) => i.estado === "DANADO" || i.estado === "NO_ENCONTRADO").length;

  function procesarEscaneo(e: React.FormEvent) {
    e.preventDefault();
    if (!codigoIngresado.trim()) return;

    const q = codigoIngresado.trim().toUpperCase();
    const match = items.find((i) => i.serie.toUpperCase() === q || i.codigo.toUpperCase() === q);

    if (match) {
      setItemEncontrado(match);
    } else {
      setItemEncontrado(null);
      setSerieSobrante(codigoIngresado.trim());
      setSobranteModal(true);
    }
    setCodigoIngresado("");
  }

  function marcarEstado(nuevoEstado: ItemConteo["estado"]) {
    if (!itemEncontrado) return;
    setItems((prev) =>
      prev.map((i) => (i.codigo === itemEncontrado.codigo ? { ...i, estado: nuevoEstado } : i))
    );
    setItemEncontrado(null);
  }

  function registrarSobrante(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreSobrante.trim()) return;

    const nuevo: ItemConteo = {
      serie: serieSobrante.toUpperCase(),
      codigo: `SOBRANTE-${Date.now().toString().slice(-4)}`,
      nombre: nombreSobrante.trim(),
      ubicacionEsperada: "Hallado sin asignación",
      estado: "ENCONTRADO",
    };

    setItems((prev) => [nuevo, ...prev]);
    setSobranteModal(false);
    setNombreSobrante("");
  }

  return (
    <div style={{ padding: "16px", maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Toma de inventario físico en campo
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
          Herramienta mobile-first para levantamiento y escaneo de activos en sedes
        </p>
      </div>

      {/* Contadores Mobile-First */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#065f46" }}>Encontrados</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#047857" }}>{encontrados}</div>
        </div>
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Pendientes</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#334155" }}>{pendientes}</div>
        </div>
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b" }}>Discrepancias</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#b91c1c" }}>{discrepancias}</div>
        </div>
      </div>

      {/* Barra de Escaneo / Ingreso de Serie */}
      <form onSubmit={procesarEscaneo} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Escanear o ingresar número de serie / código..."
          value={codigoIngresado}
          onChange={(e) => setCodigoIngresado(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 14px",
            fontSize: 15,
            border: "2px solid #2563eb",
            borderRadius: 8,
            backgroundColor: "#ffffff",
          }}
          autoFocus
        />
        <button
          type="submit"
          style={{
            padding: "12px 18px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Verificar
        </button>
      </form>

      {/* Tarjeta del Activo Escaneado */}
      {itemEncontrado && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "2px solid #2563eb", padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>
            {itemEncontrado.codigo} • SERIE: {itemEncontrado.serie}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
            {itemEncontrado.nombre}
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Ubicación esperada: {itemEncontrado.ubicacionEsperada}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
            <button
              type="button"
              onClick={() => marcarEstado("ENCONTRADO")}
              style={{
                padding: "10px",
                backgroundColor: "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Encontrado en sitio
            </button>
            <button
              type="button"
              onClick={() => marcarEstado("OTRA_UBICACION")}
              style={{
                padding: "10px",
                backgroundColor: "#d97706",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              En otra ubicación
            </button>
            <button
              type="button"
              onClick={() => marcarEstado("DANADO")}
              style={{
                padding: "10px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Equipo dañado
            </button>
            <button
              type="button"
              onClick={() => setItemEncontrado(null)}
              style={{
                padding: "10px",
                backgroundColor: "#f1f5f9",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Omitir
            </button>
          </div>
        </div>
      )}

      {/* Lista de Activos de la Campaña */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
          Lista de verificación en campo
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((it) => (
            <div
              key={it.codigo}
              style={{
                padding: "10px 12px",
                backgroundColor: it.estado !== "PENDIENTE" ? "#f8fafc" : "#ffffff",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{it.nombre}</div>
                <div style={{ fontSize: 11.5, color: "#64748b" }}>
                  {it.codigo} • {it.serie}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 4,
                  backgroundColor:
                    it.estado === "ENCONTRADO"
                      ? "#ecfdf5"
                      : it.estado === "OTRA_UBICACION"
                      ? "#fef3c7"
                      : it.estado === "DANADO"
                      ? "#fee2e2"
                      : "#f1f5f9",
                  color:
                    it.estado === "ENCONTRADO"
                      ? "#065f46"
                      : it.estado === "OTRA_UBICACION"
                      ? "#92400e"
                      : it.estado === "DANADO"
                      ? "#991b1b"
                      : "#475569",
                }}
              >
                {it.estado}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Sobrante Hallado */}
      {sobranteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
          onClick={() => setSobranteModal(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 420,
              padding: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Activo no registrado (Sobrante)
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px" }}>
              La serie {serieSobrante} no figura en la lista de esta campaña. Registra los datos para reporte al Gestor de Activos.
            </p>

            <form onSubmit={registrarSobrante}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Descripción del equipo hallado *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Monitor Samsung 27 pulgadas..."
                  value={nombreSobrante}
                  onChange={(e) => setNombreSobrante(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSobranteModal(false)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Registrar sobrante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
