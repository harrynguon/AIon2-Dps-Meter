# Handoff — 2026-10-23

Fork: https://github.com/harrynguon/AIon2-Dps-Meter (default branch master).
PR https://github.com/harrynguon/AIon2-Dps-Meter/pull/1 (feature/world-companion) was squash-merged into master as b4740c5; the original commits stay on that branch and the PR. Game-terms documentation: branch docs/game-terms-risk, PR https://github.com/harrynguon/AIon2-Dps-Meter/pull/2. Native window lifecycle check: PR https://github.com/harrynguon/AIon2-Dps-Meter/pull/3 (test/window-lifecycle-harness) was squash-merged into master as d8f16be; the original commits stay on that branch and the PR. Companion module and fork boundary: branch refactor/companion-module, PR https://github.com/harrynguon/AIon2-Dps-Meter/pull/5 (open, awaiting the player's go-ahead). The newest dated section below has the latest checks.

## Completed

Nine schedule entries, Next Up banner, editable rules with the Global preset, import/export and durable validated storage. The hidden cube tracker was removed on 2026-10-23 (see below). Both DPS layouts open the companion using the diamond button. The --world-companion argument bypasses packet capture. Updates target this fork.

At baseline c0c2615, 15 .NET tests, 12 JavaScript tests, Edge interaction/recovery checks and a published WebView2 companion smoke check passed. Current results are in the latest section below. [PR CI passed](https://github.com/harrynguon/AIon2-Dps-Meter/actions/runs/39875400973). No public binary release has been published.

## Next: in-game acceptance

Record tested commit, observation date and relevant Windows/display configuration. These checks remain pending:

- [ ] Normal launch captures and displays combat with companion closed.
- [ ] Open/close companion from both DPS layouts without disrupting capture (✕, Alt+F4 and ◈; the meter must not crash).
- [ ] Compare responsiveness and CPU/memory with companion open.
- [ ] Resize, move and reopen; check display scaling and multiple monitors where applicable.
- [ ] Save a schedule edit, restart and confirm it persists (footer: "Saved on this PC").
- [ ] Export/import a synthetic backup; never commit personal settings.
- [ ] Verify server clock, daily reset, Wednesday tally and rift opening/closing phases.

## Schedule evidence needed

Target: Global Asia / Nezekan / Elyos. Screenshot evidence received 2026-10-23 shows ST 09:22, LT 11:22, and a per-server daily completion reset countdown of 6h 37m. This supports approximately 16:00 server / 18:00 Sydney AEDT, consistent with the Global preset (07:00 UTC). Minute precision and screenshot timing explain the approximately one-minute difference. This verifies the displayed daily-completion countdown, not every daily system or an observed reset transition. The two-hour clock difference is consistent with UTC+9 given Sydney AEDT; screenshots alone do not identify an absolute timezone. The player subsequently confirmed weekly reset at Wednesday 18:00 Melbourne time; see the confirmation below. Legacy saved rules may still use 09:00 server until the preset is explicitly applied.

Record each event's date, exact server time, UTC time, local timezone, phase, and whether evidence is a calendar countdown or actual observation. Observe consecutive rift openings; verify weekly tally independently. Do not include account identifiers. Correct defaults and regression tests once verified, explicitly preserving existing user customizations. Settings permit manual corrections now.

## After acceptance

Resolve redistribution provenance (schedule data; removed maps/coordinates remain in feature-branch and PR history) before public binary distribution. See also Game terms below. On 2026-10-23 the player approved reviewing and merging the PR into master before in-game acceptance; the acceptance checklist above still applies to the merged build. After acceptance, prepare a versioned release containing the full published folder. Scheduled activity does not detect live bosses. Sounds, radar, extra bosses and custom boss cooldowns remain excluded.

## Additional schedule evidence

The [A2Tools comparison](TIMER-COMPARISON.md) supports 07:00 UTC resets and a server-based 02:00 rift cycle, differing from our defaults. It also identifies three-minute Shugo/Invasion entry windows. The explicit Global preset is implemented and preserves saved customizations. See the screenshot evidence above and the tentative rift observation below for current verification status.

## Global preset implemented — 2026-10-23

New installations use the source-based Global preset. Existing saves retain every custom rule. In Settings, Load Global preset previews rules; Save schedule applies them. The server offset stays under user control (Asia: +9). Daily/Wednesday reset is 07:00 UTC. Rifts start at server 02:00 every three hours with a ten-minute portal window; no unsupported sixty-minute activity window is assumed. Shugo/Invasion have three-minute entry windows and seven/thirteen-minute total activity. Entry-close countdowns switch to remaining activity after closure. Boss/siege end times are unknown and do not generate an assumed active window. Live Nezekan verification remains pending.

## Rift observation — 2026-10-23

At the displayed 09:22 server time, the player tentatively recalled a rift about 1h 22m earlier. That implies 08:00 server and agrees with the Global preset. It is not an exact observed opening or proof of the three-hour recurrence. The next predicted opening after this screenshot is 11:00 server / 13:00 Sydney AEDT, about 1h 38m later. Verify entry closure separately (preset: 11:10 server). No schedule code or saved settings were changed from this observation. Screenshots are not committed; only non-identifying clock/countdown readings are recorded.

## Weekly reset confirmation — 2026-10-23

The player explicitly confirmed weekly reset at Wednesday 18:00 Melbourne time. During AEDT (UTC+11), this is Wednesday 07:00 UTC / 16:00 Asia server time, matching the implemented Global preset. Evidence type: confident user report, not an observed transition or screenshot. Behaviour outside daylight saving remains unverified: a fixed 07:00 UTC reset displays as 17:00 Melbourne AEST. Do not change the preset to a Melbourne-local recurrence without evidence that the game reset follows Australian daylight saving. No code or saved settings changed.

## Cube tracker removed and close crash fixed — 2026-10-23

At the player's request the hidden cube tracker was removed: cubes.json, both maps, the Hidden cubes tab, profiles and cube CSS. Saved state is now version 2 (offset and event rules). Version 1 files still load with their timer rules; cube fields are dropped and the first save keeps the cube-era file as companion.json.bak until the next save. The removal had also renamed the Next Up progress bar element and left CompanionStore accepting only version 1, so every native save would have failed; both are fixed and covered by tests.

The player reported crashes while opening/closing the companion from the running meter. Windows Event Log showed an unhandled InvalidOperationException ("CoreWebView2 members cannot be accessed after the WebView2 control is disposed") from Blazor IpcSender on the UI dispatcher. Cause: the ✕ button closed the window inside a JS-to-.NET call; WPF disposed WebView2 while Blazor still had to send the reply, and Blazor treats a failed send as fatal. BlazorWindow now disposes Razor components before WebView2 (see ARCHITECTURE.md, Window lifecycle). This also releases companion components that previously leaked on every close.

Checks: 21 .NET tests, 12 JS tests, Edge browser checks, build and Release publish passed. An off-screen native harness reproduced the exact reported stack on the previous code at the first close; the fixed code completed three open/close cycles and shutdown with the companion open (exit 0). The published executable opened, rendered nine events and closed cleanly in companion-only mode with no crash events. Not yet checked: integrated meter with capture and combat, Alt+F4 and ◈ paths, both DPS layouts. Next: player runs LIVE-TESTING.md step 5 on this build.

## Second rift report — 2026-10-23

At 02:58 UTC (13:58 Sydney AEDT) the player reported a rift that opened about 57 minutes earlier: approximately 02:01 UTC / 11:01 server (UTC+9) / 13:01 AEDT. This matches the Global preset's predicted 11:00 server opening (02:00 UTC) within report precision, and the earlier tentative 08:00 server recollection is consistent with a three-hour cycle. Evidence type: user report rounded to the minute, not an exact observed opening; entry closure (preset 11:10 server) was not observed. No code or saved settings changed. Next predicted openings: 14:00 server (05:00 UTC, 16:00 AEDT) and 17:00 server.

## Pre-merge audit — 2026-10-23

A read-only auditor (.claude/agents/pr-auditor.md) reviewed PR #1 at 36d2e93: approve with nits, CI green, 21 .NET / 12 JS / browser checks passing. Addressed before merge:
- Close ordering: Blazor content release no longer starts inside the Close() caller, so even a fully synchronous disposal cannot destroy the WebView before a JS-requested close replies. A close forced by shutdown now skips disposal instead of messaging a destroyed WebView.
- WorldCompanion teardown: one two-second deadline covers every JS round trip, including JS object-reference disposal.
- ◈ while the companion is open focuses it instead of constructing an unshown window that would save NaN bounds at exit; bounds are saved only for a loaded window with finite coordinates.
- A2Tools (Global preset source) added to provenance and attribution; purpose comments added; duplicated preset sections and stale Nezekan notes consolidated.
- Merge strategy: squash, so the removed maps/coordinates stay out of master history.

Checks after these fixes: 22 .NET tests, 12 JS tests, Edge browser checks, build and Release publish passed; the native harness passed three open/close cycles and shutdown with the companion open (exit 0); the published exe passed companion-only open/render/close with no crash events. Still not covered: integrated meter with capture and combat, Alt+F4 and ◈ from both layouts, and a ◈ click during the brief close teardown (it focuses the closing window, so the click is lost). No automated test drives BlazorWindow itself; the native harness is not committed. (This last sentence is superseded by "Native lifecycle check automated" below; the gaps listed before it remain.)

## Game terms — 2026-10-23

SECURITY.md records NC's EULA and AION 2 Operation Policy clauses and how they apply. The risk applies now, not only at a binary release: the Operation Policy bans creating or distributing unauthorized programs at integrated-account level, this fork's source (including packet decoding) is already public on GitHub, and new decoding such as Kinah counts as creating. Re-read both documents before a release or new packet decoding.

## Native lifecycle check automated — 2026-10-23

The off-screen native harness is now committed as AionDpsMeter.LifecycleCheck and runs in CI after the build (see DEVELOPMENT.md, Native window lifecycle check). It hosts the real BlazorWindow and WorldCompanion in a long-lived WPF application. It closes companions with ✕ (twice) and with WM_CLOSE, reopening after each, and then shuts down with one open. Any unhandled exception fails it. With DeferredWindowClose.ShouldCancelClose forced to return false, it fails at the first close with the reported Blazor IpcSender stack; on the fix it passes (exit 0).

Unlike the earlier harness, it drives the page through CoreWebView2 script execution (no remote-debugging port), and reuses the UI's static web assets manifest instead of copying a publish. CompanionStore now comes from DI (AddCompanionStore at the time, now AddWorldCompanionHost; same per-user default), so the check uses a scratch directory and never touches player settings.

The existing DeferredWindowCloseTests ran the gate on the thread pool. There, the deferred turn could run before MarkClosed, so ForcedCloseBeforeReleaseSkipsReleaseAndClose failed depending on timing. Here it failed in one full `dotnet test` run and in 40/40 runs of the class on its own. The auditor saw it fail in 29/30 runs of that test on its own, but pass in 40/40 class runs and 10/10 full-suite runs; CI passed. The tests now run on a WPF dispatcher thread, as in a window. Production close code is unchanged.

CI passed on windows-latest with the new step (PR run 39906262990), and a pr-auditor review approved with nits, which are addressed (see WORKLOG.md). With the player's go-ahead it was squash-merged as d8f16be after PR CI passed on the final head 3a1110d (run 39907889988); master's push CI for d8f16be (run 39908137289) also passed. Still not covered: the integrated meter with capture and combat, ◈ from both layouts, real Alt+F4 keyboard input, a ◈ click during close teardown, the published single-file layout, and whether components are actually disposed (the check does not assert it). The in-game acceptance checklist above is unchanged.

## Companion module and fork boundary — 2026-10-23

The player chose to keep extending this fork (merging upstream releases) while keeping fork code easy to merge around and to move into a future meter of their own. The companion is now the AionDpsMeter.Companion Razor class library, which references no project in this repository (enforced by WorldCompanionHostTests). Meter wiring lives in AionDpsMeter.UI/Companion, and upstream files keep one-line hooks listed in ARCHITECTURE.md ("Fork boundary"). AGENTS.md and the pr-auditor now require this for future work. Edits to upstream files fell from 126 to 73 added lines (App.xaml.cs: one registration and two one-line hooks), and the upstream ServiceCollectionExtensions edit was removed. The settings location, saved-data format and behaviour are unchanged; browser assets moved to _content/AionDpsMeter.Companion/.

Checks: 28 .NET tests, 12 JS tests, Edge browser checks, build, the native lifecycle check (✕, WM_CLOSE, reopen, shutdown) and a Release publish passed; the published exe opened, rendered from the new asset path and closed in companion-only mode without crash events. Not covered: the integrated meter in-game (LIVE-TESTING.md step 5). Candidate to offer upstream: the BlazorWindow deferred-close fix.

The pr-auditor approved PR #5 at bea03be with nits, all addressed: the boundary test now also reads the build's dependency graph (an unused meter ProjectReference fails it, verified by mutation), App.xaml.cs hooks are single lines, the module pins its static-asset base path, and stale API names, test counts and fork-owned files were corrected in the docs. PR #4's HANDOFF/WORKLOG update for PR #3's merge is folded into this branch, so PR #4 is redundant. At the player's request the auditor is faster: a standard pass trusts green CI and reviews the diff; a deep pass (high effort, local checks) is reserved for risky areas listed in AGENTS.md; docs-only PRs skip the audit. Not covered: WorldCompanionLauncher and the App hooks run natively only in the published companion-only smoke check, and ◈ from both layouts is verified by reading code.
