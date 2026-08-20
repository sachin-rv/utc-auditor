// Imports data/sample-external-report.json (the uploaded, real Jest audit
// output) as an actual new project + report inside data/db.json — distinct
// from scripts/seed.js's synthetic projects, this one uses the uploaded
// report's real numbers directly instead of generating them.
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");
const EXTERNAL_REPORT_PATH = path.join(__dirname, "..", "data", "sample-external-report.json");

// Which existing client owns the imported project. Change this if the
// project should belong to a different (or new) client.
const TARGET_CLIENT_ID = "client_northwind";
const PROJECT_ID = "proj_nextjs_app";

function rid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function main() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  const external = JSON.parse(fs.readFileSync(EXTERNAL_REPORT_PATH, "utf-8"));

  if (!db.clients.some((c) => c.id === TARGET_CLIENT_ID)) {
    throw new Error(`Client ${TARGET_CLIENT_ID} not found in db.json.`);
  }

  // --- Project -------------------------------------------------------
  const alreadyImported = db.projects.some((p) => p.id === PROJECT_ID);
  if (!alreadyImported) {
    db.projects.push({
      id: PROJECT_ID,
      clientId: TARGET_CLIENT_ID,
      name: external.project.packageJson.name,
      appType: external.project.framework === "next" ? "nextjs" : "react",
      repo: `${TARGET_CLIENT_ID.replace("client_", "")}/${external.project.packageJson.name}`,
    });
  }

  // --- Report ----------------------------------------------------------
  // Internal top-level fields are derived/approximated from the external
  // report where there's no 1:1 equivalent (e.g. it has no pass/fail test
  // counts, only coverage + quality findings). The `detailed` block below
  // carries the real, unmodified numbers from the upload.
  const findingCounts = external.summary.findingCounts;
  const approxTestCount = external.summary.testFileCount * 6; // rough tests-per-file estimate

  const recommendations = [
    ...new Set(external.findings.map((f) => f.suggestion)),
  ].slice(0, 4);

  const report = {
    id: rid("report"),
    clientId: TARGET_CLIENT_ID,
    projectId: PROJECT_ID,
    auditExecutionId: rid("exec"),
    timestamp: external.generatedAt,
    trigger: "manual",
    buildId: undefined,
    auditorVersion: "external-import",
    ruleSetVersion: "n/a",
    jestVersion: undefined,
    overallScore: external.scores.overall,
    coverage: {
      statements: Math.round(external.coverage.statements),
      branches: Math.round(external.coverage.branches),
      functions: Math.round(external.coverage.functions),
      lines: Math.round(external.coverage.lines),
    },
    testExecution: {
      total: approxTestCount,
      passed: approxTestCount,
      failed: 0,
      skipped: 0,
      pending: 0,
      durationMs: 45000,
    },
    findings: [],
    dependencyFindings: [],
    migrationFindings: [],
    recommendations,
    executionStatus: "success",
    errors: [],
    durationMs: 45000,
    detailed: {
      scores: external.scores,
      grade: external.summary.grade,
      verdict: external.summary.verdict,
      strategiesRun: external.summary.strategiesRun,
      testFileCount: external.summary.testFileCount,
      findingCounts,
      files: external.coverage.files,
      qualityFindings: external.findings,
      rawOutput: external.coverage.rawOutput,
    },
  };

  // Replace any previously imported report for this project so re-running
  // this script updates rather than duplicates.
  db.reports = db.reports.filter((r) => r.projectId !== PROJECT_ID);
  db.reports.push(report);

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log(`Imported project "${report.projectId}" (${external.project.packageJson.name}) with 1 report into ${DB_PATH}`);
}

main();
