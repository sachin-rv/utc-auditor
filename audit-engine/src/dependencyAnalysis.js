const fs = require("fs");
const path = require("path");

/**
 * Section 8 — cross-checks package.json against actual source and test
 * imports before classifying anything as unused/missing, per: "Cross-check
 * package.json against source-code imports/references before classifying a
 * package as unused."
 */
function analyzeDependencies(project) {
  const declared = new Set([
    ...Object.keys(project.packageJson.dependencies || {}),
    ...Object.keys(project.packageJson.devDependencies || {}),
  ]);

  const sourceImports = collectImports(project, project.sourceFiles);
  const testImports = collectImports(project, project.testFiles);
  const allImports = new Set([...sourceImports, ...testImports]);

  const findings = [];

  for (const pkg of declared) {
    if (isFrameworkOrToolingPackage(pkg)) continue;
    if (!allImports.has(pkg) && !hasImportUnderScope(allImports, pkg)) {
      findings.push({
        package: pkg,
        kind: "unused_in_source",
        detail: "Present in package.json but no application or test references found.",
      });
    }
  }

  for (const imp of testImports) {
    if (isRelativeImport(imp)) continue;
    if (!declared.has(imp) && !isDeclaredScope(declared, imp)) {
      findings.push({
        package: imp,
        kind: "referenced_missing_from_manifest",
        detail: "Referenced by test files but absent from package.json dependencies.",
      });
    }
  }

  return findings;
}

function collectImports(project, files) {
  const importRe = /\bfrom\s+['"]([^'"]+)['"]|\brequire\(\s*['"]([^'"]+)['"]\s*\)/g;
  const found = new Set();
  for (const rel of files) {
    const full = path.join(project.cwd, rel);
    let src;
    try {
      src = fs.readFileSync(full, "utf-8");
    } catch {
      continue;
    }
    let match;
    while ((match = importRe.exec(src))) {
      const spec = match[1] || match[2];
      if (spec) found.add(normalizePackageSpecifier(spec));
    }
  }
  return found;
}

function normalizePackageSpecifier(spec) {
  if (spec.startsWith(".") || spec.startsWith("/")) return spec;
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function isRelativeImport(spec) {
  return spec.startsWith(".") || spec.startsWith("/");
}

function hasImportUnderScope(imports, pkg) {
  return [...imports].some((i) => i === pkg || i.startsWith(`${pkg}/`));
}

function isDeclaredScope(declared, pkg) {
  return [...declared].some((d) => pkg.startsWith(`${d}/`));
}

function isFrameworkOrToolingPackage(pkg) {
  // Tooling/type packages are frequently config-only and not directly
  // imported; excluded from "unused" heuristics to reduce false positives.
  return /^(eslint|prettier|typescript|@types\/|jest|babel-|@babel\/|postcss|tailwindcss|autoprefixer)/.test(
    pkg
  );
}

module.exports = { analyzeDependencies };
