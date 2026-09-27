-- Crear función para verificar existencia de profesores en t_usuarios
CREATE OR REPLACE FUNCTION trg_check_id_profesores()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id_profesores IS NOT NULL AND array_length(NEW.id_profesores, 1) > 0 THEN
        -- Check if there are any elements in NEW.id_profesores that do NOT exist in t_usuarios
        IF EXISTS (
            SELECT 1
            FROM unnest(NEW.id_profesores) AS prof_id
            LEFT JOIN public.t_usuarios u ON u.id_usuarios = prof_id
            WHERE u.id_usuarios IS NULL
        ) THEN
            RAISE EXCEPTION 'Violación de clave foránea: uno o más profesores asignados no existen en la tabla t_usuarios.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Borrar trigger si ya existe para evitar duplicados
DROP TRIGGER IF EXISTS trg_check_id_profesores_ins_upd ON public.t_clases_def;

-- Crear el trigger
CREATE TRIGGER trg_check_id_profesores_ins_upd
BEFORE INSERT OR UPDATE ON public.t_clases_def
FOR EACH ROW
EXECUTE FUNCTION trg_check_id_profesores();
