import React from "react";
import { X, Filter } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Components
import FiltersSidebar from "./FiltersSidebar";
import ResultsSection from "./ResultsSection";

// Hooks & Services
import { useFavourites } from "../../context/FavouriteContext";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { getDefaultProperties, searchProperties } from "@/services/propertiesService";

// Types & Constants
import type { Property } from "../../types/property";
import type { SearchParams, PropertiesResponse } from "@/services/propertiesService";

import type { AmenityType } from "./types";
import { PAGE_SIZE, AMENITY_TYPES } from "./constants";
const PropertiesSearchSection: React.FC = () => {
  // Hooks
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchState, setSearchState } = useSearch();
  const { favourites, isFavourite } = useFavourites();
  const { isLoggedIn } = useAuth();

  // Local state
  const [initialProperties, setInitialProperties] = React.useState<Property[]>([]);
  const [currentPageData, setCurrentPageData] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  // Extract state from context
  const {
    properties: allProperties,
    currentBackendResults,
    searchText,
    selectedTown,
    maxPrice,
    minRooms,
    minArea,
    rankedAmenities,
    availableAmenities,
    page,
    totalResults,
    totalPages,
    hasSearched
  } = searchState;

  // Derived state
  const isSearchReady = selectedTown !== "" && rankedAmenities.length > 0;
  const hasActiveFilters = !!(searchText || maxPrice !== null || minRooms !== null || minArea !== null);
  const hasSearchCriteria = !!(selectedTown || rankedAmenities.length > 0);

  // Update state functions
  const updateState = (updates: Partial<typeof searchState>) => {
    setSearchState(updates);
  };

  const setSearchText = (text: string) => updateState({ searchText: text });
  const setSelectedTown = (town: string) => updateState({ selectedTown: town });
  const setMaxPrice = (price: number | null) => updateState({ maxPrice: price });
  const setMinRooms = (rooms: number | null) => updateState({ minRooms: rooms });
  const setMinArea = (area: number | null) => updateState({ minArea: area });
  const setPage = (newPage: number) => updateState({ page: newPage });
  const setAllProperties = (properties: Property[]) => updateState({ properties });
  const setTotalResults = (results: number) => updateState({ totalResults: results });
  const setTotalPages = (pages: number) => updateState({ totalPages: pages });
  const setCurrentBackendResults = (results: Property[]) => updateState({ currentBackendResults: results });

  const addFavouriteFlag = (properties: Property[]) =>
    properties.map(p => ({ ...p, isInitiallyFavourite: isLoggedIn ? isFavourite(p.id) : false }));

  const addAmenityToRanking = (type: AmenityType) => {
    const nextRank = rankedAmenities.length + 1;
    const newRankedAmenities = [...rankedAmenities, { type, rank: nextRank, maxDistance: 1000 }];
    const newAvailableAmenities = availableAmenities.filter(a => a !== type);
    
    updateState({ 
      rankedAmenities: newRankedAmenities, 
      availableAmenities: newAvailableAmenities 
    });
  };

  const removeAmenityFromRanking = (type: AmenityType) => {
    const newRankedAmenities = rankedAmenities
      .filter(a => a.type !== type)
      .map((a, i) => ({ ...a, rank: i + 1 }));
    const newAvailableAmenities = [...availableAmenities, type].sort();
    
    updateState({ 
      rankedAmenities: newRankedAmenities, 
      availableAmenities: newAvailableAmenities 
    });
  };

  const updateAmenityDistance = (type: AmenityType, distance: number) => {
    const newRankedAmenities = rankedAmenities.map(a => 
      a.type === type ? { ...a, maxDistance: distance } : a
    );
    updateState({ rankedAmenities: newRankedAmenities });
  };

  // Apply frontend filters and pagination
  const applyFrontendFiltersAndPagination = (properties: Property[], pageNumber: number) => {
    let filtered = [...properties];

    // Apply frontend filters
    if (searchText) {
      filtered = filtered.filter(p =>
        p.address?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.street_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.town?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (maxPrice !== null) {
      filtered = filtered.filter(p => p.resale_price <= maxPrice);
    }
    if (minRooms !== null) {
      filtered = filtered.filter(p => {
        const roomNum = parseInt(p.flat_type?.split(' ')[0] || '0');
        return roomNum >= minRooms;
      });
    }
    if (minArea !== null) {
      filtered = filtered.filter(p => p.floor_area_sqm >= minArea);
    }

    // Calculate pagination
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);
    const startIdx = (pageNumber - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    const pagedData = filtered.slice(startIdx, endIdx);

    setTotalResults(totalFiltered);
    setTotalPages(totalPages);
    setCurrentPageData(addFavouriteFlag(pagedData));
  };

  // Load state from URL on component mount
  React.useEffect(() => {
    const loadStateFromURL = () => {
      const town = searchParams.get('town');
      const amenitiesParam = searchParams.get('amenities');
      const search = searchParams.get('search');
      const price = searchParams.get('maxPrice');
      const rooms = searchParams.get('minRooms');
      const area = searchParams.get('minArea');
      const pageParam = searchParams.get('page');

      const updates: Partial<typeof searchState> = {};
      
      if (town) updates.selectedTown = town;
      if (search) updates.searchText = search;
      if (price) updates.maxPrice = Number(price);
      if (rooms) updates.minRooms = Number(rooms);
      if (area) updates.minArea = Number(area);
      if (pageParam) updates.page = Number(pageParam);

      if (amenitiesParam) {
        try {
          const amenities = JSON.parse(amenitiesParam);
          updates.rankedAmenities = amenities;
          // Recalculate available amenities
          const allTypes = AMENITY_TYPES.map(a => a.id);
          const usedTypes = amenities.map((a: any) => a.type);
          updates.availableAmenities = allTypes.filter(type => !usedTypes.includes(type));
          updates.hasSearched = true;
        } catch (e) {
          console.error('Failed to parse amenities from URL');
        }
      }

      if (Object.keys(updates).length > 0) {
        updateState(updates);
      }
    };

    loadStateFromURL();
  }, []);

  // Update URL when search state changes
  React.useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedTown) params.set('town', selectedTown);
    if (searchText) params.set('search', searchText);
    if (maxPrice !== null) params.set('maxPrice', maxPrice.toString());
    if (minRooms !== null) params.set('minRooms', minRooms.toString());
    if (minArea !== null) params.set('minArea', minArea.toString());
    if (page > 1) params.set('page', page.toString());
    if (rankedAmenities.length > 0) {
      params.set('amenities', JSON.stringify(rankedAmenities));
    }

    if (params.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedTown, searchText, maxPrice, minRooms, minArea, page, rankedAmenities]);

  // Fetch default properties
  const fetchDefaultProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data: PropertiesResponse = await getDefaultProperties();
      const properties = data.results || [];
      
      setInitialProperties(properties);
      
      if (!hasSearched) {
        setAllProperties(properties);
        setCurrentBackendResults(properties);
        applyFrontendFiltersAndPagination(properties, 1);
      }
      
      setPage(1);
      
    } catch (err: any) {
      setError(err.message || "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch ranked properties from backend
  const fetchRankedProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const amenitiesRankingPayload = rankedAmenities.length
        ? rankedAmenities.map(a => ({
            type: a.type,
            amenityTheme: a.type,
            rank: a.rank,
            maxDistance: a.maxDistance,
          }))
        : undefined;

      const searchParams: SearchParams = {
        town: selectedTown || undefined,
        amenitiesRanking: amenitiesRankingPayload,
      };

      const data: PropertiesResponse = await searchProperties(searchParams);
      const properties = data.results || [];

      setAllProperties(properties);
      setCurrentBackendResults(properties);
      updateState({ 
        properties: properties,
        currentBackendResults: properties,
        hasSearched: true
      });
      
      applyFrontendFiltersAndPagination(properties, 1);
      setPage(1);

    } catch (err: any) {
      setError(err.message || "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  // Clear only frontend filters
  const clearAllFilters = () => {
    updateState({
      searchText: "",
      maxPrice: null,
      minRooms: null,
      minArea: null,
      page: 1
    });
    
    applyFrontendFiltersAndPagination(currentBackendResults, 1);
  };

  // Reset everything to initial state
  const resetToInitialResults = () => {
    updateState({
      selectedTown: "",
      rankedAmenities: [],
      availableAmenities: AMENITY_TYPES.map(a => a.id),
      searchText: "",
      maxPrice: null,
      minRooms: null,
      minArea: null,
      page: 1,
      hasSearched: false
    });
    
    setAllProperties(initialProperties);
    setCurrentBackendResults(initialProperties);
    
    applyFrontendFiltersAndPagination(initialProperties, 1);
    setSearchParams({}, { replace: true });
  };

  // Handle manual search for ranked properties
  const handleManualSearch = () => {
    if (!isSearchReady) return;
    setPage(1);
    fetchRankedProperties();
  };

  // Initialize component
  React.useEffect(() => {
    if (initialProperties.length === 0) {
      fetchDefaultProperties();
    } else if (currentBackendResults.length > 0) {
      applyFrontendFiltersAndPagination(currentBackendResults, page);
    }
  }, []);

  // Apply filters when backend results change
  React.useEffect(() => {
    if (currentBackendResults.length > 0) {
      applyFrontendFiltersAndPagination(currentBackendResults, page);
    }
  }, [currentBackendResults, page]);

  React.useEffect(() => {
    if (isLoggedIn && currentPageData.length > 0) {
      setCurrentPageData(addFavouriteFlag(currentPageData));
    }
  }, [favourites, isLoggedIn]);

  // Auto-apply frontend filters when basic filters change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (currentBackendResults.length > 0) {
        setPage(1);
        applyFrontendFiltersAndPagination(currentBackendResults, 1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, maxPrice, minRooms, minArea]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    applyFrontendFiltersAndPagination(currentBackendResults, newPage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Search Properties</h1>
        {(hasActiveFilters || hasSearchCriteria) && (
          <button
            onClick={hasActiveFilters ? clearAllFilters : resetToInitialResults}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
            {hasActiveFilters ? "Clear Filters" : "Reset All"}
          </button>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors w-full justify-center ${
            showFilters || hasActiveFilters || hasSearchCriteria
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {(hasActiveFilters || hasSearchCriteria) && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
        {/* Filters Sidebar */}
        <FiltersSidebar
          showFilters={showFilters}
          selectedTown={selectedTown}
          rankedAmenities={rankedAmenities}
          availableAmenities={availableAmenities}
          searchText={searchText}
          maxPrice={maxPrice}
          minRooms={minRooms}
          minArea={minArea}
          isSearchReady={isSearchReady}
          loading={loading}
          hasSearchCriteria={hasSearchCriteria}
          hasActiveFilters={hasActiveFilters}
          onSelectedTownChange={setSelectedTown}
          onAddAmenity={addAmenityToRanking}
          onRemoveAmenity={removeAmenityFromRanking}
          onUpdateDistance={updateAmenityDistance}
          onManualSearch={handleManualSearch}
          onSearchTextChange={setSearchText}
          onMaxPriceChange={setMaxPrice}
          onMinRoomsChange={setMinRooms}
          onMinAreaChange={setMinArea}
          onClearAllFilters={clearAllFilters}
          onResetToInitialResults={resetToInitialResults}
        />

        {/* Results Section */}
        <ResultsSection
          rankedAmenities={rankedAmenities}
          currentPageData={currentPageData}
          loading={loading}
          totalResults={totalResults}
          error={error}
          isSearchReady={isSearchReady}
          hasActiveFilters={hasActiveFilters}
          hasSearchCriteria={hasSearchCriteria}
          page={page}
          totalPages={totalPages}
          onClearAllFilters={clearAllFilters}
          onResetToInitialResults={resetToInitialResults}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default PropertiesSearchSection;