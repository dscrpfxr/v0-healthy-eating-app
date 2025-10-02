-- Temas del foro
create table if not exists public.foro_temas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descripcion text not null,
  categoria text, -- nutricion, recetas, ejercicio, motivacion, etc
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.foro_temas enable row level security;

-- Todos pueden ver temas
create policy "foro_temas_select_all"
  on public.foro_temas for select
  using (true);

create policy "foro_temas_insert_own"
  on public.foro_temas for insert
  with check (auth.uid() = user_id);

create policy "foro_temas_update_own"
  on public.foro_temas for update
  using (auth.uid() = user_id);

create policy "foro_temas_delete_own"
  on public.foro_temas for delete
  using (auth.uid() = user_id);

-- Respuestas del foro
create table if not exists public.foro_respuestas (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.foro_temas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  contenido text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.foro_respuestas enable row level security;

-- Todos pueden ver respuestas
create policy "foro_respuestas_select_all"
  on public.foro_respuestas for select
  using (true);

create policy "foro_respuestas_insert_own"
  on public.foro_respuestas for insert
  with check (auth.uid() = user_id);

create policy "foro_respuestas_update_own"
  on public.foro_respuestas for update
  using (auth.uid() = user_id);

create policy "foro_respuestas_delete_own"
  on public.foro_respuestas for delete
  using (auth.uid() = user_id);

-- Índices para búsqueda
create index if not exists idx_foro_temas_categoria on public.foro_temas(categoria);
create index if not exists idx_foro_respuestas_tema on public.foro_respuestas(tema_id, created_at);
