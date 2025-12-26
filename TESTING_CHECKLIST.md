# Testing Setup Checklist
## HA Visual Dashboard Maker

Use this checklist to verify your testing infrastructure and get started with automated testing.

---

## ✅ Initial Setup (Complete)

- [x] Playwright installed (`@playwright/test` v1.57.0)
- [x] Test directory structure created
- [x] Configuration file created (`playwright.config.ts`)
- [x] NPM scripts added to `package.json`
- [x] Git ignore rules updated
- [x] Test helpers created
- [x] Sample test files created
- [x] Documentation written

---

## 📋 Before First Test Run

### 1. Build the Application

```bash
npm run package
```

**Why**: Tests need the packaged Electron app to launch.

**Expected output**: Build completes successfully, creates `.vite/build/` directory.

---

### 2. Verify Playwright Installation

```bash
npx playwright --version
```

**Expected output**: `Version 1.57.0`

---

### 3. Install Playwright Browsers (if needed)

```bash
npx playwright install chromium
```

**Expected output**: Chromium browser downloaded.

---

## 🧪 Running Your First Tests

### Step 1: Run E2E Tests

```bash
npm run test:e2e
```

**What to expect**:
- App launches automatically
- Tests run serially
- Screenshots saved on failure
- Results shown in console

**If tests fail**: This is normal on first run. Common issues:
- App not built → Run `npm run package`
- Selectors not found → App UI may have changed
- Timeouts → App taking longer than expected to launch

---

### Step 2: View Test Report

```bash
npm run test:report
```

**What to expect**:
- HTML report opens in browser
- See pass/fail status
- View screenshots
- Inspect test details

---

### Step 3: Run Tests in UI Mode

```bash
npm run test:ui
```

**What to expect**:
- Playwright UI opens
- Can run tests individually
- Time-travel debugging
- Watch mode for development

**Recommended**: Use this mode for development - it's the best experience.

---

## 🔍 Verify Test Infrastructure

### Test Files Exist

Check these files exist:

```
✓ playwright.config.ts
✓ tests/e2e/app-launch.spec.ts
✓ tests/e2e/card-palette.spec.ts
✓ tests/e2e/dashboard-operations.spec.ts
✓ tests/integration/yaml-operations.spec.ts
✓ tests/integration/card-rendering.spec.ts
✓ tests/unit/card-registry.spec.ts
✓ tests/helpers/electron-helper.ts
✓ tests/helpers/test-data-generator.ts
✓ tests/fixtures/test-dashboard.yaml
✓ tests/fixtures/layout-card-dashboard.yaml
```

---

### NPM Scripts Work

Test each script:

```bash
# Should show help
npx playwright --help

# Should list tests
npx playwright test --list

# Should show projects
npx playwright test --list --project=electron-e2e
```

---

## 🎯 First Day Goals

### Goal 1: Get One Test Passing

1. Build app: `npm run package`
2. Run app launch test: `npx playwright test tests/e2e/app-launch.spec.ts`
3. Fix any failures
4. See green checkmark ✅

---

### Goal 2: Understand Test Structure

1. Open `tests/e2e/app-launch.spec.ts`
2. Read through test code
3. Understand the pattern:
   - Launch app
   - Wait for ready
   - Perform actions
   - Assert results
   - Close app

---

### Goal 3: Run Tests in Different Modes

Try each mode:

```bash
npm test              # Headless (CI mode)
npm run test:headed   # See the app window
npm run test:ui       # Interactive UI
npm run test:debug    # Step-by-step debugger
```

Pick your favorite for development.

---

## 📝 First Week Goals

### Day 1-2: Get All Tests Passing

- [ ] Build application
- [ ] Run full test suite
- [ ] Fix any failing tests
- [ ] All tests green ✅

---

### Day 3-4: Write Your First Test

- [ ] Choose a feature to test
- [ ] Create new test file
- [ ] Use template from [Quick Reference](docs/TESTING_QUICK_REFERENCE.md)
- [ ] Run your test
- [ ] See it pass ✅

Example test to write:
```typescript
test('should search for a card in palette', async () => {
  const { app, window } = await launchElectronApp();

  try {
    await waitForAppReady(window);

    const searchInput = window.locator('input[placeholder*="Search"]');
    await searchInput.fill('button');

    const buttonCard = await window.locator('text=Button Card').count();
    expect(buttonCard).toBeGreaterThan(0);

  } finally {
    await closeElectronApp(app);
  }
});
```

---

### Day 5-7: Add Test IDs to Components

Add `data-testid` attributes to important components:

```tsx
// Before
<button onClick={save}>Save</button>

// After
<button data-testid="save-button" onClick={save}>Save</button>
```

**Benefits**: More stable selectors, easier to maintain tests.

**Priority components**:
- [ ] Save button
- [ ] Open button
- [ ] Card palette search
- [ ] Canvas area
- [ ] Properties panel
- [ ] View tabs

---

## 🚀 First Month Goals

### Week 1: Foundation

- [ ] All existing tests passing
- [ ] Test IDs added to components
- [ ] Team familiar with running tests
- [ ] First custom test written

---

### Week 2: Coverage

- [ ] Add tests for new features as developed
- [ ] Aim for 50% E2E coverage of critical paths
- [ ] Document any testing gotchas

---

### Week 3: CI/CD

- [ ] Enable GitHub Actions workflow
- [ ] Fix any CI-specific issues
- [ ] Set up branch protection (require tests to pass)
- [ ] Configure PR test result comments

---

### Week 4: Automation

- [ ] Set up pre-commit hooks (optional)
- [ ] Configure nightly test runs
- [ ] Add visual regression tests
- [ ] Measure and improve test performance

---

## 🎓 Learning Path

### For Beginners

1. **Read**: [Quick Reference](docs/TESTING_QUICK_REFERENCE.md)
2. **Watch**: Run `npm run test:ui` and explore
3. **Try**: Modify existing test, see what happens
4. **Write**: Create simple test based on template

---

### For Intermediate

1. **Read**: [Test Automation Guide](docs/TEST_AUTOMATION_GUIDE.md)
2. **Practice**: Write integration tests
3. **Explore**: Try debug mode, screenshots, traces
4. **Improve**: Add page object models, custom helpers

---

### For Advanced

1. **Optimize**: Improve test performance
2. **Extend**: Add visual regression, accessibility tests
3. **Architect**: Design test data strategies
4. **Automate**: Full CI/CD pipeline with multiple environments

---

## 🐛 Common First-Run Issues

### Issue 1: "Cannot launch Electron"

**Cause**: App not built

**Fix**:
```bash
npm run package
npm test
```

---

### Issue 2: "Timeout waiting for selector"

**Cause**: App UI different than expected, or slow to load

**Fix**:
```bash
# Run in headed mode to see what's happening
npm run test:headed

# Or debug mode
npm run test:debug
```

---

### Issue 3: "Tests pass locally but fail in CI"

**Cause**: Environment differences (timing, paths, etc.)

**Fix**:
- Check CI logs and screenshots
- Add longer timeouts for CI
- Use absolute paths instead of relative
- Ensure all dependencies installed

---

### Issue 4: "Flaky tests (sometimes pass, sometimes fail)"

**Cause**: Race conditions, insufficient waits

**Fix**:
```typescript
// Add explicit waits
await window.waitForSelector('.element', { state: 'visible' });
await window.waitForLoadState('networkidle');

// Add small delays for animations
await window.waitForTimeout(300);
```

---

## 📊 Success Metrics

Track these metrics weekly:

- **Test count**: Should increase as features are added
- **Pass rate**: Should be >95% (ideally 100%)
- **Coverage**: Aim for 80%+ of critical paths
- **Execution time**: Keep under 5 minutes for full suite
- **Flaky test rate**: Should be <5%

---

## 🎉 Milestones

### Milestone 1: First Test Passes ✅
**When**: First day
**Celebrate**: Take a screenshot of the green checkmark!

### Milestone 2: Full Suite Passes ✅
**When**: First week
**Celebrate**: Share the test report with the team!

### Milestone 3: CI/CD Enabled ✅
**When**: First month
**Celebrate**: Automated testing on every commit!

### Milestone 4: 80% Coverage ✅
**When**: First quarter
**Celebrate**: High-quality, well-tested application!

---

## 📞 Get Help

### Resources

1. **Documentation**: See `docs/` directory
2. **Examples**: Look at existing tests in `tests/`
3. **Playwright Docs**: https://playwright.dev
4. **GitHub Issues**: Open an issue for bugs

### Quick Commands

```bash
# List all tests
npx playwright test --list

# Run specific test
npx playwright test -g "test name"

# Debug a test
npx playwright test --debug

# Show test report
npm run test:report
```

---

## ✨ You're Ready!

Everything is set up and ready to go. Start with:

```bash
# 1. Build the app
npm run package

# 2. Run tests in UI mode
npm run test:ui

# 3. Explore and learn!
```

**Happy Testing! 🎉**

---

**Questions?** Check the [Test Automation Guide](docs/TEST_AUTOMATION_GUIDE.md) or open an issue.
