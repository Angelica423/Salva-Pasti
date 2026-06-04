CREATE TABLE public.partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  org_type TEXT NOT NULL,
  beneficiaries INT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_applications TO anon;
GRANT SELECT, INSERT ON public.partner_applications TO authenticated;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit application" ON public.partner_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view own by email" ON public.partner_applications FOR SELECT TO anon, authenticated USING (false);