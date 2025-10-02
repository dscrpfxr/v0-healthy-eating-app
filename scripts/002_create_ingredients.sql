-- Tabla de ingredientes con información nutricional
create table if not exists public.ingredientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  calorias numeric(8,2) not null, -- por 100g
  proteinas numeric(6,2) default 0,
  carbohidratos numeric(6,2) default 0,
  grasas numeric(6,2) default 0,
  fibra numeric(6,2) default 0,
  azucares numeric(6,2) default 0,
  sodio numeric(6,2) default 0,
  categoria text, -- verdura, fruta, proteina, cereal, lacteo, etc
  created_by uuid references auth.users(id) on delete set null,
  es_publico boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ingredientes enable row level security;

-- Todos pueden ver ingredientes públicos
create policy "ingredientes_select_public"
  on public.ingredientes for select
  using (es_publico = true or created_by = auth.uid());

-- Solo el creador puede insertar
create policy "ingredientes_insert_own"
  on public.ingredientes for insert
  with check (created_by = auth.uid());

-- Solo el creador puede actualizar sus ingredientes
create policy "ingredientes_update_own"
  on public.ingredientes for update
  using (created_by = auth.uid());

-- Solo el creador puede eliminar sus ingredientes
create policy "ingredientes_delete_own"
  on public.ingredientes for delete
  using (created_by = auth.uid());

-- Índice para búsqueda rápida
create index if not exists idx_ingredientes_nombre on public.ingredientes using gin(to_tsvector('spanish', nombre));
