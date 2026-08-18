const { RULE_SET_VERSION } = require("./rules");

const AUDITOR_VERSION = require("../package.json").version;

const SEVERITY_PENALTY = { critical: 14, high: 8, medium: 4, low: 1.5, info: 0 };

/**
 * Section 11 — composite score. Coverage alone never determines the score;
 * it is one contribution among execution health, rule findings, and
 * dependency/migration consistency. Weights are intentionally simple and
 * configurable-by-replacement here, matching "Score calculation and weights
 * shall be configurable so the model can evolve."
 */
function computeScore({ coverage, testExecution, findings, migrationFindings }) {
  const coverageAvg =
    (coverage.statements + coverage.branches + coverage.functions + coverage.lines) / 4;

  const executionHealth =
    testExecution.total === 0 ? 100 : (testExecution.passed / testExecution.total) * 100;

  const findingPenalty = findings.reduce((sum, f) => sum + (SEVERITY_PENALTY[f.severity] || 0), 0);
  const migrationPenalty = migrationFindings.filter((m) => m.status !== "active").length * 3;

  const base = coverageAvg * 0.45 + executionHealth * 0.35 + 20; // execution health + coverage weighted, 20pt floor for having a working pipeline
  const score = base - findingPenalty - migrationPenalty;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildReport({
  project,
  config,
  trigger,
  buildId,
  jestOutcome,
  findings,
  dependencyFindings,
  migrationFindings,
}) {
  const overallScore = computeScore({
    coverage: jestOutcome.coverage,
    testExecution: jestOutcome.testExecution,
    findings,
    migrationFindings,
  });

  const recommendations = dedupe(findings.map((f) => f.recommendation)).slice(0, 6);
  if (dependencyFindings.length) {
    recommendations.push("Review dependency-consistency findings for cleanup candidates.");
  }
  if (migrationFindings.some((m) => m.status !== "active")) {
    recommendations.push("Reconcile migration-area package/test inconsistencies flagged in this audit.");
  }

  const errors = [];
  if (jestOutcome.error) errors.push(jestOutcome.error);

  return {
    id: `report_${randomId()}`,
    projectId: config.projectId,
    auditExecutionId: `exec_${randomId()}`,
    timestamp: new Date().toISOString(),
    trigger,
    buildId,
    auditorVersion: AUDITOR_VERSION,
    ruleSetVersion: RULE_SET_VERSION,
    jestVersion: jestOutcome.jestVersion,
    overallScore,
    coverage: jestOutcome.coverage,
    testExecution: jestOutcome.testExecution,
    findings,
    dependencyFindings,
    migrationFindings,
    recommendations,
    executionStatus: !jestOutcome.ok ? "failed" : errors.length ? "completed_with_errors" : "success",
    errors,
    durationMs: jestOutcome.testExecution.durationMs,
  };
}

function dedupe(arr) {
  return [...new Set(arr)];
}
function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

module.exports = { buildReport, computeScore };
