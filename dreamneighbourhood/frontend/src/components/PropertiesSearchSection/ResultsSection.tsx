import React from "react";
import { X, MapPin } from "lucide-react";
import Pager from "../ui/pager";
import EnhancedPropertyCard from "./EnhancedPropertyCard";
import { AMENITY_TYPES } from "./constants";
import type { Property } from "../../types/property";
import type { RankedAmenity } from "./types";
import { PAGE_SIZE } from "./constants";
interface ResultsSectionProps {
  rankedAmenities: RankedAmenity[];
  currentPageData: Property[];
  loading: boolean;
  totalResults: number;
  error: string | null;
  isSearchReady: boolean;
  hasActiveFilters: boolean;
  hasSearchCriteria: boolean;
  page: number;
  totalPages: number;
  onClearAllFilters: () => void;
  onResetToInitialResults: () => void;
  onPageChange: (page: number) => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  rankedAmenities,
  currentPageData,
  loading,
  totalResults,
  error,
  isSearchReady,
  hasActiveFilters,
  hasSearchCriteria,
  page,
  totalPages,
  onClearAllFilters,
  onResetToInitialResults,
  onPageChange,
}) => {
  return (
    <section>
      {/* Results Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="font-semibold text-lg mb-1">Search Results</h2>
          {rankedAmenities.length > 0 && currentPageData[0]?.totalScore && (
            <p className="text-sm text-green-600 font-medium">
              ✅ Properties ranked by your priority amenities
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${totalResults.toLocaleString()} matches`}
          {error && <span className="ml-2 text-amber-600">{error}</span>}
        </div>
      </div>

      {/* Active Ranking Banner */}
      {rankedAmenities.length > 0 && currentPageData[0]?.totalScore && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 text-white p-2 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Smart Ranking Active</h3>
                <p className="text-sm text-green-700">
                  Properties sorted by proximity to your priority amenities
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                #{1} Score: {Math.round(currentPageData[0].totalScore * 100) / 100}
              </div>
              <div className="text-xs text-green-600">Best match score</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {rankedAmenities.map((amenity, index) => {
              const info = AMENITY_TYPES.find(a => a.id === amenity.type)!;
              return (
                <div key={amenity.type} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border shadow-sm">
                  <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-lg">{info.icon}</span>
                  <span className="font-medium text-sm">{info.label}</span>
                  <span className="text-xs text-gray-500">within {amenity.maxDistance}m</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
      {(hasActiveFilters || hasSearchCriteria) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              Showing {hasSearchCriteria ? 'searched' : 'filtered'} results
              {rankedAmenities.length > 0 && (
                <span className="ml-2 text-purple-600">
                  • Prioritizing {rankedAmenities.length} amenities
                </span>
              )}
            </span>
            <button
              onClick={hasActiveFilters ? onClearAllFilters : onResetToInitialResults}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              {hasActiveFilters ? 'Clear Filters' : 'Reset All'}
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Results List */}
      <div className="space-y-6">
        {currentPageData.map((property, index) => (
          <EnhancedPropertyCard
            key={`${property.id}-${index}`}
            property={property}
            rank={index + 1 + (page - 1) * PAGE_SIZE}
            rankedAmenitiesLength={rankedAmenities.length}
          />
        ))}
        {!loading && currentPageData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-lg mb-2">No properties found</div>
            <div className="text-sm mb-4">
              {hasActiveFilters || hasSearchCriteria
                ? "Try adjusting your filters or search terms" 
                : "Try searching with different criteria"
              }
            </div>
            {(hasActiveFilters || hasSearchCriteria) && (
              <button
                onClick={hasActiveFilters ? onClearAllFilters : onResetToInitialResults}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {hasActiveFilters ? 'Clear Filters' : 'Reset All'}
              </button>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pager page={page} pageCount={totalPages} onPageChange={onPageChange} />
      )}
    </section>
  );
};

export default ResultsSection;