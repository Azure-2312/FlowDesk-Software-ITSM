-- Las carpetas del menú (nodos con subopciones) no navegan: su url_menu queda
-- vacío hasta que exista una "página resumen" de la carpeta.
--
-- Regla de la arquitectura del menú (la aplica src/shared/components/layout/MenuLateral.tsx):
--   url_menu = ''   -> CARPETA: el clic solo despliega / contrae.
--   url_menu <> ''  -> PÁGINA:  el clic navega.
-- La columna url_menu sigue existiendo en ambas: una carpeta podrá tener más
-- adelante la url de su página resumen (hijos + url); ahí el clic desplegará y
-- el doble clic navegará.
--
-- Se vacía la url de todo nodo con al menos una subopción ACTIVA, que es como
-- MenuLateral construye el árbol (las subopciones inactivas no llegan al menú).
-- Quedan fuera 550, 560 y 590: sus únicos hijos están inactivos y ellos mismos
-- también, así que hoy se comportan como hoja y conservan su url.
--
-- Estado previo: 104 nodos tenían url_menu; 33 apuntaban a rutas inexistentes
-- (placeholders inventados por 20261010_saneamiento_colisiones_urls_menu.sql) y
-- 71 a una página real (normalmente la de su primera subopción). Esas 71 son las
-- candidatas a "página resumen" cuando se implemente el doble clic.

UPDATE opciones_menu om
SET url_menu = ''
WHERE EXISTS (
  SELECT 1 FROM opciones_menu h
  WHERE h.id_padre = om.id_opcion_menu
    AND h.estado_registro
);
