-- Tabla de recetas
create table if not exists public.recetas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  procedimiento text not null,
  tiempo_preparacion integer, -- en minutos
  porciones integer default 1,
  imagen_url text,
  created_by uuid references auth.users(id) on delete cascade,
  es_publica boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.recetas enable row level security;

-- Todos pueden ver recetas públicas
create policy "recetas_select_public"
  on public.recetas for select
  using (es_publica = true or created_by = auth.uid());

create policy "recetas_insert_own"
  on public.recetas for insert
  with check (created_by = auth.uid());

create policy "recetas_update_own"
  on public.recetas for update
  using (created_by = auth.uid());

create policy "recetas_delete_own"
  on public.recetas for delete
  using (created_by = auth.uid());

-- Tabla de ingredientes de recetas (relación muchos a muchos)
create table if not exists public.receta_ingredientes (
  id uuid primary key default gen_random_uuid(),
  receta_id uuid not null references public.recetas(id) on delete cascade,
  ingrediente_id uuid not null references public.ingredientes(id) on delete cascade,
  cantidad numeric(8,2) not null, -- en gramos
  created_at timestamptz default now()
);

alter table public.receta_ingredientes enable row level security;

create policy "receta_ingredientes_select"
  on public.receta_ingredientes for select
  using (true);

create policy "receta_ingredientes_insert"
  on public.receta_ingredientes for insert
  with check (
    exists (
      select 1 from public.recetas
      where id = receta_id and created_by = auth.uid()
    )
  );

create policy "receta_ingredientes_delete"
  on public.receta_ingredientes for delete
  using (
    exists (
      select 1 from public.recetas
      where id = receta_id and created_by = auth.uid()
    )
  );

-- Etiquetas de recetas
create table if not exists public.receta_etiquetas (
  id uuid primary key default gen_random_uuid(),
  receta_id uuid not null references public.recetas(id) on delete cascade,
  etiqueta text not null, -- vegetariana, vegana, sin_gluten, baja_en_calorias, etc
  created_at timestamptz default now(),
  unique(receta_id, etiqueta)
);

alter table public.receta_etiquetas enable row level security;

create policy "receta_etiquetas_select"
  on public.receta_etiquetas for select
  using (true);

create policy "receta_etiquetas_insert"
  on public.receta_etiquetas for insert
  with check (
    exists (
      select 1 from public.recetas
      where id = receta_id and created_by = auth.uid()
    )
  );

create policy "receta_etiquetas_delete"
  on public.receta_etiquetas for delete
  using (
    exists (
      select 1 from public.recetas
      where id = receta_id and created_by = auth.uid()
    )
  );

-- Índice para búsqueda
create index if not exists idx_recetas_nombre on public.recetas using gin(to_tsvector('spanish', nombre));
create index if not exists idx_receta_etiquetas on public.receta_etiquetas(etiqueta);
