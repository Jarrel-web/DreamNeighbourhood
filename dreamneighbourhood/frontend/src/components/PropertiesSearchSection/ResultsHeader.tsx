import React from "react";
import { MapPin } from "lucide-react";
import { AMENITY_TYPES } from "./constants";
import type { RankedAmenity } from "./types";
import type { Property } from "../../types/property";

interface ResultsHeaderProps {
  rankedAmenities: RankedAmenity[];
  currentPageData: Property[];
  loading: boolean;
  totalResults: number;
  error: string | null;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  rankedAmenities,
  currentPageData,
  loading,
  totalResults,
  error,
}) => {
  const getAmenityInfo = (type: string) => 
    AMENITY_TYPES.find(a => a.id === type)!;

  return (
    <>
      {/* Enhanced Header with Ranking Info */}
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

      {/* Active Ranking Banner - Only show when we have ranked results */}
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
              const info = getAmenityInfo(amenity.type);
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
    </>
  );
};

export default ResultsHeader;