-- Agregar columna de nivel de actividad al perfil
alter table public.profiles
add column if not exists nivel_actividad text default 'moderado';

-- Comentario sobre los niveles de actividad:
-- 'sedentario': Poco o ningún ejercicio
-- 'ligero': Ejercicio ligero 1-3 días/semana
-- 'moderado': Ejercicio moderado 3-5 días/semana
-- 'activo': Ejercicio intenso 6-7 días/semana
-- 'muy_activo': Ejercicio muy intenso, trabajo físico o entrenamiento 2 veces al día
