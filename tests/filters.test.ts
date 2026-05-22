import { describe, it, expect } from "vitest";
import { applyFilters, applySort } from "../src/lib/filters";
import type { Job, FilterState } from "../src/lib/types";
import { DEFAULT_FILTER_STATE } from "../src/lib/constants";

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "test-1",
    company: "Google",
    companyTier: "FAANG",
    role: "SWE Intern",
    roleType: "intern",
    location: "Mountain View, CA",
    remote: false,
    season: "Summer 2026",
    sponsorship: "yes",
    datePosted: "2026-05-20",
    dateFound: "2026-05-20",
    applyUrl: "https://example.com",
    source: "greenhouse",
    salary: "$50/hr",
    closed: false,
    ...overrides,
  };
}

describe("applyFilters", () => {
  const jobs = [
    makeJob({
      id: "1",
      company: "Google",
      companyTier: "FAANG",
      roleType: "intern",
      season: "Summer 2026",
    }),
    makeJob({
      id: "2",
      company: "Jane Street",
      companyTier: "Quant",
      roleType: "intern",
      season: "Summer 2026",
    }),
    makeJob({
      id: "3",
      company: "Stripe",
      companyTier: "YC",
      roleType: "newgrad",
      season: "Fall 2026",
    }),
    makeJob({
      id: "4",
      company: "Palantir",
      companyTier: "Big Tech",
      roleType: "newgrad",
      sponsorship: "no",
      season: "Winter 2027",
    }),
    makeJob({
      id: "5",
      company: "Amazon",
      companyTier: "FAANG",
      roleType: "intern",
      closed: true,
      season: "Summer 2026",
    }),
    makeJob({
      id: "6",
      company: "Scale AI",
      companyTier: "YC",
      roleType: "intern",
      remote: true,
      season: "Unknown",
    }),
  ];

  it("returns all non-closed jobs with default filters", () => {
    const result = applyFilters(jobs, DEFAULT_FILTER_STATE);
    expect(result).toHaveLength(5);
    expect(result.find((j) => j.id === "5")).toBeUndefined();
  });

  it("filters by season", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      seasons: ["Summer 2026"],
      hideClosed: false,
    };
    const result = applyFilters(jobs, filters);
    expect(result.every((j) => j.season === "Summer 2026")).toBe(true);
  });

  it("filters by role type", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      roleTypes: ["newgrad"],
    };
    const result = applyFilters(jobs, filters);
    expect(result.every((j) => j.roleType === "newgrad")).toBe(true);
  });

  it("filters by tier (multi-select)", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      tiers: ["FAANG", "Quant"],
    };
    const result = applyFilters(jobs, filters);
    expect(
      result.every(
        (j) => j.companyTier === "FAANG" || j.companyTier === "Quant"
      )
    ).toBe(true);
  });

  it("filters sponsors only", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      sponsorsOnly: true,
    };
    const result = applyFilters(jobs, filters);
    expect(result.every((j) => j.sponsorship !== "no")).toBe(true);
  });

  it("filters remote only", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      remoteOnly: true,
    };
    const result = applyFilters(jobs, filters);
    expect(result.every((j) => j.remote)).toBe(true);
  });

  it("shows closed when hideClosed is false", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      hideClosed: false,
    };
    const result = applyFilters(jobs, filters);
    expect(result).toHaveLength(6);
  });

  it("combines filters with AND logic", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      tiers: ["FAANG"],
      roleTypes: ["intern"],
      seasons: ["Summer 2026"],
      hideClosed: false,
    };
    const result = applyFilters(jobs, filters);
    expect(result).toHaveLength(2);
  });
});

describe("applySort", () => {
  const jobs = [
    makeJob({
      id: "1",
      datePosted: "2026-05-18",
      company: "Stripe",
      salary: "$190k",
    }),
    makeJob({
      id: "2",
      datePosted: "2026-05-20",
      company: "Google",
      salary: "$50/hr",
    }),
    makeJob({
      id: "3",
      datePosted: "2026-05-19",
      company: "Amazon",
      salary: null,
    }),
  ];

  it("sorts newest first", () => {
    const result = applySort(jobs, "newest");
    expect(result.map((j) => j.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts company A-Z", () => {
    const result = applySort(jobs, "company-az");
    expect(result.map((j) => j.company)).toEqual([
      "Amazon",
      "Google",
      "Stripe",
    ]);
  });

  it("sorts salary high to low, nulls last", () => {
    const result = applySort(jobs, "salary-desc");
    expect(result.map((j) => j.id)).toEqual(["1", "2", "3"]);
  });
});
