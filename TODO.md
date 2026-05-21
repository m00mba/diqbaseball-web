# Diamond IQ Baseball — Roadmap & TODO

## May 31 Production Build (Mobile App)
These items are batched for the next EAS build (build 8, resets May 31).
OTA updates will work after this build.

### HitTrax Visibility Toggle
- [ ] `alter table player_profiles add column hittrax_visible boolean default true`
- [ ] Add toggle in player profile settings screen (mobile app)
- [ ] Coach/scout discover and profile views respect `hittrax_visible` flag
- [ ] Facility portal always sees HitTrax data regardless of player flag

### AI Analysis — Mobile Display
- [ ] Player profile shows saved AI report from `verified_measurables.ai_report`
- [ ] Coach/scout can see AI report if `hittrax_visible = true`
- [ ] Label as "Facility Analysis" with generated date

### Pending App Features
- [ ] ViewShot image share in `discover.tsx` (currently text-only, TODO in code)
- [ ] GameChanger CSV import on player side
- [ ] Coach consistency view — detect when teammates log games but a player doesn't

---

## Web Portal (facility.diqbaseball.com)
- [ ] Clean up 406 error on `facility_player_notes` select in sessions page
- [ ] Weekly cron for MaxPreps sync

---

## Future / Backlog
- [ ] Player public profile at `diqbaseball.com/player/[name]`
- [ ] Softball expansion — add sport column to relevant tables
- [ ] Coach-facing web page inside facility portal
- [ ] GameChanger integration

---

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
