import type { Job, RoleType } from "../../src/lib/types";
import { classifyRoleType, classifySeason } from "../classify";

const API_URL =
  "https://api.getro.com/api/v2/collections/89/search/jobs";

const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

interface GetroJob {
  title: string;
  organization: { name: string };
  locations: string[];
  work_mode: string;
  seniority: string | null;
  url: string;
  created_at: number;
  compensation_amount_min_cents: number | null;
  compensation_amount_max_cents: number | null;
  compensation_currency: string | null;
  compensation_period: string | null;
}

function formatSalary(job: GetroJob): string | null {
  const min = job.compensation_amount_min_cents;
  const max = job.compensation_amount_max_cents;
  if (!min && !max) return null;

  const period = job.compensation_period;
  const fmt = (cents: number) => {
    const dollars = cents / 100;
    if (period === "hour") return `$${dollars.toFixed(0)}/hr`;
    if (dollars >= 1000) return `$${(dollars / 1000).toFixed(0)}k`;
    return `$${dollars.toFixed(0)}`;
  };

  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return fmt(min);
  if (max) return fmt(max);
  return null;
}

function seniorityToRoleType(seniority: string | null): RoleType | null {
  if (seniority === "internship") return "intern";
  if (seniority === "entry_level") return "newgrad";
  return null;
}

export async function fetchTechstarsJobs(): Promise<
  Omit<Job, "companyTier" | "id">[]
> {
  const allJobs: Omit<Job, "companyTier" | "id">[] = [];
  let page = 0;
  let total = Infinity;

  while (page * 20 < total) {
    let jobs: GetroJob[];
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          hitsPerPage: 20,
          page,
          filters: {
            seniority: ["internship", "entry_level"],
            job_functions: ["Software Engineering"],
          },
          query: "",
        }),
      });
      if (!res.ok) {
        console.error(`  Techstars: ${res.status} on page ${page}`);
        break;
      }
      const data = await res.json();
      total = data.results?.count ?? 0;
      jobs = data.results?.jobs ?? [];
    } catch (err) {
      console.error(`  Techstars: fetch failed on page ${page}`, err);
      break;
    }

    if (jobs.length === 0) break;

    for (const hit of jobs) {
      const roleFromApi = seniorityToRoleType(hit.seniority);
      const roleType = roleFromApi ?? classifyRoleType(hit.title, "");
      if (!roleType) continue;

      const location = hit.locations?.join(", ") || "Unknown";
      const remote = hit.work_mode === "remote";
      const datePosted = new Date(hit.created_at * 1000)
        .toISOString()
        .split("T")[0];
      const season = classifySeason(hit.title, datePosted, roleType);

      allJobs.push({
        company: hit.organization.name,
        role: hit.title,
        roleType,
        location,
        remote,
        season,
        sponsorship: "unknown",
        datePosted,
        dateFound: new Date().toISOString().split("T")[0],
        applyUrl: hit.url,
        source: "techstars",
        salary: formatSalary(hit),
        closed: false,
      });
    }

    page++;
  }

  return allJobs;
}
