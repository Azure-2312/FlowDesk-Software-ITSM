const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log("Testing tecnicos query...");
    const sql1 = `
      SELECT 
        td.id_tecnico_detalle,
        td.id_usuario,
        u.nombres,
        u.apellido_paterno,
        CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo,
        u.correo_electronico,
        u.celular,
        td.id_departamento,
        dep.id_departamento as dep_id,
        dep.nombre as departamento_nombre,
        dep.codigo as departamento_codigo,
        td.nivel_soporte,
        td.capacidad_maxima_tickets,
        td.estado_operativo,
        td.especialidad_principal,
        td.estado_registro,
        COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND t.estado_registro = true)::int as tickets_activos,
        COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (5, 6) AND t.estado_registro = true)::int as tickets_resueltos,
        COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND t.id_prioridad IN (1, 2) AND t.estado_registro = true)::int as tickets_criticos,
        COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND t.fecha_limite_sla < NOW() AND t.estado_registro = true)::int as tickets_sla_vencido
      FROM tecnico_detalle td
      INNER JOIN usuario u ON u.id_usuario = td.id_usuario
      INNER JOIN departamento_ti dep ON dep.id_departamento = td.id_departamento
      LEFT JOIN ticket t ON t.id_usuario_asignado = td.id_usuario
      WHERE td.estado_registro = true AND u.estado_registro = true
      GROUP BY 
        td.id_tecnico_detalle, td.id_usuario, u.nombres, u.apellido_paterno,
        u.correo_electronico, u.celular, td.id_departamento, dep.id_departamento, dep.nombre, dep.codigo,
        td.nivel_soporte, td.capacidad_maxima_tickets, td.estado_operativo,
        td.especialidad_principal, td.estado_registro
      ORDER BY dep.id_departamento ASC, td.nivel_soporte ASC, u.nombres ASC
    `;
    const res1 = await pool.query(sql1);
    console.log("Query 1 (tecnicos) OK! Rows:", res1.rows.length);

    console.log("Testing departamentos query...");
    const sql2 = `
      SELECT 
        d.id_departamento,
        d.codigo,
        d.nombre,
        d.descripcion,
        d.id_supervisor,
        CONCAT(u.nombres, ' ', u.apellido_paterno) as supervisor_nombre,
        COUNT(t.id_tecnico_detalle)::int as cantidad_tecnicos,
        d.estado_registro
      FROM departamento_ti d
      LEFT JOIN usuario u ON u.id_usuario = d.id_supervisor
      LEFT JOIN tecnico_detalle t ON t.id_departamento = d.id_departamento AND t.estado_registro = true
      WHERE d.estado_registro = true
      GROUP BY d.id_departamento, d.codigo, d.nombre, d.descripcion, d.id_supervisor, u.nombres, u.apellido_paterno, d.estado_registro
      ORDER BY d.id_departamento ASC
    `;
    const res2 = await pool.query(sql2);
    console.log("Query 2 (departamentos) OK! Rows:", res2.rows.length);

    console.log("Testing catalogos tecnicos query...");
    const sql3 = `
      SELECT DISTINCT u.id_usuario, 
              CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre,
              u.correo_electronico as correo,
              td.id_departamento,
              dep.nombre as departamento_nombre,
              td.nivel_soporte,
              COALESCE(td.estado_operativo, 'DISPONIBLE') as estado_operativo,
              COALESCE(td.capacidad_maxima_tickets, 8) as capacidad_maxima_tickets,
              COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND t.estado_registro = true)::int as tickets_activos
       FROM usuario u
       INNER JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario
       LEFT JOIN tecnico_detalle td ON td.id_usuario = u.id_usuario AND td.estado_registro = true
       LEFT JOIN departamento_ti dep ON dep.id_departamento = td.id_departamento
       LEFT JOIN ticket t ON t.id_usuario_asignado = u.id_usuario
       WHERE up.id_perfil IN (1, 2)
         AND up.estado_registro = true
         AND u.estado_registro = true
       GROUP BY u.id_usuario, u.nombres, u.apellido_paterno, u.correo_electronico, td.id_departamento, dep.nombre, td.nivel_soporte, td.estado_operativo, td.capacidad_maxima_tickets
       ORDER BY nombre
    `;
    const res3 = await pool.query(sql3);
    console.log("Query 3 (catalogos tecnicos) OK! Rows:", res3.rows.length);

  } catch (e) {
    console.error("Test error:", e);
  } finally {
    await pool.end();
  }
}

test();
