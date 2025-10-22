import React, { createContext, useContext, useEffect, useState } from "react";
import { getAllFavourites, addFavourite, removeFavourite } from "../services/favourites";
import { useAuth } from "./AuthContext";
import type { Property } from "../types/property";

interface FavouritesContextType {
  favourites: Property[];
  isFavourite: (propertyId: number) => boolean;
  toggleFavourite: (property: Property) => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextType>({
  favourites: [],
  isFavourite: () => false,
  toggleFavourite: async () => {},
});

export const FavouritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { username, isLoggedIn } = useAuth();
  const [favourites, setFavourites] = useState<Property[]>([]);

  // Fetch favourited properties
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!username || !isLoggedIn) {
        setFavourites([]);
        return;
      }
      try {
        const data = await getAllFavourites(); // assume full property objects returned
        setFavourites(data || []);
      } catch (err) {
        console.error("Failed to fetch favourites:", err);
      }
    };

    fetchFavourites();
  }, [username, isLoggedIn]);

  const isFavourite = (propertyId: number) => favourites.some((p) => p.id === propertyId);

  const toggleFavourite = async (property: Property) => {
    try {
      if (isFavourite(property.id)) {
        await removeFavourite(property.id);
        setFavourites((prev) => prev.filter((p) => p.id !== property.id));
      } else {
        await addFavourite(property.id);
        setFavourites((prev) => [...prev, property]);
      }
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  return (
    <FavouritesContext.Provider value={{ favourites, isFavourite, toggleFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => useContext(FavouritesContext);
