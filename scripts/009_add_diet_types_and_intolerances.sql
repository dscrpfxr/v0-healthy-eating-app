-- Agregar columna para múltiples tipos de dieta
alter table public.profiles 
  add column if not exists tipos_dieta text[] default '{}';

-- Migrar datos existentes de tipo_dieta a tipos_dieta
update public.profiles
set tipos_dieta = array[tipo_dieta]
where tipo_dieta is not null and tipos_dieta = '{}';

-- Tabla de intolerancias alimentarias del usuario
create table if not exists public.intolerancias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ingrediente_id uuid not null references public.ingredientes(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, ingrediente_id)
);

alter table public.intolerancias enable row level security;

-- Drop existing policies before creating to make script idempotent
drop policy if exists "intolerancias_select_own" on public.intolerancias;
create policy "intolerancias_select_own"
  on public.intolerancias for select
  using (auth.uid() = user_id);

drop policy if exists "intolerancias_insert_own" on public.intolerancias;
create policy "intolerancias_insert_own"
  on public.intolerancias for insert
  with check (auth.uid() = user_id);

drop policy if exists "intolerancias_delete_own" on public.intolerancias;
create policy "intolerancias_delete_own"
  on public.intolerancias for delete
  using (auth.uid() = user_id);

-- Índice para búsqueda rápida
create index if not exists idx_intolerancias_user on public.intolerancias(user_id);
