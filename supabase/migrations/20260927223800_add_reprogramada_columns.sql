ALTER TABLE public.t_inscripciones
ADD COLUMN IF NOT EXISTS id_reprogramada_desde INT,
ADD COLUMN IF NOT EXISTS id_reprogramada_hacia INT;
