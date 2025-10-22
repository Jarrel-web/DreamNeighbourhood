import React from "react";
import { Link } from "react-router-dom";
import type { Property } from "../../types/property";
import stockImg from "../../assets/images/stock-photo.png";
import { Heart } from "lucide-react";
import { useFavourites } from "../../context/favouriteContext";
import { useAuth } from "../../context/AuthContext";

interface PropertyCardProps {
  property: Property;
  isInitiallyFavourite?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, isInitiallyFavourite = false }) => {
  const { username } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();

  const favouriteStatus = isInitiallyFavourite || isFavourite(property.id);

  const handleFavouriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!username) return;
    await toggleFavourite(property);
  };

  return (
    <Link
      to={`/property/${property.id}`}
      className="relative rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col md:flex-row gap-4 w-full max-w-full hover:shadow-md transition-shadow"
    >
      {/* Heart button on top-right of the card */}
      {username && (
        <button
          onClick={handleFavouriteClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:scale-110 transition-transform z-10"
        >
          <Heart
            className={`w-6 h-6 transition-colors duration-200 ${
              favouriteStatus ? "text-red-500" : "text-gray-400"
            }`}
            fill={favouriteStatus ? "currentColor" : "none"}
          />
        </button>
      )}

      {/* Image */}
      <div className="w-full md:w-48 flex-shrink-0">
        <img
          src={stockImg}
          alt="Property"
          className="w-full h-auto md:h-full object-cover rounded-lg"
        />
      </div>

      {/* Details */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">
            Blk {property.block} {property.street_name}, {property.town}
          </h3>
          <div className="mt-1 text-sm text-muted-foreground">
            {property.flat_type} • {property.floor_area_sqm} sqm • {property.storey_range} Floor
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span>Model: {property.flat_model}</span>
            <span>Lease: {property.remaining_lease}</span>
            <span>Postal Code: {property.postal_code}</span>
          </div>
        </div>

        <div className="mt-4 md:mt-0 self-start md:self-end text-right">
          <div className="text-xl sm:text-2xl font-bold">
            SGD {property.resale_price.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">{property.flat_type}</div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
