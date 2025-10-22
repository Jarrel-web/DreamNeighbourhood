import React from "react";
import Chip from "../components/ui/chip";
import PropertyCard from "../components/ui/property-card";
import type { Property } from "../types/property";

// Optional: keep this local fallback so dev works even before backend is wired.
// Remove if you prefer a strict backend-only flow.
import { loadFlatsFromCsv } from "../data/loadFlatsFromCsv";

type Phase = "filters" | "results" | "details";

type Filters = {
  town: string;
  maxPrice: number;
  minRooms: number | null;
  minArea: number;
  // later: amenityRankings: string[]  // (for your 6-rank priority flow)
};

const PAGE_SIZE = 12;

async function searchProperties(filters: Filters): Promise<Property[]> {
  // 1) Try backend (POST your filters). Adjust URL to your API.
  try {
    const base = import.meta.env.VITE_API_BASE ?? "";
    if (base) {
      const res = await fetch(`${base}/properties/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      return data.properties as Property[]; // shape: { properties: Property[] }
    }
  } catch (e) {
    console.warn("[searchProperties] backend not available; falling back to local CSV", e);
  }

  // 2) Fallback: filter locally (so UX still works during FE dev)
  const all = await loadFlatsFromCsv();
  return all.filter(p =>
    (!filters.town || p.town.toLowerCase().includes(filters.town.toLowerCase())) &&
    (!filters.maxPrice || p.resale_price <= filters.maxPrice) &&
    (filters.minRooms == null || (p.rooms || 0) >= filters.minRooms) &&
    (!filters.minArea || (p.floor_area_sqm || 0) >= filters.minArea)
  );
}

const PropertiesPage: React.FC = () => {
  const [phase, setPhase] = React.useState<Phase>("filters");

  // filters
  const [town, setTown] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState(900000);
  const [minRooms, setMinRooms] = React.useState<number | null>(null);
  const [minArea, setMinArea] = React.useState(80);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [results, setResults] = React.useState<Property[]>([]);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Property | null>(null);

  const currentPage = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [page, results]);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setPhase("results");
    setPage(1);
    try {
      const list = await searchProperties({ town, maxPrice, minRooms, minArea });
      setResults(list);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch results");
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // ----- UI -----
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      <h1 className="text-3xl font-bold mb-6">Find Properties</h1>

      {/* Phase 1: Filters */}
      {phase === "filters" && (
        <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
          <aside className="bg-card p-5 rounded-xl border">
            <h2 className="font-semibold mb-3">Filters</h2>

            <label className="text-sm font-medium">Town</label>
            <input
              placeholder="e.g., Bedok"
              className="w-full mt-1 mb-4 rounded-md border p-2 bg-background"
              value={town}
              onChange={(e) => setTown(e.target.value)}
            />

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
            <div className="text-sm text-muted-foreground mb-4">
              SGD {maxPrice.toLocaleString()}
            </div>

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
            <div className="text-sm text-muted-foreground mb-6">
              ≥ {minArea} sqm
            </div>

            <button
              onClick={handleSearch}
              className="w-full rounded-md bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </aside>

          <section className="bg-muted/30 rounded-xl border border-dashed p-6 flex items-center justify-center text-muted-foreground">
            <div className="max-w-md text-center">
              <div className="text-lg font-semibold mb-1">Start with your filters</div>
              <p className="text-sm">Set your preferences on the left, then hit <span className="font-medium">Search</span>.</p>
            </div>
          </section>
        </div>
      )}

      {/* Phase 2: Results */}
      {phase === "results" && (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${results.length} matches`}
              {error ? <span className="ml-2 text-amber-600">{error}</span> : null}
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border px-3 py-1 text-sm" onClick={() => setPhase("filters")}>
                Edit filters
              </button>
            </div>
          </div>

          {/* list */}
          <div className="space-y-4">
            {!loading && results.length === 0 && (
              <div className="text-muted-foreground">No results. Try widening your filters.</div>
            )}
            {currentPage.map((p) => (
              <PropertyCard key={p.id} property={p} onClick={(pp) => { setSelected(pp); setPhase("details"); }} />
            ))}
          </div>

          {/* simple pager */}
          {results.length > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button className="border rounded-md px-3 py-1 text-sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
              <span className="text-sm">Page {page} / {Math.ceil(results.length / PAGE_SIZE)}</span>
              <button className="border rounded-md px-3 py-1 text-sm" disabled={page * PAGE_SIZE >= results.length} onClick={() => setPage(p => p+1)}>Next</button>
            </div>
          )}
        </div>
      )}

      {/* Phase 3: Details (left: info; right: map placeholder) */}
      {phase === "details" && selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-card p-5 rounded-xl border">
            <button className="mb-4 rounded-md border px-3 py-1 text-sm" onClick={() => setPhase("results")}>
              ← Back to results
            </button>

            <h2 className="text-xl font-semibold mb-1">
              Blk {selected.block} {selected.street_name}, {selected.town}
            </h2>
            <div className="text-sm text-muted-foreground mb-4">
              {selected.flat_type} • {selected.floor_area_sqm} sqm • {selected.storey_range}
            </div>

            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Model:</span> {selected.flat_model}</div>
              <div><span className="font-medium">Lease:</span> {selected.remaining_lease} ({selected.lease_commence_date})</div>
              <div><span className="font-medium">Postal Code:</span> {selected.postal_code}</div>
            </div>

            {/* placeholder for “nearest 6 amenity groups & distances” */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Nearest amenities (coming soon)</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>Supermarket (NTUC) — distance here</li>
                <li>School — distance here</li>
                <li>…(6 groups total; color-coded to match map pins)</li>
              </ul>
            </div>
          </section>

          <section className="bg-card p-5 rounded-xl border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Map</h3>
              <div className="text-xs text-muted-foreground">OpenStreetMap tiles (to add)</div>
            </div>

            {/* Map placeholder. Wire up react-leaflet later. */}
            <div className="h-[480px] rounded-lg border bg-muted/40 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">
                Map placeholder — integrate Leaflet or MapLibre here
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
