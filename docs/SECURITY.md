# Security, provenance and game terms

Never embed, print, log or commit credentials, tokens, private keys, game authentication data, personal progress or private combat logs. Use synthetic fixtures and secret stores where needed. Companion functionality needs no credentials. Treat saved/imported files as untrusted; preserve strict validation, bounded I/O, canonical metadata, backups and failed-load write protection.

Filesystem operations must use absolute paths derived from trusted application/repository/platform directories. Do not hard-code developer homes or rely on the starting directory. Standard module references and web assets remain portable.

SQLitePCLRaw.bundle_e_sqlite3 3.0.5 replaces the dependency affected by CVE-2025-6965 / GHSA-2m69-gcr7-jv3q. The native-runtime test requires SQLite >= 3.50.2. The resolved NuGet audit reported no known vulnerabilities at baseline c0c2615; this is time-dependent, not a complete security audit. CI treats NuGet vulnerability advisories as errors.

## Provenance

Original meter: https://github.com/Kuroukihime/AIon2-Dps-Meter at 57974f81fd64dfca7e0f9d664765607ca20749c9. Preserve GPLv3 LICENSE.

Global preset parameters (reset and rift times, entry-window lengths): https://github.com/taengu/A2Tools-Plugins at b11f345c93494a2b6a77142002dc26a656b610d2, event-timers data. Only schedule parameters were adopted, not code; the repository's licence terms have not been reviewed. See TIMER-COMPARISON.md.

Legacy schedule references, coordinates and maps: https://github.com/Byanski/aion2timeroverlay at 2a5727ecdf5487e9becb6b3a756819f9d14ff564. Its package.json declares MIT, but the snapshot contains no standalone MIT text or separate map/data grant. Its README describes a Corpus.gg companion. Third-party artwork provenance is not established by that package declaration alone. The integrated UI/recurrence implementation was written for this fork.

The cube coordinates (cubes.json) and both maps were removed from the working tree on 2026-10-23 when the cube tracker was retired. They remain in the fork's feature/world-companion history and pull request #1 (5432b80 through 5c5c98a); master receives the work as a squash merge, so its history does not contain them. Removal does not resolve their provenance. A binary built from the current tree no longer contains them, but schedule defaults are still adapted from the same source.

Confirm third-party redistribution terms (schedule data; maps/coordinates if history is redistributed) before a public binary release. Record supporting evidence here when resolved. No public binary release has been published at this baseline.

## Game terms

Reviewed 2026-10-23 from the published pages; a reading, not legal advice. NC has not approved this meter, and neither document names DPS meters or packet capture.

- [NC EULA](https://www.plaync.com/policy/service/game_en) (English, last updated 20 October 2026), section 6 "Restrictions On And Use Of The Services". Users must not "decipher, decompile, disassemble, or reverse engineer any of the software used to provide the Services or Content"; access the Services "by any means (automated or otherwise) other than through our currently available, published interfaces that are provided by NC"; "collect or store any personally identifiable information from the Services from other Users of the Services without their express and informed consent"; or "encourage or enable any other individual to do any of the foregoing".
- [AION 2 Global Operation Policy](https://www.plaync.com/policy/operation/aion2global) (effective 17 September 2026), section 6 "Sanctions Table". "Use of Unauthorized Programs": "Using computer programs, devices, or equipment that circumvent technical protection measures or interfere with normal operations (e.g., programs enabling actions impossible for regular users)". "Creating/Distributing Unauthorized Programs": "Creating or distributing unauthorized programs, devices, or equipment". Both carry an integrated account ban, a permanent restriction on all NC games and services. The table states that conduct not listed as an example may still be penalised.

How these apply here (assessment, not NC's ruling):
- Packet decoding is reverse engineering, and capture reads game data outside NC's published interfaces.
- The meter identifies other players and saves their names and combat stats in local history (CombatHistoryStore); nickname hiding changes only what is displayed. Optional raw packet logging (Settings > Developer > Log Raw Packets, off by default) also writes other players' data to disk.
- A passive meter arguably neither circumvents protection nor interferes with operations, the strongest reading in favour of use. The creating/distributing entry applies more directly, and already applies: developing this fork is creating, and the public GitHub fork, its update feed and any binary release are distributing.
- Decoding more packet types, for example the player's own Kinah, is further creating and reverse engineering, but adds no other players' data.
- Companion-only mode (--world-companion) does not start capture.

Enforcement reports (secondary sources, not NC documents): an [Inven Global summary](https://www.invenglobal.com/articles/22212/new-sanctuary-and-brooches-added-aion-2-live-stream-summary-may-12-tue) of NC's 26 May 2026 Korean live stream reports a warning to DPS meter and site operators to stop recording and sharing personal DPS data, with in-game blocking and possible legal action, and no impact on regular users who are not site operators. A [fan blog](https://timesaver.gg/blog/aion-2-account-temporarily-restricted) quotes October 2026 Global restriction notices that cite unauthorized programs without naming meters, and mentions unlinked, unverified Reddit reports of launch-week bans tied to a DPS meter.

Both documents change over time. Re-read them before a public release or new packet decoding, and update this section and the README disclaimer.
