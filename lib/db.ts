import fs from "fs";
import path from "path";
import type { DB, AuditReport } from "./types";

/**
 * Section 12/20 note: backend + database technology are TBD in the requirements
 * spec. This module stands in for that persistence layer with a JSON file so
 * the dashboard and API contracts can be built, exercised, and swapped onto a
 * real database (Postgres, etc.) later without changing route handlers.
 */

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function readDB(): DB {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DB;
}

function writeDB(db: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function getDB(): DB {
  return readDB();
}

export function listClients() {
  return readDB().clients;
}

export function getClient(clientId: string) {
  return readDB().clients.find((c) => c.id === clientId) ?? null;
}

export function listProjectsForClient(clientId: string) {
  return readDB().projects.filter((p) => p.clientId === clientId);
}

export function listReportsForClient(clientId: string): AuditReport[] {
  return readDB()
    .reports.filter((r) => r.clientId === clientId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getReport(reportId: string): AuditReport | null {
  return readDB().reports.find((r) => r.id === reportId) ?? null;
}

export function findUserByEmail(email: string) {
  return readDB().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function findUserById(id: string) {
  return readDB().users.find((u) => u.id === id) ?? null;
}

// Report validation happens in the API route (schema-level, section 12: "Validate
// submitted report schema and reject malformed or unauthorized submissions").
export function insertReport(report: AuditReport) {
  const db = readDB();
  db.reports.push(report);
  writeDB(db);
  return report;
}

export function clientOwnsProject(clientId: string, projectId: string) {
  const db = readDB();
  return db.projects.some((p) => p.id === projectId && p.clientId === clientId);
}
