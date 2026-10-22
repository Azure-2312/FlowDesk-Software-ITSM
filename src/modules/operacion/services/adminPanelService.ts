import { query, queryRow } from "@/shared/lib/db";

/**
 * Servicio del panel del Administrador (perfil 1).
 * Alcance global: salud operativa de la mesa de servicio, cambios en curso,
 * identidades y accesos.
 */

export async function obtenerPanelAdministrador() {
  const kpis = await queryRow<any>(
    `SELECT
       (SELECT COUNT(*) FROM ticket t
        WHERE t.estado_registro = true AND t.id_estado IN (1, 2, 3, 4))::int AS tickets_abiertos,
       (SELECT COUNT(*) FROM ticket t
        WHERE t.estado_registro = true AND t.id_estado IN (1, 2, 3, 4)
          AND t.fecha_limite_sla IS NOT NULL AND t.fecha_limite_sla < now())::int AS sla_vencidos,
       (SELECT COUNT(*) FROM cambio WHERE estado_registro = true AND id_estado IN (1, 2, 3, 4, 5))::int AS cambios_activos,
       (SELECT COUNT(*) FROM problema WHERE estado_registro = true)::int AS problemas_abiertos,
       (SELECT COUNT(*) FROM usuario WHERE estado_registro = true)::int AS usuarios_activos,
       (SELECT COUNT(*) FROM log_acceso WHERE exitoso = false AND fecha >= now() - interval '7 days')::int AS accesos_fallidos`
  );

  const ticketsPorTipo = await query<{ tipo: string; abiertos: number }>(
    `SELECT COALESCE(tt.nombre, 'Sin tipo') AS tipo,
            COUNT(*)::int AS abiertos
     FROM ticket t
     LEFT JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket
     WHERE t.estado_registro = true AND t.id_estado IN (1, 2, 3, 4)
     GROUP BY COALESCE(tt.nombre, 'Sin tipo')
     ORDER BY abiertos DESC`
  );

  const accesosFallidos = await query<{
    correo_intento: string | null;
    ip: string | null;
    fecha: string;
  }>(
    `SELECT correo_intento, ip, fecha
     FROM log_acceso
     WHERE exitoso = false
     ORDER BY fecha DESC
     LIMIT 6`
  );

  const usuariosSinPerfil = await query<{
    id_usuario: number;
    nombre: string;
    correo_electronico: string;
  }>(
    `SELECT u.id_usuario,
            CONCAT_WS(' ', u.nombres, u.apellido_paterno) AS nombre,
            u.correo_electronico
     FROM usuario u
     WHERE u.estado_registro = true
       AND NOT EXISTS (
         SELECT 1 FROM usuario_perfiles up
         WHERE up.id_usuario = u.id_usuario AND up.estado_registro
       )
     ORDER BY u.fecha_creacion DESC
     LIMIT 5`
  );

  return {
    kpis: {
      tickets_abiertos: kpis?.tickets_abiertos ?? 0,
      sla_vencidos: kpis?.sla_vencidos ?? 0,
      cambios_activos: kpis?.cambios_activos ?? 0,
      problemas_abiertos: kpis?.problemas_abiertos ?? 0,
      usuarios_activos: kpis?.usuarios_activos ?? 0,
      accesos_fallidos: kpis?.accesos_fallidos ?? 0,
    },
    ticketsPorTipo,
    accesosFallidos,
    usuariosSinPerfil,
  };
}
