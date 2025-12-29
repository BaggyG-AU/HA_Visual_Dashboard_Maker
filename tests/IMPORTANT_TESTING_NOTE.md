# ⚠️ CRITICAL TESTING NOTE

## Playwright Tests CANNOT Run from VSCode/Claude Code Terminal

**DO NOT attempt to run Playwright tests from the integrated terminal in VSCode or Claude Code.**

### Why?
The Electron application fails to launch when Playwright is invoked from the VSCode/Claude Code integrated terminal. The error is:
```
Error: Process failed to launch!
```

### Solution
**ALL Playwright tests MUST be run from the Windows Command Prompt (cmd.exe) or PowerShell.**

### How to Run Tests
1. Open Windows Command Prompt (Start → cmd)
2. Navigate to project directory: `cd C:\Users\micah\OneDrive\Documents\GitHub\HA_Visual_Dashboard_Maker`
3. Run tests: `npx playwright test [test-file]`

### Examples
```bash
# Run all theme integration tests
npx playwright test tests/integration/theme-integration-mocked.spec.ts --headed

# Run specific test
npx playwright test tests/integration/theme-integration-mocked.spec.ts --grep "should mock WebSocket"

# Run entity browser tests
npx playwright test tests/integration/entity-browser.spec.ts
```

## This Has Been Confirmed Multiple Times
- The tests work perfectly when run from Windows Command Prompt
- The tests fail immediately with "Process failed to launch!" from VSCode terminal
- This is an environment/terminal issue, not a code issue

## For Future Reference
If you see test failures in this conversation, **always ask the user to run the tests from Command Prompt** instead of attempting to run them from the integrated terminal.

**NEVER run `npx playwright` commands via the Bash tool in this environment.**
