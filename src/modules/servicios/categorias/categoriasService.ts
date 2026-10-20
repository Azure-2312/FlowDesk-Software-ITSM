import { query } from "@/shared/lib/db";
import { CategoriaServicio, CrearCategoriaInput, ActualizarCategoriaInput } from "./categoriasTypes";
import { sanitizarDatosCategoria } from "./categoriasValidaciones";

export async function listarCategorias(soloActivas: boolean = false): Promise<CategoriaServicio[]> {
  const sql = `
    SELECT id_categoria, nombre, descripcion, icono, orden, activo, creado_en, actualizado_en
    FROM categorias_servicios
    ${soloActivas ? "WHERE activo = true" : ""}
    ORDER BY orden ASC, nombre ASC;
  `;
  return query<CategoriaServicio>(sql);
}

export async function obtenerCategoriaPorId(idCategoria: number): Promise<CategoriaServicio | null> {
  const sql = `
    SELECT id_categoria, nombre, descripcion, icono, orden, activo, creado_en, actualizado_en
    FROM categorias_servicios
    WHERE id_categoria = $1;
  `;
  const filas = await query<CategoriaServicio>(sql, [idCategoria]);
  return filas[0] ?? null;
}

export async function crearCategoria(input: CrearCategoriaInput): Promise<CategoriaServicio> {
  const datos = sanitizarDatosCategoria(input);
  const sql = `
    INSERT INTO categorias_servicios (nombre, descripcion, icono, orden, activo)
    VALUES ($1, $2, $3, $4, true)
    RETURNING id_categoria, nombre, descripcion, icono, orden, activo, creado_en, actualizado_en;
  `;
  const filas = await query<CategoriaServicio>(sql, [
    datos.nombre,
    datos.descripcion,
    datos.icono,
    datos.orden,
  ]);
  return filas[0];
}

export async function actualizarCategoria(
  idCategoria: number,
  input: ActualizarCategoriaInput
): Promise<CategoriaServicio | null> {
  const actual = await obtenerCategoriaPorId(idCategoria);
  if (!actual) return null;

  const nombre = input.nombre !== undefined ? input.nombre.trim() : actual.nombre;
  const descripcion = input.descripcion !== undefined ? (input.descripcion ? input.descripcion.trim() : null) : actual.descripcion;
  const icono = input.icono !== undefined ? (input.icono ? input.icono.trim() : null) : actual.icono;
  const orden = input.orden !== undefined ? Number(input.orden) : actual.orden;
  const activo = input.activo !== undefined ? Boolean(input.activo) : actual.activo;

  const sql = `
    UPDATE categorias_servicios
    SET nombre = $1, descripcion = $2, icono = $3, orden = $4, activo = $5, actualizado_en = NOW()
    WHERE id_categoria = $6
    RETURNING id_categoria, nombre, descripcion, icono, orden, activo, creado_en, actualizado_en;
  `;
  const filas = await query<CategoriaServicio>(sql, [
    nombre,
    descripcion,
    icono,
    orden,
    activo,
    idCategoria,
  ]);
  return filas[0] ?? null;
}
