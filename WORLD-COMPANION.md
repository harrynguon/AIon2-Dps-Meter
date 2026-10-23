# World Companion fork

This fork adds selected world event schedules to RATmeter.
Open **◈ World Companion** in either DPS display style. The companion is a separate,
resizable, always-on-top window. Use **Move** to drag it; close it without closing the meter.
You can also run `AionDpsMeter.UI.exe --world-companion` to use the timers
without starting packet capture.

## Included

- Nine schedule entries: Kaira, Nahma, Executors, rifts, artifact sieges,
  dimensional invasions, Shugo Festival, daily reset and Wednesday weekly reset.
- Next Up banner with scheduled activity, location, local/server time and countdown.
- Rift entry-open and entry-closed activity phases. Upcoming progress fills over the
  final hour; active progress shows elapsed window time.
- Editable schedule rules and server clock, the Global preset, durable local storage,
  backup export/import.

The hidden cube tracker (maps, cube catalog and per-character progress) was removed on
2026-10-23 at the player's request. Settings saved by earlier builds still load; their
timer rules are kept and cube progress is no longer read or written.

## Schedule accuracy

New installations use the Global preset described below; existing rules are preserved. They are **not verified
against Global Asia / Nezekan**. UTC+9 is the initial server-clock assumption.
The Global preset uses server time for Kaira/rifts and UTC for resets.
Global daily and Wednesday resets use 07:00 UTC (16:00 Asia server time). Check the in-game calendar
and edit **Settings** before relying on alerts/countdowns. There are no audio alerts.
“Scheduled active” does not confirm a boss is alive. Weekly resets track the scheduled
tally time, not your actual Abyss ranking. Shugo lists the minigames; it does not
predict a specific game's rotation.

The server offset is fixed (appropriate for an Asia profile); the computer's local
display uses its time-zone rules automatically. For other regions with daylight
saving, change the server offset when necessary.

## Persistence and updates

Settings are stored at `%LOCALAPPDATA%\HarryNguon\RATmeter\WorldCompanion\companion.json`.
The preceding save is retained as `companion.json.bak`; the first save after upgrading
therefore keeps the last cube-era file there until the next save. Use Export for long-term backups.
The original DPS settings and combat database are not used to store companion settings.
Updates now check `harrynguon/AIon2-Dps-Meter`, so accepting an upstream release
cannot silently replace the fork. No fork release has been published by this change.

## Build, test and handoff

See the [maintainer documentation](docs/README.md) for setup, build/test commands, architecture, security and the pending acceptance checklist.

## Attribution

Original meter: Kuroukihime/AIon2-Dps-Meter, GPLv3 (see LICENSE).
Schedule defaults are adapted from Byanski/aion2timeroverlay at
`2a5727ecdf5487e9becb6b3a756819f9d14ff564`, whose package.json declares MIT.
Its README describes this as a Corpus.gg companion. Earlier commits of this fork also
bundled that repository's cube coordinates and maps; they are no longer in the
working tree but remain in Git history. The new UI and schedule implementation are written for this fork.
The source repository does not include a standalone MIT licence text or a separate
map/data grant. Preserve this provenance; see [security and provenance](docs/SECURITY.md)
before distributing a public binary. Game artwork remains its respective owners'.

## Validation of this implementation

- Full .NET suite: 21 passing tests, including durable settings storage, cube-era save
  compatibility, companion window close ordering and the native SQLite version.
- Schedule/state tests: 12 passing tests, including weekly/year rollover, fractional
  server offsets, UTC invariance, simultaneous events, exact rift phase boundaries and
  cube-era migration.
- Headless Edge interaction checks: timers, preset preview/apply, save/reload, export,
  invalid import, recovery, save retry and disposal, with the native save-version rule mirrored.
- Native WebView2 window lifecycle: a temporary off-screen harness reproduced the
  reported close crash on the previous code and showed three clean open/close cycles plus
  shutdown with the companion open on the fixed code. The published executable opened,
  rendered and closed cleanly in companion-only mode.
- In-game combat and Nezekan schedule correctness have not been validated.
- The legacy SQLite bundle was replaced with `SQLitePCLRaw.bundle_e_sqlite3` 3.0.5
  to remove the dependency affected by CVE-2025-6965 / GHSA-2m69-gcr7-jv3q.
  A runtime test checks the loaded native SQLite includes the fix. NuGet's resolved
  direct/transitive audit reports no known vulnerable packages at the time of this change.
  CI treats NuGet vulnerability advisories as errors and runs the browser recovery tests.

## Recovery and security

Saved files and imported backups use one strict schema check. Unsupported versions,
invalid clock rules and oversized files are rejected. Metadata such as event names is
restored from the built-in catalog; unknown fields are discarded.
If saved data cannot be read, the app runs with temporary defaults and blocks writes
to the original file. Export the original for recovery, import a valid backup, or
explicitly choose Start fresh. No credentials or game authentication data are needed.
Storage paths are absolute and resolved from the platform's per-user application-data directory.

## Nezekan verification notes

The player reported a server clock reading consistent with UTC+9 and tentatively
reported daily reset at 18:00 Australian time. Assuming Sydney during daylight
saving, that is 16:00 UTC+9 / 07:00 UTC. This remains a provisional observation;
existing saved rules are not silently changed or marked verified; the Global preset now corroborates this observation. The next
daily reset countdown and rift opening should be checked directly in-game.

## Global preset implemented — 2026-10-23

New installations use the source-based Global preset. Existing saves retain every custom rule. In Settings, Load Global preset previews rules; Save schedule applies them. The server offset stays under user control (Asia: +9). Daily/Wednesday reset is 07:00 UTC. Rifts start at server 02:00 every three hours with a ten-minute portal window; no unsupported sixty-minute activity window is assumed. Shugo/Invasion have three-minute entry windows and seven/thirteen-minute total activity. Entry-close countdowns switch to remaining activity after closure. Boss/siege end times are unknown and do not generate an assumed active window. Live Nezekan verification remains pending.
