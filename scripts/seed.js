// Generates data/db.json: seed clients/projects/users plus a run of historical
// audit reports per project, so the dashboard (section 14) has trend data to
// render without needing a live audit-engine run first.
const fs = require("fs");
const path = require("path");

function rid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const clients = [
  { id: "client_northwind", name: "Northwind Retail", createdAt: "2026-02-03T09:00:00.000Z" },
  { id: "client_horizon", name: "Horizon Media", createdAt: "2026-03-11T09:00:00.000Z" },
];

const projects = [
  { id: "proj_atlas_web", clientId: "client_northwind", name: "Atlas Web", appType: "nextjs", repo: "northwind/atlas-web" },
  { id: "proj_northwind_docs", clientId: "client_northwind", name: "Northwind Docs", appType: "react", repo: "northwind/docs-portal" },
  { id: "proj_horizon_app", clientId: "client_horizon", name: "Horizon App", appType: "nextjs", repo: "horizon/horizon-app" },
];

const users = [
  { id: "user_admin", name: "Admin", email: "admin@utcauditor.dev", role: "admin", password: "admin123" },
  { id: "user_dana", name: "Dana Ellery", email: "dana@northwind.example", role: "client", clientId: "client_northwind", password: "demo123" },
  { id: "user_sam", name: "Sam Okafor", email: "sam@horizon.example", role: "client", clientId: "client_horizon", password: "demo123" },
];

const RULES = [
  { id: "RULE-TP-01", category: "Test Presence", title: "Source module has no corresponding unit test", severity: "high" },
  { id: "RULE-TD-01", category: "Test Discovery", title: "Test file not discovered by Jest config", severity: "medium" },
  { id: "RULE-AS-01", category: "Assertions", title: "Test contains no meaningful assertion", severity: "high" },
  { id: "RULE-SK-01", category: "Skipped Tests", title: "Test suite skipped/disabled", severity: "medium" },
  { id: "RULE-FO-01", category: "Focused Tests", title: "Focused (.only) test left in suite", severity: "critical" },
  { id: "RULE-EC-01", category: "Edge Cases", title: "Expected boundary/error scenario untested", severity: "medium" },
  { id: "RULE-MK-01", category: "Mocking", title: "Excessive or ineffective mocking pattern", severity: "low" },
  { id: "RULE-DP-01", category: "Test Duplication", title: "Highly similar test cases detected", severity: "low" },
  { id: "RULE-AI-01", category: "Assertions vs Implementation", title: "Test overly coupled to implementation detail", severity: "medium" },
  { id: "RULE-MT-01", category: "Test Maintainability", title: "Oversized test with repeated setup blocks", severity: "low" },
  { id: "RULE-DT-01", category: "Dead Tests", title: "Test disconnected from current application code", severity: "medium" },
  { id: "RULE-DC-01", category: "Dependency Consistency", title: "Test import missing from package.json", severity: "high" },
];

const FILES = [
  "components/CartSummary.tsx", "components/ProductCard.tsx", "lib/pricing.ts",
  "lib/inventory.ts", "hooks/useCheckout.ts", "app/(shop)/checkout/page.tsx",
  "lib/search/client.ts", "lib/cms/resolveEntry.ts", "components/ExperimentBanner.tsx",
  "lib/render/staticProps.ts", "components/Nav.tsx", "lib/auth/session.ts",
];

const PROJECT_FILES = {
  proj_atlas_web: [
    "components/CartSummary/CartSummary.tsx", "components/CartSummary/index.ts",
    "components/ProductCard/ProductCard.tsx", "components/ProductCard/index.ts",
    "components/CheckoutForm/CheckoutForm.tsx", "components/CheckoutForm/index.ts",
    "components/ExperimentBanner/ExperimentBanner.tsx", "components/ExperimentBanner/index.ts",
    "components/PriceTag/PriceTag.tsx", "components/PriceTag/index.ts",
    "components/AddressForm/AddressForm.tsx", "components/AddressForm/index.ts",
    "components/OrderSummary/OrderSummary.tsx", "components/OrderSummary/index.ts",
    "components/StockBadge/StockBadge.tsx", "components/StockBadge/index.ts",
    "hooks/useCheckout.ts", "hooks/useCart.ts",
    "lib/pricing.ts", "lib/inventory.ts",
    "lib/search/client.ts", "lib/cms/resolveEntry.ts", "lib/auth/session.ts",
  ],
  proj_northwind_docs: [
    "components/SearchBox/SearchBox.tsx", "components/SearchBox/index.ts",
    "components/ArticleCard/ArticleCard.tsx", "components/ArticleCard/index.ts",
    "components/Sidebar/Sidebar.tsx", "components/Sidebar/index.ts",
    "components/TableOfContents/TableOfContents.tsx", "components/TableOfContents/index.ts",
    "components/Breadcrumbs/Breadcrumbs.tsx", "components/Breadcrumbs/index.ts",
    "components/VersionSwitcher/VersionSwitcher.tsx", "components/VersionSwitcher/index.ts",
    "components/CodeBlock/CodeBlock.tsx", "components/CodeBlock/index.ts",
    "lib/markdown.ts", "lib/searchIndex.ts", "lib/navigation.ts", "lib/frontmatter.ts",
  ],
  proj_horizon_app: [
    "components/HeroBanner/HeroBanner.tsx", "components/HeroBanner/index.ts",
    "components/MediaPlayer/MediaPlayer.tsx", "components/MediaPlayer/index.ts",
    "components/FloatingActions/FloatingActions.tsx", "components/FloatingActions/index.ts",
    "components/ExperimentBanner/ExperimentBanner.tsx", "components/ExperimentBanner/index.ts",
    "components/CommentThread/CommentThread.tsx", "components/CommentThread/index.ts",
    "components/ShareSheet/ShareSheet.tsx", "components/ShareSheet/index.ts",
    "components/SubscribeModal/SubscribeModal.tsx", "components/SubscribeModal/index.ts",
    "lib/render/staticProps.ts", "lib/analytics.ts", "lib/api.ts", "lib/utils.ts",
  ],
};

const STRATEGIES_RUN = [
  "real-api-call", "redundant-mock", "title-quality", "readability", "disabled-focused",
  "async-flake", "snapshot-overuse", "rtl-antipattern", "non-deterministic", "debug-leftover",
  "assertion-quality", "duplicate-title", "conditional-logic", "hardcoded-secret", "coverage",
];

const QUALITY_FINDING_TEMPLATES = [
  {
    category: "unused-mock", severity: "warning",
    message: 'Mock "onClose" is created with jest.fn() but never used.',
    suggestion: "Remove unused mocks to keep tests focused and readable.",
  },
  {
    category: "title-quality", severity: "info",
    message: (name) => `Title looks like a function name ("${name}") rather than a behavior description.`,
    suggestion: 'Use descriptive titles, e.g. "returns empty list when the user has no orders".',
    useTitle: true,
  },
  {
    category: "async-flake", severity: "warning",
    message: 'Sleep/wait helper "delay()" often causes flaky timing.',
    suggestion: "Use deterministic waits (waitFor, findBy*, fake timers).",
  },
  {
    category: "rtl-antipattern", severity: "info",
    message: "Heavy getByTestId usage vs accessible queries.",
    suggestion: "Favor role/label/text queries; reserve test ids for truly non-accessible cases.",
  },
  {
    category: "duplicate-title", severity: "info",
    message: "Two tests in this file share the same title.",
    suggestion: "Give each test a distinct, behavior-specific title so failures are easy to locate.",
  },
  {
    category: "snapshot-overuse", severity: "info",
    message: "Large snapshot covers more than the behavior under test.",
    suggestion: "Prefer targeted assertions over broad snapshots for easier-to-diagnose failures.",
  },
];

function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function verdictFor(grade) {
  const map = {
    A: "Strong unit test suite — coverage and quality look healthy.",
    B: "Solid unit test suite with a few areas worth tightening up.",
    C: "Adequate coverage, but quality gaps are starting to accumulate.",
    D: "Test suite needs attention — coverage and quality gaps are notable.",
    F: "Test suite is in poor shape and should be prioritized for remediation.",
  };
  return map[grade];
}

function componentNameFromPath(filePath) {
  const base = filePath.split("/").pop().replace(/\.[jt]sx?$/, "");
  return base === "index" ? filePath.split("/").slice(-2, -1)[0] : base;
}

function seedNum(str, salt) {
  let h = salt + 7;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 100000;
}

function buildDetailedTestQuality({ projectId, index, coverage, overallScore, migrationFindings }) {
  const projectFiles = PROJECT_FILES[projectId] ?? FILES;

  const files = projectFiles.map((filePath, i) => {
    const jitter = (seedNum(filePath, index) % 9) - 4; // -4..4
    const mk = (base) => {
      const pct = Math.max(40, Math.min(100, Math.round(base + jitter)));
      const total = 4 + (seedNum(filePath, index + i) % 60);
      const covered = Math.round((pct / 100) * total);
      return { covered, total, pct };
    };
    return {
      path: filePath,
      statements: mk(coverage.statements),
      branches: mk(coverage.branches),
      functions: mk(coverage.functions),
      lines: mk(coverage.lines),
    };
  });

  const testFiles = projectFiles.filter((f) => !f.endsWith("index.ts"));
  const findingBudget = Math.max(1, 7 - Math.floor(index / 1.5) + (seedNum(projectId, index) % 3));
  const templates = pick(QUALITY_FINDING_TEMPLATES, findingBudget, index + 7);
  const qualityFindings = templates.map((t, i) => {
    const srcFile = pick(testFiles, 1, index + i + 2)[0] ?? testFiles[0];
    const testFile = srcFile.replace(/\.tsx?$/, "").replace(/\.ts$/, "") + ".test.tsx";
    const name = componentNameFromPath(srcFile);
    return {
      category: t.category,
      severity: t.severity,
      file: testFile,
      line: 1 + (seedNum(testFile, i) % 90),
      ...(t.useTitle ? { title: name } : {}),
      message: typeof t.message === "function" ? t.message(name) : t.message,
      suggestion: t.suggestion,
    };
  });

  const findingCounts = qualityFindings.reduce(
    (acc, f) => ({ ...acc, [f.severity]: (acc[f.severity] ?? 0) + 1 }),
    { error: 0, warning: 0, info: 0 }
  );

  const covAvg = Math.round((coverage.statements + coverage.branches + coverage.functions + coverage.lines) / 4);
  const inconsistentMigrations = migrationFindings.filter((m) => m.status !== "active").length;
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

  const scores = {
    overall: clamp(overallScore),
    coverage: clamp(covAvg),
    isolation: clamp(96 - inconsistentMigrations * 4),
    mockHygiene: clamp(96 - findingCounts.warning * 6),
    readability: clamp(90 - findingCounts.info * 1.5),
    titles: clamp(80 - qualityFindings.filter((f) => f.category === "title-quality").length * 4),
    reliability: clamp(94 - findingCounts.warning * 5),
    assertions: clamp(98 - findingCounts.error * 8),
    hygiene: clamp(97 - findingCounts.warning * 3),
  };

  const grade = gradeFromScore(scores.overall);

  const rawOutputLines = testFiles.slice(0, 8).map((f) => {
    const testFile = f.replace(/\.tsx?$/, "").replace(/\.ts$/, "") + ".test.tsx";
    return `PASS ${testFile}`;
  });
  const rawOutput = [
    "> project@0.1.0 test",
    "> jest --coverage --coverageReporters=json-summary --coverageReporters=json --passWithNoTests --watchAll=false",
    "",
    ...rawOutputLines,
    "",
    `Test Suites: ${rawOutputLines.length} passed, ${rawOutputLines.length} total`,
  ].join("\n");

  return {
    scores,
    grade,
    verdict: verdictFor(grade),
    strategiesRun: STRATEGIES_RUN,
    testFileCount: testFiles.length,
    findingCounts,
    files,
    qualityFindings,
    rawOutput,
  };
}

function pick(arr, n, seedOffset = 0) {
  const copy = [...arr];
  const out = [];
  let s = seedOffset || 1;
  for (let i = 0; i < n && copy.length; i++) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function scoreFrom(coverage, findings, execFail) {
  const covAvg = (coverage.statements + coverage.branches + coverage.functions + coverage.lines) / 4;
  const penalty = findings.reduce((sum, f) => {
    return sum + { critical: 14, high: 8, medium: 4, low: 1.5, info: 0 }[f.severity];
  }, 0) + (execFail * 10);
  return Math.max(0, Math.min(100, Math.round(covAvg * 0.6 + 40 - penalty)));
}

function buildReport({ clientId, projectId, index, total, baseCoverage, trendUp, auditorVersion }) {
  const daysAgo = (total - index) * 9;
  const timestamp = new Date(Date.now() - daysAgo * 86400000).toISOString();
  const drift = trendUp ? index * 1.6 : -index * 0.4;
  const coverage = {
    statements: Math.min(97, Math.max(38, Math.round(baseCoverage.statements + drift + (Math.random() * 4 - 2)))),
    branches: Math.min(95, Math.max(30, Math.round(baseCoverage.branches + drift * 0.8 + (Math.random() * 4 - 2)))),
    functions: Math.min(97, Math.max(35, Math.round(baseCoverage.functions + drift + (Math.random() * 4 - 2)))),
    lines: Math.min(97, Math.max(38, Math.round(baseCoverage.lines + drift + (Math.random() * 4 - 2)))),
  };

  const findingCount = Math.max(1, 5 - Math.floor(index / 2) + Math.round(Math.random()));
  const ruleSample = pick(RULES, findingCount, index + 3);
  const findings = ruleSample.map((r, i) => {
    const file = pick(FILES, 1, index + i + 1)[0];
    return {
      id: rid("find"),
      ruleId: r.id,
      ruleVersion: "1.2.0",
      category: r.category,
      title: r.title,
      severity: r.severity,
      detail: `${r.title} in ${file}.`,
      recommendation: recommendationFor(r.category),
      file,
    };
  });

  const total_tests = 180 + index * 6;
  const failed = index === 1 ? 2 : Math.random() < 0.15 ? 1 : 0;
  const skipped = Math.max(0, 6 - index);
  const pending = Math.max(0, 2 - Math.floor(index / 2));

  const dependencyFindings = index % 3 === 0 ? [
    { package: "react-ga", kind: "unused_in_source", detail: "Present in package.json but no application or test references found." },
  ] : [];

  const migrationFindings = buildMigrationFindings(index);

  const execFail = failed > 0 ? 1 : 0;
  const overallScore = scoreFrom(coverage, findings, execFail);

  const recommendations = Array.from(new Set(findings.map((f) => f.recommendation))).slice(0, 4);
  if (dependencyFindings.length) recommendations.push("Confirm react-ga is unused and remove it from package.json.");

  const detailed = buildDetailedTestQuality({
    projectId,
    index,
    coverage,
    overallScore,
    migrationFindings,
  });

  return {
    id: rid("report"),
    clientId,
    projectId,
    auditExecutionId: rid("exec"),
    timestamp,
    trigger: index === total ? "manual" : index % 4 === 0 ? "scheduled" : "production_build",
    buildId: `build-${1000 + index}`,
    auditorVersion,
    ruleSetVersion: "1.2.0",
    jestVersion: "29.7.0",
    overallScore,
    coverage,
    testExecution: {
      total: total_tests,
      passed: total_tests - failed - skipped - pending,
      failed,
      skipped,
      pending,
      durationMs: 14000 + index * 850,
    },
    findings,
    dependencyFindings,
    migrationFindings,
    recommendations,
    executionStatus: failed > 0 ? "completed_with_errors" : "success",
    errors: failed > 0 ? ["2 test(s) failed during execution; see findings for detail."] : [],
    durationMs: 21000 + index * 900,
    detailed,
  };
}

function recommendationFor(category) {
  const map = {
    "Test Presence": "Add unit tests for the uncovered module before the next release.",
    "Test Discovery": "Update the Jest testMatch/testPathIgnorePatterns so the file is picked up.",
    "Assertions": "Add explicit expect() assertions; a passing test with no assertion proves nothing.",
    "Skipped Tests": "Re-enable or remove the skipped suite; track intentional skips with a linked issue.",
    "Focused Tests": "Remove .only before merging — it silently disables the rest of the suite.",
    "Edge Cases": "Add boundary and error-path cases (empty input, network failure, invalid state).",
    "Mocking": "Reduce mock surface area so the test still exercises real integration points.",
    "Test Duplication": "Consolidate near-duplicate tests into a parameterized test.",
    "Assertions vs Implementation": "Assert on observable behavior/output rather than internal implementation details.",
    "Test Maintainability": "Extract shared setup into a fixture/helper to shrink the test body.",
    "Dead Tests": "Confirm the code path still exists; remove the test if the feature was deleted.",
    "Dependency Consistency": "Add the missing package to package.json or replace the import.",
  };
  return map[category] ?? "Review finding and address per team convention.";
}

function buildMigrationFindings(index) {
  const findings = [];
  // CMS: Contentful is active
  findings.push({
    area: "cms",
    packages: ["contentful"],
    status: "active",
    detail: "contentful is referenced in package.json, application code, and covered by unit tests.",
  });
  // Search: legacy Algolia residue fading out as Constructor rolls in
  if (index <= 3) {
    findings.push({
      area: "search",
      packages: ["algoliasearch"],
      status: index === 1 ? "active" : "inconsistent",
      detail: index === 1
        ? "algoliasearch still referenced by application code and tests."
        : "Unit tests still reference algoliasearch mocks, but application source now calls the Constructor client exclusively.",
    });
  } else {
    findings.push({
      area: "search",
      packages: ["@constructor-io/constructorio-client"],
      status: "active",
      detail: "Constructor client is referenced in application code with corresponding test coverage.",
    });
  }
  // A/B testing: Optimizely fully migrated off by later reports
  findings.push({
    area: "ab_testing",
    packages: index >= 5 ? [] : ["optimizely-sdk"],
    status: index >= 5 ? "likely_obsolete" : "inconsistent",
    detail: index >= 5
      ? "No optimizely-sdk references remain in package.json or source; residual test mocks were removed."
      : "optimizely-sdk removed from package.json but ExperimentBanner tests still mock its API.",
  });
  // Rendering
  findings.push({
    area: "rendering",
    packages: ["next"],
    status: "active",
    detail: "Static/ISR rendering paths (getStaticProps/generateStaticParams) have corresponding test coverage.",
  });
  return findings;
}

function generateSeries(clientId, projectId, count, baseCoverage, trendUp, auditorVersion) {
  const reports = [];
  for (let i = 1; i <= count; i++) {
    reports.push(buildReport({ clientId, projectId, index: i, total: count, baseCoverage, trendUp, auditorVersion }));
  }
  return reports;
}

const reports = [
  ...generateSeries("client_northwind", "proj_atlas_web", 7, { statements: 58, branches: 50, functions: 60, lines: 58 }, true, "0.4.2"),
  ...generateSeries("client_northwind", "proj_northwind_docs", 5, { statements: 71, branches: 66, functions: 74, lines: 72 }, true, "0.4.2"),
  ...generateSeries("client_horizon", "proj_horizon_app", 6, { statements: 82, branches: 40, functions: 55, lines: 62 }, false, "0.4.1"),
];

const db = { users, clients, projects, reports };

const outPath = path.join(__dirname, "..", "data", "db.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(db, null, 2));
console.log(`Seeded ${reports.length} reports across ${projects.length} projects into ${outPath}`);
