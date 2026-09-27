-- 1. Agregamos la nueva columna id_sucursales como array de enteros
ALTER TABLE public.t_usuarios ADD COLUMN IF NOT EXISTS id_sucursales integer[];

-- 2. Migramos los datos: convertimos el texto 'CENTRO, ALTO VERDE' en [1, 2] buscando en t_sucursales
UPDATE public.t_usuarios u
SET id_sucursales = (
    SELECT array_agg(s.id_sucursal)
    FROM public.t_sucursales s
    WHERE UPPER(s.n_sucursal) = ANY (
        SELECT UPPER(trim(unnest(string_to_array(u.sucursal, ','))))
    )
);

-- Si algún usuario quedó con array nulo pero tenía sucursal, le asignamos array vacío
UPDATE public.t_usuarios SET id_sucursales = '{}'::integer[] WHERE id_sucursales IS NULL;

-- 3. Borramos las columnas viejas, usando CASCADE para la vista dependiente
DROP VIEW IF EXISTS usuarios;
ALTER TABLE public.t_usuarios DROP COLUMN IF EXISTS sucursal CASCADE;
ALTER TABLE public.t_usuarios DROP COLUMN IF EXISTS id_sucursal;

-- Recrear la vista usuarios
CREATE OR REPLACE VIEW usuarios AS
 SELECT id_usuarios AS id_usuario,
    nro_documento::character varying AS nro_documento,
    clave,
    email,
    google_id,
    avatar_url,
    nombre,
    apellido,
    telefono::character varying AS telefono,
    instagram,
    fecha_nacimiento,
    rol,
    bl_cambio_pass_pte,
    created_at,
    (
        SELECT COALESCE(string_agg(s.n_sucursal, ', '), 'CENTRO')
        FROM unnest(t_usuarios.id_sucursales) AS sid
        LEFT JOIN public.t_sucursales s ON s.id_sucursal = sid
    ) AS sucursal,
    true AS active
   FROM public.t_usuarios;

-- 4. Trigger opcional para integridad referencial (asegura que las sucursales existan)
CREATE OR REPLACE FUNCTION trg_check_id_sucursales_usuario()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id_sucursales IS NOT NULL AND array_length(NEW.id_sucursales, 1) > 0 THEN
        IF EXISTS (
            SELECT 1
            FROM unnest(NEW.id_sucursales) AS suc_id
            LEFT JOIN public.t_sucursales s ON s.id_sucursal = suc_id
            WHERE s.id_sucursal IS NULL
        ) THEN
            RAISE EXCEPTION 'Violación de clave foránea: una o más sucursales asignadas no existen en la tabla t_sucursales.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_id_sucursales_usuario_ins_upd ON public.t_usuarios;

CREATE TRIGGER trg_check_id_sucursales_usuario_ins_upd
BEFORE INSERT OR UPDATE ON public.t_usuarios
FOR EACH ROW
EXECUTE FUNCTION trg_check_id_sucursales_usuario();
