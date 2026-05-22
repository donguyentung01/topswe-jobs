import { describe, it, expect } from "vitest";
import { detectSponsorship } from "../pipeline/sponsorship";

describe("detectSponsorship", () => {
  it("defaults to yes when no signals present", () => {
    expect(detectSponsorship("Build great software with us.")).toBe("yes");
    expect(detectSponsorship("")).toBe("yes");
  });

  it("detects no sponsorship from explicit phrases", () => {
    expect(
      detectSponsorship("We are unable to sponsor visas for this role.")
    ).toBe("no");
    expect(
      detectSponsorship("US Citizens only. No sponsorship available.")
    ).toBe("no");
    expect(
      detectSponsorship(
        "Must be authorized to work in the United States without sponsorship."
      )
    ).toBe("no");
    expect(
      detectSponsorship("This role does not offer visa sponsorship.")
    ).toBe("no");
    expect(
      detectSponsorship(
        "Candidates must have existing right to work in the US."
      )
    ).toBe("no");
  });

  it("returns yes when sponsorship is explicitly offered", () => {
    expect(
      detectSponsorship("We sponsor H-1B visas for qualified candidates.")
    ).toBe("yes");
  });
});
