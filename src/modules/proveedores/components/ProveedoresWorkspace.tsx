"use client";

import { FormEvent, useEffect, useState } from "react";
import { validarRuc, validarCorreo, validarCelular } from "@/shared/lib/validaciones";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";

interface Proveedor {
  id_proveedor: number;
  codigo_proveedor: string;
  nombre: string;
  tipo_servicio: string;
  contacto_nombre: string | null;
  contacto_correo: string | null;
  contacto_telefono?: string | null;
  numero_contrato: string | null;
  fecha_inicio: string | null;
  fecha_vencimiento: string | null;
  servicio_soportado: string | null;
  compromiso_sla: string | null;
  evaluacion_desempeno: number | null;
  estado: string;
  observaciones: string | null;
}

export default function ProveedoresWorkspace({ puedeEditar }: { puedeEditar: boolean }) {
  const [items, setItems] = useState<Proveedor[]>([]);
  const [nombre, setNombre] = useState("");
  const [ruc, setRuc] = useState("");
  const [tipo, setTipo] = useState("");
  const [contacto, setContacto] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrato, setContrato] = useState("");
  const [inicio, setInicio] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [servicio, setServicio] = useState("");
  const [sla, setSla] = useState("");
  const [evaluacion, setEvaluacion] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    try {
      const r = await fetch("/api/proveedores", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se pudieron consultar proveedores");
        return;
      }
      setItems(d);
    } catch {
      setError("Error de conexión al cargar proveedores");
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (ruc.length > 0) {
      const vRuc = validarRuc(ruc, false);
      if (!vRuc.valido) {
        setError(vRuc.mensaje!);
        return;
      }
    }

    if (correo.length > 0) {
      const vCor = validarCorreo(correo, "El correo de contacto", false);
      if (!vCor.valido) {
        setError(vCor.mensaje!);
        return;
      }
    }

    if (telefono.length > 0) {
      const vTel = validarCelular(telefono, false);
      if (!vTel.valido) {
        setError(vTel.mensaje!);
        return;
      }
    }

    const obsCompleta = ruc.length > 0 ? `RUC: ${ruc}` : null;

    try {
      const r = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          tipo_servicio: tipo.trim(),
          contacto_nombre: contacto.trim() || null,
          contacto_correo: correo.trim() || null,
          contacto_telefono: telefono.trim() || null,
          numero_contrato: contrato.trim() || null,
          fecha_inicio: inicio || null,
          fecha_vencimiento: vencimiento || null,
          servicio_soportado: servicio.trim() || null,
          compromiso_sla: sla.trim() || null,
          evaluacion_desempeno: evaluacion ? Number(evaluacion) : null,
          observaciones: obsCompleta,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se pudo guardar el proveedor");
        return;
      }

      setNombre("");
      setRuc("");
      setTipo("");
      setContacto("");
      setCorreo("");
      setTelefono("");
      setContrato("");
      setInicio("");
      setVencimiento("");
      setServicio("");
      setSla("");
      setEvaluacion("");
      await cargar();
    } catch {
      setError("Error de conexión al guardar el proveedor");
    }
  }

  async function cambiarEstado(p: Proveedor) {
    const estado = p.estado === "INACTIVO" ? "ACTIVO" : "INACTIVO";
    const r = await fetch(`/api/proveedores/${p.id_proveedor}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || "No se pudo actualizar el proveedor");
      return;
    }
    await cargar();
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Proveedores y contratos de TI</h1>
          <p className="subtitulo">
            Control de proveedores técnicos, contratos de soporte, fechas de vigencia, compromisos de servicio y evaluaciones.
          </p>
        </div>
      </div>

      {error && <p role="alert" className="mensaje-error">{error}</p>}

      {puedeEditar && (
        <form onSubmit={crear} className="tarjeta-formulario" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 20 }}>
          <h2 style={{ gridColumn: "1/-1", margin: 0, fontSize: 16 }}>Registrar proveedor o contrato</h2>
          
          <div>
            <input
              className="input-base"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Razón Social / Proveedor *"
            />
          </div>

          <div>
            <input
              className="input-base"
              maxLength={11}
              value={ruc}
              onChange={(e) => setRuc(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="RUC (11 dígitos numéricos)"
            />
            {ruc.length > 0 && (
              ruc.length < 11 ? (
                <AlertaCampo error={`El RUC debe tener exactamente 11 dígitos (has ingresado ${ruc.length} de 11).`} />
              ) : (
                <AlertaCampo exito="RUC completo (11 dígitos)." />
              )
            )}
          </div>

          <div>
            <input
              className="input-base"
              required
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Tipo de servicio *"
            />
          </div>

          <div>
            <input
              className="input-base"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Contacto comercial o técnico"
            />
          </div>

          <div>
            <input
              className="input-base"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Correo electrónico de contacto"
            />
            {correo.length > 0 && (() => {
              const v = validarCorreo(correo, "El correo de contacto", false);
              return v.valido ? (
                <AlertaCampo exito="Formato de correo válido." />
              ) : (
                <AlertaCampo error={v.mensaje} />
              );
            })()}
          </div>

          <div>
            <input
              className="input-base"
              maxLength={9}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="Teléfono / Celular (9 dígitos)"
            />
            {telefono.length > 0 && (
              telefono.length < 9 ? (
                <AlertaCampo error={`El celular debe tener 9 dígitos numéricos (has ingresado ${telefono.length} de 9).`} />
              ) : !telefono.startsWith("9") ? (
                <AlertaCampo error="El celular debe iniciar con 9." />
              ) : (
                <AlertaCampo exito="Número válido (9 dígitos)." />
              )
            )}
          </div>

          <div>
            <input
              className="input-base"
              value={contrato}
              onChange={(e) => setContrato(e.target.value)}
              placeholder="N.º de contrato o póliza"
            />
          </div>

          <div>
            <input
              className="input-base"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              aria-label="Inicio de contrato"
            />
          </div>

          <div>
            <input
              className="input-base"
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              aria-label="Vencimiento"
            />
          </div>

          <div>
            <input
              className="input-base"
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              placeholder="Servicio o CI soportado"
            />
          </div>

          <div style={{ gridColumn: "1/-1" }}>
            <textarea
              className="input-base"
              rows={2}
              value={sla}
              onChange={(e) => setSla(e.target.value)}
              placeholder="Compromiso SLA del proveedor (ej. Tiempo de respuesta 4h, soporte 24x7)"
            />
          </div>

          <div>
            <select className="input-base" value={evaluacion} onChange={(e) => setEvaluacion(e.target.value)}>
              <option value="">Sin evaluación</option>
              <option value="1">1 - Deficiente</option>
              <option value="2">2 - Regular</option>
              <option value="3">3 - Aceptable</option>
              <option value="4">4 - Bueno</option>
              <option value="5">5 - Excelente</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="boton-principal" style={{ width: "100%", height: 38 }}>
              Guardar registro
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p>No hay proveedores registrados.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((p) => (
            <article className="tarjeta" key={p.id_proveedor} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <strong>{p.codigo_proveedor} · {p.nombre}</strong>
                <span>{p.estado}</span>
              </div>
              <p>{p.tipo_servicio} · Contrato {p.numero_contrato || "sin número"}</p>
              {p.observaciones && <p style={{ fontSize: 12, color: "#475569" }}>{p.observaciones}</p>}
              <p>Servicio soportado: {p.servicio_soportado || "No indicado"}</p>
              <p>
                Vigencia: {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : "—"} a{" "}
                {p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : "—"}
              </p>
              <p>
                Contacto: {p.contacto_nombre || "—"}{" "}
                {p.contacto_correo ? `(${p.contacto_correo})` : ""}{" "}
                {p.contacto_telefono ? `[Tel: ${p.contacto_telefono}]` : ""}
              </p>
              <p>SLA: {p.compromiso_sla || "No documentado"} · Evaluación: {p.evaluacion_desempeno ?? "Pendiente"}</p>
              {puedeEditar && (
                <button className="boton-mini" onClick={() => cambiarEstado(p)}>
                  {p.estado === "INACTIVO" ? "Reactivar" : "Inactivar"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
