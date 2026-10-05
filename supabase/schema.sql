create extension if not exists pgcrypto;

create table if not exists public.anggota (
  id uuid primary key default gen_random_uuid(),
  nama_lengkap text not null check (length(trim(nama_lengkap)) > 0),
  email text not null unique check (position('@' in email) > 1),
  tipe_member text not null default 'STUDENT'
    check (tipe_member in ('STUDENT', 'ADMIN')),
  joined_at timestamptz not null default now()
);

create table if not exists public.buku (
  id uuid primary key default gen_random_uuid(),
  isbn text not null unique check (length(trim(isbn)) > 0),
  judul text not null check (length(trim(judul)) > 0),
  penulis text not null check (length(trim(penulis)) > 0),
  kategori text not null check (length(trim(kategori)) > 0),
  total_ketersediaan integer not null default 1 check (total_ketersediaan >= 0),
  tersedia integer not null
    check (tersedia >= 0 and tersedia <= total_ketersediaan)
);

create or replace function public.inisialisasi_ketersediaan_buku()
returns trigger
language plpgsql
as $$
begin
  new.tersedia := coalesce(new.tersedia, new.total_ketersediaan);
  return new;
end;
$$;

drop trigger if exists inisialisasi_ketersediaan_buku_trigger on public.buku;
create trigger inisialisasi_ketersediaan_buku_trigger
before insert on public.buku
for each row execute function public.inisialisasi_ketersediaan_buku();

create table if not exists public.peminjaman (
  id uuid primary key default gen_random_uuid(),
  buku_id uuid not null references public.buku(id) on delete restrict,
  anggota_id uuid not null references public.anggota(id) on delete restrict,
  tanggal_peminjaman date not null default current_date,
  tenggat_peminjaman date not null,
  tanggal_pengembalian date,
  status_peminjaman text not null default 'DIPINJAM'
    check (status_peminjaman in ('DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT')),
  constraint peminjaman_tanggal_valid
    check (tenggat_peminjaman >= tanggal_peminjaman),
  constraint peminjaman_pengembalian_valid
    check (tanggal_pengembalian is null or tanggal_pengembalian >= tanggal_peminjaman),
  constraint peminjaman_status_valid
    check (
      (status_peminjaman = 'DIKEMBALIKAN' and tanggal_pengembalian is not null)
      or (status_peminjaman <> 'DIKEMBALIKAN')
    )
);

create index if not exists peminjaman_buku_id_idx on public.peminjaman (buku_id);
create index if not exists peminjaman_anggota_id_idx on public.peminjaman (anggota_id);
create index if not exists peminjaman_status_idx on public.peminjaman (status_peminjaman);

create or replace function public.sinkronkan_ketersediaan_buku()
returns trigger
language plpgsql
as $$
declare
  old_active boolean := false;
  new_active boolean := false;
  stock_delta integer;
begin
  if tg_op <> 'INSERT' then
    old_active := old.status_peminjaman in ('DIPINJAM', 'TERLAMBAT');
  end if;
  if tg_op <> 'DELETE' then
    new_active := new.status_peminjaman in ('DIPINJAM', 'TERLAMBAT');
  end if;

  if tg_op = 'DELETE' then
    update public.buku
    set tersedia = tersedia + 1
    where id = old.buku_id;
    return old;
  end if;

  if tg_op = 'INSERT' then
    if new_active then
      update public.buku
      set tersedia = tersedia - 1
      where id = new.buku_id and tersedia > 0;
      if not found then
        raise exception 'Buku tidak tersedia';
      end if;
    end if;
    return new;
  end if;

  if old.buku_id <> new.buku_id or old_active <> new_active then
    if old_active then
      update public.buku set tersedia = tersedia + 1 where id = old.buku_id;
    end if;
    if new_active then
      update public.buku
      set tersedia = tersedia - 1
      where id = new.buku_id and tersedia > 0;
      if not found then
        raise exception 'Buku tidak tersedia';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists sinkronkan_ketersediaan_buku_trigger on public.peminjaman;
create trigger sinkronkan_ketersediaan_buku_trigger
after insert or update of buku_id, status_peminjaman or delete on public.peminjaman
for each row execute function public.sinkronkan_ketersediaan_buku();

alter table public.anggota enable row level security;
alter table public.buku enable row level security;
alter table public.peminjaman enable row level security;
