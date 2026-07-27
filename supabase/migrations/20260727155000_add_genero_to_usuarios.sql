-- Añadir columna genero a t_usuarios
ALTER TABLE public.t_usuarios ADD COLUMN IF NOT EXISTS genero text;
