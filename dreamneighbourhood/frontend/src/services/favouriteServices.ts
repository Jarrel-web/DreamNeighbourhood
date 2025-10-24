import { apiRequest } from './apiClient';
import { authHeader } from './tokenService';
import type { Property } from '../types/property';

export type Favourite = {
  id: number;
  property_id: number;
  user_id: string;
  created_at: string;
};

export type FavouriteResponse = {
  favourites: Favourite[];
};

export type PropertiesResponse = {
  results: Property[];
};

export type FavouriteStatus = {
  isFavourite: boolean;
};

// Get favourite IDs for the current user
export async function getAllFavourites(): Promise<Favourite[]> {
  const data = await apiRequest<FavouriteResponse>("/favourites", {
    headers: {
      ...authHeader(),
      cache: "no-store",
    },
  });
  return data.favourites;
}

// Get full property details for favourite properties
export async function getFavouriteProperties(): Promise<Property[]> {
  const data = await apiRequest<PropertiesResponse>("/favourites/properties", {
    headers: {
      ...authHeader(),
      cache: "no-store",
    },
  });
  return data.results || [];
}

// Add property to favourites
export async function addFavourite(propertyId: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/favourites/add", {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ propertyId }),
  });
}

// Remove property from favourites
export async function removeFavourite(propertyId: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/favourites/${propertyId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
}