-- Drop useless SELECT policy (USING false) that adds nothing
DROP POLICY IF EXISTS "Anyone can view own by email" ON public.partner_applications;

-- Replace permissive INSERT policy with one that validates inputs
DROP POLICY IF EXISTS "Anyone can submit application" ON public.partner_applications;

CREATE POLICY "Anyone can submit application"
ON public.partner_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(org_name) BETWEEN 2 AND 200
  AND length(contact_name) BETWEEN 2 AND 120
  AND length(email) BETWEEN 5 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(city) BETWEEN 2 AND 120
  AND length(org_type) BETWEEN 2 AND 60
  AND (phone IS NULL OR length(phone) BETWEEN 5 AND 40)
  AND (message IS NULL OR length(message) <= 2000)
  AND (beneficiaries IS NULL OR (beneficiaries >= 0 AND beneficiaries <= 100000))
  AND status = 'pending'
);