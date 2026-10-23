# Handoff — 2026-10-23

Implementation baseline: c0c2615. Fork: https://github.com/harrynguon/AIon2-Dps-Meter
Branch: feature/world-companion. Draft PR: https://github.com/harrynguon/AIon2-Dps-Meter/pull/1

## Completed

Nine schedule entries, Next Up banner, two offline maps, 154 cube groups with 2,811 candidate spots, map/checklist sync, search, pan/zoom, profiles, import/export and durable validated storage. Both DPS layouts open the companion using the diamond button. The --world-companion argument bypasses packet capture. Updates target this fork.

At this baseline, 15 .NET tests, 12 JavaScript tests, Edge interaction/recovery checks and a published WebView2 companion smoke check passed. [PR CI passed](https://github.com/harrynguon/AIon2-Dps-Meter/actions/runs/39875400973). No public binary release has been published.

## Next: in-game acceptance

Record tested commit, observation date and relevant Windows/display configuration. These checks remain pending:

- [ ] Normal launch captures and displays combat with companion closed.
- [ ] Open/close companion from both DPS layouts without disrupting capture.
- [ ] Compare responsiveness and CPU/memory with companion open.
- [ ] Resize, move and reopen; check display scaling and multiple monitors where applicable.
- [ ] Mark a test cube, switch profiles and restart; verify independent saved progress.
- [ ] Export/import a synthetic profile; never commit personal progress.
- [ ] Verify server clock, daily reset, Wednesday tally and rift opening/closing phases.

## Schedule evidence needed

Target: Global Asia / Nezekan / Elyos. Screenshot evidence received 2026-10-23 shows ST 09:22, LT 11:22, and a per-server daily completion reset countdown of 6h 37m. This supports approximately 16:00 server / 18:00 Sydney AEDT, consistent with the Global preset (07:00 UTC). Minute precision and screenshot timing explain the approximately one-minute difference. This verifies the displayed daily-completion countdown, not every daily system or an observed reset transition. The two-hour clock difference is consistent with UTC+9 given Sydney AEDT; screenshots alone do not identify an absolute timezone. The player subsequently confirmed weekly reset at Wednesday 18:00 Melbourne time; see the confirmation below. Legacy saved rules may still use 09:00 server until the preset is explicitly applied.

Record each event's date, exact server time, UTC time, local timezone, phase, and whether evidence is a calendar countdown or actual observation. Observe consecutive rift openings; verify weekly tally independently. Do not include account identifiers. Correct defaults and regression tests once verified, explicitly preserving existing user customizations. Settings permit manual corrections now.

## After acceptance

Resolve map/data redistribution provenance before public binary distribution. Review/merge the draft PR after acceptance, then prepare a versioned release containing the full published folder. Scheduled activity does not detect live bosses. Sounds, radar, extra bosses and custom boss cooldowns remain excluded.

## Additional schedule evidence

The [A2Tools comparison](TIMER-COMPARISON.md) supports 07:00 UTC resets and a server-based 02:00 rift cycle, differing from our defaults. It also identifies three-minute Shugo/Invasion entry windows. The explicit Global preset is implemented and preserves saved customizations. See the screenshot evidence above and the tentative rift observation below for current verification status.

## Global preset implemented — 2026-10-23

New installations use the source-based Global preset. Existing saves retain every custom rule and cube profile. In Settings, Load Global preset previews rules; Save schedule applies them. The server offset stays under user control (Asia: +9). Daily/Wednesday reset is 07:00 UTC. Rifts start at server 02:00 every three hours with a ten-minute portal window; no unsupported sixty-minute activity window is assumed. Shugo/Invasion have three-minute entry windows and seven/thirteen-minute total activity. Entry-close countdowns switch to remaining activity after closure. Boss/siege end times are unknown and do not generate an assumed active window. Live Nezekan verification remains pending.

## Rift observation — 2026-10-23

At the displayed 09:22 server time, the player tentatively recalled a rift about 1h 22m earlier. That implies 08:00 server and agrees with the Global preset. It is not an exact observed opening or proof of the three-hour recurrence. The next predicted opening after this screenshot is 11:00 server / 13:00 Sydney AEDT, about 1h 38m later. Verify entry closure separately (preset: 11:10 server). No schedule code or saved settings were changed from this observation. Screenshots are not committed; only non-identifying clock/countdown readings are recorded.

## Weekly reset confirmation — 2026-10-23

The player explicitly confirmed weekly reset at Wednesday 18:00 Melbourne time. During AEDT (UTC+11), this is Wednesday 07:00 UTC / 16:00 Asia server time, matching the implemented Global preset. Evidence type: confident user report, not an observed transition or screenshot. Behaviour outside daylight saving remains unverified: a fixed 07:00 UTC reset displays as 17:00 Melbourne AEST. Do not change the preset to a Melbourne-local recurrence without evidence that the game reset follows Australian daylight saving. No code or saved settings changed.
