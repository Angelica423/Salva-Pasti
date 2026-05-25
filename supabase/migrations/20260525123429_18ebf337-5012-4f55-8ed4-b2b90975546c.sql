
drop policy "Anyone can mark a box as reserved" on public.food_boxes;
create policy "Reserve an available box"
  on public.food_boxes for update
  using (status = 'available')
  with check (status in ('reserved','picked_up'));

drop policy "Anyone can create a reservation" on public.reservations;
create policy "Create a valid reservation"
  on public.reservations for insert
  with check (
    length(reserver_name) between 2 and 80
    and length(reserver_email) between 5 and 120
    and reserver_email like '%_@_%.__%'
    and reserver_role in ('associazione','volontario')
  );
