import React from "react";
import PropertyCard from "../components/ui/property-card";
import Pager from "../components/ui/pager";
import type { Property } from "../types/property";
import { useFavourites } from "../context/favouriteContext";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;
const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

        // Fetch details for favourited properties
        const res = await fetch(`${API_BASE}/favourites/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyIds: favourites }),
        });

        if (!res.ok) throw new Error(`Server responded with ${res.status}`);

        const data = await res.json();
        // Map to include isInitiallyFavourite
        const propsWithFav: Property[] = (data.results || []).map((p: Property) => ({
          ...p,
          isInitiallyFavourite: true, // all are favourited
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

      {loading && <div>Loading…</div>}
      {error && <div className="text-amber-600">{error}</div>}
      {!loading && current.length === 0 && <div>No favourite properties yet.</div>}

      <div className="space-y-4">
        {current.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {pageCount > 1 && (
        <Pager page={page} pageCount={pageCount} onPageChange={setPage} />
      )}
    </div>
  );
};

export default FavouritesSection;
