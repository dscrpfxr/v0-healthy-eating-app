-- Ingredientes básicos comunes
insert into public.ingredientes (nombre, calorias, proteinas, carbohidratos, grasas, fibra, categoria, es_publico) values
-- Verduras
('Tomate', 18, 0.9, 3.9, 0.2, 1.2, 'verdura', true),
('Lechuga', 15, 1.4, 2.9, 0.2, 1.3, 'verdura', true),
('Zanahoria', 41, 0.9, 9.6, 0.2, 2.8, 'verdura', true),
('Brócoli', 34, 2.8, 7, 0.4, 2.6, 'verdura', true),
('Espinaca', 23, 2.9, 3.6, 0.4, 2.2, 'verdura', true),
('Cebolla', 40, 1.1, 9.3, 0.1, 1.7, 'verdura', true),
('Pimiento', 31, 1, 6, 0.3, 2.1, 'verdura', true),
('Pepino', 15, 0.7, 3.6, 0.1, 0.5, 'verdura', true),

-- Frutas
('Manzana', 52, 0.3, 14, 0.2, 2.4, 'fruta', true),
('Plátano', 89, 1.1, 23, 0.3, 2.6, 'fruta', true),
('Naranja', 47, 0.9, 12, 0.1, 2.4, 'fruta', true),
('Fresa', 32, 0.7, 7.7, 0.3, 2, 'fruta', true),
('Aguacate', 160, 2, 8.5, 15, 6.7, 'fruta', true),
('Sandía', 30, 0.6, 7.6, 0.2, 0.4, 'fruta', true),

-- Proteínas
('Pechuga de pollo', 165, 31, 0, 3.6, 0, 'proteina', true),
('Huevo', 155, 13, 1.1, 11, 0, 'proteina', true),
('Salmón', 208, 20, 0, 13, 0, 'proteina', true),
('Atún', 130, 28, 0, 1, 0, 'proteina', true),
('Carne de res', 250, 26, 0, 15, 0, 'proteina', true),
('Tofu', 76, 8, 1.9, 4.8, 0.3, 'proteina', true),

-- Lácteos
('Leche descremada', 34, 3.4, 5, 0.1, 0, 'lacteo', true),
('Yogur natural', 59, 10, 3.6, 0.4, 0, 'lacteo', true),
('Queso fresco', 264, 18, 3.4, 21, 0, 'lacteo', true),

-- Cereales y legumbres
('Arroz integral', 111, 2.6, 23, 0.9, 1.8, 'cereal', true),
('Avena', 389, 17, 66, 7, 10.6, 'cereal', true),
('Pan integral', 247, 13, 41, 3.4, 7, 'cereal', true),
('Lentejas', 116, 9, 20, 0.4, 7.9, 'legumbre', true),
('Garbanzos', 164, 8.9, 27, 2.6, 7.6, 'legumbre', true),
('Frijoles negros', 132, 8.9, 24, 0.5, 8.7, 'legumbre', true),

-- Frutos secos
('Almendras', 579, 21, 22, 50, 12.5, 'fruto_seco', true),
('Nueces', 654, 15, 14, 65, 6.7, 'fruto_seco', true),

-- Aceites y grasas
('Aceite de oliva', 884, 0, 0, 100, 0, 'grasa', true),
('Mantequilla', 717, 0.9, 0.1, 81, 0, 'grasa', true)

on conflict do nothing;
