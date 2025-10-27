import React from "react";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import { useFavourites } from "../context/FavouriteContext";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;

const FavouritesSection: React.FC = () => {
  const { favouriteProperties, loading } = useFavourites();
  const { isLoggedIn } = useAuth();

  console.log('📚 FavouritesSection State:', {
    isLoggedIn,
    favouritePropertiesCount: favouriteProperties.length,
    loading,
    favouriteProperties: favouriteProperties.map(p => p.id)
  });

  const [page, setPage] = React.useState(1);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(favouriteProperties.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = favouriteProperties.slice(start, start + PAGE_SIZE);

  console.log('📄 FavouritesSection Pagination:', {
    page,
    pageCount,
    currentCount: current.length
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Your Favourite Properties</h1>

      {loading && <div className="text-gray-600">Loading…</div>}
      {!loading && current.length === 0 && (
        <div className="text-muted-foreground">
          {isLoggedIn ? "No favourite properties yet." : "Please log in to view your favourites."}
        </div>
      )}

      <div className="space-y-4">
        {current.map((p) => (
          <PropertyCard 
            key={p.id} 
            property={p} 
            isInitiallyFavourite={true}
          />
        ))}
      </div>

      {pageCount > 1 && (
        <Pager page={page} pageCount={pageCount} onPageChange={setPage} />
      )}
    </div>
  );
};

export default FavouritesSection;