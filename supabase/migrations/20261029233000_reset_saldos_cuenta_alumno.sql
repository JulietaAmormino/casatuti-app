-- Migración: Permitir saldo = 0 y resetear saldo_actual y saldo a 0 en t_cuenta_alumno
-- Casa Tuti App

-- 1. Modificar el constraint t_cuenta_alumno_clases_contratadas_check para incluir 0
ALTER TABLE public.t_cuenta_alumno 
  DROP CONSTRAINT IF EXISTS t_cuenta_alumno_clases_contratadas_check;

ALTER TABLE public.t_cuenta_alumno 
  ADD CONSTRAINT t_cuenta_alumno_clases_contratadas_check CHECK (saldo = ANY (ARRAY[0, 4, 6, 8]));

-- 2. Resetear saldo_actual y saldo a 0 para todas las cuentas de alumno
UPDATE public.t_cuenta_alumno 
SET saldo_actual = 0, saldo = 0;

-- 3. Limpiar notificaciones obsoletas de falta de créditos si existiesen
DELETE FROM public.t_notificaciones WHERE tipo = 'NO_CREDITS';
