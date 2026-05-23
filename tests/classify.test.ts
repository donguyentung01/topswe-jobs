import { describe, it, expect } from "vitest";
import { classifyRoleType, classifySeason } from "../pipeline/classify";

describe("classifyRoleType", () => {
  it("classifies intern by title keyword", () => {
    expect(classifyRoleType("Software Engineering Intern", "")).toBe("intern");
    expect(classifyRoleType("SWE Internship - Summer 2026", "")).toBe("intern");
    expect(classifyRoleType("Co-Op Software Developer", "")).toBe("intern");
    expect(classifyRoleType("Explore Program Intern", "")).toBe("intern");
    expect(classifyRoleType("STEP Intern", "")).toBe("intern");
  });

  it("classifies new grad by title keyword", () => {
    expect(classifyRoleType("New Grad Software Engineer", "")).toBe("newgrad");
    expect(classifyRoleType("Entry Level SWE", "")).toBe("newgrad");
    expect(classifyRoleType("Junior Software Engineer", "")).toBe("newgrad");
    expect(classifyRoleType("Associate Software Engineer", "")).toBe("newgrad");
    expect(classifyRoleType("SDE I", "")).toBe("newgrad");
    expect(classifyRoleType("Software Engineer I", "")).toBe("newgrad");
    expect(classifyRoleType("Early Career Developer", "")).toBe("newgrad");
  });

  it("classifies new grad by description when title is ambiguous", () => {
    expect(
      classifyRoleType("Software Engineer", "0-2 years of experience required")
    ).toBe("newgrad");
    expect(
      classifyRoleType(
        "Software Engineer",
        "No prior experience required. Graduating in 2026."
      )
    ).toBe("newgrad");
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

  it("accepts SWE-related intern roles", () => {
    expect(classifyRoleType("Software Engineering Intern", "")).toBe("intern");
    expect(classifyRoleType("Data Science Intern", "")).toBe("intern");
    expect(classifyRoleType("Machine Learning Intern", "")).toBe("intern");
    expect(classifyRoleType("DevOps Intern", "")).toBe("intern");
    expect(classifyRoleType("Security Engineering Intern", "")).toBe("intern");
    expect(classifyRoleType("Frontend Intern", "")).toBe("intern");
    expect(classifyRoleType("Platform Engineering Intern", "")).toBe("intern");
  });
});

describe("classifySeason", () => {
  it("detects summer from title", () => {
    expect(classifySeason("SWE Intern, Summer 2026")).toBe("Summer 2026");
  });

  it("detects fall from title", () => {
    expect(classifySeason("Software Engineer Intern - Fall 2026")).toBe(
      "Fall 2026"
    );
  });

  it("detects winter from title", () => {
    expect(classifySeason("Co-op, Winter 2027")).toBe("Winter 2027");
  });

  it("detects spring from title", () => {
    expect(classifySeason("SWE Intern Spring 2027")).toBe("Spring 2027");
  });

  it("returns Unknown when no season is specified", () => {
    expect(classifySeason("Software Engineer Intern")).toBe("Unknown");
    expect(classifySeason("New Grad SWE")).toBe("Unknown");
  });
});
