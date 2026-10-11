const fs = require('fs');

let code = fs.readFileSync('src/app/api/servicios/route.ts', 'utf8');

const target = `  const { searchParams } = new URL(req.url);
  const idTipo = searchParams.get("id_tipo");
  const idCategoria = searchParams.get("id_categoria");
  const buscar = searchParams.get("buscar");

  const condiciones: string[] = ["s.estado_registro = true"];`;

const replacement = `  const { searchParams } = new URL(req.url);
  const idTipo = searchParams.get("id_tipo");
  const idCategoria = searchParams.get("id_categoria");
  const buscar = searchParams.get("buscar");
  const estado = searchParams.get("estado"); // "activos", "inactivos", "todos"

  const condiciones: string[] = [];
  if (estado === "inactivos") {
    condiciones.push("s.estado_registro = false");
  } else if (estado === "todos") {
    // Sin filtro de estado
  } else {
    // Por defecto: activos
    condiciones.push("s.estado_registro = true");
  }`;

code = code.replace(target, replacement);

const targetSql = `    SELECT 
      s.id_servicio,
      s.codigo_servicio,
      s.id_tipo_ticket,
      tt.nombre as tipo_nombre,
      tt.codigo as tipo_codigo,
      s.id_categoria,
      cat.nombre as categoria_nombre,
      s.nombre,
      s.descripcion_comercial,
      s.entregable,
      s.requiere_aprobacion,
      s.sla_horas_resolucion,
      s.sla_horas_respuesta,
      s.costo_referencial,
      s.icono,
      s.estado_registro
    FROM servicio_catalogo s
    INNER JOIN tipo_ticket tt ON tt.id_tipo_ticket = s.id_tipo_ticket
    INNER JOIN categoria_ticket cat ON cat.id_categoria = s.id_categoria
    WHERE \${condiciones.join(" AND ")}
    ORDER BY s.id_tipo_ticket ASC, s.id_servicio ASC`;

const replacementSql = `    SELECT 
      s.id_servicio,
      s.codigo_servicio,
      s.id_tipo_ticket,
      tt.nombre as tipo_nombre,
      tt.codigo as tipo_codigo,
      s.id_categoria,
      cat.nombre as categoria_nombre,
      s.nombre,
      s.descripcion_comercial,
      s.entregable,
      s.requiere_aprobacion,
      s.sla_horas_resolucion,
      s.sla_horas_respuesta,
      s.costo_referencial,
      s.icono,
      s.estado_registro,
      s.motivo_inactivacion,
      s.fecha_inactivacion,
      s.usuario_inactivacion,
      CONCAT(u_inact.nombres, ' ', u_inact.apellido_paterno) AS usuario_inactivacion_nombre
    FROM servicio_catalogo s
    INNER JOIN tipo_ticket tt ON tt.id_tipo_ticket = s.id_tipo_ticket
    INNER JOIN categoria_ticket cat ON cat.id_categoria = s.id_categoria
    LEFT JOIN usuario u_inact ON s.usuario_inactivacion = u_inact.id_usuario
    WHERE \${condiciones.length > 0 ? condiciones.join(" AND ") : "1=1"}
    ORDER BY s.id_tipo_ticket ASC, s.id_servicio ASC`;

code = code.replace(targetSql, replacementSql);

fs.writeFileSync('src/app/api/servicios/route.ts', code, 'utf8');
console.log('src/app/api/servicios/route.ts updated');
