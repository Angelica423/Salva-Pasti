CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text NOT NULL UNIQUE,
  nome text,
  ruolo text NOT NULL DEFAULT 'cittadino',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = id
    AND length(phone) BETWEEN 6 AND 20
    AND (nome IS NULL OR length(nome) BETWEEN 2 AND 80)
    AND ruolo IN ('ristoratore','associazione','volontario','cittadino')
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (
    auth.uid() = id
    AND (nome IS NULL OR length(nome) BETWEEN 2 AND 80)
    AND ruolo IN ('ristoratore','associazione','volontario','cittadino')
  );