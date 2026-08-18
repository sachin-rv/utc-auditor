/**
 * Section 12/13 — submits the report over HTTPS with a scoped project
 * credential. Backend failures are surfaced clearly rather than silently
 * dropped (section 17 Reliability: "A temporary backend failure should not
 * corrupt the generated local report").
 */
async function submitReport(report, config) {
  if (!config.authToken) {
    return { ok: false, error: "Authentication failure: no project credential configured (UTC_AUDITOR_TOKEN)." };
  }
  if (!config.backendUrl) {
    return { ok: false, error: "Backend unavailable: no backendUrl configured." };
  }

  try {
    const res = await fetch(config.backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.authToken}`,
      },
      body: JSON.stringify(report),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: `Report validation/upload failed (${res.status}): ${body.error ?? res.statusText}` };
    }

    const body = await res.json();
    return { ok: true, reportId: body.reportId, auditExecutionId: body.auditExecutionId };
  } catch (err) {
    return { ok: false, error: `Backend unavailable: ${err.message}` };
  }
}

module.exports = { submitReport };
