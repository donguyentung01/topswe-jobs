import type { Job, RoleType, Source } from "../../src/lib/types";
import { classifyRoleType, classifySeason } from "../classify";

interface GetroNextJob {
  title: string;
  organization: {
    name: string;
    logoUrl?: string;
  };
  locations: { name: string }[];
  url: string;
  seniority: string | null;
  publishedAt: string;
  jobFunction: string | null;
}

function seniorityToRoleType(seniority: string | null): RoleType | null {
  if (seniority === "internship") return "intern";
  if (seniority === "entry_level") return "newgrad";
  return null;
}

const SWE_FUNCTIONS = new Set([
  "software engineering",
  "data science",
  "devops",
  "it",
]);

export async function fetchGetroHtmlJobs(
  boardUrl: string,
  source: Source
): Promise<Omit<Job, "companyTier" | "id">[]> {
  let html: string;
  try {
    const res = await fetch(boardUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!res.ok) {
      console.error(`  ${source}: ${res.status} for ${boardUrl}`);
      return [];
    }
    html = await res.text();
  } catch (err) {
    console.error(`  ${source}: fetch failed`, err);
    return [];
  }

  const match = html.match(
    /<script\s+id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) {
    console.error(`  ${source}: no __NEXT_DATA__ found`);
    return [];
  }

  let nextData: unknown;
  try {
    nextData = JSON.parse(match[1]);
  } catch {
    console.error(`  ${source}: failed to parse __NEXT_DATA__`);
    return [];
  }

  const jobs = extractJobs(nextData);
  const allJobs: Omit<Job, "companyTier" | "id">[] = [];

  for (const hit of jobs) {
    const fn = (hit.jobFunction || "").toLowerCase();
    if (fn && !SWE_FUNCTIONS.has(fn)) continue;

    const roleFromApi = seniorityToRoleType(hit.seniority);
    const roleType = roleFromApi ?? classifyRoleType(hit.title, "");
    if (!roleType) continue;

    const location =
      hit.locations?.map((l) => l.name).join(", ") || "Unknown";
    const datePosted = hit.publishedAt
      ? hit.publishedAt.split("T")[0]
      : new Date().toISOString().split("T")[0];
    const season = classifySeason(hit.title, datePosted, roleType);

    allJobs.push({
      company: hit.organization.name,
      role: hit.title,
      roleType,
      location,
      remote: location.toLowerCase().includes("remote"),
      season,
      sponsorship: "unknown",
      datePosted,
      dateFound: new Date().toISOString().split("T")[0],
      applyUrl: hit.url,
      source,
      salary: null,
      closed: false,
    });
  }

  return allJobs;
}

function extractJobs(data: unknown): GetroNextJob[] {
  if (!data || typeof data !== "object") return [];

  if (Array.isArray(data)) {
    for (const item of data) {
      if (
        item &&
        typeof item === "object" &&
        "title" in item &&
        "organization" in item &&
        "url" in item
      ) {
        return data as GetroNextJob[];
      }
      const found = extractJobs(item);
      if (found.length > 0) return found;
    }
    return [];
  }

  for (const value of Object.values(data as Record<string, unknown>)) {
    const found = extractJobs(value);
    if (found.length > 0) return found;
  }
  return [];
}
