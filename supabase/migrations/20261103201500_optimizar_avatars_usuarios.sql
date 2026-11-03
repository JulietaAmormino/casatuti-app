-- Optimización de avatares en t_usuarios
-- Evita payloads gigantes en la carga de la aplicación limpiando avatares excesivamente pesados (> 100 KB)
-- o con formatos incompatibles (como HEIC crudo).
UPDATE public.t_usuarios
SET avatar_url = NULL
WHERE avatar_url IS NOT NULL 
  AND (length(avatar_url) > 100000 OR avatar_url LIKE 'data:image/jpeg;base64,AAAAGG%');
