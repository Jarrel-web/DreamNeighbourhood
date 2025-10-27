// favouriteServices.ts - Alternative version with better debugging
import { apiRequest } from './apiClient';
import { authHeader } from './tokenService';
import type { Property } from '../types/property';

export type FavouriteResponse = {
  favourites: Property[];
  message?: string;
};

// Get full property details for favourite properties
export async function getFavouriteProperties(): Promise<Property[]> {
  try {
    console.log('🔍 [getFavouriteProperties] Making API call to /favourites/');
    const data = await apiRequest<FavouriteResponse>("/favourites", { // Remove trailing slash
      headers: {
        ...authHeader(),
        cache: "no-store",
      },
    });
    console.log('✅ [getFavouriteProperties] Full API response:', data);
    console.log('📋 [getFavouriteProperties] Favourites array:', data.favourites);
    return data.favourites || [];
  } catch (error) {
    console.error('❌ [getFavouriteProperties] API Error:', error);
    throw error;
  }
}

// Add property to favourites
export async function addFavourite(propertyId: number): Promise<{ message: string }> {
  try {
    console.log('🔍 [addFavourite] Adding property:', propertyId);
    const response = await apiRequest<{ message: string }>("/favourites/add", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    console.log('✅ [addFavourite] Success:', response);
    return response;
  } catch (error) {
    console.error('❌ [addFavourite] Error:', error);
    throw error;
  }
}

// Remove property from favourites
export async function removeFavourite(propertyId: number): Promise<{ message: string }> {
  try {
    console.log('🔍 [removeFavourite] Removing property:', propertyId);
    const response = await apiRequest<{ message: string }>(`/favourites/${propertyId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    console.log('✅ [removeFavourite] Success:', response);
    return response;
  } catch (error) {
    console.error('❌ [removeFavourite] Error:', error);
    throw error;
  }
}