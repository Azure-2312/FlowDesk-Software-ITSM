"use client";

import { useEffect, useState, FormEvent } from "react";

type Colaborador = {
  id_usuario: number;
  nombres: string;
  apellido_paterno: string;
  correo_electronico: string;
  tickets_abiertos: number;
};

type Autorizacion = {
  id_autorizacion: number;
  id_usuario: number;
  tipo: string;
  activo: boolean;
  creado_en: string;
  colaborador_nombre: string;
};

const TIPOS_AUTORIZACION: { valor: string; etiqueta: string }[] = [
  { valor: "aprobar_solicitud", etiqueta: "Aprobar solicitud" },
  { valor: "registrar_ticket", etiqueta: "Registrar ticket" },
  { valor: "ver_reportes", etiqueta: "Ver reportes" },
  { valor: "gestionar_activos", etiqueta: "Gestionar activos" },
];

function etiquetaTipo(tipo: string) {
  return TIPOS_AUTORIZACION.find((t) => t.valor === tipo)?.etiqueta ?? tipo;
}

export default function ColaboradoresArea() {
  const [area, setArea] = useState("");
  const [items, setItems] = useState<Colaborador[]>([]);
  const [error, setError] = useState("");

  const [autorizaciones, setAutorizaciones] = useState<Autorizacion[]>([]);
  const [errorAut, setErrorAut] = useState("");
  const [okAut, setOkAut] = useState("");
  const [idUsuario, setIdUsuario] = useState("");
  const [tipo, setTipo] = useState(TIPOS_AUTORIZACION[0].valor);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch("/api/area/colaboradores", { cache: "no-store" }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se pudo cargar");
        return;
      }
      setArea(d.departamento);
      setItems(d.colaboradores || []);
    });
  }, []);

  async function cargarAutorizaciones() {
    try {
      const r = await fetch("/api/area/colaboradores/autorizaciones", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) {
        setErrorAut(d.error || "No se pudieron cargar las autorizaciones");
        return;
      }
      setErrorAut("");
      setAutorizaciones(d.autorizaciones || []);
    } catch {
      setErrorAut("Error de conexión al cargar las autorizaciones.");
    }
  }

  useEffect(() => {
    cargarAutorizaciones();
  }, []);

  async function otorgar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErrorAut("");
    setOkAut("");
    try {
      const r = await fetch("/api/area/colaboradores/autorizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: Number(idUsuario), tipo }),
      });
      const d = await r.json();
      if (!r.ok) setErrorAut(d.error || "No se pudo otorgar la autorización");
      else {
        setOkAut("Autorización otorgada.");
        await cargarAutorizaciones();
      }
    } catch {
      setErrorAut("Error de conexión al otorgar la autorización.");
    } finally {
      setEnviando(false);
    }
  }

  async function revocar(idAutorizacion: number) {
    setErrorAut("");
    setOkAut("");
    try {
      const r = await fetch(`/api/area/colaboradores/autorizaciones?id=${idAutorizacion}`, {
        method: "DELETE",
      });
      const d = await r.json();
      if (!r.ok) setErrorAut(d.error || "No se pudo revocar la autorización");
      else {
        setOkAut("Autorización revocada.");
        await cargarAutorizaciones();
      }
    } catch {
      setErrorAut("Error de conexión al revocar la autorización.");
    }
  }

  const activas = autorizaciones.filter((a) => a.activo);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Colaboradores de mi área</h1>
          <p className="subtitulo">
            {area
              ? `Departamento empresarial: ${area}. La lista está limitada a tu unidad.`
              : "Personas de tu departamento empresarial."}
          </p>
        </div>
      </div>

      {error ? (
        <div role="alert" className="mensaje-error">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario">
          No hay otros colaboradores activos asignados a tu departamento.
        </div>
      ) : (
        <div className="contenedor-tabla">
          <table className="tabla">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Correo</th>
                <th>Incidentes y solicitudes abiertos</th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x.id_usuario}>
                  <td>
                    {x.nombres} {x.apellido_paterno}
                  </td>
                  <td>{x.correo_electronico}</td>
                  <td>{x.tickets_abiertos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="cabecera-pagina" style={{ marginTop: 28 }}>
        <div>
          <h2 style={{ fontSize: 18 }}>Autorizaciones de mis colaboradores</h2>
          <p className="subtitulo">
            Delega funciones concretas a las personas de tu área y revócalas cuando ya no las necesiten.
          </p>
        </div>
      </div>

      <form onSubmit={otorgar} className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <label style={{ fontSize: 12, color: "#374151" }}>
            Colaborador
            <select
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                marginTop: 4,
                padding: "8px 10px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
              }}
            >
              <option value="">Selecciona un colaborador</option>
              {items.map((c) => (
                <option key={c.id_usuario} value={c.id_usuario}>
                  {c.nombres} {c.apellido_paterno}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Autorización
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginTop: 4,
                padding: "8px 10px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
              }}
            >
              {TIPOS_AUTORIZACION.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="boton-primario" style={{ width: "auto" }} disabled={enviando || !idUsuario}>
            {enviando ? "Guardando..." : "Otorgar autorización"}
          </button>
        </div>
        {okAut && (
          <p role="status" style={{ color: "#15803d", fontWeight: 600, marginTop: 10, marginBottom: 0 }}>
            {okAut}
          </p>
        )}
        {errorAut && (
          <p role="alert" className="mensaje-error" style={{ marginTop: 10, marginBottom: 0 }}>
            {errorAut}
          </p>
        )}
      </form>

      {activas.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          Aún no has otorgado autorizaciones a los colaboradores de tu área.
        </div>
      ) : (
        <div className="contenedor-tabla">
          <table className="tabla">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Autorización</th>
                <th>Otorgada</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {activas.map((a) => (
                <tr key={a.id_autorizacion}>
                  <td>{a.colaborador_nombre}</td>
                  <td>{etiquetaTipo(a.tipo)}</td>
                  <td>{new Date(a.creado_en).toLocaleDateString("es-PE")}</td>
                  <td>
                    <button
                      className="boton-secundario"
                      style={{ width: "auto", fontSize: 12, padding: "5px 10px" }}
                      onClick={() => revocar(a.id_autorizacion)}
                    >
                      Revocar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
