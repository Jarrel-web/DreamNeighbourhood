import React from "react";
import PropertyCard from "../ui/property-card";
import RankingBadge from "./RankingBadge";
import ScoreIndicator from "./ScoreIndicator";
import type { Property } from "../../types/property";

interface EnhancedPropertyCardProps {
  property: Property;
  rank: number;
  rankedAmenitiesLength: number;
}

const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({ 
  property, 
  rank, 
  rankedAmenitiesLength 
}) => {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300">
      {/* Ranking Badge - Only show when we have ranked amenities and totalScore */}
      {rankedAmenitiesLength > 0 && property.totalScore && (
        <div className="absolute -top-3 -left-3 z-10">
          <RankingBadge rank={rank} />
        </div>
      )}
      
      <div className="p-6">
        <PropertyCard
          property={property}
          isInitiallyFavourite={property.isInitiallyFavourite}
        />
        
        {/* Score Indicator - Only show when we have ranked amenities */}
        {rankedAmenitiesLength > 0 && property.totalScore && (
          <ScoreIndicator property={property} />
        )}
      </div>
    </div>
  );
};

export default EnhancedPropertyCard;