-- Agregar columna de nivel de actividad a las metas
alter table public.metas_salud
add column if not exists nivel_actividad text default 'moderado';
