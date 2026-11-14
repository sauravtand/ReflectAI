begin;

create extension if not exists pgcrypto;

create type public.app_role as enum ('participant', 'admin');
create type public.study_status as enum ('invited', 'active', 'paused', 'completed', 'withdrawn');
create type public.journal_mode as enum ('traditional', 'ai_assisted');
create type public.journal_status as enum ('draft', 'completed', 'deleted');
create type public.fragment_kind as enum ('text', 'image', 'audio', 'video');
create type public.message_role as enum ('participant', 'assistant', 'system');
create type public.processing_status as enum ('pending', 'processing', 'ready', 'failed');
create type public.ai_decision as enum ('pending', 'accepted', 'edited_accepted', 'rejected');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 120),
  role public.app_role not null default 'participant',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.research_studies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  description text,
  start_date date,
  end_date date,
  traditional_days smallint not null default 5 check (traditional_days > 0),
  ai_days smallint not null default 5 check (ai_days >= 0),
  is_active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint research_studies_date_order check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.research_participants (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.research_studies(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.study_status not null default 'invited',
  enrolled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  ai_access_enabled boolean not null default false,
  ai_access_enabled_at timestamptz,
  ai_access_enabled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint research_participants_unique_user unique (study_id, user_id),
  constraint research_participants_completion_order check (completed_at is null or started_at is null or completed_at >= started_at),
  constraint research_participants_ai_activation check (not ai_access_enabled or ai_access_enabled_at is not null)
);

create table public.research_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.research_participants(id) on delete restrict,
  study_day smallint not null check (study_day between 1 and 10),
  condition public.journal_mode not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  completion_status text not null default 'in_progress' check (completion_status in ('in_progress','completed','missed')),
  created_at timestamptz not null default now(),
  constraint research_sessions_unique_day unique (participant_id, study_day),
  constraint research_sessions_time_order check (ended_at is null or ended_at >= started_at)
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.research_participants(id) on delete restrict,
  consent_version text not null check (char_length(consent_version) between 1 and 50),
  consented boolean not null,
  recorded_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  ip_hash text,
  user_agent text,
  constraint consent_records_withdrawal_order check (withdrawn_at is null or withdrawn_at >= recorded_at)
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  participant_id uuid references public.research_participants(id) on delete restrict,
  session_id uuid references public.research_sessions(id) on delete set null,
  title text check (title is null or char_length(title) between 1 and 240),
  mode public.journal_mode not null default 'traditional',
  status public.journal_status not null default 'draft',
  final_content text,
  study_day smallint check (study_day is null or study_day between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  deleted_at timestamptz,
  constraint journal_entries_completed_order check (completed_at is null or completed_at >= created_at),
  constraint journal_entries_deleted_order check (deleted_at is null or deleted_at >= created_at)
);

create table public.journal_fragments (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references public.journal_entries(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  kind public.fragment_kind not null,
  original_text text,
  sequence_no integer not null check (sequence_no > 0),
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint journal_fragments_text_required check (kind <> 'text' or nullif(trim(original_text), '') is not null),
  constraint journal_fragments_unique_sequence unique (journal_id, sequence_no)
);

create table public.fragment_conversations (
  id uuid primary key default gen_random_uuid(),
  fragment_id uuid not null references public.journal_fragments(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'open' check (status in ('open','completed','abandoned')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint fragment_conversations_completion_order check (completed_at is null or completed_at >= created_at)
);

create table public.fragment_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.fragment_conversations(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  role public.message_role not null,
  content text not null check (nullif(trim(content), '') is not null),
  sequence_no integer not null check (sequence_no > 0),
  created_at timestamptz not null default now(),
  constraint fragment_messages_unique_sequence unique (conversation_id, sequence_no)
);

create table public.media_files (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references public.journal_entries(id) on delete restrict,
  fragment_id uuid references public.journal_fragments(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  media_type public.fragment_kind not null check (media_type <> 'text'),
  storage_provider text not null check (storage_provider in ('supabase','cloudflare_r2')),
  storage_key text not null,
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type text not null check (mime_type like 'image/%' or mime_type like 'audio/%' or mime_type like 'video/%'),
  size_bytes bigint not null check (size_bytes > 0),
  sha256 text,
  processing_status public.processing_status not null default 'pending',
  processing_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint media_files_unique_storage_key unique (storage_provider, storage_key),
  constraint media_files_processed_order check (processed_at is null or processed_at >= created_at)
);

create table public.ai_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  version integer not null check (version > 0),
  template text not null check (nullif(trim(template), '') is not null),
  model_provider text not null check (char_length(model_provider) between 1 and 80),
  model_name text not null check (char_length(model_name) between 1 and 120),
  is_active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint ai_prompt_versions_unique_version unique (name, version)
);

create table public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  journal_id uuid not null references public.journal_entries(id) on delete restrict,
  fragment_id uuid references public.journal_fragments(id) on delete restrict,
  conversation_id uuid references public.fragment_conversations(id) on delete restrict,
  prompt_version_id uuid not null references public.ai_prompt_versions(id) on delete restrict,
  input_snapshot jsonb not null,
  generated_content text not null check (nullif(trim(generated_content), '') is not null),
  decision public.ai_decision not null default 'pending',
  edited_content text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  decided_at timestamptz,
  decision_time_ms integer check (decision_time_ms is null or decision_time_ms >= 0),
  token_usage jsonb,
  error_code text,
  constraint ai_interactions_response_order check (responded_at is null or responded_at >= requested_at),
  constraint ai_interactions_decision_order check (decided_at is null or responded_at is null or decided_at >= responded_at),
  constraint ai_interactions_edited_content check (decision <> 'edited_accepted' or nullif(trim(edited_content), '') is not null)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 120),
  entity_type text not null check (char_length(entity_type) between 1 and 120),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger research_studies_set_updated_at before update on public.research_studies for each row execute function public.set_updated_at();
create trigger research_participants_set_updated_at before update on public.research_participants for each row execute function public.set_updated_at();
create trigger journal_entries_set_updated_at before update on public.journal_entries for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'participant');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and is_active = true
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create index research_participants_user_id_idx on public.research_participants(user_id);
create index research_participants_study_status_idx on public.research_participants(study_id, status);
create index research_sessions_participant_day_idx on public.research_sessions(participant_id, study_day);
create index consent_records_participant_recorded_idx on public.consent_records(participant_id, recorded_at desc);
create index journal_entries_user_created_idx on public.journal_entries(user_id, created_at desc);
create index journal_entries_participant_day_idx on public.journal_entries(participant_id, study_day);
create index journal_entries_status_idx on public.journal_entries(user_id, status);
create index journal_fragments_journal_sequence_idx on public.journal_fragments(journal_id, sequence_no);
create index journal_fragments_user_created_idx on public.journal_fragments(user_id, created_at desc);
create index fragment_conversations_fragment_idx on public.fragment_conversations(fragment_id);
create index fragment_conversations_user_created_idx on public.fragment_conversations(user_id, created_at desc);
create index fragment_messages_conversation_sequence_idx on public.fragment_messages(conversation_id, sequence_no);
create index fragment_messages_user_created_idx on public.fragment_messages(user_id, created_at desc);
create index media_files_journal_created_idx on public.media_files(journal_id, created_at);
create index media_files_fragment_idx on public.media_files(fragment_id);
create index media_files_user_created_idx on public.media_files(user_id, created_at desc);
create index media_files_processing_status_idx on public.media_files(processing_status);
create index ai_prompt_versions_active_idx on public.ai_prompt_versions(name, is_active);
create index ai_interactions_user_requested_idx on public.ai_interactions(user_id, requested_at desc);
create index ai_interactions_journal_requested_idx on public.ai_interactions(journal_id, requested_at);
create index ai_interactions_fragment_idx on public.ai_interactions(fragment_id);
create index ai_interactions_decision_idx on public.ai_interactions(decision);
create index audit_events_actor_created_idx on public.audit_events(actor_user_id, created_at desc);
create index audit_events_entity_idx on public.audit_events(entity_type, entity_id);
create index audit_events_type_created_idx on public.audit_events(event_type, created_at desc);

alter table public.profiles enable row level security;
alter table public.research_studies enable row level security;
alter table public.research_participants enable row level security;
alter table public.research_sessions enable row level security;
alter table public.consent_records enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_fragments enable row level security;
alter table public.fragment_conversations enable row level security;
alter table public.fragment_messages enable row level security;
alter table public.media_files enable row level security;
alter table public.ai_prompt_versions enable row level security;
alter table public.ai_interactions enable row level security;
alter table public.audit_events enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.profiles, public.research_studies, public.research_participants, public.research_sessions, public.consent_records, public.journal_entries, public.journal_fragments, public.fragment_conversations, public.fragment_messages, public.media_files, public.ai_prompt_versions, public.ai_interactions, public.audit_events to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant insert, update on public.journal_entries to authenticated;
grant insert on public.journal_fragments, public.media_files to authenticated;
grant insert, update on public.research_studies, public.research_participants, public.research_sessions to authenticated;
grant insert on public.consent_records to authenticated;

create policy profiles_select_own_or_admin on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated using (id = (select auth.uid()) and is_active) with check (id = (select auth.uid()) and is_active);

create policy research_studies_select_enrolled_or_admin on public.research_studies for select to authenticated using (public.is_admin() or exists (select 1 from public.research_participants rp where rp.study_id = research_studies.id and rp.user_id = (select auth.uid())));
create policy research_studies_insert_admin on public.research_studies for insert to authenticated with check (public.is_admin() and created_by = (select auth.uid()));
create policy research_studies_update_admin on public.research_studies for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy research_participants_select_own_or_admin on public.research_participants for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy research_participants_insert_admin on public.research_participants for insert to authenticated with check (public.is_admin() and (not ai_access_enabled or ai_access_enabled_by = (select auth.uid())));
create policy research_participants_update_admin on public.research_participants for update to authenticated using (public.is_admin()) with check (public.is_admin() and (not ai_access_enabled or (ai_access_enabled_at is not null and ai_access_enabled_by = (select auth.uid()))));

create policy research_sessions_select_own_or_admin on public.research_sessions for select to authenticated using (public.is_admin() or exists (select 1 from public.research_participants rp where rp.id = research_sessions.participant_id and rp.user_id = (select auth.uid())));
create policy research_sessions_insert_admin on public.research_sessions for insert to authenticated with check (public.is_admin());
create policy research_sessions_update_admin on public.research_sessions for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy consent_records_select_own_or_admin on public.consent_records for select to authenticated using (public.is_admin() or exists (select 1 from public.research_participants rp where rp.id = consent_records.participant_id and rp.user_id = (select auth.uid())));
create policy consent_records_insert_admin on public.consent_records for insert to authenticated with check (public.is_admin());

create policy journal_entries_select_own_or_admin on public.journal_entries for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy journal_entries_insert_own_traditional on public.journal_entries for insert to authenticated with check (
  user_id = (select auth.uid()) and mode = 'traditional' and status in ('draft','completed') and deleted_at is null
  and (participant_id is null or exists (select 1 from public.research_participants rp where rp.id = journal_entries.participant_id and rp.user_id = (select auth.uid()) and rp.status = 'active'))
  and (session_id is null or exists (select 1 from public.research_sessions rs join public.research_participants rp on rp.id = rs.participant_id where rs.id = journal_entries.session_id and rp.user_id = (select auth.uid())))
);
create policy journal_entries_update_own_traditional on public.journal_entries for update to authenticated using (user_id = (select auth.uid()) and deleted_at is null) with check (user_id = (select auth.uid()) and mode = 'traditional' and status in ('draft','completed','deleted'));

create policy journal_fragments_select_own_or_admin on public.journal_fragments for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy journal_fragments_insert_own on public.journal_fragments for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.journal_entries j where j.id = journal_fragments.journal_id and j.user_id = (select auth.uid()) and j.deleted_at is null and j.mode = 'traditional'));

create policy fragment_conversations_select_own_or_admin on public.fragment_conversations for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy fragment_messages_select_own_or_admin on public.fragment_messages for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

create policy media_files_select_own_or_admin on public.media_files for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy media_files_insert_own on public.media_files for insert to authenticated with check (
  user_id = (select auth.uid()) and processing_status = 'pending' and processed_at is null and processing_error is null
  and exists (select 1 from public.journal_entries j where j.id = media_files.journal_id and j.user_id = (select auth.uid()) and j.mode = 'traditional' and j.deleted_at is null)
  and (fragment_id is null or exists (select 1 from public.journal_fragments f where f.id = media_files.fragment_id and f.journal_id = media_files.journal_id and f.user_id = (select auth.uid())))
);

create policy ai_prompt_versions_select_active_or_admin on public.ai_prompt_versions for select to authenticated using (is_active or public.is_admin());
create policy ai_interactions_select_own_or_admin on public.ai_interactions for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy audit_events_select_own_or_admin on public.audit_events for select to authenticated using (actor_user_id = (select auth.uid()) or public.is_admin());

commit;
