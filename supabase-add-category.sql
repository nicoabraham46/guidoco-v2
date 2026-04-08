-- =========================================
-- MIGRACIÓN: Agregar columna category a products
-- Ejecutar en Supabase → SQL Editor
-- =========================================

-- 1) Agregar columna category (nullable text)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category TEXT
    CHECK (category IN ('diecast', 'pokemon'));

-- 2) Asignar categoría por defecto a productos existentes sin categoría
--    Cambiá 'diecast' por 'pokemon' si necesitás otro default.
UPDATE products
  SET category = 'diecast'
  WHERE category IS NULL;

-- 3) Índice para acelerar los filtros del catálogo
CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(category);
