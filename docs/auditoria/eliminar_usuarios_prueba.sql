-- ============================================================================
-- ELIMINAR USUARIOS DE PRUEBA (producción) · ejecutar UNA sola vez
-- ----------------------------------------------------------------------------
-- Borra los 14 usuarios "Trabajador Demo" (@empresa.com) listados en
-- "usuarios sin flowdesk.csv". El administrador (id 1) NO se toca.
--
-- Todo va en UN solo bloque (sin tablas temporales), porque el SQL Editor de
-- Supabase no conserva una tabla temporal entre una instrucción y otra.
-- Si cualquier paso falla, el bloque completo se revierte y no se borra nada.
--
-- Protecciones:
--   · Doble filtro: solo borra si el id está en la lista Y el correo termina
--     en @empresa.com. Nunca borra el id 1 ni un correo @flowdesk.com.
--   · Primero quita sus perfiles y su ficha de técnico; en las demás tablas
--     que solo guardan "quién lo hizo" (columnas opcionales) deja el dato en
--     blanco. Si alguna tabla obligara a conservar al usuario, falla todo.
--   · Borrar NO se puede deshacer. Haga un respaldo antes.
-- ============================================================================
DO $$
DECLARE
  ids    INTEGER[];
  r      RECORD;
  hay    BOOLEAN;
  total  INTEGER;
BEGIN
  SELECT COALESCE(array_agg(id_usuario), '{}')
    INTO ids
    FROM usuario
   WHERE id_usuario IN (213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 230, 231, 232)
     AND id_usuario <> 1
     AND correo_electronico ILIKE '%@empresa.com'
     AND correo_electronico NOT ILIKE '%@flowdesk.com';

  total := COALESCE(array_length(ids, 1), 0);
  IF total = 0 THEN
    RAISE NOTICE 'No hay usuarios que borrar (ya se borraron o no cumplen los filtros).';
    RETURN;
  END IF;

  -- 1. Datos que pertenecen al usuario
  DELETE FROM usuario_perfiles WHERE id_usuario = ANY (ids);
  DELETE FROM tecnico_detalle  WHERE id_usuario = ANY (ids);

  -- 2. Referencias opcionales ("creado por", "responsable"...) → en blanco.
  --    Solo en tablas que de verdad los mencionan (las bitácoras inmutables
  --    rechazan cualquier UPDATE, aunque no afecte filas).
  FOR r IN
    SELECT c.conrelid::regclass AS tabla, a.attname AS columna
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
     WHERE c.contype = 'f'
       AND c.confrelid = 'usuario'::regclass
       AND NOT a.attnotnull
       AND c.conrelid <> 'usuario'::regclass
  LOOP
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %s WHERE %I = ANY ($1))', r.tabla, r.columna)
      INTO hay USING ids;
    IF hay THEN
      EXECUTE format('UPDATE %s SET %I = NULL WHERE %I = ANY ($1)', r.tabla, r.columna, r.columna)
        USING ids;
    END IF;
  END LOOP;

  -- 3. Borrar los usuarios
  DELETE FROM usuario WHERE id_usuario = ANY (ids);
  RAISE NOTICE 'Usuarios borrados: %', total;
END $$;

-- 4. Verificación: quedan_empresa_com debe ser 0 y admin_conservado 1
SELECT (SELECT COUNT(*) FROM usuario WHERE id_usuario = 1)                         AS admin_conservado,
       (SELECT COUNT(*) FROM usuario WHERE correo_electronico ILIKE '%@empresa.com') AS quedan_empresa_com,
       (SELECT COUNT(*) FROM usuario)                                              AS usuarios_totales;
