const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * FR-05 — programmatically invokes Jest using the client project's own
 * configuration (rather than assuming pre-generated artifacts), and captures
 * pass/fail/skip/pending counts plus coverage. Falls back to reading an
 * existing coverage artifact when config.useExistingCoverage is set, per the
 * "or instead collect data from the coverage result generated as part of the
 * build" clause in FR-05.
 */
function runJest(cwd, config) {
  if (config.useExistingCoverage) {
    return readExistingCoverageOnly(cwd, config);
  }

  let stdout = "";
  let executionFailed = false;
  const start = Date.now();

  try {
    stdout = execSync(config.jestCommand, {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 1024 * 1024 * 64,
    });
  } catch (err) {
    // Jest exits non-zero on test failures — that's expected and still
    // yields usable JSON output on stdout. Only treat it as an execution
    // failure if no parseable output came back.
    stdout = err.stdout ? err.stdout.toString() : "";
    executionFailed = !stdout;
  }

  const durationMs = Date.now() - start;

  let jestResult;
  try {
    const jsonStart = stdout.indexOf("{");
    jestResult = JSON.parse(stdout.slice(jsonStart));
  } catch {
    return {
      ok: false,
      error: "Jest execution failure: could not parse Jest JSON output.",
      testExecution: emptyTestExecution(durationMs),
      coverage: emptyCoverage(),
      testResults: [],
    };
  }

  return {
    ok: !executionFailed,
    error: null,
    testExecution: summarizeExecution(jestResult, durationMs),
    coverage: summarizeCoverage(jestResult),
    testResults: jestResult.testResults ?? [],
    jestVersion: getJestVersion(cwd),
  };
}

function summarizeExecution(jestResult, durationMs) {
  return {
    total: jestResult.numTotalTests ?? 0,
    passed: jestResult.numPassedTests ?? 0,
    failed: jestResult.numFailedTests ?? 0,
    skipped: jestResult.numPendingTests ?? 0,
    pending: jestResult.numTodoTests ?? 0,
    durationMs,
  };
}

function summarizeCoverage(jestResult) {
  const summary = jestResult.coverageMap
    ? aggregateCoverageMap(jestResult.coverageMap)
    : null;
  if (!summary) return emptyCoverage();
  return summary;
}

function aggregateCoverageMap(coverageMap) {
  const totals = { statements: [0, 0], branches: [0, 0], functions: [0, 0], lines: [0, 0] };
  for (const fileCoverage of Object.values(coverageMap)) {
    for (const key of Object.keys(totals)) {
      const data = fileCoverage[key === "statements" ? "s" : key === "branches" ? "b" : key === "functions" ? "f" : "s"];
      if (!data) continue;
      const values = Object.values(data).flat();
      totals[key][0] += values.filter((v) => (Array.isArray(v) ? v.some((x) => x > 0) : v > 0)).length;
      totals[key][1] += values.length;
    }
  }
  const pct = ([covered, total]) => (total === 0 ? 100 : Math.round((covered / total) * 100));
  return {
    statements: pct(totals.statements),
    branches: pct(totals.branches),
    functions: pct(totals.functions),
    lines: pct(totals.lines),
  };
}

function readExistingCoverageOnly(cwd, config) {
  const artifactPath = path.join(cwd, config.coverageArtifactPath);
  if (!fs.existsSync(artifactPath)) {
    return {
      ok: false,
      error: `Coverage generation failure: artifact not found at ${config.coverageArtifactPath}.`,
      testExecution: emptyTestExecution(0),
      coverage: emptyCoverage(),
      testResults: [],
    };
  }
  const raw = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  return {
    ok: true,
    error: null,
    testExecution: emptyTestExecution(0),
    coverage: aggregateCoverageMap(raw),
    testResults: [],
  };
}

function emptyCoverage() {
  return { statements: 0, branches: 0, functions: 0, lines: 0 };
}
function emptyTestExecution(durationMs) {
  return { total: 0, passed: 0, failed: 0, skipped: 0, pending: 0, durationMs };
}

function getJestVersion(cwd) {
  try {
    const pkgPath = require.resolve("jest/package.json", { paths: [cwd] });
    return JSON.parse(fs.readFileSync(pkgPath, "utf-8")).version;
  } catch {
    return undefined;
  }
}

module.exports = { runJest };
