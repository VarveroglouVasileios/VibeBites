-- ══════════════════════════════════════════════════════
-- VibeBites – Admin Seed & Auto-Promotion
-- ══════════════════════════════════════════════════════

-- Auto-promote specific emails to admin on profile creation
CREATE OR REPLACE FUNCTION public.auto_promote_admin()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get the email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

  -- Promote known admin emails
  IF user_email IN ('varveroglou@hotmail.gr') THEN
    NEW.role := 'admin';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire BEFORE INSERT so we can modify the row
CREATE TRIGGER auto_promote_admin_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_promote_admin();
