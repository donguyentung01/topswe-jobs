import type { Job, RoleType } from "../../src/lib/types";
import { classifySeason } from "../classify";

const TABLE_ROW_RE =
  /^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/;

function extractUrl(cell: string): string | null {
  const match = cell.match(/href="([^"]+)"/);
  return match ? match[1] : null;
}

function isClosed(cell: string): boolean {
  return cell.includes("\u{1F512}");
}

export function parseSimplifyTable(
  markdown: string,
  defaultRoleType: RoleType
): Omit<Job, "companyTier" | "source" | "id">[] {
  const lines = markdown.split("\n");
  const jobs: Omit<Job, "companyTier" | "source" | "id">[] = [];

  for (const line of lines) {
    const match = line.match(TABLE_ROW_RE);
    if (!match) continue;

    const [, company, role, location, linkCell, dateStr] = match;
    const closed = isClosed(linkCell);
    const applyUrl = extractUrl(linkCell) ?? "";

    jobs.push({
      company: company.trim(),
      role: role.trim(),
      roleType: defaultRoleType,
      location: location.trim(),
      remote: /remote/i.test(location),
      season: classifySeason(role),
      sponsorship: "yes",
      datePosted: dateStr.trim(),
      dateFound: new Date().toISOString().split("T")[0],
      applyUrl,
      salary: null,
      closed,
    });
  }

  return jobs;
}

export async function fetchGitHubRepoJobs(): Promise<
  Omit<Job, "companyTier" | "source" | "id">[]
> {
  const repos = [
    {
      url: "https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/README.md",
      roleType: "intern" as RoleType,
    },
    {
      url: "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/README.md",
      roleType: "newgrad" as RoleType,
    },
  ];

  const allJobs: Omit<Job, "companyTier" | "source" | "id">[] = [];

  for (const repo of repos) {
    const response = await fetch(repo.url);
    if (!response.ok) {
      console.error(`Failed to fetch ${repo.url}: ${response.status}`);
      continue;
    }
    const markdown = await response.text();
    const jobs = parseSimplifyTable(markdown, repo.roleType);
    allJobs.push(...jobs);
  }

  return allJobs;
}
