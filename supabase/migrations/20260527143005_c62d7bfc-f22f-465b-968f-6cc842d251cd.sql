DROP POLICY IF EXISTS "Reserve an available box" ON public.food_boxes;
DROP POLICY IF EXISTS "Public can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Update own reservation status" ON public.reservations;
DROP POLICY IF EXISTS "Create a valid reservation" ON public.reservations;

CREATE OR REPLACE FUNCTION public.reserve_food_box(
  p_box_id uuid,
  p_name text,
  p_email text,
  p_role text
)
RETURNS TABLE(reservation_id uuid, pickup_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_res_id uuid;
  v_updated_id uuid;
BEGIN
  IF length(coalesce(p_name, '')) < 2 OR length(p_name) > 80 THEN
    RAISE EXCEPTION 'Nome non valido';
  END IF;
  IF length(coalesce(p_email, '')) < 5 OR length(p_email) > 120
     OR p_email NOT LIKE '%_@_%.__%' THEN
    RAISE EXCEPTION 'Email non valida';
  END IF;
  IF p_role NOT IN ('associazione', 'volontario') THEN
    RAISE EXCEPTION 'Ruolo non autorizzato';
  END IF;

  UPDATE public.food_boxes
    SET status = 'reserved'
    WHERE id = p_box_id AND status = 'available'
    RETURNING id INTO v_updated_id;

  IF v_updated_id IS NULL THEN
    RAISE EXCEPTION 'Box non più disponibile';
  END IF;

  v_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6));

  INSERT INTO public.reservations(food_box_id, reserver_name, reserver_email, reserver_role, pickup_code, status)
    VALUES (p_box_id, p_name, p_email, p_role, v_code, 'confirmed')
    RETURNING id INTO v_res_id;

  reservation_id := v_res_id;
  pickup_code := v_code;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_food_box(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_food_box(uuid, text, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_reservations(p_email text)
RETURNS SETOF public.reservations
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.reservations
  WHERE reserver_email = p_email
  ORDER BY created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_my_reservations(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_reservations(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_reservation_status(
  p_reservation_id uuid,
  p_pickup_code text,
  p_next_status text
)
RETURNS public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res public.reservations;
BEGIN
  IF p_next_status NOT IN ('cancelled', 'picked_up') THEN
    RAISE EXCEPTION 'Stato non valido';
  END IF;

  SELECT * INTO v_res FROM public.reservations
    WHERE id = p_reservation_id AND pickup_code = p_pickup_code
    FOR UPDATE;

  IF v_res.id IS NULL THEN
    RAISE EXCEPTION 'Prenotazione non trovata o codice errato';
  END IF;

  UPDATE public.reservations SET status = p_next_status
    WHERE id = p_reservation_id
    RETURNING * INTO v_res;

  IF p_next_status = 'cancelled' THEN
    UPDATE public.food_boxes SET status = 'available' WHERE id = v_res.food_box_id;
  ELSIF p_next_status = 'picked_up' THEN
    UPDATE public.food_boxes SET status = 'picked_up' WHERE id = v_res.food_box_id;
  END IF;

  RETURN v_res;
END;
$$;

REVOKE ALL ON FUNCTION public.update_reservation_status(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_reservation_status(uuid, text, text) TO anon, authenticated;