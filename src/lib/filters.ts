import type { Job, FilterState, SortMode } from "./types";

export function applyFilters(jobs: Job[], filters: FilterState): Job[] {
  const q = filters.search.toLowerCase();
  return jobs.filter((job) => {
    if (q && !job.company.toLowerCase().includes(q) && !job.role.toLowerCase().includes(q) && !job.location.toLowerCase().includes(q))
      return false;
    if (filters.hideClosed && job.closed) return false;
    if (filters.seasons.length > 0 && !filters.seasons.includes(job.season))
      return false;
    if (
      filters.roleTypes.length > 0 &&
      !filters.roleTypes.includes(job.roleType)
    )
      return false;
    if (filters.tiers.length > 0 && !filters.tiers.includes(job.companyTier))
      return false;
    if (filters.sponsorsOnly && job.sponsorship === "no") return false;
    if (filters.remoteOnly && !job.remote) return false;
    return true;
  });
}

function parseSalaryNum(salary: string | null): number {
  if (!salary) return -1;
  const cleaned = salary.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return -1;
  if (salary.includes("/hr")) return num * 2080;
  if (salary.includes("k")) return num * 1000;
  return num;
}

export function applySort(jobs: Job[], sort: SortMode): Job[] {
  const sorted = [...jobs];
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => b.datePosted.localeCompare(a.datePosted));
      break;
    case "company-az":
      sorted.sort((a, b) => a.company.localeCompare(b.company));
      break;
    case "salary-desc":
      sorted.sort(
        (a, b) => parseSalaryNum(b.salary) - parseSalaryNum(a.salary)
      );
      break;
  }
  return sorted;
}
