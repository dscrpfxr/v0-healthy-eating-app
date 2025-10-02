-- Intolerancias del usuario
create table if not exists public.intolerancias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ingrediente_id uuid not null references public.ingredientes(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, ingrediente_id)
);

alter table public.intolerancias enable row level security;

create policy "intolerancias_select_own"
  on public.intolerancias for select
  using (auth.uid() = user_id);

create policy "intolerancias_insert_own"
  on public.intolerancias for insert
  with check (auth.uid() = user_id);

create policy "intolerancias_delete_own"
  on public.intolerancias for delete
  using (auth.uid() = user_id);

-- Preferencias de alimentos
create table if not exists public.preferencias_alimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ingrediente_id uuid not null references public.ingredientes(id) on delete cascade,
  tipo text not null check (tipo in ('favorito', 'no_gusta')),
  created_at timestamptz default now(),
  unique(user_id, ingrediente_id)
);

alter table public.preferencias_alimentos enable row level security;

create policy "preferencias_select_own"
  on public.preferencias_alimentos for select
  using (auth.uid() = user_id);

create policy "preferencias_insert_own"
  on public.preferencias_alimentos for insert
  with check (auth.uid() = user_id);

create policy "preferencias_update_own"
  on public.preferencias_alimentos for update
  using (auth.uid() = user_id);

create policy "preferencias_delete_own"
  on public.preferencias_alimentos for delete
  using (auth.uid() = user_id);

-- Recetas favoritas
create table if not exists public.recetas_favoritas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  receta_id uuid not null references public.recetas(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, receta_id)
);

alter table public.recetas_favoritas enable row level security;

create policy "recetas_favoritas_select_own"
  on public.recetas_favoritas for select
  using (auth.uid() = user_id);

create policy "recetas_favoritas_insert_own"
  on public.recetas_favoritas for insert
  with check (auth.uid() = user_id);

create policy "recetas_favoritas_delete_own"
  on public.recetas_favoritas for delete
  using (auth.uid() = user_id);
