import type { Job, Company } from "../../src/lib/types";
import { classifyRoleType, classifySeason } from "../classify";
import { detectSponsorship } from "../sponsorship";

interface GreenhouseJob {
  id: number;
  title: string;
  location: { name: string };
  content: string;
  updated_at: string;
  absolute_url: string;
}

export async function fetchGreenhouseJobs(
  company: Company
): Promise<Omit<Job, "id">[]> {
  if (!company.greenhouseId) return [];

  const url = `https://boards-api.greenhouse.io/v1/boards/${company.greenhouseId}/jobs?content=true`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(
      `Greenhouse ${company.name} (${company.greenhouseId}): ${response.status}`
    );
    return [];
  }

  const data: { jobs: GreenhouseJob[] } = await response.json();
  const jobs: Omit<Job, "id">[] = [];

  for (const gJob of data.jobs) {
    const roleType = classifyRoleType(gJob.title, gJob.content);
    if (!roleType) continue;

    jobs.push({
      company: company.name,
      companyTier: company.tier,
      role: gJob.title,
      roleType,
      location: gJob.location.name,
      remote: /remote/i.test(gJob.location.name),
      season: classifySeason(gJob.title, gJob.updated_at.split("T")[0], roleType),
      sponsorship: detectSponsorship(gJob.content),
      datePosted: gJob.updated_at.split("T")[0],
      dateFound: new Date().toISOString().split("T")[0],
      applyUrl: gJob.absolute_url,
      source: "greenhouse",
      salary: null,
      closed: false,
    });
  }

  return jobs;
}
