# World Companion fork

This fork adds the selected world schedule and hidden cube features to RATmeter.
Open **◈ World Companion** in either DPS display style. The companion is a separate,
resizable, always-on-top window. Use **Move** to drag it; close it without closing the meter.
You can also run `AionDpsMeter.UI.exe --world-companion` to use maps/timers offline
without starting packet capture.

## Included

- Nine schedule entries: Kaira, Nahma, Executors, rifts, artifact sieges,
  dimensional invasions, Shugo Festival, daily reset and Wednesday weekly reset.
- Next Up banner with scheduled activity, location, local/server time and countdown.
- Rift entry-open and entry-closed activity phases. Upcoming progress fills over the
  final hour; active progress shows elapsed window time.
- Verteron and Altgard offline maps, all 154 groups and 2,811 candidate spots.
- Map selection, candidate spot dots, cursor-centred wheel zoom, drag, fit and zoom controls.
- Landmark/group search, hide-found filter, synchronised map/checklist completion.
- Separate character profiles, durable local storage, backup export/import.

## Schedule accuracy

The initial rules reproduce the requested Byanski data. They are **not verified
against Global Asia / Nezekan**. UTC+9 is the initial server-clock assumption.
Kaira and rifts are UTC-based; other events use the configured server offset.
Daily and Wednesday resets default to 09:00 server time. Check the in-game calendar
and edit **Settings** before relying on alerts/countdowns. There are no audio alerts.
“Scheduled active” does not confirm a boss is alive. Weekly resets track the scheduled
tally time, not your actual Abyss ranking. Shugo lists the minigames; it does not
predict a specific game's rotation.

The server offset is fixed (appropriate for an Asia profile); the computer's local
display uses its time-zone rules automatically. For other regions with daylight
saving, change the server offset when necessary.

## Persistence and updates

Progress is stored at `%LOCALAPPDATA%\HarryNguon\RATmeter\WorldCompanion\companion.json`.
The preceding save is retained as `companion.json.bak`. Use Export for long-term backups.
The original DPS settings and combat database are not used to store companion progress.
Updates now check `harrynguon/AIon2-Dps-Meter`, so accepting an upstream release
cannot silently replace the fork. No fork release has been published by this change.

## Build and test

Requires .NET 10 SDK, Node 22+ for the JavaScript tests, and the original application's
Npcap/WebView2 runtime prerequisites.

```powershell
dotnet build AionDpsMeter.slnx
dotnet test --solution AionDpsMeter.slnx
node --test tests/companion.test.mjs
npm test # Includes schedule, catalog and saved-state validation
npm install
npm run test:browser # Uses installed Microsoft Edge; screenshots in .artifacts/
```

Companion UI: `AionDpsMeter.UI/wwwroot/companion/`.
Schedule engine is a pure ES module, tested without the game or network.
Blazor lifecycle/Windows bridge: `Pages/WorldCompanion.razor`.
Persistence: `CompanionStore.cs`.

## Attribution

Original meter: Kuroukihime/AIon2-Dps-Meter, GPLv3 (see LICENSE).
Cube coordinates and maps: Byanski/aion2timeroverlay at
`2a5727ecdf5487e9becb6b3a756819f9d14ff564`, whose package.json declares MIT.
Its README describes this as a Corpus.gg companion. Schedule defaults are adapted
from the same source. The new UI and schedule implementation are written for this fork.
The source repository does not include a standalone MIT licence text or a separate
map/data grant. Preserve this provenance; confirm third-party map/data redistribution
terms before distributing a public binary. Game artwork remains its respective owners'.

## Validation of this implementation

- Full .NET suite: 15 passing tests (including durable progress storage and the native SQLite version).
- Schedule/data/state tests: 12 passing tests, including weekly/year rollover, fractional
  server offsets, UTC invariance, simultaneous events and exact rift phase boundaries.
- Headless Edge interaction checks: maps, pins, inspector/checklist synchronisation,
  search, zoom, persistence/reload, independent profiles, schedule editing, export,
  invalid import and disposal.
- Published Windows executable tested through its actual WebView2 host in
  companion-only mode: JS/.NET initialization, local maps/data, tabs, inspector,
  settings and close.
- In-game combat and Nezekan schedule correctness have not been validated.
- The legacy SQLite bundle was replaced with `SQLitePCLRaw.bundle_e_sqlite3` 3.0.5
  to remove the dependency affected by CVE-2025-6965 / GHSA-2m69-gcr7-jv3q.
  A runtime test checks the loaded native SQLite includes the fix. NuGet's resolved
  direct/transitive audit reports no known vulnerable packages at the time of this change.
  CI treats NuGet vulnerability advisories as errors and runs the browser recovery tests.

## Recovery and security

Saved files and imported backups use one strict schema check. Invalid profiles,
unknown cube IDs, non-boolean completion values, invalid clock rules and oversized
files are rejected. Metadata such as event names is restored from the built-in catalog.
If saved data cannot be read, the app runs with temporary defaults and blocks writes
to the original file. Export the original for recovery, import a valid backup, or
explicitly choose Start fresh. No credentials or game authentication data are needed.
Storage paths are absolute and resolved from the platform's per-user application-data directory.

## Nezekan verification notes

The player reported a server clock reading consistent with UTC+9 and tentatively
reported daily reset at 18:00 Australian time. Assuming Sydney during daylight
saving, that is 16:00 UTC+9 / 07:00 UTC. This remains a provisional observation;
the default schedule has not been silently changed or marked verified. The next
daily reset countdown and rift opening should be checked directly in-game.
