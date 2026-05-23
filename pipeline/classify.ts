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

const SWE_PATTERNS = [
  /\bsoftware\b/i,
  /\bswe\b/i,
  /\bsde\b/i,
  /\bdeveloper\b/i,
  /\bengineering\b/i,
  /\bengineer\b/i,
  /\bprogramm/i,
  /\bcoding\b/i,
  /\bfrontend\b/i,
  /\bfront[\s-]end\b/i,
  /\bbackend\b/i,
  /\bback[\s-]end\b/i,
  /\bfull[\s-]?stack\b/i,
  /\bweb\s+dev/i,
  /\bmobile\s+dev/i,
  /\bios\s+dev/i,
  /\bandroid\s+dev/i,
  /\bdata\s+engineer/i,
  /\bdata\s+scien/i,
  /\bmachine\s+learning\b/i,
  /\bml\s+engineer/i,
  /\bai\s+engineer/i,
  /\bdevops\b/i,
  /\bsite\s+reliability/i,
  /\bsre\b/i,
  /\bcloud\s+engineer/i,
  /\bplatform\s+engineer/i,
  /\binfra(?:structure)?\s+engineer/i,
  /\bsecurity\s+engineer/i,
  /\bcyber\s*security/i,
  /\bquant(?:itative)?\b/i,
  /\balgorithm/i,
  /\bcomputer\s+scien/i,
  /\btechnolog/i,
  /\btech\b/i,
  /\bit\b/i,
  /\bsystems?\s+engineer/i,
  /\bnetwork\s+engineer/i,
  /\bembedded\b/i,
  /\bfirmware\b/i,
  /\bhardware\s+engineer/i,
  /\bvlsi\b/i,
  /\basic\b/i,
  /\bchip\s+design/i,
  /\btest\s+engineer/i,
  /\bqa\s+engineer/i,
  /\bautomation\s+engineer/i,
  /\bproduct\s+engineer/i,
  /\bexplore\b/i,
  /\bstep\b/i,
];

const EXCLUDE_TITLE_PATTERNS = [
  /\bsenior\b/i,
  /\bstaff\b/i,
  /\bprincipal\b/i,
  /\blead\b/i,
  /\bmanager\b/i,
  /\bdirector\b/i,
];

function isSweRelated(title: string, description: string): boolean {
  const text = `${title} ${description}`;
  return SWE_PATTERNS.some((p) => p.test(text));
}

export function classifyRoleType(
  title: string,
  description: string
): RoleType | null {
  if (EXCLUDE_TITLE_PATTERNS.some((p) => p.test(title))) {
    return null;
  }

  if (INTERN_TITLE_PATTERNS.some((p) => p.test(title))) {
    if (!isSweRelated(title, description)) return null;
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
