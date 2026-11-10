import { query, queryRow } from "@/shared/lib/db";

/**
 * Servicio del panel del Administrador (perfil 1).
 * Enfoque exclusivo de administración del sistema:
 * Seguridad, accesos e inicios de sesión, auditoría de cambios de configuración
 * y modificaciones de perfiles/datos de colaboradores.
 */

export async function obtenerPanelAdministrador() {
  const kpis = await queryRow<any>(
    `SELECT
       (SELECT COUNT(*) FROM usuario WHERE estado_registro = true)::int AS usuarios_activos,
       (SELECT COUNT(*) FROM log_acceso WHERE exitoso = false AND fecha >= now() - interval '7 days')::int AS accesos_fallidos,
       (SELECT COUNT(*) FROM log_acceso WHERE exitoso = true AND fecha >= date_trunc('day', now()))::int AS logins_hoy,
       (SELECT COUNT(*) FROM log_auditoria_sistema WHERE fecha_creacion >= now() - interval '30 days')::int AS cambios_configuracion_30d,
       (SELECT COUNT(*) FROM usuario u WHERE u.estado_registro = true AND NOT EXISTS (
         SELECT 1 FROM usuario_perfiles up WHERE up.id_usuario = u.id_usuario AND up.estado_registro
       ))::int AS usuarios_sin_perfil,
       (SELECT COUNT(*) FROM perfiles WHERE estado_registro = true)::int AS perfiles_activos`
  );

  // 1. Logs de seguridad e inicios de sesión (exitosos y fallidos)
  const logsInicioSesion = await query<{
    id_log: number;
    correo_intento: string | null;
    exitoso: boolean;
    ip: string | null;
    fecha: string;
    usuario_nombre: string | null;
  }>(
    `SELECT l.id_log, l.correo_intento, l.exitoso, l.ip, l.fecha,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre
     FROM log_acceso l
     LEFT JOIN usuario u ON u.id_usuario = l.id_usuario
     ORDER BY l.fecha DESC
     LIMIT 8`
  );

  // 2. Logs de cambios en la configuración del sistema (realizados por administradores)
  const logsAuditoriaConfiguracion = await query<{
    id_log: number;
    modulo: string;
    accion: string;
    descripcion: string;
    detalles: any;
    direccion_ip: string | null;
    fecha_creacion: string;
    admin_nombre: string | null;
    admin_correo: string | null;
  }>(
    `SELECT l.id_log, l.modulo, l.accion, l.descripcion, l.detalles, l.direccion_ip, l.fecha_creacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS admin_nombre,
            u.correo_electronico AS admin_correo
     FROM log_auditoria_sistema l
     LEFT JOIN usuario u ON u.id_usuario = l.id_usuario
     ORDER BY l.fecha_creacion DESC
     LIMIT 8`
  );

  // 3. Trazabilidad de colaboradores modificados recientemente (datos de contacto, roles, perfiles)
  const usuariosModificadosRecientes = await query<{
    id_usuario: number;
    nombre_completo: string;
    correo_electronico: string;
    celular: string | null;
    fecha_modificacion: string | null;
    fecha_creacion: string;
    modificado_por: string | null;
    perfiles_asignados: string;
  }>(
    `SELECT u.id_usuario,
            CONCAT(u.nombres, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
            u.correo_electronico,
            u.celular,
            u.fecha_modificacion,
            u.fecha_creacion,
            CONCAT(um.nombres, ' ', um.apellido_paterno) AS modificado_por,
            COALESCE(
              (SELECT string_agg(p.nombre, ', ') 
               FROM perfiles p 
               JOIN usuario_perfiles up ON up.id_perfil = p.id_perfil 
               WHERE up.id_usuario = u.id_usuario AND up.estado_registro = true),
              'Sin perfiles'
            ) AS perfiles_asignados
     FROM usuario u
     LEFT JOIN usuario um ON um.id_usuario = u.usuario_modificacion
     WHERE u.estado_registro = true
     ORDER BY COALESCE(u.fecha_modificacion, u.fecha_creacion) DESC
     LIMIT 6`
  );

  // 4. Usuarios sin perfil asignado (requieren atención RBAC)
  const usuariosSinPerfil = await query<{
    id_usuario: number;
    nombre: string;
    correo_electronico: string;
    fecha_creacion: string;
  }>(
    `SELECT u.id_usuario,
            CONCAT_WS(' ', u.nombres, u.apellido_paterno) AS nombre,
            u.correo_electronico,
            u.fecha_creacion
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
      usuarios_activos: kpis?.usuarios_activos ?? 0,
      accesos_fallidos: kpis?.accesos_fallidos ?? 0,
      logins_hoy: kpis?.logins_hoy ?? 0,
      cambios_configuracion_30d: kpis?.cambios_configuracion_30d ?? 0,
      usuarios_sin_perfil: kpis?.usuarios_sin_perfil ?? 0,
      perfiles_activos: kpis?.perfiles_activos ?? 0,
    },
    logsInicioSesion,
    logsAuditoriaConfiguracion,
    usuariosModificadosRecientes,
    usuariosSinPerfil,
  };
}
