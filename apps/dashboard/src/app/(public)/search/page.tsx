import { Suspense } from 'react';
import SearchBar from '@/components/public/SearchBar';
import SearchResults from '@/components/public/SearchResults';

export const metadata = { title: 'Search facilities' };

type Level = 'tertiary' | 'secondary' | 'primary';

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; state?: string; type?: string; level?: string; ownership?: string; verified?: string };
}) {
  const q = searchParams.q ?? '';
  const verified = searchParams.verified === 'true';
  const level: Level | undefined =
    searchParams.level === 'tertiary' || searchParams.level === 'secondary' || searchParams.level === 'primary'
      ? searchParams.level
      : undefined;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto mb-6">
        <SearchBar
          size="md"
          initialValue={q}
          showFilters
          initialFilters={{
            level,
            facilityType: searchParams.type,
            ownership: searchParams.ownership,
            verified,
          }}
        />
      </div>
      <Suspense fallback={<div className="text-slate-500 text-sm">Loading…</div>}>
        <SearchResults
          q={q}
          state={searchParams.state}
          type={searchParams.type}
          level={level}
          ownership={searchParams.ownership}
          verified={verified}
        />
      </Suspense>
    </div>
  );
}
