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

  const { internSeasons, newgradYears } = useMemo(() => {
    const seasons = [...new Set(jobs.map((j) => j.season))];
    const order = ["Spring", "Summer", "Fall", "Winter"];
    const intern = seasons
      .filter((s) => s.includes(" "))
      .sort((a, b) => {
        const [aS, aY] = a.split(" ");
        const [bS, bY] = b.split(" ");
        if (aY !== bY) return aY.localeCompare(bY);
        return order.indexOf(aS) - order.indexOf(bS);
      });
    const newgrad = seasons
      .filter((s) => !s.includes(" ") && s !== "Unknown")
      .sort();
    return { internSeasons: intern, newgradYears: newgrad };
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
        internSeasons={internSeasons}
        newgradYears={newgradYears}
      />
      <JobTable jobs={filteredJobs} />
      <Footer jobCount={filteredJobs.length} lastUpdated={lastUpdated} />
    </main>
  );
}
