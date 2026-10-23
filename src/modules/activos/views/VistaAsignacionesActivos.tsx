"use client";

import { useEffect, useMemo, useState } from "react";

interface Activo {
  id_activo: number;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  estado_activo: string;
  id_departamento: number | null;
  departamento_nombre: string | null;
  custodio_nombre: string | null;
}

interface Simple {
  id: number;
  nombre: string;
}

export default function VistaAsignacionesActivos() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [usuarios, setUsuarios] = useState<Simple[]>([]);
  const [departamentos, setDepartamentos] = useState<Simple[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState<number | null>(null);
  const [form, setForm] = useState<Record<number, { id_usuario_custodio: string; id_departamento: string; motivo: string }>>({});

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/activos/asignaciones?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setActivos(Array.isArray(json?.activos) ? json.activos : []);
        setUsuarios(Array.isArray(json?.usuarios) ? json.usuarios : []);
        setDepartamentos(Array.isArray(json?.departamentos) ? json.departamentos : []);
      } else setError(json.error ?? "No se pudieron cargar las asignaciones.");
    } catch {
      setError("Error de conexión al cargar las asignaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return activos;
    return activos.filter((a) =>
      [a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.custodio_nombre, a.departamento_nombre]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [activos, busqueda]);

  function setCampo(id: number, campo: "id_usuario_custodio" | "id_departamento" | "motivo", valor: string) {
    setForm((prev) => {
      const actual = prev[id] ?? { id_usuario_custodio: "", id_departamento: "", motivo: "" };
      return { ...prev, [id]: { ...actual, [campo]: valor } };
    });
  }

  async function mover(idActivo: number, accion: string) {
    setProcesando(idActivo);
    setError(null);
    setOk(null);
    const valores = form[idActivo] ?? { id_usuario_custodio: "", id_departamento: "", motivo: "" };
    try {
      const res = await fetch("/api/activos/asignaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_activo: idActivo,
          accion,
          id_usuario_custodio: valores.id_usuario_custodio || undefined,
          id_departamento: valores.id_departamento || undefined,
          motivo: valores.motivo || (accion === "DEVOLVER" ? "Devolución de custodia" : ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar el movimiento.");
      else {
        setOk(json.mensaje ?? "Movimiento registrado.");
        setAbierto(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar el movimiento.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Asignación, custodia y actas</h1>
        <p>Asigna, transfiere y devuelve activos; cada movimiento queda con su acta y aceptación del custodio.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <input type="text" placeholder="Buscar por código, tipo, custodio o área..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, marginBottom: 14, width: "100%", maxWidth: 420 }} />

      {cargando ? (
        <p>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay activos que coincidan.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtrados.map((a) => (
            <div key={a.id_activo} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ fontSize: 13.5 }}>{a.codigo_patrimonial}</strong> · {a.tipo_activo} {a.marca} {a.modelo}
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                    Estado {a.estado_activo} · Custodio {a.custodio_nombre ?? "sin asignar"} · Área {a.departamento_nombre ?? "—"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setAbierto(abierto === a.id_activo ? null : a.id_activo)}>
                    {abierto === a.id_activo ? "Cerrar" : "Asignar / transferir"}
                  </button>
                  {a.custodio_nombre && <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === a.id_activo} onClick={() => mover(a.id_activo, "DEVOLVER")}>Devolver</button>}
                </div>
              </div>
              {abierto === a.id_activo && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Custodio
                    <select value={form[a.id_activo]?.id_usuario_custodio ?? ""} onChange={(e) => setCampo(a.id_activo, "id_usuario_custodio", e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 220 }}>
                      <option value="">Selecciona...</option>
                      {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                  </label>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Área
                    <select value={form[a.id_activo]?.id_departamento ?? ""} onChange={(e) => setCampo(a.id_activo, "id_departamento", e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 180 }}>
                      <option value="">Sin cambio</option>
                      {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                  </label>
                  <label style={{ fontSize: 12, color: "#374151", flex: "1 1 240px" }}>
                    Motivo del acta
                    <input type="text" value={form[a.id_activo]?.motivo ?? ""} onChange={(e) => setCampo(a.id_activo, "motivo", e.target.value)} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
                  </label>
                  <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === a.id_activo} onClick={() => mover(a.id_activo, a.custodio_nombre ? "TRANSFERIR" : "ASIGNAR")}>
                    {a.custodio_nombre ? "Transferir" : "Asignar"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
