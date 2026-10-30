-- Migración: Unificar cuentas de Marcos Jesús (mercadomarcosjesus27@gmail.com)
-- Dejar una única cuenta con roles ADMIN y PROFE, y ambas sucursales [1, 2]

DO $$
DECLARE
  v_target_id integer := 3;
  v_dup_id integer := 369;
BEGIN
  -- 1. Actualizar usuario 3 con ambas sucursales, roles ADMIN y PROFE, y datos de perfil
  UPDATE public.t_usuarios
  SET 
    rol = 'ADMIN',
    secondary_role = 'PROFE',
    id_sucursales = ARRAY[1, 2],
    telefono = COALESCE(telefono, '3875734001'),
    nro_documento = COALESCE(nro_documento, '42131975'),
    fecha_nacimiento = COALESCE(fecha_nacimiento, '1999-10-27'::date)
  WHERE id_usuarios = v_target_id;

  -- 2. Asegurar que las clases de t_clases_def que tenían al profesor 369 apunten al profesor 3
  UPDATE public.t_clases_def
  SET id_profesores = ARRAY(
    SELECT DISTINCT unnest(array_replace(id_profesores, v_dup_id, v_target_id))
  )
  WHERE v_dup_id = ANY(id_profesores);

  -- 3. Eliminar usuario duplicado 369 si todavía existe
  DELETE FROM public.t_usuarios WHERE id_usuarios = v_dup_id;
END $$;
