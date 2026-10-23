# Handoff — 2026-10-23

Implementation baseline: c0c2615. Fork: https://github.com/harrynguon/AIon2-Dps-Meter
Branch: feature/world-companion. Draft PR: https://github.com/harrynguon/AIon2-Dps-Meter/pull/1

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

Resolve redistribution provenance (schedule data; removed maps/coordinates remain in Git history) before public binary distribution. On 2026-10-23 the player approved reviewing and merging the PR into master before in-game acceptance; the acceptance checklist above still applies to the merged build. After acceptance, prepare a versioned release containing the full published folder. Scheduled activity does not detect live bosses. Sounds, radar, extra bosses and custom boss cooldowns remain excluded.

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
