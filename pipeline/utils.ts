export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[,\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCompany(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,\-–—']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const NON_US_PATTERNS = [
  /\bcanada\b/i,
  /\buk\b/i,
  /\bunited\s+kingdom\b/i,
  /\blondon\b/i,
  /\bbristol\b/i,
  /\bcambridge,?\s*(?:uk|england)/i,
  /\btoronto\b/i,
  /\bvancouver\b/i,
  /\bmontreal\b/i,
  /\bwaterloo,?\s*(?:on|ontario|canada)/i,
  /\bottawa\b/i,
  /\bcalgary\b/i,
  /\bwinnipeg\b/i,
  /\bvictoria,?\s*(?:bc|british)/i,
  /\b(?:ON|BC|AB|QC|MB),?\s*Canada\b/i,
  /\bbrazil\b/i,
  /\bindia\b/i,
  /\bbangalore\b/i,
  /\bhyderabad\b/i,
  /\bmumbai\b/i,
  /\bpune\b/i,
  /\bgurgaon\b/i,
  /\bsingapore\b/i,
  /\bgermany\b/i,
  /\bberlin\b/i,
  /\bmunich\b/i,
  /\bfrance\b/i,
  /\bparis\b/i,
  /\btokyo\b/i,
  /\bjapan\b/i,
  /\bireland\b/i,
  /\bdublin\b/i,
  /\bamsterdam\b/i,
  /\bnetherlands\b/i,
  /\baustralia\b/i,
  /\bsydney\b/i,
  /\bmelbourne\b/i,
  /\bmexico\b/i,
  /\bisrael\b/i,
  /\btel\s*aviv\b/i,
  /\bkorea\b/i,
  /\bseoul\b/i,
  /\bchina\b/i,
  /\bbeijing\b/i,
  /\bshanghai\b/i,
  /\bhong\s*kong\b/i,
  /\btaiwan\b/i,
  /\bzurich\b/i,
  /\bswitzerland\b/i,
  /\beurope\b/i,
  /\blatam\b/i,
  /\bemea\b/i,
  /\bapac\b/i,
  /\bspain\b/i,
  /\bitaly\b/i,
  /\bpoland\b/i,
  /\bsweden\b/i,
  /\bstockholm\b/i,
  /\bczech\b/i,
  /\bprague\b/i,
  /\bportugal\b/i,
  /\broma?nia\b/i,
  /\bbucharest\b/i,
];

export function isUSLocation(location: string): boolean {
  if (!location || location === "Unknown") return true;
  return !NON_US_PATTERNS.some((p) => p.test(location));
}
