import React from "react";
import Chip from "../components/ui/chip";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import { Search } from "lucide-react";
import type { Property } from "../types/property";
import { useFavourites } from "../context/FavouriteContext";
import { useAuth } from "../context/AuthContext";
import { getDefaultProperties, searchProperties, type SearchParams, type PropertiesResponse } from "@/services/propertiesService";

const PAGE_SIZE = 10;

const PropertiesSearchSection: React.FC = () => {
  const [currentPageData, setCurrentPageData] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchText, setSearchText] = React.useState("");
  const [queryTown, setQueryTown] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState<number | null>(null);
  const [minRooms, setMinRooms] = React.useState<number | null>(null);
  const [minArea, setMinArea] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalResults, setTotalResults] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  const { favourites, isFavourite } = useFavourites();
  const { isLoggedIn } = useAuth();

  // Helper: mark which properties are favourited
  const addFavouriteFlag = (properties: Property[]) =>
    properties.map((p) => ({
      ...p,
      isInitiallyFavourite: isLoggedIn ? isFavourite(p.id) : false,
    }));

  // Fetch data for the current page
  const fetchPageData = async (pageNumber: number, isNewSearch: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams: SearchParams = {
        searchText,
        town: queryTown,
        maxPrice: maxPrice || undefined,
        minRooms: minRooms || undefined,
        minArea: minArea || undefined,
        page: pageNumber,
        pageSize: PAGE_SIZE,
      };

      // Determine if we're doing a filtered search or getting default properties
      const hasFilters = Object.values({
        searchText,
        town: queryTown,
        maxPrice,
        minRooms,
        minArea,
      }).some(value => value !== undefined && value !== "" && value !== null);

      const data: PropertiesResponse = hasFilters 
        ? await searchProperties(searchParams)
        : await getDefaultProperties(pageNumber, PAGE_SIZE);

      // Update state with the new page data
      const propertiesWithFav = addFavouriteFlag(data.results || []);
      setCurrentPageData(propertiesWithFav);
      setTotalResults(data.total || propertiesWithFav.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || propertiesWithFav.length) / PAGE_SIZE));

      // Only scroll to top for NEW searches, not for page navigation
      if (isNewSearch) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  // Load initial page
  React.useEffect(() => {
    fetchPageData(1, true);
  }, [isLoggedIn, favourites]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPageData(newPage, false); 
  };

  // Handle search/filter changes with debounce
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Reset to page 1 when filters change
      if (page !== 1) {
        setPage(1);
        fetchPageData(1, true); // Scroll for new searches
      } else {
        fetchPageData(1, true); // Scroll for new searches
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, queryTown, maxPrice, minRooms, minArea]);

  // Manual search handler
  const handleManualSearch = () => {
    // Reset to page 1 and fetch
    setPage(1);
    fetchPageData(1, true); // Scroll for manual searches
  };

  

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
              onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleManualSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
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
            {/* You might want to fetch towns from a separate endpoint */}
            <option value="ANG MO KIO">ANG MO KIO</option>
            <option value="BEDOK">BEDOK</option>
            <option value="BISHAN">BISHAN</option>
            <option value="BUKIT BATOK">BUKIT BATOK</option>
            <option value="BUKIT MERAH">BUKIT MERAH</option>
            <option value="BUKIT PANJANG">BUKIT PANJANG</option>
            <option value="BUKIT TIMAH">BUKIT TIMAH</option>
            <option value="CENTRAL AREA">CENTRAL AREA</option>
            <option value="CHOA CHU KANG">CHOA CHU KANG</option>
            <option value="CLEMENTI">CLEMENTI</option>
            <option value="GEYLANG">GEYLANG</option>
            <option value="HOUGANG">HOUGANG</option>
            <option value="JURONG EAST">JURONG EAST</option>
            <option value="JURONG WEST">JURONG WEST</option>
            <option value="KALLANG/WHAMPOA">KALLANG/WHAMPOA</option>
            <option value="MARINE PARADE">MARINE PARADE</option>
            <option value="PASIR RIS">PASIR RIS</option>
            <option value="PUNGGOL">PUNGGOL</option>
            <option value="QUEENSTOWN">QUEENSTOWN</option>
            <option value="SEMBAWANG">SEMBAWANG</option>
            <option value="SENGKANG">SENGKANG</option>
            <option value="SERANGOON">SERANGOON</option>
            <option value="TAMPINES">TAMPINES</option>
            <option value="TOA PAYOH">TOA PAYOH</option>
            <option value="WOODLANDS">WOODLANDS</option>
            <option value="YISHUN">YISHUN</option>
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
              {loading ? "Loading…" : `${totalResults.toLocaleString()} matches`}
              {error && <span className="ml-2 text-amber-600">{error}</span>}
            </div>
          </div>

          <div className="space-y-4">
            {currentPageData.map((p) => (
              <PropertyCard
                key={`${p.id}-${page}`} // Include page in key to force re-render
                property={p}
                isInitiallyFavourite={p.isInitiallyFavourite}
              />
            ))}
            {!loading && currentPageData.length === 0 && (
              <div className="text-muted-foreground">No results. Try widening your filters.</div>
            )}
          </div>

          {totalPages > 1 && (
            <Pager page={page} pageCount={totalPages} onPageChange={handlePageChange} />
          )}
        </section>
      </div>
    </div>
  );
};

export default PropertiesSearchSection;