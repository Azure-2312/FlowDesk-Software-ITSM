"use client";

import { useEffect, useState } from "react";
import { validarCodigo, validarTexto } from "@/shared/lib/validaciones";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Edit2 } from "@/shared/components/ui/Iconos";

type Departamento = {
  id_departamento_empresa: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado_registro: boolean;
  colaboradores: number;
};

export default function DepartamentosEmpresa() {
  const [items, setItems] = useState<Departamento[]>([]);
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function cargar() {
    try {
      const r = await fetch("/api/departamentos-empresa", { cache: "no-store" });
      const d = await r.json();
      if (r.ok) setItems(d.departamentos || []);
      else setError(d.error || "No se pudo cargar.");
    } catch {
      setError("Error de conexión al cargar departamentos.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");

    const vCod = validarCodigo(codigo, 2, 20, "El código del departamento empresarial");
    if (!vCod.valido) {
      setError(vCod.mensaje!);
      return;
    }
    const vNom = validarTexto(nombre, 2, 100, "El nombre del departamento empresarial", true);
    if (!vNom.valido) {
      setError(vNom.mensaje!);
      return;
    }

    try {
      const r = await fetch("/api/departamentos-empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigo.trim().toUpperCase(), nombre: nombre.trim(), descripcion: descripcion.trim() || null }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se pudo guardar.");
        return;
      }
      setCodigo("");
      setNombre("");
      setDescripcion("");
      setOk("Departamento creado exitosamente.");
      cargar();
    } catch {
      setError("Error de conexión al guardar.");
    }
  }

  async function editar(d: Departamento) {
    const nuevoNombre = window.prompt("Nombre del departamento", d.nombre);
    if (nuevoNombre === null) return;
    const vNom = validarTexto(nuevoNombre, 2, 100, "El nombre del departamento empresarial", true);
    if (!vNom.valido) {
      alert(vNom.mensaje);
      return;
    }
    const nuevoCodigo = window.prompt("Código", d.codigo);
    if (nuevoCodigo === null) return;
    const vCod = validarCodigo(nuevoCodigo, 2, 20, "El código del departamento empresarial");
    if (!vCod.valido) {
      alert(vCod.mensaje);
      return;
    }
    try {
      const r = await fetch(`/api/departamentos-empresa/${d.id_departamento_empresa}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre.trim(), codigo: nuevoCodigo.trim().toUpperCase(), descripcion: d.descripcion }),
      });
      const x = await r.json();
      if (!r.ok) {
        setError(x.error || "No se pudo editar");
        return;
      }
      setOk("Departamento actualizado.");
      cargar();
    } catch {
      setError("Error de conexión al editar.");
    }
  }

  async function alternar(d: Departamento) {
    try {
      const r = await fetch(`/api/departamentos-empresa/${d.id_departamento_empresa}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_registro: !d.estado_registro }),
      });
      const x = await r.json();
      if (!r.ok) {
        setError(x.error || "No se pudo cambiar el estado");
        return;
      }
      cargar();
    } catch {
      setError("Error de conexión al cambiar estado.");
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Departamentos empresariales</h1>
          <p className="subtitulo">
            Unidades del cliente, como Finanzas, Legal o Ventas. Se usan para asignar colaboradores y limitar la supervisión del Gestor de Área.
          </p>
        </div>
      </div>

      <form
        className="tarjeta-formulario"
        onSubmit={guardar}
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, maxWidth: 850, marginBottom: 20 }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Código *</label>
          <input
            className="input-base"
            maxLength={20}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="FIN"
            required
          />
          {codigo.length > 0 && (() => {
            const v = validarCodigo(codigo, 2, 20, "El código");
            return v.valido ? <AlertaCampo exito="Código válido." /> : <AlertaCampo error={v.mensaje} />;
          })()}
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Nombre *</label>
          <input
            className="input-base"
            maxLength={100}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Finanzas"
            required
          />
          {nombre.length > 0 && (() => {
            const v = validarTexto(nombre, 2, 100, "El nombre", true);
            return v.valido ? <AlertaCampo exito="Nombre válido." /> : <AlertaCampo error={v.mensaje} />;
          })()}
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Descripción</label>
          <input
            className="input-base"
            maxLength={255}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción opcional del área corporativa"
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 10 }}>{error}</p>}
          {ok && <p role="status" style={{ color: "#15803d", marginBottom: 10, fontWeight: 600 }}>{ok}</p>}
          <button className="boton-primario">Crear departamento</button>
        </div>
      </form>

      <div className="tarjeta-formulario">
        <h2>Unidades configuradas</h2>
        {items.length === 0 ? (
          <p>Aún no hay departamentos. Añade los que use esta organización.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Código</th>
                <th>Departamento</th>
                <th>Colaboradores</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id_departamento_empresa}>
                  <td>{d.codigo}</td>
                  <td>{d.nombre}</td>
                  <td>{d.colaboradores}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${d.estado_registro ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                      {d.estado_registro ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <BotonIcono
                        variante="normal"
                        icono={<Edit2 size={13} />}
                        titulo={`Editar departamento "${d.nombre}"`}
                        ariaLabel={`Editar departamento "${d.nombre}"`}
                        onClick={() => editar(d)}
                      />
                      <button
                        type="button"
                        className="boton-mini"
                        style={{ padding: "4px 8px", fontSize: 11.5 }}
                        onClick={() => alternar(d)}
                      >
                        {d.estado_registro ? "Inactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
