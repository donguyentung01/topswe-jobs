"use client";

import type { Job } from "@/lib/types";
import { TIER_COLORS } from "@/lib/constants";

interface JobTableProps {
  jobs: Job[];
}

function abbreviateSeason(season: string): string {
  if (season === "Unknown") return "Unknown";
  return season.replace(/20(\d{2})/, "'$1");
}

export function JobTable({ jobs }: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="py-20 text-center text-white/40 text-sm">
        No jobs match your filters. Try broadening your search.
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="flex gap-2 px-2 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
        <span className="flex-[1.8]">Company</span>
        <span className="flex-[2.8]">Role</span>
        <span className="flex-[1.3]">Location</span>
        <span className="flex-[0.8]">Tier</span>
        <span className="flex-[0.8]">Season</span>
        <span className="flex-[0.6]">Sponsor</span>
        <span className="flex-[0.7]">Salary</span>
        <span className="flex-[0.7] text-right">Posted</span>
      </div>

      {jobs.map((job) => {
        const tierColor = TIER_COLORS[job.companyTier];
        const rowClass = job.closed
          ? "opacity-50"
          : "hover:bg-white/[0.03] cursor-pointer";

        return (
          <a
            key={job.id}
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex gap-2 px-2 py-2.5 border-t border-white/[0.06] items-center text-sm no-underline text-inherit ${rowClass}`}
          >
            <span className="flex-[1.8] font-semibold truncate">
              {job.company}
            </span>
            <span
              className={`flex-[2.8] text-blue-400 truncate ${
                job.closed ? "line-through" : ""
              }`}
            >
              {job.role}
            </span>
            <span className="flex-[1.3] text-xs opacity-70 truncate">
              {job.location}
            </span>
            <span className="flex-[0.8]">
              <span
                className={`${tierColor.bg} ${tierColor.text} px-2 py-0.5 rounded-full text-[11px]`}
              >
                {job.companyTier}
              </span>
            </span>
            <span className="flex-[0.8] text-xs opacity-70">
              {abbreviateSeason(job.season)}
            </span>
            <span
              className={`flex-[0.6] text-xs ${
                job.sponsorship === "no"
                  ? "text-red-400"
                  : job.sponsorship === "yes"
                    ? "text-green-500"
                    : "text-white/40"
              }`}
            >
              {job.sponsorship === "yes"
                ? "Yes"
                : job.sponsorship === "no"
                  ? "No"
                  : "—"}
            </span>
            <span className="flex-[0.7] text-xs text-white/60">
              {job.salary ?? "—"}
            </span>
            <span className="flex-[0.7] text-xs opacity-50 text-right">
              {job.closed
                ? "Closed"
                : new Date(job.datePosted).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
            </span>
          </a>
        );
      })}
    </div>
  );
}
