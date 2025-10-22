import React, { useEffect, useState } from "react";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import { useFavourites } from "../context/favouriteContext";

const PAGE_SIZE = 10;

const FavouritesPage: React.FC = () => {
  const { favourites } = useFavourites(); // array of Property objects
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(favourites.length / PAGE_SIZE));

  // ✅ Adjust page if it exceeds new page count
  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [favourites.length, pageCount]);

  const start = (page - 1) * PAGE_SIZE;
  const current = favourites.slice(start, start + PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
        Favourites
      </h1>

      {favourites.length === 0 ? (
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
