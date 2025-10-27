import React from "react";
import Chip from "../components/ui/chip";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import { Search, X, Filter, Plus, Trash2, MapPin } from "lucide-react";
import type { Property } from "../types/property";
import { useFavourites } from "../context/FavouriteContext";
import { useAuth } from "../context/AuthContext";
import { getDefaultProperties, searchProperties, type SearchParams, type PropertiesResponse } from "@/services/propertiesService";

const PAGE_SIZE = 10;

// Amenity types with icons and labels
const AMENITY_TYPES = [
  { id: 'transport', label: 'Public Transport', icon: '🚆', description: 'MRT, Bus Stops' },
  { id: 'education', label: 'Schools', icon: '🎓', description: 'Schools, Universities' },
  { id: 'supermarket', label: 'Supermarkets', icon: '🛒', description: 'Grocery Stores' },
  { id: 'sports', label: 'Sports & Recreation', icon: '⚽', description: 'Parks, Gyms, Pools' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', description: 'Clinics, Hospitals' },
  { id: 'hawker', label: 'Hawker Centres', icon: '🍜', description: 'Food Centers, Restaurants' },
] as const;

type AmenityType = typeof AMENITY_TYPES[number]['id'];
type RankedAmenity = { type: AmenityType; rank: number };

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
  const [showFilters, setShowFilters] = React.useState(false);
  const [showAmenitiesRanking, setShowAmenitiesRanking] = React.useState(false);

  // Amenities ranking state
  const [rankedAmenities, setRankedAmenities] = React.useState<RankedAmenity[]>([]);
  const [availableAmenities, setAvailableAmenities] = React.useState<AmenityType[]>(
    AMENITY_TYPES.map(a => a.id)
  );

  const isInitialLoad = React.useRef(true);
  const lastSearchParams = React.useRef<string>("");

  const { favourites, isFavourite } = useFavourites();
  const { isLoggedIn } = useAuth();

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return searchText !== "" || queryTown !== "" || maxPrice !== null || minRooms !== null || minArea !== null || rankedAmenities.length > 0;
  }, [searchText, queryTown, maxPrice, minRooms, minArea, rankedAmenities]);

  // Helper: mark which properties are favourited
  const addFavouriteFlag = (properties: Property[]) =>
    properties.map((p) => ({
      ...p,
      isInitiallyFavourite: isLoggedIn ? isFavourite(p.id) : false,
    }));

  // Clear all filters including amenities
  const clearAllFilters = () => {
    setSearchText("");
    setQueryTown("");
    setMaxPrice(null);
    setMinRooms(null);
    setMinArea(null);
    setRankedAmenities([]);
    setAvailableAmenities(AMENITY_TYPES.map(a => a.id));
    setPage(1);
  };

  // Add amenity to ranking
  const addAmenityToRanking = (amenityType: AmenityType) => {
    const nextRank = rankedAmenities.length + 1;
    setRankedAmenities(prev => [...prev, { type: amenityType, rank: nextRank }]);
    setAvailableAmenities(prev => prev.filter(a => a !== amenityType));
  };

  // Remove amenity from ranking
  const removeAmenityFromRanking = (amenityType: AmenityType) => {
    const removedIndex = rankedAmenities.findIndex(a => a.type === amenityType);
    setRankedAmenities(prev => prev.filter(a => a.type !== amenityType));
    setAvailableAmenities(prev => [...prev, amenityType].sort());
    
    // Re-rank remaining amenities
    setRankedAmenities(prev => 
      prev.map((amenity, index) => ({ ...amenity, rank: index + 1 }))
    );
  };

  // Clear all amenities ranking
  const clearAmenitiesRanking = () => {
    setRankedAmenities([]);
    setAvailableAmenities(AMENITY_TYPES.map(a => a.id));
  };

  // Get amenity display info
  const getAmenityInfo = (amenityType: AmenityType) => {
    return AMENITY_TYPES.find(a => a.id === amenityType)!;
  };

  // Fetch data for the current page
  const fetchPageData = async (pageNumber: number, shouldScrollToTop: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams: SearchParams = {
        searchText,
        town: queryTown,
        maxPrice: maxPrice || undefined,
        minRooms: minRooms || undefined,
        minArea: minArea || undefined,
        amenitiesRanking: rankedAmenities.length > 0 ? rankedAmenities : undefined,
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
      }).some(value => value !== undefined && value !== "" && value !== null) || rankedAmenities.length > 0;

      const data: PropertiesResponse = hasFilters 
        ? await searchProperties(searchParams)
        : await getDefaultProperties(pageNumber, PAGE_SIZE);

      // Update state with the new page data
      const propertiesWithFav = addFavouriteFlag(data.results || []);
      setCurrentPageData(propertiesWithFav);
      setTotalResults(data.total || propertiesWithFav.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || propertiesWithFav.length) / PAGE_SIZE));

      if (shouldScrollToTop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  // Load initial page - only on component mount
  React.useEffect(() => {
    fetchPageData(1, false);
    isInitialLoad.current = false;
  }, []);

  // Update favourite status when favourites change
  React.useEffect(() => {
    if (isLoggedIn && currentPageData.length > 0) {
      const updatedData = currentPageData.map((p) => ({
        ...p,
        isInitiallyFavourite: isFavourite(p.id),
      }));
      setCurrentPageData(updatedData);
    }
  }, [favourites, isLoggedIn]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPageData(newPage, false);
  };

  // Handle search/filter changes with debounce - NO SCROLLING
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentParams = JSON.stringify({ 
        searchText, queryTown, maxPrice, minRooms, minArea, rankedAmenities 
      });
      
      if (currentParams !== lastSearchParams.current) {
        setPage(1);
        fetchPageData(1, false);
        lastSearchParams.current = currentParams;
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, queryTown, maxPrice, minRooms, minArea, rankedAmenities]);

  // Manual search handler - ONLY THIS SCROLLS
  const handleManualSearch = () => {
    setPage(1);
    fetchPageData(1, true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Search Properties</h1>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors w-full justify-center ${
            showFilters || hasActiveFilters
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
        {/* Filters Sidebar - Wider to accommodate amenities */}
        <aside className={`bg-card p-4 sm:p-5 rounded-xl border flex flex-col gap-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
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
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchText && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Search: "{searchText}"
                  </span>
                )}
                {queryTown && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Town: {queryTown}
                  </span>
                )}
                {maxPrice !== null && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Max: SGD {maxPrice.toLocaleString()}
                  </span>
                )}
                {minRooms !== null && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {minRooms}+ Rooms
                  </span>
                )}
                {minArea !== null && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Min: {minArea} sqm
                  </span>
                )}
                {rankedAmenities.map((amenity) => {
                  const info = getAmenityInfo(amenity.type);
                  return (
                    <span key={amenity.type} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                      <span>{info.icon}</span>
                      #{amenity.rank} {info.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <h2 className="font-semibold mb-3">Location & Basic Filters</h2>
          
          {/* Town Filter - Required for amenities ranking */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              Town
              {rankedAmenities.length > 0 && (
                <span className="text-green-600 text-xs">✓ Required for amenities ranking</span>
              )}
            </label>
            <select
              className="w-full mt-1 mb-4 rounded-md border p-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={queryTown}
              onChange={(e) => setQueryTown(e.target.value)}
            >
              <option value="">All towns</option>
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
          </div>

          {/* Amenities Ranking Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Amenities Priority Ranking
              </h3>
              <button
                onClick={() => setShowAmenitiesRanking(!showAmenitiesRanking)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showAmenitiesRanking ? 'Hide' : 'Show'}
              </button>
            </div>

            {showAmenitiesRanking && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Rank amenities by importance. Properties will be scored based on proximity to your top priorities.
                </p>

                {/* Current Ranking */}
                {rankedAmenities.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Priority Ranking:</label>
                    <div className="space-y-2">
                      {rankedAmenities.map((amenity) => {
                        const info = getAmenityInfo(amenity.type);
                        return (
                          <div
                            key={amenity.type}
                            className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200"
                          >
                            <div className="flex items-center gap-2">
                              <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {amenity.rank}
                              </span>
                              <span className="text-lg">{info.icon}</span>
                              <div>
                                <div className="text-sm font-medium">{info.label}</div>
                                <div className="text-xs text-gray-500">{info.description}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeAmenityFromRanking(amenity.type)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={clearAmenitiesRanking}
                      className="w-full text-sm text-red-600 hover:text-red-800 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                    >
                      Clear All Rankings
                    </button>
                  </div>
                )}

                {/* Available Amenities to Add */}
                {availableAmenities.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Add Priority {rankedAmenities.length > 0 ? `#${rankedAmenities.length + 1}` : ''}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableAmenities.map((amenityType) => {
                        const info = getAmenityInfo(amenityType);
                        return (
                          <button
                            key={amenityType}
                            onClick={() => addAmenityToRanking(amenityType)}
                            className="p-2 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{info.icon}</span>
                              <div>
                                <div className="text-sm font-medium">{info.label}</div>
                                <div className="text-xs text-gray-500">{info.description}</div>
                              </div>
                              <Plus className="w-4 h-4 ml-auto text-gray-400" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {rankedAmenities.length === 0 && availableAmenities.length > 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Click on amenities to rank them by importance
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Basic Filters */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Property Filters</h3>

            {/* Price Filter */}
            <div>
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
            </div>

            {/* Bedrooms Filter */}
            <div>
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
            </div>

            {/* Area Filter */}
            <div>
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
            </div>
          </div>
        </aside>

        {/* Results Section */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-semibold text-lg">Search Results</h2>
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${totalResults.toLocaleString()} matches`}
              {error && <span className="ml-2 text-amber-600">{error}</span>}
            </div>
          </div>

          {/* Active Filters Badge */}
          {hasActiveFilters && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  Showing filtered results
                  {rankedAmenities.length > 0 && (
                    <span className="ml-2 text-purple-600">
                      • Prioritizing {rankedAmenities.length} amenities
                    </span>
                  )}
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {currentPageData.map((p) => (
              <PropertyCard
                key={`${p.id}-${p.isInitiallyFavourite}`}
                property={p}
                isInitiallyFavourite={p.isInitiallyFavourite}
              />
            ))}
            {!loading && currentPageData.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-lg mb-2">No properties found</div>
                <div className="text-sm mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your filters or search terms" 
                    : "Try searching with different criteria"
                  }
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
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