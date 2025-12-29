// Quick script to analyze test results
const fs = require('fs');

const results = JSON.parse(fs.readFileSync('test-results/results.json', 'utf8'));

let totalTests = 0;
let passed = 0;
let failed = 0;
let timedOut = 0;
let skipped = 0;

const failedTests = [];

results.suites.forEach(suite => {
  suite.suites?.forEach(subsuite => {
    subsuite.specs?.forEach(spec => {
      spec.tests?.forEach(test => {
        totalTests++;
        const status = test.results?.[0]?.status;

        if (status === 'passed') passed++;
        else if (status === 'failed') {
          failed++;
          failedTests.push({
            file: suite.title,
            suite: subsuite.title,
            test: spec.title,
            error: test.results[0].error?.message || 'No error message'
          });
        }
        else if (status === 'timedOut') {
          timedOut++;
          failedTests.push({
            file: suite.title,
            suite: subsuite.title,
            test: spec.title,
            error: 'TIMEOUT'
          });
        }
        else if (status === 'skipped') skipped++;
      });
    });
  });
});

console.log('\n========== TEST RESULTS SUMMARY ==========\n');
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⏱️  Timed Out: ${timedOut}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`\nPass Rate: ${((passed / totalTests) * 100).toFixed(1)}%`);

if (failedTests.length > 0) {
  console.log('\n========== FAILED TESTS ==========\n');
  failedTests.forEach((test, i) => {
    console.log(`${i + 1}. ${test.file}`);
    console.log(`   Suite: ${test.suite}`);
    console.log(`   Test: ${test.test}`);
    console.log(`   Error: ${test.error.substring(0, 200)}`);
    console.log('');
  });
}
