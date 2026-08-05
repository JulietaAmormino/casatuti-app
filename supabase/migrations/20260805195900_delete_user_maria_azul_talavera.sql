DO $$ 
DECLARE 
  v_user_id INTEGER;
BEGIN
  -- Buscar el ID de la usuaria por su email o nombre completo
  SELECT id_usuarios INTO v_user_id 
  FROM t_usuarios 
  WHERE email = 'azultalav@gmail.com' OR (nombre = 'Maria' AND apellido = 'Azul Talavera')
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Desvincular reprogramaciones si existen para evitar errores de FK a sí misma
    UPDATE t_inscripciones 
    SET id_reprogramada_hacia = NULL, id_reprogramada_desde = NULL 
    WHERE id_usuarios = v_user_id;

    -- Eliminar dependencias
    DELETE FROM t_deudas_insumos WHERE id_usuarios = v_user_id;
    DELETE FROM t_historial_creditos WHERE id_usuarios = v_user_id;
    DELETE FROM t_lista_espera WHERE id_usuarios = v_user_id;
    DELETE FROM t_notificaciones WHERE id_usuarios = v_user_id;
    DELETE FROM t_cuenta_alumno WHERE id_usuarios = v_user_id;
    DELETE FROM t_suscripciones_push WHERE id_usuarios = v_user_id;
    DELETE FROM t_inscripciones WHERE id_usuarios = v_user_id;
    
    -- Eliminar usuario
    DELETE FROM t_usuarios WHERE id_usuarios = v_user_id;
  END IF;
END $$;
