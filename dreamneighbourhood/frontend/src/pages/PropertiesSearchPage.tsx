import React from "react";
import Chip from "../components/ui/chip";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import type { Property } from "../types/property";
import { loadFlatsFromCsv } from "../data/loadFlatsFromCsv";

const PAGE_SIZE = 10;

const useFlats = () => {
  const [all, setAll] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const rows = await loadFlatsFromCsv();
        if (!cancelled) setAll(rows);
      } catch (e: any) {
        console.warn(e);
        // fall back to a tiny mock so UI still works in dev
        if (!cancelled) {
          setError("Failed to load CSV; showing mock data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { all, loading, error };
};

const PropertiesSearchPage: React.FC = () => {
  const { all, loading, error } = useFlats();

  // filters
  const [queryTown, setQueryTown] = React.useState("BEDOK");      // seed with Bedok for demo
  const [maxPrice, setMaxPrice] = React.useState(900000);
  const [minRooms, setMinRooms] = React.useState<number | null>(null);
  const [minArea, setMinArea] = React.useState(80);

  const [page, setPage] = React.useState(1);

  const towns = React.useMemo(() => {
    const s = new Set(all.map((p) => p.town));
    return Array.from(s).sort();
  }, [all]);

  const filtered = React.useMemo(() => {
    let items = all;
    if (queryTown) items = items.filter((p) => p.town.toLowerCase().includes(queryTown.toLowerCase()));
    if (maxPrice) items = items.filter((p) => p.resale_price <= maxPrice);
    if (minRooms) items = items.filter((p) => (p.rooms || 0) >= minRooms);
    if (minArea) items = items.filter((p) => (p.floor_area_sqm || 0) >= minArea);
    return items;
  }, [all, queryTown, maxPrice, minRooms, minArea]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = filtered.slice(start, start + PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, queryTown, maxPrice, minRooms, minArea]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl font-bold mb-6">Search Properties</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
        <aside className="bg-card p-4 sm:p-5 rounded-xl border">
          <h2 className="font-semibold mb-3">Filters</h2>

          <label className="text-sm font-medium">Town</label>
          <select
            className="w-full mt-1 mb-4 rounded-md border p-2 bg-background"
            value={queryTown}
            onChange={(e) => setQueryTown(e.target.value)}
          >
            <option value="">All towns</option>
            {towns.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="text-sm font-medium">Budget (≤ SGD)</label>
          <input
            type="range"
            min={300000}
            max={1600000}
            step={10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground mb-4">SGD {maxPrice.toLocaleString()}</div>

          <label className="text-sm font-medium">Minimum Bedrooms</label>
          <div className="flex gap-2 mt-1 mb-4 flex-wrap">
            {[1,2,3,4,5].map((n) => (
              <Chip key={n} active={minRooms === n} onClick={() => setMinRooms(minRooms === n ? null : n)}>
                {n}+
              </Chip>
            ))}
            <Chip active={minRooms === null} onClick={() => setMinRooms(null)}>Any</Chip>
          </div>

          <label className="text-sm font-medium">Min Area (sqm)</label>
          <input
            type="range"
            min={40}
            max={180}
            step={1}
            value={minArea}
            onChange={(e) => setMinArea(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">≥ {minArea} sqm</div>
        </aside>

        {/* Results */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-semibold text-lg">Search Results</h2>
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${filtered.length} matches`}
              {error ? <span className="ml-2 text-amber-600">{error}</span> : null}
            </div>
          </div>

          <div className="space-y-4">
            {current.map((p) => <PropertyCard key={p.id} property={p} />)}
            {!loading && current.length === 0 && (
              <div className="text-muted-foreground">No results. Try widening your filters.</div>
            )}
          </div>

          <Pager page={page} pageCount={pageCount} onPageChange={setPage} />
        </section>
      </div>
    </div>
  );
};

export default PropertiesSearchPage;
