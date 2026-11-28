"use client";

// ============================================================================
// PERMISOS EN PANTALLA: el perfil activo llega desde el layout (servidor) y
// cada vista decide qué botones, pestañas o secciones mostrar con las mismas
// reglas que aplican las rutas de la API:
//   - useCapacidad(CAPACIDADES.X)  → la ruta valida esa capacidad
//   - usePuede(ACCIONES.X)         → la ruta valida esa lista de perfiles
// Ocultar un botón es solo comodidad: la seguridad real está en la ruta.
// ============================================================================

import { createContext, useContext } from "react";
import { type Capacidad, perfilPuedeAccion, tieneCapacidad } from "@/shared/lib/capacidades";

const ContextoPerfil = createContext<number | null>(null);

export function PermisosProvider({ idPerfil, children }: { idPerfil: number | null; children: React.ReactNode }) {
  return <ContextoPerfil.Provider value={idPerfil}>{children}</ContextoPerfil.Provider>;
}

/** Perfil activo de la sesión (null fuera de la plataforma). */
export function usePerfilActivo(): number | null {
  return useContext(ContextoPerfil);
}

/** ¿El perfil activo tiene la capacidad que exige la ruta? */
export function useCapacidad(capacidad: Capacidad): boolean {
  const perfil = useContext(ContextoPerfil);
  return perfil != null && tieneCapacidad(perfil, capacidad);
}

/** ¿El perfil activo está en la lista de la acción (tabla ACCIONES)? */
export function usePuede(accion: readonly number[]): boolean {
  return perfilPuedeAccion(useContext(ContextoPerfil), accion);
}
