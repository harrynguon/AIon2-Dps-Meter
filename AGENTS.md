# Repository instructions

Read docs/README.md and docs/HANDOFF.md before changes. Update relevant docs and docs/WORKLOG.md for each meaningful change: reason, actual checks, unresolved issues and next action. Keep architecture and reproducible commands current. Do not infer acceptance from unchecked items.

Never embed, print, log or commit secrets, authentication data, personal progress, packet captures or private combat logs. Use synthetic fixtures, validate untrusted data and preserve recovery protections.

Use absolute paths in shell commands/file operations. Shared code derives absolute filesystem paths from trusted repository/application/platform directories; never hard-code developer homes or rely on the starting directory. Portable module references, documentation links and web assets remain portable.

Preserve user customizations when updating defaults. Nezekan timings remain unverified until evidence is documented. Preserve attribution and the documented provenance gap. Run checks appropriate to changes; browser-only results do not validate combat.

## Structure and comments

Write modular, reusable code with focused responsibilities. Keep schedule rules/calculation, validation, storage and UI separate. Prefer shared helpers over duplication. Briefly comment each new or changed module and function with its purpose, and explain non-obvious behavior or invariants without narrating every statement. Keep comments current. Add appropriate boundary/compatibility tests and maintain documentation as work proceeds.
