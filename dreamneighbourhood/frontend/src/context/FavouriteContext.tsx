import React, { createContext, useContext, useEffect, useState } from "react";
import { getFavouriteProperties, addFavourite, removeFavourite } from "../services/favouriteServices";
import { useAuth } from "./AuthContext";
import type { Property } from "../types/property";

interface FavouritesContextType {
  favourites: number[];
  favouriteProperties: Property[];
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
  const { isLoggedIn, isVerified } = useAuth(); // Need both!
  const [favourites, setFavourites] = useState<number[]>([]);
  const [favouriteProperties, setFavouriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  console.log('🔍 FavouritesContext State:', {
    isLoggedIn,
    isVerified,
    favouritesCount: favourites.length,
    favouritePropertiesCount: favouriteProperties.length,
    loading
  });

  // Fetch favourited properties
  useEffect(() => {
    console.log('🔄 FavouritesContext useEffect triggered:', {
      isLoggedIn,
      isVerified
    });

    const fetchFavourites = async () => {
      // User must be BOTH logged in AND verified to access favourites
      if (!isLoggedIn || !isVerified) {
        console.log('🚫 User not logged in or not verified - clearing favourites');
        setFavourites([]);
        setFavouriteProperties([]);
        setLoading(false);
        return;
      }

      try {
        console.log('📡 Fetching favourites for verified user');
        setLoading(true);
        
        const propertiesData = await getFavouriteProperties();
        console.log('✅ Got favourite properties:', propertiesData);
        
        const favouriteIds = propertiesData.map((property: Property) => property.id);
        console.log('📋 Extracted Favourite IDs:', favouriteIds);
        
        setFavourites(favouriteIds);
        setFavouriteProperties(propertiesData);
        
      } catch (err) {
        console.error('❌ Failed to fetch favourites:', err);
        setFavourites([]);
        setFavouriteProperties([]);
      } finally {
        console.log('🏁 Favourites fetch completed');
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [isLoggedIn, isVerified]); // Depend on both!

  const isFavourite = (propertyId: number) => {
    return favourites.includes(propertyId);
  };

  const toggleFavourite = async (property: Property) => {
    // Extra safety check - user must be verified to toggle favourites
    if (!isLoggedIn || !isVerified) {
      console.log('❌ Cannot toggle favourite - user not verified');
      return;
    }

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
      console.error('❌ Failed to toggle favourite:', err);
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