export default function PageBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#d7f4ef] via-[#c5ebe4] to-[#b3ddd4] dark:from-[#1a5c55] dark:via-[#164a45] dark:to-[#123f3b]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#12b8a8]/25 via-[#0d8f7f]/18 to-[#0a6b62]/22 dark:from-[#12b8a8]/20 dark:via-[#0d8f7f]/16 dark:to-[#0a4f48]/28" />
      <div className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-25 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.55),transparent_45%)]" />
      <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-[#12b8a8]/20 dark:bg-[#12b8a8]/15 blur-3xl" />
      <div className="absolute -right-10 bottom-16 h-48 w-48 rounded-full bg-[#0d8f7f]/18 dark:bg-[#0a4f48]/30 blur-3xl" />
    </div>
  );
}
