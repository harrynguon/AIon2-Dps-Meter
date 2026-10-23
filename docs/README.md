# Maintainer documentation

Start with [handoff](HANDOFF.md), then [development](DEVELOPMENT.md), [architecture](ARCHITECTURE.md), and [security/provenance](SECURITY.md). The [user overview](../WORLD-COMPANION.md) describes features.

Update relevant documentation and [work log](WORKLOG.md) for each meaningful change: what changed, why, actual checks, unresolved issues, and next action. Keep confirmed observations separate from assumptions. Never include secrets, real progress exports, or private combat logs.

See [A2Tools timer comparison](TIMER-COMPARISON.md) for source-backed schedule discrepancies and boundary checks.

[Live testing guide](LIVE-TESTING.md): how to try the timer preset and companion window lifecycle while logged in.

Pre-merge review: [.claude/agents/pr-auditor.md](../.claude/agents/pr-auditor.md) defines a read-only Claude Code auditor that checks a branch against these rules and runs the documented checks before merging into master.
