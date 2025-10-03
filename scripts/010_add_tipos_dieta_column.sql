-- Add tipos_dieta column to profiles table
-- This is a simplified version focusing only on adding the column

-- Add the tipos_dieta column as a text array
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'tipos_dieta'
    ) THEN
        ALTER TABLE profiles ADD COLUMN tipos_dieta text[];
        
        -- Migrate existing data from tipo_dieta to tipos_dieta
        UPDATE profiles 
        SET tipos_dieta = ARRAY[tipo_dieta]
        WHERE tipo_dieta IS NOT NULL AND tipo_dieta != '';
        
        RAISE NOTICE 'Column tipos_dieta added successfully';
    ELSE
        RAISE NOTICE 'Column tipos_dieta already exists';
    END IF;
END $$;
