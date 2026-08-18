// Copy this file to the root of the client repository as
// `utc-auditor.config.js`. Section 15 (Recommended Client Integration
// Approach): the auditor is an explicit, versioned build integration, not
// runtime injection — this file is committed and reviewed like any other
// build config.
module.exports = {
  clientId: "client_northwind",
  projectId: "proj_atlas_web",

  // Section 13: never hard-code credentials. Supply via CI secret store.
  backendUrl: process.env.UTC_AUDITOR_BACKEND_URL,
  authToken: process.env.UTC_AUDITOR_TOKEN,

  // FR-02: build-failure policy is a deployment decision, not an auditor
  // default.
  failBuildOnCriticalFindings: false,

  // FR-07: coverage benchmark bands, configurable per client engineering
  // targets rather than a universal standard.
  coverageBands: { critical: 60, needsImprovement: 80, good: 90 },

  // Section 9: extend or override known packages per migration area.
  migrationPackages: {
    cms: ["contentful"],
    search: ["@constructor-io/constructorio-client", "algoliasearch"],
    ab_testing: ["optimizely-sdk"],
    rendering: ["next", "react-dom"],
  },
};
