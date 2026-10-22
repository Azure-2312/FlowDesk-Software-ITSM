"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Eye, EyeOff, Lock } from "@/shared/components/ui/Iconos";

interface SeccionFormulario {
  id: string;
  titulo: string;
  orden: number;
  abierta_defecto: boolean;
}

interface CampoFormulario {
  id: string;
  seccion: string;
  etiqueta: string;
  codigo: string;
  tipo: string;
  visible: boolean;
  obligatorio: "siempre" | "segun_estado" | "no";
  bloqueado: boolean;
  ancho: "1/3" | "1/2" | "full";
  ayuda?: string;
}

interface Props {
  datos: {
    secciones?: SeccionFormulario[];
    campos?: CampoFormulario[];
    campos_bloqueados?: string[];
    minimo_campos_visibles?: number;
  };
  onChange: (nuevosDatos: any) => void;
  bloqueado: boolean;
}

const CAMPOS_DEFECTO: CampoFormulario[] = [
  // Sección A
  { id: "c_codigo", seccion: "sec_a", etiqueta: "Código del activo", codigo: "codigo", tipo: "texto_solo_lectura", visible: true, obligatorio: "siempre", bloqueado: true, ancho: "1/3", ayuda: "Generado automáticamente según formato" },
  { id: "c_nombre", seccion: "sec_a", etiqueta: "Nombre / Hostname", codigo: "nombre", tipo: "texto", visible: true, obligatorio: "siempre", bloqueado: true, ancho: "1/3", ayuda: "Identificador principal del equipo" },
  { id: "c_clase", seccion: "sec_a", etiqueta: "Clase y tipo", codigo: "clase_id", tipo: "selector_cascada", visible: true, obligatorio: "siempre", bloqueado: true, ancho: "1/3", ayuda: "Jerarquía de clasificación" },
  { id: "c_fabricante", seccion: "sec_a", etiqueta: "Fabricante", codigo: "fabricante_id", tipo: "selector_catalogo", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/2" },
  { id: "c_modelo", seccion: "sec_a", etiqueta: "Modelo", codigo: "modelo_id", tipo: "selector_catalogo", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/2" },
  { id: "c_serie", seccion: "sec_a", etiqueta: "Número de serie", codigo: "numero_serie", tipo: "texto", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/2" },
  { id: "c_estado", seccion: "sec_a", etiqueta: "Estado del ciclo de vida", codigo: "estado_id", tipo: "insignia_estado", visible: true, obligatorio: "siempre", bloqueado: true, ancho: "1/2" },
  { id: "c_descripcion", seccion: "sec_a", etiqueta: "Descripción", codigo: "descripcion", tipo: "area_texto", visible: true, obligatorio: "no", bloqueado: false, ancho: "full" },

  // Sección B
  { id: "c_tipo_asig", seccion: "sec_b", etiqueta: "Tipo de asignación", codigo: "tipo_asignacion", tipo: "lista", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/2" },
  { id: "c_custodio", seccion: "sec_b", etiqueta: "Usuario asignado / Custodio", codigo: "custodio_id", tipo: "selector_usuario", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/2", ayuda: "Un solo custodio vigente garantizado" },
  { id: "c_depto", seccion: "sec_b", etiqueta: "Departamento", codigo: "departamento_id", tipo: "selector_departamento", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/2" },
  { id: "c_ubicacion", seccion: "sec_b", etiqueta: "Ubicación física", codigo: "ubicacion_id", tipo: "selector_arbol", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/2" },

  // Sección C
  { id: "c_proveedor", seccion: "sec_c", etiqueta: "Proveedor", codigo: "proveedor_id", tipo: "selector_proveedor", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/3" },
  { id: "c_tipo_adq", seccion: "sec_c", etiqueta: "Tipo de adquisición", codigo: "tipo_adquisicion", tipo: "lista", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/3" },
  { id: "c_orden_compra", seccion: "sec_c", etiqueta: "Orden de compra", codigo: "orden_compra", tipo: "texto", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/3" },
  { id: "c_costo", seccion: "sec_c", etiqueta: "Costo y moneda", codigo: "costo", tipo: "moneda_decimal", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/2" },
  { id: "c_garantia", seccion: "sec_c", etiqueta: "Inicio y fin de garantía", codigo: "garantia_fin", tipo: "rango_fechas", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/2" },

  // Sección D
  { id: "c_fechas_ciclo", seccion: "sec_d", etiqueta: "Fecha ingreso y puesta en producción", codigo: "fecha_produccion", tipo: "fecha", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/2" },
  { id: "c_vida_util", seccion: "sec_d", etiqueta: "Vida útil estimada y fin de vida", codigo: "vida_util_meses", tipo: "entero", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/2" },

  // Sección F
  { id: "c_es_ci", seccion: "sec_f", etiqueta: "¿Es elemento de configuración (CI)?", codigo: "es_ci", tipo: "casilla", visible: true, obligatorio: "siempre", bloqueado: false, ancho: "1/3" },
  { id: "c_criticidad", seccion: "sec_f", etiqueta: "Criticidad institucional", codigo: "criticidad_id", tipo: "selector_criticidad", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/3" },
  { id: "c_entorno", seccion: "sec_f", etiqueta: "Entorno operativo", codigo: "entorno_id", tipo: "selector_entorno", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/3" },
  { id: "c_servicios", seccion: "sec_f", etiqueta: "Servicios que soporta", codigo: "servicios", tipo: "selector_multiple_servicios", visible: true, obligatorio: "no", bloqueado: false, ancho: "full" },
  { id: "c_resp_tecnico", seccion: "sec_f", etiqueta: "Responsable técnico", codigo: "responsable_tecnico_id", tipo: "selector_usuario", visible: true, obligatorio: "segun_estado", bloqueado: false, ancho: "1/2" },
  { id: "c_relaciones", seccion: "sec_f", etiqueta: "Relaciones con otros CI", codigo: "relaciones", tipo: "subtabla_relaciones", visible: true, obligatorio: "no", bloqueado: false, ancho: "full" }
];

export function PestanaFormularioActivo({ datos, onChange, bloqueado }: Props) {
  const secciones = datos?.secciones || [
    { id: "sec_a", titulo: "Sección A — Identificación", orden: 1, abierta_defecto: true },
    { id: "sec_b", titulo: "Sección B — Asignación y ubicación", orden: 2, abierta_defecto: true },
    { id: "sec_c", titulo: "Sección C — Adquisición y finanzas", orden: 3, abierta_defecto: false },
    { id: "sec_d", titulo: "Sección D — Ciclo de vida", orden: 4, abierta_defecto: false },
    { id: "sec_e", titulo: "Sección E — Atributos técnicos", orden: 5, abierta_defecto: true },
    { id: "sec_f", titulo: "Sección F — CMDB", orden: 6, abierta_defecto: true },
    { id: "sec_g", titulo: "Sección G — Otros", orden: 7, abierta_defecto: false }
  ];

  const campos: CampoFormulario[] = datos?.campos || CAMPOS_DEFECTO;
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>("sec_a");
  const [tipoAplicacion, setTipoAplicacion] = useState<string>("TODOS");

  const toggleVisibilidad = (campoId: string) => {
    if (bloqueado) return;
    const campo = campos.find((c) => c.id === campoId);
    if (campo?.bloqueado) return; // No se ocultan campos protegidos
    const actualizados = campos.map((c) =>
      c.id === campoId ? { ...c, visible: !c.visible } : c
    );
    onChange({ ...datos, campos: actualizados });
  };

  const cambiarObligatoriedad = (campoId: string, valor: "siempre" | "segun_estado" | "no") => {
    if (bloqueado) return;
    const actualizados = campos.map((c) =>
      c.id === campoId ? { ...c, obligatorio: valor } : c
    );
    onChange({ ...datos, campos: actualizados });
  };

  const cambiarAncho = (campoId: string, ancho: "1/3" | "1/2" | "full") => {
    if (bloqueado) return;
    const actualizados = campos.map((c) =>
      c.id === campoId ? { ...c, ancho } : c
    );
    onChange({ ...datos, campos: actualizados });
  };

  const camposDeSeccion = campos.filter((c) => c.seccion === seccionSeleccionada);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Selector superior de alcance */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>
              Formulario
            </span>
            <strong style={{ fontSize: 13, color: "#0f172a" }}>Alta y Edición de Activo / CI</strong>
          </div>
          <div style={{ height: 28, width: 1, backgroundColor: "#e2e8f0" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Aplicar reglas a:</span>
            <select
              className="input-base"
              value={tipoAplicacion}
              onChange={(e) => setTipoAplicacion(e.target.value)}
              style={{ fontSize: 12, padding: "4px 10px" }}
            >
              <option value="TODOS">Todos los tipos (Configuración Base)</option>
              <option value="hardware">Clase: Hardware</option>
              <option value="portatil">Tipo: Portátil / Laptop</option>
              <option value="servidor_fisico">Tipo: Servidor físico</option>
              <option value="red">Clase: Equipos de Red</option>
            </select>
          </div>
        </div>

        <span style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>
          Mínimo obligatorio: 8 campos visibles (Protegidos: Código, Nombre, Clase/Tipo, Estado)
        </span>
      </div>

      {/* Navegación por secciones A-G */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {secciones.map((sec) => (
          <button
            key={sec.id}
            type="button"
            className={seccionSeleccionada === sec.id ? "boton-principal" : "boton-secundario"}
            onClick={() => setSeccionSeleccionada(sec.id)}
            style={{ fontSize: 11.5, padding: "6px 12px" }}
          >
            {sec.titulo}
          </button>
        ))}
      </div>

      {/* Editor de campos de la sección seleccionada */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px 0", color: "#0f172a" }}>
          Campos en {secciones.find((s) => s.id === seccionSeleccionada)?.titulo}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {camposDeSeccion.map((c) => (
            <div
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "240px 140px 180px 140px 1fr",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 6,
                backgroundColor: c.visible ? "#f8fafc" : "#f1f5f9",
                border: "1px solid #e2e8f0",
                opacity: c.visible ? 1 : 0.6
              }}
            >
              <div>
                <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block" }}>
                  {c.etiqueta}
                </strong>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span>{c.codigo}</span>
                  {c.bloqueado && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#64748b" }}>
                      (<Lock size={10} /> Bloqueado)
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, backgroundColor: "#ffffff", border: "1px solid #cbd5e1" }}>
                  {c.tipo}
                </span>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 2 }}>Obligatoriedad:</label>
                <select
                  className="input-base"
                  value={c.obligatorio}
                  disabled={bloqueado || c.bloqueado}
                  onChange={(e) => cambiarObligatoriedad(c.id, e.target.value as any)}
                  style={{ fontSize: 11, padding: "3px 6px", width: "100%" }}
                >
                  <option value="siempre">Siempre</option>
                  <option value="segun_estado">Según estado</option>
                  <option value="no">Opcional</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 2 }}>Ancho rejilla:</label>
                <select
                  className="input-base"
                  value={c.ancho}
                  disabled={bloqueado}
                  onChange={(e) => cambiarAncho(c.id, e.target.value as any)}
                  style={{ fontSize: 11, padding: "3px 6px", width: "100%" }}
                >
                  <option value="1/3">1/3 de fila</option>
                  <option value="1/2">1/2 de fila</option>
                  <option value="full">Fila completa</option>
                </select>
              </div>

              <div style={{ textAlign: "right" }}>
                <BotonIcono
                  variante="normal"
                  icono={c.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                  titulo={c.visible ? "Ocultar campo" : "Mostrar campo"}
                  ariaLabel={c.visible ? "Ocultar campo" : "Mostrar campo"}
                  disabled={bloqueado || c.bloqueado}
                  onClick={() => toggleVisibilidad(c.id)}
                />
              </div>
            </div>
          ))}

          {camposDeSeccion.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", backgroundColor: "#f8fafc", borderRadius: 6 }}>
              Los campos de esta sección se generan dinámicamente de acuerdo a la plantilla de atributos técnicos configurada en 1.5.1.3.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
