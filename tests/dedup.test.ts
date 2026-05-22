import { describe, it, expect } from "vitest";
import { deduplicateJobs } from "../pipeline/dedup";
import type { Job } from "../src/lib/types";

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "test-1",
    company: "Google",
    companyTier: "FAANG",
    role: "SWE Intern, Summer 2026",
    roleType: "intern",
    location: "Mountain View, CA",
    remote: false,
    season: "Summer 2026",
    sponsorship: "yes",
    datePosted: "2026-05-20",
    dateFound: "2026-05-20",
    applyUrl: "https://careers.google.com/jobs/123",
    source: "greenhouse",
    salary: null,
    closed: false,
    ...overrides,
  };
}

describe("deduplicateJobs", () => {
  it("removes exact duplicates", () => {
    const jobs = [makeJob({ id: "a" }), makeJob({ id: "b" })];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(1);
  });

  it("keeps the entry with more metadata", () => {
    const jobs = [
      makeJob({ id: "a", salary: null, source: "github" }),
      makeJob({ id: "b", salary: "$50/hr", source: "greenhouse" }),
    ];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(1);
    expect(result[0].salary).toBe("$50/hr");
  });

  it("handles title normalization (ignores season suffix)", () => {
    const jobs = [
      makeJob({ id: "a", role: "Software Engineer Intern" }),
      makeJob({ id: "b", role: "Software Engineer Intern, Summer 2026" }),
    ];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(1);
  });

  it("keeps jobs from different companies", () => {
    const jobs = [
      makeJob({ id: "a", company: "Google" }),
      makeJob({ id: "b", company: "Meta" }),
    ];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(2);
  });

  it("keeps jobs with different locations", () => {
    const jobs = [
      makeJob({ id: "a", location: "Mountain View, CA" }),
      makeJob({ id: "b", location: "New York, NY" }),
    ];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(2);
  });
});
