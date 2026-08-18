const fs = require("fs");
const path = require("path");

/**
 * Section 9 — identifies migration-area packages from package.json, then
 * checks whether application source and unit tests still reference them.
 * Distinguishes a detected inconsistency from a definitive "no longer
 * required" claim, per the spec's explicit caution on that point.
 */
function analyzeMigrations(project, config) {
  const declared = new Set([
    ...Object.keys(project.packageJson.dependencies || {}),
    ...Object.keys(project.packageJson.devDependencies || {}),
  ]);

  const sourceText = readAll(project, project.sourceFiles);
  const testText = readAll(project, project.testFiles);

  return Object.entries(config.migrationPackages).map(([area, candidatePackages]) => {
    const declaredInArea = candidatePackages.filter((p) => declared.has(p));
    const referencedInSource = candidatePackages.filter((p) => sourceText.includes(p));
    const referencedInTests = candidatePackages.filter((p) => testText.includes(p));

    let status = "active";
    let detail;

    if (declaredInArea.length === 0 && (referencedInSource.length || referencedInTests.length)) {
      status = "likely_obsolete";
      detail = `${area} package(s) are referenced in ${
        referencedInTests.length ? "tests" : "source"
      } but not present in package.json; likely migration residue pending cleanup.`;
    } else if (declaredInArea.length > 0 && referencedInSource.length === 0) {
      status = "inconsistent";
      detail = `${declaredInArea.join(", ")} declared in package.json but no application source references were found.`;
    } else if (declaredInArea.length > 0 && referencedInTests.length === 0 && referencedInSource.length > 0) {
      status = "inconsistent";
      detail = `${declaredInArea.join(", ")} is used in application code but has no corresponding unit-test coverage.`;
    } else if (declaredInArea.length > 0) {
      status = "active";
      detail = `${declaredInArea.join(", ")} referenced consistently across package.json, source, and tests.`;
    } else {
      status = "active";
      detail = `No ${area.replace("_", " ")} packages detected; nothing to reconcile.`;
    }

    return {
      area,
      packages: declaredInArea.length ? declaredInArea : referencedInSource.length ? referencedInSource : referencedInTests,
      status,
      detail,
    };
  });
}

function readAll(project, files) {
  let combined = "";
  for (const rel of files) {
    const full = path.join(project.cwd, rel);
    try {
      combined += fs.readFileSync(full, "utf-8");
    } catch {
      // ignore unreadable file
    }
  }
  return combined;
}

module.exports = { analyzeMigrations };
