-- Migración: Registro y auditoría para cancelación de pagos e insumos pendientes
-- Casa Tuti App

-- 1. Asegurar índice para consultas eficientes de pagos por alumno y estado
CREATE INDEX IF NOT EXISTS idx_historial_creditos_usuario_estado 
  ON public.t_historial_creditos (id_usuarios, estado);

-- 2. Documentar los estados válidos en t_historial_creditos:
-- 'PENDING': Solicitud de pago ingresada por la alumna o registrada pendiente por el admin.
-- 'PAID' / 'CONFIRMED': Pago recibido y confirmado por el admin (créditos acreditados).
-- 'CANCELLED': Solicitud rechazada o cancelada por el admin (no se acreditan créditos ni se genera deuda).
COMMENT ON COLUMN public.t_historial_creditos.estado IS 'Estado del movimiento: PENDING, PAID, CONFIRMED, CANCELLED';
