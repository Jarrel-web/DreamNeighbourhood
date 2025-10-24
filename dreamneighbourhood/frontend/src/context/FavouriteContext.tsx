import React, { createContext, useContext, useEffect, useState } from "react";
import { getAllFavourites, addFavourite, removeFavourite, getFavouriteProperties } from "../services/favouriteServices";
import { useAuth } from "./AuthContext";
import type { Property } from "../types/property";

interface FavouritesContextType {
  favourites: number[]; // Changed to array of property IDs
  favouriteProperties: Property[]; // Added for full property objects
  isFavourite: (propertyId: number) => boolean;
  toggleFavourite: (property: Property) => Promise<void>;
  loading: boolean;
}

const FavouritesContext = createContext<FavouritesContextType>({
  favourites: [],
  favouriteProperties: [],
  isFavourite: () => false,
  toggleFavourite: async () => {},
  loading: false,
});

export const FavouritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { username, isLoggedIn } = useAuth();
  const [favourites, setFavourites] = useState<number[]>([]); // Array of property IDs
  const [favouriteProperties, setFavouriteProperties] = useState<Property[]>([]); // Full property objects
  const [loading, setLoading] = useState(false);

  // Fetch favourited properties
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!username || !isLoggedIn) {
        setFavourites([]);
        setFavouriteProperties([]);
        return;
      }
      try {
        setLoading(true);
        
        // Get favourite IDs
        const favouriteData = await getAllFavourites();
        const favouriteIds = favouriteData.map((fav) => fav.property_id);
        setFavourites(favouriteIds);

        // Get full property details if we have favourites
        if (favouriteIds.length > 0) {
          const propertiesData = await getFavouriteProperties();
          setFavouriteProperties(propertiesData);
        } else {
          setFavouriteProperties([]);
        }
      } catch (err) {
        console.error("Failed to fetch favourites:", err);
        setFavourites([]);
        setFavouriteProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [username, isLoggedIn]);

  const isFavourite = (propertyId: number) => favourites.includes(propertyId);

  const toggleFavourite = async (property: Property) => {
    try {
      if (isFavourite(property.id)) {
        await removeFavourite(property.id);
        setFavourites((prev) => prev.filter((id) => id !== property.id));
        setFavouriteProperties((prev) => prev.filter((p) => p.id !== property.id));
      } else {
        await addFavourite(property.id);
        setFavourites((prev) => [...prev, property.id]);
        setFavouriteProperties((prev) => [...prev, property]);
      }
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  return (
    <FavouritesContext.Provider value={{ 
      favourites, 
      favouriteProperties, 
      isFavourite, 
      toggleFavourite,
      loading 
    }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => useContext(FavouritesContext);