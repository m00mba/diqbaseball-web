# Diamond IQ Baseball — Supabase Schema Reference

## Project
- **URL:** mqrqtsjzzhlarpurjmmr.supabase.co
- **App bundle:** com.diqbaseball.app
- **Admin email:** kelly@destroyersbaseball.org

---

## Enums
```sql
user_role: player | coach | scout | facility
```

---

## Tables

### users
Primary user table (mirrors auth.users)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, matches auth.users.id |
| role | user_role | player, coach, scout, facility |
| name | text | |
| email | text | |
| avatar_url | text | |
| push_token | text | For push notifications |
| verified | boolean | |
| verification_status | text | |
| verification_note | text | |
| created_at | timestamptz | |

---

### player_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| grad_year | int | |
| positions | text[] | Array of positions |
| state | text | |
| height | text | |
| weight | int | |
| bats | text | |
| throws | text | |
| gpa | numeric | |
| bio | text | |
| hittrax_visible | boolean | Default true (PLANNED - May 31 build) |

---

### coach_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| school | text | |
| division | text | |
| conference | text | |
| position_title | text | |
| verified | boolean | |

---

### scout_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| organization | text | |
| verified | boolean | |

---

### facility_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id (owner) |
| name | text | |
| city | text | |
| state | text | |
| address | text | |
| bio | text | |
| equipment | text[] | HitTrax, Rapsodo, etc. |
| created_at | timestamptz | |

**Key facility IDs:**
- Scott's Triple Crown: `e2a74ccd-5b0f-40e6-ad8d-0e353b536ba8`
- kod@42labs.org empty profile: `8145b577-fb73-490d-bca9-e3eb152acc58`

---

### facility_users
Links staff accounts to facilities (multi-staff support)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| facility_id | uuid | FK → facility_profiles.id |
| user_id | uuid | FK → users.id |
| role | text | 'staff' |
| created_at | timestamptz | |

**Staff accounts:**
- kod@42labs.org (e724b512) → e2a74ccd (Scott's Triple Crown)
- beta.facility@diqbaseball.com (abd9e88c) → e2a74ccd

---

### verified_measurables
HitTrax session data verified by facilities
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| player_id | uuid | FK → player_profiles.id |
| facility_id | uuid | FK → facility_profiles.id |
| verified_by | uuid | FK → users.id |
| equipment | text | 'HitTrax', 'Manual', etc. |
| verified_at | timestamptz | |
| notes | text | Coach session notes |
| ai_report | text | AI-generated analysis (saved per session) |
| ai_report_generated_at | timestamptz | |
| exit_velo | numeric | Max exit velocity (mph) |
| avg_exit_velo | numeric | Average exit velocity (mph) |
| launch_angle | numeric | Average launch angle (degrees) |
| hard_hit_avg | numeric | Hard hit percentage |
| distance | numeric | Average distance (ft) |
| max_distance | numeric | Max distance (ft) |
| bat_speed | numeric | Bat speed (mph) |
| hittrax_avg | numeric | Simulated batting average |
| hittrax_slg | numeric | Simulated slugging percentage |
| ld_pct | numeric | Line drive percentage |
| gb_pct | numeric | Ground ball percentage |
| fb_pct | numeric | Fly ball percentage |
| lph | numeric | Line drives per hit |
| arm_velo | numeric | Arm velocity (mph) |
| sixty_time | numeric | 60-yard dash time (seconds) |
| fb_velo | numeric | Fastball velocity (mph) |
| fb_spin_rate | numeric | Fastball spin rate (rpm) |
| logged_by | uuid | FK → users.id |

---

### facility_player_notes
Per-player notes saved by facility (one record per player per facility)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| facility_id | uuid | FK → facility_profiles.id |
| player_id | uuid | FK → player_profiles.id |
| report | text | |
| report_generated_at | timestamptz | |
| manual_notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Unique constraint:** facility_id + player_id

---

### game_stats
Player game statistics logged by coaches or players
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| player_id | uuid | FK → player_profiles.id |
| game_log_id | uuid | FK → team_game_log.id |
| ab | int | At bats |
| h | int | Hits |
| rbi | int | RBIs |
| bb | int | Walks |
| hr | int | Home runs |
| sb | int | Stolen bases |
| verified_by | uuid | FK → users.id (coach) |
| logged_by | uuid | FK → users.id |

---

### team_game_log
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| team_id | uuid | FK → teams.id |
| opponent | text | |
| game_date | date | |
| result | text | W/L |
| our_score | int | |
| their_score | int | |

---

### teams
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | |
| state | text | |
| classification | text | 8A, 7A, 5A, etc. |
| diq_score | numeric | Team DIQ score |
| maxpreps_id | text | For sync |

---

### posts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| content | text | |
| media_url | text | |
| created_at | timestamptz | |

---

### messages
Direct messages between users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| sender_id | uuid | FK → users.id |
| receiver_id | uuid | FK → users.id |
| content | text | |
| read | boolean | |
| created_at | timestamptz | |

---

### notifications
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| type | text | |
| data | jsonb | |
| read | boolean | |
| created_at | timestamptz | |

---

### verification_requests
Player requests for stat verification
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| player_id | uuid | FK → player_profiles.id |
| facility_id | uuid | FK → facility_profiles.id |
| status | text | pending, approved, rejected |
| created_at | timestamptz | |

---

### scout_pipeline
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| scout_id | uuid | FK → users.id |
| player_id | uuid | FK → player_profiles.id |
| stage | text | |
| notes | text | |

---

### recruiting_contacts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| player_id | uuid | FK → player_profiles.id |
| coach_id | uuid | FK → users.id |
| notes | text | |
| created_at | timestamptz | |

---

## Key RLS Policies

### verified_measurables
- SELECT: open to all (`true`)
- ALL: facility owner OR staff via facility_users

### facility_player_notes
- ALL: facility owner OR staff via facility_users

### facility_users
- SELECT: `user_id = auth.uid()`

### users
- SELECT: open to all (`true`)
- UPDATE own: `id = auth.uid()`
- UPDATE any: admin only (kelly@destroyersbaseball.org)

---

## Key Functions
- `recalculate_diq_score()` — games confidence multiplier (15+ games=1.0, 10+=0.9, 5+=0.75, 3+=0.55, else 0.35); verified measurables 1.20 boost
- `recalculate_team_diq()` — classification-weighted with player measurables bonus

---

## DIQ Score Weights
- 15+ games: 1.0 confidence
- 10+ games: 0.9 confidence
- 5+ games: 0.75 confidence
- 3+ games: 0.55 confidence
- <3 games: 0.35 confidence
- Verified measurables: 1.20 boost
- Classification ceiling: 8A/7A=95, 5A=90, lower classifications scaled down
