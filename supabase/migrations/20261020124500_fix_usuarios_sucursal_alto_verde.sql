-- Migración para restaurar la sucursal correcta a usuarios que fueron reseteados a Centro (id 1)
-- cuando su historial de clases pertenece exclusivamente a Alto Verde (id 2).

-- 1. Restaurar id_sucursales en t_usuarios a Alto Verde (id 2)
UPDATE public.t_usuarios u
SET id_sucursales = ARRAY[2]
WHERE u.id_usuarios IN (
    SELECT DISTINCT u2.id_usuarios
    FROM public.t_usuarios u2
    JOIN public.t_inscripciones i ON i.id_usuarios = u2.id_usuarios
    JOIN public.t_clases_instancia ci ON ci.id_clase_instancia = i.id_clase_instancia
    JOIN public.t_clases_def cd ON cd.id_clases_def = ci.id_clases_def
    LEFT JOIN public.t_sucursales s_class ON s_class.id_sucursal = cd.id_sucursal
    WHERE u2.rol = 'ALUMNO'
      AND UPPER(s_class.n_sucursal) LIKE '%ALTO VERDE%'
      AND u2.id_sucursales = ARRAY[1]
    GROUP BY u2.id_usuarios
    HAVING COUNT(CASE WHEN UPPER(s_class.n_sucursal) LIKE '%CENTRO%' THEN 1 END) = 0
);

-- 2. Actualizar t_cuenta_alumno para mantener consistencia con t_usuarios
UPDATE public.t_cuenta_alumno ca
SET id_sucursal = 2
WHERE ca.id_usuarios IN (
    SELECT id_usuarios FROM public.t_usuarios WHERE id_sucursales = ARRAY[2]
) AND (ca.id_sucursal IS NULL OR ca.id_sucursal = 1);
