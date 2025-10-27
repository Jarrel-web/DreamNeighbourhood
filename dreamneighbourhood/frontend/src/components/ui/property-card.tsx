import React from "react";
import { Link } from "react-router-dom";
import type { Property } from "../../types/property";
import stockImg from "../../assets/images/stock-photo.png";
import { Heart } from "lucide-react";
import { useFavourites } from "../../context/FavouriteContext";
import { useAuth } from "../../context/AuthContext";

interface PropertyCardProps {
  property: Property;
  isInitiallyFavourite?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, isInitiallyFavourite = false }) => {
  const { isLoggedIn, isVerified, username } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();

  console.log('🔍 PropertyCard Render:', {
    propertyId: property.id,
    isLoggedIn,
    isVerified,
    username,
    isInitiallyFavourite,
    isFavouriteResult: isFavourite(property.id)
  });

  const favouriteStatus = isInitiallyFavourite || isFavourite(property.id);
  const canToggleFavourite = isLoggedIn && isVerified;

  console.log('💖 PropertyCard Favourite State:', {
    propertyId: property.id,
    favouriteStatus,
    canToggleFavourite
  });

  const handleFavouriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('🖱️ Favourite Button Clicked:', {
      propertyId: property.id,
      canToggleFavourite,
      isLoggedIn,
      isVerified
    });
    
    if (!canToggleFavourite) {
      console.log('❌ Favourite toggle blocked - user not verified or not logged in');
      return;
    }
    
    try {
      console.log('✅ Toggling favourite for property:', property.id);
      await toggleFavourite(property);
      console.log('✅ Favourite toggle completed for property:', property.id);
    } catch (error) {
      console.error('❌ Favourite toggle failed:', error);
    }
  };

  const getTooltipText = () => {
    if (!isLoggedIn) return "Please log in to add favourites";
    if (!isVerified) return "Please verify your account to add favourites";
    return favouriteStatus ? "Remove from favourites" : "Add to favourites";
  };

  return (
    <Link
      to={`/property/${property.id}`}
      className="relative rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col md:flex-row gap-4 w-full max-w-full hover:shadow-md transition-shadow"
    >
      {/* Heart button - ALWAYS VISIBLE */}
      <button
        onClick={handleFavouriteClick}
        disabled={!canToggleFavourite}
        className={`absolute top-2 right-2 p-2 rounded-full shadow transition-transform z-10 ${
          canToggleFavourite 
            ? "bg-white hover:bg-gray-50 cursor-pointer hover:scale-110" 
            : "bg-gray-100 cursor-not-allowed"
        }`}
        title={getTooltipText()}
      >
        <Heart
          className={`w-6 h-6 transition-colors duration-200 ${
            favouriteStatus 
              ? "text-red-500" 
              : canToggleFavourite 
                ? "text-gray-400 hover:text-gray-600" 
                : "text-gray-300"
          }`}
          fill={favouriteStatus ? "currentColor" : "none"}
        />
      </button>

      {/* Rest of your component */}
      <div className="w-full md:w-48 flex-shrink-0">
        <img
          src={stockImg}
          alt="Property"
          className="w-full h-auto md:h-full object-cover rounded-lg"
        />
      </div>

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