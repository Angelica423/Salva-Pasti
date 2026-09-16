CREATE TABLE public.reserver_status (
  email text PRIMARY KEY,
  consecutive_no_shows integer NOT NULL DEFAULT 0,
  suspended_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.reserver_status TO service_role;

ALTER TABLE public.reserver_status ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_reserver_status_updated_at
BEFORE UPDATE ON public.reserver_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Segna come "mancato ritiro" le prenotazioni scadute e aggiorna strike/sospensioni
CREATE OR REPLACE FUNCTION public.expire_stale_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r record;
  v_count integer := 0;
BEGIN
  FOR r IN
    SELECT res.id, res.reserver_email, res.food_box_id
    FROM public.reservations res
    JOIN public.food_boxes fb ON fb.id = res.food_box_id
    WHERE res.status = 'confirmed' AND fb.pickup_to < now()
    FOR UPDATE OF res
  LOOP
    UPDATE public.reservations SET status = 'no_show' WHERE id = r.id;
    UPDATE public.food_boxes SET status = 'available' WHERE id = r.food_box_id;

    INSERT INTO public.reserver_status(email, consecutive_no_shows)
      VALUES (lower(r.reserver_email), 1)
    ON CONFLICT (email) DO UPDATE
      SET consecutive_no_shows = public.reserver_status.consecutive_no_shows + 1;

    UPDATE public.reserver_status
      SET suspended_until = now() + interval '48 hours',
          consecutive_no_shows = 0
      WHERE email = lower(r.reserver_email)
        AND consecutive_no_shows >= 3;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Stato prenotazioni per una email: sospensione e box prenotate oggi
CREATE OR REPLACE FUNCTION public.get_reserver_limits(p_email text)
RETURNS TABLE(suspended_until timestamptz, consecutive_no_shows integer, reservations_today integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.expire_stale_reservations();

  SELECT s.suspended_until, s.consecutive_no_shows
    INTO suspended_until, consecutive_no_shows
    FROM public.reserver_status s WHERE s.email = lower(p_email);

  consecutive_no_shows := coalesce(consecutive_no_shows, 0);
  IF suspended_until IS NOT NULL AND suspended_until <= now() THEN
    suspended_until := NULL;
  END IF;

  SELECT count(*)::int INTO reservations_today
    FROM public.reservations r
    WHERE lower(r.reserver_email) = lower(p_email)
      AND r.status IN ('confirmed', 'picked_up')
      AND r.created_at >= date_trunc('day', now());

  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_food_box(p_box_id uuid, p_name text, p_email text, p_role text)
 RETURNS TABLE(reservation_id uuid, pickup_code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_code text;
  v_res_id uuid;
  v_updated_id uuid;
  v_suspended timestamptz;
  v_today integer;
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

  PERFORM public.expire_stale_reservations();

  SELECT s.suspended_until INTO v_suspended
    FROM public.reserver_status s WHERE s.email = lower(p_email);

  IF v_suspended IS NOT NULL AND v_suspended > now() THEN
    RAISE EXCEPTION 'Account sospeso per mancati ritiri fino al %', to_char(v_suspended, 'DD/MM/YYYY HH24:MI');
  END IF;

  SELECT count(*) INTO v_today
    FROM public.reservations r
    WHERE lower(r.reserver_email) = lower(p_email)
      AND r.status IN ('confirmed', 'picked_up')
      AND r.created_at >= date_trunc('day', now());

  IF v_today >= 1 THEN
    RAISE EXCEPTION 'Hai già prenotato una box oggi. Puoi prenotarne un''altra domani.';
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
$function$;

CREATE OR REPLACE FUNCTION public.get_my_reservations(p_email text)
 RETURNS SETOF reservations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.expire_stale_reservations();
  RETURN QUERY
    SELECT * FROM public.reservations
    WHERE lower(reserver_email) = lower(p_email)
    ORDER BY created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_reservation_status(p_reservation_id uuid, p_pickup_code text, p_next_status text)
 RETURNS reservations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  IF v_res.status <> 'confirmed' THEN
    RAISE EXCEPTION 'Prenotazione non più modificabile';
  END IF;

  UPDATE public.reservations SET status = p_next_status
    WHERE id = p_reservation_id
    RETURNING * INTO v_res;

  IF p_next_status = 'cancelled' THEN
    UPDATE public.food_boxes SET status = 'available' WHERE id = v_res.food_box_id;
  ELSIF p_next_status = 'picked_up' THEN
    UPDATE public.food_boxes SET status = 'picked_up' WHERE id = v_res.food_box_id;
    INSERT INTO public.reserver_status(email, consecutive_no_shows)
      VALUES (lower(v_res.reserver_email), 0)
    ON CONFLICT (email) DO UPDATE SET consecutive_no_shows = 0;
  END IF;

  RETURN v_res;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_reserver_limits(text) TO anon, authenticated;
