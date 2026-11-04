-- Corregir estado de bonificaciones de créditos gratis en t_historial_creditos
-- para que no se listen como pagos de $0 en la pestaña de cobros y recaudación.
UPDATE public.t_historial_creditos
SET estado = 'FREE'
WHERE (monto = 0 OR monto IS NULL) 
  AND motivo = 'Crédito Gratis (Otorgado por Admin)';
