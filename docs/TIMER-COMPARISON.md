# A2Tools timer comparison — 2026-10-23

Reviewed taengu/A2Tools-Plugins main at b11f345c93494a2b6a77142002dc26a656b610d2 against our d378abb. Scope: recurring timer data, recurrence implementation and generator; not a full plugin security audit or live A2Tools host test.

## Findings

| Item | Our defaults | A2Tools | Implication for Asia |
| --- | --- | --- | --- |
| Daily/Wednesday reset | 09:00 server | 07:00 UTC | Their reset is 16:00 Seoul / 18:00 Sydney AEDT; matches the player's tentative report |
| Rift | UTC 00:00 every 3h | Server 02:00 every 3h | Ours is 00/03/06… server; theirs 02/05/08…: different phase |
| Kaira | UTC 01:00 every 3h | Server 01:00 every 3h | Same instants at UTC+9 because 9 is divisible by 3; differs in other regions |
| Nahma | Fri/Sun 21:00 server | Same | Start times agree |
| Executors | Mon/Thu/Sat 21:30 server, Tamasa/Argo | Same time, also lists Kaira | Additional boss outside original requested scope |
| Artifact siege | Mon/Thu/Sat 21:00 server | Same | Start times agree |
| Invasion | Hourly :30, 15m active | 13m total, 3m entry | Their countdown advances when entry closes |
| Shugo | Hourly :00, 15m active | 7m total, 3m entry | Their countdown advances when entry closes |
| Boss/siege duration | Assumed 30/45m windows | 0 (unknown) | Our activity windows are estimates, not supported by this source |
| Rift duration | 10m entry, 60m activity | 10m portal only | This source supports entry duration, not our 60m activity window |

## How theirs works

schedule.js contains generated data. build.py reads EventSchedule/FieldEvent for field times and durations, PeriodSpawn for scheduled spawns, and RiftData for portal lifetime. Raw extracted client tables were not available for this review, so generated values are corroborating third-party evidence, not independently verified game facts. In particular, 07:00 UTC resets are explicitly added in build.py rather than derived from those tables.

plugin.js maps Global regions to IANA timezones (Asia/Seoul for Asia), derives region/faction from character server IDs, and permits manual selection. It converts wall times using Intl offsets, checking them twice, and scans yesterday through eight days ahead. nextOf returns the earliest future or joinable occurrence. Reset instants advance at the exact boundary. Shugo/Invasion use enter=180 seconds for the displayed running interval, although their total durations remain in the catalog.

Our pure engine uses explicit UTC or fixed server offset and scans eight days either side. Fixed UTC+9 is adequate for Asia; IANA zones would improve other regions with daylight saving. This review did not test ambiguous/missing DST wall times, so it does not certify their conversion for every transition.

Their wider plugin also includes network-fed boss timers and siege data, host permissions, alerts and icons. Those features require A2Tools APIs and are outside this request. No remote feed or third-party plugin was installed into our meter. Their README's closing statement that respawn bosses are not included conflicts with newer sections/code describing boss feeds; use executable code and pinned sources when reviewing behavior.

## Checks performed

An isolated local harness ran only the inspected EVENTS declaration and pure timezone/nextOf functions, with no plugin initialization, host bridge or network code. Thirteen assertions passed. Our existing twelve JS schedule/state/catalog tests also passed. No runtime defaults were changed by this review.

Reproduction cases (Asia/Seoul; input/output UTC):

| Input | Expected A2Tools result |
| --- | --- |
| Daily 2026-10-23 06:59:59 | Start Oct 23 07:00 |
| Daily Oct 23 07:00:00 | Start Oct 24 07:00 |
| Weekly Oct 28 07:00:00 | Start Nov 4 07:00 |
| Rift Oct 23 01:59:59 | Start 02:00 |
| Rift 02:09:59 | Current ends 02:10 |
| Rift 02:10:00 | Next starts 05:00 |
| Shugo 00:02:59 | Current start 00:00 |
| Shugo 00:03:00 | Next starts 01:00 |
| Invasion 00:33:00 | Next starts 01:30 |

Additional assertions compare Nahma and Kaira agreement, and reset/rift disagreement with our current defaults. The temporary harness is not shipped; the cases above preserve the test specification. Passing arithmetic tests does not prove Nezekan's live schedule or the full A2Tools UI works.

## Recommended next implementation

Add a clearly sourced Global schedule preset rather than silently overwriting saved custom rules. Prioritize 07:00 UTC daily/weekly resets and the server-based 02:00 rift cycle. Model entry and activity separately for Shugo/Invasion, and label unknown boss/siege end times rather than inventing durations. Confirm Nezekan timings in-game; record evidence and test exact boundaries, saved-state compatibility and explicit preset application. Keep excluded boss/network/alert scope excluded.

## Pinned sources

- [Timer data](https://github.com/taengu/A2Tools-Plugins/blob/b11f345c93494a2b6a77142002dc26a656b610d2/plugins/event-timers/schedule.js)
- [Timer implementation](https://github.com/taengu/A2Tools-Plugins/blob/b11f345c93494a2b6a77142002dc26a656b610d2/plugins/event-timers/plugin.js)
- [Generator](https://github.com/taengu/A2Tools-Plugins/blob/b11f345c93494a2b6a77142002dc26a656b610d2/tools/event-timers/build.py)
- [Plugin README](https://github.com/taengu/A2Tools-Plugins/blob/b11f345c93494a2b6a77142002dc26a656b610d2/plugins/event-timers/README.md)

Implementation follow-up: the recommended explicit preset is now implemented; see HANDOFF.md. The comparison table above records the pre-change baseline, not new-install defaults.
