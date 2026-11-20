-- Migración: Agregar columna foto_perfil en tabla usuario
-- Permite almacenar la imagen de perfil del colaborador en formato base64 / data URL o ruta
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS foto_perfil TEXT;
