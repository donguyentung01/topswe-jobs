import fs from "fs";
import path from "path";
import type { Job, Company } from "../src/lib/types";
import { fetchGitHubRepoJobs } from "./sources/github-repos";
import { fetchGreenhouseJobs } from "./sources/greenhouse";
import { fetchLeverJobs } from "./sources/lever";
import { fetchWorkAtAStartupJobs } from "./sources/workatastartup";
import { fetchJobrightJobs } from "./sources/jobright";
import { fetchTechstarsJobs } from "./sources/techstars";
import { fetchGetroHtmlJobs } from "./sources/getro-html";
import { deduplicateJobs } from "./dedup";
import { normalizeCompany, isUSLocation, isCurrentSeason } from "./utils";

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
  try {
    const githubJobs = await fetchGitHubRepoJobs();
    let matchedCount = 0;
    for (const job of githubJobs) {
      const key = normalizeCompany(job.company);
      const company = companyMap.get(key);
      if (company) matchedCount++;
      allRawJobs.push({
        ...job,
        companyTier: company?.tier ?? "Other",
        source: "github",
      });
    }
    console.log(
      `  Found ${githubJobs.length} jobs, ${matchedCount} matched known companies, ${githubJobs.length - matchedCount} as Other`
    );
  } catch (err) {
    console.error(`  GitHub repos failed:`, (err as Error).message);
  }

  // 2. Greenhouse
  console.log("Fetching from Greenhouse...");
  const greenhouseCompanies = companies.filter(
    (c) => c.ats === "greenhouse" && c.greenhouseId
  );
  let ghCount = 0;
  for (const company of greenhouseCompanies) {
    try {
      const jobs = await fetchGreenhouseJobs(company);
      allRawJobs.push(...jobs);
      ghCount += jobs.length;
    } catch (err) {
      console.error(`  Greenhouse ${company.name} failed:`, (err as Error).message);
    }
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
    try {
      const jobs = await fetchLeverJobs(company);
      allRawJobs.push(...jobs);
      leverCount += jobs.length;
    } catch (err) {
      console.error(`  Lever ${company.name} failed:`, (err as Error).message);
    }
  }
  console.log(
    `  Found ${leverCount} intern/new-grad jobs from ${leverCompanies.length} companies`
  );

  // 4. Work at a Startup
  console.log("Fetching from Work at a Startup...");
  try {
    const waasJobs = await fetchWorkAtAStartupJobs();
    allRawJobs.push(...waasJobs);
    console.log(`  Found ${waasJobs.length} YC jobs`);
  } catch (err) {
    console.error(`  Work at a Startup failed:`, (err as Error).message);
  }

  // 5. Jobright.ai
  console.log("Fetching from Jobright.ai...");
  try {
    const jobrightJobs = await fetchJobrightJobs();
    for (const job of jobrightJobs) {
      const key = normalizeCompany(job.company);
      const company = companyMap.get(key);
      allRawJobs.push({
        ...job,
        companyTier: company?.tier ?? "Other",
      });
    }
    console.log(`  Found ${jobrightJobs.length} SWE jobs`);
  } catch (err) {
    console.error(`  Jobright.ai failed:`, (err as Error).message);
  }

  // 6. Techstars
  console.log("Fetching from Techstars...");
  try {
    const techstarsJobs = await fetchTechstarsJobs();
    for (const job of techstarsJobs) {
      const key = normalizeCompany(job.company);
      const company = companyMap.get(key);
      allRawJobs.push({
        ...job,
        companyTier: company?.tier ?? "Other",
      });
    }
    console.log(`  Found ${techstarsJobs.length} SWE jobs`);
  } catch (err) {
    console.error(`  Techstars failed:`, (err as Error).message);
  }

  // 7. Antler
  console.log("Fetching from Antler...");
  try {
    const antlerJobs = await fetchGetroHtmlJobs(
      "https://careers.antler.co/jobs",
      "antler"
    );
    for (const job of antlerJobs) {
      const key = normalizeCompany(job.company);
      const company = companyMap.get(key);
      allRawJobs.push({
        ...job,
        companyTier: company?.tier ?? "Other",
      });
    }
    console.log(`  Found ${antlerJobs.length} SWE jobs`);
  } catch (err) {
    console.error(`  Antler failed:`, (err as Error).message);
  }

  // 8. Entrepreneur First
  console.log("Fetching from Entrepreneur First...");
  try {
    const efJobs = await fetchGetroHtmlJobs(
      "https://portfolio.joinef.com/jobs",
      "ef"
    );
    for (const job of efJobs) {
      const key = normalizeCompany(job.company);
      const company = companyMap.get(key);
      allRawJobs.push({
        ...job,
        companyTier: company?.tier ?? "Other",
      });
    }
    console.log(`  Found ${efJobs.length} SWE jobs`);
  } catch (err) {
    console.error(`  Entrepreneur First failed:`, (err as Error).message);
  }

  // Filter to US-only locations
  const usJobs = allRawJobs.filter((job) => isUSLocation(job.location));
  console.log(
    `  ${allRawJobs.length} -> ${usJobs.length} after US-only filter`
  );

  // Filter to current/future seasons only (Fall 2026+)
  const currentJobs = usJobs.filter((job) => isCurrentSeason(job.season));
  console.log(
    `  ${usJobs.length} -> ${currentJobs.length} after season filter (Fall 2026+)`
  );

  // Assign IDs
  const jobsWithIds: Job[] = currentJobs.map((job) => ({
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

  // Final safeguard: ensure no duplicate IDs (causes React key collisions)
  const seenIds = new Set<string>();
  const uniqueJobs = finalDeduped.filter((j) => {
    if (seenIds.has(j.id)) return false;
    seenIds.add(j.id);
    return true;
  });
  if (uniqueJobs.length < finalDeduped.length) {
    console.log(
      `  ${finalDeduped.length} -> ${uniqueJobs.length} after ID dedup`
    );
  }

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(uniqueJobs, null, 2));
  console.log(`\nDone! Wrote ${uniqueJobs.length} jobs to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
