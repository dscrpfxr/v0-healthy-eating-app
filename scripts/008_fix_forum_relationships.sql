-- Primero, eliminar las foreign keys existentes que apuntan a auth.users
alter table public.foro_temas drop constraint if exists foro_temas_user_id_fkey;
alter table public.foro_respuestas drop constraint if exists foro_respuestas_user_id_fkey;

-- Ahora crear las foreign keys que apuntan a profiles
-- Esto permite que Supabase PostgREST entienda la relación para los joins
alter table public.foro_temas 
  add constraint foro_temas_user_id_fkey 
  foreign key (user_id) 
  references public.profiles(id) 
  on delete cascade;

alter table public.foro_respuestas 
  add constraint foro_respuestas_user_id_fkey 
  foreign key (user_id) 
  references public.profiles(id) 
  on delete cascade;
