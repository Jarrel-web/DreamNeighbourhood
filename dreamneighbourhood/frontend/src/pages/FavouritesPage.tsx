import React from "react";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import { useFavourites } from "../context/FavouriteContext";
import { useAuth } from "../context/AuthContext";
import { Search, Filter, X, Trash2 } from "lucide-react";
import Chip from "../components/ui/chip";
import type { Property } from "../types/property";

const PAGE_SIZE = 10;

const FavouritesSection: React.FC = () => {
  const { favouriteProperties, loading, toggleFavourite } = useFavourites();
  const { isLoggedIn } = useAuth();

  // Filter states
  const [searchText, setSearchText] = React.useState("");
  const [selectedTown, setSelectedTown] = React.useState("");
  const [minPrice, setMinPrice] = React.useState<number | null>(null);
  const [maxPrice, setMaxPrice] = React.useState<number | null>(null);
  const [minRooms, setMinRooms] = React.useState<number | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [page, setPage] = React.useState(1);

  // Filter favourites based on criteria
  const filteredFavourites = React.useMemo(() => {
    if (!favouriteProperties.length) return [];

    return favouriteProperties.filter((property: Property) => {
      // Search filter
      const matchesSearch = searchText === "" || 
        property.street_name.toLowerCase().includes(searchText.toLowerCase()) ||
        property.town.toLowerCase().includes(searchText.toLowerCase()) ||
        property.flat_type.toLowerCase().includes(searchText.toLowerCase());

      // Town filter
      const matchesTown = selectedTown === "" || property.town === selectedTown;

      // Price range filter
      const matchesMinPrice = minPrice === null || property.resale_price >= minPrice;
      const matchesMaxPrice = maxPrice === null || property.resale_price <= maxPrice;

      // Rooms filter
      const matchesRooms = minRooms === null || 
        parseInt(property.flat_type.charAt(0)) >= minRooms;

      return matchesSearch && matchesTown && matchesMinPrice && matchesMaxPrice && matchesRooms;
    });
  }, [favouriteProperties, searchText, selectedTown, minPrice, maxPrice, minRooms]);

  // Get unique towns for filter dropdown
  const uniqueTowns = React.useMemo(() => {
    const towns = favouriteProperties.map(p => p.town);
    return Array.from(new Set(towns)).sort();
  }, [favouriteProperties]);

  // Get price range for sliders
  const priceRange = React.useMemo(() => {
    if (!favouriteProperties.length) return { min: 0, max: 0 };
    const prices = favouriteProperties.map(p => p.resale_price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [favouriteProperties]);

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setSelectedTown("");
    setMinPrice(null);
    setMaxPrice(null);
    setMinRooms(null);
    setPage(1);
  };

  // Clear all favourites
  const clearAllFavourites = async () => {
    if (!confirm("Are you sure you want to remove all favourite properties? This action cannot be undone.")) {
      return;
    }

    try {
      // Remove each favourite one by one
      for (const property of favouriteProperties) {
        await toggleFavourite(property);
      }
    } catch (error) {
      console.error("Failed to clear favourites:", error);
      alert("Failed to clear some favourites. Please try again.");
    }
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchText, selectedTown, minPrice, maxPrice, minRooms]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filteredFavourites.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = filteredFavourites.slice(start, start + PAGE_SIZE);

  const hasActiveFilters = searchText || selectedTown || minPrice !== null || maxPrice !== null || minRooms !== null;
  const hasFavourites = favouriteProperties.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Favourite Properties</h1>
        {hasFavourites && (
          <button
            onClick={clearAllFavourites}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            title="Remove all favourites"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-card p-4 rounded-xl border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 flex">
            <input
              type="text"
              placeholder="Search favourites by address, town, or type..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="bg-gray-100 border border-l-0 rounded-r-lg px-3 flex items-center">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Town Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Town</label>
              <select
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Towns</option>
                {uniqueTowns.map(town => (
                  <option key={town} value={town}>{town}</option>
                ))}
              </select>
            </div>

            {/* Min Price Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Min Price {minPrice && `(SGD ${minPrice.toLocaleString()})`}
              </label>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                step={10000}
                value={minPrice || priceRange.min}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Price {maxPrice && `(SGD ${maxPrice.toLocaleString()})`}
              </label>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                step={10000}
                value={maxPrice || priceRange.max}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Bedrooms Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Min Bedrooms</label>
              <div className="flex gap-2 flex-wrap">
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
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {loading ? (
            "Loading…"
          ) : (
            <>
              Showing {current.length} of {filteredFavourites.length} favourite properties
              {favouriteProperties.length !== filteredFavourites.length && (
                <span className="ml-1">
                  (filtered from {favouriteProperties.length} total)
                </span>
              )}
            </>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Filters Active
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && <div className="text-gray-600 text-center py-8">Loading your favourites…</div>}

      {/* Empty States */}
      {!loading && favouriteProperties.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-lg mb-2">No favourite properties yet.</div>
          <div className="text-sm">Start adding properties to your favourites to see them here!</div>
        </div>
      )}

      {!loading && favouriteProperties.length > 0 && filteredFavourites.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-lg mb-2">No matching favourites found.</div>
          <div className="text-sm">Try adjusting your filters to see more results.</div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Favourite Properties List */}
      {!loading && current.length > 0 && (
        <>
          <div className="space-y-4">
            {current.map((p) => (
              <PropertyCard 
                key={p.id} 
                property={p} 
                isInitiallyFavourite={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="mt-8">
              <Pager page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavouritesSection;