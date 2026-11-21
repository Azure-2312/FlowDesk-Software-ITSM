// ============================================================================
// SERVICIO DE EQUIPO DE TRABAJO EN PROBLEMAS (ITIL v4)
// ============================================================================
// Consulta el equipo de soporte técnico asignado a la investigación de problemas,
// sus integrantes, problemas activos de causa raíz e historial de problemas resueltos.
// ============================================================================

import { query, queryRow } from "@/shared/lib/db";

export interface IntegranteEquipoProblemas {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  cargo: string | null;
  rol: string;
}

export interface ProblemaEquipoResumen {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  id_estado: number;
  estado_nombre: string;
  color_estado: string;
  causa_raiz: string | null;
  workaround: string | null;
  metodo_analisis: string | null;
  tecnico_asignado: string;
  fecha_creacion: string;
}

export interface DatosEquipoProblemas {
  perteneceAEquipo: boolean;
  nombreEquipo: string;
  descripcionEquipo: string;
  integrantes: IntegranteEquipoProblemas[];
  problemasActivos: ProblemaEquipoResumen[];
  historialResueltos: ProblemaEquipoResumen[];
}

function mapearEstadoProblema(idEstado: number): { nombre: string; color: string } {
  switch (idEstado) {
    case 1:
      return { nombre: "Registrado", color: "#64748b" };
    case 2:
      return { nombre: "En Investigación", color: "#d97706" };
    case 3:
      return { nombre: "Causa Raíz Identificada", color: "#2563eb" };
    case 4:
      return { nombre: "Error Conocido (KEDB)", color: "#7c3aed" };
    case 5:
      return { nombre: "Resuelto", color: "#059669" };
    case 6:
      return { nombre: "Cerrado", color: "#10b981" };
    default:
      return { nombre: "En Curso", color: "#3b82f6" };
  }
}

export async function obtenerDatosEquipoProblemas(idUsuario: number): Promise<DatosEquipoProblemas> {
  // 1. Obtener departamento del usuario
  const usuarioInfo = await queryRow<{
    id_departamento: number | null;
    depto_nombre: string | null;
  }>(
    `SELECT u.id_departamento, COALESCE(d.nombre, 'Equipo Técnico de Soporte') AS depto_nombre
     FROM usuario u
     LEFT JOIN departamento_ti d ON d.id_departamento = u.id_departamento
     WHERE u.id_usuario = $1`,
    [idUsuario]
  );

  const idDepto = usuarioInfo?.id_departamento;
  const perteneceAEquipo = Boolean(idDepto);
  const nombreEquipo = idDepto ? (usuarioInfo?.depto_nombre || "Equipo de Gestión de Problemas") : "";

  // 2. Obtener integrantes si pertenece a un equipo
  let integrantes: IntegranteEquipoProblemas[] = [];
  if (idDepto) {
    const rows = await query<{
      id_usuario: number;
      nombre_completo: string;
      correo: string;
      cargo: string | null;
    }>(
      `SELECT u.id_usuario,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre_completo,
              u.correo_electronico AS correo,
              COALESCE((
                SELECT p.nombre FROM usuario_perfiles up
                JOIN perfiles p ON p.id_perfil = up.id_perfil
                WHERE up.id_usuario = u.id_usuario AND up.estado_registro = true
                LIMIT 1
              ), 'Especialista Técnico') AS cargo
       FROM usuario u
       WHERE u.id_departamento = $1 AND u.estado_registro = true
       ORDER BY u.nombres ASC`,
      [idDepto]
    );

    integrantes = rows.map((r) => ({
      id_usuario: r.id_usuario,
      nombre_completo: r.nombre_completo,
      correo: r.correo,
      cargo: r.cargo,
      rol: r.id_usuario === idUsuario ? "Tú (Investigador)" : "Compañero de Equipo",
    }));
  }

  // 3. Problemas activos en curso (estados 1, 2, 3, 4)
  const activosRows = await query<any>(
    `SELECT p.id_problema, p.codigo_problema, p.titulo, p.descripcion, p.id_estado,
            p.causa_raiz, p.workaround, p.metodo_analisis, p.fecha_creacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS tecnico_asignado
     FROM problema p
     LEFT JOIN usuario u ON u.id_usuario = p.id_usuario_asignado
     WHERE p.estado_registro = true
       AND (
         p.id_usuario_asignado = $1
         OR ($2::int IS NOT NULL AND p.id_departamento = $2)
       )
       AND p.id_estado IN (1, 2, 3, 4)
     ORDER BY p.id_estado DESC, p.fecha_creacion DESC
     LIMIT 5`,
    [idUsuario, idDepto || null]
  );

  const problemasActivos: ProblemaEquipoResumen[] = activosRows.map((r) => {
    const { nombre: estado_nombre, color: color_estado } = mapearEstadoProblema(r.id_estado);
    return {
      id_problema: r.id_problema,
      codigo_problema: r.codigo_problema,
      titulo: r.titulo,
      descripcion: r.descripcion,
      id_estado: r.id_estado,
      estado_nombre,
      color_estado,
      causa_raiz: r.causa_raiz,
      workaround: r.workaround,
      metodo_analisis: r.metodo_analisis,
      tecnico_asignado: r.tecnico_asignado || "Sin asignar",
      fecha_creacion: r.fecha_creacion,
    };
  });

  // 4. Historial de problemas resueltos / cerrados (estados 5 y 6)
  const historialRows = await query<any>(
    `SELECT p.id_problema, p.codigo_problema, p.titulo, p.descripcion, p.id_estado,
            p.causa_raiz, p.workaround, p.metodo_analisis, p.fecha_creacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS tecnico_asignado
     FROM problema p
     LEFT JOIN usuario u ON u.id_usuario = p.id_usuario_asignado
     WHERE p.estado_registro = true
       AND (
         p.id_usuario_asignado = $1
         OR ($2::int IS NOT NULL AND p.id_departamento = $2)
       )
       AND p.id_estado IN (5, 6)
     ORDER BY p.fecha_creacion DESC
     LIMIT 8`,
    [idUsuario, idDepto || null]
  );

  const historialResueltos: ProblemaEquipoResumen[] = historialRows.map((r) => {
    const { nombre: estado_nombre, color: color_estado } = mapearEstadoProblema(r.id_estado);
    return {
      id_problema: r.id_problema,
      codigo_problema: r.codigo_problema,
      titulo: r.titulo,
      descripcion: r.descripcion,
      id_estado: r.id_estado,
      estado_nombre,
      color_estado,
      causa_raiz: r.causa_raiz,
      workaround: r.workaround,
      metodo_analisis: r.metodo_analisis,
      tecnico_asignado: r.tecnico_asignado || "Sin asignar",
      fecha_creacion: r.fecha_creacion,
    };
  });

  return {
    perteneceAEquipo,
    nombreEquipo,
    descripcionEquipo: "Grupo técnico asignado al análisis de causa raíz y prevención de recurrencias.",
    integrantes,
    problemasActivos,
    historialResueltos,
  };
}

export interface EquipoProblemasCompleto {
  id_departamento: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  supervisor_nombre: string;
  total_integrantes: number;
  problemas_activos: number;
  integrantes: {
    id_usuario: number;
    nombre: string;
    correo: string;
    cargo: string;
  }[];
}

export async function obtenerTodosLosEquiposProblemas(): Promise<EquipoProblemasCompleto[]> {
  const deptos = await query<any>(`
    SELECT d.id_departamento, d.codigo, d.nombre, d.descripcion,
           CONCAT(s.nombres, ' ', s.apellido_paterno) AS supervisor_nombre
    FROM departamento_ti d
    LEFT JOIN usuario s ON s.id_usuario = d.id_supervisor
    WHERE d.estado_registro = true
    ORDER BY d.nombre ASC
  `);

  const usuarios = await query<any>(`
    SELECT u.id_usuario, u.id_departamento,
           CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre,
           u.correo_electronico AS correo,
           COALESCE(p.nombre, 'Técnico') AS cargo
    FROM usuario u
    LEFT JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
    LEFT JOIN perfiles p ON p.id_perfil = up.id_perfil
    WHERE u.estado_registro = true
    ORDER BY u.nombres
  `);

  const problemasActivos = await query<any>(`
    SELECT p.id_departamento, COUNT(p.id_problema)::int AS total
    FROM problema p
    WHERE p.estado_registro = true AND p.id_estado IN (1, 2, 3, 4) AND p.id_departamento IS NOT NULL
    GROUP BY p.id_departamento
  `);

  const mapaActivos = new Map<number, number>();
  problemasActivos.forEach((p) => mapaActivos.set(p.id_departamento, p.total));

  return deptos.map((d) => {
    const ints = usuarios.filter((u) => u.id_departamento === d.id_departamento);
    return {
      id_departamento: d.id_departamento,
      codigo: d.codigo || `DEP-${d.id_departamento}`,
      nombre: d.nombre,
      descripcion: d.descripcion || "Equipo de análisis de causa raíz y workaround",
      supervisor_nombre: d.supervisor_nombre || "Sin supervisor asignado",
      total_integrantes: ints.length,
      problemas_activos: mapaActivos.get(d.id_departamento) || 0,
      integrantes: ints.map((i) => ({
        id_usuario: i.id_usuario,
        nombre: i.nombre,
        correo: i.correo,
        cargo: i.cargo,
      })),
    };
  });
}

export async function listarProblemasSinAsignar(): Promise<any[]> {
  return query(`
    SELECT p.id_problema, p.codigo_problema, p.titulo, p.descripcion,
           p.id_estado, p.id_prioridad, p.fecha_creacion,
           pt.nombre AS prioridad_nombre,
           d.nombre AS departamento_nombre
    FROM problema p
    LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = p.id_prioridad
    LEFT JOIN departamento_ti d ON d.id_departamento = p.id_departamento
    WHERE p.estado_registro = true
      AND (p.id_usuario_asignado IS NULL OR p.id_departamento IS NULL)
    ORDER BY p.fecha_creacion DESC
  `);
}

export async function asignarEquipoYTecnicoProblema(idProblema: number, idDepartamento: number, idUsuarioAsignado?: number) {
  return queryRow(`
    UPDATE problema
    SET id_departamento = $2,
        id_usuario_asignado = COALESCE($3, id_usuario_asignado),
        fecha_modificacion = now()
    WHERE id_problema = $1 AND estado_registro = true
    RETURNING id_problema, codigo_problema, id_departamento, id_usuario_asignado
  `, [idProblema, idDepartamento, idUsuarioAsignado || null]);
}

export async function crearNuevoEquipoProblemas(codigo: string, nombre: string, descripcion: string, idSupervisor?: number) {
  return queryRow(`
    INSERT INTO departamento_ti (codigo, nombre, descripcion, id_supervisor, estado_registro)
    VALUES ($1, $2, $3, $4, true)
    RETURNING id_departamento, codigo, nombre, descripcion
  `, [codigo.trim().toUpperCase(), nombre.trim(), descripcion.trim(), idSupervisor || null]);
}

export async function obtenerDepartamentosYTecnicos() {
  const departamentos = await query(`
    SELECT id_departamento, codigo, nombre FROM departamento_ti WHERE estado_registro = true ORDER BY nombre
  `);
  const tecnicos = await query(`
    SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre,
           u.correo_electronico AS correo, u.id_departamento, d.nombre AS departamento_nombre
    FROM usuario u
    JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
    LEFT JOIN departamento_ti d ON d.id_departamento = u.id_departamento
    WHERE u.estado_registro = true AND up.id_perfil IN (2, 4, 10)
    ORDER BY u.nombres
  `);
  return { departamentos, tecnicos };
}
