import React from "react";

interface RankingBadgeProps {
  rank: number;
}

const RankingBadge: React.FC<RankingBadgeProps> = ({ rank }) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg";
    if (rank <= 3) return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md";
    if (rank <= 10) return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
    return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700";
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${getRankColor(rank)} w-10 h-10 rounded-full flex flex-col items-center justify-center text-sm font-bold shadow-sm`}>
        <span className="text-xs leading-3">#{rank}</span>
      </div>
    </div>
  );
};

export default RankingBadge;