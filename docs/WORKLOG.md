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

## 2026-10-23 — PR auditor, pre-merge fixes and squash merge

Added .claude/agents/pr-auditor.md (36d2e93), a read-only Claude Code reviewer for pre-merge audits. Its review of PR #1 approved with nits; fixed the findings before merging: deferred Blazor release to a later dispatcher turn and skipped it on forced closes, one deadline for all companion JS teardown, focus instead of re-creating an open companion (avoids unshown windows saving NaN bounds at exit), A2Tools provenance, purpose comments and documentation duplication. Chose a squash merge into master so removed third-party maps/coordinates stay out of master history; original commits remain on the branch and PR.

Checks: 22 .NET tests, 12 JS tests, Edge browser checks, build, Release publish, native harness (three open/close cycles and shutdown with the companion open, exit 0) and published companion-only smoke passed. Open: in-game integrated acceptance (HANDOFF checklist), A2Tools licence review. Next: player tests the merged build in-game.

## 2026-10-23 — Game terms review

The player asked whether reading more game data, such as their own Kinah, would break the game's terms. Reviewed NC's English EULA (updated 2026-10-20) and the AION 2 Global Operation Policy (effective 2026-09-17). Neither names DPS meters; the EULA forbids reverse engineering, access outside NC's published interfaces and collecting other users' personal information without consent, and the Operation Policy punishes using, creating or distributing unauthorized programs with an integrated account ban. Replaced the README line "in accordance with the game's terms of service", which implied compliance, with a risk note. Added the clauses, how they apply and enforcement reports to SECURITY.md, and the distribution risk to HANDOFF.

A pr-auditor review of PR #2 requested changes, fixed before merge. The distribution risk already applies because the fork is public, and HANDOFF now says so. The README's "no external service" claim ignored the automatic GitHub update check. The risk notes now also cover optional raw packet logging and attribute the October enforcement claim to its source.

Checks: quoted wording and section numbers re-read on the live NC pages; Markdown links and git whitespace checked; code claims (history stores names, nickname hiding is display-only, --world-companion skips capture, update check, packet logging default off) confirmed in source. Documentation only; no runtime change or tests run. Open: Reddit ban reports unverified; no legal review. Next: re-read both documents before any public release or new packet decoding.

## 2026-10-23 — Automated native window lifecycle check

Committed the native close-crash guard as AionDpsMeter.LifecycleCheck (in the solution, run after the build locally and as a CI step). Reason: the b4740c5 fix was proven only by an uncommitted harness, and its unit tests covered just the close-ordering helper. The check hosts the real BlazorWindow/WorldCompanion off-screen in a long-lived WPF application. It closes companions with ✕ twice and with WM_CLOSE, reopening after each, then shuts down with one open, failing on any unhandled exception. It drives the page with CoreWebView2 script execution rather than a remote-debugging port, and reuses the UI's static web assets manifest. Added a DI seam: CompanionStore.DefaultDirectory plus AddCompanionStore (registered in App, injected by WorldCompanion), so the check uses a scratch store. Moved DeferredWindowCloseTests onto a WPF dispatcher thread. On the thread pool the deferred turn could beat MarkClosed, so ForcedCloseBeforeReleaseSkipsReleaseAndClose failed depending on timing. Here it failed in one full-suite run and in 40/40 runs of the class on its own. The auditor saw 29/30 failures running that test on its own, but passes in 40/40 class runs and 10/10 full-suite runs; CI passed.

Checks (local, .NET SDK 10.0.402): the lifecycle check passed (4 companions, 9 events rendered each, exit 0, about 12 s, no WebView2 profile left in the build output or temp directory; no player companion settings directory exists on this machine before or after). With ShouldCancelClose forced to false, it failed at the first close (exit 1) with InvalidOperationException "CoreWebView2 members cannot be accessed after the WebView2 control is disposed" from Blazor IpcSender; the mutation was reverted. DeferredWindowCloseTests passed 40/40 runs on the dispatcher; with release started inside the Close() caller, 2 tests failed, and with the forced-close skip removed, 1 failed; both mutations were reverted. Also passed: 25 .NET tests (3 new store tests), 12 JS tests and Edge browser checks.

CI on d8a28ac (PR #3): push run 39906234615 and PR run 39906262990 passed on windows-latest, and the new step printed PASS with 4 companions and 9 events each.

A pr-auditor review of PR #3 at d8a28ac approved with nits. It re-ran every check, including the lifecycle check twice, and repeated the ShouldCancelClose and gate mutations in a scratch copy. Addressed:
- The AddCompanionStore comment no longer claims a bad location is contained: the companion fails to open and Blazor rethrows on the dispatcher, as master's static store crashed at first close.
- Race evidence now states how the test was run.
- Errors thrown by the check's own steps are reported as check failures, not as meter crashes.
- Exit codes and scratch cleanup are documented as they behave: any nonzero exit is a failure; cleanup is best effort after failures and skipped by the watchdog.
- Purpose comments for the remaining helpers, and the HANDOFF superseded marker clarified.

Open: the integrated meter with capture/combat, ◈ and real Alt+F4 input remain manual (LIVE-TESTING.md step 5); the check does not assert component disposal. Next: the player's go-ahead to squash-merge PR #3.
