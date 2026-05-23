import type { CompanyTier, SortMode } from "./types";

export const TIER_COLORS: Record<CompanyTier, { bg: string; text: string }> = {
  FAANG: { bg: "bg-green-500/10", text: "text-green-500" },
  "Big Tech": { bg: "bg-blue-500/10", text: "text-blue-500" },
  Quant: { bg: "bg-purple-500/10", text: "text-purple-500" },
  YC: { bg: "bg-amber-500/10", text: "text-amber-500" },
  F500: { bg: "bg-slate-500/10", text: "text-slate-400" },
  Other: { bg: "bg-gray-500/10", text: "text-gray-400" },
};

export const ALL_TIERS: CompanyTier[] = [
  "FAANG",
  "Big Tech",
  "Quant",
  "YC",
  "F500",
  "Other",
];

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "company-az", label: "Company A-Z" },
  { value: "salary-desc", label: "Salary high→low" },
];

export const DEFAULT_FILTER_STATE = {
  seasons: [] as string[],
  roleTypes: [] as ("intern" | "newgrad")[],
  tiers: [] as CompanyTier[],
  sponsorsOnly: false,
  remoteOnly: false,
  hideClosed: true,
  sort: "newest" as const,
};
