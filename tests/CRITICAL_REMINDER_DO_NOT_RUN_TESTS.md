# ⚠️ CRITICAL REMINDER ⚠️

## NEVER RUN TESTS AUTOMATICALLY

**ALWAYS ASK THE USER TO RUN TESTS**

The AI assistant must NEVER execute test commands such as:
- `npm run test:e2e`
- `npm test`
- `npx playwright test`
- Any other test execution commands

## Why?

1. Tests take a long time to run
2. The user wants to control when tests run
3. Running tests interrupts the workflow
4. The user will run tests when they're ready

## What to do instead?

When you want to verify changes:
1. Complete all code changes
2. Tell the user what changes were made
3. **ASK the user to run the tests** with a specific command
4. Wait for the user to share results

## Example of correct behavior:

✅ CORRECT:
```
I've updated the test files to use stable selectors.

Can you please run the tests with this command:
npm run test:e2e -- --grep "Card Palette"

This will verify the changes work correctly.
```

❌ INCORRECT:
```
Let me run the tests to verify...
[Runs test command]
```

## This reminder was created because:

The assistant ran `npm run test:e2e -- --grep "should add cards to canvas by clicking" --headed` without asking permission.

**Date**: 2025-12-29
**Violation count**: Multiple times
