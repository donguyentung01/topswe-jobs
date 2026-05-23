"use client";

import { useState, useMemo, useEffect } from "react";
import type { Job, FilterState } from "@/lib/types";
import { DEFAULT_FILTER_STATE } from "@/lib/constants";
import { applyFilters, applySort } from "@/lib/filters";
import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { FilterBar } from "@/components/FilterBar";
import { JobTable } from "@/components/JobTable";
import { Footer } from "@/components/Footer";

interface JobBoardProps {
  jobs: Job[];
  lastUpdated: string;
}

function useFilterParams(): [FilterState, (f: FilterState) => void] {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed: Partial<FilterState> = {};
    if (params.get("seasons"))
      parsed.seasons = params.get("seasons")!.split(",");
    if (params.get("roles"))
      parsed.roleTypes = params
        .get("roles")!
        .split(",") as FilterState["roleTypes"];
    if (params.get("tiers"))
      parsed.tiers = params.get("tiers")!.split(",") as FilterState["tiers"];
    if (params.get("sponsors") === "true") parsed.sponsorsOnly = true;
    if (params.get("remote") === "true") parsed.remoteOnly = true;
    if (params.get("closed") === "false") parsed.hideClosed = false;
    if (params.get("sort"))
      parsed.sort = params.get("sort") as FilterState["sort"];
    setFilters((prev) => ({ ...prev, ...parsed }));
  }, []);

  function updateFilters(next: FilterState) {
    setFilters(next);
    const params = new URLSearchParams();
    if (next.seasons.length) params.set("seasons", next.seasons.join(","));
    if (next.roleTypes.length) params.set("roles", next.roleTypes.join(","));
    if (next.tiers.length) params.set("tiers", next.tiers.join(","));
    if (next.sponsorsOnly) params.set("sponsors", "true");
    if (next.remoteOnly) params.set("remote", "true");
    if (!next.hideClosed) params.set("closed", "false");
    if (next.sort !== "newest") params.set("sort", next.sort);
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `?${qs}` : window.location.pathname
    );
  }

  return [filters, updateFilters];
}

export function JobBoard({ jobs, lastUpdated }: JobBoardProps) {
  const [filters, setFilters] = useFilterParams();

  const availableSeasons = useMemo(() => {
    const seasons = [...new Set(jobs.map((j) => j.season))];
    const order = ["Spring", "Summer", "Fall", "Winter"];
    return seasons.sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      const aParts = a.split(" ");
      const bParts = b.split(" ");
      const aYear = aParts.length > 1 ? aParts[1] : aParts[0];
      const bYear = bParts.length > 1 ? bParts[1] : bParts[0];
      if (aYear !== bYear) return aYear.localeCompare(bYear);
      const aSeason = aParts.length > 1 ? aParts[0] : "";
      const bSeason = bParts.length > 1 ? bParts[0] : "";
      return order.indexOf(aSeason) - order.indexOf(bSeason);
    });
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const filtered = applyFilters(jobs, filters);
    return applySort(filtered, filters.sort);
  }, [jobs, filters]);

  return (
    <main className="max-w-7xl mx-auto">
      <Header />

      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold">
          Intern & New Grad CS Jobs
        </h1>
        <p className="text-sm text-white/50 mt-1.5">
          Updated daily from FAANG, Big Tech, Quant firms, YC startups & Fortune
          500
        </p>
      </div>

      <StatsBar jobs={jobs} lastUpdated={lastUpdated} />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        availableSeasons={availableSeasons}
      />
      <JobTable jobs={filteredJobs} />
      <Footer jobCount={filteredJobs.length} lastUpdated={lastUpdated} />
    </main>
  );
}
