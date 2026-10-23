import { query } from "@/shared/lib/db";
import {
  TipoTicket,
  ImpactoTicket,
  UrgenciaTicket,
  PrioridadTicket,
  EstadoTicket,
  MotivoEsperaTicket,
  CategoriaTicket,
} from "@/types";

export async function listarCatalogosTickets(sesion: any) {
  const [
    tipos,
    impactos,
    urgencias,
    prioridades,
    estados,
    motivosEspera,
    categorias,
    tecnicos,
    servicios,
    departamentos,
  ] = await Promise.all([
    query<TipoTicket>(
      "SELECT * FROM tipo_ticket WHERE estado_registro = true ORDER BY id_tipo_ticket"
    ),
    query<ImpactoTicket>(
      "SELECT * FROM impacto_ticket WHERE estado_registro = true ORDER BY nivel"
    ),
    query<UrgenciaTicket>(
      "SELECT * FROM urgencia_ticket WHERE estado_registro = true ORDER BY nivel"
    ),
    query<PrioridadTicket>(
      "SELECT * FROM prioridad_ticket WHERE estado_registro = true ORDER BY nivel"
    ),
    query<EstadoTicket>(
      "SELECT * FROM estado_ticket WHERE estado_registro = true ORDER BY orden"
    ),
    query<MotivoEsperaTicket>(
      "SELECT * FROM motivo_espera_ticket WHERE estado_registro = true ORDER BY id_motivo_espera"
    ),
    query<CategoriaTicket>(
      "SELECT * FROM categoria_ticket WHERE estado_registro = true ORDER BY id_categoria"
    ),
    sesion.perfilActivo?.id_perfil === 4 ? query<{
      id_usuario: number;
      nombre: string;
      correo: string;
      id_departamento?: number;
      departamento_nombre?: string;
      nivel_soporte?: number;
      estado_operativo?: string;
      capacidad_maxima_tickets?: number;
      tickets_activos?: number;
    }>(
      `SELECT DISTINCT u.id_usuario, 
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
       WHERE up.id_perfil = 2
         AND up.estado_registro = true
         AND u.estado_registro = true
         AND td.id_departamento IN (SELECT d.id_departamento FROM departamento_ti d WHERE d.id_supervisor = $1 AND d.estado_registro = true)
       GROUP BY u.id_usuario, u.nombres, u.apellido_paterno, u.correo_electronico, td.id_departamento, dep.nombre, td.nivel_soporte, td.estado_operativo, td.capacidad_maxima_tickets
       ORDER BY nombre`, [sesion.id_usuario]) : Promise.resolve([]),
    query<any>(`SELECT s.* FROM servicio_catalogo s LEFT JOIN categoria_ticket c ON c.id_categoria = s.id_categoria WHERE s.estado_registro = true AND (s.id_categoria IS NULL OR c.estado_registro = true) ORDER BY s.codigo_servicio`),
    sesion.perfilActivo?.id_perfil === 4
      ? query<any>("SELECT * FROM departamento_ti WHERE estado_registro = true AND id_supervisor = $1 ORDER BY id_departamento", [sesion.id_usuario])
      : Promise.resolve([]),
  ]);

  return {
    tipos,
    impactos,
    urgencias,
    prioridades,
    estados,
    motivosEspera,
    categorias,
    tecnicos,
    servicios,
    departamentos,
  };
}
