const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.qagfznblisjownpozmen:13011124-APMA@aws-0-us-east-2.pooler.supabase.com:5432/postgres",
});

async function test(idPerfil, nombrePerfil) {
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
  const mapa = new Map();
  res.rows.forEach((op) => mapa.set(op.id_opcion_menu, { ...op, hijos: [] }));
  const raiz = [];
  res.rows.forEach((op) => {
    const nodo = mapa.get(op.id_opcion_menu);
    if (op.id_padre === null) {
      raiz.push(nodo);
    } else {
      const padre = mapa.get(op.id_padre);
      if (padre) padre.hijos.push(nodo);
      else raiz.push(nodo);
    }
  });

  raiz.sort((a, b) => a.orden - b.orden);
  mapa.forEach((n) => n.hijos.sort((a, b) => a.orden - b.orden));

  function printTree(nodes, indent) {
    for (const n of nodes) {
      console.log(indent + "[" + n.id_opcion_menu + "] " + n.nombre + " -> " + n.url_menu);
      if (n.hijos.length > 0) printTree(n.hijos, indent + "    ");
    }
  }

  console.log("\n================ PERFIL " + idPerfil + ": " + nombrePerfil + " ================");
  printTree(raiz, "");
}

async function run() {
  await test(1, "Administrador");
  await test(2, "Tecnico");
  await test(3, "Solicitante");
  await test(4, "Supervisor");
  await test(5, "Gestor de Area");
  await test(6, "Auditor");
  await test(7, "Aprobador CAB");
  await test(8, "Gestor de Cambios");
  await test(9, "Gestor de Activos y Configuracion");
  await pool.end();
}

run();
