const fs = require("fs");
const path = require("path");
const { loadConfig } = require("./config");
const { discoverProject } = require("./discovery");
const { runJest } = require("./jestRunner");
const { runRules } = require("./rules");
const { analyzeDependencies } = require("./dependencyAnalysis");
const { analyzeMigrations } = require("./migrationAnalysis");
const { buildReport } = require("./report");
const { submitReport } = require("./submit");

/**
 * Full pipeline described in section 5 (High-Level Solution Overview):
 * discover project -> run Jest -> apply rules/dependency/migration analysis
 * -> build normalized report -> persist locally -> submit to backend.
 *
 * Always writes the report to disk before attempting upload, so a backend
 * outage never loses local audit results (section 17, Reliability).
 */
async function runAudit({ cwd = process.cwd(), trigger = "manual", buildId } = {}) {
  const config = loadConfig(cwd);

  if (!config.projectId || !config.clientId) {
    throw new Error(
      "Invalid project configuration: clientId and projectId must be set in utc-auditor.config.js."
    );
  }

  const project = discoverProject(cwd);
  const jestOutcome = runJest(cwd, config);
  const findings = runRules(project, config);
  const dependencyFindings = analyzeDependencies(project);
  const migrationFindings = analyzeMigrations(project, config);

  const report = buildReport({
    project,
    config,
    trigger,
    buildId,
    jestOutcome,
    findings,
    dependencyFindings,
    migrationFindings,
  });

  const outDir = path.join(cwd, ".utc-auditor");
  fs.mkdirSync(outDir, { recursive: true });
  const localPath = path.join(outDir, `${report.id}.json`);
  fs.writeFileSync(localPath, JSON.stringify(report, null, 2));

  const submission = await submitReport(report, config);

  return { report, localPath, submission };
}

module.exports = { runAudit };
