export interface Job {
  id: string;
  company: string;
  companyTier: CompanyTier;
  role: string;
  roleType: RoleType;
  location: string;
  remote: boolean;
  season: string;
  sponsorship: Sponsorship;
  datePosted: string;
  dateFound: string;
  applyUrl: string;
  source: Source;
  salary: string | null;
  closed: boolean;
}

export type CompanyTier = "FAANG" | "Big Tech" | "Quant" | "YC" | "F500" | "Other";

export type RoleType = "intern" | "newgrad";

export type Sponsorship = "yes" | "no" | "unknown";

export type Source =
  | "github"
  | "greenhouse"
  | "lever"
  | "workatastartup"
  | "jobright"
  | "scraper";

export type SortMode = "newest" | "company-az" | "salary-desc";

export interface Company {
  name: string;
  tier: CompanyTier;
  ats: "greenhouse" | "lever" | "workatastartup" | "custom";
  careersUrl: string;
  greenhouseId?: string;
  leverId?: string;
}

export interface FilterState {
  search: string;
  seasons: string[];
  roleTypes: RoleType[];
  tiers: CompanyTier[];
  sponsorsOnly: boolean;
  remoteOnly: boolean;
  hideClosed: boolean;
  sort: SortMode;
}
