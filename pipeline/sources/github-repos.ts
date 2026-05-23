import type { Job, RoleType } from "../../src/lib/types";
import { classifyRoleType, classifySeason } from "../classify";

interface SimplifyListing {
  source: string;
  company_name: string;
  title: string;
  active: boolean;
  terms: string[];
  date_updated: number;
  date_posted: number;
  url: string;
  locations: string[];
  company_url: string;
  is_visible: boolean;
  sponsorship: string;
  id: string;
  category?: string;
}

function mapSponsorship(
  value: string
): "yes" | "no" | "unknown" {
  if (/does not offer sponsorship/i.test(value)) return "no";
  if (/citizenship.*required/i.test(value)) return "no";
  return "yes";
}

function mapSeason(terms: string[]): string {
  if (!terms || terms.length === 0) return "Unknown";
  const term = terms[0];
  const match = term.match(/^(Summer|Fall|Winter|Spring)\s+(20\d{2})$/i);
  if (match) {
    const season = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    return `${season} ${match[2]}`;
  }
  return "Unknown";
}

export function parseSimplifyJson(
  listings: SimplifyListing[],
  defaultRoleType: RoleType
): Omit<Job, "companyTier" | "source" | "id">[] {
  const jobs: Omit<Job, "companyTier" | "source" | "id">[] = [];

  for (const listing of listings) {
    if (!listing.is_visible) continue;

    const isSwe =
      !listing.category ||
      /software|ai|ml|data|quant/i.test(listing.category);
    if (!isSwe) continue;

    const roleType = classifyRoleType(listing.title, "");
    if (!roleType) continue;
    const location = listing.locations.join("; ") || "Unknown";
    const datePosted = listing.date_posted
      ? new Date(listing.date_posted * 1000).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const season = mapSeason(listing.terms);

    jobs.push({
      company: listing.company_name,
      role: listing.title,
      roleType,
      location,
      remote: /remote/i.test(location),
      season: season !== "Unknown"
        ? season
        : classifySeason(listing.title, datePosted, roleType),
      sponsorship: mapSponsorship(listing.sponsorship ?? ""),
      datePosted,
      dateFound: new Date().toISOString().split("T")[0],
      applyUrl: listing.url || `https://simplify.jobs/p/${listing.id}`,
      salary: null,
      closed: !listing.active,
    });
  }

  return jobs;
}

export async function fetchGitHubRepoJobs(): Promise<
  Omit<Job, "companyTier" | "source" | "id">[]
> {
  const repos = [
    {
      url: "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
      roleType: "intern" as RoleType,
    },
    {
      url: "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json",
      roleType: "newgrad" as RoleType,
    },
  ];

  const allJobs: Omit<Job, "companyTier" | "source" | "id">[] = [];

  for (const repo of repos) {
    let response: Response;
    try {
      response = await fetch(repo.url);
    } catch {
      console.error(`Failed to fetch ${repo.url}: network error`);
      continue;
    }
    if (!response.ok) {
      console.error(`Failed to fetch ${repo.url}: ${response.status}`);
      continue;
    }
    const listings: SimplifyListing[] = await response.json();
    const jobs = parseSimplifyJson(listings, repo.roleType);
    allJobs.push(...jobs);
    console.log(`  ${repo.roleType}: ${listings.length} listings, ${jobs.length} SWE jobs parsed`);
  }

  return allJobs;
}
