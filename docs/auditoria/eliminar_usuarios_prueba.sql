-- ============================================================================
-- ELIMINAR USUARIOS DE PRUEBA (producción) · ejecutar UNA sola vez
-- ----------------------------------------------------------------------------
-- Borra los 14 usuarios "Trabajador Demo" (@empresa.com) listados en
-- "usuarios sin flowdesk.csv". El administrador (id 1) NO se toca.
--
-- Protecciones:
--   · Doble filtro: solo borra si el id está en la lista Y el correo termina
--     en @empresa.com. Nunca borra el id 1 ni un correo @flowdesk.com.
--   · Primero quita sus perfiles y su ficha de técnico; en las demás tablas
--     que solo guardan "quién lo hizo" (columnas opcionales) deja el dato en
--     blanco. Si alguna tabla obligara a conservar al usuario, el borrado
--     falla y, por estar en una transacción, no se aplica nada.
--   · Borrar NO se puede deshacer. Haga un respaldo antes.
-- ============================================================================
BEGIN;

CREATE TEMP TABLE usuarios_a_borrar ON COMMIT DROP AS
SELECT id_usuario
  FROM usuario
 WHERE id_usuario IN (213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 230, 231, 232)
   AND id_usuario <> 1
   AND correo_electronico ILIKE '%@empresa.com'
   AND correo_electronico NOT ILIKE '%@flowdesk.com';

-- 1. Datos que pertenecen al usuario
DELETE FROM usuario_perfiles WHERE id_usuario IN (SELECT id_usuario FROM usuarios_a_borrar);
DELETE FROM tecnico_detalle  WHERE id_usuario IN (SELECT id_usuario FROM usuarios_a_borrar);

-- 2. Referencias opcionales en otras tablas ("creado por", "responsable"...) → en blanco
--    Solo se actualizan las tablas que de verdad los mencionan (las bitácoras
--    inmutables rechazan cualquier UPDATE, aunque no afecte filas).
DO $$
DECLARE r RECORD; hay BOOLEAN;
BEGIN
  FOR r IN
    SELECT c.conrelid::regclass AS tabla, a.attname AS columna
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
     WHERE c.contype = 'f'
       AND c.confrelid = 'usuario'::regclass
       AND NOT a.attnotnull
       AND c.conrelid <> 'usuario'::regclass
  LOOP
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %s WHERE %I IN (SELECT id_usuario FROM usuarios_a_borrar))',
                   r.tabla, r.columna) INTO hay;
    IF hay THEN
      EXECUTE format('UPDATE %s SET %I = NULL WHERE %I IN (SELECT id_usuario FROM usuarios_a_borrar)',
                     r.tabla, r.columna, r.columna);
    END IF;
  END LOOP;
END $$;

-- 3. Borrar los usuarios
DELETE FROM usuario WHERE id_usuario IN (SELECT id_usuario FROM usuarios_a_borrar);

-- 4. Verificación (dentro de la transacción): cuántos se borraron y que el admin sigue
SELECT (SELECT COUNT(*) FROM usuarios_a_borrar)                               AS usuarios_borrados,
       (SELECT COUNT(*) FROM usuario WHERE id_usuario = 1)                    AS admin_conservado,
       (SELECT COUNT(*) FROM usuario WHERE correo_electronico ILIKE '%@empresa.com') AS quedan_empresa_com,
       (SELECT COUNT(*) FROM usuario)                                         AS usuarios_totales;

COMMIT;
