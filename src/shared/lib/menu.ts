import { query } from "@/shared/lib/db";
import { OpcionMenuArbol, OpcionMenuPlana } from "@/types";

/**
 * Trae las opciones de menú asignadas a un perfil específico.
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
 * Trae todas las opciones a las que tiene acceso el usuario según todos sus perfiles activos.
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

/**
 * Regla de la arquitectura del menu: una subcarpeta intermedia que solo muestra
 * un hijo se colapsa para simplificar la navegacion hacia arriba.
 *
 * Sin embargo, las carpetas de nivel raiz (esNivelRaiz = true) se conservan
 * intactas para preservar la identidad de los dominios funcionales (ITSM / ITIL)
 * y evitar que pantallas unicas queden como elementos huerfanos sin contexto.
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

/**
 * Convierte la lista plana (con id_padre) en un árbol de profundidad variable.
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
        // Si el padre no está asignado al perfil, mostramos el nodo en la raíz
        raiz.push(nodo);
      }
    }
  });

  // Ordenar nodos de la raíz y los hijos según el campo orden
  raiz.sort((a, b) => a.orden - b.orden);
  mapa.forEach((nodo) => {
    if (nodo.hijos.length > 0) {
      nodo.hijos.sort((a, b) => a.orden - b.orden);
    }
  });

  return colapsarCarpetasDeUnHijo(raiz, true);
}

/**
 * Función principal: obtiene el árbol jerárquico de menú filtrado por el perfil activo del usuario
 * respetando la taxonomía del catálogo (tres niveles como norma y cuatro en la configuración de la mesa).
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

/**
 * Indica si el arbol de menu del usuario incluye exactamente una pantalla.
 * Se usa en las paginas de los modulos para autorizar la ruta solicitada.
 */
export function menuIncluyeUrl(menu: OpcionMenuArbol[], url: string): boolean {
  for (const nodo of menu) {
    if (nodo.url_menu === url) return true;
    if (nodo.hijos?.length && menuIncluyeUrl(nodo.hijos, url)) return true;
  }
  return false;
}

/**
 * Indica si el arbol de menu del usuario incluye alguna pantalla bajo un
 * prefijo (por ejemplo `/plataforma/incidentes`). Se usa en las fichas de
 * detalle, que no aparecen como opcion propia del menu.
 */
export function menuIncluyePrefijo(menu: OpcionMenuArbol[], prefijo: string): boolean {
  for (const nodo of menu) {
    if (nodo.url_menu === prefijo || (nodo.url_menu && nodo.url_menu.startsWith(`${prefijo}/`))) return true;
    if (nodo.hijos?.length && menuIncluyePrefijo(nodo.hijos, prefijo)) return true;
  }
  return false;
}
