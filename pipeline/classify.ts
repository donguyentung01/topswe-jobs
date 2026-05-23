import type { RoleType } from "../src/lib/types";

const INTERN_TITLE_PATTERNS = [
  /\bintern\b/i,
  /\binternship\b/i,
  /\bco-?op\b/i,
  /\bcoop\b/i,
];

const NEWGRAD_TITLE_PATTERNS = [
  /\bnew\s*grad\b/i,
  /\bnew\s*graduate\b/i,
  /\bentry[\s-]level\b/i,
  /\bearly\s*career\b/i,
  /\buniversity\s*grad\b/i,
  /\brecent\s*graduate\b/i,
  /\bnew\s*college\s*grad/i,
];

const NEWGRAD_TITLE_SWE_SPECIFIC = [
  /\bassociate\s+software/i,
  /\bjunior\s+software/i,
  /\bjunior\s+developer/i,
  /\bjunior\s+swe\b/i,
  /\bsde\s*i\b/i,
  /\bsde\s+1\b/i,
  /\bsoftware\s+engineer\s+i\b/i,
  /\bsoftware\s+engineer\s+1\b/i,
  /\bsoftware\s+dev(?:eloper)?\s+i\b/i,
  /\bsoftware\s+r&?d\s+engineer\s+new\s*grad/i,
];

const NEWGRAD_DESC_PATTERNS = [
  /0-?[12]\s*years?\s*(of\s+)?experience/i,
  /no\s+prior\s+experience\s+required/i,
  /graduating\s+in\s+202\d/i,
];

const SWE_TITLE_PATTERNS = [
  /\bsoftware\b/i,
  /\bswe\b/i,
  /\bsde\b/i,
  /\bdeveloper\b/i,
  /\bprogramm/i,
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
  /\bapplied\s+(ml|ai|machine\s+learning)/i,
  /\bdevops\b/i,
  /\bsite\s+reliability/i,
  /\bsre\b/i,
  /\bcloud\s+engineer/i,
  /\bplatform\s+engineer/i,
  /\binfra(?:structure)?\s+engineer/i,
  /\bsecurity\s+engineer/i,
  /\bcyber\s*security\s+engineer/i,
  /\bsystems?\s+engineer/i,
  /\bnetwork\s+engineer/i,
  /\bembedded\s+(?:software|engineer|dev)/i,
  /\bfirmware\s+engineer/i,
  /\bvlsi\b/i,
  /\basic\s+design/i,
  /\bchip\s+design/i,
  /\bcompiler\b/i,
  /\bexplore\s+program/i,
  /\bstep\s+intern/i,
  /\bgoogle\s+step\b/i,
  /\bresearch\s+scien/i,
  /\bquant(?:itative)?\s+(?:developer|research|engineer|software)/i,
];

const EXCLUDE_TITLE_PATTERNS = [
  /\bsenior\b/i,
  /\bstaff\b/i,
  /\bprincipal\b/i,
  /\blead\b/i,
  /\bmanager\b/i,
  /\bdirector\b/i,
];

const EXCLUDE_ROLE_PATTERNS = [
  /\bsales\b/i,
  /\bmarketing\b/i,
  /\blegal\b/i,
  /\bhr\b/i,
  /\bhuman\s+resources/i,
  /\bfinance\b(?!\s+engineer)/i,
  /\baccounting\b/i,
  /\bcommunications?\b/i,
  /\brecruiting\b/i,
  /\brecruiter\b/i,
  /\bbusiness\s+dev/i,
  /\bbusiness\s+analyst/i,
  /\boperations\s+(?:assoc|spec|coord|manage|analyst)/i,
  /\bsupply\s+chain/i,
  /\bprocurement\b/i,
  /\benablement\b/i,
  /\bspecialist\b/i,
  /\bcoordinator\b/i,
  /\bstrategist\b/i,
  /\bcontent\s+(?:writer|creator|editor)/i,
  /\beditorial\b/i,
  /\bpublic\s*relation/i,
  /\bevent\s+/i,
  /\badmin(?:istrat)/i,
  /\breal\s+estate/i,
  /\bpolicy\b/i,
  /\bcompliance\b/i,
  /\baudit\b/i,
  /\bdeployment\s+strategist/i,
  /\btechnical\s+advisor/i,
  /\btrading\s+(?:operations|desk)/i,
  /\bfield\s+(?:sales|service)/i,
  /\bit\s+operations/i,
  /\bknowledge\s+(?:data|management)/i,
  /\bdata\s+analyst\b/i,
  /\bsector\s+(?:data\s+)?analyst/i,
  /\beconomics?\b/i,
];

function isSweTitle(title: string): boolean {
  return SWE_TITLE_PATTERNS.some((p) => p.test(title));
}

function isExcludedRole(title: string): boolean {
  return EXCLUDE_ROLE_PATTERNS.some((p) => p.test(title));
}

export function classifyRoleType(
  title: string,
  description: string
): RoleType | null {
  if (EXCLUDE_TITLE_PATTERNS.some((p) => p.test(title))) {
    return null;
  }

  if (isExcludedRole(title)) {
    return null;
  }

  if (NEWGRAD_TITLE_SWE_SPECIFIC.some((p) => p.test(title))) {
    return "newgrad";
  }

  if (INTERN_TITLE_PATTERNS.some((p) => p.test(title))) {
    if (!isSweTitle(title)) return null;
    return "intern";
  }

  if (NEWGRAD_TITLE_PATTERNS.some((p) => p.test(title))) {
    if (!isSweTitle(title)) return null;
    return "newgrad";
  }

  if (NEWGRAD_DESC_PATTERNS.some((p) => p.test(description))) {
    if (!isSweTitle(title)) return null;
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
