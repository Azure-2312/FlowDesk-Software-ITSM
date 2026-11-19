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
