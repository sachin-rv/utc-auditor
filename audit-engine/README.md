# @utc-auditor/cli

The npm package half of the Unit Test Case Auditing Application (sections 5–9
of the requirements spec). It runs inside a **client's** React/Next.js repo,
executes Jest, evaluates unit-test quality rules, and submits a normalized
report to the UTC Auditor backend — the Next.js app in the parent directory.

## Install (in the client repo)

```bash
npm install --save-dev @utc-auditor/cli
```

(Published locally for this proof of concept — point npm at a tarball or a
private registry; see `../README.md` for how this fits together.)

## Configure

Copy `example/utc-auditor.config.example.js` to the client repo root as
`utc-auditor.config.js` and fill in `clientId` / `projectId`. Credentials come
from environment variables — never hard-code them (section 13):

```bash
export UTC_AUDITOR_BACKEND_URL="https://your-deployment.example.com/api/reports"
export UTC_AUDITOR_TOKEN="utc_demo_token_atlas"   # scoped project credential
```

## Wire into the production build (FR-02)

```json
{
  "scripts": {
    "build": "next build && utc-audit run --trigger production_build --build-id $CI_BUILD_ID"
  }
}
```

The CLI exits `0` by default even on audit errors, so a misbehaving auditor
never blocks a deploy unless the team opts in:

```bash
UTC_AUDITOR_STRICT=true utc-audit run --trigger production_build
```

Whether *findings* (not auditor errors) should fail the build is a separate,
explicit policy: `failBuildOnCriticalFindings` in the config (FR-02: "final
policy... shall be treated as a deployment-policy decision").

## Scheduled execution (FR-03)

Run the same command on a cron in CI, independent of the build pipeline:

```yaml
# .github/workflows/utc-audit-scheduled.yml
on:
  schedule:
    - cron: "0 6 * * 1" # weekly
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx utc-audit run --trigger scheduled
        env:
          UTC_AUDITOR_BACKEND_URL: ${{ secrets.UTC_AUDITOR_BACKEND_URL }}
          UTC_AUDITOR_TOKEN: ${{ secrets.UTC_AUDITOR_TOKEN }}
```

## What it does NOT send

Per section 13/22: the package sends audit **metadata and results** (coverage
numbers, rule findings, dependency names, short code snippets/file paths it
already generated) — never the client's full source repository.

## Local output

Every run writes a JSON copy under `.utc-auditor/<reportId>.json` in the
client repo before attempting upload, so a backend outage never loses a
report (section 17, Reliability). Add `.utc-auditor/` to the client's
`.gitignore`.

## Module map

| File | Requirement |
|---|---|
| `src/discovery.js` | FR-04 Project Discovery |
| `src/jestRunner.js` | FR-05 Programmatic Jest Execution, FR-06 Coverage |
| `src/rules.js` | FR-08 Rule Engine, section 7 rules |
| `src/dependencyAnalysis.js` | section 8 package.json analysis |
| `src/migrationAnalysis.js` | section 9 migration analysis |
| `src/report.js` | section 10 report shape, section 11 scoring |
| `src/submit.js` | section 12/13 authenticated submission |
| `src/cli.js` | FR-02/FR-03 build & scheduled entry point |
