# Architecture

The .NET 10 WPF meter hosts BlazorWebView. The companion is a separate resizable always-on-top window, without Electron. Source identifiers below are portable repository-relative references, not filesystem commands.

| Source | Responsibility |
| --- | --- |
| AionDpsMeter.UI/Pages/WorldCompanion.razor | JS lifecycle and native load/save/window bridge |
| AionDpsMeter.UI/wwwroot/companion/companion.mjs | UI, gestures, profiles, persistence queue, recovery |
| AionDpsMeter.UI/wwwroot/companion/schedule.mjs | Pure recurrence and validation |
| AionDpsMeter.UI/wwwroot/companion/presets.mjs | Independent source-based Global rule factory |
| AionDpsMeter.UI/wwwroot/companion/state.mjs | Shared saved/imported state schema |
| AionDpsMeter.UI/wwwroot/companion/cubes.json and maps/ | Offline catalog and two 2048px maps |
| AionDpsMeter.Services/Services/Settings/CompanionStore.cs | Bounded file I/O, atomic replacement and backup |
| AionDpsMeter.UI/Services/Windowing/WindowHelper.cs | Window creation and bounds |
| AionDpsMeter.UI/App.xaml.cs | Standalone mode bypasses capture |
| AionDpsMeter.Services/Services/Update/UpdateCheckerService.cs | Fork update feed |

## Legacy schedule (retained for saved custom rules)

| Event | Recurrence | Window |
| --- | --- | --- |
| Kaira | UTC 01:00, every 3 hours | 30 minutes |
| Nahma | Server Friday/Sunday 21:00 | 45 minutes |
| Executors | Server Monday/Thursday/Saturday 21:30 | 30 minutes |
| Rifts | UTC 00:00, every 3 hours | Entry 10 minutes; activity 60 minutes total |
| Artifact siege | Server Monday/Thursday/Saturday 21:00 | 45 minutes |
| Invasion | Hourly :30 | 15 minutes |
| Shugo | Hourly :00 | 15 minutes |
| Daily reset | Server 09:00 | Instant |
| Weekly tally | Server Wednesday 09:00 | Instant |

Server offset is fixed; local display follows computer timezone rules. Kaira/rifts retain UTC recurrence when offset changes. Upcoming progress covers the final hour; active progress tracks elapsed scheduled time. Shugo game rotation and actual boss availability are not detected.

## Persistence

Razor loads JSON through CompanionStore; JS validates using the import schema and canonical event metadata. Profiles independently track completion by group, not individual candidate spot. Writes are queued. Platform LocalApplicationData resolves the absolute directory HarryNguon/RATmeter/WorldCompanion, containing companion.json and preceding-save companion.json.bak. Original DPS settings/history remain separate.

Unreadable/invalid saves trigger temporary defaults with writes blocked. Recovery permits original-text export when readable, validated import or explicit Start fresh. Disk failures remain visible and subsequent saves can retry. Imports/files are bounded at 2 MB.

## Tests

- tests/companion.test.mjs: recurrence, boundaries, offsets, catalog.
- tests/companion-state.test.mjs: schema validation.
- tests/companion-browser.cjs: synthetic-bridge UI interactions/recovery.
- AionDpsMeter.Tests/CompanionStoreTests.cs: durable storage.
- AionDpsMeter.Tests/SqliteRuntimeTests.cs: loaded SQLite version.

Recurrence changes need boundary checks; state changes need compatibility and invalid-input checks. Browser checks do not prove native host or capture behavior.

## Global preset implemented — 2026-10-23

New installations use the source-based Global preset. Existing saves retain every custom rule and cube profile. In Settings, Load Global preset previews rules; Save schedule applies them. The server offset stays under user control (Asia: +9). Daily/Wednesday reset is 07:00 UTC. Rifts start at server 02:00 every three hours with a ten-minute portal window; no unsupported sixty-minute activity window is assumed. Shugo/Invasion have three-minute entry windows and seven/thirteen-minute total activity. Entry-close countdowns switch to remaining activity after closure. Boss/siege end times are unknown and do not generate an assumed active window. Live Nezekan verification remains pending.
