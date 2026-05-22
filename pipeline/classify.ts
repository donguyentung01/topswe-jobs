import type { RoleType } from "../src/lib/types";

const INTERN_TITLE_PATTERNS = [
  /\bintern\b/i,
  /\binternship\b/i,
  /\bco-?op\b/i,
  /\bcoop\b/i,
  /\bexplore\b/i,
  /\bstep\b/i,
  /\b\d+-week\b/i,
];

const NEWGRAD_TITLE_PATTERNS = [
  /\bnew\s*grad\b/i,
  /\bnew\s*graduate\b/i,
  /\bentry[\s-]level\b/i,
  /\bjunior\b/i,
  /\bearly\s*career\b/i,
  /\buniversity\s*grad\b/i,
  /\brecent\s*graduate\b/i,
  /\bassociate\s+software/i,
  /\bsde\s*i\b/i,
  /\bsoftware\s+engineer\s+i\b/i,
];

const NEWGRAD_DESC_PATTERNS = [
  /0-?[12]\s*years?\s*(of\s+)?experience/i,
  /no\s+prior\s+experience\s+required/i,
  /graduating\s+in\s+202\d/i,
];

const EXCLUDE_TITLE_PATTERNS = [
  /\bsenior\b/i,
  /\bstaff\b/i,
  /\bprincipal\b/i,
  /\blead\b/i,
  /\bmanager\b/i,
  /\bdirector\b/i,
];

export function classifyRoleType(
  title: string,
  description: string
): RoleType | null {
  if (EXCLUDE_TITLE_PATTERNS.some((p) => p.test(title))) {
    return null;
  }

  if (INTERN_TITLE_PATTERNS.some((p) => p.test(title))) {
    return "intern";
  }

  if (NEWGRAD_TITLE_PATTERNS.some((p) => p.test(title))) {
    return "newgrad";
  }

  if (NEWGRAD_DESC_PATTERNS.some((p) => p.test(description))) {
    return "newgrad";
  }

  return null;
}

const SEASON_PATTERN = /\b(summer|fall|autumn|winter|spring)\s+(20\d{2})\b/i;

export function classifySeason(title: string): string {
  const match = title.match(SEASON_PATTERN);
  if (!match) return "Unknown";

  let season =
    match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  if (season === "Autumn") season = "Fall";

  return `${season} ${match[2]}`;
}
