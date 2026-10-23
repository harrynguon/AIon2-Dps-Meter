# Handoff — 2026-10-23

Implementation baseline: c0c2615. Fork: https://github.com/harrynguon/AIon2-Dps-Meter
Branch: feature/world-companion. Draft PR: https://github.com/harrynguon/AIon2-Dps-Meter/pull/1

## Completed

Nine schedule entries, Next Up banner, two offline maps, 154 cube groups with 2,811 candidate spots, map/checklist sync, search, pan/zoom, profiles, import/export and durable validated storage. Both DPS layouts open the companion using the diamond button. The --world-companion argument bypasses packet capture. Updates target this fork.

At this baseline, 15 .NET tests, 12 JavaScript tests, Edge interaction/recovery checks and a published WebView2 companion smoke check passed. [PR CI passed](https://github.com/harrynguon/AIon2-Dps-Meter/actions/runs/39875400973). No public binary release has been published.

## Next: in-game acceptance

Record tested commit, observation date and relevant Windows/display configuration. These checks remain pending:

- [ ] Normal launch captures and displays combat with companion closed.
- [ ] Open/close companion from both DPS layouts without disrupting capture.
- [ ] Compare responsiveness and CPU/memory with companion open.
- [ ] Resize, move and reopen; check display scaling and multiple monitors where applicable.
- [ ] Mark a test cube, switch profiles and restart; verify independent saved progress.
- [ ] Export/import a synthetic profile; never commit personal progress.
- [ ] Verify server clock, daily reset, Wednesday tally and rift opening/closing phases.

## Schedule evidence needed

Target: Global Asia / Nezekan / Elyos. UTC+9 remains provisional. The player reported server time 23:11 and tentatively reset at 18:00 Australian time. If that means Sydney daylight saving, it corresponds to 16:00 UTC+9 / 07:00 UTC. The timezone and reset interpretation remain unconfirmed. Daily and weekly defaults remain 09:00 server time.

Record each event's date, exact server time, UTC time, local timezone, phase, and whether evidence is a calendar countdown or actual observation. Observe consecutive rift openings; verify weekly tally independently. Do not include account identifiers. Correct defaults and regression tests once verified, explicitly preserving existing user customizations. Settings permit manual corrections now.

## After acceptance

Resolve map/data redistribution provenance before public binary distribution. Review/merge the draft PR after acceptance, then prepare a versioned release containing the full published folder. Scheduled activity does not detect live bosses. Sounds, radar, extra bosses and custom boss cooldowns remain excluded.
