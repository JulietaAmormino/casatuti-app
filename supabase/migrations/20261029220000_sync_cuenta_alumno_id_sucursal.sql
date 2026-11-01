-- Migración: Sincronizar id_sucursal en t_cuenta_alumno con t_usuarios
-- 1. Actualizar las filas existentes que tienen id_sucursal NULL
UPDATE public.t_cuenta_alumno ca
SET id_sucursal = u.id_sucursales[1]
FROM public.t_usuarios u
WHERE ca.id_usuarios = u.id_usuarios
  AND ca.id_sucursal IS NULL
  AND u.id_sucursales IS NOT NULL
  AND array_length(u.id_sucursales, 1) > 0;

-- 2. Función y Trigger: Al insertar en t_cuenta_alumno, si id_sucursal es NULL, tomar la sucursal de t_usuarios
CREATE OR REPLACE FUNCTION public.fn_sync_cuenta_alumno_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_sucursal IS NULL THEN
    NEW.id_sucursal := (
      SELECT id_sucursales[1] 
      FROM public.t_usuarios 
      WHERE id_usuarios = NEW.id_usuarios
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_cuenta_alumno_insert ON public.t_cuenta_alumno;
CREATE TRIGGER trg_sync_cuenta_alumno_insert
BEFORE INSERT ON public.t_cuenta_alumno
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_cuenta_alumno_insert();

-- 3. Función y Trigger: Al actualizar id_sucursales en t_usuarios, mantener actualizada t_cuenta_alumno
CREATE OR REPLACE FUNCTION public.fn_sync_usuario_sucursal_to_cuenta()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_sucursales IS NOT NULL AND array_length(NEW.id_sucursales, 1) > 0 THEN
    IF (OLD.id_sucursales IS NULL OR OLD.id_sucursales[1] IS DISTINCT FROM NEW.id_sucursales[1]) THEN
      UPDATE public.t_cuenta_alumno
      SET id_sucursal = NEW.id_sucursales[1]
      WHERE id_usuarios = NEW.id_usuarios;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_usuario_sucursal_to_cuenta ON public.t_usuarios;
CREATE TRIGGER trg_sync_usuario_sucursal_to_cuenta
AFTER UPDATE OF id_sucursales ON public.t_usuarios
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_usuario_sucursal_to_cuenta();
