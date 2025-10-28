import React from "react";
import type { Property } from "../../types/property";

interface ScoreIndicatorProps {
  property: Property;
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({ property }) => {
  if (!property.totalScore) return null;
  
  const maxScore = 3;
  
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Match Score</span>
        <span className="text-sm font-bold text-green-600">
          {Math.round(property.totalScore * 100) / 100}
        </span>
      </div>
      
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min((property.totalScore / maxScore) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreIndicator;