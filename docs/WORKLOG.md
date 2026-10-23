# Work log

Append dated entries with change/reason, actual verification, open issues and next action. Git preserves detailed diffs. Never copy sensitive logs or user data here.

## 2026-10-23 — Initial integration (5432b80)

Forked the meter; integrated selected schedules and offline cubes, standalone mode and fork update routing. Validated schedule/catalog, browser interactions, Windows build/publish and native companion smoke check. In-game combat and Nezekan schedule validation remained pending.

## 2026-10-23 — Hardening (c0c2615)

Added shared strict state validation, failed-load recovery/write protection, bounded storage, retry checks, SQLite dependency update and native version test. Passed 15 .NET tests, 12 JavaScript tests, Edge recovery checks and published native smoke check. NuGet audit reported no known resolved vulnerabilities. Push CI 39875393902 and PR CI 39875400973 passed. These checks do not validate game schedules or combat.

## 2026-10-23 — Documentation handoff

Added documentation index, architecture, build/test instructions, security/provenance, acceptance checklist and repository agent instructions. Replaced CWD-dependent overview commands with the development guide. Checked Markdown links and Git whitespace; runtime unchanged. Next: in-game acceptance and exact Nezekan reset/rift evidence. Redistribution provenance remains unresolved.

## 2026-10-23 — A2Tools timer review

Compared pinned A2Tools data, recurrence functions and generator against our timers. Thirteen isolated reference/comparison assertions and all twelve existing JS tests passed. Documented reset/rift discrepancies, entry windows, timezone design and evidence limits in TIMER-COMPARISON.md. No runtime defaults or user settings changed. Next: explicit Global preset and Nezekan verification.

## 2026-10-23 — Global preset and coding guidance

Added reusable presets.mjs, explicit preview/apply UI, new-install Global defaults, three-minute entry phases, and unknown boss/siege durations. Preserved legacy saves and character progress. Updated AGENTS.md for modular code and concise purpose comments; added LIVE-TESTING.md. Fourteen JS tests and Edge interaction/recovery/preset tests passed. Windows publish completed with existing upstream compiler warnings. Next: user validation of Nezekan clocks, cube persistence and integrated combat.

## 2026-10-23 — First in-game schedule evidence

Recorded screenshot readings ST 09:22 / LT 11:22 and daily-completion reset in 6h 37m. These support the Global preset's 16:00 Asia server / 18:00 Sydney AEDT reset within minute precision. Kept tentative recollection of an 08:00 rift distinct from screenshot evidence. Weekly tally, exact rift opening/closure and combat acceptance remain pending. Documentation only; no runtime changes or test rerun required. Next: observe the predicted 11:00 server rift and check cube persistence.

## 2026-10-23 — Weekly reset confirmation

Recorded the player's explicit confirmation of Wednesday 18:00 Melbourne weekly reset. This matches Wednesday 07:00 UTC during AEDT. Marked the evidence as user-reported and retained the unresolved AEST distinction. Documentation only; no runtime change or test rerun needed. Next: rift opening/closure observation and cube/combat acceptance.
