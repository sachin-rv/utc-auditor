const fs = require("fs");
const path = require("path");

const RULE_SET_VERSION = "1.2.0";

/**
 * FR-08 — extensible rule engine. Each rule is independently identifiable,
 * carries severity + recommendation, and is versioned via RULE_SET_VERSION so
 * historical reports stay interpretable even as rules evolve (section 10:
 * "Trend/comparison metadata" depends on this). Section 7 rules are
 * implemented here at whatever fidelity is reliably determinable through
 * static analysis; ambiguous cases are intentionally left as "no finding"
 * rather than guessed.
 */
function runRules(project, config) {
  const findings = [];

  for (const testFile of project.testFiles) {
    const full = path.join(project.cwd, testFile);
    const src = safeRead(full);
    if (src === null) continue;

    findings.push(...checkFocusedTests(testFile, src));
    findings.push(...checkSkippedTests(testFile, src));
    findings.push(...checkAssertionDensity(testFile, src));
    findings.push(...checkOversizedTests(testFile, src));
  }

  findings.push(...checkTestPresence(project));
  findings.push(...checkTestDiscovery(project));

  return findings;
}

function checkFocusedTests(file, src) {
  if (/\b(it|test|describe)\.only\s*\(/.test(src)) {
    return [
      finding({
        ruleId: "RULE-FO-01",
        category: "Focused Tests",
        title: "Focused (.only) test left in suite",
        severity: "critical",
        detail: `${file} uses .only, which prevents the rest of the suite from running.`,
        recommendation: "Remove .only before merging — it silently disables the rest of the suite.",
        file,
      }),
    ];
  }
  return [];
}

function checkSkippedTests(file, src) {
  const matches = src.match(/\b(it|test|describe)\.skip\s*\(/g);
  if (!matches) return [];
  return [
    finding({
      ruleId: "RULE-SK-01",
      category: "Skipped Tests",
      title: "Test suite skipped/disabled",
      severity: "medium",
      detail: `${file} has ${matches.length} skipped test${matches.length > 1 ? "s" : ""} (.skip).`,
      recommendation: "Re-enable or remove the skipped suite; track intentional skips with a linked issue.",
      file,
    }),
  ];
}

function checkAssertionDensity(file, src) {
  const testBlocks = (src.match(/\b(it|test)\s*\(/g) || []).length;
  const assertions = (src.match(/\bexpect\s*\(/g) || []).length;
  if (testBlocks > 0 && assertions === 0) {
    return [
      finding({
        ruleId: "RULE-AS-01",
        category: "Assertions",
        title: "Test contains no meaningful assertion",
        severity: "high",
        detail: `${file} defines ${testBlocks} test(s) but no expect() calls were found.`,
        recommendation: "Add explicit expect() assertions; a passing test with no assertion proves nothing.",
        file,
      }),
    ];
  }
  return [];
}

function checkOversizedTests(file, src) {
  const lines = src.split("\n").length;
  const beforeEachCount = (src.match(/\bbeforeEach\s*\(/g) || []).length;
  if (lines > 400 || beforeEachCount > 3) {
    return [
      finding({
        ruleId: "RULE-MT-01",
        category: "Test Maintainability",
        title: "Oversized test with repeated setup blocks",
        severity: "low",
        detail: `${file} is ${lines} lines with ${beforeEachCount} beforeEach block(s).`,
        recommendation: "Extract shared setup into a fixture/helper to shrink the test body.",
        file,
      }),
    ];
  }
  return [];
}

// Test Presence: a source module with a plausible "sibling" test file that
// does not exist. This is a heuristic, not a guarantee — components/hooks are
// checked because they're the most reliably testable unit boundary.
function checkTestPresence(project) {
  const testBaseNames = new Set(
    project.testFiles.map((f) => path.basename(f).replace(/\.(test|spec)\.[jt]sx?$/, ""))
  );
  const findings = [];
  for (const src of project.sourceFiles) {
    const base = path.basename(src);
    if (!/^[A-Z]/.test(base) && !/^use[A-Z]/.test(base)) continue; // components / hooks only
    const name = base.replace(/\.[jt]sx?$/, "");
    if (!testBaseNames.has(name)) {
      findings.push(
        finding({
          ruleId: "RULE-TP-01",
          category: "Test Presence",
          title: "Source module has no corresponding unit test",
          severity: "high",
          detail: `${src} has no matching test file.`,
          recommendation: "Add unit tests for the uncovered module before the next release.",
          file: src,
        })
      );
    }
  }
  return findings.slice(0, 25); // cap noise for a single audit run
}

function checkTestDiscovery(project) {
  if (!project.jestConfigPath) {
    return [
      finding({
        ruleId: "RULE-TD-01",
        category: "Test Discovery",
        title: "No Jest configuration found",
        severity: "medium",
        detail: "No jest.config.* file or package.json#jest block was found; discovery relies on Jest defaults.",
        recommendation: "Add explicit Jest configuration so testMatch/coverage behavior is intentional, not implicit.",
      }),
    ];
  }
  return [];
}

function finding(f) {
  return { id: randomId(), ruleVersion: RULE_SET_VERSION, ...f };
}

function randomId() {
  return `find_${Math.random().toString(36).slice(2, 10)}`;
}

function safeRead(file) {
  try {
    return fs.readFileSync(file, "utf-8");
  } catch {
    return null;
  }
}

module.exports = { runRules, RULE_SET_VERSION };
