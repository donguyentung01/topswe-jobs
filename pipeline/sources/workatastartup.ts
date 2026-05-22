import type { Job } from "../../src/lib/types";
import { classifyRoleType, classifySeason } from "../classify";
import { detectSponsorship } from "../sponsorship";

interface WaaSJob {
  id: number;
  title: string;
  url: string;
  company_name: string;
  location: string;
  description: string;
  created_at: string;
  remote: boolean;
}

export async function fetchWorkAtAStartupJobs(): Promise<Omit<Job, "id">[]> {
  const allJobs: Omit<Job, "id">[] = [];
  let page = 1;
  const maxPages = 10;

  while (page <= maxPages) {
    const url = `https://www.workatastartup.com/companies/jobs?page=${page}&applicant_type=software_engineer&role_type=intern,new_grad`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "TopSWE-Jobs-Bot/1.0",
        },
      });
    } catch {
      console.error(`Work at a Startup page ${page}: network error`);
      break;
    }

    if (!response.ok) {
      console.error(`Work at a Startup page ${page}: ${response.status}`);
      break;
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      console.error(`Work at a Startup page ${page}: invalid JSON`);
      break;
    }

    const postings: WaaSJob[] = Array.isArray(data)
      ? data
      : (data as Record<string, unknown>).jobs
        ? ((data as Record<string, unknown>).jobs as WaaSJob[])
        : [];

    if (postings.length === 0) break;

    for (const posting of postings) {
      const roleType = classifyRoleType(
        posting.title,
        posting.description ?? ""
      );
      if (!roleType) continue;

      allJobs.push({
        company: posting.company_name,
        companyTier: "YC",
        role: posting.title,
        roleType,
        location: posting.location ?? "Remote",
        remote: posting.remote ?? /remote/i.test(posting.location ?? ""),
        season: classifySeason(posting.title),
        sponsorship: detectSponsorship(posting.description ?? ""),
        datePosted:
          posting.created_at?.split("T")[0] ??
          new Date().toISOString().split("T")[0],
        dateFound: new Date().toISOString().split("T")[0],
        applyUrl:
          posting.url ??
          `https://www.workatastartup.com/jobs/${posting.id}`,
        source: "workatastartup",
        salary: null,
        closed: false,
      });
    }

    page++;
  }

  return allJobs;
}
