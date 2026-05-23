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
  /no\s+(?:prior\s+)?experience\s+required/i,
  /graduating\s+in\s+202\d/i,
  /current(?:ly)?\s+(?:pursuing|enrolled|student)/i,
];

const HIGH_EXPERIENCE_PATTERNS = [
  /[1-9]\d*\+?\s*years?\s*(of\s+)?(?:experience|professional|relevant|work)/i,
  /[1-9]\d*\+?\s*years?\s*(of\s+)?(?:software|engineering|development|programming)/i,
  /minimum\s+(?:of\s+)?[1-9]\s*years/i,
  /\b[1-9]\+\s*(?:yrs?|years?)\s+(?:exp|experience)/i,
  /\b(?:at\s+least|minimum)\s+[1-9]\s*years/i,
  /[1-9]\d*\+?\s*years?\s*(?:of\s+)?(?:industry|hands[\s-]on|practical)\s+experience/i,
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

function requiresExperience(description: string): boolean {
  if (!description) return false;
  return HIGH_EXPERIENCE_PATTERNS.some((p) => p.test(description));
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

  if (requiresExperience(description)) {
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

const SEASON_YEAR_PATTERN =
  /\b(summer|fall|autumn|winter|spring)\s+(20\d{2})\b/i;
const SEASON_ONLY_PATTERN = /\b(summer|fall|autumn|winter|spring)\b/i;
const YEAR_ONLY_PATTERN = /\b(20\d{2})\b/;

function normalizeSeason(raw: string): string {
  const s = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return s === "Autumn" ? "Fall" : s;
}

function inferYearForSeason(season: string, postMonth: number, postYear: number): number {
  switch (season) {
    case "Summer":
      // Recruiting Jul–Dec → next year's summer; Jan–Jun → same year
      return postMonth >= 7 ? postYear + 1 : postYear;
    case "Fall":
      // Recruiting Jan–Sep → same year; Oct–Dec → next year
      return postMonth >= 10 ? postYear + 1 : postYear;
    case "Winter":
      // Winter = Jan–Mar (academic first term); recruiting Jul–Dec → next year, Jan–Jun → same year
      return postMonth >= 7 ? postYear + 1 : postYear;
    case "Spring":
      // Recruiting Sep–Dec → next year; Jan–May → same year
      return postMonth >= 9 ? postYear + 1 : postYear;
    default:
      return postYear;
  }
}

export function classifySeason(
  title: string,
  datePosted?: string,
  roleType?: RoleType | null
): string {
  // 1. Explicit "Summer 2026" in title — always trust
  const fullMatch = title.match(SEASON_YEAR_PATTERN);
  if (fullMatch) {
    return `${normalizeSeason(fullMatch[1])} ${fullMatch[2]}`;
  }

  // 2. Season word without year — infer year from posting date
  const seasonMatch = title.match(SEASON_ONLY_PATTERN);
  if (seasonMatch && datePosted) {
    const season = normalizeSeason(seasonMatch[1]);
    const d = new Date(datePosted);
    const year = inferYearForSeason(season, d.getMonth() + 1, d.getFullYear());
    return `${season} ${year}`;
  }

  // 3. Just a year like "2026 Intern" — use it with best-guess season
  const yearMatch = title.match(YEAR_ONLY_PATTERN);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (roleType === "intern") return `Summer ${year}`;
    if (roleType === "newgrad") return `${year}`;
  }

  // 4. No season info in title — infer from posting date if available
  if (datePosted && roleType) {
    const d = new Date(datePosted);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    if (roleType === "intern") {
      // Most internships are summer; infer summer cycle
      const summerYear = month >= 7 ? year + 1 : year;
      return `Summer ${summerYear}`;
    }

    if (roleType === "newgrad") {
      // New grad cycle: posted Aug–Dec → next year's class, Jan–Jul → same year
      const gradYear = month >= 8 ? year + 1 : year;
      return `${gradYear}`;
    }
  }

  return "Unknown";
}
