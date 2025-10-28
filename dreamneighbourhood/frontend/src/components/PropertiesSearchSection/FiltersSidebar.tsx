import React from "react";
import { Search, X, MapPin } from "lucide-react";
import AmenityRanking from "./AmenityRanking";
import SearchFilters from "./SearchFilters";
import { AMENITY_TYPES } from "./constants";
import type { AmenityType, RankedAmenity } from "./types";

interface FiltersSidebarProps {
  showFilters: boolean;
  selectedTown: string;
  rankedAmenities: RankedAmenity[];
  availableAmenities: AmenityType[];
  searchText: string;
  maxPrice: number | null;
  minRooms: number | null;
  minArea: number | null;
  isSearchReady: boolean;
  loading: boolean;
  hasSearchCriteria: boolean;
  hasActiveFilters: boolean;
  onSelectedTownChange: (town: string) => void;
  onAddAmenity: (type: AmenityType) => void;
  onRemoveAmenity: (type: AmenityType) => void;
  onUpdateDistance: (type: AmenityType, distance: number) => void;
  onManualSearch: () => void;
  onSearchTextChange: (text: string) => void;
  onMaxPriceChange: (price: number | null) => void;
  onMinRoomsChange: (rooms: number | null) => void;
  onMinAreaChange: (area: number | null) => void;
  onClearAllFilters: () => void;
  onResetToInitialResults: () => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  showFilters,
  selectedTown,
  rankedAmenities,
  availableAmenities,
  searchText,
  maxPrice,
  minRooms,
  minArea,
  isSearchReady,
  loading,
  hasSearchCriteria,
  hasActiveFilters,
  onSelectedTownChange,
  onAddAmenity,
  onRemoveAmenity,
  onUpdateDistance,
  onManualSearch,
  onSearchTextChange,
  onMaxPriceChange,
  onMinRoomsChange,
  onMinAreaChange,
  onClearAllFilters,
  onResetToInitialResults,
}) => {
  const getAmenityInfo = (type: AmenityType) => 
    AMENITY_TYPES.find(a => a.id === type)!;

  return (
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
            onChange={(e) => onSelectedTownChange(e.target.value)}
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
        <AmenityRanking
          selectedTown={selectedTown}
          rankedAmenities={rankedAmenities}
          availableAmenities={availableAmenities}
          onAddAmenity={onAddAmenity}
          onRemoveAmenity={onRemoveAmenity}
          onUpdateDistance={onUpdateDistance}
        />

        {/* Step 3: Search Button */}
        <div className="space-y-2">
          <button
            onClick={onManualSearch}
            disabled={!isSearchReady || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Search className="w-5 h-5" />
            {loading ? "Searching..." : "Search Properties"}
          </button>
          
          {hasSearchCriteria && (
            <button
              onClick={onResetToInitialResults}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Reset to All Properties
            </button>
          )}
          
          {!isSearchReady && (
            <p className="text-xs text-orange-600 text-center">
              Please select a town and rank at least one amenity to search
            </p>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(hasActiveFilters || hasSearchCriteria) && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Active {hasSearchCriteria ? 'Search & Filters' : 'Filters'}:</span>
            <button
              onClick={hasActiveFilters ? onClearAllFilters : onResetToInitialResults}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              {hasActiveFilters ? 'Clear Filters' : 'Reset All'}
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
      <SearchFilters
        searchText={searchText}
        maxPrice={maxPrice}
        minRooms={minRooms}
        minArea={minArea}
        onSearchTextChange={onSearchTextChange}
        onMaxPriceChange={onMaxPriceChange}
        onMinRoomsChange={onMinRoomsChange}
        onMinAreaChange={onMinAreaChange}
        onManualSearch={onManualSearch}
      />
    </aside>
  );
};

export default FiltersSidebar;