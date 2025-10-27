import { apiRequest } from './apiClient';
import type { Property } from '../types/property';

export type PropertiesResponse = {
  results: Property[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

export type RankedAmenity = {
  type: string;
  rank: number;
};

export type SearchParams = {
  searchText?: string;
  town?: string;
  maxPrice?: number;
  minRooms?: number;
  minArea?: number;
  amenitiesRanking?: RankedAmenity[]; // Add this line
  page: number;
  pageSize: number;
};

// Get default properties with pagination
export async function getDefaultProperties(page: number = 1, pageSize: number = 10): Promise<PropertiesResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("pageSize", String(pageSize));
  
  return apiRequest<PropertiesResponse>(`/properties/default?${queryParams.toString()}`);
}

// Search properties with filters and pagination
export async function searchProperties(params: SearchParams): Promise<PropertiesResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.searchText) queryParams.append("searchText", params.searchText);
  if (params.town) queryParams.append("town", params.town);
  if (params.maxPrice) queryParams.append("maxPrice", String(params.maxPrice));
  if (params.minRooms) queryParams.append("minRooms", String(params.minRooms));
  if (params.minArea) queryParams.append("minArea", String(params.minArea));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.pageSize) queryParams.append("pageSize", String(params.pageSize));

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/properties/search?${queryString}` : "/properties/default";
  
  return apiRequest<PropertiesResponse>(endpoint);
}

// Get property by ID
export async function getPropertyById(id: string): Promise<Property> {
  return apiRequest<Property>(`/properties/${id}`);
}

// Get similar properties
export async function getSimilarProperties(propertyId: string, limit: number = 4): Promise<Property[]> {
  const data = await apiRequest<PropertiesResponse>(`/properties/similar/${propertyId}?limit=${limit}`);
  return data.results || [];
}