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
type RankedAmenity = { type: AmenityType; rank: number; maxDistance: number };

const PropertiesSearchSection: React.FC = () => {
  const [currentPageData, setCurrentPageData] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchText, setSearchText] = React.useState("");
  const [selectedTown, setSelectedTown] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState<number | null>(null);
  const [minRooms, setMinRooms] = React.useState<number | null>(null);
  const [minArea, setMinArea] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalResults, setTotalResults] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);

  // Amenities ranking state
  const [rankedAmenities, setRankedAmenities] = React.useState<RankedAmenity[]>([]);
  const [availableAmenities, setAvailableAmenities] = React.useState<AmenityType[]>(
    AMENITY_TYPES.map(a => a.id)
  );

  const isInitialLoad = React.useRef(true);
  const lastSearchParams = React.useRef<string>("");

  const { favourites, isFavourite } = useFavourites();
  const { isLoggedIn } = useAuth();

  // Check if search is ready (town selected and amenities configured)
  const isSearchReady = React.useMemo(() => {
    return selectedTown !== "" && rankedAmenities.length > 0;
  }, [selectedTown, rankedAmenities]);

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return searchText !== "" || selectedTown !== "" || maxPrice !== null || minRooms !== null || minArea !== null || rankedAmenities.length > 0;
  }, [searchText, selectedTown, maxPrice, minRooms, minArea, rankedAmenities]);

  // Helper: mark which properties are favourited
  const addFavouriteFlag = (properties: Property[]) =>
    properties.map((p) => ({
      ...p,
      isInitiallyFavourite: isLoggedIn ? isFavourite(p.id) : false,
    }));

  // Clear all filters including amenities
  const clearAllFilters = () => {
    setSearchText("");
    setSelectedTown("");
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
    setRankedAmenities(prev => [...prev, { type: amenityType, rank: nextRank, maxDistance: 1000 }]); // Default 1km
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

  // Update max distance for an amenity
  const updateAmenityDistance = (amenityType: AmenityType, distance: number) => {
    setRankedAmenities(prev =>
      prev.map(amenity =>
        amenity.type === amenityType ? { ...amenity, maxDistance: distance } : amenity
      )
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
        town: selectedTown,
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
        town: selectedTown,
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
        searchText, selectedTown, maxPrice, minRooms, minArea, rankedAmenities 
      });
      
      if (currentParams !== lastSearchParams.current) {
        setPage(1);
        fetchPageData(1, false);
        lastSearchParams.current = currentParams;
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, selectedTown, maxPrice, minRooms, minArea, rankedAmenities]);

  // Manual search handler - ONLY THIS SCROLLS
  const handleManualSearch = () => {
    if (!isSearchReady) return;
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
          
          {/* Primary Search Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Find Properties by Amenities
            </h2>
            
            {/* Step 1: Town Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-blue-800 block mb-2">
                1. Select Town/District *
              </label>
              <select
                className="w-full rounded-md border border-blue-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
              >
                <option value="">Choose a town...</option>
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

            {/* Step 2: Amenities Ranking */}
            <div className="mb-4">
              <label className="text-sm font-medium text-blue-800 block mb-2">
                2. Rank Amenities by Importance *
              </label>
              
              {/* Current Ranking */}
              {rankedAmenities.length > 0 && (
                <div className="space-y-3 mb-3">
                  {rankedAmenities.map((amenity) => {
                    const info = getAmenityInfo(amenity.type);
                    return (
                      <div
                        key={amenity.type}
                        className="p-3 bg-white rounded-lg border border-purple-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                              {amenity.rank}
                            </span>
                            <span className="text-lg">{info.icon}</span>
                            <span className="font-medium">{info.label}</span>
                          </div>
                          <button
                            onClick={() => removeAmenityFromRanking(amenity.type)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Within</span>
                          <select
                            value={amenity.maxDistance}
                            onChange={(e) => updateAmenityDistance(amenity.type, Number(e.target.value))}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value={500}>500m</option>
                            <option value={1000}>1km</option>
                            <option value={1500}>1.5km</option>
                            <option value={2000}>2km</option>
                          </select>
                          <span className="text-xs text-gray-500">walking distance</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Available Amenities to Add */}
              {availableAmenities.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-blue-800 block mb-2">
                    Add Priority {rankedAmenities.length > 0 ? `#${rankedAmenities.length + 1}` : '#1'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableAmenities.map((amenityType) => {
                      const info = getAmenityInfo(amenityType);
                      return (
                        <button
                          key={amenityType}
                          onClick={() => addAmenityToRanking(amenityType)}
                          disabled={selectedTown === ""}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{info.icon}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{info.label}</div>
                              <div className="text-xs text-gray-500">{info.description}</div>
                            </div>
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {rankedAmenities.length === 0 && selectedTown && (
                <div className="text-center py-3 text-gray-500 text-sm">
                  Click on amenities to rank them by importance
                </div>
              )}

              {rankedAmenities.length === 0 && !selectedTown && (
                <div className="text-center py-3 text-orange-600 text-sm">
                  Please select a town first to rank amenities
                </div>
              )}
            </div>

            {/* Step 3: Search Button */}
            <div>
              <button
                onClick={handleManualSearch}
                disabled={!isSearchReady || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Search className="w-5 h-5" />
                {loading ? "Searching..." : "Search Properties"}
              </button>
              {!isSearchReady && (
                <p className="text-xs text-orange-600 mt-2 text-center">
                  Please select a town and rank at least one amenity to search
                </p>
              )}
            </div>
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
                {selectedTown && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Town: {selectedTown}
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
                      #{amenity.rank} {info.label} ({amenity.maxDistance}m)
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Filters Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 text-gray-700">Additional Filters</h3>
            
            {/* Search Text Filter */}
            <div className="mb-4">
              <label className="text-sm font-medium">Search Address</label>
              <input
                type="text"
                placeholder="Search by address or building name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && isSearchReady && handleManualSearch()}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price Filter */}
            <div className="mb-4">
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
              <div className="text-sm text-muted-foreground">
                SGD {(maxPrice || 1600000).toLocaleString()}
              </div>
            </div>

            {/* Bedrooms Filter */}
            <div className="mb-4">
              <label className="text-sm font-medium">Minimum Bedrooms</label>
              <div className="flex gap-2 mt-1 flex-wrap">
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

          {/* Search Requirements Notice */}
          {!isSearchReady && currentPageData.length === 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900 mb-1">Start Your Property Search</h3>
                <p className="text-blue-700 text-sm">
                  Select a town and rank amenities by importance to find properties that match your lifestyle needs.
                </p>
              </div>
            </div>
          )}

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
            {!loading && currentPageData.length === 0 && isSearchReady && (
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