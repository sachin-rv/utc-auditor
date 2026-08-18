#!/usr/bin/env node
const { runAudit } = require("./index");

/**
 * FR-02/FR-03 — invoked automatically as part of the production build
 * (e.g. wired into `npm run build`) or on a schedule via CI. Returns a
 * controlled exit status so audit failures can be distinguished from
 * application build failures, without deciding on its own whether that
 * should fail the pipeline (that's the build-failure policy in config).
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "run";

  if (command !== "run") {
    console.error(`Unknown command "${command}". Usage: utc-audit run [--trigger production_build|scheduled|manual] [--build-id <id>]`);
    process.exit(2);
  }

  const trigger = flagValue(args, "--trigger") || "manual";
  const buildId = flagValue(args, "--build-id");

  try {
    const { report, localPath, submission } = await runAudit({ trigger, buildId });

    console.log(`[utc-audit] Report ${report.id} generated (score ${report.overallScore}/100).`);
    console.log(`[utc-audit] Local copy: ${localPath}`);

    if (submission.ok) {
      console.log(`[utc-audit] Uploaded successfully (audit execution ${submission.auditExecutionId}).`);
    } else {
      console.warn(`[utc-audit] Upload failed: ${submission.error}`);
      console.warn(`[utc-audit] Report was still saved locally at ${localPath}.`);
    }

    const config = require("./config").loadConfig();
    const hasCritical = report.findings.some((f) => f.severity === "critical");
    if (config.failBuildOnCriticalFindings && hasCritical) {
      console.error("[utc-audit] Critical findings detected and failBuildOnCriticalFindings is enabled.");
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error(`[utc-audit] Audit failed: ${err.message}`);
    // Exit 0 by default so a misconfigured auditor never blocks an
    // application build unless the team has opted into strict failure.
    process.exit(process.env.UTC_AUDITOR_STRICT === "true" ? 1 : 0);
  }
}

function flagValue(args, name) {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : undefined;
}

main();
