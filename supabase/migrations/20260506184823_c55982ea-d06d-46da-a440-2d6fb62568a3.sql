create table public.menu_prices (
  item_id text primary key,
  price numeric(10,2),
  updated_at timestamptz not null default now()
);

alter table public.menu_prices enable row level security;

create policy "anyone read prices" on public.menu_prices for select using (true);
create policy "anyone insert prices" on public.menu_prices for insert with check (true);
create policy "anyone update prices" on public.menu_prices for update using (true) with check (true);

alter publication supabase_realtime add table public.menu_prices;