export interface CategoriaServicio {
  id_categoria: number;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  orden?: number;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

export interface CrearCategoriaInput {
  nombre: string;
  descripcion?: string;
  icono?: string;
  orden?: number;
}

export interface ActualizarCategoriaInput {
  nombre?: string;
  descripcion?: string;
  icono?: string;
  orden?: number;
  activo?: boolean;
}
