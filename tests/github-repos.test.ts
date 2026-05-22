import { describe, it, expect } from "vitest";
import { parseSimplifyTable } from "../pipeline/sources/github-repos";

describe("parseSimplifyTable", () => {
  it("parses a SimplifyJobs markdown table row", () => {
    const markdown = `| Company | Role | Location | Application/Link | Date Posted |
| --- | --- | --- | --- | --- |
| **Google** | SWE Intern, Summer 2026 | Mountain View, CA | <a href="https://careers.google.com/123"><img src="https://i.imgur.com/abc.png" width="150" alt="Apply"></a> | May 20 |
| **Meta** | Software Engineering Intern | Menlo Park, CA | \u{1F512} | May 18 |`;

    const result = parseSimplifyTable(markdown, "intern");
    expect(result).toHaveLength(2);

    expect(result[0].company).toBe("Google");
    expect(result[0].role).toBe("SWE Intern, Summer 2026");
    expect(result[0].location).toBe("Mountain View, CA");
    expect(result[0].applyUrl).toBe("https://careers.google.com/123");
    expect(result[0].closed).toBe(false);
    expect(result[0].roleType).toBe("intern");

    expect(result[1].company).toBe("Meta");
    expect(result[1].closed).toBe(true);
  });
});
