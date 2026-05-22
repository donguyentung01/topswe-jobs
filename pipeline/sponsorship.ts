import type { Sponsorship } from "../src/lib/types";

const NO_SPONSORSHIP_PATTERNS = [
  /unable\s+to\s+sponsor/i,
  /no\s+sponsorship/i,
  /not\s+sponsor/i,
  /does\s+not\s+offer\s+(visa\s+)?sponsorship/i,
  /without\s+sponsorship/i,
  /cannot\s+sponsor/i,
  /won'?t\s+sponsor/i,
  /us\s+citizens?\s+only/i,
  /must\s+be\s+(legally\s+)?authorized\s+to\s+work/i,
  /must\s+have\s+existing\s+right\s+to\s+work/i,
  /permanent\s+resident\s+required/i,
  /no\s+visa\s+sponsorship/i,
  /must\s+be\s+a\s+u\.?s\.?\s+citizen/i,
];

export function detectSponsorship(description: string): Sponsorship {
  if (!description) return "yes";

  if (NO_SPONSORSHIP_PATTERNS.some((p) => p.test(description))) {
    return "no";
  }

  return "yes";
}
