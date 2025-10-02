-- Registro de alimentos consumidos
create table if not exists public.registro_alimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ingrediente_id uuid references public.ingredientes(id) on delete set null,
  receta_id uuid references public.recetas(id) on delete set null,
  nombre_alimento text not null, -- guardamos el nombre por si se elimina el ingrediente/receta
  cantidad numeric(8,2) not null, -- en gramos
  calorias numeric(8,2) not null,
  proteinas numeric(6,2) default 0,
  carbohidratos numeric(6,2) default 0,
  grasas numeric(6,2) default 0,
  fecha date default current_date,
  momento_dia text check (momento_dia in ('desayuno', 'almuerzo', 'cena', 'snack')),
  created_at timestamptz default now(),
  constraint check_ingrediente_o_receta check (
    (ingrediente_id is not null and receta_id is null) or
    (ingrediente_id is null and receta_id is not null)
  )
);

alter table public.registro_alimentos enable row level security;

create policy "registro_select_own"
  on public.registro_alimentos for select
  using (auth.uid() = user_id);

create policy "registro_insert_own"
  on public.registro_alimentos for insert
  with check (auth.uid() = user_id);

create policy "registro_update_own"
  on public.registro_alimentos for update
  using (auth.uid() = user_id);

create policy "registro_delete_own"
  on public.registro_alimentos for delete
  using (auth.uid() = user_id);

-- Índice para consultas por fecha
create index if not exists idx_registro_fecha on public.registro_alimentos(user_id, fecha desc);
