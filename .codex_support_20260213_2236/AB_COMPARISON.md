# Codex VS Code A/B comparison (Feb 13, 2026)

## Environment
- VS Code server log session: `20260213T222845`
- WSL remote extension host
- Tested extension versions:
  - `openai.chatgpt-0.5.74-linux-x64` (pre-release)
  - `openai.chatgpt-0.4.74-linux-x64` (stable)

## Result
No behavioral improvement after downgrade. Both versions fail with the same core errors.

## Shared failure signatures
1. `PendingMigrationError: navigator is now a global in nodejs`
2. `state db missing rollout path for thread ...`
3. `no rollout found for conversation/thread id ...`
4. `thread/resume` failures with `code=-32600`

## Key evidence
### 0.5.74
- `remoteexthost_20260213T222845_exthost2.log` (error at startup)
- `Codex_20260213T222845_exthost2.log` (`state db missing rollout path`, `no rollout found`, `thread/resume` failures)

### 0.4.74
- `remoteexthost_20260213T222845_exthost3_0.4.74.log` (same `PendingMigrationError`)
- `Codex_20260213T222845_exthost3_0.4.74.log` (same rollout/thread failures)

## Conclusion
Issue is not specific to extension version `0.5.74` vs `0.4.74`; likely an upstream extension/runtime bug path in current environment.
