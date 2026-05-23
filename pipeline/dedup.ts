import type { Job } from "../src/lib/types";
import { normalizeTitle, normalizeCompany } from "./utils";

function normalizeLocation(loc: string): string {
  return loc
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/[,\-–—/:;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupKey(job: Job): string {
  const company = normalizeCompany(job.company);
  const role = normalizeTitle(job.role)
    .replace(/\b(summer|fall|winter|spring)\s+\d{4}\b/g, "")
    .trim();
  const location = normalizeLocation(job.location);
  return `${company}|${role}|${location}`;
}

function metadataScore(job: Job): number {
  let score = 0;
  if (job.salary) score += 2;
  if (job.datePosted) score += 1;
  if (job.sponsorship !== "unknown") score += 1;
  if (job.season !== "Unknown") score += 1;
  return score;
}

export function deduplicateJobs(jobs: Job[]): Job[] {
  const seen = new Map<string, Job>();

  for (const job of jobs) {
    const key = dedupKey(job);
    const existing = seen.get(key);

    if (!existing || metadataScore(job) > metadataScore(existing)) {
      seen.set(key, job);
    }
  }

  return Array.from(seen.values());
}
