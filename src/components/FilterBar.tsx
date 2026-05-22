"use client";

import type {
  FilterState,
  CompanyTier,
  RoleType,
  SortMode,
} from "@/lib/types";
import { ALL_TIERS, SORT_OPTIONS } from "@/lib/constants";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableSeasons: string[];
}

function Pill({
  label,
  active,
  onClick,
  variant = "default",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "green";
}) {
  let className =
    "px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors select-none ";
  if (active) {
    if (variant === "green") {
      className += "bg-green-500/15 text-green-500 border border-green-500/30";
    } else {
      className += "bg-blue-500 text-white font-medium";
    }
  } else {
    className += "bg-white/[0.06] text-white/70 hover:bg-white/[0.1]";
  }
  return (
    <button className={className} onClick={onClick}>
      {label}
    </button>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="text-[11px] uppercase tracking-wider text-white/35 min-w-[55px]">
        {label}
      </span>
      <div className="flex gap-1.5 flex-wrap">{children}</div>
    </div>
  );
}

function toggleInArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function FilterBar({
  filters,
  onChange,
  availableSeasons,
}: FilterBarProps) {
  return (
    <div className="bg-white/[0.03] border-y border-white/[0.06] px-6 py-3 space-y-2">
      <FilterRow label="Season">
        {availableSeasons.map((season) => (
          <Pill
            key={season}
            label={season}
            active={filters.seasons.includes(season)}
            onClick={() =>
              onChange({
                ...filters,
                seasons: toggleInArray(filters.seasons, season),
              })
            }
          />
        ))}
      </FilterRow>

      <FilterRow label="Role">
        {(["intern", "newgrad"] as RoleType[]).map((rt) => (
          <Pill
            key={rt}
            label={rt === "intern" ? "Intern" : "New Grad"}
            active={filters.roleTypes.includes(rt)}
            onClick={() =>
              onChange({
                ...filters,
                roleTypes: toggleInArray(filters.roleTypes, rt),
              })
            }
          />
        ))}
      </FilterRow>

      <FilterRow label="Tier">
        {ALL_TIERS.map((tier) => (
          <Pill
            key={tier}
            label={tier}
            active={filters.tiers.includes(tier)}
            onClick={() =>
              onChange({
                ...filters,
                tiers: toggleInArray(filters.tiers, tier),
              })
            }
          />
        ))}
      </FilterRow>

      <div className="flex justify-between items-center">
        <FilterRow label="More">
          <Pill
            label="Sponsors"
            active={filters.sponsorsOnly}
            variant="green"
            onClick={() =>
              onChange({ ...filters, sponsorsOnly: !filters.sponsorsOnly })
            }
          />
          <Pill
            label="Remote"
            active={filters.remoteOnly}
            onClick={() =>
              onChange({ ...filters, remoteOnly: !filters.remoteOnly })
            }
          />
          <Pill
            label="Hide Closed"
            active={filters.hideClosed}
            onClick={() =>
              onChange({ ...filters, hideClosed: !filters.hideClosed })
            }
          />
        </FilterRow>

        <div className="flex items-center gap-1.5 text-xs text-white/50">
          Sort:
          <select
            className="bg-transparent text-blue-400 cursor-pointer outline-none"
            value={filters.sort}
            onChange={(e) =>
              onChange({ ...filters, sort: e.target.value as SortMode })
            }
          >
            {SORT_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[#0a0a0f]"
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
