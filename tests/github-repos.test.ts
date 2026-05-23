import { describe, it, expect } from "vitest";
import { parseSimplifyJson } from "../pipeline/sources/github-repos";

describe("parseSimplifyJson", () => {
  it("parses active SWE listings from SimplifyJobs JSON", () => {
    const listings = [
      {
        source: "Simplify",
        category: "Software",
        company_name: "Google",
        id: "abc-123",
        title: "SWE Intern, Summer 2026",
        active: true,
        terms: ["Summer 2026"],
        date_updated: 1716000000,
        date_posted: 1716000000,
        url: "https://careers.google.com/123",
        locations: ["Mountain View, CA"],
        company_url: "https://simplify.jobs/c/Google",
        is_visible: true,
        sponsorship: "Other",
      },
      {
        source: "Simplify",
        category: "Software",
        company_name: "Meta",
        id: "def-456",
        title: "Software Engineering Intern",
        active: false,
        terms: ["Summer 2026"],
        date_updated: 1716000000,
        date_posted: 1716000000,
        url: "https://metacareers.com/456",
        locations: ["Menlo Park, CA"],
        company_url: "https://simplify.jobs/c/Meta",
        is_visible: true,
        sponsorship: "Does Not Offer Sponsorship",
      },
    ];

    const result = parseSimplifyJson(listings, "intern");
    expect(result).toHaveLength(2);

    expect(result[0].company).toBe("Google");
    expect(result[0].role).toBe("SWE Intern, Summer 2026");
    expect(result[0].location).toBe("Mountain View, CA");
    expect(result[0].applyUrl).toBe("https://careers.google.com/123");
    expect(result[0].closed).toBe(false);
    expect(result[0].season).toBe("Summer 2026");
    expect(result[0].sponsorship).toBe("yes");

    expect(result[1].company).toBe("Meta");
    expect(result[1].closed).toBe(true);
    expect(result[1].sponsorship).toBe("no");
  });

  it("filters out non-SWE categories", () => {
    const listings = [
      {
        source: "Simplify",
        category: "Product",
        company_name: "Airbnb",
        id: "ghi-789",
        title: "Business Development Intern",
        active: true,
        terms: ["Summer 2026"],
        date_updated: 1716000000,
        date_posted: 1716000000,
        url: "https://airbnb.com/789",
        locations: ["San Francisco, CA"],
        company_url: "https://simplify.jobs/c/Airbnb",
        is_visible: true,
        sponsorship: "Other",
      },
    ];

    const result = parseSimplifyJson(listings, "intern");
    expect(result).toHaveLength(0);
  });

  it("rejects far-future terms as graduation dates and re-infers season", () => {
    const listings = [
      {
        source: "Simplify",
        category: "Software",
        company_name: "Booz Allen",
        id: "booz-1",
        title: "Software Developer Intern",
        active: true,
        terms: ["Summer 2028"],
        date_updated: 1747008000,
        date_posted: 1747008000, // 2025-05-12 — "Summer 2028" is 3+ years out
        url: "https://boozallen.com/1",
        locations: ["McLean, VA"],
        company_url: "",
        is_visible: true,
        sponsorship: "Other",
      },
    ];

    const result = parseSimplifyJson(listings, "intern");
    expect(result).toHaveLength(1);
    // Should NOT be "Summer 2028" (graduation date), should be inferred from posting date
    expect(result[0].season).not.toBe("Summer 2028");
  });

  it("accepts reasonable terms seasons", () => {
    const listings = [
      {
        source: "Simplify",
        category: "Software",
        company_name: "Google",
        id: "goog-1",
        title: "SWE Intern",
        active: true,
        terms: ["Summer 2027"],
        date_updated: 1764547200,
        date_posted: 1764547200, // 2025-12-01 — "Summer 2027" is 18 months out, within range
        url: "https://google.com/1",
        locations: ["Mountain View, CA"],
        company_url: "",
        is_visible: true,
        sponsorship: "Other",
      },
    ];

    const result = parseSimplifyJson(listings, "intern");
    expect(result).toHaveLength(1);
    expect(result[0].season).toBe("Summer 2027");
  });

  it("skips non-visible listings", () => {
    const listings = [
      {
        source: "Simplify",
        category: "Software",
        company_name: "Google",
        id: "hidden-1",
        title: "SWE Intern",
        active: true,
        terms: ["Summer 2026"],
        date_updated: 1716000000,
        date_posted: 1716000000,
        url: "https://google.com/hidden",
        locations: ["NYC"],
        company_url: "",
        is_visible: false,
        sponsorship: "Other",
      },
    ];

    const result = parseSimplifyJson(listings, "intern");
    expect(result).toHaveLength(0);
  });
});
