# Architecture

The .NET 10 WPF meter hosts BlazorWebView. The companion is a separate resizable always-on-top window, without Electron. Source identifiers below are portable repository-relative references, not filesystem commands.

| Source | Responsibility |
| --- | --- |
| AionDpsMeter.Companion/WorldCompanion.razor | JS lifecycle and the load/save/window bridge to host services |
| AionDpsMeter.Companion/wwwroot/companion.mjs | Schedule/settings UI, persistence queue, recovery |
| AionDpsMeter.Companion/wwwroot/schedule.mjs | Pure recurrence and validation |
| AionDpsMeter.Companion/wwwroot/presets.mjs | Independent source-based Global rule factory |
| AionDpsMeter.Companion/wwwroot/state.mjs | Shared saved/imported state schema (version 2) |
| AionDpsMeter.Companion/CompanionStore.cs | Bounded file I/O, atomic replacement and backup |
| AionDpsMeter.Companion/ICompanionWindow.cs and CompanionServiceCollectionExtensions.cs | The module's host contract and registration |
| AionDpsMeter.UI/Companion/WorldCompanionHost.cs | Meter adapter: store location, window actions, launcher (window creation, focus, bounds) |
| AionDpsMeter.UI/Companion/App.WorldCompanion.cs | Companion-only mode (--world-companion) bypasses capture |
| AionDpsMeter.UI/Services/Windowing/BlazorWindow.xaml.cs and DeferredWindowClose.cs | Close ordering: Razor components dispose before WebView2 |
| AionDpsMeter.Services/Services/Update/UpdateCheckerService.cs | Fork update feed |

## Fork boundary

The fork tracks upstream Kuroukihime/AIon2-Dps-Meter releases. Fork features are kept apart from upstream code, so upstream merges rarely conflict and a feature can move to another meter.

- **Feature module:** `AionDpsMeter.Companion` is a Razor class library (net10.0) that references no project in this repository; `WorldCompanionHostTests` fails if it does. It owns the page, its browser assets (served at `_content/AionDpsMeter.Companion/`) and its store. A host supplies `ICompanionWindow` (drag, close) and calls `AddWorldCompanion(storeDirectory)`.
- **Host adapter:** `AionDpsMeter.UI/Companion/` holds the meter-specific wiring: the per-user store directory, `ICompanionWindow` backed by the window manager, the launcher and companion-only mode. It may use any meter type.
- **Upstream seams:** the only fork edits to upstream files. Keep each to a hook and update this list when one is added or removed.

| Upstream file | Fork edit |
| --- | --- |
| AionDpsMeter.UI/App.xaml.cs | `ConfigureWorldCompanion(services)`, `TryStartCompanionOnly`, `TryExitCompanionOnlyAsync` calls |
| AionDpsMeter.UI/Services/Windowing/WindowHelper.cs | `OpenWorldCompanion` delegates to `WorldCompanionLauncher` |
| AionDpsMeter.UI/ViewModels/MainDpsViewModel.cs | `OpenWorldCompanion` command |
| AionDpsMeter.UI/Pages/MainDpsMinimal.razor, MainDpsStyle2.razor | ◈ button |
| AionDpsMeter.Core/Windowing/WindowKey.cs | `WorldCompanion` key |
| AionDpsMeter.UI/AionDpsMeter.UI.csproj, AionDpsMeter.slnx | Companion and lifecycle-check projects |
| AionDpsMeter.UI/Services/Windowing/BlazorWindow.xaml.cs | Deferred close (generic Blazor-window fix; a candidate to offer upstream) |
| AionDpsMeter.Services/AionDpsMeter.Services.csproj | SQLite bundle override (CVE-2025-6965) |
| AionDpsMeter.Services/Services/Update/UpdateCheckerService.cs | Update feed points at this fork |
| README.md, .gitignore, .github/workflows/ci.yml | Fork notice, local build outputs, CI checks |

To reuse the companion in another BlazorWebView meter: reference `AionDpsMeter.Companion`, register an `ICompanionWindow` and `AddWorldCompanion(<absolute directory>)`, and render `WorldCompanion` in a window whose close keeps the WebView alive until components have disposed (see Window lifecycle).

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

Razor loads JSON through CompanionStore; JS validates using the import schema and canonical event metadata. Saved state is version 2: server offset and nine event rules. Version 1 (cube-era) files still load; their timer rules are kept and retired map/profile fields are dropped without validation. CompanionStore writes only the current version (SchemaVersion), so state.mjs and the store must change together. Writes are queued. CompanionStore.DefaultDirectory resolves the absolute directory HarryNguon/RATmeter/WorldCompanion under platform LocalApplicationData, containing companion.json and preceding-save companion.json.bak. App registers one store for that directory through AddCompanionStore and WorldCompanion injects it; checks register a scratch directory instead. Original DPS settings/history remain separate.

Unreadable/invalid saves trigger temporary defaults with writes blocked. Recovery permits original-text export when readable, validated import or explicit Start fresh. Disk failures remain visible and subsequent saves can retry. Imports/files are bounded at 2 MB.

## Tests

- tests/companion.test.mjs: recurrence, boundaries, offsets, Global preset.
- tests/companion-state.test.mjs: schema validation and cube-era migration.
- tests/companion-browser.cjs: synthetic-bridge UI interactions/recovery.
- AionDpsMeter.Tests/CompanionStoreTests.cs: durable storage, accepted schema version and module registration.
- AionDpsMeter.Tests/WorldCompanionHostTests.cs: the module references no meter assembly, the unchanged default store location, and host registration covering everything the page injects.
- AionDpsMeter.Tests/DeferredWindowCloseTests.cs: Blazor window close ordering, run on a WPF dispatcher thread as in a window.
- AionDpsMeter.Tests/SqliteRuntimeTests.cs: loaded SQLite version.
- AionDpsMeter.LifecycleCheck/Program.cs: native companion close (✕ and WM_CLOSE), reopen and shutdown with it open, in a long-lived off-screen WPF host. An executable check run after the build (locally and in CI), not part of dotnet test.

Recurrence changes need boundary checks; state changes need compatibility and invalid-input checks. Browser checks do not prove native host or capture behavior.

## Window lifecycle

WPF disposes a window's WebView2 control when the window closes, but BlazorWebView is never disposed automatically. Any later Blazor message, such as the reply to the JS call that requested the close, then fails, and Blazor rethrows the failure on the UI dispatcher, terminating the meter. BlazorWindow therefore cancels every normal first close and, on a later dispatcher turn (never inside the Close() caller, so a JS-requested close can reply first), awaits BlazorWebView.DisposeAsync (components, then WebView2) and closes again. WorldCompanion gives all of its JS teardown round trips one two-second deadline and sends nothing further after a failed or late reply. Application shutdown cannot be cancelled; the WebView is destroyed at once and deferred disposal is skipped. WorldCompanionLauncher focuses an open companion rather than constructing a second window, and saves bounds only for a loaded window with finite coordinates.

Companion-only mode exits when its window closes, which hides dispatcher crashes; window lifecycle checks need the integrated meter or an equivalent long-lived host. AionDpsMeter.LifecycleCheck is that host (see DEVELOPMENT.md, Native window lifecycle check).

## Global preset

New installations use the source-based Global preset. Existing saves retain every custom rule. In Settings, Load Global preset previews rules; Save schedule applies them. The server offset stays under user control (Asia: +9). Daily/Wednesday reset is 07:00 UTC. Rifts start at server 02:00 every three hours with a ten-minute portal window; no unsupported sixty-minute activity window is assumed. Shugo/Invasion have three-minute entry windows and seven/thirteen-minute total activity. Entry-close countdowns switch to remaining activity after closure. Boss/siege end times are unknown and do not generate an assumed active window. Live Nezekan verification remains pending.
