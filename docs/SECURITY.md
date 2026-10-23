# Security and provenance

Never embed, print, log or commit credentials, tokens, private keys, game authentication data, personal progress or private combat logs. Use synthetic fixtures and secret stores where needed. Companion functionality needs no credentials. Treat saved/imported files as untrusted; preserve strict validation, bounded I/O, canonical metadata, backups and failed-load write protection.

Filesystem operations must use absolute paths derived from trusted application/repository/platform directories. Do not hard-code developer homes or rely on the starting directory. Standard module references and web assets remain portable.

SQLitePCLRaw.bundle_e_sqlite3 3.0.5 replaces the dependency affected by CVE-2025-6965 / GHSA-2m69-gcr7-jv3q. The native-runtime test requires SQLite >= 3.50.2. The resolved NuGet audit reported no known vulnerabilities at baseline c0c2615; this is time-dependent, not a complete security audit. CI treats NuGet vulnerability advisories as errors.

## Provenance

Original meter: https://github.com/Kuroukihime/AIon2-Dps-Meter at 57974f81fd64dfca7e0f9d664765607ca20749c9. Preserve GPLv3 LICENSE.

Global preset parameters (reset and rift times, entry-window lengths): https://github.com/taengu/A2Tools-Plugins at b11f345c93494a2b6a77142002dc26a656b610d2, event-timers data. Only schedule parameters were adopted, not code; the repository's licence terms have not been reviewed. See TIMER-COMPARISON.md.

Legacy schedule references, coordinates and maps: https://github.com/Byanski/aion2timeroverlay at 2a5727ecdf5487e9becb6b3a756819f9d14ff564. Its package.json declares MIT, but the snapshot contains no standalone MIT text or separate map/data grant. Its README describes a Corpus.gg companion. Third-party artwork provenance is not established by that package declaration alone. The integrated UI/recurrence implementation was written for this fork.

The cube coordinates (cubes.json) and both maps were removed from the working tree on 2026-10-23 when the cube tracker was retired. They remain in the fork's feature/world-companion history and pull request #1 (5432b80 through 5c5c98a); master receives the work as a squash merge, so its history does not contain them. Removal does not resolve their provenance. A binary built from the current tree no longer contains them, but schedule defaults are still adapted from the same source.

Confirm third-party redistribution terms (schedule data; maps/coordinates if history is redistributed) before a public binary release. Record supporting evidence here when resolved. No public binary release has been published at this baseline.
