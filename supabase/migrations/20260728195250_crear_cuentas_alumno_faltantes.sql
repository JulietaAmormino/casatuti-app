-- Migración: crear registros faltantes en t_cuenta_alumno para todos los alumnos
-- y recalcular el saldo_actual sumando los pagos PAID de t_historial_creditos

-- 1. Insertar un registro en t_cuenta_alumno para cada usuario ALUMNO que no tenga uno
INSERT INTO public.t_cuenta_alumno (id_usuarios, saldo_actual, bl_bloqueado)
SELECT u.id_usuarios, 0, false
FROM public.t_usuarios u
WHERE u.rol IN ('ALUMNO', 'ALUMNA', 'ALUMNE')
  AND NOT EXISTS (
    SELECT 1 FROM public.t_cuenta_alumno ca WHERE ca.id_usuarios = u.id_usuarios
  );

-- 2. Recalcular el saldo_actual sumando los pagos ya confirmados (PAID)
--    para que los créditos previos no se pierdan
UPDATE public.t_cuenta_alumno ca
SET saldo_actual = COALESCE((
  SELECT SUM(hc.cantidad)
  FROM public.t_historial_creditos hc
  WHERE hc.id_usuarios = ca.id_usuarios
    AND hc.estado = 'PAID'
    AND hc.cantidad > 0  -- solo acreditaciones, no descuentos
), 0) - COALESCE((
  -- Restar créditos ya usados (inscripciones confirmadas o asistidas)
  SELECT COUNT(*)
  FROM public.t_inscripciones i
  WHERE i.id_usuarios = ca.id_usuarios
    AND i.estado IN ('CONFIRMADA', 'ASISTIO')
), 0);

-- Asegurarse de que el saldo no sea negativo
UPDATE public.t_cuenta_alumno SET saldo_actual = 0 WHERE saldo_actual < 0;
