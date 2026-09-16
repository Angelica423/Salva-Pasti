CREATE OR REPLACE FUNCTION public.get_reservation_for_pickup(p_reservation_id uuid, p_pickup_code text)
RETURNS TABLE(
  id uuid,
  status text,
  reserver_name text,
  reserver_role text,
  created_at timestamptz,
  restaurant_name text,
  description text,
  address text,
  portions integer,
  pickup_from timestamptz,
  pickup_to timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.expire_stale_reservations();

  RETURN QUERY
  SELECT r.id, r.status, r.reserver_name, r.reserver_role, r.created_at,
         fb.restaurant_name, fb.description, fb.address, fb.portions,
         fb.pickup_from, fb.pickup_to
  FROM public.reservations r
  JOIN public.food_boxes fb ON fb.id = r.food_box_id
  WHERE r.id = p_reservation_id AND r.pickup_code = p_pickup_code;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_reservation_for_pickup(uuid, text) TO anon, authenticated;