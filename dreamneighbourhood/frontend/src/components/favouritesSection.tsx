import React from "react";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import type { Property } from "../types/property";
import { useFavourites } from "../context/FavouriteContext";
import { useAuth } from "../context/AuthContext";
import { getFavouriteProperties } from "@/services/favouriteServices";

const PAGE_SIZE = 10;

const FavouritesSection: React.FC = () => {
  const { favourites } = useFavourites();
  const { isLoggedIn } = useAuth();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  // Fetch favourited properties when user or favourites change
  React.useEffect(() => {
    const fetchFavourites = async () => {
      if (!isLoggedIn || favourites.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use the service to get favourite properties with full details
        const favouriteProperties = await getFavouriteProperties();
        
        // All properties returned are favourited, so mark them as such
        const propsWithFav: Property[] = favouriteProperties.map((p: Property) => ({
          ...p,
          isInitiallyFavourite: true,
        }));

        setProperties(propsWithFav);
        setPage(1);
      } catch (err: any) {
        setError(err.message || "Failed to load favourited properties.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [favourites, isLoggedIn]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(properties.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = properties.slice(start, start + PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Your Favourite Properties</h1>

      {loading && <div className="text-gray-600">Loading…</div>}
      {error && <div className="text-amber-600">{error}</div>}
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