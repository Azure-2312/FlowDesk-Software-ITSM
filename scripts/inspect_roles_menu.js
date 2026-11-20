const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  for (const pid of [3, 2]) {
    const p = await pool.query('SELECT nombre FROM perfiles WHERE id_perfil = $1', [pid]);
    console.log(`\n=======================================================`);
    console.log(`PERFIL ${pid}: ${p.rows[0]?.nombre}`);
    console.log(`=======================================================`);
    const res = await pool.query(`
      SELECT om.id_opcion_menu, om.nombre AS nombre_opcion, om.url_menu, om.id_padre, om.orden
      FROM opciones_menu_perfiles omp
      JOIN opciones_menu om ON om.id_opcion_menu = omp.id_opcion_menu
      WHERE omp.id_perfil = $1 AND omp.estado_registro = true AND om.estado_registro = true
      ORDER BY om.id_padre NULLS FIRST, om.orden
    `, [pid]);
    
    // Group by root/parent
    const roots = res.rows.filter(r => r.id_padre === null);
    for (const root of roots) {
      console.log(`[ROOT ${root.id_opcion_menu}] ${root.nombre_opcion} (${root.url_menu || 'sin url'})`);
      const children = res.rows.filter(r => r.id_padre === root.id_opcion_menu);
      for (const child of children) {
        console.log(`   ├── [${child.id_opcion_menu}] ${child.nombre_opcion} -> ${child.url_menu}`);
        const subchildren = res.rows.filter(r => r.id_padre === child.id_opcion_menu);
        for (const sub of subchildren) {
          console.log(`   │    └── [${sub.id_opcion_menu}] ${sub.nombre_opcion} -> ${sub.url_menu}`);
        }
      }
    }

    // Also get vistas
    console.log(`\n--- Vistas N1 permitidas para Perfil ${pid} ---`);
    const vistas = await pool.query(`
      SELECT om.nombre, om.url_menu, ompv.vista
      FROM opciones_menu_vistas_perfiles ompv
      JOIN opciones_menu om ON om.id_opcion_menu = ompv.id_opcion_menu
      WHERE ompv.id_perfil = $1 AND ompv.estado_registro = true
      ORDER BY om.url_menu, ompv.vista
    `, [pid]);
    vistas.rows.forEach(v => {
      console.log(`   ${v.url_menu} (${v.nombre}) -> vista: [${v.vista}]`);
    });
  }
}

check().catch(console.error).finally(() => pool.end());
