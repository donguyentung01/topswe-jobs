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
