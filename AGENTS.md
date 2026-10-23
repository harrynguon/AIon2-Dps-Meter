# Repository instructions

Read docs/README.md and docs/HANDOFF.md before changes. Update relevant docs and docs/WORKLOG.md for each meaningful change: reason, actual checks, unresolved issues and next action. Keep architecture and reproducible commands current. Do not infer acceptance from unchecked items.

Never embed, print, log or commit secrets, authentication data, personal progress, packet captures or private combat logs. Use synthetic fixtures, validate untrusted data and preserve recovery protections.

Use absolute paths in shell commands/file operations. Shared code derives absolute filesystem paths from trusted repository/application/platform directories; never hard-code developer homes or rely on the starting directory. Portable module references, documentation links and web assets remain portable.

Preserve user customizations when updating defaults. Nezekan timings remain unverified until evidence is documented. Preserve attribution and the documented provenance gap. Run checks appropriate to changes; browser-only results do not validate combat.

## Fork boundary

This is a fork of Kuroukihime/AIon2-Dps-Meter. Merge only upstream releases (upstream master), never upstream dev. Keep fork work easy to merge around and easy to move into another meter:

- Put each fork feature in its own module project that references no project in this repository (see AionDpsMeter.Companion). Modules declare small interfaces the host implements, take storage locations and other host policy from the host, and serve their own static assets.
- Put meter-specific wiring for a module in a fork-owned folder of the host project (see AionDpsMeter.UI/Companion), using partial classes where an upstream class needs a hook.
- Limit edits to upstream files to one-line hooks (registration, a button, a delegate). Do not reformat, reorder or refactor upstream code beyond the hook. List every seam in docs/ARCHITECTURE.md ("Fork boundary") and update that list when one changes.
- Keep fixes to upstream behaviour minimal and generic, and note them as candidates to offer upstream.
- Guard each module's independence with a test, as WorldCompanionHostTests does.

## Structure and comments

Write modular, reusable code with focused responsibilities. Keep schedule rules/calculation, validation, storage and UI separate. Prefer shared helpers over duplication. Briefly comment each new or changed module and function with its purpose, and explain non-obvious behavior or invariants without narrating every statement. Keep comments current. Add appropriate boundary/compatibility tests and maintain documentation as work proceeds.
