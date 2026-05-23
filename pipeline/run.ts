import fs from "fs";
import path from "path";
import type { Job, Company } from "../src/lib/types";
import { fetchGitHubRepoJobs } from "./sources/github-repos";
import { fetchGreenhouseJobs } from "./sources/greenhouse";
import { fetchLeverJobs } from "./sources/lever";
import { fetchWorkAtAStartupJobs } from "./sources/workatastartup";
import { deduplicateJobs } from "./dedup";
import { normalizeCompany, isUSLocation } from "./utils";

const DATA_DIR = path.join(process.cwd(), "data");
const COMPANIES_PATH = path.join(DATA_DIR, "companies.json");
const OUTPUT_PATH = path.join(DATA_DIR, "jobs.json");

function loadCompanies(): Company[] {
  return JSON.parse(fs.readFileSync(COMPANIES_PATH, "utf-8"));
}

function loadExistingJobs(): Job[] {
  if (!fs.existsSync(OUTPUT_PATH)) return [];
  return JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
}

function generateId(job: Omit<Job, "id">): string {
  return `${normalizeCompany(job.company)}-${job.role}-${job.location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80);
}

async function main() {
  console.log("Starting pipeline...");
  const companies = loadCompanies();
  const existingJobs = loadExistingJobs();

  const companyMap = new Map<string, Company>();
  for (const c of companies) {
    companyMap.set(normalizeCompany(c.name), c);
  }

  const allRawJobs: Omit<Job, "id">[] = [];

  // 1. GitHub repos
  console.log("Fetching from GitHub repos...");
  const githubJobs = await fetchGitHubRepoJobs();
  let matchedCount = 0;
  for (const job of githubJobs) {
    const key = normalizeCompany(job.company);
    const company = companyMap.get(key);
    if (company) {
      allRawJobs.push({
        ...job,
        companyTier: company.tier,
        source: "github",
      });
      matchedCount++;
    }
  }
  console.log(
    `  Found ${githubJobs.length} jobs, ${matchedCount} matched known companies`
  );

  // 2. Greenhouse
  console.log("Fetching from Greenhouse...");
  const greenhouseCompanies = companies.filter(
    (c) => c.ats === "greenhouse" && c.greenhouseId
  );
  let ghCount = 0;
  for (const company of greenhouseCompanies) {
    const jobs = await fetchGreenhouseJobs(company);
    allRawJobs.push(...jobs);
    ghCount += jobs.length;
  }
  console.log(
    `  Found ${ghCount} intern/new-grad jobs from ${greenhouseCompanies.length} companies`
  );

  // 3. Lever
  console.log("Fetching from Lever...");
  const leverCompanies = companies.filter(
    (c) => c.ats === "lever" && c.leverId
  );
  let leverCount = 0;
  for (const company of leverCompanies) {
    const jobs = await fetchLeverJobs(company);
    allRawJobs.push(...jobs);
    leverCount += jobs.length;
  }
  console.log(
    `  Found ${leverCount} intern/new-grad jobs from ${leverCompanies.length} companies`
  );

  // 4. Work at a Startup
  console.log("Fetching from Work at a Startup...");
  const waasJobs = await fetchWorkAtAStartupJobs();
  allRawJobs.push(...waasJobs);
  console.log(`  Found ${waasJobs.length} YC jobs`);

  // Filter to US-only locations
  const usJobs = allRawJobs.filter((job) => isUSLocation(job.location));
  console.log(
    `  ${allRawJobs.length} -> ${usJobs.length} after US-only filter`
  );

  // Assign IDs
  const jobsWithIds: Job[] = usJobs.map((job) => ({
    ...job,
    id: generateId(job),
  }));

  // Deduplicate
  console.log("Deduplicating...");
  const deduped = deduplicateJobs(jobsWithIds);
  console.log(`  ${jobsWithIds.length} -> ${deduped.length} after dedup`);

  // Detect closed: mark jobs from previous run that are no longer present
  const newIds = new Set(deduped.map((j) => j.id));
  const closedFromPrevious = existingJobs
    .filter((j) => !j.closed && !newIds.has(j.id))
    .map((j) => ({ ...j, closed: true }));

  // Merge: new jobs + newly closed jobs (keep closed for 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().split("T")[0];

  const previousClosed = existingJobs.filter(
    (j) => j.closed && j.dateFound >= cutoff
  );

  const finalJobs = [...deduped, ...closedFromPrevious, ...previousClosed];
  const finalDeduped = deduplicateJobs(finalJobs);

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalDeduped, null, 2));
  console.log(`\nDone! Wrote ${finalDeduped.length} jobs to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
