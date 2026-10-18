import { query } from "../db";

async function limpiar() {
  console.log("Limpiando DB...");
  try {
    await query("DROP TABLE IF EXISTS tecnico_disponibilidad CASCADE;");
    console.log("- Tabla tecnico_disponibilidad eliminada.");
  } catch (e) {
    console.warn("Aviso al eliminar tabla:", e);
  }

  try {
    const res = await query("DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/plataforma/perfiles/tecnico/mesa/buscar'); DELETE FROM opciones_menu WHERE url_menu = '/plataforma/perfiles/tecnico/mesa/buscar';");
    console.log("- Opcion de menu Busqueda avanzada eliminada por url_menu.");
  } catch (e) {
    console.warn("Aviso al eliminar opcion de menu:", e);
  }

  console.log("Limpieza DB finalizada con exito.");
  process.exit(0);
}

limpiar();
