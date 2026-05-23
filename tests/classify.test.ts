import { describe, it, expect } from "vitest";
import { classifyRoleType, classifySeason } from "../pipeline/classify";

describe("classifyRoleType", () => {
  it("classifies SWE intern by title keyword", () => {
    expect(classifyRoleType("Software Engineering Intern", "")).toBe("intern");
    expect(classifyRoleType("SWE Internship - Summer 2026", "")).toBe("intern");
    expect(classifyRoleType("Co-Op Software Developer", "")).toBe("intern");
  });

  it("classifies new grad by SWE-specific patterns", () => {
    expect(classifyRoleType("Associate Software Engineer", "")).toBe("newgrad");
    expect(classifyRoleType("SDE I", "")).toBe("newgrad");
    expect(classifyRoleType("Software Engineer I", "")).toBe("newgrad");
    expect(classifyRoleType("Junior Software Engineer", "")).toBe("newgrad");
    expect(classifyRoleType("Software R&D Engineer New Grad", "")).toBe(
      "newgrad"
    );
  });

  it("classifies new grad by generic title + SWE role", () => {
    expect(classifyRoleType("New Grad Software Engineer", "")).toBe("newgrad");
    expect(classifyRoleType("Entry Level SWE", "")).toBe("newgrad");
    expect(classifyRoleType("Early Career Developer", "")).toBe("newgrad");
  });

  it("classifies new grad by description when title is SWE", () => {
    expect(
      classifyRoleType(
        "Software Engineer",
        "No prior experience required. Graduating in 2026."
      )
    ).toBe("newgrad");
    expect(
      classifyRoleType(
        "Software Engineer",
        "Currently pursuing a BS in Computer Science"
      )
    ).toBe("newgrad");
  });

  it("rejects jobs requiring any years of experience", () => {
    expect(
      classifyRoleType(
        "Software Engineer I",
        "1+ years of software engineering experience"
      )
    ).toBeNull();
    expect(
      classifyRoleType(
        "Data Engineer 1",
        "Minimum 2 years of experience in data engineering"
      )
    ).toBeNull();
    expect(
      classifyRoleType(
        "New Grad Software Engineer",
        "At least 3 years of industry experience required"
      )
    ).toBeNull();
  });

  it("returns null for unclassifiable roles", () => {
    expect(
      classifyRoleType("Software Engineer", "5+ years experience")
    ).toBeNull();
    expect(classifyRoleType("Senior SWE", "")).toBeNull();
    expect(classifyRoleType("Staff Engineer", "")).toBeNull();
    expect(classifyRoleType("Software Engineer", "")).toBeNull();
  });

  it("rejects non-SWE intern roles", () => {
    expect(classifyRoleType("Business Development Intern", "")).toBeNull();
    expect(classifyRoleType("Communications Intern", "")).toBeNull();
    expect(classifyRoleType("Legal Intern", "")).toBeNull();
    expect(classifyRoleType("Field Sales Intern", "")).toBeNull();
    expect(classifyRoleType("Marketing Intern", "")).toBeNull();
    expect(classifyRoleType("HR Intern", "")).toBeNull();
    expect(classifyRoleType("Finance Intern", "")).toBeNull();
  });

  it("rejects non-SWE roles even with newgrad keywords", () => {
    expect(classifyRoleType("New Grad Operations Associate", "")).toBeNull();
    expect(classifyRoleType("Entry Level Sales Representative", "")).toBeNull();
    expect(classifyRoleType("Junior Recruiter", "")).toBeNull();
    expect(classifyRoleType("Sales Enablement Specialist", "")).toBeNull();
    expect(classifyRoleType("Deployment Strategist, Internship", "")).toBeNull();
    expect(classifyRoleType("IT Operations Engineer", "")).toBeNull();
    expect(classifyRoleType("Data Analyst", "")).toBeNull();
  });

  it("accepts SWE-related intern roles", () => {
    expect(classifyRoleType("Software Engineering Intern", "")).toBe("intern");
    expect(classifyRoleType("Data Science Intern", "")).toBe("intern");
    expect(classifyRoleType("Machine Learning Intern", "")).toBe("intern");
    expect(classifyRoleType("DevOps Intern", "")).toBe("intern");
    expect(classifyRoleType("Platform Engineering Intern", "")).toBe("intern");
    expect(classifyRoleType("Backend Developer Intern", "")).toBe("intern");
    expect(classifyRoleType("SDE Intern", "")).toBe("intern");
  });
});

describe("classifySeason", () => {
  it("detects explicit season + year from title", () => {
    expect(classifySeason("SWE Intern, Summer 2026")).toBe("Summer 2026");
    expect(classifySeason("Software Engineer Intern - Fall 2026")).toBe(
      "Fall 2026"
    );
    expect(classifySeason("Co-op, Winter 2027")).toBe("Winter 2027");
    expect(classifySeason("SWE Intern Spring 2027")).toBe("Spring 2027");
  });

  it("infers year from posting date when title has season but no year", () => {
    expect(classifySeason("Summer SWE Intern", "2025-09-15", "intern")).toBe(
      "Summer 2026"
    );
    expect(classifySeason("Summer SWE Intern", "2026-03-01", "intern")).toBe(
      "Summer 2026"
    );
    expect(classifySeason("Fall Internship", "2026-05-01", "intern")).toBe(
      "Fall 2026"
    );
    expect(classifySeason("Fall Internship", "2026-11-01", "intern")).toBe(
      "Fall 2027"
    );
  });

  it("infers full season from posting date for interns with no season keyword", () => {
    expect(
      classifySeason("Software Engineer Intern", "2025-10-01", "intern")
    ).toBe("Summer 2026");
    expect(
      classifySeason("Software Engineer Intern", "2026-02-15", "intern")
    ).toBe("Summer 2026");
  });

  it("infers graduation year for newgrads with no season keyword", () => {
    expect(
      classifySeason("New Grad SWE", "2025-09-01", "newgrad")
    ).toBe("2026");
    expect(
      classifySeason("New Grad SWE", "2026-03-01", "newgrad")
    ).toBe("2026");
  });

  it("returns Unknown when no date or roleType available", () => {
    expect(classifySeason("Software Engineer Intern")).toBe("Unknown");
    expect(classifySeason("New Grad SWE")).toBe("Unknown");
  });
});
