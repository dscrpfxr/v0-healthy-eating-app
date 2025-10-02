-- Metas de salud
create table if not exists public.metas_salud (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  peso_objetivo numeric(5,2),
  calorias_diarias integer,
  meta_descripcion text,
  fecha_inicio date default current_date,
  fecha_objetivo date,
  activa boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.metas_salud enable row level security;

create policy "metas_select_own"
  on public.metas_salud for select
  using (auth.uid() = user_id);

create policy "metas_insert_own"
  on public.metas_salud for insert
  with check (auth.uid() = user_id);

create policy "metas_update_own"
  on public.metas_salud for update
  using (auth.uid() = user_id);

create policy "metas_delete_own"
  on public.metas_salud for delete
  using (auth.uid() = user_id);

-- Registro de progreso
create table if not exists public.progreso_salud (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meta_id uuid references public.metas_salud(id) on delete set null,
  peso numeric(5,2),
  medida_pecho numeric(5,2),
  medida_cintura numeric(5,2),
  medida_cadera numeric(5,2),
  foto_url text,
  notas text,
  fecha date default current_date,
  created_at timestamptz default now()
);

alter table public.progreso_salud enable row level security;

create policy "progreso_select_own"
  on public.progreso_salud for select
  using (auth.uid() = user_id);

create policy "progreso_insert_own"
  on public.progreso_salud for insert
  with check (auth.uid() = user_id);

create policy "progreso_update_own"
  on public.progreso_salud for update
  using (auth.uid() = user_id);

create policy "progreso_delete_own"
  on public.progreso_salud for delete
  using (auth.uid() = user_id);

-- Índice para consultas por fecha
create index if not exists idx_progreso_fecha on public.progreso_salud(user_id, fecha desc);
