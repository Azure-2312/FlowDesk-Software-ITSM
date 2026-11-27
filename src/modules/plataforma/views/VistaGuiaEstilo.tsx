"use client";

// ============================================================================
// GUÍA DEL SISTEMA DE DISEÑO FLOWDESK
// Muestra cada componente visual en su única forma permitida. Las vistas del
// sistema usan exactamente estas clases; `npm run test:estilos` detecta
// cualquier botón, pestaña o título que se salga del catálogo.
// ============================================================================

import { useState } from "react";
import Pestanas from "@/shared/components/ui/Pestanas";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";

const COLORES = [
  { nombre: "Primario", variable: "--color-primario", uso: "Acción principal, pestaña activa, enlaces" },
  { nombre: "Peligro", variable: "--color-peligro", uso: "Eliminar, rechazar, dar de baja" },
  { nombre: "Éxito", variable: "--color-exito", uso: "Estados activos, confirmaciones" },
  { nombre: "Texto", variable: "--color-texto", uso: "Títulos y texto principal" },
  { nombre: "Texto tenue", variable: "--color-texto-tenue", uso: "Descripciones y ayudas" },
  { nombre: "Borde", variable: "--color-borde", uso: "Tarjetas, tablas, separadores" },
];

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: React.ReactNode }) {
  return (
    <section className="tarjeta-contenido" style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-texto)" }}>{titulo}</h2>
      <p className="descripcion-pagina" style={{ marginBottom: 16 }}>{descripcion}</p>
      {children}
    </section>
  );
}

const fila: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" };
const codigo: React.CSSProperties = { fontFamily: "ui-monospace, Consolas, monospace", fontSize: 12, color: "var(--color-texto-secundario)" };

const IconoActualizar = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconoEliminar = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
  </svg>
);

export default function VistaGuiaEstilo() {
  const [pestana, setPestana] = useState<"general" | "detalle" | "historial">("general");
  const [activo, setActivo] = useState(true);
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [opcion, setOpcion] = useState<"normal" | "estandar">("normal");

  return (
    <div className="vista-contenedor">
      <Pestanas
        items={[
          { id: "general", etiqueta: "General" },
          { id: "detalle", etiqueta: "Detalle", contador: 3 },
          { id: "historial", etiqueta: "Historial" },
        ]}
        activa={pestana}
        onCambiar={setPestana}
      />

      <div className="cabecera-pagina">
        <div>
          <h1 className="titulo-pagina">
            {pestana === "general" ? "Guía del sistema de diseño" : pestana === "detalle" ? "Detalle de la guía" : "Historial de la guía"}
          </h1>
          <p className="descripcion-pagina">
            Única forma permitida de cada elemento visual de FlowDesk. Toda vista usa estas clases; el verificador
            (<span style={codigo}>npm run test:estilos</span>) bloquea el build si algo se sale del catálogo.
          </p>
        </div>
        <button type="button" className="boton-primario">Acción principal</button>
      </div>

      <Seccion
        titulo="Cabecera de página"
        descripcion="Orden fijo de toda pantalla: 1) pestañas (si las hay; las sub-pestañas en una segunda fila), 2) título de la pestaña activa (.titulo-pagina) con su descripción (.descripcion-pagina) y acciones a la derecha, 3) contenido. Nunca hay pestañas debajo del título, como en esta misma página."
      >
        <p style={codigo}>{'<div className="cabecera-pagina"> <h1 className="titulo-pagina"/> <p className="descripcion-pagina"/> </div>'}</p>
      </Seccion>

      <Seccion
        titulo="Botones"
        descripcion="Cinco variantes y un tamaño compacto. Regla: un botón lleva icono o texto, nunca los dos. Solo icono cuando el espacio es reducido (tablas, refrescar), siempre con título."
      >
        <div style={fila}>
          <button type="button" className="boton-primario">Guardar cambios</button>
          <button type="button" className="boton-secundario">Cancelar</button>
          <button type="button" className="boton-peligro">Eliminar</button>
          <button type="button" className="boton-enlace">Ver detalle</button>
          <BotonIcono icono={IconoActualizar} titulo="Actualizar" className="" />
          <button type="button" className="boton-icono boton-icono-peligro" title="Eliminar" aria-label="Eliminar">{IconoEliminar}</button>
          <button type="button" className="boton-primario" disabled>Deshabilitado</button>
        </div>
        <div style={{ ...fila, marginTop: 12 }}>
          <button type="button" className="boton-primario boton-sm">Aprobar</button>
          <button type="button" className="boton-secundario boton-sm">Editar</button>
          <button type="button" className="boton-peligro boton-sm">Rechazar</button>
          <button
            type="button"
            className="boton-secundario boton-sm"
            aria-pressed={soloPendientes}
            onClick={() => setSoloPendientes(!soloPendientes)}
          >
            Solo pendientes
          </button>
          <span style={codigo}>.boton-sm · aria-pressed para filtros que se activan/desactivan</span>
        </div>
      </Seccion>

      <Seccion
        titulo="Pestañas"
        descripcion="Una sola forma: línea inferior azul en la activa, contador opcional. <PestanasVista> si la pestaña cambia la URL (?vista=), <Pestanas> si es estado de la pantalla. Siempre arriba del título. Única excepción: un selector dentro de una tarjeta o panel (como este ejemplo) o en la ficha de un registro, marcado con ambito."
      >
        <Pestanas
          ambito="panel"
          items={[
            { id: "general", etiqueta: "Pendientes", contador: 12 },
            { id: "detalle", etiqueta: "Historial" },
            { id: "historial", etiqueta: "Configuración" },
          ]}
          activa={pestana}
          onCambiar={setPestana}
        />
      </Seccion>

      <Seccion titulo="Interruptor y opciones" descripcion="Activar/desactivar con .interruptor; elegir una opción entre tarjetas con .opcion-seleccionable.">
        <div style={{ ...fila, marginBottom: 14 }}>
          <button
            type="button"
            role="switch"
            aria-checked={activo}
            className={activo ? "interruptor interruptor-activo" : "interruptor"}
            onClick={() => setActivo(!activo)}
            title={activo ? "Desactivar" : "Activar"}
          />
          <span style={{ fontSize: 13 }}>{activo ? "Activo" : "Inactivo"}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 12 }}>
          {(["normal", "estandar"] as const).map((o) => (
            <button
              key={o}
              type="button"
              className={opcion === o ? "opcion-seleccionable opcion-seleccionada" : "opcion-seleccionable"}
              onClick={() => setOpcion(o)}
            >
              <strong style={{ display: "block", fontSize: 14 }}>{o === "normal" ? "Cambio normal" : "Cambio estándar"}</strong>
              <span style={{ fontSize: 12, color: "var(--color-texto-tenue)" }}>
                {o === "normal" ? "Requiere evaluación y aprobación del CAB." : "Preaprobado, de bajo riesgo."}
              </span>
            </button>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Mensajes y estados vacíos" descripcion="Avisos con .mensaje-error / .mensaje-exito; sin resultados con .estado-vacio (o .celda-vacia dentro de una tabla).">
        <div className="mensaje-exito">Cambios guardados correctamente.</div>
        <div className="mensaje-error" style={{ marginBottom: 16 }}>No se pudo guardar: revisa los campos obligatorios.</div>
        <div className="estado-vacio">No se encontraron tickets con los filtros aplicados.</div>
      </Seccion>

      <Seccion titulo="Colores" descripcion="Variables definidas en :root (globals.css). Ninguna vista escribe colores de botones o pestañas a mano.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 12 }}>
          {COLORES.map((c) => (
            <div key={c.variable} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ width: 36, height: 36, borderRadius: 8, background: `var(${c.variable})`, border: "1px solid var(--color-borde)", flexShrink: 0 }} />
              <span style={{ fontSize: 12.5 }}>
                <strong style={{ display: "block" }}>{c.nombre}</strong>
                <span style={codigo}>{c.variable}</span>
                <span style={{ display: "block", color: "var(--color-texto-tenue)" }}>{c.uso}</span>
              </span>
            </div>
          ))}
        </div>
      </Seccion>
    </div>
  );
}
