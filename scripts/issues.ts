#!/usr/bin/env bun
/**
 * Issues CLI - Project bug/feature tracking
 * Usage: bun scripts/issues.ts <command> [args]
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ISSUES_DIR = join(import.meta.dir, "../.issues");

interface IssueMeta {
  id: string;
  title: string;
  status: string;
  priority: string;
  created: string;
  updated: string;
}

function parseFrontmatter(content: string): { meta: IssueMeta; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Invalid frontmatter");
  }

  const meta: Record<string, string> = {};
  const frontmatterContent = match[1] ?? "";
  for (const line of frontmatterContent.split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      meta[key.trim()] = rest.join(":").trim();
    }
  }
  return { meta: meta as unknown as IssueMeta, body: match[2] ?? "" };
}

function serializeFrontmatter(meta: IssueMeta, body: string): string {
  const lines = [
    "---",
    `id: ${meta.id}`,
    `title: ${meta.title}`,
    `status: ${meta.status}`,
    `priority: ${meta.priority}`,
    `created: ${meta.created}`,
    `updated: ${meta.updated}`,
    "---",
    body,
  ];
  return lines.join("\n");
}

function getAllIssues(): { file: string; meta: IssueMeta }[] {
  const files = readdirSync(ISSUES_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const content = readFileSync(join(ISSUES_DIR, file), "utf-8");
      const { meta } = parseFrontmatter(content);
      return { file, meta };
    })
    .sort((a, b) => a.meta.id.localeCompare(b.meta.id));
}

function list(statusFilter?: string) {
  const issues = getAllIssues();
  const filtered = statusFilter ? issues.filter((t) => t.meta.status === statusFilter) : issues;

  if (filtered.length === 0) {
    console.log("No issues found.");
    return;
  }

  const maxTitle = Math.min(50, Math.max(...filtered.map((t) => t.meta.title.length)));
  console.log(`${"ID".padEnd(4)} ${"Title".padEnd(maxTitle)} ${"Status".padEnd(12)} Priority`);
  console.log("-".repeat(4 + maxTitle + 12 + 10));

  for (const { meta } of filtered) {
    const title = meta.title.length > 50 ? `${meta.title.slice(0, 47)}...` : meta.title;
    console.log(
      `${meta.id.padEnd(4)} ${title.padEnd(maxTitle)} ${meta.status.padEnd(12)} ${meta.priority}`,
    );
  }
}

function show(id: string) {
  const issues = getAllIssues();
  const issue = issues.find((t) => t.meta.id === id.padStart(3, "0"));
  if (!issue) {
    console.log(`Issue ${id} not found.`);
    return;
  }
  const content = readFileSync(join(ISSUES_DIR, issue.file), "utf-8");
  console.log(content);
}

function status(id: string, newStatus: string) {
  const validStatuses = ["pending", "in_progress", "blocked", "review", "done"];
  if (!validStatuses.includes(newStatus)) {
    console.log(`Invalid status. Use: ${validStatuses.join(", ")}`);
    return;
  }

  const paddedId = id.padStart(3, "0");
  const issues = getAllIssues();
  const issue = issues.find((t) => t.meta.id === paddedId);
  if (!issue) {
    console.log(`Issue ${id} not found.`);
    return;
  }

  const filePath = join(ISSUES_DIR, issue.file);
  const content = readFileSync(filePath, "utf-8");
  const { meta, body } = parseFrontmatter(content);

  meta.status = newStatus;
  meta.updated = new Date().toISOString().split("T")[0] ?? "2025-01-01";

  writeFileSync(filePath, serializeFrontmatter(meta, body));
  console.log(`Updated ${paddedId}: status → ${newStatus}`);
}

function create(title: string) {
  const issues = getAllIssues();
  const maxId =
    issues.length > 0 ? Math.max(...issues.map((t) => Number.parseInt(t.meta.id, 10))) : 0;
  const newId = (maxId + 1).toString().padStart(3, "0");
  const today = new Date().toISOString().split("T")[0] ?? "2025-01-01";
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);

  const content = `---
id: ${newId}
title: ${title}
status: pending
priority: medium
created: ${today}
updated: ${today}
---

## Description
<!-- Describe the issue -->

## Acceptance Criteria
- [ ]

## Notes
<!-- Agent notes, findings, blockers go here -->
`;

  const fileName = `${newId}-${slug}.md`;
  writeFileSync(join(ISSUES_DIR, fileName), content);
  console.log(`Created: ${fileName}`);
}

// CLI
const [, , command, ...args] = process.argv;

switch (command) {
  case "list": {
    const statusArg = args.find((a) => a.startsWith("--status="));
    const statusFilter = statusArg?.split("=")[1];
    list(statusFilter);
    break;
  }
  case "show":
    show(args[0] || "");
    break;
  case "status":
    status(args[0] || "", args[1] || "");
    break;
  case "create":
    create(args.join(" ") || "Untitled");
    break;
  default:
    console.log(`Issues CLI - Project bug/feature tracking

Usage:
  bun scripts/issues.ts list [--status=<status>]   List issues
  bun scripts/issues.ts show <id>                  Show issue details
  bun scripts/issues.ts status <id> <status>       Update status
  bun scripts/issues.ts create "<title>"           Create new issue

Statuses: pending, in_progress, blocked, review, done`);
}
