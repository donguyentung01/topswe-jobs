import type { Job } from "@/lib/types";

interface StatsBarProps {
  jobs: Job[];
  lastUpdated: string;
}

export function StatsBar({ jobs, lastUpdated }: StatsBarProps) {
  const openCount = jobs.filter((j) => !j.closed).length;

  const today = new Date().toISOString().split("T")[0];
  const newToday = jobs.filter((j) => j.dateFound === today).length;

  return (
    <div className="flex justify-center gap-8 px-6 py-3 text-sm">
      <span className="text-white/50">
        <strong className="text-white">{openCount}</strong> open roles
      </span>
      <span className="text-white/50">
        <strong className="text-green-500">+{newToday}</strong> added today
      </span>
      <span className="text-white/50">
        Updated <strong className="text-white">{lastUpdated}</strong>
      </span>
    </div>
  );
}
