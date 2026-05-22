interface FooterProps {
  jobCount: number;
  lastUpdated: string;
}

export function Footer({ jobCount, lastUpdated }: FooterProps) {
  return (
    <footer className="mt-2 py-4 px-6 text-center text-xs text-white/30 border-t border-white/[0.06]">
      Showing {jobCount} roles · Data from Greenhouse, Lever, Work at a
      Startup, GitHub & career pages · Last updated {lastUpdated}
    </footer>
  );
}
