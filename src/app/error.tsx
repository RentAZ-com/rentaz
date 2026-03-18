"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">🛠️</div>
      <h2 className="text-2xl font-extrabold text-navy mb-3">Something went wrong</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset} className="btn-primary">
        Try Again
      </button>
    </div>
  );
}
