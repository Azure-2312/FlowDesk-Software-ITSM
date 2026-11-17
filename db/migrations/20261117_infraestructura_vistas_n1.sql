-- ============================================================================
-- MIGRACIÓN: Infraestructura de Vistas y Permisos Granulares (N1 - Fase 1)
-- FECHA: 2026-11-17
-- DESCRIPCIÓN:
-- Crea la tabla de permisos relacionales por vista (pestaña) para pantallas
-- fusionadas. Permite gobernar accesos independientes por pestaña (R5).
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS opciones_menu_vistas_perfiles (
  id_opcion_menu INT NOT NULL REFERENCES opciones_menu(id_opcion_menu) ON DELETE CASCADE,
  id_perfil INT NOT NULL REFERENCES perfiles(id_perfil) ON DELETE CASCADE,
  vista VARCHAR(100) NOT NULL,
  estado_registro BOOLEAN DEFAULT true NOT NULL,
  creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id_opcion_menu, id_perfil, vista)
);

CREATE INDEX IF NOT EXISTS idx_omvp_perfil_opcion 
ON opciones_menu_vistas_perfiles(id_perfil, id_opcion_menu, estado_registro);

COMMIT;
