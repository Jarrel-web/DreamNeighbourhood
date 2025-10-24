import React, { useEffect, useState } from "react";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import { useFavourites } from "../context/FavouriteContext";

const PAGE_SIZE = 10;

const FavouritesPage: React.FC = () => {
  const { favouriteProperties, loading } = useFavourites(); // Use favouriteProperties instead of favourites
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(favouriteProperties.length / PAGE_SIZE));

  
  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [favouriteProperties.length, pageCount]);

  const start = (page - 1) * PAGE_SIZE;
  const current = favouriteProperties.slice(start, start + PAGE_SIZE);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
          Favourites
        </h1>
        <div className="bg-card p-6 sm:p-8 rounded-lg shadow-sm border text-muted-foreground text-sm sm:text-base">
          Loading your favourites...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
        Favourites
      </h1>

      {favouriteProperties.length === 0 ? (
        <div className="bg-card p-6 sm:p-8 rounded-lg shadow-sm border text-muted-foreground text-sm sm:text-base">
          You have no favourite properties yet.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {current.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isInitiallyFavourite={true} // always true here
              />
            ))}
          </div>

          <Pager page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default FavouritesPage;