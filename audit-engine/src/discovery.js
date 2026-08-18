const fs = require("fs");
const path = require("path");

const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", "coverage"]);
const SOURCE_EXT = new Set([".js", ".jsx", ".ts", ".tsx"]);
const TEST_PATTERNS = [/\.test\.[jt]sx?$/, /\.spec\.[jt]sx?$/, /__tests__\/.*\.[jt]sx?$/];

/**
 * FR-04 — walks the client project and classifies files as source vs. test,
 * locates package.json and Jest config, and collects import references used
 * later for dependency-consistency and test-presence checks.
 */
function discoverProject(cwd) {
  const packageJsonPath = path.join(cwd, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error("Unsupported project structure: package.json not found at project root.");
  }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  const jestConfigPath = locateJestConfig(cwd, packageJson);

  const allFiles = [];
  walk(cwd, cwd, allFiles);

  const sourceFiles = [];
  const testFiles = [];
  for (const file of allFiles) {
    const ext = path.extname(file);
    if (!SOURCE_EXT.has(ext)) continue;
    if (TEST_PATTERNS.some((re) => re.test(file))) {
      testFiles.push(file);
    } else {
      sourceFiles.push(file);
    }
  }

  return {
    cwd,
    packageJson,
    jestConfigPath,
    sourceFiles,
    testFiles,
    appType: detectAppType(packageJson),
  };
}

function detectAppType(packageJson) {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (deps.next) return "nextjs";
  if (deps.react) return "react";
  return "unknown";
}

function locateJestConfig(cwd, packageJson) {
  const candidates = ["jest.config.js", "jest.config.ts", "jest.config.mjs", "jest.config.json"];
  for (const file of candidates) {
    const full = path.join(cwd, file);
    if (fs.existsSync(full)) return full;
  }
  if (packageJson.jest) return "package.json#jest";
  return null;
}

function walk(root, dir, acc) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".") continue;
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(root, full, acc);
    } else {
      acc.push(path.relative(root, full));
    }
  }
}

module.exports = { discoverProject };
