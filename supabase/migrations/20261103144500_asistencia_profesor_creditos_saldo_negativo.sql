-- Migración: Garantizar cuentas de alumno y soporte para asistencia docente con saldo a cuenta (-1)
-- Casa Tuti App

-- 1. Crear cuentas para todos los alumnos que aún no posean registro en t_cuenta_alumno
INSERT INTO public.t_cuenta_alumno (id_usuarios, saldo_actual, saldo, id_sucursal)
SELECT 
  u.id_usuarios, 
  0, 
  4, 
  COALESCE(u.id_sucursales[1], 1)
FROM public.t_usuarios u
LEFT JOIN public.t_cuenta_alumno ca ON u.id_usuarios = ca.id_usuarios
WHERE u.rol = 'ALUMNO' AND ca.id_usuarios IS NULL;

-- 2. Asegurar que la restricción de saldo mínimo admita hasta -1 crédito (clase a cuenta)
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

-- 3. Documentar regla de negocio de asistencia y compras a cuenta
COMMENT ON CONSTRAINT t_cuenta_alumno_saldo_actual_min_check ON public.t_cuenta_alumno IS 
'Permite sobregiro de 1 clase (-1 credito) cuando el profesor agrega una alumna sin creditos a la clase o durante el periodo de gracia. Al abonar un nuevo pack, el saldo negativo se compensa automaticamente.';

