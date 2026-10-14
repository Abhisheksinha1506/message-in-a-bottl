export default function Loading() {
  return (
    <main
      className="loading-shore"
      role="status"
      aria-label="Finding your shore"
    >
      <div className="skeleton-hero animate-pulse" />
      <div className="skeleton-card animate-pulse" />
      <div className="skeleton-card animate-pulse" />
      <p className="font-serif text-xl">Finding your shore…</p>
    </main>
  );
}
