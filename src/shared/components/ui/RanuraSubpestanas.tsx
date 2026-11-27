"use client";

// Regla del sistema de diseño: todas las filas de pestañas de una pantalla van
// ARRIBA, antes del título, y el título corresponde a la pestaña activa.
//
// Cuando una sección (componente hijo) tiene sus propias sub-pestañas pero el
// título lo dibuja el componente padre:
//   - el padre envuelve su vista con <ContenedorSubpestanas> y coloca
//     <RanuraSubpestanas /> justo debajo de su fila de pestañas (antes del título);
//   - el hijo envuelve su fila con <SubpestanasEnRanura>, que la dibuja en esa
//     ranura. Si no hay ranura (el hijo se usa suelto), la fila queda en su sitio.
//   - si el padre mantiene montadas las secciones ocultas, envuelve cada una con
//     <SeccionSubpestanas activa={...}> para que solo la visible publique su fila.

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Ranura = { nodo: HTMLDivElement | null; setNodo: (n: HTMLDivElement | null) => void };

const ContextoRanura = createContext<Ranura | null>(null);
const ContextoSeccionActiva = createContext(true);

export function SeccionSubpestanas({ activa, children }: { activa: boolean; children: ReactNode }) {
  return <ContextoSeccionActiva.Provider value={activa}>{children}</ContextoSeccionActiva.Provider>;
}

export function ContenedorSubpestanas({ children }: { children: ReactNode }) {
  const [nodo, setNodo] = useState<HTMLDivElement | null>(null);
  return <ContextoRanura.Provider value={{ nodo, setNodo }}>{children}</ContextoRanura.Provider>;
}

export function RanuraSubpestanas() {
  const ctx = useContext(ContextoRanura);
  return <div ref={ctx?.setNodo} data-ranura-subpestanas="" />;
}

export function SubpestanasEnRanura({ children }: { children: ReactNode }) {
  const ctx = useContext(ContextoRanura);
  const activa = useContext(ContextoSeccionActiva);
  if (!activa) return null;
  return ctx?.nodo ? createPortal(children, ctx.nodo) : <>{children}</>;
}
