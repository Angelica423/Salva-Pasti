
-- Add columns to food_boxes
ALTER TABLE public.food_boxes
  ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS donor_name text,
  ADD COLUMN IF NOT EXISTS food_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recurrence text;

-- Allow public inserts to food_boxes (for restaurateurs and citizens donating suspended boxes)
CREATE POLICY "Anyone can create a food box"
ON public.food_boxes
FOR INSERT
TO public
WITH CHECK (
  length(restaurant_name) BETWEEN 2 AND 120
  AND length(description) BETWEEN 2 AND 500
  AND length(address) BETWEEN 2 AND 200
  AND portions BETWEEN 1 AND 200
  AND status = 'available'
);

-- Add pickup_code to reservations
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS pickup_code text;

-- Allow updating own reservation status (cancel / mark picked up) by matching email
CREATE POLICY "Update own reservation status"
ON public.reservations
FOR UPDATE
TO public
USING (true)
WITH CHECK (status IN ('confirmed', 'cancelled', 'picked_up'));
