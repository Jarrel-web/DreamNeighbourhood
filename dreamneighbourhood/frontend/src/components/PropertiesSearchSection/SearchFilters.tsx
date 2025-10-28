import React from "react";
import Chip from "../ui/chip";

interface SearchFiltersProps {
  searchText: string;
  maxPrice: number | null;
  minRooms: number | null;
  minArea: number | null;
  onSearchTextChange: (text: string) => void;
  onMaxPriceChange: (price: number | null) => void;
  onMinRoomsChange: (rooms: number | null) => void;
  onMinAreaChange: (area: number | null) => void;
  onManualSearch: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchText,
  maxPrice,
  minRooms,
  minArea,
  onSearchTextChange,
  onMaxPriceChange,
  onMinRoomsChange,
  onMinAreaChange,
  onManualSearch,
}) => {
  return (
    <div className="border-t pt-4">
      <h3 className="font-semibold mb-3 text-gray-700">Additional Filters</h3>
      
      {/* Search Text Filter */}
      <div className="mb-4">
        <label className="text-sm font-medium">Search Address</label>
        <input
          type="text"
          placeholder="Search by address or building name"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onManualSearch()}
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
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
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
              onClick={() => onMinRoomsChange(minRooms === n ? null : n)}
            >
              {n}+
            </Chip>
          ))}
          <Chip active={minRooms === null} onClick={() => onMinRoomsChange(null)}>
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
          onChange={(e) => onMinAreaChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-muted-foreground">≥ {minArea || 40} sqm</div>
      </div>
    </div>
  );
};

export default SearchFilters;