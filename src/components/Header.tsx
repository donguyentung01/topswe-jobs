export function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-white/[0.08]">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">TopSWE</span>
        <span className="text-xs text-white/40">.jobs</span>
      </div>
      <nav className="flex gap-4 text-sm text-white/50">
        <a href="#about" className="hover:text-white/80 transition-colors">
          About
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/80 transition-colors"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}
