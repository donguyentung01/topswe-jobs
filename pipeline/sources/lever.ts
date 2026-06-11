import type { Job, Company } from "../../src/lib/types";
import { classifyRoleType, classifySeason } from "../classify";
import { detectSponsorship } from "../sponsorship";

interface LeverJob {
  id: string;
  text: string;
  categories: { location: string; team: string };
  description: string;
  createdAt: number;
  hostedUrl: string;
}

export async function fetchLeverJobs(
  company: Company
): Promise<Omit<Job, "id">[]> {
  if (!company.leverId) return [];

  const url = `https://api.lever.co/v0/postings/${company.leverId}?mode=json`;
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    console.error(`Lever ${company.name} (${company.leverId}): network error -`, (err as Error).message);
    return [];
  }
  if (!response.ok) {
    console.error(
      `Lever ${company.name} (${company.leverId}): ${response.status}`
    );
    return [];
  }

  let postings: LeverJob[];
  try {
    postings = await response.json();
  } catch {
    console.error(`Lever ${company.name}: failed to parse JSON`);
    return [];
  }
  const jobs: Omit<Job, "id">[] = [];

  for (const posting of postings) {
    const roleType = classifyRoleType(posting.text, posting.description);
    if (!roleType) continue;

    jobs.push({
      company: company.name,
      companyTier: company.tier,
      role: posting.text,
      roleType,
      location: posting.categories.location,
      remote: /remote/i.test(posting.categories.location),
      season: classifySeason(posting.text, new Date(posting.createdAt).toISOString().split("T")[0], roleType),
      sponsorship: detectSponsorship(posting.description),
      datePosted: new Date(posting.createdAt).toISOString().split("T")[0],
      dateFound: new Date().toISOString().split("T")[0],
      applyUrl: posting.hostedUrl,
      source: "lever",
      salary: null,
      closed: false,
    });
  }

  return jobs;
}
