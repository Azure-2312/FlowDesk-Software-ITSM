-- ============================================================================
-- REVISIÓN DE USUARIOS QUE PARECEN DE PRUEBA (solo lectura)
-- ----------------------------------------------------------------------------
-- La limpieza conserva todos los usuarios. Esta consulta lista los que tienen
-- señales de ser de prueba para que usted decida cuáles desactivar desde
-- Plataforma → Usuarios (desactivar es reversible; borrar no).
-- Contiene datos personales: revísela usted en Supabase, no hace falta enviarla.
-- ============================================================================
SELECT u.id_usuario,
       u.nombres || ' ' || COALESCE(u.apellido_paterno, '') AS nombre,
       u.correo_electronico,
       string_agg(p.nombre, ', ' ORDER BY p.id_perfil) AS perfiles,
       u.fecha_creacion::date AS creado,
       concat_ws(' · ',
         CASE WHEN u.correo_electronico ~* '(e2e|prueba|test|demo|ejemplo|example|dummy|fake)' THEN 'correo de prueba' END,
         CASE WHEN u.correo_electronico ~* '@(empresa|example|ejemplo|test)\.' THEN 'dominio ficticio' END,
         CASE WHEN u.nombres ~* '(prueba|test|demo|e2e)' OR u.apellido_paterno ~* '(prueba|test|demo|e2e)' THEN 'nombre de prueba' END,
         CASE WHEN u.dni ~ '^(0{7}\d|12345678|11111111|99999999)$' THEN 'DNI ficticio' END,
         CASE WHEN u.correo_electronico !~* '@flowdesk\.com$' THEN 'fuera del dominio corporativo' END
       ) AS senales
  FROM usuario u
  LEFT JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro
  LEFT JOIN perfiles p ON p.id_perfil = up.id_perfil
 WHERE u.correo_electronico ~* '(e2e|prueba|test|demo|ejemplo|example|dummy|fake)'
    OR u.correo_electronico ~* '@(empresa|example|ejemplo|test)\.'
    OR u.nombres ~* '(prueba|test|demo|e2e)' OR u.apellido_paterno ~* '(prueba|test|demo|e2e)'
    OR u.dni ~ '^(0{7}\d|12345678|11111111|99999999)$'
    OR u.correo_electronico !~* '@flowdesk\.com$'
 GROUP BY u.id_usuario
 ORDER BY u.id_usuario;
