export default class CustomDotReporter {
  onBegin(config, suite) {
    console.log(`\nStarting the run with ${suite.allTests().length} tests...\n`);
  }

  onTestEnd(test, result) {
    const symbol =
      result.status === 'passed'
        ? '.'
        : result.status === 'failed'
        ? 'F'
        : result.status === 'skipped'
        ? 'S'
        : '?';
    process.stdout.write(symbol);

    if (result.status === 'passed') {
      console.log(` ✅ PASSED: ${test.title}`);
    } else if (result.status === 'failed') {
      console.log(` ❌ FAILED: ${test.title}`);
    } else {
      console.log(` ⚪ ${result.status.toUpperCase()}: ${test.title}`);
    }
  }

  onEnd(result) {
    console.log(`\n\nRun finished with status: ${result.status}`);
  }
}
