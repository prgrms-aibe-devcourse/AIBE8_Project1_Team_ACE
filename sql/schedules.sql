begin; -- 이 SQL은 최초 생성용이므로 이미 테이블이 생성된 DB에서 다시 실행하면 오류가 발생한다.

create table public.schedules (
    id integer generated always as identity(sequence name public.schedules_id_seq) primary key,
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    festival_id text not null,
    festival_title text not null,
    event_start_date date not null,
    event_end_date date,
    places jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),

    constraint schedules_date_range_check
    check ( event_end_date is null or event_start_date <= event_end_date ),

    constraint schedules_places_array_check
    check ( jsonb_typeof(places) = 'array' ),

    constraint schedules_festival_id_not_blank
    check ( btrim(festival_id) <> '' ),

    constraint schedules_festival_title_not_blank
    check ( btrim(festival_title) <> '' )
);

-- 사용자별 일정 조회와 RLS 소유권 검사를 빠르게 처리하기 위한 인덱스 생성
create index schedules_user_id_idx on public.schedules (user_id);


revoke all on table public.schedules
    from anon, authenticated;

grant select, insert, delete on table public.schedules
    to authenticated;

revoke all on sequence public.schedules_id_seq
    from anon, authenticated;


alter table public.schedules
    enable row level security;

create policy schedules_select_own
    on public.schedules for select
    to authenticated using ((select auth.uid()) = user_id);

create policy schedules_insert_own
    on public.schedules for insert
    to authenticated with check ((select auth.uid()) = user_id);

create policy schedules_delete_own
    on public.schedules for delete
    to authenticated using ((select auth.uid()) = user_id);

commit;
