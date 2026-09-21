-- Update springr_user_type enum to include all 5 roles
-- First, drop the existing type references and recreate
ALTER TYPE public.springr_user_type ADD VALUE 'lyceen' BEFORE 'etudiant';
ALTER TYPE public.springr_user_type ADD VALUE 'diplome';
ALTER TYPE public.springr_user_type ADD VALUE 'recruteur';
ALTER TYPE public.springr_user_type ADD VALUE 'ecole';

-- Add role column to profiles table (stores the user's selected role)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT;

-- Update the handle_new_user trigger to include role from user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type, role)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'user_type', '')::public.springr_user_type,
    NULLIF(NEW.raw_user_meta_data->>'role', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
