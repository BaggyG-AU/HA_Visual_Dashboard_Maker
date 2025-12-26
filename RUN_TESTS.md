# Quick Test Commands

## 🎯 Essential Commands

### 1. Debug Your App (See What Tests See)
```bash
npx playwright test tests/debug-app.spec.ts --headed
```
**What it does:** Opens your app visibly, takes screenshots, saves HTML, shows element counts
**Use this first** to understand what your app looks like to Playwright!

---

### 2. Run Basic Tests
```bash
npx playwright test tests/e2e/app-launch.spec.ts --headed
```
**What it does:** Runs the 4 basic app launch tests where you can see the app

---

### 3. Run All E2E Tests (See Them Run)
```bash
npm run test:e2e -- --headed
```
**What it does:** Runs all 118 E2E tests with visible windows (slower but you can watch)

---

### 4. Run Tests in UI Mode (Best for Development)
```bash
npm run test:ui
```
**What it does:** Opens Playwright's visual test runner
- Pick which tests to run
- See each step
- Time-travel debugging
- Watch mode (re-runs on changes)

---

### 5. Debug a Single Test
```bash
npx playwright test tests/e2e/app-launch.spec.ts -g "should launch" --debug
```
**What it does:** Steps through one test with debugger
**Replace:** Change the filename and `-g "pattern"` to match the test you want

---

## 📊 View Test Results

### After Running Tests
```bash
npm run test:report
```
**What it does:** Opens HTML report showing pass/fail status, screenshots, traces

---

## 🔍 Useful Test Patterns

### Run One Specific Test
```bash
npx playwright test tests/e2e/app-launch.spec.ts -g "should launch successfully"
```

### Run One Test File
```bash
npx playwright test tests/e2e/app-launch.spec.ts
```

### Run All Tests in a Folder
```bash
npx playwright test tests/e2e/
```

### Run Tests with Console Output
```bash
npx playwright test --reporter=list
```

---

## 📸 Screenshots & Artifacts

After running tests, check:
- **Screenshots:** `test-results/screenshots/`
- **HTML Report:** `test-results/html/index.html`
- **Debug HTML:** `test-results/debug-page.html` (from debug test)

---

## 🎓 Workflow for Implementing Tests

### Step 1: See What Your App Looks Like
```bash
npx playwright test tests/debug-app.spec.ts --headed
```
Check: `test-results/screenshots/debug-full-page.png`
Check: `test-results/debug-page.html`

### Step 2: Run One Test File in Headed Mode
```bash
npx playwright test tests/e2e/app-launch.spec.ts --headed
```
Watch what happens, see where it fails

### Step 3: Fix the Test
Edit the test file based on what you saw

### Step 4: Run Again
```bash
npx playwright test tests/e2e/app-launch.spec.ts --headed
```
Repeat until all tests in the file pass

### Step 5: Move to Next File
```bash
npx playwright test tests/e2e/card-palette.spec.ts --headed
```

---

## ⚠️ Important Notes

1. **App must be built first:**
   ```bash
   npm run package
   ```

2. **Tests run against packaged app** at `.vite/build/main.js`

3. **Screenshots are saved** for every test failure automatically

4. **Use --headed** to see what's happening (slower but helpful)

5. **Use --debug** to step through line by line

6. **Use test:ui** for the best development experience

---

## 🐛 If Tests Are Failing

### Check 1: Is the app building?
```bash
npm run package
```
Should complete without errors

### Check 2: Can Playwright find the app?
Look for: `.vite/build/main.js`
Should exist after building

### Check 3: What does the debug test show?
```bash
npx playwright test tests/debug-app.spec.ts --headed
```
Read console output, check screenshots

### Check 4: Are selectors correct?
Look at `test-results/debug-page.html` to see actual HTML
Update test selectors to match

---

## ✅ Success Criteria

You know tests are working when:
- ✅ App window opens and closes cleanly
- ✅ Screenshots are captured
- ✅ Console shows element counts
- ✅ No timeout errors
- ✅ Tests pass (green checkmarks)

---

## 🎯 Your First Goal

**Get these 4 tests passing:**
```bash
npx playwright test tests/e2e/app-launch.spec.ts --headed
```

1. ✅ should launch the application successfully
2. ✅ should have correct window dimensions
3. ⚠️ should display main UI components (may need selector updates)
4. ⚠️ should load without critical console errors (now lenient)

Once these pass, move to the next file!

---

## 📞 Need Help?

Run the debug test and send me:
1. The console output
2. The screenshot from `test-results/screenshots/debug-full-page.png`
3. The HTML from `test-results/debug-page.html`

I can help you fix the selector issues!

---

**Happy Testing! 🚀**
