const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG = {
  // FR-01: client/project identification, backend endpoint, auth, rule
  // behavior, execution behavior — all configurable per the spec.
  clientId: null,
  projectId: null,
  backendUrl: process.env.UTC_AUDITOR_BACKEND_URL || "http://localhost:3000/api/reports",
  authToken: process.env.UTC_AUDITOR_TOKEN || null,

  // FR-07: benchmark bands are configurable, not hard-coded.
  coverageBands: { critical: 60, needsImprovement: 80, good: 90 },

  // FR-05: run the suite, or read an existing coverage artifact from the
  // build instead of re-running Jest (useful when `next build`/CI already
  // produced coverage/coverage-final.json).
  jestCommand: "npx jest --json --coverage --coverageReporters=json-summary --coverageReporters=json",
  useExistingCoverage: false,
  coverageArtifactPath: "coverage/coverage-final.json",

  // FR-02: whether a failed audit should fail the production build. This is
  // explicitly a deployment-policy decision per the spec, default = false.
  failBuildOnCriticalFindings: false,

  // Section 9: known package identities per migration area. Extend/override
  // via utc-auditor.config.js in the client repo.
  migrationPackages: {
    cms: ["contentful", "@strapi/strapi", "strapi-sdk-plugin"],
    search: ["@constructor-io/constructorio-client", "algoliasearch", "@algolia/client-search"],
    ab_testing: ["optimizely-sdk", "@optimizely/react-sdk", "@amplitude/experiment-js-client"],
    rendering: ["next", "react-dom"],
  },

  // Section 13: never transmit full source; only these globs are read for
  // static analysis and nothing is uploaded verbatim in the report.
  include: ["**/*.{js,jsx,ts,tsx}"],
  exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**"],

  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};

function loadConfig(cwd = process.cwd()) {
  const candidates = ["utc-auditor.config.js", "utc-auditor.config.json"];
  let userConfig = {};
  for (const file of candidates) {
    const full = path.join(cwd, file);
    if (fs.existsSync(full)) {
      userConfig = file.endsWith(".json")
        ? JSON.parse(fs.readFileSync(full, "utf-8"))
        : require(full);
      break;
    }
  }
  return deepMerge(DEFAULT_CONFIG, userConfig);
}

function deepMerge(base, override) {
  const out = { ...base };
  for (const key of Object.keys(override || {})) {
    if (
      typeof override[key] === "object" &&
      !Array.isArray(override[key]) &&
      override[key] !== null &&
      typeof base[key] === "object"
    ) {
      out[key] = deepMerge(base[key], override[key]);
    } else {
      out[key] = override[key];
    }
  }
  return out;
}

module.exports = { loadConfig, DEFAULT_CONFIG };
