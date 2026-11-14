// ============================================================================
// MOTOR DE TAXONOMÍA: CONSTRUCTOR DEL ÁRBOL JERÁRQUICO DEL MENÚ
// ============================================================================
// Transforma registros relacionales planos de opciones_menu en un árbol jerárquico
// de navegación filtrado según los perfiles y permisos del usuario autenticado.
// ============================================================================

import { query } from "@/shared/lib/db";
import { OpcionMenuArbol, OpcionMenuPlana } from "@/types";

// ----------------------------------------------------------------------------
// 1. CONSULTAS A BASE DE DATOS: Opciones asignadas por perfil y por usuario
// ----------------------------------------------------------------------------

/**
 * Consulta las opciones de menú asignadas a un perfil específico en opciones_menu_perfiles.
 */
async function obtenerOpcionesPorPerfil(idPerfil: number): Promise<OpcionMenuPlana[]> {
  const sql = `
    SELECT DISTINCT om.id_opcion_menu, om.nombre, om.url_menu, om.descripcion,
           om.id_padre, om.nivel, om.orden, om.contador_clave, om.bloqueado, om.abierto_por_defecto
    FROM opciones_menu om
    INNER JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu
    WHERE omp.id_perfil = $1
      AND omp.estado_registro = true
      AND om.estado_registro = true
    ORDER BY om.nivel, om.orden;
  `;
  return query<OpcionMenuPlana>(sql, [idPerfil]);
}

/**
 * Consulta todas las opciones a las que tiene acceso el usuario según todos sus perfiles activos.
 */
async function obtenerOpcionesPlanasPorUsuario(idUsuario: number): Promise<OpcionMenuPlana[]> {
  const sql = `
    SELECT DISTINCT om.id_opcion_menu, om.nombre, om.url_menu, om.descripcion,
           om.id_padre, om.nivel, om.orden, om.contador_clave, om.bloqueado, om.abierto_por_defecto
    FROM opciones_menu om
    INNER JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu
    INNER JOIN usuario_perfiles up ON up.id_perfil = omp.id_perfil
    WHERE up.id_usuario = $1
      AND up.estado_registro = true
      AND omp.estado_registro = true
      AND om.estado_registro = true
    ORDER BY om.nivel, om.orden;
  `;
  return query<OpcionMenuPlana>(sql, [idUsuario]);
}

// ----------------------------------------------------------------------------
// 2. OPTIMIZACIÓN VISUAL: Colapso de subcarpetas redundantes de un solo hijo
// ----------------------------------------------------------------------------

/**
 * Simplifica la navegación colapsando carpetas intermedias que solo contienen una opción.
 * Las carpetas de nivel raíz (esNivelRaiz = true) se conservan siempre intactas.
 */
function colapsarCarpetasDeUnHijo(nodos: OpcionMenuArbol[], esNivelRaiz: boolean = false): OpcionMenuArbol[] {
  const resultado: OpcionMenuArbol[] = [];

  for (const nodo of nodos) {
    nodo.hijos = colapsarCarpetasDeUnHijo(nodo.hijos, false);

    if (!nodo.url_menu && nodo.hijos.length === 0) continue;
    if (!esNivelRaiz && !nodo.url_menu && nodo.hijos.length === 1) {
      resultado.push(nodo.hijos[0]);
      continue;
    }
    resultado.push(nodo);
  }

  return resultado;
}

// ----------------------------------------------------------------------------
// 3. TRANSFORMACIÓN ALGORÍTMICA: Lista plana con id_padre -> Árbol jerárquico
// ----------------------------------------------------------------------------

/**
 * Mapea las opciones planas a nodos con arreglo de hijos y los vincula por id_padre.
 */
function construirArbol(opciones: OpcionMenuPlana[]): OpcionMenuArbol[] {
  const mapa = new Map<number, OpcionMenuArbol>();

  opciones.forEach((op) => mapa.set(op.id_opcion_menu, { ...op, hijos: [] }));

  const raiz: OpcionMenuArbol[] = [];

  opciones.forEach((op) => {
    const nodo = mapa.get(op.id_opcion_menu)!;
    if (op.id_padre === null) {
      raiz.push(nodo);
    } else {
      const padre = mapa.get(op.id_padre);
      if (padre) {
        padre.hijos.push(nodo);
      } else {
        // Si el padre no está asignado al perfil, se eleva el nodo a la raíz
        raiz.push(nodo);
      }
    }
  });

  // Ordenamiento según la propiedad orden
  raiz.sort((a, b) => a.orden - b.orden);
  mapa.forEach((nodo) => {
    if (nodo.hijos.length > 0) {
      nodo.hijos.sort((a, b) => a.orden - b.orden);
    }
  });

  return colapsarCarpetasDeUnHijo(raiz, true);
}

// ----------------------------------------------------------------------------
// 4. FUNCIÓN EXPORTADA: Punto de entrada para obtener el menú del usuario
// ----------------------------------------------------------------------------

/**
 * Obtiene el árbol jerárquico del menú según el perfil activo o todos los perfiles del usuario.
 */
export async function obtenerMenuDelUsuario(
  idUsuario: number,
  idPerfilActivo?: number
): Promise<OpcionMenuArbol[]> {
  let planas: OpcionMenuPlana[];

  if (idPerfilActivo) {
    planas = await obtenerOpcionesPorPerfil(idPerfilActivo);
  } else {
    planas = await obtenerOpcionesPlanasPorUsuario(idUsuario);
  }

  return construirArbol(planas);
}

// ----------------------------------------------------------------------------
// 5. VALIDACIONES DE NAVEGACIÓN: Autorización de pantallas y prefijos
// ----------------------------------------------------------------------------

/**
 * Valida si una ruta específica está habilitada en el menú del usuario.
 */
export function menuIncluyeUrl(menu: OpcionMenuArbol[], url: string): boolean {
  for (const nodo of menu) {
    if (nodo.url_menu === url) return true;
    if (nodo.hijos?.length && menuIncluyeUrl(nodo.hijos, url)) return true;
  }
  return false;
}

/**
 * Valida si un prefijo de ruta (ej. /plataforma/incidentes) está dentro del menú del usuario.
 */
export function menuIncluyePrefijo(menu: OpcionMenuArbol[], prefijo: string): boolean {
  for (const nodo of menu) {
    if (nodo.url_menu === prefijo || (nodo.url_menu && nodo.url_menu.startsWith(`${prefijo}/`))) return true;
    if (nodo.hijos?.length && menuIncluyePrefijo(nodo.hijos, prefijo)) return true;
  }
  return false;
}
