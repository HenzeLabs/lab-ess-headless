import { layout } from '@/lib/ui';

// Loading skeleton for collection page
export default function LoadingCollectionPage() {
  return (
    <main className="bg-koala-light-grey py-24 animate-pulse">
      <div className={layout.container}>
        <div className="h-12 w-1/3 bg-koala-grey rounded mb-12 mx-auto" />
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0">
            <div className="h-96 bg-koala-grey rounded mb-8" />
          </aside>
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-koala-grey rounded" />
              ))}
            </div>
            <div className="mt-12 text-center">
              <div className="h-12 w-48 bg-koala-grey rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
