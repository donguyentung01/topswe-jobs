import type { Job, RoleType } from "../../src/lib/types";
import { classifyRoleType, classifySeason } from "../classify";

const REPOS = [
  {
    url: "https://raw.githubusercontent.com/jobright-ai/2026-Software-Engineer-Internship/master/README.md",
    defaultRoleType: "intern" as RoleType,
  },
  {
    url: "https://raw.githubusercontent.com/jobright-ai/2026-Software-Engineer-New-Grad/master/README.md",
    defaultRoleType: "newgrad" as RoleType,
  },
];

interface ParsedRow {
  company: string;
  title: string;
  jobUrl: string;
  location: string;
  workModel: string;
  datePosted: string;
}

function parseDate(raw: string): string {
  const match = raw.trim().match(/^(\w+)\s+(\d+)$/);
  if (!match) return new Date().toISOString().split("T")[0];
  const [, month, day] = match;
  const now = new Date();
  const year = now.getFullYear();
  const parsed = new Date(`${month} ${day}, ${year}`);
  if (parsed > now) parsed.setFullYear(year - 1);
  return parsed.toISOString().split("T")[0];
}

function parseMarkdownTable(markdown: string): ParsedRow[] {
  const lines = markdown.split("\n");
  const tableStart = lines.findIndex((l) => l.includes("| Company"));
  if (tableStart === -1) return [];

  const rows: ParsedRow[] = [];
  let lastCompany = "";

  for (let i = tableStart + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) break;

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 5) continue;

    const [companyCell, titleCell, location, workModel, date] = cells;

    let company: string;
    if (companyCell === "↳" || companyCell === "") {
      company = lastCompany;
    } else {
      const companyMatch = companyCell.match(
        /\*\*\[([^\]]+)\]\([^)]*\)\*\*/
      );
      company = companyMatch ? companyMatch[1] : companyCell.replace(/\*/g, "");
      lastCompany = company;
    }

    const titleMatch = titleCell.match(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/);
    if (!titleMatch) continue;

    const title = titleMatch[1];
    const jobUrl = titleMatch[2].split("?")[0];

    rows.push({
      company,
      title,
      jobUrl,
      location,
      workModel,
      datePosted: parseDate(date),
    });
  }

  return rows;
}

export async function fetchJobrightJobs(): Promise<
  Omit<Job, "companyTier" | "id">[]
> {
  const allJobs: Omit<Job, "companyTier" | "id">[] = [];

  for (const repo of REPOS) {
    let response: Response;
    try {
      response = await fetch(repo.url);
    } catch {
      console.error(`  Jobright: failed to fetch ${repo.url}`);
      continue;
    }
    if (!response.ok) {
      console.error(`  Jobright: ${response.status} for ${repo.url}`);
      continue;
    }

    const markdown = await response.text();
    const rows = parseMarkdownTable(markdown);
    let count = 0;

    for (const row of rows) {
      const roleType = classifyRoleType(row.title, "");
      if (!roleType) continue;

      const remote = /remote/i.test(row.workModel);
      const season = classifySeason(row.title, row.datePosted, roleType);

      allJobs.push({
        company: row.company,
        role: row.title,
        roleType,
        location: row.location,
        remote,
        season,
        sponsorship: "unknown",
        datePosted: row.datePosted,
        dateFound: new Date().toISOString().split("T")[0],
        applyUrl: row.jobUrl,
        source: "jobright",
        salary: null,
        closed: false,
      });
      count++;
    }

    console.log(
      `  ${repo.defaultRoleType}: ${rows.length} listings, ${count} SWE jobs parsed`
    );
  }

  return allJobs;
}
