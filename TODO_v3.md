# Diamond IQ Baseball — Roadmap & TODO
> **Version 3** — Last updated May 25, 2026 | Previous versions: TODO.md, TODO__1_.md


## June 1 Production Build (Mobile App)
Build 8 resets June 1. OTA update pushed May 23 but blocked by TestFlight version conflict.
All mobile changes below are code-complete and waiting on the June 1 build.

### Waiting on June 1 Build (code complete, OTA blocked)
- [x] `alter table player_profiles add column hittrax_visible boolean default true` ✅ SQL done
- [x] `verified_measurables` open SELECT policy dropped — `hittrax_visible` enforced at DB level ✅
- [x] `game_stats` DELETE policy added ✅ SQL done
- [ ] Add toggle in player profile settings screen (mobile — code done, needs build)
- [ ] Facility Analysis (`ai_report`) displayed on player Verified tab (mobile — code done, needs build)
- [ ] Staff management UI in facility Settings tab (mobile — code done, needs build)
- [ ] Fix game delete button (mobile — code done, needs build)
- [ ] Fix pitcher stats not clearing on new game log (mobile — code done, needs build)

### Pending App Features
- [ ] ViewShot image share in `discover.tsx` (currently text-only, TODO in code)
- [ ] GameChanger CSV import on player side
- [ ] Coach consistency view — detect when teammates log games but a player doesn't

---

## Web Portal (facility.diqbaseball.com)
- [ ] AI analysis sessions page — deploy new sessions_page.tsx (Haiku model, strengths/opportunities/drills, 1 per session lock, regenerate for kod@42labs.org)
- [ ] Custom SMTP for Supabase auth emails — set up Resend, verify domain, configure in Supabase Auth settings so password reset emails come from noreply@diqbaseball.com (or noreply@iqbio.io when ready)
- [ ] Weekly cron for MaxPreps sync

## Domain & Infrastructure (when revenue starts)
- [ ] Buy `iqbio.io` ✅ done (or pending)
- [ ] Migrate `facility.diqbaseball.com` → `facility.iqbio.io`
- [ ] Migrate `facility.diqbaseball.com/admin` → `admin.iqbio.io`
- [ ] Add `iqbio.io` as secondary domain on Google Workspace (same as destroyers.pro)
- [ ] Set up Resend with `iqbio.io` domain for transactional emails
- [ ] Update Vercel deployments to point to new domains
- [ ] Update any hardcoded URLs in codebase

---

## Future / Backlog
- [ ] Player public profile at `diqbaseball.com/player/[name]`
- [ ] Softball expansion — add sport column to relevant tables
- [ ] Coach-facing web page inside facility portal
- [ ] GameChanger integration
- [ ] Coach/scout discover and profile views respect `hittrax_visible` flag (DB enforces it, but UI could hide the Verified tab entirely when flag is false)

---

## Completed This Session (May 25, 2026)
- [x] Admin portal built at `/admin` — user management, facility management, account creation
- [x] Admin login page at `/admin/login` (separate from facility login)
- [x] Edit user modal — change name, email, password, role directly via service role key
- [x] `SUPABASE_SERVICE_ROLE_KEY` added to Vercel environment variables
- [x] AI analysis prompt updated — Strengths / Opportunities / Recommended Drills sections
- [x] Switched AI model to Haiku (cost ~$0.005/generation vs $0.014 for Sonnet)
- [x] 1 analysis per session lock — button disappears after first generation
- [x] Regenerate button available for kod@42labs.org for testing
- [x] `game_stats` DELETE RLS policy added — players can now delete own game logs
- [x] `clearForm` fixed — pitcher stats (hAllowed, rAllowed, hbpP, sbAllowed) now reset between games
- [x] `handleDeleteStat` now shows error message if delete fails

## Completed This Session (May 23, 2026)
- [x] Fixed 406 on facility login — `facilityAuth.ts` `.single()` → `.maybeSingle()` (web repo deployed)
- [x] `facility_users` RLS expanded — owners can now see and manage all staff rows for their facility
- [x] Staff management UI built in facility Settings tab — add/remove staff by email (mobile, pending build)
- [x] `verified_measurables` open SELECT policy dropped — `hittrax_visible` now enforced at DB level
- [x] `hittrax_visible` toggle added to player Settings tab (mobile, pending build)
- [x] Facility Analysis (`ai_report`) display added to player Verified tab (mobile, pending build)
- [x] `expo-document-picker` added to `package.json` (was missing from dependencies)

## Completed This Session (May 20, 2026)
- [x] Fixed multi-staff facility accounts — staff-first lookup in sessions, dashboard, settings, facilityAuth.ts
- [x] Fixed empty proxy.ts build error
- [x] AI report saves per session to `verified_measurables.ai_report`
- [x] AI report persists across logins and is visible to all facility staff
- [x] Fixed RLS policies on `verified_measurables` and `facility_player_notes` for staff access
- [x] Fixed redirect loop for staff users (kod@42labs.org)
- [x] Restored deleted facility profile that caused login failure

---

## Key IDs & Config
- Supabase: `mqrqtsjzzhlarpurjmmr.supabase.co`
- EAS project: `5618950f-8754-43b8-868e-546b588885ce`
- App bundle: `com.diqbaseball.app`
- Admin email: `kelly@destroyersbaseball.org`
- Vercel: `diqbaseball-web-sigma.vercel.app`
- GitHub app: `github.com/m00mba/diqbaseball2`
- GitHub web: `github.com/m00mba/diqbaseball-web`
- Scott's Triple Crown facility ID: `e2a74ccd-5b0f-40e6-ad8d-0e353b536ba8`
- kod@42labs.org facility profile ID: `8145b577-fb73-490d-bca9-e3eb152acc58`
- Local mobile repo: `/Users/k0d/Downloads/diqbaseball2`
- Local web repo: `/Users/k0d/Downloads/diqbaseball-web`
