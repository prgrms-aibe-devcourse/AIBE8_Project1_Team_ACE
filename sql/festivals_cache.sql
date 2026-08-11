begin; -- 이 SQL은 최초 생성용이므로 이미 테이블이 생성된 DB에서 다시 실행하면 오류가 발생한다.

-- TourAPI 호출 결과를 잠깐 저장해두는 캐시 테이블.
-- 개인 정보가 아닌 공개 관광 데이터 이므로 누구나 읽고 쓸수 있다.
create table public.festivals (
    content_id text primary key,
    title text not null,
    event_start_date text,
    event_end_date text,
    address text,
    longitude double precision,
    latitude double precision,
    image text,
    overview text,
    synced_at timestamptz not null default now()
);

-- 현재 캐시가 최신인지를 판단하가 위한 동기화 시각 기록 테이블.
-- cache_key로 어떤 캐시(ex. 목록 전체)를 언제 갱신했는지 구분한다.
create table public.cache_meta (
    cache_key text primary key,
    synced_at timestamptz not null default now()
);


revoke all on table public.festivals
    from anon, authenticated;

grant select, insert, update on table public.festivals
    to anon, authenticated;

revoke all on table public.cache_meta
    from anon, authenticated;

grant select, insert, update on table public.cache_meta
    to anon, authenticated;


alter table public.festivals
    enable row level security;

alter table public.cache_meta
    enable row level security;

create policy festivals_select_all
    on public.festivals for select
    to anon, authenticated using (true);

create policy festivals_upsert_all
    on public.festivals for insert
    to anon, authenticated with check (true);

create policy festivals_update_all
    on public.festivals for update
    to anon, authenticated using (true) with check (true);

create policy cache_meta_select_all
    on public.cache_meta for select
    to anon, authenticated using (true);

create policy cache_meta_upsert_all
    on public.cache_meta for insert
    to anon, authenticated with check (true);

create policy cache_meta_update_all
    on public.cache_meta for update
    to anon, authenticated using (true) with check (true);

commit;