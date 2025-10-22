import React from "react";
import Chip from "../components/ui/chip";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import { Search } from "lucide-react";
import type { Property } from "../types/property";
import { useFavourites } from "../context/favouriteContext";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PropertiesSearchSection: React.FC = () => {
  const [all, setAll] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchText, setSearchText] = React.useState("");
  const [queryTown, setQueryTown] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState<number | null>(null);
  const [minRooms, setMinRooms] = React.useState<number | null>(null);
  const [minArea, setMinArea] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);

  const { favourites } = useFavourites();
  const { isLoggedIn } = useAuth();

  // Helper: mark which properties are favourited
  const addFavouriteFlag = (properties: Property[]) =>
  properties.map((p) => ({
    ...p,
    isInitiallyFavourite: isLoggedIn ? favourites.some((f) => f.id === p.id) : false,
  }));

  // Load initial properties
  React.useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/properties/default`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setAll(addFavouriteFlag(data.results || []));
      } catch (err: any) {
        setError(err.message || "Failed to load properties.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [isLoggedIn, favourites]);

  // Fetch filtered results
  React.useEffect(() => {
    const fetchFiltered = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (searchText) queryParams.append("searchText", searchText);
        if (queryTown) queryParams.append("town", queryTown);
        if (maxPrice !== null) queryParams.append("maxPrice", String(maxPrice));
        if (minRooms !== null) queryParams.append("minRooms", String(minRooms));
        if (minArea !== null) queryParams.append("minArea", String(minArea));

        if (queryParams.toString() === "") return;

        const res = await fetch(`${API_BASE}/properties/search?${queryParams.toString()}`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();

        setAll(addFavouriteFlag(data.results || []));
        setPage(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err: any) {
        setError(err.message || "Failed to load properties.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [searchText, queryTown, maxPrice, minRooms, minArea, isLoggedIn, favourites]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = all.slice(start, start + PAGE_SIZE);

  const towns = Array.from(new Set(all.map((p) => p.town))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Search Properties</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
        <aside className="bg-card p-4 sm:p-5 rounded-xl border flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex w-full">
            <input
              type="text"
              placeholder="Search by address or town"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {}}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-1" />
              Search
            </button>
          </div>

          {/* Filters */}
          <h2 className="font-semibold mb-3">Filters</h2>
          <label className="text-sm font-medium">Town</label>
          <select
            className="w-full mt-1 mb-4 rounded-md border p-2 bg-background"
            value={queryTown}
            onChange={(e) => setQueryTown(e.target.value)}
          >
            <option value="">All towns</option>
            {towns.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label className="text-sm font-medium">Budget (≤ SGD)</label>
          <input
            type="range"
            min={300000}
            max={1600000}
            step={10000}
            value={maxPrice || 1600000}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground mb-4">
            SGD {(maxPrice || 1600000).toLocaleString()}
          </div>

          <label className="text-sm font-medium">Minimum Bedrooms</label>
          <div className="flex gap-2 mt-1 mb-4 flex-wrap">
            {[1, 2, 3, 4, 5].map((n) => (
              <Chip
                key={n}
                active={minRooms === n}
                onClick={() => setMinRooms(minRooms === n ? null : n)}
              >
                {n}+
              </Chip>
            ))}
            <Chip active={minRooms === null} onClick={() => setMinRooms(null)}>
              Any
            </Chip>
          </div>

          <label className="text-sm font-medium">Min Area (sqm)</label>
          <input
            type="range"
            min={40}
            max={180}
            step={1}
            value={minArea || 40}
            onChange={(e) => setMinArea(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">≥ {minArea || 40} sqm</div>
        </aside>

        {/* Results */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-semibold text-lg">Search Results</h2>
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${all.length} matches`}
              {error && <span className="ml-2 text-amber-600">{error}</span>}
            </div>
          </div>

          <div className="space-y-4">
            {current.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                isInitiallyFavourite={p.isInitiallyFavourite} // pass prefilled prop
              />
            ))}
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

export default PropertiesSearchSection;
