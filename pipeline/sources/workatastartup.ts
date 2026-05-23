import type { Job } from "../../src/lib/types";
import { classifyRoleType, classifySeason } from "../classify";

interface WaaSJob {
  id: number;
  title: string;
  applyUrl: string;
  companyName: string;
  companySlug: string;
  location: string;
  jobType: string;
  salary: string | null;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

const SEARCH_QUERIES = [
  "software engineer intern",
  "software intern",
  "new grad software",
  "junior engineer",
  "swe intern",
];

export async function fetchWorkAtAStartupJobs(): Promise<Omit<Job, "id">[]> {
  const seen = new Set<number>();
  const allJobs: Omit<Job, "id">[] = [];

  for (const query of SEARCH_QUERIES) {
    const url = `https://www.workatastartup.com/jobs/search?q=${encodeURIComponent(query)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": BROWSER_UA,
        },
      });
    } catch {
      console.error(`  Work at a Startup "${query}": network error`);
      continue;
    }

    if (!response.ok) {
      console.error(`  Work at a Startup "${query}": ${response.status}`);
      continue;
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      console.error(`  Work at a Startup "${query}": invalid JSON`);
      continue;
    }

    const postings: WaaSJob[] = Array.isArray(data)
      ? data
      : (data as Record<string, unknown>).jobs
        ? ((data as Record<string, unknown>).jobs as WaaSJob[])
        : [];

    for (const posting of postings) {
      if (seen.has(posting.id)) continue;
      seen.add(posting.id);

      const roleType = classifyRoleType(posting.title, "");
      if (!roleType) continue;

      const location = posting.location || "Remote";

      allJobs.push({
        company: posting.companyName,
        companyTier: "YC",
        role: posting.title,
        roleType,
        location,
        remote: /remote/i.test(location),
        season: classifySeason(posting.title),
        sponsorship: "unknown",
        datePosted: new Date().toISOString().split("T")[0],
        dateFound: new Date().toISOString().split("T")[0],
        applyUrl: `https://www.workatastartup.com/jobs/${posting.id}`,
        source: "workatastartup",
        salary: posting.salary ?? null,
        closed: false,
      });
    }
  }

  return allJobs;
}
