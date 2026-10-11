const fs = require('fs');
const { Pool } = require('c:/Users/apaza/Desktop/SISTEMA DE TICKETS/node_modules/pg');

const envContent = fs.readFileSync('c:/Users/apaza/Desktop/SISTEMA DE TICKETS/.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n\r]+)"?/);
const pool = new Pool({ connectionString: match[1].trim() });

async function obtenerOpcionesPorPerfil(idPerfil) {
  const sql = `
    SELECT DISTINCT om.id_opcion_menu, om.nombre, om.url_menu, om.descripcion,
           om.id_padre, om.nivel, om.orden
    FROM opciones_menu om
    INNER JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu
    WHERE omp.id_perfil = $1
      AND omp.estado_registro = true
      AND om.estado_registro = true
    ORDER BY om.nivel, om.orden;
  `;
  const res = await pool.query(sql, [idPerfil]);
  return res.rows;
}

function construirArbol(opciones) {
  const mapa = new Map();
  opciones.forEach((op) => mapa.set(op.id_opcion_menu, { ...op, hijos: [] }));
  const raiz = [];

  opciones.forEach((op) => {
    const nodo = mapa.get(op.id_opcion_menu);
    if (op.id_padre === null) {
      raiz.push(nodo);
    } else {
      const padre = mapa.get(op.id_padre);
      if (padre) {
        padre.hijos.push(nodo);
      } else {
        raiz.push(nodo);
      }
    }
  });

  return raiz;
}

/**
 * Nueva función de aplanado inteligente general:
 * 1. Si un nodo tiene hijos, primero procesa recursivamente los hijos.
 * 2. Si un nodo contenedor tiene exactamente 1 hijo (hijos.length === 1),
 *    ese contenedor se desenvuelve (se sustituye por su único hijo).
 * 3. Si la raíz completa tiene un único módulo contenedor, se promueve al nivel principal.
 * 4. Reajusta los niveles (1, 2, 3) secuencialmente para coherencia con el CSS.
 */
function aplanarMenuInteligente(arbol) {
  // Función recursiva que desenvuelve contenedores con hijo único
  function desenvolverNodos(nodos) {
    const resultado = [];

    for (const nodo of nodos) {
      // Procesar hijos recursivamente primero
      const hijosProcesados = desenvolverNodos(nodo.hijos);

      // Si el nodo tiene exactamente 1 hijo, lo desenvolvemos (el hijo toma su lugar)
      if (hijosProcesados.length === 1) {
        resultado.push(...hijosProcesados);
      } else {
        resultado.push({
          ...nodo,
          hijos: hijosProcesados,
        });
      }
    }

    return resultado;
  }

  let arbolDesenvuelto = desenvolverNodos(arbol);

  // Si queda un único contenedor en la raíz sin ningún otro módulo, promovemos sus hijos
  if (arbolDesenvuelto.length === 1 && arbolDesenvuelto[0].hijos.length > 0) {
    arbolDesenvuelto = arbolDesenvuelto[0].hijos;
  }

  // Reajustar niveles CSS
  function reajustarNiveles(nodos, nivelActual = 1) {
    return nodos.map((n) => ({
      ...n,
      nivel: nivelActual,
      hijos: reajustarNiveles(n.hijos, nivelActual + 1),
    }));
  }

  return reajustarNiveles(arbolDesenvuelto, 1);
}

function imprimirArbol(nodos, indent = '') {
  for (const n of nodos) {
    console.log(`${indent}- [Nivel ${n.nivel}] ${n.nombre} (${n.url_menu})`);
    if (n.hijos.length > 0) {
      imprimirArbol(n.hijos, indent + '    ');
    }
  }
}

async function testAll() {
  const perfiles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Técnico' },
    { id: 3, nombre: 'Solicitante' },
    { id: 4, nombre: 'Supervisor' },
  ];

  for (const p of perfiles) {
    console.log(`\n========================================`);
    console.log(`MENU PARA: ${p.nombre} (id: ${p.id})`);
    console.log(`========================================`);
    const planas = await obtenerOpcionesPorPerfil(p.id);
    const arbol = construirArbol(planas);
    const menuFinal = aplanarMenuInteligente(arbol);
    imprimirArbol(menuFinal);
  }

  await pool.end();
}

testAll().catch(console.error);
