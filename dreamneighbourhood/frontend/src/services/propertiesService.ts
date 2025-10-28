import { apiRequest } from './apiClient';
import type { Property } from '../types/property';

export type PropertiesResponse = {
  results: Property[];
};

export type RankedAmenity = {
  type: string;
  rank: number;
  maxDistance?: number;
};

export type SearchParams = {
  town?: string;
  amenitiesRanking?: RankedAmenity[];
};

// Default properties (GET) - returns all properties
export async function getDefaultProperties(): Promise<PropertiesResponse> {
  return apiRequest<PropertiesResponse>('/properties/default');
}

// Search properties with amenities ranking only - returns all matching properties
export async function searchProperties(params: SearchParams): Promise<PropertiesResponse> {
  const queryParams = new URLSearchParams();
  if (params.town) queryParams.append("town", params.town);

  const body = {
    rankings: params.amenitiesRanking?.map(a => ({
      amenityTheme: a.type,
      rank: a.rank,
      maxDistance: a.maxDistance,
    })) || [],
  };

  return apiRequest<PropertiesResponse>(
    `/search/rank-properties?${queryParams.toString()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

// Get property by ID
export async function getPropertyById(id: string): Promise<Property> {
  return apiRequest<Property>(`/properties/${id}`);
}