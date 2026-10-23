# Live testing

Launch the published AionDpsMeter.UI.exe with --world-companion to test timers alongside an existing meter without starting another capture session. Use an absolute executable path (see DEVELOPMENT.md for portable build variables). Close other World Companion instances first because they share settings storage.

1. Open Settings. Keep server offset +9 for Asia. Choose Load Global preset, review the fields, then Save schedule. Existing saved rules only change on Save. The footer should read "Saved on this PC"; "Save failed" means the build and saved-data version disagree.
2. Compare the Schedule server clock with the game. Record exact server time and the game's next reset/rift countdown. Expected reset: 16:00 server (18:00 Sydney AEDT, 17:00 Sydney AEST). Expected rifts: 02/05/08/11/14/17/20/23 server. Shugo entry is :00–:03; Invasion entry :30–:33.
3. Record a calendar countdown separately from an observed opening. Confirm Wednesday tally independently. Avoid sharing account identifiers or raw packet logs.
4. To test integrated combat, close standalone mode and the old DPS meter, launch the new executable normally, and open the companion with the diamond button. Check both meter layouts and verify combat behavior with the companion open/closed.
5. Window lifecycle (the 2026-10-23 crash): with the meter running, open and close the companion several times using its ✕ button, Alt+F4 and the ◈ button, including during combat. The meter must stay open. Then close the meter while the companion is open. If it crashes, record the time and copy only the exception type and stack from Windows Event Viewer (Application log, source ".NET Runtime").

Automated browser checks validate timers, settings, recovery and preset application. They cannot establish live schedule accuracy or combat capture correctness. Companion-only mode exits when its window closes, so it cannot show the window-lifecycle crash. The automated lifecycle check (DEVELOPMENT.md) covers ✕, WM_CLOSE and shutdown in a test host, not the integrated meter, combat or ◈, so step 5 still applies. Record results and tested commit in WORKLOG.md.
