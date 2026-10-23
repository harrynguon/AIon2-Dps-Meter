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

## 2026-10-23 — Cube tracker removal and companion close crash

Removed the cube tracker at the player's request (catalog, maps, tab, profiles, CSS). State schema is now version 2; version 1 saves load with timer rules intact. Fixed two regressions in the in-progress removal: the Next Up progress bar element had been renamed, and CompanionStore still accepted only version 1, so every native save would have failed (browser checks missed it because their bridge did not apply the store's version rule; it now does).

Diagnosed the reported crash (opening/closing the companion while the meter runs) from the Windows Event Log: Blazor sent a JS interop reply after WPF had disposed the companion's WebView2, and Blazor rethrows failed sends on the UI dispatcher. Added DeferredWindowClose so BlazorWindow disposes Razor components before WebView2, and bounded WorldCompanion's JS teardown.

Checks on the uncommitted tree after 5c5c98a: 21 .NET tests (5 new close-ordering, 1 cube-era store compatibility), 12 JS tests, Edge browser checks, solution build and Release publish passed. A temporary off-screen native harness (scratch, not committed) reproduced the reported stack on 5c5c98a at the first close and passed three open/close cycles plus shutdown with the companion open on the fix. The published exe passed a companion-only open/render/close check without crash events. Integrated meter with capture was not run because the game was in use. Next: player verifies LIVE-TESTING.md step 5 in the integrated meter.

## 2026-10-23 — Second rift report

Player reported a rift about 57 minutes before 02:58 UTC, i.e. near 11:00 server (02:00 UTC), matching the Global preset. With the earlier tentative 08:00 server recollection this supports, but does not prove, the three-hour cycle. Recorded as a rounded user report; entry closure unobserved. Documentation only; no runtime change. Next: note an exact opening time and the 10-minute entry closure.
