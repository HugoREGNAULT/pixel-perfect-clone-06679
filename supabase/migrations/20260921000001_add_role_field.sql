-- Extend springr_user_type enum to include all business roles
-- The role column in profiles remains admin-only (user/admin/moderator)
-- Business role is stored in user_type
ALTER TYPE public.springr_user_type ADD VALUE IF NOT EXISTS 'etudiant';
ALTER TYPE public.springr_user_type ADD VALUE IF NOT EXISTS 'lyceen';
ALTER TYPE public.springr_user_type ADD VALUE IF NOT EXISTS 'diplome';
ALTER TYPE public.springr_user_type ADD VALUE IF NOT EXISTS 'recruteur';
ALTER TYPE public.springr_user_type ADD VALUE IF NOT EXISTS 'ecole';

-- Update handle_new_user to set user_type from user metadata
-- NEVER populate the admin 'role' column from user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('etudiant', 'lyceen', 'diplome', 'recruteur', 'ecole')
      THEN NEW.raw_user_meta_data->>'role'::public.springr_user_type
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
