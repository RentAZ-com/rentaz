export default function Loading() {
  return (
    <div className="page-container py-8 space-y-6">
      <div className="skeleton h-10 w-1/3 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card">
            <div className="skeleton aspect-[4/3]" />
            <div className="p-4 space-y-3">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-5 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
