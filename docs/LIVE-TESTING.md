# Live testing

Launch the published AionDpsMeter.UI.exe with --world-companion to test timers/maps alongside an existing meter without starting another capture session. Use an absolute executable path (see DEVELOPMENT.md for portable build variables). Close other World Companion instances first because they share progress storage.

1. Open Settings. Keep server offset +9 for Asia. Choose Load Global preset, review the fields, then Save schedule. Existing saved rules only change on Save.
2. Open Hidden cubes, choose Verteron, search a landmark or group, and select its pin/checklist row. Numbered dots are candidate spots. Mark a group found, close/reopen, and confirm it remains checked. Pan with drag and zoom with the wheel. Completion is manual; no automatic in-game location detection is implemented.
3. Compare the Schedule server clock with the game. Record exact server time and the game's next reset/rift countdown. Expected reset: 16:00 server (18:00 Sydney AEDT, 17:00 Sydney AEST). Expected rifts: 02/05/08/11/14/17/20/23 server. Shugo entry is :00–:03; Invasion entry :30–:33.
4. Record a calendar countdown separately from an observed opening. Confirm Wednesday tally independently. Avoid sharing account identifiers or raw packet logs.
5. To test integrated combat, close standalone mode and the old DPS meter, launch the new executable normally, and open the companion with the diamond button. Check both meter layouts and verify combat behavior with the companion open/closed.

Automated browser checks validate maps, progress, profiles, recovery and preset application. They cannot establish live schedule accuracy or combat capture correctness. Record results and tested commit in WORKLOG.md.
