-- Migración: Permitir saldo_actual hasta -1 para la regla de clase a cuenta del 1 al 10
-- Casa Tuti App

-- 1. Agregar constraint para asegurar que el saldo_actual nunca sea inferior a -1 (máximo 1 clase a cuenta)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 't_cuenta_alumno_saldo_actual_min_check'
  ) THEN
    ALTER TABLE public.t_cuenta_alumno
      ADD CONSTRAINT t_cuenta_alumno_saldo_actual_min_check CHECK (saldo_actual >= -1);
  END IF;
END $$;

COMMENT ON CONSTRAINT t_cuenta_alumno_saldo_actual_min_check ON public.t_cuenta_alumno IS 
'Permite un sobregiro controlado de hasta -1 credito para la clase a cuenta entre los dias 1 y 10 de cada mes';
