import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl mb-6">🔍</div>
      <h1 className="text-3xl font-extrabold text-navy mb-3">Page Not Found</h1>
      <p className="text-slate-500 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
        <Link href="/search" className="btn-outline">
          Browse Listings
        </Link>
      </div>
    </div>
  );
}
