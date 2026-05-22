import { JobBoard } from "./JobBoard";
import type { Job } from "@/lib/types";
import fs from "fs";
import path from "path";

function loadJobs(): Job[] {
  const jobsPath = path.join(process.cwd(), "data", "jobs.json");
  if (fs.existsSync(jobsPath)) {
    return JSON.parse(fs.readFileSync(jobsPath, "utf-8"));
  }
  const samplePath = path.join(process.cwd(), "data", "sample-jobs.json");
  if (fs.existsSync(samplePath)) {
    return JSON.parse(fs.readFileSync(samplePath, "utf-8"));
  }
  return [];
}

export default function Home() {
  const jobs = loadJobs();
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return <JobBoard jobs={jobs} lastUpdated={lastUpdated} />;
}
