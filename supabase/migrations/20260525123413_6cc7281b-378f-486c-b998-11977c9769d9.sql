
-- Box di cibo offerti
create table public.food_boxes (
  id uuid primary key default gen_random_uuid(),
  restaurant_name text not null,
  description text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  portions integer not null default 1 check (portions > 0 and portions < 1000),
  pickup_from timestamptz not null,
  pickup_to timestamptz not null,
  status text not null default 'available' check (status in ('available','reserved','picked_up')),
  created_at timestamptz not null default now()
);

alter table public.food_boxes enable row level security;

create policy "Public can view food boxes"
  on public.food_boxes for select
  using (true);

-- Permettiamo update dello status da chi prenota (demo senza auth)
create policy "Anyone can mark a box as reserved"
  on public.food_boxes for update
  using (true)
  with check (status in ('available','reserved','picked_up'));

-- Prenotazioni
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  food_box_id uuid not null references public.food_boxes(id) on delete cascade,
  reserver_name text not null check (length(reserver_name) between 2 and 80),
  reserver_email text not null check (length(reserver_email) between 5 and 120),
  reserver_role text not null check (reserver_role in ('associazione','volontario')),
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','picked_up')),
  created_at timestamptz not null default now()
);

alter table public.reservations enable row level security;

create policy "Public can view reservations"
  on public.reservations for select
  using (true);

create policy "Anyone can create a reservation"
  on public.reservations for insert
  with check (true);

create index reservations_box_idx on public.reservations(food_box_id);

-- Seed di 5 box demo (Milano)
insert into public.food_boxes (restaurant_name, description, address, lat, lng, portions, pickup_from, pickup_to) values
  ('Trattoria Bella', 'Pasta al ragù + insalata, avanzi del pranzo', 'Via Brera 12, Milano', 45.4719, 9.1881, 8, now() + interval '1 hour', now() + interval '4 hour'),
  ('Pasticceria Sole', 'Cornetti e brioches del mattino', 'Corso Buenos Aires 45, Milano', 45.4790, 9.2090, 20, now() + interval '30 minute', now() + interval '3 hour'),
  ('Sala Eventi Roma', 'Buffet matrimonio: arancini, focacce, frutta', 'Viale Monza 88, Milano', 45.5050, 9.2240, 30, now() + interval '2 hour', now() + interval '5 hour'),
  ('Forno Centrale', 'Pane fresco e pizza al taglio', 'Via Padova 30, Milano', 45.4920, 9.2180, 15, now() + interval '45 minute', now() + interval '3 hour'),
  ('Ristorante Mare', 'Risotto ai frutti di mare, primi di pesce', 'Navigli, Milano', 45.4510, 9.1730, 6, now() + interval '1 hour', now() + interval '3 hour');
