-- Tabla de perfiles de usuario
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  edad integer not null,
  peso numeric(5,2),
  altura numeric(5,2),
  genero text,
  tipo_dieta text, -- vegetariana, vegana, omnivora, etc
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Trigger para crear perfil automáticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, edad, peso, altura)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', 'Usuario'),
    coalesce((new.raw_user_meta_data ->> 'edad')::integer, 25),
    coalesce((new.raw_user_meta_data ->> 'peso')::numeric, null),
    coalesce((new.raw_user_meta_data ->> 'altura')::numeric, null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
