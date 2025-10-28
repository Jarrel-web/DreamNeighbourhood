import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { AMENITY_TYPES } from "./constants";
import type { AmenityType, RankedAmenity } from "./types";

interface AmenityRankingProps {
  selectedTown: string;
  rankedAmenities: RankedAmenity[];
  availableAmenities: AmenityType[];
  onAddAmenity: (type: AmenityType) => void;
  onRemoveAmenity: (type: AmenityType) => void;
  onUpdateDistance: (type: AmenityType, distance: number) => void;
}

const AmenityRanking: React.FC<AmenityRankingProps> = ({
  selectedTown,
  rankedAmenities,
  availableAmenities,
  onAddAmenity,
  onRemoveAmenity,
  onUpdateDistance,
}) => {
  const getAmenityInfo = (type: AmenityType) => 
    AMENITY_TYPES.find(a => a.id === type)!;

  return (
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
              <div key={amenity.type} className="p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {amenity.rank}
                    </span>
                    <span className="text-lg">{info.icon}</span>
                    <span className="font-medium">{info.label}</span>
                  </div>
                  <button
                    onClick={() => onRemoveAmenity(amenity.type)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Within</span>
                  <select
                    value={amenity.maxDistance}
                    onChange={(e) => onUpdateDistance(amenity.type, Number(e.target.value))}
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
                  onClick={() => onAddAmenity(amenityType)}
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
  );
};

export default AmenityRanking;