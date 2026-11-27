-- ============================================================================
-- 09 · Pestaña "En atención" en las bandejas de incidentes y solicitudes
-- ----------------------------------------------------------------------------
-- Muestra los tickets abiertos, asignados, en proceso o en espera (de
-- cualquier técnico) dentro del alcance de cada perfil: el Técnico ve su área
-- técnica, el Supervisor sus departamentos, el Gestor de Área su área de
-- negocio y el Administrador y el Auditor todo. Es la misma regla que
-- "Tickets abiertos" de los paneles.
--
-- Se habilita para los perfiles que ya tienen esas bandejas en el menú.
-- Puede ejecutarse más de una vez (no duplica).
-- ============================================================================
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro, creado_en)
SELECT omp.id_opcion_menu, omp.id_perfil, 'en_atencion', true, now()
  FROM opciones_menu_perfiles omp
 WHERE omp.id_opcion_menu IN (21233, 21244)      -- Bandeja de incidentes / de solicitudes
   AND omp.id_perfil IN (1, 2, 4, 5, 6)          -- Admin, Técnico, Supervisor, Gestor de Área, Auditor
   AND omp.estado_registro = true
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true;

-- Verificación: perfiles con la pestaña en cada bandeja
SELECT om.nombre AS bandeja, string_agg(p.nombre, ', ' ORDER BY p.id_perfil) AS perfiles_con_en_atencion
  FROM opciones_menu_vistas_perfiles v
  JOIN opciones_menu om ON om.id_opcion_menu = v.id_opcion_menu
  JOIN perfiles p ON p.id_perfil = v.id_perfil
 WHERE v.vista = 'en_atencion' AND v.estado_registro
 GROUP BY om.nombre;
