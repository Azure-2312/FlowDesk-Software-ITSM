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
 * Regla de la arquitectura del menu: una carpeta que solo muestra un hijo no
 * aporta nada, asi que desaparece y el hijo sube un nivel. Se aplica de abajo
 * hacia arriba, para que el colapso se propague en cascada.
 *
 * Se hace sobre el arbol que ve cada perfil, no sobre el catalogo: el catalogo
 * es uno solo (carpetas por modulo) y la visibilidad N:M decide que parte ve
 * cada perfil. Si la carpeta se queda sin hijos visibles, tampoco se dibuja.
 */
function colapsarCarpetasDeUnHijo(nodos: OpcionMenuArbol[]): OpcionMenuArbol[] {
  const resultado: OpcionMenuArbol[] = [];

  for (const nodo of nodos) {
    nodo.hijos = colapsarCarpetasDeUnHijo(nodo.hijos);

    if (!nodo.url_menu && nodo.hijos.length === 0) continue;
    if (nodo.hijos.length === 1) {
      resultado.push(nodo.hijos[0]);
      continue;
    }
    resultado.push(nodo);
  }

  return resultado;
}

/**
 * Convierte la lista plana (con id_padre) en un árbol de hasta 3 niveles.
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

  return colapsarCarpetasDeUnHijo(raiz);
}

/**
 * Función principal: obtiene el árbol jerárquico de menú filtrado por el perfil activo del usuario
 * respetando la taxonomía oficial de 3 niveles de ITIL v4 e ISO 27001.
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

