-- Add id_profesores array column
ALTER TABLE public.t_clases_def ADD COLUMN IF NOT EXISTS id_profesores integer[] DEFAULT '{}';

-- Migrate existing data
UPDATE public.t_clases_def 
SET id_profesores = ARRAY[id_profesor] 
WHERE id_profesor IS NOT NULL 
  AND (id_profesores IS NULL OR array_length(id_profesores, 1) IS NULL);
